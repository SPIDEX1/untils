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
    $("dvHello").textContent = "Welcome, " + studio;
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

/* ---- games: add + list ---- */
(function () {
  "use strict";
  var A = window.UntilsAuth, C = A.cfg;
  var $ = function (id) { return document.getElementById(id); };
  var MAX = 50 * 1024 * 1024;

  function api(method, body) {
    return A.getSession().then(function (s) {
      if (!s) { location.replace("/developers/#signin"); return { ok: false, data: {} }; }
      return fetch("/api/games", {
        method: method,
        headers: { "Authorization": "Bearer " + s.access_token, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, data: d }; });
      }, function () { return { ok: false, data: { error: "No internet connection." } }; });
    });
  }

  function list() {
    api("GET").then(function (r) {
      var ul = $("dvList"); ul.innerHTML = "";
      var g = (r.data && r.data.games) || [];
      $("dvEmpty").hidden = g.length > 0;
      g.forEach(function (x) {
        var li = document.createElement("li"), d = document.createElement("div");
        var b = document.createElement("b"), sm = document.createElement("small"), st = document.createElement("span");
        b.textContent = x.title; sm.textContent = x.category + " · " + (x.device === "desktop" ? "PC only" : "Mobile + PC") + (x.note ? " · " + x.note : "");
        st.className = "dv-st " + x.status; st.textContent = x.status.toUpperCase();
        d.appendChild(b); d.appendChild(sm); li.appendChild(d); li.appendChild(st); ul.appendChild(li);
      });
    });
  }

  function uid() {
    var a = new Uint8Array(8); crypto.getRandomValues(a);
    return "g" + Array.prototype.map.call(a, function (n) { return ("0" + n.toString(16)).slice(-2); }).join("");
  }

  $("dvAddBtn").addEventListener("click", function () {
    var f = $("dvGameForm"); f.hidden = !f.hidden;
  });

  $("dvGameForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("gErr"), btn = $("gGo"), file = $("gZip").files[0];
    err.textContent = "";
    if (!$("gCat").value) { err.textContent = "Please choose a category."; return; }
    if (!file || !/\.zip$/i.test(file.name)) { err.textContent = "Please choose a .zip file."; return; }
    if (file.size > MAX) { err.textContent = "Zip is larger than 50 MB."; return; }
    btn.disabled = true; btn.textContent = "UPLOADING...";
    var id = uid();
    A.getSession().then(function (s) {
      if (!s) { location.replace("/developers/#signin"); return; }
      var path = s.user.id + "/" + id + ".zip";
      return fetch(C.URL + "/storage/v1/object/game-zips/" + path, {
        method: "POST",
        headers: { "apikey": C.KEY, "Authorization": "Bearer " + s.access_token, "Content-Type": "application/zip" },
        body: file
      }).then(function (up) {
        if (!up.ok) throw new Error("Zip upload failed (" + up.status + ").");
        return api("POST", { id: id, path: path, title: $("gTitle").value, category: $("gCat").value, device: $("gDev").value, description: $("gDesc").value });
      }).then(function (r) {
        if (!r.ok) throw new Error(r.data.error || "Could not save the game.");
        $("dvGameForm").reset(); $("dvGameForm").hidden = true; list();
      });
    }).catch(function (x) { err.textContent = x.message; })
      .then(function () { btn.disabled = false; btn.textContent = "UPLOAD GAME"; });
  });

  list();
})();
