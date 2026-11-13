import assert from "node:assert/strict";
import test from "node:test";
import { sync_inspection_cookies } from "../scripts/sync_inspection_cookies.js";
import { clear_cookie_read_cache, load_cookies, update_cookies } from "../worker/cookie_sync.js";

const options = { source_url: "https://cookies.example/admin/api/cookies", admin_password: "admin-secret", access_token: "local-secret" };
const cookie = { domain: ".example.com", name: "sid", value: "private-cookie-value", path: "/" };

test("巡检前获取完整 Cookie 快照，经原有鉴权入口写入加密 KV，覆盖已移除的站点", async () => {
  clear_cookie_read_cache();
  const values = new Map();
  const env = {
    ACCESS_TOKEN: options.access_token, COOKIE_STORAGE_KEY: "ab".repeat(32),
    COOKIE_KV: { get: async key => values.has(key) ? JSON.parse(values.get(key)) : null, put: async (key, value) => values.set(key, value) },
  };
  const origins = ["https://www.example.com", "https://removed.example.org"];
  const calls = [];
  const result = await sync_inspection_cookies(options, async (url, init) => {
    calls.push(url);
    assert.equal(init.redirect, "error");
    if (calls.length === 1) {
      assert.equal(init.headers.Authorization, "Bearer admin-secret");
      return Response.json({ cookies: [cookie] });
    }
    assert.equal(init.headers.Authorization, "Bearer local-secret");
    return update_cookies(new Request(url, init), env, origins, {});
  });
  assert.deepEqual(calls, [options.source_url, "http://127.0.0.1:8801/api/cookies/update"]);
  assert.deepEqual(result, { received: 1, stored: 1 });
  assert.doesNotMatch([...values.values()].join(""), /private-cookie-value|admin-secret/);
  assert.deepEqual(await load_cookies(env, { cookies: [{ origin: origins[0] }] }, []), [cookie]);
  assert.deepEqual(await load_cookies(env, { cookies: [{ origin: origins[1] }] }, [{ ...cookie, domain: ".example.org" }]), []);
});

test("来源失败、空数据、损坏 Cookie 均不写入数据库，不泄漏响应内容", async () => {
  for (const response of [new Response("private-cookie-value", { status: 401 }), Response.json({ cookies: [] }), Response.json({ cookies: [{ ...cookie, name: "bad;name" }] }), Response.json({ unexpected: true })]) {
    let calls = 0;
    await assert.rejects(sync_inspection_cookies(options, async () => {
      calls++;
      return response;
    }), error => !error.message.includes("private-cookie-value"));
    assert.equal(calls, 1);
  }
});

test("拒绝 HTTP 来源、缺失凭据及数据库写入失败", async () => {
  const never = async () => { throw new Error("不应发送请求"); };
  await assert.rejects(sync_inspection_cookies({ ...options, source_url: "http://cookies.example/" }, never), /HTTPS/);
  await assert.rejects(sync_inspection_cookies({ ...options, admin_password: "" }, never), /缺少/);
  let calls = 0;
  await assert.rejects(sync_inspection_cookies(options, async () => ++calls === 1
    ? Response.json({ cookies: [cookie] }) : new Response("private-cookie-value", { status: 503 })), /写入本地 Cookie 数据库失败：HTTP 503/);
});
