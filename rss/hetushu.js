import { utils } from "@findrss/util";
import { RSSScript, Result } from "@findrss/core";

// 由 scripts/generate_novel_sources.js 生成；修改模板和清单后重新生成。
// 书源参考：https://github.com/freeok/so-novel/tree/88de8b63d350c53f47a6f26f6af98a8c8304caa7/bundle/rules
const source = {
  "key": "hetushu",
  "name": "和图书",
  "origin": "https://www.hetushu.com",
  "book": "/book/{book_id}/index.html",
  "example": "5763",
  "items": "dl#dir > dd > a",
  "title": ".book_info > h2",
  "author_parent": ".book_info",
  "author": "a",
  "image": ".book_info > img"
};
export const version = "1.0.0";
export const platform = { name: source.name, icon: "" };

export class NovelChaptersRSS extends RSSScript {
  async fetch(ctx) {
    try {
      const params = ctx.params || {};
      if (!new RegExp("^(?:" + (source.id_pattern || "[0-9]+") + ")$").test(params.book_id || "") ||
        String(params.book_id).length > 256 || /\s/.test(params.book_id || "") ||
        (source.category && (!/^[0-9]{1,12}$/.test(params.category || "") || /\s/.test(params.category)))) {
        return Result.Err("小说 ID 或目录分组无效", "INVALID_PARAMETER");
      }
      const fill = value => value.replace(/\{(book_id|category)\}/g, (_, key) => params[key]);
      const link = source.origin + fill(source.book);
      const catalog = source.origin + fill(source.catalog || source.book);
      const detail = await NovelChaptersRSS.document(ctx, link, source.origin + "/");
      if (detail.error) return detail;
      const root = detail.data.root;
      const meta = name => utils.select(root, "meta").find(node => node.attrs.property === name || node.attrs.name === name)?.attrs.content || "";
      const title_nodes = source.title ? utils.select(root, source.title) : [];
      const title = meta("og:novel:book_name") || meta("og:title") ||
        utils.text_of(title_nodes.at(-1) || utils.first(root, "h1"));
      if (!title) return Result.Err(source.name + "缺少小说标题", "UPSTREAM_INVALID_RESPONSE");
      const author_root = source.author_parent ? utils.first(root, source.author_parent)?.children.filter(node => node.tag !== "text")[2] : root;
      const author = { name: (meta("og:novel:author") || (source.author && utils.field(author_root, source.author)) || title).replace(/^作者[：:]\s*/, ""), uri: link };
      const pages = [catalog], visited = new Set(), seen = new Set(), items = [];
      let cached = catalog === link ? detail.data : null;
      for (let index = 0; index < pages.length; index++) {
        // shortcut: 最多读取 100 个目录分页；遇到更长的小说时提高上限或由宿主分批调度。
        if (index >= 100) return Result.Err("小说目录超过 100 页，拒绝输出截断目录", "UPSTREAM_INVALID_RESPONSE");
        const url = pages[index];
        visited.add(url);
        const fetched = cached ? Result.Ok(cached) : await NovelChaptersRSS.document(ctx, url, link);
        cached = null;
        if (fetched.error) return fetched;
        const { root: directory, html } = fetched.data;
        let nodes = utils.select(directory, source.items);
        if (source.after_second_dt) {
          nodes = nodes.flatMap(dl => {
            let headings = 0;
            return dl.children.flatMap(child => {
              if (child.tag === "dt") headings++;
              return headings >= 2 && child.tag === "dd" ? utils.select(child, "a") : [];
            });
          });
        } else if (source.first_div) {
          nodes = nodes.length ? utils.select(nodes[0], "a") : [];
        } else if (source.onclick) {
          const list = nodes.sort((a, b) => b.children.length - a.children.length)[0];
          const rows = list ? list.children.filter(node => node.tag === "li") : [];
          const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(match => match[1]).join("\n");
          const hidden = [...styles.matchAll(/([^{}]+)\{\s*display\s*:\s*none\s*;?\s*\}/gi)]
            .filter(match => /(?:section-list|yanqing_list)/.test(match[1]));
          nodes = rows.flatMap((row, row_index) => {
            const suppressed = hidden.some(match => [...match[1].matchAll(/li:nth-(last-)?child\((\d+)\)/g)]
              .some(part => Number(part[2]) === (part[1] ? rows.length - row_index : row_index + 1)));
            return suppressed || /display\s*:\s*none/i.test(row.attrs.style || "") ? [] : utils.select(row, "a");
          });
        } else if (source.alternating_divs) {
          nodes = nodes.filter(node => {
            const container = node.parent?.parent;
            const position = container?.parent?.children.filter(child => child.tag !== "text").indexOf(container) + 1;
            return position >= 5 && position % 2 === 1;
          });
        }
        if (!nodes.length) return Result.Err(source.name + "目录页没有章节", "UPSTREAM_INVALID_RESPONSE");
        if (source.desc) nodes.reverse();
        let chapter_count = 0;
        for (const node of nodes) {
          const title = utils.text_of(node);
          let href = node.attrs.href || "";
          if (source.onclick && source.chapter) {
            const id = node.attrs.onclick?.match(/^\s*read_tz\(\s*(\d+)\s*\);?\s*$/)?.[1];
            if (id) href = fill(source.chapter).replace("{chapter_id}", id);
          }
          if (!title || !href || href.startsWith("#") || /^javascript:/i.test(href)) continue;
          const resolved = NovelChaptersRSS.site_url(href, url);
          if (resolved.error) return resolved;
          const chapter_link = resolved.data;
          if (chapter_link === link || pages.includes(chapter_link)) continue;
          chapter_count++;
          if (seen.has(chapter_link)) continue;
          seen.add(chapter_link);
          items.push({ id: source.key + ":chapter:" + chapter_link, title, link: chapter_link, description: "", author });
        }
        if (!chapter_count) return Result.Err(source.name + "目录没有有效章节链接", "UPSTREAM_INVALID_RESPONSE");
        let next_nodes = [];
        if (source.pagination === "options") next_nodes = utils.select(directory, source.options || "select > option");
        else if (source.pagination === "link") next_nodes = utils.select(directory, source.next);
        else if (source.pagination === "next") {
          const active = utils.first(directory, ".pagination li.active");
          const siblings = active?.parent?.children.filter(node => node.tag !== "text") || [];
          const next = siblings[siblings.indexOf(active) + 1];
          if (next && !String(next.attrs.class || "").split(/\s+/).includes("disabled")) next_nodes = utils.select(next, "a");
        }
        for (const node of next_nodes) {
          const href = node.attrs.href || node.attrs.value;
          if (!href || href.startsWith("#") || /^javascript:/i.test(href)) continue;
          const resolved = NovelChaptersRSS.site_url(href, url);
          if (resolved.error) return resolved;
          const next = resolved.data;
          if (!new RegExp("^" + fill(source.page_pattern) + "$").test(next.slice(source.origin.length))) {
            return Result.Err("目录分页不属于当前小说", "UPSTREAM_INVALID_RESPONSE");
          }
          if (source.pagination !== "options" && visited.has(next) && next !== url) {
            return Result.Err("小说目录分页循环", "UPSTREAM_INVALID_RESPONSE");
          }
          if (!pages.includes(next)) pages.push(next);
        }
      }
      const image = utils.absolute_url(meta("og:image") || (source.image && utils.attribute(root, source.image, "src")), link);
      if (image.error) return image;
      return Result.Ok({
        id: source.key + ":book:" + (source.category ? params.category + "/" : "") + params.book_id,
        title: title + " · 章节更新", link, language: source.language || "zh-CN", author,
        description: meta("og:description") || meta("description"), ...(image.data ? { image: image.data } : {}),
        items: items.reverse(), extra: { view: "article", tags: ["小说", source.name] },
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }
  static site_url(href, base) {
    const resolved = utils.absolute_url(href, base);
    if (resolved.error) return resolved;
    return resolved.data.startsWith(source.origin + "/") && !/[#]/.test(resolved.data)
      ? resolved : Result.Err("小说链接必须属于原站", "UPSTREAM_INVALID_RESPONSE");
  }
  static async document(ctx, url, referer) {
    let fetched = await utils.request_text(ctx, url, { headers: { Referer: referer } });
    const challenge = /<title>\s*(?:Just a moment|Attention Required)|_cf_chl_opt|id=["']challenge-form["']/i;
    if (ctx.env?.BROWSER_ENABLED && (["UPSTREAM_ACCESS_DENIED", "UPSTREAM_AUTH_REQUIRED"].includes(fetched.code) ||
      (!fetched.error && challenge.test(fetched.data)))) {
      fetched = await NovelChaptersRSS.navigate(ctx, url, { wait_ms: 0 });
    }
    if (fetched.error) return fetched;
    if (challenge.test(fetched.data)) return Result.Err(source.name + "需要完成访问验证，请启用 BROWSER_ENABLED", "UPSTREAM_AUTH_REQUIRED");
    const parsed = utils.document_nodes(fetched.data);
    return parsed.error ? parsed : Result.Ok({ root: parsed.data, html: fetched.data });
  }
}

const script = new NovelChaptersRSS();
export const route = {
  name: source.name + "小说章节",
  path: "/" + source.key + "/book/" + (source.category ? ":category/" : "") + ":book_id",
  url: source.origin.replace(/^https?:\/\//, ""), maintainers: ["findrss"],
  example: "/" + source.key + "/book/" + source.example,
  example_name: source.example_name || source.name + " · " + source.example,
  parameters: { book_id: "小说详情页 " + source.book + " 中的 book_id", ...(source.category ? { category: "小说详情页路径中 book_id 前的数字分组" } : {}) },
  description: "订阅小说章节标题和原站链接，读取完整目录并倒序输出，不抓取正文。分页失败会返回错误；访问验证可启用 BROWSER_ENABLED。",
  handler: ctx => script.run(ctx),
};
