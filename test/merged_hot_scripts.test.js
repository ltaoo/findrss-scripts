import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { read_script } from "./support/script_sources.js";
import { ScriptCookieAccess } from "findrss-worker/server/infra/script_cookie_access.js";

const { compile_script_module, execute_script } = await import("findrss-worker/server/infra/script_sandbox.js");
const article = { id: 123, title: "测试标题", uri: "https://wallstreetcn.com/articles/123", reading_num: 42 };
const video = { bvid: "BV123", title: "测试标题", stat: { view: 42 }, pts: 99 };
const fixtures = [
  { file: "36kr", path: "/36kr/newsflashes", url: "https://www.36kr.com/newsflashes",
    body: '<div class="newsflash-item"><a class="item-title" href="/newsflashes/123">测试标题</a></div>',
    id: "36kr-quick:/newsflashes/123", link: "https://www.36kr.com/newsflashes/123", heat: null },
  { file: "36kr", path: "/36kr/hot-list/renqi", url: "https://36kr.com/hot-list/renqi/",
    body: '<script>window.initialState={"hotListDetail":{"articleList":{"itemList":[{"itemId":123,"widgetTitle":"测试标题","rank":1,"statHot":"1.23"}]}}};</script>',
    id: "36kr-renqi:/p/123", link: "https://36kr.com/p/123", heat: 12300 },
  { file: "bilibili", path: "/bilibili/main/hotword", url: "https://s.search.bilibili.com/main/hotword?limit=30",
    body: { code: 0, list: [{ keyword: "测试标题", position: 1 }] },
    id: "bilibili-hot-search:测试标题", link: "https://search.bilibili.com/all?keyword=" + encodeURIComponent("测试标题"), heat: null },
  { file: "bilibili", path: "/bilibili/x/web-interface/popular", url: "https://api.bilibili.com/x/web-interface/popular",
    body: { code: 0, data: { list: [video, video] } },
    id: "bilibili-hot-video:BV123", link: "https://www.bilibili.com/video/BV123", heat: 42 },
  { file: "bilibili", path: "/bilibili/x/web-interface/ranking/v2", url: "https://api.bilibili.com/x/web-interface/ranking/v2",
    body: { code: 0, data: { list: [video, video] } },
    id: "bilibili-ranking:BV123", link: "https://www.bilibili.com/video/BV123", heat: 99 },
  { file: "chongbuluo", path: "/chongbuluo/forum.php/hot", url: "https://www.chongbuluo.com/forum.php?mod=guide&view=hot",
    body: '<div class="bmw"><table><tr><td>表头</td></tr><tr><td class="common"><a class="xst" href="thread-123-1-1.html">测试标题</a></td></tr></table></div>',
    id: "chongbuluo-hot:thread-123-1-1.html", link: "https://www.chongbuluo.com/thread-123-1-1.html", heat: null },
  { file: "chongbuluo", path: "/chongbuluo/forum.php/latest", url: "https://www.chongbuluo.com/forum.php?mod=rss&view=newthread",
    body: '<rss><channel><item><guid>123</guid><title>测试标题</title><link>https://www.chongbuluo.com/thread-123-1-1.html</link></item></channel></rss>',
    id: "chongbuluo-latest:123", link: "https://www.chongbuluo.com/thread-123-1-1.html", heat: null },
  { file: "cls", path: "/cls/v3/depth/home/assembled/1000", url: "https://www.cls.cn/v3/depth/home/assembled/1000",
    body: { code: 0, data: { depth_list: [{ ...article, is_ad: true }, article, article] } },
    id: "cls-depth:123", link: "https://www.cls.cn/detail/123", heat: 42 },
  { file: "cls", path: "/cls/v2/article/hot/list", url: "https://www.cls.cn/v2/article/hot/list",
    body: { code: 0, data: [{ ...article, is_ad: true }, article, article] },
    id: "cls-hot:123", link: "https://www.cls.cn/detail/123", heat: 42 },
  { file: "cls", path: "/cls/v1/roll/get_roll_list", url: "https://www.cls.cn/v1/roll/get_roll_list",
    body: { code: 0, data: { roll_data: [{ ...article, is_ad: true }, article, article] } },
    id: "cls-telegraph:123", link: "https://www.cls.cn/detail/123", heat: 42 },
  { file: "fastbull", path: "/fastbull/cn/express-news", url: "https://www.fastbull.com/cn/express-news",
    body: '<div class="content-list news-list"><a data-id="123"><span class="title_name">【测试标题】正文</span></a></div>',
    id: "fastbull-express:123", link: "https://www.fastbull.com/cn/fastshort/123", heat: null },
  { file: "fastbull", path: "/fastbull/cn/news", url: "https://www.fastbull.com/cn/news",
    body: '<a class="trending_type" href="/cn/news/123"><span class="title">测试标题</span></a>',
    id: "fastbull-news:/cn/news/123", link: "https://www.fastbull.com/cn/news/123", heat: null },
  { file: "wallstreetcn", path: "/wallstreetcn/apiv1/content/articles/hot", url: "https://api-one.wallstcn.com/apiv1/content/articles/hot?period=all",
    body: { code: 20000, data: { day_items: [article, article] } },
    id: "wallstreetcn-hot:123", link: article.uri, heat: null },
  { file: "wallstreetcn", path: "/wallstreetcn/apiv1/content/information-flow", url: "https://api-one.wallstcn.com/apiv1/content/information-flow?channel=global-channel&accept=article&limit=30",
    body: { code: 20000, data: { items: [{ resource_type: "ad", resource: article }, { resource_type: "article", resource: article }] } },
    id: "wallstreetcn-news:123", link: article.uri, heat: null },
  { file: "wallstreetcn", path: "/wallstreetcn/apiv1/content/lives", url: "https://api-one.wallstcn.com/apiv1/content/lives?channel=global-channel&limit=30",
    body: { code: 20000, data: { items: [article, article] } },
    id: "wallstreetcn-quick:123", link: article.uri, heat: null },
];

const sources = new Map();
for (const file of new Set(fixtures.map(fixture => fixture.file))) {
  const source = read_script(`hot/${file}.js`);
  const compiled = await compile_script_module(source);
  assert.equal(compiled.error, "", file);
  assert.deepEqual(compiled.metadata.routes.map(route => route.path), fixtures.filter(fixture => fixture.file === file).map(fixture => fixture.path));
  sources.set(file, { source, metadata: compiled.metadata });
}

for (const fixture of fixtures) test("同源合并后保留请求、稳定 ID、内容与热度：" + fixture.path, async t => {
  const { source, metadata } = sources.get(fixture.file);
  const route = metadata.routes.find(route => route.path === fixture.path);
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls++;
    if (fixture.file === "cls") {
      const request = new URL(url);
      assert.equal(request.origin + request.pathname, fixture.url);
      const signature = request.searchParams.get("sign");
      request.searchParams.delete("sign");
      const sha1 = createHash("sha1").update(request.searchParams.toString()).digest("hex");
      assert.equal(signature, createHash("md5").update(sha1).digest("hex"));
      assert.equal(new Headers(options.headers).get("referer"), "https://www.cls.cn/telegraph");
    } else if (fixture.path === "/36kr/hot-list/renqi") {
      assert.ok(url.startsWith(fixture.url));
    } else {
      assert.equal(url, fixture.url);
    }
    return new Response(typeof fixture.body === "string" ? fixture.body : JSON.stringify(fixture.body));
  });
  const access = new ScriptCookieAccess({ permissions: metadata.permissions, cookies: () => [], assert_grant() {} });
  const result = await execute_script(source, { ...metadata, ...route }, null, undefined, [], "", access);
  assert.equal(access.records.length > 0, fixture.path === "/36kr/hot-list/renqi", "只有人气榜申请验证 Cookie");
  const snapshot = JSON.parse(result.output);
  assert.equal(calls, 1);
  assert.equal(snapshot.title, route.name);
  assert.equal(snapshot.entries.length, 1);
  assert.equal(snapshot.entries[0].id, fixture.id);
  assert.equal(snapshot.entries[0].link, fixture.link);
  assert.equal(snapshot.entries[0].title, "测试标题");
  assert.equal(snapshot.entries[0].heat.value, fixture.heat);
});
