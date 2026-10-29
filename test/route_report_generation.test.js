import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("巡检入口读取独立配置并支持 Secret 覆盖，聚合样本且失败仍保存报告", async t => {
  const root = await mkdtemp(join(tmpdir(), "findrss-report-generation-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await cp(new URL("../scripts/", import.meta.url), join(root, "scripts"), { recursive: true });
  await symlink(new URL("../node_modules/", import.meta.url), join(root, "node_modules"));
  await mkdir(join(root, "dist"));
  await mkdir(join(root, ".github"));
  await writeFile(join(root, ".github/route-checks.json"), JSON.stringify({
    "hot /api/hot/passed": [{ example: "/configured/one" }, { example: "/configured/two" }],
    "hot /api/hot/failed": [{ example: "/unused" }],
  }));
  await mkdir(join(root, "reports/icons"), { recursive: true });
  await writeFile(join(root, "reports/icons/stale.svg"), "old icon");
  await writeFile(join(root, "package.json"), '{"type":"module"}');
  const file = "hot/example.js";
  const icon = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z"/></svg>';
  await writeFile(join(root, "dist/scripts.js"), "export default " + JSON.stringify([
    { file, source: "private-source", metadata: { version: "2.3.4", platform: { name: "Example", icon }, config: "private-config" } },
  ]));
  await writeFile(join(root, "dist/routes.json"), JSON.stringify(["passed", "failed"].map(name => ({
    file, format: "hot", path: "/api/hot/" + name, example: "/api/hot/" + name, route_index: 0,
  }))));
  await writeFile(join(root, "fetch.js"), `globalThis.fetch = async url => url.pathname.endsWith("failed")
    ? new Response("Unavailable", { status: 503 })
    : !["/configured/one", "/configured/two"].includes(url.pathname) ? new Response("Unexpected request", { status: 400 })
    : Response.json({ kind: "hot_rank", title: "Example", link: "https://example.com", entries: [
      { id: "1", title: "Article", link: "https://example.com/1", rank: null, pinned: false, heat: { value: null, unit: "", text: "" } }
    ] }, { headers: { "X-FindRSS-Script": "hot/example.js", "X-FindRSS-Route": "0" } });`);
  assert.throws(() => execFileSync(process.execPath, ["--import", "./fetch.js", "scripts/check_routes.js"], {
    cwd: root, env: { ...process.env, CHECK_BASE_URL: "https://scripts.example", ROUTE_CHECK_CONFIG: ".github/route-checks.json",
      ROUTE_CHECK_CASES: JSON.stringify({ "hot /api/hot/failed": { example: "/configured/failed" } }), GITHUB_STEP_SUMMARY: "" },
    stdio: "pipe",
  }), error => error.status === 1);
  const report = JSON.parse(await readFile(join(root, "reports/routes.json"), "utf8"));
  assert.deepEqual([report.total, report.passed, report.failed], [2, 1, 1]);
  const passed = report.results.find(result => result.output_valid);
  assert.deepEqual(passed.samples.map(sample => sample.example), ["/configured/one", "/configured/two"]);
  assert.equal(report.results.find(result => !result.output_valid).example, "/configured/failed");
  assert.deepEqual(report.scripts, [{ file, version: "2.3.4", platform: { name: "Example", icon } }]);
  assert.deepEqual(await readdir(join(root, "reports/icons")), ["script-0.svg"]);
  assert.equal(await readFile(join(root, "reports/icons/script-0.svg"), "utf8"), icon);
  const markdown = await readFile(join(root, "reports/README.md"), "utf8");
  assert.equal(await readFile(join(root, "reports/routes.md"), "utf8"), markdown);
  assert.match(markdown, /版本：2\.3\.4/);
  assert.match(markdown, /HTTP 503/);
  const html = await readFile(join(root, "reports/index.html"), "utf8");
  assert.match(html, /版本：2\.3\.4/);
  assert.match(html, /data:image\/svg\+xml;base64,/);
  assert.equal([...html.matchAll(/<details\b/g)].length, 1);
  assert.equal([...html.matchAll(/<tr data-n="route-result"/g)].length, 2);
});
