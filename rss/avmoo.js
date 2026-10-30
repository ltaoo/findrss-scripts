import { utils } from "@findrss/util";
import { RSSScript, Result } from "@findrss/core";

// 更换镜像时修改此处；Cookie 权限随之更新，需要重新确认授权。
const origin = "https://avmoo.com";
// Favicon: https://avmoo.shop/res/fonts/favicon.0f9d2ebac51c3a1fddda.ico
// 保留原图像素网格，确保颜色、透明度和轮廓与上游一致。
export const platform = {
  name: "Avmoo",
  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16" shape-rendering="crispEdges" data-n="avmoo-platform-icon"><path fill="#f2bebe" fill-opacity="0.8627451" d="M0 0h1v1h-1ZM15 0h1v1h-1ZM0 15h1v1h-1ZM15 15h1v1h-1Z" data-n="avmoo-favicon-color-f2bebedc"/><path fill="#d72222" fill-opacity="0.92941176" d="M1 0h1v1h-1ZM14 0h1v1h-1ZM1 15h1v1h-1ZM14 15h1v1h-1Z" data-n="avmoo-favicon-color-d72222ed"/><path fill="#cb0000" fill-opacity="0.92941176" d="M2 0h1v1h-1ZM13 0h1v1h-1ZM0 2h1v1h-1ZM15 2h1v1h-1ZM0 13h1v1h-1ZM15 13h1v1h-1ZM2 15h1v1h-1ZM13 15h1v1h-1Z" data-n="avmoo-favicon-color-cb0000ed"/><path fill="#cc0000" fill-opacity="0.92941176" d="M3 0h10v1h-10ZM0 3h1v10h-1ZM15 3h1v10h-1ZM3 15h10v1h-10Z" data-n="avmoo-favicon-color-cc0000ed"/><path fill="#d11e1e" fill-opacity="0.95294118" d="M0 1h1v1h-1ZM15 1h1v1h-1ZM0 14h1v1h-1ZM15 14h1v1h-1Z" data-n="avmoo-favicon-color-d11e1ef3"/><path fill="#d50000" d="M1 1h1v1h-1ZM14 1h1v1h-1ZM1 14h1v1h-1ZM14 14h1v1h-1Z" data-n="avmoo-favicon-color-d50000ff"/><path fill="#d20000" d="M2 1h1v1h-1ZM13 1h1v1h-1ZM2 14h1v1h-1ZM13 14h1v1h-1Z" data-n="avmoo-favicon-color-d20000ff"/><path fill="#d10000" d="M3 1h10v1h-10ZM1 2h1v12h-1ZM14 2h1v12h-1ZM3 14h10v1h-10Z" data-n="avmoo-favicon-color-d10000ff"/><path fill="#cc0000" d="M2 2h4v2h-4ZM10 2h4v1h-4ZM11 3h3v3h-3ZM2 4h3v2h-3ZM2 6h2v3h-2ZM12 6h2v3h-2ZM2 9h1v2h-1ZM13 9h1v2h-1ZM7 12h1v1h-1ZM9 12h1v1h-1ZM2 13h2v1h-2ZM6 13h4v1h-4ZM12 13h2v1h-2Z" data-n="avmoo-favicon-color-cc0000ff"/><path fill="#cb0000" d="M6 2h1v1h-1ZM9 2h1v1h-1ZM10 3h1v1h-1ZM11 8h1v1h-1ZM2 11h1v2h-1ZM13 11h1v2h-1ZM8 12h1v1h-1Z" data-n="avmoo-favicon-color-cb0000ff"/><path fill="#c90000" d="M7 2h2v1h-2ZM5 4h1v2h-1ZM4 13h2v1h-2ZM10 13h2v1h-2Z" data-n="avmoo-favicon-color-c90000ff"/><path fill="#cd0707" d="M6 3h1v1h-1Z" data-n="avmoo-favicon-color-cd0707ff"/><path fill="#dc4f4f" d="M7 3h1v1h-1Z" data-n="avmoo-favicon-color-dc4f4fff"/><path fill="#dd5252" d="M8 3h1v1h-1Z" data-n="avmoo-favicon-color-dd5252ff"/><path fill="#ce0b0b" d="M9 3h1v1h-1Z" data-n="avmoo-favicon-color-ce0b0bff"/><path fill="#db4e4e" d="M6 4h1v1h-1Z" data-n="avmoo-favicon-color-db4e4eff"/><path fill="#ffffff" d="M7 4h2v2h-2ZM6 7h1v2h-1ZM9 7h1v2h-1ZM6 9h4v1h-4ZM5 10h1v2h-1ZM10 10h1v2h-1Z" data-n="avmoo-favicon-color-ffffffff"/><path fill="#df5c5c" d="M9 4h1v1h-1Z" data-n="avmoo-favicon-color-df5c5cff"/><path fill="#c80000" d="M10 4h1v1h-1ZM4 7h1v1h-1ZM11 7h1v1h-1ZM3 10h1v1h-1ZM12 10h1v1h-1Z" data-n="avmoo-favicon-color-c80000ff"/><path fill="#eda6a6" d="M6 5h1v1h-1Z" data-n="avmoo-favicon-color-eda6a6ff"/><path fill="#f1b6b6" d="M9 5h1v1h-1Z" data-n="avmoo-favicon-color-f1b6b6ff"/><path fill="#ca0000" d="M10 5h1v1h-1ZM4 6h1v1h-1ZM11 6h1v1h-1ZM4 8h1v1h-1ZM3 9h1v1h-1ZM12 9h1v1h-1Z" data-n="avmoo-favicon-color-ca0000ff"/><path fill="#d11616" d="M5 6h1v1h-1Z" data-n="avmoo-favicon-color-d11616ff"/><path fill="#fcf0f0" d="M6 6h1v1h-1Z" data-n="avmoo-favicon-color-fcf0f0ff"/><path fill="#fbe9e9" d="M7 6h1v1h-1Z" data-n="avmoo-favicon-color-fbe9e9ff"/><path fill="#f9e2e2" d="M8 6h1v1h-1Z" data-n="avmoo-favicon-color-f9e2e2ff"/><path fill="#fef9f9" d="M9 6h1v1h-1Z" data-n="avmoo-favicon-color-fef9f9ff"/><path fill="#d32222" d="M10 6h1v1h-1Z" data-n="avmoo-favicon-color-d32222ff"/><path fill="#df5f5f" d="M5 7h1v1h-1Z" data-n="avmoo-favicon-color-df5f5fff"/><path fill="#e57f7f" d="M7 7h1v1h-1Z" data-n="avmoo-favicon-color-e57f7fff"/><path fill="#e06565" d="M8 7h1v1h-1Z" data-n="avmoo-favicon-color-e06565ff"/><path fill="#e37474" d="M10 7h1v1h-1Z" data-n="avmoo-favicon-color-e37474ff"/><path fill="#f1b7b7" d="M5 8h1v1h-1Z" data-n="avmoo-favicon-color-f1b7b7ff"/><path fill="#e16969" d="M7 8h1v1h-1Z" data-n="avmoo-favicon-color-e16969ff"/><path fill="#dd5353" d="M8 8h1v1h-1Z" data-n="avmoo-favicon-color-dd5353ff"/><path fill="#f4cbcb" d="M10 8h1v1h-1Z" data-n="avmoo-favicon-color-f4cbcbff"/><path fill="#d32020" d="M4 9h1v1h-1Z" data-n="avmoo-favicon-color-d32020ff"/><path fill="#fdf5f5" d="M5 9h1v1h-1Z" data-n="avmoo-favicon-color-fdf5f5ff"/><path fill="#fefcfc" d="M10 9h1v1h-1Z" data-n="avmoo-favicon-color-fefcfcff"/><path fill="#d63131" d="M11 9h1v1h-1Z" data-n="avmoo-favicon-color-d63131ff"/><path fill="#e26f6f" d="M4 10h1v1h-1Z" data-n="avmoo-favicon-color-e26f6fff"/><path fill="#f3c2c2" d="M6 10h1v1h-1Z" data-n="avmoo-favicon-color-f3c2c2ff"/><path fill="#e47c7c" d="M7 10h1v1h-1Z" data-n="avmoo-favicon-color-e47c7cff"/><path fill="#e47b7b" d="M8 10h1v1h-1Z" data-n="avmoo-favicon-color-e47b7bff"/><path fill="#efb0b0" d="M9 10h1v1h-1Z" data-n="avmoo-favicon-color-efb0b0ff"/><path fill="#e78686" d="M11 10h1v1h-1Z" data-n="avmoo-favicon-color-e78686ff"/><path fill="#cc0707" d="M3 11h1v1h-1Z" data-n="avmoo-favicon-color-cc0707ff"/><path fill="#f8dbdb" d="M4 11h1v1h-1Z" data-n="avmoo-favicon-color-f8dbdbff"/><path fill="#d83d3d" d="M6 11h1v1h-1Z" data-n="avmoo-favicon-color-d83d3dff"/><path fill="#c60000" d="M7 11h2v1h-2Z" data-n="avmoo-favicon-color-c60000ff"/><path fill="#d32121" d="M9 11h1v1h-1Z" data-n="avmoo-favicon-color-d32121ff"/><path fill="#fcefef" d="M11 11h1v1h-1Z" data-n="avmoo-favicon-color-fcefefff"/><path fill="#ce0e0e" d="M12 11h1v1h-1Z" data-n="avmoo-favicon-color-ce0e0eff"/><path fill="#cf0f0f" d="M3 12h1v1h-1Z" data-n="avmoo-favicon-color-cf0f0fff"/><path fill="#e67f7f" d="M4 12h1v1h-1Z" data-n="avmoo-favicon-color-e67f7fff"/><path fill="#e47676" d="M5 12h1v1h-1Z" data-n="avmoo-favicon-color-e47676ff"/><path fill="#cd0505" d="M6 12h1v1h-1Z" data-n="avmoo-favicon-color-cd0505ff"/><path fill="#e16b6b" d="M10 12h1v1h-1Z" data-n="avmoo-favicon-color-e16b6bff"/><path fill="#e78484" d="M11 12h1v1h-1Z" data-n="avmoo-favicon-color-e78484ff"/><path fill="#d11919" d="M12 12h1v1h-1Z" data-n="avmoo-favicon-color-d11919ff"/></svg>',
};

export const version = "1.0.0";
export const config_schema = {
  type: "object",
  properties: {
    use_cookies: {
      type: "boolean", title: "使用已授权的站点 Cookie", default: false,
      description: "遇到验证页时，先同步本站 Cookie 并确认脚本权限，再启用。",
    },
  },
};

export const permissions = {
  cookies: [{
    id: "site", origin, path_prefix: "/",
    names: ["PHPSESSID","cf_clearance","__cf_bm"],
    purpose: "读取已通过站点验证的演员作品列表",
  }],
};

// View 只渲染 Model 已解析的数据。
function render_item(item) {
  const escape = utils.escape_html;
  return '<p data-n="movie-title">' + escape(item.title) + '</p>' +
    (item.release_date ? '<p data-n="movie-release-date">发行日期：' + escape(item.release_date) + '</p>' : "") +
    (item.image ? '<img data-n="movie-cover" src="' + escape(item.image) + '" alt="' + escape(item.title) + '">' : "");
}

export class AvmooActorRSS extends RSSScript {
  async fetch(ctx) {
    try {
      const id = String(ctx.params?.id || "");
      const page = String(ctx.query?.page ?? "1");
      if (!/^[A-Za-z0-9]{1,32}$/.test(id) || !/^[1-9]\d{0,3}$/.test(page)) {
        return Result.Err("演员 ID 必须是字母或数字，page 必须是 1–9999 的整数", "INVALID_PARAMETER");
      }
      // shortcut: 每次读取指定的一页，需要全量历史同步时再增加受限分页。
      const link = origin + "/cn/star/" + id + (page === "1" ? "" : "/" + page);
      const options = { headers: { Accept: "text/html", Referer: origin + "/" } };
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
      if (/just a moment|attention required|age verification|verify (?:your|you are)|年龄验证|年齡驗證|驗證您的|验证您的/i.test(page_title) ||
          utils.first(root, "#challenge-form")) {
        return Result.Err("Avmoo 返回验证页，请同步有效 Cookie 并启用 use_cookies", "UPSTREAM_AUTH_REQUIRED");
      }
      const list = utils.first(root, "#waterfall");
      const actor = utils.field(root, ".avatar-box .pb-10");
      if (!list || !actor) {
        return Result.Err("Avmoo 缺少演员信息或作品列表，请检查演员 ID、站点域名及验证状态", "UPSTREAM_INVALID_RESPONSE");
      }
      const cards = utils.select(list, "a.movie-box");
      if (!cards.length && (utils.first(list, "a[href]") || utils.first(list, ".item") ||
          (utils.text_of(list) && !/空的列表|没有影片|沒有影片|沒有相關影片|no videos|no results/i.test(utils.text_of(list))))) {
        return Result.Err("Avmoo 作品列表结构已变化", "UPSTREAM_INVALID_RESPONSE");
      }
      const items = [];
      for (const card of cards) {
        const resolved = utils.absolute_url(card.attrs.href, link);
        if (resolved.error) return resolved;
        const path = resolved.data.startsWith(origin + "/") ? resolved.data.slice(origin.length) : "";
        const movie_id = path.match(/^\/cn\/movie\/([A-Za-z0-9]+)\/?(?:[?#].*)?$/)?.[1];
        const code = utils.field(card, "date");
        const title = utils.attribute(card, "img", "title") || utils.attribute(card, "img", "alt") ||
          utils.field(card, ".photo-info span").split(code)[0].trim();
        if (!movie_id || !code || !title) {
          return Result.Err("Avmoo 作品缺少有效链接、番号或标题", "UPSTREAM_INVALID_RESPONSE");
        }
        const image = utils.absolute_url(utils.attribute(card, "img", "data-src") || utils.attribute(card, "img", "src"), link);
        if (image.error) return image;
        const release_date = utils.select(card, "date").slice(1).map(node => utils.text_of(node))
          .find(value => /^\d{4}-\d{2}-\d{2}$/.test(value));
        if (release_date && (!Number.isFinite(Date.parse(release_date)) ||
            new Date(release_date).toISOString().slice(0, 10) !== release_date)) {
          return Result.Err("Avmoo 作品发行日期无效", "UPSTREAM_INVALID_RESPONSE");
        }
        const item = {
          id: "avmoo:movie:" + movie_id,
          title: title.startsWith(code) ? title : code + " " + title,
          link: origin + "/cn/movie/" + movie_id,
          author: actor, image: image.data || undefined,
          release_date,
          published: release_date,
        };
        item.description = item.title;
        item.content = render_item(item);
        items.push(item);
      }
      return Result.Ok({
        id: "avmoo:star:" + id, title: actor + " - Avmoo 作品",
        link, description: actor + " 的Avmoo作品列表", language: "zh-CN",
        author: { name: actor, uri: origin + "/cn/star/" + id }, items,
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }
}

const script = new AvmooActorRSS();
export const routes = [{
  path: "/avmoo/star/:id", name: "Avmoo 演员作品",
  url: origin.replace("https://", ""), example: "/avmoo/star/abc123",
  parameters: { id: "演员主页 /star/ 后的本站 ID，各站 ID 不通用" },
  description: "读取演员一页作品，?page=2 翻页；保留番号、标题、封面和发行日期。不提供日期时不补造时间。",
  handler: (ctx) => script.run(ctx),
}];
