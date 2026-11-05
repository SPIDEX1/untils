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


  /* ---------- profile, favourites, recently played ---------- */
  var profile = null, listeners = [], curV = "", newAv, afterCb = null, afterWhy = "", loginWhy = "", syncT = 0;
  var FK = "untils_favs", RK = "untils_recent", MK = "untils_merged", GM = "untils_gmeta";
  function rd(k) { try { var a = JSON.parse(localStorage.getItem(k)); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function wr(k, a) { try { localStorage.setItem(k, JSON.stringify(a)); } catch (e) {} }
  function meta() { try { return JSON.parse(localStorage.getItem(GM)) || {}; } catch (e) { return {}; } }
  function remember(k, n, i) { if (!k || !n) return; var m = meta(); m[k] = { n: n, i: i || "" }; var ks = Object.keys(m); while (ks.length > 150) delete m[ks.shift()]; try { localStorage.setItem(GM, JSON.stringify(m)); } catch (e) {} }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function fire() {
    listeners.forEach(function (f) { try { f(); } catch (e) {} });
    if (panel && !panel.hidden && curV === "me") { render("me"); place(); }
  }
  function token(force) {
    if (!session || !session.refresh_token) return Promise.resolve(null);
    if (!force && session.expires_at - 60 > Date.now() / 1000) return Promise.resolve(session.access_token);
    return call("/auth/v1/token?grant_type=refresh_token", "POST", { refresh_token: session.refresh_token }).then(function (r) {
      if (r.ok && r.data.access_token) { session = save(r.data); return session.access_token; }
      return null;
    });
  }
  function api(path, method, body, retried) {
    return token(retried).then(function (t) {
      if (!t) return { ok: false, status: 401, data: { error: "Please sign in again." } };
      return fetch(path, { method: method, headers: { Authorization: "Bearer " + t, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (r.status === 401 && !retried) return api(path, method, body, true);   /* token may have gone stale: refresh once and retry */
          return { ok: r.ok, status: r.status, data: d };
        });
      }, function () { return { ok: false, status: 0, data: {} }; });
    });
  }
  function loadProfile() {
    if (!session || !session.refresh_token) { profile = null; return Promise.resolve(); }
    return api("/api/me", "GET").then(function (r) {
      if (!r.ok) return;
      profile = r.data;
      var merged = ""; try { merged = localStorage.getItem(MK) || ""; } catch (e) {}
      if (merged !== profile.id) {
        profile.favs = uniq((profile.favs || []).concat(rd(FK)));
        profile.recent = uniq(rd(RK).concat(profile.recent || [])).slice(0, 12);
        try { localStorage.setItem(MK, profile.id); } catch (e) {}
        api("/api/me", "POST", { favs: profile.favs, recent: profile.recent });
      }
      wr(FK, profile.favs || []); wr(RK, profile.recent || []);
      fire();
    });
  }
  function sync() {
    if (!profile) return;
    clearTimeout(syncT);
    syncT = setTimeout(function () { api("/api/me", "POST", { favs: rd(FK), recent: rd(RK) }); }, 1500);
  }
  function isFav(k) { return rd(FK).indexOf(k) > -1; }
  function toggleFav(k, n, i) {
    var a = rd(FK), x = a.indexOf(k);
    if (x > -1) a.splice(x, 1); else { a.unshift(k); remember(k, n, i); }
    wr(FK, a); sync(); fire(); return x < 0;
  }
  function addRecent(k, n, i) {
    var a = rd(RK).filter(function (v) { return v !== k; }); a.unshift(k); remember(k, n, i);
    wr(RK, a.slice(0, 12)); sync(); fire();
  }
  function displayName() {
    var u = (session && session.user) || {}, m = u.user_metadata || {};
    return (profile && profile.name) || m.full_name || m.name || u.email || "Player";
  }
  function avHTML() {
    var u = (session && session.user) || {}, m = u.user_metadata || {}, src = "";
    if (newAv) src = newAv;
    else if (newAv === undefined && profile && profile.av) src = "/api/avatar?u=" + profile.id + "&v=" + profile.av;
    else src = (profile && profile.pic) || m.avatar_url || m.picture || "";
    return src ? '<img src="' + esc(src) + '" alt="" referrerpolicy="no-referrer">' : esc(String(displayName()).charAt(0).toUpperCase());
  }
  /* game list for the account panel: name + icon from the loaded catalogue, else from the saved copy */
  function gameRows(keys) {
    var byKey = {}, mm = meta();
    try { if (typeof L !== "undefined") Object.keys(L).forEach(function (n) { if (L[n] && L[n].key) byKey[L[n].key] = { n: n, i: L[n].icon || "" }; }); } catch (e) {}
    var live = Object.keys(byKey).length > 0;
    return keys.map(function (k) { return byKey[k] || (live ? null : mm[k]) || null; }).filter(Boolean);
  }
  function listHTML(title, keys, empty) {
    var rows = gameRows(keys).slice(0, 12);
    return '<div class="pl-sec"><h5>' + title + '</h5>' + (rows.length ? '<div class="pl-gl">' + rows.map(function (g) {
      return '<button type="button" class="pl-gi" data-open="' + esc(g.n) + '">' + (g.i ? '<img src="' + esc(g.i) + '" alt="" loading="lazy">' : '<span class="pl-gx">\ud83c\udfae</span>') + '<span>' + esc(g.n) + '</span></button>';
    }).join("") + '</div>' : '<p class="pl-em">' + empty + '</p>') + '</div>';
  }
  function openGameByName(n) {
    close();
    var sl = String(n).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""), path = "/games/" + sl + "/";
    if (typeof go === "function" && typeof L !== "undefined" && L[n]) go(path); else location.href = path;
  }
  function pickFile(file, cb) {
    if (!file || !/^image\//.test(file.type)) { msg("Please choose a picture file."); return; }
    var img = new Image(), url = URL.createObjectURL(file);
    img.onload = function () {
      var S = 128, c = document.createElement("canvas"); c.width = c.height = S;
      var x = c.getContext("2d"), m = Math.min(img.width, img.height);
      x.fillStyle = "#fff"; x.fillRect(0, 0, S, S);
      x.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
      URL.revokeObjectURL(url);
      var q = 0.85, d = c.toDataURL("image/jpeg", q);
      while (d.length > 40000 && q > 0.4) { q -= 0.1; d = c.toDataURL("image/jpeg", q); }
      cb(d);
    };
    img.onerror = function () { URL.revokeObjectURL(url); msg("That picture could not be opened. Try a JPG or PNG."); };
    img.src = url;
  }
  function saveProfile() {
    var n = ($("#plName", panel).value || "").trim(), body = {}, go = $("#plSave", panel), cur = (profile && profile.name) || "";
    if (n && n !== cur && !/^[A-Za-z0-9_.]{3,20}$/.test(n)) { msg("Username must be 3 to 20 letters, numbers, _ or . (no spaces)."); return; }
    if (!n && profile && profile.custom) body.name = "";
    else if (n && n !== cur) body.name = n;
    if (newAv !== undefined) body.avatar = newAv;
    if (!Object.keys(body).length) { render("me"); place(); return; }
    go.disabled = true; msg("");
    api("/api/me", "POST", body).then(function (r) {
      go.disabled = false;
      if (!r.ok) { msg(r.status === 0 ? "Could not reach the server. Check your internet connection." : (r.data.error || "Could not save. Please try again.")); return; }
      var f = rd(FK), rc = rd(RK); profile = r.data; profile.favs = f; profile.recent = rc; newAv = undefined;
      listeners.forEach(function (fn) { try { fn(); } catch (e) {} });
      render("me"); place();
    });
  }
  /* commenting only needs a sign-in; name and picture come from the account */
  function needProfile(why, cb) {
    afterCb = cb || null; afterWhy = why || "";
    if (!session || !session.refresh_token) { loginWhy = why || ""; open(); return; }
    var f = afterCb; afterCb = null; if (f) f();
  }
  function afterLogin() {
    loadProfile().then(function () {
      if (afterCb) { var f = afterCb; afterCb = null; close(); f(); }
      else { render("me"); place(); }
    });
  }

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
  function open() { ensure(); if (session && !profile) loadProfile(); render(session ? "me" : "home"); panel.hidden = false; shade.hidden = false; place(); btn.classList.add("on-pl"); }
  function close() { if (!panel) return; panel.hidden = true; shade.hidden = true; btn.classList.remove("on-pl"); }
  btn.addEventListener("click", function (e) { e.preventDefault(); ensure(); if (panel.hidden) { afterCb = null; afterWhy = ""; loginWhy = ""; open(); } else close(); });

  function head(title, sub, back) {
    return '<div class="pl-h">' + (back ? '<button type="button" class="pl-ic" data-go="' + back + '" aria-label="Back">' + IC.b + '</button>' : '') + '<div class="pl-t"><b>' + title + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div><button type="button" class="pl-ic" data-close aria-label="Close">' + IC.x + '</button></div>';
  }
  function msg(t, ok) { var m = $(".pl-msg", panel); if (m) { m.textContent = t || ""; m.className = "pl-msg" + (ok ? " ok" : ""); } }

  function render(view) {
    var h = ""; curV = view;
    if (view === "home") {
      h = head("Join UNTILS", esc(loginWhy) || "Sign up or log in to continue") +
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
    } else if (view === "edit") {
      newAv = undefined;
      h = head("Edit profile", "", "me") +
        '<div class="pl-b"><div class="pl-ed"><button type="button" class="pl-av pl-avb" id="plAv" aria-label="Change picture">' + avHTML() + '</button>' +
        '<div class="pl-edt"><button type="button" class="pl-lk" id="plPick">Change picture</button><button type="button" class="pl-lk pl-rm" id="plRm">Use default</button></div></div>' +
        '<input id="plFile" type="file" accept="image/*" hidden>' +
        '<label class="pl-lb" for="plName">Username</label>' +
        '<input id="plName" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="25" placeholder="Your username" value="' + esc((profile && profile.name) || displayName()) + '">' +
        '<p class="pl-f">3 to 20 letters, numbers, _ or . Leave it empty to use your default name. This name and picture show on your comments.</p>' +
        '<button type="button" class="pl-go" id="plSave">SAVE</button><div class="pl-msg" role="status"></div></div>';
    } else {
      var u = (session && session.user) || {};
      h = head("Your account", "") + '<div class="pl-b"><div class="pl-me"><span class="pl-av">' + avHTML() + '</span><div><b>' + esc(displayName()) + '</b><small>' + esc(u.email || "") + '</small></div>' +
        '<button type="button" class="pl-ed2" data-go="edit">Edit</button></div>' +
        listHTML("FAVOURITES", rd(FK), "No favourites yet. Tap the heart under any game.") +
        listHTML("RECENTLY PLAYED", rd(RK), "Games you play will show up here.") +
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
    if (view === "me") {
      $("#plOut", panel).onclick = logout;
      [].forEach.call(panel.querySelectorAll("[data-open]"), function (b) { b.onclick = function () { openGameByName(b.getAttribute("data-open")); }; });
    }
    if (view === "edit") {
      var nm = $("#plName", panel), fl = $("#plFile", panel);
      $("#plSave", panel).onclick = saveProfile;
      nm.onkeydown = function (e) { if (e.key === "Enter") saveProfile(); };
      $("#plPick", panel).onclick = $("#plAv", panel).onclick = function () { fl.click(); };
      $("#plRm", panel).onclick = function () { newAv = ""; $("#plAv", panel).innerHTML = avHTML(); msg("Default picture will be used. Press SAVE."); };
      fl.onchange = function () { var f = fl.files && fl.files[0]; fl.value = ""; pickFile(f, function (d) { newAv = d; $("#plAv", panel).innerHTML = '<img src="' + d + '" alt="">'; msg(""); }); };
      nm.focus();
    }
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
        if (r.ok && r.data.access_token) { go.disabled = false; session = save(r.data); paintBtn(); afterLogin(); return; }
        if (r.status === 0 || r.status === 429 || r.status >= 500) { go.disabled = false; msg(r.status === 429 ? "Too many tries. Please wait a minute." : "Could not reach the server. Please try again."); return; }
        next(i + 1, r);
      });
    }
    next(0, null);
  }

  function logout() {
    var s = session; clear(); session = null; profile = null; afterCb = null; wr(FK, []); wr(RK, []); try { localStorage.removeItem(MK); } catch (e) {}
    paintBtn(); loginWhy = ""; render("home"); place(); fire();
    if (s) call("/auth/v1/logout", "POST", null, s.access_token);
  }

  /* open the panel again after a failed Google sign-in so the reason is visible */
  if (authMsg) setTimeout(open, 400);
  if (session) loadProfile();
  window.UntilsPlayer = {
    open: open, close: close, getSession: function () { return session; },
    need: needProfile, api: api, userId: function () { return (session && session.user && session.user.id) || (profile && profile.id) || ""; },
    isFav: isFav, toggleFav: toggleFav, addRecent: addRecent, onChange: function (f) { listeners.push(f); }
  };
})();
