import { withStudio } from "../_lib.js";
const launchedOf = g => g.launchedAt || g.decidedAt || g.createdAt || 0;
const updatedOf = g => g.versionAt || ((g.version || 1) > 1 && g.updatedAt) || launchedOf(g);
export async function onRequestGet({ env }) {
  const out = []; let c;
  if (env.GAMES) do { const l = await env.GAMES.list({ prefix: "game:", cursor: c });
    out.push(...await Promise.all(l.keys.map(k => env.GAMES.get(k.name, "json"))));
    c = l.list_complete ? null : l.cursor; } while (c);
  const live = await withStudio(env, out.filter(g => g && g.status === "live").sort((a, b) => b.decidedAt - a.decidedAt));
  const games = live
    .map(g => ({ key: g.owner + "~" + g.id, title: g.title, category: g.category, description: g.description, studio: g.studio, device: g.device, orient: g.orient || "both", icon: g.icon || "", banner: g.banner || "", thumb: g.thumb || "", logo: g.logo || "", video: g.video || "", shots: g.shots || [], popular: !!g.popular, launched: launchedOf(g), updated: updatedOf(g) }));
  return new Response(JSON.stringify({ games }), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" } });
}
