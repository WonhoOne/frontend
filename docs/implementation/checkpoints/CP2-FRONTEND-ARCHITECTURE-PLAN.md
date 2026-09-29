# Mister World Frontend — CP2 Frontend Architecture Plan

> Status: **COMPLETE**  
> Checkpoint: **CP2 — Frontend Architecture Plan**  
> Date: **2026-09-29**  
> Target repository: `WonhoOne/frontend`  
> Depends on:
> - `CP0-IMPLEMENTATION-BASELINE.md`
> - `CP1-CODE-QUALITY-STANDARDS.md`
> - `src/README.md`
> - `docs/planning/08-COMPONENT-ARCHITECTURE.md`
> - `docs/planning/09-DATA-AND-API-UX.md`
> - `docs/planning/10-RESPONSIVE-ACCESSIBILITY.md`
> - `docs/planning/11-QA-ACCEPTANCE.md`
> - `docs/IMPLEMENTATION-START-HANDOFF.md`
>
> Next checkpoint: **CP3 — State & Data Architecture**

---

# 1. Purpose

CP2의 목적은 CP0의 Contract Boundary와 CP1의 Human-Readable Code 원칙을
**실제 React + TypeScript source tree, ownership, import direction, public API, test boundary**
수준으로 변환하는 것이다.

이 문서 이후 구현자는 다음 질문에 일관되게 답할 수 있어야 한다.

```text
이 코드는 app/pages/features/integrations/shared 중 어디에 들어가는가?
이 Component는 shared인가 feature 전용인가?
Page가 Query를 어디까지 조합해도 되는가?
Backend DTO는 어디까지 올 수 있는가?
Feature 내부 파일을 다른 Feature가 직접 import해도 되는가?
Mock은 Production code에서 어떻게 교체 가능한가?
Test는 어디에 배치하는가?
Route, Error Boundary, Motion, Form, Query는 누가 소유하는가?
```

CP2의 목표는 폴더를 많이 만드는 것이 아니다.

> **책임과 dependency direction을 사람이 코드 구조만 보고 이해할 수 있게 만드는 것**

이 목표다.

---

# 2. Architecture North Star

기존 Frontend Planning의 핵심 흐름을 유지한다.

```text
Route / Page
    ↓
Feature
    ↓
Frontend Model / Feature State
    ↓
Integration Adapter
    ↓
Approved Backend Contract DTO
    ↓
HTTP Client
```

서버 응답 흐름:

```text
HTTP
→ Backend DTO
→ Adapter
→ Frontend Model
→ Feature
→ Page/UI
```

사용자 Action 흐름:

```text
UI Event
→ Feature Action / Hook
→ Integration
→ Backend
→ Normalized Result
→ Feature State / Query Cache
→ UI
```

가장 중요한 Architecture Rule:

> **Raw Backend DTO는 Page와 Visual Component가 직접 소비하지 않는다.**

---

# 3. Current Repository Reality

현재 `main`에는 실제 source skeleton이 존재한다.

```text
src/
├── README.md
├── app/
│   ├── config/
│   ├── errors/
│   ├── providers/
│   └── router/
├── features/
│   ├── auth/
│   ├── configuration/
│   ├── reservation/
│   ├── tour-detail/
│   ├── tour-discovery/
│   ├── travel-history/
│   └── voice-bridge/
├── integrations/
│   ├── backend/
│   └── voice/
├── mocks/
├── pages/
└── shared/
    ├── assets/
    ├── hooks/
    ├── lib/
    ├── motion/
    └── ui/

tests/
└── e2e/
```

현재 대부분의 folder는 structural placeholder다.

아직 없음:

```text
React runtime
Vite scaffold
package.json
main.tsx
real components
real queries
real adapters
real Backend integration
```

따라서 CP2는 skeleton을 존중하면서
첫 구현 PR이 실제 파일을 생성할 때 사용할 상세 규칙을 정의한다.

---

# 4. Top-Level Source Model — LOCKED

Top-level은 다음 구조를 유지한다.

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

새 top-level directory를 쉽게 추가하지 않는다.

특히 다음과 같은 별도 top-level hierarchy는 기본적으로 만들지 않는다.

```text
src/domain/
src/services/
src/store/
src/components/
src/utils/
src/api/
```

이유:

- `domain`은 Feature-local Model과 중복될 가능성이 높음
- `services`는 책임이 모호해지기 쉬움
- `store`는 모든 상태를 한곳에 몰아넣는 유혹이 있음
- `components`는 shared/domain component 구분을 흐림
- `utils`는 책임 없는 helper 집합이 되기 쉬움
- `api`는 이미 `integrations/backend`가 소유함

필요성이 실제 코드로 증명되기 전에는 추가하지 않는다.

---

# 5. `src/main.tsx`

`main.tsx`는 Application entry point다.

소유:

```text
React root 생성
App mount
global stylesheet import
최소한의 bootstrap
```

소유하지 않음:

```text
Router definition
Feature logic
Query logic
Auth logic
Mock scenario 선택 로직의 상세 구현
Business Rule
```

권장 개념:

```tsx
createRoot(rootElement).render(<App />);
```

`main.tsx`는 가능한 한 작게 유지한다.

---

# 6. `src/app/` Ownership

`app`은 **Application Composition Root**다.

소유:

```text
App root
Router wiring
Global providers
Global config
Global Error Boundary
Application-level layout/chrome wiring
Development-only composition switches
```

소유하지 않음:

```text
Tour display logic
Reservation business behavior
Travel History list logic
Backend DTO mapping
Feature-specific form state
```

권장 구조:

```text
app/
├── App.tsx
├── config/
├── errors/
├── providers/
└── router/
```

필요성이 생기면 `layouts/` 또는 `shell/`을 추가할 수 있으나
실제 두 개 이상의 route composition에서 독립 책임이 확인된 뒤 추가한다.

폴더를 미리 비워서 만들지 않는다.

---

# 7. `app/App.tsx`

`App.tsx`의 책임:

```text
AppProviders
Router root
Global Error Boundary
```

예상 개념:

```text
<AppErrorBoundary>
  <AppProviders>
    <AppRouter />
  </AppProviders>
</AppErrorBoundary>
```

Feature-specific Query 또는 화면 Section을 직접 렌더링하지 않는다.

---

# 8. `app/providers/`

Global provider wiring을 소유한다.

예:

```text
AppProviders
QueryProvider
Router-dependent provider
AuthProvider — 실제 계약이 닫힌 뒤 필요 시
```

규칙:

- Provider nesting은 `AppProviders` 한 파일에서 읽을 수 있어야 한다.
- 의미 없는 Provider를 미리 만들지 않는다.
- Feature-local 상태를 모두 global provider로 올리지 않는다.
- Provider가 navigation/business mutation을 숨기지 않는다.

CP3에서 Server/Transaction/Auth state의 구체적 provider 필요성을 확정한다.

---

# 9. `app/router/`

소유:

```text
route path definitions
router creation
route → Page mapping
top-level route layouts
Not Found route
route-level lazy loading — 실제 필요 시
```

현재 Route baseline:

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

Previous Trips Popup은 독립 route가 아니다.

규칙:

- Page path literal을 Component 곳곳에서 중복하지 않는다.
- Route helper/path definition은 router layer가 소유한다.
- `tourId`는 TourProduct ID다.
- Theme 값을 `tourId` 대신 사용하지 않는다.
- Auth protection 정책은 H-04가 닫히기 전 production rule로 확정하지 않는다.

---

# 10. `app/config/`

Frontend runtime config를 소유한다.

예:

```text
environment mode
Backend base URL — 실제 integration 시
development flags
safe public build-time configuration
```

금지:

```text
password
API secret
private token
Backend business config
Tour pricing rule
participant threshold source-of-truth
```

환경변수 접근이 필요해지면
가능한 한 한 config boundary에서 normalize한다.

Component에서 `import.meta.env`를 직접 읽는 패턴을 확산하지 않는다.

---

# 11. `app/errors/`

Application-level render failure boundary를 소유한다.

구분:

```text
React render crash
→ App Error Boundary

GET /api/v1/tours 500
→ Feature Query Error State
```

API Error를 Error Boundary로 처리하지 않는다.

Global Error Boundary는 예상하지 못한 render/runtime failure의 마지막 안전망이다.

---

# 12. `src/pages/` Ownership

Page는 **Route-level composition**이다.

Page가 해도 되는 일:

```text
route params 읽기
Feature Hook 호출
Page-level Query 상태 조합
Feature Component 배치
Route navigation 연결
Page title/metadata
Page-level loading/error/not-found composition
```

Page가 하면 안 되는 일:

```text
raw fetch
HTTP status 직접 해석
Backend DTO parsing
Business Rule 계산
price formula
participant threshold 계산
sessionStorage transaction logic
JWT/token parsing
raw animation keyframe 정의
```

Page를 읽으면 다음이 보여야 한다.

> **이 route는 어떤 Feature들을 어떤 순서로 조합하는가?**

---

# 13. Page Directory Rule

현재 Page directories는 다음을 기준으로 한다.

```text
pages/
├── home/
├── tours/
├── tour-detail/
├── configure/
├── reservation-review/
├── reservation-success/
├── reservation-detail/
├── login/
├── signup/
└── my-trips/
```

각 route folder의 최소 형태:

```text
pages/tour-detail/
└── TourDetailPage.tsx
```

필요 시:

```text
TourDetailPage.module.css
TourDetailPage.test.tsx
```

을 같은 folder에 둘 수 있다.

Page folder마다 무조건 `components/`, `hooks/`, `utils/`를 생성하지 않는다.

Page 전용으로 복잡해진 UI가 Domain 의미를 가진다면
먼저 Feature로 이동할 수 있는지 검토한다.

---

# 14. Screen → Page Mapping

| Screen | Page ownership |
|---|---|
| S01 Home | `pages/home/HomePage.tsx` |
| S02 Tours | `pages/tours/ToursPage.tsx` |
| S03 Tour Detail | `pages/tour-detail/TourDetailPage.tsx` |
| S04 Configure | `pages/configure/ConfigurePage.tsx` |
| S05 Reservation Review | `pages/reservation-review/ReservationReviewPage.tsx` |
| S06 Reservation Success | `pages/reservation-success/ReservationSuccessPage.tsx` |
| S07 Reservation Detail | `pages/reservation-detail/ReservationDetailPage.tsx` |
| S08 Login | `pages/login/LoginPage.tsx` |
| S09 Signup | `pages/signup/SignupPage.tsx` |
| S10 Previous Trips Popup | Auth + Travel History + App composition |
| S11 My Trips | `pages/my-trips/MyTripsPage.tsx` |

Previous Trips Popup을 가짜 `history-detail` route로 만들지 않는다.

---

# 15. `src/features/` Ownership

Feature는 **사용자가 인식 가능한 행동/업무 capability**를 소유한다.

현재 Feature baseline:

```text
features/
├── tour-discovery/
├── tour-detail/
├── configuration/
├── reservation/
├── auth/
├── travel-history/
└── voice-bridge/
```

Feature가 소유할 수 있는 것:

```text
Feature UI
Feature-local Model
Feature Hook
Query/Mutation orchestration
Transaction action
Feature-level validation/presentation
Feature-specific error mapping
Feature-specific state transition
```

---

# 16. Feature Boundary Meaning

각 Feature의 중심 책임:

## `tour-discovery`

```text
Home/Tours의 Theme/TourProduct 발견 경험
Tour card/list presentation
Theme discovery presentation
```

Theme와 TourProduct는 동일하게 취급하지 않는다.

## `tour-detail`

```text
TourProduct 상세 표현
TourStyle presentation/selection
Schedule presentation/selection
Recruitment presentation
```

Honeymoon participant input은 v0.1.2의 `>= 2 + even` rule을 따르며, 유효한 값에서 derived `coupleCount = participantCount / 2`를 presentation에 사용할 수 있다. 다만 Schedule의 최종 confirmed truth는 Backend가 소유한다.

## `configuration`

```text
Hotel/Transport/Meal/Extra 선택 UI
configuration presentation
option group interactions
```

실제 Option DTO/compatibility/price는 Contract Gate를 따른다.

## `reservation`

```text
ReservationDraft
Review
Reservation submit orchestration
Success/Detail presentation
conflict/validation recovery
```

Server Reservation status를 임의 정의하지 않는다.

## `auth`

```text
Login/Signup UI behavior
Auth session interface
ReturnContext
Auth interruption recovery coordination
```

JWT/session 방식은 계약 전 확정하지 않는다.

## `travel-history`

```text
Previous Trips Popup
My Trips
TravelHistory presentation
History query/cache consumer behavior
```

History detail route/pagination을 만들지 않는다.

## `voice-bridge`

```text
Voice 결과를 기존 GUI feature action으로 연결하는 bridge
```

STT engine 자체는 구현하지 않는다.

Voice Contract가 닫히기 전 payload를 추측하지 않는다.

---

# 17. Feature Internal Structure — Minimal by Default

Feature마다 모든 folder를 의무 생성하지 않는다.

작은 Feature 시작:

```text
features/tour-discovery/
├── index.ts
├── TourCard.tsx
└── tourDiscovery.model.ts
```

Feature가 커졌을 때:

```text
features/reservation/
├── index.ts
├── components/
├── hooks/
├── model/
├── queries/
├── mutations/
├── state/
└── lib/
```

사용 기준:

```text
components/  → Feature semantic UI가 여러 개일 때
hooks/       → 재사용되는 Feature Hook이 여러 개일 때
model/       → View Model/Draft/type/mapper가 커졌을 때
queries/     → Server read orchestration이 생겼을 때
mutations/   → Server write orchestration이 생겼을 때
state/       → Transaction/session-local state owner가 명확할 때
lib/         → 해당 Feature 안에서만 쓰는 순수 helper가 여러 개일 때
```

폴더는 **책임이 실제 생겼을 때** 만든다.

---

# 18. Feature Public API — LOCKED

Feature 외부에서는 기본적으로 Feature root의 `index.ts`를 통해 접근한다.

예:

```ts
import {
  TourCollection,
  useTourDiscovery,
  type TourCardModel,
} from '@/features/tour-discovery';
```

피한다:

```ts
import { mapSomething } from '@/features/tour-discovery/model/internal/mapSomething';
import { useInternalState } from '@/features/tour-discovery/hooks/useInternalState';
```

`index.ts`는 Feature의 **공개 계약 surface**다.

외부에 필요한 것만 export한다.

금지:

```ts
export * from './everything';
```

처럼 무분별하게 내부를 모두 공개하는 방식.

---

# 19. Feature Barrel Policy

Root `index.ts`는 허용하고 권장한다.

하지만 nested folder마다 자동으로 `index.ts`를 만들지 않는다.

이유:

- 파일 수 증가
- source 추적 어려움
- circular import 위험
- 실제 origin 찾기 어려움

원칙:

```text
Feature root public barrel → YES
Shared UI root public barrel → YES
모든 내부 folder barrel → 필요할 때만
```

---

# 20. Cross-Feature Dependency Rule

기본 원칙:

> **Page/App가 Feature 간 orchestration을 담당하고, Feature끼리 직접 강하게 결합하지 않는다.**

우선순위:

```text
1. Page에서 두 Feature를 조합할 수 있는가?
2. App composition에서 조합할 수 있는가?
3. 정말 Feature A가 Feature B capability를 필요로 하는가?
```

정말 필요한 경우:

```ts
import { publicCapability } from '@/features/other-feature';
```

처럼 **상대 Feature public API만** 사용할 수 있다.

금지:

```text
Feature A → Feature B private file
A ↔ B 상호 import
순환 dependency
```

Cross-feature public dependency를 추가할 때는
PR에서 이유를 설명할 수 있어야 한다.

---

# 21. Shared Promotion Rule

Component/Hook/Utility를 `shared`로 이동하는 기본 조건:

```text
2개 이상의 Feature/Page에서 실제 사용
AND
Mister World Business 의미가 없음
AND
Props/API가 특정 Feature를 전제로 하지 않음
```

예:

```text
Button → shared
Dialog → shared
ImageFrame → shared
useReducedMotion → shared
```

반면:

```text
TourStyleSelector
ReservationPriceSummary
TravelHistoryCard
RecruitmentProgress
```

는 business/domain 의미가 있으므로
단순히 여러 화면에서 쓰인다고 `shared/ui`로 이동하지 않는다.

---

# 22. `src/shared/` Ownership

현재 baseline:

```text
shared/
├── assets/
├── hooks/
├── lib/
├── motion/
└── ui/
```

Shared는 **Business-agnostic**이어야 한다.

Shared가 import하면 안 되는 것:

```text
features/*
pages/*
integrations/backend/contracts/*
Reservation/Tour/Theme business model
```

Shared가 Business 의미를 알기 시작하면
Feature로 되돌린다.

---

# 23. `shared/ui/`

Foundation primitive와 일반 presentation mechanic을 소유한다.

Foundation에서 예상:

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
Grid / layout primitive
```

Application chrome인:

```text
GlobalHeader
TransactionHeader
```

는 후속 CP4의 구체화에 따라 `src/app/shell`이 소유한다.

Shared UI가 소유:

```text
presentation mechanics
keyboard behavior
focus behavior
generic loading/error visual
Design Token consumption
generic variants
```

소유하지 않음:

```text
TourStyle Business Rule
Reservation submit
Travel History fetch
API status parsing
```

---

# 24. Shared UI File Structure

복잡한 primitive:

```text
shared/ui/Dialog/
├── Dialog.tsx
├── Dialog.module.css
└── Dialog.test.tsx
```

작은 primitive는 필요에 따라 flat file도 허용한다.

Shared UI 전체 공개 surface는:

```text
shared/ui/index.ts
```

에서 관리할 수 있다.

목표는 일관성이지 folder count가 아니다.

---

# 25. `shared/motion/`

소유:

```text
motion duration tokens
easing tokens
reduced-motion helpers
generic route transition primitive
generic dialog/sheet motion primitive
```

소유하지 않음:

```text
Tour Detail Business transition state
Reservation server state
Feature navigation decision
```

Feature-specific motion composition은 Feature/Page에서
Shared Motion primitive를 조합한다.

---

# 26. `shared/hooks/`

정말 Business-agnostic한 Hook만 둔다.

예:

```text
useReducedMotion
useMediaQuery — 필요 시
useFocusReturn — generic으로 검증된 경우
```

금지:

```text
useTour
useReservation
useHistory
```

이들은 해당 Feature 소유다.

---

# 27. `shared/lib/`

Business-agnostic pure helper만 둔다.

예:

```text
safe formatting primitive
DOM helper
generic invariant helper
```

주의:

`shared/lib/utils.ts` 하나에 모든 helper를 몰아넣지 않는다.

이름으로 책임을 드러낸다.

---

# 28. `shared/assets/`

소유:

```text
Frontend-bundled visual assets
generic icons
local static image references
```

Feature-specific asset가 특정 Feature와 항상 같이 변경된다면
Feature 가까이에 두는 것도 허용한다.

Font binary를 repository에 임의 추가하지 않는다.
Font source/license/loading 전략은 Foundation 구현에서 확인한다.

---

# 29. `src/integrations/` Ownership

Integration은 외부 시스템 boundary다.

현재:

```text
integrations/
├── backend/
└── voice/
```

Integration이 알아도 되는 것:

```text
external protocol
HTTPapproved DTO
network error
external event shape
mapping boundary
```

Integration이 알면 안 되는 것:

```text
Page layout
visual spacing
Dialog open/close
route-specific copy
```

---

# 30. `integrations/backend/`

권장 구조:

```text
integrations/backend/
├── client/
├── contracts/
└── adapters/
```

필요 시 실제 endpoint operation file을 추가할 수 있다.

예:

```text
tourApi.ts
scheduleApi.ts
reservationApi.ts
authApi.ts
travelHistoryApi.ts
```

단, API contract가 닫힌 뒤에만 실제 DTO와 operation을 고정한다.

---

# 31. Backend Client Ownership

`client/`이 소유:

```text
base URL
transport
headers
credentials/token attachment — Auth 계약 후
AbortSignal
network error normalization
common response decode
```

소유하지 않음:

```text
Tour mapping
Reservation UX copy
navigation
Feature-specific retry decision
```

Component에서 `fetch()`를 직접 호출하지 않는다.

---

# 32. Backend Contracts Ownership

`contracts/`에는 **Approved Shared API Contract에서 확인 가능한 DTO만** 둔다.

현재 endpoint path/method는 승인됐지만
v0.2 Request/Response DTO field는 대부분 TBD다.

따라서 초기 Foundation에서
그럴듯한 DTO를 미리 생성하지 않는다.

금지 예:

```ts
interface TourResponseDto {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
}
```

위 field가 Approved Contract에 없는데
production DTO처럼 정의하면 안 된다.

---

# 33. Backend Adapter Ownership

`adapters/`의 목적:

```text
Approved DTO
→ Frontend-facing Model
```

예상 개념:

```text
mapTourProductDtoToCardModel
mapTourProductDtoToDetailModel
mapScheduleDtoToChoiceModel
mapReservationDtoToDetailModel
mapTravelHistoryDtoToItemModel
```

Adapter는:

```text
field mapping
normalization
contract validation result handling
presentation-ready semantic transformation
```

을 수행할 수 있다.

Adapter가 하지 않는 것:

```text
navigation
toast
Dialog open
business policy invention
frontend price calculation
```

---

# 34. Adapter → Feature Model Type Rule

Frontend-facing Model은 Feature-local이라는 기존 계획을 유지한다.

Runtime dependency의 기본 방향은:

```text
Feature → Integration
```

Adapter가 Feature Model return type을 명시적으로 사용해야 하는 경우
**type-only import**만 허용한다.

예:

```ts
import type { TourDetailModel } from '@/features/tour-detail';
```

조건:

```text
Integration → Feature component/hook/state runtime import 금지
type-only reference만 허용
circular runtime dependency 금지
```

가능하면 TypeScript inference와 mapper boundary로
불필요한 reverse dependency를 최소화한다.

CP3에서 실제 Query/DataSource 구조를 확정할 때
cycle이 없는지 다시 감사한다.

---

# 35. Integration Runtime Dependency Rule

금지:

```text
integration → page
integration → feature component
integration → router navigation
integration → shared visual component
```

허용:

```text
integration → shared/lib의 business-agnostic helper
integration → feature model type-only reference
```

---

# 36. `integrations/voice/`

Voice external event boundary.

아직 Voice Contract가 최종 확정되지 않았으므로
실제 payload/command enum을 추측하지 않는다.

향후 구조:

```text
external Voice event
→ voice integration adapter
→ voice-bridge Feature
→ existing Feature action
```

Voice 전용 Business Logic 복제 금지.

---

# 37. `src/mocks/` Ownership

Mock은 **개발/테스트를 위한 Frontend fixture/scenario**다.

Mock은 API Contract가 아니다.

권장 구조는 실제 필요에 따라:

```text
mocks/
├── fixtures/
├── scenarios/
└── runtime/
```

무조건 세 folder를 미리 만들 필요는 없다.

---

# 38. Mock Rule Before DTO Contract Closure

Contract-gated 화면에서는:

```text
Mock Fixture
→ Frontend Model
→ Feature/UI
```

를 사용한다.

금지:

```text
추측 Backend JSON
→ MSW fake REST endpoint
→ 그것을 실제 DTO처럼 사용
```

Approved endpoint를 MSW로 mock하더라도
Request/Response shape가 미확정이면
그 shape를 production contract처럼 퍼뜨리지 않는다.

---

# 39. Mock Runtime Import Rule

Production Feature가
직접 `src/mocks`를 import하는 구조를 기본으로 하지 않는다.

가능한 방식:

```text
App development composition
→ Mock DataSource/Scenario 주입
→ Feature
```

또는 test file에서 직접 fixture를 사용한다.

Mock과 Real Integration의 교체 지점은
Feature/UI 밖의 composition boundary에 두는 것이 목표다.

CP3에서 구체적인 DataSource/Query wiring을 잠근다.

---

# 40. Query Ownership

Query는 기본적으로 **Server State를 소비하는 Feature가 소유**한다.

예:

```text
tour-discovery → TourProduct list query
tour-detail    → TourProduct detail / schedule query
reservation    → Reservation detail query
travel-history → Travel History query
```

Query key도 해당 Server capability의 Feature/Data boundary가 소유한다.

Component가 임의 string key를 만들지 않는다.

구체적인 TanStack Query 여부와 Query key shape는 CP3/CP4에서 확정한다.

---

# 41. Mutation Ownership

Mutation은 행동을 소유한 Feature에 둔다.

예:

```text
auth → login/signup
reservation → create reservation
```

Configuration validation/reprice mutation은
실제 API contract가 생겼을 때 소유 위치를 확정한다.

Mutation은:

```text
network action
normalized result
cache coordination
feature transaction transition
```

을 조율할 수 있다.

Navigation 자체는 가능하면 Page/App orchestration이 보이게 유지한다.

---

# 42. Model Ownership

Frontend Model은
가장 가까운 Feature가 소유한다.

예:

```text
TourCardModel          → tour-discovery
TourDetailModel        → tour-detail
ScheduleChoiceModel    → tour-detail
Configuration model    → configuration
ReservationDraft       → reservation
ReservationDetailModel → reservation
TravelHistoryItemModel → travel-history
ReturnContext          → auth/reservation 협의, CP3 확정
```

Top-level global domain model directory를 만들지 않는다.

---

# 43. ReservationDraft Ownership

기존 계획대로 `reservation` Feature가 transaction owner가 되는 것을 기본으로 한다.

이유:

```text
Tour Detail
→ Configure
→ Review
→ Auth interruption
→ Review restore
→ Reservation submit
```

를 관통하기 때문이다.

Draft는 Server DTO 복사본이 아니다.

Draft 상세 shape, persistence/versioning/migration은 CP3에서 확정한다.

---

# 44. Form Ownership

## Login/Signup

Auth Feature가 Form behavior를 소유한다.

단 H-04 때문에
Credential field contract는 추측하지 않는다.

## Configure

Configuration Feature가 selection interaction을 소유하고,
Reservation Draft와의 transaction coordination은 Reservation Feature boundary와 연결한다.

정확한 cross-feature state relation은 CP3에서 순환 dependency 없이 확정한다.

## Review

Reservation Feature가 review/submit state를 소유한다.

---

# 45. Error Ownership

구분:

```text
Transport/network normalization
→ integrations/backend

Feature semantic error mapping
→ 해당 feature

Page-level composition
→ pages

Unexpected render crash
→ app/errors
```

Backend raw message를 Shared Error Component가 직접 출력하지 않는다.

---

# 46. User-Facing Error Copy

User-facing copy는
Feature/Screen 책임이다.

흐름:

```text
HTTP/raw error
→ normalized error category
→ Feature-specific presentation
→ Shared generic Error primitive
```

Shared primitive는 문자열/액션을 표현할 뿐
Business 의미를 결정하지 않는다.

---

# 47. Layout Ownership

## Generic layout

```text
PageContainer
Grid
Section
Stack-like primitive — 실제 필요 시
```

→ `shared/ui`

## App chrome

```text
GlobalHeader
TransactionHeader
global footer/shell
```

→ `src/app/shell`

App chrome은 shared primitive가 아니라 Application composition 책임이다.
Feature-specific data/action은 public props/slot 또는 App composition으로 주입하고,
Header가 Feature Query를 직접 소유하지 않는다.

## Screen composition

→ Page

---

# 48. Responsive Ownership

Responsive rule은 세 단계로 나눈다.

```text
Design Token / breakpoint primitive → shared
Component 자체 responsive behavior → component owner
Screen-level layout transformation → Page
```

예:

```text
Configure >=1024 2-column + sticky summary
Configure <1024 1-column + bottom action
```

같은 화면 구조 변화는 Page/Feature composition에서 관리한다.

---

# 49. Accessibility Ownership

Accessibility는 layer별 책임이다.

## Shared Primitive

```text
Button semantics
TextField label/error association
Dialog focus trap/return
BottomSheet close path
focus-visible
touch target
```

## Feature

```text
Domain status semantics
meaningful labels
error copy
live region 필요성
```

## Page/App

```text
landmark
H1
main id
skip link
route focus strategy
```

A11Y를 한 `accessibility.ts` 파일에 몰아넣지 않는다.

---

# 50. Motion Ownership

```text
token/easing/duration/reduced-motion helper
→ shared/motion

generic Dialog/Sheet motion
→ shared UI + shared/motion

Feature semantic motion
→ 해당 Feature

route transition orchestration
→ app/router 또는 Page composition
```

Motion이 navigation/business decision을 소유하지 않는다.

---

# 51. Styling Architecture

기본 방향:

```text
CSS Custom Properties → Design Tokens
scoped component styles → CSS Modules 또는 동등한 방식
global reset/base → app/bootstrap layer
```

정확한 styling tool은 Foundation CP4에서 확정한다.

규칙:

- random color/spacing literal 확산 금지
- z-index 9999 금지
- motion duration random literal 금지
- Feature style가 global selector를 남발하지 않음
- Page-specific global CSS 금지에 가깝게 취급

---

# 52. Import Alias Rule

Foundation에서 다음 alias 하나를 권장한다.

```text
@/ → src/
```

예:

```ts
import { Button } from '@/shared/ui';
import { TourCollection } from '@/features/tour-discovery';
```

Alias를 여러 개 만들지 않는다.

피한다:

```text
@components
@hooks
@models
@utils
@services
@store
```

Top-level architecture 자체가 책임을 설명하도록 한다.

---

# 53. Relative Import Rule

같은 작은 local module 안에서는 relative import를 허용한다.

예:

```ts
import { TourCard } from './TourCard';
```

Top-level boundary를 넘는 import는 alias를 사용하면
dependency 방향이 눈에 잘 보인다.

예:

```ts
import { ImageFrame } from '@/shared/ui';
```

---

# 54. Circular Dependency Prevention

다음 패턴을 금지한다.

```text
Feature A → Feature B → Feature A
shared → feature → shared
integration runtime → feature → integration
```

방지 원칙:

1. Page/App orchestration을 우선
2. public API만 import
3. type-only reverse reference 최소화
4. common business-agnostic primitive만 shared로 이동
5. Business 의미를 shared로 도피시키지 않음

Foundation 또는 이후 lint/tooling에서
cycle 감지가 실용적이면 도입을 검토한다.

---

# 55. Test Placement — LOCKED

## Unit / Component

가능하면 대상 코드 가까이에 둔다.

예:

```text
shared/ui/Dialog/
├── Dialog.tsx
├── Dialog.module.css
└── Dialog.test.tsx
```

또는:

```text
features/reservation/
├── ReservationSummary.tsx
└── ReservationSummary.test.tsx
```

## Feature Integration Test

여러 Feature internal module을 함께 검증해야 한다면
해당 Feature 안에 둔다.

예:

```text
features/reservation/__tests__/
```

단 한두 개 테스트 때문에
무조건 `__tests__` folder를 만들 필요는 없다.

## E2E

```text
tests/e2e/
```

Critical Journey J01~J10을 최종적으로 여기서 검증한다.

---

# 56. Test Import Rule

Test가 private implementation detail에 과도하게 의존하지 않는다.

우선:

```text
Feature public behavior
Component accessible behavior
observable state
```

를 검증한다.

테스트 편의를 위해 production `index.ts`에
internal helper를 export하지 않는다.

---

# 57. Test Fixture Rule

Test fixture는:

```text
test file local fixture
또는
src/mocks의 명확한 shared fixture
```

를 사용할 수 있다.

Mock Backend DTO를 만들어야 하는 테스트는
Approved Contract가 생긴 뒤 실제 contract type 기준으로 작성한다.

---

# 58. DataSource Abstraction Rule

기존 Data/API UX 문서는 다음 conceptual interface를 허용한다.

```text
TourDataSource
ScheduleDataSource
ConfigurationDataSource
ReservationDataSource
AuthDataSource
TravelHistoryDataSource
```

CP2에서는 이를 **무조건 생성하는 파일 목록으로 고정하지 않는다.**

DataSource abstraction은 다음 조건에서 도입한다.

```text
Mock과 Real source를 실제로 교체해야 함
AND
Feature가 외부 transport를 몰라도 되는 이점이 명확함
AND
interface 이름/책임이 구체적임
```

CP3에서 State/Data wiring을 설계하면서
필요한 DataSource만 확정한다.

이 결정은 CP1의 “Delayed Abstraction”을 따른다.

---

# 59. Query Library Boundary

특정 library는 아직 Shared Contract가 아니다.

현재 추천:

```text
TanStack Query 또는 equivalent
```

Architecture가 library-specific API를
Page 전체에 직접 퍼뜨리지 않도록 한다.

Feature Query Hook을 통해
페이지가 필요한 의미를 소비하는 것이 기본이다.

예:

```text
useTourDetail()
useTravelHistory()
```

단 단순 wrapper만 만드는 무의미한 Hook은 피한다.

---

# 60. No Central `services/`

`services/` top-level을 만들지 않는다.

일반적인 `TourService`, `ReservationService`가
다음 책임을 모두 삼키는 문제가 생기기 쉽다.

```text
fetch
mapping
cache
business logic
navigation
```

대신 책임에 따라:

```text
Integration
Query
Feature Action
Adapter
```

로 배치한다.

---

# 61. No Central `store/`

모든 상태를 `src/store`에 모으지 않는다.

State owner가 코드 위치에서 보여야 한다.

```text
Server state      → Query owner
ReservationDraft  → reservation feature
Auth session      → auth feature/provider
Dialog open       → local component
```

CP3에서 구체적으로 잠근다.

---

# 62. No Central `utils/`

Global `utils.ts` 또는 거대한 `utils/`를 만들지 않는다.

Helper 배치 우선순위:

```text
Feature-specific → Feature/lib 또는 바로 근처
Shared generic   → shared/lib의 구체적인 이름
Integration      → integrations boundary
```

---

# 63. Public Route Composition

Route file은 Page를 import한다.

예:

```text
router
→ HomePage
→ ToursPage
→ TourDetailPage
...
```

Router가 Feature internals를 직접 조합하지 않는다.

Feature 조합은 Page가 맡는다.

단 Previous Trips처럼 Application-level overlay는
App/Auth composition에서 예외적으로 조율할 수 있다.

---

# 64. Previous Trips Popup Architecture

S10은 독립 route가 아니다.

흐름:

```text
Auth success
→ App/Auth orchestration
→ Travel History query
→ Previous Trips overlay
```

구성 책임:

```text
Auth Feature          → login success / return context
Travel History Feature→ history data/presentation
App composition       → overlay timing/placement
Shared Dialog         → modal mechanics
```

한 Component가 이 네 책임을 모두 가지지 않는다.

---

# 65. Auth Interruption Architecture

Reservation flow 중 Auth가 필요할 때:

```text
Reservation Feature → Return intent
Auth Feature        → Login
Reservation Draft   → 유지
Router/Page         → Review 복귀
User                → manual submit
```

자동 Reservation 재-submit을 Auth Hook 안에 숨기지 않는다.

상세 state flow는 CP3에서 확정한다.

---

# 66. Configuration ↔ Reservation Boundary

Configure 화면은 두 책임이 만난다.

```text
Configuration Feature
→ 옵션 선택 UI/interaction

Reservation Feature
→ transaction draft/lifecycle
```

구현 원칙:

- Configuration이 Reservation submit을 소유하지 않는다.
- Reservation이 Hotel/Meal UI를 직접 그리지 않는다.
- 두 Feature가 서로 private 내부를 import하지 않는다.
- 필요 시 Page 또는 좁은 public API로 조정한다.

CP3에서 Draft action interface를 정한다.

---

# 67. Tour Discovery ↔ Tour Detail Boundary

```text
tour-discovery
→ 고객이 TourProduct를 선택

router
→ /tours/:tourId

tour-detail
→ 해당 TourProduct 상세
```

Discovery Feature가 Detail의 private model을 직접 사용하지 않는다.

공통 식별자 전달은 route `tourId` 정도로 제한한다.

---

# 68. Travel History Cache Sharing

Previous Trips Popup과 My Trips는
동일한 Travel History server state를 소비해야 한다.

따라서 Query ownership은 `travel-history` Feature에 둔다.

두 Page/Overlay가 각각 별도 fetch abstraction을 만들지 않는다.

구체 cache key/freshness는 CP3에서 확정한다.

---

# 69. Shared UI vs Domain UI Examples

## Shared

```text
Button
TextLink
TextField
Dialog
BottomSheet
Skeleton
ImageFrame
PageContainer
Grid
```

## Feature/domain

```text
ThemeEditorialCard
TourCollectionCard
TourHero
TourStyleSelector
ScheduleCard
RecruitmentProgress
ConfigurationOptionCard
TripSummary
ReservationStatusSectionTravelHistoryCard
PreviousTripPreviewCard
```

판정 질문:

> **이 Component 이름/Props에서 Theme/Tour/Reservation/TravelHistory 의미가 사라져도 자연스러운가?**

YES면 Shared 후보,
NO면 Feature에 둔다.

---

# 70. Skeleton Ownership

Generic Skeleton primitive:

```text
shared/ui/Skeleton
```

화면 geometry를 닮은 Skeleton composition:

```text
Feature 또는 Page owner
```

예:

```text
TourDetailSkeleton
→ tour-detail Feature/Page
```

Shared Skeleton이
Tour Hero 구조를 알아서는 안 된다.

---

# 71. Image Ownership

`ImageFrame`:

```text
Placeholder
Loading
Loaded
Failed
```

mechanic을 Shared가 소유한다.

어떤 fallback art/theme accent를 쓸지는
Feature가 결정한다.

API image failure를
전체 data error로 승격하지 않는다.

---

# 72. Dialog / BottomSheet Ownership

Shared primitive가 소유:

```text
focus trap
focus return
Escape
aria-modal
close mechanics
backdrop
reduced motion
```

Feature가 소유:

```text
dialog content
business action
validation
query/mutation
```

Shared Dialog 내부에 Reservation API 호출을 넣지 않는다.

---

# 73. Header Ownership

`GlobalHeader`, `TransactionHeader`는
Foundation에서 `src/app/shell`의 공용 Application chrome component로 시작한다.

공통 header mechanics:

```text
layout
navigation affordance
accessible landmark
mobile adaptation
```

만 소유한다.

Feature-specific action/state가 필요해지면
slot/props 또는 App composition으로 전달한다.

Header가 Feature query를 직접 호출하지 않는다.

---

# 74. Route-Level Error and NotFound

`NotFound`는 Router/App에서 소유한다.

Resource NotFound:

```text
/tours/:tourId에서 TourProduct 없음
```

은 Tour Detail Feature/Page state로 처리한다.

구분:

```text
Unknown route
→ App Router Not Found

Known route + missing resource
→ Feature Not Found
```

---

# 75. ContractMappingError Boundary

Malformed Backend data:

```text
HTTP 200
+ Adapter가 Frontend Model 생성 불가
→ ContractMappingError
```

소유:

```text
Integration normalization/adaptation
```

표현:

```text
Feature-specific local error UI
```

App Error Boundary로 던져 전체 앱을 죽이는 것을 기본으로 하지 않는다.

---

# 76. Dependency Matrix

| From | May depend on | Must not depend on |
|---|---|---|
| `main.tsx` | `app`, global style | feature internals, integrations |
| `app` | pages, features public API, shared, integration composition | feature private internals |
| `pages` | features public API, shared, app route helpers | raw backend contracts, feature private internals |
| `features` | shared, integrations, other feature public API by exception | pages, app, other feature private internals |
| `integrations` | shared/lib, approved contracts, feature model type-only if required | pages, feature runtime UI/state |
| `shared` | browser/React/generic libs | pages, features, business contracts |
| `mocks` | frontend models, test/dev utilities | production business authority |

---

# 77. Runtime Import Direction

기본 Runtime graph:

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

App는 composition root이므로
필요한 경우 Feature/Integration을 함께 조합할 수 있다.

Integration에서 Feature로의 Runtime import는 금지한다.

---

# 78. Type-Only Dependency Exception

Feature-local Model type을 Adapter signature에 사용하기 위해
Integration → Feature type-only import가 필요한 경우 허용할 수 있다.

조건:

```text
import type only
runtime JS dependency 없음
Feature public API 또는 model type만 사용
component/hook/state import 금지
cycle 없음
```

이 exception이 늘어난다면
CP9 final audit에서 architecture smell로 재검토한다.

---

# 79. Architecture Enforcement During Review

PR review에서 최소 다음을 검색한다.

```text
pages 안의 fetch(
pages 안의 DTO field access
shared → features import
features → pages import
deep feature import
integration → component import
src/mocks production import
Honeymoon participantCount 유효성 검사 없이 coupleCount 계산
Couple/Team Entity 또는 coupleCount API field 발명
Theme를 tourId로 사용
```

가능하면 lint/import rule 자동화는 Foundation에서 검토한다.

---

# 80. Architecture Comment Policy

CP1 Comment-heavy rule을 Architecture boundary에도 적용한다.

특히 다음에는 책임 설명을 남긴다.

```text
Data adapter
ReservationDraft owner
cross-feature public dependency
mock injection boundary
Auth ReturnContext
ContractMappingError
non-obvious route orchestration
```

단 folder structure 자체를 반복 설명하는 주석은 만들지 않는다.

---

# 81. Architecture Change Policy

CP2 구조는 절대 변경 불가가 아니다.

다만 다음 조건 없이 구조를 바꾸지 않는다.

```text
실제 코드에서 반복되는 문제
명확한 dependency pain
테스트 어려움
순환 dependency
변경 영향 범위 과다
```

변경할 때:

```text
문제
현재 구조의 한계
제안 구조
영향 파일
migration 범위
```

를 PR에 설명한다.

“다른 프로젝트에서 그렇게 했다”는 이유만으로 바꾸지 않는다.

---

# 82. Example — Correct Tour Detail Flow

```text
router
→ TourDetailPage
→ useTourDetail()
→ tour-detail query
→ backend operation
→ approved DTO
→ adapter
→ TourDetailModel
→ TourHero / TourStyleSelector / Schedule section
```

Page는 raw JSON field를 모른다.

---

# 83. Example — Incorrect Tour Detail Flow

금지:

```text
TourDetailPage
→ fetch('/api/v1/tours/' + tourId)
→ response.json()
→ response.themeCode
→ response.options
→ participant math
→ JSX
```

문제:

```text
transport
DTO
business logic
view
route
```

가 한 파일에 섞인다.

---

# 84. Example — Correct Dialog Flow

```text
Feature
→ business content/action
→ Shared Dialog
→ focus trap/return/Escape
```

Shared Dialog는 Feature를 모른다.

---

# 85. Example — Correct Mock Flow

Contract 미확정:

```text
Mock TourDetailModel fixture
→ Mock source
→ Feature
→ UI
```

Contract 확정 후:

```text
GET /api/v1/tours/{tourId}
→ DTO
→ Adapter
→ same TourDetailModel
→ same Feature
→ same UI
```

UI 변경이 최소여야 한다.

---

# 86. Example — Incorrect Mock Flow

금지:

```text
mockTourResponse.json
→ guessed backend fields
→ component props
→ 11 screens에서 직접 사용
```

실제 DTO가 달라지면
전체 앱을 뜯어야 하는 구조다.

---

# 87. Architecture Review Checklist

## Top-Level

- [ ] 새 top-level folder가 불필요하게 생기지 않았다.
- [ ] `app/pages/features/integrations/shared/mocks` 책임이 유지된다.
- [ ] `main.tsx`가 bootstrap 이상을 하지 않는다.

## Pages

- [ ] Page가 route composition에 집중한다.
- [ ] raw fetch가 없다.
- [ ] DTO parsing이 없다.
- [ ] Business Rule 계산이 없다.
- [ ] Feature private import가 없다.

## Features

- [ ] Feature가 사용자 capability 단위로 구성된다.
- [ ] Feature-local model이 가까이 있다.
- [ ] 외부 공개 surface가 `index.ts`로 제한된다.
- [ ] 다른 Feature private 파일을 import하지 않는다.
- [ ] meaningless subfolder가 없다.

## Integrations

- [ ] approved DTO만 contracts에 있다.
- [ ] adapter가 UI navigation을 하지 않는다.
- [ ] HTTP client가 Business mapping을 하지 않는다.
- [ ] Integration이 Page/UI를 runtime import하지 않는다.

## Shared

- [ ] Business terminology를 모른다.
- [ ] Feature/API contract를 import하지 않는다.
- [ ] reusable mechanic만 소유한다.

## Mocks

- [ ] Mock임이 이름에서 드러난다.
- [ ] Mock shape가 Backend contract로 위장되지 않는다.
- [ ] Production UI에 raw mock JSON이 직접 퍼지지 않는다.

## Tests

- [ ] Unit/Component test가 대상 가까이에 있다.
- [ ] E2E는 `tests/e2e`에 있다.
- [ ] 테스트 때문에 private production export를 추가하지 않았다.

---

# 88. CP2 Decision Log

## CP2-D01 — Keep top-level architecture small

```text
app
pages
features
integrations
shared
mocks
```

를 유지한다.

## CP2-D02 — Page is composition

Page는 route-level orchestration만 소유한다.

## CP2-D03 — Feature owns behavior

사용자 capability와 Feature-local Model/State는 Feature가 소유한다.

## CP2-D04 — Integration isolates external contracts

HTTP, DTO, Adapter, external event는 Integration boundary에 둔다.

## CP2-D05 — Shared is business-agnostic

Business 의미가 있는 Component는 shared로 승격하지 않는다.

## CP2-D06 — Minimal feature folders

Feature 내부 subfolder는 실제 책임이 생길 때만 만든다.

## CP2-D07 — Feature root public API

Feature 외부 접근은 root `index.ts`를 기본으로 한다.

## CP2-D08 — No private deep imports

Page/다른 Feature가 Feature 내부 private path를 직접 import하지 않는다.

## CP2-D09 — Page/App orchestrates cross-feature behavior

Feature끼리 강결합하기 전에 Page/App composition을 우선한다.

## CP2-D10 — Runtime direction remains downward

기본 runtime dependency:

```text
main → app → pages → features → integrations
                 ↘ shared
```

## CP2-D11 — Adapter may use type-only model reference only by exception

Integration → Feature runtime import는 금지한다.

## CP2-D12 — No central services/store/utils

책임이 흐려지는 top-level generic directory를 만들지 않는다.

## CP2-D13 — `@/` single import alias

복수 alias보다 source structure 자체로 책임을 표현한다.

## CP2-D14 — Colocate unit/component tests

Unit/Component test는 구현 가까이에 둔다.

## CP2-D15 — E2E stays separate

Cross-screen Critical Journey는 `tests/e2e`가 소유한다.

## CP2-D16 — Mock is replaceable source

Mock은 View Model boundary 뒤에 두고 Backend contract로 승격시키지 않는다.

## CP2-D17 — Query/Mutation follows feature ownership

Server capability를 사용하는 Feature가 query/mutation orchestration을 소유한다.

## CP2-D18 — Reservation owns transaction draft

구체 구현은 CP3에서 확정하되 transaction lifecycle owner는 reservation Feature를 기본으로 한다.

## CP2-D19 — Travel History query is shared by its two surfaces

Previous Trips Popup과 My Trips가 같은 travel-history server state를 소비한다.

## CP2-D20 — Accessibility/motion/responsive are distributed responsibilities

하나의 나중 작업으로 몰지 않고 owner layer에서 함께 구현한다.

---

# 89. Explicitly Deferred to CP3

CP2는 위치/책임을 고정했지만
다음 세부사항은 CP3에서 결정한다.

```text
TanStack Query 실제 채택 여부
Query Client config
Query key exact factory
freshness 값의 code representation
retry implementation

ReservationDraft exact TypeScript shape
Draft version
sessionStorage key
serialization
rehydration
migration
clear policy implementation

Auth state shape
ReturnContext exact shape
auth interruption restoration flow

Configuration ↔ Reservation state action interface

Mock DataSource injection 방식
Real Adapter 교체 방식

Error type exact structure
ContractMappingError exact type
mutation state exact orchestration
```

---

# 90. CP2 Completion Checklist

## Repository Reality

- [x] current source skeleton rechecked
- [x] app directories rechecked
- [x] feature directories rechecked
- [x] integration directories rechecked
- [x] shared directories rechecked
- [x] E2E directory rechecked

## Ownership

- [x] `main.tsx` ownership defined
- [x] app ownership defined
- [x] pages ownership defined
- [x] features ownership defined
- [x] integrations ownership defined
- [x] shared ownership defined
- [x] mocks ownership defined

## Feature Architecture

- [x] current Feature list retained
- [x] Feature responsibilities defined
- [x] minimal internal folder rule defined
- [x] Feature public API defined
- [x] barrel policy defined
- [x] cross-feature rule defined
- [x] shared promotion rule defined

## Integration Architecture

- [x] backend client responsibility defined
- [x] contract ownership defined
- [x] adapter ownership defined
- [x] raw DTO containment defined
- [x] Voice integration boundary defined
- [x] ContractMappingError location defined

## State/Data Placement

- [x] Query ownership defined
- [x] Mutation ownership defined
- [x] Model ownership defined
- [x] ReservationDraft owner defined
- [x] Travel History cache owner defined
- [x] DataSource abstraction threshold defined

## UI Architecture

- [x] Shared UI rule defined
- [x] Domain UI rule defined
- [x] Layout ownership defined
- [x] Skeleton ownership defined
- [x] Image ownership defined
- [x] Dialog/Sheet ownership defined
- [x] Header ownership defined
- [x] responsive ownership defined
- [x] accessibility ownership defined
- [x] motion ownership defined

## Dependency Safety

- [x] dependency matrix defined
- [x] runtime direction defined
- [x] type-only exception defined
- [x] circular dependency prevention defined
- [x] import alias rule defined
- [x] deep import prohibition defined
- [x] central services/store/utils rejected

## Testing

- [x] unit/component colocation defined
- [x] feature integration test placement defined
- [x] E2E ownership defined
- [x] fixture rule defined
- [x] test-only production export prohibited

---

# 91. CP2 Exit Status

```text
CP2 — FRONTEND ARCHITECTURE PLAN
STATUS: COMPLETE
```

결과:

```text
Top-level source model             LOCKED
App ownership                      LOCKED
Page ownership                     LOCKED
Feature ownership                  LOCKED
Integration ownership              LOCKED
Shared ownership                   LOCKED
Mock ownership                     LOCKED
Feature public API                 LOCKED
Dependency direction               LOCKED
Cross-feature rule                 LOCKED
Raw DTO containment                LOCKED
Test placement                     LOCKED
Import alias policy                LOCKED
Architecture review checklist      LOCKED
```

CP2 이후부터는
새 코드가 어느 layer에 속하는지 판단할 공통 기준이 생겼다.

---

# 92. Handoff to CP3

다음 Checkpoint:

```text
CP3 — STATE & DATA ARCHITECTURE
```

CP3의 목적:

> **어떤 상태를 누가 소유하고,
> 서버 데이터와 transaction draft를 어떻게 분리하며,
> 새로고침/Auth interruption/Conflict에서도 사용자 선택을 어떻게 보존할지
> code-level로 확정한다.**

반드시 결정할 항목:

```text
Server State
Transaction State
Ephemeral UI State

Query library decision
Query key factory
F0/F1/F2/F3/F4 freshness implementation
retry/refetch policy

ReservationDraft exact model
Draft versioning
sessionStorage persistence
rehydration
migration
clear policy

Auth session state
ReturnContext
401 interruption
manual resubmit

409 conflict
422 validation
ambiguous Reservation POST result

Mock source wiring
Real Backend adapter swap

Error normalization model
ContractMappingError

stale refresh
offline
focus/reconnect behavior
partial failure
race/cancellation
```

CP3는 CP2의 dependency direction을 깨지 않고
State/Data flow를 그 위에 배치해야 한다.