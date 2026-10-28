export function render_progress(result) {
  return `${result.output_valid ? "PASS" : "FAIL"} ${result.file} ${result.format} ${result.path}${result.error ? ": " + result.error : ""}`;
}

export function render_report(report) {
  const cell = value => String(value ?? "").replace(/[|\r\n]/g, " ");
  return `脚本路由巡检：${report.passed}/${report.total} 通过\n\n`
    + "| 脚本 / 路由 | 请求 | 响应 | 格式 | 输出 | 说明 |\n| --- | --- | --- | --- | --- | --- |\n"
    + report.results.map(result => `| ${cell(result.file)} ${cell(result.path)} | ${result.request} | ${result.response} | ${result.format_valid} | ${result.output_valid} | ${cell(result.error)} |`).join("\n") + "\n";
}
