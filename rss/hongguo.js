import { utils } from "@findrss/util";
import { RSSScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const tags = ["短剧", "视频"];
// Favicon: https://lf-fe.fqnovelstatic.com/obj/novel-fanqie-fe/growth/incentive-h5-monorepo/apps/hongguo/app-logo.png
// 保留原图像素网格，确保颜色、透明度和轮廓与上游一致。
export const platform = {
  name: "红果短剧",
  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 40 40" shape-rendering="crispEdges" data-n="hongguo-platform-icon"><path fill="#c6d0b0" fill-opacity="0.06274510" d="M4 0h1v1h-1ZM39 4h1v1h-1ZM35 39h1v1h-1Z" data-n="hongguo-favicon-color-c6d0b010"/><path fill="#dbe0b1" fill-opacity="0.49803922" d="M5 0h1v1h-1ZM2 2h1v1h-1Z" data-n="hongguo-favicon-color-dbe0b17f"/><path fill="#d2dcb3" fill-opacity="0.74901961" d="M6 0h1v1h-1ZM39 33h1v1h-1Z" data-n="hongguo-favicon-color-d2dcb3bf"/><path fill="#cdddb4" fill-opacity="0.93725490" d="M7 0h1v1h-1ZM39 32h1v1h-1Z" data-n="hongguo-favicon-color-cdddb4ef"/><path fill="#c5e1ba" d="M8 0h2v1h-2ZM19 6h1v1h-1Z" data-n="hongguo-favicon-color-c5e1baff"/><path fill="#badcb7" d="M10 0h2v1h-2ZM34 21h1v1h-1ZM39 28h1v1h-1Z" data-n="hongguo-favicon-color-badcb7ff"/><path fill="#b0dcb6" d="M12 0h2v1h-2ZM13 1h1v1h-1ZM22 7h1v1h-1ZM24 8h1v1h-1ZM39 26h1v1h-1ZM39 27h1v1h-1Z" data-n="hongguo-favicon-color-b0dcb6ff"/><path fill="#a4deba" d="M14 0h2v1h-2ZM39 24h1v1h-1ZM39 25h1v1h-1Z" data-n="hongguo-favicon-color-a4debaff"/><path fill="#9cdcb9" d="M16 0h1v1h-1ZM31 13h1v1h-1ZM32 14h1v1h-1ZM38 22h1v1h-1ZM39 23h1v1h-1Z" data-n="hongguo-favicon-color-9cdcb9ff"/><path fill="#97dcb9" d="M17 0h1v1h-1ZM17 1h2v1h-2ZM38 21h1v1h-1ZM39 22h1v1h-1Z" data-n="hongguo-favicon-color-97dcb9ff"/><path fill="#91ddbc" d="M18 0h1v1h-1ZM19 1h1v1h-1ZM38 20h1v1h-1ZM39 21h1v1h-1Z" data-n="hongguo-favicon-color-91ddbcff"/><path fill="#8bdebe" d="M19 0h2v1h-2ZM20 1h1v1h-1ZM38 19h2v1h-2ZM39 20h1v1h-1Z" data-n="hongguo-favicon-color-8bdebeff"/><path fill="#84dec0" d="M21 0h1v1h-1ZM38 17h1v1h-1ZM38 18h2v1h-2Z" data-n="hongguo-favicon-color-84dec0ff"/><path fill="#7ee0c2" d="M22 0h2v1h-2ZM23 1h1v1h-1ZM38 16h2v1h-2ZM39 17h1v1h-1Z" data-n="hongguo-favicon-color-7ee0c2ff"/><path fill="#77e1c6" d="M24 0h2v1h-2ZM38 13h1v1h-1ZM39 14h1v1h-1ZM39 15h1v1h-1Z" data-n="hongguo-favicon-color-77e1c6ff"/><path fill="#70e0c6" d="M26 0h1v1h-1ZM26 1h3v1h-3ZM37 10h1v1h-1ZM37 11h2v1h-2ZM38 12h1v1h-1Z" data-n="hongguo-favicon-color-70e0c6ff"/><path fill="#72e2ca" d="M27 0h3v1h-3ZM39 10h1v1h-1ZM39 11h1v1h-1ZM39 12h1v1h-1ZM39 13h1v1h-1Z" data-n="hongguo-favicon-color-72e2caff"/><path fill="#70e4ce" d="M30 0h2v1h-2ZM33 1h1v1h-1ZM35 2h1v1h-1ZM38 6h1v1h-1ZM38 7h1v1h-1ZM39 8h1v1h-1ZM39 9h1v1h-1Z" data-n="hongguo-favicon-color-70e4ceff"/><path fill="#71e5d0" fill-opacity="0.93725490" d="M32 0h1v1h-1ZM39 7h1v1h-1Z" data-n="hongguo-favicon-color-71e5d0ef"/><path fill="#72e6d1" fill-opacity="0.74901961" d="M33 0h1v1h-1ZM39 6h1v1h-1Z" data-n="hongguo-favicon-color-72e6d1bf"/><path fill="#72e4d2" fill-opacity="0.37647059" d="M34 0h1v1h-1Z" data-n="hongguo-favicon-color-72e4d260"/><path fill="#78e7d7" fill-opacity="0.12549020" d="M35 0h1v1h-1Z" data-n="hongguo-favicon-color-78e7d720"/><path fill="#e4d8a7" fill-opacity="0.43529412" d="M3 1h1v1h-1ZM1 3h1v1h-1ZM38 36h1v1h-1Z" data-n="hongguo-favicon-color-e4d8a76f"/><path fill="#d9dfb1" fill-opacity="0.93725490" d="M4 1h1v1h-1Z" data-n="hongguo-favicon-color-d9dfb1ef"/><path fill="#d4ddac" d="M5 1h2v1h-2ZM5 2h2v1h-2Z" data-n="hongguo-favicon-color-d4ddacff"/><path fill="#cddbaa" d="M7 1h1v1h-1ZM7 2h2v1h-2Z" data-n="hongguo-favicon-color-cddbaaff"/><path fill="#c6dbb1" d="M8 1h2v1h-2ZM39 30h1v1h-1ZM39 31h1v1h-1Z" data-n="hongguo-favicon-color-c6dbb1ff"/><path fill="#bddbb1" d="M10 1h2v1h-2ZM39 29h1v1h-1Z" data-n="hongguo-favicon-color-bddbb1ff"/><path fill="#b3d8ae" d="M12 1h1v1h-1ZM13 2h1v1h-1ZM38 26h1v1h-1ZM38 27h1v1h-1Z" data-n="hongguo-favicon-color-b3d8aeff"/><path fill="#a8dab5" d="M14 1h1v1h-1ZM34 18h1v1h-1ZM38 25h1v1h-1Z" data-n="hongguo-favicon-color-a8dab5ff"/><path fill="#a2dab4" d="M15 1h2v1h-2ZM38 23h1v1h-1ZM38 24h1v1h-1Z" data-n="hongguo-favicon-color-a2dab4ff"/><path fill="#81dcba" d="M21 1h2v1h-2ZM22 2h2v1h-2ZM37 16h1v1h-1ZM37 17h1v1h-1Z" data-n="hongguo-favicon-color-81dcbaff"/><path fill="#77dec0" d="M24 1h2v1h-2ZM25 2h1v1h-1ZM37 13h1v1h-1ZM37 14h2v1h-2ZM38 15h1v1h-1Z" data-n="hongguo-favicon-color-77dec0ff"/><path fill="#6ce2ca" d="M29 1h3v1h-3ZM37 7h1v1h-1ZM37 8h1v1h-1ZM37 9h2v1h-2ZM38 10h1v1h-1Z" data-n="hongguo-favicon-color-6ce2caff"/><path fill="#6ce3cd" d="M32 1h1v1h-1ZM33 2h2v1h-2ZM34 3h2v1h-2ZM35 4h2v1h-2ZM36 5h2v1h-2ZM37 6h1v1h-1ZM38 8h1v1h-1Z" data-n="hongguo-favicon-color-6ce3cdff"/><path fill="#70e5d0" d="M34 1h1v1h-1ZM36 2h1v1h-1ZM36 3h2v1h-2ZM37 4h1v1h-1ZM38 5h1v1h-1Z" data-n="hongguo-favicon-color-70e5d0ff"/><path fill="#72e5d1" fill-opacity="0.87450980" d="M35 1h1v1h-1Z" data-n="hongguo-favicon-color-72e5d1df"/><path fill="#74e6d3" fill-opacity="0.43921569" d="M36 1h1v1h-1ZM38 3h1v1h-1Z" data-n="hongguo-favicon-color-74e6d370"/><path fill="#dddcaa" d="M3 2h2v1h-2Z" data-n="hongguo-favicon-color-dddcaaff"/><path fill="#c3d8a5" d="M9 2h2v1h-2ZM11 3h1v1h-1Z" data-n="hongguo-favicon-color-c3d8a5ff"/><path fill="#bad8a6" d="M11 2h2v1h-2ZM12 3h2v1h-2Z" data-n="hongguo-favicon-color-bad8a6ff"/><path fill="#acd7a9" d="M14 2h2v1h-2ZM15 3h1v1h-1ZM20 6h1v1h-1ZM37 25h1v1h-1Z" data-n="hongguo-favicon-color-acd7a9ff"/><path fill="#a2d7ac" d="M16 2h1v1h-1ZM17 3h1v1h-1ZM37 23h1v1h-1Z" data-n="hongguo-favicon-color-a2d7acff"/><path fill="#9dd8b0" d="M17 2h1v1h-1ZM37 22h1v1h-1Z" data-n="hongguo-favicon-color-9dd8b0ff"/><path fill="#95d9b1" d="M18 2h2v1h-2ZM30 12h1v1h-1ZM37 21h1v1h-1Z" data-n="hongguo-favicon-color-95d9b1ff"/><path fill="#8ed9b5" d="M20 2h1v1h-1ZM37 19h1v1h-1ZM37 20h1v1h-1Z" data-n="hongguo-favicon-color-8ed9b5ff"/><path fill="#87d9b4" d="M21 2h1v1h-1ZM21 3h2v1h-2ZM36 17h1v1h-1ZM36 18h2v1h-2Z" data-n="hongguo-favicon-color-87d9b4ff"/><path fill="#78dbb9" d="M24 2h1v1h-1ZM24 3h2v1h-2ZM35 13h1v1h-1ZM36 14h1v1h-1ZM36 15h2v1h-2Z" data-n="hongguo-favicon-color-78dbb9ff"/><path fill="#72dcbc" d="M26 2h1v1h-1ZM26 3h2v1h-2ZM35 12h2v1h-2ZM36 13h1v1h-1Z" data-n="hongguo-favicon-color-72dcbcff"/><path fill="#6edec2" d="M27 2h2v1h-2ZM28 3h2v1h-2ZM36 10h1v1h-1ZM36 11h1v1h-1ZM37 12h1v1h-1Z" data-n="hongguo-favicon-color-6edec2ff"/><path fill="#68dfc5" d="M29 2h1v1h-1ZM30 3h2v1h-2ZM31 4h3v1h-3ZM33 5h2v1h-2ZM34 6h1v1h-1ZM35 7h1v1h-1ZM35 8h2v1h-2ZM36 9h1v1h-1Z" data-n="hongguo-favicon-color-68dfc5ff"/><path fill="#69e1c9" d="M30 2h3v1h-3ZM32 3h2v1h-2ZM34 4h1v1h-1ZM35 5h1v1h-1ZM35 6h2v1h-2ZM36 7h1v1h-1Z" data-n="hongguo-favicon-color-69e1c9ff"/><path fill="#74e6d2" fill-opacity="0.50196078" d="M37 2h1v1h-1ZM39 5h1v1h-1Z" data-n="hongguo-favicon-color-74e6d280"/><path fill="#dfd8a1" d="M2 3h4v1h-4Z" data-n="hongguo-favicon-color-dfd8a1ff"/><path fill="#d3d5a2" d="M6 3h2v1h-2ZM38 32h1v1h-1Z" data-n="hongguo-favicon-color-d3d5a2ff"/><path fill="#cdd29e" d="M8 3h2v1h-2ZM37 31h1v1h-1Z" data-n="hongguo-favicon-color-cdd29eff"/><path fill="#c6d1a2" d="M10 3h1v1h-1ZM37 29h1v1h-1ZM37 30h1v1h-1Z" data-n="hongguo-favicon-color-c6d1a2ff"/><path fill="#b4d3a6" d="M14 3h1v1h-1ZM37 26h1v1h-1ZM37 27h1v1h-1Z" data-n="hongguo-favicon-color-b4d3a6ff"/><path fill="#a6d4a8" d="M16 3h1v1h-1ZM36 23h1v1h-1ZM37 24h1v1h-1Z" data-n="hongguo-favicon-color-a6d4a8ff"/><path fill="#9dd5aa" d="M18 3h1v1h-1ZM36 21h1v1h-1ZM36 22h1v1h-1Z" data-n="hongguo-favicon-color-9dd5aaff"/><path fill="#96d6ab" d="M19 3h1v1h-1ZM26 9h1v1h-1ZM36 20h1v1h-1Z" data-n="hongguo-favicon-color-96d6abff"/><path fill="#8ed6af" d="M20 3h1v1h-1ZM33 15h1v1h-1ZM36 19h1v1h-1Z" data-n="hongguo-favicon-color-8ed6afff"/><path fill="#7ed8b4" d="M23 3h1v1h-1ZM24 4h1v1h-1ZM34 14h1v1h-1ZM35 15h1v1h-1ZM36 16h1v1h-1Z" data-n="hongguo-favicon-color-7ed8b4ff"/><path fill="#e3d79f" fill-opacity="0.12549020" d="M0 4h1v1h-1ZM39 35h1v1h-1Z" data-n="hongguo-favicon-color-e3d79f20"/><path fill="#e9d49a" fill-opacity="0.87450980" d="M1 4h1v1h-1Z" data-n="hongguo-favicon-color-e9d49adf"/><path fill="#e4d397" d="M2 4h3v1h-3Z" data-n="hongguo-favicon-color-e4d397ff"/><path fill="#d8d196" d="M5 4h3v1h-3Z" data-n="hongguo-favicon-color-d8d196ff"/><path fill="#d0d094" d="M8 4h2v1h-2ZM10 5h1v1h-1ZM13 6h1v1h-1Z" data-n="hongguo-favicon-color-d0d094ff"/><path fill="#c8d094" d="M10 4h2v1h-2ZM11 5h2v1h-2Z" data-n="hongguo-favicon-color-c8d094ff"/><path fill="#bfd29a" d="M12 4h2v1h-2Z" data-n="hongguo-favicon-color-bfd29aff"/><path fill="#b6d19d" d="M14 4h2v1h-2ZM36 26h1v1h-1Z" data-n="hongguo-favicon-color-b6d19dff"/><path fill="#aed1a2" d="M16 4h1v1h-1ZM36 24h1v1h-1ZM36 25h1v1h-1Z" data-n="hongguo-favicon-color-aed1a2ff"/><path fill="#a3d2a1" d="M17 4h2v1h-2ZM18 5h2v1h-2ZM35 21h1v1h-1ZM35 22h1v1h-1Z" data-n="hongguo-favicon-color-a3d2a1ff"/><path fill="#99d3a3" d="M19 4h1v1h-1ZM20 5h1v1h-1ZM21 6h1v1h-1ZM35 20h1v1h-1Z" data-n="hongguo-favicon-color-99d3a3ff"/><path fill="#92d5ab" d="M20 4h2v1h-2ZM34 17h1v1h-1ZM35 19h1v1h-1Z" data-n="hongguo-favicon-color-92d5abff"/><path fill="#8ad5ac" d="M22 4h1v1h-1ZM35 17h1v1h-1ZM35 18h1v1h-1Z" data-n="hongguo-favicon-color-8ad5acff"/><path fill="#82d6ae" d="M23 4h1v1h-1ZM24 5h1v1h-1ZM34 15h1v1h-1ZM35 16h1v1h-1Z" data-n="hongguo-favicon-color-82d6aeff"/><path fill="#77d8b3" d="M25 4h1v1h-1ZM26 5h1v1h-1ZM34 13h1v1h-1ZM35 14h1v1h-1Z" data-n="hongguo-favicon-color-77d8b3ff"/><path fill="#72d9b5" d="M26 4h1v1h-1ZM27 5h1v1h-1ZM33 11h1v1h-1ZM34 12h1v1h-1Z" data-n="hongguo-favicon-color-72d9b5ff"/><path fill="#6edab8" d="M27 4h1v1h-1ZM28 5h1v1h-1ZM29 6h1v1h-1ZM30 7h1v1h-1ZM31 8h1v1h-1ZM32 9h1v1h-1ZM33 10h1v1h-1ZM34 11h1v1h-1Z" data-n="hongguo-favicon-color-6edab8ff"/><path fill="#6cdcbd" d="M28 4h2v1h-2ZM34 9h1v1h-1ZM35 10h1v1h-1ZM35 11h1v1h-1Z" data-n="hongguo-favicon-color-6cdcbdff"/><path fill="#68ddc1" d="M30 4h1v1h-1ZM31 5h2v1h-2ZM32 6h2v1h-2ZM33 7h2v1h-2ZM34 8h1v1h-1ZM35 9h1v1h-1Z" data-n="hongguo-favicon-color-68ddc1ff"/><path fill="#74e5d2" fill-opacity="0.93725490" d="M38 4h1v1h-1Z" data-n="hongguo-favicon-color-74e5d2ef"/><path fill="#eccf8f" fill-opacity="0.37647059" d="M0 5h1v1h-1Z" data-n="hongguo-favicon-color-eccf8f60"/><path fill="#e8cf90" d="M1 5h4v1h-4Z" data-n="hongguo-favicon-color-e8cf90ff"/><path fill="#dccd8d" d="M5 5h4v1h-4Z" data-n="hongguo-favicon-color-dccd8dff"/><path fill="#d2ca8a" d="M9 5h1v1h-1ZM10 6h3v1h-3Z" data-n="hongguo-favicon-color-d2ca8aff"/><path fill="#c0cd99" d="M13 5h2v1h-2ZM33 24h1v1h-1ZM36 27h1v1h-1ZM36 28h1v1h-1Z" data-n="hongguo-favicon-color-c0cd99ff"/><path fill="#b6cc97" d="M15 5h1v1h-1ZM34 24h1v1h-1ZM35 25h1v1h-1Z" data-n="hongguo-favicon-color-b6cc97ff"/><path fill="#adcd9a" d="M16 5h2v1h-2ZM34 22h1v1h-1ZM34 23h2v1h-2ZM35 24h1v1h-1Z" data-n="hongguo-favicon-color-adcd9aff"/><path fill="#90d2a2" d="M21 5h1v1h-1ZM22 6h1v1h-1ZM23 7h2v1h-2ZM25 8h1v1h-1Z" data-n="hongguo-favicon-color-90d2a2ff"/><path fill="#8dd4a6" d="M22 5h1v1h-1ZM23 6h1v1h-1Z" data-n="hongguo-favicon-color-8dd4a6ff"/><path fill="#87d4a9" d="M23 5h1v1h-1ZM24 6h1v1h-1ZM29 11h1v1h-1ZM34 16h1v1h-1Z" data-n="hongguo-favicon-color-87d4a9ff"/><path fill="#7ad5ad" d="M25 5h1v1h-1ZM26 6h1v1h-1ZM27 7h1v1h-1ZM28 8h1v1h-1ZM29 9h1v1h-1ZM30 10h1v1h-1ZM31 11h1v1h-1ZM32 12h1v1h-1ZM33 13h1v1h-1Z" data-n="hongguo-favicon-color-7ad5adff"/><path fill="#6adbbc" d="M29 5h2v1h-2ZM30 6h2v1h-2ZM31 7h2v1h-2ZM32 8h2v1h-2ZM33 9h1v1h-1ZM34 10h1v1h-1Z" data-n="hongguo-favicon-color-6adbbcff"/><path fill="#f0cc8a" fill-opacity="0.74901961" d="M0 6h1v1h-1Z" data-n="hongguo-favicon-color-f0cc8abf"/><path fill="#ebcb87" d="M1 6h3v1h-3Z" data-n="hongguo-favicon-color-ebcb87ff"/><path fill="#e4c985" d="M4 6h3v1h-3Z" data-n="hongguo-favicon-color-e4c985ff"/><path fill="#dbc884" d="M7 6h3v1h-3ZM10 7h1v1h-1Z" data-n="hongguo-favicon-color-dbc884ff"/><path fill="#dde2c0" d="M14 6h1v1h-1Z" data-n="hongguo-favicon-color-dde2c0ff"/><path fill="#e5ebd6" d="M15 6h1v1h-1ZM33 23h1v1h-1Z" data-n="hongguo-favicon-color-e5ebd6ff"/><path fill="#ecf3e5" d="M16 6h2v1h-2Z" data-n="hongguo-favicon-color-ecf3e5ff"/><path fill="#d7edd8" d="M18 6h1v1h-1ZM21 7h1v1h-1ZM25 9h1v1h-1ZM28 11h1v1h-1Z" data-n="hongguo-favicon-color-d7edd8ff"/><path fill="#7fd4aa" d="M25 6h1v1h-1ZM26 7h1v1h-1ZM32 13h1v1h-1ZM33 14h1v1h-1Z" data-n="hongguo-favicon-color-7fd4aaff"/><path fill="#75d6b0" d="M27 6h1v1h-1ZM28 7h1v1h-1ZM29 8h1v1h-1ZM30 9h1v1h-1ZM31 10h1v1h-1ZM32 11h1v1h-1ZM33 12h1v1h-1Z" data-n="hongguo-favicon-color-75d6b0ff"/><path fill="#71d8b3" d="M28 6h1v1h-1ZM29 7h1v1h-1ZM30 8h1v1h-1ZM31 9h1v1h-1ZM32 10h1v1h-1Z" data-n="hongguo-favicon-color-71d8b3ff"/><path fill="#f0c181" fill-opacity="0.93725490" d="M0 7h1v1h-1ZM35 38h1v1h-1Z" data-n="hongguo-favicon-color-f0c181ef"/><path fill="#eec67f" d="M1 7h3v1h-3Z" data-n="hongguo-favicon-color-eec67fff"/><path fill="#e7c57d" d="M4 7h3v1h-3Z" data-n="hongguo-favicon-color-e7c57dff"/><path fill="#e0c37c" d="M7 7h3v1h-3ZM9 8h1v1h-1Z" data-n="hongguo-favicon-color-e0c37cff"/><path fill="#e0ce98" d="M11 7h1v1h-1ZM37 35h1v1h-1ZM37 36h1v1h-1Z" data-n="hongguo-favicon-color-e0ce98ff"/><path fill="#f8f1e1" d="M12 7h1v1h-1ZM16 13h2v1h-2Z" data-n="hongguo-favicon-color-f8f1e1ff"/><path fill="#ffffff" d="M13 7h8v1h-8ZM11 8h12v1h-12ZM10 9h15v1h-15ZM9 10h17v1h-17ZM9 11h19v1h-19ZM8 12h21v1h-21ZM8 13h8v1h-8ZM18 13h12v1h-12ZM7 14h7v1h-7ZM20 14h11v1h-11ZM7 15h7v1h-7ZM22 15h10v1h-10ZM7 16h6v1h-6ZM24 16h9v1h-9ZM7 17h6v1h-6ZM25 17h8v1h-8ZM7 18h6v1h-6ZM26 18h8v1h-8ZM6 19h7v1h-7ZM27 19h7v1h-7ZM7 20h6v1h-6ZM27 20h7v1h-7ZM7 21h6v1h-6ZM27 21h7v1h-7ZM7 22h6v1h-6ZM26 22h7v1h-7ZM7 23h6v1h-6ZM24 23h9v1h-9ZM7 24h6v1h-6ZM23 24h9v1h-9ZM7 25h7v1h-7ZM21 25h10v1h-10ZM8 26h7v1h-7ZM19 26h11v1h-11ZM8 27h21v1h-21ZM9 28h19v1h-19ZM9 29h17v1h-17ZM10 30h15v1h-15ZM11 31h12v1h-12ZM13 32h8v1h-8Z" data-n="hongguo-favicon-color-ffffffff"/><path fill="#84d2a4" d="M25 7h1v1h-1ZM26 8h1v1h-1ZM27 9h1v1h-1ZM28 10h1v1h-1Z" data-n="hongguo-favicon-color-84d2a4ff"/><path fill="#f1c177" d="M0 8h5v1h-5Z" data-n="hongguo-favicon-color-f1c177ff"/><path fill="#e8be75" d="M5 8h4v1h-4Z" data-n="hongguo-favicon-color-e8be75ff"/><path fill="#eadab5" d="M10 8h1v1h-1ZM25 18h1v1h-1ZM26 19h1v1h-1Z" data-n="hongguo-favicon-color-eadab5ff"/><path fill="#e5f3e6" d="M23 8h1v1h-1Z" data-n="hongguo-favicon-color-e5f3e6ff"/><path fill="#7ed3a7" d="M27 8h1v1h-1ZM28 9h1v1h-1ZM29 10h1v1h-1ZM30 11h1v1h-1ZM31 12h1v1h-1Z" data-n="hongguo-favicon-color-7ed3a7ff"/><path fill="#f3bc6f" d="M0 9h5v1h-5Z" data-n="hongguo-favicon-color-f3bc6fff"/><path fill="#ecbb6e" d="M5 9h4v1h-4Z" data-n="hongguo-favicon-color-ecbb6eff"/><path fill="#f3ddb7" d="M9 9h1v1h-1Z" data-n="hongguo-favicon-color-f3ddb7ff"/><path fill="#f8b76c" d="M0 10h2v1h-2ZM6 14h1v1h-1Z" data-n="hongguo-favicon-color-f8b76cff"/><path fill="#f2b667" d="M2 10h6v1h-6Z" data-n="hongguo-favicon-color-f2b667ff"/><path fill="#f3d2a0" d="M8 10h1v1h-1Z" data-n="hongguo-favicon-color-f3d2a0ff"/><path fill="#f1f9f4" d="M26 10h1v1h-1ZM29 12h1v1h-1ZM30 13h1v1h-1ZM32 15h1v1h-1Z" data-n="hongguo-favicon-color-f1f9f4ff"/><path fill="#bfe2c7" d="M27 10h1v1h-1ZM34 19h1v1h-1ZM34 20h1v1h-1Z" data-n="hongguo-favicon-color-bfe2c7ff"/><path fill="#f8b261" d="M0 11h3v1h-3Z" data-n="hongguo-favicon-color-f8b261ff"/><path fill="#f4b160" d="M3 11h5v1h-5Z" data-n="hongguo-favicon-color-f4b160ff"/><path fill="#fef4ea" d="M8 11h1v1h-1ZM7 13h1v1h-1ZM14 14h1v1h-1ZM22 24h1v1h-1Z" data-n="hongguo-favicon-color-fef4eaff"/><path fill="#f8ad5a" d="M0 12h7v1h-7Z" data-n="hongguo-favicon-color-f8ad5aff"/><path fill="#fbc99e" d="M7 12h1v1h-1ZM6 15h1v1h-1ZM13 17h1v1h-1ZM17 26h1v1h-1ZM27 29h1v1h-1Z" data-n="hongguo-favicon-color-fbc99eff"/><path fill="#faa854" d="M0 13h7v1h-7Z" data-n="hongguo-favicon-color-faa854ff"/><path fill="#fca34f" d="M0 14h6v1h-6Z" data-n="hongguo-favicon-color-fca34fff"/><path fill="#efb26f" d="M15 14h1v1h-1ZM33 36h1v1h-1ZM33 37h1v1h-1ZM33 38h1v1h-1Z" data-n="hongguo-favicon-color-efb26fff"/><path fill="#e8ac5c" d="M16 14h1v1h-1ZM17 15h2v1h-2ZM19 16h1v1h-1Z" data-n="hongguo-favicon-color-e8ac5cff"/><path fill="#e2ab5e" d="M17 14h1v1h-1ZM19 15h1v1h-1ZM20 16h1v1h-1ZM21 17h1v1h-1ZM22 18h1v1h-1ZM23 19h1v1h-1ZM24 20h1v1h-1Z" data-n="hongguo-favicon-color-e2ab5eff"/><path fill="#e3b97b" d="M18 14h1v1h-1ZM20 15h1v1h-1ZM33 32h1v1h-1ZM34 33h1v1h-1ZM34 34h1v1h-1ZM34 35h1v1h-1Z" data-n="hongguo-favicon-color-e3b97bff"/><path fill="#f3e2c5" d="M19 14h1v1h-1Z" data-n="hongguo-favicon-color-f3e2c5ff"/><path fill="#f9fcf9" d="M31 14h1v1h-1ZM33 17h1v1h-1ZM33 22h1v1h-1Z" data-n="hongguo-favicon-color-f9fcf9ff"/><path fill="#fd9e4a" d="M0 15h6v1h-6Z" data-n="hongguo-favicon-color-fd9e4aff"/><path fill="#f3ac66" d="M14 15h1v1h-1ZM32 37h1v1h-1ZM32 38h1v1h-1Z" data-n="hongguo-favicon-color-f3ac66ff"/><path fill="#eda656" d="M15 15h2v1h-2ZM17 16h2v1h-2ZM19 17h1v1h-1Z" data-n="hongguo-favicon-color-eda656ff"/><path fill="#f0e2c7" d="M21 15h1v1h-1ZM24 17h1v1h-1Z" data-n="hongguo-favicon-color-f0e2c7ff"/><path fill="#fe9a44" d="M0 16h6v1h-6Z" data-n="hongguo-favicon-color-fe9a44ff"/><path fill="#ffdcc7" d="M6 16h1v1h-1ZM12 32h1v1h-1ZM21 32h1v1h-1ZM16 33h1v1h-1Z" data-n="hongguo-favicon-color-ffdcc7ff"/><path fill="#fde7d5" d="M13 16h1v1h-1ZM6 22h1v1h-1ZM7 26h1v1h-1ZM28 28h1v1h-1Z" data-n="hongguo-favicon-color-fde7d5ff"/><path fill="#f39e4c" d="M14 16h1v1h-1ZM15 17h2v1h-2ZM17 18h1v1h-1ZM19 19h1v1h-1ZM20 20h1v1h-1Z" data-n="hongguo-favicon-color-f39e4cff"/><path fill="#f2a14f" d="M15 16h1v1h-1ZM17 17h1v1h-1ZM18 18h1v1h-1Z" data-n="hongguo-favicon-color-f2a14fff"/><path fill="#f1a352" d="M16 16h1v1h-1ZM18 17h1v1h-1Z" data-n="hongguo-favicon-color-f1a352ff"/><path fill="#dbae64" d="M21 16h1v1h-1ZM22 17h1v1h-1ZM23 18h2v1h-2ZM24 19h2v1h-2ZM25 20h1v1h-1Z" data-n="hongguo-favicon-color-dbae64ff"/><path fill="#e4c58d" d="M22 16h1v1h-1ZM36 35h1v1h-1ZM36 36h1v1h-1Z" data-n="hongguo-favicon-color-e4c58dff"/><path fill="#faf6ed" d="M23 16h1v1h-1ZM26 21h1v1h-1ZM32 24h1v1h-1ZM29 27h1v1h-1Z" data-n="hongguo-favicon-color-faf6edff"/><path fill="#c4e8d3" d="M33 16h1v1h-1Z" data-n="hongguo-favicon-color-c4e8d3ff"/><path fill="#fe9540" d="M0 17h6v1h-6Z" data-n="hongguo-favicon-color-fe9540ff"/><path fill="#ffe3ce" d="M6 17h1v1h-1ZM13 23h1v1h-1ZM20 25h1v1h-1ZM25 30h1v1h-1ZM23 31h1v1h-1Z" data-n="hongguo-favicon-color-ffe3ceff"/><path fill="#f69a48" d="M14 17h1v1h-1ZM15 18h2v1h-2ZM17 19h2v1h-2Z" data-n="hongguo-favicon-color-f69a48ff"/><path fill="#e7a75b" d="M20 17h1v1h-1ZM21 18h1v1h-1ZM22 19h1v1h-1ZM23 20h1v1h-1ZM24 21h1v1h-1ZM29 29h1v1h-1ZM29 30h1v1h-1ZM30 31h1v1h-1Z" data-n="hongguo-favicon-color-e7a75bff"/><path fill="#d9b473" d="M23 17h1v1h-1ZM31 27h1v1h-1ZM31 28h1v1h-1ZM32 29h1v1h-1ZM32 30h1v1h-1Z" data-n="hongguo-favicon-color-d9b473ff"/><path fill="#fe903d" d="M0 18h6v1h-6Z" data-n="hongguo-favicon-color-fe903dff"/><path fill="#ffefe5" d="M6 18h1v1h-1ZM6 21h1v1h-1ZM15 26h1v1h-1ZM18 26h1v1h-1ZM8 28h1v1h-1Z" data-n="hongguo-favicon-color-ffefe5ff"/><path fill="#fbb67d" d="M13 18h1v1h-1Z" data-n="hongguo-favicon-color-fbb67dff"/><path fill="#f89644" d="M14 18h1v1h-1ZM15 19h2v1h-2ZM17 20h2v1h-2ZM19 21h1v1h-1ZM20 22h1v1h-1ZM21 23h1v1h-1Z" data-n="hongguo-favicon-color-f89644ff"/><path fill="#eea051" d="M19 18h1v1h-1ZM20 19h1v1h-1ZM21 20h1v1h-1ZM22 21h1v1h-1ZM23 22h1v1h-1ZM28 30h1v1h-1Z" data-n="hongguo-favicon-color-eea051ff"/><path fill="#eba255" d="M20 18h1v1h-1ZM21 19h1v1h-1ZM22 20h1v1h-1ZM23 21h1v1h-1ZM28 29h1v1h-1ZM29 31h1v1h-1Z" data-n="hongguo-favicon-color-eba255ff"/><path fill="#ff8c37" d="M0 19h6v1h-6Z" data-n="hongguo-favicon-color-ff8c37ff"/><path fill="#fcab6e" d="M13 19h1v1h-1ZM13 20h1v1h-1ZM21 24h1v1h-1ZM24 31h1v1h-1Z" data-n="hongguo-favicon-color-fcab6eff"/><path fill="#fb903e" d="M14 19h1v1h-1ZM14 20h2v1h-2ZM16 21h2v1h-2ZM18 22h1v1h-1ZM19 23h1v1h-1Z" data-n="hongguo-favicon-color-fb903eff"/><path fill="#ff8835" d="M0 20h6v1h-6ZM14 22h1v1h-1ZM16 23h1v1h-1Z" data-n="hongguo-favicon-color-ff8835ff"/><path fill="#fef9f5" d="M6 20h1v1h-1ZM25 22h1v1h-1ZM13 24h1v1h-1ZM31 25h1v1h-1ZM30 26h1v1h-1ZM26 29h1v1h-1Z" data-n="hongguo-favicon-color-fef9f5ff"/><path fill="#f99142" d="M16 20h1v1h-1ZM18 21h1v1h-1ZM19 22h1v1h-1ZM20 23h1v1h-1ZM25 31h1v1h-1ZM26 32h1v1h-1ZM26 33h1v1h-1ZM27 35h1v1h-1ZM27 36h1v1h-1ZM27 37h1v1h-1ZM28 38h1v1h-1ZM28 39h1v1h-1Z" data-n="hongguo-favicon-color-f99142ff"/><path fill="#f4984a" d="M19 20h1v1h-1ZM20 21h1v1h-1ZM21 22h1v1h-1ZM22 23h1v1h-1ZM27 31h1v1h-1ZM28 33h1v1h-1ZM28 34h1v1h-1Z" data-n="hongguo-favicon-color-f4984aff"/><path fill="#e1be86" d="M26 20h1v1h-1ZM30 27h1v1h-1ZM35 34h1v1h-1ZM35 35h1v1h-1Z" data-n="hongguo-favicon-color-e1be86ff"/><path fill="#ff8332" d="M0 21h6v1h-6ZM14 23h1v1h-1ZM15 24h1v1h-1Z" data-n="hongguo-favicon-color-ff8332ff"/><path fill="#feab76" d="M13 21h1v1h-1ZM19 33h1v1h-1Z" data-n="hongguo-favicon-color-feab76ff"/><path fill="#fc8b3a" d="M14 21h1v1h-1ZM16 22h1v1h-1ZM18 23h1v1h-1ZM19 24h1v1h-1ZM25 33h1v1h-1ZM26 36h1v1h-1Z" data-n="hongguo-favicon-color-fc8b3aff"/><path fill="#fb8d3d" d="M15 21h1v1h-1ZM17 22h1v1h-1ZM20 24h1v1h-1ZM25 32h1v1h-1ZM26 34h1v1h-1ZM26 35h1v1h-1ZM27 38h1v1h-1ZM27 39h1v1h-1Z" data-n="hongguo-favicon-color-fb8d3dff"/><path fill="#f19b4e" d="M21 21h1v1h-1ZM22 22h1v1h-1ZM27 30h1v1h-1ZM28 31h1v1h-1ZM28 32h1v1h-1Z" data-n="hongguo-favicon-color-f19b4eff"/><path fill="#e6b373" d="M25 21h1v1h-1ZM29 28h1v1h-1ZM33 33h1v1h-1ZM33 34h1v1h-1ZM33 35h1v1h-1Z" data-n="hongguo-favicon-color-e6b373ff"/><path fill="#fe8032" d="M0 22h1v1h-1ZM16 25h2v1h-2ZM20 33h1v1h-1ZM23 33h1v1h-1ZM23 34h1v1h-1ZM24 36h1v1h-1ZM24 37h1v1h-1ZM24 38h1v1h-1Z" data-n="hongguo-favicon-color-fe8032ff"/><path fill="#ff7f2e" d="M1 22h5v1h-5ZM15 25h1v1h-1ZM22 33h1v1h-1ZM23 35h1v1h-1ZM23 36h1v1h-1ZM24 39h1v1h-1Z" data-n="hongguo-favicon-color-ff7f2eff"/><path fill="#febd91" d="M13 22h1v1h-1ZM16 26h1v1h-1Z" data-n="hongguo-favicon-color-febd91ff"/><path fill="#fc8839" d="M15 22h1v1h-1ZM17 23h1v1h-1ZM14 24h1v1h-1ZM18 24h1v1h-1ZM24 32h1v1h-1ZM24 33h1v1h-1ZM25 34h1v1h-1ZM25 35h1v1h-1ZM26 37h1v1h-1ZM26 38h1v1h-1ZM26 39h1v1h-1Z" data-n="hongguo-favicon-color-fc8839ff"/><path fill="#ebbc81" d="M24 22h1v1h-1ZM35 36h1v1h-1ZM35 37h1v1h-1Z" data-n="hongguo-favicon-color-ebbc81ff"/><path fill="#ff7b2b" d="M0 23h6v1h-6ZM0 24h1v1h-1ZM21 33h1v1h-1ZM22 34h1v1h-1ZM22 35h1v1h-1ZM22 36h1v1h-1ZM23 37h1v1h-1ZM23 38h1v1h-1ZM23 39h1v1h-1Z" data-n="hongguo-favicon-color-ff7b2bff"/><path fill="#ffcbae" d="M6 23h1v1h-1ZM18 33h1v1h-1Z" data-n="hongguo-favicon-color-ffcbaeff"/><path fill="#fd8435" d="M15 23h1v1h-1ZM16 24h2v1h-2ZM18 25h1v1h-1ZM23 32h1v1h-1ZM24 34h1v1h-1ZM24 35h1v1h-1ZM25 36h1v1h-1ZM25 37h1v1h-1ZM25 38h1v1h-1ZM25 39h1v1h-1Z" data-n="hongguo-favicon-color-fd8435ff"/><path fill="#fcd1b5" d="M23 23h1v1h-1ZM15 33h1v1h-1Z" data-n="hongguo-favicon-color-fcd1b5ff"/><path fill="#ff7728" d="M1 24h5v1h-5ZM0 25h1v1h-1ZM7 28h1v1h-1ZM20 34h2v1h-2ZM21 35h1v1h-1ZM21 36h1v1h-1ZM22 37h1v1h-1ZM22 38h1v1h-1ZM22 39h1v1h-1Z" data-n="hongguo-favicon-color-ff7728ff"/><path fill="#ffb38b" d="M6 24h1v1h-1ZM7 27h1v1h-1ZM9 30h1v1h-1ZM10 31h1v1h-1Z" data-n="hongguo-favicon-color-ffb38bff"/><path fill="#ff7325" d="M1 25h5v1h-5ZM0 26h2v1h-2ZM19 34h1v1h-1ZM20 35h1v1h-1ZM20 36h1v1h-1ZM21 37h1v1h-1ZM21 38h1v1h-1ZM21 39h1v1h-1Z" data-n="hongguo-favicon-color-ff7325ff"/><path fill="#ff8e51" d="M6 25h1v1h-1ZM8 29h1v1h-1Z" data-n="hongguo-favicon-color-ff8e51ff"/><path fill="#ffd4bb" d="M14 25h1v1h-1ZM17 33h1v1h-1Z" data-n="hongguo-favicon-color-ffd4bbff"/><path fill="#fda366" d="M19 25h1v1h-1ZM22 32h1v1h-1Z" data-n="hongguo-favicon-color-fda366ff"/><path fill="#d1c997" d="M32 25h1v1h-1ZM36 30h1v1h-1ZM36 31h1v1h-1ZM36 32h1v1h-1Z" data-n="hongguo-favicon-color-d1c997ff"/><path fill="#c5c087" d="M33 25h1v1h-1ZM33 26h1v1h-1ZM33 27h1v1h-1Z" data-n="hongguo-favicon-color-c5c087ff"/><path fill="#bdc793" d="M34 25h1v1h-1ZM34 26h2v1h-2ZM35 27h1v1h-1Z" data-n="hongguo-favicon-color-bdc793ff"/><path fill="#ff7022" d="M2 26h5v1h-5ZM0 27h1v1h-1ZM19 35h1v1h-1ZM19 36h1v1h-1ZM20 37h1v1h-1ZM20 38h1v1h-1ZM20 39h1v1h-1Z" data-n="hongguo-favicon-color-ff7022ff"/><path fill="#dcc591" d="M31 26h1v1h-1ZM36 33h1v1h-1ZM36 34h1v1h-1Z" data-n="hongguo-favicon-color-dcc591ff"/><path fill="#d0bb7e" d="M32 26h1v1h-1ZM32 27h1v1h-1ZM33 28h1v1h-1ZM33 29h1v1h-1Z" data-n="hongguo-favicon-color-d0bb7eff"/><path fill="#ff6e21" d="M1 27h2v1h-2ZM18 34h1v1h-1ZM19 37h1v1h-1Z" data-n="hongguo-favicon-color-ff6e21ff"/><path fill="#ff6c1f" d="M3 27h4v1h-4ZM0 28h3v1h-3ZM17 34h1v1h-1ZM18 35h1v1h-1ZM18 36h1v1h-1ZM19 38h1v1h-1ZM19 39h1v1h-1Z" data-n="hongguo-favicon-color-ff6c1fff"/><path fill="#c9c38d" d="M34 27h1v1h-1ZM34 28h1v1h-1ZM35 29h1v1h-1Z" data-n="hongguo-favicon-color-c9c38dff"/><path fill="#ff691c" d="M3 28h4v1h-4ZM0 29h3v1h-3ZM16 34h1v1h-1ZM17 35h1v1h-1ZM17 36h1v1h-1ZM18 37h1v1h-1ZM18 38h1v1h-1ZM18 39h1v1h-1Z" data-n="hongguo-favicon-color-ff691cff"/><path fill="#e0af6c" d="M30 28h1v1h-1ZM31 29h1v1h-1ZM31 30h1v1h-1ZM32 31h1v1h-1ZM32 32h1v1h-1Z" data-n="hongguo-favicon-color-e0af6cff"/><path fill="#d9b87a" d="M32 28h1v1h-1ZM33 30h1v1h-1ZM33 31h1v1h-1Z" data-n="hongguo-favicon-color-d9b87aff"/><path fill="#c6c897" d="M35 28h1v1h-1ZM36 29h1v1h-1Z" data-n="hongguo-favicon-color-c6c897ff"/><path fill="#bed3aa" d="M37 28h2v1h-2ZM38 29h1v1h-1Z" data-n="hongguo-favicon-color-bed3aaff"/><path fill="#ff671a" d="M3 29h5v1h-5ZM0 30h2v1h-2ZM15 34h1v1h-1ZM16 35h1v1h-1ZM16 36h1v1h-1ZM17 37h1v1h-1ZM17 38h1v1h-1ZM17 39h1v1h-1Z" data-n="hongguo-favicon-color-ff671aff"/><path fill="#e5aa66" d="M30 29h1v1h-1ZM30 30h1v1h-1ZM31 31h1v1h-1ZM31 32h1v1h-1Z" data-n="hongguo-favicon-color-e5aa66ff"/><path fill="#d1c28b" d="M34 29h1v1h-1ZM35 30h1v1h-1ZM35 31h1v1h-1Z" data-n="hongguo-favicon-color-d1c28bff"/><path fill="#ff6419" d="M2 30h7v1h-7ZM0 31h1v1h-1ZM14 34h1v1h-1ZM15 35h1v1h-1ZM16 37h1v1h-1ZM16 38h1v1h-1Z" data-n="hongguo-favicon-color-ff6419ff"/><path fill="#f5a35c" d="M26 30h1v1h-1ZM31 36h1v1h-1ZM31 37h1v1h-1ZM31 38h1v1h-1ZM31 39h1v1h-1Z" data-n="hongguo-favicon-color-f5a35cff"/><path fill="#d8bd83" d="M34 30h1v1h-1ZM34 31h1v1h-1ZM34 32h1v1h-1Z" data-n="hongguo-favicon-color-d8bd83ff"/><path fill="#c9d4aa" d="M38 30h1v1h-1ZM38 31h1v1h-1Z" data-n="hongguo-favicon-color-c9d4aaff"/><path fill="#ff6217" d="M1 31h9v1h-9ZM1 32h1v1h-1ZM10 32h1v1h-1ZM11 33h2v1h-2ZM13 34h1v1h-1ZM14 35h1v1h-1ZM14 36h2v1h-2ZM15 37h1v1h-1ZM15 38h1v1h-1ZM16 39h1v1h-1Z" data-n="hongguo-favicon-color-ff6217ff"/><path fill="#f79448" d="M26 31h1v1h-1ZM27 32h1v1h-1ZM27 33h1v1h-1ZM27 34h1v1h-1ZM28 35h1v1h-1ZM28 36h1v1h-1ZM28 37h1v1h-1Z" data-n="hongguo-favicon-color-f79448ff"/><path fill="#ff6216" fill-opacity="0.93725490" d="M0 32h1v1h-1Z" data-n="hongguo-favicon-color-ff6216ef"/><path fill="#ff5f15" d="M2 32h8v1h-8ZM1 33h2v1h-2ZM8 33h3v1h-3ZM10 34h3v1h-3ZM12 35h2v1h-2ZM13 36h1v1h-1ZM13 37h2v1h-2ZM14 38h1v1h-1ZM14 39h2v1h-2Z" data-n="hongguo-favicon-color-ff5f15ff"/><path fill="#ff7735" d="M11 32h1v1h-1ZM13 33h1v1h-1Z" data-n="hongguo-favicon-color-ff7735ff"/><path fill="#f2a057" d="M29 32h1v1h-1ZM29 33h1v1h-1ZM30 34h1v1h-1ZM30 35h1v1h-1ZM30 36h1v1h-1Z" data-n="hongguo-favicon-color-f2a057ff"/><path fill="#eea55e" d="M30 32h1v1h-1ZM30 33h1v1h-1ZM31 35h1v1h-1Z" data-n="hongguo-favicon-color-eea55eff"/><path fill="#dbc18a" d="M35 32h1v1h-1ZM35 33h1v1h-1Z" data-n="hongguo-favicon-color-dbc18aff"/><path fill="#d7cc9c" d="M37 32h1v1h-1ZM37 33h1v1h-1ZM37 34h1v1h-1Z" data-n="hongguo-favicon-color-d7cc9cff"/><path fill="#ff5a11" fill-opacity="0.74901961" d="M0 33h1v1h-1ZM6 39h1v1h-1Z" data-n="hongguo-favicon-color-ff5a11bf"/><path fill="#ff5c12" d="M3 33h5v1h-5ZM1 34h9v1h-9ZM9 35h3v1h-3ZM11 36h2v1h-2ZM11 37h2v1h-2ZM12 38h2v1h-2ZM12 39h2v1h-2Z" data-n="hongguo-favicon-color-ff5c12ff"/><path fill="#ffa87e" d="M14 33h1v1h-1Z" data-n="hongguo-favicon-color-ffa87eff"/><path fill="#edaa65" d="M31 33h1v1h-1ZM31 34h1v1h-1ZM32 35h1v1h-1ZM32 36h1v1h-1Z" data-n="hongguo-favicon-color-edaa65ff"/><path fill="#e9ae6b" d="M32 33h1v1h-1ZM32 34h1v1h-1Z" data-n="hongguo-favicon-color-e9ae6bff"/><path fill="#d8d1a6" d="M38 33h1v1h-1ZM38 34h1v1h-1Z" data-n="hongguo-favicon-color-d8d1a6ff"/><path fill="#ff5e14" fill-opacity="0.50196078" d="M0 34h1v1h-1Z" data-n="hongguo-favicon-color-ff5e1480"/><path fill="#f59b50" d="M29 34h1v1h-1ZM29 35h1v1h-1ZM29 36h1v1h-1Z" data-n="hongguo-favicon-color-f59b50ff"/><path fill="#d7d5ad" fill-opacity="0.37647059" d="M39 34h1v1h-1Z" data-n="hongguo-favicon-color-d7d5ad60"/><path fill="#ff6010" fill-opacity="0.06274510" d="M0 35h1v1h-1Z" data-n="hongguo-favicon-color-ff601010"/><path fill="#ff580f" fill-opacity="0.93725490" d="M1 35h1v1h-1ZM7 39h1v1h-1Z" data-n="hongguo-favicon-color-ff580fef"/><path fill="#ff5910" d="M2 35h7v1h-7ZM9 36h2v1h-2ZM10 37h1v1h-1ZM11 38h1v1h-1ZM11 39h1v1h-1Z" data-n="hongguo-favicon-color-ff5910ff"/><path fill="#dfd0a4" fill-opacity="0.87450980" d="M38 35h1v1h-1Z" data-n="hongguo-favicon-color-dfd0a4df"/><path fill="#ff580f" fill-opacity="0.43921569" d="M1 36h1v1h-1ZM3 38h1v1h-1Z" data-n="hongguo-favicon-color-ff580f70"/><path fill="#ff580f" d="M2 36h7v1h-7ZM8 37h2v1h-2ZM9 38h2v1h-2ZM10 39h1v1h-1Z" data-n="hongguo-favicon-color-ff580fff"/><path fill="#eeb678" d="M34 36h1v1h-1ZM34 37h1v1h-1ZM34 38h1v1h-1Z" data-n="hongguo-favicon-color-eeb678ff"/><path fill="#ff5810" fill-opacity="0.50196078" d="M2 37h1v1h-1Z" data-n="hongguo-favicon-color-ff581080"/><path fill="#ff550d" d="M3 37h5v1h-5ZM5 38h4v1h-4ZM8 39h2v1h-2Z" data-n="hongguo-favicon-color-ff550dff"/><path fill="#f9984c" d="M29 37h1v1h-1ZM29 38h1v1h-1ZM29 39h1v1h-1Z" data-n="hongguo-favicon-color-f9984cff"/><path fill="#f79d54" d="M30 37h1v1h-1ZM30 38h1v1h-1ZM30 39h1v1h-1Z" data-n="hongguo-favicon-color-f79d54ff"/><path fill="#eac28c" d="M36 37h1v1h-1Z" data-n="hongguo-favicon-color-eac28cff"/><path fill="#e7c795" fill-opacity="0.50196078" d="M37 37h1v1h-1Z" data-n="hongguo-favicon-color-e7c79580"/><path fill="#ff560e" fill-opacity="0.87450980" d="M4 38h1v1h-1Z" data-n="hongguo-favicon-color-ff560edf"/><path fill="#efba7f" fill-opacity="0.47058824" d="M36 38h1v1h-1ZM34 39h1v1h-1Z" data-n="hongguo-favicon-color-efba7f78"/><path fill="#ff5810" fill-opacity="0.12549020" d="M4 39h1v1h-1Z" data-n="hongguo-favicon-color-ff581020"/><path fill="#ff550d" fill-opacity="0.37647059" d="M5 39h1v1h-1Z" data-n="hongguo-favicon-color-ff550d60"/><path fill="#f5a963" fill-opacity="0.93725490" d="M32 39h1v1h-1Z" data-n="hongguo-favicon-color-f5a963ef"/><path fill="#f4af6c" fill-opacity="0.74901961" d="M33 39h1v1h-1Z" data-n="hongguo-favicon-color-f4af6cbf"/></svg>',
};

/**
 * 红果（hongguoduanju.com）网页版短剧订阅。
 *
 * 搜索与分集都来自官网公开页面/接口，不需要登录或签名：
 * - 搜索：`/api/search/result`
 * - 分集：服务端渲染页 `_ROUTER_DATA` 里的 `seriesDetail.vid_list`
 * - 播放：`/player/:series_id/:vid` 页内 JSON-LD VideoObject.contentUrl（官网公开的
 *   360p MP4）。付费/加密集官网只返回预览片段或不提供直链，此时播放路由明确报错。
 *
 * 播放通过 `/hongguo/video/:series_id/:vid` 媒体代理转发，并带上官网 Referer；
 * 该路由声明 allowed_hosts，由 FindRSS 的媒体代理按 Range 流式返回。
 */
export class HongguoDramaRSS extends RSSScript {
  static SITE = "https://hongguoduanju.com";
  static WEB_UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
  static WEB_REFERER = "https://hongguoduanju.com/";
  static ID_PATTERN = /^\d{1,30}$/;
  static SERIES_PATTERN = /^\d{6,}$/;

  static headers() {
    return {
      "User-Agent": HongguoDramaRSS.WEB_UA,
      Referer: HongguoDramaRSS.WEB_REFERER,
      "Accept-Language": "zh-CN,zh;q=0.9",
    };
  }

  static clean_text(value) {
    return String(value ?? "")
      .replace(/<[^>]*>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
  }

  static clean_url(value) {
    return String(value ?? "")
      .replace(/\\u002F/gi, "/")
      .replace(/\\\//g, "/")
      .replace(/\\u0026/gi, "&")
      .replace(/&amp;/g, "&")
      .trim();
  }

  /** 官网封面/媒体地址只接受 https 绝对地址。 */
  static https_url(value) {
    const url = HongguoDramaRSS.clean_url(value);
    return /^https:\/\/[^\s"'<>]+$/i.test(url) ? url : "";
  }

  static async request_text(ctx, url) {
    const result = await utils.request_text(ctx, url, {
      headers: HongguoDramaRSS.headers(),
      timeout_ms: 10000,
    });
    if (result.error) throw result.error;
    return String(result.data ?? "");
  }

  /** 读取 Next.js 服务端渲染页里的 `window._ROUTER_DATA`。 */
  static router_data(html) {
    const text = String(html ?? "");
    const match = /(?:window\.)?_ROUTER_DATA\s*=\s*(\{)/.exec(text);
    if (!match) return null;
    const start = match.index + match[0].length - 1;
    let depth = 0;
    let quoted = false;
    let escaped = false;
    for (let index = start; index < text.length; index += 1) {
      const character = text[index];
      if (quoted) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') quoted = false;
      } else if (character === '"') quoted = true;
      else if (character === "{") depth += 1;
      else if (character === "}" && --depth === 0) {
        try {
          return JSON.parse(text.slice(start, index + 1));
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /** 分集页与详情页共用的 loader 对象，必须与请求的剧集一致。 */
  static page_for_series(html, series_id) {
    const loader_data = HongguoDramaRSS.router_data(html)?.loaderData;
    if (!loader_data || typeof loader_data !== "object") return null;
    for (const page of Object.values(loader_data)) {
      if (!page || typeof page !== "object" || page.isSuccess === false)
        continue;
      const detail = page.seriesDetail;
      if (!detail || typeof detail !== "object") continue;
      if (String(detail.series_id ?? "") !== series_id) continue;
      if (!Array.isArray(detail.vid_list)) continue;
      return page;
    }
    return null;
  }

  static page_for_episode(html, series_id, vid) {
    const loader_data = HongguoDramaRSS.router_data(html)?.loaderData;
    if (!loader_data || typeof loader_data !== "object") return null;
    for (const page of Object.values(loader_data)) {
      if (!page || typeof page !== "object" || page.isSuccess === false)
        continue;
      if (String(page.vid ?? "") !== vid) continue;
      if (String(page.series_id ?? "") !== series_id) continue;
      if (String(page.seriesDetail?.series_id ?? series_id) !== series_id)
        continue;
      return page;
    }
    return null;
  }

  static json_ld(html) {
    const values = [];
    for (const script of String(html ?? "").matchAll(
      /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi,
    )) {
      if (!/application\/ld\+json/i.test(script[1])) continue;
      try {
        const value = JSON.parse(script[2]);
        if (Array.isArray(value)) values.push(...value);
        else if (value && typeof value === "object") values.push(value);
      } catch {
        // 单个损坏的 JSON-LD 不影响其他候选。
      }
    }
    return values;
  }

  /** 只接受当前剧集、当前分集在官网上公开的 MP4 直链。 */
  static media_url(html, series_id, vid) {
    for (const value of HongguoDramaRSS.json_ld(html)) {
      if (value["@type"] !== "VideoObject") continue;
      if (
        value.url &&
        !HongguoDramaRSS.player_link_matches(value.url, series_id, vid)
      )
        continue;
      if (
        value["@id"] &&
        !HongguoDramaRSS.player_link_matches(value["@id"], series_id, vid)
      )
        continue;
      const url = HongguoDramaRSS.clean_url(value.contentUrl);
      const match =
        /^https:\/\/hongguoduanju\.com\/video\/public\/(\d{1,30})\/[^/?#\s]+\.mp4(?:\?[^\s#]*)?$/i.exec(
          url,
        );
      if (match && match[1] === vid) return url;
    }
    return "";
  }

  static player_link_matches(value, series_id, vid) {
    const match =
      /^https:\/\/hongguoduanju\.com\/player\/(\d{1,30})(?:\/(\d{1,30}))?(?:[/?#]|$)/i.exec(
        String(value ?? "").trim(),
      );
    return (
      Boolean(match) &&
      match[1] === series_id &&
      (!match[2] || match[2] === vid)
    );
  }

  static async series_page(ctx, series_id) {
    const urls = [
      `${HongguoDramaRSS.SITE}/player/${encodeURIComponent(series_id)}`,
      `${HongguoDramaRSS.SITE}/detail?series_id=${encodeURIComponent(series_id)}`,
    ];
    let failure = null;
    for (const url of urls) {
      try {
        const html = await HongguoDramaRSS.request_text(ctx, url);
        if (HongguoDramaRSS.page_for_series(html, series_id)) return html;
      } catch (error) {
        failure = error;
      }
    }
    if (failure) throw failure;
    return "";
  }

  static build_series_feed(page, series_id, public_origin) {
    const detail = page.seriesDetail;
    const title =
      HongguoDramaRSS.clean_text(detail.series_name) || "未命名短剧";
    const cover = HongguoDramaRSS.https_url(detail.series_cover);
    const description = HongguoDramaRSS.clean_text(detail.series_intro);
    const tags = Array.isArray(detail.tags)
      ? detail.tags.map(HongguoDramaRSS.clean_text).filter(Boolean).slice(0, 6)
      : [];
    const origin = String(public_origin ?? "").replace(/\/+$/, "");
    const vids = detail.vid_list.map(String);
    // 无逐集发布时间，按集数倒序输出，最新一集排在前面（排序器对无时间条目保持原序）。
    const items = vids.map(function (vid, index) {
      const episode = index + 1;
      const player_link =
        HongguoDramaRSS.SITE +
        "/player/" +
        encodeURIComponent(series_id) +
        "/" +
        encodeURIComponent(vid);
      const video_url = origin
        ? origin +
          "/hongguo/video/" +
          encodeURIComponent(series_id) +
          "/" +
          encodeURIComponent(vid)
        : "";
      const content =
        video_url === ""
          ? undefined
          : '<video controls preload="none" playsinline' +
            (cover ? ' poster="' + utils.escape_html(cover) + '"' : "") +
            ' src="' +
            utils.escape_html(video_url) +
            '"></video>' +
            '<p><a href="' +
            utils.escape_html(player_link) +
            '">在红果官网播放第 ' +
            episode +
            " 集</a></p>";
      return {
        id: "hongguo:" + series_id + ":" + vid,
        title: title + " 第" + episode + "集",
        link: player_link,
        description: "第 " + episode + " 集",
        ...(cover ? { image: cover } : {}),
        type: "video",
        ...(video_url === ""
          ? {}
          : {
              enclosure: { url: video_url, type: "video/mp4" },
              content,
            }),
        ...(tags.length ? { categories: tags } : {}),
      };
    });
    items.reverse();
    return {
      id: "hongguo:series:" + series_id,
      title,
      link:
        HongguoDramaRSS.SITE +
        "/detail?series_id=" +
        encodeURIComponent(series_id),
      description: description || title + " 短剧分集",
      language: "zh-cn",
      ...(cover ? { image: cover } : {}),
      items,
      extra: HongguoDramaRSS.feed_extra(),
    };
  }

  static feed_extra() {
    return {
      view: "video",
      show_thumbnails: true,
      proxy_images: true,
      headers: { referer: HongguoDramaRSS.WEB_REFERER },
      tags: ["短剧", "红果短剧"],
      category: ["短剧"],
    };
  }

  static parse_search(payload, keyword) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw Object.assign(new Error("红果搜索返回了无效数据"), {
        code: "UPSTREAM_INVALID_RESPONSE",
      });
    }
    if (!Array.isArray(payload.searchList)) {
      throw Object.assign(new Error("红果搜索回包缺少结果列表"), {
        code: "UPSTREAM_INVALID_RESPONSE",
      });
    }
    const seen = new Set();
    const items = [];
    for (const entry of payload.searchList) {
      const video =
        entry?.video_data &&
        typeof entry.video_data === "object" &&
        Object.keys(entry.video_data).length
          ? entry.video_data
          : entry;
      const series_id = String(
        video?.series_id ?? entry?.series_id ?? entry?.keyword ?? "",
      ).trim();
      const title = HongguoDramaRSS.clean_text(
        video?.series_title ??
          video?.series_name ??
          entry?.name ??
          video?.title,
      );
      if (
        !HongguoDramaRSS.SERIES_PATTERN.test(series_id) ||
        !title ||
        seen.has(series_id)
      )
        continue;
      seen.add(series_id);
      const cover = HongguoDramaRSS.https_url(
        video?.series_cover ?? video?.cover,
      );
      const intro = HongguoDramaRSS.clean_text(video?.series_intro);
      const published = RSSScript.timestamp(
        Number(video?.create_time),
      ).data;
      const tags = Array.isArray(video?.category_list)
        ? video.category_list
            .map((item) => HongguoDramaRSS.clean_text(item?.name))
            .filter(Boolean)
            .slice(0, 6)
        : [];
      items.push({
        id: "hongguo:series:" + series_id,
        title,
        link:
          HongguoDramaRSS.SITE +
          "/detail?series_id=" +
          encodeURIComponent(series_id),
        description: intro || title,
        ...(cover ? { image: cover } : {}),
        ...(published ? { published } : {}),
        ...(tags.length ? { categories: tags } : {}),
      });
    }
    return items;
  }

  async fetch(ctx) {
    try {
      const series_id = String(ctx.params?.series_id ?? "").trim();
      if (!HongguoDramaRSS.ID_PATTERN.test(series_id)) {
        return Result.Err("series_id 需为数字剧集编号", "INVALID_PARAMETER");
      }
      const html = await HongguoDramaRSS.series_page(ctx, series_id);
      const page = HongguoDramaRSS.page_for_series(html, series_id);
      if (!page) {
        return Result.Err(
          "红果页面未返回该剧集的分集数据，可能已下架或页面结构已变化",
          "UPSTREAM_INVALID_RESPONSE",
        );
      }
      if (!page.seriesDetail.vid_list.length) {
        return Result.Err("该短剧暂无分集", "UPSTREAM_INVALID_RESPONSE");
      }
      return Result.Ok(
        HongguoDramaRSS.build_series_feed(page, series_id, ctx.public_origin),
      );
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }

  static async search(ctx) {
    try {
      const keyword = HongguoDramaRSS.clean_text(ctx.params?.keyword ?? "");
      if (
        keyword === "" ||
        keyword.length > 80 ||
        /[\u0000-\u001f\u007f]/.test(keyword)
      ) {
        return Result.Err("搜索词需为 1 至 80 字的文本", "INVALID_PARAMETER");
      }
      const page = Number(ctx.query?.page ?? 1);
      if (!Number.isInteger(page) || page < 1 || page > 50) {
        return Result.Err("页码需为 1 至 50 的整数", "INVALID_PARAMETER");
      }
      const url =
        HongguoDramaRSS.SITE +
        "/api/search/result?aid=8662&query=" +
        encodeURIComponent(keyword) +
        "&page=" +
        page;
      const result = await utils.request_json(ctx, url, {
        headers: HongguoDramaRSS.headers(),
        timeout_ms: 10000,
      });
      if (result.error) throw result.error;
      return Result.Ok({
        id: "hongguo:search:" + keyword + ":" + page,
        title: "红果短剧搜索：" + keyword,
        link:
          HongguoDramaRSS.SITE + "/search?query=" + encodeURIComponent(keyword),
        description: "搜索“" + keyword + "”的第 " + page + " 页结果",
        language: "zh-cn",
        items: HongguoDramaRSS.parse_search(result.data, keyword),
        extra: {
          show_thumbnails: true,
          proxy_images: true,
          headers: { referer: HongguoDramaRSS.WEB_REFERER },
          tags: ["短剧", "红果短剧"],
          category: ["短剧"],
        },
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }

  static async media(ctx) {
    try {
      const series_id = String(ctx.params?.series_id ?? "").trim();
      const vid = String(ctx.params?.vid ?? "").trim();
      if (!HongguoDramaRSS.ID_PATTERN.test(series_id)) {
        return Result.Err("series_id 需为数字剧集编号", "INVALID_PARAMETER");
      }
      if (!HongguoDramaRSS.ID_PATTERN.test(vid)) {
        return Result.Err("vid 需为数字分集编号", "INVALID_PARAMETER");
      }
      const html = await HongguoDramaRSS.request_text(
        ctx,
        HongguoDramaRSS.SITE +
          "/player/" +
          encodeURIComponent(series_id) +
          "/" +
          encodeURIComponent(vid),
      );
      if (!HongguoDramaRSS.page_for_episode(html, series_id, vid)) {
        return Result.Err(
          "红果播放页与该剧集不匹配，可能已下架或页面结构已变化",
          "UPSTREAM_INVALID_RESPONSE",
        );
      }
      const url = HongguoDramaRSS.media_url(html, series_id, vid);
      if (!url) {
        return Result.Err(
          "该集在官网未提供可直接播放的地址（付费集或仅预览）",
          "UPSTREAM_INVALID_RESPONSE",
        );
      }
      return Result.Ok({
        kind: "video",
        url,
        headers: {
          referer: HongguoDramaRSS.WEB_REFERER,
          "user-agent": HongguoDramaRSS.WEB_UA,
        },
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }
}

const script = new HongguoDramaRSS();
export const routes = [
  {
    name: "红果短剧分集",
    path: "/hongguo/series/:series_id",
    url: "hongguoduanju.com",
    maintainers: ["findrss"],
    example: "/hongguo/series/7688352674999176254",
    parameters: {
      series_id: "红果短剧 detail 页 series_id，数字编号",
    },
    description:
      "订阅指定短剧的全部分集；条目按集数倒序，enclosure 指向媒体代理路由，content 内嵌播放器与官网播放页链接",
    handler: (ctx) => script.run(ctx),
  },
  {
    name: "红果短剧搜索",
    path: "/hongguo/search/:keyword",
    url: "hongguoduanju.com",
    maintainers: ["findrss"],
    example: "/hongguo/search/热播",
    parameters: {
      keyword: "搜索关键词，1 至 80 字",
      page: "结果页码，1 至 50，默认 1",
    },
    description: "按关键词搜索红果短剧并输出剧集列表卡片",
    handler: (ctx) => HongguoDramaRSS.search(ctx),
  },
  {
    name: "红果短剧播放",
    path: "/hongguo/video/:series_id/:vid",
    public: true,
    allowed_hosts: ["hongguoduanju.com"],
    url: "hongguoduanju.com",
    maintainers: ["findrss"],
    example: "/hongguo/video/7688352674999176254/7688396347107445822",
    parameters: {
      series_id: "红果短剧 series_id",
      vid: "分集 vid",
    },
    description:
      "解析官网公开 MP4 直链并通过媒体代理按 Range 转发；付费或仅预览的分集会明确返回错误",
    handler: (ctx) => HongguoDramaRSS.media(ctx),
  },
];
