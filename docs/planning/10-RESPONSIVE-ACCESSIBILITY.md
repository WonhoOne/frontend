# Mister World Frontend Responsive & Accessibility

> **CURRENT IMPLEMENTATION NOTICE — 2026-09-30**  
> Shared implementation baseline is **v0.1.2**. Current execution policy lives in `docs/implementation/IMPLEMENTATION-MASTER-PLAN.md`. Any older H-03 text that treats Honeymoon couple semantics as unresolved is superseded.


> Document: `10-RESPONSIVE-ACCESSIBILITY.md`  
> Status: **CP9 Complete**  
> Scope: all 11 customer-facing screens  
> Planning baseline: 2026-09-29  
> Depends on:
> - `03-VISUAL-DIRECTION.md`
> - `04-DESIGN-SYSTEM.md`
> - `05-MOTION-SYSTEM.md`
> - `06-UI-STATES.md`
> - `07-SCREEN-SPECS.md`
> - `08-COMPONENT-ARCHITECTURE.md`
> - `09-DATA-AND-API-UX.md`

---

# 0. CP9 Objective

CP9은 Mister World Frontend가 특정 Desktop 해상도에서만 “예쁘게 보이는 화면”이 아니라,
**작은 모바일, 큰 데스크톱, 키보드, 터치, 확대, 스크린리더, reduced-motion 환경에서도 기능이 유지되는지**를 전체 11개 화면 기준으로 잠그는 단계다.

완료 기준:

> 모든 Screen Spec이 Desktop/Mobile뿐 아니라 breakpoint 전환, viewport 극단값, sticky/fixed 충돌, keyboard/focus, dialog/sheet, text scaling, safe-area, orientation, reduced motion까지 구현 가능한 수준으로 명시되어 있어야 한다.

---

# 1. Supported Layout Classes

CP3에서 확정한 breakpoint token을 유지한다.

```text
sm   640
md   768
lg   1024
xl   1280
2xl  1440
```

이 값은 “기기 이름”이 아니라 layout 전환점이다.

원칙:

```text
Mobile-first
→ content pressure가 생길 때 layout 확장
→ 기기 모델별 CSS 분기 금지
```

---

# 2. Viewport Test Matrix

구현/QA 시 최소 다음 폭을 검증한다.

```text
320
360
390
430
768
1024
1280
1440
1728+
```

각 width에서 최소 확인:

```text
horizontal overflow
text clipping
CTA visibility
sticky overlap
image crop
dialog/sheet fit
focus visibility
safe-area
```

---

# 3. Extreme Width Rules

## 320px

- 핵심 UI가 사용 가능해야 함
- 2-column 강제 금지
- fixed width card 금지
- CTA label wrap이 기능을 깨면 안 됨
- navigation control이 최소 44×44px 유지

## 1728px+

- content container 최대 폭 유지
- body text line-length 무한 확장 금지
- Hero image는 viewport를 채울 수 있지만 copy는 constrained
- card가 지나치게 넓어져 정보 밀도가 깨지지 않게 함

---

# 4. Container Rules

CP3 container 기준을 유지한다.

```text
wide         1440
main         1280
transaction  1180
reading       760
auth          520
```

Page component가 임의 max-width를 새로 만들지 않는다.

예외가 필요하면 token 승격 여부를 먼저 검토한다.

---

# 5. Grid Rules

```text
Desktop  12 columns / 24px gutter
Tablet    8 columns / 20px gutter
Mobile    4 columns / 16px gutter
```

Grid는 시각적 기준이다.

DOM order는 visual positioning 때문에 바뀌지 않는다.

---

# 6. Responsive Transformation Principle

좋은 responsive:

```text
same information
same task
different composition
```

나쁜 responsive:

```text
Desktop 기능 일부 삭제
Mobile에서 중요한 정보 숨김
```

Mobile은 Desktop의 “축소판”이 아니다.

---

# 7. Breakpoint Ownership

Shared primitive가 자체 breakpoint를 과도하게 소유하지 않는다.

구분:

```text
Primitive
→ intrinsic sizing

Domain component
→ component-specific adaptation

Page
→ macro layout transformation
```

예:

`Button`은 mobile/desktop page 여부를 몰라도 된다.

`ConfigurePage`가 1024px 이상에서 right sticky summary를 선택한다.

---

# 8. Typography Scaling

CP3 type scale을 유지하되 viewport에 따라 preset을 전환한다.

Desktop:

```text
display-2xl 96
display-xl  72
display-lg  56
```

Mobile:

```text
display-2xl 58
display-xl  48
display-lg  40
```

금지:

```text
font-size: 8vw
```

같이 예측 불가능한 fluid scale만 의존.

필요하면 `clamp()`를 사용하더라도 CP3 token 범위 안에서 작동해야 한다.

---

# 9. Text Scaling / Browser Zoom

최소 목표:

```text
200% browser zoom
```

에서 핵심 task 수행 가능.

확인:

- text clipping 없음
- horizontal page scroll 없음
- CTA 접근 가능
- modal content scroll 가능
- fixed bottom bar가 content를 덮지 않음
- form label/error가 사라지지 않음

픽셀 높이를 고정해 text overflow를 잘라내는 구현 금지.

---

# 10. Line Length

본문:

```text
약 45–75 characters equivalent
```

범위의 읽기 쉬운 width를 지향.

Hero headline은 더 짧게 유지.

긴 한국어 문장이 wide screen 전체를 가로지르지 않게 한다.

---

# 11. Image Responsive Rules

공통 `ImageFrame`이 소유:

```text
aspect ratio
object-fit
focal-position
placeholder
failure
```

Feature가 소유:

```text
meaning
alt
theme tone
```

Mobile에서 Hero는 별도 focal crop 허용.

중요한 인물/피사체를 임의로 잘라 의미가 훼손되지 않게 asset별 focal data를 둘 수 있다.

---

# 12. Responsive Image Loading

가능하면:

```text
srcset
sizes
modern image format
```

사용.

Hero와 card에 desktop 원본 이미지를 그대로 mobile에 강제 다운로드하지 않는다.

이미지 품질 저하는 visual QA 대상.

---

# 13. Safe Area

모바일 fixed/sticky UI:

```css
env(safe-area-inset-top)
env(safe-area-inset-bottom)
```

고려.

대상:

```text
mobile navigation
Configure bottom summary
Reservation submit bar
bottom sheet
full-height popup
```

---

# 14. Orientation

Portrait가 기본이어도 landscape에서 사용 불능이면 안 된다.

특히 mobile landscape에서:

```text
dialog/sheet height
software keyboard
sticky bars
hero min-height
```

검증.

`100vh` 의존 금지.

가능하면:

```text
svh / dvh
```

의미에 맞게 사용.

---

# 15. Software Keyboard

Login / Signup / 향후 participant/input UI에서 필수 검증.

Rules:

- focused field가 keyboard 뒤에 숨지 않음
- submit CTA가 접근 불가능해지지 않음
- form region scroll 가능
- fixed bottom CTA와 keyboard collision 처리
- focus 이동 시 layout jump 최소화

---

# 16. Touch Target

기본 최소:

```text
44 × 44px
```

주요 mobile CTA:

```text
48–56px height
```

아이콘만 있는 control:

```text
visual glyph가 작아도 hit area는 44×44px 이상
```

---

# 17. Pointer vs Touch Interaction

Hover는 enhancement다.

필수 정보/기능을 hover에 숨기지 않는다.

```text
fine pointer
→ hover animation 허용

coarse pointer
→ hover dependency 없음
```

Tooltip 없이는 이해할 수 없는 primary action 금지.

---

# 18. Keyboard Navigation Global Rules

모든 interactive UI:

```text
Tab
Shift+Tab
Enter
Space when semantic
Escape for dismissible overlays
Arrow keys where radio/listbox semantics demand
```

로 사용 가능해야 한다.

Custom div click component 금지.

---

# 19. Focus Visible

기본:

```text
2px accent ring
3px offset
```

CP3 token 기준.

금지:

```css
outline: none;
```

만 하고 대체 focus 표시 없는 구현.

Focus ring은 background/image 위에서도 보이도록 한다.

---

# 20. Focus Order

DOM order = logical task order.

CSS grid/flex `order`로 시각 순서만 바꾸고
keyboard 순서가 뒤섞이는 구조 금지.

특히:

```text
Home asymmetric layout
Tours 2-column layout
Configure sticky summary
```

에서 필수.

---

# 21. Skip Link

Global shell에:

```text
본문으로 건너뛰기
```

skip link 제공 권장.

Keyboard focus 시 표시.

Destination:

```text
<main id="main-content">
```

---

# 22. Heading Hierarchy

각 route-level page:

```text
H1 exactly one
```

Section:

```text
H2
```

Subsection:

```text
H3
```

visual size와 semantic heading level을 혼동하지 않는다.

예:

큰 eyebrow가 H1일 필요 없음.

---

# 23. Landmark Rules

권장:

```text
<header>
<nav>
<main>
<aside>
<footer>
```

`aside`는 Configure Summary처럼 실제 보조 콘텐츠일 때 사용.

여러 nav가 있으면 accessible label 구분.

---

# 24. Link vs Button

Link:

```text
navigation
```

Button:

```text
action/state change
```

금지:

```text
<button onClick={() => navigate(...)}>
```

를 모든 navigation에 무조건 사용하는 것.

router link semantic을 우선.

---

# 25. Form Labels

Placeholder는 label이 아니다.

모든 field:

```text
visible label
programmatic association
```

필수.

Error:

```text
aria-describedby
```

등으로 연결.

---

# 26. Required and Invalid State

Required는:

```text
asterisk color
```

만으로 표현하지 않는다.

Programmatic required state 필요.

Invalid:

```text
border red only
```

금지.

text error + state semantics 함께 사용.

---

# 27. Error Summary

복수 field submit error가 생기는 화면에서 필요 시:

```text
오류 요약
→ first invalid field link/focus
```

사용.

현재 핵심 후보:

```text
Signup
future participant form
```

Configure는 group-level errors가 중심.

---

# 28. Screen Reader Async Announcements

Announce:

```text
important submit status
important validation result
schedule confirmed
price update when consequential
```

Do not announce every:

```text
background refresh
image load
hover
minor skeleton swap
```

`aria-live="polite"`를 남발하지 않는다.

---

# 29. Status Not Color-Only

다음 상태는 text/icon/shape를 함께 사용.

```text
selected
disabled
invalid
confirmed
recruiting
success
error
```

예:

`green dot`만으로 Confirmed 전달 금지.

---

# 30. Contrast

CP3 baseline:

```text
normal text  >= 4.5:1
large text   >= 3:1
```

추가 검증:

- image overlay text
- muted secondary text
- disabled text
- accent border
- focus ring
- status badge

실제 image가 정해지면 Hero contrast 재검증 필수.

---

# 31. Disabled Contrast

Disabled를 단순 opacity `0.3`으로 만들지 않는다.

Readable label 유지.

Disabled 이유가 중요한 경우 helper text 제공.

특히:

```text
Configure Review CTA
Tour Detail Configure CTA
```

---

# 32. Reduced Motion

`prefers-reduced-motion: reduce`

에서 제거:

```text
parallax
shared-element transform
spring overshoot
digit roll
large translate
skeleton shimmer
```

유지:

```text
state change
focus
selection
success/error meaning
```

대체:

```text
instant
or
80–140ms opacity
```

---

# 33. Motion and Vestibular Safety

대형 background zoom, parallax, scroll-linked motion은 제한적으로.

다음은 금지:

```text
continuous floating
cursor-following scene
scroll hijack
large perspective rotation
```

---

# 34. Dialog Accessibility

Dialog:

- semantic dialog
- accessible label
- `aria-modal`
- focus trap
- open 시 적절한 initial focus
- Escape close if non-destructive
- close 후 trigger에 focus return
- background inert

대상:

```text
Login desktop modal
Previous Trips desktop popup
confirmation dialog if introduced
```

---

# 35. Bottom Sheet Accessibility

Bottom Sheet도 modal일 경우 Dialog semantics를 가진다.

Swipe gesture만으로 close하지 않는다.

반드시:

```text
Close button
or
clear dismiss action
```

제공.

대상:

```text
Configure mobile summary
Previous Trips mobile
```

---

# 36. Nested Modal Prohibition

한 번에 focus trap 2개 금지.

특히:

```text
Login
→ Previous Trips Popup
```

은 순차.

Configure Summary Sheet 위에 다른 modal이 뜨면
기존 sheet를 먼저 정리하는 정책 필요.

---

# 37. Toast Accessibility

Toast는:

```text
minor non-blocking confirmation
```

용.

Critical error는 toast-only 금지.

Toast announcement는 짧게.

사용자가 읽기 전에 사라지는 critical content 금지.

---

# 38. Skeleton Accessibility

Skeleton은 보통 screen reader에 숨긴다.

대신 container 수준에서 필요한 경우:

```text
불러오는 중
```

status 제공.

skeleton rectangle 하나하나를 읽게 하지 않는다.

---

# 39. Empty/Error Accessibility

Empty/Error state:

```text
heading
message
recovery action
```

구조.

Retry button은 keyboard/touch accessible.

Error가 발생했다고 focus를 무조건 강제로 이동시키지 않는다.
사용자 action 직후의 validation이면 관련 위치 이동 가능.

---

# 40. Home Responsive Audit

## Desktop

```text
cinematic hero
asymmetric editorial theme layout
```

## Tablet

- 12-column composition을 8-column으로 단순화
- 극단적 overlap 금지
- large/medium card hierarchy는 유지 가능

## Mobile

```text
Theme cards 1-column
no carousel
```

## Accessibility

- H1 hero headline
- visual asymmetry와 DOM order 동일 의미
- Theme card accessible name에 Theme
- Hero contrast asset별 검증
- shared transition reduced-motion fallback

**Status: PASS**

---

# 41. Tours Responsive Audit

## Desktop

2-column curated comparison.

## Tablet

폭이 충분하면 2-column,
content pressure 시 1-column.

정확한 breakpoint는 component intrinsic test로 최종 조정하되
`md/lg` token 범위 안에서 결정.

## Mobile

1-column.
4 Theme/TourProduct discovery 항목을 숨기지 않는다.

## Accessibility

- card가 하나의 clear link target
- visual order = DOM order
- style availability color-only 금지

**Status: PASS**

---

# 42. Tour Detail Responsive Audit

## Desktop

```text
Hero
editorial alternating sections
2/3-column Style choices
Schedule cards
```

## Tablet

- alternating layout 단순화
- copy/image 비율 재조정
- sticky behavior 없음

## Mobile

- all sections 1-column
- Style cards stacked
- Schedule cards stacked
- bottom Configure action 가능

## Accessibility

Tour Style:

```text
radiogroup-like semantics
```

Schedule:

```text
single-choice semantics
```

Recruitment:

```text
text alternative mandatory
```

**Status: PASS — Honeymoon semantics aligned with Shared Baseline v0.1.2**

---

# 43. Configure Responsive Audit

가장 중요한 responsive screen.

## >= 1024

```text
left configuration
right sticky summary
```

## < 1024

sticky side summary 제거.

## Mobile

```text
1-column options
persistent bottom summary/action
summary bottom sheet
```

## Collision Rules

- bottom bar가 마지막 option을 가리지 않음
- software keyboard 등장 시 fixed bar 정책 조정
- bottom sheet + keyboard simultaneous state 테스트
- safe area bottom padding

## Accessibility

- OptionCard single select = radio-like
- Extras multi-select = checkbox-like when contract says so
- sticky summary DOM은 controls 뒤에
- validation control association

**Status: PASS**

---

# 44. Reservation Review Responsive Audit

## Desktop

main review + restrained summary.

## Mobile

single-column + bottom submit.

## Accessibility

- Change action accessible name에 대상 포함
- validation summary 가능
- submit status announcement
- persistent CTA safe-area

Payment UI 없음.

**Status: PASS**

---

# 45. Reservation Success Responsive Audit

## Desktop

centered restrained composition.

## Mobile

single-column,
CTA stack.

## Accessibility

- H1 success
- recruitment text alternative
- success icon alone does not carry meaning
- Back history가 duplicate submit을 유발하지 않음

**Status: PASS**

---

# 46. Reservation Detail Responsive Audit

## Desktop

status/config 2-region 가능.

## Tablet/Mobile

status first,
configuration below.

## Accessibility

- status badge text
- recruitment text
- no inaccessible fake cancel control
- stale status understandable

**Status: PASS**

---

# 47. Login Responsive Audit

## Desktop in-app

dialog.

## Desktop direct

page.

## Mobile

full-screen/sheet.

## Critical

software keyboard,
focus trap,
focus return,
Enter submit,
Escape close,
visible labels.

Credential field contract는 여전히 Shared Contract gate.

**Status: PASS**

---

# 48. Signup Responsive Audit

## Desktop

auth page, optional visual + form.

## Mobile

single-column.

## Critical

- long address
- software keyboard
- error association
- text zoom
- no credentials persistence

**Status: PASS**

---

# 49. Previous Trips Popup Responsive Audit

## Desktop

large dialog:

```text
640–720px
```

## Mobile

full-height / near-fullscreen sheet.

Long history:

```text
list region scroll
header/action reachable
```

## Accessibility

- semantic list
- dialog label
- focus trap/return
- Close explicit
- metadata labels understandable

**Status: PASS**

---

# 50. My Trips Responsive Audit

## Desktop

single-column wide archive.

## Mobile

single-column cards.

No hidden Upcoming/Past tabs.

## Accessibility

- history semantic list
- recent-first DOM
- non-interactive item에 button semantics 없음
- metadata labels

**Status: PASS**

---

# 51. Global Header Responsive Rules

Desktop:

```text
brand
Tours
My Trips
Account/Login
```

Mobile:

- compact brand
- menu/account control
- menu sheet/dialog semantics

Header가 Hero overlay일 경우 contrast check.

Scroll 후 solid state에서도 focus visibility 유지.

---

# 52. Transaction Header Responsive Rules

Desktop:

```text
Back / context
Brand
minimal utility
```

Mobile:

```text
Back
short context
```

긴 Theme/Product title 때문에 control이 밀리지 않게:

- ellipsis 가능
- accessible full name 별도 유지

---

# 53. Footer Responsive Rules

Footer navigation은 semantic nav.

Mobile에서 link가 너무 촘촘하지 않게.

회사/법률 정보를 현재 요구사항 없이 임의 추가하지 않는다.

---

# 54. Sticky Element Inventory

현재 sticky/fixed 후보:

```text
GlobalHeader
Configure desktop summary
Configure mobile summary bar
Reservation Review mobile submit
Dialog/Sheet headers/actions
```

각 화면에서 동시에 활성 sticky layer 수를 최소화.

예:

```text
mobile header
+ bottom CTA
```

가능.

하지만:

```text
header
+ sticky section tabs
+ sticky summary
+ floating voice
+ toast
```

처럼 viewport를 과점유하지 않는다.

---

# 55. Fixed UI Collision Budget

작은 모바일에서 상/하단 fixed UI가 합쳐
content viewport를 과도하게 줄이지 않게 한다.

권장:

- top fixed ~56–64px
- bottom CTA ~64–80px incl. safe-area
- 나머지 floating control 최소화

Voice control이 추가되면 bottom CTA와 collision audit 필수.

---

# 56. Voice Accessibility

Voice는 GUI의 대체/보조 입력 방식이다.

필수:

- Listening 상태 text equivalent
- Processing state
- Recognized text when appropriate
- Not understood
- Error
- Cancel/stop keyboard/touch path
- GUI fallback

waveform 자체는 의미를 독점하지 않는다.

---

# 57. Screen Reader and Voice Separation

Screen reader user에게 Voice Recognition을 자동 시작하지 않는다.

Voice control과 screen reader accessibility는 별개.

Microphone permission prompt를 페이지 진입만으로 호출하지 않는다.

---

# 58. Responsive Tables

현재 고객 핵심 화면에 data table은 기본적으로 없음.

향후 table이 생기면 mobile에서 단순 horizontal overflow만 강제하지 않고
semantic/card transformation 검토.

---

# 59. Dynamic Content and Layout Shift

다음 변경에서 layout shift 최소화:

```text
price
recruitment
validation
image
history refresh
```

변경 영역 reserved space 사용.

단, 지나친 fixed height로 text zoom을 막지 않는다.

---

# 60. Long Localization / Korean Copy

테스트:

- 긴 Theme/Product 이름
- 날짜
- 가격
- error copy
- button label

규칙:

```text
2-line wrap 허용 가능한 제목
button은 의미 손실 없는 범위에서 width 확장
critical text ellipsis 금지
```

---

# 61. Numbers and Currency

가격:

- screen reader에서 통화 의미가 명확
- 시각적 digit animation이 reduced-motion에서 제거
- 숫자만 색으로 증감 의미 전달 금지

정확한 currency format은 Price contract가 정해지면 확정.

---

# 62. Date Accessibility

날짜 표시는 visually compact해도
screen reader가 의미 있게 읽을 수 있어야 한다.

실제 canonical date format은 API contract 후 확정.

기간:

```text
start – end
```

표현 시 의미 불명확한 숫자 축약만 사용하지 않는다.

---

# 63. Recruitment Semantics

General:

```text
현재 2명 신청, 출발 기준 3명
```

Honeymoon:

Shared Baseline v0.1.2에 따라:

```text
participantCount >= 2 and even
coupleCount = participantCount / 2
```

유효한 Honeymoon participant count에 대해서는 couple/team text를 사용할 수 있다.
단 `Couple` / `Team`은 별도 Shared Entity가 아니며,
최종 TourSchedule confirmed truth는 Backend가 소유한다.

---

# 64. Loading Announcement

긴 로딩에서 필요하면:

```text
aria-busy
```

또는 container-level status 활용.

`Loading...`를 여러 section에서 동시에 live announce하지 않는다.

---

# 65. Focus After Navigation

Route navigation 후 기본:

```text
main heading or main container
```

로 focus strategy를 검토.

SPA에서 이전 button focus가 사라진 채 body로 떨어지는 문제를 방지.

단, browser back으로 기존 화면 복구 시
이전 meaningful focus/scroll context 복원 가능.

---

# 66. Focus After Error

예:

Reservation Submit 422:

- Summary 전체가 아니라 first invalid region으로 이동 가능
- error heading/field association
- user가 현재 선택을 잃지 않음

Network error:

focus 강제 이동보다 error region이 자연스럽게 reachable하면 충분.

---

# 67. Focus After Modal Close

Login:

```text
close
→ login trigger or initiating action
```

Previous Trips:

```text
close
→ login-return context의 meaningful control
```

Configure Summary:

```text
close
→ summary trigger
```

---

# 68. Focus After Success

Reservation Success 진입:

- page H1로 route focus 이동
- submit button focus를 hidden prior page에 남기지 않음

---

# 69. Browser Back

Back은 접근성 기능이기도 하다.

다음 유지:

```text
scroll
draft
selection
focus when reasonable
```

사용자가 매번 페이지 맨 위로 돌아가 다시 탐색하게 하지 않는다.

---

# 70. Scroll Restoration

권장:

```text
Home → Tour Detail → Back
→ previous Home scroll position

Tours → Tour Detail → Back
→ selected card vicinity
```

Transaction:

```text
Review → Configure → Back
→ relevant section / previous position
```

---

# 71. Scroll to Error

자동 scroll은:

```text
submit
→ first blocking invalid region
```

처럼 사용자가 원인을 찾기 어려운 경우만.

background validation 변화마다 자동 scroll 금지.

---

# 72. Screen Magnification

200% zoom에서:

- dialog max-height viewport-relative
- bottom sheet scroll 가능
- sticky side summary는 필요하면 non-sticky
- card text가 겹치지 않음

Breakpoint는 CSS pixel 기준이므로 zoom에 따라 desktop layout이 mobile-like로 바뀌어도 정상이다.

---

# 73. High Contrast / System Colors

가능한 한:

- state가 background color만 의존하지 않음
- border/marker/text 유지
- icon `currentColor` 활용

forced-colors 환경 지원 가능성을 고려.

최종 구현 QA에서 별도 확인.

---

# 74. Reduced Transparency

Glass 효과가 일부 쓰일 수 있어도
정보 전달에 blur/transparency가 필수이면 안 된다.

브라우저/OS가 blur를 제대로 처리하지 않아도 text/background contrast 확보.

---

# 75. Content Reflow

좁은 화면에서:

```text
horizontal reading scroll
```

없이 content가 reflow되어야 한다.

예외:

- 실제 이미지 gallery 등 명시적 horizontal interaction

현재 핵심 화면에는 필수 horizontal scroll 없음.

---

# 76. Z-Index Accessibility Risk

CP3 z-index:

```text
0
10
20
40
50
80
90
100
```

사용.

높은 overlay가 실제 focus target을 가리는데 keyboard focus는 뒤에 남는 상태 금지.

Modal open 시 background interaction 비활성화.

---

# 77. Pointer Cancellation

Touch CTA는 `pointerdown` 순간 irreversible action을 실행하지 않는다.

Reservation submit 같은 action은
정상 click/activation 완료 후 실행.

---

# 78. Accidental Activation

mobile bottom CTA와 system gesture 영역 사이 safe spacing.

Destructive action은 현재 거의 없지만
향후 추가 시 confirmation/spacing 별도 검토.

---

# 79. Form Autofill

Auth contract가 정해지면 적절한:

```text
autocomplete
```

사용.

현재 field type을 추정하여 잘못된 autocomplete token을 고정하지 않는다.

확정된 profile fields:

```text
name
address
contact
```

는 실제 input subtype 계약에 맞게 설정.

---

# 80. Error Copy Language

Screen reader와 시각 사용자 모두 이해 가능한 짧은 문장.

금지:

```text
Error 422
Invalid entity
Oops
```

User task 중심:

```text
선택한 일정이 변경되었습니다.
최신 일정을 다시 선택해주세요.
```

---

# 81. Responsive/A11y Component Test Requirements

Shared UI 최소 테스트:

```text
Button keyboard
Dialog focus trap
BottomSheet close
OptionCard radio semantics
Checkbox semantics
TextField label/error
focus-visible
reduced-motion branch
```

---

# 82. Page Accessibility Integration Tests

최소:

```text
Home heading/landmark
Tour Detail Style keyboard selection
Configure complete by keyboard
Review error focus
Login modal focus return
Previous Trips dialog semantics
My Trips history reading order
```

---

# 83. Automated Tooling

실제 scaffold 단계에서 검토:

```text
eslint jsx-a11y
axe-core / testing integration
browser accessibility tree inspection
Lighthouse as supplemental signal
```

자동 점수만으로 PASS 판정하지 않는다.

Manual keyboard/screen-reader-style inspection이 필요하다.

---

# 84. Manual QA Matrix

각 주요 화면에서 최소:

```text
Mouse
Keyboard only
Touch/mobile emulation
200% zoom
Reduced Motion
Slow network
Long copy
Image failure
```

확인.

Auth/Form 화면은 software keyboard까지.

---

# 85. Screen-Level Final Matrix

| Screen | Mobile | Tablet | Desktop | Keyboard | Focus | Screen Reader | Zoom | Reduced Motion | Status |
|---|---|---|---|---|---|---|---|---|---|
| Home | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | Ready |
| Tours | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | Ready |
| Tour Detail | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | Ready* |
| Configure | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | Ready* |
| Reservation Review | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | Ready |
| Reservation Success | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | Ready* |
| Reservation Detail | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | Ready* |
| Login | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | Ready* |
| Signup | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | Ready* |
| Previous Trips Popup | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | Ready* |
| My Trips | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | Ready* |

`Ready*`:

Shared Contract가 필요한 실제 data semantics는 여전히 CP6-H/CP8 gate를 따른다.
Responsive/A11y 설계 자체는 Ready.

---

# 86. Accessibility Contract Gates

Accessibility 구현을 막는 Shared Contract 항목:

```text
Auth credential field type
participantCount control placement
Honeymoon couple/team official semantics
price/currency exact format
Travel History exact dates/IDs
Voice final command payload
```

이들은 의미/label을 최종화하는 데 영향을 주지만
현재 구조 구현을 막지는 않는다.

---

# 87. Responsive Contract Gates

Responsive 구조를 실질적으로 막는 Backend contract는 거의 없다.

다만 실제 data volume에 따라 재검토:

```text
TourProducts per Theme
Hotel/Transport/Meal option count
History list length/pagination
```

현재 설계는 긴 content를 수용하도록 만들어야 한다.

---

# 88. Anti-Patterns

## R-A01
Desktop을 transform: scale()로 줄여 mobile 구현.

## R-A02
mobile에서 핵심 content 숨김.

## R-A03
hover-only navigation.

## R-A04
fixed height text card.

## R-A05
100vh로 mobile keyboard/safe-area 무시.

## R-A06
sticky header + sticky tabs + sticky CTA 과적재.

## A11Y-A01
div onClick button.

## A11Y-A02
placeholder-only form.

## A11Y-A03
outline none.

## A11Y-A04
color-only state.

## A11Y-A05
ARIA로 잘못된 native semantics 덮기.

## A11Y-A06
modal focus trap 없음.

## A11Y-A07
animation을 정보 자체로 사용.

## A11Y-A08
screen reader에 skeleton item 수십 개 읽힘.

## A11Y-A09
backend raw error 그대로 출력.

## A11Y-A10
fake disabled button without reason.

---

# 89. CP9 Decision Log

## D-901
Breakpoints remain 640 / 768 / 1024 / 1280 / 1440.

## D-902
320px is the minimum narrow-width stress target.

## D-903
200% zoom task completion is required.

## D-904
Touch target minimum is 44×44px.

## D-905
Mobile is a layout transformation, not a reduced feature set.

## D-906
Configure side summary switches away below 1024px.

## D-907
Focus order follows DOM/task order, not visual positioning.

## D-908
Global skip link is recommended.

## D-909
Route navigation requires SPA focus management.

## D-910
Dialogs and modal sheets trap focus and return focus.

## D-911
Nested focus traps are prohibited.

## D-912
All status states must have non-color representation.

## D-913
Reduced motion removes parallax/shared transforms/shimmer.

## D-914
Software keyboard collision is a required Auth/Form test.

## D-915
Safe-area handling is mandatory for mobile fixed bottom UI.

## D-916
History popup on mobile is full-height/near-fullscreen rather than a tiny dialog.

## D-917
Long content and text scaling override visual fixed-height ambitions.

## D-918
Automated accessibility scoring is supplemental, not the final QA.

---

# 90. CP9 Acceptance Checklist

## Responsive

- [x] breakpoints locked
- [x] viewport matrix defined
- [x] narrow/wide extremes
- [x] grid/container rules
- [x] typography scaling
- [x] images
- [x] safe area
- [x] landscape
- [x] software keyboard
- [x] sticky collision
- [x] text zoom/reflow

## Input

- [x] mouse
- [x] keyboard
- [x] touch
- [x] pointer/coarse-pointer split
- [x] focus-visible
- [x] focus order
- [x] pointer cancellation

## Semantics

- [x] headings
- [x] landmarks
- [x] link/button
- [x] forms
- [x] status
- [x] async announcements
- [x] history lists
- [x] radio/checkbox interaction

## Overlay

- [x] dialog focus trap
- [x] bottom sheet semantics
- [x] focus return
- [x] nested modal prohibition

## Visual Accessibility

- [x] contrast baseline
- [x] disabled state
- [x] color-independent status
- [x] reduced motion
- [x] reduced transparency compatibility
- [x] high-contrast consideration

## Screen Coverage

- [x] Home
- [x] Tours
- [x] Tour Detail
- [x] Configure
- [x] Reservation Review
- [x] Reservation Success
- [x] Reservation Detail
- [x] Login
- [x] Signup
- [x] Previous Trips Popup
- [x] My Trips

**CP9 Status: COMPLETE**

---

# 91. Next Checkpoint

## CP10 — QA & Acceptance

다음 문서:

```text
11-QA-ACCEPTANCE.md
```

CP10에서는 지금까지의 모든 계획을 실제 검증 가능한 QA contract로 바꾼다.

핵심:

```text
screen acceptance test
component state matrix
network simulation
contract-gate tests
responsive matrix
a11y manual tests
motion verification
visual regression
critical E2E journeys
defect severity
release gate
```

CP9이 “어떤 환경에서도 사용할 수 있게 설계했는가”를 끝냈다면,
CP10은 “그게 실제 구현에서 지켜졌다고 무엇으로 판정할 것인가”를 잠그는 단계다.
