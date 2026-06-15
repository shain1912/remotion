---
name: viral-script-writer
description: >-
  Write a retention-optimized KOREAN video script segmented into scenes (one
  sentence per scene), producing scenes[].narration + scenes[].caption for a
  factory project.json. USE THIS whenever the user asks to 대본 작성 / 스크립트 작성 /
  대본 써줘 / 후킹 / 훅 / hook / 나레이션 / narration / write a video script / 영상 대본 /
  유튜브 대본 / 쇼츠 대본 — or whenever a new factory video topic appears and there is no
  script yet. It front-loads a stop-scroll hook in the first 3 seconds, applies
  retention tactics (그런데 reversal, concrete numbers, forward momentum, short
  sentences), reframes the mundane into a new concept (the "회복도 트레이닝" move),
  and closes with a CTA. Hand its output to scene-storyboard, which adds the
  per-scene imagePrompt/motion/video to finish project.json.
---

# viral-script-writer

You turn a single topic into a **Korean, retention-optimized, scene-segmented script** that the factory can shoot. Your deliverable is the `scenes[]` array of a `project.json` — specifically each scene's `narration` (the one Korean sentence that becomes TTS) and `caption` (the short on-screen hook words). You also fill the top-level fields (`id`, `title`, `niche`, `voice`, `style`). You do **not** write `imagePrompt`, `motion`, or `video` — that is the `scene-storyboard` skill's job (see Handoff).

## Why this skill exists (the physics of retention)

The factory's entire economic model (VIDEO 2) is: **many images → fast scene transitions → longer watch time → the algorithm pushes it.** "이미지만 두고 말만 하면 팟캐스트" — a slideshow with talking is a podcast and dies. The script is what creates the *cuts*. Because `build.mjs` gives **each scene its own image + its own TTS audio + its own duration**, the rule "one sentence = one scene" is not a style preference — it is the mechanism that produces the fast cutting that retention depends on. Long sentences = long static shots = scroll-away. Short sentences = more cuts = more watch time.

So every decision below serves one number: **average view duration.** You are not writing prose; you are engineering momentum.

## The output contract (match the engine exactly)

Your script lands in `factory/projects/<id>/project.json`. The schema the engine reads:

```json
{
  "id": "<kebab-id>",
  "title": "<Korean title | secondary>",
  "niche": "ai-dev | economy | wuxia | ...",
  "lang": "ko",
  "format": { "width": 1920, "height": 1080, "fps": 30 },
  "voice": { "voiceId": "shainvoice01", "model": "speech-2.6-hd", "speed": 1.05 },
  "style": { "imageSuffix": "<set by scene-storyboard>", "accent": "#22d3a6", "bg": "#0a0e14" },
  "scenes": [
    { "id": "s01", "narration": "<ONE Korean sentence>", "caption": "<2-5 short words>" }
  ]
}
```

Hard constraints that come from the real code — violate these and the render breaks or looks wrong:

- **`narration` = exactly ONE Korean sentence.** `build.mjs` sends the whole `narration` string to `tts()` as one audio clip and sizes the scene to its length. Two sentences = one over-long static shot.
- **`caption` = 2-5 words, no full sentence.** `FactoryVideo.tsx` renders it at `fontSize: 100, fontWeight: 900` centered. Long captions overflow / wrap ugly. It is the *hook word*, not a summary. It may differ from the narration (e.g. narration "git reset, rebase, cherry-pick. 검색만 수십 번 해보셨을 겁니다." → caption "검색 수십 번").
- **`id` = `s01`, `s02`, … zero-padded, sequential.** Files are written as `<id>.mp3` / `<id>.jpg`.
- **Length targets:** short-form explainer (60-90s) = **15-26 scenes**. Long-form = many more. A 1-sentence Korean scene ≈ 3-5s of TTS, so ~18 scenes ≈ 70-80s.
- **`lang` is always `"ko"`. Output language is Korean.** Captions and narration in Korean; only `imagePrompt` (later, storyboard) is English.

You can default `format`, `voice`, `style.accent`, `style.bg` to the values above (they are the verified working defaults — `shainvoice01` is the user's cloned voice on KEY1). Leave `style.imageSuffix` as `""` or omit it; storyboard sets it.

## The run loop you are step 1 of (QA discipline from VIDEO 1)

VIDEO 1's core lesson: **"만들기 전에 글자로 먼저 맞춘다"** — agree on everything at the text level *before* spending a cent on generation. Your script IS that text-level artifact. So:

1. **Show the full script as plain text first** (see Output format) and let the human approve/edit it. Cheap to change a sentence; expensive to regenerate 18 images.
2. Only after approval does it become `project.json`, then `build.mjs --limit 3 --no-video` (smoke), then full build.

Never skip step 1. The human's role is **검수 (QA)**, not making — give them something to QA.

## How to build the script

### 1. Mine the angle (topic → hook-worthy claim)
Don't script the topic; script the *surprising claim inside it*. Ask: what does the viewer currently believe that this topic overturns? The whole video is the payoff of one tension you open in the first 3 seconds.

If the user gives only a bare topic, you may use web search to find what's actually pulling views (VIDEO 2's "topic-mining": scrape top-view videos in the niche), but it's optional — a strong angle beats research.

### 2. Build the hook (scenes s01-s02, the first ~3 seconds)
This is 80% of the result. If they scroll here, nothing else matters. Use one (ideally stacked) of these formulas:

- **Pattern-interrupt question** that implies the viewer is doing it wrong: "깃 명령어, 아직도 외우고 계세요?"
- **Bold claim / forbidden knowledge:** "깃 명령어 외우던 시대는 끝났다."
- **Curiosity gap** — name a result, withhold the mechanism: "잘나가는 개발자들은 명령어를 외우지 않습니다." (how?? → keep watching)
- **Concrete number / stakes:** "이걸 모르면 매달 수십 시간을 날립니다."

Give s01 a punchy caption (e.g. "아직도 외우세요?") — it's the giant on-screen text that stops the scroll. Note: the storyboard will mark s01-s02 as `video` clips (the cheap "front part as video" stop-scroll pattern), so your first two narrations should be the most arresting lines you have.

### 3. The reversal pivot (usually s03)
Right after stating the painful status quo, **turn** with 그런데 / 하지만 / 그런데 말이죠. This is the engine of retention: you set up a belief, then break it. Real example: s02 "검색만 수십 번 해보셨을 겁니다." → s03 **"그런데** 요즘 잘나가는 개발자들은, 명령어를 외우지 않습니다." The 그런데 is doing load-bearing work — it converts a relatable complaint into a promise.

### 4. The reframe — turn the mundane into a NEW concept (the "회복도 트레이닝" move)
VIDEO 1's signature move: an ordinary thing ("쉬는 날") gets renamed into a branded concept ("회복도 트레이닝") and suddenly feels like insider knowledge worth watching for. Do this once, centrally. In demo-git it's the reframe **"핵심은, 명령어가 아니라 의도를 말하는 겁니다."** — git stops being "commands to memorize" and becomes "speaking intent." Give your video its own such line; it's the quotable spine the audience remembers.

### 5. Body — relentless forward momentum
Each scene must *earn the next*. Techniques:
- **Short sentences.** Fast pacing = short narration = more cuts. Cut every clause you can.
- **Concrete > abstract.** Real examples land: "방금 커밋 되돌려줘, 라고 말하면." then "AI가 git revert를 알아서 실행하죠." Show, sentence by sentence.
- **Open loops:** end a scene mid-thought so the next is required: s13 "깃을 외우는 데 쓰던 그 시간을," → s14 "이제 진짜 중요한 코드에 쓸 수 있습니다." (s13's trailing comma forces s14.)
- **One idea per scene.** If a sentence has two ideas, split it into two scenes — that's free retention (one more cut).
- **A small honest caveat builds trust** and resets attention: s15 "물론, 기본 원리는 알고 있어야 합니다." Use sparingly, near the end.

### 6. CTA close (last 1-2 scenes)
End on action + a forward pull to the next part. **Never use a platform-specific "구독 / subscribe / 좋아요 / 알림" line** — this content is cross-posted to multiple platforms, so the CTA must be platform-neutral: a concrete next action, or a pull to the next episode. Real: "다음 편에서 실전 셋업까지 이어집니다. 지금 바로 따라 해보세요." Caption "지금 따라하기". Never end flat; the last frame should pull the viewer forward — to do the thing, or to the next part.

## Weak vs strong Korean hooks (before / after)

| ❌ Weak (scroll-away) | ✅ Strong (stop-scroll) | Why |
|---|---|---|
| "오늘은 깃에 대해 알아보겠습니다." | "깃 명령어, 아직도 외우고 계세요?" | Topic announcement vs. a question that implies *you're behind*. |
| "AI는 코딩에 도움이 됩니다." | "잘나가는 개발자들은 명령어를 외우지 않습니다." | Generic benefit vs. curiosity gap (how do they not?). |
| "이 영상에서는 세 가지를 설명합니다." | "이 세 가지만 알면, 나머진 AI가 다 채워줍니다." | Table-of-contents vs. a payoff promise. |
| "주식 투자는 위험할 수 있습니다." | "이 신호를 놓치면, 다음 폭락에 그대로 당합니다." | Hedge vs. concrete stake + loss aversion. |
| "쉬는 날에는 푹 쉬는 게 좋습니다." | "쉬는 날도 사실은 '회복도 트레이닝'입니다." | Obvious advice vs. a reframe into a new named concept. |

General fixes: drop "오늘은/이번 영상에서는" openers, drop hedges (~수도 있습니다, ~인 것 같습니다), convert statements into questions or claims, put a number or a named concept in the first line.

## Output format (what you actually produce)

First, the **review table** (text-level, for human QA — this is the VIDEO-1 step), then the JSON.

```
# <title>  (niche / ~Ns / N scenes)
HOOK:    s01 그런데… REFRAME: sNN   CTA: sNN

s01  [아직도 외우세요?]      깃 명령어, 아직도 외우고 계세요?
s02  [검색 수십 번]          git reset, rebase, cherry-pick. 검색만 수십 번 해보셨을 겁니다.
s03  [외우지 않는다]         그런데 요즘 잘나가는 개발자들은, 명령어를 외우지 않습니다.
...
s18  [지금 따라하기]         다음 편에서 실전 셋업까지 이어집니다. 지금 바로 따라 해보세요.
```

Then output the `project.json` skeleton with `scenes[]` filled (narration + caption + id), and the top-level defaults. State clearly: *"scene-storyboard will now add imagePrompt / motion / video."*

See `references/examples.md` for a full worked topic→script and more hook patterns by niche. The verified reference script lives at `factory/projects/demo-git/project.json`.

## Handoff (cross-skill dependency)

- **You produce:** `scenes[].narration`, `scenes[].caption`, `id`, and the per-scene `id`s, plus top-level `id/title/niche/lang/format/voice/style.accent/style.bg`.
- **scene-storyboard consumes** your scenes and adds `imagePrompt` (English, "no text in image"), `motion` (kenburns-in/out, pan-left/right), `style.imageSuffix`, and `video` clips on s01-s02. Together you complete `factory/projects/<id>/project.json`.
- Then: `node factory/build.mjs <id> --limit 3 --no-video` → `node factory/still.mjs <id> 30` → full `build.mjs` → `node factory/render.mjs <id>`.

Do not write imagePrompt/motion yourself — leaving those for storyboard keeps the ASCII-first QA boundary clean.
