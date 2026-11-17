import assert from "node:assert/strict";
import test from "node:test";
import { spawn } from "node:child_process";
import { create_instabox_signer } from "../worker/instabox.js";

const env = { INSTABOX_API_KEY: "private-api-key", INSTABOX_MACHINE: "m_fixture" };
const request = { url: "https://www-hj.douyin.com/aweme/v1/web/aweme/post/?count=18", cookie: "UIFID=private-cookie", user_agent: "fixture-agent" };
const signature = { url: request.url + "&a_bogus=fixture", headers: { uifid: "fixture", "x-secsdk-web-signature": "signed", "x-secsdk-web-expire": "123" } };
const response = value => Response.json(value);

test("远端签名只执行固定程序，凭据走 API 请求头和 stdin，缓存未配置时保持本地签名", async t => {
  assert.equal(create_instabox_signer({}), undefined);
  assert.throws(() => create_instabox_signer({ INSTABOX_MACHINE: "findrss" }), { code: "CONFIG_INVALID" });
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options });
    return response(url.endsWith("/exec") ? { exitCode: 0, stdout: JSON.stringify(signature) } : { state: "running", runtime: { ready: true } });
  });
  assert.deepEqual(await create_instabox_signer(env)(request), signature);
  assert.equal(calls.length, 2);
  for (const { url, options } of calls) {
    assert.equal(new URL(url).origin, "https://api.instabox.sh");
    assert.equal(options.headers["X-API-Key"], env.INSTABOX_API_KEY);
    assert.equal(options.redirect, "manual");
  }
  const command = JSON.parse(calls[1].options.body);
  assert.deepEqual(command.argv, ["node", "/data/home/findrss-signing/douyin-signer.mjs"]);
  assert.deepEqual(JSON.parse(command.stdin), request);
  assert.equal(command.noHistory, true);
  assert.ok(!JSON.stringify(command.argv).includes("private"));
});

test("关机或暂停的机器按需启动，巡检关机打断签名时只重试一次", async t => {
  t.mock.method(globalThis, "setTimeout", callback => { queueMicrotask(callback); return 0; });
  const states = ["stopped", "starting", "running", "stopping", "paused", "running"];
  const paths = [];
  let executions = 0;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const path = new URL(url).pathname.split("/").at(-1);
    paths.push(path);
    if (path === "start") {
      assert.ok(options.headers["Idempotency-Key"]);
      return response({ status: "pending" });
    }
    if (path === "exec") return ++executions === 1 ? response_with_status(503)
      : response({ exitCode: 0, stdout: JSON.stringify(signature) });
    return response({ state: states.shift() });
  });
  assert.deepEqual(await create_instabox_signer(env)(request), signature);
  assert.equal(executions, 2);
  assert.equal(paths.filter(path => path === "start").length, 2);
  assert.equal(states.length, 0);
});
const response_with_status = status => new Response("private failure details", { status });

test("远端鉴权、执行、输出失败和取消不会降级成本地高 CPU 签名或泄露远端日志", async t => {
  for (const result of [{ exitCode: 1, stderr: "private-cookie" }, { exitCode: 0, truncated: true, stdout: "{}" },
    { exitCode: 0, stdout: "not json" }, { exitCode: 0, timedOut: true, stdout: "{}" }]) {
    t.mock.method(globalThis, "fetch", async url => response(url.endsWith("/exec") ? result : { state: "running" }));
    await assert.rejects(create_instabox_signer(env)(request), error => error.code === "SOURCE_UNAVAILABLE" && !error.message.includes("private"));
  }
  t.mock.method(globalThis, "fetch", async () => response_with_status(401));
  await assert.rejects(create_instabox_signer(env)(request), { code: "SOURCE_UNAVAILABLE", status: 401 });
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 302, headers: { Location: "https://other.example/" } }));
  await assert.rejects(create_instabox_signer(env)(request), { code: "SOURCE_UNAVAILABLE", status: 302 });
  const controller = new AbortController();
  controller.abort();
  t.mock.method(globalThis, "fetch", async (_, options) => { options.signal.throwIfAborted(); });
  await assert.rejects(create_instabox_signer(env, controller.signal)(request), { name: "AbortError" });
});

test("机器一直未就绪时限制轮询次数，不重复启动或耗尽 CF 子请求额度", async t => {
  t.mock.method(globalThis, "setTimeout", callback => { queueMicrotask(callback); return 0; });
  let reads = 0, starts = 0;
  t.mock.method(globalThis, "fetch", async url => {
    if (url.endsWith("/start")) { starts++; return response({ state: "pending" }); }
    reads++;
    return response({ state: "stopped" });
  });
  await assert.rejects(create_instabox_signer(env)(request), { code: "SOURCE_UNAVAILABLE" });
  assert.equal(reads, 24);
  assert.equal(starts, 1);
});

test("独立签名程序拒绝非作品接口和超大输入，错误输出不包含凭据", async () => {
  for (const input of [JSON.stringify({ ...request, url: "https://example.com/" }), "x".repeat(128 * 1024 + 1)]) {
    const proc = spawn(process.execPath, [new URL("../dist/douyin-signer.mjs", import.meta.url).pathname], { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    proc.stdout.on("data", chunk => stdout += chunk);
    proc.stderr.on("data", chunk => stderr += chunk);
    proc.stdin.on("error", () => {});
    proc.stdin.end(input);
    assert.equal(await new Promise(resolve => proc.on("close", resolve)), 1);
    assert.equal(stdout, "");
    assert.ok(!stderr.includes("private-cookie"));
    assert.match(stderr, /Douyin signing failed/);
  }
});
