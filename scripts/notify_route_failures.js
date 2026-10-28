import { readFile } from "node:fs/promises";

export async function notify_route_failures(report, env = process.env, fetch_impl = fetch) {
  if (!report.failed) {
    console.log("全部路由通过，无需推送通知");
    return;
  }
  if (!env.NOTIFY_TOKEN) throw new Error("请配置 GitHub 仓库 Secret NOTIFY_TOKEN");
  const url = new URL(env.NOTIFY_URL);
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("NOTIFY_URL 必须是无用户名和密码的 HTTPS 地址");
  const failed = report.results.filter(result => !result.output_valid);
  const lines = failed.slice(0, 10).map(result => `${result.format} ${result.path}：${String(result.error || "校验失败").slice(0, 200)}`);
  if (failed.length > 10) lines.push(`另有 ${failed.length - 10} 条失败，详见报告`);
  if (env.GITHUB_REPOSITORY && env.GITHUB_RUN_ID) lines.push(`报告：${env.GITHUB_SERVER_URL || "https://github.com"}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`);
  const text = [`FindRSS 路由巡检失败：${report.failed}/${report.total}`, ...lines].join("\n");
  const response = await fetch_impl(url, {
    method: "POST", redirect: "error", signal: AbortSignal.timeout(15000),
    headers: { Authorization: "Bearer " + env.NOTIFY_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error("失败通知推送失败：HTTP " + response.status);
  console.log(`已推送 ${report.failed} 条失败路由的汇总通知`);
}

if (import.meta.main) {
  const report = JSON.parse(await readFile(new URL("../reports/routes.json", import.meta.url), "utf8"));
  await notify_route_failures(report);
}
