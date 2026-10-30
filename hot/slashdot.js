/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const category = "科技";
export const order = 760;
// Favicon: https://www.google.com/s2/favicons?domain=slashdot.org&sz=32
export const platform = { name: "Slashdot", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"slashdot-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,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\" data-n=\"slashdot-favicon\"/></svg>" };
export const tags = ["社区","英语"];

export class SlashdotHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const fetched = await utils.request_text(ctx, "https://rss.slashdot.org/Slashdot/slashdotMain");
      if (fetched.error) return fetched;
      const list = utils.feed_items(fetched.data, "https://slashdot.org/");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("Slashdot 未返回内容列表", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        entries.push({ id: "slashdot:" + row.id, title: utils.plain_text(row.title), link: row.link,
          rank: null, pinned: false, heat: { value: null, unit: "热度", text: "" } });
      }
      return Result.Ok({ category, title: "Slashdot · 科技资讯", link: "https://slashdot.org/", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new SlashdotHotRank();
export const route = {
  name: "Slashdot · 科技资讯", path: "/slashdot/headlines", url: "slashdot.org",
  maintainers: ["findrss"], example: "/slashdot/headlines", parameters: {},
  description: "官方 RSS/Atom 内容列表，保留上游选择和顺序。新闻及精选列表不冒充热度排名，未知排名与热度均为 null。",
  handler: ctx => script.run(ctx),
};
