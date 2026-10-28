/*
MIT License

Copyright (c) 2026 ltaoo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
export const kind = "clip";
export const version = "1.0.0";
export const platform = { name: "网页", icon: "" };

class WebsiteClip extends ClipScript {
  async fetch(ctx) {
    const query = ctx.query;
    const link = query.url;
    const captured = await ctx.clip.capture(link, {
      selector: query.selector,
      viewport: { width: Number(query.viewport_width ?? 1440), height: Number(query.viewport_height ?? 900) },
      wait_ms: Number(query.wait_ms ?? 1000),
      id_prefix: query.id_prefix || "",
    });
    if (captured.error) return captured;
    return Result.Ok({ title: captured.data.title || "网页区域", link,
      html: captured.data.html, stats: captured.data.stats });
  }
}
const script = new WebsiteClip();
export const route = {
  path: "/web/region", name: "网页区域剪藏",
  example: "/web/region?url=https%3A%2F%2Fexample.com%2F&selector=body",
  description: "通过查询参数 url、selector 指定网页区域，可选 viewport_width、viewport_height、wait_ms。",
  handler: ctx => script.run(ctx),
};
