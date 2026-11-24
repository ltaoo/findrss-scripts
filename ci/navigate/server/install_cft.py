"""Install Chrome for Testing (linux64) over the Debian Chromium.

Cloudflare's managed challenge is far more likely to auto-pass with a real
Google Chrome build than with Debian's `chromium` package, so amd64 production
images opt in by setting CHROME_FOR_TESTING=1 at build time. Debian Chromium
stays the default because Chrome for Testing has no linux-arm64 build.

Usage (build-time only, runs as root):
    CHROME_FOR_TESTING=1 python install_cft.py [PREFIX]
    CHROME_FOR_TESTING=1 python install_cft.py --check   # metadata only

When enabled it drops Chrome under PREFIX, points /usr/bin/chromium at it and
replaces /usr/local/bin/chromedriver with the matching driver (chowned to the
runtime user so undetected-chromedriver can patch it in place).
"""

import json
import os
import pwd
import platform
import shutil
import sys
import tempfile
import time
import urllib.request
import zipfile

META = (
    "https://googlechromelabs.github.io/chrome-for-testing/"
    "last-known-good-versions-with-downloads.json"
)
PREFIX = "/opt/cft"
CHROME_LINK = "/usr/bin/chromium"
DRIVER_LINK = "/usr/local/bin/chromedriver"
RUNTIME_USER = "app"
CHUNK = 1 << 20


def _urls():
    with urllib.request.urlopen(META, timeout=60) as response:
        data = json.load(response)
    stable = data["channels"]["Stable"]
    downloads = stable["downloads"]
    chrome = next(d["url"] for d in downloads["chrome"] if d["platform"] == "linux64")
    driver = next(
        d["url"] for d in downloads["chromedriver"] if d["platform"] == "linux64"
    )
    return stable["version"], chrome, driver


def _fetch(url, dest):
    size = 0
    with urllib.request.urlopen(url, timeout=120) as response, open(dest, "wb") as out:
        while True:
            chunk = response.read(CHUNK)
            if not chunk:
                break
            out.write(chunk)
            size += len(chunk)
    return size


def _zip(name, url, cache_dir):
    """Return a path to a valid zip, preferring CFT_CACHE, downloading otherwise.

    The stock http.client path can truncate a large transfer on flaky links, so
    every download is checked with zipfile.is_zipfile and retried a few times.
    """
    if cache_dir:
        cached = os.path.join(cache_dir, name)
        if os.path.isfile(cached) and zipfile.is_zipfile(cached):
            print("  using cached %s" % cached)
            return cached
    dest = os.path.join(tempfile.mkdtemp(prefix="cft-dl-"), name)
    problem = None
    for attempt in range(1, 4):
        try:
            size = _fetch(url, dest)
            if zipfile.is_zipfile(dest):
                print("  fetched %s (%d bytes)" % (name, size))
                return dest
            problem = "not a zip after %d bytes" % size
        except Exception as error:  # network/protocol errors
            problem = str(error)
        print("  attempt %d for %s failed: %s" % (attempt, name, problem))
        time.sleep(2)
    raise SystemExit("could not fetch %s: %s" % (url, problem))


def _extract(zip_path, target):
    with zipfile.ZipFile(zip_path) as archive:
        archive.extractall(target)


def main(argv):
    check_only = "--check" in argv
    rest = [a for a in argv if not a.startswith("--")]
    prefix = rest[0] if rest else PREFIX

    enabled = os.environ.get("CHROME_FOR_TESTING", "0").lower() in ("1", "true", "yes", "on")
    if not enabled:
        print("CHROME_FOR_TESTING disabled; keeping Debian Chromium")
        return 0

    machine = platform.machine()
    version, chrome_url, driver_url = _urls()
    print("Chrome for Testing %s for %s" % (version, machine))
    print("  chrome:  %s" % chrome_url)
    print("  driver:  %s" % driver_url)
    if machine not in ("x86_64", "amd64"):
        # No linux-arm64 build exists; fail loudly rather than silently using
        # a Chromium that cannot pass the challenge.
        raise SystemExit(
            "Chrome for Testing has no linux-%s build; set CHROME_FOR_TESTING=0"
            % machine
        )
    if check_only:
        print("check mode: metadata resolved, not downloading")
        return 0

    cache_dir = os.environ.get("CFT_CACHE", "") or None
    chrome_zip = _zip("chrome-linux64.zip", chrome_url, cache_dir)
    driver_zip = _zip("chromedriver-linux64.zip", driver_url, cache_dir)

    os.makedirs(prefix, exist_ok=True)
    _extract(chrome_zip, prefix)
    _extract(driver_zip, prefix)

    chrome_bin = os.path.join(prefix, "chrome-linux64", "chrome")
    driver_bin = os.path.join(prefix, "chromedriver-linux64", "chromedriver")
    os.chmod(chrome_bin, 0o755)
    os.chmod(driver_bin, 0o755)

    # Point the canonical paths at CfT so ENV stays arch-independent.
    if os.path.lexists(CHROME_LINK):
        os.remove(CHROME_LINK)
    os.symlink(chrome_bin, CHROME_LINK)

    shutil.copyfile(driver_bin, DRIVER_LINK)
    os.chmod(DRIVER_LINK, 0o755)
    try:
        account = pwd.getpwnam(RUNTIME_USER)
        os.chown(DRIVER_LINK, account.pw_uid, account.pw_gid)
        os.chown(prefix, account.pw_uid, account.pw_gid)
    except KeyError:
        pass

    print("installed: %s -> %s" % (CHROME_LINK, chrome_bin))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
