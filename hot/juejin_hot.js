/** HOT */
export const version = "1.0.1";
export const category = "科技";
export const order = 290;
// Favicon: https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/static/favicons/favicon-32x32.png
export const platform = {
  name: "稀土掘金",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"juejin-hot-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABxVBMVEUAAAAegP8fgP8egf8eev8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP8egP/VuHrJAAAAlnRSTlMAAAAAAAZdWwUQhvTzhA8lq/ypJHH5C3PsBAJO2dghl2AqYZg7yBGIe/itJq96CGrozkMBRdDnaQwDaAfPN7ZwCfaUlnK3OGPeGP4Z8rww4+JeMr3xWt/aUjzHU9tYw+55IKSiHw3vwjYdn/qhCh6eHHfEOsbtdVDg4ddPL7qDhbkuF/cjrJMWbOnR0mtGKLD9JxKK9Ym9ME1eAAAB00lEQVQ4y61TaVdSURR9W5OeQCEhTwFREEFxIBU1kFQwQ1LMLOchK3PK1ObRmcoxTbL7ez33AS4swLVang933bvvfufus985gnDJAYqM9zmKqyIyfJ6rVKmvXU+XBNDkaRnT3tClYQD5ekahz09LkAoKGSsskFIQAIMRAoymIrNJ3hjOk4DiEgvJB6xWuoFYaitOZgBldqZWOmIY4ChXMXtZEgPGCifJr9RwDKiqpmKcNcbkFK6btaS/rt4NuBsaadt0y4VEeo+XXo3DzT6fTL1NVAEGDxfU0trmRyJxoP1OIPEY/B13gxA6Q8xZco//JC6NdXWxmFyg2+ZkoU6hPExoz325OEsvd/JBn1zww0fE7VcK4sAggUPDXAhG7IyN8vrgHRsnODQhCshqeUzbySceZANPn0095+mnK2YInJ2L1T3/YoGxhZfz/EZa5OvSFCH65VdxryC9niT+m+CVuJNv39Hx/QfpzCl4P5oJ+iR3E0TFZzp8+XrOSayskubwWi511bqa6trY/Pt3brVHyKG8b7rv5Ffkx/Y/PQHXzi5l3tunpfbAlaKn4P65x+RobHCn7Dng8OgXPVN9nL6to79PVH+iGWaHBkeRk3m0Lhi9/4lTRkx3UlxqfyoAAAAASUVORK5CYII=\" data-n=\"juejin-hot-favicon\"/></svg>",
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
  "id": "juejin",
  "name": "稀土掘金",
  "home": "https://juejin.cn"
};
export class JuejinHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const request_options = {};
      request_options.headers = {
        Referer: source.home,
        ...request_options.headers
      };
      const fetched = await utils.request_json(ctx, "https://api.juejin.cn/content_api/v1/content/article_rank?category_id=1&type=hot&spider=0", request_options);
      if (fetched.error) return fetched;
      const data = fetched.data;
      if (!data || typeof data !== 'object') return Result.Err('上游未返回数据对象', 'UPSTREAM_INVALID_RESPONSE');
      if (data.need_force_login) return Result.Err('上游要求登录，请更新并授权 Cookie', 'UPSTREAM_AUTH_REQUIRED');
      if (data.error || data.errors?.length || (typeof data.code === 'number' && data.code < 0) || (data.error_code !== undefined && data.error_code !== 0) || (data.err_no !== undefined && data.err_no !== 0)) return Result.Err('上游拒绝请求，请检查账户权限或验证页面', 'UPSTREAM_INVALID_RESPONSE');
      const list = utils.array_at(data, "data");
      if (list.error) return list;
      const rows = list.data;
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        const id = utils.identity(row.content?.content_id);
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url('https://juejin.cn/post/' + encodeURIComponent(id.data), source.home);
        if (link.error) return link;
        const pinned = false;
        const raw_rank = row.rank;
        const rank = pinned ? null : raw_rank === undefined || raw_rank === null || raw_rank === '' ? null : Number(raw_rank);
        const heat_text = String('' ?? '').trim();
        const heat_number = heat_text === '' ? NaN : Number(heat_text.replace(/,/g, ''));
        entries.push({
          id: source.id + ':' + id.data,
          title: utils.plain_text(row.content?.title),
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
const script = new JuejinHotRank();
export const route = {
  "name": "稀土掘金",
  "path": "/juejin/content_api/v1/content/article_rank",
  "url": "juejin.cn",
  "maintainers": ["findrss"],
  "example": "/juejin/content_api/v1/content/article_rank",
  "parameters": {},
  "description": "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
  handler: ctx => script.run(ctx),
};
