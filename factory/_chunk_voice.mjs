// 긴 나레이션을 문장 단위로 쪼개 voicebox로 각각 생성 → 이어붙여 mp3+사이드카.
// voicebox가 긴 단일 요청에서 jam나는 씬용.  node factory/_chunk_voice.mjs <id> <sid>
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const HOST = 'http://127.0.0.1:17493';
const [id, sid] = [process.argv[2], process.argv[3]];
const proj = JSON.parse(fs.readFileSync(`factory/projects/${id}/project.json`, 'utf8'));
const v = proj.voice || {};
const sc = proj.scenes.find((s) => s.id === sid);
if (!sc) { console.error('scene not found'); process.exit(1); }
const sig = crypto.createHash('sha1').update(JSON.stringify([sc.narration, v.voiceId, v.model, v.speed ?? null, v.pitch ?? null, v.vol ?? null, v.emotion ?? null])).digest('hex').slice(0, 16);

// 문장 단위로 쪼개고 ~180자 청크로 묶기
const sents = sc.narration.split(/(?<=[.?!])\s+/).filter(Boolean);
const chunks = []; let cur = '';
for (const s of sents) { if ((cur + s).length > 180 && cur) { chunks.push(cur.trim()); cur = ''; } cur += s + ' '; }
if (cur.trim()) chunks.push(cur.trim());
console.log(`[chunk] ${id}/${sid}: ${sc.narration.length}자 → ${chunks.length}청크`);

const prof = (await (await fetch(HOST + '/profiles')).json()).find((p) => p.name === 'MyVoice');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'chunk_'));
const wavs = [];
for (let i = 0; i < chunks.length; i++) {
  let done = false;
  for (let attempt = 0; attempt < 2 && !done; attempt++) {
    try {
      const g = await (await fetch(HOST + '/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile_id: prof.id, text: chunks[i], language: 'ko', engine: 'qwen' }) })).json();
      let rec = g;
      for (let k = 0; k < 90 && rec.status !== 'completed' && rec.status !== 'failed'; k++) { await sleep(2000); rec = await (await fetch(`${HOST}/history/${g.id}`)).json(); }
      if (rec.status !== 'completed') { console.log(`  청크${i} ${rec.status}`); continue; }
      const buf = Buffer.from(await (await fetch(`${HOST}/audio/${g.id}`)).arrayBuffer());
      const wp = path.join(tmpdir, `c${i}.wav`); fs.writeFileSync(wp, buf); wavs.push(wp);
      console.log(`  ✓ 청크${i} (${chunks[i].length}자)`); done = true;
    } catch (e) { console.log(`  청크${i} 에러 ${e.message}`); }
  }
  if (!done) { console.log('  청크 실패 → 중단'); process.exit(2); }
}
// 이어붙이기 + loudnorm → mp3
const listf = path.join(tmpdir, 'list.txt');
fs.writeFileSync(listf, wavs.map((w) => `file '${w.replace(/\\/g, '/')}'`).join('\n'));
const dir = path.resolve('public/factory', id, 'audio'); fs.mkdirSync(dir, { recursive: true });
const mp3 = path.join(dir, `${sid}.mp3`), meta = path.join(dir, `${sid}.json`);
const r = spawnSync(ffmpegPath, ['-y', '-f', 'concat', '-safe', '0', '-i', listf, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', mp3], { stdio: 'pipe' });
if (r.status !== 0) { console.log('ffmpeg concat 실패', (r.stderr || '').toString().slice(-200)); process.exit(2); }
const dm = spawnSync(ffmpegPath, ['-i', mp3], { encoding: 'utf8' });
const m = (dm.stderr || '').match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
const durationMs = m ? Math.round((+m[1] * 3600 + +m[2] * 60 + parseFloat(m[3])) * 1000) : 0;
fs.writeFileSync(meta, JSON.stringify({ durationMs, subtitles: [{ text: sc.narration, time_begin: 0, time_end: durationMs }], sig, normalized: true }));
console.log(`[chunk] 완성 ${sid} ${(durationMs / 1000).toFixed(1)}s`);
