import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { readFile } from "node:fs/promises";
import { route_report_model } from "../scripts/route_report_model.js";
import { render_report_html } from "../scripts/render_route_report.js";

const passed = { request: true, response: true, format_valid: true, output_valid: true, status: 200, duration_ms: 1200 };
const icon = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z"/></svg>';
const report = { checked_at: "2026-10-28T06:00:00.000Z", scripts: [
  { file: "rss/example.js", version: "1.2.3", platform: { icon } },
], results: [
  { ...passed, format: "hot", file: "hot/passed.js", path: "/api/hot/passed" },
  { ...passed, format: "rss", file: "rss/example.js", path: "/rss/example", format_valid: false, output_valid: false, error: "XML 格式错误" },
  { format: "hot", file: "hot/failed.js", path: "/api/hot/failed", request: false, response: false, format_valid: false, output_valid: false, status: 502, code: "UPSTREAM_FETCH_FAILED", error: "访问上游失败" },
  ...["atom", "clip", "detect", "html", "image"].map(format => ({ ...passed, format, file: "rss/example.js", path: "/" + format + "/example" })),
] };

test("HTML 页头 Logo 和 favicon 内嵌复制的品牌素材，单文件页面也能显示", async () => {
  const html = render_report_html(report);
  const logo = html.match(/<img data-n="project-logo" src="data:image\/svg\+xml;base64,([^"]+)"/)[1];
  const favicon = html.match(/<link data-n="site-favicon" rel="icon" type="image\/svg\+xml" href="data:image\/svg\+xml;base64,([^"]+)"/)[1];
  assert.deepEqual(Buffer.from(logo, "base64"), await readFile(new URL("../assets/brand/logo.svg", import.meta.url)));
  assert.deepEqual(Buffer.from(favicon, "base64"), await readFile(new URL("../assets/brand/favicon.svg", import.meta.url)));
});

test("报告 Model 按脚本聚合全部格式路由、失败优先，每条路由只有一个结果和原因", () => {
  const original = JSON.stringify(report);
  const model = route_report_model(report);
  assert.deepEqual([model.total, model.passed, model.failed, model.pass_rate], [8, 6, 2, 75]);
  assert.deepEqual(model.groups.map(group => group.name), ["rss/example.js", "hot/failed.js", "hot/passed.js"]);
  const rss = model.groups[0];
  assert.equal(rss.total, 6);
  assert.equal(rss.version, "1.2.3");
  assert.equal(Buffer.from(rss.icon_data_url.split(",")[1], "base64").toString(), icon);
  assert.deepEqual(rss.rows[0], { path: "/rss/example", ok: false, reason: "XML 格式错误" });
  assert.deepEqual(rss.rows[1], { path: "/atom/example", ok: true, reason: "" });
  assert.equal(model.groups[1].rows[0].reason, "UPSTREAM_FETCH_FAILED: 访问上游失败");
  assert.equal(JSON.stringify(report), original);
});

test("脚本市场用文件路径链接 Raw，图标复制地址，右上角版本与巡检弹窗入口，所有节点具有语义标识", () => {
  const html = render_report_html(report);
  assert.match(html, /脚本市场 \(Script Market\)/);
  assert.doesNotMatch(html, /data-n="market-title"|data-n="market-english-title"|data-n="market-introduction"|找到需要的脚本/);
  assert.match(html, /data-n="script-search"/);
  assert.equal([...html.matchAll(/<button data-n="script-tab"/g)].length, 4);
  assert.match(html, /role="tablist"/);
  assert.match(html, /data-n="market-toolbar"[\s\S]*?data-n="project-brand"[\s\S]*?<\/h1>\s*<div data-n="market-navigation"[\s\S]*?data-n="script-tabs"/);
  assert.match(html, /data-n="header-actions"[^>]*>\s*<span data-n="check-time">[\s\S]*?<\/time><\/span>\s*<button data-n="open-settings"/);
  assert.doesNotMatch(html, /data-n="market-header"|data-n="search-count"|\.header\s*\{/);
  assert.doesNotMatch(html, /data-n="search-metadata"|data-n="market-footer"|\.footer\s*\{|文件路径指向 master 分支的 Raw 脚本|产物来自最近一次巡检/);
  assert.match(html, /id="tab-rss"[^>]*aria-selected="true"[^>]*><span data-n="script-tab-label">RSS<\/span><span data-n="script-tab-count"[^>]*>1<\/span><\/button>/);
  assert.deepEqual([...html.matchAll(/<span data-n="script-tab-count"[^>]*>(\d+)<\/span>/g)].map(match => Number(match[1])), [1, 2, 0, 0]);
  assert.match(html, /data-n="script-panel"[^>]*role="tabpanel"[^>]*aria-labelledby="tab-rss"/);
  assert.equal([...html.matchAll(/<article data-n="script-card"/g)].length, 3);
  assert.equal([...html.matchAll(/<button data-n="copy-raw-url"/g)].length, 3);
  assert.equal([...html.matchAll(/<button data-n="inspect-script"/g)].length, 3);
  assert.match(html, /data-n="script-status-stack"[\s\S]*?data-n="script-version"[\s\S]*?data-n="inspect-script"/);
  assert.match(html, /<dialog data-n="inspection-dialog"/);
  assert.match(html, /<a data-n="script-raw-link"[^>]*href="https:\/\/raw.githubusercontent.com\/ltaoo\/findrss-scripts\/refs\/heads\/master\/rss\/example.js">rss\/example.js<\/a>/);
  assert.match(html, /<button data-n="copy-raw-url"[^>]*aria-label="复制 Raw 地址：rss\/example.js"[^>]*><svg/);
  assert.match(html, /data-n="script-metadata"[^>]*><span data-n="script-kind"[^>]*>订阅<\/span><a data-n="script-raw-link"/);
  assert.doesNotMatch(html, /copy-script-url|copy-script-source|script-actions|查看巡检与产物|巡检 JSON|巡检 Markdown/);
  assert.match(html, /2026年10月28日 14:00:00/);
  assert.match(html, /UPSTREAM_FETCH_FAILED/);
  assert.match(html, /版本：1\.2\.3/);
  assert.match(html, /data-n="script-icon"[^>]+src="data:image\/svg\+xml;base64,/);
  assert.match(html, /href="https:\/\/raw.githubusercontent.com\/ltaoo\/findrss-scripts\/refs\/heads\/master\/rss\/example.js"/);
  assert.doesNotMatch(html, /校验阶段|未检查|http-status|request-duration|check-stages|stages-heading/);
  assert.doesNotMatch(html, /href="routes\.(json|md)"/);
  assert.equal([...html.matchAll(/<details\b/g)].length, 0);
  assert.equal([...html.matchAll(/<img data-n="script-icon"/g)].length, 1);
  assert.equal([...html.matchAll(/<tr data-n="route-result"/g)].length, 8);
  assert.match(html, /<tr data-n="column-headings"><th data-n="title-heading"[^>]*>标题<\/th><th data-n="route-heading"/);
  for (const [row] of html.matchAll(/<tr data-n="route-result">[\s\S]*?<\/tr>/g)) {
    assert.match(row, /<tr[^>]*>\s*<th data-n="route-title" scope="row">[\s\S]*?<\/th>\s*<td data-n="route-identity"/);
  }
  for (const [, name, attributes] of html.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/g)) {
    assert.match(attributes, /\bdata-n="[a-z][a-z0-9_-]*"/, "缺少语义标识：" + name);
  }
  const [, client] = html.match(/<script data-n="market-controller">([\s\S]*?)<\/script>/);
  assert.match(html, new RegExp("script-src 'sha256-" + createHash("sha256").update(client).digest("base64").replace(/[+]/g, "\\+") + "'"));
  assert.doesNotThrow(() => new Function(client));
});

test("图标在 img 中隔离显示，元数据版本转义，无图标时不生成图片", () => {
  const unsafe_icon = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script></svg>';
  const html = render_report_html({ ...report, scripts: [
    { file: "rss/example.js", version: '<img src=x onerror="alert(1)">', platform: { icon: unsafe_icon } },
  ] });
  assert.doesNotMatch(html, /<script>alert|onload="|<img src=x/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.match(html, /img-src data:/);
  assert.equal([...html.matchAll(/<img data-n="script-icon"/g)].length, 1);
});

test("卡片优先显示 platform.name，巡检标题列显示路由名称并安全转义，包含未巡检路由", () => {
  const html = render_report_html({ results: ["rss", "atom"].map(format => ({
    ...passed, file: "rss/example.js", path: `/${format}/example/:id`, format,
  })) }, [
    { file: "rss/example.js", metadata: { name: "首条路由名称", kind: "rss", platform: { name: "平台 <名称>" }, routes: [
      { route_index: 0, path: "/example/:id", name: "发布 <列表> & 更新", example: "/example/42" },
    ] } },
    { file: "hot/untested.js", metadata: { kind: "hot", platform: { name: "未巡检平台" }, routes: [
      { route_index: 0, path: "/untested", name: "热榜排行", example: "/untested" },
    ] } },
  ]);
  assert.match(html, /<h2 data-n="script-title"[^>]*>平台 &lt;名称&gt;<\/h2>/);
  assert.doesNotMatch(html, /首条路由名称|<名称>|<列表>/);
  assert.match(html, /<th data-n="title-heading" scope="col">标题<\/th>/);
  assert.deepEqual([...html.matchAll(/<th data-n="route-title" scope="row">([^<]*)<\/th>/g)].map(match => match[1]),
    ["热榜排行", "发布 &lt;列表&gt; &amp; 更新", "发布 &lt;列表&gt; &amp; 更新"]);
  assert.match(render_report_html(report), /<th data-n="route-title" scope="row">\/rss\/example<\/th>/);
});

test("上游错误、文件名、路由和未知类型均转义，页面不嵌入整份原始数据", () => {
  const hostile = '</td><img src=x onerror="alert(1)"><script>alert(1)</script>';
  const html = render_report_html({ checked_at: '" onmouseover="alert(1)',
    token: "private-root-value", results: [{ ...report.results[2], format: hostile, file: hostile, path: hostile, code: hostile, error: hostile,
      example: "https://example.com/?token=private-query-value" }],
  });
  assert.doesNotMatch(html, /<img src=x|<script>alert|private-root-value|private-query-value/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.match(html, /default-src 'none'/);
});

test("空结果和全部通过有明确状态，空结果不产生 NaN 或 Infinity", () => {
  const empty = render_report_html({ results: [] });
  assert.match(empty, /没有匹配的脚本/);
  assert.match(empty, /未提供巡检时间/);
  assert.doesNotMatch(empty, /NaN|Infinity/);
  assert.match(render_report_html({ results: [{ ...passed, format: "rss", path: "/example", file: "rss/example.js" }] }), /巡检 1\/1 通过/);
  assert.throws(() => route_report_model(null), /results 数组/);
});

test("目录元数据安全转义，不将脚本源码或配置嵌入页面", () => {
  const source = 'export const private_source_marker = "</script><img src=x onerror=alert(1)>";';
  const title = 'Example </script><img src=x onerror=alert(1)>';
  const html = render_report_html({ ...report, token: "private-token" }, [
    { file: "rss/example.js", source, metadata: { name: title, kind: "rss", version: "1.2.3", platform: { icon }, config: "private-config" } },
    { file: "detect/untested.js", source: "export const kind = 'detect';", metadata: { name: "尚未巡检", kind: "detect" } },
  ]);
  assert.match(html, /Example &lt;\/script&gt;&lt;img/);
  assert.match(html, /尚未巡检/);
  assert.match(html, /暂无巡检结果/);
  assert.doesNotMatch(html, /private_source_marker|private-token|private-config|<img src=x/);
  assert.equal([...html.matchAll(/<script\b/g)].length, 1);
  const client = html.match(/<script data-n="market-controller">([\s\S]*?)<\/script>/)[1];
  const context = { document: { querySelector() {} } };
  runInNewContext(client.replace(/mount_market_view\(create_market_model\(/, "globalThis.market = create_market_model(")
    .replace(/, document\);$/, ";"), context);
  assert.equal(context.market.scripts.find(script => script.raw_url.endsWith("rss/example.js")).title, title);
  assert.ok(context.market.scripts.every(script => !("source" in script)));
});

test("通过样本在新窗口打开产物 Raw 链接，失败样本和不安全路径不生成链接", () => {
  const html = render_report_html({ results: [
    { ...passed, file: "rss/example.js", path: "/rss/example", format: "rss", output_file: "rss/example.xml" },
    { ...passed, file: "rss/example.js", path: "/samples", format: "hot", output_valid: false, samples: [
      { ...passed, output_file: "hot/a %20.json", example: "/?token=private-query-value" },
      { ...passed, output_valid: false, output_file: "hot/failed.json" },
      ...["../private.json", "/absolute.json", "a/../private.json", "a\\private.json", "a.json?secret=1"].map(output_file => ({ ...passed, output_file })),
    ] },
  ] });
  assert.match(html, /data-n="artifact-link" href="https:\/\/raw.githubusercontent.com\/ltaoo\/findrss-scripts\/refs\/heads\/route-reports\/reports\/responses\/rss\/example.xml" target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /responses\/hot\/a%20%2520.json"[^>]*>查看产物 1/);
  assert.equal([...html.matchAll(/<a data-n="artifact-link"/g)].length, 2);
  assert.doesNotMatch(html, /private-query-value|failed.json|private.json|absolute.json|secret=1/);
  assert.doesNotMatch(html, /<iframe|artifact-dialog|open_artifact/);
});

test("dev 产物使用本地 prefix，release 和旧报告使用 Raw prefix，路径均安全编码", () => {
  for (const mode of ["dev", "release", undefined]) {
    const html = render_report_html({ mode, results: [{ ...passed, file: "rss/example.js", path: "/example", samples: [
      { ...passed, output_file: "rss/测试 a %20(1).xml" },
      { ...passed, output_file: "../private.json" },
      { ...passed, output_valid: false, output_file: "failed.json" },
    ] }] });
    const prefix = mode === "dev" ? "./" : "https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/";
    assert.equal(html.match(/<a data-n="artifact-link" href="([^"]+)"/)[1],
      prefix + "responses/rss/%E6%B5%8B%E8%AF%95%20a%20%2520%281%29.xml");
    assert.equal([...html.matchAll(/<a data-n="artifact-link"/g)].length, 1);
    assert.doesNotMatch(html, /private.json|failed.json/);
  }
});

test("页头设置、动态路由配置与保存入口，未巡检路由仍可配置，私有样本不进入表单", () => {
  const html = render_report_html({ results: [{ ...passed, file: "clip/example.js", path: "/api/clip/example/:id",
    example: "/api/clip/example/private-id?token=private-token" }] }, [
    { file: "clip/example.js", metadata: { kind: "clip", routes: [
      { path: "/example/:id", example: "/example/public-id?url=https://example.com/", parameters: { id: "编号", url: "必填 URL" } },
    ] } },
    { file: "hot/new.js", metadata: { kind: "hot", routes: [{ path: "/new/:city?", example: "/new/上海" }] } },
  ]);
  for (const name of ["open-settings", "settings-dialog", "settings-base-url", "settings-token", "request-dialog", "request-form",
    "request-fields", "request-url", "request-curl"]) assert.match(html, new RegExp('data-n="' + name + '"'));
  assert.match(html, /保存示例/);
  assert.doesNotMatch(html, /调用配置|保存参数/);
  assert.equal([...html.matchAll(/<div data-n="route-examples"/g)].length, 2);
  assert.equal([...html.matchAll(/<svg data-n="add-example-icon"/g)].length, 2);
  assert.match(html, /aria-label="添加示例：/);
  assert.match(html, /未巡检/);
  assert.equal([...html.matchAll(/<button data-n="configure-route"/g)].length, 2);
  assert.doesNotMatch(html, /private-id|private-token/);
  assert.match(html, /public-id/);
});
