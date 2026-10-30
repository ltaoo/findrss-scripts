import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { route_report_model } from "./route_report_model.js";
import { route_request_model, route_request_models } from "./route_request_model.js";
import { render_market_page, market_client } from "./timeless_runtime.js";

const market_styles = readFileSync(new URL("./script_market.css", import.meta.url), "utf8");
const kind_names = { hot: "热榜", rss: "订阅", clip: "剪藏", detect: "监测" };
const logo_data_url = "data:image/svg+xml;base64," + readFileSync(new URL("../assets/brand/logo.svg", import.meta.url)).toString("base64");
const favicon_data_url = "data:image/svg+xml;base64," + readFileSync(new URL("../assets/brand/favicon.svg", import.meta.url)).toString("base64");

export function render_report_html(report, catalog) {
  const model = route_report_model(report, catalog?.map(({ file, metadata }) => ({
    file, name: metadata.name, kind: metadata.kind, version: metadata.version, platform: metadata.platform,
  })) || report.scripts || []);
  const groups = model.groups.sort((a, b) => a.file.localeCompare(b.file));
  const request_routes = route_request_models(catalog || []);
  const request_map = new Map(request_routes.map(route => [route.key, route]));
  for (const group of groups) {
    group.inspection_rows = group.rows.map(row => {
      const key = JSON.stringify([group.file, row.path]);
      const request = request_map.get(key) || route_request_model(group.file, row.path);
      if (request) request_map.set(key, request);
      return { ...row, request };
    });
    if (!group.rows.length) group.inspection_rows = request_routes.filter(route => route.file === group.file)
      .map(request => ({ path: request.path, ok: null, reason: "", request }));
  }
  const date = new Date(model.checked_at);
  const checked = Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium", timeStyle: "medium", timeZone: "Asia/Shanghai", hour12: false,
  }).format(date) + "（北京时间）" : "未提供巡检时间";
  const scripts = groups.map(group => ({ id: group.id, title: group.title, kind: group.kind, raw_url: group.raw_url,
    file: group.file, version: group.version, icon_data_url: group.icon_data_url, total: group.total, failed: group.failed, inspection_rows: group.inspection_rows,
    search_text: [group.title, group.file, group.kind, kind_names[group.kind], ...group.rows.map(row => row.path)].join(" "),
    routes: [...request_map.values()].filter(route => route.file === group.file),
  }));
  const data = { scripts, checked_at: model.checked_at || "", checked, logo: logo_data_url };
  const bootstrap = JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  const script_hash = createHash("sha256").update(market_client).digest("base64");
  return `<!doctype html>
<html data-n="market-document" lang="zh-CN">
<head data-n="market-head">
  <meta data-n="document-charset" charset="utf-8">
  <meta data-n="viewport-settings" name="viewport" content="width=device-width, initial-scale=1">
  <meta data-n="content-policy" http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${script_hash}'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
  <meta data-n="page-description" name="description" content="搜索 FindRSS 脚本，打开或复制 Raw 地址，查看最新巡检产物。">
  <title data-n="document-title">脚本市场 (Script Market) · FindRSS</title>
  <link data-n="site-favicon" rel="icon" type="image/svg+xml" href="${favicon_data_url}">
  <style data-n="market-styles">${market_styles}</style>
</head>
<body data-n="market-body">
  <div data-n="market-root">${render_market_page(data)}</div>
  <noscript data-n="javascript-notice"><p data-n="javascript-help">启用 JavaScript 后可搜索、复制脚本地址并查看巡检结果；也可直接打开文件路径。</p></noscript>
  <script data-n="market-data" type="application/json">${bootstrap}</script>
  <script data-n="market-controller">${market_client}</script>
</body>
</html>\n`;
}

if (import.meta.main) {
  const report = JSON.parse(await readFile(new URL("../reports/routes.json", import.meta.url), "utf8"));
  const { default: catalog } = await import("../dist/scripts.js");
  await writeFile(new URL("../reports/index.html", import.meta.url), render_report_html(report, catalog));
}
