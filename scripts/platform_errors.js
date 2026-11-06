export function classify_platform_error(content_type, body) {
  const type = (content_type || "").split(";")[0].trim().toLowerCase();
  if (type !== "text/html") return null;
  if (/exceeded CPU time limit/i.test(body)) {
    return { classification: "exceeded_cpu", code: "EXCEEDED_CPU", message: "Cloudflare 报告 Worker CPU 超限" };
  }
  // 1102 的通用错误页同时用于 CPU 和内存超限，具体原因须查 invocation outcome。
  if (/Worker exceeded resource limits|Error\s+1102\b/i.test(body)) {
    return { classification: "exceeded_resources", code: "EXCEEDED_RESOURCES",
      message: "Worker 资源超限（CPU 或内存），需查看 Workers Logs 确认" };
  }
  return null;
}
