/* UNTILS game page extras: Favourite button, Comments, recently played.
   Needs player.js (account) and app.v25.js (game page). */
(function () {
  "use strict";
  var P = window.UntilsPlayer, tb = document.querySelector("#game .tb"), info = document.getElementById("info");
  if (!P || !P.need || !tb || !info) return;

  var HEART = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.3C1.7 8 3.6 5 6.7 5c1.9 0 3.5 1 5.3 3 1.8-2 3.4-3 5.3-3 3.1 0 5 3 3.9 6.2C19.5 15.9 12 20.5 12 20.5z"/></svg>';
  var CHAT = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-4.8A8 8 0 1 1 21 12z"/></svg>';
  var DK = "untils_cdraft";

  /* ---------- buttons next to the like buttons ---------- */
  var fv = document.createElement("button");
  fv.type = "button"; fv.className = "vb vx"; fv.id = "fv"; fv.setAttribute("aria-pressed", "false");
  fv.innerHTML = HEART + '<span id="fvt" class="vtx">FAVOURITE</span>';
  var cm = document.createElement("button");
  cm.type = "button"; cm.className = "vb vx"; cm.id = "cm"; cm.setAttribute("aria-expanded", "false");
  cm.innerHTML = CHAT + '<span class="vtx">COMMENTS</span><em id="cmc"></em>'; cm.setAttribute("aria-label", "Comments");
  var vt = tb.querySelector(".vt");
  if (vt && vt.nextSibling) { tb.insertBefore(fv, vt.nextSibling); tb.insertBefore(cm, fv.nextSibling); } else { tb.appendChild(fv); tb.appendChild(cm); }

  /* ---------- comments panel (under the toolbar) ---------- */
  var sec = document.createElement("section");
  sec.className = "info cmx"; sec.id = "cmts"; sec.hidden = true;
  sec.innerHTML = '<h4>COMMENTS <span id="cmn"></span></h4>' +
    '<div class="cm-box"><textarea id="cmt" maxlength="300" rows="2" placeholder="Write a comment about this game..." aria-label="Write a comment"></textarea><button type="button" class="btn" id="cms">SEND</button></div>' +
    '<div class="cm-msg" id="cmm" role="status"></div><ul class="cm-list" id="cml"></ul>';
  tb.parentNode.insertBefore(sec, tb.nextSibling);
  var ta = sec.querySelector("#cmt"), sendB = sec.querySelector("#cms"), msgE = sec.querySelector("#cmm"), listE = sec.querySelector("#cml"), numE = sec.querySelector("#cmn");

  function key() { try { return (L[cur] && L[cur].key) || ""; } catch (e) { return ""; } }
  function gname() { try { return cur; } catch (e) { return ""; } }
  function icon() { try { return (L[cur] && L[cur].icon) || ""; } catch (e) { return ""; } }
  function say(t, ok) { msgE.textContent = t || ""; msgE.className = "cm-msg" + (ok ? " ok" : ""); }
  function ago(at) {
    var s = Math.max(1, Math.round((Date.now() - at) / 1000));
    if (s < 60) return "just now"; if (s < 3600) return Math.floor(s / 60) + " min ago";
    if (s < 86400) return Math.floor(s / 3600) + " h ago"; if (s < 2592000) return Math.floor(s / 86400) + " d ago";
    return new Date(at).toLocaleDateString();
  }

  /* ---------- favourite ---------- */
  function paintFav() {
    var on = !!key() && P.isFav(key());
    fv.classList.toggle("on", on); fv.setAttribute("aria-pressed", on ? "true" : "false");
    fv.setAttribute("aria-label", on ? "Remove from favourites" : "Add to favourites");
    fv.querySelector("#fvt").textContent = on ? "FAVOURITED" : "FAVOURITE";
  }
  fv.onclick = function () {
    var k = key(); if (!k) return;
    var on = P.toggleFav(k, gname(), icon());
    if (typeof toast === "function") toast(on ? "Added to your favourites" : "Removed from favourites");
  };

  /* ---------- comments ---------- */
  var items = [], count = 0, loadedFor = "";
  function render() {
    var me = P.userId();
    numE.textContent = count ? "(" + count + ")" : "";
    cm.querySelector("#cmc").textContent = count ? String(count) : "";
    listE.innerHTML = "";
    if (!items.length) { var e = document.createElement("li"); e.className = "cm-empty"; e.textContent = "No comments yet. Be the first to say something!"; listE.appendChild(e); return; }
    items.forEach(function (c) {
      var li = document.createElement("li"), av = document.createElement("span"), body = document.createElement("div"), top = document.createElement("div"), nm = document.createElement("b"), tm = document.createElement("small"), tx = document.createElement("p");
      av.className = "cm-av"; av.textContent = String(c.n || "?").charAt(0).toUpperCase();
      var src = c.v ? "/api/avatar?u=" + encodeURIComponent(c.u) + "&v=" + c.v : (/^https:\/\//.test(c.p || "") ? c.p : "");
      if (src) { var im = document.createElement("img"); im.alt = ""; im.loading = "lazy"; im.referrerPolicy = "no-referrer"; im.src = src; im.onload = function () { av.textContent = ""; av.appendChild(im); }; }
      nm.textContent = c.n; tm.textContent = ago(c.at); tx.textContent = c.t; top.className = "cm-top"; top.appendChild(nm); top.appendChild(tm);
      if (me && c.u === me) { var d = document.createElement("button"); d.type = "button"; d.className = "cm-del"; d.textContent = "Delete"; d.onclick = function () { del(c.id); }; top.appendChild(d); }
      body.className = "cm-body"; body.appendChild(top); body.appendChild(tx); li.appendChild(av); li.appendChild(body); listE.appendChild(li);
    });
  }
  function apply(d) { items = d.items || []; count = d.n || 0; render(); }
  function load() {
    var k = key(); if (!k) return; loadedFor = k;
    fetch("/api/comments?g=" + encodeURIComponent(k), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) { if (loadedFor === k && !d.error) apply(d); }).catch(function () {});
  }
  function del(id) {
    var k = key(); if (!k) return;
    P.api("/api/comments?g=" + encodeURIComponent(k) + "&id=" + encodeURIComponent(id), "DELETE").then(function (r) { if (r.ok) apply(r.data); else say(r.data.error || "Could not delete."); });
  }
  function doSend() {
    var k = key(), t = ta.value.trim(); if (!k) return;
    if (!t) { say("Write something first."); return; }
    sendB.disabled = true; say("");
    P.api("/api/comments", "POST", { g: k, text: t }).then(function (r) {
      sendB.disabled = false;
      if (r.ok) { ta.value = ""; try { sessionStorage.removeItem(DK); } catch (e) {} apply(r.data); say("Comment posted.", true); return; }
      if (r.status === 401) { P.need("Sign up or log in to comment", doSend); return; }
      say(r.status === 0 ? "Could not reach the server. Check your internet connection." : (r.data.error || "Could not post your comment."));
    });
  }
  sendB.onclick = function () {
    if (!ta.value.trim()) { say("Write something first."); return; }
    say(""); P.need("Sign up or log in to comment", doSend);   /* no account yet: opens the sign-up panel first */
  };
  ta.onkeydown = function (e) { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") sendB.click(); };
  ta.oninput = function () { try { sessionStorage.setItem(DK, JSON.stringify({ k: key(), t: ta.value })); } catch (e) {} };
  cm.onclick = function () {
    var open = sec.hidden; sec.hidden = !open; cm.classList.toggle("on", open); cm.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) { load(); setTimeout(function () { try { ta.focus({ preventScroll: true }); sec.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (e) {} }, 50); }
  };

  /* ---------- follow the game page ---------- */
  function onGame() {
    var k = key(); if (!k) return;
    sec.hidden = true; cm.classList.remove("on"); cm.setAttribute("aria-expanded", "false");
    items = []; count = 0; render(); say(""); ta.value = "";
    try { var d = JSON.parse(sessionStorage.getItem(DK) || "null"); if (d && d.k === k) ta.value = d.t || ""; } catch (e) {}
    paintFav(); load();
  }
  new MutationObserver(onGame).observe(info, { childList: true });
  P.onChange(function () { paintFav(); render(); });
  ["play", "again"].forEach(function (id) {
    var b = document.getElementById(id);
    if (b) b.addEventListener("click", function () { var k = key(); if (k && !(L[cur] && L[cur].pv)) P.addRecent(k, gname(), icon()); });
  });
  render(); paintFav();
})();
