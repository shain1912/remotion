// Generate montage assets via Stability (images + optional SVD clips) into the
// public/factory/<id>/{img,clip}/ paths build.mjs expects — so build.mjs finds them
// "cached" and never calls MiniMax for image/video (only TTS, which needs the cloned voice).
//   node factory/gen-stability.mjs <id>                  # all images
//   node factory/gen-stability.mjs <id> --video s01,s05  # + SVD clips for those scenes
//   node factory/gen-stability.mjs <id> --force          # regenerate even if present
import fs from 'node:fs';
import path from 'node:path';
import { genImageCore, imageToVideo, stabilityConfig } from './lib/stability.mjs';

const id = process.argv[2];
const videoArg = (() => { const i = process.argv.indexOf('--video'); return i > -1 ? (process.argv[i + 1] || '').split(',').filter(Boolean) : []; })();
const FORCE = process.argv.includes('--force');
if (!id) { console.error('usage: node factory/gen-stability.mjs <id> [--video s01,s05] [--force]'); process.exit(1); }
if (!stabilityConfig.hasKey) { console.error('STABILITY_API not set in .env'); process.exit(1); }

const proj = JSON.parse(fs.readFileSync(`factory/projects/${id}/project.json`, 'utf8'));
const pub = path.resolve('public/factory', id);
for (const sub of ['img', 'clip']) fs.mkdirSync(path.join(pub, sub), { recursive: true });
const suffix = proj.style?.imageSuffix || '';
const NEG = 'text, words, letters, captions, watermark, signature, ui labels, blurry, low quality, deformed, extra fingers';

async function mapLimit(arr, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < arr.length) { const k = i++; await fn(arr[k]); } }));
}

const scenes = proj.scenes.filter((s) => s.imagePrompt);
console.log(`[stability] ${scenes.length} images for ${id}`);
let done = 0, failed = 0;
await mapLimit(scenes, 3, async (sc) => {
  const jpg = path.join(pub, 'img', `${sc.id}.jpg`);
  if (fs.existsSync(jpg) && !FORCE) { console.log(`  ${sc.id} cached`); return; }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const buf = await genImageCore({ prompt: `${sc.imagePrompt}, ${suffix}`, aspectRatio: '16:9', negativePrompt: NEG });
      fs.writeFileSync(jpg, buf);
      console.log(`  ${sc.id} ✓ ${(buf.length / 1024 | 0)}KB (${++done})`);
      return;
    } catch (e) {
      if (attempt === 3) { failed++; console.log(`  ${sc.id} ✗ ${e.message}`); }
      else await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
});
console.log(`[stability] images: ${done} new, ${failed} failed`);

for (const sid of videoArg) {
  const mp4 = path.join(pub, 'clip', `${sid}.mp4`);
  if (fs.existsSync(mp4) && !FORCE) { console.log(`  clip ${sid} cached`); continue; }
  const jpg = path.join(pub, 'img', `${sid}.jpg`);
  if (!fs.existsSync(jpg)) { console.log(`  clip ${sid} ✗ no image`); continue; }
  try {
    console.log(`  clip ${sid} generating (SVD image-to-video, ~1-2min)...`);
    const buf = await imageToVideo(fs.readFileSync(jpg), { motionBucketId: 110 });
    fs.writeFileSync(mp4, buf);
    console.log(`  clip ${sid} ✓ ${(buf.length / 1024 | 0)}KB`);
  } catch (e) { console.log(`  clip ${sid} ✗ ${e.message}`); }
}
console.log('[stability] done');
