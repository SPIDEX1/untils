/* Public: the Game Art sections shown in the documentation (2D Art and 3D Art Style). */
import { SUPA } from "../_lib.js";
const GROUPS = ["2d", "3d"];
const url = p => SUPA + "/storage/v1/object/public/docs-demo/" + p;
export async function onRequestGet({ env }) {
  const groups = { "2d": [], "3d": [] };
  if (env.GAMES) {
    await Promise.all(GROUPS.map(async function (k) {
      const d = await env.GAMES.get("art:" + k, "json").catch(function () { return null; });
      if (d && d.list) groups[k] = d.list.map(function (x) { return { id: x.id, name: x.name, url: url(x.path) }; });
    }));
  }
  return new Response(JSON.stringify({ groups: groups }), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" } });
}
