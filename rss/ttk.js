import { utils } from "@findrss/util";
import { RSSScript, Result } from "@findrss/core";

export const version = "1.1.1";
// Favicon: https://ttks.tw/favicon.ico
// 保留原图像素网格，确保颜色、透明度和轮廓与上游一致。
export const platform = {
  name: "天天看书",
  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges" data-n="ttk-platform-icon"><path fill="#302f2c" d="M0 0h32v4h-32ZM0 4h23v1h-23ZM25 4h7v1h-7ZM0 5h16v1h-16ZM26 5h6v3h-6ZM0 6h6v3h-6ZM9 8h4v1h-4ZM16 8h16v1h-16ZM0 9h7v3h-7ZM25 9h7v3h-7ZM0 12h4v3h-4ZM28 12h4v3h-4ZM0 15h10v1h-10ZM14 15h18v1h-18ZM0 16h9v1h-9ZM25 16h7v12h-7ZM0 17h8v1h-8ZM0 18h7v1h-7ZM0 19h5v1h-5ZM0 20h4v2h-4ZM9 20h1v1h-1ZM8 21h2v1h-2ZM0 22h5v1h-5ZM7 22h3v1h-3ZM0 23h10v5h-10ZM13 27h9v1h-9ZM0 28h32v4h-32Z" data-n="ttk-favicon-color-302f2cff"/><path fill="#31302d" d="M23 4h1v1h-1Z" data-n="ttk-favicon-color-31302dff"/><path fill="#373633" d="M24 4h1v1h-1ZM12 11h1v1h-1Z" data-n="ttk-favicon-color-373633ff"/><path fill="#383734" d="M16 5h1v1h-1Z" data-n="ttk-favicon-color-383734ff"/><path fill="#474644" d="M17 5h1v1h-1Z" data-n="ttk-favicon-color-474644ff"/><path fill="#595856" d="M18 5h1v1h-1Z" data-n="ttk-favicon-color-595856ff"/><path fill="#6e6e6b" d="M19 5h1v1h-1Z" data-n="ttk-favicon-color-6e6e6bff"/><path fill="#878684" d="M20 5h1v1h-1Z" data-n="ttk-favicon-color-878684ff"/><path fill="#a3a2a1" d="M21 5h1v1h-1Z" data-n="ttk-favicon-color-a3a2a1ff"/><path fill="#c4c4c3" d="M22 5h1v1h-1ZM7 6h2v1h-2Z" data-n="ttk-favicon-color-c4c4c3ff"/><path fill="#e9e9e9" d="M23 5h1v1h-1Z" data-n="ttk-favicon-color-e9e9e9ff"/><path fill="#dadad9" d="M24 5h1v1h-1Z" data-n="ttk-favicon-color-dadad9ff"/><path fill="#363532" d="M25 5h1v1h-1ZM23 11h1v1h-1Z" data-n="ttk-favicon-color-363532ff"/><path fill="#9e9e9c" d="M6 6h1v1h-1ZM12 20h1v1h-1Z" data-n="ttk-favicon-color-9e9e9cff"/><path fill="#c8c8c7" d="M9 6h1v1h-1Z" data-n="ttk-favicon-color-c8c8c7ff"/><path fill="#cdcdcc" d="M10 6h1v1h-1Z" data-n="ttk-favicon-color-cdcdccff"/><path fill="#d4d3d3" d="M11 6h1v1h-1Z" data-n="ttk-favicon-color-d4d3d3ff"/><path fill="#dbdbdb" d="M12 6h1v1h-1Z" data-n="ttk-favicon-color-dbdbdbff"/><path fill="#e4e4e4" d="M13 6h1v1h-1Z" data-n="ttk-favicon-color-e4e4e4ff"/><path fill="#eeeeee" d="M14 6h1v1h-1ZM9 7h1v1h-1Z" data-n="ttk-favicon-color-eeeeeeff"/><path fill="#f9f9f9" d="M15 6h1v1h-1Z" data-n="ttk-favicon-color-f9f9f9ff"/><path fill="#fefefe" d="M16 6h7v1h-7ZM7 7h1v1h-1ZM14 7h1v4h-1ZM13 12h1v1h-1ZM5 13h22v1h-22ZM12 14h1v1h-1ZM11 16h1v1h-1ZM10 17h2v1h-2ZM23 17h1v2h-1ZM11 18h1v4h-1ZM7 19h1v1h-1ZM22 19h2v1h-2ZM6 20h1v1h-1ZM23 20h1v2h-1ZM11 22h13v1h-13ZM11 23h1v2h-1ZM23 23h1v2h-1ZM11 25h13v1h-13ZM11 26h1v1h-1ZM23 26h1v1h-1Z" data-n="ttk-favicon-color-fefefeff"/><path fill="#fcfcfc" d="M23 6h1v1h-1ZM8 7h1v1h-1ZM13 10h1v1h-1ZM8 19h1v1h-1Z" data-n="ttk-favicon-color-fcfcfcff"/><path fill="#f8f8f8" d="M24 6h1v1h-1ZM15 7h1v1h-1ZM22 10h1v1h-1ZM12 15h1v1h-1Z" data-n="ttk-favicon-color-f8f8f8ff"/><path fill="#959593" d="M25 6h1v1h-1Z" data-n="ttk-favicon-color-959593ff"/><path fill="#7c7b7a" d="M6 7h1v1h-1Z" data-n="ttk-favicon-color-7c7b7aff"/><path fill="#e1e1e1" d="M10 7h1v1h-1ZM11 27h1v1h-1ZM23 27h1v1h-1Z" data-n="ttk-favicon-color-e1e1e1ff"/><path fill="#d7d6d6" d="M11 7h1v1h-1Z" data-n="ttk-favicon-color-d7d6d6ff"/><path fill="#cececd" d="M12 7h1v1h-1Z" data-n="ttk-favicon-color-cececdff"/><path fill="#d0d0cf" d="M13 7h1v1h-1Z" data-n="ttk-favicon-color-d0d0cfff"/><path fill="#9d9c9b" d="M16 7h1v1h-1Z" data-n="ttk-favicon-color-9d9c9bff"/><path fill="#939291" d="M17 7h1v1h-1Z" data-n="ttk-favicon-color-939291ff"/><path fill="#878785" d="M18 7h1v1h-1ZM24 26h1v1h-1Z" data-n="ttk-favicon-color-878785ff"/><path fill="#797877" d="M19 7h1v1h-1Z" data-n="ttk-favicon-color-797877ff"/><path fill="#696866" d="M20 7h1v1h-1Z" data-n="ttk-favicon-color-696866ff"/><path fill="#565553" d="M21 7h1v1h-1ZM12 21h1v1h-1Z" data-n="ttk-favicon-color-565553ff"/><path fill="#444341" d="M22 7h1v1h-1Z" data-n="ttk-favicon-color-444341ff"/><path fill="#393835" d="M23 7h1v1h-1Z" data-n="ttk-favicon-color-393835ff"/><path fill="#33322f" d="M24 7h1v1h-1ZM9 11h1v1h-1ZM22 11h1v1h-1ZM14 21h1v1h-1ZM16 21h1v1h-1ZM18 21h1v1h-1ZM20 21h1v1h-1Z" data-n="ttk-favicon-color-33322fff"/><path fill="#32312e" d="M25 7h1v1h-1ZM8 8h1v1h-1ZM10 11h2v1h-2ZM16 11h6v1h-6Z" data-n="ttk-favicon-color-32312eff"/><path fill="#343330" d="M6 8h1v1h-1Z" data-n="ttk-favicon-color-343330ff"/><path fill="#41403d" d="M7 8h1v1h-1Z" data-n="ttk-favicon-color-41403dff"/><path fill="#5b5a58" d="M13 8h1v1h-1Z" data-n="ttk-favicon-color-5b5a58ff"/><path fill="#d5d4d4" d="M15 8h1v1h-1Z" data-n="ttk-favicon-color-d5d4d4ff"/><path fill="#666563" d="M7 9h1v1h-1Z" data-n="ttk-favicon-color-666563ff"/><path fill="#a5a4a3" d="M8 9h1v1h-1Z" data-n="ttk-favicon-color-a5a4a3ff"/><path fill="#9e9d9c" d="M9 9h1v1h-1Z" data-n="ttk-favicon-color-9e9d9cff"/><path fill="#9a9a98" d="M10 9h3v1h-3ZM16 9h5v1h-5ZM13 17h9v1h-9Z" data-n="ttk-favicon-color-9a9a98ff"/><path fill="#bcbbbb" d="M13 9h1v1h-1Z" data-n="ttk-favicon-color-bcbbbbff"/><path fill="#dbdbda" d="M15 9h1v1h-1Z" data-n="ttk-favicon-color-dbdbdaff"/><path fill="#9b9a99" d="M21 9h1v1h-1Z" data-n="ttk-favicon-color-9b9a99ff"/><path fill="#9f9e9d" d="M22 9h1v1h-1Z" data-n="ttk-favicon-color-9f9e9dff"/><path fill="#a4a4a3" d="M23 9h1v1h-1Z" data-n="ttk-favicon-color-a4a4a3ff"/><path fill="#838281" d="M24 9h1v1h-1Z" data-n="ttk-favicon-color-838281ff"/><path fill="#8a8988" d="M7 10h1v1h-1Z" data-n="ttk-favicon-color-8a8988ff"/><path fill="#fbfbfb" d="M8 10h1v1h-1ZM23 10h1v1h-1Z" data-n="ttk-favicon-color-fbfbfbff"/><path fill="#f7f7f7" d="M9 10h1v1h-1ZM15 10h1v1h-1Z" data-n="ttk-favicon-color-f7f7f7ff"/><path fill="#f6f6f5" d="M10 10h3v1h-3ZM16 10h6v1h-6Z" data-n="ttk-favicon-color-f6f6f5ff"/><path fill="#babab9" d="M24 10h1v1h-1Z" data-n="ttk-favicon-color-babab9ff"/><path fill="#353431" d="M7 11h1v1h-1ZM6 22h1v1h-1Z" data-n="ttk-favicon-color-353431ff"/><path fill="#363533" d="M8 11h1v1h-1Z" data-n="ttk-favicon-color-363533ff"/><path fill="#efefee" d="M13 11h1v1h-1Z" data-n="ttk-favicon-color-efefeeff"/><path fill="#f4f4f3" d="M14 11h1v1h-1ZM8 18h1v1h-1ZM7 20h1v1h-1Z" data-n="ttk-favicon-color-f4f4f3ff"/><path fill="#3d3c39" d="M15 11h1v1h-1Z" data-n="ttk-favicon-color-3d3c39ff"/><path fill="#383634" d="M24 11h1v1h-1Z" data-n="ttk-favicon-color-383634ff"/><path fill="#403f3c" d="M4 12h1v1h-1ZM5 22h1v1h-1Z" data-n="ttk-favicon-color-403f3cff"/><path fill="#656462" d="M5 12h1v1h-1Z" data-n="ttk-favicon-color-656462ff"/><path fill="#5d5c5a" d="M6 12h1v1h-1Z" data-n="ttk-favicon-color-5d5c5aff"/><path fill="#5a5957" d="M7 12h5v1h-5ZM15 12h9v1h-9Z" data-n="ttk-favicon-color-5a5957ff"/><path fill="#888886" d="M12 12h1v1h-1Z" data-n="ttk-favicon-color-888886ff"/><path fill="#c0bfbf" d="M14 12h1v1h-1Z" data-n="ttk-favicon-color-c0bfbfff"/><path fill="#5e5d5b" d="M24 12h1v1h-1Z" data-n="ttk-favicon-color-5e5d5bff"/><path fill="#666663" d="M25 12h1v1h-1Z" data-n="ttk-favicon-color-666663ff"/><path fill="#737371" d="M26 12h1v1h-1Z" data-n="ttk-favicon-color-737371ff"/><path fill="#494845" d="M27 12h1v1h-1Z" data-n="ttk-favicon-color-494845ff"/><path fill="#676664" d="M4 13h1v1h-1Z" data-n="ttk-favicon-color-676664ff"/><path fill="#71706e" d="M27 13h1v1h-1Z" data-n="ttk-favicon-color-71706eff"/><path fill="#454441" d="M4 14h1v1h-1Z" data-n="ttk-favicon-color-454441ff"/><path fill="#777674" d="M5 14h1v1h-1Z" data-n="ttk-favicon-color-777674ff"/><path fill="#6f6e6c" d="M6 14h1v1h-1Z" data-n="ttk-favicon-color-6f6e6cff"/><path fill="#6b6b68" d="M7 14h1v1h-1Z" data-n="ttk-favicon-color-6b6b68ff"/><path fill="#6a6967" d="M8 14h3v1h-3ZM14 14h9v1h-9Z" data-n="ttk-favicon-color-6a6967ff"/><path fill="#b2b1b0" d="M11 14h1v1h-1Z" data-n="ttk-favicon-color-b2b1b0ff"/><path fill="#d4d4d3" d="M13 14h1v1h-1Z" data-n="ttk-favicon-color-d4d4d3ff"/><path fill="#6b6a68" d="M23 14h1v1h-1Z" data-n="ttk-favicon-color-6b6a68ff"/><path fill="#6e6d6b" d="M24 14h1v1h-1Z" data-n="ttk-favicon-color-6e6d6bff"/><path fill="#737270" d="M25 14h1v1h-1Z" data-n="ttk-favicon-color-737270ff"/><path fill="#797876" d="M26 14h1v1h-1Z" data-n="ttk-favicon-color-797876ff"/><path fill="#484745" d="M27 14h1v1h-1Z" data-n="ttk-favicon-color-484745ff"/><path fill="#555451" d="M10 15h1v1h-1Z" data-n="ttk-favicon-color-555451ff"/><path fill="#f4f4f4" d="M11 15h1v1h-1Z" data-n="ttk-favicon-color-f4f4f4ff"/><path fill="#575654" d="M13 15h1v1h-1Z" data-n="ttk-favicon-color-575654ff"/><path fill="#4b4a48" d="M9 16h1v1h-1Z" data-n="ttk-favicon-color-4b4a48ff"/><path fill="#e7e7e7" d="M10 16h1v1h-1ZM9 17h1v1h-1Z" data-n="ttk-favicon-color-e7e7e7ff"/><path fill="#fdfdfd" d="M12 16h1v1h-1ZM9 18h1v1h-1ZM12 19h10v1h-10Z" data-n="ttk-favicon-color-fdfdfdff"/><path fill="#f8f8f7" d="M13 16h11v1h-11Z" data-n="ttk-favicon-color-f8f8f7ff"/><path fill="#8a8a88" d="M24 16h1v1h-1ZM13 20h9v1h-9Z" data-n="ttk-favicon-color-8a8a88ff"/><path fill="#555452" d="M8 17h1v1h-1Z" data-n="ttk-favicon-color-555452ff"/><path fill="#acabaa" d="M12 17h1v1h-1Z" data-n="ttk-favicon-color-acabaaff"/><path fill="#cbcaca" d="M22 17h1v1h-1Z" data-n="ttk-favicon-color-cbcacaff"/><path fill="#858583" d="M24 17h1v1h-1Z" data-n="ttk-favicon-color-858583ff"/><path fill="#767573" d="M7 18h1v1h-1Z" data-n="ttk-favicon-color-767573ff"/><path fill="#f0f0f0" d="M10 18h1v1h-1Z" data-n="ttk-favicon-color-f0f0f0ff"/><path fill="#5d5c59" d="M12 18h1v1h-1Z" data-n="ttk-favicon-color-5d5c59ff"/><path fill="#3b3a37" d="M13 18h9v1h-9Z" data-n="ttk-favicon-color-3b3a37ff"/><path fill="#999997" d="M22 18h1v1h-1Z" data-n="ttk-favicon-color-999997ff"/><path fill="#80807e" d="M24 18h1v1h-1Z" data-n="ttk-favicon-color-80807eff"/><path fill="#42403e" d="M5 19h1v1h-1Z" data-n="ttk-favicon-color-42403eff"/><path fill="#b3b3b2" d="M6 19h1v1h-1Z" data-n="ttk-favicon-color-b3b3b2ff"/><path fill="#888785" d="M9 19h1v1h-1Z" data-n="ttk-favicon-color-888785ff"/><path fill="#c1c1c0" d="M10 19h1v6h-1Z" data-n="ttk-favicon-color-c1c1c0ff"/><path fill="#7d7d7b" d="M24 19h1v5h-1ZM13 23h9v1h-9Z" data-n="ttk-favicon-color-7d7d7bff"/><path fill="#767674" d="M4 20h1v1h-1Z" data-n="ttk-favicon-color-767674ff"/><path fill="#f2f2f2" d="M5 20h1v1h-1Z" data-n="ttk-favicon-color-f2f2f2ff"/><path fill="#72716f" d="M8 20h1v1h-1Z" data-n="ttk-favicon-color-72716fff"/><path fill="#c2c2c1" d="M22 20h1v1h-1ZM10 25h1v1h-1Z" data-n="ttk-favicon-color-c2c2c1ff"/><path fill="#3b3937" d="M4 21h1v1h-1Z" data-n="ttk-favicon-color-3b3937ff"/><path fill="#d3d2d2" d="M5 21h1v1h-1Z" data-n="ttk-favicon-color-d3d2d2ff"/><path fill="#d6d6d6" d="M6 21h1v1h-1Z" data-n="ttk-favicon-color-d6d6d6ff"/><path fill="#51504d" d="M7 21h1v1h-1Z" data-n="ttk-favicon-color-51504dff"/><path fill="#34322f" d="M13 21h1v1h-1ZM15 21h1v1h-1Z" data-n="ttk-favicon-color-34322fff"/><path fill="#333230" d="M17 21h1v1h-1ZM19 21h1v1h-1ZM21 21h1v1h-1Z" data-n="ttk-favicon-color-333230ff"/><path fill="#969594" d="M22 21h1v1h-1Z" data-n="ttk-favicon-color-969594ff"/><path fill="#949391" d="M12 23h1v1h-1Z" data-n="ttk-favicon-color-949391ff"/><path fill="#bcbbba" d="M22 23h1v1h-1Z" data-n="ttk-favicon-color-bcbbbaff"/><path fill="#61605e" d="M12 24h1v1h-1Z" data-n="ttk-favicon-color-61605eff"/><path fill="#403f3d" d="M13 24h9v1h-9Z" data-n="ttk-favicon-color-403f3dff"/><path fill="#9c9c9a" d="M22 24h1v1h-1Z" data-n="ttk-favicon-color-9c9c9aff"/><path fill="#7e7d7c" d="M24 24h1v1h-1Z" data-n="ttk-favicon-color-7e7d7cff"/><path fill="#82817f" d="M24 25h1v1h-1Z" data-n="ttk-favicon-color-82817fff"/><path fill="#c8c7c7" d="M10 26h1v1h-1Z" data-n="ttk-favicon-color-c8c7c7ff"/><path fill="#a9a8a7" d="M12 26h1v1h-1Z" data-n="ttk-favicon-color-a9a8a7ff"/><path fill="#979795" d="M13 26h9v1h-9Z" data-n="ttk-favicon-color-979795ff"/><path fill="#c9c9c8" d="M22 26h1v1h-1Z" data-n="ttk-favicon-color-c9c9c8ff"/><path fill="#bab9b8" d="M10 27h1v1h-1Z" data-n="ttk-favicon-color-bab9b8ff"/><path fill="#4f4e4b" d="M12 27h1v1h-1Z" data-n="ttk-favicon-color-4f4e4bff"/><path fill="#868584" d="M22 27h1v1h-1Z" data-n="ttk-favicon-color-868584ff"/><path fill="#81817f" d="M24 27h1v1h-1Z" data-n="ttk-favicon-color-81817fff"/></svg>',
};

export class TtkChaptersRSS extends RSSScript {
  async fetch(ctx) {
    try {
      const result_1 = TtkChaptersRSS.book_id(ctx, /^[A-Za-z0-9_-]{1,128}$/);
      if (result_1.error) return result_1;
      const link = "https://ttks.tw/novel/chapters/" + result_1.data + "/index.html";
      const result_2 = await TtkChaptersRSS.fetch_document(
        ctx,
        link,
        "https://ttks.tw/",
      );
      if (result_2.error) return result_2;
      const root = result_2.data;
      const frames = TtkChaptersRSS.nodes(root, function (node) {
        return TtkChaptersRSS.has_class(node, "chapters_frame");
      });
      const directory =
        frames.find(function (frame) {
          const siblings = frame.parent.children;
          const index = siblings.indexOf(frame);
          const heading = siblings
            .slice(0, index)
            .reverse()
            .find(function (node) {
              return TtkChaptersRSS.has_class(node, "chapters_title");
            });
          return /全部章[节節]/.test(TtkChaptersRSS.text(heading));
        }) ||
        frames[1] ||
        frames[0] ||
        TtkChaptersRSS.nodes(root, function (node) {
          return (
            ["chapters_frame", "chapter_list"].includes(node.attrs.id) ||
            ["chapter-list", "chapters", "catalog", "book-chapters"].some(
              function (name) {
                return TtkChaptersRSS.has_class(node, name);
              },
            )
          );
        })[0];
      if (!directory) {
        return Result.Err(
          "天天看书页面缺少完整章节目录",
          "UPSTREAM_INVALID_RESPONSE",
        );
      }
      const title =
        TtkChaptersRSS.text(
          TtkChaptersRSS.nodes(root, function (node) {
            return node.tag === "h1";
          })[0],
        ) ||
        TtkChaptersRSS.text(TtkChaptersRSS.first_class(root, "novel-title")) ||
        TtkChaptersRSS.text(TtkChaptersRSS.first_class(root, "book-title")) ||
        TtkChaptersRSS.meta(root, "og:title");
      const name = (
        TtkChaptersRSS.meta(root, "og:novel:author") ||
        TtkChaptersRSS.text(TtkChaptersRSS.first_class(root, "author")) ||
        TtkChaptersRSS.text(TtkChaptersRSS.first_class(root, "novel-author"))
      ).replace(/^作者\s*[:：]\s*/, "");
      const result_3 = TtkChaptersRSS.chapter_items(
        TtkChaptersRSS.nodes(directory, function (node) {
          return node.tag === "a";
        }),
        "ttk",
        link,
        {
          name: name || title,
          uri: link,
        },
      );
      if (result_3.error) return result_3;
      const result_4 = TtkChaptersRSS.feed(
        ctx,
        "ttk",
        link,
        title,
        name,
        TtkChaptersRSS.meta(root, "og:image"),
        result_3.data,
      );
      if (result_4.error) return result_4;
      return Result.Ok(result_4.data);
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }
  static nodes(root, matches) {
    const result = [];
    for (const child of root.children) {
      if (matches(child)) {
        result.push(child);
      }
      result.push(...TtkChaptersRSS.nodes(child, matches));
    }
    return result;
  }
  static has_class(node, name) {
    return String(node.attrs.class || "")
      .split(/\s+/)
      .includes(name);
  }
  static raw_text(node) {
    return node
      ? node.text + node.children.map(TtkChaptersRSS.raw_text).join("")
      : "";
  }
  static text(node) {
    return TtkChaptersRSS.raw_text(node).replace(/\s+/g, " ").trim();
  }
  static first_class(root, name) {
    return TtkChaptersRSS.nodes(root, function (node) {
      return TtkChaptersRSS.has_class(node, name);
    })[0];
  }
  static meta(root, name) {
    return (
      TtkChaptersRSS.nodes(root, function (node) {
        return (
          node.tag === "meta" &&
          (node.attrs.property === name || node.attrs.name === name)
        );
      })[0]?.attrs.content || ""
    );
  }
  static async fetch_document(ctx, url, referer) {
    try {
      const result_5 = await TtkChaptersRSS.request_text(ctx, url, {
        headers: {
          Referer: referer,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "zh-CN,zh;q=0.9",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36",
        },
      });
      if (result_5.error) return result_5;
      const result_6 = utils.document_nodes(result_5.data);
      if (result_6.error) return result_6;
      return Result.Ok(result_6.data);
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }
  static chapter_items(links, platform, base, author) {
    try {
      const seen = new Set();
      const items = [];
      for (const node of links) {
        const result_7 = utils.absolute_url(node.attrs.href, base);
        if (result_7.error) return result_7;
        const link = result_7.data;
        const title = TtkChaptersRSS.text(node);
        if (!link || !title || seen.has(link)) {
          continue;
        }
        seen.add(link);
        items.push({
          id: platform + ":chapter:" + link,
          title,
          link,
          description: "",
          author,
          index: /^\d+$/.test(node.attrs["data-num"] || "")
            ? Number(node.attrs["data-num"])
            : items.length + 1,
        });
      }
      items.sort(function (a, b) {
        return b.index - a.index;
      });
      for (const item of items) {
        delete item.index;
      }
      return Result.Ok(items);
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }
  static feed(
    ctx,
    platform,
    link,
    title,
    author_name,
    image,
    items,
    description = "",
  ) {
    try {
      if (!title) {
        return Result.Err(
          platform + " 页面缺少小说标题，可能为验证页面",
          "UPSTREAM_INVALID_RESPONSE",
        );
      }
      const result_8 = utils.absolute_url(image, link);
      if (result_8.error) return result_8;
      return Result.Ok({
        id: platform + ":book:" + ctx.params.book_id,
        title: title + " · 章节更新",
        link,
        description,
        language: platform === "ttk" ? "zh-tw" : "zh-cn",
        author: {
          name: author_name || title,
          uri: link,
        },
        image: result_8.data || (ctx.public_origin || "") + "/findrss-logo.png",
        updated: null,
        items,
        extra: {
          view: "article",
          show_thumbnails: true,
          proxy_images: true,
          tags: ["小说", platform],
        },
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }
  static book_id(ctx, pattern = /^\d{1,24}$/) {
    try {
      const id = String(ctx.params?.book_id || "");
      if (!pattern.test(id)) {
        return Result.Err("book_id 无效", "INVALID_PARAMETER");
      }
      return Result.Ok(id);
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }
  static async request_text(ctx, url, options = {}) {
    return utils.request_text(ctx, url, options);
  }
}
const script = new TtkChaptersRSS();
export const route = {
  name: "天天看书小说章节",
  path: "/ttk/book/:book_id",
  url: "ttks.tw",
  maintainers: ["findrss"],
  example: "/ttk/book/congzhanyaochumokaishichangshengbusi",
  parameters: {
    book_id: "目录页 /novel/chapters/<ID>/index.html 中的 <ID>",
  },
  description:
    "读取小说全部章节区，排除最新章节重复区，按目录倒序输出；不抓取正文。",
  handler: (ctx) => script.run(ctx),
};
