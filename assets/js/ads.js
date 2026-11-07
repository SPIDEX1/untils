/* UNTILS ads for games: interstitial ("commercial break") and rewarded ads through Google's Ad Placement API (H5 Games Ads).
   Switched on from Cloudflare (ADSENSE_PUB + ADSENSE_H5=1). While off, every request answers "no ad" at once, so games keep working. */
(function () {
  var C = window.UNTILS_ADS || null, on = !!(C && C.h5 && window.adBreak), busy = false;
  function frame() { return document.getElementById("gf"); }
  function post(ev) { var f = frame(); try { if (f && f.contentWindow) f.contentWindow.postMessage({ untils: 1, ev: ev }, "*"); } catch (e) {} }
  /* ads cannot draw on top of a native full-screen game, so step out of full screen right before an ad really shows */
  function leaveFs() { try { if (typeof nativeFs === "function" && nativeFs() && typeof exitFs === "function") exitFs(); } catch (e) {} }
  if (on) { try { window.adConfig({ preloadAdBreaks: "on", sound: "on" }); } catch (e) {} }

  function show(kind) {
    return new Promise(function (res) {
      if (!on || busy) { res({ shown: false, rewarded: false }); return; }
      busy = true;
      var done = false, shown = false, rewarded = false, paused = false, tm;
      function end() {
        if (done) return; done = true; clearTimeout(tm); busy = false;
        var f = frame();
        if (paused && f && !f.classList.contains("gp")) post("resume");   /* a game that was held by leaving full screen stays held until CONTINUE */
        res({ shown: shown, rewarded: rewarded });
      }
      tm = setTimeout(end, 50000);
      function before() { paused = true; post("pause"); leaveFs(); }
      try {
        if (kind === "rewarded") {
          window.adBreak({
            type: "reward", name: "untils-reward",
            beforeAd: before, afterAd: function () {},
            beforeReward: function (showAd) { leaveFs(); setTimeout(function () { try { showAd(); } catch (e) { end(); } }, 250); },
            adViewed: function () { shown = true; rewarded = true; },
            adDismissed: function () { shown = true; },
            adBreakDone: end
          });
        } else {
          window.adBreak({ type: "next", name: "untils-next", beforeAd: before, afterAd: function () { shown = true; }, adBreakDone: end });
        }
      } catch (e) { end(); }
    });
  }
  window.UntilsAds = { on: on, show: show };
})();
