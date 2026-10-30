const encode_path = file => String(file).split("/").map(part => encodeURIComponent(part).replace(/[!'()*]/g, char => "%" + char.charCodeAt(0).toString(16).toUpperCase())).join("/");
const raw_url = (branch, file) => `https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/${branch}/` + encode_path(file);

export function route_report_model(report, catalog) {
  if (!report || !Array.isArray(report.results)) throw new Error("巡检报告缺少 results 数组");
  const report_prefix = report.mode === "dev" ? "./" : raw_url("route-reports", "reports/");
  const scripts = new Map((catalog || report.scripts || []).map(script => [script.file, script]));
  const groups = new Map();
  for (const result of report.results) {
    const ok = result.output_valid === true;
    const row = { path: result.path, ok,
      reason: ok ? "" : [result.code, result.error].filter(Boolean).join(": ") || "校验未通过" };
    const samples = result.samples || [result];
    const artifacts = samples.flatMap((sample, index) => {
      const file = sample.output_file;
      if (!sample.output_valid || typeof file !== "string" || /[\\?#\u0000-\u001f]/.test(file)
        || file.split("/").some(part => !part || part === "." || part === "..")) return [];
      return [{ url: report_prefix + encode_path("responses/" + file),
        label: samples.length > 1 ? `查看产物 ${index + 1}` : "查看产物" }];
    });
    if (artifacts.length) row.artifacts = artifacts;
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
      return { id, name: file, file, title: script?.name || script?.platform?.name || file,
        kind: script?.kind || String(file).split("/")[0],
        raw_url: raw_url("master", file), version: script?.version || "—", icon, icon_file,
        icon_data_url: icon ? "data:image/svg+xml;base64," + Buffer.from(icon).toString("base64") : "",
        icon_url: icon ? report_prefix + encode_path(icon_file) : "", rows,
        total: rows.length, failed: rows.filter(row => !row.ok).length };
    }).sort((a, b) => Number(b.failed > 0) - Number(a.failed > 0)),
  };
}
