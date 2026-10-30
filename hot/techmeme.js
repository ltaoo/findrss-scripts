/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const category = "科技";
export const order = 610;
// Favicon: https://www.google.com/s2/favicons?domain=www.techmeme.com&sz=32
export const platform = { name: "Techmeme", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"techmeme-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABXUlEQVR4nGOU80n+zzCAgIlhgAELNsEvv/8wvPv1h6oWCbGxMPCwYlrH8uj9Z1SRX38YigIdGawMtRn+/v1LFcuZmZkZjp2/ytC3fj8DAxuqI1juLutDU8zEcPDkBYZgD0cGaoKv334wPFgfzPD37z9UByjJSWMo/vXnNFUth5j5m0FeWhJDnCWzATUEQEBdXprh4dPnGK6FAUF+PgZBfl4UsfcfPzO8//gJq3pQqH75+p0Bm12MQu7xWLPhuy/fsXvl83eGhfWZDHFBnijCi9ZtZ4hvnM7AwMuJVZsQD3ZxFmwpEwR4BFF9CAOP2FgZONhZMcTBYsJ8DHLcHAxDqhxgGnUAw6gDBhgwjTqAYdQBAwyYRh3AMOoAMhuZxIgRAxgZTINI65j8/M2gqy7LoCktjiJ8/elLhss3HzMwYGms4HXA////R3bPiJHkKKAyYJETF2QY0VHANNAOAAB6c1jfXyG5kwAAAABJRU5ErkJggg==\" data-n=\"techmeme-favicon\"/></svg>" };
export const tags = ["资讯", "科技", "英语"];

export class TechmemeHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const fetched = await utils.request_text(ctx, "https://www.techmeme.com/feed.xml");
      if (fetched.error) return fetched;
      const list = utils.feed_items(fetched.data, "https://www.techmeme.com/");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("Techmeme 未返回头条列表", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        entries.push({ id: "techmeme:" + row.id, title: utils.plain_text(row.title), link: row.link,
          rank: null, pinned: false, heat: { value: null, unit: "热度", text: "" } });
      }
      return Result.Ok({ category, title: "Techmeme · 科技头条", link: "https://www.techmeme.com/", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new TechmemeHotRank();
export const route = {
  name: "Techmeme · 科技头条", path: "/techmeme/hot", url: "www.techmeme.com",
  maintainers: ["findrss"], example: "/techmeme/hot", parameters: {},
  description: "读取官方 Top news RSS，保留上游顺序；排名与热度未知时为 null。",
  handler: ctx => script.run(ctx),
};
