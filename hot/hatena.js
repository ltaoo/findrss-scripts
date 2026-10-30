/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const category = "社交";
export const order = 640;
// Favicon: https://www.google.com/s2/favicons?domain=b.hatena.ne.jp&sz=32
export const platform = { name: "はてなブックマーク", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"hatena-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAB6ElEQVR4nOWXzU7CQBSFTxtEFFSqicREA+iGDUjiA1gT3bNnwxuoT0B9AusbaKJ795rIzpUJyIaN/MQFIUapiD9BZMxAp9KgVZC2Jn5JQ3Pb6TnMvTPt5QghYHBHhS0A9PDDHEoAZBIPypomIYQKewGkACzDGjIARBIPKrwasFIcqhbVBIfDPJ3yXdjDNjVQNDHn31HibRSn+FkN2AZvtwGH0cXEogcBz0hPPFV5bv+mqw0ojZbhOHpvqvIyoIGlCazOunriyTDdNjrs5WrYurg1HGdkgMcv2QxNQl6ZsbcGNkOT1hjgjgpYOy1jJ6v0XPM6B/svfL8DaD6ly6oulvmiGH+Co5+bRZ8LAbcDom9Mi92/tiBl9YZMM3C2PtcTk3M1wyo3vQiTYS+KsQVramAnq+AgX2/nvJupER5SWDA/BVJX8UkRQbchRaed2vn+1YOWFrZrWvouSKniSuOtvV0PbwYigrYaooLzU9H2+cYc/O7Oo6PCKBLnN8MxkOya8m7oUqTTzmDilIDHYW4KMtUGxJMyio9NXYyRvjNOAYfD/Md3eZ+v42K9qRNm0CUZmx+H8trC8fXT4Ab+xRcR/xcMlGzUL1EDWp9mAzLrDdMWt2aUDIkHo6wGRLVhtExc1ex0xww72vN3PHW1YslmRxkAAAAASUVORK5CYII=\" data-n=\"hatena-favicon\"/></svg>" };
export const tags = ["新闻", "社区", "日语"];

const topics = { all: "综合", general: "综合资讯", social: "社会", economics: "经济", life: "生活", knowledge: "知识", it: "科技", fun: "趣闻", entertainment: "娱乐", game: "动漫游戏" };

export class HatenaHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const topic = ctx.params.topic || "all";
      if (!Object.hasOwn(topics, topic)) return Result.Err("topic 支持 all、general、social、economics、life、knowledge、it、fun、entertainment、game", "INVALID_PARAMETER");
      const link = "https://b.hatena.ne.jp/hotentry/" + topic;
      const fetched = await utils.request_text(ctx, link + ".rss");
      if (fetched.error) return fetched;
      const parsed = utils.document_nodes(fetched.data, true);
      if (parsed.error) return parsed;
      const list = utils.rows(parsed.data, "rdf:rdf > item");
      if (list.error) return list;
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const entry_link = utils.absolute_url(utils.field(row, "link"), link);
        if (entry_link.error) return entry_link;
        if (!entry_link.data) return Result.Err("Hatena 热门条目缺少链接", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(entry_link.data)) continue;
        seen.add(entry_link.data);
        const text = utils.field(row, "hatena:bookmarkcount");
        entries.push({ id: "hatena:" + entry_link.data, title: utils.plain_text(utils.field(row, "title")), link: entry_link.data,
          rank: null, pinned: false, heat: { value: text === "" ? null : Number(text), unit: "书签", text } });
      }
      return Result.Ok({ category, title: "はてなブックマーク · " + topics[topic], link, entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new HatenaHotRank();
export const route = {
  name: "Hatena · 热门书签", path: "/hatena/hot/:topic?", url: "b.hatena.ne.jp",
  maintainers: ["findrss"], example: "/hatena/hot/all",
  parameters: { topic: "all（默认）、general、social、economics、life、knowledge、it、fun、entertainment、game" },
  description: "官方热门条目 RSS 1.0，热度为原始书签数；保留列表顺序，rank 为 null。",
  handler: ctx => script.run(ctx),
};
