import { createHash } from "node:crypto";
import { route_request_model } from "./route_request_model.js";

/**
 * @typedef {Object} ScriptExample
 * @property {string} id Stable within a script route.
 * @property {string} name Display name; opens the instance form.
 * @property {'script'|'config'|'manual'} source
 * @property {Object<string, string>} values Path and query parameters, excluding token.
 * @property {boolean|null} ok null means this instance has not been inspected.
 * @property {{url: string, label: string}} [artifact]
 * @property {{url: string, label: string}} [detail]
 * @property {string} [reason]
 */

// Match query variants without publishing private query values in the page.
export function example_key(value) {
  const url = new URL(value || "/", "https://example.invalid");
  url.searchParams.delete("token");
  url.searchParams.sort();
  return createHash("sha256").update(url.pathname + url.search).digest("hex");
}

export function script_examples(route, configured = [], outputs = []) {
  const examples = new Map();
  const create = (example, name, source) => {
    const request = route_request_model(route.file, route.path, { path: route.path, example,
      parameters: Object.fromEntries(route.fields.map(field => [field.name, field.description])) });
    const values = Object.fromEntries((request?.fields || route.fields).map(field => [field.name, field.value]));
    return { id: example_key(example), name: name || Object.values(values).filter(Boolean).join(" · ") || "默认实例",
      source, values, ok: null };
  };
  const builtin = create(route.example, "", "script");
  examples.set(builtin.id, builtin);
  for (const entry of Array.isArray(configured) ? configured : [configured]) {
    const example = create(entry.example || route.example, entry.name, "config");
    const previous = examples.get(example.id);
    examples.set(example.id, { ...example, source: previous?.source || example.source });
  }
  for (const output of outputs) {
    const { request_key, example: path, ...inspection } = output;
    const id = request_key || builtin.id;
    const example = examples.get(id) || { ...create(path || route.example, inspection.name || path, "config"), id };
    examples.set(id, { ...example, ...inspection, name: inspection.name || example.name });
  }
  return [...examples.values()];
}
