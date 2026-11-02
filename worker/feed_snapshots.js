import { FeedModel } from "../.runtime/findrss-worker/server/domain/feed_format.js";
import { error_code, error_response, script_error } from "./errors.js";

export const dead_letter_queue = "findrss-script-feeds-dlq";
const refresh_ms = 10 * 60 * 1000;
const lease_ms = 5 * 60 * 1000;
const consume_timeout_ms = 120000;
const request_prefix = "feed-requests/";
const snapshot_prefix = "feed-snapshots/";
const pending_prefix = "feed-pending/";
const self_url = "https://findrss.invalid/snapshot-self";
const content_types = { rss: "application/rss+xml; charset=utf-8", atom: "application/atom+xml; charset=utf-8",
  rss_json: "application/json; charset=utf-8" };

function snapshot_bindings(env) {
  if (!env.FEED_QUEUE || !env.FEED_SNAPSHOTS) throw script_error("SNAPSHOT_UNAVAILABLE");
  return env.FEED_SNAPSHOTS;
}

async function snapshot_key(entry, metadata, context) {
  const sorted = value => Object.entries(value).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0);
  const input = JSON.stringify([1, entry.file, entry.route_index, entry.script.source, metadata.config,
    context.public_origin, context.method, sorted(context.params), sorted(context.query)]);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, "0")).join("");
}

async function read_snapshot(bucket, key) {
  const object = await bucket.get(snapshot_prefix + key);
  return object ? object.json() : null;
}

async function clear_pending(bucket, key, queued_at) {
  const object = await bucket.get(pending_prefix + key);
  if (object && (await object.json()).queued_at === queued_at) await bucket.delete(pending_prefix + key);
}

function message_task(message) {
  const { key, queued_at } = message.body || {};
  return typeof key === "string" && /^[a-f0-9]{64}$/.test(key) && Number.isSafeInteger(queued_at) && queued_at > 0
    ? { key, queued_at } : null;
}

export async function execute_snapshot(job, timeout_ms = consume_timeout_ms) {
  // 只依赖 AbortSignal 时，忽略中止信号的等待会拖到队列 15 分钟上限；这里同时结束等待。
  const controller = new AbortController();
  let timer;
  try {
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        const error = script_error("UPSTREAM_TIMEOUT");
        controller.abort(error);
        reject(error);
      }, timeout_ms);
    });
    return await Promise.race([job.execute(controller.signal), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

async function enqueue_snapshot(env, key, descriptor) {
  const bucket = snapshot_bindings(env);
  const previous = await bucket.get(pending_prefix + key);
  const queued_at = Date.now();
  if (previous && queued_at - (await previous.json()).queued_at < lease_ms) return;
  // R2 条件写入让多个请求共同占用一个刷新任务；过期租约允许恢复丢失的任务。
  const claimed = await bucket.put(pending_prefix + key, JSON.stringify({ queued_at }), {
    onlyIf: previous ? { etagMatches: previous.etag } : { etagDoesNotMatch: "*" },
  });
  if (!claimed) return;
  try {
    if (descriptor) await bucket.put(request_prefix + key, JSON.stringify(descriptor));
    await env.FEED_QUEUE.send({ key, queued_at });
  } catch (error) {
    await clear_pending(bucket, key, queued_at);
    throw error;
  }
}

export async function snapshot_response(entry, metadata, context, env, url, headers) {
  try {
    const bucket = snapshot_bindings(env);
    const key = await snapshot_key(entry, metadata, context);
    const snapshot = await read_snapshot(bucket, key);
    const stale = !snapshot || Date.now() - snapshot.attempted_at >= refresh_ms;
    if (stale) {
      const declared_path = entry.script.metadata.routes[entry.route_index].path;
      const prefix = entry.path.slice(0, entry.path.length - declared_path.length);
      const descriptor = { file: entry.file, route_index: entry.route_index, context: {
        method: context.method, pathname: url.pathname.slice(prefix.length), params: context.params,
        query: context.query, public_origin: context.public_origin,
      } };
      try { await enqueue_snapshot(env, key, descriptor); }
      catch (error) {
        if (!snapshot?.formats) throw error;
        console.error(JSON.stringify({ stage: "snapshot_enqueue", code: error_code(error), file: entry.file }));
      }
    }
    if (snapshot?.formats) {
      const escaped_url = url.href.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[char]));
      const body = snapshot.formats[entry.format];
      return new Response(entry.format === "rss_json" ? body : body.replaceAll(self_url, escaped_url), {
        headers: { ...headers, "Content-Type": content_types[entry.format],
          "X-FindRSS-Cache": stale || snapshot.error ? "stale" : "hit",
          "X-FindRSS-Updated-At": new Date(snapshot.updated_at).toISOString() },
      });
    }
    if (snapshot?.error) return new Response(snapshot.error.body, {
      status: snapshot.error.status, headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
    });
    return error_response("FEED_GENERATING", { ...headers, "Retry-After": "5", "X-FindRSS-Cache": "pending" }, entry.file);
  } catch (error) {
    console.error(JSON.stringify({ stage: "snapshot_read", code: error_code(error), file: entry.file }));
    return error_response("SNAPSHOT_UNAVAILABLE", headers, entry.file);
  }
}

export async function consume_snapshots(batch, env, resolve, { timeout_ms = consume_timeout_ms } = {}) {
  // shortcut: 按 max_concurrency: 1 顺序发布快照；提高并发前需增加同任务的发布互斥。
  const bucket = snapshot_bindings(env);
  for (const message of batch.messages) {
    const task = message_task(message);
    if (!task) {
      message.ack();
      continue;
    }
    const { key, queued_at } = task;
    try {
      const request = await bucket.get(request_prefix + key);
      if (!request) { message.ack(); continue; }
      const descriptor = await request.json();
      const job = await resolve(descriptor);
      if (!job || await snapshot_key(job.entry, job.configuration.metadata, descriptor.context) !== key) {
        await bucket.delete([request_prefix + key, snapshot_prefix + key]);
        await clear_pending(bucket, key, queued_at);
        message.ack();
        continue;
      }
      const previous = await read_snapshot(bucket, key);
      if (previous?.updated_at >= queued_at) {
        await clear_pending(bucket, key, queued_at);
        message.ack();
        continue;
      }
      let snapshot;
      let retry = false;
      try {
        const { result } = await execute_snapshot(job, timeout_ms);
        const feed = FeedModel(JSON.parse(result.output));
        snapshot = { attempted_at: Date.now(), updated_at: Date.now(), formats: {
          rss_json: result.output, rss: feed.render("rss", { self_url }), atom: feed.render("atom", { self_url }),
        } };
      } catch (error) {
        const code = error_code(error);
        const response = error_response(code, {}, descriptor.file, error);
        snapshot = { ...previous, attempted_at: Date.now(), error: { status: response.status, body: await response.text() } };
        console.error(JSON.stringify({ stage: "snapshot_collect", file: descriptor.file, code }));
        retry = message.attempts < 3 && response.status >= 500;
      }
      await bucket.put(snapshot_prefix + key, JSON.stringify(snapshot), {
        customMetadata: { attempted_at: String(snapshot.attempted_at) },
      });
      if (retry) message.retry({ delaySeconds: 60 });
      else { await clear_pending(bucket, key, queued_at); message.ack(); }
    } catch (error) {
      console.error(JSON.stringify({ stage: "snapshot_consume", code: error_code(error) }));
      message.retry({ delaySeconds: 60 });
    }
  }
}

export async function record_dead_letters(batch, env) {
  let bucket;
  try {
    bucket = snapshot_bindings(env);
  } catch (error) {
    // 没有快照绑定可写，继续投递只会循环失败；直接确认并由日志保留记录。
    console.error(JSON.stringify({ stage: "snapshot_dead_letter", code: error_code(error) }));
    for (const message of batch.messages) message.ack();
    return;
  }
  for (const message of batch.messages) {
    const task = message_task(message);
    if (!task) { message.ack(); continue; }
    const { key, queued_at } = task;
    try {
      const previous = await read_snapshot(bucket, key);
      // 平台重试耗尽不代表采集一定失败，已有成功快照时保留内容，等待下次刷新。
      if (!previous?.formats) {
        const request = await bucket.get(request_prefix + key);
        const descriptor = request ? await request.json() : null;
        const response = error_response("FEED_GENERATION_FAILED", {}, descriptor?.file);
        const attempted_at = Date.now();
        await bucket.put(snapshot_prefix + key, JSON.stringify({
          attempted_at, updated_at: attempted_at,
          error: { status: response.status, body: await response.text() },
        }), { customMetadata: { attempted_at: String(attempted_at) } });
        console.error(JSON.stringify({ stage: "snapshot_dead_letter", file: descriptor?.file }));
      }
      await clear_pending(bucket, key, queued_at);
      message.ack();
    } catch (error) {
      console.error(JSON.stringify({ stage: "snapshot_dead_letter", code: error_code(error) }));
      message.retry({ delaySeconds: 60 });
    }
  }
}

export async function refresh_snapshots(_controller, env) {
  const bucket = snapshot_bindings(env);
  let cursor;
  do {
    const page = await bucket.list({ prefix: request_prefix, limit: 100, ...(cursor ? { cursor } : {}) });
    for (const object of page.objects) {
      const key = object.key.slice(request_prefix.length);
      const snapshot = await bucket.head(snapshot_prefix + key);
      if (!snapshot || Date.now() - Number(snapshot.customMetadata?.attempted_at || 0) >= refresh_ms) {
        await enqueue_snapshot(env, key);
      }
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
}
