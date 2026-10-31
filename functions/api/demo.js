/* Public: the demo files shown in the documentation (icon, banner, thumbnail, text logo, gameplay video). */
import { SUPA } from "../_lib.js";
const KINDS = ["icon", "banner", "thumb", "logo", "video"];
export async function onRequestGet({ env }) {
  const items = {};
  if (env.GAMES) {
    await Promise.all(KINDS.map(async function (k) {
      const d = await env.GAMES.get("demo:" + k, "json").catch(function () { return null; });
      if (d && d.path) items[k] = { url: SUPA + "/storage/v1/object/public/docs-demo/" + d.path, type: d.type, size: d.size, at: d.at, dur: d.dur || null };
    }));
  }
  return new Response(JSON.stringify({ items: items }), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" } });
}
