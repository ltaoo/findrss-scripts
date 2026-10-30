/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const category = "社交";
export const order = 650;
// Favicon: https://www.google.com/s2/favicons?domain=mastodon.social&sz=32
export const platform = { name: "Mastodon", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"mastodon-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEoUlEQVR4nLWXa4hVVRTHf+ucM/dOpjaTGX4wccRRJ0XHEMK0SUoroU/CmIqRpkQfEkIK6ksYBAVSfZDoQT4qoUyC8osJM6P4SiVfXS3LdNCxgWF8zePOOPexV+xzZ+7jnHt10pk/7MPZe5291n+vtdfe6wglsGqVlrsuz4OZC1IDTALuEyGqygggAtwPGKCjf1oXkAJuidAK2grO76rs2bxZzhSzI8GBdes02tNj3lJlPVDJkEGaQNZv2SKnSxJYvVofcUjtUqhleNCnyNqtW73tIQKvLteHUpHEMaCK4UUadMmWr8t32Y4zMJos6/tCVatUlWFuripfrVihfng9+3jlpfgcVbOkGN1IBOoWeEyrcSgvF65fU44dTXMmli74rmqSw/wnXcY+LJg0XLhg2NuUprtLi6kdW+71rgU2+gSMkaUQ/nDMGOHNd8oZN65wr86vc2lqSPHttoTfX/Scx/KVESTvs5m1Loue9fh4Yx/NF22iFELRFywBPwSq6dmoIb8Jhtdej4SMD+DphR51T7lUT5GQ8QGMHCWseyNKNKoFuv2GTsmGAGMmBhNyylSXydVutt/bq5w6kcJ1YdZsj2hUqF8WoeOm+saNgdMnU8TjyoyZHhUVGYWVDwpzn3DZ15gIuiCSI4CO10AEpj2aM25lH7wX5/KlTNyrJrm8+/5If4W2WXz5aQ9HDif999GjhQ8/GcWIERnZtBqXvQ2hEEdyWWBMmb+EvFZZmXNJ65U0l5uTWVnzP0nO/2UPvAw6OwxHD/Vl5Z030/wRy5AZ8EJQP8bkCGiRdPH6fWPR1RWWt7flsuBqu8GYQnlnZ27FZWVFbZTlQqA2ccj5PAgbA3/j5JBMauF7QO7Pyb77NoJak/mbsG8gJkUVWA3WbSXl3EFeZD70ZQmoai8wqmB+QJd1W2n9elu574AgYUjkh+BWUBpaYciF9yjXvBAYo13hc6TQhWoKFf7yczdHD1rHQU/chORBFwTlkr8HxJiOUGUQCGFwBa0tCVpbQqxLKwjMV6UltwfQjvBVEIxp0UultPmQQwIekEyF5Pk9Y24GFRzZH+ffS5nj82p7utguvi2O/9rDtbbMYXTjRni+Kj/lCGi6JVidnToW55QtT+4SseNxYsdLCIXT1Y9X7WF31gM0q/w/F98Duh0jL2/YICYvC8yfxa7TYcAVMdRvb6jOFqaefTgeJ03K36bZEm1oIX8jZlsqkdq0c9/07gIJ/Vi+8FwMmFFShbAU1U5VmYXoZEQqUa0AsTe/9mdSF0gcpE0dmh1oTmrqzM6G6ZdL6fVyTNI/qkpJAqoy4bvGmo+APQwhnCwTdTap0ev2xCrWjDEr6+vPFl5YQ0ngm8aaa6LpNdZSqH6zNaKaWqfd7KpfcHby7RSuWnCy4sW6mP2VGxQkOLCsLrZGRT+zdUSJOXazHgTOAfYAq0D0AVWxdc9UYAJK4479MxfeFQGLZfNOzFHH+eEe/pIadxyoHRQBp9jg94ce+81L3KoVNW+jpq1YSEo3vSiYzwfL9I7Hz+LF56MjOzrnifCMwhxBJ4KMH6hoBNpUOYdITJXdOw/PPgKDP1b/A2Uj5BVoGulTAAAAAElFTkSuQmCC\" data-n=\"mastodon-favicon\"/></svg>" };
export const tags = ["社媒", "新闻", "英语"];

const types = { links: "热门链接", tags: "热门话题", statuses: "热门动态" };

export class MastodonHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const type = ctx.params.type || "links";
      if (!Object.hasOwn(types, type)) return Result.Err("type 支持 links（默认）、tags、statuses", "INVALID_PARAMETER");
      const home = "https://mastodon.social";
      const fetched = await utils.request_json(ctx, home + "/api/v1/trends/" + type + "?limit=20");
      if (fetched.error) return fetched;
      const list = utils.array_at(fetched.data);
      if (list.error) return list;
      if (!list.data.length) return Result.Err("Mastodon 实例未返回趋势列表", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const link = utils.absolute_url(row?.url, home);
        if (link.error) return link;
        if (!link.data) return Result.Err("Mastodon 趋势条目缺少链接", "UPSTREAM_INVALID_RESPONSE");
        const id = utils.identity(type === "statuses" ? row.id : link.data);
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const text = String((type === "statuses" ? row.favourites_count : row.history?.[0]?.uses) ?? "");
        const thumbnail = utils.absolute_url(type === "links" ? row.image : type === "statuses" ? row.media_attachments?.[0]?.preview_url : "", home);
        if (thumbnail.error) return thumbnail;
        const title = type === "links" ? utils.plain_text(row.title) : type === "tags" ? "#" + (row.name || "")
          : (utils.plain_text(row.spoiler_text || row.content) || utils.plain_text(row.account?.display_name) || utils.plain_text(row.account?.acct)).slice(0, 200);
        if (type === "tags" && !row.name) return Result.Err("Mastodon 话题缺少名称", "UPSTREAM_INVALID_RESPONSE");
        entries.push({ id: "mastodon.social:" + type + ":" + id.data, title, link: link.data,
          ...(thumbnail.data ? { thumbnail: thumbnail.data } : {}), rank: null, pinned: false,
          heat: { value: text === "" ? null : Number(text), unit: type === "statuses" ? "点赞" : "当日分享次数", text } });
      }
      return Result.Ok({ category, title: "Mastodon · " + types[type],
        link: home + "/explore" + (type === "statuses" ? "" : "/" + type), entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new MastodonHotRank();
export const route = {
  name: "Mastodon · 社媒趋势", path: "/mastodon/api/v1/trends/:type?", url: "mastodon.social",
  maintainers: ["findrss"], example: "/mastodon/api/v1/trends/links", parameters: { type: "links 热门链接（默认）、tags 话题、statuses 动态" },
  description: "固定读取 mastodon.social 公开趋势，范围为该实例可见及审核的内容，并非全网排名；保留顺序，rank 为 null。链接/话题热度为 history 首日 uses，动态为点赞数。",
  handler: ctx => script.run(ctx),
};
