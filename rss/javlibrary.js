import { utils } from "@findrss/util";
import { RSSScript, Result } from "@findrss/core";

// 更换镜像时修改此处；Cookie 权限随之更新，需要重新确认授权。
const origin = "https://www.javlibrary.com";
export const platform = { name: "JAVLibrary" };

export const version = "1.0.0";
export const config_schema = {
  type: "object",
  properties: {
    use_cookies: {
      type: "boolean", title: "使用已授权的站点 Cookie", default: false,
      description: "遇到验证页时，先同步本站 Cookie 并确认脚本权限，再启用。",
    },
    user_agent: {
      type: "string", title: "Cookie 对应浏览器的 User-Agent",
      default: "Mozilla/5.0", minLength: 1, maxLength: 4096,
      description: "使用 cf_clearance 时填写取得该 Cookie 的浏览器 User-Agent。",
    },
  },
};

export const permissions = {
  cookies: [{
    id: "site", origin, path_prefix: "/",
    names: ["PHPSESSID", "cf_clearance", "__cf_bm"],
    purpose: "读取已通过站点验证的演员作品列表",
  }],
};

// View 只渲染 Model 已解析的数据。
function render_item(item) {
  const escape = utils.escape_html;
  return '<p data-n="movie-title">' + escape(item.title) + '</p>' +
    (item.image ? '<img data-n="movie-cover" src="' + escape(item.image) + '" alt="' + escape(item.title) + '">' : "");
}

export class JavlibraryActorRSS extends RSSScript {
  async fetch(ctx) {
    try {
      const id = String(ctx.params?.id || "");
      const page = String(ctx.query?.page ?? "1");
      if (!/^[A-Za-z0-9]{1,32}$/.test(id) || !/^[1-9]\d{0,3}$/.test(page)) {
        return Result.Err("演员 ID 必须是字母或数字，page 必须是 1–9999 的整数", "INVALID_PARAMETER");
      }
      // shortcut: 只读指定页的列表，不为封面或日期逐部请求详情；需要完整资料时再补详情采集。
      const link = origin + "/cn/vl_star.php?s=" + id + "&mode=2&page=" + page;
      const options = { headers: {
        Accept: "text/html", Referer: origin + "/", "User-Agent": ctx.config?.user_agent || "Mozilla/5.0",
      } };
      if (ctx.config?.use_cookies) {
        const acquired = await ctx.cookies.get("site");
        if (acquired.error) return acquired;
        options.cookies = acquired.data;
      }
      const fetched = await utils.request_text(ctx, link, options);
      if (fetched.error) return fetched;
      const parsed = utils.document_nodes(fetched.data);
      if (parsed.error) return parsed;
      const root = parsed.data;
      const page_title = utils.field(root, "title");
      if (/just a moment|attention required|age verification|verify (?:your|you are)|年龄验证|年齡驗證/i.test(page_title) ||
          utils.first(root, "#challenge-form")) {
        return Result.Err("JAVLibrary 返回验证页，请同步有效 Cookie 并启用 use_cookies", "UPSTREAM_AUTH_REQUIRED");
      }
      const list = utils.first(root, ".videothumblist") || utils.first(root, ".videotextlist");
      const heading = utils.field(root, "#rightcolumn .boxtitle") || utils.field(root, "h2");
      if (!list || !heading) {
        return Result.Err("JAVLibrary 缺少演员信息或作品列表，请检查演员 ID、站点域名及验证状态", "UPSTREAM_INVALID_RESPONSE");
      }
      const actor = heading.replace(/\s*(?:的影片|的作品|のビデオ|Videos|影片|作品)\s*$/i, "").trim();
      if (!actor) return Result.Err("JAVLibrary 缺少演员名称", "UPSTREAM_INVALID_RESPONSE");
      const cards = utils.select(list, ".video");
      if (!cards.length && (utils.first(list, "a[href]") ||
          (utils.text_of(list) && !/空的列表|没有影片|沒有影片|no videos|no results/i.test(utils.text_of(list))))) {
        return Result.Err("JAVLibrary 作品列表结构已变化", "UPSTREAM_INVALID_RESPONSE");
      }
      const items = [];
      for (const card of cards) {
        const anchor = utils.first(card, "a[href]");
        const resolved = utils.absolute_url(anchor?.attrs.href, link);
        if (resolved.error) return resolved;
        const path = resolved.data.startsWith(origin + "/cn/") ? resolved.data.slice((origin + "/cn/").length) : "";
        const movie_id = path.match(/^\?v=([A-Za-z0-9_-]+)(?:&.*)?$/)?.[1];
        const code = utils.field(card, ".id");
        const title = utils.field(card, ".title") || anchor?.attrs.title || utils.text_of(anchor);
        if (!movie_id || !code || !title) {
          return Result.Err("JAVLibrary 作品缺少有效链接、番号或标题", "UPSTREAM_INVALID_RESPONSE");
        }
        const image = utils.absolute_url(utils.attribute(card, "img", "data-src") || utils.attribute(card, "img", "src"), link);
        if (image.error) return image;
        const item = {
          id: "javlibrary:movie:" + movie_id,
          title: title.startsWith(code) ? title : code + " " + title,
          link: origin + "/cn/?v=" + movie_id,
          author: actor, image: image.data || undefined,
          description: title,
        };
        item.content = render_item(item);
        items.push(item);
      }
      return Result.Ok({
        id: "javlibrary:star:" + id, title: actor + " - JAVLibrary 作品",
        link, description: actor + " 的JAVLibrary作品列表", language: "zh-CN",
        author: { name: actor, uri: link }, items,
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }
}

const script = new JavlibraryActorRSS();
export const routes = [{
  path: "/javlibrary/star/:id", name: "JAVLibrary 演员作品",
  url: "www.javlibrary.com", example: "/javlibrary/star/abbds",
  parameters: { id: "演员主页 vl_star.php?s= 后的本站 ID，各站 ID 不通用" },
  description: "读取演员全部作品模式的一页列表，?page=2 翻页；保留番号、标题及列表封面。列表没有发行日期时不补造时间，不逐部请求详情。",
  handler: (ctx) => script.run(ctx),
}];
