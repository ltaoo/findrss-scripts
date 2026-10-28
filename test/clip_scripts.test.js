import assert from "node:assert/strict";
import test from "node:test";
import { read_script, script_names } from "./support/script_sources.js";
const { compile_script_module, execute_script } = await import("findrss-worker/server/infra/script_sandbox.js");
import { ScriptModel } from "findrss-worker/server/domain/script.js";
import { ScriptDebugRequestModel } from "findrss-worker/server/domain/script_debug_request.js";

test("Clip 基类、分类推断、导出版本与参数、共享采集和错误透传", async () => {
  for (const name of script_names("clip")) {
    const script = read_script("clip/" + name), compiled = await compile_script_module(script);
    assert.equal(compiled.error, "");
    assert.equal(compiled.metadata.kind, "clip");
    assert.equal(ScriptModel.fromRow({ script }).kind, "clip");
  }
  const script = read_script("clip/github.js"), compiled = await compile_script_module(script);
  const context = { method: "GET", pathname: "/github/owner/repo/readme", params: { owner: "owner", repo: "repo" }, query: {} };
  const output = await execute_script(script, compiled.metadata, null, context, [], `({ clip: { capture(url, options) {
    if (url !== 'https://github.com/owner/repo' || options.selector !== 'article.markdown-body') throw new Error('参数丢失');
    return { html: '<article style="color:red">README</article>', stats: { width: 1280 } };
  } } })`);
  const value = JSON.parse(output.output);
  assert.equal(value.kind, "clip"); assert.equal(value.title, "owner/repo README"); assert.equal(value.stats.width, 1280);
  assert.ok(Number.isFinite(Date.parse(value.captured_at)));
  await assert.rejects(execute_script(script, compiled.metadata, null, context, [],
    `({ clip: { capture() { return Result.Err('上游失败', 'UPSTREAM_TIMEOUT'); } } })`), /上游失败/);
  await assert.rejects(execute_script(script, compiled.metadata, null, { ...context, params: { owner: "../evil", repo: "repo" } }), /无效的 GitHub/);
  const selected = ScriptDebugRequestModel({ request_url: "/api/clip/github/owner/repo/readme" }).resolve(compiled.metadata.routes);
  assert.equal(selected.ok, true); assert.deepEqual({ ...selected.context.params }, context.params);
});

const context = { method: "GET", pathname: "/web/region", params: {}, query: {} };

test("区域剪藏示例可编译并在 QuickJS 中调用 navigate mock，mock 失败保留错误", async () => {
  const clip_source = read_script("clip/website.js");
  const compiled = await compile_script_module(clip_source);
  assert.equal(compiled.error, "");
  const metadata = compiled.metadata;
  const clip_context = { ...context, query: { url: "https://example.com", selector: "#weather" } };
  for (const returned of ['({ ok: true, html: "<div style=\\"color:red\\">区域</div>", stats: { width: 320 } })',
    'Result.Ok({ ok: true, html: "<div style=\\"color:red\\">区域</div>", stats: { width: 320 } })']) {
    const result = await execute_script(clip_source, metadata, null, clip_context, [], `({ puppeteer: {
      navigate(url, options, evaluate) {
        if (url !== "https://example.com" || options.selector !== "#weather" || !String(evaluate).includes("getComputedStyle")) throw new Error("参数丢失");
        return ${returned};
      }
    } })`, null, undefined, () => assert.fail("mock 不能调用真实渲染器"));
    assert.match(JSON.parse(result.output).html, /color:red/);
  }
  await assert.rejects(execute_script(clip_source, metadata, null, clip_context, [],
    '({ puppeteer: { navigate() { return { ok: false, error: "选区不可见" }; } } })'), /选区不可见/);
  await assert.rejects(execute_script(clip_source, metadata, null, clip_context, [],
    '({ puppeteer: { navigate() { return Result.Err("渲染服务不可用"); } } })'), /渲染服务不可用/);
});

const input = { title: "天气卡片", url: "https://example.com/weather", selector: "#weather", enabled: false };
const snapshot = text => ({ html: `<div style="color:red!important">${text}<script>steal()</script></div>`, stats: { width: 320, height: 180, node: "div#weather", image_missing: 1 } });

test("通用 Clip 脚本通过共享采集器提取选区，稳定 ID、8MB 输出与取消信号透传", async () => {
  const source = read_script("clip/website.js");
  const record = { ...input, id: "stable", viewport_width: 1440, viewport_height: 900, wait_ms: 500 };
  const controller = new AbortController();
  const compiled = await compile_script_module(source);
  assert.equal(compiled.error, "");
  const context = { method: "GET", pathname: "/web/region", params: {}, query: record, clip_id: record.id };
  const run = async navigate => JSON.parse((await execute_script(source, compiled.metadata, null,
    context, [], "", null, controller.signal, navigate)).output);
  await assert.rejects(run(null), /BROWSER/);
  let args;
  const result = await run(async (...values) => {
    args = values;
    return { ...snapshot("渲染后的选区"), ok: true };
  });
  assert.match(result.html, /渲染后的选区/); assert.match(result.html, /color:red!important/);
  assert.equal(args[0], input.url);
  assert.deepEqual(args[1], { viewport: { width: 1440, height: 900 }, selector: input.selector,
    wait_ms: 500, args: [input.selector, { id_prefix: "stable" }] });
  assert.equal(typeof args[2], "string");
  assert.match(args[2], /getComputedStyle/);
  assert.equal(args[3], controller.signal);
  const large_html = "<div>" + "x".repeat(3 * 1024 * 1024) + "</div>";
  assert.equal((await run(async () => ({ ok: true, html: large_html }))).html, large_html);
  for (const value of [{ ok: false, error: "未找到页面节点" }, null]) {
    await assert.rejects(run(async () => value), /未找到页面节点|节点提取失败/);
  }
});
