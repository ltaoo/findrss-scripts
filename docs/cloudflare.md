# Cloudflare 部署与脚本巡检

使用 Node.js 22.19.0 或更新版本，首次构建需要 Git、npm 和 GitHub/npm 网络访问。所有命令在本仓库根目录运行。

```sh
npm ci
npm test
npm run dry-run
npx wrangler login
npm run deploy
```

`wrangler.jsonc` 的 Worker 名称默认为 `findrss-scripts`，可按需修改。也可使用 Cloudflare Workers 的 GitHub 集成：安装命令 `npm ci`，部署命令 `npm run deploy`，Wrangler 会自动执行构建。CI 只测试和打包，不自动发布。

构建从 `scripts/prepare_runtime.js` 指定的提交下载 FindRSS 运行时，在 `.runtime/findrss-worker/` 安装依赖。脚本在构建期通过生产 QuickJS 编译校验，生成 `dist/scripts.js` 和 `dist/routes.json`；新增 `.js` 文件或路由后会自动纳入部署和巡检。构建不请求脚本的上游站点。更新运行时提交后需要重新运行全部测试和打包检查。

## 默认入口

| 地址 | 返回内容 |
| --- | --- |
| `/health` | 已加载脚本数和检查项数 |
| `/api/routes` 或 `/` | 所有脚本路由、示例、类型及来源 |
| `/api/hot/<脚本路径>` | 热榜 JSON |
| `/rss/<脚本路径>` | RSS 2.0 |
| `/atom/<脚本路径>` | Atom 1.0 |
| `/api/clip/<脚本路径>` | 剪藏 JSON，包含静态 HTML |
| `/api/detect/<脚本路径>` | 检测 JSON，本次采样的初始快照 |
| `/img/<平台>?url=...` | 经脚本白名单校验的图片 |
| `/fanqienovel/chapter/...`、`/qidian/chapter/...` | 章节 HTML |

所有脚本默认注册，不需要后台导入、发布或数据库。当前 106 个脚本生成 163 个检查项，其中 RSS 同时检查 RSS 和 Atom。Detect 为无状态采样，不保存历史基线。没有管理后台、订阅管理或周期快照存储。

`npm run dev` 启动本地 Workers 运行时。剪藏需要 Cloudflare Browser Rendering，配置已声明 `BROWSER` 绑定；本地模拟不能替代实际浏览器绑定验证。图片与正文代理使用当前访问域名生成地址；自定义公开域名可设置 `FINDRSS_HOSTNAME=https://feeds.example.com`。

## 凭据与设备

公开脚本部署后可直接访问。需要登录的脚本仍需有效 Cookie，YouTube/TikTok Hot 仍需 API 凭据，微信脚本仍需设备能力。注册路由不代表上游允许匿名访问。

通过 Wrangler Secret 配置，或本地使用被 Git 忽略的 `.dev.vars`：

| 配置 | 内容 |
| --- | --- |
| `ACCESS_TOKEN` | 访问令牌；设置后所有入口需 `Authorization: Bearer <令牌>` |
| `SCRIPT_CONFIG` | 按脚本相对文件名索引的配置 JSON |
| `SCRIPT_COOKIES` | 浏览器 Cookie 对象数组 JSON，含 `name/value/domain/path/secure/expirationDate` 等字段 |
| `DEVICE_BRIDGE_URL` | 可选设备调用桥接 HTTPS 地址，接收 POST `{method,args,target_device_id}`，返回设备调用的原始 JSON |
| `DEVICE_BRIDGE_TOKEN` | 可选设备桥接 Bearer 令牌 |

例如 `SCRIPT_CONFIG`：

```json
{
  "hot/youtube_hot.js": { "api_key": "你的 YouTube Data API Key" },
  "hot/tiktok.js": { "advertiser_id": "你的广告账户", "access_token": "你的令牌" },
  "rss/wxchannels.js": { "PlayerHostname": "https://你的播放器域名" }
}
```

```sh
npx wrangler secret put ACCESS_TOKEN
npx wrangler secret put SCRIPT_CONFIG
npx wrangler secret put SCRIPT_COOKIES
```

配置 Cookie、脚本配置或设备桥接时必须同时设置 `ACCESS_TOKEN`，否则入口返回 503，避免公开登录态采集结果。Cookie 仅发送给脚本声明的来源、路径和名称，明文不会进入沙箱。路由目录不会返回配置值。使用受保护的订阅和图片时，阅读器也需要支持发送访问令牌。

## GitHub Actions

`.github/workflows/scripts.yml` 在推送、PR 时运行夹具测试和 Wrangler 打包检查。定时和手动运行还会检查部署站点：每 6 小时的 UTC 00:23 / 06:23 / 12:23 / 18:23（北京时间 08:23 / 14:23 / 20:23 / 次日 02:23）。GitHub 的定时任务需要工作流位于默认分支，执行时间可能延后，见 [GitHub 定时事件说明](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)。

在仓库 Settings → Secrets and variables → Actions 设置：

| 类型 | 名称 | 值 |
| --- | --- | --- |
| Variable | `CHECK_BASE_URL` | 已部署的 Worker 完整地址，例如 `https://findrss-scripts.example.workers.dev` |
| Secret | `CHECK_ACCESS_TOKEN` | Worker 的 `ACCESS_TOKEN`；未配置鉴权时留空 |
| Secret | `ROUTE_CHECK_CASES` | 可选的路由样本及预期覆盖 JSON，见下文 |

检查从当前代码构建的本地清单出发，逐项请求，不依赖线上目录来决定检查范围。检查项全部执行后统一失败退出，不会因首个错误漏测后续路由。每条请求最多 125 秒，并发 3，拒绝重定向。报告写入 `reports/routes.json`、`reports/routes.md`，展示于 Actions Summary，并上传 `route-check-report` artifact。

| 阶段 | 校验 |
| --- | --- |
| 请求 | 请求完成且 HTTP 为 2xx，连接错误、超时、重定向、4xx/5xx 失败 |
| 响应 | 正文读取完成、非空、不超过 24MB |
| 格式 | Content-Type、XML/JSON 结构、RSS 2.0 / Atom 1.0、图片文件签名、HTML 节点 |
| 输出 | 命中预期脚本和 handler；标题及来源链接、条目数、稳定且唯一的 ID、条目链接与日期；热榜排名和热度；剪藏非空正文；检测结果成功且快照完整 |

上游内容随时间变化，在线检查使用内容约束；脚本特定的解析、排序、媒体及错误行为由 `npm test` 的固定回包夹具验证。真实巡检失败不会被空数组、假数据或预期错误码当作成功。

### 检查样本与预期

默认访问每条路由的 `example`，默认要求至少 1 个条目。部分示例的账号、章节可能失效，Apple/微博图片示例包含占位地址，需要用有效且在白名单内的图片 URL 覆盖。合法的空发布仓库可显式设 `min_items: 0`；仍会检查结构、标题、来源和 handler。

`ROUTE_CHECK_CASES` 的键是 `格式 空格 完整路由模式`，可在 `dist/routes.json` 找到。只允许覆盖 `example`、`min_items`、`min_text_length`、`source_host`、`title_includes`，不能跳过检查项。`example` 必须指向当前 Worker，不允许跨站发送访问令牌。

```json
{
  "rss /rss/github/:org/:pro/release": {
    "example": "/rss/github/cloudflare/workers-sdk/release",
    "title_includes": "cloudflare/workers-sdk",
    "min_items": 1
  },
  "atom /atom/github/:org/:pro/release": {
    "example": "/atom/github/cloudflare/workers-sdk/release",
    "title_includes": "cloudflare/workers-sdk",
    "min_items": 1
  },
  "clip /api/clip/web/region": {
    "example": "/api/clip/web/region?url=https%3A%2F%2Fexample.com%2F&selector=body",
    "source_host": "example.com"
  }
}
```

本地也可以运行同一巡检：

```sh
npm run build
CHECK_BASE_URL=https://你的Worker地址 npm run check:routes
```

需要鉴权时通过环境变量提供 `CHECK_ACCESS_TOKEN`。缺少地址会失败并提示配置；缺少上游 Cookie/API Key/设备、验证页或空内容会记录为失败，不会自动忽略。Worker 的 502 响应提供错误码和脚本文件名，详细上游问题可结合 Workers Logs 与对应脚本夹具定位。

Cloudflare 配置字段见 [Wrangler 官方配置文档](https://developers.cloudflare.com/workers/wrangler/configuration/)。实际发布前需有自己的 Cloudflare 账户授权；本地打包成功不代表所有第三方站点允许来自 Cloudflare IP 的请求。
