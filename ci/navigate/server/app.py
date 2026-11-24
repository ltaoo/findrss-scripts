"""HTTP facade for the Chromium navigation service.

Endpoints
---------
POST /navigate  full navigation result: source, headers, cookies, optional HAR
GET  /html      compatibility adapter for the existing findrss bypass client
GET  /health    liveness probe

`/navigate` is the primary interface. `/html` exists so the Worker code in
findrss-scripts can switch backends without changing its client contract:
it returns the HTML body plus `x-cf-bypasser-final-url`.
"""

from __future__ import annotations

import hmac
import ipaddress
import os
import threading
from typing import Dict, List, Optional
from urllib.parse import urlsplit

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel, Field
from starlette.requests import Request

from .navigator import NavigationError, Navigator

TOKEN = os.environ.get("TOKEN", "")
ALLOWED_HOSTS = {
    host.strip().lower()
    for host in os.environ.get("ALLOWED_HOSTS", "").split(",")
    if host.strip()
}
ALLOW_ANY_HTTPS = os.environ.get("ALLOW_ANY_HTTPS", "1").lower() in (
    "1",
    "true",
    "yes",
    "on",
)
MAX_URL_LENGTH = int(os.environ.get("MAX_URL_LENGTH", "8192"))

NAVIGATOR = Navigator()
app = FastAPI(title="findrss-navigate", version="1.0", docs_url=None, redoc_url=None)


# -- request models --------------------------------------------------------


class CaptureModel(BaseModel):
    source: bool = True
    headers: bool = True
    cookies: bool = True
    har: bool = False


class NavigateRequest(BaseModel):
    url: str
    wait_until: str = "domcontentloaded"
    timeout_ms: int = Field(default=90000, ge=1000, le=110000)
    capture: CaptureModel = Field(default_factory=CaptureModel)


# -- auth and validation ---------------------------------------------------


def require_token(
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="x-auth-token"),
):
    if not TOKEN:
        raise HTTPException(
            500, {"code": "CONFIG_INVALID", "message": "TOKEN is not configured"}
        )
    supplied = x_auth_token or ""
    if not supplied and authorization and authorization.lower().startswith("bearer "):
        supplied = authorization[7:]
    if not supplied or not hmac.compare_digest(supplied, TOKEN):
        raise HTTPException(
            401, {"code": "UNAUTHORIZED", "message": "invalid navigation token"}
        )


def validate_target(raw: str) -> str:
    if not raw or len(raw) > MAX_URL_LENGTH:
        raise HTTPException(
            400, {"code": "INVALID_PARAMETER", "message": "url is empty or too long"}
        )
    parts = urlsplit(raw)
    if parts.scheme != "https":
        raise HTTPException(
            400, {"code": "INVALID_PARAMETER", "message": "only https targets are allowed"}
        )
    if parts.username or parts.password or not parts.hostname:
        raise HTTPException(
            400, {"code": "INVALID_PARAMETER", "message": "url must not carry credentials"}
        )
    host = parts.hostname.lower().rstrip(".")
    if host == "localhost" or host.endswith(".localhost"):
        raise HTTPException(
            403, {"code": "TARGET_FORBIDDEN", "message": "loopback hosts are not allowed"}
        )
    try:
        address = ipaddress.ip_address(host)
        if not address.is_global:
            raise HTTPException(
                403,
                {"code": "TARGET_FORBIDDEN", "message": "non-public addresses are not allowed"},
            )
    except ValueError:
        pass  # hostname, not an IP literal
    if ALLOWED_HOSTS:
        if not any(host == allowed or host.endswith("." + allowed) for allowed in ALLOWED_HOSTS):
            raise HTTPException(
                403, {"code": "TARGET_FORBIDDEN", "message": "host is not in ALLOWED_HOSTS"}
            )
    elif not ALLOW_ANY_HTTPS:
        raise HTTPException(
            403,
            {"code": "TARGET_FORBIDDEN", "message": "ALLOWED_HOSTS is required in this mode"},
        )
    return raw


def _origin(url: str):
    parts = urlsplit(url)
    port = parts.port or (443 if parts.scheme == "https" else 80)
    return parts.scheme, parts.hostname, port


# -- endpoints -------------------------------------------------------------


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/navigate")
def navigate(request: NavigateRequest, _token: None = Depends(require_token)):
    target = validate_target(request.url)
    try:
        result = NAVIGATOR.navigate(
            target,
            timeout_ms=request.timeout_ms,
            capture_har=request.capture.har,
        )
    except NavigationError as error:
        status = 413 if error.code == "SOURCE_TOO_LARGE" else 502
        raise HTTPException(status, {"code": error.code, "message": error.message})

    return {
        "final_url": result.final_url,
        "title": result.title,
        "status": result.status,
        "source": result.source if request.capture.source else None,
        "headers": result.headers if request.capture.headers else None,
        "cookies": result.cookies if request.capture.cookies else None,
        "har": result.har if request.capture.har else None,
        "challenge": {
            "detected": result.challenge_detected,
            "passed": result.challenge_passed,
        },
        "timings": {
            "navigation_ms": result.navigation_ms,
            "clicks": result.clicks,
        },
        "truncated": False,
    }


@app.get("/html")
def html(
    url: str = Query(..., min_length=1),
    _token: None = Depends(require_token),
):
    target = validate_target(url)
    try:
        result = NAVIGATOR.navigate(target, timeout_ms=105000, capture_har=False)
    except NavigationError as error:
        status = 413 if error.code == "SOURCE_TOO_LARGE" else 502
        raise HTTPException(status, {"code": error.code, "message": error.message})

    if result.challenge_detected and not result.challenge_passed:
        raise HTTPException(
            502,
            {"code": "CHALLENGE_UNSOLVED", "message": "Cloudflare challenge was not passed"},
        )
    if result.status and result.status >= 400:
        raise HTTPException(
            502,
            {"code": "UPSTREAM_ERROR", "message": "upstream HTTP %s" % result.status},
        )
    if _origin(result.final_url) != _origin(target):
        raise HTTPException(
            502,
            {"code": "UPSTREAM_INVALID_RESPONSE", "message": "cross-origin redirect"},
        )
    if not result.source.strip():
        raise HTTPException(
            502,
            {"code": "UPSTREAM_INVALID_RESPONSE", "message": "empty page source"},
        )
    return PlainTextResponse(
        result.source,
        media_type="text/html; charset=utf-8",
        headers={
            "x-cf-bypasser-final-url": result.final_url,
            "x-cf-bypasser-status": str(result.status or ""),
        },
    )


# -- errors and lifecycle --------------------------------------------------


@app.exception_handler(HTTPException)
def http_error(request: Request, error: HTTPException):
    detail = error.detail
    if isinstance(detail, dict) and "code" in detail:
        body = detail
    else:
        body = {
            "code": "REQUEST_INVALID" if error.status_code < 500 else "SERVICE_ERROR",
            "message": str(detail),
        }
    return JSONResponse(body, status_code=error.status_code)


@app.exception_handler(RequestValidationError)
def validation_error(request: Request, error: RequestValidationError):
    messages = "; ".join(
        "%s: %s" % (".".join(str(part) for part in item["loc"]), item["msg"])
        for item in error.errors()
    )
    return JSONResponse(
        {"code": "REQUEST_INVALID", "message": messages[:500]}, status_code=400
    )


@app.on_event("startup")
def startup():
    if os.environ.get("WARMUP", "1").lower() in ("1", "true", "yes", "on"):
        threading.Thread(target=_warm, name="chrome-warmup", daemon=True).start()


@app.on_event("shutdown")
def shutdown():
    NAVIGATOR.close()


def _warm():
    try:
        NAVIGATOR.warmup()
    except Exception:
        pass
