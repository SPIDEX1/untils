/* UNTILS developer account page */
(function () {
  "use strict";
  var A = window.UntilsAuth, C = A.cfg, meta = {}, filled = false;
  var $ = function (id) { return document.getElementById(id); };
  function toLogin() { location.replace("/developers/#signin"); }
  function render(u) {
    meta = u.user_metadata || {};
    $("aStudio").textContent = meta.studio || (u.email || "").split("@")[0] || "-";
    $("aMail").textContent = u.email || "-";
    var d = u.created_at ? new Date(u.created_at) : null;
    $("aSince").textContent = d && !isNaN(d) ? d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "-";
    if (!filled) { $("aStudioIn").value = meta.studio || ""; $("aAbout").value = meta.about || ""; $("aAddr").value = meta.address || ""; filled = true; }
    $("acc").hidden = false;
  }
  $("dvOut").addEventListener("click", function () { this.disabled = true; A.logout().then(function () { location.href = "/developers/"; }); });
  $("aForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("aErr"), btn = $("aGo"); err.textContent = ""; btn.disabled = true; btn.textContent = "SAVING...";
    A.getSession().then(function (s) {
      if (!s) return toLogin();
      var st = $("aStudioIn").value.trim();
      if (Array.from(st).length > 25) { err.textContent = "Studio name can be 25 characters at most."; return; }
      if (st.length < 2) { err.textContent = "Please enter your studio or developer name (at least 2 characters)."; return; }
      var data = { about: $("aAbout").value.trim(), address: $("aAddr").value.trim(), studio: st };
      return fetch(C.URL + "/auth/v1/user", { method: "PUT", headers: { "apikey": C.KEY, "Authorization": "Bearer " + s.access_token, "Content-Type": "application/json" }, body: JSON.stringify({ data: data }) })
        .then(function (r) { if (!r) return; if (r.ok) { meta.studio = st; $("aStudio").textContent = st; } err.textContent = r.ok ? "Saved" : "Could not save. Please try again."; });
    }).catch(function () { err.textContent = "No internet connection."; })
      .then(function () { btn.disabled = false; btn.textContent = "SAVE"; });
  });
  A.getSession().then(function (s) {
    if (!s) return toLogin();
    if (s.user) render(s.user);
    A.checkUser(s).then(function (u) {
      if (u === false) { A.clear(); toLogin(); } else if (u) render(u); else if (!s.user) toLogin();
    });
  });
})();
