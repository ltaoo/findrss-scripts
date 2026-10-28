import { ScriptCookieAccess } from "../.runtime/findrss-worker/server/infra/script_cookie_access.js";
import { script_error } from "./errors.js";

export class WorkerCookieAccess extends ScriptCookieAccess {
  header(handle, target, derived = {}) {
    const header = super.header(handle, target, derived);
    if (!header) throw script_error("SCRIPT_COOKIE_PERMISSION_REQUIRED");
    return header;
  }
}
