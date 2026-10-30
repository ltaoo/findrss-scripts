import { utils } from "@findrss/util";
import { RSSScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const tags = ["短剧", "视频"];
export const platform = {
  name: "红果短剧",
};

/**
 * 红果（hongguoduanju.com）网页版短剧订阅。
 *
 * 搜索与分集都来自官网公开页面/接口，不需要登录或签名：
 * - 搜索：`/api/search/result`
 * - 分集：服务端渲染页 `_ROUTER_DATA` 里的 `seriesDetail.vid_list`
 * - 播放：`/player/:series_id/:vid` 页内 JSON-LD VideoObject.contentUrl（官网公开的
 *   360p MP4）。付费/加密集官网只返回预览片段或不提供直链，此时播放路由明确报错。
 *
 * 播放通过 `/hongguo/video/:series_id/:vid` 媒体代理转发，并带上官网 Referer；
 * 该路由声明 allowed_hosts，由 FindRSS 的媒体代理按 Range 流式返回。
 */
export class HongguoDramaRSS extends RSSScript {
  static SITE = "https://hongguoduanju.com";
  static WEB_UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
  static WEB_REFERER = "https://hongguoduanju.com/";
  static ID_PATTERN = /^\d{1,30}$/;
  static SERIES_PATTERN = /^\d{6,}$/;

  static headers() {
    return {
      "User-Agent": HongguoDramaRSS.WEB_UA,
      Referer: HongguoDramaRSS.WEB_REFERER,
      "Accept-Language": "zh-CN,zh;q=0.9",
    };
  }

  static clean_text(value) {
    return String(value ?? "")
      .replace(/<[^>]*>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
  }

  static clean_url(value) {
    return String(value ?? "")
      .replace(/\\u002F/gi, "/")
      .replace(/\\\//g, "/")
      .replace(/\\u0026/gi, "&")
      .replace(/&amp;/g, "&")
      .trim();
  }

  /** 官网封面/媒体地址只接受 https 绝对地址。 */
  static https_url(value) {
    const url = HongguoDramaRSS.clean_url(value);
    return /^https:\/\/[^\s"'<>]+$/i.test(url) ? url : "";
  }

  static async request_text(ctx, url) {
    const result = await utils.request_text(ctx, url, {
      headers: HongguoDramaRSS.headers(),
      timeout_ms: 10000,
    });
    if (result.error) throw result.error;
    return String(result.data ?? "");
  }

  /** 读取 Next.js 服务端渲染页里的 `window._ROUTER_DATA`。 */
  static router_data(html) {
    const text = String(html ?? "");
    const match = /(?:window\.)?_ROUTER_DATA\s*=\s*(\{)/.exec(text);
    if (!match) return null;
    const start = match.index + match[0].length - 1;
    let depth = 0;
    let quoted = false;
    let escaped = false;
    for (let index = start; index < text.length; index += 1) {
      const character = text[index];
      if (quoted) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') quoted = false;
      } else if (character === '"') quoted = true;
      else if (character === "{") depth += 1;
      else if (character === "}" && --depth === 0) {
        try {
          return JSON.parse(text.slice(start, index + 1));
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /** 分集页与详情页共用的 loader 对象，必须与请求的剧集一致。 */
  static page_for_series(html, series_id) {
    const loader_data = HongguoDramaRSS.router_data(html)?.loaderData;
    if (!loader_data || typeof loader_data !== "object") return null;
    for (const page of Object.values(loader_data)) {
      if (!page || typeof page !== "object" || page.isSuccess === false)
        continue;
      const detail = page.seriesDetail;
      if (!detail || typeof detail !== "object") continue;
      if (String(detail.series_id ?? "") !== series_id) continue;
      if (!Array.isArray(detail.vid_list)) continue;
      return page;
    }
    return null;
  }

  static page_for_episode(html, series_id, vid) {
    const loader_data = HongguoDramaRSS.router_data(html)?.loaderData;
    if (!loader_data || typeof loader_data !== "object") return null;
    for (const page of Object.values(loader_data)) {
      if (!page || typeof page !== "object" || page.isSuccess === false)
        continue;
      if (String(page.vid ?? "") !== vid) continue;
      if (String(page.series_id ?? "") !== series_id) continue;
      if (String(page.seriesDetail?.series_id ?? series_id) !== series_id)
        continue;
      return page;
    }
    return null;
  }

  static json_ld(html) {
    const values = [];
    for (const script of String(html ?? "").matchAll(
      /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi,
    )) {
      if (!/application\/ld\+json/i.test(script[1])) continue;
      try {
        const value = JSON.parse(script[2]);
        if (Array.isArray(value)) values.push(...value);
        else if (value && typeof value === "object") values.push(value);
      } catch {
        // 单个损坏的 JSON-LD 不影响其他候选。
      }
    }
    return values;
  }

  /** 只接受当前剧集、当前分集在官网上公开的 MP4 直链。 */
  static media_url(html, series_id, vid) {
    for (const value of HongguoDramaRSS.json_ld(html)) {
      if (value["@type"] !== "VideoObject") continue;
      if (
        value.url &&
        !HongguoDramaRSS.player_link_matches(value.url, series_id, vid)
      )
        continue;
      if (
        value["@id"] &&
        !HongguoDramaRSS.player_link_matches(value["@id"], series_id, vid)
      )
        continue;
      const url = HongguoDramaRSS.clean_url(value.contentUrl);
      const match =
        /^https:\/\/hongguoduanju\.com\/video\/public\/(\d{1,30})\/[^/?#\s]+\.mp4(?:\?[^\s#]*)?$/i.exec(
          url,
        );
      if (match && match[1] === vid) return url;
    }
    return "";
  }

  static player_link_matches(value, series_id, vid) {
    const match =
      /^https:\/\/hongguoduanju\.com\/player\/(\d{1,30})(?:\/(\d{1,30}))?(?:[/?#]|$)/i.exec(
        String(value ?? "").trim(),
      );
    return (
      Boolean(match) &&
      match[1] === series_id &&
      (!match[2] || match[2] === vid)
    );
  }

  static async series_page(ctx, series_id) {
    const urls = [
      `${HongguoDramaRSS.SITE}/player/${encodeURIComponent(series_id)}`,
      `${HongguoDramaRSS.SITE}/detail?series_id=${encodeURIComponent(series_id)}`,
    ];
    let failure = null;
    for (const url of urls) {
      try {
        const html = await HongguoDramaRSS.request_text(ctx, url);
        if (HongguoDramaRSS.page_for_series(html, series_id)) return html;
      } catch (error) {
        failure = error;
      }
    }
    if (failure) throw failure;
    return "";
  }

  static build_series_feed(page, series_id, public_origin) {
    const detail = page.seriesDetail;
    const title =
      HongguoDramaRSS.clean_text(detail.series_name) || "未命名短剧";
    const cover = HongguoDramaRSS.https_url(detail.series_cover);
    const description = HongguoDramaRSS.clean_text(detail.series_intro);
    const tags = Array.isArray(detail.tags)
      ? detail.tags.map(HongguoDramaRSS.clean_text).filter(Boolean).slice(0, 6)
      : [];
    const origin = String(public_origin ?? "").replace(/\/+$/, "");
    const vids = detail.vid_list.map(String);
    // 无逐集发布时间，按集数倒序输出，最新一集排在前面（排序器对无时间条目保持原序）。
    const items = vids.map(function (vid, index) {
      const episode = index + 1;
      const player_link =
        HongguoDramaRSS.SITE +
        "/player/" +
        encodeURIComponent(series_id) +
        "/" +
        encodeURIComponent(vid);
      const video_url = origin
        ? origin +
          "/hongguo/video/" +
          encodeURIComponent(series_id) +
          "/" +
          encodeURIComponent(vid)
        : "";
      const content =
        video_url === ""
          ? undefined
          : '<video controls preload="none" playsinline' +
            (cover ? ' poster="' + utils.escape_html(cover) + '"' : "") +
            ' src="' +
            utils.escape_html(video_url) +
            '"></video>' +
            '<p><a href="' +
            utils.escape_html(player_link) +
            '">在红果官网播放第 ' +
            episode +
            " 集</a></p>";
      return {
        id: "hongguo:" + series_id + ":" + vid,
        title: title + " 第" + episode + "集",
        link: player_link,
        description: "第 " + episode + " 集",
        ...(cover ? { image: cover } : {}),
        type: "video",
        ...(video_url === ""
          ? {}
          : {
              enclosure: { url: video_url, type: "video/mp4" },
              content,
            }),
        ...(tags.length ? { categories: tags } : {}),
      };
    });
    items.reverse();
    return {
      id: "hongguo:series:" + series_id,
      title,
      link:
        HongguoDramaRSS.SITE +
        "/detail?series_id=" +
        encodeURIComponent(series_id),
      description: description || title + " 短剧分集",
      language: "zh-cn",
      ...(cover ? { image: cover } : {}),
      items,
      extra: HongguoDramaRSS.feed_extra(),
    };
  }

  static feed_extra() {
    return {
      view: "video",
      show_thumbnails: true,
      proxy_images: true,
      headers: { referer: HongguoDramaRSS.WEB_REFERER },
      tags: ["短剧", "红果短剧"],
      category: ["短剧"],
    };
  }

  static parse_search(payload, keyword) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw Object.assign(new Error("红果搜索返回了无效数据"), {
        code: "UPSTREAM_INVALID_RESPONSE",
      });
    }
    if (!Array.isArray(payload.searchList)) {
      throw Object.assign(new Error("红果搜索回包缺少结果列表"), {
        code: "UPSTREAM_INVALID_RESPONSE",
      });
    }
    const seen = new Set();
    const items = [];
    for (const entry of payload.searchList) {
      const video =
        entry?.video_data &&
        typeof entry.video_data === "object" &&
        Object.keys(entry.video_data).length
          ? entry.video_data
          : entry;
      const series_id = String(
        video?.series_id ?? entry?.series_id ?? entry?.keyword ?? "",
      ).trim();
      const title = HongguoDramaRSS.clean_text(
        video?.series_title ??
          video?.series_name ??
          entry?.name ??
          video?.title,
      );
      if (
        !HongguoDramaRSS.SERIES_PATTERN.test(series_id) ||
        !title ||
        seen.has(series_id)
      )
        continue;
      seen.add(series_id);
      const cover = HongguoDramaRSS.https_url(
        video?.series_cover ?? video?.cover,
      );
      const intro = HongguoDramaRSS.clean_text(video?.series_intro);
      const published = RSSScript.timestamp(
        Number(video?.create_time),
      ).data;
      const tags = Array.isArray(video?.category_list)
        ? video.category_list
            .map((item) => HongguoDramaRSS.clean_text(item?.name))
            .filter(Boolean)
            .slice(0, 6)
        : [];
      items.push({
        id: "hongguo:series:" + series_id,
        title,
        link:
          HongguoDramaRSS.SITE +
          "/detail?series_id=" +
          encodeURIComponent(series_id),
        description: intro || title,
        ...(cover ? { image: cover } : {}),
        ...(published ? { published } : {}),
        ...(tags.length ? { categories: tags } : {}),
      });
    }
    return items;
  }

  async fetch(ctx) {
    try {
      const series_id = String(ctx.params?.series_id ?? "").trim();
      if (!HongguoDramaRSS.ID_PATTERN.test(series_id)) {
        return Result.Err("series_id 需为数字剧集编号", "INVALID_PARAMETER");
      }
      const html = await HongguoDramaRSS.series_page(ctx, series_id);
      const page = HongguoDramaRSS.page_for_series(html, series_id);
      if (!page) {
        return Result.Err(
          "红果页面未返回该剧集的分集数据，可能已下架或页面结构已变化",
          "UPSTREAM_INVALID_RESPONSE",
        );
      }
      if (!page.seriesDetail.vid_list.length) {
        return Result.Err("该短剧暂无分集", "UPSTREAM_INVALID_RESPONSE");
      }
      return Result.Ok(
        HongguoDramaRSS.build_series_feed(page, series_id, ctx.public_origin),
      );
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }

  static async search(ctx) {
    try {
      const keyword = HongguoDramaRSS.clean_text(ctx.params?.keyword ?? "");
      if (
        keyword === "" ||
        keyword.length > 80 ||
        /[\u0000-\u001f\u007f]/.test(keyword)
      ) {
        return Result.Err("搜索词需为 1 至 80 字的文本", "INVALID_PARAMETER");
      }
      const page = Number(ctx.query?.page ?? 1);
      if (!Number.isInteger(page) || page < 1 || page > 50) {
        return Result.Err("页码需为 1 至 50 的整数", "INVALID_PARAMETER");
      }
      const url =
        HongguoDramaRSS.SITE +
        "/api/search/result?aid=8662&query=" +
        encodeURIComponent(keyword) +
        "&page=" +
        page;
      const result = await utils.request_json(ctx, url, {
        headers: HongguoDramaRSS.headers(),
        timeout_ms: 10000,
      });
      if (result.error) throw result.error;
      return Result.Ok({
        id: "hongguo:search:" + keyword + ":" + page,
        title: "红果短剧搜索：" + keyword,
        link:
          HongguoDramaRSS.SITE + "/search?query=" + encodeURIComponent(keyword),
        description: "搜索“" + keyword + "”的第 " + page + " 页结果",
        language: "zh-cn",
        items: HongguoDramaRSS.parse_search(result.data, keyword),
        extra: {
          show_thumbnails: true,
          proxy_images: true,
          headers: { referer: HongguoDramaRSS.WEB_REFERER },
          tags: ["短剧", "红果短剧"],
          category: ["短剧"],
        },
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }

  static async media(ctx) {
    try {
      const series_id = String(ctx.params?.series_id ?? "").trim();
      const vid = String(ctx.params?.vid ?? "").trim();
      if (!HongguoDramaRSS.ID_PATTERN.test(series_id)) {
        return Result.Err("series_id 需为数字剧集编号", "INVALID_PARAMETER");
      }
      if (!HongguoDramaRSS.ID_PATTERN.test(vid)) {
        return Result.Err("vid 需为数字分集编号", "INVALID_PARAMETER");
      }
      const html = await HongguoDramaRSS.request_text(
        ctx,
        HongguoDramaRSS.SITE +
          "/player/" +
          encodeURIComponent(series_id) +
          "/" +
          encodeURIComponent(vid),
      );
      if (!HongguoDramaRSS.page_for_episode(html, series_id, vid)) {
        return Result.Err(
          "红果播放页与该剧集不匹配，可能已下架或页面结构已变化",
          "UPSTREAM_INVALID_RESPONSE",
        );
      }
      const url = HongguoDramaRSS.media_url(html, series_id, vid);
      if (!url) {
        return Result.Err(
          "该集在官网未提供可直接播放的地址（付费集或仅预览）",
          "UPSTREAM_INVALID_RESPONSE",
        );
      }
      return Result.Ok({
        kind: "video",
        url,
        headers: {
          referer: HongguoDramaRSS.WEB_REFERER,
          "user-agent": HongguoDramaRSS.WEB_UA,
        },
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }
}

const script = new HongguoDramaRSS();
export const routes = [
  {
    name: "红果短剧分集",
    path: "/hongguo/series/:series_id",
    url: "hongguoduanju.com",
    maintainers: ["findrss"],
    example: "/hongguo/series/7688352674999176254",
    parameters: {
      series_id: "红果短剧 detail 页 series_id，数字编号",
    },
    description:
      "订阅指定短剧的全部分集；条目按集数倒序，enclosure 指向媒体代理路由，content 内嵌播放器与官网播放页链接",
    handler: (ctx) => script.run(ctx),
  },
  {
    name: "红果短剧搜索",
    path: "/hongguo/search/:keyword",
    url: "hongguoduanju.com",
    maintainers: ["findrss"],
    example: "/hongguo/search/热播",
    parameters: {
      keyword: "搜索关键词，1 至 80 字",
      page: "结果页码，1 至 50，默认 1",
    },
    description: "按关键词搜索红果短剧并输出剧集列表卡片",
    handler: (ctx) => HongguoDramaRSS.search(ctx),
  },
  {
    name: "红果短剧播放",
    path: "/hongguo/video/:series_id/:vid",
    public: true,
    allowed_hosts: ["hongguoduanju.com"],
    url: "hongguoduanju.com",
    maintainers: ["findrss"],
    example: "/hongguo/video/7688352674999176254/7688396347107445822",
    parameters: {
      series_id: "红果短剧 series_id",
      vid: "分集 vid",
    },
    description:
      "解析官网公开 MP4 直链并通过媒体代理按 Range 转发；付费或仅预览的分集会明确返回错误",
    handler: (ctx) => HongguoDramaRSS.media(ctx),
  },
];
