// Template field schemas for the Factory Studio wizard.
// Each template declares the per-scene fields, with EXAMPLES (placeholders) and which
// fields are "advanced" (collapsed by default).

export type Field = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'bullets' | 'toggle';
  example?: string;
  advanced?: boolean;
  options?: string[];
  showIf?: (s: any) => boolean;
};

export type TemplateDef = {
  key: 'montage' | 'slides' | 'theory';
  name: string;
  tagline: string;
  desc: string;
  niche: string;
  cost: string;
  accent: string;
  bg?: string;
  imageSuffix?: string;
  sceneFields: Field[];
  newScene: (i: number) => any;
};

export const MOTIONS = ['kenburns-in', 'kenburns-out', 'pan-left', 'pan-right'];

export const TEMPLATES: Record<string, TemplateDef> = {
  montage: {
    key: 'montage',
    name: '몽타주',
    tagline: 'AI 이미지 빠른 컷',
    desc: 'MiniMax 이미지 + Hailuo 훅 클립을 빠른 컷으로. 시청지속↑. 경제·시사·이슈·무협에 강함.',
    niche: '경제·시사·이슈·무협',
    cost: '이미지·영상 API 사용',
    accent: '#22d3a6',
    bg: '#0a0e14',
    imageSuffix: 'dark cinematic 3D render, teal and amber rim lighting, shallow depth of field, volumetric glow, ultra detailed, no text, 16:9 cinematic',
    sceneFields: [
      { key: 'narration', label: '내레이션 (음성)', type: 'textarea', example: '깃 명령어, 아직도 외우고 계세요?' },
      { key: 'caption', label: '큰 자막 (훅)', type: 'text', example: '아직도 외우세요?' },
      { key: 'imagePrompt', label: '이미지 프롬프트 (영어, 글자 없이)', type: 'textarea', example: 'a stressed developer staring at red git error code on monitors, dark room' },
      { key: 'motion', label: '모션', type: 'select', options: MOTIONS, advanced: true },
      { key: '_useVideo', label: 'AI 영상 클립으로 (훅 전용·느림·비쌈)', type: 'toggle', advanced: true },
      { key: '_videoPrompt', label: '영상 모션 프롬프트', type: 'text', example: '[Push in] the developer slowly leans back', advanced: true, showIf: (s) => s._useVideo },
    ],
    newScene: (i) => ({ id: `s${String(i).padStart(2, '0')}`, narration: '', caption: '', imagePrompt: '', motion: 'kenburns-in' }),
  },
  slides: {
    key: 'slides',
    name: '슬라이드',
    tagline: '클로드 감성 키노트',
    desc: '따뜻한 페이퍼 배경 · 세리프 제목 · 순차 등장 불릿. 이미지 생성 없이 코드로 그림 → 빠르고 거의 무료. 개념·정리·교육에 최적.',
    niche: '개념·정리·교육',
    cost: '거의 무료 (음성만)',
    accent: '#CC785C',
    sceneFields: [
      { key: 'title', label: '제목', type: 'text', example: '바이브 코딩이란?' },
      { key: 'narration', label: '내레이션 (음성)', type: 'textarea', example: '바이브 코딩은 AI에게 의도를 말하면 코드를 생성·수정해 주는 방식입니다.' },
      { key: 'bullets', label: '불릿 (한 줄씩 등장)', type: 'bullets', example: "AI에게 '의도'를 말하면 코드 생성" },
      { key: 'kicker', label: '키커 (작은 라벨)', type: 'text', example: '정의', advanced: true },
      { key: 'note', label: '노트 (한 줄 부연)', type: 'text', example: '5분이면 충분합니다.', advanced: true },
      { key: '_statValue', label: '스탯 숫자', type: 'text', example: '10x', advanced: true },
      { key: '_statLabel', label: '스탯 라벨', type: 'text', example: '빠른 프로토타이핑', advanced: true },
    ],
    newScene: (i) => ({ id: `s${String(i).padStart(2, '0')}`, title: '', narration: '', bullets: [] }),
  },
  theory: {
    key: 'theory',
    name: '이론 시각화',
    tagline: '3Blue1Brown형',
    desc: '다크 좌표평면에 곡선·수식이 그려지는 애니메이션. 이미지 생성 없이 코드로 그림. CS·수학 강의에 최적.',
    niche: 'CS·수학 강의',
    cost: '거의 무료 (음성만)',
    accent: '#58C4DD',
    sceneFields: [
      { key: 'phase', label: '단계', type: 'select', options: ['title', 'axes', 'curve', 'compare', 'outro'] },
      { key: 'narration', label: '내레이션 (음성)', type: 'textarea', example: 'O(log n)은 매번 절반씩 줄여 나갑니다.' },
      { key: 'title', label: '제목 (title/outro)', type: 'text', example: '시간 복잡도', showIf: (s) => s.phase === 'title' || s.phase === 'outro' },
      { key: 'subtitle', label: '부제 (title)', type: 'text', example: 'Big-O를 눈으로', advanced: true, showIf: (s) => s.phase === 'title' },
      { key: 'curve', label: '곡선 종류', type: 'select', options: ['const', 'log', 'linear', 'nlogn', 'quad'], showIf: (s) => s.phase === 'curve' },
      { key: 'label', label: '곡선 수식 라벨', type: 'text', example: 'O(log n)', showIf: (s) => s.phase === 'curve' },
      { key: 'sub', label: '곡선 설명 (하단)', type: 'text', example: '이진 탐색', advanced: true, showIf: (s) => s.phase === 'curve' },
    ],
    newScene: (i) => ({ id: `s${String(i).padStart(2, '0')}`, phase: 'curve', narration: '', curve: 'linear', label: '' }),
  },
};

// turn the editor scene (with _useVideo/_videoPrompt/_statValue/_statLabel helpers) into a
// clean project.json scene
export function exportScene(tplKey: string, s: any): any {
  const out: any = {};
  for (const [k, v] of Object.entries(s)) {
    if (k.startsWith('_')) continue;
    if (v === '' || v == null || (Array.isArray(v) && v.length === 0)) continue;
    out[k] = v;
  }
  if (tplKey === 'montage' && s._useVideo && s._videoPrompt) {
    out.video = { prompt: s._videoPrompt, model: 'MiniMax-Hailuo-2.3-Fast', duration: 6, resolution: '768P' };
  }
  if (tplKey === 'slides' && s._statValue) {
    out.stat = { value: s._statValue, label: s._statLabel || '' };
  }
  return out;
}
