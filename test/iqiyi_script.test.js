import assert from "node:assert/strict";
import test from "node:test";
import { read_script } from "./support/script_sources.js";
import { compile_script_module, execute_script } from "findrss-worker/server/infra/script_sandbox.js";

const source = read_script("hot/iqiyi_hot.js");
const compiled = await compile_script_module(source);
assert.equal(compiled.error, "");
const rank_path = "/iqiyi/views_category/3.0/rank_list";
const rank_route = compiled.metadata.routes.find(route => route.path === rank_path);
const api = "https://cards.iqiyi.com/views_category/3.0/rank_list";

function rank_row(album_id, rank, title, heat, h5_url, image) {
  return {
    block_id: album_id,
    actions: { click_event: { data: { album_id } } },
    images: [{ url: image, marks: { lu_mark: { t: String(rank) } } }],
    metas: [
      { text: title },
      {},
      {},
      {},
      { meta_class: "b823_1_meta5", spans: [
        { content: "https://pic.example/heat.png", content_type: "1" },
        { content: heat, content_type: "0" },
      ] },
    ],
    other: { h5_url },
  };
}

const body = {
  code: 0,
  base: { page_name: "风云榜热播榜页面" },
  cards: [
    { id: "rule", blocks: [{ block_id: "-1", block_type: 23, buttons: [] }] },
    { id: "list", blocks: [
      rank_row("101", 1, "小城良方", "9,662", "https://m.iqiyi.com/v_one.html", "https://pic.example/one.webp"),
      rank_row("101", 1, "小城良方", "9,662", "https://m.iqiyi.com/v_one.html", "https://pic.example/one.webp"),
      rank_row("202", 2, "伟大的长征", "", "https://m.iqiyi.com/v_two.html", "https://pic.example/two.webp"),
    ] },
  ],
};

async function run(query = {}, response = body) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(typeof response === "string" ? response : JSON.stringify(response));
  };
  try {
    const result = await execute_script(source, { ...compiled.metadata, ...rank_route }, null, {
      method: "GET", pathname: rank_path, params: {}, query,
    });
    return { snapshot: JSON.parse(result.output), calls };
  } finally {
    globalThis.fetch = original;
  }
}

test("爱奇艺风云榜热播榜保留排名、热度和封面，并去重", async () => {
  const { snapshot, calls } = await run();
  assert.equal(calls.length, 1);
  const request = new URL(calls[0].url);
  assert.equal(request.origin + request.pathname, api);
  assert.equal(request.searchParams.get("category_id"), "-1");
  assert.equal(request.searchParams.get("page_st"), "1");
  assert.equal(request.searchParams.get("tag"), "0");
  assert.equal(new Headers(calls[0].options.headers).get("referer"), "https://m.iqiyi.com/ranklist.html");
  assert.equal(snapshot.title, "爱奇艺 · 风云榜热播榜");
  assert.equal(snapshot.link, "https://www.iqiyi.com/trending/");
  assert.equal(snapshot.entries.length, 2);
  assert.deepEqual(snapshot.entries.map(entry => entry.id), ["iqiyi-rank-list:101", "iqiyi-rank-list:202"]);
  assert.deepEqual(snapshot.entries.map(entry => entry.rank), [1, 2]);
  assert.equal(snapshot.entries[0].title, "小城良方");
  assert.equal(snapshot.entries[0].link, "https://www.iqiyi.com/v_one.html");
  assert.equal(snapshot.entries[0].thumbnail, "https://pic.example/one.webp");
  assert.deepEqual(snapshot.entries[0].heat, { value: 9662, unit: "热度", text: "9,662" });
  assert.deepEqual(snapshot.entries[1].heat, { value: null, unit: "热度", text: "" });
});

test("分类查询切换风云榜分类并更新标题", async () => {
  const { snapshot, calls } = await run({ category_id: "2" });
  assert.equal(new URL(calls[0].url).searchParams.get("category_id"), "2");
  assert.equal(snapshot.title, "爱奇艺 · 风云榜电视剧热播榜");
  assert.equal(snapshot.entries.length, 2);
});

test("非法分类不请求上游，上游安全校验失败返回错误", async () => {
  await assert.rejects(run({ category_id: "2;drop" }), error => error.problem?.code === "INVALID_PARAMETER");
  await assert.rejects(run({}, { code: "4", message: "安全校验不通过" }), error =>
    error.problem?.code === "UPSTREAM_INVALID_RESPONSE" && /安全校验不通过/.test(error.message));
});
