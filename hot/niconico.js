/** HOT */
import { utils } from "@findrss/util";
export const version = "1.0.0";
export const category = "视频";
export const order = 730;
// Favicon: https://www.google.com/s2/favicons?domain=www.nicovideo.jp&sz=32
export const platform = { name: "ニコニコ動画", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"niconico-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAB9ElEQVR4nO1Xv2sUQRj9vhmWaBoJqTyIhZjZHS5XyNr5B1hqqU1SJUQbS+2MnRZpFbXSRkstLWKRxggGq+P25sQqYCVa+YPbuSffMQdHkJ1TMWuxr9j5wXvfezPswAxTBMaY00R0SWv9tNfrfaQZYK096b2/QkTPnXMfqrgqVgzAfQDbZVnuWWuXZzBfLsvyjWgA3IvxVYzAzK9D95T3ftdau1JhviIcIloK2r1ofYoAABtjZCWboegnpdSFoij2p3lZluWj0eglgMXxypR6UBTFVWbG3+4ABoOBFNoOgRa996/SND0/4Uhf5ibmwu33+5sx8zGXfgPGmC0At8LwKzNfDKFeENF8ML/tnNuatSbLp91unxkOhzfEI7YrAM4R0bEw/BHaudB+Z+a3Ec8REbkkSe52u933HI5MF8ACHSGY+bPWuq2895eP2lwgnuKtJkemJixFT8G/hmoCUBOgZqgmADUBaoZqAlAT4D8IcFCj/4Fi5mdyP6vB/MvYW3pZlhnv/U1mllvxeA7AcSI6e1jFzPtTt+HDmAOQ/2L+HTN/C30AcFrrO0VRuMp3gTHmMYDVKfNHzrmNiOYhgPUpzRPn3Nof/YRJkqwzs7z1pNBOq9W6VsUXCEe4QbMrNWKaSnQ6nYU0Ta/neX5iVo1wRSPaGPknon/D6UfiaEYAAAAASUVORK5CYII=\" data-n=\"niconico-favicon\"/></svg>" };
export const tags = ["视频", "排行榜", "日语"];

export class NiconicoHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const link = "https://www.nicovideo.jp/ranking";
      const fetched = await utils.request_text(ctx, link);
      if (fetched.error) return fetched;
      const parsed = utils.document_nodes(fetched.data);
      if (parsed.error) return parsed;
      const data = parseJSON(utils.attribute(parsed.data, 'meta[name="server-response"]', "content"));
      if (data.error) return data;
      if (data.data?.meta?.status !== 200) return Result.Err("Niconico 榜单请求未成功", "UPSTREAM_INVALID_RESPONSE");
      const list = utils.array_at(data.data, "data.response.$getTeibanRanking.data.items");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("Niconico 综合榜为空", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const id = row?.id;
        if (typeof id !== "string" || !/^(?:(?:sm|so|nm)\d+|\d+)$/.test(id)) return Result.Err("Niconico 视频 ID 无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(id)) continue;
        seen.add(id);
        const thumbnail = utils.absolute_url(row.thumbnail?.middleUrl || row.thumbnail?.url);
        if (thumbnail.error) return thumbnail;
        entries.push({ id: "niconico:" + id, title: utils.plain_text(row.title), link: "https://www.nicovideo.jp/watch/" + id,
          ...(thumbnail.data ? { thumbnail: thumbnail.data } : {}), rank: null, pinned: false,
          heat: { value: row.count?.view ?? null, unit: "播放", text: String(row.count?.view ?? "") } });
      }
      return Result.Ok({ category, title: "ニコニコ動画 · 综合排行榜", link, entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}
const script = new NiconicoHotRank();
export const route = { name: "ニコニコ動画 · 综合排行榜", path: "/niconico/rank", url: "www.nicovideo.jp",
  maintainers: ["findrss"], example: "/niconico/rank", parameters: {},
  description: "读取官网 server-response 中的综合 Teiban 榜，保留上游顺序和播放数；数据无显式数字排名字段，rank 为 null。", handler: ctx => script.run(ctx) };
