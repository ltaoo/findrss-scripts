import { script_error } from "./errors.js";

export function create_bypass_navigate(env) {
  let service;
  try { service = new URL(env.BROWSER_BYPASS_URL); } catch { throw script_error("CONFIG_INVALID"); }
  if ((service.protocol !== "https:" && !(service.protocol === "http:" && service.hostname === "127.0.0.1")) ||
      service.username || service.password || service.pathname !== "/" || service.search || service.hash ||
      typeof env.BROWSER_BYPASS_TOKEN !== "string" || !env.BROWSER_BYPASS_TOKEN || /[\r\n\0]/.test(env.BROWSER_BYPASS_TOKEN)) {
    throw script_error("CONFIG_INVALID");
  }
  return async (url, options, evaluate, signal) => {
    let target;
    try { target = new URL(url); } catch { throw script_error("INVALID_PARAMETER"); }
    if (!["https://www.javlibrary.com", "https://ttks.tw"].includes(target.origin) || target.username || target.password ||
        target.href.length > 8192 || evaluate !== undefined) throw script_error("INVALID_PARAMETER");
    const endpoint = new URL("/html", service);
    endpoint.searchParams.set("url", target.href);
    const combined = AbortSignal.any([AbortSignal.timeout(110000), ...(signal ? [signal] : [])]);
    let response;
    try {
      response = await fetch(endpoint, { headers: { "x-auth-token": env.BROWSER_BYPASS_TOKEN }, redirect: "manual", signal: combined });
    } catch {
      combined.throwIfAborted();
      throw script_error("SOURCE_UNAVAILABLE");
    }
    try {
      if (!response.ok) throw script_error("SOURCE_UNAVAILABLE");
      let final_url;
      try { final_url = new URL(response.headers.get("x-cf-bypasser-final-url")); } catch { throw script_error("UPSTREAM_INVALID_RESPONSE"); }
      if (final_url.origin !== target.origin || final_url.username || final_url.password || !response.body) {
        throw script_error("UPSTREAM_INVALID_RESPONSE");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let size = 0, html = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 24 * 1024 * 1024) throw script_error("UPSTREAM_INVALID_RESPONSE");
          html += decoder.decode(value, { stream: true });
        }
        html += decoder.decode();
        if (!html.trim()) throw script_error("UPSTREAM_INVALID_RESPONSE");
        return { html };
      } finally { await reader.cancel().catch(() => {}); }
    } finally {
      if (!response.bodyUsed) await response.body?.cancel().catch(() => {});
    }
  };
}
