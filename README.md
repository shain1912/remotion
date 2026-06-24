# 🎬 AI Lecture Video Factory (Remotion)

한국어 강의·설명 영상을 **레퍼런스 품질로 한 편씩 검증하며 양산**하는 파이프라인.
Remotion 엔진 + `make-clip` 룰베이스 스킬 + 클라우드 음성/렌더 파이프라인으로 구성된다.

> **핵심 철학:** *모델보다, 모델을 감싼 시스템이 품질을 만든다.* 한 편을 레퍼런스로 완성해
> 프레임을 눈으로 확인한 뒤 확장한다. **검증 없는 대량 렌더·업로드는 금지.**

---

## 빠른 시작

```bash
npm install
npx remotion studio          # 스튜디오에서 미리보기 (http://localhost:3000)

# 한 편 만들기 (로컬)
node factory/gen-voice.mjs <id> --profile=MyVoice --engine=qwen   # 음성(로컬 voicebox)
node factory/build.mjs <id> --no-video                            # 사이드카→프로젝트 빌드
node factory/still.mjs <id> <frame>                               # 프레임 STILL로 눈검증
node factory/render.mjs <id>                                      # 로컬 렌더(1080p)
```

`<id>` = `factory/projects/<id>/project.json` 한 개 = 영상 한 편.

---

## `make-clip` 스킬 (이 repo의 핵심)

`.claude/skills/make-clip/` — Claude Code에서 **`/make-clip`** 또는 "클립 만들어/리마스터/양산"
요청 시 자동 발동하는 룰베이스 스킬. 작업 전 관련 룰 파일을 읽고 그대로 따른다.

```
.claude/skills/make-clip/
├── SKILL.md                       # 라우터 + 한 줄 흐름
└── rules/
    ├── method/                    # 우리 파이프라인 (이걸 따른다)
    │   ├── pipeline.md            # 스토리보드→스크립트→음성→빌드→검증→렌더→납품
    │   ├── cloud-production.md     # ★양산: RunPod 음성→Lambda 렌더→R2/LMS + 트러블슈팅
    │   ├── roles.md               # 역할(role) 시스템 + project.json 스키마
    │   ├── voice.md               # 음성(로컬 voicebox/양산 RunPod), sig-skip 버그
    │   ├── verification.md        # STILL QA + 프레임 검증 게이트
    │   ├── principles.md          # 구성 원칙 + 절대 규칙(CTA 금지·한국어·실제 출력만)
    │   ├── storyboard-template.md # 빌드 전 계획 템플릿
    │   └── script-schema.json     # 세그먼트 JSON 형태
    └── remotion/                  # Remotion 기술 참조 28종(애니/차트/자막/폰트/미디어…)
```

**절대 규칙(principles.md):** 구독·썸네일·알림 CTA 금지(교차 게시), 한국어 존댓말,
예시·명령·출력은 실제 확인한 것만, **검증 없이 양산 금지**.

---

## 파이프라인

```
한 편:  스토리보드 → project.json(역할별 씬) → 음성(사이드카) → build --no-video
        → STILL QA(프레임 Read 확인) → render → validate
양산:   project.json들 → RunPod GPU 음성(MyVoice) → 회수 → build
        → ★검증게이트(STILL Read + 음성검사) → Lambda 720p 섹션별 렌더
        → mp4 검증(길이·오디오·크기) → R2/LMS 업로드(섹션별 증분)
```

### ① 음성 — MyVoice 클론 (Qwen3-TTS-1.7B-Base)
- **양산:** RunPod GPU에서 모델을 직접 돌려 12-way 병렬. `factory/cloud/`의
  `runpod.py`(파드 배포/SSH/종료) + `tts_batch.py`(샤딩 TTS). voicebox와 같은 모델이라 음색 동일.
- **한 편/소량:** 로컬 voicebox(`gen-voice.mjs`). ~90초/씬 직렬이라 소량 한정.
- **폐기:** fal(긴 한국어 ~16초 잘림 사고), MiniMax, ElevenLabs, DashScope qwen-vc(음질 불량).
- ⚠️ voicebox는 긴 씬(>500자)·장시간에서 jam → 리부트 필요. 긴 씬은 `_chunk_voice.mjs`로 청크 분할.

### ② 렌더
- **양산:** AWS Lambda 720p(`_lambda-render-one.sh`, `--scale=0.6667`). 편당 ~2.5분, 다편 병렬.
- **소량(1~2편):** 로컬 `render.mjs`(네이티브 1080p, ~15분/편, 무료).
- 3D(Three.js)는 양산에서 제거(Lambda CPU 렌더가 너무 느림). 애니메이션 배경·모션·차트는 OK.

### ③ 납품
- Cloudflare R2 + LMS(섹션별 증분 업로드). 납품 스크립트는 별도 위치(이 repo 밖).

### ④ 검증 게이트 (Phase A/B)
- `_phase-a.sh`: 음성 회수→build→`_audio-check.mjs`(누락·잘림 자동 플래그)→STILL→정지(사람이 확인).
- `_phase-b.sh`: 섹션별 Lambda 렌더→mp4 검증→실패 1회 재시도→**검증 통과분만** 업로드.
- 실패는 편당 격리. "전부 아니면 전무" 아님.

---

## 엔진 템플릿

`src/factory/` — 역할 기반 레이아웃을 자동 선택하는 컴포지션. 데모 프로젝트로 확인:

| 템플릿 | 파일 | 데모 | 용도 |
|---|---|---|---|
| **montage** (기본) | `FactoryVideo.tsx` | — | 표지·용어·프로세스·숙제·정리·코드 등 역할별 레이아웃 자동 |
| terminal | `TerminalVideo.tsx` | `demo-terminal` | 명령+실제 출력(실습) |
| slides | `SlideVideo.tsx` | `demo-slides` | 순수 정의·표·요약 |
| gitgraph | `GitGraphVideo.tsx` | `demo-gitgraph` | 커밋 DAG |
| theory | `TheoryVideo.tsx` | `demo-theory` | 곡선·수식(Big-O 등) |

```bash
node factory/render.mjs demo-terminal     # 데모 한 편 렌더해 엔진 확인
```

---

## 주요 스크립트

| 스크립트 | 역할 |
|---|---|
| `factory/build.mjs` | project.json + 음성 사이드카 → 렌더 가능한 빌드 (`voiceSig` 캐시) |
| `factory/render.mjs` | 로컬 렌더(1080p). `--only <sec>` 섹션 재렌더, `--force` 전체 |
| `factory/gen-voice.mjs` | 로컬 voicebox TTS(MyVoice). `--engine=qwen` |
| `factory/_place-audio.mjs` | RunPod에서 받은 WAV → mp3+사이드카(loudnorm). ⚠️ sig 같으면 스킵 |
| `factory/_audio-check.mjs` | 전 클립 음성 누락·잘림 자동 플래그 |
| `factory/_chunk_voice.mjs` | 긴 씬을 문장 청크로 쪼개 voicebox 생성→concat |
| `factory/_metrics.mjs` | 역할 다양성·길이·음성완결성 메트릭 |
| `factory/_lambda-render-one.sh` | Lambda 렌더 1편 + S3 회수 (멱등) |
| `factory/_phase-a.sh` / `_phase-b.sh` | 검증 게이트(A: 빌드·검사, B: 섹션별 렌더·검증·업로드) |
| `factory/cloud/runpod.py` | RunPod 파드 배포/상태/종료 (GraphQL) |
| `factory/cloud/tts_batch.py` | 파드에서 MyVoice 샤딩 TTS (resume 지원) |

---

## 설정 (.env — git 미추적)

```bash
RUNPOD_API_KEY=...        # 양산 음성 (factory/cloud/runpod.py)
# AWS 자격증명은 aws cli/env로 (Lambda 렌더)
# R2/LMS 자격증명은 납품 스크립트 위치의 .env에 (이 repo 밖)
```

RunPod 음성: 클론 레퍼런스 WAV + 전사(`ref/myvoice_ref.wav`, `output/myvoice_ref.txt`)를
파드에 올려 `Qwen/Qwen3-TTS-12Hz-1.7B-Base` 클론으로 생성. 자세한 절차는
`rules/method/cloud-production.md`.

---

## 비용 (128편 기준 실측)

RunPod 음성 ~$4 + Lambda 렌더 720p ~$42 + R2 소액 ≈ **~$46**. (1080p Lambda면 ~$84 → 720p 권장.)

---

## 라이선스 / 콘텐츠

엔진·스크립트·`make-clip` 스킬은 재사용 가능. **개별 강의 콘텐츠(`factory/projects/byb-*`,
완성본, 음성/이미지 에셋)는 이 repo에 포함하지 않는다**(`.gitignore` 참조) — 프로젝트별 산출물.
