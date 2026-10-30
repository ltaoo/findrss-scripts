import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { read_script } from "./support/script_sources.js";
import { compile_script_module, execute_script } from "findrss-worker/server/infra/script_sandbox.js";
import { ScriptCookieAccess } from "findrss-worker/server/infra/script_cookie_access.js";

const source = read_script("hot/weibo_hot.js");
const compiled = await compile_script_module(source);
assert.equal(compiled.error, "");
const page = readFileSync(new URL("./fixtures/weibo_hot_summary.html", import.meta.url), "utf8");
const url = "https://s.weibo.com/top/summary?cate=realtimehot";
const access = () => new ScriptCookieAccess({
  permissions: compiled.metadata.permissions,
  assert_grant() {},
  cookies: () => ["SUB", "SUBP", "session"].map(name => ({
    name, value: "fixture-" + name, domain: ".weibo.com", path: "/", secure: true,
  })),
});
async function run(cookies = access()) {
  const result = await execute_script(source, compiled.metadata, null, undefined, [], "", cookies);
  return JSON.parse(result.output);
}

test("微博实际热搜页面跳过广告，保留置顶、真实排名及带分类的热度", async t => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (target, options) => {
    calls.push(target);
    const headers = new Headers(options.headers);
    assert.equal(headers.get("cookie"), "SUB=fixture-SUB; SUBP=fixture-SUBP");
    assert.equal(headers.get("referer"), "https://weibo.com");
    assert.match(headers.get("user-agent"), /Chrome\/156\./);
    assert.equal(headers.get("accept"), "text/html,application/xhtml+xml");
    return new Response(page);
  });
  const snapshot = await run();
  assert.deepEqual(calls, [url]);
  assert.deepEqual(snapshot.entries.map(entry => entry.rank), [null, 1, 2, 3, 4, 50]);
  assert.equal(snapshot.entries[0].pinned, true);
  assert.equal(snapshot.entries[0].heat.value, null);
  const first = snapshot.entries[1];
  assert.equal(first.id, "weibo:Elk宁王谈BLG国际赛内战胜率");
  assert.equal(first.title, "Elk宁王谈BLG国际赛内战胜率");
  assert.equal(first.heat.value, 1025540);
  assert.ok(first.link.startsWith("https://s.weibo.com/weibo?q="));
  assert.deepEqual(snapshot.entries.find(entry => entry.rank === 4).heat, {
    value: 997968, text: "综艺 997968", unit: "热度",
  });
  assert.doesNotMatch(JSON.stringify(snapshot), /fixture-|javascript:|今天买家电家居|丢100克黄金/);
});

test("微博重复条目去重，未知热度保持 null，非广告的危险链接仍报错", async t => {
  const table = rows => '<div id="pl_top_realtimehot"><table><tbody>' + rows + '</tbody></table></div>';
  const row = (href, heat) => '<tr><td class="td-01">1</td><td class="td-02"><a href="' + href + '">标题</a><span>' + heat + '</span></td></tr>';
  for (const [heat, value] of [["1,234", 1234], ["电影 1,234", 1234], ["待更新", null], ["", null]]) {
    const html = table(row("/weibo?q=1", heat) + row("/weibo?q=1", heat));
    t.mock.method(globalThis, "fetch", async () => new Response(html));
    const { entries } = await run();
    assert.equal(entries.length, 1);
    assert.equal(entries[0].heat.value, value);
  }
  t.mock.method(globalThis, "fetch", async () => new Response(table(row("javascript:alert(1)", "123"))));
  await assert.rejects(run(), error => error.problem?.code === "UPSTREAM_INVALID_RESPONSE");
});

test("微博游客验证页提示同步 Cookie，HTTP 错误和 Cookie 授权校验继续生效", async t => {
  t.mock.method(globalThis, "fetch", async () => new Response('<title>Sina Visitor System</title>'));
  await assert.rejects(run(), error => error.problem?.code === "UPSTREAM_AUTH_REQUIRED" && /Cookie/.test(error.message));
  for (const [status, code] of [[403, "UPSTREAM_ACCESS_DENIED"], [429, "UPSTREAM_RATE_LIMITED"], [504, "UPSTREAM_TIMEOUT"]]) {
    t.mock.method(globalThis, "fetch", async () => new Response("Unavailable", { status }));
    await assert.rejects(run(), error => error.problem?.code === code);
  }
  t.mock.method(globalThis, "fetch", () => assert.fail("没有授权时不应请求"));
  await assert.rejects(run(null), /Cookie 权限/);
});
