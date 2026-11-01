/* UNTILS docs: a Copy button in the top-right corner of every code block */
(function () {
  "use strict";
  var ICO = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
  var OK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return legacy(text); });
    }
    return legacy(text);
  }
  function legacy(text) {
    return new Promise(function (res, rej) {
      var t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", ""); t.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
      document.body.appendChild(t); t.select(); t.setSelectionRange(0, text.length);
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(t); ok ? res() : rej(new Error("copy failed"));
    });
  }

  function init() {
    [].forEach.call(document.querySelectorAll(".doc pre, pre"), function (pre) {
      if (pre.parentNode && pre.parentNode.classList && pre.parentNode.classList.contains("cbox")) return;
      var box = document.createElement("div"), btn = document.createElement("button"), t = 0;
      box.className = "cbox";
      btn.type = "button"; btn.className = "cpbtn"; btn.title = "Copy code"; btn.setAttribute("aria-label", "Copy code");
      btn.innerHTML = ICO + '<span>Copy</span>';
      pre.parentNode.insertBefore(box, pre); box.appendChild(pre); box.appendChild(btn);
      btn.addEventListener("click", function () {
        var code = pre.querySelector("code") || pre, text = code.innerText || code.textContent || "";
        text = text.replace(/\n$/, "");
        copyText(text).then(function () {
          btn.classList.add("ok"); btn.innerHTML = OK + '<span>Copied</span>'; btn.setAttribute("aria-label", "Copied");
        }, function () {
          btn.classList.add("bad"); btn.innerHTML = '<span>Press Ctrl+C</span>';
          var r = document.createRange(); r.selectNodeContents(code); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        }).then(function () {
          clearTimeout(t);
          t = setTimeout(function () { btn.classList.remove("ok", "bad"); btn.innerHTML = ICO + '<span>Copy</span>'; btn.setAttribute("aria-label", "Copy code"); }, 1800);
        });
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
