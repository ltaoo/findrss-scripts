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
const x_entry = { file: "rss/x.js", path: "/api/rss/x/:username", example: "/api/rss/x/example", format: "rss_json", route_index: 0 };
const x_feed = { title: "Example 的 X 作品", link: "https://x.com/example", items: [
  { id: "x:tweet:1", title: "Post", link: "https://x.com/example/status/1" },
] };
const x_debug = { status: 200, phase: "ok", elapsed_ms: 10, request: {}, lines: [], upstream_requests: [],
  script: { file: "rss/x.js", route_index: 0 }, output: JSON.stringify(x_feed) };

test("X 单次 Debug 执行同时校验产物和保存诊断，仍检查 handler 和非空内容", async t => {
  const root = await mkdtemp(join(tmpdir(), "findrss-x-single-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const requested = [];
  const result = await check_route("https://scripts.example", x_entry, {
    output_dir: join(root, "responses"), details_dir: join(root, "details"), token: "private-token",
    fetch_impl: async (url, options) => {
      requested.push(url.pathname);
      assert.equal(options.headers.Accept, "application/json");
      assert.equal(options.headers.Authorization, "Bearer private-token");
      return Response.json(x_debug);
    },
  });
  assert.deepEqual(requested, ["/debug/api/rss/x/example"]);
  assert.equal(result.output_valid, true);
  assert.equal(result.execution, "debug");
  assert.deepEqual(JSON.parse(await readFile(join(root, "responses", result.output_file))), x_feed);
  const detail = JSON.parse(await readFile(join(root, "details", result.detail_file)));
  assert.deepEqual(detail.debug, x_debug);
  assert.equal(detail.inspection.output_valid, true);
  for (const [debug, error] of [
    [{ ...x_debug, script: { file: "rss/other.js", route_index: 0 } }, /错误的脚本/],
    [{ ...x_debug, script: { file: "rss/x.js", route_index: 1 } }, /错误的 handler/],
    [{ ...x_debug, output: JSON.stringify({ ...x_feed, items: [] }) }, /条目数须 >= 1/],
    [{ ...x_debug, output: undefined }, /缺少脚本输出/],
    [{ ...x_debug, status: 503, code: "UPSTREAM_RATE_LIMITED", upstream_error: "Rate limited" }, /UPSTREAM_RATE_LIMITED/],
  ]) {
    let calls = 0;
    const failed = await check_route("https://scripts.example", x_entry, {
      details_dir: join(root, "details"), fetch_impl: async () => {
        calls++; return Response.json(debug, { status: debug.status });
      },
    });
    assert.equal(calls, 1);
    assert.equal(failed.output_valid, false);
    assert.match(failed.error, error);
  }
});

test("X 串行且间隔五秒，按限流重置时间冷却并仅重试一次，其他脚本保持并发", async t => {
  const details_dir = await mkdtemp(join(tmpdir(), "findrss-x-paced-"));
  t.after(() => rm(details_dir, { recursive: true, force: true }));
  let now = 1800000000000;
  t.mock.method(Date, "now", () => now);
  let x_active = 0, x_peak = 0, active = 0, peak = 0;
  const calls = [], waits = [];
  const ordinary = Array.from({ length: 12 }, (_, index) => ({ ...entry, path: entry.path + index, example: entry.example + index }));
  const report = await check_routes("https://scripts.example", [x_entry, ...ordinary], {
    [x_entry.format + " " + x_entry.path]: [{ example: "/api/rss/x/second" }],
  }, {
    details_dir,
    sleep_impl: async milliseconds => { waits.push(milliseconds); now += milliseconds; },
    fetch_impl: async url => {
      if (!url.pathname.includes("/rss/x/")) {
        active++; peak = Math.max(peak, active);
        await new Promise(resolve => setImmediate(resolve)); active--;
        return url.pathname.startsWith("/debug") ? Response.json({ ...x_debug, script: { file: entry.file } })
          : Response.json(value, { headers });
      }
      calls.push(url.pathname);
      x_active++; x_peak = Math.max(x_peak, x_active);
      await new Promise(resolve => setImmediate(resolve)); x_active--;
      return calls.length === 1 ? Response.json({ ...x_debug, status: 503, code: "UPSTREAM_RATE_LIMITED",
        upstream_requests: [{ status: 429, rate_limit: { "x-rate-limit-remaining": 0, "x-rate-limit-reset": now / 1000 + 20 } }],
      }, { status: 503 }) : Response.json(x_debug);
    },
  });
  assert.equal(x_peak, 1);
  assert.equal(peak, 9);
  assert.deepEqual(waits, [21000, 5000]);
  assert.deepEqual(calls, ["/debug/api/rss/x/example", "/debug/api/rss/x/example", "/debug/api/rss/x/second"]);
  assert.equal(report.failed, 0);
  const [first] = report.results.find(result => result.file === "rss/x.js").samples;
  assert.equal(first.attempts.length, 2);
  assert.equal(first.attempts[0].code, "UPSTREAM_RATE_LIMITED");
});

test("X 永久错误不重试，持续限流至多两次且不按异常重置时间无限等待", async t => {
  const details_dir = await mkdtemp(join(tmpdir(), "findrss-x-retry-"));
  t.after(() => rm(details_dir, { recursive: true, force: true }));
  for (const code of ["UPSTREAM_AUTH_REQUIRED", "UPSTREAM_RATE_LIMITED", "UPSTREAM_TIMEOUT"]) {
    const waits = [];
    let calls = 0;
    const report = await check_routes("https://scripts.example", [x_entry], {}, {
      details_dir, sleep_impl: async milliseconds => waits.push(milliseconds),
      fetch_impl: async () => {
        calls++;
        return Response.json({ ...x_debug, status: 503, code,
          upstream_requests: [{ status: 429, rate_limit: { "x-rate-limit-reset": 9999999999999 } }],
        }, { status: 503 });
      },
    });
    assert.equal(report.failed, 1);
    assert.equal(calls, code === "UPSTREAM_AUTH_REQUIRED" ? 1 : 2);
    assert.equal(waits.length, code === "UPSTREAM_AUTH_REQUIRED" ? 0 : 1);
    assert.ok(waits.every(milliseconds => milliseconds <= 60000));
  }
});

test("Instagram 复用串行冷却队列，单次 Debug 校验产物且仅重试一次限流", async t => {
  const details_dir = await mkdtemp(join(tmpdir(), "findrss-instagram-paced-"));
  t.after(() => rm(details_dir, { recursive: true, force: true }));
  let now = 1800000000000;
  t.mock.method(Date, "now", () => now);
  const instagram_entry = { ...x_entry, file: "rss/instagram.js", path: "/api/rss/instagram/:username", example: "/api/rss/instagram/mrbeast" };
  const feed = { title: "Instagram", link: "https://www.instagram.com/mrbeast/", items: [
    { id: "instagram:post:1", title: "Post", link: "https://www.instagram.com/p/example/" },
  ] };
  const debug = { ...x_debug, script: { file: instagram_entry.file, route_index: 0 }, output: JSON.stringify(feed) };
  const calls = [], waits = [];
  let active = 0, peak = 0;
  const report = await check_routes("https://scripts.example", [instagram_entry], {
    [instagram_entry.format + " " + instagram_entry.path]: [{ example: "/api/rss/instagram/katarinabluu" }],
  }, {
    details_dir,
    sleep_impl: async milliseconds => { waits.push(milliseconds); now += milliseconds; },
    fetch_impl: async url => {
      calls.push(url.pathname);
      active++; peak = Math.max(peak, active);
      await new Promise(resolve => setImmediate(resolve)); active--;
      return calls.length === 1 ? Response.json({ ...debug, status: 503, code: "UPSTREAM_RATE_LIMITED" }, { status: 503 }) : Response.json(debug);
    },
  });
  assert.equal(peak, 1);
  assert.deepEqual(calls, ["/debug/api/rss/instagram/mrbeast", "/debug/api/rss/instagram/mrbeast", "/debug/api/rss/instagram/katarinabluu"]);
  assert.deepEqual(waits, [60000, 5000]);
  assert.equal(report.failed, 0);
  assert.ok(report.results[0].samples.every(sample => sample.execution === "debug" && sample.output_valid));
  const first = report.results[0].samples.find(sample => sample.example === instagram_entry.example);
  assert.equal(first.attempts.length, 2);
  assert.equal(first.attempts[0].code, "UPSTREAM_RATE_LIMITED");
});

test("持续限流只冷却重试一次，其余样本如实标记未检查，其他脚本继续执行", async t => {
  for (const file of ["rss/instagram.js", "rss/x.js"]) for (const debug of [false, true]) {
    await t.test(`${file} debug=${debug}`, async t => {
      const details_dir = await mkdtemp(join(tmpdir(), "findrss-rate-limit-"));
      t.after(() => rm(details_dir, { recursive: true, force: true }));
      let now = 1800000000000;
      t.mock.method(Date, "now", () => now);
      const instagram = { ...x_entry, file: "rss/instagram.js", path: "/api/rss/instagram/:username", example: "/api/rss/instagram/example" };
      const limited = file === instagram.file ? instagram : x_entry;
      const other = file === instagram.file ? x_entry : instagram;
      const calls = [], waits = [], starts = [], finishes = [];
      const report = await check_routes("https://scripts.example", [limited, other, entry], {
        [limited.format + " " + limited.path]: Array.from({ length: 21 }, (_, index) => ({
          name: `Account ${index}`, example: limited.example + index,
        })),
        [other.format + " " + other.path]: [{ example: other.example + "second" }],
      }, {
        ...(debug ? { details_dir } : {}),
        sleep_impl: async milliseconds => { waits.push(milliseconds); now += milliseconds; },
        on_start: item => starts.push(item.example),
        on_result: result => finishes.push(result),
        fetch_impl: async url => {
          calls.push(url.pathname);
          const failed = url.pathname.includes(limited.example);
          const requested = failed ? limited : url.pathname.includes(other.example) ? other : entry;
          if (url.pathname.startsWith("/debug")) return Response.json({
            ...x_debug, script: { file: requested.file, route_index: 0 },
            ...(failed ? { status: 503, code: "UPSTREAM_RATE_LIMITED", upstream_error: "HTTP 429" } : {}),
          }, { status: failed ? 503 : 200 });
          return failed ? Response.json({ code: "UPSTREAM_RATE_LIMITED", message: "HTTP 429" }, { status: 503 })
            : Response.json(requested === entry ? value : x_feed, { headers: { ...headers, "X-FindRSS-Script": requested.file } });
        },
      });
      assert.deepEqual([report.total, report.passed, report.failed], [3, 2, 1]);
      assert.deepEqual(waits, [60000, 5000]);
      assert.deepEqual(calls.filter(path => path.includes(limited.example)), Array(2).fill((debug ? "/debug" : "") + limited.example));
      assert.equal(calls.filter(path => path.includes(other.example)).length, 2);
      const samples = report.results.find(result => result.file === limited.file).samples;
      assert.equal(samples.length, 22);
      const actual = samples.find(sample => sample.example === limited.example);
      assert.equal(actual.code, "UPSTREAM_RATE_LIMITED");
      assert.equal(actual.attempts.length, 2);
      if (debug) {
        const detail = JSON.parse(await readFile(join(details_dir, actual.detail_file), "utf8"));
        assert.equal(detail.debug.status, 503);
        assert.equal(detail.inspection.code, "UPSTREAM_RATE_LIMITED");
      }
      for (const sample of samples.filter(sample => sample !== actual)) {
        assert.equal(sample.skipped, true);
        assert.equal(sample.blocked_by, limited.example);
        assert.equal(sample.code, "INSPECTION_RATE_LIMITED");
        assert.match(sample.error, /本轮未请求此样本/);
        assert.equal(sample.duration_ms, 0);
        assert.ok(sample.name);
        for (const phase of ["request", "response", "format_valid", "output_valid"]) assert.equal(sample[phase], false);
        for (const field of ["status", "attempts", "detail_file", "output_file"]) assert.equal(sample[field], undefined);
      }
      assert.equal(starts.length, 25);
      assert.deepEqual(starts.slice().sort(), finishes.map(result => result.example).sort());
      assert.ok(finishes.every(result => report.results.some(row => (row.samples || [row]).includes(result))));
    });
  }
});

test("超时和限流交替不视为持续限流，后续样本仍请求", async t => {
  for (const codes of [["UPSTREAM_RATE_LIMITED", "UPSTREAM_TIMEOUT"], ["UPSTREAM_TIMEOUT", "UPSTREAM_RATE_LIMITED"], ["UPSTREAM_TIMEOUT", "UPSTREAM_TIMEOUT"]]) {
    await t.test(codes.join(" / "), async t => {
      let now = 1800000000000;
      t.mock.method(Date, "now", () => now);
      let calls = 0;
      const report = await check_routes("https://scripts.example", [x_entry], {
        [x_entry.format + " " + x_entry.path]: [{ example: x_entry.example + "second" }],
      }, {
        sleep_impl: async milliseconds => { now += milliseconds; },
        fetch_impl: async () => {
          const code = codes[calls++];
          return code ? Response.json({ code, message: code }, { status: 503 })
            : Response.json(x_feed, { headers: { ...headers, "X-FindRSS-Script": x_entry.file } });
        },
      });
      assert.equal(calls, 3);
      assert.equal(report.results[0].samples.filter(sample => sample.output_valid).length, 1);
      assert.ok(report.results[0].samples.every(sample => !sample.skipped));
    });
  }
});

test("其他 503 只请求一次，不重试", async () => {
  let calls = 0;
  await run(async () => { calls++; return new Response("unavailable", { status: 503 }); });
  assert.equal(calls, 1);
});

test("巡检先发出 on_start，再为同一槽位发出 on_result", async () => {
  const calls = [];
  await check_routes("https://scripts.example", [entry], {}, {
    fetch_impl: async () => Response.json(value, { headers }),
    on_start: (item, worker) => calls.push(["start", worker, item.example]),
    on_result: (result, worker) => calls.push(["result", worker, result.example]),
  });
  assert.deepEqual(calls, [["start", 0, entry.example], ["result", 0, entry.example]]);
});

test("默认巡检使用脚本实例名称，同地址配置合并名称和校验规则且只请求一次", async () => {
  const named = { ...entry, example_name: "默认作者" };
  const options = { fetch_impl: async () => Response.json(value, { headers }) };
  const report = await check_routes("https://scripts.example", [named], {}, options);
  assert.equal(report.results[0].name, "默认作者");
  const overridden = await check_routes("https://scripts.example", [named], {
    [entry.format + " " + entry.path]: { name: "指定作者", example: entry.example },
  }, options);
  assert.equal(overridden.results[0].name, "指定作者");
  const requested = [];
  const merged = await check_routes("https://scripts.example", [named], {
    [entry.format + " " + entry.path]: [{ example: "https://scripts.example" + entry.example, min_items: 2 }],
  }, { fetch_impl: async url => { requested.push(url.href); return Response.json(value, { headers }); } });
  assert.deepEqual(requested, ["https://scripts.example" + entry.example]);
  assert.equal(merged.results[0].name, "默认作者");
  assert.equal(merged.results[0].output_valid, false);
  assert.match(merged.results[0].error, /条目数须 >= 2/);
  assert.equal(merged.results[0].samples, undefined);
});

test("平台通用资源超限页不能断定 CPU 超限，普通 503 不误判", async () => {
  for (const [body, code] of [
    ["<title>Worker exceeded resource limits | scripts.example | Cloudflare</title>", "EXCEEDED_RESOURCES"],
    ["<h1>Error 1102</h1>", "EXCEEDED_RESOURCES"],
    ["<p>Worker exceeded CPU time limit</p>", "EXCEEDED_CPU"],
  ]) {
    const result = await run(async () => new Response(body,
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }));
    assert.equal(result.code, code);
    assert.match(result.error, new RegExp(code));
    if (code === "EXCEEDED_RESOURCES") assert.match(result.error, /需查看 Workers Logs 确认/);
  }
  const plain = await run(async () => new Response("Service unavailable",
    { status: 503, headers: { "Content-Type": "text/html" } }));
  assert.equal(plain.code, undefined);
  assert.equal(plain.error, "HTTP 503");
});

test("Debug 超限、超时、旧版 HTML 和无效 JSON 均保存详情，普通巡检结果保持独立", async t => {
  const details_dir = await mkdtemp(join(tmpdir(), "findrss-debug-capture-"));
  t.after(() => rm(details_dir, { recursive: true, force: true }));
  for (const [name, debug_response, error] of [
    ["resources", () => new Response("<h1>Error 1102</h1>", { status: 503, headers: { "Content-Type": "text/html" } }), /资源超限/],
    ["timeout", () => { throw new DOMException("timeout", "TimeoutError"); }, /超时/],
    ["old", () => new Response("Debug HTML", { headers: { "Content-Type": "text/html" } }), /Worker 已更新/],
    ["invalid", () => new Response("{", { headers: { "Content-Type": "application/json" } }), /无效 JSON/],
    ["shape", () => Response.json({ title: "ordinary output" }), /无效的诊断结构/],
  ]) {
    let calls = 0;
    const result = await check_route("https://scripts.example", { ...entry, example: "/api/hot/" + name }, {
      details_dir, token: "private-token", fetch_impl: async (url, options) => {
        calls++;
        assert.equal(options.redirect, "manual");
        assert.equal(options.headers.Authorization, "Bearer private-token");
        if (url.pathname.startsWith("/debug/")) {
          assert.equal(options.headers.Accept, "application/json");
          return debug_response();
        }
        return Response.json(value, { headers });
      },
    });
    assert.equal(calls, 2);
    assert.equal(result.output_valid, true);
    const detail = JSON.parse(await readFile(join(details_dir, result.detail_file), "utf8"));
    assert.equal(detail.debug, null);
    assert.match(detail.debug_request.error, error);
    assert.equal(detail.inspection.output_valid, true);
    if (name === "resources") assert.equal(detail.debug_request.code, "EXCEEDED_RESOURCES");
    assert.doesNotMatch(JSON.stringify(detail), /private-token/);
  }
});

test("Debug 详情按查询参数分文件且不能跨站发送令牌", async t => {
  const details_dir = await mkdtemp(join(tmpdir(), "findrss-debug-samples-"));
  t.after(() => rm(details_dir, { recursive: true, force: true }));
  const files = [];
  for (const query of ["?page=1&token=private-query", "?page=2&token=private-query"]) {
    const result = await check_route("https://scripts.example", { ...entry, example: "/api/hot/example" + query }, {
      details_dir, fetch_impl: async () => new Response("unavailable", { status: 503 }),
    });
    files.push(result.detail_file);
    const detail = await readFile(join(details_dir, result.detail_file), "utf8");
    assert.doesNotMatch(result.detail_file + detail, /private-query/);
    assert.equal(JSON.parse(detail).inspection.status, 503);
  }
  assert.notEqual(files[0], files[1]);
  const result = await check_route("https://scripts.example", { ...entry, example: "https://other.example/private" }, {
    details_dir, token: "private-token", fetch_impl: () => assert.fail("不能跨站请求"),
  });
  const detail = JSON.parse(await readFile(join(details_dir, result.detail_file), "utf8"));
  assert.match(detail.debug_request.error, /禁止跨站发送令牌/);
});

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
    const result = await check_route("https://scripts.example", { ...entry, format, example }, {
      output_dir,
      fetch_impl: async () => new Response(body, { headers: { ...headers, "Content-Type": content_type } }),
    });
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

test("配置样本追加到默认 example 并聚合结果，未配置路由继续使用默认样本", async () => {
  const requested = [];
  const completed = [];
  const report = await check_routes("https://scripts.example", [entry, { ...entry, path: "/default", example: "/default" }], {
    [entry.format + " " + entry.path]: [
      { name: "正常账号", example: "/configured/passed" }, { name: "失败账号", example: "/configured/failed" },
    ],
  }, {
    fetch_impl: async url => {
      requested.push(url.pathname);
      return url.pathname.endsWith("failed") ? new Response("Unavailable", { status: 503 }) : Response.json(value, { headers });
    },
    on_result: result => completed.push(result),
  });
  assert.deepEqual(requested.sort(), [entry.example, "/configured/failed", "/configured/passed", "/default"].sort());
  assert.equal(completed.length, 4);
  assert.deepEqual([report.total, report.passed, report.failed], [2, 1, 1]);
  const result = report.results.find(result => result.path === entry.path);
  assert.equal(result.samples.length, 3);
  assert.deepEqual([result.request, result.response, result.format_valid, result.output_valid], [false, false, false, false]);
  assert.equal(result.error, "失败账号 /configured/failed: HTTP 503");
  assert.deepEqual(result.samples.filter(sample => sample.name).map(sample => sample.name), ["失败账号", "正常账号"]);
  assert.equal(result.samples.find(sample => sample.example === entry.example).output_valid, true);
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
    { [key]: [{ name: " " }] }, { [key]: [{ name: 42 }] },
    { [key]: [{ example: "/valid" }, { example: "https://other.example/private" }] },
    { [key]: [{ example: "https://other.example" + entry.example }] },
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
  assert.equal(report.results[0].samples.length, 3);
  const samples = report.results[0].samples.filter(sample => sample.example.includes("?"));
  assert.equal(new Set(samples.map(sample => sample.output_file)).size, 2);
  for (const sample of samples) {
    assert.match(sample.output_file, /^api\/hot\/example\.[a-f0-9]{16}\.json$/);
    const body = JSON.parse(await readFile(join(output_dir, sample.output_file), "utf8"));
    assert.equal(body.title, "Page " + new URL(sample.example, "https://scripts.example").searchParams.get("page"));
  }
});

test("仓库配置覆盖社交账号和剧集的具名样本", async () => {
  const config = JSON.parse(await readFile(new URL("../.github/route-checks.json", import.meta.url), "utf8"));
  const cases = JSON.parse(await readFile(new URL("../dist/routes.json", import.meta.url), "utf8"));
  const configured = cases.filter(entry => Object.hasOwn(config, entry.format + " " + entry.path));
  assert.equal(configured.length, 15);
  assert.deepEqual(new Set(configured.map(entry => entry.file)), new Set([
    "rss/wxmp.js", "rss/wxchannels.js", "rss/zhihu.js", "rss/youtube.js", "rss/instagram.js",
    "rss/weibo.js", "rss/xiaohongshu.js", "rss/x.js", "rss/bilibili.js",
    "rss/youku.js", "rss/iqiyi.js", "rss/vqq.js", "rss/mgtv.js",
  ]));
  const account_routes = {
    "/api/rss/zhihu/people/:user/answers": /^\/api\/rss\/zhihu\/people\/[A-Za-z0-9_-]+\/answers$/,
    "/api/rss/youtube/:handle": /^\/api\/rss\/youtube\/@[A-Za-z0-9_.-]+\?detail=1$/,
    "/api/rss/youtube/:handle/shorts": /^\/api\/rss\/youtube\/@[A-Za-z0-9_.-]+\/shorts\?detail=1$/,
    "/api/rss/instagram/:username": /^\/api\/rss\/instagram\/[A-Za-z0-9_.]+$/,
    "/api/rss/weibo/u/:uid": /^\/api\/rss\/weibo\/u\/[0-9]+$/,
    "/api/rss/xiaohongshu/user/profile/:uid": /^\/api\/rss\/xiaohongshu\/user\/profile\/[a-f0-9]{24}$/,
    "/api/rss/x/:username": /^\/api\/rss\/x\/[A-Za-z0-9_]{1,15}$/,
    "/api/rss/bilibili/:userid/dynamic": /^\/api\/rss\/bilibili\/[0-9]+\/dynamic$/,
    "/api/rss/bilibili/:userid/upload/video": /^\/api\/rss\/bilibili\/[0-9]+\/upload\/video$/,
  };
  for (const [path, pattern] of Object.entries(account_routes)) {
    const samples = config["rss_json " + path];
    const expected_count = { "/api/rss/instagram/:username": 22, "/api/rss/zhihu/people/:user/answers": 19,
      "/api/rss/bilibili/:userid/dynamic": 21, "/api/rss/bilibili/:userid/upload/video": 21 }[path] ?? 20;
    assert.equal(samples.length, expected_count, path);
    assert.equal(new Set(samples.map(sample => sample.example.toLowerCase())).size, expected_count, path);
    assert.ok(samples.every(sample => sample.name?.trim() && pattern.test(sample.example)), path);
  }
  const requested = [];
  const report = await check_routes("https://scripts.example", configured, config, {
    sleep_impl: async () => {},
    fetch_impl: async url => { requested.push(url.pathname + url.search); return new Response("Unavailable", { status: 503 }); },
  });
  const examples = [...new Set([...configured.map(entry => entry.example), ...Object.values(config).flat().map(sample => sample.example)])];
  assert.deepEqual(requested.sort(), examples.sort());
  assert.equal(new Set(requested).size, examples.length);
  assert.equal(requested.filter(path => path.startsWith("/api/rss/wxchannels/")).length,
    examples.filter(path => path.startsWith("/api/rss/wxchannels/")).length);
  assert.ok(requested.filter(path => path.startsWith("/api/rss/wxmp/")).length > 2);
  assert.ok(requested.every(path => /^\/api\/rss\/wxmp\/[A-Za-z0-9_-]+$/.test(path) || !path.startsWith("/api/rss/wxmp/")));
  assert.ok(requested.includes("/api/rss/wxmp/gh_2d5b35dfb4f3"));
  assert.ok(!requested.includes("/api/rss/wxmp/gh_240fbf8b33e4"));
  assert.ok(requested.includes("/api/rss/wxmp/gh_e59ba9dfaa66"));
  assert.ok(config["rss_json /api/rss/wxmp/:account?"].every(sample => sample.name?.trim()));
  assert.ok(requested.includes("/api/rss/zhihu/people/li-hai-yang-14-43/answers"));
  assert.ok(requested.every(path => !path.includes("wxchannels:")));
  assert.deepEqual([report.total, report.failed], [15, 15]);
  assert.equal(report.results.reduce((count, result) => count + (result.samples?.length ?? 1), 0), examples.length);
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
