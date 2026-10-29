import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { read_script } from "./support/script_sources.js";
import { ScriptCookieAccess } from "findrss-worker/server/infra/script_cookie_access.js";

const { compile_script_module, execute_script } = await import("findrss-worker/server/infra/script_sandbox.js");
const source = read_script("hot/36kr.js");
const compiled = await compile_script_module(source);
assert.equal(compiled.error, "");
const metadata = { ...compiled.metadata, ...compiled.metadata.routes.find(route => route.path === "/36kr/renqi") };
// 从 2026-10-29 hot_list_renqi.html 提取榜单字段，省略页面脚本及无关内容。
const fixture = await readFile(new URL("./fixtures/36kr_renqi.html", import.meta.url), "utf8");
const page = rows => '<script>window.initialState = ' + JSON.stringify({ hotListDetail: { articleList: { itemList: rows } } }) + ';</script>';
const run = async (cookies = []) => {
  const access = new ScriptCookieAccess({ permissions: compiled.metadata.permissions, cookies: () => cookies, assert_grant() {} });
  return JSON.parse((await execute_script(source, metadata, null, undefined, [], "", access)).output);
};

test("36氪从真实内嵌榜单解析 20 条，保留稳定 ID、排名及万单位热度", async t => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const day = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
    assert.equal(url, `https://36kr.com/hot-list/renqi/${day}/1`);
    assert.match(new Headers(options.headers).get("user-agent"), /Chrome\/156/);
    assert.equal(new Headers(options.headers).get("referer"), "https://36kr.com");
    return new Response(fixture);
  });
  const snapshot = await run();
  assert.equal(snapshot.kind, "hot_rank");
  assert.equal(snapshot.title, "36氪 · 人气榜");
  assert.equal(snapshot.entries.length, 20);
  assert.deepEqual(snapshot.entries.map(row => row.rank), Array.from({ length: 20 }, (_, i) => i + 1));
  assert.equal(snapshot.entries[0].id, "36kr-renqi:/p/4046203581289345");
  assert.equal(snapshot.entries[0].link, "https://36kr.com/p/4046203581289345");
  assert.match(snapshot.entries[0].title, /^8点1氪丨姆巴佩/);
  assert.deepEqual(snapshot.entries[0].heat, { value: 2607200, unit: "热度", text: "260.72w 热度" });
});

test("36氪仅发送榜单验证 Cookie，不发送其他来源及登录 Cookie", async t => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(new Headers(options.headers).get("cookie"), "_wafchallengeid=challenge; _waf_verification_proof=proof");
    return new Response(fixture);
  });
  await run([
    { name: "_wafchallengeid", value: "challenge", domain: ".36kr.com", path: "/", secure: true },
    { name: "_waf_verification_proof", value: "proof", domain: "36kr.com", path: "/", secure: true },
    { name: "session", value: "private", domain: "36kr.com", path: "/", secure: true },
    { name: "_wafchallengeid", value: "other", domain: "other.example", path: "/", secure: true },
  ]);
  assert.equal(compiled.metadata.permissions.cookies[0].path_prefix, "/hot-list/renqi/");
});

test("36氪去重，缺失排名和热度保持 null，零热度有效", async t => {
  t.mock.method(globalThis, "fetch", async () => new Response(page([
    { itemId: "123", widgetTitle: "测试 &amp; 标题", statHot: "0" },
    { itemId: "123", widgetTitle: "重复" },
    { itemId: "456", widgetTitle: "未知热度" },
  ])));
  const { entries } = await run();
  assert.equal(entries.length, 2);
  assert.equal(entries[0].title, "测试 & 标题");
  assert.equal(entries[0].rank, null);
  assert.deepEqual(entries[0].heat, { value: 0, unit: "热度", text: "0w 热度" });
  assert.deepEqual(entries[1].heat, { value: null, unit: "热度", text: "" });
});

test("36氪验证页、数据缺失、无效 ID 和 HTTP 错误均返回明确失败", async t => {
  for (const body of [
    '<script id="__waf_verification_challenge" type="application/json">{}</script>',
    '<script>document.cookie="_wafchallengeid=challenge"</script><p>正在进行安全检测...</p>',
  ]) {
    t.mock.method(globalThis, "fetch", async () => new Response(body));
    await assert.rejects(run(), error => {
      assert.equal(error.problem?.code, "UPSTREAM_AUTH_REQUIRED");
      assert.match(error.message, /同步并授权/);
      return true;
    });
  }
  for (const body of ["<html>无榜单</html>", '<script>window.initialState={};</script>', page([]), page([{ widgetTitle: "缺少 ID" }])]) {
    t.mock.method(globalThis, "fetch", async () => new Response(body));
    await assert.rejects(run(), error => error.problem?.code === "UPSTREAM_INVALID_RESPONSE");
  }
  t.mock.method(globalThis, "fetch", async () => new Response("Unavailable", { status: 503 }));
  await assert.rejects(run(), /HTTP 503/);
});
