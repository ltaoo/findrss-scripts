/** HOT */
export const version = "1.0.2";
export const category = "财经";
export const order = 180;
// Favicon: https://img.fastbull.cn/static/cn/images/favicon.ico
export const platform = {
  name: "法布财经",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"fastbull-express-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAClFBMVEUAAAAA6qoA37AC4K0C4a8C4K8A4rEB4K8B4K8B4K8A4a8B4K8A0bkB4K8A5rMA36wB4K8A4a0A4K0AzJkA3a0B4K8B4rEB47IB4bAC26sJn34MhWsGt5AB47EC3a0LlXYPdF0HsYsB5bIB4a8C2aoD0qUFvZUOfGMMi28Ey58D0aQD06UB3q0B3a0QalYbExURZVIDzqEHq4cJnn0VPzYaExURZFIIqIUD1acNhmsVQTcWODAaGBkZIR8VQjgTUUQEyZ4Km3sYLCcUST0MiGwYJyQZHx4aHBsaGhoZHR0XMCsGvJQC2KkSXUwZJyQaGxsYKycYLCgYLSgWPjUFxpsB4rAB3KwIpoMOemIJnn4QaVYQZlMXMSsVRToQa1cEyp4B364Dz6IMim8ZHh0VPjUHs40PdF4TV0gJo4EEzaAB3awC2qsaIB4Od2AFwJYGtpAaFxgPc10FwpgFv5YD0qQC16gSV0gGs40VQzkZHBwMhmsFwJcFvpUEyZ0Mim4ZHhwURToQbFcYKiYaGBgZIiALkXMA5bMZIyEZJCEYKSURYlEOeWAPdV4RY1AWPTQZIB4VRDkUSj4TTD8TSz8NfmUaGRkXNS4YJiMWOzITVkcC16kWODEWOzMHtI4MjHATT0IGuJEOfWQKlHYQZlQaFhcNgGcEzKAUST4Kl3gJpIIXNC0Fv5cTVEYMjXEA57QGvZUEyp8B368QbFgbFhcMh2wTTUAJoH8IroobFRYZJiMZJSILknQIpIIB3q4Jn38IrokZIyASVUYC1acTTEAbERMQZ1QQaFUaFRYaGxoOeWEbExQTSj4ZGhoSWkoC1qgMiG0PcVsPclwPcVwPcFsKmXkJoH4PcFoHr4oC26wLj3IPdl8HsIu1JYWxAAAAFXRSTlMADEeDj4M0re7+M9ALrApH7URLCkS4EVaUAAAB3klEQVQ4y2NgYGBgZGJmwQJYmRgZwICNnYNTFAvg5GBnA8lzcYviBNxcDAw8vKJ4AC8fA78APgUCggysongBKwMLfgUsVFIgJi4BJCUkwEISCABTICklLSMmKyevoKgkqyyqoqqmrqGpBQTaOlAFunr6BoZGxiamZuZGFqKWVtY2tiZ2dnZW9g4SEAWyjk7OLq5u7h6ebl7ePr5+Hv4BTgGBQU7BIaEQBWHhEZHGUdExNrFxCvEJiUnJKalp6RmZmplZECuUsw1ychPz8p0LCouKS0JLywqiyysqq6prahOgbhCrq29obHJya24JCGhtk2r36OhM9uho6uzyUYYokCjq7untc++fMHHSZGOdKYFTpzlP958RPHXmLKgjxRRnz5k7z3++5oKFi0pFtRcvWbpsefKKlS0zS2G+aPVYtXqNx9p16wNmbAjduGnzFpWtydu2IxSIFu6YL7Vz1+7UPda2e2T3Nm7e4rM1ed/+AwehCiQOHT5y9NhxmwMd7SeOn5TYq3dK2uf0GSmpE2dVII6UOHc+N1zjwsVLly5dvHxFd+PVa9dv3LyldvvCNpg3RUPFJNAiERRRyspUTA94FTATSrRC+JO9EKGMw0M46xHOvAwMwiKsWLO/oDBQEgA2ybatSpWMAwAAAABJRU5ErkJggg==\" data-n=\"fastbull-express-favicon\"/></svg>",
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
const express_source = {
  "id": "fastbull-express",
  "name": "法布财经 · 快讯",
  "home": "https://www.fastbull.cn"
};
export class FastbullExpressHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const request_options = {};
      request_options.headers = {
        Referer: express_source.home,
        ...request_options.headers
      };
      const fetched = await utils.request_text(ctx, "https://www.fastbull.com/cn/express-news", request_options);
      if (fetched.error) return fetched;
      const parsed = utils.document_nodes(fetched.data);
      if (parsed.error) return parsed;
      const list = utils.rows(parsed.data, ".content-list.news-list");
      if (list.error) return list;
      const rows = list.data;
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        const id = utils.identity(utils.attribute(row, "[data-href]", "data-href") || utils.attribute(row, "[data-id]", "data-id"));
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url(id.data.startsWith('/') ? id.data : '/cn/fastshort/' + encodeURIComponent(id.data), "https://www.fastbull.com/");
        if (link.error) return link;
        const pinned = false;
        const raw_rank = null;
        const rank = pinned ? null : raw_rank === undefined || raw_rank === null || raw_rank === '' ? null : Number(raw_rank);
        const heat_text = String('' ?? '').trim();
        const heat_number = heat_text === '' ? NaN : Number(heat_text.replace(/,/g, ''));
        entries.push({
          id: express_source.id + ':' + id.data,
          title: utils.plain_text(utils.plain_text(utils.field(row, ".title_name")).match(/【([^】]+)】/)?.[1] || utils.field(row, ".title_name")),
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
        source: express_source.id,
        count: entries.length,
        missing_rank: entries.filter(entry => entry.rank === null && !entry.pinned).length
      });
      return Result.Ok({
        title: express_source.name,
        category,
        link: express_source.home,
        entries
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? 'UPSTREAM_INVALID_RESPONSE');
    }
  }
}

const news_source = {
  "id": "fastbull-news",
  "name": "法布财经 · 头条",
  "home": "https://www.fastbull.cn"
};
export class FastbullNewsHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const request_options = {};
      request_options.headers = {
        Referer: news_source.home,
        ...request_options.headers
      };
      const fetched = await utils.request_text(ctx, "https://www.fastbull.com/cn/news", request_options);
      if (fetched.error) return fetched;
      const parsed = utils.document_nodes(fetched.data);
      if (parsed.error) return parsed;
      const list = utils.rows(parsed.data, ".trending_type");
      if (list.error) return list;
      const rows = list.data;
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        const id = utils.identity(row.attrs.href);
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url(row.attrs.href, "https://www.fastbull.com/");
        if (link.error) return link;
        const pinned = false;
        const raw_rank = null;
        const rank = pinned ? null : raw_rank === undefined || raw_rank === null || raw_rank === '' ? null : Number(raw_rank);
        const heat_text = String('' ?? '').trim();
        const heat_number = heat_text === '' ? NaN : Number(heat_text.replace(/,/g, ''));
        entries.push({
          id: news_source.id + ':' + id.data,
          title: utils.plain_text(utils.field(row, ".title")),
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
        source: news_source.id,
        count: entries.length,
        missing_rank: entries.filter(entry => entry.rank === null && !entry.pinned).length
      });
      return Result.Ok({
        title: news_source.name,
        category,
        link: news_source.home,
        entries
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? 'UPSTREAM_INVALID_RESPONSE');
    }
  }
}

const express_script = new FastbullExpressHotRank();
const news_script = new FastbullNewsHotRank();
export const routes = [
  {
    "name": "法布财经 · 快讯",
    "path": "/fastbull/cn/express-news",
    "url": "www.fastbull.cn",
    "maintainers": ["findrss"],
    "example": "/fastbull/cn/express-news",
    "parameters": {},
    "description": "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
    handler: ctx => express_script.run(ctx),
  },
  {
    "name": "法布财经 · 头条",
    "path": "/fastbull/cn/news",
    "url": "www.fastbull.cn",
    "maintainers": ["findrss"],
    "example": "/fastbull/cn/news",
    "parameters": {},
    "description": "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
    handler: ctx => news_script.run(ctx),
  }
];
