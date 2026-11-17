import { utils } from "@findrss/util";
import { RSSScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const tags = ["剧集", "视频"];
export const platform = {"name":"芒果TV","icon":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"mango-hot-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAAEhklEQVRYCbWXa4hVVRTHvZXjlGlZU1FGhaKVhRWZvaQakSLSghT6kkhiSX60wCgiqA99S6y+TfSCMih6KBhGpOMrylDJonJq0pmK1HLSdCofTb/fmb1O2zsP7F77w+/utffZZ+111n6ccytDMvXMKSoVfsfAVLgWTodu2ARroA1+hyGVV/ytTw5WKA3uYHPhARgLJ0GoB+NX2AqrYQN8AbvhSK3BFAGkwc/F0WKYBSdCqAtjC/jko2Ei2Pdv2A6fQGsqv6c8AMecnUoafBj3PAMLvDnTR9hPwkZwGhrgPLgCmuFGuASGg4FGdtZjm51dMGh2IoDpdHwDdBTajGE22qvTm62V07g+HqaAwUwCAzQ7O8DsrE5lv9kxAOf5JbgXQjqYDy+kBqfqUnCQI/A5tME+cG2ooeDUXAX9ZceMtMKH4Po57IM5uDddA7lM3bqswXlfCgbhgL/BN6BD+5nyLhx28EAd2MvA7IwDg47sPIZ9N0yDn6EIwJSdaSXTQWznPDQTw8FVBUbBdYmHKBfDIgbvSdMVQW6kzfXzPER2vOZuKmQGdHZyb3XA36YBr/Q+xAyuPws/VPdLAR2mvTNxVBcDqEWuA58k7jfV0+BlOEpkQJm168G19TXshSJbJ2DUop3c9HF2o+eGc9uYBswuFaYZXAIfwEp4GibYt9YA/sTB22AZck1MiIplFswdVK+EETAZFsFz0FRrAN7nVvoKQmdhmIV8YKsu8HkQ0+XiPgRXw+X1BPATDt6BXLdTOTtvwHZt+NSh5RhuwQZorDUAnbkIV0C5pbAvgykQWTgVczYMtQ0Z9GvgIi5UTwAuvK2wttdV8TuM35kQAzZjS8iAv4Ry3NKIHv+x9MB6C9znIQccDwZzP5wCyky9CH9ZCdUbgH7WwLfhkNIT71Zw398MofcxPgUzVypWZtlQg9HJPabW13LoHoybYGRq2Ef5KpRzn9r/nYtoqLF8j/scJDQJw1d8qBVjfVTy8nhMgf42wWeZY9Mc2e3GbgHLPjpeAezHsyejW7Na7pJVWWMjtmdAoWMNwJOrX6W3ndc85zuqOrk7lsL+rJ/fHp6a7obuSBN2H1WyFufwPvAsH0jtXHAt3AJ7wEOnDTz54mA6A3MOOEVd8KMB+IqsTt0o2i6CHaB0Mh/uhD9A56a9kE/Hi8cV/jjo0/k2a8UHaXopeSo+AVNBfQc7/Sb0+FwJoyGXh8aDcDAN4DUjLwLOUmp7H6VBDcaDaCIsgFngKamPhbDEDr4YOqE6APfyNmjBmSlVsY8baPNe/8jo0NT6DaiPkdAEHkjO9YUwDuwbcmG+bkUnHpHvgu/zXMOpPAV3gafYL3ABOD3ngwOeAx65ptcnNRizNJjaufgo7LZT/C/Q8Zsw2cb/SWZvAzySyuLfkxlQbp+HoQUuhnrlovZFdQhc7S44d4hp3wXlX7eKlbRgNP1scqU2gymulvtax36KefRqu4YOgA/h3t4OXrPuTvG66dYuB9ZWRQC9ZhmI83kD3AZOjdKhT+F60fFe8MPUJ3SBGphB9RnAtsH0DyLcJrCcrPk/AAAAAElFTkSuQmCC\" data-n=\"mango-hot-favicon\"/></svg>"};

export class MgtvSeriesRSS extends RSSScript {
  async fetch(ctx) {
    try {
      const { collection_id, video_id } = ctx.params;
      if (![collection_id, video_id].every(id => typeof id === "string" && /^[1-9]\d{0,19}$/.test(id))) return Result.Err("collection_id 和 video_id 必须为官网播放页中的数字 ID", "INVALID_PARAMETER");
      const link = "https://www.mgtv.com/b/" + collection_id + "/" + video_id + ".html";
      const items = [], seen = new Set(), listed = new Set();
      let info, total_pages, count;
      for (let page = 1; page <= 100; page++) {
        const fetched = await utils.request_json(ctx, "https://pcweb.api.mgtv.com/episode/list?video_id=" + video_id + "&page=" + page + "&size=50", { headers: { Referer: link } });
        if (fetched.error) return fetched;
        const data = fetched.data?.data;
        if (String(fetched.data?.code) !== "200" || !Array.isArray(data?.list) || !utils.plain_text(data.info?.title)) throw new Error("芒果TV未返回有效分集目录");
        const pages = Number(data.total_page), current_count = Number(data.count);
        if (!Number.isInteger(pages) || pages < 1 || pages > 100 || Number(data.current_page) !== page || !Number.isInteger(current_count) || current_count < 0 || current_count > 5000) throw new Error("芒果TV分集分页信息无效");
        if (page === 1) { info = data.info; total_pages = pages; count = current_count; }
        if (pages !== total_pages || current_count !== count || data.info.title !== info.title) throw new Error("芒果TV分页期间剧集资料发生变化");
        let added = 0;
        for (const row of data.list) {
          if (row?.video_id != null) listed.add(String(row.video_id));
          if (String(row?.isIntact) !== "1" || String(row.isnew) === "2") continue;
          const identity = utils.identity(row.video_id);
          if (identity.error) return identity;
          const id = identity.data;
          if (!/^[1-9]\d{0,19}$/.test(id) || String(row.clip_id) !== collection_id || row.url !== "/b/" + collection_id + "/" + id + ".html") throw new Error("芒果TV分集所属专辑或链接不匹配");
          if (seen.has(id)) continue;
          seen.add(id); added++;
          const image = utils.absolute_url(row.img);
          if (image.error) return image;
          // ts is the catalogue upload time; it may precede the displayed release date.
          const published = utils.timestamp(row.t4);
          if (published.error) return published;
          items.push({ id: "mgtv:episode:" + collection_id + ":" + id, title: utils.plain_text(row.t3 || row.t2 || row.t4) || info.title + " 第" + row.t1 + "集", link: "https://www.mgtv.com" + row.url, description: utils.plain_text(row.t2), image: image.data, ...(published.data ? { published: published.data } : {}) });
        }
        if (page < total_pages && added === 0) throw new Error("芒果TV分集分页未推进");
        if (page === total_pages) break;
      }
      if (!items.length || listed.size < count) throw new Error("芒果TV正片目录为空或未加载完整");
      ctx.log("芒果TV分集解析完成", { collection_id, count: items.length });
      return Result.Ok({ id: "mgtv:series:" + collection_id, title: utils.plain_text(info.title) + " · 剧集更新", link, description: utils.plain_text(info.desc), language: "zh-cn", items: items.reverse() });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new MgtvSeriesRSS();
export const route = {
  name: "芒果TV剧集", path: "/mgtv/series/:collection_id/:video_id", url: "www.mgtv.com", maintainers: ["findrss"],
  example: "/mgtv/series/914227/24771585", parameters: { collection_id: "官网 /b/<专辑 ID>/<视频 ID>.html 中的专辑 ID", video_id: "同一播放页中的视频 ID，用于定位完整分集目录" },
  description: "分页读取已发布的完整视频目录，过滤预告与片花，保留封面、官网播放链接和上游提供的发行日期；VIP 正片保留官网权限要求。",
  handler: ctx => script.run(ctx),
};
