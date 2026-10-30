import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { read_script } from "./support/script_sources.js";
import { DOUYIN_SDK_FILES } from "findrss-worker/server/infra/douyin_sdk.js";
import { ScriptCookieAccess } from "findrss-worker/server/infra/script_cookie_access.js";
import { compile_script_module, execute_script } from "findrss-worker/server/infra/script_sandbox.js";

const source = read_script("rss/douyin.js");
const compiled = await compile_script_module(source);
assert.equal(compiled.error, "");
const fixture = JSON.parse(readFileSync(new URL("./fixtures/script_migration.json", import.meta.url)))
  .find(entry => entry.file === "douyin");
const sec_uid = fixture.params.sec_uid;
const response = JSON.parse(fixture.responses[0].body);
const sdk = ["bdms", "security"].map(name => gunzipSync(
  readFileSync(new URL("./fixtures/douyin/" + name + ".js.gz", import.meta.url)),
));
const names = compiled.metadata.permissions.cookies[0].names;
const grant = () => new ScriptCookieAccess({
  permissions: compiled.metadata.permissions, assert_grant() {},
  cookies: () => [...names, "unrelated-secret"].map(name => ({
    name, value: "fixture-" + name, domain: ".douyin.com", path: "/", secure: true,
  })),
});
const run = (query = {}, params = { sec_uid }, access = grant()) => execute_script(
  source, { ...compiled.metadata, debug: true }, null,
  { method: "GET", pathname: "/douyin/user/" + sec_uid, params, query }, [], "", access,
);
function upstream(t, handler) {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async (url, options) => {
    const index = DOUYIN_SDK_FILES.findIndex(file => file.url === url);
    return index >= 0 ? new Response(sdk[index]) : handler(new URL(url), options);
  };
}

test("抖音新域名使用实时 SDK 签名及已授权 Cookie，保留视频、图集和分页", async t => {
  let calls = 0;
  const urls = [];
  upstream(t, (url, options) => {
    calls++;
    urls.push(url.href);
    assert.equal(url.origin + url.pathname, "https://www-hj.douyin.com/aweme/v1/web/aweme/post/");
    assert.equal(url.searchParams.get("sec_user_id"), sec_uid);
    assert.equal(url.searchParams.get("count"), calls === 1 ? "18" : "2");
    assert.equal(url.searchParams.get("max_cursor"), calls === 1 ? "0" : "1720000000000");
    assert.equal(url.searchParams.get("need_time_list"), calls === 1 ? "1" : "0");
    assert.ok(url.searchParams.get("a_bogus").length > 100);
    assert.equal(url.searchParams.get("timestamp"), options.headers["x-secsdk-web-expire"]);
    assert.equal(url.searchParams.get("verifyFp"), "fixture-s_v_web_id");
    assert.match(options.headers["x-secsdk-web-signature"], /^[a-f0-9]{32}$/);
    assert.equal(options.headers.uifid, "fixture-UIFID");
    assert.equal(options.headers.origin, "https://www.douyin.com");
    assert.equal(options.headers.referer, "https://www.douyin.com/");
    assert.equal(options.headers["sec-fetch-site"], "same-site");
    assert.ok(options.headers["user-agent"].includes(url.searchParams.get("browser_version")));
    assert.deepEqual(options.headers.Cookie.split("; ").map(pair => pair.split("=")[0]).sort(), names);
    return Response.json(response);
  });
  const result = await run();
  const feed = JSON.parse(result.output);
  assert.deepEqual(feed.items.map(item => item.id), fixture.expected_ids);
  assert.equal(feed.items[0].enclosure.url, "https://cdn.example/video.mp4");
  assert.equal(feed.items[1].images.length, 2);
  assert.equal(feed.link, "https://www.douyin.com/user/" + sec_uid);
  assert.equal(result.upstream_requests[0].url, urls[0]);
  assert.doesNotMatch(JSON.stringify(result), /fixture-(sessionid|msToken)/);
  await run({ count: "2", max_cursor: "1720000000000" });
  assert.equal(calls, 2);
});

test("抖音参数和 Cookie 授权失败时不请求上游", async t => {
  upstream(t, () => assert.fail("不应发起上游请求"));
  for (const query of [{ count: "0" }, { count: "31" }, { count: "1.5" }, { max_cursor: "invalid" }]) {
    await assert.rejects(run(query), error => error.problem.code === "INVALID_PARAMETER");
  }
  await assert.rejects(run({}, { sec_uid: "../user" }), /sec_uid/);
  await assert.rejects(run({}, { sec_uid }, null), /Cookie 权限/);
});

test("抖音上游空回包和拒绝响应不会误报为作品列表成功", async t => {
  let body;
  upstream(t, () => body());
  for (const make_response of [
    () => new Response(""),
    () => new Response("Blocked by ArgusSecurityPlugin Sign Invalid"),
    () => Response.json({ status_code: 0 }),
    () => Response.json({ status_code: 4, aweme_list: [] }),
    () => new Response("", { status: 403 }),
  ]) {
    body = make_response;
    await assert.rejects(run(), /抖音作品接口/);
  }
  body = () => Response.json({ status_code: 0, aweme_list: [] });
  assert.deepEqual(JSON.parse((await run()).output).items, []);
});

test("抖音签名拒绝其它来源、接口和方法，重定向不会携带签名到其它来源", async t => {
  let calls = 0;
  upstream(t, () => {
    calls++;
    return new Response(null, { status: 302, headers: { Location: "https://other.example/" } });
  });
  for (const [url, options, message] of [
    ["https://www-hj.douyin.com/aweme/v1/web/aweme/post/", { douyin_sign: "true" }, /必须为布尔值/],
    ["https://other.example/aweme/v1/web/aweme/post/", { douyin_sign: true }, /抖音签名只允许/],
    ["https://www-hj.douyin.com/other", { douyin_sign: true }, /抖音签名只允许/],
    ["https://www-hj.douyin.com/aweme/v1/web/aweme/post/", { douyin_sign: true, method: "POST" }, /抖音签名只允许/],
  ]) {
    const probe = `export const route = { name: 'probe', path: '/probe', example: '/probe',
      handler: ctx => ctx.fetchText(${JSON.stringify(url)}, ${JSON.stringify(options)}) };`;
    const metadata = await compile_script_module(probe);
    assert.equal(metadata.error, "");
    await assert.rejects(execute_script(probe, metadata.metadata, null), message);
  }
  assert.equal(calls, 0);
  await assert.rejects(run(), /抖音签名只允许/);
  assert.equal(calls, 1);
});
