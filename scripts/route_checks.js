import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { XMLParser, XMLValidator } from "fast-xml-parser";

const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: false });
const array = value => value === undefined ? [] : Array.isArray(value) ? value : [value];
const text = value => typeof value === "string" ? value : value?.["#text"];
const nonempty = value => typeof value === "string" && value.trim().length > 0;
function http_url(value) {
  const url = new URL(value);
  assert.ok(["http:", "https:"].includes(url.protocol) && !url.username && !url.password, "链接必须是无凭据的 HTTP(S) 地址");
  return url;
}
function items_check(items, minimum) {
  assert.ok(Array.isArray(items) && items.length >= minimum, `条目数须 >= ${minimum}`);
  const ids = new Set();
  for (const item of items) {
    assert.ok(nonempty(item.id) && !ids.has(item.id), "条目 ID 缺失或重复");
    ids.add(item.id);
    assert.ok(nonempty(item.title), "条目标题为空");
    http_url(item.link);
    for (const field of ["published", "updated"]) {
      if (item[field] !== undefined) assert.ok(Number.isFinite(Date.parse(item[field])), "条目日期无效");
    }
  }
}

export function parse_response(entry, content_type, bytes) {
  const body = Buffer.from(bytes).toString("utf8");
  if (["rss", "atom"].includes(entry.format)) {
    assert.match(content_type, entry.format === "rss" ? /^(application\/(rss\+xml|xml)|text\/xml)\b/i : /^(application\/(atom\+xml|xml)|text\/xml)\b/i, "订阅 Content-Type 错误");
    assert.equal(XMLValidator.validate(body), true, "响应 XML 无效");
    const xml = parser.parse(body);
    if (entry.format === "rss") {
      assert.equal(xml.rss?.["@_version"], "2.0", "须为 RSS 2.0");
      const channel = xml.rss.channel;
      assert.ok(channel && typeof channel === "object", "缺少 RSS channel");
      return { title: text(channel.title), link: text(channel.link), items: array(channel.item).map(item => ({
        id: text(item.guid), title: text(item.title), link: text(item.link), published: text(item.pubDate),
      })) };
    }
    const feed = xml.feed;
    assert.equal(feed?.["@_xmlns"], "http://www.w3.org/2005/Atom", "须为 Atom 1.0");
    const link = node => array(node.link).find(link => !link["@_rel"] || link["@_rel"] === "alternate")?.["@_href"];
    return { title: text(feed.title), link: link(feed), items: array(feed.entry).map(item => ({
      id: text(item.id), title: text(item.title), link: link(item), published: text(item.published), updated: text(item.updated),
    })) };
  }
  if (entry.format === "image") {
    assert.match(content_type, /^image\/(png|jpeg|webp|gif|x-icon|vnd.microsoft.icon)\b/i, "图片 Content-Type 错误");
    const buffer = Buffer.from(bytes);
    const type = content_type.split(";")[0].toLowerCase();
    const signature = type === "image/png" ? buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a"
      : type === "image/jpeg" ? buffer.subarray(0, 3).toString("hex") === "ffd8ff"
      : type === "image/gif" ? /^GIF8[79]a/.test(buffer.toString("ascii", 0, 6))
      : type === "image/webp" ? buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP"
      : buffer.subarray(0, 4).toString("hex") === "00000100";
    assert.ok(signature, "图片正文与 Content-Type 不符");
    return buffer;
  }
  if (entry.format === "html") {
    assert.match(content_type, /^text\/html\b/i);
    assert.match(body, /<[a-z][^>]*>/i, "响应没有 HTML 节点");
    return body;
  }
  assert.match(content_type, /^application\/json\b/i, "JSON Content-Type 错误");
  const value = JSON.parse(body);
  assert.ok(value && typeof value === "object" && !Array.isArray(value) && !value.error, "须为成功的 JSON 对象");
  if (entry.format === "hot") assert.ok(value.kind === "hot_rank" && Array.isArray(value.entries), "热榜缺少 kind=hot_rank 或 entries");
  if (entry.format === "clip") assert.ok(value.kind === "clip" && typeof value.html === "string", "剪藏结构错误");
  if (entry.format === "detect") assert.ok(value.kind === "detect" && value.snapshot && Array.isArray(value.changes) && Array.isArray(value.issues), "检测结构错误");
  return value;
}

export function check_output(entry, value) {
  if (entry.format === "image") return;
  if (entry.format === "html") {
    assert.doesNotMatch(value, /captcha|access denied|请先登录|访问验证|滑动验证/i, "正文为验证或登录页面");
    assert.ok(value.replace(/<[^>]*>/g, "").trim().length >= (entry.min_text_length ?? 20), "正文文本过短");
    return;
  }
  assert.ok(nonempty(value.title), "标题为空");
  const link = http_url(value.link);
  if (entry.source_host) {
    const host = entry.source_host.replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "");
    const actual = link.hostname.replace(/^www\./, "");
    assert.ok(actual === host || actual.endsWith("." + host), `来源应为 ${host}，实际为 ${link.hostname}`);
  }
  if (entry.title_includes) assert.ok(value.title.includes(entry.title_includes), "标题不含预期来源文字");
  if (["rss", "atom"].includes(entry.format)) items_check(value.items, entry.min_items ?? 1);
  if (entry.format === "hot") {
    items_check(value.entries, entry.min_items ?? 1);
    for (const item of value.entries) {
      assert.ok(item.rank === null || Number.isInteger(item.rank) && item.rank > 0, "排名须为正整数或 null");
      assert.equal(typeof item.pinned, "boolean", "pinned 须为布尔值");
      assert.ok(item.heat && (item.heat.value === null || Number.isFinite(item.heat.value) && item.heat.value >= 0), "热度须为非负数或 null");
      assert.ok(typeof item.heat.unit === "string" && typeof item.heat.text === "string", "热度文本字段缺失");
    }
  }
  if (entry.format === "clip") assert.ok(value.html.replace(/<[^>]*>/g, "").trim(), "剪藏正文为空");
  if (entry.format === "detect") {
    assert.ok(["initialized", "unchanged", "changed"].includes(value.status), "检测状态未成功或数据不完整");
    const targets = Object.values(value.snapshot);
    assert.ok(targets.length > 0 && targets.every(target => !target.incomplete), "检测快照为空或不完整");
    for (const target of targets) {
      assert.equal(target.present, true, "检测目标不存在");
      if (target.type === "list") assert.ok(target.items.length >= (entry.min_items ?? 1), "检测列表为空");
      else assert.ok(target.value && (typeof target.value !== "string" || target.value.trim()), "检测正文为空");
    }
  }
}

export async function check_route(base, entry, { fetch_impl = fetch, token = "", timeout_ms = 60000, output_dir } = {}) {
  const result = { file: entry.file, path: entry.path, example: entry.example, format: entry.format,
    request: false, response: false, format_valid: false, output_valid: false };
  const started = Date.now();
  try {
    const url = new URL(entry.example, base);
    assert.equal(url.origin, new URL(base).origin, "检查地址必须位于部署站点，禁止跨站发送令牌");
    const response = await fetch_impl(url, { redirect: "manual", signal: AbortSignal.timeout(timeout_ms),
      headers: token ? { Authorization: "Bearer " + token } : {} });
    result.status = response.status;
    result.request = response.ok;
    const reader = response.body?.getReader();
    assert.ok(reader, response.ok ? "响应没有正文流" : "HTTP " + response.status);
    const chunks = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        assert.ok(size <= 24 * 1024 * 1024, "响应超过 24MB");
        chunks.push(value);
      }
    } finally { await reader.cancel().catch(() => {}); }
    const bytes = Buffer.concat(chunks);
    if (!response.ok) {
      let problem;
      try { problem = JSON.parse(bytes.toString("utf8")); } catch {}
      if (typeof problem?.code === "string" && typeof problem?.message === "string") {
        result.code = problem.code;
        throw new Error(`HTTP ${response.status}: ${problem.code}: ${problem.message}`);
      }
      throw new Error("HTTP " + response.status);
    }
    if (output_dir) {
      const content_type = (response.headers.get("Content-Type") || "").split(";")[0].toLowerCase();
      const extension = ["rss", "atom"].includes(entry.format) ? "xml" : entry.format === "html" ? "html"
        : entry.format === "image" ? ({ "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp",
          "image/gif": "gif", "image/x-icon": "ico", "image/vnd.microsoft.icon": "ico" }[content_type] || "bin") : "json";
      const suffix = url.search ? "." + createHash("sha256").update(url.search).digest("hex").slice(0, 16) : "";
      const output_file = url.pathname.replace(/\/$/, "/index").slice(1) + suffix + "." + extension;
      const destination = join(output_dir, output_file);
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, bytes);
      result.output_file = output_file;
    }
    assert.ok(size > 0, "响应正文为空");
    result.response = true;
    const value = parse_response(entry, response.headers.get("Content-Type") || "", bytes);
    result.format_valid = true;
    assert.equal(response.headers.get("X-FindRSS-Script"), entry.file, "命中了错误的脚本");
    assert.equal(response.headers.get("X-FindRSS-Route"), String(entry.route_index), "命中了错误的 handler");
    check_output(entry, value);
    result.output_valid = true;
  } catch (error) { result.error = error.message; }
  result.duration_ms = Date.now() - started;
  return result;
}

export async function check_routes(base, cases, overrides = {}, { on_result = () => {}, ...options } = {}) {
  assert.ok(overrides && typeof overrides === "object" && !Array.isArray(overrides), "巡检配置必须是对象");
  const known = new Set(cases.map(entry => entry.format + " " + entry.path));
  for (const [key, samples] of Object.entries(overrides)) {
    assert.ok(known.has(key), "巡检覆盖配置引用了未知路由：" + key);
    assert.ok(!Array.isArray(samples) || samples.length > 0, "巡检样本数组不能为空：" + key);
    for (const fields of array(samples)) {
      assert.ok(fields && typeof fields === "object" && !Array.isArray(fields), "巡检样本必须是对象");
      for (const [field, value] of Object.entries(fields)) {
        assert.ok(["example", "min_items", "min_text_length", "source_host", "title_includes"].includes(field), "未知巡检配置字段：" + field);
        assert.ok(["min_items", "min_text_length"].includes(field)
          ? Number.isSafeInteger(value) && value >= 0
          : nonempty(value), "无效巡检配置：" + field);
      }
    }
  }
  const queue = cases.flatMap(entry => array(overrides[entry.format + " " + entry.path] ?? {}).map(fields => ({ ...entry, ...fields })));
  for (const entry of queue) {
    const url = new URL(entry.example, base);
    assert.equal(url.origin, new URL(base).origin, "检查地址必须位于部署站点，禁止跨站发送令牌");
    assert.ok(!url.username && !url.password, "检查地址不得包含用户名或密码");
  }
  const results = [];
  await Promise.all(Array.from({ length: 10 }, async () => {
    for (let entry; (entry = queue.shift());) {
      const result = await check_route(base, entry, options);
      results.push(result);
      on_result(result);
    }
  }));
  results.sort((a, b) => (a.file + a.path + a.example).localeCompare(b.file + b.path + b.example));
  const routes = new Map();
  for (const result of results) {
    const key = JSON.stringify([result.file, result.format, result.path]);
    if (!routes.has(key)) routes.set(key, []);
    routes.get(key).push(result);
  }
  const aggregated = [...routes.values()].map(samples => {
    if (samples.length === 1) return samples[0];
    const { file, format, path } = samples[0];
    const result = { file, format, path, samples, duration_ms: samples.reduce((sum, sample) => sum + sample.duration_ms, 0) };
    for (const phase of ["request", "response", "format_valid", "output_valid"]) result[phase] = samples.every(sample => sample[phase]);
    if (!result.output_valid) result.error = samples.filter(sample => !sample.output_valid)
      .map(sample => `${sample.example}: ${sample.error || sample.code || "校验未通过"}`).join("；");
    return result;
  });
  const failed = aggregated.filter(result => !result.output_valid).length;
  return { checked_at: new Date().toISOString(), total: aggregated.length, passed: aggregated.length - failed, failed, results: aggregated };
}
