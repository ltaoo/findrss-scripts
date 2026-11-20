import assert from "node:assert/strict";
import test from "node:test";
import { script_examples, example_key } from "../scripts/script_examples.js";
import { route_request_model, route_request_models } from "../scripts/route_request_model.js";
import { compile_script_module } from "findrss-worker/server/infra/script_sandbox.js";
import { read_script, script_names } from "./support/script_sources.js";
import { route_report_model } from "../scripts/route_report_model.js";
import { create_market_model } from "../scripts/script_market.js";
import { render_report_html } from "../scripts/render_route_report.js";

const file = "rss/example.js";
const path = "/api/rss/example/:id";
const configured = [
  { name: "第一位作者", example: "/api/rss/example/7?mode=a" },
  { name: "第二位作者", example: "/api/rss/example/7?mode=b" },
];
const report = { results: [{ file, path, output_valid: false, samples: [
  { name: "第二位作者", example: configured[1].example + "&token=private-token", output_valid: false, error: "HTTP 503", detail_file: "second.json" },
  { name: "第一位作者", example: configured[0].example, output_valid: true, output_file: "first.json", detail_file: "first.json" },
] }] };
const route = () => route_request_model(file, path, { path: "/example/:id", example: "/api/rss/example/42?mode=default", parameters: { mode: "模式" } });

test("所有 RSS 路由均声明可显示的默认实例名称，包括正文和媒体代理", async () => {
  for (const name of script_names("rss")) {
    const { error, metadata } = await compile_script_module(read_script("rss/" + name));
    assert.equal(error, "", name);
    for (const route of metadata.routes) assert.ok(route.example_name?.trim(), name + " " + route.path);
  }
});

test("脚本默认实例名称经沙箱和路由模型保留，旧巡检名称不覆盖当前名称", async () => {
  for (const [file, path, name] of [
    ["rss/zhihu.js", "/api/rss/zhihu/people/:user", "木子白"],
    ["rss/wxmp.js", "/api/rss/wxmp/:account?", "36氪"],
    ["rss/wxchannels.js", "/api/rss/wxchannels/:account", "富贵姨姨"],
  ]) {
    const { error, metadata } = await compile_script_module(read_script(file));
    assert.equal(error, "");
    const request = route_request_models([{ file, metadata }]).find(route => route.path === path);
    const examples = script_examples(request, [], [{ request_key: example_key(request.example), name: request.name, ok: true }]);
    assert.equal(examples.length, 1);
    assert.deepEqual([examples[0].source, examples[0].name, examples[0].ok], ["script", name, true]);
  }
  for (const example_name of [null, "", " ", 1, "a".repeat(129)]) {
    const compiled = await compile_script_module(`export const route = { name: "示例", path: "/example", example_name: ${JSON.stringify(example_name)}, handler() {} };`);
    assert.match(compiled.error, /route.example_name/);
  }
});

test("ScriptExample 以请求匹配状态和产物，保留默认实例和同路径的不同 query，不按结果顺序关联", () => {
  const request = route();
  const outputs = route_report_model(report).groups[0].rows[0].outputs;
  const examples = script_examples(request, configured, outputs);
  assert.deepEqual(examples.map(example => [example.source, example.name, example.values, example.ok]), [
    ["script", "42 · default", { id: "42", mode: "default" }, null],
    ["config", "第一位作者", { id: "7", mode: "a" }, true],
    ["config", "第二位作者", { id: "7", mode: "b" }, false],
  ]);
  assert.match(examples[1].artifact.url, /responses\/first.json$/);
  assert.match(examples[2].detail.url, /details\/second.json$/);
  assert.equal(examples[2].artifact, undefined);
  assert.equal(examples[2].reason, "HTTP 503");
  assert.doesNotMatch(JSON.stringify(examples), /private-token/);
  assert.equal(example_key("/same?b=2&a=1&token=secret"), example_key("/same?a=1&b=2"));
  const duplicate = script_examples(request, { name: "默认作者", example: request.example });
  assert.equal(duplicate.length, 1);
  assert.deepEqual([duplicate[0].name, duplicate[0].source], ["默认作者", "script"]);
});

test("配置实例点击回填名称和参数，另存手动实例；计数按实例区分成功、失败、未巡检并持久化名称", () => {
  const request = route();
  request.examples = script_examples(request, configured, route_report_model(report).groups[0].rows[0].outputs);
  const script = { routes: [request], inspection_rows: [{ request }] };
  const saved = new Map();
  const storage = { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) };
  const model = create_market_model([script], null, storage);
  assert.deepEqual(model.script_status(script), { total: 3, passed: 1, failed: 1 });
  const example = request.examples[1];
  assert.equal(model.delete_example(request.key, example.id), false);
  model.open_request(request.key, example.id);
  assert.equal(model.example_name, "第一位作者");
  assert.deepEqual(model.route_values, { id: "7", mode: "a" });
  model.set_example_name("我的作者");
  model.set_route_value("id", "8");
  assert.equal(model.save_request(), true);
  const manual = model.route_examples(request.key).at(-1);
  assert.deepEqual([manual.source, manual.name, manual.ok, manual.artifact], ["manual", "我的作者", null, undefined]);
  assert.deepEqual(model.script_status(script), { total: 4, passed: 1, failed: 1 });
  const restored = create_market_model([script], null, storage);
  restored.open_request(request.key, manual.id);
  assert.deepEqual([restored.example_name, restored.route_values.id], ["我的作者", "8"]);
  assert.equal(model.delete_example(request.key, manual.id), true);
  assert.deepEqual(model.script_status(script), { total: 3, passed: 1, failed: 1 });
});

test("每个 ScriptExample 一行且独立显示状态，标题路由纵向合并，Plus 位于产物列表头，链接不编号", () => {
  const html = render_report_html(report, [{ file, metadata: { kind: "rss", routes: [
    { route_index: 0, path: "/example/:id", name: "作者作品", example: "/example/42?mode=default", parameters: { mode: "模式" } },
  ] } }], { ["rss_json " + path]: configured });
  const markup = html.split('<script data-n="market-data"')[0];
  const rows = [...markup.matchAll(/<tr[^>]*data-n="example-result"[^>]*>([\s\S]*?)<\/tr>/g)].map(match => match[1]);
  assert.deepEqual([...markup.matchAll(/<th[^>]*data-n="([a-z]+)-heading"/g)].map(match => match[1]), ["title", "route", "output", "status"]);
  assert.equal(rows.length, 3);
  assert.match(rows[0], /data-n="route-title"[^>]*scope="rowgroup"[^>]*rowspan="3"/);
  assert.match(rows[0], />作者作品<\/th>/);
  assert.match(rows[0], /data-n="route-identity"[^>]*rowspan="3"/);
  assert.match(rows[0], /未巡检/);
  assert.doesNotMatch(rows[0].match(/<td[^>]*data-n="route-output"[\s\S]*?<\/td>/)[0], /未巡检/);
  assert.match(markup, /<th[^>]*data-n="output-heading"[^>]*>(?:(?!<\/th>)[\s\S])*data-n="configure-route"/);
  assert.equal([...markup.matchAll(/data-n="configure-route"/g)].length, 1);
  assert.doesNotMatch(rows.join(""), /data-n="configure-route"|data-n="example-toolbar"/);
  assert.doesNotMatch(rows[1] + rows[2], /data-n="route-title"|data-n="route-identity"/);
  assert.match(rows[1], /data-n="example-status"[\s\S]*成功/);
  assert.match(rows[1], /data-n="example-heading"[^>]*><button[^>]*data-n="open-example"[^>]*>第一位作者<\/button><a[^>]*data-n="artifact-link"[^>]*><svg[^>]*data-n="artifact-rss-icon"/);
  assert.match(rows[2], /data-n="example-status"[\s\S]*失败/);
  assert.match(rows[2], /data-n="example-status"[^>]*>[\s\S]*data-n="detail-link"[^>]*>失败<\/a><p[^>]*data-n="output-reason"[^>]*>HTTP 503<\/p><\/td>/);
  for (const row of rows) {
    assert.ok(row.indexOf('data-n="route-output"') < row.indexOf('data-n="example-status"'));
    assert.doesNotMatch(row.match(/<td[^>]*data-n="route-output"[\s\S]*?<\/td>/)[0], /data-n="detail-link"|data-n="output-reason"/);
  }
  assert.match(markup, /实例 1\/3 成功/);
  assert.doesNotMatch(markup, /查看详情 \d|查看产物 \d|private-token/);
});

test("表头统一添加实例，多路由脚本在表单内切换目标路由并使用对应默认参数", () => {
  const requests = [route(), route_request_model(file, "/api/rss/favorites/:id", { example: "/api/rss/favorites/99" })];
  const script = { id: "multi", routes: requests, inspection_rows: requests.map(request => ({ request })) };
  const model = create_market_model([script]);
  model.add_example(script.id);
  assert.equal(model.request.key, requests[0].key);
  assert.deepEqual(model.request_routes, requests);
  model.open_request(model.request_routes[1].key);
  assert.equal(model.request.key, requests[1].key);
  assert.equal(model.route_values.id, "99");
  model.add_example("missing");
  assert.equal(model.request.key, requests[1].key);
});
