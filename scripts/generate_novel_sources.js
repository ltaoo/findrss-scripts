import { readFile, writeFile } from "node:fs/promises";

// 每个产物可单独粘贴到 FindRSS；运行时不依赖本地模板或清单。
const sources = JSON.parse(await readFile(new URL("./novel_sources.json", import.meta.url), "utf8"));
const template = await readFile(new URL("./templates/novel_chapters.js.txt", import.meta.url), "utf8");
for (const source of sources) {
  await writeFile(new URL("../rss/" + source.key + ".js", import.meta.url), template.replace("__SOURCE__", JSON.stringify(source, null, 2)));
}
console.log("已生成 " + sources.length + " 个小说章节订阅脚本");
