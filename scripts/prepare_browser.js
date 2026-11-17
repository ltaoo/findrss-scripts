import { readFile, writeFile } from "node:fs/promises";

export async function prepare_browser(path = new URL("../node_modules/miniflare/dist/src/index.js", import.meta.url)) {
  const source = await readFile(path, "utf8");
  const version = /var BROWSER_VERSION = "[^"]+";/g;
  const launch = "executablePath: installed.executablePath,\n      args:";
  const configured = "executablePath: installed.executablePath,\n      env: { ...(process.env.DISPLAY ? { DISPLAY: process.env.DISPLAY } : {}), ...(process.env.XAUTHORITY ? { XAUTHORITY: process.env.XAUTHORITY } : {}) },\n      args:";
  if ([...source.matchAll(version)].length !== 1 || (!source.includes(configured) && source.split(launch).length !== 2)) {
    throw new Error("Miniflare 浏览器启动代码已变化，请检查本地 Chrome 配置");
  }
  // shortcut: 固定 Miniflare 使用 Chrome 126 且不传显示环境；上游支持后移除此补丁。
  const next = source.replace(version, 'var BROWSER_VERSION = "stable";').replace(launch, configured);
  if (next !== source) await writeFile(path, next);
}

if (import.meta.main) await prepare_browser();
