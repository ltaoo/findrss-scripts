const phases = [["request", "请求"], ["response", "回包"], ["format_valid", "格式"], ["output_valid", "输出"]];
const formats = { rss: "RSS", atom: "Atom", hot: "Hot", clip: "Clip", detect: "Detect", html: "正文", image: "图片" };

export function route_report_model(report) {
  if (!report || !Array.isArray(report.results)) throw new Error("巡检报告缺少 results 数组");
  const groups = new Map();
  for (const result of report.results) {
    const first_failure = phases.findIndex(([key]) => !result[key]);
    const row = { ...result, ok: result.output_valid === true,
      stages: phases.map(([key, label], index) => ({ key, label,
        state: result[key] ? "passed" : index === first_failure ? "failed" : "skipped" })),
    };
    if (!groups.has(result.format)) groups.set(result.format, []);
    groups.get(result.format).push(row);
  }
  const kinds = [...new Set([...Object.keys(formats), ...groups.keys()])].filter(kind => groups.has(kind));
  const total = report.results.length;
  const passed = report.results.filter(result => result.output_valid === true).length;
  return { checked_at: report.checked_at, total, passed, failed: total - passed,
    pass_rate: total ? Math.round(passed / total * 100) : 0,
    groups: kinds.map((kind, index) => {
      const rows = groups.get(kind).sort((a, b) => Number(a.ok) - Number(b.ok));
      return { id: "format-" + index, name: formats[kind] || kind, rows,
        total: rows.length, failed: rows.filter(row => !row.ok).length };
    }),
  };
}
