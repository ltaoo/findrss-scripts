import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { transform } from "esbuild";
import puppeteer from "../.runtime/findrss-worker/node_modules/@cloudflare/puppeteer/lib/esm/puppeteer/puppeteer-cloudflare.js";
import worker from "../worker/index.js";
import { create_browser_session } from "../worker/browser_session.js";
import { load_browser_session, save_browser_session } from "../worker/cookie_sync.js";
import { create_puppeteer_navigate } from "findrss-worker/server/infra/script_puppeteer.js";

const origin = "https://www.javlibrary.com";
const user_agent = "VerifiedBrowser/1.0";
const cookie = value => ({ name: "cf_clearance", value, domain: ".javlibrary.com", path: "/", secure: true,
  httpOnly: true, expires: Date.now() / 1000 + 3600 });
const page_html = '<title>演员 - JAVLibrary</title><div id="rightcolumn"><div class="boxtitle">演员 所演出的影片</div>' +
  '<div class="videothumblist"><div class="video"><a href="./movie1.html"><div class="id">ABC-123</div><div class="title">测试作品</div></a></div></div></div>';
const permissions = { cookies: [{ id: "site", origin, path_prefix: "/", names: ["cf_clearance"] }] };
const metadata = () => ({ permissions, config: {}, config_schema: { properties: { use_cookies: {}, user_agent: {} } } });
function environment(values = new Map()) {
  return { ACCESS_TOKEN: "fixture-access-token", COOKIE_STORAGE_KEY: "12".repeat(32), BROWSER: {},
    COOKIE_KV: { values, async get(key) { return values.has(key) ? JSON.parse(values.get(key)) : null; },
      async put(key, value) { values.set(key, value); } } };
}
const request = (env, path = "/api/rss/javlibrary/star/abc123") => worker.fetch(new Request("https://feeds.example" + path, {
  headers: { Authorization: "Bearer " + env.ACCESS_TOKEN },
}), env);

function mock_browser(t, state, warm = false) {
  const calls = [];
  const browsers = new Map();
  if (warm) t.mock.method(puppeteer, "connect", async (_binding, id) => {
    calls.push(["connect", id]);
    if (state.reject_connect || !browsers.has(id)) throw new Error("会话已关闭");
    return browsers.get(id);
  });
  t.mock.method(puppeteer, "launch", async () => {
    calls.push(["launch"]);
    let url = "about:blank";
    const id = "private-session-" + calls.filter(([kind]) => kind === "launch").length;
    const browser = { async newPage() { return {
      async setViewport() {}, async setUserAgent(value) { calls.push(["user_agent", value]); },
      async setCookie(...cookies) { calls.push(["cookies", cookies]); },
      async goto(value) { url = value; }, async waitForSelector() { if (state.fail) throw new Error("页面加载失败"); },
      async evaluate(script) {
        if (script === "navigator.userAgent") return user_agent;
        if (typeof script === "function") return undefined;
        return JSON.stringify({ html: state.html });
      },
      url: () => url, async cookies() { return [cookie(state.cookie)]; },
      async close() { calls.push(["page_close"]); },
    }; }, async close() { calls.push(["close"]); browsers.delete(id); },
      ...(warm ? { sessionId: () => id, async disconnect() { calls.push(["disconnect"]); } } : {}) };
    browsers.set(id, browser);
    return browser;
  });
  return calls;
}

test("浏览器验证成功后加密保存，重建宿主后直接用 Cookie/UA 请求，手动同步不会清除验证缓存", async t => {
  const env = environment();
  const state = { html: page_html, cookie: "verified-1" };
  const calls = mock_browser(t, state);
  let accepted = state.cookie;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(new URL(url).origin, origin);
    const headers = new Headers(options.headers);
    return headers.get("cookie") === "cf_clearance=" + accepted && headers.get("user-agent") === user_agent
      ? new Response(page_html) : new Response("Challenge", { status: 403 });
  });
  assert.equal((await request(env)).status, 200);
  const ciphertext = env.COOKIE_KV.values.get("browser-session:" + origin);
  assert.ok(ciphertext);
  assert.doesNotMatch(ciphertext, /verified-1|VerifiedBrowser|cf_clearance/);
  const saved = await load_browser_session(env, origin);
  assert.equal(saved.user_agent, user_agent);
  assert.equal(saved.cookies[0].value, "verified-1");
  assert.equal(saved.cookies[0].httpOnly, true);
  const restarted = { ...environment(new Map(env.COOKIE_KV.values)), BROWSER: undefined };
  const second = await request(restarted);
  assert.equal(second.status, 200);
  assert.equal((await second.json()).items.length, 1);
  const synced = await worker.fetch(new Request("https://feeds.example/api/cookies/update", {
    method: "POST", headers: { Authorization: "Bearer " + env.ACCESS_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ crypto_type: "none", domains: ["javlibrary.com"], data: "[]" }),
  }), restarted);
  assert.equal(synced.status, 200);
  assert.equal((await request(restarted)).status, 200);
  assert.equal(calls.filter(([kind]) => kind === "launch").length, 1);
  const debug = await request(restarted, "/debug/javlibrary/star/abc123");
  assert.equal(debug.status, 200);
  assert.doesNotMatch(await debug.text(), /verified-1|fixture-access-token/);

  accepted = state.cookie = "verified-2";
  assert.equal((await request({ ...restarted, BROWSER: {} })).status, 200);
  assert.ok(calls.some(([kind, value]) => kind === "user_agent" && value === user_agent));
  assert.ok(calls.some(([kind, value]) => kind === "cookies" && value[0].value === "verified-1"));
  assert.equal((await request(restarted)).status, 200);
  assert.equal(calls.filter(([kind]) => kind === "launch").length, 2);
  assert.equal((await load_browser_session(restarted, origin)).cookies[0].value, "verified-2");
});

test("上游仍要求浏览器时连接已验证会话，不重复启动；关闭或过期后重建", async t => {
  const env = environment();
  const state = { html: page_html, cookie: "verified" };
  const calls = mock_browser(t, state, true);
  t.mock.method(globalThis, "fetch", async () => new Response("Browser required", { status: 403 }));
  assert.equal((await request(env)).status, 200);
  assert.equal(calls.filter(([kind]) => kind === "launch").length, 1);
  const restarted = environment(new Map(env.COOKIE_KV.values));
  const debug = await request(restarted, "/debug/javlibrary/star/abc123");
  assert.equal(debug.status, 200);
  const html = await debug.text();
  assert.match(html, /browser_launches&quot;:0/);
  assert.match(html, /browser_reuses&quot;:1/);
  assert.doesNotMatch(html, /private-session-|verified/);
  assert.equal(calls.filter(([kind]) => kind === "launch").length, 1);
  assert.equal(calls.filter(([kind]) => kind === "close").length, 0);
  state.reject_connect = true;
  assert.equal((await request(restarted)).status, 200);
  assert.equal(calls.filter(([kind]) => kind === "launch").length, 2);
  state.reject_connect = false;
  const saved = await load_browser_session(restarted, origin);
  await save_browser_session(restarted, origin, { ...saved, session_expires_at: 1 });
  assert.equal((await request(restarted)).status, 200);
  assert.equal(calls.filter(([kind]) => kind === "launch").length, 3);
  assert.equal(calls.filter(([kind]) => kind === "close").length, 1);
});

test("浏览器提取后的脚本校验失败会关闭新会话，不写入可复用状态", async t => {
  const env = environment();
  const calls = mock_browser(t, { html: "<html>结构已变化</html>", cookie: "not-verified" }, true);
  t.mock.method(globalThis, "fetch", async () => new Response("Challenge", { status: 403 }));
  assert.equal((await request(env)).status, 502);
  assert.equal(env.COOKIE_KV.values.size, 0);
  assert.equal(calls.filter(([kind]) => kind === "launch").length, 1);
  assert.equal(calls.filter(([kind]) => kind === "close").length, 1);
});

test("Workers 打包替换宿主 navigator.userAgent 时，仍读取真实页面中的 User-Agent", async () => {
  const bundled = await transform("globalThis.create = " + create_puppeteer_navigate.toString(), {
    define: { "navigator.userAgent": '"Cloudflare-Workers"' },
  });
  const context = { URL, TextEncoder, AbortSignal, setTimeout, MAX_SCRIPT_BYTES: 1024 * 1024 };
  vm.runInNewContext(bundled.code, context);
  const page = { async setViewport() {}, async goto() {}, url: () => origin, async cookies() { return [cookie("verified")]; },
    async evaluate(script, arg) {
      return vm.runInNewContext(typeof script === "string" ? script : `(${String(script)})(arg)`, {
        navigator: { userAgent: user_agent }, TextEncoder, arg, setTimeout,
        document: { fonts: { ready: Promise.resolve() }, documentElement: { outerHTML: page_html } },
      });
    } };
  let captured;
  const navigate = context.create({}, { async launch() { return { async newPage() { return page; }, async close() {} }; } }, {
    async restore() { return {}; }, async capture(value) { captured = value; },
  });
  await navigate(origin, { wait_ms: 0 });
  assert.equal(captured.user_agent, user_agent);
});

test("缺少、过期 Cookie 可进入浏览器刷新，浏览器失败或内容无效不覆盖旧缓存", async t => {
  const env = environment();
  env.SCRIPT_CONFIG = JSON.stringify({ "rss/javlibrary.js": { use_cookies: true, user_agent } });
  const state = { html: page_html, cookie: "fresh" };
  const calls = mock_browser(t, state);
  t.mock.method(globalThis, "fetch", async () => new Response("Challenge", { status: 403 }));
  assert.equal((await request(env)).status, 200);
  const valid = await load_browser_session(env, origin);
  await save_browser_session(env, origin, { ...valid, cookies: valid.cookies.map(cookie => ({ ...cookie, expirationDate: 1 })) });
  assert.equal((await request(env)).status, 200);
  assert.equal(calls.filter(([kind]) => kind === "launch").length, 2);
  const before = env.COOKIE_KV.values.get("browser-session:" + origin);
  for (const html of ['<title>Just a moment...</title>', '<html>Missing list</html>']) {
    state.html = html;
    const response = await request(env);
    assert.equal(response.status, 502);
    assert.equal(env.COOKIE_KV.values.get("browser-session:" + origin), before);
  }
  state.fail = true;
  assert.equal((await request(env)).status, 502);
  assert.equal(env.COOKIE_KV.values.get("browser-session:" + origin), before);
  assert.equal(calls.filter(([kind]) => kind === "launch").length, calls.filter(([kind]) => kind === "close").length);
});

test("会话只保存授权 Cookie，保留作用域和期限，跨站及越权重定向不保存", async () => {
  const env = environment();
  const info = metadata();
  info.permissions = { cookies: [{ ...permissions.cookies[0], path_prefix: "/allowed/", names: ["cf_clearance", "__cf_bm"] }] };
  const session = await create_browser_session(env, info, []);
  assert.equal(await session.navigation.restore("https://evil.example/allowed/"), null);
  assert.equal(await session.navigation.restore(origin + "/private/"), null);
  const good = { ...cookie("allowed"), path: "/allowed/" };
  const capture = { url: origin + "/allowed/list", final_url: origin + "/allowed/list", user_agent,
    cookies: [good, { ...good, name: "account_secret" }, { ...good, value: "foreign", domain: ".evil.example" },
      { ...good, value: "expired", expires: 1 }, { ...good, value: "partitioned", partitionKey: "https://other.example" },
      { ...good, name: "__cf_bm", value: "first-party", partitionKey: { topLevelSite: "https://javlibrary.com", hasCrossSiteAncestor: false } },
      { ...good, value: "cross-site-ancestor", partitionKey: { topLevelSite: "https://javlibrary.com", hasCrossSiteAncestor: true } },
      { ...good, value: "opaque", partitionKeyOpaque: true }] };
  await session.navigation.capture({ ...capture, final_url: "https://evil.example/allowed/" });
  await session.navigation.capture({ ...capture, final_url: origin + "/private/" });
  await session.commit();
  assert.equal(env.COOKIE_KV.values.size, 0);
  await session.navigation.capture(capture);
  await session.commit();
  const saved = await load_browser_session(env, origin);
  assert.equal(saved.cookies.length, 2);
  assert.equal(saved.cookies[0].value, "allowed");
  assert.equal(saved.cookies[0].path, "/allowed/");
  assert.equal(saved.cookies[0].expirationDate, good.expires);
  assert.equal(saved.cookies[0].secure, true);
  const restored = await session.navigation.restore(capture.url);
  assert.equal(restored.cookies.length, 2);
  assert.equal(restored.cookies[0].expires, good.expires);
  assert.equal(restored.user_agent, user_agent);
  assert.deepEqual(restored.cookies[1].partitionKey, { topLevelSite: "https://javlibrary.com", hasCrossSiteAncestor: false });
  for (const changed of [{ user_agent: "x\r\nCookie: stolen" }, { cookies: [{ ...good, value: "x\nInjected: yes" }] }]) {
    await assert.rejects(session.navigation.capture({ ...capture, ...changed }));
  }
});

test("损坏密文、跨站替换和存储失败不会泄露会话或伪装成持久化成功", async () => {
  const env = environment();
  const saved = { user_agent, cookies: [{ ...cookie("private"), expirationDate: Date.now() / 1000 + 3600 }] };
  await save_browser_session(env, origin, saved);
  const ciphertext = env.COOKIE_KV.values.get("browser-session:" + origin);
  env.COOKIE_KV.values.set("browser-session:https://evil.example", ciphertext);
  await assert.rejects(load_browser_session(env, "https://evil.example"), error => error.code === "COOKIE_STORAGE_UNAVAILABLE");
  const encrypted = JSON.parse(ciphertext);
  env.COOKIE_KV.values.set("browser-session:" + origin, JSON.stringify({ ...encrypted, data: "bad" }));
  await assert.rejects(create_browser_session(env, metadata(), []), error => error.code === "COOKIE_STORAGE_UNAVAILABLE");
  env.COOKIE_KV.values.set("browser-session:" + origin, ciphertext);
  const session = await create_browser_session(env, metadata(), []);
  await session.navigation.capture({ url: origin + "/", final_url: origin + "/", user_agent, cookies: [cookie("new")] });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(session.commit(controller.signal), { name: "AbortError" });
  env.COOKIE_KV.put = async () => { throw new Error("private storage detail"); };
  await assert.rejects(session.commit(), error => error.code === "COOKIE_STORAGE_UNAVAILABLE" && !error.message.includes("private"));
  assert.equal(env.COOKIE_KV.values.get("browser-session:" + origin), ciphertext);
});
