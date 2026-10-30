import assert from "node:assert/strict";
import test from "node:test";
import { read_script } from "./support/script_sources.js";
import { compile_script_module, execute_script } from "findrss-worker/server/infra/script_sandbox.js";

const source = read_script("rss/69shuba.js");
const compiled = await compile_script_module(source);
assert.equal(compiled.error, "");
const detail_url = "https://www.69shuba.com/book/34567.htm";
const directory_url = "https://www.69shuba.com/book/34567/";
const detail = '<meta property="og:novel:book_name" content="坐忘长生">' +
  '<meta property="og:novel:author" content="飞翔的黎哥">' +
  '<a class="btn more-btn" href="' + directory_url + '">完整目录</a>';
const chapter = (number, title) => '<li data-num="' + number + '"><a href="/txt/34567/' + number + '">' + title + '</a></li>';
// 官网的最近阅读也使用 .catalog，章节序号在 li 上，目录默认倒序。
const directory = rows => '<div class="catalog"><ul><li data-num="7"><a id="bookcase" href="#" style="display:none"></a></li></ul></div>' +
  '<div class="catalog" id="catalog"><h1><a href="' + detail_url + '">坐忘长生最新章节</a></h1><ul>' + rows + '</ul></div>';
const rows = chapter(2022, "第2012章 路途之上") + chapter(2021, "第2011章 收矿脉") + chapter(1, "第1章 宁为太平犬，不为乱世人");
const challenge = '<title>Just a moment...</title><script>window._cf_chl_opt = {};</script>';
const run = async (navigate = null, book_id = "34567") => {
  const result = await execute_script(source, compiled.metadata, null, {
    method: "GET", pathname: "/69shuba/book/" + book_id, params: { book_id }, query: {},
  }, [], "", null, undefined, navigate);
  return JSON.parse(result.output);
};

test("69书吧优先读取完整目录，使用 li 的 data-num 排序、去重并排除标题链接", async t => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push(url);
    assert.equal(new Headers(options.headers).get("referer"), url === detail_url ? "https://www.69shuba.com/" : detail_url);
    return new Response(url === detail_url ? detail : directory(rows + chapter(2022, "重复")));
  });
  const feed = await run(() => assert.fail("普通请求成功时不应启动浏览器"));
  assert.deepEqual(calls, [detail_url, directory_url]);
  assert.equal(feed.title, "坐忘长生 · 章节更新");
  assert.equal(feed.author.name, "飞翔的黎哥");
  assert.deepEqual(feed.items.map(item => item.link), [2022, 2021, 1].map(id => "https://www.69shuba.com/txt/34567/" + id));
  assert.equal(feed.items[0].id, "69shuba:chapter:https://www.69shuba.com/txt/34567/2022");
  assert.equal(feed.items[0].title, "第2012章 路途之上");
  t.mock.method(globalThis, "fetch", async url => new Response(url === detail_url ? detail :
    directory(chapter(1, "第一章") + chapter(2021, "第2011章") + chapter(2022, "第2012章"))));
  assert.deepEqual((await run()).items.map(item => item.id), feed.items.map(item => item.id));
});

test("69书吧 HTTP 403 或验证页使用浏览器兜底，详情和目录均可恢复", async t => {
  for (const status of [403, 200]) {
    const calls = [];
    t.mock.method(globalThis, "fetch", async () => new Response(challenge, { status }));
    const feed = await run(async (url, options, evaluate) => {
      calls.push(url);
      assert.deepEqual(options, {
        selector: url === detail_url ? ".bookbox" : "#catalog, .mu_contain, #chapterlist, .mulu_list",
        wait_ms: 0,
      });
      assert.equal(evaluate, undefined);
      return { html: url === detail_url ? detail : directory(rows) };
    });
    assert.deepEqual(calls, [detail_url, directory_url]);
    assert.equal(feed.items.length, 3);
    assert.equal(feed.items[0].title, "第2012章 路途之上");
  }
});

test("69书吧仅目录被拦截时只对目录启动浏览器", async t => {
  t.mock.method(globalThis, "fetch", async url => new Response(url === detail_url ? detail : challenge, {
    status: url === detail_url ? 200 : 403,
  }));
  let calls = 0;
  assert.equal((await run(async url => {
    calls++;
    assert.equal(url, directory_url);
    return { html: directory(rows) };
  })).items.length, 3);
  assert.equal(calls, 1);
});

test("69书吧浏览器失败、空页面或仍在验证时返回错误", async t => {
  t.mock.method(globalThis, "fetch", async () => new Response(challenge, { status: 403 }));
  await assert.rejects(run(), /BROWSER/);
  await assert.rejects(run(async () => { throw Object.assign(new Error("浏览器超时"), { code: "UPSTREAM_TIMEOUT" }); }),
    error => error.problem.code === "UPSTREAM_TIMEOUT");
  for (const html of [undefined, "", " ", 123]) {
    await assert.rejects(run(async () => ({ html })), error => error.problem.code === "UPSTREAM_INVALID_RESPONSE");
  }
  await assert.rejects(run(async () => ({ html: challenge })), error => error.problem.code === "UPSTREAM_AUTH_REQUIRED");
});

test("69书吧保留其他 HTTP 错误，非法 ID 和外站目录不会触发浏览器", async t => {
  const navigate = () => assert.fail("不应启动浏览器");
  for (const [status, code] of [[404, "UPSTREAM_FETCH_FAILED"], [429, "UPSTREAM_RATE_LIMITED"], [504, "UPSTREAM_TIMEOUT"]]) {
    t.mock.method(globalThis, "fetch", async () => new Response("Unavailable", { status }));
    await assert.rejects(run(navigate), error => error.problem.code === code);
  }
  t.mock.method(globalThis, "fetch", () => assert.fail("非法 ID 不应请求站点"));
  await assert.rejects(run(navigate, "../other"), error => error.problem.code === "INVALID_PARAMETER");
  t.mock.method(globalThis, "fetch", async () => new Response(detail.replace(directory_url, "https://other.example/book/34567/")));
  await assert.rejects(run(navigate), error => error.problem.code === "UPSTREAM_INVALID_RESPONSE");
});
