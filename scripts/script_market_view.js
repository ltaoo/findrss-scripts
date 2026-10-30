import { View, Form, Input, For, Modal, ref, computed } from "timeless";
import { create_market_model } from "./script_market.js";

const kind_names = { hot: "热榜", rss: "订阅", clip: "剪藏", detect: "监测" };
const empty_fields = [];

export function create_market_view_model(data, write_clipboard) {
  const changes = ref(0);
  const model = create_market_model(data.scripts, write_clipboard);
  model.on_change = () => changes.as(value => value + 1);
  return { ...data, model, watch: read => computed(changes, read) };
}

// 原生标签保留既有语义和样式，属性与事件仍由 Timeless 管理。
function element(tag, name, attributes = {}, children = [], events = {}) {
  const view = (tag === "form" ? Form : View)({ attributes: {
    "data-n": name, n: name, ...(tag === "button" ? { type: "button" } : {}), ...attributes,
  }, ...events }, children);
  view.state.tag = tag;
  view.state.svg = ["svg", "path", "rect", "circle"].includes(tag);
  return view;
}

function input(name, attributes, value, onInput) {
  return Input({ attributes: { "data-n": name, n: name, ...attributes }, value, onInput });
}

function icon(name, kind) {
  const paths = {
    copy: [element("rect", "copy-icon-front", { x: 8, y: 8, width: 13, height: 13, rx: 2 }),
      element("path", "copy-icon-back", { d: "M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" })],
    add: [element("path", "add-example-icon-lines", { d: "M12 5v14M5 12h14" })],
    settings: [element("path", "settings-icon-gear", { d: "m9 3-.6 2.3-1.5.9-2.3-.6-3 5.2 1.7 1.7v1.8L1.6 16l3 5.2 2.3-.6 1.5.9L9 24h6l.6-2.5 1.5-.9 2.3.6 3-5.2-1.7-1.7v-1.8l1.7-1.7-3-5.2-2.3.6-1.5-.9L15 3Z", transform: "translate(1 0) scale(.92 .85)" }),
      element("circle", "settings-icon-center", { cx: 12, cy: 11.5, r: 3 })],
  };
  return element("svg", name, { width: kind === "settings" ? 22 : 18, height: kind === "settings" ? 22 : 18,
    viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": kind === "add" ? 2 : 1.7,
    "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false" }, paths[kind]);
}

function header(vm) {
  const { model, watch } = vm;
  return element("div", "market-toolbar", { class: "toolbar" }, [
    element("h1", "project-brand", { class: "brand" }, [element("img", "project-logo", { src: vm.logo, alt: "", width: 36, height: 36 }), element("span", "project-name", {}, ["FindRSS"])]),
    element("div", "market-navigation", { class: "navigation" }, [
      element("div", "script-tabs", { class: "tabs", role: "tablist", "aria-label": "脚本类型" },
        [["rss", "RSS"], ["hot", "Hot"], ["clip", "Clip"], ["detect", "Detect"]].map(([kind, label]) =>
          element("button", "script-tab", { class: "tab", id: "tab-" + kind, role: "tab", "data-kind": kind,
            "aria-selected": watch(() => String(model.kind === kind)), "aria-controls": "script-panel", tabindex: watch(() => model.kind === kind ? 0 : -1) }, [
            element("span", "script-tab-label", {}, [label]), element("span", "script-tab-count", { class: "kind tab-count" }, [String(model.scripts.filter(script => script.kind === kind).length)]),
          ], { onClick: () => model.select_kind(kind), onKeyDown(event) {
            if (model.move_tab(event.key)) {
              event.preventDefault();
              event.currentTarget.parentElement.querySelector(`[data-kind="${model.kind}"]`).focus();
            }
          } }))),
    ]),
    element("div", "header-actions", { class: "header-actions" }, [
      element("span", "check-time", {}, ["最近巡检：", element("time", "checked-at", { datetime: vm.checked_at || "" }, [vm.checked])]),
      element("button", "open-settings", { class: "copy-icon settings-button", "aria-label": "设置", title: "设置" }, [icon("settings-icon", "settings")], { onClick: () => model.open_settings() }),
    ]),
  ]);
}

function card(vm, script, visible) {
  const { model, watch } = vm;
  return element("article", "script-card", { class: "card", id: script.id, "aria-labelledby": script.id + "-title", hidden: computed(visible, ids => !ids.includes(script.id)) }, [
    element("div", "script-card-body", { class: "card-body" }, [
      element("div", "script-heading", { class: "script-heading" }, [
        element("div", "script-icon-container", { class: "icon" }, [script.icon_data_url
          ? element("img", "script-icon", { class: "script-icon", src: script.icon_data_url, alt: "", width: 32, height: 32 })
          : element("span", "script-icon-fallback", { class: "icon-fallback", "aria-hidden": "true" }, [script.title.slice(0, 1)])]),
        element("div", "script-identity", { class: "script-identity" }, [element("h2", "script-title", { id: script.id + "-title" }, [script.title])]),
        element("div", "script-status-stack", { class: "script-status-stack" }, [
          element("span", "script-version", { class: "script-version", "aria-label": "版本：" + script.version }, ["v" + script.version]),
          element("button", "inspect-script", { class: "inspection-trigger status " + (script.failed ? "failed" : script.total ? "passed" : ""),
            "data-script": script.id, "aria-label": script.title + " 巡检结果与产物" }, [script.total ? `巡检 ${script.total - script.failed}/${script.total} 通过` : "暂无巡检结果"], { onClick: () => model.inspect(script.id) }),
        ]),
      ]),
      element("div", "script-metadata", { class: "metadata" }, [
        element("span", "script-kind", { class: "kind" }, [kind_names[script.kind] || script.kind]),
        element("a", "script-raw-link", { class: "raw-link", href: script.raw_url }, [script.file]),
        element("button", "copy-raw-url", { class: "copy-icon", "data-script": script.id, "aria-label": "复制 Raw 地址：" + script.file,
          title: "复制 Raw 地址", disabled: watch(() => model.copying) }, [icon("copy-icon", "copy")], { onClick: () => model.copy(script.id) }),
      ]),
    ]),
  ]);
}

function examples(vm, route) {
  const { model, watch } = vm;
  return element("div", "route-actions", { class: "route-actions" }, [
    element("div", "route-examples", { class: "route-examples", "data-route": route.key }, [
      For({ each: watch(() => model.route_examples(route.key)), key: "id", render: example => {
        const label = watch(() => model.route_examples(route.key).find(value => value.id === example.id)?.label || "");
        return element("span", "saved-example", { class: "saved-example" }, [
          element("button", "open-example", { title: label }, [label], { onClick: () => model.open_request(route.key, example.id) }),
          ...(example.deletable ? [element("button", "delete-example", { title: "删除示例", "aria-label": computed(label, value => "删除示例：" + value) }, ["×"], { onClick(event) {
            const add = event.currentTarget.closest('[data-n="route-actions"]').querySelector('[data-n="configure-route"]');
            if (model.delete_example(route.key, example.id)) add.focus();
          } })] : []),
        ]);
      } }),
    ]),
    element("button", "configure-route", { class: "copy-icon add-example", "data-route": route.key, "aria-label": "添加示例：" + route.path,
      title: "添加示例" }, [icon("add-example-icon", "add")], { onClick: () => model.open_request(route.key) }),
  ]);
}

function inspection_results(vm, script) {
  const { model, watch } = vm;
  return element("section", "inspection-results", { "data-script": script.id, hidden: watch(() => model.inspection?.id !== script.id) }, script.inspection_rows.length ? [
    element("div", "table-scroll-container", { class: "table-scroll", role: "region", "aria-label": script.title + " 巡检详情", tabindex: 0 }, [
      element("table", "results-table", {}, [
        element("thead", "results-head", {}, [element("tr", "column-headings", {}, [
          ["title", "标题"], ["route", "路由"], ["status", "结果"], ["output", "产物 / 失败原因"],
        ].map(([name, title]) => element("th", name + "-heading", { scope: "col" }, [title])))]),
        element("tbody", "results-rows", {}, script.inspection_rows.map(row => element("tr", "route-result", {}, [
          element("th", "route-title", { scope: "row" }, [row.request?.name || row.path]),
          element("td", "route-identity", {}, [element("code", "route-path", {}, [row.path]), ...(row.request ? [examples(vm, row.request)] : [])]),
          element("td", "route-status", {}, [element("span", "status-label", { class: "status " + (row.ok === null ? "unknown" : row.ok ? "passed" : "failed") }, [row.ok === null ? "未巡检" : row.ok ? "成功" : "失败"])]),
          element("td", "route-output", {}, [...(row.artifacts || []).map(artifact => element("a", "artifact-link", { href: artifact.url, target: "_blank", rel: "noopener noreferrer" }, [artifact.label])), row.reason]),
        ]))),
      ]),
    ]),
  ] : [element("p", "empty-inspection", {}, ["暂无巡检结果。"])]);
}

function dialog(name, class_name, title, open, close, children) {
  return Modal({ attributes: { "data-n": name + "-dialog", n: name + "-dialog", class: class_name, "aria-labelledby": name + "-title" }, open, onClose: close }, [
    element("div", name === "inspection" ? "inspection-header" : name + "-header", { class: "inspection-header" }, [
      element("h2", name + "-title", { class: "inspection-title", id: name + "-title" }, [title]),
      element("button", "close-" + name, { class: "button" }, ["关闭"], { onClick: close }),
    ]), ...children,
  ]);
}

function request_dialog(vm) {
  const { model, watch } = vm;
  const output = watch(() => model.request_output);
  return dialog("request", "", watch(() => (model.example_id ? "编辑示例" : "添加示例") + (model.request ? " · " + model.request.path : "")),
    watch(() => Boolean(model.request)), () => model.close_request(), [
      element("form", "request-form", { novalidate: true }, [
        element("div", "request-fields", { class: "request-fields" }, [For({ each: watch(() => model.request?.fields || empty_fields), render: (field, index) =>
          element("label", "route-parameter-field", { class: "form-field", for: computed(index, value => "route-parameter-" + value) }, [
            element("span", "route-parameter-label", { class: "form-label" }, [field.name + (field.required ? " *" : "")]),
            input("route-parameter-input", { class: "form-input", id: computed(index, value => "route-parameter-" + value), "data-parameter": field.name,
              required: field.required, autocomplete: "off" }, watch(() => model.route_values[field.name] || ""), event => model.set_route_value(field.name, event.target.value)),
          ]) })]),
        element("div", "request-actions", { class: "form-actions" }, [
          element("button", "save-request", { class: "button", type: "submit" }, [watch(() => model.example_id ? "保存修改" : "保存示例")]),
          element("button", "request-settings", { class: "button" }, ["设置 baseURL / token"], { onClick: () => model.open_settings() }),
        ]),
        element("p", "request-status", { class: "form-status", role: "status" }, [watch(() => model.message || model.request_status || (model.request ? model.request_output.error : ""))]),
      ], { onSubmit(event) { event.preventDefault(); model.save_request(); } }),
      ...[["url", "GET URL", "复制 URL"], ["curl", "POST curl", "复制 curl"]].map(([kind, title, copy_label]) =>
        element("section", "request-" + kind + "-section", { class: "request-output" }, [
          element("h3", "request-" + kind + "-title", {}, [title]),
          element("pre", "request-" + kind, { class: "command" }, [computed(output, value => value[kind])]),
          element("div", "request-" + kind + "-actions", { class: "form-actions" }, [
            element("button", "copy-request-" + kind, { class: "button", "data-request-copy": kind, disabled: watch(() => model.copying || !model.request_output.url) }, [copy_label], { onClick: () => model.copy_request(kind) }),
            ...(kind === "url" ? [element("a", "open-request-url", { target: "_blank", rel: "noopener noreferrer", href: computed(output, value => value.url || undefined), hidden: computed(output, value => !value.url) }, ["打开 URL"])] : []),
          ]),
        ])),
    ]);
}

function settings_dialog(vm) {
  const { model, watch } = vm;
  return dialog("settings", "settings-dialog", "设置", watch(() => model.settings_open), () => model.close_settings(), [
    element("form", "settings-form", { novalidate: true }, [
      ...[["baseURL", "base-url", "url"], ["token", "token", "password"]].map(([key, name, type]) =>
        element("label", "settings-" + name + "-field", { class: "form-field", for: "settings-" + name }, [
          element("span", "settings-" + name + "-label", { class: "form-label" }, [key]),
          input("settings-" + name, { class: "form-input", id: "settings-" + name, type,
            ...(key === "baseURL" ? { placeholder: "http://localhost:8801", autocomplete: "url", required: true } : { autocomplete: "off", spellcheck: "false" }) },
          watch(() => model.settings_draft[key]), event => model.set_setting(key, event.target.value)),
        ])),
      element("p", "settings-storage-help", { class: "form-help" }, ["设置与路由参数仅保存在当前浏览器。"]),
      element("p", "settings-error", { class: "form-status", role: "alert" }, [watch(() => model.settings_error)]),
      element("div", "settings-actions", { class: "form-actions" }, [element("button", "save-settings", { class: "button", type: "submit" }, ["保存设置"])]),
    ], { onSubmit(event) { event.preventDefault(); model.save_settings(); } }),
  ]);
}

export function MarketPage(vm) {
  const { model, watch } = vm;
  const visible = watch(() => model.visible_ids);
  return element("div", "market-app", {}, [
    element("a", "skip-to-scripts", { class: "skip", href: "#scripts" }, ["跳转到脚本列表"]),
    element("div", "market-page", { class: "page" }, [
      header(vm),
      element("section", "market-search", { class: "search-area", "aria-label": "搜索脚本" }, [
        input("script-search", { class: "search", id: "script-search", type: "search", "aria-label": "搜索脚本", placeholder: "搜索名称、文件路径、类型或路由，例如 GitHub、热榜、rss", autocomplete: "off", "aria-controls": "scripts" }, watch(() => model.query), event => model.search(event.target.value)),
      ]),
      element("main", "script-catalog", { id: "scripts" }, [
        element("div", "script-panel", { id: "script-panel", role: "tabpanel", "aria-labelledby": watch(() => "tab-" + model.kind), tabindex: 0 }, [
          element("div", "script-list", { class: "catalog" }, model.scripts.map(script => card(vm, script, visible))),
          element("p", "empty-search", { class: "empty-state", hidden: computed(visible, ids => ids.length > 0) }, ["当前分类没有匹配的脚本，请切换分类、尝试其他关键词或清空搜索。"]),
        ]),
      ]),
      element("p", "copy-feedback", { class: "feedback", role: "status", "aria-live": "polite" }, [watch(() => model.message)]),
    ]),
    dialog("inspection", "inspection-dialog", watch(() => model.inspection ? model.inspection.title + " · 巡检结果" : "巡检结果"),
      watch(() => Boolean(model.inspection)), () => model.close_inspection(), [
        element("p", "inspection-status", { class: "form-status", role: "alert" }, [watch(() => model.inspection_status)]),
        ...model.scripts.map(script => inspection_results(vm, script)),
      ]),
    request_dialog(vm), settings_dialog(vm),
  ]);
}
