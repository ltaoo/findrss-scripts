import assert from "node:assert/strict";
import test from "node:test";
import { read_script } from "./support/script_sources.js";
import { compile_script_module, execute_script } from "findrss-worker/server/infra/script_sandbox.js";

const source = read_script("hot/maoyan_hot.js");
const compiled = await compile_script_module(source);
assert.equal(compiled.error, "");
const route_path = "/maoyan/dashboard-ajax/movie";
const route = compiled.metadata.routes.find(item => item.path === route_path);
const api = "https://piaofang.maoyan.com/dashboard-ajax/movie";

function movie(movie_id, name, box, split_num, split_unit = "万") {
  return {
    box,
    boxRate: "18.8%",
    boxSplitUnit: split_num === undefined ? undefined : { num: split_num, unit: split_unit },
    movieInfo: { movieId: movie_id, movieName: name, releaseInfo: "上映34天" },
    showCount: 67818,
    splitBox: box,
  };
}

const body = {
  movieList: {
    list: [
      movie(1552906, "神探之痕迹", 54207965, "54.20"),
      movie(1552906, "神探之痕迹", 54207965, "54.20"),
      movie(1586199, "生化危机：爆发夜", 36630747, "36.63"),
      { ...movie(undefined, "无编号", 100, "0.00"), movieInfo: { movieName: "无编号" } },
      movie(1578266, "重生2", 2522663, undefined),
    ],
  },
};

async function run(response = body) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(typeof response === "string" ? response : JSON.stringify(response));
  };
  try {
    const result = await execute_script(source, { ...compiled.metadata, ...route }, null, {
      method: "GET", pathname: route_path, params: {}, query: {},
    });
    return { snapshot: JSON.parse(result.output), calls };
  } finally {
    globalThis.fetch = original;
  }
}

test("猫眼实时票房榜保留排名、去重并按上游顺序编号", async () => {
  const { snapshot, calls } = await run();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, api);
  assert.equal(new Headers(calls[0].options.headers).get("referer"), "https://piaofang.maoyan.com/dashboard");
  assert.equal(snapshot.title, "猫眼 · 实时票房榜");
  assert.equal(snapshot.link, "https://piaofang.maoyan.com/dashboard");
  assert.deepEqual(snapshot.entries.map(entry => entry.id), [
    "maoyan-realtime-boxoffice:1552906",
    "maoyan-realtime-boxoffice:1586199",
    "maoyan-realtime-boxoffice:1578266",
  ]);
  assert.deepEqual(snapshot.entries.map(entry => entry.rank), [1, 2, 3]);
  assert.equal(snapshot.entries[0].title, "神探之痕迹");
  assert.equal(snapshot.entries[0].link, "https://www.maoyan.com/films/1552906");
  assert.deepEqual(snapshot.entries[0].heat, { value: 542000, unit: "元", text: "54.20万" });
  assert.deepEqual(snapshot.entries[1].heat, { value: 366300, unit: "元", text: "36.63万" });
});

test("缺少票房明细时按分单位换算", async () => {
  const { snapshot } = await run();
  const entry = snapshot.entries.find(item => item.id === "maoyan-realtime-boxoffice:1578266");
  assert.deepEqual(entry.heat, { value: 25226.63, unit: "元", text: "2.52万" });
});

test("上游缺少榜单返回错误", async () => {
  await assert.rejects(run({ code: 403 }), error => error.problem?.code === "UPSTREAM_INVALID_RESPONSE");
});
