import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { compile_script_module, execute_script } from "findrss-worker/server/infra/script_sandbox.js";
import { script_output } from "findrss-worker/server/lib/script_output.js";

const source = readFileSync(new URL("../rss/hongguo.js", import.meta.url), "utf8");
const compiled = await compile_script_module(source);
assert.equal(compiled.error, "");

const SITE = "https://hongguoduanju.com";
const public_origin = "https://feeds.example";
const SERIES = "7688352674999176254";
const VIDS = ["111111111111", "222222222222", "333333333333"];

const route = path => {
  const entry = compiled.metadata.routes.find(value => value.path === path);
  assert.ok(entry, path);
  return { ...compiled.metadata, ...entry, debug: true };
};

const html = data =>
  `<html><head><script>window._ROUTER_DATA = ${JSON.stringify(data)};</script></head></html>`;

const series_page = (series_id, vids, name = "测试 &amp; 剧") =>
  html({
    loaderData: {
      "detail_page": {
        isSuccess: true,
        seriesDetail: {
          episode_cnt: vids.length,
          accessible_episode_cnt: 1,
          series_id,
          series_name: name,
          series_cover: "https://p3-novel.byteimg.com/cover.jpg",
          series_intro: "剧集简介",
          tags: ["都市", "恋爱"],
          vid_list: vids,
        },
      },
    },
  });

const player_page = ({ series_id, vid, content_url }) =>
  `<html><head><script type="application/ld+json">${JSON.stringify({
    "@type": "VideoObject",
    url: `${SITE}/player/${series_id}/${vid}`,
    contentUrl: content_url,
  })}</script><script>window._ROUTER_DATA = ${JSON.stringify({
    loaderData: {
      "player_(series_id)/(vid)/page": {
        isSuccess: true,
        series_id,
        vid,
        publicVideoSeo: { available: true, itemId: vid, seriesId: series_id },
        seriesDetail: { series_id, series_name: "测试剧", vid_list: [vid] },
      },
    },
  })};</script></head></html>`;

function serve(t, handler) {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), options });
    return handler(new URL(url), options);
  };
  return requests;
}

const run_route = (path, params, query = {}) =>
  execute_script(source, route(path), null, {
    method: "GET",
    pathname: path,
    params,
    query,
    public_origin,
  }).then(result => JSON.parse(result.output));

test("分集订阅按集数倒序输出，条目绑定官网播放页与本地媒体代理", async t => {
  const requests = serve(t, url => {
    assert.equal(url.origin + url.pathname, `${SITE}/player/${SERIES}`);
    return new Response(series_page(SERIES, VIDS));
  });
  const feed = await run_route("/hongguo/series/:series_id", { series_id: SERIES });
  assert.equal(requests.length, 1);
  assert.equal(feed.kind, "rss");
  assert.equal(feed.title, "测试 & 剧");
  assert.equal(feed.items.length, 3);
  assert.equal(feed.items[0].title, "测试 & 剧 第3集");
  assert.equal(feed.items[0].id, `hongguo:${SERIES}:${VIDS[2]}`);
  assert.equal(feed.items[0].link, `${SITE}/player/${SERIES}/${VIDS[2]}`);
  assert.equal(feed.items[0].type, "video");
  assert.equal(feed.items[0].enclosure.url, `${public_origin}/hongguo/video/${SERIES}/${VIDS[2]}`);
  assert.equal(feed.items[0].enclosure.type, "video/mp4");
  assert.ok(feed.items[0].content.includes(VIDS[2]));
  assert.deepEqual(feed.items[0].categories, ["都市", "恋爱"]);
  assert.equal(feed.extra.view, "video");
  assert.equal(feed.extra.headers.referer, `${SITE}/`);
  assert.equal(feed.items[2].title, "测试 & 剧 第1集");
});

test("播放页缺少分集数据时回退详情页，非法剧集编号在出网前拒绝", async t => {
  const requests = serve(t, url => url.pathname === `/detail`
    ? new Response(series_page(SERIES, VIDS))
    : new Response("<html></html>"));
  const feed = await run_route("/hongguo/series/:series_id", { series_id: SERIES });
  assert.equal(requests.length, 2);
  assert.equal(requests[1].url, `${SITE}/detail?series_id=${SERIES}`);
  assert.equal(feed.items.length, 3);

  const failed = serve(t, () => assert.fail("非法参数不得出网"));
  await assert.rejects(
    run_route("/hongguo/series/:series_id", { series_id: "../x" }),
    error => error.problem?.code === "INVALID_PARAMETER",
  );
  assert.equal(failed.length, 0);
});

test("搜索保留剧集卡片、封面、发布时间与分类，过滤无效与重复结果", async t => {
  serve(t, url => {
    assert.equal(url.origin + url.pathname, `${SITE}/api/search/result`);
    assert.equal(url.searchParams.get("query"), "总裁");
    assert.equal(url.searchParams.get("page"), "2");
    return Response.json({
      searchList: [
        { name: "空数据", keyword: "无编号", video_data: {} },
        {
          name: "剧A",
          video_data: {
            series_id: "7688352674999176254",
            series_title: "剧A",
            series_cover: "https://p3-novel.byteimg.com/a.jpg",
            series_intro: "简介 A",
            create_time: "1700000000",
            category_list: [{ name: "都市" }, { name: "恋爱" }],
          },
        },
        { name: "重复", video_data: { series_id: "7688352674999176254", series_title: "剧A2" } },
        { name: "坏编号", video_data: { series_id: "abc", series_title: "坏" } },
        {
          name: "无封面",
          video_data: {
            series_id: "7688352674999176255",
            series_title: "剧B",
            series_cover: "http://insecure.example/b.jpg",
          },
        },
      ],
    });
  });
  const feed = await run_route("/hongguo/search/:keyword", { keyword: "总裁" }, { page: "2" });
  assert.equal(feed.items.length, 2);
  assert.equal(feed.items[0].title, "剧A");
  assert.equal(feed.items[0].link, `${SITE}/detail?series_id=7688352674999176254`);
  assert.equal(feed.items[0].image, "https://p3-novel.byteimg.com/a.jpg");
  assert.equal(feed.items[0].published, "2023-11-14T22:13:20.000Z");
  assert.deepEqual(feed.items[0].categories, ["都市", "恋爱"]);
  assert.equal(feed.items[1].image, undefined);
  assert.equal(feed.items[1].published, undefined);
});

test("播放路由只转发官网同集公开 MP4，并声明媒体代理请求头", async t => {
  const vid = VIDS[0];
  const content_url = `${SITE}/video/public/${vid}/360p.mp4`;
  serve(t, url => {
    assert.equal(url.origin + url.pathname, `${SITE}/player/${SERIES}/${vid}`);
    return new Response(player_page({ series_id: SERIES, vid, content_url }));
  });
  const route_entry = route("/hongguo/video/:series_id/:vid");
  assert.equal(route_entry.public, true);
  assert.deepEqual(route_entry.allowed_hosts, ["hongguoduanju.com"]);
  const result = await execute_script(source, route_entry, null, {
    method: "GET", pathname: "/hongguo/video", params: { series_id: SERIES, vid }, query: {},
  });
  const value = JSON.parse(result.output);
  assert.equal(value.kind, "video");
  assert.equal(value.url, content_url);
  assert.equal(value.headers.referer, `${SITE}/`);
  assert.match(value.headers["user-agent"], /Chrome\/122/);
  const output = script_output(route_entry, value);
  assert.equal(output.kind, "video");
  assert.equal(output.descriptor.url, content_url);
});

test("播放路由拒绝他集直链、非法域名与缺失播放地址", async t => {
  const vid = VIDS[0];
  for (const content_url of [
    `${SITE}/video/public/${VIDS[1]}/360p.mp4`,
    "https://evil.example/video/public/" + vid + "/360p.mp4",
    "http://hongguoduanju.com/video/public/" + vid + "/360p.mp4",
    "",
  ]) {
    serve(t, () => new Response(player_page({ series_id: SERIES, vid, content_url })));
    await assert.rejects(
      execute_script(source, route("/hongguo/video/:series_id/:vid"), null, {
        method: "GET", pathname: "/hongguo/video", params: { series_id: SERIES, vid }, query: {},
      }),
      error => error.problem?.code === "UPSTREAM_INVALID_RESPONSE",
      content_url,
    );
  }
  const failed = serve(t, () => assert.fail("非法参数不得出网"));
  await assert.rejects(
    execute_script(source, route("/hongguo/video/:series_id/:vid"), null, {
      method: "GET", pathname: "/hongguo/video", params: { series_id: SERIES, vid: "x" }, query: {},
    }),
    error => error.problem?.code === "INVALID_PARAMETER",
  );
  assert.equal(failed.length, 0);
});
