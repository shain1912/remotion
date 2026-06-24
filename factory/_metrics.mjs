// 양산 품질 메트릭: 클립별 역할다양성·씬수·길이·음성완결성을 측정하고 데모 기준선과 비교.
//   node factory/_metrics.mjs [baselineId]   (기본 baseline=byb-w-01)
import fs from 'node:fs';
const PROJ = 'factory/projects';
const RATE = 7.0, PAD = 0.7;
const baselineId = process.argv[2] || 'byb-w-01';

// FactoryVideo inferRole 복제 (roles.md 기준)
function inferRole(s, i) {
  const k = (s.kicker || '') + ' ' + (s.title || '');
  const has = (re) => re.test(k);
  const lay = s.layout || (s.bullets || s.title || s.code ? 'slide' : 'full');
  if (lay === 'full' && (s.clip || s.image)) return 'media';
  if (lay === 'full') return i === 0 ? 'cover' : 'chapter';
  if (s.code?.length) return 'code';
  if (has(/숙제|과제|미션|제출|점검|챌린지|직접 ?하기/)) return 'homework';
  if (has(/정리|복습|요약|마무리|핵심 ?정리/)) return 'recap';
  if (has(/용어|단어|뜻/) && s.diagram?.kind === 'pair') return 'definition';
  if (s.diagram?.kind === 'pair' && !s.bullets?.length) return 'definition';
  if (s.diagram?.kind === 'flow' && !s.bullets?.length) return 'process';
  if (s.bullets?.length) return 'list';
  if (s.title) return 'statement';
  return 'list';
}

function metrics(id) {
  const p = JSON.parse(fs.readFileSync(`${PROJ}/${id}/project.json`, 'utf8'));
  const scenes = p.scenes.filter((s) => s.narration);
  const roles = scenes.map((s, i) => inferRole(s, i));
  const distinct = new Set(roles).size;
  // 실제 음성 길이(사이드카) 있으면 그걸로, 없으면 추정
  let dur = 0, voiced = 0, trunc = 0;
  for (const s of scenes) {
    let d = null;
    try { d = JSON.parse(fs.readFileSync(`public/factory/${id}/audio/${s.id}.json`)).durationMs / 1000; } catch {}
    if (d != null) { voiced++; dur += d + PAD; if (d < (s.narration.length / RATE) * 0.45) trunc++; }
    else dur += s.narration.length / RATE + PAD;
  }
  return { id, scenes: scenes.length, distinct, dur, voiced, trunc, roleSet: new Set(roles) };
}

const ids = fs.readdirSync(PROJ).filter((d) => fs.existsSync(`${PROJ}/${d}/project.json`))
  .filter((d) => /^byb-s[1-6]-\d+$/.test(d) || /^byb-s4b-\d+$/.test(d) || /^byb2-/.test(d) || /^byb-(w|ai|esp)-\d+$/.test(d)).sort();

const base = metrics(baselineId);
console.log(`=== 기준선 데모 [${baselineId}]: 씬 ${base.scenes}, 역할 ${base.distinct}종, 길이 ${(base.dur/60).toFixed(1)}분 ===\n`);

const all = ids.map(metrics);
const flags = [];
for (const m of all) {
  if (m.distinct <= 2) flags.push(`${m.id}: 다양성 낮음(역할 ${m.distinct}종) — 같은 틀 위험`);
  if (m.trunc > 0) flags.push(`${m.id}: 음성 잘림 ${m.trunc}씬`);
  if (m.voiced > 0 && m.voiced < m.scenes) flags.push(`${m.id}: 음성 누락 ${m.scenes - m.voiced}씬`);
}
const avgDist = (all.reduce((a, m) => a + m.distinct, 0) / all.length).toFixed(1);
const totDur = all.reduce((a, m) => a + m.dur, 0);
const roleHist = {};
all.forEach((m) => m.roleSet.forEach((r) => roleHist[r] = (roleHist[r] || 0) + 1));

console.log(`=== 배치 ${all.length}편 ===`);
console.log(`  평균 역할다양성: ${avgDist}종/편 (데모 ${base.distinct}종)`);
console.log(`  총 길이: ${(totDur/3600).toFixed(1)}시간 / 편당 평균 ${(totDur/all.length/60).toFixed(1)}분`);
console.log(`  역할 사용 분포(몇 편이 그 역할 씀): ` + Object.entries(roleHist).sort((a,b)=>b[1]-a[1]).map(([r,c])=>`${r}:${c}`).join(' '));
console.log(`  음성 회수된 편: ${all.filter(m=>m.voiced>0).length}/${all.length}`);
console.log(`\n=== ⚠ 플래그 (${flags.length}) ===`);
flags.length ? flags.forEach((f) => console.log('  ' + f)) : console.log('  없음 — 전 클립 다양성·음성 정상');
