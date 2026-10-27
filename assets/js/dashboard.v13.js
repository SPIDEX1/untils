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
  var A = window.UntilsAuth, C = A.cfg, MAX = 50 * 1024 * 1024, IMG = C.URL + "/storage/v1/object/public/game-icons/";
  var $ = function (id) { return document.getElementById(id); };
  var cur = null, eKeep = [], noteT = 0;

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function fmt(n) { n = +n || 0; return n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : String(n); }
  function slug(t) { return String(t).replace(/[<>&"'`\\$]/g, "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
  function dt(ts) { return ts ? new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"; }
  function unread(x) { return (x.msgs || []).filter(function (m) { return m.at > (x.msgSeen || 0); }).length; }
  function ex(t) { return t === "image/png" ? "png" : t === "image/webp" ? "webp" : "jpg"; }
  function mk(tag, cls, i, t) { return UI.set(el(tag, cls), i, t); }
  function status(x) {
    var m = { pending: ["hourglass", "In review. You will get the result within 2 days."], approved: ["shield", "Approved. Our team will make it live soon."], rejected: ["x-circle", "Not approved." + (x.note ? " " + x.note : "") + " You can fix it and upload again."], live: ["bolt", "Live on UNTILS."] }[x.status] || ["", x.status];
    var t = m[1];
    if (x.pending) t += " A new version is in review.";
    if (x.updateNote) t += " Update not approved: " + x.updateNote;
    return { i: m[0], t: t };
  }
  function sdkText(x) {
    var c = x.sdk && (x.sdk.path === x.path || (x.pending && x.sdk.path === x.pending.path)) ? x.sdk : null;
    return !c ? "not checked yet" : c.ok ? "detected" + (c.version ? " (" + c.name + " " + c.version + ")" : "") : "not detected";
  }
  function note(t) { var n = $("dvNote"); UI.set(n, "check", t); n.hidden = false; clearTimeout(noteT); noteT = setTimeout(function () { n.hidden = true; }, 12000); }
  function unsel() { [].forEach.call(document.querySelectorAll("#dvList li.sel"), function (n) { n.classList.remove("sel"); }); }
  function closeAll() { $("dvEdit").hidden = true; $("dvInfo").hidden = true; unsel(); }

  /* mobile screen (landscape / portrait) */
  function devText(x) { return x.device === "desktop" ? "PC only" : "Mobile + PC" + (x.orient === "landscape" ? " · Landscape" : x.orient === "portrait" ? " · Portrait" : ""); }
  function orVal(l, p) { return l && p ? "both" : l ? "landscape" : p ? "portrait" : ""; }
  function syncOr() { $("gOr").hidden = $("gDev").value === "desktop"; $("eOr").hidden = $("eDev").value === "desktop"; }
  $("gDev").addEventListener("change", syncOr); $("eDev").addEventListener("change", syncOr);

  /* versions */
  function vlist(x) { return (x.versions && x.versions.length) ? x.versions : [{ n: x.version || 1, path: x.path, at: x.createdAt }]; }
  function dtm(ts) { return ts ? new Date(ts).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "-"; }
  function vState(x, v) {
    if (x.pending && x.pending.path === v.path) return { t: "New, in review", c: "rv", i: "refresh" };
    if (v.path === x.path) return x.status === "live" ? { t: "Live now", c: "lv", i: "bolt" } : { t: "Current", c: "", i: "check-circle" };
    return { t: "Old version", c: "", i: "cube" };
  }
  function dlVer(x, v, btn) {
    var old = btn.innerHTML; btn.disabled = true; btn.textContent = "...";
    A.getSession().then(function (s) {
      if (!s) { location.replace("/developers/#signin"); throw new Error("Please sign in again."); }
      return fetch("/api/games?download=" + encodeURIComponent(x.id) + "&n=" + v.n, { headers: { "Authorization": "Bearer " + s.access_token } });
    }).then(function (r) {
      if (!r.ok) return r.json().catch(function () { return {}; }).then(function (d) { throw new Error(d.error || "Download failed."); });
      return r.blob();
    }).then(function (b) {
      var a = document.createElement("a"), u = URL.createObjectURL(b);
      a.href = u; a.download = (slug(x.title) || "game") + "-v" + v.n + ".zip"; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
    }).catch(function (e) { alert(e.message); })
      .then(function () { btn.disabled = false; btn.innerHTML = old; });
  }
  function renderVers(x) {
    var P = $("iVers"); P.innerHTML = "";
    P.appendChild(mk("h4", "", "cube", "All versions"));
    P.appendChild(el("p", "dv-meta", "Every version you uploaded, with its upload date and time. You can download any version."));
    vlist(x).slice().sort(function (a, b) { return b.n - a.n; }).forEach(function (v) {
      var row = el("div", "dv-vr"), l = el("div"), t = el("b", "", "Version " + v.n), st = vState(x, v), b = mk("button", "dv-lk", "download", "Download");
      t.appendChild(mk("span", "dv-vt " + st.c, st.i, st.t));
      l.appendChild(t); l.appendChild(el("small", "", "Uploaded " + dtm(v.at)));
      b.type = "button"; b.onclick = function () { dlVer(x, v, b); };
      row.appendChild(l); row.appendChild(b); P.appendChild(row);
    });
  }

  function api(method, body, qs) {
    return A.getSession().then(function (s) {
      if (!s) { location.replace("/developers/#signin"); return { ok: false, data: {} }; }
      return fetch("/api/games" + (qs || ""), { method: method, headers: { "Authorization": "Bearer " + s.access_token, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined })
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
        var li = el("li"), w = el("div"), d = el("div"), rt = el("div"), sub = x.category + " · " + devText(x);
        w.style.cssText = "display:flex;gap:10px;align-items:center"; rt.style.cssText = "display:flex;gap:8px;align-items:center";
        if (x.icon) { var im = el("img"); im.src = IMG + x.icon; im.alt = ""; im.width = 44; im.height = 44; im.style.borderRadius = "10px"; w.appendChild(im); }
        if (x.status === "pending") sub += " · Result within 2 days";
        else if (x.status === "live" && x.stats) sub += " · " + fmt(x.stats.plays) + " plays · " + fmt(x.stats.likes) + " likes";
        if (x.pending) sub += " · Update in review";
        d.appendChild(el("b", "", x.title)); d.appendChild(el("small", "", sub)); w.appendChild(d); li.appendChild(w);
        var n = unread(x); if (n) { li._bell = mk("span", "dv-bell", "bell", String(n)); rt.appendChild(li._bell); }
        if (x.status === "live") { var pl = mk("a", "dv-play", "play", "PLAY"); pl.target = "_blank"; pl.rel = "noopener"; pl.href = "/games/" + slug(x.title) + "/"; pl.onclick = function (ev) { ev.stopPropagation(); }; rt.appendChild(pl); }
        rt.appendChild(el("span", "dv-st " + x.status, x.status.toUpperCase())); li.appendChild(rt);
        li.onclick = function () { openEdit(x, li); };
        ul.appendChild(li);
      });
    });
  }

  function copy(text, btn) {
    var h = btn.innerHTML;
    function ok() { UI.set(btn, "check", "Copied"); setTimeout(function () { btn.innerHTML = h; }, 1800); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, function () { prompt("Copy this link:", text); });
    else prompt("Copy this link:", text);
  }
  function preview(x, open, btn) {
    var old = btn.innerHTML, win = open ? window.open("about:blank", "_blank") : null;
    btn.disabled = true; btn.textContent = "...";
    api("GET", null, "?preview=" + encodeURIComponent(x.id)).then(function (r) {
      if (!r.ok || !r.data.token) throw new Error(r.data.error || "Could not create the link.");
      var url = location.origin + "/games/" + slug(x.title) + "/?pv=" + encodeURIComponent(r.data.token);
      if (open) { if (win) win.location = url; else location.href = url; } else { btn.innerHTML = old; copy(url, btn); }
    }).catch(function (e) { if (win) win.close(); alert(e.message); })
      .then(function () { btn.disabled = false; if (btn.textContent === "...") btn.innerHTML = old; });
  }

  function renderInfo(x) {
    $("iIc").src = x.icon ? IMG + x.icon : ""; $("iIc").hidden = !x.icon;
    $("iTitle").textContent = x.title; var st0 = status(x); UI.set($("iStatus"), st0.i, st0.t);
    var S = $("iStats"); S.innerHTML = "";
    if (x.status === "live" && x.stats) {
      [["Plays", x.stats.plays], ["Players", x.stats.players], ["Last 7 days", x.stats.week], ["Likes", x.stats.likes], ["Dislikes", x.stats.dislikes]].forEach(function (k) {
        var c = el("div", "dv-stat"); c.appendChild(el("b", "", fmt(k[1]))); c.appendChild(el("small", "", k[0])); S.appendChild(c);
      });
    } else S.appendChild(el("p", "dv-meta", "Plays, players and likes will show here once your game is live."));
    var Lk = $("iLinks"); Lk.innerHTML = "";
    var path = "/games/" + slug(x.title) + "/";
    if (x.status === "live") {
      var a = mk("a", "dv-play", "play", "Play live"); a.href = path; a.target = "_blank"; a.rel = "noopener"; Lk.appendChild(a);
      var cp = el("button", "dv-lk", "Copy live link"); cp.type = "button"; cp.onclick = function () { copy(location.origin + path, cp); }; Lk.appendChild(cp);
    } else {
      var pv = mk("button", "dv-play", "play", "Preview on UNTILS"); pv.type = "button"; pv.onclick = function () { preview(x, true, pv); }; Lk.appendChild(pv);
      var c2 = el("button", "dv-lk", "Copy preview link"); c2.type = "button"; c2.onclick = function () { preview(x, false, c2); }; Lk.appendChild(c2);
      Lk.appendChild(el("small", "dv-meta", "A preview link works for 24 hours. Only people with the link can play."));
    }
    var ci = mk("a", "dv-lk", "scan", "Inspector view"); ci.href = "/developers/inspector/?id=" + encodeURIComponent(x.id); ci.style.textDecoration = "none"; Lk.appendChild(ci);
    if (x.pending) { var cn = mk("a", "dv-lk", "scan", "Inspect new version"); cn.href = "/developers/inspector/?id=" + encodeURIComponent(x.id) + "&v=new"; cn.style.textDecoration = "none"; Lk.appendChild(cn); }
    var vb = mk("button", "dv-lk", "cube", "Versions (" + vlist(x).length + ")"); vb.type = "button";
    $("iVers").hidden = true; $("iVers").innerHTML = "";
    vb.onclick = function () { var P = $("iVers"); if (!P.hidden) { P.hidden = true; return; } renderVers(x); P.hidden = false; };
    Lk.appendChild(vb);
    var M = $("iMsgs"); M.innerHTML = "";
    (x.msgs || []).slice().reverse().forEach(function (m) {
      var d = el("div", "dv-msg"); d.appendChild(mk("b", "", "bell", "Message from the UNTILS team · " + dt(m.at))); d.appendChild(el("div", "", m.text)); M.appendChild(d);
    });
    $("iMeta").textContent = x.category + " · " + devText(x) + " · Version " + (x.version || 1) + " · Submitted " + dt(x.createdAt) + " · SDK: " + sdkText(x);
    if (unread(x)) { x.msgSeen = Date.now(); api("PUT", { id: x.id, seen: true }); }
  }

  var insCtl = null, insT = 0;
  function closeInsp() { clearInterval(insT); if (insCtl) { insCtl.stop(); insCtl = null; } $("dvInsp").hidden = true; }
  function inspect(gameId, which) {
    var S = $("inState"), docs = $("inDocs");
    clearInterval(insT); if (insCtl) { insCtl.stop(); insCtl = null; }
    $("dvInsp").hidden = false; docs.style.display = "none";
    $("inLink").href = "/developers/inspector/?id=" + encodeURIComponent(gameId) + (which === "new" ? "&v=new" : "");
    UI.set(S, "scan", "Checking your game for the Untils SDK...");
    $("dvInsp").scrollIntoView({ behavior: "smooth" });
    api("GET", null, "?preview=" + encodeURIComponent(gameId) + (which === "new" ? "&v=new" : "")).then(function (r) {
      if (!r.ok || !r.data.token) { S.textContent = "Could not start the automatic check. You can still open the Inspector view below."; return; }
      var done = false, t0 = Date.now(), tpl = false;
      function finish(ok, name, version) {
        if (done) return; done = true; clearInterval(insT);
        if (insCtl) { insCtl.stop(); insCtl = null; }
        UI.set(S, ok ? "check-circle" : "warn", ok ? "Untils SDK detected" + (name ? " (" + name + " " + version + ")" : "") + "." : "The Untils SDK was not detected. The SDK is optional, but recommended.");
        docs.style.display = ok ? "none" : "inline-block";
        api("PUT", { id: gameId, sdk: { ok: ok, name: name || "", version: version || "", which: which } }).then(list);
      }
      insCtl = UntilsInspect.start({
        id: gameId, url: "/play/" + r.data.token + "/index.html", container: $("inHold"),
        onState: function (st) {
          if (st.init && (st.via !== "unity-template" || st.unityName)) finish(true, st.unityName || st.sdk, st.unityName ? st.unityVersion : st.version);
          else if (st.init && st.via === "unity-template" && !tpl) { tpl = true; UI.set(S, "scan", "Unity template found. Waiting for your game to call Untils.Init()..."); }
        }
      });
      insT = setInterval(function () { if (Date.now() - t0 > (tpl ? 90000 : 15000)) finish(false); }, 1000);
    });
  }
  $("inClose").addEventListener("click", closeInsp);

  function uid() { var a = new Uint8Array(8); crypto.getRandomValues(a); return "g" + Array.prototype.map.call(a, function (n) { return ("0" + n.toString(16)).slice(-2); }).join(""); }
  function imgCheck(f, label, test) {
    return new Promise(function (ok, no) {
      if (!/^image\/(png|jpeg|webp)$/.test(f.type)) return no(new Error(label + " must be PNG, JPG or WebP."));
      if (f.size > 2 * 1024 * 1024) return no(new Error(label + " must be under 2 MB."));
      var u = URL.createObjectURL(f), im = new Image();
      im.onload = function () { URL.revokeObjectURL(u); var m = test(im.naturalWidth, im.naturalHeight); if (m) no(new Error(m)); else ok(); };
      im.onerror = function () { no(new Error("Could not read the " + label.toLowerCase() + " image.")); };
      im.src = u;
    });
  }
  function checkIcon(f) {
    if (!f) return Promise.reject(new Error("Please choose a game icon."));
    return imgCheck(f, "Icon", function (w, h) { return w !== h ? "Icon must be square. Yours is " + w + " x " + h + " px." : w < 512 ? "Icon is too small (" + w + " px). Minimum is 512 x 512 px." : ""; });
  }
  function checkBanner(f) {
    if (!f) return Promise.resolve();
    return imgCheck(f, "Banner", function (w, h) { var r = w / h; return (w < 1600 || r < 4.3 || r > 5.3) ? "Banner must be about 1920 x 400 px (at least 1600 px wide, ratio near 4.8:1). Yours is " + w + " x " + h + " px." : ""; });
  }
  function checkShots(a) {
    var p = Promise.resolve();
    a.forEach(function (f) { p = p.then(function () { return imgCheck(f, "Screenshot", function (w) { return w < 640 ? "Screenshot is too small. Minimum width is 640 px." : ""; }); }); });
    return p;
  }

  $("dvAddBtn").addEventListener("click", function () { var f = $("dvGameForm"); closeAll(); f.hidden = !f.hidden; });
  $("dvGameForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("gErr"), btn = $("gGo"), zip = $("gZip").files[0], ic = $("gIcon").files[0], id = uid(), tok, zp, ip, bp, bf = $("gBan").files[0], uidv, sf = Array.prototype.slice.call($("gShots").files), sp = [];
    err.textContent = "";
    if (!$("gCat").value) { err.textContent = "Please choose a category."; return; }
    if (!zip || !/\.zip$/i.test(zip.name)) { err.textContent = "Please choose a .zip file."; return; }
    if (zip.size > MAX) { err.textContent = "Zip is larger than 50 MB."; return; }
    if (sf.length > 5) { err.textContent = "You can add at most 5 screenshots."; return; }
    var gor = $("gDev").value === "desktop" ? "both" : orVal($("gOrL").checked, $("gOrP").checked);
    if (!gor) { err.textContent = "Choose at least one: Landscape or Portrait."; return; }
    btn.disabled = true; btn.textContent = "CHECKING...";
    function put(bucket, path, file, type, label) {
      return fetch(C.URL + "/storage/v1/object/" + bucket + "/" + path, { method: "POST", headers: { "apikey": C.KEY, "Authorization": "Bearer " + tok, "Content-Type": type }, body: file })
        .then(function (r) { if (!r.ok) throw new Error(label + " upload failed (" + r.status + ")."); });
    }
    checkIcon(ic).then(function () { return checkBanner(bf); }).then(function () { return checkShots(sf); }).then(function () { return A.getSession(); }).then(function (s) {
      if (!s) { location.replace("/developers/#signin"); throw new Error("Please sign in again."); }
      btn.textContent = "UPLOADING...";
      uidv = s.user.id; tok = s.access_token; zp = uidv + "/" + id + ".zip"; ip = uidv + "/" + id + "." + ex(ic.type);
      bp = bf ? uidv + "/" + id + "-banner." + ex(bf.type) : "";
      return put("game-zips", zp, zip, "application/zip", "Zip");
    }).then(function () { return put("game-icons", ip, ic, ic.type, "Icon"); })
      .then(function () { return bf ? put("game-icons", bp, bf, bf.type, "Banner") : null; })
      .then(function () { var p = Promise.resolve(); sf.forEach(function (f, n) { var path = uidv + "/" + id + "-s" + Date.now() + n + "." + ex(f.type); sp.push(path); p = p.then(function () { return put("game-icons", path, f, f.type, "Screenshot " + (n + 1)); }); }); return p; })
      .then(function () { return api("POST", { id: id, path: zp, icon: ip, banner: bp, shots: sp, title: $("gTitle").value, category: $("gCat").value, device: $("gDev").value, orient: gor, description: $("gDesc").value }); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.data.error || "Could not save the game.");
        $("dvGameForm").reset(); syncOr(); $("dvGameForm").hidden = true; list();
        note("Game submitted! It is now in review. You will get the result within 2 days. Click your game to see its details and preview it.");
        inspect(id, "cur");
      })
      .catch(function (x) { err.textContent = x.message; })
      .then(function () { btn.disabled = false; btn.textContent = "UPLOAD GAME"; });
  });

  var eSnap = "";
  function eState() { return JSON.stringify([$("eName").value, $("eDesc").value, $("eCat").value, $("eDev").value, $("eOrL").checked, $("eOrP").checked, $("eRm").checked, eKeep.join("|")]); }
  function eDirty() { return eState() !== eSnap || ["eIcon", "eBan", "eZip", "eShotsNew"].some(function (i) { return $(i).files.length > 0; }); }
  function syncSave() { $("eGo").disabled = !eDirty(); }
  $("dvEdit").addEventListener("input", syncSave); $("dvEdit").addEventListener("change", syncSave);

  function renderKeep() {
    var b = $("eShots"); b.innerHTML = "";
    eKeep.forEach(function (p, i) {
      var w = el("div"), im = el("img"), x = el("button", "", "×");
      w.style.cssText = "position:relative"; im.src = IMG + p; im.width = 90; im.height = 60; im.style.cssText = "object-fit:cover;border-radius:8px";
      x.type = "button"; x.title = "Remove"; x.style.cssText = "position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;border:0;background:#e0334c;color:#fff;cursor:pointer;font-weight:800;line-height:1;padding:0";
      x.onclick = function () { eKeep.splice(i, 1); renderKeep(); syncSave(); }; w.appendChild(im); w.appendChild(x); b.appendChild(w);
    });
  }
  function openEdit(x, li) {
    unsel(); if (li) { li.classList.add("sel"); if (li._bell) li._bell.remove(); }
    cur = x; $("dvGameForm").hidden = true; renderInfo(x); $("dvInfo").hidden = false;
    var f = $("dvEdit"); f.hidden = false;
    $("eCat").innerHTML = $("gCat").innerHTML.replace(/<option value="">[^<]*<\/option>/, "");
    $("eTitle").textContent = "Edit: " + x.title; $("eName").value = x.title; $("eDesc").value = x.description; $("eCat").value = x.category; $("eDev").value = x.device || "all"; $("eOrL").checked = x.orient !== "portrait"; $("eOrP").checked = x.orient !== "landscape"; syncOr();
    $("eIc").src = x.icon ? IMG + x.icon : ""; $("eIc").hidden = !x.icon; $("eBn").src = x.banner ? IMG + x.banner : ""; $("eBn").hidden = !x.banner;
    ["eIcon", "eBan", "eZip", "eShotsNew"].forEach(function (i) { $(i).value = ""; }); $("eRm").checked = false; $("eErr").textContent = "";
    eKeep = (x.shots || []).slice(); renderKeep(); $("eDelBox").hidden = true; eSnap = eState(); syncSave();
    $("dvInfo").scrollIntoView({ behavior: "smooth" });
  }
  $("eCancel").addEventListener("click", closeAll);
  $("dvEdit").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("eErr"), btn = $("eGo"), x = cur, ic = $("eIcon").files[0], bf = $("eBan").files[0], zip = $("eZip").files[0], sf = Array.prototype.slice.call($("eShotsNew").files), ts = Date.now(), tok,
      body = { id: x.id, title: $("eName").value, description: $("eDesc").value, category: $("eCat").value, device: $("eDev").value, orient: $("eDev").value === "desktop" ? "both" : orVal($("eOrL").checked, $("eOrP").checked) };
    err.textContent = "";
    if (!eDirty()) return;
    if (!body.orient) { err.textContent = "Choose at least one: Landscape or Portrait."; return; }
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
      .then(function (r) {
        if (!r.ok) throw new Error(r.data.error || "Could not save.");
        closeAll(); list();
        note(body.path && x.status === "live" ? "Saved. Your new version will go live after our team reviews it (up to 2 days). The current version keeps running until then." : body.path ? "Saved. Your game is in review again. You will get the result within 2 days." : "Changes saved.");
        if (body.path) inspect(x.id, x.status === "live" ? "new" : "cur");
      })
      .catch(function (z) { err.textContent = z.message; })
      .then(function () { btn.textContent = "SAVE CHANGES"; syncSave(); });
  });

  /* delete game */
  $("eDel").addEventListener("click", function () { $("eDelBox").hidden = false; $("eDelBox").scrollIntoView({ behavior: "smooth", block: "center" }); });
  $("eDelNo").addEventListener("click", function () { $("eDelBox").hidden = true; });
  $("eDelYes").addEventListener("click", function () {
    var x = cur, b = $("eDelYes"), err = $("eErr"); err.textContent = ""; b.disabled = true; b.textContent = "DELETING...";
    api("DELETE", { id: x.id }).then(function (r) {
      if (!r.ok) throw new Error(r.data.error || "Could not delete the game.");
      closeAll(); closeInsp(); list(); note("Game deleted. It has been removed from UNTILS and from your dashboard.");
    }).catch(function (e) { err.textContent = e.message; })
      .then(function () { b.disabled = false; UI.set(b, "trash", "YES, DELETE"); });
  });
  list();
})();
