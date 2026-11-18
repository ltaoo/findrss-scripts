#!/usr/bin/env bash
# 仅在专用 InstaBox 内运行；状态和运行时缓存在 source 目录外保留。
set -euo pipefail
cd /data/home/findrss-checks/source
export CI=1 BROWSER_ENABLED=true X_BROWSER_HEADFUL=true
node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (major < 22 || (major === 22 && minor < 19)) throw new Error("需要 Node >= 22.19")'
npm ci --no-audit --no-fund
npm run build
node scripts/prepare_browser.js
mkdir -p /data/home/findrss-signing
install -m 600 dist/douyin-signer.mjs /data/home/findrss-signing/douyin-signer.mjs.next
mv /data/home/findrss-signing/douyin-signer.mjs.next /data/home/findrss-signing/douyin-signer.mjs

umask 077
browser_dir=$(mktemp -d /data/home/findrss-checks/browser.XXXXXX)
browser_started=false
vars_swapped=false
server=
if docker info >/dev/null 2>&1; then engine=(docker); else engine=(sudo -n docker); fi
cleanup() {
  if [[ -n $server ]]; then kill -- "-$server" 2>/dev/null || true; fi
  if [[ $browser_started == true ]]; then "${engine[@]}" stop findrss-inspection-browser >/dev/null 2>&1 || true; fi
  if [[ $vars_swapped == true ]]; then
    rm -f .dev.vars
    if [[ -e $browser_dir/original.dev.vars || -L $browser_dir/original.dev.vars ]]; then mv "$browser_dir/original.dev.vars" .dev.vars; fi
  fi
  rm -rf "$browser_dir"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
if "${engine[@]}" container inspect findrss-inspection-browser >/dev/null 2>&1; then
  echo '巡检浏览器容器已存在，请先检查上次任务是否仍在运行。' >&2
  exit 2
fi
node --input-type=module - "$browser_dir" <<'JS'
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
const directory = process.argv[2];
const token = randomBytes(24).toString("hex");
const original = existsSync(".dev.vars") ? readFileSync(".dev.vars", "utf8") : "";
writeFileSync(directory + "/worker.dev.vars", original + "\nBROWSER_BYPASS_URL=http://127.0.0.1:8802\nBROWSER_BYPASS_TOKEN=" + token + "\n", { mode: 0o600 });
writeFileSync(directory + "/service.env", "CF_AUTH_TOKEN=" + token + "\nCF_BROWSERS=1\nCF_JOB_TIMEOUT=90\nCF_CHALLENGE_TIMEOUT=45\nCF_HEADLESS=true\nCF_CACHE_ENABLED=false\nCF_MIRROR_MAX_RETRIES=0\n", { mode: 0o600 });
JS
if [[ -e .dev.vars || -L .dev.vars ]]; then mv .dev.vars "$browser_dir/original.dev.vars"; fi
vars_swapped=true
ln -s "$browser_dir/worker.dev.vars" .dev.vars
image=ghcr.io/sarperavci/cloudflarebypassforscraping@sha256:9897d17b9fe5471f0f04c8d11c4ec4b147ff444cc0ee61e2b1788a743be9e718
"${engine[@]}" pull "$image" > /data/home/findrss-checks/browser-pull.log 2>&1
"${engine[@]}" run --detach --rm --name findrss-inspection-browser --label findrss.task=inspection-browser --memory=2g --cpus=2 --shm-size=256m --cap-drop=ALL --security-opt=no-new-privileges --publish 127.0.0.1:8802:8000 --env-file "$browser_dir/service.env" "$image" >/dev/null
browser_started=true
browser_ready=false
for attempt in $(seq 90); do
  if [[ $(curl --silent --output /dev/null --write-out '%{http_code}' --max-time 2 http://127.0.0.1:8802/browsers || true) == 401 ]]; then browser_ready=true; break; fi
  sleep 1
done
if [[ $browser_ready != true ]]; then echo 'Python 浏览器启动超时。' >&2; exit 2; fi

setsid xvfb-run --auto-servernum --server-args="-screen 0 1440x900x24 -nolisten tcp" npm run dev -- --ip 127.0.0.1 --port 8801 --var "BROWSER_ENABLED:$BROWSER_ENABLED" --persist-to /data/home/findrss-checks/state > /data/home/findrss-checks/worker.log 2>&1 &
server=$!
ready=false
for attempt in $(seq 120); do
  if curl --silent --output /dev/null --max-time 2 http://127.0.0.1:8801/; then
    ready=true
    break
  fi
  kill -0 "$server"
  sleep 1
done
if [[ $ready != true ]]; then
  echo '本地 Worker 启动超时，查看 /data/home/findrss-checks/worker.log。' >&2
  exit 2
fi
node scripts/sync_inspection_cookies.js
status=0
CHECK_BASE_URL=http://127.0.0.1:8801 node scripts/check_routes.js --release || status=$?
for report in routes.json routes.md README.md index.html; do
  test -s "reports/$report"
done
tar -czf /data/home/findrss-checks/reports.tar.gz reports/routes.json reports/routes.md reports/README.md reports/index.html reports/responses reports/details reports/icons
exit "$status"
