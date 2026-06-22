// Stability AI helper — Stable Image Core (text->image) + image-to-video (SVD).
// Offloads image/video generation from MiniMax (minimize paid MiniMax spend).
// Key: STABILITY_API in .env. No sharp dependency — SVD input is resized via ffmpeg.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const root = process.cwd();
try { // load .env (same minimal parser as minimax.mjs)
  for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
} catch {}

const KEY = (process.env.STABILITY_API || '').trim();
const HOST = 'https://api.stability.ai';
if (!KEY) console.warn('[stability] WARN: STABILITY_API not set');

// Stable Image Core: cheap (~3 credits), good quality. Returns a JPEG Buffer.
export async function genImageCore({ prompt, aspectRatio = '16:9', outputFormat = 'jpeg', negativePrompt }) {
  const fd = new FormData();
  fd.set('prompt', prompt);
  fd.set('aspect_ratio', aspectRatio);
  fd.set('output_format', outputFormat);
  if (negativePrompt) fd.set('negative_prompt', negativePrompt);
  const res = await fetch(`${HOST}/v2beta/stable-image/generate/core`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, Accept: 'image/*' },
    body: fd,
  });
  if (!res.ok) throw new Error(`stability core ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return Buffer.from(await res.arrayBuffer());
}

// resize/crop a jpeg buffer to exactly WxH (cover) using ffmpeg — SVD needs 1024x576.
function resizeCover(buf, w, h) {
  const tag = `${process.pid}_${Date.now()}`;
  const inP = path.join(os.tmpdir(), `svdin_${tag}.jpg`);
  const outP = path.join(os.tmpdir(), `svdout_${tag}.jpg`);
  fs.writeFileSync(inP, buf);
  const r = spawnSync(ffmpegPath, ['-y', '-i', inP, '-vf', `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`, outP], { stdio: 'pipe' });
  if (r.status !== 0) throw new Error('ffmpeg resize failed: ' + (r.stderr?.toString().slice(-200)));
  const out = fs.readFileSync(outP);
  try { fs.unlinkSync(inP); fs.unlinkSync(outP); } catch {}
  return out;
}

// Stable Video Diffusion (image-to-video): ~4s 1024x576 mp4 from a still. ~20 credits.
export async function imageToVideo(jpgBuffer, { cfgScale = 1.8, motionBucketId = 110, pollMs = 6000, maxPolls = 60 } = {}) {
  const img = resizeCover(jpgBuffer, 1024, 576);
  const fd = new FormData();
  fd.set('image', new Blob([img], { type: 'image/jpeg' }), 'image.jpg');
  fd.set('cfg_scale', String(cfgScale));
  fd.set('motion_bucket_id', String(motionBucketId));
  const start = await fetch(`${HOST}/v2beta/image-to-video`, { method: 'POST', headers: { Authorization: `Bearer ${KEY}` }, body: fd });
  if (!start.ok) throw new Error(`svd start ${start.status}: ${(await start.text()).slice(0, 300)}`);
  const { id } = await start.json();
  for (let i = 0; i < maxPolls; i++) {
    await new Promise((r) => setTimeout(r, pollMs));
    const res = await fetch(`${HOST}/v2beta/image-to-video/result/${id}`, { headers: { Authorization: `Bearer ${KEY}`, Accept: 'video/*' } });
    if (res.status === 202) continue;
    if (res.status === 200) return Buffer.from(await res.arrayBuffer());
    throw new Error(`svd result ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  throw new Error('svd timed out');
}

export const stabilityConfig = { hasKey: !!KEY, host: HOST };
