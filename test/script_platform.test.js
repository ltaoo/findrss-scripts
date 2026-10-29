import { worker_url } from "./support/worker_runtime.js";
import assert from "node:assert/strict";
import test from "node:test";
import { read_script, script_names } from "./support/script_sources.js";
const { compile_script_module } = await import("findrss-worker/server/infra/script_sandbox.js");
import { readFile } from "node:fs/promises";
import { XMLValidator } from "fast-xml-parser";

test("示例脚本保留品牌 SVG，Hot 来源内嵌 favicon 且在 QuickJS 中编译通过", async () => {
  const hot_icons = new Map();
  for (const kind of ["rss", "hot", "clip", "detect"]) {
    const sources = new Set();
    for (const name of script_names(kind)) {
      const source = read_script(kind + "/" + name);
      if (kind === "rss" || kind === "hot") assert.doesNotMatch(source, /website-platform-icon/);
      const compiled = await compile_script_module(source);
      assert.equal(compiled.error, "", kind + "/" + name);
      assert.ok(compiled.metadata.platform.name, kind + "/" + name);
      if (kind !== "rss") {
        assert.ok(!sources.has(compiled.metadata.platform.name), kind + "/" + name + " 与同来源脚本重复");
        sources.add(compiled.metadata.platform.name);
      }
      for (const route of compiled.metadata.routes) assert.deepEqual(route.platform, compiled.metadata.platform, kind + "/" + name);
      if (name === "baidu_weather.js") {
        const baidu = await compile_script_module(read_script("hot/baidu_hot.js"));
        assert.deepEqual(compiled.metadata.platform, baidu.metadata.platform);
        continue;
      }
      if (kind === "hot") {
        const { name: platform_name, icon: svg } = compiled.metadata.platform;
        assert.equal(XMLValidator.validate(svg), true, name);
        assert.match(svg, /^<svg\b/);
        assert.ok(svg.length <= 131072, name);
        if (hot_icons.has(platform_name)) assert.equal(svg, hot_icons.get(platform_name), name);
        hot_icons.set(platform_name, svg);
        const embedded_png = svg.match(/href="data:image\/png;base64,([A-Za-z0-9+/=]+)"/);
        if (embedded_png) {
          const png = Buffer.from(embedded_png[1], "base64");
          assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", name);
          assert.ok(png.readUInt32BE(16) <= 32 && png.readUInt32BE(20) <= 32, name);
          assert.match(source, /\/\/ Favicon: https:\/\//, name);
        }
        continue;
      }
      const stem = name.replace(/\.js$/, "");
      if (kind === "rss" && stem === "apple") {
        const svg = compiled.metadata.platform.icon;
        assert.equal(XMLValidator.validate(svg), true);
        assert.match(svg, /viewBox="0 0 302 302"/);
        assert.doesNotMatch(svg, /<rect\b|fill="#fff"/);
        assert.equal((svg.match(/<path fill="#666"/g) || []).length, 2);
        assert.doesNotMatch(svg, /<image\b/);
        continue;
      }
      const key = ["github", "bilibili", "douban", "douyin", "wxchannels", "wxmp", "zhihu", "x", "xiaohongshu", "weibo", "kuaishou", "youtube", "telegram", "qidian", "fanqienovel", "instagram"]
        .find(key => stem === key || stem.startsWith(key + "_")) || "website";
      const expected_icon = key === "website" && kind === "rss" ? "" : (await readFile(new URL(`public/platform-icons/${key}.svg`, worker_url), "utf8")).trim();
      assert.equal(compiled.metadata.platform.icon, expected_icon, kind + "/" + name);
    }
  }
});

test("Clip/Detect 支持自定义平台、路由覆盖并校验配置", async () => {
  for (const kind of ["clip", "detect"]) {
    const platform = { name: "自定义平台", icon: "https://example.com/icon.svg" };
    const source = `export const kind = ${JSON.stringify(kind)};
export const version = "1.0.0";
export const platform = ${JSON.stringify(platform)};
export const routes = [
  { path: "/example", name: "Example", handler() {} },
  { path: "/other", name: "Other", platform: { name: "其他平台", icon: "" }, handler() {} },
];`;
    const compiled = await compile_script_module(source);
    assert.equal(compiled.error, "", kind);
    assert.equal(compiled.metadata.kind, kind);
    assert.deepEqual(compiled.metadata.platform, platform);
    assert.deepEqual(compiled.metadata.routes[0].platform, platform);
    assert.deepEqual(compiled.metadata.routes[1].platform, { name: "其他平台", icon: "" });
    for (const invalid of [{ name: "", icon: "" }, { name: "平台", icon: "javascript:alert(1)" }]) {
      const result = await compile_script_module(source.replace(JSON.stringify(platform), JSON.stringify(invalid)));
      assert.match(result.error, /platform/, kind);
    }
  }
});
