/** HOT */
export const version = "1.0.1";
export const category = "娱乐";
export const order = 390;
// Favicon: https://vfiles.gtimg.cn/wuji_dashboard/xy/starter/4ea79867.png
export const platform = {
  name: "腾讯视频",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"qqvideo-hot-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAC+lBMVEX////7/f/m9f/l9f/2/P/i9P9kwv8lqf9Gtv+Gz//N6//4/P/5/v9hwP8AmP8Amf8Uov9Suv+t3v/w+f//+vX/37v/0p3S1KwertICnfQAmv8Hnf9BtP+n3P/z+v//+vT/umr/jAn/hgCvrwQ94RYy1EEhv4MOqsoCnPcGnf9Kt/+85P/8/v//2Kz/iwb/hwD/iACNwgBA6QBE6AA+4RIv0E0YtaUFoOsQoP9vxv/f8v///v7/tmL4jABzzwBA6ABD5wBC5gU11zYcupUGoekvrf+u3///9+7/oDPvkABj1wBB6ABB5wBD5gIZtqIDnvMNn/92yf/s9///7tr/lBrnlABZ3ABC6ABD5wFq7DVr7DZJ6AlA5wBC5wBC5QYv0EwQrcEAmv7W7///5cf/jg3emQBS3wBM6A3R+cH0/vHH+LOC71ZO6A8+4RQiwX8FoOzD5///3bb/iwfYnABO4gBV6Rnj+9n7/vnP+b6A71NK6Akw0UcMqNLF6P//2Kv/iQPTngBL4wBZ6h7o/OD5/vbA96pp7DM22DALp9Q9sv/r9///1aX/iAHQoABK4wBb6iHq/OPr/OR/71EnxmwGnP+14v//iQHq/OLn/N567kslxXG44//z/u+19ptj6ys11zcKptlEtf/u+P//3rf1/vFz7UBG5wRC5gIuz1EKptgqqv/L6///5cj/jg7fmABT3wBM6Azu/ei49p9z7UFI6Ac83xofvYoEnvE4sP/L6v//7tv/lRtl6y9F5wNB5AkszVcOqssBm/9Uu//d8v//+PD/oTbwkAAy1EAWs60CnfcSof+Czf//t2X4iwB0zgBB5QgYtqIEn+85sf/+////27H/jAiOwQA83xkszFkVsrEEnvAWo/96yv//+/f/vnT/jw7/iAKxrwc73h0dvJABm/sKnv9Vu////Pj/5Mb/16nU2LgerNsAm/gLnv9NuP+z4f/3/P/6/v9ow/8apP9ev//1+//o9v9xxv8urP9Ruv+U1P/7/v/9/v/6/f/ikpJ0AAAB9klEQVQ4y2NgoCNgZGJmwSfPysbOzsHJxY1LnoeXj5+fj19AUEgYi6yIqJi4hCQ/v5QUP5+0jKwcury8gqKSsoqqmroGUIkUv6aWtg6qAl09fQNDI2NjE1Mzc7ASC0srZHlrGyUDWzt7BwcHY0cnZxeQRfyubkiGuHvo63t6eTv4+ACV+Dr5+YOUBAQGwRUEh+jrh4aFR0RGRcfEOhjHxSckAu2R0kqCKUhOMdBPTfNJz8jMys4BKcnNywcZ4loAVVBYZKBfXOJTWsbAUF5RWQW0yKG6BqSCvRaioK7eQL+h0aepGcRpaW0Duba9A6iCr7MLrKC7x0C/t8+nfwJE/cRJIMdOBjljylSIgmkQBdMhCmbMBCmYBVIgPRsSTshWzJk7LxYoP38ByIqFi8AKFiMcuaR16TIfB+PlK1aCHLlqNcTMNWsN9Net99lQsXHT5i0g47du2w6S37ET6s1duyEBtWfe3hig9L79B0DxcfDQYVhAHTmqZHAMFtSOx0+cBGk/dRopXZxRMjh7DhxZ549fuAiSlro0+zJSdF65qm9wzcjY4fqNm7fA0X37DhNKerh77/6Dh4/iH3c8AUs/fVZ7mQEVPH/x8tXrN5Ak9/bd+w/YEu3HT6BEK/X5y+yvOJL1t+8/fvz8lfQbd8b4ExT0l2FAAAD+665yJFN1AAAAAABJRU5ErkJggg==\" data-n=\"qqvideo-hot-favicon\"/></svg>",
};
import { utils } from '@findrss/util';
/*
Adapted from https://github.com/newsnext/newsnow/tree/0f95b2c998dffbfd2ddbc51b47b5809887dc6b97/server/sources
MIT License

Copyright (c) 2024 ourongxing

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
const source = {
  "id": "qqvideo-tv-hotsearch",
  "name": "腾讯视频 · 热搜榜",
  "home": "https://v.qq.com/channel/tv"
};
export class QqvideoHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const request_options = {
        method: "POST",
        headers: {
          Referer: "https://v.qq.com/",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          page_params: {
            rank_channel_id: "100113",
            rank_name: "HotSearch",
            rank_page_size: "30",
            tab_mvl_sub_mod_id: "792ac_19e77Sub_1b2",
            tab_name: "热搜榜",
            tab_type: "hot_rank",
            tab_vl_data_src: "f5200deb4596bbf3",
            page_id: "scms_shake",
            page_type: "scms_shake",
            source_key: "",
            tag_id: "",
            tag_type: "",
            new_mark_label_enabled: "1",
          },
          page_context: {
            page_index: "1",
          },
          flip_info: {
            page_strategy_id: "",
            page_module_id: "792ac_19e77",
            module_strategy_id: {},
            sub_module_id: "20251106065177",
            flip_params: {
              folding_screen_show_num: "",
              is_mvl: "1",
              mvl_strategy_info: "{\"default_strategy_id\":\"06755800b45b49238582a6fa1ad0f5c5\",\"default_version\":\"3836\",\"hit_page_uuid\":\"b5080d97dc694a5fb50eb9e7c99326ac\",\"hit_tab_info\":null,\"gray_status_info\":null,\"bypass_to_un_exp_id\":\"\"}",
              mvl_sub_mod_id: "20251106065177",
              pad_post_show_num: "",
              pad_pro_post_show_num: "",
              pad_pro_small_hor_pic_display_num: "",
              pad_small_hor_pic_display_num: "",
              page_id: "scms_shake",
              page_num: "0",
              page_type: "scms_shake",
              post_show_num: "",
              shake_size: "",
              small_hor_pic_display_num: "",
              source_key: "100113",
              un_policy_id: "06755800b45b49238582a6fa1ad0f5c5",
              un_strategy_id: "06755800b45b49238582a6fa1ad0f5c5",
            },
            relace_children_key: [],
          },
        }),
      };
      request_options.headers = {
        Referer: source.home,
        ...request_options.headers
      };
      const fetched = await utils.request_json(ctx, "https://pbaccess.video.qq.com/trpc.vector_layout.page_view.PageService/getCard?video_appid=3000010&vversion_platform=2", request_options);
      if (fetched.error) return fetched;
      const data = fetched.data;
      if (!data || typeof data !== 'object') return Result.Err('上游未返回数据对象', 'UPSTREAM_INVALID_RESPONSE');
      if (data.need_force_login) return Result.Err('上游要求登录，请更新并授权 Cookie', 'UPSTREAM_AUTH_REQUIRED');
      if (data.error || data.errors?.length || (typeof data.code === 'number' && data.code < 0) || (data.error_code !== undefined && data.error_code !== 0) || (data.ret !== undefined && data.ret !== 0)) return Result.Err('上游拒绝请求，请检查账户权限或验证页面', 'UPSTREAM_INVALID_RESPONSE');
      const list = utils.array_at(data, "data.card.children_list.list.cards");
      if (list.error) return list;
      const rows = list.data;
      const entries = [],
        seen = new Set();
      for (const row of rows) {
        const id = utils.identity(row.id);
        if (id.error) return id;
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const link = utils.absolute_url('https://v.qq.com/x/cover/' + encodeURIComponent(id.data) + '.html', source.home);
        if (link.error) return link;
        const pinned = false;
        const raw_rank = row.params?.rank;
        const rank = pinned ? null : raw_rank === undefined || raw_rank === null || raw_rank === '' ? null : Number(raw_rank);
        const heat_text = String(row.params?.hot_value ?? '').trim();
        const heat_number = heat_text === '' ? NaN : Number(heat_text.replace(/,/g, ''));
        entries.push({
          id: source.id + ':' + id.data,
          title: utils.plain_text(row.params?.title),
          link: link.data,
          rank,
          pinned,
          heat: {
            value: Number.isFinite(heat_number) && heat_number >= 0 ? heat_number : null,
            unit: "热度",
            text: heat_text
          }
        });
      }
      ctx.log('榜单解析完成', {
        source: source.id,
        count: entries.length,
        missing_rank: entries.filter(entry => entry.rank === null && !entry.pinned).length
      });
      return Result.Ok({
        title: source.name,
        category,
        link: source.home,
        entries
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? 'UPSTREAM_INVALID_RESPONSE');
    }
  }
}
const script = new QqvideoHotRank();
export const route = {
  "name": "腾讯视频 · 热搜榜",
  "path": "/qqvideo/hot",
  "url": "v.qq.com",
  "maintainers": ["findrss"],
  "example": "/qqvideo/hot",
  "parameters": {},
  "description": "列表快照 JSON，保留上游顺序、已提供的排名与热度；未知排名和热度为 null。",
  handler: ctx => script.run(ctx),
};
