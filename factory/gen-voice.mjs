// Generate per-scene narration with the LOCAL voicebox server (REST, no MiniMax) and place
// audio/<sceneId>.mp3 + sidecar JSON so build.mjs uses them as cached (skips all TTS).
//   node factory/gen-voice.mjs <id> [--profile=MyVoice] [--limit N] [--force]
// Flow: POST /generate -> poll GET /history/{id} until completed -> read audio_path wav -> ffmpeg mp3.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

// Local voicebox by default; point at a remote cloud GPU box via VOICEBOX_HOST (or SSH tunnel to localhost).
const HOST = (process.env.VOICEBOX_HOST || 'http://127.0.0.1:17493').replace(/\/$/, '');
const id = process.argv[2];
const profileArg = (process.argv.find((a) => a.startsWith('--profile=')) || '--profile=MyVoice').split('=')[1];
const limitArg = (process.argv.find((a) => a.startsWith('--limit=')) || '').split('=')[1];
// engine = quality/speed lever. Default qwen (best quality; slow ~3min/scene → needs a fast GPU).
// chatterbox_turbo is ~10x faster but on a 1-sample clone the timbre can sound off — use only if you accept that.
const engineArg = (process.argv.find((a) => a.startsWith('--engine=')) || '--engine=qwen').split('=')[1];
const LIMIT = limitArg ? parseInt(limitArg) : Infinity;
const FORCE = process.argv.includes('--force');
if (!id) { console.error('usage: node factory/gen-voice.mjs <id> [--profile=MyVoice] [--limit=N] [--force]'); process.exit(1); }

const profiles = await (await fetch(HOST + '/profiles')).json().catch(() => null);
if (!profiles) { console.error('voicebox 서버 응답 없음 (http://127.0.0.1:17493). 앱이 떠 있는지 확인.'); process.exit(1); }
const prof = profiles.find((p) => p.name === profileArg || p.id === profileArg);
if (!prof) { console.error('profile not found:', profileArg, '— available:', profiles.map((p) => p.name).join(', ')); process.exit(1); }
console.log(`[voicebox] profile=${prof.name} (${prof.language}) engine=${engineArg} id=${prof.id.slice(0, 8)}`);

const proj = JSON.parse(fs.readFileSync(`factory/projects/${id}/project.json`, 'utf8'));
const v = proj.voice || {};
// MUST match build.mjs voiceSig exactly so build treats our mp3 as cached (no MiniMax).
const voiceSig = (text) => crypto.createHash('sha1')
  .update(JSON.stringify([text, v.voiceId, v.model, v.speed ?? null, v.pitch ?? null, v.vol ?? null, v.emotion ?? null]))
  .digest('hex').slice(0, 16);
const dir = path.resolve('public/factory', id, 'audio');
fs.mkdirSync(dir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let done = 0, n = 0;
for (const sc of proj.scenes) {
  if (!sc.narration || n >= LIMIT) continue;
  n++;
  const mp3 = path.join(dir, `${sc.id}.mp3`), meta = path.join(dir, `${sc.id}.json`);
  const sig = voiceSig(sc.narration);
  if (!FORCE && fs.existsSync(mp3) && fs.existsSync(meta)) {
    try { if (JSON.parse(fs.readFileSync(meta, 'utf8')).sig === sig) { console.log(`  ${sc.id} cached`); continue; } } catch {}
  }
  try {
    const g = await (await fetch(HOST + '/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile_id: prof.id, text: sc.narration, language: 'ko', engine: engineArg }) })).json();
    let rec = g;
    for (let i = 0; i < 150 && rec.status !== 'completed' && rec.status !== 'failed'; i++) {
      await sleep(2000);
      rec = await (await fetch(`${HOST}/history/${g.id}`)).json();
    }
    if (rec.status !== 'completed') { console.log(`  ${sc.id} ✗ ${rec.status} ${rec.error || ''}`); continue; }
    // audio_path is relative; GET /audio/{id} returns the wav bytes directly.
    const wavBuf = Buffer.from(await (await fetch(`${HOST}/audio/${g.id}`)).arrayBuffer());
    const tmpWav = path.join(os.tmpdir(), `vbox_${g.id}.wav`);
    fs.writeFileSync(tmpWav, wavBuf);
    const r = spawnSync(ffmpegPath, ['-y', '-i', tmpWav, mp3], { stdio: 'pipe' });
    try { fs.unlinkSync(tmpWav); } catch {}
    if (r.status !== 0) { console.log(`  ${sc.id} ✗ ffmpeg ${r.stderr?.toString().slice(-120)}`); continue; }
    const durationMs = Math.round((rec.duration || 0) * 1000);
    fs.writeFileSync(meta, JSON.stringify({ durationMs, subtitles: [{ text: sc.narration, time_begin: 0, time_end: durationMs }], sig }));
    console.log(`  ${sc.id} ✓ ${(durationMs / 1000).toFixed(1)}s`);
    done++;
  } catch (e) { console.log(`  ${sc.id} ✗ ${e.message}`); }
}
console.log(`[voicebox] done — ${done} generated`);
