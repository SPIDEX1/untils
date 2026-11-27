/* shared footer: the link of the page you are already on is hidden (Games column always stays) */
(function () {
  function norm(p) { return p.replace(/index\.html$/, "").replace(/\/+$/, "") || "/"; }
  function sync() {
    var p = norm(location.pathname);
    if (location.hostname === "developer.untils.in") p = "/developers" + (p === "/" ? "" : p); /* developer pages live at the root of the subdomain */
    var dev = /^\/developers(\/|$)/.test(p) && p !== "/developers/docs";
    [].forEach.call(document.querySelectorAll("footer.sf .sf-c a[href]"), function (a) {
      var h = a.getAttribute("href"); if (h.charAt(0) !== "/") return;
      var t = norm(h), hide = false;
      if (t === "/games") hide = false;
      else if (t === "/developers") hide = dev;
      else hide = (t === p);
      a.style.display = hide ? "none" : "";
    });
  }
  window.sfSync = sync; sync();
})();

/* ===== language button (footer, next to the logo) =====
   Translation is done by Google Translate. Its script is loaded ONLY after a visitor picks a language other than English,
   so English visitors load nothing extra. The choice is kept in the "googtrans" cookie (shared with developer.untils.in).
   Flags are small pictures from flagcdn.com, because Windows cannot show flag emoji. */
(function () {
  /* code | name in its own language | English name | flag (country code) */
  var RAW = ["en|English|English|gb", "hi|हिन्दी|Hindi|in", "bn|বাংলা|Bengali|bd", "ta|தமிழ்|Tamil|in", "te|తెలుగు|Telugu|in", "mr|मराठी|Marathi|in", "gu|ગુજરાતી|Gujarati|in", "kn|ಕನ್ನಡ|Kannada|in", "ml|മലയാളം|Malayalam|in", "pa|ਪੰਜਾਬੀ|Punjabi|in", "ur|اردو|Urdu|pk",
    "af|Afrikaans|Afrikaans|za", "sq|Shqip|Albanian|al", "am|አማርኛ|Amharic|et", "ar|العربية|Arabic|sa", "hy|Հայերեն|Armenian|am", "az|Azərbaycan|Azerbaijani|az", "eu|Euskara|Basque|es", "be|Беларуская|Belarusian|by", "bs|Bosanski|Bosnian|ba", "bg|Български|Bulgarian|bg", "my|မြန်မာ|Burmese|mm", "ca|Català|Catalan|es", "ceb|Cebuano|Cebuano|ph", "ny|Chichewa|Chichewa|mw",
    "zh-CN|简体中文|Chinese (Simplified)|cn", "zh-TW|繁體中文|Chinese (Traditional)|tw", "co|Corsu|Corsican|fr", "hr|Hrvatski|Croatian|hr", "cs|Čeština|Czech|cz", "da|Dansk|Danish|dk", "nl|Nederlands|Dutch|nl", "eo|Esperanto|Esperanto|un", "et|Eesti|Estonian|ee", "tl|Filipino|Filipino|ph", "fi|Suomi|Finnish|fi", "fr|Français|French|fr", "fy|Frysk|Frisian|nl", "gl|Galego|Galician|es", "ka|ქართული|Georgian|ge", "de|Deutsch|German|de", "el|Ελληνικά|Greek|gr",
    "ht|Kreyòl Ayisyen|Haitian Creole|ht", "ha|Hausa|Hausa|ng", "haw|ʻŌlelo Hawaiʻi|Hawaiian|us", "iw|עברית|Hebrew|il", "hmn|Hmoob|Hmong|la", "hu|Magyar|Hungarian|hu", "is|Íslenska|Icelandic|is", "ig|Igbo|Igbo|ng", "id|Bahasa Indonesia|Indonesian|id", "ga|Gaeilge|Irish|ie", "it|Italiano|Italian|it", "ja|日本語|Japanese|jp", "jw|Basa Jawa|Javanese|id", "kk|Қазақша|Kazakh|kz", "km|ខ្មែរ|Khmer|kh", "rw|Kinyarwanda|Kinyarwanda|rw", "ko|한국어|Korean|kr", "ku|Kurdî|Kurdish|iq", "ky|Кыргызча|Kyrgyz|kg",
    "lo|ລາວ|Lao|la", "la|Latina|Latin|va", "lv|Latviešu|Latvian|lv", "lt|Lietuvių|Lithuanian|lt", "lb|Lëtzebuergesch|Luxembourgish|lu", "mk|Македонски|Macedonian|mk", "mg|Malagasy|Malagasy|mg", "ms|Bahasa Melayu|Malay|my", "mt|Malti|Maltese|mt", "mi|Māori|Maori|nz", "mn|Монгол|Mongolian|mn", "ne|नेपाली|Nepali|np", "no|Norsk|Norwegian|no", "or|ଓଡ଼ିଆ|Odia|in", "ps|پښتو|Pashto|af", "fa|فارسی|Persian|ir", "pl|Polski|Polish|pl", "pt|Português|Portuguese|pt", "ro|Română|Romanian|ro", "ru|Русский|Russian|ru",
    "sm|Gagana Samoa|Samoan|ws", "gd|Gàidhlig|Scots Gaelic|gb", "sr|Српски|Serbian|rs", "st|Sesotho|Sesotho|ls", "sn|chiShona|Shona|zw", "sd|سنڌي|Sindhi|pk", "si|සිංහල|Sinhala|lk", "sk|Slovenčina|Slovak|sk", "sl|Slovenščina|Slovenian|si", "so|Soomaali|Somali|so", "es|Español|Spanish|es", "su|Basa Sunda|Sundanese|id", "sw|Kiswahili|Swahili|ke", "sv|Svenska|Swedish|se", "tg|Тоҷикӣ|Tajik|tj", "tt|Татарча|Tatar|ru", "th|ไทย|Thai|th", "tr|Türkçe|Turkish|tr", "tk|Türkmençe|Turkmen|tm", "uk|Українська|Ukrainian|ua", "ug|ئۇيغۇرچە|Uyghur|cn", "uz|Oʻzbek|Uzbek|uz", "vi|Tiếng Việt|Vietnamese|vn", "cy|Cymraeg|Welsh|gb", "xh|isiXhosa|Xhosa|za", "yi|ייִדיש|Yiddish|il", "yo|Yorùbá|Yoruba|ng", "zu|isiZulu|Zulu|za"];
  window.UntilsLangCount = RAW.length; /* the About page shows this number */
  var PIN = 11, LIST = RAW.map(function (r) { var a = r.split("|"); return { c: a[0], n: a[1], e: a[2], f: a[3] }; });
  LIST = LIST.slice(0, PIN).concat(LIST.slice(PIN).sort(function (a, b) { return a.e.localeCompare(b.e); }));
  var byCode = {}; LIST.forEach(function (l) { byCode[l.c] = l; });
  window.sfLang = { list: LIST };

  var p = location.pathname.replace(/^\/developers/, "");
  var APP = /^\/(dashboard|account|inspector)(\/|$)/.test(p) || /^\/admin(\/|$)/.test(location.pathname); /* forms and tools are never translated */
  function cur() { var m = /(?:^|;\s*)googtrans=\/[^/;]*\/([^;]+)/.exec(document.cookie || ""); var c = m ? decodeURIComponent(m[1]) : "en"; return byCode[c] ? c : "en"; }
  function ck(v, age, dom) { document.cookie = "googtrans=" + v + "; path=/" + (dom ? "; domain=" + dom : "") + "; max-age=" + age + "; SameSite=Lax"; }
  function setLang(code) {
    var doms = [""]; if (/(^|\.)untils\.in$/.test(location.hostname)) doms.push(".untils.in");
    doms.forEach(function (d) { ck("", 0, d); });
    if (code !== "en") doms.forEach(function (d) { ck("/en/" + code, 31536000, d); });
    location.reload();
  }
  var flag = function (f, w, h) { return '<img src="https://flagcdn.com/' + w + "x" + h + "/" + f + '.png" srcset="https://flagcdn.com/' + w * 2 + "x" + h * 2 + "/" + f + '.png 2x" width="' + w + '" height="' + h + '" alt="" loading="lazy">'; };

  /* Google Translate is loaded only when a language other than English is chosen */
  var now = cur();
  if (now !== "en" && !APP) {
    var box = document.createElement("div"); box.id = "gt_el"; box.style.display = "none"; box.setAttribute("translate", "no"); document.body.appendChild(box);
    window.googleTranslateElementInit = function () { new google.translate.TranslateElement({ pageLanguage: "en", includedLanguages: LIST.map(function (l) { return l.c; }).join(","), autoDisplay: false }, "gt_el"); };
    var sc = document.createElement("script"); sc.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"; sc.async = true; document.head.appendChild(sc);
  }

  var brand = document.querySelector("footer.sf .sf-brand");
  var css = document.createElement("style");
  css.textContent = ".skiptranslate>iframe,.goog-te-banner-frame,#goog-gt-tt,.goog-te-balloon-frame{display:none!important}body{top:0!important}.goog-text-highlight{background:none!important;box-shadow:none!important}" +
    ".lg-btn{display:inline-flex;align-items:center;gap:8px;background:#fff;color:#12233d;border:2px solid #cfe6ff;border-radius:99px;padding:7px 14px 7px 10px;font:700 14px var(--fh,inherit);cursor:pointer;box-shadow:var(--sh,none);transition:transform .15s,border-color .15s}.lg-btn:hover{border-color:#0a6cff;transform:translateY(-2px)}.lg-btn img{width:24px;height:18px;border-radius:3px;object-fit:cover;flex:none;box-shadow:0 0 0 1px rgba(0,0,0,.12)}.lg-btn svg{width:14px;height:14px;flex:none}" +
    ".lg-ov{position:fixed;inset:0;background:rgba(10,20,40,.55);z-index:99999;display:flex;align-items:center;justify-content:center;padding:14px}.lg-box{background:#fff;color:#12233d;border-radius:22px;width:min(800px,100%);max-height:86vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.35);overflow:hidden;font-family:var(--fb,inherit)}" +
    ".lg-hd{display:flex;align-items:center;gap:10px;padding:16px 18px 10px}.lg-hd h3{margin:0;font:800 20px var(--fh,inherit);flex:1}.lg-x{border:0;background:#eaf6ff;color:#12233d;width:36px;height:36px;border-radius:50%;font-size:22px;line-height:1;cursor:pointer}" +
    ".lg-q{margin:0 18px 10px;padding:11px 14px;border:2px solid #cfe6ff;border-radius:12px;font:600 15px inherit;outline:none;color:#12233d;background:#fff}.lg-q:focus{border-color:#0a6cff}" +
    ".lg-gr{overflow:auto;padding:4px 14px 18px;display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px}.lg-it{display:flex;align-items:center;gap:10px;text-align:left;background:#f4f9ff;border:2px solid transparent;border-radius:12px;padding:9px 12px;cursor:pointer;font:inherit;color:inherit}.lg-it:hover{border-color:#0a6cff}.lg-it.on{background:#0a6cff;color:#fff}" +
    ".lg-it b{display:block;font-size:15px;line-height:1.2}.lg-it small{opacity:.7;font-size:12px}.lg-it img{width:28px;height:21px;border-radius:3px;object-fit:cover;flex:none;box-shadow:0 0 0 1px rgba(0,0,0,.12)}.lg-no{padding:20px;text-align:center;color:#51617a;grid-column:1/-1}" +
    "@media(max-width:560px){.lg-gr{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}}@media(min-width:901px){.lg-btn{order:3}}";
  document.head.appendChild(css);
  if (!brand || APP) return;

  var me = byCode[now], btn = document.createElement("button");
  btn.type = "button"; btn.className = "lg-btn notranslate"; btn.setAttribute("translate", "no"); btn.setAttribute("aria-label", "Change language");
  btn.innerHTML = flag(me.f, 24, 18) + "<span>" + me.n + '</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var logo = brand.querySelector(".ab-logo"); if (logo) logo.insertAdjacentElement("afterend", btn); else brand.insertBefore(btn, brand.firstChild);

  function open() {
    var ov = document.createElement("div"); ov.className = "lg-ov notranslate"; ov.setAttribute("translate", "no");
    ov.innerHTML = '<div class="lg-box" role="dialog" aria-modal="true" aria-label="Choose your language"><div class="lg-hd"><h3>Choose your language</h3><button type="button" class="lg-x" aria-label="Close">&times;</button></div><input class="lg-q" type="search" placeholder="Search language..." aria-label="Search language" autocomplete="off"><div class="lg-gr"></div></div>';
    var gr = ov.querySelector(".lg-gr"), q = ov.querySelector(".lg-q"), prev = document.body.style.overflow;
    function close() { document.body.style.overflow = prev; document.removeEventListener("keydown", key); ov.remove(); btn.focus(); }
    function key(e) { if (e.key === "Escape") close(); }
    function draw(t) {
      t = (t || "").trim().toLowerCase(); gr.innerHTML = "";
      var rows = LIST.filter(function (l) { return !t || l.n.toLowerCase().indexOf(t) > -1 || l.e.toLowerCase().indexOf(t) > -1 || l.c.toLowerCase() === t; });
      if (!rows.length) { gr.innerHTML = '<div class="lg-no">No language found.</div>'; return; }
      rows.forEach(function (l) {
        var b = document.createElement("button"); b.type = "button"; b.className = "lg-it" + (l.c === now ? " on" : "");
        b.innerHTML = flag(l.f, 28, 21) + "<span><b>" + l.n + "</b><small>" + l.e + "</small></span>";
        b.onclick = function () { if (l.c === now) return close(); setLang(l.c); };
        gr.appendChild(b);
      });
    }
    ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
    ov.querySelector(".lg-x").onclick = close; q.oninput = function () { draw(q.value); }; document.addEventListener("keydown", key);
    draw(""); document.body.appendChild(ov); document.body.style.overflow = "hidden"; q.focus();
  }
  btn.onclick = open;
})();
