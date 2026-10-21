/* UNTILS games API (Cloudflare Pages Function)
   Binding chahiye: GAMES (KV namespace). Zip file browser se seedha Supabase Storage me jaati hai. */
const SUPA = "https://fjfkwfklglovuxeecxsg.supabase.co";
const KEY = "sb_publishable_HUSSW4Xiau3suUYMfcTjtQ_h083WJbS";
const CATS = ["Arcade", "Action", "Adventure", "Puzzle", "Racing", "Space", "Casual", "Other"];
const MAX_GAMES = 20;
function shotsOk(a, uid, id) {
  if (a === undefined || a === null || a === "") return [];
  if (!Array.isArray(a) || a.length > 5) return null;
  for (const p of a) if (typeof p !== "string" || !p.startsWith(uid + "/" + id + "-s") || !/-s\d+\.(png|jpg|webp)$/.test(p)) return null;
  return a;
}

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
  return u && u.id ? u : null;
}

export async function onRequestGet({ request, env }) {
  if (!env.GAMES) return json({ error: "KV binding GAMES missing" }, 500);
  const u = await who(request);
  if (!u) return json({ error: "Please sign in again." }, 401);
  const l = await env.GAMES.list({ prefix: "game:" + u.id + ":", limit: 50 });
  const games = (await Promise.all(l.keys.map(k => env.GAMES.get(k.name, "json")))).filter(Boolean);
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
  const title = String(b.title || "").trim();
  const desc = String(b.description || "").trim();
  const cat = String(b.category || "");

  if (!/^[a-z0-9-]{8,40}$/.test(id)) return json({ error: "Bad game id." }, 400);
  if (title.length < 2 || title.length > 60) return json({ error: "Title must be 2 to 60 characters." }, 400);
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
    owner: u.id, path: b.path, icon: b.icon, banner: b.banner || "", shots: sh, device: b.device === "desktop" ? "desktop" : "all", status: "pending", createdAt: Date.now()
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
  if (b.description !== undefined) { const d = String(b.description).trim(); if (d.length < 10 || d.length > 500) return json({ error: "Description must be 10 to 500 characters." }, 400); g.description = d; }
  if (b.category !== undefined) { if (CATS.indexOf(b.category) < 0) return json({ error: "Please choose a category." }, 400); g.category = b.category; }
  if (b.device !== undefined) g.device = b.device === "desktop" ? "desktop" : "all";
  const ok = (p, re) => typeof p === "string" && p.startsWith(u.id + "/" + id + "-") && re.test(p);
  if (b.icon) { if (!ok(b.icon, /-i\d+\.(png|jpg|webp)$/)) return json({ error: "Bad icon." }, 400); g.icon = b.icon; }
  if (b.banner) { if (!ok(b.banner, /-b\d+\.(png|jpg|webp)$/)) return json({ error: "Bad banner." }, 400); g.banner = b.banner; }
  if (b.shots !== undefined) { const sh = shotsOk(b.shots, u.id, id); if (!sh) return json({ error: "Bad screenshots." }, 400); g.shots = sh; }
  if (b.removeBanner && !b.banner) g.banner = "";
  if (b.path) { if (!ok(b.path, /-v\d+\.zip$/)) return json({ error: "Bad file path." }, 400); g.path = b.path; g.version = (g.version || 1) + 1; }
  g.updatedAt = Date.now();
  await env.GAMES.put(key, JSON.stringify(g));
  return json({ ok: true, game: g });
}
