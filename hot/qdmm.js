/** HOT */
import { utils } from "@findrss/util";
import { HotRankScript, Result } from "@findrss/core";

export const version = "1.0.0";
export const category = "小说";
export const order = 375;
// Favicon: https://imgservices-1252317822.image.myqcloud.com/coco/s08102023/6d673b1a.u3d157.ico
export const platform = {
  name: "起点女生网",
  icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" shape-rendering=\"crispEdges\" role=\"img\" aria-label=\"起点女生网\" data-n=\"qdmm-platform-icon\"><path fill=\"#ff6169\" fill-opacity=\"0.031373\" d=\"M2 0h1v1h-1ZM29 0h1v1h-1ZM0 2h1v1h-1ZM31 2h1v1h-1ZM0 29h1v1h-1ZM31 29h1v1h-1ZM2 31h1v1h-1ZM29 31h1v1h-1Z\" data-n=\"qdmm-color-ff6169-8\"/><path fill=\"#ff6169\" fill-opacity=\"0.439216\" d=\"M3 0h1v1h-1ZM28 0h1v1h-1ZM0 3h1v1h-1ZM31 3h1v1h-1ZM0 28h1v1h-1ZM31 28h1v1h-1ZM3 31h1v1h-1ZM28 31h1v1h-1Z\" data-n=\"qdmm-color-ff6169-112\"/><path fill=\"#ff6169\" fill-opacity=\"0.796078\" d=\"M4 0h1v1h-1ZM27 0h1v1h-1ZM0 4h1v1h-1ZM31 4h1v1h-1ZM0 27h1v1h-1ZM31 27h1v1h-1ZM4 31h1v1h-1ZM27 31h1v1h-1Z\" data-n=\"qdmm-color-ff6169-203\"/><path fill=\"#ff6169\" fill-opacity=\"0.968627\" d=\"M5 0h1v1h-1ZM26 0h1v1h-1ZM0 5h1v1h-1ZM31 5h1v1h-1ZM0 26h1v1h-1ZM31 26h1v1h-1ZM5 31h1v1h-1ZM26 31h1v1h-1Z\" data-n=\"qdmm-color-ff6169-247\"/><path fill=\"#ff6169\" d=\"M6 0h20v1h-20ZM3 1h26v1h-26ZM2 2h12v1h-12ZM18 2h12v1h-12ZM1 3h12v1h-12ZM18 3h13v1h-13ZM1 4h12v1h-12ZM18 4h2v1h-2ZM29 4h2v1h-2ZM1 5h11v1h-11ZM18 5h1v1h-1ZM30 5h1v1h-1ZM0 6h12v1h-12ZM17 6h1v1h-1ZM30 6h2v1h-2ZM0 7h12v1h-12ZM20 7h12v1h-12ZM0 8h11v1h-11ZM19 8h13v1h-13ZM0 9h11v1h-11ZM18 9h14v1h-14ZM0 10h4v1h-4ZM8 10h3v1h-3ZM25 10h7v1h-7ZM0 11h2v1h-2ZM9 11h2v1h-2ZM26 11h6v1h-6ZM0 12h2v1h-2ZM10 12h1v1h-1ZM26 12h6v1h-6ZM0 13h2v1h-2ZM10 13h1v1h-1ZM19 13h3v1h-3ZM27 13h5v1h-5ZM0 14h2v1h-2ZM10 14h2v1h-2ZM19 14h4v1h-4ZM27 14h5v1h-5ZM0 15h2v1h-2ZM11 15h1v1h-1ZM15 15h1v1h-1ZM18 15h3v1h-3ZM27 15h5v1h-5ZM0 16h2v1h-2ZM11 16h1v1h-1ZM15 16h1v1h-1ZM18 16h2v1h-2ZM27 16h5v1h-5ZM0 17h4v1h-4ZM7 17h2v1h-2ZM11 17h1v1h-1ZM18 17h1v1h-1ZM26 17h6v1h-6ZM0 18h9v1h-9ZM12 18h1v1h-1ZM26 18h6v1h-6ZM0 19h9v1h-9ZM12 19h1v1h-1ZM16 19h1v1h-1ZM19 19h1v1h-1ZM25 19h7v1h-7ZM0 20h10v1h-10ZM13 20h1v1h-1ZM20 20h12v1h-12ZM0 21h10v1h-10ZM13 21h1v1h-1ZM20 21h12v1h-12ZM0 22h11v1h-11ZM14 22h1v1h-1ZM18 22h1v1h-1ZM21 22h11v1h-11ZM0 23h12v1h-12ZM15 23h1v1h-1ZM19 23h13v1h-13ZM0 24h13v1h-13ZM16 24h1v1h-1ZM20 24h12v1h-12ZM0 25h14v1h-14ZM17 25h1v1h-1ZM21 25h11v1h-11ZM1 26h14v1h-14ZM19 26h1v1h-1ZM22 26h9v1h-9ZM1 27h16v1h-16ZM20 27h11v1h-11ZM1 28h17v1h-17ZM22 28h9v1h-9ZM2 29h19v1h-19ZM24 29h6v1h-6ZM3 30h26v1h-26ZM6 31h20v1h-20Z\" data-n=\"qdmm-color-ff6169-255\"/><path fill=\"#ff6169\" fill-opacity=\"0.109804\" d=\"M1 1h1v1h-1ZM30 1h1v1h-1ZM1 30h1v1h-1ZM30 30h1v1h-1Z\" data-n=\"qdmm-color-ff6169-28\"/><path fill=\"#ff6169\" fill-opacity=\"0.827451\" d=\"M2 1h1v1h-1ZM29 1h1v1h-1ZM1 2h1v1h-1ZM30 2h1v1h-1ZM1 29h1v1h-1ZM30 29h1v1h-1ZM2 30h1v1h-1ZM29 30h1v1h-1Z\" data-n=\"qdmm-color-ff6169-211\"/><path fill=\"#ff646b\" d=\"M14 2h1v1h-1ZM20 4h1v1h-1Z\" data-n=\"qdmm-color-ff646b-255\"/><path fill=\"#ffa9ae\" d=\"M15 2h1v1h-1ZM18 19h1v1h-1Z\" data-n=\"qdmm-color-ffa9ae-255\"/><path fill=\"#ffc7ca\" d=\"M16 2h1v1h-1ZM16 14h1v1h-1ZM17 22h1v1h-1Z\" data-n=\"qdmm-color-ffc7ca-255\"/><path fill=\"#ff6b72\" d=\"M17 2h1v1h-1ZM18 26h1v1h-1Z\" data-n=\"qdmm-color-ff6b72-255\"/><path fill=\"#ff636b\" d=\"M13 3h1v1h-1ZM17 10h1v1h-1ZM2 11h1v1h-1ZM25 11h1v1h-1ZM10 15h1v1h-1ZM2 16h1v1h-1Z\" data-n=\"qdmm-color-ff636b-255\"/><path fill=\"#ffd2d4\" d=\"M14 3h1v1h-1Z\" data-n=\"qdmm-color-ffd2d4-255\"/><path fill=\"#ffffff\" d=\"M15 3h2v1h-2ZM14 4h3v1h-3ZM14 5h2v1h-2ZM21 5h7v1h-7ZM13 6h3v1h-3ZM13 7h2v1h-2ZM13 8h2v1h-2ZM12 9h2v1h-2ZM12 10h2v1h-2ZM4 11h3v1h-3ZM12 11h2v1h-2ZM19 11h5v1h-5ZM3 12h2v1h-2ZM12 12h2v1h-2ZM18 12h1v1h-1ZM23 12h2v1h-2ZM3 13h2v1h-2ZM12 13h2v1h-2ZM17 13h1v1h-1ZM24 13h1v1h-1ZM3 14h4v1h-4ZM13 14h1v1h-1ZM24 14h2v1h-2ZM3 15h4v1h-4ZM13 15h1v1h-1ZM23 15h3v1h-3ZM5 16h1v1h-1ZM13 16h1v1h-1ZM22 16h3v1h-3ZM21 17h4v1h-4ZM14 18h1v1h-1ZM21 18h3v1h-3ZM15 20h1v1h-1Z\" data-n=\"qdmm-color-ffffff-255\"/><path fill=\"#ffa3a8\" d=\"M17 3h1v1h-1ZM17 7h1v1h-1ZM15 12h1v1h-1Z\" data-n=\"qdmm-color-ffa3a8-255\"/><path fill=\"#ffadb1\" d=\"M13 4h1v1h-1Z\" data-n=\"qdmm-color-ffadb1-255\"/><path fill=\"#ffa9ad\" d=\"M17 4h1v1h-1ZM18 23h1v1h-1Z\" data-n=\"qdmm-color-ffa9ad-255\"/><path fill=\"#ff969b\" d=\"M21 4h1v1h-1ZM5 13h1v1h-1Z\" data-n=\"qdmm-color-ff969b-255\"/><path fill=\"#ffc3c6\" d=\"M22 4h1v1h-1ZM19 10h1v1h-1Z\" data-n=\"qdmm-color-ffc3c6-255\"/><path fill=\"#ffdee0\" d=\"M23 4h1v1h-1ZM18 24h1v1h-1Z\" data-n=\"qdmm-color-ffdee0-255\"/><path fill=\"#ffeeef\" d=\"M24 4h1v1h-1ZM26 4h1v1h-1Z\" data-n=\"qdmm-color-ffeeef-255\"/><path fill=\"#fff4f4\" d=\"M25 4h1v1h-1ZM14 24h1v1h-1Z\" data-n=\"qdmm-color-fff4f4-255\"/><path fill=\"#ffd8da\" d=\"M27 4h1v1h-1Z\" data-n=\"qdmm-color-ffd8da-255\"/><path fill=\"#ffa1a6\" d=\"M28 4h1v1h-1ZM5 10h1v1h-1ZM23 10h1v1h-1ZM15 18h1v1h-1ZM19 28h1v1h-1Z\" data-n=\"qdmm-color-ffa1a6-255\"/><path fill=\"#ff7077\" d=\"M12 5h1v1h-1ZM22 13h1v1h-1Z\" data-n=\"qdmm-color-ff7077-255\"/><path fill=\"#fff9f9\" d=\"M13 5h1v1h-1ZM18 7h1v1h-1Z\" data-n=\"qdmm-color-fff9f9-255\"/><path fill=\"#fffdfd\" d=\"M16 5h1v1h-1ZM8 13h1v1h-1ZM9 16h1v1h-1Z\" data-n=\"qdmm-color-fffdfd-255\"/><path fill=\"#ff787f\" d=\"M17 5h1v1h-1ZM11 22h1v1h-1Z\" data-n=\"qdmm-color-ff787f-255\"/><path fill=\"#ff8d93\" d=\"M19 5h1v1h-1ZM11 10h1v1h-1Z\" data-n=\"qdmm-color-ff8d93-255\"/><path fill=\"#ffe9ea\" d=\"M20 5h1v1h-1Z\" data-n=\"qdmm-color-ffe9ea-255\"/><path fill=\"#fffefe\" d=\"M28 5h1v1h-1ZM19 6h1v1h-1ZM12 8h1v1h-1ZM14 9h1v1h-1ZM21 16h1v1h-1ZM20 17h1v1h-1Z\" data-n=\"qdmm-color-fffefe-255\"/><path fill=\"#ff7279\" d=\"M29 5h1v1h-1ZM11 13h1v1h-1ZM20 22h1v1h-1ZM17 24h1v1h-1Z\" data-n=\"qdmm-color-ff7279-255\"/><path fill=\"#ffafb3\" d=\"M12 6h1v1h-1Z\" data-n=\"qdmm-color-ffafb3-255\"/><path fill=\"#ffc4c7\" d=\"M16 6h1v1h-1Z\" data-n=\"qdmm-color-ffc4c7-255\"/><path fill=\"#ffacb0\" d=\"M18 6h1v1h-1ZM14 12h1v1h-1ZM22 15h1v1h-1Z\" data-n=\"qdmm-color-ffacb0-255\"/><path fill=\"#ffddde\" d=\"M20 6h1v1h-1ZM14 16h1v1h-1Z\" data-n=\"qdmm-color-ffddde-255\"/><path fill=\"#ffa5a9\" d=\"M21 6h1v1h-1ZM25 6h1v1h-1Z\" data-n=\"qdmm-color-ffa5a9-255\"/><path fill=\"#ff878d\" d=\"M22 6h1v1h-1Z\" data-n=\"qdmm-color-ff878d-255\"/><path fill=\"#ff7d84\" d=\"M23 6h1v1h-1Z\" data-n=\"qdmm-color-ff7d84-255\"/><path fill=\"#ff868c\" d=\"M24 6h1v1h-1ZM17 11h1v1h-1Z\" data-n=\"qdmm-color-ff868c-255\"/><path fill=\"#ffcdd0\" d=\"M26 6h1v1h-1ZM3 11h1v1h-1Z\" data-n=\"qdmm-color-ffcdd0-255\"/><path fill=\"#ffe0e1\" d=\"M27 6h1v1h-1Z\" data-n=\"qdmm-color-ffe0e1-255\"/><path fill=\"#ffb8bc\" d=\"M28 6h1v1h-1ZM13 18h1v1h-1Z\" data-n=\"qdmm-color-ffb8bc-255\"/><path fill=\"#ff626a\" d=\"M29 6h1v1h-1ZM24 10h1v1h-1ZM11 18h1v1h-1ZM14 21h1v1h-1ZM23 29h1v1h-1Z\" data-n=\"qdmm-color-ff626a-255\"/><path fill=\"#ffe3e5\" d=\"M12 7h1v1h-1Z\" data-n=\"qdmm-color-ffe3e5-255\"/><path fill=\"#fffafa\" d=\"M15 7h1v1h-1ZM6 16h1v1h-1Z\" data-n=\"qdmm-color-fffafa-255\"/><path fill=\"#ff737a\" d=\"M16 7h1v1h-1ZM17 20h1v1h-1Z\" data-n=\"qdmm-color-ff737a-255\"/><path fill=\"#ff9a9f\" d=\"M19 7h1v1h-1ZM20 25h1v1h-1Z\" data-n=\"qdmm-color-ff9a9f-255\"/><path fill=\"#ff6a72\" d=\"M11 8h1v1h-1ZM15 10h1v1h-1ZM18 18h1v1h-1Z\" data-n=\"qdmm-color-ff6a72-255\"/><path fill=\"#ffbec1\" d=\"M15 8h1v1h-1ZM3 16h1v1h-1ZM25 17h1v1h-1Z\" data-n=\"qdmm-color-ffbec1-255\"/><path fill=\"#ff7980\" d=\"M16 8h1v1h-1ZM20 26h1v1h-1Z\" data-n=\"qdmm-color-ff7980-255\"/><path fill=\"#fff8f8\" d=\"M17 8h1v1h-1Z\" data-n=\"qdmm-color-fff8f8-255\"/><path fill=\"#ff8e94\" d=\"M18 8h1v1h-1ZM11 11h1v1h-1Z\" data-n=\"qdmm-color-ff8e94-255\"/><path fill=\"#ff8188\" d=\"M11 9h1v1h-1Z\" data-n=\"qdmm-color-ff8188-255\"/><path fill=\"#ff7c83\" d=\"M15 9h1v1h-1Z\" data-n=\"qdmm-color-ff7c83-255\"/><path fill=\"#ffc8cb\" d=\"M16 9h1v1h-1ZM7 14h1v1h-1Z\" data-n=\"qdmm-color-ffc8cb-255\"/><path fill=\"#ffabaf\" d=\"M17 9h1v1h-1ZM10 17h1v1h-1Z\" data-n=\"qdmm-color-ffabaf-255\"/><path fill=\"#ff858b\" d=\"M4 10h1v1h-1Z\" data-n=\"qdmm-color-ff858b-255\"/><path fill=\"#ff989d\" d=\"M6 10h1v1h-1ZM17 27h1v1h-1Z\" data-n=\"qdmm-color-ff989d-255\"/><path fill=\"#ff6a71\" d=\"M7 10h1v1h-1ZM15 14h1v1h-1Z\" data-n=\"qdmm-color-ff6a71-255\"/><path fill=\"#ffe7e8\" d=\"M14 10h1v1h-1ZM8 12h1v1h-1ZM10 18h1v1h-1Z\" data-n=\"qdmm-color-ffe7e8-255\"/><path fill=\"#ffe0e2\" d=\"M16 10h1v1h-1Z\" data-n=\"qdmm-color-ffe0e2-255\"/><path fill=\"#ff757c\" d=\"M18 10h1v1h-1Z\" data-n=\"qdmm-color-ff757c-255\"/><path fill=\"#fff1f1\" d=\"M20 10h1v1h-1ZM17 12h1v1h-1Z\" data-n=\"qdmm-color-fff1f1-255\"/><path fill=\"#fffbfb\" d=\"M21 10h1v1h-1ZM4 16h1v1h-1ZM25 16h1v1h-1Z\" data-n=\"qdmm-color-fffbfb-255\"/><path fill=\"#ffe2e3\" d=\"M22 10h1v1h-1ZM22 12h1v1h-1Z\" data-n=\"qdmm-color-ffe2e3-255\"/><path fill=\"#fff0f1\" d=\"M7 11h1v1h-1Z\" data-n=\"qdmm-color-fff0f1-255\"/><path fill=\"#ff7e84\" d=\"M8 11h1v1h-1ZM6 13h1v1h-1ZM22 29h1v1h-1Z\" data-n=\"qdmm-color-ff7e84-255\"/><path fill=\"#ffc2c5\" d=\"M14 11h1v1h-1Z\" data-n=\"qdmm-color-ffc2c5-255\"/><path fill=\"#ff9095\" d=\"M15 11h1v1h-1Z\" data-n=\"qdmm-color-ff9095-255\"/><path fill=\"#ff9ba0\" d=\"M16 11h1v1h-1ZM12 16h1v1h-1ZM19 24h1v1h-1Z\" data-n=\"qdmm-color-ff9ba0-255\"/><path fill=\"#fff5f6\" d=\"M18 11h1v1h-1ZM7 15h1v1h-1Z\" data-n=\"qdmm-color-fff5f6-255\"/><path fill=\"#ffcbce\" d=\"M24 11h1v1h-1ZM12 15h1v1h-1Z\" data-n=\"qdmm-color-ffcbce-255\"/><path fill=\"#ff9da2\" d=\"M2 12h1v1h-1ZM13 22h1v1h-1Z\" data-n=\"qdmm-color-ff9da2-255\"/><path fill=\"#ffc5c8\" d=\"M5 12h1v1h-1ZM21 19h1v1h-1Z\" data-n=\"qdmm-color-ffc5c8-255\"/><path fill=\"#ffa2a7\" d=\"M6 12h1v1h-1ZM2 15h1v1h-1Z\" data-n=\"qdmm-color-ffa2a7-255\"/><path fill=\"#ffeaeb\" d=\"M7 12h1v1h-1ZM16 22h1v1h-1Z\" data-n=\"qdmm-color-ffeaeb-255\"/><path fill=\"#ff646c\" d=\"M9 12h1v1h-1ZM18 14h1v1h-1ZM10 21h1v1h-1Z\" data-n=\"qdmm-color-ff646c-255\"/><path fill=\"#ff858c\" d=\"M11 12h1v1h-1Z\" data-n=\"qdmm-color-ff858c-255\"/><path fill=\"#ff7178\" d=\"M16 12h1v1h-1Z\" data-n=\"qdmm-color-ff7178-255\"/><path fill=\"#ffd1d4\" d=\"M19 12h1v1h-1ZM17 19h1v1h-1Z\" data-n=\"qdmm-color-ffd1d4-255\"/><path fill=\"#ff979c\" d=\"M20 12h1v1h-1ZM11 19h1v1h-1Z\" data-n=\"qdmm-color-ff979c-255\"/><path fill=\"#ff9ca1\" d=\"M21 12h1v1h-1ZM9 18h1v1h-1Z\" data-n=\"qdmm-color-ff9ca1-255\"/><path fill=\"#ffb3b7\" d=\"M25 12h1v1h-1ZM16 17h1v1h-1Z\" data-n=\"qdmm-color-ffb3b7-255\"/><path fill=\"#ffc9cc\" d=\"M2 13h1v1h-1ZM22 19h1v1h-1ZM17 26h1v1h-1Z\" data-n=\"qdmm-color-ffc9cc-255\"/><path fill=\"#ff7a81\" d=\"M7 13h1v1h-1Z\" data-n=\"qdmm-color-ff7a81-255\"/><path fill=\"#ff999e\" d=\"M9 13h1v1h-1Z\" data-n=\"qdmm-color-ff999e-255\"/><path fill=\"#ffa4a9\" d=\"M14 13h1v1h-1ZM23 19h1v1h-1Z\" data-n=\"qdmm-color-ffa4a9-255\"/><path fill=\"#ff8b91\" d=\"M15 13h1v1h-1Z\" data-n=\"qdmm-color-ff8b91-255\"/><path fill=\"#ffa2a6\" d=\"M16 13h1v1h-1Z\" data-n=\"qdmm-color-ffa2a6-255\"/><path fill=\"#ffbbbf\" d=\"M18 13h1v1h-1Z\" data-n=\"qdmm-color-ffbbbf-255\"/><path fill=\"#fffcfc\" d=\"M23 13h1v1h-1Z\" data-n=\"qdmm-color-fffcfc-255\"/><path fill=\"#fff9fa\" d=\"M25 13h1v1h-1ZM17 18h1v1h-1Z\" data-n=\"qdmm-color-fff9fa-255\"/><path fill=\"#ff6b73\" d=\"M26 13h1v1h-1Z\" data-n=\"qdmm-color-ff6b73-255\"/><path fill=\"#ffcccf\" d=\"M2 14h1v1h-1Z\" data-n=\"qdmm-color-ffcccf-255\"/><path fill=\"#ffd7d9\" d=\"M8 14h1v1h-1ZM9 17h1v1h-1ZM15 21h1v1h-1Z\" data-n=\"qdmm-color-ffd7d9-255\"/><path fill=\"#ffcfd1\" d=\"M9 14h1v1h-1Z\" data-n=\"qdmm-color-ffcfd1-255\"/><path fill=\"#fff2f3\" d=\"M12 14h1v1h-1Z\" data-n=\"qdmm-color-fff2f3-255\"/><path fill=\"#ffaaae\" d=\"M14 14h1v1h-1Z\" data-n=\"qdmm-color-ffaaae-255\"/><path fill=\"#ffedee\" d=\"M17 14h1v1h-1Z\" data-n=\"qdmm-color-ffedee-255\"/><path fill=\"#fff1f2\" d=\"M23 14h1v1h-1Z\" data-n=\"qdmm-color-fff1f2-255\"/><path fill=\"#ff8d92\" d=\"M26 14h1v1h-1ZM26 15h1v1h-1Z\" data-n=\"qdmm-color-ff8d92-255\"/><path fill=\"#ffa3a7\" d=\"M8 15h1v1h-1Z\" data-n=\"qdmm-color-ffa3a7-255\"/><path fill=\"#fff7f7\" d=\"M9 15h1v1h-1ZM14 19h1v1h-1Z\" data-n=\"qdmm-color-fff7f7-255\"/><path fill=\"#ffbdc0\" d=\"M14 15h1v1h-1ZM20 16h1v1h-1Z\" data-n=\"qdmm-color-ffbdc0-255\"/><path fill=\"#ffd6d8\" d=\"M16 15h1v1h-1Z\" data-n=\"qdmm-color-ffd6d8-255\"/><path fill=\"#ffc1c4\" d=\"M17 15h1v1h-1Z\" data-n=\"qdmm-color-ffc1c4-255\"/><path fill=\"#ff747b\" d=\"M21 15h1v1h-1ZM19 22h1v1h-1Z\" data-n=\"qdmm-color-ff747b-255\"/><path fill=\"#ffa6aa\" d=\"M7 16h1v1h-1ZM16 25h1v1h-1Z\" data-n=\"qdmm-color-ffa6aa-255\"/><path fill=\"#ff7078\" d=\"M8 16h1v1h-1Z\" data-n=\"qdmm-color-ff7078-255\"/><path fill=\"#ff7f86\" d=\"M10 16h1v1h-1Z\" data-n=\"qdmm-color-ff7f86-255\"/><path fill=\"#ffcfd2\" d=\"M16 16h1v1h-1Z\" data-n=\"qdmm-color-ffcfd2-255\"/><path fill=\"#ffbabe\" d=\"M17 16h1v1h-1Z\" data-n=\"qdmm-color-ffbabe-255\"/><path fill=\"#ff6c73\" d=\"M26 16h1v1h-1ZM19 20h1v1h-1Z\" data-n=\"qdmm-color-ff6c73-255\"/><path fill=\"#ff686f\" d=\"M4 17h1v1h-1ZM6 17h1v1h-1ZM12 20h1v1h-1Z\" data-n=\"qdmm-color-ff686f-255\"/><path fill=\"#ff797f\" d=\"M5 17h1v1h-1Z\" data-n=\"qdmm-color-ff797f-255\"/><path fill=\"#ff6870\" d=\"M12 17h1v1h-1ZM25 18h1v1h-1Z\" data-n=\"qdmm-color-ff6870-255\"/><path fill=\"#fff6f7\" d=\"M13 17h1v1h-1ZM13 23h1v1h-1Z\" data-n=\"qdmm-color-fff6f7-255\"/><path fill=\"#fffcfd\" d=\"M14 17h1v1h-1Z\" data-n=\"qdmm-color-fffcfd-255\"/><path fill=\"#ff6d74\" d=\"M15 17h1v1h-1Z\" data-n=\"qdmm-color-ff6d74-255\"/><path fill=\"#ffd3d5\" d=\"M17 17h1v1h-1Z\" data-n=\"qdmm-color-ffd3d5-255\"/><path fill=\"#ff6f76\" d=\"M19 17h1v1h-1ZM13 19h1v1h-1ZM15 22h1v1h-1ZM15 26h1v1h-1Z\" data-n=\"qdmm-color-ff6f76-255\"/><path fill=\"#ff8087\" d=\"M16 18h1v1h-1Z\" data-n=\"qdmm-color-ff8087-255\"/><path fill=\"#ff656d\" d=\"M19 18h1v1h-1ZM18 25h1v1h-1ZM18 28h1v1h-1Z\" data-n=\"qdmm-color-ff656d-255\"/><path fill=\"#fff3f4\" d=\"M20 18h1v1h-1Z\" data-n=\"qdmm-color-fff3f4-255\"/><path fill=\"#ffdfe1\" d=\"M24 18h1v1h-1Z\" data-n=\"qdmm-color-ffdfe1-255\"/><path fill=\"#ff666e\" d=\"M9 19h1v1h-1Z\" data-n=\"qdmm-color-ff666e-255\"/><path fill=\"#fff2f2\" d=\"M10 19h1v1h-1Z\" data-n=\"qdmm-color-fff2f2-255\"/><path fill=\"#ffe3e4\" d=\"M15 19h1v1h-1Z\" data-n=\"qdmm-color-ffe3e4-255\"/><path fill=\"#ff838a\" d=\"M20 19h1v1h-1Z\" data-n=\"qdmm-color-ff838a-255\"/><path fill=\"#ff676e\" d=\"M24 19h1v1h-1Z\" data-n=\"qdmm-color-ff676e-255\"/><path fill=\"#ffa8ac\" d=\"M10 20h1v1h-1Z\" data-n=\"qdmm-color-ffa8ac-255\"/><path fill=\"#ffebec\" d=\"M11 20h1v1h-1Z\" data-n=\"qdmm-color-ffebec-255\"/><path fill=\"#ffa7ac\" d=\"M14 20h1v1h-1Z\" data-n=\"qdmm-color-ffa7ac-255\"/><path fill=\"#ff949a\" d=\"M16 20h1v1h-1Z\" data-n=\"qdmm-color-ff949a-255\"/><path fill=\"#ffe6e7\" d=\"M18 20h1v1h-1Z\" data-n=\"qdmm-color-ffe6e7-255\"/><path fill=\"#ffe1e3\" d=\"M11 21h1v1h-1Z\" data-n=\"qdmm-color-ffe1e3-255\"/><path fill=\"#ffc0c3\" d=\"M12 21h1v1h-1Z\" data-n=\"qdmm-color-ffc0c3-255\"/><path fill=\"#ffeced\" d=\"M16 21h1v1h-1ZM17 23h1v1h-1Z\" data-n=\"qdmm-color-ffeced-255\"/><path fill=\"#ff6971\" d=\"M17 21h1v1h-1Z\" data-n=\"qdmm-color-ff6971-255\"/><path fill=\"#ff8086\" d=\"M18 21h1v1h-1ZM21 29h1v1h-1Z\" data-n=\"qdmm-color-ff8086-255\"/><path fill=\"#ffb7ba\" d=\"M19 21h1v1h-1Z\" data-n=\"qdmm-color-ffb7ba-255\"/><path fill=\"#fff4f5\" d=\"M12 22h1v1h-1Z\" data-n=\"qdmm-color-fff4f5-255\"/><path fill=\"#ff888e\" d=\"M12 23h1v1h-1Z\" data-n=\"qdmm-color-ff888e-255\"/><path fill=\"#ff8f94\" d=\"M14 23h1v1h-1Z\" data-n=\"qdmm-color-ff8f94-255\"/><path fill=\"#ff777e\" d=\"M16 23h1v1h-1ZM21 26h1v1h-1Z\" data-n=\"qdmm-color-ff777e-255\"/><path fill=\"#ff8c92\" d=\"M13 24h1v1h-1Z\" data-n=\"qdmm-color-ff8c92-255\"/><path fill=\"#ff9297\" d=\"M15 24h1v1h-1Z\" data-n=\"qdmm-color-ff9297-255\"/><path fill=\"#ff8288\" d=\"M14 25h1v1h-1Z\" data-n=\"qdmm-color-ff8288-255\"/><path fill=\"#ffeded\" d=\"M15 25h1v1h-1Z\" data-n=\"qdmm-color-ffeded-255\"/><path fill=\"#ffb4b8\" d=\"M19 25h1v1h-1Z\" data-n=\"qdmm-color-ffb4b8-255\"/><path fill=\"#ffd1d3\" d=\"M16 26h1v1h-1Z\" data-n=\"qdmm-color-ffd1d3-255\"/><path fill=\"#ffdcdd\" d=\"M18 27h1v1h-1Z\" data-n=\"qdmm-color-ffdcdd-255\"/><path fill=\"#ff9398\" d=\"M19 27h1v1h-1Z\" data-n=\"qdmm-color-ff9398-255\"/><path fill=\"#ffb9bd\" d=\"M20 28h1v1h-1Z\" data-n=\"qdmm-color-ffb9bd-255\"/><path fill=\"#ff7e85\" d=\"M21 28h1v1h-1Z\" data-n=\"qdmm-color-ff7e85-255\"/></svg>",
};
export const tags = ["小说", "排行榜"];

const rank_names = {
  yuepiao: "月票榜",
  hotsales: "畅销榜",
  readindex: "阅读榜",
  newfans: "书友榜",
  rec: "推荐榜",
  update: "更新榜",
  collect: "收藏榜",
  free: "免费榜",
};

export class QdmmHotRank extends HotRankScript {
  constructor(type) {
    super();
    this.type = type;
  }

  async fetch(ctx) {
    try {
      const type = this.type;
      if (!Object.keys(rank_names).includes(type)) {
        return Result.Err(
          "type 必须为女频官网榜单类型",
          "INVALID_PARAMETER",
        );
      }
      const category_id = String(ctx.query.category || "-1");
      const period = String(ctx.query.period || "");
      const periods =
        type === "rec"
          ? { week: "3", month: "2", all: "1" }
          : type === "newfans"
            ? { week: "3", month: "2" }
            : {};
      if (
        !/^(?:-1|[1-9]\d{0,5})$/.test(category_id) ||
        (period &&
          !(type === "yuepiao"
            ? /^20\d{2}(?:0[1-9]|1[0-2])$/.test(period)
            : Object.keys(periods).includes(period)))
      ) {
        return Result.Err(
          "category 必须为官网分类数字 ID；period：月票榜用 YYYYMM，推荐榜用 week/month/all，书友榜用 week/month",
          "INVALID_PARAMETER",
        );
      }
      const home = "https://m.qdmm.com";
      const link =
        home +
        "/rank/" +
        type +
        "/" +
        (category_id !== "-1" || period ? "catid" + category_id + "/" : "") +
        (period ? (type === "yuepiao" ? period : periods[period]) + "/" : "");
      const fetched = await utils.request_text(ctx, link, {
        headers: {
          Referer: home + "/",
          Accept: "text/html,application/xhtml+xml",
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
        },
      });
      if (fetched.error) return fetched;
      const context = utils.embedded_json(
        fetched.data,
        /<script\b[^>]*\bid=["']vite-plugin-ssr_pageContext["'][^>]*>/i,
      );
      if (context.error) return context;
      const page = context.data.pageContext?.pageProps?.pageData;
      if (page?.gender && page.gender !== "female")
        return Result.Err(
          "起点返回了其他频道榜单",
          "UPSTREAM_INVALID_RESPONSE",
        );
      const list = utils.array_at(
        context.data,
        "pageContext.pageProps.pageData.records",
      );
      if (list.error) return list;
      if (!list.data.length)
        return Result.Err(
          "起点榜单为空，可能为验证页面",
          "UPSTREAM_INVALID_RESPONSE",
        );
      const entries = [],
        seen = new Set();
      for (const row of list.data) {
        const id = utils.identity(row.bid);
        if (id.error) return id;
        if (!/^\d{1,24}$/.test(id.data))
          return Result.Err("起点书籍 ID 无效", "UPSTREAM_INVALID_RESPONSE");
        if (seen.has(id.data)) continue;
        seen.add(id.data);
        const text = String(row.rankCnt ?? "").trim();
        const heat = /^([\d,]+(?:\.\d+)?)(万|亿)?/.exec(text);
        entries.push({
          id: "qidian:book:" + id.data,
          title: utils.plain_text(row.bName),
          link: home + "/book/" + id.data + "/",
          thumbnail:
            "https://bookcover.yuewen.com/qdbimg/349573/" + id.data + "/180",
          rank:
            row.rankNum == null || row.rankNum === ""
              ? null
              : Number(row.rankNum),
          pinned: false,
          heat: {
            value: heat
              ? Number(heat[1].replace(/,/g, "")) *
                (heat[2] === "亿" ? 1e8 : heat[2] === "万" ? 1e4 : 1)
              : null,
            unit:
              {
                yuepiao: "月票",
                newfans: "书友",
                rec: "推荐",
                update: "更新字数",
                collect: "收藏",
              }[type] || "热度",
            text,
          },
        });
      }
      ctx.log("起点榜单解析完成", {
        type,
        gender: "female",
        category: category_id,
        period,
        count: entries.length,
      });
      return Result.Ok({
        category,
        title:
          "起点 · 女频" +
          rank_names[type] +
          (category_id !== "-1"
            ? " · " +
              (page?.filters
                ?.find((filter) => filter.key === "catId")
                ?.items?.find((item) => String(item.value) === category_id)
                ?.text || category_id)
            : "") +
          (period
            ? " · " +
              ({ week: "周榜", month: "月榜", all: "总榜" }[period] || period)
            : ""),
        link,
        entries,
      });
    } catch (error) {
      return Result.Err(error, error?.code ?? "UPSTREAM_INVALID_RESPONSE");
    }
  }
}

const rank_metadata = {
  parameters: { category: "查询参数：分类数字 ID，默认 -1（全部）",
    period: "查询参数：月票榜使用 YYYYMM；推荐榜支持 week/month/all；书友榜支持 week/month；默认当前榜单" },
  url: "m.qdmm.com",
  maintainers: ["findrss"],
  description:
    "读取官网移动端榜单第一页并返回封面。?category=21 按分类；?period=YYYYMM（月票）或 week/month/all（推荐）、week/month（书友）；未知排名和热度为 null。",
};

export const routes = [
  {
    ...rank_metadata,
    name: "起点 · 女频月票榜",
    path: "/qidian/rank/yuepiao/female",
    handler: (ctx) => new QdmmHotRank("yuepiao").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 女频畅销榜",
    path: "/qidian/rank/hotsales/female",
    handler: (ctx) => new QdmmHotRank("hotsales").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 女频阅读榜",
    path: "/qidian/rank/readindex/female",
    handler: (ctx) => new QdmmHotRank("readindex").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 女频书友榜",
    path: "/qidian/rank/newfans/female",
    handler: (ctx) => new QdmmHotRank("newfans").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 女频推荐榜",
    path: "/qidian/rank/rec/female",
    handler: (ctx) => new QdmmHotRank("rec").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 女频更新榜",
    path: "/qidian/rank/update/female",
    handler: (ctx) => new QdmmHotRank("update").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 女频收藏榜",
    path: "/qidian/rank/collect/female",
    handler: (ctx) => new QdmmHotRank("collect").run(ctx),
  },
  {
    ...rank_metadata,
    name: "起点 · 女频免费榜",
    path: "/qidian/rank/free/female",
    handler: (ctx) => new QdmmHotRank("free").run(ctx),
  },
];
