/** HOT */
import { utils } from "@findrss/util";
export const version = "1.0.0";
export const category = "社交";
export const order = 850;
// Favicon: https://www.google.com/s2/favicons?domain=bsky.app&sz=32
export const platform = { name: "Bluesky", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"bluesky-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADXUlEQVR4nOVXTYgcRRh97+uZDZhddzubRdGbG7yKyBJi0CAKRsSbBxHNRXEhinrT7GywMe5MNCJB8A9E8Q9lFQ/CJogYTDAejAhGCRFzykHE7M6MSSRmerpeqHZ32ZlMZ7pD9qLvUExXfd97r6q6vuoB/u+gb9a/qCGX4AEAwyQOLuzgkdUQG61pQsIWCM0gxienIp4t+YGkrf0ANvvfEhDOuMNOfPqvaf5wpYSd017ndOtSX7uMbQBu59U1bQicfuuRlxCq1mOLENFdlnIkC8vueYDPAgi6h51x3Ey4PiM9ELgzLGnumj1aW1R7LNJgWNY+gJVe4h6W4DoLgH8uyURsbbX09UikkbziwzWFcVkHANx9qTgLcN4INHJwbmRZ+/ys+gX6GHPaT2CiX2wMNKzVwjzyYVO7rFnMqudypphV0C7pU284D6Gdx7ydfi5dgXZOE/esO+FeyRoMT7i9fstycsXNiE0DKQCnciZB4pPhjB68SHxGD0F8Ii8PgD99Y74h8HuBRG/jzeFdGl968kcZ0BuFGBY1bfH5ZDEDGDLTe345/FkPnN4H0PcF7UKqWUrdSL+CaVUugs3hDCZRSiexqWgyvSYWDYD2MSBfrYqy7Fq6T4rnek38uwWNCo8KeucyaNb7Ul80SdDbjQp/WTbg0Ryy7aBSV6sK6qPmkC2fFnaPr6tpqxI9DuIOAIXvgAz8DeAAwdfqFX7Z4QcZGNmtm+jcoxDvAnADgIGCov6OOU7pi9js1TNTXOgVxO6O0ao2OmkPgNtw5XCO0Ev12KqI2Mo0MFzTLeZ0GMAarA7mGlO8b7H6ouMlTN04t72geFzgHvG4d/QF3LmywzoMCOWC5fQbAN8VyXHEjZkGZPZVETKKn4OcK5IDw88dHFiJt1QO53UMwIYcVHES89qBAGOJ6XguceGnRoU3Z74DmGQs8RG/Un3JqM9OR6zP76Sv6T/mMWzgYyvFLzbgK+I0D5F8pu9cZLuXvZCv91MXObkwze+7+61XcH2KL0OqZrOltfzocvwo/HWctQ3nAD7cnOK7vQYtS6MxHVSIdDvOdg0dXHuVPdXRM8mYCe+H8EdX7CEmnGhU+GGWDtEHg1WNDQjbBDcu2pFmCx8gYjvrczwQvJFBGr5drb94+E/hAiJqPrMj07lNAAAAAElFTkSuQmCC\" data-n=\"bluesky-favicon\"/></svg>" };
export const tags = ["社媒", "话题", "英语", "日语"];

export class BlueskyHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const fetched = await utils.request_json(ctx, "https://public.api.bsky.app/xrpc/app.bsky.unspecced.getTrendingTopics?limit=25");
      if (fetched.error) return fetched;
      const list = utils.array_at(fetched.data, "topics");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("Bluesky 未返回趋势话题", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        if (typeof row?.topic !== "string" || !row.topic.trim()) return Result.Err("Bluesky 趋势话题无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(row.topic)) continue;
        seen.add(row.topic);
        entries.push({ id: "bluesky:topic:" + row.topic, title: utils.plain_text(row.displayName || row.topic),
          link: "https://bsky.app/search?q=" + encodeURIComponent(row.topic), rank: null, pinned: false, heat: { value: null, unit: "热度", text: "" } });
      }
      return Result.Ok({ category, title: "Bluesky · 趋势话题", link: "https://bsky.app/", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}
const script = new BlueskyHotRank();
export const route = { name: "Bluesky · 趋势话题", path: "/bluesky/trending", url: "bsky.app",
  maintainers: ["findrss"], example: "/bluesky/trending", parameters: {},
  description: "官方 AppView 公开 getTrendingTopics；只展示 topics，不混入 suggested。接口属于 unspecced，结构可能变化；不补造排名或热度。", handler: ctx => script.run(ctx) };
