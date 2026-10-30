import { utils } from "@findrss/util";
import { RSSScript, Result } from "@findrss/core";

// 更换镜像时修改此处；Cookie 权限随之更新，需要重新确认授权。
const origin = "https://www.javbus.com";
// Favicon: https://www.javbus.com/favicon.ico
// 保留原图像素网格，确保颜色、透明度和轮廓与上游一致。
export const platform = {
  name: "JavBus",
  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16" shape-rendering="crispEdges" data-n="javbus-platform-icon"><path fill="#cc0000" fill-opacity="0.3372549" d="M0 0h1v1h-1ZM15 0h1v1h-1ZM0 15h1v1h-1ZM15 15h1v1h-1Z" data-n="javbus-favicon-color-cc000056"/><path fill="#cc0000" fill-opacity="0.85882353" d="M1 0h1v1h-1ZM14 0h1v1h-1ZM0 1h1v1h-1ZM15 1h1v1h-1ZM0 14h1v1h-1ZM15 14h1v1h-1ZM1 15h1v1h-1ZM14 15h1v1h-1Z" data-n="javbus-favicon-color-cc0000db"/><path fill="#cc0000" d="M2 0h12v1h-12ZM1 1h14v1h-14ZM0 2h8v1h-8ZM10 2h6v1h-6ZM0 3h7v5h-7ZM11 3h5v1h-5ZM12 4h4v6h-4ZM0 8h4v1h-4ZM5 8h2v1h-2ZM0 9h3v3h-3ZM11 10h5v2h-5ZM0 12h4v1h-4ZM10 12h6v1h-6ZM0 13h5v1h-5ZM6 13h1v1h-1ZM9 13h7v1h-7ZM1 14h14v1h-14ZM2 15h12v1h-12Z" data-n="javbus-favicon-color-cc0000ff"/><path fill="#cb0000" d="M8 2h2v1h-2ZM11 4h1v6h-1ZM4 8h1v1h-1ZM3 11h1v1h-1ZM5 13h1v1h-1ZM8 13h1v1h-1Z" data-n="javbus-favicon-color-cb0000ff"/><path fill="#cd0404" d="M7 3h1v1h-1ZM4 12h1v1h-1Z" data-n="javbus-favicon-color-cd0404ff"/><path fill="#d94040" d="M8 3h1v1h-1Z" data-n="javbus-favicon-color-d94040ff"/><path fill="#dc5050" d="M9 3h1v1h-1Z" data-n="javbus-favicon-color-dc5050ff"/><path fill="#cf1010" d="M10 3h1v1h-1Z" data-n="javbus-favicon-color-cf1010ff"/><path fill="#cf0d0d" d="M7 4h1v5h-1Z" data-n="javbus-favicon-color-cf0d0dff"/><path fill="#f1baba" d="M8 4h1v1h-1Z" data-n="javbus-favicon-color-f1babaff"/><path fill="#fae8e8" d="M9 4h1v1h-1Z" data-n="javbus-favicon-color-fae8e8ff"/><path fill="#d52f2f" d="M10 4h1v1h-1Z" data-n="javbus-favicon-color-d52f2fff"/><path fill="#f2bebe" d="M8 5h1v4h-1Z" data-n="javbus-favicon-color-f2bebeff"/><path fill="#fbeded" d="M9 5h1v3h-1ZM9 9h1v1h-1Z" data-n="javbus-favicon-color-fbededff"/><path fill="#d63030" d="M10 5h1v4h-1Z" data-n="javbus-favicon-color-d63030ff"/><path fill="#fceded" d="M9 8h1v1h-1Z" data-n="javbus-favicon-color-fcededff"/><path fill="#cc0202" d="M3 9h1v1h-1Z" data-n="javbus-favicon-color-cc0202ff"/><path fill="#db4a4a" d="M4 9h1v1h-1Z" data-n="javbus-favicon-color-db4a4aff"/><path fill="#e67f7f" d="M5 9h1v1h-1Z" data-n="javbus-favicon-color-e67f7fff"/><path fill="#d42828" d="M6 9h1v1h-1Z" data-n="javbus-favicon-color-d42828ff"/><path fill="#ce0c0c" d="M7 9h1v1h-1Z" data-n="javbus-favicon-color-ce0c0cff"/><path fill="#f2bfbf" d="M8 9h1v1h-1Z" data-n="javbus-favicon-color-f2bfbfff"/><path fill="#d52e2e" d="M10 9h1v1h-1Z" data-n="javbus-favicon-color-d52e2eff"/><path fill="#cc0101" d="M3 10h1v1h-1ZM7 13h1v1h-1Z" data-n="javbus-favicon-color-cc0101ff"/><path fill="#ea9898" d="M4 10h1v1h-1Z" data-n="javbus-favicon-color-ea9898ff"/><path fill="#ffffff" d="M5 10h1v1h-1Z" data-n="javbus-favicon-color-ffffffff"/><path fill="#e88b8b" d="M6 10h1v1h-1Z" data-n="javbus-favicon-color-e88b8bff"/><path fill="#db4b4b" d="M7 10h1v1h-1Z" data-n="javbus-favicon-color-db4b4bff"/><path fill="#f9e1e1" d="M8 10h1v1h-1Z" data-n="javbus-favicon-color-f9e1e1ff"/><path fill="#f8dcdc" d="M9 10h1v1h-1Z" data-n="javbus-favicon-color-f8dcdcff"/><path fill="#d21d1d" d="M10 10h1v1h-1Z" data-n="javbus-favicon-color-d21d1dff"/><path fill="#da4848" d="M4 11h1v1h-1Z" data-n="javbus-favicon-color-da4848ff"/><path fill="#fbeaea" d="M5 11h1v1h-1Z" data-n="javbus-favicon-color-fbeaeaff"/><path fill="#fefcfc" d="M6 11h1v1h-1Z" data-n="javbus-favicon-color-fefcfcff"/><path fill="#fdf6f6" d="M7 11h1v1h-1Z" data-n="javbus-favicon-color-fdf6f6ff"/><path fill="#fefafa" d="M8 11h1v1h-1Z" data-n="javbus-favicon-color-fefafaff"/><path fill="#e78888" d="M9 11h1v1h-1Z" data-n="javbus-favicon-color-e78888ff"/><path fill="#cd0505" d="M10 11h1v1h-1Z" data-n="javbus-favicon-color-cd0505ff"/><path fill="#da4545" d="M5 12h1v1h-1Z" data-n="javbus-favicon-color-da4545ff"/><path fill="#e78989" d="M6 12h1v1h-1Z" data-n="javbus-favicon-color-e78989ff"/><path fill="#e99191" d="M7 12h1v1h-1Z" data-n="javbus-favicon-color-e99191ff"/><path fill="#df5e5e" d="M8 12h1v1h-1Z" data-n="javbus-favicon-color-df5e5eff"/><path fill="#cf0f0f" d="M9 12h1v1h-1Z" data-n="javbus-favicon-color-cf0f0fff"/></svg>',
};

export const version = "1.0.0";
export const config_schema = {
    type: "object",
    properties: {
        use_cookies: {
            type: "boolean",
            title: "使用已授权的站点 Cookie",
            default: false,
            description:
                "可导入社区公开的 dv=1; existmag=all; age=verified，确认本站 Cookie 权限后启用。",
        },
    },
};

export const permissions = {
    cookies: [
        {
            id: "site",
            origin,
            path_prefix: "/",
            names: [
                "PHPSESSID",
                "cf_clearance",
                "__cf_bm",
                "age",
                "dv",
                "existmag",
            ],
            purpose: "读取已通过站点验证的演员作品列表",
        },
    ],
};

// View 只渲染 Model 已解析的数据。
function render_item(item) {
    const escape = utils.escape_html;
    return (
        '<p data-n="movie-title">' +
        escape(item.title) +
        "</p>" +
        (item.release_date
            ? '<p data-n="movie-release-date">发行日期：' +
              escape(item.release_date) +
              "</p>"
            : "") +
        (item.image
            ? '<img data-n="movie-cover" src="' +
              escape(item.image) +
              '" alt="' +
              escape(item.title) +
              '">'
            : "")
    );
}

export class JavbusActorRSS extends RSSScript {
    async fetch(ctx) {
        try {
            const id = String(ctx.params?.id || "");
            const page = String(ctx.query?.page ?? "1");
            if (
                !/^[A-Za-z0-9]{1,32}$/.test(id) ||
                !/^[1-9]\d{0,3}$/.test(page)
            ) {
                return Result.Err(
                    "演员 ID 必须是字母或数字，page 必须是 1–9999 的整数",
                    "INVALID_PARAMETER",
                );
            }
            // shortcut: 每次读取指定的一页，需要全量历史同步时再增加受限分页。
            const link =
                origin + "/star/" + id + (page === "1" ? "" : "/" + page);
            const options = {
                headers: { Accept: "text/html", Referer: origin + "/" },
            };
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
            if (
                /just a moment|attention required|age verification|verify (?:your|you are)|年龄验证|年齡驗證|驗證您的|验证您的/i.test(
                    page_title,
                ) ||
                utils.first(root, "#challenge-form")
            ) {
                return Result.Err(
                    "JavBus 返回验证页，请同步有效 Cookie 并启用 use_cookies",
                    "UPSTREAM_AUTH_REQUIRED",
                );
            }
            const list = utils.first(root, "#waterfall");
            const actor = utils.field(root, ".avatar-box .pb10");
            if (!list || !actor) {
                return Result.Err(
                    "JavBus 缺少演员信息或作品列表，请检查演员 ID、站点域名及验证状态",
                    "UPSTREAM_INVALID_RESPONSE",
                );
            }
            const cards = utils.select(list, "a.movie-box");
            if (
                !cards.length &&
                (utils.first(list, "a[href]") ||
                    utils.first(list, ".item") ||
                    (utils.text_of(list) &&
                        !/空的列表|没有影片|沒有影片|沒有相關影片|no videos|no results/i.test(
                            utils.text_of(list),
                        )))
            ) {
                return Result.Err(
                    "JavBus 作品列表结构已变化",
                    "UPSTREAM_INVALID_RESPONSE",
                );
            }
            const items = [];
            for (const card of cards) {
                const resolved = utils.absolute_url(card.attrs.href, link);
                if (resolved.error) return resolved;
                const path = resolved.data.startsWith(origin + "/")
                    ? resolved.data.slice(origin.length)
                    : "";
                const movie_id = path.match(
                    /^\/([A-Za-z0-9_-]+)\/?(?:[?#].*)?$/,
                )?.[1];
                const code = utils.field(card, "date");
                const title =
                    utils.attribute(card, "img", "title") ||
                    utils.attribute(card, "img", "alt") ||
                    utils.field(card, ".photo-info span").split(code)[0].trim();
                if (!movie_id || !code || !title) {
                    return Result.Err(
                        "JavBus 作品缺少有效链接、番号或标题",
                        "UPSTREAM_INVALID_RESPONSE",
                    );
                }
                const image = utils.absolute_url(
                    utils.attribute(card, "img", "data-src") ||
                        utils.attribute(card, "img", "src"),
                    link,
                );
                if (image.error) return image;
                const release_date = utils
                    .select(card, "date")
                    .slice(1)
                    .map((node) => utils.text_of(node))
                    .find((value) => /^\d{4}-\d{2}-\d{2}$/.test(value));
                if (
                    release_date &&
                    (!Number.isFinite(Date.parse(release_date)) ||
                        new Date(release_date).toISOString().slice(0, 10) !==
                            release_date)
                ) {
                    return Result.Err(
                        "JavBus 作品发行日期无效",
                        "UPSTREAM_INVALID_RESPONSE",
                    );
                }
                const item = {
                    id: "javbus:movie:" + movie_id,
                    title: title.startsWith(code) ? title : code + " " + title,
                    link: origin + "/" + movie_id,
                    author: actor,
                    image: image.data || undefined,
                    release_date,
                    published: release_date,
                };
                item.description = item.title;
                item.content = render_item(item);
                items.push(item);
            }
            return Result.Ok({
                id: "javbus:star:" + id,
                title: actor + " - JavBus 作品",
                link,
                description: actor + " 的JavBus作品列表",
                language: "zh-CN",
                author: { name: actor, uri: origin + "/star/" + id },
                items,
            });
        } catch (error) {
            return Result.Err(
                error,
                error?.code ?? "UPSTREAM_INVALID_RESPONSE",
            );
        }
    }
}

const script = new JavbusActorRSS();
export const routes = [
    {
        path: "/javbus/star/:id",
        name: "JavBus 演员作品",
        url: origin.replace("https://", ""),
        example: "/javbus/star/2jv",
        parameters: { id: "演员主页 /star/ 后的本站 ID，各站 ID 不通用" },
        description:
            "读取演员一页作品，?page=2 翻页；保留番号、标题、封面和发行日期。不提供日期时不补造时间。JavBus 列表遵循本站 Cookie 的磁力筛选设置。",
        handler: (ctx) => script.run(ctx),
    },
];
