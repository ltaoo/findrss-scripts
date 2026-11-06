const encode_path = file => String(file).split("/").map(part => encodeURIComponent(part).replace(/[!'()*]/g, char => "%" + char.charCodeAt(0).toString(16).toUpperCase())).join("/");
const raw_url = (branch, file) => `https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/${branch}/` + encode_path(file);
// 只展示请求路径，避免 token 等查询参数进入报告页面。
const example_path = value => {
  if (typeof value !== "string") return "";
  try {
    return new URL(value, "https://example.invalid").pathname.split("/")
      .map(part => { try { return decodeURIComponent(part); } catch { return part; } }).join("/");
  } catch { return ""; }
};

export function route_report_model(report, catalog) {
  if (!report || !Array.isArray(report.results)) throw new Error("巡检报告缺少 results 数组");
  const report_prefix = report.mode === "dev" ? "./" : raw_url("route-reports", "reports/");
  const scripts = new Map((catalog || report.scripts || []).map(script => [script.file, script]));
  const groups = new Map();
  for (const result of report.results) {
    const ok = result.output_valid === true;
    const row = { path: result.path, ok,
      reason: ok ? "" : [result.code, result.error].filter(Boolean).join(": ") || "校验未通过" };
    const samples = result.samples?.length ? result.samples : [result];
    const outputs = samples.flatMap((sample, index) => {
      const link = (directory, file, label) => {
        if (typeof file !== "string" || /[\\?#\u0000-\u001f]/.test(file)
          || file.split("/").some(part => !part || part === "." || part === "..")) return null;
        return { url: report_prefix + encode_path(directory + "/" + file), label: label + (samples.length > 1 ? ` ${index + 1}` : "") };
      };
      const artifact = sample.output_valid ? link("responses", sample.output_file, "查看产物") : null;
      const detail = link("details", sample.detail_file, "查看详情");
      const reason = sample.output_valid ? "" : [sample.code, sample.error].filter(Boolean).join(": ") || "校验未通过";
      if (!artifact && !detail && !reason) return [];
      const example = example_path(sample.example);
      return [{ ...(artifact ? { artifact } : {}), ...(detail ? { detail } : {}), ...(reason ? { reason } : {}),
        ...(example && (artifact || detail) ? { example } : {}) }];
    });
    if (outputs.length) row.outputs = outputs;
    if (!groups.has(result.file)) groups.set(result.file, []);
    groups.get(result.file).push(row);
  }
  if (catalog) for (const file of scripts.keys()) if (!groups.has(file)) groups.set(file, []);
  const total = report.results.length;
  const passed = report.results.filter(result => result.output_valid === true).length;
  return { checked_at: report.checked_at, total, passed, failed: total - passed,
    pass_rate: total ? Math.round(passed / total * 100) : 0,
    groups: [...groups].map(([file, results], index) => {
      const script = scripts.get(file);
      const icon = typeof script?.platform?.icon === "string" && /^<svg\b/.test(script.platform.icon.trim()) ? script.platform.icon : "";
      const id = "script-" + index;
      const icon_file = `icons/${id}.svg`;
      const rows = results.sort((a, b) => Number(a.ok) - Number(b.ok));
      return { id, name: file, file, title: script?.platform?.name || script?.name || file,
        kind: script?.kind || String(file).split("/")[0],
        raw_url: raw_url("master", file), version: script?.version || "—", icon, icon_file,
        icon_data_url: icon ? "data:image/svg+xml;base64," + Buffer.from(icon).toString("base64") : "",
        icon_url: icon ? report_prefix + encode_path(icon_file) : "", rows,
        total: rows.length, failed: rows.filter(row => !row.ok).length };
    }).sort((a, b) => Number(b.failed > 0) - Number(a.failed > 0)),
  };
}
