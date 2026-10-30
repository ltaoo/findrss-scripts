import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build, buildSync, transformSync } from "esbuild";

const runtime = new URL("../.runtime/findrss-worker/public/assets/timeless/0.34.2/", import.meta.url);
const lite = fileURLToPath(new URL("timeless.lite.esm.js", runtime));
const ssr_path = fileURLToPath(new URL("timeless.ssr.esm.js", runtime));
const replace = (source, before, after) => {
  assert.ok(source.includes(before), "固定版 Timeless 运行时已变化，请检查原生标签与 SSR 兼容处理");
  return source.replace(before, after);
};

// 固定版只将 View 渲染为 div；两端补齐原页面的语义标签，SSR 同时正确处理属性转义和布尔值。
let ssr = readFileSync(ssr_path, "utf8");
ssr = replace(ssr, 'const tag = "div";', 'const tag = props.elm.state.tag || "div";');
ssr = replace(ssr, 'return str.replace(/"/g, "&quot;");', 'return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");');
ssr = replace(ssr, 'Object.entries(state.attributes)) if (value !== void 0 && value !== null)', 'Object.entries(state.attributes)) if (value !== void 0 && value !== null && !(value === false && ["hidden", "disabled", "required", "novalidate", "open"].includes(key)))');
ssr = replace(ssr, 'attrs.push(`type="text"`);', 'if (!props.elm.state.attributes?.type) attrs.push(`type="text"`);');
ssr = replace(ssr, '${props.elm.state.value}"`)', '${attrEscape(String(props.elm.state.value))}"`)');

const server = await build({
  stdin: { contents: 'import { renderToString } from "timeless-ssr"; import { MarketPage, create_market_view_model } from "./script_market_view.js"; export const render_market_page = data => renderToString(MarketPage(create_market_view_model(data)));',
    resolveDir: fileURLToPath(new URL("./", import.meta.url)) },
  bundle: true, write: false, format: "esm", platform: "node",
  alias: { timeless: lite, "timeless-ssr": ssr_path },
  plugins: [{ name: "market-ssr", setup(build) {
    build.onLoad({ filter: /timeless\.ssr\.esm\.js$/ }, () => ({ contents: ssr, loader: "js", resolveDir: fileURLToPath(runtime) }));
  } }],
});
export const { render_market_page } = await import("data:text/javascript;base64," + Buffer.from(server.outputFiles[0].text).toString("base64"));

let dom = transformSync(readFileSync(new URL("timeless.dom.umd.min.js", runtime), "utf8"), { minify: false }).code;
dom = replace(dom, 'const t3 = document.createElement("div");\n      n2.methods.set$elm(t3), n2.methods.applyState(e2.elm.state, { initial: true });',
  'const tag = e2.elm.state.tag || "div"; const t3 = e2.elm.state.svg ? document.createElementNS("http://www.w3.org/2000/svg", tag) : document.createElement(tag);\n      n2.methods.set$elm(t3), n2.methods.applyState(e2.elm.state, { initial: true });');
// 固定版 Modal 可渲染，但未进入 hydration 分派。
dom = replace(dom, 'if ("view" === e2.t || "form" === e2.t)', 'if ("view" === e2.t || "form" === e2.t || "modal" === e2.t)');
const client = buildSync({
  entryPoints: [fileURLToPath(new URL("./script_market_client.js", import.meta.url))],
  bundle: true, write: false, format: "iife", platform: "browser", target: "es2022", minify: true,
  alias: { timeless: fileURLToPath(new URL("./timeless_browser.js", import.meta.url)) },
}).outputFiles[0].text;
export const market_client = [readFileSync(new URL("timeless.umd.min.js", runtime), "utf8"),
  transformSync(dom, { minify: true }).code, client].join("\n").replace(/<\/script/gi, "<\\/script");
