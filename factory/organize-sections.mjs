// 섹션별 정리기 — 완성된 out/<id>.mp4 를 섹션 폴더로 모은다(사이트에 섹션 단위로 업로드용).
//   node factory/organize-sections.mjs
// 결과: 강의완성본/섹션별/<섹션>/<prefix>_<제목>.mp4  + 각 섹션 완성도(X/Y) 리포트.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'H:/remotion';
const OUT = path.join(ROOT, 'out');
const PROJ = path.join(ROOT, 'factory', 'projects');
const BASE = path.join(ROOT, '강의완성본', '섹션별');
fs.mkdirSync(BASE, { recursive: true });

// id -> { section(폴더명), prefix(파일 앞), order }
function meta(id) {
  let m;
  if ((m = id.match(/^byb2-s(\d+b?)-(\d+)$/))) return { section: `B2-S${m[1].toUpperCase()}`, prefix: `B2-S${m[1].toUpperCase()}-${m[2]}`, order: +m[2] };
  if ((m = id.match(/^byb-s(\d+b?)-(\d+)$/)))  return { section: `S${m[1].toUpperCase()}`, prefix: `S${m[1].toUpperCase()}-${m[2]}`, order: +m[2] };
  if ((m = id.match(/^byb-(w|ai|esp|mob)-(\d+)$/))) return { section: m[1].toUpperCase(), prefix: `${m[1].toUpperCase()}-${m[2]}`, order: +m[2] };
  return null;
}
const safe = (s) => s.replace(/[\\/:*?"<>|]/g, ' ').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90);

// 전체 프로젝트를 섹션별로 집계(완성도 계산용)
const all = fs.readdirSync(PROJ).filter((d) => fs.existsSync(path.join(PROJ, d, 'project.json')));
const sections = {}; // section -> { total, done, placed }
for (const id of all) {
  const mt = meta(id); if (!mt) continue;
  sections[mt.section] = sections[mt.section] || { total: 0, done: 0, placed: 0 };
  sections[mt.section].total++;
  const mp4 = path.join(OUT, id + '.mp4');
  if (!fs.existsSync(mp4)) continue;
  sections[mt.section].done++;
  // 배치
  let title = id; try { title = JSON.parse(fs.readFileSync(path.join(PROJ, id, 'project.json'), 'utf8')).title || id; } catch {}
  const dir = path.join(BASE, mt.section); fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, `${mt.prefix}_${safe(title)}.mp4`);
  const src = fs.statSync(mp4);
  if (!fs.existsSync(dest) || fs.statSync(dest).size !== src.size || fs.statSync(dest).mtimeMs < src.mtimeMs) {
    fs.copyFileSync(mp4, dest); sections[mt.section].placed++;
  }
}

console.log('[섹션별] 정리 완료 — 강의완성본/섹션별/<섹션>/');
const names = Object.keys(sections).sort();
let ready = [];
for (const s of names) {
  const x = sections[s];
  const full = x.done === x.total;
  console.log(`  ${s.padEnd(8)} ${x.done}/${x.total}${full ? '  ✅ 업로드 준비완료' : ''}${x.placed ? `  (+${x.placed} 배치)` : ''}`);
  if (full) ready.push(s);
}
console.log(ready.length ? `\n업로드 가능한 섹션: ${ready.join(', ')}` : '\n아직 완성된 섹션 없음');
