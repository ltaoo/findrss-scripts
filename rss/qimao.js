import { utils } from "@findrss/util";
import { RSSScript, Result } from "@findrss/core";

export const version = "1.0.0";
// Favicon: https://www.google.com/s2/favicons?domain=www.qimao.com&sz=64
export const platform = {
  name: "七猫小说",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"qimao-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABYlBMVEUAAAD/yAD9yQD9yQD9yAD8yABbSAA9Oxjg11fNxU8wLhMAAABFQxv37V9QTR8aGQoSEgdhXSbb0lX/9GJBPxoxLxMREQfa0VQLCwUQEAf27F9rZyoPDwb161+KhTaCfTIBAQHWzVOfmT6gmj5NPQBZRwBwWQCZeQBUUSGinD+TjTne1VYjIg6jnD+WdwBuVwBYRgBMPAC1kACnhACPcQBjTwAlJA9pZSl7djBTUCAHBwNnUgCSdACohgC2kQD2wwCwjABsVgCyjQBzWwATDwAPDABVRACMbwC0jwDKoADOowDJoABXRQAEAwB3XgBfTAAcFgAVEQB2XgBENgCuigD4xADYqwAtJAAWEgC/mAD7xwC8lQAQDQA3KwDiswDCmgAJBwAlHQDvvQDbrgAHBgDNowD5xQA4LACQcgBHOADxvwDEnACVdgA2KwDntwDWqgANCgCDaABvWABKOgBeSwB4XwCyMyJaAAAABXRSTlMAHKbm7dPOBesAAAFtSURBVDjLhdPnU8IwGAbwUIgFXnbYGycCslSWAxyIW3GhKO69F/+/lNEUKfB86OXy/O6aS+5FSMJIcZdIGQlCEhnuEZkEMbhnGCTtDaSI+w50CdfVAStXKOFflAo5ywOVWqNldcJax2o1ahUFejAQI5jMjdZsAiOxgJ4CK9iI3QoOQ12YDQ6w2okNrDwAcBIXgJt4OOAhbgAXcQIIAFiI1usjgxwYIj6vtvaLJhgeGR2rrf3q8QAJhjgQCpLAhNpfW4Uj0RiKT05Nc9uJZCqdaRwyk04lE9xiZnZuHuFsbgG6JLKYxWhpOb9SWF1bb2Zjk6+3tnd2i3to/+BQcPVHJb4/PsG4HI+htqc5PeP7ynljqw1cXPL91TXuBDd5vr+9w53g/oGeP4xFwCPtn7AIeC5S8CIGXmn/hsWA4AQFMfAuuOIPMZCj/WdZDHxRUMFi4JuCnzbQGpxfCqJtg9MavWqJT1UAmP7D22/8/wAd6D+mOaLKjAAAAABJRU5ErkJggg==\" data-n=\"qimao-favicon\"/></svg>",
};
export const permissions = {
  cookies: [{
    id: "qimao",
    origin: "https://www.qimao.com",
    path_prefix: "/",
    names: ["acw_tc", "acw_sc__v2", "acw_sc__v3"],
    purpose: "携带七猫访问验证 Cookie 读取书籍信息和章节目录",
  }],
};

export class QimaoChaptersRSS extends RSSScript {
  async fetch(ctx) {
    try {
      const book_id = ctx.params.book_id;
      if (typeof book_id !== "string" || !/^\d{1,24}$/.test(book_id)) {
        return Result.Err("book_id 必须为小说数字 ID", "INVALID_PARAMETER");
      }
      const link = "https://www.qimao.com/shuku/" + book_id + "/";
      const acquired = await ctx.cookies.get("qimao");
      if (acquired.error) return acquired;
      const detail = await QimaoChaptersRSS.request_text(ctx, link, acquired.data, "https://www.qimao.com/");
      if (detail.error) return detail;
      const parsed = utils.document_nodes(detail.data);
      if (parsed.error) return parsed;
      const root = parsed.data;
      const title = utils.attribute(root, 'meta[property="og:novel:book_name"]', "content") || utils.field(root, "h1");
      if (!title.trim()) return Result.Err("七猫页面缺少小说标题", "UPSTREAM_INVALID_RESPONSE");
      const author_name = utils.attribute(root, 'meta[property="og:novel:author"]', "content");
      const author = { name: author_name || title, uri: link };
      const image = utils.absolute_url(utils.attribute(root, 'meta[property="og:image"]', "content"), link);
      if (image.error) return image;
      const fetched = await QimaoChaptersRSS.request_text(ctx,
        "https://www.qimao.com/qimaoapi/api/book/chapter-list?book_id=" + book_id, acquired.data, link);
      if (fetched.error) return fetched;
      const data = parseJSON(fetched.data);
      if (data.error) return Result.Err("七猫章节接口未返回有效 JSON", "UPSTREAM_INVALID_RESPONSE");
      const chapters = utils.array_at(data.data, "data.chapters");
      if (chapters.error) return chapters;
      const items = [], seen = new Set();
      for (const chapter of chapters.data.slice().reverse()) {
        const id = utils.identity(chapter?.id);
        if (id.error) return id;
        if (!/^\d{1,24}$/.test(id.data) || typeof chapter.title !== "string" || !chapter.title.trim()) {
          return Result.Err("七猫章节缺少有效 ID 或标题", "UPSTREAM_INVALID_RESPONSE");
        }
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const updated = utils.timestamp(chapter.update_time);
        if (updated.error) return updated;
        items.push({
          id: "qimao:chapter:" + book_id + ":" + id.data,
          title: chapter.title.trim(),
          link: "https://www.qimao.com/shuku/" + book_id + "-" + id.data + "/",
          author,
          description: /^\d+$/.test(String(chapter.words ?? "")) ? chapter.words + " 字" : "",
          ...(updated.data == null ? {} : { published: updated.data, updated: updated.data }),
        });
      }
      ctx.log("七猫目录解析完成", { book_id, count: items.length });
      return Result.Ok({
        id: "qimao:book:" + book_id,
        title: title.trim() + " · 章节更新",
        link,
        description: utils.attribute(root, 'meta[name="description"]', "content") || title + "最新章节",
        language: "zh-cn",
        author,
        ...(image.data ? { image: image.data } : {}),
        items,
        extra: { view: "article", tags: ["小说", "七猫小说"] },
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }

  static async request_text(ctx, url, cookies, referer) {
    const fetched = await utils.request_text(ctx, url, { cookies, headers: { Referer: referer } });
    if (fetched.error) return fetched;
    if (/aliyun_waf_|AliyunCaptcha|<title>\s*(?:滑动验证页面|访问验证|Verification)\s*<\/title>/i.test(fetched.data)) {
      return Result.Err("七猫返回访问验证页，请手动完成官网验证，在后台同步有效的 qimao.com 验证 Cookie 并确认脚本 Cookie 授权；若仍失败，可能是上游限制了服务端 IP", "UPSTREAM_INVALID_RESPONSE");
    }
    return fetched;
  }
}

const script = new QimaoChaptersRSS();
export const route = {
  name: "七猫小说章节",
  path: "/qimao/book/:book_id",
  url: "www.qimao.com",
  maintainers: ["findrss"],
  example: "/qimao/book/13030701",
  parameters: { book_id: "小说详情页 /shuku/ 后的数字 ID" },
  description: "读取完整章节目录，按更新时间倒序输出章节标题、字数和官网阅读链接，不抓取正文。需授权七猫访问验证 Cookie；遇到验证页请手动完成官网验证后同步 Cookie。",
  handler: ctx => script.run(ctx),
};
