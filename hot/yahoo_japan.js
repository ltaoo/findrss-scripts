/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const category = "新闻";
export const order = 810;
// Favicon: https://www.google.com/s2/favicons?domain=news.yahoo.co.jp&sz=32
export const platform = { name: "Yahoo! JAPAN News", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"yahoo_japan-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACIUlEQVR4nO2WT4hPURTHP+fX5H8ppciCjKKxGLr5s1CTMlZigYXkb7EgEavZWUiI3RQbq8lKlElRTCmScJT/RZNfssFCFhhSR1fn5fbmvd/vEVLep16/9zv3vPM959z77n1QU1PzvyNG+AiMr/wAKr8zgQ5gJTAHmA0sBXpzPleAE8A7v34ZI8TYrwV9kNmkwCmK7U9MI8BiQR+WBH1RQfuaoNuMMOyFNoHBeEnJtAwAGxPbU2CRoB8KEugBOr17O1JR4AZwG7gOzAAe5R6/WDafY4wwBCxLbAOCbm7hfw5YBbwBtgp6KZdoH3A4MX0CuholAb8Aa71VGZuMsLOgA5ONMOjiseIFeXFnTe7/UUGbLVe0EbqBm8AEN32OXRH0ro/H+Yzi84GTgu7z5PNxpgOvgKzgpqBdsQtlHfiOoPeBtOqxwFkjTDHCcuAOMA/YI+iuInEndifVOuBTQMsEPIkzwKnENAu4ClwGJgHrBe1vE2Z1cj8k6Pkf8asxzgjHgd2JzYB1abAijDAReOub3VegW9An2XijYgIjviGlvGwn7vQmO21/Kv4zCcSpuJAzxQ5UIWt/fD0PFm3Ff5pDwGNgWND3fzOBhhE6BX3uZ0mxExUwwlwjHCtYmEt8bGq+GCPE1j8zwj0jbCmL3dFG+DSwoeS4ngbcSnz7BD2SjO/134XAqDMkQ9okUHWhjfpWMMJMYAXQI+h2fwVramr+Pb4B/i+XPQLXYycAAAAASUVORK5CYII=\" data-n=\"yahoo_japan-favicon\"/></svg>" };
export const tags = ["新闻","日语"];

export class YahooJapanHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const fetched = await utils.request_text(ctx, "https://news.yahoo.co.jp/rss/topics/top-picks.xml");
      if (fetched.error) return fetched;
      const list = utils.feed_items(fetched.data, "https://news.yahoo.co.jp/");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("Yahoo! JAPAN News 未返回内容列表", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        entries.push({ id: "yahoo_japan:" + row.id, title: utils.plain_text(row.title), link: row.link,
          rank: null, pinned: false, heat: { value: null, unit: "热度", text: "" } });
      }
      return Result.Ok({ category, title: "Yahoo! JAPAN · 主要话题", link: "https://news.yahoo.co.jp/", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new YahooJapanHotRank();
export const route = {
  name: "Yahoo! JAPAN · 主要话题", path: "/yahoo-japan/headlines", url: "news.yahoo.co.jp",
  maintainers: ["findrss"], example: "/yahoo-japan/headlines", parameters: {},
  description: "官方 RSS/Atom 内容列表，保留上游选择和顺序。新闻及精选列表不冒充热度排名，未知排名与热度均为 null。",
  handler: ctx => script.run(ctx),
};
