/* Public: the demo files shown in the documentation (icon, banner, thumbnail, screenshots, text logo, gameplay video). */
import { SUPA } from "../_lib.js";
const KINDS = ["icon", "banner", "thumb", "shots", "logo", "video"];
const url = p => SUPA + "/storage/v1/object/public/docs-demo/" + p;
export async function onRequestGet({ env }) {
  const items = {};
  if (env.GAMES) {
    await Promise.all(KINDS.map(async function (k) {
      const d = await env.GAMES.get("demo:" + k, "json").catch(function () { return null; });
      if (k === "shots") { if (d && d.list && d.list.length) items.shots = { list: d.list.map(function (x) { return { url: url(x.path), type: x.type, size: x.size, at: x.at }; }) }; }
      else if (d && d.path) items[k] = { url: url(d.path), type: d.type, size: d.size, at: d.at, dur: d.dur || null };
    }));
  }
  return new Response(JSON.stringify({ items: items }), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" } });
}
