import { register } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";

export const worker_url = process.env.FINDRSS_WORKER_ROOT
  ? pathToFileURL(resolve(process.env.FINDRSS_WORKER_ROOT) + "/").href
  : existsSync(new URL("../../.runtime/findrss-worker/package.json", import.meta.url))
    ? new URL("../../.runtime/findrss-worker/", import.meta.url).href
    : new URL("../../../findrss-worker/", import.meta.url).href;

register(new URL("test/support/quickjs_wasm_hook.js", worker_url));
register("./worker_hook.js", import.meta.url, { data: { worker_url } });
