export function create_market_model(scripts, write_clipboard, storage) {
  const read_saved = key => {
    try {
      const value = JSON.parse(storage?.getItem(key) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch { return {}; }
  };
  const settings_key = "findrss.script-market.settings";
  const parameters_key = "findrss.script-market.parameters";
  const saved = read_saved(settings_key);
  const settings = { baseURL: typeof saved.baseURL === "string" ? saved.baseURL : "", token: typeof saved.token === "string" ? saved.token : "" };
  const saved_parameters = Object.fromEntries(Object.entries(read_saved(parameters_key)).map(([key, value]) => [key,
    Array.isArray(value) ? value.filter(example => typeof example?.id === "string" && example.values && typeof example.values === "object" && !Array.isArray(example.values))
      : value && typeof value === "object" ? [{ id: "legacy", values: value }] : [],
  ]));
  const validate_settings = value => {
    let url;
    try { url = new URL(value.baseURL.trim()); } catch { throw new Error("请在设置中填写有效的 baseURL"); }
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
      throw new Error("baseURL 必须为不含凭据、query 或 hash 的 HTTP(S) 地址");
    }
    if (/[\r\n\0]/.test(value.token)) throw new Error("token 不能包含换行或空字符");
    return { baseURL: url.href.replace(/\/+$/, ""), token: value.token.trim() };
  };
  return {
    scripts, kinds: ["rss", "hot", "clip", "detect"], kind: "rss", query: "", message: "", message_timer: null, copying: false, inspection: null,
    settings, settings_draft: { ...settings }, settings_open: false, settings_error: "",
    saved_parameters, request: null, example_id: null, route_values: {}, request_status: "", inspection_status: "",
    on_change() {},
    open_settings() {
      this.settings_draft = { ...this.settings };
      this.settings_error = "";
      this.settings_open = true;
      this.on_change();
    },
    set_setting(name, value) {
      if (!["baseURL", "token"].includes(name)) return;
      this.settings_draft = { ...this.settings_draft, [name]: value };
      this.settings_error = "";
      this.on_change();
    },
    close_settings() {
      this.settings_open = false;
      this.on_change();
    },
    save_settings() {
      let value;
      try { value = validate_settings(this.settings_draft); }
      catch (error) { this.settings_error = error.message; this.on_change(); return false; }
      try { storage.setItem(settings_key, JSON.stringify(value)); }
      catch { this.settings_error = "无法保存到 localStorage，请检查浏览器存储设置"; this.on_change(); return false; }
      this.settings = value;
      this.settings_open = false;
      this.on_change();
      return true;
    },
    route_examples(key) {
      return (this.saved_parameters[key] || []).map((example, index) => ({ ...example,
        label: Object.values(example.values).filter(value => typeof value === "string" && value).join(" · ") || "示例 " + (index + 1),
      }));
    },
    open_request(key, example_id = null) {
      const example = (this.saved_parameters[key] || []).find(example => example.id === example_id);
      if (example_id !== null && !example) return;
      this.request = this.scripts.flatMap(script => script.routes || []).find(route => route.key === key) || null;
      this.example_id = example_id;
      const saved = example?.values;
      this.route_values = Object.fromEntries((this.request?.fields || []).map(field => [field.name,
        typeof saved?.[field.name] === "string" ? saved[field.name] : field.value || ""]));
      this.request_status = "";
      this.message = "";
      this.inspection_status = "";
      this.on_change();
    },
    close_request() {
      this.request = null;
      this.on_change();
    },
    set_route_value(name, value) {
      if (!this.request?.fields.some(field => field.name === name)) return;
      this.route_values = { ...this.route_values, [name]: value };
      this.request_status = "";
      this.on_change();
    },
    get resolved_request() {
      if (!this.request) throw new Error("请先选择路由");
      const values = Object.fromEntries(this.request.fields.map(field => [field.name, String(this.route_values[field.name] ?? "")]));
      for (const field of this.request.fields) {
        const value = values[field.name];
        if (!value && field.required) throw new Error("请填写 " + field.name);
        if (value && field.pattern && !new RegExp("^(?:" + field.pattern + ")$", "u").test(value)) throw new Error(field.name + " 格式不正确");
      }
      const parts = [];
      let missing_optional = false;
      for (const segment of this.request.segments) {
        if (typeof segment === "string") { parts.push(segment); missing_optional = false; continue; }
        const value = values[segment.name];
        if (!value && segment.optional) { missing_optional = true; continue; }
        if (segment.optional && missing_optional) throw new Error("不能跳过前面的可选路径参数");
        if (/[\/\\\u0000-\u001f]/.test(value) || value === "." || value === "..") throw new Error(segment.name + " 不能包含路径分隔符或特殊路径段");
        parts.push(encodeURIComponent(value));
      }
      return { path: "/" + parts.join("/"), query: Object.fromEntries(this.request.fields
        .filter(field => field.in === "query" && values[field.name] !== "").map(field => [field.name, values[field.name]])) };
    },
    get request_output() {
      try {
        const { baseURL, token } = validate_settings(this.settings);
        const request = this.resolved_request;
        const post_url = new URL(baseURL + request.path);
        const url = new URL(post_url);
        for (const [name, value] of Object.entries(request.query)) url.searchParams.set(name, value);
        if (token) url.searchParams.set("token", token);
        const quote = value => "'" + value.replace(/'/g, "'\"'\"'") + "'";
        const curl = ["curl --request POST " + quote(post_url.href),
          ...(token ? ["--header " + quote("Authorization: Bearer " + token)] : []),
          "--header 'Content-Type: application/json'", "--data-raw " + quote(JSON.stringify(request.query))].join(" \\\n  ");
        return { url: url.href, curl, error: "" };
      } catch (error) { return { url: "", curl: "", error: error.message }; }
    },
    save_request() {
      this.message = "";
      try { this.resolved_request; }
      catch (error) { this.request_status = error.message; this.on_change(); return false; }
      const id = this.example_id || crypto.randomUUID();
      const example = { id, values: { ...this.route_values } };
      const examples = this.saved_parameters[this.request.key] || [];
      const saved = { ...this.saved_parameters, [this.request.key]: this.example_id
        ? examples.map(value => value.id === id ? example : value) : [...examples, example] };
      try { storage.setItem(parameters_key, JSON.stringify(saved)); }
      catch { this.request_status = "无法保存到 localStorage，请检查浏览器存储设置"; this.on_change(); return false; }
      this.saved_parameters = saved;
      this.example_id = id;
      this.request_status = "示例已保存";
      this.on_change();
      return true;
    },
    delete_example(key, id) {
      if (!(this.saved_parameters[key] || []).some(example => example.id === id)) return false;
      const remaining = this.saved_parameters[key].filter(example => example.id !== id);
      const saved = { ...this.saved_parameters, [key]: remaining };
      if (!remaining.length) delete saved[key];
      try { storage.setItem(parameters_key, JSON.stringify(saved)); }
      catch { this.inspection_status = "无法删除示例，请检查浏览器存储设置"; this.on_change(); return false; }
      this.saved_parameters = saved;
      this.inspection_status = "";
      if (this.request?.key === key && this.example_id === id) this.request = null;
      this.on_change();
      return true;
    },
    copy_request(kind) {
      const output = this.request_output;
      if (!["url", "curl"].includes(kind) || output.error) return;
      return this.copy_text(output[kind], kind === "curl" ? "curl 命令" : "GET URL");
    },
    get kind_scripts() {
      return this.scripts.filter(script => script.kind === this.kind);
    },
    get visible_ids() {
      const terms = this.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      return this.kind_scripts.filter(script => terms.every(term => script.search_text.toLowerCase().includes(term))).map(script => script.id);
    },
    select_kind(kind) {
      if (!this.kinds.includes(kind)) return;
      this.kind = kind;
      this.message = "";
      this.on_change();
    },
    move_tab(key) {
      const index = this.kinds.indexOf(this.kind);
      const next = { ArrowRight: (index + 1) % this.kinds.length, ArrowLeft: (index + this.kinds.length - 1) % this.kinds.length,
        Home: 0, End: this.kinds.length - 1 }[key];
      if (next === undefined) return false;
      this.select_kind(this.kinds[next]);
      return true;
    },
    search(query) {
      this.query = query;
      this.message = "";
      this.on_change();
    },
    inspect(id) {
      this.inspection = this.scripts.find(script => script.id === id) || null;
      this.inspection_status = "";
      this.message = "";
      this.on_change();
    },
    close_inspection() {
      this.inspection = null;
      this.on_change();
    },
    copy(id) {
      const script = this.scripts.find(script => script.id === id);
      return this.copy_text(script?.raw_url, "脚本地址");
    },
    async copy_text(value, label) {
      if (!value || this.copying) return;
      clearTimeout(this.message_timer);
      this.copying = true;
      this.message = "正在复制…";
      this.on_change();
      try {
        await write_clipboard(value);
        this.message = "已复制" + label;
      } catch {
        this.message = "复制失败，请手动选择文本复制。";
      }
      this.copying = false;
      this.on_change();
      this.message_timer = setTimeout(() => {
        this.message = "";
        this.message_timer = null;
        this.on_change();
      }, 2500);
    },
  };
}

export function mount_market_view(model, document) {
  const node = name => document.querySelector(`[data-n="${name}"]`);
  const cards = [...document.querySelectorAll('[data-n="script-card"]')];
  const buttons = [...document.querySelectorAll('[data-n="copy-raw-url"]')];
  const tabs = [...document.querySelectorAll('[data-n="script-tab"]')];
  const inspections = [...document.querySelectorAll('[data-n="inspection-results"]')];
  const inspection_dialog = node("inspection-dialog");
  const request_dialog = node("request-dialog");
  const settings_dialog = node("settings-dialog");
  const rendered_examples = new WeakMap();
  const render = () => {
    const visible = new Set(model.visible_ids);
    for (const card of cards) card.hidden = !visible.has(card.id);
    for (const tab of tabs) {
      tab.setAttribute("aria-selected", String(tab.dataset.kind === model.kind));
      tab.tabIndex = tab.dataset.kind === model.kind ? 0 : -1;
    }
    node("script-panel").setAttribute("aria-labelledby", "tab-" + model.kind);
    node("empty-search").hidden = visible.size > 0;
    node("copy-feedback").textContent = model.message;
    for (const button of buttons) button.disabled = model.copying;
    node("inspection-title").textContent = model.inspection ? model.inspection.title + " · 巡检结果" : "巡检结果";
    node("inspection-status").textContent = model.inspection_status;
    for (const section of inspections) {
      section.hidden = section.dataset.script !== model.inspection?.id;
      if (section.hidden) continue;
      for (const list of section.querySelectorAll('[data-n="route-examples"]')) {
        const examples = model.saved_parameters[list.dataset.route];
        if (rendered_examples.has(list) && rendered_examples.get(list) === examples) continue;
        rendered_examples.set(list, examples);
        list.replaceChildren();
        for (const example of model.route_examples(list.dataset.route)) {
          const item = document.createElement("span");
          item.setAttribute("data-n", "saved-example");
          item.className = "saved-example";
          const open = document.createElement("button");
          open.setAttribute("data-n", "open-example");
          open.type = "button";
          open.textContent = example.label;
          open.title = example.label;
          open.addEventListener("click", () => model.open_request(list.dataset.route, example.id));
          const remove = document.createElement("button");
          remove.setAttribute("data-n", "delete-example");
          remove.type = "button";
          remove.textContent = "×";
          remove.setAttribute("aria-label", "删除示例：" + example.label);
          remove.title = "删除示例";
          remove.addEventListener("click", () => {
            if (model.delete_example(list.dataset.route, example.id)) list.nextElementSibling.focus();
          });
          item.append(open, remove);
          list.append(item);
        }
      }
    }
    if (model.inspection && !inspection_dialog.open) inspection_dialog.showModal();
    if (!model.inspection && inspection_dialog.open) inspection_dialog.close();
    const fields = node("request-fields");
    if (model.request && fields.dataset.route !== model.request.key) {
      fields.replaceChildren();
      fields.dataset.route = model.request.key;
      for (const [index, field] of model.request.fields.entries()) {
        const label = document.createElement("label");
        label.setAttribute("data-n", "route-parameter-field");
        label.className = "form-field";
        label.htmlFor = "route-parameter-" + index;
        const title = document.createElement("span");
        title.setAttribute("data-n", "route-parameter-label");
        title.className = "form-label";
        title.textContent = field.name + (field.required ? " *" : "");
        const input = document.createElement("input");
        input.setAttribute("data-n", "route-parameter-input");
        input.className = "form-input";
        input.id = label.htmlFor;
        input.dataset.parameter = field.name;
        input.required = field.required;
        input.autocomplete = "off";
        input.addEventListener("input", event => model.set_route_value(field.name, event.target.value));
        label.append(title, input);
        fields.append(label);
      }
    }
    for (const input of fields.querySelectorAll("input")) {
      const value = model.route_values[input.dataset.parameter] || "";
      if (input.value !== value) input.value = value;
    }
    node("request-title").textContent = (model.example_id ? "编辑示例" : "添加示例") + (model.request ? " · " + model.request.path : "");
    node("save-request").textContent = model.example_id ? "保存修改" : "保存示例";
    const output = model.request_output;
    node("request-url").textContent = output.url;
    node("request-curl").textContent = output.curl;
    node("request-status").textContent = model.message || model.request_status || (model.request ? output.error : "");
    const open_url = node("open-request-url");
    open_url.hidden = !output.url;
    if (output.url) open_url.setAttribute("href", output.url); else open_url.removeAttribute("href");
    for (const button of document.querySelectorAll("[data-request-copy]")) button.disabled = model.copying || !output.url;
    if (model.request && !request_dialog.open) request_dialog.showModal();
    if (!model.request && request_dialog.open) request_dialog.close();
    for (const [name, input] of [["baseURL", node("settings-base-url")], ["token", node("settings-token")]]) {
      if (input.value !== model.settings_draft[name]) input.value = model.settings_draft[name];
    }
    node("settings-error").textContent = model.settings_error;
    if (model.settings_open && !settings_dialog.open) settings_dialog.showModal();
    if (!model.settings_open && settings_dialog.open) settings_dialog.close();
  };
  node("script-search").addEventListener("input", event => model.search(event.target.value));
  for (const tab of tabs) {
    tab.addEventListener("click", () => model.select_kind(tab.dataset.kind));
    tab.addEventListener("keydown", event => {
      if (model.move_tab(event.key)) {
        event.preventDefault();
        tabs.find(tab => tab.dataset.kind === model.kind).focus();
      }
    });
  }
  for (const button of buttons) button.addEventListener("click", () => model.copy(button.dataset.script));
  for (const button of document.querySelectorAll('[data-n="inspect-script"]')) button.addEventListener("click", () => model.inspect(button.dataset.script));
  for (const button of document.querySelectorAll('[data-n="configure-route"]')) button.addEventListener("click", () => model.open_request(button.dataset.route));
  for (const button of document.querySelectorAll("[data-request-copy]")) button.addEventListener("click", () => model.copy_request(button.dataset.requestCopy));
  for (const name of ["open-settings", "request-settings"]) node(name).addEventListener("click", () => model.open_settings());
  node("settings-base-url").addEventListener("input", event => model.set_setting("baseURL", event.target.value));
  node("settings-token").addEventListener("input", event => model.set_setting("token", event.target.value));
  node("settings-form").addEventListener("submit", event => {
    event.preventDefault(); model.save_settings();
  });
  node("request-form").addEventListener("submit", event => {
    event.preventDefault(); model.save_request();
  });
  for (const [name, dialog, close] of [["inspection", inspection_dialog, () => model.close_inspection()],
    ["request", request_dialog, () => model.close_request()], ["settings", settings_dialog, () => model.close_settings()]]) {
    node("close-" + name).addEventListener("click", close);
    dialog.addEventListener("cancel", event => { event.preventDefault(); close(); });
    dialog.addEventListener("click", event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right
        || event.clientY < bounds.top || event.clientY > bounds.bottom)) close();
    });
  }
  model.on_change = render;
  render();
}
