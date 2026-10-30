import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { api_route_cases } from "../worker/catalog.js";
import { RssRoutePatternModel } from "../.runtime/findrss-worker/server/domain/rss_route.js";

const parameter_pattern = /^:([A-Za-z_][A-Za-z0-9_]*)(?:\{([\s\S]+)\})?(\?)?$/;
const media_types = { rss: "application/rss+xml", atom: "application/atom+xml", html: "text/html", image: "image/*",
  rss_json: "application/json", hot: "application/json", clip: "application/json", detect: "application/json",
  debug: "text/html" };
// 当前运行时只保留 Hot 的 category，其余脚本在文档中补充分组。
const script_categories = new Map([
  ["小说", ["rss/69shuba.js", "rss/fanqienovel.js", "rss/qidian.js", "rss/qimao.js", "rss/ttk.js"]],
  ["科技", ["rss/apple.js", "rss/github.js", "clip/github.js", "detect/github_releases.js"]],
  ["视频", ["rss/bilibili.js", "rss/douyin.js", "rss/hongguo.js", "rss/kuaishou.js", "rss/wxchannels.js", "rss/youtube.js"]],
  ["影视", ["rss/avmoo.js", "rss/javbus.js", "rss/javlibrary.js"]],
  ["社交", ["rss/instagram.js", "rss/telegram.js", "rss/weibo.js", "rss/x.js", "rss/xiaohongshu.js"]],
  ["社区", ["rss/zhihu.js"]],
  ["资讯", ["rss/wxmp.js"]],
  ["网页", ["clip/website.js", "detect/website_text.js"]],
  ["天气", ["clip/baidu_weather.js"]],
].flatMap(([category, files]) => files.map(file => [file, category])));
const string = { type: "string" };
const object = { type: "object" };
const objects = { type: "array", items: object };
const json_properties = {
  rss_json: { kind: { type: "string", enum: ["rss"] }, title: string, link: { type: "string", format: "uri" },
    description: string, language: string, items: objects },
  hot: { kind: { type: "string", enum: ["hot_rank"] }, title: string, link: { type: "string", format: "uri" }, entries: objects },
  clip: { kind: { type: "string", enum: ["clip"] }, title: string, link: { type: "string", format: "uri" }, html: string, stats: object },
  detect: { kind: { type: "string", enum: ["detect"] }, title: string, link: { type: "string", format: "uri" },
    status: { type: "string", enum: ["initialized", "unchanged", "changed", "inconclusive"] }, snapshot: object, changes: objects, issues: objects },
};

export function generate_openapi(scripts) {
  const paths = {};
  const signatures = new Set();
  const metadata = new Map(scripts.map(script => [script.file, script.metadata]));
  for (const entry of api_route_cases(scripts)) {
    const script_metadata = metadata.get(entry.file);
    const route = script_metadata.routes[entry.route_index];
    const category = script_metadata.category?.trim() || script_categories.get(entry.file) || "其他";
    const folder = entry.kind + "/" + category;
    const example = new URL(entry.example, "https://example.invalid");
    const example_params = RssRoutePatternModel(entry.path).match(example.pathname)?.params || {};
    const segments = entry.path.split("/").slice(1).map(segment => {
      const parameter = parameter_pattern.exec(segment);
      return parameter ? { name: parameter[1], pattern: parameter[2], optional: Boolean(parameter[3]) } : segment;
    });
    const path_names = new Set(segments.filter(segment => typeof segment !== "string").map(segment => segment.name));
    const query_names = new Set([...Object.keys(route.parameters || {}).filter(name => !path_names.has(name)), ...example.searchParams.keys()]);
    const variants = segments.reduce((variants, segment) => variants.flatMap(parts =>
      segment.optional ? [[...parts, segment], parts] : [[...parts, segment]]), [[]]);
    const seen = new Set();
    for (const parts of variants) {
      const path = "/" + parts.map(part => typeof part === "string" ? part : "{" + part.name + "}").join("/");
      const signature = path.replace(/\{[^}]+\}/g, "{}");
      // 相邻可选段按路由匹配顺序保留最左参数，避免生成等价的模板路径。
      if (seen.has(signature)) continue;
      seen.add(signature);
      assert.ok(!signatures.has(signature), "OpenAPI 路径冲突：" + path);
      signatures.add(signature);
      const parameters = parts.flatMap(part => typeof part === "string" ? [] : [{
        name: part.name, in: "path", required: true, description: route.parameters?.[part.name] || part.name,
        schema: { type: "string", ...(part.pattern ? { pattern: "^(?:" + part.pattern + ")$" } : {}) },
        ...(example_params[part.name] ? { example: example_params[part.name] } : {}),
      }]);
      for (const name of query_names) parameters.push({ name, in: "query",
        required: name === "url",
        description: route.parameters?.[name] || name, schema: string,
        ...(example.searchParams.has(name) ? { example: example.searchParams.get(name) } : {}),
      });
      const properties = json_properties[entry.format];
      const schema = properties ? { type: "object", properties }
        : entry.format === "image" ? { type: "string", format: "binary" } : string;
      paths[path] = { get: {
        operationId: entry.format + "_" + entry.file.replace(/[^A-Za-z0-9_]/g, "_") + "_" + entry.route_index + "_" + seen.size,
        tags: [folder], "x-apifox-folder": folder, summary: (entry.format === "debug" ? "调试 · " : "") + entry.name,
        description: entry.format === "debug" ? "每次重新执行脚本，成功或失败均返回 HTML，展示请求上下文、执行日志、错误堆栈、上游请求、总耗时和原始输出。" : route.description || entry.name,
        parameters,
        responses: {
          "200": { description: "成功响应", content: { [media_types[entry.format]]: { schema } } },
          default: { description: "请求参数、访问令牌、脚本配置或上游采集错误；HTTP 状态见响应，code 为业务错误码。",
            content: entry.format === "debug" ? { "text/html": { schema: string } }
              : { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
        "x-script-file": entry.file, "x-route-path": entry.path, "x-example": entry.example,
      } };
      if (entry.format !== "debug") {
        const operation = paths[path].get;
        const fields = parameters.filter(parameter => parameter.in === "query" && parameter.name !== "token");
        const required = fields.filter(field => field.required).map(field => field.name);
        paths[path].post = { ...operation, operationId: "post_" + operation.operationId,
          description: "与 GET 返回相同内容；查询参数通过 JSON 请求体提供，token 使用 Authorization: Bearer 请求头。\n\n" + operation.description,
          parameters: parameters.filter(parameter => parameter.in === "path"),
          security: [{}, { bearerAuth: [] }],
          requestBody: { required: required.length > 0, content: { "application/json": { schema: { type: "object",
            properties: Object.fromEntries(fields.map(field => [field.name, { ...field.schema, description: field.description,
              ...(field.example !== undefined ? { example: field.example } : {}) }])),
            ...(required.length ? { required } : {}),
          } } } },
        };
      }
    }
  }
  return {
    openapi: "3.0.3",
    info: { title: "FindRSS 脚本接口", version: "1.0.0",
      description: "从全部脚本元数据生成。配置 ACCESS_TOKEN 时，各接口支持 Authorization: Bearer <令牌> 或 ?token=<令牌>，同时提供时请求头优先；Cookie、API Key 和设备能力由服务端配置。查询参数说明来自 route.parameters 和路由示例。" },
    servers: [{ url: "{{baseURL}}" }],
    security: [{}, { bearerAuth: [] }, { queryToken: [] }],
    paths,
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", description: "部署时设置的 ACCESS_TOKEN；请求头优先于查询参数" },
        queryToken: { type: "apiKey", in: "query", name: "token", description: "部署时设置的 ACCESS_TOKEN，仅填写令牌本身" },
      },
      schemas: { Error: { type: "object", required: ["error", "code", "message"],
        properties: { error: string, code: string, message: string, file: string } } },
    },
  };
}

if (import.meta.main) {
  const { default: scripts } = await import("../dist/scripts.js");
  const document = generate_openapi(scripts);
  await writeFile(new URL("../dist/openapi.json", import.meta.url), JSON.stringify(document, null, 2) + "\n");
  console.log(`已生成 dist/openapi.json，包含 ${Object.keys(document.paths).length} 个接口路径`);
}
