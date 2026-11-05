import assert from "node:assert/strict";
import test from "node:test";
import scripts from "../dist/scripts.js";
import worker from "../worker/index.js";

const path = "https://scripts.example/rss/github/example/repo/release";
const env = { ACCESS_TOKEN: "private-token" };
const post = (body, headers = {}, url = path) => worker.fetch(new Request(url, { method: "POST", body,
  headers: { Authorization: "Bearer private-token", "Content-Type": "application/json", ...headers } }), env);

test("POST 复用 GET 路由，JSON 参数转换为查询参数，路径参数保留，token 不传给脚本", async t => {
  const script = scripts.find(script => script.file === "rss/github.js");
  const source = script.source;
  t.after(() => { script.source = source; });
  script.source += `
const post_handler = routes[0].handler;
routes[0].handler = async ctx => {
  if (ctx.method !== "POST" || ctx.params.org !== "example" || ctx.params.pro !== "repo"
    || ctx.query.page !== "2" || ctx.query.flag !== "false" || ctx.query.q !== "杭州 西湖"
    || ctx.query.token !== undefined || ctx.query.empty !== undefined) throw new Error("Invalid POST context");
  return post_handler(ctx);
};`;
  t.mock.method(globalThis, "fetch", async url => {
    assert.equal(url, "https://github.com/example/repo/releases.atom");
    return new Response('<feed xmlns="http://www.w3.org/2005/Atom"><title>Releases</title></feed>');
  });
  const response = await post(JSON.stringify({ page: 2, flag: false, q: "杭州 西湖", token: "body-token", empty: null }), {}, path + "?page=1");
  assert.equal(response.status, 200, await response.clone().text());
  assert.match(response.headers.get("Content-Type"), /rss\+xml/);
  const output = await response.text();
  assert.doesNotMatch(output, /private-token|body-token/);
  assert.match(output, /page=2/);
});

test("POST 在执行前验证授权、JSON 类型、格式和大小，管理及 Debug 入口保留原有方法", async t => {
  t.mock.method(globalThis, "fetch", () => assert.fail("无效请求不得出网"));
  t.mock.method(console, "error", () => {});
  for (const [body, headers, status, code] of [
    ['{"token":"private-token"}', { Authorization: "" }, 401, "UNAUTHORIZED"],
    ["{}", { "Content-Type": "text/plain" }, 415, "UNSUPPORTED_MEDIA_TYPE"],
    ...["", "{", "null", "[]", "42", '{"nested":{}}', '{"list":[]}', '{"number":1e400}']
      .map(body => [body, {}, 400, "INVALID_PARAMETER"]),
    [JSON.stringify({ q: "a".repeat(2 * 1024 * 1024) }), {}, 413, "PAYLOAD_TOO_LARGE"],
  ]) {
    const response = await post(body, headers);
    assert.equal(response.status, status, body.slice(0, 30));
    assert.equal((await response.json()).code, code);
  }
  for (const pathname of ["/", "/health", "/api/routes", "/debug/github/example/repo/release"]) {
    const response = await post("{}", {}, "https://scripts.example" + pathname);
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("Allow"), "GET");
  }
  const response = await worker.fetch(new Request(path, { method: "DELETE" }), env);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "GET, POST");
});
