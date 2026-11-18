# InstaBox 每小时巡检

GitHub Actions 每小时第 23 分钟启动专用 Linux 机器，上传当前工作流检出的源码，在 InstaBox 内运行本地 Worker，先获取并保存最新 Cookie，再用 Chrome 巡检，取回报告后关机。本地电脑无需保持开机。需要 InstaBox API Key、专用 `agent-browser` 机器和 GitHub Actions 配置；将工作流推到默认分支后才会自动运行。

报告正文和 Debug 详情继续公开到 `route-reports` 分支。`.dev.vars` 单独加密传输，保存在机器的私有目录，不进入源码包和报告包。Cookie 从配置的管理接口读取，写入机器上的独立加密 KV；不直接复制 Cloudflare 生产 KV。

## 创建专用机器

安装 CLI 并登录，使用默认带浏览器的 Linux 模板：

```bash
npm install --global instabox@0.8.268
instabox login
instabox create --name findrss-checks --template agent-browser
instabox stop findrss-checks
```

机器需要 Node >= 22.19、npm、git、curl、tar、timeout、setsid、Docker、Xvfb（含 xvfb-run / xauth）和免密码 sudo。首次运行下载项目固定的 FindRSS 运行时、npm 依赖，以及 Wrangler 配套的 Chrome；随后保留运行时和浏览器缓存。浏览器由 Wrangler 的本地 Browser Rendering 绑定启动，无需把它设置为 `remote: true`。巡检在 Xvfb 中运行有界面 Chrome（`X_BROWSER_HEADFUL=true`）；启动前仅修正当前 Miniflare 的本地浏览器版本与显示环境传递，不将访问令牌、Cookie 密钥等环境变量传入 Chrome。首次运行下载 Google 官方稳定版，后续复用缓存。

巡检执行环境固定设置 `BROWSER_ENABLED=true`，并通过 Wrangler 的 `--var BROWSER_ENABLED:true` 传入本地 Worker。Avmoo、JAVLibrary、天天看书和 69书吧优先 HTTP 读取，遇到 401/403 或验证页时调用 `RSSScript.navigate(ctx, url, options, evaluate?)` 获取 Chrome 渲染的 HTML；Avmoo 的空应用壳也会触发浏览器读取。该方法复用 `ctx.puppeteer.navigate`，返回 `Result<string>`，保留浏览器错误并拒绝空页面；关闭开关时不调用这四站的浏览器兜底。其他剪藏等浏览器能力不受此开关影响。

JAVLibrary 和天天看书的巡检导航使用 [CloudflareBypassForScraping](https://github.com/sarperavci/CloudflareBypassForScraping) 的 Python/DrissionPage/Brave 服务。`scripts/instabox_task.sh` 自动启动固定摘要的镜像，限制为 2 核、2 GiB，只绑定 `127.0.0.1:8802`；容器没有宿主文件挂载，只接收随机生成的服务鉴权令牌。临时私有配置将 `BROWSER_BYPASS_URL` 和 `BROWSER_BYPASS_TOKEN` 传给 Worker，结束时停止容器、删除临时配置并恢复原 `.dev.vars`。这两个配置不注入脚本沙箱；导航仅允许两站的 HTTPS 页面，不执行提取函数，最终内容仍由原 RSS 脚本解析和校验。服务失败返回错误，不返回空订阅。

手动运行 Worker 时，可通过私有 `.dev.vars` 配置上述两个变量，并启用 `BROWSER_ENABLED=true` 和 `ACCESS_TOKEN`。未配置服务地址时继续使用现有 Chrome 绑定；关闭浏览器开关后不会调用 Python 服务。Python 服务每次使用独立浏览器上下文，本接入不向宿主 KV 写入它的验证 Cookie。Avmoo 的滚动提取和 69书吧继续使用原 Chrome 会话机制。

仅将此机器用于巡检。脚本使用 `/data/home/findrss-checks/`，每轮替换其中的 `source/`；保留 `runtime/`、`state/` 和机器上的浏览器缓存，不修改其他项目目录。内存和浏览器进程在关机时结束，KV 与已保存的浏览器验证状态保存在 `state/`。

构建会从固定提交恢复补丁管理的运行时文件，再应用当前补丁，因此保留的旧运行时也能升级浏览器开关和签名逻辑；依赖缓存、KV 和其他文件不受影响。

## 配置外部定时任务

在 GitHub 仓库 **Settings → Secrets and variables → Actions** 配置：

| 类型 | 名称 | 内容 |
| --- | --- | --- |
| Variable | `INSTABOX_MACHINE` | `findrss-checks`，也可使用机器 ID |
| Secret | `INSTABOX_API_KEY` | InstaBox 控制台创建的 API Key，需有机器读写和执行权限 |
| Secret | `INSTABOX_DEV_VARS` | 项目 `.dev.vars` 的完整内容，包括 `ACCESS_TOKEN`、Cookie、存储密钥等需要的本地配置 |
| Secret | `ROUTE_CHECK_CASES` | 可选；沿用原来的巡检样本覆盖 JSON |
| Secret | `NOTIFY_TOKEN` | 沿用失败汇总通知令牌 |

`CHECK_BASE_URL` 和 `CHECK_ACCESS_TOKEN` 不再用于此工作流；巡检固定访问机器内的 `http://127.0.0.1:8801`，从上传的 `.dev.vars` 读取 `ACCESS_TOKEN`。每轮用最新 Secret 替换机器上的配置；Secret 为空会清空旧配置，不会继续使用旧凭据。

`INSTABOX_DEV_VARS` 还须包含 `COOKIE_SOURCE_URL` 和 `COOKIE_SOURCE_ADMIN_PASSWORD`。本次部署的来源是 `https://findrss.cloud/admin/api/cookies`，密码仅存放在私有配置和 GitHub Secret，不能提交到仓库。来源接口必须使用 HTTPS、以 `Authorization: Bearer` 鉴权，并返回 `{ "cookies": [...] }`。

服务就绪后，`scripts/sync_inspection_cookies.js` 获取完整 Cookie 快照，调用本地 `/api/cookies/update` 写入现有 AES-GCM 加密 KV，再开始路由检查。只记录读取和写入的数量；来源读取、格式校验或数据库写入失败会中止本轮巡检并关机。空来源不会清空旧记录；有效的完整快照会同步清除已从来源移除的站点 Cookie。数据库只接收脚本声明站点且未过期的 Cookie；来源本身未包含或已失效的登录态仍需补充。

代码推送到默认分支后，先在 **Actions → Scripts CI and route checks → Run workflow** 手动执行一次。完整报告仍会上传 artifact、更新 `route-reports` 分支、部署 Pages，并沿用失败汇总通知。

GitHub 的 cron 可能延迟或漏发，不保证整点启动；当前 cron 为 `23 * * * *`，即北京时间每小时 `:23`。工作流共用 `route-reports` 并发组，避免不同轮次同时操作机器和发布报告。

## 从本机验证

在项目根目录设置好 `INSTABOX_API_KEY`，运行：

```bash
INSTABOX_MACHINE=findrss-checks bash scripts/instabox_check.sh
```

本机运行会读取本地 `.dev.vars`；只上传 git 已跟踪文件的当前内容，新增部署脚本必须先 `git add`。报告取回到本机 `reports/`，此命令本身不发布报告、不发通知。

`scripts/instabox_task.sh` 是机器内的执行入口，由外部脚本调用，不应在本机直接运行。它执行现有 `check_routes.js --release`：检查目标仍为本机回环地址，报告中的产物链接按公开报告分支生成，保持 Pages 的原有链接行为。

## 抖音按需签名

生产 Worker 可以复用这台机器执行抖音官方 SDK，首次生成或签名被上游明确拒绝时才调用 InstaBox。完整签名 URL 与请求头由 Worker 加密写入现有 `COOKIE_KV`，持续复用至失效，不设置五分钟有效期；远端不接收 KV 密钥或 Cloudflare 凭据。作品接口仍由 CF 实时访问。2026-11-17 已用指定作者验证 InstaBox 生成、加密回填及 CF 跨出口复用，返回 11 条作品。

先运行 `npm run build`，把独立程序上传到已启动的巡检机器：

```bash
instabox exec "$INSTABOX_MACHINE" -- mkdir -p /data/home/findrss-signing
instabox cp dist/douyin-signer.mjs "$INSTABOX_MACHINE:/data/home/findrss-signing/douyin-signer.mjs"
instabox exec "$INSTABOX_MACHINE" -- chmod 600 /data/home/findrss-signing/douyin-signer.mjs
npx wrangler secret put INSTABOX_API_KEY
npx wrangler secret put INSTABOX_MACHINE
npm run deploy
```

Worker 的 `INSTABOX_MACHINE` 必须填写 `m_` 开头的机器 ID，可用 `instabox ls --json` 查询；巡检工作流的同名变量仍可使用名称。API Key 需要 `machines:read`、`machines:write`，仅作为 Worker Secret 保存，不提交或放入公开报告。两个 Secret 必须同时设置；均未设置时保留原来的本地签名行为。巡检上传的 `.dev.vars` 不需要包含这两个值，避免本地巡检再次调用远端。

每轮巡检构建后会原子更新 `/data/home/findrss-signing/douyin-signer.mjs`。该目录独立于会被替换的 `source/`，并且程序自带 JS/Wasm 依赖。签名输入仅经 API 的 stdin 传输，不进入命令参数、磁盘或执行历史；错误不返回签名、Cookie 或 SDK 日志。

缓存缺失时 Worker 自动启动或恢复机器，等待就绪后执行固定程序。若恰逢巡检关机导致执行返回 409/503，只重新启动并重试一次；启动和签名总计最多等待 110 秒。远端不可用会返回失败，不在 CF 退回高 CPU 签名。单次签名结束不会关闭共用机器，沿用机器已有的自动暂停与巡检关机策略；按需启动会产生套餐规定的运行用量。机器自动暂停后的下次冷请求可能需要等待启动。

这里只缓存签名，不保存或回退订阅内容；签名有效也不能解决 Cookie 过期、上游限流或脚本本身的 CF CPU 超限。SDK 发现与执行规则沿用项目运行时，官方变更导致兼容性失败时需要更新代码并重新上传独立程序。

## 失败处理和费用

- 巡检任务包含安装、构建、启动服务及检查，总计最多 40 分钟；超时后不发布不完整报告。
- 正常完成或失败时，外部脚本都会关机，失败重试最多三次；工作流还通过 `always()` 再次确认关机。
- 开机后立即设置 `sudo shutdown -h +50`。即使调度器中断或进程被杀，机器也会在约 50 分钟后关机。此兜底依赖机器能执行 shutdown；若启动或网络异常发生在安装兜底之前，需在 InstaBox 控制台检查机器状态。
- 路由失败但完整报告已生成时，继续发布报告并发送原有通知；开机失败、构建失败、超时、报告丢失或关机失败会使巡检步骤失败。
- Worker 仅监听回环地址，不发布端口。启动日志为 `/data/home/findrss-checks/worker.log`，远端任务日志写入 Actions 日志。
- 关机后 Linux 机器不计 CPU / 内存运行时长，磁盘仍按套餐的存储规则计费。API Key 到期后需更新 GitHub Secret。

官方文档：[机器生命周期](https://instabox.sh/docs/machines/lifecycle)、[CLI](https://instabox.sh/docs/reference/cli)、[计费](https://instabox.sh/docs/account/pricing)。

Avmoo 当前入口为 `avmoo.shop`，演员路径为 `/cn/actresses/<ID>`，作品页为 `/cn/movies/<ID>`。旧域名会跳到导航页。脚本使用新站渲染目录，`page=2` 对应下一次滚动加载的作品批次，最多五批；新站忽略 URL 的 page 参数，因此不能直接把同一批作品当作第二页。示例演员 ID 为 `jkzqbvn`。

2026-11-17 在 InstaBox Chrome 完成 Avmoo 和 69书吧抓取，见[Chrome 实测报告](2026-11-17-instabox-browser-check.md)。2026-11-18 使用 Python 浏览器取得 JAVLibrary 20 条作品、天天看书完整目录 852 个章节，见 [Python 浏览器实测](2026-11-18-instabox-python-browser-check.md)。
