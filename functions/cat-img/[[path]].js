/* category pictures that the leader uploads in the admin portal: /cat-img/<slug>.webp and /cat-img/<slug>-lg.webp */
export async function onRequestGet({ params, env }) {
  const f = [].concat(params.path || []).join("/"), m = /^([a-z0-9-]{1,60})\.webp$/.exec(f);
  if (!m || !env.GAMES) return new Response("Not found", { status: 404 });
  const r = await env.GAMES.getWithMetadata("catimg:" + m[1], "arrayBuffer");
  if (!r || !r.value) return new Response("Not found", { status: 404 });
  return new Response(r.value, { headers: { "Content-Type": (r.metadata && r.metadata.type) || "image/webp", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
}
