/* AdSense helpers. Nothing is shown until ADSENSE_PUB is set in Cloudflare Pages -> Settings -> Variables. */
export function pubOf(env) {
  const v = String((env && env.ADSENSE_PUB) || "").trim().replace(/^ca-/i, "");
  return /^pub-\d{10,20}$/.test(v) ? v : "";
}
export function adsHead(env) {
  const pub = pubOf(env); if (!pub) return "";
  const h5 = String(env.ADSENSE_H5 || "") === "1", test = String(env.ADSENSE_TEST || "") === "1";
  return '<script>window.UNTILS_ADS=' + JSON.stringify({ pub: "ca-" + pub, h5: h5, test: test }) + ';</script>' +
    '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-' + pub + '"' + (h5 && test ? ' data-adbreak-test="on"' : "") + ' crossorigin="anonymous"></script>' +
    (h5 ? '<script>window.adsbygoogle=window.adsbygoogle||[];window.adBreak=window.adConfig=function(o){adsbygoogle.push(o)};</script>' : "");
}
