// 리뷰용 정리기 — 사용자가 자고 일어나서 한눈에 보도록 산출물을 3개 폴더로 정리한다.
//   강의완성본/영상      ... 완성 mp4 복사본(친절한 한글 파일명, S#-##_제목.mp4)
//   강의완성본/커리큘럼   ... 세션별 커리큘럼 문서(학습목표·개념요소·숙제) + 마스터 README
//   강의완성본/로그      ... 렌더 로그 복사본 + 렌더 현황 요약
// 복사(이동 아님) — out/의 mp4는 그대로 둬야 render-pass 캐시(mp4 최신=skip)가 깨지지 않는다.
// 재실행 가능(idempotent): 렌더가 더 진행된 뒤 다시 돌리면 새 mp4가 반영된다.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.join(import.meta.dirname ?? '.', '..'));
const P = (...a) => path.join(ROOT, ...a);
const OUT = P('out');

// Which course plan to organize. Defaults to the 63-clip intro course; pass
//   node factory/organize-review.mjs --plan factory/projects/_course-plan2.json
// to organize a separate track. A track with _meta.track gets its own 심화 subfolders
// so it doesn't clobber the intro deliverables.
const planArg = (() => { const i = process.argv.indexOf('--plan'); return i > -1 ? process.argv[i + 1] : 'factory/projects/_course-plan.json'; })();
const plan = JSON.parse(fs.readFileSync(P(planArg), 'utf8'));
const track = plan._meta?.track || null;     // e.g. 'byb2' (심화)
const SUB = track ? '심화' : null;

const REVIEW = P('강의완성본');
const VID = SUB ? path.join(REVIEW, '영상', SUB) : path.join(REVIEW, '영상');
const CUR = SUB ? path.join(REVIEW, '커리큘럼', SUB) : path.join(REVIEW, '커리큘럼');
const LOG = SUB ? path.join(REVIEW, '로그', SUB) : path.join(REVIEW, '로그');
for (const d of [REVIEW, VID, CUR, LOG]) fs.mkdirSync(d, { recursive: true });
const FPS = 30;
const NOW = Date.now();

// 세션 메타(편집 요약 — 클립 제목에 근거). display=문서 제목, intro=세션 목표 한 문단.
const SESS = {
  S1:  { name: '들어가기 — 컴퓨터·AI 도구와 친해지기',
         intro: '바이브코딩이 무엇인지 감을 잡고 AI 코딩 도구를 처음 열어본 뒤, 모든 작업의 무대가 되는 파일·폴더·경로와 터미널 기초를 손으로 익힌다. 비전공자가 컴퓨터를 두려워하지 않게 만드는 것이 목표.' },
  S2:  { name: '터미널과 버전관리 — Git·GitHub',
         intro: '터미널에서 폴더를 누비고(cd/ls/mkdir), 변경을 기록·되돌리고(commit/되돌리기), 원격 저장소 GitHub에 올리는(push) 한 바퀴를 직접 돈다. Git을 세이브 포인트 비유로 익힌다.' },
  S3:  { name: '파이썬 기초 — 데이터와 흐름',
         intro: 'REPL로 파이썬을 처음 실행하고 변수·리스트·딕셔너리 같은 데이터 그릇과 조건문·반복문·함수 같은 흐름 제어, pip 설치와 에러(트레이스백) 읽는 법까지 직접 치며 익힌다.' },
  S4:  { name: '웹의 원리와 이미지 입문',
         intro: '웹페이지가 HTML(뼈대)·CSS(꾸밈)·JS(동작)·API(데이터 통로)로 이뤄짐을 브라우저로 직접 확인하고, 이어서 "이미지는 숫자(픽셀)"와 객체 인식 개념을 잡아 S4b 비전 랩으로 연결한다.' },
  S4b: { name: 'AI 비전 실전 랩',
         intro: '사진 한 장을 실제 모델에 넣어보는 실습 세션. YOLO26/YOLOE(검출)·SAM3(분할)·MediaPipe(온디바이스)·PaddleOCR(글자)·Gemini VLM(설명)·supervision(통합)을 직접 돌리고, 무엇을 언제 쓸지 결정맵으로 정리한다. 모든 출력은 factory/vision-lab에서 실측한 진짜 결과.' },
  S5:  { name: '피지컬 컴퓨팅 — 전자회로와 아두이노',
         intro: '전기·전압·전류·저항을 물 흐름 비유로 잡고 VCC/GND·브레드보드·MCU 개념을 익힌 뒤, Wokwi 시뮬레이터로 디지털핀·버튼·LED를 코드로 제어한다. 코드가 현실의 부품을 움직이는 경험.' },
  S6:  { name: '캡스톤 — 합체 프로젝트',
         intro: '앞 세션에서 배운 것(터미널·Git·파이썬·웹·입력→처리→표시)을 하나의 작은 프로젝트로 합친다. 셋업→입력→처리→표시 파이프라인을 만들고, 막혔을 때 고치는 법과 좋은 프롬프트 쓰는 법으로 마무리.' },
  // 심화 트랙(byb2 — IoT 풀스택·임베디드)
  'B2-S1': { name: '심화 들어가기 — 기획·아키텍처',
             intro: '한 장 PRD로 문제·사용자·범위를 정리하고, 디바이스–서버–클라이언트로 이어지는 시스템 아키텍처와 데이터 흐름을 그려 제품 만들기의 큰 그림을 잡는다.' },
  'B2-S4': { name: '심화 풀스택 — 백엔드·실시간·대시보드',
             intro: 'FastAPI로 디바이스 데이터를 받고 Supabase에 저장하며, MQTT→서버→WebSocket 실시간 흐름과 React 대시보드(차트·제어)까지 한 바퀴를 직접 만든다.' },
  'B2-S4b': { name: '심화 비전 — 온디바이스 AI',
              intro: 'ESP32-CAM 스트리밍·프레임 캡처, Edge Impulse로 경량 모델 학습→온디바이스 배포, 온디바이스 vs 클라우드 비교와 인식 결과로 액추에이터를 트리거하는 통합까지 다룬다.' },
  'B2-S5': { name: '심화 임베디드 — 센서·액추에이터·네트워크',
             intro: 'ESP32-S3 핀맵·통신(I2C/SPI/UART)부터 센서 read, 액추에이터 구동, Wi-Fi+MQTT 발행으로 센서값을 클라우드까지 보내는 Thin-Slice를 완성한다.' },
  'B2-S6': { name: '심화 통합·배포',
             intro: '하드웨어+비전+풀스택을 하나로 결합하는 통합 미리보기와, 펌웨어 플래시+웹/앱(Vercel·Fly.io) 배포·최종 점검으로 제품을 세상에 내보낸다.' },
};
const FMT_KO = { terminal: '터미널 실습', slides: '슬라이드', montage: '몽타주(영상)', gitgraph: 'Git 그래프', theory: '이론그래프' };

const illegal = /[\\/:*?"<>|]/g;
const clipNum = (id) => id.split('-').pop();              // byb-s4b-02 -> 02
const friendly = (c) => `${c.session}-${clipNum(c.id)}_${c.title.replace(illegal, '·').trim()}`;
const fmtDur = (frames) => { if (!frames) return '—'; const s = Math.round(frames / FPS); return `${Math.floor(s / 60)}분 ${String(s % 60).padStart(2, '0')}초`; };
const fmtMB = (bytes) => `${(bytes / 1048576).toFixed(0)}MB`;

function readJSON(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

// ---------- 1) 영상 복사 + 현황 수집 ----------
const rows = [];           // {c, status, mb, dur, frames}
let copied = 0, rendering = 0, pending = 0;
for (const c of plan.clips) {
  const src = path.join(OUT, `${c.id}.mp4`);
  const build = readJSON(P('public/factory', c.id, 'build.json'));
  const frames = build?.totalFrames || 0;
  let status = 'pending', mb = 0, voice = '—';
  if (fs.existsSync(src)) {
    const st = fs.statSync(src);
    // mp4가 project.json보다 새것이면 현재 voice(shainvoice03), 아니면 구버전(이전 voice — 재렌더 대기)
    const pj = P('factory/projects', c.id, 'project.json');
    const vid = readJSON(pj)?.voice?.voiceId || 'shainvoice';
    voice = (fs.existsSync(pj) && st.mtimeMs >= fs.statSync(pj).mtimeMs) ? `신(${vid})` : '구(재렌더 대기)';
    if (NOW - st.mtimeMs < 15000) { status = 'rendering'; rendering++; }   // 지금 쓰는 중일 수 있음 → 건너뜀
    else {
      fs.copyFileSync(src, path.join(VID, friendly(c) + '.mp4'));
      status = 'done'; mb = st.size; copied++;
    }
  } else { pending++; }
  rows.push({ c, status, mb, dur: fmtDur(frames), frames, voice });
}

// 영상 목록 md
{
  const L = [];
  L.push('# 영상 산출물 목록\n');
  L.push(`정리 시각 기준 — 완성 ${copied}개 · 렌더중 ${rendering}개 · 대기 ${pending}개 / 전체 ${plan.clips.length}개\n`);
  L.push('- ✅ done = 이 폴더에 복사 완료  ·  🔄 rendering = 막 렌더돼 다음 정리 때 반영  ·  ⏳ pending = 아직 렌더 안 됨(무료 큐 순번 또는 유료 montage)\n');
  L.push('- voice 「신」 = 현재 음성(shainvoice03)으로 렌더됨  ·  「구」 = 이전 음성으로 렌더된 구버전(같은 성우 샘플 — 음성은 거의 동일, shainvoice03로 재렌더 대기 중)\n');
  L.push('| 상태 | 파일명 | 세션 | 포맷 | 길이 | 용량 | voice |');
  L.push('|---|---|---|---|---|---|---|');
  for (const r of rows) {
    const icon = r.status === 'done' ? '✅' : r.status === 'rendering' ? '🔄' : '⏳';
    const fn = r.status === 'done' ? `${friendly(r.c)}.mp4` : `(${r.c.id})`;
    L.push(`| ${icon} | ${fn} | ${r.c.session} | ${FMT_KO[r.c.format] || r.c.format} | ${r.dur} | ${r.status === 'done' ? fmtMB(r.mb) : '—'} | ${r.voice} |`);
  }
  L.push('\n> montage(몽타주) 포맷은 MiniMax 유료 이미지/영상 생성이 필요해 무료 클립 렌더 뒤 잔액 확인 후 진행됩니다.');
  L.push('> 이 폴더는 스냅샷입니다. 백그라운드 재렌더가 진행되면 `node factory/organize-review.mjs` 를 다시 돌려 갱신할 수 있습니다.');
  fs.writeFileSync(path.join(VID, '_영상목록.md'), L.join('\n'));
}

// ---------- 2) 커리큘럼 문서(세션별 + 마스터) ----------
const bySession = {};
for (const c of plan.clips) (bySession[c.session] = bySession[c.session] || []).push(c);
const sessOrder = track === 'byb2'
  ? ['B2-S1', 'B2-S4', 'B2-S4b', 'B2-S5', 'B2-S6']
  : ['S1', 'S2', 'S3', 'S4', 'S4b', 'S5', 'S6'];

function clipDetail(c) {
  const cs = readJSON(P('factory/projects', c.id, 'clip-script.json'));
  const L = [];
  const dur = cs?.duration_min ? `약 ${cs.duration_min}분` : '';
  const title = cs?.title || c.title;
  L.push(`### ${c.session}-${clipNum(c.id)} · ${title}`);
  L.push(`*포맷: ${FMT_KO[c.format] || c.format}${dur ? ' · ' + dur : ''} · 역할: ${c.why}*\n`);
  if (cs?.learning_objectives?.length) {
    L.push('**학습목표**');
    for (const o of cs.learning_objectives) L.push(`- ${o}`);
    L.push('');
  }
  if (cs?.term_concepts?.length) {
    L.push('**개념요소 (단어 뜯어보기)**');
    for (const t of cs.term_concepts) {
      L.push(`- **${t.term}**`);
      if (t.literal) L.push(`  - 원뜻: ${t.literal}`);
      if (t.elements?.length) L.push(`  - 구성요소: ${t.elements.join(' / ')}`);
      if (t.analogy) L.push(`  - 비유: ${t.analogy}`);
      if (t.why_it_matters) L.push(`  - 왜 중요: ${t.why_it_matters}`);
    }
    L.push('');
  }
  if (cs?.homework) {
    const h = cs.homework;
    L.push(`**숙제 — ${h.title || ''}${h.est_min ? ` (예상 ${h.est_min}분)` : ''}**`);
    if (h.goal) L.push(`목표: ${h.goal}`);
    if (h.steps?.length) { L.push(''); for (const s of h.steps) L.push(`${/^\s*\d/.test(s) ? '' : '- '}${s}`); }
    if (h.deliverable) L.push(`\n- 📤 제출물: ${h.deliverable}`);
    if (h.if_stuck) L.push(`- 🆘 막히면: ${h.if_stuck}`);
    L.push('');
  }
  L.push('---\n');
  return L.join('\n');
}

for (const s of sessOrder) {
  const clips = bySession[s]; if (!clips) continue;
  const meta = SESS[s] || { name: s, intro: '' };
  const dist = {}; clips.forEach((c) => dist[c.format] = (dist[c.format] || 0) + 1);
  const distStr = Object.entries(dist).map(([k, v]) => `${FMT_KO[k] || k} ${v}`).join(' · ');
  const L = [];
  L.push(`# ${s} — ${meta.name}\n`);
  L.push(`> ${meta.intro}\n`);
  L.push(`**클립 ${clips.length}개 · 포맷: ${distStr}**\n`);
  L.push('## 클립 한눈에\n');
  L.push('| # | 제목 | 포맷 | 역할 |');
  L.push('|---|---|---|---|');
  for (const c of clips) L.push(`| ${c.session}-${clipNum(c.id)} | ${c.title} | ${FMT_KO[c.format] || c.format} | ${c.why} |`);
  L.push('\n---\n');
  L.push('## 클립별 상세 (학습목표 · 개념요소 · 숙제)\n');
  for (const c of clips) L.push(clipDetail(c));
  fs.writeFileSync(path.join(CUR, `${s}.md`), L.join('\n'));
}

// 마스터 README
{
  const L = [];
  L.push(track === 'byb2'
    ? '# 「바이브코딩 심화」 강의 (IoT 풀스택·임베디드) — 커리큘럼 정리\n'
    : '# 12시간 「바이브코딩 기초」 강의 — 커리큘럼 정리\n');
  L.push(track === 'byb2'
    ? `입문 과정 수료자 대상 · ${sessOrder.filter((s) => bySession[s]).length}개 세션 · 총 ${plan.clips.length}개 클립(제품 만들기 중심)\n`
    : `부경대·경성대 비전공 입문자 대상 · 6개 세션(S1–S6, S4b 포함) · 총 ${plan.clips.length}개 클립(클립당 8~12분)\n`);
  L.push('각 클립은 **개념요소(단어 뜯어보기)** 와 **구체적 숙제**(번호 단계+제출물+막히면 칠 프롬프트)를 반드시 포함합니다. 외부 CTA(구독·썸네일) 없음.\n');
  L.push('## 세션 개요\n');
  L.push('| 세션 | 주제 | 클립 | 포맷 분포 |');
  L.push('|---|---|---|---|');
  for (const s of sessOrder) {
    const clips = bySession[s]; if (!clips) continue;
    const dist = {}; clips.forEach((c) => dist[c.format] = (dist[c.format] || 0) + 1);
    const distStr = Object.entries(dist).map(([k, v]) => `${FMT_KO[k] || k} ${v}`).join(', ');
    L.push(`| [${s}](./${s}.md) | ${(SESS[s] || {}).name || s} | ${clips.length} | ${distStr} |`);
  }
  L.push('\n## 세션별 목표\n');
  for (const s of sessOrder) { if (!bySession[s]) continue; L.push(`### ${s} — ${(SESS[s] || {}).name || s}`); L.push(`${(SESS[s] || {}).intro || ''}\n`); }
  const total = {}; plan.clips.forEach((c) => total[c.format] = (total[c.format] || 0) + 1);
  L.push('## 전체 포맷 분포 (멀티포맷 — 단조로움 방지)\n');
  for (const [k, v] of Object.entries(total)) L.push(`- ${FMT_KO[k] || k}: ${v}개`);
  L.push('\n> 멀티포맷 설계: 정의·요약은 슬라이드, 실습·실제 출력은 터미널, 커밋 흐름은 Git 그래프, 훅·시각 결과물은 몽타주로 분리해 한 포맷이 60%를 넘지 않게 구성.');
  fs.writeFileSync(path.join(CUR, 'README.md'), L.join('\n'));
}

// ---------- 3) 로그 정리 ----------
let logCopied = 0;
for (const c of plan.clips) {
  const lf = path.join(OUT, `${c.id}.log`);
  if (fs.existsSync(lf)) { fs.copyFileSync(lf, path.join(LOG, friendly(c) + '.log')); logCopied++; }
}
for (const extra of ['_render-pass-summary.txt']) {
  const ef = path.join(OUT, extra);
  if (fs.existsSync(ef)) fs.copyFileSync(ef, path.join(LOG, extra));
}
// 렌더 로그 요약(클립별 상태 + 로그 끝 의미 있는 줄)
{
  const L = [];
  L.push('# 렌더 로그 요약\n');
  L.push(`완성 ${copied} · 렌더중 ${rendering} · 대기 ${pending} / 전체 ${plan.clips.length}\n`);
  L.push('| 클립 | 상태 | 용량 | 로그 마지막 신호 |');
  L.push('|---|---|---|---|');
  for (const r of rows) {
    const lf = path.join(OUT, `${r.c.id}.log`);
    let last = '(로그 없음)';
    if (fs.existsSync(lf)) {
      const lines = fs.readFileSync(lf, 'utf8').split(/\r?\n/).filter((x) => x.trim());
      const sig = [...lines].reverse().find((x) => /done|error|render]|1008|insufficient|balance|✓|✗|MB/i.test(x));
      last = (sig || lines[lines.length - 1] || '').replace(/\[\d+m/g, '').slice(0, 90);
    }
    const icon = r.status === 'done' ? '✅' : r.status === 'rendering' ? '🔄' : '⏳';
    L.push(`| ${r.c.id} | ${icon} | ${r.status === 'done' ? fmtMB(r.mb) : '—'} | ${last} |`);
  }
  fs.writeFileSync(path.join(LOG, '_렌더로그-요약.md'), L.join('\n'));
}

console.log(`[organize] 영상 복사 ${copied} (렌더중 ${rendering}, 대기 ${pending}) · 로그 ${logCopied}개 · 커리큘럼 ${sessOrder.filter((s) => bySession[s]).length}세션`);
console.log(`[organize] -> ${REVIEW}`);
