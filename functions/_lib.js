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
  if (["google", "apple", "phone"].indexOf((u.app_metadata || {}).provider) > -1 || (u.user_metadata || {}).kind === "player") return null; /* player accounts are separate from developer accounts */
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

/* The studio name shown on games is always the developer's current account name, exactly as typed. */
export async function withStudio(env, games) {
  const key = env.SUPABASE_SERVICE_KEY, list = (games || []).filter(Boolean);
  if (!key || !list.length) return games;
  const ids = [...new Set(list.map(g => g.owner).filter(Boolean))].slice(0, 30), m = {};
  await Promise.all(ids.map(async id => {
    try {
      const r = await fetch(SUPA + "/auth/v1/admin/users/" + id, { headers: { apikey: key, Authorization: "Bearer " + key } });
      if (!r.ok) return;
      const v = ((await r.json()).user_metadata || {}).studio;
      const t = v == null ? "" : Array.from(String(v).replace(/[\u0000-\u001f]/g, "").trim()).slice(0, 25).join(""); if (t) m[id] = t;
    } catch (e) {}
  }));
  list.forEach(g => { if (m[g.owner]) g.studio = m[g.owner]; });
  return games;
}

/* ---------- Admin unlock code (leader sets it once; everyone on the team needs it to open the portal) ---------- */
const hx = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
const unhx = s => Uint8Array.from(s.match(/../g) || [], h => parseInt(h, 16));
const same = (a, b) => { a = String(a); b = String(b); let d = a.length ^ b.length; for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return d === 0; };
export const rnd = n => hx(crypto.getRandomValues(new Uint8Array(n)));
export async function hashCode(code, saltHex) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveBits"]);
  return hx(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: unhx(saltHex), iterations: 100000 }, k, 256));
}
export const getLock = env => env.GAMES.get("admin:lock", "json");
export async function unlockTok(env, email, lock) {
  const exp = Math.floor(Date.now() / 1000) + 43200;
  return exp + "." + await sign(env, ["unlock", email, exp, lock.v].join("~"));
}
/* true when no code is set yet, or the request carries a valid, unexpired unlock token for this person */
export async function unlocked(req, env, u) {
  const l = await getLock(env); if (!l) return true;
  if (!env.PLAY_SECRET) return false;
  const [e, sg] = (req.headers.get("X-Unlock") || "").split("."), exp = +e;
  if (!exp || !sg || exp < Date.now() / 1000) return false;
  return same(await sign(env, ["unlock", u.email, exp, l.v].join("~")), sg);
}
/* checks a typed code; 5 wrong tries lock that person out for 15 minutes */
export async function checkCode(env, email, code, lock) {
  const tk = "admin:try:" + email, t = (await env.GAMES.get(tk, "json")) || { n: 0, until: 0 }, now = Date.now();
  if (t.until > now) return { ok: false, status: 429, error: "Too many wrong codes. Try again in " + Math.ceil((t.until - now) / 60000) + " minute(s)." };
  if (code.length <= 64 && same(await hashCode(code, lock.salt), lock.hash)) { await env.GAMES.delete(tk); return { ok: true }; }
  t.n = (t.n || 0) + 1; if (t.n >= 5) { t.until = now + 900000; t.n = 0; }
  await env.GAMES.put(tk, JSON.stringify(t), { expirationTtl: 900 });
  return { ok: false, status: 403, error: t.until > now ? "Too many wrong codes. Try again in 15 minutes." : "Wrong code." };
}
