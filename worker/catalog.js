// 每种脚本 kind 对应一组访问前缀。route.path 自身始终直接可访问，前缀只是按 kind 增加的别名。
// rss 的 /api/rss 返回订阅 JSON 快照，/rss 与 /atom 仍渲染 XML；其余 kind 都返回 JSON。
const prefixes = {
  rss: [
    { prefix: "/rss", format: "rss" },
    { prefix: "/atom", format: "atom" },
    { prefix: "/api/rss", format: "rss_json", api: true },
  ],
  hot: [
    { prefix: "/hot", format: "hot" },
    { prefix: "/api/hot", format: "hot", api: true },
  ],
  clip: [
    { prefix: "/clip", format: "clip" },
    { prefix: "/api/clip", format: "clip", api: true },
  ],
  detect: [
    { prefix: "/detect", format: "detect" },
    { prefix: "/api/detect", format: "detect", api: true },
  ],
};

// 图片代理和 RSS 正文页属于附加路由，没有对应的 kind 命名空间，只在脚本声明路径直接访问。
function auxiliary_format(kind, route) {
  if (route.allowed_hosts) return "image";
  if (kind === "rss" && route.public) return "html";
  return "";
}

export function route_cases(scripts) {
  return scripts.flatMap(({ file, metadata }) => metadata.routes.flatMap(route => {
    const kind = metadata.kind;
    const base = { file, kind, source_host: route.url || "", name: route.name, route_index: route.route_index };
    const auxiliary = auxiliary_format(kind, route);
    if (auxiliary) {
      return [{ ...base, format: auxiliary, path: route.path, example: route.example, api: false, display: true }];
    }
    return [
      { ...base, format: kind === "rss" ? "rss" : kind, path: route.path, example: route.example, api: false, display: false },
      ...prefixes[kind].map(entry => ({ ...base, format: entry.format, path: entry.prefix + route.path,
        example: entry.prefix + route.example, api: entry.api === true,
        display: entry.api === true || entry.prefix === "/rss" || entry.prefix === "/atom" })),
    ];
  }));
}

// 巡检和 OpenAPI 只覆盖 /api/rss、/api/hot、/api/clip、/api/detect 四个规范前缀。
export function api_route_cases(scripts) {
  return route_cases(scripts).filter(entry => entry.api);
}

// 脚本市场与巡检报告只展示规范接口、RSS/Atom 渲染和附加的正文/图片路由。
export function display_route_cases(scripts) {
  return route_cases(scripts).filter(entry => entry.display);
}

export function debug_route_cases(scripts) {
  return scripts.flatMap(({ file, metadata }) => metadata.routes.map(route => ({
    file, kind: metadata.kind, path: "/debug" + route.path, example: "/debug" + route.example,
    format: "debug", source_host: route.url || "", name: route.name, route_index: route.route_index,
  })));
}
