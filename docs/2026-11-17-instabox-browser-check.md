# InstaBox Chrome 抓取实测

2026-11-17 在现有 `findrss-scripts` InstaBox Linux 机器执行。真实浏览器导航、订阅请求、回归测试和 Wrangler 打包检查均在该机器上完成；本机仅上传代码和取回结果。

## 环境

- Node.js 22.23.3；Wrangler 本地 Worker 监听机器内部的 `127.0.0.1:8801`。
- `BROWSER_ENABLED=true`、`X_BROWSER_HEADFUL=true`，通过 Xvfb 运行有界面 Chrome。
- Chrome 官方稳定版，实测版本为 157.0.0.0。
- 沿用现有 Cookie 同步和加密 KV。验证前读取来源 258 条 Cookie，其中 204 条适用于已声明站点；四个被测域名没有未过期的授权 Cookie。

## 结果

| 站点 | 实际请求 | 结果 |
| --- | --- | --- |
| Avmoo | `/rss/avmoo/star/jkzqbvn` | HTTP 200，60 条作品，约 9.4 秒 |
| Avmoo 下一批 | `/debug/avmoo/star/jkzqbvn?page=2` | HTTP 200，60 条作品，与第一批重复数为 0，约 4.2 秒 |
| 69书吧 | `/rss/69shuba/book/34567` | HTTP 200，《坐忘长生》2022 个章节，约 3.7 秒 |
| JAVLibrary | `/debug/javlibrary/star/abbds` | HTTP 502；Chrome 返回 Cloudflare 验证页，45 秒内未出现作品列表 |
| 天天看书 | `/debug/ttk/book/congzhanyaochumokaishichangshengbusi` | HTTP 502；Chrome 返回 Cloudflare 验证页，15 秒内未出现章节目录 |

Avmoo 第一批和下一批各记录一次真实浏览器导航，第二批复用了浏览器会话。69书吧记录两次导航，分别读取详情和完整目录；同次请求记录一次启动、一次会话复用。成功不仅依据 HTTP 状态：同时检查了最终订阅条目，正式 RSS 用 XML 解析器核对数量。

JAVLibrary、天天看书在无头、有界面及官方稳定版 Chrome 中均遇到验证。诊断入口读取到的 `Just a moment...` 页面没有计为抓取成功，未用空列表替代错误。这两站仍需在 InstaBox 有效的验证状态或人工验证，尚未完成内容抓取。

## 实测修复

1. Avmoo 旧域名 `avmoo.com` 跳转到导航页，页面指向 `avmoo.shop`。新站演员路径为 `/cn/actresses/<ID>`，作品路径为 `/cn/movies/<ID>`，使用新的渲染目录结构。
2. 新站忽略 URL 中的 `page`：直接访问 `?page=2` 得到的 60 个 ID 与第一批完全相同。脚本改为在浏览器内实际滚动，提取新加载的一批，最多五批；实测两批各 60 条、重复数为 0。
3. 当前 Miniflare 固定 Chrome 126，并未把显示环境传给 Chrome。巡检启动前修正为官方稳定版，只转交 `DISPLAY`、`XAUTHORITY`；通过 `xvfb-run` 管理显示服务和清理，未把其他环境凭据传入浏览器。

## 回归与复现

在 InstaBox 的 `/data/home/findrss-checks/source` 执行 `npm test`：459 项全部通过；`npm run dry-run` 通过。

后续由 `scripts/instabox_task.sh` 执行相同的浏览器准备和启动流程。手工复现时，在 InstaBox 内完成依赖安装、构建及 `node scripts/prepare_browser.js`，再运行：

```bash
CI=1 BROWSER_ENABLED=true X_BROWSER_HEADFUL=true \
  xvfb-run --auto-servernum --server-args="-screen 0 1440x900x24 -nolisten tcp" \
  npm run dev -- --ip 127.0.0.1 --port 8801 --var BROWSER_ENABLED:true \
  --persist-to /data/home/findrss-checks/state
```

使用已有访问令牌访问上表路径。脱敏结果已取回本机 `reports/instabox-browser-check.json`；原始 HTML、Debug 和 RSS 证据保存在机器私有的 `/data/home/findrss-checks/browser-live-results/`，不发布 Cookie、访问令牌或原始页面。
