import assert from "node:assert/strict";
import test from "node:test";
import { read_script } from "./support/script_sources.js";
import { compile_script_module, execute_script } from "findrss-worker/server/infra/script_sandbox.js";
import { ScriptCookieAccess } from "findrss-worker/server/infra/script_cookie_access.js";
import { FeedModel } from "findrss-worker/server/domain/feed_format.js";

const sites = {
  avmoo: { name: "Avmoo", origin: "https://avmoo.com", actor_path: "/cn/star/abc123", movie_path: "/cn/movie/movie1", actor_class: "pb-10" },
  javbus: { name: "JavBus", origin: "https://www.javbus.com", actor_path: "/star/abc123", movie_path: "/ABC-123", actor_class: "pb10" },
  javlibrary: { name: "JAVLibrary", origin: "https://www.javlibrary.com", actor_path: "/cn/vl_star.php?s=abc123&mode=2&page=1", movie_path: "/cn/?v=movie1" },
};
const page = (key, cards) => key === "javlibrary"
  ? '<html><head><title>演员甲 - JAVLibrary</title></head><body><div id="rightcolumn"><div class="boxtitle">演员甲的影片</div><div class="videothumblist">' + cards + '</div></div></body></html>'
  : '<html><head><title>演员甲</title></head><body><div class="avatar-box"><span class="' + sites[key].actor_class + '">演员甲</span></div><div id="waterfall">' + cards + '</div></body></html>';
const card = (key, { id = "movie1", code = "ABC-123", date = "2026-10-20", title = "作品 &amp; 测试", image = true } = {}) => {
  if (key === "javlibrary") return '<div class="video" id="vid_' + id + '"><a href="./?v=' + id + '"><div class="id">' + code +
    '</div><div class="title">' + title + '</div>' + (image ? '<img data-src="//cdn.example/cover.jpg">' : "") + '</a></div>';
  return '<div class="item"><a class="movie-box" href="' + (key === "avmoo" ? '/cn/movie/' + id : '/' + code) + '">' +
    (image ? '<img src="//cdn.example/cover.jpg" title="' + title + '">' : "") +
    '<div class="photo-info"><span>' + title + '<br><date>' + code + '</date>' +
    (date ? ' / <date>' + date + '</date>' : "") + '</span></div></a></div>';
};
const invalid_response = error => error.problem?.code === "UPSTREAM_INVALID_RESPONSE";

for (const [key, site] of Object.entries(sites)) {
  const source = read_script("rss/" + key + ".js");
  const compiled = await compile_script_module(source);
  assert.equal(compiled.error, "", key);
  const run = async ({ id = "abc123", query = {}, use_cookies = false, access = null, user_agent } = {}) => {
    const config = { use_cookies, ...(user_agent ? { user_agent } : {}) };
    const result = await execute_script(source, { ...compiled.metadata, config }, null, {
      method: "GET", pathname: "/" + key + "/star/" + id, params: { id }, query,
    }, [], "", access);
    return JSON.parse(result.output);
  };
  const mock = (t, fetch) => {
    const previous = globalThis.fetch;
    t.after(() => { globalThis.fetch = previous; });
    globalThis.fetch = fetch;
  };

  test(key + "：真实 QuickJS 编译、作品解析、稳定 ID、去重和 RSS/Atom 输出", async t => {
    assert.equal(compiled.metadata.kind, "rss");
    assert.equal(compiled.metadata.platform.name, site.name);
    assert.equal(compiled.metadata.routes[0].path, "/" + key + "/star/:id");
    let calls = 0;
    mock(t, async (url, options) => {
      calls++;
      assert.equal(url, site.origin + site.actor_path);
      assert.equal(new Headers(options.headers).get("referer"), site.origin + "/");
      assert.equal(new Headers(options.headers).has("cookie"), false);
      return new Response(page(key, card(key) + card(key)));
    });
    const feed = await run();
    assert.equal(calls, 1);
    assert.equal(feed.title, "演员甲 - " + site.name + " 作品");
    assert.equal(feed.author.name, "演员甲");
    assert.equal(feed.items.length, 1);
    const item = feed.items[0];
    assert.equal(item.id, key + ":movie:" + (key === "javbus" ? "ABC-123" : "movie1"));
    assert.equal(item.title, "ABC-123 作品 & 测试");
    assert.equal(item.link, site.origin + site.movie_path);
    assert.equal(item.image, "https://cdn.example/cover.jpg");
    assert.match(item.content, /作品 &amp; 测试/);
    assert.match(item.content, /data-n="movie-cover"/);
    if (key === "javlibrary") assert.equal(item.published, undefined);
    else assert.equal(item.published, "2026-10-20T00:00:00.000Z");
    for (const format of ["rss", "atom"]) {
      const xml = FeedModel.fromValue(feed).render(format);
      assert.match(xml, /ABC-123/);
      assert.doesNotMatch(xml, /undefined|NaN/);
    }
  });

  test(key + "：指定页码、缺封面/日期、合法空列表", async t => {
    mock(t, async url => {
      assert.equal(url, site.origin + (key === "javlibrary"
        ? site.actor_path.replace("page=1", "page=2") : site.actor_path + "/2"));
      return new Response(page(key, card(key, { date: "", image: false })));
    });
    const feed = await run({ query: { page: "2" } });
    assert.equal(feed.items.length, 1);
    assert.equal(feed.items[0].image, undefined);
    assert.equal(feed.items[0].published, undefined);
    mock(t, async () => new Response(page(key, "")));
    assert.deepEqual((await run()).items, []);
  });

  test(key + "：非法演员 ID 和页码在请求前拒绝", async t => {
    mock(t, async () => assert.fail("非法参数不应请求站点"));
    for (const id of ["", "../other", "x?y", "a/b", "x#y", "x".repeat(33)]) {
      await assert.rejects(run({ id }), error => error.problem?.code === "INVALID_PARAMETER");
    }
    for (const value of ["0", "-1", "1.5", "2x", "10000", "01", ""]) {
      await assert.rejects(run({ query: { page: value } }), error => error.problem?.code === "INVALID_PARAMETER");
    }
  });

  test(key + "：HTTP 错误、验证页和结构变化不会伪装成空列表", async t => {
    for (const [status, code] of [[403, "UPSTREAM_ACCESS_DENIED"], [429, "UPSTREAM_RATE_LIMITED"], [404, "UPSTREAM_FETCH_FAILED"]]) {
      mock(t, async () => new Response("Unavailable", { status }));
      await assert.rejects(run(), error => error.problem?.code === code);
    }
    for (const title of ["Just a moment...", "Age Verification", "Attention Required"]) {
      mock(t, async () => new Response("<html><title>" + title + "</title></html>"));
      await assert.rejects(run(), error => error.problem?.code === "UPSTREAM_AUTH_REQUIRED");
    }
    for (const html of ["<html><title>Sign in</title></html>", page(key, card(key, { code: "" }))]) {
      mock(t, async () => new Response(html));
      await assert.rejects(run(), invalid_response);
    }
    mock(t, async () => new Response(page(key, '<div class="changed-card">ABC-123 作品</div>')));
    await assert.rejects(run(), invalid_response);
    mock(t, async () => new Response(page(key, "空的列表")));
    assert.deepEqual((await run()).items, []);
  });

  test(key + "：Cookie 只通过宿主授权句柄发送，撤销授权后停止", async t => {
    let granted = true;
    const access = new ScriptCookieAccess({
      permissions: compiled.metadata.permissions,
      assert_grant() { if (!granted) throw new Error("授权已撤销"); },
      cookies: () => [{ name: "PHPSESSID", value: "fixture-session", domain: new URL(site.origin).hostname, path: "/", secure: true }],
    });
    mock(t, async (url, options) => {
      assert.equal(new Headers(options.headers).get("cookie"), "PHPSESSID=fixture-session");
      return new Response(page(key, card(key)));
    });
    assert.equal((await run({ use_cookies: true, access })).items.length, 1);
    granted = false;
    mock(t, async () => assert.fail("撤销授权后不应请求站点"));
    await assert.rejects(run({ use_cookies: true, access }), /授权已撤销/);
  });

  test(key + "：拒绝危险封面/外部详情链接，HTML 正确转义", async t => {
    for (const html of [
      page(key, card(key).replace("//cdn.example/cover.jpg", "javascript:alert(1)")),
      page(key, card(key).replace(key === "javlibrary" ? "./?v=movie1" : site.movie_path, "https://evil.example/" + site.movie_path)),
    ]) {
      mock(t, async () => new Response(html));
      await assert.rejects(run(), invalid_response);
    }
    mock(t, async () => new Response(page(key, card(key, { title: "&lt;script&gt;alert(1)&lt;/script&gt;" }))));
    assert.doesNotMatch((await run()).items[0].content, /<script>/);
  });

  if (key === "javbus") {
    test("javbus：传递社区公开的三个 Cookie，无需登录会话", async t => {
      const access = new ScriptCookieAccess({
        permissions: compiled.metadata.permissions, assert_grant() {},
        cookies: () => [
          { name: "dv", value: "1" }, { name: "existmag", value: "all" }, { name: "age", value: "verified" },
        ].map(cookie => ({ ...cookie, domain: "www.javbus.com", path: "/", secure: true })),
      });
      mock(t, async (url, options) => {
        assert.equal(new Headers(options.headers).get("cookie"), "dv=1; existmag=all; age=verified");
        return new Response(page(key, card(key)));
      });
      assert.equal((await run({ use_cookies: true, access })).items.length, 1);
    });
  }

  if (key === "javlibrary") {
    test("javlibrary：请求携带 Cookie 对应的浏览器 User-Agent", async t => {
      const access = new ScriptCookieAccess({
        permissions: compiled.metadata.permissions, assert_grant() {},
        cookies: () => [{ name: "cf_clearance", value: "fixture-clearance", domain: "www.javlibrary.com", path: "/", secure: true }],
      });
      mock(t, async (url, options) => {
        const headers = new Headers(options.headers);
        assert.equal(headers.get("user-agent"), "FixtureBrowser/1.0");
        assert.equal(headers.get("cookie"), "cf_clearance=fixture-clearance");
        return new Response(page(key, card(key)));
      });
      assert.equal((await run({ use_cookies: true, user_agent: "FixtureBrowser/1.0", access })).items.length, 1);
    });
  }

  if (key !== "javlibrary") {
    test(key + "：按发行日期排序且不接受不存在的日期", async t => {
      mock(t, async () => new Response(page(key,
        card(key, { id: "older", code: "ABC-100", date: "2026-10-01" }) +
        card(key, { id: "newer", code: "ABC-200", date: "2026-10-22" }))));
      assert.match((await run()).items[0].title, /^ABC-200/);
      mock(t, async () => new Response(page(key, card(key, { date: "2026-02-31" }))));
      await assert.rejects(run(), invalid_response);
    });
  }
}
