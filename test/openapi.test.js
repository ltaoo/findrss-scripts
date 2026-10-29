import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import scripts from "../dist/scripts.js";
import { generate_openapi } from "../scripts/generate_openapi.js";
import { route_cases, debug_route_cases } from "../worker/catalog.js";

test("构建生成的 OpenAPI 覆盖全部脚本和路由，参数、操作 ID 和响应引用有效", async () => {
  const document = JSON.parse(await readFile(new URL("../dist/openapi.json", import.meta.url), "utf8"));
  assert.deepEqual(document, generate_openapi(scripts));
  assert.equal(document.openapi, "3.0.3");
  assert.deepEqual(document.servers, [{ url: "{{baseURL}}" }]);
  const operations = Object.values(document.paths).map(path => path.get);
  assert.deepEqual(new Set(operations.map(operation => operation["x-script-file"])), new Set(scripts.map(script => script.file)));
  assert.deepEqual(new Set(operations.map(operation => operation["x-route-path"])), new Set([...route_cases(scripts), ...debug_route_cases(scripts)].map(entry => entry.path)));
  assert.equal(new Set(operations.map(operation => operation.operationId)).size, operations.length);
  const signatures = new Set();
  const script_kinds = new Map(scripts.map(script => [script.file, script.metadata.kind]));
  for (const [path, { get }] of Object.entries(document.paths)) {
    assert.equal(get.tags.length, 1);
    const [kind, category] = get.tags[0].split("/");
    assert.equal(kind, script_kinds.get(get["x-script-file"]));
    assert.ok(category);
    assert.equal(get["x-apifox-folder"], get.tags[0]);
    assert.ok(!path.includes("?") && !path.includes(":"));
    const signature = path.replace(/\{[^}]+\}/g, "{}");
    assert.ok(!signatures.has(signature), path);
    signatures.add(signature);
    assert.deepEqual(get.parameters.filter(parameter => parameter.in === "path").map(parameter => parameter.name),
      [...path.matchAll(/\{([^}]+)\}/g)].map(match => match[1]));
    assert.equal(new Set(get.parameters.map(parameter => parameter.in + " " + parameter.name)).size, get.parameters.length);
    for (const parameter of get.parameters) {
      assert.equal(parameter.schema.type, "string");
      if (parameter.in === "path") assert.equal(parameter.required, true);
    }
    assert.ok(Object.keys(get.responses["200"].content).length);
    if (path.startsWith("/debug/")) assert.equal(get.responses.default.content["text/html"].schema.type, "string");
    else assert.equal(get.responses.default.content["application/json"].schema.$ref, "#/components/schemas/Error");
  }
  assert.equal(document.components.securitySchemes.bearerAuth.scheme, "bearer");
  assert.deepEqual(document.components.securitySchemes.queryToken, {
    type: "apiKey", in: "query", name: "token", description: "部署时设置的 ACCESS_TOKEN，仅填写令牌本身",
  });
  assert.deepEqual(document.security, [{}, { bearerAuth: [] }, { queryToken: [] }]);
});

test("每个 Kind 下按内容类别分组，同一脚本的 RSS、Atom、正文和图片保留所属目录", () => {
  const { paths } = generate_openapi(scripts);
  const folders = {
    "/api/hot/qidian/rank/yuepiao": "hot/小说",
    "/api/hot/nhk/headlines": "hot/新闻",
    "/rss/qidian/book/{book_id}": "rss/小说",
    "/atom/qidian/book/{book_id}": "rss/小说",
    "/qidian/chapter/{book_id}/{chapter_id}": "rss/小说",
    "/rss/wxmp/{account}": "rss/资讯",
    "/img/wxmp": "rss/资讯",
    "/rss/apple/apps/update/{country}/{id}": "rss/科技",
    "/rss/avmoo/star/{id}": "rss/影视",
    "/rss/javbus/star/{id}": "rss/影视",
    "/rss/javlibrary/star/{id}": "rss/影视",
    "/api/clip/github/{owner}/{repo}/readme": "clip/科技",
    "/api/clip/web/region": "clip/网页",
    "/api/detect/github/{owner}/{repo}/releases/detect": "detect/科技",
    "/api/detect/web/text/detect": "detect/网页",
  };
  for (const [path, folder] of Object.entries(folders)) {
    assert.ok(paths[path], path);
    assert.deepEqual(paths[path].get.tags, [folder], path);
    assert.equal(paths[path].get["x-apifox-folder"], folder, path);
  }
  assert.ok(Object.values(paths).every(path => !path.get.tags[0].endsWith("/其他")));
});

test("分类优先使用脚本元数据，没有类别的新增脚本进入其他目录", () => {
  const metadata = { kind: "rss", routes: [{ route_index: 0, name: "Example", path: "/example", example: "/example" }] };
  for (const [file, category, expected] of [
    ["rss/69shuba.js", " 自定义 ", "rss/自定义"],
    ["rss/69shuba.js", "", "rss/小说"],
    ["rss/new.js", undefined, "rss/其他"],
  ]) {
    const { paths } = generate_openapi([{ file, metadata: { ...metadata, category } }]);
    assert.deepEqual(paths["/rss/example"].get.tags, [expected]);
  }
});

test("可选路径展开时保留正确参数，不将省略的路径参数误写成查询参数", () => {
  const { paths } = generate_openapi(scripts);
  const base = "/api/hot/apple-charts";
  assert.ok(paths[base]);
  assert.ok(paths[base + "/{country}"]);
  assert.ok(paths[base + "/{country}/{type}"]);
  assert.equal(paths[base + "/{type}"], undefined);
  assert.deepEqual(paths[base].get.parameters, []);
  assert.deepEqual(paths[base + "/{country}/{type}"].get.parameters.map(parameter => parameter.example), ["us", "podcasts"]);
  assert.ok(paths["/rss/wxmp"].get.parameters.some(parameter => parameter.name === "username" && parameter.in === "query"));
});

test("查询参数、脚本说明、示例和各类响应格式进入文档", () => {
  const { paths } = generate_openapi(scripts);
  const clip = paths["/api/clip/web/region"].get;
  assert.deepEqual(clip.parameters.map(parameter => parameter.name), ["url", "selector", "viewport_width", "viewport_height", "wait_ms", "id_prefix"]);
  assert.equal(clip.parameters[0].example, "https://example.com/");
  assert.equal(clip.parameters[0].required, true);
  assert.equal(clip.parameters[1].example, "body");
  assert.match(clip.description, /查询参数/);
  assert.ok(clip.responses["200"].content["application/json"].schema.properties.html);
  assert.equal(paths["/img/apple"].get.responses["200"].content["image/*"].schema.format, "binary");
  assert.ok(paths["/rss/github/{org}/{pro}/release"].get.responses["200"].content["application/rss+xml"]);
  assert.ok(paths["/atom/github/{org}/{pro}/release"].get.responses["200"].content["application/atom+xml"]);
  assert.ok(paths["/qidian/chapter/{book_id}/{chapter_id}"].get.responses["200"].content["text/html"]);
  assert.ok(paths["/api/detect/web/text/detect"].get.responses["200"].content["application/json"].schema.properties.snapshot);
  assert.ok(paths["/rss/apple/apps/update/{country}/{id}"].get.parameters.some(parameter => parameter.name === "limit" && parameter.in === "query"));
});

test("中段可选参数和正则参数正确转换，等价路由模板冲突时拒绝覆盖", () => {
  const fixture = routes => [{ file: "hot/example.js", metadata: { kind: "hot", routes: routes.map((route, route_index) => ({ name: "Example", ...route, route_index })) } }];
  const document = generate_openapi(fixture([{ path: "/example/:id{[0-9]+}?/detail", example: "/example/123/detail" }]));
  assert.deepEqual(Object.keys(document.paths), ["/api/hot/example/{id}/detail", "/api/hot/example/detail",
    "/debug/example/{id}/detail", "/debug/example/detail"]);
  const parameter = document.paths["/api/hot/example/{id}/detail"].get.parameters[0];
  assert.equal(parameter.schema.pattern, "^(?:[0-9]+)$");
  assert.equal(parameter.example, "123");
  assert.throws(() => generate_openapi(fixture([
    { path: "/example/:id", example: "/example/123" },
    { path: "/example/:name", example: "/example/abc" },
  ])), /路径冲突/);
});
