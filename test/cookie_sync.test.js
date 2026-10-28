import assert from "node:assert/strict";
import test from "node:test";
import { createCipheriv, createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import worker from "../worker/index.js";
import { load_cookies } from "../worker/cookie_sync.js";

const origin = "https://scripts.findrss.cloud";
const uuid = "fixture-uuid";
const password = "fixture-password";
const push_key = createHash("md5").update(uuid + "-" + password).digest("hex").slice(0, 16);
const instagram = ["sessionid", "csrftoken"].map(name => ({ name, value: "private-" + name, domain: ".instagram.com", path: "/", secure: true }));
const permission = host => ({ cookies: [{ origin: "https://" + host }] });

function environment() {
  const values = new Map();
  return {
    ACCESS_TOKEN: "private-access-token", COOKIE_STORAGE_KEY: "12".repeat(32),
    COOKIE_PUSH_UUID: uuid, COOKIE_PUSH_KEY: push_key,
    COOKIE_KV: {
      values,
      async get(key) { return values.has(key) ? JSON.parse(values.get(key)) : null; },
      async put(key, value) { values.set(key, value); },
    },
  };
}

function payload(cookies = instagram, domains = ["instagram.com"]) {
  const cipher = createCipheriv("aes-128-cbc", Buffer.from(push_key), Buffer.alloc(16));
  const data = Buffer.concat([cipher.update(JSON.stringify(cookies)), cipher.final()]).toString("base64");
  return { uuid, crypto_type: "aes-128-cbc-fixed", update_time: new Date().toISOString(), domains, data };
}

const upload = (body, env, headers = {}) => worker.fetch(new Request(origin + "/api/cookies/update", {
  method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body),
}), env);
const authorized = { Authorization: "Bearer private-access-token" };

test("dm AES 上传无需额外字段，KV 只存随机 IV 的密文，RSS 能读取凭据", async t => {
  const env = environment();
  const body = payload();
  const response = await upload(body, env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { updated: true, count: 2, skipped: 0, action: "done", code: 0, msg: "成功", data: { count: 2, skipped: 0 } });
  const stored = env.COOKIE_KV.values.get("cookies:https://www.instagram.com");
  assert.doesNotMatch(stored, /private-sessionid|private-csrftoken|sessionid|password/);
  assert.deepEqual(await load_cookies(env, permission("www.instagram.com"), []), instagram);
  await upload(body, env);
  assert.notEqual(env.COOKIE_KV.values.get("cookies:https://www.instagram.com"), stored);

  const profile = '["DTSGInitialData",[],{"token":"fixture-dtsg"}];["LSD",[],{"token":"fixture-lsd"}]';
  const fixture = await readFile(new URL("./fixtures/instagram_profile.json", import.meta.url), "utf8");
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers.Cookie, "sessionid=private-sessionid; csrftoken=private-csrftoken");
    return new Response(url.endsWith("/graphql/query") ? fixture : profile);
  };
  const denied = await worker.fetch(new Request(origin + "/rss/instagram/katarinabluu"), env);
  assert.equal(denied.status, 401);
  const rss = await worker.fetch(new Request(origin + "/rss/instagram/katarinabluu", { headers: authorized }), env);
  assert.equal(rss.status, 200);
  assert.match(await rss.text(), /<rss\b/);
});

test("拒绝错误 UUID、错误解密密码和未鉴权的明文上传", async () => {
  const env = environment();
  const valid = payload();
  for (const [body, code] of [
    [{ ...valid, uuid: "other-uuid" }, "COOKIE_SYNC_UUID_MISMATCH"],
    [{ ...valid, uuid: undefined }, "COOKIE_SYNC_UUID_MISMATCH"],
    [{ ...valid, crypto_type: "none", data: JSON.stringify(instagram) }, "COOKIE_SYNC_ENCRYPTION_REQUIRED"],
  ]) {
    const response = await upload(body, env);
    assert.equal(response.status, 401);
    assert.equal((await response.json()).code, code);
    assert.equal(env.COOKIE_KV.values.size, 0);
  }
  const response = await upload(valid, { ...env, COOKIE_PUSH_KEY: "00".repeat(8) });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, "COOKIE_SYNC_DECRYPT_FAILED");
  assert.equal(env.COOKIE_KV.values.size, 0);
});

test("兼容原版 dm 的四字段 legacy 请求，不要求 signature、domains 或时间窗口", async t => {
  const digest = crypto.subtle.digest.bind(crypto.subtle);
  t.mock.method(crypto.subtle, "digest", async (algorithm, input) => algorithm === "MD5"
    ? Uint8Array.from(createHash("md5").update(input).digest()).buffer : digest(algorithm, input));
  const salt = Buffer.from("12345678");
  const blocks = [];
  for (let index = 0; index < 3; index++) blocks.push(createHash("md5").update(Buffer.concat([blocks.at(-1) || Buffer.alloc(0), Buffer.from(push_key), salt])).digest());
  const key_iv = Buffer.concat(blocks);
  const cipher = createCipheriv("aes-256-cbc", key_iv.subarray(0, 32), key_iv.subarray(32));
  const data = Buffer.concat([Buffer.from("Salted__"), salt, cipher.update(JSON.stringify(instagram)), cipher.final()]).toString("base64");
  const body = { crypto_type: "legacy", data, update_time: "2026-10-28T05:32:54.068Z", uuid };
  const env = environment();
  const response = await upload(body, env);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).count, 2);
  assert.deepEqual(await load_cookies(env, permission("www.instagram.com"), []), instagram);
});

test("按域名替换快照，空范围快照清除旧 Cookie，其他站点和静态回退不丢失", async () => {
  const env = environment();
  const weibo = [{ ...instagram[0], name: "SUB", domain: ".weibo.com" }];
  await upload(payload(), env);
  await upload(payload(weibo, ["weibo.com"]), env);
  assert.deepEqual(await load_cookies(env, permission("www.instagram.com"), []), instagram);
  const loaded = await load_cookies(env, { cookies: [{ origin: "https://www.weibo.com" }, { origin: "https://weibo.com" }] }, []);
  assert.deepEqual(loaded, weibo);
  const cleared = await upload(payload([], ["instagram.com"]), env);
  assert.equal((await cleared.json()).count, 0);
  assert.deepEqual(await load_cookies(env, permission("www.instagram.com"), instagram), []);
  assert.deepEqual(await load_cookies(env, permission("www.weibo.com"), []), weibo);
  assert.deepEqual(await load_cookies(env, permission("www.youtube.com"), instagram), instagram);
});

test("同步校验失败不会覆盖旧值，KV 故障和损坏密文不会被当作成功", async () => {
  const env = environment();
  await upload(payload(), env);
  const snapshot = [...env.COOKIE_KV.values];
  for (const body of [
    payload([{ ...instagram[0], value: "a\r\nCookie: stolen" }]),
    payload([{ ...instagram[0], domain: "https://instagram.com" }]),
    payload([{ ...instagram[0], path: 12 }]),
    payload([], []), payload([], ["unsupported.example"]),
    { ...payload(), data: "not valid ciphertext" },
  ]) {
    const response = await upload(body, env);
    assert.equal(response.status, 400);
    assert.deepEqual([...env.COOKIE_KV.values], snapshot);
  }
  env.COOKIE_KV.put = async () => { throw new Error("private KV error"); };
  const failed = await upload(payload(), env);
  assert.equal(failed.status, 503);
  assert.equal((await failed.json()).code, "COOKIE_STORAGE_UNAVAILABLE");
  env.COOKIE_KV.values.set("cookies:https://www.weibo.com", snapshot[0][1]);
  await assert.rejects(load_cookies(env, permission("www.weibo.com"), []), error => error.code === "COOKIE_STORAGE_UNAVAILABLE");
  env.COOKIE_STORAGE_KEY = "34".repeat(32);
  await assert.rejects(load_cookies(env, permission("www.instagram.com"), []), error => error.code === "COOKIE_STORAGE_UNAVAILABLE");
});

test("对齐主项目：跳过浏览器无名 Cookie，全为无名 Cookie 不覆盖已有数据", async () => {
  const env = environment();
  const unnamed = { name: "", value: "instagram.com", domain: ".instagram.com" };
  const response = await upload(payload([unnamed, ...instagram]), env);
  const result = await response.json();
  assert.equal(result.code, 0);
  assert.equal(result.count, 2);
  assert.equal(result.skipped, 1);
  const snapshot = [...env.COOKIE_KV.values];
  assert.equal((await upload(payload([unnamed]), env)).status, 400);
  assert.deepEqual([...env.COOKIE_KV.values], snapshot);
});

test("同步入口限制方法、JSON 类型、请求大小，明文上传须 Bearer 鉴权", async () => {
  const env = environment();
  const plain = { crypto_type: "none", data: JSON.stringify(instagram), update_time: new Date().toISOString() };
  assert.equal((await upload(plain, env)).status, 401);
  assert.equal((await upload(plain, env, authorized)).status, 200);
  const get = await worker.fetch(new Request(origin + "/api/cookies/update"), env);
  assert.equal(get.status, 405);
  assert.equal(get.headers.get("Allow"), "POST");
  assert.equal((await upload(payload(), { ...env, ACCESS_TOKEN: undefined })).status, 503);
  for (const [body, headers, status] of [
    ["bad json", { "Content-Type": "application/json" }, 400],
    ["{}", { "Content-Type": "text/plain" }, 415],
    [" ".repeat(2 * 1024 * 1024 + 1), { "Content-Type": "application/json" }, 413],
  ]) {
    const response = await worker.fetch(new Request(origin + "/api/cookies/update", { method: "POST", headers, body }), env);
    assert.equal(response.status, status);
  }
});
