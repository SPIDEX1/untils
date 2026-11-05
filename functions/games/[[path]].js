import { liveGames, esc } from "../_seo.js";

/* /games/ and /games/<slug>/ both serve the SPA shell (/games/index.html).
   For a real game, the shell is rewritten on the server so Google sees the game's own
   title, description, canonical URL and schema without running JavaScript. */
export async function onRequestGet({ request, env, params }) {
  const u = new URL(request.url); u.pathname = "/games/"; u.search = "";
  const shell = await env.ASSETS.fetch(new Request(u, request));
  const seg = (params.path || []).filter(Boolean);
  if (!seg.length) return shell;
  let g = null;
  try { g = (await liveGames(env)).find(x => x.slug === String(seg[0]).toLowerCase()); } catch (e) {}
  if (!g) return shell;

  const url = "https://untils.in/games/" + g.slug + "/";
  const title = g.title + " - Play Free Online | UNTILS";
  const desc = (g.description || ("Play " + g.title + " free on UNTILS.")).slice(0, 300);
  const img = g.banner || g.shot || g.icon || "https://untils.in/assets/img/og-image.png";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "VideoGame", "name": g.title, "url": url, "description": desc, "image": img,
        "genre": g.category || "Game", "gamePlatform": "Web browser", "applicationCategory": "Game",
        "operatingSystem": "Any", "inLanguage": "en", "isAccessibleForFree": true,
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "publisher": { "@type": "Organization", "name": "UNTILS", "url": "https://untils.in/" } },
      { "@type": "BreadcrumbList", "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "UNTILS", "item": "https://untils.in/" },
        { "@type": "ListItem", "position": 2, "name": "Games", "item": "https://untils.in/games/" },
        { "@type": "ListItem", "position": 3, "name": g.title, "item": url } ] }
    ]
  };
  const setAttr = (a, v) => ({ element(e) { e.setAttribute(a, v); } });
  const rw = new HTMLRewriter()
    .on("title", { element(e) { e.setInnerContent(title); } })
    .on('meta[name="description"]', setAttr("content", desc))
    .on('link[rel="canonical"]', setAttr("href", url))
    .on('meta[property="og:title"]', setAttr("content", title))
    .on('meta[property="og:description"]', setAttr("content", desc))
    .on('meta[property="og:url"]', setAttr("content", url))
    .on('meta[property="og:image"]', setAttr("content", img))
    .on('meta[name="twitter:title"]', setAttr("content", title))
    .on('meta[name="twitter:description"]', setAttr("content", desc))
    .on('meta[name="twitter:image"]', setAttr("content", img))
    .on('script[type="application/ld+json"]', { element(e) { e.remove(); } })
    .on("head", { element(e) { e.append('<script type="application/ld+json">' + JSON.stringify(ld).replace(/</g, "\\u003c") + "</script>", { html: true }); } })
    .on("noscript", { element(e) { e.setInnerContent('<div class="legal"><h1>' + esc(g.title) + '</h1><p>' + esc(desc) + '</p><p>Play ' + esc(g.title) + ' free online on UNTILS. Please enable JavaScript to play.</p></div>', { html: true }); } });
  const res = rw.transform(shell);
  const h = new Headers(res.headers); h.set("Cache-Control", "public, max-age=300");
  return new Response(res.body, { status: 200, headers: h });
}
