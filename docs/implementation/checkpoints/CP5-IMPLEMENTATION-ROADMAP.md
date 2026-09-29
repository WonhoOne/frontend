# Mister World Frontend — CP5 Implementation Roadmap

> Status: **COMPLETE**  
> Checkpoint: **CP5 — Implementation Roadmap / Execution Order**  
> Date: **2026-09-29**  
> Target repository: `WonhoOne/frontend`  
> Shared baseline: `WonhoOne/docs/main` **v0.1.2**  
> Depends on:
> - `CP0-IMPLEMENTATION-BASELINE.md`
> - `CP1-CODE-QUALITY-STANDARDS.md`
> - `CP2-FRONTEND-ARCHITECTURE-PLAN.md`
> - `CP3-STATE-DATA-ARCHITECTURE.md`
> - `CP4-FOUNDATION-IMPLEMENTATION-PLAN.md`
> - `docs/planning/07-SCREEN-SPECS.md`
> - `docs/planning/screens/01-home.md` ~ `11-my-trips.md`
> - `docs/planning/11-QA-ACCEPTANCE.md`
> - `docs/planning/12-IMPLEMENTATION-HANDOFF.md`
>
> Next checkpoint: **CP6 — Contract & Live Integration Plan**

---

# 1. Purpose

CP5의 목적은 Mister World Frontend 전체 구현을
**실제 실행 가능한 순서와 작업 크기**로 분해하는 것이다.

이 문서 이후 구현자는 다음처럼 짧은 지시를 받아도
작업 범위와 완료조건을 해석할 수 있어야 한다.

```text
IMP-2C 진행
IMP-3B 진행
IMP-5D 진행
```

각 Sub-checkpoint는 다음을 가진다.

```text
목표
시작 조건
구현 범위
제외 범위
관련 화면/Feature
Contract Gate
테스트
완료 조건
권장 PR 위치
```

---

# 2. Global Implementation Sequence

전체 구현 순서는 다음으로 고정한다.

```text
IMP-0  Foundation
IMP-1  App Runtime
IMP-2  Discovery
IMP-3  Transaction Core
IMP-4  Reservation
IMP-5  Account & Travel History
IMP-6  Live Backend Integration
IMP-7  Voice / Cross-Screen / Release
```

핵심 dependency:

```text
Foundation
→ Runtime
→ Discovery
→ ReservationDraft
→ Configure
→ Review
→ Reservation
→ Auth recovery
→ History
→ Live API
→ Voice
→ Final QA
```

---

# 3. Why This Order

## Foundation first

공통 Primitive, Router, Query, Test Harness 없이
Screen부터 만들면 이후 화면마다
loading/focus/dialog/token 구조를 다시 뜯게 된다.

## Discovery before transaction

Home/Tours/Tour Detail을 먼저 구현하면
브랜드/레이아웃/카드/이미지/모션 언어를
실제 화면에서 먼저 검증할 수 있다.

## ReservationDraft before Configure

Configure는 단일 화면이 아니라:

```text
Tour Detail
→ Configure
→ Review
→ Back
→ Configure
→ Auth interruption
→ Review restore
```

를 버텨야 한다.

따라서 Draft가 먼저다.

## Reservation before Auth integration

Review/Submit 구조와 Draft가 먼저 있어야
401 이후 어떤 상태를 보존하고 어디로 돌아갈지 명확하다.

## Real Backend integration later

현재 DTO/Auth/Price/History detail 등의 계약이
여전히 일부 열려 있다.

Mock-backed UI를 먼저 안정화하고
Adapter boundary 뒤에서 실 API를 붙인다.

---

# 4. PR Mapping

기본 PR sequence:

```text
PR-01  Foundation
PR-02  App Runtime / State Harness / Motion
PR-03  Home + Tours
PR-04  Tour Detail
PR-05  ReservationDraft + Configure
PR-06  Review + Success + Reservation Detail
PR-07  Login + Signup + ReturnContext
PR-08  Previous Trips + My Trips
PR-09  Live Backend Adapters
PR-10  Voice Bridge
PR-11  Cross-Screen Polish / Regression / Release QA
```

필요하면 PR을 더 잘게 나눌 수 있다.

금지:

```text
한 PR에 Foundation + 여러 Product Screen + Live API를 모두 포함
```

---

# 5. IMP-0 — Foundation

목표:

> 모든 이후 화면이 올라갈 기술/디자인/테스트 기반을 만든다.

대응:

```text
PR-01
```

세부 작업은 CP4가 SSOT다.

---

# 6. IMP-0A — Toolchain

## Start

```text
latest main
CP0~CP4 reviewed
```

## Scope

```text
Node/npm
Vite
React
TypeScript
ESLint
Prettier
Vitest
RTL
Playwright
MSW
package-lock
alias
scripts
```

## Exit

```text
npm ci
npm run typecheck
npm run lint
npm run format
```

PASS.

---

# 7. IMP-0B — Bootstrap

## Scope

```text
main.tsx
App
AppProviders
QueryClient
AppErrorBoundary
```

## Exit

```text
app boots
production build possible
no feature assumption
```

---

# 8. IMP-0C — Design & Motion Tokens

## Scope

```text
color
type
spacing
container
radius
shadow
z-index
focus
motion
reduced motion
```

## Exit

```text
tokens centralized
no random values in Foundation primitives
```

---

# 9. IMP-0D — Layout Primitives

## Scope

```text
PageContainer
Grid
Skip Link baseline
main landmark
```

## Exit

```text
320~1440+ responsive gutters
no overflow
```

---

# 10. IMP-0E — Controls

## Scope

```text
Button
TextLink
TextField
OptionCard
```

## Exit

```text
keyboard
focus
disabled
error/selected state
touch target
```

---

# 11. IMP-0F — Overlays

## Scope

```text
Dialog
BottomSheet
```

## Exit

```text
focus trap
focus return
Escape
explicit close
reduced motion
safe area
```

---

# 12. IMP-0G — Loading / Image

## Scope

```text
Skeleton
ImageFrame
useReducedMotion
```

## Exit

```text
static skeleton under reduced motion
image failure fallback
```

---

# 13. IMP-0H — Router / App Chrome

## Scope

```text
all route placeholders
Not Found
GlobalHeader
TransactionHeader
```

## Exit

```text
all routes mount
dynamic params mount
unknown route recovers
```

---

# 14. IMP-0I — Mock/Test Harness

## Scope

```text
MSW
Vitest setup
RTL setup
Playwright setup
foundation smoke
```

## Exit

```text
npm run verify
npm run test:e2e
```

PASS.

---

# 15. IMP-0 Exit Gate

IMP-1로 넘어가기 전:

- [ ] Foundation DoD 100%
- [ ] App boots
- [ ] all route placeholders mount
- [ ] primitives tested
- [ ] Dialog/Sheet keyboard usable
- [ ] reduced-motion branch verified
- [ ] mock/test harness verified
- [ ] no Contract assumption

---

# 16. IMP-1 — App Runtime

목표:

> Product Screen을 만들기 전에 App 전체의 공통 실행 흐름을 완성한다.

대응:

```text
PR-02
```

주요 대상:

```text
Router completion
App shell
route focus
state scenario harness
motion runtime
development scenario switcher
error presentation baseline
```

---

# 17. IMP-1A — Route Runtime

## Scope

```text
route helper/path builder
route title/H1 convention
page shell
route focus strategy
scroll restoration policy
```

## Contract Gate

Auth protected route는
H-04 closure 전 강제 구현하지 않는다.

## Exit

```text
navigation/back/direct URL
keyboard focus
main landmark
```

정상.

---

# 18. IMP-1B — App Shell

## Scope

```text
GlobalHeader runtime
TransactionHeader runtime
Footer if planned
page chrome selection
```

## Exclude

```text
real auth identity
real current reservation state
```

## Exit

```text
public vs transaction route shell separation
responsive header
```

---

# 19. IMP-1C — Mock Scenario Harness

## Scope

Dev-only scenario switching:

```text
happy
slow
empty
network-error
500
401
409
422
partial-failure
image-failure
offline
stale-refresh
reservation-success
ambiguous-response
history-empty
history-populated
```

## Goal

Screen 구현자가 network failure를
매번 임시 코드로 만들지 않게 한다.

## Exit

```text
scenario 선택 가능
production build에서 노출 안 됨
```

---

# 20. IMP-1D — State Presentation Baseline

## Scope

공통 pattern:

```text
Loading shell
Section Error
Retry
Empty
Offline banner
Stale/refresh indicator
```

주의:

모든 Screen을 Generic State Component 하나로 만들지 않는다.

Shared는 mechanic만,
Feature는 copy/domain state를 소유한다.

---

# 21. IMP-1E — Motion Runtime

## Scope

```text
standard page entry
forward/back restrained transition
dialog/sheet motion
section reveal helper
image reveal helper
```

## Exclude

```text
Shared Hero final production transition
Recruitment count animation
Voice motion
```

## Exit

```text
reduced motion
latest intent
interruptibility
```

---

# 22. IMP-1 Exit Gate

- [ ] route runtime stable
- [ ] app chrome stable
- [ ] mock scenario harness usable
- [ ] common state presentation usable
- [ ] motion runtime usable
- [ ] no Product API assumption

---

# 23. IMP-2 — Discovery

목표:

> 고객이 Theme/TourProduct를 발견하고 Tour Detail까지 도달하는 경험을 완성한다.

대응:

```text
PR-03 Home + Tours
PR-04 Tour Detail
```

화면:

```text
S01 Home
S02 Tours
S03 Tour Detail
```

---

# 24. IMP-2A — Discovery View Models & Fixtures

## Scope

Frontend-only:

```text
Theme discovery presentation
TourCardModel
TourProduct summary fixtures
multiple products per Theme fixture
image/fallback fixture
```

## Contract Safety

금지:

```text
Theme = tourId
Theme 1:1 TourProduct hardcode
Backend DTO naming
```

## Exit

Home/Tours가
Backend field를 몰라도 렌더 가능.

---

# 25. IMP-2B — Home Structure

## Scope

S01 기준:

```text
HomeHero
ThemeCollectionIntro
ThemeEditorialGrid
CustomizationPromise
footer
```

## State

```text
initial
image loading/failure
partial content
```

Home이 static-heavy면
불필요한 query loading을 만들지 않는다.

---

# 26. IMP-2C — Home Responsive / A11y / Motion

## Scope

```text
320/390/768/1280/1440
mobile 1-column themes
editorial asymmetry
hero crop
keyboard
heading
alt
reduced motion
```

## Exit

S01 Acceptance Criteria 충족.

---

# 27. IMP-2D — Tours Structure

## Scope

S02 기준:

```text
Tours intro
Tour collection
Tour cards
Style explainer
Customization note
```

## Exclude

```text
search
filter
sort
price
live schedule
```

계약/기획에 없음.

---

# 28. IMP-2E — Tours States / Responsive

## Scope

```text
loading
partial image failure
fatal data mismatch
responsive collection
keyboard links
```

## Exit

S02 Acceptance Criteria 충족.

---

# 29. IMP-2F — Discovery Navigation

## Scope

```text
Home → Tours
Home → selected TourProduct
Tours → selected TourProduct
```

`tourId`는 실제 View Model identity.

Theme 값 자체를 route ID로 쓰지 않는다.

---

# 30. PR-03 Exit Gate

- [ ] S01 Ready
- [ ] S02 Ready
- [ ] multiple TourProduct per Theme structure possible
- [ ] no OTA search/filter
- [ ] image failure handled
- [ ] mobile not desktop shrink
- [ ] contract safety PASS

---

# 31. IMP-2G — Tour Detail Core

## Scope

S03:

```text
TourHero
Story
Included Experience
Style section
Schedule section
Recruitment section
Continue CTA
```

Mock-backed.

---

# 32. IMP-2H — Style Selection

## Scope

Theme restrictions:

```text
Honeymoon → GRAND/PREMIUM
Parents   → GRAND/PREMIUM
Golf      → CLASSIC/GRAND/PREMIUM
Trekking  → CLASSIC/GRAND/PREMIUM
```

UI-level mirror.

Backend remains final authority.

---

# 33. IMP-2I — Schedule Selection

## Scope

```text
ScheduleChoiceModel
loading
empty
partial error
retry
selected
unavailable
refreshing
```

Tour core와 Schedule state 분리.

---

# 34. IMP-2J — Recruitment Presentation

## General

```text
3 participants
```

## Honeymoon

v0.1.2:

```text
2 couples/teams
1 couple/team = 2 participants
```

유효 participantCount 기반 derived presentation 가능.

단 final confirmed truth는 Backend.

---

# 35. IMP-2K — Tour Detail Responsive / Motion / A11y

## Scope

```text
Shared Hero enhancement
style/schedule keyboard
mobile stacking
CTA position
partial skeleton
reduced motion
```

## Exit

S03 Acceptance Criteria 충족.

---

# 36. PR-04 Exit Gate

- [ ] Tour Detail fully mock-backed
- [ ] Style restrictions correct
- [ ] Schedule partial states correct
- [ ] Honeymoon v0.1.2 wording correct
- [ ] no live DTO assumption
- [ ] Configure CTA gated by required selections
- [ ] S03 PASS

---

# 37. IMP-3 — Transaction Core

목표:

> 사용자의 선택이 Configure/Review/Auth interruption을 견디는 transaction architecture를 만든다.

대응:

```text
PR-05
```

화면:

```text
S04 Configure
```

중심:

```text
ReservationDraft
```

---

# 38. IMP-3A — ReservationDraft Reducer

## Scope

CP3 기준:

```text
schemaVersion
tourProductId
tourScheduleId
tourStyle
participantCount
configuration selections
updatedAt
```

Actions:

```text
start
select style
select schedule
set participant count
select hotel
select transport
select meal
set extras
restore
discard
clear after success
```

## Exit

Reducer unit tests PASS.

---

# 39. IMP-3B — Draft Persistence

## Scope

```text
sessionStorage
serialization
rehydration
corrupt payload
schema version
migration hook
explicit clear
```

## Exit

```text
refresh restores
401/409/422 do not clear
user discard clears
```

tests PASS.

---

# 40. IMP-3C — Configure View Models / Fixtures

## Scope

Mock-backed:

```text
OptionGroupModel
ConfigurationOptionModel
PriceDisplayModel
TripSummaryModel
```

Hotel/Transport/Meal/Extras.

## Contract Gate

실제 option ID/catalog/price formula는
production truth로 만들지 않는다.

---

# 41. IMP-3D — Configure Desktop

## Scope

S04 Desktop:
```text
left option controls
right sticky summary
section order
required groups
Review CTA
```

## Exit

1024+ layout stable.

---

# 42. IMP-3E — Configure Mobile

## Scope

```text
single-column options
persistent bottom summary/action
BottomSheet summary
safe area
software keyboard resilience
```

## Exit

320/390/430에서 핵심 task 가능.

---

# 43. IMP-3F — Participant Count UX Placeholder Boundary

v0.1.2에서 validity는 확정:

```text
General >=1
Honeymoon >=2 and even
```

하지만 미정:

```text
입력 위치
default
maximum
capacity
price effect
```

따라서 실제 participant selector는
Contract/팀 결정 전 production UX로 확정하지 않는다.

가능:

```text
View Model slot
Draft field null
test-only/fixture scenario
```

---

# 44. IMP-3G — Configure State Matrix

각 Option Group:

```text
Loading
Ready
Selected
Disabled
Invalid
Refreshing
Error
```

다음 recovery:

```text
local retry
affected option only invalid
other selections preserved
```

---

# 45. IMP-3H — Price Presentation

## Scope

Mock presentation:

```text
known
loading
recalculating
error
```

원칙:

```text
previous price 유지
0원 flash 금지
frontend calculation 금지
```

---

# 46. IMP-3I — Configure Navigation

```text
Tour Detail → Configure
Configure → Review
Review → Configure
Configure → Tour Detail
```

Draft 유지 규칙 검증.

---

# 47. IMP-3J — Configure QA

검증:

```text
320
390
768
1024
1280
keyboard
reduced motion
slow
500
partial failure
option conflict
image failure
refresh
```

---

# 48. PR-05 Exit Gate

- [ ] ReservationDraft reducer complete
- [ ] sessionStorage restore complete
- [ ] S04 mock-backed complete
- [ ] Desktop sticky summary
- [ ] Mobile summary sheet
- [ ] partial state recovery
- [ ] price presentation only
- [ ] participant default not invented
- [ ] no real option DTO invented
- [ ] S04 PASS

---

# 49. IMP-4 — Reservation

목표:

> Review부터 Reservation Success/Detail까지의 transaction experience를 완성한다.

대응:

```text
PR-06
```

화면:

```text
S05 Review
S06 Success
S07 Reservation Detail
```

---

# 50. IMP-4A — Review Composition

## Scope

```text
selected TourProduct
Style
Schedule
Configuration
participantCount when available
Price presentation
Applicant summary shell
```

Review는 새 선택 화면이 아니다.

---

# 51. IMP-4B — Change Navigation

각 Change:

```text
Style/Schedule → Tour Detail
Options → Configure
```

Draft 유지.

Browser Back도 같은 invariant.

---

# 52. IMP-4C — Review Validation States

Mock scenarios:

```text
valid
validation loading
option invalid
schedule invalid
price changed
missing draft
```

현재 Backend API가 없으면
Mock View Model로만 구현.

---

# 53. IMP-4D — Reservation Mutation Harness

아직 실 API가 아닌
mock DataSource 기반 mutation architecture.

상태:

```text
Idle
Submitting
Success
Failure
Uncertain
```

규칙:

```text
automatic retry 0
duplicate submit block
```

---

# 54. IMP-4E — 401 Recovery Surface

Mock 401:

```text
Draft 유지
ReturnContext 생성
Login surface로 이동
```

실제 Auth mechanism은 IMP-5/IMP-6에서 연결.

자동 resubmit 금지.

---

# 55. IMP-4F — 409 Recovery

```text
latest truth
changed field highlight
explicit reconfirm
manual resubmit
```

자동 옵션 대체/가격 동의 금지.

---

# 56. IMP-4G — 422 Recovery

```text
normalized validation
section/field inline error
Draft 유지
```

Toast-only 금지.

---

# 57. IMP-4H — Ambiguous Submit

Mock:

```text
request sent
response lost
```

UI:

```text
결과 확인 불가
Draft 유지
blind retry 없음
```

API recovery protocol 전까지
“다시 신청” 버튼을 성급히 제공하지 않는다.

---

# 58. IMP-4I — Reservation Success

S06:

```text
confirmation identity
current recruitment presentation
navigation to reservation detail/tours
```

Server-driven recovery 구조를 사용.

Mock DataSource에서 reservationId 기반 lookup 지원.

---

# 59. IMP-4J — Reservation Detail

S07:

```text
current application
status presentation
configuration summary
recruitment section
price if available
```

금지:

```text
cancel
refund
payment
invented status enum
```

---

# 60. IMP-4K — Reservation QA

Critical:

```text
J02 Reservation Success
J04 Option Conflict
J05 Schedule Conflict
J07 Offline Recovery
J08 Refresh During Transaction
```

Mock-backed 단계에서 가능한 범위까지 검증.

---

# 61. PR-06 Exit Gate

- [ ] S05 PASS
- [ ] S06 PASS
- [ ] S07 PASS
- [ ] duplicate submit prevented
- [ ] 401/409/422 mock recovery
- [ ] ambiguous response safe
- [ ] Draft clear only success
- [ ] no cancellation/payment
- [ ] no invented Reservation status

---

# 62. IMP-5 — Account & Travel History

목표:

> 인증 UI, transaction 복귀, post-login history 경험을 완성한다.

대응:

```text
PR-07 Login + Signup
PR-08 Previous Trips + My Trips
```

화면:

```text
S08 Login
S09 Signup
S10 Previous Trips Popup
S11 My Trips
```

---

# 63. IMP-5A — Auth State Shell

## Scope

```text
checking
authenticated
unauthenticated
```

Mechanism은 mock.

금지:

```text
JWT assumption
session-cookie assumption
refresh token
localStorage token
```

---

# 64. IMP-5B — Login UI

S08:

```text
desktop modal-route
direct /login fallback
mobile full-screen/sheet
loading/error/success
```

Credential fields는
Approved contract 전 production truth로 확정하지 않는다.

Mock form schema는 명확히 fixture로 구분.

---

# 65. IMP-5C — Signup UI

S09:

확정 profile fields:

```text
name
address
contact
```

추가 credential/password rule은
Contract Gate.

Employee Signup UI는 frontend scope 밖.

---

# 66. IMP-5D — ReturnContext

구현:

```text
internal returnTo
intent
draftSchemaVersion
sessionStorage fallback
validation
```

Open redirect 방지.

---

# 67. IMP-5E — Transaction Login Recovery

Flow:

```text
Review Submit
→ 401
→ Login
→ Auth success
→ Review restore
→ fresh validation
→ manual submit
```

Popup보다 transaction 복귀 우선.

---

# 68. PR-07 Exit Gate

- [ ] S08 PASS
- [ ] S09 PASS
- [ ] ReturnContext works
- [ ] Draft survives auth interruption
- [ ] no auto submit
- [ ] no token storage assumption
- [ ] Signup confirmed fields correct

---

# 69. IMP-5F — Travel History Model

Frontend:

```text
TravelHistoryItemModel
```

최소 meaning:

```text
product
period
TourStyle
price
```

DTO field names는 아직 추측하지 않는다.

---

# 70. IMP-5G — Previous Trips Popup

S10:

```text
post-login trigger
desktop dialog
mobile near-full sheet
loading
empty
error
retry
close
view all
```

History failure가 Login success를 무효화하지 않는다.

---

# 71. IMP-5H — My Trips

S11:

```text
recent-first archive
loading
empty
error
refreshing
offline cached state
```

금지:

```text
Upcoming tab
Past tab
history detail route
pagination params
```

계약 없음.

---

# 72. IMP-5I — Shared Travel History Cache

S10/S11 동일 query/cache.

Mock DataSource에서도
한 source를 공유한다.

---

# 73. IMP-5J — Account / History QA

Critical:

```text
J03 Auth Interruption
J06 Previous Trips
J09 Keyboard-only
J10 320px Mobile
```

---

# 74. PR-08 Exit Gate

- [ ] S10 PASS
- [ ] S11 PASS
- [ ] same history model/cache
- [ ] recent-first presentation
- [ ] Login success independent from history failure
- [ ] no fake history detail
- [ ] no pagination invention

---

# 75. IMP-6 — Live Backend Integration

목표:

> Mock-backed UI를 유지한 채 Adapter/DataSource 뒤에서 실제 Backend로 전환한다.

대응:

```text
PR-09
```

주의:

이 단계는 CP6 Contract Integration Plan이
상세 Gate를 정의한 뒤 실행한다.

---

# 76. IMP-6A — Contract Snapshot Audit

실제 연동 직전:

```text
latest docs/main
Backend implementation
API spec
DTO
error shape
Auth mechanism
```

재확인.

Frontend planning 문서가 낡아 있으면
Shared SSOT를 우선한다.

---

# 77. IMP-6B — HTTP Client

구현:

```text
base URL
headers
credentials
AbortSignal
response decode
network error normalize
```

Auth contract 없이는 token attachment를 만들지 않는다.

---

# 78. IMP-6C — TourProduct Adapters

```text
GET /api/v1/tours
GET /api/v1/tours/{tourId}
```

DTO → existing View Model.

Goal:

```text
Home/Tours/Tour Detail UI 변경 최소
```

---

# 79. IMP-6D — Schedule Adapters

```text
GET /api/v1/tour-schedules
GET /api/v1/tour-schedules/{scheduleId}
```

availability/recruitment/status mapping.

v0.1.2 Honeymoon semantics 반영.

---

# 80. IMP-6E — Configuration / Price Integration

Approved API가 생긴 항목만 연결.

없으면:

```text
Mock-backed/demo-only 부분 명확히 유지
```

Endpoint를 만들지 않는다.

---

# 81. IMP-6F — Reservation Integration

```text
POST /api/v1/reservations
GET /api/v1/reservations/{reservationId}
```

필수:

```text
request mapper
response adapter
error mapping
409
422
401
ambiguous network outcome
```

---

# 82. IMP-6G — Auth Integration

```text
POST /api/v1/auth/signup
POST /api/v1/auth/login
```

Contract에 따라:

```text
credential
session/token
persistence
protected route
logout if approved
```

구현.

미승인 endpoint 추가 금지.

---

# 83. IMP-6H — Travel History Integration

```text
GET /api/v1/customers/me/travel-history
```

DTO → `TravelHistoryItemModel`.

recent-first canonical field/ordering은
Approved contract 기준.

---

# 84. IMP-6I — Mock / Real Parity Audit

각 Feature:

```text
Mock Source
Real Source
```

가 동일 View Model contract를 만족하는지 확인.

Mock-only assumption이 UI에 새어 있으면 수정.

---

# 85. IMP-6J — Live Failure Matrix

실 서버/contract 기준:

```text
401
404
409
422
500
timeout
offline
malformed 2xx
slow
partial
```

검증.

---

# 86. PR-09 Exit Gate

- [ ] released-scope APIs all approved
- [ ] adapters isolate DTO
- [ ] raw DTO leakage 0
- [ ] auth behavior contract-backed
- [ ] price/options only approved scope
- [ ] query freshness correct
- [ ] mutation retry 0
- [ ] Mock/Real parity PASS
- [ ] no invented endpoint

---

# 87. IMP-7 — Voice / Final Integration / Release

목표:

> Voice를 기존 GUI action에 연결하고, 전체 Screen/State/Responsive/A11y를 릴리스 수준으로 마감한다.

대응:

```text
PR-10 Voice Bridge
PR-11 Final Polish / Release QA
```

---

# 88. IMP-7A — Voice Contract Review

실제 구현 전:

```text
architecture/voice-contract.md
latest Shared baseline
ai-console integration
event/payload
```

확인.

Final event contract 없으면
실 payload를 추측하지 않는다.

---

# 89. IMP-7B — Voice Adapter

```text
External Voice Event
→ integrations/voice
→ normalized command
```

STT engine 구현 금지.

---

# 90. IMP-7C — Voice Bridge

Normalized command를
기존 Feature action으로 연결.

예:

```text
voice select style
→ same selectStyle action as pointer/keyboard
```

별도 Voice state path 금지.

---

# 91. IMP-7D — Voice Feedback / Error

```text
recognized
not recognized
unsupported command
temporarily unavailable
```

상태를 GUI에서 명확히 표현.

GUI는 항상 대체 경로.

---

# 92. PR-10 Exit Gate

- [ ] Voice contract-backed
- [ ] GUI action reused
- [ ] no duplicate business logic
- [ ] GUI fallback always available
- [ ] keyboard/pointer behavior unchanged

---

# 93. IMP-7E — Cross-Screen Consistency Audit

전체 11개 Screen:

```text
Header
CTA hierarchy
container
type
spacing
loading
error
empty
navigation
motion
```

일관성 검사.

---

# 94. IMP-7F — Responsive Audit

필수 widths:

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

특히:

```text
Configure
Login
Previous Trips
```

은 320/1024 추가 집중.

---

# 95. IMP-7G — Accessibility Audit

```text
keyboard-only
focus-visible
focus order
Dialog/Sheet
labels/errors
semantic lists
H1/landmarks
200% zoom
reduced motion
touch target
color-independent state
```

Critical journey 전체로 확인.

---

# 96. IMP-7H — Visual Regression

Baseline:

```text
390
768
1280
1440
```

중요 Screen:

```text
Home
Tours
Tour DetailConfigure
Review
Login
Previous Trips
My Trips
```

---

# 97. IMP-7I — Network / State Regression

Latency:

```text
100ms
400ms
1200ms
3000ms
```

Failure:

```text
404
401
409
422
500
timeout
offline
image fail
partial API fail
malformed response
```

---

# 98. IMP-7J — Critical E2E

Release Gate:

```text
J01 Browse → Review
J02 Reservation Success
J03 Auth Interruption
J04 Option Conflict
J05 Schedule Conflict
J06 Previous Trips
J07 Offline Recovery
J08 Refresh During Transaction
J09 Keyboard-only Journey
J10 320px Mobile Journey
```

Target:

```text
10 / 10 PASS
```

---

# 99. IMP-7K — Release Contract Audit

Search:

```text
invented endpoint
guessed DTO
Theme = tourId
participant default
invalid Honeymoon couple math
frontend price formula
fake discount
fake history route
fake Reservation status
hidden mock path
```

0 unresolved.

---

# 100. IMP-7L — Final Release Candidate

Release-ready:

```text
critical E2E 10/10
S0 = 0
S1 = 0
typecheck PASS
lint PASS
unit/component PASS
integration PASS
E2E PASS
responsive PASS
a11y critical PASS
no contract assumption
```

---

# 101. Dependency Graph

```text
IMP-0
  ↓
IMP-1
  ↓
IMP-2A-F
  ↓
IMP-2G-K
  ↓
IMP-3A-B
  ↓
IMP-3C-J
  ↓
IMP-4A-K
  ↓
IMP-5A-E
  ↓
IMP-5F-J
  ↓
IMP-6
  ↓
IMP-7
```

병렬 가능:

```text
Home/Tours visual fixture work
+
Foundation 이후 일부 shared image/content preparation
```

하지만:

```text
Configure before Draft
Review before Draft
Live Reservation before DTO
Voice before contract
```

는 금지.

---

# 102. Screen Completion Matrix

| Screen | Implementation stage | PR |
|---|---|---|
| S01 Home | IMP-2B/C | PR-03 |
| S02 Tours | IMP-2D/E/F | PR-03 |
| S03 Tour Detail | IMP-2G-K | PR-04 |
| S04 Configure | IMP-3C-J | PR-05 |
| S05 Reservation Review | IMP-4A-H | PR-06 |
| S06 Reservation Success | IMP-4I | PR-06 |
| S07 Reservation Detail | IMP-4J | PR-06 |
| S08 Login | IMP-5B/E | PR-07 |
| S09 Signup | IMP-5C | PR-07 |
| S10 Previous Trips Popup | IMP-5G/I | PR-08 |
| S11 My Trips | IMP-5H/I | PR-08 |

---

# 103. Mock-to-Live Transition Matrix

| Area | Mock-backed stage | Live stage |
|---|---|---|
| Tour list/detail | IMP-2 | IMP-6C |
| Schedule/recruitment | IMP-2 | IMP-6D |
| Configuration options | IMP-3 | IMP-6E if contract exists |
| Price | IMP-3 presentation | IMP-6E if approved |
| Reservation | IMP-4 harness | IMP-6F |
| Auth | IMP-5 shell | IMP-6G |
| Travel History | IMP-5 | IMP-6H |
| Voice | none/fixture | IMP-7A-D |

---

# 104. Contract Gate Matrix

## Closed / usable

```text
Theme catalog
TourStyle catalog
Theme 1:N TourProduct
General participantCount >=1
Honeymoon participantCount >=2 even
Honeymoon coupleCount = participantCount / 2
Honeymoon 2 couples confirmation
General 3 participants confirmation
Travel History minimum meaning
fixed REST paths/methods
```

## Still gated

```text
participantCount UI placement/default/max
Auth DTO/session mechanism
TourProduct DTO
Schedule DTO
Configuration option IDs/DTO
price formula
Loyalty rule
Reservation DTO/error/status
Travel History DTO
pagination
Voice payload
```

---

# 105. Human-Readable Code Gate Per IMP

모든 IMP 완료 시 CP1 기준 확인:

```text
file purpose clear
responsibility narrow
comments explain WHY
no giant generated component
no fake generic abstraction
no deep feature imports
no stale comments
```

이 검사는 CP7 QA가 아니라
각 구현 단계의 완료 조건이다.

---

# 106. State Gate Per IMP

각 Data-driven Screen은 해당되는 상태를 함께 구현한다.

```text
Loading
Success
Empty
Error
Retry
Refreshing
Stale
Offline
Unauthorized
Not Found
```

Happy path만 만든 상태는
Sub-checkpoint 완료가 아니다.

---

# 107. Responsive Gate Per IMP

각 화면 PR에서 최소:

```text
390
768
1280
```

확인.

중요 transaction/auth surfaces:

```text
320
1024
```

추가.

최종 전체 width matrix는 IMP-7.

---

# 108. Accessibility Gate Per IMP

각 화면:

```text
H1
landmark
keyboard
focus
label
error association
touch
reduced motion
alt
```

해당 여부 확인.

나중에 한꺼번에 보완하지 않는다.

---

# 109. Test Gate Per IMP

## IMP-0/1

```text
unit/component
foundation E2E
```

## IMP-2

```text
component
screen integration
navigation E2E
```

## IMP-3

```text
reducer
persistence
component
Configure integration
```

## IMP-4

```text
mutation state
recovery integration
reservation E2E
```

## IMP-5

```text
auth return
history cache
dialog/sheet
account E2E
```

## IMP-6

```text
adapter
contract mapping
live integration
failure matrix
```

## IMP-7

```text
critical E2E
visual
a11y
release regression
```

---

# 110. Work Session Size Rule

한 번의 구현 세션에서는
가능하면 **Sub-checkpoint 1~3개**를 처리한다.

예:

```text
IMP-3A + IMP-3B
```

는 자연스럽다.

반면:

```text
IMP-3 전체 + IMP-4 전체
```

를 한 세션에 밀어넣지 않는다.

목표:

```text
검증 가능한 작은 변경
명확한 회귀 범위
리뷰 가능한 diff
```

---

# 111. Sub-checkpoint Completion Report Format

각 구현 Sub-checkpoint 완료 시:

```text
1. What changed
2. Files changed
3. Tests run
4. Responsive/A11y checked
5. Contract assumptions
6. Remaining issues
7. Next checkpoint
```

를 보고한다.

---

# 112. STOP Rule

구현 중 다음이 필요하면
해당 Sub-checkpoint의 integration portion만 중단한다.

```text
new endpoint
unknown DTO
new business rule
participant default decision
price formula
Auth token strategy
Reservation status enum
history pagination
Voice payload
```

UI/Mock/architecture portion은
Contract-independent하면 계속 가능.

---

# 113. CONTINUE Rule

계약 미정이어도 진행 가능:

```text
layout
responsive
a11y
loading/error
mock View Model
state architecture
adapter interface
test harness
motion
```

---

# 114. Roadmap Change Rule

CP5의 순서를 바꿀 수 있는 경우:

```text
Shared Contract closure timing
team dependency
critical bug
actual architecture blocker
```

변경 시:

```text
왜 순서를 바꾸는지
무슨 dependency가 변했는지
어떤 IMP가 영향받는지
```

를 문서/PR에 남긴다.

“이 화면이 먼저 만들기 쉬워서”만으로
dependency order를 깨지 않는다.

---

# 115. CP5 Decision Log

## CP5-D01

전체 구현을 IMP-0~IMP-7로 고정한다.

## CP5-D02

PR-01~PR-11의 기본 순서를 유지한다.

## CP5-D03

Foundation/Runtime 이후 Discovery를 구현한다.

## CP5-D04

Configure 전에 ReservationDraft를 구현한다.

## CP5-D05

Reservation recovery architecture를 Auth 실제 integration보다 먼저 만든다.

## CP5-D06

Travel History Popup/My Trips는 Auth UI 이후 구현한다.

## CP5-D07

Mock-backed Product UI를 먼저 완성하고 Live API는 IMP-6에서 연결한다.

## CP5-D08

Voice는 실제 event contract 이후 IMP-7에서 연결한다.

## CP5-D09

각 Screen은 Happy path + states + responsive + a11y가 함께 끝나야 완료다.

## CP5-D10

각 Sub-checkpoint는 1~3개 단위로 세션 실행하는 것을 기본으로 한다.

## CP5-D11

Contract gap은 integration만 block하고 독립 UI 작업은 계속한다.

## CP5-D12

최종 Release는 J01~J10 10/10을 요구한다.

---

# 116. CP5 Completion Checklist

## Global

- [x] IMP-0~IMP-7 sequence defined
- [x] PR mapping defined
- [x] dependency order defined
- [x] screen mapping defined
- [x] mock→live transition defined
- [x] contract gate matrix defined

## IMP-0

- [x] Foundation sub-checkpoints
- [x] exit gate

## IMP-1

- [x] Runtime sub-checkpoints
- [x] exit gate

## IMP-2

- [x] Home
- [x] Tours
- [x] Tour Detail
- [x] discovery navigation
- [x] responsive/a11y/motion
- [x] PR-03/04 gates

## IMP-3

- [x] ReservationDraft reducer
- [x] persistence
- [x] Configure models
- [x] desktop/mobile
- [x] participant gate
- [x] price presentation
- [x] states
- [x] QA

## IMP-4

- [x] Review
- [x] mutation harness
- [x] 401
- [x] 409
- [x] 422
- [x] ambiguous result
- [x] Success
- [x] Detail
- [x] QA

## IMP-5

- [x] Auth shell
- [x] Login
- [x] Signup
- [x] ReturnContext
- [x] transaction recovery
- [x] history model
- [x] Previous Trips
- [x] My Trips
- [x] cache sharing

## IMP-6

- [x] Contract audit
- [x] HTTP client
- [x] Tour adapter
- [x] Schedule adapter
- [x] Configuration/Price gate
- [x] Reservation adapter
- [x] Auth adapter
- [x] History adapter
- [x] parity/failure audit

## IMP-7

- [x] Voice contract
- [x] Voice adapter/bridge
- [x] cross-screen audit
- [x] responsive audit
- [x] a11y audit
- [x] visual regression
- [x] network/state regression
- [x] critical E2E
- [x] release contract audit

---

# 117. CP5 Exit Status

```text
CP5 — IMPLEMENTATION ROADMAP
STATUS: COMPLETE
```

결과:

```text
Global implementation order         LOCKED
PR sequence                         LOCKED
IMP-0 Foundation                    DECOMPOSED
IMP-1 Runtime                       DECOMPOSED
IMP-2 Discovery                     DECOMPOSED
IMP-3 Transaction Core              DECOMPOSED
IMP-4 Reservation                   DECOMPOSED
IMP-5 Account & History             DECOMPOSED
IMP-6 Live Integration              DECOMPOSED
IMP-7 Voice / Release               DECOMPOSED
Screen → IMP mapping                LOCKED
Mock → Live transition              LOCKED
Sub-checkpoint reporting rule       LOCKED
```

---

# 118. Handoff to CP6

다음 Checkpoint:

```text
CP6 — CONTRACT & LIVE INTEGRATION PLAN
```

CP6의 목적은
IMP-6에서 “실제 Backend를 붙인다”는 표현을 더 세밀하게 쪼개는 것이다.

반드시 다룰 항목:

```text
H-01~H-10 current status refresh
v0.1.2 이후 closed/open gate 재분류

Endpoint-by-endpoint integration readiness
DTO readiness
Auth readiness
Error contract
Validation contract
Reservation recovery
participantCount representation
Honeymoon couple semantics
Price
Loyalty
Configuration options
Travel History
Voice boundary

Mock → Real switchover
Adapter contract
Runtime validation
ContractMappingError
Integration test strategy
Backend dependency escalation
```

CP6 종료 시에는:

> **어떤 API는 지금 바로 붙일 수 있고,
> 어떤 API는 어떤 문서/DTO가 닫혀야 붙일 수 있는지**

가 endpoint별로 명확해야 한다.