// 来源清单同时决定每个组内的脚本顺序。
const definitions = [
  ["short-video", "短视频", ["wxchannels", "douyin", "kuaishou", "tiktok", "hongguo"]],
  ["long-video", "长视频", ["mgtv", "mango", "iqiyi", "vqq", "qqvideo", "youku", "bilibili", "youtube", "dailymotion"]],
  ["social", "社交与社区", ["weibo", "x", "instagram", "xiaohongshu", "wxmp", "telegram", "zhihu", "douban", "bluesky", "mastodon", "reddit", "tieba", "hupu", "chongbuluo"]],
  ["technology", "科技与开发", ["github", "apple", "hackernews", "v2ex", "producthunt", "lobsters", "devto", "freebuf", "ithome", "sspai", "coolapk", "solidot", "juejin", "36kr", "geekpark"]],
  ["music", "音乐与播客", ["netease", "spotify", "deezer", "lastfm"]],
  ["games-anime", "游戏与动漫", ["steam", "anilist", "bangumi", "bilibili_anime"]],
  ["news", "新闻与资讯", ["baidu", "cankaoxiaoxi", "cls", "fastbull", "gelonghui", "google_news", "ifeng", "jin10", "mktnews", "thepaper", "wallstreetcn", "toutiao", "tencent", "zaobao", "bbc", "reuters", "apnews", "arstechnica", "itmedia", "nhk", "nytimes", "wikipedia"]],
  ["other", "其他", []],
  ["novels", "小说", ["qidian", "fanqienovel", "qimao", "qdmm", "jjwxc", "qidianmm", "ciweimao", "gutenberg", "69shuba", "ttk",
    "ibiqugu", "shuhaige", "mcxs", "99wx", "xbiquwk", "ujxsw", "yeudusk", "biquge365", "d8zw", "52bqg", "snxsw", "xbiquge_info", "bqg_info", "quanben5", "dxmwx", "101kks", "fsshu", "xtxxs9", "0xs", "suduguu", "xbiquge_cc", "xiaoshuohu", "ttkan", "xszj", "wxsy", "xhytd", "96dushu", "dongtanxs", "hetushu", "linovelib"]],
  ["adult", "成人影视", ["avmoo", "javbus", "javlibrary"]],
];

function source_index(script, keys) {
  const stem = String(script.file || "").split("/").at(-1).replace(/\.js$/, "");
  return keys.findIndex(key => stem === key || stem.startsWith(key + "_"));
}

export function group_scripts(scripts) {
  const groups = definitions.map(([id, title]) => ({ id, title, scripts: [] }));
  for (const script of scripts) {
    const index = definitions.findIndex(([, , keys]) => source_index(script, keys) >= 0);
    groups[index < 0 ? definitions.findIndex(([id]) => id === "other") : index].scripts.push(script);
  }
  for (let index = 0; index < groups.length; index++) {
    const keys = definitions[index][2];
    groups[index].scripts.sort((a, b) => source_index(a, keys) - source_index(b, keys));
  }
  return groups.filter(group => group.scripts.length);
}
