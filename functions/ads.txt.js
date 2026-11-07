import { pubOf } from "./_ads.js";
/* https://untils.in/ads.txt, required by AdSense. Built from ADSENSE_PUB. */
export async function onRequestGet({ env }) {
  const pub = pubOf(env);
  if (!pub) return new Response("Not found", { status: 404 });
  return new Response("google.com, " + pub + ", DIRECT, f08c47fec0942fa0\n", { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
