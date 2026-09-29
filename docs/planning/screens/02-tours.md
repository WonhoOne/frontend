# [S02] Tours Collection

> File: `screens/02-tours.md`  
> Route / Trigger: `/tours`  
> CP6 Status: **Ready — CP6-A Complete**  
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

Tours Collection은 Mister World의 4개 Theme Tour를 **한 화면에서 비교하고 선택하는 curated collection**이다.

Home이 “브랜드를 느끼고 여행을 발견하는” 감성적 진입점이라면,
Tours는 사용자가 네 개 테마의 성격 차이를 좀 더 명확히 비교하고 원하는 Tour Detail로 들어가는 기능적 탐색 화면이다.

이 화면은 대규모 OTA의 검색 결과 페이지가 아니다.

따라서 다음은 기본적으로 두지 않는다.

```text
destination search
sorting
filter sidebar
pagination
hotel/flight tabs
price comparison table
```

4개의 Theme를 더 잘 이해시키는 것이 유일한 탐색 목표다.

---

# 2. Route / Entry Conditions

## Route

```text
/tours
```

## Entry

[CONFIRMED]

진입 가능 위치:

- Home Hero CTA
- Home customization section CTA
- Global Header `Tours`
- Error/Empty recovery CTA
- direct URL

인증 불필요.

## Exit

Theme card:

```text
/tours/:tourId
```

Global navigation:

```text
Home     → /
My Trips → /my-trips
Login    → /login or modal-route
```

Browser Back:

- 실제 history stack 존중
- Home에서 진입했다면 Home으로 복귀하며 가능한 경우 scroll position 복원

---

# 3. User Goal

Primary goal:

> 4개 Theme Tour의 차이를 비교하고 하나를 선택한다.

Secondary goal:

- 각 Theme에서 기대할 수 있는 경험을 빠르게 이해
- 이용 가능한 Tour Style 범위를 미리 확인
- 상품 상세로 진입하기 전 “나에게 맞는 Theme인가?” 판단

이 화면에서 Schedule이나 실제 Configuration을 선택하지 않는다.

---

# 4. Required Data

## Theme identity

[CONFIRMED]

```text
Honeymoon Romance
Parents Healing
Golf Challenge
Outdoor Trekking
```

## Theme preview facts

[CONFIRMED]

### Honeymoon Romance

```text
Romantic room decoration
Couple commemorative T-shirts
Private luxury vehicle for two
```

Style availability:

```text
Grand
Premium
```

Recruitment semantics:

```text
2 couples / 2 teams
```

### Parents Healing

```text
Massage / acupressure service
Health ginseng souvenir
10-seat luxury vehicle
```

Style availability:

```text
Grand
Premium
```

Recruitment semantics:

```text
3 participants
```

### Golf Challenge

```text
Famous golf resort theme
Golf accessory / golf ball
10-seat luxury vehicle
```

Style availability:

```text
Classic
Grand
Premium
```

Recruitment semantics:

```text
3 participants
```

### Outdoor Trekking

```text
Trekking / mountain / adventure theme
Outdoor souvenir scarf
10-seat luxury vehicle
```

Style availability:

```text
Classic
Grand
Premium
```

Recruitment semantics:

```text
3 participants
```

## Tour Style summary

[CONFIRMED]

Baseline style meanings:

```text
Classic
- 3-star hotel
- lunch box

Grand
- 4-star hotel
- local restaurant

Premium
- 5-star hotel
- premium restaurant / steak
- champagne
```

Tours Collection에서는 모든 세부사항을 펼치지 않고
Style availability를 간단히 표시한다.

## Do not show as fixed product data

[TBD]

- actual destination
- actual schedule
- actual price
- actual hotel name
- actual vehicle model
- exact duration

이 값들은 계약 없이 card에서 임의 생성 금지.

## API

[CONFIRMED]

API skeleton:

```text
GET /api/v1/tours
```

[BLOCKED BY SHARED CONTRACT]

Response DTO는 v0.2 필요.

---

# 5. Desktop Layout

## Page shell

- solid quiet Global Header
- `container-main` 중심
- page top spacing `space-20` 수준
- editorial Home보다 정보 정렬을 조금 더 엄격하게

## Structure

```text
┌──────────────────────────────────────────────────────────────┐
│ GLOBAL HEADER                                                │
│ Mister World          Tours   My Trips         Login/Account │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ EYEBROW                                                      │
│ THEME TOURS                                                  │
│                                                              │
│ Four ways to travel differently.                             │
│ 짧은 설명                                                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────┬───────────────────────────────┐
│ HONEYMOON                    │ PARENTS                       │
│ large image                  │ large image                   │
│ title                        │ title                         │
│ short positioning            │ short positioning             │
│ Included highlights          │ Included highlights           │
│ Grand · Premium             │ Grand · Premium               │
│ [ View Tour ]               │ [ View Tour ]                 │
└──────────────────────────────┴───────────────────────────────┘

┌──────────────────────────────┬───────────────────────────────┐
│ GOLF                         │ TREKKING                      │
│ ...                          │ ...                           │
│ Classic · Grand · Premium    │ Classic · Grand · Premium     │
└──────────────────────────────┴───────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ STYLE EXPLAINER — compact                                     │
│ Classic / Grand / Premium                                    │
│ Style 선택 후에도 Hotel / Transport / Meal 변경 가능         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

## Grid

Desktop 기본:

```text
2-column curated comparison
```

각 card는 동일 폭이어도 되지만
Home처럼 비대칭 artwork를 강하게 사용하지 않는다.

이유:

> Tours에서는 비교 가능성이 Home보다 중요하다.

## Card image

- large `4:3` 또는 `3:2`
- Theme별 동일 계열 ratio 유지
- 사진은 card 전체의 50~65% 정도 visual weight

## Style preview

작은 chip을 여러 개 도배하기보다:

```text
Available in Grand & Premium
```

또는

```text
Grand · Premium
```

처럼 typography 중심.

---

# 6. Mobile Layout

## Structure

```text
Header
↓
Page intro
↓
Honeymoon card
↓
Parents card
↓
Golf card
↓
Trekking card
↓
Tour Style explainer
↓
Footer
```

## Card

- 1 column
- image top
- text below
- `View Tour` action card bottom
- card 사이 `space-12` 이상
- image ratio 4:3 또는 4:5
- no horizontal carousel

## Style preview

한 줄에 다 안 들어가면 wrap 허용.

`Grand · Premium` 같은 text-first 표현을 우선해
chip overflow 문제를 줄인다.

## Navigation

Mobile Header는 CP3 foundation.

Tours page에서는 Home처럼 transparent header를 사용하지 않는다.

## Touch

Theme card 자체를 full-card link로 만들 경우:
- 내부 별도 button 중복 interaction 피함
- CTA는 visual affordance로만 표현 가능
- 전체 clickable area에 명확한 focus/press state

---

# 7. Exact Section Order

```text
01 Global Header
02 Collection Hero / Page Intro
03 Theme Collection
   03-1 Honeymoon Romance
   03-2 Parents Healing
   03-3 Golf Challenge
   03-4 Outdoor Trekking
04 Tour Style Explainer
05 Customization Note
06 Footer
```

## Tour Style Explainer

[CONFIRMED]

설명 가능한 기본:

```text
Classic = 3-star hotel + lunch box
Grand = 4-star hotel + local restaurant
Premium = 5-star hotel + premium restaurant / steak + champagne
```

[CONFIRMED]

Honeymoon/Parents는 Classic 선택 불가.

[CONFIRMED]

Style 선택 이후 Hotel / Transport / Meal 변경 가능.

## Customization Note

Home보다 조금 더 명확하게:

```text
Start with a style.
Then make the trip yours.
```

[FRONTEND PROPOSAL]

실제 UI copy는 localization 가능.

---

# 8. Component Composition

## Page / Domain Components

```text
ToursPage
├── GlobalHeader
├── ToursIntro
├── ThemeCollectionGrid
│   ├── TourCollectionCard(Honeymoon)
│   ├── TourCollectionCard(Parents)
│   ├── TourCollectionCard(Golf)
│   └── TourCollectionCard(Trekking)
├── TourStyleExplainer
├── CustomizationNote
└── GlobalFooter
```

`TourCollectionCard`:

```text
TourCollectionCard
├── ImageFrame
├── ThemeLabel
├── TourTitle
├── PositioningCopy
├── IncludedHighlights
├── AvailableStyleText
└── ExploreAction
```

## Design-System Primitives

```text
PageContainer
Section
ImageFrame
InformationCard / EditorialCard
TextLink
StatusBadge (only if semantically useful)
Skeleton
ErrorState
```

## New primitive

N/A.

---

# 9. Primary / Secondary CTA

## Primary per card

```text
Label: View Tour / 여행 자세히 보기
Action: navigate
Destination: /tours/:tourId
Enabled when: valid tour identity
Loading: Signature Shared Transition if image available
Failure: animation fallback + normal route navigation
```

## Page-level secondary

N/A — collection 자체가 navigation surface.

## Style Explainer CTA

[FRONTEND PROPOSAL]

CTA를 추가하지 않는다.

Style은 Tour Detail에서 실제 선택하므로,
이 section에서는 개념만 이해시킨다.

## Destructive

N/A.

---

# 10. Interaction Rules

## Tour card

- click/tap → corresponding Tour Detail
- keyboard accessible
- pointer environment에서만 hover
- selected state 없음

## Card hover

CP4 `Editorial Card Hover`의 억제된 variation:

```text
image scale 1 → 1.02/1.025
border/surface subtle
Explore arrow +4px max
```

## Image / Text click target

가능하면 하나의 anchor/button semantics.

Nested link 금지.

## Style explainer

Non-interactive.

Tooltip에 핵심 정보를 숨기지 않는다.

## Header

Global navigation.

---

# 11. Motion

## Page Entry

`Standard Forward Page Transition`

Home CTA에서 진입하더라도
Home→Tours 자체는 Signature Hero transition 대상이 아니다.

## Intro

`Section Reveal`

## Cards

First viewport card:

- controlled reveal
- 40–80ms stagger 가능

스크롤 이후:

- one-time section reveal

## Card → Tour Detail

`Signature Shared Transition`

Card image → Detail Hero.

Fallback:

- direct fade/page transition

## Card hover

`Card Hover`

## Reduced Motion

- card image scale 제거
- shared transform 제거
- 80–120ms opacity transition

---

# 12. Loading

## Page shell

Header + page title area geometry 즉시 확보.

## Tour collection

```text
TourCollectionCard
↔ TourCardSkeleton
```

4개 고정 slot.

Desktop:
- 2×2 skeleton composition

Mobile:
- 1-column 4 items

## Tour Style explainer

Style rules가 static shared configuration으로 관리된다면 즉시 render.

API-driven이라면 skeleton보다
전체 Tours data 성공 이후 render를 권장.

## Image

Progressive Image Reveal.

## No full-page spinner

Header/intro를 유지하고 collection 부분만 skeleton.

---

# 13. Empty

Applicable: exceptional.

4개 Theme가 고정 baseline이므로 0개는 일반 정상 상태가 아님.

## Trigger

`GET /api/v1/tours`가 empty array를 반환하고
Frontend가 server-driven list를 사용한다고 가정할 때.

## Copy

```text
현재 표시할 여행 상품이 없습니다.
잠시 후 다시 확인해주세요.
```

## CTA

```text
다시 시도
```

Secondary:

```text
홈으로
```

## Preserved UI

- Header
- Page Intro
- Footer

---

# 14. Error

## Network

Collection section:

```text
여행 상품을 불러오지 못했습니다.
연결 상태를 확인하고 다시 시도해주세요.
```

Recovery: local retry.

## Server

```text
잠시 문제가 발생했습니다.
잠시 후 다시 시도해주세요.
```

## Not Found

N/A at collection route.

## Validation

N/A.

## Conflict

N/A.

## Unauthorized

N/A — public.

## Offline

Cached collection이 있으면 유지 + subtle banner.

없으면 collection area offline state.

## Image Failure

개별 card fallback surface.

다른 카드 유지.

## Partial Failure

가능한 경우 성공한 Theme cards 유지.

다만 4개 중 특정 Theme data만 누락되었을 때:
- 임의로 placeholder Theme data를 “실제 상품”처럼 만들지 않음
- 누락 slot에 local error surface 또는 curated fallback이 있다면 명시적 source 필요

---

# 15. Retrying / Refreshing

## Retry scope

Collection section 또는 실패 card.

## During retry

실패 영역만 skeleton.

## Existing content preserved

Yes, 성공 data가 있으면 유지.

## Refreshing

기존 4개 카드 유지.

새 data 도착 시:
- text는 local replace
- image URL 변경 시 progressive image transition

## Stale

Theme narrative stale은 비교적 허용 가능.

하지만 향후 Tour availability를 이 화면에 표시한다면 freshness rule을 재검토.

현재 CP6-A에서는 일정/가격/모집 수치를 Tours에 노출하지 않는다.

---

# 16. Edge Cases

## Direct URL

`/tours` 정상.

## Refresh

동일 layout 복구.

## Only some tour data available

성공 card 유지 + 실패 부분 local recovery.

## Card title length

한국어/영문 localization에서 2줄까지 허용.

card height는 text 차이 때문에 과도하게 흔들리지 않게 min layout 설정.

## Different image aspect ratio

ImageFrame preset으로 crop 통일.

## Rapid card click

navigation pending 중 duplicate route push 방지.

## Browser Back

Home에서 왔으면 Home scroll restore 권장.

## Auth status loading

Tours content와 독립.

Account area만 local placeholder 가능.

## Slow network

Intro 즉시,
card skeleton 유지.

## Very wide desktop

2-column card가 지나치게 커지지 않도록 `container-main` 제한.

## Tablet

8-column grid에서:
- 충분한 폭이면 2-column
- 카드 폭이 좁아지는 지점부터 1-column 전환
- 정확한 breakpoint는 CP9에서 최종 검증

---

# 17. Accessibility

## Structure

`<main>` 안에:

```text
<h1>Theme Tours</h1>
<section aria-labelledby="tour-collection-heading">
```

각 Tour title:

`<h2>` 또는 card collection 구조에 맞는 heading.

Style Explainer:

별도 `<section>` + heading.

## Keyboard

각 card link가 한 번만 focus.

Tab 순서:

```text
Header
→ Honeymoon
→ Parents
→ Golf
→ Trekking
→ Footer
```

visual 2-column row order와 DOM order 일치.

## Screen Reader

Accessible name:

```text
Honeymoon Romance 여행 자세히 보기
```

Included highlights가 card 안에서 너무 길면
스크린리더 반복을 피하도록 semantic grouping.

## Images

Tour 이미지는 Theme 분위기 전달에 중요하므로
적절한 scene alt 제공.

title 반복만 하는 alt 금지.

## State

Style availability는 색이나 chip color만으로 표현하지 않음.

## Reduced Motion

CP4 준수.

## Touch

full card link 또는 action target 44px 이상.

---

# 18. API / Shared Contract Dependency

| Need | Current Source | Status | Frontend Impact |
|---|---|---|---|
| Theme 4종 | Requirements/Business Rules | CONFIRMED | 카드 inventory |
| Theme별 포함 서비스 | 원본 프로젝트 요구사항 | CONFIRMED | Highlights |
| Tour Styles 3종 | Business Rules | CONFIRMED | Explainer |
| Honeymoon/Parents Classic 제한 | Business Rules | CONFIRMED | Available style text |
| Style 후 Hotel/Transport/Meal 변경 | Requirements | CONFIRMED | Customization note |
| Honeymoon 2-team semantics | 최신 팀 결정 | CONFIRMED | 비교 copy에서 사용 가능 |
| 기타 Tour 3명 이상 | 최신 팀 결정/requirements | CONFIRMED | Detail 전까지는 수치 노출 최소 |
| `GET /api/v1/tours` | API skeleton | CONFIRMED endpoint skeleton | data source 후보 |
| Tour response DTO | API v0.2 | BLOCKED BY SHARED CONTRACT | runtime mapping |
| Actual price | baseline TBD | TBD | Collection에 미노출 |
| Actual destination | contract 없음 | TBD | 임의 생성 금지 |
| Actual schedule | TourSchedule contract TBD | BLOCKED BY SHARED CONTRACT | Collection에 미노출 |
| Tour image URL/source | contract 없음 | TBD | asset strategy 필요 |

---

# 19. TBD / Blocker

## TBD

- 실제 Theme 이미지 asset
- 최종 Tour card copy
- Frontend static config vs Backend-driven collection의 최종 선택
- Tour collection image alt 최종 asset 기반 문구

## Blocked by Shared Contract

- `GET /api/v1/tours` response DTO

Tours UI 자체는 mock/static contract-safe data로 먼저 구현 가능.

## Frontend Proposal Awaiting Audit

- no search/filter/sort
- 2-column desktop curated collection
- no prices/schedules on collection
- style explainer at bottom
- no card carousel on mobile

공통 요구와 충돌하지 않으며 CP6-G에서 최종 cross-screen audit.

---

## CP6-H Contract Gate — Theme vs TourProduct

**P0 contract gate — v0.1.1 is present on `docs/main` and is treated as the active planning baseline.**

The latest shared proposal distinguishes:

```text
Theme
1 : N
TourProduct
```

and `/api/v1/tours` represents `TourProduct`, not four Theme records.

This screen spec currently uses the four Theme values as the primary curated navigation model.
Do not hard-code “one Theme = one TourProduct” in the data layer until the approved baseline is confirmed.

Required team decision:

```text
Theme discovery
→ how one or more TourProducts are selected/listed
→ TourProduct detail route
```

Frontend may keep the visual Theme-first concept, but runtime routing/data mapping must follow the approved contract.


# 20. Acceptance Criteria

## Functional

- [ ] `/tours` direct access 가능.
- [ ] 4 Theme가 모두 탐색 가능.
- [ ] 각 card가 올바른 Tour Detail route로 이동.
- [ ] Header navigation 정상.
- [ ] card rapid click 중복 navigation 없음.

## Visual / Design System

- [ ] Home보다 정돈된 비교형 layout을 사용.
- [ ] OTA 검색결과 UI처럼 보이지 않음.
- [ ] Filter/Sort/Pagination을 불필요하게 만들지 않음.
- [ ] card마다 heavy shadow가 없음.
- [ ] Theme color는 photography/local accent 수준.
- [ ] Available Style 정보가 기능적으로 읽힘.

## Loading / State

- [ ] 4개 card skeleton이 final geometry와 가깝다.
- [ ] Header/Intro는 collection loading 때문에 사라지지 않는다.
- [ ] image fail이 card 전체를 깨뜨리지 않는다.

## Error / Recovery

- [ ] collection network failure를 local retry 가능.
- [ ] partial failure 시 성공 card 유지.
- [ ] offline cached data가 있으면 유지.

## Responsive

- [ ] Desktop 2-column 비교가 명확하다.
- [ ] Mobile 1-column에서 4 Theme 모두 노출된다.
- [ ] mobile carousel 사용하지 않는다.
- [ ] title/style text가 overflow하지 않는다.

## Accessibility

- [ ] 각 Tour card가 하나의 명확한 focus target이다.
- [ ] card accessible name에 Theme명이 포함.
- [ ] 2-column visual order와 DOM order가 일치.
- [ ] style availability는 색만으로 전달하지 않는다.
- [ ] reduced-motion에서 shared/card motion 제거.

## Navigation / Draft

- [ ] Tour Detail 진입 시 selected Theme identity가 정확히 전달된다.
- [ ] Back 시 실제 navigation history를 존중.
- [ ] Shared Hero transition 실패가 navigation 실패를 만들지 않는다.

## Contract Safety

- [ ] 실제 destination/price/schedule을 임의 생성하지 않는다.
- [ ] Source에 없는 상품 서비스를 만들어내지 않는다.
- [ ] API DTO field를 임의 고정하지 않는다.
- [ ] Frontend copy와 Business Rule을 명확히 구분한다.

---

# Screen Status

```text
Ready
```

CP6-A 기준 Tours Collection Screen Spec 완료.
