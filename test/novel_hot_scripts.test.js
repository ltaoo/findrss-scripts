import { read_script } from "./support/script_sources.js";
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { RssRoutePatternModel } from "findrss-worker/server/domain/rss_route.js";
import { ScriptCookieAccess } from "findrss-worker/server/infra/script_cookie_access.js";
import { WorkerCookieAccess } from "../worker/cookies.js";
import { mock_tcp_http } from "findrss-worker/test/support/tcp_socket_fixture.js";

const { compile_script_module, execute_script } = await import("findrss-worker/server/infra/script_sandbox.js");
const original_fetch = globalThis.fetch;
const catalog = JSON.parse(await readFile(new URL("./fixtures/novel_rank_catalog.json", import.meta.url), "utf8"));

const qidian_page = rows => '<script id="vite-plugin-ssr_pageContext" type="application/json">' +
  JSON.stringify({ pageContext: { pageProps: { pageData: { records: rows } } } }) + "</script>";
const qidian_body = qidian_page([
  { bid: "9007199254740993", bName: "测试 &amp; 小说", rankNum: 2, rankCnt: "11.1万月票" },
  { bid: "1036526469", bName: "榜首", rankNum: 1, rankCnt: "1,234月票" },
  { bid: "9007199254740993", bName: "重复", rankNum: 3 },
]);
const qdmm_page = rows => '<div class="book-img-text"><ul>' + rows.map((row, index) =>
  '<li data-rid="' + (index + 1) + '"><div class="book-img-box">' +
  '<a href="//www.qdmm.com/book/' + row.bid + '/" data-bid="' + row.bid + '">' +
  '<img src="//bookcover.yuewen.com/qdbimg/349573/' + row.bid + '/150.webp" alt="' + row.bName + '在线阅读"></a></div>' +
  '<div class="book-mid-info"><h2><a href="//www.qdmm.com/book/' + row.bid + '/" data-bid="' + row.bid +
  '" title="' + row.bName + '最新章节在线阅读">' + row.bName + '</a></h2></div>' +
  (row.heat === undefined ? "" : '<div class="book-right-info"><div class="total"><p><span>' + row.heat + '</span>' + (row.unit || "月票") + '</p></div></div>') +
  '</li>').join("") + '</ul></div>';
const qdmm_body = qdmm_page([
  { bid: "9007199254740993", bName: "测试 &amp; 小说", heat: "11.1万", unit: "月票" },
  { bid: "1036526469", bName: "榜首", heat: "1,234", unit: "月票" },
  { bid: "9007199254740993", bName: "重复", heat: "9" },
]);
const fanqie_page = (books, rank_id = "1_2_1141", category = "西方奇幻") =>
  `<div class="muye-rank-menu"><a href="/rank/${rank_id}">${category}</a></div>` +
  '<div class="book-cover"><img class="book-cover-img" src="/placeholder.png"></div>' +
  '<script>window.__INITIAL_STATE__={"rank":{"serverRendered":true,"book_list":' + JSON.stringify(books) + ',"readRankList":undefined}};</script>';
const fanqie_books = [
  { bookId: "9007199254740993", bookName: "诡异，靠灾登顶", currentPos: 1, read_count: "615435", thumbUri: "//p3-reading-sign.fqnovelpic.com/cover.jpg?sign=a&expires=123" },
  { bookId: "7143038691944959011", bookName: "书名 &amp; 标题", currentPos: 2 },
  { bookId: "9007199254740993", bookName: "重复", currentPos: 3, read_count: "1000" },
];
const fanqie_body = fanqie_page(fanqie_books);
const qimao_row = (id, title, rank, heat = "", unit = "") => `<li class="rank-list-item">
  <div class="pic"><img src="//cdn.qimao.com/bookimg/${id}.jpg"></div>
  <span class="rank-number">${rank}</span><a class="s-book-title" href="/shuku/${id}/">${title}</a>
  <span class="rank-change-num"><em class="rank-num">${heat}</em><em class="rank-unit">${unit}</em></span></li>`;
const qimao_body = '<ul class="rank-list">' +
  qimao_row("195958", "测试 <b>小说</b>", "1", "117.8", "万") +
  qimao_row("123", "未知排名", "") + qimao_row("195958", "重复", "3") + "</ul>";

const sources = {};
for (const name of ["qidian", "qdmm", "fanqienovel", "qimao"]) {
  const source = read_script(`hot/${name}.js`);
  const compiled = await compile_script_module(source);
  assert.equal(compiled.error, "", name);
  assert.equal(compiled.metadata.script_type, "hot");
  assert.equal(compiled.metadata.category, "小说");
  assert.ok(Number.isSafeInteger(compiled.metadata.order));
  sources[name] = { source, metadata: compiled.metadata };
}

function route_metadata(name, params = {}) {
  const metadata = sources[name].metadata;
  if (!["qidian", "qdmm"].includes(name)) return metadata;
  const path = "/" + name + "/" + (params.type || "yuepiao");
  const route = metadata.routes.find(route => route.path === path);
  assert.ok(route, path);
  return { ...metadata, ...route };
}

function cookie_access(name, cookies = []) {
  const permissions = sources[name].metadata.permissions;
  return permissions.cookies.length ? new ScriptCookieAccess({ permissions, cookies: () => cookies, assert_grant: () => {} }) : null;
}

async function run(t, name, body, params = {}, query = {}, cookies = []) {
  t.after(() => { globalThis.fetch = original_fetch; });
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return new Response(body);
  };
  const tcp = name === "qimao" ? mock_tcp_http(t) : null;
  const { source } = sources[name];
  const metadata = route_metadata(name, params);
  const result = await execute_script(source, metadata, null, undefined, [], `({params:${JSON.stringify(params)},query:${JSON.stringify(query)}})`, cookie_access(name, cookies));
  const snapshot = JSON.parse(result.output);
  assert.equal(snapshot.category, "小说");
  return { snapshot, requests: tcp ? tcp.requests.map(row => ({ url: row.url, options: { method: row.method, headers: row.headers, body: row.body } })) : requests };
}

test("起点热榜保留书籍大整数 ID、原排名、月票与去重，按排名输出", async t => {
  const { snapshot, requests } = await run(t, "qidian", qidian_body);
  assert.equal(snapshot.kind, "hot_rank");
  assert.equal(snapshot.title, "起点 · 月票榜");
  assert.deepEqual(snapshot.entries.map(row => row.rank), [1, 2]);
  const entry = snapshot.entries[1];
  assert.equal(entry.id, "qidian:book:9007199254740993");
  assert.equal(entry.link, "https://m.qidian.com/book/9007199254740993/");
  assert.equal(entry.thumbnail, "https://bookcover.yuewen.com/qdbimg/349573/9007199254740993/180");
  assert.equal(entry.title, "测试 & 小说");
  assert.deepEqual(entry.heat, { value: 111000, text: "11.1万月票", unit: "月票" });
  assert.equal(snapshot.entries[0].heat.value, 1234);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://m.qidian.com/rank/yuepiao/");
  const headers = new Headers(requests[0].options.headers);
  assert.match(headers.get("User-Agent"), /iPhone/);
  assert.equal(headers.get("Referer"), "https://m.qidian.com/");
  assert.ok(Number.isFinite(Date.parse(snapshot.observed_at)));
  assert.equal("items" in snapshot, false);
});

test("起点遇到无内嵌 JSON 的跳转页时去掉 Referer 重试", async t => {
  t.after(() => { globalThis.fetch = original_fetch; });
  const requests = [];
  const redirect =
    '<script>try{var t=new URL("https://www.qidian.com/rank/yuepiao/");' +
    'location.replace(t.toString())}catch(e){location.replace("https://www.qidian.com/rank/yuepiao/")}</script>';
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return new Response(requests.length === 1 ? redirect : qidian_body);
  };
  const result = await execute_script(
    sources.qidian.source,
    route_metadata("qidian"),
    null,
    undefined,
    [],
    "({params:{},query:{}})",
    null,
  );
  const snapshot = JSON.parse(result.output);
  assert.equal(snapshot.entries.length, 2);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].url, "https://m.qidian.com/rank/yuepiao/");
  assert.equal(new Headers(requests[0].options.headers).get("Referer"), "https://m.qidian.com/");
  assert.equal(new Headers(requests[1].options.headers).get("Referer"), null);
});

test("起点畅销榜不补造上游未提供的热度和排名", async t => {
  const { snapshot, requests } = await run(t, "qidian", qidian_page([{ bid: "123", bName: "畅销小说" }]), { type: "hotsales" });
  assert.equal(snapshot.title, "起点 · 畅销榜");
  assert.equal(snapshot.entries[0].rank, null);
  assert.deepEqual(snapshot.entries[0].heat, { value: null, text: "", unit: "热度" });
  assert.equal(requests[0].url, "https://m.qidian.com/rank/hotsales/");
});

test("起点男频 9 榜与独立起点女生网 8 榜使用站点路由并保留来源、书籍 ID 和名称", async t => {
  assert.deepEqual(Object.values(catalog.qidian).map(rows => rows.length), [9, 8]);
  assert.equal(sources.qidian.metadata.routes.length, 9);
  assert.equal(sources.qdmm.metadata.routes.length, 8);
  assert.equal(sources.qidian.metadata.platform.name, "起点");
  assert.equal(sources.qdmm.metadata.platform.name, "起点女生网");
  const routes = [...sources.qidian.metadata.routes, ...sources.qdmm.metadata.routes];
  assert.deepEqual(routes.map(route => route.path), Object.entries(catalog.qidian).flatMap(([gender, rows]) =>
    rows.map(({ type }) => (gender === "female" ? "/qdmm/" : "/qidian/") + type)));
  assert.ok(routes.every(route => !route.path.includes(":") && route.example === route.path));
  for (const route of routes) assert.deepEqual(Object.keys(route.parameters).sort(), ["category", "period"]);
  for (const path of ["/qidian/unknown", "/qidian/free", "/qdmm/sign", "/qidian/yuepiao/unknown", "/qdmm/yuepiao/female"]) {
    assert.ok(routes.every(route => !RssRoutePatternModel(route.path).match(path)), path);
  }
  for (const [gender, rows] of Object.entries(catalog.qidian)) {
    const name = gender === "female" ? "qdmm" : "qidian";
    for (const { type, title } of rows) {
      const route = route_metadata(name, { type });
      assert.equal(route.name, "起点 · " + (gender === "female" ? "女频" : "") + title);
      assert.ok(RssRoutePatternModel(route.path).match(route.example));
      const { snapshot, requests } = await run(t, name, gender === "female" ? qdmm_body : qidian_body, { type });
      assert.equal(snapshot.title, "起点 · " + (gender === "female" ? "女频" : "") + title);
      const home = gender === "female" ? "https://www.qdmm.com" : "https://m.qidian.com";
      assert.equal(route.url, new URL(home).hostname);
      const page_path = gender === "female"
        ? (type === "free" ? "/free/" : "/rank/" + ({ rec: "recom", update: "vipup" }[type] || type) + "/")
        : "/rank/" + type + "/";
      assert.equal(requests[0].url, home + page_path);
      assert.equal(new Headers(requests[0].options.headers).get("Referer"), home + "/");
      assert.equal(snapshot.entries.length, 2);
      assert.ok(snapshot.entries.every(row => row.link.startsWith(home + "/book/")));
      assert.ok(snapshot.entries.every(row => row.thumbnail));
      assert.ok(snapshot.entries.every(row => row.id.startsWith("qidian:book:")));
    }
  }
});

test("起点固定路由的榜单及频道不会被请求参数覆盖", async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://www.qdmm.com/free/");
    // 起点女生网对不含 */* 的 Accept 返回 406。
    assert.match(new Headers(options.headers).get("Accept"), /\*\/\*/);
    return new Response(qdmm_body);
  };
  const metadata = route_metadata("qdmm", { type: "free" });
  const result = await execute_script(sources.qdmm.source, metadata, null, undefined, [],
    '({params:{type:"../book",gender:"male"},query:{type:"hotsales",gender:"unknown"}})', cookie_access("qdmm"));
  assert.equal(JSON.parse(result.output).title, "起点 · 女频免费榜");
});

test("起点分类、月票历史月份、推荐周月总榜和书友周月榜使用官方筛选地址", async t => {
  for (const [type, query, qidian_suffix, qdmm_suffix] of [
    ["yuepiao", { category: "21", period: "202609" }, "catid21/202609/", "chanId21/year2026-month09/"],
    ["hotsales", { category: "4" }, "catid4/", "chanId4/"],
    ["rec", { period: "week" }, "catid-1/3/", "dateType1/"],
    ["rec", { period: "month" }, "catid-1/2/", "dateType2/"],
    ["rec", { category: "22", period: "all" }, "catid22/1/", "chanId22/dateType3/"],
    ["newfans", { period: "week" }, "catid-1/3/", "dateType1/"],
    ["newfans", { period: "month" }, "catid-1/2/", "dateType2/"],
  ]) {
    const qidian = await run(t, "qidian", qidian_body, { type }, query);
    assert.equal(qidian.requests[0].url, "https://m.qidian.com/rank/" + type + "/" + qidian_suffix);
    const qdmm = await run(t, "qdmm", qdmm_body, { type }, query);
    assert.equal(qdmm.requests[0].url, "https://www.qdmm.com/rank/" + ({ rec: "recom" }[type] || type) + "/" + qdmm_suffix);
  }
  for (const [type, value, unit] of [["newfans", "900", "书友"], ["rec", "1.1万推荐", "推荐"], ["update", "0月更字", "更新字数"]]) {
    const { snapshot } = await run(t, "qidian", qidian_page([{ bid: "123", bName: "小说", rankNum: 1, rankCnt: value }]), { type });
    assert.equal(snapshot.entries[0].heat.unit, unit);
    assert.equal(snapshot.entries[0].heat.value, type === "update" ? 0 : type === "rec" ? 11000 : Number(value));
  }
  const { snapshot } = await run(t, "qdmm", qdmm_page([{ bid: "123", bName: "小说", heat: "1.1万", unit: "收藏" }]), { type: "collect" });
  assert.deepEqual(snapshot.entries[0].heat, { value: 11000, unit: "收藏", text: "1.1万收藏" });
  const obfuscated = await run(t, "qdmm", qdmm_page([{ bid: "123", bName: "小说", heat: "\uE000\uE001", unit: "月票" }]), { type: "yuepiao" });
  assert.deepEqual(obfuscated.snapshot.entries[0].heat, { value: null, unit: "月票", text: "" });
});

test("番茄热榜沿用 RSS 字体映射解码标题，保留在读数、稳定 ID 并去重", async t => {
  const { snapshot, requests } = await run(t, "fanqienovel", fanqie_body);
  assert.equal(snapshot.title, "番茄小说 · 男频阅读榜 · 西方奇幻");
  assert.equal(snapshot.entries.length, 2);
  assert.equal(snapshot.entries[0].title, "人在诡异，靠第四天灾登顶至高");
  assert.equal(snapshot.entries[0].id, "fanqienovel:book:9007199254740993");
  assert.equal(snapshot.entries[0].link, "https://fanqienovel.com/page/9007199254740993");
  assert.deepEqual(snapshot.entries[0].heat, { value: 615435, unit: "在读", text: "615435" });
  assert.equal(snapshot.entries[0].thumbnail, "https://p3-reading-sign.fqnovelpic.com/cover.jpg?sign=a&expires=123");
  assert.equal("thumbnail" in snapshot.entries[1], false);
  assert.equal(snapshot.entries[1].title, "书名 & 标题");
  assert.equal(snapshot.entries[1].heat.value, null);
  assert.deepEqual(snapshot.entries.map(row => row.rank), [1, 2]);
  assert.equal(requests[0].url, "https://fanqienovel.com/rank/1_2_1141");
});

test("番茄可使用官网女频新书分类榜标识", async t => {
  const body = fanqie_page([{ bookId: "123", bookName: "新书", currentPos: 1, read_count: "1.2亿" }], "0_1_1139", "古风世情");
  const { snapshot, requests } = await run(t, "fanqienovel", body, { rank_id: "0_1_1139" });
  assert.equal(snapshot.title, "番茄小说 · 女频新书榜 · 古风世情");
  assert.equal(snapshot.entries[0].heat.value, 120000000);
  assert.equal(requests[0].url, "https://fanqienovel.com/rank/0_1_1139");
});

test("番茄支持官网全部 74 个男女频阅读榜和新书榜分类入口", async t => {
  assert.equal(catalog.fanqienovel.length, 74);
  for (const { id, category } of catalog.fanqienovel) {
    const { snapshot, requests } = await run(t, "fanqienovel", fanqie_page(fanqie_books, id, category), { rank_id: id });
    assert.equal(snapshot.title, "番茄小说 · " + (id[0] === "1" ? "男频" : "女频") + (id[2] === "2" ? "阅读榜" : "新书榜") + " · " + category);
    assert.equal(requests[0].url, "https://fanqienovel.com/rank/" + id);
    assert.ok(snapshot.entries[0].thumbnail);
  }
});

test("番茄巅峰榜读取官网完整列表、保留封面和顺序，不补造排名或得分", async t => {
  const books = [
    { book_id: "9007199254740993", book_name: "榜单第一本", thumb_url: "//cdn.example/peak.jpg", rank_score: "" },
    { book_id: "123", book_name: "得分更高的一本", rank_score: "98.5" },
  ];
  const { snapshot, requests } = await run(t, "fanqienovel", JSON.stringify({ code: 0, book_list: books }), { rank_id: "peak" });
  assert.equal(snapshot.title, "番茄小说 · 巅峰榜");
  assert.equal(snapshot.link, "https://fanqienovel.com/");
  assert.deepEqual(snapshot.entries.map(row => row.id), ["fanqienovel:book:9007199254740993", "fanqienovel:book:123"]);
  assert.ok(snapshot.entries.every(row => row.rank === null));
  assert.equal(snapshot.entries[0].thumbnail, "https://cdn.example/peak.jpg");
  assert.deepEqual(snapshot.entries[0].heat, { value: null, unit: "综合得分", text: "" });
  assert.equal(snapshot.entries[1].heat.value, 98.5);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://fanqienovel.com/api/author/misc/top_book_list/v1/?limit=200&offset=0");
  for (const body of ['{"code":1,"book_list":[]}', '{"code":0}', '{"code":0,"book_list":[]}', "<html>验证</html>"]) {
    await assert.rejects(run(t, "fanqienovel", body, { rank_id: "peak" }), error => error.problem.code === "UPSTREAM_INVALID_RESPONSE");
  }
});

test("七猫默认大热榜、女频新书榜和完结榜使用官方日榜地址", async t => {
  for (const [params, path, title] of [
    [{}, "boy/hot", "男频大热榜"],
    [{ gender: "girl", type: "new" }, "girl/new", "女频新书榜"],
    [{ gender: "boy", type: "over" }, "boy/over", "男频完结榜"],
  ]) {
    const { snapshot, requests } = await run(t, "qimao", qimao_body, params);
    assert.equal(snapshot.title, "七猫小说 · " + title);
    assert.equal(snapshot.entries.length, 2);
    assert.equal(snapshot.entries[0].title, "测试 小说");
    assert.equal(snapshot.entries[0].id, "qimao:book:195958");
    assert.equal(snapshot.entries[0].link, "https://www.qimao.com/shuku/195958/");
    assert.equal(snapshot.entries[0].thumbnail, "https://cdn.qimao.com/bookimg/195958.jpg");
    assert.deepEqual(snapshot.entries[0].heat, { value: 1178000, text: "117.8万", unit: "热度" });
    assert.equal(snapshot.entries[1].rank, null);
    assert.equal(snapshot.entries[1].heat.value, null);
    assert.equal(requests[0].url, "https://www.qimao.com/paihang/" + path + "/date/");
  }
});

test("七猫覆盖男女频全部 5 类榜单、日/月周期共 16 个入口，收藏和更新数未知时留空", async t => {
  let count = 0;
  for (const gender of ["boy", "girl"]) {
    for (const { type, title, periods } of catalog.qimao) {
      for (const period of periods) {
        const body = ["collect", "update"].includes(type) ? qimao_body.replace(/<em class="rank-num">.*?<\/em>/g, "").replace(/<em class="rank-unit">.*?<\/em>/g, "") : qimao_body;
        const { snapshot, requests } = await run(t, "qimao", body, { gender, type, period });
        assert.equal(snapshot.title, "七猫小说 · " + (gender === "boy" ? "男频" : "女频") + title + (period === "month" ? " · 月榜" : ""));
        assert.equal(requests[0].url, `https://www.qimao.com/paihang/${gender}/${type}/${period}/`);
        if (["collect", "update"].includes(type)) assert.deepEqual(snapshot.entries[0].heat, { value: null, text: "", unit: type === "collect" ? "收藏" : "更新字数" });
        assert.ok(snapshot.entries[0].thumbnail);
        count++;
      }
    }
  }
  assert.equal(count, 16);
});

test("七猫只携带授权的验证 Cookie，不输出凭据，缺少授权时拒绝执行", async t => {
  const permission = sources.qimao.metadata.permissions.cookies[0];
  assert.equal(permission.origin, "https://www.qimao.com");
  assert.equal(permission.path_prefix, "/paihang/");
  assert.deepEqual(permission.names, ["acw_sc__v2", "acw_sc__v3", "acw_tc"]);
  const cookies = ["acw_tc", "acw_sc__v2", "acw_sc__v3", "session"].map(name => ({
    name, value: "private-" + name, domain: ".qimao.com", path: "/", secure: true,
  }));
  const { requests, snapshot } = await run(t, "qimao", qimao_body, {}, {}, cookies);
  assert.equal(new Headers(requests[0].options.headers).get("Cookie"), "acw_tc=private-acw_tc; acw_sc__v2=private-acw_sc__v2; acw_sc__v3=private-acw_sc__v3");
  assert.doesNotMatch(JSON.stringify(snapshot), /private-/);
  const { source, metadata } = sources.qimao;
  await assert.rejects(execute_script(source, metadata), /Cookie 权限/);
  assert.equal(requests.length, 1);
});

test("七猫同步数据缺少授权名称时匿名重试，不因 Cookie 不可用失败", async t => {
  t.after(() => { globalThis.fetch = original_fetch; });
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return new Response(qimao_body);
  };
  mock_tcp_http(t);
  const access = new WorkerCookieAccess({
    permissions: sources.qimao.metadata.permissions, assert_grant() {}, cookies: () => [],
  });
  const result = await execute_script(sources.qimao.source, sources.qimao.metadata, null, undefined, [], "({params:{},query:{}})", access);
  const snapshot = JSON.parse(result.output);
  assert.equal(snapshot.entries.length, 2);
  assert.equal(requests.length, 1);
  assert.equal(new Headers(requests[0].options.headers).get("cookie"), null);
});

test("起点女生网识别访问验证页并提示同步 Cookie", async t => {
  await assert.rejects(run(t, "qdmm", '<html><script src="/C2WF/probev3.js"></script><title>访问验证</title></html>'), error => {
    assert.equal(error.problem.code, "UPSTREAM_INVALID_RESPONSE");
    assert.match(error.message, /访问验证页.*Cookie/);
    return true;
  });
});

test("七猫识别 HTTP 200 的阿里云验证页并提示更新验证 Cookie", async t => {
  for (const body of [
    '<!doctype html><meta name="aliyun_waf_aa" content="challenge"><title></title>',
    '<html><script src="https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js"></script></html>',
    '<html><title>滑动验证页面</title></html>',
  ]) {
    await assert.rejects(run(t, "qimao", body), error => {
      assert.equal(error.problem.code, "UPSTREAM_INVALID_RESPONSE");
      assert.match(error.message, /七猫返回访问验证页.*同步.*Cookie/);
      assert.doesNotMatch(error.message, /页面缺少内容列表/);
      return true;
    });
  }
});

test("小说榜单拒绝验证码、空列表、损坏数据、无效链接与未知字体编码", async t => {
  for (const [name, body] of [
    ...Object.keys(sources).map(name => [name, "<html>请完成验证</html>"]),
    ["qidian", qidian_page([])],
    ["qidian", qidian_page([{ bid: 9007199254740992, bName: "ID 精度已丢失" }])],
    ["qidian", qidian_body.replace('"rankNum":2', '"rankNum":0')],
    ["qidian", qidian_body.replace('"records":[', '"records":{')],
    ["qidian", qidian_body.replace('"pageData":{', '"pageData":{"gender":"female",')],
    ["qdmm", qdmm_page([])],
    ["qdmm", qdmm_page([{ bid: "bad", bName: "小说" }])],
    ["qdmm", qdmm_body.replace("//www.qdmm.com/book/1036526469/", "javascript:alert(1)")],
    ["qdmm", qdmm_body.replace("//bookcover.yuewen.com/qdbimg/349573/1036526469/150.webp", "data:image/png,bad")],
    ["fanqienovel", fanqie_body.replace('"bookId":"9007199254740993"', '"bookId":"bad"')],
    ["fanqienovel", fanqie_body.replace("诡异", "\uE000未知编码")],
    ["fanqienovel", fanqie_body.replace("/rank/1_2_1141", "/rank/0_1_1139")],
    ["fanqienovel", fanqie_page([])],
    ["fanqienovel", fanqie_page([{ ...fanqie_books[0], thumbUri: "javascript:alert(1)" }])],
    ["qimao", qimao_body.replace("/shuku/195958/", "javascript:alert(1)")],
    ["qimao", qimao_body.replace("测试 <b>小说</b>", "")],
    ["qimao", qimao_body.replace("//cdn.qimao.com/bookimg/195958.jpg", "data:image/png,bad")],
  ]) {
    await assert.rejects(run(t, name, body), error => {
      assert.equal(error.problem.code, "UPSTREAM_INVALID_RESPONSE", name);
      return true;
    });
  }
});

test("小说榜单在请求前拒绝非法参数，并原样透传请求失败 Result", async () => {
  for (const [name, params, query = {}] of [
    ["qidian", {}, { category: "../21" }],
    ["qidian", {}, { period: "202613" }],
    ["qidian", { type: "hotsales" }, { period: "week" }],
    ["qidian", { type: "newfans" }, { period: "all" }],
    ["qdmm", {}, { category: "../21" }],
    ["qdmm", {}, { period: "202613" }],
    ["qdmm", { type: "free" }, { period: "week" }],
    ["qdmm", { type: "newfans" }, { period: "all" }],
    ["fanqienovel", { rank_id: "1_2_1141?redirect=evil" }],
    ["qimao", { gender: "unknown" }],
    ["qimao", { type: "unknown" }],
    ["qimao", { type: "collect", period: "month" }],
    ["qimao", { type: "update", period: "month" }],
    ["qimao", { period: "year" }],
  ]) {
    const { source } = sources[name];
    const metadata = route_metadata(name, params);
    const guarded = source + `\nconst target = typeof routes === "undefined" ? route : routes[${metadata.route_index}];
const handler = target.handler; target.handler = ctx => handler({ ...ctx, fetchText() { throw new Error("不应请求"); } });`;
    await assert.rejects(execute_script(guarded, metadata, null, undefined, [], `({params:${JSON.stringify(params)},query:${JSON.stringify(query)}})`, cookie_access(name)),
      error => error.problem.code === "INVALID_PARAMETER");
  }
  for (const [name, { source, metadata }] of Object.entries(sources)) {
    const failing = source + '\nconst target = typeof routes === "undefined" ? route : routes[0]; const handler = target.handler; target.handler = ctx => handler({ ...ctx, fetchText: async () => Result.Err("请求超时", "UPSTREAM_TIMEOUT") });';
    await assert.rejects(execute_script(failing, metadata, null, undefined, [], "", cookie_access(name)),
    error => error.problem.code === "UPSTREAM_TIMEOUT" && /请求超时/.test(error.message));
  }
  const { source, metadata } = sources.fanqienovel;
  const failing = source + '\nconst handler = route.handler; route.handler = ctx => handler({ ...ctx, fetchText: async () => Result.Err("请求超时", "UPSTREAM_TIMEOUT") });';
  await assert.rejects(execute_script(failing, metadata, null, undefined, [], '({params:{rank_id:"peak"}})'),
    error => error.problem.code === "UPSTREAM_TIMEOUT");
});
