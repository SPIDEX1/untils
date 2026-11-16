import { loadCats } from "../_cats.js";
/* public list of categories (names and links) - used by the developer form */
export async function onRequestGet({ env }) {
  const cats = await loadCats(env);
  return new Response(JSON.stringify({ categories: cats.map(c => ({ name: c.name, slug: c.slug })) }), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" } });
}
