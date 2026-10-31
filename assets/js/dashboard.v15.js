/* UNTILS developer dashboard */
(function () {
  "use strict";
  var A = window.UntilsAuth, HOME = "/developers/";
  var $ = function (id) { return document.getElementById(id); };
  function toLogin() { location.replace(HOME + "#signin"); }
  function render(u) {
    var m = u.user_metadata || {}, e = u.email || "";
    $("dvHello").textContent = "Welcome, " + (m.studio || e.split("@")[0] || "Developer");
    window.dvReady = true; if (window.dvShow) window.dvShow();
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
  function closeAll() { unsel(); }

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
  function mkb(tag, cls, icon, text) { var n = el(tag, cls); n.appendChild(UI.ico(icon)); n.appendChild(el("span", "tx", text)); n.setAttribute("aria-label", text); n.title = text; return n; }
  function playVer(x, v, btn) {
    var win = window.open("about:blank", "_blank"), old = btn.innerHTML; btn.disabled = true;
    api("GET", null, "?preview=" + encodeURIComponent(x.id) + "&ver=" + v.n).then(function (r) {
      if (!r.ok || !r.data.token) throw new Error(r.data.error || "Could not open this version.");
      var url = location.origin + "/play/" + r.data.token + "/index.html";
      if (win) win.location = url; else location.href = url;
    }).catch(function (e) { if (win) win.close(); alert(e.message); })
      .then(function () { btn.disabled = false; btn.innerHTML = old; });
  }
  function api(method, body, qs) {
    return A.getSession().then(function (s) {
      if (!s) { location.replace("/developers/#signin"); return { ok: false, data: {} }; }
      return fetch("/api/games" + (qs || ""), { method: method, headers: { "Authorization": "Bearer " + s.access_token, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, data: d }; }); },
          function () { return { ok: false, data: { error: "No internet connection." } }; });
    });
  }

  var G = [];
  function list(force) {
    return api("GET").then(function (r) {
      var ul = $("dvList"); ul.innerHTML = "";
      var g = (r.data && r.data.games) || []; G = g;
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
        li.onclick = function () { location.hash = "game-" + x.id; };
        ul.appendChild(li);
      });
      if (force || window.dvView !== "game") route();
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

  /* ---------- game page (opens when a game is clicked) ---------- */
  var S = null, eSnap = "", blobs = [], kerr = {}, vErr = "", delT = 0;
  var IMGT = "image/png,image/jpeg,image/webp";
  function blob(f) { var u = URL.createObjectURL(f); blobs.push(u); return u; }
  function freeBlobs() { blobs.forEach(function (u) { URL.revokeObjectURL(u); }); blobs = []; }
  function newState(x) { return { icon: null, iconRm: false, ban: null, banRm: false, thumb: null, thumbRm: false, logo: null, logoRm: false, video: null, videoRm: false, zip: null, keep: (x.shots || []).slice(), shots: [] }; }
  function mb(n) { return (n / 1048576).toFixed(1) + " MB"; }

  function checkThumb(f) {
    return imgCheck(f, "Thumbnail", function (w, h) { var r = w / h; return (w < 1280 || r < 1.7 || r > 1.85) ? "Thumbnail must be landscape, 1280 x 720 px (16:9). Yours is " + w + " x " + h + " px." : ""; });
  }
  function checkLogo(f) {
    return new Promise(function (ok, no) {
      if (!/^image\/(png|webp)$/.test(f.type)) return no(new Error("Text logo must be PNG or WebP (transparent background)."));
      if (f.size > 1024 * 1024) return no(new Error("Text logo must be under 1 MB."));
      var u = URL.createObjectURL(f), im = new Image();
      im.onload = function () { URL.revokeObjectURL(u); ok(); };
      im.onerror = function () { URL.revokeObjectURL(u); no(new Error("Could not read the text logo image.")); };
      im.src = u;
    });
  }
  function checkVideo(f) {
    return new Promise(function (ok, no) {
      if (!/^video\/(mp4|webm)$/.test(f.type)) return no(new Error("Video must be MP4 or WebM."));
      if (f.size > 20 * 1024 * 1024) return no(new Error("Video must be under 20 MB."));
      var u = URL.createObjectURL(f), v = document.createElement("video"), done = false;
      function end(e) { if (done) return; done = true; URL.revokeObjectURL(u); v.removeAttribute("src"); if (e) no(e); else ok(); }
      v.preload = "metadata"; v.muted = true;
      v.onloadedmetadata = function () {
        var w = v.videoWidth, h = v.videoHeight, d = v.duration;
        if (!((w === 1280 && h === 720) || (w === 720 && h === 1280))) return end(new Error("Video must be 1280 x 720 or 720 x 1280 px. Yours is " + w + " x " + h + " px."));
        if (isFinite(d) && d > 15.5) return end(new Error("Video can be 15 seconds at most. Yours is " + Math.round(d) + " seconds."));
        end();
      };
      v.onerror = function () { end(new Error("Could not read this video.")); };
      setTimeout(function () { end(new Error("Could not read this video.")); }, 10000);
      v.src = u;
    });
  }
  var KIT = {
    icon: { k: "icon", cur: "icon", label: "Game icon", req: 1, acc: IMGT, chk: checkIcon, sq: 1, spec: "Square, at least 512 x 512 px (1024 x 1024 recommended). PNG, JPG or WebP, under 2 MB." },
    ban: { k: "ban", cur: "banner", label: "Popular banner", acc: IMGT, chk: checkBanner, spec: "1920 x 400 px. PNG, JPG or WebP, under 2 MB. Keep the art in the centre and the left side calm." },
    thumb: { k: "thumb", cur: "thumb", label: "Thumbnail", acc: IMGT, chk: checkThumb, spec: "Landscape, 1280 x 720 px. PNG, JPG or WebP, under 2 MB. Game name as a text logo, only the core of your game." },
    logo: { k: "logo", cur: "logo", label: "Text logo", acc: "image/png,image/webp", chk: checkLogo, chkbg: 1, spec: "Your game name as a logo with a transparent background. PNG or WebP, under 1 MB." },
    video: { k: "video", cur: "video", label: "Gameplay video", acc: "video/mp4,video/webm", chk: checkVideo, vid: 1, spec: "Real gameplay, maximum 15 seconds. MP4 or WebM, 1280 x 720 or 720 x 1280. No UI at all. Under 20 MB." }
  };
  function fileIn(acc, multi, fn) {
    var i = document.createElement("input"); i.type = "file"; i.accept = acc; i.multiple = !!multi; i.style.display = "none";
    i.onchange = function () { var a = Array.prototype.slice.call(i.files); i.value = ""; if (a.length) fn(a); };
    return i;
  }
  function kitItem(d, x) {
    var w = el("div", "dk-item"), h = el("div", "dk-h"), has = S[d.k] ? "new" : S[d.k + "Rm"] ? "rm" : x[d.cur] ? "cur" : "none";
    h.appendChild(el("b", "", d.label)); h.appendChild(el("span", "dk-tag" + (d.req ? " req" : ""), d.req ? "Required" : "Optional")); w.appendChild(h);
    var m = el("div", "dk-m" + (d.chkbg ? " chk" : ""));
    if (has === "new" || has === "cur") {
      var url = has === "new" ? blob(S[d.k]) : IMG + x[d.cur], n;
      if (d.vid) { n = document.createElement("video"); n.controls = true; n.muted = true; n.preload = "metadata"; n.setAttribute("playsinline", ""); } else { n = el("img"); n.alt = ""; }
      n.src = url; if (d.sq) n.className = "sq"; m.appendChild(n);
      if (has === "new") m.appendChild(el("span", "dk-new", "New. Saved when you press Save Changes."));
    } else m.appendChild(el("p", "dk-none", has === "rm" ? "Will be removed when you save." : "Not added yet."));
    w.appendChild(m); w.appendChild(el("small", "dk-spec", d.spec));
    var row = el("div", "dv-links"), inp = fileIn(d.acc, false, function (a) {
      kerr[d.k] = ""; d.chk(a[0]).then(function () { S[d.k] = a[0]; S[d.k + "Rm"] = false; }, function (e) { kerr[d.k] = e.message; }).then(function () { renderKit(x); syncSave(); });
    });
    var ch = mkb("button", "dv-lk", has === "cur" || has === "new" ? "refresh" : "check", has === "cur" || has === "new" ? "Change" : "Add"); ch.type = "button"; ch.onclick = function () { inp.click(); }; row.appendChild(ch);
    if (has !== "none") {
      var rm = mkb("button", "dv-lk dv-danger", has === "rm" ? "refresh" : "trash", has === "new" ? "Cancel change" : has === "rm" ? "Undo remove" : "Remove"); rm.type = "button";
      rm.onclick = function () { kerr[d.k] = ""; if (has === "new") S[d.k] = null; else S[d.k + "Rm"] = has !== "rm"; renderKit(x); syncSave(); };
      row.appendChild(rm);
    }
    w.appendChild(row); w.appendChild(inp);
    if (d.req && has === "rm") w.appendChild(el("p", "dv-err", "The icon is required. Add a new icon before saving."));
    if (kerr[d.k]) w.appendChild(el("p", "dv-err", kerr[d.k]));
    return w;
  }
  function shotsItem(x) {
    var w = el("div", "dk-item"), h = el("div", "dk-h"), box = el("div", "dk-shots"), total = S.keep.length + S.shots.length;
    h.appendChild(el("b", "", "Screenshots")); h.appendChild(el("span", "dk-tag", "Optional · " + total + " / 5")); w.appendChild(h);
    function tile(src, onx) {
      var t = el("div", "dk-st"), im = el("img"), b = el("button", "", "×");
      im.src = src; im.alt = ""; b.type = "button"; b.title = "Remove"; b.setAttribute("aria-label", "Remove screenshot"); b.onclick = onx; t.appendChild(im); t.appendChild(b); box.appendChild(t);
    }
    S.keep.forEach(function (p, i) { tile(IMG + p, function () { S.keep.splice(i, 1); renderKit(x); syncSave(); }); });
    S.shots.forEach(function (f, i) { tile(blob(f), function () { S.shots.splice(i, 1); renderKit(x); syncSave(); }); });
    if (!total) box.appendChild(el("p", "dk-none", "No screenshots yet."));
    w.appendChild(box);
    w.appendChild(el("small", "dk-spec", "Up to 5 real screenshots with all the UI. 1280 x 720 px (landscape) or 720 x 1280 px (portrait). PNG, JPG or WebP, under 2 MB each."));
    var inp = fileIn(IMGT, true, function (a) {
      kerr.shots = "";
      if (S.keep.length + S.shots.length + a.length > 5) { kerr.shots = "You can have at most 5 screenshots in total."; renderKit(x); return; }
      checkShots(a).then(function () { S.shots = S.shots.concat(a); }, function (e) { kerr.shots = e.message; }).then(function () { renderKit(x); syncSave(); });
    });
    var add = mkb("button", "dv-lk", "check", "Add screenshots"); add.type = "button"; add.onclick = function () { inp.click(); }; add.disabled = total >= 5;
    var row = el("div", "dv-links"); row.appendChild(add); w.appendChild(row); w.appendChild(inp);
    if (kerr.shots) w.appendChild(el("p", "dv-err", kerr.shots));
    return w;
  }
  function renderKit(x) {
    freeBlobs();
    var K = $("eKit"); K.innerHTML = "";
    K.appendChild(kitItem(KIT.icon, x)); K.appendChild(shotsItem(x)); K.appendChild(kitItem(KIT.ban, x)); K.appendChild(kitItem(KIT.thumb, x)); K.appendChild(kitItem(KIT.logo, x)); K.appendChild(kitItem(KIT.video, x));
  }

  /* versions */
  function renderVers(x) {
    var P = $("eVers"); P.innerHTML = "";
    var top = el("div", "dv-vtop"), inp = fileIn(".zip,application/zip", false, function (a) {
      vErr = ""; var f = a[0];
      if (!/\.zip$/i.test(f.name) || f.size > MAX) vErr = "Zip must be a .zip file under 50 MB."; else S.zip = f;
      renderVers(x); syncSave();
    });
    top.appendChild(el("p", "dv-meta", "Every version you uploaded, with its upload date and time."));
    var up = mkb("button", "dv-play", "refresh", "Upload new version"); up.type = "button"; up.onclick = function () { inp.click(); };
    top.appendChild(up); top.appendChild(inp); P.appendChild(top);
    if (S.zip) {
      var sg = el("div", "dv-msg"); sg.appendChild(el("b", "", "New version ready: " + S.zip.name + " (" + mb(S.zip.size) + ")"));
      sg.appendChild(el("div", "", x.status === "live" ? "It uploads when you press Save Changes and goes live after our team reviews it. The current version keeps running until then." : "It uploads when you press Save Changes and your game goes into review again."));
      var cx = el("button", "dv-lk", "Cancel"); cx.type = "button"; cx.onclick = function () { S.zip = null; renderVers(x); syncSave(); }; sg.appendChild(cx); P.appendChild(sg);
    }
    if (vErr) P.appendChild(el("p", "dv-err", vErr));
    vlist(x).slice().sort(function (a, b) { return b.n - a.n; }).forEach(function (v) {
      var row = el("div", "dv-vr"), l = el("div"), t = el("b", "", "Version " + v.n), st = vState(x, v), acts = el("div", "dv-va");
      t.appendChild(mk("span", "dv-vt " + st.c, st.i, st.t));
      l.appendChild(t); l.appendChild(el("small", "", "Uploaded " + dtm(v.at)));
      var d = mkb("button", "dv-lk", "download", "Download"), p = mkb("button", "dv-play", "play", "Play preview"), i = mkb("a", "dv-lk", "scan", "Inspector");
      d.type = "button"; d.onclick = function () { dlVer(x, v, d); };
      p.type = "button"; p.onclick = function () { playVer(x, v, p); };
      i.href = "/developers/inspector/?id=" + encodeURIComponent(x.id) + "&ver=" + v.n; i.style.textDecoration = "none";
      acts.appendChild(d); acts.appendChild(p); acts.appendChild(i);
      row.appendChild(l); row.appendChild(acts); P.appendChild(row);
    });
  }

  /* status, stats, team messages */
  function renderStatus(x) {
    var B = $("eStatus"); B.innerHTML = "";
    var row = el("div", "dv-srow"), s0 = status(x);
    row.appendChild(el("b", "", "Status:")); row.appendChild(el("span", "dv-st " + x.status, x.status.toUpperCase())); B.appendChild(row);
    B.appendChild(UI.set(el("p", "dv-meta"), s0.i, s0.t));
    if (x.status === "live" && x.stats) {
      var S2 = el("div", "dv-stats");
      [["Plays", x.stats.plays], ["Players", x.stats.players], ["Last 7 days", x.stats.week], ["Likes", x.stats.likes], ["Dislikes", x.stats.dislikes]].forEach(function (k) {
        var c = el("div", "dv-stat"); c.appendChild(el("b", "", fmt(k[1]))); c.appendChild(el("small", "", k[0])); S2.appendChild(c);
      });
      B.appendChild(S2);
      var Lk = el("div", "dv-links"), path = "/games/" + slug(x.title) + "/", a = mk("a", "dv-play", "play", "Play live");
      a.href = path; a.target = "_blank"; a.rel = "noopener"; Lk.appendChild(a);
      var cp = el("button", "dv-lk", "Copy live link"); cp.type = "button"; cp.onclick = function () { copy(location.origin + path, cp); }; Lk.appendChild(cp); B.appendChild(Lk);
    }
    var M = $("eMsgs"); M.innerHTML = "";
    (x.msgs || []).slice().reverse().forEach(function (m) {
      var d = el("div", "dv-msg"); d.appendChild(mk("b", "", "bell", "Message from the UNTILS team · " + dt(m.at))); d.appendChild(el("div", "", m.text)); M.appendChild(d);
    });
    if (unread(x)) { x.msgSeen = Date.now(); api("PUT", { id: x.id, seen: true }); }
  }

  function gnote(t) { var n = $("gNote"); UI.set(n, "check", t); n.hidden = false; n.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
  function renderGame(x) {
    S = newState(x); kerr = {}; vErr = ""; clearTimeout(delT);
    $("gNote").hidden = true; $("eErr").textContent = ""; $("eDelBox").hidden = true;
    $("eTitle").textContent = "Edit: " + x.title;
    renderStatus(x);
    $("eName").value = x.title; $("eDesc").value = x.description; $("eCat").innerHTML = $("gCat").innerHTML.replace(/<option value="">[^<]*<\/option>/, ""); $("eCat").value = x.category;
    $("eDev").value = x.device || "all"; $("eOrL").checked = x.orient !== "portrait"; $("eOrP").checked = x.orient !== "landscape"; syncOr();
    renderKit(x); renderVers(x); eSnap = eState(); syncSave();
  }
  function eState() { return JSON.stringify([$("eName").value, $("eDesc").value, $("eCat").value, $("eDev").value, $("eOrL").checked, $("eOrP").checked, S.keep.join("|"), S.iconRm, S.banRm, S.thumbRm, S.logoRm, S.videoRm]); }
  function eDirty() { return !!S && (eState() !== eSnap || !!(S.icon || S.ban || S.thumb || S.logo || S.video || S.zip || S.shots.length)); }
  function syncSave() { $("eGo").disabled = !eDirty(); }
  $("dvEdit").addEventListener("input", syncSave); $("dvEdit").addEventListener("change", syncSave);

  /* which screen is showing: dashboard list or one game page (#game-ID) */
  window.dvShow = function () {
    if (!window.dvReady) return;
    $("dvDash").hidden = window.dvView === "game"; $("dvGame").hidden = window.dvView !== "game";
  };
  function route() {
    var m = /^#game-([a-z0-9-]+)$/.exec(location.hash), x = m && G.filter(function (g) { return g.id === m[1]; })[0];
    if (x) { cur = x; window.dvView = "game"; renderGame(x); }
    else { cur = null; S = null; freeBlobs(); window.dvView = "list"; }
    window.dvShow(); window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  $("gBack").addEventListener("click", function (e) { e.preventDefault(); history.replaceState(null, "", location.pathname + location.search); route(); });

  $("dvEdit").addEventListener("submit", function (e) {
    e.preventDefault();
    var x = cur, err = $("eErr"), btn = $("eGo"), ts = Date.now(), tok, uu;
    err.textContent = "";
    if (!x || !eDirty()) return;
    var body = { id: x.id, title: $("eName").value, description: $("eDesc").value, category: $("eCat").value, device: $("eDev").value, orient: $("eDev").value === "desktop" ? "both" : orVal($("eOrL").checked, $("eOrP").checked) };
    if (!body.orient) { err.textContent = "Choose at least one: Landscape or Portrait."; return; }
    if (S.iconRm && !S.icon) { err.textContent = "The game icon is required. Add a new icon before saving."; return; }
    if (S.keep.length + S.shots.length > 5) { err.textContent = "You can have at most 5 screenshots in total."; return; }
    btn.disabled = true; btn.textContent = "SAVING...";
    function up(bucket, path, file, type, label) {
      return fetch(C.URL + "/storage/v1/object/" + bucket + "/" + path, { method: "POST", headers: { "apikey": C.KEY, "Authorization": "Bearer " + tok, "Content-Type": type }, body: file })
        .then(function (r) { if (!r.ok) throw new Error(label + " upload failed (" + r.status + ")."); });
    }
    A.getSession().then(function (s) {
      if (!s) { location.replace("/developers/#signin"); throw new Error("Please sign in again."); }
      tok = s.access_token; uu = s.user.id; var p = Promise.resolve();
      function add(bucket, path, file, type, label) { p = p.then(function () { return up(bucket, path, file, type, label); }); }
      if (S.zip) { body.path = uu + "/" + x.id + "-v" + ts + ".zip"; add("game-zips", body.path, S.zip, "application/zip", "Zip"); }
      if (S.icon) { body.icon = uu + "/" + x.id + "-i" + ts + "." + ex(S.icon.type); add("game-icons", body.icon, S.icon, S.icon.type, "Icon"); }
      if (S.ban) { body.banner = uu + "/" + x.id + "-b" + ts + "." + ex(S.ban.type); add("game-icons", body.banner, S.ban, S.ban.type, "Banner"); } else if (S.banRm) body.removeBanner = true;
      if (S.thumb) { body.thumb = uu + "/" + x.id + "-t" + ts + "." + ex(S.thumb.type); add("game-icons", body.thumb, S.thumb, S.thumb.type, "Thumbnail"); } else if (S.thumbRm) body.removeThumb = true;
      if (S.logo) { body.logo = uu + "/" + x.id + "-l" + ts + "." + ex(S.logo.type); add("game-icons", body.logo, S.logo, S.logo.type, "Text logo"); } else if (S.logoRm) body.removeLogo = true;
      if (S.video) { body.video = uu + "/" + x.id + "-m" + ts + "." + (S.video.type === "video/webm" ? "webm" : "mp4"); add("game-icons", body.video, S.video, S.video.type, "Video"); } else if (S.videoRm) body.removeVideo = true;
      var np = []; S.shots.forEach(function (f, n) { var path = uu + "/" + x.id + "-s" + ts + n + "." + ex(f.type); np.push(path); add("game-icons", path, f, f.type, "Screenshot " + (n + 1)); });
      body.shots = S.keep.concat(np);
      return p;
    }).then(function () { return api("PUT", body); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.data.error || "Could not save.");
        var msg = body.path && x.status === "live" ? "Saved. Your new version will go live after our team reviews it (up to 2 days). The current version keeps running until then." : body.path ? "Saved. Your game is in review again. You will get the result within 2 days." : "Changes saved.";
        return list(true).then(function () { if (window.dvView === "game") gnote(msg); });
      })
      .catch(function (z) { err.textContent = z.message; })
      .then(function () { btn.textContent = "SAVE CHANGES"; syncSave(); });
  });

  /* delete game */
  $("eDel").addEventListener("click", function () { $("eDelBox").hidden = false; $("eDelBox").scrollIntoView({ behavior: "smooth", block: "center" }); });
  $("eDelNo").addEventListener("click", function () { $("eDelBox").hidden = true; });
  $("eDelYes").addEventListener("click", function () {
    var x = cur, b = $("eDelYes"), err = $("eErr"); if (!x) return; err.textContent = ""; b.disabled = true; b.textContent = "DELETING...";
    api("DELETE", { id: x.id }).then(function (r) {
      if (!r.ok) throw new Error(r.data.error || "Could not delete the game.");
      history.replaceState(null, "", location.pathname + location.search); closeInsp();
      return list(true).then(function () { note("Game deleted. It has been removed from UNTILS and from your dashboard."); });
    }).catch(function (e) { err.textContent = e.message; })
      .then(function () { b.disabled = false; UI.set(b, "trash", "YES, DELETE"); });
  });
  list();
})();
