import { utils } from "@findrss/util";
import { RSSScript, Result } from "@findrss/core";

export const version = "1.1.1";
export const tags = ["剧集", "视频"];
// Favicon: https://www.youku.com/favicon.ico
export const platform = {"name":"优酷","icon":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"youku-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,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\" data-n=\"youku-favicon\"/></svg>"};

function md5(value) {
  const bytes = Array.from(unescape(encodeURIComponent(value)), char => char.charCodeAt(0));
  const length = bytes.length;
  bytes.push(128);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 0; i < 8; i++) bytes.push(Math.floor(length * 8 / 2 ** (8 * i)) & 255);
  const state = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
  const shifts = [[7, 12, 17, 22], [5, 9, 14, 20], [4, 11, 16, 23], [6, 10, 15, 21]];
  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words = Array.from({ length: 16 }, (_, i) => bytes[offset + i * 4] | bytes[offset + i * 4 + 1] << 8 | bytes[offset + i * 4 + 2] << 16 | bytes[offset + i * 4 + 3] << 24);
    let [a, b, c, d] = state;
    for (let i = 0; i < 64; i++) {
      const group = i >> 4;
      const f = group === 0 ? (b & c) | (~b & d) : group === 1 ? (d & b) | (~d & c) : group === 2 ? b ^ c ^ d : c ^ (b | ~d);
      const index = group === 0 ? i : group === 1 ? (5 * i + 1) % 16 : group === 2 ? (3 * i + 5) % 16 : 7 * i % 16;
      const sum = (a + f + Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) + words[index]) | 0;
      const shift = shifts[group][i % 4];
      [a, b, c, d] = [d, (b + ((sum << shift) | (sum >>> (32 - shift)))) | 0, b, c];
    }
    for (const [i, word] of [a, b, c, d].entries()) state[i] = (state[i] + word) | 0;
  }
  return state.flatMap(word => [0, 8, 16, 24].map(shift => ((word >>> shift) & 255).toString(16).padStart(2, "0"))).join("");
}

const user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function read_components(root) {
  const stack = [[root, 0]], components = [];
  while (stack.length) {
    const [node, depth] = stack.pop();
    if (!node || typeof node !== "object" || depth > 8) throw new Error("优酷分集结构无效");
    if (node.type === 10001) {
      if (!Array.isArray(node.nodes)) throw new Error("优酷分集结构无效");
      stack.push(...node.nodes.map(child => [child, depth + 1]));
    } else components.push({ ...node.data, type: node.type, more: node.more, itemList: node.nodes?.map(child => ({ ...child.data, type: child.type })) });
  }
  return components;
}

// Catalogue fields follow wx_channels_download/pkg/scraper/youku/series.go.
export class YoukuSeriesRSS extends RSSScript {
  async request(ctx, link, params, cookies) {
    const api = "mtop.youku.columbus.gateway.new.execute", app_key = "24679788";
    const data = JSON.stringify({ ms_codes: "2019030100", params: JSON.stringify(params), system_info: JSON.stringify({
      appPackageKey: "pcweb", appPackageId: "pcweb", appkey: app_key, device: "pc", os: "pc", ver: "1.0.0.0", pid: "", zx: 0, zx_list: "", userAgent: user_agent, disableUserRec: "0",
    }) });
    for (let attempt = 0; attempt < 3; attempt++) {
      const t = String(Date.now()), token = (cookies.get("_m_h5_tk") || "").split("_")[0];
      const query = { jsv: "2.7.5", appKey: app_key, t, sign: md5(token + "&" + t + "&" + app_key + "&" + data), api, v: "1.0", type: "originaljson", dataType: "json", data };
      const fetched = await utils.request_text(ctx, "https://acs.youku.com/h5/" + api + "/1.0/?" + Object.entries(query).map(([key, value]) => key + "=" + encodeURIComponent(value)).join("&"), {
        include_headers: true, headers: { Referer: link, "User-Agent": user_agent, Cookie: [...cookies].map(([name, value]) => name + "=" + value).join("; ") },
      });
      if (fetched.error) return fetched;
      if (!Array.isArray(fetched.data?.headers) || typeof fetched.data.text !== "string") throw new Error("优酷分页需要支持 fetchText include_headers 的运行时");
      for (const [name, value] of fetched.data.headers) {
        const match = name === "set-cookie" && /^(_m_h5_tk(?:_enc)?)=([^;]*)/.exec(value);
        if (match) cookies.set(match[1], match[2]);
      }
      const response = JSON.parse(fetched.data.text);
      if (!Array.isArray(response?.ret) || !response.ret.length || response.ret.some(status => typeof status !== "string")) throw new Error("优酷 MTOP 响应无效");
      if (response.ret.some(status => /^FAIL_SYS_TOKEN_(?:EMPTY|EXPIRED|EXOIRED)::/.test(status))) continue;
      if (response.ret.some(status => !status.startsWith("SUCCESS::"))) throw new Error("优酷分集请求未成功，请检查官网访问状态");
      const response_data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
      const envelope = response_data?.["2019030100"];
      if (envelope?.success !== true) throw new Error("优酷分集响应无效");
      return Result.Ok(envelope.data);
    }
    throw new Error("优酷 MTOP 令牌刷新失败");
  }

  async fetch(ctx) {
    try {
      const show_id = ctx.params.show_id;
      if (typeof show_id !== "string" || !/^[a-zA-Z0-9_-]{5,100}$/.test(show_id)) return Result.Err("show_id 必须为优酷剧集 ID", "INVALID_PARAMETER");
      const link = "https://v.youku.com/v_nextstage/id_" + show_id + ".html";
      const cookies = new Map();
      const params = { biz: "kuflix_pc_detail", scene: "web_page", componentVersion: "3", ip: "", debug: 0, utdid: "pcweb", platform: "pc", gray: 0, appPackageKey: "pcweb", showId: show_id, nextSession: "" };
      const fetched = await this.request(ctx, link, params, cookies);
      if (fetched.error) return fetched;
      const extra = fetched.data?.data?.extra;
      if (extra?.showId !== show_id || !utils.plain_text(extra.showName)) throw new Error("优酷剧集资料与请求不匹配");
      const components = read_components(fetched.data);
      const selectors = components.filter(component => component.type === 10013);
      if (selectors.length !== 1 || !Array.isArray(selectors[0].itemList)) throw new Error("优酷缺少可确认的正片选集组件");
      const selector = selectors[0];
      let rows = selector.itemList;
      if (selector.more) {
        const session_text = typeof selector.session === "string" ? selector.session : JSON.stringify(selector.session);
        if (!session_text || session_text.length > 65536) throw new Error("优酷分集分页参数无效");
        const session = JSON.parse(session_text), tabs = selector.stageTabs;
        if (!session || typeof session !== "object" || Array.isArray(session) || !Array.isArray(tabs) || tabs.length < 2 || tabs.length > 100) throw new Error("优酷分页缺少有效选集范围");
        const ranges = new Set(), video_ids = new Set(rows.map(row => row?.action?.value));
        let loaded = 0;
        for (const tab of tabs) {
          const start = Number(tab?.itemStartStage), end = Number(tab?.itemEndStage);
          const range = start + "-" + end;
          if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end > 5000 || ranges.has(range)) throw new Error("优酷选集范围无效或重复");
          ranges.add(range);
          if (tab.selected === true) continue;
          // 官网按选集范围翻页；仅传返回的 session 会重复首屏。
          const fetched = await this.request(ctx, link, {
            ...params, scene: "component",
            nextSession: JSON.stringify({ ...session, itemStartStage: tab.itemStartStage, itemEndStage: tab.itemEndStage }),
          }, cookies);
          if (fetched.error) return fetched;
          const root = fetched.data;
          if (root?.data?.extra?.showId && root.data.extra.showId !== show_id) throw new Error("优酷分页剧集身份不匹配");
          const selectors = read_components(root).filter(component => component.type === 10013);
          if (selectors.length !== 1 || !Array.isArray(selectors[0].itemList)) throw new Error("优酷分页缺少选集组件");
          const page_rows = selectors[0].itemList;
          if (!page_rows.some(row => row?.episodeInfo?.isZp === true && row.videoType === "正片" && !video_ids.has(row.action?.value))) throw new Error("优酷分集分页未推进");
          rows = rows.concat(page_rows);
          for (const row of page_rows) video_ids.add(row?.action?.value);
          if (rows.length > 10000) throw new Error("优酷分集数量超过限制");
          loaded++;
        }
        if (!loaded) throw new Error("优酷分集分页未推进");
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
  example: "/youku/series/bcaa87c7834c46f99e7b",
  example_name: "嫁金钗", parameters: { show_id: "官网 /v_nextstage/id_<剧集 ID>.html 中的 ID，不是 X 开头的视频 ID" },
  description: "通过 HTTP 直接读取 MTOP 正片目录及分页，自动获取匿名令牌，无需浏览器或登录 Cookie。按集序倒序输出官网播放链接，不补造发布时间。",
  handler: ctx => script.run(ctx),
};
