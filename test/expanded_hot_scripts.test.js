import { read_script } from "./support/script_sources.js";
import assert from "node:assert/strict";
import test from "node:test";
import { RssRoutePatternModel } from "findrss-worker/server/domain/rss_route.js";

const { compile_script_module, execute_script } = await import("findrss-worker/server/infra/script_sandbox.js");
const original_fetch = globalThis.fetch;
const feed_names = ["vimeo", "qiita", "slashdot", "arstechnica", "theverge", "npr", "nhk", "yahoo_japan", "itmedia"];
const names = ["youtube_hot", "tiktok", "dailymotion", "niconico", ...feed_names, "zenn", "reddit", "bluesky", "apple_charts", "deezer", "anilist", "myanimelist"];
const sources = {};
for (const name of names) {
  const source = read_script(`hot/${name}.js`);
  const compiled = await compile_script_module(source);
  assert.equal(compiled.error, "", name);
  sources[name] = { source, metadata: compiled.metadata };
}
const configs = { youtube_hot: { api_key: "youtube-private-fixture" }, tiktok: { advertiser_id: "12345678", access_token: "tiktok-private-fixture" } };
const rss = '<rss><channel><item><guid>one</guid><title>News &amp; update</title><link>https://example.org/one</link></item>' +
  '<item><guid>two</guid><title>日本語の記事</title><link>https://example.org/two</link></item>' +
  '<item><guid>one</guid><title>Duplicate</title><link>https://example.org/one</link></item></channel></rss>';
const atom = '<feed xmlns="http://www.w3.org/2005/Atom"><entry><id>one</id><title>日本語 &amp; 技術</title><link href="https://qiita.com/user/items/one"/></entry></feed>';
const rdf = '<rdf:RDF xmlns:rdf="urn:rdf"><channel><title>Slashdot</title></channel><item rdf:about="https://slashdot.org/one"><title>News</title><link>https://slashdot.org/one</link></item></rdf:RDF>';
const nico = { meta: { status: 200 }, data: { response: { $getTeibanRanking: { data: { items: [
  { id: "sm12345", title: "動画 &amp; テスト", count: { view: 123 }, thumbnail: { middleUrl: "https://cdn.example/nico.jpg" } },
  { id: "so67890", title: "次の動画" },
] } } } } };
const nico_page = value => '<meta name="server-response" content="' + JSON.stringify(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;") + '">';
const mal_row = (id, rank, score = "9.10", type = "anime") => '<tr class="ranking-list"><td class="rank"><span>' + rank + '</span></td>' +
  `<td class="title"><h3><a href="https://myanimelist.net/${type}/${id}/Title">作品 ${id}</a></h3><img data-src="https://cdn.example/${id}.jpg"></td>` +
  '<td class="score"><span class="score-label">' + score + '</span></td><td class="your-score"><span class="score-label">1.00</span></td></tr>';
const bodies = {
  ...Object.fromEntries(feed_names.map(name => [name, rss])), qiita: atom, slashdot: rdf,
  youtube_hot: { items: [{ id: "abcdefghijk", snippet: { title: "Video &amp; title", thumbnails: { medium: { url: "https://i.ytimg.com/vi/abcdefghijk/mqdefault.jpg" } } }, statistics: { viewCount: "0" } },
    { id: "123456789_-", snippet: { title: "Unknown views" } }] },
  tiktok: { code: 0, data: { list: [{ hashtag_id: "9007199254740993", hashtag_name: "日本語", rank_position: "3", posts: 123 },
    { hashtag_id: "123", hashtag_name: "#music", rank_position: "1", posts: 0 }] } },
  dailymotion: { list: [{ id: "x123abc", title: "Video", views_total: 12, thumbnail_240_url: "https://cdn.example/dm.jpg" }] },
  niconico: nico_page(nico),
  zenn: { articles: [{ id: 123, title: "技術記事", path: "/test/articles/abc", liked_count: 0 }] },
  reddit: { data: { children: [{ kind: "t3", data: { id: "abc123", title: "Pinned &amp; post", stickied: true, score: 0, thumbnail: "self" } },
    { kind: "t3", data: { id: "def456", title: "Discussion", score: -2, thumbnail: "https://cdn.example/reddit.jpg" } }] } },
  bluesky: { topics: [{ topic: "日本語 話題", displayName: "話題" }, { topic: "news" }], suggested: [{ topic: "Do not include" }] },
  apple_charts: { feed: { results: [{ id: "123", name: "The Daily", url: "https://podcasts.apple.com/us/podcast/id123", artworkUrl100: "https://cdn.example/apple.jpg" }] } },
  deezer: { data: [{ id: 123, title: "Song", position: 2, rank: 900000, album: { cover_medium: "https://cdn.example/deezer.jpg" } }, { id: 456, title: "Other song", position: 1, rank: 0 }] },
  anilist: { data: { Page: { media: [{ id: 123, title: { native: "日本語作品", english: "English title" }, coverImage: { large: "https://cdn.example/anilist.jpg" }, trending: 0 }] } } },
  myanimelist: '<table>' + mal_row("123", 2) + mal_row("456", 1, "N/A") + '</table>',
};

async function run(t, name, body = bodies[name], params = {}, query = {}, config = configs[name] || {}) {
  const requests = [];
  t.after(() => { globalThis.fetch = original_fetch; });
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return new Response(typeof body === "string" ? body : JSON.stringify(body));
  };
  const { source, metadata } = sources[name];
  const result = await execute_script(source, { ...metadata, config, debug: true }, null, undefined, [], `({params:${JSON.stringify(params)},query:${JSON.stringify(query)}})`);
  return { snapshot: JSON.parse(result.output), result, requests };
}

test("新增 20 个平台可在生产 QuickJS 中编译并执行，元数据和示例入口完整", async t => {
  assert.equal(names.length, 20);
  const paths = new Set();
  for (const name of names) {
    const { metadata } = sources[name];
    assert.equal(metadata.kind, "hot", name);
    assert.ok(metadata.category && Number.isSafeInteger(metadata.order), name);
    assert.ok(metadata.platform.icon.startsWith("<svg"), name);
    assert.ok(RssRoutePatternModel(metadata.path).match(metadata.example), name);
    assert.ok(!paths.has(metadata.path), name);
    paths.add(metadata.path);
    const { snapshot, requests } = await run(t, name);
    assert.equal(snapshot.kind, "hot_rank", name);
    assert.ok(snapshot.entries.length, name);
    assert.equal(new Set(snapshot.entries.map(row => row.id)).size, snapshot.entries.length, name);
    assert.equal(requests.length, 1, name);
    assert.ok(Number.isFinite(Date.parse(snapshot.observed_at)), name);
    if (!["tiktok", "deezer", "myanimelist"].includes(name)) assert.ok(snapshot.entries.every(row => row.rank === null), name);
  }
});

test("YouTube 使用官方 mostPopular、地区/分类及请求头密钥，保留零播放和缩略图", async t => {
  const { snapshot, requests, result } = await run(t, "youtube_hot", bodies.youtube_hot, { region: "jp", category: "10" });
  const request = requests[0], url = new URL(request.url);
  assert.equal(url.origin, "https://www.googleapis.com");
  assert.equal(url.searchParams.get("chart"), "mostPopular");
  assert.equal(url.searchParams.get("regionCode"), "JP");
  assert.equal(url.searchParams.get("videoCategoryId"), "10");
  assert.equal(url.searchParams.has("key"), false);
  assert.equal(new Headers(request.options.headers).get("X-Goog-Api-Key"), configs.youtube_hot.api_key);
  assert.equal(snapshot.entries[0].heat.value, 0);
  assert.equal(snapshot.entries[1].heat.value, null);
  assert.equal(snapshot.entries[0].link, "https://www.youtube.com/watch?v=abcdefghijk");
  assert.ok(snapshot.entries[0].thumbnail);
  assert.doesNotMatch(JSON.stringify(result), /youtube-private-fixture/);
});

test("TikTok 官方 Discovery 以广告账户和令牌请求，保留大整数 ID、真实名次及投稿数", async t => {
  for (const days of ["1", "7", "30", "120"]) {
    const { snapshot, requests, result } = await run(t, "tiktok", bodies.tiktok, { country: "jp", days });
    const request = requests[0], url = new URL(request.url);
    assert.equal(url.pathname, "/open_api/v1.3/discovery/trending_list/");
    assert.equal(url.searchParams.get("advertiser_id"), configs.tiktok.advertiser_id);
    assert.equal(url.searchParams.get("date_range"), days + "DAY");
    assert.equal(url.searchParams.get("country_code"), "JP");
    assert.equal(url.searchParams.get("discovery_type"), "HASHTAG");
    assert.equal(url.searchParams.has("access_token"), false);
    assert.equal(new Headers(request.options.headers).get("Access-Token"), configs.tiktok.access_token);
    assert.deepEqual(snapshot.entries.map(row => row.rank), [1, 3]);
    assert.equal(snapshot.entries[0].title, "#music");
    assert.equal(snapshot.entries[0].heat.value, 0);
    assert.equal(snapshot.entries[1].id, "tiktok:hashtag:9007199254740993");
    assert.equal(snapshot.entries[1].link, "https://www.tiktok.com/tag/" + encodeURIComponent("日本語"));
    assert.doesNotMatch(JSON.stringify(result), /tiktok-private-fixture/);
  }
});

test("缺少 YouTube/TikTok 配置时在发请求前明确报错", async t => {
  let requests = 0;
  t.mock.method(globalThis, "fetch", () => { requests++; assert.fail("不应请求上游"); });
  for (const name of ["youtube_hot", "tiktok"]) {
    const { source, metadata } = sources[name];
    await assert.rejects(execute_script(source, metadata), error => error.problem?.code === "INVALID_PARAMETER" && /脚本配置/.test(error.message), name);
    assert.equal(requests, 0);
  }
});

test("API 凭据在跨 origin 重定向后删除且返回原站时不恢复，调试日志只记录头名称", async t => {
  for (const [name, header] of [["youtube_hot", "x-goog-api-key"], ["tiktok", "access-token"]]) {
    const requests = [];
    t.mock.method(globalThis, "fetch", async (url, options) => {
      requests.push({ url, headers: new Headers(options.headers) });
      if (requests.length === 1) return new Response(null, { status: 302, headers: { Location: "https://redirect.example/other" } });
      if (requests.length === 2) return new Response(null, { status: 302, headers: { Location: requests[0].url } });
      return Response.json(bodies[name]);
    });
    const { source, metadata } = sources[name];
    const result = await execute_script(source, { ...metadata, config: configs[name], debug: true });
    assert.equal(requests.length, 3);
    assert.ok(requests[0].headers.get(header));
    assert.ok(requests.slice(1).every(request => !request.headers.has(header)));
    assert.ok(result.upstream_requests[0].credentials.headers_sent.includes(header));
    assert.doesNotMatch(JSON.stringify(result), /(?:youtube|tiktok)-private-fixture/);
  }
});

test("9 个新闻/精选源分别支持 RSS 2.0、RSS 1.0 和 Atom，保留原文与上游顺序", async t => {
  for (const name of feed_names) {
    const { snapshot } = await run(t, name);
    assert.ok(snapshot.entries.every(row => row.rank === null && row.heat.value === null), name);
    if (!["slashdot", "qiita"].includes(name)) {
      assert.deepEqual(snapshot.entries.map(row => row.title), ["News & update", "日本語の記事"], name);
      assert.equal(snapshot.entries[0].link, "https://example.org/one");
    }
  }
});

test("Dailymotion 地区榜保留播放数；Niconico 从 server-response 读取综合榜", async t => {
  const dm = await run(t, "dailymotion", bodies.dailymotion, { country: "JP" });
  assert.equal(new URL(dm.requests[0].url).searchParams.get("country"), "jp");
  assert.equal(dm.snapshot.entries[0].heat.value, 12);
  const nico = await run(t, "niconico");
  assert.equal(nico.snapshot.entries[0].id, "niconico:sm12345");
  assert.equal(nico.snapshot.entries[0].heat.value, 123);
  assert.equal(nico.snapshot.entries[1].heat.value, null);
});

test("Reddit 保留置顶和负得分文本，top 周期只用于 top 榜；Bluesky 不混入推荐话题", async t => {
  const reddit = await run(t, "reddit", bodies.reddit, { subreddit: "news", sort: "top" }, { period: "week" });
  const url = new URL(reddit.requests[0].url);
  assert.equal(url.pathname, "/r/news/top.json");
  assert.equal(url.searchParams.get("t"), "week");
  assert.equal(reddit.snapshot.entries[0].pinned, true);
  assert.equal(reddit.snapshot.entries[0].heat.value, 0);
  assert.equal("thumbnail" in reddit.snapshot.entries[0], false);
  assert.deepEqual(reddit.snapshot.entries[1].heat, { value: null, text: "-2", unit: "得分" });
  const bluesky = await run(t, "bluesky");
  assert.equal(bluesky.snapshot.entries.length, 2);
  assert.equal(bluesky.snapshot.entries[0].link, "https://bsky.app/search?q=" + encodeURIComponent("日本語 話題"));
});

test("Zenn 使用文章稳定 ID 和点赞数，Apple 各类地区榜使用正确 API 地址", async t => {
  const zenn = await run(t, "zenn");
  assert.equal(zenn.snapshot.entries[0].link, "https://zenn.dev/test/articles/abc");
  assert.equal(zenn.snapshot.entries[0].heat.value, 0);
  for (const country of ["us", "jp", "gb"]) for (const type of ["podcasts", "songs", "albums"]) {
    const { snapshot, requests } = await run(t, "apple_charts", bodies.apple_charts, { country, type });
    assert.equal(requests[0].url, `https://rss.marketingtools.apple.com/api/v2/${country}/${type === "podcasts" ? "podcasts/top" : "music/most-played"}/50/${type}.json`);
    assert.equal(snapshot.entries[0].id, "apple:" + type + ":123");
    assert.equal(snapshot.category, type === "podcasts" ? "播客" : "音乐");
  }
});

test("Deezer position 才是名次，rank 是评分；AniList 使用 GraphQL 趋势排序并优先日文标题", async t => {
  const deezer = await run(t, "deezer");
  assert.deepEqual(deezer.snapshot.entries.map(row => row.rank), [1, 2]);
  assert.deepEqual(deezer.snapshot.entries.map(row => row.heat.value), [0, 900000]);
  for (const type of ["anime", "manga"]) {
    const { snapshot, requests } = await run(t, "anilist", bodies.anilist, { type });
    const request = requests[0], body = JSON.parse(request.options.body);
    assert.equal(request.options.method, "POST");
    assert.match(body.query, /TRENDING_DESC/);
    assert.equal(body.variables.type, type.toUpperCase());
    assert.equal(snapshot.entries[0].title, "日本語作品");
    assert.equal(snapshot.entries[0].heat.value, 0);
  }
});

test("MyAnimeList 动画、漫画、轻小说保留明确名次和评分，不读取用户自己的评分", async t => {
  const anime = await run(t, "myanimelist");
  assert.deepEqual(anime.snapshot.entries.map(row => row.rank), [1, 2]);
  assert.equal(anime.snapshot.entries[0].heat.value, null);
  assert.equal(anime.snapshot.entries[1].heat.value, 9.1);
  for (const type of ["manga", "novels"]) {
    const { snapshot, requests } = await run(t, "myanimelist", '<table>' + mal_row("123", 1, "9.5", "manga") + '</table>', { type });
    assert.equal(snapshot.entries[0].id, "myanimelist:manga:123");
    assert.equal(snapshot.category, type === "novels" ? "小说" : "动漫");
    assert.equal(requests[0].url, "https://myanimelist.net/topmanga.php" + (type === "novels" ? "?type=novels" : ""));
  }
});

test("全部新增脚本拒绝验证页、空列表、损坏数据与不安全图片，并透传上游失败", async t => {
  for (const name of names) {
    await assert.rejects(run(t, name, '<html><title>Access verification</title></html>'), error => error.problem?.code === "UPSTREAM_INVALID_RESPONSE", name);
    const { source, metadata } = sources[name];
    const failing = source + '\nconst original = route.handler; route.handler = ctx => original({ ...ctx, fetchText: async () => Result.Err("请求超时", "UPSTREAM_TIMEOUT") });';
    await assert.rejects(execute_script(failing, { ...metadata, config: configs[name] || {} }), error => error.problem?.code === "UPSTREAM_TIMEOUT", name);
  }
  const invalid = [
    ...feed_names.map(name => [name, '<rss><channel/></rss>']),
    ["youtube_hot", { items: [] }], ["youtube_hot", { error: { message: "Denied" } }],
    ["youtube_hot", { items: [{ ...bodies.youtube_hot.items[0], id: "bad" }] }],
    ["tiktok", { code: 40101, message: "no permission" }], ["tiktok", { code: 0, data: { list: [] } }],
    ["tiktok", { code: 0, data: { list: [{ hashtag_id: 9007199254740992, hashtag_name: "test" }] } }],
    ["tiktok", { code: 0, data: { list: [{ hashtag_id: "1", hashtag_name: "#" }] } }],
    ["dailymotion", { list: [] }], ["zenn", { articles: [] }], ["reddit", { data: { children: [] } }], ["bluesky", { topics: [] }],
    ["niconico", nico_page({ ...nico, meta: { status: 403 } })],
    ["zenn", { articles: [{ ...bodies.zenn.articles[0], path: "//evil.example/abc" }] }],
    ["apple_charts", { feed: { results: [] } }], ["deezer", { data: [] }],
    ["anilist", { errors: [{ message: "Rate limited" }], data: bodies.anilist.data }], ["anilist", { data: { Page: { media: [] } } }],
    ["myanimelist", '<table></table>'], ["myanimelist", '<table>' + mal_row("1", 0) + '</table>'],
    ["dailymotion", { list: [{ ...bodies.dailymotion.list[0], thumbnail_240_url: "javascript:bad" }] }],
  ];
  for (const [name, body] of invalid) await assert.rejects(run(t, name, body), error => error.problem?.code === "UPSTREAM_INVALID_RESPONSE", name);
});

test("参数错误在发请求前拒绝，配置令牌不接受换行注入", async t => {
  t.mock.method(globalThis, "fetch", () => assert.fail("参数错误不应请求"));
  for (const [name, params, query = {}] of [
    ["youtube_hot", { region: "../US" }], ["youtube_hot", { category: "music" }], ["tiktok", { days: "5" }], ["tiktok", { country: "../US" }],
    ["dailymotion", { country: "usa" }], ["reddit", { subreddit: "../news" }], ["reddit", { sort: "new" }], ["reddit", { sort: "hot" }, { period: "week" }],
    ["apple_charts", { type: "__proto__" }], ["apple_charts", { country: "../us" }], ["anilist", { type: "unknown" }], ["myanimelist", { type: "unknown" }],
  ]) {
    const { source, metadata } = sources[name];
    await assert.rejects(execute_script(source, { ...metadata, config: configs[name] || {} }, null, undefined, [], `({params:${JSON.stringify(params)},query:${JSON.stringify(query)}})`),
      error => error.problem?.code === "INVALID_PARAMETER", name);
  }
  for (const [name, key] of [["youtube_hot", "api_key"], ["tiktok", "access_token"]]) {
    const { source, metadata } = sources[name];
    await assert.rejects(execute_script(source, { ...metadata, config: { ...configs[name], [key]: "secret\r\nHost: evil.example" } }), /请求头值无效/);
  }
});
