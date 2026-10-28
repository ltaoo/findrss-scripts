import { readFile, mkdir, rm, writeFile, appendFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { check_routes } from "./route_checks.js";
import { render_progress, render_report } from "./route_report.js";
import { render_report_html } from "./render_route_report.js";

const base = process.env.CHECK_BASE_URL;
if (!base || !/^https?:\/\//.test(base)) throw new Error("请设置 CHECK_BASE_URL 为已部署的 Worker URL");
const cases = JSON.parse(await readFile(new URL("../dist/routes.json", import.meta.url), "utf8"));
const overrides = JSON.parse(process.env.ROUTE_CHECK_CASES || "{}");
const output_dir = fileURLToPath(new URL("../reports/responses/", import.meta.url));
await rm(output_dir, { recursive: true, force: true });
await mkdir(output_dir, { recursive: true });
const report = await check_routes(base, cases, overrides, {
  token: process.env.CHECK_ACCESS_TOKEN || "", output_dir, on_result: result => console.log(render_progress(result)),
});
const markdown = render_report(report);
await mkdir(new URL("../reports/", import.meta.url), { recursive: true });
await writeFile(new URL("../reports/routes.json", import.meta.url), JSON.stringify(report, null, 2) + "\n");
await writeFile(new URL("../reports/routes.md", import.meta.url), markdown);
await writeFile(new URL("../reports/index.html", import.meta.url), render_report_html(report));
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(`路由巡检：${report.passed}/${report.total} 通过`);
if (report.failed) process.exitCode = 1;
