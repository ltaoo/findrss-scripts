import assert from "node:assert/strict";
import test from "node:test";
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

test("HTML 按脚本展示图标、版本、Raw 链接与简化结果，所有节点具有语义标识", () => {
  const html = render_report_html(report);
  assert.match(html, /2 条路由需要处理/);
  assert.match(html, /2026年10月28日 14:00:00/);
  assert.match(html, /75%/);
  assert.match(html, /UPSTREAM_FETCH_FAILED/);
  assert.match(html, /版本：1\.2\.3/);
  assert.match(html, /data-n="script-icon"[^>]+src="data:image\/svg\+xml;base64,/);
  assert.match(html, /href="https:\/\/raw.githubusercontent.com\/ltaoo\/findrss-scripts\/refs\/heads\/master\/rss\/example.js"/);
  assert.doesNotMatch(html, /校验阶段|未检查|http-status|request-duration|check-stages|stages-heading/);
  assert.match(html, /href="routes\.json"/);
  assert.match(html, /href="routes\.md"/);
  assert.equal([...html.matchAll(/<details\b/g)].length, 3);
  assert.equal([...html.matchAll(/<img\b/g)].length, 1);
  assert.equal([...html.matchAll(/<tr data-n="route-result"/g)].length, 8);
  for (const [, name, attributes] of html.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/g)) {
    assert.match(attributes, /\bdata-n="[a-z][a-z0-9_-]*"/, "缺少语义标识：" + name);
  }
  assert.doesNotMatch(html, /<script\b/i);
});

test("图标在 img 中隔离显示，元数据版本转义，无图标时不生成图片", () => {
  const unsafe_icon = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script></svg>';
  const html = render_report_html({ ...report, scripts: [
    { file: "rss/example.js", version: '<img src=x onerror="alert(1)">', platform: { icon: unsafe_icon } },
  ] });
  assert.doesNotMatch(html, /<svg\b|<script\b|onload="|<img src=x/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.match(html, /img-src data:/);
  assert.equal([...html.matchAll(/<img\b/g)].length, 1);
});

test("上游错误、文件名、路由和未知类型均转义，页面不嵌入整份原始数据", () => {
  const hostile = '</td><img src=x onerror="alert(1)"><script>alert(1)</script>';
  const html = render_report_html({ checked_at: '" onmouseover="alert(1)',
    token: "private-root-value", results: [{ ...report.results[2], format: hostile, file: hostile, path: hostile, code: hostile, error: hostile,
      example: "https://example.com/?token=private-query-value" }],
  });
  assert.doesNotMatch(html, /<img\b|<script\b|private-root-value|private-query-value/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.match(html, /default-src 'none'/);
});

test("空结果和全部通过有明确状态，空结果不产生 NaN 或 Infinity", () => {
  const empty = render_report_html({ results: [] });
  assert.match(empty, /暂无巡检结果/);
  assert.match(empty, /未提供巡检时间/);
  assert.doesNotMatch(empty, /NaN|Infinity/);
  assert.match(render_report_html({ results: [{ ...passed, format: "rss", path: "/example", file: "rss/example.js" }] }), /全部路由校验通过/);
  assert.throws(() => route_report_model(null), /results 数组/);
});
