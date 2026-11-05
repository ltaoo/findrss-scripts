import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";
import { readFile } from "node:fs/promises";
import { read_script } from "./support/script_sources.js";
import { compile_script_module, execute_script } from "findrss-worker/server/infra/script_sandbox.js";
import { api_route_cases } from "../worker/catalog.js";
import { check_output, parse_response } from "../scripts/route_checks.js";
import { mock_tcp_http } from "findrss-worker/test/support/tcp_socket_fixture.js";

beforeEach(t => { t.tcp = mock_tcp_http(t); });

const fixtures = JSON.parse(await readFile(new URL("./fixtures/script_migration.json", import.meta.url)));
const scripts = [];
for (const fixture of fixtures.filter(value => ["wxmp", "wxchannels"].includes(value.file))) {
  const source = read_script("rss/" + fixture.file + ".js");
  const compiled = await compile_script_module(source);
  assert.equal(compiled.error, "");
  scripts.push({ ...fixture, source, metadata: compiled.metadata });
}

function run(script, { config = script.config, params = script.params, query = {} } = {}) {
  return execute_script(script.source, { ...script.metadata, config, debug_request: true }, null, {
    method: "GET", pathname: script.metadata.example, params, query, public_origin: "https://feeds.example",
  });
}

test("微信脚本原样请求完整接口地址，发送 Bearer、账号及分页游标，不调用设备且不输出令牌", async t => {
  const timeouts = [];
  const original_timeout = AbortSignal.timeout;
  t.mock.method(AbortSignal, "timeout", ms => {
    timeouts.push(ms);
    return original_timeout(ms);
  });
  for (const script of scripts) {
    const requests = [];
    t.mock.method(globalThis, "fetch", async (url, options) => {
      requests.push({ url, options });
      return new Response(script.responses[0].body);
    });
    const config = { ...script.config, api_url: "https://api.example.test/custom/" + script.file + "/",
      ...(script.file === "wxchannels" ? { PlayerHostname: "https://player.example/video.html" } : {}) };
    const username = script.params.account;
    const account = script.file === "wxchannels" ? username.replace(/@finder$/, "") : username;
    const result = await run(script, { config, params: { account }, query: { offset: " next-page " } });
    assert.equal(result.invoked, false);
    assert.equal(requests.length, 1);
    const { url, options } = requests[0];
    assert.equal(url, config.api_url);
    assert.equal(options.method, "POST");
    const headers = new Headers(options.headers);
    assert.equal(headers.get("Authorization"), "Bearer " + config.auth_token);
    assert.equal(headers.get("Content-Type"), "application/json");
    assert.deepEqual(JSON.parse(options.body), { username, offset: "next-page" });
    assert.equal(timeouts.at(-1), script.file === "wxchannels" ? 60000 : 10000);
    assert.doesNotMatch(JSON.stringify(result), /wechat-private-fixture/);
    const feed = JSON.parse(result.output);
    assert.ok(feed.items.length);
    if (script.file === "wxchannels") {
      assert.equal(t.tcp.connections.length, 1);
      assert.equal(t.tcp.connections[0].closed, true);
      const [entry] = api_route_cases([script]);
      assert.equal(entry.source_host, "channels.weixin.qq.com");
      check_output(entry, parse_response(entry, "application/json", result.output));
      assert.ok(feed.items.find(item => item.type === "video").content.includes("https://player.example/video.html?"));
    }
  }
});

test("微信接口配置缺失、非 HTTPS 地址和请求头注入在出网前拒绝", async t => {
  t.mock.method(globalThis, "fetch", () => assert.fail("无效配置不得出网"));
  for (const script of scripts) {
    for (const config of [{}, { api_url: script.config.api_url }, { auth_token: "fixture" },
      { ...script.config, api_url: "http://api.example.test" }, { ...script.config, auth_token: "" },
      { ...script.config, auth_token: "secret\r\nHost: evil.example" }]) {
      await assert.rejects(run(script, { config }), /脚本配置无效/);
    }
  }
});

test("微信接口透传 HTTP 错误并拒绝非 JSON 及微信业务错误", async t => {
  for (const script of scripts) {
    for (const [status, body, code] of [
      [401, "Unauthorized", "UPSTREAM_AUTH_REQUIRED"],
      [504, '{"error":"抓取超时（10s）"}', "UPSTREAM_TIMEOUT"],
      [200, "<html>Error</html>", "UPSTREAM_INVALID_RESPONSE"],
      [200, '{"BaseResponse":{"Ret":-1}}', "UPSTREAM_INVALID_RESPONSE"],
    ]) {
      let calls = 0;
      t.mock.method(globalThis, "fetch", async () => {
        calls++;
        return new Response(body, { status });
      });
      await assert.rejects(run(script), error => error.problem?.code === code);
      assert.equal(calls, script.file === "wxchannels" && status === 504 ? 2 : 1);
    }
  }
});

test("视频号上游超时后仅重试一次，保留账号和分页游标并恢复完整列表", async t => {
  const script = scripts.find(value => value.file === "wxchannels");
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => ++calls === 1
    ? new Response("timeout", { status: 504 }) : new Response(script.responses[0].body));
  const result = await run(script, { query: { offset: "next-page" } });
  assert.equal(calls, 2);
  assert.ok(JSON.parse(result.output).items.length);
  assert.deepEqual(t.tcp.requests.map(request => JSON.parse(request.body)), [
    { username: script.params.account, offset: "next-page" },
    { username: script.params.account, offset: "next-page" },
  ]);
});

test("视频号回包被截断后重试，第二次完整 JSON 正常解析", async t => {
  const script = scripts.find(value => value.file === "wxchannels");
  const connect = globalThis.__testTcpConnect;
  let attempts = 0;
  t.mock.method(globalThis, "__testTcpConnect", (address, options) => ++attempts === 1 ? {
    opened: Promise.resolve(),
    readable: new Response('HTTP/1.1 200 OK\r\nContent-Length: 100\r\n\r\n{').body,
    writable: new WritableStream(),
    close: async () => {},
  } : connect(address, options));
  t.mock.method(globalThis, "fetch", async () => new Response(script.responses[0].body));
  const result = await run(script);
  assert.equal(attempts, 2);
  assert.ok(JSON.parse(result.output).items.length);
});
