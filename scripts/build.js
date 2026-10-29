import { mkdir, writeFile } from "node:fs/promises";
import { compile_script_module } from "findrss-worker/server/infra/script_sandbox.js";
import { read_script, script_names } from "../test/support/script_sources.js";
import { route_cases, debug_route_cases } from "../worker/catalog.js";
import { generate_openapi } from "./generate_openapi.js";

const scripts = [];
for (const kind of ["hot", "rss", "clip", "detect"]) {
  for (const name of script_names(kind)) {
    const file = kind + "/" + name;
    const source = read_script(file);
    const { error, metadata } = await compile_script_module(source);
    if (error) throw new Error(file + ": " + error);
    if (metadata.kind !== kind) throw new Error(file + ": 脚本类型与目录不一致");
    scripts.push({ file, source, metadata });
  }
}
const cases = route_cases(scripts);
const addresses = new Set();
for (const entry of [...cases, ...debug_route_cases(scripts)]) {
  const key = entry.format + ":" + entry.path;
  if (addresses.has(key)) throw new Error("重复路由：" + key);
  addresses.add(key);
}
await mkdir(new URL("../dist/", import.meta.url), { recursive: true });
await writeFile(new URL("../dist/scripts.js", import.meta.url), "export default " + JSON.stringify(scripts) + ";\n");
await writeFile(new URL("../dist/routes.json", import.meta.url), JSON.stringify(cases, null, 2) + "\n");
await writeFile(new URL("../dist/openapi.json", import.meta.url), JSON.stringify(generate_openapi(scripts), null, 2) + "\n");
console.log(`已加载 ${scripts.length} 个脚本，生成 ${cases.length} 个路由检查项及 dist/openapi.json`);
