import { read_script } from "./support/script_sources.js";
import assert from "node:assert/strict";
import test from "node:test";
import { ScriptCookieAccess } from "findrss-worker/server/infra/script_cookie_access.js";
const { compile_script_module_inner, execute_script_inner: execute_anonymous } = await import("findrss-worker/server/infra/script_sandbox.js");
const script = read_script("rss/weibo.js");
const request_context = { method: "GET", pathname: "/rss/weibo/u/1992429663", params: { uid: "1992429663" }, query: {} };
const metadata = { path: "/weibo/u/:uid", name: "微博用户列表", example: "/weibo/u/1992429663" };
async function execute_script_inner(source, route_metadata, invoke, context, cookies, mock) {
    const compiled = await compile_script_module_inner(source);
    const access = new ScriptCookieAccess({ permissions: compiled.metadata.permissions, cookies: () => cookies, assert_grant: () => {} });
    return execute_anonymous(source, { ...compiled.metadata, ...route_metadata }, invoke, context, [], mock, access);
}
async function with_fetch(fetch_impl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = fetch_impl;
  try { return await run(); } finally { globalThis.fetch = original; }
}

test("生产 QuickJS：微博 profile 使用显式授权 Cookie 和派生 XSRF，补充频道资料", async () => {
  const requests = [];
  const avatar = 'https://tvax3.sinaimg.cn/crop.0.0.1080.1080.1024/avatar.jpg';
  const result = await with_fetch(async (url, options) => {
    requests.push({ url, headers: new Headers(options.headers) });
    return new Response(url.includes('/ajax/profile/')
      ? JSON.stringify({ ok: 1, data: { user: { screen_name: '毛晓彤', description: '用户简介', avatar_hd: avatar } } })
      : '<script type="application/json">' + JSON.stringify({ idstr: '1', text_raw: '正文', user: {} }) + '</script>');
  }, () => execute_script_inner(script, metadata, null, { ...request_context, public_origin: 'https://feeds.example' }, [
    { name: 'SUB', value: 'session-fixture', domain: '.weibo.com', path: '/', secure: true },
    { name: 'XSRF-TOKEN', value: 'xsrf-fixture', domain: '.weibo.com', path: '/', secure: true },
  ], ''));
  const profile = requests.find(request => request.url.includes('/ajax/profile/'));
  assert.ok(profile.headers.get('cookie').includes('SUB=session-fixture'));
  assert.equal(profile.headers.get('x-xsrf-token'), 'xsrf-fixture');
  assert.equal(profile.headers.get('client-version'), 'v1.1.251');
  const feed = JSON.parse(result.output);
  assert.equal(feed.title, '毛晓彤 的微博');
  assert.equal(feed.description, '用户简介');
  assert.equal(feed.image, 'https://feeds.example/img/weibo?url=' + encodeURIComponent(avatar));
});

test("生产 QuickJS：profile 达到独立超时后忽略，不中断有效的空列表", async () => {
  let profile_signal;
  const result = await with_fetch(async (url, options) => {
    if (!url.includes('/ajax/profile/')) return new Response(url.includes('/ajax/')
      ? '{"ok":1,"data":{"list":[]}}' : '<html>应用壳</html>');
    profile_signal = options.signal;
    return new Promise((resolve, reject) => {
      const guard = setTimeout(() => reject(new Error('profile timeout did not abort')), 5000);
      options.signal.addEventListener('abort', () => { clearTimeout(guard); reject(options.signal.reason); }, { once: true });
    });
  }, () => execute_script_inner(script, metadata, null, request_context, [], ''));
  assert.equal(profile_signal.aborted, true);
  const feed = JSON.parse(result.output);
  assert.equal(feed.title, '微博 · 1992429663');
  assert.deepEqual(feed.items, []);
});

test("生产 QuickJS：微博应用壳读取列表后尝试 profile，失败仍返回 feed", async () => {
  const urls = [];
  const result = await with_fetch(async (url) => {
    urls.push(url);
    return new Response(url.includes("/ajax/") ? JSON.stringify({ data: { list: [{ idstr: "9", text_raw: "正文", user: { screen_name: "用户" } }] } }) : "<html>应用壳</html>");
  }, () => execute_script_inner(script, metadata, null, request_context, [], ""));
  assert.equal(urls.length, 3);
  assert.equal(urls[2], 'https://weibo.com/ajax/profile/info?uid=1992429663&scene=profile');
  assert.equal(JSON.parse(result.output).items[0].id, "9");
});

test("生产 QuickJS：微博多路由、正文图片改写与图片代理描述", async () => {
  const compiled = await compile_script_module_inner(script);
  assert.equal(compiled.error, "");
  assert.deepEqual(compiled.metadata.routes.map(entry => entry.path), ["/weibo/u/:uid", "/img/weibo"]);
  const url = "https://wx1.sinaimg.cn/large/a.jpg";
  const public_origin = "https://feeds.example";
  const result = await with_fetch(async () => new Response('<script type="application/json">' +
    JSON.stringify({ idstr: "1", text: '<img src="' + url + '">正文[月亮]', pics: [{ url }], user: {} }) + '</script>'), () =>
    execute_script_inner(script, compiled.metadata.routes[0], null, { ...request_context, public_origin }, [], ""));
  const item = JSON.parse(result.output).items[0];
  assert.equal(item.image, public_origin + "/img/weibo?url=" + encodeURIComponent("https://wx1.sinaimg.cn/orj360/a.jpg"));
  assert.ok(item.content.includes('src="' + item.image + '"'));
  assert.ok(item.content.includes('alt="[月亮]"'));
  assert.ok(item.content.includes(encodeURIComponent("https://face.t.sinajs.cn/t4/appstyle/expression/ext/normal/e1/201810_yueliang_mobile.png")));
  const proxy = await execute_script_inner(script, compiled.metadata.routes[1], null, {
    method: "GET", pathname: "/img/weibo", params: {}, query: { url },
  }, [], "");
  const descriptor = JSON.parse(proxy.output);
  assert.equal(descriptor.url, "https://wx1.sinaimg.cn/orj360/a.jpg");
  assert.equal(descriptor.headers.Referer, "https://weibo.com/");
  assert.match(descriptor.headers["User-Agent"], /Chrome\/155/);
  assert.equal(descriptor.headers["sec-fetch-dest"], "image");
});

test("生产 QuickJS：微博第二次请求失败透传真实 HTTP 错误", async () => {
  await with_fetch(async (url) => new Response(url.includes("/ajax/") ? "Login required" : "<html>应用壳</html>", { status: url.includes("/ajax/") ? 403 : 200 }), () =>
    assert.rejects(execute_script_inner(script, metadata, null, request_context, [], ""), (failure) => {
      assert.equal(failure.phase, "runtime");
      assert.match(failure.message, /HTTP 403/);
      assert.doesNotMatch(failure.message, /undefined.*JSON/);
      return true;
    }));
});

test("生产 QuickJS：Cookie 失效或空微博列表保留脚本明确错误", async () => {
  await with_fetch(async (url) => new Response(url.includes("/ajax/") ? '{"data":{"list":[]}}' : "<html>登录</html>"), () =>
    assert.rejects(execute_script_inner(script, metadata, null, request_context, [], ""), /请检查 Cookie 是否有效/));
});

test("生产 QuickJS：微博浏览器请求头与显式授权 Cookie 一起发送", async () => {
  const seen = [];
  await with_fetch(async (url, options) => {
    const headers = new Headers(options.headers);
    seen.push(headers);
    assert.equal(headers.get("cookie"), "SUB=test-session");
    assert.match(headers.get("user-agent"), /Chrome\/154/);
    assert.equal(headers.get("referer"), "https://weibo.com/u/1992429663");
    return new Response(url.includes("/ajax/") ? '{"data":{"list":[{"idstr":"9","text_raw":"正文","user":{}}]}}' : "<html>应用壳</html>");
  }, () => execute_script_inner(script, metadata, null, request_context, [{ name: "SUB", value: "test-session", domain: ".weibo.com", path: "/", secure: true }], ""));
  assert.equal(seen[0].get("sec-fetch-mode"), "navigate");
  assert.equal(seen[1].get("sec-fetch-mode"), "cors");
  assert.equal(seen[1].get("x-requested-with"), "XMLHttpRequest");
});
