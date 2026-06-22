// Factory build: project.json -> generate per-scene voice + image (+ optional Hailuo clip)
// -> write public/factory/<id>/build.json manifest consumed by the Remotion FactoryVideo.
//
// Usage:
//   node factory/build.mjs demo-git                 # full build (resumable)
//   node factory/build.mjs demo-git --limit 3       # only first 3 scenes (smoke test)
//   node factory/build.mjs demo-git --no-video      # skip expensive Hailuo clips
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { generateImage, generateVideo, tts } from './lib/minimax.mjs';

// Cache key for a scene's TTS: changes whenever the narration OR any voice param changes,
// so editing a line invalidates only that scene's stale mp3 (no more manual audio deletion).
const voiceSig = (text, v) => crypto.createHash('sha1')
  .update(JSON.stringify([text, v.voiceId, v.model, v.speed ?? null, v.pitch ?? null, v.vol ?? null, v.emotion ?? null]))
  .digest('hex').slice(0, 16);

const projectId = process.argv[2];
if (!projectId) { console.error('usage: node factory/build.mjs <projectId> [--limit N] [--no-video]'); process.exit(1); }
const LIMIT = (() => { const i = process.argv.indexOf('--limit'); return i > -1 ? parseInt(process.argv[i + 1]) : Infinity; })();
const NO_VIDEO = process.argv.includes('--no-video');

const projDir = path.join('factory', 'projects', projectId);
const project = JSON.parse(fs.readFileSync(path.join(projDir, 'project.json'), 'utf8'));
const template = project.template || 'montage';   // montage | slides | theory
const pub = path.join('public', 'factory', projectId);
for (const sub of ['img', 'clip', 'audio']) fs.mkdirSync(path.join(pub, sub), { recursive: true });

const { fps } = project.format;
console.log(`[build] ${projectId} template=${template}`);
const PAD_S = 0.35; // breathing room after each line
const scenes = project.scenes.slice(0, LIMIT);

async function mapLimit(items, limit, fn) {
  const out = []; let i = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx], idx); }
  });
  await Promise.all(workers);
  return out;
}

// ---- 1) VOICE (sequential, KEY1 / shainvoice01) ----
console.log(`\n[voice] ${scenes.length} scenes -> ${project.voice.voiceId}`);
const v = project.voice;
for (const sc of scenes) {
  const mp3 = path.join(pub, 'audio', `${sc.id}.mp3`);
  const meta = path.join(pub, 'audio', `${sc.id}.json`);
  const sig = voiceSig(sc.narration, v);
  if (fs.existsSync(mp3) && fs.existsSync(meta)) {
    const cached = JSON.parse(fs.readFileSync(meta, 'utf8'));
    if (cached.sig === undefined) {
      // legacy cache (no sig): assume it matches current text, backfill the sig so
      // any FUTURE narration edit is detected. No regeneration -> no surprise TTS cost.
      cached.sig = sig;
      fs.writeFileSync(meta, JSON.stringify(cached));
      Object.assign(sc, cached);
      console.log(`  ${sc.id} cached (${sc.durationMs}ms, sig backfilled)`);
      continue;
    }
    if (cached.sig === sig) {
      Object.assign(sc, cached);
      console.log(`  ${sc.id} cached (${sc.durationMs}ms)`);
      continue;
    }
    console.log(`  ${sc.id} narration/voice changed -> regenerating`);
  }
  const r = await tts({ text: sc.narration, voiceId: v.voiceId, model: v.model, speed: v.speed, pitch: v.pitch, vol: v.vol, emotion: v.emotion });
  fs.writeFileSync(mp3, r.audio);
  sc.durationMs = r.ms ?? Math.round((r.subtitles.at(-1)?.time_end) || 3000);
  sc.subtitles = r.subtitles;
  fs.writeFileSync(meta, JSON.stringify({ durationMs: sc.durationMs, subtitles: sc.subtitles, sig }));
  console.log(`  ${sc.id} ✓ ${sc.durationMs}ms "${sc.narration.slice(0, 24)}..."`);
}

// ---- 2) IMAGES (montage only; concurrency 3, KEY2/3/4) ----
if (template === 'montage') {
  console.log(`\n[image] ${scenes.length} scenes`);
  await mapLimit(scenes, 3, async (sc) => {
    const jpg = path.join(pub, 'img', `${sc.id}.jpg`);
    if (fs.existsSync(jpg)) { console.log(`  ${sc.id} cached`); return; }
    const prompt = `${sc.imagePrompt}, ${project.style.imageSuffix}`;
    const buf = await generateImage({ prompt, aspectRatio: '16:9' });
    fs.writeFileSync(jpg, buf);
    console.log(`  ${sc.id} ✓ ${(buf.length / 1024 | 0)}KB`);
  });
} else {
  console.log(`\n[image] skipped (template=${template}: visuals are code-drawn)`);
}

// ---- 3) CLIPS (montage only; sequential, Hailuo I2V from the scene image) ----
const clipScenes = template === 'montage' && !NO_VIDEO ? scenes.filter((s) => s.video) : [];
console.log(`\n[clip] ${clipScenes.length} Hailuo clips${NO_VIDEO ? ' (skipped: --no-video)' : ''}`);
for (const sc of clipScenes) {
  const mp4 = path.join(pub, 'clip', `${sc.id}.mp4`);
  if (fs.existsSync(mp4)) { console.log(`  ${sc.id} cached`); sc.hasClip = true; continue; }
  try {
    const jpg = fs.readFileSync(path.join(pub, 'img', `${sc.id}.jpg`));
    const dataUrl = `data:image/jpeg;base64,${jpg.toString('base64')}`;
    console.log(`  ${sc.id} generating (Hailuo, ~1-3min)...`);
    const buf = await generateVideo({ prompt: sc.video.prompt, firstFrameImage: dataUrl, model: sc.video.model, duration: sc.video.duration, resolution: sc.video.resolution });
    fs.writeFileSync(mp4, buf);
    sc.hasClip = true;
    console.log(`  ${sc.id} ✓ ${(buf.length / 1024 | 0)}KB`);
  } catch (e) {
    sc.hasClip = false;
    console.log(`  ${sc.id} ✗ clip failed (${e.message}) -> falling back to still image`);
  }
}

// ---- 4) MANIFEST ----
// Carry through every scene content field + computed timing + audio. Montage
// adds image/clip; other templates render their content fields directly.
const STRIP = new Set(['imagePrompt', 'video', 'hasClip', 'durationMs']); // keep subtitles -> sequential captions
const manifest = {
  id: project.id, title: project.title, template, format: project.format, style: project.style,
  scenes: scenes.map((sc) => {
    const durationFrames = Math.max(1, Math.ceil((sc.durationMs / 1000 + PAD_S) * fps));
    const base = {};
    for (const [k, v] of Object.entries(sc)) if (!STRIP.has(k)) base[k] = v;
    base.durationMs = sc.durationMs;
    base.durationFrames = durationFrames;
    base.audio = `factory/${projectId}/audio/${sc.id}.mp3`;
    if (template === 'montage') {
      base.image = `factory/${projectId}/img/${sc.id}.jpg`;
      base.clip = sc.hasClip ? `factory/${projectId}/clip/${sc.id}.mp4` : null;
      base.motion = sc.motion || 'kenburns-in';
    }
    return base;
  }),
};
manifest.totalFrames = manifest.scenes.reduce((a, s) => a + s.durationFrames, 0);
fs.writeFileSync(path.join(pub, 'build.json'), JSON.stringify(manifest, null, 2));
console.log(`\n[done] ${manifest.scenes.length} scenes, ${manifest.totalFrames} frames (${(manifest.totalFrames / fps).toFixed(1)}s) -> ${path.join(pub, 'build.json')}`);
