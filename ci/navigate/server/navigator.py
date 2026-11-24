"""Chromium navigation with Cloudflare challenge handling.

One long-lived Chrome process (persistent profile) is reused for every
request; a lock serialises navigations so cookies such as `cf_clearance`
survive between calls. Challenge handling mirrors the approach validated in
this repository: wait for the fingerprint to auto-pass, then fall back to a
single CDP coordinate click on the Turnstile widget.
"""

from __future__ import annotations

import os
import re
import subprocess
import threading
import time
from dataclasses import dataclass, field
from typing import Optional

import undetected_chromedriver as uc
from selenium.common.exceptions import TimeoutException, WebDriverException

from . import har as har_module


def _env_int(name, default):
    try:
        return int(os.environ.get(name, "") or default)
    except ValueError:
        return default


def _env_bool(name, default):
    value = os.environ.get(name)
    if value is None or value == "":
        return default
    return value.lower() in ("1", "true", "yes", "on")


CHROME_BIN = os.environ.get("CHROME_BIN", "/usr/bin/chromium")
CHROMEDRIVER_BIN = os.environ.get("CHROMEDRIVER_BIN", "/usr/bin/chromedriver")
PROFILE_DIR = os.environ.get("PROFILE_DIR", "/data/profile")

HEADLESS = _env_bool("HEADLESS", False)
NO_SANDBOX = _env_bool("NO_SANDBOX", True)
ENABLE_CLICK = _env_bool("ENABLE_CLICK", True)
MAX_CLICKS = _env_int("MAX_CLICKS", 2)
PAGE_LOAD_TIMEOUT_S = _env_int("PAGE_LOAD_TIMEOUT_S", 25)
SETTLE_TIMEOUT_MS = _env_int("SETTLE_TIMEOUT_MS", 20000)
MAX_SOURCE_BYTES = _env_int("MAX_SOURCE_BYTES", 24 * 1024 * 1024)
HAR_MAX_BYTES = _env_int("HAR_MAX_BYTES", 8 * 1024 * 1024)
HAR_MAX_ENTRIES = _env_int("HAR_MAX_ENTRIES", 400)

_CHALLENGE_TITLES = (
    "just a moment",
    "attention required",
    "security verification",
    "verifying you are human",
    "请稍候",
)
_CHALLENGE_SELECTOR = (
    'iframe[src*="challenges.cloudflare.com"],#challenge-form,'
    "#challenge-running,#cf-please-wait,#challenge-stage"
)


class NavigationError(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code
        self.message = message


@dataclass
class NavigationResult:
    final_url: str
    title: str
    status: Optional[int]
    source: str
    cookies: list = field(default_factory=list)
    headers: dict = field(default_factory=dict)
    har: Optional[dict] = None
    challenge_detected: bool = False
    challenge_passed: bool = True
    clicks: int = 0
    navigation_ms: int = 0


class Navigator:
    def __init__(self):
        self._lock = threading.Lock()
        self._driver = None

    # -- browser lifecycle -------------------------------------------------

    def _major_version(self):
        try:
            output = subprocess.run(
                [CHROME_BIN, "--version"],
                capture_output=True,
                text=True,
                timeout=10,
            ).stdout
        except (OSError, subprocess.SubprocessError):
            return None
        match = re.search(r"(\d+)\.", output)
        return int(match.group(1)) if match else None

    def _clean_stale_profile(self):
        for name in ("SingletonLock", "SingletonSocket", "SingletonCookie"):
            try:
                os.unlink(os.path.join(PROFILE_DIR, name))
            except OSError:
                pass

    def _start(self):
        if not os.path.exists(CHROME_BIN):
            raise NavigationError("DRIVER_UNAVAILABLE", "Chrome binary not found: " + CHROME_BIN)
        if not os.path.exists(CHROMEDRIVER_BIN):
            raise NavigationError(
                "DRIVER_UNAVAILABLE", "chromedriver not found: " + CHROMEDRIVER_BIN
            )
        os.makedirs(PROFILE_DIR, exist_ok=True)
        self._clean_stale_profile()

        options = uc.ChromeOptions()
        for argument in (
            "--disable-dev-shm-usage",
            "--disable-extensions",
            "--disable-background-networking",
            "--no-first-run",
            "--no-default-browser-check",
            "--window-size=1440,900",
            "--lang=en-US",
            # Cloudflare's managed challenge aborts when WebGL is missing.
            # --disable-gpu used to kill it outright; keep software rasteriser.
            "--enable-unsafe-swiftshader",
            "--ignore-gpu-blocklist",
        ):
            options.add_argument(argument)
        if NO_SANDBOX:
            options.add_argument("--no-sandbox")
        options.set_capability("goog:loggingPrefs", {"performance": "ALL"})

        try:
            self._driver = uc.Chrome(
                options=options,
                user_data_dir=PROFILE_DIR,
                browser_executable_path=CHROME_BIN,
                driver_executable_path=CHROMEDRIVER_BIN,
                version_main=self._major_version(),
                headless=HEADLESS,
                use_subprocess=True,
            )
            self._driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT_S)
            try:
                self._driver.execute_cdp_cmd("Network.enable", {})
            except WebDriverException:
                pass
        except Exception as error:  # uc raises a wide mix of driver errors
            self._driver = None
            raise NavigationError("DRIVER_UNAVAILABLE", str(error)[:300]) from error

    def _ensure(self):
        if self._driver is not None:
            try:
                self._driver.window_handles
                return self._driver
            except WebDriverException:
                self._reset()
        self._start()
        return self._driver

    def _reset(self):
        driver, self._driver = self._driver, None
        if driver is not None:
            try:
                driver.quit()
            except Exception:
                pass

    def warmup(self):
        with self._lock:
            self._ensure()

    def close(self):
        with self._lock:
            self._reset()

    # -- challenge handling ------------------------------------------------

    @staticmethod
    def _challenged(driver):
        try:
            title = (driver.title or "").lower()
        except WebDriverException:
            title = ""
        if any(marker in title for marker in _CHALLENGE_TITLES):
            return True
        try:
            return bool(
                driver.execute_script(
                    "return !!document.querySelector(%r);" % _CHALLENGE_SELECTOR
                )
            )
        except WebDriverException:
            return False

    @staticmethod
    def _ready(driver):
        try:
            return driver.execute_script("return document.readyState") == "complete"
        except WebDriverException:
            return False

    @staticmethod
    def _widget_rect(driver):
        try:
            return driver.execute_script(
                """
                var frame = document.querySelector('iframe[src*="challenges.cloudflare.com"]');
                if (!frame) return null;
                var rect = frame.getBoundingClientRect();
                if (!rect.width || !rect.height) return null;
                return {x: rect.x, y: rect.y, w: rect.width, h: rect.height};
                """
            )
        except WebDriverException:
            return None

    @staticmethod
    def _click(driver, rect):
        x = int(rect["x"] + 16)
        y = int(rect["y"] + rect["h"] / 2)
        for event_type in ("mouseMoved", "mousePressed", "mouseReleased"):
            driver.execute_cdp_cmd(
                "Input.dispatchMouseEvent",
                {
                    "type": event_type,
                    "x": x,
                    "y": y,
                    "button": "left",
                    "clickCount": 1,
                },
            )

    def _settle(self, driver, deadline):
        challenge_detected = self._challenged(driver)
        clicks = 0
        while time.monotonic() < deadline:
            if self._challenged(driver):
                challenge_detected = True
                if ENABLE_CLICK and clicks < MAX_CLICKS:
                    rect = self._widget_rect(driver)
                    if rect:
                        try:
                            self._click(driver, rect)
                            clicks += 1
                        except WebDriverException:
                            pass
                        time.sleep(1.0)
                        continue
            elif self._ready(driver):
                # Give a just-replaced document a moment before declaring success.
                time.sleep(0.5)
                if not self._challenged(driver):
                    return challenge_detected, True, clicks
            time.sleep(1.0)
        passed = not self._challenged(driver)
        return challenge_detected, passed, clicks

    # -- public API --------------------------------------------------------

    def navigate(self, url, timeout_ms=90000, capture_har=False):
        deadline = time.monotonic() + min(timeout_ms, 110000) / 1000
        with self._lock:
            driver = self._ensure()
            try:
                return self._navigate(driver, url, deadline, capture_har)
            except WebDriverException as error:
                message = str(error)
                if "invalid session" not in message and "disconnected" not in message:
                    raise NavigationError("NAVIGATION_FAILED", message[:300]) from error
                self._reset()
                driver = self._ensure()
                return self._navigate(driver, url, deadline, capture_har)

    def _navigate(self, driver, url, deadline, capture_har):
        started = time.monotonic()
        self._drain_logs(driver)
        try:
            driver.get(url)
        except TimeoutException:
            pass  # challenge pages never fire the load event
        except WebDriverException as error:
            message = str(error)
            if any(
                marker in message
                for marker in (
                    "ERR_NAME_NOT_RESOLVED",
                    "ERR_CONNECTION",
                    "ERR_SSL",
                    "ERR_ADDRESS",
                    "ERR_TIMED_OUT",
                )
            ):
                raise NavigationError("NAVIGATION_FAILED", message[:300]) from error
            # Chrome can throw after the document is already usable; continue.

        settle_deadline = min(deadline, time.monotonic() + SETTLE_TIMEOUT_MS / 1000)
        challenge_detected, challenge_passed, clicks = self._settle(
            driver, settle_deadline
        )

        try:
            final_url = driver.current_url
            title = driver.title or ""
            source = driver.page_source or ""
        except WebDriverException as error:
            raise NavigationError("NAVIGATION_FAILED", str(error)[:300]) from error

        encoded = source.encode("utf-8", "replace")
        if len(encoded) > MAX_SOURCE_BYTES:
            raise NavigationError(
                "SOURCE_TOO_LARGE",
                "page source exceeds %d bytes" % MAX_SOURCE_BYTES,
            )

        cookies = []
        try:
            cookies = driver.get_cookies()
        except WebDriverException:
            pass

        logs = self._read_logs(driver)
        main, har = har_module.parse(
            logs,
            final_url=final_url,
            max_entries=HAR_MAX_ENTRIES,
            max_bytes=HAR_MAX_BYTES if capture_har else None,
        )

        return NavigationResult(
            final_url=final_url,
            title=title,
            status=main["status"] if main else None,
            source=source,
            cookies=cookies,
            headers=main["headers"] if main else {},
            har=har if capture_har else None,
            challenge_detected=challenge_detected,
            challenge_passed=challenge_passed,
            clicks=clicks,
            navigation_ms=int((time.monotonic() - started) * 1000),
        )

    @staticmethod
    def _drain_logs(driver):
        try:
            driver.get_log("performance")
        except (WebDriverException, KeyError):
            pass

    @staticmethod
    def _read_logs(driver):
        try:
            return driver.get_log("performance")
        except (WebDriverException, KeyError):
            return []
