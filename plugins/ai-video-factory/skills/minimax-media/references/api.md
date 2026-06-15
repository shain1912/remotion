# MiniMax raw HTTP API — reference

Depth behind `factory/lib/minimax.mjs`. Use the lib unless you need something it doesn't expose;
these are the exact request/response shapes it speaks to `https://api.minimax.io`.

Every endpoint authenticates with `Authorization: Bearer <key>` and `Content-Type: application/json`.
Success is signalled by `base_resp.status_code === 0` (the lib's `ok()` helper). The lib's
`postJson(url, key, body)` POSTs JSON and tolerates non-JSON error bodies (`{ _raw }`).

## Image — `POST /v1/image_generation`  (keys: KEY2/3/4)

Request body the lib sends:

```json
{
  "model": "image-01",
  "prompt": "<english visual prompt, includes 'no text'>",
  "aspect_ratio": "16:9",
  "response_format": "base64",
  "n": 1,
  "subject_reference": [{ "type": "character", "image_file": "<URL or dataURL>" }]
}
```

- `subject_reference` is included **only** when `subjectReference` is passed → character/style
  consistency across scenes. `image_file` accepts a public URL or `data:image/jpeg;base64,…`.
- `aspect_ratio`: `16:9`, `9:16`, `1:1`, and others.
- Response: `data.image_base64[0]` is a base64 JPEG. The lib does `Buffer.from(b64, 'base64')`.
- **Failover:** the lib loops `GEN_KEYS.length * 2` attempts, rotating keys, sleeping 800 ms between
  tries, throwing `generateImage failed: <lastErr>` only after all attempts fail.

## Video — Hailuo (keys: KEY2/3/4), three-step async

### 1. Submit — `POST /v1/video_generation`

```json
{
  "model": "MiniMax-Hailuo-2.3-Fast",
  "prompt": "[Push in] ...",
  "duration": 6,
  "resolution": "768P",
  "first_frame_image": "data:image/jpeg;base64,..."
}
```

- `first_frame_image` present → **I2V**; omit → **T2V**.
- Models: `MiniMax-Hailuo-2.3-Fast` (default), `MiniMax-Hailuo-2.3`, `MiniMax-02`.
- Response carries `task_id`. Note: submit uses **one** key (`nextGenKey()`), and the **same key**
  must be used for query + retrieve below.

### 2. Poll — `GET /v1/query/video_generation?task_id=<id>`

Poll every `pollMs` (default 5000) until `timeoutMs` (default 6 min):

- `status: "Success"` → read `file_id`.
- `status: "Fail"` → throw `video task failed`.
- otherwise (`Processing`/`Queueing`) → keep polling.

### 3. Retrieve + download — `GET /v1/files/retrieve?file_id=<id>`

- Response: `file.download_url`. The lib fetches that URL and returns the MP4 as a Buffer.
- Errors: `video submit failed`, `video task timed out (task_id=…)`, `file retrieve failed`.

> In the factory, `build.mjs` wraps the whole clip step in try/catch per scene and falls back to
> the still image on any failure (`sc.hasClip = false`), so a flaky Hailuo never blocks the render.

## TTS — `POST /v1/t2a_v2`  (key: KEY1 only)

```json
{
  "model": "speech-2.6-hd",
  "text": "<one Korean sentence>",
  "stream": false,
  "language_boost": "Korean",
  "output_format": "hex",
  "subtitle_enable": true,
  "voice_setting": { "voice_id": "shainvoice01", "speed": 1.0, "vol": 1.0, "pitch": 0 },
  "audio_setting": { "sample_rate": 32000, "format": "mp3", "bitrate": 128000, "channel": 1 }
}
```

- `voice_setting.emotion` is added only when `emotion` is passed.
- Response:
  - `data.audio` — **hex** string → `Buffer.from(hex, 'hex')` → MP3 Buffer.
  - `data.subtitle_file` — a URL to a JSON array `[{ text, time_begin, time_end }]` in **ms**.
    The lib fetches and maps it; failure to fetch leaves `subtitles: []` (timing is optional).
  - `extra_info.audio_length` — total ms → returned as `ms`.
- Audio: 32 kHz mono MP3 @ 128 kbps.

### Why subtitle timing matters

`build.mjs` sets each scene's `durationMs` from `ms` (fallback: last subtitle `time_end`, else
3000), then `durationFrames = ceil((durationMs/1000 + 0.35) * fps)` (the `0.35` is breathing room
after each line). That's how the video length is **driven by the voice**, scene by scene — no manual
timing. `src/factory/FactoryVideo.tsx` lays each scene out as a `Sequence` of exactly that length.

## List voices — `POST /v1/get_voice`  (key: KEY1)

```json
{ "voice_type": "all" }
```

Returns the account's system + cloned voices. Call with `KEY1` to confirm `shainvoice01` is present.

## Env & keys

`.env` (auto-loaded by the lib if a var isn't already in `process.env`):

```
MINIMAX_API_KEY1=...   # TTS / cloned voice shainvoice01 — LOW balance, TTS only
MINIMAX_API_KEY2=...   # generation — image + video
MINIMAX_API_KEY3=...   # generation
MINIMAX_API_KEY4=...   # generation
STABILITY_API=...      # not used by this lib
MINIMAX_API_HOST=...   # optional override; defaults to https://api.minimax.io
```

The lib: `TTS_KEY = KEY1`; `GEN_KEYS = [KEY2, KEY3, KEY4].filter(Boolean)`; round-robins gen keys via
`nextGenKey()`. It warns (not fatal) if `KEY1` or all gen keys are missing.
