import assert from "node:assert/strict";
import test from "node:test";
import { classify_probe, failed_entries, probe_route, replay_routes } from "../scripts/replay_routes.js";

const base = "https://scripts.example";

test("复跑分类区分平台 CPU、快照生成、上游错误和成功", () => {
  assert.deepEqual(classify_probe(200, "application/json", "{}"), { classification: "passed" });
  assert.equal(classify_probe(503, "text/html",
    "<title>Worker exceeded resource limits | scripts.example | Cloudflare</title>").classification, "exceeded_cpu");
  assert.equal(classify_probe(503, "application/json", JSON.stringify({ code: "FEED_GENERATING" })).classification,
    "feed_generating");
  assert.equal(classify_probe(502, "application/json",
    JSON.stringify({ code: "UPSTREAM_FETCH_FAILED" })).classification, "upstream");
  assert.equal(classify_probe(503, "application/json", JSON.stringify({ code: "COOKIE_REQUIRED" })).classification,
    "cookie_required");
  assert.equal(classify_probe(502, "application/json", JSON.stringify({ code: "SCRIPT_FAILED" })).classification,
    "script");
  assert.equal(classify_probe(503, "text/plain", "unavailable").classification, "server_error");
});

test("复跑只选取未通过的路由，并展开失败样本", () => {
  const report = { results: [
    { file: "hot/a.js", format: "hot", path: "/api/hot/a", example: "/api/hot/a", output_valid: true },
    { file: "hot/b.js", format: "hot", path: "/api/hot/b", example: "/api/hot/b", output_valid: false },
    { file: "rss/c.js", format: "rss_json", path: "/api/rss/c", output_valid: false, samples: [
      { example: "/api/rss/c?p=1", output_valid: true },
      { example: "/api/rss/c?p=2", output_valid: false },
    ] },
  ] };
  assert.deepEqual(failed_entries(report).map(entry => entry.example),
    ["/api/hot/b", "/api/rss/c?p=2"]);
  assert.equal(failed_entries(report, { all: true }).length, 4);
  assert.deepEqual(failed_entries(report, { file: "rss" }).map(entry => entry.example), ["/api/rss/c?p=2"]);
  const replay = { results: [
    { file: "hot/x.js", path: "/api/hot/x", example: "/api/hot/x", classification: "exceeded_cpu" },
    { file: "hot/y.js", path: "/api/hot/y", example: "/api/hot/y", classification: "upstream" },
  ] };
  assert.deepEqual(failed_entries(replay, { classification: "exceeded_cpu" }).map(entry => entry.file), ["hot/x.js"]);
});

test("复跑按 Retry-After 重试快照生成，并并发执行", async () => {
  let calls = 0;
  const result = await probe_route(base, { file: "hot/a.js", example: "/api/hot/a" }, {
    feed_retries: 1,
    fetch_impl: async () => ++calls === 1
      ? Response.json({ code: "FEED_GENERATING" }, { status: 503, headers: { "Retry-After": "1" } })
      : new Response('{"kind":"hot_rank"}', { headers: { "Content-Type": "application/json", "X-FindRSS-Script": "hot/a.js" } }),
  });
  assert.equal(calls, 2);
  assert.equal(result.classification, "passed");
  assert.equal(result.script, "hot/a.js");

  let active = 0;
  let peak = 0;
  const entries = Array.from({ length: 6 }, (_, index) => ({ file: "hot/" + index + ".js", example: "/api/hot/" + index }));
  const report = await replay_routes(entries, {
    base, concurrency: 2,
    fetch_impl: async url => {
      active++;
      peak = Math.max(peak, active);
      await new Promise(resolve => setImmediate(resolve));
      active--;
      return url.pathname.endsWith("0") ? new Response("bad", { status: 500 }) : Response.json({ ok: true });
    },
  });
  assert.equal(peak, 2);
  assert.deepEqual([report.total, report.passed, report.failed], [6, 5, 1]);
  assert.equal(report.counts.server_error, 1);
});

test("复跑拒绝跨站样本并报告超时", async () => {
  const cross = await probe_route(base, { file: "hot/a.js", example: "https://other.example/a" }, {
    fetch_impl: () => assert.fail("不得出网"),
  });
  assert.equal(cross.classification, "network_error");
  const timed_out = await probe_route(base, { file: "hot/a.js", example: "/api/hot/a" }, {
    fetch_impl: async () => { throw Object.assign(new Error("timed out"), { name: "TimeoutError" }); },
  });
  assert.equal(timed_out.classification, "timeout");
});
