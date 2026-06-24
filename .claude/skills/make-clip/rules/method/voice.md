# 음성 — 한 편은 로컬 voicebox, 양산은 RunPod GPU(MyVoice)

> ★ **양산(수십~수백 편)은 이 파일이 아니라 [cloud-production.md](cloud-production.md)** — voicebox 로컬은 ~90초/씬 직렬이라 양산 불가. RunPod GPU에 같은 Qwen3-TTS-1.7B(MyVoice 클론) 12-way로 ~3시간. 아래는 한 편 만들기·검증용 로컬 경로.

## voicebox 로컬 — 한 편/소량(마감 보정)용

**유료 TTS 전면 폐기:** fal(긴 한국어 ~16초 잘림 → $200 손실), MiniMax, ElevenLabs, **DashScope qwen-vc(음색·볼륨 -30 LUFS 불량 → 사용자 거부)** 모두 안 씀. 최종 음성은 **MyVoice 클론(Qwen3-TTS-1.7B-Base) 한 가지**.
- **양산:** RunPod GPU 12-way([cloud-production.md](cloud-production.md)). 이게 표준.
- **한 편/소량(1~2편):** 로컬 voicebox(`gen-voice.mjs --profile=MyVoice --engine=qwen`). 같은 모델이라 음색 동일, 다만 ~90초/씬 직렬이라 소량 한정.

⚠️ **voicebox 장시간/긴 씬 jam:** 긴 나레이션(>500자)이나 오래 켜둔 뒤엔 CUDA 백엔드가 jam — `generating`에서 안 끝나고 앱 재시작으로도 안 풀림 → **컴퓨터 리부트**해야 복구. 마감 1~2씬이 이렇게 막히면 리부트 대신 **RunPod 1씬(~$0.03)**이 더 쌈. 긴 씬을 굳이 voicebox로 뽑으려면 `factory/_chunk_voice.mjs <id> <sid>`(문장 ~180자 청크로 쪼개 각각 생성→loudnorm concat) — 단 백엔드가 완전 jam이면 청크도 실패.

## voicebox 개요
- 로컬 서버: `http://127.0.0.1:17493`. 헬스: `GET /health` → 200. 앱이 떠 있어야 함.
- REST 플로우: `GET /profiles` → `POST /generate {profile_id,text,language,engine}` → `GET /history/{id}` 폴링(completed) → `GET /audio/{id}` (WAV).
- 클론 보이스 프로필: **`MyVoice`** (ko).
- 엔진(품질/속도 레버): **`qwen` 사용**(기본, 정상 풀길이, ~3분/씬. 검증: 313자→39초=8자/초 정상). ⚠️ **`chatterbox_turbo` 쓰지 말 것** — 1샘플 클론에서 거의 빈 오디오(긴 문단도 0.6~2초)를 냄. 데모도 qwen으로.

## ⚠️ 절대 제약 — 직렬 처리
**한 번에 여러 speak를 동시에 쏘지 말 것.** voicebox는 직렬 백엔드라 ~20개+ 동시 요청 시 모든 요청에 HTTP 500 → **앱 재시작 필요**. 반드시 **씬 하나씩 순차** 생성. 동시성 풀 쓰지 말 것. 멀티에이전트가 동시에 voicebox를 때려도 충돌.

## 스크립트 (이미 존재: `factory/gen-voice.mjs`)
```bash
node factory/gen-voice.mjs <id> --profile=MyVoice --engine=qwen          # 본편/데모 모두 qwen(정상 풀길이)
node factory/gen-voice.mjs <id> --profile=MyVoice --engine=qwen --limit=N --force   # 일부만 / 강제 재생성
```
씬마다 **순차** 처리:
1. `POST /generate` → `/history/{id}` 폴링 → `/audio/{id}` (WAV).
2. ffmpeg-static으로 WAV→`public/factory/<id>/audio/sNN.mp3`.
3. voicebox가 보고한 길이 → 사이드카 `sNN.json` 작성:
   ```json
   { "durationMs": <측정값>, "subtitles": [{ "text": "<narration>", "time_begin": 0, "time_end": <durationMs> }], "sig": "<voiceSig>" }
   ```
4. `sig`는 build.mjs의 `voiceSig(narration)`와 동일하게 계산(`sha1([narration, voiceId, model, speed, pitch, vol, emotion]).slice(0,16)`). 일치해야 `build.mjs --no-video`가 캐시로 사용 → 재생성 0.

## 품질 게이트 (지난 사고 재발 방지)
- **생성 직후 길이 검증:** 각 씬 `durationMs`가 내레이션 글자수/7(자초) 기대값의 45% 미만이면 **잘림으로 간주 → 그 씬만 재생성.** [[fal-tts-truncation-bug]] (`factory/_audio-check.mjs`가 전 클립 누락·잘림 자동 플래그.)
- **⚠️ place-audio sig-skip 버그:** `_place-audio.mjs`는 사이드카 `sig`가 같으면 스킵 → **음성을 교체했는데 옛 오디오가 그대로 남는 사고**(43편 옛 DashScope 음성 납품, 재렌더 ~$20 손해). 음성 교체 시 `public/factory/<id>/audio/<sid>.{mp3,json}` **먼저 삭제** 후 재배치.
- **loudnorm 표준:** 모든 음성 `loudnorm=I=-16:TP=-1.5:LRA=11`, 사이드카 `normalized:true`. 납품 후 볼륨만 보정은 `H:\moodle\_volume_fix.mjs`(오디오만 2-pass, 재렌더 0).
- 음성을 **안 듣고/안 보고 대량 렌더 금지.** 1편 만들면 프레임 검증(`rules/method/verification.md`)에서 음성 길이≈비주얼 길이도 같이 확인.

## 데모/급할 때
샘플 검증용으로는 아무 빠른 TTS로 사이드카만 채워도 됨(파이프라인 확인 목적). 단 **배포용 본편은 voicebox**.
