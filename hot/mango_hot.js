/** HOT */
export const version = "1.0.0";
export const category = "娱乐";
export const order = 500;
// Favicon: https://www.mgtv.com/favicon.ico
export const platform = {
  name: "芒果TV",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"mango-hot-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAAEhklEQVRYCbWXa4hVVRTHvZXjlGlZU1FGhaKVhRWZvaQakSLSghT6kkhiSX60wCgiqA99S6y+TfSCMih6KBhGpOMrylDJonJq0pmK1HLSdCofTb/fmb1O2zsP7F77w+/utffZZ+111n6ccytDMvXMKSoVfsfAVLgWTodu2ARroA1+hyGVV/ytTw5WKA3uYHPhARgLJ0GoB+NX2AqrYQN8AbvhSK3BFAGkwc/F0WKYBSdCqAtjC/jko2Ei2Pdv2A6fQGsqv6c8AMecnUoafBj3PAMLvDnTR9hPwkZwGhrgPLgCmuFGuASGg4FGdtZjm51dMGh2IoDpdHwDdBTajGE22qvTm62V07g+HqaAwUwCAzQ7O8DsrE5lv9kxAOf5JbgXQjqYDy+kBqfqUnCQI/A5tME+cG2ooeDUXAX9ZceMtMKH4Po57IM5uDddA7lM3bqswXlfCgbhgL/BN6BD+5nyLhx28EAd2MvA7IwDg47sPIZ9N0yDn6EIwJSdaSXTQWznPDQTw8FVBUbBdYmHKBfDIgbvSdMVQW6kzfXzPER2vOZuKmQGdHZyb3XA36YBr/Q+xAyuPws/VPdLAR2mvTNxVBcDqEWuA58k7jfV0+BlOEpkQJm168G19TXshSJbJ2DUop3c9HF2o+eGc9uYBswuFaYZXAIfwEp4GibYt9YA/sTB22AZck1MiIplFswdVK+EETAZFsFz0FRrAN7nVvoKQmdhmIV8YKsu8HkQ0+XiPgRXw+X1BPATDt6BXLdTOTtvwHZt+NSh5RhuwQZorDUAnbkIV0C5pbAvgykQWTgVczYMtQ0Z9GvgIi5UTwAuvK2wttdV8TuM35kQAzZjS8iAv4Ry3NKIHv+x9MB6C9znIQccDwZzP5wCyky9CH9ZCdUbgH7WwLfhkNIT71Zw398MofcxPgUzVypWZtlQg9HJPabW13LoHoybYGRq2Ef5KpRzn9r/nYtoqLF8j/scJDQJw1d8qBVjfVTy8nhMgf42wWeZY9Mc2e3GbgHLPjpeAezHsyejW7Na7pJVWWMjtmdAoWMNwJOrX6W3ndc85zuqOrk7lsL+rJ/fHp6a7obuSBN2H1WyFufwPvAsH0jtXHAt3AJ7wEOnDTz54mA6A3MOOEVd8KMB+IqsTt0o2i6CHaB0Mh/uhD9A56a9kE/Hi8cV/jjo0/k2a8UHaXopeSo+AVNBfQc7/Sb0+FwJoyGXh8aDcDAN4DUjLwLOUmp7H6VBDcaDaCIsgFngKamPhbDEDr4YOqE6APfyNmjBmSlVsY8baPNe/8jo0NT6DaiPkdAEHkjO9YUwDuwbcmG+bkUnHpHvgu/zXMOpPAV3gafYL3ABOD3ngwOeAx65ptcnNRizNJjaufgo7LZT/C/Q8Zsw2cb/SWZvAzySyuLfkxlQbp+HoQUuhnrlovZFdQhc7S44d4hp3wXlX7eKlbRgNP1scqU2gymulvtax36KefRqu4YOgA/h3t4OXrPuTvG66dYuB9ZWRQC9ZhmI83kD3AZOjdKhT+F60fFe8MPUJ3SBGphB9RnAtsH0DyLcJrCcrPk/AAAAAElFTkSuQmCC\" data-n=\"mango-hot-favicon\"/></svg>",
};
import { utils } from '@findrss/util';
import { HotRankScript, Result } from "@findrss/core";

const source = {
  id: "mango-hot-search",
  name: "芒果TV · 热搜榜",
  home: "https://so.mgtv.com/",
  api: "https://mobileso.bz.mgtv.com/pc/suggest/v1?allowedRC=1&src=mgtv&_support=10000000",
};

const labels = ["热门内容", "综艺", "电视剧", "电影", "动漫"];

export class MangoHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const label = String(ctx.query?.label ?? "热门内容").trim() || "热门内容";
      if (!labels.includes(label)) {
        return Result.Err("label 必须为：热门内容、综艺、电视剧、电影、动漫", "INVALID_PARAMETER");
      }
      const fetched = await utils.request_json(ctx, source.api, {
        headers: { Referer: source.home },
      });
      if (fetched.error) return fetched;
      const data = fetched.data;
      if (!data || typeof data !== "object") return Result.Err("上游未返回数据对象", "UPSTREAM_INVALID_RESPONSE");
      if (typeof data.code === "number" && data.code !== 200) {
        return Result.Err(String(data.msg || "上游返回异常"), "UPSTREAM_INVALID_RESPONSE");
      }
      const groups = utils.array_at(data, "data.topList");
      if (groups.error) return groups;
      const group = groups.data.find(item => item?.label === label);
      if (!group) return Result.Err(`上游未返回「${label}」榜单`, "UPSTREAM_INVALID_RESPONSE");
      const list = utils.array_at(group, "data");
      if (list.error) return list;
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const title = utils.plain_text(row.name);
        if (!title) continue;
        const id = utils.identity(title);
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url("https://so.mgtv.com/so?k=" + encodeURIComponent(title), source.home);
        if (link.error) return link;
        const raw_rank = Number(row.index);
        entries.push({
          id: source.id + ":" + label + ":" + id.data,
          title,
          link: link.data,
          rank: Number.isInteger(raw_rank) && raw_rank > 0 ? raw_rank : null,
          pinned: false,
          heat: { value: null, unit: "热度", text: "" },
        });
      }
      ctx.log("榜单解析完成", {
        source: source.id,
        label,
        count: entries.length,
        missing_rank: entries.filter(entry => entry.rank === null).length,
      });
      return Result.Ok({
        title: label === "热门内容" ? source.name : `芒果TV · ${label}热搜榜`,
        category,
        link: source.home,
        entries,
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? 'UPSTREAM_INVALID_RESPONSE');
    }
  }
}

const script = new MangoHotRank();

export const routes = [
  {
    "name": "芒果TV · 热搜榜",
    "path": "/mango/pc/suggest/v1",
    "url": "so.mgtv.com",
    "maintainers": ["findrss"],
    "example": "/mango/pc/suggest/v1",
    "parameters": {
      label: "查询参数：榜单分组，默认 热门内容；可选 热门内容、综艺、电视剧、电影、动漫"
    },
    "description": "读取芒果TV搜索热搜榜各分组，保留排名；?label=综艺 切换到综艺榜。",
    handler: ctx => script.run(ctx),
  }
];
