#!/usr/bin/env bash
# 仅在专用 InstaBox 内运行；状态和运行时缓存在 source 目录外保留。
set -euo pipefail
cd /data/home/findrss-checks/source
export CI=1
node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (major < 22 || (major === 22 && minor < 19)) throw new Error("需要 Node >= 22.19")'
npm ci --no-audit --no-fund
npm run build

npm run dev -- --ip 127.0.0.1 --port 8801 --persist-to /data/home/findrss-checks/state > /data/home/findrss-checks/worker.log 2>&1 &
server=$!
trap 'kill "$server" 2>/dev/null || true' EXIT
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
