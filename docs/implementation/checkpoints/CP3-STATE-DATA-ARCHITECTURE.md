# Mister World Frontend — CP3 State & Data Architecture

> Status: **COMPLETE**  
> Checkpoint: **CP3 — State & Data Architecture**  
> Date: **2026-09-29**  
> Target repository: `WonhoOne/frontend`  
> Depends on:
> - `CP0-IMPLEMENTATION-BASELINE.md`
> - `CP1-CODE-QUALITY-STANDARDS.md`
> - `CP2-FRONTEND-ARCHITECTURE-PLAN.md`
> - `docs/planning/06-UI-STATES.md`
> - `docs/planning/08-COMPONENT-ARCHITECTURE.md`
> - `docs/planning/09-DATA-AND-API-UX.md`
> - `docs/planning/12-IMPLEMENTATION-HANDOFF.md`
>
> Shared SSOT reviewed at:
>
> ```text
> WonhoOne/docs/main
> 46fd61af7dc0ac4770305e7088c4e4ded9b78892
> ```
>
> Active baseline: **v0.1.2**
>
> Next checkpoint: **CP4 — Foundation Implementation Plan**

---

# 1. Purpose

CP3의 목적은 Mister World Frontend에서 발생하는 상태를
**누가 소유하고, 어디에 저장하고, 언제 새로 가져오고, 언제 폐기하며,
오류/로그인 중단/새로고침/오프라인/충돌에서도 어떤 값을 보존할지**
코드 수준으로 확정하는 것이다.

CP3 이후 구현자는 다음 질문에 임의로 답하면 안 된다.

```text
이 데이터는 Query Cache인가 Draft인가?
이 선택을 sessionStorage에 저장해야 하는가?
401이 나면 Draft를 버리는가?
409가 나면 사용자가 고른 값을 자동 변경하는가?
Reservation POST가 애매하게 끝나면 자동 retry 하는가?
Travel History Popup과 My Trips는 같은 cache를 쓰는가?
refresh 실패 시 성공 데이터를 지우는가?
오프라인에서 Reservation을 queue에 넣는가?
```

이 문서가 해당 판단의 구현 기준이 된다.

---

# 2. Baseline Drift Detected During CP3

CP3 작성 중 Shared SSOT가 CP0 작성 이후 변경된 것을 확인했다.

현재 `WonhoOne/docs/main` 최신 commit:

```text
46fd61af7dc0ac4770305e7088c4e4ded9b78892
```

새 승인 baseline:

```text
baseline/BASELINE-v0.1.2.md
```

v0.1.2는 Honeymoon couple/team semantics를 확정했다.

## Current approved rule

`HONEYMOON_ROMANCE` Reservation:

```text
participantCount >= 2
participantCount is integer
participantCount is even

coupleCount = participantCount / 2
```

한 Reservation은 여러 couple/team을 포함할 수 있다.

Honeymoon TourSchedule confirmation:

```text
sum(valid Reservation.coupleCount) >= 2 couples/teams
```

`Couple` 또는 `Team`은 별도 Shared Entity가 아니다.

## Impact on earlier CP0 artifact

기존 CP0 산출물에는 다음 내용이 있었다.

```text
participantCount / 2 계산 금지
Couple/Team mapping은 Contract Gate
```

이 부분은 **v0.1.2에 의해 superseded** 되었다.

이 drift를 발견한 직후 CP0·CP1·CP2 산출물을 v0.1.2 기준으로 정정했다.

현재 상태:

```text
CP0 Honeymoon baseline        UPDATED
CP1 contract-safety checklist UPDATED
CP2 architecture wording      UPDATED
```

CP1/CP2의 구조 원칙 자체에는 근본 변화가 없고,
Honeymoon 관련 금지/허용 조건만 최신 Shared Contract에 맞췄다.

---

# 3. Frontend Documentation Drift

현재 `WonhoOne/frontend/AGENTS.md`는
아직 다음 문구를 포함한다.

```text
current shared planning baseline = v0.1.1
```

하지만 Shared `WonhoOne/docs/AGENTS.md`는:

```text
docs/main에 존재하는 최신 Baseline을 implementation baseline으로 사용
```

하도록 변경됐고,
현재 docs/main에는 v0.1.2가 있다.

따라서 현재 상태:

```text
Shared SSOT      → v0.1.2
Frontend AGENTS  → stale v0.1.1 wording
```

Frontend AGENTS의 첫 원칙 자체가
`WonhoOne/docs/main`을 approved SSOT로 선언하고 있으므로,
CP3는 **v0.1.2를 실제 구현 기준**으로 사용한다.

단 실제 Implementation PR-01 시작 전
Frontend documentation의 baseline wording을 최신화하는 maintenance가 필요하다.

Tracking marker:

```text
DOC-DRIFT-01
Frontend AGENTS / implementation handoff baseline references need v0.1.2 reconciliation.
```

---

# 4. State Architecture North Star

Frontend 상태를 세 종류로 분리한다.

```text
1. Server State
2. Transaction State
3. Ephemeral UI State
```

이 세 가지를 하나의 Global Store에 넣지 않는다.

---

# 5. Server State

Server State는 Backend가 진실의 원천인 데이터다.

예:

```text
TourProduct
TourSchedule
Recruitment state
Reservation
Travel History
server-owned price
server-owned option availability
authentication session truth
```

기본 owner:

```text
TanStack Query
+
Feature query/mutation layer
```

---

# 6. Transaction State

Transaction State는
사용자가 아직 최종 서버 mutation으로 확정하지 않은 선택이다.

대표:

```text
ReservationDraft
```

포함 가능:

```text
selected TourProduct
selected TourStyle
selected TourSchedule
participantCount
Hotel selection
Transport selection
Meal selection
Extra selections
```

Transaction State의 owner:

```text
reservation feature
```

Persistence:

```text
sessionStorage
```

---

# 7. Ephemeral UI State

화면을 벗어나면 유지할 필요가 없는 상태.

예:

```text
Dialog open
BottomSheet open
hover
focus
pressed
expanded section
temporary local animation state
```

Owner:

```text
가장 가까운 Component
```

기본 도구:

```text
useState
useReducer
```

전역 Store로 올리지 않는다.

---

# 8. Chosen Server-State Library

CP3에서 Server State library를 다음으로 확정한다.

```text
TanStack Query
```

이유:

```text
cache
stale data
background refresh
query deduplication
retry control
request cancellation
mutation lifecycle
query invalidation
focus/reconnect revalidation
```

이 현재 Frontend Planning의 요구와 직접 일치한다.

정확한 package major/minor version은
PR-01 scaffold 시점에 최신 안정 버전을 확인해 고정한다.

Shared Business Contract가 아니라
Frontend implementation dependency다.

---

# 9. Why No Additional Global State Library

현재 상태 구조에서는
Zustand/Redux 같은 별도 global state library를 도입하지 않는다.

이유:

```text
Server State       → TanStack Query
ReservationDraft   → Context + reducer
Auth shell state   → Context
Ephemeral UI       → local React state
```

로 책임이 충분히 분리된다.

추가 library는
실제 구현 중 Context/reducer의 측정 가능한 문제 또는 복잡성이 확인될 때 검토한다.

CP1의 Delayed Abstraction 원칙을 따른다.

---

# 10. Query Client Ownership

Query Client는:

```text
src/app/providers/
```

에서 Application-level로 한 번 생성한다.

개념:

```text
QueryProvider
→ QueryClientProvider
```

금지:

```text
Page마다 QueryClient 생성
Feature마다 독립 QueryClient
```

Query Client는 Server State infrastructure이며
Business Rule을 소유하지 않는다.

---

# 11. Query Key Ownership

각 Feature가 자신의 Query Key factory를 소유한다.

예시 개념:

```text
tour-discovery
  tourProducts

tour-detail
  tourProduct(tourId)
  tourSchedules(tourId)

reservation
  reservation(reservationId)

travel-history
  travelHistory(me)
```

Component에서 직접 다음처럼 작성하지 않는다.

```ts
useQuery({
  queryKey: ['tour', id],
});
```

반복 string key는
Feature Query layer에서 관리한다.

---

# 12. Query Key Principles

Query Key는 다음 성질을 가져야 한다.

```text
deterministic
serializable
resource identity를 표현
UI transient state를 포함하지 않음
```

Query Key는 Backend URL 자체와 동일할 필요가 없다.

예:

```text
tourSchedules(tourId)
```

는 Frontend가 “이 TourProduct의 일정”이라는 Server State를 식별하는 key다.

실제 Backend가 해당 데이터를
어떤 query parameter/response shape으로 제공할지는 API v0.2 contract가 결정한다.

---

# 13. Query Freshness Classes

기존 CP8 planning의 freshness 정책을 code-level로 유지한다.

## F0 — Always Current

대상:

```text
final price
final validation
submit-time authoritative truth
```

기본:

```text
staleTime = 0
```

Review 진입 또는 Submit 직전에
필요한 authoritative data를 재검증한다.

단 현재 price/validation API 자체가 Contract Gate이므로
실제 query는 API contract가 닫힌 뒤 구현한다.

---

## F1 — Short-lived

대상:

```text
TourSchedule
recruitment
availability
Reservation status
option availability
```

기본 정책:

```text
staleTime ≈ 30 seconds
```

Entry/focus/reconnect 시
stale하면 background revalidation한다.

---

## F2 — Product Data

대상:

```text
TourProduct list/detail
```

기본:

```text
staleTime ≈ 5 minutes
```

Brand/editorial shell보다
변화 가능하지만 F1만큼 민감하지 않다.

---

## F3 — Travel History

대상:

```text
Travel History
```

기본:

```text
staleTime ≈ 5 minutes
```

Previous Trips Popup과 My Trips가
같은 Query Cache를 공유한다.

---

## F4 — Static / Editorial

대상:

```text
design-time copy
static visual config
local editorial content
```

Server Query 대상으로 만들지 않는다.

Build/static source를 사용한다.

---

# 14. No Fake Real-Time

다음 문구/동작을
실제 realtime mechanism 없이 구현하지 않는다.

```text
실시간
live
방금 업데이트됨
```

Polling/WebSocket/SSE contract가 없으면
일반 Query refresh로 표현한다.

---

# 15. Retry Policy — Read Queries

GET 계열 transient failure는:

```text
automatic retry = maximum 1
```

자동 retry 가능 후보:

```text
temporary network failure
5xx
timeout
```

자동 retry하지 않음:

```text
401
403
404
409
422
ContractMappingError
```

정확한 error category는 Integration layer normalization을 사용한다.

---

# 16. Retry Policy — Mutations

Mutation:

```text
automatic retry = 0
```

대상:

```text
Login
Signup
Reservation create
future validation/reprice mutations
```

사용자 Action을
Framework가 임의로 재실행하지 않는다.

---

# 17. Reservation Submit Is Pessimistic

Reservation creation:

```text
Idle
→ Submitting
→ Server-confirmed Success
→ Success UI
```

서버 성공 응답 전:

```text
Reservation created
```

라고 표시하지 않는다.

Optimistic Reservation create는 금지한다.

---

# 18. Duplicate Submit Guard

Reservation submit 시:

```text
first submit
→ mutation enters Submitting
→ submit action locked
→ duplicate invocation ignored/blocked
```

Button disabled만으로 끝내지 않는다.

Mutation action 자체에도
동시 중복 실행 guard가 있어야 한다.

---

# 19. Ambiguous Reservation POST Outcome

가장 위험한 경우:

```text
POST /reservations 전송
→ Backend에서 처리됐을 가능성 존재
→ Client connection/response 끊김
→ 성공/실패 여부 불명
```

이 경우:

```text
automatic retry 금지
blind manual retry CTA 금지
Draft 유지
```

Frontend-specific submission state:

```text
uncertain
```

를 사용할 수 있다.

중요:

```text
uncertain
```

은 Backend Reservation status enum이 아니다.

Client가 **결과를 확인하지 못한 상태**를 의미한다.

API v0.2에서
idempotency/correlation/recovery mechanism이 확정되지 않는 한
Frontend가 임의 복구 protocol을 만들지 않는다.

Tracking:

```text
BLOCKED H-08 — Reservation result recovery contract
```

---

# 20. Query Cancellation

가능한 GET request는
TanStack Query가 제공하는 `AbortSignal`을
Backend client까지 전달한다.

사용자가 빠르게 다른 Tour로 이동하면:

```text
old request
→ abort or become irrelevant

new request
→ latest intent
```

오래된 응답이
현재 UI를 덮어쓰지 않게 한다.

---

# 21. Latest Intent Wins

다음 interaction에서 중요하다.

```text
Tour A → Tour B 빠른 이동
Schedule A → Schedule B 빠른 선택
Option A → Option B 빠른 선택
```

Async 결과는
현재 Query Key / selection identity와 연결한다.

이전 selection을 위한 결과가
새 selection 화면에 적용되면 안 된다.

---

# 22. Partial Failure

독립적으로 회복 가능한 Server State는
Query를 분리한다.

예:

```text
Tour core      Success
Schedules      Error
Image          Failed
```

결과:

```text
Hero/story/style 유지
Schedule section만 Error
Image는 ImageFrame fallback
```

하나의 `Promise.all` 실패로
전체 화면을 날리는 구조를 피한다.

---

# 23. Refresh Failure

기존 성공 data가 있는 경우:

```text
Success data
+ background refresh
+ refresh failure
```

결과:

```text
기존 data 유지
stale/error indicator
local retry
```

금지:

```text
기존 data 삭제
전체 Skeleton 복귀
전체 Page Error 전환
```

---

# 24. Loading Flash Control

기획 baseline:

```text
< 120ms
→ Skeleton 생략 가능

120–400ms
→ Skeleton

> 400ms
→ Skeleton + progressive/partial content
```

정확한 helper 구현은 CP4에서 결정한다.

State architecture 원칙은:

```text
빠른 요청 때문에 화면이 깜빡이지 않게 한다.
```

---

# 25. Offline Detection

Browser `navigator.onLine` 또는 관련 event는
**hint**로만 사용한다.

실제 network truth로 절대 간주하지 않는다.

---

# 26. Offline Read Policy

## Cached public data 있음

예:

```text
TourProduct
Tour Detail
```

화면 유지.

필요 시:

```text
오프라인 상태
표시된 정보가 최신이 아닐 수 있음
```

을 알린다.

## Cached data 없음

local/full offline state.

---

# 27. Private Cache Policy

Customer-specific data:

```text
Reservation Detail
Travel History
future customer summary
```

는 기본적으로 memory Query Cache만 사용한다.

별도 persistent Query Cache를
localStorage/sessionStorage에 저장하지 않는다.

Auth/security contract 없이
private cache persistence를 도입하지 않는다.

---

# 28. Offline Mutation Policy

금지:

```text
offline Reservation queue
offline Signup queue
offline Login queue
```

이유:

```text
stale schedule
stale price
stale availability
auth requirement
duplicate mutation 위험
```

오프라인이면 mutation을 block하고
ReservationDraft는 유지한다.

---

# 29. Reconnect Policy

Reconnect 시:

```text
F1 query
→ background revalidation
```

우선 대상:

```text
schedule
recruitment
availability
reservation status
```

F2/F3는 stale 상태일 때
Query policy에 따라 갱신한다.

---

# 30. Window Focus Policy

Window/tab focus 복귀 시
F1 stale query는 재검증한다.

예:

```text
사용자가 Review를 열어둔 채 다른 tab에서 10분
→ 돌아옴
→ schedule/availability truth refresh
```

오래된 critical truth를 그대로 submit하지 않는다.

---

# 31. Polling Policy

기본값:

```text
polling = OFF
```

실제 realtime requirement/contract 없이
주기적 request를 무조건 보내지 않는다.

Reservation Detail 등에서
수동 refresh + focus/reconnect revalidate가 기본이다.

---

# 32. Error Normalization Model

Integration boundary는 raw error를
다음 category로 normalize한다.

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

정확한 TypeScript representation은
Foundation/Integration 구현에서 정의한다.

---

# 33. Error Ownership

```text
raw network/HTTP error
→ integrations/backend

normalized category
→ Feature query/mutation

user-facing copy
→ Feature/Screen

visual error primitive
→ shared/ui
```

Backend raw exception/message를
사용자에게 그대로 노출하지 않는다.

---

# 34. ContractMappingError

HTTP 200이어도
Approved DTO를 Frontend Model로 안전하게 만들 수 없다면:

```text
ContractMappingError
```

로 처리한다.

Development:

```text
safe mapping context log
```

Production:

```text
generic local/server data error
```
Raw payload 전체를
민감정보 확인 없이 logging하지 않는다.

---

# 35. ReservationDraft Owner

Reservation transaction 전체의 owner는:

```text
features/reservation
```

이다.

이유:

```text
Tour Detail
→ Configure
→ Review
→ Auth interruption
→ Review restore
→ Submit
→ Success
```

를 관통하기 때문이다.

---

# 36. ReservationDraft Implementation Strategy

추가 global state library 없이:

```text
React Context
+
useReducer
+
sessionStorage adapter
```

를 사용한다.

목표:

```text
explicit actions
serializable state
readable transition
testable reducer
cross-route persistence
no extra dependency
```

---

# 37. ReservationDraft V1 Shape

Frontend transaction model의 개념적 shape:

```ts
interface ReservationDraftV1 {
  schemaVersion: 1;

  tourProductId: string | null;
  tourScheduleId: string | null;
  tourStyle: TourStyle | null;

  participantCount: number | null;

  configuration: {
    hotelSelectionKey: string | null;
    transportSelectionKey: string | null;
    mealSelectionKey: string | null;
    extraSelectionKeys: string[];
  };

  updatedAt: number;
}
```

중요:

`SelectionKey`는 Frontend View Model의 identity다.

다음과 동일하다고 가정하지 않는다.

```text
Backend option ID
DB PK
API field name
```

실제 Backend option contract가 승인되면
Adapter/DataSource가 Frontend selection identity와 연결한다.

---

# 38. Why Draft Stores IDs/Keys Only

Draft에 Server object 전체를 저장하지 않는다.

저장:

```text
selected identities
user choice
schema version
updatedAt
```

저장하지 않음:

```text
TourProduct full object
Schedule full object
price
availability
recruitment status
Reservation status
Backend response
raw DTO
```

이유:

> Server truth는 복구 시 다시 검증되어야 한다.

---

# 39. Draft Must Not Persist Sensitive Data

ReservationDraft에 저장하지 않는다.

```text
password
credential
token
full customer profile
full address
contact
raw auth response
```

필요한 Customer input이 향후 Reservation DTO에 추가되더라도
Shared Contract가 닫힌 후 별도 security review를 거친다.

---

# 40. Draft Storage Key

Frontend-only storage key:

```text
mister-world:reservation-draft:v1
```

이 이름은 Backend Contract가 아니다.

`sessionStorage`를 사용한다.

이유:

```text
tab/session 단위 복구
브라우저 영구 저장 최소화
cross-session 오래된 여행 선택 방지
```

---

# 41. Draft Schema Version

상수:

```text
RESERVATION_DRAFT_SCHEMA_VERSION = 1
```

Storage payload는 반드시 version을 가진다.

향후 Draft shape 변경 시
silent parse를 하지 않는다.

---

# 42. Draft Serialization

Draft는 JSON serializable해야 한다.

금지:

```text
Date object
Map
Set
Function
React element
class instance
AbortController
Query object
```

시간:

```text
updatedAt = epoch milliseconds
```

처럼 primitive로 저장한다.

---

# 43. Draft Rehydration

App/Reservation flow 초기화 시:

```text
sessionStorage read
→ JSON parse
→ runtime shape validation
→ schemaVersion 확인
→ compatible migration
→ Draft restore
```

Parse/validation 실패:

```text
corrupt Draft
→ discard
→ safe empty Draft
```

사용자에게 의미 있는 작업이 사라졌다면
calm recovery copy를 제공할 수 있다.

---

# 44. Draft Migration

현재 V1만 존재.

향후:

```text
V1 → V2
```

migration이 안전하게 가능하면 변환한다.

불가능하면:

```text
incompatible schema
→ Draft clear
```

CP8/Release 전에 migration test를 추가한다.

---

# 45. Draft Clear Policy — LOCKED

Draft를 clear하는 경우:

```text
1. Server-confirmed Reservation create success
2. User explicit discard
3. incompatible schema + migration impossible
```

Draft를 clear하지 않는 경우:

```text
network error
401
409
422
5xx
offline
browser Back
Review → Configure
Configure → Detail
temporary navigation
background refresh failure
```

---

# 46. Draft Back Navigation

```text
Configure → Tour Detail
Draft 유지

Review → Configure
Draft 유지
```

사용자가 선택을 수정하기 위해 돌아가는 것은
Transaction cancel이 아니다.

---

# 47. Draft After Success

Reservation 생성 성공 후:

```text
Draft clear
```

Success route는:

```text
reservationId
```

로 Server State를 복구한다.

Browser Back으로
이미 Submit된 Draft 기반 Review가
다시 duplicate submit surface가 되지 않게 한다.

구체 history handling은 Router 구현 때 테스트한다.

---

# 48. Draft Action Model

Reducer action은
사용자의 의미 있는 transaction intent를 표현한다.

예시:

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

실제 action naming은 구현 시 조정 가능하지만
다음처럼 generic action은 피한다.

```text
SET_FIELD
UPDATE_DATA
PATCH_STATE
```

Domain intent가 보이게 한다.

---

# 49. Participant Count — v0.1.2

`participantCount`는 이제 Shared Domain에서
Theme-specific validation rule이 확정됐다.

## General Theme

```text
integer
>= 1
```

## Honeymoon

```text
integer
>= 2
even
```

Derived:

```text
coupleCount = participantCount / 2
```

Frontend는 UX validation을 적용할 수 있다.

Backend가 최종 authority다.

---

# 50. Participant Count Still TBD

v0.1.2에서도 다음은 미정이다.

```text
UI placement
initial/default value
maximum
schedule capacity
price effect
option availability effect
API field representation
```

따라서 Draft 초기 상태:

```ts
participantCount: null
```

숨은 default `1` 또는 `2`를 넣지 않는다.

---

# 51. Honeymoon Couple Count

v0.1.2 이후 다음 계산은 허용된다.

```ts
coupleCount = participantCount / 2
```

조건:

```text
Theme = HONEYMOON_ROMANCE
participantCount validation 통과
```

단:

```text
Couple Entity 생성 금지
Team Entity 생성 금지
coupleCount Draft persistence 기본 금지
```

`coupleCount`는 derived presentation/business meaning이다.

---

# 52. Recruitment Status Authority

Frontend가
전체 Reservation을 모아서 Schedule confirmation을 독립 계산하지 않는다.

권장:

```text
Backend
→ recruitment/status truth
→ Adapter
→ RecruitmentDisplayModel
→ UI
```

v0.1.2의 couple rule은
Frontend input validation과 presentation에는 사용할 수 있지만
Schedule final confirmation authority는 Backend다.

---

# 53. Configuration Selection Identity

Hotel/Transport/Meal 상세 Backend option contract는 아직 없다.

따라서 초기 Mock-backed UI에서는:

```text
frontend SelectionKey
```

를 사용한다.

예:

```text
mock-hotel-premium-a
```

같은 fixture identity는
명확히 Mock임을 드러낸다.

Production Backend ID로 착각하게 만드는 naming은 피한다.

---

# 54. Price State

Price는 Server-owned truth다.

ReservationDraft에 가격을 저장하지 않는다.

Query/View Model에서:

```text
current price
previous known price
isRecalculating
price error
```

를 다룬다.

Price API/formula가 아직 Contract Gate이므로
초기 구현에서는 Mock presentation만 가능하다.

---

# 55. Price Refresh UX

새 가격 계산 중:

```text
previous known price 유지
+ updating indicator
```

금지:

```text
₩0
빈 가격
임시 Frontend 계산값
```

새 가격이 Server에서 오면 교체한다.

---

# 56. Review Entry Revalidation

Reservation Review 진입 시
F0/F1 truth를 재검증할 준비를 한다.

예:

```text
schedule availability
option availability
price
```

단 실제 API가 정의된 항목만 요청한다.

API가 없으면
Frontend가 endpoint를 만들지 않는다.

---

# 57. Submit-Time Revalidation

Submit 직전에도
Backend가 최종 validation을 수행한다.

Frontend에서
“이미 Review에서 확인했으니 유효하다”고 확정하지 않는다.

---

# 58. 401 Unauthorized Flow

Reservation transaction 중 401:

```text
Submit
→ UnauthorizedError
→ Draft 유지
→ ReturnContext 저장
→ Login
→ Auth success
→ Review 복귀
→ Draft 복구
→ 최신 truth 재검증
→ User manual submit
```

절대:

```text
Login success
→ 자동 Reservation POST
```

하지 않는다.

---

# 59. Auth State Model

Auth mechanism은 H-04 Contract Gate다.

따라서 Frontend가 지금 확정하는 것은
세션 mechanism이 아니라 UI state contract다.

```ts
type AuthState =
  | { status: 'checking' }
  | { status: 'authenticated' }
  | { status: 'unauthenticated' };
```

향후 Approved Auth DTO가 나오면
`authenticated` branch에 필요한 Customer summary를 추가할 수 있다.

JWT/session/token storage는 아직 결정하지 않는다.

---

# 60. Credential State

Credential 입력:

```text
Login/Signup Component local form state
```

에만 존재한다.

저장 금지:

```text
sessionStorage
localStorage
ReservationDraft
Query Cache
logs
ReturnContext
```

---

# 61. ReturnContext

Auth interruption을 복구하기 위한
Frontend-only navigation context를 사용한다.

개념:

```ts
interface ReturnContextV1 {
  schemaVersion: 1;
  returnTo: string;
  intent: 'continue-navigation' | 'resume-reservation-review';
  draftSchemaVersion: number | null;
  createdAt: number;
}
```

`returnTo`는 **app-owned internal route만 허용**한다.

외부 URL/open redirect를 허용하지 않는다.

---

# 62. ReturnContext Persistence

우선:

```text
memory
```

Fallback:

```text
sessionStorage
```

key:

```text
mister-world:return-context:v1
```

저장하지 않음:

```text
credential
token
raw auth response
server payload
```

---

# 63. ReturnContext Expiry / Validation

복구 시:

```text
JSON parse
schema validation
internal route validation
draft version validation
```

실패하면:

```text
safe fallback route
```

로 이동한다.

오래된 context를 영구 유지하지 않는다.

정확한 TTL은
Auth contract/실사용 flow가 확인될 때 결정한다.

---

# 64. Normal Login vs Transaction Login

Normal Login:

```text
Login success
→ Travel History query 시작
→ Previous Trips Popup 가능
```

Reservation transaction 중 Login:

```text
Login success
→ Reservation Review 복귀 우선
→ Travel History query는 background 시작 가능
→ Previous Trips Popup은 transaction을 방해하지 않게 지연
```

Popup이 Reservation Review 위에 갑자기 떠
사용자 작업을 가리지 않게 한다.

---

# 65. Auth Session Invalidated

Unauthenticated 전환 시:

```text
private Query Cache clear
```

대상:

```text
Travel History
Reservation Detail
customer-specific future queries
```

유지 가능:

```text
public TourProduct cache
static/editorial data
ReservationDraft
```

Auth expiry 자체가
사용자의 transaction 선택을 삭제하지 않는다.

---

# 66. 409 Conflict Flow

Reservation Review/Submit 중 409:

```text
Draft 유지
→ latest authoritative truth fetch
→ 변경된 항목 표시
→ affected selection invalidation
→ 사용자 수정/재확인
→ manual resubmit
```

자동으로 새 값에 동의시키지 않는다.

---

# 67. Schedule Conflict

선택 Schedule이 더 이상 유효하지 않다면:

```text
previous Schedule choice
→ invalid presentation state로 기록
→ active valid selection에서는 제거
```

다른 Configuration 선택은
가능한 한 유지한다.

사용자가 새 Schedule을 명시적으로 선택한다.

---

# 68. Option Conflict

Hotel/Transport/Meal 중 하나만 invalid:

```text
affected option만 invalid
other selections 유지
```

자동으로 “가장 비슷한 옵션”을 선택하지 않는다.

---

# 69. Price Conflict

가격 변경:

```text
selections 유지
old price acceptance 무효
new server price 표시
explicit reconfirm
```

Draft는 가격을 저장하지 않으므로
선택 자체는 유지할 수 있다.

---

# 70. 422 Validation Flow

422:

```text
Draft 유지
→ normalized validation error
→ 관련 field/section mapping
→ inline correction
```

Toast 하나로 끝내지 않는다.

Backend field/error format은 v0.2에서 확정되므로
현재는 Mock validation scenarios로 UX를 구현한다.

---

# 71. 404

Resource 404:

```text
Tour Detail → Feature NotFound
Reservation Detail → Feature NotFound
```

Route 자체를 찾지 못한 404와 구분한다.

Automatic retry 없음.

---

# 72. 5xx

Server error:

```text
GET
→ existing success 있으면 유지
→ 없으면 section/page error
→ explicit retry

Mutation
→ failure
→ Draft 유지
→ automatic retry 없음
```

---

# 73. Network Error

GET:

```text
cache 있으면 유지
없으면 Network Error
retry 가능
```

Mutation:

```text
Draft 유지
automatic retry 없음
```

Reservation POST가 이미 전송된 뒤 끊겼다면
ambiguous outcome 정책을 적용한다.

---

# 74. Travel History Query

Owner:

```text
features/travel-history
```

Consumers:

```text
Previous Trips Popup
My Trips
```

둘은 같은 Query Key/Cache를 사용한다.

금지:

```text
Popup 전용 fetch
My Trips 전용 별도 fetch
```

---

# 75. Travel History Ordering

Shared Contract:

```text
recent-first
```

Backend가 canonical ordering을 제공하는 것이 우선이다.

Frontend sort가 필요하면
API v0.2에서 canonical date field가 확정된 후만 수행한다.

날짜 field를 추측하지 않는다.

---

# 76. Travel History Pagination

현재 pagination contract 없음.

금지:

```text
?page=
?size=
cursor=
infinite scroll endpoint
```

현재 response를 list로 수용한다.

API v0.2에서 pagination이 정의되면 확장한다.

---

# 77. Travel History Persistence

별도 TravelHistory DB table 존재 여부는
Frontend 관심사가 아니다.

Frontend는 Approved endpoint 결과만 소비한다.

---

# 78. Reservation Detail Query

Owner:

```text
features/reservation
```

Freshness:

```text
F1
```

Entry/focus/reconnect 시
stale하면 background refresh.

주기 polling은 기본값이 아니다.

---
# 79. Success Route Recovery

Reservation Success는
가능하면 Server-driven이다.

```text
/reservation/:reservationId/success
→ reservationId
→ GET Reservation
→ display
```

새로고침 후에도
“방금 생성했던 local object”에 의존하지 않는다.

---

# 80. Query Cache Invalidation After Reservation Success

Server-confirmed success 후:

```text
ReservationDraft clear
selected Schedule/recruitment refresh candidate
Reservation detail refresh candidate
```

무조건 invalidate하지 않음:

```text
all TourProduct
all Travel History
all public data
```

Travel History는 completed travel concept이므로
새 Reservation 생성 직후 무조건 invalidate하지 않는다.

---

# 81. Image State Separation

Image는 Query state와 분리한다.

```text
Placeholder
Loading
Loaded
Failed
```

Image failure:

```text
API Error로 승격하지 않음
```

Feature가 fallback visual을 제공한다.

---

# 82. UI State Priority

기본 priority:

```text
Unauthorized
> Fatal Error
> Offline without usable cache
> Initial Loading
> Empty
> Success
```

단:

```text
Success + Refresh Error
```

는 Success를 유지한다.

---

# 83. Query Data vs Derived Presentation

Server data를 Component에서 반복 해석하지 않는다.

예:

```text
Backend DTO
→ Adapter
→ ScheduleChoiceModel
→ UI
```

Derived View Model은
Feature의 사용자 의미를 제공한다.

Server-owned truth를 재창조하지 않는다.

---

# 84. Runtime Validation

API v0.2가 확정되면
중요 DTO boundary에 runtime validation을 도입하는 것을 기본으로 한다.

우선순위:

```text
Reservation
TourSchedule
Travel History
Auth
```

정확한 validation library는 CP4/Integration 시 선택한다.

목표:

```text
malformed DTO
→ Adapter boundary에서 fail
→ deep UI crash 방지
```

---

# 85. Mock DataSource Architecture

Contract가 닫히기 전
Feature는 Mock Source로 구현할 수 있다.

권장 구조:

```text
Feature Query/Action
→ Feature DataSource Port
→ Mock implementation
→ Frontend Model fixture
```

실제 계약 후:

```text
Feature Query/Action
→ same DataSource Port
→ Backend implementation
→ DTO Adapter
→ Frontend Model
```

---

# 86. DataSource Ports

실제로 필요한 capability에 한해 다음 port를 도입한다.

```text
TourDiscoveryDataSource
TourDetailDataSource
ConfigurationDataSource
ReservationDataSource
AuthDataSource
TravelHistoryDataSource
```

모든 interface를 PR-01에서 빈 파일로 미리 만들지 않는다.

Feature 구현 시
Mock/Real swap이 실제 필요한 시점에 생성한다.

CP1 Delayed Abstraction을 따른다.

---

# 87. DataSource Injection

Feature가 `src/mocks`를 직접 import하지 않게 한다.

Composition:

```text
App Runtime
→ DataSource implementation 선택
→ Feature Query/Action에서 소비
```

Development/Test:

```text
Mock implementation
```

Production integration:

```text
Backend implementation
```

정확한 Provider/API shape는
해당 Feature 구현 시 최소한으로 만든다.

---

# 88. Mock Scenario Baseline

최소 개발 scenario:

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

추가 v0.1.2 Honeymoon scenario:

```text
honeymoon-valid-2-participants
honeymoon-valid-4-participants
honeymoon-invalid-1-participant
honeymoon-invalid-3-participants
```

---

# 89. Mock Naming

Mock-only identity/values는
이름에서 가짜임을 드러낸다.

좋음:

```text
mockTourCardModel
fixtureScheduleChoice
scenarioReservationConflict
```

피한다:

```text
TourApiResponse
ProductionTour
```

실제 contract가 아닌데
공식 data처럼 보이는 naming.

---

# 90. Server State Persistence

TanStack Query cache를
브라우저 영구 storage에 persist하지 않는다.

초기 정책:

```text
memory only
```

ReservationDraft만
명시적으로 sessionStorage에 persist한다.

---

# 91. Draft Persistence Failure

sessionStorage write가 실패할 수 있다.

예:

```text
browser restriction
quota
serialization error
```

이 경우:

```text
in-memory Draft는 유지
persistence capability degraded
```

가능하면 개발 로그와
필요한 사용자 warning을 검토한다.

Draft 저장 실패 때문에
사용자의 현재 화면 선택까지 날리지 않는다.

---

# 92. Multi-Tab Behavior

`sessionStorage`는 tab 단위이므로
각 tab은 독립 ReservationDraft를 가진다.

현재 요구에서
cross-tab Draft synchronization은 구현하지 않는다.

필요하지 않은 BroadcastChannel/localStorage sync를 만들지 않는다.

---

# 93. Draft Expiration

현재 product requirement에
Draft expiry 시간이 정해져 있지 않다.

임의 TTL로 사용자 선택을 삭제하지 않는다.

다만 복구 시:

```text
Server truth 재검증
```

은 필수다.

---

# 94. Draft Validity After Restore

Rehydrated Draft는
“유효한 Reservation”이 아니다.

복구 후:

```text
TourProduct fetch
Schedule fetch
option truth fetch — 계약 있을 때
price/final validation — 계약 있을 때
```

을 통해 최신 truth와 대조한다.

---

# 95. Draft and Stale Selection

복구한 selection이 더 이상 존재하지 않으면:

```text
Draft 전체 삭제 금지
affected selection만 invalid
사용자에게 변경 요구
```

가능한 다른 선택은 유지한다.

---

# 96. State Comments

CP1 주석 정책에 따라
다음 코드에는 lifecycle comment를 요구한다.

```text
ReservationDraft reducer/provider
Draft storage adapter
Auth interruption recovery
Reservation mutation
409 conflict recovery
ambiguous POST state
Query retry function
private cache clear
```

주석은 WHAT이 아니라
WHY / INVARIANT / LIFECYCLE을 설명한다.

---

# 97. State Testing Strategy

CP3 단계에서 Test ownership까지 정의한다.

## Reducer Unit Test

```text
draft action
→ expected state
```

## Persistence Unit Test

```text
serialize
rehydrate
corrupt payload
version mismatch
migration
```

## Query Behavior Test

```text
cache reuse
refresh failure
retry count
401 no retry
F1 focus refresh
```

## Feature Integration Test

```text
401 → login → restore → manual submit
409 → preserve unaffected selections
422 → inline error
ambiguous POST → no automatic retry
```

---

# 98. State Anti-Patterns

## S-01

Server response 전체를 Draft에 저장.

## S-02

Query data와 local state를 중복 복사.

## S-03

모든 state를 global store에 저장.

## S-04

`useEffect`로 derived state를 계속 sync.

## S-05

401에서 Draft clear.

## S-06

Login 성공 후 자동 Reservation submit.

## S-07

Mutation automatic retry.

## S-08

Offline mutation queue.

## S-09

Refresh failure가 기존 성공 data 삭제.

## S-10

Backend price를 Frontend formula로 재계산.

## S-11

Mock response shape를 실제 DTO로 확정.

## S-12

Honeymoon `coupleCount`를 별도 Entity처럼 저장.

## S-13

Honeymoon participantCount에 숨은 default 2 적용.

## S-14

Query Cache를 private data 포함 영구 storage에 persist.

## S-15

History Popup/My Trips가 서로 다른 fetch/cache 사용.

---

# 99. CP3 Decision Log

## CP3-D01 — Three state classes

```text
Server
Transaction
Ephemeral UI
```

로 분리한다.

## CP3-D02 — TanStack Query

Server State library는 TanStack Query를 사용한다.

## CP3-D03 — No extra global store library

현재 scope에서는 Redux/Zustand를 도입하지 않는다.

## CP3-D04 — ReservationDraft uses Context + reducer

명시적 action과 serializable state를 우선한다.

## CP3-D05 — Draft uses sessionStorage

single-tab transaction recovery를 제공한다.

## CP3-D06 — Draft version = V1

Schema version을 반드시 저장한다.

## CP3-D07 — Draft stores choice identity, not server truth

Full DTO/price/status를 저장하지 않는다.

## CP3-D08 — participantCount initial value is null

v0.1.2에서도 UI default는 TBD다.

## CP3-D09 — Honeymoon couple derivation is now approved

유효 participantCount에 대해:

```text
coupleCount = participantCount / 2
```

를 사용할 수 있다.

## CP3-D10 — Couple/Team remains derived, not Entity

별도 persistence/domain Entity를 만들지 않는다.

## CP3-D11 — Mutation auto retry = 0

Reservation/Auth 등 write를 자동 반복하지 않는다.

## CP3-D12 — GET transient retry <= 1

non-retry status/category를 명시한다.

## CP3-D13 — Refresh keeps success

background refresh failure가 기존 content를 지우지 않는다.

## CP3-D14 — No offline mutation queue

Draft만 유지한다.

## CP3-D15 — Auth interruption preserves Draft

로그인 후 Review로 돌아와 사용자가 수동 재-submit한다.

## CP3-D16 — Private cache clears on unauthenticated transition

Public Tour cache는 유지할 수 있다.

## CP3-D17 — Travel History cache is shared

Previous Trips Popup과 My Trips가 같은 query를 소비한다.

## CP3-D18 — Price is not persisted in Draft

Server truth로 유지한다.

## CP3-D19 — Ambiguous Reservation result has no blind retry

Recovery contract 없이는 자동/즉시 재시도하지 않는다.

## CP3-D20 — Polling off by default

focus/reconnect/manual revalidation을 우선한다.

## CP3-D21 — Query cache is memory-only

별도 persistent Query Cache를 사용하지 않는다.

## CP3-D22 — Mock/Real source swap occurs behind DataSource boundary

Feature/UI 변경을 최소화한다.

## CP3-D23 — Latest intent wins

AbortSignal/Query identity로 stale response overwrite를 막는다.

## CP3-D24 — v0.1.2 supersedes old CP0 Honeymoon gate

CP0·CP1·CP2 산출물의 관련 규칙을 v0.1.2 기준으로 정정 완료했다.

---

# 100. CP3 Completion Checklist

## Baseline

- [x] latest docs/main commit rechecked
- [x] latest baseline v0.1.2 identified
- [x] Honeymoon v0.1.2 rule applied
- [x] Frontend stale baseline wording detected
- [x] CP0 stale decision impact identified

## State Ownership

- [x] Server State defined
- [x] Transaction State defined
- [x] Ephemeral UI State defined
- [x] Auth State boundary defined
- [x] ReservationDraft owner defined

## Query Architecture

- [x] TanStack Query selected
- [x] Query Client ownership defined
- [x] Query key ownership defined
- [x] F0/F1/F2/F3/F4 policy defined
- [x] retry policy defined
- [x] focus policy defined
- [x] reconnect policy defined
- [x] polling policy defined
- [x] cancellation/latest-intent policy defined
- [x] partial failure policy defined

## Draft

- [x] Draft V1 conceptual shape defined
- [x] storage key defined
- [x] schema version defined
- [x] serialization rule defined
- [x] rehydration rule defined
- [x] migration rule defined
- [x] clear rule defined
- [x] sensitive-data exclusion defined
- [x] server-truth exclusion defined
- [x] multi-tab behavior defined

## Honeymoon / Participant

- [x] general participant rule defined
- [x] Honeymoon even-count rule defined
- [x] derived coupleCount rule defined
- [x] no hidden participant default
- [x] Couple/Team non-Entity rule defined
- [x] Backend final recruitment authority preserved

## Auth

- [x] Auth state shell defined
- [x] credential persistence prohibited
- [x] ReturnContext defined
- [x] ReturnContext persistence defined
- [x] 401 recovery flow defined
- [x] no auto-resubmit defined
- [x] transaction login popup precedence defined
- [x] private cache clear boundary defined

## Mutation / Error

- [x] duplicate submit prevention defined
- [x] 409 recovery defined
- [x] 422 recovery defined
- [x] 5xx behavior defined
- [x] ambiguous POST behavior defined
- [x] ContractMappingError defined
- [x] user-copy ownership defined

## Offline / Cache

- [x] offline hint semantics defined
- [x] cached public behavior defined
- [x] persistent private cache prohibited
- [x] offline mutation queue prohibited
- [x] Query Cache persistence policy defined

## Mock / Integration

- [x] DataSource boundary defined
- [x] injection direction defined
- [x] Mock scenario baseline defined
- [x] v0.1.2 Honeymoon scenarios added
- [x] Mock naming rule defined

## Tests

- [x] reducer tests defined
- [x] persistence tests defined
- [x] query behavior tests defined
- [x] auth interruption integration test defined
- [x] conflict tests defined
- [x] ambiguous mutation test defined

---

# 101. CP3 Exit Status

```text
CP3 — STATE & DATA ARCHITECTURE
STATUS: COMPLETE
```

결과:

```text
Server State owner                 LOCKED
Transaction State owner            LOCKED
Ephemeral UI State owner           LOCKED
TanStack Query choice              LOCKED
Freshness classes                  LOCKED
Retry policy                       LOCKED
ReservationDraft strategy          LOCKED
Draft V1 persistence               LOCKED
Draft clear policy                 LOCKED
Auth interruption recovery         LOCKED
409 / 422 recovery                 LOCKED
Ambiguous mutation policy          LOCKED
Offline policy                     LOCKED
Travel History cache sharing       LOCKED
Mock → Real source boundary        LOCKED
Honeymoon v0.1.2 semantics         UPDATED / LOCKED
```

---

# 102. Reconciliation Status Before CP4

v0.1.2 반영으로 필요한 구현 계획 산출물 정정은 완료했다.

```text
CP0-IMPLEMENTATION-BASELINE.md
→ latest baseline v0.1.2
→ Honeymoon >=2/even
→ coupleCount = participantCount / 2
→ H-03 CLOSED
→ UI/default/max/API shape는 여전히 gated

CP1-CODE-QUALITY-STANDARDS.md
→ blanket participantCount/2 prohibition 제거
→ valid Honeymoon derived calculation 규칙으로 교체

CP2-FRONTEND-ARCHITECTURE-PLAN.md
→ tour-detail wording 최신화
→ architecture review search rule 최신화
```

아직 Repository 자체의 기존 planning/handoff 문서에는
v0.1.1-only wording이 남아 있을 수 있다.

이 부분은 최종 구현계획 산출물을 Repository에 업로드할 때
`DOC-DRIFT-01` maintenance 범위로 함께 정리한다.

---

# 103. Handoff to CP4

다음 Checkpoint:

```text
CP4 — FOUNDATION IMPLEMENTATION PLAN
```

CP4는 실제 첫 구현 PR을
파일/작업 단위까지 상세하게 설계한다.

반드시 결정할 항목:

```text
React + TypeScript + Vite scaffold
dependency versions
package scripts
TypeScript config
ESLint / formatting
CSS Modules / Design Token setup
App bootstrap
Router
AppProviders
QueryProvider

Button
TextLink
TextField
OptionCard
Dialog
BottomSheet
Skeleton
ImageFrame
PageContainer / Grid
GlobalHeader
TransactionHeader

motion tokens
reduced-motion implementation
Error Boundary

Mock runtime foundation
Vitest
React Testing Library
Playwright

import alias
test setup
README local development
PR-01 exact file list
PR-01 acceptance commands
```

CP4에서는 Library/API version이 현재 시점과 맞는지
실제 package source를 확인한 뒤
Foundation stack을 구체적으로 고정한다.