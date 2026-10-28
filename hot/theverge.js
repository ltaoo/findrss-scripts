/** HOT */
import { utils } from "@findrss/util";

export const version = "1.0.0";
export const category = "科技";
export const order = 780;
// Favicon: https://www.google.com/s2/favicons?domain=www.theverge.com&sz=32
export const platform = { name: "The Verge", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"theverge-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC9ElEQVR4nM2X+4tNURTHP3e7nhNCCqEJhSLySIrJK68M5mr84C/wmx/86O8hhpm8p2SURqb8gORRk8d4pBE1BoPM42rdWae77Vn7nDtzTXzr1NnrrLX2WmuvvdY68I+RK1CsA/JAsUIZny8H9ACPgKGW0rKMwjDrBGAtMNOQHZCNTwHbREHGZhZE/hbQAPyI8CwFzgKLAn0OuC0KTgNbgamMDZMsonov2AcsM1h+AmfEilbgIeODGRodC3JsrWLAR6D5b+7qeb8J2BBhawE+iAGCK8DrCOOgnu93ffqAb/okdCtXJMkKQI3x7R1wWV4kBwTP9SiOG8xvgJPAJ10XNWGL+vQCvwy5JcCeiFM3gE7fAFHYBBzTc/MxD+gH2mURXrWU8O8Fag2WPt1LIovzFN4D7hoCcjuOesZWgukafsta2acjccYFlp1LLAuwE1iRteuRsveSeBsNFmG4AHxJCC6xxDubZ4bgAqA+CLGp3Us+iUIIybXr/p4uYHgPXIzoPwzMIRu1ev4WrgJdPsElL14USvfTEF6jFdOMgkfbrTcgRI9Vb5zB+BhoM+iTgUZgInHUaPgtvXeA++FNcgZjvyaj1Vy2AytTDFiv1S/EgF69ETqdv/Asa0+sDTAfOBgeg7zrqkHbbognwM1gj5EGBOd1PlJiDwFzQ2IOFmvnsyCJ3W19cCHBs1Ay9pUhsxqoSzz3IrEr0na7k5tlVVFHHC+BaxUm47RSHRqefkK06RGYcBZRLS1q4nyOJOMqby0j1+bI0NGkiW0iTzokES/p/fdLdE7L7QPKyTcrIp/axPIZBkivP6Eh9pHTb4KFwP6IfLMmdBT52AfP4l59/oCXfDuA5YaKLh10Ulu4ozpMSUk+GXBeZClwVRog/WGLQf+qdWRoXAwolMMvRWm2wdKhg0fmBOUYO6QsHzDog3r1ZMDJhKvC+1hj6tTBJtN7wWjmvPBvqN4rNr5DUnbfVqooN9qdNQJShtdp/w8b1lMZaCrx/r/Ab4pztOzVMnC7AAAAAElFTkSuQmCC\" data-n=\"theverge-favicon\"/></svg>" };
export const tags = ["资讯","英语"];

export class ThevergeHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const fetched = await utils.request_text(ctx, "https://www.theverge.com/rss/index.xml");
      if (fetched.error) return fetched;
      const list = utils.feed_items(fetched.data, "https://www.theverge.com/");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("The Verge 未返回内容列表", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        entries.push({ id: "theverge:" + row.id, title: utils.plain_text(row.title), link: row.link,
          rank: null, pinned: false, heat: { value: null, unit: "热度", text: "" } });
      }
      return Result.Ok({ category, title: "The Verge · 最新资讯", link: "https://www.theverge.com/", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new ThevergeHotRank();
export const route = {
  name: "The Verge · 最新资讯", path: "/theverge/headlines", url: "www.theverge.com",
  maintainers: ["findrss"], example: "/theverge/headlines", parameters: {},
  description: "官方 RSS/Atom 内容列表，保留上游选择和顺序。新闻及精选列表不冒充热度排名，未知排名与热度均为 null。",
  handler: ctx => script.run(ctx),
};
