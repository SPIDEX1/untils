import { esc, slugOf } from "./_seo.js";
/* Category pages: /genre/ and /genre/<category>/. Pure HTML builders (not a route). */
export const CAT_INFO = {
  "Action": "Action games are all about fast reactions, quick decisions and constant movement. Expect fights, chases and levels that keep your fingers busy from the first second.",
  "Adventure": "Adventure games send you on a journey: explore new places, find hidden things, solve small mysteries and follow a story at your own pace.",
  "Arcade": "Arcade games are easy to start and hard to put down. Short rounds, simple controls and one more try for a higher score.",
  "Board": "Board games on UNTILS bring the classic table-top feeling to your browser. Play turn by turn against the computer or your friends.",
  "Card": "Card games mix luck and planning. Learn the rules in a minute, then work on your strategy to win the round.",
  "Casual": "Casual games are made for relaxed play. No long tutorials, no pressure, just something fun for a short break.",
  "Educational": "Educational games make learning feel like play. Practise numbers, words, logic and general knowledge while having fun.",
  "Endless Runner": "In endless runners you keep moving and the world never stops. Jump, slide and dodge to travel further than your last run.",
  "Fighting": "Fighting games test your timing and skill in one-on-one battles. Learn the moves, block at the right moment and beat your rival.",
  "Horror": "Horror games are built to make your heart race. Dark places, strange sounds and something that might be watching you. Play with the lights off if you dare.",
  "Idle": "Idle games let progress happen while you relax. Tap, upgrade, unlock new things and watch your numbers grow.",
  "Kids": "Kids games are colourful, simple and safe to play. Easy controls and friendly characters make them a good fit for younger players.",
  "Multiplayer": "Multiplayer games are better with other people. Challenge friends or players around the world and see who wins.",
  "Music": "Music games are all about rhythm. Follow the beat, hit the notes on time and let the sound guide you.",
  "Platformer": "Platformers are about running, jumping and timing. Cross gaps, avoid traps and reach the end of each level.",
  "Puzzle": "Puzzle games make you stop and think. Match, connect, sort or slide pieces until you find the solution.",
  "Racing": "Racing games are about speed and control. Pick up speed, take the corners well and cross the finish line first.",
  "Role Playing": "Role playing games let you become a character and grow stronger. Collect gear, level up and decide how your hero develops.",
  "Sandbox": "Sandbox games give you freedom. Build, create and experiment with no fixed rules telling you what to do.",
  "Shooter": "Shooter games test your aim and your reflexes. Pick your target, stay on the move and clear every wave.",
  "Simulation": "Simulation games copy things from real life in a playful way. Manage, build or drive and see the results of your choices.",
  "Space": "Space games take you beyond the sky. Fly through stars, explore planets and face challenges in zero gravity.",
  "Sports": "Sports games bring football, cricket, basketball and more to your screen. Play a quick match and try to win.",
  "Strategy": "Strategy games reward clever planning. Think ahead, manage your resources and outsmart your opponent.",
  "Survival": "Survival games ask one question: how long can you last? Gather what you need, stay alert and stay alive.",
  "Tower Defense": "In tower defense games you build defences to stop waves of enemies. Place your towers wisely and protect your base.",
  "Trivia": "Trivia games test what you know. Answer quickly, learn something new and challenge your friends to beat your score.",
  "Word": "Word games exercise your vocabulary. Find, guess and build words under the clock or at your own speed.",
  "Other": "These games do not fit a single box. Try them for something different from the usual."
};
const clip = (t, n) => { t = String(t || "").replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : t; };
const STYLE = '<style>.gx p{max-width:760px}.gx-list{list-style:none;padding:0;margin:18px 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}.gx-list li{display:flex;gap:12px;align-items:flex-start;background:#fff;border:1px solid #cfe6ff;border-radius:16px;padding:12px}.gx-list img{width:64px;height:64px;border-radius:14px;object-fit:cover;flex:none;background:#eaf6ff}.gx-list a{font-weight:800;color:#12233d;text-decoration:none}.gx-list a:hover{color:#0a6cff}.gx-list small{display:block;color:#51617a;margin-top:4px;line-height:1.45}.gx-cats{display:flex;flex-wrap:wrap;gap:10px;list-style:none;padding:0;margin:16px 0}.gx-cats a{display:inline-block;background:#eaf6ff;border:1px solid #cfe6ff;border-radius:99px;padding:8px 16px;font-weight:700;color:#12233d;text-decoration:none}</style>';
export const catsOf = games => [...new Set(games.map(g => g.category).filter(Boolean))].sort();
const tile = g => '<li>' + (g.icon ? '<img src="' + esc(g.icon) + '" alt="" width="64" height="64" loading="lazy">' : '<img alt="" width="64" height="64" src="/assets/img/u-icon.png?v=2">') +
  '<div><a href="/games/' + esc(g.slug) + '/">' + esc(g.title) + '</a><small>' + esc(clip(g.description, 150)) + "</small></div></li>";

/* /genre/ */
export function indexPage(games) {
  const cats = catsOf(games);
  const n = c => games.filter(g => g.category === c).length;
  const list = cats.length ? '<ul class="gx-cats">' + cats.map(c => '<li><a href="/genre/' + slugOf(c) + '/">' + esc(c) + " (" + n(c) + ")</a></li>").join("") + "</ul>" : "<p>New games are on the way. Please check back soon.</p>";
  const info = cats.map(c => "<h2>" + esc(c) + " games</h2><p>" + esc(CAT_INFO[c] || CAT_INFO.Other) + ' <a href="/genre/' + slugOf(c) + '/">See all ' + esc(c.toLowerCase()) + " games</a>.</p>").join("");
  return {
    title: "Game Categories - Browse Free Online Games | UNTILS",
    desc: "Browse free online games on UNTILS by category" + (cats.length ? ": " + cats.slice(0, 6).join(", ") + " and more." : "."),
    h1: "Game Categories", html: STYLE + '<div class="gx"><h1>Game Categories</h1><p>Every game on UNTILS runs in your browser, free and with no download. Pick a category to find something you will enjoy, or <a href="/games/">see all games</a>.</p>' + list + info + "</div>",
    ld: { "@type": "CollectionPage", name: "Game Categories", url: "https://untils.in/genre/" }
  };
}
/* /genre/<category>/ (returns null when there is no such category) */
export function catPage(games, seg) {
  const cat = catsOf(games).find(c => slugOf(c) === seg); if (!cat) return null;
  const list = games.filter(g => g.category === cat), others = catsOf(games).filter(c => c !== cat);
  const intro = CAT_INFO[cat] || CAT_INFO.Other, url = "https://untils.in/genre/" + slugOf(cat) + "/";
  return {
    title: cat + " Games - Play Free Online | UNTILS",
    desc: "Play free " + cat.toLowerCase() + " games online on UNTILS: " + list.slice(0, 4).map(g => g.title).join(", ") + (list.length > 4 ? " and more." : "."),
    h1: cat + " Games",
    html: STYLE + '<div class="gx"><h1>' + esc(cat) + " Games</h1><p>" + esc(intro) + "</p><p>There " + (list.length === 1 ? "is 1 free " + esc(cat.toLowerCase()) + " game" : "are " + list.length + " free " + esc(cat.toLowerCase()) + " games") +
      " on UNTILS right now. All of them play in your browser on mobile and PC, with no download.</p><ul class=\"gx-list\">" + list.map(tile).join("") + "</ul>" +
      (others.length ? "<h2>More categories</h2><ul class=\"gx-cats\">" + others.map(c => '<li><a href="/genre/' + slugOf(c) + '/">' + esc(c) + "</a></li>").join("") + "</ul>" : "") + '<p><a href="/games/">See all UNTILS games</a></p></div>',
    ld: { "@type": "CollectionPage", name: cat + " Games", url, mainEntity: { "@type": "ItemList", itemListElement: list.slice(0, 50).map((g, i) => ({ "@type": "ListItem", position: i + 1, url: "https://untils.in/games/" + g.slug + "/", name: g.title })) } }
  };
}
