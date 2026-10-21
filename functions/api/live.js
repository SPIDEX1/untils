export async function onRequestGet({ env }) {
  const out = []; let c;
  if (env.GAMES) do { const l = await env.GAMES.list({ prefix: "game:", cursor: c });
    out.push(...await Promise.all(l.keys.map(k => env.GAMES.get(k.name, "json"))));
    c = l.list_complete ? null : l.cursor; } while (c);
  const games = out.filter(g => g && g.status === "live").sort((a, b) => b.decidedAt - a.decidedAt)
    .map(g => ({ key: g.owner + "~" + g.id, title: g.title, category: g.category, description: g.description, studio: g.studio, device: g.device, icon: g.icon || "", banner: g.banner || "", shots: g.shots || [], popular: !!g.popular }));
  return new Response(JSON.stringify({ games }), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" } });
}
