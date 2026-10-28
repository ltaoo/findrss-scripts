import { read_script } from "./support/script_sources.js";
import assert from "node:assert/strict";
import test from "node:test";
import { RssRoutePatternModel } from "findrss-worker/server/domain/rss_route.js";

const { compile_script_module, execute_script } = await import("findrss-worker/server/infra/script_sandbox.js");
const original_fetch = globalThis.fetch;
const names = ["google_news", "techmeme", "lobsters", "devto", "hatena", "mastodon", "gutenberg", "kakuyomu", "narou"];
const sources = {};
for (const name of names) {
  const source = read_script(`hot/${name}.js`);
  const compiled = await compile_script_module(source);
  assert.equal(compiled.error, "", name);
  sources[name] = { source, metadata: compiled.metadata };
}

const news = '<rss version="2.0"><channel><title>News</title>' +
  '<item><guid>article-1</guid><title>News &amp; analysis</title><link>https://news.example/1</link></item>' +
  '<item><guid>article-2</guid><title>日本語ニュース</title><link>https://news.example/2</link></item>' +
  '<item><guid>article-1</guid><title>Duplicate</title><link>https://news.example/1</link></item></channel></rss>';
const lobsters = [{ short_id: "abc123", title: "A &amp; B", score: 12 }, { short_id: "next42", title: "Unknown score" }, { short_id: "abc123", title: "Duplicate", score: 100 }];
const devto = [{ id: 123, title: "DEV &amp; tools", url: "https://dev.to/user/article", public_reactions_count: 0, cover_image: "//images.example/dev.jpg" },
  { id: "9007199254740993", title: "No image", url: "https://dev.to/user/next" }];
const hatena = '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:hatena="http://www.hatena.ne.jp/info/xmlns#">' +
  '<channel><title>Hatena</title></channel><item><title>人気記事 &amp; 話題</title><link>https://example.jp/news</link><hatena:bookmarkcount>123</hatena:bookmarkcount></item>' +
  '<item><title>次の記事</title><link>https://example.jp/next</link></item>' +
  '<item><title>Duplicate</title><link>https://example.jp/news</link></item></rdf:RDF>';
const mastodon = [{ url: "https://example.org/article", title: "Trending news", image: "//cdn.example/news.jpg", history: [{ uses: "0", accounts: "0" }, { uses: "99" }] },
  { url: "https://example.org/next", title: "Other news" }];
const gutenberg = '<h2 id="authors-last1">Authors</h2><ol><li><a href="/ebooks/author/1">Do not include (9999)</a></li></ol>' +
  [1, 7, 30].map(days => `<h2 id="books-last${days}">Top books</h2><ol>` +
    `<li><a href="/ebooks/1342">Pride and Prejudice by Jane Austen (${days},234)</a></li>` +
    '<li><a href="/ebooks/84">Frankenstein (2024 edition) (0)</a></li>' +
    '<li><a href="/ebooks/11">Unknown downloads</a></li>' +
    '<li><a href="/ebooks/1342">Duplicate (999)</a></li></ol>').join("");
const kakuyomu_row = (id, rank, stars = "") => `<li class="Rankings_item__newhash"><div class="RankingWorkBox_rank__newhash">${rank}</div>` +
  `<a href="/works/999">Promoted catchphrase</a><h3><a href="/works/${id}">小説 &amp; ${id}</a><a href="/users/author">作者</a></h3>` +
  `<a href="/works/${id}/reviews">${stars}</a></li>`;
const kakuyomu = "<ol>" + kakuyomu_row("9007199254740993", "2", "★1,234") + kakuyomu_row("11054822663814504924", "1", "★0")
  + kakuyomu_row("9007199254740993", "3", "★9999") + "</ol>";
const narou = [{ allcount: 999 }, { ncode: "N1234AB", title: "小説 &amp; 冒険", daily_point: 0, weekly_point: 12, monthly_point: 34, quarter_point: 56, yearly_point: 78, global_point: 90 },
  { ncode: "N5678CD", title: "不明な得点" }, { ncode: "n1234ab", title: "Duplicate" }];
const bodies = { google_news: news, techmeme: news, lobsters, devto, hatena, mastodon, gutenberg, kakuyomu, narou };

async function run(t, name, body = bodies[name], params = {}, query = {}) {
  const requests = [];
  t.after(() => { globalThis.fetch = original_fetch; });
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return new Response(typeof body === "string" ? body : JSON.stringify(body));
  };
  const { source, metadata } = sources[name];
  const result = await execute_script(source, metadata, null, undefined, [], `({params:${JSON.stringify(params)},query:${JSON.stringify(query)}})`);
  return { snapshot: JSON.parse(result.output), requests };
}

test("9 个国外 Hot 示例声明完整元数据、唯一入口，默认榜单能解析且不伪造排名", async t => {
  const paths = new Set();
  for (const name of names) {
    const { metadata } = sources[name];
    assert.equal(metadata.script_type, "hot", name);
    assert.ok(metadata.category && Number.isSafeInteger(metadata.order), name);
    assert.ok(metadata.platform.name && metadata.platform.icon.startsWith("<svg"), name);
    assert.deepEqual(metadata.permissions.cookies, [], name);
    assert.equal(paths.has(metadata.path), false, name);
    paths.add(metadata.path);
    assert.ok(RssRoutePatternModel(metadata.path).match(metadata.example), name);
    const { snapshot, requests } = await run(t, name);
    assert.equal(snapshot.kind, "hot_rank", name);
    assert.equal(snapshot.category, metadata.category, name);
    assert.ok(snapshot.entries.length >= 2, name);
    assert.equal(new Set(snapshot.entries.map(row => row.id)).size, snapshot.entries.length, name);
    assert.equal(requests.length, 1, name);
    assert.ok(Number.isFinite(Date.parse(snapshot.observed_at)), name);
    assert.equal("items" in snapshot, false, name);
    if (name !== "kakuyomu") assert.ok(snapshot.entries.every(row => row.rank === null), name);
  }
});

test("Google News 使用英语美国/英国及日语日本版，支持全部主题并保留原顺序", async t => {
  for (const [edition, hl, gl, ceid] of [["us", "en-US", "US", "US:en"], ["gb", "en-GB", "GB", "GB:en"], ["jp", "ja", "JP", "JP:ja"]]) {
    for (const topic of ["top", "world", "nation", "business", "technology", "entertainment", "sports", "science", "health"]) {
      const { snapshot, requests } = await run(t, "google_news", news, { edition, topic });
      const url = new URL(requests[0].url);
      assert.equal(url.pathname, "/rss" + (topic === "top" ? "" : "/headlines/section/topic/" + topic.toUpperCase()));
      assert.equal(url.searchParams.get("hl"), hl);
      assert.equal(url.searchParams.get("gl"), gl);
      assert.equal(url.searchParams.get("ceid"), ceid);
      assert.deepEqual(snapshot.entries.map(row => row.title), ["News & analysis", "日本語ニュース"]);
      assert.ok(snapshot.entries.every(row => row.heat.value === null));
    }
  }
});

test("Techmeme 保留头条 GUID 和跳转链接；Lobsters 保留帖子 ID 和上游得分", async t => {
  const tech = await run(t, "techmeme");
  assert.equal(tech.requests[0].url, "https://www.techmeme.com/feed.xml");
  assert.equal(tech.snapshot.entries[0].id, "techmeme:article-1");
  assert.equal(tech.snapshot.entries[0].link, "https://news.example/1");
  assert.deepEqual(tech.snapshot.entries[0].heat, { value: null, unit: "热度", text: "" });
  const lobster = await run(t, "lobsters");
  assert.equal(lobster.requests[0].url, "https://lobste.rs/hottest.json");
  assert.equal(lobster.snapshot.entries[0].link, "https://lobste.rs/s/abc123");
  assert.equal(lobster.snapshot.entries[0].title, "A & B");
  assert.equal(lobster.snapshot.entries.length, 2);
  assert.deepEqual(lobster.snapshot.entries[0].heat, { value: 12, unit: "得分", text: "12" });
  assert.equal(lobster.snapshot.entries[1].heat.value, null);
  const negative = await run(t, "lobsters", [{ ...lobsters[0], score: -1 }]);
  assert.deepEqual(negative.snapshot.entries[0].heat, { value: null, unit: "得分", text: "-1" });
});

test("DEV 日周月年榜使用官方 top 参数，保留零互动、大整数 ID 与可选封面", async t => {
  for (const [period, days] of [["day", 1], ["week", 7], ["month", 30], ["year", 365]]) {
    const { snapshot, requests } = await run(t, "devto", devto, { period });
    assert.equal(requests[0].url, `https://dev.to/api/articles?top=${days}&per_page=30`);
    assert.equal(snapshot.entries[0].heat.value, 0);
    assert.equal(snapshot.entries[0].thumbnail, "https://images.example/dev.jpg");
    assert.equal(snapshot.entries[1].id, "devto:9007199254740993");
    assert.equal(snapshot.entries[1].heat.value, null);
    assert.equal("thumbnail" in snapshot.entries[1], false);
  }
});

test("Hatena 解析 RSS 1.0 全部分类、日语标题与原始书签数，去重且不混入 channel", async t => {
  for (const topic of ["all", "general", "social", "economics", "life", "knowledge", "it", "fun", "entertainment", "game"]) {
    const { snapshot, requests } = await run(t, "hatena", hatena, { topic });
    assert.equal(requests[0].url, "https://b.hatena.ne.jp/hotentry/" + topic + ".rss");
    assert.equal(snapshot.entries.length, 2);
    assert.equal(snapshot.entries[0].title, "人気記事 & 話題");
    assert.equal(snapshot.entries[0].id, "hatena:https://example.jp/news");
    assert.deepEqual(snapshot.entries[0].heat, { value: 123, unit: "书签", text: "123" });
    assert.equal(snapshot.entries[1].heat.value, null);
  }
});

test("Mastodon 热门链接与话题只用首日分享数，动态使用点赞数并转换 HTML 标题", async t => {
  const links = await run(t, "mastodon");
  assert.equal(links.requests[0].url, "https://mastodon.social/api/v1/trends/links?limit=20");
  assert.equal(links.snapshot.entries[0].heat.value, 0);
  assert.equal(links.snapshot.entries[0].thumbnail, "https://cdn.example/news.jpg");
  const tags = await run(t, "mastodon", [{ name: "日本語", url: "https://mastodon.social/tags/日本語", history: [{ uses: "42" }] }], { type: "tags" });
  assert.equal(tags.snapshot.entries[0].title, "#日本語");
  assert.equal(tags.snapshot.entries[0].heat.value, 42);
  const statuses = await run(t, "mastodon", [{ id: "9007199254740993", url: "https://mastodon.social/@user/9007199254740993",
    content: "<p>Hello &amp; <b>world</b></p>", favourites_count: 12, reblogs_count: 99,
    media_attachments: [{ preview_url: "https://cdn.example/media.jpg" }] },
  { id: "123", url: "https://mastodon.social/@user/123", content: "", account: { display_name: "<img>", acct: "user" }, favourites_count: 0 }], { type: "statuses" });
  assert.equal(statuses.snapshot.entries[0].title, "Hello & world");
  assert.equal(statuses.snapshot.entries[0].id, "mastodon.social:statuses:9007199254740993");
  assert.deepEqual(statuses.snapshot.entries[0].heat, { value: 12, unit: "点赞", text: "12" });
  assert.equal(statuses.snapshot.entries[1].title, "user");
});

test("Gutenberg 精确选择昨日/7天/30天图书榜，排除作者榜并保留下载数", async t => {
  for (const [period, days] of [["day", 1], ["week", 7], ["month", 30]]) {
    const { snapshot } = await run(t, "gutenberg", gutenberg, { period });
    assert.equal(snapshot.entries.length, 3);
    assert.equal(snapshot.link, `https://www.gutenberg.org/browse/scores/top#books-last${days}`);
    assert.equal(snapshot.entries[0].id, "gutenberg:book:1342");
    assert.equal(snapshot.entries[0].title, "Pride and Prejudice by Jane Austen");
    assert.equal(snapshot.entries[0].heat.value, Number(`${days}234`));
    assert.equal(snapshot.entries[1].title, "Frankenstein (2024 edition)");
    assert.equal(snapshot.entries[1].heat.value, 0);
    assert.equal(snapshot.entries[2].heat.value, null);
  }
});

test("カクヨム 保留大整数作品 ID、明确排名和星标，忽略同一作品的宣传链接", async t => {
  const { snapshot, requests } = await run(t, "kakuyomu");
  assert.equal(requests[0].url, "https://kakuyomu.jp/rankings/all/daily?work_variation=long");
  assert.deepEqual(snapshot.entries.map(row => row.rank), [1, 2]);
  assert.equal(snapshot.entries[0].id, "kakuyomu:work:11054822663814504924");
  assert.equal(snapshot.entries[0].heat.value, 0);
  assert.deepEqual(snapshot.entries[1].heat, { value: 1234, unit: "星标", text: "★1,234" });
  for (const period of ["daily", "weekly", "monthly", "yearly", "entire"]) {
    const { requests } = await run(t, "kakuyomu", kakuyomu, { period }, { length: "short" });
    assert.equal(requests[0].url, `https://kakuyomu.jp/rankings/all/${period}?work_variation=short`);
  }
  for (const genre of ["all", "fantasy", "action", "sf", "love_story", "romance", "drama", "horror", "mystery", "nonfiction", "history", "criticism", "others"]) {
    const { requests } = await run(t, "kakuyomu", kakuyomu, { genre }, { length: "all" });
    assert.equal(requests[0].url, `https://kakuyomu.jp/rankings/${genre}/daily?work_variation=all`);
  }
});

test("なろう 使用官方积分排序字段、跳过统计头、按 N 代码去重且不补造历史排名", async t => {
  for (const [period, order, output, score] of [["daily", "dailypoint", "dp", 0], ["weekly", "weeklypoint", "wp", 12],
    ["monthly", "monthlypoint", "mp", 34], ["quarter", "quarterpoint", "qp", 56], ["yearly", "yearlypoint", "yp", 78], ["total", "hyoka", "gp", 90]]) {
    const { snapshot, requests } = await run(t, "narou", narou, { period });
    assert.equal(requests[0].url, `https://api.syosetu.com/novelapi/api/?out=json&lim=30&of=t-n-${output}&order=${order}`);
    assert.equal(snapshot.entries.length, 2);
    assert.equal(snapshot.entries[0].id, "narou:novel:n1234ab");
    assert.equal(snapshot.entries[0].link, "https://ncode.syosetu.com/n1234ab/");
    assert.equal(snapshot.entries[0].heat.value, score);
    assert.equal(snapshot.entries[1].heat.value, null);
  }
});

test("国外榜单拒绝验证页、空列表、无效 ID、缺失标题和不安全链接", async t => {
  const invalid = [
    ...names.map(name => [name, "<html><title>Just a moment...</title>Access verification</html>"]),
    ["google_news", "<rss><channel></channel></rss>"], ["techmeme", "<rss><channel></channel></rss>"],
    ["lobsters", []], ["devto", []], ["mastodon", []], ["hatena", '<rdf:RDF xmlns:rdf="urn:rdf"></rdf:RDF>'],
    ["gutenberg", '<h2 id="books-last1">Books</h2><ol></ol>'], ["gutenberg", '<h2 id="books-last1">Books</h2><h2>Authors</h2><ol></ol>'],
    ["kakuyomu", '<ol class="Rankings_list__newhash"></ol>'], ["narou", [{ allcount: 0 }]],
    ["lobsters", [{ ...lobsters[0], short_id: "../evil" }]], ["lobsters", [{ ...lobsters[0], title: "" }]],
    ["devto", [{ ...devto[0], id: 9007199254740992 }]], ["devto", [{ ...devto[0], public_reactions_count: -1 }]],
    ["devto", [{ ...devto[0], url: "javascript:alert(1)" }]], ["devto", [{ ...devto[0], cover_image: "data:image/png,bad" }]],
    ["mastodon", [{ ...mastodon[0], url: "" }]], ["mastodon", [{ ...mastodon[0], history: [{ uses: "NaN" }] }]],
    ["hatena", hatena.replace("https://example.jp/news", "javascript:alert(1)")],
    ["gutenberg", gutenberg.replace("/ebooks/1342", "/ebooks/author/1342")],
    ["kakuyomu", kakuyomu.replace('href="/works/9007199254740993"', 'href="/works/invalid"')],
    ["kakuyomu", kakuyomu.replace('>2</div>', '>0</div>')],
    ["narou", [{ allcount: 1 }, { ncode: "../evil", title: "Bad" }]],
  ];
  for (const [name, body] of invalid) {
    await assert.rejects(run(t, name, body), error => error.problem?.code === "UPSTREAM_INVALID_RESPONSE", name);
  }
});

test("国外榜单在请求前拒绝未知参数与原型属性，并保留上游请求错误", async t => {
  for (const [name, params, query = {}] of [
    ["google_news", { edition: "__proto__" }], ["google_news", { topic: "unknown" }], ["devto", { period: "constructor" }],
    ["hatena", { topic: "../it" }], ["mastodon", { type: "timelines" }], ["gutenberg", { period: "all" }],
    ["kakuyomu", { period: "all" }], ["kakuyomu", { genre: "../works" }], ["kakuyomu", {}, { length: "unknown" }], ["narou", { period: "constructor" }],
  ]) {
    t.mock.method(globalThis, "fetch", () => assert.fail("非法参数不应发起请求"));
    const { source, metadata } = sources[name];
    await assert.rejects(execute_script(source, metadata, null, undefined, [], `({params:${JSON.stringify(params)},query:${JSON.stringify(query)}})`),
      error => error.problem?.code === "INVALID_PARAMETER", name);
  }
  for (const name of names) {
    const { source, metadata } = sources[name];
    const failing = source + '\nconst original = route.handler; route.handler = ctx => original({ ...ctx, fetchText: async () => Result.Err("请求超时", "UPSTREAM_TIMEOUT") });';
    await assert.rejects(execute_script(failing, metadata), error => error.problem?.code === "UPSTREAM_TIMEOUT" && /请求超时/.test(error.message), name);
  }
});
