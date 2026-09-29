# Mister World Frontend — Implementation Master Plan

> Status: **IMPLEMENTATION READY**
> Version: **Master Plan v1 — Shared Baseline v0.1.2**
> Date: **2026-09-30**
> Target repository: `WonhoOne/frontend`
>
> Shared SSOT snapshot:
>
> ```text
> WonhoOne/docs/main
> 46fd61af7dc0ac4770305e7088c4e4ded9b78892
> baseline/BASELINE-v0.1.2.md
> ```
>
> Frontend snapshot before implementation:
>
> ```text
> WonhoOne/frontend/main
> 370b58ed94b482fec59ee32d34f2c2317f4c10ce
> ```
>
> Backend snapshot at planning close:
>
> ```text
> WonhoOne/backend/main
> 44f9882485a36a849e84c1c63225b09fc655864c
> ```

---

# 1. What This Document Is

이 문서는 Mister World Customer Frontend의
**최종 구현 실행 기준**이다.

상세 근거는:

```text
docs/implementation/checkpoints/CP0~CP9
```

에 둔다.

구현 세션은 매번 CP 문서 전체를 처음부터 읽을 필요는 없지만,
Master Plan과 해당 IMP/Screen 관련 CP는 반드시 읽는다.

---

# 2. Source Precedence

충돌 시:

```text
1. WonhoOne/docs/main latest approved Shared Contract
2. IMPLEMENTATION-MASTER-PLAN.md
3. CP0~CP9 implementation checkpoints
4. current frontend planning/screens
5. historical audits/handoffs
```

Frontend가 Shared Domain/API/Business Rule을 재정의하지 않는다.

Docs와 Code가 충돌하면:

```text
STOP
→ conflict surface
→ approved contract reconciliation
→ resume
```

---

# 3. Project Scope

Frontend Owner responsibility:

```text
React + TypeScript Customer GUI
Login/Signup UI
Tour discovery
Tour Detail
Configuration
Reservation journey
Travel History
Backend API integration
Frontend tests
Voice command bridge integration
```

Frontend does not own:

```text
Backend business logic
MySQL
Backend persistence
SMS provider
Voice Recognition/STT engine
Employee Console
Shared API invention
```

---

# 4. Customer Route Model

```text
/
├── /tours
├── /tours/:tourId
├── /tours/:tourId/configure
├── /reservation/review
├── /reservation/:reservationId/success
├── /reservations/:reservationId
├── /login
├── /signup
└── /my-trips
```

Global non-route surface:

```text
Previous Trips Popup
```

No current route:

```text
history detail
current reservations list
payment
cancel/refund
```

---

# 5. Screens

```text
S01 Home
S02 Tours
S03 Tour Detail
S04 Configure
S05 Reservation Review
S06 Reservation Success
S07 Reservation Detail
S08 Login
S09 Signup
S10 Previous Trips Popup
S11 My Trips
```

---

# 6. Product / Domain Truth

Themes:

```text
HONEYMOON_ROMANCE
PARENTS_HEALING
GOLF_CHALLENGE
OUTDOOR_TREKKING
```

TourStyle:

```text
CLASSIC
GRAND
PREMIUM
```

Relations:

```text
Theme 1:N TourProduct
Theme != TourProduct
TourStyle != TourConfiguration
```

Allowed styles:

```text
Honeymoon  → GRAND / PREMIUM
Parents    → GRAND / PREMIUM
Golf       → CLASSIC / GRAND / PREMIUM
Trekking   → CLASSIC / GRAND / PREMIUM
```

General Reservation:

```text
participantCount integer >= 1
```

Honeymoon Reservation:

```text
participantCount >= 2
participantCount even
coupleCount = participantCount / 2
```

Schedule confirmation:

```text
General   → total participants >= 3
Honeymoon → total valid couples/teams >= 2
```

Backend remains final business authority.

---

# 7. Human-Readable Code Standard

“사람이 읽기 좋은 코드”는:

```text
파일 이름으로 책임이 보인다.
이름으로 의도가 보인다.
위에서 아래로 읽힌다.
한 module에는 하나의 중심 책임이 있다.
Data flow와 State owner가 추적된다.
변경 영향 범위를 예상할 수 있다.
```

우선순위:

```text
readability > cleverness
explicitness > hidden magic
maintainability > minimum line count
small duplication > wrong abstraction
```

피함:

```text
giant component
generic manager/service
wrapper chain
everything store
deep nested ternary
excessive any/assertion
premature generic architecture
```

---

# 8. Comment Standard

이 프로젝트는 적극적인 설명 주석을 사용한다.

주석 핵심:

```text
WHY
CONTRACT
INVARIANT
LIFECYCLE
EDGE CASE
SECURITY
ACCESSIBILITY
PERFORMANCE
WORKAROUND
BLOCKED H-xx
```

단:

```text
// button을 렌더링한다
```

같은 WHAT-repeat noise는 쓰지 않는다.

설명 주석은 Korean 중심,
Identifier/Domain term은 conventional English를 유지한다.

주석이 코드와 달라지면
DoD 실패다.

---

# 9. Architecture

Top-level:

```text
src/
├── main.tsx
├── app/
├── pages/
├── features/
├── integrations/
├── shared/
└── mocks/

tests/
└── e2e/
```

`app`:

```text
router
providers
config
errors
shell
styles
```

`features`:

```text
tour-discovery
tour-detail
configuration
reservation
auth
travel-history
voice-bridge
```

---

# 10. Dependency Direction

```text
main
↓
app
↓
pages
↓
features
↓
integrations

pages/features
↓
shared
```

Rules:

```text
Page = route composition
Feature = business/user capability
Integration = external system boundary
Shared = business-agnostic only
```

Forbidden:

```text
Page raw fetch
Page raw DTO parsing
shared → feature
feature → page
feature private deep import
integration → visual page/component runtime
raw DTO → JSX
```

---

# 11. Feature Public API

Feature 외부 접근은:

```text
features/<feature>/index.ts
```

public API를 기본으로 한다.

무분별한:

```text
export *
```

금지.

Feature 내부 subfolder는
실제 책임이 생길 때만 만든다.

---

# 12. App Chrome

Final ownership:

```text
GlobalHeader       → src/app/shell
TransactionHeader  → src/app/shell
```

Header가 Feature query를 직접 소유하지 않는다.

Feature state/action은:

```text
props
slot
App/Page composition
```

으로 전달한다.

---

# 13. Backend Boundary

Canonical flow:

```text
HTTP JSON
→ runtime validation
→ Approved Backend DTO
→ Adapter
→ Frontend Model
→ Feature
→ Page/UI
```

금지:

```text
response.json()
→ arbitrary UI
```

---

# 14. State Architecture

세 종류:

```text
Server State
Transaction State
Ephemeral UI State
```

## Server State

```text
TanStack Query
```

대상:

```text
TourProduct
TourSchedule
Reservation
Travel History
server price
availability
```

## Transaction State

```text
ReservationDraft
```

구현:

```text
React Context
+ useReducer
+ sessionStorage
```

## Ephemeral UI

```text
local useState/useReducer
```

---

# 15. ReservationDraft

Conceptual V1:

```text
schemaVersion
tourProductId
tourScheduleId
tourStyle
participantCount
hotelSelectionKey
transportSelectionKey
mealSelectionKey
extraSelectionKeys
updatedAt
```

Stores:

```text
choice identities
```

Does not store:

```text
full DTO
price
availability
status
credential
token
full customer profile
```

Clear only:

```text
server-confirmed Reservation success
explicit user discard
unrecoverable incompatible schema
```

Preserve on:

```text
401
409
422
5xx
network error
offline
Back navigation
refresh
```

---

# 16. Query Policy

Freshness:

```text
F0 final validation / price   → always current
F1 schedule/recruitment/status→ ~30s
F2 TourProduct                → ~5m
F3 Travel History             → ~5m
F4 static/editorial           → not query
```

GET:

```text
transient auto retry <= 1
```

No automatic retry:

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
auto retry = 0
```

Polling:

```text
OFF by default
```

Refresh failure:

```text
keep existing successful content
```

---

# 17. Auth Interruption

Flow:

```text
Review Submit
→ 401
→ preserve Draft
→ save validated ReturnContext
→ Login
→ authenticated
→ Review restore
→ fresh validation
→ user manually submits again
```

Never:

```text
Login success → automatic Reservation POST
```

---

# 18. Contract Gates

| Gate | Status |
|---|---|
| H-01 Theme/TourProduct public data | PARTIAL |
| H-02 participantCount UX/API | PARTIAL |
| H-03 Honeymoon couple semantics | **CLOSED** |
| H-04 Authentication | BLOCKED |
| H-05 TourProduct DTO | BLOCKED |
| H-06 TourSchedule DTO | BLOCKED |
| H-07 Configuration/options | BLOCKED |
| H-08 Reservation DTO/error/status | BLOCKED |
| H-09 Price/Loyalty | BLOCKED |
| H-10 Travel History DTO | BLOCKED |

Contract gap은
Mock-backed UI를 막지 않지만
Live integration을 막는다.

---

# 19. Fixed REST Skeleton

```http
POST /api/v1/auth/signup
POST /api/v1/auth/login

GET /api/v1/tours
GET /api/v1/tours/{tourId}

GET /api/v1/tour-schedules
GET /api/v1/tour-schedules/{scheduleId}

POST /api/v1/reservations
GET /api/v1/reservations/{reservationId}

GET /api/v1/customers/me/travel-history
```

Do not invent:

```text
/themes
/options
/configuration/validate
/price
/current-reservations
/history/{id}
/logout
/refresh
/sms
```

---

# 20. Current Live Integration Reality

At planning close:

```text
Backend domain foundation      exists
Backend REST Controllers       none
Public DTO implementation      none
Persistence                    not implemented
Auth                           not implemented
FE live-ready endpoints        0
```

Therefore:

```text
IMP-0~IMP-5 = proceed Mock-backed
IMP-6       = wait per endpoint contract/backend readiness
```

---

# 21. Foundation Stack

Verified planning baseline:

```text
Node                  24.21.0 LTS
npm
React                 19.3.0
React Router          8.4.0
TanStack Query        5.104.0
Vite                  8.3.1
TypeScript            5.9.3
Vitest                5.0.2
React Testing Library
Playwright             1.63.0
MSW                    2.15.0
Radix Dialog           behavior primitive
CSS Custom Properties
CSS Modules
```

TypeScript 5.9.3 is intentional for
typescript-eslint compatibility.

Exact package list lives in CP4.

---

# 22. Foundation Does Not Add Yet

No premature:

```text
Redux
Zustand
Axios
Tailwind
Bootstrap
Material UI
Motion library
Storybook
form library
runtime schema library before DTO closure
analytics
error monitoring vendor
PWA
```

Add only when actual requirement appears.

---

# 23. Visual Direction

North Star:

```text
Cinematic Travel
× Luxury Editorial
× Modern Product UI
```

Avoid:

```text
Bootstrap assignment
SaaS dashboard
OTA clone
fake gold luxury
glass everywhere
rounded everything
generic spinner
excessive motion
```

Primary CTA:

```text
charcoal
```

Accent:

```text
restrained brass
```

---

# 24. Core Design Tokens

Color baseline:

```text
canvas          #F6F3ED
surface         #FBF9F5
ink             #191918
secondary       #6E6961
border          #DDD7CE
accent          #9B7A4B
success         #2F6B50
warning         #9B672F
danger          #A34B44
info            #496A7D
```

Theme accents:

```text
Honeymoon       #9A6C68
Parents         #6F7D68
Golf            #365744
Trekking        #596971
```

Detailed token tables live in CP4 / planning design system.

---

# 25. Loading / Error System

No generic page spinner.

Use:

```text
geometry-matched Skeleton
partial rendering
local retry
ImageFrame fallback
```

Error categories:

```text
Network
Unauthorized
NotFound
Validation
Conflict
Server
ContractMapping
Unknown
```

Raw backend messages/stacks are never UI copy.

---

# 26. Responsive Baseline

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

Mobile-first.

Minimum touch:

```text
44 × 44
```

200% zoom:

```text
critical task remains usable
```

Use:

```text
dvh/svh
safe-area env
```

where needed.

---

# 27. Accessibility Baseline

Required from first primitive:

```text
native semantics
visible labels
focus-visible
logical DOM/focus order
one H1 per Page
landmarks
skip link
Dialog focus trap/return
explicit BottomSheet close
state not color-only
reduced motion
```

Accessibility is not final polish.

---

# 28. Motion Baseline

Durations:

```text
80
140
200
280
360
480
620
820 ms
```

Reduced Motion removes:

```text
parallax
shared transform
spring/bounce
digit roll
shimmer
large motion
```

Motion is interruptible.

Latest user intent wins.

---

# 29. Implementation Roadmap

```text
IMP-0 Foundation
IMP-1 App Runtime
IMP-2 Discovery
IMP-3 Transaction Core
IMP-4 Reservation
IMP-5 Account & Travel History
IMP-6 Live Backend Integration
IMP-7 Voice / Final Integration / Release
```

---

# 30. PR Sequence

```text
PR-01 Foundation
PR-02 App Runtime / State Harness / Motion
PR-03 Home + Tours
PR-04 Tour Detail
PR-05 ReservationDraft + Configure
PR-06 Review + Success + Reservation Detail
PR-07 Login + Signup + ReturnContext
PR-08 Previous Trips + My Trips
PR-09 Live Backend Adapters
PR-10 Voice Bridge
PR-11 Final Polish / Regression / Release
```

---

# 31. IMP-0 Foundation

Internal checkpoints:

```text
0A Toolchain
0B Bootstrap
0C Design/Motion Tokens
0D Layout Primitives
0E Controls
0F Overlays
0G Loading/Image
0H Router/App Chrome
0I Mock/Test Harness
```

Detailed execution = CP4.

Exit:

```text
npm ci
verify
E2E smoke
all route placeholders
primitive keyboard/accessibilityno Product contract assumptions
```

---

# 32. IMP-1 App Runtime

Build:

```text
route runtime
focus/scroll policy
App shell
dev scenario harness
state presentation baseline
motion runtime
```

No real Product API required.

---

# 33. IMP-2 Discovery

Screens:

```text
S01 Home
S02 Tours
S03 Tour Detail
```

Important:

```text
Theme != tourId
multiple TourProduct per Theme supported
Style restrictions correct
Schedule errors local
Honeymoon couple wording v0.1.2
```

---

# 34. IMP-3 Transaction Core

Order:

```text
Draft reducer
→ persistence
→ Configure models
→ Desktop
→ Mobile
→ states
→ price presentation
→ navigation
→ QA
```

participantCount remains:

```text
null initial
```

until placement/default/max contract is approved.

---

# 35. IMP-4 Reservation

Build:

```text
Review
mutation harness
401 recovery
409 recovery
422 recovery
ambiguous outcome
Success
Reservation Detail
```

Reservation create:

```text
pessimistic
duplicate locked
auto retry 0
```

---

# 36. IMP-5 Account & History

Build:

```text
AuthState shell
Login
Signup
ReturnContext
transaction login recovery
Travel History Model
Previous Trips Popup
My Trips
shared History cache
```

No Auth mechanism invention.

No History detail route.

---

# 37. IMP-6 Live Integration

Per resource:

```text
Contract freeze
→ Backend verify
→ DTO contract
→ runtime decode
→ Adapter
→ Backend DataSource
→ Mock/Real parity
→ Production composition
→ failure tests
```

Integration can proceed resource by resource.

---

# 38. IMP-7 Voice / Final

Voice:

```text
external event
→ integrations/voice
→ voice-bridge
→ existing Feature action
```

No duplicate Voice business logic.

Final:

```text
responsive
a11y
visual
network
contract
security
performance
release regression
```

---

# 39. QA Layers

```text
L0 Static
L1 Unit
L2 Component
L3 Feature Integration
L4 Adapter Contract
L5 Browser E2E
L6 Visual / Responsive
L7 Accessibility / Manual
```

---

# 40. Critical E2E

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

Frontend Release Gate:

```text
10 / 10 PASS
```

---

# 41. Severity

```text
S0 = data integrity/security/truth failure
S1 = critical task broken
S2 = major recovery/UX
S3 = minor
S4 = polish
```

Release:

```text
S0 = 0
S1 = 0
```

---

# 42. Security Rules

Never persist:

```text
credential
password
private API payload
Travel History cache
Customer profile
```

Auth token/session secret:

```text
follow approved H-04 contract only
```

`VITE_*`:

```text
public config only
```

Default forbidden:

```text
dangerouslySetInnerHTML
eval
innerHTML
raw Backend HTML
```

Production logs redact:

```text
credential
token
address
contact
private payload
```

---

# 43. Production Mock Safety

Mock starts only in explicit development/test mode.

Production Mock leakage:

```text
S0
```

Release verifies:

```text
no worker auto-start
no scenario UI
no fixture truth
```

---

# 44. Performance Rules

Use:

```text
route lazy splitting
responsive images
lazy below-fold images
intentional Hero priority
reserved image geometry
font-display strategy
Query cache/dedupe
AbortSignal
no default polling
render locality
transform/opacity motion
```

Investigate:

```text
Vite >500kB uncompressed chunk warning
```

before raising warning limit.

Internal web-quality observation:

```text
LCP <= 2.5s
INP <= 200ms
CLS <= 0.1
```

These are internal targets, not Shared requirements.

---

# 45. Release Build

Clean:

```bash
npm ci
npm run verify
npm run test:e2e
npm run build
npm audit --omit=dev --audit-level=high
```

Then production-like serve and smoke:

```text
direct routes
lazy chunks
assets
env
real API scope
mock off
```

---

# 46. Release Metadata

Record:

```text
Frontend SHA
Shared docs SHA
Backend SHA
Node version
released scope
open gates
known S2/S3
test evidence
```

Rollback requires:

```text
previous known-good Frontend
+
Backend compatibility
```

---

# 47. STOP Conditions

Stop before implementation/integration if:

```text
Shared docs/code conflict
missing endpoint needed
unknown DTO required
new Business Rule required
participant default/max needed
Auth storage strategy required
price formula required
Reservation status required
History pagination/detail required
Voice payload required
```

Do not “just assume.”

---

# 48. CONTINUE Conditions

Continue safely with:

```text
layout
component structure
Frontend Model
Mock fixture
Loading/Error states
responsive
accessibility
motion
Draft architecture
test harness
adapter interface
```

---

# 49. Implementation Session Size

Default one session:

```text
1–3 Sub-checkpoints
```

Do not combine:

```text
whole IMP-3 + whole IMP-4
```

into one unreviewable change.

---

# 50. Completion Report Format

Every completed implementation checkpoint reports:

```text
1. What changed
2. Files changed
3. Automated tests
4. E2E / journey
5. Responsive checks
6. Accessibility checks
7. States checked
8. Contract assumptions/gates
9. Remaining defects
10. Next checkpoint
```

---

# 51. First Implementation Action

Start:

```text
latest frontend/main
→ branch feat/frontend-foundation
→ PR-01 Foundation
```

Do not begin with Home polish or Backend integration.

First session delivers:

```text
React/TS boots
Router placeholders
AppProviders
QueryClient
Error Boundary
Design/Motion tokens
Shared primitives
Dialog/BottomSheet
Skeleton/ImageFrame
App shell
MSW/Test infrastructure
README setup
```

---

# 52. Repository Document Placement

When uploading this planning package:

```text
docs/
  implementation/
    IMPLEMENTATION-MASTER-PLAN.md
    checkpoints/
      CP0...
      ...
      CP9...
```

Update current Frontend handoff docs to point here.

---

# 53. Legacy Drift Maintenance

Must reconcile:

```text
AGENTS.md
docs/IMPLEMENTATION-START-HANDOFF.md
docs/planning/07-SCREEN-SPECS.md
docs/planning/10-RESPONSIVE-ACCESSIBILITY.md
docs/planning/11-QA-ACCEPTANCE.md
docs/planning/12-IMPLEMENTATION-HANDOFF.md
```

Mark historical:

```text
CP6-H audit
CP6-I audit
```

Reason:

```text
v0.1.1/H-03 old assumptions
```

---

# 54. Detailed Checkpoint Index

```text
CP0  Implementation Baseline
CP1  Code Quality Standards
CP2  Frontend Architecture
CP3  State & Data Architecture
CP4  Foundation Implementation Plan
CP5  Implementation Roadmap
CP6  Contract & Live Integration
CP7  QA & Test Plan
CP8  Security / Performance / Release
CP9  Final Plan Audit
```

Use Master for final decision,
CP document for implementation detail.

---

# 55. Definition — Implementation Ready

```text
Shared baseline resolved
Screen behavior designed
Architecture defined
State ownership defined
Mock strategy defined
Foundation stack defined
IMP/PR sequence defined
QA/release gates defined
Security/performance boundaries defined
```

Status:

```text
YES
```

---

# 56. Definition — Live Integration Ready

Per resource:

```text
approved DTO/error contract
Backend endpoint implementation
Backend tests
Frontend runtime validator
Adapter
DataSource
integration tests
```

Current overall status:

```text
NO
```

because Backend public REST/DTOs are not yet implemented.

---

# 57. Definition — Release Ready

```text
released-scope contracts closed
real Backend for required journey
J01~J10 10/10
S0 0
S1 0
all screen acceptance PASS
critical/serious a11y 0
responsive critical widths PASS
production mocks OFF
dependency/security review PASS
production build smoke PASS
release metadata recorded
rollback identifiable
```

---

# 58. Final Status

```text
FRONTEND IMPLEMENTATION PLANNING
STATUS: COMPLETE

CP0 COMPLETE
CP1 COMPLETE
CP2 COMPLETE
CP3 COMPLETE
CP4 COMPLETE
CP5 COMPLETE
CP6 COMPLETE
CP7 COMPLETE
CP8 COMPLETE
CP9 COMPLETE

NEXT:
Repository documentation upload/reconciliation
then
PR-01 Foundation implementation
```