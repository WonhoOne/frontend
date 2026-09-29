# [S06] Reservation Success

> File: `screens/06-reservation-success.md`  
> Route / Trigger: `/reservation/:reservationId/success`  
> CP6 Status: **Ready — CP6-D Complete**  
> Depends on:
> - `screens/05-reservation-review.md`
> - `05-MOTION-SYSTEM.md`
> - `06-UI-STATES.md`

---

# 1. Screen Purpose

Reservation Success는 “신청 완료”만 알려주는 화면이 아니다.

사용자는 신청 직후 다음 두 가지를 이해해야 한다.

1. 여행 신청이 서버에 정상 접수되었는가
2. 현재 일정은 아직 모집 중인가, 출발 확정 상태인가

따라서 Success는 **신청 결과 + 모집 상태 + 다음 행동**을 함께 보여준다.

---

# 2. Route / Entry Conditions

## Route

```text
/reservation/:reservationId/success
```

## Entry

- `POST /api/v1/reservations` server-confirmed success 이후
- valid reservation ID 필요
- refresh/direct recovery는 해당 ID로 서버 조회 가능한 구조를 목표로 함

## Exit

Primary:

```text
예약 상세 보기
→ /reservations/:reservationId
```

Secondary:

```text
다른 여행 둘러보기
→ /tours
```

Browser Back:

이미 완료된 Submit form으로 무방비 복귀해 재제출되지 않게 보호.

---

# 3. User Goal

Primary:

> 신청이 완료됐는지 확인하고 현재 출발 상태를 이해한다.

Secondary:

- 예약 상세 확인
- 다음 여행 탐색
- 향후 확정 알림이 있다는 점 이해

---

# 4. Required Data

[CONFIRMED concept]

- reservation identity
- Theme
- selected Schedule
- selected Style
- current Tour Configuration summary
- current recruitment state
- confirmed/not confirmed state

## Recruitment semantics

Honeymoon:

```text
1 / 2 couples
2 / 2 couples → confirmed
```

Other Tours:

```text
n / 3 travellers
3+ → confirmed
```

Backend state가 final authority.

## Notification

[CONFIRMED source requirement]

원본 요구사항은 여행 일정이 확정되면 고객에게 SMS를 보내도록 요구한다.

[CONFIRMED shared requirement]

Shared requirements는 확정 시 알림 제공을 요구한다.

[BLOCKED BY SHARED CONTRACT]

실제 알림 메커니즘/API가 SMS로 최종 구현되는지,
Frontend가 어떤 notification status를 받을지는 아직 확정 필요.

Success 화면은 “확정 시 알림이 제공된다”는 수준을 안전하게 표현하고,
실제 SMS 발송 완료를 임의 표시하지 않는다.

---

# 5. Desktop Layout

```text
┌─────────────────────────────────────────────────────────────┐
│ TRANSACTION HEADER — completion variant                     │
└─────────────────────────────────────────────────────────────┘

                ✓
          신청이 완료되었습니다

        Theme / Schedule summary

┌─────────────────────────────────────────────────────────────┐
│ RECRUITMENT STATUS                                          │
│                                                             │
│ Honeymoon: Couple 01 / Couple 02                             │
│ or General: ●────●────○                                     │
│                                                             │
│ 1 / 2 couples  or  2 / 3 travellers                         │
│ status message                                              │
└─────────────────────────────────────────────────────────────┘

        notification expectation

[ 예약 상세 보기 ]   [ 다른 여행 둘러보기 ]
```

많은 card를 쌓지 않는다.

---

# 6. Mobile Layout

- centered success message
- trip identity
- recruitment component full width
- CTA stack
- confetti 없음
- safe-area 고려

---

# 7. Exact Section Order

```text
01 Minimal Header
02 Success Confirmation
03 Trip Identity
04 Recruitment / Confirmation State
05 Notification Expectation
06 Primary CTA
07 Secondary CTA
```

---

# 8. Component Composition

```text
ReservationSuccessPage
├── TransactionHeader (completion variant)
├── SuccessConfirmation
├── SuccessTripSummary
├── ReservationRecruitmentState
│   ├── CoupleProgress OR
│   └── RecruitmentProgress
├── NotificationExpectation
└── SuccessActions
```

Primitives:

```text
Button
InfoCard
StatusBadge
RecruitmentProgress
CoupleProgress
Skeleton
ErrorState
```

---

# 9. Primary / Secondary CTA

Primary:

```text
예약 상세 보기
→ /reservations/:reservationId
```

Secondary:

```text
다른 여행 둘러보기
→ /tours
```

No payment CTA.

No duplicate reservation CTA.

---

# 10. Interaction Rules

- refresh 가능
- recruitment state는 Backend response 반영
- confirmed 상태가 이미 로드된 경우 calm state
- viewing 중 confirmed로 변한 경우 CP4 progress completion motion 가능
- notification copy는 발송 완료를 추정하지 않음

---

# 11. Motion

`Reservation Success Motion`

Sequence:

```text
confirmation mark
→ heading
→ trip identity
→ recruitment
→ CTA
```

700–1000ms 내.

Initial confirmed data는 과장된 “방금 확정” choreography를 피함.

Reduced Motion:
- short opacity only

---

# 12. Loading

Direct/refresh recovery 시:

```text
Success confirmation skeleton
Trip summary skeleton
Recruitment skeleton
```

예약이 실제 성공했는지 불확실한 상태에서
“다시 신청” CTA를 제공하지 않는다.

---

# 13. Empty

N/A.

valid reservation ID가 없다면 Not Found/Error.

---

# 14. Error

## Fetch Error

```text
예약 정보를 불러오지 못했습니다.
신청을 다시 실행하지 말고 예약 정보를 다시 확인해주세요.

[ 다시 시도 ]
```

## Not Found

```text
예약 정보를 찾을 수 없습니다.
```

Home/Tours escape 제공.

## Offline

cached success info가 있으면 유지하되
recruitment가 최신이 아닐 수 있음을 표시.

## Partial Failure

Reservation core는 성공, recruitment만 실패:

- 신청 완료는 유지
- recruitment section만 retry

---

# 15. Retrying / Refreshing

- reservation core retry
- recruitment retry separate
- existing success state preserved
- background recruitment refresh 가능

---

# 16. Edge Cases

- submit succeeded but route navigation failed
- direct refresh on success URL
- recruitment confirmed while viewing
- recruitment data unavailable
- notification mechanism not configured
- browser back causing duplicate submit risk
- reservation ID invalid
- offline after success

---

# 17. Accessibility

- H1 = 신청 완료
- status text readable without color
- recruitment component text alternative
- success icon decorative unless labelled context needs
- no motion-only confirmation
- CTAs keyboard accessible
- reduced motion

---

# 18. API / Shared Contract Dependency

| Need | Source | Status | Impact |
|---|---|---|---|
| reservation detail lookup | `GET /api/v1/reservations/{reservationId}` | CONFIRMED endpoint skeleton | refresh recovery |
| reservation DTO | API v0.2 | BLOCKED | content mapping |
| recruitment count/state | business/domain | CONFIRMED concept / BLOCKED shape | progress |
| confirmation notification | shared requirement | CONFIRMED | expectation copy |
| SMS specifically | original source | CONFIRMED source requirement | implementation mechanism needs alignment |
| notification delivery status | none | BLOCKED | cannot show "SMS sent" |

---

# 19. TBD / Blocker

- exact reservation status enum
- exact notification mechanism
- notification delivery status
- price display on success
- reservation detail DTO

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

- [ ] server-confirmed success만 success UI 표시.
- [ ] recruitment state 표시.
- [ ] Honeymoon은 people이 아니라 couples/teams.
- [ ] general tour는 participant count.
- [ ] refresh recovery 가능 구조.
- [ ] partial recruitment failure가 신청 성공을 지우지 않음.
- [ ] “SMS 발송 완료”를 근거 없이 표시하지 않음.
- [ ] browser back이 duplicate submit을 유발하지 않음.
- [ ] reduced-motion 지원.
- [ ] payment 관련 UI 없음.

---

# Screen Status

```text
Ready
```
