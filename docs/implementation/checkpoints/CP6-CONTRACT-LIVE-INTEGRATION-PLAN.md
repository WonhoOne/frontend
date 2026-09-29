# Mister World Frontend — CP6 Contract & Live Integration Plan

> Status: **COMPLETE**  
> Checkpoint: **CP6 — Contract & Live Integration Plan**  
> Date: **2026-09-29**  
> Target repository: `WonhoOne/frontend`  
> Shared SSOT: `WonhoOne/docs/main`  
> Shared baseline: **v0.1.2**  
> Shared docs commit reviewed: `46fd61af7dc0ac4770305e7088c4e4ded9b78892`  
> Backend repository reviewed: `WonhoOne/backend/main`  
> Backend commit reviewed: `44f9882485a36a849e84c1c63225b09fc655864c`  
> Depends on:
> - `CP0-IMPLEMENTATION-BASELINE.md`
> - `CP1-CODE-QUALITY-STANDARDS.md`
> - `CP2-FRONTEND-ARCHITECTURE-PLAN.md`
> - `CP3-STATE-DATA-ARCHITECTURE.md`
> - `CP4-FOUNDATION-IMPLEMENTATION-PLAN.md`
> - `CP5-IMPLEMENTATION-ROADMAP.md`
>
> Next checkpoint: **CP7 — QA & Test Plan**

---

# 1. Purpose

CP6의 목적은 Mister World Frontend가
**Mock-backed 구현에서 실제 Backend integration으로 넘어가기 위한 조건을
endpoint / DTO / error / auth / adapter 단위로 잠그는 것**이다.

이 문서 이후 구현자는 다음을 구분할 수 있어야 한다.

```text
공유 의미가 확정됐는가?
REST path/method가 확정됐는가?
Request/Response DTO가 확정됐는가?
Backend endpoint가 실제 구현됐는가?
Frontend Adapter를 작성해도 되는가?
Mock에서 Real로 전환해도 되는가?
```

중요:

> **Contract readiness와 Backend implementation readiness는 다른 개념이다.**

REST path가 문서에 고정되어 있어도
DTO와 실제 Controller가 없으면
Frontend live integration은 아직 불가능하다.

---

# 2. Sources Reviewed

## Shared SSOT

현재 승인 기준:

```text
WonhoOne/docs/main
latest baseline: v0.1.2
```

검토:

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
architecture/voice-contract.md
```

## Backend

검토 기준:

```text
WonhoOne/backend/main
44f9882485a36a849e84c1c63225b09fc655864c
```

검토:

```text
AGENTS.md
README.md
docs/backend-bootstrap.md
docs/domain-foundation.md

domain/Customer.java
domain/Reservation.java
domain/TourProduct.java
domain/TourSchedule.java
domain/TourStylePolicy.java

application/TourScheduleReservationService.java
application/port/SmsSender.java

domain/application tests
```

---

# 3. Current Backend Reality

현재 Backend는 다음 단계다.

```text
Spring Boot bootstrap
+
pure Java domain foundation
+
domain/application tests
+
CI
```

현재 존재:

```text
Theme / TourStyle catalogs
Customer minimal record
TourProduct minimal domain
Reservation participantCount
TourSchedule aggregation
Honeymoon pair validation
confirmation threshold
TourStyle eligibility
first-confirmation application service
SmsSender port
```

현재 존재하지 않음:

```text
@RestController
public REST endpoint implementation
Request DTO
Response DTO
API error response
JPA Entity / Repository
MySQL persistence implementation
Authentication / Spring Security
JWT/session
TourConfiguration persistence
Travel History implementation
Reservation status model
price calculation
Loyalty calculation
real SMS provider
```

따라서 현재 Backend와
Frontend가 **실제로 HTTP 통신할 수 있는 Product endpoint는 없다.**

---

# 4. Readiness Dimensions

각 Integration은 세 축으로 판정한다.

## C — Contract Readiness

```text
CLOSED
PARTIAL
BLOCKED
```

### CLOSED

Frontend가 구현에 필요한 public meaning과 shape가 충분히 승인됨.

### PARTIAL

Domain/path 일부는 승인됐지만
DTO/UX/field/error 등 실제 integration 요소가 열려 있음.

### BLOCKED

Frontend가 추측해야만 구현 가능한 핵심 계약이 남음.

## B — Backend Implementation Readiness

```text
IMPLEMENTED
PARTIAL
NOT IMPLEMENTED
```

## F — Frontend Live Integration Readiness

```text
READY
NOT READY
```

Frontend `READY`가 되려면:

```text
Contract sufficient
AND
Backend endpoint implemented
AND
Integration tests possible
```

이어야 한다.

---

# 5. Current High-Level Verdict

```text
Shared Domain semantics       PARTIALLY READY
REST paths/methods            READY
API DTOs                      NOT READY
Auth contract                 NOT READY
Backend REST implementation   NOT READY
Persistence                   NOT READY
Frontend live integration     NOT READY
Mock-backed Frontend          READY
```

현재 live endpoint count:

```text
0
```

---

# 6. H-Gate Status — v0.1.2

CP0~CP5의 H-family를 현재 기준으로 재분류한다.

| ID | Topic | Current status | Reason |
|---|---|---|---|
| H-01 | Theme ↔ TourProduct | **PARTIAL** | `Theme 1:N TourProduct`는 CLOSED, TourProduct DTO/Theme-to-product UX data는 open |
| H-02 | `participantCount` | **PARTIAL** | domain validity CLOSED, UI placement/default/max/API representation open |
| H-03 | Honeymoon couple/team semantics | **CLOSED** | v0.1.2에서 `>=2 even`, `/2`, 2 couples confirmation 승인 |
| H-04 | Authentication | **BLOCKED** | credential/DTO/JWT-session/token/protection open |
| H-05 | TourProduct DTO | **BLOCKED** | fields/nullable/list shape open |
| H-06 | TourSchedule DTO | **BLOCKED** | period/availability/recruitment/status fields open |
| H-07 | Configuration/options | **BLOCKED** | option identity/catalog/compatibility/API absent |
| H-08 | Reservation API DTO/error/status | **BLOCKED** | path만 fixed, DTO/error/status open |
| H-09 | Price / Loyalty | **BLOCKED** | formula/representation/discount rules open |
| H-10 | Travel History DTO | **BLOCKED** | minimum meaning only fixed, response fields/order key open |

추가 cross-system gates:

```text
X-01 SMS provider/delivery policy
X-02 Voice final payload/command parameters
X-03 Frontend baseline-document drift
```

---

# 7. H-01 — Theme ↔ TourProduct

## Closed

```text
Theme is category
Theme 1:N TourProduct
TourProduct is employee-managed actual product
/api/v1/tours means TourProduct
{tourId} is TourProduct identity
```

## Still Open

Frontend가 실제 data-driven discovery를 구현하려면 최소:

```text
TourProduct ID
Theme
product name
display/basic information
image/display metadata if API-owned
list ordering/grouping semantics if relevant
```

이 필요하다.

## Frontend Rule

허용:

```text
Theme-first UX
multiple TourProduct fixtures per Theme
TourProduct ID route
```

금지:

```text
Theme enum value를 tourId로 사용
Theme 1:1 TourProduct hardcode
```

Status:

```text
PARTIAL
```

---

# 8. H-02 — participantCount

## Closed

General Reservation:

```text
participantCount integer >= 1
```

Honeymoon Reservation:

```text
participantCount integer >= 2
participantCount is even
```

## Still Open

```text
UI placement
default
maximum
schedule capacity
price effect
option availability effect
request field representation
```

## Frontend Rule

Draft:

```text
participantCount: null
```

로 시작.

금지:

```text
General default 1
Honeymoon default 2
```

를 팀 결정 없이 자동 주입.

Status:

```text
PARTIAL
```

---

# 9. H-03 — Honeymoon Couple Semantics

v0.1.2로 CLOSED.

Approved:

```text
1 couple/team = 2 participants
valid Honeymoon participantCount >= 2 and even
coupleCount = participantCount / 2
Honeymoon schedule confirms at >= 2 derived couples/teams
```

또한:

```text
Couple Entity 없음
Team Entity 없음
```

Frontend 사용:

```text
valid input presentation
2 couples/teams recruitment wording
```

Frontend 금지:

```text
separate Couple persistence model
API coupleCount field 추측
final Schedule confirmation 독립 판정
```

Status:

```text
CLOSED
```

---

# 10. H-04 — Authentication

Fixed endpoint skeleton:

```http
POST /api/v1/auth/signup
POST /api/v1/auth/login
```

## Missing Public Contract

```text
login identifier
credential fields
signup request
login request
signup response
login response
auth mechanism
JWT vs session
cookie/token format
token lifetime
refresh behavior
session expiry
logout behavior
protected-route policy
reservation auth requirement
401 response shape
```

## Backend Reality

현재:

```text
Spring Security 없음
Auth Controller 없음
Auth DTO 없음
persistence 없음
```

## Frontend Until Closure

가능:

```text
Auth shell
loading/error states
ReturnContext
mock auth
401 recovery UX
```

금지:

```text
localStorage token
refresh token
cookie assumption
JWT parser
/logout endpoint
```

Status:

```text
Contract: BLOCKED
Backend: NOT IMPLEMENTED
Frontend live: NOT READY
```

---

# 11. H-05 — TourProduct DTO

Fixed endpoints:

```http
GET /api/v1/tours
GET /api/v1/tours/{tourId}
```

## Contract Missing

최소 필요한 response shape:

```text
tourId
Theme
product name
display/basic information
optional/nullable semantics
list shape
not-found behavior
```

## Backend Reality

현재 `TourProduct` domain은:

```text
Theme
```

만 가진 minimal record다.

REST Controller/Repository 없음.

## Frontend Until Closure

Mock:

```text
TourCardModel
TourDetailModel
```

을 사용.

API-style fake DTO는 만들지 않는다.

Status:

```text
Contract: BLOCKED
Backend: NOT IMPLEMENTED
Frontend live: NOT READY
```

---

# 12. H-06 — TourSchedule DTO

Fixed endpoints:

```http
GET /api/v1/tour-schedules
GET /api/v1/tour-schedules/{scheduleId}
```

## Domain Already Implemented Internally

현재 Backend domain에는:

```text
TourProduct relation
Reservations
totalParticipantCount
confirmed
Honeymoon pair validation
confirmation transition
```

이 존재한다.

그러나 public REST representation이 아니다.

## Contract Missing

Frontend needs:

```text
scheduleId
TourProduct linkage
period
availability/selectability
recruitment presentation source
confirmation/status representation
capacity if applicable
```

중요:

Frontend가 Backend 내부 `TourSchedule` class shape를
public API contract로 간주하면 안 된다.

Status:

```text
Contract: BLOCKED
Backend domain: PARTIAL
Backend REST: NOT IMPLEMENTED
Frontend live: NOT READY
```

---

# 13. H-07 — TourConfiguration / Options

Shared meaning fixed:

```text
TourStyle
Hotel
Transport
Meal
Extras
```

Product Catalog fixed 일부:

```text
Style defaults
Champagne/Coffee additional food/beverage concept
Theme included offerings
```

## Missing

```text
Option IDs
Option catalog
selected option representation
compatibility
availability
defaults vs replacements
extras representation
validation
API endpoint/embedding location
```

중요:

현재 API skeleton에는:

```text
/options
/configuration
/validate
```

endpoint가 없다.

## Frontend Until Closure

Mock View Model:

```text
ConfigurationOptionModel
OptionGroupModel
TripSummaryModel
```

가능.

금지:

```text
/api/v1/options
/api/v1/configuration/validate
```

발명.

Status:

```text
Contract: BLOCKED
Backend: NOT IMPLEMENTED
Frontend live: NOT READY
```

---

# 14. H-08 — Reservation API

Fixed:

```http
POST /api/v1/reservations
GET /api/v1/reservations/{reservationId}
```

## Shared Meaning Closed

```text
Reservation relates Customer and TourSchedule
participantCount domain rule
TourConfiguration concept
Backend final validation authority
```

## Backend Domain Existing

현재:

```text
Reservation(Customer, participantCount)
TourSchedule.addReservation
TourScheduleReservationService
```

가 존재한다.

하지만:

```text
Reservation ID 없음
TourSchedule ID 없음
persistence 없음
Controller 없음
DTO 없음
status 없음
```

## Missing Public Contract

POST:

```text
request fields
TourSchedule identity field
TourConfiguration representation
participantCount representation
customer identity/auth linkage
response
reservation identity
```

GET:

```text
detail response
status representation
price/configuration representation
recruitment information
```

Error:

```text
400/401/409/422 distinction
validation payload
conflict payload
error code
field path
correlation ID if any
```

Status:

```text
Contract: BLOCKED
Backend domain: PARTIAL
Backend REST: NOT IMPLEMENTED
Frontend live: NOT READY
```

---

# 15. Reservation Error Contract Requirement

Frontend는 다음 UX를 이미 설계했다.

```text
401 → Auth interruption
409 → changed truth / reconfirm
422 → field/section correction
5xx → preserve Draft
ambiguous network → no blind retry
```

따라서 Backend v0.2 error contract는
최소한 이 분기를 안정적으로 할 수 있어야 한다.

권장 shared contract need:

```text
HTTP status
stable error code
message optional
field errors optional
conflict/current truth optional
request/correlation ID optional
```

Frontend가 raw human message string을
business routing key로 사용하면 안 된다.

---

# 16. Reservation Ambiguous Outcome

POST가 Backend까지 도달했는지
Client가 확정하지 못하는 경우가 있다.

예:

```text
request sent
server potentially committed
response lost
```

Frontend rule:

```text
automatic retry = 0
Draft 유지
blind retry 금지
```

Live release 전에 Backend와 다음 중 하나를 협의하는 것이 강하게 권장된다.

```text
idempotency key
client request ID
reservation lookup/reconciliation path
safe duplicate-prevention contract
```

현재 shared contract에는 없다.

Frontend가 임의 protocol을 만들지 않는다.

Tracking:

```text
INTEGRATION-GAP-R01
```

---

# 17. H-09 — Price

Shared requirement에는 가격 표시/History price가 존재하지만
price calculation contract는 TBD다.

## Missing

```text
currency representation
base price
configuration delta
participant effect
discount application
rounding
final total
price freshness/revalidation
```

## API Skeleton

현재 dedicated endpoint 없음.

따라서 금지:

```text
/api/v1/price
/api/v1/reprice
```

발명.

Price는 향후:

```text
Tour/Configuration/Reservation response 안에 포함
또는
공식 endpoint 추가
```

중 어떤 방식인지 Shared Contract가 정해야 한다.

Frontend:

```text
PriceDisplayModel
```

만 유지하고 계산하지 않는다.

Status:

```text
BLOCKED
```

---

# 18. H-09 — Loyalty Discount

Functional requirement:

```text
Loyalty Discount exists
```

Still TBD:

```text
eligibility
rate
application timing
stacking
```

Frontend 구조는:

```text
subtotal
discount line optional
final total
```

을 수용 가능하게 한다.

단 실제 discount가 Backend에서 내려오기 전:

```text
discount amount
eligibility badge
percent
```

를 생성하지 않는다.

Status:

```text
BLOCKED
```

---

# 19. H-10 — Travel History

Fixed:

```http
GET /api/v1/customers/me/travel-history
```

Shared meaning:

```text
authenticated customer
recent-first
product
period
TourStyle
price
```

## Missing

```text
response field names
canonical date fields
item ID
Theme/image metadata
pagination
nullable semantics
error response
```

## Backend Reality

현재:

```text
TravelHistory implementation 없음
persistence 없음
Controller 없음
```

Frontend:

```text
Previous Trips Popup
My Trips
TravelHistoryItemModel
shared Query Cache
```

를 Mock으로 구현 가능.

금지:

```text
history detail route
?page=
cursor=
```
발명.

Status:

```text
Contract: BLOCKED
Backend: NOT IMPLEMENTED
Frontend live: NOT READY
```

---

# 20. SMS Boundary

Shared:

```text
first TourSchedule confirmation
→ actual SMS to applicant customers
```

Backend internal:

```text
SmsSender port 존재
first-confirmation application call 존재
```

현재 없음:

```text
real SMS provider
retry/failure policy
delivery persistence
```

Frontend public API:

```text
별도 SMS endpoint 없음
```

Frontend가 안전하게 말할 수 있는 것:

```text
출발 확정 시 SMS 알림
```

Frontend가 말하면 안 되는 것:

```text
SMS 발송 완료
```

Backend가 실제 delivery status를 공개하지 않는 한 금지.

---

# 21. Voice Boundary

Current shared direction:

```text
Speech
→ STT
→ predefined command
→ GUI state update and/or Backend
→ Backend validation
```

Candidate commands는 존재하지만
final list/parameters는 TBD.

Frontend rule:

```text
Voice event
→ integrations/voice adapter
→ voice-bridge
→ existing Feature action
```

Final payload 없이는
IMP-7 실제 integration 금지.

Status:

```text
PARTIAL / STAGE-2 BLOCKED
```

---

# 22. Endpoint Readiness Matrix

## Customer-facing endpoints

| Endpoint | Path/method contract | DTO contract | Backend implementation | FE live readiness |
|---|---|---|---|---|
| `POST /api/v1/auth/signup` | CLOSED | BLOCKED | NOT IMPLEMENTED | NOT READY |
| `POST /api/v1/auth/login` | CLOSED | BLOCKED | NOT IMPLEMENTED | NOT READY |
| `GET /api/v1/tours` | CLOSED | BLOCKED | NOT IMPLEMENTED | NOT READY |
| `GET /api/v1/tours/{tourId}` | CLOSED | BLOCKED | NOT IMPLEMENTED | NOT READY |
| `GET /api/v1/tour-schedules` | CLOSED | BLOCKED | NOT IMPLEMENTED | NOT READY |
| `GET /api/v1/tour-schedules/{scheduleId}` | CLOSED | BLOCKED | NOT IMPLEMENTED | NOT READY |
| `POST /api/v1/reservations` | CLOSED | BLOCKED | NOT IMPLEMENTED | NOT READY |
| `GET /api/v1/reservations/{reservationId}` | CLOSED | BLOCKED | NOT IMPLEMENTED | NOT READY |
| `GET /api/v1/customers/me/travel-history` | CLOSED | BLOCKED | NOT IMPLEMENTED | NOT READY |

현재:

```text
9 customer endpoint paths fixed
0 live implementations
0 FE integration-ready endpoints
```

---

# 23. Endpoint Does Not Exist ≠ Frontend Should Create One

현재 Screen UX에서 필요해 보일 수 있지만
Shared API에는 없는 예:

```text
GET /api/v1/themes
GET /api/v1/options
POST /api/v1/configuration/validate
POST /api/v1/price
GET /api/v1/current-reservations
GET /api/v1/history/{id}
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/sms
```

Frontend는 사용하지 않는다.

정말 필요하면:

```text
docs contract proposal
→ team agreement
→ Backend implementation
→ Frontend integration
```

순서다.

---

# 24. Contract Closure Definition

어떤 endpoint가 Frontend integration-ready가 되려면
최소 다음이 필요하다.

```text
1. Shared docs/main에 DTO contract merge
2. Request/Response example
3. required/optional/null semantics
4. enum/value contract
5. relevant error statuses/codes
6. Backend main implementation
7. Backend tests
8. Frontend-accessible dev/test environment or reproducible local server
```

Path/method만으로는 integration-ready가 아니다.

---

# 25. Contract Snapshot Rule

PR-09 Live Integration 시작 시
반드시 다음을 기록한다.

```text
Shared docs commit SHA
Backend commit SHA
API contract version/baseline
```

예:

```text
docs: <sha>
backend: <sha>
```

PR 진행 중 contract가 바뀌면
조용히 맞추지 않는다.

변경 영향 확인 후
snapshot을 갱신한다.

---

# 26. Backend Code Is Not Shared Contract

Frontend는 Backend 코드를 읽어
integration 준비를 할 수 있다.

하지만 다음은 금지다.

```text
Java field 이름을 DTO field로 추정
domain record를 Response DTO로 추정
private method semantics를 public API contract로 간주
```

예:

현재 Backend:

```java
Reservation(Customer customer, int participantCount)
```

이 있다고 해서 Frontend가:

```json
{
  "customer": {...},
  "participantCount": 2
}
```

를 POST shape로 확정하면 안 된다.

---

# 27. Integration Layer Target Structure

PR-09 시점 예상:

```text
src/integrations/backend/
├── client/
│   ├── backendClient.ts
│   ├── backendError.ts
│   └── ...
├── contracts/
│   ├── auth.contract.ts
│   ├── tour.contract.ts
│   ├── schedule.contract.ts
│   ├── reservation.contract.ts
│   └── travelHistory.contract.ts
├── adapters/
│   ├── mapTourProductDto.ts
│   ├── mapTourScheduleDto.ts
│   ├── mapReservationDto.ts
│   └── mapTravelHistoryDto.ts
└── dataSources/
    └── ...
```

실제 파일은
닫힌 계약에 필요한 만큼만 생성한다.

---

# 28. `contracts/` Rule

`contracts/`에 넣을 수 있는 타입은:

```text
docs/main에서 승인된 Request/Response
또는 Backend가 그 승인 계약을 구현한 public DTO
```

뿐이다.

금지:

```text
"아마 이럴 것" interface
screen fixture
domain View Model
```

---

# 29. Runtime Validation Policy

외부 HTTP payload는
TypeScript type annotation만으로 신뢰하지 않는다.

Critical DTO는 runtime validation을 한다.

우선:

```text
Auth response
TourProduct
TourSchedule
Reservation
Travel History
```

Validation 실패:

```text
ContractMappingError
```

현재 DTO가 없기 때문에
PR-01~PR-08에서 schema library를 설치하지 않는다.

PR-09에서 DTO가 실제 존재할 때
Zod 또는 동등한 validator 도입 여부를 결정한다.

원칙:

> dependency를 먼저 고르지 말고 contract를 먼저 본다.

---

# 30. Mapping Boundary

정상 flow:

```text
raw JSON
→ runtime decode/validate
→ Approved DTO
→ Adapter
→ Frontend Model
→ Feature
```

금지:

```text
response.json()
→ Page
```

---

# 31. Adapter Responsibilities

Adapter가 해도 되는 것:

```text
field rename
optional normalization
date/string presentation input conversion
API enum → Frontend semantic value
safe derived presentation
```

Adapter가 하면 안 되는 것:

```text
Business Rule invention
navigation
toast
price calculation
Auth storage
Query invalidation
```

---

# 32. ContractMappingError

발생 조건:

```text
HTTP success
but payload cannot satisfy approved DTO/model mapping
```

구조 개념:

```text
category
resource
safe reason
field path optional
correlation ID optional
cause
```

금지:

```text
raw private payload 전체 log
```

UI:

```text
Feature-local data error
retry if safe
```

---

# 33. Error Contract Mapping

Frontend normalized errors:

```text
NetworkError
UnauthorizedError
NotFoundError
ValidationError
ConflictError
ServerError
ContractMappingError
UnknownError
```

Backend가 stable error code를 제공하면
HTTP status + code를 기준으로 mapping한다.

금지:

```text
message.includes("expired")
```

같은 human string parsing.

---

# 34. 401 Contract

Auth integration 전에 최소 필요:

```text
어떤 endpoint가 auth 필요인가
unauthenticated response status
session/token invalid response
Login success 이후 session establishment
```

Frontend flow:

```text
401
→ private query/mutation handling
→ Draft 유지
→ Login
→ ReturnContext
```

---

# 35. 409 Contract

409는 단순 “서버 에러”가 아니다.

Frontend가 필요한 정보:

```text
what changed
what is current truth
which selection is invalid
whether price changed
whether schedule unavailable
```

Backend가 detail을 제공하지 않는다면
Frontend는 conflict 후 relevant GET을 refetch해서
최신 truth를 비교할 수 있어야 한다.

이 flow도 contract에 맞춰 결정한다.

---

# 36. 422 Contract

Frontend가 inline validation을 하려면
최소:

```text
stable code
field/section path
reason
```

중 충분한 mapping 정보가 필요하다.

없으면 generic validation error만 가능하다.

Frontend가 Backend message text를
field mapping key로 사용하지 않는다.

---

# 37. 404 Contract

Known route + missing resource:

```text
TourProduct
TourSchedule
Reservation
```

는 404로 안정적으로 구분 가능해야 한다.

Frontend 자동 retry 없음.

---

# 38. 5xx / Network

5xx:

```text
GET → at most one transient retry
Mutation → no automatic retry
```

Network:

```text
existing cache preserve
Draft preserve
```

---

# 39. Query Integration Rule

Mock-backed Feature query와
Real Backend query는 동일한 Frontend Model을 반환해야 한다.

예:

```text
MockTourDetailDataSource
BackendTourDetailDataSource

both
→ TourDetailModel
```

Page는 어느 source인지 몰라야 한다.

---

# 40. Mock-to-Real Switchover Process

각 Resource별로 다음 절차를 따른다.

## Step 1 — Contract Freeze

```text
docs/main approved contract
```

확인.

## Step 2 — Backend Verify

```text
endpoint exists
backend tests pass
```

확인.

## Step 3 — Contract Type

`integrations/backend/contracts`에
approved DTO 표현.

## Step 4 — Runtime Decode

외부 payload validate.

## Step 5 — Adapter

DTO → existing Frontend Model.

## Step 6 — Backend DataSource

Feature port 구현.

## Step 7 — Parity Tests

Mock/Real이
같은 Frontend Model semantics를 제공하는지 확인.

## Step 8 — App Composition Switch

Production:

```text
Backend DataSource
```

Development/Test:

```text
Mock scenario 선택 가능
```

## Step 9 — Failure Tests

실제 contract 기준 401/404/409/422/500 등 검증.

---

# 41. Production Mock Safety

Production build에서
Mock service worker가 자동 시작되면 안 된다.

검증:

```text
VITE_ENABLE_MOCKS
```

는 dev/test 명시 opt-in.

Release QA:

```text
hidden mock path = 0
```

---

# 42. Contract Fixture Evolution

DTO가 승인되기 전 Mock:

```text
Frontend View Model fixture
```

DTO가 승인된 후 API integration test fixture:

```text
Approved DTO fixture
→ Adapter
→ View Model
```

둘을 구분한다.

파일명 예:

```text
mockTourDetailModel.ts
tourProductDto.fixture.ts
```

---

# 43. Auth Switchover

IMP-5 Mock auth:

```text
Frontend AuthState
```

IMP-6 real auth:

```text
Approved Auth DTO
→ AuthDataSource
→ AuthState
```

교체 후에도:

```text
ReturnContext
ReservationDraft
Page UI
```

가 변하지 않는 것이 목표다.

---

# 44. Reservation Switchover

Mock:

```text
ReservationDataSource.create()
→ mocked result
```

Real:

```text
POST /reservations
→ decoded DTO
→ Adapter
→ same result model
```

Draft lifecycle:

```text
unchanged
```

여야 한다.

---

# 45. History Switchover

Mock:

```text
TravelHistoryItemModel[]
```

Real:

```text
History DTO[]
→ Adapter
→ TravelHistoryItemModel[]
```

S10/S11 component는
변경하지 않는 것이 목표.

---

# 46. Tour/Schedule Switchover

Discovery/Tour Detail도 동일.

Mock fixture를
Backend DTO로 “변형”해서 재사용하지 않는다.

새 DTO fixture를 만든다.

---

# 47. Integration Test Layers

## Adapter Unit Test

```text
valid DTO → expected Model
optional data
invalid enum
malformed field
```

## HTTP Client Test

```text
status mapping
network failure
abort
credentials/header behavior
```

## DataSource Integration Test

MSW actual-approved DTO:

```text
HTTP
→ decode
→ adapter
→ Model
```

## Feature Integration Test

```text
Query
→ DataSource
→ states
→ UI
```

---

# 48. Backend Contract Verification

Frontend PR-09에서
Backend source를 읽는 것은 허용된다.

검증:

```text
Controller path/method
Request DTO
Response DTO
error handler
security config
```

그러나 docs와 Backend가 다르면:

```text
STOP
```

한다.

조용히 Backend를 따라가지 않는다.

---

# 49. Backend Escalation Rule

Frontend integration 중
Backend 변경 필요 발견:

```text
Frontend does not edit backend.
```

Owner에게 변경 요청.

필수 내용:

```text
Affected endpoint
Shared requirement/BR
Current approved contract
Observed Backend behavior
Frontend impact
Expected behavior
Reproduction
Acceptance criteria
```

---

# 50. Contract Escalation Rule

Shared contract 자체가 부족:

```text
Frontend does not invent.
```

Docs change request에:

```text
Context
Missing decision
Affected repos
Options
Frontend blocker
Required acceptance
```

를 남긴다.

---

# 51. Backend Request Package — TourProduct

Backend/Docs에 필요한 최소 결정:

```text
GET /tours list response
GET /tours/{id} response
tour ID type
Theme representation
product name/basic information
image/display ownership
not-found behavior
list ordering
```

Frontend impact:

```text
S01–S04
```

---

# 52. Backend Request Package — Schedule

필요:

```text
schedule ID
tour linkage
period start/end representation
availability/selectability
recruitment state
participant/couple presentation source
confirmed state
capacity if used
```

Frontend impact:

```text
S03–S07
```

---

# 53. Backend Request Package — Configuration

필요:

```text
where options come from
option identity
Hotel/Transport/Meal/Extras representation
style defaults
compatibility
availability
selected configuration request representation
```

새 endpoint가 필요하면
Shared API docs 변경이 선행돼야 한다.

---

# 54. Backend Request Package — Reservation

필요:

```text
POST request
POST response
GET detail response
reservation ID type
participantCount
TourConfiguration
price
status if exists
401
409
422
idempotency/recovery consideration
```

Frontend impact:

```text
S05–S07
```

---

# 55. Backend Request Package — Auth

필요:

```text
signup fields
login identifier/secret
response
session establishment
JWT vs session
credential transport
expiry
protected endpoints
logout if required
```

Frontend impact:

```text
S05/S07–S11
```

---

# 56. Backend Request Package — History

필요:

```text
product
period
TourStyle
price
recent-order guarantee
canonical date
optional identifier
pagination if any
```

Frontend impact:

```text
S10/S11
```

---
# 57. Backend Request Package — Price/Loyalty

필요:

```text
price authority location
currency/amount format
when price is calculated
participant relationship
option relationship
discount representation
Loyalty eligibility/rate/timing/stacking
```

Frontend never computes the business result.

---

# 58. Current Backend Strengths Relevant to Frontend

현재 Backend에서 이미 좋은 기반으로 확인된 것:

```text
Theme catalog aligned
TourStyle catalog aligned
Theme-specific Style policy
General participantCount invariant
Honeymoon pair invariant
Honeymoon couple derivation
General/Honeymoon schedule confirmation
first-confirmation transition
SmsSender boundary
tests for domain behavior
```

즉 Domain rule foundation은
v0.1.2와 잘 맞는다.

문제는:

```text
public API contract + persistence + auth
```

가 아직 다음 단계라는 점이다.

---

# 59. Backend Internal Detail Frontend Must Ignore

현재 Domain class 구현 세부:

```text
record
List
boolean confirmed
long totalParticipantCount
```

등은 Public Contract가 아니다.

Frontend는 Java implementation type을
TypeScript DTO로 복사하지 않는다.

---

# 60. Live Integration Order

Backend가 단계적으로 구현된다면
Frontend는 다음 순서가 자연스럽다.

```text
1. TourProduct GET
2. TourSchedule GET
3. Reservation GET
4. Travel History GET
5. Reservation POST
6. Auth
7. Configuration/Price as contract closes
```

단 실제 Backend dependency에 따라 바뀔 수 있다.

Auth가 모든 Customer endpoint의 선행조건으로 설계되면
Auth가 더 먼저 와야 한다.

따라서 PR-09 시작 시
Backend의 실제 security dependency를 다시 확인한다.

---

# 61. Integration Should Not Block UI Program

현재 0 live endpoints라고 해서
Frontend 구현을 멈추지 않는다.

계속:

```text
IMP-0~IMP-5 Mock-backed
```

진행 가능.

Live integration은:

```text
IMP-6
```

에서 contract closure에 맞춰 붙인다.

---

# 62. Partial IMP-6 Strategy

모든 endpoint가 동시에 닫히지 않을 수 있다.

허용:

```text
TourProduct live
Schedule live
Reservation mock
```

같은 단계적 전환.

조건:

```text
source가 화면에서 명확히 섞여도 model boundary 유지
Production/demo requirement에 fake live claim 없음
```

Release scope에서는
어떤 resource가 Mock인지 반드시 0이어야 하는지
팀 데모 기준에 따라 명시한다.

기본 release target은:

```text
Customer 핵심 journey에 필요한 data source = real Backend
```

이다.

---

# 63. Mixed Source Safety

일부 Real + 일부 Mock일 때:

```text
Real Tour ID
→ Mock Schedule fixture
```

처럼 identity mismatch가 생길 수 있다.

따라서 DataSource 혼합 시
명확한 fixture mapping layer가 필요하다.

가능하면 하나의 Journey에서는
관련 resource를 함께 live 전환한다.

예:

```text
TourProduct + Schedule
```

---

# 64. Contract Version Tagging

Frontend source comment에
버전 문자열을 곳곳에 하드코딩하지 않는다.

Integration PR description/test fixture header에서:

```text
Contract snapshot: docs@<sha>
```

를 기록한다.

Code는 실제 DTO structure로 self-describing하게 유지한다.

---

# 65. Runtime Config

Real Backend base URL은:

```text
app/config/env
```

에서 관리.

예:

```text
VITE_API_BASE_URL
```

실제 integration 때 추가.

금지:

```text
Component 내부 localhost URL
```

---

# 66. CORS / Credentials

Auth 방식에 따라:

```text
credentials: include
Authorization header
```

등이 달라진다.

H-04 closure 전
HTTP Client에서 하나를 고정하지 않는다.

Backend integration 시
CORS 설정도 함께 실제 환경에서 검증한다.

---

# 67. AbortSignal

GET operation은
Query의 AbortSignal을 HTTP Client에 전달한다.

Backend가 cancellation을 특별히 지원할 필요는 없지만
browser request cancellation/ignore semantics는 유지한다.

Mutation은 사용자가 route를 바꿨다는 이유만으로
서버 처리가 취소됐다고 가정하지 않는다.

---

# 68. Timeout

Backend NFR:

```text
major requests <= 3 seconds
```

Frontend에서
임의 3초 timeout을 바로 걸지는 않는다.

NFR 응답 목표와
Client timeout 정책은 다른 개념이다.

실제 timeout은
integration 환경/infra와 합의해 결정한다.

---

# 69. Date Handling

TourSchedule/History DTO의 date format이 아직 없다.

Frontend 금지:

```text
timestamp라고 가정
ISO라고 가정
timezone 임의 결정
```

v0.2에서 canonical format/timezone semantics 필요.

Adapter가 formatting boundary를 소유한다.

---

# 70. Money Handling

Price representation이 아직 없다.

Frontend 금지:

```text
number = KRW라고 가정
float 계산
comma formatting contract 추측
```

필요 contract:

```text
amount
currency
minor/major unit semantics
```

또는 동등하게 명확한 representation.

---

# 71. ID Handling

ID type도 DTO에서 확정돼야 한다.

Frontend View Model은:

```text
string
```

으로 normalize할 수 있지만
Backend DTO가 number/UUID인지 추측하지 않는다.

Adapter에서:

```text
DTO identity → frontend string identity
```

변환 가능.

---

# 72. Nullability

DTO에서:

```text
absent
null
empty string
0
```

은 다른 의미일 수 있다.

Frontend가 UI 편의를 위해
전부 falsy로 합치지 않는다.

Contract에 optional/null 의미가 필요하다.

---

# 73. Enum Compatibility

Theme/TourStyle은 fixed.

Reservation status 등 future enum은
unknown value를 고려한다.

Runtime decoder:

```text
known enum
unknown → ContractMappingError or safe fallback per contract
```

Frontend가 silently default status를 만들지 않는다.

---

# 74. API Pagination

현재 Customer endpoint의 pagination contract는 없다.

Frontend가:

```text
page
size
cursor
limit
```

을 요청하지 않는다.

Tour list/History에서 필요해지면
Shared API 변경이 필요하다.

---

# 75. Live Integration Acceptance Per Endpoint

한 endpoint integration은
다음 모두 완료 시 DONE이다.

- [ ] docs/main contract exists
- [ ] Backend endpoint exists
- [ ] Backend tests exist
- [ ] DTO types created from approved contract
- [ ] runtime decode exists
- [ ] Adapter exists
- [ ] Adapter tests
- [ ] HTTP/DataSource integration test
- [ ] loading/error/empty behavior verified
- [ ] abort/retry behavior verified where applicable
- [ ] no raw DTO leaks
- [ ] Mock/Real parity checked

---

# 76. Auth Integration Acceptance

추가:

- [ ] no credential persistence leak
- [ ] session establishment works
- [ ] 401 clears private cache appropriately
- [ ] Draft survives auth interruption
- [ ] ReturnContext validated
- [ ] manual resubmit invariant preserved
- [ ] direct protected route behavior verified

---

# 77. Reservation Integration Acceptance

추가:

- [ ] duplicate submit blocked
- [ ] mutation retry = 0
- [ ] 401 flow
- [ ] 409 flow
- [ ] 422 flow
- [ ] 5xx flow
- [ ] ambiguous network flow
- [ ] success clears Draft
- [ ] refresh success route recovery
- [ ] no status invention

---

# 78. Schedule Integration Acceptance

추가:

- [ ] general recruitment display
- [ ] Honeymoon 2-couple display
- [ ] availability
- [ ] stale refresh
- [ ] section-level failure
- [ ] selected schedule invalidation
- [ ] Backend final confirmation authority

---

# 79. History Integration Acceptance

추가:

- [ ] recent-first
- [ ] product
- [ ] period
- [ ] TourStyle
- [ ] price
- [ ] Popup/MyTrips same cache
- [ ] auth error
- [ ] empty
- [ ] no fake detail route

---

# 80. Contract Drift Detection

PR-09 중 다음 상황이면 STOP:

```text
docs says field A
backend returns field B

docs says endpoint path X
controller exposes Y

docs says 409
backend sends generic 400

docs says session
frontend sees bearer JWT implementation
```

해결:

```text
Docs/Backend owner reconciliation
→ approved update
→ Frontend resumes
```

---

# 81. CI Expectations for Live Integration

Frontend CI:

```text
typecheck
lint
unit
component
adapter tests
build
E2E/mock
```

가능하면 integration environment가 있으면:

```text
Backend contract integration suite
```

추가.

Backend unavailable 때문에
Frontend main CI가 항상 깨지는 구조는 피한다.

Live contract tests를 별도 job로 둘 수 있다.

---

# 82. No Direct DB Integration

Frontend:

```text
MySQL 접근 0
```

어떤 contract gap도
DB 직접 읽기로 우회하지 않는다.

---

# 83. No Backend Code Copy

Backend의 Java Business Rule을
Frontend에 복제해서 second source of truth를 만들지 않는다.

Frontend validation은
UX를 위해 최소 mirror 가능.

예:

```text
Honeymoon participantCount even
```

하지만 Backend가 최종 검증한다.

---

# 84. Frontend Documentation Drift

현재 Frontend repository의 기존:

```text
AGENTS.md
implementation handoff
old CP6 audit
```

에는 v0.1.1 기준 문구와
H-03 old conflict가 남아 있다.

현재 실제 SSOT:

```text
v0.1.2
```

따라서 향후 CP 산출물을 Repository에 업로드할 때:

```text
DOC-DRIFT-01
```

로 함께 정리해야 한다.

특히 오래된 문서의:

```text
participantCount / 2 금지
Honeymoon mapping unresolved
```

는 현재 Shared Contract와 충돌하므로
검색/수정 대상이다.

---

# 85. CP6 Endpoint Action Table

| Area | Frontend now | Wait for | Backend owner action |
|---|---|---|---|
| Auth | Mock shell | v0.2 auth contract + implementation | Auth/security/DTO |
| Tour list/detail | Mock Model | DTO + Controller + persistence | Tour API |
| Schedule | Mock Model | DTO + Controller + persistence | Schedule API |
| Configuration | Mock options | public option/config contract | Config API/model |
| Price | Mock display | server price contract | pricing |
| Reservation | Mock mutation harness | DTO/error/Controller/persistence | reservation API |
| History | Mock list | DTO/Controller/query | history API |
| SMS | copy only | real provider/system behavior | provider implementation |
| Voice | no final payload | final command/event contract | ai-console/docs |

---

# 86. Minimum Backend Milestone for First Real Frontend Slice

가장 작은 실제 Frontend slice 후보:

```text
GET /api/v1/tours
GET /api/v1/tours/{tourId}
```

필요:

```text
TourProduct persistence/fixture source
Controller
Response DTO
Theme
product ID
name/basic info
tests
```

이 두 endpoint가 닫히면:

```text
Home/Tours/Tour Detail core
```

의 일부를 Real로 전환할 수 있다.

다음 자연스러운 slice:

```text
TourSchedule GET
```

---

# 87. Reservation Real Slice Is Larger

Reservation POST는 단독으로 닫기 어렵다.

의존:

```text
Customer identity/auth
TourSchedule identity
TourConfiguration
participantCount
price/final validation
error contract
persistence
```

따라서 Backend 구현 순서상
Tour/Schedule read APIs보다 뒤가 자연스럽다.

---

# 88. Integration Escalation Priority

P0:

```text
Auth contract
TourProduct DTO
TourSchedule DTO
Reservation DTO/error
Configuration representation
Price representation
Travel History DTO
```

P1:

```text
participantCount UX placement/default/max
Loyalty details
SMS provider policy
Voice final payload
```

단 participantCount UI는
실제 Reservation flow 마감 전에 P0가 된다.

---

# 89. CP6 Decision Log

## CP6-D01

Contract readiness와 Backend readiness를 별도 판정한다.

## CP6-D02

현재 customer-facing live endpoint는 0개다.

## CP6-D03

v0.1.2로 H-03은 CLOSED다.

## CP6-D04

H-01/H-02는 PARTIAL이다.

## CP6-D05

H-04~H-10 대부분은 live integration 관점에서 BLOCKED다.

## CP6-D06

Backend domain code는 Shared API contract가 아니다.

## CP6-D07

Raw HTTP payload는 runtime validation 후 Adapter를 통과한다.

## CP6-D08

Runtime validation library는 DTO closure 전 설치하지 않는다.

## CP6-D09

Mock→Real은 DataSource boundary에서 교체한다.

## CP6-D10

Component/Page는 source 교체 때문에 바뀌지 않는 것을 목표로 한다.

## CP6-D11

Frontend가 없는 endpoint를 발명하지 않는다.

## CP6-D12

Reservation ambiguous outcome은 recovery contract 전 blind retry하지 않는다.

## CP6-D13

Backend 변경은 Backend owner에게 요청한다.

## CP6-D14

Shared contract gap은 docs change proposal로 올린다.

## CP6-D15

Frontend implementation은 Live API를 기다리지 않고 IMP-0~IMP-5를 계속한다.

---

# 90. CP6 Completion Checklist

## Shared Contract

- [x] v0.1.2 baseline rechecked
- [x] Theme/TourProduct semantics reviewed
- [x] participantCount reviewed
- [x] Honeymoon semantics reviewed
- [x] Auth gap reviewed
- [x] TourProduct DTO gap reviewed
- [x] Schedule DTO gap reviewed
- [x] Configuration gap reviewed
- [x] Reservation gap reviewed
- [x] Price/Loyalty gap reviewed
- [x] Travel History gap reviewed
- [x] SMS boundary reviewed
- [x] Voice boundary reviewed

## Backend Reality

- [x] latest Backend commit checked
- [x] backend AGENTS checked
- [x] domain foundation checked
- [x] public controller availability checked
- [x] persistence availability checked
- [x] auth availability checked
- [x] tests checked
- [x] SMS port checked

## Endpoint Readiness

- [x] signup
- [x] login
- [x] tour list
- [x] tour detail
- [x] schedule list
- [x] schedule detail
- [x] reservation create
- [x] reservation detail
- [x] travel history

## Integration Architecture

- [x] contract snapshot rule
- [x] runtime validation rule
- [x] Adapter rule
- [x] ContractMappingError
- [x] normalized error mapping
- [x] DataSource switchover
- [x] Mock/Real parity
- [x] production mock safety
- [x] partial live integration rule
- [x] drift detection

## Escalation

- [x] backend request rule
- [x] docs contract request rule
- [x] endpoint-specific request packages
- [x] Reservation recovery gap
- [x] frontend docs drift tracking

---

# 91. CP6 Exit Status

```text
CP6 — CONTRACT & LIVE INTEGRATION PLAN
STATUS: COMPLETE
```

Current integration verdict:

```text
Shared baseline                v0.1.2
Backend domain foundation      READY
Backend public REST            NOT IMPLEMENTED
API DTO contracts              BLOCKED
Frontend mock implementation   READY
Frontend live integration      NOT READY
```

Gate status:

```text
H-01 Theme/TourProduct         PARTIAL
H-02 participantCount          PARTIAL
H-03 Honeymoon semantics       CLOSED
H-04 Auth                      BLOCKED
H-05 TourProduct DTO           BLOCKED
H-06 TourSchedule DTO          BLOCKED
H-07 Configuration/options     BLOCKED
H-08 Reservation API           BLOCKED
H-09 Price/Loyalty             BLOCKED
H-10 Travel History DTO        BLOCKED
```

---

# 92. Handoff to CP7

다음 Checkpoint:

```text
CP7 — QA & TEST PLAN
```

CP7에서는 지금까지 정의한 모든 구현 단계에
실제 검증 체계를 연결한다.

반드시 정의:

```text
Unit Test
Component Test
Feature Integration Test
Adapter Contract Test
E2E
Visual Regression
Accessibility
Responsive
Network/failure simulation
Performance/NFR observation

PR별 required test matrix
screen별 state matrix
J01~J10 exact scenarios
release severity S0/S1/S2
CI gate
manual QA evidence
```

CP7 목표:

> **“구현 완료”를 개발자 감각이 아니라
> 테스트와 검증 증거로 판정할 수 있게 만드는 것**