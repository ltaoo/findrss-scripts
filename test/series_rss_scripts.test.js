import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { read_script } from "./support/script_sources.js";
import { compile_script_module, execute_script } from "findrss-worker/server/infra/script_sandbox.js";
import { FeedModel } from "findrss-worker/server/domain/feed_format.js";
import { XMLValidator } from "fast-xml-parser";

const scripts = {};
for (const name of ["iqiyi", "vqq", "youku", "mgtv"]) {
  const source = read_script("rss/" + name + ".js");
  const compiled = await compile_script_module(source);
  assert.equal(compiled.error, "", name);
  scripts[name] = { source, metadata: compiled.metadata };
}
const ids = { iqiyi: { album_id: "3993682943621001" }, vqq: { cover_id: "mzc002001w361jz" }, youku: { show_id: "bcaa87c7834c46f99e7b" }, mgtv: { collection_id: "914227", video_id: "24771585" } };
async function run(name, params = ids[name], browser = null) {
  const { source, metadata } = scripts[name];
  const result = await execute_script(source, metadata, null, { method: "GET", pathname: metadata.routes[0].example, params, query: {} }, [], "", null, undefined, browser);
  return JSON.parse(result.output);
}
const invalid = error => error.problem?.code === "UPSTREAM_INVALID_RESPONSE";
const json = data => new Response(JSON.stringify(data));
function check_feed(feed, prefix, length) {
  assert.equal(feed.items.length, length);
  assert.equal(new Set(feed.items.map(item => item.id)).size, length);
  assert.ok(feed.items.every(item => item.id.startsWith(prefix) && item.link.startsWith("https://")));
  assert.ok(feed.items.every(item => !item.attachments?.length));
  for (const format of ["rss", "atom"]) assert.equal(XMLValidator.validate(FeedModel(feed).render(format)), true);
}

function iqiyi_row(order, id = String(1487716838906800 + order)) {
  const code = (BigInt(id) ^ 0x75706971676cn).toString(36);
  return { qipu_id: id, album_order: order, content_type: "1", title: "测试剧 第" + order + "集", subtitle: "剧情 & 更新", page_url: "https://www.iqiyi.com/v_" + code + ".html" };
}
function iqiyi_body(rows = [iqiyi_row(2), iqiyi_row(1), iqiyi_row(2), { ...iqiyi_row(3), content_type: "2" }]) {
  return { status_code: "0", data: { base_data: { qipu_id: ids.iqiyi.album_id, title: "测试剧", desc: "剧集简介", image_url: "https://pic0.iqiyipic.com/poster.jpg", total_episode: 2, update_info: { album_finish: true } }, template: { tabs: [{ blocks: [{ bk_id: "selector_bk", data: { feature_paged: { "1-30": { entity_id: ids.iqiyi.album_id, videos: rows } } } }] }] } } };
}

test("四个平台拒绝无效参数，不发请求", async t => {
  t.mock.method(globalThis, "fetch", () => assert.fail("invalid input must not fetch"));
  for (const name of Object.keys(scripts)) for (const value of [null, "", "../escape", "x?token=secret", 9007199254740992]) {
    const params = Object.fromEntries(Object.keys(ids[name]).map(key => [key, value]));
    await assert.rejects(run(name, params), error => error.problem?.code === "INVALID_PARAMETER");
  }
});

test("爱奇艺校验签名、去重、按集序倒序输出，不补造日期", async t => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const query = Object.fromEntries(new URL(url).searchParams);
    const sign = query.sign; delete query.sign;
    const expected = createHash("md5").update(Object.keys(query).sort().map(key => key + "=" + query[key]).join("&") + "&secret_key=howcuteitis").digest("hex").toUpperCase();
    assert.equal(sign, expected);
    assert.equal(query.entity_id, ids.iqiyi.album_id);
    assert.equal(new Headers(options.headers).get("referer"), "https://www.iqiyi.com/");
    return json(iqiyi_body());
  });
  const feed = await run("iqiyi");
  check_feed(feed, "iqiyi:episode:", 2);
  assert.equal(feed.title, "测试剧 · 剧集更新");
  assert.deepEqual(feed.items.map(item => item.title), ["测试剧 第2集", "测试剧 第1集"]);
  assert.ok(feed.items.every(item => item.published === undefined && item.updated === undefined));
});

test("爱奇艺专辑惰性目录通过正片入口展开", async t => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async url => {
    const parsed = new URL(url); calls.push(parsed.pathname);
    if (parsed.pathname.endsWith("entity_play_url")) return json({ data: { resolve_type: "album_episode", episode_id: iqiyi_row(1).qipu_id } });
    return json(iqiyi_body(parsed.searchParams.get("entity_id") === ids.iqiyi.album_id ? [] : undefined));
  });
  check_feed(await run("iqiyi"), "iqiyi:episode:", 2);
  assert.deepEqual(calls, ["/tvg/v2/lw/base_info", "/tvg/entity_play_url", "/tvg/v2/lw/base_info"]);
});

test("爱奇艺拒绝错剧、缺集、集序冲突和链接注入", async t => {
  for (const mutate of [
    body => body.data.base_data.qipu_id = "123",
    body => body.data.template.tabs[0].blocks[0].data = { videos: [iqiyi_row(2)] },
    body => body.data.template.tabs[0].blocks[0].data = { videos: [iqiyi_row(1), iqiyi_row(1, "1234567890")] },
    body => body.data.template.tabs[0].blocks[0].data = { videos: [{ ...iqiyi_row(1), page_url: "javascript:alert(1)" }] },
  ]) {
    const body = iqiyi_body(); mutate(body);
    t.mock.method(globalThis, "fetch", async () => json(body));
    await assert.rejects(run("iqiyi"), invalid);
  }
});

function vqq_row(order, extra = {}) {
  return { params: { vid: "video0000" + order, cid: ids.vqq.cover_id, title: String(order), play_title: "测试剧 第" + order + "集", is_trailer: "0", duration: "1200", image_url: "https://vpic-cover.puui.qpic.cn/cover.jpg", ...extra } };
}
function vqq_body(rows, params = {}) {
  return { ret: 0, data: { CardList: [
    { type: "pc_introduction", params: {}, children_list: { "0": { cards: [{ params: { "report.cid": ids.vqq.cover_id, title: "测试剧", cover_description: "剧集简介", new_pic_vt: "https://puui.qpic.cn/poster.jpg" } }] } } },
    { type: "pc_web_episode_list", params, children_list: { "0": { cards: rows } } },
  ] } };
}
test("腾讯逐页加载选集标签，过滤预告和先导片，验证 RSS/Atom", async t => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const body = JSON.parse(options.body); calls.push(body);
    assert.equal(body.page_params.cid, ids.vqq.cover_id);
    const first_context = "cid=" + ids.vqq.cover_id + "&episode_begin=1&episode_end=2";
    const second_context = "cid=" + ids.vqq.cover_id + "&episode_begin=3&episode_end=3";
    const params = { tabs: JSON.stringify([{ selected: calls.length === 1, page_context: first_context }, { selected: calls.length !== 1, page_context: second_context }]) };
    return json(calls.length === 1 ? vqq_body([vqq_row(1), vqq_row(2), vqq_row(9, { title: "先导片" }), vqq_row(3, { is_trailer: "1" }), vqq_row(4, { duration: undefined })], params) : vqq_body([vqq_row(2), vqq_row(3)], params));
  });
  const feed = await run("vqq");
  check_feed(feed, "vqq:episode:", 3);
  assert.equal(calls[1].page_params.page_id, "web_episode_list");
  assert.equal(calls[1].page_params.episode_begin, "3");
  assert.deepEqual(feed.items.map(item => item.title), ["测试剧 第3集", "测试剧 第2集", "测试剧 第1集"]);
});

test("腾讯拒绝分页不推进、错剧、缺集和畸形分页", async t => {
  for (const body of [
    vqq_body([vqq_row(1)], { tabs: JSON.stringify([{ selected: false, page_context: "episode_begin=2" }]) }),
    vqq_body([vqq_row(1, { cid: "another_show" })]),
    vqq_body([vqq_row(2)]),
    vqq_body([vqq_row(1)], { has_next: "true" }),
    vqq_body([vqq_row(1)], { tabs: "{}" }),
  ]) {
    t.mock.method(globalThis, "fetch", async () => json(body));
    await assert.rejects(run("vqq"), invalid);
  }
});

function youku_row(order, extra = {}) {
  return { title: "测试剧 第" + order + "集", stage: order, episodeInfo: { isZp: true }, videoType: "正片", action: { type: "JUMP_TO_VIDEO", value: "Xvideo000" + order, extra: { showId: ids.youku.show_id } }, img: "https://m.ykimg.com/cover.jpg", ...extra };
}
function youku_body(more = false, rows = [youku_row(2), youku_row(1), youku_row(2), youku_row(3, { videoType: "预告" })]) {
  return { pageMap: { extra: { showId: ids.youku.show_id, showName: "测试剧", episodeTotal: 2, episodeLast: 2, completed: true, showImgV: "https://m.ykimg.com/poster.jpg" } }, moduleList: [{ components: [{ type: 10013, more, itemList: rows }, { type: 20009, itemList: [{ type: 20010, desc: "剧集简介" }] }] }] };
}
function youku_page(body) {
  return JSON.stringify({ ret: ["SUCCESS::调用成功"], data: { "2019030100": { success: true, data: {
    type: 10001, data: { extra: body.pageMap?.extra }, nodes: body.moduleList.flatMap(module => module.components || []).map(({ type, more, itemList, ...data }) => ({
      type, more, data, nodes: itemList?.map(({ type = 10013, ...data }) => ({ type, data })),
    })),
  } } } });
}
const youku_initial = url => JSON.parse(JSON.parse(new URL(url).searchParams.get("data")).params).scene === "web_page";

test("优酷直接读取 MTOP 正片目录无需详情页或浏览器，保留封面、简介及官网链接", async t => {
  t.mock.method(globalThis, "fetch", async url => {
    assert.equal(new URL(url).hostname, "acs.youku.com", "不得访问被云 IP 拦截的详情页");
    assert.equal(youku_initial(url), true);
    return new Response(youku_page(youku_body()));
  });
  const feed = await run("youku", ids.youku, () => assert.fail("完整目录不需要浏览器"));
  check_feed(feed, "youku:episode:", 2);
  assert.equal(feed.image, "https://m.ykimg.com/poster.jpg");
  assert.equal(feed.description, "剧集简介");
  assert.equal(feed.items[0].link, "https://v.youku.com/v_show/id_Xvideo0002.html");
});

function youku_paged_body(count = 2, first_page = 1) {
  const body = youku_body(true, Array.from({ length: first_page }, (_, i) => youku_row(i + 1)));
  Object.assign(body.pageMap.extra, { episodeLast: count, episodeTotal: count });
  Object.assign(body.moduleList[0].components[0], {
    session: JSON.stringify({ trackInfo: { pvv_sid: ids.youku.show_id }, lastSubIndex: first_page, title: "选集" }),
    stageTabs: [{ itemStartStage: "1", itemEndStage: String(first_page), selected: true }, { itemStartStage: String(first_page + 1), itemEndStage: String(count), selected: null }],
  });
  return body;
}
function youku_mtop(rows = [youku_row(2)], extra = {}) {
  return { ret: ["SUCCESS::调用成功"], data: { "2019030100": { success: true, data: { type: 10013, more: true, nodes: rows.map(data => ({ data })), ...extra } } } };
}
function youku_token(status = "FAIL_SYS_TOKEN_EMPTY", token = "fresh") {
  const headers = new Headers();
  headers.append("Set-Cookie", "_m_h5_tk=" + token + "_9999999999999; Domain=.youku.com; Path=/; Secure; Expires=Wed, 01 Jan 2031 00:00:00 GMT");
  headers.append("Set-Cookie", "_m_h5_tk_enc=" + token + "-encoded; Domain=.youku.com; Path=/; Secure");
  return new Response(JSON.stringify({ ret: [status + "::令牌刷新"], data: {} }), { headers });
}

test("优酷首屏获取匿名令牌，解析嵌套组件，分页复用首屏令牌", async t => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(new URL(url).hostname, "acs.youku.com");
    if (++calls === 1) return youku_token();
    assert.equal(new Headers(options.headers).get("cookie"), "_m_h5_tk=fresh_9999999999999; _m_h5_tk_enc=fresh-encoded");
    const query = new URL(url).searchParams;
    assert.equal(query.get("sign"), createHash("md5").update("fresh&" + query.get("t") + "&24679788&" + query.get("data")).digest("hex"));
    if (!youku_initial(url)) return json(youku_mtop());
    const response = JSON.parse(youku_page(youku_paged_body()));
    const root = response.data["2019030100"].data;
    root.nodes = [{ type: 10001, nodes: root.nodes }];
    return json(response);
  });
  check_feed(await run("youku", ids.youku, () => assert.fail("不得调用浏览器")), "youku:episode:", 2);
  assert.equal(calls, 3);
});

test("优酷无需浏览器完成 100 期范围分页，自动获取令牌并签名，允许边界重叠", async t => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const parsed = new URL(url);
    if (youku_initial(url)) return new Response(youku_page(youku_paged_body(100, 60)));
    calls++;
    assert.equal(parsed.origin + parsed.pathname, "https://acs.youku.com/h5/mtop.youku.columbus.gateway.new.execute/1.0/");
    const query = parsed.searchParams, data = JSON.parse(query.get("data")), params = JSON.parse(data.params);
    const session = JSON.parse(params.nextSession), token = calls === 1 ? "" : "fresh";
    assert.equal(query.get("sign"), createHash("md5").update(token + "&" + query.get("t") + "&24679788&" + query.get("data")).digest("hex"));
    assert.equal(params.showId, ids.youku.show_id);
    assert.equal(params.scene, "component");
    assert.equal(session.itemStartStage, "61");
    assert.equal(session.itemEndStage, "100");
    assert.equal(session.trackInfo.pvv_sid, ids.youku.show_id);
    assert.equal(new Headers(options.headers).get("referer"), "https://v.youku.com/v_nextstage/id_" + ids.youku.show_id + ".html");
    assert.equal(new Headers(options.headers).get("user-agent"), JSON.parse(data.system_info).userAgent);
    assert.equal(new Headers(options.headers).get("cookie"), calls === 1 ? null : "_m_h5_tk=fresh_9999999999999; _m_h5_tk_enc=fresh-encoded");
    return calls === 1 ? youku_token() : json(youku_mtop([...Array.from({ length: 41 }, (_, i) => youku_row(i + 60)), youku_row(101, { videoType: "预告" })]));
  });
  const feed = await run("youku", ids.youku, () => assert.fail("HTTP 分页不得调用浏览器"));
  check_feed(feed, "youku:episode:", 100);
  assert.equal(feed.items[0].title, "测试剧 第100集");
  assert.equal(feed.items.at(-1).title, "测试剧 第1集");
  assert.equal(calls, 2);
});

test("优酷跨页复用匿名 Cookie，令牌过期替换旧值后重新签名，支持字符串数据", async t => {
  const body = youku_paged_body(3);
  body.moduleList[0].components[0].stageTabs = [1, 2, 3].map(stage => ({ itemStartStage: String(stage), itemEndStage: String(stage), selected: stage === 1 }));
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const parsed = new URL(url);
    if (youku_initial(url)) return new Response(youku_page(body));
    calls++;
    const token = calls === 1 ? "" : calls < 4 ? "fresh" : "renewed";
    const query = parsed.searchParams;
    assert.equal(query.get("sign"), createHash("md5").update(token + "&" + query.get("t") + "&24679788&" + query.get("data")).digest("hex"));
    if (calls === 1) return youku_token();
    if (calls === 3) return youku_token("FAIL_SYS_TOKEN_EXOIRED", "renewed");
    assert.equal(new Headers(options.headers).get("cookie"), "_m_h5_tk=" + token + "_9999999999999; _m_h5_tk_enc=" + token + "-encoded");
    const params = JSON.parse(JSON.parse(query.get("data")).params);
    const stage = Number(JSON.parse(params.nextSession).itemStartStage);
    const response = youku_mtop([youku_row(stage)]);
    response.data = JSON.stringify(response.data);
    return json(response);
  });
  check_feed(await run("youku"), "youku:episode:", 3);
  assert.equal(calls, 4);
});

test("优酷令牌重试有上限，其他 MTOP 拒绝不重试，错误不暴露上游私密信息", async t => {
  for (const [status, expected] of [["FAIL_SYS_TOKEN_EMPTY", 3], ["FAIL_SYS_TOKEN_EXPIRED", 3], ["FAIL_SYS_TOKEN_EXOIRED", 3], ["FAIL_SYS_USER_VALIDATE", 1]]) {
    let calls = 0;
    t.mock.method(globalThis, "fetch", async url => {
      if (youku_initial(url)) return new Response(youku_page(youku_paged_body()));
      calls++;
      return json({ ret: [status + "::private-upstream-detail"], data: {} });
    });
    await assert.rejects(run("youku"), error => invalid(error) && !error.message.includes("private-upstream-detail"));
    assert.equal(calls, expected);
  }
});

test("优酷拒绝错剧、集序冲突和缺集", async t => {
  for (const body of [
    { ...youku_body(), pageMap: { extra: { showId: "wrong" } } },
    youku_body(false, [youku_row(2)]),
    youku_body(false, [youku_row(1), youku_row(1, { action: { type: "JUMP_TO_VIDEO", value: "Xconflict" } })]),
  ]) {
    t.mock.method(globalThis, "fetch", async () => new Response(youku_page(body)));
    await assert.rejects(run("youku"), invalid);
  }
});

test("优酷拒绝畸形选集范围、分页参数和重复范围", async t => {
  for (const mutate of [
    selector => selector.session = "null",
    selector => selector.session = "[]",
    selector => selector.session = "x".repeat(65537),
    selector => selector.stageTabs = undefined,
    selector => selector.stageTabs[1].itemStartStage = "invalid",
    selector => selector.stageTabs[1].itemEndStage = "5001",
    selector => selector.stageTabs[1] = selector.stageTabs[0],
    selector => selector.stageTabs[1].selected = true,
  ]) {
    const body = youku_paged_body(); mutate(body.moduleList[0].components[0]);
    t.mock.method(globalThis, "fetch", async url => {
      assert.equal(youku_initial(url), true, "无效分页不得继续请求");
      return new Response(youku_page(body));
    });
    await assert.rejects(run("youku"), invalid);
  }
});

test("优酷分页拒绝重复首屏、错剧、缺集、集序冲突和畸形组件", async t => {
  for (const response of [
    youku_mtop([youku_row(1)]),
    youku_mtop([youku_row(2)], { data: { extra: { showId: "wrong" } } }),
    youku_mtop([youku_row(2, { action: { type: "JUMP_TO_VIDEO", value: "Xanother2", extra: { showId: "wrong" } } })]),
    youku_mtop([youku_row(3)]),
    youku_mtop([youku_row(1, { action: { type: "JUMP_TO_VIDEO", value: "Xconflict" } })]),
    youku_mtop([], { type: 10001, nodes: [{ type: 10013, nodes: [] }, { type: 10013, nodes: [] }] }),
    youku_mtop([], { nodes: null }),
    { ret: ["SUCCESS::ok"], data: { "2019030100": { success: false } } },
    { ret: [], data: {} },
    { ret: [null], data: {} },
    null,
  ]) {
    t.mock.method(globalThis, "fetch", async url => youku_initial(url)
      ? new Response(youku_page(youku_paged_body())) : json(response));
    await assert.rejects(run("youku"), invalid);
  }
});

test("优酷 HTTP 分页保留上游错误分类", async t => {
  for (const [status, code] of [[403, "UPSTREAM_ACCESS_DENIED"], [429, "UPSTREAM_RATE_LIMITED"], [504, "UPSTREAM_TIMEOUT"]]) {
    t.mock.method(globalThis, "fetch", async url => youku_initial(url)
      ? new Response(youku_page(youku_paged_body())) : new Response("unavailable", { status }));
    await assert.rejects(run("youku"), error => error.problem?.code === code);
  }
});

function mgtv_row(order, extra = {}) {
  return { video_id: String(24771580 + order), clip_id: ids.mgtv.collection_id, isIntact: "1", isnew: "0", t1: String(order), t2: "剧情简介", t3: "测试剧 第" + order + "集", t4: "2026-11-" + String(order + 1).padStart(2, "0"), url: "/b/914227/" + (24771580 + order) + ".html", img: "https://1img.hitv.com/cover.jpg", ...extra };
}
function mgtv_body(page = 1, rows = [mgtv_row(1), mgtv_row(2)]) {
  return { code: 200, data: { count: 3, total_page: 2, current_page: page, info: { title: "测试剧", desc: "每周更新" }, list: rows } };
}
test("芒果逐页读取已发布正片，过滤片花和未发布集，保留日期并按新到旧排列", async t => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async url => {
    const page = Number(new URL(url).searchParams.get("page")); calls.push(page);
    return json(mgtv_body(page, page === 1 ? [mgtv_row(1), mgtv_row(2), mgtv_row(9, { isIntact: "0" }), mgtv_row(4, { isnew: "2" })] : [mgtv_row(3)]));
  });
  const feed = await run("mgtv");
  check_feed(feed, "mgtv:episode:", 3);
  assert.deepEqual(calls, [1, 2]);
  assert.equal(feed.items[0].title, "测试剧 第3集");
  assert.equal(feed.items[0].published, "2026-11-03T16:00:00.000Z");
});

test("芒果拒绝错专辑、分页未推进、畸形分页和异常日期", async t => {
  for (const body of [
    mgtv_body(1, [mgtv_row(1, { clip_id: "123" })]),
    mgtv_body(1, [mgtv_row(1, { url: "https://evil.example/" })]),
    { code: 200, data: { ...mgtv_body().data, total_page: 101 } },
    { code: 200, data: { ...mgtv_body().data, total_page: 1 } },
    mgtv_body(1, [mgtv_row(1, { t4: "not-a-date" })]),
    mgtv_body(),
  ]) {
    t.mock.method(globalThis, "fetch", async () => json(body));
    await assert.rejects(run("mgtv"), invalid);
  }
});

test("四个平台保留 HTTP 错误分类，拒绝畸形响应", async t => {
  for (const name of Object.keys(scripts)) {
    for (const [status, code] of [[403, "UPSTREAM_ACCESS_DENIED"], [429, "UPSTREAM_RATE_LIMITED"], [504, "UPSTREAM_TIMEOUT"]]) {
      t.mock.method(globalThis, "fetch", async () => new Response("unavailable", { status }));
      await assert.rejects(run(name), error => error.problem?.code === code);
    }
    for (const body of ["null", "{}", "<html>请完成验证</html>"]) {
      t.mock.method(globalThis, "fetch", async () => new Response(body));
      await assert.rejects(run(name), invalid);
    }
  }
});
