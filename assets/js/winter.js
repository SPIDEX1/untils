/* UNTILS WINTER UPDATE: opening animation, snowfall, frozen decorations and click sparkles.
   Loaded only while winter is ON (the leader controls it in the admin portal). Never runs in the admin portal. */
(function () {
  var W = window.__WINTER; if (!W || /^\/admin(\/|$)/.test(location.pathname)) return;
  var D = document, R = D.documentElement, body = D.body;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function flakeSVG(s, c) {
    var a = ""; for (var i = 0; i < 3; i++) a += '<g transform="rotate(' + i * 60 + ' 50 50)"><line x1="50" y1="8" x2="50" y2="92"/><path d="M50 22L40 12M50 22L60 12M50 78L40 88M50 78L60 88M50 38L42 30M50 38L58 30M50 62L42 70M50 62L58 70"/></g>';
    return '<svg viewBox="0 0 100 100" width="' + s + '" height="' + s + '" fill="none" stroke="' + c + '" stroke-width="4" stroke-linecap="round">' + a + "</svg>";
  }

  /* ---------- game-aware: no snow over a game that is full screen, nor over the game window ---------- */
  var ex = null, fsCheck = 0;
  function watch() {
    var fs = !!(D.fullscreenElement || D.webkitFullscreenElement || D.querySelector(".stage.fs,.stage.pfs"));
    R.classList.toggle("w-fs", fs);
    var f = D.querySelector("iframe"), r = f && f.getBoundingClientRect();
    ex = r && r.width > 40 && r.height > 40 && r.bottom > 0 && r.top < innerHeight ? { l: r.left, t: r.top, r: r.right, b: r.bottom } : null;
  }
  var inEx = function (x, y) { return ex && x > ex.l && x < ex.r && y > ex.t && y < ex.b; };

  /* ---------- frozen decorations ---------- */
  function freeze() {
    if (!W.f) return;
    var fr = D.createElement("div"); fr.id = "w-frost"; fr.setAttribute("aria-hidden", "true"); body.appendChild(fr);
    var ft = D.querySelector("footer.sf, footer");
    if (ft) {
      var ic = D.createElement("div"); ic.className = "w-icicles"; ic.setAttribute("aria-hidden", "true"); ft.parentNode.insertBefore(ic, ft);
      var bk = D.createElement("div"); bk.className = "w-bank"; bk.setAttribute("aria-hidden", "true"); ft.parentNode.insertBefore(bk, ft.nextSibling);
    }
  }

  /* ---------- snow + click sparkles ---------- */
  function snow() {
    if (reduce || (!W.s && !W.c)) return;
    var cv = D.createElement("canvas"); cv.id = "w-cv"; cv.setAttribute("aria-hidden", "true"); body.appendChild(cv);
    var ctx = cv.getContext("2d"), DPR = Math.min(window.devicePixelRatio || 1, 2), w = 0, h = 0, flakes = [], bursts = [], rings = [], t0 = 0, slow = 0, wanted = 0;
    var AM = { low: 55, medium: 110, high: 190 }[W.a] || 110;
    function target() { var f = Math.max(.55, Math.min(1.3, (w * h) / (1440 * 800))); return Math.round(AM * f * (w < 700 ? .6 : 1) * ((navigator.hardwareConcurrency || 4) <= 2 ? .6 : 1)); }
    function mk(top) {
      var big = Math.random() < .2, r = big ? 2.6 + Math.random() * 2.4 : .9 + Math.random() * 1.7;
      return { x: Math.random() * w, y: top ? -10 - Math.random() * 40 : Math.random() * h, r: r, vy: .35 + r * .22 + Math.random() * .5, sw: .6 + Math.random() * 1.4, ph: Math.random() * 6.28, o: .55 + Math.random() * .4, c: big && r > 3.4 };
    }
    function size() {
      w = innerWidth; h = innerHeight; cv.width = w * DPR; cv.height = h * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      wanted = W.s ? target() : 0; while (flakes.length < wanted) flakes.push(mk(false)); flakes.length = Math.min(flakes.length, wanted);
    }
    size(); addEventListener("resize", size);
    function crystal(x, y, r, a) {
      ctx.strokeStyle = "rgba(255,255,255," + a + ")"; ctx.lineWidth = 1; ctx.beginPath();
      for (var i = 0; i < 3; i++) { var an = i * Math.PI / 3, dx = Math.cos(an) * r * 1.9, dy = Math.sin(an) * r * 1.9; ctx.moveTo(x - dx, y - dy); ctx.lineTo(x + dx, y + dy); }
      ctx.stroke();
    }
    function burst(x, y) {
      if (inEx(x, y) || R.classList.contains("w-fs")) return;
      rings.push({ x: x, y: y, a: 0 });
      for (var i = 0; i < 16; i++) { var an = Math.random() * 6.28, sp = 1.4 + Math.random() * 3.8; bursts.push({ x: x, y: y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - .8, s: 2 + Math.random() * 3.2, a: 0, rot: Math.random() * 3, vr: (Math.random() - .5) * .3, crystal: i < 4 }); }
    }
    if (W.c) addEventListener("pointerdown", function (e) { if (e.isPrimary !== false) burst(e.clientX, e.clientY); }, { passive: true, capture: true });
    function frame(ts) {
      if (D.hidden) { t0 = 0; return; }
      var dt = t0 ? Math.min(ts - t0, 50) / 16.67 : 1; if (t0 && ts - t0 > 34) slow++; else if (slow > 0) slow -= .25; t0 = ts;
      if (slow > 90 && flakes.length > 25) { flakes.length = Math.round(flakes.length * .7); slow = 0; } /* weak phone: fewer flakes */
      ctx.clearRect(0, 0, w, h);
      if (!R.classList.contains("w-fs")) {
        var wind = Math.sin(ts * .0003) * .45;
        for (var i = 0; i < flakes.length; i++) {
          var f = flakes[i]; f.y += f.vy * dt; f.x += (Math.sin(f.ph + ts * .001 * f.sw) * .5 + wind) * dt;
          if (f.y > h + 12) { flakes[i] = mk(true); continue; } if (f.x < -12) f.x = w + 12; else if (f.x > w + 12) f.x = -12;
          if (inEx(f.x, f.y)) continue;
          if (f.c) crystal(f.x, f.y, f.r, f.o); else { ctx.fillStyle = "rgba(255,255,255," + f.o + ")"; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill(); if (f.r > 2.4) { ctx.fillStyle = "rgba(210,240,255," + f.o * .25 + ")"; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 1.9, 0, 6.283); ctx.fill(); } }
        }
        for (var k = rings.length - 1; k >= 0; k--) { var g = rings[k]; g.a += .035 * dt; if (g.a >= 1) { rings.splice(k, 1); continue; } ctx.strokeStyle = "rgba(190,235,255," + (1 - g.a) * .9 + ")"; ctx.lineWidth = 3 * (1 - g.a) + .5; ctx.beginPath(); ctx.arc(g.x, g.y, 6 + g.a * 46, 0, 6.283); ctx.stroke(); }
        for (var j = bursts.length - 1; j >= 0; j--) {
          var p = bursts[j]; p.a += .022 * dt; if (p.a >= 1) { bursts.splice(j, 1); continue; }
          p.x += p.vx * dt; p.y += p.vy * dt; p.vy += .09 * dt; p.vx *= .985; p.rot += p.vr * dt;
          var al = 1 - p.a; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          if (p.crystal) { ctx.strokeStyle = "rgba(255,255,255," + al + ")"; ctx.lineWidth = 1.4; ctx.beginPath(); for (var q = 0; q < 3; q++) { var an2 = q * Math.PI / 3; ctx.moveTo(-Math.cos(an2) * p.s * 2.6, -Math.sin(an2) * p.s * 2.6); ctx.lineTo(Math.cos(an2) * p.s * 2.6, Math.sin(an2) * p.s * 2.6); } ctx.stroke(); }
          else { ctx.fillStyle = (j % 2 ? "rgba(255,255,255," : "rgba(160,222,255,") + al + ")"; ctx.beginPath(); ctx.moveTo(0, -p.s * 1.6); ctx.lineTo(p.s, 0); ctx.lineTo(0, p.s * 1.6); ctx.lineTo(-p.s, 0); ctx.closePath(); ctx.fill(); }
          ctx.restore();
        }
      }
      requestAnimationFrame(frame);
    }
    D.addEventListener("visibilitychange", function () { if (!D.hidden) requestAnimationFrame(frame); });
    requestAnimationFrame(frame);
  }

  /* ---------- opening animation (once per visit; open any page with ?winterintro to see it again) ---------- */
  function intro() {
    var seen = 0; try { seen = sessionStorage.getItem("wi1"); } catch (e) {}
    var force = /[?&]winterintro/.test(location.search);
    if (!W.i || reduce || (seen && !force)) { R.classList.remove("w-pre"); return; }
    try { sessionStorage.setItem("wi1", "1"); } catch (e) {}
    var o = D.createElement("div"); o.id = "w-intro"; o.setAttribute("role", "presentation");
    o.innerHTML = '<div class="wi-frost"></div><div class="wi-box"><span class="wi-sf a">' + flakeSVG(34, "#7cc8ff") + '</span><span class="wi-sf b">' + flakeSVG(28, "#7cc8ff") + '</span>' +
      '<img class="wi-logo" src="/assets/img/untils-logo.png?v=2" alt="UNTILS" width="206" height="50"><div class="wi-t">WINTER UPDATE</div><div class="wi-s">Cool games for a cold season</div></div><button type="button" class="wi-skip">Skip</button>';
    var prev = body.style.overflow; body.style.overflow = "hidden"; body.appendChild(o); R.classList.remove("w-pre");
    var done = false;
    function end() { if (done) return; done = true; o.classList.add("out"); body.style.overflow = prev; setTimeout(function () { o.remove(); }, 1000); }
    o.addEventListener("click", end); setTimeout(end, 3600);
  }

  watch(); fsCheck = setInterval(watch, 400); addEventListener("scroll", watch, { passive: true }); addEventListener("resize", watch);
  try { freeze(); snow(); intro(); } catch (e) { R.classList.remove("w-pre"); }
})();
