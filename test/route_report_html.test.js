import assert from "node:assert/strict";
import test from "node:test";
import { route_report_model } from "../scripts/route_report_model.js";
import { render_report_html } from "../scripts/render_route_report.js";

const passed = { request: true, response: true, format_valid: true, output_valid: true, status: 200, duration_ms: 1200 };
const report = { checked_at: "2026-10-28T06:00:00.000Z", results: [
  { ...passed, format: "hot", file: "hot/passed.js", path: "/api/hot/passed" },
  { ...passed, format: "rss", file: "rss/example.js", path: "/rss/example", format_valid: false, output_valid: false, error: "XML 格式错误" },
  { format: "hot", file: "hot/failed.js", path: "/api/hot/failed", request: false, response: false, format_valid: false, output_valid: false, status: 502, code: "UPSTREAM_FETCH_FAILED", error: "访问上游失败" },
  ...["atom", "clip", "detect", "html", "image"].map(format => ({ ...passed, format, file: format + "/example.js", path: "/" + format + "/example" })),
] };

test("报告 Model 按类型归组、失败优先，后续未执行阶段不会被标为失败", () => {
  const original = JSON.stringify(report);
  const model = route_report_model(report);
  assert.deepEqual([model.total, model.passed, model.failed, model.pass_rate], [8, 6, 2, 75]);
  assert.deepEqual(model.groups.map(group => group.name), ["RSS", "Atom", "Hot", "Clip", "Detect", "正文", "图片"]);
  assert.deepEqual(model.groups[0].rows[0].stages.map(stage => stage.state), ["passed", "passed", "failed", "skipped"]);
  const hot = model.groups.find(group => group.name === "Hot");
  assert.equal(hot.rows[0].path, "/api/hot/failed");
  assert.deepEqual(hot.rows[0].stages.map(stage => stage.state), ["failed", "skipped", "skipped", "skipped"]);
  assert.equal(JSON.stringify(report), original);
});

test("HTML 展示完整检查详情并使用独立 Model，所有节点具有语义标识", () => {
  const html = render_report_html(report);
  assert.match(html, /2 条路由需要处理/);
  assert.match(html, /2026年10月28日 14:00:00/);
  assert.match(html, /75%/);
  assert.match(html, /UPSTREAM_FETCH_FAILED/);
  assert.match(html, /1\.20 s/);
  assert.match(html, /未检查/);
  assert.match(html, /href="routes\.json"/);
  assert.match(html, /href="routes\.md"/);
  assert.equal([...html.matchAll(/<details\b/g)].length, 7);
  assert.equal([...html.matchAll(/<tr data-n="route-result"/g)].length, 8);
  for (const [, name, attributes] of html.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/g)) {
    assert.match(attributes, /\bdata-n="[a-z][a-z0-9_-]*"/, "缺少语义标识：" + name);
  }
  assert.doesNotMatch(html, /<script\b/i);
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
