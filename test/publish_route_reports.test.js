import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("../scripts/publish_route_reports.js", import.meta.url));
const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const report_files = [".nojekyll", "README.md", "index.html", "reports/index.html", "reports/routes.json", "reports/routes.md", "routes.json", "routes.md"];

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "findrss-publish-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const remote = join(root, "remote.git");
  const source = join(root, "source");
  await mkdir(source);
  git(root, "init", "--bare", remote);
  git(source, "init", "-b", "main");
  git(source, "config", "user.name", "Fixture");
  git(source, "config", "user.email", "fixture@example.com");
  git(source, "config", "commit.gpgsign", "false");
  await writeFile(join(source, ".gitignore"), "reports/\n");
  await writeFile(join(source, "source.txt"), "original\n");
  await writeFile(join(source, "README.md"), "Source README\n");
  git(source, "add", ".gitignore", "source.txt", "README.md");
  git(source, "commit", "-m", "Source");
  git(source, "remote", "add", "origin", remote);
  git(source, "push", "origin", "main");
  await mkdir(join(source, "reports"));
  await writeFile(join(source, "reports/routes.json"), '{"failed":0}\n');
  await writeFile(join(source, "reports/routes.md"), "All routes passed\n");
  await writeFile(join(source, "reports/index.html"), "<!doctype html><title>Route report</title>\n");
  await writeFile(join(source, "reports/README.md"), "# Route report README\n");
  await writeFile(join(source, "reports/cookie-sync-setup.json"), '{"password":"must-not-publish"}\n');
  const head = git(source, "rev-parse", "HEAD");
  const publish = () => spawnSync(process.execPath, [script], { cwd: source, encoding: "utf8", env: { ...process.env, GITHUB_SHA: head } });
  return { source, remote, head, publish };
}

test("产物分支根目录发布 README、HTML 和下载文件，保留历史和源码索引", async t => {
  const f = await fixture(t);
  await writeFile(join(f.source, "source.txt"), "staged local changes\n");
  git(f.source, "add", "source.txt");
  let result = f.publish();
  assert.equal(result.status, 0, result.stderr);
  const first = git(f.remote, "rev-parse", "route-reports");
  assert.equal(git(f.remote, "ls-tree", "-r", "--name-only", first), report_files.join("\n"));
  assert.equal(git(f.remote, "show", first + ":README.md"), "# Route report README");
  for (const file of ["index.html", "routes.json", "routes.md"]) {
    assert.equal(git(f.remote, "show", first + ":" + file), git(f.remote, "show", first + ":reports/" + file));
  }
  assert.equal(git(f.remote, "show", first + ":.nojekyll"), "");
  assert.equal(git(f.source, "status", "--short"), "M  source.txt");
  assert.equal(git(f.source, "show", "HEAD:README.md"), "Source README");
  assert.equal(git(f.source, "diff", "--", "README.md"), "");
  assert.equal(git(f.remote, "rev-list", "--count", first), "1");
  assert.equal(git(f.remote, "show", first + ":reports/routes.json"), '{"failed":0}');
  assert.ok(git(f.remote, "log", "-1", "--format=%s", first).includes(f.head));
  assert.equal(git(f.source, "rev-parse", "HEAD"), f.head);
  assert.equal(git(f.source, "branch", "--show-current"), "main");
  assert.equal(git(f.source, "diff", "--cached", "--name-only"), "source.txt");
  assert.equal(git(f.remote, "rev-parse", "main"), f.head);

  result = f.publish();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git(f.remote, "rev-parse", "route-reports"), first);
  await writeFile(join(f.source, "reports/routes.json"), '{"failed":1}\n');
  result = f.publish();
  assert.equal(result.status, 0, result.stderr);
  const next = git(f.remote, "rev-parse", "route-reports");
  assert.notEqual(next, first);
  assert.equal(git(f.remote, "rev-parse", next + "^"), first);
  assert.equal(git(f.remote, "show", next + ":reports/routes.json"), '{"failed":1}');
  assert.equal(git(f.remote, "show", next + ":routes.json"), '{"failed":1}');
  assert.equal(git(f.source, "diff", "--cached", "--name-only"), "source.txt");

  await writeFile(join(f.source, "reports/README.md"), "# Updated route report README\n");
  result = f.publish();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git(f.remote, "rev-parse", "route-reports^"), next);
  assert.equal(git(f.remote, "show", "route-reports:README.md"), "# Updated route report README");
  assert.equal(git(f.source, "diff", "--", "README.md"), "");
});

test("已有产物分支可直接增加根目录 README 和 HTML，保留旧报告历史", async t => {
  const f = await fixture(t);
  git(f.source, "switch", "--orphan", "legacy-reports");
  git(f.source, "add", "--force", "--", "reports/routes.json", "reports/routes.md", "reports/index.html");
  git(f.source, "commit", "-m", "Legacy reports");
  const previous = git(f.source, "rev-parse", "HEAD");
  git(f.source, "push", "origin", "HEAD:refs/heads/route-reports");
  git(f.source, "switch", "main");
  await writeFile(join(f.source, "reports/routes.json"), '{"failed":0}\n');
  await writeFile(join(f.source, "reports/routes.md"), "All routes passed\n");
  await writeFile(join(f.source, "reports/index.html"), "<!doctype html><title>Route report</title>\n");
  const result = f.publish();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git(f.remote, "rev-parse", "route-reports^"), previous);
  assert.match(git(f.remote, "show", "route-reports:reports/index.html"), /Route report/);
  assert.equal(git(f.remote, "show", "route-reports:README.md"), "# Route report README");
  assert.equal(git(f.remote, "ls-tree", "-r", "--name-only", "route-reports"), report_files.join("\n"));
});

test("产物分支增加路由正文并删除本轮失效文件，空目录仍可发布", async t => {
  const f = await fixture(t);
  assert.equal(f.publish().status, 0);
  const previous = git(f.remote, "rev-parse", "route-reports");
  const directory = join(f.source, "reports/responses/rss/github/org/repo");
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "release.xml"), "<rss>original body</rss>\n");
  let result = f.publish();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git(f.remote, "rev-parse", "route-reports^"), previous);
  assert.equal(git(f.remote, "ls-tree", "-r", "--name-only", "route-reports"),
    [...report_files, "reports/responses/rss/github/org/repo/release.xml"].sort().join("\n"));
  assert.equal(git(f.remote, "show", "route-reports:reports/responses/rss/github/org/repo/release.xml"), "<rss>original body</rss>");
  await rm(join(directory, "release.xml"));
  result = f.publish();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git(f.remote, "ls-tree", "-r", "--name-only", "route-reports"), report_files.join("\n"));
  assert.equal(git(f.source, "rev-parse", "HEAD"), f.head);
});

test("缺少报告、远端读取失败或产物分支含其他文件时拒绝发布", async t => {
  const f = await fixture(t);
  await rm(join(f.source, "reports/routes.md"));
  assert.notEqual(f.publish().status, 0);
  assert.equal(git(f.remote, "for-each-ref", "--format=%(refname)", "refs/heads/route-reports"), "");
  await writeFile(join(f.source, "reports/routes.md"), "Report\n");
  await rm(join(f.source, "reports/README.md"));
  assert.notEqual(f.publish().status, 0);
  assert.equal(git(f.remote, "for-each-ref", "--format=%(refname)", "refs/heads/route-reports"), "");
  await writeFile(join(f.source, "reports/README.md"), "# Route report README\n");
  git(f.source, "remote", "set-url", "origin", join(f.source, "missing.git"));
  let result = f.publish();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /读取产物分支失败/);
  git(f.source, "remote", "set-url", "origin", f.remote);
  git(f.source, "push", "origin", "HEAD:refs/heads/route-reports");
  result = f.publish();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /包含其他文件/);
  assert.equal(git(f.remote, "rev-parse", "route-reports"), f.head);
});
