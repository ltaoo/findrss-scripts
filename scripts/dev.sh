#!/usr/bin/env bash
# 启动本地开发服务器；端口与 wrangler.jsonc 的 dev.port 保持一致（8801）。
# 前台运行，Ctrl-C 停止。另开终端执行 scripts/run.sh 做路由巡检。
# 用法：scripts/dev.sh [wrangler dev 参数]
set -euo pipefail

cd "$(dirname "$0")/.."

port=8801
base="http://127.0.0.1:${port}"

# wrangler 需要 Node >= 22；优先用 mise 固定版本。
if command -v mise >/dev/null 2>&1; then
  NODE=(mise exec node@22.19.0 --)
else
  NODE=()
  if ! command -v node >/dev/null 2>&1 || [[ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]]; then
    echo "需要 Node >= 22（推荐安装 mise）。" >&2
    exit 1
  fi
fi

if curl -s -o /dev/null --max-time 2 "$base/"; then
  echo "开发服务器已在 ${base} 运行；如需重启，请先停止该进程。" >&2
  exit 0
fi

echo "启动开发服务器 ${base}（Ctrl-C 停止）"
if [[ ${#NODE[@]} -gt 0 ]]; then
  exec "${NODE[@]}" npx wrangler dev "$@"
fi
exec npx wrangler dev "$@"
