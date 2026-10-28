/** HOT */
import { utils } from "@findrss/util";

export const version = "1.0.0";
export const category = "科技";
export const order = 770;
// Favicon: https://www.google.com/s2/favicons?domain=arstechnica.com&sz=32
export const platform = { name: "Ars Technica", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"arstechnica-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADz0lEQVR4nMVXW0hUQRj+ztmza7piFKVJknRBWYo0FLtovZQJIgTdFqwoKgsK0l6KkKjoIbBetoeCJIlQYhXsJXxIekkriEKkQJIgAsFuFNa6q+7qiX/mzDpzdnXXW32ge87M/N/3nX/+mTNHq6irwv+EMdtA/+e+xQDSrduAN9cztKAG/FyQ0lUJoBhAtq1/EMAbAB0AniRrSEs0BZZwLYAawMxJzq42AKARgC+RET2BeCmA14B5LXlxAo2lGLy2OGZuwP+57xBgdgNmXvLCMUbyiINzzcCAn4s3z144xkjzVCb0OOKl8yuumCid1oCfF1wTFg5NlkZ8A2DVPpc5TwTGXRvXgJ87q1HGh0PA8Ff+R9f2PtEmX8eLU2Nr5CwYUkeVvNT0JSug5xfDsXY99/7rOyKvOjDx7RPgTIXDUwZtWTYiz+5DzymAsbUy2k99xuZd0bjx/l6Mf3wrspADaLT5tNgNVMri7puPobnTYQ4HeNvSTIS3ViB42cuezFl+EM6iHQj+GIT7+gNoKWkI9PfCyC9GWu0NLjUcYByEwJnyqHlLK8ZAsbiY+PUFo+2Nk87DISw6dxsp5fthbKliTy1MkXik5yVG2+9hvK8bafUPFUE9czXLDgMXV7QMaf6VvX2sjT8F3FmMxPz9U60BMe55B0ZuHQNcGcDYb9ZG2aDpIwMTA70Ya+tlPBKySZO2aZEB8VbjCIfgKKhESnUdDE8hI5wKI3cvKuSUCUfeRrgv+GDW3lCyI2VAaA7F7oThEIztB5De0ArHqnUI+i5haO9aDDcoqyc+nKlM6M/RQjaexI1N2xgXccasJEzWAK80C67dXpijQUYk0jpTRLraeK24s5Dx6B3jpDYJTFOnf9Yrk97nCmjuicDYeQKpJ+sTq4ZDSDl2Fa49Z3msK4OtKIaRoDxyULymDamRDhNsFxx76oezcBvS73RGlxIVm2tHdKVOCcfKNXDuOwXzyPloLP1SHdi0YDdAJ5lqmkdKVeDHINtMohtJXzciPV2Y+PCGPVm4s5XdK3CmIthwGo51RXDkFUBbsjxmA5O01BORny/F99HdkAqG5p+Wl0XO2gSJKCi1stU+Ea+MYaelDWIKdNFsNdAxapKYlhf9CgKZSG63Q/SJeBWN8jFNt3X6AK0fCwbG7ZNbdPnGcnZ84QzguP2QqttHeHM9LwDt8Pxra4c5dxJnQm+up2V+TTBx9vZLyoBkomxuNUGxWtlU4oRpvwuslJUA2hVr+SQrPMBjUBIv7crIiiQ/ThN9mllb+fx/mmF6Q//u49QOS3BWojL+AsQ0p20NvrIKAAAAAElFTkSuQmCC\" data-n=\"arstechnica-favicon\"/></svg>" };
export const tags = ["资讯","英语"];

export class ArstechnicaHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const fetched = await utils.request_text(ctx, "https://feeds.arstechnica.com/arstechnica/index");
      if (fetched.error) return fetched;
      const list = utils.feed_items(fetched.data, "https://arstechnica.com/");
      if (list.error) return list;
      if (!list.data.length) return Result.Err("Ars Technica 未返回内容列表", "UPSTREAM_INVALID_RESPONSE");
      const entries = [], seen = new Set();
      for (const row of list.data) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        entries.push({ id: "arstechnica:" + row.id, title: utils.plain_text(row.title), link: row.link,
          rank: null, pinned: false, heat: { value: null, unit: "热度", text: "" } });
      }
      return Result.Ok({ category, title: "Ars Technica · 最新资讯", link: "https://arstechnica.com/", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new ArstechnicaHotRank();
export const route = {
  name: "Ars Technica · 最新资讯", path: "/arstechnica/headlines", url: "arstechnica.com",
  maintainers: ["findrss"], example: "/arstechnica/headlines", parameters: {},
  description: "官方 RSS/Atom 内容列表，保留上游选择和顺序。新闻及精选列表不冒充热度排名，未知排名与热度均为 null。",
  handler: ctx => script.run(ctx),
};
