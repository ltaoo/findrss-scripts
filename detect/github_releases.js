import { utils } from "@findrss/util";
import { DetectScript, Result } from "@findrss/core";
export const kind = "detect";
export const version = "1.0.1";
export const platform = {
  name: "GitHub",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\" data-n=\"github-platform-icon\"><path data-n=\"github-icon-mark\" d=\"M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.2-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0C17.4 4.9 18.4 5.2 18.4 5.2c.7 1.7.3 2.9.2 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.4c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z\"/></svg>",
};

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
  path: "/github/:owner/:repo/releases.atom", name: "GitHub Releases 内容检测",
  example: "/github/ltaoo/findrss-worker/releases.atom", parameters: { owner: "所有者", repo: "仓库名" },
  description: "比较 Releases Atom 窗口中的发布标题和说明；窗口移出不代表上游删除。",
  handler: ctx => script.run(ctx),
};
