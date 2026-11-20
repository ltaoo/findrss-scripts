import { utils } from "@findrss/util";
import { RSSScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const tags = ["剧集", "视频"];
export const platform = {"name":"爱奇艺","icon":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"iqiyi-hot-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,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\" data-n=\"iqiyi-hot-favicon\"/></svg>"};

// Protocol reference: wx_channels_download/pkg/scraper/iqiyi (metadata only).
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

function page_url(id, type = "v") {
  return "https://www.iqiyi.com/" + type + "_" + (BigInt(id) ^ 0x75706971676cn).toString(36) + ".html";
}

export class IqiyiSeriesRSS extends RSSScript {
  async request(ctx, path, values) {
    const signature = Object.keys(values).sort().map(key => key + "=" + values[key]).join("&") + "&secret_key=howcuteitis";
    values.sign = md5(signature).toUpperCase();
    return utils.request_json(ctx, "https://mesh.if.iqiyi.com/" + path + "?" + Object.entries(values).map(([key, value]) => key + "=" + encodeURIComponent(value)).join("&"), {
      headers: { Referer: "https://www.iqiyi.com/" },
    });
  }

  rows(value, album_id, depth = 0) {
    if (depth > 8 || !value || typeof value !== "object") throw new Error("爱奇艺分集列表结构无效");
    if (Array.isArray(value)) return value.flatMap(row => row?.qipu_id != null ? [row] : this.rows(row, album_id, depth + 1));
    if (value.videos !== undefined) {
      if (value.entity_id && String(value.entity_id) !== album_id || typeof value.videos === "string") return [];
      return this.rows(value.videos, album_id, depth + 1);
    }
    if (value.feature_paged) return Object.values(value.feature_paged).flatMap(page => this.rows(page, album_id, depth + 1));
    return value.data ? this.rows(value.data, album_id, depth + 1) : [];
  }

  async fetch(ctx) {
    try {
      const album_id = ctx.params.album_id;
      if (typeof album_id !== "string" || !/^[1-9]\d{0,19}$/.test(album_id)) return Result.Err("album_id 必须为爱奇艺数字专辑 ID", "INVALID_PARAMETER");
      const device_id = "findrss" + md5(album_id).slice(0, 25);
      let entity_id = album_id, base, rows;
      for (let attempt = 0; attempt < 2; attempt++) {
        const fetched = await this.request(ctx, "tvg/v2/lw/base_info", {
          entity_id, device_id, auth_cookie: "", pcv: "13.062.22175", app_version: "13.062.22175",
          ext: "", app_mode: "standard", scale: "125", timestamp: String(Date.now()), src: "pca_tvg", os: "", conduit_id: "",
        });
        if (fetched.error) return fetched;
        const payload = fetched.data;
        base = payload?.data?.base_data;
        if (payload?.status_code != null && String(payload.status_code) !== "0" || String(base?.qipu_id) !== album_id || !utils.plain_text(base?.title)) throw new Error("爱奇艺未返回匹配的剧集资料，可能已下架或需要登录");
        const blocks = payload.data.template?.tabs?.[0]?.blocks;
        const selector = blocks?.find((block, index) => block.bk_id === "selector_bk" || block.bk_type === "album_episodes" || index === 2 && !block.bk_id && !block.bk_type);
        rows = selector?.data ? this.rows(selector.data, album_id) : [];
        if (rows.length || attempt === 1) break;
        const resolved = await this.request(ctx, "tvg/entity_play_url", { entityId: album_id, appVersion: "13.062.22175", deviceId: device_id, timestamp: String(Math.floor(Date.now() / 1000)) });
        if (resolved.error) return resolved;
        const target = resolved.data?.data;
        if (!["episode", "album_episode"].includes(target?.resolve_type) || !/^[1-9]\d{0,19}$/.test(String(target?.episode_id))) throw new Error("爱奇艺专辑没有提供正片入口");
        entity_id = String(target.episode_id);
      }
      const items = [], seen = new Map(), orders = new Map();
      for (const row of rows) {
        if (row.content_type != null && String(row.content_type) !== "1") continue;
        const identity = utils.identity(row.qipu_id);
        if (identity.error) return identity;
        const id = identity.data, order = Number(row.album_order);
        if (!/^[1-9]\d{0,19}$/.test(id) || !Number.isInteger(order) || order < 1 || order > 5000) throw new Error("爱奇艺正片编号或集序无效");
        if (seen.has(id) && seen.get(id) !== order || orders.has(order) && orders.get(order) !== id) throw new Error("爱奇艺正片集序冲突");
        if (seen.has(id)) continue;
        seen.set(id, order); orders.set(order, id);
        if (row.page_url && row.page_url.replace(/^https?:\/\/(?:www|m)\.iqiyi\.com/, "https://www.iqiyi.com").split(/[?#]/)[0] !== page_url(id)) throw new Error("爱奇艺分集链接与编号不匹配");
        items.push({ id: "iqiyi:episode:" + album_id + ":" + id, title: utils.plain_text(row.title) || base.title + " 第" + order + "集", link: page_url(id), description: utils.plain_text(row.subtitle), order });
      }
      items.sort((a, b) => a.order - b.order);
      if (!items.length || items.some((item, index) => item.order !== index + 1) || base.update_info?.album_finish === true && Number(base.total_episode) > items.length) throw new Error("爱奇艺正片目录缺集或未加载完整");
      const image = utils.absolute_url(base.image_url);
      if (image.error) return image;
      ctx.log("爱奇艺分集解析完成", { album_id, count: items.length });
      return Result.Ok({ id: "iqiyi:series:" + album_id, title: utils.plain_text(base.title) + " · 剧集更新", link: page_url(album_id, "a"), description: utils.plain_text(base.desc), language: "zh-cn", image: image.data, items: items.reverse().map(({ order, ...item }) => item) });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new IqiyiSeriesRSS();
export const route = {
  name: "爱奇艺剧集", path: "/iqiyi/series/:album_id", url: "www.iqiyi.com", maintainers: ["findrss"],
  example: "/iqiyi/series/3993682943621001",
  example_name: "小城良方", parameters: { album_id: "爱奇艺数字专辑 ID（albumId / qipu_id），不是 a_ 后的短码" },
  description: "读取正片分集目录，按集序倒序输出官网播放链接；缺失时间不补造，付费集仍由官网验证播放权限。",
  handler: ctx => script.run(ctx),
};
