# 역할(role) 시스템 + project.json 스키마 — v3의 핵심

렌더러가 씬의 `kicker`+내용으로 **역할(role)**을 추론(`inferRole`)해 역할별로 완전히 다른 레이아웃을 그린다. 그래서 스키마를 안 바꿔도 "같은 틀" 느낌이 안 난다. **새 레이아웃을 원하면 kicker 문구를 맞추거나 diagram/code/bullets 조합을 바꾼다.**

## 역할 표
| 역할 | 트리거 (kicker/내용) | 레이아웃 |
|---|---|---|
| `cover` | index 0 + `layout:"full"` (미디어 없음) | 대형 표지(코랄 고스트 숫자) |
| `chapter` | `layout:"full"` (미디어 없음) | 챕터 표지 |
| `media` | `layout:"full"` + clip/image | 풀블리드 + 캡션 |
| `definition` | kicker `용어/단어/뜻` + `diagram.kind:"pair"` | 용어 스프레드(쪼개기 도식 + 이탤릭 인용) |
| `process` | `diagram.kind:"flow"`, 불릿 없음 | 번호역 타임라인 레일 |
| `code` | `code` 배열 존재 | 2단(좌 의도 + 우 코드패널) |
| `homework` | kicker `숙제/과제/미션/제출/점검/직접 하기` | 체크박스 카드 리스트 |
| `recap` | kicker `정리/복습/요약/마무리` | 2단 박스 takeaway |
| `statement` | title만 | 초대형 진술(비대칭 고스트 숫자) |
| `list` | bullets | 번호 불릿(좌우 교대 비대칭) |

## project.json 필드
공통:
```json
{
  "id": "...", "title": "...", "template": "montage",
  "format": { "width": 1920, "height": 1080, "fps": 30 },
  "style": { "accent": "#CC785C", "bg": "#F0EEE6" },
  "voice": { "voiceId": "MyVoice", "language": "ko" },
  "scenes": [ ... ]
}
```
씬마다:
- `id` + `narration` **필수**. 자막은 자동(TTS 타이밍, 문장 단위 한 줄씩).
- `kicker` 짧은 라벨(역할 유도). `title` `\n`으로 2줄·짧게.
- `bullets`(순차 등장) / `note`(보조 한 줄) / `code`(문자열 배열).
- `diagram`: `{"kind":"flow","nodes":[{label,sub}]}` 또는 `{"kind":"pair","a","b","result"}`.
- `layout`: `slide`(기본) · `split` · `full` 만. 세부 디자인은 렌더러가 역할로 정함.

## 모션·자막을 손볼 때
Remotion 기술 디테일은 `rules/remotion/`을 읽는다 — 등장 애니메이션(`animations.md`,`timing.md`), 텍스트 모션(`text-animations.md`), 자막(`display-captions.md`), 트랜지션(`transitions.md`).
