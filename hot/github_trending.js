/** HOT */
export const version = "1.0.1";
export const category = "科技";
export const order = 220;
// Favicon: https://github.githubassets.com/favicons/favicon.svg
export const platform = {
  name: "GitHub",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"github-trending-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABlVBMVEX////z8/Sys7V6fYBSVVk2Oz8oLTJ7foGztbf09PTe3t94e34sMTUkKS4tMTZ5fH/f4OH29/eHiownLDGIi474+PhKTlJUWFzq6uvV1tc8QEXX2NlITFBvcnU0OT4zNzxucXRPU1eoqqz7+/uqrK45PUIvNDlMUFRaXmJbX2JMUFUyNjujpaf6+vq5uryQk5XS09Tb3N39/f3+/v7e3+Dw8PDi4uMtMjfq6+vU1dbk5OV+gYSwsrTAwsP19fU5PkLr7OxCRku0trh8f4InLDDv7+9TV1s1Oj46P0M3O0ApLjNBRkoqLzQwNTk/Q0c+QkclKi/t7e4/REhSVlqxs7RVWV2ChIdgZGeEh4q4ububnqCsrq+5u72OkZT8/P2bnZ+Ag4aGiYuztLY9QUaSlJfOz9D29vb39/jR0tOWmZuChYjg4eHExcby8vNYW19oa28rMDUxNjrp6eq7vb7o6OmTlZinqav5+flNUVXm5+e/wcI7QETn5+jX2Nhsb3OfoaPY2domKzCZm52KjZAzOD3k5ebl5uZsP6RVAAABsUlEQVQ4y21T+SMCQRR+dJAMJbkVIuQIkfsOocidO+S+cuXKffzdZt5s29rd98O+N9/37bezb94AiJGWrtHq9HqdNiPTAMrIMmYTMXJyTTLanGch/0Kfb5XypgKiiMKiFF+sIypRUiq+r8pTheBhZv5l5TYpZ6+oZF/h+8hjSBU4qmuIs7au3tVAbI1N0MxQN/4f7r+FVobWNgZ42jvo08vQzi5aGdGzW96XHoR7af9ysOqTC/oR7hyAdCwGh+SCtGEkRkCDuVHZ+xEkRkHLkm9MKbDit8dhgiW/yulBLWMmYYqlaTUBegcAjYJqghn8DZhlKTSn5M0BxszDAm52USngjViCZcxaj0KwgkQYVvnxrcn5dY5vgMGJRWizSUpvbfMRDA4ARAjZ2XURshfdP+Ds4dHxsDAXJ3R5GiD2s3Mcygs8brgU5ybmZWs3IVfX7WzsbrjDkSiI8qZTfw3c3oXj91xwn+QfBODRTyxP0i0Kd+Q5kQReqOL1LR7dEtY+zr+nXkm4EBIc4YMtXAmpqeMzRrHkbWNX7+vf1aPhPQk6HUL97Yycqhyv4SdZ/Z6n0D9hO0QAEw90tAAAAABJRU5ErkJggg==\" data-n=\"github-trending-favicon\"/></svg>",
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
  "id": "github-trending-today",
  "name": "Github · Today",
  "home": "https://github.com/"
};
export class GithubTrendingHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const request_options = {};
      request_options.headers = {
        Referer: source.home,
        ...request_options.headers
      };
      const fetched = await utils.request_text(ctx, "https://github.com/trending?spoken_language_code=", request_options);
      if (fetched.error) return fetched;
      const parsed = utils.document_nodes(fetched.data);
      if (parsed.error) return parsed;
      const list = utils.rows(parsed.data, "main article.Box-row");
      if (list.error) return list;
      const rows = list.data;
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        const id = utils.identity(utils.attribute(row, "h2 a", "href"));
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url(utils.attribute(row, "h2 a", "href"), source.home);
        if (link.error) return link;
        const pinned = false;
        const raw_rank = null;
        const rank = pinned ? null : raw_rank === undefined || raw_rank === null || raw_rank === '' ? null : Number(raw_rank);
        const heat_text = String(utils.field(row, "a[href$=stargazers]") ?? '').trim();
        const heat_number = heat_text === '' ? NaN : Number(heat_text.replace(/,/g, ''));
        entries.push({
          id: source.id + ':' + id.data,
          title: utils.plain_text(utils.field(row, "h2 a").replace(/\s/g, '')),
          link: link.data,
          rank,
          pinned,
          heat: {
            value: Number.isFinite(heat_number) && heat_number >= 0 ? heat_number : null,
            unit: "累计星标",
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
const script = new GithubTrendingHotRank();
export const route = {
  "name": "Github · Today",
  "path": "/github/trending",
  "url": "github.com",
  "maintainers": ["findrss"],
  "example": "/github/trending",
  "parameters": {},
  "description": "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
  handler: ctx => script.run(ctx),
};
