# Thumbnail deep reference — Korean copy swipe file + background prompt recipes

Use this when SKILL.md's quick rules aren't enough: niche-specific emotion, a bigger
swipe file of strong copy, color systems, and shorts (9:16) layout notes.

---

## 1) Korean copy swipe file (by lever)

Keep ≤10 chars/line, ≤3 lines. Pick a pattern, fill the slot, make ONE element huge.

### Big number / extreme claim
- `월 6억` · `연 73억` · `0원으로` · `3분이면 끝` · `300장 = 2천원` · `90% 단축` · `하루 10편`
- Pattern: `<숫자><단위>` alone is enough if the face carries the emotion.

### Curiosity gap (호기심 갭)
- `이걸 몰랐다고?` · `진짜 이유` · `아무도 안 알려줌` · `이게 코딩이라고?` · `결말은 충격`
- `99%가 모름` · `숨겨진 진실` · `이래서 망했다`

### Negative / forbidden (손실 회피 — 가장 강함)
- `외우지 마` · `절대 하지 마` · `당장 삭제` · `이러면 망함` · `끝났다` · `이거 모르면 손해`
- `속지 마세요` · `위험합니다`

### Authority / result (권위·결과)
- `현직자가 폭로` · `3년치 노하우` · `직접 해봤다` · `실화임` · `검증 완료`

### Emotional one-word punch (얼굴이 감정을 받쳐줄 때)
- `충격` · `소름` · `실화?` · `대박` · `미쳤다` · `레전드` · `끝판왕`

### Question that plants doubt
- `이게 맞아?` · `너만 모름?` · `진짜 가능?` · `왜 안 알려줄까?`

---

## 2) Strong vs weak — extended table

| Weak | Strong | Lever applied |
| --- | --- | --- |
| `깃 명령어 모음` | `깃, 외우지 마` | 금지 프레이밍 |
| `AI로 영상 만드는 법` | `영상 1편 2천원` | 충격 숫자 |
| `유튜브 자동화` | `자면서 월 6억` | 욕망 + 숫자 |
| `이미지 200장 생성` | `200장 = 5천원` | 대비 숫자 |
| `생산성 향상 팁` | `이거 모르면 손해` | 손실 회피 |
| `프롬프트 작성법` | `프롬프트 한 줄로 끝` | 구체 + 간결 |
| `머지 충돌 해결` | `충돌? 걱정 끝` | 불안→해소 |
| `클로드 사용법` | `ChatGPT는 이제 그만` | 비교/도발 |
| `경제 전망 분석` | `이 신호 나오면 폭락` | 경고 + 호기심 |
| `무협 애니 추천` | `결말이 소름` | 감정 한 방 |

---

## 3) Background prompt recipes (MiniMax image-01, always no-text)

All prompts get `, ${project.style.imageSuffix}` appended by `thumb-bg.mjs` (the suffix
already ends with `... no text ...`). Structure: SUBJECT + EXPRESSION + COMPOSITION +
NEGATIVE-SPACE-FOR-TEXT + drama.

### Emotion presets (the face is the product)
- **Shock (놀람):** `extreme close-up, wide shocked eyes, mouth open, hands on cheeks`
- **Despair (절망):** `head in hands, defeated posture, dim cold light, slumped shoulders`
- **Smug confidence (자신감):** `relaxed smug smirk, arms crossed, leaning back, warm rim light`
- **Fear/warning (공포):** `tense face lit by red emergency glow, dark shadows, dramatic`
- **Triumph (환희):** `arms raised, triumphant grin, bright energetic light, confetti of light`

### Composition (always leave room for the words)
- `subject pushed to the right third, large dark empty negative space on the left for text`
- `low angle hero shot, dramatic up-lighting` (makes a subject feel powerful)
- `single strong focal point, heavy bokeh background, shallow depth of field`
- For a giant object instead of a face: `a single glowing <object> centered, dark void around it`

### Niche skins (high-CPM)
- **경제·시사:** `falling red stock chart, anxious investor face, blue-red dramatic lighting,
  newspaper/screen glow` — pair with warning copy (`폭락 신호`, `지금 팔아야`).
- **무협 애니메이션:** `cinematic wuxia warrior, flowing robes, dramatic ink-wash sky,
  glowing sword, painterly anime style` — pair with `결말 충격`, `소름`. (Override imageSuffix
  if the project's default suffix is too "developer-workspace" for this niche.)
- **AI·개발:** the default `demo-git` suffix fits — `developer at terminal, teal/amber rim
  light, holographic code` — pair with `외우지 마`, `2천원`, `자동화`.

### Negative-space trick for text legibility
If the model keeps filling the whole frame, add: `dramatic vignette, dark gradient on the
<left|bottom>, empty shadowed area for graphics`. The Remotion scrim then guarantees contrast.

---

## 4) Color system

- **Background:** dark, desaturated. The image should NOT compete with the text.
- **Primary text:** pure white `#ffffff` (max luminance contrast on dark).
- **ONE accent** for the number / key word + the underline bar. Choose by emotion:
  - Brand / positive: project `style.accent` (e.g. `#22d3a6` teal).
  - Money / value: amber-gold `#ffd23f`.
  - Danger / warning / loss: hot red `#ff3b30`.
- Never use two accents — it reads as clutter at feed size. White + one pop only.
- The Remotion overlay's `WebkitTextStroke` (dark) + `textShadow` keep text readable even
  over a busy patch, but the gradient scrim is the real safety net.

---

## 5) Shorts (9:16) thumbnails

- Generate the background with aspect `9:16`: `node factory/thumb-bg.mjs <id> "<prompt>" 9:16`.
- Render the still at `width={720} height={1280}` (set this on the `Thumbnail` composition,
  or add a second registration `id="ThumbnailVertical"`).
- Vertical safe zone: keep words in the **middle 60%** — the app overlays the title, channel
  avatar, and action buttons over the top and bottom edges of a Short.
- Even bigger text: a Short thumbnail is seen tiny in the feed. 2 lines max is safest.

---

## 6) Cross-skill handoffs

- Image generation goes through the **minimax-media** skill's `generateImage` (the
  `thumb-bg.mjs` helper here just wraps it). Don't write a raw `fetch` to MiniMax.
- Match the thumbnail's `accent`/`bg`/`imageSuffix` to the project produced by
  **scene-storyboard** (`factory/projects/<id>/project.json` → `style`) so the brand is
  consistent with the video the **youtube-factory** orchestrator rendered.
- This skill is the LAST step the **youtube-factory** spine calls, after the `.mp4` exists.
  A finished video with no thumbnail is unpublishable — always close the loop here.
