import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import worker from "../worker/index.js";
import scripts from "../dist/scripts.js";
import { script_names } from "./support/script_sources.js";
import { check_route } from "../scripts/route_checks.js";
import { api_route_cases, route_cases } from "../worker/catalog.js";
import { ERRORS } from "../worker/errors.js";

const origin = "https://scripts.example";
const request = (path, env = {}, headers) => worker.fetch(new Request(origin + path, { headers }), env);
const upstream_feed = '<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Releases</title><entry><id>tag:github.com,2008:1/v1</id><title>v1.0</title><link rel="alternate" href="https://github.com/ltaoo/wx_channels_download/releases/tag/v1"/><updated>2026-10-26T01:00:00Z</updated><content>Release content</content></entry></feed>';

test("构建目录覆盖所有脚本和全部路由，包含 RSS/Atom、正文及图片", async () => {
  const response = await request("/api/routes");
  const cases = await response.json();
  assert.deepEqual([...new Set(cases.map(entry => entry.file))].sort(), ["hot", "rss", "clip", "detect"].flatMap(kind => script_names(kind).map(name => kind + "/" + name)).sort());
  assert.deepEqual(cases, route_cases(scripts));
  assert.deepEqual(JSON.parse(await readFile(new URL("../dist/routes.json", import.meta.url), "utf8")), api_route_cases(scripts));
  assert.deepEqual([...new Set(cases.map(entry => entry.format))].sort(), ["atom", "clip", "detect", "hot", "html", "image", "rss", "rss_json"]);
  assert.equal((await request("/rss/missing")).status, 404);
  assert.equal((await request("/rss/hackernews")).status, 404);
  assert.equal((await worker.fetch(new Request(origin, { method: "POST" }), {})).status, 405);
});

test("Worker 使用生产沙箱采集并渲染 RSS/Atom，巡检验证实际输出和 handler", async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async url => {
    assert.equal(url, "https://github.com/ltaoo/wx_channels_download/releases.atom");
    return new Response(upstream_feed);
  };
  const cases = await (await request("/api/routes")).json();
  for (const entry of cases.filter(entry => entry.file === "rss/github.js")) {
    const result = await check_route(origin, entry, { fetch_impl: url => request(url.pathname) });
    assert.equal(result.output_valid, true, result.error);
  }
  globalThis.fetch = async () => new Response("Sign in", { status: 403 });
  const failed = await request("/rss/github/ltaoo/wx_channels_download/release");
  assert.equal(failed.status, 502);
  assert.equal((await failed.json()).file, "rss/github.js");
});

test("Detect 路由初始化快照，凭据配置必须经令牌保护且不会公开返回", async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => new Response(upstream_feed);
  const entry = (await (await request("/api/routes")).json()).find(entry => entry.file === "detect/github_releases.js");
  const result = await check_route(origin, entry, { fetch_impl: url => request(url.pathname) });
  assert.equal(result.output_valid, true, result.error);
  assert.equal((await request("/health", { SCRIPT_COOKIES: "[]" })).status, 503);
  const env = { ACCESS_TOKEN: "private-token", SCRIPT_CONFIG: '{"hot/youtube_hot.js":{"api_key":"secret-key"}}' };
  assert.equal((await request("/api/routes", env)).status, 401);
  const response = await request("/api/routes", env, { Authorization: "Bearer private-token" });
  assert.equal(response.status, 200);
  assert.doesNotMatch(await response.text(), /private-token|secret-key/);
});

test("Instagram 缺少、过期或不匹配的 Cookie 在出网前返回明确业务码", async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = () => assert.fail("Cookie 不可用时不得出网");
  const cookie = { name: "sessionid", value: "private-cookie", domain: ".instagram.com", path: "/", secure: true };
  for (const cookies of [undefined, [], [{ ...cookie, expirationDate: 1 }], [{ ...cookie, domain: ".example.com" }], [{ ...cookie, path: "/other" }]]) {
    const env = cookies === undefined ? {} : { ACCESS_TOKEN: "private-token", SCRIPT_COOKIES: JSON.stringify(cookies) };
    const response = await request("/rss/instagram/katarinabluu", env, { Authorization: "Bearer private-token" });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      error: "COOKIE_REQUIRED", code: "COOKIE_REQUIRED", message: ERRORS.COOKIE_REQUIRED[1], file: "rss/instagram.js",
    });
    assert.equal(response.headers.get("X-FindRSS-Script"), "rss/instagram.js");
  }
});

test("Instagram 有 Cookie 时区分登录失效、响应不匹配及正常 RSS", async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const cookies = ["sessionid", "csrftoken"].map(name => ({ name, value: "private-" + name, domain: ".instagram.com", path: "/", secure: true }));
  const env = { ACCESS_TOKEN: "private-token", SCRIPT_COOKIES: JSON.stringify(cookies) };
  const profile = '["DTSGInitialData",[],{"token":"private-dtsg"}];["LSD",[],{"token":"private-lsd"}]';
  const fixture = await readFile(new URL("./fixtures/instagram_profile.json", import.meta.url), "utf8");
  for (const [page, body, code] of [
    ["<html>Login</html>", "", "UPSTREAM_AUTH_REQUIRED"],
    [profile, "<html>Verification</html>", "UPSTREAM_INVALID_RESPONSE"],
    [profile, '{"data":{}}', "UPSTREAM_INVALID_RESPONSE"],
    [profile, fixture, null],
  ]) {
    globalThis.fetch = async (url, options) => {
      assert.equal(options.headers.Cookie, "sessionid=private-sessionid; csrftoken=private-csrftoken");
      return new Response(url.endsWith("/graphql/query") ? body : page);
    };
    const response = await request("/rss/instagram/katarinabluu", env, { Authorization: "Bearer private-token" });
    assert.equal(response.status, code ? ERRORS[code][0] : 200);
    if (code) assert.deepEqual(await response.json(), { error: code, code, message: ERRORS[code][1], file: "rss/instagram.js" });
    else assert.match(await response.text(), /<rss\b/);
  }
});

test("生产沙箱保留网络、HTTP、超时及响应不匹配的分类", async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  for (const [fetch_impl, code] of [
    [async () => { throw new Error("private network details"); }, "UPSTREAM_FETCH_FAILED"],
    [async () => { throw Object.assign(new Error("private timeout details"), { name: "FeedError", code: "UPSTREAM_TIMEOUT" }); }, "UPSTREAM_TIMEOUT"],
    ...[[401, "UPSTREAM_AUTH_REQUIRED"], [403, "UPSTREAM_ACCESS_DENIED"], [429, "UPSTREAM_RATE_LIMITED"], [500, "UPSTREAM_FETCH_FAILED"]]
      .map(([status, code]) => [async () => new Response("private upstream body", { status }), code]),
    [async () => new Response("<html>Login required</html>"), "UPSTREAM_INVALID_RESPONSE"],
  ]) {
    globalThis.fetch = fetch_impl;
    const response = await request("/rss/github/ltaoo/wx_channels_download/release");
    assert.equal(response.status, ERRORS[code][0]);
    assert.deepEqual(await response.json(), { error: code, code, message: ERRORS[code][1], file: "rss/github.js" });
  }
});

test("请求、配置及采集能力错误同样返回统一格式", async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = () => assert.fail("参数或配置错误时不得出网");
  for (const [path, env, code] of [
    ["/missing", {}, "NOT_FOUND"],
    ["/health", { ACCESS_TOKEN: "private-token" }, "UNAUTHORIZED"],
    ["/health", { SCRIPT_COOKIES: "[]" }, "ACCESS_TOKEN_REQUIRED"],
    ["/rss/instagram/invalid!", {}, "INVALID_PARAMETER"],
    ["/api/hot/youtube/hot/US/0", { ACCESS_TOKEN: "private-token", SCRIPT_CONFIG: '{"hot/youtube_hot.js":{"api_key":7}}' }, "CONFIG_INVALID"],
    ["/api/clip/web/region?url=https%3A%2F%2Fexample.com&selector=body", {}, "SOURCE_UNAVAILABLE"],
    ...["{", "null", "[]", '{"rss/instagram.js":true}', '{"rss/instagram.js":null}', '{"rss/instagram.js":false}']
      .map(SCRIPT_CONFIG => ["/rss/instagram/katarinabluu", { ACCESS_TOKEN: "private-token", SCRIPT_CONFIG }, "CONFIG_INVALID"]),
    ...["null", "{}", "[null]"].map(SCRIPT_COOKIES => ["/rss/instagram/katarinabluu", { ACCESS_TOKEN: "private-token", SCRIPT_COOKIES }, "CONFIG_INVALID"]),
  ]) {
    const response = await request(path, env, code === "UNAUTHORIZED" ? undefined : { Authorization: "Bearer private-token" });
    const body = await response.json();
    assert.equal(response.status, ERRORS[code][0], JSON.stringify(body));
    assert.equal(body.code, code);
    assert.equal(body.error, code);
    assert.equal(body.message, ERRORS[code][1]);
  }
  const response = await worker.fetch(new Request(origin, { method: "POST" }), {});
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "GET");
  assert.equal((await response.json()).code, "METHOD_NOT_ALLOWED");
});
