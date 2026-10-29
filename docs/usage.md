# 详细使用说明

源码位于本仓库根目录的 `hot/`、`rss/` 和 `clip/`。下文涉及的测试与构建命令均在 [findrss-worker](https://github.com/ltaoo/findrss-worker) 根目录运行。完整清单见[仓库首页](../README.md)。

# 脚本示例

## 区域剪藏

剪藏是 `kind = "clip"` 的平台脚本，与 RSS、Hot 共用导入、Debug 和发布流程。[完整契约](../clip/README.md)、[GitHub README 平台脚本](../clip/github.js)、[通用网页兼容脚本](../clip/website.js)。节点提取与样式冻结由 `ctx.clip.capture` 共享提供。后台剪藏记录选择已发布且启用的脚本和具体路由，配置刷新策略；旧记录自动关联通用网页脚本，保留固定链接和快照。使用浏览器采集时需要 `BROWSER` 绑定，浏览器不会自动注入 Cookie。

## RSS 与热榜

本目录的 RSS 脚本使用全局 `RSSScript` 和 `import { utils } from '@findrss/util'`，接口请求、JSON 解析和校验返回 `Result`。

两类脚本都通过 `export const route = { path, handler, ... }` 或 `routes` 注册路径，模块级 `export const kind = "rss"` / `"hot"` 区分脚本类型；未声明时兼容文件头 `/** RSS */` / `/** HOT */` 和基类推断。`/rss/<path>`、`/atom/<path>` 仅匹配 RSS 脚本；`/api/hot/<path>` 仅匹配 Hot 脚本，返回排行榜 JSON。例如 Hot 脚本注册 `/douyin/hot`，访问 `/api/hot/douyin/hot`。路径参数和查询参数保留，仍需满足路由公开性、访问凭证及 Cookie 授权要求。

每个脚本通过 `export const platform = { name, icon }` 声明来源，`icon` 已直接内嵌对应的 SVG 源码；多路由共用此对象，也可用 `route.platform` 覆盖。正式版本发布成功后才收集来源到数据库，供订阅广场与后台来源筛选 Select 使用，保存草稿和 Debug 不注册来源。

可用 `export const tags = ['科技', '文章']` 声明共用标签，或用 `route.tags` 逐条覆盖（`[]` 表示无标签）。每条路由最多 13 个不同标签，每个为去除首尾空白后的 1–32 字符且不含控制字符。正式发布后聚合为 discover 和后台的可选标签，新建自有源时按匹配路由预填，可手动修改；草稿和 Debug 不注册标签。标签属于脚本元数据，不是 handler 返回的 feed 字段。

复制单个 `.js` 到管理后台 `/admin/scripts` 的 RSS Tab，可保存草稿、运行 Debug，确认后发布。同一主路由可用 `/rss/<path>` 或 `/atom/<path>` 获取订阅。章节正文等附加路由仍返回 HTML。

## 选择脚本

以下路径为脚本声明的主路由，订阅时在前面加 `/rss` 或 `/atom`，并将 `:参数` 替换为实际值。标注 Cookie 的脚本需先同步对应站点的 Cookie，并在后台确认脚本权限；微信公众号和视频号需连接支持对应能力的设备。

| 脚本 | 主路由 | 采集内容与使用要求 |
| --- | --- | --- |
| [哔哩哔哩](../rss/bilibili.js) | `/bilibili/:userid/dynamic`、`/bilibili/:userid/upload/video` | UP 主动态与投稿视频；`userid` 为数字 UID，需授权 Cookie |
| [YouTube](../rss/youtube.js) | `/youtube/:handle`、`/youtube/:handle/shorts` | 频道视频与 Shorts 首屏列表；`handle` 的 `@` 可省略，需授权 Cookie |
| [知乎](../rss/zhihu.js) | `/zhihu/people/:user` 等 8 条路由，见下方 | 动态、回答、视频、提问、文章、专栏、想法与收藏夹；需授权 Cookie |
| [微博](../rss/weibo.js) | `/weibo/u/:uid` | 用户微博及图片、视频；`uid` 为数字用户 ID，需授权 Cookie |
| [X](../rss/x.js) | `/x/:username` | 用户推文，读取上游返回的一页；用户名的 `@` 可省略，需授权 Cookie |
| [Instagram](../rss/instagram.js) | `/instagram/:username` | 用户首屏图片、视频与多图作品，保留发布时间；需授权登录 Cookie |
| [抖音](../rss/douyin.js) | `/douyin/user/:sec_uid` | 作者视频与图集；使用主页 `/user/` 后的 `sec_uid`，需授权 Cookie |
| [快手](../rss/kuaishou.js) | `/kuaishou/profile/:user_id` | 作者最新一页作品；使用主页 `/profile/` 后的 ID，需授权完整登录与验证 Cookie |
| [小红书](../rss/xiaohongshu.js) | `/xiaohongshu/user/profile/:uid` | 默认读取首屏笔记和封面；加 `?full_content=true`（或 `1`）逐条请求详情获取完整正文、图集和视频；`uid` 为 24 位十六进制 ID，需授权 Cookie |
| [Telegram](../rss/telegram.js) | `/telegram/channel/:username` | 公开频道文本、照片与视频；用户名的 `@` 可省略，无需 Bot Token |
| [微信公众号](../rss/wxmp.js) | `/wxmp/:account?` | 文章与图集；使用公众号微信号或原始 ID，配置完整 `api_url=https://dhub.funzm.com/api/wxmp/biz/msg/list` 及 `auth_token`，直接 POST 到该地址 |
| [微信视频号](../rss/wxchannels.js) | `/wxchannels/:account` | 视频、图集、Live Photo 与直播；使用视频号 `username`，配置完整 `api_url=https://dhub.funzm.com/api/wxchannels/contact/feed/list` 及 `auth_token`，直接 POST 到该地址 |
| [番茄小说](../rss/fanqienovel.js) | `/fanqienovel/book/:book_id` | 完整章节目录与正文代理；ID 来自详情页 `/page/` 后的数字 |
| [起点中文网](../rss/qidian.js) | `/qidian/book/:book_id` | 完整跨卷目录与正文代理；需授权 Cookie，付费章节需有效阅读权限 |
| [69 书吧](../rss/69shuba.js) | `/69shuba/book/:book_id` | 完整章节目录，不抓取正文；ID 来自 `/book/<ID>.htm` |
| [天天看书](../rss/ttk.js) | `/ttk/book/:book_id` | 完整章节目录，不抓取正文；标识来自 `/novel/` 后的路径，不含 `.html` |
| [Apple App Store](../rss/apple.js) | `/apple/apps/update/:country/:id/:platform?` | 应用版本更新；使用 App Store 链接中的地区与应用 ID |
| [GitHub](../rss/github.js) | `/github/:org/:pro/release` | 公开仓库最近的发布列表、版本标题与更新说明；无需 Cookie 或 API Token |

抖音支持 `?count=18&max_cursor=0`（每页最多 30 条），Telegram 支持 `?before=<消息 ID>`，微信公众号和视频号支持 `?offset=<游标>`。微信公众号也可使用 `/rss/wxmp?username=wow36kr`，与 `/rss/wxmp/wow36kr` 等价；图片代理需配置 `FINDRSS_HOSTNAME`。

YouTube 普通视频根据页面中英文相对时间估算发布时间，月、年分别按 30、365 天计算；Shorts 页面未提供时间时不估算。小红书的用户 ID 不是小红书号。快手通过作品接口读取数据，需同步完整的登录与验证 Cookie，包括 `kuaishou.server.webday7_st`、`kuaishou.server.webday7_ph` 和 `kwfv1`；主页能打开不代表作品接口可用。

番茄小说正文路径为 `/fanqienovel/chapter/:chapter_id`，起点正文路径为 `/qidian/chapter/:book_id/:chapter_id`，直接返回 HTML，无需加 `/rss` 或 `/atom` 前缀。

## 路由与参数说明

`rss/github.js` 读取 GitHub 的 Releases Atom 订阅。例如 `/rss/github/ltaoo/wx_channels_download/release`，Atom 地址为 `/atom/github/ltaoo/wx_channels_download/release`；`org` 为用户或组织名，`pro` 为仓库名。返回上游订阅包含的最近发布，保留预发布条目、更新说明 HTML、代码缩进及原文链接；上游仅提供更新时间时保留 `updated`，不补造发布时间。只读取公开仓库，不需要导入 GitHub Cookie。

`rss/apple.js` 参考 RSSHub 的 Apple Apps 路由，订阅 App Store 应用的版本更新。例如 `/rss/apple/apps/update/us/id408709785`；末尾可添加 `/ios`、`/macos`、`/tvos` 筛选平台，缺省或 `all` 合并全部平台，不支持的平台也按上游逻辑回退为全部平台。`?limit=100` 控制返回数量（1–1000，默认 100）。应用 ID 支持带 `id` 前缀或纯数字；地区和 ID 从 App Store 应用链接中获取。更新说明保留换行，条目按真实发布时间排序，平台和版本共同组成稳定 ID。

`rss/bilibili.js` 合并用户动态和投稿视频，导出 `/bilibili/:userid/dynamic` 与 `/bilibili/:userid/upload/video` 两条路由，`userid` 为 UP 主数字 UID。例如 `/rss/bilibili/650898515/dynamic` 和 `/rss/bilibili/650898515/upload/video`。动态支持 `offset` 游标，视频支持 `pn` 页码与 `ps` 每页数量。已有后台脚本需替换并重新确认 Cookie 授权后发布，订阅地址需改用新路径。

`rss/zhihu.js` 导出 8 条独立路由，以下路径均带 `/zhihu` 前缀：

| 路径 | 内容 |
| --- | --- |
| `/people/:user` | 用户动态 |
| `/people/:user/answers` | 回答 |
| `/people/:user/zvideos` | 视频 |
| `/people/:user/asks` | 提问 |
| `/people/:user/posts` | 文章 |
| `/column/:column_id` | 专栏 |
| `/people/:user/pins` | 想法 |
| `/collection/:collection_id` | 收藏夹 |

例如 `/rss/zhihu/people/zhihu/answers`；用户参数统一为 `user`。无后缀的用户入口读取动态，回答订阅使用 `/answers`，视频、提问、文章、想法分别使用 `/zvideos`、`/asks`、`/posts`、`/pins`。默认读取最新 20 条，动态支持 `limit`（1–50）；专栏和收藏夹支持混合内容，想法保留文字和图片，重复条目按稳定 ID 去重。两个旧知乎脚本已合并为 `rss/zhihu.js`，旧动态路径 `/zhihu/people/activities/:id` 改用 `/zhihu/people/:user`。登录 Cookie 按 `www.zhihu.com`、`zhuanlan.zhihu.com`、`api.zhihu.com` 分别声明权限。已有后台脚本需替换并重新确认 Cookie 授权后发布。

## 编写与验证

`fetch(ctx)` 返回 `Result<feed>`，`route.handler` 调用实例 `run(ctx)`。基类校验稳定 ID、标题和原文链接，按发布时间倒序并去重；缺失时间不补采集时间。YouTube 普通视频会估算相对日期，小说目录按章节序号或目录顺序倒序输出。正文、多图、视频附件、解密 key 和动态照片保留，RSS 关注文章内容与发布时间。

依赖登录的脚本在 `permissions.cookies` 中明确声明来源、Cookie 名称和用途，显式调用 `ctx.cookies.get` 获取本次执行的句柄，再传入请求；源码变化后需重新确认授权。日志演示抓取、解析与媒体处理，不记录凭证或账户页面正文。

示例不会自动导入后台。Worker 的 `test/script_examples_migration.test.js` 用生产 QuickJS 和模拟回包验证路由、排序、正文代理、RSS/Atom 渲染及媒体；未验证所有站点当前在线接口及实际登录态。SDK 仅适用于 Worker QuickJS，Go/goja 暂不支持。

## 英语与日语平台

29 个国际平台 Hot 脚本覆盖英语、日语等资讯、新闻、视频、社媒、小说、动漫和音乐。YouTube、TikTok 需配置官方 API 凭据，其余脚本使用公开接口或内容源，不需要新增依赖。标题保留原文；只有上游明确提供名次时才返回数字排名，没有该字段时 `rank` 为 `null`，列表保持上游顺序，不按下标补造排名。新闻、最新资讯及精选列表按其实际含义命名。已有 Hacker News、GitHub Trending、Product Hunt 等示例继续保留。

| 平台与来源 | 路由 | 内容和热度 |
| --- | --- | --- |
| [Google News](https://news.google.com/) · [脚本](../hot/google_news.js) | `/google-news/:edition?/:topic?` | 美国/英国英语、日本日语新闻聚合；没有热度数值 |
| [Techmeme](https://www.techmeme.com/feed.xml) · [脚本](../hot/techmeme.js) | `/techmeme/hot` | 官方科技头条 RSS；没有热度数值 |
| [Lobsters](https://lobste.rs/hottest.json) · [脚本](../hot/lobsters.js) | `/lobsters/hot` | 官方热门讨论第一页，链接到讨论页；热度为帖子得分 |
| [DEV Community](https://developers.forem.com/api/v1#tag/articles/operation/getArticles) · [脚本](../hot/devto.js) | `/devto/top/:period?` | 官方热门文章 API 前 30 篇；热度为 `public_reactions_count` |
| [Hatena](https://b.hatena.ne.jp/hotentry/all) · [脚本](../hot/hatena.js) | `/hatena/hot/:topic?` | 官方热门书签 RSS 1.0；热度为 `hatena:bookmarkcount` |
| [Mastodon](https://docs.joinmastodon.org/methods/trends/) · [脚本](../hot/mastodon.js) | `/mastodon/trending/:type?` | mastodon.social 前 20 个热门链接/话题/动态；前两者取 `history[0].uses`，动态取点赞数 |
| [Project Gutenberg](https://www.gutenberg.org/browse/scores/top) · [脚本](../hot/gutenberg.js) | `/gutenberg/top/:period?` | 指定周期的图书下载 Top 100，包括英语小说及其他公版图书；热度为下载量 |
| [カクヨム](https://kakuyomu.jp/rankings/all/daily?work_variation=long) · [脚本](../hot/kakuyomu.js) | `/kakuyomu/rank/:period?/:genre?` | 官网第一页，保留明确排名；热度为作品总星标，非榜单计算得分 |
| [小説家になろう](https://dev.syosetu.com/man/api/) · [脚本](../hot/narou.js) | `/narou/top/:period?` | 官方小说 API 按周期积分降序取前 30 部作品；非历史排名 API，接口没有排名字段 |
| [YouTube API](https://developers.google.com/youtube/data/docs/videos/list) · [脚本](../hot/youtube_hot.js) | `/youtube/hot/:region?/:category?` | 官方 `mostPopular` 前 50 条；热度为累计播放数，无数字名次 |
| [TikTok Discovery](https://github.com/tiktok/tiktok-business-api-sdk/blob/main/python_sdk/docs/CreativeManagementApi.md#discovery_trending_list) · [脚本](../hot/tiktok.js) | `/tiktok/hot/:country?/:days?` | 官方热门话题；`rank_position` 为名次，`posts` 为指定地区及周期投稿数 |
| [Dailymotion](https://api.dailymotion.com/videos?sort=trending&limit=30) · [脚本](../hot/dailymotion.js) | `/dailymotion/hot/:country?` | 分地区 trending 前 30 条，热度为累计播放数 |
| [Niconico](https://www.nicovideo.jp/ranking) · [脚本](../hot/niconico.js) | `/niconico/rank` | 页面 server-response 中的综合 Teiban 榜及播放数 |
| [Vimeo](https://vimeo.com/channels/staffpicks/videos/rss) · [脚本](../hot/vimeo.js) | `/vimeo/staff-picks` | 官方 Staff Picks 精选，非热度排行榜 |
| [Reddit](https://www.reddit.com/r/popular/) · [脚本](../hot/reddit.js) | `/reddit/:subreddit?/:sort?` | Listing JSON hot/top/rising，保留置顶和得分 |
| [Bluesky](https://endpoints.bsky.app/) · [脚本](../hot/bluesky.js) | `/bluesky/trending` | 官方公开 `getTrendingTopics`，不混入 suggested，无热度数值 |
| [Zenn](https://zenn.dev/api/articles?order=trend) · [脚本](../hot/zenn.js) | `/zenn/trending` | 日语趋势文章第一页，热度为点赞数 |
| [Qiita](https://qiita.com/popular-items/feed) · [脚本](../hot/qiita.js) | `/qiita/hot` | 官方热门文章 Atom，无热度数值 |
| [Slashdot](https://rss.slashdot.org/Slashdot/slashdotMain) · [脚本](../hot/slashdot.js) | `/slashdot/headlines` | 英语科技社区资讯 RSS 1.0，无热度数值 |
| [Ars Technica](https://feeds.arstechnica.com/arstechnica/index) · [脚本](../hot/arstechnica.js) | `/arstechnica/headlines` | 英语最新科技资讯，无热度数值 |
| [The Verge](https://www.theverge.com/rss/index.xml) · [脚本](../hot/theverge.js) | `/theverge/headlines` | 英语最新科技资讯 Atom，无热度数值 |
| [NPR](https://feeds.npr.org/1001/rss.xml) · [脚本](../hot/npr.js) | `/npr/headlines` | 英语 Top Stories，无热度数值 |
| [NHK](https://www.nhk.or.jp/rss/news/cat0.xml) · [脚本](../hot/nhk.js) | `/nhk/headlines` | 日语主要新闻，无热度数值 |
| [Yahoo! JAPAN](https://news.yahoo.co.jp/rss/topics/top-picks.xml) · [脚本](../hot/yahoo_japan.js) | `/yahoo-japan/headlines` | 日语主要新闻话题，无热度数值 |
| [ITmedia](https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml) · [脚本](../hot/itmedia.js) | `/itmedia/headlines` | 日语最新科技资讯，无热度数值 |
| [Apple Charts](https://rss.marketingtools.apple.com/) · [脚本](../hot/apple_charts.js) | `/apple-charts/:country?/:type?` | 官方 Top/Most Played 前 50 条，无显式名次或播放量 |
| [Deezer](https://api.deezer.com/chart/0/tracks?limit=30) · [脚本](../hot/deezer.js) | `/deezer/chart` | 歌曲榜；`position` 是名次，`rank` 是流行度评分 |
| [AniList](https://docs.anilist.co/) · [脚本](../hot/anilist.js) | `/anilist/trending/:type?` | 动画/漫画官方 GraphQL 趋势榜，热度为 trending 活跃度 |
| [MyAnimeList](https://myanimelist.net/topanime.php) · [脚本](../hot/myanimelist.js) | `/myanimelist/top/:type?` | 动画/漫画/轻小说评分榜第一页，保留明确名次和评分 |

参数与示例：

- Google News：`edition=us`（默认）、`gb`、`jp`；`topic=top`（默认）、`world`、`nation`、`business`、`technology`、`entertainment`、`sports`、`science`、`health`。例如 `/google-news/jp/top`、`/google-news/gb/technology`。
- DEV：`period=day`、`week`（默认）、`month`、`year`；对应 API `top=1/7/30/365`，例如 `/devto/top/month`。
- Hatena：`topic=all`（默认）、`general`、`social`、`economics`、`life`、`knowledge`、`it`、`fun`、`entertainment`、`game`。例如 `/hatena/hot/it`。
- Mastodon：`type=links`（默认）、`tags`、`statuses`，例如 `/mastodon/trending/statuses`。来源固定为 mastodon.social，覆盖该实例可见并审核的趋势，内容可能有多种语言，不代表整个联邦宇宙。
- Gutenberg：`period=day`（昨日，默认）、`week`（近 7 天）、`month`（近 30 天）。例如 `/gutenberg/top/week`；只读取指定周期的图书榜，不混入作者榜。
- カクヨム：`period=daily`（默认）、`weekly`、`monthly`、`yearly`、`entire`；`genre=all`（默认）、`fantasy`、`action`、`sf`、`love_story`、`romance`、`drama`、`horror`、`mystery`、`nonfiction`、`history`、`criticism`、`others`。查询参数 `length=long`（默认）、`short`、`all`。例如 `/kakuyomu/rank/weekly/fantasy?length=short`。
- なろう：`period=daily`（默认）、`weekly`、`monthly`、`quarter`、`yearly`、`total`。例如 `/narou/top/monthly`；积分来自官方 `daily_point` 等对应字段，N 代码统一为小写，未知积分为 `null`。
- YouTube：`region=US`（默认）、`JP`、`GB` 等官方支持地区；`category=0`（默认全部），也支持官方数字分类，如 `10` 音乐、`20` 游戏。例如 `/youtube/hot/JP/10`。当前 `mostPopular` 内容侧重音乐、电影和游戏，不是已下线的旧全站 Trending 页面。
- TikTok：`country=US`（默认）、`JP`、`GB` 等官方支持地区；`days=1`、`7`（默认）、`30`、`120`。例如 `/tiktok/hot/JP/7`。展示官方 Discovery 热门话题，不是 For You 个性化推荐流。
- Dailymotion：`country=us`（默认）、`jp`、`gb` 等地区代码，例如 `/dailymotion/hot/jp`。
- Reddit：`subreddit=popular`（默认）、`news`、`worldnews` 等；`sort=hot`（默认）、`top`、`rising`。仅 `top` 支持查询参数 `period=day`（默认）、`week`、`month`、`year`、`all`，如 `/reddit/news/top?period=week`。没有集成 OAuth，需上游允许公开访问。
- Apple Charts：`country=us`（默认）、`jp`、`gb` 等地区；`type=podcasts`（默认）、`songs`、`albums`。例如 `/apple-charts/jp/songs`，播客使用 `top`，音乐使用 `most-played`。
- AniList：`type=anime`（默认）、`manga`，例如 `/anilist/trending/manga`，优先日文标题；MyAnimeList：`type=anime`（默认）、`manga`、`novels`，例如 `/myanimelist/top/novels`。

YouTube 和 TikTok 需要先在后台导入脚本、填写配置并发布启用：

- YouTube：在 Google Cloud 项目启用 YouTube Data API v3，创建自己的 API Key，并在脚本「配置」中填写 `api_key`。请求消耗官方配额；未填时明确报配置错误，不会请求旧 Trending 页或拿首页推荐代替榜单。
- TikTok：在 TikTok Business 开通 Discovery API 权限，将授权广告账户 ID 填入 `advertiser_id`，令牌填入 `access_token`。仅有普通登录 Cookie 或令牌但没有 Discovery 权限仍可能被拒绝。Creative Center 网页现在可能只返回客户端壳或权限错误，本脚本使用官方 `/open_api/v1.3/discovery/trending_list/`。

凭据只放在 `X-Goog-Api-Key` / `Access-Token` 请求头，跨 origin 重定向时移除且返回原站后不恢复，调试日志仅记录头名称。不要把真实密钥写进脚本源码、默认值、URL 或日志。配置表单的 `writeOnly` 只遮挡输入，配置按脚本元数据保存，不是独立加密密钥库，应仅由受信管理员维护。

这些脚本已加入构建时的 `rank/scripts.js` 清单；在后台单独使用时仍需复制脚本、Debug 并发布。JSON 访问地址在上表路由前加 `/api/hot`，例如 `/api/hot/google-news/jp/top`。更新采集源码后运行 `node scripts/sync_hot_scripts.js /path/to/findrss-scripts` 同步清单及内容版本，再构建部署；已部署实例需重新生成热榜快照。

非浏览器测试：`mise exec node@22.19.0 -- node --test test/expanded_hot_scripts.test.js test/international_hot_scripts.test.js test/script_util.test.js test/rss_fetch_headers.test.js rank/test/loader.test.js rank/test/runtime.test.js`。覆盖参数、解析、稳定 ID、去重、缺失热度、非法数据、请求失败、凭据边界和跨站重定向。当前通过 HTTP 获取的 Google News、Techmeme、Lobsters、DEV、Mastodon、Gutenberg、カクヨム，以及 Dailymotion、Niconico、Vimeo、Zenn、Qiita、Slashdot、Ars Technica、The Verge、NPR、NHK、Yahoo! JAPAN、ITmedia、Apple、Deezer、AniList、MyAnimeList 真实默认回包用于复核解析。

YouTube、TikTok 没有使用真实凭据执行官方 API，完成文档核对及模拟回包/凭据保护测试；Hatena、なろう、Bluesky 本机连接受限，Reddit 本机返回 403，完成模拟回包测试，需在部署环境手动 Debug。上游 API、网页结构或访问政策变化可能需要更新脚本。Royal Road、Scribble Hub 本机请求被拒绝，尚未接入。未运行或自动化浏览器。

## 小说排行榜

三个脚本覆盖当前官网公开榜单入口，复制到后台「脚本 → 热榜」中调试、发布。返回 `HotRankScript` 列表快照 JSON，稳定书籍 ID、上游排名、热度和可选封面 `thumbnail`；未知排名或热度为 `null`，没有封面时省略字段。

| 脚本 | 路由 | 覆盖范围 |
| --- | --- | --- |
| [起点](../hot/qidian.js) | 明确导出 17 条固定路由，见下表 | 官方移动端男频 9 榜、女频 8 榜；分类及适用的周期筛选 |
| [七猫小说](../hot/qimao.js) | `/qimao/rank/:gender?/:type?/:period?` | 男女频全部 5 类榜单及可用的日/月周期，共 16 个入口 |
| [番茄小说](../hot/fanqienovel.js) | `/fanqienovel/rank/:rank_id?` | 巅峰榜、男频 19 类与女频 18 类各自的阅读/新书榜，共 75 个入口 |

### 起点

脚本通过 `export const routes` 明确列出男频 9 条、女频 8 条固定路由，不再使用 `:type`、`:gender` 动态参数。男频读取 `m.qidian.com`，女频读取 `m.qdmm.com`，使用与 RSS 示例相同的移动端 User-Agent 和 Referer。

| 榜单 | 男频路由 | 女频路由 | 可选 period |
| --- | --- | --- | --- |
| 月票榜 | `/qidian/rank/yuepiao` | `/qidian/rank/yuepiao/female` | `YYYYMM`，如 `202609`；默认当月 |
| 畅销榜 | `/qidian/rank/hotsales` | `/qidian/rank/hotsales/female` | — |
| 阅读榜 | `/qidian/rank/readindex` | `/qidian/rank/readindex/female` | — |
| 书友榜 | `/qidian/rank/newfans` | `/qidian/rank/newfans/female` | `week`、`month`；默认周榜 |
| 推荐榜 | `/qidian/rank/rec` | `/qidian/rank/rec/female` | `week`、`month`、`all`；默认周榜 |
| 更新榜 | `/qidian/rank/update` | `/qidian/rank/update/female` | — |
| 签约榜 | `/qidian/rank/sign` | — | — |
| 新书榜 | `/qidian/rank/newbook` | — | — |
| 新人榜 | `/qidian/rank/newauthor` | — | — |
| 收藏榜 | — | `/qidian/rank/collect/female` | — |
| 免费榜 | — | `/qidian/rank/free/female` | — |

第一条路由为男频月票榜。原 `/qidian/rank` 请改用 `/qidian/rank/yuepiao`，原男频地址的 `/male` 后缀请去掉；其余表内地址保持不变。更新后台已发布的脚本后，固定路由才会替换旧的动态路由。

查询参数 `category` 为[官网移动榜单](https://m.qidian.com/rank/)分类链接中 `catid` 后的数字，默认 `-1` 全站；`period` 仅适用于表中列出的榜单。示例：

- `/qidian/rank/yuepiao`：男频当月月票榜。
- `/qidian/rank/free/female`：女频免费榜。
- `/qidian/rank/rec?category=21&period=all`：玄幻总推荐榜。
- `/qidian/rank/newfans/female?period=month`：女频月书友榜。
- `/qidian/rank/yuepiao?category=22&period=202609`：仙侠 2026 年 9 月月票榜。

只读取第一页，封面沿用 RSS 示例的阅文封面地址。没有提供热度的畅销、阅读等榜单不补造数值。当前本地 HTTP 核对中，女频站点返回风控验证页；脚本覆盖对应入口和数据解析，并明确报告上游错误，不输出假榜单，需在部署环境手动 Debug 验证。

### 七猫小说

`gender` 为 `boy`（男频，默认）或 `girl`（女频）。`period` 为 `date`（默认）或 `month`，以[官网榜单](https://www.qimao.com/paihang/)提供的周期为准。

| type | 榜单 | 周期与含义 |
| --- | --- | --- |
| `hot`（默认） | 大热榜 | `date` 日榜、`month` 月榜 |
| `new` | 新书榜 | `date` 日榜、`month` 月榜 |
| `over` | 完结榜 | `date` 日榜、`month` 月榜 |
| `collect` | 收藏榜 | 仅 `date` 路径，按总收藏数排序 |
| `update` | 更新榜 | 仅 `date` 路径，按近 30 天更新总字数排序 |

示例：`/qimao/rank/girl/new/month`（女频新书月榜）、`/qimao/rank/boy/collect`（男频收藏榜）、`/qimao/rank/girl/update`（女频更新榜）。收藏和更新榜没有日/月切换，显式传入 `month` 会报参数错误。只读取第一页，封面来自官方 HTML；收藏/更新榜未展示计数时保留未知，不把它们标为热度。

七猫可能以 HTTP 200 返回阿里云滑动验证页。脚本声明并携带 `acw_tc`、`acw_sc__v2`、`acw_sc__v3` 验证 Cookie，仅用于 `https://www.qimao.com/paihang/`。请手动完成官网验证，在后台同步有效的 `qimao.com` Cookie，并确认新版脚本的 Cookie 授权后发布。验证仍失败时脚本会明确报错；Cookie 可能失效或受上游 IP 限制，需在部署环境手动 Debug 验证。

### 番茄小说

`/fanqienovel/rank/peak` 读取官网巅峰榜完整接口列表（当前为 30 本），返回真实封面和已提供的综合得分。接口未返回显式排名或得分时使用 `null`，保留原始顺序，不根据下标伪造排名。

分类榜标识来自[官网榜单](https://fanqienovel.com/rank/1) `/rank/` 后的 `性别_榜单_分类`：`1` 男频、`0` 女频；`2` 阅读榜、`1` 新书榜。以下每个分类均支持阅读榜和新书榜，共 74 个入口。

| 男频分类 | 代码 | 女频分类 | 代码 |
| --- | --- | --- | --- |
| 西方奇幻 | `1141` | 古风世情 | `1139` |
| 东方仙侠 | `1140` | 科幻末世 | `8` |
| 科幻末世 | `8` | 游戏体育 | `746` |
| 都市日常 | `261` | 女频衍生 | `1015` |
| 都市修真 | `124` | 玄幻言情 | `248` |
| 都市高武 | `1014` | 种田 | `23` |
| 历史古代 | `273` | 年代 | `79` |
| 战神赘婿 | `27` | 现言脑洞 | `267` |
| 都市种田 | `263` | 宫斗宅斗 | `246` |
| 传统玄幻 | `258` | 悬疑脑洞 | `539` |
| 历史脑洞 | `272` | 古言脑洞 | `253` |
| 悬疑脑洞 | `539` | 快穿 | `24` |
| 都市脑洞 | `262` | 青春甜宠 | `749` |
| 玄幻脑洞 | `257` | 星光璀璨 | `745` |
| 悬疑灵异 | `751` | 女频悬疑 | `747` |
| 抗战谍战 | `504` | 职场婚恋 | `750` |
| 游戏体育 | `746` | 豪门总裁 | `748` |
| 动漫衍生 | `718` | 民国言情 | `1017` |
| 男频衍生 | `1016` | — | `—` |

例如 `/fanqienovel/rank/1_2_1141`（默认男频西方奇幻阅读榜）、`/fanqienovel/rank/0_1_1139`（女频古风世情新书榜）、`/fanqienovel/rank/0_2_24`（女频快穿阅读榜）。分类榜只读取第一页，从内嵌榜单 JSON 读取完整在读人数与真实封面，避免使用 HTML 占位图；标题沿用 RSS 示例的字体映射，未知编码会报错，避免输出乱码。

### 验证与使用限制

非浏览器验证（Node.js ≥ 22.19）：`node --test test/novel_hot_scripts.test.js test/script_agent_runtime_knowledge.test.js test/script_route.test.js`。测试依据官网入口清单逐项覆盖 108 个榜单入口，并验证参数、封面、排序、去重、缺失数值及请求失败透传。清单见 `test/fixtures/novel_rank_catalog.json`，包含来源地址。

当前范围为官网公开移动端/网页榜单；没有列入 App 内专属榜单或作者榜。脚本无需额外依赖，示例不会自动导入或发布。云端请求可能因访问地区或风控失败，番茄封面签名也可能过期；发布后请手动运行 Debug 验证，按刷新后的榜单使用封面 URL。验证页或缺失列表会报错，避免输出成功的空榜单。

## 回复、转发与原帖引用

`rss/x.js` 与 `rss/weibo.js` 用 `item.kind` 区分 `post`（原创）、`reply`（回复）、`repost`（转发）和 `quote`（引用）。现有 `item.type` 继续表示 `article`、`gallery`、`video`、`live`，可与互动类型同时使用。

原帖通过 `references` 返回，当前条目的正文、作者、图片和视频仅属于当前帖；原帖保留自己的完整 item 字段。单条内容可同时回复一篇、引用另一篇：

```js
{
  id: "x:tweet:200", kind: "reply", title: "我的回复",
  link: "https://x.com/replier/status/200", description: "我的回复",
  references: [{
    relation: "reply", id: "x:tweet:100", link: "https://x.com/original/status/100",
    item: {
      id: "x:tweet:100", kind: "post", title: "原帖",
      link: "https://x.com/original/status/100", content: "<p>原帖正文</p>",
      author: { name: "原作者", uri: "https://x.com/original" },
      images: ["https://example.com/original.jpg"]
    }
  }]
}
```

`relation` 支持 `reply`、`repost`、`quote`。`id`、`link` 至少提供一个，缺省时可从子项补齐。已知原帖删除或不可用时返回 `unavailable: true` 并省略 `item`；权限不足、请求失败或没有返回正文时仅保留引用，避免将请求失败误判为删除。

RSS 输出示例（Atom 中内嵌节点为 `entry`，其余扩展结构相同）：

```xml
<item>
  <title>我的回复</title>
  <findrss:kind xmlns:findrss="https://findrss.cloud/ns/reader">reply</findrss:kind>
  <findrss:reference xmlns:findrss="https://findrss.cloud/ns/reader"
      relation="reply" ref="x:tweet:100" href="https://x.com/original/status/100">
    <item>
      <title>原帖</title>
      <link>https://x.com/original/status/100</link>
      <guid isPermaLink="false">x:tweet:100</guid>
    </item>
  </findrss:reference>
</item>
```

内嵌原帖复用同一套 RSS/Atom 正文、署名、时间、媒体和引用渲染规则；不会成为顶层独立文章。FindRSS 共用解析器也保留 `article.kind` 与 `article.references`，子项使用解析后的 article 结构（稳定标识为 `guid`），原帖媒体不会混进父项。

脚本优先使用列表内嵌原帖，其次复用本页已有内容，再尝试详情接口补取；每次执行最多补取 8 个不同原帖，引用链最多内嵌 4 层，达到上限保留 ID/链接。X 补取依赖页面提供的客户端脚本和可用 GraphQL 操作。微博详情使用现有授权 Cookie，原微博图片和表情同样经过图片代理。仍只处理上游返回的这一页内容，不额外抓取完整回复或评论列表。已有后台脚本需替换示例、确认源码对应的 Cookie 授权后重新发布。

微博转发列表若通过 `analysis_extra.mblog_parent_id` 提供直接父帖 ID，会逐层补取中间转发；确认父帖后，将首个 `//@父帖作者:` 后的历史转发语交由父帖展示。父帖不可访问、已删除或达到补取上限时，保留未还原的转发文字和已知原帖，不根据用户名编造帖子 ID。
