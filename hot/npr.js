/** HOT */
import { utils } from "@findrss/util";

export const version = "1.0.0";
export const category = "新闻";
export const order = 790;
// Favicon: https://www.google.com/s2/favicons?domain=www.npr.org&sz=32
export const platform = { name: "NPR", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"npr-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAqUlEQVR4nGP8//8/w0ACpgG1nWHUAQyjDmAYdQDTqAMYBhiwgIgbispElccGD78y/CRCpXLVMqIsv9PqxDg4QgAGNO7fZcAGbigqo/D//3+BVR0jowQK/06rE1Z1KtX74GwmhsEUAug+xhUi6D7GFSLYfIwOmBgGYwgQCwj5nBjAxDCYQuAGWmpH5xNK9aTE/aAJAcbRRinDqAMGGDCNOoBh1AEDDAbcAQBuECY1xv4o0wAAAABJRU5ErkJggg==\" data-n=\"npr-favicon\"/></svg>" };
export const tags = ["新闻","英语"];

export class NprHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const fetched = await utils.request_text(ctx, "https://feeds.npr.org/1001/rss.xml");
      if (fetched.error) return fetched;
      const list = utils.feed_items(fetched.data, "https://www.npr.org/");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("NPR 未返回内容列表", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        entries.push({ id: "npr:" + row.id, title: utils.plain_text(row.title), link: row.link,
          rank: null, pinned: false, heat: { value: null, unit: "热度", text: "" } });
      }
      return Result.Ok({ category, title: "NPR · Top Stories", link: "https://www.npr.org/", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new NprHotRank();
export const route = {
  name: "NPR · Top Stories", path: "/npr/headlines", url: "www.npr.org",
  maintainers: ["findrss"], example: "/npr/headlines", parameters: {},
  description: "官方 RSS/Atom 内容列表，保留上游选择和顺序。新闻及精选列表不冒充热度排名，未知排名与热度均为 null。",
  handler: ctx => script.run(ctx),
};
