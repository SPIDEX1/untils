/* 404 page: "Play a surprise game" opens a random live game. */
(function () {
  "use strict";
  var b = document.getElementById("nfSurprise"); if (!b) return;
  var m = document.getElementById("nfMsg"), list = null, busy = false;
  var label = b.querySelector("span");
  function slug(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
  var touch = false; try { touch = window.matchMedia("(pointer:coarse)").matches; } catch (e) {}
  function load() {
    if (list) return Promise.resolve(list);
    return fetch("/api/live", { cache: "no-store" }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
      list = (d.games || []).filter(function (g) { return g && slug(g.title) && !(touch && g.device === "desktop"); });   /* phones are not given PC-only games */
      return list;
    });
  }
  function fail() { busy = false; b.disabled = false; b.classList.remove("rolling"); label.textContent = "PLAY A SURPRISE GAME"; m.textContent = "Could not find a game right now. Please check your internet and try again."; }
  b.addEventListener("click", function () {
    if (busy) return; busy = true; b.disabled = true; b.classList.add("rolling"); m.textContent = "Picking a game for you…";
    load().then(function (l) {
      if (!l.length) throw 0;
      var g = l[Math.floor(Math.random() * l.length)];
      label.textContent = "LET'S GO!"; m.textContent = "Your surprise: " + g.title;
      setTimeout(function () { location.href = "/games/" + slug(g.title) + "/"; }, 700);
    }).catch(fail);
  });
})();
