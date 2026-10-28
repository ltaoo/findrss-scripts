/** HOT */
export const version = "1.0.1";
export const category = "科技";
export const order = 360;
// Favicon: https://ph-static.imgix.net/ph-favicon-brand-500.ico
export const platform = {
  name: "Product Hunt",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"producthunt-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAACc1BMVEX//////v79/Pv+///88e76xMD5mZH5fHT6bGD+Ylj78e3//f375+T5oZv5bmL9W079Wk3/XFD/X1L+YVT/X1P+/Pz9/fz4qqL7YlX/Vkj/XlH/Ylb/Y1f/YVb/YVX//P366+j5fnT8VUj/ZFj9VUj66uj54uH5bF//WUv/ZFn/WEv5a1/9W1H+WlH+YVX9YlT/YFP/XlL+YlX/Y1j/YlX9/Pz+YFT7aFz8bWD8bF/8bGD8bGL7a1/7X1L8V0n/YFX65uP9V0r5ubT9/v798vD99PP98u/74N34qqH6Y1b/XVD/Ylf4oJr+VUj9Vkr7wr753934bWH/XVH/VUj78e75bmP7wLv/+/v9///++fn52NP7XlH+Ylb5bmT78e/6xL/8W07/Y1b7wLz4zMf6enH8hXv7hHn7g3r5hXv5x8L9+vj5k4n+WEr+ZFb6w7/5mZL9Wkz5vbb+T0H/XE//Wk3+W0v5WEv51dH5w738WEj6mpD6fHP7wbv+WUz/Zlr/Z1z+V0r5p6H80tD8Wk3/XFH5fHL6bF/7v7n+VEb/X1H8UkT4ycL7yML8WEr+YFH5a2H9Y1n6Y1X8bmP7bGH7bWD4q6L/+/r4oJX9WEr/YVT8+vj88vH98/L98/P98/H89/X9+/r66eb6ZVj/YFT//Pz+/v/69vP4fnT+Wk7+X1H8//779vL5ysT5dGn+Wkv6zcn7e3H8hXz8g3r7gXf6b2P9WUz6vbb/Wk76wLr+WEv/ZVn/VUn7wr37wbz+Vkn65uT+/Pv4ubL7Z1z+YVP/YFL4qqP9Wk7+X1L+YFL5bmH4oZv5bGD9Y1j+Y1j6bV/5fXP6mZF3FAj2AAACdUlEQVQ4y2VT91saQRAd2AiIihQF5O5WETCUmARJr5oewfRCKpDeY4T0ouk9mphGejEhvZjee69/UnbvDrgz75f9vtm3Mzsz7wHwUCgBdcpRqTW5uRq1KkeLQKkACfIA5RfoCvUGo8lUZNAX6gryEQlmUAxmi7XExrAMhzFHDluJ1WImYRGlqMxejh0MzoBxYKfdhUrF96iis9vDYRk4j9dXgYqF+i5fFw+NMSIEiqfS56L/UIDZ7ib3Xbt1t/kpbEVVgR48w203k+ueyOKk73Gv3n369iPoP2DgoMF8Fo/TgpQA1VZM67M1Q4YOG04xYuSo0bVBWhNbqwFQqM5B6eyYsZm20bjxE2gOx8QQgkmTbXw+tmYKTEVhRDENTZ/BzSTd2mbNhkg0hgXCHIC58+YvWLhocXhJeOmy5SQYjK6AlfXBDAGtaognVrvXrEVo3foADdZvgI1xJpth0+YtgUBj01YE27bTxMyOnbDLyGUJu/dgv3Hvvv0ABw6ytI9DzdBiwllC5PCR1qOaY+g4OnGSlsDJFhkh79TpM2fPnQ9fgIuXLjMiQVqiTRjDFXQ1dY3lV3a9WfbJNiBDCN+4eev2HaF3+klpm3D33v329gcPH9WyYl3SpmxQjxsMicQTP5vWDh2UVpcdNTx99pxlM9fCqFHohbislwCvXgeksnLUkWXBm8y63yrfNbFS2fHrVkoE0/r+gzQBEUxYyUvOm5bcxyrpvTdFJceLtlIUrey9KFpe9j7v/7J3p2VPjeNKOTsap9xeljYOb71PxHqxtPViHayXNu9nveFLMvk1ro9++y43r2B/bUSl/vHz1+8/fyMS+/8DHo+0i0EEYqMAAAAASUVORK5CYII=\" data-n=\"producthunt-favicon\"/></svg>",
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
  "id": "producthunt",
  "name": "Product Hunt",
  "home": "https://www.producthunt.com/"
};
export class ProducthuntHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const request_options = {};
      request_options.headers = {
        Referer: source.home,
        ...request_options.headers
      };
      const fetched = await utils.request_text(ctx, "https://www.producthunt.com/feed", request_options);
      if (fetched.error) return fetched;
      const list = utils.feed_items(fetched.data, "https://www.producthunt.com/feed");
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
const script = new ProducthuntHotRank();
export const route = {
  "name": "Product Hunt",
  "path": "/producthunt",
  "url": "www.producthunt.com",
  "maintainers": ["findrss"],
  "example": "/producthunt",
  "parameters": {},
  "description": "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
  handler: ctx => script.run(ctx),
};
