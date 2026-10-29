import assert from "node:assert/strict";
import test from "node:test";
import { notify_route_failures } from "../scripts/notify_route_failures.js";
import { check_routes } from "../scripts/route_checks.js";

const env = { NOTIFY_URL: "https://notify.example/api/notify/test", NOTIFY_TOKEN: "fixture-token",
  GITHUB_REPOSITORY: "example/scripts", GITHUB_RUN_ID: "123", GITHUB_SERVER_URL: "https://github.com",
  REPORT_PAGE_URL: "https://example.github.io/scripts/" };
const report = { total: 3, failed: 2, results: [
  { format: "rss", path: "/rss/instagram/:username", error: "COOKIE_REQUIRED", output_valid: false },
  { format: "hot", path: "/api/hot/example", error: "HTTP 502", output_valid: false },
  { format: "rss", path: "/rss/passed", output_valid: true },
] };

test("任何路由失败时仅推送一条带失败摘要和 Actions 链接的消息", async () => {
  let calls = 0;
  await notify_route_failures(report, env, async (url, options) => {
    calls++;
    assert.equal(String(url), env.NOTIFY_URL);
    assert.equal(options.method, "POST");
    assert.equal(options.redirect, "error");
    assert.equal(options.headers.Authorization, "Bearer fixture-token");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.ok(options.signal instanceof AbortSignal);
    const body = JSON.parse(options.body);
    assert.deepEqual(Object.keys(body), ["text"]);
    assert.match(body.text, /2\/3/);
    assert.match(body.text, /COOKIE_REQUIRED/);
    assert.match(body.text, /HTTP 502/);
    assert.match(body.text, /https:\/\/github.com\/example\/scripts\/actions\/runs\/123/);
    assert.match(body.text, /报告页：https:\/\/example.github.io\/scripts\//);
    assert.doesNotMatch(body.text, /fixture-token|\/rss\/passed/);
    return new Response("OK");
  });
  assert.equal(calls, 1);
});

test("全部通过时不要求通知凭据，也不发送请求", async () => {
  await notify_route_failures({ total: 1, failed: 0, results: [] }, {}, () => assert.fail("不应通知"));
});

test("缺少 Secret、非 HTTPS 或通知 HTTP 错误会明确失败", async () => {
  await assert.rejects(notify_route_failures(report, {}), /NOTIFY_TOKEN/);
  await assert.rejects(notify_route_failures(report, { ...env, NOTIFY_URL: "http://notify.example" }), /HTTPS/);
  await assert.rejects(notify_route_failures(report, env, async () => new Response("Unauthorized", { status: 401 })), /HTTP 401/);
});

test("大量失败会汇总截断，保留完整报告入口", async () => {
  const results = Array.from({ length: 12 }, (_, index) => ({ ...report.results[0], path: "/rss/failure/" + index }));
  await notify_route_failures({ total: 12, failed: 12, results }, env, async (url, options) => {
    const { text } = JSON.parse(options.body);
    assert.match(text, /另有 2 条失败/);
    assert.doesNotMatch(text, /\/failure\/10/);
    assert.match(text, /actions\/runs\/123/);
    return new Response("OK");
  });
});

test("同一路由多个失败样本只计一条失败，通知保留样本地址和原因", async () => {
  const entry = { file: "rss/example.js", format: "rss", path: "/rss/example/:account", example: "/rss/example/default" };
  const report = await check_routes("https://scripts.example", [entry], {
    "rss /rss/example/:account": [{ example: "/rss/example/a" }, { example: "/rss/example/b" }],
  }, { fetch_impl: async () => new Response("Unavailable", { status: 503 }) });
  await notify_route_failures(report, env, async (url, options) => {
    const { text } = JSON.parse(options.body);
    assert.match(text, /失败：1\/1/);
    assert.match(text, /\/rss\/example\/a: HTTP 503/);
    assert.match(text, /\/rss\/example\/b: HTTP 503/);
    return new Response("OK");
  });
});
