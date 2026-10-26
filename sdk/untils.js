/*! HTML SDK (untils.js) v1.2.0 | Docs: /developers/docs/ */
(function (w) {
  "use strict";
  var NAME = "HTML SDK", VERSION = "1.2.0", TIMEOUT = 3000, OFF = "untils_sdk_offline", MAXSAVE = 900000;
  var env = "none", ready = false, data = {}, player = { guest: true, name: "Guest" }, debug = false, ctx = { url: "", params: "" };
  var mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 820);
  var pend = {}, seq = 0, pauseCb = [], resumeCb = [], paused = false, saveT = 0, loading = false, playing = false;

  function log() { if (debug) { try { console.log.apply(console, ["[Untils]"].concat([].slice.call(arguments))); } catch (e) {} } }
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
  function evt(type, extra) { log(type, extra || ""); if (ready && env === "untils") send(type, extra || {}).catch(noop); }
  function flush() {
    clearTimeout(saveT);
    if (env === "untils") send("save", { data: data }).catch(noop);
    else { try { w.localStorage.setItem(OFF, JSON.stringify(data)); } catch (e) {} }
  }
  function persist() { clearTimeout(saveT); saveT = setTimeout(flush, 150); }
  function info() { return { name: NAME, version: VERSION, env: env, isMobile: mobile, player: player, language: lang() }; }
  function lang() { return String((navigator.language || "en")).slice(0, 2).toLowerCase(); }
  function need(n) { if (!ready) { warn("Call Untils.init() first, before Untils." + n + "()."); return false; } return true; }
  function doPause() {
    if (paused) return;
    paused = true;
    if (playing) { playing = false; evt("gameplay", { state: "stop", auto: true }); }
    fire(pauseCb);
  }
  function doResume() { if (paused) { paused = false; fire(resumeCb); } }
  function params() { try { return new URLSearchParams(env === "untils" ? ctx.params : w.location.search); } catch (e) { return new URLSearchParams(""); } }

  w.addEventListener("message", function (e) {
    var m = e.data;
    if (!m || m.untils !== 1 || e.source !== w.parent) return;
    if (m.ev === "pause") { doPause(); return; }
    if (m.ev === "resume") { doResume(); return; }
    if (m.id && pend[m.id]) { var f = pend[m.id]; delete pend[m.id]; f(m); }
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden) doPause(); else doResume(); });
  w.addEventListener("pagehide", function () { if (ready) flush(); });
  var errN = 0;
  w.addEventListener("error", function (e) {
    if (ready && env === "untils" && errN++ < 20) evt("error", { message: String((e && e.message) || "error").slice(0, 200), source: String((e && e.filename) || "").slice(-80), line: (e && e.lineno) || 0 });
  });
  w.addEventListener("unhandledrejection", function (e) {
    var r = e && e.reason;
    if (ready && env === "untils" && errN++ < 20) evt("error", { message: ("Unhandled promise: " + String((r && r.message) || r)).slice(0, 200) });
  });

  w.Untils = {
    sdkName: NAME,
    version: VERSION,
    adsAvailable: false,
    get env() { return env; },
    get isMobile() { return mobile; },
    get isReady() { return ready; },

    /* Start: always call first. Resolves with { name, version, env, isMobile, player, language }. Never rejects. */
    init: function (opts) {
      if (opts && opts.debug) debug = true;
      if (ready) return Promise.resolve(info());
      var p = inFrame() ? send("init", { sdk: NAME, sdkVersion: VERSION, via: (opts && opts.via) || "" }).then(function (r) {
        if (!r || !r.ok || !r.data) throw new Error("bad reply");
        env = "untils"; data = r.data.data || {}; player = r.data.player || player;
        ctx = { url: r.data.url || "", params: r.data.params || "" };
        if (r.data.mobile != null) mobile = !!r.data.mobile;
      }) : Promise.reject(new Error("standalone"));
      return p.catch(function () {
        env = "offline";
        try { data = JSON.parse(w.localStorage.getItem(OFF) || "{}") || {}; } catch (e) { data = {}; }
      }).then(function () { ready = true; log("ready", info()); return info(); });
    },
    setDebug: function (on) { debug = !!on; },

    /* Used by engine plugins (for example Untils SDK Unity) to tell UNTILS which plugin is running. */
    announce: function (name, version) { if (ready && env === "untils") send("announce", { name: String(name), version: String(version) }).catch(noop); },

    /* Loading and gameplay state */
    loadingStart: function () { if (!need("loadingStart") || loading) return; loading = true; evt("loading", { state: "start" }); },
    loadingFinished: function () { if (!need("loadingFinished") || !loading) return; loading = false; evt("loading", { state: "finished" }); },
    gameplayStart: function () { if (!need("gameplayStart") || playing) return; playing = true; evt("gameplay", { state: "start" }); },
    gameplayStop: function () { if (!need("gameplayStop") || !playing) return; playing = false; evt("gameplay", { state: "stop" }); },

    /* Save data: any JSON value. About 900 KB total per game. */
    save: function (key, value) {
      if (!need("save")) return Promise.resolve(false);
      if (typeof key !== "string" || !key) { warn("save(key, value): key must be a non-empty string."); return Promise.resolve(false); }
      var had = Object.prototype.hasOwnProperty.call(data, key), prev = data[key];
      try { data[key] = JSON.parse(JSON.stringify(value === undefined ? null : value)); } catch (e) { warn("save(): value must be JSON-safe."); return Promise.resolve(false); }
      if (JSON.stringify(data).length > MAXSAVE) {
        if (had) data[key] = prev; else delete data[key];
        warn("save(): too much data (limit about 900 KB per game). Nothing was saved for \"" + key + "\".");
        return Promise.resolve(false);
      }
      persist(); return Promise.resolve(true);
    },
    load: function (key, fallback) {
      if (!need("load")) return Promise.resolve(fallback);
      return Promise.resolve(Object.prototype.hasOwnProperty.call(data, key) ? data[key] : fallback);
    },
    remove: function (key) { if (!need("remove")) return Promise.resolve(false); delete data[key]; persist(); return Promise.resolve(true); },
    clearSave: function () { if (!need("clearSave")) return Promise.resolve(false); data = {}; persist(); return Promise.resolve(true); },
    keys: function () { return need("keys") ? Object.keys(data) : []; },

    /* Pause / resume (tab hidden, app switched). gameplayStop is sent for you when the tab is hidden. */
    onPause: function (fn) { if (typeof fn === "function") pauseCb.push(fn); },
    onResume: function (fn) { if (typeof fn === "function") resumeCb.push(fn); },

    /* Player and device */
    getPlayer: function () { return Promise.resolve({ guest: player.guest !== false, name: player.name || "Guest" }); },
    getLanguage: function () { return lang(); },

    /* Share links: shareableURL({level: 5}) gives a link; the game reads it with getURLParam("level") */
    shareableURL: function (obj) {
      var base = (env === "untils" && ctx.url) || (w.location.origin + w.location.pathname), q = [], k;
      for (k in (obj || {})) if (Object.prototype.hasOwnProperty.call(obj, k)) q.push("u_" + encodeURIComponent(k) + "=" + encodeURIComponent(String(obj[k])));
      return base + (q.length ? "?" + q.join("&") : "");
    },
    getURLParam: function (name) { var v = params().get("u_" + name); return v === null ? undefined : v; },

    /* Screen */
    requestFullscreen: function () { if (need("requestFullscreen")) evt("fullscreen", { state: true }); },
    exitFullscreen: function () { if (need("exitFullscreen")) evt("fullscreen", { state: false }); },

    /* Your own events for stats: track("level_complete", { level: 3 }). Collected by UNTILS later. */
    track: function (name, extra) {
      if (!need("track")) return;
      if (typeof name !== "string" || !name || name.length > 40) { warn("track(name, data): name must be a string up to 40 characters."); return; }
      evt("track", { name: name, data: extra === undefined ? null : extra });
    },

    /* Ads: not live yet. Interstitial resolves true (continue), rewarded resolves false (no reward). */
    showAd: function (type) {
      if (type !== "interstitial" && type !== "rewarded") { warn('showAd("interstitial" | "rewarded")'); return Promise.resolve(false); }
      var free = type === "interstitial";
      if (!ready || env !== "untils") return Promise.resolve(free);
      return send("ad", { kind: type }, 60000).then(function (r) {
        var d = (r && r.data) || {};
        return type === "rewarded" ? d.rewarded === true : true;
      }).catch(function () { return free; });
    },
    commercialBreak: function () { return this.showAd("interstitial"); },
    rewardedBreak: function () { return this.showAd("rewarded"); },

    /* Leaderboards: coming with player login. Safe to call now. */
    submitScore: function (board, score) {
      if (!ready || env !== "untils") return Promise.resolve(false);
      return send("score", { board: String(board), score: Number(score) }).then(function (r) { return !!(r && r.data && r.data.saved); }).catch(function () { return false; });
    }
  };
})(window);
