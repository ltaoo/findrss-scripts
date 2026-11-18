import assert from "node:assert/strict";
import test from "node:test";
import { create_bypass_navigate } from "../worker/browser_bypass.js";
import worker from "../worker/index.js";

const env = { ACCESS_TOKEN: "feed-test", BROWSER_ENABLED: "true", BROWSER_BYPASS_URL: "http://127.0.0.1:8802", BROWSER_BYPASS_TOKEN: "browser-private" };
const target = "https://www.javlibrary.com/cn/vl_star.php?s=abbds";
const response = (html, final_url = target) => new Response(html, { headers: { "x-cf-bypasser-final-url": final_url } });

test("Python 浏览器保持开关隔离，实际 Worker 路由使用宿主私有凭据读取 HTML", async t => {
  let navigations = 0;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (new URL(url).origin !== env.BROWSER_BYPASS_URL) {
      assert.equal(options?.headers?.["x-auth-token"], undefined);
      return new Response("challenge", { status: 403 });
    }
    navigations++;
    assert.equal(options.headers["x-auth-token"], env.BROWSER_BYPASS_TOKEN);
    assert.equal(options.redirect, "manual");
    assert.equal(new URL(url).searchParams.get("url"), target + "&mode=2&page=1");
    return response('<div id="rightcolumn"><div class="boxtitle">演员的影片</div><div class="videothumblist">没有影片</div></div>');
  });
  const request = () => new Request("https://feeds.example/api/rss/javlibrary/star/abbds", { headers: { Authorization: "Bearer feed-test" } });
  assert.equal((await worker.fetch(request(), { ...env, ACCESS_TOKEN: undefined })).status, 503);
  for (const enabled of [false, "false", undefined]) assert.equal((await worker.fetch(request(), { ...env, BROWSER_ENABLED: enabled })).status, 502);
  assert.equal(navigations, 0);
  const result = await worker.fetch(request(), env);
  assert.equal(result.status, 200, await result.clone().text());
  assert.equal((await result.json()).title, "演员 - JAVLibrary 作品");
  assert.equal(navigations, 1);
});

test("Python 导航拒绝不支持的来源、提取代码、重定向及无效响应，不暴露后端凭据", async t => {
  const navigate = create_bypass_navigate(env);
  t.mock.method(globalThis, "fetch", async () => { assert.fail("不应访问后端"); });
  await assert.rejects(navigate("https://evil.example/"), { code: "INVALID_PARAMETER" });
  await assert.rejects(navigate(target, {}, "() => secret"), { code: "INVALID_PARAMETER" });
  assert.throws(() => create_bypass_navigate({ ...env, BROWSER_BYPASS_URL: "http://example.com" }), { code: "CONFIG_INVALID" });
  assert.throws(() => create_bypass_navigate({ ...env, BROWSER_BYPASS_TOKEN: "" }), { code: "CONFIG_INVALID" });
  for (const [value, code] of [
    [new Response(null, { status: 302, headers: { Location: "https://evil.example/" } }), "SOURCE_UNAVAILABLE"],
    [response("html", "https://evil.example/"), "UPSTREAM_INVALID_RESPONSE"],
    [response(" "), "UPSTREAM_INVALID_RESPONSE"],
  ]) {
    t.mock.method(globalThis, "fetch", async () => value);
    await assert.rejects(navigate(target), error => error.code === code && !error.message.includes(env.BROWSER_BYPASS_TOKEN));
  }
  let cancelled = false;
  t.mock.method(globalThis, "fetch", async () => response(new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array(24 * 1024 * 1024 + 1)); },
    cancel() { cancelled = true; },
  })));
  await assert.rejects(navigate(target), { code: "UPSTREAM_INVALID_RESPONSE" });
  assert.equal(cancelled, true);
});
