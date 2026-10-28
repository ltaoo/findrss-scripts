import { utils } from "@findrss/util";
export const kind = "detect";
export const version = "1.0.0";
export const platform = { name: "GitHub", icon: "" };

class GitHubReleasesDetect extends DetectScript {
  async fetch(ctx) {
    const { owner, repo } = ctx.params;
    if (!/^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(owner || "") || !/^[A-Za-z0-9_.-]{1,100}$/.test(repo || "") || repo === "." || repo === "..")
      return Result.Err("无效的 GitHub 仓库地址", "INVALID_PARAMETER");
    const link = "https://github.com/" + owner + "/" + repo + "/releases";
    const fetched = await utils.request_text(ctx, link + ".atom", { headers: { Accept: "application/atom+xml" } });
    if (fetched.error) return fetched;
    const parsed = utils.document_nodes(fetched.data, true);
    if (parsed.error) return parsed;
    const feed = utils.first(parsed.data, "feed");
    if (!feed) return Result.Err("GitHub 未返回发布订阅", "UPSTREAM_INVALID_RESPONSE");
    const items = [];
    for (const entry of utils.select(feed, "entry")) {
      const address = utils.absolute_url(utils.attribute(entry, 'link[rel="alternate"]', "href") || utils.attribute(entry, "link[href]", "href"), link);
      if (address.error) return address;
      const id = utils.field(entry, "id") || address.data;
      const title = utils.field(entry, "title");
      if (!id || !title) return Result.Err("发布条目缺少 ID 或标题", "UPSTREAM_INVALID_RESPONSE");
      const body = utils.first(entry, "content") || utils.first(entry, "summary");
      const content = utils.descendants(body).map(node => node.text || "").join("");
      items.push({ id, data: { title, link: address.data, content } });
    }
    return Result.Ok({ title: owner + "/" + repo + " Releases 检测", link,
      snapshot: { releases: { type: "list", coverage: "window", scope: "releases-atom", ordered: false, items } } });
  }
}
const script = new GitHubReleasesDetect();
export const route = {
  path: "/github/:owner/:repo/releases/detect", name: "GitHub Releases 内容检测",
  example: "/github/ltaoo/findrss-worker/releases/detect", parameters: { owner: "所有者", repo: "仓库名" },
  description: "比较 Releases Atom 窗口中的发布标题和说明；窗口移出不代表上游删除。",
  handler: ctx => script.run(ctx),
};
