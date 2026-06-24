---
name: video-production
description: Produce a finished narrated video end-to-end from a single topic, goal, or script — writes the script, generates voiceover, builds HTML/GSAP motion graphics (and optional talking-head avatar), renders, and self-verifies. Use when the user asks to "make a video", "create a short/Reel/TikTok", "turn this script/blog/topic into a video", or "produce a YouTube short". Stack: Claude Code + HyperFrames + ElevenLabs + FFmpeg.
---

# Video Production (Fable-5 / HyperFrames pipeline)

Turn one prompt into a finished video. Claude is the **brain** (script + timing + animation prompts + orchestration); HyperFrames renders HTML→video; ElevenLabs does the voice; FFmpeg stitches. The lesson from the source video: **the system you wrap around the model matters more than the model** — so follow this pipeline faithfully and verify every stage.

## Goal
Given a topic/script + format (9:16 short, 16:9 long-form), output a single `final.mp4` that is on-brand, correctly timed, and visually verified — with no manual editing.

## Prerequisites (run `npx hyperframes doctor` first)
- Node 20+, FFmpeg on PATH, latest Chrome (headless render engine), ~5 GB free disk.
- `.env` in project root: `ELEVENLABS_API_KEY=...`, and `ELEVENLABS_VOICE_ID=...` (a cloned or stock voice).
- HyperFrames installed: `npx hyperframes init` scaffolds a project.

## Project layout (create this)
```
video-projects/<project>/
├── index.html          # root composition entry
├── compositions/       # sub-scenes (loaded via data-composition-src)
├── assets/             # audio (audio_N.mp3), images, transcripts, reference imgs
├── meta.json           # id, dimensions (1080x1920 short / 1920x1080 long), fps (30)
├── hyperframes.json    # CLI config
├── STORYBOARD.md       # written plan — fill BEFORE building (see reference/storyboard-template.md)
├── renders/            # scratch (gitignore)
└── final.mp4           # target output
```
Brand tokens live in `assets/brand-tokens.css` (CSS custom properties, e.g. `--bg`, `--accent`). Swap these once per brand.

## Pipeline (do in order, verify each step)

### 1. Plan → STORYBOARD.md
Decide format, length, tone, and segment count. Copy `reference/storyboard-template.md`. Keep narration **per-segment under 60 seconds** to prevent voice drift.

### 2. Script as structured JSON
Write the script to `assets/script.json` matching `reference/script-schema.json`. Each segment has: `id`, `narration_text`, `duration_seconds`, `visual_description`, `visual_style`.
- **Reuse one identical `visual_style` string across all segments** for visual cohesion.
- If cloning the user's voice/style, load `reference/voice-playbook.md` and write in that voice.

### 3. Voiceover (ElevenLabs, one file per segment)
Loop segments → POST each `narration_text` to `/v1/text-to-speech/{VOICE_ID}` → save `assets/audio_1.mp3`, `audio_2.mp3`, … Use stable settings (stability/similarity). **Never** send the whole script in one call — chunk by segment (the sub-60s rule).

### 4. Visuals — motion graphics (HTML + GSAP)
Build each scene as a composition: a plain HTML file with a **paused GSAP timeline registered on `window.__timelines`** (HyperFrames seeks each frame and screenshots it). Rules:
- Include GSAP CDN in every sub-composition.
- Use `data-composition-src` to load sub-scenes; `data-track-index`, `data-start`, `data-duration` for timing. Two clips sharing a `data-track-index` with overlapping times = lint error.
- Never animate dimensions directly on `<video>` — wrap it in a `<div>`.
- (Optional talking-head) render an avatar clip via HeyGen Avatar 5 from the segment audio, drop the mp4 into `assets/`, reference it as a clip.

### 5. Lint → Preview → Draft render
```
npx hyperframes lint                       # must be ZERO errors
npx hyperframes preview                     # localhost:3002, hot-reload to eyeball
npx hyperframes render --quality draft      # fast, CRF 28, ~1-3 min
```

### 6. Frame verification (the step that makes it good)
Extract key frames from the draft with FFmpeg and **actually look at them** (or hand to a subagent that scores them against the storyboard). Check: text legible, no overlap/cutoff, on-brand colors, audio length ≈ visual length. List issues, then regenerate **only the affected segments** — never rerun the whole pipeline.

### 7. Sync + stitch (FFmpeg, two stages)
- **Merge:** pair each `visual_N.mp4` with `audio_N.mp3` using `-shortest`.
- **Concat:** build a concat-list file → FFmpeg concat demuxer → produce final.
Then `npx hyperframes render --quality standard` for the final encode → `final.mp4`.

### 8. Deliver
Report duration, segment count, and a 1-line note per scene. Offer: re-voice a segment, change pacing, or export 9:16 + 16:9 variants.

## Hard rules
- Verify before final render — render draft, inspect frames, fix, then go standard.
- One `visual_style` string everywhere; lock any reference image exactly ("same color, same text, don't change anything").
- Regenerate only changed segments on iteration (cheap + fast).
- Keep each narration segment < 60s.
- Cost/time guide: ~5–12 min and under ~$1 per 60s short (10–15 segments); a full Fable-5-style long-form run was ~380k tokens.

## Reference files (load on demand)
- `reference/script-schema.json` — the segment JSON shape.
- `reference/storyboard-template.md` — plan template to fill first.
- `reference/voice-playbook.md` — how to capture + write in a specific creator voice.

## Related
Source: Nate Herk — "Claude Fable 5 Made This Entire Video By Itself" + `nateherkai/hyperframes-student-kit`. For batch ad/creative generation see the `creative-slate` skill; for slide decks see `pitch-deck`.
