/** HOT */
import { utils } from "@findrss/util";

export const version = "1.0.0";
export const category = "新闻";
export const order = 600;
// Favicon: https://www.google.com/s2/favicons?domain=news.google.com&sz=32
export const platform = { name: "Google News", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"google_news-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,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\" data-n=\"google_news-favicon\"/></svg>" };
export const tags = ["新闻", "英语", "日语"];

const editions = {
  us: { hl: "en-US", gl: "US", ceid: "US:en", name: "美国" },
  gb: { hl: "en-GB", gl: "GB", ceid: "GB:en", name: "英国" },
  jp: { hl: "ja", gl: "JP", ceid: "JP:ja", name: "日本" },
};
const topics = { top: "头条", world: "国际", nation: "国内", business: "商业", technology: "科技", entertainment: "娱乐", sports: "体育", science: "科学", health: "健康" };

export class GoogleNewsHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const edition = ctx.params.edition || "us", topic = ctx.params.topic || "top";
      if (!Object.hasOwn(editions, edition) || !Object.hasOwn(topics, topic)) {
        return Result.Err("edition 支持 us、gb、jp；topic 支持 top、world、nation、business、technology、entertainment、sports、science、health", "INVALID_PARAMETER");
      }
      const selected = editions[edition];
      const suffix = (topic === "top" ? "" : "/headlines/section/topic/" + topic.toUpperCase())
        + "?hl=" + selected.hl + "&gl=" + selected.gl + "&ceid=" + selected.ceid;
      const fetched = await utils.request_text(ctx, "https://news.google.com/rss" + suffix);
      if (fetched.error) return fetched;
      const list = utils.feed_items(fetched.data, "https://news.google.com/");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("Google News 未返回新闻列表", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        entries.push({ id: "google-news:" + row.id, title: utils.plain_text(row.title), link: row.link,
          rank: null, pinned: false, heat: { value: null, unit: "热度", text: "" } });
      }
      return Result.Ok({ category, title: "Google News · " + selected.name + " · " + topics[topic],
        link: "https://news.google.com/" + suffix.replace(/^\//, ""), entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new GoogleNewsHotRank();
export const route = {
  name: "Google News · 英语/日语头条", path: "/google-news/:edition?/:topic?", url: "news.google.com",
  maintainers: ["findrss"], example: "/google-news/us/top",
  parameters: { edition: "us 美国英语（默认）、gb 英国英语、jp 日本日语", topic: "top 头条（默认）、world、nation、business、technology、entertainment、sports、science、health" },
  description: "官方新闻聚合 RSS，保留上游头条顺序和跳转链接；没有显式排名及热度，均为 null。",
  handler: ctx => script.run(ctx),
};
