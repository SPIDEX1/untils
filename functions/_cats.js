import { esc, slugOf } from "./_seo.js";
/* The 15 UNTILS categories (order = order on the site), their pictures, texts and the shared category CSS. Not a route. */
export const CATEGORIES = ["Arcade", "Board", "Casual", "Educational", "Fighting", "Horror", "Platformer", "Puzzle", "Racing", "Runner", "Shooting", "Sports", "Stickman", "Tower Defense", "Adventure"].map(name => ({ name, slug: slugOf(name) }));
const ALIAS = { "endless runner": "Runner", "shooter": "Shooting", "sport": "Sports", "tower defence": "Tower Defense", "stick man": "Stickman" };
/* old category names are mapped to the new ones */
export const canon = c => { const t = String(c || "").trim(); return ALIAS[t.toLowerCase()] || t; };
export const catImg = (name, big) => CATEGORIES.some(c => c.name === name) ? "/assets/img/cat/" + slugOf(name) + (big ? "-lg" : "") + ".webp?v=1" : "/assets/img/u-icon.png?v=2";
/* categories that have games: the 15 first (in order), then any other old category */
export function catsOf(games) {
  const have = new Set(games.map(g => canon(g.category)).filter(Boolean)), main = CATEGORIES.map(c => c.name);
  return main.filter(n => have.has(n)).concat([...have].filter(n => main.indexOf(n) < 0).sort());
}
export const gamesIn = (games, name) => games.filter(g => canon(g.category) === name);

export const CAT_INFO = {
  "Arcade": "Arcade games are easy to start and hard to put down. Short rounds, simple controls and one more try for a higher score.",
  "Board": "Board games on UNTILS bring the classic table-top feeling to your browser. Play turn by turn against the computer or your friends.",
  "Casual": "Casual games are made for relaxed play. No long tutorials, no pressure, just something fun for a short break.",
  "Educational": "Educational games make learning feel like play. Practise numbers, words, logic and general knowledge while having fun.",
  "Fighting": "Fighting games test your timing and skill in one-on-one battles. Learn the moves, block at the right moment and beat your rival.",
  "Horror": "Horror games are built to make your heart race. Dark places, strange sounds and something that might be watching you. Play with the lights off if you dare.",
  "Platformer": "Platformers are about running, jumping and timing. Cross gaps, avoid traps and reach the end of each level.",
  "Puzzle": "Puzzle games make you stop and think. Match, connect, sort or slide pieces until you find the solution.",
  "Racing": "Racing games are about speed and control. Pick up speed, take the corners well and cross the finish line first.",
  "Runner": "In runner games you keep moving and the world never stops. Jump, slide and dodge to travel further than your last run.",
  "Shooting": "Shooting games test your aim and your reflexes. Pick your target, stay on the move and clear every wave.",
  "Sports": "Sports games bring football, cricket, basketball and more to your screen. Play a quick match and try to win.",
  "Stickman": "Stickman games star simple drawn characters with big action. Jump, fight and survive with smooth controls and quick thinking.",
  "Tower Defense": "In tower defense games you build defences to stop waves of enemies. Place your towers wisely and protect your base.",
  "Adventure": "Adventure games send you on a journey: explore new places, find hidden things, solve small mysteries and follow a story at your own pace.",
  /* older categories that may still have games */
  "Action": "Action games are all about fast reactions, quick decisions and constant movement.", "Card": "Card games mix luck and planning. Learn the rules in a minute, then work on your strategy.",
  "Idle": "Idle games let progress happen while you relax. Tap, upgrade and watch your numbers grow.", "Kids": "Kids games are colourful, simple and safe to play.",
  "Multiplayer": "Multiplayer games are better with other people. Challenge friends and see who wins.", "Music": "Music games are all about rhythm. Follow the beat and hit the notes on time.",
  "Role Playing": "Role playing games let you become a character and grow stronger.", "Sandbox": "Sandbox games give you freedom to build, create and experiment.",
  "Simulation": "Simulation games copy things from real life in a playful way.", "Space": "Space games take you beyond the sky to explore stars and planets.",
  "Strategy": "Strategy games reward clever planning. Think ahead and outsmart your opponent.", "Survival": "Survival games ask one question: how long can you last?",
  "Trivia": "Trivia games test what you know. Answer quickly and learn something new.", "Word": "Word games exercise your vocabulary. Find, guess and build words.",
  "Other": "These games do not fit a single box. Try them for something different."
};
export const CAT_TIPS = {
  "Arcade": "Arcade games reward practice. Learn the pattern of the first few rounds, stay calm when the speed picks up, and try to beat your own high score instead of rushing.",
  "Board": "In board games, think a few moves ahead. Watch what your opponent is building, keep your pieces safe and do not rush a move that you can plan.",
  "Casual": "Casual games are about enjoying the moment. Play for a few minutes, take your time and try again if you miss. There is rarely a penalty for relaxing.",
  "Educational": "To learn the most from educational games, read each question slowly, try to answer before you check the hint, and replay a level you got wrong.",
  "Fighting": "In fighting games, learn your basic moves first. Watch your opponent's pattern, block at the right time and attack right after they miss.",
  "Horror": "Horror games work best when you stay alert. Listen for sounds, check dark corners carefully and remember where you have already been. Headphones make it scarier.",
  "Platformer": "Platformers reward good timing. Take small jumps first, watch how far each jump goes and wait for moving platforms instead of rushing across.",
  "Puzzle": "For puzzle games, look at the whole board before your first move. Try the easy parts first, and if you get stuck, restart the level with a fresh idea.",
  "Racing": "In racing games, slow down before a sharp turn and speed up as you leave it. Smooth steering is usually faster than hard turns.",
  "Runner": "Runner games are about rhythm. Look ahead instead of at your character, collect the coins that are on your path and stay calm when the speed increases.",
  "Shooting": "In shooting games, aim carefully instead of firing without a target. Use cover when you can, keep moving between shots and reload before a big wave.",
  "Sports": "Sports games are fun once you learn the timing. Practise passing, shooting or hitting a few times, then focus on planning your moves.",
  "Stickman": "Stickman games look simple but need good control. Learn how your stickman jumps and attacks, avoid taking every hit and use the level to your advantage.",
  "Tower Defense": "In tower defense games, place towers where the path bends so they can shoot for longer. Upgrade your strongest towers and save some coins for the next wave.",
  "Adventure": "In adventure games, explore every corner. Collect the items you find and think about where you might use them later."
};

/* css used by the home page and by the category pages (inline, so it never gets stuck in the browser cache) */
export const UI_CSS = '<style>' +
  '.cx-sec{max-width:1200px;margin:22px auto 8px;padding:0 3vw}.cx-sec>h2{margin:0 0 12px;font-size:22px}' +
  '.cx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(205px,1fr));gap:14px}' +
  '.cx{display:flex;align-items:center;gap:12px;background:#fff;border-radius:18px;box-shadow:var(--sh);padding:10px 14px 10px 10px;text-decoration:none;color:var(--navy);font-family:var(--fh);font-weight:800;font-size:16px;line-height:1.15;transition:transform .2s,box-shadow .2s;min-width:0}' +
  '.cx:hover{transform:translateY(-3px);box-shadow:0 12px 24px rgba(10,108,255,.28)}.cx img{width:64px;height:64px;border-radius:14px;object-fit:cover;flex:none}.cx span{min-width:0;overflow-wrap:anywhere}' +
  '.tx{color:#233652;line-height:1.75;font-size:15px;min-width:0}.tx h2{margin:0 0 14px;font-size:30px;line-height:1.2}.tx h3{margin:24px 0 8px;font-size:19px}.tx h4{margin:14px 0 2px;font-size:15px}' +
  '.tx p{margin:0 0 12px;max-width:900px}.tx ul,.tx ol{margin:6px 0 12px;padding-left:22px;max-width:900px}.tx li{margin:4px 0}.tx li span{color:#6a7c96;font-size:13px}.tx a{color:#0a6cff;font-weight:700;text-decoration:none}.tx a:hover{text-decoration:underline}' +
  '.hm-wrap{max-width:1200px;margin:30px auto 12px;padding:0 3vw}.hm-text{background:#fff;border-radius:24px;box-shadow:var(--sh);padding:30px 32px}' +
  '.gx-main{max-width:1200px;margin:0 auto;padding:26px 3vw 60px}.gx-main h1{margin:0 0 6px;font-size:clamp(30px,5vw,46px);line-height:1.15}.gx-lead{max-width:760px;color:var(--mut);margin:0 0 4px}' +
  '.gx-main .grid{padding:16px 0 6px}.gx-main .th img{width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit}.gx-main .cx-sec{padding:0;margin:30px 0 0}' +
  '.gx-empty{background:#fff;border-radius:20px;box-shadow:var(--sh);padding:26px;color:var(--mut);margin:16px 0}' +
  '.gx-info{display:flex;gap:32px;align-items:flex-start;background:#fff;border-radius:26px;box-shadow:var(--sh);padding:30px 32px;margin-top:34px}' +
  '.gx-logo{width:clamp(130px,22vw,240px);height:auto;aspect-ratio:1;border-radius:28px;box-shadow:0 10px 26px rgba(10,60,160,.25);flex:none}' +
  '@media(max-width:700px){.cx-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.cx{padding:8px 10px 8px 8px;gap:9px;font-size:13.5px;border-radius:16px}.cx img{width:50px;height:50px;border-radius:12px}' +
  '.hm-text{padding:22px 18px}.tx h2{font-size:24px}.gx-info{flex-direction:column;gap:18px;padding:22px 18px}.gx-logo{width:130px}}' +
  '</style>';

/* the category tiles: picture on the left, name on the right. `except` = the category page you are on (left out) */
export const tilesHTML = except => CATEGORIES.filter(c => c.name !== except).map(c =>
  '<a class="cx" href="/genre/' + c.slug + '/"><img src="' + catImg(c.name) + '" alt="" width="64" height="64" loading="lazy"><span>' + esc(c.name) + "</span></a>").join("");
