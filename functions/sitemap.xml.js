import { liveGames, esc } from "./_seo.js";
const STATIC = [
  ["/", "2026-11-04", "1.0"], ["/games/", "2026-11-04", "0.9"], ["/about/", "2026-10-16", "0.6"],
  ["/contact/", "2026-11-01", "0.4"], ["/privacy/", "2026-11-01", "0.3"], ["/terms/", "2026-11-01", "0.3"]
];
export async function onRequestGet({ env }) {
  let games = []; try { games = await liveGames(env); } catch (e) {}
  const row = (p, d, pr) => "<url><loc>https://untils.in" + esc(p) + "</loc>" + (d ? "<lastmod>" + d + "</lastmod>" : "") + "<priority>" + pr + "</priority></url>";
  const body = STATIC.map(s => row(s[0], s[1], s[2])).join("\n") + "\n" +
    games.map(g => row("/games/" + g.slug + "/", g.at ? new Date(g.at).toISOString().slice(0, 10) : "", "0.8")).join("\n");
  return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "\n</urlset>\n",
    { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
