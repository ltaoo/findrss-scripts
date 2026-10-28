脚本路由巡检：28/163 通过

| 脚本 / 路由 | 请求 | 响应 | 格式 | 输出 | 说明 |
| --- | --- | --- | --- | --- | --- |
| clip/github.js /api/clip/github/:owner/:repo/readme | false | false | false | false | The operation was aborted due to timeout |
| clip/website.js /api/clip/web/region | false | false | false | false | The operation was aborted due to timeout |
| detect/github_releases.js /api/detect/github/:owner/:repo/releases/detect | false | false | false | false | The operation was aborted due to timeout |
| detect/website_text.js /api/detect/web/text/detect | false | false | false | false | The operation was aborted due to timeout |
| hot/36kr_quick.js /api/hot/36kr/quick | false | false | false | false | HTTP 502: UPSTREAM_INVALID_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |
| hot/36kr_renqi.js /api/hot/36kr/renqi | false | false | false | false | HTTP 502: UPSTREAM_ACCESS_DENIED: 上游拒绝访问，可能需要额外权限或完成站点验证 |
| hot/aihot.js /api/hot/aihot | true | true | true | true |  |
| hot/anilist.js /api/hot/anilist/trending/:type? | false | false | false | false | HTTP 502: UPSTREAM_ACCESS_DENIED: 上游拒绝访问，可能需要额外权限或完成站点验证 |
| hot/apple_charts.js /api/hot/apple-charts/:country?/:type? | true | true | true | false | 来源应为 rss.marketingtools.apple.com，实际为 podcasts.apple.com |
| hot/arstechnica.js /api/hot/arstechnica/headlines | true | true | true | true |  |
| hot/baidu_hot.js /api/hot/baidu/hot | true | true | true | true |  |
| hot/bilibili_hot_search.js /api/hot/bilibili/hot/search | false | false | false | false | HTTP 502: UPSTREAM_FETCH_FAILED: 访问上游网页或接口失败，请稍后重试 |
| hot/bilibili_hot_video.js /api/hot/bilibili/hot/video | false | false | false | false | HTTP 502: UPSTREAM_FETCH_FAILED: 访问上游网页或接口失败，请稍后重试 |
| hot/bilibili_ranking.js /api/hot/bilibili/ranking | false | false | false | false | HTTP 502: UPSTREAM_FETCH_FAILED: 访问上游网页或接口失败，请稍后重试 |
| hot/bluesky.js /api/hot/bluesky/trending | false | false | false | false | HTTP 502: UPSTREAM_INVALID_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |
| hot/cankaoxiaoxi.js /api/hot/cankaoxiaoxi | true | true | true | true |  |
| hot/chongbuluo_hot.js /api/hot/chongbuluo/hot | true | true | true | true |  |
| hot/chongbuluo_latest.js /api/hot/chongbuluo/latest | true | true | true | true |  |
| hot/cls_depth.js /api/hot/cls/depth | true | true | true | true |  |
| hot/cls_hot.js /api/hot/cls/hot | true | true | true | true |  |
| hot/cls_telegraph.js /api/hot/cls/telegraph | true | true | true | true |  |
| hot/dailymotion.js /api/hot/dailymotion/hot/:country? | true | true | true | true |  |
| hot/deezer.js /api/hot/deezer/chart | true | true | true | true |  |
| hot/devto.js /api/hot/devto/top/:period? | true | true | true | true |  |
| hot/dongqiudi.js /api/hot/dongqiudi | true | true | true | true |  |
| hot/douban_hot.js /api/hot/douban/hot | true | true | true | true |  |
| hot/douyin_hot.js /api/hot/douyin/hot | true | true | true | true |  |
| hot/fanqienovel.js /api/hot/fanqienovel/rank/:rank_id? | true | true | true | true |  |
| hot/fastbull_express.js /api/hot/fastbull/express | true | true | true | true |  |
| hot/fastbull_news.js /api/hot/fastbull/news | true | true | true | true |  |
| hot/freebuf.js /api/hot/freebuf | false | false | false | false | HTTP 502: UPSTREAM_FETCH_FAILED: 访问上游网页或接口失败，请稍后重试 |
| hot/gelonghui.js /api/hot/gelonghui | true | true | true | true |  |
| hot/github_trending.js /api/hot/github/trending | false | false | false | false | HTTP 503 |
| hot/google_news.js /api/hot/google-news/:edition?/:topic? | false | false | false | false | HTTP 503 |
| hot/gutenberg.js /api/hot/gutenberg/top/:period? | true | true | true | true |  |
| hot/hackernews.js /api/hot/hackernews | true | true | true | true |  |
| hot/hatena.js /api/hot/hatena/hot/:topic? | false | false | false | false | HTTP 503 |
| hot/hupu_hot.js /api/hot/hupu/hot | false | false | false | false | HTTP 503 |
| hot/ifeng_hot.js /api/hot/ifeng/hot | false | false | false | false | HTTP 503 |
| hot/iqiyi_hot.js /api/hot/iqiyi/hot | false | false | false | false | HTTP 503 |
| hot/ithome.js /api/hot/ithome | false | false | false | false | HTTP 503 |
| hot/itmedia.js /api/hot/itmedia/headlines | false | false | false | false | HTTP 503 |
| hot/jin10.js /api/hot/jin10 | false | false | false | false | HTTP 503 |
| hot/juejin_hot.js /api/hot/juejin/hot | false | false | false | false | HTTP 503 |
| hot/kakuyomu.js /api/hot/kakuyomu/rank/:period?/:genre? | false | false | false | false | HTTP 503 |
| hot/kaopu.js /api/hot/kaopu | false | false | false | false | HTTP 503 |
| hot/kuaishou_hot.js /api/hot/kuaishou/hot | false | false | false | false | HTTP 503 |
| hot/kuan.js /api/hot/kuan | false | false | false | false | HTTP 503 |
| hot/lobsters.js /api/hot/lobsters/hot | false | false | false | false | HTTP 503 |
| hot/mastodon.js /api/hot/mastodon/trending/:type? | false | false | false | false | HTTP 503 |
| hot/mktnews_flash.js /api/hot/mktnews/flash | false | false | false | false | HTTP 503 |
| hot/myanimelist.js /api/hot/myanimelist/top/:type? | false | false | false | false | HTTP 503 |
| hot/narou.js /api/hot/narou/top/:period? | false | false | false | false | HTTP 503 |
| hot/nhk.js /api/hot/nhk/headlines | false | false | false | false | HTTP 503 |
| hot/niconico.js /api/hot/niconico/rank | true | true | true | true |  |
| hot/nowcoder_hot.js /api/hot/nowcoder/hot | false | false | false | false | HTTP 503 |
| hot/npr.js /api/hot/npr/headlines | false | false | false | false | HTTP 503 |
| hot/pcbeta_windows11.js /api/hot/pcbeta/windows11 | false | false | false | false | HTTP 503 |
| hot/producthunt.js /api/hot/producthunt | true | true | true | true |  |
| hot/qidian.js /api/hot/qidian/rank/collect/female | false | false | false | false | The operation was aborted due to timeout |
| hot/qidian.js /api/hot/qidian/rank/free/female | false | false | false | false | The operation was aborted due to timeout |
| hot/qidian.js /api/hot/qidian/rank/hotsales | false | false | false | false | HTTP 503 |
| hot/qidian.js /api/hot/qidian/rank/hotsales/female | false | false | false | false | HTTP 503 |
| hot/qidian.js /api/hot/qidian/rank/newauthor | false | false | false | false | The operation was aborted due to timeout |
| hot/qidian.js /api/hot/qidian/rank/newbook | false | false | false | false | HTTP 503 |
| hot/qidian.js /api/hot/qidian/rank/newfans | false | false | false | false | HTTP 503 |
| hot/qidian.js /api/hot/qidian/rank/newfans/female | false | false | false | false | The operation was aborted due to timeout |
| hot/qidian.js /api/hot/qidian/rank/readindex | false | false | false | false | HTTP 503 |
| hot/qidian.js /api/hot/qidian/rank/readindex/female | false | false | false | false | The operation was aborted due to timeout |
| hot/qidian.js /api/hot/qidian/rank/rec | false | false | false | false | HTTP 503 |
| hot/qidian.js /api/hot/qidian/rank/rec/female | false | false | false | false | The operation was aborted due to timeout |
| hot/qidian.js /api/hot/qidian/rank/sign | false | false | false | false | HTTP 503 |
| hot/qidian.js /api/hot/qidian/rank/update | false | false | false | false | HTTP 503 |
| hot/qidian.js /api/hot/qidian/rank/update/female | false | false | false | false | The operation was aborted due to timeout |
| hot/qidian.js /api/hot/qidian/rank/yuepiao | false | false | false | false | HTTP 503 |
| hot/qidian.js /api/hot/qidian/rank/yuepiao/female | false | false | false | false | HTTP 502: UPSTREAM_INVALID_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |
| hot/qiita.js /api/hot/qiita/hot | true | true | true | true |  |
| hot/qimao.js /api/hot/qimao/rank/:gender?/:type?/:period? | false | false | false | false | The operation was aborted due to timeout |
| hot/qqvideo_hot.js /api/hot/qqvideo/hot | false | false | false | false | The operation was aborted due to timeout |
| hot/reddit.js /api/hot/reddit/:subreddit?/:sort? | false | false | false | false | The operation was aborted due to timeout |
| hot/slashdot.js /api/hot/slashdot/headlines | false | false | false | false | The operation was aborted due to timeout |
| hot/solidot.js /api/hot/solidot | false | false | false | false | The operation was aborted due to timeout |
| hot/sputniknewscn.js /api/hot/sputniknewscn | false | false | false | false | The operation was aborted due to timeout |
| hot/sspai_hot.js /api/hot/sspai/hot | false | false | false | false | The operation was aborted due to timeout |
| hot/steam.js /api/hot/steam | false | false | false | false | The operation was aborted due to timeout |
| hot/techmeme.js /api/hot/techmeme/hot | true | true | true | true |  |
| hot/tencent_hot.js /api/hot/tencent/hot | false | false | false | false | The operation was aborted due to timeout |
| hot/thepaper_hot.js /api/hot/thepaper/hot | false | false | false | false | The operation was aborted due to timeout |
| hot/theverge.js /api/hot/theverge/headlines | false | false | false | false | The operation was aborted due to timeout |
| hot/tieba_hot.js /api/hot/tieba/hot | false | false | false | false | The operation was aborted due to timeout |
| hot/tiktok.js /api/hot/tiktok/hot/:country?/:days? | false | false | false | false | The operation was aborted due to timeout |
| hot/toutiao_hot.js /api/hot/toutiao/hot | false | false | false | false | The operation was aborted due to timeout |
| hot/v2ex_share.js /api/hot/v2ex/share | false | false | false | false | The operation was aborted due to timeout |
| hot/vimeo.js /api/hot/vimeo/staff-picks | false | false | false | false | The operation was aborted due to timeout |
| hot/wallstreetcn_hot.js /api/hot/wallstreetcn/hot | false | false | false | false | The operation was aborted due to timeout |
| hot/wallstreetcn_news.js /api/hot/wallstreetcn/news | false | false | false | false | The operation was aborted due to timeout |
| hot/wallstreetcn_quick.js /api/hot/wallstreetcn/quick | false | false | false | false | The operation was aborted due to timeout |
| hot/weibo_hot.js /api/hot/weibo/hot | false | false | false | false | The operation was aborted due to timeout |
| hot/xueqiu_hotstock.js /api/hot/xueqiu/hotstock | false | false | false | false | The operation was aborted due to timeout |
| hot/yahoo_japan.js /api/hot/yahoo-japan/headlines | false | false | false | false | The operation was aborted due to timeout |
| hot/youtube_hot.js /api/hot/youtube/hot/:region?/:category? | false | false | false | false | HTTP 400: INVALID_PARAMETER: 请求参数无效，请检查路径参数和查询参数 |
| hot/zaobao.js /api/hot/zaobao | false | false | false | false | The operation was aborted due to timeout |
| hot/zenn.js /api/hot/zenn/trending | false | false | false | false | The operation was aborted due to timeout |
| hot/zhihu_hot.js /api/hot/zhihu/hot | false | false | false | false | The operation was aborted due to timeout |
| rss/69shuba.js /atom/69shuba/book/:book_id | false | false | false | false | HTTP 502: UPSTREAM_ACCESS_DENIED: 上游拒绝访问，可能需要额外权限或完成站点验证 |
| rss/69shuba.js /rss/69shuba/book/:book_id | false | false | false | false | The operation was aborted due to timeout |
| rss/apple.js /atom/apple/apps/update/:country/:id/:platform? | false | false | false | false | The operation was aborted due to timeout |
| rss/apple.js /img/apple | false | false | false | false | The operation was aborted due to timeout |
| rss/apple.js /rss/apple/apps/update/:country/:id/:platform? | false | false | false | false | The operation was aborted due to timeout |
| rss/bilibili.js /atom/bilibili/:userid/dynamic | false | false | false | false | The operation was aborted due to timeout |
| rss/bilibili.js /atom/bilibili/:userid/upload/video | false | false | false | false | The operation was aborted due to timeout |
| rss/bilibili.js /rss/bilibili/:userid/dynamic | false | false | false | false | The operation was aborted due to timeout |
| rss/bilibili.js /rss/bilibili/:userid/upload/video | false | false | false | false | HTTP 502: UPSTREAM_INVALID_RESPONSE: 上游响应不符合要求，可能返回登录页、验证页、错误格式或缺少必要字段 |
| rss/douyin.js /atom/douyin/user/:sec_uid | false | false | false | false | The operation was aborted due to timeout |
| rss/douyin.js /rss/douyin/user/:sec_uid | false | false | false | false | The operation was aborted due to timeout |
| rss/fanqienovel.js /atom/fanqienovel/book/:book_id | false | false | false | false | The operation was aborted due to timeout |
| rss/fanqienovel.js /fanqienovel/chapter/:chapter_id | false | false | false | false | The operation was aborted due to timeout |
| rss/fanqienovel.js /rss/fanqienovel/book/:book_id | false | false | false | false | The operation was aborted due to timeout |
| rss/github.js /atom/github/:org/:pro/release | true | true | true | true |  |
| rss/github.js /rss/github/:org/:pro/release | false | false | false | false | The operation was aborted due to timeout |
| rss/instagram.js /atom/instagram/:username | false | false | false | false | The operation was aborted due to timeout |
| rss/instagram.js /rss/instagram/:username | false | false | false | false | The operation was aborted due to timeout |
| rss/kuaishou.js /atom/kuaishou/profile/:user_id | false | false | false | false | The operation was aborted due to timeout |
| rss/kuaishou.js /rss/kuaishou/profile/:user_id | false | false | false | false | The operation was aborted due to timeout |
| rss/qidian.js /atom/qidian/book/:book_id | false | false | false | false | The operation was aborted due to timeout |
| rss/qidian.js /qidian/chapter/:book_id/:chapter_id | false | false | false | false | The operation was aborted due to timeout |
| rss/qidian.js /rss/qidian/book/:book_id | false | false | false | false | The operation was aborted due to timeout |
| rss/telegram.js /atom/telegram/channel/:username | false | false | false | false | The operation was aborted due to timeout |
| rss/telegram.js /rss/telegram/channel/:username | false | false | false | false | The operation was aborted due to timeout |
| rss/ttk.js /atom/ttk/book/:book_id | false | false | false | false | HTTP 502: UPSTREAM_ACCESS_DENIED: 上游拒绝访问，可能需要额外权限或完成站点验证 |
| rss/ttk.js /rss/ttk/book/:book_id | false | false | false | false | The operation was aborted due to timeout |
| rss/weibo.js /atom/weibo/u/:uid | false | false | false | false | The operation was aborted due to timeout |
| rss/weibo.js /img/weibo | false | false | false | false | The operation was aborted due to timeout |
| rss/weibo.js /rss/weibo/u/:uid | false | false | false | false | The operation was aborted due to timeout |
| rss/wxchannels.js /atom/wxchannels/:account | false | false | false | false | The operation was aborted due to timeout |
| rss/wxchannels.js /rss/wxchannels/:account | false | false | false | false | The operation was aborted due to timeout |
| rss/wxmp.js /atom/wxmp/:account? | false | false | false | false | The operation was aborted due to timeout |
| rss/wxmp.js /img/wxmp | false | false | false | false | The operation was aborted due to timeout |
| rss/wxmp.js /rss/wxmp/:account? | false | false | false | false | The operation was aborted due to timeout |
| rss/x.js /atom/x/:username | false | false | false | false | The operation was aborted due to timeout |
| rss/x.js /rss/x/:username | false | false | false | false | The operation was aborted due to timeout |
| rss/xiaohongshu.js /atom/xiaohongshu/user/profile/:uid | false | false | false | false | The operation was aborted due to timeout |
| rss/xiaohongshu.js /rss/xiaohongshu/user/profile/:uid | false | false | false | false | The operation was aborted due to timeout |
| rss/youtube.js /atom/youtube/:handle | false | false | false | false | The operation was aborted due to timeout |
| rss/youtube.js /atom/youtube/:handle/shorts | false | false | false | false | The operation was aborted due to timeout |
| rss/youtube.js /rss/youtube/:handle | false | false | false | false | The operation was aborted due to timeout |
| rss/youtube.js /rss/youtube/:handle/shorts | false | false | false | false | HTTP 503 |
| rss/zhihu.js /atom/zhihu/collection/:collection_id | false | false | false | false | HTTP 503 |
| rss/zhihu.js /atom/zhihu/column/:column_id | false | false | false | false | The operation was aborted due to timeout |
| rss/zhihu.js /atom/zhihu/people/:user | false | false | false | false | The operation was aborted due to timeout |
| rss/zhihu.js /atom/zhihu/people/:user/answers | true | true | true | true |  |
| rss/zhihu.js /atom/zhihu/people/:user/asks | true | true | true | true |  |
| rss/zhihu.js /atom/zhihu/people/:user/pins | false | false | false | false | The operation was aborted due to timeout |
| rss/zhihu.js /atom/zhihu/people/:user/posts | false | false | false | false | The operation was aborted due to timeout |
| rss/zhihu.js /atom/zhihu/people/:user/zvideos | false | false | false | false | The operation was aborted due to timeout |
| rss/zhihu.js /rss/zhihu/collection/:collection_id | false | false | false | false | The operation was aborted due to timeout |
| rss/zhihu.js /rss/zhihu/column/:column_id | false | false | false | false | The operation was aborted due to timeout |
| rss/zhihu.js /rss/zhihu/people/:user | false | false | false | false | The operation was aborted due to timeout |
| rss/zhihu.js /rss/zhihu/people/:user/answers | false | false | false | false | The operation was aborted due to timeout |
| rss/zhihu.js /rss/zhihu/people/:user/asks | false | false | false | false | HTTP 503 |
| rss/zhihu.js /rss/zhihu/people/:user/pins | false | false | false | false | The operation was aborted due to timeout |
| rss/zhihu.js /rss/zhihu/people/:user/posts | false | false | false | false | The operation was aborted due to timeout |
| rss/zhihu.js /rss/zhihu/people/:user/zvideos | false | false | false | false | The operation was aborted due to timeout |
