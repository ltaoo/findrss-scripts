import { utils } from "@findrss/util";
import { RSSScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const tags = ["剧集", "视频"];
export const platform = {"name":"腾讯视频","icon":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"qqvideo-hot-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAC+lBMVEX////7/f/m9f/l9f/2/P/i9P9kwv8lqf9Gtv+Gz//N6//4/P/5/v9hwP8AmP8Amf8Uov9Suv+t3v/w+f//+vX/37v/0p3S1KwertICnfQAmv8Hnf9BtP+n3P/z+v//+vT/umr/jAn/hgCvrwQ94RYy1EEhv4MOqsoCnPcGnf9Kt/+85P/8/v//2Kz/iwb/hwD/iACNwgBA6QBE6AA+4RIv0E0YtaUFoOsQoP9vxv/f8v///v7/tmL4jABzzwBA6ABD5wBC5gU11zYcupUGoekvrf+u3///9+7/oDPvkABj1wBB6ABB5wBD5gIZtqIDnvMNn/92yf/s9///7tr/lBrnlABZ3ABC6ABD5wFq7DVr7DZJ6AlA5wBC5wBC5QYv0EwQrcEAmv7W7///5cf/jg3emQBS3wBM6A3R+cH0/vHH+LOC71ZO6A8+4RQiwX8FoOzD5///3bb/iwfYnABO4gBV6Rnj+9n7/vnP+b6A71NK6Akw0UcMqNLF6P//2Kv/iQPTngBL4wBZ6h7o/OD5/vbA96pp7DM22DALp9Q9sv/r9///1aX/iAHQoABK4wBb6iHq/OPr/OR/71EnxmwGnP+14v//iQHq/OLn/N567kslxXG44//z/u+19ptj6ys11zcKptlEtf/u+P//3rf1/vFz7UBG5wRC5gIuz1EKptgqqv/L6///5cj/jg7fmABT3wBM6Azu/ei49p9z7UFI6Ac83xofvYoEnvE4sP/L6v//7tv/lRtl6y9F5wNB5AkszVcOqssBm/9Uu//d8v//+PD/oTbwkAAy1EAWs60CnfcSof+Czf//t2X4iwB0zgBB5QgYtqIEn+85sf/+////27H/jAiOwQA83xkszFkVsrEEnvAWo/96yv//+/f/vnT/jw7/iAKxrwc73h0dvJABm/sKnv9Vu////Pj/5Mb/16nU2LgerNsAm/gLnv9NuP+z4f/3/P/6/v9ow/8apP9ev//1+//o9v9xxv8urP9Ruv+U1P/7/v/9/v/6/f/ikpJ0AAAB9klEQVQ4y2NgoCNgZGJmwSfPysbOzsHJxY1LnoeXj5+fj19AUEgYi6yIqJi4hCQ/v5QUP5+0jKwcury8gqKSsoqqmroGUIkUv6aWtg6qAl09fQNDI2NjE1Mzc7ASC0srZHlrGyUDWzt7BwcHY0cnZxeQRfyubkiGuHvo63t6eTv4+ACV+Dr5+YOUBAQGwRUEh+jrh4aFR0RGRcfEOhjHxSckAu2R0kqCKUhOMdBPTfNJz8jMys4BKcnNywcZ4loAVVBYZKBfXOJTWsbAUF5RWQW0yKG6BqSCvRaioK7eQL+h0aepGcRpaW0Duba9A6iCr7MLrKC7x0C/t8+nfwJE/cRJIMdOBjljylSIgmkQBdMhCmbMBCmYBVIgPRsSTshWzJk7LxYoP38ByIqFi8AKFiMcuaR16TIfB+PlK1aCHLlqNcTMNWsN9Net99lQsXHT5i0g47du2w6S37ET6s1duyEBtWfe3hig9L79B0DxcfDQYVhAHTmqZHAMFtSOx0+cBGk/dRopXZxRMjh7DhxZ549fuAiSlro0+zJSdF65qm9wzcjY4fqNm7fA0X37DhNKerh77/6Dh4/iH3c8AUs/fVZ7mQEVPH/x8tXrN5Ak9/bd+w/YEu3HT6BEK/X5y+yvOJL1t+8/fvz8lfQbd8b4ExT0l2FAAAD+665yJFN1AAAAAABJRU5ErkJggg==\" data-n=\"qqvideo-hot-favicon\"/></svg>"};

// Protocol reference: wx_channels_download/pkg/scraper/vqq (metadata only).
export class VqqSeriesRSS extends RSSScript {
  context_params(value) {
    if (typeof value !== "string" || !value || value.length > 65536) throw new Error("腾讯分集分页参数无效");
    return Object.fromEntries(value.split("&").map(pair => {
      const index = pair.indexOf("=");
      if (index < 1) throw new Error("腾讯分集分页参数无效");
      return [pair.slice(0, index), decodeURIComponent(pair.slice(index + 1).replace(/\+/g, " "))];
    }));
  }

  async fetch(ctx) {
    try {
      const cover_id = ctx.params.cover_id;
      if (typeof cover_id !== "string" || !/^[a-zA-Z0-9]{5,32}$/.test(cover_id)) return Result.Err("cover_id 必须为腾讯视频剧集 ID", "INVALID_PARAMETER");
      const link = "https://v.qq.com/x/cover/" + cover_id + ".html";
      const pending = [""], queued = new Set([""]), items = new Map(), orders = new Map();
      let intro;
      for (let index = 0; index < pending.length; index++) {
        if (index >= 100) throw new Error("腾讯分集分页超过限制");
        const params = pending[index] ? this.context_params(pending[index]) : {};
        if (params.cid && params.cid !== cover_id) throw new Error("腾讯分页剧集编号不匹配");
        const fetched = await utils.request_json(ctx, "https://pbaccess.video.qq.com/trpc.vector_layout.page_view.PageService/getPage?video_appid=3000010&vversion_name=8.5.96&vversion_platform=2", {
          method: "POST", headers: { Referer: link, "Content-Type": "application/json" },
          body: JSON.stringify({ page_params: { req_from: "web_vsite", new_mark_label_enabled: "1", is_pc_new_detail_page: "0", is_from_web_flyflow: "1", ...params, cid: cover_id, ...(pending[index] ? { page_id: "web_episode_list", page_type: "detail_operation" } : { vid: "" }) }, page_bypass_params: { params: { caller_id: "3000010", platform_id: "2" }, scene: "desk_detail", app_version: "" }, page_context: {} }),
        });
        if (fetched.error) return fetched;
        const payload = fetched.data;
        if (payload?.need_force_login) return Result.Err("腾讯视频要求登录", "UPSTREAM_AUTH_REQUIRED");
        if (payload?.ret !== 0 || !Array.isArray(payload.data?.CardList)) throw new Error("腾讯未返回有效分集资料");
        const groups = payload.data.CardList;
        for (const group of groups.filter(group => group.type === "pc_introduction")) {
          const metadata = { ...group.params };
          for (const child of Object.values(group.children_list || {})) for (const row of child.cards || []) {
            if (row.params?.["report.cid"] && row.params["report.cid"] !== cover_id) throw new Error("腾讯剧集资料与请求不匹配");
            Object.assign(metadata, row.params);
          }
          intro ||= metadata;
        }
        const episode_groups = groups.filter(group => group.type === "pc_web_episode_list");
        if (!episode_groups.length) throw new Error("腾讯缺少正片选集组件");
        let added = 0;
        for (const group of episode_groups) {
          const tabs = group.params?.tabs ? JSON.parse(group.params.tabs) : [];
          if (!Array.isArray(tabs)) throw new Error("腾讯选集标签无效");
          for (const tab of tabs) if (tab.selected && tab.page_context) queued.add(tab.page_context);
          const contexts = tabs.filter(tab => !tab.selected).map(tab => tab.page_context);
          for (const direction of ["next", "front"]) if (String(group.params?.["has_" + direction]) === "true") contexts.push(group.params[direction + "_page_context"]);
          for (const context of contexts) {
            this.context_params(context);
            if (!queued.has(context)) { queued.add(context); pending.push(context); }
          }
          for (const child of Object.values(group.children_list || {})) {
            if (!Array.isArray(child.cards)) throw new Error("腾讯选集列表无效");
            for (const row of child.cards) {
              const params = row?.params;
              if (params?.is_trailer !== "0" || !/^\d+$/.test(params.title) || !(Number(params.duration) > 0)) continue;
              const id = params.vid, order = Number(params.title);
              if (!/^[a-zA-Z0-9]{5,32}$/.test(id || "") || !Number.isInteger(order) || order < 1 || order > 10000 || params.cid && params.cid !== cover_id) throw new Error("腾讯正片编号、集序或所属剧集无效");
              if (orders.has(order) && orders.get(order) !== id || items.has(id) && items.get(id).order !== order) throw new Error("腾讯正片集序冲突");
              if (items.has(id)) continue;
              const image = utils.absolute_url(params.image_url);
              if (image.error) return image;
              const published = utils.timestamp(params.publish_date);
              if (published.error) return published;
              orders.set(order, id); added++;
              items.set(id, { id: "vqq:episode:" + cover_id + ":" + id, order, title: utils.plain_text(params.play_title || params.full_title || params.c_title_output || params.title), link: "https://v.qq.com/x/cover/" + cover_id + "/" + id + ".html", description: utils.plain_text(params.video_subtitle), image: image.data, ...(published.data ? { published: published.data } : {}) });
            }
          }
        }
        if (index > 0 && added === 0) throw new Error("腾讯分集分页未推进，目录可能不完整");
      }
      const rows = [...items.values()].sort((a, b) => a.order - b.order);
      if (!utils.plain_text(intro?.title || intro?.mod_title) || !rows.length || rows.some((row, index) => row.order !== index + 1)) throw new Error("腾讯缺少剧集名称或正片目录不完整");
      const image = utils.absolute_url(intro.new_pic_vt || intro.cover_image_url);
      if (image.error) return image;
      ctx.log("腾讯视频分集解析完成", { cover_id, count: rows.length });
      return Result.Ok({ id: "vqq:series:" + cover_id, title: utils.plain_text(intro.title || intro.mod_title) + " · 剧集更新", link, description: utils.plain_text(intro.cover_description || intro.introduction || intro.description), image: image.data, language: "zh-cn", items: rows.reverse().map(({ order, ...item }) => item) });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new VqqSeriesRSS();
export const route = {
  name: "腾讯视频剧集", path: "/vqq/series/:cover_id", url: "v.qq.com", maintainers: ["findrss"],
  example: "/vqq/series/mzc002001w361jz",
  example_name: "尚公主", parameters: { cover_id: "官网 /x/cover/<ID>.html 或 /detail/<首字母>/<ID>.html 中的剧集 ID" },
  description: "逐页读取正片选集，排除预告和片花，保留稳定 ID、封面与官网播放链接，按集序倒序排列；播放权限由官网处理。",
  handler: ctx => script.run(ctx),
};
