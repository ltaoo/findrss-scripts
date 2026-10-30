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

构建从 `scripts/prepare_runtime.js` 指定的提交下载 FindRSS 运行时，应用 `scripts/patches/` 中的抖音签名、Debug 版本展示、脚本内置 Cookie 和 `@findrss/core` 基类模块补丁，再在 `.runtime/findrss-worker/` 安装依赖。脚本在构建期通过生产 QuickJS 编译校验，生成 `dist/scripts.js` 和仅含 `/api` 前缀的巡检清单 `dist/routes.json`；新增 `.js` 文件或路由后会自动纳入部署和巡检。构建不请求脚本的上游站点。更新运行时提交后需要重新运行全部测试和打包检查。

## 默认入口

| 地址 | 返回内容 |
| --- | --- |
| `/health` | 已加载脚本数和已注册路由数（含别名） |
| `/api/routes` 或 `/` | 全部已注册路由（含别名）、示例、类型及来源 |
| `/api/hot/<脚本路径>` | 热榜 JSON |
| `/rss/<脚本路径>` | RSS 2.0 |
| `/atom/<脚本路径>` | Atom 1.0 |
| `/api/rss/<脚本路径>` | 订阅 JSON 快照 |
| `/api/clip/<脚本路径>` | 剪藏 JSON，包含静态 HTML |
| `/api/detect/<脚本路径>` | 检测 JSON，本次采样的初始快照 |
| `/img/<平台>?url=...` | 经脚本白名单校验的图片 |
| `/fanqienovel/chapter/...`、`/qidian/chapter/...` | 章节 HTML |
| `/debug/<脚本声明路径>` | 脚本诊断 HTML，支持全部脚本及附加路由 |
| `POST /api/cookies/update` | dm Cookie 同步 |

脚本声明的路径本身也可直接访问；上述 `/rss`、`/api/hot` 等是根据脚本 `kind` 增加的命名空间。章节正文、图片代理等附加路由没有命名空间，直接按声明路径访问。

脚本路由同时支持 GET 和 POST。POST 使用 `Content-Type: application/json`，JSON 对象中的字符串、数字或布尔值作为查询参数传入脚本（覆盖同名 query；null 忽略），路径参数仍写在 URL 中。请求体最多 2MB，不接受嵌套对象或数组；请求体中的 `token` 不用于授权，也不会传入脚本。建议 POST 使用 `Authorization: Bearer <token>`；管理入口与 Debug 仍仅支持 GET。

所有脚本默认注册，不需要后台导入、发布或数据库。当前 102 个脚本生成 137 个检查项，巡检仅覆盖 `/api/rss`、`/api/hot`、`/api/clip` 和 `/api/detect` 四个规范前缀。Detect 为无状态采样，不保存历史基线。没有管理后台、订阅管理或周期快照存储。

`npm run dev` 启动本地 Workers 运行时。GitHub README 和通用网页剪藏需要 Cloudflare Browser Rendering，配置已声明 `BROWSER` 绑定；本地模拟不能替代实际浏览器绑定验证。百度天气剪藏通过 `fetchText` 生成天气卡片，使用脚本内置 Cookie，无需浏览器绑定；示例 `/api/clip/baidu/s/weather/上海`，省略城市时使用百度定位。图片与正文代理使用当前访问域名生成地址；自定义公开域名可设置 `FINDRSS_HOSTNAME=https://feeds.example.com`。

## 凭据与设备

公开脚本部署后可直接访问。需要登录的脚本仍需有效 Cookie，YouTube/TikTok Hot 仍需 API 凭据，微信脚本需配置接口服务地址及 Bearer 令牌。注册路由不代表上游允许匿名访问。

通过 Wrangler Secret 配置，或本地使用被 Git 忽略的 `.dev.vars`：

| 配置 | 内容 |
| --- | --- |
| `ACCESS_TOKEN` | 访问令牌；设置后所有入口需 `Authorization: Bearer <令牌>` 或 `?token=<令牌>`，同时提供时请求头优先 |
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
  "rss/wxmp.js": { "api_url": "https://dhub.funzm.com/api/wxmp/biz/msg/list", "auth_token": "你的接口令牌" },
  "rss/wxchannels.js": { "api_url": "https://dhub.funzm.com/api/wxchannels/contact/feed/list", "auth_token": "你的接口令牌", "PlayerHostname": "https://你的播放器域名" }
}
```

```sh
npx wrangler secret put ACCESS_TOKEN
npx wrangler secret put SCRIPT_CONFIG
npx wrangler secret put SCRIPT_COOKIES
```

微信脚本将 `api_url` 作为完整接口地址直接 POST，不拼接或修改路径。视频号填写 `https://dhub.funzm.com/api/wxchannels/contact/feed/list`，公众号填写 `https://dhub.funzm.com/api/wxmp/biz/msg/list`。请求体为 `{username,offset}`，`auth_token` 仅通过 `Authorization: Bearer` 请求头发送。FindRSS 后台导入脚本时可通过脚本「配置」填写相同字段。

绑定 Cookie KV 或配置 Cookie、脚本配置、设备桥接时必须同时设置 `ACCESS_TOKEN`，否则入口返回 503，避免公开登录态采集结果。Cookie 仅发送给脚本声明的来源、路径和名称，明文不会进入沙箱。路由目录不会返回配置值。所有入口均支持请求头或查询参数传递访问令牌；例如 `http://127.0.0.1:8801/debug/wxmp/wow36kr?token=<ACCESS_TOKEN>`，已有查询参数时用 `&token=`。令牌包含特殊字符时需 URL 编码。请求头存在时优先验证请求头，即使无效也不回退查询令牌。鉴权后移除 `token`，不会将其传入脚本、诊断上下文或 RSS/Atom 的 self URL。URL 仍可能保存在浏览器历史和访问日志中。

## dm Cookie 同步

只使用 Workers KV，不创建或依赖 D1 / Durable Objects。兼容原版 dm 的 UUID 和密码加密上传，无需修改扩展或填写额外上传令牌：

1. 打开「Cookie 同步」，接口填写 `https://scripts.findrss.cloud/api/cookies/update`。
2. 选择 AES-128-CBC（固定 IV）或 AES-256-CBC（兼容模式），填写与服务端一致的 UUID 和密码。
3. 勾选需要同步的域名，如 `*.instagram.com`；建议间隔设为 5 分钟，再点击「保存并同步当前」。

本机部署凭据位于被 Git 忽略的 `.dev.vars`，供 Wrangler 本地运行及 `npm run deploy -- --secrets-file .dev.vars` 使用。dm 需要填写的 UUID、密码及 RSS 访问令牌保存在本机私有文件 `reports/cookie-sync-setup.json`；不要提交或公开此文件。

上传字段与主项目 `/api/cookies/update` 一致：`uuid`、`data`、`crypto_type`、`update_time`。服务端校验 UUID，使用配置的派生密钥复用生产运行时解密，再校验 Cookie 数据；密码不上传。不要求 `signature`，也不限制上传时间窗口。`domains` 是可选的站点覆盖范围，缺省时从 Cookie 域名推导。请使用 HTTPS 同步地址。

成功响应与主项目一致，包含 `code: 0`、`count`、`skipped`、`msg: "成功"`。无名 Cookie 会跳过；整批都不可用时拒绝覆盖旧数据。未改造的客户端也可使用 `Authorization: Bearer <ACCESS_TOKEN>` 或 `?token=<ACCESS_TOKEN>` 提交原有明文或 AES 数据；明文匿名上传会被拒绝。

同步返回 401 时，`COOKIE_SYNC_ENCRYPTION_REQUIRED` 表示需选择 AES，`COOKIE_SYNC_UUID_MISMATCH` 表示 UUID 与上述本机配置不一致。密码或密文无效时返回 400 和 `COOKIE_SYNC_DECRYPT_FAILED`。不再因缺少签名返回 401。无需发送 Cookie 或密码来排查。

Cookie 按脚本声明的来源分别保存，每条快照均使用随机 IV 和独立存储密钥做 AES-256-GCM 加密，来源也参与完整性校验。更新选中站点时保留其他站点；显式空数组会清除所选站点快照。老客户端不提供 `domains` 时从 Cookie 域名推导范围，空数组必须补充域名范围。没有 Cookie 读取或明文导出接口。

采集时优先使用 KV 的站点快照，尚未同步的站点使用 `SCRIPT_COOKIES` 回退；已清空的 KV 快照不会恢复静态旧值。KV 读取、解密失败会明确报错，不会偷偷退回旧 Cookie。更换存储密钥后需要重新同步所需站点。

RSS 读取支持 `Authorization: Bearer <ACCESS_TOKEN>` 或 `?token=<ACCESS_TOKEN>`，两个域名均适用。KV 是最终一致存储，更新在其他节点可能延迟 60 秒以上，见 [Cloudflare KV 一致性说明](https://developers.cloudflare.com/kv/concepts/how-kv-works/)。同一站点应只使用一个同步配置，多个客户端并发上传时以最后完成的写入为准。

## GitHub Actions

`.github/workflows/scripts.yml` 在推送、PR 时运行夹具测试和 Wrangler 打包检查。定时和手动运行还会检查部署站点：每 6 小时的 UTC 00:23 / 06:23 / 12:23 / 18:23（北京时间 08:23 / 14:23 / 20:23 / 次日 02:23）。GitHub 的定时任务需要工作流位于默认分支，执行时间可能延后，见 [GitHub 定时事件说明](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)。

在仓库 Settings → Secrets and variables → Actions 设置：

| 类型 | 名称 | 值 |
| --- | --- | --- |
| Variable | `CHECK_BASE_URL` | 已部署的 Worker 完整地址，例如 `https://findrss-scripts.example.workers.dev` |
| Secret | `CHECK_ACCESS_TOKEN` | Worker 的 `ACCESS_TOKEN`；未配置鉴权时留空 |
| Secret | `ROUTE_CHECK_CASES` | 可选的路由样本及预期覆盖 JSON，见下文 |
| Secret | `NOTIFY_TOKEN` | 通知接口的 Bearer 令牌，仅填写令牌值，不包含 `Bearer ` 前缀 |

检查从当前代码构建的本地清单出发，最多同时请求 10 条路由，不依赖线上目录来决定检查范围。检查项全部执行后统一失败退出，不会因首个错误漏测后续路由。每条请求最多 60 秒，完成一条后立即继续下一条，拒绝重定向。报告写入 `reports/routes.json`、`reports/routes.md`、`reports/index.html`、`reports/README.md`，Markdown 展示于 Actions Summary，四份报告与路由正文、`reports/icons/` 中的脚本图标一起上传为 `route-check-report` artifact。

HTTP 2xx 且正文读取完整、未超过 24MB 的响应，逐条原样保存到 `reports/responses/`，即使后续格式或输出校验失败也保留。目录使用实际请求 URL 的路径（包含样本覆盖后的参数值），不包含查询串明文；有查询参数时，在扩展名前添加查询串的 SHA-256 前 16 位，避免多个样本相互覆盖。例如 `/rss/github/ltaoo/wx_channels_download/release` 保存为 `reports/responses/rss/github/ltaoo/wx_channels_download/release.xml`，`/api/hot/baidu/board` 保存为 `reports/responses/api/hot/baidu/hot.json`。RSS/Atom 使用 `.xml`，JSON 使用 `.json`，正文使用 `.html`，图片按响应类型使用扩展名；以 `/` 结尾的路径使用 `index` 文件名。JSON 报告的 `output_file` 记录相对于 `responses/` 的产物路径；同一路由有多个样本时，详细结果和产物路径保存在该路由的 `samples` 中。每轮先清空正文目录，失败请求不会沿用上轮文件。

定时及手动巡检还会自动创建或更新独立的 `route-reports` 分支，提交上述报告、`reports/responses/` 中的正文及 `reports/icons/` 中的脚本图标。分支根目录同时提供 `README.md`、`index.html`、`routes.json`、`routes.md` 和禁用 Jekyll 的 `.nojekyll`，JSON/Markdown 报告可通过文件路径访问；原有 `reports/` 下的报告路径继续保留。打开分支即可看到 README 结果表格，按脚本聚合所有格式的路由，展示脚本版本及可用的平台图标，路由表仅保留路由、成功／失败和失败原因；失败项优先，点击脚本路径直接打开 `master` 分支的 Raw 源码，方便复制复用。首次提交不包含源码历史；后续提交保留历次报告和正文历史，内容没有变化时跳过提交。每次提交注明对应的源码 SHA。原有产物分支会自动增加这些根目录文件和本轮正文，并保留旧提交。源码工作区和分支不切换，源码 README 不会被生成报告覆盖，`reports/` 中其他本机文件不会发布。正文会随产物分支公开，包括使用登录态采集的内容。

巡检有失败项时，已生成的报告仍会发布。巡检脚本保留非零退出码，workflow 的巡检步骤以生成 `reports/index.html` 为成功条件，路由失败不会使该步骤失败；发布或通知自身出错仍会使任务失败。未生成完整报告或运行被取消时跳过分支发布。不同源码分支发起的巡检共用发布并发组，串行更新产物分支。发布使用当前仓库的 `GITHUB_TOKEN`，只对巡检任务授予 `contents: write`，PR 测试任务仍为只读。产物提交不会触发只监听默认分支 `master` 的推送 CI。

分支发布不强推；远端冲突、权限不足或分支保护规则拒绝写入时任务会失败，但仍尝试保留 Actions artifact。若已有 `route-reports` 分支包含其他文件，脚本拒绝覆盖，需先调整该分支。部署这些工作流改动到默认分支并配置上表中的地址和访问令牌后，定时任务才会生效。

只要有任一路由校验失败，任务会向工作流中配置的通知接口 POST `{"text":"..."}`，使用仓库 Secret `NOTIFY_TOKEN` 作为 Bearer 令牌。每轮只发送一条汇总，包含失败数、最多 10 条失败路由及原因、本次 Actions 报告链接；全部通过时不推送。令牌不会写入源码、报告、产物分支或消息正文。报告分支发布失败时仍会尝试通知；接口超时或非 2xx 会使通知步骤明确失败，不重试以避免重复消息。

### 脚本市场与 GitHub Pages

页头齿轮按钮打开设置弹窗，保存 Worker 的 `baseURL` 和 `token`。巡检结果的路由下方提供 Plus 图标（添加示例），按脚本的路径参数、查询参数说明及公开示例动态显示表单，生成 GET URL 和 POST curl，支持复制。GET 的 token 位于 query，POST 的 token 位于 Authorization 请求头，查询参数通过 JSON 请求体发送。点击「保存示例」会按脚本文件和完整路由分别保存多个参数示例，显示在 Plus 图标左侧。点击示例打开并修改，点击 × 删除；刷新后仍保留。旧版单组参数自动兼容为一个示例；设置及参数仅存当前站点的 localStorage，其中 token 为明文，不会上传到报告。浏览器禁用存储时会显示保存失败。

首次发布前，在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。无需新增 Secret，也不要选择从 `route-reports` 分支构建：使用 `GITHUB_TOKEN` 推送分支不会自动触发 Pages 构建，见 [GitHub 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

如果使用分支发布，发布源应为 **Deploy from a branch → route-reports → /(root)**，分支根目录已包含入口和下载文件。但当前工作流的 `GITHUB_TOKEN` 推送仍不会触发这种发布模式的自动构建；需另行使用有权限用户的推送或合适的发布凭据触发，不能仅切换设置就保证每轮巡检后站点更新。现有工作流已包含完整的 Pages artifact 部署，建议保留 **GitHub Actions** 模式。

定时或手动运行后，`routes` 任务把三份公开报告复制到独立目录并上传 Pages artifact；`pages` 任务用官方 Actions 部署，默认地址为 **https://ltaoo.github.io/findrss-scripts/**。首页是「脚本市场（Script Market）」，按脚本展示名称、类型、路径、版本及脚本自身的内嵌图标，提供 RSS、Hot、Clip、Detect 分类，支持按名称、文件路径或路由搜索。文件路径直接打开 `master` 分支 Raw 源码，旁边图标复制 Raw 地址。版本号和巡检通过数量位于卡片右上角，点击巡检状态打开结果弹窗，可点击遮罩或关闭按钮关闭。通过样本提供「查看产物」，在新窗口打开 `route-reports` 分支中对应响应文件的 GitHub Raw URL，多样本分别提供入口。复制结果的 Toast 在 2.5 秒后自动关闭，连续复制会重新计时。README 和 JSON 保留原有巡检用途。搜索、复制和巡检弹窗需要 JavaScript，复制需要浏览器允许剪贴板写入。

`pages` 任务只授予 `pages: write` 和 `id-token: write`，使用 `github-pages` 环境。只要 Pages artifact 成功上传，即使 `routes` 因发布或通知失败而变红，也会继续部署这份页面；取消运行或没有生成完整报告时跳过。HTML 只包含脚本目录元数据和巡检摘要，Pages artifact 包含 HTML 以及 JSON/Markdown 报告，本机凭据文件不会进入其中。页面是最近一次成功部署的快照，通知同时附有页面入口和本次 Actions 链接；本轮 Pages 发布完成后页面才更新，发布失败时仍保留上次快照。

页面使用 Timeless 0.34.2：`scripts/script_market_view.js` 是 Node SSR 与浏览器 hydration 共用的 View，`scripts/script_market.js` 维护业务 Model，`scripts/script_market.css` 保留原有样式。`scripts/render_route_report.js` 先生成完整页面，再内嵌同版本运行时、交互代码及公开目录数据；浏览器复用 SSR 节点后才读取 localStorage 中的设置与示例。Timeless 资源来自构建时固定的 FindRSS 运行时，原有单文件 HTML 和发布流程保持一致。

对已有结果也可以在本地单独生成 HTML，无需重新访问上游：

```sh
node scripts/render_route_report.js
```

该命令读取 `reports/routes.json` 和已构建的 `dist/scripts.js`，写入 `reports/index.html`，并沿用报告中的 `mode`：本地巡检（`--local` 或回环地址）记录为 `dev`，产物使用相对当前报告目录的 `./responses/` prefix，可直接打开本地文件；其他巡检记录为 `release`，使用产物分支的 GitHub Raw prefix。未记录 `mode` 的旧报告按 `release` 处理。本地查看时需保留报告旁的 `responses/` 目录。

| 阶段 | 校验 |
| --- | --- |
| 请求 | 请求完成且 HTTP 为 2xx，连接错误、超时、重定向、4xx/5xx 失败 |
| 响应 | 正文读取完成、非空、不超过 24MB |
| 格式 | Content-Type、JSON 结构（`/api/rss` 还检查标题、来源链接与条目）、图片文件签名、HTML 节点 |
| 输出 | 命中预期脚本和 handler；标题及来源链接、条目数、稳定且唯一的 ID、条目链接与日期；热榜排名和热度；剪藏非空正文；检测结果成功且快照完整 |

上游内容随时间变化，在线检查使用内容约束；脚本特定的解析、排序、媒体及错误行为由 `npm test` 的固定回包夹具验证。真实巡检失败不会被空数组、假数据或预期错误码当作成功。

### 检查样本与预期

默认访问每条路由的 `example`，默认要求至少 1 个条目。部分示例的账号、章节可能失效，Apple/微博图片示例包含占位地址，需要用有效且在白名单内的图片 URL 覆盖。合法的空发布仓库可显式设 `min_items: 0`；仍会检查结构、标题、来源和 handler。

GitHub 巡检配置保存在 [`.github/route-checks.json`](../.github/route-checks.json)，由 `scripts/check_routes.js` 在执行巡检时读取，工作流通过 `ROUTE_CHECK_CONFIG` 指定文件路径，本地未指定时也读取该文件。配置不参与构建，不写入 `dist/`，Worker 不读取或导入它，修改后无需重新部署 CF。

配置的键是 `格式 空格 完整路由模式`，可在 `dist/routes.json` 找到；其中格式为 `rss_json`、`hot`、`clip` 或 `detect`，路径均以 `/api` 开头。每个键支持样本数组，也兼容原来的单个对象；有配置时替代该路由的默认样本，未配置的路由继续使用脚本 `example`。数组不能为空；未知路由、字段错误或跨站样本会在发请求前报错。GitHub Secret `ROUTE_CHECK_CASES` 使用相同格式，按配置键覆盖文件中的整组样本，不逐项合并。只允许覆盖 `example`、`min_items`、`min_text_length`、`source_host`、`title_includes`，不能跳过检查项。`example` 必须指向当前 Worker，不允许跨站发送访问令牌。

```json
{
  "rss_json /api/rss/wxmp/:account?": [
    { "example": "/api/rss/wxmp/wow36kr" },
    { "example": "/api/rss/wxmp/zhihuribao" }
  ],
  "rss_json /api/rss/github/:org/:pro/release": [
    {
      "example": "/api/rss/github/cloudflare/workers-sdk/release",
      "title_includes": "cloudflare/workers-sdk",
      "min_items": 1
    }
  ]
}
```

巡检只读取 `dist/routes.json` 中的 `/api/rss`、`/api/hot`、`/api/clip` 和 `/api/detect` 路由；`/rss`、`/atom`、`/hot`、`/clip`、`/detect` 及脚本声明路径是访问别名，不单独巡检。当前仓库配置为 `rss/wxmp.js` 的 `wow36kr`、`zhihuribao` 和 `rss/wxchannels.js` 的两个视频号账号检查 `/api/rss` JSON 快照。每条已注册路由的所有样本通过才算成功，任一样本失败即为失败；HTML、README、通知和汇总计数仍以路由为单位，失败原因包含出错的样本地址，JSON 的 `samples` 保留逐样本详情。

本地也可以运行同一巡检：

```sh
npm run build
npm run check:local                            # 连接 npm run dev，默认 http://127.0.0.1:8801
CHECK_BASE_URL=http://127.0.0.1:8081 npm run check:local   # 其他本地端口
CHECK_BASE_URL=https://你的Worker地址 npm run check:routes
```

`--local` 未指定 `CHECK_BASE_URL` 时使用 Wrangler 的开发地址 `http://127.0.0.1:8801`；连接回环地址时若未设置 `CHECK_ACCESS_TOKEN`，会自动读取被 Git 忽略的 `.dev.vars` 中的 `ACCESS_TOKEN`，不会把本地令牌发送到远端站点。需要鉴权时也可通过 `CHECK_ACCESS_TOKEN` 提供。缺少地址会失败并提示配置；缺少上游 Cookie/API Key/设备、验证页或空内容会记录为失败，不会自动忽略。巡检报告保留 Worker 返回的业务码和描述，详细上游问题可结合 Workers Logs 与对应脚本夹具定位。

## 错误响应

普通路由的错误统一返回 `error`、`code`、`message`，匹配到脚本时还包含 `file`。`error` 保留原有错误码字段，`code` 与它相同，客户端应按 `code` 判断错误类型；描述可随排查建议更新。HTTP 状态按错误类型返回，不再全部使用 502。

例如未配置可用于 Instagram 请求的 Cookie，返回 HTTP 503。诊断信息只列出来源站点、权限标识、声明的 Cookie 名称和筛选原因，不包含 Cookie 值：

```json
{
  "error": "COOKIE_REQUIRED",
  "code": "COOKIE_REQUIRED",
  "message": "站点 https://www.instagram.com 的 Cookie 同步数据中没有权限 account_0 允许的名称（csrftoken、datr、ds_user_id、ig_did、mid、rur 等 7 个），请求 https://www.instagram.com/katarinabluu/ 无法携带 Cookie。请在 Cookie 同步中勾选该站点后重新上传",
  "file": "rss/instagram.js"
}
```

已同步但被域名、路径、Secure 或过期时间过滤时，`message` 会改为列出对应 Cookie 名称和不可用原因。

错误码、公开描述和 HTTP 状态统一维护于 [`worker/errors.js`](../worker/errors.js)，复用固定生产运行时已有的业务码。包含 Cookie 缺失、上游登录失效、拒绝访问、限流、连接失败、超时、响应不匹配，以及参数、配置、访问鉴权、路由、采集能力、脚本输出和内部错误。

Cookie 在脚本实际携带 Cookie 请求上游时检查：没有匹配当前站点、路径且未过期的 Cookie 时返回 `COOKIE_REQUIRED`，`message` 指出缺失的名称或过滤原因；声明权限但未使用 Cookie 的路由仍可匿名运行。已发送 Cookie 后被上游要求登录则返回 `UPSTREAM_AUTH_REQUIRED`，不能仅凭它判断 Cookie 一定过期。脚本已识别的响应错误使用 `UPSTREAM_INVALID_RESPONSE`；未知脚本异常保留 `SCRIPT_FAILED`。普通错误回包不透传原始异常、Cookie、令牌、上游正文或堆栈。

### Debug 诊断页

参考 FindRSS Worker 的 `/debug`，对脚本声明的路径加 `/debug` 即可调试；也可直接在现有完整路由前加 `/debug`，查询参数保持不变：

| 普通路由 | Debug 路由 |
| --- | --- |
| `/rss/github/ltaoo/wx_channels_download/release` | `/debug/github/ltaoo/wx_channels_download/release` |
| `/api/hot/hackernews` | `/debug/hackernews` |
| `/api/clip/github/ltaoo/findrss-worker` | `/debug/github/ltaoo/findrss-worker` |
| `/api/detect/github/ltaoo/findrss-worker/releases.atom` | `/debug/github/ltaoo/findrss-worker/releases.atom` |
| `/fanqienovel/chapter/123` | `/debug/fanqienovel/chapter/123` |
| `/img/apple?url=...` | `/debug/img/apple?url=...` |

例如 `/debug/rss/github/ltaoo/wx_channels_download/release`、`/debug/api/hot/hackernews` 和 `/debug/hot/hackernews` 也可访问。`dist/openapi.json` 只包含四个 `/api` 前缀接口，不包含 Debug；`/api/routes` 仍列出全部普通路由及别名。

Debug 成功、失败均返回 HTML，失败保留对应业务码的 HTTP 状态，无需设置 `Accept`。页面展示脚本文件、版本、路由与 handler 索引，请求路径、路径参数、查询参数、部分请求头和鉴权状态，执行阶段、总耗时、失败详情与沙箱堆栈、执行日志，以及上游请求的方法、主机、路径、状态、传输方式和凭据发送情况。成功时显示脚本原始返回值，不转换 RSS/Atom XML，也不额外抓取图片描述指向的二进制。每次重新执行并返回 `Cache-Control: no-store`。

Debug 沿用 `ACCESS_TOKEN` 鉴权及凭据配置保护，支持请求头或 `?token=`。鉴权、配置或路由匹配失败同样返回诊断 HTML，脚本尚未执行时不会有上游记录。查询参数 `token` 在执行脚本前移除；请求上下文对 Cookie、Authorization、secret、password 和 API Key 等敏感字段脱敏，不显示环境变量配置值；上游记录只展示是否发送凭据。日志、错误文本与脚本原始输出保留实际内容，可能包含上游正文或脚本自行记录的信息，分享诊断页前请检查内容。页面将内容转义为文本，并禁止脚本执行及外部资源加载。

Cloudflare 配置字段见 [Wrangler 官方配置文档](https://developers.cloudflare.com/workers/wrangler/configuration/)。实际发布前需有自己的 Cloudflare 账户授权；本地打包成功不代表所有第三方站点允许来自 Cloudflare IP 的请求。
