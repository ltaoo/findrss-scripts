import { readFile } from "node:fs/promises";

// 与 wrangler.jsonc 的 dev.port 保持一致，本地巡检直接连接 npm run dev。
export const LOCAL_BASE_URL = "http://127.0.0.1:8801";

export function is_loopback_url(value) {
  try {
    return ["127.0.0.1", "localhost", "[::1]", "::1"].includes(new URL(value).hostname);
  } catch {
    return false;
  }
}

export function parse_dev_var(text, name) {
  for (const line of String(text).split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || match[1] !== name) continue;
    const quoted = match[2].match(/^(['"])([^]*)\1$/);
    return quoted ? quoted[2] : match[2];
  }
  return "";
}

// 只有回环地址才读取本机 .dev.vars，避免把本地令牌发送到远端站点。
export async function local_access_token(base, dev_vars_url) {
  if (!is_loopback_url(base)) return "";
  try {
    return parse_dev_var(await readFile(dev_vars_url, "utf8"), "ACCESS_TOKEN");
  } catch {
    return "";
  }
}
