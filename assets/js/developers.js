/* UNTILS developer portal - sign in / sign up panel.
   Abhi sirf PREVIEW hai: koi email nahi jaata, koi data save ya send nahi hota.
   Backend (Supabase) judne par PREVIEW=false karenge aur sendCode / verifyCode ko asli banayenge. */
(function () {
  "use strict";

  var PREVIEW = true;

  var $ = function (id) { return document.getElementById(id); };
  var ov = $("dvOv"), pn = $("dvPn");
  var form = $("dvForm"), codeForm = $("dvCodeForm"), done = $("dvDone");
  var mode = "signup", email = "", opener = null, timer = null;
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ---- backend hooks (Phase 1 mein yahan asli login judega) ---- */
  function sendCode(m, data) {
    return new Promise(function (resolve) { setTimeout(resolve, 250); });
  }
  function verifyCode(addr, code) {
    return new Promise(function (resolve) { setTimeout(function () { resolve({ ok: true }); }, 250); });
  }

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
    $("dvPrev").hidden = !PREVIEW;
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
    var em = $("dvEmail").value.trim();
    if (mode === "signup" && name.length < 2) return bad("dvName", "Please enter your studio or developer name.");
    if (!emailRe.test(em)) return bad("dvEmail", "Please enter a valid email address.");
    if (mode === "signup" && !$("dvTerms").checked) {
      $("dvErr").textContent = "Please accept the Terms and Privacy Policy to continue.";
      return;
    }
    email = em;
    var btn = $("dvGo");
    btn.disabled = true;
    btn.textContent = "PLEASE WAIT...";
    sendCode(mode, { name: name, email: em }).then(function () {
      btn.disabled = false;
      showCode();
    });
  });

  $("dvSw").addEventListener("click", function (e) {
    var t = e.target.closest("[data-sw]");
    if (t) { setMode(t.getAttribute("data-sw")); $((t.getAttribute("data-sw") === "signup") ? "dvName" : "dvEmail").focus(); }
  });

  /* ---- step 2: 6-digit code ---- */
  var boxes = [].slice.call($("dvCode").querySelectorAll("input"));

  function showCode() {
    $("dvCodeSub").textContent = PREVIEW
      ? "In the live portal, a 6-digit code is sent to " + email + ". For this preview, enter any 6 digits to continue."
      : "We sent a 6-digit code to " + email + ". Enter it below.";
    boxes.forEach(function (b) { b.value = ""; });
    clearErrors();
    view("code");
    startCooldown();
    boxes[0].focus();
  }

  boxes.forEach(function (b, i) {
    b.addEventListener("input", function () {
      b.value = b.value.replace(/\D/g, "").slice(-1);
      if (b.value && i < 5) boxes[i + 1].focus();
    });
    b.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && !b.value && i > 0) { boxes[i - 1].focus(); boxes[i - 1].value = ""; }
      else if (e.key === "ArrowLeft" && i > 0) boxes[i - 1].focus();
      else if (e.key === "ArrowRight" && i < 5) boxes[i + 1].focus();
    });
    b.addEventListener("paste", function (e) {
      var t = ((e.clipboardData || window.clipboardData).getData("text") || "").replace(/\D/g, "").slice(0, 6);
      if (!t) return;
      e.preventDefault();
      for (var k = 0; k < 6; k++) boxes[k].value = t[k] || "";
      boxes[Math.min(t.length, 5)].focus();
    });
  });

  function startCooldown() {
    var btn = $("dvResend"), left = 30;
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
    boxes.forEach(function (b) { b.value = ""; });
    $("dvErr2").textContent = "";
    sendCode(mode, { email: email }).then(function () { startCooldown(); boxes[0].focus(); });
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
    if (code.length < 6) { $("dvErr2").textContent = "Please enter all 6 digits."; return; }
    verifyCode(email, code).then(function (r) {
      if (!r.ok) { $("dvErr2").textContent = "That code is not correct. Please try again."; return; }
      showDone();
    });
  });

  /* ---- step 3: done ---- */
  function showDone() {
    clearInterval(timer);
    var up = mode === "signup";
    $("dvDoneTitle").textContent = up ? "You're all set (preview)" : "Welcome back (preview)";
    $("dvDoneText").textContent = up
      ? "Thanks! Sign-ups are not live yet, so no account was created. Your developer dashboard is being built and will open here soon."
      : "In the live portal your dashboard opens here, where you can add a new game and upload your index.zip.";
    view("done");
  }
  $("dvDoneClose").addEventListener("click", close);

  /* ---- open / close wiring ---- */
  $("dvSignin").addEventListener("click", function (e) { open("signin", e.currentTarget); });
  $("dvHave").addEventListener("click", function (e) { open("signin", e.currentTarget); });
  $("dvStart").addEventListener("click", function (e) { open("signup", e.currentTarget); });
  $("dvStart2").addEventListener("click", function (e) { open("signup", e.currentTarget); });
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
    if (location.hash === "#signup") open("signup", $("dvStart"));
    else if (location.hash === "#signin") open("signin", $("dvSignin"));
  }
  window.addEventListener("hashchange", checkHash);
  checkHash();
})();
