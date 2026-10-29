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
  assert.ok(traces.every(trace => trace.status === 403));
  response = await request("/api/hot/hackernews");
  assert.match(response.headers.get("Content-Type"), /application\/json/);
  assert.equal((await response.json()).code, "UPSTREAM_ACCESS_DENIED");
});

test("Cookie、浏览器能力、参数和网络失败均展示对应阶段与诊断信息", async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => { throw new Error("network offline"); };
  for (const [path, code, status] of [
    ["/debug/instagram/katarinabluu", "COOKIE_REQUIRED", 503],
    ["/debug/github/example/repo/readme", "SOURCE_UNAVAILABLE", 503],
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
  for (const path of ["/debug/github/example/repo/releases/detect", "/debug/fanqienovel/chapter/9007199254740993"]) {
    const response = await request(path);
    assert.equal(response.status, 200);
    assert.ok(JSON.parse(section(await response.text(), "output")));
  }
  globalThis.fetch = () => assert.fail("Debug 图片描述不得请求二进制");
  const response = await request("/debug/img/apple?url=" + encodeURIComponent("https://is1-ssl.mzstatic.com/image/thumb/test.jpg/100x100bb.jpg"));
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(section(await response.text(), "output")).url, "https://is1-ssl.mzstatic.com/image/thumb/test.jpg/100x100bb.jpg");
});
