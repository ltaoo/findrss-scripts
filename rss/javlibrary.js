import { utils } from "@findrss/util";
import { RSSScript, Result } from "@findrss/core";

// 更换镜像时修改此处；Cookie 权限随之更新，需要重新确认授权。
const origin = "https://www.javlibrary.com";
// Favicon: https://www.javlibrary.com/favicon.ico
// 保留原图像素网格，确保颜色、透明度和轮廓与上游一致。
export const platform = {
  name: "JAVLibrary",
  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges" data-n="javlibrary-platform-icon"><path fill="#f908bb" d="M0 0h32v3h-32ZM0 3h11v1h-11ZM16 3h16v1h-16ZM0 4h10v1h-10ZM17 4h15v6h-15ZM0 5h9v4h-9ZM0 9h10v1h-10ZM0 10h11v1h-11ZM16 10h16v1h-16ZM0 11h9v1h-9ZM14 11h18v3h-18ZM0 12h8v1h-8ZM0 13h7v15h-7ZM14 14h12v1h-12ZM28 14h4v3h-4ZM14 15h11v3h-11ZM27 17h5v2h-5ZM14 18h10v2h-10ZM26 19h6v3h-6ZM17 20h6v1h-6ZM16 22h1v1h-1ZM25 22h7v1h-7ZM23 23h9v1h-9ZM24 24h8v1h-8ZM23 25h9v2h-9ZM20 27h12v1h-12ZM0 28h32v4h-32Z" data-n="javlibrary-favicon-color-f908bbff"/><path fill="#f912be" d="M11 3h1v1h-1ZM7 13h1v1h-1Z" data-n="javlibrary-favicon-color-f912beff"/><path fill="#fb5cd2" d="M12 3h1v1h-1Z" data-n="javlibrary-favicon-color-fb5cd2ff"/><path fill="#fc72d8" d="M13 3h1v1h-1Z" data-n="javlibrary-favicon-color-fc72d8ff"/><path fill="#fa44cc" d="M14 3h1v1h-1Z" data-n="javlibrary-favicon-color-fa44ccff"/><path fill="#f909bb" d="M15 3h1v1h-1ZM9 5h1v1h-1ZM9 8h1v1h-1ZM27 16h1v1h-1ZM23 20h1v1h-1ZM25 21h1v1h-1ZM23 24h1v1h-1Z" data-n="javlibrary-favicon-color-f909bbff"/><path fill="#fa2cc5" d="M10 4h1v1h-1Z" data-n="javlibrary-favicon-color-fa2cc5ff"/><path fill="#fedff6" d="M11 4h1v1h-1Z" data-n="javlibrary-favicon-color-fedff6ff"/><path fill="#ffffff" d="M12 4h3v1h-3ZM11 5h5v4h-5ZM12 9h3v1h-3ZM10 12h3v1h-3ZM9 13h4v1h-4ZM8 14h5v9h-5ZM8 23h6v1h-6ZM8 24h14v2h-14ZM8 26h11v1h-11Z" data-n="javlibrary-favicon-color-ffffffff"/><path fill="#fdade9" d="M15 4h1v1h-1Z" data-n="javlibrary-favicon-color-fdade9ff"/><path fill="#f90ebd" d="M16 4h1v1h-1ZM25 15h1v1h-1Z" data-n="javlibrary-favicon-color-f90ebdff"/><path fill="#fec5ef" d="M10 5h1v1h-1Z" data-n="javlibrary-favicon-color-fec5efff"/><path fill="#fc77da" d="M16 5h1v1h-1Z" data-n="javlibrary-favicon-color-fc77daff"/><path fill="#fa1ec1" d="M9 6h1v1h-1Z" data-n="javlibrary-favicon-color-fa1ec1ff"/><path fill="#fffbfe" d="M10 6h1v1h-1ZM13 27h1v1h-1Z" data-n="javlibrary-favicon-color-fffbfeff"/><path fill="#fec2ee" d="M16 6h1v1h-1Z" data-n="javlibrary-favicon-color-fec2eeff"/><path fill="#fa1fc1" d="M9 7h1v1h-1Z" data-n="javlibrary-favicon-color-fa1fc1ff"/><path fill="#fffcfe" d="M10 7h1v1h-1Z" data-n="javlibrary-favicon-color-fffcfeff"/><path fill="#fec3ef" d="M16 7h1v1h-1Z" data-n="javlibrary-favicon-color-fec3efff"/><path fill="#fec8f0" d="M10 8h1v1h-1Z" data-n="javlibrary-favicon-color-fec8f0ff"/><path fill="#fc7ada" d="M16 8h1v1h-1Z" data-n="javlibrary-favicon-color-fc7adaff"/><path fill="#fa2fc6" d="M10 9h1v1h-1Z" data-n="javlibrary-favicon-color-fa2fc6ff"/><path fill="#fee2f7" d="M11 9h1v1h-1Z" data-n="javlibrary-favicon-color-fee2f7ff"/><path fill="#fdb3ea" d="M15 9h1v1h-1Z" data-n="javlibrary-favicon-color-fdb3eaff"/><path fill="#f90fbd" d="M16 9h1v1h-1Z" data-n="javlibrary-favicon-color-f90fbdff"/><path fill="#f918bf" d="M11 10h1v1h-1Z" data-n="javlibrary-favicon-color-f918bfff"/><path fill="#fc6fd7" d="M12 10h1v1h-1Z" data-n="javlibrary-favicon-color-fc6fd7ff"/><path fill="#fc7edc" d="M13 10h1v1h-1ZM17 22h1v1h-1Z" data-n="javlibrary-favicon-color-fc7edcff"/><path fill="#fb4bce" d="M14 10h1v1h-1Z" data-n="javlibrary-favicon-color-fb4bceff"/><path fill="#f90bbc" d="M15 10h1v1h-1Z" data-n="javlibrary-favicon-color-f90bbcff"/><path fill="#fa33c7" d="M9 11h1v1h-1Z" data-n="javlibrary-favicon-color-fa33c7ff"/><path fill="#fda5e6" d="M10 11h1v1h-1Z" data-n="javlibrary-favicon-color-fda5e6ff"/><path fill="#fee6f8" d="M11 11h1v1h-1Z" data-n="javlibrary-favicon-color-fee6f8ff"/><path fill="#fff9fd" d="M12 11h1v1h-1ZM12 27h1v1h-1ZM14 27h1v1h-1Z" data-n="javlibrary-favicon-color-fff9fdff"/><path fill="#fb61d3" d="M13 11h1v1h-1Z" data-n="javlibrary-favicon-color-fb61d3ff"/><path fill="#fb53d0" d="M8 12h1v1h-1Z" data-n="javlibrary-favicon-color-fb53d0ff"/><path fill="#fff7fd" d="M9 12h1v1h-1ZM15 27h1v1h-1Z" data-n="javlibrary-favicon-color-fff7fdff"/><path fill="#fb65d4" d="M13 12h1v1h-1Z" data-n="javlibrary-favicon-color-fb65d4ff"/><path fill="#feeaf9" d="M8 13h1v1h-1Z" data-n="javlibrary-favicon-color-feeaf9ff"/><path fill="#fb66d5" d="M13 13h1v1h-1ZM26 17h1v1h-1ZM19 27h1v1h-1Z" data-n="javlibrary-favicon-color-fb66d5ff"/><path fill="#fb4ece" d="M7 14h1v1h-1Z" data-n="javlibrary-favicon-color-fb4eceff"/><path fill="#fb68d5" d="M13 14h1v1h-1Z" data-n="javlibrary-favicon-color-fb68d5ff"/><path fill="#fb77d9" d="M26 14h1v1h-1Z" data-n="javlibrary-favicon-color-fb77d9ff"/><path fill="#fa24c3" d="M27 14h1v1h-1Z" data-n="javlibrary-favicon-color-fa24c3ff"/><path fill="#fc69d6" d="M7 15h1v1h-1Z" data-n="javlibrary-favicon-color-fc69d6ff"/><path fill="#fb6bd6" d="M13 15h1v1h-1Z" data-n="javlibrary-favicon-color-fb6bd6ff"/><path fill="#fee0f6" d="M26 15h1v1h-1Z" data-n="javlibrary-favicon-color-fee0f6ff"/><path fill="#fa30c6" d="M27 15h1v1h-1Z" data-n="javlibrary-favicon-color-fa30c6ff"/><path fill="#fc6cd7" d="M7 16h1v1h-1Z" data-n="javlibrary-favicon-color-fc6cd7ff"/><path fill="#fb6dd7" d="M13 16h1v1h-1Z" data-n="javlibrary-favicon-color-fb6dd7ff"/><path fill="#fb51cf" d="M25 16h1v1h-1Z" data-n="javlibrary-favicon-color-fb51cfff"/><path fill="#fdc6ef" d="M26 16h1v1h-1Z" data-n="javlibrary-favicon-color-fdc6efff"/><path fill="#fc6dd7" d="M7 17h1v1h-1Z" data-n="javlibrary-favicon-color-fc6dd7ff"/><path fill="#fb6ed7" d="M13 17h1v1h-1Z" data-n="javlibrary-favicon-color-fb6ed7ff"/><path fill="#fdb0e9" d="M25 17h1v1h-1Z" data-n="javlibrary-favicon-color-fdb0e9ff"/><path fill="#fc6fd8" d="M7 18h1v1h-1Z" data-n="javlibrary-favicon-color-fc6fd8ff"/><path fill="#fb6fd7" d="M13 18h1v3h-1Z" data-n="javlibrary-favicon-color-fb6fd7ff"/><path fill="#f920c2" d="M24 18h1v1h-1Z" data-n="javlibrary-favicon-color-f920c2ff"/><path fill="#fee7f8" d="M25 18h1v1h-1Z" data-n="javlibrary-favicon-color-fee7f8ff"/><path fill="#f916bf" d="M26 18h1v1h-1Z" data-n="javlibrary-favicon-color-f916bfff"/><path fill="#fc71d8" d="M7 19h1v1h-1Z" data-n="javlibrary-favicon-color-fc71d8ff"/><path fill="#fc79da" d="M24 19h1v1h-1ZM22 23h1v1h-1Z" data-n="javlibrary-favicon-color-fc79daff"/><path fill="#fc9de4" d="M25 19h1v1h-1Z" data-n="javlibrary-favicon-color-fc9de4ff"/><path fill="#fc73d9" d="M7 20h1v1h-1Z" data-n="javlibrary-favicon-color-fc73d9ff"/><path fill="#fa28c4" d="M14 20h1v1h-1Z" data-n="javlibrary-favicon-color-fa28c4ff"/><path fill="#fdc9f0" d="M15 20h1v1h-1Z" data-n="javlibrary-favicon-color-fdc9f0ff"/><path fill="#fb53cf" d="M16 20h1v1h-1Z" data-n="javlibrary-favicon-color-fb53cfff"/><path fill="#fed8f4" d="M24 20h1v1h-1Z" data-n="javlibrary-favicon-color-fed8f4ff"/><path fill="#fa3dc9" d="M25 20h1v1h-1Z" data-n="javlibrary-favicon-color-fa3dc9ff"/><path fill="#fc75d9" d="M7 21h1v1h-1Z" data-n="javlibrary-favicon-color-fc75d9ff"/><path fill="#fb85dc" d="M13 21h1v1h-1Z" data-n="javlibrary-favicon-color-fb85dcff"/><path fill="#fdd6f3" d="M14 21h1v1h-1Z" data-n="javlibrary-favicon-color-fdd6f3ff"/><path fill="#fef9fd" d="M15 21h1v1h-1Z" data-n="javlibrary-favicon-color-fef9fdff"/><path fill="#fa4cce" d="M16 21h1v1h-1Z" data-n="javlibrary-favicon-color-fa4cceff"/><path fill="#fb54d0" d="M17 21h1v1h-1Z" data-n="javlibrary-favicon-color-fb54d0ff"/><path fill="#fb4cce" d="M18 21h1v1h-1Z" data-n="javlibrary-favicon-color-fb4cceff"/><path fill="#fa49cd" d="M19 21h1v1h-1Z" data-n="javlibrary-favicon-color-fa49cdff"/><path fill="#fa48cd" d="M20 21h1v1h-1Z" data-n="javlibrary-favicon-color-fa48cdff"/><path fill="#fb45cc" d="M21 21h1v1h-1Z" data-n="javlibrary-favicon-color-fb45ccff"/><path fill="#fa40ca" d="M22 21h1v1h-1Z" data-n="javlibrary-favicon-color-fa40caff"/><path fill="#fa43cb" d="M23 21h1v1h-1Z" data-n="javlibrary-favicon-color-fa43cbff"/><path fill="#fc90e1" d="M24 21h1v1h-1Z" data-n="javlibrary-favicon-color-fc90e1ff"/><path fill="#fc76d9" d="M7 22h1v5h-1Z" data-n="javlibrary-favicon-color-fc76d9ff"/><path fill="#fef8fd" d="M13 22h1v1h-1Z" data-n="javlibrary-favicon-color-fef8fdff"/><path fill="#fefdfe" d="M14 22h1v1h-1Z" data-n="javlibrary-favicon-color-fefdfeff"/><path fill="#fb6ad6" d="M15 22h1v1h-1Z" data-n="javlibrary-favicon-color-fb6ad6ff"/><path fill="#febced" d="M18 22h1v1h-1Z" data-n="javlibrary-favicon-color-febcedff"/><path fill="#fec4ef" d="M19 22h1v1h-1Z" data-n="javlibrary-favicon-color-fec4efff"/><path fill="#fec9f0" d="M20 22h1v1h-1Z" data-n="javlibrary-favicon-color-fec9f0ff"/><path fill="#fecef1" d="M21 22h1v1h-1Z" data-n="javlibrary-favicon-color-fecef1ff"/><path fill="#fed3f3" d="M22 22h1v1h-1Z" data-n="javlibrary-favicon-color-fed3f3ff"/><path fill="#fed4f3" d="M23 22h1v1h-1Z" data-n="javlibrary-favicon-color-fed4f3ff"/><path fill="#fda1e5" d="M24 22h1v1h-1Z" data-n="javlibrary-favicon-color-fda1e5ff"/><path fill="#fedbf5" d="M14 23h1v1h-1ZM22 24h1v1h-1Z" data-n="javlibrary-favicon-color-fedbf5ff"/><path fill="#fc80dc" d="M15 23h4v1h-4Z" data-n="javlibrary-favicon-color-fc80dcff"/><path fill="#fc81dc" d="M19 23h1v1h-1Z" data-n="javlibrary-favicon-color-fc81dcff"/><path fill="#fc85dd" d="M20 23h1v1h-1Z" data-n="javlibrary-favicon-color-fc85ddff"/><path fill="#fc8fe0" d="M21 23h1v1h-1Z" data-n="javlibrary-favicon-color-fc8fe0ff"/><path fill="#fc89de" d="M22 25h1v1h-1Z" data-n="javlibrary-favicon-color-fc89deff"/><path fill="#fff4fc" d="M19 26h1v1h-1ZM10 27h1v1h-1Z" data-n="javlibrary-favicon-color-fff4fcff"/><path fill="#fc98e3" d="M20 26h1v1h-1Z" data-n="javlibrary-favicon-color-fc98e3ff"/><path fill="#fb60d3" d="M21 26h1v1h-1Z" data-n="javlibrary-favicon-color-fb60d3ff"/><path fill="#f90cbc" d="M22 26h1v1h-1Z" data-n="javlibrary-favicon-color-f90cbcff"/><path fill="#fc6ed7" d="M7 27h1v1h-1Z" data-n="javlibrary-favicon-color-fc6ed7ff"/><path fill="#fff1fb" d="M8 27h1v1h-1Z" data-n="javlibrary-favicon-color-fff1fbff"/><path fill="#fff3fb" d="M9 27h1v1h-1Z" data-n="javlibrary-favicon-color-fff3fbff"/><path fill="#fff7fc" d="M11 27h1v1h-1Z" data-n="javlibrary-favicon-color-fff7fcff"/><path fill="#fff5fc" d="M16 27h1v1h-1Z" data-n="javlibrary-favicon-color-fff5fcff"/><path fill="#fff3fc" d="M17 27h1v1h-1Z" data-n="javlibrary-favicon-color-fff3fcff"/><path fill="#fff2fb" d="M18 27h1v1h-1Z" data-n="javlibrary-favicon-color-fff2fbff"/></svg>',
};

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
