# Mister World Frontend Data & API UX

> Document: `09-DATA-AND-API-UX.md`  
> Status: **CP8 Complete**  
> Scope: `WonhoOne/frontend` Customer GUI  
> Planning baseline: 2026-09-29  
> Depends on:
> - `06-UI-STATES.md`
> - `07-SCREEN-SPECS.md`
> - `08-COMPONENT-ARCHITECTURE.md`
> - `audits/CP6-H-CONTRACT-TBD-AUDIT.md`
> - `audits/CP6-I-FINAL-IMPLEMENTATION-READINESS.md`
> - current `WonhoOne/docs/main` shared API / domain contracts

---

# 0. CP8 Objective

CP8은 화면과 컴포넌트가 **언제 데이터를 요청하고, 언제 기존 데이터를 믿고, 언제 새로 가져오고, 실패하면 무엇을 유지하고, 어떤 action은 자동 재시도하지 않는지**를 잠그는 단계다.

CP7이:

> 코드를 어디에 둘 것인가

를 정했다면 CP8은:

> 데이터가 언제 들어오고, 얼마나 오래 믿으며, 사용자 행동과 실패를 어떻게 연결할 것인가

를 정한다.

CP8의 핵심 원칙은 다음이다.

> **Backend가 확정하지 않은 endpoint/DTO/business rule은 만들지 않는다.  
> 대신 UI가 요구하는 lifecycle과 adapter boundary는 지금 확정한다.**

---

# 1. Current Fixed API Surface

현재 shared API skeleton에서 Frontend가 사용할 수 있는 고정 endpoint는 다음이다.

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

현재 **없는 endpoint를 CP8이 새로 만들지 않는다.**

특히 다음 endpoint를 임의 생성하지 않는다.

```text
/theme
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

필요성이 있더라도 Shared Contract 변경 대상으로 남긴다.

---

# 2. Contract Status Rule

Data layer의 모든 항목은 다음 네 종류로 구분한다.

```text
CONFIRMED CONTRACT
FRONTEND DATA POLICY
MOCK-ONLY
BLOCKED BY SHARED CONTRACT
```

예:

```text
GET /api/v1/tours
= CONFIRMED CONTRACT

Tour list stale time 5분
= FRONTEND DATA POLICY

mock hotel catalog
= MOCK-ONLY

Hotel option endpoint
= BLOCKED BY SHARED CONTRACT
```

Mock가 Contract처럼 보이지 않게 하는 것이 중요하다.

---

# 3. Data Classes

Frontend 데이터는 5종으로 분류한다.

## A. Slow-changing catalog data

```text
TourProduct
Theme-linked presentation
Tour Style catalog
theme/product imagery metadata
```

## B. Availability-sensitive data

```text
TourSchedule
schedule availability
recruitment participant total
confirmation state
configuration option availability
```

## C. Transaction-sensitive data

```text
Configuration draft
server-calculated price
reservation submission
validation/conflict result
```

## D. Identity/private data

```text
auth session
customer profile
Travel History
Reservation detail
```

## E. Static Frontend presentation data

```text
editorial copy
design tokens
theme visual accents
local imagery mapping
```

각 종류는 같은 cache/freshness 정책을 사용하지 않는다.

---

# 4. Freshness Tiers

CP8에서 Frontend 기본 정책을 아래처럼 고정한다.

이 시간은 **Business Rule이 아니라 Frontend cache policy**다.
Backend rate limit / push model이 나중에 정해지면 CP8 정책을 조정할 수 있다.

| Tier | Data | Freshness Policy |
|---|---|---|
| F0 | price / submit validation | always current for the active draft |
| F1 | schedule / recruitment / option availability / reservation status | short-lived; revalidate on important user boundaries |
| F2 | TourProduct list/detail | minutes-scale cache |
| F3 | Travel History | session-friendly cache; refresh on entry/login |
| F4 | editorial/static UI | build/static asset |

Recommended initial defaults:

```text
F0: stale immediately
F1: ~30 seconds
F2: ~5 minutes
F3: ~5 minutes
```

These are implementation defaults, not server guarantees.

---

# 5. Common Query Lifecycle

Every server query follows the same conceptual lifecycle.

```text
Idle
→ Loading
→ Success
   ├─ Fresh
   ├─ Stale
   └─ Refreshing
→ Error
   └─ Retrying
```

Key rule:

```text
Success data exists
+ background refresh fails
≠ erase successful UI
```

Instead:

```text
keep content
show subtle refresh error/stale indication
allow retry
```

---

# 6. Loading Threshold Policy

CP5의 loading 원칙을 Data layer에서 구체화한다.

```text
0–120ms
→ skeleton을 굳이 flash하지 않아도 됨

120–400ms
→ component-level skeleton 표시

400ms+
→ skeleton + progressive/partial content 유지

3s+
→ skeleton을 유지하되
   필요하면 “불러오는 중” 의미를 text로 보조
```

전체 page spinner는 기본값이 아니다.

---

# 7. Automatic Retry Policy

## GET / Read Query

Transient error에 한해 자동 retry:

```text
maximum 1 automatic retry
```

대상:

```text
network interruption
temporary 5xx
```

자동 retry 금지:

```text
401
403
404
409
422
known validation error
```

그 이후는 사용자 `Retry`.

## Mutation

기본:

```text
automatic retry = 0
```

특히:

```text
reservation create
signup
login
```

은 자동 재전송하지 않는다.

이유:

- 중복 side effect 위험
- 사용자의 의도 재확인 필요
- server success 여부가 불명확할 수 있음

---

# 8. Retry Backoff

GET 자동 재시도는 짧은 backoff를 사용한다.

개념:

```text
first request
→ transient failure
→ short delay
→ one retry
```

정확한 jitter 구현은 Query library에 위임 가능.

사용자는 retry 내부 구현을 인식할 필요가 없다.

---

# 9. Request Deduplication

동일 query key의 동시 요청은 deduplicate한다.

예:

```text
Tour Detail
+ Header/Prefetch
+ another child component
```

가 같은 Tour를 각각 요청하지 않게 한다.

Component가 직접 fetch하면 안 되는 이유 중 하나다.

---

# 10. Cancellation and Race Safety

다음 상황에서 이전 request 결과가 새 state를 덮지 않게 한다.

```text
tourId 변경
schedule 선택 변경
option 빠른 연속 선택
route leave
logout/session change
```

가능한 경우 request abort를 사용.

핵심:

> **Latest user intent wins.**

---

# 11. Query Key Contract

Query key는 integration/query layer가 중앙 관리한다.

개념:

```text
tourProducts
tourProduct(tourId)
tourSchedules(tourId / query contract)
tourSchedule(scheduleId)
reservation(reservationId)
travelHistory(current customer)
```

Component에서 문자열 key를 직접 조합하지 않는다.

---

# 12. Home Data Policy

Home은 가능한 한 static/editorial shell을 먼저 렌더한다.

```text
Header
Hero copy
Editorial section structure
```

는 network에 종속시키지 않는다.

Theme/TourProduct runtime data가 필요하면:

```text
static shell
+ data-backed cards
```

로 부분 갱신한다.

## Cache

TourProduct discovery data:

```text
F2
~5min default
```

## Failure

Home 전체를 Error page로 만들지 않는다.

```text
Hero 유지
Theme section local error/retry
```

---

# 13. Theme ↔ TourProduct Data Gate

v0.1.1 기준:

```text
Theme 1:N TourProduct
```

따라서 Home/Tours의 Data layer는:

```text
GET /api/v1/tours
→ adapter
→ products grouped/presented by Theme
```

를 수용해야 한다.

하지만 실제 UX가:

```text
Theme
→ product picker
```

인지,
한 Theme에 대표 product를 노출하는지
아직 팀 결정을 기다린다.

금지:

```text
Theme enum을 tourId로 사용
```

Mock 시나리오에서 한 Theme당 한 상품을 둘 수는 있지만
그건 fixture scenario일 뿐 Contract가 아니다.

---

# 14. Tours Data Policy

`GET /api/v1/tours`

성공 data는 F2.

Entry:

```text
cache fresh
→ 즉시 render

cache stale
→ 기존 content render + background refresh

no cache
→ card skeleton
```

## Refresh failure

기존 list 유지.

## Empty

4 Theme baseline과 Product contract가 충돌할 수 있으므로,
0 products를 정상 “빈 여행서비스”로 silently 처리하지 않는다.

Screen Spec의 explicit Empty/Error policy 사용.

---

# 15. Tour Detail Data Policy

Core:

```text
GET /api/v1/tours/{tourId}
```

Schedules:

```text
GET /api/v1/tour-schedules
or
GET /api/v1/tour-schedules/{scheduleId}
```

정확한 list filtering/query parameter는 API v0.2 contract에 종속된다.

CP8은 query parameter를 발명하지 않는다.

## Parallel loading

권장:

```text
TourProduct core
|| 
Schedules
```

가능하면 병렬.

Core 성공 / Schedule loading이면
Detail shell을 먼저 보여준다.

---

# 16. Tour Detail Cache Policy

TourProduct:

```text
F2
~5min
```

Schedule:

```text
F1
~30s
```

Schedule은 다음 trigger에서 refresh 권장:

```text
Tour Detail entry
window/app focus
reconnect
Review 진입 전 또는 submit 전 validation boundary
```

---

# 17. Recruitment Freshness

Recruitment는 **availability-sensitive**다.

기본:

```text
stale after ~30s
```

하지만 CP8은 주기적 polling을 강제하지 않는다.

Default:

```text
entry refetch
focus refetch
reconnect refetch
manual retry/refresh
transaction boundary revalidation
```

주기적 polling은:

```text
Backend load / demo requirement / rate limit
```

이 확인된 뒤 추가한다.

---

# 18. No Fake Real-Time

Recruitment UI가 progress animation을 갖더라도:

```text
animation
≠ real-time data
```

실제 push/polling contract가 없으면
“실시간”이라는 copy를 사용하지 않는다.

---

# 19. Schedule Selection Consistency

사용자가 Schedule을 선택하면
선택한 `scheduleId`는 Draft에 저장한다.

Query cache의 schedule object 전체를 Draft에 복사하지 않는다.

Reason:

```text
schedule data can refresh
draft identity should remain stable
```

UI는:

```text
draft.scheduleId
+
latest schedule query
```

를 조합한다.

---

# 20. Configure Option Data

현재 fixed API skeleton에는:

```text
Hotel option endpoint
Transport option endpoint
Meal option endpoint
Extra option endpoint
```

가 없다.

따라서 실제 Backend integration은 **BLOCKED**.

CP8 정책:

```text
OptionSource interface
```

뒤에 mock fixture를 연결할 수 있다.

예:

```text
ConfigurationOptionSource
→ MOCK implementation now
→ Approved Backend adapter later
```

HTTP path를 미리 발명하지 않는다.

---

# 21. Option Availability Freshness

실제 option contract가 생기면:

```text
F1
```

로 취급한다.

특히 key는 최소 개념적으로:

```text
TourProduct
Style
Schedule
```

context를 고려할 수 있어야 한다.

실제 request query/body 구조는 Contract가 정한다.

---

# 22. Configuration Draft Persistence

CP7에서 미룬 persistence 방식을 CP8에서 확정한다.

기본:

```text
in-memory state
+
sessionStorage recovery
```

## Why sessionStorage

- browser refresh 복구
- same-tab transaction continuity
- localStorage보다 장기 잔존 위험이 낮음
- auth credential과 분리하기 쉬움

## Persist

```text
tour/product identity
style
schedule identity
participant selection when contract resolves
hotel/transport/meal option identity
extras identity
draft version
updatedAt
```

## Do NOT persist

```text
password/credential
auth token
raw server response
server-computed status truth
sensitive customer profile unless explicitly required
```

---

# 23. Draft Storage Versioning

Draft storage는 version을 갖는다.

개념:

```text
version: 1
```

Schema가 incompatible하게 바뀌면:

```text
old draft
→ validate
→ migrate if safe
or
→ discard with recovery UX
```

무조건 parse해서 사용하지 않는다.

---

# 24. Draft Expiry

Draft는 영구 저장하지 않는다.

Frontend policy:

```text
session-scoped
```

브라우저 tab/session이 끝나면 자연스럽게 사라지는 것을 기본으로 한다.

향후 “저장된 여행 만들기” 기능이 생기면 별도 Business Feature다.

---

# 25. Draft Rehydration

Refresh 후:

```text
session draft load
→ schema validate
→ route context validate
→ latest server data fetch
→ stale/invalid selections mark
```

중요:

> Rehydration은 예전 selection을 최신 truth로 간주하는 것이 아니다.

---

# 26. Draft Conflict After Refresh

예:

```text
Hotel A selected
→ refresh
→ Hotel A unavailable
```

처리:

```text
draft selection 유지 as invalid
latest option list display
explicit conflict message
Review disabled
user reselects
```

자동 replacement 금지.

---

# 27. Price Data Policy

현재 fixed API skeleton에는 별도 price endpoint가 없다.

따라서 CP8은:

```text
price endpoint
```

를 만들지 않는다.

가격이 Backend contract로 제공되는 순간:

```text
PriceResolver / adapter
```

뒤에 연결한다.

## Price truth

```text
Backend-owned
```

Frontend는 display/transition만 담당.

---

# 28. Price Recalculation UX

relevant option change 시:

```text
old price remains visible
→ “updating” state
→ latest price arrives
→ transition to new price
```

금지:

```text
old price disappears
→ blank / zero
→ new price
```

사용자가 price jump를 오해하지 않게 한다.

---

# 29. Price Request Race

향후 price resolution network call이 생기면
빠른 option 변경 때문에 이전 가격이 마지막 선택을 덮으면 안 된다.

Rule:

```text
price is bound to a draft fingerprint
```

Concept:

```text
tour/style/schedule/options/participantCount
→ stable fingerprint
→ price result
```

현재 draft와 fingerprint가 다르면 늦게 도착한 결과를 적용하지 않는다.

---

# 30. Price Debounce

향후 가격 API가 생길 경우
빠른 option 클릭마다 즉시 network flood를 보내지 않게 한다.

Frontend proposal:

```text
~200ms debounce
```

단:

- final Review/Submit boundary에서는 debounce를 기다리지 않고 최신 validation을 보장
- Backend contract/rate limit에 맞춰 조정 가능

---

# 31. Loyalty Discount

Frontend는 다음 display shape를 수용한다.

```text
Subtotal
Discount (optional)
Total
```

하지만 다음을 계산하지 않는다.

```text
loyalty eligibility
discount rate
application timing
stacking
```

할인 값은 Backend가 제공하는 truth만 표시한다.

---

# 32. Participant Count Data Gate

v0.1.1:

```text
Reservation.participantCount >= 1
```

하지만 Screen placement/default/range 미확정.

CP8은 데이터 lifecycle만 정의한다.

결정 후:

```text
participantCount
→ ReservationDraft
→ price/availability inputs if contract says so
→ Reservation request
```

금지:

```text
hidden default 1
```

을 사용자 선택 없이 영구 contract처럼 전송.

---

# 33. Honeymoon Couple Mapping

현재 shared rule:

```text
participant total >= 4
```

Frontend UX intent:

```text
2 couples / 2 teams
```

Mapping contract가 확정되기 전:

```text
CoupleProgress
```

는 fixture/demo presentation만 가능.

실제 adapter에서:

```text
participants / 2
```

계산 금지.

---

# 34. Reservation Review Data Policy

Review route에서는:

```text
ReservationDraft
+
latest relevant server truth
```

를 조합한다.

최소 revalidation 대상:

```text
Schedule availability
Option availability when contract exists
Price when contract exists
Auth state if required
```

Review는 cached draft만 보고 submit하는 화면이 아니다.

---

# 35. Review Entry Strategy

Entry:

```text
Configure
→ Review
```

시:

1. draft 즉시 render
2. freshness-sensitive data background/foreground validation
3. changed content가 있으면 conflict presentation
4. user reconfirms
5. submit enabled

사용자가 화면을 보는 동안 UI를 blank로 만들지 않는다.

---

# 36. Reservation Submit

Fixed endpoint:

```http
POST /api/v1/reservations
```

Mutation policy:

```text
pessimistic
automatic retry 0
duplicate submit lock
```

Flow:

```text
Idle
→ Submitting
→ Server Success
→ success route
```

Failure:

```text
draft preserved
button unlocked after known failure
error mapped
```

---

# 37. Ambiguous Submit Outcome

네트워크가 끊겨:

```text
request가 서버에 도달했는지
response만 잃었는지
```

불명확할 수 있다.

따라서:

- blind automatic retry 금지
- “다시 신청”을 즉시 자동 실행하지 않음
- Backend idempotency contract가 생기면 활용

현재 idempotency key 계약은 없음.

---

# 38. Submit Error Mapping

## 401

```text
Auth required/session expired
→ Login
→ draft restore
→ Review restore
→ user manually submits again
```

## 409

```text
schedule/option/price conflict
→ updated server truth fetch
→ changed field highlight
→ user reconfirms
```

## 422

```text
validation error
→ field/section-level mapping
→ draft preserved
```

단, 409/422 실제 error schema가 아직 미확정이므로
status-to-domain mapping은 API v0.2 후 adapter에서 구현한다.

---

# 39. No Auto-Resubmit After Auth

이 규칙은 CP5/CP6에서 이어지는 전역 규칙이다.

```text
Submit
→ 401
→ Login
→ success
→ Review
```

여기서 끝.

그 다음 Submit은 사용자가 직접 한다.

---

# 40. Reservation Success Data Policy

Success route:

```text
/reservation/:reservationId/success
```

navigation state만 믿지 않는다.

가능하면:

```http
GET /api/v1/reservations/{reservationId}
```

로 서버 truth를 다시 읽을 수 있어야 한다.

이렇게 하면:

```text
refresh
direct recovery
navigation state lost
```

에서도 복구 가능.

---

# 41. Success Partial Failure

Reservation core query 성공,
recruitment detail refresh 실패:

```text
신청 완료 상태 유지
recruitment section만 stale/error
```

절대:

```text
신청 성공 여부를 다시 불확실하게 표시
```

하지 않는다.

---

# 42. Reservation Detail Freshness

Reservation Detail:

```text
F1
~30s
```

entry/focus/reconnect refresh.

주기 polling은 강제하지 않음.

상태가 바뀔 수 있는 화면이므로:

```text
stale indicator
manual refresh/retry
```

를 지원할 수 있다.

---

# 43. Travel History Data Policy

Fixed endpoint:

```http
GET /api/v1/customers/me/travel-history
```

Confirmed:

```text
recent-first
product
period
Tour Style
price
```

Default freshness:

```text
F3
~5min
```

---

# 44. Previous Trips Popup Fetch

Normal Login Success 직후:

```text
auth success
→ start Travel History query immediately
→ popup shell opens
→ cache hit이면 즉시 list
→ stale이면 list + background refresh
→ no cache면 skeleton
```

Transaction login에서 popup 표시 timing이 지연되더라도:

```text
History query itself can start immediately
```

따라서 popup이 나중에 열릴 때 이미 data가 준비될 수 있다.

---

# 45. My Trips Cache Sharing

Previous Trips Popup과 My Trips는:

```text
same Travel History query cache
same TravelHistoryItemModel
```

을 공유한다.

Popup에서 fetch한 데이터를 My Trips가 다시 처음부터 skeleton으로 만들지 않는다.

Stale이면:

```text
cached list
+ background refresh
```

---

# 46. Travel History Ordering

UI 결과는 recent-first.

가능하면 Backend가 canonical ordering을 제공.

Frontend sorting이 필요하다면:

```text
canonical date field
```

가 API contract에서 확정된 후만 사용.

날짜 field를 추정하지 않는다.

---

# 47. History Pagination

현재 pagination contract 없음.

따라서:

- page/size query parameter 발명 금지
- infinite-scroll endpoint 발명 금지
- 현재 response를 그대로 list로 수용

v0.2가 pagination을 정의하면 query architecture 확장.

---

# 48. Authentication Query/State Policy

Auth는 일반 GET Query와 분리된 Session state로 취급한다.

현재 contract가 미확정이므로:

```text
JWT
session cookie
refresh token
localStorage token
```

중 하나를 Frontend가 먼저 고정하지 않는다.

## Absolute rule

Credential/password를:

```text
localStorage
sessionStorage
query cache
logs
```

에 저장하지 않는다.

---

# 49. Session Checking

실제 auth mechanism이 정해지면 AuthProvider는:

```text
checking
authenticated
unauthenticated
```

상태를 제공한다.

`checking`일 때 전체 앱을 무조건 blank/spinner로 만들지 않는다.

Public routes:

```text
render public content
```

Protected/private section만 auth resolution 필요.

---

# 50. Private Cache Isolation

Customer-specific data:

```text
reservation detail
travel history
customer summary
```

는 auth identity/session과 연결한다.

Session이 invalidated되면:

```text
private query cache clear
```

를 기본 정책으로 한다.

Public Tour cache까지 지울 필요는 없다.

---

# 51. Logout Future Rule

현재 public logout endpoint가 고정되어 있지 않다.

따라서 endpoint는 만들지 않는다.

향후 logout/session invalidation이 구현되면:

```text
auth clear
private cache clear
transaction draft policy apply
```

가 원칙.

Credential/token 저장 방식은 Backend contract를 따른다.

---

# 52. Auth ReturnContext Persistence

ReturnContext는:

```text
memory
+
sessionStorage fallback
```

가능.

Persist:

```text
route
intent
draft reference/version
```

Do not persist:

```text
credentials
raw auth response
```

invalid/expired route면 `/` fallback.

---

# 53. Offline Read Policy

## Public cached data

가능하면 보여준다.

```text
TourProducts
Tour Detail
```

단:

```text
offline/stale indicator
```

필요 시 표시.

## Private cached data

인증/session 보안 정책이 허용하는 범위에서만.

단순 query cache memory는 가능.

Persistent private cache는 별도 승인 없이 도입하지 않는다.

---

# 54. Offline Mutation Policy

오프라인 mutation queue를 만들지 않는다.

금지:

```text
offline reservation queue
offline signup queue
offline login queue
```

이유:

- business state stale 가능
- duplicate action 위험
- auth/price/schedule validation 필요

Offline이면 action을 명확히 block하고 draft는 유지.

---

# 55. Reconnect Policy

Reconnect 시:

```text
F1 queries
→ background revalidate
```

특히:

```text
schedule
recruitment
reservation status
availability
```

F2/F3는 query library 기본 정책에 맞춰
필요한 것만 revalidate.

---

# 56. Window/Tab Focus Policy

Focus regain:

```text
F1 refresh
```

권장.

예:

사용자가 다른 tab에 있다가 10분 후 Reservation Review로 돌아오면
오래된 모집/일정 상태를 그대로 submit하지 않는다.

---

# 57. Stale Data Presentation

Stale은 Error가 아니다.

가능한 UI:

```text
“정보 업데이트 중”
“마지막으로 확인한 정보”
```

같은 subtle indicator.

단, 실제 lastUpdated timestamp를 보여주려면
Frontend query timestamp로 명확히 의미를 정의해야 한다.

서버 업데이트 시각처럼 오해시키지 않는다.

---

# 58. Partial Failure Policy

각 screen은 독립 data dependency를 최대한 분리한다.

예:

```text
Tour core        Success
Schedule         Error
Image            Failed
```

결과:

```text
Hero/story       visible
Style            visible
Schedule         local error
Image            fallback
```

하나의 `Promise.all` 실패로 전체 screen을 날리지 않는다.

---

# 59. Adapter Failure Policy

HTTP 200이라도 adapter가 예상 structure를 만들 수 없는 경우:

```text
ContractMappingError
```

로 분류한다.

Production UX:

```text
generic local/server data error
retry where meaningful
```

Development:

```text
log mapping context
```

사용자에게 raw DTO/debug detail 노출 금지.

---

# 60. DTO Validation

API v0.2가 생기면 boundary에서 runtime validation을 검토한다.

특히:

```text
reservation
schedule
travel history
```

같이 중요한 데이터.

정확한 validation library는 구현 결정.

목표:

> malformed backend data가 깊은 UI에서 cryptic crash를 만들지 않게 한다.

---

# 61. Error Normalization

Integration layer는 raw network/HTTP error를 공통 category로 변환한다.

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

Screen은 status code 숫자보다 domain category를 소비한다.

---

# 62. User Copy Ownership

Backend의:

```text
message
stack
exception
```

을 그대로 사용자에게 출력하지 않는다.

Feature/Screen Spec이 user-facing copy를 소유.

Backend error detail은 mapping에만 사용.

---

# 63. Query Library

CP8은 특정 library를 contract로 고정하지 않는다.

다만 현재 architecture 요구에 가장 잘 맞는 기본 후보는:

```text
TanStack Query
```

다음 기능을 만족하는 equivalent도 가능:

```text
cache
stale
background refresh
deduplication
retry control
cancellation
query invalidation
mutation state
```

Library 선택은 React scaffold 구현 시 확정.

---

# 64. Mock → Real API Migration

개발 초기:

```text
Screen
→ View Model
→ Mock Source
```

Contract 확정 후:

```text
Screen
→ View Model
← Adapter
← Backend DTO
```

UI에 변경이 최소여야 한다.

## Forbidden migration pattern

```text
Mock JSON field names
→ 그대로 component props
→ Backend가 다른 이름 사용
→ 전체 app refactor
```

---

# 65. Mock Scenarios

최소 fixture set:

```text
happy
slow
empty
network error
500
401
409 conflict
422 validation
partial schedule failure
image failure
offline
stale refresh
reservation success
reservation uncertain response
history empty
history populated
```

participantCount / Honeymoon fixtures는
현재 contract conflict를 명시적으로 표시.

---

# 66. Mock Data Marking

Mock-only values는 production copy와 구분.

개발 코드에서:

```text
mock
fixture
demo
```

의미가 명확해야 한다.

가짜 실제 가격/호텔/여행지를
“공식 data”처럼 문서/production bundle에 고정하지 않는다.

---

# 67. Prefetch Policy

허용 가능한 prefetch:

```text
Tours card focus/hover
→ TourProduct detail

Tour Detail에서 Configure 진입 의도가 높아질 때
→ approved option data source가 생긴 경우 option prefetch
```

단:

- contract 없는 endpoint prefetch 금지
- mobile data usage를 고려
- focus/hover만으로 대용량 이미지 무차별 fetch 금지

---

# 68. Image Data Policy

이미지 loading은 HTTP query cache와 별개로
`ImageFrame` state를 사용.

```text
Placeholder
Loading
Loaded
Failed
```

이미지 fail은 API data fail로 승격하지 않는다.

---

# 69. NFR Response-Time UX

Shared NFR은 주요 Backend 요청 3초 이내를 목표로 한다.

Frontend는 그 목표를 이용해:

```text
3초까지 blank 화면
```

으로 기다리면 안 된다.

CP5/CP8 기준:

```text
120ms 이후 visual loading state
3s 이상이면 여전히 context/skeleton 유지
```

Network latency와 UI feedback을 분리한다.

---

# 70. Sensitive Data and Logging

로그에 남기지 않는다:

```text
password/credential
token
full address
contact detail
private customer payload
```

Error logging 시:

```text
endpoint category
status
correlation/request ID if provided
safe contract metadata
```

정도만.

---

# 71. Cache Reset Boundaries

## Reservation success

성공 후:

```text
ReservationDraft clear
```

단, Success page recovery에 필요한 `reservationId`는 route가 소유.

Refresh candidates:

```text
selected schedule / recruitment
reservation detail
```

Travel History는 “완료된 여행” 개념이므로
새 Reservation 생성 직후 무조건 invalidate하지 않는다.

---

# 72. Draft Clear Policy

Clear when:

```text
server-confirmed Reservation create success
explicit user discard
draft schema incompatible and cannot migrate
```

Do not clear on:

```text
network error
401
409
422
browser Back
temporary route navigation
```

---

# 73. Back Navigation Data Policy

Configure → Detail:

```text
Draft remains
```

Review → Configure:

```text
Draft remains
```

Success → Back:

이미 reservation이 생성된 이후이므로
draft-based submit 화면으로 돌아가 duplicate action이 발생하지 않게 한다.

Browser history 처리 시
submit state와 성공 route를 구분해야 한다.

---

# 74. Page Refresh Matrix

| Screen | Refresh Strategy |
|---|---|
| Home | static shell + Tour cache/refetch |
| Tours | cache then refresh |
| Tour Detail | refetch Tour/Schedule; selection recover if valid |
| Configure | rehydrate session draft + fetch latest option truth |
| Review | rehydrate draft + revalidate freshness |
| Success | reservationId로 server fetch |
| Reservation Detail | reservationId로 fetch |
| Login | full-page login fallback |
| Signup | blank form; sensitive credentials not restored |
| Previous Trips Popup | post-login trigger; history cache |
| My Trips | history cache + refresh |

---

# 75. Conflict UX Matrix

| Conflict | Preserve | Invalidate | User Action |
|---|---|---|---|
| Schedule unavailable | Style/config where still meaningful | Schedule selection | choose schedule |
| Option unavailable | Other selections | affected option | choose replacement |
| Price changed | All selections | old price acceptance | reconfirm |
| Auth expired | Draft | auth session | login |
| Reservation validation | Draft | invalid field/section | correct |
| History refresh fails | cached history | fresh status only | retry |
| Recruitment refresh fails | last known state | freshness | retry |

---

# 76. Optimistic vs Pessimistic Matrix

## Optimistic/local

```text
Style selection
Schedule local selection
Hotel/Transport/Meal draft selection
Dialog/sheet state
```

단, server conflict 가능성을 표시할 수 있어야 함.

## Pessimistic

```text
Login
Signup
Reservation create
final business validation
server price acceptance
```

## Never fake optimistic success

```text
Reservation created
Schedule confirmed
SMS sent
Loyalty discount applied
```

---

# 77. Data Accessibility

Async state는 screen reader에서도 의미가 있어야 한다.

예:

```text
“일정을 불러오는 중”
“일정을 불러오지 못했습니다”
“가격이 업데이트되었습니다”
```

하지만 모든 background refresh를 announce해
사용자를 방해하지 않는다.

중요한 status transition만 polite live region.

---

# 78. Data UX and Motion

Data가 바뀌었다고 page 전체를 animate하지 않는다.

```text
query refresh
→ changed row only

price refresh
→ price only

recruitment update
→ progress only

history background refresh
→ list diff only
```

Loading과 motion은 data lifecycle을 설명해야지
네트워크를 숨기기 위한 장식이 아니다.

---

# 79. Production Contract Gate Markers

구현 코드에서 Shared Contract가 안 닫힌 부분은
문서 ID를 남긴다.

예:

```text
BLOCKED H-01 Theme/TourProduct
BLOCKED H-02 participantCount
BLOCKED H-03 Honeymoon mapping
BLOCKED H-04 Auth
...
```

TODO만 쓰지 않는다.

어떤 결정이 필요한지 추적 가능해야 한다.

---

# 80. Data Access Interfaces

CP7 architecture와 연결되는 conceptual interface:

```text
TourDataSource
ScheduleDataSource
ConfigurationDataSource
ReservationDataSource
AuthDataSource
TravelHistoryDataSource
```

이 이름은 Frontend abstraction이며
Backend endpoint를 새로 약속하는 것이 아니다.

실제 source:

```text
Mock
or
Approved Backend Adapter
```

---

# 81. Data Dependency by Screen

| Screen | Reads | Client Draft | Mutation |
|---|---|---|---|
| Home | Tour discovery optional | No | No |
| Tours | TourProducts | No | No |
| Tour Detail | TourProduct, Schedules | Style/Schedule | No |
| Configure | approved option/price data | ReservationDraft | No/future validation |
| Review | latest validation/price | ReservationDraft | Create Reservation |
| Success | Reservation | No | No |
| Reservation Detail | Reservation | No | No |
| Login | Auth/session | ReturnContext | Login |
| Signup | none | form | Signup |
| Previous Trips | Travel History | popup UI state | No |
| My Trips | Travel History | No | No |

---

# 82. Query Invalidation Rules

When Reservation is created successfully:

```text
invalidate/refresh selected Schedule
invalidate Reservation detail if precreated
clear ReservationDraft
```

Do not blindly invalidate:

```text
all TourProducts
all Travel History
all auth
```

When Login succeeds:

```text
auth state update
Travel History query start/invalidate as needed
```

When session becomes unauthenticated:

```text
private cache clear
```

---

# 83. Error Boundary vs Data Error

다시 확인:

```text
React render crash
→ Error Boundary

GET /tours 500
→ Query Error State
```

API error를 Error Boundary로 처리하지 않는다.

---

# 84. No Global Loading Overlay

Global loader는 route bootstrap 같은 극히 제한적 상황 외 사용하지 않는다.

Data query는:

```text
page
section
component
```

중 가장 좁은 범위에서 loading 표현.

---

# 85. Data Layer Anti-Patterns

## D-01

Page component 안의 raw `fetch`.

## D-02

UI component가 HTTP status code를 직접 분기.

## D-03

API DTO를 global app model로 그대로 사용.

## D-04

Server object 전체를 Draft store에 복사.

## D-05

Every focus → 모든 API refetch.

## D-06

Mutation 자동 retry.

## D-07

Offline action queue.

## D-08

가격을 Frontend에서 business formula로 계산.

## D-09

`participantCount / 2`로 Couple 계산.

## D-10

Mock option endpoint 발명.

## D-11

409를 generic toast 하나로 끝냄.

## D-12

refresh error가 성공 data를 지움.

## D-13

Login 성공 후 credential을 storage에 보관.

## D-14

Travel History와 current reservation list 혼합.

## D-15

No-cache 때문에 screen 이동마다 skeleton flash.

---

# 86. CP8 Decision Log

## D-801

Server data는 Query/Data layer가 소유.

## D-802

Reservation transaction은 sessionStorage-backed Draft로 복구 가능하게 한다.

## D-803

Credentials/auth secrets는 Draft/storage에 저장하지 않는다.

## D-804

GET transient error는 최대 1회 자동 retry.

## D-805

Mutation automatic retry는 0.

## D-806

Schedule/recruitment/availability는 F1 short-lived data.

## D-807

TourProduct는 F2 minutes-scale cache.

## D-808

Travel History는 Popup/My Trips 간 cache 공유.

## D-809

Price는 F0 / Backend-owned truth.

## D-810

Old price는 recalculation 중 유지.

## D-811

Review 진입/Submit 전 freshness-sensitive truth를 재검증한다.

## D-812

Reservation Submit은 pessimistic, ambiguous outcome은 blind retry하지 않는다.

## D-813

Offline mutation queue를 만들지 않는다.

## D-814

Private cache는 auth session 종료 시 clear.

## D-815

No dedicated option/price/history-detail endpoint is invented.

## D-816

Theme/TourProduct/participantCount/Honeymoon mapping은 Contract gate를 유지한다.

## D-817

Mock data는 View Model/adapter boundary 뒤에 둔다.

## D-818

Adapter mapping failure는 별도 ContractMappingError로 다룬다.

## D-819

Polling은 기본값이 아니다.

## D-820

Query library는 semantics를 만족하면 교체 가능하다.

---

# 87. CP8 Acceptance Checklist

## Query Lifecycle

- [x] Loading
- [x] Success
- [x] Stale
- [x] Refreshing
- [x] Error
- [x] Retry
- [x] cancellation/race
- [x] deduplication

## Freshness

- [x] TourProduct
- [x] Schedule
- [x] Recruitment
- [x] Reservation
- [x] History
- [x] Price

## Transaction

- [x] Draft persistence
- [x] rehydration
- [x] conflict recovery
- [x] auth interruption
- [x] duplicate submit
- [x] ambiguous mutation result
- [x] draft clear rule

## Errors

- [x] 401
- [x] 404
- [x] 409
- [x] 422
- [x] 5xx
- [x] network
- [x] offline
- [x] adapter/contract mapping failure

## Contract Safety

- [x] no invented option endpoint
- [x] no invented price endpoint
- [x] no invented history detail endpoint
- [x] no frontend price engine
- [x] no fake Honeymoon couple calculation
- [x] no hidden participantCount default
- [x] no auth storage assumption

## UX

- [x] skeleton flash control
- [x] partial failure
- [x] cache reuse
- [x] stale presentation
- [x] background refresh
- [x] image state separation
- [x] async accessibility

**CP8 Status: COMPLETE**

---

# 88. Implementation Readiness After CP8

```text
Visual / Component Architecture    READY
Query / Cache Architecture         READY
Draft Persistence Strategy         READY
Mutation / Error UX                READY
Mock-backed Development            READY

Real DTO integration               CONTRACT-GATED
Option/Price integration           CONTRACT-GATED
Auth integration                   CONTRACT-GATED
participantCount UX                CONTRACT-GATED
Honeymoon couple mapping           CONTRACT-GATED
```

이제 Frontend 구현은 data layer까지 포함해 시작 가능하다.

단, Contract gate를 임시 값으로 숨겨서 통과시키면 안 된다.

---

# 89. Next Checkpoint

## CP9 — Responsive & Accessibility

다음 문서:

```text
10-RESPONSIVE-ACCESSIBILITY.md
```

CP9에서는:

```text
breakpoint behavior
layout transformation
viewport extremes
sticky/fixed collision
safe area
keyboard navigation
focus management
screen-reader semantics
dialog/sheet behavior
contrast
reduced motion
touch target
zoom/text scaling
responsive images
mobile keyboard
orientation
```

을 전체 11개 화면 기준으로 감사하고 잠근다.
