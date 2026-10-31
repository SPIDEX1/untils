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
  function syncOr() { $("eOr").hidden = $("eDev").value === "desktop"; }
  $("eDev").addEventListener("change", syncOr);

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

  /* ---------- game page (opens when a game is clicked) ---------- */
  var S = null, eSnap = "", blobs = [], kerr = {}, vErr = "", delT = 0;
  var IMGT = "image/png,image/jpeg,image/webp";
  function blob(f) { var u = URL.createObjectURL(f); blobs.push(u); return u; }
  function freeBlobs() { blobs.forEach(function (u) { URL.revokeObjectURL(u); }); blobs = []; }
  function newState(x) { return { icon: null, iconRm: false, ban: null, banRm: false, thumb: null, thumbRm: false, logo: null, logoRm: false, video: null, videoRm: false, zip: null, keep: (x.shots || []).slice(), shots: [], pv: {} }; }
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
  function addBtn(cls, text) {
    var b = el("button", cls), s = el("span", "ic");
    s.innerHTML = '<svg class="ic-s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
    b.type = "button"; b.appendChild(s); b.appendChild(el("span", "tx", text)); b.setAttribute("aria-label", text); b.title = text; return b;
  }
  function mnode(d, url, big) {
    var n;
    if (d.vid) { n = document.createElement("video"); n.controls = true; n.muted = true; n.setAttribute("playsinline", ""); if (big) { n.autoplay = true; n.loop = true; } else n.preload = "metadata"; }
    else { n = el("img"); n.alt = ""; }
    n.src = url; n.className = (big ? "pv-m " : "dk-t ") + "k-" + d.k; return n;
  }
  /* preview panel */
  var PV = null;
  function pvClose() {
    if (!PV || PV.shade.hidden) return;
    var v = PV.body.querySelector("video"); if (v) { try { v.pause(); } catch (e) {} v.removeAttribute("src"); v.load(); }
    PV.body.innerHTML = ""; PV.shade.hidden = true; document.documentElement.style.overflow = "";
  }
  function pvOpen(title, nodes) {
    if (!PV) {
      var shade = el("div", "pv"), box = el("div", "pv-box"), hd = el("div", "pv-h"), ttl = el("h3"), x = el("button", "pv-x"), body = el("div", "pv-body");
      shade.hidden = true; shade.setAttribute("role", "dialog"); shade.setAttribute("aria-modal", "true");
      x.type = "button"; x.title = "Close"; x.setAttribute("aria-label", "Close"); x.appendChild(UI.ico("x")); x.onclick = pvClose;
      hd.appendChild(ttl); hd.appendChild(x); box.appendChild(hd); box.appendChild(body); shade.appendChild(box); document.body.appendChild(shade);
      shade.addEventListener("click", function (e) { if (e.target === shade) pvClose(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") pvClose(); });
      PV = { shade: shade, ttl: ttl, body: body };
    }
    PV.ttl.textContent = "Preview: " + title; PV.body.innerHTML = "";
    nodes.forEach(function (n) { PV.body.appendChild(n); });
    PV.shade.hidden = false; document.documentElement.style.overflow = "hidden";
  }

  function kitItem(d, x) {
    var w = el("div", "dk-item"), h = el("div", "dk-h"), has = S[d.k] ? "new" : S[d.k + "Rm"] ? "rm" : x[d.cur] ? "cur" : "none", go = S.isNew ? "Upload Game" : "Save Changes";
    var has2 = has === "cur" || has === "new", url = has2 ? (has === "new" ? blob(S[d.k]) : IMG + x[d.cur]) : "";
    h.appendChild(el("b", "", d.label)); h.appendChild(el("span", "dk-tag" + (d.req ? " req" : ""), d.req ? "Required" : "Optional")); w.appendChild(h);
    w.appendChild(el("small", "dk-spec", d.spec));
    var m = el("div", "dk-m" + (d.chkbg ? " chk" : ""));
    if (has2) m.appendChild(mnode(d, url, false)); else m.appendChild(el("p", "dk-none", has === "rm" ? "Will be removed when you save." : "Not added yet."));
    w.appendChild(m);
    if (has === "new") w.appendChild(el("small", "dk-new", "New file selected. It is saved when you press " + go + "."));
    var row = el("div", "dv-links dk-btns"), inp = fileIn(d.acc, false, function (a) {
      kerr[d.k] = ""; d.chk(a[0]).then(function () { S[d.k] = a[0]; S[d.k + "Rm"] = false; }, function (e) { kerr[d.k] = e.message; }).then(function () { renderKit(x); syncSave(); });
    });
    var ch = has2 ? mkb("button", "dv-lk", "refresh", "Change") : addBtn("dv-lk", "Add"); ch.type = "button"; ch.onclick = function () { inp.click(); }; row.appendChild(ch);
    if (has !== "none") {
      var rm = mkb("button", "dv-lk dv-danger", has === "rm" ? "refresh" : "trash", has === "new" ? "Cancel change" : has === "rm" ? "Undo remove" : "Remove"); rm.type = "button";
      rm.onclick = function () { kerr[d.k] = ""; if (has === "new") S[d.k] = null; else S[d.k + "Rm"] = has !== "rm"; renderKit(x); syncSave(); };
      row.appendChild(rm);
    }
    w.appendChild(row); w.appendChild(inp);
    if (kerr[d.k]) w.appendChild(el("p", "dv-err", kerr[d.k]));
    else if (d.req && has === "rm") w.appendChild(el("p", "dv-err", "The icon is required. Add a new icon before saving."));
    if (has2) {
      var pr = el("div", "dv-links dk-btns"), pb = mkb("button", "dv-lk", "eye", "Preview"); pb.type = "button";
      pb.onclick = function () { pvOpen(d.label, [mnode(d, url, true)]); }; pr.appendChild(pb); w.appendChild(pr);
    }
    return w;
  }
  function shotsItem(x) {
    var w = el("div", "dk-item"), h = el("div", "dk-h"), total = S.keep.length + S.shots.length, urls = [];
    h.appendChild(el("b", "", "Screenshots")); h.appendChild(el("span", "dk-tag", "Optional · " + total + " / 5")); w.appendChild(h);
    w.appendChild(el("small", "dk-spec", "Up to 5 real screenshots with all the UI. 1280 x 720 px (landscape) or 720 x 1280 px (portrait). PNG, JPG or WebP, under 2 MB each."));
    var box = el("div", "dk-shots");
    function tile(src, onx) {
      var t = el("div", "dk-st"), im = el("img"), b = el("button", "", "×");
      im.src = src; im.alt = ""; b.type = "button"; b.title = "Remove"; b.setAttribute("aria-label", "Remove screenshot"); b.onclick = onx; t.appendChild(im); t.appendChild(b); box.appendChild(t); urls.push(src);
    }
    S.keep.forEach(function (p, i) { tile(IMG + p, function () { S.keep.splice(i, 1); renderKit(x); syncSave(); }); });
    S.shots.forEach(function (f, i) { tile(blob(f), function () { S.shots.splice(i, 1); renderKit(x); syncSave(); }); });
    if (!total) box.appendChild(el("p", "dk-none", "No screenshots yet."));
    w.appendChild(box);
    var inp = fileIn(IMGT, true, function (a) {
      kerr.shots = "";
      if (S.keep.length + S.shots.length + a.length > 5) { kerr.shots = "You can have at most 5 screenshots in total."; renderKit(x); return; }
      checkShots(a).then(function () { S.shots = S.shots.concat(a); }, function (e) { kerr.shots = e.message; }).then(function () { renderKit(x); syncSave(); });
    });
    var add = addBtn("dv-lk", "Add"); add.onclick = function () { inp.click(); }; add.disabled = total >= 5;
    var row = el("div", "dv-links dk-btns"); row.appendChild(add); w.appendChild(row); w.appendChild(inp);
    if (kerr.shots) w.appendChild(el("p", "dv-err", kerr.shots));
    if (total) {
      var pr = el("div", "dv-links dk-btns"), pb = mkb("button", "dv-lk", "eye", "Preview"); pb.type = "button";
      pb.onclick = function () {
        var g = el("div", "pv-grid"); urls.forEach(function (u) { var im = el("img"); im.src = u; im.alt = ""; g.appendChild(im); });
        pvOpen("Screenshots", [g]);
      };
      pr.appendChild(pb); w.appendChild(pr);
    }
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
    top.appendChild(el("p", "dv-meta", S.isNew ? "Upload your game as a .zip file. The index.html file must be at the top of the zip (max 50 MB)." : "Every version you uploaded, with its upload date and time."));
    var up = S.isNew ? addBtn("dv-play", "Upload Game Version") : mkb("button", "dv-play", "refresh", "Upload new version"); up.type = "button"; up.onclick = function () { inp.click(); };
    top.appendChild(up); top.appendChild(inp); P.appendChild(top);
    if (S.zip) {
      var sg = el("div", "dv-msg"); sg.appendChild(el("b", "", (S.isNew ? "Game zip ready: " : "New version ready: ") + S.zip.name + " (" + mb(S.zip.size) + ")"));
      sg.appendChild(el("div", "", S.isNew ? "It uploads when you press Upload Game." : x.status === "live" ? "It uploads when you press Save Changes and goes live after our team reviews it. The current version keeps running until then." : "It uploads when you press Save Changes and your game goes into review again."));
      var cx = el("button", "dv-lk", "Cancel"); cx.type = "button"; cx.onclick = function () { S.zip = null; renderVers(x); syncSave(); }; sg.appendChild(cx); P.appendChild(sg);
    }
    if (vErr) P.appendChild(el("p", "dv-err", vErr));
    if (S.isNew) return;
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

  /* status, stats, team messages (edit mode only) */
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

  function gnote(t) { var n = $("gNote"); UI.set(n, "check", t); n.hidden = false; n.scrollIntoView({ behavior: "smooth", block: "center" }); }
  var CATS = ["Action", "Adventure", "Arcade", "Board", "Card", "Casual", "Educational", "Endless Runner", "Fighting", "Horror", "Idle", "Kids", "Multiplayer", "Music", "Platformer", "Puzzle", "Racing", "Role Playing", "Sandbox", "Shooter", "Simulation", "Space", "Sports", "Strategy", "Survival", "Tower Defense", "Trivia", "Word", "Other"], GX = null, MAPF = { eName: "name", eDesc: "desc", eCat: "cat", eDev: "or", eOrL: "or", eOrP: "or" };
  function blank() { return { id: null, title: "", description: "", category: "", device: "all", orient: "both", shots: [], versions: [], status: "new" }; }
  function setFe(k, m) { var n = $("fe-" + k); if (n) n.textContent = m || ""; }
  function clearErrs() { ["name", "desc", "cat", "or"].forEach(function (k) { setFe(k, ""); }); kerr = {}; vErr = ""; $("eErr").textContent = ""; }
  function scrollErr() {
    var a = [].slice.call(document.querySelectorAll("#dvGame .dv-err")).filter(function (n) { return n.textContent.trim(); });
    if (a[0]) a[0].scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function goText() { return S && S.isNew ? "UPLOAD GAME" : "SAVE CHANGES"; }
  function renderGame(x, isNew) {
    S = newState(x); S.isNew = !!isNew; GX = x; clearErrs(); clearTimeout(delT);
    $("gNote").hidden = true; $("eDelBox").hidden = true;
    $("gHead").textContent = isNew ? "New Game" : "Game Edits";
    $("eTitle").hidden = $("eStatus").hidden = $("eMsgs").hidden = !!isNew;
    if (isNew) { $("eStatus").innerHTML = ""; $("eMsgs").innerHTML = ""; } else { $("eTitle").textContent = "Edit: " + x.title; renderStatus(x); }
    $("eName").value = x.title; $("eDesc").value = x.description;
    $("eCat").innerHTML = (isNew ? '<option value="">Choose...</option>' : "") + CATS.map(function (c) { return "<option>" + c + "</option>"; }).join(""); $("eCat").value = x.category;
    $("eDev").value = x.device || "all"; $("eOrL").checked = x.orient !== "portrait"; $("eOrP").checked = x.orient !== "landscape"; syncOr();
    $("eGo").textContent = goText(); UI.set($("eDel"), "trash", isNew ? "REMOVE GAME" : "DELETE GAME");
    renderKit(x); renderVers(x); eSnap = eState(); syncSave();
  }
  function eState() { return JSON.stringify([$("eName").value, $("eDesc").value, $("eCat").value, $("eDev").value, $("eOrL").checked, $("eOrP").checked, S.keep.join("|"), S.iconRm, S.banRm, S.thumbRm, S.logoRm, S.videoRm]); }
  function eDirty() { return !!S && (eState() !== eSnap || !!(S.icon || S.ban || S.thumb || S.logo || S.video || S.zip || S.shots.length)); }
  function syncSave() { $("eGo").disabled = !S || (!S.isNew && !eDirty()); }
  function onEdit(e) { var k = MAPF[e.target && e.target.id]; if (k) setFe(k, ""); syncSave(); }
  $("dvEdit").addEventListener("input", onEdit); $("dvEdit").addEventListener("change", onEdit);

  /* which screen is showing: dashboard list or one game page (#game-ID / #new) */
  window.dvShow = function () {
    if (!window.dvReady) return;
    $("dvDash").hidden = window.dvView === "game"; $("dvGame").hidden = window.dvView !== "game";
  };
  function route() {
    var m = /^#game-([a-z0-9-]+)$/.exec(location.hash), x = m && G.filter(function (g) { return g.id === m[1]; })[0];
    if (location.hash === "#new") { cur = null; window.dvView = "game"; renderGame(blank(), true); }
    else if (x) { cur = x; window.dvView = "game"; renderGame(x, false); }
    else { cur = null; S = null; GX = null; freeBlobs(); window.dvView = "list"; }
    window.dvShow(); window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  $("dvAddBtn").addEventListener("click", function () { location.hash = "new"; });
  $("gBack").addEventListener("click", function (e) { e.preventDefault(); history.replaceState(null, "", location.pathname + location.search); route(); });

  function validate(x) {
    clearErrs();
    var bad = false, t = $("eName").value.replace(/[<>&"'`\\$]/g, "").replace(/\s+/g, " ").trim(), d = $("eDesc").value.trim();
    if (t.length < 2 || t.length > 60) { setFe("name", t ? "Name must be 2 to 60 characters." : "Please enter the game name."); bad = true; }
    if (d.length < 10 || d.length > 500) { setFe("desc", d ? "Description must be 10 to 500 characters." : "Please add a description (at least 10 characters)."); bad = true; }
    if (!$("eCat").value) { setFe("cat", "Please choose a category."); bad = true; }
    if ($("eDev").value !== "desktop" && !$("eOrL").checked && !$("eOrP").checked) { setFe("or", "Choose at least one: Landscape or Portrait."); bad = true; }
    if ((S.isNew && !S.icon) || (S.iconRm && !S.icon)) { kerr.icon = S.isNew ? "Game icon is required. Please add your game icon." : "The icon is required. Add a new icon before saving."; bad = true; }
    if (S.isNew && !S.zip) { vErr = "Game version is required. Please upload your game zip with index.html."; bad = true; }
    if (S.keep.length + S.shots.length > 5) { kerr.shots = "You can have at most 5 screenshots in total."; bad = true; }
    if (bad) { renderKit(x); renderVers(x); scrollErr(); }
    return !bad;
  }
  function srvErr(m, x) {
    if (/name/i.test(m) && !/file|path/i.test(m)) setFe("name", m);
    else if (/description/i.test(m)) setFe("desc", m);
    else if (/category/i.test(m)) setFe("cat", m);
    else $("eErr").textContent = m;
    if (x) renderKit(x);
    scrollErr();
  }
  function baseBody() {
    return { title: $("eName").value, description: $("eDesc").value, category: $("eCat").value, device: $("eDev").value, orient: $("eDev").value === "desktop" ? "both" : orVal($("eOrL").checked, $("eOrP").checked) };
  }
  function upTo(tok, bucket, path, file, type, label) {
    return fetch(C.URL + "/storage/v1/object/" + bucket + "/" + path, { method: "POST", headers: { "apikey": C.KEY, "Authorization": "Bearer " + tok, "Content-Type": type }, body: file })
      .then(function (r) { if (!r.ok) throw new Error(label + " upload failed (" + r.status + ")."); });
  }
  function vext(f) { return f.type === "video/webm" ? "webm" : "mp4"; }

  function createGame(x) {
    var btn = $("eGo"), id = uid(), ts = Date.now(), tok, uu, body = baseBody(); body.id = id;
    btn.disabled = true; btn.textContent = "UPLOADING...";
    A.getSession().then(function (s) {
      if (!s) { location.replace("/developers/#signin"); throw new Error("Please sign in again."); }
      tok = s.access_token; uu = s.user.id; var p = Promise.resolve();
      function add(bucket, path, file, type, label) { p = p.then(function () { return upTo(tok, bucket, path, file, type, label); }); }
      body.path = uu + "/" + id + ".zip"; add("game-zips", body.path, S.zip, "application/zip", "Zip");
      body.icon = uu + "/" + id + "." + ex(S.icon.type); add("game-icons", body.icon, S.icon, S.icon.type, "Icon");
      body.banner = ""; if (S.ban) { body.banner = uu + "/" + id + "-banner." + ex(S.ban.type); add("game-icons", body.banner, S.ban, S.ban.type, "Banner"); }
      if (S.thumb) { body.thumb = uu + "/" + id + "-t" + ts + "." + ex(S.thumb.type); add("game-icons", body.thumb, S.thumb, S.thumb.type, "Thumbnail"); }
      if (S.logo) { body.logo = uu + "/" + id + "-l" + ts + "." + ex(S.logo.type); add("game-icons", body.logo, S.logo, S.logo.type, "Text logo"); }
      if (S.video) { body.video = uu + "/" + id + "-m" + ts + "." + vext(S.video); add("game-icons", body.video, S.video, S.video.type, "Video"); }
      var np = []; S.shots.forEach(function (f, n) { var path = uu + "/" + id + "-s" + ts + n + "." + ex(f.type); np.push(path); add("game-icons", path, f, f.type, "Screenshot " + (n + 1)); });
      body.shots = np;
      return p;
    }).then(function () { return api("POST", body); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.data.error || "Could not save the game.");
        history.replaceState(null, "", location.pathname + location.search);
        return list(true).then(function () {
          note("Game submitted! It is now in review. You will get the result within 2 days. Click your game to see its details and preview it.");
          inspect(id, "cur");
        });
      })
      .catch(function (z) { srvErr(z.message, GX); })
      .then(function () { btn.textContent = goText(); syncSave(); });
  }
  function saveGame(x) {
    var btn = $("eGo"), ts = Date.now(), tok, uu, body = baseBody(); body.id = x.id;
    btn.disabled = true; btn.textContent = "SAVING...";
    A.getSession().then(function (s) {
      if (!s) { location.replace("/developers/#signin"); throw new Error("Please sign in again."); }
      tok = s.access_token; uu = s.user.id; var p = Promise.resolve();
      function add(bucket, path, file, type, label) { p = p.then(function () { return upTo(tok, bucket, path, file, type, label); }); }
      if (S.zip) { body.path = uu + "/" + x.id + "-v" + ts + ".zip"; add("game-zips", body.path, S.zip, "application/zip", "Zip"); }
      if (S.icon) { body.icon = uu + "/" + x.id + "-i" + ts + "." + ex(S.icon.type); add("game-icons", body.icon, S.icon, S.icon.type, "Icon"); }
      if (S.ban) { body.banner = uu + "/" + x.id + "-b" + ts + "." + ex(S.ban.type); add("game-icons", body.banner, S.ban, S.ban.type, "Banner"); } else if (S.banRm) body.removeBanner = true;
      if (S.thumb) { body.thumb = uu + "/" + x.id + "-t" + ts + "." + ex(S.thumb.type); add("game-icons", body.thumb, S.thumb, S.thumb.type, "Thumbnail"); } else if (S.thumbRm) body.removeThumb = true;
      if (S.logo) { body.logo = uu + "/" + x.id + "-l" + ts + "." + ex(S.logo.type); add("game-icons", body.logo, S.logo, S.logo.type, "Text logo"); } else if (S.logoRm) body.removeLogo = true;
      if (S.video) { body.video = uu + "/" + x.id + "-m" + ts + "." + vext(S.video); add("game-icons", body.video, S.video, S.video.type, "Video"); } else if (S.videoRm) body.removeVideo = true;
      var np = []; S.shots.forEach(function (f, n) { var path = uu + "/" + x.id + "-s" + ts + n + "." + ex(f.type); np.push(path); add("game-icons", path, f, f.type, "Screenshot " + (n + 1)); });
      body.shots = S.keep.concat(np);
      return p;
    }).then(function () { return api("PUT", body); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.data.error || "Could not save.");
        var msg = body.path && x.status === "live" ? "Saved. Your new version will go live after our team reviews it (up to 2 days). The current version keeps running until then." : body.path ? "Saved. Your game is in review again. You will get the result within 2 days." : "Changes saved.";
        return list(true).then(function () { if (window.dvView === "game") gnote(msg); });
      })
      .catch(function (z) { srvErr(z.message, GX); })
      .then(function () { btn.textContent = goText(); syncSave(); });
  }
  $("dvEdit").addEventListener("submit", function (e) {
    e.preventDefault();
    var x = GX; if (!x || !S) return;
    if (!S.isNew && !eDirty()) return;
    if (!validate(x)) return;
    if (S.isNew) createGame(x); else saveGame(x);
  });

  /* delete game (edit mode) / remove game (new mode: just discards the form) */
  $("eDel").addEventListener("click", function () {
    $("eDelTx").textContent = S && S.isNew ? "Remove this new game? Everything you entered and chose here will be cleared." : "Delete this game permanently? It will be removed from UNTILS and from your dashboard, along with all its versions and files. This cannot be undone.";
    UI.set($("eDelYes"), "trash", S && S.isNew ? "YES, REMOVE" : "YES, DELETE");
    $("eDelBox").hidden = false; $("eDelBox").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  $("eDelNo").addEventListener("click", function () { $("eDelBox").hidden = true; });
  $("eDelYes").addEventListener("click", function () {
    if (S && S.isNew) { history.replaceState(null, "", location.pathname + location.search); route(); return; }
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
