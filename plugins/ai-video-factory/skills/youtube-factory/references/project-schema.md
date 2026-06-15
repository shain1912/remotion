# project.json — the single source of truth for one video

Path: `factory/projects/<id>/project.json`. This file is authored by the
**scene-storyboard** skill and consumed by `factory/build.mjs`. Write it ONLY
after the text-level storyboard is confirmed (ASCII-first).

## Full schema

```jsonc
{
  "id": "demo-git",                         // matches the directory name; used in all paths
  "title": "깃 명령어 외우던 시대는 끝났다 | 바이브 코딩 Git",
  "niche": "ai-dev",                        // free text tag (e.g. economy, martial-anime, ai-dev)
  "lang": "ko",                             // output language (Korean)
  "format": { "width": 1920, "height": 1080, "fps": 30 },  // 1080×1920 for 9:16 shorts
  "voice": { "voiceId": "shainvoice01", "model": "speech-2.6-hd", "speed": 1.05 },
  "style": {
    // imageSuffix is APPENDED to every scene.imagePrompt automatically by build.mjs.
    // Keep the look consistent here; always end with "no text" so image-01 omits letters.
    "imageSuffix": "dark cinematic 3D render, modern developer workspace aesthetic, teal and amber rim lighting, shallow depth of field, volumetric glow, ultra detailed, no text, 16:9 cinematic",
    "accent": "#22d3a6",                    // caption underline / glow color in Remotion
    "bg": "#0a0e14"                          // composition background
  },
  "scenes": [
    {
      "id": "s01",                          // sNN, zero-padded, drives every asset filename
      "narration": "깃 명령어, 아직도 외우고 계세요?",   // ONE Korean sentence = the TTS for this scene
      "caption": "아직도 외우세요?",          // short on-screen HOOK words (big text), keep it punchy
      "imagePrompt": "a stressed software developer staring at a terminal full of red git error messages, hands on head, glowing monitor in a dark room",
      "motion": "kenburns-in",              // kenburns-in | kenburns-out | pan-left | pan-right
      "video": {                            // OPTIONAL — only on the first 1-2 scenes (stop-scroll hook)
        "prompt": "[Push in] the developer slowly leans back in frustration, screen glow flickering",
        "model": "MiniMax-Hailuo-2.3-Fast",
        "duration": 6,
        "resolution": "768P"
      }
    }
    // ... more scenes ...
  ]
}
```

## Field rules that match the engine

- **`imagePrompt` is English**, describes a single still, and asks for **NO text**
  in the image (the suffix already says "no text", but reinforce it for busy
  scenes). `build.mjs` sends `"${imagePrompt}, ${style.imageSuffix}"` to image-01
  at `aspect_ratio: "16:9"`.
- **`narration` is exactly one Korean sentence.** It becomes one TTS clip on KEY1
  / `shainvoice01`; its measured length sets the scene duration (`durationMs`),
  and MiniMax returns subtitle timing for cut/caption sync. Long paragraphs =
  long static scenes = lost retention. Split them.
- **`caption`** is the big on-screen hook text — a few words, not the full
  sentence. Think thumbnail-style phrasing per scene.
- **`motion`** must be one of the four presets; anything else falls through to the
  `kenburns-in` default in `FactoryVideo.tsx`.
- **`video`** block: include on the **first 1-2 scenes only**. `build.mjs` reads
  that scene's already-generated `img/sNN.jpg`, converts it to a base64 dataURL,
  and runs Hailuo **image-to-video** from it (`first_frame_image`). Hailuo is slow
  (~1-3 min/clip) and uses the rich keys. If a clip fails, `build.mjs` logs it and
  **falls back to the still** — the video still renders. Use `--no-video` to skip
  all clips during iteration.
- **`format`**: `1920×1080` for landscape, `1080×1920` for 9:16 shorts (set this
  before generating — images are requested at 16:9, so for a 9:16 short you'll
  also want a 9:16-friendly `imageSuffix` / aspect; coordinate with
  scene-storyboard).

## Scene-count guidance (retention math)

| Format | Scenes | Why |
|---|---|---|
| Short-form explainer (60-90s) | ~15-26 | one sentence each, frequent cuts |
| Long-form | many more (100s) | VIDEO 2 ran 200-900 images/video |

More scenes → more cuts → longer watch time → the algorithm pushes it. That is
the whole business model. Don't pad sentences to fill a scene; add scenes.

## Minimal copy-paste template

```json
{
  "id": "REPLACE-id",
  "title": "REPLACE 한국어 제목",
  "niche": "economy",
  "lang": "ko",
  "format": { "width": 1920, "height": 1080, "fps": 30 },
  "voice": { "voiceId": "shainvoice01", "model": "speech-2.6-hd", "speed": 1.05 },
  "style": {
    "imageSuffix": "dark cinematic 3D render, dramatic rim lighting, shallow depth of field, volumetric glow, ultra detailed, no text, 16:9 cinematic",
    "accent": "#22d3a6",
    "bg": "#0a0e14"
  },
  "scenes": [
    {
      "id": "s01",
      "narration": "REPLACE 한 문장 후킹.",
      "caption": "후킹 단어",
      "imagePrompt": "REPLACE english still description, on-brand subject, dramatic",
      "motion": "kenburns-in",
      "video": { "prompt": "[Push in] REPLACE subtle motion", "model": "MiniMax-Hailuo-2.3-Fast", "duration": 6, "resolution": "768P" }
    },
    {
      "id": "s02",
      "narration": "REPLACE 다음 문장.",
      "caption": "다음 후킹",
      "imagePrompt": "REPLACE english still description",
      "motion": "pan-left"
    }
  ]
}
```
