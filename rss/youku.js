import { utils } from "@findrss/util";
import { RSSScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const tags = ["剧集", "视频"];
// Favicon: https://www.youku.com/favicon.ico
export const platform = {"name":"优酷","icon":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"youku-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,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\" data-n=\"youku-favicon\"/></svg>"};

// Catalogue fields follow wx_channels_download/pkg/scraper/youku/series.go.
export class YoukuSeriesRSS extends RSSScript {
  async fetch(ctx) {
    try {
      const show_id = ctx.params.show_id;
      if (typeof show_id !== "string" || !/^[a-zA-Z0-9_-]{5,100}$/.test(show_id)) return Result.Err("show_id 必须为优酷剧集 ID", "INVALID_PARAMETER");
      const link = "https://v.youku.com/v_nextstage/id_" + show_id + ".html";
      const fetched = await utils.request_text(ctx, link, { headers: { Referer: "https://www.youku.com/" } });
      if (fetched.error) return fetched;
      const parsed = utils.embedded_json(fetched.data, /(?:window\.)?__INITIAL_DATA__\s*=/);
      if (parsed.error) return Result.Err("优酷页面缺少剧集数据，可能需要完成官网验证", "UPSTREAM_INVALID_RESPONSE");
      const initial = parsed.data, extra = initial.pageMap?.extra;
      if (extra?.showId !== show_id || !utils.plain_text(extra.showName) || !Array.isArray(initial.moduleList)) throw new Error("优酷剧集资料与请求不匹配");
      const components = initial.moduleList.flatMap(module => module.components || []);
      const selectors = components.filter(component => component.type === 10013);
      if (selectors.length !== 1 || !Array.isArray(selectors[0].itemList)) throw new Error("优酷缺少可确认的正片选集组件");
      const selector = selectors[0];
      let rows = selector.itemList;
      if (selector.more) {
        // The browser SDK owns MTOP signing and refreshes its own anonymous cookies.
        const rendered = await ctx.puppeteer.navigate(link, { args: [show_id], wait_ms: 1000 }, async function (show_id) {
          const mtop = window.lib?.mtop;
          if (!mtop?.request) throw new Error("优酷官网未加载 MTOP SDK，无法读取后续分集");
          const pages = [], sessions = new Set();
          let next_session = "";
          for (let page = 0; page < 100; page++) {
            const response = await mtop.request({ api: "mtop.youku.columbus.gateway.new.execute", v: "1.0", appKey: "24679788", type: "originaljson", dataType: "json", data: {
              ms_codes: "2019030100", params: JSON.stringify({ biz: "kuflix_pc_detail", scene: page ? "component" : "web_page", componentVersion: "3", ip: "", debug: 0, platform: "pc", nextSession: next_session, gray: 0, appPackageKey: "pcweb", showId: show_id }),
              system_info: JSON.stringify({ appPackageKey: "pcweb", appPackageId: "pcweb", appkey: "24679788", device: "pc", os: "pc", ver: "1.0.0.0", pid: "", zx: 0, zx_list: "", userAgent: navigator.userAgent, disableUserRec: "0" }),
            } });
            if (!Array.isArray(response.ret) || !response.ret.length || response.ret.some(status => !status.startsWith("SUCCESS::"))) throw new Error("优酷分集请求未成功，请检查官网访问状态");
            const payload = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
            const envelope = payload?.["2019030100"];
            if (!envelope?.success) throw new Error("优酷分集响应无效");
            const root = envelope.data;
            if (root.data?.extra?.showId && root.data.extra.showId !== show_id) throw new Error("优酷分页剧集身份不匹配");
            const stack = [root], selectors = [];
            while (stack.length) {
              const node = stack.pop();
              if (node.type === 10013) selectors.push(node);
              else if (node.type === 10001) stack.push(...(node.nodes || []));
            }
            if (selectors.length !== 1 || !Array.isArray(selectors[0].nodes)) throw new Error("优酷分页缺少选集组件");
            const selector = selectors[0];
            pages.push(...selector.nodes.map(node => node.data));
            if (pages.length > 10000) throw new Error("优酷分集数量超过限制");
            if (!selector.more) return pages;
            const session = selector.data?.session;
            next_session = typeof session === "string" ? session : JSON.stringify(session);
            if (!next_session || next_session.length > 65536 || sessions.has(next_session)) throw new Error("优酷分集分页未推进");
            sessions.add(next_session);
          }
          throw new Error("优酷分集分页超过限制");
        });
        if (rendered.error) return rendered;
        if (!Array.isArray(rendered.data)) throw new Error("优酷浏览器未返回分集数组");
        rows = rendered.data;
      }
      const items = new Map(), orders = new Map();
      for (const row of rows) {
        if (row?.episodeInfo?.isZp !== true || row.videoType !== "正片") continue;
        const id = row.action?.value, order = Number(row.stage);
        if (!/^X[a-zA-Z0-9=_-]{4,100}$/.test(id || "") || row.action.type !== "JUMP_TO_VIDEO" || row.action.extra?.showId && row.action.extra.showId !== show_id || !Number.isInteger(order) || order < 1 || order > 5000) throw new Error("优酷正片编号、集序或所属剧集无效");
        if (orders.has(order) && orders.get(order) !== id || items.has(id) && items.get(id).order !== order) throw new Error("优酷正片集序冲突");
        if (items.has(id)) continue;
        const image = utils.absolute_url(row.img);
        if (image.error) return image;
        orders.set(order, id);
        items.set(id, { id: "youku:episode:" + show_id + ":" + id, order, title: utils.plain_text(row.title) || extra.showName + " 第" + order + "集", link: "https://v.youku.com/v_show/id_" + id + ".html", description: utils.plain_text(row.subtitle), image: image.data });
      }
      const episodes = [...items.values()].sort((a, b) => a.order - b.order);
      if (!episodes.length || episodes.some((episode, index) => episode.order !== index + 1) || Number(extra.episodeLast) > episodes.length || extra.completed === true && Number(extra.episodeTotal) > episodes.length) throw new Error("优酷正片目录缺集或未加载完整");
      const intro = components.find(component => component.type === 20009)?.itemList?.find(item => item.type === 20010);
      const image = utils.absolute_url(intro?.showImgV || extra.showImgV);
      if (image.error) return image;
      ctx.log("优酷分集解析完成", { show_id, count: episodes.length });
      return Result.Ok({ id: "youku:series:" + show_id, title: utils.plain_text(extra.showName) + " · 剧集更新", link, description: utils.plain_text(intro?.desc || extra.showSubtitle), image: image.data, language: "zh-cn", items: episodes.reverse().map(({ order, ...item }) => item) });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new YoukuSeriesRSS();
export const route = {
  name: "优酷剧集", path: "/youku/series/:show_id", url: "v.youku.com", maintainers: ["findrss"],
  example: "/youku/series/bcaa87c7834c46f99e7b", parameters: { show_id: "官网 /v_nextstage/id_<剧集 ID>.html 中的 ID，不是 X 开头的视频 ID" },
  description: "读取详情页正片目录；存在后续分页时需要 BROWSER 绑定，通过官网 MTOP SDK 读取后续目录。按集序倒序输出官网播放链接，不补造发布时间。",
  handler: ctx => script.run(ctx),
};
