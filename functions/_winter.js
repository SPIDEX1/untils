/* WINTER UPDATE: settings (saved by the leader in the admin portal) and the tags that switch it on. Not a route.
   When winter is OFF nothing is added to any page, so the site loads exactly as before. */
const WV = "1"; /* change when winter.css / winter.js change */
export const WDEF = { on: true, intro: true, snow: true, frost: true, click: true, amount: "medium", until: "" };
const bool = (v, d) => v === undefined ? d : v === true || v === "true" || v === 1;
export function cleanWinter(b) {
  b = b || {};
  const amount = ["low", "medium", "high"].indexOf(b.amount) > -1 ? b.amount : WDEF.amount;
  const until = /^\d{4}-\d{2}-\d{2}$/.test(String(b.until || "")) ? String(b.until) : "";
  return { on: bool(b.on, WDEF.on), intro: bool(b.intro, WDEF.intro), snow: bool(b.snow, WDEF.snow), frost: bool(b.frost, WDEF.frost), click: bool(b.click, WDEF.click), amount, until };
}
let memo = { t: 0, v: null };
export async function loadWinter(env) {
  if (memo.v && Date.now() - memo.t < 15000) return memo.v;
  let raw = null; try { raw = await env.GAMES.get("cfg:winter", "json"); } catch (e) {}
  memo = { t: Date.now(), v: cleanWinter(raw || WDEF) };
  return memo.v;
}
export const forgetWinter = () => { memo = { t: 0, v: null }; };
/* is winter showing right now? (ON and not past the optional end date) */
export const winterActive = (cfg, now) => !!(cfg && cfg.on && (!cfg.until || (now || new Date().toISOString().slice(0, 10)) <= cfg.until));
export function winterHead(cfg) {
  const c = { i: cfg.intro ? 1 : 0, s: cfg.snow ? 1 : 0, f: cfg.frost ? 1 : 0, c: cfg.click ? 1 : 0, a: cfg.amount };
  return '<link rel="stylesheet" href="/assets/css/winter.css?v=' + WV + '">' +
    '<script>(function(){var d=document.documentElement,w=window.__WINTER=' + JSON.stringify(c) + ';d.setAttribute("data-winter","1");if(w.f)d.setAttribute("data-wf","1");' +
    'var seen=0;try{seen=sessionStorage.getItem("wi1")}catch(e){}if(w.i&&(!seen||/[?&]winterintro/.test(location.search))&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("w-pre");setTimeout(function(){d.classList.remove("w-pre")},3800)}})()</script>' +
    '<script src="/assets/js/winter.js?v=' + WV + '" defer></script>';
}
