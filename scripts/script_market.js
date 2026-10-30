export function create_market_model(scripts, write_clipboard, storage) {
  const read_saved = key => {
    try {
      const value = JSON.parse(storage?.getItem(key) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch { return {}; }
  };
  const settings_key = "findrss.script-market.settings";
  const parameters_key = "findrss.script-market.parameters";
  const validate_settings = value => {
    let url;
    try { url = new URL(value.baseURL.trim()); } catch { throw new Error("请在设置中填写有效的 baseURL"); }
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
      throw new Error("baseURL 必须为不含凭据、query 或 hash 的 HTTP(S) 地址");
    }
    if (/[\r\n\0]/.test(value.token)) throw new Error("token 不能包含换行或空字符");
    return { baseURL: url.href.replace(/\/+$/, ""), token: value.token.trim() };
  };
  const model = {
    scripts, kinds: ["rss", "hot", "clip", "detect"], kind: "rss", query: "", message: "", message_timer: null, copying: false, inspection: null,
    settings: { baseURL: "", token: "" }, settings_draft: { baseURL: "", token: "" }, settings_open: false, settings_error: "",
    saved_parameters: {}, request: null, example_id: null, route_values: {}, request_status: "", inspection_status: "",
    on_change() {},
    load_storage(next_storage = storage) {
      storage = next_storage;
      const saved = read_saved(settings_key);
      this.settings = { baseURL: typeof saved.baseURL === "string" ? saved.baseURL : "", token: typeof saved.token === "string" ? saved.token : "" };
      this.settings_draft = { ...this.settings };
      this.saved_parameters = Object.fromEntries(Object.entries(read_saved(parameters_key)).map(([key, value]) => [key,
        Array.isArray(value) ? value.filter(example => typeof example?.id === "string" && example.values && typeof example.values === "object" && !Array.isArray(example.values))
          : value && typeof value === "object" ? [{ id: "legacy", values: value }] : [],
      ]));
      this.on_change();
    },
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
      const route = this.scripts.flatMap(script => script.routes || []).find(route => route.key === key);
      const examples = (this.saved_parameters[key] || []).map((example, index) => ({ ...example, deletable: true,
        label: Object.values(example.values).filter(value => typeof value === "string" && value).join(" · ") || "示例 " + (index + 1),
      }));
      if (route) {
        const values = Object.fromEntries(route.fields.map(field => [field.name, field.value || ""]));
        examples.unshift({ id: null, values, deletable: false,
          label: Object.values(values).filter(Boolean).join(" · ") || "默认示例" });
      }
      return examples;
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
  model.load_storage();
  return model;
}
