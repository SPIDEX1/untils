export async function onRequestGet({ request, env }) {
  const u = new URL(request.url); u.pathname = "/games/"; u.search = "";
  return env.ASSETS.fetch(new Request(u, request));
}
