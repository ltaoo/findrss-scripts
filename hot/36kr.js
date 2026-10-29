/** HOT */
export const version = "1.0.3";
export const category = "科技";
export const order = 10;
// Favicon: https://www.36kr.com/favicon.ico
export const platform = {
  name: "36氪",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"36kr-quick-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAyVBMVEUAAAAwhf0whv0vhf3///8whf0vhf0whv0whv0whf0xhv1Alf8whv0whv0zjP8vhv0whv1Jkv8vhv0vhvw1jf8vhv0vhv1Vqv8vhf0xh/8zhv8whv0whfwvhfwwhf8xif8whvwvh/8whvwwhf0whvwxhv8vh/0vhf0yh/8vhv01h/8whfwwhf0whv0wiP8vhv0whvwyh/8xhv8vhf01iv8vhv0vhf0whf0whvwxhv8whf07if8vhf0xh/wwhf0wiP8whv0whvwvhfxuG9jBAAAAQnRSTlMAhvriAZv53/BrfgzqcBTy4QeNYR341wOdUyj8y6xFNL5Gte+7OWz9QugiyZmeOs7AMxX3GN3YlatU6w1xYtZPmsrwc20MAAAA9ElEQVQ4y72TaVvCMAyAyyEoGyAgoG4iiCIglwd4IKD5/z+KpGxpd+Tr8mF5m7591q2pUllELg9QCLh4VgIoxwQswXnAF8hQiQlgBMdFdh1ZqBBXlSjU6oiXDVloEraUKFy1kTpdWbgmulGicOsh+EoW7gh6snBPuW/Kg4ch1G3hkfITz4+eaWwJY0oTnp/SAUSEF0ouCzM9n2fBm+sCLEJhiYPV6xsLYfAm33HRh/UVHD1TXKs0wTfFTVz4/KLntyj8bO3DShF+g+PeCUKhEWmYpNCKtlxC2OtXm6a1Bf3XDyfmtrcFvDjeX8B8cXA3/yqjOAJzWVJ58cAFyAAAAABJRU5ErkJggg==\" data-n=\"36kr-quick-favicon\"/></svg>",
};
import { utils } from '@findrss/util';
export const permissions = {
  cookies: [{
    id: "kr36",
    origin: "https://36kr.com",
    path_prefix: "/hot-list/renqi/",
    names: ["_wafchallengeid", "_waf_verification_proof"],
    purpose: "携带 36氪访问验证 Cookie 读取人气榜",
  }],
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
const quick_source = {
  "id": "36kr-quick",
  "name": "36氪 · 快讯",
  "home": "https://36kr.com"
};
export class Source36krQuickHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const request_options = {};
      request_options.headers = {
        Referer: quick_source.home,
        ...request_options.headers
      };
      const fetched = await utils.request_text(ctx, "https://www.36kr.com/newsflashes", request_options);
      if (fetched.error) return fetched;
      const parsed = utils.document_nodes(fetched.data);
      if (parsed.error) return parsed;
      const list = utils.rows(parsed.data, ".newsflash-item");
      if (list.error) return list;
      const rows = list.data;
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        const id = utils.identity(utils.attribute(row, "a.item-title", "href"));
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url(utils.attribute(row, "a.item-title", "href"), "https://www.36kr.com/");
        if (link.error) return link;
        const pinned = false;
        const raw_rank = null;
        const rank = pinned ? null : raw_rank === undefined || raw_rank === null || raw_rank === '' ? null : Number(raw_rank);
        const heat_text = String('' ?? '').trim();
        const heat_number = heat_text === '' ? NaN : Number(heat_text.replace(/,/g, ''));
        entries.push({
          id: quick_source.id + ':' + id.data,
          title: utils.plain_text(utils.field(row, "a.item-title")),
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
        source: quick_source.id,
        count: entries.length,
        missing_rank: entries.filter(entry => entry.rank === null && !entry.pinned).length
      });
      return Result.Ok({
        title: quick_source.name,
        category,
        link: quick_source.home,
        entries
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? 'UPSTREAM_INVALID_RESPONSE');
    }
  }
}

const renqi_source = {
  "id": "36kr-renqi",
  "name": "36氪 · 人气榜",
  "home": "https://36kr.com"
};
export class Source36krRenqiHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const day = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
      const acquired = await ctx.cookies.get("kr36");
      if (acquired.error) return acquired;
      const fetched = await utils.request_text(ctx, "https://36kr.com/hot-list/renqi/" + day + "/1", {
        cookies: acquired.data,
        headers: {
          Referer: renqi_source.home,
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36",
        },
      });
      if (fetched.error) return fetched;
      if (/__waf_verification_challenge|_wafchallengeid|正在进行安全检测/.test(fetched.data) && !/window\.initialState\s*=/.test(fetched.data)) {
        return Result.Err("36氪返回访问验证页，请在浏览器完成验证后同步并授权 36kr.com 的验证 Cookie；若仍失败，可能是上游限制了服务端 IP", "UPSTREAM_AUTH_REQUIRED");
      }
      const parsed = utils.embedded_json(fetched.data, /window\.initialState\s*=/);
      if (parsed.error) return parsed;
      const list = utils.array_at(parsed.data, "hotListDetail.articleList.itemList");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("36氪人气榜为空", "UPSTREAM_INVALID_RESPONSE");
      const rows = list.data;
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        const id = utils.identity(row.itemId);
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url('/p/' + encodeURIComponent(id.data), renqi_source.home);
        if (link.error) return link;
        const pinned = false;
        const raw_rank = row.rank;
        const rank = pinned ? null : raw_rank === undefined || raw_rank === null || raw_rank === '' ? null : Number(raw_rank);
        // 页面将 statHot 显示为 w（万）热度。
        const raw_heat = String(row.statHot ?? '').trim();
        const heat_text = raw_heat === '' ? '' : raw_heat + 'w 热度';
        const heat_number = raw_heat === '' ? NaN : Math.round(Number(raw_heat) * 10000);
        entries.push({
          id: renqi_source.id + ':/p/' + id.data,
          title: utils.plain_text(row.widgetTitle),
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
        source: renqi_source.id,
        count: entries.length,
        missing_rank: entries.filter(entry => entry.rank === null && !entry.pinned).length
      });
      return Result.Ok({
        title: renqi_source.name,
        category,
        link: renqi_source.home,
        entries
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? 'UPSTREAM_INVALID_RESPONSE');
    }
  }
}

const quick_script = new Source36krQuickHotRank();
const renqi_script = new Source36krRenqiHotRank();
export const routes = [
  {
    "name": "36氪 · 快讯",
    "path": "/36kr/quick",
    "url": "36kr.com",
    "maintainers": ["findrss"],
    "example": "/36kr/quick",
    "parameters": {},
    "description": "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
    handler: ctx => quick_script.run(ctx),
  },
  {
    "name": "36氪 · 人气榜",
    "path": "/36kr/renqi",
    "url": "36kr.com",
    "maintainers": ["findrss"],
    "example": "/36kr/renqi",
    "parameters": {},
    "description": "读取人气榜第一页，保留上游排名与热度；未知值为 null。需授权 36kr.com 验证 Cookie；遇到验证页请在浏览器完成验证后同步 Cookie。",
    handler: ctx => renqi_script.run(ctx),
  }
];
