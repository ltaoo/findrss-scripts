import assert from "node:assert/strict";
import test from "node:test";
import scripts from "../dist/scripts.js";
import worker from "../worker/index.js";
import { execute_snapshot, dead_letter_queue } from "../worker/feed_snapshots.js";
import { error_code } from "../worker/errors.js";
import { feed_environment, consume_feed } from "./support/feed_queue.js";

const origin = "https://feeds.example";
const path = "/github/example/repo/release";
const xml = title => '<feed xmlns="http://www.w3.org/2005/Atom"><title>' + title +
  '</title><entry><id>release:1</id><title>' + title + '</title><link rel="alternate" href="https://github.com/example/repo/releases/tag/v1"/><updated>2026-11-01T00:00:00Z</updated></entry></feed>';
const request = (env, prefix = "/rss", query = "", options = {}) => worker.fetch(new Request(origin + prefix + path + query, {
  ...options, headers: { Authorization: "Bearer test-token", ...options.headers },
}), env);
const environment = () => feed_environment({ ACCESS_TOKEN: "test-token" });
const snapshot_record = env => [...env.FEED_SNAPSHOTS.values.values()].find(value => value.key.startsWith("feed-snapshots/"));

test("HTTP 首次只入队，RSS、Atom、JSON 和查询顺序共用快照，访问令牌不进入任务或 self URL", async t => {
  const env = environment();
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; return new Response(xml("版本一")); });
  const pending = await request(env, "/rss", "?page=2&lang=zh&token=query-secret");
  assert.equal(pending.status, 503);
  assert.equal((await pending.json()).code, "FEED_GENERATING");
  assert.equal(pending.headers.get("Retry-After"), "5");
  assert.equal(calls, 0, "HTTP 请求不得执行采集");
  const second = await request(env, "/atom", "?lang=zh&page=2");
  assert.equal(second.status, 503);
  assert.equal(env.FEED_QUEUE.messages.length, 1);
  assert.doesNotMatch(JSON.stringify(env.FEED_QUEUE.messages), /test-token|query-secret|github|page|lang/);
  assert.doesNotMatch(JSON.stringify([...env.FEED_SNAPSHOTS.values]), /test-token|query-secret/);
  const message = env.FEED_QUEUE.messages.shift();
  assert.equal((await consume_feed(env, message)).acked, true);
  assert.equal(calls, 1);
  for (const prefix of ["/rss", "/atom", "/api/rss", ""]) {
    const response = await request(env, prefix, "?lang=zh&page=2&token=query-secret");
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("X-FindRSS-Cache"), "hit");
    assert.ok(response.headers.get("X-FindRSS-Updated-At"));
    const body = await response.text();
    assert.match(body, /版本一/);
    assert.doesNotMatch(body, /test-token|query-secret|snapshot-self|token=/);
    if (prefix !== "/api/rss") assert.ok(body.includes(origin + prefix + path + "?lang=zh&amp;page=2"));
  }
  await consume_feed(env, message);
  assert.equal(calls, 1, "重复消息不重新采集");
});

test("并发冷请求只有一个队列任务，未授权请求不读写快照或投递任务", async t => {
  const env = environment();
  t.mock.method(globalThis, "fetch", () => assert.fail("HTTP 不得抓取上游"));
  const denied = await request(env, "/rss", "", { headers: { Authorization: "Bearer wrong-token" } });
  assert.equal(denied.status, 401);
  assert.equal(env.FEED_SNAPSHOTS.values.size, 0);
  const responses = await Promise.all(Array.from({ length: 8 }, () => request(env)));
  assert.ok(responses.every(response => response.status === 503));
  assert.equal(env.FEED_QUEUE.messages.length, 1);
});

test("定时刷新保留旧快照直至新结果成功发布，失败不覆盖成功结果或泄露原始错误", async t => {
  let now = Date.now();
  t.mock.method(Date, "now", () => now);
  t.mock.method(console, "error", () => {});
  const env = environment();
  let title = "旧版本", failed = false, calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    if (failed) throw new Error("secret-cookie=private-value");
    return new Response(xml(title));
  });
  await request(env);
  await consume_feed(env);
  const updated = (await request(env)).headers.get("X-FindRSS-Updated-At");
  now += 600001;
  await worker.scheduled({}, env);
  assert.equal(env.FEED_QUEUE.messages.length, 1);
  const stale = await request(env);
  assert.equal(stale.status, 200);
  assert.equal(stale.headers.get("X-FindRSS-Cache"), "stale");
  assert.match(await stale.text(), /旧版本/);
  failed = true;
  const failure = await consume_feed(env, env.FEED_QUEUE.messages.shift(), 3);
  assert.equal(failure.acked, true);
  const retained = await request(env);
  assert.equal(retained.headers.get("X-FindRSS-Updated-At"), updated);
  assert.match(await retained.text(), /旧版本/);
  assert.doesNotMatch(snapshot_record(env).text, /private-value|secret-cookie/);
  failed = false;
  title = "新版本";
  now += 600001;
  await worker.scheduled({}, env);
  await consume_feed(env);
  const fresh = await request(env, "/atom");
  assert.equal(fresh.headers.get("X-FindRSS-Cache"), "hit");
  assert.match(await fresh.text(), /新版本/);
  assert.equal(calls, 3);
});

test("HTTP 遇到过期快照也会触发刷新，队列临时不可用时仍返回已有结果", async t => {
  let now = Date.now();
  t.mock.method(Date, "now", () => now);
  t.mock.method(console, "error", () => {});
  const env = environment();
  t.mock.method(globalThis, "fetch", async () => new Response(xml("可读快照")));
  await request(env);
  await consume_feed(env);
  now += 600001;
  const send = env.FEED_QUEUE.send;
  env.FEED_QUEUE.send = async () => { throw new Error("queue unavailable"); };
  const response = await request(env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("X-FindRSS-Cache"), "stale");
  assert.match(await response.text(), /可读快照/);
  env.FEED_QUEUE.send = send;
  await request(env);
  assert.equal(env.FEED_QUEUE.messages.length, 1, "失败投递释放租约，下一次访问可重试");
});

test("首次采集错误保留业务码，暂时性错误由队列重试，成功后替换错误记录", async t => {
  t.mock.method(console, "error", () => {});
  const env = environment();
  let failed = true;
  t.mock.method(globalThis, "fetch", async () => failed ? new Response("private response", { status: 403 }) : new Response(xml("恢复")));
  await request(env);
  const message = env.FEED_QUEUE.messages.shift();
  const state = await consume_feed(env, message);
  assert.deepEqual(state.retried, { delaySeconds: 60 });
  const response = await request(env);
  assert.equal(response.status, 502);
  assert.equal((await response.json()).code, "UPSTREAM_ACCESS_DENIED");
  assert.doesNotMatch(snapshot_record(env).text, /private response/);
  failed = false;
  await consume_feed(env, message, 2);
  assert.equal((await request(env)).status, 200);
});

test("绑定或存储缺失时明确报错，入队失败和过期租约可恢复，不退回同步采集", async t => {
  t.mock.method(console, "error", () => {});
  t.mock.method(globalThis, "fetch", () => assert.fail("不得退回同步采集"));
  for (const env of [{ ACCESS_TOKEN: "test-token" }, { ...environment(), FEED_QUEUE: undefined }]) {
    assert.equal((await (await request(env)).json()).code, "SNAPSHOT_UNAVAILABLE");
  }
  const env = environment();
  env.FEED_QUEUE.send = async () => { throw new Error("queue unavailable"); };
  assert.equal((await (await request(env)).json()).code, "SNAPSHOT_UNAVAILABLE");
  assert.ok(![...env.FEED_SNAPSHOTS.values.keys()].some(key => key.startsWith("feed-pending/")));
  env.FEED_QUEUE.send = async body => env.FEED_QUEUE.messages.push(body);
  await request(env);
  const pending = [...env.FEED_SNAPSHOTS.values.values()].find(value => value.key.startsWith("feed-pending/"));
  pending.text = JSON.stringify({ queued_at: Date.now() - 300001 });
  await request(env);
  assert.equal(env.FEED_QUEUE.messages.length, 2);
  t.mock.method(env.FEED_SNAPSHOTS, "get", async () => { throw new Error("r2 unavailable"); });
  assert.equal((await (await request(env)).json()).code, "SNAPSHOT_UNAVAILABLE");
});

test("快照写入失败时保留成功数据并重试消息，不能把存储错误当成采集错误发布", async t => {
  let now = Date.now();
  t.mock.method(Date, "now", () => now);
  t.mock.method(console, "error", () => {});
  const env = environment();
  t.mock.method(globalThis, "fetch", async () => new Response(xml("成功结果")));
  await request(env);
  await consume_feed(env);
  const saved = snapshot_record(env).text;
  now += 600001;
  await request(env);
  const put = env.FEED_SNAPSHOTS.put;
  env.FEED_SNAPSHOTS.put = async (key, ...args) => {
    if (key.startsWith("feed-snapshots/")) throw new Error("write failed");
    return put(key, ...args);
  };
  assert.ok((await consume_feed(env)).retried);
  assert.equal(snapshot_record(env).text, saved);
});

test("发布新源码后旧队列任务失效，非法消息被拒绝，定时刷新处理全部分页", async t => {
  const env = environment();
  t.mock.method(globalThis, "fetch", () => assert.fail("过期或非法任务不得执行"));
  const script = scripts.find(script => script.file === "rss/github.js");
  const source = script.source;
  t.after(() => { script.source = source; });
  await request(env);
  const old = env.FEED_QUEUE.messages.shift();
  script.source += "\n// next release\n";
  assert.equal((await consume_feed(env, old)).acked, true);
  assert.equal(env.FEED_SNAPSHOTS.values.size, 0);
  for (const body of [null, {}, { key: "../private", queued_at: 1 }, { key: "a".repeat(64), queued_at: -1 }]) {
    assert.equal((await consume_feed(env, body)).acked, true);
  }
  for (let index = 0; index < 101; index++) {
    await env.FEED_SNAPSHOTS.put("feed-requests/" + index.toString(16).padStart(64, "0"), "{}");
  }
  await worker.scheduled({}, env);
  assert.equal(env.FEED_QUEUE.messages.length, 101);
});

test("重试耗尽的队列消息写入失败快照并释放租约，后续成功结果可覆盖", async t => {
  let now = Date.now();
  t.mock.method(Date, "now", () => now);
  t.mock.method(console, "error", () => {});
  const env = environment();
  t.mock.method(globalThis, "fetch", async () => new Response(xml("恢复后")));
  await request(env);
  const message = env.FEED_QUEUE.messages.shift();
  assert.equal((await consume_feed(env, message, 4, dead_letter_queue)).acked, true);
  const failed = await request(env);
  assert.equal(failed.status, 503);
  assert.equal((await failed.json()).code, "FEED_GENERATION_FAILED");
  assert.ok(![...env.FEED_SNAPSHOTS.values.keys()].some(key => key.startsWith("feed-pending/")));
  now += 600001;
  await worker.scheduled({}, env);
  assert.equal((await consume_feed(env)).acked, true);
  const recovered = await request(env);
  assert.equal(recovered.status, 200);
  assert.match(await recovered.text(), /恢复后/);
});

test("死信处理不覆盖已经成功发布的快照", async t => {
  t.mock.method(console, "error", () => {});
  const env = environment();
  t.mock.method(globalThis, "fetch", async () => new Response(xml("成功结果")));
  await request(env);
  const message = env.FEED_QUEUE.messages.shift();
  await consume_feed(env, message);
  const saved = snapshot_record(env).text;
  assert.equal((await consume_feed(env, message, 4, dead_letter_queue)).acked, true);
  assert.equal(snapshot_record(env).text, saved);
  const response = await request(env);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /成功结果/);
});

test("执行超时同时中止信号并结束等待，错误映射为上游超时", async () => {
  let signal;
  await assert.rejects(
    execute_snapshot({ execute(value) { signal = value; return new Promise(() => {}); } }, 10),
    error => error_code(error) === "UPSTREAM_TIMEOUT",
  );
  assert.equal(signal.aborted, true);
  const result = await execute_snapshot({ execute: async () => ({ result: { output: "{}" } }) }, 50);
  assert.deepEqual(result, { result: { output: "{}" } });
});

test("队列重新检查脚本参数与当前配置，配置改变后不会发布旧任务的结果", async t => {
  const env = environment();
  const script = scripts.find(script => script.file === "rss/github.js");
  const schema = script.metadata.config_schema;
  script.metadata.config_schema = { type: "object", properties: { changed: { type: "boolean", default: false } } };
  t.after(() => { script.metadata.config_schema = schema; });
  t.mock.method(globalThis, "fetch", () => assert.fail("失效任务不得执行"));
  await request(env);
  const message = env.FEED_QUEUE.messages.shift();
  const descriptor_key = "feed-requests/" + message.key;
  const descriptor = JSON.parse(env.FEED_SNAPSHOTS.values.get(descriptor_key).text);
  descriptor.context.params.org = "other";
  await env.FEED_SNAPSHOTS.put(descriptor_key, JSON.stringify(descriptor));
  assert.equal((await consume_feed(env, message)).acked, true);
  await request(env);
  const next = env.FEED_QUEUE.messages.shift();
  env.SCRIPT_CONFIG = '{"rss/github.js":{"changed":true}}';
  assert.equal((await consume_feed(env, next)).acked, true);
  assert.equal(env.FEED_SNAPSHOTS.values.size, 0);
});
