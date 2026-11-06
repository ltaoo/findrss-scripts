import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { create_execution_timing } from "../worker/timing.js";
import worker from "../worker/index.js";
import { tcp_http_fetch } from "findrss-worker/server/infra/tcp_http.js";
import { mock_tcp_http } from "findrss-worker/test/support/tcp_socket_fixture.js";

const request = path => worker.fetch(new Request("https://scripts.example" + path), {});
const upstream_requests = html => JSON.parse(/data-n="debug-upstream-requests-content"[^>]*>([\s\S]*?)<\/pre>/.exec(html)[1]
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
const feed = '<feed xmlns="http://www.w3.org/2005/Atom"><title>Releases</title><entry><id>release:1</id><title>v1</title><link href="https://github.com/example/repo/releases/tag/v1"/></entry></feed>';

test("主阶段合计等于总耗时，并行外部调用独立计时", t => {
  let now = 100;
  t.mock.method(Date, "now", () => now);
  const timing = create_execution_timing(90);
  timing.mark("准备");
  now = 110;
  timing.mark("执行");
  const first = timing.span("请求一");
  now = 120;
  const second = timing.span("请求二");
  now = 140;
  first();
  now = 150;
  second();
  timing.mark("清理");
  now = 160;
  const snapshot = timing.snapshot();
  assert.equal(snapshot.elapsed_ms, 70);
  assert.deepEqual(snapshot.stages.map(row => row.duration_ms), [20, 40, 10]);
  assert.deepEqual(snapshot.operations.map(row => row.duration_ms), [30, 30]);
  assert.equal(snapshot.stages.reduce((sum, row) => sum + row.duration_ms, 0), snapshot.elapsed_ms);
});

test("真实 Debug 把 16706ms 拆分为响应等待与正文读取，显示全部主阶段", async t => {
  let now = 1000;
  t.mock.method(Date, "now", () => now);
  t.mock.method(globalThis, "fetch", async () => {
    now += 16000;
    const response = new Response(feed);
    const array_buffer = response.arrayBuffer.bind(response);
    response.arrayBuffer = async () => { now += 706; return array_buffer(); };
    return response;
  });
  const response = await request("/debug/github/example/repo/release");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /HTTP 200 · ok · 16706 ms/);
  const [trace] = upstream_requests(html);
  assert.equal(trace.duration_ms, 16706);
  assert.equal(trace.timings.response_ms, 16000);
  assert.equal(trace.timings.body_read_ms, 706);
  assert.equal(trace.timings.decode_and_transfer_ms, 0);
  for (const name of ["鉴权与路由", "参数与配置", "Cookie 与浏览器状态读取", "沙箱排队", "QuickJS/Wasm 初始化",
    "沙箱上下文与工具初始化", "脚本执行（含外部调用等待）", "输出读取与校验", "沙箱释放", "浏览器状态保存"]) {
    assert.ok(html.includes(name), name);
  }
  assert.match(html, /不是 CPU 时间/);
  assert.match(html, /并行调用的耗时不能直接相加/);
  const stages = /data-n="debug-timing-stages-rows">([\s\S]*?)<\/tbody>/.exec(html)[1];
  const durations = [...stages.matchAll(/data-n="debug-timing-stages-duration">(\d+)<\/td>/g)].map(match => Number(match[1]));
  assert.equal(durations.reduce((sum, value) => sum + value, 0), 16706);
  for (const node of html.matchAll(/<([a-z][a-z0-9]*)\b([^>]*?)>/gi)) assert.match(node[2], /data-n="[^"\s]+"/, node[0]);
});

test("失败请求和鉴权失败保留已完成阶段的耗时", async t => {
  let now = 1000;
  t.mock.method(Date, "now", () => now);
  t.mock.method(globalThis, "fetch", async () => { now += 750; throw new Error("offline"); });
  let response = await request("/debug/github/example/repo/release");
  assert.equal(response.status, 502);
  let html = await response.text();
  const [trace] = upstream_requests(html);
  assert.equal(trace.duration_ms, 750);
  assert.equal(trace.timings.response_ms, 750);
  assert.match(html, /失败后浏览器清理/);
  response = await worker.fetch(new Request("https://scripts.example/debug/github/example/repo/release"), { ACCESS_TOKEN: "private" });
  assert.equal(response.status, 401);
  html = await response.text();
  assert.match(html, /鉴权与路由/);
  assert.doesNotMatch(html, /沙箱排队/);
});

test("视频号 TCP 超时重试逐次计时，凭据仍然脱敏", async t => {
  mock_tcp_http(t);
  const fixtures = JSON.parse(await readFile(new URL("./fixtures/script_migration.json", import.meta.url)));
  const fixture = fixtures.find(value => value.file === "wxchannels");
  let now = 1000, calls = 0;
  t.mock.method(Date, "now", () => now);
  t.mock.method(globalThis, "fetch", async () => {
    now += ++calls === 1 ? 10000 : 6000;
    return calls === 1 ? new Response("timeout", { status: 504 }) : new Response(fixture.responses[0].body);
  });
  const authorized = await worker.fetch(new Request("https://scripts.example/debug/wxchannels/" + fixture.params.account, {
    headers: { Authorization: "Bearer test-token" },
  }), { ACCESS_TOKEN: "test-token", SCRIPT_CONFIG: JSON.stringify({ "rss/wxchannels.js": fixture.config }) });
  assert.equal(authorized.status, 200);
  const html = await authorized.text();
  assert.match(html, /HTTP 200 · ok · 16000 ms/);
  assert.doesNotMatch(html, /wechat-private-fixture|test-token/);
  const traces = upstream_requests(html);
  assert.deepEqual(traces.map(trace => trace.duration_ms), [10000, 6000]);
  assert.deepEqual(traces.map(trace => trace.status), [504, 200]);
  assert.deepEqual(traces.map(trace => trace.started_ms), [0, 10000]);
  assert.ok(traces.every(trace => trace.transport === "tcp" && Number.isFinite(trace.timings.connect_ms)));
  assert.match(html, /等待并读取响应头/);
});

test("TCP 连接、发送、响应头及正文分别计时，失败保留当前阶段", async t => {
  let now = 1000;
  t.mock.method(Date, "now", () => now);
  const timing = {};
  const connect = () => {
    let reads = 0;
    return {
      opened: Promise.resolve().then(() => { now += 10; }),
      readable: new ReadableStream({ pull(controller) {
        now += reads++ ? 40 : 90;
        controller.enqueue(new TextEncoder().encode(reads === 1 ? "HTTP/1.1 200 OK\r\nContent-Length: 2\r\n\r\n" : "OK"));
        if (reads === 2) controller.close();
      } }, { highWaterMark: 0 }),
      writable: new WritableStream({ write() { now += 5; } }),
      close: async () => {},
    };
  };
  const response = await tcp_http_fetch("https://api.example.test/feed", { timing }, connect);
  assert.equal(await response.text(), "OK");
  assert.deepEqual(timing, { connect_ms: 10, send_ms: 5, wait_headers_ms: 90, receive_body_ms: 40, decompress_ms: 0 });
  const failed = {};
  await assert.rejects(tcp_http_fetch("https://api.example.test/feed", { timing: failed }, () => ({
    opened: Promise.resolve().then(() => { now += 200; throw new Error("connect failed"); }),
    readable: new ReadableStream(), writable: new WritableStream(), close: async () => {},
  })), /connect failed/);
  assert.deepEqual(failed, { connect_ms: 200 });
});
