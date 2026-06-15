---
name: theory-viz
description: >-
  Make a 3Blue1Brown-style THEORY VISUALIZATION video for CS / math lectures — a dark
  coordinate plane where curves, axes, and labels draw themselves on, narrated in the user's
  voice. The `theory` template of the factory, rendered by src/factory/TheoryVideo.tsx. NO image
  generation (graphs are code-drawn → fast, nearly free). USE THIS whenever the user wants to
  visualize a concept/algorithm/equation, or says 이론 시각화, 개념 시각화, 알고리즘 시각화,
  3blue1brown, 3b1b, 쓰리블루원브라운, 수식 애니메이션, 그래프 애니메이션, CS 강의 영상,
  컴퓨터 사이언스 강의, 시간 복잡도/Big-O 시각화, visualize this concept, animate this graph/curve,
  math/CS lecture animation, manim-style. Reach for it for any "explain a theory with a moving
  diagram" request. For talking-point slides use slide-explainer; for AI-image videos use montage.
---

# theory-viz (`theory` template)

A **3Blue1Brown-style** explainer: a dark stage with a coordinate plane that builds up element
by element — axes draw on, then curves are *penned in* one at a time with colored end-labels,
narrated in the user's voice. Rendered by `src/factory/TheoryVideo.tsx`. The demo `demo-theory`
visualizes **Big-O time complexity** (O(1) → O(n²) growth curves).

**Why this style:** for theory, the *animation IS the explanation*. A curve drawing itself while
you narrate "이건 매번 절반씩 줄여요" lands far harder than a static graph or an AI photo. It's
code-drawn, so it's exact, reproducible, and costs only the narration TTS.

> Unlike montage, the visuals are a **single continuous timeline** (the plane persists; curves
> accumulate), not independent per-scene cuts. Scenes still drive narration timing + reveal order.

---

## The model: a continuous plane, revealed by `phase`

Each scene has a `phase` telling the composition what to add at that point in the timeline:

| `phase` | what it does |
|---|---|
| `title` | opening title card (`title` + `subtitle`); fades out as the axes come in |
| `axes` | draws the x/y axes + grid + axis labels; the plane stays for the rest |
| `curve` | pens in ONE growth curve (`curve` type) with a moving tip + end `label`; stays drawn |
| `compare` | adds a dashed divergence marker + emphasizes O(n²); a "격차 폭발" caption |
| `outro` | takeaway title card over the dimmed plane |

Curves **accumulate**: by the `compare` scene all previously-drawn curves are still on screen,
so the audience sees them diverge together. Reveal order = scene order.

---

## Authoring `factory/projects/<id>/project.json`

Set `"template": "theory"`.

```jsonc
{
  "id": "demo-theory",
  "title": "시간 복잡도, Big-O를 눈으로",
  "template": "theory",
  "lang": "ko",
  "format": { "width": 1920, "height": 1080, "fps": 30 },
  "voice": { "voiceId": "shainvoice01", "model": "speech-2.6-hd", "speed": 1.0 },
  "style": { "accent": "#58C4DD" },
  "scenes": [
    { "id": "s01", "phase": "title", "title": "시간 복잡도", "subtitle": "Big-O를 눈으로",
      "narration": "..." },
    { "id": "s02", "phase": "axes", "narration": "가로축은 입력 크기 n, 세로축은 연산 횟수..." },
    { "id": "s03", "phase": "curve", "curve": "const",  "label": "O(1)",       "sub": "상수 시간", "narration": "..." },
    { "id": "s04", "phase": "curve", "curve": "log",    "label": "O(log n)",   "sub": "이진 탐색", "narration": "..." },
    { "id": "s05", "phase": "curve", "curve": "linear", "label": "O(n)",       "sub": "한 번 훑기", "narration": "..." },
    { "id": "s06", "phase": "curve", "curve": "nlogn",  "label": "O(n log n)", "sub": "좋은 정렬",  "narration": "..." },
    { "id": "s07", "phase": "curve", "curve": "quad",   "label": "O(n²)",      "sub": "중첩 반복",  "narration": "..." },
    { "id": "s08", "phase": "compare", "narration": "n이 커지면 격차가 폭발합니다..." },
    { "id": "s09", "phase": "outro", "title": "복잡도를 안다는 것", "narration": "..." }
  ]
}
```

### Scene fields

| field | used by | meaning |
|---|---|---|
| `phase` | all | `title` \| `axes` \| `curve` \| `compare` \| `outro` |
| `curve` | `curve` | which function: `const` \| `log` \| `linear` \| `nlogn` \| `quad` |
| `label` | `curve` | the formula shown at the curve's tip, e.g. `O(log n)` |
| `sub` | `curve` | bottom-left caption shown while that curve draws (the plain-words meaning) |
| `title`/`subtitle` | `title`/`outro` | big centered card text |
| `narration` | all | spoken (TTS) + drives the scene's duration; reveal animations fit inside it |

### Built-in curves (the `curve` value → `FN` in TheoryVideo.tsx)

`const` (flat), `log`, `linear`, `nlogn`, `quad` — normalized so they fit the plane and
diverge cleanly (O(n²) shoots to the top). Colors are fixed per curve (3b1b palette: grey /
blue / green / yellow / red). A curve's reveal is paced to ~70% of its scene so it finishes
before the narration ends.

---

## Extending it (new concepts beyond Big-O)

This composition is a reusable **"draw curves on a plane"** engine. To teach a different
concept, you usually only touch `project.json`. To add a *new curve shape* (e.g. `exp`,
`sqrt`, a sine wave), add one entry to the `FN` map (and a color in `C`) at the top of
`src/factory/TheoryVideo.tsx`:

```ts
const FN = { /* ...existing... */ exp: (t) => Math.min(1, 0.04 * Math.pow(2, t * 6)) };
const C  = { /* ...existing... */ exp: '#C77DFF' };
```

For a fundamentally different visual (vectors transforming, a number line, a geometric morph,
an array with a moving pointer for binary search), add a new `phase` and render branch — keep
the "persistent stage + draw-on + per-scene narration timing" pattern. The `phase` switch is
the extension point; defer to **remotion-best-practices** for the Remotion/SVG/interpolate
mechanics. Coordinate mapping helpers `X(t)`/`Y(v)` map normalized `[0,1]` → plane pixels.

---

## Build & render (shared commands — template auto-detected)

```bash
node factory/build.mjs <id>          # TTS only (no image gen) — fast, resumable
node factory/still.mjs <id> <frame>  # QA; prints scene frame ranges so you can target a curve
node factory/render.mjs <id>         # -> out/<id>.mp4
```

`render.mjs`/`still.mjs` auto-select `TheoryVideo` from `project.template`. Pick QA frames in
the middle of the `compare` scene to confirm all curves + labels are correct (use
`node -e` on `build.json` to get each scene's start frame).

---

## Tuning

- **Curves overlap / labels collide** → tweak the scalar in each `FN` entry so curves separate
  more, or shorten `label` text. Labels clamp to the right plot edge.
- **A curve draws too fast/slow** → it's paced to the scene's narration length; lengthen/shorten
  the `narration`, or change the `reveal = min(48, durationFrames*0.7)` factor in the `.tsx`.
- **Want different colors / a light theme** → edit `BG/GRID/AXIS/WHITE/C` constants at the top.
- **Need bullets/headings instead of a graph** → wrong template; use **slide-explainer**.
