---
name: lecture-clip-factory
description: >-
  Mass-produce a beginner-friendly KOREAN coding-lecture clip (8~12min) for non-majors — the
  "바이브코딩 기초 12시간 강의" pipeline. Turns ONE clip topic + a VERIFIED build-log into (a) a
  full kit-schema clip script JSON and (b) a ready-to-render slide-explainer project.json, then
  builds it into an .mp4 in the user's own voice (shainvoice01) via the factory. EVERY clip MUST
  carry two non-negotiable parts: 단어 개념요소 (break each key term into 영어 원뜻 → 구성요소 →
  비유) and a 매우 구체적인 숙제 (numbered steps + 제출물 + 막혔을 때 칠 프롬프트 + 예상시간).
  USE THIS whenever the user wants to make/mass-produce lecture clips, says 강의 영상/강의 클립/
  강의 대본 만들어줘, 바이브코딩 강의, 12시간 강의, 부경대·경성대 강의, 비전공자 강의 영상,
  클립 대본 양산, lecture clip, course video, teach coding to beginners. Builds on slide-explainer
  for rendering; use viral-script-writer for non-lecture marketing scripts instead.
---

# lecture-clip-factory

Produce one (or many) **바이브코딩 기초 강의 클립** — a 8~12분 slide-narrated lecture video for
**비전공·입문** 학부생, in the user's cloned voice. This skill encodes the "12시간 강의 AI 생성
키트": its teaching philosophy, the anti-hallucination build-log rule, and the kit JSON schema —
plus two MANDATORY components the user requires on every clip:

1. **`term_concepts` (단어 개념요소)** — never just define a term; break it open so a beginner
   *understands* it: `영어 원뜻 → 구성요소(①②③) → 비유 → 왜 중요한지`.
2. **`homework` (매우 구체적인 숙제)** — numbered do-this-now steps, an exact 제출물(캡처 N장 등),
   a self-check list, the exact prompt to type when stuck, an optional stretch, and 예상 시간.

> Pipeline position: this is STEP 1→STEP 2→STEP 3 of the kit, ending at a rendered clip.
> It REUSES `slide-explainer` for the render (code-drawn slides → image cost 0, TTS only).

---

## The loop you run per clip

```
STEP 0  (HUMAN, before scripting)  build the example for real → test → write a VERIFIED build-log
STEP 1  outline the session into clips (only if no clip list yet)
STEP 2  write clip-script.json  (kit schema; term_concepts + homework REQUIRED)
STEP 3  convert → project.json (template:"slides") → build → render
```

**Absolute rule (anti-hallucination):** the `build_along` prompts/commands/outputs and every
`[SHOT:file]` come ONLY from a `verified:true` build-log. Never invent a command or result.
If no build-log exists, STOP and ask the user to run STEP 0 first (template in
`reference/buildlog-template.json`).

---

## Master system prompt (apply to ALL generation)

```
너는 "코드코리아(KODE KOREA)" 바이브코딩 강의의 시니어 AI 교육 강사다.
부경대·경성대 학부생(비전공·입문) 대상 12시간 온라인 강의의 클립 대본/슬라이드를 만든다.

[교육 철학]
- 핵심: "문법을 외우지 않는다. 의도를 말로 설명하면 AI가 코드를 만든다. 학습자는 읽고/방향잡고/되돌릴 수 있으면 된다."
- Manual-Before-AI: 직관 먼저, 그다음 AI에 시킴.
- 목표는 암기가 아니라 (1)직관 (2)용어 감각 (3)AI에 질문·디버깅하는 루프.
- 깊이보다 "왜 필요한가 + 어디에 쓰는가" 우선.
- 예제 빌드 필수: 매 클립에서 작은 예제 하나를 4단계 바이브코딩 루프로 실제로 만든다
  ① 자연어로 의도 말하기 ② AI에 칠 실제 프롬프트 ③ 결과에서 뭘 읽을지 ④ 테스트·되돌리기.

[청중] 코딩 처음. 비유를 적극 쓰고, 새 용어는 등장 즉시 한 문장으로 풀어준다.
[톤] 친근한 구어체 존댓말("~해요/~거예요/~봅시다"). 짧은 문장. 쉬운 단어. 따뜻하고 명확하게.
     영어 용어는 처음에 "한글(English)" 병기.
[분량] 1클립=8~12분=나레이션 약 2,000~2,800자. 슬라이드 6~9장(불릿 3~5).
[금지] 코드 통째 암기 요구 X. 검증 안 된 명령/사실 지어내기 X(불확실하면 "공식 문서 확인"). 1클립 1~2개념.
[플랫폼 중립] 구독/subscribe 같은 CTA 금지(영상은 교차 게시됨).
```

---

## STEP 2 output schema (clip-script.json) — REQUIRED fields in **bold**

```jsonc
{
  "clip_id": "S2-03",
  "title": "...",
  "duration_min": 10,
  "learning_objectives": ["행동 동사로 2~3개"],
  "narration": "구어체 통대본 2,000~2,800자. 슬라이드 전환 [S1].. + 스크린샷 [SHOT:파일명].",
  "build_along": {                         // ← 검증된 빌드로그에서만 채움
    "goal":"", "step1_intent":"", "step2_prompt_to_ai":"", "step3_read_result":"",
    "step4_verify_fix":"", "result":"", "screenshots":["..."]
  },
  "term_concepts": [                       // ★ REQUIRED — 핵심 용어마다 1개 (보통 2~3개)
    { "term":"커밋 (commit)",
      "literal":"영어로 '확정하다'는 뜻",
      "elements":["① 바꾼 내용을","② 하나의 묶음으로","③ 저장 지점으로 확정"],
      "analogy":"게임의 세이브 버튼",
      "why_it_matters":"확정해두면 언제든 돌아올 수 있어 안심하고 실험" }
  ],
  "homework": {                            // ★ REQUIRED — 매우 구체적으로
    "title":"...", "goal":"...", "est_min":15,
    "steps":["1) ...","2) AI에 그대로 친다: \"...\"","3) ... 눈으로 확인","4) ...","5) ..."],
    "deliverable":"무엇을 몇 장/어떤 형태로 제출하는지 명확히 (예: log 화면+복구 화면 2장 캡처)",
    "self_check":["보이는가?","되살아났는가?","내가 프롬프트로 시켰는가?"],
    "if_stuck":"막히면 AI에게 이렇게: \"...\" (실제로 칠 문장)",
    "stretch":"(여유되면) 한 단계 더"
  },
  "slides":[ {"n":1,"title":"","bullets":["3~5개"],"visual":"그림/캡처 설명(빌드로그 파일명 가능)"} ],
  "screen_demo":["빌드로그 동작을 화면녹화로 재현할 항목 — AI가 만들지 말 것"],
  "onscreen_terms":["자막 하단바 용어"],
  "wrap_up":"한 줄 정리",
  "next_hook":"다음 클립 예고 한 줄",
  "quiz":[{"q":"","a":""}]
}
```

**Quality gates before moving on:** narration ≥ 2,000자 · 모든 `[SHOT:]`가 build_along.screenshots에
존재 · `term_concepts`에 그 클립의 onscreen_terms가 다 들어감 · `homework.steps`가 "그대로 따라하면
끝나는" 수준으로 구체적(추상적 "해보세요" 금지) · 구독 CTA 없음.

A full reference output lives in `reference/clip-script.example.json` (clip S2-03). Mirror its
tone, length, and the depth of its `term_concepts`/`homework`.

---

## STEP 3 — convert to a renderable project.json

Map clip-script → `slide-explainer` schema (`template:"slides"`). Each `[S#]` chunk of narration
becomes one scene's `narration`; slides become scenes. **Always add two dedicated scenes:**

- a **개념요소 scene** (`kicker:"용어 · 개념요소"`) whose bullets are the `term_concepts` one-liners
  in `용어(eng) = 원뜻 → 핵심 비유` form.
- a **숙제 scene** (`kicker:"오늘의 숙제 · N분"`) whose bullets are the 2~3 most concrete `homework`
  steps, with `note` = the `if_stuck` prompt.

```jsonc
{
  "id":"byb-s2-03", "title":"...", "template":"slides", "niche":"vibe-coding-basics", "lang":"ko",
  "format":{"width":1920,"height":1080,"fps":30},
  "voice":{"voiceId":"shainvoice01","model":"speech-2.6-hd","speed":1.05,"pitch":1,"vol":1.05},
  "style":{"accent":"#CC785C"},
  "scenes":[ /* 8~9 scenes: hook → 왜중요 → 개념요소 → build_along ①②③ → 리듬정리 → 숙제 → 다음편 */ ]
}
```
Scene fields: `id,title,narration` required; `kicker,bullets(≤22자/줄, 3개),stat{value,label},note` optional.
Bullets stagger in narration order — narrate them top-to-bottom. Full example:
`reference/project.example.json`.

---

## Build & render (factory; from repo root)

```bash
node factory/build.mjs <id>          # TTS only (slides have no image gen) — resumable
node factory/still.mjs <id> <frame>  # QA one frame → factory/_verify/still_<id>_<frame>.png
node factory/render.mjs <id>         # → out/<id>.mp4
```

### Re-editing narration
`build.mjs` caches audio by a **content signature** (narration + voice params), stored as `sig`
in each `audio/<sceneId>.json`. Edit a scene's `narration` and rebuild — only that scene
regenerates (`narration/voice changed -> regenerating`); the rest stay cached. No manual deletion
needed. (Legacy caches without a `sig` are backfilled once, assuming they match the current text.)
Still QA a frame on edited scenes to confirm.

---

## Doing it well

- **One clip at a time.** 12h ≈ 65 clips. Keep `이전_클립_요약` threaded so 비유·인사가 안 반복됨.
- **Examples small & complete** (LED 1개, 평균 1개) — "끝까지 돌아감" > 화려함.
- **term_concepts is the differentiator** — beginners fear words. Always crack the word open.
- **homework must be do-able tonight** — exact prompts, exact 제출물. Never "각자 해보세요".
- If asked for a non-slide visual (그래프/좌표) use `theory-viz`; for AI-image montage use `youtube-factory`.
