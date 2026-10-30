/** HOT */
export const version = "1.0.1";
export const category = "综合";
export const order = 450;
// Favicon: https://www.thepaper.cn/favicon.ico
export const platform = {
  name: "澎湃新闻",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"thepaper-hot-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABVlBMVEUAAAAjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBUjGBVAnzxTAAAAcXRSTlMALLkcXOdMkfckPt9o7XZ0CARCoanvJg5szddQDGBuOCD1wwp8ZHqjEGbR1b14z/EatQI0RIMGKP2TFuM8mzrdInA2WOESgfkYx0a7SpflcumrLpUUTvtqKr8w86evUovry8liiZ+th0jTncGz2VYefu/podsAAAIiSURBVDjLfVL7WxJREB1K5JEZKgGaJOuiLKigiLCxKiKLPCXIWAhLTbLMnuf//6XZB4sffR/zy8ydOffemXOGaMIcT57SNJtxYnYqwAW3ZyrAi2dT6zSH53PzL3xGvPBfdXHJ/xK6BYiCoeWVV3ZlNfx6jV1EMMpYF4mi7DdswCafYhJRPLGF7R1jjEgSqV0bIM4zYi9NlN6HlzIHHuNSbPx5NqS/rN/MyW8Sxtt5BYdjwJHxdYijY5mDwglRMVV81H7Ee1ryx/JMgwooG0FO5fN2tUz7ZeunswrgkianTybVk+yq6KuWakCtLlYnCWqgSectVXUDzrdlV1vo8Djky7wbAS7wnrrcmtOvlKV1PWCeaFerxC1AFD2Weccb7CvRNipwm+N9gDYwAae4jFsBUvUa5K4FwEfriU/Aou7jEK4uRhLkeKBW1gQ0AePSNRTGQnX4zM1pjNQMaNC1PCyaYhYSZ0xd5WbMdFWAg9ejEfhsqs0qSbfCYEyE2EKfaAjxyAIcUDU0mO10bcQtayy1axQ2yu6QkfwC3I04/YpN+oZ7OoazBXkpkzOoZNlLFuAchZ78PU0LD81lQIPW07M/gJ82gC1M2evaL9n4ZYaTvzlULcCdPpwvuGf1iCTL72kDQsPuAaxH0yp36izWnxXc/I2MmtwGtrLU1/Ry+0pvcNi6fIiMiXBB9vJGc9tQ+npCGnarj1dG7N3rLqwqyfrkvv0DK+qSySkXbogAAAAASUVORK5CYII=\" data-n=\"thepaper-hot-favicon\"/></svg>",
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
  "id": "thepaper",
  "name": "澎湃新闻 · 热榜",
  "home": "https://www.thepaper.cn"
};
export class ThepaperHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const request_options = {};
      request_options.headers = {
        Referer: source.home,
        ...request_options.headers
      };
      const fetched = await utils.request_json(ctx, "https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar", request_options);
      if (fetched.error) return fetched;
      const data = fetched.data;
      if (!data || typeof data !== 'object') return Result.Err('上游未返回数据对象', 'UPSTREAM_INVALID_RESPONSE');
      if (data.need_force_login) return Result.Err('上游要求登录，请更新并授权 Cookie', 'UPSTREAM_AUTH_REQUIRED');
      if (data.error || data.errors?.length || (typeof data.code === 'number' && data.code < 0) || (data.error_code !== undefined && data.error_code !== 0)) return Result.Err('上游拒绝请求，请检查账户权限或验证页面', 'UPSTREAM_INVALID_RESPONSE');
      const list = utils.array_at(data, "data.hotNews");
      if (list.error) return list;
      const rows = list.data;
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        const id = utils.identity(row.contId);
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url('https://www.thepaper.cn/newsDetail_forward_' + encodeURIComponent(id.data), source.home);
        if (link.error) return link;
        const pinned = false;
        const raw_rank = row.rank;
        const rank = pinned ? null : raw_rank === undefined || raw_rank === null || raw_rank === '' ? null : Number(raw_rank);
        const heat_text = String(row.hotValue ?? '').trim();
        const heat_number = heat_text === '' ? NaN : Number(heat_text.replace(/,/g, ''));
        entries.push({
          id: source.id + ':' + id.data,
          title: utils.plain_text(row.name),
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
const script = new ThepaperHotRank();
export const route = {
  "name": "澎湃新闻 · 热榜",
  "path": "/thepaper/contentapi/wwwIndex/rightSidebar",
  "url": "www.thepaper.cn",
  "maintainers": ["findrss"],
  "example": "/thepaper/contentapi/wwwIndex/rightSidebar",
  "parameters": {},
  "description": "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
  handler: ctx => script.run(ctx),
};
