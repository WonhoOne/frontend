# [S04] Tour Configuration

> File: `screens/04-configure.md`  
> Route / Trigger: `/tours/:tourId/configure`  
> CP6 Status: **Ready — CP6-C Complete**  
> Depends on:
> - `07-SCREEN-SPECS.md`
> - `01-PRODUCT-EXPERIENCE.md`
> - `02-INFORMATION-ARCHITECTURE.md`
> - `03-VISUAL-DIRECTION.md`
> - `04-DESIGN-SYSTEM.md`
> - `05-MOTION-SYSTEM.md`
> - `06-UI-STATES.md`
> - `screens/03-tour-detail.md`

---

# 1. Screen Purpose

Configure는 Mister World 고객 경험의 핵심 기능 화면이다.

사용자는 Tour Detail에서 선택한:

```text
Theme
+ Tour Style
+ Schedule
```

을 시작점으로 삼고, 최종 여행 구성을 직접 조정한다.

이 화면의 핵심 개념은 다음과 같다.

> **Tour Style은 출발점이고, Tour Configuration이 최종 선택이다.**

사용자는 Style 선택 이후에도 최소 다음을 변경할 수 있어야 한다.

```text
Hotel
Transport
Meal
```

또한 공통 계약에서 허용되는 경우 추가 옵션을 선택할 수 있다.

Configure는 여행의 감성적 설명보다 **정확한 선택, 현재 선택 상태, 변경 결과, 최종 요약**을 우선한다.

목표 인상:

> Premium Product Configurator

피해야 할 인상:

- SaaS 설정 페이지
- 관리 대시보드
- 긴 HTML form
- 쇼핑몰 옵션 드롭다운 나열

---

# 2. Route / Entry Conditions

## Route

```text
/tours/:tourId/configure
```

[FRONTEND PROPOSAL]

selection 복구를 위해 search parameter 또는 local/session draft를 사용할 수 있다.

예시:

```text
/tours/:tourId/configure?style=grand&schedule=:scheduleId
```

이 parameter 이름은 Frontend Route Proposal이며 Shared API Contract가 아니다.

## Valid Entry

Configure에 진입하려면 최소:

```text
valid Tour
selected Style
selected Schedule
```

가 필요하다.

## Entry Sources

Primary:

```text
Tour Detail
→ Configure this trip
```

Secondary:

- Browser Forward
- valid deep link with recoverable context
- Reservation Review에서 `Change configuration`

## Missing Context

### Missing Style

자동으로 임의 Style을 선택하지 않는다.

```text
여행 스타일을 먼저 선택해주세요.
[ 여행 상세로 돌아가기 ]
```

### Missing Schedule

```text
일정을 먼저 선택해주세요.
[ 여행 상세로 돌아가기 ]
```

### Invalid Style

예:

```text
Honeymoon + Classic
```

invalid query/context는 무시하고
Tour Detail로 돌아가 유효한 Style을 다시 선택하도록 한다.

### Invalid Schedule

schedule이 해당 Tour에 속하지 않거나 unavailable한 경우:

```text
선택한 일정을 사용할 수 없습니다.
[ 최신 일정 확인하기 ]
```

## Exit

Primary:

```text
Review trip
→ /reservation/review
```

Back:

```text
→ /tours/:tourId
```

Back 시:

- Style 유지
- Schedule 유지
- 가능하면 Detail scroll context 복원

다른 Theme로 이동하려는 경우,
의미 있는 Configuration 변경이 있으면 discard confirmation을 사용할 수 있다.

[FRONTEND PROPOSAL]

`dirty configuration`이 존재할 때:

```text
현재 여행 구성을 버리고 이동할까요?
```

단, 지나친 확인 dialog를 만들지 않는다.

---

# 3. User Goal

Primary goal:

> 선택한 Style을 바탕으로 Hotel / Transport / Meal을 바꿔 최종 여행 구성을 만든다.

Secondary goals:

- 현재 구성의 전체 내용을 한눈에 확인
- 변경이 최종 구성에 어떻게 반영되는지 즉시 이해
- 가격이 제공되는 경우 변경된 가격 확인
- 선택 불가능한 조합을 이해하고 수정
- 필요하면 Tour Detail로 돌아가 Style/Schedule 변경
- Voice 기능이 붙는 경우 음성으로 동일 선택 일부를 변경

---

# 4. Required Data

## Selected Context

[CONFIRMED concept]

- Tour identity
- Theme
- selected Tour Style
- selected Schedule

## Configurable Categories

[CONFIRMED]

최소:

```text
Hotel
Transport
Meal
```

## Extra Options

[CONFIRMED at source level]

원본 요구사항에는 식사와 함께 다음을 추가할 수 있는 내용이 있다.

```text
Champagne
Coffee
```

다만 실제 Extra Option 데이터 구조 및 적용 범위는 아직 공통 계약이 충분하지 않다.

[TBD]

- 어떤 Style/Theme에서 Champagne/Coffee를 선택할 수 있는지
- 별도 가격
- 중복/동시 선택 가능 여부
- Meal 자체의 포함 항목과 Extra의 구분

따라서 UI는 `Extras` section을 설계하되,
실제 option 목록은 Shared Contract를 따른다.

## Style Baseline

[CONFIRMED]

### Classic

```text
3-star hotel
lunch box
```

### Grand

```text
4-star hotel
local restaurant
```

### Premium

```text
5-star hotel
premium restaurant
steak
champagne
```

Configure에 처음 진입할 때
선택한 Style의 baseline을 초기 Configuration의 출발점으로 사용할 수 있다.

[BLOCKED BY SHARED CONTRACT]

정확한 option entity / IDs / mapping은 Domain/API v0.2 필요.

## Option Data Need

각 category에서 UI가 필요로 하는 정보:

```text
option identity
display name
short description
availability
selected/not selected
visual asset (optional)
price delta (if contract supports)
constraint/reason when disabled
```

field names는 임의 확정하지 않는다.

## Price

[TBD]

필요한 UI 개념:

```text
base/current total
option price delta
recalculation state
```

그러나:

- price formula
- frequent-customer discount threshold
- discount formula
- exact option pricing

은 미확정.

Frontend가 계산 rule을 독자적으로 만들지 않는다.

## Validation

[CONFIRMED principle]

Backend가 핵심 Business Rule의 최종 authority.

Frontend는 UX를 위해 validation을 mirror할 수 있으나
최종 유효성은 Backend response를 따른다.

---

# 5. Desktop Layout

## Page Shell

Configure부터는 Global Discovery Header가 아니라
**Transaction Header**를 기본으로 한다.

```text
Mister World
← Back to Tour
                          optional account utility
```

탐색 link는 시각적으로 낮춘다.

## Primary Desktop Composition

```text
┌─────────────────────────────────────────────────────────────┐
│ TRANSACTION HEADER                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TRIP CONTEXT                                                │
│ Honeymoon Romance · Grand · Nov 12–15                       │
│ [ Change style/schedule ]                                   │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────────────────┬────────────────────────┐
│                                    │                        │
│   CONFIGURATION                    │   STICKY TRIP SUMMARY  │
│                                    │                        │
│   01 HOTEL                         │   small visual         │
│   [ option ]                       │   Honeymoon Romance    │
│   [ option ]                       │   Grand                │
│                                    │   Selected schedule    │
│   02 TRANSPORT                     │                        │
│   [ option ]                       │   Hotel                │
│   [ option ]                       │   Transport            │
│                                    │   Meal                 │
│   03 MEAL                          │   Extras               │
│   [ option ]                       │                        │
│   [ option ]                       │   Price / updating     │
│                                    │                        │
│   04 EXTRAS                        │   [ Review trip ]      │
│   [ checkbox options ]             │                        │
│                                    │                        │
└────────────────────────────────────┴────────────────────────┘
```

## Grid

기본:

```text
12-column
left 7–8 columns
right 4–5 columns
```

정확한 width는 viewport와 content density에 따라 조정.

## Sticky Summary

[FRONTEND PROPOSAL]

`>= 1024px`

- viewport top에서 Transaction Header 아래 offset
- page end를 넘지 않도록 container boundary 존중
- 전체 card가 화면 높이보다 커지지 않게 compact
- scrollable inner summary를 기본으로 만들지 않음

Summary는 **변경된 값만 local transition**한다.

## Option Groups

Section 사이 충분한 공간.

각 group:

```text
eyebrow / step number
heading
optional helper
options
inline validation/error
```

Option은 사진이 유용한 경우 Rich OptionCard,
그렇지 않으면 Compact OptionCard.

## Summary Visual Weight

Summary가 Configuration보다 더 화려하면 안 된다.

- 작은 visual
- clear text
- limited accent
- CTA가 가장 강함

---

# 6. Mobile Layout

## Structure

```text
Transaction Header
↓
Trip Context
↓
Hotel
↓
Transport
↓
Meal
↓
Extras
↓
Page bottom breathing room
↓
Persistent Bottom Summary Bar
```

## No Sticky Side Card

desktop right summary를 그대로 아래에 길게 붙이지 않는다.

## Persistent Bottom Summary

[FRONTEND PROPOSAL]

항상 또는 유효 context 이후 표시.

```text
Grand · 3 selections
₩ current total (if available)
[ Review ]
```

Tap summary area:

```text
→ Configuration Summary Bottom Sheet
```

CTA를 누르면:

```text
→ /reservation/review
```

## Bottom Sheet

포함:

```text
Theme
Style
Schedule
Hotel
Transport
Meal
Extras
Price
```

Close 후 현재 scroll 위치 유지.

## Option Groups

1-column.

Rich option card라면:

```text
thumbnail
title
description
selected marker
```

thumb-friendly.

## Safe Area

Bottom bar:

```text
padding-bottom: env(safe-area-inset-bottom)
```

콘텐츠 마지막 section이 bottom bar에 가려지지 않도록
bottom spacer 확보.

---

# 7. Exact Section Order

```text
01 Transaction Header
02 Trip Context
03 Hotel Option Group
04 Transport Option Group
05 Meal Option Group
06 Extra Option Group
07 Inline Configuration Validation / Availability Messages
08 Desktop Sticky Summary OR Mobile Bottom Summary
09 Review CTA
```

## Why this order

호텔 → 교통 → 식사는 원본 요구사항의 핵심 customization 항목이며
복잡도가 높은 핵심 선택을 먼저 배치한다.

Extras는 기본 여행 구성 이후에 배치한다.

## Style is not an option group here

Tour Style은 Configure 이전 단계에서 선택한 context다.

변경하려면:

```text
Change style/schedule
→ Tour Detail
```

Configure 안에서 Style selector까지 다시 넣어
Theme → Style → Configuration 구조를 흐리지 않는다.

---

# 8. Component Composition

## Page / Domain Components

```text
ConfigurePage
├── TransactionHeader
├── ConfigureTripContext
├── ConfigurationForm
│   ├── OptionGroup(Hotel)
│   │   └── ConfigurationOptionCard × N
│   ├── OptionGroup(Transport)
│   │   └── ConfigurationOptionCard × N
│   ├── OptionGroup(Meal)
│   │   └── ConfigurationOptionCard × N
│   └── ExtraOptionGroup
│       └── ExtraOptionControl × N
├── ConfigurationValidationRegion
├── DesktopTripSummary
│   ├── ConfigurationSummaryList
│   ├── PriceSummary
│   └── ReviewAction
├── MobileSummaryBar
└── MobileConfigurationSummarySheet
```

## Voice Integration Surface

[FRONTEND PROPOSAL / CONTRACT DEPENDENT]

```text
VoiceControlSurface
```

는 floating global control 또는
Configuration 영역의 보조 action으로 연결 가능.

Voice 자체는 `ai-console` responsibility.

## Design-System Primitives

```text
PageContainer
Section
OptionCard
Checkbox
Radio
Button
TextLink
StatusBadge
InfoCard
BottomSheet
Dialog
Skeleton
ErrorState
Toast (minor only)
```

## New domain components

```text
OptionGroup
TripSummary
PriceSummary
ConfigurationValidationRegion
MobileSummaryBar
```

Design System primitive로 바로 승격하지 않는다.

---

# 9. Primary / Secondary CTA

## Primary

Desktop:

```text
Label: Review trip
Korean: 여행 검토하기
Action: validate current Configuration and navigate
Destination: /reservation/review
```

Mobile:

```text
Label: Review
or 여행 검토하기
```

## Enabled When

Frontend UX 기준 최소:

```text
valid Tour context
Style selected
Schedule selected
required Hotel selected
required Transport selected
required Meal selected
no known blocking validation error
not submitting/validating
```

Backend가 최종 validation authority.

## Loading

CTA:

```text
Review trip
→ Checking…
```

또는 local validation이 없다면 route transition.

Backend validation 요청이 필요한 경우
버튼 width 유지 + 작은 progress indicator.

## Failure

Review로 이동하지 않고
현재 Configure state 유지.

가장 가까운 invalid section에 error 표시.

## Secondary

```text
Change style/schedule
→ Tour Detail
```

## Tertiary

```text
Back
```

## Destructive

N/A.

---

# 10. Interaction Rules

## Hotel

single select.

선택 시:

- selected OptionCard update
- Summary의 Hotel만 update
- price 재계산이 있다면 price recalculation
- 다른 section state를 불필요하게 reset하지 않음

## Transport

single select.

동일.

## Meal

single select.

동일.

## Extras

실제 contract가 multi-select를 허용할 경우 checkbox-like.

계약 전 임의로 multi-select 규칙을 확정하지 않는다.

## Change Style/Schedule

Tour Detail로 이동.

가능하면 current Configuration draft는 session에서 임시 보존할 수 있으나,
새 Style로 돌아오면 incompatible option을 자동 유지하지 않는다.

## Voice-applied selection

Voice가 Hotel/Meal/Transport를 변경할 수 있다고 계약되는 경우:

1. recognized command
2. 해당 OptionCard state 실제 변경
3. Summary update
4. price/validation update
5. concise applied feedback

숨겨진 상태만 바꾸지 않는다.

## Rapid Selection

latest selection wins.

animation queue 금지.

동일 category에서 빠른 연속 click이 여러 request를 만들지 않도록
local state와 server validation을 분리.

## Disabled Option

선택 불가 이유를 option 가까이에 표시.

예:

```text
현재 일정에서는 선택할 수 없습니다.
```

## Invalid Combination

서버 validation 후:

- 자동으로 다른 option으로 바꾸지 않음
- invalid option/group 표시
- 사용자가 직접 수정

---

# 11. Motion

## Page Entry

Tour Detail → Configure:

`Standard Forward Page Transition`

Storytelling 화면에서 tool 화면으로 넘어오므로
Signature Hero transition은 사용하지 않는다.

## Option Selection

`Option Selection Motion`

- surface shift
- selected marker
- no bounce

## Summary Update

`Live Summary Update`

바뀐 row만 transition.

## Price

`Price / Number Transition`

이전 값 → 새 값.

0부터 count-up 금지.

## Mobile Bottom Sheet

`Bottom Sheet Motion`

## Validation Error

Error helper reveal.

shake 금지.

## Voice

CP4 `Voice Motion State Machine`.

## Reduced Motion

- OptionCard selected state 즉시/짧은 opacity
- price roll 제거
- bottom sheet 120ms 이하 또는 OS-safe transition
- voice waveform 단순화

---

# 12. Loading

Configure는 **section-level loading**이 핵심이다.

## Initial Load

Trip Context는 가능한 한 이전 화면에서 즉시 복구.

Option catalog가 아직 없으면:

```text
Hotel OptionGroupSkeleton
Transport OptionGroupSkeleton
Meal OptionGroupSkeleton
Extras OptionGroupSkeleton (if applicable)
TripSummarySkeleton
```

## Progressive Data

예:

```text
Hotel ready
Transport loading
Meal loading
```

Hotel은 즉시 interactive.

나머지만 skeleton.

## Summary Loading

기본 context:

```text
Theme
Style
Schedule
```

는 먼저 표시.

아직 loading인 option row만 skeleton.

Summary 전체를 skeleton으로 되돌리지 않는다.

## Price Loading

`PriceSkeleton`

다른 선택 정보 유지.

## Image

Option image가 있다면 preset ratio 사전 확보.

## Layout Shift

각 OptionGroup의 heading/helper는 항상 유지.
options 영역만 skeleton/content swap.

---

# 13. Empty

Configure의 required option category가 empty인 것은
정상 사용자 empty state가 아니라 **blocking product/config state**다.

## Hotel Empty

```text
현재 선택 가능한 숙박 옵션이 없습니다.
여행 정보를 다시 확인해주세요.
```

CTA:

```text
여행 상세로 돌아가기
```

Review CTA disabled.

## Transport Empty

동일.

## Meal Empty

동일.

## Extras Empty

정상 가능.

Extras가 없으면 section 자체를 숨기거나:

```text
추가 옵션 없음
```

을 compact하게 표시.

빈 큰 card를 만들 필요 없음.

## Rule

required category empty를 자동 fallback option으로 채우지 않는다.

---

# 14. Error

## Network

### Entire option catalog failure

Trip Context는 유지.

Configuration area:

```text
여행 옵션을 불러오지 못했습니다.
연결 상태를 확인하고 다시 시도해주세요.

[ 다시 시도 ]
```

### Single group failure

예:

Hotel success
Transport fail
Meal success

Transport group만 error.

Review CTA는 required Transport가 없으므로 disabled.

## Server

local/group retry.

## Not Found

Invalid Tour/Schedule context:

Tour Detail recovery.

## Validation

inline.

예:

```text
이 식사 옵션은 현재 선택한 일정에서 이용할 수 없습니다.
```

## Conflict

사용자가 고른 option이 server에서 더 이상 available하지 않은 경우:

1. 기존 selection 표시
2. invalid state 표시
3. latest options refresh
4. 사용자에게 새 선택 요구

자동 변경 금지.

## Unauthorized

Configure browsing 자체는 현재 인증 필수로 확정되지 않음.

N/A unless future contract changes.

## Offline

### Cached options 있음

유지 + banner:

```text
오프라인 상태입니다.
옵션 정보가 최신이 아닐 수 있습니다.
```

Review CTA는 최신 server validation이 필요할 수 있으므로
CP8에서 action policy 확정.

### Cache 없음

option area offline state.

## Image Failure

Option text는 유지.
image placeholder fallback.

## Partial Failure

성공 OptionGroup 유지.

Summary의 성공 row 유지.

---

# 15. Retrying / Refreshing

## Retry Scope

group-level.

```text
Hotel retry
Transport retry
Meal retry
Price retry
```

## During Retry

기존 성공 data가 있으면 유지.

첫 load 실패였다면 group skeleton.

## Refreshing

option availability background refresh 시:

- selected state 유지
- latest data 도착
- selected option이 여전히 valid → 조용히 갱신
- invalid → explicit conflict state

## Price Recalculating

기존 가격 유지 + subtle updating state.

새 값 도착 시 previous→next transition.

가격을 blank로 만들지 않는다.

## Stale

Freshness priority:

```text
option availability
price
schedule validity
```

높음.

Story/visual copy는 Configure에서 중요하지 않음.

---

# 16. Edge Cases

## Direct URL with no state

Tour Detail로 recovery.

## Direct URL with valid style/schedule query

[FRONTEND PROPOSAL]

공통 contract와 충돌하지 않는 범위에서 복구 가능.

## Unsupported Style

Honeymoon/Parents + Classic:

Tour Detail로 돌아가 재선택.

## Expired Schedule

Trip Context에서 명확히 표시:

```text
선택한 일정이 더 이상 예약 가능하지 않습니다.
```

Review CTA disabled.

`최신 일정 확인` → Tour Detail.

## Selected option disappears after refresh

- option row invalid
- summary row warning
- review disabled
- user reselect

## Price changes after option selection

새 가격을 transition.

Review 직전 backend validation에서 다시 달라지면
Reservation Review에서 reconfirmation 처리 가능.

## Price unavailable

price가 필수 데이터가 아니거나 계약 미완성인 개발 단계:
- mock-only clearly marked
- production UI에서 거짓 가격 생성 금지

## No Extras

section compact hide.

## Many options

OptionGroup이 매우 길어질 경우:
- collapse/see more를 검토 가능
- 처음부터 dropdown으로 축소하지 않음
- actual option count contract 확인 후 CP6-G/CP8에서 재검토

## Rapid switching

latest state wins.

## Browser Back

Tour Detail의 Style/Schedule 유지.

## Browser Forward

Configure draft 복원 권장.

## Refresh

draft persistence 전략 CP8 의존.

최소 Style/Schedule context 유실 시 recovery state.

## Session expires later in flow

Configure에서는 영향 적지만,
Review/Auth interruption 시 draft를 복원할 수 있도록 serializable state 구조 권장.

## Mobile bottom sheet open during rotation

- selection state 유지
- sheet geometry recompute
- content reset 금지

## Voice conflict with touch input

가장 최신 committed state를 UI에 반영.

동시 update가 race를 일으키지 않도록
single source of UI draft state 사용.

---

# 17. Accessibility

## Structure

권장:

```html
<header>
<main>
  <section aria-labelledby="hotel-heading">
  <section aria-labelledby="transport-heading">
  <section aria-labelledby="meal-heading">
  <section aria-labelledby="extras-heading">
  <aside aria-label="현재 여행 구성">
</main>
```

## Option Groups

Single-select category:

- radiogroup semantics 권장
- OptionCard = radio-like control
- group heading과 연결

Multi-select Extras:

- checkbox semantics

## Keyboard

- Tab: group 이동
- Arrow keys: radio choice 이동 가능
- Space/Enter: select
- summary CTA 접근 가능
- Mobile Sheet desktop keyboard 환경에서도 Escape close

## Focus

Validation error 발생 시:
- 자동 focus jump를 남발하지 않음
- Submit/Review validation 실패 시 첫 invalid group으로 focus 이동 가능
- error message는 control과 `aria-describedby` 연결

## Summary

시각적으로 sticky여도 DOM order가 너무 앞서지 않게 한다.

권장 DOM:
- configuration controls
- summary aside

CSS grid로 visual placement.

## Live Updates

Option 선택마다 summary가 바뀐다고
모든 row를 `aria-live`로 읽지 않는다.

중요한 validation/price final change만 필요한 경우 polite region.

## Color

selected/disabled/invalid를 color만으로 구분하지 않음.

## Touch

OptionCard target >= 44px.

Mobile Bottom Bar CTA >= 52px 권장.

## Reduced Motion

CP4 준수.

---

# 18. API / Shared Contract Dependency

| Need | Current Source | Status | Frontend Impact |
|---|---|---|---|
| Style 후 Hotel/Transport/Meal 변경 가능 | Requirements / original source | CONFIRMED | Configure 핵심 기능 |
| Tour Style baseline | original source / business docs | CONFIRMED | initial config concept |
| Champagne/Coffee 추가 가능 | original source | CONFIRMED concept | Extras surface |
| Backend final validation | Business Rules | CONFIRMED | final validity authority |
| Tour/Schedule identity | API skeleton/domain | CONFIRMED concept | entry context |
| Hotel option catalog | baseline | TBD | UI option population |
| Transport option catalog | baseline | TBD | UI option population |
| Meal option catalog | baseline | TBD | UI option population |
| Extra option model | baseline/domain | TBD | Extras behavior |
| Tour Configuration DTO/model details | domain/api | BLOCKED BY SHARED CONTRACT | submit/review data mapping |
| Price formula | baseline | TBD | total calculation |
| Frequent-customer discount | baseline | TBD | discount UI |
| Option compatibility rules | business/domain | BLOCKED BY SHARED CONTRACT | disabled/invalid states |
| Option price delta | API | BLOCKED BY SHARED CONTRACT | price summary |
| Schedule current validity | TourSchedule contract | BLOCKED BY SHARED CONTRACT | Review enablement |
| Voice command schema | voice contract | BLOCKED BY SHARED CONTRACT | voice-applied options |

---

# 19. TBD / Blocker

## TBD

- actual Hotel options
- actual Transport options
- actual Meal options
- Extras exact list/selection rule
- price calculation
- discount display
- number of options per group
- option visual asset source
- whether price is mandatory before Review

## Blocked by Shared Contract

- TourConfiguration request/response DTO
- option IDs / DTO
- compatibility/availability fields
- price response format
- schedule validity field
- Voice command payload

## Frontend Proposal Awaiting Audit

- Desktop 7/5 or 8/4 Configurator layout
- sticky right summary
- mobile persistent bottom summary
- summary bottom sheet
- group order Hotel → Transport → Meal → Extras
- Style selector를 Configure에서 반복하지 않음
- invalid option auto-replacement 금지
- partial group loading/error recovery
- dirty-draft discard confirmation

---

## CP6-H Contract Gate — Reservation participantCount

**P0 contract gate — v0.1.1 is present on `docs/main` and is treated as the active planning baseline.**

Latest shared proposal requires a Reservation to contain:

```text
participantCount >= 1
```

and one Reservation may include multiple people.

The current CP6 Configure/Review flow does not yet place a participant-count control because this requirement was not in the earlier approved baseline.

Before final implementation readiness the team must decide:

- whether participant count is chosen in Tour Detail, Configure, or Reservation Review;
- default value behavior;
- maximum/availability validation, if any;
- how Honeymoon couple/team UX maps to the integer count.

Do not invent these rules in Frontend.


# 20. Acceptance Criteria

## Functional

- [ ] valid Tour + Style + Schedule context에서 Configure 진입 가능.
- [ ] Hotel single selection 동작.
- [ ] Transport single selection 동작.
- [ ] Meal single selection 동작.
- [ ] Extras는 contract가 허용하는 방식으로 동작.
- [ ] option 변경이 다른 unrelated group을 초기화하지 않는다.
- [ ] Summary가 현재 선택과 동기화된다.
- [ ] required selection이 부족하면 Review CTA가 실행되지 않는다.
- [ ] invalid combination을 자동으로 다른 값으로 바꾸지 않는다.
- [ ] Change style/schedule이 Tour Detail로 돌아간다.

## Visual / Design System

- [ ] Desktop에서 configuration과 sticky summary의 hierarchy가 명확하다.
- [ ] Configure가 SaaS dashboard처럼 보이지 않는다.
- [ ] OptionCard selection grammar가 모든 group에서 일관적이다.
- [ ] Summary가 configuration area보다 시각적으로 더 강하지 않다.
- [ ] heavy shadow / excessive glass / thick selection border가 없다.

## Loading / State

- [ ] OptionGroup별 독립 skeleton이 가능하다.
- [ ] 한 group이 loading이어도 준비된 group은 interaction 가능하다.
- [ ] Summary는 이미 아는 Theme/Style/Schedule을 유지한다.
- [ ] Price recalculation 중 기존 가격을 blank로 만들지 않는다.
- [ ] image load/failure가 option geometry를 흔들지 않는다.

## Error / Recovery

- [ ] 한 OptionGroup 실패가 전체 Configure를 지우지 않는다.
- [ ] required category empty면 Review가 block된다.
- [ ] selected option이 unavailable 되면 explicit conflict state가 표시된다.
- [ ] retry가 해당 group만 다시 로드한다.
- [ ] offline/stale option이 최신인 것처럼 오해되지 않는다.

## Responsive

- [ ] `>=1024px`에서 sticky summary가 정상 동작한다.
- [ ] mobile에서 option group이 1-column으로 쌓인다.
- [ ] mobile bottom summary가 content를 가리지 않는다.
- [ ] summary sheet open/close 후 scroll state가 유지된다.
- [ ] safe-area inset을 처리한다.

## Accessibility

- [ ] Hotel/Transport/Meal single-select가 radio semantics를 가진다.
- [ ] Extras가 multi-select라면 checkbox semantics를 가진다.
- [ ] validation error가 해당 control과 연결된다.
- [ ] selected/disabled/invalid가 색만으로 전달되지 않는다.
- [ ] sticky visual order와 DOM reading order가 합리적이다.
- [ ] keyboard만으로 configuration 완료 가능.
- [ ] reduced-motion에서 price/selection motion이 단순화된다.

## Navigation / Draft

- [ ] Back → Tour Detail에서 Style/Schedule이 유지된다.
- [ ] Review → Back 시 Configuration draft를 복구할 수 있는 구조다.
- [ ] refresh/deep-link context missing 시 안전한 recovery가 있다.
- [ ] draft state가 serializable한 구조를 가질 수 있다.
- [ ] dirty navigation 확인은 과도하게 발생하지 않는다.

## Contract Safety

- [ ] 실제 option catalog를 임의 생성하지 않는다.
- [ ] 가격 공식을 frontend가 발명하지 않는다.
- [ ] frequent-customer discount를 임의 계산하지 않는다.
- [ ] Voice payload를 임의 정의하지 않는다.
- [ ] Backend final validation authority를 유지한다.
- [ ] Champagne/Coffee의 세부 가격/적용 범위를 원본 이상으로 확정하지 않는다.

---

# Screen Status

```text
Ready
```

CP6-C 기준 Configure Screen Spec 완료.
