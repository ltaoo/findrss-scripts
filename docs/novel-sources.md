# 小说章节订阅

在 FindRSS 后台导入对应的 `rss/*.js`，填写书籍详情页中的标识即可订阅。独立 Worker 部署会自动注册所有脚本，例如：

```text
/rss/shuhaige/book/70475
/atom/d8zw/book/134/134526
/api/rss/xtxxs9/book/66120
```

条目包含章节标题、稳定 ID 和原站链接，最新章节在前；不抓取正文，也不伪造发布时间。多页目录逐页读取并去重；任一页请求、解析失败，或超过 100 页时返回错误，不输出截断的订阅。

## 书源及参数

参考 [so-novel 的书源规则](https://github.com/freeok/so-novel/tree/88de8b63d350c53f47a6f26f6af98a8c8304caa7/bundle/rules)，覆盖该版本五组 JSON 中的 31 个来源：已有的 [69书吧](../rss/69shuba.js) 继续沿用，另外新增下表 30 个脚本。部分规则未列在上游 `BOOK_SOURCES.md` 中，按实际 JSON 纳入。

`book_id` 和 `category` 都来自书籍详情页路径；多层数字路径分别传入两个参数。梦书中文、鸟书网和笔尖中文的 `book_id` 保留下划线；全本小说网、天天看小说使用文字标识。下表示例不代表该书源在所有出口可访问。

| 书源 / 脚本 | 详情页格式 | 路由示例 | 目录 |
| --- | --- | --- | --- |
| [香书小说](../rss/ibiqugu.js) | `http://www.ibiqugu.net/{category}/{book_id}/` | `/ibiqugu/book/130/130509` | 单页目录 |
| [书海阁小说网](../rss/shuhaige.js) | `https://www.shuhaige.net/{book_id}/` | `/shuhaige/book/70475` | 单页目录 |
| [梦书中文](../rss/mcxs.js) | `http://www.mcxs.la/{book_id}/` | `/mcxs/book/145_145199` | 单页目录 |
| [鸟书网](../rss/99wx.js) | `http://www.99wx.info/tag/{book_id}/` | `/99wx/book/129_129843` | 单页目录 |
| [笔尖中文](../rss/xbiquwk.js) | `http://www.xbiquwk.com/{book_id}/` | `/xbiquwk/book/10_10233` | 单页目录 |
| [悠久小说网](../rss/ujxsw.js) | `http://www.ujxsw.org/book/{book_id}/` | `/ujxsw/book/107612` | 单页目录 |
| [阅读库](../rss/yeudusk.js) | `http://www.yeudusk.com/book/{book_id}/` | `/yeudusk/book/1322535` | 单页目录 |
| [笔趣阁365](../rss/biquge365.js) | `https://www.biquge365.net/book/{book_id}/` | `/biquge365/book/95601` | 单页目录 |
| [第八中文网](../rss/d8zw.js) | `https://www.d8zw.com/{category}/{book_id}/` | `/d8zw/book/134/134526` | 自动翻页 |
| [笔趣阁52](../rss/52bqg.js) | `https://www.52bqg.com/book_{book_id}/` | `/52bqg/book/266271` | 自动翻页 |
| [少年小说网](../rss/snxsw.js) | `https://www.snxsw.com/book/{book_id}/` | `/snxsw/book/76366` | 自动翻页 |
| [新笔趣阁小说网](../rss/xbiquge_info.js) | `https://www.xbiquge.info/{category}/{book_id}/` | `/xbiquge_info/book/17/17937` | 自动翻页 |
| [笔趣阁info](../rss/bqg_info.js) | `https://www.bqg.info/book/{book_id}/` | `/bqg_info/book/172` | 单页目录 |
| [全本小说网](../rss/quanben5.js) | `https://quanben5.com/n/{book_id}/` | `/quanben5/book/henchunhenaimei` | 单页目录 |
| [大熊猫文学](../rss/dxmwx.js) | `https://www.dxmwx.org/book/{book_id}.html` | `/dxmwx/book/56441` | 单页目录 |
| [101看书](../rss/101kks.js) | `https://101kks.com/book/{book_id}.html` | `/101kks/book/48273` | 单页目录 |
| [笔趣屋](../rss/fsshu.js) | `https://www.fsshu.com/biquge/{category}/{book_id}/` | `/fsshu/book/17/17937` | 自动翻页 |
| [新天禧小说](../rss/xtxxs9.js) | `https://www.xtxxs9.com/book/{book_id}/` | `/xtxxs9/book/66120` | 自动翻页 |
| [零点小说](../rss/0xs.js) | `https://www.0xs.net/txt_1/{book_id}.html` | `/0xs/book/68398` | 单页目录 |
| [速读谷](../rss/suduguu.js) | `https://www.suduguu.com/{book_id}/` | `/suduguu/book/3415` | 自动翻页 |
| [笔趣阁中文网](../rss/xbiquge_cc.js) | `https://www.xbiquge.cc/book/{book_id}/` | `/xbiquge_cc/book/3558` | 自动翻页 |
| [小说虎](../rss/xiaoshuohu.js) | `https://www.xiaoshuohu.com/{category}/{book_id}/` | `/xiaoshuohu/book/14/14654` | 单页目录 |
| [天天看小说](../rss/ttkan.js) | `https://cn.ttkan.co/novel/chapters/{book_id}` | `/ttkan/book/congzhanyaochumokaishichangshengbusi` | 单页目录 |
| [小说之家](../rss/xszj.js) | `https://xszj.org/b/{book_id}` | `/xszj/book/1` | 自动翻页 |
| [顶点小说](../rss/wxsy.js) | `https://www.wxsy.net/novel/{book_id}/` | `/wxsy/book/1803` | 自动翻页 |
| [黄易天地](../rss/xhytd.js) | `http://www.xhytd.com/{category}/{book_id}/` | `/xhytd/book/170/170581` | 单页目录 |
| [96读书](../rss/96dushu.js) | `https://www.96dushu.com/book/{book_id}/` | `/96dushu/book/448209` | 单页目录 |
| [东滩小说](../rss/dongtanxs.js) | `http://www.dongtanxs.com/dong{book_id}/` | `/dongtanxs/book/49371` | 单页目录 |
| [和图书](../rss/hetushu.js) | `https://www.hetushu.com/book/{book_id}/index.html` | `/hetushu/book/5763` | 单页目录 |
| [哔哩轻小说](../rss/linovelib.js) | `https://www.linovelib.com/novel/{book_id}.html` | `/linovelib/book/1` | 单页目录 |

`cn.ttkan.co` 使用新的 `ttkan.js`；原 [ttk.js](../rss/ttk.js) 继续访问 `ttks.tw`，两者分别保留。和图书直接请求原站，不使用上游规则里的 `127.0.0.1:8000` 本地代理地址。

## 访问要求与验证

书源有地域、限流和 Cloudflare 验证差异，实际能否访问取决于宿主出口。遇到 HTTP 403 或验证页，可为独立 Worker 配置 `BROWSER` 绑定并启用 `BROWSER_ENABLED=true`；后台导入时也需宿主提供浏览器能力。浏览器仍未完成验证时返回错误。429 和其他上游错误会保留，不自动反复请求。

测试使用独立页面结构覆盖全部新增来源，以及分页、倒序、去重、隐藏干扰项、onclick 链接和错误传播。实页抽查验证了速读谷 285 个章节、新天禧小说全部 4 页目录；其他站点尚未全部实站验证，部分抽查返回 403、502 或连接超时。

## 维护脚本

修改 [书源清单](../scripts/novel_sources.json) 或 [公共模板](../scripts/templates/novel_chapters.js.txt) 后运行：

```sh
node scripts/generate_novel_sources.js
node --import ./test/support/worker_runtime.js --test test/novel_sources.test.js
npm run build
```

生成的每个 RSS 文件均内嵌所需逻辑，可以单独复制到后台；运行时不依赖本地清单和模板。增加来源时也需更新巡检页的 [来源分组](../scripts/script_groups.js)。
