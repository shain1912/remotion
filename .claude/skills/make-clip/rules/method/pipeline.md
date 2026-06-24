# 파이프라인 — 순서대로, 매 단계 검증

video-production의 규율 + 우리 Remotion 엔진. **한 편을 레퍼런스로 완성 → 프레임 확인 → 그다음 확장.** 재작업은 **바뀐 씬만**.

## 0. 스토리보드 (빌드 전)
`rules/method/storyboard-template.md`를 채운다. 포맷(16:9 1920×1080 / 9:16 1080×1920), 길이, 톤, 씬 수를 먼저 정한다. **씬당 내레이션 60초 이하**(음성 드리프트 방지).

## 1. project.json 설계
한 클립 = 한 `factory/projects/<id>/project.json`. 역할(role)은 `kicker`+내용으로 유도 → `rules/method/roles.md`. 씬마다 `id`+`narration` 필수. 자막은 자동(TTS 타이밍).

## 2. 음성 — voicebox (사이드카 생성)
```bash
node factory/gen-voice-voicebox.mjs <id>     # 로컬 voicebox(MyVoice/ko), 직렬, mp3+사이드카
```
- 씬마다 `public/factory/<id>/audio/sNN.mp3` + 사이드카(`durationMs`·`subtitles`·`sig`) 생성. `sig`가 build의 voiceSig와 일치 → build가 캐시 사용.
- **직렬 처리 필수**(voicebox는 병렬 요청 시 500 → 앱 재시작). 상세 → `rules/method/voice.md`.
- 유료 TTS(fal/qwen/MiniMax) **사용 금지**.

## 3. 빌드
```bash
node factory/build.mjs <id> --no-video       # project.json + 음성/이미지 캐시 → public/factory/<id>/build.json
```
`--no-video` 항상(영상 마커 있는데 clip 없으면 build가 외부 API 호출하는 것 방지).

## 4. ★ 프레임 검증 게이트 (렌더 전 필수 — 절대 생략 금지)
```bash
node factory/still.mjs <id> 245,1225,3185,8575   # 역할이 다른 씬들의 중간 프레임
```
→ `factory/_verify/still_<id>_<frame>.png`를 **Read로 직접 본다.** 확인: 텍스트 가독성, 오버플로/잘림 없음, 역할 오탐 없음, 브랜드 색, **음성 길이 ≈ 비주얼 길이**. 문제 있으면 **그 씬만** 고쳐 재생성. → `rules/method/verification.md`.

## 5. 렌더 (GPU)
```bash
node factory/render.mjs <id>                 # gl:'angle' + NVENC
```

## 6. 검증
```bash
node factory/validate-course.mjs <id>        # 자문용 게이트(슬라이드 지배형은 image 경고 오탐 가능)
```

## 7. 양산 (여러 편)
한 편을 still 검증으로 레퍼런스 확정한 뒤에만 확장. 멱등 마커(`_state/*.voiced|.rendered`). 엔진 변경 후 전체 재렌더는 `_state/*.rendered`만 지운다(음성 마커 두면 재생성 0).

**규칙:** 새 클립/새 역할/엔진 변경 후엔 반드시 **still → Read 확인 → render**. "설계만 하고 바로 양산"이 품질 저하의 근본 원인이었다.
