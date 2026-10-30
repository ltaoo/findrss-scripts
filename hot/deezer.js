/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";
export const version = "1.0.0";
export const category = "音乐";
export const order = 870;
// Favicon: https://www.google.com/s2/favicons?domain=deezer.com&sz=32
export const platform = { name: "Deezer", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"deezer-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADHUlEQVR4nL1XS1LbQBB9PYgKWaQiThDnBHFWCDYRJwCWWUDgBPgGJifAnACwi8qScIKYVbzD3EA5AaIqSVEETad6NBKyLBlJuHgLGEndPf36N2NCCQYedxnYXQTWP48oQAN887j1D/gBwtHOT+oVyagyZdkcQOuB0EFDREBXbADonvvsFsk4U6wJtwQEzEZRHPkCoGPYEK4WGR/LImJkGFdE2Noe0VADvmXj/v4Lv++xC4KbjYYzxZoBTbigx5fu8Rq3I419Wd/HkTkocuCe0CHAFafP1jiMdEzCYAE+GBsAJBK9qRScrXHbhqulgE9Zwwsa7YSNio0UItUjbGobwZRHrNdKCKU65zY3WQVmpAKxPZOGOCWEdlk+Uz2GazfMopUllKydP3c47K/ytWa4adjzhjPKgvDePI8HK7wvNbMzohOJYKQnlDbF8zJ7fY93idB2hBEDyyAE8qUEEw4Ig77HomdyOfA4EAITGpR7zkDF3zYkYsr80XgnYUNVkImWpCVBl7MF9wSY8dbsR3BNEfIMbwsZMD5w0mJxSH1S1R2wOqYglTwQI6yjrCW/eYOMfTSAAyAA1XNgVn4rmyCMoRE6DFySOFCnBuYAzbiWfR0NHGg2ldmZ0QVzBRFuo1fo4Q6us2fnen+FJRUvAs0I94YkaQ8fT8O6dfAMKI1xuoZFBAxfyoEHB+lpStkPpyt8o+QopsmzYF4gYCj9vzOi94XHMSl8NW3JOMyP3zlAiF1wrtuoSHKwyuecHTYyqJ7Z+8J+e0Trla5kmnE9NTTqgvF9wiZwWSSmSl6mBUmMcZnyzP3JkAiKbD7pwPaIhokyE47kjljXAZlyDJzax8DarOaAIIqwBeBELhuNHJDILaEnBKytYjlUwLHP7sIdbqxGyNowzF9AJt6/WcLyVjztZkJVccCOzSBhptR0REgjULZYRabK5pUdECT5lP/5LhFohV/MuDAyNbpGVRXUwIm0loxsYVjU59HrVEYGWiUQGmDgsc/ym2/S0HpZpc/dgeTcyBRikJ3vdaCaKBkQjpJlpt9fzgHpcWEuY9quG+E/I3BS3T0zVRUAAAAASUVORK5CYII=\" data-n=\"deezer-favicon\"/></svg>" };
export const tags = ["音乐", "排行榜"];

export class DeezerHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const fetched = await utils.request_json(ctx, "https://api.deezer.com/chart/0/tracks?limit=30");
      if (fetched.error) return fetched;
      const list = utils.array_at(fetched.data, "data");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("Deezer 歌曲榜为空", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const id = utils.identity(row?.id);
        if (id.error) return id;
        if (!/^\d+$/.test(id.data)) return Result.Err("Deezer 歌曲 ID 无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const thumbnail = utils.absolute_url(row.album?.cover_medium);
        if (thumbnail.error) return thumbnail;
        entries.push({ id: "deezer:track:" + id.data, title: utils.plain_text(row.title), link: "https://www.deezer.com/track/" + id.data,
          ...(thumbnail.data ? { thumbnail: thumbnail.data } : {}), rank: row.position == null ? null : row.position, pinned: false,
          heat: { value: row.rank ?? null, unit: "流行度评分", text: String(row.rank ?? "") } });
      }
      return Result.Ok({ category, title: "Deezer · 热门歌曲", link: "https://www.deezer.com/channels/charts", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}
const script = new DeezerHotRank();
export const route = { name: "Deezer · 热门歌曲", path: "/deezer/chart", url: "www.deezer.com",
  maintainers: ["findrss"], example: "/deezer/chart", parameters: {},
  description: "官方歌曲榜前 30 条：position 为名次，rank 是流行度评分，不是播放量或名次。", handler: ctx => script.run(ctx) };
