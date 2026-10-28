import assert from "node:assert/strict";
import test from "node:test";
import { check_route, check_routes, check_output, parse_response } from "../scripts/route_checks.js";

const entry = { file: "hot/example.js", path: "/api/hot/example", example: "/api/hot/example", format: "hot", route_index: 0, source_host: "example.com" };
const value = { kind: "hot_rank", title: "Example", link: "https://example.com", entries: [{ id: "example:1", title: "Article", link: "https://example.com/1", rank: null, pinned: false, heat: { value: null, unit: "积分", text: "" } }] };
const headers = { "Content-Type": "application/json", "X-FindRSS-Script": entry.file, "X-FindRSS-Route": "0" };
const run = fetch_impl => check_route("https://scripts.example", entry, { fetch_impl });

test("巡检逐级区分请求失败、空响应、错误格式和错误内容", async () => {
  const cases = [
    [async () => { throw new Error("Timeout"); }, [false, false, false, false]],
    [async () => new Response("Bad gateway", { status: 502 }), [false, false, false, false]],
    [async () => new Response(""), [true, false, false, false]],
    [async () => new Response("<html>Login</html>", { headers }), [true, true, false, false]],
    [async () => Response.json({ ...value, entries: [] }, { headers }), [true, true, true, false]],
    [async () => Response.json(value, { headers }), [true, true, true, true]],
  ];
  for (const [fetch_impl, expected] of cases) {
    const result = await run(fetch_impl);
    assert.deepEqual([result.request, result.response, result.format_valid, result.output_valid], expected, result.error);
  }
});

test("巡检报告保留服务端业务码和描述", async () => {
  const result = await run(async () => Response.json({
    error: "COOKIE_REQUIRED", code: "COOKIE_REQUIRED", message: "缺少可用 Cookie", file: entry.file,
  }, { status: 503 }));
  assert.equal(result.request, false);
  assert.equal(result.output_valid, false);
  assert.equal(result.code, "COOKIE_REQUIRED");
  assert.equal(result.error, "HTTP 503: COOKIE_REQUIRED: 缺少可用 Cookie");
});

test("巡检拒绝重复 ID、无效热度、错误来源及错误 handler", async () => {
  assert.throws(() => check_output(entry, { ...value, entries: [value.entries[0], value.entries[0]] }), /ID/);
  assert.throws(() => check_output(entry, { ...value, link: "https://other.example" }), /来源/);
  assert.throws(() => check_output(entry, { ...value, entries: [{ ...value.entries[0], heat: { value: -1 } }] }), /热度/);
  const result = await run(async () => Response.json(value, { headers: { ...headers, "X-FindRSS-Route": "1" } }));
  assert.equal(result.format_valid, true);
  assert.equal(result.output_valid, false);
});

test("巡检校验 XML、图片魔数、HTML 正文和 Detect 不完整状态", () => {
  assert.throws(() => parse_response({ format: "rss" }, "application/rss+xml", Buffer.from("<rss><bad></rss>")));
  assert.throws(() => parse_response({ format: "image" }, "image/png", Buffer.from("<html>Login</html>")), /图片/);
  assert.throws(() => check_output({ format: "html" }, "<p>请先登录</p>"), /登录/);
  assert.throws(() => check_output({ format: "detect" }, { title: "Example", link: "https://example.com", status: "inconclusive" }), /状态/);
});

test("巡检覆盖 URL 不得跨站发送令牌，重定向不会视为成功", async () => {
  const result = await check_route("https://scripts.example", { ...entry, example: "//other.example/private" }, {
    token: "private-token", fetch_impl: () => assert.fail("不得出网"),
  });
  assert.equal(result.request, false);
  assert.match(result.error, /跨站/);
  const redirected = await run(async (url, options) => {
    assert.equal(options.redirect, "manual");
    return Response.redirect("https://other.example", 302);
  });
  assert.equal(redirected.output_valid, false);
  assert.equal(redirected.error, "HTTP 302");
});

test("批量巡检遇错仍检查全部路由，不允许跳过或拼错覆盖项", async () => {
  let requests = 0;
  const cases = Array.from({ length: 7 }, (_, index) => ({ ...entry, path: entry.path + index }));
  const report = await check_routes("https://scripts.example", cases, {}, {
    fetch_impl: async () => {
      requests++;
      return requests === 1 ? new Response("Unavailable", { status: 503 }) : Response.json(value, { headers });
    },
  });
  assert.equal(requests, 7);
  assert.equal(report.total, 7);
  assert.equal(report.failed, 1);
  assert.equal(report.passed, 6);
  await assert.rejects(check_routes("https://scripts.example", cases, { "hot /unknown": {} }), /未知路由/);
  await assert.rejects(check_routes("https://scripts.example", cases, { ["hot " + cases[0].path]: { skip: true } }), /未知巡检配置/);
});

test("批量巡检最多并发 10 条，失败后仍完整检查且不重复请求", async () => {
  const cases = Array.from({ length: 23 }, (_, index) => ({
    ...entry, path: entry.path + index, example: entry.example + index,
  }));
  const requested = [];
  const completed = [];
  let active = 0;
  let peak = 0;
  const report = await check_routes("https://scripts.example", cases, {}, {
    fetch_impl: async url => {
      requested.push(url.pathname);
      active++;
      peak = Math.max(peak, active);
      await new Promise(resolve => setImmediate(resolve));
      active--;
      return url.pathname === cases[0].example
        ? new Response("Unavailable", { status: 503 })
        : Response.json(value, { headers });
    },
    on_result: result => completed.push(result),
  });
  assert.equal(peak, 10);
  assert.equal(active, 0);
  assert.equal(requested.length, cases.length);
  assert.deepEqual(new Set(requested), new Set(cases.map(item => item.example)));
  assert.equal(report.total, cases.length);
  assert.equal(report.passed, cases.length - 1);
  assert.equal(report.failed, 1);
  assert.equal(completed.length, cases.length);
  assert.deepEqual(report.results.map(result => result.path), cases.map(item => item.path).sort());
});
