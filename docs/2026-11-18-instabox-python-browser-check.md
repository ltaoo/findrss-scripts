# InstaBox Python 浏览器抓取实测

2026-11-18 在当前账号新建的 `findrss-scripts` Linux 机器执行，配置为 4 vCPU、8 GiB、20 GiB，Node v22.23.3。源码基于 `605b2f92`，并包含本次 Python 浏览器接入。安装、构建、测试和真实 HTTP 抓取均在 InstaBox 完成；本机只编辑、上传和取回产物。

## 实际 RSS 结果

服务使用 [CloudflareBypassForScraping](https://github.com/sarperavci/CloudflareBypassForScraping) 的 Python、DrissionPage 和 Brave。固定镜像为：

```text
ghcr.io/sarperavci/cloudflarebypassforscraping@sha256:9897d17b9fe5471f0f04c8d11c4ec4b147ff444cc0ee61e2b1788a743be9e718
```

先直接执行原 RSS 脚本的 QuickJS 沙箱，再启动真实 Wrangler/Workerd，通过机器内的 HTTP 路由取得 RSS。没有模拟上游响应，也没有用已保存的 HTML 代替本轮浏览器导航。

| 来源 | 原脚本 + Python 导航 | Worker HTTP RSS 路由 | 内容 |
| --- | --- | --- | --- |
| JAVLibrary | 20 条，6,363 ms，导航一次 | HTTP 200，20 条，7,826 ms | `山手梨愛 - JAVLibrary 作品` |
| 天天看书 | 852 条，7,216 ms，导航一次 | HTTP 200，852 条，9,681 ms | `從斬妖除魔開始長生不死 · 章节更新` |

路由分别为 `/rss/javlibrary/star/abbds` 和 `/rss/ttk/book/congzhanyaochumokaishichangshengbusi`。XML 通过 `fast-xml-parser` 的校验与解析，解析后的 `<item>` 数量与脚本输出一致。TTK 读取完整章节目录，不是页面上方的 16 条最新章节。

机器私有目录 `/data/home/findrss-checks/python-cf-probe/` 中的 `feed-results.json` 记录沙箱结果，`worker-results.json` 记录真实 HTTP 结果，对应的 `*.rss.xml` 保存实际订阅。报告与日志不包含服务令牌、用户访问令牌或验证 Cookie。

## 巡检接入与验证

`scripts/instabox_task.sh` 在 Worker 前启动独立 Python 浏览器容器，生成随机服务令牌，以私有临时 `.dev.vars` 传入 `BROWSER_BYPASS_URL` 和 `BROWSER_BYPASS_TOKEN`。端口只绑定回环地址；容器没有宿主文件挂载，只接收服务本身的随机令牌，限制为 2 核、2 GiB，删除 Linux capabilities 并启用 `no-new-privileges`。

Worker 只为 JAVLibrary 和 TTK 选择该后端，且必须启用 `BROWSER_ENABLED`。服务地址与令牌留在宿主，目标仅允许两站 HTTPS 来源；拒绝后端重定向、跨站最终地址、空 HTML、超过 24 MiB 的页面和自定义提取函数。原 RSS 脚本继续执行页面结构检查及数据解析。后端未配置时沿用 Chrome 绑定，Avmoo 和 69书吧继续使用原来的 Chrome 会话。

新机器上 461 项测试全部通过，`npm run dry-run` 通过。新增测试覆盖 Worker 实际入口的开关与鉴权隔离、后端私有凭据传递、来源限制、重定向、无效页面及流式大小上限。

另一次真实巡检入口故意使用没有 Cookie 来源的测试配置：在 Python 服务与 Worker 启动后，Cookie 同步按预期报错。断言确认 Worker 端口关闭、容器移除、原 `.dev.vars` 完整恢复，临时私有目录已删除；结果保存为 `lifecycle-results.json`。未运行全部站点的在线巡检，也未触发失败通知。

## 使用范围

此次证明了 InstaBox 出口下两条 RSS 路由可用，站点验证策略变化后仍可能失败。Python 服务每次使用独立浏览器上下文，本接入不向宿主 KV 保存它的验证 Cookie。Avmoo 和 69书吧本轮没有重复在线抓取，前一次结果见 [Chrome 实测](2026-11-17-instabox-browser-check.md)。

CF Worker 的 `BROWSER_ENABLED` 仍为 `false`；此结果不表示 CF 生产出口已能直接抓取这两站。新机器用于本次验证，GitHub 和 CF 既有的 InstaBox 机器凭据没有在本轮自动迁移。
