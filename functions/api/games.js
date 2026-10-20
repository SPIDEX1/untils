/* UNTILS games API (Cloudflare Pages Function)
   Binding chahiye: GAMES (KV namespace). Zip file browser se seedha Supabase Storage me jaati hai. */
const SUPA = "https://fjfkwfklglovuxeecxsg.supabase.co";
const KEY = "sb_publishable_HUSSW4Xiau3suUYMfcTjtQ_h083WJbS";
const CATS = ["Arcade", "Action", "Adventure", "Puzzle", "Racing", "Space", "Casual", "Other"];
const MAX_GAMES = 20;

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

  const prefix = "game:" + u.id + ":";
  const existing = await env.GAMES.list({ prefix, limit: MAX_GAMES + 1 });
  if (existing.keys.length >= MAX_GAMES) return json({ error: "Game limit reached." }, 400);

  const game = {
    id, title, description: desc, category: cat,
    studio: (u.user_metadata && u.user_metadata.studio) || "",
    owner: u.id, path: b.path, device: b.device === "desktop" ? "desktop" : "all", status: "pending", createdAt: Date.now()
  };
  await env.GAMES.put(prefix + id, JSON.stringify(game));
  return json({ ok: true, game });
}
