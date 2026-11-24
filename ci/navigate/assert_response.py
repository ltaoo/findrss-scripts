"""Assert that a /navigate response cleared Cloudflare for javlibrary."""

import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
cookies = data.get("cookies") or []
names = [c["name"] for c in cookies]
source = (data.get("source") or "").lower()

print("upstream status:", data.get("status"))
print("title:", data.get("title"))
print("challenge:", data.get("challenge"), "clicks:", (data.get("timings") or {}).get("clicks"))
print("source_len:", len(data.get("source") or ""))
print("headers:", len(data.get("headers") or {}))
print("cookies:", names)

ok = (
    data.get("status") == 200
    and (data.get("challenge") or {}).get("passed") is True
    and "cf_clearance" in names
    and "just a moment" not in source
)
print("RESULT:", "PASS" if ok else "FAIL")
sys.exit(0 if ok else 1)
