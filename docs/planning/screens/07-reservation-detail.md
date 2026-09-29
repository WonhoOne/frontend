# [S07] Reservation Detail

> File: `screens/07-reservation-detail.md`  
> Route / Trigger: `/reservations/:reservationId`  
> CP6 Status: **Ready — CP6-D Complete**  
> Depends on:
> - `screens/05-reservation-review.md`
> - `screens/06-reservation-success.md`
> - `06-UI-STATES.md`

---

# 1. Screen Purpose

Reservation Detail은 특정 여행 신청의 **현재 상태와 최종 선택 내용을 다시 확인하는 화면**이다.

Travel History와 역할이 다르다.

```text
Reservation Detail
= 신청/현재 일정 상태

Travel History
= 과거 여행 이력
```

현재 API skeleton도 Reservation 상세 조회와 Travel History 조회를 별도 endpoint로 둔다.

---

# 2. Route / Entry Conditions

## Route

```text
/reservations/:reservationId
```

## Entry

- Reservation Success
- 향후 현재 신청 목록이 생길 경우 해당 목록
- direct URL
- browser history

## Auth

[BLOCKED BY SHARED CONTRACT]

고객 자신의 reservation 접근에 인증이 필요할 가능성이 높지만
현재 auth contract가 미확정.

## Exit

- Back
- Tours
- My Trips는 Travel History 성격이므로 현재 reservation과 동일 개념으로 강제 연결하지 않음

---

# 3. User Goal

Primary:

> 내가 신청한 여행의 현재 상태와 구성을 확인한다.

Secondary:

- 모집/출발 확정 여부 확인
- 일정/Style/옵션 재확인
- 향후 확정 알림 expectation 이해

취소는 현재 범위 밖이다.

---

# 4. Required Data

[CONFIRMED concept]

- reservation identity
- Theme
- Schedule
- Style
- final Hotel
- final Transport
- final Meal
- Extras when applicable
- price if contract supports
- recruitment / confirmation state

## Not supported by current scope

- cancel action
- refund
- payment status
- external hotel/air booking status

---

# 5. Desktop Layout

```text
┌─────────────────────────────────────────────────────────────┐
│ GLOBAL HEADER — authenticated account state                  │
└─────────────────────────────────────────────────────────────┘

Reservation
Theme Tour
Schedule
Status Badge

┌────────────────────────────────────┬────────────────────────┐
│ TRIP CONFIGURATION                 │ CURRENT STATUS         │
│                                    │                        │
│ Style                              │ Recruitment            │
│ Hotel                              │ Confirmed/Recruiting   │
│ Transport                          │ Notification note      │
│ Meal                               │                        │
│ Extras                             │                        │
│ Price if supported                 │                        │
└────────────────────────────────────┴────────────────────────┘

[ 다른 여행 둘러보기 ]
```

Visual tone:
- account/detail
- calm
- information-first

---

# 6. Mobile Layout

```text
Header
↓
Theme / Schedule
↓
Current Status
↓
Configuration
↓
Price if available
↓
Notification note
↓
Explore Tours
```

상태를 configuration보다 먼저 보여줄 수 있다.
사용자가 재방문했을 때 가장 궁금한 정보가 현재 departure state이기 때문이다.

---

# 7. Exact Section Order

Desktop logical DOM:

```text
01 Header
02 Reservation Identity
03 Current Status
04 Recruitment State
05 Final Configuration
06 Price
07 Notification Information
08 Secondary Navigation
```

---

# 8. Component Composition

```text
ReservationDetailPage
├── GlobalHeader
├── ReservationIdentity
├── ReservationStatusSection
│   └── RecruitmentProgress / CoupleProgress
├── ReservationConfiguration
├── ReservationPrice
├── NotificationInfo
└── ReservationActions
```

Primitives:

```text
InfoCard
StatusBadge
RecruitmentProgress
CoupleProgress
Skeleton
ErrorState
Button
TextLink
```

---

# 9. Primary / Secondary CTA

Primary transactional CTA:

N/A.

현재 범위에는 reservation 변경/취소가 없다.

Secondary:

```text
다른 여행 둘러보기
→ /tours
```

Navigation back.

---

# 10. Interaction Rules

- state refresh 가능
- current status는 Backend data 반영
- cancellation UI 생성 금지
- confirmed/recruiting 의미는 text로 표현
- price가 없으면 숨김; 거짓 값 생성 금지

---

# 11. Motion

Entry:

`Standard Forward Page Transition`

Status refresh:

Theme별 canonical progress motion을 actual state change에만 사용:

- General Tour → `General Recruitment Progress Motion`
- Honeymoon → `Honeymoon Couple Progress Motion`

Initial state:
calm reveal.

Reduced Motion:
instant/opacity.

---

# 12. Loading

```text
ReservationIdentitySkeleton
ReservationStatusSkeleton
ConfigurationSummarySkeleton
PriceSkeleton if needed
```

Header 유지.

section-level progressive render 가능.

---

# 13. Empty

N/A.

valid reservation object가 없으면 Not Found.

---

# 14. Error

## Network

```text
예약 정보를 불러오지 못했습니다.
[ 다시 시도 ]
```

## Not Found

```text
예약 정보를 찾을 수 없습니다.
```

## Unauthorized

auth recovery.

## Offline

cached data가 있으면 유지 + stale warning.

## Partial Failure

Recruitment/status만 실패:
- configuration 유지
- status section local retry

Price만 실패:
- 나머지 유지

---

# 15. Retrying / Refreshing

- existing data preserve
- status refresh background 가능
- stale status 명확히 표시
- full page skeleton reset 금지

---

# 16. Edge Cases

- invalid reservation ID
- another user's reservation ID → unauthorized/not found according to backend
- status changes while viewing
- stale recruitment
- missing price
- no notification status
- refresh
- deep link
- session expired

---

# 17. Accessibility

- page H1
- status not color-only
- recruitment text alternative
- logical heading order
- keyboard navigation
- focus-visible
- reduced motion
- no inaccessible disabled/cancel ghost controls

---

# 18. API / Shared Contract Dependency

| Need | Source | Status | Impact |
|---|---|---|---|
| `GET /api/v1/reservations/{reservationId}` | API skeleton | CONFIRMED endpoint skeleton | core fetch |
| Reservation DTO | API v0.2 | BLOCKED | mapping |
| reservation status enum | baseline TBD | BLOCKED | exact labels |
| recruitment state | business concept | CONFIRMED concept / BLOCKED shape | status |
| price | baseline TBD | TBD | optional display |
| notification mechanism/status | shared/original | CONFIRMED need / BLOCKED mechanism | info section |
| cancellation | out of scope | CONFIRMED out-of-scope | no cancel CTA |

---

# 19. TBD / Blocker

- status enum
- ownership/auth policy
- price field
- notification delivery status
- active reservation list/navigation source

---

## CP6-H Contract Gate — Recruitment display mapping

**P0 contract gate for the Honeymoon progress display under the active v0.1.1 planning baseline.**

Shared proposal computes TourSchedule enrollment from the sum of integer
`Reservation.participantCount` and confirms Honeymoon at 4 participants.

The current `2 couples / 2 teams` visual is a Frontend/team intent, but the shared domain does not yet encode couples/teams.

Until docs reconcile this mapping:

- Backend participant totals remain authoritative;
- Frontend must not infer couple count from arbitrary Reservation count;
- `CoupleProgress` is a visual proposal, not a settled API mapping.


# 20. Acceptance Criteria

- [ ] reservation ID 기반 detail 로드.
- [ ] current status와 configuration 구분.
- [ ] Honeymoon recruitment는 couple/team semantics.
- [ ] 취소/환불/payment UI 없음.
- [ ] partial status failure가 configuration을 지우지 않음.
- [ ] stale/offline 상태를 최신처럼 오해시키지 않음.
- [ ] authentication failure 시 안전한 recovery.
- [ ] responsive/mobile 구조 정상.
- [ ] status가 color-only가 아님.
- [ ] DTO/status enum을 임의 발명하지 않음.

---

# Screen Status

```text
Ready
```
