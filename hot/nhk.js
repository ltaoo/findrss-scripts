/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const category = "新闻";
export const order = 800;
// Favicon: https://www.google.com/s2/favicons?domain=www.nhk.or.jp&sz=32
export const platform = { name: "NHK", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"nhk-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADx0lEQVR4nO2WfWxTVRjGf729bN5pBzY0HShsY3aDjAHdR5wuGQ5NRkgMRHFxkejMwKgxC7iZ/TEjwQQNOkXNnF+JXyEwCahEmR+Y4YYGNRLmBxpUtowB0lYn3XR3a3tbc07brV1lNvrHTOyTNLf3nPe8H8/7vKc1afbdIWYQykwGTyWQYiDFwH+CAfViG7orQJpNxecJgNUMQ0GwKjBkgKaAHrm/NBOkmcBrhN9nm8EbhNkK+EKgB8PrVjPaLFNyDOgug4+6VuLzjMmn44o0XttVLB3s7iij9hYbLQ8toq29kMaGbJxLNA53V8m9yjILO1oXs7oyk7oN8+T5fW+W48zX0P2hv2dAHw5y8602rq9ayKdHq7kq73I23pHDTWsdrFhuw+PRqa9bLPcHz4xQVtlJx6sVVK08xI7WIjbU5lJbU8DYeLhym02j9ysPxz/7A81uToIBPcidtzs4+F4f15bP5/0P+1ldnc2evSdZlDOH/W/3yeAf95yR5q7+UQwjiD03g6ysDHzjfp585jh3byqS+4ODI7zwcn+4fUlpQFM43H2Orm4P7xwcoPcbL2uqf2dryw/8fH6U5146S17uMZq2fE3rzmXALG6rP8qzTxRzqs9Lx75BshdqbG46wm8XAjjyMnl023Ief+oEn387mqAD09RfQ30sFBGUMBRb4QNpNjM+jzHxFHQKrcin6K0Qp7AVlYqvQojyfCCmVlNCG9SpwddVW7Hb0uOMunp+ZeC8XypeBI/aRp3JquyTrnQjxLqauTzY7GTcF7b3+YL0fHJOMhmbhBoXyWuwsS6fZUW2iaX0dJXhpiP8+LqbxuYcVCVM2OmzOnsO/BIZtUR1D5zWeevAKQJ+gwvDAZ5vq2Lv/p8irEzXAleUshjI2Q6PpqapLLjSgts9SmlJJ43NDnKzL40zFxPQtOX7yFuIexoW8Nj2CiyWXWj2S6Zpgf8if468QTS7yg2rumVPt20vpOKaLLlVkD+H4hW2CaqjdMN3sufO8stof/o6OVUCRhDMyl8koPtDXL00gwc2F+KLcSYwNKRz370nIjegSolzLn39w/L4XfW9CbRGUbdpPq+8uIqHH/mC+xucfHlsDaUlh6SQo0koJAFBqbj1Rtw1uNzrKSudx9ob83i3s0IGF+zEfkTlbe1LZfD1tR+wteUkFssbFORbad25ZELIAnEamBynqYjObmKl4YDxiNIsxlRMjpaphH0LseqT0yMQd3rqOP1TiOAiiViqhW/DbMKcGW+r/uto0ySRzJrCDENJJUAqgRmG8r9P4E9CRHCJxnjZ3gAAAABJRU5ErkJggg==\" data-n=\"nhk-favicon\"/></svg>" };
export const tags = ["新闻","日语"];

export class NhkHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const fetched = await utils.request_text(ctx, "https://www.nhk.or.jp/rss/news/cat0.xml");
      if (fetched.error) return fetched;
      const list = utils.feed_items(fetched.data, "https://news.web.nhk/newsweb/");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("NHK 未返回内容列表", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        entries.push({ id: "nhk:" + row.id, title: utils.plain_text(row.title), link: row.link,
          rank: null, pinned: false, heat: { value: null, unit: "热度", text: "" } });
      }
      return Result.Ok({ category, title: "NHK · 主要新闻", link: "https://news.web.nhk/newsweb/", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new NhkHotRank();
export const route = {
  name: "NHK · 主要新闻", path: "/nhk/rss/news/cat0.xml", url: "news.web.nhk",
  maintainers: ["findrss"], example: "/nhk/rss/news/cat0.xml", parameters: {},
  description: "官方 RSS/Atom 内容列表，保留上游选择和顺序。新闻及精选列表不冒充热度排名，未知排名与热度均为 null。",
  handler: ctx => script.run(ctx),
};
