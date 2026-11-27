import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { compile_script_module, execute_script } from "findrss-worker/server/infra/script_sandbox.js";
import { FeedModel } from "findrss-worker/server/domain/feed_format.js";
import { XMLValidator } from "fast-xml-parser";
import { read_script } from "./support/script_sources.js";

const meta = '<meta property="og:novel:book_name" content="书 &amp; 名"><meta name="og:novel:author" content="作者甲">';
const anchors = '<a href="/chapter/1.html">第一章</a><a href="/chapter/2.html">第二章 &amp; 后续</a><a href="/chapter/2.html">重复</a>';
const wrap = (tag, value) => value.replace(/<a\b[\s\S]*?<\/a>/g, anchor => '<' + tag + '>' + anchor + '</' + tag + '>');
const list = '<div id="list"><dl>' + wrap("dd", anchors) + '</dl></div>';
const second_dt = '<dl><dt>最新章节</dt><dd><a href="/chapter/99.html">不应出现在完整目录</a></dd><dt>正文</dt>' + wrap("dd", anchors) + '</dl>';
const book_list = '<div class="book_list2"><ul>' + wrap("li", anchors) + '</ul></div>';
const onclick_list = (name, desc = false) => '<style>ul.' + name + '>li:nth-child(1){display:none}ul.' + name + '>li:nth-last-child(1){display:none}</style>' +
  '<ul class="' + name + '"><li><a onclick="read_tz(999);">干扰</a></li>' +
  (desc ? [2, 1] : [1, 2]).map(id => '<li><a onclick="read_tz(' + id + ');">第' + id + '章</a></li>').join("") +
  '<li><a onclick="read_tz(888);">干扰</a></li></ul>';

// 独立手写页面结构，覆盖上游五组规则中的每个站点；不从脚本配置反向构造选择器。
const fixtures = [
  ["ibiqugu", "http://www.ibiqugu.net", "/1/123/", null, list],
  ["shuhaige", "https://www.shuhaige.net", "/123/", null, second_dt],
  ["mcxs", "http://www.mcxs.la", "/1_123/", null, second_dt],
  ["99wx", "http://www.99wx.info", "/tag/1_123/", null, second_dt],
  ["xbiquwk", "http://www.xbiquwk.com", "/1_123/", null, list],
  ["ujxsw", "http://www.ujxsw.org", "/book/123/", "/read/123/", '<div id="readerlist"><ul>' + wrap("li", anchors) + '</ul></div>'],
  ["yeudusk", "http://www.yeudusk.com", "/book/123/", "/html/0/123/", '<ul>' + wrap("li", anchors) + '</ul>'],
  ["biquge365", "https://www.biquge365.net", "/book/123/", "/newbook/123/", '<div class="menu"><div class="border"><ul>' + wrap("li", anchors) + '</ul></div></div>'],
  ["d8zw", "https://www.d8zw.com", "/1/123/", "/1/123/index_1.html", book_list],
  ["52bqg", "https://www.52bqg.com", "/book_123/", "/book_123/index_1.html", onclick_list("section-list"), "/book_123/"],
  ["snxsw", "https://www.snxsw.com", "/book/123/", "/index/123/1/", onclick_list("section-list", true), "/book_123/"],
  ["xbiquge_info", "https://www.xbiquge.info", "/1/123/", "/1/123/index_1.html", book_list],
  ["bqg_info", "https://www.bqg.info", "/book/123/", null, '<dl id="newlist">' + wrap("dd", anchors) + '</dl>'],
  ["quanben5", "https://quanben5.com", "/n/123/", "/n/123/xiaoshuo.html", '<ul>' + wrap("li", anchors) + '</ul>'],
  ["dxmwx", "https://www.dxmwx.org", "/book/123.html", "/chapter/123.html", '<section><div></div><div></div><div></div><div></div><div><span>' + anchors + '</span></div></section>'],
  ["101kks", "https://101kks.com", "/book/123.html", "/ajax_novels/chapterlist/123.html", '<ul>' + wrap("li", anchors) + '</ul>'],
  ["fsshu", "https://www.fsshu.com", "/biquge/1/123/", "/biquge/1/123/index_1.html", book_list],
  ["xtxxs9", "https://www.xtxxs9.com", "/book/123/", "/xiaoshuo/123/", '<div id="content_1">' + anchors + '</div>'],
  ["0xs", "https://www.0xs.net", "/txt_1/123.html", "/la_1/123.html", '<div class="catalog"><div><ul>' + wrap("li", anchors) + '</ul></div></div>'],
  ["suduguu", "https://www.suduguu.com", "/123/", null, '<div id="list"><ul>' + wrap("li", anchors) + '</ul></div>'],
  ["xbiquge_cc", "https://www.xbiquge.cc", "/book/123/", "/book/123/ml1.html", onclick_list("yanqing_list"), "/book/123/"],
  ["xiaoshuohu", "https://www.xiaoshuohu.com", "/1/123/", null, list],
  ["ttkan", "https://cn.ttkan.co", "/novel/chapters/123", null, '<div class="full_chapters"><div>' + anchors + '</div><div><a href="/chapter/99.html">其他内容</a></div></div>'],
  ["xszj", "https://xszj.org", "/b/123", "/b/123/cs/1", '<div id="content_1">' + anchors + '</div>'],
  ["wxsy", "https://www.wxsy.net", "/novel/123/", "/novel/123/chapter_1.html", '<ul class="section-list ycxsid">' + wrap("li", anchors) + '</ul>'],
  ["xhytd", "http://www.xhytd.com", "/1/123/", null, '<div id="list">' + second_dt + '</div>'],
  ["96dushu", "https://www.96dushu.com", "/book/123/", null, '<ul id="chapterList">' + wrap("li", anchors) + '</ul>'],
  ["dongtanxs", "http://www.dongtanxs.com", "/dong123/", null, second_dt],
  ["hetushu", "https://www.hetushu.com", "/book/123/index.html", null, '<dl id="dir">' + wrap("dd", anchors) + '</dl>'],
  ["linovelib", "https://www.linovelib.com", "/novel/123.html", "/novel/123/catalog", '<ul class="chapter-list">' + wrap("li", anchors) + '</ul>'],
].map(([key, origin, book, catalog, html, chapter = "/chapter/"]) => ({ key, origin, book, catalog: catalog || book, html, chapter }));

const scripts = new Map();
for (const fixture of fixtures) {
  const source = read_script("rss/" + fixture.key + ".js");
  const compiled = await compile_script_module(source);
  assert.equal(compiled.error, "", fixture.key);
  scripts.set(fixture.key, { source, metadata: compiled.metadata });
}
const run = async (key, params = {}, navigate = null, browser = false) => {
  const { source, metadata } = scripts.get(key);
  const book_id = ["mcxs", "99wx", "xbiquwk"].includes(key) ? "1_123" : "123";
  const result = await execute_script(source, metadata, null, {
    method: "GET", pathname: metadata.example, params: { category: "1", book_id, ...params }, query: {},
    env: { BROWSER_ENABLED: browser },
  }, [], "", null, undefined, navigate);
  return JSON.parse(result.output);
};

test("30 个新书源均生成独立脚本，产物与模板一致", async () => {
  const sources = JSON.parse(await readFile(new URL("../scripts/novel_sources.json", import.meta.url), "utf8"));
  const template = await readFile(new URL("../scripts/templates/novel_chapters.js.txt", import.meta.url), "utf8");
  assert.deepEqual(sources.map(source => source.key).sort(), fixtures.map(fixture => fixture.key).sort());
  for (const source of sources) assert.equal(scripts.get(source.key).source, template.replace("__SOURCE__", JSON.stringify(source, null, 2)));
});

for (const fixture of fixtures) test(fixture.key + "：完整目录、稳定 ID、去重、倒序及 XML 输出", async t => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async url => {
    calls.push(url);
    assert.ok([fixture.origin + fixture.book, fixture.origin + fixture.catalog].includes(url), url);
    return new Response(meta + fixture.html);
  });
  const feed = await run(fixture.key);
  assert.equal(feed.title, "书 & 名 · 章节更新");
  assert.equal(feed.author.name, "作者甲");
  assert.equal(feed.link, fixture.origin + fixture.book);
  assert.deepEqual(feed.items.map(item => item.link), [2, 1].map(id => fixture.origin + fixture.chapter + id + ".html"));
  assert.equal(feed.items[0].id, fixture.key + ":chapter:" + feed.items[0].link);
  assert.deepEqual(calls, [fixture.origin + fixture.book, ...(fixture.catalog === fixture.book ? [] : [fixture.origin + fixture.catalog])]);
  for (const format of ["rss", "atom"]) assert.equal(XMLValidator.validate(FeedModel(feed).render(format)), true);
});

test("所有书源拒绝非法 ID、缺标题和空目录，保留上游错误码", async t => {
  for (const fixture of fixtures) {
    t.mock.method(globalThis, "fetch", () => assert.fail("非法参数不应请求网络"));
    for (const book_id of ["../secret", "1?url=evil", "1%2f2", "123\n"]) await assert.rejects(run(fixture.key, { book_id }), error => error.problem.code === "INVALID_PARAMETER");
    t.mock.method(globalThis, "fetch", async () => new Response(meta));
    await assert.rejects(run(fixture.key), error => error.problem.code === "UPSTREAM_INVALID_RESPONSE");
    t.mock.method(globalThis, "fetch", async () => new Response("<html>unexpected</html>"));
    await assert.rejects(run(fixture.key), error => error.problem.code === "UPSTREAM_INVALID_RESPONSE");
    t.mock.method(globalThis, "fetch", async () => new Response("Too many requests", { status: 429 }));
    await assert.rejects(run(fixture.key), error => error.problem.code === "UPSTREAM_RATE_LIMITED");
  }
});

const next_page = href => '<ul class="pagination"><li class="page-item active"><a href="#">1</a></li><li class="page-item"><a href="' + href + '">2</a></li></ul>';
for (const [key, second] of [["d8zw", "/1/123/index_2.html"], ["xbiquge_info", "/1/123/index_2.html"], ["fsshu", "/biquge/1/123/index_2.html"]]) {
  test(key + "：沿下一页读取，拒绝循环、跨站、跨书籍及失败分页", async t => {
    const fixture = fixtures.find(fixture => fixture.key === key);
    const calls = [];
    t.mock.method(globalThis, "fetch", async url => {
      calls.push(url);
      return new Response(meta + (url.endsWith("index_2.html") ? book_list.replaceAll("/chapter/2.html", "/chapter/3.html") : book_list + next_page(second)));
    });
    assert.deepEqual((await run(key)).items.map(item => item.link.split("/").at(-1)), ["3.html", "2.html", "1.html"]);
    assert.equal(calls.length, 3);
    for (const bad of ["https://evil.example/page", second.replace("123", "999")]) {
      t.mock.method(globalThis, "fetch", async () => new Response(meta + book_list + next_page(bad)));
      await assert.rejects(run(key), error => error.problem.code === "UPSTREAM_INVALID_RESPONSE");
    }
    t.mock.method(globalThis, "fetch", async url => new Response(meta + book_list + next_page(url.endsWith("index_2.html") ? fixture.catalog : second)));
    await assert.rejects(run(key), /分页循环/);
    t.mock.method(globalThis, "fetch", async url => url.endsWith("index_2.html") ? new Response("Error", { status: 502 }) : new Response(meta + book_list + next_page(second)));
    await assert.rejects(run(key), error => error.problem.code === "UPSTREAM_FETCH_FAILED");
  });
}

for (const [key, second] of [["52bqg", "/book_123/index_2.html"], ["snxsw", "/index/123/2/"], ["xbiquge_cc", "/book/123/ml2.html"], ["xtxxs9", "/xiaoshuo/123/2/"], ["xszj", "/b/123/cs/2"], ["wxsy", "/novel/123/chapter_2.html"]]) {
  test(key + "：下拉目录翻页保序、去重，不重复请求当前页", async t => {
    const fixture = fixtures.find(fixture => fixture.key === key);
    const calls = [];
    t.mock.method(globalThis, "fetch", async url => {
      calls.push(url);
      const body = url === fixture.origin + second ? fixture.html.replaceAll("/chapter/2.html", "/chapter/3.html").replaceAll("read_tz(2)", "read_tz(3)") : fixture.html;
      return new Response(meta + body + '<select id="indexselect"><option value="' + fixture.catalog + '">1</option><option value="' + second + '">2</option></select>');
    });
    const feed = await run(key);
    assert.equal(feed.items.length, 3);
    assert.ok(feed.items[0].link.endsWith("/3.html"));
    assert.deepEqual(calls, [fixture.origin + fixture.book, fixture.origin + fixture.catalog, fixture.origin + second]);
  });
}

test("CF 页面和 HTTP 403 按需使用浏览器，验证失败不会输出空订阅", async t => {
  const challenge = '<title>Just a moment...</title><script>window._cf_chl_opt = {};</script>';
  for (const status of [200, 403]) {
    t.mock.method(globalThis, "fetch", async () => new Response(challenge, { status }));
    const calls = [];
    const feed = await run("ibiqugu", {}, async url => { calls.push(url); return { html: meta + list }; }, true);
    assert.equal(feed.items.length, 2);
    assert.deepEqual(calls, ["http://www.ibiqugu.net/1/123/"]);
    await assert.rejects(run("ibiqugu", {}, async () => ({ html: challenge }), true), error => error.problem.code === "UPSTREAM_AUTH_REQUIRED");
  }
  await assert.rejects(run("ibiqugu"), error => error.problem.code === "UPSTREAM_ACCESS_DENIED");
});

test("正文链接拒绝外站，空 onclick 和隐藏干扰项不会变成章节", async t => {
  t.mock.method(globalThis, "fetch", async () => new Response(meta + list.replace("/chapter/1.html", "https://evil.example/chapter")));
  await assert.rejects(run("ibiqugu"), error => error.problem.code === "UPSTREAM_INVALID_RESPONSE");
  t.mock.method(globalThis, "fetch", async () => new Response(meta + '<ul class="section-list"><li><a onclick="other(1)">错误链接</a></li></ul>'));
  await assert.rejects(run("52bqg"), error => error.problem.code === "UPSTREAM_INVALID_RESPONSE");
});

test("非标准详情页使用指定书名和第三个子节点的作者，不误读分类", async t => {
  for (const [key, detail] of [
    ["quanben5", '<h3><span>测试书籍</span></h3><div class="pic_txt_list"><div>封面</div><p><span>分类</span></p><p><span>测试作者</span></p></div>'],
    ["hetushu", '<div class="book_info"><h2>测试书籍</h2><div><a>分类</a></div><div><a>测试作者</a></div></div>'],
  ]) {
    const fixture = fixtures.find(fixture => fixture.key === key);
    t.mock.method(globalThis, "fetch", async () => new Response(detail + fixture.html));
    const feed = await run(key);
    assert.equal(feed.title, "测试书籍 · 章节更新");
    assert.equal(feed.author.name, "测试作者");
  }
});

test("速读谷读取下一页按钮，超过 100 页明确失败，不返回部分目录", async t => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async url => {
    calls++;
    const number = Number(url.match(/index_(\d+)\.html/)?.[1] || 1);
    return new Response(meta + '<div id="list"><ul>' + wrap("li", anchors) + '</ul></div><div id="pages"><a class="gr" href="/123/index_' + (number + 1) + '.html">下一页</a></div>');
  });
  await assert.rejects(run("suduguu"), /超过 100 页/);
  assert.equal(calls, 100);
});
