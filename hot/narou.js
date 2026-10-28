/** HOT */
import { utils } from "@findrss/util";

export const version = "1.0.0";
export const category = "小说";
export const order = 680;
// Favicon: https://www.google.com/s2/favicons?domain=syosetu.com&sz=32
export const platform = { name: "小説家になろう", icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" data-n=\"narou-platform-icon\"><image width=\"32\" height=\"32\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADUklEQVR4nLVXz0tUURg9942SlRNoJVqLJs2GhKikhS2CFkkGBbVr7aJVULRw1R+QrVpEYFC0bFEaFBhZqyBdqEmGZRZOQU4NjEZjNiIzN86b995c39z3q7EDb968uXfu+d53z/fjCgACIVGQ8sJaUZ7cZIjDABKu4dRqUU7VGuJFTIgHiADhdxWk3Cul7JdSZmV4ZPOF4l3+N2h9+A1axNWiP7IBhdJbT8iNw4SPN6Ajj+LusMh6GIENIx+Y/yHbnr+RPa8/mHc+BxlhqGo0gIcAGvGPuDG3gM8LixhJL5l3DRotDpWzBCnldQCdqBKx+Bbnfnx7XDel0+IqG1CQkjHdVw3x+9wfpHJ55zkRr8OB+Gav6X0WJ0wD1oryGqrE7O+8Q0y013uSQ+U0+LHJEL1R3pSXG5n82rrnZH3JEN1cldNgekUEvMrm0DE4itOjs3j8falinNtQyK2gw3L/QCpjztWB3DVWbg9twFC6RPrs4zecb2lwfm+qq8Wl9hbn2RbgzYN7UDM4hn0jU/jUzRJSBrkNq7CEAt3JEDMNOXUEFxNNztjAfAa35tJ4anlFFeDtzlYzLN2eILehqWqeuPruq+nenv27ca65/PbuLbCNsEFD23Y1ml67Mv1FHUqsS0RBb88FuNDwsWTF+NxyWWxnNMYxKpgb6CVVmEZYA86Oldz3pCsZmANsAeqiQg3Z0AbQbdxD7rtXculuaXBygC4D0ihuH691kAFllwUF91/KofRiYCG6/DblOW/m14pZoDhHwQTYufBPnKBbNPZoNJCc4OI0VLeOF8htsIdLbq0z9+VOKuMIhN9Z3aa7D3kq3q0BuxCFBbnt1qtoL8TMxTCianVq14FJhsqfXc6byUnND34QQhg1/LJalPeGMz97mc8plhM7t5m5nV6goHyqWjkCmkuhOJMrq90P5HQMYZei0wF/o2ioBb+95RxqhToIqwGlM0JgB2wr3MsQW+FhySk+m1eoBxMp5bhfV8TqZ5ddFh+K1wZFHCRWC4tCiB2O+6EYwC7FAMbD9IVqOvXTiBtFoDUmREprQFQjosJNTlSkYk4oAkcBTG4g96SO3MZ/PZqpgot8NoQVolwk6oEl7OG0QgNesNrorjDHcwBjXu524y+onBuw0bb7JAAAAABJRU5ErkJggg==\" data-n=\"narou-favicon\"/></svg>" };
export const tags = ["小说", "排行榜", "日语"];

// Source: https://dev.syosetu.com/man/api/
const periods = {
  daily: { order: "dailypoint", field: "daily_point", output: "dp", name: "日间积分" },
  weekly: { order: "weeklypoint", field: "weekly_point", output: "wp", name: "周间积分" },
  monthly: { order: "monthlypoint", field: "monthly_point", output: "mp", name: "月间积分" },
  quarter: { order: "quarterpoint", field: "quarter_point", output: "qp", name: "季度积分" },
  yearly: { order: "yearlypoint", field: "yearly_point", output: "yp", name: "年度积分" },
  total: { order: "hyoka", field: "global_point", output: "gp", name: "总积分" },
};

export class NarouHotRank extends HotRankScript {
  async fetch(ctx) {
    try {
      const period = ctx.params.period || "daily";
      if (!Object.hasOwn(periods, period)) return Result.Err("period 支持 daily（默认）、weekly、monthly、quarter、yearly、total", "INVALID_PARAMETER");
      const selected = periods[period];
      const fetched = await utils.request_json(ctx, "https://api.syosetu.com/novelapi/api/?out=json&lim=30&of=t-n-" + selected.output + "&order=" + selected.order);
      if (fetched.error) return fetched;
      const list = utils.array_at(fetched.data);
      if (list.error) return list;
      if (!Number.isInteger(list.data[0]?.allcount) || list.data[0].allcount < 1 || list.data.length < 2) {
        return Result.Err("なろう API 缺少作品列表或返回空榜单", "UPSTREAM_INVALID_RESPONSE");
      }
      const entries = [], seen = new Set();
      for (const row of list.data.slice(1)) {
        const id = row?.ncode;
        if (typeof id !== "string" || !/^N\d{4,}[A-Z]+$/i.test(id)) return Result.Err("なろう作品 N 代码无效", "UPSTREAM_INVALID_RESPONSE");
        const ncode = id.toLowerCase();
        if (seen.has(ncode)) continue;
        seen.add(ncode);
        const score = row[selected.field];
        entries.push({ id: "narou:novel:" + ncode, title: utils.plain_text(row.title), link: "https://ncode.syosetu.com/" + ncode + "/",
          rank: null, pinned: false, heat: { value: score ?? null, unit: selected.name, text: String(score ?? "") } });
      }
      return Result.Ok({ category, title: "小説家になろう · " + selected.name + "榜", link: "https://yomou.syosetu.com/", entries });
    } catch (error) { return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE"); }
  }
}

const script = new NarouHotRank();
export const route = {
  name: "小説家になろう · 小说积分榜", path: "/narou/top/:period?", url: "syosetu.com",
  maintainers: ["findrss"], example: "/narou/top/daily", parameters: { period: "daily（默认）、weekly、monthly、quarter、yearly、total" },
  description: "官方小说 API 按对应周期积分降序返回前 30 部作品，非历史排名 API；保留积分与顺序，接口没有排名字段，rank 为 null。",
  handler: ctx => script.run(ctx),
};
