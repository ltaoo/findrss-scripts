import assert from "node:assert/strict";
import test from "node:test";
import { render_report } from "../scripts/route_report.js";

const passed = { file: "rss/github.js", path: "/rss/github/org/repo/release", format: "rss",
  request: true, response: true, format_valid: true, output_valid: true };

test("Markdown 按脚本聚合，展示图标、版本、Raw 链接和单个路由结果", () => {
  const markdown = render_report({ checked_at: "2026-10-28T06:00:00.000Z", scripts: [
    { file: passed.file, version: "1.2.3", platform: { icon: "<svg/>" } },
  ], results: [passed,
    { ...passed, path: "/rss/github/failed", request: false, response: false, format_valid: false,
      output_valid: false, code: "UPSTREAM_FETCH_FAILED", error: "请求失败" },
    { ...passed, format: "atom", path: "/atom/github/org/repo/release" },
  ] });
  assert.match(markdown, /^# 脚本路由巡检：2\/3 通过/);
  assert.match(markdown, /巡检时间：2026-10-28T06:00:00.000Z/);
  assert.match(markdown, /## rss\/github.js（2\/3 通过）/);
  assert.equal([...markdown.matchAll(/^## /gm)].length, 1);
  assert.match(markdown, /\[rss\/github.js\]\(https:\/\/raw.githubusercontent.com\/ltaoo\/findrss-scripts\/refs\/heads\/master\/rss\/github.js\)/);
  assert.match(markdown, /版本：1\.2\.3/);
  assert.match(markdown, /<img data-n="script-icon" src="https:\/\/raw.githubusercontent.com\/ltaoo\/findrss-scripts\/refs\/heads\/route-reports\/reports\/icons\/script-0.svg"/);
  assert.match(markdown, /\| 路由 \| 结果 \| 失败原因 \|/);
  assert.match(markdown, /\| \/rss\/github\/failed \| ❌ 失败 \| UPSTREAM\\_FETCH\\_FAILED: 请求失败 \|/);
  assert.match(markdown, /\| \/rss\/github\/org\/repo\/release \| ✅ 成功 \|  \|/);
  assert.doesNotMatch(markdown, /\| 请求 \||\| 响应 \||\| 格式 \||\| 输出 \||未检查/);
  assert.ok(markdown.indexOf("/rss/github/failed") < markdown.indexOf(passed.path));
});

test("Markdown 转义表格内容与链接，空报告有明确提示", () => {
  const markdown = render_report({ results: [{ ...passed, file: "hot/a [测试](1).js",
    path: "/a|b\n<script>", output_valid: false, error: "[link](bad)|<img>\r\nnext" }] });
  assert.ok(markdown.includes("/hot/a%20%5B%E6%B5%8B%E8%AF%95%5D%281%29.js)"));
  assert.match(markdown, /\/a&#124;b &lt;script&gt;/);
  assert.ok(markdown.includes("\\[link\\](bad)&#124;&lt;img&gt;  next"));
  assert.doesNotMatch(markdown, /<script>|<img>/);
  assert.doesNotMatch(markdown, /<img\b/);
  assert.match(markdown, /版本：—/);
  const empty = render_report({ results: [] });
  assert.match(empty, /0\/0 通过/);
  assert.match(empty, /巡检时间：未提供/);
  assert.match(empty, /本轮没有生成路由检查项/);
});
