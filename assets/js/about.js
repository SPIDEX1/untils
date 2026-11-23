/* UNTILS About page: shows the team set by the leader in the admin portal (About tab).
   Each person: name, role, email and Instagram buttons that open straight away, and a long write-up below the cards.
   If the list cannot be loaded the page keeps its built-in team. */
(function () {
  "use strict";
  var h2 = [].filter.call(document.querySelectorAll(".ab-sec h2"), function (x) { return /^\s*THE TEAM\s*$/i.test(x.textContent); })[0];
  if (!h2) return;
  var sec = h2.closest(".ab-sec"), vg = sec && sec.querySelector(".vg");
  if (!vg) return;

  var css = document.createElement("style");
  css.textContent =
    ".vg.ab-team{grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr))}" +
    ".ab-team .vc{display:flex;flex-direction:column;min-width:0;overflow-wrap:anywhere}" +
    ".ab-team .vc h3{margin-bottom:0}" +
    ".ab-team .vc h3 a{color:inherit;text-decoration:none}" +
    ".ab-ct{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}" +
    ".ab-team .ab-ct{margin-top:auto;padding-top:16px}" +
    ".ab-ct a{flex:1 1 120px;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:40px;padding:8px 12px;border-radius:999px;font-weight:800;font-size:12px;letter-spacing:.03em;text-decoration:none;color:#fff;background:linear-gradient(135deg,#2aa7ff,#0a6cff);box-sizing:border-box;white-space:nowrap}" +
    ".ab-ct a.ig{background:linear-gradient(135deg,#f9a03f,#e1306c,#7a3ffc)}" +
    ".ab-ct svg{width:16px;height:16px;flex:none}" +
    ".ab-bl{display:flex;flex-direction:column;gap:16px;min-width:0}" +
    ".ab-bio{min-width:0;scroll-margin-top:90px}" +
    ".ab-bio .abh{display:flex;align-items:center;gap:14px;margin-bottom:14px}" +
    ".ab-bio .abh .av{margin:0;flex:none}" +
    ".ab-bio .abh h3{margin:0;font-size:15px;overflow-wrap:anywhere}" +
    ".ab-bio .abh small{margin-top:4px}" +
    ".ab-bio p.bt{font-size:15px;line-height:1.75;margin:0 0 12px;max-width:none;overflow-wrap:anywhere}" +
    ".ab-bio p.bt:last-of-type{margin-bottom:0}" +
    "@media(max-width:520px){.vg.ab-team{grid-template-columns:1fr!important}.ab-ct a{flex-basis:100%}.ab-bio{padding:16px}}";
  document.head.appendChild(css);

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  var MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3.5 7.5l8.5 6 8.5-6"/></svg>';
  var IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>';
  function contacts(m) {
    if (!m.email && !m.insta) return null;
    var d = el("div", "ab-ct");
    if (m.email) { var a = el("a"); a.href = "mailto:" + m.email + "?subject=" + encodeURIComponent("Question for " + m.name + " (UNTILS)"); a.innerHTML = MAIL + "<span>Email</span>"; a.setAttribute("aria-label", "Email " + m.name + " to ask a question"); a.title = m.email; d.appendChild(a); }
    if (m.insta) { var b = el("a", "ig"); b.href = "https://www.instagram.com/" + encodeURIComponent(m.insta) + "/"; b.target = "_blank"; b.rel = "noopener noreferrer"; b.innerHTML = IG + "<span>Instagram</span>"; b.setAttribute("aria-label", m.name + " on Instagram"); d.appendChild(b); }
    return d;
  }
  function initial(m) { return String(m.name || "?").trim().charAt(0).toUpperCase(); }

  fetch("/api/about", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
    var list = (d && d.members) || [];
    if (!list.length) return;
    vg.className = "vg two ab-team"; vg.innerHTML = "";
    list.forEach(function (m, i) {
      var c = el("div", "vc"), av = el("div", "av", initial(m)), t = el("h3");
      if (m.bio) { var a = el("a", "", m.name); a.href = "#ab-p" + i; t.appendChild(a); } else t.textContent = m.name;
      c.appendChild(av); c.appendChild(t); if (m.role) c.appendChild(el("small", "", m.role));
      var ct = contacts(m); if (ct) c.appendChild(ct);
      vg.appendChild(c);
    });
    var withBio = list.map(function (m, i) { return { m: m, i: i }; }).filter(function (x) { return x.m.bio; });
    if (!withBio.length) return;
    var s2 = el("section", "ab-sec"), left = el("div"), right = el("div", "ab-bl");
    left.appendChild(el("div", "eyb", "IN DETAIL")); left.appendChild(el("h2", "", "MEET THE TEAM")); left.appendChild(el("p", "", "Learn more about the people behind UNTILS and get in touch with them."));
    withBio.forEach(function (x) {
      var m = x.m, a = el("article", "vc ab-bio"), hd = el("div", "abh"), nb = el("div");
      a.id = "ab-p" + x.i; hd.appendChild(el("div", "av", initial(m))); nb.appendChild(el("h3", "", m.name)); if (m.role) nb.appendChild(el("small", "", m.role)); hd.appendChild(nb); a.appendChild(hd);
      String(m.bio).split(/\n+/).forEach(function (p) { p = p.trim(); if (p) a.appendChild(el("p", "bt", p)); });
      var ct = contacts(m); if (ct) a.appendChild(ct);
      right.appendChild(a);
    });
    s2.appendChild(left); s2.appendChild(right);
    sec.parentNode.insertBefore(s2, sec.nextSibling);
  }).catch(function () {});
})();
