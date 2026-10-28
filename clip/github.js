/*
MIT License

Copyright (c) 2026 ltaoo

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
export const kind = "clip";
export const version = "1.0.0";
export const platform = { name: "GitHub", icon: "" };

class GitHubReadmeClip extends ClipScript {
  async fetch(ctx) {
    const { owner, repo } = ctx.params;
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}$/.test(owner || "") || !/^[a-zA-Z0-9_.-]{1,100}$/.test(repo || "")
      || repo === "." || repo === "..") return Result.Err("无效的 GitHub 仓库地址", "INVALID_PARAMETER");
    const link = "https://github.com/" + owner + "/" + repo;
    const captured = await ctx.clip.capture(link, {
      selector: "article.markdown-body", viewport: { width: 1280, height: 900 }, wait_ms: 1000,
    });
    if (captured.error) return captured;
    return Result.Ok({ title: owner + "/" + repo + " README", link,
      html: captured.data.html, stats: captured.data.stats });
  }
}
const script = new GitHubReadmeClip();
export const route = {
  path: "/github/:owner/:repo/readme", name: "GitHub README 剪藏",
  example: "/github/ltaoo/findrss-worker/readme", parameters: { owner: "所有者", repo: "仓库名" },
  description: "保存仓库首页 README，包含正文样式和可读取的图片。",
  handler: ctx => script.run(ctx),
};
