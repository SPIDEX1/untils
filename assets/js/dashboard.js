/* UNTILS developer dashboard (login check + account info) */
(function () {
  "use strict";
  var A = window.UntilsAuth;
  var $ = function (id) { return document.getElementById(id); };
  var HOME = "/developers/";

  function render(u) {
    var meta = u.user_metadata || {};
    var email = u.email || "";
    var studio = meta.studio || email.split("@")[0] || "Developer";
    $("dvWho").textContent = email;
    $("dvHello").textContent = "Welcome, " + studio;
    $("dvStudio").textContent = studio;
    $("dvMail").textContent = email;
    var d = u.created_at ? new Date(u.created_at) : null;
    $("dvSince").textContent = d && !isNaN(d)
      ? d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
      : "-";
    $("dvDash").hidden = false;
  }

  function toLogin() { location.replace(HOME + "#signin"); }

  $("dvOut").addEventListener("click", function () {
    this.disabled = true;
    A.logout().then(function () { location.href = HOME; });
  });

  A.getSession().then(function (s) {
    if (!s) return toLogin();
    if (s.user) render(s.user);
    A.checkUser(s).then(function (u) {
      if (u === false) { A.clear(); toLogin(); }
      else if (u) render(u);
      else if (!s.user) toLogin();
    });
  });
})();
