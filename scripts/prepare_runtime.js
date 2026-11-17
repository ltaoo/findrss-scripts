import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// 固定生产运行时，升级时同时运行脚本夹具测试和 Workers 构建检查。
const revision = "c199adb0130d13988eacc438e9c01921b5d5cb1a";
const root = fileURLToPath(new URL("../.runtime/", import.meta.url));
const runtime = root + "findrss-worker";
const run = (command, args, cwd = runtime) => execFileSync(command, args, { cwd, stdio: "inherit" });
mkdirSync(root, { recursive: true });
if (!existsSync(runtime + "/.git")) {
  run("git", ["clone", "--no-checkout", "https://github.com/ltaoo/findrss-worker.git", runtime], root);
}
run("git", ["checkout", "--detach", revision]);
const patches = ["douyin-hj", "debug-version", "inline-cookies", "core-module", "debug-url", "browser-session", "tcp-obs-fold", "fetch-timeout", "debug-timing", "browser-enabled"]
  .map(name => fileURLToPath(new URL("./patches/" + name + ".patch", import.meta.url)));
// 巡检保留旧运行时：仅重建补丁管理的文件，避免新版补丁叠加到旧补丁而失败。
const managed = [...new Set(patches.flatMap(path => [...readFileSync(path, "utf8").matchAll(/^--- a\/(.+)$/gm)].map(match => match[1])))];
run("git", ["restore", "--source=" + revision, "--worktree", "--", ...managed]);
for (const patch of patches) run("git", ["apply", patch]);
const lock = readFileSync(runtime + "/package-lock.json", "utf8");
const stamp = runtime + "/node_modules/.findrss-runtime-lock";
if (!existsSync(stamp) || readFileSync(stamp, "utf8") !== lock) {
  run("npm", ["ci", "--omit=dev", "--no-audit", "--no-fund"]);
  writeFileSync(stamp, lock);
}
