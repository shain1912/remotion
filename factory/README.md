# 🏭 AI YouTube Factory

토픽 하나를 **검수만 하면 완성되는 한국어 유튜브 영상**으로 바꾸는 양산 파이프라인.
두 레퍼런스 영상의 노하우를 코드로 구현했습니다.

- **제작 기법 (영상 1):** 생성 전에 **ASCII로 레이아웃을 먼저 합의** → 일관성 + 비용 절약. 사람은 검수, 기계는 생성.
- **비즈니스 모델 (영상 2):** **영상당 이미지 많이 + 빠른 컷** → 시청지속↑ → 알고리즘 노출↑. 영상당 리소스를 줄여 **많이 올리는 것**이 핵심.

엔진은 **MiniMax**(이미지·영상·TTS) + **Remotion**(조립·렌더)으로 구성됩니다.

---

## 📦 스킬 설치 (Claude Code 플러그인)

방법론 스킬 10종은 **플러그인 마켓플레이스**로 배포합니다 (이 레포 자체가 마켓플레이스):

```text
/plugin marketplace add shain1912/remotion
/plugin install ai-video-factory@shain-factory
```

설치 후 스킬이 자동 트리거되거나 `/ai-video-factory:youtube-factory` 처럼 호출됩니다.
업데이트: `/plugin marketplace update shain-factory` → `/reload-plugins`.
플러그인 소스: `plugins/ai-video-factory/` · 마켓플레이스 매니페스트: `.claude-plugin/marketplace.json`.

> 스킬은 *방법론·명령어*를 제공합니다. 실제 생성은 이 레포의 `factory/` 엔진 + `.env`의 MiniMax 키가 필요합니다.
> 로컬 테스트는 `/plugin marketplace add ./` 로 먼저 해볼 수 있습니다.

---

## 영상 스타일 3종 (템플릿)

`project.json` 의 `"template"` 필드로 선택합니다. 빌드·렌더 명령은 모두 동일하고, 내레이션은 셋 다 같은 보이스(`shainvoice01`)를 씁니다.

| 템플릿 | 느낌 | 자산 | 적합 니치 | 데모 |
|---|---|---|---|---|
| `montage` | AI 이미지 빠른 컷 + 훅 클립 | MiniMax 이미지·Hailuo 영상 | 경제·시사·무협·이슈 | `out/demo-git.mp4` |
| `slides` | 클로드 감성 키노트 슬라이드 | **코드 드로잉**(이미지 생성 X) | 개념·정리·교육 | `out/demo-slides.mp4` |
| `theory` | 3Blue1Brown형 이론 시각화 | **코드 드로잉**(그래프·수식) | CS·수학 강의 | `out/demo-theory.mp4` |

`slides`·`theory` 는 이미지 생성이 없어 **빠르고 거의 무료**(내레이션 TTS만). `montage` 만 이미지·영상 API를 씁니다.

각 스타일의 장면 스키마:
- **montage**: `{ narration, caption, imagePrompt, motion, video? }`
- **slides**: `{ narration, kicker?, title, bullets?[], stat?{value,label}, note? }`
- **theory**: `{ narration, phase: title|axes|curve|compare|outro, curve?, label?, sub?, title?, subtitle? }`

---

## 🖥 웹 UI — Factory Studio (가장 쉬운 방법)

```bash
npm run studio        # 백엔드(API :3030) + 프론트(:5173) 동시 실행 → 브라우저 자동 오픈
```

단계별 위저드로 영상을 뽑습니다:
1. **시작** — 템플릿 선택(몽타주/슬라이드/이론) · 제목 · ID (예시로 시작 가능)
2. **섹션 · 장면** — 섹션을 나누고, 장면별로 프롬프트 입력 (예시 placeholder, 생략 가능 항목은 **고급 옵션**에 숨김)
3. **고급 옵션** — 보이스(속도·피치·볼륨) · 강조색 · 해상도 (기본값으로 둬도 됨)
4. **생성** — 저장 → 빌드 → 렌더, **진행 로그 실시간** + **미리보기 플레이어**, 섹션별 재렌더 버튼

> 보안: API 키는 백엔드(`factory/server.mjs`)에만 있고 브라우저로 노출되지 않습니다.

---

## ⌨️ CLI (한 편 만들기)

```bash
# 0) 스토리보드(project.json)를 factory/projects/<id>/ 에 작성 (ASCII-first로 먼저 합의)

# 1) 스모크 — 앞 3장면만, 클립 없이 (저비용 검증)
node factory/build.mjs <id> --limit 3 --no-video
node factory/still.mjs <id> 30          # 한 프레임 눈으로 확인

# 2) 풀 빌드 (재실행 안전 — 이미 만든 자산은 건너뜀)
node factory/build.mjs <id>

# 3) 렌더
node factory/render.mjs <id>            # -> out/<id>.mp4
```

`<id>` 예: `demo-git`

### 30분 영상 = 섹션별로 뽑아 합치기 (수정 가능)

`project.json` 의 각 장면에 `"section": "intro"` 처럼 태그를 달면, 연속된 장면들이 섹션으로 묶입니다.

```bash
node factory/render.mjs <id>                 # 모든 섹션 렌더 → out/<id>/sections/*.mp4 → 합쳐서 out/<id>.mp4
node factory/render.mjs <id> --only intro    # ⭐ 수정한 섹션 하나만 다시 렌더 + 재합치기 (나머지 28개 섹션은 건드리지 않음)
node factory/render.mjs <id> --force         # 모든 섹션 강제 재렌더
```

→ 30분 영상도 한 섹션(2~3분)만 고쳐 빠르게 재렌더합니다. 합치기는 ffmpeg(`ffmpeg-static`)으로 자동.

---

## 파일 지도

| 파일 | 역할 |
|---|---|
| `factory/projects/<id>/project.json` | **단일 진실원천** — 장면별 내레이션·캡션·이미지프롬프트·모션·(옵션)클립 |
| `factory/lib/minimax.mjs` | MiniMax 클라이언트 (`generateImage` / `generateVideo` / `tts` / `listVoices`) |
| `factory/build.mjs` | project.json → 보이스+이미지(+클립) 생성 → `public/factory/<id>/build.json` |
| `factory/render.mjs` | 헤드리스 Remotion 렌더 (CLI 불필요) → `out/<id>.mp4` |
| `factory/still.mjs` | QA용 1프레임 PNG |
| `src/factory/FactoryVideo.tsx` | 데이터 기반 조립 컴포지션 (빠른 컷 + 캡션 + 자막 + 장면 오디오) |
| `public/factory/<id>/` | 생성 자산(`audio/ img/ clip/`) + `build.json` 매니페스트 |

---

## 키 배분 (비용 전략)

`.env` 의 MiniMax 키 4개를 용도별로 분리합니다 (`factory/lib/minimax.mjs` 가 자동 처리):

| 키 | 용도 | 비고 |
|---|---|---|
| `MINIMAX_API_KEY1` | **TTS 전용** | 사용자 클로닝 보이스 `shainvoice01` 보유, 잔액 적음 |
| `MINIMAX_API_KEY2/3/4` | **이미지 · 영상** | 잔액 많음, 라운드로빈 + 실패 시 자동 전환 |

경제성: 이미지 약 **$5 / 1000장** ≈ 영상 한 편 수천 원. → 많이 만들어 많이 올린다.

---

## 모션 프리셋 (`scene.motion`)

`kenburns-in` · `kenburns-out` · `pan-left` · `pan-right`
첫 1~2 장면은 `video` 필드로 Hailuo 클립(스크롤 정지 훅), 나머지는 정지 이미지 + 모션 = 영상 2의 저비용 하이브리드.

---

## 스킬 (.claude/skills/)

방법론은 스킬에 들어 있습니다 — Claude가 자동으로 불러 씁니다:

- `youtube-factory` — 전체 파이프라인 오케스트레이터 (시작점)
- `topic-miner` — 주제 선정 (트렌드 마이닝)
- `viral-script-writer` — 후킹·리텐션 대본
- `scene-storyboard` — ASCII-first 스토리보드 + 이미지 프롬프트 → project.json (montage)
- `minimax-media` — 이미지·영상·음성 생성 레퍼런스
- `remotion-assembler` — 빠른 컷 조립·렌더 + 3종 템플릿 라우팅
- `slide-explainer` — 🆕 클로드 감성 슬라이드 영상 (`slides`)
- `theory-viz` — 🆕 3Blue1Brown형 이론 시각화 (`theory`)
- `thumbnail-designer` — 고CTR 썸네일
- `ad-creative` — (보너스) 카드뉴스·쇼츠 광고

---

## 양산으로 확장

1. `topic-miner` 로 니치별 핫한 주제 10개 뽑기 (경제·시사 = CPM↑, 무협, AI·개발)
2. 주제마다 `youtube-factory` 반복 → 각 `factory/projects/<topic>/`
3. 채널별·일자별로 배치 빌드/렌더. 빌드는 재실행 안전하므로 중단·재개 자유.
