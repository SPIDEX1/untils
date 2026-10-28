/* UNTILS player account (main site). Separate from the developer account:
   own session key, own sign-in panel. Google / Apple / phone number via Supabase Auth.
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

  /* ---------- session: finish Google / Apple redirect, refresh when needed ---------- */
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
    a: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>',
    p: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    b: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
  };
  var CODES = [["+91", "India"], ["+1", "US / Canada"], ["+44", "UK"], ["+971", "UAE"], ["+92", "Pakistan"], ["+880", "Bangladesh"], ["+977", "Nepal"], ["+94", "Sri Lanka"], ["+966", "Saudi Arabia"], ["+65", "Singapore"], ["+61", "Australia"], ["+49", "Germany"], ["+33", "France"], ["+62", "Indonesia"], ["+55", "Brazil"], ["+63", "Philippines"]];
  var panel = null, shade = null, phone = "", providers = null;

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
        '<button type="button" class="pl-o" data-p="apple"><span class="pl-oi">' + IC.a + '</span>Continue with Apple</button>' +
        '<button type="button" class="pl-o" data-go="phone"><span class="pl-oi">' + IC.p + '</span>Continue with phone number</button>' +
        '<div class="pl-msg' + (authMsg ? '' : '') + '" role="status">' + esc(authMsg) + '</div>' +
        '<p class="pl-f">By continuing you agree to our <a href="/terms/">Terms</a> and <a href="/privacy/">Privacy Policy</a>.</p></div>';
      authMsg = "";
    } else if (view === "phone") {
      h = head("Phone number", "We will text you a 6-digit code", "home") +
        '<div class="pl-b"><div class="pl-ph"><select id="plCc" aria-label="Country code">' + CODES.map(function (c) { return '<option value="' + c[0] + '">' + c[0] + ' ' + c[1] + '</option>'; }).join("") + '</select>' +
        '<input id="plNum" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="Phone number" maxlength="15"></div>' +
        '<button type="button" class="pl-go" id="plSend">SEND CODE</button><div class="pl-msg" role="status"></div></div>';
    } else if (view === "code") {
      h = head("Enter the code", "Sent to " + esc(phone), "phone") +
        '<div class="pl-b"><input id="plCode" class="pl-code" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="000000" maxlength="6">' +
        '<button type="button" class="pl-go" id="plVerify">VERIFY</button><button type="button" class="pl-lk" id="plResend">Send a new code</button><div class="pl-msg" role="status"></div></div>';
    } else {
      var u = (session && session.user) || {}, m = u.user_metadata || {};
      var name = m.full_name || m.name || u.email || u.phone || "Player", sub = u.email || (u.phone ? "+" + String(u.phone).replace(/^\+/, "") : "");
      h = head("Your account", "") + '<div class="pl-b"><div class="pl-me"><span class="pl-av">' + (m.avatar_url ? '<img src="' + esc(m.avatar_url) + '" alt="" referrerpolicy="no-referrer">' : esc(String(name).charAt(0).toUpperCase())) + '</span><div><b>' + esc(name) + '</b><small>' + esc(sub) + '</small></div></div>' +
        '<button type="button" class="pl-go pl-out" id="plOut">LOG OUT</button></div>';
    }
    panel.innerHTML = h;
    wire(view);
  }

  function wire(view) {
    [].forEach.call(panel.querySelectorAll("[data-close]"), function (b) { b.onclick = close; });
    [].forEach.call(panel.querySelectorAll("[data-go]"), function (b) { b.onclick = function () { render(b.getAttribute("data-go")); var f = $("#plNum", panel); if (f) f.focus(); }; });
    [].forEach.call(panel.querySelectorAll("[data-p]"), function (b) { b.onclick = function () { social(b.getAttribute("data-p"), b); }; });
    if (view === "phone") {
      $("#plSend", panel).onclick = sendCode;
      $("#plNum", panel).onkeydown = function (e) { if (e.key === "Enter") sendCode(); };
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
      if (s && s[p] === false) { msg((p === "google" ? "Google" : "Apple") + " sign-in is not available yet. Please use another option."); return; }
      try { sessionStorage.setItem(BK, location.pathname + location.search); } catch (e) {}
      location.href = URL0 + "/auth/v1/authorize?provider=" + p + "&redirect_to=" + encodeURIComponent(location.origin + "/");
    });
  }

  function sendCode() {
    var cc = $("#plCc", panel), num = $("#plNum", panel), go = $("#plSend", panel) || $("#plResend", panel);
    if (cc && num) {
      var d = num.value.replace(/\D/g, "").replace(/^0+/, "");
      if (d.length < 6) { msg("Please enter a valid phone number."); return; }
      phone = cc.value + d;
    }
    if (!phone) { render("phone"); return; }
    if (go) go.disabled = true; msg("");
    call("/auth/v1/otp", "POST", { phone: phone, create_user: true }).then(function (r) {
      if (go) go.disabled = false;
      if (r.ok) { if (!$("#plCode", panel)) render("code"); else msg("A new code is on its way.", true); return; }
      var c = String(r.data.error_code || r.data.code || ""), m = String(r.data.msg || r.data.message || "");
      if (r.status === 0) msg("Could not reach the server. Check your internet connection.");
      else if (r.status === 429 || /rate/i.test(c)) msg("Please wait a minute before asking for another code.");
      else if (/provider|sms|disabled/i.test(c + " " + m)) msg("Phone sign-in is not available yet. Please use another option.");
      else if (/invalid/i.test(c + " " + m)) msg("That phone number does not look right.");
      else msg("We could not send the code. Please try again.");
    });
  }

  function verify() {
    var c = ($("#plCode", panel).value || "").replace(/\D/g, "");
    if (c.length !== 6) { msg("Enter the 6-digit code."); return; }
    var go = $("#plVerify", panel); go.disabled = true; msg("");
    call("/auth/v1/verify", "POST", { phone: phone, token: c, type: "sms" }).then(function (r) {
      go.disabled = false;
      if (r.ok && r.data.access_token) { session = save(r.data); paintBtn(); render("me"); place(); return; }
      msg(r.status === 0 ? "Could not reach the server. Check your internet connection." : "That code is not correct or has expired.");
    });
  }

  function logout() {
    var s = session; clear(); session = null; paintBtn(); render("home"); place();
    if (s) call("/auth/v1/logout", "POST", null, s.access_token);
  }

  /* open the panel again after a failed Google / Apple sign-in so the reason is visible */
  if (authMsg) setTimeout(open, 400);
  window.UntilsPlayer = { open: open, close: close, getSession: function () { return session; } };
})();
