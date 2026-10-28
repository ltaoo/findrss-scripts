# 脚本路由巡检：52/169 通过

巡检时间：2026-10-28T22:44:29.926Z

点击脚本文件名打开 master 分支的 Raw 源码，复制内容即可复用。结果为本轮巡检快照；同一脚本的不同路由分别列出，失败项优先显示，后续未执行的阶段标为「未检查」。

## RSS（1/30 通过）

| 结果 | 脚本（Raw） | 路由 | 请求 | 响应 | 格式 | 输出 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ❌ 失败 | [rss/69shuba.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/69shuba.js) | /rss/69shuba/book/:book\_id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/apple.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/apple.js) | /rss/apple/apps/update/:country/:id/:platform? | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_RATE\_LIMITED: HTTP 503: UPSTREAM\_RATE\_LIMITED: 上游请求过于频繁，请降低频率后重试 |
| ❌ 失败 | [rss/avmoo.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/avmoo.js) | /rss/avmoo/star/:id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | NOT\_FOUND: HTTP 404: NOT\_FOUND: 请求的脚本路由不存在 |
| ❌ 失败 | [rss/bilibili.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/bilibili.js) | /rss/bilibili/:userid/upload/video | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_INVALID\_RESPONSE: HTTP 502: UPSTREAM\_INVALID\_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |
| ❌ 失败 | [rss/douyin.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/douyin.js) | /rss/douyin/user/:sec\_uid | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_INVALID\_RESPONSE: HTTP 502: UPSTREAM\_INVALID\_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |
| ❌ 失败 | [rss/fanqienovel.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/fanqienovel.js) | /rss/fanqienovel/book/:book\_id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/github.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/github.js) | /rss/github/:org/:pro/release | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/instagram.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/instagram.js) | /rss/instagram/:username | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/javbus.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/javbus.js) | /rss/javbus/star/:id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | NOT\_FOUND: HTTP 404: NOT\_FOUND: 请求的脚本路由不存在 |
| ❌ 失败 | [rss/javlibrary.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/javlibrary.js) | /rss/javlibrary/star/:id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | NOT\_FOUND: HTTP 404: NOT\_FOUND: 请求的脚本路由不存在 |
| ❌ 失败 | [rss/kuaishou.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/kuaishou.js) | /rss/kuaishou/profile/:user\_id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_INVALID\_RESPONSE: HTTP 502: UPSTREAM\_INVALID\_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |
| ❌ 失败 | [rss/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/qidian.js) | /rss/qidian/book/:book\_id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/telegram.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/telegram.js) | /rss/telegram/channel/:username | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/ttk.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/ttk.js) | /rss/ttk/book/:book\_id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/weibo.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/weibo.js) | /rss/weibo/u/:uid | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/wxchannels.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/wxchannels.js) | /rss/wxchannels/:account | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/wxmp.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/wxmp.js) | /rss/wxmp/:account? | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/x.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/x.js) | /rss/x/:username | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/xiaohongshu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/xiaohongshu.js) | /rss/xiaohongshu/user/profile/:uid | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/youtube.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/youtube.js) | /rss/youtube/:handle | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/youtube.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/youtube.js) | /rss/youtube/:handle/shorts | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | /rss/zhihu/collection/:collection\_id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | The operation was aborted due to timeout |
| ❌ 失败 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | /rss/zhihu/column/:column\_id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | /rss/zhihu/people/:user | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | /rss/zhihu/people/:user/answers | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | /rss/zhihu/people/:user/asks | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | /rss/zhihu/people/:user/pins | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | /rss/zhihu/people/:user/posts | ✅ 通过 | ✅ 通过 | ✅ 通过 | ❌ 失败 | 条目数须 &gt;= 1 |
| ❌ 失败 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | /rss/zhihu/people/:user/zvideos | ✅ 通过 | ✅ 通过 | ✅ 通过 | ❌ 失败 | 条目数须 &gt;= 1 |
| ✅ 通过 | [rss/bilibili.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/bilibili.js) | /rss/bilibili/:userid/dynamic | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |

## Atom（2/30 通过）

| 结果 | 脚本（Raw） | 路由 | 请求 | 响应 | 格式 | 输出 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ❌ 失败 | [rss/69shuba.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/69shuba.js) | /atom/69shuba/book/:book\_id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | The operation was aborted due to timeout |
| ❌ 失败 | [rss/apple.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/apple.js) | /atom/apple/apps/update/:country/:id/:platform? | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_RATE\_LIMITED: HTTP 503: UPSTREAM\_RATE\_LIMITED: 上游请求过于频繁，请降低频率后重试 |
| ❌ 失败 | [rss/avmoo.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/avmoo.js) | /atom/avmoo/star/:id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | NOT\_FOUND: HTTP 404: NOT\_FOUND: 请求的脚本路由不存在 |
| ❌ 失败 | [rss/bilibili.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/bilibili.js) | /atom/bilibili/:userid/dynamic | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | The operation was aborted due to timeout |
| ❌ 失败 | [rss/bilibili.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/bilibili.js) | /atom/bilibili/:userid/upload/video | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_INVALID\_RESPONSE: HTTP 502: UPSTREAM\_INVALID\_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |
| ❌ 失败 | [rss/douyin.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/douyin.js) | /atom/douyin/user/:sec\_uid | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_INVALID\_RESPONSE: HTTP 502: UPSTREAM\_INVALID\_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |
| ❌ 失败 | [rss/fanqienovel.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/fanqienovel.js) | /atom/fanqienovel/book/:book\_id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/instagram.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/instagram.js) | /atom/instagram/:username | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/javbus.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/javbus.js) | /atom/javbus/star/:id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | NOT\_FOUND: HTTP 404: NOT\_FOUND: 请求的脚本路由不存在 |
| ❌ 失败 | [rss/javlibrary.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/javlibrary.js) | /atom/javlibrary/star/:id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | NOT\_FOUND: HTTP 404: NOT\_FOUND: 请求的脚本路由不存在 |
| ❌ 失败 | [rss/kuaishou.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/kuaishou.js) | /atom/kuaishou/profile/:user\_id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/qidian.js) | /atom/qidian/book/:book\_id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/telegram.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/telegram.js) | /atom/telegram/channel/:username | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/ttk.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/ttk.js) | /atom/ttk/book/:book\_id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/weibo.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/weibo.js) | /atom/weibo/u/:uid | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/wxchannels.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/wxchannels.js) | /atom/wxchannels/:account | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/wxmp.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/wxmp.js) | /atom/wxmp/:account? | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/x.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/x.js) | /atom/x/:username | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/youtube.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/youtube.js) | /atom/youtube/:handle | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/youtube.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/youtube.js) | /atom/youtube/:handle/shorts | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | /atom/zhihu/collection/:collection\_id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | /atom/zhihu/column/:column\_id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | /atom/zhihu/people/:user | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | /atom/zhihu/people/:user/answers | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | /atom/zhihu/people/:user/asks | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | /atom/zhihu/people/:user/pins | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | /atom/zhihu/people/:user/posts | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) | /atom/zhihu/people/:user/zvideos | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ✅ 通过 | [rss/github.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/github.js) | /atom/github/:org/:pro/release | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [rss/xiaohongshu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/xiaohongshu.js) | /atom/xiaohongshu/user/profile/:uid | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |

## Hot（48/100 通过）

| 结果 | 脚本（Raw） | 路由 | 请求 | 响应 | 格式 | 输出 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ❌ 失败 | [hot/36kr\_quick.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/36kr_quick.js) | /api/hot/36kr/quick | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_INVALID\_RESPONSE: HTTP 502: UPSTREAM\_INVALID\_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |
| ❌ 失败 | [hot/36kr\_renqi.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/36kr_renqi.js) | /api/hot/36kr/renqi | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_ACCESS\_DENIED: HTTP 502: UPSTREAM\_ACCESS\_DENIED: 上游拒绝访问，可能需要额外权限或完成站点验证 |
| ❌ 失败 | [hot/anilist.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/anilist.js) | /api/hot/anilist/trending/:type? | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_ACCESS\_DENIED: HTTP 502: UPSTREAM\_ACCESS\_DENIED: 上游拒绝访问，可能需要额外权限或完成站点验证 |
| ❌ 失败 | [hot/apple\_charts.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/apple_charts.js) | /api/hot/apple-charts/:country?/:type? | ✅ 通过 | ✅ 通过 | ✅ 通过 | ❌ 失败 | 来源应为 rss.marketingtools.apple.com，实际为 podcasts.apple.com |
| ❌ 失败 | [hot/bilibili\_hot\_search.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/bilibili_hot_search.js) | /api/hot/bilibili/hot/search | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |
| ❌ 失败 | [hot/bilibili\_hot\_video.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/bilibili_hot_video.js) | /api/hot/bilibili/hot/video | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |
| ❌ 失败 | [hot/bilibili\_ranking.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/bilibili_ranking.js) | /api/hot/bilibili/ranking | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |
| ❌ 失败 | [hot/bluesky.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/bluesky.js) | /api/hot/bluesky/trending | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_INVALID\_RESPONSE: HTTP 502: UPSTREAM\_INVALID\_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |
| ❌ 失败 | [hot/fastbull\_express.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/fastbull_express.js) | /api/hot/fastbull/express | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/freebuf.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/freebuf.js) | /api/hot/freebuf | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |
| ❌ 失败 | [hot/google\_news.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/google_news.js) | /api/hot/google-news/:edition?/:topic? | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |
| ❌ 失败 | [hot/hupu\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/hupu_hot.js) | /api/hot/hupu/hot | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |
| ❌ 失败 | [hot/kakuyomu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/kakuyomu.js) | /api/hot/kakuyomu/rank/:period?/:genre? | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_ACCESS\_DENIED: HTTP 502: UPSTREAM\_ACCESS\_DENIED: 上游拒绝访问，可能需要额外权限或完成站点验证 |
| ❌ 失败 | [hot/kaopu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/kaopu.js) | /api/hot/kaopu | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_INVALID\_RESPONSE: HTTP 502: UPSTREAM\_INVALID\_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |
| ❌ 失败 | [hot/kuaishou\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/kuaishou_hot.js) | /api/hot/kuaishou/hot | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_TIMEOUT: HTTP 504: UPSTREAM\_TIMEOUT: 上游请求或采集任务超时，请稍后重试 |
| ❌ 失败 | [hot/mastodon.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/mastodon.js) | /api/hot/mastodon/trending/:type? | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/myanimelist.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/myanimelist.js) | /api/hot/myanimelist/top/:type? | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/nowcoder\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/nowcoder_hot.js) | /api/hot/nowcoder/hot | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/npr.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/npr.js) | /api/hot/npr/headlines | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/pcbeta\_windows11.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/pcbeta_windows11.js) | /api/hot/pcbeta/windows11 | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/producthunt.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/producthunt.js) | /api/hot/producthunt | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/collect/female | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/free/female | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/hotsales | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/hotsales/female | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/newauthor | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/newfans | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/newfans/female | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_INVALID\_RESPONSE: HTTP 502: UPSTREAM\_INVALID\_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |
| ❌ 失败 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/readindex | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/readindex/female | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_INVALID\_RESPONSE: HTTP 502: UPSTREAM\_INVALID\_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |
| ❌ 失败 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/rec | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/rec/female | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/sign | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/update | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/update/female | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/yuepiao/female | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/qiita.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qiita.js) | /api/hot/qiita/hot | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/qimao.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qimao.js) | /api/hot/qimao/rank/:gender?/:type?/:period? | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/qqvideo\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qqvideo_hot.js) | /api/hot/qqvideo/hot | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/reddit.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/reddit.js) | /api/hot/reddit/:subreddit?/:sort? | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/slashdot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/slashdot.js) | /api/hot/slashdot/headlines | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/solidot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/solidot.js) | /api/hot/solidot | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/sspai\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/sspai_hot.js) | /api/hot/sspai/hot | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/techmeme.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/techmeme.js) | /api/hot/techmeme/hot | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | The operation was aborted due to timeout |
| ❌ 失败 | [hot/theverge.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/theverge.js) | /api/hot/theverge/headlines | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/tiktok.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/tiktok.js) | /api/hot/tiktok/hot/:country?/:days? | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | INVALID\_PARAMETER: HTTP 400: INVALID\_PARAMETER: 请求参数无效，请检查路径参数和查询参数 |
| ❌ 失败 | [hot/v2ex\_share.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/v2ex_share.js) | /api/hot/v2ex/share | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_TIMEOUT: HTTP 504: UPSTREAM\_TIMEOUT: 上游请求或采集任务超时，请稍后重试 |
| ❌ 失败 | [hot/wallstreetcn\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/wallstreetcn_hot.js) | /api/hot/wallstreetcn/hot | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | The operation was aborted due to timeout |
| ❌ 失败 | [hot/weibo\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/weibo_hot.js) | /api/hot/weibo/hot | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/xueqiu\_hotstock.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/xueqiu_hotstock.js) | /api/hot/xueqiu/hotstock | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | COOKIE\_REQUIRED: HTTP 503: COOKIE\_REQUIRED: 缺少可用于当前请求的 Cookie，请配置该站点的有效登录 Cookie，并检查域名、路径和过期时间 |
| ❌ 失败 | [hot/youtube\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/youtube_hot.js) | /api/hot/youtube/hot/:region?/:category? | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [hot/zhihu\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/zhihu_hot.js) | /api/hot/zhihu/hot | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ✅ 通过 | [hot/aihot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/aihot.js) | /api/hot/aihot | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/arstechnica.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/arstechnica.js) | /api/hot/arstechnica/headlines | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/baidu\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/baidu_hot.js) | /api/hot/baidu/hot | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/cankaoxiaoxi.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/cankaoxiaoxi.js) | /api/hot/cankaoxiaoxi | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/chongbuluo\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/chongbuluo_hot.js) | /api/hot/chongbuluo/hot | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/chongbuluo\_latest.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/chongbuluo_latest.js) | /api/hot/chongbuluo/latest | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/cls\_depth.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/cls_depth.js) | /api/hot/cls/depth | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/cls\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/cls_hot.js) | /api/hot/cls/hot | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/cls\_telegraph.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/cls_telegraph.js) | /api/hot/cls/telegraph | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/dailymotion.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/dailymotion.js) | /api/hot/dailymotion/hot/:country? | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/deezer.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/deezer.js) | /api/hot/deezer/chart | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/devto.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/devto.js) | /api/hot/devto/top/:period? | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/dongqiudi.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/dongqiudi.js) | /api/hot/dongqiudi | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/douban\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/douban_hot.js) | /api/hot/douban/hot | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/douyin\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/douyin_hot.js) | /api/hot/douyin/hot | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/fanqienovel.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/fanqienovel.js) | /api/hot/fanqienovel/rank/:rank\_id? | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/fastbull\_news.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/fastbull_news.js) | /api/hot/fastbull/news | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/gelonghui.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/gelonghui.js) | /api/hot/gelonghui | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/github\_trending.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/github_trending.js) | /api/hot/github/trending | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/gutenberg.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/gutenberg.js) | /api/hot/gutenberg/top/:period? | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/hackernews.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/hackernews.js) | /api/hot/hackernews | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/hatena.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/hatena.js) | /api/hot/hatena/hot/:topic? | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/ifeng\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/ifeng_hot.js) | /api/hot/ifeng/hot | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/iqiyi\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/iqiyi_hot.js) | /api/hot/iqiyi/hot | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/ithome.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/ithome.js) | /api/hot/ithome | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/itmedia.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/itmedia.js) | /api/hot/itmedia/headlines | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/jin10.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/jin10.js) | /api/hot/jin10 | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/juejin\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/juejin_hot.js) | /api/hot/juejin/hot | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/kuan.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/kuan.js) | /api/hot/kuan | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/lobsters.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/lobsters.js) | /api/hot/lobsters/hot | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/mktnews\_flash.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/mktnews_flash.js) | /api/hot/mktnews/flash | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/narou.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/narou.js) | /api/hot/narou/top/:period? | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/nhk.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/nhk.js) | /api/hot/nhk/headlines | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/niconico.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/niconico.js) | /api/hot/niconico/rank | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/newbook | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) | /api/hot/qidian/rank/yuepiao | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/sputniknewscn.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/sputniknewscn.js) | /api/hot/sputniknewscn | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/steam.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/steam.js) | /api/hot/steam | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/tencent\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/tencent_hot.js) | /api/hot/tencent/hot | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/thepaper\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/thepaper_hot.js) | /api/hot/thepaper/hot | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/tieba\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/tieba_hot.js) | /api/hot/tieba/hot | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/toutiao\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/toutiao_hot.js) | /api/hot/toutiao/hot | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/vimeo.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/vimeo.js) | /api/hot/vimeo/staff-picks | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/wallstreetcn\_news.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/wallstreetcn_news.js) | /api/hot/wallstreetcn/news | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/wallstreetcn\_quick.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/wallstreetcn_quick.js) | /api/hot/wallstreetcn/quick | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/yahoo\_japan.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/yahoo_japan.js) | /api/hot/yahoo-japan/headlines | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/zaobao.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/zaobao.js) | /api/hot/zaobao | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |
| ✅ 通过 | [hot/zenn.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/zenn.js) | /api/hot/zenn/trending | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |

## Clip（0/2 通过）

| 结果 | 脚本（Raw） | 路由 | 请求 | 响应 | 格式 | 输出 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ❌ 失败 | [clip/github.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/clip/github.js) | /api/clip/github/:owner/:repo/readme | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [clip/website.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/clip/website.js) | /api/clip/web/region | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |

## Detect（0/2 通过）

| 结果 | 脚本（Raw） | 路由 | 请求 | 响应 | 格式 | 输出 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ❌ 失败 | [detect/github\_releases.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/detect/github_releases.js) | /api/detect/github/:owner/:repo/releases/detect | ✅ 通过 | ✅ 通过 | ✅ 通过 | ❌ 失败 | 检测列表为空 |
| ❌ 失败 | [detect/website\_text.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/detect/website_text.js) | /api/detect/web/text/detect | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |

## 正文（1/2 通过）

| 结果 | 脚本（Raw） | 路由 | 请求 | 响应 | 格式 | 输出 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ❌ 失败 | [rss/fanqienovel.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/fanqienovel.js) | /fanqienovel/chapter/:chapter\_id | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |
| ✅ 通过 | [rss/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/qidian.js) | /qidian/chapter/:book\_id/:chapter\_id | ✅ 通过 | ✅ 通过 | ✅ 通过 | ✅ 通过 |  |

## 图片（0/3 通过）

| 结果 | 脚本（Raw） | 路由 | 请求 | 响应 | 格式 | 输出 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ❌ 失败 | [rss/apple.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/apple.js) | /img/apple | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | INTERNAL\_ERROR: HTTP 500: INTERNAL\_ERROR: 服务内部错误，请结合 Worker 日志排查 |
| ❌ 失败 | [rss/weibo.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/weibo.js) | /img/weibo | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
| ❌ 失败 | [rss/wxmp.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/wxmp.js) | /img/wxmp | ❌ 失败 | — 未检查 | — 未检查 | — 未检查 | HTTP 503 |
