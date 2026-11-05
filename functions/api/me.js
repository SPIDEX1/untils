import { J, playerOf } from "../_lib.js";
/* Player profile: username, profile picture, favourites, recently played.
   KV keys: profile:<uid>  and  uname:<lowercase name> -> uid (names are unique). */
const GK = /^[0-9a-f-]{36}~[a-z0-9-]{8,40}$/, NAME = /^[A-Za-z0-9_.]{3,20}$/, IMG = /^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/;
const list = (a, max) => Array.isArray(a) ? [...new Set(a.filter(x => typeof x === "string" && GK.test(x)))].slice(0, max) : null;
const view = (id, p) => ({ id, name: p.name || "", hasProfile: !!p.name, av: p.av || 0, favs: p.favs || [], recent: p.recent || [] });

export async function onRequest({ request, env }) {
  if (!env.GAMES) return J({ error: "Server is not ready." }, 500);
  const u = await playerOf(request);
  if (!u) return J({ error: "Please sign in again." }, 401);
  const pk = "profile:" + u.id;
  const p = (await env.GAMES.get(pk, "json")) || { name: "", av: 0, img: "", favs: [], recent: [] };
  if (request.method === "GET") return J(view(u.id, p));
  if (request.method !== "POST") return J({ error: "Not allowed." }, 405);

  const b = await request.json().catch(() => ({}));
  if (b.name !== undefined) {
    const n = String(b.name || "").trim();
    if (!NAME.test(n)) return J({ error: "Username must be 3 to 20 letters, numbers, _ or . (no spaces)." }, 400);
    if (/untils|admin|moderator|support/i.test(n)) return J({ error: "That username is reserved. Please pick another." }, 400);
    const nk = "uname:" + n.toLowerCase(), owner = await env.GAMES.get(nk);
    if (owner && owner !== u.id) return J({ error: "That username is taken. Try another." }, 409);
    if (p.name && p.name.toLowerCase() !== n.toLowerCase()) await env.GAMES.delete("uname:" + p.name.toLowerCase());
    if (owner !== u.id) await env.GAMES.put(nk, u.id);
    p.name = n;
  }
  if (b.avatar !== undefined) {
    const a = String(b.avatar || "");
    if (a === "") { p.img = ""; p.av = 0; }
    else if (!IMG.test(a) || a.length > 60000) return J({ error: "That picture could not be used. Try a different one." }, 400);
    else { p.img = a; p.av = Date.now(); }
  }
  const f = list(b.favs, 100), r = list(b.recent, 12);
  if (f) p.favs = f;
  if (r) p.recent = r;
  if (!p.name && b.name === undefined && (b.avatar !== undefined)) return J({ error: "Choose a username first." }, 400);
  await env.GAMES.put(pk, JSON.stringify(p));
  return J(view(u.id, p));
}
