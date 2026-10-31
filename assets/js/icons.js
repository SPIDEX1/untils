/* UNTILS developer portal: game-themed SVG icons (replaces emoji stickers) */
(function () {
  var P = {
    play: '<path d="M8 5.2v13.6a.6.6 0 0 0 .9.5l11-6.8a.6.6 0 0 0 0-1L8.9 4.7a.6.6 0 0 0-.9.5z" fill="currentColor"/>',
    pad: '<path d="M7 8h10a4 4 0 0 1 3.9 4.9l-.8 3.6a2.4 2.4 0 0 1-4 1.2L14 16h-4l-2.1 1.7a2.4 2.4 0 0 1-4-1.2l-.8-3.6A4 4 0 0 1 7 8z"/><path d="M8 10.5v3M6.5 12h3"/><circle cx="15.3" cy="11.2" r=".8" fill="currentColor"/><circle cx="17.3" cy="13.2" r=".8" fill="currentColor"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5M8.5 7.5h7"/>',
    scan: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4L21 21M8 10.5h5M10.5 8v5"/>',
    hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 3 6 5 9-2 3-5 4-5 9M17 3c0 5-3 6-5 9 2 3 5 4 5 9"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    "check-circle": '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.5"/>',
    "x-circle": '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    bolt: '<path d="M13 2.5L5 13.5h6.2L10.5 21.5 19 10.5h-6.2z"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.5-4M4 4v4h4M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.6 2H4.4z"/><path d="M10 21h4"/>',
    cube: '<path d="M12 3l8.5 4.5v9L12 21l-8.5-4.5v-9z"/><path d="M12 12l8.5-4.5M12 12L3.5 7.5M12 12v9"/>',
    download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
    warn: '<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.2v.1"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    desktop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>'
  };
  function svg(n) {
    return '<svg class="ic-s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || "") + "</svg>";
  }
  function ico(n) { var s = document.createElement("span"); s.className = "ic"; s.innerHTML = svg(n); return s; }
  function set(node, n, text) {
    node.textContent = "";
    if (n) node.appendChild(ico(n));
    node.appendChild(document.createTextNode(text));
    return node;
  }
  function hydrate(root) {
    [].forEach.call((root || document).querySelectorAll("i[data-ic]"), function (i) {
      var s = ico(i.getAttribute("data-ic")); i.parentNode.replaceChild(s, i);
    });
  }
  window.UI = { svg: svg, ico: ico, set: set, hydrate: hydrate };
  hydrate();
})();
