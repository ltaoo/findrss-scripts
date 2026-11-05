import scripts from "../dist/scripts.js";
import { RssRoutePatternModel } from "../.runtime/findrss-worker/server/domain/rss_route.js";
import { script_output } from "../.runtime/findrss-worker/server/lib/script_output.js";
import { fetch_script_image } from "../.runtime/findrss-worker/server/infra/image_proxy.js";
import { route_cases, debug_route_cases } from "./catalog.js";
import { debug_response } from "./debug.js";
import { error_code, error_response, script_error } from "./errors.js";
import { read_json_body, update_cookies } from "./cookie_sync.js";
import { request_authenticated } from "./auth.js";
import { execute_route, script_configuration } from "./execute.js";
import { FeedModel } from "../.runtime/findrss-worker/server/domain/feed_format.js";

const cases = route_cases(scripts);
const routes = cases.map(entry => ({ ...entry, pattern: RssRoutePatternModel(entry.path),
  script: scripts.find(script => script.file === entry.file) })).sort((a, b) => b.pattern.score - a.pattern.score);
const debug_routes = debug_route_cases(scripts).map(entry => ({ ...entry, pattern: RssRoutePatternModel(entry.path),
  script: scripts.find(script => script.file === entry.file) })).sort((a, b) => b.pattern.score - a.pattern.score);
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const cookie_origins = [...new Set(scripts.flatMap(script => (script.metadata.permissions?.cookies || []).map(permission => permission.origin)))];

export default {
  async fetch(request, env) {
    const started_at = Date.now();
    const url = new URL(request.url);
    const query_credential_present = url.searchParams.has("token");
    const authenticated = request_authenticated(request, env.ACCESS_TOKEN);
    url.searchParams.delete("token");
    const debugging = url.pathname === "/debug" || url.pathname.startsWith("/debug/");
    let entry, result;
    let invoked = false;
    let stage = "auth";
    let response_headers = headers;
    const context = { method: request.method, pathname: url.pathname, params: {},
      query: Object.fromEntries(url.searchParams), public_origin: url.origin,
      headers: Object.fromEntries(["Accept", "Content-Type", "User-Agent", "CF-Ray"].flatMap(name =>
        request.headers.has(name) ? [[name, request.headers.get(name)]] : [])),
      authentication: { required: Boolean(env.ACCESS_TOKEN),
        credential_present: request.headers.has("Authorization") || query_credential_present, authenticated } };
    const fail = (code, failure) => debugging
      ? debug_response({ entry, context, stage, started_at, code, failure, result, invoked }, response_headers)
      : error_response(code, response_headers, entry?.file, failure);
    const syncing = url.pathname === "/api/cookies/update";
    const asset_request = ["/", "/index.html"].includes(url.pathname) || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/responses/");
    const methods = syncing ? ["POST"] : debugging || asset_request || ["/health", "/api/routes"].includes(url.pathname) ? ["GET"] : ["GET", "POST"];
    if (!methods.includes(request.method)) {
      response_headers = { ...headers, Allow: methods.join(", ") };
      return fail("METHOD_NOT_ALLOWED");
    }
    if (asset_request) {
      if (url.pathname === "/") url.pathname = "/index.html";
      return env.ASSETS ? env.ASSETS.fetch(new Request(url, request)) : fail("NOT_FOUND");
    }
    // 配置凭据时必须同时设置令牌，避免将私人订阅或登录态采集开放给公网。
    if ((syncing || env.COOKIE_KV || env.SCRIPT_CONFIG || env.SCRIPT_COOKIES || env.DEVICE_BRIDGE_URL) && !env.ACCESS_TOKEN) {
      return fail("ACCESS_TOKEN_REQUIRED");
    }
    if (syncing) return update_cookies(request, env, cookie_origins, headers);
    if (env.ACCESS_TOKEN && !authenticated) {
      return fail("UNAUTHORIZED");
    }
    if (url.pathname === "/health") return Response.json({ ok: true, scripts: scripts.length, routes: cases.length }, { headers });
    if (url.pathname === "/api/routes") return Response.json(cases, { headers });
    stage = "route";
    // /debug 之后可以跟脚本声明路径，也可以跟 /rss、/api/hot 等任一命名空间。
    const pathname = debugging ? url.pathname.slice("/debug".length) : url.pathname;
    entry = debugging ? debug_routes.find(route => route.pattern.match(url.pathname)) : null;
    entry ||= routes.find(route => route.pattern.match(pathname));
    if (!entry) return fail("NOT_FOUND");
    context.params = entry.pattern.match(entry.format === "debug" ? url.pathname : pathname).params;
    response_headers = { ...headers, "X-FindRSS-Script": entry.file, "X-FindRSS-Route": String(entry.route_index) };
    stage = "parameters";
    try {
      if (request.method === "POST") {
        const body = await read_json_body(request);
        if (!body || typeof body !== "object" || Array.isArray(body) || Object.values(body).some(value =>
          value !== null && (!["string", "number", "boolean"].includes(typeof value)
            || typeof value === "number" && !Number.isFinite(value)))) throw script_error("INVALID_PARAMETER");
        context.query = { ...context.query, ...Object.fromEntries(Object.entries(body)
          .filter(([name, value]) => name !== "token" && value !== null).map(([name, value]) => [name, String(value)])) };
        url.search = new URLSearchParams(context.query).toString();
      }
      stage = "config";
      const configuration = script_configuration(entry, env, debugging);
      const { metadata } = configuration;
      const public_url = new URL(env.FINDRSS_HOSTNAME || url.origin);
      if (!["http:", "https:"].includes(public_url.protocol)) throw script_error("CONFIG_INVALID");
      context.public_origin = public_url.origin;
      stage = "script";
      ({ result, invoked } = await execute_route(entry, context, env, configuration,
        AbortSignal.any([request.signal, AbortSignal.timeout(120000)])));
      if (debugging) return debug_response({ entry, context, stage: "ok", started_at, result, invoked }, response_headers);
      stage = "output";
      const value = JSON.parse(result.output);
      if (["rss", "atom", "rss_json"].includes(entry.format)) {
        let feed;
        try { feed = FeedModel(value); } catch (error) { error.phase = "output"; throw error; }
        if (entry.format === "rss_json") {
          return new Response(result.output, { headers: { ...response_headers,
            "Content-Type": "application/json; charset=utf-8" } });
        }
        return new Response(feed.render(entry.format, { self_url: url.href }), {
          headers: { ...response_headers, "Content-Type": FeedModel.content_type(entry.format) } });
      }
      const output = script_output(metadata, value);
      if (output.descriptor) {
        const image = await fetch_script_image(metadata, output.descriptor);
        return new Response(image.body, { headers: { ...response_headers, "Content-Type": image.content_type } });
      }
      return new Response(output.body, { headers: { ...response_headers, "Content-Type": output.content_type,
        ...(output.content_type.startsWith("text/html") ? { "Content-Security-Policy": "sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src https: data:" } : {}) } });
    } catch (error) {
      invoked ||= error.invoked === true;
      if (stage === "script" && error.execution_stage) stage = error.execution_stage;
      const code = stage === "config" ? "CONFIG_INVALID" : error_code(error);
      console.error(JSON.stringify({ file: entry.file, route: entry.path, code }));
      return fail(code, error);
    }
  },
};
