/** HOT */
export const version = "1.0.1";
export const category = "社区";
export const order = 480;
// Favicon: https://v2ex.com/static/icon-192.png
export const platform = {
  name: "V2EX",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"v2ex-share-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAAAAABWESUoAAABaElEQVQ4y72TwS4kURSGv3PvLaTbLISEhY14Ag8gkV6QkIlkMnZsJGzxEBLPwILEhhdhZ2EzTyCTMUTT6UQK/VvculWFjh21qXNPfXXuX3/91yQMECYryqrCZD0+v4K+HHAIFCnRp7Q8glZ7Sf22aHfLlo0O6gPwtHfmDEUbWtvDegfY89VfX/ZOwtZQSQSECUJWATptbmYqpAWBkJyvAHTcWPOF3kKDzNJ3mMHLYeO3vRFpY5NpQn4H5AeNxYLvxAntPA3oHJwb9EZ25uL6oZybiH97Fw56E7vTPSD0Mc97B+YEoCTyvtyie3SZgUY2pl5qIvP9P14YMvJ2ADXXZ1V3Uvc3pQ8eNLTaog4gn7maimxlIWUxIEPI+xrgfy45EYMbhEDgKsDNL8fBqjk5flsBM78Gqqzb/3jvPsalMPuR1Wyx6+oXRTmmN7alPAgDWUpBbFZ5SIrEu1LfcbKCAIsnvpCX9MUnr45bnxtqHEl1AAAAAElFTkSuQmCC\" data-n=\"v2ex-share-favicon\"/></svg>",
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
  "id": "v2ex-share",
  "name": "V2EX · 最新分享",
  "home": "https://v2ex.com/"
};
export class V2exShareHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const rows = [];
      for (const channel of ["create", "ideas", "programmer", "share"]) {
        const fetched = await utils.request_json(ctx, 'https://www.v2ex.com/feed/' + channel + '.json', {
          headers: {
            Referer: source.home
          }
        });
        if (fetched.error) return fetched;
        const list = utils.array_at(fetched.data, "items");
        if (list.error) return list;
        rows.push(...list.data);
      }
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        const id = utils.identity(row.id);
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url(row.url, source.home);
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
const script = new V2exShareHotRank();
export const route = {
  "name": "V2EX · 最新分享",
  "path": "/v2ex/share",
  "url": "v2ex.com",
  "maintainers": ["findrss"],
  "example": "/v2ex/share",
  "parameters": {},
  "description": "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
  handler: ctx => script.run(ctx),
};
