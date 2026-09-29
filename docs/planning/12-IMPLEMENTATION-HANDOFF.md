# Mister World Frontend — Implementation Handoff

> Document: `12-IMPLEMENTATION-HANDOFF.md`  
> Status: **CP11 Complete — Planning Handoff Finalized**  
> Target repository: `WonhoOne/frontend`  
> Repository state verified: 2026-09-29  
> Frontend repository baseline at handoff: **greenfield (`README.md`, `AGENTS.md` only on `main`)**  
> Shared SSOT: `WonhoOne/docs/main`  
> Frontend responsibility: **Customer-facing React + TypeScript GUI**

---

# 0. Purpose

이 문서는 CP0–CP10의 최종 결과를 실제 구현 세션이 바로 사용할 수 있도록 압축한 **실행용 handoff**다.

이 문서를 받은 구현 세션은:

```text
1. 무엇을 먼저 읽어야 하는지
2. 무엇을 바로 구현해도 되는지
3. 어떤 구조로 코드를 시작해야 하는지
4. 어떤 Shared Contract는 절대 임의로 채우면 안 되는지
5. 어떤 순서로 화면을 구현해야 하는지
6. 어떤 테스트를 PR마다 통과해야 하는지
7. 어디에서 멈추고 contract gap을 올려야 하는지
```

를 추가 UX 기획 없이 판단할 수 있어야 한다.

---

# 1. Final Planning Status

```text
CP0   Scope & Contract                  COMPLETE
CP1   Information Architecture          COMPLETE
CP2   Visual Direction                  COMPLETE
CP3   Design System                     COMPLETE
CP4   Motion System                     COMPLETE
CP5   UI State System                   COMPLETE
CP6   Screen Specifications             COMPLETE
CP7   Component Architecture            COMPLETE
CP8   Data & API UX                     COMPLETE
CP9   Responsive & Accessibility        COMPLETE
CP10  QA & Acceptance                   COMPLETE
CP11  Implementation Handoff            COMPLETE
```

Planning status:

```text
FRONTEND PLANNING COMPLETE
```

Qualification:

```text
UI / UX implementation           READY
Mock-backed implementation       READY
Live Backend integration         CONTRACT-GATED
```

---

# 2. Mandatory Reading Order — LOCKED

구현 세션은 코드를 쓰기 전에 다음 순서로 읽는다.

## A. Repository / Shared Contract

```text
WonhoOne/frontend/AGENTS.md

WonhoOne/docs/main:
1. baseline/BASELINE-v0.1.1.md
2. requirements/requirements.md
3. requirements/product-catalog.md
4. requirements/domain-model.md
5. requirements/business-rules.md
6. requirements/non-functional-requirements.md
7. architecture/system-architecture.md
8. architecture/repository-responsibilities.md
9. api/api-spec-draft.md
10. CONTRIBUTING.md
11. AGENTS.md
```

## B. Frontend Planning

```text
00-PLANNING-INDEX.md
01-PRODUCT-EXPERIENCE.md
02-INFORMATION-ARCHITECTURE.md
03-VISUAL-DIRECTION.md
04-DESIGN-SYSTEM.md
05-MOTION-SYSTEM.md
06-UI-STATES.md
07-SCREEN-SPECS.md
08-COMPONENT-ARCHITECTURE.md
09-DATA-AND-API-UX.md
10-RESPONSIVE-ACCESSIBILITY.md
11-QA-ACCEPTANCE.md
12-IMPLEMENTATION-HANDOFF.md
```

## C. Required audits

```text
audits/CP6-H-CONTRACT-TBD-AUDIT.md
audits/CP6-I-FINAL-IMPLEMENTATION-READINESS.md
```

그리고 구현하려는 화면의:

```text
screens/<screen>.md
```

를 마지막에 읽는다.

---

# 3. Source-of-Truth Precedence

충돌하면 다음 순서.

```text
1. latest approved team decision
2. WonhoOne/docs/main approved shared contract
3. original project requirement
4. Frontend planning CP0–CP11
5. Screen-specific implementation detail
```

Frontend 문서가 Shared Contract보다 위에 있지 않다.

Shared Contract가 바뀌면:

```text
impact 확인
→ adapter/screen plan update
→ implementation
```

순서로 한다.

---

# 4. Non-Negotiable Repository Rules

Frontend implementation area:

```text
WonhoOne/frontend
```

Backend / Voice repository:

```text
read-only by default
```

구현 세션은 다음을 하지 않는다.

```text
Backend 코드 수정
ai-console 코드 수정
MySQL 직접 접근
Shared API field 발명
Endpoint 발명
TBD Business Rule 임의 확정
Frontend를 Business Rule 최종 authority로 만들기
```

다른 repository 변경이 필요하면:

```text
issue / contract request
```

로 해당 Owner에게 넘긴다.

---

# 5. Current Repository Reality

Handoff 직전 `WonhoOne/frontend/main` 확인 결과:

```text
README.md
AGENTS.md
```

만 존재한다.

따라서 실제 앱은 아직 scaffold 전이다.

이점:

```text
legacy 구조에 맞출 필요 없음
CP7 architecture를 처음부터 적용 가능
```

주의:

> 처음 scaffold를 잘못 잡으면 이후 11개 화면 모두가 그 구조에 묶인다.

---

# 6. Product North Star

```text
Cinematic Travel
×
Luxury Editorial
×
Modern Product UI
```

화면별 비중:

```text
Home / Tour Detail
→ cinematic + editorial

Configure
→ editorial + modern product

Reservation / Auth / My Trips
→ restrained editorial + modern product
```

피해야 할 것:

```text
Bootstrap assignment
SaaS dashboard
OTA clone
fake gold luxury
glass everywhere
rounded everything
animation bait
generic full-screen spinner
```

---

# 7. Product Decision Chain

Customer journey canonical chain:

```text
Theme
→ TourProduct
→ Style
→ Schedule
→ Configuration
→ Review
→ Reservation
```

주의:

최신 shared domain:

```text
Theme 1:N TourProduct
```

이므로:

```text
Theme == tourId
```

하드코딩 금지.

Theme-first visual discovery는 유지 가능하지만,
실제 TourProduct 선택/라우팅은 Shared Contract와 제품 결정을 따른다.

---

# 8. Customer Route Model

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

Global post-login surface:

```text
Previous Trips Popup
```

별도 history-detail route는 현재 만들지 않는다.

---

# 9. 11 Screen Specs

```text
S01  Home
S02  Tours
S03  Tour Detail
S04  Configure
S05  Reservation Review
S06  Reservation Success
S07  Reservation Detail
S08  Login
S09  Signup
S10  Previous Trips Popup
S11  My Trips
```

각 화면 MD는 독립 구현 명세다.

구현 중 UX가 궁금하면 먼저 해당 Screen Spec을 확인하고,
그곳에도 없을 때만 새 결정을 제안한다.

---

# 10. Target Source Architecture

```text
src/
├── app/
│   ├── App.tsx
│   ├── AppProviders.tsx
│   ├── router/
│   ├── errors/
│   └── config/
│
├── pages/
├── features/
│   ├── tour-discovery/
│   ├── tour-detail/
│   ├── configuration/
│   ├── reservation/
│   ├── auth/
│   ├── travel-history/
│   └── voice-bridge/
│
├── domain/
│   ├── tour/
│   ├── schedule/
│   ├── configuration/
│   ├── reservation/
│   ├── customer/
│   └── travel-history/
│
├── integrations/
│   ├── backend/
│   │   ├── client/
│   │   ├── contracts/
│   │   ├── adapters/
│   │   └── errors/
│   └── voice/
│
├── shared/
│   ├── ui/
│   ├── motion/
│   ├── state/
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   ├── accessibility/
│   └── assets/
│
├── mocks/
└── test/
```

---

# 11. Architecture Rule That Must Survive Every PR

```text
Backend DTO
→ Adapter
→ Frontend View Model
→ Feature
→ Page/UI
```

금지:

```tsx
<Page title={response.tourName} />
```

형태로 raw API shape가 화면 전체에 퍼지는 것.

현재 API contract가 바뀔 가능성이 높기 때문에
이 규칙은 stylistic preference가 아니라 **risk containment strategy**다.

---

# 12. State Ownership

## Server State

```text
TourProduct
TourSchedule
Reservation
Travel History
Backend price
availability
```

Query/Data layer.

## Transaction State

```text
Style
Schedule
Hotel
Transport
Meal
Extras
participant count after contract closure
```

`ReservationDraft`.

## Ephemeral UI State

```text
Dialog open
Sheet open
Hover
Focus
Temporary animation state
```

local/component.

세 종류를 하나의 global store로 합치지 않는다.

---

# 13. ReservationDraft

멀티스크린 transaction을 연결한다.

```text
Tour Detail
→ Configure
→ Review
→ Back
→ Auth interruption
→ Review restore
```

필수 특성:

```text
serializable
versionable
explicit reset
sessionStorage recovery
```

Persist 가능:

```text
selected identities
draft version
updatedAt
```

Persist 금지:

```text
credential
auth token
raw server response
server truth
```

---

# 14. Data / Cache Policy

Initial Frontend policy:

```text
F0  price / final validation           always current
F1  schedule/recruitment/availability  ~30s
F2  TourProduct                        ~5m
F3  Travel History                     ~5m
F4  static/editorial                    build/static
```

이 시간은 Business Rule이 아니다.

Backend policy에 따라 조정 가능.

---

# 15. Retry Policy

Read query:

```text
transient network / 5xx
→ automatic retry max 1
```

Mutation:

```text
automatic retry = 0
```

특히:

```text
Login
Signup
Reservation Create
```

blind retry 금지.

---

# 16. Reservation Submission Rule

```text
Idle
→ Submitting
→ Server Success
→ Success route
```

정책:

```text
pessimistic
duplicate submit lock
no automatic mutation retry
draft clear only after server-confirmed success
```

401:

```text
Login
→ Review restore
→ manual resubmit
```

409:

```text
latest truth
→ changed values
→ reconfirm
```

422:

```text
mapped validation
→ correct
```

---

# 17. Loading Rule

기본:

```text
no generic full-page spinner
```

사용:

```text
geometry-matched skeleton
progressive image
partial content
local retry
```

약 120ms 이상 지연부터 visible loading state를 고려한다.

---

# 18. Error Rule

Error는 항상 가능하면:

```text
what failed
what remains
how to recover
```

를 명확히 한다.

성공 data가 있는데 refresh가 실패했다고
화면 전체를 Error로 바꾸지 않는다.

---

# 19. Responsive Baseline

Breakpoints:

```text
640
768
1024
1280
1440
```

Stress widths:

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

Minimum touch target:

```text
44 × 44px
```

Critical:

```text
200% browser zoom
safe-area
software keyboard
reduced motion
```

---

# 20. Configure Responsive Rule

```text
>=1024
→ left controls + right sticky summary

<1024
→ remove side summary

mobile
→ 1-column options
→ bottom summary/action
→ summary bottom sheet
```

Desktop page를 `scale()`로 줄여 mobile을 만들지 않는다.

---

# 21. Accessibility Baseline

필수:

```text
one H1 per page
logical headings
landmarks
visible labels
focus-visible
logical DOM order
dialog focus trap
focus return
status not color-only
keyboard completion
reduced motion
```

Link:

```text
navigation
```

Button:

```text
action
```

semantic을 지킨다.

---

# 22. Motion Baseline

Motion token reuse.

```text
Home/Tours → Tour Detail
= Signature Shared Transition

normal route
= Standard Page Transition

Configure
= local selection / summary / price

Dialog
= Dialog Motion

Sheet
= Bottom Sheet Motion
```

Page마다 임의 easing/duration을 발명하지 않는다.

---

# 23. Active Contract Gates — STOP AND ASK

아래 항목을 만나면 Frontend가 임의로 결정하지 않는다.

## H-01 Theme ↔ TourProduct

```text
Theme 1:N TourProduct
```

결정 필요:

```text
Theme에서 여러 TourProduct를 어떻게 선택하는가?
```

## H-02 participantCount

Shared model에는 존재하지만
화면 위치/default/range 미확정.

## H-03 Honeymoon

Frontend intent:

```text
2 couples / 2 teams
```

Shared domain:

```text
participant total >= 4
```

Couple/Team mapping contract 없음.

절대:

```ts
participantCount / 2
```

로 해결하지 않는다.

## H-04 Auth

미확정:

```text
credential fields
JWT/session
refresh
protected route
reservation auth gate
```

## H-05 TourProduct DTO

## H-06 TourSchedule DTO

## H-07 Configuration / Options Contract

## H-08 Reservation DTO / errors / status

## H-09 Price

## H-10 Travel History DTO

이 중 하나가 막히면:

```text
mock/view-model까지만 진행
→ contract gap 보고
→ approved contract 후 adapter 연결
```

---

# 24. Never Invent List

구현 세션이 절대 임의로 만들지 않는 것:

```text
new Backend endpoint
API field names
JWT/session strategy
hidden participantCount default
Honeymoon couple calculation
price formula
discount formula
Hotel/Transport/Meal catalog
Reservation status enum
History detail route
History pagination params
SMS delivered state
Voice payload
```

---

# 25. Mock Strategy

Mock는 적극적으로 사용한다.

하지만:

```text
Mock fixture
≠ Shared Contract
```

초기:

```text
View Model
← mock data source
```

계약 확정 후:

```text
View Model
← adapter
← approved DTO
```

로 교체.

Mock file/name에 `mock`, `fixture`, `demo` 의미가 분명해야 한다.

---

# 26. Required Mock Scenarios

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
reservation-ambiguous-response
history-empty
history-populated
```

계약 미확정 값은
실제 서비스 데이터처럼 포장하지 않는다.

---

# 27. Frontend Technology Bootstrap

React + TypeScript는 Shared Contract상 고정.

나머지는 Frontend-local 선택이다.

추천 기본 조합:

```text
Vite
React Router
TanStack Query
Vitest
React Testing Library
Playwright
MSW
CSS Custom Properties for Design Tokens
CSS Modules or equivalent scoped styling
```

이 조합은 권고 기본값이며 Shared Contract가 아니다.

최초 scaffold PR에서 실제 선택한 도구와 이유를 README/PR에 기록한다.

새 dependency는 “편해서”가 아니라
CP3–CP10 요구를 실제로 해결하는지 확인하고 추가한다.

---

# 28. First Implementation PR — Scope

**PR-01 목표: Foundation only.**

포함:

```text
React + TypeScript scaffold
lint/format/test baseline
app root
router shell
AppProviders
Design Token variables
PageContainer/Grid baseline
Button
TextLink
TextField
OptionCard
Dialog
BottomSheet
Skeleton
ImageFrame
GlobalHeader
TransactionHeader
motion tokens
Error Boundary
mock/test infrastructure
```

포함하지 않음:

```text
real Backend integration
Reservation submission
Auth contract guessing
price logic
participantCount assumption
Honeymoon mapping logic
all 11 screens at once
```

---

# 29. First PR Acceptance

PR-01은 최소:

```text
app boots
routes can mount placeholders
tokens are centralized
primitive keyboard behavior works
Dialog focus trap works
reduced motion branch exists
test runner works
E2E runner can launch app
mock infrastructure works
no contract assumptions
```

를 충족한다.

---

# 30. Implementation PR Sequence

권장:

```text
PR-01 Foundation / Tokens / Shared UI

PR-02 App Shell / Router / State Harness / Motion

PR-03 Home + Tours

PR-04 Tour Detail

PR-05 ReservationDraft + Configure

PR-06 Reservation Review + Success + Detail

PR-07 Login + Signup + ReturnContext

PR-08 Previous Trips Popup + My Trips

PR-09 Real Backend Adapters
      as Shared Contracts close

PR-10 Voice Bridge
      after event contract closes

PR-11 Cross-screen Polish / Visual Regression / Release QA
```

팀 상황에 따라 PR을 합치거나 나눌 수 있지만
dependency order는 유지하는 것이 좋다.

---

# 31. Why This Order

```text
Foundation
→ shared language
→ discovery screens
→ selection flow
→ transaction state
→ reservation
→ auth
→ history
→ live integration
→ voice
→ final polish
```

Configure 전에 `ReservationDraft`가 필요한 이유:

> Review/Auth/Back flow까지 selection을 안정적으로 연결해야 하기 때문.

Real API integration을 뒤에 두는 이유:

> Contract가 닫히기 전에 DTO를 UI architecture에 박아 넣지 않기 위해서.

---

# 32. Screen Build Order

구현 순서:

```text
1. Home
2. Tours
3. Tour Detail
4. Configure
5. Reservation Review
6. Reservation Success
7. Reservation Detail
8. Login
9. Signup
10. Previous Trips Popup
11. My Trips
```

단, Shared primitives와 State Harness는 먼저.

---

# 33. Home / Tours Build Note

현재 Theme↔TourProduct gate가 있으므로:

- visual shell 구현 가능
- Theme-first card 구현 가능
- multiple-product fixture 가능
- one Theme = one product 하드코딩 금지

실제 route target은 adapter/navigation decision을 통해 주입 가능한 구조로 만든다.

---

# 34. Tour Detail Build Note

가능:

```text
Hero
Story
Included Experience
Style UI
Schedule UI
Recruitment visual
CTA states
```

금지:

```text
live couple calculation
invented Schedule DTO
```

Recruitment는 presentation model을 소비.

---

# 35. Configure Build Note

먼저 구현:

```text
ReservationDraft
OptionGroup
OptionCard
Summary
MobileSummaryBar
SummarySheet
partial states
conflict states
```

Data source는 mock.

실제 option API 없음.

가격:

```text
PriceDisplayModel
```

까지만.

Frontend price engine 금지.

---

# 36. Reservation Build Note

Review:

```text
draft display
change navigation
validation states
```

Success/Detail:

```text
reservation display model
recruitment placeholder/presentation
```

Live `POST /reservations` 연결은 DTO가 approved된 뒤.

---

# 37. Auth Build Note

UI shell은 즉시 가능.

```text
Login modal/page
Signup
ReturnContext
Loading/Error
focus
```

하지만 credential fields는 approved contract를 따른다.

Contract 전:

```text
auth fixture schema
```

도 production DTO처럼 만들지 않는다.

---

# 38. History Build Note

`TravelHistoryItemModel` 하나를 공유.

```text
PreviousTripPreviewCard
TripCard
```

둘 다 같은 Model 소비.

현재:

```text
product
period
style
price
```

가 최소 의미.

No history-detail route.

---

# 39. Voice Build Note

Frontend는 STT를 구현하지 않는다.

최종:

```text
Voice event
→ adapter
→ existing feature action
```

이어야 한다.

Touch/Keyboard/Voice가 서로 다른 state path를 가지면 FAIL.

---

# 40. Styling Handoff

Design Tokens는 `04-DESIGN-SYSTEM.md`가 source.

핵심 palette:

```text
Canvas             #F6F3ED
Surface            #FBF9F5
Elevated           #FFFDFC
Muted              #EEE9E1

Ink                #191918
Ink Soft           #34322F
Secondary Text     #6E6961
Tertiary Text      #918A80

Border             #DDD7CE
Strong Border      #BDB5A9

Muted Brass        #9B7A4B
Accent Hover       #87673C
Accent Soft        #EEE3D2
```

Primary CTA:

```text
Charcoal
```

금지:

```text
gold gradient primary button
```

---

# 41. Typography Handoff

```text
UI/Korean
→ Pretendard Variable stack

Latin editorial accent
→ Instrument Serif
```

Font loading 방식은 구현 단계에서 적법한 source/license를 확인한다.

Font asset 자체를 planning artifact와 섞지 않는다.

---

# 42. Layout Handoff

Containers:

```text
1440 wide
1280 main
1180 transaction
760 reading
520 auth
```

Mobile:

```text
20px-ish gutter baseline per token
```

정확한 값은 CP3 token 사용.

---

# 43. Motion Handoff

Duration tiers:

```text
80
140
200
280
360
480
620
820ms
```

Easing:

```text
standard
enter
exit
cinematic
```

component마다 새 duration 숫자를 발명하지 않는다.

---

# 44. Loading Handoff

Data component마다 real/skeleton pair.

```text
TourHero / TourHeroSkeleton
ScheduleCard / ScheduleCardSkeleton
TripCard / TripCardSkeleton
...
```

Shimmer:

```text
~1600–2000ms
low contrast
```

Reduced Motion:

```text
static skeleton
```

---

# 45. Image Handoff

`ImageFrame`가:

```text
Placeholder
Loading
Loaded
Failed
```

소유.

기본 progressive image.

broken-image browser icon 노출 금지.

실제 Theme imagery는 최종 asset 단계에서
focal crop / contrast / alt를 다시 검증한다.

---

# 46. Accessibility Handoff

최초 primitive부터 구현.

나중에 “접근성 보완”으로 미루지 않는다.

필수:

```text
visible labels
native semantics
focus-visible
dialog focus trap
keyboard
touch >=44px
reduced motion
200% zoom
```

---

# 47. QA Handoff

Master:

```text
11-QA-ACCEPTANCE.md
```

PR마다 최소:

```text
unit/component
integration
manual responsive
accessibility
network/error state
```

증거를 남긴다.

---

# 48. Critical E2E Before Release

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

Release:

```text
10 / 10 PASS
```

---

# 49. Release Blockers

```text
S0 = 0
S1 = 0
```

예:

```text
duplicate Reservation
wrong price
wrong applicant data
Auth bypass
core CTA inaccessible
mobile task impossible
keyboard task impossible
```

하나라도 있으면 release 금지.

---

# 50. PR Description Template

```text
## Scope
- ...

## Requirement IDs
- FR-...
- BR-...

## Screens
- S0X ...

## Shared APIs used
- ...

## Contract assumptions
- None
or
- BLOCKED H-...

## States tested
- Loading
- Success
- Empty
- Error
- ...

## Responsive
- 390
- 768
- 1280
- ...

## Accessibility
- Keyboard
- Focus
- Labels
- Reduced Motion
- ...

## Tests
- unit
- integration
- E2E/manual

## Out of scope
- ...
```

---

# 51. Contract Gap Escalation Template

구현 중 contract가 없으면:

```text
Title:
[Frontend Contract] <missing behavior>

Context:
어느 Screen / Requirement에서 필요한지

Current approved contract:
무엇까지 정의되어 있는지

Missing:
정확히 무엇이 없는지

Frontend impact:
어떤 구현이 block되는지

Proposed decision options:
가능한 선택지
(하나를 임의 채택하지 않음)

Affected repositories:
frontend / backend / docs / ai-console

Acceptance:
어떤 문서/API가 정해지면 unblock인지
```

---

# 52. Implementation Session STOP Conditions

즉시 멈추고 contract/owner 확인:

```text
docs와 code 충돌
endpoint가 필요하지만 docs에 없음
DTO field를 추측해야 함
Business Rule을 새로 정해야 함
participantCount UX를 임의 결정해야 함
Honeymoon couple mapping을 계산해야 함
Auth storage를 추측해야 함
price formula를 만들어야 함
```

이 상태에서 “일단 구현”하지 않는다.

---

# 53. Implementation Session CONTINUE Conditions

계약이 없어도 계속 진행 가능한 경우:

```text
visual layout
component structure
loading/error state
motion
responsive
accessibility
mock-backed View Model
adapter interface
test harness
```

---

# 54. Definition of Implementation-Ready

현재 Frontend는 다음 의미에서 implementation-ready다.

```text
Screen behavior specified
Visual system specified
Motion specified
State handling specified
Component ownership specified
Data lifecycle specified
Responsive/A11y specified
QA specified
Handoff specified
```

즉 구현 세션이 UX를 새로 설계할 필요는 없다.

---

# 55. Definition of Integration-Ready

다음이 승인되면 live integration-ready다.

```text
Auth DTO/session
TourProduct DTO
Theme↔TourProduct behavior
TourSchedule DTO
participantCount UX contract
Honeymoon mapping
Configuration/Option contract
Reservation DTO/error/status
Price contract
Travel History DTO
```

---

# 56. Definition of Release-Ready

```text
integration contracts closed for released scope
all implemented screen acceptance PASS
critical E2E 10/10
S0 0
S1 0
critical accessibility PASS
responsive critical widths PASS
no hidden mock path
no invented contract
```

---

# 57. First Implementation Session Checklist

시작 전:

- [ ] `frontend/AGENTS.md` 읽음
- [ ] `docs/main` mandatory docs 읽음
- [ ] CP0–CP11 읽음
- [ ] CP6-H/I audit 읽음
- [ ] repository main 상태 확인
- [ ] 새 feature branch 생성
- [ ] PR-01 scope를 Foundation으로 제한
- [ ] dependency 선택 기록
- [ ] shared token부터 생성
- [ ] test runner 처음부터 구성
- [ ] accessibility primitive 처음부터 검증
- [ ] no Backend/API assumption 확인

---

# 58. First Implementation Session Deliverables

첫 세션 종료 시 기대:

```text
React/TS app boots
routing shell exists
tokens compile
shared primitives render
dialog/sheet keyboard usable
motion token layer exists
skeleton/image state exists
mock/state harness exists
test baseline passes
README contains local setup
```

아직 기대하지 않는 것:

```text
full Home polish
real reservation
real login
real price
real backend data
```

---

# 59. Recommended Daily Implementation Loop

```text
Read target Screen Spec
↓
Identify required primitives/features
↓
Check contract gates
↓
Implement against View Model
↓
Add Loading/Error/Responsive/A11y same PR
↓
Run component/integration test
↓
Manual critical viewport/focus test
↓
PR with evidence
```

“Happy path 먼저 만들고 나중에 loading/error/mobile 접근성” 방식은 피한다.

---

# 60. Screen Completion Rule During Implementation

화면 하나는 다음이 같이 끝나야 완료다.

```text
Success
Loading
Empty if applicable
Error
Retry
Mobile
Desktop
Keyboard
Focus
Reduced Motion
Image failure
Relevant network simulation
```

Happy path만 구현한 화면은 완료가 아니다.

---

# 61. Visual Quality Rule

User target:

> “어설프게 따라하는 수준이 아니라 고급스럽게 마감된 여행 서비스.”

따라서 QA에서 다음을 같이 본다.

```text
spacing rhythm
typography hierarchy
image crop
hover restraint
motion restraint
skeleton geometry
selection clarity
error polish
mobile finish
```

Functionally correct but visually generic한 Bootstrap-level 구현은 완료로 보지 않는다.

---

# 62. Final Planning Artifact Map

```text
00-PLANNING-INDEX.md
01-PRODUCT-EXPERIENCE.md
02-INFORMATION-ARCHITECTURE.md
03-VISUAL-DIRECTION.md
04-DESIGN-SYSTEM.md
05-MOTION-SYSTEM.md
06-UI-STATES.md
07-SCREEN-SPECS.md
08-COMPONENT-ARCHITECTURE.md
09-DATA-AND-API-UX.md
10-RESPONSIVE-ACCESSIBILITY.md
11-QA-ACCEPTANCE.md
12-IMPLEMENTATION-HANDOFF.md

screens/
  01-home.md
  02-tours.md
  03-tour-detail.md
  04-configure.md
  05-reservation-review.md
  06-reservation-success.md
  07-reservation-detail.md
  08-login.md
  09-signup.md
  10-previous-trips-popup.md
  11-my-trips.md

audits/
  CP6-G-CROSS-SCREEN-CONSISTENCY.md
  CP6-H-CONTRACT-TBD-AUDIT.md
  CP6-I-FINAL-IMPLEMENTATION-READINESS.md
```

---

# 63. Copy-Paste Brief for the Implementation Agent

```text
You are implementing the customer-facing React + TypeScript frontend for Mister World in `WonhoOne/frontend`.

Before coding, read `frontend/AGENTS.md`, the mandatory approved documents in `WonhoOne/docs/main`, then read the complete frontend planning package `00-PLANNING-INDEX.md` through `12-IMPLEMENTATION-HANDOFF.md`, plus the relevant `screens/*.md` and CP6-H/CP6-I audits.

Do not invent shared API endpoints, DTO fields, authentication mechanics, price formulas, participantCount defaults, Honeymoon couple/team mappings, option catalogs, Reservation statuses, Travel History routes, or Voice payloads.

Architecture rule:
Backend DTO → Adapter → Frontend View Model → Feature/UI.

Use mocks behind the View Model/data-source boundary while shared contracts remain open. Mock shape is not the Backend contract.

Implement Success, Loading, Empty, Error, Retry, Desktop, Mobile, keyboard, focus, reduced motion, and image failure together—not as later polish.

First implementation unit is Foundation:
React/TS scaffold, app/router/providers, design tokens, shared UI primitives, motion primitives, skeleton/image states, Error Boundary, mock/test harness. Do not attempt real Backend integration in the first PR.

Use the CP10 QA contract as the acceptance gate for every completed screen.
```

---

# 64. CP11 Acceptance Checklist

## Handoff completeness

- [x] mandatory reading order
- [x] source precedence
- [x] repo boundaries
- [x] repository current state
- [x] product north star
- [x] route model
- [x] source architecture
- [x] state ownership
- [x] draft ownership
- [x] data/cache/retry policy
- [x] loading/error policy
- [x] responsive/a11y baseline
- [x] motion baseline

## Contract safety

- [x] active contract gates
- [x] never-invent list
- [x] STOP conditions
- [x] escalation template
- [x] mock policy
- [x] integration-ready definition

## Execution

- [x] first PR scope
- [x] PR sequence
- [x] screen sequence
- [x] first-session deliverables
- [x] daily implementation loop
- [x] screen completion rule
- [x] PR template

## QA

- [x] critical E2E reference
- [x] release blockers
- [x] implementation-ready definition
- [x] release-ready definition

**CP11 Status: COMPLETE**

---

# 65. Final Status

```text
MISTER WORLD FRONTEND PLANNING
STATUS: COMPLETE

CP0  COMPLETE
CP1  COMPLETE
CP2  COMPLETE
CP3  COMPLETE
CP4  COMPLETE
CP5  COMPLETE
CP6  COMPLETE
CP7  COMPLETE
CP8  COMPLETE
CP9  COMPLETE
CP10 COMPLETE
CP11 COMPLETE
```

Next phase:

```text
IMPLEMENTATION
```

Recommended first unit:

```text
Implementation PR-01
Foundation / Tokens / Shared UI / Router / Test Harness
```
