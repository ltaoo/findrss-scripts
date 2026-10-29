import assert from "node:assert/strict";
import test from "node:test";
import { create_market_model } from "../scripts/script_market.js";
import { route_request_model, route_request_models } from "../scripts/route_request_model.js";
import { execFileSync } from "node:child_process";

const scripts = [
  { id: "github", title: "GitHub", kind: "rss", raw_url: "https://raw.githubusercontent.com/example/github.js",
    search_text: "GitHub 订阅 rss/github.js rss /rss/github/:owner" },
  { id: "hot", title: "热榜", kind: "hot", raw_url: "https://raw.githubusercontent.com/example/hot.js",
    search_text: "热榜 hot/example.js hot /api/hot/example" },
];

test("市场搜索忽略大小写及首尾空白，支持名称、类型、文件、路由和多个关键词", () => {
  const model = create_market_model(scripts);
  assert.deepEqual(model.visible_ids, ["github"]);
  for (const query of [" GitHub ", "订阅", "rss/github.js", "/rss/github/:owner", "github RSS"]) {
    model.search(query);
    assert.deepEqual(model.visible_ids, ["github"]);
  }
  model.select_kind("hot");
  model.search("热榜");
  assert.deepEqual(model.visible_ids, ["hot"]);
  model.search("unknown");
  assert.deepEqual(model.visible_ids, []);
  model.search("  ");
  assert.equal(model.visible_ids.length, 1);
});

test("四个分类默认 RSS，与搜索组合筛选并保留关键词，支持键盘循环切换", () => {
  const model = create_market_model([...scripts,
    { id: "clip", kind: "clip", search_text: "GitHub 剪藏" },
    { id: "detect", kind: "detect", search_text: "GitHub 监测" },
  ]);
  assert.equal(model.kind, "rss");
  for (const kind of model.kinds) {
    model.select_kind(kind);
    assert.deepEqual(model.visible_ids, [kind === "rss" ? "github" : kind]);
    assert.equal(model.kind_scripts.length, 1);
  }
  model.search("github");
  model.select_kind("hot");
  assert.deepEqual(model.visible_ids, []);
  model.select_kind("clip");
  assert.equal(model.query, "github");
  assert.deepEqual(model.visible_ids, ["clip"]);
  model.select_kind("invalid");
  assert.equal(model.kind, "clip");
  for (const [key, kind] of [["Home", "rss"], ["ArrowLeft", "detect"], ["ArrowRight", "rss"], ["End", "detect"]]) {
    assert.equal(model.move_tab(key), true);
    assert.equal(model.kind, kind);
  }
  assert.equal(model.move_tab("Tab"), false);
  const empty = create_market_model(scripts);
  empty.select_kind("clip");
  assert.deepEqual(empty.visible_ids, []);
});

test("复制 Raw 地址，Toast 自动关闭且连续复制重新计时，失败反馈也自动关闭", async t => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const copied = [];
  const model = create_market_model(scripts, async value => copied.push(value));
  const pending = model.copy("github");
  assert.equal(model.copying, true);
  await model.copy("hot");
  await pending;
  assert.equal(model.copying, false);
  assert.equal(model.message, "已复制脚本地址");
  t.mock.timers.tick(2499);
  assert.equal(model.message, "已复制脚本地址");
  await model.copy("hot");
  t.mock.timers.tick(1);
  assert.equal(model.message, "已复制脚本地址");
  t.mock.timers.tick(2499);
  assert.equal(model.message, "");
  assert.equal(model.message_timer, null);
  assert.deepEqual(copied, [scripts[0].raw_url, scripts[1].raw_url]);
  await model.copy("missing");
  assert.equal(copied.length, 2);
  const denied = create_market_model(scripts, async () => { throw new Error("NotAllowedError"); });
  await denied.copy("github");
  assert.match(denied.message, /复制失败/);
  assert.equal(denied.copying, false);
  t.mock.timers.tick(2500);
  assert.equal(denied.message, "");
});

test("巡检弹窗按脚本选择结果并可关闭，无效脚本不会打开弹窗", () => {
  const model = create_market_model(scripts);
  model.inspect("github");
  assert.equal(model.inspection, scripts[0]);
  model.close_inspection();
  assert.equal(model.inspection, null);
  model.inspect("missing");
  assert.equal(model.inspection, null);
});

const memory_storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
};
const request_routes = [
  route_request_model("rss/example.js", "/rss/example/:id{[0-9]+}/:city?", {
    example: "/rss/example/123/%E4%B8%8A%E6%B5%B7?limit=10", parameters: { id: "编号", city: "城市", limit: "条数", search: "搜索词" },
  }),
  route_request_model("rss/example.js", "/atom/example/:id", { example: "/atom/example/456" }),
  route_request_model("clip/example.js", "/api/clip/example/:id", { example: "/api/clip/example/789" }),
];
const request_scripts = request_routes.map((route, index) => ({ ...scripts[0], id: String(index), routes: [route] }));

test("设置保存到 localStorage，取消不修改配置，校验地址及 token 并处理存储不可用", () => {
  const storage = memory_storage();
  const model = create_market_model(request_scripts, null, storage);
  model.open_settings();
  model.set_setting("baseURL", " https://worker.example/prefix/ ");
  model.set_setting("token", " test-token ");
  assert.equal(model.save_settings(), true);
  assert.deepEqual(model.settings, { baseURL: "https://worker.example/prefix", token: "test-token" });
  assert.deepEqual(create_market_model([], null, storage).settings, model.settings);
  model.open_settings();
  model.set_setting("token", "discarded");
  model.close_settings();
  model.open_settings();
  assert.equal(model.settings_draft.token, "test-token");
  for (const value of ["", "javascript:alert(1)", "https://user:pass@example.com", "https://example.com/?token=x", "https://example.com/#hash"]) {
    model.set_setting("baseURL", value);
    assert.equal(model.save_settings(), false, value);
    assert.equal(model.settings.token, "test-token");
  }
  model.set_setting("baseURL", "http://localhost:8801");
  model.set_setting("token", "bad\r\nheader");
  assert.equal(model.save_settings(), false);
  const unavailable = create_market_model([], null, { getItem() { throw Error(); }, setItem() { throw Error(); } });
  unavailable.set_setting("baseURL", "http://localhost:8801");
  assert.equal(unavailable.save_settings(), false);
  assert.match(unavailable.settings_error, /localStorage/);
  assert.deepEqual(create_market_model([], null, { getItem: () => "[broken" }).settings, { baseURL: "", token: "" });
});

test("示例按脚本和路由分别保存，刷新回填，未保存修改不覆盖存储，新参数保留默认值", () => {
  const storage = memory_storage();
  let model = create_market_model(request_scripts, null, storage);
  for (const [index, route] of request_routes.entries()) {
    model.open_request(route.key);
    model.set_route_value("id", String(100 + index));
    model.set_route_value("unknown", "ignored");
    assert.equal(model.save_request(), true);
  }
  model.set_route_value("id", "999");
  model = create_market_model(request_scripts, null, storage);
  for (const [index, route] of request_routes.entries()) {
    model.open_request(route.key, model.saved_parameters[route.key][0].id);
    assert.equal(model.route_values.id, String(100 + index));
    assert.equal(model.route_values.unknown, undefined);
  }
  model.open_request(request_routes[0].key, model.saved_parameters[request_routes[0].key][0].id);
  assert.equal(model.route_values.city, "上海");
  model.set_route_value("id", "not-a-number");
  assert.equal(model.save_request(), false);
  model.open_request(request_routes[0].key, model.saved_parameters[request_routes[0].key][0].id);
  assert.equal(model.route_values.id, "100");
  const expanded = { ...request_routes[0], fields: [...request_routes[0].fields, { name: "new", in: "query", value: "default" }] };
  model = create_market_model([{ routes: [expanded] }], null, storage);
  model.open_request(expanded.key, model.saved_parameters[expanded.key][0].id);
  assert.equal(model.route_values.new, "default");
  const unavailable = create_market_model(request_scripts);
  unavailable.open_request(request_routes[0].key);
  assert.equal(unavailable.save_request(), false);
  assert.match(unavailable.request_status, /localStorage/);
});

test("Plus 新建多个示例，打开后修改原示例，删除持久化且保留其他脚本和路由", () => {
  const storage = memory_storage();
  const same_path = { ...request_routes[0], file: "rss/other.js", key: JSON.stringify(["rss/other.js", request_routes[0].path]) };
  const scripts = [...request_scripts, { routes: [same_path] }];
  let model = create_market_model(scripts, null, storage);
  const key = request_routes[0].key;
  for (const id of ["111", "222"]) {
    model.open_request(key);
    assert.equal(model.route_values.id, "123", "Plus 始终使用公开默认值");
    model.set_route_value("id", id);
    assert.equal(model.save_request(), true);
    assert.equal(model.save_request(), true, "同一表单重复保存更新当前示例");
  }
  assert.equal(model.route_examples(key).length, 2);
  const [first, second] = model.route_examples(key);
  model.open_request(key, first.id);
  model.set_route_value("id", "333");
  model.save_request();
  assert.match(model.route_examples(key)[0].label, /^333/);
  model.open_request(same_path.key);
  model.save_request();
  model.open_request(request_routes[1].key);
  model.save_request();
  model = create_market_model(scripts, null, storage);
  model.open_request(key, first.id);
  assert.equal(model.route_values.id, "333");
  assert.equal(model.delete_example(key, first.id), true);
  assert.equal(model.request, null);
  assert.equal(model.delete_example(key, first.id), false);
  assert.equal(model.delete_example(key, second.id), true);
  model = create_market_model(scripts, null, storage);
  assert.deepEqual(model.route_examples(key), []);
  assert.equal(model.route_examples(same_path.key).length, 1);
  assert.equal(model.route_examples(request_routes[1].key).length, 1);
  model.open_request(key, "deleted");
  assert.equal(model.request, null);
});

test("兼容旧单组参数，不丢失历史值；保存或删除失败时保留原数据", () => {
  const storage = memory_storage();
  const key = request_routes[0].key;
  storage.setItem("findrss.script-market.parameters", JSON.stringify({ [key]: { id: "999", city: "杭州" }, bad: null }));
  const model = create_market_model(request_scripts, null, storage);
  assert.equal(model.route_examples(key).length, 1);
  model.open_request(key, model.route_examples(key)[0].id);
  assert.equal(model.route_values.id, "999");
  assert.equal(model.route_values.city, "杭州");
  model.set_route_value("id", "888");
  model.save_request();
  assert.equal(model.route_examples(key).length, 1);
  assert.equal(create_market_model(request_scripts, null, storage).route_examples(key)[0].values.id, "888");
  storage.setItem = () => { throw Error("QuotaExceededError"); };
  model.set_route_value("id", "777");
  assert.equal(model.save_request(), false);
  assert.equal(model.route_examples(key)[0].values.id, "888");
  assert.equal(model.delete_example(key, model.route_examples(key)[0].id), false);
  assert.match(model.inspection_status, /无法删除/);
  assert.equal(model.route_examples(key).length, 1);
});

test("动态字段解析路径、可选参数、查询参数、RSS/Atom 前缀，忽略示例 token", () => {
  const [route] = request_routes;
  assert.deepEqual(route.fields.map(field => [field.name, field.in, field.required, field.value]), [
    ["id", "path", true, "123"], ["city", "path", false, "上海"], ["limit", "query", false, "10"], ["search", "query", false, ""],
  ]);
  const entries = route_request_models([{ file: "rss/example.js", metadata: { kind: "rss", routes: [
    { path: "/example/:id", example: "/example/42?token=secret&q=hello", parameters: { token: "凭据", q: "关键词" } },
  ] } }]);
  assert.deepEqual(entries.map(entry => entry.path), ["/rss/example/:id", "/atom/example/:id"]);
  assert.ok(entries.every(entry => entry.fields.every(field => field.name !== "token")));
  assert.equal(route_request_model("bad", "</script>"), null);
});

test("生成 GET URL 和可执行的 POST curl，编码参数，安全引用 shell 字符，令牌仅位于指定位置", async t => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const storage = memory_storage();
  let copied;
  const model = create_market_model(request_scripts, async value => { copied = value; }, storage);
  model.set_setting("baseURL", "https://worker.example/prefix");
  model.set_setting("token", "private +'&/token");
  model.save_settings();
  model.open_request(request_routes[0].key);
  const search = "'; echo SHELL_INJECTION; # $(printf BAD) `printf BAD`";
  model.set_route_value("search", search);
  const output = model.request_output;
  assert.equal(output.error, "");
  const url = new URL(output.url);
  assert.equal(url.pathname, "/prefix/rss/example/123/%E4%B8%8A%E6%B5%B7");
  assert.equal(url.searchParams.get("token"), model.settings.token);
  assert.equal(url.searchParams.get("search"), search);
  const args = execFileSync("/bin/sh", ["-c", 'curl() { printf "%s\\0" "$@"; }; ' + output.curl]).toString().split("\0").slice(0, -1);
  assert.deepEqual(args, ["--request", "POST", "https://worker.example/prefix/rss/example/123/%E4%B8%8A%E6%B5%B7", "--header",
    "Authorization: Bearer " + model.settings.token, "--header", "Content-Type: application/json", "--data-raw", JSON.stringify({ limit: "10", search })]);
  await model.copy_request("curl");
  assert.equal(copied, output.curl);
  t.mock.timers.tick(2500);
  assert.equal(model.message, "");
  model.set_route_value("city", "");
  assert.equal(new URL(model.request_output.url).pathname, "/prefix/rss/example/123");
  for (const invalid of ["../private", ".", "..", "a\\b", "a/b", "\n"]) {
    model.set_route_value("city", invalid);
    assert.ok(model.request_output.error, invalid);
  }
  model.set_route_value("id", "");
  assert.match(model.request_output.error, /请填写 id/);
});

test("相邻可选路径参数不能跳过前面的参数", () => {
  const route = route_request_model("hot/example.js", "/api/hot/example/:country?/:type?");
  const model = create_market_model([{ routes: [route] }]);
  model.open_request(route.key);
  model.set_route_value("type", "podcasts");
  assert.throws(() => model.resolved_request, /不能跳过/);
  model.set_route_value("country", "us");
  assert.equal(model.resolved_request.path, "/api/hot/example/us/podcasts");
});
