/* UNTILS player account (main site). Separate from the developer account:
   own session key, own sign-in panel. Google or email code via Supabase Auth.
   URL and publishable key are public. Never put a secret key here. */
(function () {
  "use strict";
  var URL0 = "https://fjfkwfklglovuxeecxsg.supabase.co", KEY = "sb_publishable_HUSSW4Xiau3suUYMfcTjtQ_h083WJbS";
  var SK = "untils_player_session", BK = "untils_pl_back";
  var btn = document.querySelector("nav a.sep");
  if (!btn) return;

  /* ---------- tiny helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function call(path, method, body, token) {
    var h = { apikey: KEY, "Content-Type": "application/json" };
    if (token) h.Authorization = "Bearer " + token;
    return fetch(URL0 + path, { method: method, headers: h, body: body ? JSON.stringify(body) : undefined }).then(function (r) {
      return r.text().then(function (t) { var d = {}; try { d = t ? JSON.parse(t) : {}; } catch (e) {} return { ok: r.ok, status: r.status, data: d }; });
    }, function () { return { ok: false, status: 0, data: {} }; });
  }
  function load() { try { return JSON.parse(localStorage.getItem(SK)); } catch (e) { return null; } }
  function save(d) {
    var s = { access_token: d.access_token, refresh_token: d.refresh_token, expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600), user: d.user || null };
    try { localStorage.setItem(SK, JSON.stringify(s)); } catch (e) {}
    return s;
  }
  function clear() { try { localStorage.removeItem(SK); } catch (e) {} }

  /* ---------- session: finish Google redirect, refresh when needed ---------- */
  var session = load(), authMsg = "";
  (function fromHash() {
    var h = location.hash || "";
    if (h.indexOf("access_token=") > -1 && h.indexOf("refresh_token=") > -1) {
      var p = new URLSearchParams(h.replace(/^#/, ""));
      session = save({ access_token: p.get("access_token"), refresh_token: p.get("refresh_token"), expires_in: +p.get("expires_in") || 3600 });
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
      call("/auth/v1/user", "GET", null, session.access_token).then(function (r) { if (r.ok && r.data && r.data.id) { session = save({ access_token: session.access_token, refresh_token: session.refresh_token, expires_at: session.expires_at, user: r.data }); paintBtn(); } });
      var back = ""; try { back = sessionStorage.getItem(BK) || ""; sessionStorage.removeItem(BK); } catch (e) {}
      if (back && back.charAt(0) === "/" && back !== location.pathname) location.replace(back);
    } else if (h.indexOf("error_description=") > -1) {
      var q = new URLSearchParams(h.replace(/^#/, ""));
      authMsg = (q.get("error_description") || "Sign-in did not finish.").replace(/\+/g, " ");
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    }
  })();
  function refresh() {
    if (!session || !session.refresh_token) return;
    if (session.expires_at - 60 > Date.now() / 1000) return;
    call("/auth/v1/token?grant_type=refresh_token", "POST", { refresh_token: session.refresh_token }).then(function (r) {
      if (r.ok && r.data.access_token) { session = save(r.data); paintBtn(); }
      else if (r.status !== 0) { clear(); session = null; paintBtn(); }
    });
  }

  /* ---------- the header button ---------- */
  var lbl = btn.querySelector("span:not([style])") || btn.lastElementChild;
  function paintBtn() {
    var on = !!(session && session.refresh_token);
    if (lbl) lbl.textContent = on ? "Account" : "Sign up";
    btn.setAttribute("aria-label", on ? "Your account" : "Sign up or log in");
    btn.title = on ? "Your account" : "Sign up or log in";
    btn.classList.toggle("pl-in", on);
  }
  btn.setAttribute("href", "#account"); btn.setAttribute("role", "button"); btn.setAttribute("aria-haspopup", "dialog");
  paintBtn(); refresh();

  /* ---------- panel ---------- */
  var IC = {
    g: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.7-4.9H1.3v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"/></svg>',
    m: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3.5 7.5l8.5 6 8.5-6"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    b: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
  };
  var panel = null, shade = null, mail = "", providers = null;

  function settings() {
    if (providers) return Promise.resolve(providers);
    return call("/auth/v1/settings", "GET").then(function (r) { providers = (r.ok && r.data && r.data.external) || {}; return providers; });
  }
  function ensure() {
    if (panel) return;
    shade = document.createElement("div"); shade.className = "pl-shade"; shade.hidden = true;
    panel = document.createElement("div"); panel.className = "pl-panel"; panel.hidden = true;
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Sign up or log in");
    document.body.appendChild(shade); document.body.appendChild(panel);
    shade.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) close(); });
    window.addEventListener("resize", place);
  }
  function place() {
    if (!panel || panel.hidden) return;
    var r = btn.getBoundingClientRect(), W = document.documentElement.clientWidth, w = Math.min(364, W - 24);
    panel.style.width = w + "px";
    panel.style.top = Math.round(r.bottom + 10) + "px";
    panel.style.left = Math.max(12, Math.min(W - w - 12, Math.round(r.right - w))) + "px";
  }
  function open() { ensure(); render(session ? "me" : "home"); panel.hidden = false; shade.hidden = false; place(); btn.classList.add("on-pl"); }
  function close() { if (!panel) return; panel.hidden = true; shade.hidden = true; btn.classList.remove("on-pl"); }
  btn.addEventListener("click", function (e) { e.preventDefault(); ensure(); if (panel.hidden) open(); else close(); });

  function head(title, sub, back) {
    return '<div class="pl-h">' + (back ? '<button type="button" class="pl-ic" data-go="' + back + '" aria-label="Back">' + IC.b + '</button>' : '') + '<div class="pl-t"><b>' + title + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div><button type="button" class="pl-ic" data-close aria-label="Close">' + IC.x + '</button></div>';
  }
  function msg(t, ok) { var m = $(".pl-msg", panel); if (m) { m.textContent = t || ""; m.className = "pl-msg" + (ok ? " ok" : ""); } }

  function render(view) {
    var h = "";
    if (view === "home") {
      h = head("Join UNTILS", "Sign up or log in to continue") +
        '<div class="pl-b">' +
        '<button type="button" class="pl-o" data-p="google"><span class="pl-oi">' + IC.g + '</span>Continue with Google</button>' +
        '<button type="button" class="pl-o" data-go="email"><span class="pl-oi">' + IC.m + '</span>Continue with email</button>' +
        '<div class="pl-msg" role="status">' + esc(authMsg) + '</div>' +
        '<p class="pl-f">By continuing you agree to our <a href="/terms/">Terms</a> and <a href="/privacy/">Privacy Policy</a>.</p></div>';
      authMsg = "";
    } else if (view === "email") {
      h = head("Your email", "We will email you a 6-digit code", "home") +
        '<div class="pl-b"><input id="plMail" type="email" inputmode="email" autocomplete="email" placeholder="you@gmail.com" maxlength="120">' +
        '<button type="button" class="pl-go" id="plSend">SEND CODE</button><div class="pl-msg" role="status"></div></div>';
    } else if (view === "code") {
      h = head("Enter the code", "Sent to " + esc(mail), "email") +
        '<div class="pl-b"><input id="plCode" class="pl-code" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="000000" maxlength="6">' +
        '<button type="button" class="pl-go" id="plVerify">VERIFY</button><button type="button" class="pl-lk" id="plResend">Send a new code</button><p class="pl-f">Check your spam folder if you do not see the email.</p><div class="pl-msg" role="status"></div></div>';
    } else {
      var u = (session && session.user) || {}, m = u.user_metadata || {};
      var name = m.full_name || m.name || u.email || "Player", sub = u.email || "";
      h = head("Your account", "") + '<div class="pl-b"><div class="pl-me"><span class="pl-av">' + (m.avatar_url ? '<img src="' + esc(m.avatar_url) + '" alt="" referrerpolicy="no-referrer">' : esc(String(name).charAt(0).toUpperCase())) + '</span><div><b>' + esc(name) + '</b><small>' + esc(sub) + '</small></div></div>' +
        '<button type="button" class="pl-go pl-out" id="plOut">LOG OUT</button></div>';
    }
    panel.innerHTML = h;
    wire(view);
  }

  function wire(view) {
    [].forEach.call(panel.querySelectorAll("[data-close]"), function (b) { b.onclick = close; });
    [].forEach.call(panel.querySelectorAll("[data-go]"), function (b) { b.onclick = function () { render(b.getAttribute("data-go")); var f = $("#plMail", panel); if (f) f.focus(); }; });
    [].forEach.call(panel.querySelectorAll("[data-p]"), function (b) { b.onclick = function () { social(b.getAttribute("data-p"), b); }; });
    if (view === "email") {
      $("#plSend", panel).onclick = sendCode;
      $("#plMail", panel).onkeydown = function (e) { if (e.key === "Enter") sendCode(); };
      $("#plMail", panel).focus();
    }
    if (view === "code") {
      $("#plVerify", panel).onclick = verify;
      $("#plResend", panel).onclick = sendCode;
      $("#plCode", panel).onkeydown = function (e) { if (e.key === "Enter") verify(); };
      $("#plCode", panel).focus();
    }
    if (view === "me") $("#plOut", panel).onclick = logout;
  }

  function social(p, b) {
    msg("");
    b.disabled = true;
    settings().then(function (s) {
      b.disabled = false;
      if (s && s[p] === false) { msg("Google sign-in is not available yet. Please use email instead."); return; }
      try { sessionStorage.setItem(BK, location.pathname + location.search); } catch (e) {}
      location.href = URL0 + "/auth/v1/authorize?provider=" + p + "&redirect_to=" + encodeURIComponent(location.origin + "/");
    });
  }

  function sendCode() {
    var inp = $("#plMail", panel), go = $("#plSend", panel) || $("#plResend", panel);
    if (inp) {
      var v = inp.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg("Please enter a valid email address."); return; }
      mail = v;
    }
    if (!mail) { render("email"); return; }
    if (go) go.disabled = true; msg("");
    call("/auth/v1/otp", "POST", { email: mail, create_user: true, data: { kind: "player" } }).then(function (r) {
      if (go) go.disabled = false;
      if (r.ok) { if (!$("#plCode", panel)) render("code"); else msg("A new code is on its way.", true); return; }
      var c = String(r.data.error_code || r.data.code || "");
      if (r.status === 0) msg("Could not reach the server. Check your internet connection.");
      else if (r.status === 429 || /rate_limit/i.test(c)) msg("Please wait a minute before asking for another code.");
      else if (c === "signup_disabled") msg("New sign-ups are closed right now.");
      else msg("We could not send the code. Please try again in a few minutes.");
    });
  }

  /* the code type depends on whether the email is new or already known, so try the 3 types */
  function verify() {
    var c = ($("#plCode", panel).value || "").replace(/\D/g, "");
    if (c.length !== 6) { msg("Enter the 6-digit code."); return; }
    var go = $("#plVerify", panel); go.disabled = true; msg("");
    var types = ["email", "signup", "magiclink"];
    function next(i, last) {
      if (i >= types.length) { go.disabled = false; msg(last && last.status === 0 ? "Could not reach the server. Check your internet connection." : "That code is not correct or has expired."); return; }
      call("/auth/v1/verify", "POST", { email: mail, token: c, type: types[i] }).then(function (r) {
        if (r.ok && r.data.access_token) { go.disabled = false; session = save(r.data); paintBtn(); render("me"); place(); return; }
        if (r.status === 0 || r.status === 429 || r.status >= 500) { go.disabled = false; msg(r.status === 429 ? "Too many tries. Please wait a minute." : "Could not reach the server. Please try again."); return; }
        next(i + 1, r);
      });
    }
    next(0, null);
  }

  function logout() {
    var s = session; clear(); session = null; paintBtn(); render("home"); place();
    if (s) call("/auth/v1/logout", "POST", null, s.access_token);
  }

  /* open the panel again after a failed Google sign-in so the reason is visible */
  if (authMsg) setTimeout(open, 400);
  window.UntilsPlayer = { open: open, close: close, getSession: function () { return session; } };
})();
