/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const category = "小说";
export const order = 670;
// Favicon: https://www.google.com/s2/favicons?domain=kakuyomu.jp&sz=32
export const platform = { name: "カクヨム", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"kakuyomu-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABKklEQVR4nGNUn3TKi4GBYSvDwABvpgG0HAS2ghwwoIBpoB3Agkvi69//ODVxMzPS3gFusrw4NR199oV2Dvj69z/Y8rnBmlg1/PnPwOC7+BLDlXc/qBISTAwDDFgIKdh47Q3D9ZeoQX7/40+qpQMWQgpAlk+9+ApFjBTLYYkZlx4WYg0i18c6QhzwUKNrGvj69z9Dgo4ow+ZYPTC2luLBmrVZaOUAuAWMgzwXMI06gGHUASPdASy4JEC13oA4gJuZEVzfg6pcalc8RDkABkD1PbkVD1UcwE2ir2ENGVUhTriYpjgP+Q4gB/hpijL4a4nQPxd8JSPoYYBRfdKp/9RyBKjul+JmJakhy8JAJQBKM6AcA0u86HK4AAu1HECMZYOyJGQaDA7wHkD7vQE6UVgB6JoIXgAAAABJRU5ErkJggg==\" data-n=\"kakuyomu-favicon\"/></svg>" };
export const tags = ["小说", "排行榜", "日语"];

const periods = { daily: "日榜", weekly: "周榜", monthly: "月榜", yearly: "年榜", entire: "总榜" };
const genres = { all: "综合", fantasy: "异世界奇幻", action: "现代奇幻", sf: "科幻", love_story: "恋爱", romance: "恋爱喜剧", drama: "现代剧", horror: "恐怖", mystery: "推理", nonfiction: "随笔纪实", history: "历史", criticism: "创作评论", others: "其他" };

export class KakuyomuHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const period = ctx.params.period || "daily", genre = ctx.params.genre || "all";
      const length = ctx.query.length || "long";
      if (!Object.hasOwn(periods, period) || !Object.hasOwn(genres, genre) || !["long", "short", "all"].includes(length)) {
        return Result.Err("period 支持 daily、weekly、monthly、yearly、entire；genre 使用官网分类代码；length 支持 long、short、all", "INVALID_PARAMETER");
      }
      const link = "https://kakuyomu.jp/rankings/" + genre + "/" + period + "?work_variation=" + length;
      const fetched = await utils.request_text(ctx, link);
      if (fetched.error) return fetched;
      const parsed = utils.document_nodes(fetched.data);
      if (parsed.error) return parsed;
      const list = utils.rows(parsed.data, 'li[class^="Rankings_item__"]');
      if (list.error) return list;
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const anchor = utils.first(row, 'h3 a[href^="/works/"]');
        const id = /^\/works\/(\d+)$/.exec(anchor?.attrs.href || "")?.[1];
        if (!id) return Result.Err("カクヨム作品链接无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(id)) continue;
        seen.add(id);
        const rank = utils.field(row, '[class^="RankingWorkBox_rank__"]');
        const text = utils.field(row, 'a[href$="/reviews"]');
        entries.push({ id: "kakuyomu:work:" + id, title: utils.text_of(anchor), link: "https://kakuyomu.jp/works/" + id,
          rank: rank === "" ? null : Number(rank), pinned: false,
          heat: { value: text === "" ? null : Number(text.replace(/[★,\s]/g, "")), unit: "星标", text } });
      }
      return Result.Ok({ category, title: "カクヨム · " + genres[genre] + " · " + periods[period]
        + (length === "short" ? " · 短篇" : length === "long" ? " · 长篇" : ""), link, entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new KakuyomuHotRank();
export const route = {
  name: "カクヨム · 小说排行榜", path: "/kakuyomu/rankings/:genre?/:period?", url: "kakuyomu.jp",
  maintainers: ["findrss"], example: "/kakuyomu/rankings/all/daily",
  parameters: { period: "daily（默认）、weekly、monthly、yearly、entire", genre: "all（默认）、fantasy、action、sf、love_story、romance、drama、horror、mystery、nonfiction、history、criticism、others", length: "查询参数：long 长篇（默认）、short 短篇、all 全部" },
  description: "读取官网第一页榜单，保留作品大整数 ID、明确排名及总星标数；星标不是榜单计算得分。",
  handler: ctx => script.run(ctx),
};
