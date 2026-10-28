import { readFile, writeFile } from "node:fs/promises";
import { route_report_model } from "./route_report_model.js";

const escape = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const states = { passed: "通过", failed: "失败", skipped: "未检查" };

export function render_report_html(report) {
  const model = route_report_model(report);
  const date = new Date(model.checked_at);
  const checked = Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium", timeStyle: "medium", timeZone: "Asia/Shanghai", hour12: false,
  }).format(date) + "（北京时间）" : "未提供巡检时间";
  const rows = group => group.rows.map(row => `<tr data-n="route-result" class="${row.ok ? "passed" : "failed"}">
    <td data-n="route-status"><span data-n="status-label" class="status ${row.ok ? "passed" : "failed"}">${row.ok ? "通过" : "失败"}</span></td>
    <th data-n="route-identity" scope="row"><code data-n="route-path">${escape(row.path)}</code><small data-n="script-file">${escape(row.file)}</small></th>
    <td data-n="http-status">${escape(row.status ?? "—")}</td>
    <td data-n="check-stages"><div data-n="stages-list" class="stages">${row.stages.map(stage => `<span data-n="${stage.key}-stage" class="stage ${stage.state}">${stage.label} ${states[stage.state]}</span>`).join("")}</div></td>
    <td data-n="request-duration">${Number.isFinite(row.duration_ms) ? (row.duration_ms / 1000).toFixed(2) + " s" : "—"}</td>
    <td data-n="result-description">${row.code ? `<code data-n="error-code">${escape(row.code)}</code>` : ""}<span data-n="error-message">${escape(row.error || (row.ok ? "校验完成" : "校验未通过"))}</span></td>
  </tr>`).join("\n");
  return `<!doctype html>
<html data-n="report-document" lang="zh-CN">
<head data-n="report-head">
  <meta data-n="document-charset" charset="utf-8">
  <meta data-n="viewport-settings" name="viewport" content="width=device-width, initial-scale=1">
  <meta data-n="content-policy" http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
  <meta data-n="page-description" name="description" content="FindRSS 全部脚本路由的最新巡检结果与错误详情">
  <title data-n="document-title">FindRSS 路由巡检报告</title>
  <style data-n="report-styles">
    :root { color-scheme: light; --ink: #182b45; --muted: #56677b; --blue: #214b85; --line: #dbe4ef; --red: #ad3037; --green: #206847; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: #f3f6fa; font: 15px/1.65 "Avenir Next", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; }
    a { color: var(--blue); text-underline-offset: .22em; }
    a:hover { text-decoration-thickness: 2px; }
    a:focus-visible, summary:focus-visible { outline: 3px solid var(--blue); outline-offset: 5px; }
    .skip { position: absolute; top: -80px; left: 20px; padding: 8px 16px; background: white; z-index: 5; }
    .skip:focus { top: 12px; }
    .page { max-width: 1440px; padding: 40px 32px 24px; margin: auto; }
    .header { display: flex; align-items: end; justify-content: space-between; gap: 24px; }
    .brand { margin: 0 0 4px; color: var(--blue); font-weight: 650; }
    h1 { margin: 0; font-size: clamp(26px, 4vw, 38px); font-weight: 650; letter-spacing: -.035em; line-height: 1.35; }
    .checked { margin: 10px 0 0; color: var(--muted); }
    .downloads { display: flex; flex-wrap: wrap; gap: 18px; padding-bottom: 4px; white-space: nowrap; }
    .overview { margin: 28px 0 20px; padding: 20px 24px; background: white; border-left: 5px solid var(--green); border-radius: 0 10px 10px 0; }
    .overview.failed { border-left-color: var(--red); }
    .overview.empty { border-left-color: var(--muted); }
    .overview h2 { margin: 0 0 8px; font-size: 20px; font-weight: 600; }
    .metrics { display: flex; flex-wrap: wrap; gap: 8px 28px; margin: 0; color: var(--muted); }
    .metrics strong { color: var(--ink); font-size: 18px; font-variant-numeric: tabular-nums; }
    .pass-rate { display: block; width: 100%; height: 7px; margin-top: 16px; accent-color: var(--green); }
    .formats { display: flex; flex-wrap: wrap; gap: 8px 12px; margin-bottom: 24px; }
    .formats a { padding: 5px 12px; border: 1px solid var(--line); border-radius: 6px; background: white; text-decoration: none; }
    .formats .count { color: var(--muted); margin-left: 8px; }
    .group { margin: 0 0 18px; background: white; border: 1px solid var(--line); border-radius: 10px; overflow: clip; scroll-margin-top: 16px; }
    .group summary { padding: 15px 20px; cursor: pointer; font-size: 18px; font-weight: 600; }
    .group summary small { font-size: 14px; font-weight: 400; color: var(--muted); margin-left: 16px; }
    .table-scroll { overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; text-align: left; font-size: 14px; }
    caption { padding: 0 20px 12px; color: var(--muted); text-align: left; }
    th, td { padding: 13px 16px; border-top: 1px solid var(--line); vertical-align: top; }
    thead th { font-weight: 500; color: var(--muted); background: #f8fafd; white-space: nowrap; }
    tbody th { min-width: 270px; max-width: 420px; font-weight: 500; overflow-wrap: anywhere; }
    tbody tr.failed { background: #fff9f8; }
    code { font: 12px/1.7 ui-monospace, "SFMono-Regular", Consolas, monospace; overflow-wrap: anywhere; }
    small[data-n="script-file"] { display: block; margin-top: 5px; color: var(--muted); font-size: 12px; }
    .status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 600; white-space: nowrap; }
    .status.passed { color: var(--green); background: #eaf5ef; }
    .status.failed { color: var(--red); background: #fde9e8; }
    .stages { display: grid; grid-template-columns: repeat(2, max-content); gap: 4px 12px; font-size: 12px; }
    .stage.passed { color: var(--green); } .stage.failed { color: var(--red); font-weight: 600; } .stage.skipped { color: var(--muted); }
    td[data-n="request-duration"], td[data-n="http-status"] { white-space: nowrap; font-variant-numeric: tabular-nums; }
    td[data-n="result-description"] { min-width: 210px; max-width: 420px; overflow-wrap: anywhere; }
    code[data-n="error-code"] { display: block; margin-bottom: 5px; color: var(--red); }
    .footer, .empty-state { color: var(--muted); }
    .footer { padding-top: 12px; font-size: 13px; }
    @media (max-width: 640px) { .page { padding: 24px 16px 20px; } .header { display: block; } .downloads { margin-top: 18px; } .overview { padding: 16px; } .group summary { padding: 14px 16px; } }
  </style>
</head>
<body data-n="report-body">
  <a data-n="skip-to-results" class="skip" href="#results">跳转到巡检结果</a>
  <div data-n="report-page" class="page">
    <header data-n="report-header" class="header">
      <div data-n="report-heading"><p data-n="project-name" class="brand">FindRSS</p><h1 data-n="report-title">路由巡检报告</h1><p data-n="check-time" class="checked"><time data-n="checked-at" datetime="${escape(model.checked_at)}">${escape(checked)}</time></p></div>
      <nav data-n="report-downloads" class="downloads" aria-label="下载报告"><a data-n="json-report-link" href="routes.json" download>下载 JSON</a><a data-n="markdown-report-link" href="routes.md" download>下载 Markdown</a></nav>
    </header>
    <section data-n="report-overview" class="overview ${!model.total ? "empty" : model.failed ? "failed" : "passed"}" aria-labelledby="overview-title">
      <h2 data-n="overall-status" id="overview-title">${!model.total ? "暂无巡检结果" : model.failed ? `${model.failed} 条路由需要处理` : "全部路由校验通过"}</h2>
      <p data-n="report-metrics" class="metrics"><span data-n="total-count">检查项 <strong data-n="total-value">${model.total}</strong></span><span data-n="passed-count">通过 <strong data-n="passed-value">${model.passed}</strong></span><span data-n="failed-count">失败 <strong data-n="failed-value">${model.failed}</strong></span><span data-n="pass-percentage">通过率 <strong data-n="pass-percentage-value">${model.pass_rate}%</strong></span></p>
      <progress data-n="pass-rate" class="pass-rate" value="${model.passed}" max="${model.total || 1}" aria-label="路由校验通过数量">${model.pass_rate}%</progress>
    </section>
    <nav data-n="format-navigation" class="formats" aria-label="按类型查看">${model.groups.map(group => `<a data-n="format-anchor" href="#${group.id}">${escape(group.name)}<span data-n="format-count" class="count">${group.total} 项 / ${group.failed} 失败</span></a>`).join("")}</nav>
    <main data-n="route-results" id="results">
      ${model.total ? model.groups.map(group => `<details data-n="format-results" class="group" id="${group.id}" open>
        <summary data-n="format-summary">${escape(group.name)}<small data-n="format-status">${group.total} 项检查，${group.failed} 项失败</small></summary>
        <div data-n="table-scroll-container" class="table-scroll" role="region" aria-label="${escape(group.name)} 检查详情" tabindex="0">
          <table data-n="results-table"><caption data-n="table-description">${escape(group.name)} 路由，失败项优先显示；后续未执行的阶段标为「未检查」。</caption>
            <thead data-n="results-head"><tr data-n="column-headings"><th data-n="status-heading" scope="col">结果</th><th data-n="route-heading" scope="col">路由 / 脚本</th><th data-n="http-heading" scope="col">HTTP</th><th data-n="stages-heading" scope="col">校验阶段</th><th data-n="duration-heading" scope="col">耗时</th><th data-n="description-heading" scope="col">说明</th></tr></thead>
            <tbody data-n="results-rows">${rows(group)}</tbody>
          </table>
        </div>
      </details>`).join("\n") : '<p data-n="empty-results" class="empty-state">本轮没有生成路由检查项，请查看 Actions 运行记录。</p>'}
    </main>
    <footer data-n="report-footer" class="footer">此页面展示最近一次巡检快照，不会自动重新请求上游站点。页面仅提供校验结果，未包含订阅原文或访问凭据。</footer>
  </div>
</body>
</html>\n`;
}

if (import.meta.main) {
  const report = JSON.parse(await readFile(new URL("../reports/routes.json", import.meta.url), "utf8"));
  await writeFile(new URL("../reports/index.html", import.meta.url), render_report_html(report));
}
