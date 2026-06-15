---
name: slide-explainer
description: >-
  Make a clean, narrated KEYNOTE-STYLE slide video in the Claude design aesthetic (warm paper
  background, coral accent, serif headings, staggered bullets) — the `slides` template of the
  factory, rendered by src/factory/SlideVideo.tsx. NO image generation: visuals are code-drawn,
  so it's fast and nearly free (only TTS). USE THIS whenever the user wants a slide/keynote/
  presentation-style explainer video, or says 슬라이드 영상, 슬라이드형, 키노트, 발표형 영상,
  클로드 감성 슬라이드, 정리 영상, 개념 정리 영상, ppt 영상, presentation video, slide deck video,
  explainer slides, "make slides that talk". Reach for it for concept/listicle/교육 content where
  clean typography beats AI imagery. For AI-image fast-cut videos use montage (youtube-factory);
  for math/CS graph animation use theory-viz.
---

# slide-explainer (`slides` template)

A narrated, animated **slide-deck** video in the **Claude design language**. Each slide = one
heading + optional bullets/stat/note, narrated in the user's voice (`shainvoice01`), with the
slide's on-screen duration derived from its TTS length. Rendered by `src/factory/SlideVideo.tsx`.

**When to choose this over montage:** the content is *conceptual* — a definition, a list of
principles, a how-it-works, a comparison. Clean typography and whitespace communicate better
than AI photos, and it costs almost nothing (no image/video generation, just narration).

> Pipeline position: same as montage. `viral-script-writer` can still write the narration;
> here YOU also write the slide structure (title/bullets) into `project.json`. Then build +
> render with the shared commands (see **remotion-assembler**). No `scene-storyboard` /
> `minimax-media` image step — slides are code-drawn.

---

## Authoring `factory/projects/<id>/project.json`

Set `"template": "slides"`. Scenes carry slide content, not image prompts.

```jsonc
{
  "id": "demo-slides",
  "title": "바이브 코딩, 제대로 이해하기",
  "template": "slides",
  "lang": "ko",
  "format": { "width": 1920, "height": 1080, "fps": 30 },
  "voice": { "voiceId": "shainvoice01", "model": "speech-2.6-hd", "speed": 1.0 },
  "style": { "accent": "#CC785C" },          // Claude coral; change per brand
  "scenes": [
    { "id": "s01", "kicker": "Vibe Coding 101", "title": "바이브 코딩,\n제대로 이해하기",
      "note": "5분이면 충분합니다.",
      "narration": "<one or two spoken Korean sentences for this slide>" },

    { "id": "s02", "kicker": "정의", "title": "바이브 코딩이란?",
      "bullets": ["AI에게 '의도'를 말하면 코드를 생성·수정",
                  "문법 암기가 아니라 '무엇을 원하는가'에 집중",
                  "개발의 무게중심이 작성에서 검수로 이동"],
      "narration": "..." },

    { "id": "s06", "kicker": "왜 쓰는가", "title": "속도가 달라진다",
      "stat": { "value": "10x", "label": "빠른 프로토타이핑" },
      "narration": "..." }
  ]
}
```

### Scene fields (all optional except `id`, `title`, `narration`)

| field | renders as |
|---|---|
| `kicker` | small uppercase accent label above the title (section tag) |
| `title` | big serif heading (NotoSerifKR). `\n` allowed for line breaks |
| `bullets` | `string[]` — each springs in **one at a time**, paced across the slide |
| `stat` | `{ value, label }` — huge coral number + caption (for a punch slide) |
| `note` | a muted single line under the title (a quote/example/aside) |
| `narration` | spoken (TTS) AND drives the slide's duration. **Not** shown as a subtitle |

`style.accent` recolors the kicker, bullet squares, accent rule, stat, and slide number.

---

## How SlideVideo renders (so you can author for it)

`src/factory/SlideVideo.tsx`: paper background `#F0EEE6`, ink `#26241F`, serif headings +
NotoSansKR body. Per slide: a spring entrance + a short tail fade (so slides cross-fade), a
left accent rule that wipes down, a faint corner circle, and a footer (`VIBE CODING` + `NN / NN`
page number). **Bullets stagger**: bullet *i* springs in at frame `20 + i*cadence`, where
`cadence` auto-fits the slide length — so write 2-4 bullets and let the narration cover them in
order. A slide with a `stat` shows a giant number instead of (or above) bullets.

Authoring implications:
- **Match bullets to narration order** — they appear top-to-bottom as you speak, so narrate
  them in the same sequence for a "reveal as I explain" feel.
- **Keep bullets short** (one line each, ≤ ~22 Korean chars) — they're 50px.
- One idea per slide. If a slide needs 6 bullets, split into two slides.
- `title` is the anchor; `note` is for an example/quote, not a second paragraph.

---

## Build & render (shared commands — template auto-detected)

```bash
node factory/build.mjs <id>          # TTS only for slides (no image gen) — fast, resumable
node factory/still.mjs <id> <frame>  # QA one frame; bundles SlideVideo automatically
node factory/render.mjs <id>         # -> out/<id>.mp4
```

`render.mjs`/`still.mjs` read `project.template` and select `SlideVideo` automatically — you
don't pass the composition id. Everything else (resumable cache, timing math `(durationMs/1000
+ 0.35)*fps`, QA loop) is exactly as in **remotion-assembler**.

---

## Tuning

- **Slide feels rushed** → the narration is short; either add a sentence or it's fine (the
  tail pad covers it). Slide length = its narration length.
- **Want a different vibe than Claude-cream** → change `style.accent`, or edit the palette
  constants (`PAPER/INK/MUTE/CORAL`) at the top of `SlideVideo.tsx`.
- **Need a chart/diagram on a slide** → that's the `theory` template's job (see
  **theory-viz**); keep `slides` for type-driven content.
- **Reorder/insert slides** → reorder the `scenes` array; page numbers auto-update.
