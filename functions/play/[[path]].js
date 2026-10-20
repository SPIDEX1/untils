import { sign } from "../_lib.js";
import { serve } from "../_zip.js";
export async function onRequestGet({ params, env }) {
  const [tok, ...rest] = params.path || [];
  const [o, i, exp, sig] = String(tok).split("~");
  if (!sig || +exp < Date.now() / 1000 || sig !== await sign(env, [o, i, exp].join("~"))) return new Response("Link expired. Open the game again from the admin portal.", { status: 403 });
  if (!/^[0-9a-f-]{36}$/.test(o) || !/^[a-z0-9-]{8,40}$/.test(i)) return new Response("Bad link", { status: 400 });
  return serve(env, o, i, rest);
}
