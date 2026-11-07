/* Shared helpers for game SEO (game pages + sitemap). Not a route. */
export const slugOf = t => String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
export const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const ICON_BASE = "https://fjfkwfklglovuxeecxsg.supabase.co/storage/v1/object/public/game-icons/";
const cleanTitle = t => String(t || "").replace(/[<>&"'`\\$]/g, "").trim();

/* Live games list, cached for 5 minutes so crawlers do not hammer KV. */
export async function liveGames(env) {
  const ck = new Request("https://seo-cache.invalid/live-games-v2"), cache = caches.default;
  const hit = await cache.match(ck);
  if (hit) { try { return await hit.json(); } catch (e) {} }
  const out = []; let c;
  if (!env.GAMES) return [];
  do {
    const l = await env.GAMES.list({ prefix: "game:", cursor: c });
    out.push(...await Promise.all(l.keys.map(k => env.GAMES.get(k.name, "json"))));
    c = l.list_complete ? null : l.cursor;
  } while (c);
  const seen = new Set(), games = [];
  for (const g of out.filter(g => g && g.status === "live").sort((a, b) => (b.decidedAt || 0) - (a.decidedAt || 0))) {
    const title = cleanTitle(g.title), slug = slugOf(title);
    if (!title || !slug || seen.has(slug)) continue;
    seen.add(slug);
    games.push({
      title, slug, category: g.category || "", description: String(g.description || "").replace(/\s+/g, " ").trim(),
      icon: g.icon ? ICON_BASE + g.icon : "", shot: (g.shots && g.shots[0]) ? ICON_BASE + g.shots[0] : "",
      banner: g.banner ? ICON_BASE + g.banner : "", at: g.decidedAt || g.createdAt || 0,
      launched: g.launchedAt || g.decidedAt || g.createdAt || 0,
      updated: g.versionAt || ((g.version || 1) > 1 && g.updatedAt) || g.launchedAt || g.decidedAt || g.createdAt || 0
    });
  }
  await cache.put(ck, new Response(JSON.stringify(games), { headers: { "Content-Type": "application/json", "Cache-Control": "max-age=300" } }));
  return games;
}

/* Plain, crawlable links to every live game (the game cards on the page are buttons that need JavaScript). */
export function gameLinksHTML(games) {
  if (!games || !games.length) return "";
  return '<section class="gl-seo" aria-label="All games"><h2>ALL UNTILS GAMES</h2><ul>' +
    games.slice(0, 300).map(g => '<li><a href="/games/' + esc(g.slug) + '/">' + esc(g.title) + '</a></li>').join("") + "</ul></section>";
}
/* Adds that list right after the games grid. If anything goes wrong the original page is returned untouched. */
export async function withGameLinks(res, env) {
  try {
    const html = gameLinksHTML(await liveGames(env));
    if (!html) return res;
    const out = new HTMLRewriter().on("div#grid", { element(e) { e.after(html, { html: true }); } }).transform(res);
    const h = new Headers(out.headers); h.set("Cache-Control", "public, max-age=300");
    return new Response(out.body, { status: res.status, headers: h });
  } catch (e) { return res; }
}
