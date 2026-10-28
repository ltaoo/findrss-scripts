import scripts from "../dist/scripts.js";
import { execute_script } from "../.runtime/findrss-worker/server/infra/script_sandbox.js";
import { RssRoutePatternModel } from "../.runtime/findrss-worker/server/domain/rss_route.js";
import { FeedModel } from "../.runtime/findrss-worker/server/domain/feed_format.js";
import { script_output } from "../.runtime/findrss-worker/server/lib/script_output.js";
import { fetch_script_image } from "../.runtime/findrss-worker/server/infra/image_proxy.js";
import { ScriptCookieAccess } from "../.runtime/findrss-worker/server/infra/script_cookie_access.js";
import { create_puppeteer_navigate } from "../.runtime/findrss-worker/server/infra/script_puppeteer.js";
import { route_cases } from "./catalog.js";

const cases = route_cases(scripts);
const routes = cases.map(entry => ({ ...entry, pattern: RssRoutePatternModel(entry.path),
  script: scripts.find(script => script.file === entry.file) })).sort((a, b) => b.pattern.score - a.pattern.score);
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export default {
  async fetch(request, env) {
    if (request.method !== "GET") return Response.json({ error: "METHOD_NOT_ALLOWED" }, { status: 405, headers: { ...headers, Allow: "GET" } });
    // 配置凭据时必须同时设置令牌，避免将私人订阅或登录态采集开放给公网。
    if ((env.SCRIPT_CONFIG || env.SCRIPT_COOKIES || env.DEVICE_BRIDGE_URL) && !env.ACCESS_TOKEN) {
      return Response.json({ error: "ACCESS_TOKEN_REQUIRED" }, { status: 503, headers });
    }
    if (env.ACCESS_TOKEN && request.headers.get("Authorization") !== "Bearer " + env.ACCESS_TOKEN) {
      return Response.json({ error: "UNAUTHORIZED" }, { status: 401, headers });
    }
    const url = new URL(request.url);
    if (url.pathname === "/health") return Response.json({ ok: true, scripts: scripts.length, routes: cases.length }, { headers });
    if (["/", "/api/routes"].includes(url.pathname)) return Response.json(cases, { headers });
    const entry = routes.find(route => route.pattern.match(url.pathname));
    if (!entry) return Response.json({ error: "NOT_FOUND" }, { status: 404, headers });
    const response_headers = { ...headers, "X-FindRSS-Script": entry.file, "X-FindRSS-Route": String(entry.route_index) };
    try {
      const config = JSON.parse(env.SCRIPT_CONFIG || "{}");
      const cookies = JSON.parse(env.SCRIPT_COOKIES || "[]");
      const metadata = { ...entry.script.metadata, ...entry.script.metadata.routes[entry.route_index], config: config[entry.file] || {} };
      const signal = AbortSignal.any([request.signal, AbortSignal.timeout(120000)]);
      const invoke = env.DEVICE_BRIDGE_URL ? async spec => {
        const response = await fetch(env.DEVICE_BRIDGE_URL, { method: "POST", signal,
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + (env.DEVICE_BRIDGE_TOKEN || "") },
          body: JSON.stringify(spec) });
        if (!response.ok) throw new Error("设备桥接请求失败：HTTP " + response.status);
        return response.json();
      } : null;
      const cookie_access = env.SCRIPT_COOKIES ? new ScriptCookieAccess({ permissions: metadata.permissions,
        cookies: () => cookies, assert_grant: () => {} }) : null;
      const result = await execute_script(entry.script.source, metadata, invoke, {
        method: request.method, pathname: url.pathname, params: entry.pattern.match(url.pathname).params,
        query: Object.fromEntries(url.searchParams), public_origin: new URL(env.FINDRSS_HOSTNAME || url.origin).origin,
      }, [], "", cookie_access, signal, env.BROWSER ? create_puppeteer_navigate(env.BROWSER) : null);
      const value = JSON.parse(result.output);
      if (["rss", "atom"].includes(entry.format)) {
        return new Response(FeedModel(value).render(entry.format, { self_url: url.href }), {
          headers: { ...response_headers, "Content-Type": entry.format === "rss" ? "application/rss+xml; charset=utf-8" : "application/atom+xml; charset=utf-8" },
        });
      }
      const output = script_output(metadata, value);
      if (output.descriptor) {
        const image = await fetch_script_image(metadata, output.descriptor);
        return new Response(image.body, { headers: { ...response_headers, "Content-Type": image.content_type } });
      }
      return new Response(output.body, { headers: { ...response_headers, "Content-Type": output.content_type,
        ...(output.content_type.startsWith("text/html") ? { "Content-Security-Policy": "sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src https: data:" } : {}) } });
    } catch (error) {
      console.error(JSON.stringify({ file: entry.file, route: entry.path, code: error.problem?.code || error.name }));
      return Response.json({ error: error.problem?.code || "SCRIPT_EXECUTION_FAILED", file: entry.file }, { status: 502, headers });
    }
  },
};
