# Mister World Frontend Motion System

> Document: `05-MOTION-SYSTEM.md`  
> Status: **CP4 Complete**  
> Scope: `WonhoOne/frontend` Customer GUI  
> Planning baseline: 2026-09-29  
> Depends on:
> - `00-PLANNING-INDEX.md`
> - `01-PRODUCT-EXPERIENCE.md`
> - `02-INFORMATION-ARCHITECTURE.md`
> - `03-VISUAL-DIRECTION.md`
> - `04-DESIGN-SYSTEM.md`

---

# 0. CP4 Objective

CP4의 목표는 Mister World의 Motion을 “예쁜 애니메이션 모음”이 아니라
**일관된 상태 전환 언어**로 만드는 것이다.

Motion은 다음 4가지를 설명해야 한다.

1. **공간** — 어디에서 어디로 이동했는가
2. **선택** — 무엇을 선택했고 무엇이 바뀌었는가
3. **진행** — 로딩 / 모집 / 처리 과정이 어디까지 왔는가
4. **완료** — 신청 / 확정 / 적용이 성공했는가

Motion이 정보보다 앞서면 실패다.

목표 인상:

> **quiet, premium, controlled, cinematic**

금지 인상:

> bouncy, playful, over-animated, game-like

---

# 1. Motion Principles

## M-01 — Motion must explain change

애니메이션이 들어가는 이유는 반드시 아래 중 하나여야 한다.

```text
navigation
selection
state change
hierarchy
progress
confirmation
attention
```

이유가 없다면 움직이지 않는다.

---

## M-02 — One dominant motion per moment

한 순간에 여러 component가 서로 다른 방식으로 움직이지 않는다.

예:

Style을 선택할 때:

```text
selected surface shift
+ summary update
```

까지만.

동시에:

- 카드 scale
- glow
- icon spin
- border pulse
- price bounce

를 모두 하지 않는다.

---

## M-03 — Spatial consistency

Forward navigation은 전진하는 느낌,
Back navigation은 되돌아가는 느낌을 유지한다.

같은 component는 같은 방향 규칙을 반복한다.

---

## M-04 — Motion never blocks essential input

긴 cinematic animation이 끝나야만 버튼을 누를 수 있는 구조 금지.

사용자는 애니메이션 중에도 가능한 범위에서 interaction을 계속할 수 있어야 한다.

---

## M-05 — Motion is interruptible

사용자가 빠르게 여러 option을 변경하면
이전 animation이 끝날 때까지 queue에 쌓이지 않는다.

새로운 state가 오면:

```text
old animation
→ gracefully interrupted
→ new state animation starts from current visual state
```

---

## M-06 — Reduced motion is first-class

`prefers-reduced-motion: reduce` 환경에서
핵심 기능과 상태 변화가 모두 이해 가능해야 한다.

shared-element / parallax / long transforms는 제거하고
짧은 opacity transition 또는 instant update로 대체한다.

---

# 2. Duration Tokens

| Token | Duration | Usage |
|---|---:|---|
| `motion-instant` | 80ms | tiny feedback / icon state |
| `motion-fast` | 140ms | hover / pressed / focus |
| `motion-control` | 200ms | button / selection / input |
| `motion-component` | 280ms | card / summary / local layout |
| `motion-panel` | 360ms | dialog / bottom sheet / popover |
| `motion-section` | 480ms | section reveal / content transition |
| `motion-page` | 620ms | normal page transition |
| `motion-cinematic` | 820ms | signature Hero/shared transition |

### Rule

- 1000ms 초과 transition은 기본 금지.
- loading shimmer만 예외적으로 긴 반복 duration을 사용한다.
- interactive control은 300ms를 넘기지 않는다.

---

# 3. Easing Tokens

## `ease-standard`

```css
cubic-bezier(0.2, 0.0, 0.0, 1.0)
```

사용:

- 일반 UI transition
- visibility change
- button / control

---

## `ease-enter`

```css
cubic-bezier(0.16, 1, 0.3, 1)
```

사용:

- content enter
- dialog enter
- section reveal
- card emphasis

---

## `ease-exit`

```css
cubic-bezier(0.4, 0, 1, 1)
```

사용:

- 빠르게 사라져야 하는 UI
- transient exit

Exit는 Enter보다 짧게.

---

## `ease-cinematic`

```css
cubic-bezier(0.22, 1, 0.36, 1)
```

사용:

- Hero shared transition
- large image expansion
- editorial reveal

---

# 4. Spring Presets

Spring은 모든 UI에 사용하지 않는다.

## `spring-soft`

권장 개념값:

```text
stiffness: 220
damping: 28
mass: 0.9
```

사용:

- selected marker
- summary micro-shift
- check icon
- light floating control

---

## `spring-settle`

```text
stiffness: 180
damping: 32
mass: 1.0
```

사용:

- bottom sheet settle
- modal content subtle landing
- recruitment completion marker

---

## Forbidden spring

- 큰 overshoot
- 반복 bounce
- rubber-band 느낌
- CTA가 튀어 오르는 motion

Premium UI는 bounce보다 settle이 우선이다.

---

# 5. Motion Property Hierarchy

우선 사용:

```text
transform
opacity
clip-path
filter (limited)
```

가능하면 피함:

```text
width
height
top
left
margin
padding
```

이유:

- layout reflow 감소
- animation 성능 안정
- interaction 중 frame drop 방지

Layout change가 필요한 경우
FLIP / layout animation 전략을 사용한다.

---

# 6. Route Transition System

## 6.1 Standard forward transition

적용:

- Tour Detail → Configure
- Configure → Review
- 일반적인 향후 detail route 전환

현재 `My Trips → history detail`은 dedicated route/API 계약이 없으므로
실제 interaction으로 활성화하지 않는다.

Outgoing:

```text
opacity: 1 → 0
translateY: 0 → -8px
duration: 180–220ms
```

Incoming:

```text
opacity: 0 → 1
translateY: 14px → 0
duration: 320–360ms
delay: 40–60ms
```

전체 체감은 400ms 안팎.

---

## 6.2 Standard back transition

Incoming previous page:

```text
opacity: 0 → 1
translateY: -8px → 0
```

Outgoing current page:

```text
opacity: 1 → 0
translateY: 0 → 12px
```

Forward / Back의 방향성을 약하게라도 구분한다.

---

## 6.3 No global crossfade curtain

페이지 전체를 검정/흰색 overlay로 가렸다 여는 방식은 금지.

이유:

- 느림
- 컨텍스트 단절
- 콘텐츠 중심 서비스에 과함

---

# 7. Signature Shared Transition

적용:

```text
Home Theme Card
→ Tour Detail Hero

Tours Theme Card
→ Tour Detail Hero
```

## Behavior

1. 사용자가 Theme card 클릭
2. card overlay / text는 빠르게 정리
3. 이미지 frame이 현재 위치에서 확장
4. image crop이 Hero crop으로 자연스럽게 보간
5. Hero background 자리 확보
6. title/eyebrow가 새 위치에서 settle
7. Detail content reveal

## Timing

```text
Image transform        620–820ms
Card text exit         140–180ms
Hero text enter        360–480ms
Detail body begin      120ms after hero text
```

## Important

shared image가 준비되지 않았거나
navigation이 direct link/refresh인 경우:

```text
fallback hero reveal
```

로 즉시 전환.

Shared transition은 routing을 깨뜨리는 필수 기능이 아니다.

---

# 8. Home Hero Motion

## Initial load

1. image:
   ```text
   scale 1.025 → 1.0
   opacity 0.92 → 1
   ```
2. eyebrow:
   ```text
   opacity 0 → 1
   y 10 → 0
   ```
3. headline:
   ```text
   opacity 0 → 1
   y 24 → 0
   ```
4. CTA:
   ```text
   opacity 0 → 1
   y 12 → 0
   ```

전체 700–900ms 범위에서 stagger.

## Rule

Hero가 매 방문마다 2초씩 등장하지 않는다.

빠른 route revisit에서는 더 짧은 variation 허용.

---

# 9. Scroll Reveal System

## Default section reveal

```text
opacity 0 → 1
translateY 24px → 0
duration 480ms
ease-enter
```

Trigger:

- viewport 진입 약 15–20%

Stagger:

```text
40–80ms
```

## Editorial image reveal

가능한 패턴:

```text
clip-path inset(...)
→ full frame
```

또는

```text
mask/overflow frame
+ image translateY 16px → 0
```

## Rule

스크롤을 올렸다 내릴 때 계속 반복하지 않는다.

기본은 **한 번만 reveal**.

---

# 10. Parallax

사용 위치:

- Home Hero
- 아주 큰 Tour Detail image
- editorial full-width visual

강도:

```text
2–6% displacement
```

금지:

- card마다 parallax
- text parallax
- form/transaction page
- mobile에서 과도한 scroll-linked transform

Mobile에서는 기본적으로 약화 또는 제거.

---

# 11. Card Hover

## Editorial Card

Desktop pointer environment:

```text
image scale      1.000 → 1.025
image duration   360ms
overlay          + subtle
title/arrow      4px directional shift max
```

Card 전체가 8px 위로 뜨는 floating animation은 기본 금지.

## Information Card

My Trips:

```text
border subtle → strong
surface subtle shift
optional translateY -2px
```

---

# 12. Button Motion

## Hover

```text
background / border / text
140ms
```

Primary button:

```text
no scale by default
```

## Pressed

```text
translateY 0 → 1px
```

또는 아주 미세한 visual compression.

`scale(0.95)` 같은 과한 축소 금지.

## Loading

label crossfade:

```text
Book this trip
→ Booking…
```

아이콘이 필요하면 작은 spinner.

버튼 width 유지.

## Success

```text
Booking…
→ check draws / fades in
→ Requested
```

200–320ms.

그 후 page transition.

---

# 13. Link / Arrow Motion

Editorial link:

```text
Explore →
```

Hover:

- underline reveal 또는
- arrow `translateX(0 → 4px)`

둘 중 하나를 주 동작으로 선택.

과한 loop animation 금지.

---

# 14. Tour Style Selection

Tour Style은 중요한 state transition.

## Interaction sequence

1. click
2. selected surface가 200ms 안에 변화
3. border/accent 상태 변경
4. check marker `spring-soft`
5. summary text update 220–280ms
6. 가격이 있다면 price transition

## Selected background

가능하면 accent-soft overlay가
카드 내부에서 자연스럽게 확장되는 방식.

금지:

- pulse
- glow
- 카드 bounce
- 큰 scale

---

# 15. Option Selection Motion

Hotel / Transport / Meal / Extra 공통.

## Single-select

Old selected:

```text
accent surface → neutral
180ms
```

New selected:

```text
neutral → accent surface
200ms
```

check marker:

```text
opacity 0 → 1
scale 0.92 → 1
spring-soft
```

## Multi-select Extra

checkbox/check animation만 가볍게.

Option card 전체를 흔들거나 튕기지 않는다.

---

# 16. Live Summary Update

Configure 우측 Summary는 페이지에서 가장 자주 업데이트되는 영역이다.

## Text field update

예:

```text
Grand Hotel
→ Premium Hotel
```

Old:

```text
opacity 1 → 0
translateY 0 → -6px
```

New:

```text
opacity 0 → 1
translateY 8px → 0
```

Duration:

```text
180–240ms
```

## Layout changes

Summary card 전체 높이가 바뀌면
layout animation을 220–300ms로 부드럽게.

## Rule

Summary 전체가 매 선택마다 fade-out/fade-in 하지 않는다.

**바뀐 부분만 움직인다.**

---

# 17. Price / Number Transition

## Default

가격이 변할 때:

```text
old value
→ digit/value transition
→ new value
```

권장:

- tabular numbers
- vertical digit slide 또는
- restrained count transition

Duration:

```text
240–360ms
```

## Large jumps

실제 계산이 복잡하거나 값 차이가 클 때
0부터 count-up 하지 않는다.

예:

```text
₩1,180,000
→
₩1,320,000
```

직접 이전 값에서 새 값으로 transition.

---

# 18. Schedule Selection Motion

날짜/일정 카드 선택:

```text
surface shift
border
status marker
```

200–240ms.

모집 상태 숫자가 바뀌는 경우:

- changed marker만 update
- 전체 schedule card 재렌더 느낌 금지

---

# 19. General Recruitment Progress Motion

## Joining state update

예:

```text
2 / 3 travellers
→ 3 / 3 travellers
```

Sequence:

1. 새 marker fill
2. connecting line fill
3. count update
4. `Confirmed` label reveal

### Marker

```text
scale 0.9 → 1
opacity
spring-settle
```

### Line

```text
scaleX 0 → 1
transform-origin left
280–420ms
```

### Confirmed

```text
opacity 0 → 1
y 8 → 0
```

## Rule

Confetti 없음.

---

# 20. Honeymoon Couple Progress Motion

허니문은 사람 marker가 아니라 Team/Couple slot을 사용한다.

## Second couple joins

Sequence:

1. Couple 02 label `Waiting → Joined`
2. slot marker fill
3. connection line animate
4. `2 / 2 Couples`
5. `Departure Confirmed` reveal

이 sequence는
일반 Tour보다 조금 더 signature moment로 처리 가능.

전체:

```text
600–900ms
```

하지만 interaction blocking 금지.

---

# 21. Reservation Review Motion

거래 화면이므로 motion을 낮춘다.

## Entry

- page transition
- section 40ms 정도의 아주 짧은 stagger 가능

## Change link return

Configure로 돌아갈 때
현재 review가 과하게 dissolve되지 않게 standard back transition.

## Submit

CTA state가 중심.

다른 화면 요소를 dim/animate하지 않는다.

---

# 22. Reservation Success Motion

Signature completion moment.

## Sequence

1. page enter
2. check/icon line draw or scale settle
3. success heading fade/slide
4. trip identity
5. recruitment status
6. CTA

전체 700–1000ms 안에서 끝.

## Check motion

과도한 Lottie / particle animation보다:

- stroke draw
- mask reveal
- subtle scale

우선.

---

# 23. Dialog Motion

## Enter

Backdrop:

```text
opacity 0 → target
180–240ms
```

Dialog:

```text
opacity 0 → 1
translateY 16px → 0
scale 0.985 → 1
280–360ms
ease-enter
```

## Exit

```text
opacity → 0
translateY 0 → 8px
180–220ms
ease-exit
```

Exit가 enter보다 짧다.

---

# 24. Bottom Sheet Motion

## Enter

```text
translateY 100% → 0
360ms
spring-settle or ease-enter
```

Backdrop 동시 fade.

## Drag

향후 gesture library를 사용한다면:

- finger tracking 1:1
- velocity-aware dismiss
- snap-back spring

기본 CP4 계약에서는 drag dismiss가 필수는 아니다.

---

# 25. Header Motion

Home Hero header:

```text
transparent
→ solid warm surface
```

Scroll threshold에서:

- background opacity
- border
- text color

를 180–260ms.

Header 높이는 scroll마다 계속 줄였다 늘리지 않는다.

---

# 26. Image Loading Motion

## Progressive load

```text
placeholder
→ preview
→ full image
```

Final image:

```text
opacity 0 → 1
optional blur 8px → 0
duration 320–480ms
```

## Rule

이미지 load 후:

- scale jump 금지
- container height 변화 금지
- 1초 이상 blur 유지 금지

---

# 27. Skeleton Shimmer

## Duration

```text
1600–2000ms
```

linear infinite.

## Contrast

low contrast.

Highlight가 강한 흰색 stripe처럼 번쩍이면 안 된다.

## Direction

기본:

```text
left → right
```

한 화면에서 direction 통일.

## Reduced Motion

shimmer 제거.

Static skeleton 사용.

---

# 28. Empty-State Motion

기본:

```text
opacity 0 → 1
translateY 8px → 0
280–360ms
```

illustration이 있어도 loop animation은 기본 금지.

---

# 29. Error-State Motion

Error는 사용자를 놀라게 하면 안 된다.

폼 field:

- border / helper text reveal
- shake 금지

Section error:

```text
opacity 0 → 1
```

Critical destructive alert에 한해서만
추가 attention animation 검토 가능.

현재 범위에서는 필요 없음.

---

# 30. Retry Motion

Retry click:

1. Error action disabled
2. 해당 section만 skeleton/loader
3. success 시 content replace
4. failure 시 error restore

전체 page flash 금지.

---

# 31. Auth Motion

## Desktop modal-route

Current page:

```text
slight dim
optional very subtle scale 1 → 0.995
```

Login dialog:

standard dialog motion.

## Login success

Dialog 내부:

```text
success acknowledgment
→ dialog exit
```

그 뒤 Previous Travel History popup가 필요한 경우:

```text
150–220ms pause
→ history dialog enter
```

두 modal이 겹쳐 보이지 않게 한다.

---

# 32. Previous Travel History Popup Motion

팝업 안의 trip items:

```text
first visible content only
```

짧은 stagger 허용:

```text
40ms
```

목록 전체 10개가 하나씩 등장하는 animation 금지.

---

# 33. My Trips Motion

Trip card list는 기본적으로 정적.

Page entry에서 first viewport items에 한해
subtle fade-up.

Filter/tab이 향후 생기면:

- content crossfade
- layout transition

과도한 card reshuffle animation 금지.

---

# 34. Voice Motion State Machine

Voice UI는 다음 상태를 갖는다.

```text
Idle
Listening
Processing
Recognized
Applied
NotUnderstood
Error
```

## Idle

- static microphone/orb
- loop 없음 또는 거의 인지 안 되는 breathing

## Listening

- waveform 또는 orb amplitude
- 실제 audio input에 반응 가능
- rainbow gradient 금지
- pulse frequency 과도하게 빠르지 않음

## Processing

- listening waveform을 멈춤
- restrained rotational/phase indicator
- 별도 큰 spinner 필요 없음

## Recognized

recognized transcript reveal.

## Applied

```text
check / selected UI update
```

Voice surface보다 **실제 변경된 UI**가 primary feedback.

## NotUnderstood

brief message:

```text
명령을 이해하지 못했어요.
화면에서 직접 선택할 수 있습니다.
```

shake / red flash 금지.

---

# 35. Motion Choreography by Page

## Home

Motion intensity: **High, controlled**

- hero reveal
- editorial card reveal
- subtle parallax
- card hover
- shared transition

## Tours

Motion intensity: **Medium**

- card reveal
- image hover
- shared transition

## Tour Detail

Motion intensity: **Medium-High**

- hero
- story section reveal
- image reveal
- style selection
- schedule progress

## Configure

Motion intensity: **Medium**

- option selection
- summary update
- price
- sticky/mobile summary

## Reservation Review

Motion intensity: **Low**

- restrained route transition
- submit state

## Success

Motion intensity: **Medium-High, short-lived**

- completion sequence
- recruitment state

## My Trips

Motion intensity: **Low**

- subtle list entry
- detail route

## Auth

Motion intensity: **Low**

- dialog
- field states
- chained history popup

---

# 36. Motion Budget

## Simultaneous animations

한 viewport에서:

- large motion: 최대 1
- medium motion: 최대 2–3
- micro motion: 필요한 만큼, 단 경쟁 금지

## CPU/GPU

권장:

- transform / opacity 우선
- compositor-friendly
- scroll event 직접 setState 남발 금지
- requestAnimationFrame / motion library 활용

## Frame target

목표:

```text
60fps on normal modern laptop/mobile
```

Animation 때문에 main thread가 막히면 motion을 줄인다.

---

# 37. Loading Performance Rule

Motion은 실제 데이터 표시를 늦추면 안 된다.

예:

API result가 도착했는데
cinematic skeleton exit를 800ms 기다리는 것 금지.

권장:

```text
data ready
→ 120–200ms skeleton/content crossfade
```

---

# 38. Interruption Rules

## Rapid option switching

사용자가:

```text
Grand
→ Premium
→ Grand
```

을 빠르게 누르면 animation queue를 만들지 않는다.

항상 최신 state가 최종 visual을 소유.

## Route navigation during motion

Hero/shared transition 중에도
browser navigation state가 먼저 확정되어야 한다.

animation 실패가 routing 실패가 되어서는 안 된다.

## Slow device

animation frame drop 감지/환경에 따라
non-essential effects를 줄일 수 있다.

---

# 39. Reduced Motion Contract

`prefers-reduced-motion: reduce`에서:

## Remove

- parallax
- shared-element transform
- large clip reveal
- spring/bounce
- price digit roll
- scroll-linked transform
- repeated shimmer

## Replace

- opacity 80–140ms
- instant state update
- static skeleton
- direct content replacement

## Keep

- focus
- selected state
- error
- progress meaning
- loading meaning
- confirmation text

정보 의미는 그대로 유지.

---

# 40. Touch / Pointer Differences

## Hover

Pointer device에서만.

```css
@media (hover: hover) and (pointer: fine)
```

## Mobile

hover simulation 금지.

대신:

- pressed state
- selection state
- sheet transitions

사용.

---

# 41. CSS Motion Tokens

예시:

```css
:root {
  --mw-motion-instant: 80ms;
  --mw-motion-fast: 140ms;
  --mw-motion-control: 200ms;
  --mw-motion-component: 280ms;
  --mw-motion-panel: 360ms;
  --mw-motion-section: 480ms;
  --mw-motion-page: 620ms;
  --mw-motion-cinematic: 820ms;

  --mw-ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --mw-ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
  --mw-ease-exit: cubic-bezier(0.4, 0, 1, 1);
  --mw-ease-cinematic: cubic-bezier(0.22, 1, 0.36, 1);
}
```

Reduced Motion:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --mw-motion-instant: 0ms;
    --mw-motion-fast: 80ms;
    --mw-motion-control: 100ms;
    --mw-motion-component: 120ms;
    --mw-motion-panel: 120ms;
    --mw-motion-section: 120ms;
    --mw-motion-page: 120ms;
    --mw-motion-cinematic: 120ms;
  }
}
```

실제 implementation detail은 framework 선택 후 조정 가능하나
체감 hierarchy는 유지한다.

---

# 42. Motion Component API Guidance

권장 공통 abstraction:

```text
MotionPage
Reveal
SharedVisual
AnimatedValue
AnimatedPrice
AnimatedPresence
MotionDialog
MotionSheet
MotionImage
RecruitmentMotion
VoiceMotionState
```

페이지별로 독자적인 raw animation을 작성하기보다
공통 primitive를 조합한다.

---

# 43. Animation Ownership

## Design System owns

- timing tokens
- easing
- primitive enter/exit
- focus/hover/press
- dialog/sheet
- skeleton shimmer
- common reveal

## Domain components own

- recruitment progress
- couple progress
- price update
- Style selection choreography
- Voice applied feedback

## Page owns

- section choreography
- shared Hero transition
- page-specific sequencing

---

# 44. Anti-Patterns

## AP-M01 — Everything fades up

모든 텍스트와 버튼이 같은 fade-up으로 등장하는 것.

## AP-M02 — Infinite motion everywhere

ambient floating / breathing / pulsing이 여러 곳에 동시에 존재.

## AP-M03 — Bounce luxury

모든 선택이 spring bounce.

## AP-M04 — Hover lift abuse

카드마다 `translateY(-8px)`.

## AP-M05 — Full-screen loading animation

데이터가 올 때까지 브랜드 animation을 강제로 보게 함.

## AP-M06 — Delayed usability

animation이 끝나야 interaction 가능.

## AP-M07 — Layout jump disguised as motion

height auto transition을 남발해 주변 UI가 흔들림.

## AP-M08 — Different easing per developer

component마다 임의 bezier 사용.

## AP-M09 — Scroll hijacking

wheel/scroll을 가로채서 section snapping 강제.

## AP-M10 — Cursor gimmick

custom cursor / magnetic button을 core interaction에 사용.

---

# 45. Motion QA Checklist

## Global

- [ ] animation 이유가 설명 가능한가?
- [ ] 동시에 경쟁하는 큰 motion이 없는가?
- [ ] interaction이 animation 때문에 지연되지 않는가?
- [ ] 60fps에 가까운가?
- [ ] motion queue가 쌓이지 않는가?
- [ ] browser back/forward를 방해하지 않는가?
- [ ] reduced-motion에서 의미가 유지되는가?

## Navigation

- [ ] forward/back 방향이 일관적인가?
- [ ] shared Hero 실패 시 fallback이 있는가?
- [ ] direct URL에서도 정상 진입 가능한가?

## Selection

- [ ] selected state는 animation 종료 전에도 식별 가능한가?
- [ ] rapid selection에도 최종 state가 정확한가?
- [ ] summary는 바뀐 부분만 transition하는가?

## Loading

- [ ] skeleton shimmer가 과하게 밝지 않은가?
- [ ] data가 준비되면 즉시 표시되는가?
- [ ] layout shift가 없는가?

## Success / Progress

- [ ] 모집 상태 animation이 실제 Backend state와 일치하는가?
- [ ] success animation 때문에 next action이 늦어지지 않는가?
- [ ] confetti/gimmick 없이도 완료감이 있는가?

---

# 46. CP4 Decision Log

## D-401 — Motion hierarchy fixed

8단계 duration token을 확정했다.

## D-402 — Four easing roles fixed

standard / enter / exit / cinematic.

## D-403 — Spring is limited

soft / settle 두 역할만 사용.

## D-404 — Shared Hero is a signature motion

Home/Tours → Tour Detail에서만 특별하게 사용.

## D-405 — Page transitions are restrained

일반 route는 400ms 안팎 체감.

## D-406 — Scroll reveal is one-time by default

반복 등장 animation 금지.

## D-407 — Summary updates are local

Configure에서 전체 Summary를 매번 다시 animate하지 않는다.

## D-408 — Price uses previous-to-next transition

0부터 count-up 금지.

## D-409 — Recruitment confirmation is signature state motion

일반 Tour / Honeymoon을 별도 choreography로 정의.

## D-410 — Reservation success is short cinematic completion

화려한 particle/confetti는 사용하지 않는다.

## D-411 — Skeleton shimmer is slow and low contrast

Reduced Motion에서는 static.

## D-412 — Voice UI state machine defined

Idle / Listening / Processing / Recognized / Applied / NotUnderstood / Error.

## D-413 — Motion is interruptible

Animation queue를 허용하지 않는다.

## D-414 — Reduced Motion contract fixed

Parallax/shared transform/springs 제거,
opacity/instant transition으로 대체.

---

# 47. CP4 Acceptance Checklist

## Tokens

- [x] duration tokens
- [x] easing tokens
- [x] spring presets
- [x] reduced-motion timing

## Navigation

- [x] standard forward/back
- [x] shared Hero transition
- [x] fallback behavior
- [x] direct-link compatibility

## Content

- [x] Hero reveal
- [x] scroll reveal
- [x] editorial image reveal
- [x] parallax
- [x] card hover
- [x] link motion

## Interaction

- [x] buttons
- [x] Style selection
- [x] option selection
- [x] schedule selection
- [x] live summary
- [x] price/value

## Status

- [x] general recruitment
- [x] honeymoon couple progress
- [x] Reservation submit
- [x] Reservation success

## Overlay

- [x] dialog
- [x] bottom sheet
- [x] auth
- [x] post-login history popup

## Data

- [x] progressive image
- [x] skeleton shimmer
- [x] retry
- [x] empty/error

## Voice

- [x] state machine
- [x] listening
- [x] processing
- [x] applied
- [x] fallback

## Quality

- [x] performance budget
- [x] interruption rules
- [x] touch/pointer distinction
- [x] anti-patterns
- [x] motion QA checklist

**CP4 Status: COMPLETE**

---

# 48. Next Checkpoint

## CP5 — UI State System

다음 문서:

`06-UI-STATES.md`

CP5에서 확정할 것:

- screen별 Loading / Success / Empty / Error / Retrying
- component별 state matrix
- optimistic / pessimistic mutation 기준
- stale data
- partial failure
- image failure
- offline / connection issue
- submit retry
- duplicate submit prevention
- skeleton mapping
- error recovery
- empty content copy
- not-found
- unauthorized / expired auth
- data refresh
- pending recruitment update
- API latency simulation 기준
- 상태별 motion 연결
- 상태별 QA acceptance

CP4까지가 “정상 상황에서 어떻게 움직이는가”를 고정했다면,
CP5는 **데이터가 늦고, 없고, 실패하고, 다시 살아날 때까지 화면이 어떻게 완성도를 유지하는가**를 잠그는 단계다.
