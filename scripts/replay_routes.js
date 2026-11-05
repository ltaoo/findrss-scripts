import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { is_loopback_url, parse_dev_var } from "./check_routes_env.js";

const DEFAULT_BASE = "https://scripts.findrss.cloud";
const dev_vars_url = new URL("../.dev.vars", import.meta.url);
const max_probe_bytes = 64 * 1024;
const platform_cpu = /Worker exceeded resource limits|exceeded CPU time limit|Error 1102/i;
const timeout_names = new Set(["TimeoutError", "AbortError"]);

export function classify_probe(status, content_type, body) {
  const type = (content_type || "").split(";")[0].trim().toLowerCase();
  if (status >= 200 && status < 300) return { classification: "passed" };
  if (type === "text/html" && platform_cpu.test(body)) {
    return { classification: "exceeded_cpu", code: "EXCEEDED_CPU", message: "Cloudflare 终止了 Worker（CPU 超限）" };
  }
  let problem;
  try { problem = JSON.parse(body); } catch {}
  if (problem && typeof problem === "object") {
    const code = typeof problem.code === "string" ? problem.code : typeof problem.error === "string" ? problem.error : "";
    const message = typeof problem.message === "string" ? problem.message : "";
    if (code === "COOKIE_REQUIRED") return { classification: "cookie_required", code, message };
    if (code === "CONFIG_INVALID" || code === "ACCESS_TOKEN_REQUIRED") return { classification: "config", code, message };
    if (code.startsWith("UPSTREAM_")) return { classification: "upstream", code, message };
    if (code === "SCRIPT_FAILED" || code === "SCRIPT_OUTPUT_INVALID") return { classification: "script", code, message };
    if (code) return { classification: "error", code, message };
  }
  if (type === "text/html") return { classification: "platform_error", message: "HTTP " + status + " 平台错误页" };
  return { classification: status >= 500 ? "server_error" : "http_error", message: "HTTP " + status };
}

export function failed_entries(report, { all = false, file = "", classification = "" } = {}) {
  return (report.results || []).flatMap(result => {
    if (classification && result.classification !== classification) return [];
    if (!all && result.output_valid === true) return [];
    if (file && !String(result.file).includes(file)) return [];
    const samples = Array.isArray(result.samples) && result.samples.length ? result.samples : [result];
    return samples.flatMap(sample => {
      if (!all && sample.output_valid === true) return [];
      const example = sample.example || result.example;
      if (typeof example !== "string" || !example.startsWith("/")) return [];
      return [{ file: result.file, format: result.format, path: result.path, example,
        report_status: sample.status ?? result.status, report_code: sample.code ?? result.code,
        report_error: sample.error ?? result.error }];
    });
  });
}

async function read_prefix(response) {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks = [];
  let size = 0;
  try {
    while (size < max_probe_bytes) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.byteLength;
    }
  } finally { await reader.cancel().catch(() => {}); }
  return Buffer.concat(chunks.map(chunk => Buffer.from(chunk))).toString("utf8");
}

export async function probe_route(base, entry, { token = "", timeout_ms = 60000, fetch_impl = fetch } = {}) {
  const started = Date.now();
  const signal = AbortSignal.timeout(timeout_ms);
  let attempts = 0;
  try {
    const url = new URL(entry.example, base);
    if (url.origin !== new URL(base).origin) throw new Error("复跑地址必须位于目标站点：" + entry.example);
    attempts++;
    const response = await fetch_impl(url, { redirect: "manual", signal,
      headers: token ? { Authorization: "Bearer " + token } : {} });
    const body = await read_prefix(response);
    const result = { ...entry, status: response.status, attempts, duration_ms: Date.now() - started,
      ...classify_probe(response.status, response.headers.get("Content-Type"), body) };
    result.script = response.headers.get("X-FindRSS-Script") || "";
    return result;
  } catch (error) {
    return { ...entry, status: 0, attempts, duration_ms: Date.now() - started,
      classification: timeout_names.has(error.name) ? "timeout" : "network_error", message: error.message };
  }
}

export async function replay_routes(entries, options = {}) {
  const { concurrency = 5, on_result = () => {} } = options;
  const results = [];
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, async () => {
    for (let entry; (entry = entries.shift());) {
      const result = await probe_route(options.base, entry, options);
      results.push(result);
      on_result(result);
    }
  }));
  results.sort((a, b) => (a.file + a.path + a.example).localeCompare(b.file + b.path + b.example));
  const counts = {};
  for (const result of results) counts[result.classification] = (counts[result.classification] || 0) + 1;
  return { checked_at: new Date().toISOString(), base: options.base, total: results.length,
    passed: counts.passed || 0, failed: results.length - (counts.passed || 0), counts, results };
}

export function render_replay_summary(report) {
  const labels = { passed: "通过", exceeded_cpu: "平台 CPU 超限",
    cookie_required: "缺少 Cookie", config: "配置无效", upstream: "上游错误", script: "脚本失败",
    error: "业务错误", timeout: "超时", platform_error: "平台错误页", server_error: "服务端错误",
    http_error: "HTTP 错误", network_error: "网络错误" };
  const lines = ["复跑：" + report.passed + "/" + report.total + " 通过（" + report.base + "）"];
  for (const [key, count] of Object.entries(report.counts).sort((a, b) => b[1] - a[1])) {
    lines.push("  " + String(count).padStart(3) + "  " + (labels[key] || key));
  }
  const failures = report.results.filter(result => result.classification !== "passed");
  if (failures.length) {
    lines.push("", "失败明细：");
    for (const result of failures) {
      const detail = result.message || result.code || "";
      lines.push("  " + result.classification + "  " + result.file + " " + result.path + (detail ? "  " + detail : ""));
    }
  }
  return lines.join("\n");
}

function parse_args(argv) {
  const options = { all: false, dev_vars: false, concurrency: 5, timeout_ms: 60000, file: "", classification: "" };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    const value = () => argv[++index];
    if (arg === "--all") options.all = true;
    else if (arg === "--dev-vars") options.dev_vars = true;
    else if (arg === "--report") options.report = value();
    else if (arg === "--base") options.base = value();
    else if (arg === "--out") options.out = value();
    else if (arg === "--file") options.file = value();
    else if (arg === "--class") options.classification = value();
    else if (arg === "--concurrency") options.concurrency = Number(value());
    else if (arg === "--timeout") options.timeout_ms = Number(value());
    else throw new Error("未知参数：" + arg);
  }
  return options;
}

async function main() {
  const options = parse_args(process.argv.slice(2));
  const report_url = options.report ? pathToFileURL(resolve(options.report)) : new URL("../reports/routes.json", import.meta.url);
  const report = JSON.parse(await readFile(report_url, "utf8"));
  const base = options.base || process.env.CHECK_BASE_URL || DEFAULT_BASE;
  let token = process.env.CHECK_ACCESS_TOKEN || "";
  if (!token && (options.dev_vars || is_loopback_url(base))) {
    token = parse_dev_var(await readFile(dev_vars_url, "utf8").catch(() => ""), "ACCESS_TOKEN");
  }
  const entries = failed_entries(report, options);
  if (!entries.length) {
    console.log("没有需要复跑的失败路由");
    return;
  }
  const output = await replay_routes(entries, {
    base, token, concurrency: options.concurrency, timeout_ms: options.timeout_ms,
    on_result: result => console.log(result.classification.padEnd(16) + result.file + " " + result.path),
  });
  const summary = render_replay_summary(output);
  const out_url = options.out ? pathToFileURL(resolve(options.out)) : new URL("../reports/replay.json", import.meta.url);
  await mkdir(new URL(".", out_url), { recursive: true });
  await writeFile(out_url, JSON.stringify(output, null, 2) + "\n");
  console.log("\n" + summary);
  console.log("\n报告写入 " + fileURLToPath(out_url));
  if (output.failed) process.exitCode = 1;
}

if (import.meta.main) await main();
