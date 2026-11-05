import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify, parseArgs } from "node:util";
import { load_cookies } from "../worker/cookie_sync.js";
import { cookie_header } from "../.runtime/findrss-worker/server/infra/rss_cookies.js";
import { parse_dev_var } from "./check_routes_env.js";

const origin = "https://www.iqiyi.com";
const project = fileURLToPath(new URL("../", import.meta.url));

export async function export_iqiyi_cookie(env, filename) {
  const cookies = await load_cookies(env, { cookies: [{ origin }] }, []);
  const header = cookie_header(cookies, origin + "/");
  if (!/(?:^|;\s*)P00001=[^;]+/.test(header)) {
    throw new Error("未找到有效的爱奇艺 P00001，请确认服务端已支持该站点并重新同步 Cookie");
  }
  if (Buffer.byteLength(header) > 65536) throw new Error("爱奇艺 Cookie 超过 hgdownload 的 64 KiB 限制");
  await writeFile(filename, header, { mode: 0o600, flag: "wx" });
}

async function main() {
  const { values, positionals } = parseArgs({
    options: { remote: { type: "boolean" }, local: { type: "boolean" } }, allowPositionals: true,
  });
  if (values.remote === values.local || positionals.length !== 1) {
    throw new Error("用法：node scripts/export_iqiyi_cookie.js --remote|--local <新建 Cookie 文件>");
  }
  const key = process.env.COOKIE_STORAGE_KEY || parse_dev_var(await readFile(new URL("../.dev.vars", import.meta.url), "utf8"), "COOKIE_STORAGE_KEY");
  if (!/^[0-9a-f]{64}$/i.test(key)) throw new Error("缺少有效的 COOKIE_STORAGE_KEY");
  let record;
  try {
    const { stdout } = await promisify(execFile)(process.execPath, [
      resolve(project, "node_modules/wrangler/bin/wrangler.js"), "kv", "key", "get", "cookies:" + origin,
      "--binding", "COOKIE_KV", values.remote ? "--remote" : "--local",
    ], { cwd: project, maxBuffer: 4 * 1024 * 1024 });
    record = JSON.parse(stdout);
  } catch {
    throw new Error("无法读取爱奇艺 KV 快照：请检查 Wrangler 登录、目标环境及 Cookie 是否已重新同步");
  }
  await export_iqiyi_cookie({ COOKIE_STORAGE_KEY: key, COOKIE_KV: { get: async () => record } }, positionals[0]);
  console.log("已保存爱奇艺 Cookie（文件权限 0600）");
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error(error.code === "EEXIST" ? "目标文件已存在，请指定新文件名" : error.code || error.message);
    process.exitCode = 1;
  });
}
