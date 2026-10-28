import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import worker from "../worker/index.js";
import { script_names } from "./support/script_sources.js";
import { check_route } from "../scripts/route_checks.js";

const origin = "https://scripts.example";
const request = (path, env = {}, headers) => worker.fetch(new Request(origin + path, { headers }), env);
const upstream_feed = '<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Releases</title><entry><id>tag:github.com,2008:1/v1</id><title>v1.0</title><link rel="alternate" href="https://github.com/ltaoo/wx_channels_download/releases/tag/v1"/><updated>2026-10-26T01:00:00Z</updated><content>Release content</content></entry></feed>';

test("构建目录覆盖所有脚本和全部路由，包含 RSS/Atom、正文及图片", async () => {
  const response = await request("/api/routes");
  const cases = await response.json();
  assert.deepEqual([...new Set(cases.map(entry => entry.file))].sort(), ["hot", "rss", "clip", "detect"].flatMap(kind => script_names(kind).map(name => kind + "/" + name)).sort());
  assert.deepEqual(cases, JSON.parse(await readFile(new URL("../dist/routes.json", import.meta.url), "utf8")));
  assert.deepEqual([...new Set(cases.map(entry => entry.format))].sort(), ["atom", "clip", "detect", "hot", "html", "image", "rss"]);
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
