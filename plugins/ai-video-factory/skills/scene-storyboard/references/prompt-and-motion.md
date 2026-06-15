# Reference: image prompts, motion choreography, and worked examples

Deep detail behind the `scene-storyboard` skill. Read this when a storyboard needs
more than the quick rules in SKILL.md.

## 1. Anatomy of a good imagePrompt for image-01

`build.mjs` line 58 concatenates: `` `${sc.imagePrompt}, ${project.style.imageSuffix}` ``.
So the model sees: **[your per-scene subject], [the global style suffix]**. Design your
per-scene part to carry *what's in the shot*; let the suffix carry *how it looks*.

A strong per-scene prompt names, in roughly this order:

1. **Subject + action** — `a stressed software developer staring at a terminal`
2. **Composition / framing** — `close-up`, `wide shot`, `over-the-shoulder`, `floating in dark space`
3. **Key props / detail** — `red git error messages`, `dozens of browser tabs`
4. **Light + mood** — `glowing monitor in a dark room`, `soft cinematic light` (the
   suffix reinforces this, but per-scene cues steer it)

Keep it to one dense sentence or two. Over-long prompts dilute the subject.

### Why "no text in image" is non-negotiable

`image-01` cannot render real letters — it produces convincing-looking garbage glyphs.
Every word the viewer reads (caption, subtitle) is drawn by Remotion in NotoSansKR.
So:

- Never ask for "a sign that says…", "a button labeled…", "code that reads…".
- For UI/terminal shots, ask for the *shape* of it: `a terminal with a bright green
  checkmark and particles of light` reads as success without needing legible text.
- The suffix ends in `no text` as a backstop, but a prompt that requests text will
  still often produce it. Write around it.

### Keeping all scenes in one universe (consistency = the suffix)

The single biggest quality lever after "no text" is a **stable `style.imageSuffix`**.
It's what makes 18 independently-generated images feel like one film. Lock it once per
project and never vary it scene-to-scene. A good suffix specifies, all at once:

- render technique — `dark cinematic 3D render` / `oil painting` / `anime cel-shaded`
- environment flavor — `modern developer workspace aesthetic`
- a 1-2 color rim-light scheme — `teal and amber rim lighting` (echo `style.accent`)
- depth/lens — `shallow depth of field`, `volumetric glow`
- quality + guardrails — `ultra detailed, no text, 16:9 cinematic`

If you want *character* consistency (the same person across scenes), note that the
engine supports `subject_reference` in `generateImage`, but `build.mjs` does NOT wire
it up per scene today — it always calls `generateImage({ prompt, aspectRatio: '16:9' })`.
So today, consistency comes from the suffix + careful prompt wording, not from a
reference image. Don't promise reference-image character locking unless build.mjs is
extended.

## 2. Motion choreography

The four presets and their exact transforms (from `motionTransform` in
`src/factory/FactoryVideo.tsx`):

```
kenburns-in   scale 1.05 -> 1.18         push in,  energy rising
kenburns-out  scale 1.18 -> 1.05         pull out, energy settling
pan-left      scale 1.14, X +2.5% -> -2.5%   drift right-to-left
pan-right     scale 1.14, X -2.5% -> +2.5%   drift left-to-right
```

All ease in-out over the scene's full duration. There is no "static" option — every
still always moves, by design (motion = watch time).

### Choreography heuristics

- **Open with `kenburns-in`** on the hook scene — pushing in pulls the eye in.
- **Land conclusions with `kenburns-out`** — pulling back reads as "stepping back to
  reflect", good for the takeaway/CTA.
- **Alternate `pan-left` / `pan-right`** across list-y middle scenes so consecutive
  pans don't all drift the same way (which looks like a stuck camera).
- **Never 3+ identical in a row.** Scan your storyboard's motion column vertically; if
  you see a run, break it.
- A scene with a working `video` clip ignores `motion` (it plays the clip). Still set a
  fallback motion in case the clip fails — build.mjs degrades to the still.

Example rhythm for an 8-scene segment:
`in · pan-left · out · in · pan-right · out · pan-left · out`

## 3. Hook clips (Hailuo image-to-video) in depth

The clip pipeline (verified in `build.mjs` step 3 + `minimax.mjs generateVideo`):

1. The scene's still `sNN.jpg` is generated first (image step).
2. build.mjs base64-encodes it into a `data:image/jpeg;base64,…` dataURL.
3. `generateVideo` submits a task with that as `first_frame_image` (→ image-to-video),
   polls every 5s up to 6 min, then downloads the MP4.

Implications for how you write `video.prompt`:

- It animates **from the existing still**, so describe ONLY motion/camera, never a new
  subject or scene. "[Push in] the developer leans back, screen glow flickering" — good.
  "[Push in] a spaceship lands" when the still is a developer — bad, fights the frame.
- Lead with a bracketed camera/action token. Conventions seen in the verified demo:
  `[Push in]`, and you can use `[Pan right]`, `[Pan left]`, `[Slow zoom]`, `[Tilt up]`,
  `[Dolly out]`. Keep the rest a short clause about subtle subject motion.
- Params that work: `model: "MiniMax-Hailuo-2.3-Fast"`, `duration: 6`, `resolution: "768P"`.
  Other valid models if you want higher quality at more cost/time:
  `MiniMax-Hailuo-2.3`, `MiniMax-02`.

Cost/time reality: clips are the slowest (~1-3 min) and priciest asset. That's the
whole reason the pattern is "front 1-2 scenes only." Putting clips on every scene
defeats "시간 단축이 살길" (speed is survival) and the ~2,000 KRW/video economics.

## 4. Worked example — fixing a weak storyboard

**Weak (rejected at ASCII review):**

```
s01  kenburns-in        시작합니다        오늘은 깃에 대해 알아보겠습니다.    a git logo on white background with the text "GIT 101"
s02  kenburns-in        깃이란            깃은 버전 관리 도구입니다.          a diagram explaining git with labels
s03  kenburns-in        명령어            여러 명령어가 있습니다.            a list of git commands on screen
```

Problems caught for free, before any generation:
- s01 caption "시작합니다" is a non-hook (nobody stops scrolling for "let's begin").
- Every prompt asks for **text in the image** (`"GIT 101"`, labels, a command list) —
  image-01 will render garbage.
- All three are `kenburns-in` — dead-slideshow rhythm.
- Narration is generic/teachy, not curiosity-driving.

**Revised (approved):**

```
s01  kenburns-in   ★  아직도 외우세요?   깃 명령어, 아직도 외우고 계세요?      stressed dev, red git errors filling a dark terminal, hands on head
s02  pan-left         검색 수십 번      reset, rebase… 검색만 수십 번 했죠.   close-up screen, dozens of stackoverflow tabs reflected in glasses
s03  kenburns-out     안 외운다         요즘 개발자들은 명령어를 안 외웁니다.   calm confident dev leaning back, arms crossed, soft cinematic light
```

What changed: hook captions, zero in-image text (errors/tabs convey meaning visually),
alternating motion, a `★` clip on the opener, and narration that opens a curiosity gap.

## 5. Pre-flight checklist before you write project.json

- [ ] One Korean sentence per scene; ~15-26 scenes for short-form.
- [ ] `id` kebab-case, equals the project dir; scene ids `s01..sNN`, zero-padded, unique.
- [ ] Every `imagePrompt` is English, subject-only (no style suffix duplicated), asks for NO text.
- [ ] One shared `style.imageSuffix`, identical across all scenes.
- [ ] `format` orientation matches 16:9 (build.mjs hard-codes 16:9 for images).
- [ ] Motion varied; no 3+ identical in a row; conclusions tend to `kenburns-out`.
- [ ] Exactly the opening 1-2 scenes carry a `video` clip; prompt describes motion of THAT still.
- [ ] `voice.voiceId` = `shainvoice01`.
- [ ] You showed the ASCII storyboard and got a "yes" before writing the file.
