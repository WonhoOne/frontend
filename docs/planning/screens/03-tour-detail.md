# [S03] Tour Detail

> File: `screens/03-tour-detail.md`  
> Route / Trigger: `/tours/:tourId`  
> CP6 Status: **Ready — CP6-B Complete**  
> Depends on:
> - `07-SCREEN-SPECS.md`
> - `01-PRODUCT-EXPERIENCE.md`
> - `02-INFORMATION-ARCHITECTURE.md`
> - `03-VISUAL-DIRECTION.md`
> - `04-DESIGN-SYSTEM.md`
> - `05-MOTION-SYSTEM.md`
> - `06-UI-STATES.md`

---

# 1. Screen Purpose

Tour Detail은 선택한 Theme Tour를 **이해하고, 실제 여행 구성 단계로 들어가기 위한 Style과 Schedule을 선택하는 핵심 화면**이다.

이 화면은 단순 상품 설명 페이지가 아니다.  
사용자는 여기서 다음 네 가지를 이해해야 한다.

1. 이 Theme Tour가 어떤 경험인가
2. 어떤 서비스가 기본적으로 포함되는가
3. 어떤 Tour Style을 선택할 수 있는가
4. 어느 일정에 참여할 수 있고 현재 모집 상태는 어떤가

Tour Detail의 완료 조건은 사용자가:

```text
Theme
+ Style
+ Schedule
```

을 이해하고 선택한 뒤 `Configure this trip`으로 이동할 준비가 되는 것이다.

Style을 선택했다고 최종 구성이 잠기는 것은 아니다.  
다음 화면인 Configure에서 Hotel / Transport / Meal을 다시 변경할 수 있어야 한다.

---

# 2. Route / Entry Conditions

## Route

```text
/tours/:tourId
```

## Entry

가능한 진입:

- Home Theme Card
- Tours Collection Card
- direct URL
- Browser Forward
- 다른 화면의 “다른 여행 보기” CTA

인증 불필요.

## Required route context

[CONFIRMED]

`:tourId`는 4개 Theme Tour 중 하나를 식별해야 한다.

```text
Honeymoon Romance
Parents Healing
Golf Challenge
Outdoor Trekking
```

구체적인 ID 문자열/형식은 API 계약에 종속된다.

[BLOCKED BY SHARED CONTRACT]

실제 `tourId` 형식과 API DTO field name.

## Exit

Primary:

```text
Configure this trip
→ /tours/:tourId/configure
```

이동 시 최소 다음 context를 유지해야 한다.

```text
selected Tour
selected Style
selected Schedule
```

Secondary:

```text
Back to Tours
→ browser back when valid
or /tours fallback
```

Global navigation은 가능하나
사용자가 Style/Schedule을 이미 선택한 경우 현재 selection loss 여부를 명확히 처리한다.

Tour Detail 단계에서는 아직 복잡한 Configuration draft가 아니므로
별도 discard confirm은 기본적으로 필요하지 않다.

---

# 3. User Goal

Primary goal:

> 관심 있는 Theme Tour의 특징을 이해하고, Style과 Schedule을 선택해 여행 구성 단계로 이동한다.

Secondary goals:

- 기본 포함 서비스를 확인
- 자신에게 허용되는 Style을 비교
- 모집 상태를 보고 해당 일정의 출발 가능성을 이해
- Style이 최종 구성이 아니라는 점을 이해
- 다른 Theme로 돌아가 비교

---

# 4. Required Data

## Core Tour Identity

[CONFIRMED]

- Theme Tour identity
- Theme title
- Theme category
- Theme-specific included services
- 허용 Tour Style

## Theme-specific required facts

### Honeymoon Romance

[CONFIRMED]

기본 서비스:

- 2인 전용 로맨틱 스페셜 룸 데코레이션
- 커플 기념 티셔츠
- 2인 전용 고급차량

허용 Style:

```text
Grand
Premium
```

모집 의미:

```text
2 couples / 2 teams required
```

### Parents Healing

[CONFIRMED]

기본 서비스:

- 고품격 안마·지압
- 건강 인삼 기념품
- 10인승 고급차량

허용 Style:

```text
Grand
Premium
```

모집 의미:

```text
3 participants required
```

### Golf Challenge

[CONFIRMED]

기본 서비스:

- 유명 골프 리조트 중심 테마
- 골프 액세서리 / 골프공
- 10인승 고급차량

허용 Style:

```text
Classic
Grand
Premium
```

모집 의미:

```text
3 participants required
```

### Outdoor Trekking

[CONFIRMED]

기본 서비스:

- 트레킹 / 산악 / 모험 중심 테마
- 아웃도어 기념 스카프
- 10인승 고급차량

허용 Style:

```text
Classic
Grand
Premium
```

모집 의미:

```text
3 participants required
```

---

## Tour Style baseline

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

원본 요구사항에는 식사에 Champagne / Coffee를 추가할 수 있음이 명시되어 있으므로,
이 화면에서는 Style baseline 설명까지만 하고 실제 추가 선택은 Configure로 넘긴다.

---

## Schedule data need

[CONFIRMED concept / BLOCKED shape]

Frontend가 화면에 필요로 하는 정보:

- schedule identifier
- start date
- end date
- current recruitment state
- current participant/team count
- confirmed/not confirmed state
- availability

[BLOCKED BY SHARED CONTRACT]

정확한 TourSchedule DTO / field names / 상태 enum.

---

## Visual content

[TBD]

- hero image
- service imagery
- theme storytelling imagery
- actual destination photography

실제 목적지/일정이 계약에 없다면
목적지를 임의로 확정하는 이미지를 사용하지 않는다.

이미지는 Theme의 분위기를 보여주는 방향으로 사용하되,
실제 여행지가 특정된 것처럼 오해시키면 안 된다.

---

# 5. Desktop Layout

## Page composition

```text
┌──────────────────────────────────────────────────────────────┐
│ GLOBAL HEADER                                                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                   CINEMATIC TOUR HERO                        │
│                                                              │
│  THEME LABEL                                                 │
│  Honeymoon Romance                                           │
│  editorial supporting line                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘

          ↓

┌──────────────────────────────────────────────────────────────┐
│ TOUR STORY                                                   │
│                                                              │
│ large copy                    supporting visual               │
└──────────────────────────────────────────────────────────────┘

          ↓

┌──────────────────────────────────────────────────────────────┐
│ INCLUDED EXPERIENCE                                         │
│                                                              │
│ service 01        service 02        service 03               │
│ image/copy        image/copy        image/copy               │
└──────────────────────────────────────────────────────────────┘

          ↓

┌──────────────────────────────────────────────────────────────┐
│ CHOOSE YOUR STYLE                                            │
│                                                              │
│ [ Classic ] [ Grand ] [ Premium ]                           │
│ or only allowed styles                                      │
│                                                              │
│ “You can customize hotel, transport and meal next.”         │
└──────────────────────────────────────────────────────────────┘

          ↓

┌──────────────────────────────────────────────────────────────┐
│ CHOOSE A SCHEDULE                                            │
│                                                              │
│ [ Schedule Card ]                                            │
│ dates                                                        │
│ recruitment status                                          │
│                                                              │
│ [ Schedule Card ]                                            │
└──────────────────────────────────────────────────────────────┘

          ↓

┌──────────────────────────────────────────────────────────────┐
│ SELECTED TRIP SUMMARY / CTA                                  │
│                                                              │
│ Theme      Style      Schedule                               │
│                                                              │
│                    [ Configure this trip ]                   │
└──────────────────────────────────────────────────────────────┘

          ↓

┌──────────────────────────────────────────────────────────────┐
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

## Hero

[FRONTEND PROPOSAL]

- `min-height: 64–76svh`
- immersive image
- minimal copy
- title is primary
- hero에서 가격/세부 일정/긴 서비스 목록을 노출하지 않는다

## Story Section

디지털 editorial 구조.

권장:

```text
copy 5 columns
image 7 columns
```

다음 section에서는 역전 가능.

목표는 “카드들의 긴 목록”을 피하는 것.

## Included Experience

각 Theme의 기본 서비스를 3개 중심으로 보여준다.

서비스마다:

- short label
- short factual copy
- optional visual

과도한 icon-grid로 만들지 않는다.

## Style Selector

Desktop에서는 2~3개의 큰 horizontal OptionCard.

가능한 layout:

```text
Honeymoon / Parents:
2 columns

Golf / Trekking:
3 columns
```

Selected state는 CP3 `OptionCard`.

## Schedule Section

카드 수가 적다면 vertical list 또는 2-column card.

일정 카드에는 최소:

- 날짜
- 모집 상태
- 현재 count
- confirmed/recruiting label

정확한 상태 enum은 계약 의존.

## Selected Trip Summary

Tour Detail bottom section에서
현재 선택한 Style/Schedule을 한 번 더 보여주고 CTA 제공.

이 summary는 Configure의 sticky summary와 동일한 수준의 상세 구성은 아니다.

---

# 6. Mobile Layout

## Structure

```text
Header
↓
Hero
↓
Story
↓
Included Experience
↓
Style Selector
↓
Schedule Selector
↓
Sticky/Bottom CTA
↓
Footer
```

## Hero

- `min-height: 58–68svh`
- mobile-specific crop
- title 2줄 허용
- supporting copy 2~3줄 제한

## Included Experience

3개 서비스를 세로 또는 compact card stack.

가로 swipe carousel은 기본 사용하지 않는다.

## Style Selector

1-column stack.

Honeymoon / Parents에서는 Classic을 기본적으로 렌더하지 않는다.

Golf / Trekking은 3개 전부 세로.

## Schedule

1-column cards.

Recruitment visualization은 카드 안에서 readable하게 축소.

## Primary CTA

[FRONTEND PROPOSAL]

Style + Schedule이 선택되면
mobile bottom sticky action 사용 가능.

구성:

```text
Selected Style
Selected Schedule short label
[ Configure ]
```

사용자가 schedule 영역을 지나기 전부터 CTA를 강하게 노출하지 않는다.

## Safe area

`env(safe-area-inset-bottom)` 고려.

---

# 7. Exact Section Order

```text
01 Global Header
02 Tour Hero
03 Tour Story
04 Included Experience
05 Tour Style Selector
06 Style Customization Hint
07 Schedule Selector
08 Recruitment State within Schedule
09 Selected Trip Summary
10 Configure CTA
11 Footer
```

이 순서는 중요하다.

이유:

```text
Understand
→ Choose quality level
→ Choose when to go
→ See current departure state
→ Continue
```

사용자가 Schedule을 먼저 고른 뒤 Theme/Style 의미를 이해하는 구조는 피한다.

---

# 8. Component Composition

## Page / Domain Components

```text
TourDetailPage
├── GlobalHeader
├── TourHero
│   ├── HeroMedia
│   ├── ThemeEyebrow
│   └── TourTitle
├── TourStorySection
├── IncludedExperienceSection
│   └── IncludedServiceItem × 3
├── TourStyleSection
│   ├── TourStyleSelector
│   │   └── OptionCard × 2/3
│   └── CustomizationHint
├── ScheduleSection
│   ├── ScheduleCard × N
│   │   └── RecruitmentState
│   └── ScheduleSectionState
├── SelectedTripSummary
├── ConfigurePrimaryAction
└── GlobalFooter
```

## Recruitment component by Theme

General:

```text
RecruitmentProgress
```

Honeymoon:

```text
CoupleProgress
```

## Design-System Primitives

```text
PageContainer
Section
ImageFrame
OptionCard
Button
TextLink
StatusBadge
RecruitmentProgress
CoupleProgress
Skeleton
ErrorState
EmptyState
```

## New primitive proposal

[FRONTEND PROPOSAL]

`ScheduleCard`

이것은 Domain Component이며
CP3 primitive를 조합하므로 Design System primitive 승격은 아직 불필요.

---

# 9. Primary / Secondary CTA

## Primary

```text
Label: Configure this trip
Korean: 여행 구성하기
Action: navigate to Configure
Destination: /tours/:tourId/configure
Enabled when:
- valid Tour
- Style selected
- Schedule selected
Loading:
- route transition only
Failure:
- selected state preserved
- navigation retry possible
```

## Disabled state before required selections

### No Style

```text
Style을 선택해주세요.
```

### No Schedule

```text
일정을 선택해주세요.
```

버튼을 disabled로만 두고 이유를 숨기지 않는다.

## Secondary

```text
Back to Tours
```

또는 browser back affordance.

## Tertiary

N/A.

## Destructive

N/A.

---

# 10. Interaction Rules

## Style selection

- single select
- 선택 즉시 local state 반영
- Backend final rule authority는 유지
- Honeymoon/Parents에서 Classic을 렌더하지 않는 방향이 기본
- invalid style이 deep-link/query로 들어오면 자동 선택하지 않고 안전한 상태로 복구

## Schedule selection

- single select
- 선택하면 recruitment state가 명확하게 연결되어야 함
- schedule card 클릭 영역 전체 accessible

## Style change after schedule selection

기본적으로 schedule 선택 유지.

단, shared contract에서 특정 Style/Schedule 조합이 불가능하다고 정의될 경우:
- invalid state를 명시
- 자동으로 다른 schedule/style로 바꾸지 않음

## Schedule change after style selection

Style 유지.

## Voice

[FRONTEND PROPOSAL / CONTRACT DEPENDENT]

Voice command가 Style selection을 바꿀 수 있다면:
- 실제 StyleSelector visual state가 변경
- recognized transcript보다 실제 변경 UI가 primary feedback
- final command schema는 ai-console contract 의존

Schedule Voice selection은 command contract가 없으므로 임의 구현하지 않는다.

## Header navigation

Global navigation.

선택 state loss는 Tour Detail 단계에서는 recoverable.

---

# 11. Motion

## Entry from Home/Tours

`Signature Shared Transition`

- source image → Tour Hero
- title/eyebrow settle
- direct URL에서는 fallback Hero reveal

## Hero

`Home Hero Motion`의 restrained detail-page variation.

## Story / Services

`Section Reveal`
+
`Editorial Image Reveal`

## Style selection

`Tour Style Selection Motion`

- surface shift
- selected marker
- local summary update

## Schedule selection

`Schedule Selection Motion`

## Recruitment

일반:

`General Recruitment Progress Motion`

허니문:

`Honeymoon Couple Progress Motion`

단, initial render에서 이미 confirmed 상태라고
“방금 확정된 것처럼” 큰 completion animation을 재생하지 않는다.

Initial state는 calm reveal,
실시간 상태 변경시에만 full progress choreography.

## Configure CTA / page transition

`Standard Forward Page Transition`

## Reduced Motion

- shared transform 제거
- section reveal opacity only
- progress animation 즉시 state 표시
- selected state는 즉시 또는 80–120ms transition

---

# 12. Loading

## Page-level core loading

Tour core가 아직 없으면:

```text
Header
+ TourHeroSkeleton
+ Story skeleton
+ Included Experience skeleton
+ StyleSelectorSkeleton
+ ScheduleSkeleton
```

전체 spinner 금지.

## Progressive section loading

권장:

```text
Tour core ready
→ Hero/Story render
Schedule still loading
→ ScheduleSkeleton only
```

## Skeleton mapping

```text
TourHero
↔ TourHeroSkeleton

IncludedServiceItem
↔ IncludedServiceSkeleton

OptionCard
↔ StyleOptionSkeleton

ScheduleCard
↔ ScheduleCardSkeleton

RecruitmentProgress/CoupleProgress
↔ RecruitmentSkeleton

SelectedTripSummary
↔ compact summary skeleton
```

## Image

- Hero geometry 고정
- service image ratio 고정
- Progressive Image Reveal

## Layout shift

Style/Schedule section min geometry 확보.

---

# 13. Empty

## No schedule

Applicable: Yes.

Trigger:

- Tour exists
- available schedules = 0

Copy:

```text
현재 예약 가능한 일정이 없습니다.
새로운 일정이 준비되면 다시 확인해주세요.
```

Primary recovery:

```text
다른 여행 보기
→ /tours
```

Optional:

```text
다시 시도
```

if schedule API could be transient.

## No styles

정상 product 상태로 허용하지 않는다.

4개 Theme 모두 최소 Grand/Premium이 있으므로
Style list 0은 data/config error로 취급.

## No included service data

Theme baseline과 불일치.

가능한 source-backed static fallback이 있다면 사용할 수 있으나
실제 Backend-driven source of truth 정책은 CP8에서 결정.

---

# 14. Error

## Network

### Core Tour failure

Full page recovery:

```text
여행 정보를 불러오지 못했습니다.
연결 상태를 확인하고 다시 시도해주세요.

[ 다시 시도 ]
[ 여행 목록으로 ]
```

Header 유지.

### Schedule failure

Hero/Story/Style 유지.

Schedule section:

```text
일정을 불러오지 못했습니다.
[ 다시 시도 ]
```

## Server

Core:
- page-level retry

Schedule only:
- local retry

## Not Found

Invalid `tourId`:

```text
이 여행을 찾을 수 없습니다.
삭제되었거나 주소가 잘못되었을 수 있습니다.

[ 여행 둘러보기 ]
```

## Validation

Style/Schedule invalid combination이 backend 검증으로 확인되면
해당 selector 가까이에 inline error.

## Conflict

선택한 schedule이 더 이상 available하지 않게 된 경우:

```text
선택한 일정의 상태가 변경되었습니다.
최신 일정을 다시 선택해주세요.
```

기존 Style은 유지.

## Unauthorized

N/A — browsing public.

## Offline

Cached Tour core가 있으면 유지.

Schedule/recruitment:

```text
오프라인 상태입니다.
모집 현황이 최신이 아닐 수 있습니다.
```

Configure CTA는 freshness-sensitive validation 정책에 따라 제한될 수 있음.

정확한 정책은 CP8.

## Image Failure

Hero:
- branded fallback surface
- title 유지

Service image:
- text 유지
- neutral local fallback

## Partial Failure

Schedule/recruitment만 실패:
- 나머지 화면 유지
- Configure CTA는 valid Schedule이 없으면 disabled

---

# 15. Retrying / Refreshing

## Retry scope

- Core Tour: page content
- Schedule: schedule section
- Recruitment: 해당 schedule card

## During retry

Core:
- page skeleton 또는 preserved stale data

Schedule:
- local ScheduleSkeleton

Recruitment:
- 기존 count 유지 + subtle updating indicator

## Existing content preserved

가능하면 Yes.

## Refreshing

특히 freshness-sensitive:

```text
schedule availability
recruitment count/status
```

기존 UI 유지 후 새 값 적용.

## Stale handling

Hero/story/service:
- stale 허용 높음

Schedule/recruitment:
- stale 허용 낮음

CTA 직전에는 최신 validation이 필요할 수 있음.
정확한 server validation timing은 CP8.

---

# 16. Edge Cases

## Direct URL

Shared transition 없이 정상 render.

## Invalid `tourId`

Not Found.

## Unsupported style in URL/query

예:

```text
Honeymoon + Classic
```

자동으로 Grand로 바꾸지 않는다.

- invalid external selection 무시
- no selected style 상태
- user가 허용 Style을 직접 선택

## Previously selected schedule becomes unavailable

- Style 유지
- Schedule selection clear/invalid
- conflict message
- Configure CTA disabled

## No schedules

Empty state.

## Only one schedule

자동 선택하지 않는다.

사용자가 직접 선택하게 하는 것이 기본.
향후 product policy가 자동 선택을 요구하면 별도 결정.

## Recruitment becomes confirmed while viewing

Backend data update 시:
- progress motion
- confirmed status reveal
- 선택 state 유지

## Recruitment count decreases/changes

실제 Backend state를 그대로 반영.
낙관적으로 “확정 유지”하지 않는다.

## Hero image fails

fallback.

## Very long localized copy

Story/body line length 제한.
service title 2줄 허용.

## Browser Back from Configure

선택했던 Style/Schedule 복원.

## Refresh after selection

[FRONTEND PROPOSAL]

가능하면 URL/session state로 selection 복구.

정확한 persistence는 CP8.

## Rapid Style switching

motion queue 없음.
latest selection wins.

## Rapid Schedule switching

동일.

## Mobile viewport rotation

selected state 유지.

## Voice changes Style while user is interacting

latest committed state를 명확하게 표시.
silent hidden state 변경 금지.

---

# 17. Accessibility

## Structure

권장:

```html
<header>
<main>
  <section aria-labelledby="tour-title">
  <section aria-labelledby="included-heading">
  <section aria-labelledby="style-heading">
  <section aria-labelledby="schedule-heading">
</main>
<footer>
```

Hero title = page `<h1>`.

Section headings = `<h2>`.

Style names는 heading보다 radio/select semantics가 우선.

## Style Selector

실제 semantics:

- `radiogroup`
- 각 Style = `radio`

키보드:
- Tab으로 group 진입
- Arrow key 선택 이동 고려
- Space/Enter select

구현 라이브러리 semantics에 맞춰 최종화.

## Schedule Selector

single choice이므로 radio group semantics 권장.

카드 전체가 클릭 가능해도
내부 interactive 요소를 불필요하게 중첩하지 않는다.

## Recruitment status

스크린리더가 이해할 수 있는 text 필요.

예:

```text
현재 2명 신청, 출발 기준 3명
```

Honeymoon:

```text
현재 1팀 신청, 출발 기준 2팀
```

marker 색만으로 전달 금지.

## Live updates

실시간 모집 상태가 변경되면:

- 과도한 `aria-live` 반복 금지
- 의미 있는 상태 변화(Confirmed)만 polite announcement 권장

## Images

Hero:
- theme 분위기 전달용이면 contextual alt
- 동일 내용이 text로 충분하면 decorative 처리 가능

Service visual:
- 서비스 의미를 보완하면 alt
- 장식이면 empty alt

## Focus

Configure CTA disabled 이유가 시각적으로만 존재하지 않도록
selector 근처 helper text 제공.

## Reduced Motion

CP4 준수.

## Touch

- Style/Schedule card >= 44px
- CTA >= 52px mobile 권장

---

# 18. API / Shared Contract Dependency

| Need | Current Source | Status | Frontend Impact |
|---|---|---|---|
| Theme 4종 | Requirements/Business Rules | CONFIRMED | route/page identity |
| Theme별 기본 서비스 | 원본 프로젝트 요구사항 | CONFIRMED | Included Experience |
| Tour Styles 3종 | Business Rules | CONFIRMED | selector |
| Honeymoon/Parents Classic 제한 | Business Rules | CONFIRMED | allowed styles |
| Style 후 Hotel/Transport/Meal 변경 | Requirements | CONFIRMED | customization hint |
| Honeymoon 모집 2팀 semantics | 최신 팀 결정 | CONFIRMED | CoupleProgress |
| 기타 Tour 3명 기준 | 최신 팀 결정/requirements | CONFIRMED | RecruitmentProgress |
| `GET /api/v1/tours/{tourId}` | API skeleton | CONFIRMED endpoint skeleton | core detail fetch |
| `GET /api/v1/tour-schedules` | API skeleton | CONFIRMED endpoint skeleton | schedule list candidate |
| `GET /api/v1/tour-schedules/{scheduleId}` | API skeleton | CONFIRMED endpoint skeleton | schedule detail candidate |
| Tour DTO | API v0.2 | BLOCKED BY SHARED CONTRACT | field mapping |
| TourSchedule DTO | API/ERD v0.2 | BLOCKED BY SHARED CONTRACT | dates/status/count |
| Recruitment status enum | baseline TBD | BLOCKED BY SHARED CONTRACT | exact state mapping |
| Schedule availability rule | baseline TBD | BLOCKED BY SHARED CONTRACT | CTA validation |
| Actual price | baseline TBD | TBD | Tour Detail에서 기본 미노출 |
| Actual hotel/transport/meal options | baseline TBD | TBD | Configure에서 필요 |
| Image asset source | 없음 | TBD | visual implementation |
| Voice command schema | voice contract TBD | BLOCKED BY SHARED CONTRACT | voice-applied style control |

---

# 19. TBD / Blocker

## TBD

- 실제 Tour Hero/Service image assets
- Tour Detail 최종 editorial copy
- actual destination content
- TourSchedule 실제 date formatting requirement
- schedule card에서 price를 함께 보여줄지 여부
- one-schedule 자동 선택 여부 — 현재는 자동 선택하지 않음

## Blocked by Shared Contract

- Tour detail DTO
- TourSchedule DTO
- schedule availability field
- recruitment status/count structure
- exact reservation eligibility validation
- Voice command payload

## Frontend Proposal Awaiting Audit

- section order
- large cinematic hero
- included experience 3-item storytelling
- Style → Schedule 순서
- bottom selected summary
- mobile sticky configure CTA
- Classic non-rendering for Honeymoon/Parents
- no automatic Style/Schedule selection

---

## CP6-H Contract Gate — Theme/TourProduct + Honeymoon semantics

**P0 contract gate — v0.1.1 is present on `docs/main` and is treated as the active planning baseline.**

Latest shared proposal:

```text
Theme 1 : N TourProduct
Reservation.participantCount >= 1
HONEYMOON_ROMANCE confirmation threshold = 4 participants
```

Current Frontend UX intent:

```text
Honeymoon = 2 couples / 2 teams
```

The shared Domain/API currently has no `Couple` or `Team` concept and does not guarantee that one Honeymoon Reservation represents exactly two participants.

Therefore:

- do not derive `1 / 2 couples` from raw `participantCount` without an approved mapping rule;
- do not hard-code “one Theme = one TourProduct”;
- keep the CoupleProgress visual proposal, but treat its data mapping as blocked until the shared rule is reconciled.

Required docs decision:
1. whether Honeymoon UX is officially expressed as 2 couples/teams;
2. how that maps to Reservation `participantCount`;
3. whether TourProduct selection exists between Theme and this detail page.


# 20. Acceptance Criteria

## Functional

- [ ] valid Tour Detail route가 4개 Theme 모두 정상 표시된다.
- [ ] Honeymoon/Parents에서 Classic을 선택할 수 없다.
- [ ] Golf/Trekking은 Classic/Grand/Premium을 제공한다.
- [ ] Style은 single-select다.
- [ ] Schedule은 single-select다.
- [ ] Style + Schedule 선택 전 Configure CTA가 실행되지 않는다.
- [ ] Style + Schedule 선택 후 Configure로 올바른 context를 전달한다.
- [ ] Schedule 변경 시 Style이 불필요하게 초기화되지 않는다.
- [ ] Style 변경 시 valid Schedule이 불필요하게 초기화되지 않는다.

## Visual / Design System

- [ ] Tour Detail이 SaaS pricing page처럼 보이지 않는다.
- [ ] Hero / Story / Services가 digital editorial tone을 유지한다.
- [ ] OptionCard selection grammar를 따른다.
- [ ] heavy shadow / excessive glass / fake gold luxury가 없다.
- [ ] Theme identity는 photography + local accent 중심이다.

## Loading / State

- [ ] Tour core loading과 Schedule loading을 분리할 수 있다.
- [ ] Schedule이 늦어도 Hero/Story/Style을 먼저 보여줄 수 있다.
- [ ] Skeleton footprint가 final component와 가깝다.
- [ ] image load 후 layout shift가 없다.

## Error / Recovery

- [ ] invalid tourId는 branded Not Found로 처리.
- [ ] Schedule fetch 실패가 전체 page를 지우지 않는다.
- [ ] 선택 Schedule이 unavailable 되면 Style을 유지하고 재선택을 요구한다.
- [ ] image failure가 content를 파괴하지 않는다.
- [ ] offline/stale recruitment가 최신인 것처럼 오해되지 않는다.

## Responsive

- [ ] Desktop에서 Style 2/3-column selector가 명확하다.
- [ ] Mobile에서는 Style/Schedule이 1-column으로 자연스럽게 쌓인다.
- [ ] mobile sticky CTA가 콘텐츠를 가리지 않는다.
- [ ] hero focal crop이 mobile에서도 유지된다.
- [ ] 320px급 viewport에서 title/CTA overflow가 없다.

## Accessibility

- [ ] page H1은 하나다.
- [ ] Style selector가 radio-like semantics를 갖는다.
- [ ] Schedule selector가 keyboard로 선택 가능하다.
- [ ] recruitment state가 색/marker 없이도 텍스트로 이해된다.
- [ ] Confirmed 같은 중요한 live update가 과도하지 않게 announce된다.
- [ ] focus-visible이 명확하다.
- [ ] reduced-motion에서 shared/progress transforms가 제거된다.

## Navigation / Draft

- [ ] Home/Tours에서 Shared Hero transition 실패 시에도 route 이동된다.
- [ ] Configure에서 Back하면 기존 Style/Schedule을 복원할 수 있는 구조다.
- [ ] refresh/deep-link 복구 전략과 충돌하지 않는다.

## Contract Safety

- [ ] 실제 destination을 임의 생성하지 않는다.
- [ ] 실제 일정/가격/호텔명을 임의 생성하지 않는다.
- [ ] TourSchedule DTO를 문서가 임의 정의하지 않는다.
- [ ] Frontend가 모집 확정을 독자적으로 저장/판정하지 않는다.
- [ ] Voice command schema를 임의 정의하지 않는다.

---

# Screen Status

```text
Ready
```

CP6-B 기준 Tour Detail Screen Spec 완료.
