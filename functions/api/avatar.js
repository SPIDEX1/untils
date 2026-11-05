/* Public profile picture: /api/avatar?u=<user id>&v=<version> */
export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get("u") || "";
  if (!/^[0-9a-f-]{36}$/.test(id) || !env.GAMES) return new Response("Not found", { status: 404 });
  const p = await env.GAMES.get("profile:" + id, "json");
  if (!p || !p.img) return new Response("Not found", { status: 404 });
  const bin = atob(p.img.split(",")[1] || ""), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return new Response(out, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" } });
}
