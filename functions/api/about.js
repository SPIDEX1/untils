import { J } from "../_lib.js";
import { loadAbout } from "../_about.js";
/* Public: the people shown on the About page (set by the leader in the admin portal). */
export async function onRequestGet({ env }) {
  let members = []; try { members = env.GAMES ? await loadAbout(env) : []; } catch (e) {}
  const r = J({ members });
  r.headers.set("Cache-Control", "public, max-age=60");
  return r;
}
