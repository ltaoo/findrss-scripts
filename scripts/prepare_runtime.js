import { execFileSync, spawnSync } from "node:child_process";
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
// 固定运行时的补丁随构建应用并允许重复运行。
for (const name of ["douyin-hj"]) {
  const patch = fileURLToPath(new URL("./patches/" + name + ".patch", import.meta.url));
  if (spawnSync("git", ["apply", "--reverse", "--check", patch], { cwd: runtime, stdio: "ignore" }).status !== 0) {
    run("git", ["apply", patch]);
  }
}
const lock = readFileSync(runtime + "/package-lock.json", "utf8");
const stamp = runtime + "/node_modules/.findrss-runtime-lock";
if (!existsSync(stamp) || readFileSync(stamp, "utf8") !== lock) {
  run("npm", ["ci", "--omit=dev", "--no-audit", "--no-fund"]);
  writeFileSync(stamp, lock);
}
