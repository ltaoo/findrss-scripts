import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { create_signature_cache } from "../worker/cookie_sync.js";
import { get_quickjs_module } from "findrss-worker/server/infra/script_sandbox.js";
import worker from "../worker/index.js";

const QuickJS = await get_quickjs_module();
const home = readFileSync(new URL("./fixtures/douyin/home.html", import.meta.url), "utf8");
const sources = ["bdms", "security"].map(name => gunzipSync(readFileSync(
  new URL("./fixtures/douyin/" + name + ".js.gz", import.meta.url))));
const request = {
  url: "https://www-hj.douyin.com/aweme/v1/web/aweme/post/?aid=6383&sec_user_id=author&count=18&max_cursor=0&timestamp=1",
  cookie: "UIFID_TEMP=fixture-private-fingerprint; sessionid=fixture-private-login",
  user_agent: "Mozilla/5.0 Chrome/156.0.0.0",
};
let index = 0;
const fresh = () => import("findrss-worker/server/infra/douyin_sdk.js?stored=" + index++);
function environment() {
  const records = new Map();
  return { records, COOKIE_STORAGE_KEY: "12".repeat(32), COOKIE_KV: {
    async get(key) { return records.has(key) ? JSON.parse(records.get(key)) : null; },
    async put(key, value) { records.set(key, value); },
    async delete(key) { records.delete(key); },
  } };
}
function upstream(t) {
  t.mock.method(globalThis, "fetch", async url => new Response(url === "https://www.douyin.com/"
    ? home : sources[url.includes("bdms") ? 0 : 1]));
}

test("KV 加密签名跨实例复用，不重新初始化 SDK；旧 KV 读值不能恢复被拒绝的签名", async t => {
  upstream(t);
  const env = environment();
  const storage = create_signature_cache(env);
  const first_instance = await fresh();
  let creates = 0;
  const create = async () => { creates++; return QuickJS; };
  const first = await first_instance.get_douyin_signature(create, request, storage);
  assert.equal(env.records.size, 1);
  assert.doesNotMatch(JSON.stringify([...env.records.values()]), /fixture-private|a_bogus|douyin\.com/);
  const second_instance = await fresh();
  const second = await second_instance.get_douyin_signature(create, request, storage);
  assert.equal(second.url, first.url);
  assert.deepEqual(second.headers, first.headers);
  assert.equal(creates, 1);
  env.COOKIE_KV.delete = async () => {}; // 模拟 KV 删除还未传播。
  await second_instance.invalidate_douyin_signature(second);
  const renewed = await second_instance.get_douyin_signature(create, request, storage);
  assert.notEqual(renewed.url, second.url);
  assert.equal(creates, 2);
  await second_instance.invalidate_douyin_signature(second);
  assert.equal(await second_instance.get_douyin_signature(create, request, storage), renewed);
  await second_instance.get_douyin_signature(create, { ...request, cookie: request.cookie + "-new" }, storage);
  assert.equal(creates, 3);
});

test("KV 密文绑定存储键和密钥，缓存禁用、损坏或不可用时仍能生成有效签名", async t => {
  upstream(t);
  assert.equal(create_signature_cache({}), undefined);
  const env = environment();
  const storage = create_signature_cache(env);
  const key = "a".repeat(64);
  await storage.write(key, { url: "https://www-hj.douyin.com/", headers: {} });
  const encrypted = env.records.get("douyin-signature:" + key);
  env.records.set("douyin-signature:" + "b".repeat(64), encrypted);
  await assert.rejects(storage.read("b".repeat(64)));
  await assert.rejects(create_signature_cache({ ...env, COOKIE_STORAGE_KEY: "34".repeat(32) }).read(key));
  await assert.rejects(storage.read("../cookies"));
  const module = await fresh();
  const broken = { async read() { throw Error("unavailable"); }, async write() { throw Error("quota"); }, async remove() { throw Error("unavailable"); } };
  const signed = await module.get_douyin_signature(async () => QuickJS, request, broken);
  assert.ok(signed.url.includes("a_bogus="));
  assert.equal(await module.get_douyin_signature(() => assert.fail("应复用内存签名"), request, broken), signed);
  await module.invalidate_douyin_signature(signed);
});

test("持久化签名仍校验来源和凭据头，不向缓存中的其它来源发送请求", async t => {
  upstream(t);
  const module = await fresh();
  const storage = { async read() { return { url: "https://other.example/", headers: { uifid: "bad\r\nheader" } }; }, async write() {} };
  const signed = await module.get_douyin_signature(async () => QuickJS, request, storage);
  assert.equal(new URL(signed.url).origin, "https://www-hj.douyin.com");
});

test("正式 Worker 的 JSON 和 RSS 路由共用加密签名缓存", async t => {
  const env = { ...environment(), ACCESS_TOKEN: "fixture-access", SCRIPT_COOKIES: JSON.stringify([
    { name: "UIFID_TEMP", value: "fixture-worker-fingerprint", domain: ".douyin.com", path: "/", secure: true },
  ]) };
  const fixture = JSON.parse(readFileSync(new URL("./fixtures/script_migration.json", import.meta.url)))
    .find(entry => entry.file === "douyin");
  const urls = [];
  t.mock.method(globalThis, "fetch", async url => {
    if (url === "https://www.douyin.com/") return new Response(home);
    if (!url.startsWith("https://www-hj.douyin.com/")) return new Response(sources[url.includes("bdms") ? 0 : 1]);
    urls.push(url);
    return new Response(fixture.responses[0].body);
  });
  const path = "/douyin/user/" + fixture.params.sec_uid + "?count=4";
  for (const prefix of ["/api/rss", "/rss"]) {
    const response = await worker.fetch(new Request("https://scripts.example" + prefix + path,
      { headers: { Authorization: "Bearer fixture-access" } }), env);
    assert.equal(response.status, 200);
    assert.ok((await response.text()).includes("测试作者"));
  }
  assert.equal(urls.length, 2);
  assert.equal(urls[0], urls[1]);
  assert.equal([...env.records.keys()].filter(key => key.startsWith("douyin-signature:")).length, 1);
});
