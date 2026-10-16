/* UNTILS developer portal - sign in / sign up panel (asli login, auth.js ke saath) */
(function () {
  "use strict";

  var A = window.UntilsAuth;
  var DASH = "/developers/dashboard/";
  var RESEND_SECONDS = 60;   /* Supabase mein "Minimum interval per user" bhi 60 second hai */

  var $ = function (id) { return document.getElementById(id); };
  var ov = $("dvOv"), pn = $("dvPn");
  var form = $("dvForm"), codeForm = $("dvCodeForm"), done = $("dvDone"), codeWrap = $("dvCode");
  var mode = "signup", email = "", opener = null, timer = null, boxes = [];
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ---- agar already logged in hai ---- */
  var loggedIn = A && A.hasSession();
  if (loggedIn) {
    $("dvSignin").querySelector("span").textContent = "DASHBOARD";
    [$("dvStart"), $("dvStart2")].forEach(function (b) { b.firstChild.nodeValue = "GO TO DASHBOARD "; });
    $("dvHave").parentNode.hidden = true;
  }
  function gotoDash() { location.href = DASH; }

  /* ---- views ---- */
  function view(v) {
    form.hidden = v !== "form";
    codeForm.hidden = v !== "code";
    done.hidden = v !== "done";
  }

  function clearErrors() {
    $("dvErr").textContent = "";
    $("dvErr2").textContent = "";
    ["dvName", "dvEmail"].forEach(function (id) { $(id).classList.remove("bad"); });
  }

  function setMode(m) {
    mode = m;
    var up = m === "signup";
    $("dvTitle").textContent = up ? "Create your developer account" : "Sign in";
    $("dvSub").textContent = up
      ? "Publish your games on UNTILS in a few minutes."
      : "Enter your email and we'll send you a 6-digit code to sign in.";
    $("dvNameW").hidden = !up;
    $("dvTermsW").hidden = !up;
    $("dvGo").textContent = up ? "CREATE ACCOUNT" : "SEND CODE";
    $("dvGo").disabled = false;
    $("dvSw").innerHTML = up
      ? 'Already have an account? <button type="button" class="dv-lnk" data-sw="signin">Sign in</button>'
      : 'New to UNTILS? <button type="button" class="dv-lnk" data-sw="signup">Create new account</button>';
    clearErrors();
  }

  function open(m, from) {
    opener = from || document.activeElement;
    setMode(m);
    view("form");
    ov.classList.add("open");
    ov.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    setTimeout(function () { (m === "signup" ? $("dvName") : $("dvEmail")).focus(); }, 40);
  }

  function close() {
    ov.classList.remove("open");
    ov.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    clearInterval(timer);
    if (location.hash === "#signin" || location.hash === "#signup") {
      try { history.replaceState(null, "", location.pathname); } catch (e) {}
    }
    if (opener && opener.focus) opener.focus();
  }

  function bad(id, msg) {
    $(id).classList.add("bad");
    $("dvErr").textContent = msg;
    $(id).focus();
  }

  /* ---- step 1: form ---- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    var name = $("dvName").value.trim();
    var em = $("dvEmail").value.trim().toLowerCase();
    if (mode === "signup" && name.length < 2) return bad("dvName", "Please enter your studio or developer name.");
    if (!emailRe.test(em)) return bad("dvEmail", "Please enter a valid email address.");
    if (mode === "signup" && !$("dvTerms").checked) {
      $("dvErr").textContent = "Please accept the Terms and Privacy Policy to continue.";
      return;
    }
    email = em;
    var btn = $("dvGo"), label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "SENDING CODE...";
    A.sendCode(mode, em, name).then(function (r) {
      btn.disabled = false;
      btn.textContent = label;
      if (!r.ok) { $("dvErr").textContent = r.message; return; }
      showCode();
    });
  });

  $("dvSw").addEventListener("click", function (e) {
    var t = e.target.closest("[data-sw]");
    if (!t) return;
    var m = t.getAttribute("data-sw");
    setMode(m);
    $(m === "signup" ? "dvName" : "dvEmail").focus();
  });

  /* ---- step 2: code ---- */
  function makeBoxes(n) {
    codeWrap.innerHTML = "";
    boxes = [];
    codeWrap.style.setProperty("--n", n);
    codeWrap.classList.toggle("many", n > 6);
    for (var i = 0; i < n; i++) {
      var b = document.createElement("input");
      b.type = "text";
      b.inputMode = "numeric";
      b.maxLength = 1;
      b.setAttribute("aria-label", "Digit " + (i + 1));
      if (i === 0) b.autocomplete = "one-time-code";
      codeWrap.appendChild(b);
      boxes.push(b);
      wire(b, i);
    }
  }

  function wire(b, i) {
    b.addEventListener("input", function () {
      b.value = b.value.replace(/\D/g, "").slice(-1);
      if (b.value && i < boxes.length - 1) boxes[i + 1].focus();
    });
    b.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && !b.value && i > 0) { boxes[i - 1].focus(); boxes[i - 1].value = ""; }
      else if (e.key === "ArrowLeft" && i > 0) boxes[i - 1].focus();
      else if (e.key === "ArrowRight" && i < boxes.length - 1) boxes[i + 1].focus();
    });
    b.addEventListener("paste", function (e) {
      var t = ((e.clipboardData || window.clipboardData).getData("text") || "").replace(/\D/g, "").slice(0, 10);
      if (!t) return;
      e.preventDefault();
      if (t.length > boxes.length) makeBoxes(t.length);   /* code 6 se lamba aaye to boxes badh jate hain */
      for (var k = 0; k < boxes.length; k++) boxes[k].value = t[k] || "";
      boxes[Math.min(t.length, boxes.length) - 1].focus();
    });
  }

  function showCode() {
    $("dvCodeSub").textContent = "We sent a code to " + email + ". Enter it below. It can take a minute, so please check your Spam folder too.";
    makeBoxes(6);
    clearErrors();
    view("code");
    startCooldown();
    boxes[0].focus();
  }

  function startCooldown() {
    var btn = $("dvResend"), left = RESEND_SECONDS;
    clearInterval(timer);
    btn.disabled = true;
    btn.textContent = "Resend in " + left + "s";
    timer = setInterval(function () {
      left--;
      if (left <= 0) { clearInterval(timer); btn.disabled = false; btn.textContent = "Resend code"; }
      else btn.textContent = "Resend in " + left + "s";
    }, 1000);
  }

  $("dvResend").addEventListener("click", function () {
    $("dvErr2").textContent = "";
    var btn = $("dvResend");
    btn.disabled = true;
    A.sendCode(mode, email, $("dvName").value.trim()).then(function (r) {
      if (!r.ok) { $("dvErr2").textContent = r.message; btn.disabled = false; return; }
      makeBoxes(6);
      startCooldown();
      boxes[0].focus();
    });
  });

  $("dvBack").addEventListener("click", function () {
    clearInterval(timer);
    setMode(mode);
    view("form");
    $("dvEmail").focus();
  });

  codeForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var code = boxes.map(function (b) { return b.value; }).join("");
    if (code.length < boxes.length || code.length < 6) { $("dvErr2").textContent = "Please enter all the digits of your code."; return; }
    var btn = codeForm.querySelector(".dv-sbtn");
    btn.disabled = true;
    btn.textContent = "VERIFYING...";
    A.verifyCode(email, code).then(function (r) {
      btn.disabled = false;
      btn.textContent = "VERIFY";
      if (!r.ok) { $("dvErr2").textContent = r.message; return; }
      showDone();
    });
  });

  /* ---- step 3: done -> dashboard ---- */
  function showDone() {
    clearInterval(timer);
    $("dvDoneTitle").textContent = "You're in!";
    $("dvDoneText").textContent = "Your email is verified. Opening your dashboard...";
    view("done");
    setTimeout(gotoDash, 900);
  }

  /* ---- open / close wiring ---- */
  $("dvSignin").addEventListener("click", function (e) { loggedIn ? gotoDash() : open("signin", e.currentTarget); });
  $("dvHave").addEventListener("click", function (e) { open("signin", e.currentTarget); });
  $("dvStart").addEventListener("click", function (e) { loggedIn ? gotoDash() : open("signup", e.currentTarget); });
  $("dvStart2").addEventListener("click", function (e) { loggedIn ? gotoDash() : open("signup", e.currentTarget); });
  $("dvClose").addEventListener("click", close);
  ov.addEventListener("mousedown", function (e) { if (e.target === ov) close(); });

  document.addEventListener("keydown", function (e) {
    if (!ov.classList.contains("open")) return;
    if (e.key === "Escape") { close(); return; }
    if (e.key !== "Tab") return;
    var f = [].slice.call(pn.querySelectorAll("button,a[href],input")).filter(function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* /developers/#signup aur #signin se seedha panel khul jaata hai */
  function checkHash() {
    if (loggedIn) return;
    if (location.hash === "#signup") open("signup", $("dvStart"));
    else if (location.hash === "#signin") open("signin", $("dvSignin"));
  }
  window.addEventListener("hashchange", checkHash);
  checkHash();
})();
