import { adsHead } from "./_ads.js";
/* 1) Developer portal lives on developer.untils.in (same Pages project). "/" -> /developers/, "/dashboard/" -> /developers/dashboard/ etc.
   2) untils.in/developers/... redirects to developer.untils.in/...
   3) Puts the AdSense code into the <head> of the public pages. Does nothing until ADSENSE_PUB is set.
      Never touches game files, admin, dashboard, API or assets. */
const DEV_HOST = "developer.untils.in";
const MAIN = /^(www\.)?untils\.in$/;
const DEV_PATHS = /^\/(dashboard|account|inspector|docs)(\/|$)/;
const PASS = /^\/(api|assets|play|sdk)(\/|$)|^\/(favicon\.ico|favicon-32\.png|apple-touch-icon\.png|icon-192\.png)$/;
const MAIN_URL = "https://untils.in";
const DEV_ROBOTS = "User-agent: *\nAllow: /\nDisallow: /dashboard/\nDisallow: /account/\nDisallow: /inspector/\nDisallow: /play/\n\nSitemap: https://" + DEV_HOST + "/sitemap.xml\n";
const DEV_SITEMAP = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>https://' + DEV_HOST + '/</loc><priority>1.0</priority></url>\n<url><loc>https://' + DEV_HOST + '/docs/</loc><priority>0.8</priority></url>\n</urlset>\n';
const SKIP = /^\/(admin|api|live|play|sdk|assets)(\/|$)|^\/developers\/(dashboard|account|inspector)(\/|$)/;
const strip = q => (q.replace(/^\/developers/, "") || "/");
export async function onRequest(ctx) {
  const url = new URL(ctx.request.url), host = url.hostname, p = url.pathname;
  if (MAIN.test(host) && /^\/developers(\/|$)/.test(p))
    return Response.redirect("https://" + DEV_HOST + strip(p) + url.search, 301);
  let res, path = p;
  if (host === DEV_HOST) {
    if (p === "/robots.txt") return new Response(DEV_ROBOTS, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
    if (p === "/sitemap.xml") return new Response(DEV_SITEMAP, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
    if (/^\/developers(\/|$)/.test(p)) return Response.redirect(url.origin + strip(p) + url.search, 301);
    if (p === "/" || DEV_PATHS.test(p)) {
      path = "/developers" + p;
      res = await ctx.env.ASSETS.fetch(new Request(new URL(path, url), ctx.request));
    } else if (!PASS.test(p) && (ctx.request.method === "GET" || ctx.request.method === "HEAD")) {
      /* games, about, contact... belong to untils.in only (no duplicate copies on the subdomain) */
      return Response.redirect(MAIN_URL + p + url.search, 301);
    }
  }
  if (!res) res = await ctx.next();
  try {
    if (ctx.request.method !== "GET" || res.status !== 200) return res;
    const tag = adsHead(ctx.env);
    if (!tag || SKIP.test(path)) return res;
    if (!(res.headers.get("Content-Type") || "").includes("text/html")) return res;
    return new HTMLRewriter().on("head", { element(e) { e.append(tag, { html: true }); } }).transform(res);
  } catch (e) { return res; }
}
