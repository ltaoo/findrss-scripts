/** HOT */
import { utils } from "@findrss/util";

export const version = "1.0.0";
export const category = "视频";
export const order = 700;
export const platform = { name: "YouTube", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"youtube-platform-icon\"><rect width=\"32\" height=\"22\" y=\"5\" rx=\"5\" fill=\"#ff0033\" data-n=\"youtube-icon-rect-1\" /><path fill=\"#fff\" d=\"m13 12 8 4-8 5z\" data-n=\"youtube-icon-path-2\" /></svg>" };
export const tags = ["视频", "英语", "日语"];
export const config_schema = { type: "object", additionalProperties: false, properties: {
  api_key: { type: "string", title: "YouTube Data API Key", description: "需启用 YouTube Data API v3；密钥仅放请求头，不放 URL。", writeOnly: true, default: "", maxLength: 256 },
} };

// Source: https://developers.google.com/youtube/data/docs/videos/list
export class YoutubeHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const region = String(ctx.params.region || "US").toUpperCase(), category_id = ctx.params.category || "0";
      if (!/^[A-Z]{2}$/.test(region) || !/^\d{1,3}$/.test(category_id)) return Result.Err("region 使用 US、JP 等两位地区代码；category 使用 YouTube 数字分类 ID，0 为全部", "INVALID_PARAMETER");
      const api_key = ctx.config.api_key.trim();
      if (!api_key) return Result.Err("请在脚本配置中填写已启用 YouTube Data API v3 的 api_key", "INVALID_PARAMETER");
      const fetched = await utils.request_json(ctx, "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=50&regionCode=" + region + "&videoCategoryId=" + category_id,
        { headers: { "X-Goog-Api-Key": api_key } });
      if (fetched.error) return fetched;
      if (fetched.data?.error) return Result.Err("YouTube API 拒绝请求，请检查密钥、配额及地区/分类支持", "UPSTREAM_INVALID_RESPONSE");
      const list = utils.array_at(fetched.data, "items");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("YouTube 未返回热门视频", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const id = row?.id;
        if (typeof id !== "string" || !/^[A-Za-z0-9_-]{11}$/.test(id)) return Result.Err("YouTube 视频 ID 无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(id)) continue;
        seen.add(id);
        const thumbnail = utils.absolute_url(row.snippet?.thumbnails?.medium?.url || row.snippet?.thumbnails?.default?.url);
        if (thumbnail.error) return thumbnail;
        const text = String(row.statistics?.viewCount ?? "");
        entries.push({ id: "youtube:video:" + id, title: utils.plain_text(row.snippet?.title), link: "https://www.youtube.com/watch?v=" + id,
          ...(thumbnail.data ? { thumbnail: thumbnail.data } : {}), rank: null, pinned: false,
          heat: { value: text === "" ? null : Number(text), unit: "播放", text } });
      }
      return Result.Ok({ category, title: "YouTube · " + region + " · 热门视频", link: "https://www.youtube.com/feed/charts?gl=" + region, entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new YoutubeHotRank();
export const route = {
  name: "YouTube · 热门视频", path: "/youtube/hot/:region?/:category?", url: "www.youtube.com",
  maintainers: ["findrss"], example: "/youtube/hot/US/0", parameters: { region: "US（默认）、JP、GB 等地区代码", category: "官方数字视频分类，默认 0；如 10 音乐、20 游戏" },
  description: "官方 videos.list mostPopular 前 50 条，需配置 API Key；当前榜单侧重音乐、电影和游戏，非已下线的旧 Trending 全站榜。保留累计播放数，无数字排名字段，rank 为 null。",
  handler: ctx => script.run(ctx),
};
