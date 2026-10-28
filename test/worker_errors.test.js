import assert from "node:assert/strict";
import test from "node:test";
import { ERRORS, error_code, error_response } from "../worker/errors.js";

test("错误分类使用稳定业务码，未知码与沙箱阶段有明确兜底", () => {
  for (const [failure, expected] of [
    [{ problem: { code: "SCRIPT_COOKIE_PERMISSION_REQUIRED" } }, "COOKIE_REQUIRED"],
    [{ problem: { code: "UPSTREAM_TIMEOUT" } }, "UPSTREAM_TIMEOUT"],
    [{ code: "UPSTREAM_FETCH_FAILED" }, "UPSTREAM_FETCH_FAILED"],
    [{ name: "TimeoutError" }, "UPSTREAM_TIMEOUT"],
    [{ name: "AbortError" }, "REQUEST_ABORTED"],
    [{ name: "ScriptError", phase: "output" }, "SCRIPT_OUTPUT_INVALID"],
    [{ name: "ScriptError", problem: { code: "UNKNOWN" } }, "SCRIPT_FAILED"],
    [{ code: "constructor" }, "INTERNAL_ERROR"],
    [null, "INTERNAL_ERROR"],
  ]) assert.equal(error_code(failure), expected);
});

test("错误回包统一包含码和描述，不透传原始错误或凭据", async () => {
  const failure = { problem: { code: "UPSTREAM_INVALID_RESPONSE", error: "sessionid=secret; raw HTML" } };
  const response = error_response(error_code(failure), { "Cache-Control": "no-store" }, "rss/instagram.js");
  assert.equal(response.status, 502);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await response.json(), {
    error: "UPSTREAM_INVALID_RESPONSE", code: "UPSTREAM_INVALID_RESPONSE",
    message: ERRORS.UPSTREAM_INVALID_RESPONSE[1], file: "rss/instagram.js",
  });
  const unknown = error_response("constructor");
  assert.equal(unknown.status, 500);
  assert.equal((await unknown.json()).code, "INTERNAL_ERROR");
});
