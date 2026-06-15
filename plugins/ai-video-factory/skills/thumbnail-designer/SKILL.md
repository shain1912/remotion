---
name: thumbnail-designer
description: >-
  Design high-CTR YouTube thumbnails for the AI video factory. Generate a dramatic
  no-text background with MiniMax image-01, then overlay 2-4 huge bold Korean words
  (face/emotion + big number + curiosity gap + color pop) as a Remotion still.
  USE THIS whenever the user mentions 썸네일, thumbnail, 썸네일 디자인, 썸네일 만들어, CTR,
  클릭률, 후킹 이미지, 표지, cover image, click-through rate, or asks why a video is
  not getting clicks / impressions but no views. VIDEO 2 stressed the thumbnail is
  where the MOST effort goes — invoke this even when the user only says "표지/대문
  이미지 만들어줘" without naming it. Produces a 1280x720 (or 720x1280 for shorts)
  PNG ready to upload.
---

# Thumbnail Designer (썸네일 = 조회수의 90%)

The thumbnail and title decide whether a perfectly produced video ever gets watched.
VIDEO 2's operator put the **single largest** share of human effort here, not in the
script. CTR is a multiplier on every other number: a 2% CTR video and a 10% CTR video
with identical content differ 5x in reach because the algorithm promotes what gets
clicked. So this skill is worth being slow and opinionated about.

The engine cannot bake text into images (MiniMax `image-01` is told "no text" on every
prompt and has no reliable Korean typography anyway). So the winning pattern is two
layers, exactly like the factory videos:

1. **Background** — one dramatic, emotional, no-text image from MiniMax `image-01`.
2. **Overlay** — 2-4 enormous bold Korean words rendered crisply by Remotion (`NotoSansKR`
   weight 900), with the same stroke/shadow/accent treatment the `FactoryVideo` captions
   already use. This is the only way to get sharp, legible Korean text.

This mirrors VIDEO 1's discipline: **agree on the layout as text/ASCII first, then
generate.** Never generate a background before the copy and composition are locked — a
gorgeous image with weak words is a wasted click.

---

## Step 0 — Lock the concept in text FIRST (검수 before 생성)

Before spending a single API call, write the thumbnail as a plan and confirm it. This is
the "만들기 전에 글자로 먼저 맞춘다" rule. Produce an ASCII mock so the human QAs intent,
not pixels:

```
┌─────────────────────────────────────────────┐
│                                             │
│   [background: shocked developer face,      │
│    red error glow, dark room — left 60%]    │
│                                             │
│   ███ 외우지 마 ███      ← line 1 (white)    │
│   ███   90% ███         ← big number (amber) │
│            줄였다  ← line 3 (accent underline)│
│                                             │
└─────────────────────────────────────────────┘
copy: "외우지 마 / 90% / 줄였다"   emotion: shock+relief
```

Confirm with the user (or self-confirm against the title) BEFORE generating. Then proceed.

---

## The five CTR levers (apply at least 3)

A strong Korean thumbnail almost always stacks several of these. Weak ones rely on only one.

1. **Face + raw emotion.** A human face mid-expression (shock 놀람, fear 공포, smug 자신감,
   despair 절망) outperforms objects. Put it large, eyes toward the viewer or the text.
   Generate it via the image prompt — describe the exact expression.
2. **Big number / extreme claim.** `90%`, `1억`, `0원`, `3분`, `300장`. Numbers read instantly
   and promise concrete payoff. Make the number the largest element after the face.
3. **Curiosity gap.** Say enough to provoke, not enough to satisfy. `이걸 몰랐다고?`,
   `진짜 이유`, `아무도 안 알려줌`. The viewer clicks to close the gap.
4. **Color pop / contrast.** Background dark and desaturated; text white + ONE saturated
   accent (the project's `style.accent`, e.g. `#22d3a6`, or a hot red/amber for danger).
   High luminance contrast is what survives the tiny mobile feed.
5. **Negative / forbidden framing.** Loss aversion beats gain. `하지 마`, `끝났다`, `망한다`,
   `삭제하세요` pull harder than neutral phrasing.

---

## Korean copy: strong vs weak (this is the whole game)

Keep it to **2-4 words / ≤10 Korean characters per line, ≤3 lines.** If you can't read it
on a phone in 0.5s, it's too long. Concrete, emotional, incomplete.

| Weak (왜 약한가) | Strong (왜 강한가) |
| --- | --- |
| `깃 명령어 정리` (정보, 무감정) | `깃, 외우지 마` (명령형 + 금지 프레이밍) |
| `바이브 코딩 소개` (설명적) | `이게 코딩이라고?` (호기심 갭) |
| `생산성을 높이는 방법` (추상적) | `3분이면 끝` (구체 숫자 + 시간) |
| `유튜브 자동화 후기` (밋밋) | `월 6억 찍은 방법` (큰 숫자 + 욕망) |
| `AI 이미지 생성 튜토리얼` (길고 평이) | `300장 = 2천원` (충격 대비) |
| `깃 충돌 해결하는 법` (교과서) | `충돌? 걱정 끝` (불안→해소) |
| `개발자에게 좋은 도구` (모호) | `이거 모르면 손해` (손실 회피) |

Rules baked into the above:
- Cut particles/connectors. `생산성을 높이는 방법` → `3분이면 끝`.
- Prefer **명령형/금지형** (`-하지 마`, `-하세요`, `끝났다`) over 설명형 (`-하는 법`).
- One number, made huge, beats three adjectives.
- A question mark that creates doubt (`이게 맞아?`) is a click magnet.
- Never duplicate the title verbatim — the thumbnail should *add* tension the title doesn't.

---

## How to produce it (the real pipeline)

The repo already renders Remotion stills headlessly in `factory/still.mjs` (`@remotion/bundler`
+ `renderStill` from `@remotion/renderer`). The thumbnail uses the **same** mechanism but a
dedicated composition so we can pass copy + background as props. Two new files are required
(they do not exist yet — create them); everything they depend on is already verified working.

### 1) Generate the background (MiniMax image-01, NO text)

Reuse the exact client already in `factory/lib/minimax.mjs`. Write the JPEG into the
project's public folder so Remotion can `staticFile()` it. The script below is the
canonical helper — create it at `factory/thumb-bg.mjs`:

```js
// node factory/thumb-bg.mjs <projectId> "<image prompt>" [16:9|9:16]
import fs from 'node:fs';
import path from 'node:path';
import { generateImage } from './lib/minimax.mjs';

const [projectId, prompt, aspect = '16:9'] = process.argv.slice(2);
if (!projectId || !prompt) {
  console.error('usage: node factory/thumb-bg.mjs <projectId> "<prompt>" [16:9|9:16]');
  process.exit(1);
}
// match the project's house style so the thumb feels on-brand with the video
const proj = JSON.parse(fs.readFileSync(`factory/projects/${projectId}/project.json`, 'utf8'));
const dir = path.join('public', 'factory', projectId, 'thumb');
fs.mkdirSync(dir, { recursive: true });

const full = `${prompt}, ${proj.style.imageSuffix}`; // imageSuffix already ends with "no text"
const buf = await generateImage({ prompt: full, aspectRatio: aspect });
const out = path.join(dir, 'bg.jpg');
fs.writeFileSync(out, buf);
console.log('thumb bg ->', out, `${(buf.length / 1024 | 0)}KB`);
```

Background prompt guidance (the model is good at this — give it drama, not text):
- Name the **emotion and face** explicitly: `extreme shock, wide eyes, mouth open`,
  `smug confident smirk`, `despair, head in hands`.
- Demand cinematic contrast and a **dark/empty side** where the words will sit:
  `subject pushed to the right third, dark empty negative space on the left for text`.
- Always end relying on `style.imageSuffix` which already appends `..., no text, ...`.
  Add `no text, no letters, no watermark, no logo` if you want belt-and-suspenders.
- For a face you keep across thumbnails, pass a `subjectReference` URL/dataURL to
  `generateImage` (the client supports it) for character consistency.

### 2) Overlay the Korean words (Remotion still)

Create the composition `src/factory/Thumbnail.tsx` and register it in `src/Root.tsx`
alongside `FactoryVideo`. It is a single still frame (`durationInFrames={1}`) driven by
props so one component renders every thumbnail. Reuse `FactoryVideo`'s proven text
treatment: `NotoSansKR` 900, big `textShadow`, `WebkitTextStroke`, accent underline bar.

```tsx
// src/factory/Thumbnail.tsx
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { loadFont } from '@remotion/google-fonts/NotoSansKR';

const { fontFamily } = loadFont('normal', { weights: ['700', '900'], ignoreTooManyRequestsWarning: true });

export type ThumbLine = { text: string; color?: string; size?: number };
export type ThumbProps = {
  bg: string;                 // e.g. "factory/<id>/thumb/bg.jpg"
  lines: ThumbLine[];         // 2-4 lines
  accent?: string;            // underline + glow, e.g. "#22d3a6"
  align?: 'left' | 'center' | 'right';
  side?: 'left' | 'right' | 'center'; // which side the text block hugs
};

export const Thumbnail: React.FC<ThumbProps> = ({
  bg, lines, accent = '#22d3a6', align = 'left', side = 'left',
}) => (
  <AbsoluteFill style={{ backgroundColor: '#000' }}>
    <Img src={staticFile(bg)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    {/* darkening scrim on the text side so words always win */}
    <AbsoluteFill style={{
      background: side === 'right'
        ? 'linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 55%)'
        : 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 55%)',
    }} />
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: side === 'right' ? 'flex-end' : side === 'center' ? 'center' : 'flex-start',
      padding: '0 90px',
    }}>
      <div style={{ textAlign: align, fontFamily, lineHeight: 1.04 }}>
        {lines.map((ln, i) => (
          <div key={i} style={{
            fontWeight: 900,
            fontSize: ln.size ?? 168,
            color: ln.color ?? '#ffffff',
            textShadow: '0 8px 36px rgba(0,0,0,0.95)',
            WebkitTextStroke: '4px rgba(0,0,0,0.55)',
            letterSpacing: '-0.01em',
          }}>
            {ln.text}
          </div>
        ))}
        <div style={{
          marginTop: 18, height: 14, width: 220, background: accent,
          borderRadius: 10, boxShadow: `0 0 30px ${accent}`,
          marginLeft: align === 'center' ? 'auto' : 0,
          marginRight: align === 'center' ? 'auto' : align === 'right' ? 0 : 'auto',
        }} />
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
```

Register it (add to the `<>` in `src/Root.tsx`, next to the existing compositions):

```tsx
<Composition
  id="Thumbnail"
  component={Thumbnail}
  durationInFrames={1}
  fps={1}
  width={1280}
  height={720}          // shorts: 720 x 1280
  defaultProps={{
    bg: 'factory/demo-git/thumb/bg.jpg',
    lines: [
      { text: '깃, 외우지 마', color: '#ffffff' },
      { text: '90% 줄였다', color: '#ffd23f', size: 200 },
    ],
    accent: '#22d3a6',
    side: 'left',
  }}
/>
```

### 3) Render the still

Use the same headless `renderStill` path as `factory/still.mjs`, but target the
`Thumbnail` composition. Create `factory/thumb.mjs`:

```js
// node factory/thumb.mjs <projectId> ['[{"text":"깃, 외우지 마"},{"text":"90% 줄였다","color":"#ffd23f","size":200}]'] [out.png]
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { selectComposition, renderStill } from '@remotion/renderer';

const projectId = process.argv[2] || 'demo-git';
const lines = JSON.parse(process.argv[3] || '[{"text":"제목을","color":"#ffffff"},{"text":"넣으세요","color":"#ffd23f","size":200}]');
const out = path.resolve(process.argv[4] || `out/thumb-${projectId}.png`);

const inputProps = { bg: `factory/${projectId}/thumb/bg.jpg`, lines, accent: '#22d3a6', side: 'left' };
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public') });
const composition = await selectComposition({ serveUrl, id: 'Thumbnail', inputProps });
await renderStill({ composition, serveUrl, output: out, frame: 0, inputProps });
console.log('thumbnail ->', out, `${composition.width}x${composition.height}`);
```

Note: `renderStill` writes PNG by default (use a `.png` outfile). YouTube accepts PNG/JPG up
to 2MB; 1280x720 is the standard upload size.

---

## End-to-end run loop (cheap, resumable, QA-first)

```bash
# 1) Lock copy + ASCII mock with the user (Step 0). No API calls yet.

# 2) Generate ONE dramatic no-text background (image-01, KEY2/3/4):
node factory/thumb-bg.mjs demo-git \
  "extreme close-up of a shocked developer, wide eyes, mouth open, red error glow on face, dark room, subject on the right third, dark empty space on the left for text"

# 3) Render the overlay still and eyeball it:
node factory/thumb.mjs demo-git '[{"text":"깃, 외우지 마"},{"text":"90% 줄였다","color":"#ffd23f","size":200}]'
#  -> out/thumb-demo-git.png  → open, judge at phone size (shrink to ~320px wide)

# 4) Iterate: tweak copy/colors/side and re-run step 3 (free — no API).
#    Only regenerate the background (step 2, costs ~$0.005) if the IMAGE is wrong.
```

The expensive part (the background) is generated once and cached on disk; the text layer is
free to re-render endlessly. That asymmetry is the point — **iterate on words for free,
spend money only on the image.** While a background generates, draft the next thumbnail's
copy (VIDEO 1's "다음 거 시작" parallelism).

---

## QA checklist before you ship a thumbnail

- Squint / shrink to ~320px wide. Are the words still readable? If not, fewer/bigger words.
- Is there **one** clear focal point (the face) and **one** accent color? Two accents = noise.
- Does the copy create a question the title doesn't already answer? (curiosity gap)
- Number present and huge? Emotion on the face unmistakable?
- No text baked into the *image* layer (only the Remotion overlay should have letters)?
- Does it match the video's `style.accent`/`bg` so the brand stays consistent?

For deeper background-prompt recipes per emotion and niche (경제·시사, 무협, AI·개발), and a
larger swipe file of strong Korean copy patterns, see
`references/copy-and-prompts.md`.
