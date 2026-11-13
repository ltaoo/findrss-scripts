# 脚本路由巡检：99/142 通过

<img data-n="project-logo" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/assets/brand/logo.svg" alt="FindRSS" width="64" height="64">

巡检时间：2026-11-13T16:37:59.051Z

点击脚本路径打开 master 分支的 Raw 源码。结果按脚本聚合，每条路由显示成功或失败及失败原因，失败项优先显示。

## clip/baidu\_weather.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-0.svg" alt="" width="24" height="24"> [clip/baidu\_weather.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/clip/baidu_weather.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/clip/baidu/s/weather/:city? | ❌ 失败 | UPSTREAM\_ACCESS\_DENIED: HTTP 502: UPSTREAM\_ACCESS\_DENIED: 上游拒绝访问，可能需要额外权限或完成站点验证 |

## detect/github\_releases.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-3.svg" alt="" width="24" height="24"> [detect/github\_releases.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/detect/github_releases.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/detect/github/:owner/:repo/releases.atom | ❌ 失败 | 检测列表为空 |

## hot/36kr.js（1/2 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-5.svg" alt="" width="24" height="24"> [hot/36kr.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/36kr.js) · 版本：1.0.3

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/36kr/hot-list/renqi | ❌ 失败 | COOKIE\_REQUIRED: HTTP 503: COOKIE\_REQUIRED: 站点 https://36kr.com 的 Cookie 同步数据中没有权限 kr36 允许的名称（\_waf\_verification\_proof、\_wafchallengeid），请求 https://36kr.com/hot-list/renqi/2026-11-14/1 无法携带 Cookie。请在 Cookie 同步中勾选该站点后重新上传 |
| /api/hot/36kr/newsflashes | ✅ 成功 |  |

## hot/apple\_charts.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-8.svg" alt="" width="24" height="24"> [hot/apple\_charts.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/apple_charts.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/apple-charts/api/v2/:country?/:type? | ❌ 失败 | 来源应为 rss.marketingtools.apple.com，实际为 podcasts.apple.com |

## hot/bluesky.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-12.svg" alt="" width="24" height="24"> [hot/bluesky.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/bluesky.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/bluesky/xrpc/app.bsky.unspecced.getTrendingTopics | ❌ 失败 | UPSTREAM\_INVALID\_RESPONSE: HTTP 502: UPSTREAM\_INVALID\_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |

## hot/cls.js（2/3 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-15.svg" alt="" width="24" height="24"> [hot/cls.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/cls.js) · 版本：1.0.2

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/cls/v3/depth/home/assembled/1000 | ❌ 失败 | SCRIPT\_FAILED: HTTP 502: SCRIPT\_FAILED: 脚本执行失败，请结合 Worker 日志排查 |
| /api/hot/cls/v1/roll/get\_roll\_list | ✅ 成功 |  |
| /api/hot/cls/v2/article/hot/list | ✅ 成功 |  |

## hot/freebuf.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-24.svg" alt="" width="24" height="24"> [hot/freebuf.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/freebuf.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/freebuf/feed | ❌ 失败 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |

## hot/hupu\_hot.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-31.svg" alt="" width="24" height="24"> [hot/hupu\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/hupu_hot.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/hupu/topic-daily-hot | ❌ 失败 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |

## hot/kaopu.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-39.svg" alt="" width="24" height="24"> [hot/kaopu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/kaopu.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/kaopu | ❌ 失败 | UPSTREAM\_ACCESS\_DENIED: HTTP 502: UPSTREAM\_ACCESS\_DENIED: 上游拒绝访问，可能需要额外权限或完成站点验证 |

## hot/pcbeta\_windows11.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-53.svg" alt="" width="24" height="24"> [hot/pcbeta\_windows11.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/pcbeta_windows11.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/pcbeta/forum.php | ❌ 失败 | UPSTREAM\_INVALID\_RESPONSE: HTTP 502: UPSTREAM\_INVALID\_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |

## hot/qdmm.js（0/8 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-55.svg" alt="" width="24" height="24"> [hot/qdmm.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qdmm.js) · 版本：1.2.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/qdmm/collect | ❌ 失败 | COOKIE\_REQUIRED: HTTP 503: COOKIE\_REQUIRED: 站点 https://www.qdmm.com 的 Cookie 同步数据中没有权限 qdmm 允许的名称（w\_tsfp），请求 https://www.qdmm.com/rank/collect/ 无法携带 Cookie。请在 Cookie 同步中勾选该站点后重新上传 |
| /api/hot/qdmm/free | ❌ 失败 | COOKIE\_REQUIRED: HTTP 503: COOKIE\_REQUIRED: 站点 https://www.qdmm.com 的 Cookie 同步数据中没有权限 qdmm 允许的名称（w\_tsfp），请求 https://www.qdmm.com/free/ 无法携带 Cookie。请在 Cookie 同步中勾选该站点后重新上传 |
| /api/hot/qdmm/hotsales | ❌ 失败 | COOKIE\_REQUIRED: HTTP 503: COOKIE\_REQUIRED: 站点 https://www.qdmm.com 的 Cookie 同步数据中没有权限 qdmm 允许的名称（w\_tsfp），请求 https://www.qdmm.com/rank/hotsales/ 无法携带 Cookie。请在 Cookie 同步中勾选该站点后重新上传 |
| /api/hot/qdmm/newfans | ❌ 失败 | COOKIE\_REQUIRED: HTTP 503: COOKIE\_REQUIRED: 站点 https://www.qdmm.com 的 Cookie 同步数据中没有权限 qdmm 允许的名称（w\_tsfp），请求 https://www.qdmm.com/rank/newfans/ 无法携带 Cookie。请在 Cookie 同步中勾选该站点后重新上传 |
| /api/hot/qdmm/readindex | ❌ 失败 | COOKIE\_REQUIRED: HTTP 503: COOKIE\_REQUIRED: 站点 https://www.qdmm.com 的 Cookie 同步数据中没有权限 qdmm 允许的名称（w\_tsfp），请求 https://www.qdmm.com/rank/readindex/ 无法携带 Cookie。请在 Cookie 同步中勾选该站点后重新上传 |
| /api/hot/qdmm/rec | ❌ 失败 | COOKIE\_REQUIRED: HTTP 503: COOKIE\_REQUIRED: 站点 https://www.qdmm.com 的 Cookie 同步数据中没有权限 qdmm 允许的名称（w\_tsfp），请求 https://www.qdmm.com/rank/recom/ 无法携带 Cookie。请在 Cookie 同步中勾选该站点后重新上传 |
| /api/hot/qdmm/update | ❌ 失败 | COOKIE\_REQUIRED: HTTP 503: COOKIE\_REQUIRED: 站点 https://www.qdmm.com 的 Cookie 同步数据中没有权限 qdmm 允许的名称（w\_tsfp），请求 https://www.qdmm.com/rank/vipup/ 无法携带 Cookie。请在 Cookie 同步中勾选该站点后重新上传 |
| /api/hot/qdmm/yuepiao | ❌ 失败 | COOKIE\_REQUIRED: HTTP 503: COOKIE\_REQUIRED: 站点 https://www.qdmm.com 的 Cookie 同步数据中没有权限 qdmm 允许的名称（w\_tsfp），请求 https://www.qdmm.com/rank/yuepiao/ 无法携带 Cookie。请在 Cookie 同步中勾选该站点后重新上传 |

## hot/qidian.js（0/9 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-56.svg" alt="" width="24" height="24"> [hot/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qidian.js) · 版本：1.3.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/qidian/hotsales | ❌ 失败 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |
| /api/hot/qidian/newauthor | ❌ 失败 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |
| /api/hot/qidian/newbook | ❌ 失败 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |
| /api/hot/qidian/newfans | ❌ 失败 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |
| /api/hot/qidian/readindex | ❌ 失败 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |
| /api/hot/qidian/rec | ❌ 失败 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |
| /api/hot/qidian/sign | ❌ 失败 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |
| /api/hot/qidian/update | ❌ 失败 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |
| /api/hot/qidian/yuepiao | ❌ 失败 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |

## hot/reddit.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-60.svg" alt="" width="24" height="24"> [hot/reddit.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/reddit.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/reddit/r/:subreddit?/:sort? | ❌ 失败 | UPSTREAM\_ACCESS\_DENIED: HTTP 502: UPSTREAM\_ACCESS\_DENIED: 上游拒绝访问，可能需要额外权限或完成站点验证 |

## hot/thepaper\_hot.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-68.svg" alt="" width="24" height="24"> [hot/thepaper\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/thepaper_hot.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/thepaper/contentapi/wwwIndex/rightSidebar | ❌ 失败 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |

## hot/tiktok.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-71.svg" alt="" width="24" height="24"> [hot/tiktok.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/tiktok.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/tiktok/open\_api/v1.3/discovery/trending\_list/:country?/:days? | ❌ 失败 | INVALID\_PARAMETER: HTTP 400: INVALID\_PARAMETER: 请求参数无效，请检查路径参数和查询参数 |

## hot/v2ex\_share.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-73.svg" alt="" width="24" height="24"> [hot/v2ex\_share.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/v2ex_share.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/v2ex/feed | ❌ 失败 | UPSTREAM\_TIMEOUT: HTTP 504: UPSTREAM\_TIMEOUT: 上游请求或采集任务超时，请稍后重试 |

## hot/xueqiu\_hotstock.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-77.svg" alt="" width="24" height="24"> [hot/xueqiu\_hotstock.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/xueqiu_hotstock.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/xueqiu/v5/stock/hot\_stock/list.json | ❌ 失败 | COOKIE\_REQUIRED: HTTP 503: COOKIE\_REQUIRED: 站点 https://stock.xueqiu.com 的 Cookie 同步数据中没有权限 xueqiu 允许的名称（u、xq\_a\_token、xq\_r\_token），请求 https://stock.xueqiu.com/v5/stock/hot\_stock/list.json 无法携带 Cookie。请在 Cookie 同步中勾选该站点后重新上传 |

## hot/youtube\_hot.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-79.svg" alt="" width="24" height="24"> [hot/youtube\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/youtube_hot.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/youtube/hot/:region?/:category? | ❌ 失败 | CONFIG\_INVALID: HTTP 503: CONFIG\_INVALID: 服务端脚本配置无效或缺少必填项，请检查 SCRIPT\_CONFIG 和 SCRIPT\_COOKIES |

## rss/69shuba.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-83.svg" alt="" width="24" height="24"> [rss/69shuba.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/69shuba.js) · 版本：1.2.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/69shuba/book/:book\_id | ❌ 失败 | SCRIPT\_FAILED: HTTP 502: SCRIPT\_FAILED: 脚本执行失败，请结合 Worker 日志排查 |

## rss/avmoo.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-85.svg" alt="" width="24" height="24"> [rss/avmoo.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/avmoo.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/avmoo/star/:id | ❌ 失败 | UPSTREAM\_ACCESS\_DENIED: HTTP 502: UPSTREAM\_ACCESS\_DENIED: 上游拒绝访问，可能需要额外权限或完成站点验证 |

## rss/douyin.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-87.svg" alt="" width="24" height="24"> [rss/douyin.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/douyin.js) · 版本：1.1.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/douyin/user/:sec\_uid | ❌ 失败 | UPSTREAM\_INVALID\_RESPONSE: HTTP 502: UPSTREAM\_INVALID\_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |

## rss/instagram.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-91.svg" alt="" width="24" height="24"> [rss/instagram.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/instagram.js) · 版本：1.1.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/instagram/:username | ❌ 失败 | UPSTREAM\_AUTH\_REQUIRED: HTTP 502: UPSTREAM\_AUTH\_REQUIRED: 上游要求登录，Cookie 可能已失效或不完整，请更新登录凭据 |

## rss/javlibrary.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-93.svg" alt="" width="24" height="24"> [rss/javlibrary.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/javlibrary.js) · 版本：1.1.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/javlibrary/star/:id | ❌ 失败 | SCRIPT\_FAILED: HTTP 502: SCRIPT\_FAILED: 脚本执行失败，请结合 Worker 日志排查 |

## rss/kuaishou.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-94.svg" alt="" width="24" height="24"> [rss/kuaishou.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/kuaishou.js) · 版本：1.1.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/kuaishou/profile/:user\_id | ❌ 失败 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |

## rss/qidian.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-95.svg" alt="" width="24" height="24"> [rss/qidian.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/qidian.js) · 版本：1.1.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/qidian/book/:book\_id | ❌ 失败 | UPSTREAM\_FETCH\_FAILED: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |

## rss/ttk.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-98.svg" alt="" width="24" height="24"> [rss/ttk.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/ttk.js) · 版本：1.1.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/ttk/book/:book\_id | ❌ 失败 | UPSTREAM\_ACCESS\_DENIED: HTTP 502: UPSTREAM\_ACCESS\_DENIED: 上游拒绝访问，可能需要额外权限或完成站点验证 |

## rss/wxchannels.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-100.svg" alt="" width="24" height="24"> [rss/wxchannels.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/wxchannels.js) · 版本：1.2.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/wxchannels/:account | ❌ 失败 | /api/rss/wxchannels/v2\_060000231003b20faec8c5e08f1dc1d2cf05ea31b07722e73306573f943932c0da84674c5483@finder: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试；/api/rss/wxchannels/v2\_060000231003b20faec8cae78a11cad6c60de534b077b38fc3c765c3562a72901dd04b8a97b6@finder: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |

## rss/wxmp.js（0/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-101.svg" alt="" width="24" height="24"> [rss/wxmp.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/wxmp.js) · 版本：1.2.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/wxmp/:account? | ❌ 失败 | /api/rss/wxmp/wow36kr: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试；/api/rss/wxmp/zhihuribao: HTTP 502: UPSTREAM\_FETCH\_FAILED: 访问上游网页或接口失败，请稍后重试 |

## clip/github.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-1.svg" alt="" width="24" height="24"> [clip/github.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/clip/github.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/clip/github/:owner/:repo | ✅ 成功 |  |

## clip/website.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-2.svg" alt="" width="24" height="24"> [clip/website.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/clip/website.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/clip/web/region | ✅ 成功 |  |

## detect/website\_text.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-4.svg" alt="" width="24" height="24"> [detect/website\_text.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/detect/website_text.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/detect/web/text/detect | ✅ 成功 |  |

## hot/aihot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-6.svg" alt="" width="24" height="24"> [hot/aihot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/aihot.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/aihot/feed/all.xml | ✅ 成功 |  |

## hot/anilist.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-7.svg" alt="" width="24" height="24"> [hot/anilist.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/anilist.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/anilist/trending/:type? | ✅ 成功 |  |

## hot/arstechnica.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-9.svg" alt="" width="24" height="24"> [hot/arstechnica.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/arstechnica.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/arstechnica/arstechnica/index | ✅ 成功 |  |

## hot/baidu\_hot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-10.svg" alt="" width="24" height="24"> [hot/baidu\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/baidu_hot.js) · 版本：1.0.2

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/baidu/board | ✅ 成功 |  |

## hot/bilibili.js（3/3 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-11.svg" alt="" width="24" height="24"> [hot/bilibili.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/bilibili.js) · 版本：1.0.2

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/bilibili/main/hotword | ✅ 成功 |  |
| /api/hot/bilibili/x/web-interface/popular | ✅ 成功 |  |
| /api/hot/bilibili/x/web-interface/ranking/v2 | ✅ 成功 |  |

## hot/cankaoxiaoxi.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-13.svg" alt="" width="24" height="24"> [hot/cankaoxiaoxi.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/cankaoxiaoxi.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/cankaoxiaoxi/json/channel | ✅ 成功 |  |

## hot/chongbuluo.js（2/2 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-14.svg" alt="" width="24" height="24"> [hot/chongbuluo.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/chongbuluo.js) · 版本：1.0.2

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/chongbuluo/forum.php/hot | ✅ 成功 |  |
| /api/hot/chongbuluo/forum.php/latest | ✅ 成功 |  |

## hot/dailymotion.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-16.svg" alt="" width="24" height="24"> [hot/dailymotion.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/dailymotion.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/dailymotion/videos/:country? | ✅ 成功 |  |

## hot/deezer.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-17.svg" alt="" width="24" height="24"> [hot/deezer.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/deezer.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/deezer/chart/0/tracks | ✅ 成功 |  |

## hot/devto.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-18.svg" alt="" width="24" height="24"> [hot/devto.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/devto.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/devto/api/articles/:period? | ✅ 成功 |  |

## hot/dongqiudi.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-19.svg" alt="" width="24" height="24"> [hot/dongqiudi.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/dongqiudi.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/dongqiudi/app/tabs/web/1.json | ✅ 成功 |  |

## hot/douban\_hot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-20.svg" alt="" width="24" height="24"> [hot/douban\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/douban_hot.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/douban/rexxar/api/v2/subject/recent\_hot/movie | ✅ 成功 |  |

## hot/douyin\_hot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-21.svg" alt="" width="24" height="24"> [hot/douyin\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/douyin_hot.js) · 版本：1.1.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/douyin/aweme/v1/web/hot/search/list | ✅ 成功 |  |

## hot/fanqienovel.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-22.svg" alt="" width="24" height="24"> [hot/fanqienovel.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/fanqienovel.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/fanqienovel/rank/:rank\_id? | ✅ 成功 |  |

## hot/fastbull.js（2/2 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-23.svg" alt="" width="24" height="24"> [hot/fastbull.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/fastbull.js) · 版本：1.0.2

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/fastbull/cn/express-news | ✅ 成功 |  |
| /api/hot/fastbull/cn/news | ✅ 成功 |  |

## hot/gelonghui.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-25.svg" alt="" width="24" height="24"> [hot/gelonghui.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/gelonghui.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/gelonghui/news | ✅ 成功 |  |

## hot/github\_trending.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-26.svg" alt="" width="24" height="24"> [hot/github\_trending.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/github_trending.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/github/trending | ✅ 成功 |  |

## hot/google\_news.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-27.svg" alt="" width="24" height="24"> [hot/google\_news.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/google_news.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/google-news/rss/:edition?/:topic? | ✅ 成功 |  |

## hot/gutenberg.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-28.svg" alt="" width="24" height="24"> [hot/gutenberg.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/gutenberg.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/gutenberg/browse/scores/top/:period? | ✅ 成功 |  |

## hot/hackernews.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-29.svg" alt="" width="24" height="24"> [hot/hackernews.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/hackernews.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/hackernews | ✅ 成功 |  |

## hot/hatena.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-30.svg" alt="" width="24" height="24"> [hot/hatena.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/hatena.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/hatena/hotentry/:topic? | ✅ 成功 |  |

## hot/ifeng\_hot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-32.svg" alt="" width="24" height="24"> [hot/ifeng\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/ifeng_hot.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/ifeng/hot | ✅ 成功 |  |

## hot/iqiyi\_hot.js（2/2 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-33.svg" alt="" width="24" height="24"> [hot/iqiyi\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/iqiyi_hot.js) · 版本：1.1.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/iqiyi/portal/lw/v7/channel/card/videoTab | ✅ 成功 |  |
| /api/hot/iqiyi/views\_category/3.0/rank\_list | ✅ 成功 |  |

## hot/ithome.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-34.svg" alt="" width="24" height="24"> [hot/ithome.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/ithome.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/ithome/list | ✅ 成功 |  |

## hot/itmedia.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-35.svg" alt="" width="24" height="24"> [hot/itmedia.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/itmedia.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/itmedia/rss/2.0/news\_bursts.xml | ✅ 成功 |  |

## hot/jin10.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-36.svg" alt="" width="24" height="24"> [hot/jin10.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/jin10.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/jin10/flash\_newest.js | ✅ 成功 |  |

## hot/juejin\_hot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-37.svg" alt="" width="24" height="24"> [hot/juejin\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/juejin_hot.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/juejin/content\_api/v1/content/article\_rank | ✅ 成功 |  |

## hot/kakuyomu.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-38.svg" alt="" width="24" height="24"> [hot/kakuyomu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/kakuyomu.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/kakuyomu/rankings/:genre?/:period? | ✅ 成功 |  |

## hot/kuaishou\_hot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-40.svg" alt="" width="24" height="24"> [hot/kuaishou\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/kuaishou_hot.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/kuaishou/hot | ✅ 成功 |  |

## hot/kuan.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-41.svg" alt="" width="24" height="24"> [hot/kuan.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/kuan.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/kuan/v6/page/dataList | ✅ 成功 |  |

## hot/lobsters.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-42.svg" alt="" width="24" height="24"> [hot/lobsters.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/lobsters.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/lobsters/hottest.json | ✅ 成功 |  |

## hot/mango\_hot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-43.svg" alt="" width="24" height="24"> [hot/mango\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/mango_hot.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/mango/pc/suggest/v1 | ✅ 成功 |  |

## hot/maoyan\_hot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-44.svg" alt="" width="24" height="24"> [hot/maoyan\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/maoyan_hot.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/maoyan/dashboard-ajax/movie | ✅ 成功 |  |

## hot/mastodon.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-45.svg" alt="" width="24" height="24"> [hot/mastodon.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/mastodon.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/mastodon/api/v1/trends/:type? | ✅ 成功 |  |

## hot/mktnews\_flash.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-46.svg" alt="" width="24" height="24"> [hot/mktnews\_flash.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/mktnews_flash.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/mktnews/api/flash | ✅ 成功 |  |

## hot/myanimelist.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-47.svg" alt="" width="24" height="24"> [hot/myanimelist.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/myanimelist.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/myanimelist/top/:type? | ✅ 成功 |  |

## hot/narou.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-48.svg" alt="" width="24" height="24"> [hot/narou.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/narou.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/narou/novelapi/api/:period? | ✅ 成功 |  |

## hot/nhk.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-49.svg" alt="" width="24" height="24"> [hot/nhk.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/nhk.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/nhk/rss/news/cat0.xml | ✅ 成功 |  |

## hot/niconico.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-50.svg" alt="" width="24" height="24"> [hot/niconico.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/niconico.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/niconico/ranking | ✅ 成功 |  |

## hot/nowcoder\_hot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-51.svg" alt="" width="24" height="24"> [hot/nowcoder\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/nowcoder_hot.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/nowcoder/api/sparta/hot-search/top-hot-pc | ✅ 成功 |  |

## hot/npr.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-52.svg" alt="" width="24" height="24"> [hot/npr.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/npr.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/npr/1001/rss.xml | ✅ 成功 |  |

## hot/producthunt.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-54.svg" alt="" width="24" height="24"> [hot/producthunt.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/producthunt.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/producthunt/feed | ✅ 成功 |  |

## hot/qiita.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-57.svg" alt="" width="24" height="24"> [hot/qiita.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qiita.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/qiita/popular-items/feed | ✅ 成功 |  |

## hot/qimao.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-58.svg" alt="" width="24" height="24"> [hot/qimao.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qimao.js) · 版本：1.0.4

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/qimao/paihang/:gender?/:type?/:period? | ✅ 成功 |  |

## hot/qqvideo\_hot.js（2/2 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-59.svg" alt="" width="24" height="24"> [hot/qqvideo\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/qqvideo_hot.js) · 版本：1.1.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/qqvideo/trpc.tencentvideohotlistdata.hotlistdata.DoSearchHotListHttp/getSearchHotListHttp | ✅ 成功 |  |
| /api/hot/qqvideo/trpc.vector\_layout.page\_view.PageService/getCard | ✅ 成功 |  |

## hot/slashdot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-61.svg" alt="" width="24" height="24"> [hot/slashdot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/slashdot.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/slashdot/Slashdot/slashdotMain | ✅ 成功 |  |

## hot/solidot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-62.svg" alt="" width="24" height="24"> [hot/solidot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/solidot.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/solidot/index.rss | ✅ 成功 |  |

## hot/sputniknewscn.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-63.svg" alt="" width="24" height="24"> [hot/sputniknewscn.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/sputniknewscn.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/sputniknewscn/services/widget/lenta | ✅ 成功 |  |

## hot/sspai\_hot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-64.svg" alt="" width="24" height="24"> [hot/sspai\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/sspai_hot.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/sspai/api/v1/article/tag/page/get | ✅ 成功 |  |

## hot/steam.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-65.svg" alt="" width="24" height="24"> [hot/steam.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/steam.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/steam/stats/stats | ✅ 成功 |  |

## hot/techmeme.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-66.svg" alt="" width="24" height="24"> [hot/techmeme.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/techmeme.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/techmeme/feed.xml | ✅ 成功 |  |

## hot/tencent\_hot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-67.svg" alt="" width="24" height="24"> [hot/tencent\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/tencent_hot.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/tencent/web\_backend/v2/getTagInfo | ✅ 成功 |  |

## hot/theverge.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-69.svg" alt="" width="24" height="24"> [hot/theverge.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/theverge.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/theverge/rss/index.xml | ✅ 成功 |  |

## hot/tieba\_hot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-70.svg" alt="" width="24" height="24"> [hot/tieba\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/tieba_hot.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/tieba/hottopic/browse/topicList | ✅ 成功 |  |

## hot/toutiao\_hot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-72.svg" alt="" width="24" height="24"> [hot/toutiao\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/toutiao_hot.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/toutiao/hot-event/hot-board | ✅ 成功 |  |

## hot/vimeo.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-74.svg" alt="" width="24" height="24"> [hot/vimeo.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/vimeo.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/vimeo/channels/staffpicks/videos/rss | ✅ 成功 |  |

## hot/wallstreetcn.js（3/3 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-75.svg" alt="" width="24" height="24"> [hot/wallstreetcn.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/wallstreetcn.js) · 版本：1.0.2

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/wallstreetcn/apiv1/content/articles/hot | ✅ 成功 |  |
| /api/hot/wallstreetcn/apiv1/content/information-flow | ✅ 成功 |  |
| /api/hot/wallstreetcn/apiv1/content/lives | ✅ 成功 |  |

## hot/weibo\_hot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-76.svg" alt="" width="24" height="24"> [hot/weibo\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/weibo_hot.js) · 版本：1.0.2

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/weibo/top/summary | ✅ 成功 |  |

## hot/yahoo\_japan.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-78.svg" alt="" width="24" height="24"> [hot/yahoo\_japan.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/yahoo_japan.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/yahoo-japan/rss/topics/top-picks.xml | ✅ 成功 |  |

## hot/zaobao.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-80.svg" alt="" width="24" height="24"> [hot/zaobao.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/zaobao.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/zaobao/realtime | ✅ 成功 |  |

## hot/zenn.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-81.svg" alt="" width="24" height="24"> [hot/zenn.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/zenn.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/zenn/api/articles | ✅ 成功 |  |

## hot/zhihu\_hot.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-82.svg" alt="" width="24" height="24"> [hot/zhihu\_hot.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/hot/zhihu_hot.js) · 版本：1.0.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/hot/zhihu/api/v3/feed/topstory/hot-list-web | ✅ 成功 |  |

## rss/apple.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-84.svg" alt="" width="24" height="24"> [rss/apple.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/apple.js) · 版本：1.1.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/apple/apps/update/:country/:id/:platform? | ✅ 成功 |  |

## rss/bilibili.js（2/2 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-86.svg" alt="" width="24" height="24"> [rss/bilibili.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/bilibili.js) · 版本：1.1.2

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/bilibili/:userid/dynamic | ✅ 成功 |  |
| /api/rss/bilibili/:userid/upload/video | ✅ 成功 |  |

## rss/fanqienovel.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-88.svg" alt="" width="24" height="24"> [rss/fanqienovel.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/fanqienovel.js) · 版本：1.1.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/fanqienovel/book/:book\_id | ✅ 成功 |  |

## rss/github.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-89.svg" alt="" width="24" height="24"> [rss/github.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/github.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/github/:org/:pro/release | ✅ 成功 |  |

## rss/hongguo.js（2/2 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-90.svg" alt="" width="24" height="24"> [rss/hongguo.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/hongguo.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/hongguo/search/:keyword | ✅ 成功 |  |
| /api/rss/hongguo/series/:series\_id | ✅ 成功 |  |

## rss/javbus.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-92.svg" alt="" width="24" height="24"> [rss/javbus.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/javbus.js) · 版本：1.0.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/javbus/star/:id | ✅ 成功 |  |

## rss/qimao.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-96.svg" alt="" width="24" height="24"> [rss/qimao.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/qimao.js) · 版本：1.0.2

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/qimao/book/:book\_id | ✅ 成功 |  |

## rss/telegram.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-97.svg" alt="" width="24" height="24"> [rss/telegram.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/telegram.js) · 版本：1.1.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/telegram/channel/:username | ✅ 成功 |  |

## rss/weibo.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-99.svg" alt="" width="24" height="24"> [rss/weibo.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/weibo.js) · 版本：1.1.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/weibo/u/:uid | ✅ 成功 |  |

## rss/x.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-102.svg" alt="" width="24" height="24"> [rss/x.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/x.js) · 版本：1.1.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/x/:username | ✅ 成功 |  |

## rss/xiaohongshu.js（1/1 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-103.svg" alt="" width="24" height="24"> [rss/xiaohongshu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/xiaohongshu.js) · 版本：1.1.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/xiaohongshu/user/profile/:uid | ✅ 成功 |  |

## rss/youtube.js（2/2 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-104.svg" alt="" width="24" height="24"> [rss/youtube.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/youtube.js) · 版本：1.1.1

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/youtube/:handle | ✅ 成功 |  |
| /api/rss/youtube/:handle/shorts | ✅ 成功 |  |

## rss/zhihu.js（8/8 通过）

<img data-n="script-icon" src="https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/route-reports/reports/icons/script-105.svg" alt="" width="24" height="24"> [rss/zhihu.js](https://raw.githubusercontent.com/ltaoo/findrss-scripts/refs/heads/master/rss/zhihu.js) · 版本：1.1.0

| 路由 | 结果 | 失败原因 |
| --- | --- | --- |
| /api/rss/zhihu/collection/:collection\_id | ✅ 成功 |  |
| /api/rss/zhihu/column/:column\_id | ✅ 成功 |  |
| /api/rss/zhihu/people/:user/answers | ✅ 成功 |  |
| /api/rss/zhihu/people/:user | ✅ 成功 |  |
| /api/rss/zhihu/people/:user/asks | ✅ 成功 |  |
| /api/rss/zhihu/people/:user/pins | ✅ 成功 |  |
| /api/rss/zhihu/people/:user/posts | ✅ 成功 |  |
| /api/rss/zhihu/people/:user/zvideos | ✅ 成功 |  |
