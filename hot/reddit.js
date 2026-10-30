/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";
export const version = "1.0.0";
export const category = "社交";
export const order = 840;
// Favicon: https://www.google.com/s2/favicons?domain=www.reddit.com&sz=32
export const platform = { name: "Reddit", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"reddit-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAE9UlEQVR4nLVXbWhbVRh+7s1Hky3JsqXfXdvVWqpGgmIHgij+WDBoNnBQ/MBJ/eFK55/tl8X6DYoTcTKwZRYEqbjKhsqaQaCxPxR1ulZpR1rm0G5zW+fa2iwma5ImufKec+/Nvc1Hm7k98LYn533P+5zznve851zhsf1+rBfBcOBJAF4AHQDaADhlVQTALIBTAEZ9bv/X6/UprDWB4EzAjiw+AfA0ysMwgF6f23+hlJFYkjwc6EcW0ZsghzzmPPNRbgSCfNUXNSFeP5YBJOS2HYCRtSIQ0eS72//vmhEIhgPN8qrLJ18CMju7kT0yxkSqrwLSTOMkn8x3qQgE+cqJvHykgcXOd+DqeUXXndpphzkeUyJBS3ZoIyHqrHnYbwqDiQa89uMZnJ9f0vVnXjgMrBTnEJWGnCxlhT1VYcPFeSvMv23FcHwDfC2trD8pSarc+Htu9TCnNjFFmZz2pgdlwpyM4c5LLnzcJuFb1zk8Ef2Z9c8tRJjM/HEJrmN9gDVvaA/bbuQi8F5ZzJRYaWAw1oCH66140XKZdRsmQmg+0I548ATsxwdw396m4j54bYGSGvnnnGdvzoJ+y6mTqrXB0Pog8MsM2j0PIONqhmE6xPTC2Xm4z3YBFvCVy5NV/eRAnM8IkhdUXr9afY4zD+3gq/ohxP5L7VVY7hqA8IgfVnNFwUUtp5KQvgvAcvRtiFNTrE/nR5lUDrshedEveSEx6YCUPtgtaXEjmZAyE2NSuaAxNFYL5rtD5uLSTxH4FcD9FKaMZwcMH43idiKz3wvDVEjZktOUhC2sSfv3vL6I3A4wjlxBbhO1Zz+6qYad3UIID33GZC2UsiPfxKGBU1cJzbMzyK6kWDJpJ3Li9Vdh/7AHd018jsWBd4uSk859uAvNMyfZGC0x+STfxKGFIHnpCoGTciDb4sGZt0Kod9pgM4sQTWZUCAJO1wrY7gGyjR6kr/0J80jepZar+8kYs5s4OYXtV3k1JETjCVyJxODpdUO4Mq/ekiKAc6xpBMTfp3DvB88ivszvU5oxOaips0KqroKQnIOx+o6iESCdYkdjFB8k5JN8CxdUcsIsTWBc/Wnl57Xm+28QS2VVB47j44g3PYqsZzdi7/O6UAikIxuypTHabayeHOO1QF8HThUsRHSn/7PvkNqlbIcSystXF5CILuo8WRwuNNRWwrHRok5cWQRhS/8BGEaO5BUigd4DwXBAn/rLwOTRa9hUwWO10cqdknOLaEIpJLIrbJIKlO3c9vgWYLPe1uf2C6LmAalDa/9LuJ5MMyEnJOT4p4ncjpkq65goIB3ZKPYkNL7yUDcvw3owTpE1RezVqayAbfQYto4Msp+R6zEmFPraxmZG1PNcJ1YW5phQm/pIR5mu2BM5+SBfBa7kXvqjPsnkR4L+TbAExLydmN5zEGaTEakV5YoEKuw2dYuISEokVL1ie8/Qy5x8VegBDPjc/n26CciT4DVBC7odTfy995d3DwSLhZEVgqJrHB2C64s+NZqrEPG5/eqUjDqViKa8R6nsgBy6Pu1D1uPBUsdT2FBTB8nh4MTRKHt6bR7/kl/D+deunqPUd0Gw0FZoQVFWHpkUCG1ymQo+PLTYtvpLyagjnw68sebb0KgZVWyV+Sj6YWLUkUt4E7ceasIVgpGRhwO7gFtOPkzHu9Cq8yYAYPJ/ktHnOV1qVKXK+jz/D36OnOZXJhNmAAAAAElFTkSuQmCC\" data-n=\"reddit-favicon\"/></svg>" };
export const tags = ["社媒", "社区", "英语"];

export class RedditHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const subreddit = ctx.params.subreddit || "popular", sort = ctx.params.sort || "hot", period = ctx.query.period || "day";
      if (!/^[a-zA-Z0-9_]{2,32}$/.test(subreddit) || !["hot", "top", "rising"].includes(sort) || !["day", "week", "month", "year", "all"].includes(period)
        || sort !== "top" && ctx.query.period) return Result.Err("subreddit 使用版块名称；sort 支持 hot、top、rising；period 仅 top 支持 day/week/month/year/all", "INVALID_PARAMETER");
      const link = "https://www.reddit.com/r/" + subreddit + "/" + sort + "/";
      const fetched = await utils.request_json(ctx, link.slice(0, -1) + ".json?limit=30&raw_json=1" + (sort === "top" ? "&t=" + period : ""),
        { headers: { "User-Agent": "findrss-worker/1.0 (HotRankScript)" } });
      if (fetched.error) return fetched;
      const list = utils.array_at(fetched.data, "data.children");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("Reddit 榜单为空或未开放访问", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const item of list.data) {
        const row = item?.data;
        if (item?.kind !== "t3" || typeof row?.id !== "string" || !/^[a-z0-9]+$/.test(row.id)) return Result.Err("Reddit 帖子数据无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        const score = row.score;
        const thumbnail = /^https?:\/\//i.test(row.thumbnail || "") ? utils.absolute_url(row.thumbnail) : Result.Ok("");
        if (thumbnail.error) return thumbnail;
        entries.push({ id: "reddit:post:" + row.id, title: utils.plain_text(row.title), link: "https://www.reddit.com/comments/" + row.id + "/",
          ...(thumbnail.data ? { thumbnail: thumbnail.data } : {}), rank: null, pinned: row.stickied === true,
          heat: { value: typeof score === "number" && score >= 0 ? score : null, unit: "得分", text: String(score ?? "") } });
      }
      return Result.Ok({ category, title: "Reddit · r/" + subreddit + " · " + sort, link, entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}
const script = new RedditHotRank();
export const route = { name: "Reddit · 社区热门", path: "/reddit/r/:subreddit?/:sort?", url: "www.reddit.com",
  maintainers: ["findrss"], example: "/reddit/r/popular/hot", parameters: { subreddit: "popular（默认）、news、worldnews 等版块", sort: "hot（默认）、top、rising", period: "查询参数，仅 top 使用：day（默认）、week、month、year、all" },
  description: "公开 Listing JSON，服务端 IP 可能被 Reddit 拒绝，未提供 OAuth 流程；只在允许访问的环境使用，403 会报错而不输出空榜单。", handler: ctx => script.run(ctx) };
