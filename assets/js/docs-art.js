/* Documentation: fills the Game Art sections (2D Art, 3D Art Style) from /api/art */
(function () {
  "use strict";
  var B = { "2d": document.getElementById("art2dBox"), "3d": document.getElementById("art3dBox") };
  if (!B["2d"] && !B["3d"]) return;
  var lb = null;
  function close() { if (lb) { lb.remove(); lb = null; } document.removeEventListener("keydown", esc); }
  function esc(e) { if (e.key === "Escape") close(); }
  function open(x) {
    close(); lb = document.createElement("div"); lb.className = "art-lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", x.name);
    var im = document.createElement("img"), p = document.createElement("p"); im.src = x.url; im.alt = x.name; p.textContent = x.name;
    lb.appendChild(im); lb.appendChild(p); lb.addEventListener("click", close); document.body.appendChild(lb); document.addEventListener("keydown", esc);
  }
  function card(x) {
    var b = document.createElement("button"), im = document.createElement("img"), t = document.createElement("b");
    b.type = "button"; b.className = "art-c"; b.setAttribute("aria-label", x.name + " - view bigger");
    im.src = x.url; im.alt = x.name; im.loading = "lazy"; im.decoding = "async"; t.textContent = x.name;
    b.appendChild(im); b.appendChild(t); b.addEventListener("click", function () { open(x); }); return b;
  }
  function load() {
    ["2d", "3d"].forEach(function (k) { if (B[k]) { B[k].style.display = "block"; UL.spin(B[k]); } });
    return fetch("/api/art").then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
      var g = (d && d.groups) || {};
      ["2d", "3d"].forEach(function (k) {
        var box = B[k]; if (!box) return; box.innerHTML = ""; box.style.display = "";
        (g[k] || []).forEach(function (x) { box.appendChild(card(x)); });
      });
    }).catch(function () {
      ["2d", "3d"].forEach(function (k, i) { var box = B[k]; if (!box) return; box.innerHTML = ""; box.style.display = "block"; if (i === 0) UL.fail(box, load); });
    });
  }
  load();
})();
