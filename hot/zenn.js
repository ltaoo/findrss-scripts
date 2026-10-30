/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";
export const version = "1.0.0";
export const category = "科技";
export const order = 830;
// Favicon: https://www.google.com/s2/favicons?domain=zenn.dev&sz=32
export const platform = { name: "Zenn", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"zenn-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACZUlEQVR4nO2WT0hUURTGf3N7OiM0hYUI9pcipCiKigFBmogWUa4iEmlRm1auWqgILgwGKgUXUbiqbQwkQblpU2Rh6JgEQSJFFtSQtZCaohmbnLi8ht7MvW/mvucMbvzgLd55953znfude+4J5HK5HCsIsZLBVwlIWJXYxuEE3J2D4Jr/tmQanp6BcLDKBN4vwLXXsC0E2axt+5aF01vKB5dYdhH2jEFjrWrvajH7Xywn+OgszP6AkMOLzD52GOpqqkzg12/om4L1DhHTS9C8Ftqazf1YfgkMPodgEf35RYif8OZH+Ak+8wVuzxVuvcy+cxdsr/fmK+CnFZ8cgZ//Kt6p/ctzXj3hfQfuvLLPuBNfF2HIsOqXRSCVgd5ptfAi9XBshz8ClpfFsWfqmZeFdz+KbwjThS8+wYOkeuZ79kBj2D+BgGkRRuOqTW7/RIdeqqvjhXdD5g+07YSWrT4kGE7Y2Tq1l4V3K+ou1cPPhX3ibRouHvAhwXzKvmyKCy/aoGaTlyr+0V4v5ZJPZglie/U9IlBOggujMJMq1P5DGqbPwoY6M6kknrTr7aJU8EfvYHJBLbzL+/XB81I5IckOtbrHEKUI9E5AQ9Gx21gD5zVaJr/rpWrfDIc2ucew3D4Mjqs2mc3Icf36S4/VHpHKQv8RSkLojDKbm2/Uy8YtG7e5YCBSfi4QptnIjtfXqp8Luif9zwWWWzZOhzKbKwf1M17/GIQtley9UxhBmGTTFIKOfe5nvnjru3ZD0zozApbz5UYCaoUdNA/ZRK4f1f88MGVL5VwvyXZGqO5AUkmIinpbJYB3/AUuwdKZUBp+iwAAAABJRU5ErkJggg==\" data-n=\"zenn-favicon\"/></svg>" };
export const tags = ["社区", "编程", "日语"];

export class ZennHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const fetched = await utils.request_json(ctx, "https://zenn.dev/api/articles?order=trend");
      if (fetched.error) return fetched;
      const list = utils.array_at(fetched.data, "articles");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("Zenn 趋势文章列表为空", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const id = utils.identity(row?.id);
        if (id.error) return id;
        if (!/^\d+$/.test(id.data)) return Result.Err("Zenn 文章 ID 无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        if (typeof row.path !== "string" || !/^\/[a-zA-Z0-9_-]+\/articles\/[a-zA-Z0-9_-]+$/.test(row.path)) return Result.Err("Zenn 文章路径无效", "UPSTREAM_INVALID_RESPONSE");
        entries.push({ id: "zenn:" + id.data, title: utils.plain_text(row.title), link: "https://zenn.dev" + row.path,
          rank: null, pinned: false, heat: { value: row.liked_count ?? null, unit: "点赞", text: String(row.liked_count ?? "") } });
      }
      return Result.Ok({ category, title: "Zenn · 趋势文章", link: "https://zenn.dev/", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}
const script = new ZennHotRank();
export const route = { name: "Zenn · 趋势文章", path: "/zenn/api/articles", url: "zenn.dev",
  maintainers: ["findrss"], example: "/zenn/api/articles", parameters: {},
  description: "官网 API 趋势文章第一页，保留点赞数和原顺序，rank 为 null。", handler: ctx => script.run(ctx) };
