/** HOT */
export const version = "1.0.1";
export const category = "科技";
export const order = 20;
// Favicon: https://www.36kr.com/favicon.ico
export const platform = {
  name: "36氪",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"36kr-quick-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAyVBMVEUAAAAwhf0whv0vhf3///8whf0vhf0whv0whv0whf0xhv1Alf8whv0whv0zjP8vhv0whv1Jkv8vhv0vhvw1jf8vhv0vhv1Vqv8vhf0xh/8zhv8whv0whfwvhfwwhf8xif8whvwvh/8whvwwhf0whvwxhv8vh/0vhf0yh/8vhv01h/8whfwwhf0whv0wiP8vhv0whvwyh/8xhv8vhf01iv8vhv0vhf0whf0whvwxhv8whf07if8vhf0xh/wwhf0wiP8whv0whvwvhfxuG9jBAAAAQnRSTlMAhvriAZv53/BrfgzqcBTy4QeNYR341wOdUyj8y6xFNL5Gte+7OWz9QugiyZmeOs7AMxX3GN3YlatU6w1xYtZPmsrwc20MAAAA9ElEQVQ4y72TaVvCMAyAyyEoGyAgoG4iiCIglwd4IKD5/z+KpGxpd+Tr8mF5m7591q2pUllELg9QCLh4VgIoxwQswXnAF8hQiQlgBMdFdh1ZqBBXlSjU6oiXDVloEraUKFy1kTpdWbgmulGicOsh+EoW7gh6snBPuW/Kg4ch1G3hkfITz4+eaWwJY0oTnp/SAUSEF0ouCzM9n2fBm+sCLEJhiYPV6xsLYfAm33HRh/UVHD1TXKs0wTfFTVz4/KLntyj8bO3DShF+g+PeCUKhEWmYpNCKtlxC2OtXm6a1Bf3XDyfmtrcFvDjeX8B8cXA3/yqjOAJzWVJ58cAFyAAAAABJRU5ErkJggg==\" data-n=\"36kr-quick-favicon\"/></svg>",
};
import { utils } from '@findrss/util';
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
  "id": "36kr-renqi",
  "name": "36氪 · 人气榜",
  "home": "https://36kr.com"
};
export class Source36krRenqiHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const day = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
      const request_options = {};
      request_options.headers = {
        Referer: source.home,
        ...request_options.headers
      };
      const fetched = await utils.request_text(ctx, "https://36kr.com/hot-list/renqi/" + day + "/1", request_options);
      if (fetched.error) return fetched;
      const parsed = utils.document_nodes(fetched.data);
      if (parsed.error) return parsed;
      const list = utils.rows(parsed.data, ".article-item-info");
      if (list.error) return list;
      const rows = list.data;
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        const id = utils.identity(utils.attribute(row, "a.article-item-title.weight-bold", "href"));
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url(utils.attribute(row, "a.article-item-title.weight-bold", "href"), source.home);
        if (link.error) return link;
        const pinned = false;
        const raw_rank = utils.field(row, ".rank");
        const rank = pinned ? null : raw_rank === undefined || raw_rank === null || raw_rank === '' ? null : Number(raw_rank);
        const heat_text = String(utils.field(row, ".kr-flow-bar-hot span") ?? '').trim();
        const heat_number = heat_text === '' ? NaN : Number(heat_text.replace(/,/g, ''));
        entries.push({
          id: source.id + ':' + id.data,
          title: utils.plain_text(utils.field(row, "a.article-item-title.weight-bold")),
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
const script = new Source36krRenqiHotRank();
export const route = {
  "name": "36氪 · 人气榜",
  "path": "/36kr/renqi",
  "url": "36kr.com",
  "maintainers": ["findrss"],
  "example": "/36kr/renqi",
  "parameters": {},
  "description": "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
  handler: ctx => script.run(ctx),
};
