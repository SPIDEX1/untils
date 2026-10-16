/* UNTILS developer login (Supabase Auth, email + 6-digit code).
   URL aur publishable key public hoti hain, browser mein hi rehti hain.
   Kabhi yahan secret key mat daalna. */
(function () {
  "use strict";

  var CFG = {
    URL: "https://fjfkwfklglovuxeecxsg.supabase.co",
    KEY: "sb_publishable_HUSSW4Xiau3suUYMfcTjtQ_h083WJbS"
  };
  var SK = "untils_session";

  /* ---- tiny fetch helper: kabhi reject nahi karta ---- */
  function call(path, method, body, token) {
    var h = { "apikey": CFG.KEY, "Content-Type": "application/json" };
    if (token) h["Authorization"] = "Bearer " + token;
    return fetch(CFG.URL + path, {
      method: method,
      headers: h,
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      return r.text().then(function (t) {
        var d = {};
        try { d = t ? JSON.parse(t) : {}; } catch (e) {}
        return { ok: r.ok, status: r.status, data: d };
      });
    }, function () {
      return { ok: false, status: 0, data: {} };
    });
  }

  function errCode(d) { return String(d.error_code || d.code || ""); }
  function errMsg(d) { return String(d.msg || d.message || d.error_description || d.error || ""); }

  function friendly(res, ctx) {
    var c = errCode(res.data), m = errMsg(res.data);
    if (res.status === 0) return "Could not reach the server. Check your internet connection and try again.";
    if (res.status === 429 || c === "over_email_send_rate_limit" || c === "over_request_rate_limit")
      return "Please wait a minute before asking for another code.";
    if (ctx === "send") {
      if (c === "otp_disabled" || c === "user_not_found" || /signups not allowed/i.test(m)) return "NO_ACCOUNT";
      if (c === "signup_disabled") return "New sign-ups are closed right now.";
      if (res.status >= 500 || /sending|email/i.test(m))
        return "We could not send the email right now. Please try again in a few minutes.";
    }
    if (ctx === "verify" && res.status >= 400 && res.status < 500)
      return "That code is not correct or has expired. Please try again.";
    console.error("UNTILS auth error", res.status, res.data);
    return "Something went wrong" + (m ? " (" + m + ")" : "") + ". Please try again.";
  }

  /* ---- session storage ---- */
  function load() {
    try { return JSON.parse(localStorage.getItem(SK)); } catch (e) { return null; }
  }
  function save(d) {
    var exp = d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600);
    var s = { access_token: d.access_token, refresh_token: d.refresh_token, expires_at: exp, user: d.user };
    try { localStorage.setItem(SK, JSON.stringify(s)); } catch (e) {}
    return s;
  }
  function clear() { try { localStorage.removeItem(SK); } catch (e) {} }
  function hasSession() { var s = load(); return !!(s && s.refresh_token); }

  /* ---- public api ---- */
  function sendCode(mode, email, name) {
    var body = { email: email, create_user: mode === "signup" };
    if (mode === "signup" && name) body.data = { studio: name };
    return call("/auth/v1/otp", "POST", body).then(function (r) {
      if (r.ok) return { ok: true };
      var f = friendly(r, "send");
      if (f === "NO_ACCOUNT")
        return { ok: false, noAccount: true, message: "No account found with this email. Use \"Create new account\" below." };
      return { ok: false, message: f };
    });
  }

  /* code ka type Supabase ke hisaab se alag ho sakta hai, isliye 3 type try karte hain */
  function verifyCode(email, code) {
    var types = ["email", "signup", "magiclink"], last = null;
    function next(i) {
      if (i >= types.length) return Promise.resolve({ ok: false, message: friendly(last, "verify") });
      return call("/auth/v1/verify", "POST", { email: email, token: code, type: types[i] }).then(function (r) {
        if (r.ok && r.data.access_token) {
          var s = save(r.data);
          return { ok: true, session: s };
        }
        last = r;
        if (r.status === 0 || r.status === 429 || r.status >= 500) return { ok: false, message: friendly(r, "verify") };
        return next(i + 1);
      });
    }
    return next(0);
  }

  function getSession() {
    var s = load();
    if (!s || !s.refresh_token) return Promise.resolve(null);
    if (s.expires_at - 60 > Date.now() / 1000) return Promise.resolve(s);
    return call("/auth/v1/token?grant_type=refresh_token", "POST", { refresh_token: s.refresh_token }).then(function (r) {
      if (r.ok && r.data.access_token) { save(r.data); return load(); }
      if (r.status === 0) return s;          /* internet nahi: purana session chalne do */
      clear();
      return null;
    });
  }

  /* true/user = theek, false = session band ho chuka, null = pata nahi (network) */
  function checkUser(s) {
    return call("/auth/v1/user", "GET", null, s.access_token).then(function (r) {
      if (r.ok && r.data && r.data.email) return r.data;
      if (r.status === 401 || r.status === 403) return false;
      return null;
    });
  }

  function logout() {
    var s = load();
    clear();
    if (!s) return Promise.resolve();
    return call("/auth/v1/logout", "POST", null, s.access_token).then(function () {});
  }

  window.UntilsAuth = {
    sendCode: sendCode,
    verifyCode: verifyCode,
    getSession: getSession,
    checkUser: checkUser,
    logout: logout,
    clear: clear,
    hasSession: hasSession
  };
})();
