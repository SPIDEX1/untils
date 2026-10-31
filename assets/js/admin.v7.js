(function () {
  "use strict";
  var IC = "https://fjfkwfklglovuxeecxsg.supabase.co" + "/storage/v1/object/public/game-icons/";
  function liveBtns(x) { var b = [["approved", "ok", "✔ APPROVE"], ["rejected", "no", "✖ REJECT"], ["pending", "g", "Back to pending"]]; if (x.status === "approved") b.unshift(["live", "ok", "🚀 GO LIVE"]); if (x.status === "live") b.unshift(["approved", "g", "⏸ Take offline"]); return b; }
  var MOB = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 820);
  var A = window.UntilsAuth, $ = function (i) { return document.getElementById(i); }, role = null, tab = "pending", email = "";
  function h(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function api(a, body, method) {
    return A.getSession().then(function (s) {
      if (!s) { view("login"); return { ok: false, data: {} }; }
      return fetch("/api/admin/" + a, { method: method || (body ? "POST" : "GET"), headers: { "Authorization": "Bearer " + s.access_token, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, data: d, status: r.status }; }); },
          function () { return { ok: false, data: { error: "No internet." } }; });
    });
  }
  function view(v) { $("login").hidden = v !== "login"; $("deny").hidden = v !== "deny"; $("app").hidden = v !== "app"; $("bar").hidden = v === "login"; }
  function init() {
    api("me").then(function (r) {
      if (r.status === 401 || !r.ok && !r.data.role && r.status !== 403) return view("login");
      role = r.data.role; email = r.data.email; $("who").textContent = email; $("role").textContent = (role || "no access").toUpperCase();
      if (!role) return view("deny");
      $("tt").hidden = role !== "leader"; $("td").hidden = role !== "leader"; view("app"); load();
    });
  }
  $("send").onclick = function () { $("le").textContent = ""; A.sendCode("signup", $("em").value.trim().toLowerCase(), "").then(function (r) { if (!r.ok) $("le").textContent = r.message; else { $("s1").hidden = true; $("s2").hidden = false; } }); };
  $("ver").onclick = function () { A.verifyCode($("em").value.trim().toLowerCase(), $("cd").value.trim()).then(function (r) { if (!r.ok) $("le").textContent = r.message; else init(); }); };
  $("out").onclick = function () { A.logout().then(function () { location.reload(); }); };
  document.querySelectorAll("[data-t]").forEach(function (b) { b.onclick = function () { tab = b.getAttribute("data-t"); $("det").hidden = true; load(); }; });

  function load() {
    document.querySelectorAll("[data-t]").forEach(function (b) { b.className = b.getAttribute("data-t") === tab ? "" : "g"; });
    var L = $("list"); L.innerHTML = "";
    if (tab === "team") return team(L);
    if (tab === "demo") return demoTab(L);
    api("games").then(function (r) {
      var g = (r.data.games || []).filter(function (x) { return tab === "pending" ? (x.status === "pending" || !!x.pending) : x.status !== "pending"; });
      if (!g.length) L.appendChild(h("p", "m", "No games here."));
      g.forEach(function (x) {
        var it = h("div", "it"), d = h("div"); d.appendChild(h("b", "", x.title)); d.appendChild(h("div", "m", (x.studio || "?") + " · " + x.category));
        var wr = h("div"); wr.style.cssText = "display:flex;gap:10px;align-items:center"; if (x.icon) { var im = h("img"); im.src = IC + x.icon; im.width = 44; im.height = 44; im.style.borderRadius = "10px"; wr.appendChild(im); } wr.appendChild(d); it.appendChild(wr); it.appendChild(h("span", "b " + x.status, x.status.toUpperCase() + (x.popular ? " ⭐" : "") + (x.pending ? " 🔄 UPDATE" : "")));
        it.onclick = function () { open(x); }; L.appendChild(it);
      });
    });
  }
  function team(L) {
    var row = h("div", "row"), inp = h("input"); inp.type = "email"; inp.placeholder = "Reviewer email";
    var add = h("button", "", "ADD REVIEWER"), err = h("div", "err"), ul = h("div");
    function draw(s) { ul.innerHTML = ""; (s || []).forEach(function (e) { var r = h("div", "it"); r.appendChild(h("span", "", e)); var x = h("button", "no", "Remove"); x.onclick = function () { api("staff", { email: e, remove: true }).then(function (r) { draw(r.data.staff); }); }; r.appendChild(x); ul.appendChild(r); }); if (!s || !s.length) ul.appendChild(h("p", "m", "No reviewers yet.")); }
    add.onclick = function () { err.textContent = ""; api("staff", { email: inp.value }).then(function (r) { if (!r.ok) err.textContent = r.data.error; else { inp.value = ""; draw(r.data.staff); } }); };
    row.appendChild(inp); row.appendChild(add); L.appendChild(h("h2", "", "Review team")); L.appendChild(row); L.appendChild(err); L.appendChild(ul);
    api("staff").then(function (r) { draw(r.data.staff); });
  }
  /* ---------- Docs demo (leader): files shown when a developer clicks "Demo" in the documentation ---------- */
  var MB = 1048576, MAXSEC = 15;
  var DEMO = [
    { k: "icon", t: "Demo icon", hint: "Square, 512 x 512 px or bigger. PNG, JPG or WebP. Maximum 2 MB.", max: 2 * MB, video: false },
    { k: "banner", t: "Demo popular banner", hint: "1920 x 400 px. PNG, JPG or WebP. Maximum 2 MB.", max: 2 * MB, video: false },
    { k: "thumb", t: "Demo thumbnail (screenshot)", hint: "1280 x 720 px. PNG, JPG or WebP. Maximum 2 MB.", max: 2 * MB, video: false },
    { k: "logo", t: "Demo text logo", hint: "Transparent PNG or WebP. Maximum 2 MB.", max: 2 * MB, video: false },
    { k: "video", t: "Demo gameplay video", hint: "MP4 or WebM. Maximum " + MAXSEC + " seconds and 20 MB.", max: 20 * MB, video: true }
  ];
  function nice(n) { return n >= MB ? (n / MB).toFixed(2) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; }
  function imageOk(f) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(f), im = new Image();
      im.onload = function () { URL.revokeObjectURL(u); res({ w: im.naturalWidth, h: im.naturalHeight }); };
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error("This image can not be read. Try another file.")); };
      im.src = u;
    });
  }
  function videoSeconds(f) {
    return new Promise(function (res, rej) {
      var v = document.createElement("video"), u = URL.createObjectURL(f), done = false;
      function fin(d, e) { if (done) return; done = true; URL.revokeObjectURL(u); e ? rej(e) : res(d); }
      v.preload = "metadata"; v.muted = true;
      v.onloadedmetadata = function () {
        if (v.duration === Infinity || isNaN(v.duration)) { v.ontimeupdate = function () { v.ontimeupdate = null; fin(v.duration); }; v.currentTime = 1e101; }
        else fin(v.duration);
      };
      /* some browsers cannot read an MP4 here: the server then checks the MP4 length itself */
      var soft = f.type === "video/mp4";
      v.onerror = function () { soft ? fin(null) : fin(0, new Error("This video can not be read. Use a WebM file or an MP4 (H.264).")); };
      setTimeout(function () { soft ? fin(null) : fin(0, new Error("Could not read the video length. Try another file.")); }, 12000);
      v.src = u;
    });
  }
  function check(d, f) {
    var ok = d.video ? /^video\/(mp4|webm)$/.test(f.type) : /^image\/(png|jpeg|webp)$/.test(f.type);
    if (!ok) return Promise.reject(new Error(d.video ? "Use an MP4 or WebM video." : "Use a PNG, JPG or WebP image."));
    if (f.size > d.max) return Promise.reject(new Error("This file is " + nice(f.size) + ". The maximum is " + (d.max / MB) + " MB."));
    if (d.video) return videoSeconds(f).then(function (s) { if (s != null && !(s <= MAXSEC + 0.05)) throw new Error("This video is " + s.toFixed(1) + " seconds. The maximum is " + MAXSEC + " seconds."); return { dur: s }; });
    return imageOk(f).then(function () { return {}; });
  }
  function send(d, f, extra) {
    return A.getSession().then(function (s) {
      if (!s) throw new Error("Please sign in again.");
      var hd = { "Authorization": "Bearer " + s.access_token, "Content-Type": f.type };
      if (extra && extra.dur) hd["X-Duration"] = String(extra.dur);
      return fetch("/api/admin/demo?kind=" + d.k, { method: "PUT", headers: hd, body: f });
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || "Upload failed."); return j.item; }); });
  }
  function demoCard(d, it) {
    var c = h("div", "dc"), pv = h("div", "dp"), msg = h("div", "err"), inp = h("input"), row = h("div", "row");
    inp.type = "file"; inp.accept = d.video ? "video/mp4,video/webm" : "image/png,image/jpeg,image/webp";
    var up = h("button", "", "UPLOAD / REPLACE"), rm = h("button", "no", "REMOVE");
    function paint(item) {
      pv.innerHTML = ""; rm.hidden = !item;
      if (!item) { pv.appendChild(h("p", "m", "Nothing added yet.")); return; }
      var e;
      if (d.video) { e = h("video"); e.controls = true; e.muted = true; e.preload = "metadata"; e.setAttribute("playsinline", ""); e.src = item.url; }
      else { e = h("img"); e.alt = d.t; e.src = item.url; }
      pv.appendChild(e);
      pv.appendChild(h("p", "m", nice(item.size || 0) + (item.dur ? " · " + item.dur.toFixed(1) + " s" : "") + " · added " + new Date(item.at).toLocaleString("en-IN")));
    }
    function say(t, good) { msg.textContent = t || ""; msg.className = good ? "ok2" : "err"; }
    up.onclick = function () {
      say(""); var f = inp.files && inp.files[0];
      if (!f) { say("Choose a file first."); return; }
      up.disabled = true; up.textContent = "CHECKING...";
      check(d, f).then(function (extra) { up.textContent = "UPLOADING..."; return send(d, f, extra); })
        .then(function (item) { paint(item); inp.value = ""; say("Saved. The demo is live in the documentation.", true); })
        .catch(function (e) { say(e.message || "Upload failed."); })
        .then(function () { up.disabled = false; up.textContent = "UPLOAD / REPLACE"; });
    };
    rm.onclick = function () {
      if (!confirm("Remove the " + d.t.toLowerCase() + "?")) return;
      say(""); rm.disabled = true;
      api("demo?kind=" + d.k, null, "DELETE").then(function (r) { if (!r.ok) say(r.data.error || "Could not remove."); else { paint(null); say("Removed.", true); } rm.disabled = false; });
    };
    c.appendChild(h("h3", "", d.t)); c.appendChild(h("p", "m", d.hint)); c.appendChild(pv); c.appendChild(inp);
    row.appendChild(up); row.appendChild(rm); c.appendChild(row); c.appendChild(msg); paint(it); return c;
  }
  function demoTab(L) {
    L.appendChild(h("h2", "", "Documentation demo"));
    L.appendChild(h("p", "m", "These files are shown when a developer presses Demo in the documentation (icon, banner, screenshot, text logo and video). Add, replace or remove them here. Changes show on the documentation page within a minute."));
    var wrap = h("div", "dg"); L.appendChild(wrap); wrap.appendChild(h("p", "m", "Loading..."));
    api("demo").then(function (r) {
      wrap.innerHTML = "";
      if (!r.ok) { wrap.appendChild(h("p", "err", r.data.error || "Could not load the demos.")); return; }
      var items = r.data.items || {};
      DEMO.forEach(function (d) { wrap.appendChild(demoCard(d, items[d.k])); });
    });
  }
  function open(x) {
    var D = $("det"); D.hidden = false; D.innerHTML = ""; D.scrollIntoView({ behavior: "smooth" });
    if (x.icon) { var bi = h("img"); bi.src = IC + x.icon; bi.width = 96; bi.height = 96; bi.style.borderRadius = "18px"; D.appendChild(bi); }
    if (x.banner) { var bn = h("img"); bn.src = IC + x.banner; bn.style.cssText = "width:100%;max-width:600px;border-radius:12px;display:block;margin:8px 0"; D.appendChild(bn); }
    D.appendChild(h("h2", "", x.title)); D.appendChild(h("p", "m", (x.studio || "?") + " · " + x.category + " · " + x.status.toUpperCase() + " · " + (x.device === "desktop" ? "🖥 DESKTOP ONLY" : "📱 MOBILE + PC")));
    D.appendChild(h("p", "", x.description));
    if (x.pending) D.appendChild(h("p", "err", "🔄 A new version is waiting for review."));
    var pr = h("div", "row"), pb = h("button", "", "▶ PLAY"), pc = h("button", "g", "📱 Phone view"), fs = h("button", "g", "⛶ Fullscreen"), pe = h("div", "err"), box = h("div");
    pr.appendChild(pb); pr.appendChild(pc); pr.appendChild(fs); if (x.pending) { var pn = h("button", "ok", "▶ PLAY NEW VERSION"); pn.onclick = function () { runPlay(true); }; pr.appendChild(pn); }
    if (x.device === "desktop") pc.hidden = true; D.appendChild(pr); D.appendChild(pe); D.appendChild(box);
    var fr = null;
    var runPlay = function (nv) {
      pe.textContent = "";
      if (x.device === "desktop" && MOB) { box.innerHTML = ""; pe.textContent = "🚫 This game is not for mobile. It can only be played on a desktop (PC). Please review it on a PC."; return; } api("play?owner=" + x.owner + "&id=" + x.id + (nv ? "&v=new" : "")).then(function (r) {
        if (!r.ok) { pe.textContent = r.data.error || "Could not open."; return; }
        box.innerHTML = ""; fr = h("iframe", "fr"); fr.setAttribute("sandbox", "allow-scripts allow-popups allow-pointer-lock");
        fr.setAttribute("allow", "fullscreen; autoplay; gamepad"); fr.setAttribute("allowfullscreen", ""); fr.src = r.data.url; box.appendChild(fr);
      });
    };
    pb.onclick = function () { runPlay(false); };
    pc.onclick = function () { if (fr) { fr.classList.toggle("ph"); pc.textContent = fr.classList.contains("ph") ? "🖥 Desktop view" : "📱 Phone view"; } };
    fs.onclick = function () { if (fr && fr.requestFullscreen) fr.requestFullscreen(); };

    var rv = h("div"); D.appendChild(h("h3", "", "Reviews")); D.appendChild(rv);
    var ta = h("textarea"); ta.rows = 3; ta.placeholder = "Write your review (gameplay, bugs, mobile, content...)";
    var sel = h("select"); [["", "Recommendation..."], ["approve", "👍 Approve"], ["changes", "✏️ Needs changes"], ["reject", "👎 Reject"]].forEach(function (o) { var p = h("option", "", o[1]); p.value = o[0]; sel.appendChild(p); });
    var sb = h("button", "", "SUBMIT MY REVIEW"), se = h("div", "err");
    function loadRv() {
      api("game?owner=" + x.owner + "&id=" + x.id).then(function (r) {
        rv.innerHTML = ""; (r.data.reviews || []).forEach(function (v) {
          var d = h("div", "rv"); d.appendChild(h("b", "", v.by + " — " + ({ approve: "👍 Approve", changes: "✏️ Needs changes", reject: "👎 Reject" }[v.rec] || ""))); d.appendChild(h("div", "", v.text)); rv.appendChild(d);
          if (v.by === email && !ta.value) { ta.value = v.text; sel.value = v.rec; }
        });
        if (!(r.data.reviews || []).length) rv.appendChild(h("p", "m", "No reviews yet."));
      });
    }
    sb.onclick = function () { se.textContent = ""; api("review", { owner: x.owner, id: x.id, text: ta.value, rec: sel.value }).then(function (r) { if (!r.ok) se.textContent = r.data.error; else { se.textContent = "Saved ✓"; loadRv(); } }); };
    D.appendChild(ta); var rr = h("div", "row"); rr.appendChild(sel); rr.appendChild(sb); D.appendChild(rr); D.appendChild(se); loadRv();

    if (role === "leader") {
      D.appendChild(h("h3", "", "Leader decision")); var nt = h("input"); nt.type = "text"; nt.placeholder = "Note for the developer (shown on their dashboard)"; nt.maxLength = 500; D.appendChild(nt);
      var dr = h("div", "row"), de = h("div", "err");
      liveBtns(x).forEach(function (k) {
        var b = h("button", k[1], k[2]); b.onclick = function () { api("decide", { owner: x.owner, id: x.id, decision: k[0], note: nt.value }).then(function (r) { if (!r.ok) de.textContent = r.data.error; else { D.hidden = true; load(); } }); }; dr.appendChild(b);
      });
      if (x.pending) { [["approve", "ok", "✔ APPROVE UPDATE"], ["reject", "no", "✖ REJECT UPDATE"]].forEach(function (k) { var ub = h("button", k[1], k[2]); ub.onclick = function () { api("update", { owner: x.owner, id: x.id, decision: k[0], note: nt.value }).then(function (r) { if (!r.ok) de.textContent = r.data.error; else { D.hidden = true; load(); } }); }; dr.appendChild(ub); }); }
      if (x.status === "live") { var pp = h("button", "g", x.popular ? "✩ Remove from popular" : "⭐ Mark as popular"); pp.onclick = function () { api("popular", { owner: x.owner, id: x.id, popular: !x.popular }).then(function (r) { if (!r.ok) de.textContent = r.data.error; else { D.hidden = true; load(); } }); }; dr.appendChild(pp); }
      D.appendChild(dr); D.appendChild(de);
      D.appendChild(h("h3", "", "Message to developer"));
      (x.msgs || []).forEach(function (m) { D.appendChild(h("div", "m", "🔔 " + new Date(m.at).toLocaleDateString("en-IN") + ": " + m.text)); });
      var mi = h("input"); mi.type = "text"; mi.maxLength = 500; mi.placeholder = "Write a message (shown to the developer on their dashboard)"; D.appendChild(mi);
      var mr = h("div", "row"), mb = h("button", "", "SEND MESSAGE"), me = h("div", "err");
      mb.onclick = function () { api("message", { owner: x.owner, id: x.id, text: mi.value }).then(function (r) { if (!r.ok) me.textContent = r.data.error; else { D.hidden = true; load(); } }); };
      mr.appendChild(mb); D.appendChild(mr); D.appendChild(me);
    }
  }
  A.hasSession() ? init() : view("login");
})();
