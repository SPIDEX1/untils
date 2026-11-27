/* UNTILS About page - "THE ORIGINS".
   The people come from the admin portal (About tab). Tap a card and a details panel slides open right under that card's row
   (bio, email and Instagram buttons). Tap again, or tap another card, to close / switch. If the list cannot be loaded the page keeps its built-in team. */
(function () {
  "use strict";
  var ln = document.getElementById("abLangN"); function lc() { if (ln && window.UntilsLangCount) ln.textContent = window.UntilsLangCount; } lc(); window.addEventListener("load", lc);
  var h2 = [].filter.call(document.querySelectorAll(".ab-sec h2"), function (x) { return /^\s*THE (TEAM|ORIGINS)\s*$/i.test(x.textContent); })[0];
  if (!h2) return;
  var sec = h2.closest(".ab-sec"), vg = sec && sec.querySelector(".vg");
  if (!vg) return;
  h2.textContent = "THE ORIGINS";

  var css = document.createElement("style");
  css.textContent =
    ".vg.ab-team{grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr));align-items:start}" +
    ".ab-team>.vc{display:flex;flex-direction:column;min-width:0;overflow-wrap:anywhere;text-align:left;font:inherit;color:inherit;cursor:default;position:relative}" +
    ".ab-team>.vc.has{cursor:pointer;transition:transform .25s,box-shadow .25s}" +
    ".ab-team>.vc.has:hover{transform:translateY(-3px)}" +
    ".ab-team>.vc.has:focus-visible{outline:3px solid #0a6cff;outline-offset:2px}" +
    ".ab-team>.vc.on{box-shadow:0 0 0 3px #0a6cff,0 12px 28px rgba(10,108,255,.25)}" +
    ".ab-team>.vc h3{margin:0}" +
    ".ab-tap{display:inline-flex;align-items:center;align-self:flex-start;gap:6px;margin-top:14px;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.26);font-size:12px;font-weight:800;color:#fff;letter-spacing:.02em}" +
    ".ab-tap svg{width:14px;height:14px;transition:transform .3s}" +
    ".vc.on .ab-tap svg{transform:rotate(180deg)}" +
    ".ab-pn{grid-column:1/-1;min-width:0;overflow:hidden;height:0;opacity:0;transition:height .35s ease,opacity .3s ease;scroll-margin-top:84px}" +
    ".ab-pn.open{opacity:1}" +
    ".ab-pi{background:#fff;border-radius:22px;padding:22px;border:2px solid #cfe3ff;position:relative}" +
    ".ab-pi .abh{display:flex;align-items:center;gap:14px;margin-bottom:14px;padding-right:44px}" +
    ".ab-pi .abh .av{margin:0;flex:none}" +
    ".ab-pi .abh h3{margin:0;font-size:18px;overflow-wrap:anywhere}" +
    ".ab-pi .abh small{margin-top:4px}" +
    ".ab-pi p.bt{font-size:15px;line-height:1.75;margin:0 0 12px;max-width:none;overflow-wrap:anywhere;color:#41546e}" +
    ".ab-pi .nb{font-size:14px;color:#6b7c93}" +
    ".ab-x{position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:50%;border:0;background:#eaf3ff;color:#0a6cff;cursor:pointer;display:grid;place-items:center;padding:0}" +
    ".ab-x svg{width:16px;height:16px}" +
    ".ab-ct{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}" +
    ".ab-ct a{flex:1 1 140px;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:42px;padding:8px 14px;border-radius:999px;font-weight:800;font-size:13px;letter-spacing:.02em;text-decoration:none;color:#fff;background:linear-gradient(135deg,#2aa7ff,#0a6cff);box-sizing:border-box;white-space:nowrap}" +
    ".ab-ct a.ig{background:linear-gradient(135deg,#f9a03f,#e1306c,#7a3ffc)}" +
    ".ab-ct svg{width:16px;height:16px;flex:none}" +
    "@media(max-width:520px){.vg.ab-team{grid-template-columns:1fr!important}.ab-pi{padding:16px}.ab-ct a{flex-basis:100%}}" +
    "@media(prefers-reduced-motion:reduce){.ab-pn,.ab-team>.vc.has,.ab-tap svg{transition:none}}";
  document.head.appendChild(css);

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  var MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3.5 7.5l8.5 6 8.5-6"/></svg>';
  var IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var XI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  function initial(m) { return String(m.name || "?").trim().charAt(0).toUpperCase(); }
  function contacts(m) {
    if (!m.email && !m.insta) return null;
    var d = el("div", "ab-ct");
    if (m.email) { var a = el("a"); a.href = "mailto:" + m.email + "?subject=" + encodeURIComponent("Question for " + m.name + " (UNTILS)"); a.innerHTML = MAIL + "<span>Ask a question</span>"; a.setAttribute("aria-label", "Email " + m.name + " to ask a question"); a.title = m.email; d.appendChild(a); }
    if (m.insta) { var b = el("a", "ig"); b.href = "https://www.instagram.com/" + encodeURIComponent(m.insta) + "/"; b.target = "_blank"; b.rel = "noopener noreferrer"; b.innerHTML = IG + "<span>Instagram</span>"; b.setAttribute("aria-label", m.name + " on Instagram"); d.appendChild(b); }
    return d;
  }

  var list = [], cards = [], panel = null, openIdx = -1, anim = 0;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;

  function rowEnd(i) { /* index of the last card in the same visual row as card i */
    var top = cards[i].offsetTop, j = i;
    while (j + 1 < cards.length && cards[j + 1].offsetTop === top) j++;
    return j;
  }
  function build(m) {
    var pi = el("div", "ab-pi"), hd = el("div", "abh"), nb = el("div");
    hd.appendChild(el("div", "av", initial(m))); nb.appendChild(el("h3", "", m.name)); if (m.role) nb.appendChild(el("small", "", m.role)); hd.appendChild(nb); pi.appendChild(hd);
    var any = false;
    String(m.bio || "").split(/\n+/).forEach(function (p) { p = p.trim(); if (p) { pi.appendChild(el("p", "bt", p)); any = true; } });
    if (!any) pi.appendChild(el("p", "bt nb", "More details coming soon."));
    var ct = contacts(m); if (ct) pi.appendChild(ct);
    var x = el("button", "ab-x"); x.type = "button"; x.setAttribute("aria-label", "Close details"); x.innerHTML = XI; x.onclick = function () { toggle(openIdx, true); }; pi.appendChild(x);
    return pi;
  }
  function removePanel(cb) {
    var p = panel; panel = null; if (!p) { if (cb) cb(); return; }
    cards.forEach(function (c) { c.classList.remove("on"); c.setAttribute("aria-expanded", "false"); });
    if (reduce) { p.remove(); if (cb) cb(); return; }
    p.style.height = p.offsetHeight + "px"; void p.offsetHeight; p.style.height = "0px"; p.classList.remove("open");
    setTimeout(function () { p.remove(); if (cb) cb(); }, 340);
  }
  function show(i) {
    var m = list[i], p = el("div", "ab-pn"); p.id = "ab-detail"; p.setAttribute("role", "region"); p.setAttribute("aria-label", "Details of " + m.name);
    p.appendChild(build(m));
    var end = rowEnd(i); vg.insertBefore(p, cards[end].nextSibling);
    cards[i].classList.add("on"); cards[i].setAttribute("aria-expanded", "true"); panel = p; openIdx = i;
    var hgt = p.firstChild.offsetHeight;
    if (reduce) { p.style.height = "auto"; p.classList.add("open"); }
    else { p.style.height = "0px"; void p.offsetHeight; p.style.height = hgt + "px"; p.classList.add("open"); setTimeout(function () { if (panel === p) p.style.height = "auto"; }, 380); }
    var r = p.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.top < 70 || r.top + Math.min(hgt, vh * 0.6) > vh) { try { p.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); } catch (e) { p.scrollIntoView(); } }
  }
  function toggle(i, back) {
    var t = ++anim;
    if (panel && openIdx === i) { removePanel(); openIdx = -1; if (back && cards[i]) cards[i].focus({ preventScroll: true }); return; }
    var go = function () { if (t === anim) show(i); };
    if (panel) removePanel(go); else go();
  }
  var rt = 0;
  window.addEventListener("resize", function () { /* rows change when the screen turns: put the panel back under the right row */
    clearTimeout(rt); rt = setTimeout(function () { if (!panel || openIdx < 0) return; var p = panel, end = rowEnd(openIdx); vg.insertBefore(p, cards[end].nextSibling); if (p.style.height !== "auto") p.style.height = "auto"; }, 150);
  });

  fetch("/api/about", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
    list = (d && d.members) || [];
    if (!list.length) return;
    vg.className = "vg two ab-team"; vg.innerHTML = ""; cards = [];
    list.forEach(function (m, i) {
      var has = !!(m.bio || m.email || m.insta), c = el(has ? "button" : "div", "vc" + (has ? " has" : ""));
      if (has) { c.type = "button"; c.setAttribute("aria-expanded", "false"); c.setAttribute("aria-controls", "ab-detail"); c.setAttribute("aria-label", m.name + (m.role ? ", " + m.role : "") + ". Tap to view details"); }
      c.appendChild(el("div", "av", initial(m))); c.appendChild(el("h3", "", m.name)); if (m.role) c.appendChild(el("small", "", m.role));
      if (has) { var tap = el("span", "ab-tap"); tap.innerHTML = "<span>Tap to view details</span>" + CHEV; c.appendChild(tap); c.onclick = function () { toggle(i); }; }
      vg.appendChild(c); cards.push(c);
    });
  }).catch(function () {});
})();
