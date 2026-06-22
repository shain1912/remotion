// Deterministic course grader (the "rubric") — enforces format + quality so production can't drift.
// Modes:
//   node factory/validate-course.mjs            grade ALL clips -> table; exit 1 if any FAIL
//   node factory/validate-course.mjs --course   + per-session format variety report
//   node factory/validate-course.mjs <id>       grade one clip
//   node factory/validate-course.mjs --recent N  grade clips whose project.json changed in last N min;
//                                                 exit 2 with reasons if any FAIL (for SubagentStop hook gate)
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.join(import.meta.dirname ?? '.', '..'));
const P = (...a) => path.join(ROOT, ...a);
// Which course plan to grade against. Defaults to the original 63-clip intro course;
// pass `--plan factory/projects/_course-plan2.json` to grade a separate track with the SAME rubric.
const _planArg = (() => { const i = process.argv.indexOf('--plan'); return i > -1 ? process.argv[i + 1] : 'factory/projects/_course-plan.json'; })();
const plan = JSON.parse(fs.readFileSync(P(_planArg), 'utf8'));
const byId = Object.fromEntries(plan.clips.map((c) => [c.id, c]));

const MIN_CHARS = 4500;
const CTA = /구독|subscribe|썸네일|thumbnail|알림\s*설정|좋아요\s*(눌러|구독|와)|like\s*and\s*subscribe/i;

// ── VISUAL-REALITY gate (anti-"all PPT") ──────────────────────────────────────
// narration that PROMISES an on-screen visual, and image refs that must exist on disk.
const VISUAL_PROMISE = /화면\s*녹화|이\s*화면|화면을\s*(보|짚|확인)|보시다시피|여기[\s,]*보이|스크린샷|보이시죠|보이죠/;
const PNG_REF = /([\w가-힣._-]+\.(?:png|jpe?g|gif))/i;
// per-template max share of runtime that may be plain bullet "cards" (rest must be real visual).
const CARD_MAX = { terminal: 0.60, gitgraph: 0.60 };
const STRICT_VISUAL = process.env.STRICT_VISUAL === '1'; // promote density WARN -> FAIL

function buildDurations(id) {
  const bp = P('public/factory', id, 'build.json');
  if (!fs.existsSync(bp)) return null;
  try { const b = JSON.parse(fs.readFileSync(bp, 'utf8')); const m = {}; (b.scenes || []).forEach((s) => { m[s.id] = s.durationFrames || 0; }); return m; }
  catch { return null; }
}
function imageAssetCount(id) {
  const d = P('public/factory', id);
  if (!fs.existsSync(d)) return 0;
  let n = 0; // recurse: montage images live in <id>/img/, clips in <id>/clip/
  const walk = (dir) => {
    let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      if (e.isDirectory()) walk(path.join(dir, e.name));
      else if (/\.(png|jpe?g|webp)$/i.test(e.name)) n++;
    }
  };
  walk(d);
  return n;
}
// card vs real-visual scene. A scene carrying a `diagram` spec is a real visual on ANY template.
function sceneKind(template, s) {
  if (s.diagram) return 'visual';
  if (template === 'terminal') return (s.commands && s.commands.length) ? 'visual' : 'card';
  if (template === 'gitgraph') return s.op ? 'visual' : 'card';
  if (template === 'montage') return s.imagePrompt ? 'visual' : 'card';
  if (template === 'theory') return 'visual';
  return 'card'; // slides
}
// duration-weighted card share for one parsed project
function cardRatioOf(id, p) {
  const dur = buildDurations(id);
  let cardF = 0, totF = 0;
  for (const s of (p.scenes || [])) { const f = dur ? (dur[s.id] || 0) : 150; totF += f; if (sceneKind(p.template, s) === 'card') cardF += f; }
  return { ratio: totF ? cardF / totF : 1, totF };
}

// minimal schema sanity per template
function schemaFail(template, scenes) {
  const f = [];
  const has = (pred) => scenes.some(pred);
  if (template === 'slides') { if (!has((s) => s.title)) f.push('slides: no titled scene'); }
  else if (template === 'gitgraph') { if (!has((s) => s.op || s.phase)) f.push('gitgraph: no op/phase scene'); }
  else if (template === 'theory') { f.push('theory: UNUSED (engine draws Big-O curves only)'); }
  else if (template === 'montage') { if (!has((s) => s.imagePrompt)) f.push('montage: no imagePrompt scene'); }
  else if (template === 'terminal') {
    if (!has((s) => Array.isArray(s.commands) && s.commands.length)) f.push('terminal: no command scene');
    if (!has((s) => s.phase === 'title' || (s.title && !s.commands))) f.push('terminal: no intro/card scene (개념요소/숙제 would drop)');
  } else f.push(`unknown template "${template}"`);
  return f;
}

function grade(id) {
  const entry = byId[id];
  const dir = P('factory/projects', id);
  const pjPath = path.join(dir, 'project.json');
  const csPath = path.join(dir, 'clip-script.json');
  const r = { id, expected: entry?.format ?? '(no-plan)', template: null, fails: [], warns: [], cardPct: null, mtime: 0 };
  if (!entry) { r.fails.push('not in _course-plan.json'); return r; }
  if (!fs.existsSync(pjPath)) { r.fails.push('project.json missing'); return r; }
  let p;
  try { p = JSON.parse(fs.readFileSync(pjPath, 'utf8')); } catch (e) { r.fails.push('project.json invalid JSON'); return r; }
  r.mtime = fs.statSync(pjPath).mtimeMs;
  r.template = p.template;
  // 1) FORMAT MATCH (the core anti-drift check)
  if (p.template !== entry.format) r.fails.push(`format: expected "${entry.format}" got "${p.template}"`);
  // 2) schema sanity
  const scenes = p.scenes || [];
  r.fails.push(...schemaFail(p.template, scenes));
  // 3) narration coverage
  const chars = scenes.reduce((a, s) => a + (s.narration || '').length, 0);
  if (chars < MIN_CHARS) r.fails.push(`narration ${chars}자 < ${MIN_CHARS}`);
  // 4) voice — the cloned lecture voice. KEY2(shainvoice02)·KEY3(shainvoice03) TTS-exhausted 2026-06-18.
  //    The 20 unrendered clips render on KEY4(shainvoice04); already-rendered clips keep shainvoice03.
  //    Same source sample (ref/shainvoice_sample.mp3) -> 03/04 timbre near-identical (mix is fine).
  const ALLOWED_VOICES = new Set(['shainvoice02', 'shainvoice03', 'shainvoice04', 'shainvoice05']);
  if (!ALLOWED_VOICES.has(p.voice?.voiceId)) r.fails.push(`voiceId ${p.voice?.voiceId} not in {${[...ALLOWED_VOICES].join(',')}}`);
  // 5) no-CTA / thumbnail across all visible text
  const text = scenes.map((s) => [s.narration, s.title, s.note, (s.bullets || []).join(' '), (s.output || []).join(' ')].join(' ')).join(' ');
  const m = text.match(CTA); if (m) r.fails.push(`CTA/thumbnail trace: "${m[0]}"`);
  // 6) term_concepts + homework (from clip-script)
  if (!fs.existsSync(csPath)) r.fails.push('clip-script.json missing');
  else { try { const cs = JSON.parse(fs.readFileSync(csPath, 'utf8'));
    if (!(cs.term_concepts?.length >= 1)) r.fails.push('term_concepts missing');
    if (!(cs.homework?.steps?.length >= 1)) r.fails.push('homework.steps missing');
  } catch { r.fails.push('clip-script.json invalid'); } }

  // 7) VISUAL DENSITY + ASSET REALITY — the anti-"all PPT" gate
  const { ratio: cardRatio } = cardRatioOf(id, p);
  r.cardPct = Math.round(cardRatio * 100);
  if (CARD_MAX[p.template] != null && cardRatio > CARD_MAX[p.template]) {
    const msg = `visual: 카드 ${r.cardPct}% > ${Math.round(CARD_MAX[p.template] * 100)}% (실제 터미널/코드/그래프 화면 부족)`;
    (STRICT_VISUAL ? r.fails : r.warns).push(msg);
  }
  if (p.template === 'slides' && cardRatio >= 0.999) r.warns.push('visual: 100% 불릿 카드 (diagram 씬으로 다양화 권장)');
  // montage image fallback = the clip silently became text cards (the s1-01 / s4b-04 failure)
  if (p.template === 'montage') {
    const imgScenes = scenes.filter((s) => s.imagePrompt).length;
    const imgs = imageAssetCount(id);
    if (imgScenes && imgs === 0) r.fails.push('asset: 몽타주 이미지 0개 — 카드로 폴백 (이미지 생성 필요)');
    else if (imgs < imgScenes) r.warns.push(`asset: 이미지 ${imgs} < ${imgScenes}씬 (일부 카드 폴백 가능)`);
  }
  // referenced image files (e.g. "[SHOT] foo.png") must actually exist
  for (const s of scenes) {
    const ref = [s.visual, s.note, ...(s.bullets || [])].filter(Boolean).join('  ');
    const mm = ref.match(PNG_REF);
    if (mm && !fs.existsSync(path.join(dir, mm[1])) && !fs.existsSync(P('public/factory', id, mm[1])))
      r.warns.push(`asset: 참조 이미지 "${mm[1]}" 없음`);
  }
  // false visual promise: a card scene whose narration claims a screen that is never shown
  const promises = scenes.filter((s) => sceneKind(p.template, s) === 'card' && !s.diagram && VISUAL_PROMISE.test(s.narration || '')).length;
  if (promises) r.warns.push(`visual: 카드인데 "화면 보이죠"類 나레이션 ${promises}곳 (실제 화면 없음)`);
  return r;
}

const args = process.argv.slice(2);
const recentI = args.indexOf('--recent');
const ids = args.filter((a) => byId[a]);
let targets = plan.clips.map((c) => c.id);
if (ids.length) targets = ids;
else if (recentI > -1) {
  const mins = parseInt(args[recentI + 1] || '25');
  const cutoff = Date.now() - mins * 60000;
  targets = plan.clips.map((c) => c.id).filter((id) => {
    const f = P('factory/projects', id, 'project.json');
    return fs.existsSync(f) && fs.statSync(f).mtimeMs >= cutoff;
  });
}

const results = targets.map(grade);
const failed = results.filter((r) => r.fails.length);
const pass = results.length - failed.length;

if (recentI > -1) {
  // HOOK GATE mode: only block on clips actually touched recently
  if (!targets.length) { console.log('[gate] no recently-changed clips — ok'); process.exit(0); }
  if (failed.length) {
    console.error(`[gate] ${failed.length}/${results.length} recently-changed clip(s) FAIL the rubric:`);
    for (const r of failed) console.error(`  ✗ ${r.id} [${r.template}→want ${r.expected}]: ${r.fails.join('; ')}`);
    // BLOCK (exit 2) only when GATE_STRICT=1 (sequential/ad-hoc). During parallel fan-out the hook
    // must NOT block — sibling clips mid-authoring would false-trigger. Per-clip self-gate + the
    // pre-render full grader are the real enforcement there.
    process.exit(process.env.GATE_STRICT === '1' ? 2 : 0);
  }
  console.log(`[gate] ${pass}/${results.length} recently-changed clip(s) PASS`); process.exit(0);
}

// report mode
const warned = results.filter((r) => r.warns.length && !r.fails.length).length;
console.log(`\n[grade] ${pass}/${results.length} PASS, ${failed.length} FAIL, ${warned} WARN  (min ${MIN_CHARS}자 · 카드비율·자산 게이트)`);
for (const r of results) {
  const tag = r.fails.length ? '✗' : (r.warns.length ? '!' : '✓');
  const cp = r.cardPct != null ? ` card${String(r.cardPct).padStart(3)}%` : '';
  const note = r.fails.length ? `  ${r.fails.join('; ')}` : '';
  const wn = r.warns.length ? `  ⚠ ${r.warns.join('; ')}` : '';
  console.log(`  ${tag} ${r.id.padEnd(12)} ${String(r.template).padEnd(9)}→${String(r.expected).padEnd(9)}${cp}${note}${wn}`);
}
if (args.includes('--course')) {
  console.log('\n[variety] per-session format distribution (target ≥3 formats, ≤60% one):');
  const bySession = {};
  for (const c of plan.clips) { (bySession[c.session] = bySession[c.session] || []).push(c.format); }
  for (const s of Object.keys(bySession).sort()) {
    const arr = bySession[s]; const dist = {};
    arr.forEach((f) => dist[f] = (dist[f] || 0) + 1);
    const top = Math.max(...Object.values(dist)); const pctTop = Math.round((top / arr.length) * 100);
    const warn = (Object.keys(dist).length < 2 || pctTop > 60) ? '  ⚠ low variety' : '';
    console.log(`  ${s}: ${JSON.stringify(dist)} (top ${pctTop}%)${warn}`);
  }
  // course-wide VISUAL density (the real "all PPT" metric)
  let cAll = 0, tAll = 0, fallbacks = 0, theory = 0;
  const fmtCard = {};
  for (const c of plan.clips) {
    const pj = P('factory/projects', c.id, 'project.json');
    if (!fs.existsSync(pj)) continue;
    let p; try { p = JSON.parse(fs.readFileSync(pj, 'utf8')); } catch { continue; }
    if (p.template === 'theory') theory++;
    const { ratio, totF } = cardRatioOf(c.id, p);
    const cF = ratio * totF;
    cAll += cF; tAll += totF;
    (fmtCard[p.template] = fmtCard[p.template] || { c: 0, t: 0 }).c += cF;
    fmtCard[p.template].t += totF;
    if (p.template === 'montage' && (p.scenes || []).some((s) => s.imagePrompt) && imageAssetCount(c.id) === 0) fallbacks++;
  }
  console.log('\n[visual] 코스 전체 화면 구성 (런타임 기준):');
  console.log(`  불릿 카드 ${Math.round(100 * cAll / tAll)}%  vs  실제 화면 ${Math.round(100 * (tAll - cAll) / tAll)}%  (목표: 실제 ≥ 45%)`);
  for (const t of Object.keys(fmtCard)) { const x = fmtCard[t]; console.log(`    ${t.padEnd(9)} 카드 ${Math.round(100 * x.c / x.t)}%`); }
  console.log(`  theory(그래프) 클립 ${theory}개 · 몽타주 이미지 폴백 ${fallbacks}개`);
}
process.exit(failed.length ? 1 : 0);
