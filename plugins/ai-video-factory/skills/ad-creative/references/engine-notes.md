# engine-notes — how the factory engine treats an ad project

All facts here are read directly from the real files. Cross-check against
`minimax-media` (the canonical reference for the generateImage/generateVideo/tts
signatures and key allocation) before writing any custom fetch.

## The pipeline an ad rides on

```
factory/projects/<id>/project.json     ← you author this (ad-shaped scenes)
        │  node factory/build.mjs <id>
        ▼
public/factory/<id>/audio/sNN.mp3 + sNN.json   (TTS via KEY1, sequential)
public/factory/<id>/img/sNN.jpg                (image-01 via KEY2/3/4, concurrency 3)
public/factory/<id>/clip/sNN.mp4               (Hailuo I2V, only scenes with a `video` block)
public/factory/<id>/build.json                 (manifest)
        │  node factory/render.mjs <id>
        ▼
out/<id>.mp4
```

`render.mjs` and `still.mjs` always select the registered composition id **`FactoryVideo`**
and pass `{ projectId: <id> }`. `calculateFactoryMetadata` in `src/factory/FactoryVideo.tsx`
fetches `staticFile(factory/<id>/build.json)` and returns width/height/fps/durationInFrames
from the manifest. **Result: a 1:1 or 9:16 ad renders at the right size purely because your
`project.json.format` says so — there is no Root.tsx edit and no separate composition.**

## build.mjs internals that matter for ads

- **Image aspect is hardcoded.** Line ~59: `await generateImage({ prompt, aspectRatio: '16:9' })`.
  Every generated frame is 16:9 regardless of your `format`. For a square/vertical ad, Remotion
  `objectFit: 'cover'` crops the 16:9 source down to your frame. Keep the *subject centered* in
  your `imagePrompt` (e.g. "single hero product centered", "centered composition") so the crop
  never amputates it.
- **Native vertical/square images (optional edit).** If a card-news demands true 1:1 / 9:16
  generation (e.g. full-bleed art that must not crop), change that one call to derive aspect
  from format, e.g.:
  ```js
  const ar = project.format.width === project.format.height ? '1:1'
           : project.format.height > project.format.width ? '9:16' : '16:9';
  const buf = await generateImage({ prompt, aspectRatio: ar });
  ```
  `generateImage` already supports `9:16` / `1:1` (it just passes `aspect_ratio` through). Only
  edit if cover-crop is genuinely losing important pixels — most card-news is fine without it.
- **Caching / resume.** Voice skips when both `sNN.mp3` and `sNN.json` exist; image skips when
  `sNN.jpg` exists; clip skips when `sNN.mp4` exists. To force ONE card to regenerate, delete
  just that scene's files under `public/factory/<id>/{img,clip,audio}/`. Never deletes others.
- **Duration is voice-driven.** `durationFrames = ceil((durationMs/1000 + 0.35) * fps)` where
  `durationMs` comes from the TTS result (`extra_info.audio_length`, falling back to the last
  subtitle's `time_end`). So a card's on-screen time = how long the narration takes to say + a
  0.35s tail. Shorter narration → snappier card.
- **Clips fall back to stills.** In the clip loop, if Hailuo fails, `build.mjs` logs `✗ clip
  failed -> falling back to still image` and sets `clip: null` in the manifest. The ad still
  renders (that beat just becomes a Ken-Burns still). So a clip failure never blocks delivery.
- **`--no-video`** skips the entire clip stage. Use it for ALL card-news builds (they have no
  `video` blocks anyway) and for the smoke test of a 3-beat ad.
- **`--limit N`** builds only the first N scenes — the cheap smoke test.

## Manifest fields the renderer reads (public/factory/<id>/build.json)

```
{ id, title, format, style, totalFrames,
  scenes: [ { id, narration, caption, motion, durationMs, durationFrames,
              image:"factory/<id>/img/sNN.jpg",
              audio:"factory/<id>/audio/sNN.mp3",
              clip:"factory/<id>/clip/sNN.mp4" | null } ] }
```

`FactoryVideo.tsx` per scene: plays `clip` if present else the Ken-Burns `image`; paints a
bottom legibility gradient; renders `caption` as the big 900-weight headline with an accent bar
(spring pop-in); renders `narration` as the subtitle pill; plays the scene `audio`; fades head
(0→4f) and tail (last 5f) for the dissolve at each cut.

## Motion presets (project.json `scene.motion`)

`kenburns-in` (default, scale 1.05→1.18), `kenburns-out` (1.18→1.05), `pan-left`, `pan-right`.
For card-news, alternate them so the five cards have visual rhythm instead of identical zoom.
Motion only applies to the still; when a scene has a `clip`, the Hailuo motion plays instead.

## Vertical safe area

The caption sits `paddingBottom: 140`, the subtitle `paddingBottom: 56` (1080×1080/1920 numbers
are absolute px against the composition height). In 9:16 the text band lands in the lower third —
good for reels. Keep your `imagePrompt` subject in the upper/center so it isn't hidden behind copy.
