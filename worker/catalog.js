export function route_cases(scripts) {
  return scripts.flatMap(({ file, metadata }) => metadata.routes.flatMap(route => {
    const kind = metadata.kind;
    const format = route.allowed_hosts ? "image" : kind === "rss" && route.public ? "html" : kind;
    const formats = format === "rss" ? ["rss", "atom"] : [format];
    return formats.map(format => {
      const prefix = ["rss", "atom"].includes(format) ? "/" + format
        : ["hot", "clip", "detect"].includes(format) ? "/api/" + kind : "";
      return { file, kind, path: prefix + route.path, example: prefix + route.example, format,
        source_host: route.url || "", name: route.name, route_index: route.route_index };
    });
  }));
}
