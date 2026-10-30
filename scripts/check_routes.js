import { readFile, mkdir, rm, writeFile, appendFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import scripts from "../dist/scripts.js";
import { check_routes } from "./route_checks.js";
import { render_progress, render_report } from "./route_report.js";
import { render_report_html } from "./render_route_report.js";
import { route_report_model } from "./route_report_model.js";
import { LOCAL_BASE_URL, is_loopback_url, local_access_token } from "./check_routes_env.js";

const local = process.argv.includes("--local");
const base = process.env.CHECK_BASE_URL || (local ? LOCAL_BASE_URL : "");
if (!base || !/^https?:\/\//.test(base)) throw new Error("请设置 CHECK_BASE_URL 为 Worker URL，或使用 npm run check:local 连接本地 " + LOCAL_BASE_URL);
const token = process.env.CHECK_ACCESS_TOKEN || await local_access_token(base, new URL("../.dev.vars", import.meta.url));
const cases = JSON.parse(await readFile(new URL("../dist/routes.json", import.meta.url), "utf8"));
const config = JSON.parse(await readFile(process.env.ROUTE_CHECK_CONFIG || new URL("../.github/route-checks.json", import.meta.url), "utf8"));
const overrides = JSON.parse(process.env.ROUTE_CHECK_CASES || "{}");
for (const value of [config, overrides]) {
  assert.ok(value && typeof value === "object" && !Array.isArray(value), "巡检配置必须是对象");
}
const output_dir = fileURLToPath(new URL("../reports/responses/", import.meta.url));
await rm(output_dir, { recursive: true, force: true });
await mkdir(output_dir, { recursive: true });
const report = await check_routes(base, cases, { ...config, ...overrides }, {
  token, output_dir, on_result: result => console.log(render_progress(result)),
});
report.mode = local || is_loopback_url(base) ? "dev" : "release";
report.scripts = scripts.map(({ file, metadata }) => ({ file, version: metadata.version, platform: metadata.platform }));
const icon_dir = fileURLToPath(new URL("../reports/icons/", import.meta.url));
await rm(icon_dir, { recursive: true, force: true });
for (const group of route_report_model(report).groups) {
  if (!group.icon) continue;
  const destination = join(icon_dir, group.icon_file.slice("icons/".length));
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, group.icon);
}
const markdown = render_report(report);
await mkdir(new URL("../reports/", import.meta.url), { recursive: true });
await writeFile(new URL("../reports/routes.json", import.meta.url), JSON.stringify(report, null, 2) + "\n");
await writeFile(new URL("../reports/routes.md", import.meta.url), markdown);
await writeFile(new URL("../reports/README.md", import.meta.url), markdown);
await writeFile(new URL("../reports/index.html", import.meta.url), render_report_html(report, scripts));
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(`路由巡检：${report.passed}/${report.total} 通过`);
if (report.failed) process.exitCode = 1;
