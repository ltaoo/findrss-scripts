/** HOT */
import { utils } from "@findrss/util";

export const version = "1.0.1";
export const category = "小说";
export const order = 170;
export const platform = {
  name: "番茄小说",
  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" role="img" aria-labelledby="fanqienovel-title" data-n="fanqienovel-platform-icon">\n  <title id="fanqienovel-title" data-n="fanqienovel-title">番茄小说</title>\n  <defs data-n="fanqienovel-palette">\n    <radialGradient id="fanqienovel-tomato" cx="52%" cy="77%" r="73%" data-n="fanqienovel-tomato-gradient">\n      <stop stop-color="#e92102" data-n="fanqienovel-tomato-center"/>\n      <stop offset=".55" stop-color="#ff4b0a" data-n="fanqienovel-tomato-middle"/>\n      <stop offset="1" stop-color="#ff8027" data-n="fanqienovel-tomato-edge"/>\n    </radialGradient>\n  </defs>\n  <rect x="1" y="1" width="30" height="30" rx="6.5" fill="#fff" data-n="fanqienovel-background"/>\n  <path fill="#f05223" d="M19.4 1h5.5v6.6l-2.7-1.7-2.8 1.7Z" data-n="fanqienovel-bookmark"/>\n  <path fill="url(#fanqienovel-tomato)" d="M1 18.7C5.2 15 10.8 11.6 16 11.6S26.9 15 31 18.7v5.8a6.5 6.5 0 0 1-6.5 6.5h-17A6.5 6.5 0 0 1 1 24.5Z" data-n="fanqienovel-tomato"/>\n  <path fill="#fff7ee" d="M15.1 18.6c0-1.1.4-2.1.9-2.1s1 1 1 2.1-.5 2-1 2-.9-.9-.9-2Zm-4.8 1c-.8-.8-1.2-.8-1.5-.5-.5.4-.1 1.3.5 2s2 1.4 2.2 1.2-.5-1.9-1.2-2.7Zm11.5-.6c-.4-.3-1.2.1-1.9.9s-1.2 2-1 2.3 1.5-.3 2.3-1.1 1-1.8.6-2.1ZM8.8 24.1c-1-.1-1.8.3-1.8.8s.8 1 1.9 1 2.2-.5 2.2-.8-1.3-.9-2.3-1Zm14.2 0c-1 .1-2.1.7-2.1 1s1.2.8 2.3.8 1.8-.5 1.8-1-.9-.9-2-.8Z" data-n="fanqienovel-seeds"/>\n</svg>',
};
export const tags = ["小说", "排行榜"];

export class FanqienovelHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const rank_id = ctx.params.rank_id || "1_2_1141";
      const peak = rank_id === "peak";
      if (!peak && !/^[01]_[12]_\d{1,6}$/.test(rank_id)) {
        return Result.Err("rank_id 应为 peak（巅峰榜）或官网分类榜单标识，如 1_2_1141", "INVALID_PARAMETER");
      }
      const link = peak ? "https://fanqienovel.com/" : "https://fanqienovel.com/rank/" + rank_id;
      const options = {
        headers: {
          Referer: "https://fanqienovel.com/",
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36",
        },
      };
      let list, rank_category = "";
      if (peak) {
        const fetched = await utils.request_json(ctx, "https://fanqienovel.com/api/author/misc/top_book_list/v1/?limit=200&offset=0", options);
        if (fetched.error) return fetched;
        if (fetched.data?.code !== 0) return Result.Err("番茄巅峰榜接口拒绝请求", "UPSTREAM_INVALID_RESPONSE");
        list = utils.array_at(fetched.data, "book_list");
      } else {
        const fetched = await utils.request_text(ctx, link, options);
        if (fetched.error) return fetched;
        const parsed = utils.document_nodes(fetched.data);
        if (parsed.error) return parsed;
        // HTML 的封面是统一占位图；内嵌榜单保留真实封面和完整在读人数。
        const data = utils.embedded_json(fetched.data, /"rank"\s*:\s*\{[^{}]*?"book_list"\s*:/);
        if (data.error) return data;
        list = utils.array_at(data.data);
        rank_category = utils.field(parsed.data, '.muye-rank-menu a[href="/rank/' + rank_id + '"]');
        if (!rank_category) return Result.Err("番茄榜单缺少分类，可能为验证页面或分类已变更", "UPSTREAM_INVALID_RESPONSE");
      }
      if (list.error) return list;
      if (!list.data.length) return Result.Err("番茄榜单为空，可能为验证页面", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        const id = utils.identity(peak ? row.book_id : row.bookId);
        if (id.error) return id;
        if (!/^\d{1,24}$/.test(id.data)) return Result.Err("番茄书籍 ID 无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const thumbnail = utils.absolute_url(peak ? row.thumb_url : row.thumbUri, link);
        if (thumbnail.error) return thumbnail;
        const title = Array.from(utils.plain_text(peak ? row.book_name : row.bookName), character =>
          FanqienovelHotRank.character_map.get(character) || character).join("");
        if (/[\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}\uFFFD]/u.test(title)) {
          return Result.Err("番茄标题含未识别的字体编码，需要更新字体映射；拒绝输出乱码", "UPSTREAM_INVALID_RESPONSE");
        }
        const text = String((peak ? row.rank_score : row.read_count) ?? "").trim();
        const heat = /^([\d,]+(?:\.\d+)?)(万|亿)?$/.exec(text);
        entries.push({
          id: "fanqienovel:book:" + id.data,
          title,
          link: "https://fanqienovel.com/page/" + id.data,
          ...(thumbnail.data ? { thumbnail: thumbnail.data } : {}),
          rank: peak || row.currentPos == null || row.currentPos === "" ? null : Number(row.currentPos),
          pinned: false,
          heat: {
            value: heat ? Number(heat[1].replace(/,/g, "")) * (heat[2] === "亿" ? 1e8 : heat[2] === "万" ? 1e4 : 1) : null,
            unit: peak ? "综合得分" : "在读",
            text,
          },
        });
      }
      const title = peak ? "番茄小说 · 巅峰榜" : "番茄小说 · " + (rank_id[0] === "1" ? "男频" : "女频") + (rank_id[2] === "2" ? "阅读榜" : "新书榜") + " · " + rank_category;
      ctx.log("番茄榜单解析完成", { rank_id, count: entries.length });
      return Result.Ok({ category, title, link, entries });
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }
  // 与 RSS 示例保持相同映射；每个脚本须能单独导入后台。
  static encoded_characters =
    "";
  static decoded_characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ的一是了我不人在他有这个上们来到时大地为子中你说生国年着就那和要她出也得里后自以会家可下而过天去能对小多然于心学么之都好看起发当没成只如事把还用第样道想作种开美总从无情己面最女但现前些所同日手又行意动方期它头经长儿回位分爱老因很给名法间斯知世什两次使身者被高已亲其进此话常与活正感见明问力理尔点文几定本公特做外孩相西果走将月十实向声车全信重三机工物气每并别真打太新比才便夫再书部水像眼等体却加电主界门利海受听表德少克代员许稜先口由死安写性马光白或住难望救命花结乐色更拉东神记处让母父应直字场平报友关放至张认接告入笑内英军候民岁往何度山觉路带万男边风解叫任金快原吃妈变通师立象数四失满战远格士音轻目条呢";
  static character_map = new Map(
    Array.from(
      FanqienovelHotRank.encoded_characters,
      function (character, index) {
        return [character, FanqienovelHotRank.decoded_characters[index]];
      },
    ),
  );
}

const script = new FanqienovelHotRank();
export const route = {
  name: "番茄小说排行榜",
  path: "/fanqienovel/rank/:rank_id?",
  url: "fanqienovel.com",
  maintainers: ["findrss"],
  example: "/fanqienovel/rank/1_2_1141",
  parameters: { rank_id: "peak 为巅峰榜；分类榜为官网 /rank/ 后的 性别_榜单_分类：1 男频、0 女频，2 阅读榜、1 新书榜。默认 1_2_1141；覆盖官网全部分类" },
  description: "支持巅峰榜及全部男女频分类阅读/新书榜，返回封面。分类榜读取第一页；巅峰榜读取官方接口完整列表，未提供排名或得分时为 null 并保留接口顺序。标题沿用 RSS 字体映射解码。",
  handler: ctx => script.run(ctx),
};
