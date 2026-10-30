/** HOT */
export const version = "1.0.1";
export const category = "综合";
export const order = 410;
// Favicon: https://cdn.sputniknews.cn/i/favicon/favicon-192x192.png
export const platform = {
  name: "卫星通讯社",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"sputniknewscn-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABklBMVEUAAAD/kwD/lQD/lgD/lAD/mgD/lwD/kgD/ngD/iAD/mAD/lgD/lgD/lAD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lQD/lgD/lgD/lgD/lgD/lgD/lgD/lQD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lQD/lgD/lgD/lgD/lQD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lQD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgD/lgB9GTbpAAAAhXRSTlMAAAAAAAAAAAAAAAkjAR9golkTSpjc+4kGCjeBy/alDgMmarjuwR0YVOLZMg0/jNP660wtdPL3ax5erej+iwUSSZfa/KkQNX/JxiAEJGi27d02nuBRu/lw+JAH1K6Rykb1Ou9WgnUBOZUIDL2zFHPOLuMGr/FbY3oCmwqhF1XSKhrYQ4RicMtzEgAAAWpJREFUOMt1klVDAkEUhZe5K6KAYCEGCiKYKHaArN2Kih2o2N3dMf/bYYnd2dk9r9+Ze24Mx2lJhxCA0aSFEQ9gzrFYc1UpnwGgz8svKLQV2VVKA1FxSWmZA+PyClBWBhLsdFW6qzCRxwu0AWWS0tU11losqq4ekF5G9aR0g6+xyZ/AuLmF2Klge2ubpx2n1NEJ6QBxpq7ungCWFOwNJTmKzyT09Q8MYrmGhpOc1DGOjI45MK3xiVQDk1PTM2Gs1OxcusH5SJDBOLwgNbjIYry0rJM2ZFlhDatrsg161xm+Icg3bNhU8qhJtkEy5tY2zSM7QJ0IhCjFY7s053j9npz79w+UJ4bDmMxwdAzMHzk5lfjZOcO5LLhI80sXsAYEV6kzX/sgG6n88JvbBL+7V3kvHvxBvJft8UmVkwxTJG54flHnxOF8Jdz9psVJxrsff3wCIA0DD1/fgR8waHGSYf79oy7IZgghrQb+Aaqws6/rS6ADAAAAAElFTkSuQmCC\" data-n=\"sputniknewscn-favicon\"/></svg>",
};
import { utils } from '@findrss/util';
import { HotRankScript, Result } from "@findrss/core";
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
  "id": "sputniknewscn",
  "name": "卫星通讯社",
  "home": "https://sputniknews.cn"
};
export class SputniknewscnHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const request_options = {};
      request_options.headers = {
        Referer: source.home,
        ...request_options.headers
      };
      const fetched = await utils.request_text(ctx, "https://sputniknews.cn/services/widget/lenta/", request_options);
      if (fetched.error) return fetched;
      const parsed = utils.document_nodes(fetched.data);
      if (parsed.error) return parsed;
      const list = utils.rows(parsed.data, ".lenta__item");
      if (list.error) return list;
      const rows = list.data;
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        const id = utils.identity(utils.attribute(row, "a", "href"));
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url(utils.attribute(row, "a", "href"), source.home);
        if (link.error) return link;
        const pinned = false;
        const raw_rank = null;
        const rank = pinned ? null : raw_rank === undefined || raw_rank === null || raw_rank === '' ? null : Number(raw_rank);
        const heat_text = String('' ?? '').trim();
        const heat_number = heat_text === '' ? NaN : Number(heat_text.replace(/,/g, ''));
        entries.push({
          id: source.id + ':' + id.data,
          title: utils.plain_text(utils.field(row, ".lenta__item-text")),
          link: link.data,
          rank,
          pinned,
          heat: {
            value: Number.isFinite(heat_number) && heat_number >= 0 ? heat_number : null,
            unit: "热度",
            text: heat_text
          }
        });
      }
      ctx.log('榜单解析完成', {
        source: source.id,
        count: entries.length,
        missing_rank: entries.filter(entry => entry.rank === null && !entry.pinned).length
      });
      return Result.Ok({
        title: source.name,
        category,
        link: source.home,
        entries
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? 'UPSTREAM_INVALID_RESPONSE');
    }
  }
}
const script = new SputniknewscnHotRank();
export const route = {
  "name": "卫星通讯社",
  "path": "/sputniknewscn",
  "url": "sputniknews.cn",
  "maintainers": ["findrss"],
  "example": "/sputniknewscn",
  "parameters": {},
  "description": "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
  handler: ctx => script.run(ctx),
};
