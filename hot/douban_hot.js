/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";

export const version = "1.0.1";
export const category = "娱乐";
export const order = 150;
export const platform = {
  name: "豆瓣",
  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" role="img" aria-label="豆瓣" data-n="douban-platform-icon">\n  <path data-n="douban-pixels-007711-73" fill="#007711" fill-opacity="0.28627451" d="M0 0h1v1H0zM31 0h1v1H31z"/>\n  <path data-n="douban-pixels-007711-74" fill="#007711" fill-opacity="0.29019608" d="M0 31h1v1H0zM31 31h1v1H31z"/>\n  <path data-n="douban-pixels-007711-228" fill="#007711" fill-opacity="0.89411765" d="M30 31h1v1H30z"/>\n  <path data-n="douban-pixels-007711-230" fill="#007711" fill-opacity="0.90196078" d="M1 0h1v1H1zM30 0h1v1H30zM0 1h1v1H0zM31 1h1v1H31zM0 30h1v1H0z"/>\n  <path data-n="douban-pixels-007711-231" fill="#007711" fill-opacity="0.90588235" d="M31 30h1v1H31zM1 31h1v1H1z"/>\n  <path data-n="douban-pixels-007711-255" fill="#007711" d="M2 0h28v1H2zM1 1h30v1H1zM0 2h32v1H0zM0 3h32v1H0zM0 4h4v1H0zM28 4h4v1H28zM0 5h4v1H0zM28 5h4v1H28zM0 6h4v1H0zM28 6h4v1H28zM0 7h32v1H0zM0 8h32v1H0zM0 9h6v1H0zM26 9h6v1H26zM0 10h6v1H0zM26 10h6v1H26zM0 11h6v1H0zM26 11h6v1H26zM0 12h6v1H0zM10 12h12v1H10zM26 12h6v1H26zM0 13h6v1H0zM10 13h12v1H10zM26 13h6v1H26zM0 14h6v1H0zM10 14h12v1H10zM26 14h6v1H26zM0 15h6v1H0zM10 15h12v1H10zM26 15h6v1H26zM0 16h6v1H0zM26 16h6v1H26zM0 17h6v1H0zM26 17h6v1H26zM0 18h6v1H0zM26 18h6v1H26zM0 19h8v1H0zM24 19h8v1H24zM0 20h8v1H0zM13 20h6v1H13zM24 20h8v1H24zM0 21h8v1H0zM13 21h6v1H13zM24 21h8v1H24zM0 22h9v1H0zM13 22h6v1H13zM23 22h9v1H23zM0 23h9v1H0zM14 23h4v1H14zM23 23h9v1H23zM0 24h4v1H0zM28 24h4v1H28zM0 25h4v1H0zM28 25h4v1H28zM0 26h4v1H0zM28 26h4v1H28zM0 27h32v1H0zM0 28h32v1H0zM0 29h32v1H0zM1 30h30v1H1zM2 31h28v1H2z"/>\n  <path data-n="douban-pixels-0a7c1a-255" fill="#0a7c1a" d="M13 23h1v1H13zM18 23h1v1H18z"/>\n  <path data-n="douban-pixels-1c862b-255" fill="#1c862b" d="M8 21h1v1H8zM23 21h1v1H23z"/>\n  <path data-n="douban-pixels-20882f-255" fill="#20882f" d="M12 19h8v1H12z"/>\n  <path data-n="douban-pixels-278c35-255" fill="#278c35" d="M12 20h1v1H12zM19 20h1v1H19z"/>\n  <path data-n="douban-pixels-64ac6e-255" fill="#64ac6e" d="M8 20h1v1H8zM23 20h1v1H23z"/>\n  <path data-n="douban-pixels-70b37a-255" fill="#70b37a" d="M12 21h1v1H12zM19 21h1v1H19z"/>\n  <path data-n="douban-pixels-80bb88-255" fill="#80bb88" d="M10 11h12v1H10zM10 16h12v1H10z"/>\n  <path data-n="douban-pixels-89c091-255" fill="#89c091" d="M9 23h1v1H9zM22 23h1v1H22z"/>\n  <path data-n="douban-pixels-b0d5b5-255" fill="#b0d5b5" d="M9 12h1v1H9zM22 12h1v1H22zM9 13h1v1H9zM22 13h1v1H22zM9 14h1v1H9zM22 14h1v1H22zM9 15h1v1H9zM22 15h1v1H22z"/>\n  <path data-n="douban-pixels-b8d9bd-255" fill="#b8d9bd" d="M8 19h1v1H8zM23 19h1v1H23z"/>\n  <path data-n="douban-pixels-b9dabe-255" fill="#b9dabe" d="M12 22h1v1H12zM19 22h1v1H19z"/>\n  <path data-n="douban-pixels-d0e6d3-255" fill="#d0e6d3" d="M6 9h1v1H6zM25 9h1v1H25zM6 10h1v1H6zM25 10h1v1H25zM6 11h1v1H6zM25 11h1v1H25zM6 12h1v1H6zM25 12h1v1H25zM6 13h1v1H6zM25 13h1v1H25zM6 14h1v1H6zM25 14h1v1H25zM6 15h1v1H6zM25 15h1v1H25zM6 16h1v1H6zM25 16h1v1H25zM6 17h1v1H6zM25 17h1v1H25zM6 18h1v1H6zM25 18h1v1H25z"/>\n  <path data-n="douban-pixels-d2e7d5-255" fill="#d2e7d5" d="M9 22h1v1H9zM22 22h1v1H22z"/>\n  <path data-n="douban-pixels-d8eadb-255" fill="#d8eadb" d="M9 11h1v1H9zM22 11h1v1H22zM9 16h1v1H9zM22 16h1v1H22z"/>\n  <path data-n="douban-pixels-e0eee2-255" fill="#e0eee2" d="M4 4h1v1H4zM27 4h1v1H27zM4 5h1v1H4zM27 5h1v1H27zM4 6h1v1H4zM27 6h1v1H27z"/>\n  <path data-n="douban-pixels-e2f0e4-255" fill="#e2f0e4" d="M11 19h1v1H11zM20 19h1v1H20z"/>\n  <path data-n="douban-pixels-f8fbf8-255" fill="#f8fbf8" d="M12 23h1v1H12zM19 23h1v1H19z"/>\n  <path data-n="douban-pixels-ffffff-255" fill="#ffffff" d="M5 4h22v1H5zM5 5h22v1H5zM5 6h22v1H5zM7 9h18v1H7zM7 10h18v1H7zM7 11h2v1H7zM23 11h2v1H23zM7 12h2v1H7zM23 12h2v1H23zM7 13h2v1H7zM23 13h2v1H23zM7 14h2v1H7zM23 14h2v1H23zM7 15h2v1H7zM23 15h2v1H23zM7 16h2v1H7zM23 16h2v1H23zM7 17h18v1H7zM7 18h18v1H7zM9 19h2v1H9zM21 19h2v1H21zM9 20h3v1H9zM20 20h3v1H20zM9 21h3v1H9zM20 21h3v1H20zM10 22h2v1H10zM20 22h2v1H20zM10 23h2v1H10zM20 23h2v1H20zM4 24h24v1H4zM4 25h24v1H4zM4 26h24v1H4z"/>\n</svg>',
};
/*
Adapted from https://github.com/newsnext/newsnow/tree/0f95b2c998dffbfd2ddbc51b47b5809887dc6b97/server/sources
MIT License

Copyright (c) 2024 ourongxing

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
const source = {
  id: "douban",
  name: "豆瓣 · 热门电影",
  home: "https://www.douban.com",
};
export class DoubanHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const request_options = {
        headers: {
          Referer: "https://movie.douban.com/",
        },
      };
      request_options.headers = {
        Referer: source.home,
        ...request_options.headers,
      };
      const fetched = await utils.request_json(
        ctx,
        "https://m.douban.com/rexxar/api/v2/subject/recent_hot/movie",
        request_options,
      );
      if (fetched.error) return fetched;
      const data = fetched.data;
      if (!data || typeof data !== "object")
        return Result.Err("上游未返回数据对象", "UPSTREAM_INVALID_RESPONSE");
      if (data.need_force_login)
        return Result.Err(
          "上游要求登录，请更新并授权 Cookie",
          "UPSTREAM_AUTH_REQUIRED",
        );
      if (
        data.error ||
        data.errors?.length ||
        (typeof data.code === "number" && data.code < 0) ||
        (data.error_code !== undefined && data.error_code !== 0)
      )
        return Result.Err(
          "上游拒绝请求，请检查账户权限或验证页面",
          "UPSTREAM_INVALID_RESPONSE",
        );
      const list = utils.array_at(data, "items");
      if (list.error) return list;
      const rows = list.data;
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        const id = utils.identity(row.id);
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url(
          "https://movie.douban.com/subject/" +
            encodeURIComponent(id.data) +
            "/",
          source.home,
        );
        if (link.error) return link;
        const pinned = false;
        const raw_rank = null;
        const rank = pinned
          ? null
          : raw_rank === undefined || raw_rank === null || raw_rank === ""
            ? null
            : Number(raw_rank);
        const heat_text = String(row.rating?.value ?? "").trim();
        const heat_number =
          heat_text === "" ? NaN : Number(heat_text.replace(/,/g, ""));
        entries.push({
          id: source.id + ":" + id.data,
          title: utils.plain_text(row.title),
          link: link.data,
          rank,
          pinned,
          heat: {
            value:
              Number.isFinite(heat_number) && heat_number >= 0
                ? heat_number
                : null,
            unit: "评分",
            text: heat_text,
          },
        });
      }
      ctx.log("榜单解析完成", {
        source: source.id,
        count: entries.length,
        missing_rank: entries.filter(
          (entry) => entry.rank === null && !entry.pinned,
        ).length,
      });
      return Result.Ok({
        title: source.name,
        category,
        link: source.home,
        entries,
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }
}
const script = new DoubanHotRank();
export const route = {
  name: "豆瓣 · 热门电影",
  path: "/douban/rexxar/api/v2/subject/recent_hot/movie",
  url: "www.douban.com",
  maintainers: ["findrss"],
  example: "/douban/rexxar/api/v2/subject/recent_hot/movie",
  parameters: {},
  description:
    "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
  handler: (ctx) => script.run(ctx),
};
