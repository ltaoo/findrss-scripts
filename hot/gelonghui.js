/** HOT */
export const version = "1.0.1";
export const category = "财经";
export const order = 210;
// Favicon: https://cdn.gelonghui.com/static/web/www.ico.la.ico
export const platform = {
  name: "格隆汇",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"gelonghui-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAESElEQVRIx7VWTYscVRQ9975XXd0108EJQ1xIIuqYhSYgDNEgihs/VvETs3IpbkRFXAlB0IUDWenWjSKi4EJB1B9gNASC34oZGDB+5INJwIzTMz1dVe8eF6+qq7szY6JkXr9FQVfdc9+559x35fYFKwIguPaLSBx8v2ARINsAQKI0eK8oym1IHwDhFZ5m5PbEJ2jwJC4HEEAEgQABAbbKQKoXnICcfCtG9qSRYyFEUBgGBbIWREBuqYD4Fw2rOdIEXsdyJSKAgdaoSIA8YLrFZ+9x985J4q5MRRFwbIlvnwi9XBJtUq0pMhsFICDGhYeTw/P+6um+71bs3YXnPyxs5LQRQGkcbiVX+3ZgNw/POxLBYLzyDgYSh+fdgd1c7ZuSozF9fBACgDrJS5vJAEggvF5d/oLS4EVmMstLEGrGSIZRfMSJejAhjSEAgJGAfHN649WP/ppuq10mJBX0NuyVx2bmb2oHo1cJJWmwmvNhDcjma2EgrGIQwPkVfPKddqd9uAzBq/zdK597CABSLwBUyACYsD7BZJGNrI9TLeckzZKpLAmBRqhKrRKqCpx77/jayaXeeo5OS345i9T7MlTOJUGjJ8nGJELjmJbJUIZQOpIq2BhQR9qWAu+fKIuyhAiIbpa2W7BgIz6QCNCEIwmOGIuVIctgLz6Q3j3XurRu3jWiVs1ExMipVF7/tH98KXQ7EiEIkIytgiOYk54nKcIy8OOTq08dnLn5+nQrNb1zbG1QWhdaUQSQopH2ahlgVZEbSEMITJz8fE7uXzj/w299AEVgMAx3XgJAURIkDXU0klSyYqHiZ6JrMf4YjN1OcqbXfvyN5R9/7ydOnCJuVThtCK15rp49xmsAm2h8VFAFTmDGbsefWU2ffPPCg/sSI3r98NKh2f172sHoosAMkeOYKZoasPIkhkVnPDVszVachVBJ26lbXG4tfl4gFawXTxwM+/eg1mWdeFNk8ZVKJL7R9PWoxtmu3nlbsiPzYZQ58alvn75op/4cpLHfyphIquwIEOM+kAoEgKoAuGsu/eLIbAQbxg+BWaovvHvp1GLZzwMAM9TWiieonVwDNE6GYGU9AFRIGagiLT9538Qr3GhI3csfXLxll+7b0xm30hCOWgnHYptjlsqXi4PPvu6pwjtRhcjkTrwAcAI4LF3wjxw99/3pqF2rdBT7OEnCV1WtTgAV5OaffuvCkUcHB/dmfrMbLRh2TuvySgkg6/hfL9mho2e/eu2GHR1FKECtFQQQsvOZc+v5aHOAiJRlyNf63Sl2Wptf+CKyEZKcLQG8k9VefseNJtr69g9MtdTqQmct8VWFR9sP6ZxOXzddBBvkW440qhKLX5ScypKfzpZAyBLfTEFENFrTi8YqGSgC57Ye+UY+DIbEu0omTaJA7KZjGhyN8F8GMm4egT6a99+mq/+3qoFKfB6Gur2mAACJPNC3EzihbMN4TTLx8g/BoXPbrPjGawAAAABJRU5ErkJggg==\" data-n=\"gelonghui-favicon\"/></svg>",
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
  "id": "gelonghui",
  "name": "格隆汇 · 事件",
  "home": "https://www.gelonghui.com"
};
export class GelonghuiHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const request_options = {};
      request_options.headers = {
        Referer: source.home,
        ...request_options.headers
      };
      const fetched = await utils.request_text(ctx, "https://www.gelonghui.com/news/", request_options);
      if (fetched.error) return fetched;
      const parsed = utils.document_nodes(fetched.data);
      if (parsed.error) return parsed;
      const list = utils.rows(parsed.data, ".article-content");
      if (list.error) return list;
      const rows = list.data;
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        const id = utils.identity(utils.attribute(row, ".detail-right > a", "href"));
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url(utils.attribute(row, ".detail-right > a", "href"), source.home);
        if (link.error) return link;
        const pinned = false;
        const raw_rank = null;
        const rank = pinned ? null : raw_rank === undefined || raw_rank === null || raw_rank === '' ? null : Number(raw_rank);
        const heat_text = String('' ?? '').trim();
        const heat_number = heat_text === '' ? NaN : Number(heat_text.replace(/,/g, ''));
        entries.push({
          id: source.id + ':' + id.data,
          title: utils.plain_text(utils.field(row, ".detail-right h2")),
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
const script = new GelonghuiHotRank();
export const route = {
  "name": "格隆汇 · 事件",
  "path": "/gelonghui/news",
  "url": "www.gelonghui.com",
  "maintainers": ["findrss"],
  "example": "/gelonghui/news",
  "parameters": {},
  "description": "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
  handler: ctx => script.run(ctx),
};
