// Free stock VIDEO via Pexels + Pixabay (Stability has no image-to-video — confirmed via openapi.json).
// Downloads a landscape mp4 for a query, scales/crops to 1920x1080 (ffmpeg), trims, returns {buf, meta}.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const root = process.cwd();
try {
  for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
} catch {}
const PEXELS = (process.env.PEXELS_API_KEY || '').trim();
const PIXABAY = (process.env.PIXABAY_API_KEY || '').trim();

async function dl(url, headers = {}) {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 160)}`);
  return Buffer.from(await r.arrayBuffer());
}

// Pexels: pick the mp4 file closest to 1920 wide, landscape.
async function pexels(query) {
  if (!PEXELS) throw new Error('no PEXELS_API_KEY');
  const j = JSON.parse((await dl(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=landscape&size=medium&per_page=15`, { Authorization: PEXELS })).toString());
  for (const v of (j.videos || [])) {
    const files = (v.video_files || []).filter((f) => f.file_type === 'video/mp4' && (f.width || 0) >= (f.height || 1));
    files.sort((a, b) => Math.abs((a.width || 0) - 1920) - Math.abs((b.width || 0) - 1920));
    if (files[0]) return { url: files[0].link, meta: { src: 'Pexels', author: v.user?.name, page: v.url } };
  }
  throw new Error('no pexels result');
}
// Pixabay fallback.
async function pixabay(query) {
  if (!PIXABAY) throw new Error('no PIXABAY_API_KEY');
  const j = JSON.parse((await dl(`https://pixabay.com/api/videos/?key=${PIXABAY}&q=${encodeURIComponent(query)}&per_page=15&video_type=film`)).toString());
  const hit = (j.hits || [])[0];
  if (!hit) throw new Error('no pixabay result');
  const v = hit.videos || {};
  const f = v.large || v.medium || v.small;
  return { url: f.url, meta: { src: 'Pixabay', author: hit.user, page: hit.pageURL } };
}

// scale+crop to 1920x1080 cover, trim to maxSec, strip audio.
function normalize(buf, maxSec = 12) {
  const tag = `${process.pid}_${Date.now()}`;
  const inP = path.join(os.tmpdir(), `stockin_${tag}.mp4`);
  const outP = path.join(os.tmpdir(), `stockout_${tag}.mp4`);
  fs.writeFileSync(inP, buf);
  const r = spawnSync(ffmpegPath, ['-y', '-t', String(maxSec), '-i', inP,
    '-vf', 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30',
    '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast', '-crf', '20', outP], { stdio: 'pipe' });
  if (r.status !== 0) throw new Error('ffmpeg normalize failed: ' + (r.stderr?.toString().slice(-200)));
  const out = fs.readFileSync(outP);
  try { fs.unlinkSync(inP); fs.unlinkSync(outP); } catch {}
  return out;
}

// Fetch a normalized 1920x1080 clip for a query. Tries Pexels then Pixabay.
export async function fetchStockClip(query, { maxSec = 12 } = {}) {
  let pick;
  try { pick = await pexels(query); }
  catch (e1) { pick = await pixabay(query); }
  const raw = await dl(pick.url);
  return { buf: normalize(raw, maxSec), meta: pick.meta };
}
export const stockConfig = { hasPexels: !!PEXELS, hasPixabay: !!PIXABAY };
