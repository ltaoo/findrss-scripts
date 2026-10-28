# Clip 剪藏脚本

每个平台独立维护剪藏脚本，导出 `kind = "clip"`、`version`、`platform` 和 `route` / `routes`，可选 `permissions`、`config_schema`。用户在后台导入、Debug、发布，再创建剪藏记录并选择具体脚本路由。

`ClipScript.fetch(ctx)` 返回 `Result<{ title, link, html, stats? }>`。`run(ctx)` 生成 `kind: "clip"` 结果，宿主校验来源 URL、清理 HTML 并填写 `captured_at`，内容上限 8MB。图片和样式内嵌，公开 `/clips/<ID>` 只读取最近成功快照。

`ctx.clip.capture(url, { selector, viewport?, wait_ms?, id_prefix? })` 返回 `Result<{ title, html, stats }>`，共享节点提取、计算样式冻结和图片内嵌能力。选择器和平台页面规则写在平台脚本内。使用此方法需要 Worker 的 `BROWSER` 绑定；浏览器保持匿名，不会自动注入已授权 Cookie。脚本也可用 `ctx.fetchText` 获取数据并生成 HTML，此时无需浏览器。

| 脚本 | 示例路由 | 用途 |
| --- | --- | --- |
| [GitHub README](github.js) | `/github/ltaoo/findrss-worker/readme` | 平台脚本自动选择 README 区域 |
| [通用网页](website.js) | `/web/region?url=https%3A%2F%2Fexample.com%2F&selector=body` | 自定义网页及旧手动剪藏记录的兼容入口 |

路由前加 `/api/clip` 获取剪藏 JSON。后台「剪藏」中保存脚本、具体路由与刷新策略，公开链接保持固定；上游错误不会替换旧快照。尚未发布、停用或已删除的脚本不会用于刷新。修改平台规则后在后台发布新版本即可更新已有剪藏。

验证在 findrss-worker 根目录运行 `node --test test/clip_scripts.test.js test/clips.test.js admin/__tests__/clips.test.mjs`。测试使用模拟浏览器回包；实际页面选择器和外观请手动验证。
