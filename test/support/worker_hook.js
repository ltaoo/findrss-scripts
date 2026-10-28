let worker_url;

export function initialize(data) {
  worker_url = data.worker_url;
}

export async function resolve(specifier, context, next_resolve) {
  if (specifier.startsWith("findrss-worker/")) {
    return next_resolve(new URL(specifier.slice("findrss-worker/".length), worker_url).href, context);
  }
  if (specifier === "fast-xml-parser" || specifier === "@findrss/feed-fetch") {
    return next_resolve(specifier, { ...context, parentURL: new URL("package.json", worker_url).href });
  }
  return next_resolve(specifier, context);
}
