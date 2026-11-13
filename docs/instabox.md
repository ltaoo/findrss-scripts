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

机器需要 Node >= 22.19、npm、git、curl、tar、timeout 和免密码 sudo。首次运行下载项目固定的 FindRSS 运行时、npm 依赖，以及 Wrangler 配套的 Chrome；随后保留运行时和浏览器缓存。浏览器由 Wrangler 的本地 Browser Rendering 绑定启动，无需把它设置为 `remote: true`。

仅将此机器用于巡检。脚本使用 `/data/home/findrss-checks/`，每轮替换其中的 `source/`；保留 `runtime/`、`state/` 和机器上的浏览器缓存，不修改其他项目目录。内存和浏览器进程在关机时结束，KV 与已保存的浏览器验证状态保存在 `state/`。

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

## 失败处理和费用

- 巡检任务包含安装、构建、启动服务及检查，总计最多 40 分钟；超时后不发布不完整报告。
- 正常完成或失败时，外部脚本都会关机，失败重试最多三次；工作流还通过 `always()` 再次确认关机。
- 开机后立即设置 `sudo shutdown -h +50`。即使调度器中断或进程被杀，机器也会在约 50 分钟后关机。此兜底依赖机器能执行 shutdown；若启动或网络异常发生在安装兜底之前，需在 InstaBox 控制台检查机器状态。
- 路由失败但完整报告已生成时，继续发布报告并发送原有通知；开机失败、构建失败、超时、报告丢失或关机失败会使巡检步骤失败。
- Worker 仅监听回环地址，不发布端口。启动日志为 `/data/home/findrss-checks/worker.log`，远端任务日志写入 Actions 日志。
- 关机后 Linux 机器不计 CPU / 内存运行时长，磁盘仍按套餐的存储规则计费。API Key 到期后需更新 GitHub Secret。

官方文档：[机器生命周期](https://instabox.sh/docs/machines/lifecycle)、[CLI](https://instabox.sh/docs/reference/cli)、[计费](https://instabox.sh/docs/account/pricing)。
