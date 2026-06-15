---
name: remotion-assembler
description: >-
  Assemble and headlessly render the Remotion "FactoryVideo" composition — turn many
  generated stills + Hailuo clips + TTS voice into ONE fast-cut, captioned Korean video.
  Use whenever the user wants to 영상 조립 / 렌더 / 자막·캡션 합성 / 씬 추가·튜닝, or says
  "assemble the video", "render the factory video", "fast-cut", "Remotion factory",
  "build.json", "still QA", or asks how scenes/captions/motion/timing map to frames.
  Covers the build.json manifest schema, motion presets, the caption-vs-narration-subtitle
  layers, how to add/tune scenes for retention, and the EXACT commands
  `node factory/render.mjs <id>` and `node factory/still.mjs <id> <frame>`.
  Complements (does NOT replace) the remotion-best-practices skill — read that for general
  Remotion/React/timing rules; read THIS for how the factory composition is wired.
---

# remotion-assembler

This skill documents the **assembly + render** stage of the YouTube factory: how the
data-driven `FactoryVideo` Remotion composition turns a per-scene manifest into a single
retention-optimized video, and how to render/QA it headlessly (no Remotion CLI, no Studio).

It sits at the **end** of the pipeline. Upstream skills (script writer, storyboard) author
`factory/projects/<id>/project.json`; `factory/build.mjs` generates assets and emits
`public/factory/<id>/build.json`. This skill is about everything from `build.json` onward.

> Cross-skill: for generic Remotion/React idioms (Sequence math, interpolate, fonts,
> `staticFile`, off-thread video, fps reasoning) defer to **remotion-best-practices**.
> Don't re-derive those here — this skill only documents the factory-specific wiring.

---

## Three render templates (pick with `project.json` → `"template"`)

The factory ships **three** visual styles. `build.mjs`, `render.mjs`, and `still.mjs` are all
template-aware — they read `project.template` and route to the right composition. The build/
render/QA **commands are identical** for all three; only the `project.json` scene schema differs.

| `template` | composition | visuals | best for | demo |
|---|---|---|---|---|
| `montage` (default) | `FactoryVideo` | MiniMax stills + Hailuo clips, fast cuts | 경제·시사·이슈·무협 | `demo-git` |
| `slides` | `SlideVideo` | **code-drawn** Claude-style keynote slides (no image gen) | 개념·정리·교육 | `demo-slides` |
| `theory` | `TheoryVideo` | **code-drawn** 3Blue1Brown-style graph/equation animation | CS·수학 강의 | `demo-theory` |

`slides`/`theory` generate **no images** — `build.mjs` only runs TTS for them, so they're fast
and nearly free. The rest of THIS skill documents the `montage`/`FactoryVideo` path in depth.
For the other two, see the dedicated skills **slide-explainer** (`slides`) and **theory-viz**
(`theory`) — they own those scene schemas and composition internals. `render.mjs <id>` /
`still.mjs <id> <frame>` work the same regardless of template.

---

## The mental model (why it's built this way)

The business lesson from the reference factory: **many images → fast scene transitions →
longer watch time → the algorithm pushes it.** "이미지만 두고 말만 하면 팟캐스트" — a static
image with a voiceover is just a podcast and dies in the feed. So the composition is
deliberately a **fast-cut machine**: one short narration sentence per scene, each scene is a
hard cut to a new visual, and every still is in constant Ken-Burns motion so nothing ever
sits still. The opening 1-2 scenes can be real Hailuo video clips for a stop-scroll hook;
the rest are cheap motion-stills. Your job here is to keep cuts fast and timing tight.

**The data IS the edit.** There is no timeline to drag. Each scene's on-screen duration is
derived from its TTS audio length, so to "edit" you change `project.json`, rebuild (cheap,
resumable), and re-render. The composition reads `build.json` and lays scenes back-to-back.

---

## Architecture: who owns what

```
factory/projects/<id>/project.json   <- source of truth (authored upstream)
        │  node factory/build.mjs <id>   (TTS + image + optional clip; RESUMABLE)
        ▼
public/factory/<id>/                  <- STATIC ASSETS (must live under public/, that's
   ├─ build.json                          the only dir staticFile() can read at render)
   ├─ audio/sNN.mp3
   ├─ img/sNN.jpg
   └─ clip/sNN.mp4   (only for scenes that requested + got a video)
        │
        ▼
src/factory/FactoryVideo.tsx          <- the composition. id "FactoryVideo",
   (registered in src/Root.tsx)           calculateFactoryMetadata fetches build.json
        │  node factory/render.mjs <id>   (headless bundle + renderMedia)
        ▼
out/<id>.mp4
```

Key consequence: **assets only become visible to Remotion once they're under
`public/factory/<id>/`** and listed in `build.json`. `build.mjs` already writes them there.
If a render shows a black frame for a scene, the asset path in `build.json` is wrong or the
file is missing — check that first.

---

## build.json manifest schema (the contract between build and render)

`build.mjs` emits this; `FactoryVideo.tsx` consumes it. Match it exactly — never invent
fields.

```jsonc
{
  "id": "demo-git",
  "title": "...",
  "format": { "width": 1920, "height": 1080, "fps": 30 },
  "style": { "imageSuffix": "...", "accent": "#22d3a6", "bg": "#0a0e14" },
  "scenes": [
    {
      "id": "s01",
      "narration": "깃 명령어, 아직도 외우고 계세요?",  // bottom subtitle text + drives length
      "caption": "아직도 외우세요?",                    // big center hook words (optional)
      "motion": "kenburns-in",                          // still motion preset
      "durationMs": 2100,                               // measured from the TTS mp3
      "durationFrames": 78,                             // ceil((durationMs/1000 + 0.35) * fps)
      "image": "factory/demo-git/img/s01.jpg",          // path RELATIVE to public/
      "audio": "factory/demo-git/audio/s01.mp3",
      "clip":  "factory/demo-git/clip/s01.mp4"          // OR null -> use the motion-still
    }
  ],
  "totalFrames": 1234   // sum of all durationFrames; becomes durationInFrames
}
```

How timing is computed in `build.mjs` (so you can predict it):

```js
const PAD_S = 0.35; // breathing room appended after every line
durationFrames = Math.max(1, Math.ceil((durationMs / 1000 + PAD_S) * fps));
```

- `durationMs` comes from the TTS result (`r.ms`, fallback to last subtitle `time_end`).
- `PAD_S = 0.35s` is added to every scene so cuts don't clip the last syllable. If lines
  feel rushed/cramped, this is the knob — but it lives in `build.mjs`, not the manifest.
- `totalFrames` is the literal sum; `calculateFactoryMetadata` returns it as
  `durationInFrames` along with `fps/width/height` pulled from `format`. **You never set a
  composition duration by hand** — the metadata function derives it from the manifest.

---

## How FactoryVideo lays scenes out (read this before tuning)

`src/factory/FactoryVideo.tsx`:

- Top level maps over `manifest.scenes`, placing each in a back-to-back `<Sequence from={cursor} durationInFrames={scene.durationFrames}>`. The running `from` cursor is the
  sum of prior `durationFrames` — i.e. **hard cuts, no overlap.** Order in the array IS the
  edit order.
- `calculateFactoryMetadata` does `fetch(staticFile('factory/<id>/build.json'))` and sets
  `durationInFrames/fps/width/height` + injects the parsed `manifest` into props. So the
  composition is fully driven by `build.json`; the `defaultProps={{ projectId: 'demo-git' }}`
  in `Root.tsx` is just the default target.

Each `<Scene>` stacks four layers, back to front:

1. **Visual** — if `scene.clip` is non-null, a `<Video muted objectFit:'cover'>`; otherwise
   an `<Img>` with a per-frame `transform` from the motion preset (Ken Burns / pan). Clip
   audio is muted because the scene's own TTS is the soundtrack.
2. **Legibility gradient** — a fixed top+bottom dark gradient so white text stays readable
   over any image. Don't remove it; bright images blow out the captions otherwise.
3. **Big hook caption** (`scene.caption`, optional) — 900-weight, ~100px, centered low,
   **springs in** (`spring({ damping:14, stiffness:120 })`) with a slide-up + accent
   underline bar in `style.accent`. This is the scroll-stopping punch word.
4. **Narration subtitle** (`scene.narration`) — 700-weight, ~38px, pill background at the
   very bottom. This is the full spoken sentence, always shown.
5. **`<Audio src={staticFile(scene.audio)} />`** — the scene's TTS, the timing backbone.

Per-cut polish: a quick **fade** at the head (frames 0→4) and tail (last 5 frames) of each
scene via `interpolate` on opacity — that's the "quick fade at each cut" cinematic feel.
Korean text uses `@remotion/google-fonts/NotoSansKR` at weights 400/700/900.

> **caption vs narration — don't confuse them.** `caption` = 2-5 punchy on-screen words
> (the hook, big and centered). `narration` = the full sentence that is both spoken (TTS)
> AND shown as the bottom subtitle. A scene with no `caption` just shows the subtitle.

---

## Motion presets (stills only; clips ignore motion)

Defined in `motionTransform()` in `FactoryVideo.tsx`. Set per scene via `project.json`
`scene.motion`; `build.mjs` defaults to `kenburns-in` if omitted.

| preset         | effect                                              |
|----------------|-----------------------------------------------------|
| `kenburns-in`  | scale 1.05 → 1.18 (slow push IN) — default          |
| `kenburns-out` | scale 1.18 → 1.05 (slow pull OUT)                   |
| `pan-left`     | scale 1.14, translateX +2.5% → −2.5% (drift left)  |
| `pan-right`    | scale 1.14, translateX −2.5% → +2.5% (drift right) |

Each is eased with `Easing.inOut(Easing.ease)` over the whole scene. **Vary them
scene-to-scene** — alternating in/out/pan keeps the fast-cut feel alive and avoids a
monotonous "everything zooms in" look. Clips don't use motion (the Hailuo video already
moves), so `motion` only matters for still scenes (`clip: null`).

---

## Commands (exact — these are the whole CLI surface)

These are plain Node ESM scripts using `@remotion/bundler` + `@remotion/renderer`
**directly** — there is no Remotion CLI step and no Remotion Studio needed for output.

```bash
# Render one PNG frame for fast visual QA (no full encode):
node factory/still.mjs <projectId> <frame> [outPng]
#   default frame 150, default out factory/_verify/still_<frame>.png
#   prints the frame index and composition.durationInFrames so you can pick frames per scene

# Full headless render to mp4 (h264, concurrency 2):
node factory/render.mjs <projectId> [outFile]
#   default out out/<projectId>.mp4
#   bundles src/index.ts with publicDir=public, selectComposition('FactoryVideo'), renderMedia
```

Both default `<projectId>` to `demo-git`. They call `selectComposition({ id:'FactoryVideo' })`
which triggers `calculateFactoryMetadata`, so **`public/factory/<id>/build.json` must exist
before you render** — run `build.mjs` first.

### The standard QA loop (cheap → full)

```bash
# 1) smoke: 3 scenes, no expensive video clips  (this is build.mjs, the upstream stage)
node factory/build.mjs <id> --limit 3 --no-video
# 2) eyeball one frame BEFORE spending on a full render or full generation
node factory/still.mjs <id> 30
# 3) full build (resumable — cached assets are skipped, so reruns are nearly free)
node factory/build.mjs <id>
# 4) render + review
node factory/render.mjs <id>
# 5) fix scenes in project.json -> re-build (cached) -> re-render
```

This mirrors the factory QA discipline: **the human reviews, the machine generates; agree
on the text/layout before spending on generation.** A still costs nothing; a full render is
cheap; regenerating assets is what costs API balance, and `build.mjs` caches those.

---

## How to add or tune a scene (the real workflow)

You don't edit the composition for content — you edit `project.json` and rebuild. The
`.tsx` only changes when you want a new *visual behavior* (a new motion preset, restyled
caption, etc.).

**Add a scene:** append an object to `project.json.scenes` with a unique `id` (e.g. `s19`),
a one-sentence `narration`, a short `caption`, an English `imagePrompt` (the
`style.imageSuffix` is appended automatically by `build.mjs`; always ask for "no text in
image"), and a `motion`. Optionally add a `video:{prompt,model,duration,resolution}` block
to make it an image→video clip (reserve this for the hook — it's slow and pricier). Then:

```bash
node factory/build.mjs <id>        # generates ONLY the new scene's assets (others cached)
node factory/render.mjs <id>
```

**Retune timing/feel without regenerating images:**
- Tighten or expand a line → edit `narration`; rebuild regenerates that mp3 and its length.
  (Delete `public/factory/<id>/audio/sNN.mp3` + `sNN.json` first to force a re-TTS, since
  build is resumable and skips existing files.)
- Change motion / caption text → edit `project.json`; these don't require regenerating the
  image at all, but **you must re-run `build.mjs`** because `build.json` is what the render
  reads, and only `build.mjs` rewrites it. (Editing only `build.json` by hand works for a
  one-off render but will be overwritten on the next build.)
- Reorder scenes → reorder the array; cuts follow array order.

**Retention guidance (apply when authoring/critiquing scenes):**
- ONE sentence per scene. If a narration has two clauses, split it into two scenes — more
  cuts = better retention.
- ~15-26 scenes for a 60-90s short-form explainer; far more for long-form.
- First 1-2 scenes: give them a `video` clip (stop-scroll hook). Rest: motion-stills.
- Alternate motion presets so no two adjacent scenes move the same way.
- Keep `caption` to a few punchy words; the full thought lives in `narration`/subtitle.

---

## Troubleshooting (factory-specific)

- **Black frame for one scene** → its `image`/`clip` path in `build.json` is missing on disk
  or wrong. Confirm `public/factory/<id>/img/sNN.jpg` (or `clip/sNN.mp4`) exists. Remember
  paths in `build.json` are relative to `public/`.
- **Render errors "cannot fetch build.json"** → you skipped `build.mjs`, or used the wrong
  `<id>`. `calculateFactoryMetadata` needs `public/factory/<id>/build.json`.
- **Audio cut off at the end of a scene** → increase `PAD_S` in `build.mjs` and rebuild
  (it's the per-scene tail padding), or slow the voice (`voice.speed`) in `project.json`.
- **Captions clipped/overlapping the subtitle** → caption is huge (≈100px) and pinned with
  `paddingBottom:140`; shorten the `caption` words. The subtitle sits below it at
  `paddingBottom:56`.
- **A clip scene shows the still instead** → `build.mjs` falls back to the still and sets
  `clip:null` when Hailuo generation fails; check the build log for `✗ clip failed`. Re-run
  `build.mjs` (resumable) to retry just that clip.
- **Wrong resolution/fps in output** → it comes from `project.json.format` → `build.json`
  → `calculateFactoryMetadata`. Fix `format`, rebuild, re-render. Don't touch `Root.tsx`'s
  placeholder `durationInFrames={300}` — metadata overrides it.

For deeper field-by-field detail, motion math, and the exact layer styling, see
`references/factory-internals.md`.
