/* UNTILS Inspector page */
(function () {
  "use strict";
  var A = window.UntilsAuth, $ = function (id) { return document.getElementById(id); };
  var q = new URLSearchParams(location.search), id = q.get("id") || "", ver = parseInt(q.get("ver"), 10) || 0, which = ver ? "ver" : q.get("v") === "new" ? "new" : "cur", suffix = ver ? " (version " + ver + ")" : which === "new" ? " (new version)" : "";
  var ctl = null, tok = "", reported = false, warnT = 0, session = null;

  function toLogin() { location.replace("/developers/#signin"); }
  $("dvOut").addEventListener("click", function () { this.disabled = true; A.logout().then(function () { location.href = "/developers/"; }); });

  function time(ms) { var s = ms / 1000; return ("0" + Math.floor(s / 60)).slice(-2) + ":" + ("0" + (s % 60).toFixed(1)).slice(-4); }
  function add(e) {
    var L = $("insLog"), d = document.createElement("div"), t = document.createElement("span");
    d.className = "k-" + e.kind; t.className = "t"; t.textContent = "[" + time(e.t) + "]";
    d.appendChild(t); d.appendChild(document.createTextNode(e.text));
    L.appendChild(d); L.scrollTop = L.scrollHeight;
  }
  function chip(txt, on, bad) { var c = document.createElement("span"); c.className = "ins-chip" + (on ? " on" : "") + (bad ? " bad" : ""); if (window.UI) UI.set(c, on ? "check-circle" : bad ? "x-circle" : "", txt); else c.textContent = txt; return c; }
  function chips(st) {
    var C = $("insChips"); C.innerHTML = "";
    C.appendChild(chip("SDK init", st.init)); C.appendChild(chip("Loading start", st.loadingStart)); C.appendChild(chip("Loading finished", st.loadingFinished));
    C.appendChild(chip("Gameplay start", st.gameplayStart)); C.appendChild(chip("Gameplay stop", st.gameplayStop));
    C.appendChild(chip("Save", st.saves > 0 || st.ls > 0)); C.appendChild(chip("Track", st.tracks > 0));
    if (st.unityName) C.appendChild(chip(st.unityName + " " + st.unityVersion, true));
    if (st.errors) C.appendChild(chip(st.errors + " error(s)", false, true));
    var det = st.init && (st.via !== "unity-template" || st.unityName);
    if (det && !reported && !ver) {
      reported = true;
      fetch("/api/games", { method: "PUT", headers: { "Authorization": "Bearer " + session.access_token, "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, sdk: { ok: true, name: st.unityName || st.sdk, version: st.unityName ? st.unityVersion : st.version, which: which } }) }).catch(function () {});
    }
  }
  function run() {
    $("insBox").innerHTML = ""; reported = false; clearTimeout(warnT);
    ctl = UntilsInspect.start({ id: id, url: "/play/" + tok + "/index.html", container: $("insBox"), onEvent: add, onState: chips });
    chips(ctl.state);
    warnT = setTimeout(function () {
      if (ctl && !ctl.state.init) add({ t: 15000, kind: "warn", text: "No Untils.init() call after 15 seconds. If your game does not use the SDK, this is fine. Otherwise check the docs." });
      else if (ctl && ctl.state.init && ctl.state.via === "unity-template" && !ctl.state.unityName) add({ t: 15000, kind: "warn", text: "Unity template is running, but your game has not called Untils.Init() yet." });
    }, 15000);
  }

  $("insDesk").onclick = function () { $("insBox").classList.remove("ph"); $("insDesk").classList.add("on"); $("insPhone").classList.remove("on"); };
  $("insPhone").onclick = function () { $("insBox").classList.add("ph"); $("insPhone").classList.add("on"); $("insDesk").classList.remove("on"); };
  $("insFs").onclick = function () { var f = ctl && ctl.frame; if (f && f.requestFullscreen) f.requestFullscreen(); };
  $("insRe").onclick = function () { if (ctl) ctl.stop(); run(); };
  $("insClear").onclick = function () { $("insLog").innerHTML = ""; };
  $("insCopy").onclick = function () {
    var txt = [].map.call($("insLog").children, function (d) { return d.textContent; }).join("\n");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { UI.set($("insCopy"), "check", "Copied"); setTimeout(function () { $("insCopy").textContent = "Copy"; }, 1500); });
    else prompt("Copy the log:", txt);
  };

  A.getSession().then(function (s) {
    if (!s) return toLogin();
    session = s;
    var H = { "Authorization": "Bearer " + s.access_token };
    fetch("/api/games?preview=" + encodeURIComponent(id) + (ver ? "&ver=" + ver : which === "new" ? "&v=new" : ""), { headers: H })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (r) {
        $("ins").hidden = false;
        if (!r.ok || !r.d.token) { $("insTitle").textContent = "Could not open the Inspector"; add({ t: 0, kind: "err", text: r.d.error || "Game not found." }); return; }
        tok = r.d.token;
        $("insTitle").textContent = "Inspector view" + suffix;
        fetch("/api/games", { headers: H }).then(function (x) { return x.json(); }).then(function (d) {
          (d.games || []).forEach(function (g) { if (g.id === id) $("insTitle").textContent = g.title + suffix; });
        }).catch(function () {});
        run();
      }).catch(function () { $("ins").hidden = false; add({ t: 0, kind: "err", text: "No internet connection." }); });
  });
})();
