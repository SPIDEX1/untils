import { adsHead } from "./_ads.js";
/* Puts the AdSense code into the <head> of the public pages (home, games, about, contact, privacy, terms, developers, docs).
   Does nothing until ADSENSE_PUB is set. Never touches game files, admin, dashboard, API or assets. */
const SKIP = /^\/(admin|api|live|play|sdk|assets)(\/|$)|^\/developers\/(dashboard|account|inspector)(\/|$)/;
export async function onRequest(ctx) {
  const res = await ctx.next();
  try {
    if (ctx.request.method !== "GET" || res.status !== 200) return res;
    const tag = adsHead(ctx.env);
    if (!tag) return res;
    if (SKIP.test(new URL(ctx.request.url).pathname)) return res;
    if (!(res.headers.get("Content-Type") || "").includes("text/html")) return res;
    return new HTMLRewriter().on("head", { element(e) { e.append(tag, { html: true }); } }).transform(res);
  } catch (e) { return res; }
}
