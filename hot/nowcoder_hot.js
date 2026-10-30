/** HOT */
export const version = "1.0.1";
export const category = "社区";
export const order = 340;
// Favicon: https://static.nowcoder.com/fe/file/images/nowpick/web/www-favicon.ico
export const platform = {
  name: "牛客",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"nowcoder-hot-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAC31BMVEX////////////////////////////////////////////////////29vb+/v739/jNztCdoKP8/PyjpqnGyMrp6upYXWKBhYny8vPO0NHMzc/Nz9Dv8PCHi49TWF7k5OWrrbAtMzpna3D19fasrrE3PUQ1O0I1O0GanKD4+flwdHkrMTigo6aEiIwsMjmytLebnqIvNTx4fIGanaCYm596foItNDuDh4u5u706QEZ8gISFiY0qMThzd3zy8/Odn6PLzc/X2NlGS1GeoKT29/cwNj0qMDh+gYavsbRPVVugpKnt7/GcnqL7+/zY3N7x8vPw8vSmq69RVlymqKv19vfn5ub+3sP/yZz/+fGcn6Pp6eqeoaSUl5qUl5ubnqHh4uP/8eb/x5j/69r/+fP/yp7+3L7p5+bz9PX//v3/5tD/r2z/ew//fhb/59GcoKXP0NIxNz4zOT+ws7b/9On/n1H/cwL/yJz/6tj/ghz/eQz/q2b/48z//fz/7+L/uX//gBn/cwP/lDv/1LH///2cn6LMztD39/fIyszAwsS+wMK8vsHDxsnw49n/oVP/cQD/olb/9Oz/2Lj/l0H/dAT/fhX/tXn/7t//zqb/iir/dAP/jjL/9ezt7u6rrrDi4uP/olX/cQH/9u//zKL/kTf/iSf/y5///v7/cAD/dgf/t3z/9Ou3ubszOUCcoKT/9er/o1f/cgH/oFL/8uf/9u7/vIX/dwr/pl3//Pr/8+n/hSD/kTa9vsG4u77p3tT/8uj9/v7n6On/+vb/0az/uH7/6db/snL/dAb/n0//8uScn6T/qmX/oVX/8eXb3N1SV12jp6r/9ev/pVr/dQf/fBH/r23/5tL/38b/oVT/jjH/6tb/m0n/pl7Lzc4yOD+DiI3/kjn/nk7/3MD//fuFiIz/+fU0OkHFx8lUWV9kaW5kaG1WW2CEh4u6u75LUFdGS1JFS1FJTlT7+/vm5+jo6en6+vp+0zt0AAAADHRSTlMAA0Sy8wJo6UXosfIV/j6hAAAB+klEQVQ4y2NgYGRiZuHBCliYmRgZGFjZ2HlwAnY2VgYOTh48gJODgYsHL+Bi4MavgJsBQvPyocvw8UOEIAoEBIUwFAiLIBSIionz8EhISsGBtAwPj6ycPFyBgqKSMo+Kqpo6FKipafBoamnrwBXo6qnq8xgYGhmbgIGxqZk5j4WlnhUfTIG1jaGtnb2aA8x+RydnFytXN3e4CR6eXt48PmpSMAW+fv48AYFBwXAFIaFh4RGRagJR0TGxMXHxPAmJSckpqWnpMAUZmVnZObl5avkWaq4FroVFxSWlZeUVlVXVNRAFtXX1DY1NzS1qrW3tHZ1d3T29ff0TMiZOmjxl6jSQgukzZs4Kn80DdIPAHI+583iK5y/oTwBqXbho8cwlS5cx1FQtX7FyFQ9IQf7qNYZr163fsHET2Kmbt2xdvm07A8+OLTtLd01PBpkgsXvP3vV98/ftP+DCc/BQ48yKwwkgNyw7cnTKseMnToK8uf3UgtNneM6eO3/h4qXLV65mQL2Zce36jZtrQQo237oNNP/O3XvT7j94+AgRmzwHd/C0gBTU7DgI5Emtecyz6gkPUnTzgB0JD0mQAhhAUvD0ma8mGPiKYFUQp/j8xUswePFK7zUWBW/evnsPBe8+KGBR8DHqExx8/oJFAQ5AONkTzDgEsx7BzEso+wMAGHPNg+lrMq8AAAAASUVORK5CYII=\" data-n=\"nowcoder-hot-favicon\"/></svg>",
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
  "id": "nowcoder",
  "name": "牛客",
  "home": "https://www.nowcoder.com"
};
export class NowcoderHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const request_options = {};
      request_options.headers = {
        Referer: source.home,
        ...request_options.headers
      };
      const fetched = await utils.request_json(ctx, "https://gw-c.nowcoder.com/api/sparta/hot-search/top-hot-pc?size=20&_=" + Date.now() + "&t=", request_options);
      if (fetched.error) return fetched;
      const data = fetched.data;
      if (!data || typeof data !== 'object') return Result.Err('上游未返回数据对象', 'UPSTREAM_INVALID_RESPONSE');
      if (data.need_force_login) return Result.Err('上游要求登录，请更新并授权 Cookie', 'UPSTREAM_AUTH_REQUIRED');
      if (data.error || data.errors?.length || (typeof data.code === 'number' && data.code < 0) || (data.error_code !== undefined && data.error_code !== 0)) return Result.Err('上游拒绝请求，请检查账户权限或验证页面', 'UPSTREAM_INVALID_RESPONSE');
      const list = utils.array_at(data, "data.result");
      if (list.error) return list;
      const rows = list.data;
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        if (row.type !== 74 && row.type !== 0) continue;
        const id = utils.identity(row.type === 74 ? row.uuid : row.id);
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url('https://www.nowcoder.com/' + (row.type === 74 ? 'feed/main/detail/' : 'discuss/') + encodeURIComponent(id.data), source.home);
        if (link.error) return link;
        const pinned = false;
        const raw_rank = row.rank;
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
const script = new NowcoderHotRank();
export const route = {
  "name": "牛客",
  "path": "/nowcoder/hot",
  "url": "www.nowcoder.com",
  "maintainers": ["findrss"],
  "example": "/nowcoder/hot",
  "parameters": {},
  "description": "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
  handler: ctx => script.run(ctx),
};
