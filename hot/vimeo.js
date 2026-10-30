/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const category = "视频";
export const order = 740;
// Favicon: https://www.google.com/s2/favicons?domain=vimeo.com&sz=32
export const platform = { name: "Vimeo", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"vimeo-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACGklEQVR4nGMUkVL4zzCAgGkgLR91wGgIjIYACLAQnV94+BgYTewZGJiZGf4f3s7A8OsnVmWMCmoMjI6+DAzcfAz/715j+L9rLQPD3z8UOICZhYExKJGBKSoH7AgQ+C+nzPBvfi+GUqbEYgbG8AywHrBjQGoV1Bj+TW8msyBiY2dgbpzJwJRWBbccbLCVK4ZSxugcBkaQI6GWw8UdfPFawYTX8rppDAzmTphysspgebglyloMTLH52M3hFyTPAYxWbgwMqroMDO9eY48WkCNgat2CGf4f2409XTy+S54D/h/bxfA3yorhb6wtdkcoqMGZoDj+15TF8H/vBkxzzh0lzwEMIN+AUu+vnwz/D2zGkGaUQ4QAHCClE7gDQLmALAcggf/nMX3BqG2CKsDGzsBoaI0iBMquoKxIuQPOHcWMX01DlBTP6B+HGgKgkMOT/UhyAAPIcvRQQPIxo6gkpJxAAv+m1DP8f/2cSg5gYGD4d/EEpuaIDHA+Z+pfher7iycY/m9fSZS5jMQ2yUDZjmneHsIKXz5h+JvhzcDw5RNRDmAiShUoHYDy88sn+BV9+cTwrzKBaMtJcgDYESf24Zb89ZPhX2sexKEkACaSHLBlKfaaDeTz+nSG/2cOkmQ56Q54cIvh3+KJqILXzzP8ywsiy3IQIDoRomhS1mJgUNNlYLh1mWBBQxMHUBMwUdW0UQeQAZgYBhgwjXgHAAByoKQ60ncUywAAAABJRU5ErkJggg==\" data-n=\"vimeo-favicon\"/></svg>" };
export const tags = ["视频","英语"];

export class VimeoHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const fetched = await utils.request_text(ctx, "https://vimeo.com/channels/staffpicks/videos/rss");
      if (fetched.error) return fetched;
      const list = utils.feed_items(fetched.data, "https://vimeo.com/channels/staffpicks");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("Vimeo 未返回内容列表", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        entries.push({ id: "vimeo:" + row.id, title: utils.plain_text(row.title), link: row.link,
          rank: null, pinned: false, heat: { value: null, unit: "热度", text: "" } });
      }
      return Result.Ok({ category, title: "Vimeo · Staff Picks 精选", link: "https://vimeo.com/channels/staffpicks", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new VimeoHotRank();
export const route = {
  name: "Vimeo · Staff Picks 精选", path: "/vimeo/channels/staffpicks/videos/rss", url: "vimeo.com",
  maintainers: ["findrss"], example: "/vimeo/channels/staffpicks/videos/rss", parameters: {},
  description: "官方 RSS/Atom 内容列表，保留上游选择和顺序。新闻及精选列表不冒充热度排名，未知排名与热度均为 null。",
  handler: ctx => script.run(ctx),
};
