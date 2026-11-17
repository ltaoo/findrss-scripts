import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { read_script } from "./support/script_sources.js";
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
const home = readFileSync(new URL("./fixtures/douyin/home.html", import.meta.url), "utf8");
const sdk_urls = [
  "https://p-pc-weboff.byteimg.com/tos-cn-i-9r5gewecjs/bdms_1.0.1.19_fix.js",
  "https://lf-security.bytegoofy.com/obj/security-secsdk/runtime_bundler_34.js",
];
const names = compiled.metadata.permissions.cookies[0].names;
const grant = () => new ScriptCookieAccess({
  permissions: compiled.metadata.permissions, assert_grant() {},
  cookies: () => [...names, "unrelated-secret"].map(name => ({
    name, value: "fixture-" + name, domain: ".douyin.com", path: "/", secure: true,
  })),
});

test("同一签名持续复用，上游拒绝后换签并重试一次，调试保留两次请求", async t => {
  const urls = [];
  upstream(t, url => {
    urls.push(url.href);
    return urls.length === 2
      ? new Response("Blocked by ArgusSecurityPlugin Sign Invalid", { status: 403 })
      : Response.json(response);
  });
  await run({ count: "7" });
  const retried = await run({ count: "7" });
  assert.equal(urls.length, 3);
  assert.equal(urls[0], urls[1]);
  assert.notEqual(urls[1], urls[2]);
  assert.deepEqual(retried.upstream_requests.map(entry => entry.status), [403, 200]);
  assert.equal(JSON.parse(retried.output).items.length, fixture.expected_ids.length);
});

test("持续拒绝最多重试一次；登录、普通拒绝和限流不会触发重签重试", async t => {
  const urls = [];
  let make_response = () => new Response("Blocked by ArgusSecurityPlugin Sign Invalid");
  upstream(t, url => { urls.push(url.href); return make_response(); });
  await assert.rejects(run({ count: "9" }), /抖音作品接口/);
  assert.equal(urls.length, 2);
  urls.length = 0;
  for (const status of [401, 403, 429]) {
    make_response = () => new Response("Forbidden", { status });
    await assert.rejects(run({ count: "8" }), /抖音作品接口/);
  }
  assert.equal(urls.length, 3);
  assert.ok(urls.every(url => url === urls[0]));
});
const run = (query = {}, params = { sec_uid }, access = grant()) => execute_script(
  source, { ...compiled.metadata, debug: true }, null,
  { method: "GET", pathname: "/douyin/user/" + sec_uid, params, query }, [], "", access,
);
function upstream(t, handler) {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async (url, options) => {
    if (url === "https://www.douyin.com/") return new Response(home);
    const index = sdk_urls.indexOf(url);
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
