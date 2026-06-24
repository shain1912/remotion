---
name: make-clip
description: >
  Produce Korean lecture video clips on the Remotion factory engine (v3 FactoryVideo): plan a
  storyboard, write a structured per-scene script, voice it (MyVoice clone), build, VERIFY frames,
  render, deliver. ONE clip locally for verification; 양산(수십~수백 편) via the cloud pipeline
  (RunPod GPU voice → AWS Lambda render → R2/LMS upload). Each scene gets a bespoke editorial layout
  chosen by its role (표지·용어·프로세스·숙제·정리·코드·진술·리스트) — diagrams and real code over
  bullet walls, one-line sequential subtitles. USE THIS whenever the user wants to make / remake /
  improve / 양산 factory clips, add diagrams / images / motion, drop in media, fix a "PPT 범벅 /
  같은 틀 / 자막 6줄" clip. Rule-based: read the relevant rule files before acting. NEVER bulk-render
  or bulk-upload unseen — verification gate first.
---

# make-clip — 한 클립을, 레퍼런스 수준으로 (v3, 룰베이스)

**핵심 교훈(video-production 출처):** *모델보다, 모델을 감싼 시스템이 품질을 만든다.* 그래서 파이프라인을 충실히 따르고 **매 단계 검증**한다. 한 편을 레퍼런스로 완성해 프레임 확인 → 그다음 확장. 바뀐 세그먼트만 재생성.

- **엔진:** Remotion `src/factory/FactoryVideo.tsx`(template `montage`) + `factory/build.mjs`. 한 클립 = 한 `project.json`. 배경 애니메이션 O, **3D는 제거**(Lambda 렌더 너무 느려서 — 애니배경만 유지).
- **음성:** **MyVoice 클론**(Qwen3-TTS-1.7B). 한 편은 로컬 voicebox(`gen-voice.mjs`), **양산은 RunPod GPU 12-way**(로컬은 ~90s/씬이라 양산 불가). fal·DashScope qwen-vc·MiniMax는 품질/잘림으로 폐기.
- **렌더:** 한 편은 로컬 GPU(`render.mjs`), **양산은 AWS Lambda 720p**. → `rules/method/cloud-production.md`
- **검증 레퍼런스 클립:** `byb-s1-01`.

## 룰 파일 — 작업 전에 해당 룰을 읽어라

### 방법론 (우리 파이프라인)
- [rules/method/pipeline.md](rules/method/pipeline.md) — 스토리보드→스크립트→음성→빌드→**프레임 검증 게이트**→렌더→검증. 한 편 기준.
- [rules/method/cloud-production.md](rules/method/cloud-production.md) — ★**양산(수십~수백 편)**: RunPod GPU 음성(MyVoice/Qwen3-TTS) → Lambda 720p 렌더 → R2/LMS 납품 + 섹션별 검증 게이트. 실전 노하우·인프라·비용.
- [rules/method/roles.md](rules/method/roles.md) — v3 역할(role) 시스템 + `project.json` 스키마. 씬마다 다른 레이아웃을 kicker로 유도.
- [rules/method/voice.md](rules/method/voice.md) — 한 편/소량 **로컬 voicebox**(양산은 RunPod) + 직렬·jam 제약, **place-audio sig-skip 버그**, mp3+사이드카(build sig 일치).
- [rules/method/verification.md](rules/method/verification.md) — STILL QA + 프레임 검증 게이트(렌더 전 필수). 깨짐·오버플로·길이 불일치 확인.
- [rules/method/principles.md](rules/method/principles.md) — 구성 원칙(PPT 범벅 방지) + 절대 규칙(CTA 금지·한국어·실제 출력만).
- [rules/method/storyboard-template.md](rules/method/storyboard-template.md) — 빌드 전 채우는 계획 템플릿.
- [rules/method/script-schema.json](rules/method/script-schema.json) — 세그먼트 JSON 형태(세그먼트당 내레이션 60초 이하).

### Remotion 기술 룰 (28개 참조) — `rules/remotion/`
**다채롭게 — 단, 양산 렌더 비용 고려.** 애니메이션 배경·텍스트 모션·트랜지션·차트는 OK. ⚠️ **3D(Three.js)는 양산에서 제거**(Lambda CPU 렌더가 너무 느려짐). Lottie·GIF는 에셋 있을 때만. 새 레이아웃/모션은 해당 룰을 읽고 엔진에 반영:
- 모션: [animations.md](rules/remotion/animations.md) · [timing.md](rules/remotion/timing.md) · [transitions.md](rules/remotion/transitions.md) · [text-animations.md](rules/remotion/text-animations.md)
- 리치 비주얼: [3d.md](rules/remotion/3d.md)(Three.js) · [lottie.md](rules/remotion/lottie.md) · [gifs.md](rules/remotion/gifs.md) · [charts.md](rules/remotion/charts.md)
- 미디어: [images.md](rules/remotion/images.md) · [videos.md](rules/remotion/videos.md) · [audio.md](rules/remotion/audio.md) · [assets.md](rules/remotion/assets.md) · [trimming.md](rules/remotion/trimming.md)
- 자막: [display-captions.md](rules/remotion/display-captions.md) · [import-srt-captions.md](rules/remotion/import-srt-captions.md) · [transcribe-captions.md](rules/remotion/transcribe-captions.md)
- 구조: [sequencing.md](rules/remotion/sequencing.md) · [compositions.md](rules/remotion/compositions.md) · [calculate-metadata.md](rules/remotion/calculate-metadata.md)
- 폰트/측정: [fonts.md](rules/remotion/fonts.md) · [measuring-text.md](rules/remotion/measuring-text.md) · [measuring-dom-nodes.md](rules/remotion/measuring-dom-nodes.md)
- 비디오 메타(Mediabunny): [get-video-duration.md](rules/remotion/get-video-duration.md) · [get-audio-duration.md](rules/remotion/get-audio-duration.md) · [extract-frames.md](rules/remotion/extract-frames.md) · [can-decode.md](rules/remotion/can-decode.md) · 그 외 `rules/remotion/`

## 한 줄 흐름
```
한 편:  스토리보드 → project.json(역할별 씬) → 음성(사이드카) → build --no-video
        → STILL QA(프레임 Read 확인) → render → validate
양산:   project.json들 → RunPod GPU 음성(MyVoice) → 회수 → build
        → ★검증게이트(STILL Read + 음성검사) → Lambda 720p 섹션별 렌더
        → mp4 검증 → R2/LMS 업로드(섹션별 증분)   ← cloud-production.md
```
디테일은 위 룰 파일에. **검증 없이 대량 렌더/업로드 금지.**
