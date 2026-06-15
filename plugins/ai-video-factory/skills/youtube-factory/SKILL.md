---
name: youtube-factory
description: >-
  Master orchestrator + entry point for the AI YouTube content FACTORY (양산 공장).
  Turns ONE topic into a finished, retention-optimized Korean video at near-zero
  marginal cost using MiniMax (image/video/TTS) + Remotion. TRIGGER whenever the
  user wants to produce or mass-produce a YouTube video, e.g. "이 주제로 영상
  만들어줘", "유튜브 영상 양산해줘", "영상 한 편 뽑아줘", "쇼츠 만들어줘", "공장
  돌려줘", "팩토리 시작", "파이프라인 돌려", or in English "make a YouTube video
  about X", "mass-produce a video", "run the factory / pipeline", "spin up a
  short". Also trigger when the user has a topic/script/idea and wants it turned
  into a rendered .mp4. This is the SPINE that ties together the sub-skills
  topic-miner → viral-script-writer → scene-storyboard → minimax-media (build.mjs)
  → remotion-assembler (render.mjs) → thumbnail-designer. Drive the whole pipeline
  from here.
---

# YouTube Factory — Master Orchestrator (양산 공장)

You are running a **factory**, not crafting one artisanal video. The whole point
(distilled from the two reference videos) is: **reduce per-video human effort so
you can publish MANY**. "시간 단축이 살길." The human's job is **QA / 검수**, not
making. The machine generates; you review at text level FIRST, then eyeball
cheap samples, then commit to the full run.

Two laws govern every step:

1. **글자로 먼저 맞춘다 (ASCII-first).** Before spending a single API call on an
   image, agree the layout/storyboard **as text** (an ASCII diagram or the
   `project.json` scene list). Text is free to iterate; generated pixels are not.
   Confirm the plan, *then* generate.
2. **이미지만 두고 말만 하면 팟캐스트.** Retention comes from **many images → fast
   scene transitions**. One sentence per scene, frequent cuts. The opening 1-2
   scenes get a real video clip (stop-scroll hook); the rest are stills with
   Ken-Burns motion (the cheap "front as video" pattern).

Economics to keep in mind: ~$5 per 1000 images ≈ **~2,000 KRW per video**. The
pipeline is **resumable and cached** — reruns skip any asset that already exists,
so smoke-testing and fixing scenes is nearly free.

---

## The pipeline (who does what)

```
 topic            ┌─ topic-miner ──────────┐  scrape top-view videos, find the angle
   │              │  (optional first step) │  → a winning TITLE + topic brief
   ▼              └────────────────────────┘
 viral-script-writer  ── Claude/Gemini (NOT ChatGPT) writes the Korean script,
   │                     one sentence per scene, hook-first, retention-shaped
   ▼
 scene-storyboard ──── turns the script into factory/projects/<id>/project.json
   │                   (ASCII-FIRST: show the storyboard as text, CONFIRM, then save)
   ▼
 minimax-media ─────── node factory/build.mjs <id>   (this skill drives it)
   │   build.mjs         per-scene TTS (KEY1) + image (KEY2/3/4 ×3) + opening clips
   │                     → public/factory/<id>/{audio,img,clip}/ + build.json manifest
   ▼
 remotion-assembler ── node factory/render.mjs <id>  → out/<id>.mp4
   │   render.mjs        headless Remotion render of the FactoryVideo composition
   ▼
 thumbnail-designer ── make the thumbnail (thumbnails matter a LOT for CTR)
```

Each box above is its own skill — invoke them by name when you reach that stage.
This skill (`youtube-factory`) is the conductor: it decides the order, runs the
exact shell commands, and enforces the QA loop below. Someone reading **only this
file** can drive the whole factory.

---

## End-to-end run loop (do this in order)

### 0. Settle the topic and title (topic-miner)
If the user gave a bare idea, use **topic-miner** to scrape high-view comps and
lock a clickable Korean title + angle. If they already gave a clear topic+title,
skip straight to scripting. High-CPM niches to favor: **경제·시사**, **무협
애니메이션 (시니어 타깃)**, **AI·개발 교육** (this channel's lane).

### 1. Script + storyboard → project.json (ASCII-FIRST — the gate)
Use **viral-script-writer** to draft the Korean script (Claude/Gemini, never
ChatGPT), then **scene-storyboard** to shape it into `project.json`.

Rule of thumb for retention:
- **ONE Korean sentence per scene** = one TTS clip = one cut.
- **~15-26 scenes** for a 60-90s short-form explainer; far more for long-form.
- The **first 1-2 scenes get a `video` block** (Hailuo I2V hook); the rest stay
  stills with `motion`.

**Before generating anything, render the storyboard as text and get a yes.**
Example confirmation artifact (this is the gate — do not skip it):

```
[demo-git]  "깃 명령어 외우던 시대는 끝났다"   1920×1080 @30fps · ko · voice=shainvoice01
 s01 🎬HOOK  "아직도 외우세요?"     stressed dev, red git errors        kenburns-in  +clip[Push in]
 s02         "검색 수십 번"          dozens of stackoverflow tabs        pan-left
 s03         "외우지 않는다"         confident relaxed dev               kenburns-out
 ...
 s18 ⭐CTA   "지금 따라하기"         forward arrow / rising path of light  kenburns-out
```

Only when the user confirms the text layout do you write the file to
`factory/projects/<id>/project.json` and move on. See
**references/project-schema.md** for every field and a copy-paste template.

### 2. Smoke test (cheap) — prove the plumbing before spending balance
```bash
node factory/build.mjs <id> --limit 3 --no-video   # first 3 scenes, no Hailuo clips
node factory/still.mjs  <id> 30                     # render ONE PNG frame for visual QA
```
`--limit 3` builds only the first 3 scenes; `--no-video` skips the slow/expensive
Hailuo clips. Then `still.mjs <id> 30` renders frame 30 to
`factory/_verify/still_30.png` — **eyeball it**: Korean font OK? caption legible?
image on-brand? aspect right? If something's off, fix `project.json` and re-run
(cached scenes are skipped, so this costs almost nothing).

### 3. Full build (resumable) → render → review → fix → repeat
```bash
node factory/build.mjs <id>          # full build — generates only the MISSING assets
node factory/render.mjs <id>         # → out/<id>.mp4   (defaults to out/<id>.mp4)
```
`build.mjs` is **idempotent**: it skips any `audio/img/clip` file that already
exists, so the full run only pays for what the smoke test didn't already make,
and any later rerun after a fix is cheap. Watch the console — it prints
`cached` vs `✓` per scene and a final frame/second count.

Review `out/<id>.mp4`. To fix one scene: edit its entry in `project.json`,
**delete just that scene's stale asset(s)** so they regenerate, e.g.
```bash
rm public/factory/<id>/img/s07.jpg public/factory/<id>/audio/s07.{mp3,json}
node factory/build.mjs <id>          # only s07 is regenerated; everything else cached
node factory/render.mjs <id>
```
(If you change narration you must delete BOTH `audio/sNN.mp3` and
`audio/sNN.json` so timing re-syncs; if you only changed the image, delete just
`img/sNN.jpg`.)

### 4. Thumbnail
Use **thumbnail-designer** to produce the thumbnail. Thumbnails drive CTR more
than almost anything else — treat it as a first-class deliverable, not an
afterthought.

---

## Exact commands (single source of truth)

| Stage | Command |
|---|---|
| Smoke build (no clips) | `node factory/build.mjs <id> --limit 3 --no-video` |
| QA still (one frame)   | `node factory/still.mjs <id> <frame> [outPng]` |
| Full build (resumable) | `node factory/build.mjs <id>` |
| Full build, skip clips | `node factory/build.mjs <id> --no-video` |
| Render video           | `node factory/render.mjs <id> [out/<id>.mp4]` |

Notes that match the real engine exactly (do not invent flags):
- `build.mjs` flags are **only** `--limit N` and `--no-video`. No others exist.
- `still.mjs` args are `<projectId> <frame> [out]`; default out is
  `factory/_verify/still_<frame>.png`.
- `render.mjs` args are `<projectId> [outFile]`; default out is `out/<id>.mp4`.
- These call Remotion **headlessly** via `@remotion/bundler` + `@remotion/renderer`
  (entry `src/index.ts`, composition id `FactoryVideo`). No `remotion` CLI needed.
- All run from the repo root (`H:\remotion`). On Windows use the Bash tool for
  these `node` commands, or run them via PowerShell — both work; paths are
  POSIX-style inside the scripts.

---

## Cost-aware, key-aware model (why the steps are split)

`.env` holds `MINIMAX_API_KEY1..4` + `STABILITY_API`. Allocation is deliberate:

- **KEY1 → TTS only.** It holds the user's cloned voice **`shainvoice01`** but has
  **low balance**. `build.mjs` runs voice **sequentially** on KEY1.
- **KEY2/3/4 → image + video** (rich balance). Images run at **concurrency 3**,
  round-robin across these keys with failover; video (Hailuo) runs sequentially.

This is why you never want to bulk-generate before the text plan is locked: a
wasted full run burns the rich keys, and a wrong voice line burns the scarce one.
The smoke-test-then-full discipline exists to protect balance. Full
key/cost/troubleshooting detail lives in **references/cost-and-keys.md**.

---

## What the engine produces (so you can reason about failures)

`build.mjs` writes per project id `<id>`:
```
public/factory/<id>/audio/sNN.mp3   sNN.json   (TTS + timing, from KEY1)
public/factory/<id>/img/sNN.jpg                (image-01, KEY2/3/4)
public/factory/<id>/clip/sNN.mp4               (Hailuo I2V, only scenes with a `video` block)
public/factory/<id>/build.json                 (the MANIFEST Remotion reads)
```
`render.mjs` reads `build.json` via `calculateFactoryMetadata` (which `fetch`es
`staticFile(factory/<id>/build.json)` and sets width/height/fps/durationInFrames),
then renders each scene as a `Sequence`: the clip if present else the Ken-Burns
still, a big hook **caption**, a **narration** subtitle, and the scene **Audio**,
with a quick fade at each cut. Korean renders via `@remotion/google-fonts`
NotoSansKR. Motion presets: `kenburns-in`, `kenburns-out`, `pan-left`,
`pan-right`.

If a render looks empty/black: it almost always means `build.json` (or a
referenced asset) is missing — run `build.mjs` first. See
**references/cost-and-keys.md** for the failure table.

---

## Orchestration checklist (run mentally each time)

- [ ] Topic + clickable Korean title locked (topic-miner if needed).
- [ ] Script written with Claude/Gemini, **one sentence per scene**.
- [ ] Storyboard shown **as text** and **confirmed** before any generation (ASCII-first).
- [ ] `project.json` saved at `factory/projects/<id>/project.json`; first 1-2 scenes have a `video` hook.
- [ ] Smoke: `build.mjs <id> --limit 3 --no-video` → `still.mjs <id> 30` → eyeballed.
- [ ] Full: `build.mjs <id>` (resumable) → `render.mjs <id>` → reviewed.
- [ ] Fixes done by deleting only the stale per-scene asset(s) + rerun (cached, cheap).
- [ ] Thumbnail produced (thumbnail-designer).

The factory rewards **many decent videos shipped fast** over one perfect video.
Keep the human in the QA seat, keep the machine generating, and keep the text
plan locked before you spend.
