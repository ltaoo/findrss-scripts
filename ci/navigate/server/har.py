"""Build HAR 1.2 entries from Chrome DevTools performance logs.

ChromeDriver returns DevTools protocol events when the `goog:loggingPrefs`
capability enables the `performance` log. We only keep what is needed to
reconstruct a navigable HAR: request/response events and load completion.
Redirects reuse the same request id and are collapsed into the final request.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from urllib.parse import parse_qsl, urlsplit

MAX_ENTRIES_DEFAULT = 400
_EPOCH = "1970-01-01T00:00:00.000Z"


def _iso(seconds):
    if not seconds:
        return None
    return (
        datetime.fromtimestamp(float(seconds), timezone.utc).strftime(
            "%Y-%m-%dT%H:%M:%S.%f"
        )[:-3]
        + "Z"
    )


def _headers(pairs):
    return [{"name": str(name), "value": str(value)} for name, value in (pairs or {}).items()]


def _header_map(pairs):
    return {str(name).lower(): str(value) for name, value in (pairs or {}).items()}


def _events(log_items):
    for item in log_items or []:
        try:
            payload = json.loads(item.get("message") or "{}")
        except (TypeError, ValueError):
            continue
        event = payload.get("message") or {}
        method = event.get("method")
        params = event.get("params") or {}
        request_id = params.get("requestId")
        if method and request_id:
            yield method, request_id, params


def parse(log_items, final_url=None, max_entries=MAX_ENTRIES_DEFAULT, max_bytes=None):
    """Return (main_document_info, har).

    main_document_info describes the final response of the navigation:
    `{"status", "headers", "mime_type", "protocol"}` or None when unavailable.
    """
    requests = {}
    responses = {}
    finished = {}
    for method, request_id, params in _events(log_items):
        if method == "Network.requestWillBeSent":
            requests[request_id] = params
        elif method == "Network.responseReceived":
            responses[request_id] = params
        elif method == "Network.loadingFinished":
            finished[request_id] = params

    entries = []
    for request_id, sent in requests.items():
        request = sent.get("request") or {}
        url = request.get("url") or ""
        if not url:
            continue
        received = responses.get(request_id) or {}
        response = received.get("response") or {}
        done = finished.get(request_id) or {}

        request_ts = sent.get("timestamp")
        response_ts = received.get("timestamp")
        finish_ts = done.get("timestamp")
        wait_ms = max(0.0, (response_ts - request_ts) * 1000) if request_ts and response_ts else 0.0
        receive_ms = max(0.0, (finish_ts - response_ts) * 1000) if response_ts and finish_ts else 0.0
        body_size = int(done.get("encodedDataLength") or 0)
        response_headers = response.get("headers") or {}
        post_data = request.get("postData")

        entries.append(
            {
                "startedDateTime": _iso(sent.get("wallTime")) or _iso(request_ts) or _EPOCH,
                "time": round(wait_ms + receive_ms, 2),
                "request": {
                    "method": request.get("method") or "GET",
                    "url": url,
                    "httpVersion": "HTTP/1.1",
                    "headers": _headers(request.get("headers")),
                    "queryString": [
                        {"name": name, "value": value}
                        for name, value in parse_qsl(
                            urlsplit(url).query, keep_blank_values=True
                        )
                    ],
                    "cookies": [],
                    "headersSize": -1,
                    "bodySize": len(post_data.encode("utf-8")) if post_data else 0,
                },
                "response": {
                    "status": int(response.get("status") or 0),
                    "statusText": response.get("statusText") or "",
                    "httpVersion": response.get("protocol") or "",
                    "headers": _headers(response_headers),
                    "content": {
                        "size": body_size,
                        "mimeType": response.get("mimeType") or "",
                    },
                    "redirectURL": _header_map(response_headers).get("location", ""),
                    "headersSize": -1,
                    "bodySize": body_size,
                },
                "cache": {},
                "timings": {
                    "blocked": -1,
                    "dns": -1,
                    "connect": -1,
                    "send": 0,
                    "wait": round(wait_ms, 2),
                    "receive": round(receive_ms, 2),
                    "ssl": -1,
                },
                "_resource_type": sent.get("type") or "",
            }
        )

    entries.sort(key=lambda entry: entry["startedDateTime"])
    if max_entries and len(entries) > max_entries:
        entries = entries[:max_entries]
    for entry in entries:
        entry.pop("_resource_type", None)

    main = _main_document(responses, final_url)
    har = {
        "log": {
            "version": "1.2",
            "creator": {"name": "findrss-navigate", "version": "1.0"},
            "pages": [],
            "entries": entries,
        }
    }
    if max_bytes:
        # Trim oldest entries first until the serialized HAR fits the budget.
        while entries and len(json.dumps(har)) > max_bytes:
            entries = entries[: max(1, len(entries) // 2)]
            har["log"]["entries"] = entries
    return main, har


def _main_document(responses, final_url):
    candidates = []
    for params in responses.values():
        response = params.get("response") or {}
        if not response.get("url"):
            continue
        candidates.append(
            {
                "url": response.get("url"),
                "type": params.get("type") or "",
                "status": int(response.get("status") or 0),
                "headers": _header_map(response.get("headers")),
                "mime_type": response.get("mimeType") or "",
                "protocol": response.get("protocol") or "",
            }
        )
    if not candidates:
        return None
    if final_url:
        wanted = final_url.split("#")[0]
        exact = [item for item in candidates if item["url"].split("#")[0] == wanted]
        if exact:
            return exact[-1]
    documents = [item for item in candidates if item["type"] == "Document"]
    return (documents or candidates)[-1]
