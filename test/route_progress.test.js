import assert from "node:assert/strict";
import test from "node:test";
import string_width from "string-width";

import { create_progress } from "../scripts/route_report.js";

const entry = { file: "rss/example.js", format: "rss", path: "/rss/example" };
const hot = { file: "hot/example.js", format: "hot", path: "/api/hot/example" };

function fake_stream({ isTTY, columns = 80, rows = 40 } = {}) {
  const chunks = [];
  return {
    isTTY, columns, rows, chunks,
    write(text, callback) { chunks.push(String(text)); callback?.(); return true; },
    on() {}, off() {}, removeListener() {},
  };
}

// 按 ANSI 控制符回放终端输出，得到最终屏幕上的每一行。
function play_screen(chunks) {
  const rows = [];
  let cursor = 0;
  let buffer = "";
  const flush = () => { if (buffer) { rows[cursor] = buffer; buffer = ""; } };
  const text = chunks.join("");
  for (let index = 0; index < text.length; ) {
    if (text[index] === "\x1b") {
      const match = /^\x1b\[([0-9;?]*)([A-Za-z])/.exec(text.slice(index));
      if (!match) { index++; continue; }
      const [, params, code] = match;
      index += match[0].length;
      if (params.includes("?") || code === "m") continue;
      flush();
      if (code === "A") cursor -= Number(params || 1);
      else if (code === "B") cursor += Number(params || 1);
      else if (code === "H") cursor = 0;
      else if (code === "K") rows[cursor] = "";
      else if (code === "J") for (let row = cursor; row < rows.length; row++) rows[row] = "";
      else if (code === "G") buffer = "";
      continue;
    }
    if (text[index] === "\r") {
      flush();
      index++;
      continue;
    }
    if (text[index] === "\n") {
      flush();
      cursor++;
      index++;
      continue;
    }
    buffer += text[index++];
  }
  flush();
  return rows;
}

test("非 TTY 退回逐行日志，不写 ANSI 控制符", async () => {
  const stream = fake_stream({ isTTY: false });
  const progress = create_progress({ stream });
  progress.start(entry, 0);
  progress.finish({ ...entry, output_valid: true }, 0);
  progress.finish({ ...entry, output_valid: false, error: "HTTP 502" }, 0);
  await progress.close();
  assert.equal(stream.chunks.join(""),
    "PASS rss/example.js rss /rss/example\nFAIL rss/example.js rss /rss/example: HTTP 502\n");
});

test("TTY 每个请求两行：URL 在上，状态在下，完成后原地更新", async () => {
  const stream = fake_stream({ isTTY: true, columns: 120 });
  const progress = create_progress({ stream });
  progress.start(entry, 0);
  progress.start(hot, 1);
  progress.finish({ ...entry, output_valid: true, duration_ms: 128 }, 0);
  progress.finish({ ...hot, output_valid: false, error: "HTTP 502" }, 1);
  await progress.close();
  assert.deepEqual(play_screen(stream.chunks), [
    "/rss/example", "  success 128ms",
    "/api/hot/example", "  failed: HTTP 502",
  ]);
});

test("TTY 按终端宽度截断 URL 和状态，避免换行破坏两行布局", async () => {
  const stream = fake_stream({ isTTY: true, columns: 40 });
  const progress = create_progress({ stream });
  progress.start({ ...entry, example: "/rss/" + "x".repeat(100) }, 0);
  progress.finish({ ...entry, example: "/rss/" + "x".repeat(100), output_valid: false, error: "HTTP 502: " + "y".repeat(100) }, 0);
  await progress.close();
  const [url, status] = play_screen(stream.chunks);
  assert.equal(url.length, 39);
  assert.ok(url.endsWith("…"));
  assert.equal(status.length, 39);
  assert.ok(status.endsWith("…"));
});

test("TTY 按显示宽度截断中文状态，双列字符不会把行挤到换行", async () => {
  const stream = fake_stream({ isTTY: true, columns: 40 });
  const progress = create_progress({ stream });
  const error = "HTTP 503: COOKIE_REQUIRED: 站点 https://www.qimao.com 的 Cookie 无法用于请求，请检查同步配置后重试";
  progress.start({ ...entry, example: "/api/rss/qimao/book/13030701" }, 0);
  progress.finish({ ...entry, example: "/api/rss/qimao/book/13030701", output_valid: false, error }, 0);
  await progress.close();
  const [url, status] = play_screen(stream.chunks);
  assert.ok(string_width(url) <= 39);
  assert.ok(string_width(status) <= 39);
  assert.ok(status.endsWith("…"));
});

test("并发巡检时活动区不超过终端高度，不触发整屏重绘", async () => {
  const stream = fake_stream({ isTTY: true, columns: 120, rows: 24 });
  const progress = create_progress({ stream });
  for (let index = 0; index < 10; index++) {
    progress.start({ ...entry, example: "/rss/" + index }, index);
  }
  for (let index = 0; index < 30; index++) {
    progress.finish({ ...entry, example: "/rss/" + index, output_valid: true, duration_ms: index }, index % 10);
    if (index + 10 < 30) progress.start({ ...entry, example: "/rss/" + (index + 10) }, index % 10);
  }
  await progress.close();
  assert.ok(!stream.chunks.join("").includes("\x1b[1;1H"));
  assert.ok(play_screen(stream.chunks).filter(Boolean).includes("  success 29ms"));
});

test("超出可视高度时把最早完成的请求移入静态输出，列表完整保留", async () => {
  const stream = fake_stream({ isTTY: true, columns: 120, rows: 10 });
  const progress = create_progress({ stream });
  for (let index = 0; index < 6; index++) {
    progress.start({ ...entry, example: "/rss/" + index }, index);
  }
  progress.finish({ ...entry, example: "/rss/0", output_valid: true, duration_ms: 10 }, 0);
  await progress.close();
  const screen = play_screen(stream.chunks).filter(Boolean);
  assert.ok(screen.includes("/rss/0"));
  assert.ok(screen.includes("  success 10ms"));
  for (let index = 1; index < 6; index++) assert.ok(screen.includes("/rss/" + index));
});
