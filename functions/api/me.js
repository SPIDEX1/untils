import { J, playerOf } from "../_lib.js";
/* Player profile. Everyone who is signed in already has a name and picture (from their Google or email account).
   This only stores optional changes: a custom username, a custom picture, favourites, recently played.
   KV: profile:<uid>  and  uname:<lowercase name> -> uid (custom names are unique). */
const GK = /^[0-9a-f-]{36}~[a-z0-9-]{8,40}$/, NAME = /^[A-Za-z0-9_.]{3,20}$/, IMG = /^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/;
const list = (a, max) => Array.isArray(a) ? [...new Set(a.filter(x => typeof x === "string" && GK.test(x)))].slice(0, max) : null;
const view = (u, p) => ({ id: u.id, name: p.name || u.dname, custom: !!p.name, av: p.img ? (p.av || 1) : 0, pic: u.pic || "", favs: p.favs || [], recent: p.recent || [] });

export async function onRequest({ request, env }) {
  if (!env.GAMES) return J({ error: "Server is not ready." }, 500);
  const u = await playerOf(request);
  if (!u) return J({ error: "Please sign in again." }, 401);
  const pk = "profile:" + u.id;
  const p = (await env.GAMES.get(pk, "json")) || { name: "", av: 0, img: "", favs: [], recent: [] };
  if (request.method === "GET") return J(view(u, p));
  if (request.method !== "POST") return J({ error: "Not allowed." }, 405);

  const b = await request.json().catch(() => ({}));
  if (b.name !== undefined) {
    const n = String(b.name || "").trim();
    if (n === "") {                                   /* empty = go back to the default name */
      if (p.name) await env.GAMES.delete("uname:" + p.name.toLowerCase());
      p.name = "";
    } else {
      if (!NAME.test(n)) return J({ error: "Username must be 3 to 20 letters, numbers, _ or . (no spaces)." }, 400);
      if (/untils|admin|moderator|support/i.test(n)) return J({ error: "That username is reserved. Please pick another." }, 400);
      const nk = "uname:" + n.toLowerCase(), owner = await env.GAMES.get(nk);
      if (owner && owner !== u.id) return J({ error: "That username is taken. Try another." }, 409);
      if (p.name && p.name.toLowerCase() !== n.toLowerCase()) await env.GAMES.delete("uname:" + p.name.toLowerCase());
      if (owner !== u.id) await env.GAMES.put(nk, u.id);
      p.name = n;
    }
  }
  if (b.avatar !== undefined) {
    const a = String(b.avatar || "");
    if (a === "") { p.img = ""; p.av = 0; }           /* empty = go back to the default picture */
    else if (!IMG.test(a) || a.length > 60000) return J({ error: "That picture could not be used. Try a different one." }, 400);
    else { p.img = a; p.av = Date.now(); }
  }
  const f = list(b.favs, 100), r = list(b.recent, 12);
  if (f) p.favs = f;
  if (r) p.recent = r;
  await env.GAMES.put(pk, JSON.stringify(p));
  return J(view(u, p));
}
