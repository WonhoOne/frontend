# [S11] My Trips / Travel History

> File: `screens/11-my-trips.md`  
> Route / Trigger: `/my-trips`  
> CP6 Status: **Ready — CP6-F Complete**  
> Depends on:
> - `07-SCREEN-SPECS.md`
> - `02-INFORMATION-ARCHITECTURE.md`
> - `04-DESIGN-SYSTEM.md`
> - `05-MOTION-SYSTEM.md`
> - `06-UI-STATES.md`
> - `screens/10-previous-trips-popup.md`

---

# 1. Screen Purpose

My Trips는 로그인 고객이 **과거 여행 이력을 최근 순으로 확인하는 개인 여행 아카이브 화면**이다.

현재 Shared Contract에서 명확하게 보장되는 것은 `Travel History`다.

따라서 CP6에서는 `Upcoming / Past`를 임의로 만든 종합 예약 대시보드가 아니라,
**History-first 화면**으로 고정한다.

현재 신청 상태를 보는 역할은 `Reservation Detail`이 담당한다.

---

# 2. Route / Entry Conditions

## Route

```text
/my-trips
```

## Entry

- Global Header `My Trips`
- Previous Trips Popup `전체 여행 보기`
- direct URL

## Authentication

[CONFIRMED product intent / BLOCKED implementation]

Travel History는 로그인 고객의 기능.

미인증 접근 시:

```text
→ Auth Overlay / Login
→ success
→ /my-trips restore
```

실제 protected-route mechanism은 Auth Contract 필요.

## Exit

- Tour browsing: `/tours`
- Browser Back
- Header navigation

## History Item Detail

[TBD]

현재 과거 여행 하나의 dedicated detail endpoint/route가 명확하지 않다.

`GET /api/v1/reservations/{reservationId}`를 history와 동일 개념으로 간주해
임의 연결하지 않는다.

---

# 3. User Goal

Primary goal:

> 내가 이전에 이용한 여행을 최근 순으로 확인한다.

Secondary goals:

- 상품/기간/Tour Style/가격 확인
- 기록이 없으면 새로운 여행 탐색
- 향후 history detail contract가 생기면 개별 여행 상세로 이동

---

# 4. Required Data

[CONFIRMED]

Travel History recent-first.

Minimum fields:

```text
상품
기간
Tour Style / 등급
가격
```

## Optional / TBD

- Theme image
- completed date
- reservation ID
- history ID
- status
- destination
- configuration detail
- thumbnail URL

source/contract가 없는 필드는 임의 필수 정보로 만들지 않는다.

## API

[CONFIRMED endpoint skeleton]

```text
GET /api/v1/customers/me/travel-history
```

[BLOCKED BY SHARED CONTRACT]

response DTO.

---

# 5. Desktop Layout

## Page Tone

개인 여행 archive.

Home보다 dramatic하지 않고,
Reservation Review보다 조금 더 감성적.

## Structure

```text
┌──────────────────────────────────────────────────────────────┐
│ GLOBAL HEADER                                                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ MY TRIPS                                                     │
│ Your travel history                                         │
│                                                              │
│ 가장 최근 여행부터 보여드립니다.                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ [ image ] Outdoor Trekking                                  │
│           2026.xx.xx – xx.xx                                │
│           Grand                                             │
│           ₩...                                              │
├──────────────────────────────────────────────────────────────┤
│ [ image ] Honeymoon Romance                                 │
│           ...                                               │
├──────────────────────────────────────────────────────────────┤
│ ...                                                         │
└──────────────────────────────────────────────────────────────┘
```

## List vs Grid

[FRONTEND PROPOSAL]

Desktop에서도 **single-column wide list**를 기본으로 한다.

이유:

- 기간/등급/가격을 비교하기 쉽다.
- 여행 archive의 시간 순서가 잘 보인다.
- 2~3-column card grid보다 recent-first 흐름이 명확하다.

Large thumbnail + metadata composition.

## Container

`container-transaction` 또는 `container-main` 안에서
실제 card width를 900–1040px 정도로 제한 가능.

정확한 width는 CP9 responsive audit 대상.

---

# 6. Mobile Layout

```text
Header
↓
My Trips
↓
Trip Card
↓
Trip Card
↓
Trip Card
↓
Explore Tours
```

## Trip Card

```text
full-width image
or
compact thumbnail row depending viewport

product
period
style
price
```

Mobile에서는 metadata가 너무 좁아지면
image top + content below 구조로 변환.

## No Tabs by Default

현재 `Upcoming / Past` tab 금지.

Reservation status/list contract가 생기면 향후 확장.

---

# 7. Exact Section Order

```text
01 Global Header
02 Page Heading
03 Supporting Copy
04 Travel History List
05 Empty/Error State when applicable
06 Explore Tours CTA
07 Footer
```

History list:

```text
recent
→ older
```

---

# 8. Component Composition

## Page / Domain Components

```text
MyTripsPage
├── GlobalHeader
├── MyTripsHeading
├── TravelHistoryList
│   └── TripCard × N
├── MyTripsStateRegion
├── ExploreToursAction
└── GlobalFooter
```

## Shared with Popup

`TripCard`와 `PreviousTripPreviewCard`는
가능하면 같은 data/view model을 공유한다.

Popup version은 compact,
My Trips version은 full.

## Design-System Primitives

```text
PageContainer
Section
ImageFrame
InfoCard
Button
TextLink
Skeleton
EmptyState
ErrorState
```

---

# 9. Primary / Secondary CTA

## History exists

Primary page CTA 없음.

목록 자체가 primary content.

Secondary:

```text
다른 여행 둘러보기
→ /tours
```

## Empty

Primary:

```text
첫 여행 둘러보기
→ /tours
```

## Item action

[TBD]

detail contract 전에는 row 전체를 임의 link 처리하지 않는다.

---

# 10. Interaction Rules

## Load

authenticated customer history fetch.

## Sort

[CONFIRMED behavior]

최근 여행 순.

Frontend가 sort한다면
계약된 canonical date field를 사용해야 함.

DTO가 없다면 임의 필드 추정 금지.

## Refresh

pull-to-refresh 같은 mobile custom gesture는 필수 아님.

background refetch 가능.

## Header My Trips

현재 route active indication 가능.

## Item Interaction

detail contract가 없으면
hover/cursor를 interactive처럼 보이게 하지 않는다.

---

# 11. Motion

Page Entry:

`Standard Forward Page Transition`

History list:

- first viewport cards subtle reveal
- 40ms 정도 controlled stagger
- 전체 긴 목록 순차 animation 금지

Refresh:

local content update.

Image:

`Progressive Image Reveal`

Reduced Motion:

opacity only.

---

# 12. Loading

Header + page heading은 즉시.

List:

```text
TripCard
↔ TripCardSkeleton
```

Initial viewport:

```text
3–5 cards
```

정도 skeleton.

full-page spinner 금지.

## Card geometry

실제 metadata row와 같은 높이 유지.

## Image

placeholder ratio 사전 확보.

---

# 13. Empty

Applicable: Yes.

Copy:

```text
아직 여행 기록이 없습니다.

첫 번째 여행을 만들어보세요.
```

CTA:

```text
여행 둘러보기
→ /tours
```

Empty state가 error처럼 보이지 않게 한다.

---

# 14. Error

## Network

```text
여행 기록을 불러오지 못했습니다.
연결 상태를 확인하고 다시 시도해주세요.
```

## Server

```text
잠시 문제가 발생했습니다.
잠시 후 다시 시도해주세요.
```

## Unauthorized

Auth Overlay/Login.

성공 후 `/my-trips` 복귀.

## Offline

cached history가 있으면 유지 + subtle stale banner.

없으면 offline state.

## Image Failure

card metadata 유지 + branded image fallback.

## Partial Failure

개별 image 실패는 local.

History data 자체 일부 malformed:
- 안전하게 표시 가능한 필드만 표시
- invented value 금지
- 운영 로그

---

# 15. Retrying / Refreshing

## Retry

list 영역만.

## Refreshing

기존 list 유지.

새 history가 있으면 top에 반영.

## Stale

Travel History는 current reservation/recruitment보다
freshness 민감도가 낮음.

그러나 recent-first ordering은 일관되게 유지.

---

# 16. Edge Cases

## Direct URL unauthenticated

Auth → return `/my-trips`.

## Direct URL authenticated

normal fetch.

## Refresh

route 유지.

## No history

empty state.

## Very long history

[TBD]

pagination/infinite scroll contract 없음.

Frontend가 임의 page size/API parameter를 만들지 않는다.

UI는 긴 list를 수용 가능하게 설계.

## Duplicate/equal dates

Backend ordering 또는 stable ordering contract 필요.

임의 tie-break business rule 생성 금지.

## Missing price

0원이나 “무료”로 만들지 않는다.

contract gap.

## Missing image

fallback.

## Very long title

2줄 정도 허용.

## Future active reservations

현재 history endpoint만으로
Upcoming 영역을 만들지 않는다.

## History item direct detail

endpoint/ID contract 전 임의 route 생성 금지.

---

# 17. Accessibility

## Structure

```html
<main>
  <h1>My Trips</h1>
  <section aria-labelledby="history-heading">
    <ul>
      <li>...
```

## Reading Order

recent-first visual order = DOM order.

## Metadata

상품 / 기간 / Tour Style / 가격이
screen reader에서 의미 있게 구분되어야 함.

## Interactive state

item이 link가 아니면:
- hover/focus affordance를 주지 않음
- `role=button` 임의 부여 금지

## Images

scene alt 또는 decorative.

## Focus

Retry / Explore CTA 명확.

## Touch

>=44px.

## Reduced Motion

지원.

---

# 18. API / Shared Contract Dependency

| Need | Current Source | Status | Frontend Impact |
|---|---|---|---|
| Travel History customer feature | requirements | CONFIRMED | page purpose |
| recent-first | original/shared requirement | CONFIRMED | ordering |
| product/period/style/price | original/shared requirement | CONFIRMED | card minimum fields |
| `GET /api/v1/customers/me/travel-history` | API skeleton | CONFIRMED endpoint skeleton | fetch |
| History DTO | API v0.2 | BLOCKED BY SHARED CONTRACT | mapping |
| pagination | none | TBD | long list |
| detail item ID/route | none | TBD | card action |
| active reservations list | none | BLOCKED/ABSENT | no Upcoming tab |
| image/theme metadata | none | TBD | card image |
| auth mechanism | baseline TBD | BLOCKED BY SHARED CONTRACT | protected route |

---

# 19. TBD / Blocker

## TBD

- pagination/infinite scroll
- item detail interaction
- image source
- exact date/price formatting
- long-history performance strategy after DTO known

## Blocked by Shared Contract

- Travel History DTO
- auth mechanism
- canonical date field
- history item ID/detail contract
- active reservation list if future Upcoming view desired

## Frontend Proposal Awaiting Audit

- history-first single-column archive
- no Upcoming/Past tabs
- large-image low-density cards
- no fake interactivity on history items

---

# 20. Acceptance Criteria

## Functional

- [ ] authenticated customer의 Travel History를 로드한다.
- [ ] recent-first로 표시.
- [ ] 각 item에 상품/기간/등급/가격을 표시할 수 있다.
- [ ] Empty에서 Tours로 이동 가능.
- [ ] unauthorized 접근은 Login 후 `/my-trips` 복구.
- [ ] active reservation data 없이 Upcoming을 만들지 않는다.

## Visual

- [ ] personal archive tone.
- [ ] Home보다 낮은 motion/visual intensity.
- [ ] dashboard/table 느낌이 과도하지 않음.
- [ ] image와 metadata hierarchy가 명확.

## Loading / Error

- [ ] list skeleton 3–5개.
- [ ] full-page spinner 없음.
- [ ] refresh 중 기존 list 유지.
- [ ] image fail이 metadata를 지우지 않음.
- [ ] offline cached data 구분 가능.

## Responsive

- [ ] desktop wide list가 읽기 쉽다.
- [ ] mobile single-column.
- [ ] 긴 title/period/price가 overflow하지 않음.

## Accessibility

- [ ] semantic history list.
- [ ] visual recent-first = DOM order.
- [ ] metadata labels 명확.
- [ ] 비interactive item에 fake button semantics 없음.
- [ ] focus-visible.
- [ ] reduced motion.

## Contract Safety

- [ ] Upcoming/Past를 계약 없이 생성하지 않는다.
- [ ] history item detail route를 임의 생성하지 않는다.
- [ ] missing price를 0원으로 만들지 않는다.
- [ ] DTO/date field/pagination params를 임의 정의하지 않는다.

---

# Screen Status

```text
Ready
```
