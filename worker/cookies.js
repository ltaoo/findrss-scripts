import { ScriptCookieAccess } from "../.runtime/findrss-worker/server/infra/script_cookie_access.js";
import { script_error } from "./errors.js";

// 与 cookie_header 的筛选条件保持一致，只用于说明已上传的 Cookie 为何不可用。
function exclusion_reason(cookie, target, now_seconds) {
  const domain = String(cookie.domain || "").replace(/^(?:\*\.|\.)/, "").toLowerCase();
  const hostname = target.hostname.toLowerCase();
  if (!domain) return "缺少域名";
  if (!(hostname === domain || (!cookie.hostOnly && hostname.endsWith("." + domain)))) return "域名不匹配";
  const path = String(cookie.path || "/");
  if (!(target.pathname === path || target.pathname.startsWith(path.endsWith("/") ? path : path + "/"))) return "路径不匹配";
  if (cookie.secure && target.protocol !== "https:") return "仅限 HTTPS";
  const expires = Number(cookie.expirationDate || 0);
  if (expires && expires <= now_seconds) return "已过期";
  return "不可用";
}

function list_names(names, limit = 6) {
  return names.length > limit ? names.slice(0, limit).join("、") + ` 等 ${names.length} 个` : names.join("、");
}

// 只公开权限声明的站点、名称和筛选原因；Cookie 值始终不离开 Worker。
function cookie_required_message(entry, target, cookies) {
  const declared = [...entry.names];
  const matched = cookies.filter(cookie => declared.includes(cookie.name));
  if (matched.length === 0) {
    return `站点 ${entry.origin} 的 Cookie 同步数据中没有权限 ${entry.id} 允许的名称（${list_names(declared)}），请求 ${target.origin + target.pathname.slice(0, 200)} 无法携带 Cookie。请在 Cookie 同步中勾选该站点后重新上传`;
  }
  const reasons = [...new Set(matched.map(cookie => `${cookie.name}（${exclusion_reason(cookie, target, Date.now() / 1000)}）`))];
  return `站点 ${entry.origin} 已同步的 Cookie 无法用于 ${target.origin + target.pathname.slice(0, 200)}（权限 ${entry.id}，路径范围 ${entry.path_prefix}）：${list_names(reasons)}。请检查 Cookie 同步中的域名、路径、Secure 与过期时间`;
}

export class WorkerCookieAccess extends ScriptCookieAccess {
  header(handle, target, derived = {}) {
    const header = super.header(handle, target, derived);
    if (!header) throw script_error("SCRIPT_COOKIE_PERMISSION_REQUIRED", cookie_required_message(this.entry(handle), target, this.cookies()));
    return header;
  }
}
