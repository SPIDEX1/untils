import { J } from "../_lib.js";
const K = /^[0-9a-f-]{36}~[a-z0-9-]{8,40}$/, V = /^[a-z0-9]{12,40}$/;
export async function onRequest({ request, env }) {
  const q = new URL(request.url).searchParams, post = request.method === "POST";
  const b = post ? await request.json().catch(() => ({})) : {};
  const g = String(post ? b.g : q.get("g") || ""), vid = String(post ? b.vid : q.get("vid") || ""), v = post ? +b.v : 0;
  if (!K.test(g)) return J({ error: "Bad game." }, 400);
  const [o, i] = g.split("~"), game = await env.GAMES.get("game:" + o + ":" + i, "json");
  if (!game || game.status !== "live") return J({ error: "Not found." }, 404);
  const ck = "votes:" + g, vk = "voter:" + g + ":" + vid;
  const c = (await env.GAMES.get(ck, "json")) || { l: 0, d: 0 };
  let mine = V.test(vid) ? +((await env.GAMES.get(vk)) || 0) : 0;
  if (post) {
    if (!V.test(vid) || [1, -1, 0].indexOf(v) < 0) return J({ error: "Bad vote." }, 400);
    if (mine === 1) c.l--; if (mine === -1) c.d--; if (v === 1) c.l++; if (v === -1) c.d++;
    c.l = Math.max(0, c.l); c.d = Math.max(0, c.d);
    await env.GAMES.put(ck, JSON.stringify(c));
    if (v === 0) await env.GAMES.delete(vk); else await env.GAMES.put(vk, String(v));
    mine = v;
  }
  return J({ l: c.l, d: c.d, mine });
}
