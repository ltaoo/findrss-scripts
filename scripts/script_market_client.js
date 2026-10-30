import { MarketPage, create_market_view_model } from "./script_market_view.js";

const data = JSON.parse(document.querySelector('[data-n="market-data"]').textContent);
const vm = create_market_view_model(data, value => navigator.clipboard.writeText(value));
globalThis.Timeless.DOM.hydrate(MarketPage(vm), document.querySelector('[data-n="market-root"]'));
let storage;
try { storage = localStorage; } catch {}
// 先以与 SSR 相同的状态接管节点，再读取浏览器的私有设置及示例。
vm.model.load_storage(storage);
