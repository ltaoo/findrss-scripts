# Hot 脚本示例

84 个脚本使用全局 `HotRankScript` 和 `import { utils } from '@findrss/util'`，接口请求、JSON 解析和校验返回 `Result`。包含原有 52 个热榜示例、3 个中文小说平台榜单与 29 个英语/日语等国际平台脚本。

复制单个 `.js` 到管理后台 `/admin/scripts` 的 Hot Tab，可保存草稿、运行 Debug，确认后发布。模块可显式声明 `export const kind = 'hot'`，也兼容顶部 `/** HOT */` 或 `HotRankScript` 基类推断。访问 `/api/hot` 加注册路径得到 `{ kind: 'hot_rank', observed_at, entries }`，例如 `/api/hot/douyin/hot`；原路由直达和 Debug 保留。`/rss` 或 `/atom` 仅匹配 RSS 脚本。

稳定 ID 不随排名变化。上游提供排名时保留正整数，未知为 `null`；置顶在前，其余排名全部已知时按排名排序，有未知排名时保留上游次序。热度只保留上游值，缺失为 `null`；`observed_at` 记录采集时间，不冒充发布时间。按标记归类的最新消息和 XML 源也使用快照结构，不捏造排名。

条目可返回 `thumbnail: "https://example.com/cover.jpg"`，用于小说封面等缩略图。基类校验并保留无凭据的 HTTP(S) 绝对地址；省略、`null` 或空字符串时不输出此字段。脚本先用 `utils.absolute_url` 转换相对地址；普通路由、缓存和 Debug JSON 均保留缩略图地址，不额外请求图片。

排行榜页面支持分类、来源筛选和脚本排序：

```js
export const category = "科技";
export const platform = { name: "来源名称", icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" data-n="source-platform-icon">...</svg>' };
export const order = 10;
// fetch(ctx) 内返回快照：
return Result.Ok({ title: "示例榜单", link: "https://example.com/", category, entries });
```

快照的可选 `category` 是去除首尾空格后最多 32 字符、不能含控制字符的字符串；省略、`null` 或空字符串不输出。页面优先使用快照分类，缺失时使用模块导出的 `category`，再回退到「其他」；导出的分类也用于加载失败的卡片。来源使用 `platform.name`。

84 个脚本均通过 `platform = { name, icon }` 内嵌来源图标：保留已有品牌 SVG，缺失图标从来源网站 favicon 获取，转为最多 32×32 的 PNG 并嵌入 SVG，不依赖外部图片请求。同一来源的脚本共用相同图标；新增图标旁的 `Favicon` 注释记录下载地址。参考消息、远景论坛、靠谱新闻使用上游 NewsNow 仓库备份，七猫使用网站 favicon 缓存；更新图标时可优先重新获取官方版本。

模块导出的 `order` 必须是安全整数，数值越小，榜单卡片越靠前；可以使用负数，省略按 `0`，同值保持脚本清单原顺序。它只影响 `/rank/` 的榜单卡片顺序，不改变条目 `rank`。示例已按当前顺序设置间隔为 10 的数值，调整对应脚本并重新构建即可生效。

小说榜单：[起点](qidian.js)（明确导出移动端男频 9 条、女频 8 条固定路由）、[七猫](qimao.js)（男女频 5 类榜单及可用日/月周期，共 16 个入口）、[番茄](fanqienovel.js)（巅峰榜及 74 个分类阅读/新书榜）。均支持封面；完整入口、分类代码及验证限制见[小说排行榜说明](../docs/usage.md#小说排行榜)。

英语/日语平台新增：

| 平台 | 内容 | 默认路由 |
| --- | --- | --- |
| [Google News](google_news.js) | 美国/英国英语、日本日语头条，9 个新闻主题 | `/google-news/us/top` |
| [Techmeme](techmeme.js) | 英语科技头条 | `/techmeme/hot` |
| [Lobsters](lobsters.js) | 英语技术社区热门讨论 | `/lobsters/hot` |
| [DEV Community](devto.js) | 英语开发者社区热门文章，日/周/月/年 | `/devto/top/week` |
| [Hatena](hatena.js) | 日语热门书签，综合及分类 | `/hatena/hot/all` |
| [Mastodon](mastodon.js) | mastodon.social 热门链接、话题、动态 | `/mastodon/trending/links` |
| [Project Gutenberg](gutenberg.js) | 英语经典小说等公版图书下载 Top 100 | `/gutenberg/top/day` |
| [カクヨム](kakuyomu.js) | 日语小说分类榜，日/周/月/年/总榜 | `/kakuyomu/rank/daily/all` |
| [小説家になろう](narou.js) | 日语小说日/周/月/季/年/总积分前 30 | `/narou/top/daily` |
| [YouTube](youtube_hot.js) | 官方热门视频，支持地区/分类，需 API Key | `/youtube/hot/US/0` |
| [TikTok](tiktok.js) | 官方 Discovery 热门话题，需广告账户及令牌 | `/tiktok/hot/US/7` |
| [Dailymotion](dailymotion.js) | 分地区热门视频 | `/dailymotion/hot/us` |
| [Niconico](niconico.js) | 日语综合视频榜 | `/niconico/rank` |
| [Vimeo](vimeo.js) | Staff Picks 精选视频 | `/vimeo/staff-picks` |
| [Reddit](reddit.js) | 社区 hot/top/rising，受服务端 IP 限制 | `/reddit/popular/hot` |
| [Bluesky](bluesky.js) | 官方趋势话题 | `/bluesky/trending` |
| [Zenn](zenn.js) | 日语开发者趋势文章 | `/zenn/trending` |
| [Qiita](qiita.js) | 日语技术热门文章 | `/qiita/hot` |
| [Slashdot](slashdot.js) | 英语科技社区资讯 | `/slashdot/headlines` |
| [Ars Technica](arstechnica.js) | 英语最新科技资讯 | `/arstechnica/headlines` |
| [The Verge](theverge.js) | 英语最新科技资讯 | `/theverge/headlines` |
| [NPR](npr.js) | 英语 Top Stories | `/npr/headlines` |
| [NHK](nhk.js) | 日语主要新闻 | `/nhk/headlines` |
| [Yahoo! JAPAN](yahoo_japan.js) | 日语主要新闻话题 | `/yahoo-japan/headlines` |
| [ITmedia](itmedia.js) | 日语最新科技资讯 | `/itmedia/headlines` |
| [Apple Charts](apple_charts.js) | 地区播客、歌曲、专辑榜 | `/apple-charts/us/podcasts` |
| [Deezer](deezer.js) | 歌曲榜，保留名次和流行度评分 | `/deezer/chart` |
| [AniList](anilist.js) | 动画/漫画趋势榜 | `/anilist/trending/anime` |
| [MyAnimeList](myanimelist.js) | 动画/漫画/轻小说评分榜 | `/myanimelist/top/anime` |

YouTube 需在脚本配置中填写 `api_key`；TikTok 需填写 `advertiser_id` 和获批 Discovery API 的 `access_token`。这些配置通过凭据请求头发送，跨站重定向时移除，调试日志不记录值；`writeOnly` 仅遮挡输入，配置仍按脚本元数据保存。其余国际平台脚本使用公开接口或官方内容源，网站可能限制服务端访问。

保留原文标题；没有数字排名字段时 `rank` 为 `null`，保留上游顺序。新闻和精选列表按实际用途命名，不把最新文章伪装为热度排行。完整参数、来源和访问验证范围见[英语与日语平台说明](../docs/usage.md#英语与日语平台)。

依赖登录的脚本在 `permissions.cookies` 中列出来源、Cookie 名称和用途，再显式调用 `ctx.cookies.get`，由管理员确认后才能使用；脚本拿不到 Cookie 明文。签名算法等平台逻辑留在类中，通用解析、URL、时间和 Result 集合处理复用内置工具。

示例不会自动导入后台。Worker 的 `test/script_examples_migration.test.js` 用生产 QuickJS 校验全部脚本及原路由，模拟上游数据验证列表、稳定 ID 和签名。未验证所有站点当前在线接口及实际登录态；网站变化后需要调整对应脚本。SDK 仅适用于 Worker QuickJS，Go/goja 暂不支持。

发布或批量同步脚本后，需要重新生成排行榜快照：管理员调用 `POST /admin/api/hot/snapshot`，等待返回的任务 ID 在 `/admin/api/background-tasks` 中结束，再回读 `/rank/` 检查各榜单的内容与错误。发布脚本或构建前端不会自动重新采集排行榜；HTML 和各脚本 JSON 在刷新任务中一同生成。新版 SDK 的 `ctx.fetchText` 返回 `Result`，旧脚本若直接把返回值传入 `JSON.parse` 或 HTML 解析器，需要迁移为示例中的 `utils.request_json` / `utils.request_text` 并读取 `data`。
