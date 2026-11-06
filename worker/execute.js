import { execute_script } from "../.runtime/findrss-worker/server/infra/script_sandbox.js";
import { script_config_value } from "../.runtime/findrss-worker/server/lib/script_config.js";
import { create_puppeteer_navigate } from "../.runtime/findrss-worker/server/infra/script_puppeteer.js";
import { WorkerCookieAccess } from "./cookies.js";
import { load_cookies, validate_cookies } from "./cookie_sync.js";
import { create_browser_session } from "./browser_session.js";
import { script_error } from "./errors.js";

export function script_configuration(entry, env, debugging = false) {
  try {
    const config = JSON.parse(env.SCRIPT_CONFIG || "{}");
    const fallback = validate_cookies(JSON.parse(env.SCRIPT_COOKIES || "[]"));
    if (!config || typeof config !== "object" || Array.isArray(config)) throw script_error("CONFIG_INVALID");
    const metadata = { ...entry.script.metadata, ...entry.script.metadata.routes[entry.route_index],
      config: Object.hasOwn(config, entry.file) ? config[entry.file] : {},
      ...(debugging ? { debug: true, debug_request: true } : {}) };
    metadata.config = script_config_value(metadata.config_schema, metadata.config);
    return { metadata, fallback };
  } catch (error) { throw script_error("CONFIG_INVALID", error.message); }
}

export async function execute_route(entry, context, env, { metadata, fallback }, signal, timing = null) {
  let browser_session;
  let invoked = false;
  let stage = "cookies";
  try {
    timing?.mark("Cookie 与浏览器状态读取");
    const cookies = await load_cookies(env, metadata.permissions, fallback);
    browser_session = await create_browser_session(env, metadata, cookies);
    timing?.mark("宿主能力准备");
    const invoke = env.DEVICE_BRIDGE_URL ? async spec => {
      invoked = true;
      const response = await fetch(env.DEVICE_BRIDGE_URL, { method: "POST", signal,
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + (env.DEVICE_BRIDGE_TOKEN || "") },
        body: JSON.stringify(spec) });
      if (!response.ok) throw script_error("DEVICE_UNAVAILABLE");
      return response.json();
    } : null;
    const cookie_access = new WorkerCookieAccess({ permissions: metadata.permissions,
      cookies: () => browser_session.cookies, assert_grant: () => {} });
    const navigate = env.BROWSER ? create_puppeteer_navigate(env.BROWSER, undefined, browser_session.navigation)
      : async () => { throw script_error("SOURCE_UNAVAILABLE"); };
    stage = "script";
    timing?.mark("沙箱排队");
    const result = await execute_script(entry.script.source, metadata, invoke, {
      method: context.method, pathname: context.pathname, params: context.params,
      query: context.query, public_origin: context.public_origin,
    }, [], "", cookie_access, signal, navigate, undefined, timing);
    timing?.mark("浏览器状态保存");
    await browser_session.commit(signal);
    if (metadata.debug_request && browser_session.navigation) {
      result.lines.push({ level: "info", text: "浏览器验证缓存：" + JSON.stringify(browser_session.stats) });
    }
    return { result, invoked };
  } catch (error) {
    timing?.mark("失败后浏览器清理");
    await browser_session?.discard();
    error.invoked = invoked;
    error.execution_stage = stage;
    throw error;
  }
}
