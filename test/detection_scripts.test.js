import assert from "node:assert/strict";
import test from "node:test";
import { read_script, script_names } from "./support/script_sources.js";
const { compile_script_module, execute_script } = await import("findrss-worker/server/infra/script_sandbox.js");

const snapshot = text => ({ body: { type: "content", value: text } });

test("平台示例可编译，静态正文去噪、GitHub 发布窗口真实提取后检测内容", async t => {
  for (const name of script_names("detect")) assert.equal((await compile_script_module(read_script("detect/" + name))).error, "");
  const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
  const script = read_script("detect/website_text.js"), compiled = await compile_script_module(script);
  globalThis.fetch = async () => new Response('<html><body><article id="main">新 <b>正文</b><script>random=3</script></article></body></html>');
  const context = { method: "GET", pathname: "/web/text/detect", params: {}, query: { url: "https://example.com/", selector: "#main" }, previous: { snapshot: snapshot("旧内容") } };
  const value = JSON.parse((await execute_script(script, compiled.metadata, null, context)).output);
  assert.equal(value.status, "changed"); assert.equal(value.snapshot.body.value, "新 正文");
  globalThis.fetch = async () => new Response('<html><body><article id="main">新<b>正文</b></article></body></html>');
  context.previous = { snapshot: snapshot("新正文") };
  assert.equal(JSON.parse((await execute_script(script, compiled.metadata, null, context)).output).status, "unchanged");
  context.query.selector = "#missing";
  await assert.rejects(execute_script(script, compiled.metadata, null, context), /缺少检测区域/);
  const github = read_script("detect/github_releases.js"), metadata = (await compile_script_module(github)).metadata;
  globalThis.fetch = async () => new Response('<feed xmlns="http://www.w3.org/2005/Atom"><entry><id>tag:release/1</id><title>v1</title><link href="https://github.com/a/b/releases/tag/v1"/><content>&lt;pre&gt;line 1\n  line 2&lt;/pre&gt;</content></entry></feed>');
  const release = JSON.parse((await execute_script(github, metadata, null, { method: "GET", pathname: "/github/a/b/releases/detect", params: { owner: "a", repo: "b" }, query: {} })).output);
  assert.equal(release.snapshot.releases.coverage, "window"); assert.equal(release.snapshot.releases.items[0].id, "tag:release/1");
  assert.match(release.snapshot.releases.items[0].data.content, /\n  line 2/);
});
