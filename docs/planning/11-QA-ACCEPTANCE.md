# Mister World Frontend QA & Acceptance

> **CURRENT IMPLEMENTATION NOTICE — 2026-09-30**  
> Shared implementation baseline is **v0.1.2**. Current execution policy lives in `docs/implementation/IMPLEMENTATION-MASTER-PLAN.md`. Any older H-03 text that treats Honeymoon couple semantics as unresolved is superseded.


> Document: `11-QA-ACCEPTANCE.md`  
> Status: **CP10 Complete**  
> Scope: all 11 customer-facing screens + shared UI/data/motion systems  
> Planning baseline: 2026-09-29  
> Depends on:
> - `04-DESIGN-SYSTEM.md`
> - `05-MOTION-SYSTEM.md`
> - `06-UI-STATES.md`
> - `07-SCREEN-SPECS.md`
> - `08-COMPONENT-ARCHITECTURE.md`
> - `09-DATA-AND-API-UX.md`
> - `10-RESPONSIVE-ACCESSIBILITY.md`
> - `audits/CP6-H-CONTRACT-TBD-AUDIT.md`
> - `audits/CP6-I-FINAL-IMPLEMENTATION-READINESS.md`

---

# 0. CP10 Objective

CP10의 목표는 지금까지의 기획을 실제 구현 검증 계약으로 바꾸는 것이다.

이 문서 이후에는 다음 질문에 답할 수 있어야 한다.

```text
무엇을 테스트해야 하는가?
어떤 상태가 PASS인가?
어떤 문제는 Release Blocker인가?
어떤 화면을 어떤 네트워크/viewport/input 조건에서 검증해야 하는가?
Shared Contract가 아직 안 닫힌 부분은 어떻게 QA해야 하는가?
```

CP10의 원칙:

> **“보기에 괜찮다”가 아니라, 재현 가능한 Acceptance Criteria로 판정한다.**

---

# 1. QA Layers

Mister World Frontend QA는 6개 층으로 나눈다.

```text
L1  Shared Primitive Tests
L2  Feature / Domain Component Tests
L3  Page Integration Tests
L4  Contract / Adapter Tests
L5  Critical E2E Journeys
L6  Visual / Responsive / Accessibility Manual QA
```

모든 품질을 E2E 하나로 검증하지 않는다.

---

# 2. Pass / Fail Philosophy

PASS는 다음 조건을 모두 만족해야 한다.

```text
Expected behavior reproduced
No critical regression
State transitions correct
Recovery path works
No contract invention
Responsive behavior valid
Accessibility requirement satisfied
```

FAIL은 단순 console warning만을 뜻하지 않는다.

사용자의 핵심 task를 깨거나,
잘못된 business truth를 보여주거나,
복구 불가능 상태를 만드는 것이 더 높은 우선순위다.

---

# 3. Defect Severity

## S0 — Release Stop / Data Integrity

즉시 배포 금지.

예:

```text
중복 Reservation 생성
다른 고객의 private data 노출
Reservation 성공인데 실패처럼 표시
가격을 잘못 계산/표시해 신청
Honeymoon 모집 상태를 잘못 판정
Auth 우회
Draft 복구 중 다른 사용자의 data 혼합
```

## S1 — Critical Task Broken

핵심 flow 진행 불가.

예:

```text
Tour Detail에서 Configure 진입 불가
Configure에서 Review 불가
Login 불가
Signup 불가
Reservation Submit 불가
My Trips 완전 로드 실패
mobile에서 CTA가 가려짐
keyboard-only로 핵심 task 완료 불가
```

## S2 — Major UX / Recovery Defect

작업 가능하나 심각한 불편 또는 recovery 실패.

예:

```text
partial error가 전체 screen을 지움
409 후 draft 유실
Back 후 selection 유실
Loading spinner만 무한히 표시
dialog focus trap 실패
200% zoom에서 주요 UI 겹침
```

## S3 — Minor Defect

핵심 task는 가능.

예:

```text
spacing mismatch
small motion inconsistency
non-critical copy drift
minor image crop issue
```

## S4 — Polish

선택적 polish.

예:

```text
micro timing
subtle alignment
non-essential hover detail
```

---

# 4. Release Gate

Release candidate는 아래를 만족해야 한다.

```text
S0 = 0
S1 = 0

Known S2:
- 팀이 명시적으로 수용
- workaround 존재
- 핵심 transaction/data integrity에 영향 없음

Critical E2E = 100% PASS
Screen Acceptance = 100% PASS for implemented scope
Accessibility critical checks = PASS
Contract-gate assumptions = 0 hidden assumptions
```

---

# 5. Contract-Gated Release Rule

아직 Shared Contract가 닫히지 않은 항목은:

```text
Theme ↔ TourProduct
participantCount
Honeymoon couple/team mapping
Auth DTO/session
Tour/Schedule/Configuration/Reservation DTOs
Price
Travel History DTO
```

이다.

QA는 이것을 “일단 mock으로 통과”시키고 끝내면 안 된다.

각 gate는 둘 중 하나여야 한다.

```text
A. Contract closed
   → real integration test required

B. Contract open
   → feature explicitly mock/dev-only
   → production path disabled/not falsely completed
```

---

# 6. Test Environment Matrix

최소 환경:

```text
Desktop Chromium latest
Desktop Safari current
Desktop Firefox current or nearest supported

Mobile Safari equivalent viewport
Mobile Chrome equivalent viewport
```

필수 viewport:

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

---

# 7. Input Matrix

각 중요 flow는 최소 다음 방식 중 해당되는 것을 확인한다.

```text
Mouse
Keyboard-only
Touch
Screen-reader-oriented semantic inspection
Reduced Motion
200% zoom
```

---

# 8. Network Simulation Matrix

CP8 기준.

```text
Fast         ~100ms
Normal       ~400ms
Slow         ~1200ms
Very Slow    ~3000ms
Offline
Timeout
Intermittent failure
```

각 주요 data screen은 최소:

```text
400ms
1200ms
3000ms
```

를 검증한다.

---

# 9. HTTP / Error Simulation Matrix

최소:

```text
200
401
404
409
422
500
timeout
offline
malformed response
image failure
partial dependency failure
```

화면마다 해당되는 상태만 적용한다.

---

# 10. Shared Primitive Test Suite

## Button

- [ ] idle
- [ ] hover
- [ ] pressed
- [ ] loading
- [ ] disabled
- [ ] success variant where used
- [ ] keyboard Enter/Space
- [ ] focus-visible
- [ ] disabled not color-only
- [ ] loading label width/layout stable

## TextField

- [ ] visible label
- [ ] required
- [ ] invalid
- [ ] helper
- [ ] error association
- [ ] keyboard
- [ ] mobile keyboard
- [ ] long value
- [ ] 200% zoom

## OptionCard

- [ ] unselected
- [ ] hover
- [ ] selected
- [ ] disabled
- [ ] invalid
- [ ] radio-like keyboard semantics
- [ ] color-independent selection

## Dialog

- [ ] open focus
- [ ] focus trap
- [ ] Escape
- [ ] close button
- [ ] background inert
- [ ] focus return
- [ ] 200% zoom
- [ ] reduced motion

## BottomSheet

- [ ] explicit Close
- [ ] focus trap if modal
- [ ] safe-area
- [ ] keyboard coexistence
- [ ] orientation
- [ ] reduced motion

## Skeleton

- [ ] final geometry similarity
- [ ] no content jump
- [ ] no screen-reader rectangle spam
- [ ] reduced-motion shimmer disabled

---

# 11. Image Primitive Tests

`ImageFrame`:

- [ ] placeholder
- [ ] slow load
- [ ] loaded
- [ ] failed
- [ ] responsive source
- [ ] focal crop
- [ ] alt/decorative semantics
- [ ] no broken-image browser icon
- [ ] reduced-motion reveal

---

# 12. Motion Verification

CP4 canonical timing만 사용.

검증:

```text
Page transition
Shared Hero
Section reveal
Option selection
Summary update
Price update
Recruitment
Dialog
BottomSheet
Image load
```

FAIL:

```text
layout property jank
bounce/overshoot outside spec
route blocked by animation
reduced-motion still performs large transform
initial confirmed state plays fake live celebration
```

---

# 13. Data-State Harness

각 data-heavy component/page는 dev/test harness에서 최소 상태를 재현 가능해야 한다.

```text
Loading
Success
Empty
Error
Retrying
Refreshing
Stale
Offline
Unauthorized
Not Found
```

Mutation:

```text
Idle
Submitting
Success
Failure
Retrying
```

---

# 14. Visual Regression Scope

Snapshot/visual regression 후보:

```text
GlobalHeader
TransactionHeader
Button variants
OptionCard
Dialog
BottomSheet
Skeleton pairs
Home Hero
Theme cards
Tour Style selector
ScheduleCard
Configure desktop
Configure mobile
Review
Success
Login
Previous Trips Popup
My Trips
```

---

# 15. Visual Regression Breakpoints

최소:

```text
390
768
1280
1440
```

Critical screens:

```text
Configure
Login
Previous Trips Popup
```

는 추가로:

```text
320
1024
```

검증.

---

# 16. Visual Diff Tolerance

Auto visual diff는 보조 수단.

PASS/FAIL은:

```text
content overlap
unexpected clipping
wrong layout transformation
wrong state
focus invisibility
image crop regression
```

같은 의미 있는 변화 중심으로 판단.

폰트 raster 차이 같은 미세 diff만으로 fail시키지 않는다.

---

# 17. Home Acceptance

## Functional

- [ ] Hero CTA → Tours
- [ ] Theme discovery CTA 동작
- [ ] Global Header navigation
- [ ] direct `/`
- [ ] card rapid click duplicate navigation 없음

## Loading/Error

- [ ] static Hero 유지
- [ ] data-backed Theme/Tour section skeleton
- [ ] partial error local
- [ ] image fail fallback

## Responsive/A11y

- [ ] 320px usable
- [ ] 1728+ container 유지
- [ ] asymmetry가 DOM reading order를 깨지 않음
- [ ] H1 하나
- [ ] Hero contrast
- [ ] reduced-motion shared transition 제거

## Contract

- [ ] Theme enum을 tourId로 사용하지 않음

**Acceptance: PASS required**

---

# 18. Tours Acceptance

- [ ] Tour collection renders from View Model
- [ ] no invented filter/sort/pagination
- [ ] 2-column desktop
- [ ] 1-column mobile
- [ ] no mobile carousel hiding core items
- [ ] cache hit avoids skeleton flash
- [ ] stale data refresh preserves list
- [ ] partial failure preserves success items
- [ ] cards are semantic links
- [ ] Theme↔TourProduct contract respected

**Acceptance: PASS required**

---

# 19. Tour Detail Acceptance

- [ ] valid product detail loads
- [ ] direct route works
- [ ] Not Found works
- [ ] allowed styles correct
- [ ] Honeymoon/Parents no Classic
- [ ] Schedule single selection
- [ ] core success survives schedule failure
- [ ] schedule stale refresh
- [ ] unavailable selected schedule becomes conflict
- [ ] Configure disabled until required context
- [ ] keyboard style/schedule selection
- [ ] recruitment has text alternative
- [ ] Honeymoon v0.1.2 semantics are applied exactly (`participantCount >= 2`, even, derived `coupleCount = participantCount / 2`) without inventing Couple/Team entities or API fields

**Acceptance: PASS required**

---

# 20. Configure Acceptance

## Selection

- [ ] Hotel single-select
- [ ] Transport single-select
- [ ] Meal single-select
- [ ] Extras according to contract
- [ ] latest selection wins under rapid clicking
- [ ] unrelated group state preserved

## Summary

- [ ] changed row only updates
- [ ] price old value stays during recalculation
- [ ] stale price does not overwrite newer draft fingerprint

## Draft

- [ ] refresh rehydrates valid session draft
- [ ] Back/Forward preserves draft
- [ ] invalid stale option marked
- [ ] invalid selection not auto-replaced
- [ ] credentials not persisted

## Responsive

- [ ] >=1024 sticky side summary
- [ ] <1024 side summary removed
- [ ] mobile bottom summary
- [ ] safe-area
- [ ] no content hidden behind fixed bar
- [ ] software keyboard collision tested if future input is placed here

## Contract

- [ ] no invented option endpoint
- [ ] participantCount not silently defaulted
- [ ] price engine not frontend-owned

**Acceptance: PASS required**

---

# 21. Reservation Review Acceptance

- [ ] draft renders immediately
- [ ] freshness-sensitive data revalidated
- [ ] Change → correct previous screen
- [ ] Back → Configure draft preserved
- [ ] Submit one request only
- [ ] button loading state
- [ ] server success only triggers Success route
- [ ] 401 → Login → Review restore → no auto-submit
- [ ] 409 → changed values shown
- [ ] 422 → appropriate invalid region
- [ ] network failure preserves draft
- [ ] ambiguous network result not blind-retried
- [ ] no payment UI
- [ ] keyboard submit
- [ ] mobile bottom submit not overlapping content

**Acceptance: PASS required**

---

# 22. Reservation Success Acceptance

- [ ] server-confirmed success only
- [ ] refresh uses reservationId
- [ ] direct recovery possible
- [ ] core success survives recruitment partial failure
- [ ] browser Back does not trigger duplicate submit
- [ ] no confetti
- [ ] recruitment semantics text available
- [ ] SMS delivery status not fabricated
- [ ] H1/focus on route entry
- [ ] reduced-motion success animation

**Acceptance: PASS required**

---

# 23. Reservation Detail Acceptance

- [ ] valid reservation loads
- [ ] invalid ID → Not Found
- [ ] auth failure handled
- [ ] current status and configuration separated
- [ ] status refresh preserves content
- [ ] partial status failure local
- [ ] no cancel/refund/payment UI
- [ ] stale/offline visibly distinguished
- [ ] recruitment text semantics
- [ ] Honeymoon recruitment presentation follows v0.1.2 derived couple semantics while Backend remains the final confirmation authority

**Acceptance: PASS required**

---

# 24. Login Acceptance

- [ ] direct `/login`
- [ ] desktop in-app modal
- [ ] mobile full-screen/sheet
- [ ] form visible labels
- [ ] Enter submit
- [ ] duplicate auth request blocked
- [ ] network/server/auth rejection mapped
- [ ] input preserved on recoverable error
- [ ] dialog focus trap
- [ ] Escape close when safe
- [ ] focus return
- [ ] return context restored
- [ ] credentials never persisted/logged
- [ ] auth fields only from approved contract

**Acceptance: PASS required**

---

# 25. Signup Acceptance

- [ ] direct `/signup`
- [ ] name/address/contact surfaces
- [ ] employee signup not implemented in Customer GUI
- [ ] contract-defined credential fields only
- [ ] duplicate submit blocked
- [ ] input preserved on recoverable failure
- [ ] long address
- [ ] mobile keyboard
- [ ] 200% zoom
- [ ] inline validation
- [ ] no invented social login
- [ ] no invented marketing/legal checkbox
- [ ] no password rule invented

**Acceptance: PASS required**

---

# 26. Previous Trips Popup Acceptance

- [ ] triggered after normal login
- [ ] list recent-first
- [ ] product/period/style/price representation
- [ ] long list scrolls inside dialog/sheet
- [ ] Login success survives history error
- [ ] retry local
- [ ] close retains underlying context
- [ ] View All → My Trips
- [ ] Popup/My Trips cache shared
- [ ] desktop dialog focus trap
- [ ] mobile full-height sheet
- [ ] no fake history detail link

**Acceptance: PASS required**

---

# 27. My Trips Acceptance

- [ ] auth protected behavior
- [ ] login → return My Trips
- [ ] cached Popup history reused
- [ ] recent-first
- [ ] no Upcoming/Past without contract
- [ ] empty → Tours
- [ ] offline cached data distinction
- [ ] history item noninteractive unless route exists
- [ ] semantic list
- [ ] visual order = DOM order
- [ ] no missing price fabricated as 0

**Acceptance: PASS required**

---

# 28. Critical E2E Journey 01 — First-Time Browse to Review

```text
Home
→ Tours
→ Tour Detail
→ Style
→ Schedule
→ Configure
→ Hotel/Transport/Meal
→ Review
```

PASS:

- selections preserved
- no hardcoded forbidden contract behavior
- all transitions functional
- mobile/desktop both complete

---

# 29. Critical E2E Journey 02 — Reservation Success

```text
Review
→ Submit
→ Success
→ Reservation Detail
```

PASS:

- one Reservation only
- success only after server confirmation
- refresh recovery
- draft cleared only after success

---

# 30. Critical E2E Journey 03 — Review Auth Interruption

```text
Review
→ Submit
→ 401
→ Login
→ Review restored
→ manual Submit
→ Success
```

PASS:

- no auto-resubmit
- no draft loss
- no duplicate reservation

---

# 31. Critical E2E Journey 04 — Configure Conflict

```text
Configure with Hotel A
→ availability refresh
→ Hotel A invalid
→ conflict shown
→ user selects Hotel B
→ Review
```

PASS:

- no automatic replacement
- unrelated selections preserved

---

# 32. Critical E2E Journey 05 — Schedule Conflict

```text
Tour Detail
→ choose Schedule A
→ Configure
→ Review
→ Schedule A becomes unavailable
```

PASS:

- Style/config remains where meaningful
- Schedule invalidated
- user explicitly chooses replacement
- submit blocked until valid

---

# 33. Critical E2E Journey 06 — Previous Trips

```text
Login
→ Previous Trips Popup
→ View All
→ My Trips
```

PASS:

- one history fetch/cache lifecycle where possible
- list recent-first
- Popup failure does not logout user

---

# 34. Critical E2E Journey 07 — Offline Recovery

```text
Tour Detail cached
→ offline
→ stale content visible
→ action requiring server blocked
→ reconnect
→ F1 data refresh
```

PASS:

- no fake online success
- no mutation queue

---

# 35. Critical E2E Journey 08 — Refresh During Transaction

```text
Configure
→ selections
→ browser refresh
→ session draft rehydrate
→ latest server truth fetch
```

PASS:

- valid selections restore
- stale invalid selection marked
- no hidden credential/private data restored

---

# 36. Critical E2E Journey 09 — Keyboard-Only Reservation Flow

Desktop:

```text
Tour Detail
→ Style
→ Schedule
→ Configure
→ Review
```

키보드만으로 완료.

PASS:

- logical tab order
- radio semantics
- focus-visible
- no pointer-only control

---

# 37. Critical E2E Journey 10 — Mobile 320px

```text
Home
→ Tour Detail
→ Configure
→ Review
```

320px width.

PASS:

- no horizontal content overflow
- bottom CTA visible
- safe-area
- text not clipped
- option cards usable

---

# 38. Non-Functional Acceptance

Shared NFR에 맞춰 Frontend 관점에서 확인한다.

## NFR-01 Voice recognition >= 90%

Voice model 자체의 정확도는 `ai-console` 책임.

Frontend QA는:

```text
recognized command event
→ correct existing GUI action
```

을 검증.

## NFR-02 Data accuracy 100%

Frontend contribution:

```text
adapter mapping accuracy
no stale overwrite
no invented values
```

## NFR-04 10 integration scenarios, 9+ success

Frontend critical journeys는 최소 10개 정의되어 있으므로
통합 평가 시 이 시나리오 집합을 사용할 수 있다.

단 최종 shared integration scenario는 팀 합의와 맞춰야 한다.

## NFR-05 Backend response <= 3s

Frontend는 3초 동안 blank로 기다리지 않는다.

---

# 39. Performance Acceptance

초기 목표:

```text
No main-thread animation jank visible
Route transition doesn't block interaction unnecessarily
Hero image progressive
Large image lazy where appropriate
No repeated identical network calls
No whole-page rerender for local selection
```

정량 Web Vitals 기준은 Shared NFR에 없으므로
CP10에서 임의 SLA를 만들지 않는다.

---

# 40. Network Request Acceptance

Browser devtools/test spy로 확인:

- [ ] duplicate GET dedup
- [ ] mutation no auto retry
- [ ] route leave old response race 없음
- [ ] focus refresh only where intended
- [ ] Popup/My Trips cache reused
- [ ] private cache cleared on auth loss
- [ ] public Tour cache remains where safe

---

# 41. Adapter Contract Tests

API v0.2가 생기는 즉시 필수.

예:

```text
TourProductResponseDto
→ mapTourProductToTourCard
→ exact expected TourCardModel
```

최소 대상:

```text
TourProduct
TourSchedule
Reservation
Travel History
Auth
Configuration/Price when defined
```

---

# 42. Malformed DTO Tests

예:

```text
missing required identity
invalid style enum
missing schedule date
invalid reservation id
history item missing price
```

Result:

```text
ContractMappingError
```

UI deep crash 금지.

---

# 43. Race Condition Tests

## Tour Detail

rapid tour navigation.

## Configure

rapid option switching.

## Price

old request arrives after new selection.

## Auth

login request duplicate.

## Reservation

double click Submit.

## History

login popup fetch + My Trips route simultaneous.

PASS:

Latest intent/data ownership rule 유지.

---

# 44. Draft Persistence Tests

- [ ] create draft
- [ ] refresh
- [ ] valid rehydrate
- [ ] incompatible version
- [ ] explicit discard
- [ ] success clears
- [ ] 401 does not clear
- [ ] 409 does not clear
- [ ] 422 does not clear
- [ ] credentials absent

---

# 45. Cache Freshness Tests

## F1

Schedule/Reservation:

- [ ] fresh no unnecessary refetch
- [ ] stale background refresh
- [ ] focus refresh
- [ ] reconnect refresh

## F2

Tours:

- [ ] 5min-ish policy configurable
- [ ] navigation back avoids skeleton flash

## F3

History:

- [ ] Popup/My Trips share cache

Exact time constants are Frontend policy and can be tuned without business contract change.

---

# 46. Offline Tests

- [ ] cached public read works
- [ ] stale indicator
- [ ] uncached query error
- [ ] Login blocked
- [ ] Signup blocked
- [ ] Reservation Submit blocked
- [ ] no offline mutation queue
- [ ] reconnect refresh

---

# 47. Accessibility Critical Gate

Release blocker if any:

```text
core flow keyboard inaccessible
focus trapped incorrectly
modal cannot close
focus lost behind modal
critical status color-only
form label missing
error cannot be associated
200% zoom breaks critical flow
reduced-motion still contains severe motion
```

이 문제는 최소 S1/S2로 분류.

---

# 48. Manual Screen Reader-Oriented Checks

자동화만으로 끝내지 않는다.

최소:

```text
Home heading order
Tour Style group
Schedule group
Configure option groups
Review error
Login dialog
Signup form
Previous Trips list
My Trips list
Reservation status
```

실제 AT 사용이 가능하면 VoiceOver/NVDA 계열로 검증.

---

# 49. Focus Regression Checks

visual regression과 별도로:

```text
focus ring visible
focus order
focus return
route focus
error focus
```

를 수동/통합 테스트.

---

# 50. Motion QA

검증 모드:

```text
normal motion
reduced motion
slow CPU if possible
```

PASS:

- no jarring queue
- rapid selection doesn't stack animation
- route remains responsive
- state always understandable without motion

---

# 51. Loading QA

각 주요 page:

```text
100ms
400ms
1200ms
3000ms
```

비교.

검증:

- [ ] skeleton flash 방지
- [ ] skeleton geometry
- [ ] partial render
- [ ] full-page spinner 없음
- [ ] slow image independent

---

# 52. Empty QA

최소:

```text
No TourProducts
No schedules
No history
No extras
Missing draft
```

각 Empty가:

```text
empty
error
contract failure
```

중 무엇인지 명확해야 한다.

---

# 53. Error QA

모든 Error는:

```text
copy
recovery
preserved state
```

를 갖는지 확인.

Critical error를 toast-only로 처리하면 FAIL.

---

# 54. 409 Conflict QA

필수 확인:

```text
existing choices visible
changed data highlighted
no silent acceptance
reconfirmation required
```

---

# 55. 422 Validation QA

필수:

```text
field/section mapped
error message understandable
focus navigation possible
draft preserved
```

---

# 56. 401 Auth QA

필수:

```text
return context
draft preservation
private cache handling
no auto-resubmit
```

---

# 57. 404 QA

Tour / Reservation:

```text
branded Not Found
escape route
no infinite retry
```

---

# 58. Image Failure QA

Hero/card/service/history images 각각:

- [ ] fallback
- [ ] text remains
- [ ] no broken-image icon
- [ ] no layout collapse
- [ ] alt semantics remain sensible

---

# 59. Long Content QA

Fixture:

```text
very long product title
long Korean error
long address
large price
long date range
many history items
many options
```

검증:

- no clipping
- no overlap
- no inaccessible ellipsis for critical data

---

# 60. 200% Zoom QA

최소 critical screens:

```text
Tour Detail
Configure
Review
Login
Signup
Previous Trips Popup
```

PASS:

- no horizontal whole-page scroll
- CTA reachable
- dialog scroll
- sticky fallback
- text reflow

---

# 61. 320px QA

Critical:

```text
Home
Tour Detail
Configure
Review
Login
Signup
Previous Trips
```

PASS:

- no fixed-width overflow
- touch target
- bottom CTA safe
- headings wrap

---

# 62. 1728+ QA

Critical:

```text
Home
Tours
Tour Detail
My Trips
```

PASS:

- line length constrained
- cards not comically wide
- whitespace intentional
- hero copy remains composed

---

# 63. Software Keyboard QA

Login/Signup:

- [ ] field remains visible
- [ ] next field reachable
- [ ] submit reachable
- [ ] no fixed CTA overlap
- [ ] landscape reasonable

Future participant input이 생기면 동일 test 적용.

---

# 64. Safe Area QA

iOS-like notch/home indicator simulation:

```text
Configure bottom bar
Review submit bar
Previous Trips sheet
mobile nav
```

검증.

---

# 65. Browser Back/Forward QA

- [ ] Home scroll restore
- [ ] Tours card context
- [ ] Detail selection
- [ ] Configure draft
- [ ] Review back
- [ ] Success no duplicate submit
- [ ] Auth return context

---

# 66. Direct URL QA

```text
/
 /tours
 /tours/:tourId
 /tours/:tourId/configure
 /reservation/review
 /reservation/:id/success
 /reservations/:id
 /login
 /signup
 /my-trips
```

필요 context 없으면 safe recovery.

---

# 67. Refresh QA

각 route에서 browser refresh.

CP8 Page Refresh Matrix대로 검증.

특히:

```text
Configure draft rehydrate
Review revalidate
Success reservation refetch
My Trips cache/refetch
```

---

# 68. Auth Privacy QA

검사:

```text
credential storage
console
network log
sessionStorage
localStorage
error telemetry
```

민감 정보가 불필요하게 남지 않아야 한다.

---

# 69. Contract Safety QA

구현 리뷰에서 search/check:

```text
hard-coded API path not in docs
Theme used as tourId
participantCount hidden default = 1 or 2
Honeymoon couple math without >=2/even validation
invented Couple/Team Entity or coupleCount API field
frontend price formula
fake discount
fake SMS delivered
fake history detail route
invented option endpoint
invented refresh-token endpoint
```

하나라도 production path에 있으면 FAIL.

---

# 70. Code Review Checklist

PR마다:

- [ ] Requirement IDs
- [ ] affected screen
- [ ] endpoint list
- [ ] contract assumptions
- [ ] tests run
- [ ] states tested
- [ ] responsive checked
- [ ] accessibility checked
- [ ] mocks clearly marked
- [ ] no cross-repo unauthorized change

Frontend AGENTS contract와 일치.

---

# 71. PR Test Evidence

PR description에 최소:

```text
Unit / Component
Integration
Manual responsive
A11y
Network/error simulations
```

결과 기록.

Screenshot/GIF은 보조 증거.

“로컬에서 잘 됨” 한 줄은 충분하지 않다.

---

# 72. Release Smoke Test

배포 직전 최소:

```text
Home loads
Tours loads
Detail loads
Configure usable
Review usable
Login usable
Signup usable
Reservation path if integrated
History path if integrated
mobile 390
desktop 1280
```

Contract-gated feature가 아직 미통합이면
명확히 disabled/dev-only여야 한다.

---

# 73. Release Candidate Sign-off

필수 role concept:

```text
Frontend owner
Backend/API owner for integrated contracts
Shared docs owner if contract changes occurred
```

특히 P0 contract가 닫힌 첫 integration release에서는
Frontend 단독 sign-off로 끝내지 않는다.

---

# 74. Known Contract-Gate Test Plan

## Theme ↔ TourProduct

Contract close 후:

- one Theme multiple products fixture
- one Theme zero products
- selected product routing

## participantCount

Contract close 후:

- min
- multi-person
- invalid range
- price relationship if any

## Honeymoon semantics — CLOSED in v0.1.2

Always test:

- participantCount 1 → invalid
- participantCount 2 → valid / 1 couple
- participantCount 3 → invalid
- participantCount 4 → valid / 2 couples
- participantCount 6 → valid / 3 couples
- recruitment display uses derived couple semantics only for valid Honeymoon counts
- final confirmation truth still comes from Backend

## Auth

- valid
- invalid
- expired
- protected route
- session recovery

---

# 75. Test Data Policy

Test fixture는:

```text
deterministic
named
documented
```

해야 한다.

예:

```text
tour_honeymoon_grand
schedule_recruiting_2_of_3
reservation_conflict_price_changed
history_empty
```

무작위 값 때문에 테스트가 flaky해지지 않게 한다.

---

# 76. Flaky Test Policy

Flaky test를 그냥 rerun으로 숨기지 않는다.

Rule:

```text
reproduce
classify
fix or quarantine with owner/date
```

Critical E2E flaky 상태면 Release confidence를 낮추므로
Release Gate에서 명시적으로 다룬다.

---

# 77. Test Isolation

각 test는 가능하면:

```text
own fixture
own cache reset
own draft state
own auth state
```

를 가진다.

이전 test state가 다음 test에 영향을 주면 안 된다.

---

# 78. Accessibility Automation Gate

자동 axe 계열 critical violation:

```text
0
```

를 목표로 한다.

하지만:

```text
0 violations
≠ accessible
```

이므로 manual keyboard/focus/reading order 검증을 필수 유지.

---

# 79. Visual QA Ownership

Frontend owner가 최종 visual consistency를 확인.

특히:

```text
Typography
spacing
image crop
motion
loading
selected state
error state
mobile transformation
```

CP2–CP5와 대조.

---

# 80. Product Copy QA

검증:

- [ ] Theme terminology
- [ ] Tour Style naming
- [ ] no fake real-time
- [ ] no fake SMS sent
- [ ] no fake discount
- [ ] no fake price
- [ ] no “4 people” where official team semantics later differs
- [ ] error copy calm/clear

Contract가 닫히면 관련 문구를 다시 갱신.

---

# 81. QA Artifacts

권장 구현 시 산출:

```text
test plan
fixture catalog
state harness
visual snapshots
a11y manual checklist
E2E results
release smoke checklist
known issues
```

CP10 문서가 master acceptance contract.

---

# 82. Screen Acceptance Summary

| Screen | Functional | States | Responsive | A11y | Contract Safety | Result |
|---|---|---|---|---|---|---|
| Home | PASS criteria defined | ✓ | ✓ | ✓ | ✓ | Ready to test |
| Tours | PASS criteria defined | ✓ | ✓ | ✓ | ✓ | Ready to test |
| Tour Detail | PASS criteria defined | ✓ | ✓ | ✓ | gated checks | Ready to test |
| Configure | PASS criteria defined | ✓ | ✓ | ✓ | gated checks | Ready to test |
| Review | PASS criteria defined | ✓ | ✓ | ✓ | gated checks | Ready to test |
| Success | PASS criteria defined | ✓ | ✓ | ✓ | gated checks | Ready to test |
| Reservation Detail | PASS criteria defined | ✓ | ✓ | ✓ | gated checks | Ready to test |
| Login | PASS criteria defined | ✓ | ✓ | ✓ | gated checks | Ready to test |
| Signup | PASS criteria defined | ✓ | ✓ | ✓ | gated checks | Ready to test |
| Previous Trips | PASS criteria defined | ✓ | ✓ | ✓ | gated checks | Ready to test |
| My Trips | PASS criteria defined | ✓ | ✓ | ✓ | gated checks | Ready to test |

---

# 83. Critical Journey Summary

```text
J01 Browse → Review
J02 Review → Success → Detail
J03 Auth interruption
J04 Option conflict
J05 Schedule conflict
J06 Login → Previous Trips → My Trips
J07 Offline recovery
J08 Refresh transaction
J09 Keyboard-only journey
J10 320px mobile journey
```

최종 integrated build에서는 **10/10 critical journey PASS**를 Frontend release gate로 둔다.

Shared NFR의 10개 중 9개 이상 integration 성공 기준과 별개로,
Frontend 자체 critical flow는 더 엄격하게 10/10을 요구한다.

---

# 84. CP10 Decision Log

## D-1001
S0/S1 defect가 있으면 release 금지.

## D-1002
Frontend critical E2E는 10/10 PASS를 요구.

## D-1003
GET transient auto retry는 CP8 정책대로 최대 1회.

## D-1004
Mutation auto retry는 0.

## D-1005
Ambiguous Reservation submit outcome은 blind retry 금지.

## D-1006
Contract gate는 mock pass로 release-complete 처리하지 않음.

## D-1007
Visual regression은 390/768/1280/1440 baseline.

## D-1008
Configure/Login/Previous Trips는 320/1024 추가 검증.

## D-1009
Critical screens는 200% zoom manual test 필수.

## D-1010
Axe 자동 검사 + manual keyboard/focus 검사 모두 필요.

## D-1011
Partial failure는 반드시 success content preservation을 검증.

## D-1012
Race condition test는 Configure/Price/Auth/Reservation/History에 필수.

## D-1013
ContractMappingError 테스트를 adapter layer에 둔다.

## D-1014
Credentials/private customer data logging 금지.

## D-1015
Release smoke는 mobile 390 + desktop 1280 최소 포함.

---

# 85. CP10 Acceptance Checklist

## Coverage

- [x] 11 screens
- [x] shared primitives
- [x] motion
- [x] data states
- [x] network
- [x] API errors
- [x] draft
- [x] cache
- [x] auth
- [x] accessibility
- [x] responsive
- [x] visual regression

## Critical Flow

- [x] 10 E2E journeys defined
- [x] duplicate submit
- [x] auth interruption
- [x] 409
- [x] 422
- [x] offline
- [x] refresh
- [x] keyboard-only
- [x] 320px

## Release Governance

- [x] severity defined
- [x] release gate defined
- [x] PR evidence defined
- [x] smoke test defined
- [x] contract-gate sign-off defined
- [x] known issue policy defined

**CP10 Status: COMPLETE**

---

# 86. Next Checkpoint

## CP11 — Implementation Handoff

다음 문서:

```text
12-IMPLEMENTATION-HANDOFF.md
```

CP11에서는 지금까지의 CP0–CP10을 실제 구현 세션이 바로 사용할 수 있는 형태로 압축한다.

핵심 산출:

```text
implementation start order
mandatory reading order
do-not-invent contract list
repository/file structure bootstrap
first implementation PR scope
mock strategy
screen sequence
test requirements
handoff checklist
definition of implementation-ready
```

CP10이 “무엇을 검증해야 통과인가”를 잠갔다면,
CP11은 “새 구현 세션이 무엇부터 어떤 순서로 만들면 되는가”를 최종 전달한다.
