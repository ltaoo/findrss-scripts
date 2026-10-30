import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { read_script } from "./support/script_sources.js";
import { compile_script_module, execute_script } from "findrss-worker/server/infra/script_sandbox.js";
import { ScriptCookieAccess } from "findrss-worker/server/infra/script_cookie_access.js";
import { FeedModel } from "findrss-worker/server/domain/feed_format.js";
import { XMLValidator } from "fast-xml-parser";

const source = read_script("rss/qimao.js");
const compiled = await compile_script_module(source);
assert.equal(compiled.error, "");
// 从用户提供的 chapter-list 响应截取首尾章节，不保留请求 Cookie。
const fixture = JSON.parse(readFileSync(new URL("./fixtures/qimao_chapters.json", import.meta.url), "utf8"));
const detail_url = "https://www.qimao.com/shuku/13030701/";
const api_url = "https://www.qimao.com/qimaoapi/api/book/chapter-list?book_id=13030701";
const detail = '<h1>夫人反差太大，司总沦陷了！</h1>' +
  '<meta property="og:novel:author" content="九九月">' +
  '<meta property="og:image" content="//cdn.qimao.com/cover.jpg">' +
  '<meta name="description" content="小说简介 &amp; 更新">';
const access = () => new ScriptCookieAccess({
  permissions: compiled.metadata.permissions,
  assert_grant() {},
  cookies: () => ["acw_tc", "acw_sc__v2", "acw_sc__v3", "session"].map(name => ({
    name, value: "fixture-" + name, domain: ".qimao.com", path: "/", secure: true,
  })),
});
async function run(book_id = "13030701", cookies = access()) {
  const result = await execute_script(source, compiled.metadata, null, {
    method: "GET", pathname: "/qimao/book/" + book_id, params: { book_id }, query: {},
  }, [], "", cookies);
  return JSON.parse(result.output);
}
const invalid_response = error => error.problem?.code === "UPSTREAM_INVALID_RESPONSE";

test("七猫完整目录转换为 RSS/Atom，保留稳定 ID、更新时间和原站链接，仅发送授权 Cookie", async t => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push(url);
    const headers = new Headers(options.headers);
    assert.equal(headers.get("referer"), url === detail_url ? "https://www.qimao.com/" : detail_url);
    assert.equal(headers.get("cookie"), "acw_tc=fixture-acw_tc; acw_sc__v2=fixture-acw_sc__v2; acw_sc__v3=fixture-acw_sc__v3");
    return new Response(url === detail_url ? detail : JSON.stringify(fixture));
  });
  const feed = await run();
  assert.deepEqual(calls, [detail_url, api_url]);
  assert.equal(feed.title, "夫人反差太大，司总沦陷了！ · 章节更新");
  assert.equal(feed.author.name, "九九月");
  assert.equal(feed.image, "https://cdn.qimao.com/cover.jpg");
  assert.equal(feed.description, "小说简介 & 更新");
  assert.deepEqual(feed.items.map(item => item.id), ["49354870", "49354831", "46968534", "46968516"].map(id => "qimao:chapter:13030701:" + id));
  assert.equal(feed.items[0].link, "https://www.qimao.com/shuku/13030701-49354870/");
  assert.equal(feed.items[0].published, new Date(1792762333 * 1000).toISOString());
  assert.equal(feed.items[0].updated, feed.items[0].published);
  assert.equal(feed.updated, feed.items[0].updated);
  assert.equal(feed.items[0].description, "2113 字");
  assert.doesNotMatch(JSON.stringify(feed), /fixture-|session/);
  for (const format of ["rss", "atom"]) {
    const xml = FeedModel(feed).render(format);
    assert.equal(XMLValidator.validate(xml), true);
    assert.match(xml, /qimao:chapter:13030701:49354870/);
  }
});

test("七猫按更新时间排序、去重，不补造缺失时间，允许空目录和元数据书名", async t => {
  const chapters = [
    { id: "1", title: "已修订 & <章节>", update_time: "1792762334" },
    { id: "2", title: "未提供时间", update_time: "0" },
    { id: "3", title: "末章", update_time: "1792762333" },
    { id: "3", title: "末章", update_time: "1792762333" },
  ];
  const page = '<meta property="og:novel:book_name" content="元数据书名">';
  t.mock.method(globalThis, "fetch", async url => new Response(url === detail_url ? page : JSON.stringify({ data: { chapters } })));
  const feed = await run();
  assert.equal(feed.title, "元数据书名 · 章节更新");
  assert.deepEqual(feed.items.map(item => item.id), [1, 3, 2].map(id => "qimao:chapter:13030701:" + id));
  assert.equal(feed.items[2].published, undefined);
  assert.match(FeedModel(feed).render("rss"), /已修订 &amp; &lt;章节&gt;/);
  chapters.length = 0;
  assert.deepEqual((await run()).items, []);
});

test("七猫拒绝无效参数和缺少 Cookie 授权，不发起请求", async t => {
  t.mock.method(globalThis, "fetch", () => assert.fail("无效参数或缺少授权时不应请求"));
  for (const id of [undefined, "", "../other", "13030701?x=1", "1".repeat(25), 9007199254740992]) {
    await assert.rejects(run(id === undefined ? null : id), error => error.problem?.code === "INVALID_PARAMETER");
  }
  await assert.rejects(run("13030701", null), /Cookie 权限/);
});

test("七猫详情和目录均识别访问验证页，并保留 HTTP 错误分类", async t => {
  for (const target of [detail_url, api_url]) {
    for (const body of ['<meta name="aliyun_waf_aa">', '<script src="AliyunCaptcha.js"></script>', '<title>滑动验证页面</title>']) {
      t.mock.method(globalThis, "fetch", async url => new Response(url === target ? body : detail));
      await assert.rejects(run(), error => invalid_response(error) && /同步.*Cookie/.test(error.message));
    }
    for (const [status, code] of [[403, "UPSTREAM_ACCESS_DENIED"], [404, "UPSTREAM_FETCH_FAILED"], [429, "UPSTREAM_RATE_LIMITED"], [504, "UPSTREAM_TIMEOUT"]]) {
      t.mock.method(globalThis, "fetch", async url => new Response(url === target ? "Unavailable" : detail, { status: url === target ? status : 200 }));
      await assert.rejects(run(), error => error.problem?.code === code);
    }
  }
});

test("七猫拒绝缺少书名、畸形目录、危险章节 ID 和无效时间", async t => {
  for (const body of ["not json", "null", "{}", '{"data":{"chapters":{}}}', ...[
    null, {}, { id: "../evil", title: "章节" }, { id: 9007199254740992, title: "章节" },
    { id: "1", title: " " }, { id: "1", title: "章节", update_time: "invalid" },
  ].map(chapter => JSON.stringify({ data: { chapters: [chapter] } }))]) {
    t.mock.method(globalThis, "fetch", async url => new Response(url === detail_url ? detail : body));
    await assert.rejects(run(), invalid_response);
  }
  for (const page of ["<html>未知页面</html>", detail.replace("//cdn.qimao.com/cover.jpg", "javascript:alert(1)")]) {
    t.mock.method(globalThis, "fetch", async () => new Response(page));
    await assert.rejects(run(), invalid_response);
  }
});
