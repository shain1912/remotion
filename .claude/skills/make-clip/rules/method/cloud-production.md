# 클라우드 양산 파이프라인 (검증됨 2026-06-24) — 수백 편을 몇 시간에

로컬은 한 편 만들기·검증용. **수십~수백 편 양산은 클라우드.** 한 시즌의 삽질로 검증한 실전 경로.

```
RunPod GPU(음성, MyVoice) → 회수 → build → ★검증게이트 → Lambda(렌더) → R2+LMS(납품)
```

## ① 음성 — RunPod GPU에 Qwen3-TTS-1.7B (MyVoice 클론)
**왜:** voicebox 로컬은 직렬 ~90초/씬 → 2000씬에 24시간(양산 불가). DashScope qwen-vc·fal은 품질 별로/잘림. **정답 = voicebox가 쓰는 그 오픈 모델을 클라우드 GPU에서 직접 돌리기.**
- 모델: `Qwen/Qwen3-TTS-12Hz-1.7B-Base` (HF, Apache-2.0, ~4.3GB). 패키지 `qwen-tts` (pip, Apache-2.0).
- **MyVoice 자산(이게 핵심, 없으면 재현 불가):**
  - 레퍼런스 WAV: `C:\Users\seong\AppData\Roaming\sh.voicebox.app\profiles\<profileId>\<sampleId>.wav`
  - 전사: `voicebox.db`(SQLite) → `profile_samples.reference_text`
- 추론 API(voicebox `pytorch_backend.py`와 동일):
  ```python
  from qwen_tts import Qwen3TTSModel
  m = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cuda", torch_dtype=torch.bfloat16)
  vp = m.create_voice_clone_prompt(ref_audio=WAV, ref_text=전사, x_vector_only_mode=False)
  wavs, sr = m.generate_voice_clone(text=내레이션, voice_clone_prompt=vp, language="korean")  # ko→"korean"
  ```
- **파드 운영(검증된 패턴):** `scratchpad/runpod.py`(GraphQL, UA=curl 필수)로 deploy. GPU=RTX 3090/4090($0.22~/h). 씬 텍스트를 `narrations.json`으로 보내 `tts_batch.py <shard> <N>`로 샤딩.
  - **GPU 한 장에 3~4 프로세스** 띄우면 util 30%→100%(~3배). VRAM: 4proc×~5.5GB=22~24GB(24GB GPU 빠듯 — 감시).
  - **setsid로 띄워라**(`setsid bash -c "..." </dev/null >log 2>&1 &`). nohup은 SSH 종료 시 죽음.
  - **CUDA 경쟁:** 새 파드에서 프로세스 동시 시작 시 "CUDA unknown error" → **간격(sleep 8~12s) 두고 staggered 실행.**
  - 12-way(3~4파드)면 2000씬 ~3시간.
- ⚠️ AWS GPU는 **신규 계정 quota=0**(증설 심사 수시간~일) → 급하면 **RunPod**(쿼터 없음·즉시). RunPod도 supply 변동 → GPU 후보 여러 개 순차 시도.
- bash `while read` 루프 안 ssh는 stdin 먹음 → **`ssh -n`**.

## ② 렌더 — AWS Lambda 서버리스
**왜:** 로컬 GPU 편당 ~18분(128편=38h). Lambda는 편당 수백 람다로 쪼개 **2.5분/편**, 다편 병렬.
- `@remotion/lambda`. function deploy `--timeout=300 --memory=3008`(기본 120s는 14분 영상 합치기 전 타임아웃). site deploy(`public/` 600MB S3 업로드 — 빌드 다 끝나고).
- 렌더: `npx remotion lambda render factory FactoryVideo --props='{"projectId":"<id>"}' --scale=0.6667`(720p, 비용 절반). 1080p ~$0.66/편 → 720p ~$0.33. 128편 ~$42.
- `_lambda-render-one.sh`: 렌더 → S3 url 파싱 → `aws s3 cp`로 `out/<id>.mp4` 회수. 멱등.
- IAM: `remotion-lambda-role`(trust=lambda.amazonaws.com) + 정책(`npx remotion lambda policies role`) 1회 생성.

## ③ 납품 — Cloudflare R2 + KODE LMS
- `H:\moodle\_upload_section.mjs <섹션> <폴더> <orderBase>`: mp4 → R2(`lectures` 버킷, `requestChecksumCalculation:'WHEN_REQUIRED'` 필수) + `lms_lectures` insert(active=true). 자격증명 `H:\moodle\.env`.
- 우리 mp4는 이미 H.264+AAC라 remux 불필요. 가이드: `H:\remotion\가이드_R2업로드_로그인.md`.

## ④ 검증 게이트 — 섹션별 증분 (절대 빅뱅 금지)
`_phase-a.sh`(회수→build→`_audio-check.mjs`(잘림/누락 플래그)→레퍼런스 STILL→정지) → **사람이 STILL Read + 검사 확인** → `_phase-b.sh`(섹션별: Lambda 렌더→mp4 검증(길이·오디오·크기)→실패 재시도 1회→검증 통과분만 R2 업로드→다음 섹션).
- 실패는 격리(편당 독립). 불량은 LMS에 안 올림. "전부 아니면 전무" 아님.

## 비용 요약 (128편 기준)
RunPod 음성 ~$4 + Lambda 렌더 ~$42 + R2 소액 ≈ **~$46**. (1080p면 Lambda ~$84 → 720p 권장.)

## 렌더 규모 규칙 — 소량은 로컬, 대량은 Lambda
- **대량(섹션·전체):** Lambda 720p(위 ②). 빠르고 병렬.
- **소량(1~2편 보정/마감):** 로컬 `node factory/render.mjs <id>`($0, 네이티브 1080p, ~15분/편). Lambda 띄울 가치 없음. 단 render.mjs는 scale 옵션 없어 1080p(LMS 720p와 섞여도 플레이어 OK, 화질만 ↑). 렌더 전 `export TMP=H:/remotion/.rtmp`로 C: 임시폴더 폭주 방지.

## 트러블슈팅 (실전 교훈, 2026-06-24)
- **place-audio sig-skip 버그 (최악):** `_place-audio.mjs`가 `meta.sig===sig`면 스킵 → 음성을 새로 교체했는데도 **옛 오디오 유지**. 증상: 음색/볼륨이 안 바뀜. 조치: 음성 교체 시 `public/factory/<id>/audio/<sid>.{mp3,json}` 먼저 삭제 후 재배치. 43편이 옛 DashScope 음성으로 납품돼 재렌더(~$20 손해)한 사고.
- **DashScope qwen-vc 금지:** 음색·볼륨(-30 LUFS) 불량 → 사용자 거부. MyVoice 음성은 **반드시 RunPod의 Qwen3-TTS-1.7B-Base 클론**으로.
- **voicebox 로컬은 마감 보정용만:** ~90s/씬이라 양산 불가(양산=RunPod). 게다가 **장시간/긴 나레이션(>500자)에서 CUDA 백엔드가 jam** — 앱 재시작으로 안 풀리고 짧은 청크도 generating에서 멈춤 → **컴퓨터 리부트**해야 복구. 마감 1~2씬이 voicebox로 막히면 RunPod 1씬(~$0.03)이 리부트보다 쌈.
- **긴 씬 청크 음성:** voicebox로 긴 씬을 뽑아야 하면 `factory/_chunk_voice.mjs <id> <sid>` — 문장 단위 ~180자 청크로 쪼개 각각 생성→loudnorm concat. (단 백엔드가 완전 jam이면 청크도 실패 → 리부트/RunPod.)
- **place-audio 간헐 ffmpeg 실패:** 배치 중 일부 wav가 일시적으로 실패(동시 ffmpeg 경합). 개별 재실행하면 성공 → 실패분만 1회 재시도.
- **loudnorm 표준:** 모든 음성 `loudnorm=I=-16:TP=-1.5:LRA=11`. 사이드카에 `normalized:true`. 납품 후 볼륨 보정은 `H:\moodle\_volume_fix.mjs`(오디오만 2-pass, 영상 copy, R2 덮어쓰기, 재렌더 0, 임계 -18.5 LUFS).
- **LMS 음성 교체:** 이미 올라간 편의 음성만 교체 시 `H:\moodle\_reupload.mjs <섹션> <폴더>`(제목 매칭, 같은 R2 키 덮어쓰기, DB는 duration만 갱신).
