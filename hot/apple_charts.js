/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";
export const version = "1.0.0";
export const category = "音乐";
export const order = 860;
// Favicon: https://www.google.com/s2/favicons?domain=www.apple.com&sz=32
export const platform = { name: "Apple Charts", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"apple_charts-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAESUlEQVR4nK2XW0wUZxTHf+yyFwO6ywILFLMUw4IGH6DUmmBqavvQEl5qeGmLCQELlqh9q5GyNrG0vlEbL221Nq2kFZ9JY1ITrNBnUhESBQmUDRthgZWLhPvSnMmsQZxZZtD/0+585zv/M9+cy/9LuH//ASbxGvAG4AeS1WdPgUfAv0DIjLNEg3bZQA3wsc2WuMfpdOJw2LFYLMpiNBplcXGJhYUFlpdXHgKtwC9GgknY5ATcwNdAndeb5nC7dyjE8SCBTE3NEA5PLAJXga+Aqa0E8C7wR3p6amZGRhoJCQmYwdraGmNjE4yPT44CR4B2LTuLzv464LbPl52ZmZlumlwge2Sv+AD+Ao4ZDaDe43Ff8ftft7pc2w2RSQ7cuNFKc/N3L6yJD78/1+rxuH8S35sF8B5wMTU1BUk0I5DEq6k5yunTDfT09GjaOJ0OxKf4Vjk0A3DLN/f5sq2ywSguXLjInTt/K7+rqqp07cSn+AZ+V7leCKApPT01w+ixx97+2jWpNjhx4jiHDr0T1158S1KrlfVcFfikkezdW2DfLOEGB4eIRlfJzc3FarVy/vz37Nv3Jnl5eTx+PIrHk0JOTk7c6ujt7VsCdkmfiDWiaq83LS55Z+c/NDc309PTqyRdQUE+5eXl5OT4uH69RVmfn5/Hbrdz4EApgUAjfr80y+chHMIVDk98CpyNncCD/Pxdu/WazN27HVRX17C6uopRCPmtW3/icDg0m1V//2AfsFtyYKfNlqhLPjc3R0PDl6bIk5KSOHfuW+U0tCBcNltigXBLAEXxSq6jo5NQyNR8oa6ulv3734rbwFTOIgnAH6+/d3V1YRZlZR9saqNy5ksA22NTTQuzs7OmyOWtjTQxlTNZn1lFSorSwQxDyqyvr9+wvUVeUspKD4WFhZjFpUuXWVlZiWujcj6VAB5JWehBmozRuRBDd3c3tbXHCAaDujYqZ78EcE9aqh6ysrI4ePBtzKK9vf3ZjNCCynlPAhgRGRXvFOrrPzMdgOTO4cMfaq4J1/LyiiTKSCwJb4qM0kNJSQkVFRWmAjh16gtcLpfm2vS0wtW6fhr+Gg5PLEsG66Gp6awycIxAZkRl5SfxpJoc98/yPzaMJFuujo1NHBcZpYXk5GRaWn6jsTHA0NB/FBcXUVZWhtfrZWBggLa2NqVjlpaWcuZMQDc40YmqWA1tFKUiEh76fNmmNIEZTE/PEgyGRKTuiSlly7p1eVAZDIZWFxZEUb9aiE/xrSrkZzLdssFOpPPJycknyoZXSR6JPJGfJzfK80QN+x8jkaloJDJ1WTTcy36OmZlZhoeVN/9cfG9ct+jsuwK8L99rdHRcyVyzkD2yd3hY+eYyHn/Y6tXsG6A2IyPN7nIZu5pJna8rtcBWr2asg1xOa4GPRMls2+ZU1M76y+nS0hLz88rlVKTWTZX8pS+nWtgJFAPSlXaoz6S1DajX8xEz3v4Hwdelk9XalesAAAAASUVORK5CYII=\" data-n=\"apple_charts-favicon\"/></svg>" };
export const tags = ["音乐", "播客", "英语", "日语"];
const types = { podcasts: "播客", songs: "歌曲", albums: "专辑" };

export class AppleChartsHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const country = String(ctx.params.country || "us").toLowerCase(), type = ctx.params.type || "podcasts";
      if (!/^[a-z]{2}$/.test(country) || !Object.hasOwn(types, type)) return Result.Err("country 使用 us、jp 等地区代码；type 支持 podcasts、songs、albums", "INVALID_PARAMETER");
      const media = type === "podcasts" ? "podcasts" : "music";
      const fetched = await utils.request_json(ctx, "https://rss.marketingtools.apple.com/api/v2/" + country + "/" + media + "/" + (type === "podcasts" ? "top" : "most-played") + "/50/" + type + ".json");
      if (fetched.error) return fetched;
      const list = utils.array_at(fetched.data, "feed.results");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("Apple 榜单为空或该地区未开放", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const id = utils.identity(row?.id);
        if (id.error) return id;
        if (!/^\d+$/.test(id.data)) return Result.Err("Apple 条目 ID 无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url(row.url), thumbnail = utils.absolute_url(row.artworkUrl100);
        if (link.error) return link;
        if (thumbnail.error) return thumbnail;
        entries.push({ id: "apple:" + type + ":" + id.data, title: utils.plain_text(row.name), link: link.data,
          ...(thumbnail.data ? { thumbnail: thumbnail.data } : {}), rank: null, pinned: false, heat: { value: null, unit: "热度", text: "" } });
      }
      return Result.Ok({ category: type === "podcasts" ? "播客" : category, title: "Apple · " + country.toUpperCase() + " · " + types[type] + "榜",
        link: (type === "podcasts" ? "https://podcasts.apple.com/" : "https://music.apple.com/") + country + "/charts", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}
const script = new AppleChartsHotRank();
export const route = { name: "Apple · 播客/音乐榜", path: "/apple-charts/api/v2/:country?/:type?", url: "rss.marketingtools.apple.com",
  maintainers: ["findrss"], example: "/apple-charts/api/v2/us/podcasts", parameters: { country: "us（默认）、jp、gb 等地区代码", type: "podcasts（默认）、songs、albums" },
  description: "官方 Marketing Tools Top/Most Played JSON 前 50 条；无显式排名和播放量字段，保留上游顺序，rank 和热度为 null。", handler: ctx => script.run(ctx) };
