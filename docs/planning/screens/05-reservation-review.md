# [S05] Reservation Review

> File: `screens/05-reservation-review.md`  
> Route / Trigger: `/reservation/review`  
> CP6 Status: **Ready — CP6-D Complete**  
> Depends on:
> - `07-SCREEN-SPECS.md`
> - `02-INFORMATION-ARCHITECTURE.md`
> - `04-DESIGN-SYSTEM.md`
> - `05-MOTION-SYSTEM.md`
> - `06-UI-STATES.md`
> - `screens/04-configure.md`

---

# 1. Screen Purpose

Reservation Review는 고객이 지금까지 만든 여행 구성을 **최종 검토한 뒤 여행 신청을 제출하는 화면**이다.

이 화면은 새로운 옵션을 탐색하는 곳이 아니다.

사용자는 다음 질문에 답할 수 있어야 한다.

> “내가 어떤 Theme, Style, Schedule, Hotel, Transport, Meal 조합으로 신청하는가?”

그리고 신청 전에 변경이 필요하면 명시적인 `Change`를 통해 원래 단계로 돌아간다.

온라인 결제는 현재 범위 밖이므로 결제수단, 카드번호, 결제 CTA를 만들지 않는다.

---

# 2. Route / Entry Conditions

## Route

```text
/reservation/review
```

## Valid Entry

최소 다음 draft가 존재해야 한다.

```text
valid Tour
valid Style
valid Schedule
required Hotel
required Transport
required Meal
```

## Entry Sources

Primary:

```text
Configure
→ Review trip
```

Secondary:

```text
Browser Forward
Auth interruption recovery
```

## Missing Draft

```text
검토할 여행 정보가 없습니다.
[ 여행 둘러보기 ]
```

## Exit

Primary:

```text
여행 신청하기
→ reservation submit
→ success route on server-confirmed success
```

Change configuration:

```text
→ /tours/:tourId/configure
```

Change style/schedule:

```text
→ /tours/:tourId
```

Browser Back:

```text
→ Configure
```

Back 시 Configuration draft를 그대로 복원해야 한다.

---

# 3. User Goal

Primary goal:

> 신청 전에 여행 구성과 일정이 정확한지 확인하고 제출한다.

Secondary goals:

- 잘못 선택한 옵션 수정
- 일정/Style 다시 선택
- 가격이 제공되면 최종 가격 확인
- 신청 실패 시 입력/선택을 잃지 않고 재시도

---

# 4. Required Data

## Trip Identity

[CONFIRMED concept]

- Theme Tour
- selected Style
- selected Schedule

## Final Tour Configuration

[CONFIRMED]

- Hotel
- Transport
- Meal
- Extras when contract supports

## Account / Customer Context

[CONFIRMED source requirement]

회원 정보에는 최소 다음 정보가 존재한다.

```text
name
address
contact
```

[BLOCKED BY SHARED CONTRACT]

Reservation Review에서 이 셋을 실제로 모두 보여줄지,
별도 applicant DTO가 있는지,
신청마다 수정 가능한지 여부는 API/Domain 계약이 필요하다.

따라서 UI는 `Applicant / Contact Summary` 영역을 둘 수 있지만
필드를 임의로 reservation payload로 확정하지 않는다.

## Price

[TBD / BLOCKED BY SHARED CONTRACT]

- final total
- discount
- option price breakdown

가격 formula와 frequent-customer discount 정책이 미확정.

## Validation

[CONFIRMED principle]

Backend가 최종 Business Rule authority.

Review 진입 또는 Submit 직전 최신 Schedule / Option / Price validation 필요 가능.

---

# 5. Desktop Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ TRANSACTION HEADER                                           │
│ ← Back to configure                      Mister World        │
└──────────────────────────────────────────────────────────────┘

┌────────────────────────────────────┬─────────────────────────┐
│                                    │                         │
│  REVIEW YOUR TRIP                  │  FINAL SUMMARY          │
│                                    │                         │
│  Trip                              │  Theme                  │
│  Theme / Style / Schedule          │  Schedule               │
│  [ Change ]                        │  Configuration          │
│                                    │  Price                  │
│  Configuration                     │                         │
│  Hotel                             │  [ 여행 신청하기 ]      │
│  Transport                         │                         │
│  Meal                              │                         │
│  Extras                            │                         │
│  [ Change ]                        │                         │
│                                    │                         │
│  Applicant / Contact              │                         │
│  [ Edit if contract allows ]       │                         │
│                                    │                         │
└────────────────────────────────────┴─────────────────────────┘
```

## Visual Tone

- calm
- restrained
- typography + spacing
- minimal imagery
- CTA가 가장 강한 요소

Checkout처럼 명확하되 payment UI처럼 보이지 않는다.

---

# 6. Mobile Layout

```text
Transaction Header
↓
Trip
↓
Configuration
↓
Applicant / Contact
↓
Price Summary
↓
Persistent Submit Bar
```

## Persistent Submit Bar

가능한 경우:

```text
final price / summary
[ 여행 신청하기 ]
```

price가 계약상 없거나 로딩 중이면 거짓 값을 만들지 않는다.

## Change

각 section의 `Change`는 충분한 touch target을 갖는다.

---

# 7. Exact Section Order

```text
01 Transaction Header
02 Review Heading
03 Trip Summary
04 Configuration Summary
05 Applicant / Contact Summary
06 Price Summary
07 Validation / Conflict Region
08 Submit CTA
```

Payment section은 넣지 않는다.

---

# 8. Component Composition

```text
ReservationReviewPage
├── TransactionHeader
├── ReviewHeading
├── ReviewTripSection
├── ReviewConfigurationSection
├── ApplicantSummary
├── ReviewPriceSummary
├── ReservationValidationRegion
└── ReservationSubmitAction
```

Design-System Primitives:

```text
PageContainer
Section
InfoCard
Button
TextLink
StatusBadge
Skeleton
ErrorState
Dialog
```

---

# 9. Primary / Secondary CTA

## Primary

```text
Label: 여행 신청하기
Action: submit reservation
Enabled when:
- required draft complete
- no known blocking validation error
- not submitting
```

## Submitting

```text
신청하는 중…
```

중복 제출 금지.

## Success

server success 이후에만 Success route로 이동.

## Failure

Review 유지 + local error.

## Secondary

```text
Change configuration
Change style/schedule
```

## Destructive

N/A.

---

# 10. Interaction Rules

- Review 화면에서 option 자체를 직접 바꾸지 않는다.
- `Change`는 원래 화면으로 돌아간다.
- 돌아갔다 다시 Review하면 draft를 유지한다.
- Submit 중 CTA 반복 클릭 금지.
- 서버 validation 결과가 바뀌면 자동 동의하지 않는다.
- 가격/일정/옵션 변경은 사용자에게 명시적으로 보여주고 재확인하게 한다.

## Auth

[BLOCKED BY SHARED CONTRACT]

예약 신청에 로그인 필수인지 Shared Contract에서 명확하지 않다.

로그인이 필요하다고 확정될 경우:

```text
Submit
→ Auth Overlay
→ Login Success
→ Review draft restore
→ 사용자 재확인
→ 다시 Submit
```

자동 재제출 금지.

---

# 11. Motion

Entry:

`Standard Forward Page Transition`

Submit:

`Button Motion`의 Loading / Success state

Conflict:

- changed row highlight/reveal
- shake 금지

Success:

`Reservation Success Motion`은 다음 화면에서 처리.

Reduced Motion:

- 짧은 opacity
- submit 의미는 text로 유지

---

# 12. Loading

## Initial Validation

Review draft 자체는 즉시 표시.

서버 validation이 있다면:

```text
existing review content retained
+ validation indicator
```

전체 skeleton reset 금지.

## Missing Server Data

필요 section만 skeleton.

## Price

`PriceSkeleton`

다른 Summary 유지.

---

# 13. Empty

## Missing Draft

Applicable: Yes.

```text
검토할 여행 정보가 없습니다.
[ 여행 둘러보기 ]
```

이것은 사용자 history가 비어있는 의미가 아니라
transaction draft가 없는 상태다.

---

# 14. Error

## Network

Submit 실패:

```text
여행 신청에 실패했습니다.
연결 상태를 확인하고 다시 시도해주세요.
```

Draft 유지.

## Server

```text
잠시 문제가 발생했습니다.
내용을 유지한 채 다시 시도할 수 있습니다.
```

## Validation

해당 section 근처 inline.

## Conflict

예:

- schedule unavailable
- price changed
- option unavailable

```text
여행 정보가 변경되었습니다.
변경된 내용을 확인한 뒤 다시 신청해주세요.
```

변경된 row 강조.

## Unauthorized

Auth flow로 연결하되 draft 유지.

## Offline

Submit 차단 가능.

cached review는 볼 수 있어도 server action은 불가.

## Unknown

다시 신청 버튼을 즉시 재실행시키지 않고
상태 확인 후 retry.

---

# 15. Retrying / Refreshing

- Retry는 Submit request 단위.
- draft 유지.
- background refresh 시 기존 내용 유지.
- 최신 validation 결과가 바뀌면 explicit reconfirmation.

---

# 16. Edge Cases

- direct URL without draft → Missing Draft
- refresh → draft persistence가 없으면 safe recovery
- double click → one request
- 401 during submit → auth recovery, no auto-resubmit
- 409 conflict → changed content show
- schedule expires → back/change schedule
- price changes → show new value, reconfirm
- option disappears → change configuration
- browser back → Configure with draft
- submit success but navigation fails → reservation ID 기반 success/detail recovery 필요

---

# 17. Accessibility

- page H1 하나
- section headings logical
- Change links accessible name에 대상 포함
- submit status는 polite live region 가능
- validation message는 section/control과 연결
- keyboard only로 Change/Submit 가능
- focus-visible
- touch target >=44px
- reduced motion 지원

---

# 18. API / Shared Contract Dependency

| Need | Current Source | Status | Frontend Impact |
|---|---|---|---|
| Reservation creation | API skeleton `POST /api/v1/reservations` | CONFIRMED endpoint skeleton | submit |
| Reservation DTO | API v0.2 | BLOCKED BY SHARED CONTRACT | payload mapping |
| Tour Configuration | Requirements/domain concept | CONFIRMED concept | review summary |
| Customer name/address/contact | original source | CONFIRMED source requirement | applicant/account summary |
| Auth requirement for reservation | docs | TBD | submit gate |
| Price | baseline | TBD | final summary |
| Discount | baseline | TBD | final summary |
| Schedule validation | TourSchedule contract | BLOCKED BY SHARED CONTRACT | submit eligibility |
| Error schema | API v0.2 | BLOCKED BY SHARED CONTRACT | 409/422 mapping |

---

# 19. TBD / Blocker

## TBD

- auth gate
- applicant/contact editability
- final price UI
- discount
- exact review copy

## Blocked

- Reservation request/response DTO
- error schema
- latest schedule/option validation contract

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

- [ ] Configure draft를 정확히 보여준다.
- [ ] Change로 원래 단계 이동 가능.
- [ ] Back 후 draft 유지.
- [ ] Submit 중 중복 request 없음.
- [ ] server success 이후에만 Success로 이동.
- [ ] conflict 시 자동 동의하지 않는다.

## Visual

- [ ] payment checkout처럼 보이지 않는다.
- [ ] CTA 외 시각적 경쟁이 적다.
- [ ] Design System spacing/border 사용.

## Loading / Error

- [ ] validation refresh 중 기존 review 유지.
- [ ] price loading이 전체 화면을 가리지 않음.
- [ ] submit error 후 draft 유지.
- [ ] 401/409/network 각각 recovery 가능.

## Responsive

- [ ] mobile single-column.
- [ ] persistent submit bar가 content를 가리지 않음.
- [ ] safe area 처리.

## Accessibility

- [ ] Change accessible name이 구체적.
- [ ] validation/state announce 가능.
- [ ] keyboard submit 가능.
- [ ] focus-visible.

## Contract Safety

- [ ] payment UI를 추가하지 않는다.
- [ ] 가격/할인을 임의 계산하지 않는다.
- [ ] reservation DTO를 임의 정의하지 않는다.
- [ ] applicant payload를 원본 요구 이상으로 확정하지 않는다.

---

# Screen Status

```text
Ready
```
