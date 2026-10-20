import { SUPA } from "./_lib.js";
const MT = { html: "text/html; charset=utf-8", js: "text/javascript", mjs: "text/javascript", css: "text/css", json: "application/json", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml", mp3: "audio/mpeg", ogg: "audio/ogg", wav: "audio/wav", woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf", wasm: "application/wasm", txt: "text/plain", ico: "image/x-icon" };
/* sandbox me localStorage block hota hai, isliye memory wala shim */
const SHIM = '<script>try{localStorage.length}catch(e){var m=function(){var d={};return{getItem:function(k){return k in d?d[k]:null},setItem:function(k,v){d[k]=String(v)},removeItem:function(k){delete d[k]},clear:function(){d={}},key:function(i){return Object.keys(d)[i]||null},get length(){return Object.keys(d).length}}};try{Object.defineProperty(window,"localStorage",{value:m()});Object.defineProperty(window,"sessionStorage",{value:m()})}catch(x){}}</script>';
async function inflate(u) { return new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer()); }
function entries(b) {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let e = b.length - 22; while (e >= 0 && v.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) return null;
  const n = v.getUint16(e + 10, true); let p = v.getUint32(e + 16, true); const out = {};
  for (let k = 0; k < n && v.getUint32(p, true) === 0x02014b50; k++) {
    const nl = v.getUint16(p + 28, true), el = v.getUint16(p + 30, true), cl = v.getUint16(p + 32, true);
    out[new TextDecoder().decode(b.subarray(p + 46, p + 46 + nl))] = { m: v.getUint16(p + 10, true), c: v.getUint32(p + 20, true), o: v.getUint32(p + 42, true) };
    p += 46 + nl + el + cl;
  }
  return out;
}
function read(b, e) {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength), s = e.o + 30 + v.getUint16(e.o + 26, true) + v.getUint16(e.o + 28, true);
  const d = b.subarray(s, s + e.c); return e.m === 0 ? d : inflate(d);
}
export async function serve(env, o, i, rest) {
  const ck = new Request("https://zipcache.invalid/" + o + "/" + i), cache = caches.default;
  let buf, hit = await cache.match(ck);
  if (hit) buf = await hit.arrayBuffer();
  else {
    const r = await fetch(SUPA + "/storage/v1/object/game-zips/" + o + "/" + i + ".zip", { headers: { apikey: env.SUPABASE_SERVICE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_KEY } });
    if (!r.ok) return new Response("Game file not found", { status: 404 });
    buf = await r.arrayBuffer();
    await cache.put(ck, new Response(buf, { headers: { "Cache-Control": "max-age=3600" } }));
  }
  const b = new Uint8Array(buf), en = entries(b);
  if (!en) return new Response("Not a valid zip", { status: 422 });
  let f = rest.join("/") || "index.html"; if (f.endsWith("/")) f += "index.html";
  let pre = ""; if (!en["index.html"]) { const k = Object.keys(en).find(n => /^[^/]+\/index\.html$/.test(n)); if (k) pre = k.split("/")[0] + "/"; }
  const e = en[pre + f]; if (!e) return new Response("File not found in zip", { status: 404 });
  const d = await read(b, e), ext = f.split(".").pop().toLowerCase();
  const h = { "Content-Type": MT[ext] || "application/octet-stream", "Content-Security-Policy": "sandbox allow-scripts allow-popups allow-pointer-lock", "Access-Control-Allow-Origin": "*", "Cache-Control": "private, max-age=300", "X-Content-Type-Options": "nosniff" };
  if (ext === "html") { let t = new TextDecoder().decode(d); t = /<head[^>]*>/i.test(t) ? t.replace(/<head[^>]*>/i, m => m + SHIM) : SHIM + t; return new Response(t, { headers: h }); }
  return new Response(d, { headers: h });
}
