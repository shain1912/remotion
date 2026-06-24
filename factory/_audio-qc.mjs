// 신호 레벨 정밀 음성 QC: 전 클립의 각 씬 mp3를 ffmpeg astats+silencedetect로 분석.
// 검출: 클리핑(0dBFS 포화/지직) · 무음(긴 묵음/대부분 묵음) · 플랫(상수신호) · 데드(거의 무음)
//       + 길이배율(과다=루프, 미달=잘림, 사이드카 기준).
//   node factory/_audio-qc.mjs [--verbose] [--only <idPrefix>]
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const PROJ = 'factory/projects';
const RATE = 7.0;
const VERBOSE = process.argv.includes('--verbose');
const onlyArg = (() => { const i = process.argv.indexOf('--only'); return i > -1 ? process.argv[i + 1] : null; })();
const CONC = 8;

// 임계값 (정상 캘리브레이션: Peak~-0.6dB, Max~0.84, RMS~-18, Flat=0)
const TH = { clipMax: 0.997, flat: 1.0, deadRms: -45, silenceRatio: 0.5, silenceGap: 4.0 };

const ids = fs.readdirSync(PROJ).filter((d) => fs.existsSync(`${PROJ}/${d}/project.json`))
  .filter((d) => /^byb/.test(d)).filter((d) => !onlyArg || d.startsWith(onlyArg)).sort();

// 분석 대상 씬 목록
const tasks = [];
for (const id of ids) {
  const proj = JSON.parse(fs.readFileSync(`${PROJ}/${id}/project.json`, 'utf8'));
  for (const sc of proj.scenes || []) {
    if (!sc.narration) continue;
    const mp3 = path.join('public/factory', id, 'audio', `${sc.id}.mp3`);
    let sideDur = null;
    try { sideDur = JSON.parse(fs.readFileSync(path.join('public/factory', id, 'audio', `${sc.id}.json`))).durationMs / 1000; } catch {}
    tasks.push({ id, sid: sc.id, chars: sc.narration.length, mp3, exists: fs.existsSync(mp3), sideDur });
  }
}

function analyze(t) {
  return new Promise((resolve) => {
    if (!t.exists) { resolve({ ...t, flags: ['누락'] }); return; }
    const args = ['-hide_banner', '-i', t.mp3, '-af',
      'astats=metadata=1:reset=0,silencedetect=noise=-50dB:d=1.0', '-f', 'null', '-'];
    const p = spawn(ffmpegPath, args);
    let err = '';
    p.stderr.on('data', (d) => { err += d; });
    p.on('close', () => {
      const nums = (re) => [...err.matchAll(re)].map((m) => parseFloat(m[1]));
      const max = (a) => (a.length ? Math.max(...a) : null);
      const maxLevel = max(nums(/Max level:\s*([\d.]+)/g));
      const peakDb = max(nums(/Peak level dB:\s*(-?[\d.inf]+)/g));
      const rms = max(nums(/RMS level dB:\s*(-?[\d.inf]+)/g));
      const flat = max(nums(/Flat factor:\s*([\d.]+)/g));
      const durM = err.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
      const dur = durM ? +durM[1] * 3600 + +durM[2] * 60 + parseFloat(durM[3]) : (t.sideDur || 0);
      const sil = nums(/silence_duration:\s*([\d.]+)/g);
      const totSil = sil.reduce((a, b) => a + b, 0);
      const maxGap = sil.length ? Math.max(...sil) : 0;
      const flags = [];
      if (maxLevel != null && maxLevel >= TH.clipMax) flags.push(`클리핑(max ${maxLevel.toFixed(3)})`);
      if (rms != null && rms <= TH.deadRms) flags.push(`데드(rms ${rms.toFixed(0)}dB)`);
      if (flat != null && flat >= TH.flat) flags.push(`플랫(${flat.toFixed(1)})`);
      if (dur > 0 && totSil / dur >= TH.silenceRatio) flags.push(`대부분묵음(${(totSil / dur * 100).toFixed(0)}%)`);
      else if (maxGap >= TH.silenceGap) flags.push(`긴묵음(${maxGap.toFixed(1)}s)`);
      const exp = t.chars / RATE;
      if (dur > exp * 2.0 && dur > exp + 20) flags.push(`과다길이(${(dur / exp).toFixed(1)}x ${dur.toFixed(0)}s)`);
      if (dur > 0 && dur < exp * 0.45) flags.push(`잘림(${(dur / exp).toFixed(2)}x)`);
      resolve({ ...t, dur, maxLevel, peakDb, rms, flat, totSil, maxGap, flags });
    });
  });
}

// 동시성 풀
const results = [];
let idx = 0, done = 0;
await new Promise((resolveAll) => {
  const next = () => {
    if (idx >= tasks.length) { if (done === tasks.length) resolveAll(); return; }
    const t = tasks[idx++];
    analyze(t).then((r) => {
      results.push(r); done++;
      if (done % 200 === 0) process.stderr.write(`  ...분석 ${done}/${tasks.length}\n`);
      next();
    });
  };
  for (let i = 0; i < Math.min(CONC, tasks.length); i++) next();
});

const bad = results.filter((r) => r.flags && r.flags.length);
const byClip = {};
for (const r of bad) (byClip[r.id] ||= []).push(r);
console.log(`\n[audio-qc] 검사 ${results.length}씬 / ${ids.length}클립 — 문제 ${bad.length}씬 / ${Object.keys(byClip).length}클립`);
for (const id of Object.keys(byClip).sort()) {
  console.log(`  ⚠ ${id}:`);
  for (const r of byClip[id].sort((a, b) => a.sid.localeCompare(b.sid)))
    console.log(`      ${r.sid} (${r.chars}자): ${r.flags.join(', ')}`);
}
if (!bad.length) console.log('  ✓ 클리핑·무음·플랫·과다길이 0 — 전 씬 신호 정상');
if (VERBOSE) {
  console.log('\n=== peak/rms/flat 분포 상위(의심순) ===');
  results.filter((r) => r.maxLevel != null).sort((a, b) => b.maxLevel - a.maxLevel).slice(0, 12)
    .forEach((r) => console.log(`  max ${r.maxLevel.toFixed(3)} peak ${r.peakDb}dB rms ${r.rms}dB flat ${r.flat} — ${r.id}/${r.sid}`));
}
