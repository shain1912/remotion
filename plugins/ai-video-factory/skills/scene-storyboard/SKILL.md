---
name: scene-storyboard
description: >-
  Turn a finished Korean script into a shot-by-shot storyboard and per-scene
  English image prompts, then write/edit factory/projects/<id>/project.json — the
  single source of truth one build.mjs consumes. THE core VIDEO-1 technique:
  "만들기 전에 글자로 먼저 맞춘다" — agree on the layout as an ASCII diagram and
  get a yes BEFORE spending any MiniMax balance on generation. Assigns each scene
  an imagePrompt (no text in image, consistent style via style.imageSuffix), a
  motion preset for visual rhythm, and decides which 1-2 opening scenes get a
  Hailuo video clip for a stop-scroll hook. TRIGGER on: 스토리보드, 장면 구성,
  콘티, 이미지 프롬프트 설계, project.json 만들기/짜줘, 씬 나눠줘, 모션 정해줘,
  storyboard, shot list, scene breakdown, image prompts, make/build project.json,
  assign motion, pick the hook clip. Use this AFTER the script exists and BEFORE
  running node factory/build.mjs.
---

# scene-storyboard

You convert a written Korean script into a **storyboard** and the machine-readable
`factory/projects/<id>/project.json` that the rest of the factory runs on. This is
the highest-leverage step in the whole pipeline, so do it deliberately.

## Why ASCII-first matters (don't skip it)

The expensive failure mode is generating 18 images, rendering, then discovering the
layout/style/rhythm was wrong — now you've burned MiniMax balance AND time on assets
you throw away. The VIDEO-1 insight is that **text is free and images are not**: a
storyboard you can read in 10 seconds catches the same problems an image would, at
zero cost.

So the rule is: **show the storyboard as an ASCII block, get a human "yes", and only
then write the final `project.json`.** The human's job here is QA/검수, not making.
You propose; they approve or correct; the machine generates. While one batch
generates later, you can already be storyboarding the next video.

If `project.json` already exists and you're only tweaking a few scenes, you can skip
straight to editing — but still echo the changed scenes back as a mini ASCII block so
the human can sign off on the diff.

## Inputs you need before you start

- **An `id`** (kebab-case, e.g. `demo-git`). It names the project dir and every output path.
- **The script** — ideally already broken into one Korean sentence per scene (the
  `viral-script-writer` skill produces this). If you only have a paragraph, split it
  yourself: **one sentence = one scene** is the retention rule, because each scene is
  its own cut, and frequent cuts are what keep watch time up ("이미지만 두고 말만 하면
  팟캐스트" — a slideshow with no motion dies).
- **The niche + visual style** so you can write a good `style.imageSuffix`.

Scene count guidance: **~15-26 scenes for a 60-90s short-form explainer**; far more
for long-form. Don't pad; don't cram two ideas into one scene.

## The procedure

### 1. Draft the storyboard as an ASCII block — show it, don't save it yet

For each scene, decide four things and lay them out as a table the human can scan:

- **narration** — the exact Korean sentence (this becomes the TTS for the scene, and
  its spoken length sets the scene's on-screen duration; you don't pick durations,
  the voice does — see "How duration works" below).
- **caption** — 2-4 punchy Korean hook words shown BIG on screen. Not the full
  sentence — a stab that makes a scroller stop. (Rendered at fontSize 100, weight 900.)
- **image** — a one-line plain-English gist of the picture (you'll expand this into a
  full prompt in step 3).
- **motion** — one of the four presets, chosen for rhythm (see step 2).
- **clip?** — mark `★` on the 1-2 opening scenes that should be a live Hailuo video
  instead of a still (see step 4).

Show it like this and ask for approval:

```
STORYBOARD  ▸  demo-git  ▸  "깃 명령어 외우던 시대는 끝났다"  ▸  16:9 / 30fps
style: dark cinematic 3D render, teal+amber rim light, shallow DOF, NO TEXT

#    motion        clip  caption        narration (KO, = TTS)              image gist (EN)
s01  kenburns-in    ★    아직도 외우세요?   깃 명령어, 아직도 외우고 계세요?         stressed dev, red git errors, dark room
s02  pan-left            검색 수십 번      git reset, rebase… 검색만 수십 번.       screen w/ dozens of stackoverflow tabs
s03  kenburns-out        외우지 않는다     요즘 잘나가는 개발자들은 안 외웁니다.       calm confident dev, arms crossed
s04  kenburns-in    ★    바이브 코딩       비결은 바이브 코딩입니다.                neon AI brain merging with code streams
s05  pan-right           말로 설명하면 끝   원하는 걸 말로 하면 AI가 실행해 줍니다.     chat-in-IDE, glowing AI reply bubbles
…
s18  kenburns-out        지금 따라하기     다음 편에서 실전 셋업까지.               forward arrow, rising path of light (no platform CTA)
                                                                 ─────────────────────────────
                                            18 scenes · 2 hook clips · est ~75-85s
```

Then literally ask: **"이 콘티대로 갈까요? 고칠 씬 있으면 말씀해 주세요."** Wait for a
yes (or apply their edits and re-show) before step 3+.

### 2. Choose motion presets for rhythm (not at random)

`build.mjs` passes `scene.motion` straight into Remotion. Only these four exist
(verified in `src/factory/FactoryVideo.tsx` `motionTransform`):

| preset          | effect                                  | use for                          |
| --------------- | --------------------------------------- | -------------------------------- |
| `kenburns-in`   | scale 1.05 → 1.18 (slow push in)        | reveals, "here's the thing" beats |
| `kenburns-out`  | scale 1.18 → 1.05 (pull back)           | conclusions, calming/landing lines |
| `pan-left`      | scale 1.14, drift right→left            | lists, "and also…" continuations  |
| `pan-right`     | scale 1.14, drift left→right            | lists, alternating with pan-left  |

**Vary them.** Three identical motions in a row reads as a dead slideshow. A good
default pattern alternates: in → pan-left → out → in → pan-right → … If you omit
`motion`, `build.mjs` defaults to `kenburns-in`.

### 3. Expand each gist into a full English imagePrompt

Now write the real `imagePrompt` for `image-01`. Rules that come straight from the engine:

- **English, descriptive, cinematic.** Describe subject, composition, lighting, mood.
- **NO text in the image.** `image-01` renders garbled fake letters; captions/subtitles
  are added by Remotion as real fonts. The shared `style.imageSuffix` already ends with
  `no text`, but write prompts that don't ask for signs/labels/UI text anyway.
- **Do NOT append the style yourself.** `build.mjs` does it for you — line 58 is
  literally ``const prompt = `${sc.imagePrompt}, ${project.style.imageSuffix}`;``. Your
  `imagePrompt` is the per-scene subject; `style.imageSuffix` is the global look that
  glues every scene into one consistent video. Keep that suffix identical across the
  whole project — that consistency is what makes 18 separately-generated images feel
  like one film.
- **Aspect ratio is fixed at 16:9** by `build.mjs` (it calls `generateImage` with
  `aspectRatio: '16:9'`), so you don't set it per scene. `format.width/height` in
  `project.json` must match that orientation (1920×1080 for 16:9, 1080×1920 for 9:16).

Good imagePrompt (subject only — engine appends the suffix):
`a stressed software developer staring at a terminal full of red git error messages, hands on head, glowing monitor in a dark room`

### 4. Decide the hook clip(s)

The "front part as video" pattern from VIDEO-2: give the **first 1-2 scenes** a live
Hailuo clip so the feed shows motion immediately and the scroll stops; the rest stay
cheap stills with Ken-Burns. Add a `video` object to those scenes only:

```json
"video": { "prompt": "[Push in] the developer slowly leans back in frustration, screen glow flickering", "model": "MiniMax-Hailuo-2.3-Fast", "duration": 6, "resolution": "768P" }
```

How it actually runs (verified in `build.mjs` step 3): the clip is **image-to-video** —
build.mjs reads the already-generated `sNN.jpg`, sends it as the `first_frame_image`,
and Hailuo animates FROM that still. So:

- The clip must use the **same scene image** as its starting frame — keep the `video.prompt`
  consistent with that scene's `imagePrompt`. Describe *motion*, not a new scene.
- Start the prompt with a camera/action cue in brackets, e.g. `[Push in]`, `[Pan right]`,
  `[Slow zoom]` — that's the Hailuo convention used in the verified demo project.
- Use `MiniMax-Hailuo-2.3-Fast` (cheapest/fastest; other valid models:
  `MiniMax-Hailuo-2.3`, `MiniMax-02`), `duration: 6`, `resolution: "768P"`.
- Clips are **slow (~1-3 min each) and the priciest asset** — that's exactly why only
  the opening gets them. If a clip generation fails, `build.mjs` silently falls back to
  the still, so the video never breaks.

In Remotion, a scene with a clip plays the muted `Video` (cover-fit) instead of the
Ken-Burns `Img`; `motion` is ignored for that scene. Still set a sensible `motion`
anyway as the fallback if the clip fails.

## Writing project.json (the final artifact)

After approval, write/overwrite `factory/projects/<id>/project.json` matching this
schema exactly (it is the single source of truth; `build.mjs` reads it directly):

```json
{
  "id": "demo-git",
  "title": "깃 명령어 외우던 시대는 끝났다 | 바이브 코딩 Git",
  "niche": "ai-dev",
  "lang": "ko",
  "format": { "width": 1920, "height": 1080, "fps": 30 },
  "voice": { "voiceId": "shainvoice01", "model": "speech-2.6-hd", "speed": 1.05 },
  "style": {
    "imageSuffix": "dark cinematic 3D render, modern developer workspace aesthetic, teal and amber rim lighting, shallow depth of field, volumetric glow, ultra detailed, no text, 16:9 cinematic",
    "accent": "#22d3a6",
    "bg": "#0a0e14"
  },
  "scenes": [
    {
      "id": "s01",
      "narration": "깃 명령어, 아직도 외우고 계세요?",
      "caption": "아직도 외우세요?",
      "imagePrompt": "a stressed software developer staring at a terminal full of red git error messages, hands on head, glowing monitor in a dark room",
      "motion": "kenburns-in",
      "video": { "prompt": "[Push in] the developer slowly leans back in frustration, screen glow flickering", "model": "MiniMax-Hailuo-2.3-Fast", "duration": 6, "resolution": "768P" }
    },
    {
      "id": "s02",
      "narration": "git reset, rebase, cherry-pick. 검색만 수십 번 해보셨을 겁니다.",
      "caption": "검색 수십 번",
      "imagePrompt": "close-up of a screen with dozens of stackoverflow browser tabs open about git commands, reflection on developer glasses",
      "motion": "pan-left"
    }
  ]
}
```

Field rules:

- **`id`** must equal the directory name and is reused in every output path
  (`public/factory/<id>/…`). Keep it kebab-case.
- **`voice.voiceId`** = `shainvoice01` (the user's verified cloned voice). Model
  `speech-2.6-hd`. `speed` ~1.0-1.1 (1.05 reads as energetic but clear).
- **`style.accent`** is the on-screen highlight color (caption underline/glow);
  **`style.bg`** is the letterbox background. Pick to match the niche's mood.
- **`scenes[].id`** = zero-padded `s01`, `s02`, … This is the literal filename stem for
  every asset (`img/s01.jpg`, `audio/s01.mp3`, `clip/s01.mp4`), so it must be unique and
  stable. Renaming a scene id orphans its cached files.
- Only the **opening scene(s)** carry a `video` object. `caption` is optional in the
  schema but you should almost always provide one (it's the big hook word).

## How duration works (so you don't try to set it)

You never write durations. `build.mjs` generates the TTS, measures the audio length,
adds `PAD_S = 0.35s` breathing room, and computes `durationFrames` per scene. The
`build.json` manifest carries those frames and `totalFrames`; Remotion's
`calculateFactoryMetadata` sets the composition length from it. **Your lever on pacing
is sentence length** — shorter Korean sentences → shorter scenes → snappier cuts.

## Hand off to the build loop (QA discipline)

Once `project.json` is written and approved, the next moves (do NOT run these yourself
unless asked — just tell the human the commands):

```
node factory/build.mjs <id> --limit 3 --no-video   # cheap smoke: 3 scenes, no clips
node factory/still.mjs <id> 30                      # eyeball one frame
node factory/build.mjs <id>                         # full build (resumable, cached)
node factory/render.mjs <id>                        # headless Remotion render -> out/<id>.mp4
```

`build.mjs` is **resumable** — it skips any asset that already exists, so fixing a few
scenes and re-running is cheap and never re-spends balance on cached assets. If you
change a scene's `imagePrompt`, delete that one `public/factory/<id>/img/sNN.jpg` to
force a regen; the rest stay cached.

For deep detail on prompt patterns, motion choreography, and worked before/after
examples, see `references/prompt-and-motion.md`.
