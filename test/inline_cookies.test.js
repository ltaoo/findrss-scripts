import assert from "node:assert/strict";
import test from "node:test";
const { compile_script_module, execute_script } = await import("findrss-worker/server/infra/script_sandbox.js");

const script = `export const kind = "clip";
export const version = "1.0.0";
export const platform = { name: "Fixture", icon: "" };
export const route = { path: "/cookie", name: "Cookie fixture", handler: async ctx => {
  const result = await ctx.fetchText("https://example.com/start", { headers: { Cookie: "session=fixture-cookie", Authorization: "Bearer fixture-token" } });
  if (result.error) return result;
  return Result.Ok({ kind: "clip", title: "Fixture", link: "https://example.com/", html: '<p data-n="fixture">完成</p>' });
} };`;
const compiled = await compile_script_module(script);

test("内置 Cookie 经宿主验证，同站重定向保留，跨站后即使跳回也不恢复，Debug 不暴露值", async t => {
  const calls = [];
  const targets = ["https://example.com/next", "https://other.example/", "https://example.com/back"];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, headers: new Headers(options.headers) });
    assert.equal(options.redirect, "manual");
    const target = targets[calls.length - 1];
    return target ? new Response("", { status: 302, headers: { Location: target } }) : new Response("done");
  });
  const result = await execute_script(script, { ...compiled.metadata, debug: true, debug_request: true });
  assert.equal(calls.length, 4);
  for (const call of calls.slice(0, 2)) {
    assert.equal(call.headers.get("cookie"), "session=fixture-cookie");
    assert.equal(call.headers.get("authorization"), "Bearer fixture-token");
  }
  for (const call of calls.slice(2)) {
    assert.equal(call.headers.has("cookie"), false);
    assert.equal(call.headers.has("authorization"), false);
  }
  assert.equal(result.upstream_requests[0].credentials.source, "script_inline");
  assert.doesNotMatch(JSON.stringify(result), /fixture-cookie|fixture-token/);
});

test("内置 Cookie 仍拒绝换行注入及超长值，验证前不会发请求", async t => {
  t.mock.method(globalThis, "fetch", () => assert.fail("无效 Cookie 不得出网"));
  for (const cookie of ["x=1\r\nInjected: yes", "x".repeat(4097)]) {
    const invalid = script.replace('"session=fixture-cookie"', JSON.stringify(cookie));
    await assert.rejects(execute_script(invalid, compiled.metadata), /请求头值无效/);
  }
});
