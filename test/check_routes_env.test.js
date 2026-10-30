import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { LOCAL_BASE_URL, is_loopback_url, local_access_token, parse_dev_var } from "../scripts/check_routes_env.js";

test("本地巡检只对回环地址读取 .dev.vars 中的访问令牌", async t => {
  const directory = await mkdtemp(join(tmpdir(), "findrss-dev-vars-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, ".dev.vars");
  await writeFile(file, 'ACCESS_TOKEN="local token"\nOTHER=value\n');
  const url = pathToFileURL(file);
  assert.equal(parse_dev_var("ACCESS_TOKEN=plain\n", "ACCESS_TOKEN"), "plain");
  assert.equal(parse_dev_var("export ACCESS_TOKEN='quoted'\n", "ACCESS_TOKEN"), "quoted");
  assert.equal(parse_dev_var("OTHER=value\n", "ACCESS_TOKEN"), "");
  assert.equal(is_loopback_url(LOCAL_BASE_URL), true);
  assert.equal(is_loopback_url("http://localhost:8081"), true);
  assert.equal(is_loopback_url("https://scripts.example"), false);
  assert.equal(await local_access_token(LOCAL_BASE_URL, url), "local token");
  assert.equal(await local_access_token("https://scripts.example", url), "");
  assert.equal(await local_access_token(LOCAL_BASE_URL, pathToFileURL(join(directory, "missing"))), "");
});
