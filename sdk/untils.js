/*! UNTILS SDK v1.0.0 (HTML5 games) | Docs: /developers/docs/ */
(function (w) {
  "use strict";
  var VERSION = "1.0.0", TIMEOUT = 1500, OFF = "untils_sdk_offline";
  var env = "none", ready = false, data = {}, player = { guest: true, name: "Guest" };
  var mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 820);
  var pend = {}, seq = 0, pauseCb = [], resumeCb = [], paused = false, saveT = 0;

  function warn(m) { try { console.warn("[Untils] " + m); } catch (e) {} }
  function noop() {}
  function inFrame() { try { return w.parent && w.parent !== w; } catch (e) { return false; } }
  function send(type, extra, ms) {
    return new Promise(function (res, rej) {
      var id = ++seq, m = { untils: 1, id: id, type: type }, k;
      for (k in extra) m[k] = extra[k];
      var t = setTimeout(function () { delete pend[id]; rej(new Error("timeout")); }, ms || TIMEOUT);
      pend[id] = function (r) { clearTimeout(t); res(r); };
      try { w.parent.postMessage(m, "*"); } catch (e) { clearTimeout(t); delete pend[id]; rej(e); }
    });
  }
  function fire(list) { list.forEach(function (f) { try { f(); } catch (e) { console.error(e); } }); }
  function doPause() { if (!paused) { paused = true; fire(pauseCb); } }
  function doResume() { if (paused) { paused = false; fire(resumeCb); } }
  function flush() {
    clearTimeout(saveT);
    if (env === "untils") send("save", { data: data }).catch(noop);
    else { try { w.localStorage.setItem(OFF, JSON.stringify(data)); } catch (e) {} }
  }
  function persist() { clearTimeout(saveT); saveT = setTimeout(flush, 150); }
  function info() { return { env: env, isMobile: mobile, player: player, version: VERSION }; }
  function need(n) { if (!ready) { warn("Call Untils.init() first, before Untils." + n + "()."); return false; } return true; }
  function evt(type, state) { if (ready && env === "untils") send(type, { state: state }).catch(noop); }

  w.addEventListener("message", function (e) {
    var m = e.data;
    if (!m || m.untils !== 1 || e.source !== w.parent) return;
    if (m.ev === "pause") { doPause(); return; }
    if (m.ev === "resume") { doResume(); return; }
    if (m.id && pend[m.id]) { var f = pend[m.id]; delete pend[m.id]; f(m); }
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden) doPause(); else doResume(); });
  w.addEventListener("pagehide", function () { if (ready) flush(); });

  w.Untils = {
    version: VERSION,
    adsAvailable: false,
    get env() { return env; },
    get isMobile() { return mobile; },
    get isReady() { return ready; },

    /* 1. Always call first. Resolves with { env, isMobile, player, version }. Never rejects. */
    init: function () {
      if (ready) return Promise.resolve(info());
      var p = inFrame() ? send("init", {}).then(function (r) {
        if (!r || !r.ok || !r.data) throw new Error("bad reply");
        env = "untils"; data = r.data.data || {}; player = r.data.player || player;
        if (r.data.mobile != null) mobile = !!r.data.mobile;
      }) : Promise.reject(new Error("standalone"));
      return p.catch(function () {
        env = "offline";
        try { data = JSON.parse(w.localStorage.getItem(OFF) || "{}") || {}; } catch (e) { data = {}; }
      }).then(function () { ready = true; return info(); });
    },

    /* 2. Loading and gameplay state */
    loadingStart: function () { evt("loading", "start"); },
    loadingFinished: function () { evt("loading", "finished"); },
    gameplayStart: function () { evt("gameplay", "start"); },
    gameplayStop: function () { evt("gameplay", "stop"); },

    /* 3. Save data (any JSON value) */
    save: function (key, value) {
      if (!need("save")) return Promise.resolve(false);
      if (typeof key !== "string" || !key) { warn("save(key, value): key must be a non-empty string."); return Promise.resolve(false); }
      try { data[key] = JSON.parse(JSON.stringify(value === undefined ? null : value)); } catch (e) { warn("save(): value must be JSON-safe."); return Promise.resolve(false); }
      persist(); return Promise.resolve(true);
    },
    load: function (key, fallback) {
      if (!need("load")) return Promise.resolve(fallback);
      return Promise.resolve(Object.prototype.hasOwnProperty.call(data, key) ? data[key] : fallback);
    },
    remove: function (key) { if (!need("remove")) return Promise.resolve(false); delete data[key]; persist(); return Promise.resolve(true); },
    clearSave: function () { if (!need("clearSave")) return Promise.resolve(false); data = {}; persist(); return Promise.resolve(true); },

    /* 4. Pause / resume (tab hidden, app switched) */
    onPause: function (fn) { if (typeof fn === "function") pauseCb.push(fn); },
    onResume: function (fn) { if (typeof fn === "function") resumeCb.push(fn); },

    /* 5. Ads: not live yet. interstitial resolves true (continue), rewarded resolves false (no reward). */
    showAd: function (type) {
      if (type !== "interstitial" && type !== "rewarded") { warn('showAd("interstitial" | "rewarded")'); return Promise.resolve(false); }
      var free = type === "interstitial";
      if (!ready || env !== "untils") return Promise.resolve(free);
      return send("ad", { kind: type }, 60000).then(function (r) {
        var d = (r && r.data) || {};
        return type === "rewarded" ? d.rewarded === true : true;
      }).catch(function () { return free; });
    },

    /* 6. Player and leaderboards: guest only for now */
    getPlayer: function () { return Promise.resolve({ guest: player.guest !== false, name: player.name || "Guest" }); },
    submitScore: function (board, score) {
      if (!ready || env !== "untils") return Promise.resolve(false);
      return send("score", { board: String(board), score: Number(score) }).then(function (r) { return !!(r && r.data && r.data.saved); }).catch(function () { return false; });
    }
  };
})(window);
