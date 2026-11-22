import { J, SUPA, sign, withStudio } from "../_lib.js";
export async function onRequestGet({ request, env }) {
  const t = new URL(request.url).searchParams.get("t") || "", p = t.split("~"), sig = p.pop(), [o, i, exp] = p;
  if (!env.GAMES || !env.PLAY_SECRET || !sig || p.length < 3 || p.length > 4 || +exp < Date.now() / 1000 || sig !== await sign(env, p.join("~"))) return J({ error: "Link expired." }, 403);
  if (!/^[0-9a-f-]{36}$/.test(o) || !/^[a-z0-9-]{8,40}$/.test(i)) return J({ error: "Bad link." }, 400);
  const g = await env.GAMES.get("game:" + o + ":" + i, "json");
  if (!g) return J({ error: "Not found." }, 404);
  await withStudio(env, [g]);
  /* the "?" icon shown for every game in preview mode (the leader can change it in the admin Demo tab) */
  let pvicon = "/assets/img/preview-icon.webp?v=1"; try { const d = await env.GAMES.get("demo:pvicon", "json"); if (d && d.path) pvicon = SUPA + "/storage/v1/object/public/docs-demo/" + d.path; } catch (e) {}
  const dr = g.status === "draft"; /* a draft (zip uploaded, game not created yet) has no title or text */
  return J({ key: o + "~" + i, title: g.title || (dr ? "Draft Preview" : ""), category: g.category || (dr ? "Preview" : ""), categories: (Array.isArray(g.categories) && g.categories.length ? g.categories : [g.category]).filter(Boolean), description: g.description || (dr ? "Draft preview of your game. It is not published yet." : ""), howto: g.howto || "", pvicon, studio: g.studio, device: g.device || "all", orient: g.orient || "both", icon: g.icon || "", shots: g.shots || [], status: g.status });
}
