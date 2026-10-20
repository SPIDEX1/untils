(function () {
  "use strict";
  var IC = "https://fjfkwfklglovuxeecxsg.supabase.co" + "/storage/v1/object/public/game-icons/";
  function liveBtns(x) { var b = [["approved", "ok", "✔ APPROVE"], ["rejected", "no", "✖ REJECT"], ["pending", "g", "Back to pending"]]; if (x.status === "approved") b.unshift(["live", "ok", "🚀 GO LIVE"]); if (x.status === "live") b.unshift(["approved", "g", "⏸ Take offline"]); return b; }
  var MOB = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 820);
  var A = window.UntilsAuth, $ = function (i) { return document.getElementById(i); }, role = null, tab = "pending", email = "";
  function h(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function api(a, body) {
    return A.getSession().then(function (s) {
      if (!s) { view("login"); return { ok: false, data: {} }; }
      return fetch("/api/admin/" + a, { method: body ? "POST" : "GET", headers: { "Authorization": "Bearer " + s.access_token, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined })
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
      $("tt").hidden = role !== "leader"; view("app"); load();
    });
  }
  $("send").onclick = function () { $("le").textContent = ""; A.sendCode("signup", $("em").value.trim().toLowerCase(), "").then(function (r) { if (!r.ok) $("le").textContent = r.message; else { $("s1").hidden = true; $("s2").hidden = false; } }); };
  $("ver").onclick = function () { A.verifyCode($("em").value.trim().toLowerCase(), $("cd").value.trim()).then(function (r) { if (!r.ok) $("le").textContent = r.message; else init(); }); };
  $("out").onclick = function () { A.logout().then(function () { location.reload(); }); };
  document.querySelectorAll("[data-t]").forEach(function (b) { b.onclick = function () { tab = b.getAttribute("data-t"); $("det").hidden = true; load(); }; });

  function load() {
    var L = $("list"); L.innerHTML = "";
    if (tab === "team") return team(L);
    api("games").then(function (r) {
      var g = (r.data.games || []).filter(function (x) { return tab === "pending" ? x.status === "pending" : x.status !== "pending"; });
      if (!g.length) L.appendChild(h("p", "m", "No games here."));
      g.forEach(function (x) {
        var it = h("div", "it"), d = h("div"); d.appendChild(h("b", "", x.title)); d.appendChild(h("div", "m", (x.studio || "?") + " · " + x.category));
        var wr = h("div"); wr.style.cssText = "display:flex;gap:10px;align-items:center"; if (x.icon) { var im = h("img"); im.src = IC + x.icon; im.width = 44; im.height = 44; im.style.borderRadius = "10px"; wr.appendChild(im); } wr.appendChild(d); it.appendChild(wr); it.appendChild(h("span", "b " + x.status, x.status.toUpperCase() + (x.popular ? " ⭐" : "")));
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
  function open(x) {
    var D = $("det"); D.hidden = false; D.innerHTML = ""; D.scrollIntoView({ behavior: "smooth" });
    if (x.icon) { var bi = h("img"); bi.src = IC + x.icon; bi.width = 96; bi.height = 96; bi.style.borderRadius = "18px"; D.appendChild(bi); }
    if (x.banner) { var bn = h("img"); bn.src = IC + x.banner; bn.style.cssText = "width:100%;max-width:600px;border-radius:12px;display:block;margin:8px 0"; D.appendChild(bn); }
    D.appendChild(h("h2", "", x.title)); D.appendChild(h("p", "m", (x.studio || "?") + " · " + x.category + " · " + x.status.toUpperCase() + " · " + (x.device === "desktop" ? "🖥 DESKTOP ONLY" : "📱 MOBILE + PC")));
    D.appendChild(h("p", "", x.description));
    var pr = h("div", "row"), pb = h("button", "", "▶ PLAY"), pc = h("button", "g", "📱 Phone view"), fs = h("button", "g", "⛶ Fullscreen"), pe = h("div", "err"), box = h("div");
    pr.appendChild(pb); pr.appendChild(pc); pr.appendChild(fs); if (x.device === "desktop") pc.hidden = true; D.appendChild(pr); D.appendChild(pe); D.appendChild(box);
    var fr = null;
    pb.onclick = function () {
      pe.textContent = "";
      if (x.device === "desktop" && MOB) { box.innerHTML = ""; pe.textContent = "🚫 This game is not for mobile. It can only be played on a desktop (PC). Please review it on a PC."; return; } api("play?owner=" + x.owner + "&id=" + x.id).then(function (r) {
        if (!r.ok) { pe.textContent = r.data.error || "Could not open."; return; }
        box.innerHTML = ""; fr = h("iframe", "fr"); fr.setAttribute("sandbox", "allow-scripts allow-popups allow-pointer-lock");
        fr.setAttribute("allow", "fullscreen; autoplay; gamepad"); fr.setAttribute("allowfullscreen", ""); fr.src = r.data.url; box.appendChild(fr);
      });
    };
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
      if (x.status === "live") { var pp = h("button", "g", x.popular ? "✩ Remove from popular" : "⭐ Mark as popular"); pp.onclick = function () { api("popular", { owner: x.owner, id: x.id, popular: !x.popular }).then(function (r) { if (!r.ok) de.textContent = r.data.error; else { D.hidden = true; load(); } }); }; dr.appendChild(pp); }
      D.appendChild(dr); D.appendChild(de);
    }
  }
  A.hasSession() ? init() : view("login");
})();
