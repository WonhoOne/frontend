# Mister World Frontend — CP0 Implementation Baseline

> Status: **COMPLETE**  
> Checkpoint: **CP0 — Implementation Baseline / Scope / Contract Boundary**  
> Date: **2026-09-29**  
> Target repository: `WonhoOne/frontend`  
> Shared SSOT repository: `WonhoOne/docs`  
> Frontend reviewed main: `370b58ed94b482fec59ee32d34f2c2317f4c10ce`  
> Shared docs reviewed main: `46fd61af7dc0ac4770305e7088c4e4ded9b78892`  
> Next checkpoint: **CP1 — Code Quality Standards**

---

## 1. Purpose

이 문서는 Mister World Customer GUI의 구현을 시작하기 전에
**어떤 문서를 기준으로 판단하고, 어떤 기능을 Frontend가 소유하며,
어떤 Shared Contract는 확정되어 있고, 어떤 항목은 아직 구현자가 추측하면 안 되는지**
고정한다.

CP0의 목적은 새로운 Product Requirement 또는 Backend Contract를 만드는 것이 아니다.

이 문서는 이후 CP1~CP9 및 실제 Frontend 구현에서 발생할 수 있는
다음 종류의 오류를 사전에 차단하기 위한 Implementation Baseline이다.

- 오래된 Frontend 기획을 현재 Shared Contract보다 우선하여 구현
- Theme과 TourProduct를 같은 개념으로 취급
- 미확정 DTO field를 Frontend에서 임의로 결정
- Auth를 JWT 또는 Session 방식으로 임의 확정
- `participantCount`의 UI 위치/기본값/범위를 임의 확정
- Honeymoon의 `participantCount`를 v0.1.2 유효성 조건 없이 Couple 수로 임의 변환
- 가격/할인 로직을 Frontend가 자체 계산
- 기획에 없는 REST endpoint 추가
- Travel History와 현재 Reservation 목록을 임의로 혼합
- Backend 또는 다른 Repository의 책임을 Frontend가 대신 구현

CP0 이후 구현자는 **"문서에 없지만 이렇게 하면 될 것 같다"**는 이유로
공통 계약을 만들 수 없다.

---

# 2. Reviewed Baseline

## 2.1 Frontend repository

검토 기준 Frontend `main`:

```text
WonhoOne/frontend
370b58ed94b482fec59ee32d34f2c2317f4c10ce
```

해당 시점의 주요 상태:

```text
planning package       COMPLETE
implementation handoff COMPLETE
source skeleton        PRESENT
React/Vite runtime     NOT IMPLEMENTED
real Backend adapter   NOT IMPLEMENTED
```

구현 시작점은 `docs/IMPLEMENTATION-START-HANDOFF.md`가 지정한
**Implementation PR-01 — Foundation**이다.

## 2.2 Shared docs repository

검토 기준 Shared Docs `main`:

```text
WonhoOne/docs
5afc209fdf150ad0d2706c7c78c9ed73bbdc0562
```

현재 `docs/main`에 존재하는 최신 Baseline은:

```text
baseline/BASELINE-v0.1.2.md
```

이며 Shared `AGENTS.md`의 규칙에 따라 **docs/main에 존재하는 최신 Baseline이 승인된 구현 기준**이다.

따라서 v0.1.2가 현재 실행 가능한 Shared Contract baseline이다.
v0.1.1은 predecessor/historical baseline으로 유지된다.

---

# 3. Source of Truth Precedence

구현 중 판단 우선순위는 다음과 같이 고정한다.

## Level 1 — Approved Shared Contract

`WonhoOne/docs/main`에 병합된 승인 문서.

필수 기준:

```text
baseline/BASELINE-v0.1.2.md
requirements/requirements.md
requirements/product-catalog.md
requirements/domain-model.md
requirements/business-rules.md
requirements/non-functional-requirements.md
architecture/system-architecture.md
architecture/repository-responsibilities.md
api/api-spec-draft.md
database/erd-draft.md
CONTRIBUTING.md
AGENTS.md
```

Voice를 직접 다루는 구현에서는 추가로:

```text
architecture/voice-contract.md
```

를 읽는다.

## Level 2 — Frontend Repository Rules

```text
WonhoOne/frontend/AGENTS.md
```

Frontend의 소유 범위, cross-repository 정책, Adapter boundary,
Mock 정책, PR 증거 요구사항을 정한다.

## Level 3 — Frontend Implementation Handoff / Audits

```text
docs/IMPLEMENTATION-START-HANDOFF.md
docs/planning/12-IMPLEMENTATION-HANDOFF.md
docs/planning/audits/CP6-H-CONTRACT-TBD-AUDIT.md
docs/planning/audits/CP6-I-FINAL-IMPLEMENTATION-READINESS.md
```

공통 계약을 Frontend 구현 구조로 번역하고,
현재 안전하게 구현 가능한 영역과 Contract-gated 영역을 구분한다.

## Level 4 — Frontend Planning Package

```text
docs/planning/00-PLANNING-INDEX.md
docs/planning/01-...
...
docs/planning/11-QA-ACCEPTANCE.md
docs/planning/screens/*.md
```

UX, layout, visual, motion, state, responsive, accessibility,
component architecture 및 QA 기준을 제공한다.

## Level 5 — Implementation Detail

라이브러리 선택, 내부 TypeScript type 구성, 함수/컴포넌트 분리,
파일 배치와 같은 Frontend 내부 구현 상세.

Shared Contract를 변경하지 않는 범위에서 Frontend Owner가 결정할 수 있다.

---

# 4. Conflict Resolution Rule

문서 간 충돌이 있을 경우
**더 오래된 Frontend 계획을 편의상 선택하지 않는다.**

기본 처리:

```text
Conflict 발견
→ Approved Shared Contract 확인
→ Frontend 계획의 해당 부분을 Contract Gate로 표시
→ 필요하면 docs 변경 제안
→ 승인 전 production contract 구현 금지
```

공통 Domain, Business Rule, REST API, ERD 또는 Repository responsibility의
변경이 필요하다면 구현보다 Docs 변경이 먼저다.

Frontend 내부 component 구조처럼 공통 계약에 영향을 주지 않는 변경은
Frontend에서 결정할 수 있다.

---

# 5. Frontend Responsibility

`WonhoOne/frontend`는 **Customer GUI**를 소유한다.

현재 책임:

```text
React + TypeScript Customer GUI
회원가입 UI
로그인 UI
TourProduct 탐색
Theme 기반 발견 경험
Tour Detail
Tour Style 선택
Hotel / Transport / Meal 세부 옵션 변경 UI
추가 옵션 UI — 승인된 범위 내
TourSchedule 조회 및 모집 상태 표현
TourConfiguration 구성 UX
Reservation 신청 UX
Reservation 결과/상세 UX
Travel History UI
Loading / Empty / Error / Retry UX
Responsive implementation
Accessibility
Frontend state management
Backend REST API integration
Frontend validation for UX
Frontend automated tests
Voice 결과를 받을 GUI integration point
```

Frontend는 Backend의 최종 Business Rule authority를 대체하지 않는다.

---

# 6. Frontend Non-Responsibilities

다음은 Frontend가 소유하지 않는다.

```text
Spring Boot Backend 구현
MySQL 접근 및 persistence
Database schema 직접 결정
Backend Business Rule 최종 판정
Employee Console
Speech-to-Text engine
SMS infrastructure/provider
실제 호텔/항공 예약 시스템 연동
온라인 결제
환불
자유 대화형 AI 추천
실시간 외부 여행상품 검색
```

또한 `WonhoOne/backend`, `WonhoOne/ai-console`은
Frontend Agent에게 기본적으로 read-only이다.

타 Repository 변경 필요 시:

```text
필요사항 발견
→ 영향 범위 정리
→ 해당 Repository Owner에게 Issue/change request
→ Owner 구현
→ 통합 확인
```

명시적 위임이 없는 한 직접 수정하지 않는다.

---

# 7. Fixed Shared Domain

다음 Domain 의미는 현재 승인되어 있다.

## Theme

```text
HONEYMOON_ROMANCE
PARENTS_HEALING
GOLF_CHALLENGE
OUTDOOR_TREKKING
```

## TourStyle

```text
CLASSIC
GRAND
PREMIUM
```

## Core concepts

```text
Theme
TourProduct
TourSchedule
TourStyle
TourConfiguration
Customer
Employee
Reservation
Inventory
TravelHistory
```

중요한 관계:

```text
Theme 1 ─────── N TourProduct
TourProduct 1 ─ N TourSchedule
Customer 1 ──── N Reservation
TourSchedule 1 ─ N Reservation
Reservation 1 ─ 1 TourConfiguration
```

### Non-negotiable distinction

```text
Theme != TourProduct
TourStyle != TourConfiguration
```

`Theme`은 분류이고,
`TourProduct`는 실제 직원이 기획/관리하는 여행상품이다.

`TourStyle`은 기본 구성이고,
`TourConfiguration`은 고객 선택이 반영된 최종 구성이다.

따라서 다음 구현은 금지한다.

```ts
const tourId = theme;
```

---

# 8. Fixed Product Rules

## 8.1 Style availability

```text
HONEYMOON_ROMANCE → GRAND / PREMIUM
PARENTS_HEALING   → GRAND / PREMIUM
GOLF_CHALLENGE    → CLASSIC / GRAND / PREMIUM
OUTDOOR_TREKKING  → CLASSIC / GRAND / PREMIUM
```

## 8.2 Configuration

고객은 기본 TourStyle 선택 이후에도 최소 다음을 변경할 수 있다.

```text
Hotel
Transport
Meal
```

Product Catalog가 정의한 Theme 제공 항목과
TourStyle 기본 구성의 세부 조합/대체 방식 중
공통 문서가 정하지 않은 것은 임의로 확정하지 않는다.

## 8.3 Reservation participant count

일반 Theme Reservation:

```text
participantCount >= 1
integer
```

이며 한 Reservation으로 여러 명을 예약할 수 있다.

`HONEYMOON_ROMANCE` Reservation에는 v0.1.2의 더 강한 규칙이 적용된다.

```text
participantCount >= 2
participantCount is even
coupleCount = participantCount / 2
```

한 Honeymoon Reservation은 여러 couple/team을 포함할 수 있다.

`coupleCount`는 모집 단위의 **derived meaning**이며 별도의 Shared `Couple` 또는 `Team` Entity가 아니다.

## 8.4 Schedule confirmation

```text
HONEYMOON_ROMANCE 외
→ Reservation participantCount 합 >= 3

HONEYMOON_ROMANCE
→ 유효한 Reservation별 derived coupleCount 합 >= 2 couples/teams
```

Honeymoon의 최소 인원은 유효 Reservation만 놓고 보면 숫자상 4명이지만,
규칙의 의미는 임의의 4 participants가 아니라 **2 valid couples/teams**다.

예:

```text
participantCount = 2 + 2
→ valid: 2 couples

participantCount = 4
→ valid: 2 couples

participantCount = 1 + 3
→ invalid Honeymoon Reservations
```

Backend가 최종 판정 authority다.

## 8.5 First confirmation SMS

TourSchedule이 최초로 확정될 때 신청 고객에게
SMS를 실제 전송해야 한다.

단:

```text
SMS provider/API = TBD
```

이며 Frontend가 SMS provider 또는 전송 contract를 만들지 않는다.

## 8.6 Travel History

로그인 Customer의 Travel History는:

```text
most-recent-first
```

이며 최소 다음 정보를 포함한다.

```text
product
period
TourStyle
price
```

`TravelHistory`를 별도 DB table로 저장하는지는 TBD다.

## 8.7 Loyalty Discount

Loyalty Discount 기능 자체는 Requirement다.

그러나 다음은 아직 TBD다.

```text
eligibility
discount rate
application timing
stacking rule
```

Frontend에서 자체 계산하거나 임의 UX truth를 만들지 않는다.

---

# 9. Honeymoon Planning Reconciliation — v0.1.2

기존 Frontend planning의:

```text
2 couples / 2 teams
```

표현은 이제 Shared Contract v0.1.2에서 공식 의미가 확정되었다.

Approved Shared Contract:

```text
1 couple/team = 2 participants

HONEYMOON_ROMANCE Reservation:
participantCount >= 2
participantCount is even

coupleCount = participantCount / 2

Honeymoon TourSchedule confirms when:
sum(valid Reservation.coupleCount) >= 2
```

중요한 제한:

```text
Couple Entity 없음
Team Entity 없음
coupleCount persistence field 보장 없음
API가 coupleCount를 별도 반환한다고 보장되지 않음
```

따라서 Frontend가 할 수 있는 것:

- Honeymoon participant input에 `>= 2`, even validation을 UX 수준에서 적용
- 유효한 `participantCount`에 대해 presentation을 위해 `coupleCount = participantCount / 2`를 파생
- `2 couples / 2 teams` wording을 모집 UX에 사용
- Backend가 제공하는 최종 모집/확정 상태를 authoritative truth로 사용

Frontend가 하면 안 되는 것:

- invalid participantCount에 대해 coupleCount를 계산
- 별도 Couple/Team Entity 또는 persistence model을 발명
- `coupleCount`라는 API field가 존재한다고 추측
- Schedule 전체의 최종 confirmed 여부를 Frontend가 독립 authority로 확정

---

# 10. Fixed REST API Skeleton

v0.1.1에서 고정된 아래 **resource naming, endpoint path, HTTP method**는 v0.1.2에서도 그대로 유지된다.

## Authentication

```http
POST /api/v1/auth/signup
POST /api/v1/auth/login
```

## TourProduct

```http
GET /api/v1/tours
GET /api/v1/tours/{tourId}
```

`{tourId}`는 TourProduct identifier다.

## TourSchedule

```http
GET /api/v1/tour-schedules
GET /api/v1/tour-schedules/{scheduleId}
```

## Reservation

```http
POST /api/v1/reservations
GET /api/v1/reservations/{reservationId}
```

## Customer Travel History

```http
GET /api/v1/customers/me/travel-history
```

Employee endpoints는 Shared API에는 존재하지만
Customer Frontend 구현 범위가 아니다.

---

# 11. Endpoints That Must Not Be Invented

현재 승인되지 않은 endpoint를 Frontend 편의를 위해 만들지 않는다.

예:

```text
/theme
/themes
/options
/configuration/validate
/price
/discount
/current-reservations
/history/:id
/sms
/logout
/refresh-token
```

Backend가 실제 구현했다고 해도,
Approved Shared Contract에 없는 공개 endpoint를
Frontend가 공통 계약으로 간주하기 전에 Docs contract를 확인한다.

---

# 12. Contract-Gated Areas

현재 UI/Mock 구현은 가능하지만
실제 Backend integration 또는 Business behavior를 임의 확정하면 안 되는 영역이다.

## H-01 — Theme ↔ TourProduct

Fixed:

```text
Theme 1:N TourProduct
```

Gated:

```text
Theme 선택 후 어떤 TourProduct를 어떤 UX/API 데이터로 선택하는지의 최종 mapping
```

Forbidden:

```text
Theme value를 tourId로 사용
```

## H-02 — participantCount UX

Fixed:

```text
General Reservation:
participantCount >= 1 integer

Honeymoon Reservation:
participantCount >= 2 integer
participantCount is even
```

Gated:

```text
입력 위치
기본값
선택 UI
최대값
schedule capacity
가격과의 관계
option availability와의 관계
Request DTO 표현
```

Forbidden:

```text
숨은 default = 1 또는 2
UI/Contract 없이 임의 값 전송
```

## H-03 — Honeymoon Couple/Team semantics

Status:

```text
CLOSED by Shared Baseline v0.1.2
```

Fixed:

```text
1 couple/team = 2 participants
coupleCount = participantCount / 2
Honeymoon participantCount >= 2 and even
Schedule confirmation = total derived coupleCount >= 2
```

Still not fixed:

```text
Couple/Team Entity — 없음
separate coupleCount API field — TBD
persistence representation — TBD
participant-count UI placement/default/max — TBD
```

## H-04 — Authentication

Gated:

```text
credential fields
request DTO
response DTO
JWT vs session
token format
token persistence
refresh behavior
protected-route policy
reservation auth gate details
logout contract
```

Frontend는 Login/Signup visual shell과 ReturnContext architecture는 만들 수 있으나
실제 mechanism을 추측하지 않는다.

## H-05 — TourProduct DTO

Gated:

```text
request/response field names
pagination
optional/nullable semantics
```

## H-06 — TourSchedule DTO

Gated:

```text
detailed schedule fields
recruitment/status representation
date canonical fields
```

## H-07 — Configuration / Options

Gated:

```text
official Hotel/Transport/Meal IDs
detailed option catalog
compatibility rules
validation contract
dedicated endpoint existence
```

## H-08 — Reservation DTO / Error / Status

Gated:

```text
create request DTO
response DTO
Reservation status enum
validation error format
conflict payload
```

## H-09 — Price / Loyalty

Gated:

```text
price formula
server price representation
discount eligibility/rate
discount timing/stacking
```

Frontend price engine은 만들지 않는다.

## H-10 — Travel History DTO

Fixed:

```text
recent-first
product
period
TourStyle
price
```

Gated:

```text
actual response field names
canonical date fields
pagination
separate persistence model
history detail API
```

History detail route/API를 임의로 추가하지 않는다.

---

# 13. Current Route Baseline

현재 Frontend UX route model:

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

추가 global post-login surface:

```text
Previous Trips Popup
```

현재 승인되지 않은 것:

```text
history detail route
current-reservations list route
```

Route는 Frontend UX 구조이며,
`Theme → /tours/:tourId` 이동 시 실제 `tourId`는 반드시 TourProduct identity여야 한다.

---

# 14. Implementation Allowed Before Contract Closure

다음은 Shared Contract가 완전히 닫히지 않아도 구현할 수 있다.

```text
React/TypeScript scaffold
Router shell
AppProviders
Error Boundary

Design Tokens
layout primitives
shared UI primitives
Dialog / BottomSheet
Skeleton
ImageFrame
Headers

motion primitives
reduced-motion branch

responsive behavior
accessibility semantics

loading / empty / error / retry states
query/state harness
frontend View Models
adapter interfaces

clearly marked Mock fixtures
mock-backed screen implementation
frontend tests
```

Mock-backed 구현은 실제 API 계약으로 간주하지 않는다.

---

# 15. Implementation Forbidden Before Contract Closure

다음은 승인 없이 production truth로 구현하지 않는다.

```text
invented API endpoint
invented shared DTO field
JWT/session assumption
refresh token mechanism
credential storage policy 추측

participantCount hidden default
participantCount UI placement/default/max 추측
invalid Honeymoon participantCount에 대한 couple 계산
Couple/Team Entity 또는 API field 발명

official Hotel/Transport/Meal IDs 추측
option compatibility rule 추측

frontend price formula
loyalty discount formula

Reservation status enum
travel cancellation
history pagination
history detail endpoint/route

SMS provider behavior
SMS delivery-status UI contract

Voice payload/command contract 추측
```

---

# 16. Mock Boundary

초기 구현의 정상적인 흐름:

```text
Mock Fixture
→ Frontend View Model
→ Feature UI
```

계약 확정 후:

```text
Backend DTO
→ Adapter
→ same Frontend View Model
→ same Feature UI
```

금지:

```text
Mock JSON field name
→ Component props 전체에 직접 확산
→ 나중에 실제 DTO와 충돌
```

Fixture/scenario에는 다음과 같이 출처가 가짜임을 명확히 한다.

```text
mock
fixture
scenario
demo
```

Mock shape는 Backend contract가 아니다.

---

# 17. Mandatory Data Boundary

실제 Backend 연동은 다음 경계를 지킨다.

```text
Backend DTO
→ integrations/backend adapter
→ feature-local frontend model
→ feature/page UI
```

Raw DTO는 Page 또는 visual component로 직접 전달하지 않는다.

이 규칙의 목적:

- v0.2 DTO 변경 영향 최소화
- Mock → Real API 전환 비용 최소화
- Backend field naming과 UI semantics 분리
- Contract uncertainty를 integration edge에 격리

---

# 18. State Ownership Baseline

세 종류의 상태를 혼합하지 않는다.

## Server State

예:

```text
TourProduct
TourSchedule
Reservation
Travel History
server-owned price
availability
```

Query/Data layer가 소유한다.

## Transaction State

예:

```text
selected style
selected schedule
hotel selection
transport selection
meal selection
extras
participantCount — contract closure 이후
```

`ReservationDraft` 계열 transaction state가 소유한다.

Draft는 이후 CP에서 다음 성질을 갖도록 상세 설계한다.

```text
serializable
versionable
sessionStorage recoverable
explicit reset
```

## Ephemeral UI State

예:

```text
dialog open
sheet open
hover
focus
local animation
```

가장 가까운 UI/component가 소유한다.

모든 상태를 Global Store 하나에 넣지 않는다.

---

# 19. Business Rule Authority

Frontend validation은 사용자 경험을 위해 Shared Business Rule을 미러링할 수 있다.

그러나:

```text
Frontend validation != final authority
```

최종 판정은 Backend다.
특히 다음과 같은 결과를 Frontend가 authoritative하게 선언하지 않는다.

```text
Reservation officially created
TourSchedule officially confirmed
SMS sent
Loyalty discount officially applied
server price accepted
```

Backend 확인 없이 optimistic success를 만들지 않는다.

---

# 20. Data / Mutation Safety Baseline

현재 Frontend planning에서 고정된 구현 정책:

## Read query

Transient GET error:

```text
automatic retry <= 1
```

다음 status/category는 기본 자동 retry 대상이 아니다.

```text
401
403
404
409
422
```

## Mutation

```text
automatic retry = 0
```

특히 Reservation create는 pessimistic하게 처리한다.

네트워크가 끊겨 결과가 불명확할 경우
동일 POST를 blind retry하지 않는다.

## Auth interruption

```text
401
→ Login
→ Draft restore
→ Review
→ User manually submits again
```

자동 재-submit하지 않는다.

---

# 21. Loading / Failure Baseline

기본 Loading UX:

```text
layout-matched skeleton
progressive image loading
partial content
local retry
```

Generic full-page spinner를 기본값으로 사용하지 않는다.

성공 데이터가 이미 있는데 background refresh가 실패했다면:

```text
successful content 유지
local stale/error state 표시
local retry
```

전체 화면을 Error 상태로 교체하지 않는다.

Image failure는 API failure와 별개로 처리하고
broken browser image icon을 그대로 노출하지 않는다.

---

# 22. Security / Sensitive Data Baseline

다음은 저장/로그하지 않는다.

```text
password / credential
token
full address
contact detail
private customer payload
```

특히 Credential을:

```text
localStorage
sessionStorage
query cache
logs
ReservationDraft
```

에 넣지 않는다.

Auth token의 실제 저장 방식은
Auth contract가 닫힌 뒤 Backend contract를 따른다.

---

# 23. Cross-Repository Contract Change Procedure

Shared Contract 변경이 필요한 경우:

```text
Frontend 구현 중 gap 발견
→ 관련 H-ID / Requirement / Screen 기록
→ docs 변경 제안
→ 영향 Repository 확인
→ 팀 합의
→ docs/main 승인
→ Frontend adapter/UI 반영
```

공통 계약 변경보다 Frontend 구현이 먼저 나가면 안 된다.

---

# 24. STOP Conditions

다음 조건에서는 해당 기능의 실제 integration 구현을 중단한다.

- Docs와 Code가 충돌함
- 필요한 endpoint가 Shared API에 없음
- Request/Response field를 추측해야 함
- Business Rule을 만들어야 함
- Theme와 TourProduct 관계를 1:1로 가정해야 함
- participantCount default/UX를 추측해야 함
- Honeymoon participantCount의 UI/default/max/API 표현을 추측해야 함
- Auth/session/token 방식이 필요하지만 계약이 없음
- Price/Discount 계산을 Frontend에서 만들어야 함
- Reservation status를 임의로 정의해야 함
- History pagination/detail API가 필요하지만 계약이 없음
- Voice payload를 추측해야 함

이 경우 화면 전체 개발을 중단하는 것이 아니라
계약에 의존하는 부분만 Gate 뒤에 둔다.

---

# 25. CONTINUE Conditions

다음은 Contract gap이 있어도 계속 진행한다.

- visual layout
- responsive transformation
- accessibility behavior
- shared primitive
- motion primitive
- loading/error/empty/retry UI
- Frontend View Model
- adapter interface
- Mock DataSource
- state harness
- test harness
- contract-independent route composition

목표는 계약 불확실성을 이유로 Frontend 전체 개발을 막지 않되,
불확실성을 production truth로 숨기지 않는 것이다.

---

# 26. Scope Boundary for Current Implementation Program

현재 구현 프로그램의 Customer flow는 다음을 목표로 한다.

```text
Theme
→ TourProduct
→ TourStyle
→ TourSchedule
→ TourConfiguration
→ Review
→ Reservation
```

추가 Customer functionality:

```text
Login
Signup
Reservation Detail
Previous Trips Popup
My Trips / Travel History
Voice integration point
```

현재 범위 밖:

```text
Payment
Refund
Cancellation feature
Employee Console
Backend admin UI
free-form AI recommendation
real external hotel/air booking
```

---

# 27. Baseline Non-Functional Requirements

Shared NFR:

```text
NFR-01 Voice 주요 명령 인식 성공률 >= 90%
NFR-02 회원/Reservation/Travel History/Inventory 저장·조회 정확도 = 100%
NFR-03 Employee Console 정의된 핵심 기능 = 100%
NFR-04 통합 시나리오 10개 중 9개 이상 성공
NFR-05 주요 Backend 요청 응답시간 <= 3초
NFR-06 Unit Test + 주요 사용자 시나리오 Integration Test 수행
```

Frontend 구현은 특히 NFR-04, NFR-05, NFR-06을 고려한다.

단, Backend가 3초 이내를 목표로 한다는 이유로
Frontend가 3초 동안 blank 화면을 허용하는 것은 아니다.

---

# 28. Git / Delivery Baseline

Shared `CONTRIBUTING.md`에 따라:

```text
Backlog
→ In Progress
→ Review
→ Done
```

기본 흐름을 따른다.

구현은 Issue 단위로 나눈다.

기능별 Branch에서 작업한다.

`main` 직접 수정은 최소화한다.

PR에는 최소 다음을 기록한다.

```text
change summary
related Requirement IDs
affected screens/flows
Backend API endpoints used
contract assumptions/gates
tests
responsive checks
accessibility checks
impact scope
related Issue
```

AI-generated work도 동일한 Issue/Branch/PR/Test 절차를 따른다.

---

# 29. CP0 Decisions

## CP0-D01

`WonhoOne/docs/main`에 존재하는 최신 Approved Baseline인 v0.1.2를
공통 구현 계약의 최상위 실행 기준으로 사용한다.

## CP0-D02

Frontend planning은 Shared Contract를 대체하지 않고
Shared Contract를 UX/Implementation으로 번역한다.

## CP0-D03

`Theme 1:N TourProduct`를 강제한다.
Theme를 `tourId`로 사용할 수 없다.

## CP0-D04

Honeymoon couple/team semantics는 v0.1.2에서 확정됐다.

```text
participantCount >= 2 and even
coupleCount = participantCount / 2
Schedule confirms at total derived coupleCount >= 2
```

단 `Couple`/`Team`은 별도 Shared Entity가 아니며
API가 `coupleCount` field를 제공한다고 가정하지 않는다.

## CP0-D05

General/Honeymoon의 participantCount validity는 확정됐지만
Frontend 입력 위치/default/max/가격·옵션 영향/request shape는 Contract Gate로 유지한다.

## CP0-D06

Auth는 mechanism/DTO/token/session contract가 닫히기 전
visual shell과 interface까지만 구현 가능하다.

## CP0-D07

Price와 Loyalty Discount는 Backend-owned truth다.
Frontend calculation engine을 만들지 않는다.

## CP0-D08

v0.1.2에서도 유지되는 Approved API skeleton에 없는 endpoint를 Frontend가 만들지 않는다.

## CP0-D09

Mocks는 Frontend View Model boundary 뒤에서 사용하며
Mock shape를 Backend DTO로 취급하지 않는다.

## CP0-D10

Raw Backend DTO를 page/visual component에 노출하지 않는다.

## CP0-D11

Cross-repository 수정은 explicit delegation이 없으면 금지한다.

## CP0-D12

Contract gap은 해당 integration만 block하고
contract-independent UI/architecture work는 계속 진행한다.

---

# 30. Explicitly Deferred to Later Checkpoints

CP0에서 결정하지 않고 다음 CP에서 상세화할 항목:

## CP1

```text
Human-readable code definition
comment policy
naming
function/component readability
abstraction threshold
AI-generated code anti-pattern
code review readability rules
```

## CP2

```text
exact directory conventions
feature public API rules
component ownership
dependency direction enforcement
```

## CP3

```text
query ownership
ReservationDraft exact shape
persistence/versioning/migration
state machine details
```

## CP4

```text
Foundation PR exact implementation units
design tokens
shared primitive contracts
motion implementation
test harness setup
```

## CP5

```text
IMP-0 ~ IMP-7 detailed roadmap
screen-by-screen execution order
checkpoint acceptance
```

## CP6

```text
each Contract Gate's concrete adapter strategy
Mock → Real API transition procedure
```

## CP7

```text
unit/component/integration/E2E/visual/a11y matrix
release test gates
```

## CP8

```text
Issue/Branch/Commit/PR operating rules
Definition of Done
review evidence
```

## CP9

```text
all-plan cross audit
contradiction check
final master plan assembly
```

---

# 31. CP0 Completion Checklist

## Baseline

- [x] Current Frontend implementation handoff rechecked
- [x] Current Frontend `main` baseline identified
- [x] Current Shared Docs `main` baseline identified
- [x] latest approved baseline v0.1.2 verified
- [x] Mandatory Shared Docs reviewed
- [x] ERD skeleton included in baseline review

## Scope

- [x] Frontend responsibilities defined
- [x] Frontend non-responsibilities defined
- [x] Cross-repository boundary defined
- [x] Customer implementation scope defined
- [x] Out-of-scope features defined

## Shared Contract

- [x] Theme values fixed
- [x] TourStyle values fixed
- [x] Theme vs TourProduct distinction fixed
- [x] TourStyle vs TourConfiguration distinction fixed
- [x] participantCount shared rule fixed
- [x] Schedule confirmation rule fixed
- [x] Travel History minimum semantics fixed
- [x] Loyalty details left TBD
- [x] API skeleton recorded
- [x] unapproved endpoint invention prohibited

## Contract Safety

- [x] H-01 Theme/TourProduct gate recorded
- [x] H-02 participantCount UX gate recorded
- [x] H-03 Honeymoon semantics closure in v0.1.2 recorded
- [x] H-04 Auth gate recorded
- [x] H-05 TourProduct DTO gate recorded
- [x] H-06 TourSchedule DTO gate recorded
- [x] H-07 Configuration/Options gate recorded
- [x] H-08 Reservation DTO/Error/Status gate recorded
- [x] H-09 Price/Loyalty gate recorded
- [x] H-10 Travel History DTO gate recorded
- [x] STOP/CONTINUE rules defined

## Implementation Boundary

- [x] Backend DTO → Adapter → Frontend Model → UI boundary fixed
- [x] Mock boundary fixed
- [x] Server/Transaction/Ephemeral state classes recognized
- [x] Backend final business authority preserved
- [x] sensitive-data baseline recorded

---

# 32. CP0 Exit Status

```text
CP0 — IMPLEMENTATION BASELINE
STATUS: COMPLETE
```

CP0 결과:

```text
Approved source hierarchy        LOCKED
Frontend scope                   LOCKED
Cross-repository boundary        LOCKED
Fixed shared domain/rules        LOCKED
REST endpoint skeleton           LOCKED
Contract-gated areas             IDENTIFIED
Honeymoon v0.1.2 semantics       RECONCILED / LOCKED
Mock/Adapter boundary            LOCKED
STOP / CONTINUE conditions       LOCKED
```

현재 상태에서는
Shared Contract를 추측하지 않는다는 전제 아래
Frontend Foundation 및 Mock-backed 구현 계획을 계속 작성할 수 있다.

---

# 33. Handoff to CP1

다음 Checkpoint:

```text
CP1 — CODE QUALITY STANDARDS
```

CP1의 주요 목표는 사용자의 구현 품질 요구사항을
Repository-level coding standard로 바꾸는 것이다.

반드시 정의할 항목:

```text
"사람이 읽기 좋은 코드"의 구체적 의미
파일/폴더/식별자 naming
함수와 Component 책임 크기
Page / Feature / Hook readability
early return / nesting policy
abstraction threshold
duplication vs abstraction 판단 기준
TypeScript readability rules
JSX readability rules

Comment-heavy documentation policy
exported Component / Hook / Adapter / Model 주석 기준
WHY / CONTRACT / INVARIANT / EDGE CASE 설명 기준
Contract Gate comment format
CSS workaround comment policy
async/race/cache lifecycle comments
test comments
한국어/영어 사용 기준
주석 유지보수 Definition of Done

AI-generated code anti-pattern
human review checklist
```

CP1은 CP0의 Contract Boundary를 변경하지 않는다.