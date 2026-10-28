import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const files = ["reports/routes.json", "reports/routes.md", "reports/index.html"];
const root_files = ["README.md", "index.html", "routes.json", "routes.md"];
const root_paths = [...root_files, ".nojekyll"];
const branch = "refs/heads/route-reports";
const git = (args, options = {}) => execFileSync("git", args, { encoding: "utf8", ...options }).trim();
for (const file of [...files, "reports/README.md"]) {
  if (!statSync(file).isFile()) throw new Error("缺少巡检报告：" + file);
}
if (existsSync("reports/responses")) files.push("reports/responses");

const remote = spawnSync("git", ["ls-remote", "--exit-code", "--heads", "origin", branch], { encoding: "utf8" });
if (remote.error) throw remote.error;
if (![0, 2].includes(remote.status)) throw new Error("读取产物分支失败：" + remote.stderr.trim());
let parent;
if (remote.status === 0) {
  git(["fetch", "--no-tags", "origin", branch]);
  parent = git(["rev-parse", "FETCH_HEAD"]);
  const existing = git(["ls-tree", "-r", "--name-only", parent]);
  if (existing.split("\n").some(file => file && !root_paths.includes(file) && !files.includes(file) && !file.startsWith("reports/responses/"))) throw new Error("产物分支包含其他文件，拒绝覆盖");
}

const directory = mkdtempSync(join(tmpdir(), "findrss-route-reports-"));
try {
  // 独立索引只暂存报告，不改变源码分支或带入 reports/ 中的其他文件。
  const env = { ...process.env, GIT_INDEX_FILE: join(directory, "index") };
  git(["read-tree", "--empty"], { env });
  git(["add", "--force", "--", ...files], { env });
  // 首页和下载文件一起放到产物分支根目录，保持相对链接有效，不改动源码工作区。
  for (const file of root_files) {
    const blob = git(["hash-object", "-w", "--", "reports/" + file]);
    git(["update-index", "--add", "--cacheinfo", "100644", blob, file], { env });
  }
  const empty_blob = git(["hash-object", "-w", "--stdin"], { input: "" });
  git(["update-index", "--add", "--cacheinfo", "100644", empty_blob, ".nojekyll"], { env });
  const tree = git(["write-tree"], { env });
  if (parent && tree === git(["rev-parse", parent + "^{tree}"])) {
    console.log("巡检报告未变化，无需提交");
  } else {
    const source = process.env.GITHUB_SHA || git(["rev-parse", "HEAD"]);
    const name = "github-actions[bot]";
    const email = "41898282+github-actions[bot]@users.noreply.github.com";
    const commit = git(["commit-tree", tree, ...(parent ? ["-p", parent] : [])], {
      env: { ...env, GIT_AUTHOR_NAME: name, GIT_COMMITTER_NAME: name, GIT_AUTHOR_EMAIL: email, GIT_COMMITTER_EMAIL: email },
      input: "Update route reports for " + source + "\n",
    });
    git(["push", "origin", commit + ":" + branch]);
    console.log("巡检报告已发布到 route-reports 分支");
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}
