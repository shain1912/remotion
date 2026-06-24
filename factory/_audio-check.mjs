// 클립별 음성 완결성 검사: 각 씬 사이드카 durationMs를 narration 글자수/7 기대값과 대조.
// 누락(사이드카 없음) 또는 잘림(기대의 45% 미만) 플래그. → 렌더 전 검증 게이트용.
import fs from 'node:fs';
const PROJ = 'factory/projects';
const RATE = 7.0;
const ids = fs.readdirSync(PROJ).filter((d) => fs.existsSync(`${PROJ}/${d}/project.json`))
  .filter((d) => /^byb-s[1-6]-\d+$/.test(d) || /^byb-s4b-\d+$/.test(d) || /^byb2-/.test(d) || /^byb-(w|ai|esp)-\d+$/.test(d)).sort();
let okClips = 0, badClips = [];
for (const id of ids) {
  const proj = JSON.parse(fs.readFileSync(`${PROJ}/${id}/project.json`, 'utf8'));
  let miss = 0, trunc = 0, tot = 0;
  for (const sc of proj.scenes) {
    if (!sc.narration) continue; tot++;
    let d = null;
    try { d = JSON.parse(fs.readFileSync(`public/factory/${id}/audio/${sc.id}.json`)).durationMs / 1000; } catch { miss++; continue; }
    if (d < (sc.narration.length / RATE) * 0.45) trunc++;
  }
  if (miss === 0 && trunc === 0) okClips++;
  else badClips.push(`${id}: 누락${miss} 잘림${trunc} / ${tot}`);
}
console.log(`[audio-check] 정상 클립 ${okClips}/${ids.length}`);
if (badClips.length) { console.log('⚠ 문제 클립:'); badClips.forEach((b) => console.log('  ' + b)); }
else console.log('✓ 전 클립 음성 완결');
