// 파드에서 받은 WAV(output/wavs/<id>__<sid>.wav)를 public/factory/<id>/audio/<sid>.mp3 + 사이드카로 배치.
// loudnorm 정규화 + build.mjs와 동일한 sig 계산 → build가 캐시로 사용.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const WAVDIR = path.resolve('output/wavs');
if (!fs.existsSync(WAVDIR)) { console.error('no output/wavs'); process.exit(1); }

const voiceSig = (text, v) => crypto.createHash('sha1')
  .update(JSON.stringify([text, v.voiceId, v.model, v.speed ?? null, v.pitch ?? null, v.vol ?? null, v.emotion ?? null]))
  .digest('hex').slice(0, 16);
const durMs = (file) => {
  const r = spawnSync(ffmpegPath, ['-i', file], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  return m ? Math.round((+m[1] * 3600 + +m[2] * 60 + parseFloat(m[3])) * 1000) : 0;
};

// project.json 캐시 (narration + voice 조회용)
const projCache = {};
const getProj = (id) => projCache[id] || (projCache[id] = JSON.parse(fs.readFileSync(`factory/projects/${id}/project.json`, 'utf8')));

const wavs = fs.readdirSync(WAVDIR).filter((f) => f.endsWith('.wav'));
let ok = 0, skip = 0, fail = 0;
for (const w of wavs) {
  const m = w.match(/^(.+)__(s\d+)\.wav$/);
  if (!m) { fail++; continue; }
  const [, id, sid] = m;
  let proj; try { proj = getProj(id); } catch { fail++; continue; }
  const sc = proj.scenes.find((s) => s.id === sid);
  if (!sc || !sc.narration) { skip++; continue; }
  const dir = path.resolve('public/factory', id, 'audio');
  fs.mkdirSync(dir, { recursive: true });
  const mp3 = path.join(dir, `${sid}.mp3`), meta = path.join(dir, `${sid}.json`);
  const sig = voiceSig(sc.narration, proj.voice || {});
  // 이미 같은 sig면 스킵
  if (fs.existsSync(meta)) { try { if (JSON.parse(fs.readFileSync(meta)).sig === sig) { skip++; continue; } } catch {} }
  const r = spawnSync(ffmpegPath, ['-y', '-i', path.join(WAVDIR, w), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', mp3], { stdio: 'pipe' });
  if (r.status !== 0) { console.log(`  ${w} ffmpeg 실패`); fail++; continue; }
  const durationMs = durMs(mp3);
  fs.writeFileSync(meta, JSON.stringify({ durationMs, subtitles: [{ text: sc.narration, time_begin: 0, time_end: durationMs }], sig, normalized: true }));
  ok++;
}
console.log(`[place] mp3+사이드카 ${ok} · 스킵 ${skip} · 실패 ${fail} (총 ${wavs.length} wav)`);
