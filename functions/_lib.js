export const SUPA = "https://fjfkwfklglovuxeecxsg.supabase.co";
export const KEY = "sb_publishable_HUSSW4Xiau3suUYMfcTjtQ_h083WJbS";
export const J = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
export async function me(req, env) {
  const t = (req.headers.get("Authorization") || "").replace(/^Bearer /i, "");
  if (!t) return null;
  const r = await fetch(SUPA + "/auth/v1/user", { headers: { apikey: KEY, Authorization: "Bearer " + t } });
  if (!r.ok) return null;
  const u = await r.json();
  if (!u.id || !u.email || !u.email_confirmed_at) return null;
  if (["google", "apple", "phone"].indexOf((u.app_metadata || {}).provider) > -1) return null; /* player accounts are separate from developer accounts */
  const e = u.email.toLowerCase();
  let role = null;
  if (env.LEADER_EMAIL && e === env.LEADER_EMAIL.trim().toLowerCase()) role = "leader";
  else if (await env.GAMES.get("staff:" + e)) role = "reviewer";
  return { id: u.id, email: e, role };
}
export async function sign(env, s) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.PLAY_SECRET || "x"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const b = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("").slice(0, 32);
}
