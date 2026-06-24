// 클립별 음성 완결성 검사: 각 씬 사이드카 durationMs를 narration 글자수/7 기대값과 대조.
// 누락(사이드카 없음) · 잘림(기대의 45% 미만) · 과다길이(기대의 2배+ = TTS 루프/뭉개짐) 플래그.
// → 렌더 전 검증 게이트용.  옵션: --verbose 면 전 씬을 배율순으로 출력.
import fs from 'node:fs';
const PROJ = 'factory/projects';
const RATE = 7.0;
const VERBOSE = process.argv.includes('--verbose');
const ids = fs.readdirSync(PROJ).filter((d) => fs.existsSync(`${PROJ}/${d}/project.json`))
  .filter((d) => /^byb-s[1-6]-\d+$/.test(d) || /^byb-s4b-\d+$/.test(d) || /^byb2-/.test(d) || /^byb-(w|ai|esp)-\d+$/.test(d)).sort();
let okClips = 0, badClips = [];
const allScenes = [];
for (const id of ids) {
  const proj = JSON.parse(fs.readFileSync(`${PROJ}/${id}/project.json`, 'utf8'));
  let miss = 0, trunc = 0, long = 0, tot = 0;
  for (const sc of proj.scenes) {
    if (!sc.narration) continue; tot++;
    let d = null;
    try { d = JSON.parse(fs.readFileSync(`public/factory/${id}/audio/${sc.id}.json`)).durationMs / 1000; } catch { miss++; continue; }
    const exp = sc.narration.length / RATE;
    allScenes.push({ id, sid: sc.id, chars: sc.narration.length, exp, got: d, ratio: d / exp });
    if (d < exp * 0.45) trunc++;
    // 과다길이: 기대의 2배 이상 + 최소 20초 초과 (짧은 씬의 자연스러운 변동 제외)
    if (d > exp * 2.0 && d > exp + 20) long++;
  }
  if (miss === 0 && trunc === 0 && long === 0) okClips++;
  else badClips.push(`${id}: 누락${miss} 잘림${trunc} 과다길이${long} / ${tot}`);
}
console.log(`[audio-check] 정상 클립 ${okClips}/${ids.length}`);
if (badClips.length) { console.log('⚠ 문제 클립:'); badClips.forEach((b) => console.log('  ' + b)); }
else console.log('✓ 전 클립 음성 완결(누락·잘림·과다길이 0)');
if (VERBOSE) {
  console.log('\n=== 전 씬 배율 내림차순 상위 15 (1.0x≈정상, 2x+=깨짐) ===');
  allScenes.sort((a, b) => b.ratio - a.ratio).slice(0, 15)
    .forEach((s) => console.log(`  ${s.ratio.toFixed(2)}x  ${s.id}/${s.sid}  ${s.chars}자 기대${Math.round(s.exp)}s→실제${Math.round(s.got)}s`));
}
