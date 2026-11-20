import { SUPA } from "../_lib.js";
/* Does a DEVELOPER account exist for this email?  POST { email } -> { exists: true | false }
   A developer account = an account that has a studio name (set when the account was created in the developer portal).
   A player-only account (game website) is NOT a developer account.
   The sign-in form uses this so no login code is sent to an email that has no developer account.
   Fails open: if the check cannot be done (no service key, Supabase error) it answers true, so real developers are never locked out. */
const json = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
export async function hasDeveloper(env, email) {
  const key = env.SUPABASE_SERVICE_KEY; if (!key) return null;
  const h = { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" };
  try {
    /* 1) fast: optional SQL function developer_exists(p_email) (see the setup notes) */
    const r = await fetch(SUPA + "/rest/v1/rpc/developer_exists", { method: "POST", headers: h, body: JSON.stringify({ p_email: email }) });
    if (r.ok) { const v = await r.json(); if (v === true || v === false) return v; }
    /* 2) otherwise look through the user list (fine for a few thousand users) */
    for (let page = 1; page <= 10; page++) {
      const u = await fetch(SUPA + "/auth/v1/admin/users?page=" + page + "&per_page=1000", { headers: h });
      if (!u.ok) return null;
      const list = (await u.json()).users || [];
      const m = list.find(x => String(x.email || "").toLowerCase() === email);
      if (m) return !!String((m.user_metadata || {}).studio || "").trim();
      if (list.length < 1000) return false;
    }
  } catch (e) {}
  return null;
}
export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch (e) { return json({ error: "Bad request." }, 400); }
  const email = String(b.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return json({ error: "Please enter a valid email address." }, 400);
  /* a small limit per visitor, so this cannot be used to list accounts */
  if (env.GAMES) {
    const ip = request.headers.get("CF-Connecting-IP") || "x", k = "rl:dc:" + ip, n = +(await env.GAMES.get(k).catch(() => 0)) || 0;
    if (n >= 12) return json({ error: "Too many tries. Please wait a minute and try again." }, 429);
    await env.GAMES.put(k, String(n + 1), { expirationTtl: 60 }).catch(() => {});
  }
  const v = await hasDeveloper(env, email);
  return json({ exists: v === false ? false : true });
}
