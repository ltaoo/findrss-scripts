/** HOT */
import { utils } from "@findrss/util";
export const version = "1.0.0";
export const category = "视频";
export const order = 720;
// Favicon: https://www.google.com/s2/favicons?domain=www.dailymotion.com&sz=32
export const platform = { name: "Dailymotion", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"dailymotion-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAE1UlEQVR4nNVXTUhrRxT+JgSqxoBE1IK1CgZRQXj+IOKr/7aCVAwI2qWY100X0k2zcFMKkoVFEBFdaFyKIoroE/Q98F9XTywIFsEilihVUAL+PUGc8s3LDTfx3iSvrnpgyNyZyZwz35nznTOi6efvEY9sja6mWCyW76SUNQAqhRBfA3AEp6+klH8DeC+E+PD09PTumx/rAvHsK2IZsONbLwDwKwAXgC/ishZ4ADAH4LdKd82f/8mArdHVFCFEjxCi+zMUPxMp5e9SSq8ZIhajwe2xtUwhxKoQ4peXKKdwD+7FPeMyYMe3XiCE8AshXvH78fExZovDiFdCiL+C7jQ3YPuTlXva9/X1Ne7v71U/MTHRtHGd1qIYRCQPIpGwRvj8rQY5N3I6nVhcXERGRgbOz89NT2iz2XB8fIyFhQXMzs7i6OhIGWa1hrbXy9ut0dU67U5YdTD1aLBTtJNTOWVmZgbj4+Ow2+3PdszOzkZ5eTncbje6u7sxODiIvr4+QyOCOnoAeNQAo8ButxfY7Xapb7zATqdTBgKB0K/H41Hj0Zrb7VZrfT6f+k5MTAzbN9g+Uid1qzDc8a1PAujQW0oXZGZm4uDgAI2Njcq/hJiuuLu7C627vb3F6ekphoaGsLcXuj7w+/1YXl5WqBihBmCq0l3zg7DZbGS4f4zCjUo9Hg96e3vR3t6O2tpa5OfnY3p6OrQmNTUV9fX1qKiowNraGrq6unB1daXmAoEAvF6vcoeBEQ9PT09fcqLdAKIwVwwMDEi/3y83NzdV3wj64uJiubS0JHd3d6XD4Qi5g/+jC01c0S6Sk5P7goRjKnok9vf3FbRJSUlq7uzsDGNjY6FTb25u4vLyEi4XmRs4PDyEz+czREFKOUwD9vS3P5oR9GdLS0vYeFZWFoqKipSL5ubmUF1djfn5eZSVlalwpOEdHR0oLS01MuAPDl5Gc0GkO4yay+VSN19bo3cV5+gG9g32vLToUmpM4QkiG2OdJ7+5uUFDQ4Nat7u7i5ycHNU/OTlRkeJwOIxY0mGYjF4qJmFnKFYWE7FQoP+jCS9ccnIyNjY21HdeXp5CQWNJUjUvKdGKkCsrKxkhhCOaciro7OxU3wkJCWHzaWlpyM3NVfNUUlxcrC4lKZlCitbySCQtUzdHdgBEjQKeqLm5WTHg8PCwGtPCcGVlBSMjIyGUmAdISBorNjU1YWpqymzr91YhxDqAnxBDmO0uLi5QWFgYinG98ORUTsNaW1vVGMOWyYwZ0gB+JqYPVhaQFovlIVblw1teVVWlfEuyYV6gpKSkoKSkJETFVK6RUn9/v6Ji8oEJFb/TsuFktNivrq4Oy4bsk3IZ76RfZj7SrZ4bGPsxMuKkqkd16fhjPEZ4vV6lPFKh1mhkHOlYhqVjyvbYWtScoEUD0256erqiXpKMviBpa2tT3xr3m1VFrJRfv6lVBYlVN+gF8K1ZXqAPyXj078TEhDKEDKcvyahYiwgzMiL/B3U9fxdsfyrH/WYoaEhot559GqRdOkqUWpDyIKXMff2m9tTQAEqwdN6LFhXkdNaMWmhFURgphZEvJUvkCi6glSpVmggVEmL+xqM8CPtXRs80i9EfCJGUso6XBS+Th+DTrE4P+//jcYoI0T3Py4LRYvQ83yG1f87z/F8Czxy06AeZmwAAAABJRU5ErkJggg==\" data-n=\"dailymotion-favicon\"/></svg>" };
export const tags = ["视频", "英语", "日语"];

export class DailymotionHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const country = String(ctx.params.country || "us").toLowerCase();
      if (!/^[a-z]{2}$/.test(country)) return Result.Err("country 使用 us、jp 等两位地区代码", "INVALID_PARAMETER");
      const fetched = await utils.request_json(ctx, "https://api.dailymotion.com/videos?sort=trending&fields=id,title,url,thumbnail_240_url,views_total&limit=30&country=" + country);
      if (fetched.error) return fetched;
      const list = utils.array_at(fetched.data, "list");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("Dailymotion 热门视频列表为空", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const id = row?.id;
        if (typeof id !== "string" || !/^[a-zA-Z0-9]+$/.test(id)) return Result.Err("Dailymotion 视频 ID 无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(id)) continue;
        seen.add(id);
        const thumbnail = utils.absolute_url(row.thumbnail_240_url);
        if (thumbnail.error) return thumbnail;
        entries.push({ id: "dailymotion:" + id, title: utils.plain_text(row.title), link: "https://www.dailymotion.com/video/" + id,
          ...(thumbnail.data ? { thumbnail: thumbnail.data } : {}), rank: null, pinned: false,
          heat: { value: row.views_total ?? null, unit: "累计播放", text: String(row.views_total ?? "") } });
      }
      return Result.Ok({ category, title: "Dailymotion · " + country.toUpperCase() + " · 热门视频", link: "https://www.dailymotion.com/", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}
const script = new DailymotionHotRank();
export const route = { name: "Dailymotion · 热门视频", path: "/dailymotion/hot/:country?", url: "www.dailymotion.com",
  maintainers: ["findrss"], example: "/dailymotion/hot/us", parameters: { country: "us（默认）、jp、gb 等地区代码" },
  description: "官方 API trending 前 30 条，保留累计播放量及顺序，无显式排名，rank 为 null。", handler: ctx => script.run(ctx) };
