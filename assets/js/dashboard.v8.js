/* UNTILS developer dashboard */
(function () {
  "use strict";
  var A = window.UntilsAuth, HOME = "/developers/";
  var $ = function (id) { return document.getElementById(id); };
  function toLogin() { location.replace(HOME + "#signin"); }
  function render(u) {
    var m = u.user_metadata || {}, e = u.email || "";
    $("dvHello").textContent = "Welcome, " + (m.studio || e.split("@")[0] || "Developer");
    $("dvDash").hidden = false;
  }
  $("dvOut").addEventListener("click", function () { this.disabled = true; A.logout().then(function () { location.href = HOME; }); });
  A.getSession().then(function (s) {
    if (!s) return toLogin();
    if (s.user) render(s.user);
    A.checkUser(s).then(function (u) {
      if (u === false) { A.clear(); toLogin(); } else if (u) render(u); else if (!s.user) toLogin();
    });
  });
})();

(function () {
  "use strict";
  var A = window.UntilsAuth, C = A.cfg, MAX = 50 * 1024 * 1024;
  var $ = function (id) { return document.getElementById(id); };
  function api(method, body) {
    return A.getSession().then(function (s) {
      if (!s) { location.replace("/developers/#signin"); return { ok: false, data: {} }; }
      return fetch("/api/games", { method: method, headers: { "Authorization": "Bearer " + s.access_token, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, data: d }; }); },
          function () { return { ok: false, data: { error: "No internet connection." } }; });
    });
  }
  function list() {
    api("GET").then(function (r) {
      var ul = $("dvList"); ul.innerHTML = "";
      var g = (r.data && r.data.games) || [];
      $("dvEmpty").hidden = g.length > 0;
      g.forEach(function (x) {
        var li = document.createElement("li"), w = document.createElement("div"), d = document.createElement("div");
        var b = document.createElement("b"), sm = document.createElement("small"), st = document.createElement("span");
        w.style.cssText = "display:flex;gap:10px;align-items:center";
        if (x.icon) { var im = document.createElement("img"); im.src = C.URL + "/storage/v1/object/public/game-icons/" + x.icon; im.alt = ""; im.width = 44; im.height = 44; im.style.borderRadius = "10px"; w.appendChild(im); }
        b.textContent = x.title; sm.textContent = x.category + " · " + (x.device === "desktop" ? "PC only" : "Mobile + PC") + (x.note ? " · " + x.note : "") + (x.pending ? " · 🔄 New version in review" : "") + (x.updateNote ? " · Update not approved: " + x.updateNote : "");
        st.className = "dv-st " + x.status; st.textContent = x.status.toUpperCase();
        d.appendChild(b); d.appendChild(sm); w.appendChild(d); li.appendChild(w); var rt = document.createElement("div"); rt.style.cssText = "display:flex;gap:8px;align-items:center";
        if (x.status === "live") { var pl = document.createElement("a"); pl.className = "dv-play"; pl.textContent = "▶ PLAY"; pl.target = "_blank"; pl.rel = "noopener"; pl.href = "/games/" + x.title.replace(/[<>&"'`\\$]/g, "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "/"; pl.onclick = function (ev) { ev.stopPropagation(); }; rt.appendChild(pl); }
        rt.appendChild(st); li.appendChild(rt); li.style.cursor = "pointer"; li.onclick = function () { openEdit(x, li); }; ul.appendChild(li);
      });
    });
  }
  function uid() { var a = new Uint8Array(8); crypto.getRandomValues(a); return "g" + Array.prototype.map.call(a, function (n) { return ("0" + n.toString(16)).slice(-2); }).join(""); }
  function checkIcon(f) {
    return new Promise(function (ok, no) {
      if (!f) return no(new Error("Please choose a game icon."));
      if (!/^image\/(png|jpeg|webp)$/.test(f.type)) return no(new Error("Icon must be PNG, JPG or WebP."));
      if (f.size > 2 * 1024 * 1024) return no(new Error("Icon must be under 2 MB."));
      var u = URL.createObjectURL(f), im = new Image();
      im.onload = function () {
        URL.revokeObjectURL(u); var w = im.naturalWidth, h = im.naturalHeight;
        if (w !== h) no(new Error("Icon must be square. Yours is " + w + " x " + h + " px."));
        else if (w < 512) no(new Error("Icon is too small (" + w + " px). Minimum is 512 x 512 px."));
        else ok();
      };
      im.onerror = function () { no(new Error("Could not read the icon image.")); };
      im.src = u;
    });
  }
  function checkShot(f) {
    return new Promise(function (ok, no) {
      if (!/^image\/(png|jpeg|webp)$/.test(f.type)) return no(new Error("Screenshots must be PNG, JPG or WebP."));
      if (f.size > 2 * 1024 * 1024) return no(new Error("Each screenshot must be under 2 MB."));
      var u = URL.createObjectURL(f), im = new Image();
      im.onload = function () { URL.revokeObjectURL(u); if (im.naturalWidth < 640) no(new Error("Screenshot is too small. Minimum width is 640 px.")); else ok(); };
      im.onerror = function () { no(new Error("Could not read a screenshot.")); };
      im.src = u;
    });
  }
  function checkShots(a) { var p = Promise.resolve(); a.forEach(function (f) { p = p.then(function () { return checkShot(f); }); }); return p; }
  function checkBanner(f) {
    return new Promise(function (ok, no) {
      if (!f) return ok();
      if (!/^image\/(png|jpeg|webp)$/.test(f.type)) return no(new Error("Banner must be PNG, JPG or WebP."));
      if (f.size > 2 * 1024 * 1024) return no(new Error("Banner must be under 2 MB."));
      var u = URL.createObjectURL(f), im = new Image();
      im.onload = function () {
        URL.revokeObjectURL(u); var w = im.naturalWidth, h = im.naturalHeight, r = w / h;
        if (w < 1600 || r < 4.3 || r > 5.3) no(new Error("Banner must be about 1920 x 400 px (at least 1600 px wide, ratio near 4.8:1). Yours is " + w + " x " + h + " px."));
        else ok();
      };
      im.onerror = function () { no(new Error("Could not read the banner image.")); };
      im.src = u;
    });
  }
  $("dvAddBtn").addEventListener("click", function () { var f = $("dvGameForm"); f.hidden = !f.hidden; $("dvEdit").hidden = true; unsel(); });
  $("dvGameForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("gErr"), btn = $("gGo"), zip = $("gZip").files[0], ic = $("gIcon").files[0], id = uid(), tok, zp, ip, bp, bf = $("gBan").files[0], uidv, sf = Array.prototype.slice.call($("gShots").files), sp = [];
    err.textContent = "";
    if (!$("gCat").value) { err.textContent = "Please choose a category."; return; }
    if (!zip || !/\.zip$/i.test(zip.name)) { err.textContent = "Please choose a .zip file."; return; }
    if (zip.size > MAX) { err.textContent = "Zip is larger than 50 MB."; return; }
    if (sf.length > 5) { err.textContent = "You can add at most 5 screenshots."; return; }
    btn.disabled = true; btn.textContent = "CHECKING...";
    function put(bucket, path, file, type, label) {
      return fetch(C.URL + "/storage/v1/object/" + bucket + "/" + path, { method: "POST", headers: { "apikey": C.KEY, "Authorization": "Bearer " + tok, "Content-Type": type }, body: file })
        .then(function (r) { if (!r.ok) throw new Error(label + " upload failed (" + r.status + ")."); });
    }
    checkIcon(ic).then(function () { return checkBanner(bf); }).then(function () { return checkShots(sf); }).then(function () { return A.getSession(); }).then(function (s) {
      if (!s) { location.replace("/developers/#signin"); throw new Error("Please sign in again."); }
      btn.textContent = "UPLOADING...";
      uidv = s.user.id; tok = s.access_token; zp = s.user.id + "/" + id + ".zip";
      ip = s.user.id + "/" + id + "." + (ic.type === "image/png" ? "png" : ic.type === "image/webp" ? "webp" : "jpg");
      bp = bf ? s.user.id + "/" + id + "-banner." + (bf.type === "image/png" ? "png" : bf.type === "image/webp" ? "webp" : "jpg") : "";
      return put("game-zips", zp, zip, "application/zip", "Zip");
    }).then(function () { return put("game-icons", ip, ic, ic.type, "Icon"); })
      .then(function () { return bf ? put("game-icons", bp, bf, bf.type, "Banner") : null; })
      .then(function () { var p = Promise.resolve(); sf.forEach(function (f, n) { var path = uidv + "/" + id + "-s" + Date.now() + n + "." + ex(f.type); sp.push(path); p = p.then(function () { return put("game-icons", path, f, f.type, "Screenshot " + (n + 1)); }); }); return p; })
      .then(function () { return api("POST", { id: id, path: zp, icon: ip, banner: bp, shots: sp, title: $("gTitle").value, category: $("gCat").value, device: $("gDev").value, description: $("gDesc").value }); })
      .then(function (r) { if (!r.ok) throw new Error(r.data.error || "Could not save the game."); $("dvGameForm").reset(); $("dvGameForm").hidden = true; list(); })
      .catch(function (x) { err.textContent = x.message; })
      .then(function () { btn.disabled = false; btn.textContent = "UPLOAD GAME"; });
  });
  var cur = null, IMG = C.URL + "/storage/v1/object/public/game-icons/";
  function ex(t) { return t === "image/png" ? "png" : t === "image/webp" ? "webp" : "jpg"; }
  function unsel() { [].forEach.call(document.querySelectorAll("#dvList li.sel"), function (n) { n.classList.remove("sel"); }); }
  var eKeep = [];
  function renderKeep() {
    var b = $("eShots"); b.innerHTML = "";
    eKeep.forEach(function (p, i) {
      var w = document.createElement("div"), im = document.createElement("img"), x = document.createElement("button");
      w.style.cssText = "position:relative"; im.src = IMG + p; im.width = 90; im.height = 60; im.style.cssText = "object-fit:cover;border-radius:8px";
      x.type = "button"; x.textContent = "×"; x.title = "Remove"; x.style.cssText = "position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;border:0;background:#e0334c;color:#fff;cursor:pointer;font-weight:800;line-height:1;padding:0";
      x.onclick = function () { eKeep.splice(i, 1); renderKeep(); }; w.appendChild(im); w.appendChild(x); b.appendChild(w);
    });
  }
  function openEdit(x, li) {
    unsel(); if (li) li.classList.add("sel");
    cur = x; $("dvGameForm").hidden = true; var f = $("dvEdit"); f.hidden = false;
    $("eCat").innerHTML = $("gCat").innerHTML.replace(/<option value="">[^<]*<\/option>/, "");
    $("eTitle").textContent = "Edit: " + x.title; $("eDesc").value = x.description; $("eCat").value = x.category; $("eDev").value = x.device || "all";
    $("eIc").src = x.icon ? IMG + x.icon : ""; $("eIc").hidden = !x.icon; $("eBn").src = x.banner ? IMG + x.banner : ""; $("eBn").hidden = !x.banner;
    ["eIcon", "eBan", "eZip"].forEach(function (i) { $(i).value = ""; }); $("eRm").checked = false; $("eErr").textContent = ""; eKeep = (x.shots || []).slice(); renderKeep(); $("eShotsNew").value = "";
    f.scrollIntoView({ behavior: "smooth" });
  }
  $("eCancel").addEventListener("click", function () { $("dvEdit").hidden = true; unsel(); });
  $("dvEdit").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("eErr"), btn = $("eGo"), x = cur, ic = $("eIcon").files[0], bf = $("eBan").files[0], zip = $("eZip").files[0], sf = Array.prototype.slice.call($("eShotsNew").files), ts = Date.now(), tok,
      body = { id: x.id, description: $("eDesc").value, category: $("eCat").value, device: $("eDev").value };
    err.textContent = "";
    if (zip && (!/\.zip$/i.test(zip.name) || zip.size > MAX)) { err.textContent = "Zip must be a .zip file under 50 MB."; return; }
    if (eKeep.length + sf.length > 5) { err.textContent = "You can have at most 5 screenshots in total."; return; }
    btn.disabled = true; btn.textContent = "SAVING...";
    function up(bucket, path, file, type, label) {
      return fetch(C.URL + "/storage/v1/object/" + bucket + "/" + path, { method: "POST", headers: { "apikey": C.KEY, "Authorization": "Bearer " + tok, "Content-Type": type }, body: file })
        .then(function (r) { if (!r.ok) throw new Error(label + " upload failed (" + r.status + ")."); });
    }
    (ic ? checkIcon(ic) : Promise.resolve()).then(function () { return checkBanner(bf); }).then(function () { return checkShots(sf); }).then(function () { return A.getSession(); }).then(function (s) {
      if (!s) { location.replace("/developers/#signin"); throw new Error("Please sign in again."); }
      tok = s.access_token; var u = s.user.id, p = Promise.resolve();
      if (zip) { body.path = u + "/" + x.id + "-v" + ts + ".zip"; p = p.then(function () { return up("game-zips", body.path, zip, "application/zip", "Zip"); }); }
      if (ic) { body.icon = u + "/" + x.id + "-i" + ts + "." + ex(ic.type); p = p.then(function () { return up("game-icons", body.icon, ic, ic.type, "Icon"); }); }
      if (bf) { body.banner = u + "/" + x.id + "-b" + ts + "." + ex(bf.type); p = p.then(function () { return up("game-icons", body.banner, bf, bf.type, "Banner"); }); }
      else if ($("eRm").checked) body.removeBanner = true;
      var np = []; sf.forEach(function (f, n) { var path = u + "/" + x.id + "-s" + ts + n + "." + ex(f.type); np.push(path); p = p.then(function () { return up("game-icons", path, f, f.type, "Screenshot " + (n + 1)); }); });
      body.shots = eKeep.concat(np);
      return p;
    }).then(function () { return api("PUT", body); })
      .then(function (r) { if (!r.ok) throw new Error(r.data.error || "Could not save."); $("dvEdit").hidden = true; unsel(); list(); if (body.path && x.status === "live") alert("Saved. Your new version will go live after our team reviews it (up to 2 days). The current version keeps running until then."); })
      .catch(function (z) { err.textContent = z.message; })
      .then(function () { btn.disabled = false; btn.textContent = "SAVE CHANGES"; });
  });
  list();
})();
