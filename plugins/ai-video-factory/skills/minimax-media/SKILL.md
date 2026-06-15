---
name: minimax-media
description: >-
  Generate IMAGES, VIDEO clips, and Korean VOICE/TTS through MiniMax via
  factory/lib/minimax.mjs (and the raw api.minimax.io HTTP API). Use whenever the
  task is to create media assets for the YouTube factory: 이미지 생성, 영상 생성, 음성 생성,
  TTS, 보이스(보이스오버) 생성, 이미지 일괄 생성, 캐릭터/스타일 일관성, 자막 타이밍 추출 — or in English:
  generate an image, image-to-video / I2V clip, voiceover, narration, batch
  image generation, subject_reference character consistency, subtitle timing.
  This is the canonical reference for the generateImage / generateVideo / tts
  signatures, the KEY1-vs-KEY2/3/4 cost split, model ids (image-01,
  MiniMax-Hailuo-2.3-Fast, speech-2.6-hd), the cloned voice shainvoice01, and
  per-video cost economics. Reach for it BEFORE writing any custom fetch() to
  MiniMax — the lib already handles key rotation, polling, and decoding.
---

# minimax-media — generating media with MiniMax

This is the **asset layer** of the factory (양산 공장). One topic → many scenes;
each scene needs an **image**, a **voiceover**, and sometimes a short **video clip**.
All three come from MiniMax. The wrapper `factory/lib/minimax.mjs` already exists and
is verified working — prefer it over raw HTTP so you inherit key rotation, async-task
polling, hex→mp3 decoding, and subtitle parsing for free.

> Build the layout **in text first** (the VIDEO 1 lesson: "만들기 전에 글자로 먼저 맞춘다").
> Confirm the storyboard/`project.json` before spending API balance. The human's job is
> QA/검수, not making. While one asset generates, start the next.

## The single most important rule: key allocation = money

`.env` holds `MINIMAX_API_KEY1..4` (+ `STABILITY_API`, unused here). They are **not**
interchangeable — the split is about cost and what each key can do:

| Key | Balance | Use for | Why |
|-----|---------|---------|-----|
| `KEY1` | **LOW** | **TTS only** | holds the user's cloned voice `shainvoice01`; voice clone lives on this account |
| `KEY2`, `KEY3`, `KEY4` | rich | **image + video** | round-robin + failover; carries the generation cost |

The lib enforces this automatically: `tts()` always uses `KEY1`; `generateImage()` and
`generateVideo()` round-robin `KEY2/3/4` and retry on the next key when one fails.
**Never run TTS on KEY2/3/4** (the clone isn't there) and **never run image/video on KEY1**
(you'll burn the low-balance voice account). If you hand-roll a `fetch`, you'll get this wrong.

Host is `https://api.minimax.io` (global). Inspect the loaded state any time:

```js
import { config } from './factory/lib/minimax.mjs';
console.log(config); // { HOST, hasTTS: true, genKeyCount: 3 }
```

## The three functions (exact signatures)

### `generateImage({ prompt, aspectRatio="16:9", subjectReference=null, model="image-01" }) -> Buffer(jpeg)`

- `model="image-01"` — returns base64 JPEG, decoded to a **Buffer** for you.
- `aspectRatio` — `"16:9"` (landscape long-form), `"9:16"` (shorts), `"1:1"`, etc.
- `subjectReference` — a public **URL** or a `data:image/jpeg;base64,...` **dataURL**.
  Pass a reference face/style image to keep a **character or style consistent** across
  scenes (sent as `subject_reference:[{type:"character", image_file:…}]`). This is how you
  make the same protagonist appear in scene 1 and scene 40.
- Rotates `KEY2/3/4` and retries (up to `2 × genKeyCount` attempts) before throwing — so a
  single flaky key won't fail your batch.
- **Prompt the image, not the words:** put the English visual prompt here and *append your
  house style*. In `project.json` the build appends `style.imageSuffix` automatically and
  every prompt asks for **no text in image** (captions are drawn by Remotion, not baked in).

### `generateVideo({ prompt, firstFrameImage=null, model="MiniMax-Hailuo-2.3-Fast", duration=6, resolution="768P" }) -> Buffer(mp4)`

- Models: `MiniMax-Hailuo-2.3-Fast` (default, cheap/quick), `MiniMax-Hailuo-2.3`, `MiniMax-02`.
- `firstFrameImage` present → **image-to-video (I2V)**; omit it → text-to-video (T2V).
  The factory feeds the scene's just-generated JPEG as a dataURL so the clip **starts from the
  exact still** — seamless. Build it like the engine does:
  `const dataUrl = \`data:image/jpeg;base64,${jpg.toString('base64')}\``.
- **Slow & async:** submits a task, polls `/v1/query/video_generation` every 5 s (default
  `timeoutMs` 6 min), then downloads the file. Expect **~1–3 min per clip**. Don't await these
  in a tight loop expecting instant returns.
- **Use sparingly.** The cheap factory pattern (VIDEO 2) is: video clip only on the **first
  1–2 scenes** as a stop-scroll hook; the rest stay **stills with Ken-Burns motion**. Skipping
  clips is what makes a video cost ~2,000 KRW instead of much more. `build.mjs --no-video`
  skips them entirely for a cheap pass.
- Prompt with a camera move, e.g. `"[Push in] the neon AI hologram pulses..."`.

### `tts({ text, voiceId="shainvoice01", model="speech-2.6-hd", speed=1, vol=1, pitch=0, emotion=null, languageBoost="Korean" }) -> { audio:Buffer(mp3), subtitles, ms }`

- Runs on **`KEY1`** with the user's verified cloned voice **`shainvoice01`**.
- `model="speech-2.6-hd"`, `languageBoost="Korean"` for clean Korean.
- Returns:
  - `audio` — MP3 **Buffer** (server sends hex; decoded for you).
  - `subtitles` — `[{ text, time_begin, time_end }]` in **milliseconds**. This is gold: use it
    to **sync captions and cuts to the voice** (the factory derives `durationMs`/`durationFrames`
    from it so each scene lasts exactly as long as its sentence).
  - `ms` — total audio length in ms (`extra_info.audio_length`).
- `speed` (e.g. `1.05` in demo-git for a slightly punchier read), `emotion`, `pitch`, `vol` tune delivery.
- **One Korean sentence per scene.** Short lines → fast scene transitions → longer watch time
  → the algorithm pushes it ("이미지만 두고 말만 하면 팟캐스트" — keep it visual and moving).

`listVoices(key=TTS_KEY, voiceType="all")` lists available/cloned voices (call with `KEY1` to
see `shainvoice01`).

## Copy-paste: generate all three for one scene

Run with `node` from the repo root (`.env` is auto-loaded by the lib):

```js
import fs from 'node:fs';
import { generateImage, generateVideo, tts } from './factory/lib/minimax.mjs';

const prompt = 'a confident developer leaning back, calm smile, cinematic teal rim light, no text';

// 1) IMAGE (KEY2/3/4) — JPEG Buffer
const jpg = await generateImage({ prompt, aspectRatio: '16:9' });
fs.writeFileSync('scene.jpg', jpg);

// 2) VOICE (KEY1, shainvoice01) — MP3 + subtitle timing
const v = await tts({ text: '요즘 잘나가는 개발자들은 명령어를 외우지 않습니다.', speed: 1.05 });
fs.writeFileSync('scene.mp3', v.audio);
console.log('duration(ms):', v.ms, 'subtitles:', v.subtitles.length);

// 3) CLIP (KEY2/3/4, I2V from the still) — slow ~1-3 min, optional hook only
const dataUrl = `data:image/jpeg;base64,${jpg.toString('base64')}`;
const mp4 = await generateVideo({ prompt: '[Push in] he leans back, screen glow flickers', firstFrameImage: dataUrl });
fs.writeFileSync('scene.mp4', mp4);
```

## You usually don't call these by hand — `build.mjs` does

For a real video you author `factory/projects/<id>/project.json` and run the build; it loops
every scene calling exactly these functions with the right keys, concurrency, and caching:

```
node factory/build.mjs <id> --limit 3 --no-video   # cheap smoke: 3 voices+images, no clips
node factory/build.mjs <id>                         # full, resumable (skips existing files)
```

- **Voice** runs sequentially on `KEY1`. **Images** run at **concurrency 3** across `KEY2/3/4`.
  **Clips** run sequentially (I2V from each scene's JPEG) only for scenes that have a `video` block.
- **Resumable:** every asset that already exists on disk is skipped, so re-runs are cheap and
  **never waste API balance**. Fix one scene's prompt, delete just that file, re-run.
- Outputs land in `public/factory/<id>/{img,audio,clip}/sNN.*` plus the manifest
  `public/factory/<id>/build.json`, which `src/factory/FactoryVideo.tsx` reads to render.

Call the raw functions directly only for one-offs, experiments, or a custom batch
(e.g. regenerating a single character-consistent image set with `subjectReference`).

## Cost economics (why we hoard stills and ration clips)

- VIDEO 2 benchmark: **~$5 per 1000 images ≈ 2,000 KRW per video** at 200–900 images each.
- **Images are the cheap workhorse** — generate many; fast cuts = retention.
- **Video clips are the expensive luxury** — front-load 1–2 only; everything else is a still +
  motion preset (`kenburns-in/out`, `pan-left/right`). This is the literal "front part as video,
  rest as moving stills" pattern.
- **TTS is metered on the low-balance KEY1** — don't regenerate voice you already have; the build's
  cache protects you. "시간 단축이 살길": cut per-video cost so you can publish MANY.

## Failure modes & gotchas

- **`generateImage failed: ... base_resp ...`** — all key rotations exhausted. Usually a content
  filter on the prompt or an out-of-balance key. Reword the prompt; check `config.genKeyCount`.
- **`video task timed out`** — Hailuo took >6 min; bump `timeoutMs`, or just retry (the build
  catches clip failures per-scene and **falls back to the still image**, so the video still renders).
- **Empty `subtitles`** — timing is best-effort; the build falls back to `ms` (or the last
  subtitle's `time_end`, or 3000 ms) so a missing subtitle file never breaks duration.
- **No text in images** — always include `no text` in the prompt; on-screen Korean is drawn by
  Remotion (`@remotion/google-fonts/NotoSansKR`), never baked into the generated image.
- **Korean comes out wrong** — keep `languageBoost: "Korean"`.

Deeper detail (raw HTTP request/response shapes, full param tables, polling internals) lives in
[`references/api.md`](references/api.md).
