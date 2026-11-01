/* UntilsLoader: UL.spin(box) while loading, UL.fail(box, retry) when it did not load, UL.clear(box) when done */
(function () {
  "use strict";
  var SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/></svg>';
  function build(box, spinning, retry) {
    if (!box) return null;
    box.innerHTML = "";
    var w = document.createElement("div"), b = document.createElement("button");
    w.className = "ul"; b.type = "button"; b.className = "ul-c" + (spinning ? " sp" : ""); b.innerHTML = SVG;
    b.setAttribute("aria-label", spinning ? "Loading" : "Could not load. Tap to try again"); b.title = spinning ? "Loading" : "Tap to try again";
    if (spinning) b.disabled = true;
    else if (retry) b.addEventListener("click", function () {
      b.classList.add("sp"); b.disabled = true;
      var done = function () { if (b.parentNode) { b.classList.remove("sp"); b.disabled = false; } };
      try { Promise.resolve(retry()).then(done, done); } catch (e) { done(); }
    });
    w.appendChild(b); box.appendChild(w); return b;
  }
  window.UL = {
    spin: function (box) { return build(box, true); },
    fail: function (box, retry) { return build(box, false, retry); },
    clear: function (box) { if (box) box.innerHTML = ""; }
  };
})();
