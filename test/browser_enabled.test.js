import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import puppeteer from "../.runtime/findrss-worker/node_modules/@cloudflare/puppeteer/lib/esm/puppeteer/puppeteer-cloudflare.js";
import { compile_script_module, execute_script } from "findrss-worker/server/infra/script_sandbox.js";
import worker from "../worker/index.js";

const fixtures = JSON.parse(readFileSync(new URL("./fixtures/script_migration.json", import.meta.url)));
const cases = [
  { path: "/avmoo/star/abc123", html: () => '<div class="avatar-box"><span class="pb-10">演员</span></div><div id="waterfall">没有影片</div>' },
  { path: "/javlibrary/star/abc123", html: () => '<div id="rightcolumn"><div class="boxtitle">演员的影片</div><div class="videothumblist">没有影片</div></div>' },
  ...["ttk", "69shuba"].map(file => {
    const fixture = fixtures.find(entry => entry.file === file);
    return { path: "/" + file + "/book/" + fixture.params.book_id,
      html: url => fixture.responses.find(response => url.includes(response.contains)).body };
  }),
];

test("四站仅在 BROWSER_ENABLED 为 true 时导航，关闭或未配置时保留 HTTP 错误", async t => {
  let current, launches = 0;
  t.mock.method(globalThis, "fetch", async () => new Response("<title>Just a moment...</title>", { status: 403 }));
  t.mock.method(puppeteer, "launch", async () => {
    launches++;
    let url;
    return { async newPage() { return {
      async setViewport() {}, async goto(value) { url = value; }, async waitForSelector() {},
      async evaluate(script) { if (typeof script === "function") return; return JSON.stringify({ html: current.html(url) }); },
    }; }, async close() {} };
  });
  for (current of cases) {
    for (const enabled of [undefined, false, "false", "TRUE", true, "true"]) {
      const before = launches;
      const env = { BROWSER: {}, BROWSER_ENABLED: enabled };
      const response = await worker.fetch(new Request("https://feeds.example/api/rss" + current.path), env);
      const value = await response.json();
      if (enabled === true || enabled === "true") {
        assert.equal(response.status, 200, JSON.stringify(value));
        assert.ok(launches > before);
        assert.ok(Array.isArray(value.items));
      } else {
        assert.equal(response.status, 502);
        assert.equal(value.code, "UPSTREAM_ACCESS_DENIED");
        assert.equal(launches, before);
      }
    }
  }
});

test("沙箱只接收只读浏览器开关，RSSScript.navigate 保留 Result 错误并拒绝空 HTML", async () => {
  const source = `import { RSSScript, Result } from "@findrss/core";
    class Probe extends RSSScript {
      async fetch(ctx) {
        const page = await Probe.navigate(ctx, "https://example.com/", { selector: "main" });
        if (page.error) return page;
        return Result.Ok({ id: "probe", title: "probe", link: "https://example.com/", items: [],
          extra: { env: ctx.env, frozen: Object.isFrozen(ctx.env), html: page.data } });
      }
    }
    const script = new Probe(); export const route = { path: "/probe", name: "probe", url: "example.com", example: "/probe", handler: ctx => script.run(ctx) };`;
  const compiled = await compile_script_module(source);
  assert.equal(compiled.error, "");
  const run = (enabled, navigate) => execute_script(source, compiled.metadata, null,
    { env: { BROWSER_ENABLED: enabled, ACCESS_TOKEN: "must-stay-private" }, params: {}, query: {} }, [], "", null, undefined, navigate);
  const feed = JSON.parse((await run(true, async (url, options) => {
    assert.equal(url, "https://example.com/");
    assert.deepEqual(options, { selector: "main" });
    return { html: "<main>rendered</main>" };
  })).output);
  assert.deepEqual(feed.extra, { env: { BROWSER_ENABLED: true }, frozen: true, html: "<main>rendered</main>" });
  await assert.rejects(run(false, () => assert.fail("浏览器关闭")), error => error.problem.code === "SOURCE_UNAVAILABLE");
  await assert.rejects(run(true, async () => ({ html: " " })), error => error.problem.code === "UPSTREAM_INVALID_RESPONSE");
  await assert.rejects(run(true, async () => { throw Object.assign(new Error("timeout"), { code: "UPSTREAM_TIMEOUT" }); }),
    error => error.problem.code === "UPSTREAM_TIMEOUT");
});
