# Mister World Frontend Component Architecture

> Document: `08-COMPONENT-ARCHITECTURE.md`  
> Status: **CP7 Complete**  
> Scope: `WonhoOne/frontend` Customer GUI  
> Planning baseline: 2026-09-29  
> Shared baseline used: `WonhoOne/docs/main` v0.1.1 planning contract  
> Depends on:
> - `00-PLANNING-INDEX.md`
> - `02-INFORMATION-ARCHITECTURE.md`
> - `04-DESIGN-SYSTEM.md`
> - `05-MOTION-SYSTEM.md`
> - `06-UI-STATES.md`
> - `07-SCREEN-SPECS.md`
> - `audits/CP6-H-CONTRACT-TBD-AUDIT.md`
> - `audits/CP6-I-FINAL-IMPLEMENTATION-READINESS.md`

---

# 0. CP7 Objective

CP7의 목표는 CP6에서 완성한 11개 Screen Spec을 실제 React + TypeScript 코드 구조로 옮길 때
**어떤 책임을 어디에 둘지 미리 잠그는 것**이다.

핵심 목적은 두 가지다.

첫째:

> 화면 컴포넌트가 API DTO, fetch 구현, Business Rule, animation 세부 구현을 직접 소유하지 않게 한다.

둘째:

> 아직 확정되지 않은 Shared Contract가 변경되더라도 UI 전체를 다시 뜯지 않게 한다.

CP7 이후 구현자는 다음 질문에 답할 수 있어야 한다.

```text
이 컴포넌트는 shared인가 feature 전용인가?
서버 데이터는 어디서 가져오는가?
DTO를 어디에서 View Model로 바꾸는가?
Configuration draft는 누가 소유하는가?
Auth 상태는 어디에 있는가?
Skeleton은 어디에 붙는가?
Screen이 직접 business rule을 계산해도 되는가?
Mock 데이터는 어디까지 허용되는가?
테스트는 어느 레이어에서 무엇을 검증하는가?
```

---

# 1. Current Repository Reality

Repository setup now tracks the agreed source-directory skeleton on the frontend planning branch.

Current state:

```text
README / AGENTS / docs
+
public/
src/
tests/
```

The folders are structural placeholders only. The actual React + TypeScript scaffold, package configuration, runtime files, and tests are still the responsibility of the first implementation foundation PR.

The source skeleton follows the human-first structure in this document so contributors can see ownership boundaries before implementation begins.

Current Frontend responsibility remains:

```text
React + TypeScript Customer GUI
Backend API integration
Frontend validation for UX
Frontend tests
```

Prohibited:

```text
DB direct access
Backend business logic ownership
Voice recognition implementation
shared API field invention
TBD assumption hard-coding
```

---

# 2. Architecture North Star

CP7의 구조 원칙:

```text
Route/Page
    ↓
Feature / Domain Component
    ↓
Frontend View Model / Draft State
    ↓
Adapter
    ↓
Approved Backend Contract DTO
    ↓
HTTP Client
```

반대 방향도 같은 boundary를 따른다.

```text
User Action
→ Feature state
→ Request mapper
→ Backend API
→ Response adapter
→ View Model
→ UI
```

가장 중요한 규칙:

> **Raw Backend DTO를 Page/Visual Component가 직접 소비하지 않는다.**

---

# 3. Architecture Layers

Mister World Frontend keeps the top-level code model intentionally small.

```text
1. app
2. pages
3. features
4. integrations
5. shared
```

Frontend-facing View Models and Draft Models stay close to the feature that owns them instead of creating a second top-level domain hierarchy.

Supporting areas:

```text
mocks
tests
public
```

# 4. Proposed Source Tree

The tracked repository skeleton is:

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   ├── config/
│   └── errors/
│
├── pages/
│   ├── home/
│   ├── tours/
│   ├── tour-detail/
│   ├── configure/
│   ├── reservation-review/
│   ├── reservation-success/
│   ├── reservation-detail/
│   ├── login/
│   ├── signup/
│   └── my-trips/
│
├── features/
│   ├── tour-discovery/
│   ├── tour-detail/
│   ├── configuration/
│   ├── reservation/
│   ├── auth/
│   ├── travel-history/
│   └── voice-bridge/
│
├── integrations/
│   ├── backend/
│   │   ├── client/
│   │   ├── contracts/
│   │   └── adapters/
│   └── voice/
│
├── shared/
│   ├── ui/
│   ├── motion/
│   ├── hooks/
│   ├── lib/
│   └── assets/
│
└── mocks/

tests/
└── e2e/

public/
```

Feature-local internal folders may be introduced only when useful, for example:

```text
features/configuration/
├── components/
├── model/
├── hooks/
└── index.ts
```

The purpose is not folder count. The purpose is to make these boundaries obvious:

```text
Page composition
Feature behavior + frontend models
External contract boundary
Shared business-agnostic UI/tooling
```

---

# 5. Layer Responsibilities

## 5.1 `app/`

소유:

- root application composition
- providers
- global Error Boundary
- router creation
- global environment/config
- global auth/query provider wiring
- top-level analytics hook가 향후 필요하면 이 레이어

소유하지 않음:

- Tour business display logic
- Reservation form details
- individual screen layout
- raw HTTP request construction

---

## 5.2 `pages/`

Page는 **route-level composition**만 담당한다.

예:

```tsx
TourDetailPage
  ├─ TourHeroSection
  ├─ IncludedExperienceSection
  ├─ TourStyleSection
  ├─ ScheduleSection
  └─ TourDetailContinueSection
```

Page가 해도 되는 것:

```text
route param 읽기
page query hook 호출
section 배치
page-level Loading/Error/NotFound 선택
route navigation 연결
```

Page가 하면 안 되는 것:

```text
fetch("/api/...")
DTO parsing
price 계산
participant threshold 계산
animation raw keyframe 선언
option compatibility 계산
```

---

## 5.3 `features/`

사용자 행동 단위.

예:

```text
select tour style
select schedule
configure hotel
configure transport
configure meal
submit reservation
login
signup
load travel history
apply voice command to GUI state
```

Feature는:

```text
UI behavior
feature hooks
feature state transitions
mutation orchestration
domain View Model composition
```

을 소유한다.

---

## 5.4 Feature-local models

Backend entities are not copied into a new top-level domain tree.

Frontend-facing View Models and Draft Models live near the feature that owns them, normally under a feature-local `model/` boundary when the feature becomes large enough.

Examples:

```ts
TourCardModel
TourDetailModel
ScheduleChoiceModel
ReservationDraft
TripReviewModel
ReservationDisplayModel
TravelHistoryItemModel
```

Important:

> Feature-local models are not a second source of truth for Business Rules.

They shape data for the frontend and keep Backend DTO changes away from visual components. They do not become a separate business engine.

---

## 5.5 `integrations/`

외부 세계와의 경계.

### `backend/contracts`

승인된 API DTO가 생겼을 때만 정의.

예:

```text
TourListResponseDto
TourDetailResponseDto
ScheduleResponseDto
ReservationCreateRequestDto
ReservationResponseDto
TravelHistoryResponseDto
```

API가 확정되기 전에 “그럴듯한 DTO”를 production type처럼 만들지 않는다.

### `backend/adapters`

DTO → Frontend View Model.

예:

```text
mapTourProductToTourCard()
mapTourProductToTourDetail()
mapScheduleToScheduleChoice()
mapReservationToReservationDisplay()
mapHistoryToHistoryItem()
```

Shared Contract 변경의 충격은 여기에 최대한 가둔다.

---

## 5.6 `shared/`

Business 의미가 없는 재사용 요소.

예:

```text
Button
TextField
OptionCard primitive
Dialog
BottomSheet
Skeleton
ImageFrame
PageContainer
Motion primitives
focus utilities
```

`TourStyleSelector`처럼 Tour 의미가 들어가면 `shared/ui`가 아니라 해당 feature 쪽이다.

---

# 6. Dependency Direction — LOCKED

Allowed:

```text
app
↓
pages
↓
features

features
↓
integrations

pages/features
↓
shared
```

Feature-local models stay inside their owning feature and may be consumed through that feature's public API.

Forbidden:

```text
shared → feature
integration → visual page component
backend DTO → arbitrary UI component
one feature → another feature's private internals
```

Do not create cyclic dependencies.

---

# 7. Screen → Page Ownership

| Screen | Page |
|---|---|
| Home | `pages/home/HomePage` |
| Tours | `pages/tours/ToursPage` |
| Tour Detail | `pages/tour-detail/TourDetailPage` |
| Configure | `pages/configure/ConfigurePage` |
| Reservation Review | `pages/reservation-review/ReservationReviewPage` |
| Reservation Success | `pages/reservation-success/ReservationSuccessPage` |
| Reservation Detail | `pages/reservation-detail/ReservationDetailPage` |
| Login | `pages/login/LoginPage` + Auth overlay route |
| Signup | `pages/signup/SignupPage` |
| Previous Trips Popup | global Auth/Post-login overlay composition |
| My Trips | `pages/my-trips/MyTripsPage` |

Previous Trips Popup은 독립 URL page가 아니라:

```text
app/router + auth feature + travel-history feature
```

가 조합해 띄우는 overlay다.

---

# 8. Shared UI Primitive Ownership

CP3의 primitive를 코드 ownership으로 옮긴다.

```text
shared/ui/
├── Button/
├── TextLink/
├── TextField/
├── SelectField/
├── Checkbox/
├── Radio/
├── OptionCard/
├── EditorialCard/
├── InfoCard/
├── StatusBadge/
├── Dialog/
├── BottomSheet/
├── Toast/
├── Skeleton/
├── EmptyState/
├── ErrorState/
├── PageContainer/
├── Section/
└── ImageFrame/
```

각 primitive:

```text
presentation
interaction mechanics
accessibility
Design Token usage
generic states
```

만 소유한다.

---

# 9. Domain UI Components

다음은 Shared Primitive가 아니다.

```text
ThemeEditorialCard
TourCollectionCard
TourHero
IncludedExperienceSection
TourStyleSelector
ScheduleCard
RecruitmentProgress
CoupleProgress
ConfigurationOptionCard
OptionGroup
TripSummary
PriceSummary
ReservationStatusSection
TripCard
PreviousTripPreviewCard
```

이유:

> Mister World의 Domain 의미를 알고 있기 때문이다.

---

# 10. Component Reuse Rule

재사용을 목적으로 성급하게 추상화하지 않는다.

## Shared로 승격하는 조건

최소:

```text
2개 이상 feature에서 사용
AND
business 의미가 없음
AND
props가 특정 screen을 암시하지 않음
```

예:

`Button` → shared.

반면:

`ReservationSuccessCard` → shared 아님.

---

# 11. Page Composition — Home

```text
HomePage
├── GlobalHeader
├── HomeHero
├── ThemeCollectionIntro
├── HomeThemeEditorialGrid
│   └── ThemeEditorialCard × N
├── CustomizationPromise
└── GlobalFooter
```

State source:

- curated visual config
- TourProduct/Theme discovery adapter where contract allows

Home Page는 API response shape를 모른다.

---

# 12. Page Composition — Tours

```text
ToursPage
├── GlobalHeader
├── ToursIntro
├── TourCollection
│   └── TourCollectionCard × N
├── TourStyleExplainer
├── CustomizationNote
└── GlobalFooter
```

`TourCollectionCard`는:

```text
TourCardModel
```

만 소비한다.

`TourProductResponseDto`를 직접 받지 않는다.

---

# 13. Page Composition — Tour Detail

```text
TourDetailPage
├── GlobalHeader
├── TourHero
├── TourStorySection
├── IncludedExperienceSection
├── TourStyleSection
│   └── TourStyleSelector
├── ScheduleSection
│   └── ScheduleCard × N
├── TourDetailContinueSection
└── GlobalFooter
```

Query orchestration:

```text
useTourDetail()
useTourSchedules()
```

는 Feature/Data hook.

Page는 두 Query 상태를 조합해:

```text
core loading
schedule loading
partial error
not found
```

를 선택한다.

---

# 14. Theme ↔ TourProduct Boundary

v0.1.1에서:

```text
Theme 1:N TourProduct
```

이므로 아래 코드는 금지한다.

```ts
const tourId = theme;
```

또는:

```ts
const tours = FOUR_THEMES;
```

를 Backend TourProduct의 진짜 목록처럼 취급하는 것.

아키텍처는 다음을 허용해야 한다.

```text
ThemeDiscoveryModel
→ TourProductSummaryModel[]
→ selected TourProduct
→ /tours/:tourId
```

정확한 Theme→TourProduct UX가 확정되기 전까지
Theme discovery visual과 TourProduct data를 분리한다.

---

# 15. Tour View Models

승인 DTO가 아직 없으므로 **field name을 고정하지 않고 필요한 개념만** 정의한다.

예시 개념:

```text
TourCardModel
- id
- theme
- title
- visual
- highlights
- availableStylePresentation

TourDetailModel
- id
- theme
- title
- story
- includedExperience
- allowedStyles
```

주의:

이건 Backend DTO 제안이 아니다.

Frontend adapter 출력의 shape다.

---

# 16. Schedule Architecture

`ScheduleCard`는 Backend status enum을 직접 해석하지 않는다.

Adapter가:

```text
Backend Schedule DTO
→ ScheduleChoiceModel
```

로 변환한다.

View Model이 가져야 하는 UI 의미:

```text
identity
period display
availability presentation
recruitment presentation
confirmed state
```

정확한 raw field는 adapter 내부.

---

# 17. Recruitment Architecture

일반 Tour:

```text
RecruitmentProgress
```

Honeymoon:

```text
CoupleProgress
```

하지만 CP6-H P0 gate 때문에:

```text
CoupleProgress
```

는 **UI component만 구현 가능**하고
실제 participantCount → couple progress mapping을 컴포넌트 안에서 계산하면 안 된다.

금지:

```ts
const couples = participantCount / 2;
```

승인 rule 없이는 불가.

Component는 이미 해석된 presentation model만 받는다.

예:

```text
RecruitmentDisplayModel
```

---

# 18. Configuration Draft Ownership

Configuration은 페이지 local state만으로 끝내면 안 된다.

필요한 lifecycle:

```text
Tour Detail
→ Configure
→ Review
→ Back
→ Configure
→ Auth interruption
→ Review restore
```

따라서 별도 Transaction Draft owner가 필요하다.

권장 개념:

```text
ReservationDraft
├── tourId
├── style
├── scheduleId
├── participant selection (contract-gated)
├── hotel selection
├── transport selection
├── meal selection
├── extras selection
└── draft metadata
```

주의:

실제 raw ID/field names는 DTO 확정 후 mapping.

---

# 19. Reservation Draft Store

Draft store가 소유:

```text
selected context
dirty state
draft restore
clear after confirmed reservation
```

소유하지 않음:

```text
server reservation status
server price truth
server availability truth
auth session
```

## Persistence

CP8에서 최종 결정.

CP7 구조 요구:

```text
serializable
versionable
explicit reset
```

이면 충분.

---

# 20. State Ownership Matrix

| State | Owner |
|---|---|
| Tour/Schedule server data | Query/Data layer |
| Authenticated user/session | Auth feature/provider |
| Configuration draft | Reservation draft state |
| Option selected UI | Draft + local derived state |
| Modal open/close | route/local UI |
| Hover/focus | component |
| Reservation submit | mutation layer |
| Price response | query/mutation result |
| Voice listening | voice bridge |
| Theme image loaded | ImageFrame/local |
| Toast | global UI service if introduced |

---

# 21. Server State vs Client State

## Server State

예:

```text
TourProduct
TourSchedule
Reservation
Travel History
server-calculated price
availability
```

Query layer가 소유.

## Client Transaction State

예:

```text
selected style
selected schedule
configuration selections
unsaved Review draft
```

Draft store가 소유.

## Ephemeral UI State

예:

```text
dialog open
sheet open
focused option
temporary hover
```

component/local state.

이 세 종류를 한 global store에 몰아넣지 않는다.

---

# 22. Query Architecture

특정 library는 repo scaffold 전이므로 CP7에서 강제하지 않는다.

하지만 기능 요구는 고정한다.

Query abstraction은 최소:

```text
cache
loading
error
retry
background refresh
stale
request deduplication
cancellation where possible
```

을 지원해야 한다.

실제 library 후보:

```text
TanStack Query
or equivalent
```

은 구현 단계 Frontend decision.

---

# 23. Query Key Ownership

Query key는 Feature/API layer가 소유.

개념:

```text
tourProducts
tourProduct(id)
tourSchedules(tourId)
tourSchedule(id)
reservation(id)
travelHistory(customer/me)
```

Component가 string query key를 직접 만들지 않는다.

---

# 24. Mutation Architecture

주요 mutation:

```text
login
signup
validate/reprice configuration if API exists
create reservation
```

Reservation create는 CP5대로:

```text
pessimistic
```

Flow:

```text
Idle
→ Submitting
→ Server Success
→ Success route
```

duplicate submit prevention은 mutation hook/service에서 보장.

Page button만 disable한다고 끝내지 않는다.

---

# 25. API Client Boundary

`integrations/backend/client/`

소유:

```text
base URL
headers
credentials/token attachment
request transport
abort/cancel
common network error normalization
```

소유하지 않음:

```text
Tour business mapping
Reservation UI error copy
component navigation
```

---

# 26. Error Normalization

Raw errors:

```text
network
HTTP
JSON/body
auth
validation
conflict
```

를 바로 UI에 넘기지 않는다.

Integration layer에서 최소 공통 category:

```text
NetworkError
UnauthorizedError
NotFoundError
ValidationError
ConflictError
ServerError
UnknownError
```

로 normalize.

Feature가 필요한 domain details만 별도 mapping.

---

# 27. UI Error Mapping

예:

```text
ConflictError
+ selected schedule unavailable
→ ScheduleConflictPresentation

ValidationError
+ meal invalid
→ OptionValidationPresentation
```

UI copy는 Screen Spec/feature가 소유.

Backend message를 그대로 사용자에게 출력하지 않는다.

---

# 28. Form Architecture

## Login / Signup

실제 credential fields가 확정될 때까지:

```text
AuthForm schema
```

를 하드코딩하지 않는다.

가입에서 현재 source-confirmed profile fields:

```text
name
address
contact
```

만 확실하다.

## Reservation

Review 자체는 입력 form이 아니라 검토/submit surface.

Configuration은:

```text
form-like interaction
```

이지만 HTML form 한 장으로 모든 UI를 묶을 필요는 없다.

---

# 29. Validation Ownership

## Component

```text
required visual
basic interaction
```

## Feature

```text
known UX constraints
draft completeness
```

## Backend

```text
final Business Rule validation
availability
compatibility
price
reservation acceptance
```

중요:

Frontend validation 실패와 Backend validation 실패가
같은 사용자 경험으로 연결되어야 하지만
Frontend가 최종 권위가 되면 안 된다.

---

# 30. Participant Count Architecture Gate

v0.1.1에서:

```text
Reservation.participantCount >= 1
```

이므로 Draft 모델에는 이 개념을 수용할 공간을 둔다.

하지만 UI placement/default/range가 아직 미확정이므로:

- 실제 input component는 아직 Screen에 하드코딩하지 않음
- contract decision 후 S03/S04/S05 중 정확한 owner를 지정

금지:

```ts
participantCount = 1
```

을 숨은 영구 default로 API에 전송.

---

# 31. Price Architecture

Frontend는 가격 계산 엔진을 만들지 않는다.

권장 flow:

```text
Draft selections
→ Backend price/review contract
→ PriceDisplayModel
→ PriceSummary
```

API가 아직 없을 때 mock은 가능.

Mock 가격 logic은:

```text
demo fixture
```

로 분리하고 production calculation과 섞지 않는다.

---

# 32. Loyalty Discount Architecture

v0.1.1에서 기능 요구.

UI 구조는 향후:

```text
PriceSummary
├── subtotal
├── discount line (optional)
└── total
```

을 수용 가능해야 한다.

그러나:

```text
isLoyalCustomer
discountRate
discount stacking
```

을 Frontend가 계산하지 않는다.

---

# 33. Auth Architecture

권장 구성:

```text
AuthProvider / AuthSession
AuthGate
AuthModalRoute
LoginFeature
SignupFeature
ReturnContext
```

AuthProvider가 알아야 할 것:

```text
authenticated / unauthenticated / checking
user summary if contract provides
session lifecycle
```

AuthProvider가 알 필요 없는 것:

```text
Tour state
Configuration options
Travel History content
```

---

# 34. Return Context Architecture

Auth interruption용 별도 구조.

개념:

```text
ReturnContext
├── route
├── intent
└── transaction draft reference
```

예:

```text
Reservation Review Submit
→ Auth required
→ Login
→ ReturnContext restores Review
```

Auth success callback 안에 Reservation logic을 직접 넣지 않는다.

---

# 35. Previous Trips Popup Ownership

이 Surface는:

```text
Auth success event
+
Travel History query
+
Overlay system
```

조합이다.

권장 controller 개념:

```text
PostLoginExperienceController
```

책임:

```text
normal login → show popup
transactional login → apply approved timing policy
avoid duplicate display within intended scope
```

Popup component 자체가 auth transition을 결정하지 않는다.

---

# 36. Travel History Architecture

Shared data model:

```text
TravelHistoryItemModel
```

Popup:

```text
PreviousTripPreviewCard
```

My Trips:

```text
TripCard
```

둘은 같은 View Model을 소비한다.

이렇게 하면:

```text
product
period
style
price
```

표현이 두 화면에서 drift하지 않는다.

---

# 37. Voice Bridge Architecture

Frontend는 STT를 구현하지 않는다.

Boundary:

```text
ai-console / Voice
→ approved voice event contract
→ voice adapter
→ feature command
→ existing GUI state mutation
```

예:

```text
CHANGE_HOTEL
→ voice adapter
→ configuration feature action
→ same selection path as touch UI
```

Voice 전용으로 별도의 Configuration state를 만들지 않는다.

---

# 38. Single Action Path Rule

같은 행동은 입력 수단과 관계없이 같은 Feature action을 사용한다.

좋음:

```text
Touch
Voice
Keyboard
   ↓
selectHotel(option)
```

나쁨:

```text
Touch → setHotelA()
Voice → setHotelFromVoice()
Keyboard → custom branch
```

Business-facing state transition이 갈라지면 drift가 생긴다.

---

# 39. Motion Architecture

`shared/motion/`:

```text
motion tokens
MotionPage
Reveal
AnimatedPresence wrapper
MotionDialog
MotionSheet
MotionImage
AnimatedValue
```

Domain motion:

```text
Recruitment animation
CoupleProgress animation
Price transition
Voice state visualization
```

은 feature/domain component에 둔다.

Page에서 raw `transition={{...}}` 값 남발 금지.

---

# 40. Skeleton Architecture

각 real component와 paired component.

예:

```text
TourCollectionCard
TourCollectionCardSkeleton

TourHero
TourHeroSkeleton

ScheduleCard
ScheduleCardSkeleton

ConfigurationOptionCard
ConfigurationOptionCardSkeleton

TripCard
TripCardSkeleton
```

Skeleton을 거대한 하나의 generic rectangle component로만 처리하지 않는다.

---

# 41. Image Architecture

`ImageFrame` shared primitive가 소유:

```text
aspect ratio
placeholder
loading
loaded
failed
progressive reveal
alt/decorative semantics
```

Feature가 소유:

```text
어떤 image인지
어떤 alt 의미인지
fallback theme tone
```

---

# 42. Router Architecture

Target route tree:

```text
AppRouter
├── PublicShell
│   ├── /
│   ├── /tours
│   ├── /tours/:tourId
│   └── /my-trips (AuthGate)
│
├── TransactionShell
│   ├── /tours/:tourId/configure
│   ├── /reservation/review
│   ├── /reservation/:reservationId/success
│   └── /reservations/:reservationId
│
└── Auth
    ├── /login
    └── /signup
```

Modal Login은 route state/background location pattern을 사용할 수 있으나
구체적 router library API는 implementation decision.

---

# 43. Route Guards

Route Guard는 다음만 판단.

```text
authentication
required route context presence
```

Guard가 Business Rule을 계산하지 않는다.

예:

```text
Honeymoon Classic invalid
```

을 router가 직접 판정하는 식은 피한다.

Feature/domain validation 경로를 사용.

---

# 44. Error Boundary Architecture

최소:

```text
AppErrorBoundary
RouteErrorBoundary
SectionErrorBoundary where useful
```

Page 전체 오류와 Query 오류를 혼동하지 않는다.

React render exception:

```text
Error Boundary
```

API query failure:

```text
Query state
```

서로 다른 문제다.

---

# 45. Overlay Architecture

Global overlay families:

```text
Dialog
BottomSheet
Auth Modal
Previous Trips Popup
Mobile Navigation
Toast
```

한 번에 modal focus trap이 2개 중첩되는 구조 금지.

특히:

```text
Login
→ Previous Trips Popup
```

은 CP4처럼 순차적으로 열림.

---

# 46. Responsive Component Strategy

가능하면 동일 component를 CSS/layout으로 변환.

예:

```text
TourCollectionCard
desktop 2-column placement
mobile 1-column
```

별도 component 허용:

```text
DesktopTripSummary
MobileSummaryBar
MobileConfigurationSummarySheet
```

처럼 interaction model 자체가 달라지는 경우.

Desktop/Mobile 전체 Page를 복제하지 않는다.

---

# 47. Accessibility Ownership

## Shared primitives

소유:

```text
focus-visible
button semantics
dialog trap
input labels baseline
touch target
disabled semantics
```

## Feature/domain

소유:

```text
accessible name
status text
aria-live 의미
group label
error association
image alt meaning
```

## Page

소유:

```text
heading hierarchy
landmarks
DOM reading order
```

---

# 48. Design Token Consumption

Component에서 raw value 금지.

예:

```ts
padding: 23
borderRadius: 17
```

지양.

사용:

```text
design token
semantic component variant
```

Theme local accent도 feature/theme mapping에서 가져오고
component 내부 hex 하드코딩 금지.

---

# 49. Styling Ownership

권장 원칙:

```text
shared primitive styles
→ shared/ui

domain component layout
→ component/feature

page composition
→ page
```

어떤 CSS technology를 사용할지는 scaffold 결정 시 확정.

CP7은:

```text
CSS Modules
vanilla CSS
styled solution
utility CSS
```

중 하나를 강제하지 않는다.

단, Design Token single source는 필요.

---

# 50. Mock Architecture

Mocks 허용.

하지만:

```text
mock UI data
≠ approved API schema
```

구조:

```text
mocks/
├── fixtures/
│   ├── tours/
│   ├── schedules/
│   ├── configuration/
│   ├── reservation/
│   └── history/
├── handlers/
└── scenarios/
```

Scenarios:

```text
happy path
slow
empty
network error
partial error
conflict
unauthorized
offline-like
```

---

# 51. Mock Adapter Rule

가장 안전한 방식:

```text
Mock fixture
→ same Frontend View Model boundary
→ UI
```

또는 approved DTO가 생긴 뒤:

```text
Mock DTO
→ real adapter
→ UI
```

API가 확정되기 전에 mock DTO를 미래 API처럼 만들지 않는다.

---

# 52. Testing Pyramid

## Primitive tests

예:

```text
Button states
Dialog focus trap
OptionCard keyboard semantics
```

## Feature tests

예:

```text
Style select
Option select
Draft updates
Submit duplicate prevention
Auth return context
```

## Page integration tests

예:

```text
Tour Detail partial schedule failure
Configure option conflict
Review 401 recovery
History empty/error
```

## E2E

최종적으로 주요 사용자 flow.

---

# 53. Contract Tests

API DTO가 확정되면 adapter-level contract tests 추가.

예:

```text
approved TourProduct fixture
→ adapter
→ TourCardModel expected
```

Shared Contract 변경 시 가장 먼저 깨져야 하는 테스트가 adapter test가 되게 한다.

---

# 54. Story/State Harness

CP5 상태를 실제로 검증하기 위해
Storybook 또는 dev-only State Harness를 권장.

필수 개념:

```text
Loading
Success
Empty
Error
Retrying
Offline
ImageFail
Conflict
```

Library 선택은 implementation decision.

---

# 55. Feature Boundaries

## `tour-discovery`

소유:

```text
Home theme discovery
Tours collection
Theme/TourProduct navigation model
```

## `tour-detail`

소유:

```text
Tour detail view model
Style selection
Schedule selection
recruitment presentation
```

## `configuration`

소유:

```text
Option groups
configuration draft editing
live summary
price presentation
```

## `reservation`

소유:

```text
review
submit
success
detail
reservation mutation/query
```

## `auth`

소유:

```text
login
signup
session
return context
```

## `travel-history`

소유:

```text
Previous Trips
My Trips
history model
```

## `voice-bridge`

소유:

```text
Voice event → existing feature action
```

---

# 56. Cross-Feature Communication

Feature끼리 서로 내부 store를 직접 import하지 않는다.

예:

```text
auth
→ reservation
```

직접 mutation 대신:

```text
ReturnContext
route
public feature action
```

사용.

Configuration → Reservation은:

```text
ReservationDraft
```

라는 명시적 shared transaction model을 경계로 연결.

---

# 57. Barrel Export Rule

각 feature가 외부에 노출할 public API를 제한.

예:

```text
features/configuration/index.ts
```

에서:

```text
ConfigurationForm
useConfigurationDraft
ConfigurationSummary
```

등 필요한 것만 export.

다른 feature가 내부 파일 깊숙이 import하는 것 금지.

---

# 58. Naming Rules

Component:

```text
PascalCase
```

Hooks:

```text
useSomething
```

Adapter:

```text
mapXToY
```

Queries:

```text
useXQuery
```

Mutations:

```text
useXMutation
```

View Models:

```text
XModel
XDisplayModel
XDraft
```

Raw API:

```text
XRequestDto
XResponseDto
```

DTO와 View Model 이름을 섞지 않는다.

---

# 59. File Size / Responsibility Rule

하나의 page 파일에:

```text
query
mapping
layout
business logic
modal logic
animation
```

전부 넣지 않는다.

Page는 orchestration.

복잡한 feature는:

```text
model/
api/
ui/
lib/
```

로 내부 분리 가능.

불필요하게 한 component당 폴더 하나를 강제하지는 않는다.

---

# 60. Performance Architecture

기본:

- route-level lazy loading 검토
- large image lazy/progressive load
- non-critical sections defer 가능
- request deduplication
- memoization은 측정 후
- animation은 transform/opacity 중심

금지:

```text
모든 component React.memo
모든 계산 useMemo
global store 남발
```

---

# 61. Route-Level Code Splitting

권장 우선:

```text
Home
Tours
Tour Detail
Configure
Reservation
Auth
My Trips
```

큰 route bundle 경계.

공유 primitive는 common chunk.

구체 bundler 설정은 scaffold 후 확정.

---

# 62. Data Prefetch Strategy

향후 Query layer가 지원한다면:

```text
Tours card hover/focus
→ selected TourProduct detail prefetch

Tour Detail에서 Configure CTA 근처
→ option catalog prefetch
```

가능.

하지만 계약 없는 endpoint를 위해 prefetch API를 발명하지 않는다.

---

# 63. Logging / Observability Boundary

Production UI는 raw stack/API body를 사용자에게 노출하지 않는다.

개발 logging:

```text
adapter mapping error
unexpected DTO
route recovery
mutation failure
```

를 추적할 수 있게 한다.

실제 logging vendor는 CP7에서 고정하지 않는다.

---

# 64. Environment Configuration

`app/config` 또는 integration config에서:

```text
API base URL
environment flags
mock mode
feature integration flags if needed
```

를 중앙화.

Component에서 `import.meta.env...` 직접 참조 남발 금지.

---

# 65. Feature Flag Policy

TBD 계약 때문에 feature flag를 남발하지 않는다.

허용 예:

```text
Voice integration unavailable
```

처럼 실제 parallel integration이 필요한 경우.

금지:

```text
모든 UI를 flag로 두어 architecture decision 회피
```

---

# 66. P0 Contract Gate Handling in Code

현재 P0:

```text
Theme ↔ TourProduct
participantCount
Honeymoon couple/team mapping
Auth
TourProduct DTO
TourSchedule DTO
TourConfiguration
Reservation DTO/error/status
Price
Travel History DTO
```

원칙:

```text
contract not approved
→ mock/view-model boundary
→ TODO with contract ID
→ no production assumption
```

예:

```text
// BLOCKED: H-03 Honeymoon couple/team mapping.
```

처럼 근거를 남긴다.

---

# 67. Component Ownership Matrix

| Component | Layer | Reused By |
|---|---|---|
| `GlobalHeader` | shared/app shell | Home, Tours, Detail, My Trips |
| `TransactionHeader` | shared/app shell | Configure, Review, Success |
| `Button` | shared/ui | all |
| `OptionCard` | shared/ui | Style, configuration options |
| `Dialog` | shared/ui | Login, Previous Trips |
| `BottomSheet` | shared/ui | mobile summary/history |
| `TourCollectionCard` | tour-discovery | Home/Tours variants |
| `TourStyleSelector` | tour-detail | Tour Detail |
| `ScheduleCard` | tour-detail | Tour Detail |
| `RecruitmentProgress` | tour-detail/reservation domain | Detail, Success, Reservation Detail |
| `CoupleProgress` | same domain, contract-gated | Detail, Success, Reservation Detail |
| `OptionGroup` | configuration | Configure |
| `TripSummary` | configuration/reservation | Configure, Review |
| `PriceSummary` | configuration/reservation | Configure, Review, Detail |
| `TripCard` | travel-history | My Trips |
| `PreviousTripPreviewCard` | travel-history | Popup |
| `AuthSurface` | auth | Login |
| `CustomerProfileFields` | auth | Signup |

---

# 68. Skeleton Pair Matrix

| Real | Skeleton |
|---|---|
| `TourCollectionCard` | `TourCollectionCardSkeleton` |
| `TourHero` | `TourHeroSkeleton` |
| `IncludedServiceItem` | `IncludedServiceSkeleton` |
| `TourStyleSelector` | `StyleSelectorSkeleton` |
| `ScheduleCard` | `ScheduleCardSkeleton` |
| `RecruitmentProgress` | `RecruitmentSkeleton` |
| `ConfigurationOptionCard` | `ConfigurationOptionCardSkeleton` |
| `TripSummary` | `TripSummarySkeleton` |
| `PriceSummary` | `PriceSkeleton` |
| `TripCard` | `TripCardSkeleton` |

Skeleton은 feature component 근처에 둔다.

Generic primitive만 `shared/ui/Skeleton`.

---

# 69. Route/Data Ownership Matrix

| Route | Main Feature | Query | Draft/Mutation |
|---|---|---|---|
| `/` | tour-discovery | optional tour discovery | none |
| `/tours` | tour-discovery | TourProducts | none |
| `/tours/:tourId` | tour-detail | TourProduct + Schedules | Style/Schedule selection |
| `/tours/:tourId/configure` | configuration | option data + price if supported | ReservationDraft |
| `/reservation/review` | reservation | validation/price if supported | create Reservation |
| `/reservation/:id/success` | reservation | Reservation + recruitment | none |
| `/reservations/:id` | reservation | Reservation | none |
| `/login` | auth | session status | login |
| `/signup` | auth | none | signup |
| `/my-trips` | travel-history | Travel History | none |

---

# 70. Initial Implementation Order

Architecture 관점에서 권장:

```text
1. React/TS scaffold
2. Design Tokens + shared/ui primitives
3. App providers/router/error boundaries
4. shared motion/image/skeleton
5. Frontend View Models + mock fixtures
6. Home/Tours
7. Tour Detail
8. ReservationDraft + Configure
9. Review/Success/Detail
10. Auth shell + ReturnContext
11. Previous Trips/My Trips
12. Adapter interfaces
13. Real Backend DTO integration as contracts close
14. Voice bridge integration
```

UI 개발과 Backend contract work를 병렬화할 수 있는 순서다.

---

# 71. Definition of Done for a Component

공통 component:

- [ ] ownership layer가 맞음
- [ ] Design Token 사용
- [ ] state variants 존재
- [ ] accessibility semantics
- [ ] keyboard behavior
- [ ] reduced motion if animated
- [ ] no raw API DTO dependency
- [ ] test
- [ ] skeleton paired if data-heavy

Domain component:

추가:

- [ ] View Model만 소비
- [ ] business rule 직접 계산 안 함
- [ ] error/empty state contract 일치

---

# 72. Definition of Done for a Page

- [ ] Screen Spec section order 구현
- [ ] Desktop/Mobile 구현
- [ ] page-level route state
- [ ] query/mutation orchestration
- [ ] partial loading
- [ ] partial error
- [ ] retry
- [ ] navigation/back behavior
- [ ] accessibility heading/landmark
- [ ] no raw fetch
- [ ] no raw DTO mapping
- [ ] no duplicated business rule
- [ ] contract-gated behavior 명시

---

# 73. Anti-Patterns

## A-01 — API-shaped UI

```tsx
<Card title={response.tourName} />
```

가 여러 페이지에 퍼짐.

Adapter/View Model 사용.

## A-02 — God Page

페이지 하나가 query/state/form/motion/error를 전부 소유.

## A-03 — Global Store Everything

hover/dialog/query data까지 global store.

## A-04 — Shared Folder Dump

재사용 여부와 상관없이 모든 것을 `components/`.

## A-05 — Premature Generic Component

`UniversalTravelCard` 하나로 Home/Tours/MyTrips/Reservation을 억지로 통합.

## A-06 — Duplicate State

Query cache와 별도 global state에 같은 server object 복사.

## A-07 — Frontend Business Engine

confirmation threshold / price / loyalty를 프론트가 독자 계산.

## A-08 — Mock Becomes Contract

mock JSON shape를 Backend에 요구되는 DTO처럼 사용.

## A-09 — Voice Fork

Voice만 별도 state/action path.

## A-10 — Desktop/Mobile Page Duplication

같은 의미의 Page 전체를 두 벌 유지.

---

# 74. CP7 Decision Log

## D-701 — Target Architecture is layered

`app / pages / features / integrations / shared` with feature-local models.

## D-702 — Page is orchestration only

Raw API/Business logic 금지.

## D-703 — Raw DTO isolation is mandatory

Backend DTO → Adapter → Frontend View Model.

## D-704 — Shared UI has no Business semantics

Domain component와 구분.

## D-705 — Server / Transaction / Ephemeral state separated

한 global store에 합치지 않음.

## D-706 — ReservationDraft owns multi-screen transaction selection

Configure↔Review↔Auth interruption 복구 기반.

## D-707 — Query layer owns server state

Component/global draft store가 복사하지 않음.

## D-708 — Reservation create remains pessimistic

duplicate request 차단.

## D-709 — Theme and TourProduct remain distinct in architecture

one Theme = one TourProduct 하드코딩 금지.

## D-710 — participantCount has a model slot but no invented UX

contract closure 후 exact screen owner 결정.

## D-711 — CoupleProgress cannot derive from participantCount without approved mapping

visual component와 domain mapping 분리.

## D-712 — Price is server-owned

Frontend display only.

## D-713 — Travel History Popup/My Trips share one View Model

표현 drift 방지.

## D-714 — Voice reuses GUI feature actions

별도 state tree 금지.

## D-715 — Skeleton pairs live near feature components

generic Skeleton primitive는 shared.

## D-716 — Mocks use explicit boundary

mock shape ≠ Backend contract.

## D-717 — API/library choices remain replaceable

React/TS는 fixed, Query/router/styling library exact choice는 scaffold 단계 결정.

---

# 75. CP7 Acceptance Checklist

## Architecture

- [x] layer model
- [x] dependency direction
- [x] target source tree
- [x] page ownership
- [x] feature boundaries
- [x] shared/feature-model distinction
- [x] public API/barrel rule

## Data

- [x] DTO boundary
- [x] adapter boundary
- [x] View Model
- [x] server/client/ephemeral state separation
- [x] query ownership
- [x] mutation ownership
- [x] error normalization

## Transaction

- [x] ReservationDraft
- [x] Auth ReturnContext
- [x] duplicate submit protection
- [x] draft recovery ownership

## Contract Safety

- [x] Theme/TourProduct isolation
- [x] participantCount gate
- [x] Honeymoon couple mapping gate
- [x] price server ownership
- [x] auth contract boundary
- [x] history contract boundary
- [x] Voice boundary

## UI

- [x] primitive ownership
- [x] feature/domain-semantic component ownership
- [x] skeleton pairing
- [x] image ownership
- [x] motion ownership
- [x] responsive ownership
- [x] accessibility ownership

## QA

- [x] component test boundary
- [x] feature test boundary
- [x] page integration boundary
- [x] adapter contract tests
- [x] state harness strategy
- [x] component/page DoD

**CP7 Status: COMPLETE**

---

# 76. Next Checkpoint

## CP8 — Data & API UX

다음 문서:

```text
09-DATA-AND-API-UX.md
```

CP8에서는 CP7의 구조를 바탕으로:

```text
query lifecycle
cache/stale strategy
prefetch
draft persistence
refresh policy
API latency UX
mutation/retry
optimistic vs pessimistic
auth interruption
409/422 mapping
offline
price recalculation
schedule freshness
recruitment polling/refresh
history caching
adapter failure
mock → real API migration
```

을 화면별로 최종 잠근다.

CP7이 **“코드를 어디에 둘 것인가”**를 정했다면,
CP8은 **“데이터가 언제 들어오고, 얼마나 믿고, 언제 다시 가져오고, 실패하면 어떻게 회복할 것인가”**를 잠그는 단계다.
