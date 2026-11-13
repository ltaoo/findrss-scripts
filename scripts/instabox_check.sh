#!/usr/bin/env bash
# 在外部调度器运行；机器关机后由 GitHub Actions 启动下一轮。
set -euo pipefail
cd "$(dirname "$0")/.."

: "${INSTABOX_API_KEY:?请设置 INSTABOX_API_KEY}"
: "${INSTABOX_MACHINE:?请设置专用巡检机器 INSTABOX_MACHINE}"
umask 077
temporary=$(mktemp -d)
machine=$INSTABOX_MACHINE

cleanup() {
  local status=$1
  trap - EXIT
  rm -rf "$temporary"
  # start 的响应可能丢失，仍尝试关机；巡检失败也不跳过清理。
  for attempt in 1 2 3; do
    if instabox stop "$machine"; then
      exit "$status"
    fi
    sleep 5
  done
  echo "关机失败，请立即检查 InstaBox 状态。" >&2
  exit 1
}
trap 'cleanup "$?"' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

instabox start "$machine"
instabox exec "$machine" -- 'sudo shutdown -c 2>/dev/null || true; sudo shutdown -h +50; mkdir -p /data/home/findrss-checks; rm -f /data/home/findrss-checks/reports.tar.gz'
# 只打包版本控制内的项目文件；凭据单独通过加密连接上传。
git ls-files -z | COPYFILE_DISABLE=1 tar --no-xattrs --null -T - -czf "$temporary/source.tar.gz"
instabox cp "$temporary/source.tar.gz" "$machine:/data/home/findrss-checks/source.tar.gz"
if [[ -n ${INSTABOX_DEV_VARS:-} ]]; then
  printf '%s\n' "$INSTABOX_DEV_VARS" > "$temporary/dev.vars"
elif [[ -f .dev.vars ]]; then
  cp .dev.vars "$temporary/dev.vars"
else
  : > "$temporary/dev.vars"
fi
instabox cp "$temporary/dev.vars" "$machine:/data/home/findrss-checks/.dev.vars"
instabox exec "$machine" -- 'set -eu; cd /data/home/findrss-checks; rm -rf source; mkdir -p source runtime; tar -xzf source.tar.gz -C source; ln -s ../runtime source/.runtime; if test -f .dev.vars; then chmod 600 .dev.vars; ln -s ../.dev.vars source/.dev.vars; fi'
job=$(instabox exec --background "$machine" --env "ROUTE_CHECK_CASES=${ROUTE_CHECK_CASES:-}" -- timeout --kill-after=30s 40m bash /data/home/findrss-checks/source/scripts/instabox_task.sh)
status=0
instabox jobs wait "$machine" "$job" --timeout 45m || status=$?
instabox jobs logs "$machine" "$job" || true
if [[ $status -gt 1 ]]; then
  echo "远端巡检未正常完成（退出码 ${status}）。" >&2
  exit "$status"
fi
instabox cp "$machine:/data/home/findrss-checks/reports.tar.gz" "$temporary/reports.tar.gz"
rm -rf reports/routes.json reports/routes.md reports/README.md reports/index.html reports/responses reports/details reports/icons
tar -xzf "$temporary/reports.tar.gz"
for report in routes.json routes.md README.md index.html; do
  test -s "reports/$report"
done
if [[ -n ${GITHUB_STEP_SUMMARY:-} ]]; then
  cat reports/routes.md >> "$GITHUB_STEP_SUMMARY"
fi
# 与原 workflow 一致：路由失败但报告完整时，继续发布报告和通知。
