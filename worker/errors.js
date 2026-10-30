import { FEED_ERRORS } from "../.runtime/findrss-worker/server/lib/feed_error.js";

// 复用生产运行时的业务码；公开描述和 HTTP 状态只在此处维护。
export const ERRORS = Object.freeze({
  ...FEED_ERRORS,
  METHOD_NOT_ALLOWED: [405, "请求方法不受支持，请检查 Allow 响应头"],
  NOT_FOUND: [404, "请求的脚本路由不存在"],
  UNAUTHORIZED: [401, "访问令牌缺失或无效，请通过 Authorization: Bearer 或查询参数 token 提供有效令牌"],
  ACCESS_TOKEN_REQUIRED: [503, "服务端配置了采集凭据，但未配置 ACCESS_TOKEN，已阻止公开访问"],
  CONFIG_INVALID: [503, "服务端脚本配置无效或缺少必填项，请检查 SCRIPT_CONFIG 和 SCRIPT_COOKIES"],
  COOKIE_REQUIRED: [503, "缺少可用于当前请求的 Cookie，请配置该站点的有效登录 Cookie，并检查域名、路径和过期时间"],
  COOKIE_SYNC_INVALID: [400, "Cookie 同步数据无效，请检查数据格式、更新时间及勾选的站点域名"],
  COOKIE_SYNC_DECRYPT_FAILED: [400, "Cookie 同步数据解密失败，请检查加密方式、UUID 和密码"],
  COOKIE_SYNC_ENCRYPTION_REQUIRED: [401, "请在 dm 的 Cookie 同步中选择 AES 加密方式并填写 UUID 和密码，未加密上传需要有效访问令牌（Authorization: Bearer 或查询参数 token）"],
  COOKIE_SYNC_UUID_MISMATCH: [401, "Cookie 上传 UUID 与服务端配置不一致，请使用本机 reports/cookie-sync-setup.json 中的 UUID"],
  COOKIE_STORAGE_UNAVAILABLE: [503, "Cookie 存储暂不可用，请检查 KV 绑定、加密密钥或稍后重试"],
  PAYLOAD_TOO_LARGE: [413, "请求内容不能超过 2MB，请缩小请求体"],
  UNSUPPORTED_MEDIA_TYPE: [415, "请求必须使用 application/json"],
  INVALID_PARAMETER: [400, "请求参数无效，请检查路径参数和查询参数"],
  UPSTREAM_AUTH_REQUIRED: [502, "上游要求登录，Cookie 可能已失效或不完整，请更新登录凭据"],
  UPSTREAM_ACCESS_DENIED: [502, "上游拒绝访问，可能需要额外权限或完成站点验证"],
  UPSTREAM_RATE_LIMITED: [503, "上游请求过于频繁，请降低频率后重试"],
  UPSTREAM_FETCH_FAILED: [502, "访问上游网页或接口失败，请稍后重试"],
  UPSTREAM_TIMEOUT: [504, "上游请求或采集任务超时，请稍后重试"],
  UPSTREAM_INVALID_RESPONSE: [502, "上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段"],
  SOURCE_UNAVAILABLE: [503, "采集来源或所需能力暂不可用，请检查上游服务及浏览器绑定"],
  SCRIPT_OUTPUT_INVALID: [502, "脚本输出不符合当前路由的格式要求，请检查脚本返回值"],
  SCRIPT_FAILED: [502, "脚本执行失败，请结合 Worker 日志排查"],
  REQUEST_ABORTED: [408, "请求已取消，请重新发起请求"],
  INTERNAL_ERROR: [500, "服务内部错误，请结合 Worker 日志排查"],
});

export function script_error(code, message = ERRORS[code][1]) {
  return Object.assign(new Error(message), { name: "FeedError", code });
}

export function error_code(failure) {
  const code = failure?.problem?.code ?? failure?.code;
  // 固定版本沙箱仅透传已知业务码；独立 Worker 中此码表示 Cookie 不可用。
  if (code === "SCRIPT_COOKIE_PERMISSION_REQUIRED") return "COOKIE_REQUIRED";
  if (Object.hasOwn(ERRORS, code)) return code;
  if (failure?.name === "TimeoutError") return "UPSTREAM_TIMEOUT";
  if (failure?.name === "AbortError") return "REQUEST_ABORTED";
  if (failure?.phase === "output") return "SCRIPT_OUTPUT_INVALID";
  return failure?.name === "ScriptError" ? "SCRIPT_FAILED" : "INTERNAL_ERROR";
}

export function error_response(code, headers, file, failure) {
  if (!Object.hasOwn(ERRORS, code)) code = "INTERNAL_ERROR";
  const [status, message] = ERRORS[code];
  // 缺失 Cookie 时保留沙箱给出的站点/名称诊断；其余码继续使用固定描述。
  const detail = code === "COOKIE_REQUIRED" && typeof failure?.problem?.error === "string" ? failure.problem.error : "";
  return Response.json({ error: code, code, message: detail || message, ...(file ? { file } : {}) }, { status, headers });
}
