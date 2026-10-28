/** HOT */
import { utils } from "@findrss/util";

export const version = "1.0.0";
export const category = "科技";
export const order = 820;
// Favicon: https://www.google.com/s2/favicons?domain=www.itmedia.co.jp&sz=32
export const platform = { name: "ITmedia", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"itmedia-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAB5klEQVR4nO2WP2gTURzHP4k5a1zEQv2TqhEVHARPE6Ob2MlFiiXGnjZWhyAOVqSDRQdBWxALGhFEBweRQtWCuFjQIOpSmg4p2kVa62KL9nSovd6lyZk+uQsGlChxOof3gcf7vfvd/X7f9+XBPZ8QQuAhfi+bSwHSAemAdEA68F84EKj2MP/yOfkn/Sg792CPZqEuCKUSYm6WFV2XCWzZ+tei19JpUju2sdT4RrA58e8OlPTPFG7eq6yLj26z+HEC5aBGMbwZfWYGwzDc4TD5fqLyrpMbHRkGdReBpv1Y9vdf8r/jq/Y7nn94H0M7zlohKH3V0RtW05B5Sv+sRe71K97kcmjJJA/6+ujo7OSLrvNscJCWRIJP09Pcut5L+s5dt9aN3qs0a0fZtGE9LfFDtTnwE9uYQxQWyrFlurPW1oYaiXAkeYyV9fWMZLMYCwU3Nzw0xKnTHRyIt1ZqnD3XxdSHSUyz/H1NZ+BP+CwTc97Etm0WbZtisdz4ZCrl7nDs7Rh5y3JdcHDW4+PvuNTdw4tMpnYBS1atoe7MiXLTZUE3VkLrCC03CW8Ms11V8SsKe/c1ET/cysUL54nGYiTb27nS040aiRJqbHSHw+OBAaKx3dU3JeSVzGP8UgBSgMf4pQCkALzlB6mQs1e/Or26AAAAAElFTkSuQmCC\" data-n=\"itmedia-favicon\"/></svg>" };
export const tags = ["资讯","日语"];

export class ItmediaHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const fetched = await utils.request_text(ctx, "https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml");
      if (fetched.error) return fetched;
      const list = utils.feed_items(fetched.data, "https://www.itmedia.co.jp/news/");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("ITmedia 未返回内容列表", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        entries.push({ id: "itmedia:" + row.id, title: utils.plain_text(row.title), link: row.link,
          rank: null, pinned: false, heat: { value: null, unit: "热度", text: "" } });
      }
      return Result.Ok({ category, title: "ITmedia NEWS · 最新资讯", link: "https://www.itmedia.co.jp/news/", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new ItmediaHotRank();
export const route = {
  name: "ITmedia NEWS · 最新资讯", path: "/itmedia/headlines", url: "www.itmedia.co.jp",
  maintainers: ["findrss"], example: "/itmedia/headlines", parameters: {},
  description: "官方 RSS/Atom 内容列表，保留上游选择和顺序。新闻及精选列表不冒充热度排名，未知排名与热度均为 null。",
  handler: ctx => script.run(ctx),
};
