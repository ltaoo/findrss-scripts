/** HOT */
import { utils } from "@findrss/util";

export const version = "1.0.0";
export const category = "小说";
export const order = 660;
// Favicon: https://www.google.com/s2/favicons?domain=www.gutenberg.org&sz=32
export const platform = { name: "Project Gutenberg", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"gutenberg-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACKUlEQVR4nKVTXUhTYRh+dnbO2bHmT06dpmEhRbKtYoVeuBaFQkRIoEFhlBD0exEU4UUX0V0QQX+gBIWCkFdFQSuy6IcIFK0MWYWsKSc15Ghs052ztp3iew+Nja150Xvzfnzf+zzvz/N+pm9K+Df+w/joZAAjbc2oO38RkfGPmHvy0HgoLIL7ng9SVXVeAm7+9SAdAlcuEZgROa7dQSISxqdjBxEPh/ITrDlyAq7ufgglpShr3oPqA52wbd+F2pNnoc3IUAYf5ycAgELHZphEMeNhVUMTOIsF2sz35Qly2a8FBZxogbS6JnWX1DTo8ThUeQpvtq4jz6eDdE3Fh8P7sOn2AM2DzaGkoQlzTx/hy4UzWUn8XacyCRbeviQfvHEZynMfzWEp8JXArJ0tfQ8Q+zGLye6r4HgBzlt9MLE9SCwtYqS9BQU1tQi9HyISpoZtRwuG93pQ6tkJ5/W70Gans2Tl/x4SoZ+QGj1w3uyFyWwGJwhQXj2jzFXth+DvOk1ViRWVsG6oR2R8DK6efnCLE5/xzuuCHovButEBsyQRmFl8XiHPSBg4vVXRXgnr+nrwnGDIR5naOjLKE2xl5DV5Cu4BH0KjQxQz3OqFpdxutLBibR28o8GcUha7G2EuWAm5twfb7r+gjExGXY2mYv65B1RBUTENk23k2NH9YP8mqUZJXjaDrD3IZRW7W8FJEvznjtOnS7ekFjVkXI7ECNagykHoqgqx3J6S8w+trtQqbxDVXwAAAABJRU5ErkJggg==\" data-n=\"gutenberg-favicon\"/></svg>" };
export const tags = ["小说", "图书", "英语"];

const periods = { day: { section: "books-last1", name: "昨日" }, week: { section: "books-last7", name: "近 7 天" }, month: { section: "books-last30", name: "近 30 天" } };

export class GutenbergHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const period = ctx.params.period || "day";
      if (!Object.hasOwn(periods, period)) return Result.Err("period 支持 day（默认）、week、month", "INVALID_PARAMETER");
      const selected = periods[period], link = "https://www.gutenberg.org/browse/scores/top";
      const fetched = await utils.request_text(ctx, link);
      if (fetched.error) return fetched;
      const parsed = utils.document_nodes(fetched.data);
      if (parsed.error) return parsed;
      const heading = utils.first(parsed.data, "#" + selected.section);
      if (!heading) return Result.Err("Gutenberg 页面缺少指定周期的图书榜单", "UPSTREAM_INVALID_RESPONSE");
      const siblings = heading.parent.children;
      const ordered_list = siblings.slice(siblings.indexOf(heading) + 1).find(node => node.tag !== "text");
      if (ordered_list?.tag !== "ol") return Result.Err("Gutenberg 图书榜单结构已变更", "UPSTREAM_INVALID_RESPONSE");
      const list = utils.rows(ordered_list, "li a");
      if (list.error) return list;
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const id = /^\/ebooks\/(\d+)$/.exec(row.attrs.href || "")?.[1];
        if (!id) return Result.Err("Gutenberg 图书链接无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(id)) continue;
        seen.add(id);
        const text = utils.text_of(row), match = /^(.*?)\s+\(([\d,]+)\)$/.exec(text);
        entries.push({ id: "gutenberg:book:" + id, title: match ? match[1] : text, link: "https://www.gutenberg.org/ebooks/" + id,
          rank: null, pinned: false,
          heat: { value: match ? Number(match[2].replace(/,/g, "")) : null, unit: "下载", text: match?.[2] || "" } });
      }
      return Result.Ok({ category, title: "Project Gutenberg · " + selected.name + "下载 Top 100", link: link + "#" + selected.section, entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new GutenbergHotRank();
export const route = {
  name: "Project Gutenberg · 热门图书", path: "/gutenberg/top/:period?", url: "www.gutenberg.org",
  maintainers: ["findrss"], example: "/gutenberg/top/day", parameters: { period: "day 昨日（默认）、week 近 7 天、month 近 30 天" },
  description: "官方 Top 100 EBooks，涵盖英语经典小说及其他公版图书；仅选指定周期图书列表，排除作者榜。保留下载数和顺序，无显式数字排名字段，rank 为 null。",
  handler: ctx => script.run(ctx),
};
