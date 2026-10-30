import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { check_route, check_routes, check_output, parse_response } from "../scripts/route_checks.js";

const entry = { file: "hot/example.js", path: "/api/hot/example", example: "/api/hot/example", format: "hot", route_index: 0, source_host: "example.com" };
const value = { kind: "hot_rank", title: "Example", link: "https://example.com", entries: [{ id: "example:1", title: "Article", link: "https://example.com/1", rank: null, pinned: false, heat: { value: null, unit: "积分", text: "" } }] };
const headers = { "Content-Type": "application/json", "X-FindRSS-Script": entry.file, "X-FindRSS-Route": "0" };
const run = fetch_impl => check_route("https://scripts.example", entry, { fetch_impl });

test("2xx 原始回包按实际路径单独保存，校验失败也保留，HTTP 失败不保存", async t => {
  const output_dir = await mkdtemp(join(tmpdir(), "findrss-route-output-"));
  t.after(() => rm(output_dir, { recursive: true, force: true }));
  const cases = [
    ["hot", "/api/hot/example", JSON.stringify(value), "application/json", "api/hot/example.json"],
    ["rss", "/rss/github/org/repo/release", "<rss>invalid</rss>", "application/rss+xml", "rss/github/org/repo/release.xml"],
    ["atom", "/atom/github/org/repo/release", "<feed/>", "application/atom+xml", "atom/github/org/repo/release.xml"],
    ["html", "/chapter/123", "<p>正文</p>", "text/html", "chapter/123.html"],
    ["image", "/img/apple?url=https%3A%2F%2Fexample.com%2Fsecret.webp", Buffer.from("89504e470d0a1a0a", "hex"), "image/png", "img/apple.f48d0ae19bc540c3.png"],
    ["hot", "/empty/", "", "application/json", "empty/index.json"],
  ];
  for (const [format, example, body, content_type, output_file] of cases) {
    const report = await check_routes("https://scripts.example", [{ ...entry, format }], {
      [format + " " + entry.path]: { example },
    }, {
      output_dir,
      fetch_impl: async () => new Response(body, { headers: { ...headers, "Content-Type": content_type } }),
    });
    const result = report.results[0];
    assert.equal(result.output_file, output_file);
    assert.deepEqual(await readFile(join(output_dir, output_file)), Buffer.from(body));
    if (format === "rss" || example === "/empty/") assert.equal(result.output_valid, false);
  }
  for (const status of [302, 403, 503]) {
    const result = await check_route("https://scripts.example", { ...entry, example: "/failure/" + status }, {
      output_dir, fetch_impl: async () => new Response("failure", { status }),
    });
    assert.equal(result.output_file, undefined);
  }
  assert.ok(!(await readdir(output_dir)).includes("failure"));
});

test("同一路由检查多个配置样本并聚合结果，未配置路由继续使用默认样本", async () => {
  const requested = [];
  const completed = [];
  const report = await check_routes("https://scripts.example", [entry, { ...entry, path: "/default", example: "/default" }], {
    [entry.format + " " + entry.path]: [
      { example: "/configured/passed" }, { example: "/configured/failed" },
    ],
  }, {
    fetch_impl: async url => {
      requested.push(url.pathname);
      return url.pathname.endsWith("failed") ? new Response("Unavailable", { status: 503 }) : Response.json(value, { headers });
    },
    on_result: result => completed.push(result),
  });
  assert.deepEqual(requested.sort(), ["/configured/failed", "/configured/passed", "/default"]);
  assert.equal(completed.length, 3);
  assert.deepEqual([report.total, report.passed, report.failed], [2, 1, 1]);
  const result = report.results.find(result => result.path === entry.path);
  assert.equal(result.samples.length, 2);
  assert.deepEqual([result.request, result.response, result.format_valid, result.output_valid], [false, false, false, false]);
  assert.equal(result.error, "/configured/failed: HTTP 503");
  assert.ok(result.samples.some(sample => sample.output_valid));
  const passed = await check_routes("https://scripts.example", [entry], {
    [entry.format + " " + entry.path]: [{ example: "/a" }, { example: "/b" }],
  }, { fetch_impl: async () => Response.json(value, { headers }) });
  assert.deepEqual([passed.total, passed.passed, passed.failed], [1, 1, 0]);
  assert.equal(passed.results[0].error, undefined);
});

test("配置错误或样本跨站时，开始请求之前拒绝整轮巡检", async () => {
  const key = entry.format + " " + entry.path;
  const invalid = [null, [], { [key]: [] }, { [key]: [null] }, { [key]: [{ skip: true }] },
    { [key]: [{ min_items: -1 }] }, { [key]: [{ example: " " }] },
    { [key]: [{ example: "/valid" }, { example: "https://other.example/private" }] },
    { [key]: [{ example: "https://user:password@scripts.example/private" }] }];
  for (const config of invalid) {
    await assert.rejects(check_routes("https://scripts.example", [entry], config, {
      fetch_impl: () => assert.fail("配置无效不得发请求"),
    }));
  }
});

test("多个样本仅查询参数不同时正文分别保存，不覆盖或暴露查询参数", async t => {
  const output_dir = await mkdtemp(join(tmpdir(), "findrss-query-output-"));
  t.after(() => rm(output_dir, { recursive: true, force: true }));
  const report = await check_routes("https://scripts.example", [entry], {
    [entry.format + " " + entry.path]: [{ example: entry.path + "?page=1" }, { example: entry.path + "?page=2" }],
  }, {
    output_dir, fetch_impl: async url => Response.json({ ...value, title: "Page " + url.searchParams.get("page") }, { headers }),
  });
  const samples = report.results[0].samples;
  assert.equal(new Set(samples.map(sample => sample.output_file)).size, 2);
  for (const sample of samples) {
    assert.match(sample.output_file, /^api\/hot\/example\.[a-f0-9]{16}\.json$/);
    const body = JSON.parse(await readFile(join(output_dir, sample.output_file), "utf8"));
    assert.equal(body.title, "Page " + new URL(sample.example, "https://scripts.example").searchParams.get("page"));
  }
});

test("仓库配置为公众号、视频号的 /api/rss 路由提供指定账号", async () => {
  const config = JSON.parse(await readFile(new URL("../.github/route-checks.json", import.meta.url), "utf8"));
  const cases = JSON.parse(await readFile(new URL("../dist/routes.json", import.meta.url), "utf8"));
  const configured = cases.filter(entry => Object.hasOwn(config, entry.format + " " + entry.path));
  assert.equal(configured.length, 2);
  assert.deepEqual(new Set(configured.map(entry => entry.file)), new Set(["rss/wxmp.js", "rss/wxchannels.js"]));
  const requested = [];
  const report = await check_routes("https://scripts.example", configured, config, {
    fetch_impl: async url => { requested.push(url.pathname); return new Response("Unavailable", { status: 503 }); },
  });
  const accounts = ["wow36kr", "zhihuribao",
    "v2_060000231003b20faec8cae78a11cad6c60de534b077b38fc3c765c3562a72901dd04b8a97b6@finder",
    "v2_060000231003b20faec8c5e08f1dc1d2cf05ea31b07722e73306573f943932c0da84674c5483@finder"];
  assert.deepEqual(requested.sort(), accounts.map((account, index) =>
    `/api/rss/${index < 2 ? "wxmp" : "wxchannels"}/${account}`).sort());
  assert.deepEqual([report.total, report.failed], [2, 2]);
  assert.ok(report.results.every(result => result.samples.length === 2));
});

test("巡检逐级区分请求失败、空响应、错误格式和错误内容", async () => {
  const cases = [
    [async () => { throw new Error("Timeout"); }, [false, false, false, false]],
    [async () => new Response("Bad gateway", { status: 502 }), [false, false, false, false]],
    [async () => new Response(""), [true, false, false, false]],
    [async () => new Response("<html>Login</html>", { headers }), [true, true, false, false]],
    [async () => Response.json({ ...value, entries: [] }, { headers }), [true, true, true, false]],
    [async () => Response.json(value, { headers }), [true, true, true, true]],
  ];
  for (const [fetch_impl, expected] of cases) {
    const result = await run(fetch_impl);
    assert.deepEqual([result.request, result.response, result.format_valid, result.output_valid], expected, result.error);
  }
});

test("巡检报告保留服务端业务码和描述", async () => {
  const result = await run(async () => Response.json({
    error: "COOKIE_REQUIRED", code: "COOKIE_REQUIRED", message: "缺少可用 Cookie", file: entry.file,
  }, { status: 503 }));
  assert.equal(result.request, false);
  assert.equal(result.output_valid, false);
  assert.equal(result.code, "COOKIE_REQUIRED");
  assert.equal(result.error, "HTTP 503: COOKIE_REQUIRED: 缺少可用 Cookie");
});

test("巡检拒绝重复 ID、无效热度、错误来源及错误 handler", async () => {
  assert.throws(() => check_output(entry, { ...value, entries: [value.entries[0], value.entries[0]] }), /ID/);
  assert.throws(() => check_output(entry, { ...value, link: "https://other.example" }), /来源/);
  assert.throws(() => check_output(entry, { ...value, entries: [{ ...value.entries[0], heat: { value: -1 } }] }), /热度/);
  const result = await run(async () => Response.json(value, { headers: { ...headers, "X-FindRSS-Route": "1" } }));
  assert.equal(result.format_valid, true);
  assert.equal(result.output_valid, false);
});

test("巡检校验 XML、图片魔数、HTML 正文和 Detect 不完整状态", () => {
  assert.throws(() => parse_response({ format: "rss" }, "application/rss+xml", Buffer.from("<rss><bad></rss>")));
  assert.throws(() => parse_response({ format: "image" }, "image/png", Buffer.from("<html>Login</html>")), /图片/);
  assert.throws(() => check_output({ format: "html" }, "<p>请先登录</p>"), /登录/);
  assert.throws(() => check_output({ format: "detect" }, { title: "Example", link: "https://example.com", status: "inconclusive" }), /状态/);
});

test("巡检覆盖 URL 不得跨站发送令牌，重定向不会视为成功", async () => {
  const result = await check_route("https://scripts.example", { ...entry, example: "//other.example/private" }, {
    token: "private-token", fetch_impl: () => assert.fail("不得出网"),
  });
  assert.equal(result.request, false);
  assert.match(result.error, /跨站/);
  const redirected = await run(async (url, options) => {
    assert.equal(options.redirect, "manual");
    return Response.redirect("https://other.example", 302);
  });
  assert.equal(redirected.output_valid, false);
  assert.equal(redirected.error, "HTTP 302");
});

test("批量巡检遇错仍检查全部路由，不允许跳过或拼错覆盖项", async () => {
  let requests = 0;
  const cases = Array.from({ length: 7 }, (_, index) => ({ ...entry, path: entry.path + index }));
  const report = await check_routes("https://scripts.example", cases, {}, {
    fetch_impl: async () => {
      requests++;
      return requests === 1 ? new Response("Unavailable", { status: 503 }) : Response.json(value, { headers });
    },
  });
  assert.equal(requests, 7);
  assert.equal(report.total, 7);
  assert.equal(report.failed, 1);
  assert.equal(report.passed, 6);
  await assert.rejects(check_routes("https://scripts.example", cases, { "hot /unknown": {} }), /未知路由/);
  await assert.rejects(check_routes("https://scripts.example", cases, { ["hot " + cases[0].path]: { skip: true } }), /未知巡检配置/);
});

test("批量巡检最多并发 10 条，失败后仍完整检查且不重复请求", async () => {
  const cases = Array.from({ length: 23 }, (_, index) => ({
    ...entry, path: entry.path + index, example: entry.example + index,
  }));
  const requested = [];
  const completed = [];
  let active = 0;
  let peak = 0;
  const report = await check_routes("https://scripts.example", cases, {}, {
    fetch_impl: async url => {
      requested.push(url.pathname);
      active++;
      peak = Math.max(peak, active);
      await new Promise(resolve => setImmediate(resolve));
      active--;
      return url.pathname === cases[0].example
        ? new Response("Unavailable", { status: 503 })
        : Response.json(value, { headers });
    },
    on_result: result => completed.push(result),
  });
  assert.equal(peak, 10);
  assert.equal(active, 0);
  assert.equal(requested.length, cases.length);
  assert.deepEqual(new Set(requested), new Set(cases.map(item => item.example)));
  assert.equal(report.total, cases.length);
  assert.equal(report.passed, cases.length - 1);
  assert.equal(report.failed, 1);
  assert.equal(completed.length, cases.length);
  assert.deepEqual(report.results.map(result => result.path), cases.map(item => item.path).sort());
});
