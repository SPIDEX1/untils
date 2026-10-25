/* UNTILS Inspector core: runs a game in a sandboxed frame, answers Untils SDK messages and reports what happens. */
(function (w) {
  "use strict";
  var MOB = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 820);
  function kb(s) { return (new Blob([s]).size / 1024).toFixed(1) + " KB"; }
  function short(v) { var t; try { t = JSON.stringify(v); } catch (e) { t = String(v); } return t && t.length > 120 ? t.slice(0, 117) + "..." : (t || ""); }

  w.UntilsInspect = {
    mobile: MOB,
    /* o: { id, url, container, onEvent(e), onState(st) }  returns { frame, state, stop() } */
    start: function (o) {
      var frame = document.createElement("iframe"), t0 = Date.now(), data = {}, key = "untils_inspect:" + o.id;
      var st = { init: false, via: "", sdk: "", version: "", unityName: "", unityVersion: "", loadingStart: false, loadingFinished: false, gameplayStart: false, gameplayStop: false, saves: 0, tracks: 0, ads: 0, errors: 0, ls: 0 };
      try { data = JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch (e) { data = {}; }
      function emit(kind, text) { if (o.onEvent) o.onEvent({ t: Date.now() - t0, kind: kind, text: text }); if (o.onState) o.onState(st); }
      function reply(m, ok, d) { try { frame.contentWindow.postMessage({ untils: 1, id: m.id, ok: ok, data: d }, "*"); } catch (e) {} }

      function onMsg(ev) {
        if (ev.source !== frame.contentWindow) return;
        var m = ev.data;
        if (!m) return;
        if (m.us === 1 && m.d && typeof m.d === "object") {
          st.ls++; emit("info", "localStorage saved (" + Object.keys(m.d).length + " keys, " + kb(JSON.stringify(m.d)) + ")");
          return;
        }
        if (m.untils !== 1 || !m.type) return;
        var type = m.type;
        if (type === "init") {
          st.init = true; st.via = m.via || ""; st.sdk = m.sdk || "Untils SDK"; st.version = m.sdkVersion || "";
          emit("ok", "init: " + st.sdk + (st.version ? " " + st.version : "") + (st.via ? " (started by the " + st.via + ")" : "") + " is running");
          reply(m, true, { env: "untils", mobile: MOB, player: { guest: true, name: "Guest" }, data: data, version: 1, url: location.origin + "/games/inspector/", params: "" });
        } else if (type === "announce") {
          st.unityName = m.name || ""; st.unityVersion = m.version || "";
          emit("ok", "announce: " + st.unityName + " " + st.unityVersion + " is integrated in the game");
          reply(m, true);
        } else if (type === "loading") {
          if (m.state === "start") st.loadingStart = true; else st.loadingFinished = true;
          emit("info", "loading " + (m.state === "start" ? "started" : "finished"));
          reply(m, true);
        } else if (type === "gameplay") {
          if (m.state === "start") st.gameplayStart = true; else st.gameplayStop = true;
          emit("info", "gameplay " + (m.state === "start" ? "started" : "stopped") + (m.auto ? " (automatic: tab was hidden)" : ""));
          reply(m, true);
        } else if (type === "save") {
          data = m.data || {}; st.saves++;
          try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
          emit("info", "save: " + Object.keys(data).length + " key(s), " + kb(JSON.stringify(data)) + " (kept in this browser only)");
          reply(m, true);
        } else if (type === "track") {
          st.tracks++; emit("info", "track: " + m.name + " " + short(m.data)); reply(m, true);
        } else if (type === "ad") {
          st.ads++; emit("warn", "ad requested: " + m.kind + " (ads are not live yet" + (m.kind === "rewarded" ? ", so no reward is given" : ", the game continues") + ")");
          reply(m, true, { shown: false, rewarded: false });
        } else if (type === "score") {
          emit("warn", "score submitted: " + m.board + " = " + m.score + " (leaderboards are not live yet)");
          reply(m, true, { saved: false });
        } else if (type === "fullscreen") {
          emit("info", "fullscreen " + (m.state ? "requested" : "exit requested")); reply(m, true);
        } else if (type === "error") {
          st.errors++; emit("err", "game error: " + m.message + (m.line ? " (line " + m.line + ")" : "")); reply(m, true);
        } else {
          emit("info", "message: " + type); reply(m, true);
        }
      }
      function onVis() { try { frame.contentWindow.postMessage({ untils: 1, ev: document.hidden ? "pause" : "resume" }, "*"); } catch (e) {} emit("info", document.hidden ? "tab hidden: pause sent to the game" : "tab visible: resume sent to the game"); }

      frame.setAttribute("sandbox", "allow-scripts allow-popups allow-pointer-lock");
      frame.setAttribute("allow", "fullscreen; autoplay; gamepad");
      frame.setAttribute("allowfullscreen", "");
      frame.style.cssText = "width:100%;height:100%;border:0;background:#000";
      w.addEventListener("message", onMsg);
      document.addEventListener("visibilitychange", onVis);
      frame.src = o.url;
      o.container.appendChild(frame);
      emit("info", "game started");
      return {
        frame: frame, state: st,
        stop: function () { w.removeEventListener("message", onMsg); document.removeEventListener("visibilitychange", onVis); if (frame.parentNode) frame.parentNode.removeChild(frame); }
      };
    }
  };
})(window);
