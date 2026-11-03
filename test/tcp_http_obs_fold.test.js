import assert from "node:assert/strict";
import test from "node:test";
import { tcp_http_fetch } from "findrss-worker/server/infra/tcp_http.js";

function connect_with(response) {
  return () => {
    const bytes = new TextEncoder().encode(response);
    let sent = false;
    return {
      readable: new ReadableStream({
        pull(controller) {
          if (sent) return controller.close();
          sent = true;
          controller.enqueue(bytes);
        },
      }),
      writable: new WritableStream({ write() {} }),
      opened: Promise.resolve(),
      close: async () => {},
      closed: Promise.resolve(),
    };
  };
}

test("TCP 响应头按 RFC 7230 展开 obs-fold 续行", async () => {
  const response = await tcp_http_fetch("https://example.com/page", {}, connect_with(
    "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Security-Policy: a;\r\n b;\r\n c\r\n" +
    "X-Frame-Options: ALLOW-FROM example.com\r\nContent-Length: 2\r\nConnection: close\r\n\r\nok"));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-security-policy"), "a; b; c");
  assert.equal(response.headers.get("x-frame-options"), "ALLOW-FROM example.com");
  assert.equal(await response.text(), "ok");
});

test("响应头首行就是续行时仍按无效响应拒绝", async () => {
  await assert.rejects(tcp_http_fetch("https://example.com/page", {}, connect_with(
    "HTTP/1.1 200 OK\r\n Content-Security-Policy: a\r\nContent-Length: 2\r\n\r\nok")), error => error.code === "UPSTREAM_INVALID_RESPONSE" && /响应头格式错误/.test(error.message));
});
