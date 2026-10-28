/** HOT */
import { utils } from "@findrss/util";

export const version = "1.1.1";
export const category = "小说";
export const order = 370;
export const platform = {
  name: "起点",
  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" role="img" aria-labelledby="qidian-title" data-n="qidian-platform-icon">\n  <title id="qidian-title" data-n="qidian-title">起点中文网</title>\n  <defs data-n="qidian-palette">\n    <linearGradient id="qidian-red" x1="0" y1="0" x2="0" y2="1" data-n="qidian-red-gradient">\n      <stop stop-color="#f32236" data-n="qidian-red-top"/>\n      <stop offset="1" stop-color="#e60012" data-n="qidian-red-bottom"/>\n    </linearGradient>\n  </defs>\n  <rect width="32" height="32" rx="4.8" fill="url(#qidian-red)" data-n="qidian-background"/>\n  <path fill="#fff" d="M6 9.2h1.2v2H9v1.1H7.2v2.1h2v1.1h-2v2.1h2v1.1h-2v2.4H6v-5.6H3.5v-1.1H6v-2.1H3.8v-1.1H6Zm-2.5 8.1h1.2v2.4c1.1 1.1 2.2 1.5 4.1 1.5h6.1v1.1H8.8c-2.1 0-3.4-.4-4.6-1.5l-.5 1.4H2.5c.7-1.4 1-3 1-4.9Zm6.6-7.2h4.6v5h-3.4v4.2h2.3v-2.9h1.1v3.3c0 .5-.3.7-.8.7h-2.9c-.6 0-.9-.3-.9-.9v-5.5h3.4v-2.8h-3.4Z" data-n="qidian-character-qi"/>\n  <path fill="#fff" fill-rule="evenodd" d="M21.2 9.2h1.2v1.4h5.3v1.2h-5.3v1.5h6.1v5.3H18v-5.3h3.2Zm-2 5.3v2.9h8.1v-2.9Z" data-n="qidian-character-dian-body"/>\n  <path fill="#fff" d="m18.1 19.8 1.1.3-.8 2.1-1.1-.3Zm3.1.2h1.1v2h-1.1Zm3 0h1.1l.2 2h-1.1Zm3.1-.1 1.1-.2.6 2.1-1.1.2Z" data-n="qidian-character-dian-dots"/>\n</svg>',
};
export const tags = ["小说", "排行榜"];

const rank_names = {
  yuepiao: "月票榜",
  hotsales: "畅销榜",
  readindex: "阅读榜",
  newfans: "书友榜",
  rec: "推荐榜",
  update: "更新榜",
  sign: "签约榜",
  newbook: "新书榜",
  newauthor: "新人榜",
  collect: "收藏榜",
  free: "免费榜",
};
const gender_types = {
  male: [
    "yuepiao",
    "hotsales",
    "readindex",
    "newfans",
    "rec",
    "update",
    "sign",
    "newbook",
    "newauthor",
  ],
  female: [
    "yuepiao",
    "hotsales",
    "readindex",
    "newfans",
    "rec",
    "update",
    "collect",
    "free",
  ],
};

export class QidianHotRank extends HotRankScript {
  constructor(type, gender) {
    super();
    this.type = type;
    this.gender = gender;
  }

  async fetch(ctx) {
    try {
      const { type, gender } = this;
      if (
        !["male", "female"].includes(gender) ||
        !gender_types[gender].includes(type)
      ) {
        return Result.Err(
          "gender 仅支持 male、female；type 必须为对应频道的官网榜单类型",
          "INVALID_PARAMETER",
        );
      }
      const category_id = String(ctx.query.category || "-1");
      const period = String(ctx.query.period || "");
      const periods =
        type === "rec"
          ? { week: "3", month: "2", all: "1" }
          : type === "newfans"
            ? { week: "3", month: "2" }
            : {};
      if (
        !/^(?:-1|[1-9]\d{0,5})$/.test(category_id) ||
        (period &&
          !(type === "yuepiao"
            ? /^20\d{2}(?:0[1-9]|1[0-2])$/.test(period)
            : Object.keys(periods).includes(period)))
      ) {
        return Result.Err(
          "category 必须为官网分类数字 ID；period：月票榜用 YYYYMM，推荐榜用 week/month/all，书友榜用 week/month",
          "INVALID_PARAMETER",
        );
      }
      const home =
        gender === "female" ? "https://m.qdmm.com" : "https://m.qidian.com";
      const link =
        home +
        "/rank/" +
        type +
        "/" +
        (category_id !== "-1" || period ? "catid" + category_id + "/" : "") +
        (period ? (type === "yuepiao" ? period : periods[period]) + "/" : "");
      const fetched = await utils.request_text(ctx, link, {
        headers: {
          Referer: home + "/",
          Accept: "text/html,application/xhtml+xml",
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
        },
      });
      if (fetched.error) return fetched;
      const context = utils.embedded_json(
        fetched.data,
        /<script\b[^>]*\bid=["']vite-plugin-ssr_pageContext["'][^>]*>/i,
      );
      if (context.error) return context;
      const page = context.data.pageContext?.pageProps?.pageData;
      if (page?.gender && page.gender !== gender)
        return Result.Err(
          "起点返回了其他频道榜单",
          "UPSTREAM_INVALID_RESPONSE",
        );
      const list = utils.array_at(
        context.data,
        "pageContext.pageProps.pageData.records",
      );
      if (list.error) return list;
      if (!list.data.length)
        return Result.Err(
          "起点榜单为空，可能为验证页面",
          "UPSTREAM_INVALID_RESPONSE",
        );
      const entries = [],
        seen = new Set();
      for (const row of list.data) {
        const id = utils.identity(row.bid);
        if (id.error) return id;
        if (!/^\d{1,24}$/.test(id.data))
          return Result.Err("起点书籍 ID 无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const text = String(row.rankCnt ?? "").trim();
        const heat = /^([\d,]+(?:\.\d+)?)(万|亿)?/.exec(text);
        entries.push({
          id: "qidian:book:" + id.data,
          title: utils.plain_text(row.bName),
          link: home + "/book/" + id.data + "/",
          thumbnail:
            "https://bookcover.yuewen.com/qdbimg/349573/" + id.data + "/180",
          rank:
            row.rankNum == null || row.rankNum === ""
              ? null
              : Number(row.rankNum),
          pinned: false,
          heat: {
            value: heat
              ? Number(heat[1].replace(/,/g, "")) *
                (heat[2] === "亿" ? 1e8 : heat[2] === "万" ? 1e4 : 1)
              : null,
            unit:
              {
                yuepiao: "月票",
                newfans: "书友",
                rec: "推荐",
                update: "更新字数",
                collect: "收藏",
              }[type] || "热度",
            text,
          },
        });
      }
      ctx.log("起点榜单解析完成", {
        type,
        gender,
        category: category_id,
        period,
        count: entries.length,
      });
      return Result.Ok({
        category,
        title:
          "起点 · " +
          (gender === "female" ? "女频" : "") +
          rank_names[type] +
          (category_id !== "-1"
            ? " · " +
              (page?.filters
                ?.find((filter) => filter.key === "catId")
                ?.items?.find((item) => String(item.value) === category_id)
                ?.text || category_id)
            : "") +
          (period
            ? " · " +
              ({ week: "周榜", month: "月榜", all: "总榜" }[period] || period)
            : ""),
        link,
        entries,
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }
}

const rank_metadata = {
  parameters: { category: "查询参数：分类数字 ID，默认 -1（全部）",
    period: "查询参数：月票榜使用 YYYYMM；推荐榜支持 week/month/all；书友榜支持 week/month；默认当前榜单" },
  url: "m.qidian.com",
  maintainers: ["findrss"],
  description:
    "读取官网移动端榜单第一页并返回封面。?category=21 按分类；?period=YYYYMM（月票）或 week/month/all（推荐）、week/month（书友）；未知排名和热度为 null。",
};

export const routes = [
  {
    ...rank_metadata,
    name: "起点 · 月票榜",
    path: "/qidian/rank/yuepiao",
    handler: (ctx) => new QidianHotRank("yuepiao", "male").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 畅销榜",
    path: "/qidian/rank/hotsales",
    handler: (ctx) => new QidianHotRank("hotsales", "male").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 阅读榜",
    path: "/qidian/rank/readindex",
    handler: (ctx) => new QidianHotRank("readindex", "male").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 书友榜",
    path: "/qidian/rank/newfans",
    handler: (ctx) => new QidianHotRank("newfans", "male").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 推荐榜",
    path: "/qidian/rank/rec",
    handler: (ctx) => new QidianHotRank("rec", "male").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 更新榜",
    path: "/qidian/rank/update",
    handler: (ctx) => new QidianHotRank("update", "male").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 签约榜",
    path: "/qidian/rank/sign",
    handler: (ctx) => new QidianHotRank("sign", "male").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 新书榜",
    path: "/qidian/rank/newbook",
    handler: (ctx) => new QidianHotRank("newbook", "male").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 新人榜",
    path: "/qidian/rank/newauthor",
    handler: (ctx) => new QidianHotRank("newauthor", "male").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 女频月票榜",
    path: "/qidian/rank/yuepiao/female",
    url: "m.qdmm.com",
    handler: (ctx) => new QidianHotRank("yuepiao", "female").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 女频畅销榜",
    path: "/qidian/rank/hotsales/female",
    url: "m.qdmm.com",
    handler: (ctx) => new QidianHotRank("hotsales", "female").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 女频阅读榜",
    path: "/qidian/rank/readindex/female",
    url: "m.qdmm.com",
    handler: (ctx) => new QidianHotRank("readindex", "female").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 女频书友榜",
    path: "/qidian/rank/newfans/female",
    url: "m.qdmm.com",
    handler: (ctx) => new QidianHotRank("newfans", "female").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 女频推荐榜",
    path: "/qidian/rank/rec/female",
    url: "m.qdmm.com",
    handler: (ctx) => new QidianHotRank("rec", "female").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 女频更新榜",
    path: "/qidian/rank/update/female",
    url: "m.qdmm.com",
    handler: (ctx) => new QidianHotRank("update", "female").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 女频收藏榜",
    path: "/qidian/rank/collect/female",
    url: "m.qdmm.com",
    handler: (ctx) => new QidianHotRank("collect", "female").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 女频免费榜",
    path: "/qidian/rank/free/female",
    url: "m.qdmm.com",
    handler: (ctx) => new QidianHotRank("free", "female").run(ctx),
  },
];
