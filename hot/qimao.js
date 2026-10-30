/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";

export const version = "1.0.2";
export const category = "小说";
export const order = 380;
// Favicon: https://www.google.com/s2/favicons?domain=www.qimao.com&sz=64
export const platform = {
  name: "七猫小说",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"qimao-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABYlBMVEUAAAD/yAD9yQD9yQD9yAD8yABbSAA9Oxjg11fNxU8wLhMAAABFQxv37V9QTR8aGQoSEgdhXSbb0lX/9GJBPxoxLxMREQfa0VQLCwUQEAf27F9rZyoPDwb161+KhTaCfTIBAQHWzVOfmT6gmj5NPQBZRwBwWQCZeQBUUSGinD+TjTne1VYjIg6jnD+WdwBuVwBYRgBMPAC1kACnhACPcQBjTwAlJA9pZSl7djBTUCAHBwNnUgCSdACohgC2kQD2wwCwjABsVgCyjQBzWwATDwAPDABVRACMbwC0jwDKoADOowDJoABXRQAEAwB3XgBfTAAcFgAVEQB2XgBENgCuigD4xADYqwAtJAAWEgC/mAD7xwC8lQAQDQA3KwDiswDCmgAJBwAlHQDvvQDbrgAHBgDNowD5xQA4LACQcgBHOADxvwDEnACVdgA2KwDntwDWqgANCgCDaABvWABKOgBeSwB4XwCyMyJaAAAABXRSTlMAHKbm7dPOBesAAAFtSURBVDjLhdPnU8IwGAbwUIgFXnbYGycCslSWAxyIW3GhKO69F/+/lNEUKfB86OXy/O6aS+5FSMJIcZdIGQlCEhnuEZkEMbhnGCTtDaSI+w50CdfVAStXKOFflAo5ywOVWqNldcJax2o1ahUFejAQI5jMjdZsAiOxgJ4CK9iI3QoOQ12YDQ6w2okNrDwAcBIXgJt4OOAhbgAXcQIIAFiI1usjgxwYIj6vtvaLJhgeGR2rrf3q8QAJhjgQCpLAhNpfW4Uj0RiKT05Nc9uJZCqdaRwyk04lE9xiZnZuHuFsbgG6JLKYxWhpOb9SWF1bb2Zjk6+3tnd2i3to/+BQcPVHJb4/PsG4HI+htqc5PeP7ynljqw1cXPL91TXuBDd5vr+9w53g/oGeP4xFwCPtn7AIeC5S8CIGXmn/hsWA4AQFMfAuuOIPMZCj/WdZDHxRUMFi4JuCnzbQGpxfCqJtg9MavWqJT1UAmP7D22/8/wAd6D+mOaLKjAAAAABJRU5ErkJggg==\" data-n=\"qimao-favicon\"/></svg>",
};
export const tags = ["小说", "排行榜"];
export const permissions = {
  cookies: [{
    id: "qimao",
    origin: "https://www.qimao.com",
    path_prefix: "/paihang/",
    names: ["acw_tc", "acw_sc__v2", "acw_sc__v3"],
    purpose: "携带七猫访问验证 Cookie 读取小说排行榜",
  }],
};

export class QimaoHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const gender = ctx.params.gender || "boy";
      const type = ctx.params.type || "hot";
      const period = ctx.params.period || "date";
      if (!["boy", "girl"].includes(gender) || !["hot", "new", "over", "collect", "update"].includes(type)
        || !["date", "month"].includes(period) || ["collect", "update"].includes(type) && period !== "date") {
        return Result.Err("gender 仅支持 boy、girl；type 支持 hot、new、over、collect、update；前三类支持 date/month，收藏和更新榜使用 date", "INVALID_PARAMETER");
      }
      const link = "https://www.qimao.com/paihang/" + gender + "/" + type + "/" + period + "/";
      const acquired = await ctx.cookies.get("qimao");
      if (acquired.error) return acquired;
      const fetched = await utils.request_text(ctx, link, {
        cookies: acquired.data,
        headers: { Referer: "https://www.qimao.com/" },
      });
      if (fetched.error) return fetched;
      if (/aliyun_waf_|AliyunCaptcha|<title>\s*(?:滑动验证页面|访问验证|Verification)\s*<\/title>/i.test(fetched.data)) {
        return Result.Err("七猫返回访问验证页，请手动完成官网验证，在后台同步有效的 qimao.com 验证 Cookie 并确认脚本 Cookie 授权；若仍失败，可能是上游限制了服务端 IP", "UPSTREAM_INVALID_RESPONSE");
      }
      const parsed = utils.document_nodes(fetched.data);
      if (parsed.error) return parsed;
      const list = utils.rows(parsed.data, ".rank-list .rank-list-item");
      if (list.error) return list;
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const book = utils.absolute_url(utils.attribute(row, "a.s-book-title", "href"), link);
        if (book.error) return book;
        const id = /^https:\/\/www\.qimao\.com\/shuku\/(\d+)\/?$/.exec(book.data)?.[1];
        if (!id) return Result.Err("七猫书籍链接无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(id)) continue;
        seen.add(id);
        const thumbnail = utils.absolute_url(utils.attribute(row, ".pic img", "data-src") || utils.attribute(row, ".pic img", "src"), link);
        if (thumbnail.error) return thumbnail;
        const rank = utils.field(row, ".rank-number");
        const text = utils.field(row, ".rank-num") + utils.field(row, ".rank-unit");
        const heat = /^([\d,]+(?:\.\d+)?)(万|亿)?$/.exec(text);
        entries.push({
          id: "qimao:book:" + id,
          title: utils.field(row, "a.s-book-title"),
          link: book.data,
          ...(thumbnail.data ? { thumbnail: thumbnail.data } : {}),
          rank: rank === "" ? null : Number(rank),
          pinned: false,
          heat: {
            value: heat ? Number(heat[1].replace(/,/g, "")) * (heat[2] === "亿" ? 1e8 : heat[2] === "万" ? 1e4 : 1) : null,
            unit: type === "collect" ? "收藏" : type === "update" ? "更新字数" : "热度",
            text,
          },
        });
      }
      const title = "七猫小说 · " + (gender === "boy" ? "男频" : "女频") + ({ hot: "大热榜", new: "新书榜", over: "完结榜", collect: "收藏榜", update: "更新榜" })[type] + (period === "month" ? " · 月榜" : "");
      ctx.log("七猫榜单解析完成", { gender, type, period, count: entries.length });
      return Result.Ok({ category, title, link, entries });
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }
}

const script = new QimaoHotRank();
export const route = {
  name: "七猫小说排行榜",
  path: "/qimao/paihang/:gender?/:type?/:period?",
  url: "www.qimao.com",
  maintainers: ["findrss"],
  example: "/qimao/paihang/boy/hot",
  parameters: { gender: "boy（男频，默认）、girl（女频）", type: "hot 大热榜（默认）、new 新书榜、over 完结榜、collect 收藏榜、update 更新榜", period: "date（默认）、month；大热/新书/完结支持日榜和月榜，收藏按总收藏数、更新按近 30 天更新字数排行，仅支持 date" },
  description: "覆盖官网男女频全部 5 类榜单及可用周期，读取第一页并返回封面；保留上游排名与热度，未提供的数据为 null。需授权七猫访问验证 Cookie；遇到验证页请手动完成官网验证后同步 Cookie。",
  handler: ctx => script.run(ctx),
};
