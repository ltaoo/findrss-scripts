import worker from "../../worker/index.js";

export function feed_environment(env = {}) {
  const values = new Map();
  const messages = [];
  const bucket = {
    values,
    async get(key) {
      const value = values.get(key);
      return value ? { ...value, async json() { return JSON.parse(value.text); } } : null;
    },
    async head(key) { return values.get(key) || null; },
    async put(key, text, options = {}) {
      const previous = values.get(key);
      if (options.onlyIf?.etagDoesNotMatch === "*" && previous ||
        options.onlyIf?.etagMatches && options.onlyIf.etagMatches !== previous?.etag) return null;
      const value = { key, text, etag: crypto.randomUUID(), customMetadata: options.customMetadata || {} };
      values.set(key, value);
      return value;
    },
    async delete(keys) { for (const key of Array.isArray(keys) ? keys : [keys]) values.delete(key); },
    async list({ prefix, cursor = "0", limit = 100 }) {
      const all = [...values.values()].filter(value => value.key.startsWith(prefix)).sort((left, right) => left.key.localeCompare(right.key));
      const start = Number(cursor);
      const objects = all.slice(start, start + limit);
      return { objects, truncated: start + limit < all.length, cursor: String(start + limit) };
    },
  };
  const result = { ...env, FEED_SNAPSHOTS: bucket, FEED_QUEUE: { messages,
    async send(body) { messages.push(structuredClone(body)); } } };
  return result;
}

export async function consume_feed(env, body = env.FEED_QUEUE.messages.shift(), attempts = 1, queue = "findrss-script-feeds") {
  const state = { acked: false, retried: false };
  await worker.queue({ queue, messages: [{ body, attempts, ack() { state.acked = true; }, retry(options) { state.retried = options; } }] }, env);
  return state;
}

// 普通入口测试仍验证最终业务结果，队列协议由 feed_snapshots.test.js 单独覆盖。
export async function completed_feed_request(request, env = {}) {
  const bindings = feed_environment(env);
  const body = request.body ? await request.arrayBuffer() : undefined;
  const fresh_request = () => new Request(request.url, { method: request.method, headers: request.headers, body });
  const response = await worker.fetch(fresh_request(), bindings);
  if (response.status !== 503 || (await response.clone().json().catch(() => null))?.code !== "FEED_GENERATING") return response;
  await consume_feed(bindings);
  return worker.fetch(fresh_request(), bindings);
}
