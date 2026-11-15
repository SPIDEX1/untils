import { liveGames, esc } from "../_seo.js";
import { indexPage, catPage } from "../_genre.js";
/* /genre/ and /genre/<category>/ : real server-rendered pages (title, text, links) built from the live games. Uses the privacy page as the page frame. */
export async function onRequestGet({ request, env, params }) {
  let games = []; try { games = await liveGames(env); } catch (e) {}
  const seg = (params.cat || []).filter(Boolean).map(s => String(s).toLowerCase());
  const pg = seg.length === 0 ? indexPage(games) : seg.length === 1 ? catPage(games, seg[0]) : null;
  const frame = await env.ASSETS.fetch(new Request(new URL("/privacy/", request.url), { headers: request.headers }));
  if (!pg) return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  const url = "https://untils.in/genre/" + (seg[0] ? seg[0] + "/" : "");
  const ld = { "@context": "https://schema.org", "@graph": [Object.assign({ "@type": "CollectionPage" }, pg.ld), { "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "UNTILS", item: "https://untils.in/" }, { "@type": "ListItem", position: 2, name: "Categories", item: "https://untils.in/genre/" } ].concat(seg[0] ? [{ "@type": "ListItem", position: 3, name: pg.h1, item: url }] : []) }] };
  const setAttr = (a, v) => ({ element(e) { e.setAttribute(a, v); } });
  const rw = new HTMLRewriter()
    .on("title", { element(e) { e.setInnerContent(pg.title); } })
    .on('meta[name="description"]', setAttr("content", pg.desc))
    .on('link[rel="canonical"]', setAttr("href", url))
    .on('meta[property="og:title"]', setAttr("content", pg.title)).on('meta[property="og:description"]', setAttr("content", pg.desc)).on('meta[property="og:url"]', setAttr("content", url))
    .on('meta[name="twitter:title"]', setAttr("content", pg.title)).on('meta[name="twitter:description"]', setAttr("content", pg.desc))
    .on('script[type="application/ld+json"]', { element(e) { e.remove(); } })
    .on("head", { element(e) { e.append('<script type="application/ld+json">' + JSON.stringify(ld).replace(/</g, "\\u003c") + "</script>", { html: true }); } })
    .on("main.legal", { element(e) { e.setInnerContent(pg.html, { html: true }); } });
  const res = rw.transform(frame), h = new Headers(res.headers); h.set("Cache-Control", "public, max-age=300");
  return new Response(res.body, { status: 200, headers: h });
}
