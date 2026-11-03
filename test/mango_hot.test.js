import assert from "node:assert/strict";
import test from "node:test";
import { read_script } from "./support/script_sources.js";
import { compile_script_module, execute_script } from "findrss-worker/server/infra/script_sandbox.js";

const source = read_script("hot/mango_hot.js");
const compiled = await compile_script_module(source);
assert.equal(compiled.error, "");
const route_path = "/mango/pc/suggest/v1";
const route = compiled.metadata.routes.find(item => item.path === route_path);
const api = "https://mobileso.bz.mgtv.com/pc/suggest/v1?allowedRC=1&src=mgtv&_support=10000000";

function group(label, names) {
  return { label, data: names.map((name, i) => ({ icon: "", index: i + 1, name, rpt: "" })) };
}

const body = {
  msg: "",
  code: 200,
  data: {
    topList: [
      group("热门内容", ["后会友期", "玉簟秋", "后会友期"]),
      group("综艺", ["你好，星期六", "密室大逃脱 第八季"]),
    ],
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

test("芒果TV热搜榜默认读取热门内容分组并去重", async () => {
  const { snapshot, calls } = await run();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, api);
  assert.equal(new Headers(calls[0].options.headers).get("referer"), "https://so.mgtv.com/");
  assert.equal(snapshot.title, "芒果TV · 热搜榜");
  assert.equal(snapshot.link, "https://so.mgtv.com/");
  assert.equal(snapshot.entries.length, 2);
  assert.deepEqual(snapshot.entries.map(entry => entry.id), [
    "mango-hot-search:热门内容:后会友期",
    "mango-hot-search:热门内容:玉簟秋",
  ]);
  assert.deepEqual(snapshot.entries.map(entry => entry.rank), [1, 2]);
  assert.equal(snapshot.entries[0].title, "后会友期");
  assert.equal(snapshot.entries[0].link, "https://so.mgtv.com/so?k=" + encodeURIComponent("后会友期"));
  assert.deepEqual(snapshot.entries[0].heat, { value: null, unit: "热度", text: "" });
});

test("分组查询切换榜单并更新标题", async () => {
  const { snapshot } = await run({ label: "综艺" });
  assert.equal(snapshot.title, "芒果TV · 综艺热搜榜");
  assert.deepEqual(snapshot.entries.map(entry => entry.title), ["你好，星期六", "密室大逃脱 第八季"]);
  assert.deepEqual(snapshot.entries.map(entry => entry.rank), [1, 2]);
});

test("非法分组不请求上游，上游异常返回错误", async () => {
  await assert.rejects(run({ label: "纪录片" }), error => error.problem?.code === "INVALID_PARAMETER");
  await assert.rejects(run({}, { code: 500, msg: "系统异常" }), error =>
    error.problem?.code === "UPSTREAM_INVALID_RESPONSE" && /系统异常/.test(error.message));
});
