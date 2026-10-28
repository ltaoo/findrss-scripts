import { readFileSync, readdirSync } from "node:fs";

export function read_script(path) {
  return readFileSync(new URL("../../" + path, import.meta.url), "utf8");
}

export function script_names(kind) {
  return readdirSync(new URL("../../" + kind + "/", import.meta.url)).filter(name => name.endsWith(".js")).sort();
}
