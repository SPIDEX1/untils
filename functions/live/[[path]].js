import { serve } from "../_zip.js";
export async function onRequestGet({ params, env }) {
  const [tok, ...rest] = params.path || [];
  const [o, i] = String(tok).split("~");
  if (!/^[0-9a-f-]{36}$/.test(o || "") || !/^[a-z0-9-]{8,40}$/.test(i || "")) return new Response("Bad link", { status: 400 });
  const g = await env.GAMES.get("game:" + o + ":" + i, "json");
  if (!g || g.status !== "live") return new Response("Game not available", { status: 404 });
  return serve(env, o, i, rest);
}
