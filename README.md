# findrss-scripts

[FindRSS](https://github.com/ltaoo/findrss-worker) 的独立采集脚本仓库，包含 **106 个脚本：84 个 Hot、18 个 RSS、2 个 Clip 剪藏脚本、2 个 Detect 内容检测脚本**。

本仓库是脚本的维护来源，也支持独立部署到 Cloudflare Workers。脚本使用 FindRSS 沙箱注入的 `RSSScript`、`HotRankScript`、`ClipScript`、`DetectScript`、`Result` 和 `@findrss/util`，不能直接作为普通 Node.js 脚本执行。原有来源授权声明、版本号和内嵌图标均保留。

## Cloudflare 部署与定时巡检

```sh
npm ci
npm test
npm run dry-run
npm run deploy
```

本地运行使用 `npm run dev`。Wrangler 在启动和部署前自动构建，扫描 `hot/`、`rss/`、`clip/`、`detect/` 全部脚本，无需手工导入。构建从 GitHub 下载固定版本的 FindRSS 生产运行时并安装其依赖，缓存于 `.runtime/`；不会构建管理后台，也不需要数据库。`/api/routes` 列出所有路由，`/health` 返回脚本和检查项数量。

GitHub Actions 每 6 小时访问部署后的全部路由，逐项验证请求、非空响应、响应格式和输出内容，并提供 JSON / Markdown 报告。需设置仓库变量 `CHECK_BASE_URL` 为 Worker 地址；有访问令牌时还需设置 Secret `CHECK_ACCESS_TOKEN`。配置凭据、设备能力、检查样本及故障处理见 [部署与巡检说明](docs/cloudflare.md)。

## 使用

1. 从下方完整清单打开所需 `.js` 文件，复制源码，或复制 GitHub 的 Raw 链接。
2. 在 FindRSS 后台「脚本」中按类型导入，填写必要配置并运行 Debug。
3. 确认 Cookie 权限后发布启用。RSS 路由前加 `/rss` 或 `/atom`；Hot 路由前加 `/api/hot`；Clip 路由前加 `/api/clip`。Detect 的 `/api/detect` 为无状态试采样；持续比较请创建后台内容检测任务。

例如 `/google-news/jp/top` 对应 `/api/hot/google-news/jp/top`。表中路由示例只展示默认入口，多路由、参数、分页、Cookie 和设备要求见[详细使用说明](docs/usage.md)及脚本自身的 `route` / `routes` 声明。Cookie 权限不代表所有接口都必须登录；是否需要登录和设备取决于所选路由及上游限制。

YouTube Hot 需要自己的 YouTube Data API Key；TikTok Hot 需要授权广告账户和具有 Discovery API 权限的令牌。配置表单的 `writeOnly` 仅遮挡输入，配置按脚本元数据保存。请勿把真实凭据提交到本仓库。

GitHub 仓库地址为 `https://github.com/ltaoo/findrss-scripts`，文档中的安装链接按 `main` 分支准备；仓库发布前 Raw 链接尚不可访问。

## 完整脚本清单

每个文件只列一次。没有明确数字排名的内容保留上游顺序，`rank` 为 `null`；新闻、最新资讯及精选源按实际用途命名。热榜详细字段见 [hot/README.md](hot/README.md)。

### RSS（18 个）

| 脚本 | 文件 | 路由示例 | 版本 | 使用要求 |
| --- | --- | --- | --- | --- |
| 69书吧小说章节 | [rss/69shuba.js](rss/69shuba.js) | `/69shuba/book/34567` | 1.1.0 | 公开来源 |
| Apple App Store 应用更新 | [rss/apple.js](rss/apple.js) | `/apple/apps/update/us/id408709785` | 1.1.0 | 公开来源 |
| 哔哩哔哩用户动态 | [rss/bilibili.js](rss/bilibili.js) | `/bilibili/650898515/dynamic` | 1.1.0 | Cookie 授权 |
| 抖音作者作品 | [rss/douyin.js](rss/douyin.js) | `/douyin/user/MS4wLjABAAAAOE57npukdzs0SH_Fk5RHB-qfUlnZ5jQT2R_KPH4Sd8s` | 1.1.0 | Cookie 授权 |
| 番茄小说章节 | [rss/fanqienovel.js](rss/fanqienovel.js) | `/fanqienovel/book/7143038691944959011` | 1.1.0 | 公开来源 |
| GitHub 发布列表 | [rss/github.js](rss/github.js) | `/github/ltaoo/wx_channels_download/release` | 1.0.0 | 公开来源 |
| Instagram 用户作品 | [rss/instagram.js](rss/instagram.js) | `/instagram/instagram` | 1.1.0 | Cookie 授权 |
| 快手用户作品 | [rss/kuaishou.js](rss/kuaishou.js) | `/kuaishou/profile/3xuxw5yhgr6f4um` | 1.1.0 | Cookie 授权 |
| 起点中文网章节列表 | [rss/qidian.js](rss/qidian.js) | `/qidian/book/1036526469` | 1.1.0 | Cookie 授权 |
| Telegram 公开频道 | [rss/telegram.js](rss/telegram.js) | `/telegram/channel/telegram` | 1.1.0 | 公开来源 |
| 天天看书小说章节 | [rss/ttk.js](rss/ttk.js) | `/ttk/book/daofeng` | 1.1.0 | 公开来源 |
| 微博用户列表 | [rss/weibo.js](rss/weibo.js) | `/weibo/u/1992429663` | 1.1.0 | Cookie 授权 |
| 微信视频号 | [rss/wxchannels.js](rss/wxchannels.js) | `/wxchannels/v2_060000231003b20faec8c5e1811ac5d4c803ee35b077b115ba7f22bad44fca23255c1a271f23@finder` | 1.1.0 | 配置：`PlayerHostname`；设备能力 |
| 微信公众号 | [rss/wxmp.js](rss/wxmp.js) | `/wxmp/wow36kr` | 1.1.0 | 设备能力 |
| X 用户作品 | [rss/x.js](rss/x.js) | `/x/NTCGoK9jFQURsEu` | 1.1.0 | Cookie 授权 |
| 小红书用户笔记 | [rss/xiaohongshu.js](rss/xiaohongshu.js) | `/xiaohongshu/user/profile/5d2aec020000000012037401` | 1.1.0 | Cookie 授权 |
| YouTube 频道视频 | [rss/youtube.js](rss/youtube.js) | `/youtube/@goldfishbrain` | 1.1.0 | Cookie 授权 |
| 知乎用户动态 | [rss/zhihu.js](rss/zhihu.js) | `/zhihu/people/zhihu` | 1.1.0 | Cookie 授权 |

### Hot（84 个）

| 脚本 | 文件 | 路由示例 | 版本 | 使用要求 |
| --- | --- | --- | --- | --- |
| 36氪 · 快讯 | [hot/36kr_quick.js](hot/36kr_quick.js) | `/36kr/quick` | 1.0.1 | 公开来源 |
| 36氪 · 人气榜 | [hot/36kr_renqi.js](hot/36kr_renqi.js) | `/36kr/renqi` | 1.0.1 | 公开来源 |
| AIHOT | [hot/aihot.js](hot/aihot.js) | `/aihot` | 1.0.1 | 公开来源 |
| AniList · 动漫趋势榜 | [hot/anilist.js](hot/anilist.js) | `/anilist/trending/anime` | 1.0.0 | 公开来源 |
| Apple · 播客/音乐榜 | [hot/apple_charts.js](hot/apple_charts.js) | `/apple-charts/us/podcasts` | 1.0.0 | 公开来源 |
| Ars Technica · 最新资讯 | [hot/arstechnica.js](hot/arstechnica.js) | `/arstechnica/headlines` | 1.0.0 | 公开来源 |
| 百度热搜 | [hot/baidu_hot.js](hot/baidu_hot.js) | `/baidu/hot` | 1.0.2 | 公开来源 |
| 哔哩哔哩 · 热搜 | [hot/bilibili_hot_search.js](hot/bilibili_hot_search.js) | `/bilibili/hot/search` | 1.0.1 | 公开来源 |
| 哔哩哔哩 · 热门视频 | [hot/bilibili_hot_video.js](hot/bilibili_hot_video.js) | `/bilibili/hot/video` | 1.0.1 | 公开来源 |
| 哔哩哔哩 · 排行榜 | [hot/bilibili_ranking.js](hot/bilibili_ranking.js) | `/bilibili/ranking` | 1.0.1 | 公开来源 |
| Bluesky · 趋势话题 | [hot/bluesky.js](hot/bluesky.js) | `/bluesky/trending` | 1.0.0 | 公开来源 |
| 参考消息 | [hot/cankaoxiaoxi.js](hot/cankaoxiaoxi.js) | `/cankaoxiaoxi` | 1.0.1 | 公开来源 |
| 虫部落 · 最热 | [hot/chongbuluo_hot.js](hot/chongbuluo_hot.js) | `/chongbuluo/hot` | 1.0.1 | 公开来源 |
| 虫部落 · 最新 | [hot/chongbuluo_latest.js](hot/chongbuluo_latest.js) | `/chongbuluo/latest` | 1.0.1 | 公开来源 |
| 财联社 · 深度 | [hot/cls_depth.js](hot/cls_depth.js) | `/cls/depth` | 1.0.1 | 公开来源 |
| 财联社 · 热门 | [hot/cls_hot.js](hot/cls_hot.js) | `/cls/hot` | 1.0.1 | 公开来源 |
| 财联社 · 电报 | [hot/cls_telegraph.js](hot/cls_telegraph.js) | `/cls/telegraph` | 1.0.1 | 公开来源 |
| Dailymotion · 热门视频 | [hot/dailymotion.js](hot/dailymotion.js) | `/dailymotion/hot/us` | 1.0.0 | 公开来源 |
| Deezer · 热门歌曲 | [hot/deezer.js](hot/deezer.js) | `/deezer/chart` | 1.0.0 | 公开来源 |
| DEV Community · 热门文章 | [hot/devto.js](hot/devto.js) | `/devto/top/week` | 1.0.0 | 公开来源 |
| 懂球帝 · 头条 | [hot/dongqiudi.js](hot/dongqiudi.js) | `/dongqiudi` | 1.0.1 | 公开来源 |
| 豆瓣 · 热门电影 | [hot/douban_hot.js](hot/douban_hot.js) | `/douban/hot` | 1.0.1 | 公开来源 |
| 抖音 | [hot/douyin_hot.js](hot/douyin_hot.js) | `/douyin/hot` | 1.1.1 | Cookie 授权 |
| 番茄小说排行榜 | [hot/fanqienovel.js](hot/fanqienovel.js) | `/fanqienovel/rank/1_2_1141` | 1.0.1 | 公开来源 |
| 法布财经 · 快讯 | [hot/fastbull_express.js](hot/fastbull_express.js) | `/fastbull/express` | 1.0.1 | 公开来源 |
| 法布财经 · 头条 | [hot/fastbull_news.js](hot/fastbull_news.js) | `/fastbull/news` | 1.0.1 | 公开来源 |
| Freebuf · 网络安全 | [hot/freebuf.js](hot/freebuf.js) | `/freebuf` | 1.0.1 | 公开来源 |
| 格隆汇 · 事件 | [hot/gelonghui.js](hot/gelonghui.js) | `/gelonghui` | 1.0.1 | 公开来源 |
| Github · Today | [hot/github_trending.js](hot/github_trending.js) | `/github/trending` | 1.0.1 | 公开来源 |
| Google News · 英语/日语头条 | [hot/google_news.js](hot/google_news.js) | `/google-news/us/top` | 1.0.0 | 公开来源 |
| Project Gutenberg · 热门图书 | [hot/gutenberg.js](hot/gutenberg.js) | `/gutenberg/top/day` | 1.0.0 | 公开来源 |
| Hacker News | [hot/hackernews.js](hot/hackernews.js) | `/hackernews` | 1.0.1 | 公开来源 |
| Hatena · 热门书签 | [hot/hatena.js](hot/hatena.js) | `/hatena/hot/all` | 1.0.0 | 公开来源 |
| 虎扑 · 主干道热帖 | [hot/hupu_hot.js](hot/hupu_hot.js) | `/hupu/hot` | 1.0.1 | 公开来源 |
| 凤凰网 · 热点资讯 | [hot/ifeng_hot.js](hot/ifeng_hot.js) | `/ifeng/hot` | 1.0.1 | 公开来源 |
| 爱奇艺 · 热播榜 | [hot/iqiyi_hot.js](hot/iqiyi_hot.js) | `/iqiyi/hot` | 1.0.1 | 公开来源 |
| IT之家 | [hot/ithome.js](hot/ithome.js) | `/ithome` | 1.0.1 | 公开来源 |
| ITmedia NEWS · 最新资讯 | [hot/itmedia.js](hot/itmedia.js) | `/itmedia/headlines` | 1.0.0 | 公开来源 |
| 金十数据 | [hot/jin10.js](hot/jin10.js) | `/jin10` | 1.0.1 | 公开来源 |
| 稀土掘金 | [hot/juejin_hot.js](hot/juejin_hot.js) | `/juejin/hot` | 1.0.1 | 公开来源 |
| カクヨム · 小说排行榜 | [hot/kakuyomu.js](hot/kakuyomu.js) | `/kakuyomu/rank/daily/all` | 1.0.0 | 公开来源 |
| 靠谱新闻 | [hot/kaopu.js](hot/kaopu.js) | `/kaopu` | 1.0.1 | 公开来源 |
| 快手 | [hot/kuaishou_hot.js](hot/kuaishou_hot.js) | `/kuaishou/hot` | 1.0.1 | 公开来源 |
| 酷安 · 今日最热 | [hot/kuan.js](hot/kuan.js) | `/kuan` | 1.0.1 | 公开来源 |
| Lobsters · 热门讨论 | [hot/lobsters.js](hot/lobsters.js) | `/lobsters/hot` | 1.0.0 | 公开来源 |
| Mastodon · 社媒趋势 | [hot/mastodon.js](hot/mastodon.js) | `/mastodon/trending/links` | 1.0.0 | 公开来源 |
| MKTNews · 快讯 | [hot/mktnews_flash.js](hot/mktnews_flash.js) | `/mktnews/flash` | 1.0.1 | 公开来源 |
| MyAnimeList · 动漫/轻小说榜 | [hot/myanimelist.js](hot/myanimelist.js) | `/myanimelist/top/anime` | 1.0.0 | 公开来源 |
| 小説家になろう · 小说积分榜 | [hot/narou.js](hot/narou.js) | `/narou/top/daily` | 1.0.0 | 公开来源 |
| NHK · 主要新闻 | [hot/nhk.js](hot/nhk.js) | `/nhk/headlines` | 1.0.0 | 公开来源 |
| ニコニコ動画 · 综合排行榜 | [hot/niconico.js](hot/niconico.js) | `/niconico/rank` | 1.0.0 | 公开来源 |
| 牛客 | [hot/nowcoder_hot.js](hot/nowcoder_hot.js) | `/nowcoder/hot` | 1.0.1 | 公开来源 |
| NPR · Top Stories | [hot/npr.js](hot/npr.js) | `/npr/headlines` | 1.0.0 | 公开来源 |
| 远景论坛 · Win11 | [hot/pcbeta_windows11.js](hot/pcbeta_windows11.js) | `/pcbeta/windows11` | 1.0.1 | 公开来源 |
| Product Hunt | [hot/producthunt.js](hot/producthunt.js) | `/producthunt` | 1.0.1 | 公开来源 |
| 起点 · 月票榜 | [hot/qidian.js](hot/qidian.js) | `/qidian/rank/yuepiao` | 1.1.1 | 公开来源 |
| Qiita · 热门文章 | [hot/qiita.js](hot/qiita.js) | `/qiita/hot` | 1.0.0 | 公开来源 |
| 七猫小说排行榜 | [hot/qimao.js](hot/qimao.js) | `/qimao/rank/boy/hot` | 1.0.2 | Cookie 授权 |
| 腾讯视频 · 热搜榜 | [hot/qqvideo_hot.js](hot/qqvideo_hot.js) | `/qqvideo/hot` | 1.0.1 | 公开来源 |
| Reddit · 社区热门 | [hot/reddit.js](hot/reddit.js) | `/reddit/popular/hot` | 1.0.0 | 公开来源 |
| Slashdot · 科技资讯 | [hot/slashdot.js](hot/slashdot.js) | `/slashdot/headlines` | 1.0.0 | 公开来源 |
| Solidot | [hot/solidot.js](hot/solidot.js) | `/solidot` | 1.0.1 | 公开来源 |
| 卫星通讯社 | [hot/sputniknewscn.js](hot/sputniknewscn.js) | `/sputniknewscn` | 1.0.1 | 公开来源 |
| 少数派 | [hot/sspai_hot.js](hot/sspai_hot.js) | `/sspai/hot` | 1.0.1 | 公开来源 |
| Steam · 在线人数 | [hot/steam.js](hot/steam.js) | `/steam` | 1.0.1 | 公开来源 |
| Techmeme · 科技头条 | [hot/techmeme.js](hot/techmeme.js) | `/techmeme/hot` | 1.0.0 | 公开来源 |
| 腾讯新闻 · 综合早报 | [hot/tencent_hot.js](hot/tencent_hot.js) | `/tencent/hot` | 1.0.1 | 公开来源 |
| 澎湃新闻 · 热榜 | [hot/thepaper_hot.js](hot/thepaper_hot.js) | `/thepaper/hot` | 1.0.1 | 公开来源 |
| The Verge · 最新资讯 | [hot/theverge.js](hot/theverge.js) | `/theverge/headlines` | 1.0.0 | 公开来源 |
| 百度贴吧 · 热议 | [hot/tieba_hot.js](hot/tieba_hot.js) | `/tieba/hot` | 1.0.1 | 公开来源 |
| TikTok · 热门话题 | [hot/tiktok.js](hot/tiktok.js) | `/tiktok/hot/US/7` | 1.0.0 | 配置：`advertiser_id`、`access_token` |
| 今日头条 | [hot/toutiao_hot.js](hot/toutiao_hot.js) | `/toutiao/hot` | 1.0.1 | 公开来源 |
| V2EX · 最新分享 | [hot/v2ex_share.js](hot/v2ex_share.js) | `/v2ex/share` | 1.0.1 | 公开来源 |
| Vimeo · Staff Picks 精选 | [hot/vimeo.js](hot/vimeo.js) | `/vimeo/staff-picks` | 1.0.0 | 公开来源 |
| 华尔街见闻 · 最热 | [hot/wallstreetcn_hot.js](hot/wallstreetcn_hot.js) | `/wallstreetcn/hot` | 1.0.1 | 公开来源 |
| 华尔街见闻 · 最新 | [hot/wallstreetcn_news.js](hot/wallstreetcn_news.js) | `/wallstreetcn/news` | 1.0.1 | 公开来源 |
| 华尔街见闻 · 快讯 | [hot/wallstreetcn_quick.js](hot/wallstreetcn_quick.js) | `/wallstreetcn/quick` | 1.0.1 | 公开来源 |
| 微博 · 实时热搜 | [hot/weibo_hot.js](hot/weibo_hot.js) | `/weibo/hot` | 1.0.1 | Cookie 授权 |
| 雪球 · 热门股票 | [hot/xueqiu_hotstock.js](hot/xueqiu_hotstock.js) | `/xueqiu/hotstock` | 1.0.1 | Cookie 授权 |
| Yahoo! JAPAN · 主要话题 | [hot/yahoo_japan.js](hot/yahoo_japan.js) | `/yahoo-japan/headlines` | 1.0.0 | 公开来源 |
| YouTube · 热门视频 | [hot/youtube_hot.js](hot/youtube_hot.js) | `/youtube/hot/US/0` | 1.0.0 | 配置：`api_key` |
| 联合早报 | [hot/zaobao.js](hot/zaobao.js) | `/zaobao` | 1.0.1 | 公开来源 |
| Zenn · 趋势文章 | [hot/zenn.js](hot/zenn.js) | `/zenn/trending` | 1.0.0 | 公开来源 |
| 知乎 | [hot/zhihu_hot.js](hot/zhihu_hot.js) | `/zhihu/hot` | 1.0.1 | 公开来源 |

### Clip 剪藏（2 个）

| 脚本 | 文件 | 路由示例 | 版本 | 使用要求 |
| --- | --- | --- | --- | --- |
| GitHub README | [clip/github.js](clip/github.js) | `/github/ltaoo/findrss-worker/readme` | 1.0.0 | Browser Rendering 绑定 |
| 通用网页区域 | [clip/website.js](clip/website.js) | `/web/region?url=https%3A%2F%2Fexample.com%2F&selector=body` | 1.0.0 | Browser Rendering 绑定 |

导出契约、结果字段和旧记录兼容方式见 [Clip 脚本说明](clip/README.md)。

### Detect 内容检测（2 个）

| 脚本 | 文件 | 路由示例 | 版本 | 使用要求 |
| --- | --- | --- | --- | --- |
| GitHub Releases 检测 | [detect/github_releases.js](detect/github_releases.js) | `/github/ltaoo/findrss-worker/releases/detect` | 1.0.0 | 公开 Atom 窗口 |
| 网页正文检测 | [detect/website_text.js](detect/website_text.js) | `/web/text/detect?url=https%3A%2F%2Fexample.com%2F&selector=body` | 1.0.0 | 静态 HTML |

导出契约、差异事件和历史基线见 [Detect 脚本说明](detect/README.md)。

## 同步到 FindRSS Worker

主项目只保留自动生成的内置脚本快照，供默认数据、区域剪藏、热榜及离线测试使用，不再维护 `examples/scripts` 源码副本。修改本仓库的脚本后，在 **findrss-worker 根目录**运行：

```sh
node scripts/sync_hot_scripts.js /path/to/findrss-scripts
node scripts/sync_hot_scripts.js /path/to/findrss-scripts --check
```

将生成的 `server/infra/builtin_script_sources.js` 随 Worker 改动提交。普通 Worker 构建只使用已有快照，不要求额外检出本仓库，也不会在构建期间访问 GitHub 或采集站点。更新 Worker 内置快照不会覆盖后台已发布的自定义脚本；更新已导入脚本仍需在后台发布新版本，然后重新生成热榜快照。

## 验证与限制

脚本单测、回包夹具在本仓库的 `test/` 中维护，直接读取 `hot/`、`rss/`、`clip/`、`detect/` 源码，不需要先同步 Worker 快照。使用 Node.js 22.19.0 或更新版本：

```sh
npm ci
npm test
```

测试前会自动构建并准备固定版本运行时，复用其生产 QuickJS、FeedModel 和测试加载器。可通过 `FINDRSS_WORKER_ROOT=/path/to/findrss-worker npm test` 使用指定的本地运行时做兼容性验证；Cloudflare 部署入口始终使用固定版本。Worker 管理后台的权限、发布等平台功能测试仍在 findrss-worker 中运行。共享的签名 SDK 夹具在两边保留，更新 SDK 时需同步。

同步命令的 `--check` 可校验本仓库全部源码与 Worker 快照一致。参数、Cookie、API 配置及当前已验证范围见[详细使用说明](docs/usage.md)。

网站可能限流、要求验证或调整接口。没有对所有站点和凭据执行真实请求；不会用空列表或虚构热度掩盖上游错误。仓库整理及迁移不启动或自动化浏览器，真实页面行为请手动验证。
