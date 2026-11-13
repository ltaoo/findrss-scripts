import { readFile } from "node:fs/promises";
import { read_json_body, validate_cookies } from "../worker/cookie_sync.js";
import { LOCAL_BASE_URL, parse_dev_var } from "./check_routes_env.js";

export async function sync_inspection_cookies({ source_url, admin_password, access_token }, fetch_impl = fetch) {
  const source = new URL(source_url);
  if (source.protocol !== "https:" || source.username || source.password) {
    throw new Error("Cookie 来源必须使用无用户名和密码的 HTTPS 地址");
  }
  if (!admin_password || !access_token) throw new Error("缺少 COOKIE_SOURCE_ADMIN_PASSWORD 或 ACCESS_TOKEN");
  const response = await fetch_impl(source.href, {
    headers: { Authorization: "Bearer " + admin_password, Accept: "application/json" },
    redirect: "error", signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error("读取 Cookie 来源失败：HTTP " + response.status);
  const body = await read_json_body(response, "COOKIE_SYNC_INVALID");
  const cookies = validate_cookies(body?.cookies);
  if (!cookies.length) throw new Error("Cookie 来源为空，停止本轮巡检并保留旧快照");
  const updated = await fetch_impl(LOCAL_BASE_URL + "/api/cookies/update", {
    method: "POST", redirect: "error", signal: AbortSignal.timeout(30000),
    headers: { Authorization: "Bearer " + access_token, "Content-Type": "application/json" },
    // 来源提供完整快照，同时清除已从来源移除的站点 Cookie。
    body: JSON.stringify({ crypto_type: "none", domains: ["*"], data: JSON.stringify(cookies) }),
  });
  if (!updated.ok) throw new Error("写入本地 Cookie 数据库失败：HTTP " + updated.status);
  const result = await read_json_body(updated, "COOKIE_SYNC_INVALID");
  if (result.updated !== true || !Number.isInteger(result.count) || result.count <= 0) {
    throw new Error("没有写入适用于巡检的有效 Cookie，停止本轮巡检");
  }
  return { received: cookies.length, stored: result.count };
}

if (import.meta.main) {
  try {
    const text = await readFile(new URL("../.dev.vars", import.meta.url), "utf8");
    const value = name => process.env[name] || parse_dev_var(text, name);
    const result = await sync_inspection_cookies({
      source_url: value("COOKIE_SOURCE_URL"),
      admin_password: value("COOKIE_SOURCE_ADMIN_PASSWORD"),
      access_token: value("ACCESS_TOKEN"),
    });
    console.log(`Cookie 同步完成：读取 ${result.received} 条，写入加密数据库 ${result.stored} 条`);
  } catch (error) {
    console.error("巡检前 Cookie 同步失败：" + (error.code || error.message));
    process.exitCode = 1;
  }
}
