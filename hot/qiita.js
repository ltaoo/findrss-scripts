/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const category = "科技";
export const order = 750;
// Favicon: https://www.google.com/s2/favicons?domain=qiita.com&sz=32
export const platform = { name: "Qiita", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"qiita-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,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\" data-n=\"qiita-favicon\"/></svg>" };
export const tags = ["社区","日语"];

export class QiitaHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const fetched = await utils.request_text(ctx, "https://qiita.com/popular-items/feed");
      if (fetched.error) return fetched;
      const list = utils.feed_items(fetched.data, "https://qiita.com/");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("Qiita 未返回内容列表", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        entries.push({ id: "qiita:" + row.id, title: utils.plain_text(row.title), link: row.link,
          rank: null, pinned: false, heat: { value: null, unit: "热度", text: "" } });
      }
      return Result.Ok({ category, title: "Qiita · 热门文章", link: "https://qiita.com/", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new QiitaHotRank();
export const route = {
  name: "Qiita · 热门文章", path: "/qiita/hot", url: "qiita.com",
  maintainers: ["findrss"], example: "/qiita/hot", parameters: {},
  description: "官方 RSS/Atom 内容列表，保留上游选择和顺序。新闻及精选列表不冒充热度排名，未知排名与热度均为 null。",
  handler: ctx => script.run(ctx),
};
