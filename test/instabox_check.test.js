import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "findrss-instabox-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = join(root, "source");
  const bin = join(root, "bin");
  await mkdir(join(source, "scripts"), { recursive: true });
  await mkdir(bin);
  await copyFile(new URL("../scripts/instabox_check.sh", import.meta.url), join(source, "scripts/instabox_check.sh"));
  await writeFile(join(source, ".gitignore"), ".dev.vars\nreports/\n");
  if (process.platform === "darwin") {
    execFileSync("xattr", ["-w", "com.findrss.test", "metadata", join(source, ".gitignore")]);
  }
  await writeFile(join(source, ".dev.vars"), "ACCESS_TOKEN=must-stay-private\n");
  const git = (...args) => execFileSync("git", args, { cwd: source, stdio: "pipe" });
  git("init");
  git("add", ".gitignore", "scripts/instabox_check.sh");
  await mkdir(join(root, "reports"));
  for (const name of ["routes.json", "routes.md", "README.md", "index.html"]) {
    await writeFile(join(root, "reports", name), "new report\n");
  }
  execFileSync("tar", ["-czf", join(root, "reports.tar.gz"), "reports"], { cwd: root });
  await writeFile(join(bin, "instabox"), `#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_ROOT + '/calls.jsonl', JSON.stringify(args) + '\\n');
if (args[0] === process.env.FAKE_FAIL) process.exit(2);
if (args[0] === 'exec' && args[1] === '--background') console.log('job-test');
if (args[0] === 'jobs' && args[1] === 'wait') process.exit(Number(process.env.FAKE_STATUS || 0));
if (args[0] === 'cp') {
  if (args[1].includes(':')) {
    if (process.env.FAKE_MISSING) process.exit(2);
    fs.copyFileSync(process.env.FAKE_ROOT + '/reports.tar.gz', args[2]);
  } else if (args[1].endsWith('source.tar.gz')) {
    fs.copyFileSync(args[1], process.env.FAKE_ROOT + '/uploaded.tar.gz');
  }
}
`, { mode: 0o700 });
  const run = (env = {}) => spawnSync("bash", ["scripts/instabox_check.sh"], {
    cwd: source, encoding: "utf8", timeout: 10000,
    env: { ...process.env, PATH: bin + ":" + process.env.PATH, INSTABOX_API_KEY: "fake-key", INSTABOX_MACHINE: "test-box", FAKE_ROOT: root, ...env },
  });
  const calls = async () => (await readFile(join(root, "calls.jsonl"), "utf8")).trim().split("\n").map(line => JSON.parse(line));
  return { root, source, run, calls };
}

test("远端路由失败仍取回完整报告，凭据不进入源码包，最后关机", async t => {
  const f = await fixture(t);
  const result = f.run({ FAKE_STATUS: "1" });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(await readFile(join(f.source, "reports/index.html"), "utf8"), "new report\n");
  const files = execFileSync("tar", ["-tzf", join(f.root, "uploaded.tar.gz")], { encoding: "utf8" });
  assert.ok(!files.includes(".dev.vars"));
  assert.ok(!files.split("\n").some(file => file.split("/").at(-1).startsWith("._")));
  assert.ok(files.includes("scripts/instabox_check.sh"));
  const calls = await f.calls();
  assert.deepEqual(calls[0], ["start", "test-box"]);
  assert.deepEqual(calls.at(-1), ["stop", "test-box"]);
  assert.ok(calls.some(args => args[0] === "exec" && args.at(-1).includes("shutdown -h +50")));
  assert.ok(calls.some(args => args[0] === "cp" && args.at(-1).endsWith("/.dev.vars")));
});

test("开机响应失败仍尝试关机，且不继续运行巡检", async t => {
  const f = await fixture(t);
  assert.equal(f.run({ FAKE_FAIL: "start" }).status, 2);
  assert.deepEqual(await f.calls(), [["start", "test-box"], ["stop", "test-box"]]);
});

test("远端超时或未生成报告时任务失败并关机", async t => {
  for (const env of [{ FAKE_STATUS: "124" }, { FAKE_MISSING: "1" }]) {
    await t.test(JSON.stringify(env), async t => {
      const f = await fixture(t);
      const result = f.run(env);
      assert.notEqual(result.status, 0, result.stdout + result.stderr);
      assert.deepEqual((await f.calls()).at(-1), ["stop", "test-box"]);
    });
  }
});
