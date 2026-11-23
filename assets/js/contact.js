/* UNTILS contact page: builds a ready-to-send email (or a bug report) from the form. Nothing is sent by the site itself. */
(function () {
  "use strict";
  var TO = "untilsofficial07@gmail.com";
  var f = document.getElementById("ctForm"); if (!f) return;
  function $(i) { return document.getElementById(i); }
  var topic = $("ctTopic"), bug = $("ctBug"), err = $("ctErr"), hint = $("ctHint");
  var LABEL = { "Report a bug": "More details (optional)", "Report a game or a comment": "Which game or comment, and what is wrong?", "Copyright or takedown": "Page address (URL), what the work is and how you own it", "Privacy request": "Your request, and the email address of your account" };
  function sync() {
    var t = topic.value, isBug = t === "Report a bug";
    bug.hidden = !isBug;
    $("ctMsgL").textContent = LABEL[t] || "Your message";
    $("ctMsg").placeholder = isBug ? "Anything else we should know?" : "Write your message here.";
  }
  topic.addEventListener("change", function () { sync(); err.textContent = ""; });
  [].forEach.call(document.querySelectorAll(".ct-card[data-topic]"), function (a) {
    a.addEventListener("click", function () { topic.value = a.getAttribute("data-topic"); sync(); setTimeout(function () { try { $("ctName").focus({ preventScroll: true }); } catch (e) {} }, 350); });
  });
  if (location.hash === "#bug") { topic.value = "Report a bug"; }
  sync();

  function val(i) { return ($(i).value || "").replace(/\r/g, "").trim(); }
  function build() {
    var t = topic.value, L = [];
    L.push("Topic: " + t);
    if (val("ctName")) L.push("Name: " + val("ctName"));
    if (val("ctEmail")) L.push("Reply to: " + val("ctEmail"));
    if (t === "Report a bug") {
      if (val("ctWhere")) L.push("Game or page: " + val("ctWhere"));
      if (val("ctSteps")) L.push("", "Steps before the problem:", val("ctSteps"));
      if (val("ctWhat")) L.push("", "Expected and what happened:", val("ctWhat"));
      if (val("ctMsg")) L.push("", "More details:", val("ctMsg"));
    } else if (val("ctMsg")) L.push("", val("ctMsg"));
    if ($("ctTech").checked) {
      var n = navigator, w = window;
      L.push("", "--- Device details ---", "Page: " + location.href.split("#")[0], "Browser: " + String(n.userAgent || "").slice(0, 220), "Screen: " + (screen.width || 0) + "x" + (screen.height || 0) + ", window " + (w.innerWidth || 0) + "x" + (w.innerHeight || 0) + ", pixel ratio " + (w.devicePixelRatio || 1), "Language: " + (n.language || ""), "Touch: " + ((n.maxTouchPoints || 0) > 0 ? "yes" : "no"), "Time: " + new Date().toString().slice(0, 33));
    }
    return { subject: "[UNTILS] " + t + (val("ctWhere") && t === "Report a bug" ? " - " + val("ctWhere").slice(0, 60) : ""), body: L.join("\n") };
  }
  function check() {
    err.textContent = ""; hint.textContent = "";
    var t = topic.value, em = val("ctEmail");
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { err.textContent = "That email address does not look right. Please check it, or leave it empty."; $("ctEmail").focus(); return false; }
    if (t === "Report a bug") { if (!val("ctSteps") && !val("ctWhat") && !val("ctMsg")) { err.textContent = "Please tell us what went wrong, so we can fix it."; $("ctWhat").focus(); return false; } }
    else if (!val("ctMsg")) { err.textContent = "Please write your message first."; $("ctMsg").focus(); return false; }
    return true;
  }
  f.addEventListener("submit", function (e) {
    e.preventDefault(); if (!check()) return;
    var m = build(), a = document.createElement("a");
    a.href = "mailto:" + TO + "?subject=" + encodeURIComponent(m.subject) + "&body=" + encodeURIComponent(m.body);   /* mail.js opens Gmail on a computer, the mail app on a phone */
    a.style.display = "none"; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    hint.textContent = "Your email is opening. If nothing opens, press COPY MESSAGE and send it to " + TO + ".";
  });
  $("ctCopy").addEventListener("click", function () {
    if (!check()) return;
    var m = build(), text = "To: " + TO + "\nSubject: " + m.subject + "\n\n" + m.body;
    function ok(msg) { hint.textContent = msg; }
    function fb() { var x = document.createElement("textarea"); x.value = text; x.style.cssText = "position:fixed;opacity:0;left:0;top:0"; document.body.appendChild(x); x.select(); var d = false; try { d = document.execCommand("copy"); } catch (er) {} document.body.removeChild(x); ok(d ? "Copied! Paste it in an email to " + TO + "." : "Copy failed. Please select the text by hand."); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { ok("Copied! Paste it in an email to " + TO + "."); }, fb); else fb();
  });
})();
