/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const category = "科技";
export const order = 630;
// Favicon: https://www.google.com/s2/favicons?domain=dev.to&sz=32
export const platform = { name: "DEV Community", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"devto-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEPElEQVR4nMVX2yv8WxT/zJ4xJuZJSj8d4jgPimKIXOJh8KJolAcPU554UOI/4NWDP8GDvEiSNx0pd1FDwzlScikPGoPJNYwx+7QW+2vP19dxbnOs2u3Za629P2uv23cPAPwAsApAAoi/zckcCiMI4GcA+FUIIYUQL/8DOA/CIkwA2zYAD0IIF1kSj5NxySchxBtcXJABUQAp+B6S4itwm41s/OfyL/RtZADFImlEgH9mpCCd/xpQJyklj8/IYWbY7faEtTkx3xIoAVAB0OxwOHgPDcVXXqBhPs9G+5TVVpbqNzLLFbh5NsvJ6M8qzKEUSSErKwvt7e14eXlBLBZj/v7+PpaWloyD3W432trakJ6ezjq0j37PzMzg8vISfr+f+VNTUzg7OzPAS0pK0NDQgIuLC4yPjyMajb5fzG63c4OoqamRRPF4XOo0PT0tnU4n64yMjCTIlH5vb690u93Guru7m/VdLhfPExMTzN/Z2UlsStDcRZbTTR8eHrC5uYlgMMjr1tZWDA4Osp7H42HewcEBVldXsba2hr29PYRCIdzd3WFubo7Pqqur4/np6QkpKSkoLS3l/ZOTkzwT74MHKisr+QZXV1cyMzOTWqYcGhpiXjAYZJ35+Xle9/T0UO6wjppJPjAwwPKjoyPj9h6Px/CW1+uVOqawzAxKDoeDb7qysvLRYinx/PzMs0ouVT0LCwvMz8/P57gT1dfX80xeIs/qCS0+M4AOJCWXy5VQDWQI/a6oqEBTUxMP0qPwEW1tbeH09JR/19bW8uz1enkOBAK4vr7mM5ThwgpcP1Dn6dTV1YXZ2VmMjY0ZcjqY8oCAaF1dXc2y8vJywztEekkKKwOodPTeoGpceYLWdMuTkxNsb29/MJSASK+oqAiNjY3Izs5m2fLyckLPsDRAAVIOqLUOTrEnGh4eRl5eHnw+H4eLjKb+QbS4uMj7cnJy0NfXx/uOj48NY/X2LMwGKLCbm5tX5fh7O9W9cXt7a5QsAZNb1d7d3V32DjWt5uZm1ttY3+CSJEP1cDqsPEA3ojqORCLo6+9jfjgcTkjOwsJCFBcXIyMjgw04PDzkLHc6ndzl1tfXkZubi8fHR6SlpWFxafHDh8oIs6rhqqqqhC6o/25paWGdQCAgrYg6IfUDVfsdHR0J+wsKCtRzjGfSVU8Bg1lWVibv7+9lJBKR5+fnPKgB+Xw+o3X6/X5DHg6HZSgUkrHnmOzs7ExoMDRGR0dlNBqV/f39hkwDfjUEb19Dciu5j9xlZKgQHAYVFtV4KLapqanvtSwElx/FWK1VnOlDRTKz641PNbQXkflzqojqW/UFPRmtElh/A+g5pSrEYo+NQvQhMfSktEqcz+R/lxxmxlcH/ltAM4lkP0r/igG27zYg9o34kg2gsjG/dpNJb3hx9cfk9cUBWNdJcojACft3KqufAGx8w9/z3wD88gcuMl4IN9ggRQAAAABJRU5ErkJggg==\" data-n=\"devto-favicon\"/></svg>" };
export const tags = ["社区", "编程", "英语"];

const periods = { day: { days: 1, name: "日榜" }, week: { days: 7, name: "周榜" }, month: { days: 30, name: "月榜" }, year: { days: 365, name: "年榜" } };

export class DevtoHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const period = ctx.params.period || "week";
      if (!Object.hasOwn(periods, period)) return Result.Err("period 支持 day、week（默认）、month、year", "INVALID_PARAMETER");
      const selected = periods[period];
      const fetched = await utils.request_json(ctx, "https://dev.to/api/articles?top=" + selected.days + "&per_page=30");
      if (fetched.error) return fetched;
      const list = utils.array_at(fetched.data);
      if (list.error) return list;
      if (!list.data.length) return Result.Err("DEV 热门文章列表为空", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const id = utils.identity(row?.id);
        if (id.error) return id;
        if (!/^\d+$/.test(id.data)) return Result.Err("DEV 文章 ID 无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url(row.url, "https://dev.to/");
        if (link.error) return link;
        const thumbnail = utils.absolute_url(row.cover_image, "https://dev.to/");
        if (thumbnail.error) return thumbnail;
        entries.push({ id: "devto:" + id.data, title: utils.plain_text(row.title), link: link.data,
          ...(thumbnail.data ? { thumbnail: thumbnail.data } : {}), rank: null, pinned: false,
          heat: { value: row.public_reactions_count ?? null, unit: "互动", text: String(row.public_reactions_count ?? "") } });
      }
      return Result.Ok({ category, title: "DEV Community · " + selected.name, link: "https://dev.to/top/" + period, entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new DevtoHotRank();
export const route = {
  name: "DEV Community · 热门文章", path: "/devto/top/:period?", url: "dev.to",
  maintainers: ["findrss"], example: "/devto/top/week", parameters: { period: "day、week（默认）、month、year" },
  description: "官方 Forem API，读取按受欢迎程度排序的前 30 篇文章；热度为 public_reactions_count，排名为 null。",
  handler: ctx => script.run(ctx),
};
