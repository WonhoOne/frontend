# Mister World Frontend Information Architecture & End-to-End UX Flow

> Document: `02-INFORMATION-ARCHITECTURE.md`  
> Status: **CP1 Complete**  
> Scope: `WonhoOne/frontend` Customer GUI  
> Planning baseline: 2026-09-29  
> Depends on: `00-PLANNING-INDEX.md`, `01-PRODUCT-EXPERIENCE.md`

---

# 0. CP1 Objective

CP1의 목표는 화면을 예쁘게 그리기 전에 **Mister World 고객 경험의 전체 골격**을 잠그는 것이다.

이 문서가 결정하는 것:

- 어떤 화면이 존재하는가
- 사용자는 어디에서 어디로 이동하는가
- 각 화면의 1차 목적은 무엇인가
- Global Navigation은 어떻게 작동하는가
- 인증이 흐름에 어디에서 개입하는가
- 로그인 직후 과거 여행 목록은 어떻게 노출되는가
- Style / Schedule / Configuration / Reservation의 순서를 어떻게 구성하는가
- Browser Back / Close / Cancel의 의미는 무엇인가
- Desktop / Mobile에서 modal·sheet·page가 어떻게 변환되는가
- Voice는 기존 GUI 흐름에 어디에서 붙는가
- Deep Link와 refresh 시 어떤 화면 문맥을 복구해야 하는가
- 어떤 결정이 Shared Contract 확정 전까지 TBD인가

CP1은 색상, 타이포, 정확한 spacing, animation duration을 확정하지 않는다.
그 항목은 CP2~CP4에서 다룬다.

---

# 1. Information Architecture Principles

## IA-01 — Theme-first

Mister World는 대규모 OTA가 아니라 4개 고정 Theme Tour가 중심인 서비스다.

따라서 정보구조의 첫 질문은:

> “어디로 가고 싶은가?”

보다

> “어떤 순간을 위한 여행인가?”

이다.

Primary discovery:

```text
Honeymoon Romance
Parents Healing
Golf Challenge
Outdoor Trekking
```

검색창 / 복잡한 필터 / 지역 중심 navigation은 핵심 IA로 두지 않는다.

---

## IA-02 — Theme → Style → Configuration을 분리한다

다음 세 개념은 화면에서도 서로 다른 단계로 체감되어야 한다.

```text
Theme Tour
    ↓
Tour Style
    ↓
Tour Configuration
```

- Theme Tour: 여행의 목적과 기본 서비스
- Tour Style: Classic / Grand / Premium이라는 시작 구성
- Tour Configuration: Style 이후 고객이 변경한 최종 Hotel / Transport / Meal / Extra 조합

Style과 Configuration을 한 화면에서 의미 없이 섞지 않는다.

---

## IA-03 — Reservation은 “선택 화면”이 아니라 “최종 확인 화면”

Reservation Review에 진입한 이후에는 사용자가 새로운 상품을 탐색하게 하지 않는다.

이 화면의 역할:

- 내가 고른 여행을 검토
- 신청자 정보를 검토
- 최종 가격을 확인할 수 있다면 확인
- 여행 신청

수정이 필요하면 명시적인 `Change`를 통해 이전 단계로 돌아간다.

---

## IA-04 — Recruitment status는 독립 정보가 아니다

모집 상태는 다음 세 위치에서 문맥에 맞게 반복된다.

1. Tour Detail — 일정 선택 판단
2. Reservation Success — 신청 후 출발 가능성 확인
3. Reservation/Trip Detail — 이후 상태 재확인

같은 데이터를 화면마다 다른 의미로 보여준다.

---

## IA-05 — Auth가 탐색을 끊지 않는다

상품 탐색과 Configuration 설계는 가능한 한 인증 전에 진행할 수 있게 설계한다.

단, **실제 예약 신청 시점의 로그인 필수 여부는 현재 Shared Contract에 명시되어 있지 않다.**

따라서 다음 UX는 **Frontend Proposal**로 둔다.

```text
Guest
→ Tour browsing
→ Configuration
→ Reservation Review
→ Submit 시 인증 필요 여부 확인
```

인증이 필요하다고 확정될 경우:

```text
Submit
→ Login overlay
→ 로그인 성공
→ 기존 Reservation Draft 복구
→ Review로 복귀
→ 사용자가 다시 Submit
```

Frontend가 계약 확정 전에 “예약은 무조건 로그인 필요”를 Business Rule로 만들지 않는다.

---

# 2. Top-Level Sitemap

```text
Mister World
│
├── Home `/`
│
├── Tours `/tours`
│   └── Tour Detail `/tours/:tourId`
│       └── Configure `/tours/:tourId/configure`
│
├── Reservation
│   ├── Review `/reservation/review`
│   ├── Success `/reservation/:reservationId/success`
│   └── Detail `/reservations/:reservationId`
│
├── Account
│   ├── Login `/login`
│   ├── Sign Up `/signup`
│   └── Travel History `/my-trips`
│
└── Global Overlays
    ├── Auth Overlay
    ├── Previous Travel History Popup
    ├── Mobile Navigation Sheet
    ├── Recoverable Error Surface
    └── Voice Control Surface
```

---

# 3. Route Contract

## 3.1 `/` — Home

### Purpose

- Mister World 브랜드 첫 인상
- 4개 Theme Tour 발견
- `Tours` 또는 개별 Theme Detail로 진입

### Primary CTA

`Explore Theme Tours`

### Secondary entry

Hero 아래 Theme card에서 바로:

```text
/tours/:tourId
```

### Navigation behavior

Desktop:

- Hero 위에서는 transparent / overlay header 가능
- Hero를 지나면 solid surface로 전환 가능

Mobile:

- Compact logo + menu / account
- Theme cards는 touch-first layout

### Back behavior

Root route이므로 앱 내부 back target 없음.

---

## 3.2 `/tours` — Theme Tours Collection

### Purpose

4개 Theme Tour를 한 번에 비교 가능한 curated collection으로 보여준다.

### Why this page exists

Home에도 Theme cards가 있지만 역할이 다르다.

```text
Home
= 감성적 발견

Tours
= 비교 가능한 전체 상품 컬렉션
```

### Core content

- Intro heading
- 4 Theme Tour cards
- 각 카드의 핵심 차별점
- 이용 가능한 Style 범위의 간략 정보
- `View Tour` CTA

### Not included

- 복잡한 destination search
- multi-filter sidebar
- sorting
- 수십 개 상품용 pagination

현재 상품 수와 요구사항에 과도하다.

---

## 3.3 `/tours/:tourId` — Tour Detail

### Purpose

선택한 Theme Tour를 이해하고,
Style + Schedule을 선택해 Configuration으로 진입하게 한다.

### Information order

```text
Hero / Theme identity
↓
Tour story / positioning
↓
Included services
↓
Tour Style selector
↓
Available schedule section
↓
Recruitment status
↓
Primary CTA
```

### Style behavior

Honeymoon Romance:

```text
Grand
Premium
```

Parents Healing:

```text
Grand
Premium
```

Golf Challenge:

```text
Classic
Grand
Premium
```

Outdoor Trekking:

```text
Classic
Grand
Premium
```

### Schedule

TourSchedule이 공통 Domain에 존재하므로,
고객이 예약하기 전 특정 일정을 선택할 수 있는 UI 영역을 둔다.

정확한 일정 데이터 구조는 API/ERD v0.2 전까지 TBD.

### CTA enablement

`Configure this trip`

CTA 활성 조건은 최소 다음 UI state를 만족할 때로 기획한다.

- Style selected
- Schedule selected

정확한 Backend validation은 별도다.

### Deep-link behavior

`:tourId`가 유효하지 않으면:

```text
Tour Not Found
→ Back to Tours
```

빈 페이지나 generic 500으로 보내지 않는다.

---

## 3.4 `/tours/:tourId/configure` — Tour Configuration

### Purpose

선택한 Theme Tour / Style / Schedule을 바탕으로
최종 Tour Configuration을 만든다.

### Entry requirements

Frontend navigation 기준:

- valid Tour
- selected Style
- selected Schedule

### URL state

공유/새로고침 복구를 위해 Style / Schedule context는
향후 URL search parameter 또는 server draft identifier 사용을 검토한다.

예시:

```text
/tours/:tourId/configure?style=grand&schedule=:scheduleId
```

이 parameter 이름은 **Frontend route proposal**이며 Backend API Contract가 아니다.

### Desktop composition

```text
┌──────────────────────────────┬──────────────────────┐
│                              │                      │
│  Configuration Controls      │  Sticky Trip Summary │
│                              │                      │
│  Hotel                       │  Theme               │
│  Transport                   │  Style               │
│  Meal                        │  Schedule            │
│  Extras                      │  Current options     │
│                              │  Price when valid    │
│                              │                      │
│                              │  [Continue]          │
└──────────────────────────────┴──────────────────────┘
```

### Mobile composition

Sticky side panel을 유지하지 않는다.

```text
Configuration controls
↓
persistent bottom summary bar
↓ tap
summary bottom sheet
```

### Back behavior

Back to Tour Detail:

- 선택한 Style / Schedule을 유지
- 가능하면 scroll context도 유지

### Exit behavior

다른 Tour로 이동하려 할 때 의미 있는 draft가 존재하면
`Discard current configuration?` 보호 UX를 사용할 수 있다.

이것은 Frontend UX이며 Backend 계약과 무관하다.

### Continue

`Review trip`

→ `/reservation/review`

---

# 4. Reservation Flow

## 4.1 `/reservation/review` — Reservation Review

### Purpose

새로운 옵션을 고르는 것이 아니라 최종 신청 내용을 검토한다.

### Information hierarchy

```text
Trip identity
Theme / Schedule

Configuration
Style / Hotel / Transport / Meal / Extras

Recruitment / party context
(only when Shared Contract exposes it; not a required reservation form field)

Applicant information
(only to the extent supported by the Reservation/Auth contract)

Price summary
(when contract supports calculation)

Final action
```

### Edit behavior

각 section에는 필요한 경우:

`Change`

를 제공하고 원래 단계로 돌아간다.

예:

```text
Change configuration
→ Configure

Change schedule/style
→ Tour Detail
```

Browser Back도 Configure로 돌아간다.

### Reservation draft requirement

Review에 도착한 configuration은 page navigation만으로 유실되면 안 된다.

정확한 저장 방식은 CP8에서 결정한다.

후보:

- in-memory state + session persistence
- server-side draft
- URL-recoverable subset

### Submit behavior

```text
Idle
→ Submitting
→ Success or Recoverable Failure
```

실제 인증 필요 여부는 Shared Contract 확정에 종속된다.

---

## 4.2 `/reservation/:reservationId/success` — Reservation Success

### Purpose

신청이 성공했다는 사실과
현재 departure 상태를 동시에 전달한다.

### Content priority

1. Application success
2. Theme / Schedule summary
3. Recruitment status
4. Confirmation expectation
5. Next action

### Honeymoon recruitment

```text
Couple 01  YOU / Joined
Couple 02  Waiting

1 / 2 Couples
```

2팀 충족:

```text
2 / 2 Couples
Confirmed
```

### Other Tours

```text
2 / 3 Travellers
```

충족:

```text
3 / 3+
Confirmed
```

Backend가 최종 상태를 제공해야 하며 Frontend가 직접 확정 판정을 저장하지 않는다.

### Primary next action

`View reservation`

→ `/reservations/:reservationId`

### Secondary next action

`Explore more tours`

→ `/tours`

---

## 4.3 `/reservations/:reservationId` — Reservation Detail

### Purpose

특정 신청의 현재 상태를 이후 다시 확인한다.

### Why this is separate from Travel History

현재 API skeleton에는:

```text
GET /api/v1/reservations/{reservationId}
```

와

```text
GET /api/v1/customers/me/travel-history
```

가 별도 개념으로 존재한다.

따라서 IA도 다음처럼 분리한다.

```text
Reservation
= 신청/현재 상태

Travel History
= 과거 여행 이력
```

향후 Backend Contract에서 통합된다면 IA를 조정한다.

### Core content

- Theme
- Schedule
- Style
- Final Configuration
- Recruitment / confirmation state
- Applicant summary when the Reservation contract exposes it
- Price when available

취소 기능은 현재 v0.1 scope에 없으므로 CTA로 만들지 않는다.

---

# 5. Authentication Architecture

## 5.1 `/login`

### Desktop

기본 진입은 modal-route UX를 우선한다.

예:

```text
Current page
  ↓ dim / blur
Login dialog
```

로그인 성공 후 원래 context로 복귀한다.

### Direct URL fallback

사용자가 `/login`을 직접 새 탭에서 열었을 때는
독립된 full-page auth 화면으로 정상 동작해야 한다.

### Mobile

dialog보다 full-screen sheet/page 형태를 우선한다.

---

## 5.2 `/signup`

회원가입 시 원본 요구사항에서 명시된 고객 정보가 필요하다.

최소:

- 성명
- 주소
- 연락처

추가 필드는 Shared Contract가 정의하기 전 임의 필수값으로 만들지 않는다.

---

# 6. Login Success → Previous Travel History Popup

원본 요구사항은 로그인 후 저장된 이전 여행 목록을
팝업창에서 보여주는 것이다.

따라서 CP1에서는 이를 명시적인 global post-login flow로 둔다.

```text
Login success
→ Previous Travel History request
→ History Popup
→ close OR View all trips
```

## Desktop

Centered modal 또는 large dialog.

권장 내용:

```text
Welcome back

Your previous trips

[Trip 1]
상품
기간
Tour Style
가격

[Trip 2]
...

[View all trips]
[Close]
```

### Order

최근 여행 순.

## Mobile

화면 높이를 고려해 full-height bottom sheet 또는 full-screen modal로 변환.

## Empty history

이전 여행이 없으면
빈 목록을 억지로 보여주지 않고 간단한 welcome empty state를 표시한다.

```text
Welcome to Mister World.

No previous trips yet.

[Explore tours]
```

## Failure

History fetch 실패가 로그인 성공 자체를 실패로 되돌리면 안 된다.

```text
Login success
→ History fetch failed
→ lightweight retry/error inside popup
```

사용자는 popup을 닫고 서비스를 계속 사용할 수 있어야 한다.

---

# 7. `/my-trips` — Travel History

### Purpose

로그인 고객의 과거 여행 이력을 최근 순으로 확인한다.

### Source-aligned required fields

각 item은 최소:

- 상품
- 기간
- Tour Style
- 가격

을 보여줄 수 있어야 한다.

### Layout

Desktop:

```text
My Trips

Past journeys
─────────────────────────
Trip Card
Trip Card
Trip Card
```

Mobile:

single-column cards.

### Status tabs

`Upcoming / Past` 같은 taxonomy는 현재 Shared Contract에 충분히 정의되어 있지 않다.

따라서 CP1에서는 기본을 **Travel History list**로 고정하고,
향후 Reservation Status contract가 확정되면 tab 확장을 검토한다.

---

# 8. Global Navigation

## Desktop Primary Navigation

```text
Mister World

Tours
My Trips

Account / Login
```

### Notes

- `Tours`는 `/tours`
- `My Trips`는 `/my-trips`
- 로그인 전 `My Trips` 접근 시 Auth Overlay를 띄우는 UX를 우선 검토
- 로그인 후 Account menu 표시 가능

## Home Header Behavior

Hero 위:

```text
transparent / image-aware
```

scroll 이후:

```text
solid / elevated
```

CP2에서 시각 규칙 확정.

## Transaction Header

Configure / Reservation 단계에서는 탐색 Navigation을 축소한다.

목표:

- 사용자의 현재 작업 집중
- 실수로 draft를 잃는 navigation 방지

예:

```text
Mister World        Secure / focused flow
```

단, 사용자를 가두지 않는다.
명확한 Back/Close 경로는 제공한다.

---

# 9. End-to-End Primary Flow

```text
HOME
  │
  ├──────────→ TOURS
  │              │
  └──────────────┴──→ TOUR DETAIL
                         │
                         ├─ choose STYLE
                         ├─ choose SCHEDULE
                         │
                         ▼
                     CONFIGURE
                         │
                         ├─ Hotel
                         ├─ Transport
                         ├─ Meal
                         └─ Extras
                         │
                         ▼
                 RESERVATION REVIEW
                         │
                [Auth if contract requires]
                         │
                         ▼
                 RESERVATION SUCCESS
                         │
                         ▼
                  RESERVATION DETAIL
```

---

# 10. Returning Customer Flow

```text
ANY PAGE
  │
  ▼
LOGIN
  │
  ▼
LOGIN SUCCESS
  │
  ▼
PREVIOUS TRAVEL HISTORY POPUP
  │
  ├── Close → return to original context
  │
  └── View all → /my-trips
```

이 흐름은 예약 도중 Auth Overlay에서 로그인한 경우에도
사용자의 예약 context를 침범하지 않게 조정해야 한다.

따라서 예약 중 로그인에서는:

```text
Login success
→ Reservation context 복구 우선
→ History popup은 지연/생략 가능 여부
```

가 UX 충돌 지점이다.

원본은 “로그인하면 팝업”을 요구하므로 기본 원칙은 노출이지만,
transaction을 방해하지 않도록 timing을 CP6에서 구체화한다.

---

# 11. Voice-Assisted Flow

Voice는 별도 페이지가 아니라
Tour Detail / Configure의 보조 control로 들어간다.

## Tour Detail examples

```text
“프리미엄으로 할래”
→ Premium selected
```

## Configure examples

```text
“호텔을 5성급으로 바꿔줘”
→ Hotel option candidate selection
→ Backend/contract validation when required
→ GUI updates
```

## State flow

```text
Idle
→ Listening
→ Processing
→ Recognized
→ Applied

or

→ Not understood
→ GUI fallback
```

정확한 command list는 Voice Contract 확정에 종속된다.

---

# 12. Browser Back / Forward Semantics

SPA에서 Browser Back은 사용자가 기대하는 화면 단계와 일치해야 한다.

## Expected chain

```text
Reservation Review
Back
→ Configure

Configure
Back
→ Tour Detail

Tour Detail
Back
→ Tours or true previous route

Tours
Back
→ Home or true previous route
```

## Never

다음은 피한다.

- Back했는데 Home으로 강제 이동
- Back했는데 configuration이 초기화됨
- Login overlay를 닫았는데 원래 화면이 사라짐
- Success에서 Back 시 중복 Submit 가능한 Review로 무방비 복귀

### Success back protection

Reservation Success에서 Browser Back으로
이미 완료된 form submit state가 재실행되지 않게 해야 한다.

구현 방식은 CP8에서 결정.

---

# 13. Draft Preservation Rules

UX 관점의 draft:

```text
Selected Tour
Selected Style
Selected Schedule
Hotel
Transport
Meal
Extras
```

### Must preserve

- Configure → Review → Back
- Auth Overlay 열기 → Close
- Auth success → original flow return
- Recoverable API error
- viewport rotate / responsive change

### Preferred preserve

- accidental refresh

정확한 persistence 기술은 CP8에서 결정한다.

### Intentional discard

새로운 Theme Tour를 선택해서 현재 여행 구성을 교체하려는 경우.

의미 있는 변경사항이 있다면 confirmation UX 고려.

---

# 14. Deep Link & Refresh Recovery

## Tour Detail

`/tours/:tourId`

독립 접근 가능해야 한다.

## Configure

직접 URL 접근 시 필요한 context가 부족하면
화면을 깨뜨리지 않는다.

예:

```text
Missing Style
→ Tour Detail로 안내

Missing Schedule
→ Schedule selection으로 안내
```

## Reservation Review

draft가 존재하지 않는 직접 접근:

```text
We couldn't find a trip to review.
[Explore tours]
```

## Reservation Success

valid reservationId가 있으면 서버 데이터를 기반으로 복구 가능한 구조를 목표로 한다.

## Reservation Detail

valid ID 기준 server-driven.

---

# 15. Responsive IA Transformation

Responsive는 동일 desktop layout을 축소하는 작업이 아니다.

## Desktop → Mobile 변화

### Global Navigation

```text
Desktop nav links
→ compact mobile header / sheet
```

### Tour Detail

```text
wide visual storytelling
→ vertically sequenced narrative
```

### Configure

```text
left controls + sticky right summary
→ controls + persistent bottom summary
```

### Auth

```text
dialog
→ full-screen sheet/page
```

### Travel History Popup

```text
large dialog
→ full-height sheet
```

### Reservation Review

```text
two-column summary possible
→ linear single-column review
```

---

# 16. Page Transition Intent Map

정확한 animation 값은 CP4에서 결정하지만
어떤 전환을 특별하게 다룰지는 CP1에서 고정한다.

| From | To | Motion Intent |
|---|---|---|
| Home Theme Card | Tour Detail | Signature shared visual transition |
| Tours Card | Tour Detail | Shared image/title continuity |
| Tour Detail | Configure | Focus transition from story → tool |
| Configure | Review | Forward transactional transition |
| Review | Success | Completion / confirmation transition |
| Login overlay | Previous Trips popup | Lightweight chained overlay |
| My Trips | History item detail | **TBD — no dedicated history-detail contract/route yet** |

모든 route에 cinematic animation을 쓰지 않는다.

---

# 17. Screen Ownership Matrix

| Surface | Frontend owns UI | Backend owns truth | ai-console dependency |
|---|---:|---:|---:|
| Home | Yes | No | No |
| Tours | Yes | Tour data | No |
| Tour Detail | Yes | Tour/Schedule data | Optional |
| Style selection | Yes | Validation | Optional |
| Configuration | Yes | Valid options/rules | Optional |
| Recruitment display | Yes | Yes | No |
| Reservation Review | Yes | Price/validation | No |
| Reservation Submit | UI only | Yes | No |
| Reservation Success | Yes | Yes | No |
| Reservation Detail | Yes | Yes | No |
| Travel History | Yes | Yes | No |
| Login / Signup | Yes | Auth | No |
| Voice control surface | Yes | Validation | Yes |
| STT | No | No | Yes |

---

# 18. CP1 Non-Goals

이 단계에서는 다음을 확정하지 않는다.

- exact colors
- typography scale
- exact spacing
- exact grid width
- exact breakpoint px values
- animation duration / easing
- icon library
- frontend framework library choices
- state management library
- query/cache library
- API DTO
- auth token model
- server error schema
- price formula
- actual hotel/transport/meal catalog

---

# 19. Contract Gaps Surfaced by CP1

## GAP-01 — Reservation auth gate

예약 신청에 로그인이 필수인지 Shared Contract에서 명확하지 않다.

### Frontend impact

Auth Overlay timing / submit flow.

### Planning status

**TBD / frontend proposal only**

---

## GAP-02 — Travel History vs Current Reservations

Travel History API는 존재하지만
현재 고객의 active reservation 목록 endpoint는 v0.1 skeleton에 없다.

### Frontend impact

`My Trips`를 Upcoming/Past dashboard로 만들기 어려움.

### CP1 decision

`/my-trips`는 우선 **Travel History**에 충실하게 설계.

현재 신청 상세는 `/reservations/:reservationId`로 분리.

---

## GAP-03 — TourSchedule structure

Schedule의 세부 필드가 TBD.

### Frontend impact

날짜 형식, 모집 상태, 잔여 인원/팀 표시 data contract.

---

## GAP-04 — Honeymoon semantics

공통 Business Rule은 4명 이상으로 적혀 있지만
팀 결정은 **2팀 이상**이다.

### Frontend impact

Frontend wording은 `2 Couples / Teams`.

### Required shared-doc follow-up

Business Rule에 team semantics를 명시하는 것을 권장.

---

## GAP-05 — Post-login history popup timing during transaction

원본은 로그인 후 여행 목록 popup을 요구한다.

예약 도중 인증하면 popup이 transaction을 방해할 수 있다.

### Current planning status after CP6 screen specs

원본 요구는 유지한다.

일반 로그인:
```text
Login success
→ Previous Travel History Popup
```

거래 흐름 중 인증:
transaction context를 먼저 복구하고 popup을 지연하는 안을
`FRONTEND PROPOSAL`로 두었다.

이 timing 예외는 아직 Shared Contract가 아니며 CP6-H 계약 감사 대상이다.

---

# 20. CP1 Decision Log

## D-101 — Dedicated `/tours` exists

Home과 Tours의 역할을 분리한다.

- Home = brand / discovery
- Tours = complete curated collection

---

## D-102 — Style and Schedule selected before Configure

Tour Detail에서 두 문맥을 결정한 뒤
Configure로 진입한다.

---

## D-103 — Configure is a dedicated route

복잡한 customization을 Tour Detail에 억지로 삽입하지 않는다.

---

## D-104 — Reservation Review is a dedicated route

최종 검토와 신청을 분리한다.

---

## D-105 — Reservation Detail and Travel History are separate

현재 API skeleton의 개념 차이를 IA에 반영한다.

---

## D-106 — Previous Travel History Popup is a global post-login surface

로그인 직후 이전 여행 목록을 최근 순으로 노출한다.

---

## D-107 — `/my-trips` is history-first

Upcoming/Past tab은 Reservation status/list contract 확정 후 확장.

---

## D-108 — Auth uses modal-route on desktop

context preservation을 목표로 하며
direct URL에서는 full-page fallback.

---

## D-109 — Configure uses sticky summary on desktop

mobile에서는 bottom summary surface로 변환한다.

---

## D-110 — Browser Back is a first-class UX requirement

route hierarchy와 user mental model을 일치시킨다.

---

## D-111 — Draft preservation is mandatory across transactional steps

Configure → Review → Auth interruption에서
사용자 선택을 잃지 않는다.

---

## D-112 — Voice is embedded, not a separate product path

기존 GUI의 선택 상태를 보조적으로 조작한다.

---

# 21. CP1 Acceptance Checklist

## IA

- [x] Top-level sitemap 정의
- [x] Home과 Tours 역할 분리
- [x] Tour Detail 목적 정의
- [x] Style / Schedule 선택 위치 결정
- [x] Configure 별도 route 확정
- [x] Reservation Review 별도 route 확정
- [x] Reservation Success 별도 route 확정
- [x] Reservation Detail 분리
- [x] Travel History route 정의

## Auth

- [x] Login / Signup surface 정의
- [x] Desktop modal-route 방향 정의
- [x] direct URL fallback 정의
- [x] 로그인 후 Previous Travel History popup 정의
- [x] transaction 중 Auth 충돌을 GAP으로 기록

## Navigation

- [x] Global Navigation 정의
- [x] Transaction Header 개념 정의
- [x] Browser Back semantics 정의
- [x] Deep Link recovery 정의
- [x] Draft preservation 요구 정의

## Responsive

- [x] Desktop → Mobile IA transformation 정의
- [x] Configure summary mobile behavior 정의
- [x] Auth / History popup mobile behavior 정의

## Integration

- [x] Voice integration point 정의
- [x] Backend truth boundary 정의
- [x] API contract gap 식별

**CP1 Status: COMPLETE**

---

# 22. Next Checkpoint

## CP2 — Visual Direction

다음 문서:

`03-VISUAL-DIRECTION.md`

CP2에서 확정할 것:

- Art direction
- Brand mood
- Color direction
- Image treatment
- Typography direction
- Layout rhythm
- Editorial composition
- Surface / border / shadow character
- Theme별 이미지 성격
- Home / Detail / Configurator / Transaction / Account별 visual tone
- “고급스럽다”를 구현 가능한 시각 규칙으로 변환
- Mobbin reference에서 가져올 요소 / 가져오지 않을 요소 구분

CP2 종료 후에야 실제 Design System token을 CP3에서 숫자로 고정한다.
