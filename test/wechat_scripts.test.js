import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { read_script } from "./support/script_sources.js";
import { compile_script_module, execute_script } from "findrss-worker/server/infra/script_sandbox.js";

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
    assert.doesNotMatch(JSON.stringify(result), /wechat-private-fixture/);
    const feed = JSON.parse(result.output);
    assert.ok(feed.items.length);
    if (script.file === "wxchannels") {
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
      t.mock.method(globalThis, "fetch", async () => new Response(body, { status }));
      await assert.rejects(run(script), error => error.problem?.code === code);
    }
  }
});
