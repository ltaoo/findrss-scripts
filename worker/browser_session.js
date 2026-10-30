import { cookie_header } from "../.runtime/findrss-worker/server/infra/rss_cookies.js";
import { load_browser_session, save_browser_session, validate_cookies } from "./cookie_sync.js";
import { script_error } from "./errors.js";

const valid_user_agent = value => typeof value === "string" && value.length > 0 && value.length <= 4096 && !/[\r\n\0]/.test(value);
const cookie_key = cookie => JSON.stringify([cookie.domain.replace(/^(?:\*\.|\.)/, "").toLowerCase(), cookie.path || "/", cookie.name]);
const merge_cookies = (previous, current) => [...new Map([...previous, ...current].map(cookie => [cookie_key(cookie), cookie])).values()];
const unexpired = cookie => !cookie.expirationDate || cookie.expirationDate > Date.now() / 1000;
function matching_partition(cookie, target) {
  if (cookie.partitionKeyOpaque) return false;
  if (!cookie.partitionKey) return true;
  if (cookie.partitionKey.hasCrossSiteAncestor) return false;
  try {
    const site = new URL(typeof cookie.partitionKey === "string" ? cookie.partitionKey : cookie.partitionKey.topLevelSite);
    return !site.username && !site.password && site.pathname === "/" && !site.search && !site.hash &&
      target.protocol === site.protocol && (target.hostname === site.hostname || target.hostname.endsWith("." + site.hostname));
  } catch { return false; }
}

export async function create_browser_session(env, metadata, manual_cookies) {
  const permissions = metadata.permissions?.cookies || [];
  const origins = [...new Set(permissions.map(permission => permission.origin))];
  const snapshots = new Map(await Promise.all(origins.map(async origin => [origin, await load_browser_session(env, origin)])));
  const pending = new Map();
  const closers = [];
  const permission_for = target => permissions.find(permission => target.origin === permission.origin &&
    !target.pathname.includes("%") && (target.pathname === permission.path_prefix ||
      target.pathname.startsWith(permission.path_prefix.endsWith("/") ? permission.path_prefix : permission.path_prefix + "/")));
  const scoped_cookies = (cookies, permission, target) => cookies.filter(cookie => permission.names.includes(cookie.name) &&
    unexpired(cookie) && matching_partition(cookie, target) && cookie_header([cookie], target).length > 0);
  for (const snapshot of snapshots.values()) {
    if (snapshot && !valid_user_agent(snapshot.user_agent)) throw script_error("COOKIE_STORAGE_UNAVAILABLE");
  }
  let cookies = manual_cookies;
  for (const [origin, snapshot] of snapshots) {
    if (!snapshot) continue;
    const allowed_names = new Set(permissions.filter(permission => permission.origin === origin).flatMap(permission => permission.names));
    cookies = merge_cookies(cookies, snapshot.cookies.filter(cookie => unexpired(cookie) && allowed_names.has(cookie.name) &&
      matching_partition(cookie, new URL(origin)) && cookie_header([cookie], new URL(cookie.path || "/", origin)).length > 0));
  }
  const snapshot = origins.length === 1 ? snapshots.get(origins[0]) : null;
  const stats = { cached_state: !!snapshot, browser_launches: 0, browser_reuses: 0 };
  if (snapshot && metadata.config_schema?.properties?.user_agent) {
    metadata.config.user_agent = snapshot.user_agent;
    if (metadata.config_schema.properties.use_cookies && snapshot.cookies.some(unexpired)) metadata.config.use_cookies = true;
  }
  return {
    stats,
    get cookies() { return cookies; },
    navigation: env.COOKIE_KV && origins.length ? {
      async restore(url) {
        const target = new URL(url);
        const permission = permission_for(target);
        if (!permission) return null;
        const saved = snapshots.get(target.origin);
        const user_agent = saved?.user_agent || (metadata.config.use_cookies ? metadata.config.user_agent : undefined);
        return { user_agent: valid_user_agent(user_agent) ? user_agent : undefined,
          ...(typeof saved?.session_id === "string" && /^[A-Za-z0-9_-]{1,256}$/.test(saved.session_id) &&
            Number.isFinite(saved.session_expires_at) ? { session_id: saved.session_id, session_expires_at: saved.session_expires_at } : {}),
          cookies: scoped_cookies(saved || metadata.config.use_cookies ? cookies : [], permission, target).map(cookie => ({
            name: cookie.name, value: cookie.value, path: cookie.path || "/", secure: !!cookie.secure,
            httpOnly: !!cookie.httpOnly, ...(cookie.hostOnly ? { url: target.origin + (cookie.path || "/") } : { domain: cookie.domain }),
            ...(cookie.expirationDate ? { expires: cookie.expirationDate } : {}),
            ...(["Strict", "Lax", "None"].includes(cookie.sameSite) ? { sameSite: cookie.sameSite } : {}),
            ...(cookie.partitionKey ? { partitionKey: cookie.partitionKey } : {}),
          })) };
      },
      async capture({ url, final_url, cookies: captured, user_agent, session_id, session_expires_at, reused, close }) {
        const target = new URL(url);
        const permission = permission_for(target);
        if (!permission || new URL(final_url).origin !== target.origin || permission_for(new URL(final_url)) !== permission) return;
        if (!valid_user_agent(user_agent)) throw script_error("UPSTREAM_INVALID_RESPONSE");
        const selected = captured.filter(cookie => permission.names.includes(cookie.name) && matching_partition(cookie, target)).map(cookie => ({
          name: cookie.name, value: cookie.value, domain: cookie.domain, path: cookie.path || "/",
          secure: !!cookie.secure, httpOnly: !!cookie.httpOnly, hostOnly: !cookie.domain.startsWith("."),
          expirationDate: cookie.expires > 0 ? cookie.expires : 0,
          ...(["Strict", "Lax", "None"].includes(cookie.sameSite) ? { sameSite: cookie.sameSite } : {}),
          ...(cookie.partitionKey ? { partitionKey: cookie.partitionKey } : {}),
        }));
        const verified = scoped_cookies(validate_cookies(selected), permission, target);
        const session = { cookies: verified, user_agent, ...(session_id ? { session_id, session_expires_at } : {}) };
        stats[reused ? "browser_reuses" : "browser_launches"]++;
        if (close) closers.push(close);
        snapshots.set(target.origin, session);
        pending.set(target.origin, session);
        cookies = merge_cookies(cookies, verified);
      },
    } : undefined,
    async commit(signal) {
      signal?.throwIfAborted();
      await Promise.all([...pending].map(([origin, session]) => save_browser_session(env, origin, session)));
    },
    async discard() {
      await Promise.allSettled(closers.map(close => close()));
    },
  };
}
