# 구성 원칙 + 절대 규칙

## 구성 원칙 (PPT 범벅 방지)
- **슬라이드 지배 ≈ 70% + 관련 비주얼 ≈ 30%.** 무관한 스톡/AI 이미지 도배 금지.
- **개념은 불릿보다 도식.** `flow`(흐름)·`pair`(단어 쪼개기)를 코드로 그린다 — 무료.
- **예시는 진짜 코드/출력.** 터미널은 `mktemp -d`에서 실제 실행해 캡처. 지어낸 출력 금지.
- **자막은 문장 단위 한 줄씩 순차**(자동). 내레이션 6줄 덩어리 금지.
- 비용 순서: **무료**(도식·슬라이드·코드) → **저렴**(Stability 이미지) → **음성은 voicebox(무료)**. 유료 TTS·MiniMax 완전 중단.

## 자산 드롭인 (생성 0원)
build는 아래 파일이 있으면 그대로 사용:
- 사진 `public/factory/<id>/img/sNN.jpg` (Stability: `node factory/gen-stability.mjs <id>`)
- 영상 `public/factory/<id>/clip/sNN.mp4` (무료 스톡: `node factory/gen-stock.mjs <id>` — Pexels/Pixabay)
- 음성 `public/factory/<id>/audio/sNN.mp3` (voicebox)

⚠️ 씬에 `"video"` 마커 있는데 `clip/sNN.mp4`가 없으면 build가 외부 API를 호출 → **항상 `--no-video`로 빌드.**

## 절대 규칙
- **구독/subscribe/썸네일/알림 CTA 금지**(교차 게시). 끝맺음은 다음 편 예고만. [[no-subscribe-cta]]
- **한국어 응답.** 친근한 존댓말, 영어 용어 첫 등장은 "한글(English)".
- **예시·명령·출력은 실제 확인한 것만.**
- **음성은 MyVoice 클론(Qwen3-TTS-1.7B) 한 가지.** 양산=RunPod GPU 12-way([cloud-production.md](cloud-production.md)), 한 편/소량=로컬 voicebox. fal·MiniMax·ElevenLabs·DashScope qwen-vc 전면 금지(잘림·음질 사고). 생성 후 길이 검증 필수. [[fal-tts-truncation-bug]] [[production-voice-split]]
- **검증 없이 양산 금지.** 항상 still → Read 확인 → render.

## 다른 템플릿 (대부분은 montage 하이브리드면 충분)
- **terminal**(`TerminalVideo`): 명령+실제 출력, 개념은 `diagram`(kind:"annot") 콜아웃. 예: `byb-s3-09`.
- **slides/gitgraph**: 순수 정의/표 → slides, 커밋 DAG → gitgraph.
