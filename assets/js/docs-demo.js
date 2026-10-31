/* Documentation page: the "Demo" buttons open a panel with the demo icon, banner, screenshot, text logo or video.
   The files are added by the UNTILS leader in the review portal (Docs demo). */
(function () {
  "use strict";
  var META = {
    icon: { title: "Icon demo", spec: "Square, minimum 512 x 512 px (1024 x 1024 recommended). PNG, JPG or WebP, under 2 MB. UNTILS rounds the corners a little itself, so do not round them." },
    banner: { title: "Popular banner demo", spec: "1920 x 400 px. PNG, JPG or WebP, under 2 MB. Keep the art in the centre 1000 x 190 px and the left side calm." },
    thumb: { title: "Thumbnail demo", spec: "Landscape, 1280 x 720 px. PNG, JPG or WebP, under 2 MB. Game name as a text logo slightly above the centre, only the core of your game in the middle. No other UI and no other text." },
    shots: { title: "Screenshots demo", spec: "Up to 5 real screenshots from your running game, with all the UI, text and buttons. 1280 x 720 px (landscape) or 720 x 1280 px (portrait). PNG, JPG or WebP, under 2 MB each. No edited images." },
    logo: { title: "Text logo demo", spec: "Your game name as a logo with a transparent background. PNG or WebP, under 1 MB." },
    video: { title: "Gameplay video demo", spec: "Real gameplay, maximum 15 seconds. MP4 or WebM, 1280 x 720 or 720 x 1280. No UI at all: no text, no buttons, no controls. Only the core of the game: the main characters and the action." }
  };
  var data = null, loading = null, box, ttl, body, shade, opener = null;
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function load() {
    if (!loading) loading = fetch("/api/demo").then(function (r) { return r.json(); }).then(function (d) { data = d.items || {}; }).catch(function () { data = {}; });
    return loading;
  }
  function build() {
    if (shade) return;
    shade = el("div", "dm"); shade.hidden = true; shade.setAttribute("role", "dialog"); shade.setAttribute("aria-modal", "true");
    box = el("div", "dm-box");
    var h = el("div", "dm-h"); ttl = el("h3", "", "");
    var x = el("button", "dm-x"); x.type = "button"; x.setAttribute("aria-label", "Close"); x.title = "Close";
    if (window.UI) x.appendChild(UI.ico("x")); else x.textContent = "x";
    x.onclick = close; h.appendChild(ttl); h.appendChild(x);
    body = el("div", "dm-body");
    var f = el("div", "dm-f"), cb = el("button", "dm-close", "Close"); cb.type = "button"; cb.onclick = close; f.appendChild(cb);
    box.appendChild(h); box.appendChild(body); box.appendChild(f); shade.appendChild(box); document.body.appendChild(shade);
    shade.addEventListener("click", function (e) { if (e.target === shade) close(); });
    document.addEventListener("keydown", function (e) { if (shade.hidden) return; if (e.key === "Escape") close(); else if (galleryKey) galleryKey(e); });
  }
  function stop() { var v = body && body.querySelector("video"); if (v) { try { v.pause(); } catch (e) {} v.removeAttribute("src"); v.load(); } }
  function close() { if (!shade || shade.hidden) return; galleryKey = null; stop(); body.innerHTML = ""; shade.hidden = true; document.documentElement.style.overflow = ""; if (opener) { try { opener.focus(); } catch (e) {} } }
  function render(kind) {
    var m = META[kind], it = data && data[kind]; body.innerHTML = "";
    var media = el("div", "dm-media");
    if (kind === "shots") {
      var list = (it && it.list) || [];
      if (!list.length) media.appendChild(el("p", "dm-none", "No demo has been added yet. Please check again soon."));
      else gallery(media, list);
    } else if (!it) {
      media.appendChild(el("p", "dm-none", "No demo has been added yet. Please check again soon."));
    } else if (kind === "video") {
      var v = document.createElement("video"); v.controls = true; v.autoplay = true; v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "auto"; v.src = it.url;
      v.onerror = function () { media.innerHTML = ""; media.appendChild(el("p", "dm-none", "The video could not be played.")); };
      media.appendChild(v);
    } else {
      var im = document.createElement("img"); im.alt = m.title; im.src = it.url; if (kind === "icon") im.className = "sq"; if (kind === "logo") media.className += " dm-chk";
      im.onerror = function () { media.innerHTML = ""; media.appendChild(el("p", "dm-none", "The image could not be loaded.")); };
      media.appendChild(im);
    }
    body.appendChild(media); body.appendChild(el("p", "dm-spec", m.spec));
  }
  function gallery(media, list) {
    var i = 0, im = document.createElement("img"), cnt = el("div", "dm-cnt"), dots = el("div", "dm-dots");
    media.className += " dm-gal";
    function icoBtn(cls, name, label) { var b = el("button", "dm-nav " + cls); b.type = "button"; b.setAttribute("aria-label", label); if (window.UI) b.appendChild(UI.ico(name)); else b.textContent = name === "left" ? "<" : ">"; return b; }
    var prev = icoBtn("dm-prev", "left", "Previous screenshot"), next = icoBtn("dm-next", "right", "Next screenshot");
    function show(n) {
      i = (n + list.length) % list.length; im.src = list[i].url; im.alt = "Screenshot " + (i + 1);
      cnt.textContent = "Screenshot " + (i + 1) + " of " + list.length;
      [].forEach.call(dots.children, function (d, k) { d.className = "dm-dot" + (k === i ? " on" : ""); });
    }
    list.forEach(function (x, k) { var d = el("button", "dm-dot"); d.type = "button"; d.setAttribute("aria-label", "Screenshot " + (k + 1)); d.onclick = function () { show(k); }; dots.appendChild(d); });
    prev.onclick = function () { show(i - 1); }; next.onclick = function () { show(i + 1); };
    im.onerror = function () { cnt.textContent = "This screenshot could not be loaded."; };
    var x0 = null; media.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    media.addEventListener("touchend", function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); });
    media._key = function (e) { if (e.key === "ArrowLeft") show(i - 1); else if (e.key === "ArrowRight") show(i + 1); };
    var wrap = el("div", "dm-gw"); wrap.appendChild(im);
    if (list.length > 1) { wrap.appendChild(prev); wrap.appendChild(next); }
    media.appendChild(wrap); media.appendChild(cnt); if (list.length > 1) media.appendChild(dots);
    show(0); galleryKey = media._key;
  }
  var galleryKey = null;
  function open(kind, btn) {
    if (!META[kind]) return;
    build(); opener = btn || null; ttl.textContent = m(kind); body.innerHTML = ""; body.appendChild(el("p", "dm-none", "Loading...")); shade.hidden = false; document.documentElement.style.overflow = "hidden";
    shade.querySelector(".dm-x").focus();
    load().then(function () { if (!shade.hidden && ttl.textContent === m(kind)) render(kind); });
  }
  function m(kind) { return META[kind].title; }
  [].forEach.call(document.querySelectorAll("[data-demo]"), function (b) { b.addEventListener("click", function () { open(b.getAttribute("data-demo"), b); }); });
  load();
})();
