import { sign } from "../_lib.js";
import { serve } from "../_zip.js";
export async function onRequestGet({ params, env }) {
  const [tok, ...rest] = params.path || [];
  const parts = String(tok).split("~"), sig = parts.pop(), [o, i, exp, flag] = parts;
  if (!sig || +exp < Date.now() / 1000 || sig !== await sign(env, parts.join("~"))) return new Response("Link expired. Open the game again from the admin portal.", { status: 403 });
  if (!/^[0-9a-f-]{36}$/.test(o) || !/^[a-z0-9-]{8,40}$/.test(i)) return new Response("Bad link", { status: 400 });
  const g = await env.GAMES.get("game:" + o + ":" + i, "json");
  if (!g) return new Response("Game not found", { status: 404 });
  let path;
  if (flag === "n") path = g.pending && g.pending.path;
  else if (/^v\d+$/.test(flag || "")) { const vs = (g.versions && g.versions.length) ? g.versions : [{ n: g.version || 1, path: g.path }], f = vs.find(v => v.n === +flag.slice(1)); path = f && f.path; }
  else path = g.path || (o + "/" + i + ".zip");
  if (!path) return new Response("No such version", { status: 404 });
  return serve(env, o, i, rest, path);
}
