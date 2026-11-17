import { script_error } from "./errors.js";
import { read_json_body } from "./cookie_sync.js";

export function create_instabox_signer(env, signal) {
  if (!env.INSTABOX_API_KEY && !env.INSTABOX_MACHINE) return undefined;
  if (!env.INSTABOX_API_KEY || !/^m_[a-z0-9]+$/.test(env.INSTABOX_MACHINE || "")) throw script_error("CONFIG_INVALID");
  const base = "https://api.instabox.sh/v1/machines/" + env.INSTABOX_MACHINE;
  return async request => {
    const deadline = AbortSignal.any([AbortSignal.timeout(110000), ...(signal ? [signal] : [])]);
    const api = async (path = "", body) => {
      const response = await fetch(base + path, {
        method: body ? "POST" : "GET", redirect: "error", signal: deadline,
        headers: { "X-API-Key": env.INSTABOX_API_KEY, "Content-Type": "application/json",
          ...(path === "/start" ? { "Idempotency-Key": crypto.randomUUID() } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (!response.ok) {
        await response.body?.cancel();
        throw Object.assign(script_error("SOURCE_UNAVAILABLE", "InstaBox 签名服务暂不可用：HTTP " + response.status), { status: response.status });
      }
      return read_json_body(response);
    };
    const wait = () => new Promise((resolve, reject) => {
      deadline.throwIfAborted();
      const aborted = () => { clearTimeout(timer); reject(deadline.reason); };
      const timer = setTimeout(() => { deadline.removeEventListener("abort", aborted); resolve(); }, 3000);
      deadline.addEventListener("abort", aborted, { once: true });
    });
    let polls = 0;
    for (let retry = 0; retry < 2; retry++) {
      let ready = false, starting = false;
      // 为 KV、上游请求和重试保留 Free 套餐的子请求额度。
      while (polls++ < 24) {
        const machine = await api();
        if (machine.state === "running" && machine.runtime?.ready !== false) { ready = true; break; }
        if (["stopped", "paused"].includes(machine.state)) {
          if (!starting) {
            try { await api("/start", {}); }
            catch (error) { if (error.status !== 409) throw error; }
            starting = true;
          }
        } else if (!["starting", "resuming", "stopping", "pausing", "running"].includes(machine.state)) {
          throw script_error("SOURCE_UNAVAILABLE", "InstaBox 签名机器状态不可用");
        }
        await wait();
      }
      if (!ready) throw script_error("SOURCE_UNAVAILABLE", "InstaBox 签名机器启动超时");
      let result;
      try {
        result = await api("/exec", {
          argv: ["node", "/data/home/findrss-signing/douyin-signer.mjs"],
          stdin: JSON.stringify(request), timeoutSeconds: 45, noHistory: true,
        });
      } catch (error) {
        // 巡检结束时可能关机；等其停止后重新启动，避免中断巡检的清理流程。
        if (!retry && [409, 503].includes(error.status)) continue;
        throw error;
      }
      if (result.exitCode !== 0 || result.timedOut || result.truncated || result.invalidUtf8 || typeof result.stdout !== "string") {
        throw script_error("SOURCE_UNAVAILABLE", "InstaBox 签名执行失败，请检查远端签名脚本");
      }
      try { return JSON.parse(result.stdout); }
      catch { throw script_error("SOURCE_UNAVAILABLE", "InstaBox 返回无效签名"); }
    }
  };
}
