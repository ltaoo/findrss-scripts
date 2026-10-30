import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { route_report_model } from "./route_report_model.js";
import { create_market_model, mount_market_view } from "./script_market.js";
import { route_request_model, route_request_models } from "./route_request_model.js";

const escape = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
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
    search_text: [group.title, group.file, group.kind, kind_names[group.kind], ...group.rows.map(row => row.path)].join(" "),
    routes: [...request_map.values()].filter(route => route.file === group.file),
  }));
  const data = JSON.stringify(scripts).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  const client = `const create_market_model = ${create_market_model.toString()};
const mount_market_view = ${mount_market_view.toString()};
let storage;
try { storage = localStorage; } catch {}
mount_market_view(create_market_model(${data}, value => navigator.clipboard.writeText(value), storage), document);`;
  const script_hash = createHash("sha256").update(client).digest("base64");
  const rows = group => group.inspection_rows.map(row => `<tr data-n="route-result">
    <th data-n="route-title" scope="row">${escape(row.request?.name || row.path)}</th>
    <td data-n="route-identity"><code data-n="route-path">${escape(row.path)}</code>${row.request ? `<div data-n="route-actions" class="route-actions"><div data-n="route-examples" class="route-examples" data-route="${escape(row.request.key)}"></div><button data-n="configure-route" class="copy-icon add-example" type="button" data-route="${escape(row.request.key)}" aria-label="添加示例：${escape(row.path)}" title="添加示例"><svg data-n="add-example-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path data-n="add-example-icon-lines" d="M12 5v14M5 12h14"/></svg></button></div>` : ""}</td>
    <td data-n="route-status"><span data-n="status-label" class="status ${row.ok === null ? "unknown" : row.ok ? "passed" : "failed"}">${row.ok === null ? "未巡检" : row.ok ? "成功" : "失败"}</span></td>
    <td data-n="route-output">${(row.artifacts || []).map(artifact => `<a data-n="artifact-link" href="${escape(artifact.url)}" target="_blank" rel="noopener noreferrer">${escape(artifact.label)}</a>`).join(" ")}${escape(row.reason)}</td>
  </tr>`).join("\n");
  return `<!doctype html>
<html data-n="market-document" lang="zh-CN">
<head data-n="market-head">
  <meta data-n="document-charset" charset="utf-8">
  <meta data-n="viewport-settings" name="viewport" content="width=device-width, initial-scale=1">
  <meta data-n="content-policy" http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${script_hash}'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
  <meta data-n="page-description" name="description" content="搜索 FindRSS 脚本，打开或复制 Raw 地址，查看最新巡检产物。">
  <title data-n="document-title">脚本市场 (Script Market) · FindRSS</title>
  <link data-n="site-favicon" rel="icon" type="image/svg+xml" href="${favicon_data_url}">
  <style data-n="market-styles">
    :root {
      color-scheme: light dark;
      --ink: #202c3c; --muted: #59687a; --blue: #245ac6; --line: #dce2eb; --red: #a22c39; --green: #24674b;
      --background: #f5f7fa; --surface: #fff; --tint: #edf2fb; --tint-hover: #dce7fa; --kind-ink: #304c77;
      --input-line: #aab7ca; --button-line: #a8b8d2; --example-line: #c6d5ec;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --ink: #e3eaf4; --muted: #a6b4c7; --blue: #91b7ff; --line: #344155; --red: #ff9ca8; --green: #83d6ab;
        --background: #111823; --surface: #1b2533; --tint: #263650; --tint-hover: #32486b; --kind-ink: #b7cdf0;
        --input-line: #63758d; --button-line: #607593; --example-line: #4a6080;
      }
    }
    * { box-sizing: border-box; }
    [hidden] { display: none !important; }
    html { scrollbar-width: none; }
    html::-webkit-scrollbar { display: none; }
    body { margin: 0; color: var(--ink); background: var(--background); font: 15px/1.6 "Avenir Next", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; }
    a { color: var(--blue); text-underline-offset: .2em; }
    button, input { font: inherit; }
    button, a, input { -webkit-tap-highlight-color: transparent; }
    :focus-visible { outline: 3px solid var(--blue); outline-offset: 4px; }
    button { cursor: pointer; }
    button:disabled { cursor: not-allowed; opacity: .5; }
    .skip { position: absolute; top: -80px; left: 20px; padding: 8px 16px; background: var(--surface); z-index: 5; }
    .skip:focus { top: 12px; }
    .page { max-width: 1440px; padding: 40px 32px 24px; margin: auto; }
    .toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; }
    .brand { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 18px; font-weight: 750; color: var(--blue); }
    .settings-button { width: 40px; height: 40px; }
    .navigation { display: flex; align-items: center; gap: 12px; margin-right: auto; }
    .tabs { display: flex; gap: 8px; }
    .tab-count { font-size: 12px; }
    .header-actions { display: flex; align-items: center; gap: 12px; margin-left: auto; max-width: 100%; color: var(--muted); font-size: 13px; }
    .tab { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 48px; padding: 10px 20px; border: 0; border-bottom: 3px solid transparent; color: var(--muted); background: transparent; font-weight: 650; }
    .tab:hover { color: var(--blue); }
    .tab[aria-selected="true"] { color: var(--blue); border-bottom-color: var(--blue); }
    .search-area { margin: 20px 0; }
    .search { width: 100%; min-height: 52px; padding: 12px 16px; color: var(--ink); background: var(--surface); border: 1px solid var(--input-line); border-radius: 8px; font-size: 16px; }
    .search::placeholder { color: var(--muted); }
    .catalog { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; align-items: start; }
    .card { min-width: 0; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; }
    .card-body { padding: 18px; }
    .script-heading { display: flex; gap: 10px; align-items: flex-start; }
    .icon { display: grid; place-items: center; width: 44px; height: 44px; flex-shrink: 0; background: var(--background); border-radius: 10px; }
    .script-icon { width: 32px; height: 32px; object-fit: contain; }
    .icon-fallback { font-size: 24px; font-weight: 650; color: var(--muted); }
    .script-identity { min-width: 0; flex: 1; }
    h2 { margin: 0; font-size: 17px; font-weight: 650; overflow-wrap: anywhere; }
    .metadata { display: flex; gap: 8px; align-items: center; margin-top: 10px; font-size: 12px; }
    .kind { display: inline-block; flex-shrink: 0; padding: 2px 8px; border-radius: 4px; color: var(--kind-ink); background: var(--tint); }
    .script-status-stack { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; gap: 3px; }
    .script-version { font-size: 12px; line-height: 26px; color: var(--muted); }
    .inspection-trigger { padding: 3px 0 3px 6px; border: 0; background: transparent; font-size: 12px; white-space: nowrap; }
    .inspection-trigger:hover { text-decoration: underline; text-underline-offset: .2em; }
    .raw-link { min-width: 0; overflow-wrap: anywhere; font-size: 13px; }
    .copy-icon { display: inline-grid; place-items: center; flex-shrink: 0; width: 32px; height: 32px; padding: 6px; border: 0; border-radius: 5px; background: transparent; color: var(--muted); }
    .copy-icon:hover { color: var(--blue); background: var(--tint); }
    .button { min-height: 42px; padding: 8px 16px; border: 1px solid var(--button-line); border-radius: 6px; color: var(--blue); background: var(--surface); font-weight: 600; }
    .button:hover { background: var(--tint); }
    .status.passed { color: var(--green); }
    .status.failed { color: var(--red); }
    .status.unknown { color: var(--muted); }
    .route-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .route-examples { display: contents; }
    .add-example { border: 1px dashed var(--button-line); color: var(--blue); }
    .saved-example { display: inline-flex; align-items: center; max-width: 100%; border: 1px solid var(--example-line); border-radius: 6px; background: var(--tint); }
    .saved-example button { min-height: 32px; padding: 4px 8px; border: 0; background: transparent; color: var(--blue); font-size: 12px; }
    .saved-example button:first-child { min-width: 0; max-width: 220px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    .saved-example button:last-child { flex-shrink: 0; border-left: 1px solid var(--example-line); font-size: 18px; line-height: 1; }
    .saved-example button:hover { background: var(--tint-hover); }
    .table-scroll { flex: 1; min-height: 0; overflow: auto; }
    .table-scroll:focus-visible { outline-offset: -3px; }
    table { width: 100%; min-width: 640px; border-collapse: collapse; font-size: 13px; text-align: left; }
    th, td { padding: 10px 16px; border: 1px solid var(--line); vertical-align: top; }
    thead th { position: sticky; top: 0; z-index: 1; box-shadow: 0 1px var(--line); color: var(--muted); font-weight: 500; background: var(--background); }
    tbody th { font-weight: 400; min-width: 170px; overflow-wrap: anywhere; }
    td { overflow-wrap: anywhere; }
    td[data-n="route-status"] { white-space: nowrap; }
    a[data-n="artifact-link"] { display: inline-block; margin: 0 8px 4px 0; white-space: nowrap; }
    code { font: 12px/1.7 ui-monospace, "SFMono-Regular", Consolas, monospace; }
    .empty-state { padding: 32px 0; color: var(--muted); }
    .feedback { position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%); max-width: calc(100% - 32px); margin: 0; padding: 10px 18px; border-radius: 8px; color: var(--surface); background: var(--ink); box-shadow: 0 4px 18px #202c3c26; z-index: 2; }
    .feedback:empty { display: none; }
    dialog { width: min(1000px, calc(100% - 32px)); max-height: calc(100dvh - 48px); padding: 24px; border: 1px solid var(--line); border-radius: 12px; color: var(--ink); background: var(--surface); }
    dialog::backdrop { background: #202c3c80; }
    .inspection-dialog { height: min(720px, calc(100dvh - 48px)); padding: 0; overflow: hidden; }
    .inspection-dialog[open] { display: flex; flex-direction: column; }
    .inspection-dialog > .inspection-header { flex-shrink: 0; margin: 0; padding: 24px; }
    .inspection-dialog > .form-status { flex-shrink: 0; margin: 0; padding: 0 24px 16px; }
    [data-n="inspection-results"] { display: flex; flex-direction: column; flex: 1; min-height: 0; }
    [data-n="empty-inspection"] { margin: 0; padding: 24px; }
    .inspection-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 16px; }
    .inspection-header > .button { flex-shrink: 0; white-space: nowrap; }
    .inspection-title { font-size: 18px; }
    .settings-dialog { max-width: 520px; }
    .form-field { display: grid; gap: 6px; margin: 0 0 18px; }
    .form-label { font-weight: 600; overflow-wrap: anywhere; }
    .form-input { width: 100%; min-width: 0; min-height: 42px; padding: 8px 12px; border: 1px solid var(--input-line); border-radius: 6px; color: var(--ink); background: var(--surface); }
    .form-help, .form-status { color: var(--muted); font-size: 13px; overflow-wrap: anywhere; }
    .form-status:empty { display: none; }
    .form-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 16px; }
    .request-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 0 18px; }
    .request-output { margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--line); }
    .request-output h3 { margin: 0 0 8px; font-size: 15px; }
    .command { white-space: pre-wrap; overflow-wrap: anywhere; margin: 0; padding: 14px; border-radius: 6px; background: var(--background); font: 13px/1.65 ui-monospace, "SFMono-Regular", Consolas, monospace; }
    @media (max-width: 760px) { .page { padding: 24px 16px; } .navigation { order: 1; width: 100%; flex-wrap: wrap; } .tabs { flex: 1; gap: 4px; } .tab { flex: 1; padding: 10px 6px; } .catalog { grid-template-columns: 1fr; } .card-body { padding: 20px; } }
    @media (prefers-reduced-motion: no-preference) { button { transition: background-color .12s ease; } }
  </style>
</head>
<body data-n="market-body">
  <a data-n="skip-to-scripts" class="skip" href="#scripts">跳转到脚本列表</a>
  <div data-n="market-page" class="page">
    <div data-n="market-toolbar" class="toolbar">
      <h1 data-n="project-brand" class="brand"><img data-n="project-logo" src="${logo_data_url}" alt="" width="36" height="36"><span data-n="project-name">FindRSS</span></h1>
      <div data-n="market-navigation" class="navigation">
      <div data-n="script-tabs" class="tabs" role="tablist" aria-label="脚本类型">${[["rss", "RSS"], ["hot", "Hot"], ["clip", "Clip"], ["detect", "Detect"]].map(([kind, label]) => `<button data-n="script-tab" class="tab" id="tab-${kind}" type="button" role="tab" data-kind="${kind}" aria-selected="${kind === "rss"}" aria-controls="script-panel" tabindex="${kind === "rss" ? 0 : -1}"><span data-n="script-tab-label">${label}</span><span data-n="script-tab-count" class="kind tab-count">${groups.filter(group => group.kind === kind).length}</span></button>`).join("")}</div>
      </div>
      <div data-n="header-actions" class="header-actions">
      <span data-n="check-time">最近巡检：<time data-n="checked-at" datetime="${escape(model.checked_at || "")}">${escape(checked)}</time></span>
      <button data-n="open-settings" class="copy-icon settings-button" type="button" aria-label="设置" title="设置"><svg data-n="settings-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true" focusable="false"><path data-n="settings-icon-gear" d="m9 3-.6 2.3-1.5.9-2.3-.6-3 5.2 1.7 1.7v1.8L1.6 16l3 5.2 2.3-.6 1.5.9L9 24h6l.6-2.5 1.5-.9 2.3.6 3-5.2-1.7-1.7v-1.8l1.7-1.7-3-5.2-2.3.6-1.5-.9L15 3Z" transform="translate(1 0) scale(.92 .85)"></path><circle data-n="settings-icon-center" cx="12" cy="11.5" r="3"></circle></svg></button>
      </div>
    </div>
    <section data-n="market-search" class="search-area" aria-label="搜索脚本">
      <input data-n="script-search" class="search" id="script-search" type="search" aria-label="搜索脚本" placeholder="搜索名称、文件路径、类型或路由，例如 GitHub、热榜、rss" autocomplete="off" aria-controls="scripts">
    </section>
    <main data-n="script-catalog" id="scripts">
      <div data-n="script-panel" id="script-panel" role="tabpanel" aria-labelledby="tab-rss" tabindex="0">
      <div data-n="script-list" class="catalog">
        ${groups.map(group => `<article data-n="script-card" class="card" id="${group.id}" aria-labelledby="${group.id}-title"${group.kind === "rss" ? "" : " hidden"}>
          <div data-n="script-card-body" class="card-body">
            <div data-n="script-heading" class="script-heading"><div data-n="script-icon-container" class="icon">${group.icon_data_url ? `<img data-n="script-icon" class="script-icon" src="${escape(group.icon_data_url)}" alt="" width="32" height="32">` : `<span data-n="script-icon-fallback" class="icon-fallback" aria-hidden="true">${escape(group.title.slice(0, 1))}</span>`}</div><div data-n="script-identity" class="script-identity"><h2 data-n="script-title" id="${group.id}-title">${escape(group.title)}</h2></div><div data-n="script-status-stack" class="script-status-stack"><span data-n="script-version" class="script-version" aria-label="版本：${escape(group.version)}">v${escape(group.version)}</span><button data-n="inspect-script" class="inspection-trigger status ${group.failed ? "failed" : group.total ? "passed" : ""}" type="button" data-script="${group.id}" aria-label="${escape(group.title)} 巡检结果与产物">${!group.total ? "暂无巡检结果" : `巡检 ${group.total - group.failed}/${group.total} 通过`}</button></div></div>
            <div data-n="script-metadata" class="metadata"><span data-n="script-kind" class="kind">${escape(kind_names[group.kind] || group.kind)}</span><a data-n="script-raw-link" class="raw-link" href="${escape(group.raw_url)}">${escape(group.file)}</a><button data-n="copy-raw-url" class="copy-icon" type="button" data-script="${group.id}" aria-label="复制 Raw 地址：${escape(group.file)}" title="复制 Raw 地址"><svg data-n="copy-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect data-n="copy-icon-front" x="8" y="8" width="13" height="13" rx="2"></rect><path data-n="copy-icon-back" d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"></path></svg></button></div>
          </div>
        </article>`).join("\n")}
      </div>
      <p data-n="empty-search" class="empty-state"${groups.some(group => group.kind === "rss") ? " hidden" : ""}>当前分类没有匹配的脚本，请切换分类、尝试其他关键词或清空搜索。</p>
      </div>
      <noscript data-n="javascript-notice"><p data-n="javascript-help">启用 JavaScript 后可搜索、复制脚本地址并查看巡检结果；也可直接打开文件路径。</p></noscript>
    </main>
    <p data-n="copy-feedback" class="feedback" role="status" aria-live="polite"></p>
  </div>
  <dialog data-n="inspection-dialog" class="inspection-dialog" aria-labelledby="inspection-title">
    <div data-n="inspection-header" class="inspection-header"><h2 data-n="inspection-title" class="inspection-title" id="inspection-title">巡检结果</h2><button data-n="close-inspection" class="button" type="button">关闭</button></div>
    <p data-n="inspection-status" class="form-status" role="alert"></p>
    ${groups.map(group => `<section data-n="inspection-results" data-script="${group.id}" hidden>${group.inspection_rows.length ? `<div data-n="table-scroll-container" class="table-scroll" role="region" aria-label="${escape(group.title)} 巡检详情" tabindex="0"><table data-n="results-table"><thead data-n="results-head"><tr data-n="column-headings"><th data-n="title-heading" scope="col">标题</th><th data-n="route-heading" scope="col">路由</th><th data-n="status-heading" scope="col">结果</th><th data-n="output-heading" scope="col">产物 / 失败原因</th></tr></thead><tbody data-n="results-rows">${rows(group)}</tbody></table></div>` : '<p data-n="empty-inspection">暂无巡检结果。</p>'}</section>`).join("\n")}
  </dialog>
  <dialog data-n="request-dialog" aria-labelledby="request-title">
    <div data-n="request-header" class="inspection-header"><h2 data-n="request-title" class="inspection-title" id="request-title">添加示例</h2><button data-n="close-request" class="button" type="button">关闭</button></div>
    <form data-n="request-form" novalidate>
      <div data-n="request-fields" class="request-fields"></div>
      <div data-n="request-actions" class="form-actions"><button data-n="save-request" class="button" type="submit">保存示例</button><button data-n="request-settings" class="button" type="button">设置 baseURL / token</button></div>
      <p data-n="request-status" class="form-status" role="status"></p>
    </form>
    <section data-n="request-url-section" class="request-output"><h3 data-n="request-url-title">GET URL</h3><pre data-n="request-url" class="command"></pre><div data-n="request-url-actions" class="form-actions"><button data-n="copy-request-url" class="button" type="button" data-request-copy="url">复制 URL</button><a data-n="open-request-url" target="_blank" rel="noopener noreferrer" hidden>打开 URL</a></div></section>
    <section data-n="request-curl-section" class="request-output"><h3 data-n="request-curl-title">POST curl</h3><pre data-n="request-curl" class="command"></pre><div data-n="request-curl-actions" class="form-actions"><button data-n="copy-request-curl" class="button" type="button" data-request-copy="curl">复制 curl</button></div></section>
  </dialog>
  <dialog data-n="settings-dialog" class="settings-dialog" aria-labelledby="settings-title">
    <div data-n="settings-header" class="inspection-header"><h2 data-n="settings-title" class="inspection-title" id="settings-title">设置</h2><button data-n="close-settings" class="button" type="button">关闭</button></div>
    <form data-n="settings-form" novalidate>
      <label data-n="settings-base-url-field" class="form-field" for="settings-base-url"><span data-n="settings-base-url-label" class="form-label">baseURL</span><input data-n="settings-base-url" class="form-input" id="settings-base-url" type="url" placeholder="http://localhost:8801" autocomplete="url" required></label>
      <label data-n="settings-token-field" class="form-field" for="settings-token"><span data-n="settings-token-label" class="form-label">token</span><input data-n="settings-token" class="form-input" id="settings-token" type="password" autocomplete="off" spellcheck="false"></label>
      <p data-n="settings-storage-help" class="form-help">设置与路由参数仅保存在当前浏览器。</p>
      <p data-n="settings-error" class="form-status" role="alert"></p>
      <div data-n="settings-actions" class="form-actions"><button data-n="save-settings" class="button" type="submit">保存设置</button></div>
    </form>
  </dialog>
  <script data-n="market-controller">${client}</script>
</body>
</html>\n`;
}

if (import.meta.main) {
  const report = JSON.parse(await readFile(new URL("../reports/routes.json", import.meta.url), "utf8"));
  const { default: catalog } = await import("../dist/scripts.js");
  await writeFile(new URL("../reports/index.html", import.meta.url), render_report_html(report, catalog));
}
