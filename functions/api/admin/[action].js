import { notify } from "../../_mail.js";
import { J, me, sign, withStudio, getLock, unlocked, unlockTok, checkCode, hashCode, rnd } from "../../_lib.js";
const ID = /^[a-z0-9-]{8,40}$/, UID = /^[0-9a-f-]{36}$/, EM = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export async function onRequest({ request, env, params, waitUntil }) {
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

  /* ---- admin code (lock) ---- */
  if (a === "lock") return J({ set: !!(await getLock(env)), open: await unlocked(request, env, u) });
  if (a === "unlock" || a === "setcode") {
    if (request.method !== "POST") return J({ error: "Bad request." }, 405);
    if (!env.PLAY_SECRET) return J({ error: "PLAY_SECRET is not set on the server." }, 500);
    const l = await getLock(env), code = String(b.code || "");
    if (a === "unlock") {
      if (!l) return J({ ok: true, token: "" });
      const c = await checkCode(env, u.email, code, l);
      return c.ok ? J({ ok: true, token: await unlockTok(env, u.email, l) }) : J({ error: c.error }, c.status);
    }
    if (!lead) return J({ error: "Only the leader can do this." }, 403);
    if (l) { const c = await checkCode(env, u.email, String(b.current || ""), l); if (!c.ok) return J({ error: c.status === 429 ? c.error : "Current code is wrong." }, c.status); }
    if (code.length < 4 || code.length > 64) return J({ error: "The code must be 4 to 64 characters." }, 400);
    if (code !== String(b.confirm || "")) return J({ error: "The two codes do not match." }, 400);
    const salt = rnd(16), nl = { salt, hash: await hashCode(code, salt), v: rnd(8), at: Date.now(), by: u.email };
    await env.GAMES.put("admin:lock", JSON.stringify(nl));
    return J({ ok: true, token: await unlockTok(env, u.email, nl) });
  }
  if (!(await unlocked(request, env, u))) return J({ error: "Enter the admin code.", locked: true }, 423);

  if (a === "games") {
    const out = []; let c;
    do { const l = await env.GAMES.list({ prefix: "game:", cursor: c });
      out.push(...await Promise.all(l.keys.map(k => env.GAMES.get(k.name, "json"))));
      c = l.list_complete ? null : l.cursor; } while (c);
    return J({ games: await withStudio(env, out.filter(g => g && g.status !== "draft").sort((x, y) => y.createdAt - x.createdAt)) });
  }
  if (a === "game") {
    if (!idok) return J({ error: "Bad id." }, 400);
    const g = await env.GAMES.get(gk, "json"); if (!g) return J({ error: "Not found." }, 404);
    const l = await env.GAMES.list({ prefix: "review:" + o + ":" + i + ":" });
    const reviews = (await Promise.all(l.keys.map(k => env.GAMES.get(k.name, "json")))).filter(Boolean);
    await withStudio(env, [g]);
    return J({ game: g, reviews });
  }
  if (a === "play") {
    const pg = idok ? await env.GAMES.get(gk, "json") : null;
    if (!pg) return J({ error: "Not found." }, 404);
    const nv = q.get("v") === "new" && pg.pending;
    if (!env.PLAY_SECRET || !env.SUPABASE_SERVICE_KEY) return J({ error: "PLAY_SECRET / SUPABASE_SERVICE_KEY not set." }, 500);
    const exp = Math.floor(Date.now() / 1000) + 7200, s = [o, i, exp].concat(nv ? ["n"] : []).join("~");
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
    const prev = g.status, prevNote = g.note;
    g.status = d; g.note = String(b.note || "").slice(0, 500); g.decidedAt = Date.now(); if (d === "live" && !g.launchedAt) g.launchedAt = Date.now();
    await env.GAMES.put(gk, JSON.stringify(g));
    if (d === "rejected" && (prev !== "rejected" || prevNote !== g.note)) await notify(env, waitUntil, "rejected", g, { reason: g.note });   /* email: sorry + the leader's reason */
    if (d === "live" && prev !== "live") await notify(env, waitUntil, "live", g);                                                          /* email: hurray */
    return J({ ok: true });
  }
  if (a === "update" && request.method === "POST") {
    if (!lead) return J({ error: "Only the leader can do this." }, 403);
    if (!idok) return J({ error: "Bad request." }, 400);
    const g = await env.GAMES.get(gk, "json"); if (!g || !g.pending) return J({ error: "No update waiting." }, 404);
    if (b.decision === "approve") { g.path = g.pending.path; g.version = (g.version || 1) + 1; g.updateNote = ""; g.versionAt = Date.now(); }
    else if (b.decision === "reject") g.updateNote = String(b.note || "Update rejected").slice(0, 300);
    else return J({ error: "Bad request." }, 400);
    delete g.pending; g.updatedAt = Date.now();
    await env.GAMES.put(gk, JSON.stringify(g));
    await notify(env, waitUntil, b.decision === "approve" ? "update_live" : "update_rejected", g, { reason: g.updateNote });
    return J({ ok: true });
  }
  if (a === "message" && request.method === "POST") {
    if (!lead) return J({ error: "Only the leader can do this." }, 403);
    const text = String(b.text || "").trim();
    if (!idok || text.length < 2 || text.length > 500) return J({ error: "Message must be 2 to 500 characters." }, 400);
    const g = await env.GAMES.get(gk, "json"); if (!g) return J({ error: "Not found." }, 404);
    g.msgs = (g.msgs || []).concat([{ text, at: Date.now() }]).slice(-20);
    await env.GAMES.put(gk, JSON.stringify(g));
    await notify(env, waitUntil, "message", g, { text });   /* email: Message from UNTILS Team */
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
