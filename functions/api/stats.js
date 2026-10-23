import { J } from "../_lib.js";
const K = /^[0-9a-f-]{36}~[a-z0-9-]{8,40}$/, V = /^[a-z0-9]{12,40}$/;
export async function onRequestPost({ request, env }) {
  const b = await request.json().catch(() => ({}));
  const g = String(b.g || ""), vid = String(b.vid || "");
  if (!K.test(g) || !V.test(vid)) return J({ error: "Bad request." }, 400);
  const [o, i] = g.split("~"), game = await env.GAMES.get("game:" + o + ":" + i, "json");
  if (!game || game.status !== "live") return J({ error: "Not found." }, 404);
  const sk = "stats:" + g, st = (await env.GAMES.get(sk, "json")) || { p: 0, u: 0, d: {} };
  const day = new Date().toISOString().slice(0, 10);
  st.p = (st.p || 0) + 1; st.d = st.d || {}; st.d[day] = (st.d[day] || 0) + 1;
  const keys = Object.keys(st.d).sort(); while (keys.length > 14) delete st.d[keys.shift()];
  const sn = "seen:" + g + ":" + vid;
  if (!(await env.GAMES.get(sn))) { await env.GAMES.put(sn, "1"); st.u = (st.u || 0) + 1; }
  await env.GAMES.put(sk, JSON.stringify(st));
  return J({ plays: st.p });
}
