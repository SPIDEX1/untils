/* Email links: on a computer (usually no mail app set up) open Gmail compose in a new tab; phones keep the normal mail app.
   Also powers the COPY EMAIL button on the contact page. */
(function () {
  var touch = window.matchMedia && matchMedia("(pointer:coarse)").matches;
  function gmail(to, subj) { return "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(to) + (subj ? "&su=" + encodeURIComponent(subj) : ""); }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!a || touch || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    var p = a.getAttribute("href").replace(/^mailto:/i, "").split("?"), s = ((p[1] || "").match(/subject=([^&]*)/i) || [])[1];
    e.preventDefault();
    var w = window.open(gmail(decodeURIComponent(p[0]), s ? decodeURIComponent(s) : ""), "_blank", "noopener");
    if (!w) location.href = a.getAttribute("href");
  });
  var cp = document.getElementById("copyMail"), msg = document.getElementById("mailMsg");
  if (cp) cp.addEventListener("click", function () {
    var t = cp.getAttribute("data-mail") || "";
    function ok(m) { if (msg) msg.textContent = m; setTimeout(function () { if (msg) msg.textContent = ""; }, 2500); }
    function fb() { var x = document.createElement("textarea"); x.value = t; x.style.position = "fixed"; x.style.opacity = "0"; document.body.appendChild(x); x.select(); var d = false; try { d = document.execCommand("copy"); } catch (er) {} document.body.removeChild(x); ok(d ? "Email copied!" : "Copy failed. Please copy it by hand."); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { ok("Email copied!"); }, fb); else fb();
  });
})();
