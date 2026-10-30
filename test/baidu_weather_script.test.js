import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { read_script } from "./support/script_sources.js";
import worker from "../worker/index.js";
const { compile_script_module, execute_script } = await import("findrss-worker/server/infra/script_sandbox.js");

const source = read_script("clip/baidu_weather.js");
const compiled = await compile_script_module(source);
const fixture = await readFile(new URL("./fixtures/baidu_weather.html", import.meta.url), "utf8");
const cookie = JSON.parse(source.match(/const baidu_cookie = ("[^"]*");/)[1]);
const context = { method: "GET", pathname: "/baidu/s/weather/上海", params: { city: "上海" }, query: {} };
const run = async (params = context.params) => JSON.parse((await execute_script(source, compiled.metadata, null, { ...context, params })).output);
const page = value => "<!--s-data:" + JSON.stringify(value) + "--><div></div>";

test("百度天气 Clip 元数据完整，Cookie 保留在源码中，不进入公开元数据", () => {
  assert.equal(compiled.error, "");
  assert.equal(compiled.metadata.kind, "clip");
  assert.equal(compiled.metadata.version, "1.0.0");
  assert.equal(compiled.metadata.path, "/baidu/s/weather/:city?");
  assert.match(compiled.metadata.platform.icon, /^<svg/);
  assert.ok(cookie.includes("BDUSS=") && cookie.includes("BAIDUID="));
  assert.ok(cookie.length <= 4096);
  assert.doesNotMatch(JSON.stringify(compiled.metadata), /BDUSS=|COOKIE_SESSION=/);
});

test("通过真实 QuickJS 和宿主 fetchText 携带内置 Cookie，解析当前天气与选中日起三天预报", async t => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://www.baidu.com/s?ie=UTF-8&wd=%E4%B8%8A%E6%B5%B7%E5%A4%A9%E6%B0%94");
    assert.ok(new Headers(options.headers).get("cookie") === cookie, "内置 Cookie 未正确发送");
    assert.match(new Headers(options.headers).get("user-agent"), /Chrome\/148/);
    assert.equal(options.redirect, "manual");
    return new Response(fixture, { headers: { "Content-Type": "text/html;charset=utf-8" } });
  });
  const result = await run();
  assert.equal(result.kind, "clip");
  assert.equal(result.title, "上海天气");
  assert.match(result.link, /^https:\/\/www.baidu.com\/s\?/);
  assert.ok(Number.isFinite(Date.parse(result.captured_at)));
  assert.match(result.html, /data-n="current-temperature"[^>]*>28°</);
  assert.match(result.html, /data-n="apparent-value"[^>]*>30°</);
  assert.match(result.html, /70%/);
  assert.match(result.html, /东南风 3级/);
  assert.equal([...result.html.matchAll(/data-n="forecast-day"/g)].length, 3);
  for (const value of ["今天", "31°", "24°", "明天", "32°", "25°", "周五", "30°", "23°"]) assert.ok(result.html.includes(value), value);
  assert.doesNotMatch(result.html, /昨天|周六|BDUSS|BIDUPSID|recommendZhishu/);
  assert.match(result.html, /style="[^"]*display:grid/);
  for (const [, tag, attributes] of result.html.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/g)) {
    assert.match(attributes, /data-n="[a-z][a-z0-9-]*"/, tag);
  }
});

test("Worker 天气路由接收中文城市及省略城市，不依赖 BROWSER 或外部 Cookie 配置", async t => {
  const requested = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requested.push(new URL(url).searchParams.get("wd"));
    assert.ok(new Headers(options.headers).get("cookie") === cookie, "内置 Cookie 未正确发送");
    return new Response(fixture);
  });
  for (const suffix of ["/" + encodeURIComponent("上海"), ""]) {
    const response = await worker.fetch(new Request("https://scripts.example/api/clip/baidu/s/weather" + suffix), {});
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.title, "上海天气");
    assert.match(result.html, /28°/);
    assert.equal(response.headers.get("X-FindRSS-Script"), "clip/baidu_weather.js");
  }
  assert.deepEqual(requested, ["上海天气", "天气"]);
});

test("观测缺失时使用小时天气和当天预报，城市省略时按百度定位请求", async t => {
  t.mock.method(globalThis, "fetch", async url => {
    assert.equal(new URL(url).searchParams.get("wd"), "天气");
    return new Response(fixture.replace(/,"observe":\{[^}]*\}/, ""));
  });
  const result = await run({});
  assert.equal(result.title, "上海天气");
  assert.match(result.html, /data-n="current-temperature"[^>]*>29°</);
  assert.match(result.html, /data-n="current-condition"[^>]*>晴</);
  assert.match(result.html, /东风 3级|64%/);
});

test("兼容嵌套天气 JSON 字符串，零度和零湿度不被当成缺失", async t => {
  t.mock.method(globalThis, "fetch", async () => new Response(page({ data: JSON.stringify({ weather: {
    city: "哈尔滨", temperature: 0, weather: "小雪", apparentTemperature: -3, wind: "北风2级", humidity: 0,
  } }) })));
  const result = await run();
  assert.equal(result.title, "哈尔滨天气");
  assert.match(result.html, /data-n="current-temperature"[^>]*>0°</);
  assert.match(result.html, /data-n="humidity-value"[^>]*>0%</);
  assert.match(result.html, /-3°|小雪|暂无预报/);
});

test("上游字段按文本转义，不能向剪藏内容注入节点或事件", async t => {
  const hostile = '<img src=x onerror="alert(1)"><script>alert(1)</script>';
  t.mock.method(globalThis, "fetch", async () => new Response(page({ commonParams: { tpl: "weather_forecast_new_san" },
    curLoc: "上海", observe: { temperature: "28", weather: hostile }, selectedDayIndex: 0,
    dayForecastList: [{ word: hostile, date: "06/24", weather_day: "晴", temperature_day: "30", temperature_night: "20" }],
  })));
  const result = await run();
  assert.match(result.html, /&lt;img/);
  assert.doesNotMatch(result.html, /<img|<script|onerror="/);
});

test("城市无效时不发请求，验证码、空结果、HTTP 失败保留明确错误", async t => {
  t.mock.method(globalThis, "fetch", () => assert.fail("无效城市不得出网"));
  for (const city of ["x".repeat(41), "https://other.example/", "上海\n杭州", "<script>"]) {
    await assert.rejects(run({ city }), /城市名称无效/);
  }
  for (const body of ["<html>百度安全验证</html>", "<iframe src='https://wappass.baidu.com/static/captcha/tuxing_v2.html'>"]) {
    t.mock.method(globalThis, "fetch", async () => new Response(body));
    await assert.rejects(run(), /验证页面/);
  }
  for (const body of ["", "<html>普通搜索结果</html>", page({ city: "上海", text: "无有效天气数据" })]) {
    t.mock.method(globalThis, "fetch", async () => new Response(body));
    await assert.rejects(run(), /未找到天气数据/);
  }
  t.mock.method(globalThis, "fetch", async () => new Response("Unavailable", { status: 503 }));
  await assert.rejects(run(), /HTTP 503/);
});
