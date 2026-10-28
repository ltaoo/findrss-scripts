/** HOT */
import { utils } from "@findrss/util";

export const version = "1.0.0";
export const category = "社交";
export const order = 710;
// Favicon: https://www.google.com/s2/favicons?domain=www.tiktok.com&sz=32
export const platform = { name: "TikTok", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"tiktok-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADfklEQVR4nO2XW2hcVRSGvznnzCXpJJlkMp0pmqlJvYyTxJIWQaWCF2hrTKpgAw3WC4oRsfigCCqIL0URCuZBQbw8eKkgpYIliq2lLaZNC7U6LYb4UEkjSe1MbmN1Opcz5yyZS2LSMmNmElvB/rA5bNY+a/1777XXv7cFMAELVwjKlQp8lcB/hoC2mJ/Vqio83Y+wzO3GIkL06z6mToWyWV0KTEDKaepyr9y976B8F4vLyZQu/W9/JHfa60ryobBI2EVoddi4xaqxrmM9HcG2y58DZmYuGaz0sfmV52lx+y4vgbloeqidHe+/y6q2NWC18q/nwMa9B2QybcjFCI2OybbPPpdA54Niw1LMD0tGwIwnRUxzlkRaRH755Et5wukv6ENb0BplxMLuwNrQgOb1Ickk8dAJRGY2PwfjSIizgz/j7r6fZR43amZLbBX4tYqCfrV/jKwoOO9Yh6drC4E1a2lb4WXFuQintj7Fzlh4/tDf/+SL7Tv4/tMP2LbxAYLNzVSGTheVOq3orDWNuocf5eaeZ3j8hiY6XNV4rRpodgZq/Oy+MJ7bxJnxikLCMNh5vJ9vjg/Q6nDRZHMylDpfHoHqDe00P/scr924intqnH8bDOOS5Z8lkZ/tJAaHEpPZVgxaQUN9Pb6tj9HT6M8FN0yM/h/Q9x4lOjJKZHoKcwluEVohg6N1Natbmml3VWf76a/6GXv5Ld4ZOcm+xAQTohOrdy36JqMVMtgbm7i1rpZaTYWkTnL3fnpHQvTGRmbHqPMyoDwoBQ1WK9fYbblOOs1UNMr+xMRFg9TsKZlFOp0vLUtAQI9EMA0j16msQG25HtM0L1mljBRr+ajmuUkSaX1pCMQGf2I4nD/nFvD2dLFhUyc4HGC1YQ8E8Tz5NLct91ClqpDSSf44xBn9QkkECpdiVZV7X39TpuaU1sj0tLy6p0/u+vBjWX/wiGz/9ayMp/SszTgcktPBTRK0Okst6RTUAkeDX947cGieyGTojBumhPV0ttZng4+GJd71orzhCohSXHhKF6NrbwpI354+EX0m3Fw2phgnhiS+5SXZ5VkrPtVesqBZFvIw8dXU8kLnZrrv68TXuBJVUZDfJkgOhBj79jC7zgzS+8cwYSNJqbAs9GWUydagrZrba7xcZ61EkjrD8fMcS0UZSscwy6wJlqtPM/7vBLT8d/GqUib+AqIQHtjiGsXRAAAAAElFTkSuQmCC\" data-n=\"tiktok-favicon\"/></svg>" };
export const tags = ["短视频", "话题", "英语", "日语"];
export const config_schema = { type: "object", additionalProperties: false, properties: {
  advertiser_id: { type: "string", title: "TikTok Advertiser ID", default: "", pattern: "^\\d*$", maxLength: 32 },
  access_token: { type: "string", title: "TikTok Business Access Token", description: "需获得 Discovery API 权限。配置按脚本元数据保存，请仅向受信管理员开放后台。", writeOnly: true, default: "", maxLength: 4096 },
} };

// Source: https://business-api.tiktok.com/portal/docs?id=1825119032526849
export class TiktokHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const country = String(ctx.params.country || "US").toUpperCase(), days = ctx.params.days || "7";
      if (!/^[A-Z]{2}$/.test(country) || !["1", "7", "30", "120"].includes(days)) return Result.Err("country 使用 US、JP 等地区代码；days 支持 1、7（默认）、30、120", "INVALID_PARAMETER");
      const { advertiser_id, access_token } = ctx.config;
      if (!advertiser_id || !access_token.trim()) return Result.Err("请在脚本配置中填写 advertiser_id 和具有 Discovery API 权限的 access_token", "INVALID_PARAMETER");
      const fetched = await utils.request_json(ctx, "https://business-api.tiktok.com/open_api/v1.3/discovery/trending_list/?discovery_type=HASHTAG&advertiser_id=" + advertiser_id + "&country_code=" + country + "&category_name=ALL&date_range=" + days + "DAY",
        { headers: { "Access-Token": access_token.trim() } });
      if (fetched.error) return fetched;
      if (fetched.data?.code !== 0) return Result.Err("TikTok Discovery API 拒绝请求，请检查令牌、广告账户及接口权限", "UPSTREAM_INVALID_RESPONSE");
      const list = utils.array_at(fetched.data, "data.list");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("TikTok 未返回热门话题", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const id = utils.identity(row?.hashtag_id);
        if (id.error) return id;
        if (!/^\d+$/.test(id.data) || typeof row.hashtag_name !== "string" || !row.hashtag_name.trim()) return Result.Err("TikTok 话题 ID 或名称无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const name = row.hashtag_name.replace(/^#/, "").trim();
        if (!name) return Result.Err("TikTok 话题名称为空", "UPSTREAM_INVALID_RESPONSE");
        entries.push({ id: "tiktok:hashtag:" + id.data, title: "#" + name, link: "https://www.tiktok.com/tag/" + encodeURIComponent(name),
          rank: row.rank_position == null || row.rank_position === "" ? null : Number(row.rank_position), pinned: false,
          heat: { value: row.posts ?? null, unit: "周期内投稿", text: String(row.posts ?? "") } });
      }
      return Result.Ok({ category, title: "TikTok · " + country + " · " + days + " 天热门话题", link: "https://ads.tiktok.com/creative/creativeCenter/trends?region=" + country, entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new TiktokHotRank();
export const route = {
  name: "TikTok · 热门话题", path: "/tiktok/hot/:country?/:days?", url: "www.tiktok.com",
  maintainers: ["findrss"], example: "/tiktok/hot/US/7", parameters: { country: "US（默认）、JP、GB 等官方支持地区", days: "1、7（默认）、30、120" },
  description: "官方 TikTok Business Discovery 热门话题榜，需广告账户和获批的 Discovery API 令牌；保留 rank_position 与周期内投稿数，未知为 null。非个性化 For You 推荐流。",
  handler: ctx => script.run(ctx),
};
