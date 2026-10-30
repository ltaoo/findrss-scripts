import { Buffer } from "node:buffer";
import { decrypt_cookie_push } from "../.runtime/findrss-worker/server/infra/cookie_push.js";
import { error_code, error_response, script_error } from "./errors.js";
import { request_authenticated } from "./auth.js";

const max_bytes = 2 * 1024 * 1024;
const encoder = new TextEncoder();
const matches = (host, domain) => host === domain || host.endsWith("." + domain);
const domain_name = value => {
  if (typeof value !== "string") throw script_error("COOKIE_SYNC_INVALID");
  const domain = value.toLowerCase().replace(/^\*\.|^\./, "");
  if (!/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(domain) || domain.length > 253) throw script_error("COOKIE_SYNC_INVALID");
  return domain;
};
const cookie_matches = (cookie, host) => cookie.hostOnly ? host === domain_name(cookie.domain) : matches(host, domain_name(cookie.domain));

export function validate_cookies(cookies) {
  if (!Array.isArray(cookies)) throw script_error("COOKIE_SYNC_INVALID");
  const named = cookies.filter(cookie => !(typeof cookie?.name === "string" && !cookie.name.trim()));
  if (cookies.length && !named.length) throw script_error("COOKIE_SYNC_INVALID");
  for (const cookie of named) {
    if (!cookie || typeof cookie.name !== "string" || !cookie.name || /[\s\x00-\x1f\x7f()<>@,;:\\"/\[\]?={}]/.test(cookie.name) ||
        typeof cookie.value !== "string" || /[\x00-\x1f\x7f;]/.test(cookie.value) ||
        cookie.path !== undefined && (typeof cookie.path !== "string" || !cookie.path.startsWith("/") || /[\x00-\x1f\x7f]/.test(cookie.path)) ||
        ["secure", "hostOnly"].some(key => cookie[key] !== undefined && typeof cookie[key] !== "boolean") ||
        cookie.expirationDate !== undefined && (!Number.isFinite(cookie.expirationDate) || cookie.expirationDate < 0)) {
      throw script_error("COOKIE_SYNC_INVALID");
    }
    domain_name(cookie.domain);
  }
  return named;
}

async function storage_key(env) {
  if (!env.COOKIE_KV || !/^[0-9a-f]{64}$/i.test(env.COOKIE_STORAGE_KEY || "")) throw script_error("COOKIE_STORAGE_UNAVAILABLE");
  return crypto.subtle.importKey("raw", Buffer.from(env.COOKIE_STORAGE_KEY, "hex"), "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function seal(key, origin, record) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: encoder.encode(origin) }, key, encoder.encode(JSON.stringify(record)));
  return JSON.stringify({ version: 1, iv: Buffer.from(iv).toString("base64"), data: Buffer.from(data).toString("base64") });
}

async function open_record(key, origin, record) {
  if (record?.version !== 1 || typeof record.iv !== "string" || typeof record.data !== "string") throw script_error("COOKIE_STORAGE_UNAVAILABLE");
  const iv = Buffer.from(record.iv, "base64");
  if (iv.length !== 12) throw script_error("COOKIE_STORAGE_UNAVAILABLE");
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv, additionalData: encoder.encode(origin) }, key, Buffer.from(record.data, "base64"));
  const value = JSON.parse(new TextDecoder().decode(plaintext));
  value.cookies = validate_cookies(value.cookies);
  return value;
}

export async function load_browser_session(env, origin) {
  if (!env.COOKIE_KV) return null;
  try {
    const record = await env.COOKIE_KV.get("browser-session:" + origin, { type: "json" });
    return record === null ? null : await open_record(await storage_key(env), origin, record);
  } catch { throw script_error("COOKIE_STORAGE_UNAVAILABLE"); }
}

export async function save_browser_session(env, origin, session) {
  try {
    await env.COOKIE_KV.put("browser-session:" + origin, await seal(await storage_key(env), origin, session));
  } catch { throw script_error("COOKIE_STORAGE_UNAVAILABLE"); }
}

export async function read_json_body(request, invalid_code = "INVALID_PARAMETER") {
  if (request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw script_error("UNSUPPORTED_MEDIA_TYPE");
  if (Number(request.headers.get("Content-Length")) > max_bytes) throw script_error("PAYLOAD_TOO_LARGE");
  const reader = request.body?.getReader();
  if (!reader) throw script_error(invalid_code);
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max_bytes) throw script_error("PAYLOAD_TOO_LARGE");
      chunks.push(value);
    }
  } finally { await reader.cancel().catch(() => {}); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw script_error(invalid_code); }
}

export async function update_cookies(request, env, origins, headers) {
  try {
    const body = await read_json_body(request, "COOKIE_SYNC_INVALID");
    const crypto_type = body?.crypto_type === undefined ? "none" : typeof body.crypto_type === "string" ? body.crypto_type.trim().toLowerCase() : "";
    if (!body || !["none", "legacy", "aes-128-cbc-fixed", "aes-256-cbc"].includes(crypto_type)) throw script_error("COOKIE_SYNC_INVALID");
    if (crypto_type === "none" && !request_authenticated(request, env.ACCESS_TOKEN)) throw script_error("COOKIE_SYNC_ENCRYPTION_REQUIRED");
    if (crypto_type !== "none") {
      if (!env.COOKIE_PUSH_UUID || !/^[0-9a-f]{16}$/i.test(env.COOKIE_PUSH_KEY || "")) throw script_error("CONFIG_INVALID");
      if (typeof body.uuid !== "string" || body.uuid.trim() !== env.COOKIE_PUSH_UUID) throw script_error("COOKIE_SYNC_UUID_MISMATCH");
    }
    const key = await storage_key(env);
    let cookies;
    try { cookies = await decrypt_cookie_push(body, env.COOKIE_PUSH_UUID, env.COOKIE_PUSH_KEY); }
    catch { throw script_error(crypto_type === "none" ? "COOKIE_SYNC_INVALID" : "COOKIE_SYNC_DECRYPT_FAILED"); }
    const received = cookies.length;
    cookies = validate_cookies(cookies);
    const skipped = received - cookies.length;
    if (body.domains !== undefined && (!Array.isArray(body.domains) || !body.domains.length || body.domains.length > 100)) throw script_error("COOKIE_SYNC_INVALID");
    const domains = (body.domains ?? cookies.map(cookie => cookie.domain)).map(value => value === "*" ? "*" : domain_name(value));
    const selected = origins.filter(origin => domains.some(domain => domain === "*" || matches(new URL(origin).hostname, domain)));
    if (!selected.length) throw script_error("COOKIE_SYNC_INVALID");
    const now = Date.now() / 1000;
    const accepted = new Set();
    // shortcut: 同一站点按最后完成的上传覆盖；多端并发同步时需要增加版本协调。
    try {
      await Promise.all(selected.map(async origin => {
        const scoped = cookies.filter(cookie => cookie_matches(cookie, new URL(origin).hostname) && (!cookie.expirationDate || cookie.expirationDate > now));
        scoped.forEach(cookie => accepted.add(cookie));
        const record = await seal(key, origin, { cookies: scoped, update_time: body.update_time || new Date().toISOString() });
        await env.COOKIE_KV.put("cookies:" + origin, record);
      }));
    } catch { throw script_error("COOKIE_STORAGE_UNAVAILABLE"); }
    return Response.json({ updated: true, count: accepted.size, skipped, action: "done", code: 0, msg: "成功",
      data: { count: accepted.size, skipped } }, { headers });
  } catch (error) {
    return error_response(error_code(error), headers);
  }
}

export async function load_cookies(env, permissions, fallback) {
  const origins = [...new Set((permissions?.cookies || []).map(permission => permission.origin))];
  if (!env.COOKIE_KV || !origins.length) return fallback;
  try {
    const key = await storage_key(env);
    const snapshots = await Promise.all(origins.map(async origin => {
      const record = await env.COOKIE_KV.get("cookies:" + origin, { type: "json", cacheTtl: 60 });
      return { origin, cookies: record === null ? null : (await open_record(key, origin, record)).cookies };
    }));
    const found = snapshots.filter(snapshot => snapshot.cookies !== null);
    const cookies = fallback.filter(cookie => !found.some(snapshot => cookie_matches(cookie, new URL(snapshot.origin).hostname)))
      .concat(found.flatMap(snapshot => snapshot.cookies));
    return [...new Map(cookies.map(cookie => [JSON.stringify([cookie.domain, cookie.path || "/", cookie.name, !!cookie.hostOnly]), cookie])).values()];
  } catch { throw script_error("COOKIE_STORAGE_UNAVAILABLE"); }
}
