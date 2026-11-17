import { newQuickJSAsyncWASMModuleFromVariant, newVariant } from "quickjs-emscripten-core";
import RELEASE_ASYNCIFY from "@jitl/quickjs-wasmfile-release-asyncify";
import wasm_bytes from "../.runtime/findrss-worker/server/infra/quickjs.wasm";
import { get_douyin_signature } from "../.runtime/findrss-worker/server/infra/douyin_sdk.js";

// 独立打包，巡检替换 source/ 时仍能签名；输入只走 stdin，不落盘或写入命令历史。
try {
  let size = 0;
  const chunks = [];
  for await (const chunk of process.stdin) {
    size += chunk.length;
    if (size > 128 * 1024) throw new Error("签名输入过大");
    chunks.push(chunk);
  }
  const request = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  const url = new URL(request.url);
  if (!["https://www.douyin.com", "https://www-hj.douyin.com"].includes(url.origin)
      || url.pathname !== "/aweme/v1/web/aweme/post/" || url.username || url.password || url.hash
      || typeof request.cookie !== "string" || /[\r\n\0]/.test(request.cookie)
      || typeof request.user_agent !== "string" || !request.user_agent || /[\r\n\0]/.test(request.user_agent)) {
    throw new Error("签名参数无效");
  }
  const variant = newVariant(RELEASE_ASYNCIFY, { wasmModule: await WebAssembly.compile(wasm_bytes) });
  const signed = await get_douyin_signature(() => newQuickJSAsyncWASMModuleFromVariant(variant), request);
  console.log(JSON.stringify({ url: signed.url, headers: signed.headers }));
} catch {
  console.error("Douyin signing failed; check the input, official SDK availability and signer compatibility.");
  process.exitCode = 1;
}
