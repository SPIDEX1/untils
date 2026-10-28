/* shared footer: the link of the page you are already on is hidden (Games column always stays) */
(function () {
  function norm(p) { return p.replace(/index\.html$/, "").replace(/\/+$/, "") || "/"; }
  function sync() {
    var p = norm(location.pathname), dev = /^\/developers(\/|$)/.test(p) && p !== "/developers/docs";
    [].forEach.call(document.querySelectorAll("footer.sf .sf-c a[href]"), function (a) {
      var h = a.getAttribute("href"); if (h.charAt(0) !== "/") return;
      var t = norm(h), hide = false;
      if (t === "/games") hide = false;
      else if (t === "/developers") hide = dev;
      else hide = (t === p);
      a.style.display = hide ? "none" : "";
    });
  }
  window.sfSync = sync; sync();
})();
