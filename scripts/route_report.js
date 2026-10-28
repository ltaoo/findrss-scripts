import { route_report_model } from "./route_report_model.js";

export function render_progress(result) {
  return `${result.output_valid ? "PASS" : "FAIL"} ${result.file} ${result.format} ${result.path}${result.error ? ": " + result.error : ""}`;
}

export function render_report(report) {
  const model = route_report_model(report);
  const cell = value => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/[\\`*_[\]~]/g, "\\$&").replace(/\|/g, "&#124;").replace(/[\r\n]/g, " ");
  const raw_url = file => "https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/"
    + String(file).split("/").map(part => encodeURIComponent(part).replace(/[!'()*]/g, char => "%" + char.charCodeAt(0).toString(16).toUpperCase())).join("/");
  const states = { passed: "✅ 通过", failed: "❌ 失败", skipped: "— 未检查" };
  return `# 脚本路由巡检：${model.passed}/${model.total} 通过\n\n`
    + `巡检时间：${cell(model.checked_at || "未提供")}\n\n`
    + "点击脚本文件名打开 master 分支的 Raw 源码，复制内容即可复用。结果为本轮巡检快照；同一脚本的不同路由分别列出，失败项优先显示，后续未执行的阶段标为「未检查」。\n\n"
    + (model.total ? model.groups.map(group => `## ${cell(group.name)}（${group.total - group.failed}/${group.total} 通过）\n\n`
      + "| 结果 | 脚本（Raw） | 路由 | 请求 | 响应 | 格式 | 输出 | 说明 |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n"
      + group.rows.map(row => `| ${row.ok ? "✅ 通过" : "❌ 失败"} | [${cell(row.file)}](${raw_url(row.file)}) | ${cell(row.path)} | ${row.stages.map(stage => states[stage.state]).join(" | ")} | ${cell([row.code, row.error].filter(Boolean).join(": "))} |`).join("\n")
      + "\n").join("\n") : "本轮没有生成路由检查项，请查看 Actions 运行记录。\n");
}
