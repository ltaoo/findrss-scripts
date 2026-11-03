import assert from "node:assert/strict";
import test from "node:test";
import { read_script } from "./support/script_sources.js";
import { compile_script_module, execute_script } from "findrss-worker/server/infra/script_sandbox.js";

const source = read_script("hot/qqvideo_hot.js");
const compiled = await compile_script_module(source);
assert.equal(compiled.error, "");
const route_path = "/qqvideo/trpc.tencentvideohotlistdata.hotlistdata.DoSearchHotListHttp/getSearchHotListHttp";
const route = compiled.metadata.routes.find(item => item.path === route_path);
const api = "https://pbaccess.video.qq.com/trpc.tencentvideohotlistdata.hotlistdata.DoSearchHotListHttp/getSearchHotListHttp";

const body = {
  data: {
    Results: [{
      Result: {
        ListInfo: [
          { ID: "m1", Query: "漫长的季节", HotLevel: 123456, HzImgURL: "https://puui.qpic.cn/a.jpg" },
          { ID: "m1", Query: "漫长的季节", HotLevel: 123456, HzImgURL: "https://puui.qpic.cn/a.jpg" },
          { ID: "m2", Query: "三体", HotLevel: 9876, HzImgURL: "" },
        ],
      },
    }],
  },
};

async function run(query = {}, response = body) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(typeof response === "string" ? response : JSON.stringify(response));
  };
  try {
    const result = await execute_script(source, { ...compiled.metadata, ...route }, null, {
      method: "GET", pathname: route_path, params: {}, query,
    });
    return { snapshot: JSON.parse(result.output), calls };
  } finally {
    globalThis.fetch = original;
  }
}

test("原有腾讯视频热搜榜路由保留", () => {
  assert.ok(compiled.metadata.routes.some(item => item.name === "腾讯视频 · 热搜榜"));
});

test("腾讯视频频道热搜榜保留排名、热度与封面", async () => {
  const { snapshot, calls } = await run();
  assert.equal(calls.length, 1);
  const request = new URL(calls[0].url);
  assert.equal(request.origin + request.pathname, api);
  assert.equal(request.searchParams.get("ChannelID"), "2");
  assert.equal(request.searchParams.get("PageSize"), "20");
  assert.equal(request.searchParams.get("PageNum"), "0");
  assert.equal(request.searchParams.get("SceneID"), "2");
  assert.equal(new Headers(calls[0].options.headers).get("referer"), "https://v.qq.com/biu/ranks/");
  assert.equal(snapshot.title, "腾讯视频 · 电视剧热搜榜");
  assert.equal(snapshot.link, "https://v.qq.com/biu/ranks/");
  assert.equal(snapshot.entries.length, 2);
  assert.deepEqual(snapshot.entries.map(entry => entry.id), [
    "qqvideo-channel-hotsearch:m1",
    "qqvideo-channel-hotsearch:m2",
  ]);
  assert.deepEqual(snapshot.entries.map(entry => entry.rank), [1, 2]);
  assert.equal(snapshot.entries[0].title, "漫长的季节");
  assert.equal(snapshot.entries[0].link, "https://v.qq.com/x/cover/m1.html");
  assert.equal(snapshot.entries[0].thumbnail, "https://puui.qpic.cn/a.jpg");
  assert.deepEqual(snapshot.entries[0].heat, { value: 123456, unit: "热度", text: "123456" });
  assert.equal(snapshot.entries[1].thumbnail, undefined);
});

test("频道与条数参数切换榜单，非法参数不请求上游", async () => {
  const { snapshot, calls } = await run({ channel_id: "10", page_size: "30" });
  const request = new URL(calls[0].url);
  assert.equal(request.searchParams.get("ChannelID"), "10");
  assert.equal(request.searchParams.get("PageSize"), "30");
  assert.equal(snapshot.title, "腾讯视频 · 综艺热搜榜");
  await assert.rejects(run({ channel_id: "2;drop" }), error => error.problem?.code === "INVALID_PARAMETER");
  await assert.rejects(run({ page_size: "0" }), error => error.problem?.code === "INVALID_PARAMETER");
});
