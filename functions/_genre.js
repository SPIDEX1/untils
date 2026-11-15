import { esc, slugOf } from "./_seo.js";
import { CATEGORIES, CAT_INFO, CAT_TIPS, UI_CSS, canon, catImg, catsOf, gamesIn, tilesHTML } from "./_cats.js";
/* /genre/ and /genre/<category>/ page builders. Pure functions (not a route). */
const clip = (t, n) => { t = String(t || "").replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : t; };
const card = g => '<a class="card" href="/games/' + esc(g.slug) + '/" aria-label="Play ' + esc(g.title) + '"><div class="th" style="background:linear-gradient(135deg,#1aa7ff,#7a3ffc)">' +
  (g.icon ? '<img src="' + esc(g.icon) + '" alt="' + esc(g.title) + '" loading="lazy">' : "🎮") + '</div><div class="cb"><h3>' + esc(g.title) + "</h3></div></a>";

export function indexPage(games) {
  const present = catsOf(games), n = c => gamesIn(games, c).length;
  const info = CATEGORIES.map(c => '<h3><a href="/genre/' + c.slug + '/">' + esc(c.name) + " games</a>" + (n(c.name) ? " (" + n(c.name) + ")" : "") + "</h3><p>" + esc(CAT_INFO[c.name]) + "</p>").join("");
  return {
    title: "Game Categories - Browse Free Online Games | UNTILS", noindex: false,
    desc: "Browse free online games on UNTILS by category: " + CATEGORIES.slice(0, 7).map(c => c.name).join(", ") + " and more.",
    h1: "Game Categories",
    html: UI_CSS + '<h1>Game Categories</h1><p class="gx-lead">Every game on UNTILS runs in your browser, free and with no download. Pick a category to find something you will enjoy, or <a href="/games/" style="color:var(--ac)">see all games</a>.</p>' +
      '<section class="cx-sec"><div class="cx-grid">' + tilesHTML("") + '</div></section><section class="gx-info" style="display:block"><div class="tx"><h2>What kind of game do you want to play?</h2>' + info + "</div></section>",
    ld: { "@type": "CollectionPage", name: "Game Categories", url: "https://untils.in/genre/" }
  };
}

/* returns null when there is no such category */
export function catPage(games, seg) {
  let name = (CATEGORIES.find(c => c.slug === seg) || {}).name;
  if (!name) name = catsOf(games).find(c => slugOf(c) === seg);
  if (!name) return null;
  const list = gamesIn(games, name), cl = name.toLowerCase(), N = list.length, url = "https://untils.in/genre/" + slugOf(name) + "/";
  const intro = CAT_INFO[name] || CAT_INFO.Other, tip = CAT_TIPS[name] || "";
  const top = list.slice().sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || (b.launched || 0) - (a.launched || 0)).slice(0, 5);
  const grid = N ? '<div class="grid">' + list.map(card).join("") + "</div>" :
    '<div class="gx-empty"><b>No ' + esc(cl) + ' games yet.</b> New games are added all the time, so please check back soon. Meanwhile you can <a href="/games/" style="color:var(--ac);font-weight:700">play all UNTILS games</a>.</div>';
  const faq = (q, a) => "<h4>" + q + "</h4><p>" + a + "</p>";
  const body = '<div class="tx"><h2>Play Free ' + esc(name) + " Games Online on UNTILS</h2><p>" + esc(intro) + "</p>" +
    (N ? "<p>There " + (N === 1 ? "is <b>1 free " + esc(cl) + " game</b>" : "are <b>" + N + " free " + esc(cl) + " games</b>") + " on UNTILS right now. All of them play in your browser on mobile and PC, with nothing to download.</p>" : "<p>We are adding " + esc(cl) + " games to UNTILS. Developers upload them themselves, and every game is checked by our team before it goes live.</p>") +
    (top.length ? "<h3>Top " + esc(cl) + " games</h3><ol>" + top.map(g => '<li><a href="/games/' + esc(g.slug) + '/">' + esc(g.title) + "</a> <span>" + esc(clip(g.description, 110)) + "</span></li>").join("") + "</ol>" : "") +
    (tip ? "<h3>Tips for " + esc(cl) + " games</h3><p>" + esc(tip) + "</p>" : "") +
    "<h3>Why play " + esc(cl) + " games on UNTILS?</h3><p>Every game on UNTILS is free and opens right in your browser, so you can start playing in seconds on your phone, tablet or computer. Our team checks each game before it goes live.</p>" +
    "<h3>Questions about " + esc(cl) + " games</h3>" +
    faq("Are " + esc(cl) + " games on UNTILS free?", "Yes. Every " + esc(cl) + " game on UNTILS is free to play. You do not need to pay or install anything.") +
    faq("Can I play " + esc(cl) + " games on my phone?", "Yes. Most games work on phones, tablets and computers. A game made only for computers says so on its game page.") +
    faq("How do I find more " + esc(cl) + " games?", "New games are added by independent developers all the time. Come back to this page, or use the search bar at the top to look for a game by name.") +
    "</div>";
  return {
    title: name + " Games - Play Free Online | UNTILS", noindex: N === 0,
    desc: "Play free " + cl + " games online on UNTILS" + (N ? ": " + list.slice(0, 4).map(g => g.title).join(", ") + (N > 4 ? " and more." : ".") : ". New games coming soon."),
    h1: name + " Games",
    html: UI_CSS + "<h1>" + esc(name) + " Games</h1><p class=\"gx-lead\">" + esc(intro) + "</p>" + grid +
      '<section class="cx-sec"><h2>More categories</h2><div class="cx-grid">' + tilesHTML(name) + "</div></section>" +
      '<section class="gx-info"><img class="gx-logo" src="' + catImg(name, true) + '" alt="' + esc(name) + ' games" width="240" height="240">' + body + "</section>",
    ld: { "@type": "CollectionPage", name: name + " Games", url, image: "https://untils.in" + catImg(name, true), mainEntity: { "@type": "ItemList", itemListElement: list.slice(0, 50).map((g, i) => ({ "@type": "ListItem", position: i + 1, url: "https://untils.in/games/" + g.slug + "/", name: g.title })) } }
  };
}
