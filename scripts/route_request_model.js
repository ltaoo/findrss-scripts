import { display_route_cases } from "../worker/catalog.js";
import { RssRoutePatternModel } from "../.runtime/findrss-worker/server/domain/rss_route.js";

export function route_request_model(file, path, route = {}) {
  const pattern = RssRoutePatternModel.fromValue(path);
  if (!pattern) return null;
  const segments = path.split("/").slice(1).map(segment => {
    const parameter = /^:([A-Za-z_][A-Za-z0-9_]*)(?:\{([\s\S]+)\})?(\?)?$/.exec(segment);
    return parameter ? { name: parameter[1], pattern: parameter[2] || "", optional: Boolean(parameter[3]) } : segment;
  });
  const example = new URL(route.example || "/", "https://example.invalid");
  const examples = pattern.match(example.pathname)?.params || {};
  const descriptions = route.parameters || {};
  const fields = segments.filter(segment => typeof segment !== "string").map(segment => ({
    name: segment.name, in: "path", required: !segment.optional, pattern: segment.pattern,
    description: descriptions[segment.name] || segment.name, value: examples[segment.name] || "",
  }));
  const path_names = new Set(fields.map(field => field.name));
  for (const name of new Set([...Object.keys(descriptions), ...example.searchParams.keys()])) {
    if (name === "token" || path_names.has(name)) continue;
    fields.push({ name, in: "query", description: descriptions[name] || name,
      required: name === "url" || /必填/.test(descriptions[name] || ""), value: example.searchParams.get(name) || "" });
  }
  return { key: JSON.stringify([file, path]), file, path, prefix: path.slice(0, path.length - (route.path || path).length),
    name: route.name || path, segments, fields };
}

export function route_request_models(catalog) {
  const scripts = catalog.filter(script => Array.isArray(script.metadata?.routes));
  const metadata = new Map(scripts.map(script => [script.file, script.metadata]));
  return display_route_cases(scripts).map(entry => route_request_model(entry.file, entry.path,
    { ...metadata.get(entry.file).routes[entry.route_index], example: entry.example })).filter(Boolean);
}
