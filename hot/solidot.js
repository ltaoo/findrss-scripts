/** HOT */
export const version = "1.0.1";
export const category = "科技";
export const order = 400;
// Favicon: https://solidot.org/favicon.ico
export const platform = {
  name: "Solidot",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"solidot-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABy1BMVEUAAAAAUlIAUVEAU1MAVFQAUlIAUlIAUlIAUlIAUlIAUlIAUlIAUlIAUlIAUlIAUlIAUlIAUlIAUlIAUlIAUlIAUlIAUlIAUlIAUlIAUVEAUlIAUlIAUVEAUlIAUVEAUlIAUlIAUlIAUVEAUlIAUlIAUVEAUlIAUVEAUFAAT08KWVkscHBOhoZekZFhk5NilZU3d3czdHSoxMTl7e309/f5+/v6+/v+/v6NsbEBUlIsb2/L29v///+Rs7MHV1ecu7uRtLTj7Ozw9fXr8fHq8PDq8fHu8/OEq6tWjIz3+fmoxMNDf38ydHQwcnIxc3MbZGRnmJj8/f1Bfn0ATk5gk5Pz9vZLhYRAfX3v9PS70dFHgYEnbGwhaGggaGgeZmYVYGAGVlYWYGDH2dnx9fXn7+/k7e3k7Ozg6enM3Nygvr5UiooMWlppmZkYYmIOW1uUtrb5+vqOsrJqmZnE19fo7+/x9vby9vYSXl4/fHxGgYFJg4OevLz4+vpllpYXYmLJ2tp7pqYLWlq5z894o6NfkpLp7+9ckJAtcHDO3d3h6uoqbm40dHTt8vKStLQFVVXN3d0obW260NA7enptm5t3oqJ2oqJ1oaFvnZ09e3tA3NfxAAAAJnRSTlMAAAAAAAUsbafS7vsEOpXc+B2J5ji//kTWBOeWLG5uqNP8BTnVHXUM3skAAAIhSURBVDjLfZN5W9NAEMY3kRYILW1D08ZWaCu4u7GiIi31QFFQBEUR8cBKsVppvfBGvO8L71s/rjPZbWjyPPr+s5udX2ZnZmcIQSkgn7+5pVVra9NaW5r9PjwhjuAjEGwPhalUONQeDDQQsI3oHdSlDj3iELCJGjHqUcyIqoIAe9yEE8a51SBGzbjtA/+37euzG3o3Otq0mVIzqqxSAIgYaO/b0p/LDzgqbN1GqRFRVaIEdLifbd8x6NZOAGL6avAQxPh3DXnsg7sBoImgQnxJ2PDsHjwsDI/s3Sc0uh8BmvSRNSEExsbRfuDgxCGpw5N2siE/6cT6WUemABg+Os0dMVHTLpLC1To2AMDxE9Oc2VqpV4qkceEnZzCGU8XTs6VSae5MmdeZNNFwYWfP2aFXzs9Xq9XahYuXLktCIxl7ZVfyriRzQwuCyNSBq9euu+twoywBjUri5q3bM5XFyuKdcRvon+DiirSMhtGl7N17xWLx/tiDhwBMPbJEkCknIyYrYD1+gi6eWiLNLtFobEX82XMEXiAQ7hSlpuXJOUezL1+BPf/aEqUWj/Xm7XJNank+hw5q7zDP5Fp47gQA7z94n/vjJ/ncdsPwvhGP/fMXjg0TkC3n9lDIj379hhcY0PoE+rLbZAvff/ys69fv3j9LaDe7RVurTfEeZrlkP2ZPvEm1B0NV/zE4CvR0fbTW6Qm3PdEwegTj+O/wNo5/JuMZ/7+QsK8VVTVbQgAAAABJRU5ErkJggg==\" data-n=\"solidot-favicon\"/></svg>",
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
  "id": "solidot",
  "name": "Solidot",
  "home": "https://solidot.org"
};
export class SolidotHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const request_options = {};
      request_options.headers = {
        Referer: source.home,
        ...request_options.headers
      };
      const fetched = await utils.request_text(ctx, "https://www.solidot.org/index.rss", request_options);
      if (fetched.error) return fetched;
      const list = utils.feed_items(fetched.data, "https://www.solidot.org/index.rss");
      if (list.error) return list;
      const rows = list.data;
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        const id = utils.identity(row.id);
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url(row.link, source.home);
        if (link.error) return link;
        const pinned = false;
        const raw_rank = null;
        const rank = pinned ? null : raw_rank === undefined || raw_rank === null || raw_rank === '' ? null : Number(raw_rank);
        const heat_text = String('' ?? '').trim();
        const heat_number = heat_text === '' ? NaN : Number(heat_text.replace(/,/g, ''));
        entries.push({
          id: source.id + ':' + id.data,
          title: utils.plain_text(row.title),
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
const script = new SolidotHotRank();
export const route = {
  "name": "Solidot",
  "path": "/solidot",
  "url": "solidot.org",
  "maintainers": ["findrss"],
  "example": "/solidot",
  "parameters": {},
  "description": "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
  handler: ctx => script.run(ctx),
};
