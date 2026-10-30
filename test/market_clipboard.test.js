import assert from "node:assert/strict";
import test from "node:test";
import { write_clipboard } from "../scripts/market_clipboard.js";

function browser(t, clipboard, dialogs = [], copied = true) {
  const descriptors = Object.fromEntries(["navigator", "document"].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  t.after(() => {
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  const state = { selected: false, removed: false, restored: false };
  const buffer = { style: {}, setAttribute() {}, focus() {}, select() { state.selected = true; }, remove() { state.removed = true; } };
  const append = parent => ({ append(node) { assert.equal(node, buffer); state.parent = parent; } });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { clipboard } });
  Object.defineProperty(globalThis, "document", { configurable: true, value: {
    activeElement: { focus() { state.restored = true; } },
    body: append("body"), querySelectorAll: () => dialogs.map(append),
    createElement(tag) { assert.equal(tag, "textarea"); return buffer; },
    execCommand(command) { assert.equal(command, "copy"); assert.equal(state.selected, true); return copied; },
  } });
  return { state, buffer };
}

test("复制优先使用 Clipboard API，不创建备用输入框", async t => {
  let value;
  const { state } = browser(t, { async writeText(text) { value = text; } });
  await write_clipboard("https://example.com/");
  assert.equal(value, "https://example.com/");
  assert.equal(state.parent, undefined);
});

test("Clipboard API 缺失或拒绝时，在页面或最上层弹窗中备用复制并恢复焦点", async t => {
  for (const clipboard of [undefined, { async writeText() { throw new Error("NotAllowedError"); } }]) {
    for (const dialogs of [[], ["inspection", "request", "settings"]]) {
      await t.test((clipboard ? "拒绝" : "缺失") + (dialogs.length ? "弹窗" : "页面"), async t => {
        const { state, buffer } = browser(t, clipboard, dialogs);
        await write_clipboard("curl example.com \\\n  --data-raw '{}'");
        assert.equal(buffer.value, "curl example.com \\\n  --data-raw '{}'");
        assert.equal(state.parent, dialogs.at(-1) || "body");
        assert.equal(state.removed, true);
        assert.equal(state.restored, true);
      });
    }
  }
});

test("备用复制失败向 Model 报错，仍清理节点和恢复焦点", async t => {
  const { state } = browser(t, undefined, ["request"], false);
  await assert.rejects(write_clipboard("text"), /剪贴板不可用/);
  assert.equal(state.removed, true);
  assert.equal(state.restored, true);
});
