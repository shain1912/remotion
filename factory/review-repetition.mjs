#!/usr/bin/env node
// 강의 품질 리뷰: 63개 클립의 실제 렌더 나레이션(project.json scenes)에서
// (1) 클립 간 반복 문장/문구, (2) 인트로·아웃로 상투화, (3) 클립별 품질 지표를 검출.
// TTS/렌더 불필요 · 무과금 · 반복 실행 가능.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJ = join(ROOT, 'factory', 'projects');
const CHARS_PER_MIN = 525; // 8.74 chars/sec 기준

const ids = readdirSync(PROJ).filter(d => /^byb-/.test(d)).sort();

function load(id) {
  const pj = join(PROJ, id, 'project.json');
  if (!existsSync(pj)) return null;
  const j = JSON.parse(readFileSync(pj, 'utf8'));
  const narr = (j.scenes || []).map(s => s.narration || '').join(' ');
  return { id, template: j.template, title: j.title || id, narr };
}

// 문장 분리 (한국어): 종결부호 기준 + 괄호 태그 제거
function sentences(text) {
  return text
    .replace(/\[[^\]]*\]/g, ' ')          // [S1] 같은 태그 제거
    .split(/(?<=[.!?。…])\s+|\n+/)
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(s => s.length >= 12);          // 너무 짧은 조각 제외
}
// 정규화 키 (구두점/공백 차이 무시)
const norm = s => s.replace(/[\s.,!?。…'"'']/g, '').toLowerCase();

const clips = ids.map(load).filter(Boolean);

// ---- 1. 클립 간 반복 문장 ----
const sentMap = new Map(); // normKey -> {text, clips:Set}
for (const c of clips) {
  const seen = new Set();
  for (const s of sentences(c.narr)) {
    const k = norm(s);
    if (k.length < 8) continue;
    if (!sentMap.has(k)) sentMap.set(k, { text: s, clips: new Set() });
    sentMap.get(k).clips.add(c.id);
    seen.add(k);
  }
}
const crossRepeat = [...sentMap.values()]
  .filter(v => v.clips.size >= 3)
  .sort((a, b) => b.clips.size - a.clips.size);

// ---- 2. 반복 문구(단어 8-gram) ----
function words(text) {
  return text.replace(/\[[^\]]*\]/g, ' ').replace(/[.,!?。…]/g, ' ').split(/\s+/).filter(Boolean);
}
const N = 8;
const gramMap = new Map();
for (const c of clips) {
  const w = words(c.narr);
  const local = new Set();
  for (let i = 0; i + N <= w.length; i++) {
    const g = w.slice(i, i + N).join(' ');
    const k = norm(g);
    if (local.has(k)) continue; // 클립 내 중복은 1회만 카운트(클립 간 비교용)
    local.add(k);
    if (!gramMap.has(k)) gramMap.set(k, { text: g, clips: new Set() });
    gramMap.get(k).clips.add(c.id);
  }
}
const phraseRepeat = [...gramMap.values()]
  .filter(v => v.clips.size >= 4)
  .sort((a, b) => b.clips.size - a.clips.size)
  .slice(0, 40);

// ---- 3. 인트로/아웃로 상투화 ----
const intros = new Map(), outros = new Map();
for (const c of clips) {
  const ss = sentences(c.narr);
  if (!ss.length) continue;
  const i = norm(ss[0]).slice(0, 24), o = norm(ss[ss.length - 1]).slice(0, 24);
  (intros.get(i) || intros.set(i, []).get(i)).push(c.id);
  (outros.get(o) || outros.set(o, []).get(o)).push(c.id);
}
const introDup = [...intros.entries()].filter(([, v]) => v.length >= 3).sort((a, b) => b[1].length - a[1].length);
const outroDup = [...outros.entries()].filter(([, v]) => v.length >= 3).sort((a, b) => b[1].length - a[1].length);

// ---- 4. 클립별 지표 + 클립 내 자기반복 ----
const perClip = clips.map(c => {
  const ss = sentences(c.narr);
  const counts = new Map();
  for (const s of ss) { const k = norm(s); counts.set(k, (counts.get(k) || 0) + 1); }
  const selfRepeat = [...counts.values()].filter(n => n >= 2).length;
  const min = (c.narr.length / CHARS_PER_MIN);
  return { id: c.id, template: c.template, chars: c.narr.length, sents: ss.length, selfRepeat, min };
});

const totalChars = perClip.reduce((a, c) => a + c.chars, 0);
const totalMin = totalChars / CHARS_PER_MIN;

// ---- 리포트 ----
const lines = [];
const P = s => lines.push(s);
P('# 강의 품질 리뷰 (자동 검출)');
P('');
P(`- 클립 ${clips.length}개 · 총 나레이션 ${totalChars.toLocaleString()}자 · 추정 ${(totalMin/60).toFixed(1)}시간(${Math.round(totalMin)}분)`);
P(`- 클립 간 반복 문장(3개 클립 이상): **${crossRepeat.length}건**`);
P(`- 클립 간 반복 문구(8단어, 4개 클립 이상): **${phraseRepeat.length}건**`);
P(`- 상투적 인트로 패턴: **${introDup.length}건** · 상투적 아웃로 패턴: **${outroDup.length}건**`);
P('');
P('## 1. 클립 간 반복 문장 (많을수록 단조로움)');
if (!crossRepeat.length) P('- (없음) 👍');
for (const v of crossRepeat.slice(0, 30)) {
  P(`- **${v.clips.size}개 클립**: "${v.text.slice(0, 70)}${v.text.length>70?'…':''}"  〔${[...v.clips].slice(0,6).join(', ')}${v.clips.size>6?'…':''}〕`);
}
P('');
P('## 2. 클립 간 반복 문구 (8단어 연속, 상위 40)');
if (!phraseRepeat.length) P('- (없음) 👍');
for (const v of phraseRepeat) {
  P(`- ${v.clips.size}× : "${v.text.slice(0, 60)}…"`);
}
P('');
P('## 3. 상투적 인트로 (같은 첫 문장 시작)');
if (!introDup.length) P('- (없음) 👍');
for (const [, v] of introDup) P(`- ${v.length}개 클립 동일 시작: ${v.slice(0,8).join(', ')}`);
P('');
P('## 4. 상투적 아웃로 (같은 끝 문장)');
if (!outroDup.length) P('- (없음) 👍');
for (const [, v] of outroDup) P(`- ${v.length}개 클립 동일 마무리: ${v.slice(0,8).join(', ')}`);
P('');
P('## 5. 클립별 지표 (자기반복=클립 내 동일문장 2회 이상)');
P('| 클립 | 포맷 | 글자 | 분 | 문장 | 자기반복 |');
P('|---|---|--:|--:|--:|--:|');
for (const c of perClip) P(`| ${c.id} | ${c.template} | ${c.chars} | ${c.min.toFixed(1)} | ${c.sents} | ${c.selfRepeat?('⚠'+c.selfRepeat):'-'} |`);

const out = join(ROOT, '강의완성본', '로그', '_품질리뷰.md');
writeFileSync(out, lines.join('\n'), 'utf8');

// 콘솔 요약
console.log(`[review] 클립 ${clips.length} · ${totalChars.toLocaleString()}자 · 추정 ${(totalMin/60).toFixed(1)}h`);
console.log(`[review] 반복문장 ${crossRepeat.length} · 반복문구 ${phraseRepeat.length} · 상투인트로 ${introDup.length} · 상투아웃로 ${outroDup.length}`);
console.log(`[review] -> ${out}`);
if (crossRepeat.length) {
  console.log('  TOP 반복문장:');
  for (const v of crossRepeat.slice(0, 8)) console.log(`   ${v.clips.size}× "${v.text.slice(0,50)}" (${[...v.clips].slice(0,4).join(',')})`);
}
