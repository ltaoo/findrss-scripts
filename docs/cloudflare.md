# Cloudflare 部署与脚本巡检

使用 Node.js 22.19.0 或更新版本，首次构建需要 Git、npm 和 GitHub/npm 网络访问。所有命令在本仓库根目录运行。

```sh
npm ci
npm test
npm run dry-run
npx wrangler login
npm run deploy
```

`wrangler.jsonc` 的 Worker 名称为 `findrss-scripts`，自定义域名为 `script.findrss.cloud` 和 `scripts.findrss.cloud`。部署时 Wrangler 自动创建域名绑定、DNS 记录和 HTTPS 证书，需要登录的 Cloudflare 账户有权管理 `findrss.cloud`。也可使用 Cloudflare Workers 的 GitHub 集成：安装命令 `npm ci`，部署命令 `npm run deploy`，Wrangler 会自动执行构建。CI 只测试和打包，不自动发布。

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
| `POST /api/cookies/update` | dm Cookie 同步；其余入口使用 GET |

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
| `COOKIE_KV` | Wrangler KV 绑定，按脚本声明的站点保存加密 Cookie 快照 |
| `COOKIE_STORAGE_KEY` | 64 位十六进制 AES-256-GCM 存储密钥，使用 Secret 配置 |
| `COOKIE_PUSH_UUID` | 与 dm 配置相同的 UUID，使用 Secret 配置 |
| `COOKIE_PUSH_KEY` | `MD5(UUID + "-" + 密码)` 十六进制结果前 16 位，使用 Secret 配置 |
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

绑定 Cookie KV 或配置 Cookie、脚本配置、设备桥接时必须同时设置 `ACCESS_TOKEN`，否则入口返回 503，避免公开登录态采集结果。Cookie 仅发送给脚本声明的来源、路径和名称，明文不会进入沙箱。路由目录不会返回配置值。使用受保护的订阅和图片时，阅读器也需要支持发送访问令牌。

## dm Cookie 同步

只使用 Workers KV，不创建或依赖 D1 / Durable Objects。兼容原版 dm 的 UUID 和密码加密上传，无需修改扩展或填写额外上传令牌：

1. 打开「Cookie 同步」，接口填写 `https://scripts.findrss.cloud/api/cookies/update`。
2. 选择 AES-128-CBC（固定 IV）或 AES-256-CBC（兼容模式），填写与服务端一致的 UUID 和密码。
3. 勾选需要同步的域名，如 `*.instagram.com`；建议间隔设为 5 分钟，再点击「保存并同步当前」。

本机部署凭据位于被 Git 忽略的 `.dev.vars`，供 Wrangler 本地运行及 `npm run deploy -- --secrets-file .dev.vars` 使用。dm 需要填写的 UUID、密码及 RSS 访问令牌保存在本机私有文件 `reports/cookie-sync-setup.json`；不要提交或公开此文件。

上传字段与主项目 `/api/cookies/update` 一致：`uuid`、`data`、`crypto_type`、`update_time`。服务端校验 UUID，使用配置的派生密钥复用生产运行时解密，再校验 Cookie 数据；密码不上传。不要求 `signature`，也不限制上传时间窗口。`domains` 是可选的站点覆盖范围，缺省时从 Cookie 域名推导。请使用 HTTPS 同步地址。

成功响应与主项目一致，包含 `code: 0`、`count`、`skipped`、`msg: "成功"`。无名 Cookie 会跳过；整批都不可用时拒绝覆盖旧数据。未改造的客户端也可使用 `Authorization: Bearer <ACCESS_TOKEN>` 提交原有明文或 AES 数据；明文匿名上传会被拒绝。

同步返回 401 时，`COOKIE_SYNC_ENCRYPTION_REQUIRED` 表示需选择 AES，`COOKIE_SYNC_UUID_MISMATCH` 表示 UUID 与上述本机配置不一致。密码或密文无效时返回 400 和 `COOKIE_SYNC_DECRYPT_FAILED`。不再因缺少签名返回 401。无需发送 Cookie 或密码来排查。

Cookie 按脚本声明的来源分别保存，每条快照均使用随机 IV 和独立存储密钥做 AES-256-GCM 加密，来源也参与完整性校验。更新选中站点时保留其他站点；显式空数组会清除所选站点快照。老客户端不提供 `domains` 时从 Cookie 域名推导范围，空数组必须补充域名范围。没有 Cookie 读取或明文导出接口。

采集时优先使用 KV 的站点快照，尚未同步的站点使用 `SCRIPT_COOKIES` 回退；已清空的 KV 快照不会恢复静态旧值。KV 读取、解密失败会明确报错，不会偷偷退回旧 Cookie。更换存储密钥后需要重新同步所需站点。

RSS 读取仍需 `Authorization: Bearer <ACCESS_TOKEN>`，两个域名均适用。KV 是最终一致存储，更新在其他节点可能延迟 60 秒以上，见 [Cloudflare KV 一致性说明](https://developers.cloudflare.com/kv/concepts/how-kv-works/)。同一站点应只使用一个同步配置，多个客户端并发上传时以最后完成的写入为准。

## GitHub Actions

`.github/workflows/scripts.yml` 在推送、PR 时运行夹具测试和 Wrangler 打包检查。定时和手动运行还会检查部署站点：每 6 小时的 UTC 00:23 / 06:23 / 12:23 / 18:23（北京时间 08:23 / 14:23 / 20:23 / 次日 02:23）。GitHub 的定时任务需要工作流位于默认分支，执行时间可能延后，见 [GitHub 定时事件说明](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)。

在仓库 Settings → Secrets and variables → Actions 设置：

| 类型 | 名称 | 值 |
| --- | --- | --- |
| Variable | `CHECK_BASE_URL` | 已部署的 Worker 完整地址，例如 `https://findrss-scripts.example.workers.dev` |
| Secret | `CHECK_ACCESS_TOKEN` | Worker 的 `ACCESS_TOKEN`；未配置鉴权时留空 |
| Secret | `ROUTE_CHECK_CASES` | 可选的路由样本及预期覆盖 JSON，见下文 |
| Secret | `NOTIFY_TOKEN` | 通知接口的 Bearer 令牌，仅填写令牌值，不包含 `Bearer ` 前缀 |

检查从当前代码构建的本地清单出发，最多同时请求 10 条路由，不依赖线上目录来决定检查范围。检查项全部执行后统一失败退出，不会因首个错误漏测后续路由。每条请求最多 60 秒，完成一条后立即继续下一条，拒绝重定向。报告写入 `reports/routes.json`、`reports/routes.md`、`reports/index.html`，Markdown 展示于 Actions Summary，三份报告与路由正文一起上传为 `route-check-report` artifact。

HTTP 2xx 且正文读取完整、未超过 24MB 的响应，逐条原样保存到 `reports/responses/`，即使后续格式或输出校验失败也保留。目录使用实际请求 URL 的路径（包含样本覆盖后的参数值），不包含查询串。例如 `/rss/github/ltaoo/wx_channels_download/release` 保存为 `reports/responses/rss/github/ltaoo/wx_channels_download/release.xml`，`/api/hot/baidu/hot` 保存为 `reports/responses/api/hot/baidu/hot.json`。RSS/Atom 使用 `.xml`，JSON 使用 `.json`，正文使用 `.html`，图片按响应类型使用扩展名；以 `/` 结尾的路径使用 `index` 文件名。JSON 报告的 `output_file` 记录相对于 `responses/` 的产物路径。每轮先清空正文目录，失败请求不会沿用上轮文件。

定时及手动巡检还会自动创建或更新独立的 `route-reports` 分支，提交上述三份报告及 `reports/responses/` 中的正文。首次提交不包含源码历史；后续提交保留历次报告和正文历史，内容没有变化时跳过提交。每次提交注明对应的源码 SHA。原有产物分支会自动增加本轮正文，并保留旧提交。源码工作区和分支不切换，`reports/` 中其他本机文件不会发布。正文会随产物分支公开，包括使用登录态采集的内容。

巡检有失败项时，已生成的报告仍会发布，任务保持失败状态；未生成完整报告或运行被取消时跳过分支发布。不同源码分支发起的巡检共用发布并发组，串行更新产物分支。发布使用当前仓库的 `GITHUB_TOKEN`，只对巡检任务授予 `contents: write`，PR 测试任务仍为只读。产物提交不会触发只监听默认分支 `master` 的推送 CI。

分支发布不强推；远端冲突、权限不足或分支保护规则拒绝写入时任务会失败，但仍尝试保留 Actions artifact。若已有 `route-reports` 分支包含其他文件，脚本拒绝覆盖，需先调整该分支。部署这些工作流改动到默认分支并配置上表中的地址和访问令牌后，定时任务才会生效。

只要有任一路由校验失败，任务会向工作流中配置的通知接口 POST `{"text":"..."}`，使用仓库 Secret `NOTIFY_TOKEN` 作为 Bearer 令牌。每轮只发送一条汇总，包含失败数、最多 10 条失败路由及原因、本次 Actions 报告链接；全部通过时不推送。令牌不会写入源码、报告、产物分支或消息正文。报告分支发布失败时仍会尝试通知；接口超时或非 2xx 会使通知步骤明确失败，不重试以避免重复消息。

### HTML 报告与 GitHub Pages

首次发布前，在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。无需新增 Secret，也不要选择从 `route-reports` 分支构建：使用 `GITHUB_TOKEN` 推送分支不会自动触发 Pages 构建，见 [GitHub 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

定时或手动运行后，`routes` 任务把三份公开报告复制到独立目录并上传 Pages artifact；`pages` 任务用官方 Actions 部署，默认地址为 **https://ltaoo.github.io/findrss-scripts/**。页面展示巡检时间、通过率、各类脚本、HTTP 状态、耗时、失败阶段和原因，并可下载 JSON/Markdown。分组支持原生折叠，全部结果可通过浏览器查找定位，无需 JavaScript 或访问令牌。

`pages` 任务只授予 `pages: write` 和 `id-token: write`，使用 `github-pages` 环境。只要 Pages artifact 成功上传，即使 `routes` 因检查项失败或通知失败而变红，也会继续部署这份报告；取消运行或没有生成完整报告时跳过。源代码和本机凭据文件不会进入 Pages artifact。页面是最近一次成功部署的快照，通知同时附有页面入口和本次 Actions 链接；本轮 Pages 发布完成后页面才更新，发布失败时仍保留上次快照。

对已有结果也可以在本地单独生成 HTML，无需重新访问上游：

```sh
node scripts/render_route_report.js
```

该命令读取 `reports/routes.json` 并写入 `reports/index.html`。页面只展示校验结果，不保存 RSS XML、热榜原始 JSON、剪藏正文或图片原始内容。

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

需要鉴权时通过环境变量提供 `CHECK_ACCESS_TOKEN`。缺少地址会失败并提示配置；缺少上游 Cookie/API Key/设备、验证页或空内容会记录为失败，不会自动忽略。巡检报告保留 Worker 返回的业务码和描述，详细上游问题可结合 Workers Logs 与对应脚本夹具定位。

## 错误响应

所有错误统一返回 `error`、`code`、`message`，匹配到脚本时还包含 `file`。`error` 保留原有错误码字段，`code` 与它相同，客户端应按 `code` 判断错误类型；描述可随排查建议更新。HTTP 状态按错误类型返回，不再全部使用 502。

例如未配置可用于 Instagram 请求的 Cookie，返回 HTTP 503：

```json
{
  "error": "COOKIE_REQUIRED",
  "code": "COOKIE_REQUIRED",
  "message": "缺少可用于当前请求的 Cookie，请配置该站点的有效登录 Cookie，并检查域名、路径和过期时间",
  "file": "rss/instagram.js"
}
```

错误码、公开描述和 HTTP 状态统一维护于 [`worker/errors.js`](../worker/errors.js)，复用固定生产运行时已有的业务码。包含 Cookie 缺失、上游登录失效、拒绝访问、限流、连接失败、超时、响应不匹配，以及参数、配置、访问鉴权、路由、采集能力、脚本输出和内部错误。

Cookie 在脚本实际携带 Cookie 请求上游时检查：没有匹配当前站点、路径且未过期的 Cookie 时返回 `COOKIE_REQUIRED`；声明权限但未使用 Cookie 的路由仍可匿名运行。已发送 Cookie 后被上游要求登录则返回 `UPSTREAM_AUTH_REQUIRED`，不能仅凭它判断 Cookie 一定过期。脚本已识别的响应错误使用 `UPSTREAM_INVALID_RESPONSE`；未知脚本异常保留 `SCRIPT_FAILED`。公开回包不透传原始异常、Cookie、令牌、上游正文或堆栈。

Cloudflare 配置字段见 [Wrangler 官方配置文档](https://developers.cloudflare.com/workers/wrangler/configuration/)。实际发布前需有自己的 Cloudflare 账户授权；本地打包成功不代表所有第三方站点允许来自 Cloudflare IP 的请求。
