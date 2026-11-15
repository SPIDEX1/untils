import { esc, slugOf, liveGames } from "./_seo.js";
import { CAT_INFO, UI_CSS, canon, catsOf, gamesIn, tilesHTML } from "./_cats.js";
/* Home page: category tiles at the front (above the games) + a long text section below. Built from the real live games. Not a route. */
const clip = (t, n) => { t = String(t || "").replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : t; };
const first = t => (String(t || "").match(/^.*?[.!?](\s|$)/) || [String(t || "")])[0].trim();
const fd = ms => { try { return new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }); } catch (e) { return ""; } };
const link = g => '<a href="/games/' + esc(g.slug) + '/">' + esc(g.title) + "</a>";

/* the 15 category tiles (always shown, they are the way into every category) */
export const tilesSection = () => UI_CSS + '<section class="cx-sec" aria-label="Game categories"><h2>Browse By Category</h2><div class="cx-grid">' + tilesHTML("") + "</div></section>";

/* the long text below the games */
export function textSection(games) {
  const n = games.length;
  if (!n) return '<section class="hm-wrap"><div class="hm-text tx"><h2>Free online games on UNTILS</h2><p>UNTILS is a free place to play online games right in your browser, with nothing to download. New games are being added, so please check back soon.</p></div></section>';
  const cats = catsOf(games).map(c => ({ c, list: gamesIn(games, c) })).sort((a, b) => b.list.length - a.list.length || a.c.localeCompare(b.c));
  const top = games.slice().sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || (b.launched || 0) - (a.launched || 0)).slice(0, 5);
  const fresh = games.slice().sort((a, b) => (b.launched || 0) - (a.launched || 0)).slice(0, 5);
  const tries = cats.slice(0, 3).map(x => { const g = x.list[0]; return "<li>Like " + esc(x.c.toLowerCase()) + " games? Try " + link(g) + ". " + esc(clip(first(g.description), 130)) + "</li>"; }).join("");
  const desktopOnly = games.some(g => g.device === "desktop");
  const faq = (q, a) => "<h4>" + q + "</h4><p>" + a + "</p>";
  return '<section class="hm-wrap"><div class="hm-text tx"><h2>Free online games on UNTILS</h2>' +
    "<p>Play <b>" + n + " free " + (n === 1 ? "game" : "games") + "</b> instantly on UNTILS! Every game runs in your browser, so there is nothing to download or install. " +
    (desktopOnly ? "Most games work on mobile, tablet and desktop, and the few made only for computers say so on their page." : "All of the games work on mobile, tablet and desktop.") + "</p>" +
    (tries ? "<ul>" + tries + "</ul>" : "") +
    "<p>New games arrive all the time, because independent developers upload them to UNTILS themselves. Our team checks every game before it goes live, so you can open a game and start playing without worry.</p>" +
    "<h3>Top free games</h3><p>Start with these " + top.length + " games:</p><ol>" + top.map(g => "<li>" + link(g) + " <span>" + esc(canon(g.category) || "Game") + "</span></li>").join("") + "</ol>" +
    "<h3>New on UNTILS</h3><ul>" + fresh.map(g => "<li>" + link(g) + (g.launched ? " <span>added " + fd(g.launched) + "</span>" : "") + "</li>").join("") + "</ul>" +
    "<h3>What kind of game are you in the mood for?</h3>" + cats.map(x => '<p><b><a href="/genre/' + slugOf(x.c) + '/">' + esc(x.c) + " games</a></b> (" + x.list.length + "): " + esc(first(CAT_INFO[x.c] || CAT_INFO.Other)) + "</p>").join("") +
    '<h3>Made by developers like you</h3><p>Do you build HTML5 games? Create a free account on the <a href="https://developer.untils.in/">UNTILS developer portal</a>, upload your game, add a description and screenshots, and send it for review. You get the result by email within 2 days, and once your game is live it reaches players for free.</p>' +
    "<h3>Questions</h3>" +
    faq("Are the games on UNTILS really free?", "Yes. Every game on UNTILS is free to play. You do not need to pay for anything or install an app.") +
    faq("Do I need to download anything?", "No. Games open and play right in your browser.") +
    faq("Can I play on my phone?", "Yes. Most games work on phones, tablets and computers. Games made only for computers say so on their game page.") +
    faq("How do I find a game I like?", "Use the search bar at the top, or open a category such as " + esc(cats[0].c) + " to see every game of that kind.") +
    faq("How can I add my own game?", "Create a developer account, upload your HTML5 game and submit it for review. Our team replies by email within 2 days.") +
    "</div></section>";
}
export const homeHTML = games => tilesSection() + textSection(games);

/* tiles go before the games grid, text goes after it. If anything goes wrong the original page is returned untouched. */
export async function withHome(res, env) {
  try {
    let games = []; try { games = await liveGames(env); } catch (e) {}
    const text = textSection(games), tiles = tilesSection();
    const out = new HTMLRewriter().on("div#grid", { element(e) { e.before(tiles, { html: true }); e.after(text, { html: true }); } }).transform(res);
    const h = new Headers(out.headers); h.set("Cache-Control", "public, max-age=300");
    return new Response(out.body, { status: res.status, headers: h });
  } catch (e) { return res; }
}
