# Clip 剪藏脚本

每个平台独立维护剪藏脚本，导出 `kind = "clip"`、`version`、`platform` 和 `route` / `routes`，可选 `permissions`、`config_schema`。用户在后台导入、Debug、发布，再创建剪藏记录并选择具体脚本路由。

`platform` 与 RSS / Hot 脚本格式一致，例如 `export const platform = { name: "GitHub", icon: "https://github.githubassets.com/favicons/favicon.svg" };`。`name` 为 1–64 字符的平台名称；`icon` 支持 SVG 源码、无凭据的 HTTP(S) 地址或站内图片路径，留空使用默认图标。示例内嵌 SVG，无需额外请求图标。所有路由默认继承此配置，也可在单条 `route.platform` 中覆盖。

`ClipScript.fetch(ctx)` 返回 `Result<{ title, link, html, stats? }>`。`run(ctx)` 生成 `kind: "clip"` 结果，宿主校验来源 URL、清理 HTML 并填写 `captured_at`，内容上限 8MB。图片和样式内嵌，公开 `/clips/<ID>` 只读取最近成功快照。

`ctx.clip.capture(url, { selector, viewport?, wait_ms?, id_prefix? })` 返回 `Result<{ title, html, stats }>`，共享节点提取、计算样式冻结和图片内嵌能力。选择器和平台页面规则写在平台脚本内。使用此方法需要 Worker 的 `BROWSER` 绑定；浏览器保持匿名，不会自动注入已授权 Cookie。脚本也可用 `ctx.fetchText` 获取数据并生成 HTML，此时无需浏览器。

| 脚本 | 示例路由 | 用途 |
| --- | --- | --- |
| [GitHub README](github.js) | `/github/ltaoo/findrss-worker` | 平台脚本自动选择 README 区域 |
| [百度天气](baidu_weather.js) | `/baidu/s/weather/上海` | 当前天气、体感、湿度、风及未来三天预报，无需浏览器绑定 |
| [通用网页](website.js) | `/web/region?url=https%3A%2F%2Fexample.com%2F&selector=body` | 自定义网页及旧手动剪藏记录的兼容入口 |

路由本身可直接访问，路由前加 `/api/clip` 或 `/clip` 也可获取相同的剪藏 JSON。后台「剪藏」中保存脚本、具体路由与刷新策略，公开链接保持固定；上游错误不会替换旧快照。尚未发布、停用或已删除的脚本不会用于刷新。修改平台规则后在后台发布新版本即可更新已有剪藏。

百度天气参考 wizm 天气 App，从百度搜索结果的 `s-data` 提取天气并生成静态卡片。例如 `/api/clip/baidu/s/weather/上海`；省略城市使用百度定位。优先读取实时观测，缺失时使用小时数据和当天预报；未来三天从选中日期开始，不包含昨天。无预报时明确显示「暂无预报」，验证码、缺失天气数据和 HTTP 错误会直接报错。

此脚本按要求将个人百度 Cookie 明文写入 `baidu_weather.js`，不会读取 `SCRIPT_COOKIES` 或使用 Browser Rendering。分享源码会同时分享这些登录凭据；Cookie 失效时需修改源码并重新发布。仓库固定运行时通过 `inline-cookies` 补丁支持直接填写 Cookie 请求头，同站重定向保留，跨站后移除且不会恢复；导入其他 FindRSS 部署时，需要运行时也支持此能力。

验证在 findrss-worker 根目录运行 `node --test test/clip_scripts.test.js test/clips.test.js admin/__tests__/clips.test.mjs`。测试使用模拟浏览器回包；实际页面选择器和外观请手动验证。
