/* Leader only: "Game Art" sections shown in the documentation (2D Art and 3D Art Style).
   GET                           -> both groups
   PUT ?group=2d|3d  (X-Name)    -> raw image in the body, adds a new section
   DELETE ?group=2d|3d&id=...    -> removes one section */
import { J, SUPA, me, unlocked, rnd } from "../../_lib.js";
const MB = 1024 * 1024, MAX_IMG = 3 * MB, MAX_SEC = 12, BUCKET = "docs-demo", GROUPS = ["2d", "3d"];

function sniff(u) {
  const s = (a, b) => { for (let i = 0; i < b.length; i++) if (u[a + i] !== b[i]) return false; return true; };
  if (u.length > 12 && s(0, [0x89, 0x50, 0x4e, 0x47])) return { ext: "png", type: "image/png" };
  if (u.length > 12 && s(0, [0xff, 0xd8, 0xff])) return { ext: "jpg", type: "image/jpeg" };
  if (u.length > 12 && s(0, [0x52, 0x49, 0x46, 0x46]) && s(8, [0x57, 0x45, 0x42, 0x50])) return { ext: "webp", type: "image/webp" };
  return null;
}
const item = d => ({ id: d.id, name: d.name, url: SUPA + "/storage/v1/object/public/" + BUCKET + "/" + d.path, path: d.path, size: d.size, at: d.at });
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
const get = async (env, g) => ((await env.GAMES.get("art:" + g, "json")) || { list: [] }).list || [];

export async function onRequest({ request, env }) {
  if (!env.GAMES) return J({ error: "KV GAMES missing" }, 500);
  const u = await me(request, env);
  if (!u) return J({ error: "Sign in again." }, 401);
  if (u.role !== "leader") return J({ error: "Only the leader can do this." }, 403);
  if (!(await unlocked(request, env, u))) return J({ error: "Enter the admin code.", locked: true }, 423);
  const q = new URL(request.url).searchParams, g = String(q.get("group") || "");

  if (request.method === "GET") {
    const groups = {};
    await Promise.all(GROUPS.map(async k => { groups[k] = (await get(env, k)).map(item); }));
    return J({ groups, limits: { image: MAX_IMG, sections: MAX_SEC } });
  }
  if (GROUPS.indexOf(g) < 0) return J({ error: "Unknown art group." }, 400);
  if (!env.SUPABASE_SERVICE_KEY) return J({ error: "SUPABASE_SERVICE_KEY not set." }, 500);
  const list = await get(env, g);

  if (request.method === "DELETE") {
    const id = String(q.get("id") || "");
    if (!/^[a-f0-9]{8}$/.test(id)) return J({ error: "Bad id." }, 400);
    const gone = list.filter(x => x.id === id), keep = list.filter(x => x.id !== id);
    await Promise.all(gone.map(x => removeFile(env, x.path)));
    if (keep.length) await env.GAMES.put("art:" + g, JSON.stringify({ list: keep })); else await env.GAMES.delete("art:" + g);
    return J({ ok: true });
  }
  if (request.method !== "PUT") return J({ error: "Use PUT or DELETE." }, 405);

  let name = "";
  try { name = decodeURIComponent(request.headers.get("X-Name") || ""); } catch (e) { return J({ error: "Bad section name." }, 400); }
  name = name.replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim();
  const n = Array.from(name).length;
  if (n < 2 || n > 40) return J({ error: "The section name must be 2 to 40 characters." }, 400);
  if (list.some(x => x.name.toLowerCase() === name.toLowerCase())) return J({ error: "A section with this name already exists here." }, 400);
  if (list.length >= MAX_SEC) return J({ error: "Maximum " + MAX_SEC + " sections here. Remove one first." }, 400);
  const len = +request.headers.get("Content-Length") || 0;
  if (len > MAX_IMG + 2048) return J({ error: "File is too big. Maximum is " + (MAX_IMG / MB) + " MB." }, 413);
  const buf = await request.arrayBuffer();
  if (!buf.byteLength) return J({ error: "No image received." }, 400);
  if (buf.byteLength > MAX_IMG) return J({ error: "File is too big. Maximum is " + (MAX_IMG / MB) + " MB." }, 413);
  const info = sniff(new Uint8Array(buf));
  if (!info) return J({ error: "Use a PNG, JPG or WebP image." }, 400);
  const id = rnd(4), path = "art-" + g + "-" + id + "." + info.ext;
  if (!(await upload(env, path, buf, info.type))) return J({ error: "Could not save the image. Check SUPABASE_SERVICE_KEY." }, 502);
  const rec = { id, name, path, type: info.type, size: buf.byteLength, at: Date.now() };
  await env.GAMES.put("art:" + g, JSON.stringify({ list: list.concat([rec]) }));
  return J({ ok: true, item: item(rec) });
}
