import { route_report_model } from "./route_report_model.js";

export function render_progress(result) {
  return `${result.output_valid ? "PASS" : "FAIL"} ${result.file} ${result.format} ${result.path}${result.error ? ": " + result.error : ""}`;
}

export function render_report(report) {
  const model = route_report_model(report);
  const cell = value => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/[\\`*_[\]~]/g, "\\$&").replace(/\|/g, "&#124;").replace(/[\r\n]/g, " ");
  return `# 脚本路由巡检：${model.passed}/${model.total} 通过\n\n`
    + `巡检时间：${cell(model.checked_at || "未提供")}\n\n`
    + "点击脚本路径打开 master 分支的 Raw 源码。结果按脚本聚合，每条路由显示成功或失败及失败原因，失败项优先显示。\n\n"
    + (model.total ? model.groups.map(group => `## ${cell(group.name)}（${group.total - group.failed}/${group.total} 通过）\n\n`
      + `${group.icon_url ? `<img data-n="script-icon" src="${group.icon_url}" alt="" width="24" height="24"> ` : ""}[${cell(group.file)}](${group.raw_url}) · 版本：${cell(group.version)}\n\n`
      + "| 路由 | 结果 | 失败原因 |\n| --- | --- | --- |\n"
      + group.rows.map(row => `| ${cell(row.path)} | ${row.ok ? "✅ 成功" : "❌ 失败"} | ${cell(row.reason)} |`).join("\n")
      + "\n").join("\n") : "本轮没有生成路由检查项，请查看 Actions 运行记录。\n");
}
