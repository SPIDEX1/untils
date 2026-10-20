import { J, me, sign } from "../../_lib.js";
const ID = /^[a-z0-9-]{8,40}$/, UID = /^[0-9a-f-]{36}$/, EM = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export async function onRequest({ request, env, params }) {
  if (!env.GAMES) return J({ error: "KV GAMES missing" }, 500);
  const u = await me(request, env);
  if (!u) return J({ error: "Sign in again." }, 401);
  const a = params.action, q = new URL(request.url).searchParams;
  if (a === "me") return J({ email: u.email, role: u.role });
  if (!u.role) return J({ error: "No access." }, 403);
  const lead = u.role === "leader";
  const b = request.method === "POST" ? await request.json().catch(() => ({})) : {};
  const o = String(q.get("owner") || b.owner || ""), i = String(q.get("id") || b.id || "");
  const gk = "game:" + o + ":" + i;
  const idok = UID.test(o) && ID.test(i);

  if (a === "games") {
    const out = []; let c;
    do { const l = await env.GAMES.list({ prefix: "game:", cursor: c });
      out.push(...await Promise.all(l.keys.map(k => env.GAMES.get(k.name, "json"))));
      c = l.list_complete ? null : l.cursor; } while (c);
    return J({ games: out.filter(Boolean).sort((x, y) => y.createdAt - x.createdAt) });
  }
  if (a === "game") {
    if (!idok) return J({ error: "Bad id." }, 400);
    const g = await env.GAMES.get(gk, "json"); if (!g) return J({ error: "Not found." }, 404);
    const l = await env.GAMES.list({ prefix: "review:" + o + ":" + i + ":" });
    const reviews = (await Promise.all(l.keys.map(k => env.GAMES.get(k.name, "json")))).filter(Boolean);
    return J({ game: g, reviews });
  }
  if (a === "play") {
    if (!idok || !(await env.GAMES.get(gk))) return J({ error: "Not found." }, 404);
    if (!env.PLAY_SECRET || !env.SUPABASE_SERVICE_KEY) return J({ error: "PLAY_SECRET / SUPABASE_SERVICE_KEY not set." }, 500);
    const exp = Math.floor(Date.now() / 1000) + 7200, s = [o, i, exp].join("~");
    return J({ url: "/play/" + s + "~" + await sign(env, s) + "/index.html" });
  }
  if (a === "review" && request.method === "POST") {
    const text = String(b.text || "").trim(), rec = String(b.rec || "");
    if (!idok || !(await env.GAMES.get(gk))) return J({ error: "Not found." }, 404);
    if (text.length < 3 || text.length > 1500) return J({ error: "Review must be 3 to 1500 characters." }, 400);
    if (["approve", "changes", "reject"].indexOf(rec) < 0) return J({ error: "Choose a recommendation." }, 400);
    await env.GAMES.put("review:" + o + ":" + i + ":" + u.email, JSON.stringify({ by: u.email, text, rec, at: Date.now() }));
    return J({ ok: true });
  }
  if (a === "decide" && request.method === "POST") {
    if (!lead) return J({ error: "Only the leader can do this." }, 403);
    const d = String(b.decision || "");
    if (["approved", "rejected", "pending", "live"].indexOf(d) < 0 || !idok) return J({ error: "Bad request." }, 400);
    const g = await env.GAMES.get(gk, "json"); if (!g) return J({ error: "Not found." }, 404);
    if (d === "live" && g.status !== "approved" && g.status !== "live") return J({ error: "Approve the game first." }, 400);
    g.status = d; g.note = String(b.note || "").slice(0, 500); g.decidedAt = Date.now();
    await env.GAMES.put(gk, JSON.stringify(g));
    return J({ ok: true });
  }
  if (a === "popular" && request.method === "POST") {
    if (!lead) return J({ error: "Only the leader can do this." }, 403);
    if (!idok) return J({ error: "Bad request." }, 400);
    const g = await env.GAMES.get(gk, "json"); if (!g) return J({ error: "Not found." }, 404);
    g.popular = !!b.popular; await env.GAMES.put(gk, JSON.stringify(g));
    return J({ ok: true });
  }
  if (a === "staff") {
    if (!lead) return J({ error: "Only the leader can do this." }, 403);
    if (request.method === "POST") {
      const e = String(b.email || "").trim().toLowerCase();
      if (!EM.test(e)) return J({ error: "Invalid email." }, 400);
      if (b.remove) await env.GAMES.delete("staff:" + e); else await env.GAMES.put("staff:" + e, "1");
    }
    const l = await env.GAMES.list({ prefix: "staff:" });
    return J({ staff: l.keys.map(k => k.name.slice(6)) });
  }
  return J({ error: "Unknown action." }, 404);
}
