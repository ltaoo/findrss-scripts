import assert from "node:assert/strict";
import test from "node:test";
import scripts from "../dist/scripts.js";
import worker from "../worker/index.js";
import { route_cases, debug_route_cases } from "../worker/catalog.js";

const origin = "https://scripts.example";
const request = (path, env = {}, options) => worker.fetch(new Request(origin + path, options), env);
const section = (html, name) => new RegExp('data-n="debug-' + name + '-content"[^>]*>([\\s\\S]*?)</pre>').exec(html)[1]
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const feed = '<feed xmlns="http://www.w3.org/2005/Atom"><title>Releases</title><entry><id>release:1</id><title>v1</title><link rel="alternate" href="https://github.com/example/repo/releases/tag/v1"/><updated>2026-10-26T01:00:00Z</updated></entry></feed>';

test("每个脚本的全部路由都有 canonical Debug 和完整路径前缀入口，参数和查询串正确传递", async () => {
  const env = { ACCESS_TOKEN: "test-token", SCRIPT_CONFIG: "[]" };
  const options = { headers: { Authorization: "Bearer test-token" } };
  const debug_cases = debug_route_cases(scripts);
  assert.equal(debug_cases.length, scripts.reduce((count, script) => count + script.metadata.routes.length, 0));
  for (const entry of [...debug_cases, ...route_cases(scripts).map(entry => ({ ...entry, example: "/debug" + entry.example }))]) {
    const response = await request(entry.example, env, options);
    assert.equal(response.status, 503, entry.example);
    assert.equal(response.headers.get("X-FindRSS-Script"), entry.file, entry.example);
    assert.equal(response.headers.get("X-FindRSS-Route"), String(entry.route_index));
    const html = await response.text();
    assert.match(html, /CONFIG_INVALID/);
    const script = scripts.find(script => script.file === entry.file);
    assert.ok(html.includes('<p data-n="debug-version" class="meta">脚本版本：' + script.metadata.version + '</p>'), entry.example);
    const context = JSON.parse(section(html, "request"));
    const url = new URL(entry.example, origin);
    assert.equal(context.pathname, url.pathname);
    assert.deepEqual(context.query, Object.fromEntries(url.searchParams));
    assert.ok(!JSON.stringify(context).includes("test-token"));
  }
});

test("鉴权、方法、未知路由和配置失败也返回 HTML，拒绝时不执行脚本或出网", async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = () => assert.fail("拒绝的请求不得出网");
  for (const [path, env, options, status, code] of [
    ["/debug/github/example/repo/release", { ACCESS_TOKEN: "private-token" }, {}, 401, "UNAUTHORIZED"],
    ["/debug/github/example/repo/release", { SCRIPT_COOKIES: "[]" }, {}, 503, "ACCESS_TOKEN_REQUIRED"],
    ["/debug/github/example/repo/release", {}, { method: "POST" }, 405, "METHOD_NOT_ALLOWED"],
    ["/debug/missing", {}, {}, 404, "NOT_FOUND"],
    ["/debug", {}, {}, 404, "NOT_FOUND"],
    ["/debug/github/example/repo/release", { ACCESS_TOKEN: "private-token", SCRIPT_CONFIG: "{" },
      { headers: { Authorization: "Bearer private-token" } }, 503, "CONFIG_INVALID"],
  ]) {
    const response = await request(path, env, options);
    assert.equal(response.status, status);
    assert.match(response.headers.get("Content-Type"), /text\/html/);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.match(await response.text(), new RegExp(code));
    if (status === 405) assert.equal(response.headers.get("Allow"), "GET");
  }
  assert.equal((await request("/debug/api/cookies/update")).status, 404);
  assert.equal((await request("/debugging/github/example/repo/release")).status, 404);
});

test("YouTube 缺少或空白 API Key 显示配置错误，保留有效路径参数且不出网", async t => {
  t.mock.method(globalThis, "fetch", () => assert.fail("缺少 API Key 时不得出网"));
  for (const config of [{}, { api_key: "" }, { api_key: " \t " }]) {
    const env = { ACCESS_TOKEN: "test-token", SCRIPT_CONFIG: JSON.stringify({ "hot/youtube_hot.js": config }) };
    const response = await request("/debug/youtube/hot/US/0?token=test-token", env);
    assert.equal(response.status, 503);
    const html = await response.text();
    assert.match(html, /CONFIG_INVALID/);
    assert.doesNotMatch(html, /INVALID_PARAMETER/);
    assert.match(section(html, "error"), /api_key/);
    assert.deepEqual(JSON.parse(section(html, "request")).params, { region: "US", category: "0" });
    assert.deepEqual(JSON.parse(section(html, "upstream-requests")), []);
  }
});

test("YouTube 配置有效时 US/0 发起并记录官方 API 请求，非法地区仍在出网前拒绝", async t => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push(url);
    assert.equal(new Headers(options.headers).get("X-Goog-Api-Key"), "youtube-test-key");
    return Response.json({ items: [{ id: "abcdefghijk", snippet: { title: "热门视频" }, statistics: { viewCount: "123" } }] });
  });
  const env = { ACCESS_TOKEN: "test-token", SCRIPT_CONFIG: JSON.stringify({ "hot/youtube_hot.js": { api_key: " youtube-test-key " } }) };
  const response = await request("/debug/youtube/hot/US/0?token=test-token", env);
  assert.equal(response.status, 200);
  const html = await response.text();
  const traces = JSON.parse(section(html, "upstream-requests"));
  assert.equal(traces.length, 1);
  assert.equal(traces[0].url, calls[0]);
  const target = new URL(calls[0]);
  assert.equal(target.origin + target.pathname, "https://www.googleapis.com/youtube/v3/videos");
  assert.equal(target.searchParams.get("regionCode"), "US");
  assert.equal(target.searchParams.get("videoCategoryId"), "0");
  assert.doesNotMatch(html, /youtube-test-key|test-token/);
  assert.equal(JSON.parse(section(html, "output")).entries[0].title, "热门视频");
  const invalid = await request("/debug/youtube/hot/USA/0?token=test-token", env);
  assert.equal(invalid.status, 400);
  assert.match(await invalid.text(), /INVALID_PARAMETER/);
  assert.equal(calls.length, 1);
});

test("Debug 使用真实沙箱，每次执行并显示原始输出、长日志、上游请求及耗时", async t => {
  const original_fetch = globalThis.fetch;
  const script = scripts.find(script => script.file === "rss/github.js");
  const original_source = script.source;
  t.after(() => { globalThis.fetch = original_fetch; script.source = original_source; });
  script.source += `
const debug_handler = routes[0].handler;
routes[0].handler = async ctx => {
  ctx.log("Debug 开启", ctx.route.debug, ctx.pathname, ctx.params.org, ctx.params.pro, ctx.query.page);
  ctx.log("<script>" + "正文".repeat(4000) + "日志末尾</script>");
  return debug_handler(ctx);
};`;
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response(feed); };
  for (const path of ["/debug/github/example/repo/release", "/debug/rss/github/example/repo/release", "/debug/atom/github/example/repo/release"]) {
    const response = await request(path + "?page=2&token=hidden-token&secret=hidden-secret&api_key=hidden-key", {}, {
      headers: { Cookie: "hidden-cookie", Authorization: "Bearer hidden-bearer" },
    });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("Content-Security-Policy"), /sandbox; default-src 'none'/);
    assert.equal(response.headers.get("Referrer-Policy"), "no-referrer");
    const html = await response.text();
    assert.ok(html.includes('<p data-n="debug-version" class="meta">脚本版本：' + script.metadata.version + '</p>'));
    assert.match(html, /Debug 开启 true/);
    assert.match(html, /example repo 2/);
    assert.match(html, /日志末尾&lt;\/script&gt;/);
    assert.doesNotMatch(html, /<script>|hidden-token|hidden-secret|hidden-key|hidden-cookie|hidden-bearer/);
    assert.match(html, /HTTP 200 · ok · \d+ ms/);
    const value = JSON.parse(section(html, "output"));
    assert.equal(value.title, "example/repo Releases");
    assert.equal(value.items[0].title, "v1");
    const [trace] = JSON.parse(section(html, "upstream-requests"));
    assert.equal(trace.url, "https://github.com/example/repo/releases.atom");
    assert.equal(trace.host, "github.com");
    assert.equal(trace.pathname, "/example/repo/releases.atom");
    assert.equal(trace.status, 200);
    for (const node of html.matchAll(/<([a-z][a-z0-9]*)\b([^>]*?)>/gi)) assert.match(node[2], /data-n="[^"\s]+"/, node[0]);
  }
  assert.equal(calls, 3);
});

test("上游失败保留 HTTP 业务码、堆栈、失败前日志和上游状态，普通请求继续返回 JSON", async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => new Response("denied", { status: 403 });
  let response = await request("/debug/hackernews");
  assert.equal(response.status, 502);
  const html = await response.text();
  assert.match(html, /路由请求失败/);
  assert.match(html, /UPSTREAM_ACCESS_DENIED/);
  assert.match(html, /Hacker News 首页获取失败，尝试 hnrss/);
  assert.match(section(html, "error"), /HTTP 403/);
  const traces = JSON.parse(section(html, "upstream-requests"));
  assert.deepEqual(traces.map(trace => trace.host), ["news.ycombinator.com", "hnrss.org"]);
  assert.deepEqual(traces.map(trace => trace.url), ["https://news.ycombinator.com/", "https://hnrss.org/frontpage?count=30"]);
  assert.ok(traces.every(trace => trace.status === 403));
  for (const path of ["/api/hot/hackernews", "/hot/hackernews"]) {
    response = await request(path);
    assert.match(response.headers.get("Content-Type"), /application\/json/, path);
    assert.equal((await response.json()).code, "UPSTREAM_ACCESS_DENIED", path);
  }
});

test("Debug 上游 URL 保留完整查询参数并记录每次重定向", async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const target = "https://github.com/example/repo/releases.atom?page=2&filter=" + "x".repeat(1200) + "&title=%3Cscript%3E";
  const urls = [];
  globalThis.fetch = async url => {
    urls.push(url);
    return urls.length === 1
      ? new Response(null, { status: 302, headers: { Location: target } })
      : new Response(feed);
  };
  const response = await request("/debug/github/example/repo/release");
  assert.equal(response.status, 200);
  const html = await response.text();
  const traces = JSON.parse(section(html, "upstream-requests"));
  assert.deepEqual(traces.map(trace => trace.url), urls);
  assert.equal(traces[1].url, target);
  assert.deepEqual(traces.map(trace => trace.status), [302, 200]);
});

test("Cookie、浏览器能力、参数和网络失败均展示对应阶段与诊断信息", async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => { throw new Error("network offline"); };
  for (const [path, code, status] of [
    ["/debug/instagram/katarinabluu", "COOKIE_REQUIRED", 503],
    ["/debug/github/example/repo", "SOURCE_UNAVAILABLE", 503],
    ["/debug/fanqienovel/chapter/bad", "INVALID_PARAMETER", 400],
    ["/debug/github/example/repo/release", "UPSTREAM_FETCH_FAILED", 502],
  ]) {
    const response = await request(path);
    assert.equal(response.status, status, path);
    const html = await response.text();
    assert.match(html, new RegExp(code));
    assert.match(html, /执行失败，未生成输出/);
    assert.match(html, /data-n="debug-error-content"/);
  }
});

test("Detect、正文及图片路由同样展示原始输出，Debug 图片描述不会再抓取二进制", async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async url => {
    if (url === "https://github.com/example/repo/releases.atom") return new Response(feed);
    assert.equal(url, "https://fanqienovel.com/reader/9007199254740993?enter_from=page");
    return new Response('<h1 class="muye-reader-title">标题</h1><div class="muye-reader-content"><p>正文</p></div>');
  };
  for (const path of ["/debug/github/example/repo/releases.atom", "/debug/fanqienovel/chapter/9007199254740993"]) {
    const response = await request(path);
    assert.equal(response.status, 200);
    assert.ok(JSON.parse(section(await response.text(), "output")));
  }
  globalThis.fetch = () => assert.fail("Debug 图片描述不得请求二进制");
  const response = await request("/debug/img/apple?url=" + encodeURIComponent("https://is1-ssl.mzstatic.com/image/thumb/test.jpg/100x100bb.jpg"));
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(section(await response.text(), "output")).url, "https://is1-ssl.mzstatic.com/image/thumb/test.jpg/100x100bb.jpg");
});
