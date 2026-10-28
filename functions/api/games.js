import { sign } from "../_lib.js";
/* UNTILS games API (Cloudflare Pages Function)
   Binding chahiye: GAMES (KV namespace). Zip file browser se seedha Supabase Storage me jaati hai. */
const SUPA = "https://fjfkwfklglovuxeecxsg.supabase.co";
const KEY = "sb_publishable_HUSSW4Xiau3suUYMfcTjtQ_h083WJbS";
const CATS = ["Arcade", "Action", "Adventure", "Puzzle", "Racing", "Space", "Casual", "Other"];
const MAX_GAMES = 20;
const cleanTitle = t => String(t || "").replace(/[<>&"'`\\$]/g, "").replace(/\s+/g, " ").trim();
const slugOf = t => String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
async function titleTaken(env, title, selfKey) {
  const want = slugOf(title); let c;
  do {
    const l = await env.GAMES.list({ prefix: "game:", cursor: c });
    for (const k of l.keys) {
      if (k.name === selfKey) continue;
      const g = await env.GAMES.get(k.name, "json");
      if (g && slugOf(g.title || "") === want) return true;
    }
    c = l.list_complete ? null : l.cursor;
  } while (c);
  return false;
}
function shotsOk(a, uid, id) {
  if (a === undefined || a === null || a === "") return [];
  if (!Array.isArray(a) || a.length > 5) return null;
  for (const p of a) if (typeof p !== "string" || !p.startsWith(uid + "/" + id + "-s") || !/-s\d+\.(png|jpg|webp)$/.test(p)) return null;
  return a;
}

const ORI = o => (o === "landscape" || o === "portrait") ? o : "both";
const vlist = g => (Array.isArray(g.versions) && g.versions.length) ? g.versions : (g.path ? [{ n: g.version || 1, path: g.path, at: g.createdAt || 0 }] : []);
const json = (o, s) => new Response(JSON.stringify(o), {
  status: s || 200,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
});

async function who(req) {
  const t = (req.headers.get("Authorization") || "").replace(/^Bearer /i, "");
  if (!t) return null;
  const r = await fetch(SUPA + "/auth/v1/user", { headers: { apikey: KEY, Authorization: "Bearer " + t } });
  if (!r.ok) return null;
  const u = await r.json();
  if (!u || !u.id) return null;
  if (["google", "apple", "phone"].indexOf((u.app_metadata || {}).provider) > -1) return null; /* player accounts are separate from developer accounts */
  return u;
}

export async function onRequestGet({ request, env }) {
  if (!env.GAMES) return json({ error: "KV binding GAMES missing" }, 500);
  const u = await who(request);
  if (!u) return json({ error: "Please sign in again." }, 401);
  const pv = new URL(request.url).searchParams.get("preview");
  if (pv) {
    const pg = /^[a-z0-9-]{8,40}$/.test(pv) ? await env.GAMES.get("game:" + u.id + ":" + pv, "json") : null;
    if (!pg) return json({ error: "Game not found." }, 404);
    const nv = new URL(request.url).searchParams.get("v") === "new", vn = +new URL(request.url).searchParams.get("ver") || 0;
    if (nv && !pg.pending) return json({ error: "No new version waiting." }, 404);
    if (vn && !vlist(pg).some(v => v.n === vn)) return json({ error: "Version not found." }, 404);
    if (!env.PLAY_SECRET || !env.SUPABASE_SERVICE_KEY) return json({ error: "PLAY_SECRET / SUPABASE_SERVICE_KEY not set." }, 500);
    const s = [u.id, pv, Math.floor(Date.now() / 1000) + 86400].concat(vn ? ["v" + vn] : nv ? ["n"] : []).join("~");
    return json({ token: s + "~" + await sign(env, s) });
  }
  const dl = new URL(request.url).searchParams.get("download");
  if (dl) {
    if (!/^[a-z0-9-]{8,40}$/.test(dl)) return json({ error: "Bad game id." }, 400);
    const dg = await env.GAMES.get("game:" + u.id + ":" + dl, "json");
    if (!dg) return json({ error: "Game not found." }, 404);
    const n = +new URL(request.url).searchParams.get("n"), ver = vlist(dg).find(v => v.n === n);
    if (!ver) return json({ error: "Version not found." }, 404);
    if (!env.SUPABASE_SERVICE_KEY) return json({ error: "SUPABASE_SERVICE_KEY not set." }, 500);
    const r = await fetch(SUPA + "/storage/v1/object/game-zips/" + ver.path, { headers: { apikey: env.SUPABASE_SERVICE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_KEY } });
    if (!r.ok) return json({ error: "This version file is no longer available." }, 404);
    return new Response(r.body, { headers: { "Content-Type": "application/zip", "Content-Disposition": 'attachment; filename="' + (slugOf(dg.title) || "game") + "-v" + n + '.zip"', "Cache-Control": "no-store" } });
  }
  const l = await env.GAMES.list({ prefix: "game:" + u.id + ":", limit: 50 });
  const games = (await Promise.all(l.keys.map(k => env.GAMES.get(k.name, "json")))).filter(Boolean);
  const day7 = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  await Promise.all(games.map(async g => {
    g.versions = vlist(g); g.orient = ORI(g.orient);
    const k = g.owner + "~" + g.id;
    const [st, vt] = await Promise.all([env.GAMES.get("stats:" + k, "json"), env.GAMES.get("votes:" + k, "json")]);
    let week = 0; for (const d in ((st && st.d) || {})) if (d >= day7) week += st.d[d];
    g.stats = { plays: (st && st.p) || 0, players: (st && st.u) || 0, week, likes: (vt && vt.l) || 0, dislikes: (vt && vt.d) || 0 };
  }));
  games.sort((a, b) => b.createdAt - a.createdAt);
  return json({ games });
}

export async function onRequestPost({ request, env }) {
  if (!env.GAMES) return json({ error: "KV binding GAMES missing" }, 500);
  const u = await who(request);
  if (!u) return json({ error: "Please sign in again." }, 401);

  let b;
  try { b = await request.json(); } catch (e) { return json({ error: "Bad request." }, 400); }
  const id = String(b.id || "");
  const title = cleanTitle(b.title);
  const desc = String(b.description || "").trim();
  const cat = String(b.category || "");

  if (!/^[a-z0-9-]{8,40}$/.test(id)) return json({ error: "Bad game id." }, 400);
  if (title.length < 2 || title.length > 60) return json({ error: "Title must be 2 to 60 characters." }, 400);
  if (await titleTaken(env, title, null)) return json({ error: "Another game already uses this name. Please choose a different name." }, 400);
  if (desc.length < 10 || desc.length > 500) return json({ error: "Description must be 10 to 500 characters." }, 400);
  if (CATS.indexOf(cat) < 0) return json({ error: "Please choose a category." }, 400);
  if (b.path !== u.id + "/" + id + ".zip") return json({ error: "Bad file path." }, 400);

  const ext = (String(b.icon || "").match(/\.(png|jpg|webp)$/) || [])[1];
  if (!ext || b.icon !== u.id + "/" + id + "." + ext) return json({ error: "Game icon is required." }, 400);

  const bext = (String(b.banner || "").match(/-banner\.(png|jpg|webp)$/) || [])[1];
  if (b.banner && (!bext || b.banner !== u.id + "/" + id + "-banner." + bext)) return json({ error: "Bad banner." }, 400);

  const sh = shotsOk(b.shots, u.id, id);
  if (!sh) return json({ error: "Bad screenshots." }, 400);

  const prefix = "game:" + u.id + ":";
  const existing = await env.GAMES.list({ prefix, limit: MAX_GAMES + 1 });
  if (existing.keys.length >= MAX_GAMES) return json({ error: "Game limit reached." }, 400);

  const game = {
    id, title, description: desc, category: cat,
    studio: (u.user_metadata && u.user_metadata.studio) || "",
    owner: u.id, path: b.path, icon: b.icon, banner: b.banner || "", shots: sh, device: b.device === "desktop" ? "desktop" : "all", orient: b.device === "desktop" ? "both" : ORI(b.orient), versions: [{ n: 1, path: b.path, at: Date.now() }], status: "pending", createdAt: Date.now()
  };
  await env.GAMES.put(prefix + id, JSON.stringify(game));
  return json({ ok: true, game });
}

export async function onRequestPut({ request, env }) {
  if (!env.GAMES) return json({ error: "KV binding GAMES missing" }, 500);
  const u = await who(request);
  if (!u) return json({ error: "Please sign in again." }, 401);
  let b; try { b = await request.json(); } catch (e) { return json({ error: "Bad request." }, 400); }
  const id = String(b.id || "");
  if (!/^[a-z0-9-]{8,40}$/.test(id)) return json({ error: "Bad game id." }, 400);
  const key = "game:" + u.id + ":" + id, g = await env.GAMES.get(key, "json");
  if (!g) return json({ error: "Game not found." }, 404);
  if (b.seen) { g.msgSeen = Date.now(); await env.GAMES.put(key, JSON.stringify(g)); return json({ ok: true }); }
  if (b.sdk && typeof b.sdk === "object") {
    const path = b.sdk.which === "new" ? (g.pending && g.pending.path) : g.path;
    if (!path) return json({ error: "No such version." }, 400);
    g.sdk = { path, ok: !!b.sdk.ok, name: String(b.sdk.name || "").slice(0, 40), version: String(b.sdk.version || "").slice(0, 20), at: Date.now() };
    await env.GAMES.put(key, JSON.stringify(g));
    return json({ ok: true });
  }
  if (b.title !== undefined) {
    const t = cleanTitle(b.title);
    if (t.length < 2 || t.length > 60) return json({ error: "Name must be 2 to 60 characters." }, 400);
    if (t !== g.title) {
      if (await titleTaken(env, t, key)) return json({ error: "Another game already uses this name. Please choose a different name." }, 400);
      g.title = t;
    }
  }
  if (b.description !== undefined) { const d = String(b.description).trim(); if (d.length < 10 || d.length > 500) return json({ error: "Description must be 10 to 500 characters." }, 400); g.description = d; }
  if (b.category !== undefined) { if (CATS.indexOf(b.category) < 0) return json({ error: "Please choose a category." }, 400); g.category = b.category; }
  if (b.device !== undefined) g.device = b.device === "desktop" ? "desktop" : "all";
  if (b.orient !== undefined || b.device !== undefined) g.orient = g.device === "desktop" ? "both" : ORI(b.orient !== undefined ? b.orient : g.orient);
  const ok = (p, re) => typeof p === "string" && p.startsWith(u.id + "/" + id + "-") && re.test(p);
  if (b.icon) { if (!ok(b.icon, /-i\d+\.(png|jpg|webp)$/)) return json({ error: "Bad icon." }, 400); g.icon = b.icon; }
  if (b.banner) { if (!ok(b.banner, /-b\d+\.(png|jpg|webp)$/)) return json({ error: "Bad banner." }, 400); g.banner = b.banner; }
  if (b.shots !== undefined) { const sh = shotsOk(b.shots, u.id, id); if (!sh) return json({ error: "Bad screenshots." }, 400); g.shots = sh; }
  if (b.removeBanner && !b.banner) g.banner = "";
  if (b.path) { if (!ok(b.path, /-v\d+\.zip$/)) return json({ error: "Bad file path." }, 400); { const vs = vlist(g).slice(); vs.push({ n: Math.max.apply(null, vs.map(v => v.n).concat([0])) + 1, path: b.path, at: Date.now() }); g.versions = vs.slice(-50); } if (g.status === "live") { g.pending = { path: b.path, at: Date.now() }; g.updateNote = ""; }
    else { g.path = b.path; g.version = (g.version || 1) + 1; if (g.status !== "pending") { g.status = "pending"; g.note = ""; } } }
  g.updatedAt = Date.now();
  await env.GAMES.put(key, JSON.stringify(g));
  return json({ ok: true, game: g });
}

/* Delete a game: removes it from the platform (KV) and its files from storage. Owner only. */
export async function onRequestDelete({ request, env }) {
  if (!env.GAMES) return json({ error: "KV binding GAMES missing" }, 500);
  const u = await who(request);
  if (!u) return json({ error: "Please sign in again." }, 401);
  let b; try { b = await request.json(); } catch (e) { return json({ error: "Bad request." }, 400); }
  const id = String(b.id || "");
  if (!/^[a-z0-9-]{8,40}$/.test(id)) return json({ error: "Bad game id." }, 400);
  const key = "game:" + u.id + ":" + id, g = await env.GAMES.get(key, "json");
  if (!g) return json({ error: "Game not found." }, 404);
  /* 1) platform: the game record goes first, so it disappears from UNTILS immediately */
  await env.GAMES.delete(key);
  const gk = u.id + "~" + id;
  await Promise.all([env.GAMES.delete("stats:" + gk), env.GAMES.delete("votes:" + gk)].map(p => p.catch(() => {})));
  try {
    const rv = await env.GAMES.list({ prefix: "review:" + u.id + ":" + id + ":", limit: 30 });
    await Promise.all(rv.keys.map(k => env.GAMES.delete(k.name).catch(() => {})));
  } catch (e) {}
  /* 2) storage: every file of this game (all versions, icon, banner, screenshots) */
  let files = 0, warn = "";
  if (!env.SUPABASE_SERVICE_KEY) warn = "Files were not removed from storage (SUPABASE_SERVICE_KEY not set).";
  else {
    const h = { apikey: env.SUPABASE_SERVICE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_KEY, "Content-Type": "application/json" };
    for (const bucket of ["game-zips", "game-icons"]) {
      try {
        const lr = await fetch(SUPA + "/storage/v1/object/list/" + bucket, { method: "POST", headers: h, body: JSON.stringify({ prefix: u.id, search: id, limit: 1000 }) });
        const items = lr.ok ? await lr.json() : [];
        const names = items.map(o => o.name).filter(n => typeof n === "string" && n.startsWith(id)).map(n => u.id + "/" + n);
        if (names.length) {
          const dr = await fetch(SUPA + "/storage/v1/object/" + bucket, { method: "DELETE", headers: h, body: JSON.stringify({ prefixes: names }) });
          if (dr.ok) files += names.length; else warn = "Some files could not be removed from storage.";
        }
      } catch (e) { warn = "Some files could not be removed from storage."; }
    }
  }
  return json({ ok: true, files, warn });
}
