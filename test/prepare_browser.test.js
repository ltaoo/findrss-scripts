import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prepare_browser } from "../scripts/prepare_browser.js";

test("本地浏览器使用官方稳定版，只传显示配置，补丁可重复安装", async t => {
  const root = await mkdtemp(join(tmpdir(), "findrss-browser-setup-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const path = join(root, "miniflare.js");
  await writeFile(path, 'var BROWSER_VERSION = "126.0.6478.182";\nlaunch({\n      executablePath: installed.executablePath,\n      args: args\n});');
  await prepare_browser(path);
  const expected = await readFile(path, "utf8");
  assert.match(expected, /BROWSER_VERSION = "stable"/);
  assert.match(expected, /DISPLAY: process.env.DISPLAY/);
  assert.match(expected, /XAUTHORITY: process.env.XAUTHORITY/);
  assert.doesNotMatch(expected, /\.\.\.process.env|ACCESS_TOKEN|COOKIE|INSTABOX_API_KEY/);
  await prepare_browser(path);
  assert.equal(await readFile(path, "utf8"), expected);
  await writeFile(path, "changed dependency");
  await assert.rejects(prepare_browser(path), /启动代码已变化/);
  assert.equal(await readFile(path, "utf8"), "changed dependency");
});
