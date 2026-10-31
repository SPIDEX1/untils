/* Leader only: add, replace or remove the documentation demo files.
   GET            -> current demos and limits
   PUT ?kind=...  -> raw file in the body (Content-Type = file type)
   DELETE ?kind=... */
import { J, SUPA, me } from "../../_lib.js";
const MB = 1024 * 1024;
const LIM = { icon: 2 * MB, banner: 2 * MB, thumb: 2 * MB, logo: 2 * MB, video: 20 * MB };
const KINDS = Object.keys(LIM);
const BUCKET = "docs-demo", MAX_SEC = 15;

function sniff(u) {
  const s = (a, b) => { for (let i = 0; i < b.length; i++) if (u[a + i] !== b[i]) return false; return true; };
  if (u.length > 12 && s(0, [0x89, 0x50, 0x4e, 0x47])) return { ext: "png", type: "image/png", video: false };
  if (u.length > 12 && s(0, [0xff, 0xd8, 0xff])) return { ext: "jpg", type: "image/jpeg", video: false };
  if (u.length > 12 && s(0, [0x52, 0x49, 0x46, 0x46]) && s(8, [0x57, 0x45, 0x42, 0x50])) return { ext: "webp", type: "image/webp", video: false };
  if (u.length > 12 && s(4, [0x66, 0x74, 0x79, 0x70])) return { ext: "mp4", type: "video/mp4", video: true };
  if (u.length > 12 && s(0, [0x1a, 0x45, 0xdf, 0xa3])) return { ext: "webm", type: "video/webm", video: true };
  return null;
}
/* length of an MP4 in seconds, read from its "mvhd" box. null when it cannot be read. */
function mp4Seconds(u) {
  const dv = new DataView(u.buffer, u.byteOffset, u.byteLength);
  for (let i = 4; i < u.length - 40; i++) {
    if (u[i] === 0x6d && u[i + 1] === 0x76 && u[i + 2] === 0x68 && u[i + 3] === 0x64) {
      const v = u[i + 4];
      let ts, dur;
      if (v === 1) { ts = dv.getUint32(i + 24); dur = Number(dv.getBigUint64(i + 28)); }
      else { ts = dv.getUint32(i + 16); dur = dv.getUint32(i + 20); }
      return ts > 0 ? dur / ts : null;
    }
  }
  return null;
}
const item = d => ({ url: SUPA + "/storage/v1/object/public/" + BUCKET + "/" + d.path, type: d.type, size: d.size, at: d.at, dur: d.dur || null });

async function store(env, method, path, opts) {
  return fetch(SUPA + "/storage/v1/" + path, Object.assign({ method }, opts, { headers: Object.assign({ apikey: env.SUPABASE_SERVICE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_KEY }, (opts && opts.headers) || {}) }));
}
async function upload(env, path, buf, type) {
  const run = () => store(env, "POST", "object/" + BUCKET + "/" + path, { headers: { "Content-Type": type, "x-upsert": "true" }, body: buf });
  let r = await run();
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    if (r.status === 404 || /bucket not found/i.test(t)) {
      await store(env, "POST", "bucket", { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, file_size_limit: 25 * MB }) });
      r = await run();
    }
  }
  return r.ok;
}
async function removeFile(env, path) {
  if (!path) return;
  await store(env, "DELETE", "object/" + BUCKET, { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: [path] }) }).catch(() => {});
}

export async function onRequest({ request, env }) {
  if (!env.GAMES) return J({ error: "KV GAMES missing" }, 500);
  const u = await me(request, env);
  if (!u) return J({ error: "Sign in again." }, 401);
  if (u.role !== "leader") return J({ error: "Only the leader can do this." }, 403);
  const kind = String(new URL(request.url).searchParams.get("kind") || "");

  if (request.method === "GET") {
    const items = {};
    await Promise.all(KINDS.map(async k => { const d = await env.GAMES.get("demo:" + k, "json"); if (d && d.path) items[k] = item(d); }));
    return J({ items, limits: { image: LIM.icon, video: LIM.video, seconds: MAX_SEC } });
  }
  if (KINDS.indexOf(kind) < 0) return J({ error: "Unknown demo type." }, 400);
  if (!env.SUPABASE_SERVICE_KEY) return J({ error: "SUPABASE_SERVICE_KEY not set." }, 500);
  const old = await env.GAMES.get("demo:" + kind, "json");

  if (request.method === "DELETE") {
    if (old) { await removeFile(env, old.path); await env.GAMES.delete("demo:" + kind); }
    return J({ ok: true });
  }
  if (request.method !== "PUT") return J({ error: "Use PUT or DELETE." }, 405);

  const max = LIM[kind], len = +request.headers.get("Content-Length") || 0;
  if (len > max + 2048) return J({ error: "File is too big. Maximum is " + (max / MB) + " MB." }, 413);
  const buf = await request.arrayBuffer();
  if (!buf.byteLength) return J({ error: "No file received." }, 400);
  if (buf.byteLength > max) return J({ error: "File is too big. Maximum is " + (max / MB) + " MB." }, 413);
  const bytes = new Uint8Array(buf), kindInfo = sniff(bytes);
  if (!kindInfo) return J({ error: kind === "video" ? "Use an MP4 or WebM video." : "Use a PNG, JPG or WebP image." }, 400);
  if ((kind === "video") !== kindInfo.video) return J({ error: kind === "video" ? "This is not a video. Use an MP4 or WebM file." : "This is not an image. Use a PNG, JPG or WebP file." }, 400);
  let dur = null;
  if (kind === "video") {
    dur = kindInfo.ext === "mp4" ? mp4Seconds(bytes) : (+request.headers.get("X-Duration") || null);
    if (dur != null && dur > MAX_SEC + 0.5) return J({ error: "The video is " + dur.toFixed(1) + " seconds. Maximum is " + MAX_SEC + " seconds." }, 400);
  }
  const path = kind + "-" + Date.now().toString(36) + "." + kindInfo.ext;
  if (!(await upload(env, path, buf, kindInfo.type))) return J({ error: "Could not save the file. Check SUPABASE_SERVICE_KEY." }, 502);
  const rec = { path, type: kindInfo.type, size: buf.byteLength, at: Date.now(), dur: dur };
  await env.GAMES.put("demo:" + kind, JSON.stringify(rec));
  if (old && old.path !== path) await removeFile(env, old.path);
  return J({ ok: true, item: item(rec) });
}
