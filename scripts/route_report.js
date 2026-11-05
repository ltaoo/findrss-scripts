import { createElement as h, useEffect, useState } from "react";
import { Box, Static, Text, render } from "ink";
import string_width from "string-width";

import { route_report_model } from "./route_report_model.js";

export function render_progress(result) {
  return `${result.output_valid ? "PASS" : "FAIL"} ${result.file} ${result.format} ${result.path}${result.error ? ": " + result.error : ""}`;
}

const color = row =>
  row.phase === "success" ? "green" : row.phase === "failed" ? "red" : "yellow";
const status_text = row =>
  row.phase === "loading"
    ? "loading"
    : row.phase === "success"
      ? `success ${row.result.duration_ms ?? 0}ms`
      : `failed: ${row.result.error || "校验未通过"}`;

// 本地终端用 Ink 渲染：每个请求两行（URL 在上，状态在下）。
// 屏幕上只保留最近若干个请求，更早完成的请求移入 <Static> 永久输出，
// 这样列表可以任意长而不会超出终端高度把整屏反复刷进回滚区。
// 非 TTY（CI、管道、重定向）退回逐行结果日志，避免写入 ANSI 控制符。
export function create_progress({ stream = process.stdout, interactive } = {}) {
  const tty = interactive ?? Boolean(stream.isTTY);
  if (!tty) {
    return {
      start() {},
      finish(result) {
        stream.write(render_progress(result) + "\n");
      },
      async close() {},
    };
  }

  const max_live = Math.max(4, Math.floor(((stream.rows || 24) - 1) / 2));
  const live = [];
  const archived = [];
  const slots = new Map();
  const listeners = new Set();
  let next_id = 0;
  let instance;

  const width = () => Math.max(24, (stream.columns || 80) - 1);
  // 按显示宽度截断：中文/emoji 占两列，用 .length 会低估宽度导致终端自动换行，
  // 行数一超屏 Ink 就会整屏重绘（历史行被擦掉）。
  const fit = text => {
    const limit = width();
    if (string_width(text) <= limit) return text;
    let result = "";
    let used = 0;
    for (const char of text) {
      const char_width = string_width(char);
      if (used + char_width > limit - 1) break;
      result += char;
      used += char_width;
    }
    return result + "…";
  };

  // 只保留最近 max_live 个请求在活动区；优先把最早完成的移入静态输出。
  const trim = () => {
    while (live.length > max_live) {
      const index = live.findIndex(row => row.phase !== "loading");
      if (index === -1) return;
      archived.push(...live.splice(index, 1));
    }
  };
  const notify = () => {
    trim();
    for (const listener of listeners) listener();
  };

  const Row = ({ row }) => h(Box, { flexDirection: "column" },
    h(Text, null, fit(row.url)),
    h(Text, { color: color(row) }, fit("  " + status_text(row))));

  function App() {
    const [, set_version] = useState(0);
    useEffect(() => {
      const listener = () => set_version(version => version + 1);
      listeners.add(listener);
      return () => listeners.delete(listener);
    }, []);
    return h(Box, { flexDirection: "column" },
      h(Static, { items: archived.slice() }, (row, index) =>
        h(Row, { key: index, row })),
      live.map(row => h(Row, { key: row.id, row })));
  }

  const mount = () => {
    instance ??= render(h(App), {
      stdout: stream,
      stdin: process.stdin,
      interactive: true,
    });
  };

  return {
    start(entry, worker) {
      const row = { id: next_id++, url: entry.example ?? entry.path, phase: "loading", result: null };
      live.push(row);
      slots.set(worker, row);
      mount();
      notify();
    },
    finish(result, worker) {
      const row = slots.get(worker) ?? { id: next_id++, url: result.example ?? result.path };
      if (!live.includes(row)) live.push(row);
      row.phase = result.output_valid ? "success" : "failed";
      row.result = result;
      mount();
      notify();
    },
    async close() {
      if (!instance) return;
      await instance.waitUntilRenderFlush();
      instance.unmount();
      await instance.waitUntilExit();
    },
  };
}

export function render_report(report) {
  const model = route_report_model(report);
  const cell = value => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/[\\`*_[\]~]/g, "\\$&").replace(/\|/g, "&#124;").replace(/[\r\n]/g, " ");
  return `# 脚本路由巡检：${model.passed}/${model.total} 通过\n\n`
    + '<img data-n="project-logo" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/assets/brand/logo.svg" alt="FindRSS" width="64" height="64">\n\n'
    + `巡检时间：${cell(model.checked_at || "未提供")}\n\n`
    + "点击脚本路径打开 master 分支的 Raw 源码。结果按脚本聚合，每条路由显示成功或失败及失败原因，失败项优先显示。\n\n"
    + (model.total ? model.groups.map(group => `## ${cell(group.name)}（${group.total - group.failed}/${group.total} 通过）\n\n`
      + `${group.icon_url ? `<img data-n="script-icon" src="${group.icon_url}" alt="" width="24" height="24"> ` : ""}[${cell(group.file)}](${group.raw_url}) · 版本：${cell(group.version)}\n\n`
      + "| 路由 | 结果 | 失败原因 |\n| --- | --- | --- |\n"
      + group.rows.map(row => `| ${cell(row.path)} | ${row.ok ? "✅ 成功" : "❌ 失败"} | ${cell(row.reason)} |`).join("\n")
      + "\n").join("\n") : "本轮没有生成路由检查项，请查看 Actions 运行记录。\n");
}
