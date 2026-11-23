/* About page team: kept in KV "cfg:about" and edited by the leader in the admin portal ("About" tab). Not a route. */
const EM = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const DEFAULT_ABOUT = [
  { id: "m1", name: "AMAN", role: "FOUNDER", email: "", insta: "", bio: "" },
  { id: "m2", name: "REHAN KHAN", role: "CO FOUNDER", email: "", insta: "", bio: "" },
  { id: "m3", name: "RAVI KUMAR", role: "CEO", email: "", insta: "", bio: "" }
];
export const wordCount = t => (String(t || "").trim().match(/\S+/g) || []).length;
export async function loadAbout(env) {
  try { const v = await env.GAMES.get("cfg:about", "json"); if (Array.isArray(v)) return v; } catch (e) {}
  return DEFAULT_ABOUT;
}
const oneLine = (t, n) => Array.from(String(t == null ? "" : t).replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim()).slice(0, n).join("");
/* accepts @name, name or a full instagram link; returns just the handle */
export function instaHandle(v) {
  let t = String(v || "").trim(); if (!t) return "";
  t = t.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").split(/[/?#]/)[0];
  return /^[A-Za-z0-9._]{1,30}$/.test(t) ? t : null;
}
export function cleanAbout(list) {
  if (!Array.isArray(list)) return { error: "Bad data." };
  if (list.length > 12) return { error: "You can add at most 12 people." };
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const m = list[i] || {}, n = i + 1;
    const name = oneLine(m.name, 40), role = oneLine(m.role, 40), email = String(m.email || "").trim().toLowerCase(), insta = instaHandle(m.insta);
    const bio = String(m.bio || "").replace(/\r/g, "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    if (name.length < 2) return { error: "Person " + n + ": please type a name." };
    if (email && (!EM.test(email) || email.length > 120)) return { error: name + ": the email is not valid." };
    if (insta === null) return { error: name + ": the Instagram name is not valid (use the username or the profile link)." };
    if (wordCount(bio) > 1000 || bio.length > 9000) return { error: name + ": the write-up can be 1000 words at most (now " + wordCount(bio) + ")." };
    out.push({ id: "m" + (i + 1) + Date.now().toString(36).slice(-4), name, role, email, insta, bio });
  }
  return { list: out };
}
