import assert from "node:assert/strict";
import test from "node:test";
import scripts from "../dist/scripts.js";
import worker from "../worker/index.js";
import { route_cases, debug_route_cases } from "../worker/catalog.js";

const origin = "https://scripts.example";
const request = (path, env, headers) => worker.fetch(new Request(origin + path, { headers }), env);

test("所有路由支持查询令牌，空令牌、错误令牌及无服务端令牌不能绕过授权", async () => {
  const env = { ACCESS_TOKEN: "private-access-token", SCRIPT_CONFIG: "[]" };
  for (const path of ["/", "/health", "/api/routes"]) {
    assert.equal((await request(path + "?token=private-access-token", env)).status, 200, path);
    for (const query of ["", "?token=", "?token=wrong-token"]) {
      assert.equal((await request(path + query, env)).status, 401, path + query);
    }
  }
  for (const entry of [...route_cases(scripts), ...debug_route_cases(scripts)]) {
    const url = new URL(entry.example, origin);
    url.searchParams.set("token", env.ACCESS_TOKEN);
    const response = await worker.fetch(new Request(url), env);
    assert.equal(response.status, 503, entry.example);
    assert.equal(response.headers.get("X-FindRSS-Script"), entry.file);
  }
  assert.equal((await request("/health?token=anything", { SCRIPT_CONFIG: "{}" })).status, 503);
});

test("同时携带请求头与查询令牌时，请求头优先，错误请求头不能回退到查询令牌", async () => {
  const env = { ACCESS_TOKEN: "private-access-token" };
  for (const [header, query, status] of [
    ["Bearer private-access-token", "wrong-token", 200],
    ["Bearer wrong-token", "private-access-token", 401],
    ["Basic private-access-token", "private-access-token", 401],
    ["", "private-access-token", 401],
  ]) {
    const response = await request("/health?token=" + query, env, { Authorization: header });
    assert.equal(response.status, status);
  }
});

test("URL 编码令牌正确授权，脚本参数、日志、Debug 上下文和 RSS/Atom self URL 不包含令牌", async t => {
  const env = { ACCESS_TOKEN: "private +/&?=token" };
  const script = scripts.find(script => script.file === "rss/github.js");
  const original_source = script.source;
  t.after(() => { script.source = original_source; });
  script.source += `
const auth_handler = routes[0].handler;
routes[0].handler = async ctx => {
  ctx.log("业务参数", JSON.stringify(ctx.query));
  if (ctx.query.token !== undefined || ctx.query.page !== "2") throw new Error("令牌未剥离或业务参数丢失");
  return auth_handler(ctx);
};`;
  t.mock.method(globalThis, "fetch", async url => {
    assert.equal(url, "https://github.com/example/repo/releases.atom");
    return new Response('<feed xmlns="http://www.w3.org/2005/Atom"><title>Releases</title></feed>');
  });
  for (const prefix of ["/rss", "/atom", "/debug", "/debug/rss"]) {
    const response = await request(prefix + "/github/example/repo/release?page=2&token=" + encodeURIComponent(env.ACCESS_TOKEN), env);
    assert.equal(response.status, 200, prefix);
    const body = await response.text();
    assert.doesNotMatch(body, /private|token=/);
    if (prefix.startsWith("/debug")) {
      assert.match(body, /业务参数/);
      assert.match(body, /&quot;authenticated&quot;: true/);
      assert.doesNotMatch(body, /&quot;token&quot;/);
    } else {
      assert.match(body, /page=2/);
    }
  }
  t.mock.method(globalThis, "fetch", () => assert.fail("无效令牌不得出网"));
  const response = await request("/debug/github/example/repo/release?token=wrong-private-token", env);
  assert.equal(response.status, 401);
  assert.doesNotMatch(await response.text(), /wrong-private-token/);
});
