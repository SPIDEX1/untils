/* Docs back button: returns to the page the visitor came from */
(function () {
  "use strict";
  var a = document.getElementById("ddBack"), tx = document.getElementById("ddBackTx");
  if (!a) return;
  var K = "untilsDocsFrom", SELF = "/developers/docs/", from = "";
  var names = {
    "/": "Home", "/about/": "About", "/privacy/": "Privacy Policy", "/terms/": "Terms of Use", "/contact/": "Contact",
    "/games/": "Games", "/developers/": "For Developers", "/developers/dashboard/": "Dashboard",
    "/developers/account/": "Account", "/developers/inspector/": "Inspector"
  };
  try {
    if (document.referrer) {
      var u = new URL(document.referrer);
      if (u.origin === location.origin && u.pathname.indexOf(SELF) !== 0) {
        from = u.pathname + u.search;
        sessionStorage.setItem(K, from);
      }
    }
    if (!from) from = sessionStorage.getItem(K) || "";
  } catch (e) { }
  if (!from || from.charAt(0) !== "/" || from.charAt(1) === "/") from = "/developers/";
  var path = from.split("?")[0], label = names[path] || "Back";
  a.setAttribute("href", from);
  if (tx) tx.textContent = label;
  a.setAttribute("aria-label", label === "Back" ? "Back" : "Back to " + label);
  a.setAttribute("title", a.getAttribute("aria-label"));
})();
