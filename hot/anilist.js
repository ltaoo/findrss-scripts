/** HOT */
import { utils } from "@findrss/util";
export const version = "1.0.0";
export const category = "动漫";
export const order = 880;
// Favicon: https://www.google.com/s2/favicons?domain=anilist.co&sz=32
export const platform = { name: "AniList", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"anilist-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAD4ElEQVR4nMWX729TVRjHP/f0lHaMjnWusm7AsmlRxIWxH0HmyroOjDHELCFRE9+IiSb4Tl74B/hK3+qLxZjgi2VR44+oUyJGDYkTiTI2UGOUBJwbQ5hxU5hr1/Zecm5v23u3W9aBK09y0t7nPPc+3/N9znnO82gHDr/I6OdfVgGHgWeBZkCyNpIGLgBHgTfaH903p4WbWpTzV4Dn1tCxG5C3gJektfJyOsfydQiYFBbt5XRuB/GMsGJ+p2SrLGX1hm4UndPQMRD5/6YIT6kAZEnOm5sbefqpg1Sur8jr5/9bYODtTzjfHEcP1mUBpBapPHcc38UxNKGVhoAVJK3r7Ivv5YXnDzn16TSnUzX8VHsAZGHFhnedCaBUESsZVAUqifdEc5/PDyk99MX2ZtWKeYt93esrefUrAkilM9y/LcKu1gdd57saq4lUlxzv1QNQEovuoSoQsFbulMb1BrFa1gaAoRvU1gTpjUWLvyw0HtlklLCMWwCQ1nV2bL+PbZFCmtB1g0Ri0WHXUwuRDWsAQApBvLfbRr/G9fl5Pvz4MweIkJ/bCoMoRn919UaiXbsd+t8nJhl65wMuTV82AeWkv/7WwyCK0d/ZvpPIvfc49GPj5xg7+yOnz4w79J1BKwz6/wTAq854bxS/35ff/YlEkpGT37OwkODrE9+aicgehic3r965KwBFf93dIbq7HrJpNf6enWX68hWaGrcwdWmaqzN/OcLQFzKoUHhXKdKV/o42GurDtrNvUBMMMvDaq3k79WzPDTuqoL0KvrtdAF7pIR572EG/Er9/HVu32Hl2JibzNITgVCYDei48y1OyujntqVq63Xx7dncUwVv8WlbS3wADdZu53vpYURv/xDie2St5EHIp/R1tO6kP1zmcqQSk68u3uBDCzIY5eSAA29s6GWloc/cuPCRHhrhruBBKaZ/3Sk86HotKaZYJOQAaw8eO8+mxLxC2QkPXMzxx8HH298XythUeg/4wjMwUuaAE6BtDDpVcQr/sbG+1TWv8e+0ag0Pv8dWJb5Beb4GtVMr87e3pNq/mnMQ2aeZpWEi6Y3DB5Cw8svQryVL72/kL/PzLr/h9PnOD5oZ6Hj1zlok/pizb7FBh2B+yfd0+TEeL7gx4pYdkIsm7739EJpONt8cjOHnqB+bm/llWZKjnP6/O8ObRQXa1tjjeCUwZyGmHefYdPc2G0WGT7dz3tHBTi7FSAXqzCqeY/VJ9TmcWrra9JK0uJc/Easqpm9m76bM6xwZNC6tXu1MyKaxGsXCzlE/M/lCoLtVqFMsJQvkaBF4XqkVWXSrwMnCxDEAmLF9HlO8bFGM7bKTs5m8AAAAASUVORK5CYII=\" data-n=\"anilist-favicon\"/></svg>" };
export const tags = ["动漫", "漫画", "英语", "日语"];

export class AnilistHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const type = ctx.params.type || "anime";
      if (!["anime", "manga"].includes(type)) return Result.Err("type 支持 anime（默认）、manga", "INVALID_PARAMETER");
      const fetched = await utils.request_json(ctx, "https://graphql.anilist.co", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "query ($type: MediaType) { Page(page: 1, perPage: 30) { media(type: $type, sort: TRENDING_DESC, isAdult: false) { id title { romaji english native } siteUrl coverImage { large } trending } } }", variables: { type: type.toUpperCase() } }) });
      if (fetched.error) return fetched;
      if (fetched.data?.errors?.length) return Result.Err("AniList GraphQL 返回错误", "UPSTREAM_INVALID_RESPONSE");
      const list = utils.array_at(fetched.data, "data.Page.media");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("AniList 趋势榜为空", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const id = utils.identity(row?.id);
        if (id.error) return id;
        if (!/^\d+$/.test(id.data)) return Result.Err("AniList 作品 ID 无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const thumbnail = utils.absolute_url(row.coverImage?.large);
        if (thumbnail.error) return thumbnail;
        entries.push({ id: "anilist:" + type + ":" + id.data, title: utils.plain_text(row.title?.native || row.title?.english || row.title?.romaji), link: "https://anilist.co/" + type + "/" + id.data,
          ...(thumbnail.data ? { thumbnail: thumbnail.data } : {}), rank: null, pinned: false,
          heat: { value: row.trending ?? null, unit: "趋势活跃度", text: String(row.trending ?? "") } });
      }
      return Result.Ok({ category, title: "AniList · " + (type === "anime" ? "动画" : "漫画") + "趋势榜", link: "https://anilist.co/search/" + type + "/trending", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}
const script = new AnilistHotRank();
export const route = { name: "AniList · 动漫趋势榜", path: "/anilist/trending/:type?", url: "anilist.co",
  maintainers: ["findrss"], example: "/anilist/trending/anime", parameters: { type: "anime 动画（默认）、manga 漫画" },
  description: "官方公开 GraphQL TRENDING_DESC 前 30 部作品，热度为 trending 活跃度，非评分或人数；优先日文标题，无数字排名。", handler: ctx => script.run(ctx) };
