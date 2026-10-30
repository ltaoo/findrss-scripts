/** HOT */
export const version = "1.0.1";
export const category = "体育";
export const order = 140;
// Favicon: https://m.dongqiudi.com/favicon.ico
export const platform = {
  name: "懂球帝",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"dongqiudi-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFjUlEQVRYw72XaWxUVRTHf/e+9zr7dLrSoYUCosEiVRGXVNxAosRYt8TEiIlGXCAxhEQjxoQQF2KMn5QouMQtaFRUYhAFhRArKLjRurBKW2kr3WY6nem0M2+5fui0tKUOU0XP+/Devffk/P9nvXmC+kqQVKNYjWIREOS/lTiCXQiewOZ7QUNlNfAainn/MfBYaUBwn6ChchOK2/5n8EERbBPUV8YYFXYFCHShnVEsRzk42IAcuZ3Sx4KXG2U8UvIA0/IqUEqdMVfTKs1r0ffYHv8KEEMHLn2UnrKpDS5iceAa1nW/QcLuQ2UiolAIBGTeg2sJGY1BGDFmndkVgtvzb2BZ4RJ2JPZgK3sYUh/LtUDLZ3ffd7zQ+SpeLcBkvZSkM0BIC9LnJHFLN11WhCItRIvVjle4CWp+HBy6rCgukUdQC6ALjYjVQ1qZxK0IaZXmjlAtGhKbLAQUCifj9TxPNXeFbuZQ6hhX+C6h244ikbwf28J1gavYm9xPjfciyowSfur/hfr+gywM1BC1YgghMs78wAexLSgF42VUkkV0oRHS8plihPFLD/M8c7CVhals0sok6fTze7qZ+v4DHE41kq8FCEg/prJIOyZe4aFIL8haHVkJAPSrAZJqAAWYysYl3bhEHobQaTVP0GsnAEVjugUbmz/NDsqMEqbnVXDcbMMgezfp2Q5F5unK5FATkpgdI2rH6LKinOOawQzXVDQ0LvBUEbcTHEgdBaBQC3HC6qTCCIOycicgkUghAUFTuoUvE7uJ23H2JuvxySM0my3oQiNqx7CUxdFUEwdSR8mXATrsCCfMDnzSi1/6sLBoTrcCAikEmpDjOFlfOaI0HBb4L6dQK2BTbCtkGkoMZ2qoJZ3hbzKtN9bsSf3Bs7meOZzvqeKt6Eej2nAMAUYYE5xZGSIzOgrjFOGQV1kMKRtdaLiFC4nEI93D+38vYly4rEV4qjgUaAXUBq+lNriIur59bOzZzPOT19BhdfN+bAvf9P2Umfm5RXACBBRzPXN4JryKBb4aNKFx3GxDR6fGN4+pxmSWFNzCS91v82znBnrteE4kTjsHhjyvMMKsL1/LIv8VaEKjx+5lb3I/3XaUb/t+BAZb7/HSh1hZfO+Iws0uGstCa06nJBBY2MSdBJP0Yn7o/5mVbU/SZB5ntvscPox9zuHUMYr1InYmdvNm9EPara4R11I226d0wdjI29T4LubG4LW8EnmXTitCSAtyR6iWZUVLCBuT+LpvH891vsy+ZAMDKsXVvsuo8V3EMx0vkXASWVORUw0sDMxnVelyFvrnc2vz/SwvuotVpctPnvvnU+2u4oamu5nlOov15WvpVwO82/MJvw4czErg9IkSkilGGIBZ7hlUGGFmuqadolakh6gwwpzrmolXevBJL5P04vGvwAkRgBGTS2TJq0CpoasclFKjJt4/J6AcjqSbsHH4Il7HkVQje5P7MZU5Su1YqplDqWPsTOyhMf0HEbuHVrMdRPZWPH0R4jDLdTYXembzWXwXJXohAsGF7ipWlNzLjLypbOn9kvXdG0mpNO1WFwVaPhd7q9nU8xkDKvVvCQySCGkhHitdzp2hm+mxe1nX/SZfxOvQhY5Hunmw8E5uzV9Ms9nC2vZ1fNy7jVwGUY6TUGAInSrX2ZQbZZQbZbxY/hQPtz3NhshGtk5/gyt9lwLgl17CxqScwCHnSSjotLq4r2UVz3e9TrcdRSCozCsnXwswLW8KAD8PHGRpy6NsiLyTm9lMCnqBQG7qDpowmOs5j+v9V3I43cj2eB0riu/hj3Qr2xJ1tJptufsFKUFD5WYUN+VMGU5eu8N/TwqUk6n4nMFBsEMCTwD7J0RAaCPABy0NricADr8BqyWKH5EsRfApkJwQkX8m/Qi2I1mKYs9fmC03CfpYceEAAAAASUVORK5CYII=\" data-n=\"dongqiudi-favicon\"/></svg>",
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
  "id": "dongqiudi",
  "name": "懂球帝 · 头条",
  "home": "https://www.dongqiudi.com"
};
export class DongqiudiHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const request_options = {};
      request_options.headers = {
        Referer: source.home,
        ...request_options.headers
      };
      const fetched = await utils.request_json(ctx, "https://api.dongqiudi.com/app/tabs/web/1.json", request_options);
      if (fetched.error) return fetched;
      const data = fetched.data;
      if (!data || typeof data !== 'object') return Result.Err('上游未返回数据对象', 'UPSTREAM_INVALID_RESPONSE');
      if (data.need_force_login) return Result.Err('上游要求登录，请更新并授权 Cookie', 'UPSTREAM_AUTH_REQUIRED');
      if (data.error || data.errors?.length || (typeof data.code === 'number' && data.code < 0) || (data.error_code !== undefined && data.error_code !== 0)) return Result.Err('上游拒绝请求，请检查账户权限或验证页面', 'UPSTREAM_INVALID_RESPONSE');
      const list = utils.array_at(data, "articles");
      if (list.error) return list;
      const rows = list.data;
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        const id = utils.identity(row.id);
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url(row.share || row.url || 'https://www.dongqiudi.com/article/' + encodeURIComponent(id.data), source.home);
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
const script = new DongqiudiHotRank();
export const route = {
  "name": "懂球帝 · 头条",
  "path": "/dongqiudi/app/tabs/web/1.json",
  "url": "www.dongqiudi.com",
  "maintainers": ["findrss"],
  "example": "/dongqiudi/app/tabs/web/1.json",
  "parameters": {},
  "description": "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
  handler: ctx => script.run(ctx),
};
