import { utils } from "@findrss/util";
import { DetectScript, Result } from "@findrss/core";
export const kind = "detect";
export const version = "1.0.1";
export const platform = {
  name: "网页",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#98a0ae\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" data-n=\"website-platform-icon\"><circle cx=\"12\" cy=\"12\" r=\"8.5\" data-n=\"website-icon-circle-1\" /><ellipse cx=\"12\" cy=\"12\" rx=\"3.6\" ry=\"8.5\" data-n=\"website-icon-ellipse-2\" /><path d=\"M3.7 9.4h16.6M3.7 14.6h16.6\" data-n=\"website-icon-path-3\" /></svg>",
};

class WebsiteTextDetect extends DetectScript {
  async fetch(ctx) {
    const link = ctx.query.url, selector = ctx.query.selector || "body";
    if (typeof link !== "string" || !/^https?:\/\//i.test(link) || typeof selector !== "string" || selector.length > 1000)
      return Result.Err("需要有效的 url 和 selector 参数", "INVALID_PARAMETER");
    const fetched = await utils.request_text(ctx, link);
    if (fetched.error) return fetched;
    const parsed = utils.document_nodes(fetched.data);
    if (parsed.error) return parsed;
    const node = utils.first(parsed.data, selector);
    if (!node) return Result.Err("页面缺少检测区域：" + selector, "UPSTREAM_INVALID_RESPONSE");
    const text = utils.descendants(node).filter(child => {
      for (let parent = child; parent; parent = parent.parent) if (["script", "style", "noscript"].includes(parent.tag)) return false;
      return child.tag === "text";
    }).map(child => child.text).join("").replace(/\s+/g, " ").trim();
    return Result.Ok({ title: "网页正文检测", link, snapshot: { body: { type: "content", format: "text", value: text } } });
  }
}
const script = new WebsiteTextDetect();
export const route = {
  path: "/web/text/detect", name: "网页正文内容检测",
  example: "/web/text/detect?url=https%3A%2F%2Fexample.com%2F&selector=body",
  parameters: { url: "必填：网页 HTTP(S) 地址", selector: "网页区域的 CSS 选择器，默认 body" },
  description: "普通 HTTP 读取静态 HTML，提取指定区域并忽略脚本、样式及空白差异；支持简单 CSS 选择器。",
  handler: ctx => script.run(ctx),
};
