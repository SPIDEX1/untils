import { J, playerOf } from "../_lib.js";
/* Game comments. KV key comments:<game key> = newest-first array (max 200). Needs a player account with a username. */
const GK = /^[0-9a-f-]{36}~[a-z0-9-]{8,40}$/, CID = /^[a-z0-9]{6,20}$/;
const pub = c => ({ id: c.i, u: c.u, n: c.n, v: c.v || 0, t: c.t, at: c.at });

export async function onRequest({ request, env }) {
  if (!env.GAMES) return J({ error: "Server is not ready." }, 500);
  const q = new URL(request.url).searchParams, m = request.method;
  const b = m === "POST" ? await request.json().catch(() => ({})) : {};
  const g = String(m === "POST" ? b.g : q.get("g") || "");
  if (!GK.test(g)) return J({ error: "Bad game." }, 400);
  const [o, i] = g.split("~"), game = await env.GAMES.get("game:" + o + ":" + i, "json");
  if (!game || game.status !== "live") return J({ error: "Game not found." }, 404);
  const ck = "comments:" + g, all = (await env.GAMES.get(ck, "json")) || [];

  if (m === "GET") return J({ n: all.length, items: all.slice(0, 50).map(pub) });

  const u = await playerOf(request);
  if (!u) return J({ error: "Please sign in to comment." }, 401);

  if (m === "DELETE") {
    const id = q.get("id") || "";
    if (!CID.test(id)) return J({ error: "Bad comment." }, 400);
    const keep = all.filter(c => !(c.i === id && c.u === u.id));
    if (keep.length === all.length) return J({ error: "Comment not found." }, 404);
    await env.GAMES.put(ck, JSON.stringify(keep));
    return J({ n: keep.length, items: keep.slice(0, 50).map(pub) });
  }
  if (m !== "POST") return J({ error: "Not allowed." }, 405);

  const p = await env.GAMES.get("profile:" + u.id, "json");
  if (!p || !p.name) return J({ error: "Create your username first.", need: "profile" }, 403);
  let t = String(b.text || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (!t) return J({ error: "Write something first." }, 400);
  if (Array.from(t).length > 300) return J({ error: "Comments can be up to 300 characters." }, 400);
  if (/https?:|www\.|\.(com|net|org|in|io|xyz|ru|cn)\b/i.test(t)) return J({ error: "Links are not allowed in comments." }, 400);
  const mine = all.find(c => c.u === u.id);
  if (mine && Date.now() - mine.at < 15000) return J({ error: "Please wait a few seconds before commenting again." }, 429);
  if (mine && mine.t === t) return J({ error: "You already posted that." }, 400);
  const c = { i: Math.random().toString(36).slice(2, 10), u: u.id, n: p.name, v: p.av || 0, t, at: Date.now() };
  all.unshift(c);
  await env.GAMES.put(ck, JSON.stringify(all.slice(0, 200)));
  return J({ n: all.length, items: all.slice(0, 50).map(pub) });
}
