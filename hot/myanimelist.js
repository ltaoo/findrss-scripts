/** HOT */
import { utils } from "@findrss/util";
export const version = "1.0.0";
export const category = "动漫";
export const order = 890;
// Favicon: https://www.google.com/s2/favicons?domain=myanimelist.net&sz=32
export const platform = { name: "MyAnimeList", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"myanimelist-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACoklEQVR4nO1WTUgUcRT/zex/HXdXbdO+UBI1QzZDqagQhMS+MOxDolsXO0hejI4VUkSylxSqQxcpEQ+BnaIP6BD0IdXBNDI9ZJZh+IXmstu4szuzxvtvs9uOuqu0sYfmBwvvvXm///vtmzdvRiir61xACiGmsrgpwOyA2QGzAwS21HLwKRpUbQEZkgXMIvAY+RQnn+I6KD4fDEELhReqzpmTVVhEAZnp0dwVCfApGhqOFqM4fy0ePh/Bi4EZpDMRBZvsOHPche9TPtzoHoLNKmLKp2L3liwcrtiMjTl2zu9+Ooy+EQ/amvbAKwdw9c77uCKYMeBVQjhUWYQd23NRe6AErhNd+DQXwMvOU8heY8PYuAfXuj7yvO6WauzbWxDDlySGBy09OHmklPsNt3rhWo2APyGlMdy9XAVNC/HiOqZ/BPC4dX+k+MXrz1Besp4X7x+ahNMafsUoARWJwBIl6EXoMBIUZomoqdrKzZsdb+Fu7off08SvK4qKueAwkvI27LjfxwvTz337VSRelhftxum6MsxMNEbFrRIsUcLZ5id8mjf8HjKC168tmz+vxLY96A/xwaZB1p+oVQl41DsNGxNQX1MYiX35Jkfub87OdsBmwUxPfcyc6Dh/rBBZGVaMTfjwenB2kQgxXnGbxHhxIpFNsNvTAEnEm74x3vYLjaWAg8Fhs0Y4Ouh626WDuHKuCpW78vi+MEIwfpLRYnHlZ8KZYcX4rB+jkzK/BU6HFUW5DnhlFe8+e1Bdvg7t7lo+hK33BrlPecT5OiGjYlt2ZDlR/MOIBz8VjdtxBegiCIIQJhvj1BGyaTkNjHrhtLNFHN3XYTwr7gywJYbFGCeb/ikVX4qz3BlJ/ShlKyzyzwQkA2JSTjEF/AVEpBiiKQD/u4BfjTDn5DlkX9EAAAAASUVORK5CYII=\" data-n=\"myanimelist-favicon\"/></svg>" };
export const tags = ["动漫", "漫画", "小说", "英语", "日语"];

export class MyanimelistHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const type = ctx.params.type || "anime";
      if (!["anime", "manga", "novels"].includes(type)) return Result.Err("type 支持 anime（默认）、manga、novels", "INVALID_PARAMETER");
      const link = "https://myanimelist.net/" + (type === "anime" ? "topanime.php" : "topmanga.php" + (type === "novels" ? "?type=novels" : ""));
      const fetched = await utils.request_text(ctx, link);
      if (fetched.error) return fetched;
      const parsed = utils.document_nodes(fetched.data);
      if (parsed.error) return parsed;
      const list = utils.rows(parsed.data, "tr.ranking-list");
      if (list.error) return list;
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const match = /^https:\/\/myanimelist\.net\/(anime|manga)\/(\d+)(?:\/|$)/.exec(utils.attribute(row, "h3 a", "href"));
        if (!match || match[1] !== (type === "anime" ? "anime" : "manga")) return Result.Err("MyAnimeList 作品链接无效", "UPSTREAM_INVALID_RESPONSE");
        const id = match[2];
        if (seen.has(id)) continue;
        seen.add(id);
        const thumbnail = utils.absolute_url(utils.attribute(row, ".title img", "data-src") || utils.attribute(row, ".title img", "src"));
        if (thumbnail.error) return thumbnail;
        const rank = utils.field(row, ".rank span"), text = utils.field(row, "td.score .score-label");
        entries.push({ id: "myanimelist:" + match[1] + ":" + id, title: utils.field(row, "h3 a"), link: "https://myanimelist.net/" + match[1] + "/" + id,
          ...(thumbnail.data ? { thumbnail: thumbnail.data } : {}), rank: rank === "" ? null : Number(rank), pinned: false,
          heat: { value: text === "" || text === "N/A" ? null : Number(text), unit: "评分", text } });
      }
      return Result.Ok({ category: type === "novels" ? "小说" : category, title: "MyAnimeList · " + ({ anime: "动画", manga: "漫画", novels: "轻小说" })[type] + "评分榜", link, entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}
const script = new MyanimelistHotRank();
export const route = { name: "MyAnimeList · 动漫/轻小说榜", path: "/myanimelist/top/:type?", url: "myanimelist.net",
  maintainers: ["findrss"], example: "/myanimelist/top/anime", parameters: { type: "anime（默认）、manga、novels" },
  description: "官网评分榜第一页，保留明确名次和评分，封面来自页面；支持动画、漫画及轻小说。", handler: ctx => script.run(ctx) };
