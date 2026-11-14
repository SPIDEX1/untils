import { SUPA } from "./_lib.js";
/* Emails to developers (Resend). Not a route.
   Needs on Cloudflare: RESEND_API_KEY (secret) and SUPABASE_SERVICE_KEY (already set).
   Optional: MAIL_FROM  e.g.  UNTILS <team@untils.in>      MAIL_REPLY_TO  e.g. hello@untils.in
   If the key is missing nothing is sent and nothing breaks. A failed email never fails the request. */
const SITE = "https://untils.in", DEV = "https://developer.untils.in";
const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nl = t => esc(t).replace(/\r?\n/g, "<br>");
const slugOf = t => String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function userOf(env, uid) {
  const r = await fetch(SUPA + "/auth/v1/admin/users/" + encodeURIComponent(uid), { headers: { apikey: env.SUPABASE_SERVICE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_KEY } });
  if (!r.ok) return null;
  const u = await r.json(), m = u.user_metadata || {};
  return u.email ? { email: u.email, name: String(m.studio || String(u.email).split("@")[0]).slice(0, 40) } : null;
}

/* the four kinds of email */
function tpl(kind, g, x) {
  const t = "<b>" + esc(g.title) + "</b>", st = DEV + "/dashboard/";
  switch (kind) {
    case "submitted": return { subject: "Thanks for submitting " + g.title + " on UNTILS", head: "Thanks for submitting your game! 🎮",
      p: ["We have received " + t + " and our team is going to review it.", "<b>You will get the result within 2 days.</b> We will email you on this address as soon as the review is done, so there is nothing else you need to do right now.", "You can check the status any time in your dashboard.", "Thank you for building games for UNTILS! 💙"], btn: ["Open dashboard", st] };
    case "submitted_update": return { subject: "Thanks for submitting a new version of " + g.title, head: "New version received! 🚀",
      p: ["We have received the new version of " + t + ". Your current version stays as it is until the review is finished.", "<b>You will get the result within 2 days</b>, by email on this address.", "Thank you for keeping your game fresh! 💙"], btn: ["Open dashboard", st] };
    case "rejected": case "update_rejected": {
      const upd = kind === "update_rejected";
      return { subject: "Update on " + g.title + ": changes needed", head: "Sorry, we could not publish it yet 😔",
        p: [upd ? "We reviewed the new version of " + t + " and, sorry, we could not publish it this time." : "We reviewed " + t + " and, sorry, we could not publish it this time.", "Here is the reason from our team:"],
        quote: x.reason || "Please check your game and try again.",
        p2: ["Please fix this, then upload your game again from your dashboard and submit it for review. The new review also takes up to 2 days.", "Do not worry, many great games need one round of changes. We are happy to see it again! 💙"], btn: ["Fix and submit again", st] };
    }
    case "live": case "update_live": {
      const upd = kind === "update_live", url = SITE + "/games/" + slugOf(g.title) + "/";
      return { subject: upd ? "The new version of " + g.title + " is live!" : "Hurray! " + g.title + " is live on UNTILS 🎉", head: upd ? "Your new version is live! 🎉" : "Hurray! Your game is live! 🎉",
        p: [upd ? "Great news! The new version of " + t + " passed the review and players are already getting it." : "Great news! " + t + " passed the review and is now <b>live on UNTILS</b>. Players around the world can play it right now! 🌍🎮", "Open your game page, play it once and share the link with your friends and your community. Every play helps your game climb up.", "Congratulations, and thank you for being part of UNTILS! 💙"], btn: ["Play your game", url] };
    }
    case "message": return { subject: "Message from UNTILS Team about " + g.title, head: "Message from UNTILS Team 💬",
      p: ["Hi! The UNTILS Team sent you a message about " + t + ":"], quote: x.text,
      p2: ["You can also see this message in your dashboard."], btn: ["Open dashboard", st] };
  }
  return null;
}

function render(m, name) {
  const para = s => '<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#2b3a52">' + s + "</p>";
  const html = '<!doctype html><html><body style="margin:0;padding:0;background:#eaf6ff;font-family:Arial,Helvetica,sans-serif">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eaf6ff;padding:24px 12px"><tr><td align="center">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #cfe6ff">' +
    '<tr><td style="background:linear-gradient(90deg,#4fc3ff,#0a6cff);height:8px;font-size:0;line-height:0">&nbsp;</td></tr>' +
    '<tr><td style="padding:22px 28px 0"><img src="' + SITE + '/assets/img/untils-logo.png?v=2" alt="UNTILS" width="120" style="display:block;border:0"></td></tr>' +
    '<tr><td style="padding:18px 28px 6px"><h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;color:#12233d">' + esc(m.head) + "</h1>" +
    para("Hi " + esc(name) + ",") + m.p.map(para).join("") +
    (m.quote ? '<div style="margin:4px 0 16px;padding:14px 16px;background:#f2f9ff;border-left:4px solid #4fc3ff;border-radius:8px;font-size:15px;line-height:1.55;color:#12233d">' + nl(m.quote) + "</div>" : "") +
    (m.p2 || []).map(para).join("") +
    '<p style="margin:20px 0 8px"><a href="' + esc(m.btn[1]) + '" style="display:inline-block;background:#0a6cff;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:12px 24px;border-radius:12px">' + esc(m.btn[0]) + "</a></p></td></tr>" +
    '<tr><td style="padding:18px 28px 24px;font-size:12px;line-height:1.5;color:#7a8aa3">UNTILS Team<br>You are getting this email because you are a developer on UNTILS. Just reply to this email if you need help.</td></tr>' +
    "</table></td></tr></table></body></html>";
  const strip = s => s.replace(/<br>/g, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  const text = ["Hi " + name + ",", ""].concat(m.p.map(strip), m.quote ? ["", String(m.quote), ""] : [], (m.p2 || []).map(strip), ["", m.btn[0] + ": " + m.btn[1], "", "UNTILS Team"]).join("\n");
  return { html, text };
}

/* notify(env, waitUntil, kind, game, { reason | text }) */
export async function notify(env, wait, kind, g, x) {
  const job = (async () => {
    try {
      if (!env.RESEND_API_KEY || !env.SUPABASE_SERVICE_KEY || !g || !g.owner) return;
      const m = tpl(kind, g, x || {}); if (!m) return;
      const u = await userOf(env, g.owner); if (!u) return;
      const r = render(m, u.name);
      const res = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env.MAIL_FROM || "UNTILS <team@untils.in>", to: [u.email], subject: m.subject, html: r.html, text: r.text, ...(env.MAIL_REPLY_TO ? { reply_to: env.MAIL_REPLY_TO } : {}) }) });
      if (!res.ok) console.error("UNTILS mail failed", res.status, await res.text().catch(() => ""));
    } catch (e) { console.error("UNTILS mail error", e && e.message); }
  })();
  if (wait) wait(job); else await job;
}
