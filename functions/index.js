import { withGameLinks } from "./_seo.js";
/* Home page: serve the normal page, plus plain links to every live game so Google can find each game page. */
export async function onRequestGet({ request, env }) {
  const res = await env.ASSETS.fetch(request);
  if (!res.ok || !(res.headers.get("Content-Type") || "").includes("text/html")) return res;
  return withGameLinks(res, env);
}
