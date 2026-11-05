#!/usr/bin/env bash
# 本地巡检入口：确认 8801 上已有开发服务器运行，然后执行路由巡检并生成 reports/index.html。
# 不会启动或重启服务；未运行时只提示启动命令。
# 用法：scripts/run.sh
set -euo pipefail

cd "$(dirname "$0")/.."

port=8801
base="http://127.0.0.1:${port}"

# wrangler 与巡检脚本需要 Node >= 22；优先用 mise 固定版本。
if command -v mise >/dev/null 2>&1; then
  NODE=(mise exec node@22.19.0 --)
else
  NODE=()
  if ! command -v node >/dev/null 2>&1 || [[ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]]; then
    echo "需要 Node >= 22（推荐安装 mise）。" >&2
    exit 1
  fi
fi

listening() { curl -s -o /dev/null --max-time 2 "$base/" >/dev/null 2>&1; }

if ! listening; then
  echo "未检测到运行中的开发服务器 ${base}。" >&2
  echo "请先在另一个终端启动：" >&2
  echo "  ./scripts/dev.sh" >&2
  exit 1
fi

status=0
"${NODE[@]}" node scripts/check_routes.js --local || status=$?

echo
echo "巡检报告：file://$(pwd)/reports/index.html"
exit "$status"
