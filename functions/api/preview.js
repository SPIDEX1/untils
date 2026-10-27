import { J, sign } from "../_lib.js";
export async function onRequestGet({ request, env }) {
  const t = new URL(request.url).searchParams.get("t") || "", p = t.split("~"), sig = p.pop(), [o, i, exp] = p;
  if (!env.GAMES || !env.PLAY_SECRET || !sig || p.length < 3 || p.length > 4 || +exp < Date.now() / 1000 || sig !== await sign(env, p.join("~"))) return J({ error: "Link expired." }, 403);
  if (!/^[0-9a-f-]{36}$/.test(o) || !/^[a-z0-9-]{8,40}$/.test(i)) return J({ error: "Bad link." }, 400);
  const g = await env.GAMES.get("game:" + o + ":" + i, "json");
  if (!g) return J({ error: "Not found." }, 404);
  return J({ key: o + "~" + i, title: g.title, category: g.category, description: g.description, studio: g.studio, device: g.device, orient: g.orient || "both", icon: g.icon || "", shots: g.shots || [], status: g.status });
}
