import { script_debug_html } from "../.runtime/findrss-worker/server/infra/script_debug.js";
import { script_failure_fields } from "../.runtime/findrss-worker/server/infra/script_sandbox.js";
import { redact_log_value } from "../.runtime/findrss-worker/server/lib/log_redact.js";
import { ERRORS } from "./errors.js";

export function debug_response({ entry, context, stage, started_at, code, failure, result, invoked }, headers) {
  const [status, message] = code ? ERRORS[code] : [200, ""];
  const fields = failure ? script_failure_fields(failure) : null;
  const metadata = entry?.script.metadata;
  const request = redact_log_value(context);
  // 运行时的通用日志脱敏不包含 API Key；请求字段在进入视图前补齐。
  for (const group of [request.params, request.query, request.headers]) {
    for (const key of Object.keys(group || {})) {
      if (/^(?:api[-_]?key|x-api-key|key|credentials)$/i.test(key)) group[key] = "[redacted]";
    }
  }
  const debug = {
    script: entry ? { file: entry.file, name: entry.name, kind: entry.kind, version: metadata.version,
      path: metadata.routes[entry.route_index].path, request_path: entry.path, route_index: entry.route_index } : {},
    request, phase: stage === "script" && fields ? fields.phase : stage,
    elapsed_ms: Date.now() - started_at, invoked,
    upstream_error: code ? code + ": " + message : "",
    error_text: fields?.error_text || (code ? message : ""),
    lines: fields?.lines || result?.lines || [],
    upstream_requests: failure?.upstream_requests || result?.upstream_requests || [],
    output: result?.output,
  };
  return new Response(script_debug_html(debug, status), { status, headers: { ...headers,
    "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store",
    "Content-Security-Policy": "sandbox; default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    "Referrer-Policy": "no-referrer",
  } });
}
