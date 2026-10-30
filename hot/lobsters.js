/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const category = "科技";
export const order = 620;
// Favicon: https://www.google.com/s2/favicons?domain=lobste.rs&sz=32
export const platform = { name: "Lobsters", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"lobsters-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAD00lEQVR4nJ1Xy0uVQRT/zXfHrpoXzRspaYSPNr4QImrXqgfSHxBtjJa5ymghhARBRKugaFfoMnDtv1C76GEhFW4KauGtuBcf4HVi3mfmzr19OXqZ9zm/Oec3Z87HVsolAQBCCDDGZBNqwDaY+g/6DYWMCwgwoTfFy21faI1gYMiIumhpukgFzYtoUtMREYxz4WAyhUwjJscWAkJahsqUXbNWHtYWZtaYA2qZxApKjBlXCxjAndmpqZ1EUkWTLDVHxyKPBSDICA/QRwL2N6stDR5jzcolvTfmTrTSWkoBCL0kaaFopJQP3J5Hsb8/F4A/H9ZQWV4GK5eS4LR0LZuOcw/X3gC9vA5g4uYcuoeHcwHYWF3FpgRgfEvP7+ljfa9r2efyyigiOQLqhdI3b+4tou1YH8ZvXEfP2GSD0vruLtaXnuPX56+ora+DdXry0VNaEJqEnhWyz1bKXTICKHpaYjnEmzXsAegZGsTFT19QKBYDAB+fPcbbuVuaSJ1A1tFlboAlAHWrd4VVIGe4rqx5It/1ltDGBH5vfEuavfLqtVKe9ZaIQn/5dKixqtI84LGp4nYzLqeLVZjeScF4AMIEljiQkECUu8igZbdKbkUcUFxXa1y4A7cBwLM3Qp7LAM6pURzwnndiDAh7U7jVIMNtgDa3chIWCdt123OA4HLhWwWv5PsRjOVwgd2j3CV03fRdMnNmDXdmJ0GbmiuXGcgGuiV+JxwJyURGDxEf6CAlzz4qnzvCkJ0OYF4UJMq0tFdiTeYyGVmbn2wrlKqdA4Uzs8wdzPmMnP2dKuqVKrkpJiUxujL9KBjieDZ5MuWyQNppYruK8qUrGHlwH8WjfSSf8vqyfBpa6E5wRvcF9raA6YVFnF64Cz4wiP3tWsPmTFuLNZX2Lw8Qz7m9ytXbNXROjqN7akq9mofqIiGPSQ6QCK3eR3lNZE//5QtGBoLZK4s8/dTDRw0vKKhsmMfIgoojodipQmyRFysqHWMT2MNL8IpP3WQiUwBwZmkJQzMzDXuoAUxGlL5xkkCls+fRPjiIk1evNZ4EwPT8HXQfP4Gf79+B1esQhQKOnBrBwIXLTTOpWBdvcjhlwnNPnyQzIVskqNHZWYzi4IVTZLQtJ9ZeLOFwX76ktFWp7+1i68d3ZO1dwROldNlPs/DzytT/kZb/qxR6uxQBdcyh+QCCbM1NqNpscnPBxx6hbPIj0CdhcV5Mac9VlmqDf0xRKszJ0B+xKqdQw8ScJiPyOvwV91lxmKRkYSJpb3RDUnCgYmWmxi1sHhCCtFKjtB9/8zXuC/vkayAQ9xdgn33VJKvengAAAABJRU5ErkJggg==\" data-n=\"lobsters-favicon\"/></svg>" };
export const tags = ["社区", "编程", "英语"];

export class LobstersHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const fetched = await utils.request_json(ctx, "https://lobste.rs/hottest.json");
      if (fetched.error) return fetched;
      const list = utils.array_at(fetched.data);
      if (list.error) return list;
      if (!list.data.length) return Result.Err("Lobsters 热门列表为空", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const id = row?.short_id;
        if (typeof id !== "string" || !/^[a-z0-9]+$/i.test(id)) return Result.Err("Lobsters 缺少有效帖子 ID", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(id)) continue;
        seen.add(id);
        entries.push({ id: "lobsters:" + id, title: utils.plain_text(row.title), link: "https://lobste.rs/s/" + id,
          rank: null, pinned: false,
          heat: { value: Number.isFinite(row.score) && row.score >= 0 ? row.score : null, unit: "得分", text: String(row.score ?? "") } });
      }
      return Result.Ok({ category, title: "Lobsters · 热门讨论", link: "https://lobste.rs/", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new LobstersHotRank();
export const route = {
  name: "Lobsters · 热门讨论", path: "/lobsters/hottest.json", url: "lobste.rs",
  maintainers: ["findrss"], example: "/lobsters/hottest.json", parameters: {},
  description: "读取官方 hottest JSON 第一页，链接到讨论页，保留得分和原顺序；无显式排名，rank 为 null。",
  handler: ctx => script.run(ctx),
};
