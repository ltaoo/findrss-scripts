/** HOT */
export const version = "1.0.1";
export const category = "财经";
export const order = 330;
// Favicon: https://mktnews.net/favicon.ico
export const platform = {
  name: "MKTNews",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"mktnews-flash-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAgCAMAAAAynjhNAAACu1BMVEVMONsAAAB6a+V2ZuSBc+d9b+aIeeiDdOeIe+eGeeeNgemJfeiShuqPguqXiuuUiOuZjeqYjeuckuyckeuek+yglu2gluykmu24r/Gvpu9JNdvDu/PX0vdNOtz///+ekupMONxVQd1TQN1MOdzHOP9QON/FOP+MOP9tOPtgOO5bOOlYOOZWOOVVOORVOONUOONMONxMONtwYOJwYONMONxMONt3aOV3aOR0ZeRMONx9b+eAcuZ9b+WAcOaIe+iGeed8b+WNgOmPgulMONyBdOeVieqYjOuEd+ickeyhluyIe+mjme2poO6KfOiroe6zqvBMONyMgOmxqfC7tPKOgem4sfHEvvNMONyTh+q/uPLNyPWqoO/OyPXW0vc+Kdi7svLW0ffg3fnAufOckexPPNzU0Pbq5/u9tvJeTOBOOtybkOvIw/S6s/FKNtxMONxMONzRzPbEv/RMONxMONxNONxNONzY1PfEvfNMONxNONxOON1NONzTzvbOx/RMONxOON1fTeBTPt5LN9xMONxNOt1MONxMONxMONtNONxMONxMONpMONxMONxMONxMONxMONxOON1OON1NONxMONx4aeSBc+Z8beWKfeiEdud/ceaTh+qNgemHeueCdOadkuyXi+qRhOmLfuiGeOemnO2gleyaj+uUiOqOgumvpu+poO6jme2ekuyYjOuOgelsW+K5sfGyqvCto++nne6hl+yZjutxYeNOOtzCu/O8tPK2rvGwp++qoe6jmO1QPd1MN9zLxfXFv/O/uPK5svG0q/CtpO+DdedRPt1LN9zV0PbPyfXJw/TDvPO9tfK3r/FUQd7e2vjY0/fSzfbMxvXGwPRZR97n5frh3vnb1/jV0ffQyvXq6Pvr6fvk4fre2/jZ1Peajuvm4/rp5/vi3/nc2PhPPN2Sh+rg3Pnn5PpNOdxHXeffAAAAk3RSTlMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACADA2C8wkKgvP2CoP3CoP3CoP3gQqD9wqE9wqE9wqE9/cKhPcKhfiCCoX4CH33CAd89f76hoH1ubj7+8IllP3tzC+W+H+51zv5ViO83UZYJsQb/qMS/I8Lu4QHlHyf8uclKslWFywUAAABrElEQVQoz2MwMGRgYMQKmJiNjBlMDEyxy7OwmplbMEy2xC7Pxm5lbTOFYTJ2eQ5OWzv7qdOA0tjkubgdHJ2mz5gJkp5s6Ywmz8Pr4uo2a/acuWBpdHk+fncPz3nzFyxcBJFGlRcQ9PL2Wbxk6bLlc6DSyPJCwr5+/itWrlq9Zu06mPTkAJi8iGhgUPD6DRs3bd6ydRtcGiYvJh4SGrZ9x85du/dM27sPIT05IBwoLyEZERm1/8DBQ4ePHD12fDKSNEheSjo6JvbEyVOnz5xdcO74ZBRpoHxcfELi+QsXL11OSr4ClEWVnhyQkpp29dr1GzdPpWeAZNGkJ2dm3bp95+69i9k5uZORpPPyIfTxY/cfPHz0uKCQtQhZurikFCr/5Omz52XlMrIo0hWVVdUQ1r4Xc2pq5eQVUKXrFOqh8pO3NTQqKmFIM8Dlm5pblDGkVRDyrW3tGNKqagz1HVD54s6ubjRpRlV1hHxATy+6NKOqBkK+rx9DmlFVEyE/GVOaUVULTR5VmlFVG1UeTZpRVQdFHl2aUVUXWR5DmlFVj2FCKW5pRlV9homToNIAyx55OUe3IGYAAAAASUVORK5CYII=\" data-n=\"mktnews-flash-favicon\"/></svg>",
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
  "id": "mktnews-flash",
  "name": "MKTNews · 快讯",
  "home": "https://mktnews.net"
};
export class MktnewsFlashHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const request_options = {
        headers: {
          Origin: "https://mktnews.net",
          Referer: "https://mktnews.net/"
        }
      };
      request_options.headers = {
        Referer: source.home,
        ...request_options.headers
      };
      const fetched = await utils.request_json(ctx, "https://api.mktnews.net/api/flash?type=0&limit=50", request_options);
      if (fetched.error) return fetched;
      const data = fetched.data;
      if (!data || typeof data !== 'object') return Result.Err('上游未返回数据对象', 'UPSTREAM_INVALID_RESPONSE');
      if (data.need_force_login) return Result.Err('上游要求登录，请更新并授权 Cookie', 'UPSTREAM_AUTH_REQUIRED');
      if (data.error || data.errors?.length || (typeof data.code === 'number' && data.code < 0) || (data.error_code !== undefined && data.error_code !== 0)) return Result.Err('上游拒绝请求，请检查账户权限或验证页面', 'UPSTREAM_INVALID_RESPONSE');
      const list = utils.array_at(data, "data");
      if (list.error) return list;
      const rows = list.data;
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        const id = utils.identity(row.id);
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url('https://mktnews.net/flashDetail.html?id=' + encodeURIComponent(id.data), source.home);
        if (link.error) return link;
        const pinned = false;
        const raw_rank = null;
        const rank = pinned ? null : raw_rank === undefined || raw_rank === null || raw_rank === '' ? null : Number(raw_rank);
        const heat_text = String('' ?? '').trim();
        const heat_number = heat_text === '' ? NaN : Number(heat_text.replace(/,/g, ''));
        entries.push({
          id: source.id + ':' + id.data,
          title: utils.plain_text(row.data?.title || utils.plain_text(row.data?.content).match(/【([^】]+)】/)?.[1] || row.data?.content),
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
const script = new MktnewsFlashHotRank();
export const route = {
  "name": "MKTNews · 快讯",
  "path": "/mktnews/flash",
  "url": "mktnews.net",
  "maintainers": ["findrss"],
  "example": "/mktnews/flash",
  "parameters": {},
  "description": "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
  handler: ctx => script.run(ctx),
};
