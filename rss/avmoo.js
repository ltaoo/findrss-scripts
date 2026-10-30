import { utils } from "@findrss/util";
import { RSSScript, Result } from "@findrss/core";

// 更换镜像时修改此处；Cookie 权限随之更新，需要重新确认授权。
const origin = "https://avmoo.com";
export const platform = { name: "Avmoo" };

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
