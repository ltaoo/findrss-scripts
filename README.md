<p data-n="project-brand" align="center">
  <img data-n="project-logo" src="assets/brand/logo.svg" alt="FindRSS 标志" width="96" height="96">
</p>

<h1 data-n="project-title" align="center">findrss-scripts</h1>

<p data-n="project-tagline" align="center">FindRSS 采集脚本库<br data-n="tagline-break">复制到后台即可使用，也可独立部署到 Cloudflare Workers</p>

<p data-n="project-navigation" align="center">
  <a data-n="market-link" href="https://ltaoo.github.io/findrss-scripts/">脚本市场</a> ·
  <a data-n="quick-start-link" href="#快速开始">快速开始</a> ·
  <a data-n="catalog-link" href="#完整脚本清单">脚本清单</a> ·
  <a data-n="deployment-link" href="#独立部署到-cloudflare-workers">独立部署</a> ·
  <a data-n="documentation-link" href="#更多文档">更多文档</a>
</p>

本仓库集中维护 [FindRSS](https://github.com/ltaoo/findrss-worker) 的 **104 个采集脚本**，覆盖文章、视频、作者动态、小说章节、排行榜、网页剪藏与内容变化检测。

**已有 FindRSS 站点，复制脚本到后台调试、发布即可使用；需要直接通过 HTTP 调用，可将本仓库独立部署为 Worker。** 独立部署自动加载全部脚本，不包含管理后台、订阅管理或检测历史存储。

## 能做什么

| 类型 | 数量 | 用途 | 请求路径前缀 |
| --- | --- | --- | --- |
| [RSS](#rss23-个) | 23 | 将文章、视频、动态、章节等转换为订阅源 | `/rss`、`/atom`、`/api/rss`（JSON 快照） |
| [Hot](#hot76-个) | 76 | 获取排行榜、热点、快讯与最新资讯 JSON | `/api/hot`、`/hot` |
| [Clip 剪藏](#clip-剪藏3-个) | 3 | 提取网页区域或生成卡片，返回包含静态 HTML 的 JSON | `/api/clip`、`/clip` |
| [Detect 内容检测](#detect-内容检测2-个) | 2 | 采集内容快照，供后台检测任务持续比较变化 | `/api/detect`、`/detect` |

脚本从沙箱模块 `@findrss/core` 导入 `RSSScript`、`HotRankScript`、`ClipScript`、`DetectScript` 和 `Result`，从 `@findrss/util` 导入 `utils`，不能直接作为普通 Node.js 脚本执行。

## 快速开始

### 导入 FindRSS 后台

1. **选择脚本**：打开[脚本市场](https://ltaoo.github.io/findrss-scripts/)搜索来源，或在下方[完整清单](#完整脚本清单)点击文件链接，打开 Raw 源码并复制全部内容。
2. **新建并配置**：在 FindRSS 后台「脚本」中选择对应类型，粘贴源码，填写脚本所需配置；依赖 Cookie 的脚本需先同步对应站点的 Cookie，并确认脚本权限。
3. **调试并发布**：填写具体路由，运行 Debug 检查采集结果，确认后发布并启用。
4. **使用结果**：RSS 地址可添加到阅读器；Hot 可用于热榜；Clip 可在后台创建剪藏，获得固定 HTML / iframe 链接；Detect 需在后台创建内容检测任务，持续保存基线并比较变化。

例如，导入 [Telegram 脚本](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/telegram.js)后，使用以下路径订阅公开频道；在前面加上自己的 FindRSS 站点地址即可：

```text
/rss/telegram/channel/telegram
/atom/telegram/channel/telegram
```

Hot 示例：`/google-news/rss/jp/top` 对应 `/api/hot/google-news/rss/jp/top`。表中路由示例均为脚本声明路径，路由本身也可直接访问，例如 `/hongguo/search/总裁`。访问前缀由脚本类型决定：`kind` 为 `rss` 时可加 `/rss`、`/atom` 获取 XML，或加 `/api/rss` 获取 JSON 快照；Hot 还可使用 `/hot`（`/api/hot` 的短别名）；Clip、Detect 还可分别使用 `/clip`、`/detect`。章节正文和图片代理等附加路由没有命名空间，按脚本声明路径直接访问。多路由、参数、分页和设备要求见[详细使用说明](docs/usage.md)。

Cookie 权限声明不代表每条路由都必须登录。YouTube Hot 需要自己的 YouTube Data API Key；TikTok Hot 需要授权广告账户和具有 Discovery API 权限的令牌；微信脚本需配置接口地址和令牌。配置表单的 `writeOnly` 仅遮挡输入，配置按脚本元数据保存，请勿提交真实凭据。

### 查找脚本与巡检结果

[脚本市场（Script Market）](https://ltaoo.github.io/findrss-scripts/)支持 RSS、Hot、Clip、Detect 分类，以及按名称、文件路径或路由搜索。点击文件路径查看 Raw 源码，使用旁边图标复制地址；点击巡检状态查看结果，通过样本可在新窗口查看 Raw 产物。页面展示最近一次成功发布的巡检快照，实际可用性仍需在自己的环境运行 Debug 确认。

页头设置按钮可保存 Worker 的 `baseURL` 和 `token`。巡检弹窗中每条路由的 Plus 图标（添加示例）会根据脚本声明显示参数表单，并生成 GET URL（token 放 query）和 POST curl（token 放 Authorization 请求头，查询参数放 JSON 请求体），也可点击「复制 Debug 链接」复制带当前参数和 token 的 `/debug` 路由地址。点击「保存示例」后，按脚本文件和路由分别保存多个参数示例，并显示在 Plus 图标左侧；点击示例可回填和修改，点击旁边的 × 删除。旧版保存的单组参数会自动保留为一个示例；设置和参数均保存在当前站点的浏览器 localStorage，token 为明文存储。

清单中的文件链接均指向本仓库 `master` 分支，Raw 地址格式为：

```text
https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/<类型>/<文件名>.js
```

## 独立部署到 Cloudflare Workers

需要 Node.js **22.19.0 或更新版本**、Git、npm 和 Cloudflare 账号；首次构建需要访问 GitHub 和 npm。以下命令在本仓库根目录执行：

```sh
npm ci
npm test
npm run dry-run
npx wrangler login
```

部署前，先将 [`wrangler.jsonc`](wrangler.jsonc) 中的 Worker 名称、自定义域名和 `COOKIE_KV` 命名空间 ID 改为自己账号的配置；使用默认 `workers.dev` 地址时可移除 `routes`，不使用 Cookie 同步时可移除 `COOKIE_KV` 绑定。然后设置访问令牌并部署：

```sh
npx wrangler secret put ACCESS_TOKEN
npm run deploy
```

默认配置包含 `COOKIE_KV` 绑定，必须同时设置 `ACCESS_TOKEN`，否则入口返回 503。需要登录态或 API 凭据的脚本还需配置 Cookie、`SCRIPT_CONFIG` 等，见[凭据与设备配置](docs/cloudflare.md#凭据与设备)。

部署后，在请求头中携带 `Authorization: Bearer <ACCESS_TOKEN>` 访问 Worker：

| 路径示例 | 返回内容 |
| --- | --- |
| `/health` | 已加载脚本数量和已注册路由数量（含别名） |
| `/api/routes` | 全部已注册路由与调用示例（含别名） |
| `/rss/telegram/channel/telegram` | Telegram 公开频道的 RSS 订阅 |
| `/api/rss/telegram/channel/telegram` | 同一订阅的 JSON 快照 |
| `/api/hot/baidu/board` | 百度热搜 JSON |
| `/hot/baidu/board` | 百度热搜 JSON（`/api/hot` 的短别名） |
| `/api/clip/github/ltaoo/findrss-worker` | GitHub README 剪藏 JSON |
| `/api/detect/github/ltaoo/findrss-worker/releases.atom` | GitHub Releases 检测 JSON |
| `/debug/baidu/board` | 脚本诊断 HTML |

阅读器不支持请求头时可使用 `?token=<ACCESS_TOKEN>`；已有查询参数时使用 `&token=`，令牌需 URL 编码，链接可能保留在浏览器历史或访问日志中。Detect 的 `/api/detect` 只做无状态试采样，不保存历史基线。

本地运行使用 `npm run dev`，默认地址为 `http://127.0.0.1:8801`。Wrangler 在启动和部署前自动扫描、构建四类脚本，新增或修改源码后需重新部署；运行时缓存于 `.runtime/`，无需构建管理后台或配置数据库。GitHub README 和通用网页剪藏需要实际的 Cloudflare Browser Rendering 绑定，百度天气剪藏无需浏览器绑定。

完整配置、Cookie 同步及故障处理见[部署与巡检说明](docs/cloudflare.md)。

## 完整脚本清单

Hot、Clip 和 Detect 在各自目录内按来源组织，同源路由集中在一个文件，通过 `routes` 导出。每个文件只列一次。没有明确数字排名的内容保留上游顺序，`rank` 为 `null`；新闻、最新资讯及精选源按实际用途命名。热榜详细字段见 [hot/README.md](hot/README.md)。

### RSS（23 个）

| 脚本 | 文件 | 路由示例 | 版本 | 使用要求 |
| --- | --- | --- | --- | --- |
| 69书吧小说章节 | [rss/69shuba.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/69shuba.js) | `/69shuba/book/34567` | 1.2.0 | 自动复用加密验证状态，失效时需 BROWSER 刷新 |
| Apple App Store 应用更新 | [rss/apple.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/apple.js) | `/apple/apps/update/us/id408709785` | 1.1.0 | 公开来源 |
| Avmoo 演员作品 | [rss/avmoo.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/avmoo.js) | `/avmoo/star/abc123` | 1.0.0 | 替换为实际演员 ID；可选 Cookie |
| 哔哩哔哩用户动态 | [rss/bilibili.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/bilibili.js) | `/bilibili/650898515/dynamic` | 1.1.0 | Cookie 授权 |
| 抖音作者作品 | [rss/douyin.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/douyin.js) | `/douyin/user/MS4wLjABAAAAOE57npukdzs0SH_Fk5RHB-qfUlnZ5jQT2R_KPH4Sd8s` | 1.1.1 | Cookie 授权 |
| 番茄小说章节 | [rss/fanqienovel.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/fanqienovel.js) | `/fanqienovel/book/7143038691944959011` | 1.1.0 | 公开来源 |
| GitHub 发布列表 | [rss/github.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/github.js) | `/github/ltaoo/wx_channels_download/release` | 1.0.0 | 公开来源 |
| 红果短剧分集 | [rss/hongguo.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/hongguo.js) | `/hongguo/series/7688352674999176254`、`/hongguo/search/总裁` | 1.0.0 | 公开来源；播放走官网公开直链，付费集仅提供预览或不提供直链 |
| Instagram 用户作品 | [rss/instagram.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/instagram.js) | `/instagram/katarinabluu` | 1.1.0 | Cookie 授权 |
| JavBus 演员作品 | [rss/javbus.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/javbus.js) | `/javbus/star/2jv` | 1.0.0 | 可选 Cookie；验证页需同步有效 Cookie 并启用 `use_cookies` |
| JAVLibrary 演员作品 | [rss/javlibrary.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/javlibrary.js) | `/javlibrary/star/abbds` | 1.1.0 | 自动复用加密验证状态，失效时需 BROWSER 刷新 |
| 快手用户作品 | [rss/kuaishou.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/kuaishou.js) | `/kuaishou/profile/3xuxw5yhgr6f4um` | 1.1.0 | Cookie 授权 |
| 起点中文网章节列表 | [rss/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/qidian.js) | `/qidian/book/1036526469` | 1.1.0 | Cookie 授权 |
| 七猫小说章节 | [rss/qimao.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/qimao.js) | `/qimao/book/13030701` | 1.0.0 | Cookie 授权；章节链接指向官网 |
| Telegram 公开频道 | [rss/telegram.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/telegram.js) | `/telegram/channel/telegram` | 1.1.0 | 公开来源 |
| 天天看书小说章节 | [rss/ttk.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/ttk.js) | `/ttk/book/congzhanyaochumokaishichangshengbusi` | 1.1.1 | 公开来源 |
| 微博用户列表 | [rss/weibo.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/weibo.js) | `/weibo/u/1992429663` | 1.1.0 | Cookie 授权 |
| 微信视频号 | [rss/wxchannels.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/wxchannels.js) | `/wxchannels/v2_060000231003b20faec8c5e1811ac5d4c803ee35b077b115ba7f22bad44fca23255c1a271f23@finder` | 1.2.0 | 配置：`api_url`、`auth_token`、`PlayerHostname` |
| 微信公众号 | [rss/wxmp.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/wxmp.js) | `/wxmp/wow36kr` | 1.2.0 | 配置：`api_url`、`auth_token` |
| X 用户作品 | [rss/x.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/x.js) | `/x/NTCGoK9jFQURsEu` | 1.1.0 | Cookie 授权 |
| 小红书用户笔记 | [rss/xiaohongshu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/xiaohongshu.js) | `/xiaohongshu/user/profile/5d2aec020000000012037401` | 1.1.0 | Cookie 授权 |
| YouTube 频道视频 | [rss/youtube.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/youtube.js) | `/youtube/@goldfishbrain` | 1.1.0 | Cookie 授权 |
| 知乎用户动态 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | `/zhihu/people/zhihu` | 1.1.0 | Cookie 授权 |

### Hot（76 个）

| 脚本 | 文件 | 路由示例 | 版本 | 使用要求 |
| --- | --- | --- | --- | --- |
| 36氪 · 快讯 / 人气榜 | [hot/36kr.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/36kr.js) | `/36kr/newsflashes`、`/36kr/hot-list/renqi` | 1.0.3 | 人气榜需授权并同步 36kr.com 验证 Cookie |
| AIHOT | [hot/aihot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/aihot.js) | `/aihot/feed/all.xml` | 1.0.1 | 公开来源 |
| AniList · 动漫趋势榜 | [hot/anilist.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/anilist.js) | `/anilist/trending/anime` | 1.0.0 | 公开来源 |
| Apple · 播客/音乐榜 | [hot/apple_charts.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/apple_charts.js) | `/apple-charts/api/v2/us/podcasts` | 1.0.0 | 公开来源 |
| Ars Technica · 最新资讯 | [hot/arstechnica.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/arstechnica.js) | `/arstechnica/arstechnica/index` | 1.0.0 | 公开来源 |
| 百度热搜 | [hot/baidu_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/baidu_hot.js) | `/baidu/board` | 1.0.2 | 公开来源 |
| 哔哩哔哩 · 热搜 / 热门视频 / 排行榜 | [hot/bilibili.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/bilibili.js) | `/bilibili/main/hotword`、`/bilibili/x/web-interface/popular`、`/bilibili/x/web-interface/ranking/v2` | 1.0.2 | 公开来源 |
| Bluesky · 趋势话题 | [hot/bluesky.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/bluesky.js) | `/bluesky/xrpc/app.bsky.unspecced.getTrendingTopics` | 1.0.0 | 公开来源 |
| 参考消息 | [hot/cankaoxiaoxi.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/cankaoxiaoxi.js) | `/cankaoxiaoxi/json/channel` | 1.0.1 | 公开来源 |
| 虫部落 · 最热 / 最新 | [hot/chongbuluo.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/chongbuluo.js) | `/chongbuluo/forum.php/hot`、`/chongbuluo/forum.php/latest` | 1.0.2 | 公开来源 |
| 财联社 · 深度 / 热门 / 电报 | [hot/cls.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/cls.js) | `/cls/v3/depth/home/assembled/1000`、`/cls/v2/article/hot/list`、`/cls/v1/roll/get_roll_list` | 1.0.2 | 公开来源 |
| Dailymotion · 热门视频 | [hot/dailymotion.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/dailymotion.js) | `/dailymotion/videos/us` | 1.0.0 | 公开来源 |
| Deezer · 热门歌曲 | [hot/deezer.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/deezer.js) | `/deezer/chart/0/tracks` | 1.0.0 | 公开来源 |
| DEV Community · 热门文章 | [hot/devto.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/devto.js) | `/devto/api/articles/week` | 1.0.0 | 公开来源 |
| 懂球帝 · 头条 | [hot/dongqiudi.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/dongqiudi.js) | `/dongqiudi/app/tabs/web/1.json` | 1.0.1 | 公开来源 |
| 豆瓣 · 热门电影 | [hot/douban_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/douban_hot.js) | `/douban/rexxar/api/v2/subject/recent_hot/movie` | 1.0.1 | 公开来源 |
| 抖音 | [hot/douyin_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/douyin_hot.js) | `/douyin/aweme/v1/web/hot/search/list` | 1.1.1 | Cookie 授权 |
| 番茄小说排行榜 | [hot/fanqienovel.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/fanqienovel.js) | `/fanqienovel/rank/1_2_1141` | 1.0.1 | 公开来源 |
| 法布财经 · 快讯 / 头条 | [hot/fastbull.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/fastbull.js) | `/fastbull/cn/express-news`、`/fastbull/cn/news` | 1.0.2 | 公开来源 |
| Freebuf · 网络安全 | [hot/freebuf.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/freebuf.js) | `/freebuf/feed` | 1.0.1 | 公开来源 |
| 格隆汇 · 事件 | [hot/gelonghui.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/gelonghui.js) | `/gelonghui/news` | 1.0.1 | 公开来源 |
| Github · Today | [hot/github_trending.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/github_trending.js) | `/github/trending` | 1.0.1 | 公开来源 |
| Google News · 英语/日语头条 | [hot/google_news.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/google_news.js) | `/google-news/rss/us/top` | 1.0.0 | 公开来源 |
| Project Gutenberg · 热门图书 | [hot/gutenberg.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/gutenberg.js) | `/gutenberg/browse/scores/top/day` | 1.0.0 | 公开来源 |
| Hacker News | [hot/hackernews.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/hackernews.js) | `/hackernews` | 1.0.1 | 公开来源 |
| Hatena · 热门书签 | [hot/hatena.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/hatena.js) | `/hatena/hotentry/all` | 1.0.0 | 公开来源 |
| 虎扑 · 主干道热帖 | [hot/hupu_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/hupu_hot.js) | `/hupu/topic-daily-hot` | 1.0.1 | 公开来源 |
| 凤凰网 · 热点资讯 | [hot/ifeng_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/ifeng_hot.js) | `/ifeng/hot` | 1.0.1 | 公开来源 |
| 爱奇艺 · 热播榜 | [hot/iqiyi_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/iqiyi_hot.js) | `/iqiyi/portal/lw/v7/channel/card/videoTab` | 1.0.1 | 公开来源 |
| IT之家 | [hot/ithome.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/ithome.js) | `/ithome/list` | 1.0.1 | 公开来源 |
| ITmedia NEWS · 最新资讯 | [hot/itmedia.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/itmedia.js) | `/itmedia/rss/2.0/news_bursts.xml` | 1.0.0 | 公开来源 |
| 金十数据 | [hot/jin10.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/jin10.js) | `/jin10/flash_newest.js` | 1.0.1 | 公开来源 |
| 稀土掘金 | [hot/juejin_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/juejin_hot.js) | `/juejin/content_api/v1/content/article_rank` | 1.0.1 | 公开来源 |
| カクヨム · 小说排行榜 | [hot/kakuyomu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/kakuyomu.js) | `/kakuyomu/rankings/all/daily` | 1.0.0 | 公开来源 |
| 靠谱新闻 | [hot/kaopu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/kaopu.js) | `/kaopu` | 1.0.1 | 公开来源 |
| 快手 | [hot/kuaishou_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/kuaishou_hot.js) | `/kuaishou/hot` | 1.0.1 | 公开来源 |
| 酷安 · 今日最热 | [hot/kuan.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/kuan.js) | `/kuan/v6/page/dataList` | 1.0.1 | 公开来源 |
| Lobsters · 热门讨论 | [hot/lobsters.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/lobsters.js) | `/lobsters/hottest.json` | 1.0.0 | 公开来源 |
| Mastodon · 社媒趋势 | [hot/mastodon.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/mastodon.js) | `/mastodon/api/v1/trends/links` | 1.0.0 | 公开来源 |
| MKTNews · 快讯 | [hot/mktnews_flash.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/mktnews_flash.js) | `/mktnews/api/flash` | 1.0.1 | 公开来源 |
| MyAnimeList · 动漫/轻小说榜 | [hot/myanimelist.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/myanimelist.js) | `/myanimelist/top/anime` | 1.0.0 | 公开来源 |
| 小説家になろう · 小说积分榜 | [hot/narou.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/narou.js) | `/narou/novelapi/api/daily` | 1.0.0 | 公开来源 |
| NHK · 主要新闻 | [hot/nhk.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/nhk.js) | `/nhk/rss/news/cat0.xml` | 1.0.0 | 公开来源 |
| ニコニコ動画 · 综合排行榜 | [hot/niconico.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/niconico.js) | `/niconico/ranking` | 1.0.0 | 公开来源 |
| 牛客 | [hot/nowcoder_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/nowcoder_hot.js) | `/nowcoder/api/sparta/hot-search/top-hot-pc` | 1.0.1 | 公开来源 |
| NPR · Top Stories | [hot/npr.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/npr.js) | `/npr/1001/rss.xml` | 1.0.0 | 公开来源 |
| 远景论坛 · Win11 | [hot/pcbeta_windows11.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/pcbeta_windows11.js) | `/pcbeta/forum.php` | 1.0.1 | 公开来源 |
| Product Hunt | [hot/producthunt.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/producthunt.js) | `/producthunt/feed` | 1.0.1 | 公开来源 |
| 起点 · 男频榜单 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | `/qidian/rank/yuepiao` | 1.2.0 | 公开来源；男频 9 榜 |
| 起点女生网 · 女频榜单 | [hot/qdmm.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qdmm.js) | `/qidian/rank/yuepiao/female` | 1.0.0 | 公开来源；女频 8 榜，保留原路由 |
| Qiita · 热门文章 | [hot/qiita.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qiita.js) | `/qiita/popular-items/feed` | 1.0.0 | 公开来源 |
| 七猫小说排行榜 | [hot/qimao.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qimao.js) | `/qimao/paihang/boy/hot` | 1.0.2 | Cookie 授权 |
| 腾讯视频 · 热搜榜 | [hot/qqvideo_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qqvideo_hot.js) | `/qqvideo/trpc.vector_layout.page_view.PageService/getCard` | 1.0.1 | 公开来源 |
| Reddit · 社区热门 | [hot/reddit.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/reddit.js) | `/reddit/r/popular/hot` | 1.0.0 | 公开来源 |
| Slashdot · 科技资讯 | [hot/slashdot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/slashdot.js) | `/slashdot/Slashdot/slashdotMain` | 1.0.0 | 公开来源 |
| Solidot | [hot/solidot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/solidot.js) | `/solidot/index.rss` | 1.0.1 | 公开来源 |
| 卫星通讯社 | [hot/sputniknewscn.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/sputniknewscn.js) | `/sputniknewscn/services/widget/lenta` | 1.0.1 | 公开来源 |
| 少数派 | [hot/sspai_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/sspai_hot.js) | `/sspai/api/v1/article/tag/page/get` | 1.0.1 | 公开来源 |
| Steam · 在线人数 | [hot/steam.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/steam.js) | `/steam/stats/stats` | 1.0.1 | 公开来源 |
| Techmeme · 科技头条 | [hot/techmeme.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/techmeme.js) | `/techmeme/feed.xml` | 1.0.0 | 公开来源 |
| 腾讯新闻 · 综合早报 | [hot/tencent_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/tencent_hot.js) | `/tencent/web_backend/v2/getTagInfo` | 1.0.1 | 公开来源 |
| 澎湃新闻 · 热榜 | [hot/thepaper_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/thepaper_hot.js) | `/thepaper/contentapi/wwwIndex/rightSidebar` | 1.0.1 | 公开来源 |
| The Verge · 最新资讯 | [hot/theverge.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/theverge.js) | `/theverge/rss/index.xml` | 1.0.0 | 公开来源 |
| 百度贴吧 · 热议 | [hot/tieba_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/tieba_hot.js) | `/tieba/hottopic/browse/topicList` | 1.0.1 | 公开来源 |
| TikTok · 热门话题 | [hot/tiktok.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/tiktok.js) | `/tiktok/open_api/v1.3/discovery/trending_list/US/7` | 1.0.0 | 配置：`advertiser_id`、`access_token` |
| 今日头条 | [hot/toutiao_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/toutiao_hot.js) | `/toutiao/hot-event/hot-board` | 1.0.1 | 公开来源 |
| V2EX · 最新分享 | [hot/v2ex_share.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/v2ex_share.js) | `/v2ex/feed` | 1.0.1 | 公开来源 |
| Vimeo · Staff Picks 精选 | [hot/vimeo.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/vimeo.js) | `/vimeo/channels/staffpicks/videos/rss` | 1.0.0 | 公开来源 |
| 华尔街见闻 · 最热 / 最新 / 快讯 | [hot/wallstreetcn.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/wallstreetcn.js) | `/wallstreetcn/apiv1/content/articles/hot`、`/wallstreetcn/apiv1/content/information-flow`、`/wallstreetcn/apiv1/content/lives` | 1.0.2 | 公开来源 |
| 微博 · 实时热搜 | [hot/weibo_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/weibo_hot.js) | `/weibo/top/summary` | 1.0.2 | Cookie 授权；遇到游客验证页需先完成官网验证并同步 Cookie |
| 雪球 · 热门股票 | [hot/xueqiu_hotstock.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/xueqiu_hotstock.js) | `/xueqiu/v5/stock/hot_stock/list.json` | 1.0.1 | Cookie 授权 |
| Yahoo! JAPAN · 主要话题 | [hot/yahoo_japan.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/yahoo_japan.js) | `/yahoo-japan/rss/topics/top-picks.xml` | 1.0.0 | 公开来源 |
| YouTube · 热门视频 | [hot/youtube_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/youtube_hot.js) | `/youtube/hot/US/0` | 1.0.1 | 必填配置：`api_key` |
| 联合早报 | [hot/zaobao.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/zaobao.js) | `/zaobao/realtime` | 1.0.1 | 公开来源 |
| Zenn · 趋势文章 | [hot/zenn.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/zenn.js) | `/zenn/api/articles` | 1.0.0 | 公开来源 |
| 知乎 | [hot/zhihu_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/zhihu_hot.js) | `/zhihu/api/v3/feed/topstory/hot-list-web` | 1.0.1 | 公开来源 |

### Clip 剪藏（3 个）

| 脚本 | 文件 | 路由示例 | 版本 | 使用要求 |
| --- | --- | --- | --- | --- |
| GitHub README | [clip/github.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/clip/github.js) | `/github/ltaoo/findrss-worker` | 1.0.0 | Browser Rendering 绑定 |
| 百度天气 | [clip/baidu_weather.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/clip/baidu_weather.js) | `/baidu/s/weather/上海` | 1.0.0 | 内置 Cookie（明文源码），无需浏览器绑定 |
| 通用网页区域 | [clip/website.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/clip/website.js) | `/web/region?url=https%3A%2F%2Fexample.com%2F&selector=body` | 1.0.0 | Browser Rendering 绑定 |

导出契约、结果字段和旧记录兼容方式见 [Clip 脚本说明](clip/README.md)。

### Detect 内容检测（2 个）

| 脚本 | 文件 | 路由示例 | 版本 | 使用要求 |
| --- | --- | --- | --- | --- |
| GitHub Releases 检测 | [detect/github_releases.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/detect/github_releases.js) | `/github/ltaoo/findrss-worker/releases.atom` | 1.0.0 | 公开 Atom 窗口 |
| 网页正文检测 | [detect/website_text.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/detect/website_text.js) | `/web/text/detect?url=https%3A%2F%2Fexample.com%2F&selector=body` | 1.0.0 | 静态 HTML |

导出契约、差异事件和历史基线见 [Detect 脚本说明](detect/README.md)。

## 定时巡检

GitHub Actions 在推送、PR 时运行夹具测试和 Wrangler 打包检查；定时或手动运行时，每 6 小时请求已部署 Worker 的 `/api/rss`、`/api/hot`、`/api/clip` 和 `/api/detect` 路由，逐项检查请求、非空响应、格式和输出内容。

在仓库 **Settings → Secrets and variables → Actions** 设置：

| 类型 | 名称 | 用途 |
| --- | --- | --- |
| Variable | `CHECK_BASE_URL` | 已部署的 Worker 地址 |
| Secret | `CHECK_ACCESS_TOKEN` | Worker 的 `ACCESS_TOKEN`；未配置鉴权时可留空 |
| Secret | `NOTIFY_TOKEN` | 失败汇总通知接口的令牌 |

首次发布脚本市场时，在 **Settings → Pages → Source** 选择 **GitHub Actions**。检查样本维护在 [`.github/route-checks.json`](.github/route-checks.json)，仅供巡检读取，修改样本无需重新部署 Worker。

JSON / Markdown / HTML 报告、脚本图标及 HTTP 2xx 路由的原始响应正文保存到独立的 [`route-reports` 分支](https://github.com/ltaoo/findrss-scripts/tree/route-reports)，并保留 Actions artifact；正文按实际请求路径存入 `reports/responses/`。分支 README 按脚本展示版本、图标、成功／失败及失败原因，HTML 发布到脚本市场。

本地可用 `npm run build && npm run check:local` 对 `npm run dev` 的 `http://127.0.0.1:8801` 运行同一巡检；回环地址会自动读取 `.dev.vars` 中的 `ACCESS_TOKEN`，其他端口和地址通过 `CHECK_BASE_URL` 指定。

路由失败时仍会保存、发布完整报告并推送汇总通知。巡检步骤以生成 `reports/index.html` 为成功条件，工作流通过不代表全部路由通过，请查看具体报告。原始响应会随产物分支公开，包括使用登录态采集的内容。

巡检样本覆盖、报告格式、通知和发布行为见[部署与巡检说明](docs/cloudflare.md#github-actions)。

## 生成接口文档

```sh
npm run openapi
```

生成的 `dist/openapi.json` 使用 OpenAPI 3.0.3，仅包含 `/api/rss`、`/api/hot`、`/api/clip` 和 `/api/detect` 四类接口，以及它们的名称、说明、路径和查询参数、调用示例、响应格式及 Bearer 鉴权说明。普通构建也会自动生成；已有构建产物时，可运行 `node scripts/generate_openapi.js` 单独重新生成。

导入客户端后，将 `{{baseURL}}` 设置为实际 Worker 地址，例如 `https://scripts.findrss.cloud`。使用标准 OpenAPI 工具时需先替换该客户端变量。

接口通过 `tags` 和 `x-apifox-folder` 按 `Kind/类别` 分组，例如 `hot/小说`、`rss/资讯`、`clip/网页`。`/api/rss` 返回订阅 JSON 快照，可选路径参数展开为不同路径。优先使用脚本的 `category`，其余分类维护在 [`scripts/generate_openapi.js`](scripts/generate_openapi.js)，缺少分类的新脚本归入对应类型的「其他」。生成过程只读取元数据，不请求上游或读取本机凭据。

## 开发与验证

采集源码分别位于 `rss/`、`hot/`、`clip/`、`detect/`；`worker/` 提供独立 HTTP 入口，`scripts/` 负责构建和巡检，`test/` 维护单测与回包夹具。新增脚本放入对应类型目录，构建时会自动发现，无需手工注册。

使用 Node.js 22.19.0 或更新版本，在本仓库根目录运行：

```sh
npm ci
npm test
npm run dry-run
```

测试前会自动构建并准备固定版本运行时，复用其生产 QuickJS、FeedModel 和测试加载器。测试直接读取四类脚本源码，无需先同步 Worker 内置快照；构建不请求脚本的上游站点。

使用指定的本地 FindRSS 运行时做兼容性验证：

```sh
FINDRSS_WORKER_ROOT=/path/to/findrss-worker npm test
```

Cloudflare 部署入口始终使用固定版本。更新运行时提交或 `scripts/patches/` 中的补丁后，需重新运行全部测试和打包检查。Worker 管理后台的权限、发布等平台功能测试仍在 findrss-worker 中运行；共享的签名 SDK 夹具在两边保留，更新 SDK 时需同步。

## 同步到 FindRSS Worker

主项目只保留自动生成的内置脚本快照，供默认数据、区域剪藏、热榜及离线测试使用，不再维护 `examples/scripts` 源码副本。修改本仓库的脚本后，在 **findrss-worker 根目录**运行：

```sh
node scripts/sync_hot_scripts.js /path/to/findrss-scripts
node scripts/sync_hot_scripts.js /path/to/findrss-scripts --check
```

将生成的 `server/infra/builtin_script_sources.js` 随 Worker 改动提交。普通 Worker 构建只使用已有快照，不要求额外检出本仓库，也不会在构建期间访问 GitHub 或采集站点。更新 Worker 内置快照不会覆盖后台已发布的自定义脚本；更新已导入脚本仍需在后台发布新版本，然后重新生成热榜快照。

同步命令的 `--check` 可校验本仓库全部源码与 Worker 快照一致。参数、Cookie、API 配置及当前已验证范围见[详细使用说明](docs/usage.md)。

## 使用限制与反馈

网站可能限流、要求验证或调整接口。夹具测试不代表全部来源的在线可用性，仓库没有对所有站点和凭据执行真实请求，也不会用空列表或虚构热度掩盖上游错误。发布前请在自己的部署环境运行 Debug；需要浏览器的脚本还需验证实际绑定。

反馈问题时，请附上脚本文件、版本、具体路由、复现步骤和错误提示，并隐藏 Cookie、令牌等凭据。

## 更多文档

- [详细使用说明](docs/usage.md)：各来源参数、分页、Cookie、设备要求及已验证范围。
- [部署与巡检](docs/cloudflare.md)：Cloudflare 配置、访问令牌、Cookie 同步、检查样本及故障处理。
- [Hot 脚本说明](hot/README.md)：热榜字段、排名与热度约定。
- [Clip 脚本说明](clip/README.md)：剪藏契约、结果字段与旧记录兼容。
- [Detect 脚本说明](detect/README.md)：快照、差异事件及历史基线。
- [FindRSS 主项目](https://github.com/ltaoo/findrss-worker)：部署带管理后台的完整工具。

## 许可证

本项目采用 [MIT 许可证](LICENSE)。原有脚本来源声明和授权信息保留，第三方资源遵循其各自的许可证。
