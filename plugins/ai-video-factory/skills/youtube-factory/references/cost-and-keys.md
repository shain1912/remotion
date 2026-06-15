# Cost, keys, and troubleshooting

## API keys (`.env`, repo root)

`factory/lib/minimax.mjs` auto-loads `.env` and partitions keys by cost:

| Env var | Role in pipeline | Balance | Used by |
|---|---|---|---|
| `MINIMAX_API_KEY1` | **TTS only** — holds cloned voice `shainvoice01` | **LOW** | `tts()` (sequential) |
| `MINIMAX_API_KEY2` | image + video | rich | `generateImage()` / `generateVideo()` round-robin |
| `MINIMAX_API_KEY3` | image + video | rich | " |
| `MINIMAX_API_KEY4` | image + video | rich | " |
| `STABILITY_API` | reserved (not used by build.mjs) | — | — |

Host: `https://api.minimax.io` (global). Override with `MINIMAX_API_HOST` if ever
needed. The lib round-robins KEY2/3/4 and **fails over** on error (image retries
across keys up to `GEN_KEYS.length * 2` attempts). KEY1 is never used for
generation, so a wasted full run never drains the scarce voice key — but a
wrong/edited narration DOES spend KEY1, so get the script right before building.

## Economics

- Image generation ≈ **$5 / 1000 images ≈ ~2,000 KRW per video**.
- The pipeline is **resumable**: `build.mjs` skips any existing
  `audio/sNN.mp3`+`.json`, `img/sNN.jpg`, or `clip/sNN.mp4`. So:
  - smoke test (`--limit 3 --no-video`) costs a few images + 3 voice lines;
  - the full run pays only for the remaining MISSING assets;
  - fixing one scene = delete that scene's asset(s) + rerun = pennies.
- Hailuo video clips are the expensive/slow part (~1-3 min each, rich keys). Keep
  them to the **first 1-2 scenes**; use `--no-video` while iterating.

## Concurrency model (what runs how)

`build.mjs` runs three phases per build:
1. **Voice** — sequential, KEY1. Caches `audio/sNN.mp3` + `audio/sNN.json`
   (duration + subtitle timing). `durationMs` from this drives scene length.
2. **Images** — concurrency **3** across KEY2/3/4. Caches `img/sNN.jpg`.
3. **Clips** — sequential Hailuo I2V from each `video`-scene's image. Caches
   `clip/sNN.mp4`. Skipped entirely with `--no-video`. On failure, logs and
   **falls back to the still** (scene still renders).

Then it writes `public/factory/<id>/build.json` (the manifest Remotion reads) with
`durationFrames = ceil((durationMs/1000 + 0.35) * fps)` per scene (0.35s breathing
room) and `totalFrames` summed.

## Fixing one scene (surgical, cheap)

| Changed | Delete these, then `node factory/build.mjs <id>` |
|---|---|
| narration (text/voice) | `public/factory/<id>/audio/sNN.mp3` **and** `audio/sNN.json` |
| imagePrompt / style | `public/factory/<id>/img/sNN.jpg` |
| video prompt | `public/factory/<id>/clip/sNN.mp4` |
| caption / motion only | nothing — these live in `project.json`; just re-run `build.mjs` to refresh `build.json`, or re-render |

After any change re-run `build.mjs` (regenerates only the deleted files + rewrites
`build.json`) then `render.mjs`.

## Troubleshooting table

| Symptom | Likely cause | Fix |
|---|---|---|
| Render is black / empty | `build.json` or assets missing | run `node factory/build.mjs <id>` first; confirm `public/factory/<id>/build.json` exists |
| `generateImage failed: ... base_resp` | all gen keys errored (balance/quota/prompt) | check KEY2/3/4 balance; simplify the prompt; it already retried across keys |
| `tts failed` | KEY1 out of balance, or bad `voiceId` | top up KEY1; confirm `voiceId` is `shainvoice01` (or list with `listVoices`) |
| Voice is a default/wrong voice | `voice.voiceId` not `shainvoice01` | fix `project.json`, delete `audio/*`, rebuild |
| Korean shows as boxes/tofu | font load issue | composition uses `@remotion/google-fonts` NotoSansKR — ensure network access during bundle/render |
| `video task timed out` | Hailuo slow/overloaded | it falls back to still automatically; rerun later to get the clip, or accept the still |
| Caption/subtitle out of sync | stale `audio/sNN.json` after editing narration | delete `audio/sNN.json` (and `.mp3`) and rebuild so timing regenerates |
| Wrong size/fps in output | `format` in `project.json` | `calculateFactoryMetadata` reads it from `build.json`; fix `project.json`, rebuild |

## The QA discipline (why all this exists)

From VIDEO 1: **agree the layout as text first, then generate; the human is the
검수자, not the maker.** From VIDEO 2: **publish many, fast — 시간 단축이 살길.**
The smoke-test-then-full loop and the per-scene caching exist precisely so you can
ship many videos without ever burning balance on an unreviewed bulk run.
