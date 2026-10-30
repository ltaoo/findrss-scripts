export async function write_clipboard(value) {
  try {
    if (globalThis.navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
  } catch {}
  const active = document.activeElement;
  const buffer = document.createElement("textarea");
  buffer.setAttribute("data-n", "clipboard-buffer");
  buffer.setAttribute("aria-label", "复制内容");
  buffer.value = value;
  buffer.readOnly = true;
  buffer.tabIndex = -1;
  buffer.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none;font-size:16px";
  // 模态弹窗之外的节点处于 inert 状态，备用复制输入框必须放在最上层弹窗内。
  const parent = [...document.querySelectorAll("dialog[open]")].at(-1) || document.body;
  try {
    parent.append(buffer);
    buffer.focus({ preventScroll: true });
    buffer.select();
    if (!document.execCommand("copy")) throw new Error("剪贴板不可用");
  } finally {
    buffer.remove();
    active?.focus({ preventScroll: true });
  }
}
