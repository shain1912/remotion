# viral-script-writer — worked examples & hook bank

Deep detail for the SKILL. Read when you need a full topic→script walkthrough, more
hook formulas, or niche-specific patterns.

---

## A. Full worked example: topic → script

**Topic given by user:** "복리의 힘" (the power of compound interest) — niche: 경제/시사.

### Step 1 — angle
Surprising claim inside the topic: people *know* compounding exists but vastly
underestimate the time-asymmetry — waiting 10 years to start halves the result.
Tension to open: "you think you have time. you don't."

### Step 2 — review table (show this FIRST, get approval before JSON)

```
# 10년 늦으면 절반 됩니다 | 복리의 진짜 무서움   (경제 / ~75s / 17 scenes)
HOOK: s01-02   REVERSAL: s04 (그런데)   REFRAME: s09 (복리 = 시간 레버리지)   CTA: s17

s01  [지금 안 하면]        통장에 백만 원, 그냥 두고 계세요?
s02  [10년 후엔]           그 돈이 10년 뒤에 얼마가 될지, 계산해 보신 적 있나요?
s03  [거의 그대로]         물가까지 생각하면, 사실상 줄어듭니다.
s04  [그런데]              그런데 같은 돈을 다르게 두면, 이야기가 완전히 달라집니다.
s05  [복리]               비밀은 복리입니다.
s06  [이자가 이자를]       이자가 다시 이자를 낳는 구조죠.
s07  [7%면]               연 7%로 굴리면, 약 10년마다 두 배가 됩니다.
s08  [백만 → 8백만]        30년이면 백만 원이 8백만 원이 됩니다.
s09  [시간 레버리지]       복리는 돈이 아니라, 사실 시간을 빌리는 레버리지입니다.
s10  [10년 늦으면]         그런데 시작을 10년 늦추면,
s11  [절반]               마지막 결과는 거의 절반으로 줄어듭니다.
s12  [한 번의 두 배]       마지막 두 배 구간을 통째로 잃기 때문이죠.
s13  [금액보다 시간]       그래서 핵심은 금액이 아니라 시작 시점입니다.
s14  [소액이라도]          단돈 10만 원이라도, 지금 시작한 게 이깁니다.
s15  [자동이체로]          매달 자동이체 하나만 걸어두세요.
s16  [그게 전부]           복리는 그 다음부터 알아서 일합니다.
s17  [지금 시작하기]       다음 편에서 계좌 세팅까지 같이 해요. 오늘 1만 원부터 시작해보세요.
```

Notice the mechanics:
- s01-s02 = pattern-interrupt question + curiosity gap → these become the `video` clips.
- s04 = the **그런데 reversal**.
- s09 = the **reframe** ("복리 = 시간 레버리지" — mundane interest becomes a named concept).
- s07-s08 = **concrete numbers** (7%, two 배, 백만→8백만) — abstractions don't retain.
- s10→s11→s12 = **open-loop chain** (each comma/clause forces the next cut).
- s17 = CTA (platform-neutral — no 구독/subscribe) + next-part pull.
- 17 scenes ≈ 75s. Every line is ONE sentence.

### Step 3 — JSON skeleton (what you hand off)

```json
{
  "id": "compound-10yr",
  "title": "10년 늦으면 절반 됩니다 | 복리의 진짜 무서움",
  "niche": "economy",
  "lang": "ko",
  "format": { "width": 1920, "height": 1080, "fps": 30 },
  "voice": { "voiceId": "shainvoice01", "model": "speech-2.6-hd", "speed": 1.05 },
  "style": { "imageSuffix": "", "accent": "#22d3a6", "bg": "#0a0e14" },
  "scenes": [
    { "id": "s01", "narration": "통장에 백만 원, 그냥 두고 계세요?", "caption": "지금 안 하면" },
    { "id": "s02", "narration": "그 돈이 10년 뒤에 얼마가 될지, 계산해 보신 적 있나요?", "caption": "10년 후엔" }
    /* …s03–s17… */
  ]
}
```

Then say: *"scene-storyboard will now add imagePrompt / motion / video clips on s01-s02."*

---

## B. Hook bank by niche (Korean)

### 경제 / 시사 (high CPM)
- 손실 회피: "이 신호를 놓치면, 다음 폭락에 그대로 당합니다."
- 숫자 stake: "월급의 90%는 사실 새고 있습니다."
- 역설: "돈을 모으려면, 먼저 통장을 쪼개야 합니다."

### AI / 개발 교육 (this channel)
- 시대 종료 선언: "○○ 외우던 시대는 끝났습니다."
- 인사이더 격차: "잘하는 사람들은 이걸 이미 자동화했습니다."
- 무력화: "이 한 줄이면, 한 시간짜리 작업이 끝납니다."

### 무협 애니 (시니어 타깃)
- 운명 반전: "버려진 종놈이, 천하제일이 되는 순간이었다."
- 비밀 무공: "이 비급 한 권이 강호의 판도를 바꿨다."
- 배신: "그가 사부의 칼에 쓰러지던 그날."

(General: open with a question/claim/number, never with "오늘은…". Put a named
concept or a number in the first sentence.)

---

## C. Reframe move catalogue (the "회복도 트레이닝" pattern)

Take the boring core noun of the video and rename it into a new, slightly
technical-sounding concept. This is the most shareable line.

| Boring | Reframe |
|---|---|
| git 명령어 | "명령어가 아니라 의도를 말하는 것" (demo-git, verified) |
| 쉬는 날 | "회복도 트레이닝" (VIDEO 1) |
| 복리 이자 | "시간을 빌리는 레버리지" |
| 메모 앱 | "두 번째 뇌(second brain)" |
| 운동 습관 | "미래의 나에게 보내는 적금" |

Place it once, centrally (around the 60-70% mark), as a standalone scene. It is
the spine the viewer quotes in the comments.

---

## D. Self-check before handing off

- [ ] Every `narration` is exactly ONE Korean sentence.
- [ ] Every `caption` is 2-5 words (fits `fontSize:100` on screen).
- [ ] s01 hooks in ≤3 seconds (question / claim / number / curiosity gap).
- [ ] There is one explicit 그런데/하지만 reversal, early.
- [ ] There is exactly one reframe line (mundane → named concept).
- [ ] Body uses concrete numbers/examples, not abstractions.
- [ ] Open loops chain scenes (trailing 쉼표/접속) so nothing is skippable.
- [ ] Last scene is a CTA with a next-video pull.
- [ ] 15-26 scenes for short-form (≈3-5s each).
- [ ] `id`s are s01, s02, … sequential. No imagePrompt/motion (storyboard's job).
