# Mister World Frontend — CP7 QA & Test Plan

> Status: **COMPLETE**  
> Checkpoint: **CP7 — QA & Test Plan**  
> Date: **2026-09-29**  
> Target repository: `WonhoOne/frontend`  
> Shared baseline: `WonhoOne/docs/main` **v0.1.2**  
> Depends on:
> - `CP0-IMPLEMENTATION-BASELINE.md`
> - `CP1-CODE-QUALITY-STANDARDS.md`
> - `CP2-FRONTEND-ARCHITECTURE-PLAN.md`
> - `CP3-STATE-DATA-ARCHITECTURE.md`
> - `CP4-FOUNDATION-IMPLEMENTATION-PLAN.md`
> - `CP5-IMPLEMENTATION-ROADMAP.md`
> - `CP6-CONTRACT-LIVE-INTEGRATION-PLAN.md`
> - `docs/planning/07-SCREEN-SPECS.md`
> - `docs/planning/11-QA-ACCEPTANCE.md`
> - `.github/pull_request_template.md`
> - Shared NFR / Requirements / Business Rules
>
> This document supersedes older QA statements that still assume v0.1.1 Honeymoon semantics.
>
> Next checkpoint: **CP8 — Security, Performance & Release Readiness**

---

# 1. Purpose

CP7의 목적은 지금까지 정의한 구현 계획을
**검증 가능한 품질 계약**으로 바꾸는 것이다.

이 문서 이후에는 다음 질문에 개발자 감각이 아니라
테스트/증거로 답할 수 있어야 한다.

```text
이 Sub-checkpoint는 정말 완료됐는가?
어떤 테스트가 PR merge 전에 필수인가?
어떤 오류가 Release Stop인가?
어떤 화면을 어떤 viewport에서 검증해야 하는가?
401 / 409 / 422 / offline / malformed response는 어떻게 검증하는가?
Draft가 실제로 보존되는가?
Mock과 Real Adapter가 같은 Frontend Model을 만드는가?
Keyboard-only 사용자가 예약 흐름을 완료할 수 있는가?
320px / 200% zoom / reduced motion에서 핵심 task가 가능한가?
```

---

# 2. QA North Star

Mister World Frontend의 QA 원칙:

> **“Happy path가 보인다”는 완료가 아니다.**

완료는 최소 다음이 함께 증명되어야 한다.

```text
Correct behavior
State transition
Recovery
Responsive behavior
Accessibility
Contract safety
No hidden mock assumption
No business-truth invention
Regression protection
```

---

# 3. Shared NFR vs Frontend Internal Release Gate

Shared NFR:

```text
NFR-04
통합 시나리오 10개 중 9개 이상 성공
```

Frontend는 더 엄격한 내부 Release Gate를 사용한다.

```text
Frontend Release Candidate:
J01~J10 = 10 / 10 PASS
```

이것은 Shared Contract를 변경하는 것이 아니다.

의미:

```text
Shared minimum requirement      = 9 / 10
Frontend internal quality gate  = 10 / 10
```

Frontend가 더 강한 품질 기준을 적용하는 것이다.

---

# 4. QA Layers — LOCKED

QA를 다음 8개 층으로 나눈다.

```text
L0  Static Quality Gate
L1  Unit Tests
L2  Shared Component Tests
L3  Feature Integration Tests
L4  Adapter / Contract Tests
L5  Browser E2E Journeys
L6  Visual / Responsive Regression
L7  Accessibility / Manual Release Audit
```

추가 관찰 축:

```text
Network / Failure Simulation
Performance / NFR Observation
Security / Privacy Review
```

모든 품질을 E2E 하나에 몰지 않는다.

---

# 5. L0 — Static Quality Gate

도구:

```text
TypeScript
ESLint
Prettier
Build
architecture import rules
```

기본 명령:

```bash
npm run typecheck
npm run lint
npm run format
npm run build
```

Combined:

```bash
npm run verify
```

L0에서 잡아야 하는 것:

```text
type mismatch
unused/dead code
unsafe any
Promise misuse
architecture import violation
invalid build
format drift
```

---

# 6. L1 — Unit Tests

대상:

```text
pure function
reducer
serializer
mapper helper
runtime validator
query retry policy
state transition
```

대표:

```text
ReservationDraft reducer
Draft migration
Draft serializer
participantCount validity helper
Honeymoon derived coupleCount helper
error normalization
query key factory
```

Unit Test에서 DOM을 렌더링하지 않는다.

---

# 7. L2 — Shared Component Tests

대상:

```text
Button
TextLink
TextField
OptionCard
Dialog
BottomSheet
Skeleton
ImageFrame
PageContainer
Grid
Header primitives
```

검증 중심:

```text
semantics
keyboard
focus
ARIA
state
disabled behavior
reduced motion
layout contract
```

---

# 8. L3 — Feature Integration Tests

한 Feature 내부의 실제 행동을 검증한다.

대상 예:

```text
Tour Detail style + schedule selection
Configure + ReservationDraft
Review mutation state
Auth ReturnContext
Travel History cache sharing
```

Feature Integration Test는:

```text
Component
+
Feature state
+
Mock DataSource
+
TanStack Query
```

를 실제 wiring에 가깝게 조합한다.

---

# 9. L4 — Adapter / Contract Tests

IMP-6에서 실제 API가 열리면 필수.

흐름:

```text
Approved DTO fixture
→ runtime decode
→ Adapter
→ Frontend Model
```

최소 대상:

```text
Auth
TourProduct
TourSchedule
Reservation
Travel History
Configuration / Price if approved
```

Raw DTO field가
Page test에서 직접 등장하면 architecture smell이다.

---

# 10. L5 — Browser E2E

도구:

```text
Playwright
```

검증:

```text
real router
real browser
keyboard
back/forward
refresh
storage
network interception
viewport
focus
```

E2E는 핵심 Journey와
Browser-specific 문제에 집중한다.

모든 작은 component branch를 E2E로 만들지 않는다.

---

# 11. L6 — Visual / Responsive Regression

도구:

```text
Playwright toHaveScreenshot()
```

별도 SaaS visual service는 초기에는 도입하지 않는다.

Baseline screenshot은
Repository에서 관리한다.

주의:

```text
OS
browser
font
rendering environment
```

에 따라 pixel diff가 달라질 수 있으므로
CI의 동일 환경을 canonical visual environment로 사용한다.

---

# 12. L7 — Accessibility / Manual Audit

자동화:

```text
@axe-core/playwright
```

도입 시점:

```text
PR-03부터 Product Screen에 적용
```

PR-01 Foundation에서는
CP4 기준으로 별도 axe dependency를 요구하지 않는다.

자동 검사로 검출하기 어려운 항목:

```text
focus order
meaningful label quality
reading order
interaction comprehension
route focus
dialog flow
mobile usability
200% zoom
reduced-motion quality
```

은 반드시 manual audit한다.

---

# 13. Accessibility Automated Gate

Product Screen이 구현된 이후:

```text
critical axe violations = 0
serious axe violations = 0
```

를 PR merge 목표로 한다.

Moderate/minor는:

```text
실제 영향 분석
→ 수정 또는 명시적 issue
```

자동 axe PASS만으로
접근성 완료라고 판정하지 않는다.

---

# 14. Test Tool Baseline

CP4 baseline:

```text
Vitest
React Testing Library
user-event
MSW
Playwright
```

CP7 추가 QA dependency:

```text
@axe-core/playwright
```

Visual Regression:

```text
Playwright built-in screenshot comparison
```

별도:

```text
Cypress
Selenium
Storybook test runner
Chromatic
Percy
```

는 현재 필요성 없음.

---

# 15. Test Naming

테스트 이름은 구현 세부보다 사용자/상태 의미를 표현한다.

좋음:

```text
preserves the reservation draft after an unauthorized submit
keeps existing tour content when schedule refresh fails
returns focus to the dialog trigger after close
```

나쁨:

```text
calls setState
calls function once
renders component
test 1
```

---

# 16. Arrange / Act / Assert

복잡한 테스트는 논리적으로:

```text
Arrange
Act
Assert
```

구조를 유지한다.

주석을 반드시 쓸 필요는 없지만
테스트의 준비/행동/검증이 읽는 순서에서 분명해야 한다.

---

# 17. Test Fixture Rule

Fixture 두 종류를 구분한다.

## Frontend Model Fixture

계약 전:

```text
mockTourDetailModel
mockScheduleChoice
mockTravelHistoryItem
```

## Approved DTO Fixture

계약 후:

```text
tourProductDtoFixture
reservationDtoFixture
```

금지:

```text
Mock View Model JSON을 DTO fixture로 재사용
```

---

# 18. Deterministic Tests

테스트에서 임의 시간/랜덤/네트워크 결과에 의존하지 않는다.

필요 시:

```text
fake timers
fixed dates
fixed IDs
deterministic fixture
controlled MSW response
```

를 사용한다.

---

# 19. Console Error Gate

테스트 중 예상하지 않은:

```text
console.error
React act warning
unhandled promise rejection
unhandled MSW request
```

은 테스트 실패 취급을 권장한다.

명시적으로 예상하는 오류 테스트는
그 범위에서만 suppress한다.

---

# 20. Defect Severity — LOCKED

## S0 — Release Stop / Data Integrity / Security

즉시 배포 금지.

예:

```text
중복 Reservation 생성
다른 Customer private data 노출
Auth 우회
Reservation success/failure truth 반전
잘못된 가격으로 신청
Draft가 다른 사용자/session data와 섞임
Honeymoon 모집 truth를 잘못 표시해 transaction 진행
Mock production leakage로 가짜 데이터 노출
```

Release condition:

```text
S0 = 0
```

---

# 21. S1 — Critical Task Broken

핵심 사용자 여정 진행 불가.

예:

```text
Tour Detail → Configure 불가
Configure → Review 불가
Reservation Submit 불가
Login 불가
Signup 불가
My Trips 완전 접근 불가
mobile CTA가 가려짐
keyboard-only 핵심 task 불가
Dialog에 갇혀 close 불가
```

Release condition:

```text
S1 = 0
```

---

# 22. S2 — Major UX / Recovery

핵심 task는 가능하지만
복구/신뢰성이 크게 훼손.

예:

```text
409 후 Draft 유실
Back 후 configuration 유실
refresh failure가 기존 content 삭제
200% zoom에서 section overlap
focus return 실패
stale selection 자동 대체
offline 상태를 online처럼 표시
```

Release:

```text
명시적 승인 없이 남기지 않는다.
```

수용 시:

```text
workaround
impact
owner
follow-up issue
```

필수.

---

# 23. S3 — Minor

예:

```text
non-critical spacing
minor crop
copy inconsistency
non-blocking animation timing
```

Release 가능하지만
Backlog 기록.

---

# 24. S4 — Polish

예:

```text
micro alignment
hover refinement
minor easing polish
```

Release Blocker 아님.

---

# 25. Release Gate — LOCKED

Release Candidate:

```text
S0 = 0
S1 = 0

Critical E2E:
J01~J10 = 10/10

Implemented Screen Acceptance:
100%

Typecheck:
PASS

Lint:
PASS

Unit/Component:
PASS

Feature Integration:
PASS

Adapter Contract:
PASS for live resources

Visual Regression:
reviewed / accepted

Accessibility:
critical = 0
serious = 0
manual critical checks PASS

Contract Safety:
hidden assumption = 0

Production Mock Leakage:
0
```

---

# 26. Contract-Gated QA Rule

계약이 아직 열려 있는 기능은
Mock PASS만으로 “production complete”라고 부르지 않는다.

상태:

```text
UI READY
MOCK VERIFIED
LIVE CONTRACT BLOCKED
```

또는:

```text
LIVE INTEGRATED
```

로 구분한다.

---

# 27. v0.1.2 Honeymoon QA Correction

오래된 QA 문서의:

```text
H-03 mapping not invented
2 couples vs participant conflict
```

를 최신 규칙으로 교체한다.

Approved:

```text
Honeymoon participantCount >= 2
participantCount even
coupleCount = participantCount / 2
2 couples/teams confirm schedule
```

QA 필수:

```text
2 participants → 1 couple
4 participants → 2 couples
6 participants → 3 couples
1 participant → invalid Honeymoon
3 participants → invalid Honeymoon
```

단 최종 Schedule confirmed truth는
Backend response를 authority로 사용한다.

---

# 28. Test Environment Matrix

## Browser CI

PR-level 기본:

```text
Chromium
```

Release:

```text
Chromium
WebKit
Firefox
```

## Desktop Manual

```text
Chrome current
Safari current
Firefox current
```

## Mobile

Browser engine 기준:

```text
Mobile Safari/WebKit
Mobile Chrome/Chromium
```

실제 device가 가능하면
Release Candidate에서 최소 iOS/Android 각각 1대 확인.

---

# 29. Viewport Matrix

Canonical widths:

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

기본 PR screen smoke:

```text
390
768
1280
```

Critical transaction screen:

```text
320
1024
```

추가.

Final Release:

```text
모든 canonical width
```

---

# 30. Visual Regression Breakpoints

기본:

```text
390
768
1280
1440
```

Critical:

```text
Configure
Login
Previous Trips Popup
```

추가:

```text
320
1024
```

---

# 31. Input Matrix

해당되는 중요 flow는:

```text
Mouse
Keyboard-only
Touch
200% zoom
Reduced Motion
screen-reader-oriented semantic inspection
```

검증.

Voice는 IMP-7 별도.

---

# 32. Network Matrix

Latency simulation:

```text
100ms
400ms
1200ms
3000ms
```

특히 data-heavy Screen은:

```text
400
1200
3000
```

필수.

---

# 33. Failure Matrix

최소:

```text
401
404
409
422
500
timeout
offline
malformed 2xx
image failure
partial dependency failure
abort/race
```

모든 Screen에 모든 status를 억지로 적용하지 않는다.

Resource/action에 의미가 있는 상태만 검증한다.

---

# 34. MSW Scenario Registry

Dev/Test scenario:

```text
happy
slow
empty
network-error
server-500
unauthorized-401
conflict-409
validation-422
partial-failure
image-failure
offline
stale-refresh
reservation-success
reservation-ambiguous-response
history-empty
history-populated

honeymoon-valid-2
honeymoon-valid-4
honeymoon-valid-6
honeymoon-invalid-1
honeymoon-invalid-3
```

Scenario 이름 자체가 기대 행동을 설명해야 한다.

---

# 35. Shared Primitive — Button

필수:

- [ ] semantic `button`
- [ ] Enter/Space activation
- [ ] disabled activation blocked
- [ ] loading state
- [ ] focus-visible
- [ ] minimum target
- [ ] label/layout stable
- [ ] loading double-click blocked where wrapper uses pending

---

# 36. TextLink

- [ ] semantic link
- [ ] internal route navigation
- [ ] keyboard Enter
- [ ] focus-visible- [ ] disabled-like fake link not used
- [ ] external link behavior only when applicable

---

# 37. TextField

- [ ] visible label
- [ ] `htmlFor`/id
- [ ] helper association
- [ ] error association
- [ ] `aria-invalid`
- [ ] long input
- [ ] disabled
- [ ] keyboard
- [ ] 200% zoom
- [ ] mobile viewport

---

# 38. OptionCard

- [ ] visual selected state
- [ ] disabled
- [ ] invalid
- [ ] focus-within
- [ ] actual radio/checkbox semantics owned externally/native
- [ ] selection not color-only
- [ ] rapid selection latest intent

---

# 39. Dialog

- [ ] accessible name
- [ ] open focus
- [ ] focus containment
- [ ] Escape where allowed
- [ ] explicit close
- [ ] background interaction blocked
- [ ] focus return
- [ ] reduced motion
- [ ] 200% zoom
- [ ] long content scrolling

---

# 40. BottomSheet

- [ ] dialog semantics
- [ ] explicit close
- [ ] focus containment
- [ ] focus return
- [ ] safe-area
- [ ] max height
- [ ] long content scroll
- [ ] 320px
- [ ] reduced motion
- [ ] software keyboard when input exists

---

# 41. Skeleton

- [ ] final geometry similarity
- [ ] aria-hidden
- [ ] parent loading semantics
- [ ] no layout jump
- [ ] reduced-motion no shimmer
- [ ] no full-page generic spinner replacement

---

# 42. ImageFrame

- [ ] placeholder
- [ ] slow load
- [ ] loaded
- [ ] failure fallback
- [ ] no broken browser icon
- [ ] meaningful/decorative alt
- [ ] responsive crop
- [ ] reduced-motion reveal

---

# 43. App Shell Tests

- [ ] app boot
- [ ] QueryProvider
- [ ] Error Boundary fallback
- [ ] Skip Link
- [ ] main landmark
- [ ] route placeholder/page mount
- [ ] unknown route
- [ ] direct URL
- [ ] back/forward
- [ ] route focus baseline

---

# 44. ReservationDraft Unit Matrix

Actions:

```text
START_DRAFT
SELECT_TOUR_STYLE
SELECT_SCHEDULE
SET_PARTICIPANT_COUNT
SELECT_HOTEL
SELECT_TRANSPORT
SELECT_MEAL
SET_EXTRAS
RESTORE_DRAFT
DISCARD_DRAFT
CLEAR_AFTER_SUCCESS
```

검증:

- [ ] unrelated field preserved
- [ ] updatedAt changes
- [ ] action immutable
- [ ] explicit clear
- [ ] no raw DTO inserted
- [ ] price not stored
- [ ] credentials not stored

---

# 45. Draft Persistence Matrix

- [ ] serialize V1
- [ ] parse V1
- [ ] corrupt JSON
- [ ] invalid shape
- [ ] unknown schema version
- [ ] migration path
- [ ] sessionStorage failure
- [ ] refresh restore
- [ ] Back/Forward preservation
- [ ] explicit discard
- [ ] success clear
- [ ] 401 preserve
- [ ] 409 preserve
- [ ] 422 preserve
- [ ] network preserve
- [ ] offline preserve

---

# 46. Honeymoon Unit Matrix

General:

```text
participantCount 1 → valid
2 → valid
3 → valid
```

Honeymoon:

```text
1 → invalid
2 → valid / 1 couple
3 → invalid
4 → valid / 2 couples
6 → valid / 3 couples
```

금지 테스트 기대:

```text
default = 2
```

같은 UI 미승인 assumption.

---

# 47. Query Retry Matrix

GET transient:

```text
first failure
→ max one retry
```

No retry:

```text
401
403
404
409
422
ContractMappingError
```

Mutation:

```text
retry = 0
```

테스트에서 실제 invocation count 확인.

---

# 48. Query Freshness Matrix

## F1

```text
Schedule
Recruitment
Reservation status
availability
```

- [ ] fresh no unnecessary refetch
- [ ] stale background refresh
- [ ] focus refresh
- [ ] reconnect refresh
- [ ] existing content retained

## F2

Tour:

- [ ] cache hit avoids skeleton flash
- [ ] stale refresh preserves cards/detail

## F3

History:

- [ ] Popup/My Trips same key/cache
- [ ] no duplicate independent fetch lifecycle

---

# 49. Race Matrix

## Tour navigation

```text
Tour A request
→ user opens Tour B
→ A response arrives late
```

PASS:

```text
B remains visible
```

## Configure selection

rapid option changes.

PASS:

```text
latest intent remains selected
```

## Price

old result arrives late.

PASS:

```text
old price cannot overwrite latest draft fingerprint
```

## Login

double submit.

PASS:

```text
one mutation
```

## Reservation

double click.

PASS:

```text
one create mutation
```

---

# 50. Partial Failure Matrix

예:

```text
Tour core success
Schedule error
Image error
```

PASS:

```text
Tour core remains visible
Schedule local error
Image local fallback
```

FAIL:

```text
entire Page disappears
```

---

# 51. Home Acceptance — S01

Functional:

- [ ] Hero CTA → Tours
- [ ] Theme/Product discovery navigation
- [ ] GlobalHeader
- [ ] direct `/`
- [ ] rapid click does not duplicate navigation

Responsive/A11y:

- [ ] 320 usable
- [ ] 1728+ constrained
- [ ] DOM reading order logical
- [ ] one H1
- [ ] contrast readable
- [ ] reduced-motion removes signature transform

Contract:

- [ ] Theme != tourId
- [ ] multiple TourProducts per Theme structurally possible

---

# 52. Tours Acceptance — S02

- [ ] View Model driven
- [ ] no invented search/filter/sort
- [ ] desktop collection
- [ ] mobile 1-column
- [ ] no core mobile carousel
- [ ] cache hit no skeleton flash
- [ ] refresh preserves list
- [ ] partial image failure local
- [ ] cards semantic links
- [ ] Theme/TourProduct distinction preserved

---

# 53. Tour Detail Acceptance — S03

- [ ] direct route
- [ ] valid TourProduct
- [ ] Not Found
- [ ] allowed styles
- [ ] Honeymoon/Parents no Classic
- [ ] Schedule single selection
- [ ] Schedule error local
- [ ] stale refresh
- [ ] unavailable selection conflict
- [ ] Continue gated
- [ ] keyboard style/schedule
- [ ] recruitment text alternative
- [ ] Honeymoon couple semantics v0.1.2 correct
- [ ] Backend final confirmation authority preserved

---

# 54. Configure Acceptance — S04

Selection:

- [ ] Hotel single-select
- [ ] Transport single-select
- [ ] Meal single-select
- [ ] Extras per current Mock/contract
- [ ] latest selection wins
- [ ] unrelated group preserved

Draft:

- [ ] refresh restore
- [ ] Back restore
- [ ] invalid stale choice marked
- [ ] no auto replacement
- [ ] no credential persistence

Price presentation:

- [ ] old known value remains while updating
- [ ] no `0` flash
- [ ] no frontend business calculation

Responsive:

- [ ] >=1024 sticky summary
- [ ] <1024 side summary removed
- [ ] mobile bottom action
- [ ] safe-area
- [ ] no overlap

Contract:

- [ ] participant default absent until approved
- [ ] no invented options endpoint

---

# 55. Reservation Review Acceptance — S05

- [ ] Draft immediate render
- [ ] freshness-sensitive data revalidation hook
- [ ] Change returns correct screen
- [ ] Back preserves Draft
- [ ] one submit mutation
- [ ] loading lock
- [ ] success only on confirmed result
- [ ] 401 → Login → Review restore
- [ ] no auto-resubmit
- [ ] 409 reconfirm
- [ ] 422 inline correction
- [ ] 5xx Draft preserved
- [ ] ambiguous outcome no blind retry
- [ ] keyboard submit
- [ ] mobile bottom action no overlap
- [ ] no payment UI

---

# 56. Reservation Success Acceptance — S06

- [ ] only server/mock-confirmed success state
- [ ] reservationId based recovery
- [ ] direct refresh
- [ ] partial recruitment failure local
- [ ] browser Back cannot duplicate submit
- [ ] no confetti
- [ ] recruitment semantics correct
- [ ] SMS delivery success not fabricated
- [ ] H1/route focus
- [ ] reduced motion

---

# 57. Reservation Detail Acceptance — S07

- [ ] valid ID
- [ ] Not Found
- [ ] Unauthorized
- [ ] status/configuration separated
- [ ] refresh preserves content
- [ ] local partial failure
- [ ] stale/offline distinguished
- [ ] recruitment semantics
- [ ] no cancel/refund/payment
- [ ] no invented status enum

---

# 58. Login Acceptance — S08

- [ ] direct route
- [ ] desktop AuthSurface
- [ ] mobile AuthSurface
- [ ] visible labels
- [ ] Enter submit
- [ ] duplicate blocked
- [ ] network failure
- [ ] auth rejection
- [ ] input preserved where safe
- [ ] focus containment
- [ ] Escape only where safe
- [ ] focus return
- [ ] ReturnContext restore
- [ ] credentials never storage/log
- [ ] only approved fields in live mode

---

# 59. Signup Acceptance — S09

- [ ] direct route
- [ ] name
- [ ] address
- [ ] contact
- [ ] no Employee signup
- [ ] only contract credential fields
- [ ] duplicate blocked
- [ ] recoverable input preservation
- [ ] long address
- [ ] mobile keyboard
- [ ] 200% zoom
- [ ] inline validation
- [ ] no social login invention
- [ ] no password rule invention

---

# 60. Previous Trips Popup Acceptance — S10

- [ ] normal Login trigger
- [ ] recent-first
- [ ] product / period / style / price
- [ ] long list internal scroll
- [ ] History error does not undo Login
- [ ] local retry
- [ ] close retains context
- [ ] View All → My Trips
- [ ] cache shared
- [ ] desktop Dialog focus
- [ ] mobile Sheet
- [ ] no history detail link invention

---

# 61. My Trips Acceptance — S11

- [ ] auth behavior per approved contract/live mode
- [ ] Login → return to My Trips
- [ ] cache reused
- [ ] recent-first
- [ ] no Upcoming/Past taxonomy
- [ ] empty → Tours
- [ ] offline cache distinction
- [ ] item noninteractive without detail route
- [ ] semantic list
- [ ] visual order = DOM order
- [ ] missing price not shown as 0

---

# 62. J01 — Browse to Review

Purpose:

```text
core browsing + transaction entry
```

Precondition:

```text
happy discovery/config fixture
```

Steps:

```text
Home
→ Tours
→ Tour Detail
→ select Style
→ select Schedule
→ Configure
→ choose Hotel
→ choose Transport
→ choose Meal
→ Review
```

Assertions:

```text
correct tour identity
style preserved
schedule preserved
configuration preserved
Draft persisted
no contract-invented value
Review shows same selections
```

Viewport:

```text
1280
390
```

Release:

```text
PASS required
```

---

# 63. J02 — Reservation Success

Precondition:

```text
valid Review
mock/live successful Reservation create
```

Steps:

```text
Review
→ Submit
→ Success
→ Reservation Detail
→ refresh
```

Assertions:

```text
one mutation
Draft clears only after success
reservationId drives recovery
refresh restores
Back does not duplicate submit
```

---

# 64. J03 — Auth Interruption

Precondition:

```text
valid Draft
Reservation submit returns 401
```

Steps:

```text
Review
→ Submit
→ 401
→ Login
→ Auth success
→ Review restored
→ manual Submit
→ Success
```

Assertions:

```text
Draft retained
ReturnContext valid
no automatic POST after Login
one explicit second submission
private cache handling correct
```

---

# 65. J04 — Option Conflict

Precondition:

```text
Hotel A selected
refresh marks Hotel A invalid
```

Steps:

```text
Configure
→ select Hotel A
→ refresh
→ conflict
→ select Hotel B
→ Review
```

Assertions:

```text
Hotel A invalid shown
Meal/Transport preserved
no auto Hotel replacement
Review contains Hotel B
```

---

# 66. J05 — Schedule Conflict

Precondition:

```text
Schedule A selected
later unavailable
```

Steps:

```text
Tour Detail
→ Schedule A
→ Configure
→ Review
→ revalidate
→ conflict
→ return/select Schedule B
→ Review
```

Assertions:

```text
Schedule A invalidated
configuration preserved where compatible
submit blocked until valid
replacement explicit
```

---

# 67. J06 — Previous Trips

Steps:

```text
Login
→ Previous Trips Popup
→ View All
→ My Trips
```

Assertions:

```text
Login remains successful if History fails
normal happy case recent-first
same cache/query identity
View All works
no fake detail navigation
```

---

# 68. J07 — Offline Recovery

Precondition:

```text
Tour Detail already cached
```

Steps:

```text
open cached detail
→ offline
→ inspect state
→ try server-dependent action
→ reconnect
```

Assertions:

```text
cached content remains
stale/offline visible
no fake mutation success
no offline mutation queue
F1 refresh on reconnect
```

---

# 69. J08 — Refresh During Transaction

Steps:

```text
Configure
→ selections
→ browser refresh
→ rehydrate
→ latest truth refresh
```

Assertions:

```text
valid choice identities restored
server truth not persisted
stale invalid choice marked
credentials/private profile absent
```

---

# 70. J09 — Keyboard-Only Journey

Desktop:

```text
Tour Detail
→ select Style
→ select Schedule
→ Configure
→ Review
```

Input:

```text
keyboard only
```

Assertions:

```text
logical tab order
visible focus
native selection semantics
Dialog/Sheet accessible
no pointer-only action
```

---

# 71. J10 — 320px Mobile Journey

Viewport:

```text
320px
```

Steps:

```text
Home
→ Tour Detail
→ Configure
→ Review
```

Assertions:

```text
no horizontal task overflow
CTA reachable
safe-area respected
text readable
OptionCard usable
BottomSheet usable
no hidden content under action bar
```

---

# 72. Critical Journey Browser Matrix

PR development:

```text
Chromium
```

Before Release:

```text
J01–J10 Chromium
J01/J02/J03/J09/J10 WebKit
J01/J02/J09/J10 Firefox
```

필요 시 browser-specific defect가 나오면
해당 Journey 전체 browser coverage 확대.

---

# 73. Critical Journey Network Matrix

특히:

```text
J01 → 400/1200ms
J02 → 400/1200ms
J03 → 400/1200ms
J04 → conflict response
J05 → conflict response
J06 → history slow/error
J07 → offline/reconnect
J08 → stale refresh
```

검증.

---

# 74. Visual Regression Scope

Shared:

```text
GlobalHeader
TransactionHeader
Button variants
TextField states
OptionCard states
Dialog
BottomSheet
Skeleton
ImageFrame fallback
```

Screens:

```text
Home
Tours
Tour Detail
Configure
Review
Success
Reservation Detail
Login
Signup
Previous Trips
My Trips
```

---

# 75. Visual Baseline Rule

Screenshot baseline은:

```text
stable fixture
fixed viewport
reduced environmental variability
no random data
no live clock
```

로 생성.

변경 시:

```text
expected design change
or
regression
```

인지 사람이 diff를 검토한다.

Blind snapshot update 금지.

---

# 76. Visual Diff Failure

자동 pixel diff가 아니라 의미를 본다.

Release-impacting visual regression:

```text
content overlap
clipping
wrong breakpoint transformation
CTA hidden
focus invisible
fallback missing
wrong Theme layout
text unreadable
dialog outside viewport
```

Font anti-aliasing 정도의 미세 차이만으로
S1/S2를 만들지 않는다.

---

# 77. Accessibility Test Matrix
## Automated

```text
axe
semantic roles
accessible names
ARIA relation
```

## Manual

```text
keyboard path
focus order
focus return
route entry focus
200% zoom
reduced motion
touch target
color-independent status
reading order
modal background isolation
```

---

# 78. Keyboard Checklist

각 interactive Screen:

- [ ] Tab 순서 논리적
- [ ] Shift+Tab 역방향
- [ ] Enter
- [ ] Space where appropriate
- [ ] Escape modal
- [ ] visible focus
- [ ] hidden content focus 불가
- [ ] sticky/fixed UI가 focused item 가리지 않음

---

# 79. 200% Zoom Checklist

Minimum:

```text
Header
Tour Detail selection
Configure
Review
Login
Signup
Dialog
BottomSheet
History surfaces
```

PASS:

```text
critical task still possible
no overlapping labels/buttons
close/action reachable
horizontal task scrolling not required
```

---

# 80. Reduced Motion Checklist

With:

```text
prefers-reduced-motion: reduce
```

must remove/shorten:

```text
parallax
shared transform
spring/bounce
digit roll
shimmer
long route animation
```

State meaning remains.

---

# 81. Mobile Touch Checklist

Interactive target:

```text
>= 44x44
```

특히:

```text
header controls
close
back
OptionCard selection target
bottom CTA
sheet close
```

---

# 82. Image Accessibility

- [ ] decorative `alt=""`
- [ ] meaningful descriptive alt
- [ ] no filename-generated alt
- [ ] failure fallback retains section meaning
- [ ] important content not image-only

---

# 83. Network Request QA

확인:

```text
duplicate GET
mutation retry
route race
focus refetch
reconnect refetch
Popup/MyTrips dedupe
private cache clear
public cache retain
AbortSignal
```

Browser network panel 또는 test spy 사용.

---

# 84. NFR-02 Data Accuracy Frontend Contribution

Shared NFR:

```text
data storage/retrieval accuracy 100%
```

Frontend 책임 범위:

```text
DTO mapping exactness
no value fabrication
no stale overwrite
correct identity
correct selection preservation
correct price display from server
correct History ordering from approved truth
```

Adapter tests는 이 NFR의 Frontend evidence다.

---

# 85. NFR-05 Response ≤ 3s

Shared NFR은 Backend response 목표다.

Frontend는 별도의 3초 client timeout을 자동으로 만들지 않는다.

Frontend QA:

```text
1200ms
3000ms
```

에서도:

```text
blank screen 금지
usable skeleton
partial content
no blocked navigation animation
```

을 검증한다.

---

# 86. Performance Observation

Shared NFR에 Web Vitals 숫자는 없다.

따라서 임의 SLA를 Shared requirement처럼 만들지 않는다.

Frontend 내부 observation:

```text
duplicate request 없음
unnecessary whole-page rerender 없음
large image lazy strategy
route transition jank 없음
local selection 때문에 app-wide rerender 없음
main-thread blocking animation 없음
```

정량 performance budget은 CP8에서 Release policy로 별도 결정한다.

---

# 87. PR Test Matrix — PR-01

Foundation:

Required:

```text
L0 all
Shared component tests
Router smoke
Dialog/Sheet keyboard
Reduced Motion
Foundation E2E Chromium
```

Viewports:

```text
390
1280
```

Manual:

```text
200% Dialog/Sheet
focus return
```

No axe dependency required yet.

---

# 88. PR-02

App Runtime:

Required:

```text
route integration
back/forward
scenario harness
state presentation
motion runtime
reduced motion
```

E2E:

```text
all routes smoke
```

---

# 89. PR-03

Home + Tours:

Required:

```text
S01/S02 component/integration
navigation E2E
visual baseline
axe
320 smoke
390/768/1280 screenshot
image failure
slow loading
```

---

# 90. PR-04

Tour Detail:

Required:

```text
Style rule tests
Schedule state tests
Honeymoon v0.1.2 tests
partial failure
race navigation
keyboard selection
visual regression
axe
```

E2E partial:

```text
J01 through Configure entry
```

---

# 91. PR-05

ReservationDraft + Configure:

Required:

```text
Draft reducer
persistence
schema failure
sessionStorage failure
selection race
price presentation
conflict state
mobile BottomSheet
axe
visual
```

E2E:

```text
J01
J04
J08
J09 partial
J10 partial
```

---

# 92. PR-06

Review + Success + Detail:

Required:

```text
mutation harness
duplicate submit
401
409
422
5xx
ambiguous outcome
success Draft clear
refresh recovery
status partial failure
```

E2E:

```text
J02
J04
J05
J08
```

---

# 93. PR-07

Login + Signup:

Required:

```text
AuthState
ReturnContext
credential non-persistence
duplicate login
error preservation
focus trap/return
mobile keyboard
200% zoom
axe
```

E2E:

```text
J03
J09 auth portion
```

---

# 94. PR-08

Previous Trips + My Trips:

Required:

```text
shared query key/cache
recent-first fixture
empty
error
offline
popup focus
sheet
long list
axe
visual
```

E2E:

```text
J06
```

---

# 95. PR-09

Live Backend Adapter:

Required per endpoint:

```text
runtime decode
Adapter unit
HTTP integration
MSW approved DTO fixture
error mapping
ContractMappingError
AbortSignal
Mock/Real parity
```

Live integration:

```text
available endpoint tests
```

Critical Journeys:

```text
re-run all affected Jxx
```

---

# 96. PR-10

Voice:

Required:

```text
event adapter
command mapping
GUI action reuse
unsupported command
recognition failure
GUI fallback
```

Frontend does not own
STT 90% accuracy measurement.

---

# 97. PR-11

Release:

Required:

```text
L0-L7 all
J01-J10
all canonical widths
Chromium/WebKit/Firefox release matrix
axe
manual keyboard
200% zoom
reduced motion
visual regression
network/failure matrix
contract audit
production mock audit
```

---

# 98. CI Stages

권장 frontend CI:

```text
quality
unit-component
build
e2e-smoke
```

후속:

```text
visual
accessibility
contract-integration
```

를 scope에 따라 추가.

---

# 99. CI — Quality Job

Commands:

```bash
npm ci
npm run typecheck
npm run lint
npm run format
```

FAIL이면 merge 금지.

---

# 100. CI — Unit / Component Job

```bash
npm run test
```

Coverage percentage를
초기부터 절대 숫자 KPI로 만들지 않는다.

중요:

```text
critical behavior branches
state transitions
recovery
```

가 실제 테스트되는지가 우선.

---

# 101. CI — Build Job

```bash
npm run build
```

Production env에서:

```text
Mock auto-enable 없음
secret 없음
```

확인.

---

# 102. CI — E2E Smoke

PR:

```text
Chromium
critical impacted journey
```

Main/Release:

```text
broader browser matrix
```

테스트 실패 artifact:

```text
trace
screenshot
video where useful
```

보관.

---

# 103. CI Visual Job

Playwright screenshot comparison.

PR에서 visual scope 파일 변경 시
필요한 snapshot diff를 검토.

Snapshot update:

```text
explicit
reviewed
```

이어야 한다.

---

# 104. CI Accessibility Job

PR-03 이후:

```text
@axe-core/playwright
```

로 주요 Page 검사.

Fail:

```text
critical
serious
```

Release blocker.

Manual requirement는 CI로 대체되지 않는다.

---

# 105. Contract Integration Job

IMP-6 이후,
Backend test environment가 안정되면 별도 job 고려.

원칙:

```text
Frontend 기본 CI가 backend temporary outage 때문에 항상 fail하지 않게 분리
```

Live contract check를:

```text
scheduled
manual
release
```

job으로 둘 수 있다.

---

# 106. PR Evidence Format

기존 PR template를 사용.

추가 evidence는 body 또는 comment에:

```text
Tests:
- npm run verify
- npm run test:e2e -- ...

Viewports:
- 390
- 768
- 1280

A11y:
- keyboard
- axe
- 200% zoom if applicable

States:
- loading
- success
- ...
```

형태로 남긴다.

---

# 107. Screenshot Evidence

모든 PR에 무조건 수십 장을 붙이지 않는다.

시각 변경 PR:

```text
Desktop representative
Mobile representative
important state
```

정도.

Critical overlay/responsive 변경이면
Before/After 또는 diff artifact 권장.

---

# 108. Manual QA Evidence

수동 QA는:

```text
"확인함"
```

만 쓰지 않는다.

예:

```text
Keyboard-only J09:
PASS
Chrome/macOS
Tour Detail → Review
No pointer used
Focus remained visible
```

처럼 조건과 결과를 기록.

---

# 109. Test Failure Triage

Fail 시:

```text
Product defect
Test defect
Fixture defect
Environment flake
Contract drift
```

중 하나로 분류한다.

실패 테스트를 삭제해 green으로 만들지 않는다.

---

# 110. Flaky Test Policy

한 번 실패 후 retry해서 통과하는 테스트를
정상이라고 보지 않는다.

Flake 발견:

```text
owner
reproduction
root cause
temporary quarantine only if necessary
```

필수.

E2E global retry를 과도하게 올려
flake를 숨기지 않는다.

---

# 111. E2E Retry

CI에서는
환경성 flake 진단을 위해 제한된 retry는 가능.

하지만:

```text
retry PASS
```

가 반복되면 defect.

Critical J01~J10은 Release 전에
clean run PASS 필요.

---

# 112. Test Isolation

각 테스트:

```text
independent storage
independent query cache
known mock scenario
known route
```

를 가져야 한다.

이전 테스트의:

```text
sessionStorage
auth state
MSW override
```

에 의존 금지.

---

# 113. Storage Cleanup

Test setup에서:

```text
sessionStorage
localStorage if ever used
```

를 명시적으로 초기화.

단 실제 refresh persistence 테스트에서는
의도적으로 유지.

---

# 114. Auth Privacy QA

검사:

```text
password/credential sessionStorage 없음
localStorage 없음
console 없음
URL/query 없음
ReturnContext 없음
Draft 없음
```

Network inspector에서
approved transport 외 노출 없는지 확인.

---

# 115. Private Cache QA

Logout/unauthenticated transition 후:

```text
Travel History
Reservation Detail
customer-specific cache
```

가 clear되는지 확인.

Public:

```text
TourProduct
```

cache는 유지 가능.

---

# 116. Production Mock Audit

Release build에서 검색/실행:

```text
VITE_ENABLE_MOCKS false/default
Mock Service Worker not started
dev scenario UI absent
fixture data not presented as real
```

S0 후보:

```text
production에서 Mock Reservation success
```

---

# 117. Contract Safety Audit

Search:

```text
/api/v1/
participantCount
coupleCount
price
discount
jwt
refresh
logout
status
page=
cursor
```

목적:

```text
approved contract인지
fixture인지
추측인지
```

검토.

---

# 118. Architecture QA

Search:

```text
pages → raw fetch
shared → feature
feature private deep imports
integration → visual component
raw DTO in JSX
mocks imported by production feature
```

위반:

```text
merge blocker
```

---

# 119. Comment Quality QA

CP1 기준으로:

```text
WHY
CONTRACT
INVARIANT
LIFECYCLE
EDGE CASE
ACCESSIBILITY
```

중 필요한 설명이 있는지 확인.

금지:

```text
코드 한 줄을 그대로 읽는 comment spam
stale contract comment
```

---

# 120. Screen-State Coverage

각 Screen PR에
해당되는 상태를 체크한다.

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
NotFound
```

Happy path만 있으면
Acceptance 실패.

---
# 121. Mutation-State Coverage

Mutation:

```text
Idle
Submitting
Success
Failure
```

상황에 따라:

```text
Uncertain
```

추가.

Generic automatic Retrying은
Reservation/Auth에서 금지.

---

# 122. Error Copy QA

Backend raw:

```text
stack
SQL
exception
technical message
```

노출 금지.

UI copy는:

```text
무슨 일이 발생했는지
사용자가 무엇을 할 수 있는지
```

를 차분하게 전달.

---

# 123. Route QA

모든 route:

```text
direct URL
navigation
browser Back
browser Forward
refresh
Not Found where applicable
```

검증.

---

# 124. Deep Link QA

특히:

```text
/tours/:tourId
/reservation/:reservationId/success
/reservations/:reservationId
/login
/signup
/my-trips
```

direct entry를 검증.

---

# 125. Route Focus QA

Page navigation 후:

```text
logical focus target
```

을 확인.

모든 route에서 무조건 H1 programmatic focus가 최선이라고
미리 일반화하지 않는다.

PR-02에서 정한 route focus policy에 맞춰 검증.

---

# 126. Browser Back Safety

중요:

```text
Success → Back
```

시 duplicate submit 금지.

```text
Review → Back
```

시 Draft 보존.

---

# 127. Empty State QA

Empty는 Error가 아니다.

예:

```text
Travel History empty
Schedule none
```

각 기능 의미에 맞는 CTA 제공.

---

# 128. Loading QA

금지:

```text
generic full-page spinner
```

검증:

```text
layout-preserving Skeleton
slow request
cache hit
partial load
```

---

# 129. Refresh QA

Success + Refresh:

```text
content stays
refresh indicator
```

Refresh fail:

```text
content stays
local warning/retry
```

---

# 130. Offline QA

Cached data:

```text
keep
mark stale/offline
```

No cache:

```text
offline error state
```

Mutation:

```text
blocked
no queue
```

---

# 131. Image Failure QA

각 핵심 photography area:

```text
Hero
Tour card
History card if image exists
```

에 failure를 주입.

PASS:

```text
designed fallback
no broken icon
task remains usable
```

---

# 132. Long Content QA

입력/텍스트:

```text
long product name
long address
long error copy
large history list
```

으로 wrapping/overflow 확인.

---

# 133. Localization-Like Stress

다국어 지원 요구는 없지만
Korean/Latin 혼합 때문에:

```text
긴 한글
영문
숫자
가격
날짜
```

조합을 테스트한다.

---

# 134. Theme Catalog QA

Exactly:

```text
HONEYMOON_ROMANCE
PARENTS_HEALING
GOLF_CHALLENGE
OUTDOOR_TREKKING
```

Unknown Theme이 API에서 오면
silent default 금지.

---

# 135. TourStyle QA

Exactly:

```text
CLASSIC
GRAND
PREMIUM
```

Rules:

```text
Honeymoon no CLASSIC
Parents no CLASSIC
Golf all
Trekking all
```

Frontend mirror + Backend authority.

---

# 136. Travel History QA

Minimum:

```text
product
period
TourStyle
price
recent-first
```

Contract 없는:

```text
detail link
pagination
Upcoming/Past
```

검증 대상에 넣지 않는다.

---

# 137. Price QA

Mock phase:

```text
presentation only
```

Live:

```text
exact Backend value
currency representation per contract
no frontend recompute
```

Missing price:

```text
0으로 fabricate 금지
```

---

# 138. Loyalty QA

Contract 전:

```text
no fake discount
```

Contract 후:

```text
Backend-supplied eligibility/amount representation
```

만 검증.

---

# 139. SMS QA Frontend Boundary

Frontend:

```text
notification promise copy
```

만 검증.

SMS 실제 delivery는 Backend/System QA 영역.

Frontend가:

```text
발송 완료
```

를 표시한다면
공개 delivery state contract가 있어야 한다.

---

# 140. Voice QA Frontend Boundary

Frontend 검증:

```text
recognized event
→ same GUI action
unsupported
failure
GUI fallback
```

STT success rate 90%는
ai-console/System evaluation 영역.

---

# 141. Live Adapter Malformed DTO Matrix

각 live resource에:

```text
missing id
unknown enum
wrong primitive type
missing required nested data
invalid date representation
invalid price representation
```

등을 계약 기준으로 테스트.

Result:

```text
ContractMappingError
local safe error
no deep render crash
```

---

# 142. Adapter Golden Mapping

Critical Adapter는
expected Frontend Model fixture를 golden result처럼 검증.

예:

```text
TourProductDto
→ TourDetailModel
```

field mapping 변경 시
의도된 contract update인지 확인.

---

# 143. Mock / Real Parity

같은 semantic scenario:

```text
Mock source
Real DTO fixture source
```

결과 Frontend Model 의미가 같아야 한다.

UI가:

```text
if (isMock)
```

분기하는 구조 금지.

---

# 144. Test Coverage Philosophy

숫자 80%/90%를
현재 Shared requirement처럼 만들지 않는다.

대신 critical logic에는 branch coverage가 있어야 한다.

High-risk:

```text
Draft
Auth recovery
Reservation mutation
Error mapping
Adapter
Honeymoon validation
```

은 사실상 주요 branch 전부 테스트한다.

---

# 145. Risk-Based Testing

우선순위:

```text
1. Data integrity
2. Reservation duplicate/success truth
3. Auth/private data
4. Draft preservation
5. Contract mapping
6. Critical navigation
7. Responsive task completion
8. Accessibility
9. Visual polish
```

---

# 146. Regression Rule

Bug 수정 PR에는:

```text
재현 테스트
```

를 먼저 또는 함께 추가.

Regression test 없이
수동 수정만 하는 것을 피한다.

---

# 147. Severity Assignment Rule

Severity는:

```text
코드 크기
고치기 어려움
```

이 아니라:

```text
user impact
data integrity
security
task completion
recovery
```

로 결정한다.

---

# 148. S2 Acceptance Process

S2를 Release에 남길 경우:

```text
Issue ID
impact
affected Screen
workaround
reason for acceptance
owner
target fix
```

필수.

---

# 149. Release Candidate Run Order

권장:

```text
1. clean npm ci
2. L0
3. unit/component
4. adapter/feature integration
5. build
6. Chromium J01~J10
7. WebKit/Firefox matrix
8. axe
9. visual regression
10. manual keyboard/zoom/reduced-motion
11. contract/mock audit
12. severity review
```

---

# 150. Clean Environment Rule

Release 검증은:

```text
fresh install
fresh browser storage
production-like build
```

에서 수행.

개발 서버 hot state만으로 판정하지 않는다.

---

# 151. Manual Release Checklist

- [ ] Chromium
- [ ] Safari/WebKit
- [ ] Firefox
- [ ] 320
- [ ] 390
- [ ] 768
- [ ] 1024
- [ ] 1280
- [ ] 1440
- [ ] 1728+
- [ ] keyboard-only
- [ ] 200% zoom
- [ ] reduced motion
- [ ] offline/reconnect
- [ ] slow network
- [ ] image failure
- [ ] refresh during transaction

---

# 152. Release Evidence Package

최종 PR/Release note에:

```text
Commit SHA
Shared docs SHA
Backend SHA for live integration
npm verify result
E2E result
browser matrix
visual diff result
axe result
manual a11y result
known S2/S3
contract gates
```

기록.

---

# 153. PR Completion Report

각 Sub-checkpoint 완료 보고:

```text
1. What changed
2. Files changed
3. Automated tests run
4. E2E / journey
5. Responsive checked
6. Accessibility checked
7. States checked
8. Contract assumptions
9. Defects / remaining
10. Next checkpoint
```

CP5의 보고 형식을 QA evidence까지 확장한다.

---

# 154. Implementation Session Rule

한 세션에서 기능을 구현했다면
가능한 한 같은 세션에서:

```text
typecheck
unit/component
affected E2E
```

까지 수행한다.

“나중에 QA한다”를 기본으로 하지 않는다.

---

# 155. No Test-Later Rule

다음은 완료가 아니다.

```text
코드는 다 짰는데 테스트는 나중에
Responsive는 마지막에
Accessibility는 마지막에
Error state는 나중에
```

각 Sub-checkpoint가 해당 품질 축을 함께 끝낸다.

---

# 156. Test Comment Policy

테스트에도 CP1 주석 정책 적용.

특히 복잡한:

```text
401 recovery
409 conflict
ambiguous submit
race
storage migration
```

은 WHY/INVARIANT를 설명할 수 있다.

단 obvious assertion을 반복하는 주석은 쓰지 않는다.

---

# 157. QA Anti-Patterns

## QA-01

Happy path만 테스트.

## QA-02

Snapshot만 많고 behavior assertion 없음.

## QA-03

E2E가 모든 business branch를 대신함.

## QA-04

`data-testid`에 과도하게 의존.

## QA-05

테스트가 private state를 검증.

## QA-06

Network delay를 실제 `sleep()`로 기다림.

## QA-07

Flaky test를 retry로 숨김.

## QA-08

Visual snapshot을 검토 없이 update.

## QA-09

Axe PASS를 접근성 완료로 간주.

## QA-10

Mock PASS를 live integration PASS로 표시.

## QA-11

Backend raw message로 error branch 결정.

## QA-12

테스트를 위해 production API를 노출.

---

# 158. CP7 Decision Log

## CP7-D01

QA는 L0~L7의 다층 구조를 사용한다.

## CP7-D02

Frontend Release Gate는 Shared minimum보다 엄격한 J01~J10 10/10이다.

## CP7-D03

S0=0, S1=0은 절대 Release Gate다.

## CP7-D04

Visual Regression은 Playwright screenshot comparison을 사용한다.

## CP7-D05

PR-03부터 `@axe-core/playwright`를 사용한다.

## CP7-D06

Automated accessibility는 manual keyboard/focus/zoom 검증을 대체하지 않는다.

## CP7-D07

Coverage 숫자보다 critical behavior branch를 우선한다.

## CP7-D08

각 PR은 해당 Screen의 State/Responsive/A11y를 함께 끝낸다.

## CP7-D09

Mock PASS와 Live PASS를 상태상 명확히 분리한다.

## CP7-D10

Honeymoon QA는 v0.1.2 rule을 canonical로 사용한다.

## CP7-D11

Critical E2E J01~J10 exact scenario를 Release Gate로 고정한다.

## CP7-D12

Bug fix에는 regression test를 원칙으로 한다.

## CP7-D13

Visual baseline update는 explicit review가 필요하다.

## CP7-D14

Critical/serious automated a11y violation은 merge/release blocker다.

## CP7-D15

Frontend test failure는 Product/Test/Fixture/Environment/Contract drift로 분류한다.

---

# 159. CP7 Completion Checklist

## QA Architecture

- [x] Static gate
- [x] Unit
- [x] Component
- [x] Feature Integration
- [x] Adapter Contract
- [x] E2E
- [x] Visual
- [x] Accessibility

## Severity

- [x] S0
- [x] S1
- [x] S2
- [x] S3
- [x] S4
- [x] release policy

## Environments

- [x] browser matrix
- [x] viewport matrix
- [x] input matrix
- [x] latency matrix
- [x] failure matrix

## Shared UI

- [x] Button
- [x] TextLink
- [x] TextField
- [x] OptionCard
- [x] Dialog
- [x] BottomSheet
- [x] Skeleton
- [x] ImageFrame

## State/Data

- [x] Draft reducer
- [x] Draft persistence
- [x] Honeymoon
- [x] Query retry
- [x] Freshness
- [x] Race
- [x] Partial failure
- [x] Offline
- [x] Refresh

## Screens

- [x] S01
- [x] S02
- [x] S03
- [x] S04
- [x] S05
- [x] S06
- [x] S07
- [x] S08
- [x] S09
- [x] S10
- [x] S11

## Critical Journeys

- [x] J01 exact
- [x] J02 exact
- [x] J03 exact
- [x] J04 exact
- [x] J05 exact
- [x] J06 exact
- [x] J07 exact
- [x] J08 exact
- [x] J09 exact
- [x] J10 exact

## PR Gates

- [x] PR-01
- [x] PR-02
- [x] PR-03
- [x] PR-04
- [x] PR-05
- [x] PR-06
- [x] PR-07
- [x] PR-08
- [x] PR-09
- [x] PR-10
- [x] PR-11

## CI / Release

- [x] quality job
- [x] unit/component job
- [x] build
- [x] E2E smoke
- [x] visual
- [x] accessibility
- [x] contract integration
- [x] evidence package
- [x] clean environment
- [x] release order

---

# 160. CP7 Exit Status

```text
CP7 — QA & TEST PLAN
STATUS: COMPLETE
```

결과:

```text
QA layer architecture            LOCKED
Severity model                   LOCKED
PR test matrix                   LOCKED
Screen acceptance                LOCKED
J01~J10                          LOCKED
Responsive matrix                LOCKED
A11y automation/manual split     LOCKED
Visual regression strategy       LOCKED
Failure simulation               LOCKED
CI strategy                      LOCKED
Release gate                     LOCKED
Honeymoon v0.1.2 QA              LOCKED
```

---

# 161. Handoff to CP8

다음 Checkpoint:

```text
CP8 — SECURITY, PERFORMANCE & RELEASE READINESS
```

CP8에서 별도로 잠글 항목:

```text
credential/token privacy
storage rules
XSS / unsafe HTML policy
environment / secret handling
CORS/auth transport implications
logging/redaction
private cache
dependency/security audit

performance budget
image strategy
bundle/load strategy
route code splitting
query/network efficiency
motion performance

production environment
mock-off invariant
build/release configuration
observability/error reporting boundary
release rollback/readiness
```

목표:

> **기능과 테스트가 맞는 것에서 끝나지 않고,
> production/demo 환경에 안전하게 올릴 수 있는 기준까지 확정한다.**