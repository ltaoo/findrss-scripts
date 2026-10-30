# Detect 内容检测脚本

检测网站内容。平台脚本导出 `kind="detect"`、`version`、`platform` 和 `route/routes`，可选 `config_schema`、`permissions`。脚本通过 `DetectScript.fetch(ctx)` 抓取，`normalize(data,ctx)` 提取业务数据，`compare(previous,current,ctx)` 判断变化，`run(ctx)` 统一返回检测结果。

`platform` 与 RSS / Hot 脚本格式一致，例如 `export const platform = { name: "GitHub", icon: "https://github.githubassets.com/favicons/favicon.svg" };`。`name` 为 1–64 字符的平台名称；`icon` 支持 SVG 源码、无凭据的 HTTP(S) 地址或站内图片路径，留空使用默认图标。示例内嵌 SVG，无需额外请求图标。所有路由默认继承此配置，也可在单条 `route.platform` 中覆盖。

所有方法返回 `Result`。默认 `normalize` 原样返回抓取数据；数据须为 `{title,link,snapshot}`。默认 `compare` 调用 `ctx.detect.compare(previous,current)`，返回 `{status,changes,matches,issues}`。平台可覆盖比较方法，返回 `Result.Ok({changes,matches?})`，筛选标准变化事件或条目中的变化字段。宿主核对事件与真实快照，不接受伪造的前后值。

## 内容快照

`snapshot` 是以稳定名称为键的对象，支持最多 32 个检测对象。对象名称不随抓取内容变化；动态文章或模块应放在 list 中，通过条目 ID 区分：

```js
{
  body: { type: "content", format: "text", value: "公告正文" },
  product: { type: "record", value: { price: "99.00", stock: "in_stock" } },
  chapters: { type: "list", coverage: "complete", ordered: true,
    items: [{ id: "chapter-1", data: { title: "第一章" } }] },
}
```

正文 format 为 text 或 html，按脚本归一化后的字符串精确比较。record 递归比较对象字段，数组按整体值比较；列表必须单独声明 type=list 和稳定字符串 ID。大整数、精确金额用字符串，不能用排名或数组下标作为 ID。

列表 coverage 必填：complete 表示完整监控集合；window 表示有限窗口，必须声明稳定 scope（例如 latest-20）；partial 表示未完整采集。ordered 默认 false，启用后只比较共同条目的相对顺序，新增/删除导致的下标偏移不会批量触发移动。

确认业务对象不存在时返回 `{type:"content",present:false}`；缺少目标键不是确认消失。部分采集可返回 `{type:"record",incomplete:true,reason:"请求未完成"}`。partial/incomplete 以及检测对象集合、类型或范围变化返回 inconclusive，不推进基线。请求失败、验证码、登录页、选择器失效应通过 Result.Err 返回。

## 结果与变化

结果包含 `kind:"detect"`、`schema_version:1`、title、link、status、snapshot、changes、matches、issues。宿主填写 observed_at、previous_id；保存历史时添加本次 id 和变化事件 id。

status 为 initialized、unchanged、changed、inconclusive；采集执行失败由宿主记录 error。首次只建立基线。快照最大 1MB，结果最大 8MB；单列表最多 2000 项，所有列表合计最多 5000 项。对象字段顺序不产生变化；脚本应在 normalize 中去掉时间戳、随机 ID 等噪声。

| 事件 | 含义 |
| --- | --- |
| content.updated | 正文 before/after |
| field.added / field.removed / field.updated | record 字段的 JSON Pointer path 与 before/after |
| list.item_added / list.item_removed | 完整集合的条目新增/移除，带 item_id 与 after/before |
| list.item_entered / list.item_left | 条目进入/离开窗口，不宣称源站永久删除 |
| list.item_updated | item_id 与 fields，字段包含 op=add/remove/replace、path、before/after |
| list.item_moved | item_id、from、to、before_previous_id、after_previous_id，仅针对 ordered 列表；前序 ID 用于说明相对顺序变化 |
| target.appeared / target.disappeared | 检测对象从明确不存在到存在，或反向变化 |

matches 是规则命中数组，每项包含唯一 id、label，可选 change_indexes 指向本次 changes。可用于价格阈值、库存状态等业务判断；首次和无法可靠判断时不返回命中。状态、数字、图片摘要、附件摘要等使用 record 字段表达，截图/OCR/AI 语义比较不在此版本范围内。

## 运行与历史

后台「脚本 → 内容检测」中导入、Debug 并发布，再在「内容检测」创建任务、选择脚本和具体路由、配置周期。每条任务拥有独立基线。成功且完整的本次快照推进基线；错误、不完整和取消保留原基线。改任务来源或脚本数据配置时重新初始化；修改脚本代码本身不产生内容变化。

历史仅管理员可读，每条任务保留最近 20 次执行及当前基线；大于 64KB 的结果需要 API_STORAGE 对象存储。脚本停用、权限撤销、任务编辑、重置或删除后，迟到结果不会发布。

Debug 可在「上次内容快照 JSON」中粘贴旧 snapshot 或完整历史结果，重复验证比较规则，不修改正式任务基线。脚本只读访问 `ctx.previous`，其包含 id、snapshot。HTTP `GET /api/detect/<脚本路由>` 或 `/detect/<脚本路由>` 是无状态试采样，遵循路由访问权限，只返回 initialized/inconclusive，不推进任务基线；任务运行、重置和历史通过管理员 API 操作。

| 文件 | 示例路由 | 用途 |
| --- | --- | --- |
| [github_releases.js](github_releases.js) | `/github/ltaoo/findrss-worker/releases.atom` | GitHub 发布窗口的新增、移出和说明更新 |
| [website_text.js](website_text.js) | `/web/text/detect?url=https%3A%2F%2Fexample.com%2F&selector=body` | 静态网页指定区域的正文变化 |

示例使用普通 HTTP，不启动浏览器。通用网页示例支持有限的简单 CSS 选择器，动态渲染页面可自行使用 ctx.puppeteer.navigate，再提取可靠业务数据。测试在 findrss-worker 根目录运行 `node --test test/detect.test.js test/detection_scripts.test.js admin/__tests__/detections.test.mjs`。

历史界面按每页 50 项展示变化，长字段和原始 JSON 预览会缩短显示；「复制完整 JSON」及管理员历史 API 保留全部数据。
