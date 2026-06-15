---
name: ad-creative
description: >
  Produce product ad creatives on the factory engine — (a) a 5-card card-news carousel
  (hook → 개념전환 framing → feature → result → CTA) in one consistent layout, and
  (b) a 15-second vertical 3-beat shorts ad (product → application → result) where each
  beat is a Hailuo I2V clip dissolved together. Generates with the MiniMax media engine
  and ALWAYS agrees the layout as an ASCII diagram before spending a single API call.
  USE THIS whenever the user asks to make an ad, carousel, or card-news in Korean or
  English: 광고 제작, 카드뉴스, 제품 광고, 쇼츠 광고, 릴스 광고, 캐러셀 광고, 인스타 광고,
  product ad, carousel ad, card news, reels ad, shorts ad, vertical ad, ad creative,
  promo video for a product. Trigger even when the user does not name this skill — any
  "make me an ad / 광고 만들어줘 / 카드뉴스 만들어줘" request belongs here.
---

# ad-creative — product ad creatives on the factory engine

A BONUS pipeline distilled from VIDEO 1 (the ad-visual technique video). You build two
ad deliverables on the **same data-driven engine** the long-form factory uses — no new
renderer, no new client. You only author a `project.json` of the right shape and run the
existing scripts.

The two CORE LESSONS that make this skill work, and that you must never violate:

1. **만들기 전에 글자로 먼저 맞춘다 — agree the layout in text first.** Before any image
   or clip is generated, draw the card / beat layout as an **ASCII diagram** and get the
   user to confirm it. Generation costs real API balance; a wrong layout caught at the
   text stage costs nothing. The human's job is QA/검수, not making.
2. **While one asset generates, start the next.** The build script already parallelizes
   images (concurrency 3) and resumes from cache, so your job is to front-load all the
   prompt decisions, then let the machine grind.

> WHY this is the same engine: `factory/build.mjs` reads `factory/projects/<id>/project.json`,
> generates per-scene TTS + image (+ optional Hailuo clip), and writes the Remotion-consumed
> manifest `public/factory/<id>/build.json`. `src/factory/FactoryVideo.tsx` renders any
> manifest data-driven, taking `format.{width,height,fps}` from the project. A card-news set
> is just scenes that are stills; a 3-beat ad is just scenes that each carry a `video` block.
> An "ad" is a `project.json` with ad-shaped scenes — nothing more.

---

## Deliverable A — Card-news 5-set (carousel)

Five cards in **one consistent layout**, following the proven persuasion arc:

| # | Role | Korean | What it does |
|---|------|--------|--------------|
| 1 | hook | 후킹 | Stop the scroll. A problem/curiosity gap. |
| 2 | framing | 개념전환 | Reframe how they think about the problem. |
| 3 | feature | 기능 | The product's key capability. |
| 4 | result | 결과 | The transformation / proof / before-after. |
| 5 | CTA | 행동유도 | One clear next action. |

Consistency is the whole point of a carousel — same `style.imageSuffix`, same `accent`,
same `format`. Use `subject_reference` thinking in your prompts (describe the SAME product,
same palette, same camera every card) so the five images read as one set. (`build.mjs`
calls `generateImage` without `subjectReference`; if you need true product-identity lock
across cards, see `references/consistency.md`.)

Format: choose by destination platform.
- Instagram / 카드뉴스 feed → `1:1` square. Set `"format": { "width": 1080, "height": 1080, "fps": 30 }`.
- Reels / shorts carousel → `9:16`. Set `"format": { "width": 1080, "height": 1920, "fps": 30 }`.

> NOTE: `generateImage` accepts `aspectRatio` `16:9` / `9:16` / `1:1`, but **`build.mjs`
> hardcodes `aspectRatio: '16:9'`** when it generates images. So image generation produces
> 16:9 source frames regardless of `format`; Remotion then `objectFit: cover`-crops them to
> your `format`. For a true square/vertical native generation you must edit the build call —
> see "Native vertical/square images" in `references/engine-notes.md`. For most card-news the
> cover-crop is fine because captions sit in the safe center/bottom band.

### ASCII-first card layout (show this, get a yes, THEN build)

```
CARD-NEWS 5-SET  |  product: <NAME>  |  format: 1:1 1080x1080  |  accent: #22d3a6
┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
│        [ IMAGE ]         │  │        [ IMAGE ]         │  │        [ IMAGE ]         │
│   (no text in image)    │  │   (no text in image)    │  │   (no text in image)    │
│  ░░ legibility grad ░░   │  │  ░░ legibility grad ░░   │  │  ░░ legibility grad ░░   │
│                          │  │                          │  │                          │
│  ███ 후킹 카피 ███        │  │  ███ 개념전환 카피 ███     │  │  ███ 기능 카피 ███        │
│  ▔▔▔ accent bar         │  │  ▔▔▔ accent bar         │  │  ▔▔▔ accent bar         │
│  narration subtitle line │  │  narration subtitle line │  │  narration subtitle line │
└──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘
   CARD 1  hook                  CARD 2  framing(개념전환)       CARD 3  feature
┌──────────────────────────┐  ┌──────────────────────────┐
│        [ IMAGE ]         │  │        [ IMAGE ]         │
│  ░░ legibility grad ░░   │  │  ░░ legibility grad ░░   │
│  ███ 결과 카피 ███        │  │  ███ CTA 카피 ███        │
│  ▔▔▔ accent bar         │  │  ▔▔▔ accent bar         │
└──────────────────────────┘  └──────────────────────────┘
   CARD 4  result               CARD 5  CTA  ("지금 ___하기")
```

The layout above is exactly what `FactoryVideo.tsx` already paints per scene: the image
fills the frame with a Ken-Burns transform, a bottom legibility gradient, the big 900-weight
**caption** hook (`scene.caption`), an accent bar under it, and the **narration** subtitle
line. So your card copy maps onto the existing slots — `caption` = the big card headline,
`narration` = the spoken/subtitle line. You do not build a new layout; you fill these slots.

### Card-news project.json (this is the real shape build.mjs reads)

```json
{
  "id": "ad-noise-buds",
  "title": "노이즈버즈 카드뉴스 5세트",
  "niche": "ad-cardnews",
  "lang": "ko",
  "format": { "width": 1080, "height": 1080, "fps": 30 },
  "voice": { "voiceId": "shainvoice01", "model": "speech-2.6-hd", "speed": 1.0 },
  "style": {
    "imageSuffix": "clean premium product photography, soft studio gradient background, single hero product centered, consistent teal-and-charcoal palette, soft shadow, no text, no logo, high detail",
    "accent": "#22d3a6",
    "bg": "#0a0e14"
  },
  "scenes": [
    { "id": "s01", "caption": "지하철에서도 조용했다", "narration": "출근길 소음, 아직도 그냥 참고 계세요?",
      "imagePrompt": "a crowded noisy subway car, a calm person wearing sleek wireless earbuds eyes closed in peace, motion blur crowd around them", "motion": "kenburns-in" },
    { "id": "s02", "caption": "이어폰이 아니라 '경계선'", "narration": "이건 이어폰이 아니라, 세상과 나 사이의 경계선입니다.",
      "imagePrompt": "a single premium wireless earbud floating, a glowing soundproof bubble of quiet around it, minimal studio", "motion": "kenburns-out" },
    { "id": "s03", "caption": "98% 소음 차단", "narration": "주변 소음의 98퍼센트를 실시간으로 지워줍니다.",
      "imagePrompt": "macro shot of the earbud with elegant teal sound-cancellation waves visibly bending away from it, dark studio", "motion": "pan-left" },
    { "id": "s04", "caption": "집중력이 달라진다", "narration": "끼는 순간, 카페가 내 작업실이 됩니다.",
      "imagePrompt": "a focused person working calmly in a busy cafe, everything else softly blurred, warm focused glow on them", "motion": "kenburns-in" },
    { "id": "s05", "caption": "오늘만 30% 할인", "narration": "지금 프로필 링크에서 확인하세요.",
      "imagePrompt": "the product hero shot in its premium open case glowing, clean negative space on one side for price, studio", "motion": "kenburns-out" }
  ]
}
```

Notes that match the engine exactly:
- `style.imageSuffix` is **appended automatically** by `build.mjs` (`${sc.imagePrompt}, ${imageSuffix}`). Put the *consistency* directives (palette, lighting, "no text, no logo") in the suffix so every card inherits them.
- Always include **"no text"** in the prompt — text rendered by the image model is unreliable Korean; the real Korean copy is the Remotion `caption`/`narration` overlay.
- 5 scenes, **one Korean sentence each** for `narration` (that one sentence is the TTS for that card and sets its on-screen duration).

---

## Deliverable B — 15s vertical 3-beat ad (shorts/reels)

Three beats, each a **Hailuo image-to-video clip**, dissolved together:

| Beat | Role | Korean | Clip shows |
|------|------|--------|-----------|
| 1 | product | 제품 | The hero product, a confident reveal motion. |
| 2 | application | 적용 | The product in real use / context. |
| 3 | result | 결과 | The payoff + a CTA caption. |

Each beat = ~5s → ~15s total. Each scene carries a `video` block, so `build.mjs` generates
the still first, then feeds it as `first_frame_image` (I2V) to Hailuo. `FactoryVideo.tsx`
plays `scene.clip` when present (else the still), and the per-cut head/tail fade *is* the
dissolve between beats.

Format is vertical: `"format": { "width": 1080, "height": 1920, "fps": 30 }`.

> COST WARNING: Hailuo clips are slow (~1–3 min each) and burn the rich KEY2/3/4 balance.
> Three clips is fine. ALWAYS run the still smoke test (`--no-video`) first and eyeball the
> three frames before you let it generate video. This is the "front part as video" pattern
> from VIDEO 2 applied to a whole 15s ad.

### ASCII-first 3-beat layout (confirm before generating)

```
3-BEAT VERTICAL AD  |  product: <NAME>  |  9:16 1080x1920  |  ~15s, 3 Hailuo clips, dissolved
┌───────────┐         ┌───────────┐         ┌───────────┐
│  ▶ CLIP   │  ░fade░  │  ▶ CLIP   │  ░fade░  │  ▶ CLIP   │
│  product  │  ────►   │   in-use  │  ────►   │  result   │
│  reveal   │ dissolve │  context  │ dissolve │  + CTA    │
│ [Push in] │         │ [Pan/Track]│         │ [Pull back]│
│ ███후킹██ │         │ ███가치██ │         │ ███행동██ │
└───────────┘         └───────────┘         └───────────┘
  BEAT 1 ~5s            BEAT 2 ~5s            BEAT 3 ~5s
  제품 reveal           적용/사용 장면        결과 + "지금 구매"
```

`[Push in]`, `[Pull back]`, `[Track]`, `[Pan]` are camera directives Hailuo understands —
put them at the **start** of `video.prompt`, exactly like the demo project does.

### 3-beat project.json (real shape)

```json
{
  "id": "ad-buds-15s",
  "title": "노이즈버즈 15초 쇼츠 광고",
  "niche": "ad-shorts",
  "lang": "ko",
  "format": { "width": 1080, "height": 1920, "fps": 30 },
  "voice": { "voiceId": "shainvoice01", "model": "speech-2.6-hd", "speed": 1.05 },
  "style": {
    "imageSuffix": "premium cinematic product film, dramatic teal rim light, charcoal backdrop, shallow depth of field, no text, no logo, ultra detailed",
    "accent": "#22d3a6",
    "bg": "#0a0e14"
  },
  "scenes": [
    { "id": "s01", "caption": "소음, 끝.", "narration": "당신의 하루를 조용하게.",
      "imagePrompt": "a sleek wireless earbud rising out of its case on a dark reflective pedestal, dramatic teal rim light",
      "motion": "kenburns-in",
      "video": { "prompt": "[Push in] the earbud rises and rotates slowly, rim light sweeping across it", "model": "MiniMax-Hailuo-2.3-Fast", "duration": 6, "resolution": "768P" } },
    { "id": "s02", "caption": "어디서든 내 공간", "narration": "지하철에서도, 카페에서도.",
      "imagePrompt": "a person wearing the earbuds walking calmly through a busy blurred city, serene expression, cinematic",
      "motion": "pan-right",
      "video": { "prompt": "[Track] camera tracks alongside the calm person as the busy world blurs past", "model": "MiniMax-Hailuo-2.3-Fast", "duration": 6, "resolution": "768P" } },
    { "id": "s03", "caption": "지금, 30% 할인", "narration": "프로필 링크에서 지금 만나보세요.",
      "imagePrompt": "the product hero in its glowing open case on a clean pedestal, premium spotlight, empty space for CTA",
      "motion": "kenburns-out",
      "video": { "prompt": "[Pull back] camera pulls back revealing the product on a glowing pedestal in a studio", "model": "MiniMax-Hailuo-2.3-Fast", "duration": 6, "resolution": "768P" } }
  ]
}
```

`video.duration: 6` gives Hailuo headroom; the actual on-screen length per beat is driven by
the **narration TTS length** (build.mjs computes `durationFrames` from `durationMs + 0.35s`).
Keep each narration to ~1 short sentence so each beat lands near 5s and the ad stays ~15s.

---

## The run loop (QA discipline — do not skip a step)

```
# 0. Author project.json AFTER the ASCII layout is confirmed by the user.
#    factory/projects/<id>/project.json   (id MUST match the folder name)

# 1. Cheap smoke — stills only, first 3 scenes, NO video. Costs almost nothing.
node factory/build.mjs <id> --limit 3 --no-video
node factory/still.mjs <id> 30           # writes factory/_verify/still_30.png — eyeball it

# 2. Full build (resumable; re-running skips any asset already on disk).
#    Card-news: add --no-video (no clips at all).
node factory/build.mjs <id> --no-video          # card-news 5-set
node factory/build.mjs <id>                      # 3-beat ad (generates Hailuo clips)

# 3. Render with the existing headless Remotion pipeline.
node factory/render.mjs <id>                     # -> out/<id>.mp4

# 4. Review out/<id>.mp4 -> fix copy/prompts in project.json -> re-run.
#    Cached assets are reused, so iteration is cheap. Delete a scene's
#    public/factory/<id>/{img,clip,audio}/sNN.* to force just that one to regenerate.
```

WHY each step: step 1 catches a wrong palette/crop for ~0 cost. Step 2 is resumable so a
crash or a fix never re-spends on assets you already have. Deleting one scene's files is the
surgical way to regenerate a single bad card without paying for the other four.

> Composition note: `render.mjs`/`still.mjs` select the registered composition id
> **`FactoryVideo`** and pass `{ projectId: <id> }`; `calculateFactoryMetadata` then reads
> your `build.json` and sets width/height/fps/duration from `format`. So a vertical or square
> ad renders correctly with **no Root.tsx change** — the size comes from your project's
> `format`, not from the composition's default props.

---

## Key allocation & cost (verified)

- TTS uses **KEY1** (`shainvoice01`, the user's cloned voice, LOW balance — voice only).
- Images + Hailuo clips use **KEY2/3/4** (rich, round-robin + failover).
- Economics target from VIDEO 2: ~$5 per 1000 images ≈ ~2,000 KRW per video. A 5-card set is
  5 images; a 3-beat ad is 3 images + 3 clips. Both are well under budget — the discipline is
  about **not regenerating** (resume + cache), not about per-call price.

## What to push to the user, in order
1. The **ASCII layout** (card grid or beat strip) + the 5 copy lines (caption + narration). Get a yes.
2. Then author `project.json`, run the smoke test, show the still.
3. Then full build + render, show the mp4, iterate on copy.

Never bulk-generate before the text-level layout is agreed. The machine generates; the human reviews.

See `references/engine-notes.md` for build.mjs internals (16:9-hardcode, caching, manifest
fields) and `references/consistency.md` for locking product identity across a carousel.
