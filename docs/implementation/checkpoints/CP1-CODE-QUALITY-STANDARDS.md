# Mister World Frontend — CP1 Code Quality Standards

> Status: **COMPLETE**  
> Checkpoint: **CP1 — Code Quality Standards / Human-Readable Code / Comment Policy**  
> Date: **2026-09-29**  
> Target repository: `WonhoOne/frontend`  
> Depends on: `CP0-IMPLEMENTATION-BASELINE.md`  
> Next checkpoint: **CP2 — Frontend Architecture Plan**

---

# 1. Purpose

이 문서는 Mister World Frontend의 구현 품질 기준을 정의한다.

CP0가 **무엇을 구현할 수 있고 무엇을 추측하면 안 되는지**를 잠갔다면,
CP1은 **그 구현을 어떤 형태의 코드로 남겨야 하는지**를 잠근다.

이 프로젝트의 코드 품질 목표는 단순히 다음이 아니다.

```text
컴파일된다
동작한다
테스트가 통과한다
```

반드시 다음까지 만족해야 한다.

```text
사람이 읽을 수 있다
책임을 빠르게 이해할 수 있다
데이터 흐름을 추적할 수 있다
왜 이렇게 구현했는지 알 수 있다
어떤 계약을 지키는지 알 수 있다
어떤 계약이 아직 미정인지 알 수 있다
수정 시 무엇을 깨면 안 되는지 알 수 있다
```

특히 이 프로젝트는 AI Agent를 적극적으로 사용할 수 있으므로,
**AI가 빠르게 생성한 코드가 사람이 유지보수하기 어려운 구조로 누적되는 것**을
초기부터 방지한다.

---

# 2. Core Quality Goal

Mister World Frontend의 기본 품질 목표:

> **AI가 구현하더라도, 결과물은 사람이 직접 설계하고 장기간 유지보수할 수 있는 Production Code처럼 읽혀야 한다.**

이 프로젝트에서 좋은 코드는
“가장 짧은 코드”도,
“가장 추상적인 코드”도,
“가장 많은 패턴을 사용한 코드”도 아니다.

좋은 코드는:

```text
의도가 명확하고
책임이 좁고
데이터 흐름이 보이고
상태 변화가 추적 가능하며
계약 경계가 드러나고
실패 이유를 이해할 수 있고
변경 영향 범위를 예상할 수 있는 코드
```

이다.

---

# 3. Definition — Human-Readable Code

이 프로젝트에서 **“사람이 읽기 좋은 코드”**는 다음 조건을 만족하는 코드를 의미한다.

## 3.1 File purpose is obvious

파일 이름을 보고 역할을 대략 예상할 수 있어야 한다.

좋음:

```text
ReservationReviewPage.tsx
useReservationDraft.ts
mapTourScheduleDto.ts
reservationQueryKeys.ts
Dialog.tsx
ImageFrame.tsx
```

나쁨:

```text
utils.ts
helpers.ts
common.ts
misc.ts
data.ts
manager.ts
handler.ts
temp.ts
index2.ts
```

단, 작은 feature 내부의 제한된 `utils.ts`처럼
범위가 명확하고 실제로 공통 보조 함수만 포함하는 경우는 허용할 수 있다.

---

## 3.2 Names explain intent

이름은 타입보다 **역할과 의미**를 우선 전달해야 한다.

좋음:

```ts
selectedScheduleId
isReservationSubmitting
restoreReservationDraft
mapScheduleDtoToChoiceModel
shouldShowPreviousTrips
```

나쁨:

```ts
data
item
obj
value
flag
state2
handle
doThing
resultData
tempValue
```

이름을 길게 만드는 것이 목표는 아니다.

다음 질문에 답할 정도로만 구체적이면 된다.

```text
무엇인가?
어떤 상태인가?
무엇을 하는가?
어떤 방향으로 변환하는가?
```

---

## 3.3 Reading top-to-bottom should work

파일은 가능하면 위에서 아래로 자연스럽게 읽혀야 한다.

권장 순서:

```text
imports
→ public types
→ constants
→ main exported component/function
→ local subcomponents/helpers
```

파일을 이해하기 위해
위아래를 계속 왕복해야 하는 구조를 피한다.

복잡한 helper가 핵심 흐름보다 먼저 등장해
main logic을 찾기 어렵게 만들지 않는다.

---

## 3.4 One primary responsibility per module

하나의 파일 또는 주요 함수는
하나의 중심 책임을 가져야 한다.

예:

```text
TourDetailPage
= route-level composition

TourStyleSelector
= TourStyle 선택 UI

mapTourProductDto
= Backend DTO → Frontend Model 변환

useReservationDraft
= Reservation Draft 접근/변경 API
```

다음처럼 여러 책임을 섞지 않는다.

```text
TourDetailPage
+ raw fetch
+ DTO parse
+ business rule
+ price calculation
+ modal state
+ animation timing
+ localStorage persistence
```

---

# 4. Readability Over Cleverness

짧거나 영리한 코드보다
의도가 드러나는 코드를 우선한다.

나쁨:

```ts
const label = e ? a?.b?.c ?? d : f ? g : h;
```

좋음:

```ts
if (hasScheduleError) {
  return unavailableScheduleLabel;
}

if (isScheduleRefreshing) {
  return updatingScheduleLabel;
}

return scheduleLabel;
```

한 줄로 줄일 수 있더라도
읽는 사람이 해석해야 하는 비용이 커지면 줄이지 않는다.

---

# 5. Explicitness Over Hidden Behavior

다음 종류의 숨은 동작을 피한다.

```text
import만 했는데 side effect 발생
component mount만으로 mutation 실행
암묵적인 participantCount default
global singleton이 자동으로 상태 변경
utility가 navigation까지 수행
adapter가 toast를 띄움
query hook이 component 밖의 UI state를 수정
```

중요한 상태 변화는 호출부에서 확인 가능해야 한다.

예:

```ts
await createReservation(draft);
navigateToReservationSuccess(reservationId);
```

처럼 흐름이 보이는 것을 선호한다.

---

# 6. Naming Standards

## 6.1 Component

PascalCase:

```text
TourCard
TourDetailHero
ReservationSummary
PreviousTripsDialog
```

Component 이름은
시각적 형태보다 의미 있는 역할을 우선한다.

피한다:

```text
Box1
LeftArea
RightSection
BigCard
MainThing
```

---

## 6.2 Page

반드시 `Page` suffix를 사용한다.

```text
HomePage
ToursPage
TourDetailPage
ConfigurePage
ReservationReviewPage
```

Route entry인지 일반 Component인지 즉시 구분하기 위함이다.

---

## 6.3 Hook

React convention을 따른다.

```text
useTourDetail
useReservationDraft
useReducedMotion
useReturnContext
```

Hook 이름은 “무엇을 반환하는가”보다
“어떤 capability를 제공하는가”가 드러나게 한다.

---

## 6.4 Event handler

Component 내부에서는:

```text
handleSelectStyle
handleRetrySchedule
handleSubmitReservation
handleCloseDialog
```

Props callback은:

```text
onSelectStyle
onRetry
onSubmit
onClose
```

규칙:

```text
handleX = 이 Component 내부의 실제 handler
onX     = 외부에서 전달받는 callback contract
```

---

## 6.5 Boolean

가능하면 다음 prefix를 사용한다.

```text
is
has
can
should
was
did
```

좋음:

```ts
isLoading
hasCachedHistory
canSubmitReservation
shouldRestoreDraft
```

피한다:

```ts
loading
errorFlag
submitEnabledFlag
statusBoolean
```

부정 boolean은 가급적 피한다.

피한다:

```ts
isNotReady
disableValidation
```

가능하면:

```ts
isReady
shouldValidate
```

---

## 6.6 Async action

의도가 드러나는 동사를 사용한다.

```text
load
fetch
create
update
restore
refresh
retry
validate
map
normalize
clear
persist
```

`process`, `handleData`, `execute`, `run` 같은
의미가 넓은 이름은 구체화가 불가능할 때만 사용한다.

---

## 6.7 Mapper / Adapter

변환 방향을 이름에 드러낸다.

좋음:

```ts
mapTourProductDtoToModel
mapReservationDtoToDetailModel
mapValidationErrorToFieldErrors
```

이름만 봐도 source와 target을 알 수 있어야 한다.

---

## 6.8 Type / Interface

의미 기반:

```text
TourProductCardModel
ReservationDraft
ReservationReviewModel
ScheduleChoiceModel
BackendErrorCategory
```

모든 type에 `Type` suffix를 붙이지 않는다.

---

## 6.9 Constants

상수의 범위가 중요하다.

```ts
const RESERVATION_DRAFT_VERSION = 1;
const MIN_TOUCH_TARGET_PX = 44;
```

반복 문자열을 무조건 상수화하지 않는다.

“의미 있는 개념”인 경우 상수화한다.

---

# 7. File Naming

기본 규칙:

```text
React Component      PascalCase.tsx
React Page           PascalCasePage.tsx
Hook                 useSomething.ts
Mapper/Adapter       mapSomething.ts 또는 SomethingAdapter.ts
Model                something.model.ts 또는 명확한 feature convention
Query Keys           somethingQueryKeys.ts
Test                 *.test.ts / *.test.tsx
E2E                  *.spec.ts
CSS Module           ComponentName.module.css
```

정확한 feature directory convention은 CP2에서 확정한다.

CP1의 핵심은
**파일 이름으로 책임을 구분할 수 있어야 한다는 것**이다.

---

# 8. Function Size Policy

줄 수 자체를 절대 규칙으로 사용하지 않는다.

그러나 다음은 **경고 신호**로 본다.

```text
일반 함수 40~60줄 이상
Component render logic 80~120줄 이상
하나의 함수에 3개 이상의 서로 다른 작업 단계
중첩 조건이 3단계 이상
하나의 함수에서 여러 외부 시스템/상태를 동시에 조작
```

경고 신호가 보이면 먼저 다음을 질문한다.

```text
이 함수가 두 가지 이상의 책임을 가지는가?
이름 하나로 함수 전체를 정확히 설명할 수 있는가?
일부 logic에 별도의 domain 이름을 붙일 수 있는가?
테스트를 위해 일부 logic을 떼는 것이 자연스러운가?
```

그렇다면 분리한다.

단,
**줄 수를 맞추기 위한 의미 없는 helper 분리**는 금지한다.

---

# 9. Component Size Policy

큰 Component 자체가 무조건 나쁜 것은 아니다.

하지만 다음 조건이 보이면 분리를 검토한다.

```text
data fetching + mapping + visual rendering이 한 파일에 존재
독립된 semantic section이 여러 개 있음
동일 section에 자체 interaction/state가 있음
JSX가 너무 길어 주요 flow를 찾기 어려움
conditional branch가 여러 화면 상태를 한 번에 표현
component test가 지나치게 복잡해짐
```

분리할 때는 시각적 `<div>` 개수보다
**책임과 사용자 의미**를 기준으로 한다.

좋음:

```text
TourDetailHero
TourStyleSelector
SchedulePicker
RecruitmentStatus
ReservationSummary
```

나쁨:

```text
TopArea
MiddleArea
LeftBox
RightBox
SectionOne
```

---

# 10. Page Readability Rule

Page는 Route-level orchestration을 담당한다.

Page에서 허용:

```text
route param 읽기
feature hook 호출
page-level loading/error composition
feature component 배치
navigation 연결
route-specific title/meta
```

Page에서 금지:

```text
raw fetch
raw DTO parsing
price formula
participant threshold 계산
JWT parsing
session storage 직접 조작
complex animation keyframe 정의
Backend status code 직접 분기
```

Page를 읽으면
**“이 Route가 어떤 Feature를 어떤 순서로 조합하는지”**가 보여야 한다.

---

# 11. Data Flow Readability Rule

CP0의 핵심 boundary를 코드 구조에서도 눈에 보이게 유지한다.

```text
Backend DTO
→ Adapter
→ Frontend Model
→ Feature
→ Page/UI
```

금지:

```text
Page
→ fetch()
→ response.data.foo.bar
```

좋음:

```text
Page
→ useTourDetail()
→ TourDetailModel
```

이 구조의 목적은
API field 이름을 숨기는 것이 아니라
**Backend contract와 사용자 경험 모델을 분리하는 것**이다.

---

# 12. State Readability Rule

서로 다른 의미의 상태를 한 객체에 섞지 않는다.

구분:

```text
Server State
Transaction State
Ephemeral UI State
```

예:

```ts
// Server state
const tourQuery = useTourProductQuery(tourId);

// Transaction state
const reservationDraft = useReservationDraft();

// Ephemeral UI state
const [isScheduleSheetOpen, setScheduleSheetOpen] = useState(false);
```

다음처럼 “everything store”를 만들지 않는다.

```text
appStore
  user
  tours
  dialog
  reservation
  hover
  loading
  auth
  price
  animation
```

---

# 13. Condition Readability

## 13.1 Prefer early return

나쁨:

```ts
if (data) {
  if (!error) {
    if (isReady) {
      // ...
    }
  }
}
```

좋음:

```ts
if (!data) {
  return <TourDetailSkeleton />;
}

if (error) {
  return <TourDetailError />;
}

if (!isReady) {
  return <TourDetailPending />;
}

return <TourDetailContent model={data} />;
```

---

## 13.2 Avoid chained ternaries

금지에 가깝게 취급:

```ts
const content = loading
  ? <Loading />
  : error
    ? <Error />
    : empty
      ? <Empty />
      : <Content />;
```

상태가 단순한 2-way 선택일 때만 ternary를 사용한다.

---

## 13.3 Name complex conditions

나쁨:

```ts
if (
  reservation &&
  !isLoading &&
  status !== 'error' &&
  draft?.scheduleId &&
  !isSubmitting
) {
  // ...
}
```

좋음:

```ts
const canOpenReservationReview =
  Boolean(reservation) &&
  !isLoading &&
  !hasReservationError &&
  Boolean(draft?.scheduleId) &&
  !isSubmitting;

if (canOpenReservationReview) {
  // ...
}
```

복잡한 조건에 이름을 주면
Business/UI intent가 드러난다.

---

# 14. TypeScript Readability

## 14.1 Prefer domain-specific types

피한다:

```ts
Record<string, any>
any
unknown as Something
```

경계에서 `unknown`을 받는 것은 가능하지만
검증 후 명확한 type으로 좁힌다.

---

## 14.2 Avoid type gymnastics without value

다음은 실제 재사용 이득이 있을 때만 사용한다.

```text
deep conditional type
complex mapped type
multi-level generic
generic component factory
```

TypeScript 기술 시연보다
팀원이 읽을 수 있는 type을 우선한다.

---

## 14.3 Discriminated union for meaningful states

서로 배타적인 상태를 boolean 조합으로 표현하지 않는다.

피한다:

```ts
isLoading
isError
isSuccess
isRetrying
```

네 boolean이 자유롭게 섞여
불가능한 조합이 생기는 경우.

필요한 경우:

```ts
type ScheduleViewState =
  | { status: 'loading' }
  | { status: 'success'; data: ScheduleChoiceModel[] }
  | { status: 'empty' }
  | { status: 'error'; error: FrontendError }
  | { status: 'retrying'; previousData?: ScheduleChoiceModel[] };
```

단 Query Library가 이미 신뢰할 수 있는 상태 모델을 제공한다면
불필요한 wrapper union을 또 만들지 않는다.

---

## 14.4 `as` assertion is exceptional

`as`는 타입 시스템을 강제로 우회하는 도구이므로
가능하면 validation/narrowing을 사용한다.

특히 금지:

```ts
apiResponse as ReservationDto
```

실제 contract validation 없이
Backend response를 믿게 만드는 assertion.

---

# 15. Props Readability

Component Props는
필요한 최소 의미만 받는다.

피한다:

```tsx
<TourCard tour={hugeServerObject} />
```

좋음:

```tsx
<TourCard
  title={model.title}
  theme={model.theme}
  image={model.image}
  href={model.href}
/>
```

단 너무 많은 primitive prop으로 쪼개져
호출부가 오히려 읽기 어려운 경우에는
명확한 frontend model object를 전달한다.

핵심:

```text
Raw Backend DTO 전달 X
Frontend 의미 모델 전달 O
```

---

# 16. JSX Readability

JSX에서 큰 데이터 변환이나 Business 판단을 하지 않는다.

피한다:

```tsx
{items
  .filter(...)
  .sort(...)
  .map(...)
  .reduce(...)
  .map(...)}
```

렌더링 전에 이름 있는 값으로 만든다.

```ts
const visibleScheduleOptions = getVisibleScheduleOptions(schedules);
```

그 후:

```tsx
{visibleScheduleOptions.map((schedule) => (
  <ScheduleOption key={schedule.id} schedule={schedule} />
))}
```

---

# 17. Styling Readability

스타일에서도 Magic Value를 최소화한다.

피한다:

```css
padding: 23px;
color: #9b7a4b;
z-index: 9999;
transition: 237ms;
```

가능하면:

```css
padding: var(--space-24);
color: var(--color-accent);
z-index: var(--z-modal);
transition-duration: var(--motion-medium);
```

기획상 의도적인 예외값이 필요한 경우
주석으로 이유를 남긴다.

---

# 18. Abstraction Threshold

이 프로젝트는 **추상화를 늦게 한다.**

추상화하기 전에 다음을 확인한다.

1. 실제로 같은 의미의 코드가 반복되는가?
2. 변화 이유도 같은가?
3. 공통화했을 때 호출부가 더 이해하기 쉬워지는가?
4. 추상화 이름을 구체적으로 붙일 수 있는가?
5. 향후 한 구현만 달라질 가능성이 낮은가?

대부분 `YES`일 때 추상화한다.

---

# 19. Duplication vs Abstraction

이 프로젝트의 기본 원칙:

> **조금의 중복은 잘못된 추상화보다 싸다.**

두 Component가 비슷하게 생겼다는 이유만으로
즉시 Generic Component를 만들지 않는다.

예:

```text
TourCard
TravelHistoryCard
ReservationSummaryCard
```

세 가지가 모두 사각형 카드라는 이유로:

```text
UniversalCard
```

를 만들지 않는다.

공통화 기준은 “모양”보다
“동일한 책임과 동일한 변화 이유”다.

---

# 20. Generic Abstraction Rules

다음을 특히 경계한다.

```text
BaseManager
UniversalRenderer
GenericSection
SmartContainer
CommonHandler
DynamicFactory
useEverything
```
이름이 넓을수록
책임이 불명확할 가능성이 높다.

Generic abstraction이 필요한 경우
PR 설명 또는 코드 주석에서
실제 재사용 이유를 설명할 수 있어야 한다.

---

# 21. Comment Philosophy

사용자 요구사항에 따라
Mister World Frontend는 **일반적인 프로젝트보다 적극적으로 주석을 작성한다.**

그러나 목표는:

```text
주석 줄 수 최대화
```

가 아니라:

```text
사람이 이해하기 위해 코드 밖에서 찾아야 하는 정보를
가능한 한 코드 가까이에 남기는 것
```

이다.

코드가 `WHAT`을 명확하게 표현하고,
주석은 주로 다음을 설명한다.

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
DEFERRED DECISION
```

---

# 22. Required Comment Categories

## 22.1 WHY

“왜 이 방식을 선택했는가?”

예:

```ts
// 성공 데이터를 먼저 비우지 않는다.
// background refresh 실패 때문에 이미 확인한 일정까지 사라지면
// 사용자가 전체 화면 장애로 오해할 수 있기 때문이다.
```

---

## 22.2 CONTRACT

“어떤 Shared Contract를 지키는가?”

예:

```ts
// CONTRACT: Theme은 TourProduct의 분류다.
// Theme value를 tourId로 사용하면 CP0-D03과 Shared Domain Model을 위반한다.
```

---

## 22.3 INVARIANT

“이 코드가 항상 지켜야 하는 조건은 무엇인가?”

예:

```ts
// INVARIANT: 서버가 Reservation 생성을 확정하기 전에는
// ReservationDraft를 삭제하지 않는다.
```

---

## 22.4 LIFECYCLE

“이 상태는 어떤 순서로 움직이는가?”

예:

```ts
/**
 * ReservationDraft lifecycle
 *
 * Tour Detail
 * → Configure
 * → Review
 * → Auth interruption
 * → Review restore
 * → Server-confirmed Reservation success
 * → Clear
 */
```

---

## 22.5 EDGE CASE

“평소에는 보이지 않는 예외가 왜 필요한가?”

예:

```ts
// EDGE CASE:
// Reservation POST 직후 connection이 끊기면
// 서버에 생성됐는지 확정할 수 없으므로 자동 retry하지 않는다.
// 동일 요청을 재전송하면 중복 Reservation이 생길 수 있다.
```

---

## 22.6 SECURITY

민감 데이터 또는 auth 관련 이유.

```ts
// SECURITY:
// ReturnContext에는 route와 draft reference만 저장한다.
// credential/token/raw auth response는 sessionStorage에 넣지 않는다.
```

---

## 22.7 ACCESSIBILITY

접근성 구현이 코드만 보고 명확하지 않을 때.

```ts
// A11Y:
// Dialog가 닫히면 trigger로 focus를 되돌려
// keyboard 사용자가 현재 위치를 잃지 않게 한다.
```

---

## 22.8 PERFORMANCE

성능 최적화가 의도적인 경우.

```ts
// PERFORMANCE:
// Hero image hover만으로 모든 고해상도 이미지를 prefetch하지 않는다.
// Mobile data 사용량과 불필요한 bandwidth 소비를 제한한다.
```

성능 주석을 핑계로
검증되지 않은 premature optimization을 하지 않는다.

---

## 22.9 WORKAROUND

브라우저/라이브러리 제약 때문에
직관적이지 않은 코드가 필요한 경우.

```ts
// WORKAROUND:
// iOS Safari의 dynamic viewport 변화 때문에 100vh 대신 100dvh를 사용한다.
// 관련 layout regression test를 제거하지 않는다.
```

가능하면 issue/reference를 같이 남긴다.

---

## 22.10 BLOCKED / CONTRACT GATE

CP0의 H-ID를 그대로 사용한다.

예:

```ts
// BLOCKED H-02:
// participantCount의 입력 위치와 기본값은 아직 승인되지 않았다.
// 이 값에 hidden default를 넣지 않는다.
```

단순 `TODO`보다
무엇이 왜 막혀 있는지 추적 가능해야 한다.

---

# 23. Comment Density Rule

“주석을 최대한 많이”라는 요구는 다음처럼 적용한다.

## 반드시 상세 주석을 권장/요구하는 곳

```text
exported major Component
exported Hook
Adapter / Mapper
ReservationDraft/store
async transaction
cache/retry policy
auth interruption
sessionStorage persistence
race condition handling
contract-gated branch
non-obvious CSS workaround
Dialog/Sheet focus behavior
image/loading fallback architecture
error normalization
important test scenario
```

## 짧은 local rendering code

코드 자체가 명확하면
모든 줄에 주석을 붙이지 않는다.

목표:

```text
설명 정보량은 많게
noise는 적게
```

---

# 24. Exported API Documentation

주요 exported symbol에는
역할 설명을 기본으로 작성한다.

예:

```ts
/**
 * Reservation flow에서 사용자가 선택한 값을 보존하는 Frontend transaction draft.
 *
 * Backend Reservation DTO의 복사본이 아니다.
 * 서버 truth, credential, raw API response는 저장하지 않는다.
 *
 * Draft는 Configure/Review/Auth interruption 사이에서 유지되고,
 * 서버가 Reservation 생성을 확정한 이후에만 정상적으로 clear된다.
 */
export interface ReservationDraft {
  // ...
}
```

모든 trivial constant에 긴 JSDoc을 강제하지는 않는다.

---

# 25. Component Comment Template

복잡한 주요 Component는 필요한 경우 다음 형식을 사용한다.

```ts
/**
 * Tour Detail에서 출발 일정을 선택하는 영역.
 *
 * Responsibilities:
 * - ScheduleChoiceModel을 사용자에게 표시
 * - 현재 선택 상태 표현
 * - 선택 이벤트를 상위 feature action으로 전달
 *
 * Does not:
 * - Backend DTO를 해석하지 않음
 * - 모집 확정 Business Rule을 계산하지 않음
 * - navigation을 직접 결정하지 않음
 */
```

특히 “Does not”은
경계가 중요한 Component에서 적극적으로 활용한다.

---

# 26. Hook Comment Template

```ts
/**
 * Tour Detail → Configure → Review 사이에서 ReservationDraft를 제공한다.
 *
 * Persistence:
 * - sessionStorage recovery 가능
 * - credential/server truth는 저장하지 않음
 *
 * Invariant:
 * - network/401/409/422에서 draft를 자동 삭제하지 않음
 */
```

Hook이 network, persistence, navigation까지
모두 숨기는 god-hook이 되지 않도록 한다.

---

# 27. Adapter Comment Template

```ts
/**
 * Approved Backend TourSchedule DTO를
 * UI가 소비하는 ScheduleChoiceModel로 변환한다.
 *
 * API field naming을 Feature/UI에서 격리하기 위한 boundary다.
 * Mapping이 불가능하면 ContractMappingError로 실패하며
 * raw malformed payload를 UI까지 전달하지 않는다.
 */
```

Adapter는 Side Effect를 최소화한다.

---

# 28. Test Comment Policy

테스트도 문서다.

좋은 테스트 이름:

```ts
it('keeps the existing schedule content visible when background refresh fails')
```

나쁜 테스트 이름:

```ts
it('works')
it('test1')
```

복잡한 시나리오에서는
Given/When/Then 의미를 주석으로 보조할 수 있다.

```ts
// Given: 사용자가 Review까지 구성한 draft가 존재한다.
// When: Reservation submit이 401로 중단된다.
// Then: Login 이후 draft가 복구되지만 자동 submit은 발생하지 않는다.
```

단순 assertion마다 주석을 붙이지 않는다.

---

# 29. Comment Language

기본 규칙:

```text
Identifier / code term → English
사람을 위한 설명 주석 → Korean 중심
공식 Domain/API identifier → 원문 English 유지
```

예:

```ts
// ReservationDraft는 서버 Reservation DTO가 아니라
// Frontend transaction state다.
```

팀원이 가장 빠르게 이해할 수 있는 언어를 우선한다.

---

# 30. Comment Freshness

오래된 주석은
주석이 없는 것보다 위험할 수 있다.

따라서 코드 변경 시 다음을 반드시 확인한다.

```text
함수 책임이 바뀌었는가?
Contract가 바뀌었는가?
State lifecycle이 바뀌었는가?
Edge case 처리가 바뀌었는가?
기존 주석이 아직 사실인가?
```

주석 업데이트는
Definition of Done에 포함한다.

---

# 31. Forbidden Comment Patterns

## 31.1 What-repeat

금지:

```ts
// count를 1 증가시킨다.
count += 1;
```

```tsx
// 버튼을 렌더링한다.
return <Button />;
```

---

## 31.2 Fake certainty

금지:

```ts
// Backend는 항상 이 형식으로 내려준다.
```

실제 DTO contract가 TBD인데
주석으로 확정된 것처럼 쓰지 않는다.

---

## 31.3 Historical diary

Git이 이미 기록하는 변경 내역을
코드에 일기처럼 남기지 않는다.

피한다:

```ts
// 2026-09-29: AI가 이 코드를 수정함.
// 이전에는 A였는데 B로 변경함.
```

현재 코드가 왜 B여야 하는지만 남긴다.

---

## 31.4 Dead code explanation

주석 처리된 옛 코드를 장기간 남기지 않는다.

```ts
// oldImplementation();
```

필요하면 Git history를 사용한다.

---

# 32. Magic Value Policy

Business/Design 의미가 있는 값은
명확한 source를 가져야 한다.

금지:

```ts
if (count >= 4) { ... }
```

코드 문맥에서 4의 의미가 불명확한 경우.

Shared Business Rule을 UI presentation에 써야 한다면
의미 있는 상수 또는 model property를 사용하고
최종 authority가 Backend임을 유지한다.

Design value는 CP3 Design System token을 사용한다.

---

# 33. Error Handling Readability

Error handling은 catch-all 하나에 숨기지 않는다.

피한다:

```ts
catch {
  toast('오류');
}
```

가능하면 normalized category를 사용한다.

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

UI에는 raw stack/backend exception을 노출하지 않는다.

Error branch를 읽으면
사용자가 무엇을 할 수 있는지 알 수 있어야 한다.

---

# 34. Async Code Readability

Async flow에서 중요한 단계를 숨기지 않는다.

좋음:

```ts
const latestReview = await revalidateReservationReview(draft);
const reservation = await createReservation(latestReview);
clearReservationDraft();
navigateToSuccess(reservation.id);
```

실제 구현에서는 error branch가 추가되겠지만
핵심 lifecycle이 보이는 구조를 유지한다.

피한다:

```ts
await submitEverything();
```

`submitEverything()` 안에서
validation, auth, mutation, cache clear, navigation을 전부 수행하는 구조.

---

# 35. Side-Effect Locality

Side effect는 가능한 한
책임 있는 layer 가까이에 둔다.

예:

```text
Adapter          → mapping
Query layer      → server state
Draft store      → transaction persistence
Page             → route navigation
Dialog component → focus management
```

하위 UI Component가
상위 route navigation이나 global cache clear를 몰래 하지 않는다.

---

# 36. React Effect Policy

`useEffect`는 “일단 동작하게 하는 도구”가 아니다.

사용 전 질문:

```text
외부 시스템과 동기화하는가?
DOM/browser API와 동기화하는가?
subscription lifecycle인가?
```

단순 derived state는 `useEffect`로 만들지 않는다.

피한다:

```ts
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

좋음:

```ts
const fullName = `${firstName} ${lastName}`;
```

Effect에 복잡한 transaction logic을 숨기지 않는다.

---

# 37. Memoization Policy

`useMemo`, `useCallback`, `memo`를
습관적으로 사용하지 않는다.

사용 이유가 다음 중 하나처럼 명확해야 한다.

```text
실제 expensive computation
referential stability가 외부 API에 필요
측정된 render bottleneck
dependency correctness
```

가독성을 해치는 premature optimization은 피한다.

---

# 38. Hook Responsibility

Custom Hook은
하나의 coherent capability를 제공한다.

좋음:

```text
useReservationDraft
useTourScheduleQuery
useDialogFocusReturn
```

피한다:

```text
useTourPageEverything
useAppLogic
useCommon
```

Hook이 너무 많은 return 값을 내놓는다면
책임이 넓어진 신호로 본다.

---

# 39. Public API Narrowness

Feature 외부에서 사용할 수 있는 surface를 좁게 유지한다.

Feature 내부 파일을
다른 Feature/Page가 deep import하지 않도록 한다.

예:

```ts
import { TourCard, useTourDiscovery } from '@/features/tour-discovery';
```

가능하면 피한다:

```ts
import { mapFoo } from '@/features/tour-discovery/internal/helpers/mapFoo';
```

정확한 barrel/export convention은 CP2에서 확정한다.

---

# 40. Avoid Boolean Prop Explosion

피한다:

```tsx
<Card
  isLarge
  isDark
  isPremium
  isCompact={false}
  isInteractive
  hasBorder
  isSelected
/>
```

Component가 여러 독립 mode를 억지로 하나에 담는 신호다.

가능하면 semantic variant나
다른 Component 책임으로 나눈다.

---

# 41. Domain Language Consistency

Shared Domain 용어를 임의로 바꾸지 않는다.

사용:

```text
Theme
TourProduct
TourSchedule
TourStyle
TourConfiguration
Reservation
TravelHistory
```

혼용 피하기:

```text
package
trip item
theme tour
tour object
booking object
```

사용자 표시 copy와 코드 Domain name은 다를 수 있으나
내부 코드에서는 Shared terminology를 우선한다.

---

# 42. Contract-Gate Comment Standard

미확정 계약 때문에 임시 경계가 존재하는 경우
다음 형식을 권장한다.

```ts
// BLOCKED H-04 — Authentication contract
//
// Login visual shell은 구현할 수 있지만
// credential field 및 JWT/session persistence는 아직 승인되지 않았다.
// 이 파일에서 token storage 전략을 추가하지 않는다.
```

필요 시:

```text
Requirement ID
Screen ID
Shared Docs path
```

까지 추가할 수 있다.

---

# 43. TODO Policy

일반 `TODO`는 허용하되,
다음과 같은 중요 미완료는 명시적 tag를 사용한다.

```text
BLOCKED H-xx
CONTRACT
A11Y
SECURITY
WORKAROUND
```

나쁜 예:

```ts
// TODO later
```

좋은 예:

```ts
// BLOCKED H-07:
// Configuration option IDs가 Shared API v0.2에서 확정되면
// MockDataSource를 BackendAdapter로 교체한다.
```

---

# 44. AI-Generated Code Risks

AI가 자주 만드는 다음 패턴을
코드 리뷰에서 적극적으로 찾는다.

## AI-01 — Unnecessary files

작은 의미 없는 파일을 과도하게 생성.

예:

```text
getFoo.ts
setFoo.ts
fooUtils.ts
fooHelpers.ts
fooConstants.ts
fooTypes.ts
```

각 파일이 3~5줄이고
같이 바뀌는 경우라면 오히려 탐색 비용이 크다.

---

## AI-02 — Fake generic architecture

실제 요구 없이:

```text
BaseRepository
BaseService
AbstractManager
UniversalFactory
GenericRenderer
```

등을 만든다.

Frontend scope와 현재 요구에 필요한 만큼만 만든다.

---

## AI-03 — Wrapper chains

```text
Component
→ Wrapper
→ Container
→ Provider
→ AdapterWrapper
→ InnerComponent
```

실제 책임 분리가 없는데
layer만 늘리지 않는다.

---

## AI-04 — Duplicate helper invention

기존 utility/component를 확인하지 않고
유사 기능을 새로 만든다.

구현 전 동일 의미의 코드가 있는지 검색한다.

---

## AI-05 — Fake contract

Mock field 또는 추측 field를
마치 실제 Backend DTO처럼 naming한다.

예:

```ts
interface TourApiResponse {
  // 실제 계약 없이 생성
}
```

Contract가 없으면
`MockTourModel`, `TourCardFixture`처럼
Frontend-only source임을 드러낸다.

---

## AI-06 — Premature completeness

요청하지 않은 기능까지 “완성도”라는 이름으로 구현.

예:

```text
logout endpoint 추측
refresh token
pagination
history detail
cancellation
payment
```

CP0 scope를 벗어나지 않는다.

---

## AI-07 — Comment spam

모든 줄을 설명해
중요한 주석이 묻히게 만든다.

주석은 많되
실제 의사결정 정보가 있어야 한다.

---

## AI-08 — Giant generated component

수백 줄 JSX에
fetch/state/error/modal/style을 몰아넣는다.

책임 기준으로 나눈다.

---

## AI-09 — Excessive `any`

빠르게 type error를 없애기 위해
`any`, assertion을 남발한다.

Boundary를 명확히 한다.

---

## AI-10 — Silent behavior change

기존 코드 cleanup 중
Business behavior까지 바꾼다.

Refactor와 behavior change를 구분한다.

---

# 45. Readability Review Questions

코드 리뷰자는 파일마다 다음 질문을 할 수 있어야 한다.

1. 이 파일의 목적을 10초 안에 설명할 수 있는가?
2. 주요 데이터가 어디서 들어오는지 알 수 있는가?
3. 주요 상태가 어디서 소유되는지 알 수 있는가?
4. Side effect가 어디에서 발생하는지 보이는가?
5. Shared Contract와 Frontend-only decision이 구분되는가?
6. 이상해 보이는 코드에는 이유가 설명되어 있는가?
7. 중요한 edge case가 주석/테스트로 남아 있는가?
8. 이 파일을 수정하면 무엇이 영향을 받을지 예상 가능한가?

대부분 `NO`라면
동작 여부와 무관하게 가독성 개선이 필요하다.

---

# 46. Code Review — Naming Checklist

- [ ] 이름이 책임을 설명한다.
- [ ] `data`, `item`, `thing`, `temp`, `flag` 같은 모호한 이름이 남용되지 않았다.
- [ ] boolean은 `is/has/can/should` 의미가 분명하다.
- [ ] Handler와 callback naming이 일관된다.
- [ ] Shared Domain terminology를 사용한다.
- [ ] Mapper는 변환 방향이 드러난다.
- [ ] 파일 이름만으로 대략 역할을 알 수 있다.

---

# 47. Code Review — Structure Checklist

- [ ] 하나의 module이 하나의 주된 책임을 가진다.
- [ ] Page에 raw API parsing이 없다.
- [ ] Raw DTO가 visual component까지 전달되지 않는다.
- [ ] Server/Transaction/UI state가 섞이지 않는다.
- [ ] Side effect가 예상 가능한 layer에 있다.
- [ ] 의미 없는 wrapper가 없다.
- [ ] deep import/private feature coupling이 없다.
- [ ] 불필요한 global state가 없다.

---

# 48. Code Review — Readability Checklist

- [ ] 파일을 top-to-bottom으로 읽을 수 있다.
- [ ] chained ternary가 복잡한 상태 흐름을 숨기지 않는다.
- [ ] 깊은 nesting이 없다.
- [ ] complex condition에 의미 있는 이름이 있다.
- [ ] JSX 안에서 큰 data transformation을 하지 않는다.
- [ ] clever one-liner가 유지보수성을 해치지 않는다.
- [ ] abstraction이 실제 반복과 동일한 변화 이유를 가진다.

---

# 49. Code Review — Comment Checklist

- [ ] 주요 exported symbol의 책임이 필요한 수준으로 설명되어 있다.
- [ ] 복잡한 logic의 WHY가 설명되어 있다.
- [ ] Contract-dependent code에 계약 근거가 있다.
- [ ] invariant가 중요한 경우 명시되어 있다.
- [ ] async lifecycle/race condition이 설명되어 있다.
- [ ] A11Y workaround가 필요한 경우 이유가 있다.
- [ ] Security-sensitive behavior가 설명되어 있다.
- [ ] `BLOCKED H-xx`가 필요한 곳에 추적 가능한 형태로 남아 있다.
- [ ] code를 그대로 읽어주는 noise comment가 과하지 않다.
- [ ] 기존 주석이 현재 코드와 일치한다.

---

# 50. Code Review — Contract Safety Checklist

- [ ] Theme를 tourId로 사용하지 않는다.
- [ ] participantCount hidden default가 없다.
- [ ] Honeymoon에서 `participantCount / 2`는 v0.1.2의 `>= 2 + even` 유효성 조건을 통과한 경우에만 derived `coupleCount`로 사용하며, 별도 Couple/Team Entity나 API field를 발명하지 않는다.
- [ ] Auth mechanism을 추측하지 않는다.
- [ ] Frontend price engine이 없다.
- [ ] 미승인 endpoint가 없다.
- [ ] Mock type을 Backend DTO로 위장하지 않는다.
- [ ] Reservation status enum을 임의 생성하지 않는다.
- [ ] History detail/pagination을 임의 생성하지 않는다.

---

# 51. Test Readability Standard

Test file을 읽으면
Feature behavior를 이해할 수 있어야 한다.

테스트 구조:

```text
사용자/상태 관점 scenario
→ action
→ observable result
```
내부 implementation detail만 테스트하지 않는다.

피한다:

```text
private function이 3회 호출됨
internal state variable이 특정 값
```

필요한 경우 외부 동작을 통해 검증한다.

---

# 52. Refactor Policy

Refactor의 목적은
“코드가 마음에 안 든다”가 아니라
명시 가능한 문제를 해결하는 것이다.

예:

```text
책임 혼합
중복
복잡한 nesting
API leakage
상태 ownership 불명확
test 어려움
```

Refactor PR에서
Business behavior 변경을 섞지 않는 것을 기본으로 한다.

---

# 53. Dead Code Policy

사용하지 않는 코드, feature flag 없이 남은 실험 코드,
주석 처리된 옛 구현은 제거한다.

“나중에 쓸 수도 있음”은 유지 이유가 아니다.

필요하면 Git history에서 복구할 수 있다.

---

# 54. Dependency Introduction Rule

새 library는
직접 구현보다 명확한 가치가 있을 때 추가한다.

PR 또는 계획에서 최소 다음을 설명할 수 있어야 한다.

```text
무슨 문제를 해결하는가?
왜 기존 stack으로 충분하지 않은가?
bundle/runtime 영향은 어떤가?
접근성/SSR/브라우저 compatibility 이슈는 없는가?
유지보수 상태는 괜찮은가?
```

단순히 AI가 익숙하다는 이유로 추가하지 않는다.

구체적인 stack 확정은 CP4에서 다룬다.

---

# 55. Code Locality Principle

같이 읽고 같이 바뀌는 코드는
가능하면 가까이 둔다.

예:

```text
feature-local model
feature-local hook
feature-local component
```

모든 type/util을 global folder에 모으는
“종류별 중앙집중”을 피한다.

`shared`는 정말 business-agnostic한 경우에만 사용한다.

정확한 구조는 CP2에서 확정한다.

---

# 56. Model Clarity

Frontend Model은
화면이 필요한 의미를 표현한다.

좋은 model:

```ts
interface ScheduleChoiceModel {
  id: string;
  periodLabel: string;
  availabilityLabel: string;
  isSelectable: boolean;
}
```

단 위 field는 예시일 뿐이며
실제 Shared Contract와 screen spec에 맞춰 확정한다.

중요한 것은
Backend DTO를 그대로 복사한 model을 만들지 않는 것이다.

---

# 57. No Hidden Business Logic in Presentation

다음과 같은 계산이
JSX 내부에 숨어 있으면 안 된다.

```tsx
{theme === 'HONEYMOON_ROMANCE' && count >= 4 ? 'Confirmed' : 'Pending'}
```

이 판단은 Backend authority 및 shared business rule과 연결되므로
Presentation에서 임의 authoritative truth로 계산하지 않는다.

화면이 필요로 하는 status는
승인된 server/view model 의미를 소비한다.

---

# 58. User-Facing Copy Ownership

Backend raw message를 바로 출력하지 않는다.

```text
Backend error
→ normalized error
→ Feature-owned user copy
```

사용자 copy는 UI 책임이지만
Business meaning을 왜곡하면 안 된다.

---

# 59. Logging Readability and Safety

로그는 debugging에 필요한 최소 safe context를 제공한다.

허용 가능한 예:

```text
error category
feature/action name
safe resource ID
HTTP status
correlation/request ID
```

금지:

```text
password
token
full address
contact
private payload
raw credential
```

로그 문자열도
“error happened”보다
어느 경계에서 무엇이 실패했는지 나타내야 한다.

---

# 60. Accessibility Code Readability

접근성 로직은
나중에 붙이는 별도 layer가 아니다.

Component API에서 드러나야 한다.

예:

```text
Dialog title/description
field label/error association
button vs link semantics
focus return
disabled state
live region
```

복잡한 focus logic에는
왜 필요한지 주석을 남긴다.

---

# 61. Motion Code Readability

Motion 값은 token을 사용하고
Component 내부에 무작위 숫자를 넣지 않는다.

Motion은 “어떤 상태 변화”를 설명하는지
이름과 구조로 드러나야 한다.

피한다:

```ts
transition: { duration: 0.37 }
```

이유 없는 숫자.

Reduced Motion branch는
별도 afterthought가 아니라 같은 logic 안에서 추적 가능해야 한다.

---

# 62. CSS Comment Standard

CSS 주석은 특히 다음에 사용한다.

```text
non-obvious layout compensation
safe-area handling
browser workaround
focus layering
sticky/fixed collision
responsive transformation
```

예:

```css
/*
 * Mobile Safari에서 bottom action이 home indicator와 겹치지 않도록
 * safe-area inset을 기존 spacing에 더한다.
 */
padding-bottom: calc(var(--space-16) + env(safe-area-inset-bottom));
```

일반적인 `display: flex`에는 주석이 필요 없다.

---

# 63. Failure-State Clarity

Loading/Error/Empty/Retry branch는
하나의 giant conditional에 숨기지 않는다.

상태별 Component 또는
명확한 early return으로 구분한다.

예:

```tsx
if (query.isPending) {
  return <TourListSkeleton />;
}

if (query.isError) {
  return <TourListError onRetry={query.refetch} />;
}

if (query.data.length === 0) {
  return <TourListEmpty />;
}

return <TourList tours={query.data} />;
```

단 stale success가 있는 refresh error처럼
기획상 성공 내용을 유지해야 하는 경우는
CP0/CP8 정책에 맞게 다룬다.

---

# 64. Mutation Flow Documentation

중요 mutation은
코드 근처에 lifecycle을 설명한다.

Reservation create 예:

```text
Review revalidation
→ User submit
→ Duplicate submit lock
→ POST
→ confirmed success
→ Draft clear
→ Success route
```

실패:

```text
401 → Auth → Draft restore → Manual submit
409 → latest truth → reconfirm
422 → correction
ambiguous network outcome → no blind retry
```

이 흐름은 구현 시 주석/테스트 중 적절한 곳에 남긴다.

---

# 65. Readability and Performance Trade-off

성능 최적화로 코드가 복잡해진다면
측정 근거가 필요하다.

기본:

```text
가독성 좋은 단순 구현
→ 측정
→ 병목 확인
→ 최소한의 최적화
→ 이유 주석
```

처음부터 복잡한 caching/memoization을 만들지 않는다.

단 CP0/CP8에서 이미 정의된 Query caching 정책은
계획된 구조이므로 예외가 아니다.

---

# 66. Readability and Reuse Trade-off

재사용률이 낮아도
Domain 의미가 명확한 Component를 선호할 수 있다.

예:

```text
ReservationPriceSummary
TravelHistoryPrice
```

시각적으로 비슷하더라도
데이터 의미와 변화 이유가 다르면
억지로 하나의 GenericPrice로 합치지 않는다.

---

# 67. Change Surface Principle

변경 시 수정 범위가 예측 가능해야 한다.

예:

```text
Backend DTO field 변경
→ Adapter/Contract boundary 위주 수정

visual spacing 변경
→ Design Token 또는 component style 수정

ReservationDraft persistence 변경
→ reservation transaction layer 수정
```

DTO 변경 때문에
11개 Page를 동시에 고쳐야 한다면
Architecture boundary가 잘못된 신호다.

---

# 68. Local Documentation over Tribal Knowledge

중요 구현 이유를
채팅이나 사람 기억에만 남기지 않는다.

다음 중 적절한 위치에 기록한다.

```text
code comment
test name
README
planning document
decision document
PR description
```

팀원이 이전 대화를 모르더라도
Repository만으로 이해할 수 있어야 한다.

---

# 69. Comment Examples — Good

## Adapter boundary

```ts
/**
 * Backend Reservation response를 ReservationDetailModel로 변환한다.
 *
 * Raw DTO를 Page까지 전달하지 않는 이유는 API v0.2 field 변경이
 * visual layer 전체로 확산되는 것을 막기 위해서다.
 */
```

## Contract gate

```ts
// BLOCKED H-02:
// participantCount 자체는 Shared Domain에 존재하지만
// 입력 UI와 default는 아직 승인되지 않았다.
// 따라서 이 form에서 자동 초기값을 만들지 않는다.
```

## Cache behavior

```ts
// 기존 성공 data를 유지한다.
// refresh 실패는 "새 정보를 못 가져온 것"이지
// 이전에 성공한 data까지 무효라는 의미가 아니다.
```

## Accessibility

```ts
// Dialog close 후 trigger로 focus를 복귀시킨다.
// 그렇지 않으면 keyboard 사용자의 focus가 body로 떨어질 수 있다.
```

---

# 70. Comment Examples — Bad

```ts
// API를 호출한다.
await fetchTour();
```

```ts
// loading인지 확인한다.
if (isLoading) { ... }
```

```ts
// TODO: 나중에 고친다.
```

```ts
// JWT를 localStorage에 저장한다.
// (계약 미확정인데 임의로 확정)
```

---

# 71. PR Readability Evidence

향후 Implementation PR에서는
코드 품질과 관련해 다음을 확인한다.

```text
새 abstraction이 필요한 이유
새 dependency가 필요한 이유
새 shared component가 실제 business-agnostic인지
복잡한 logic에 설명이 있는지
Contract Gate가 숨겨지지 않았는지
tests가 scenario를 설명하는지
```

모든 PR에 별도 장문의 설명이 필요한 것은 아니지만
비직관적 설계에는 근거가 있어야 한다.

---

# 72. Definition of Done — Code Quality

기능이 동작해도 다음을 만족하지 않으면
CP1 기준에서 완료가 아니다.

## Readability

- [ ] 주요 파일의 책임이 이름과 구조로 드러난다.
- [ ] 모호한 variable/function naming이 없다.
- [ ] 복잡한 nested condition이 정리되어 있다.
- [ ] JSX가 data/business logic을 숨기지 않는다.
- [ ] Page가 orchestration 책임을 유지한다.
- [ ] Raw DTO leakage가 없다.

## Comments

- [ ] 중요한 WHY가 코드 가까이에 기록되어 있다.
- [ ] Contract/Invariant/Lifecycle 설명이 필요한 곳에 있다.
- [ ] Contract Gate는 `BLOCKED H-xx`로 추적 가능하다.
- [ ] Race/async/security/a11y workaround가 필요한 경우 설명되어 있다.
- [ ] 주석이 현재 코드와 일치한다.
- [ ] 단순 WHAT 반복 주석이 과도하지 않다.

## Architecture safety

- [ ] Shared Domain 용어가 일관된다.
- [ ] Business Rule을 Frontend가 새로 만들지 않았다.
- [ ] State ownership이 명확하다.
- [ ] Side effect 위치가 예상 가능하다.
- [ ] Generic abstraction이 실제 필요에 의해 존재한다.

## AI safety

- [ ] 의미 없는 wrapper/file 증가가 없다.
- [ ] 추측 DTO/API가 없다.
- [ ] `any`/assertion으로 문제를 숨기지 않았다.
- [ ] 요청 범위를 넘는 기능을 추가하지 않았다.
- [ ] 기존 utility/component를 불필요하게 중복하지 않았다.

## Tests / Docs

- [ ] 테스트 이름이 사용자/상태 behavior를 설명한다.
- [ ] 중요 edge case가 test 또는 comment로 남아 있다.
- [ ] README/주석/계획서가 변경된 동작과 모순되지 않는다.

---

# 73. CP1 Decision Log

## CP1-D01 — Human-readable code

사람이 읽기 좋은 코드는
짧은 코드가 아니라
**책임, 데이터 흐름, 상태 변화, 계약 경계를 빠르게 이해할 수 있는 코드**로 정의한다.

## CP1-D02 — Intent-first naming

이름은 구현 기술보다
Domain/사용자 의도를 표현한다.

## CP1-D03 — One primary responsibility

Module/Component/Hook은
하나의 중심 책임을 갖는다.

## CP1-D04 — Readability over cleverness

복잡한 one-liner, chained ternary, 깊은 nesting보다
명시적 control flow를 우선한다.

## CP1-D05 — Explicit state ownership

Server / Transaction / Ephemeral UI state를 구분한다.

## CP1-D06 — Delayed abstraction

실제 반복과 동일한 변화 이유가 확인되기 전
Generic abstraction을 만들지 않는다.

## CP1-D07 — Small duplication is acceptable

작은 중복은
잘못된 추상화보다 허용 가능하다.

## CP1-D08 — Comment-heavy documentation

일반 프로젝트보다 적극적으로 주석을 작성한다.

단 주석은 WHAT 반복이 아니라
WHY / CONTRACT / INVARIANT / LIFECYCLE / EDGE CASE를 중심으로 한다.

## CP1-D09 — Korean explanatory comments

Identifier와 Domain term은 English를 유지하고
사람이 읽는 설명 주석은 Korean을 기본으로 한다.

## CP1-D10 — Exported major symbol documentation

주요 exported Component/Hook/Adapter/Model에는
책임과 경계를 설명하는 주석을 기본으로 한다.

## CP1-D11 — Contract gate traceability

중요 TBD는 일반 TODO가 아니라
`BLOCKED H-xx` 형식으로 추적한다.

## CP1-D12 — Comment correctness is DoD

코드 변경 시
관련 주석 갱신도 완료 조건에 포함한다.

## CP1-D13 — No AI architecture inflation

AI가 자주 만드는
불필요한 wrapper/generic/file 분할을 적극적으로 금지한다.

## CP1-D14 — No raw DTO UI coupling

가독성과 변경 격리를 위해
Raw Backend DTO를 visual layer에 노출하지 않는다.

## CP1-D15 — Tests are executable documentation

테스트 이름과 scenario는
기능 behavior를 설명할 수 있어야 한다.

---

# 74. CP1 Completion Checklist

## Human-readable definition

- [x] 파일 책임 기준 정의
- [x] top-to-bottom readability 정의
- [x] naming 기준 정의
- [x] function/component size 경고 기준 정의
- [x] Page readability 정의
- [x] data-flow readability 정의
- [x] state readability 정의
- [x] condition/nesting 기준 정의
- [x] TypeScript readability 정의
- [x] JSX readability 정의
- [x] styling readability 정의

## Abstraction

- [x] abstraction threshold 정의
- [x] duplication vs abstraction 기준 정의
- [x] Generic abstraction 제한
- [x] wrapper/file inflation 방지
- [x] public API narrowness 기준

## Comments

- [x] Comment philosophy 정의
- [x] WHY 정의
- [x] CONTRACT 정의
- [x] INVARIANT 정의
- [x] LIFECYCLE 정의
- [x] EDGE CASE 정의
- [x] SECURITY 정의
- [x] A11Y 정의
- [x] PERFORMANCE 정의
- [x] WORKAROUND 정의
- [x] BLOCKED H-ID 정의
- [x] exported API documentation 기준
- [x] test comment 기준
- [x] comment language 기준
- [x] comment freshness 기준
- [x] forbidden comment pattern 정의

## React / TypeScript

- [x] Effect policy
- [x] Memoization policy
- [x] Hook responsibility
- [x] boolean prop explosion 방지
- [x] assertion/any 위험 정의
- [x] discriminated state 기준

## AI-generated code

- [x] unnecessary file pattern
- [x] fake generic architecture
- [x] wrapper chain
- [x] duplicate helper
- [x] fake contract
- [x] premature completeness
- [x] comment spam
- [x] giant component
- [x] excessive any
- [x] silent behavior change

## Review / DoD

- [x] readability review questions
- [x] naming review checklist
- [x] structure review checklist
- [x] comment review checklist
- [x] contract safety checklist
- [x] test readability standard
- [x] code-quality Definition of Done

---

# 75. CP1 Exit Status

```text
CP1 — CODE QUALITY STANDARDS
STATUS: COMPLETE
```

결과:

```text
Human-readable code definition       LOCKED
Naming principles                    LOCKED
Function/component readability       LOCKED
Abstraction threshold                LOCKED
Comment-heavy policy                 LOCKED
Comment taxonomy                     LOCKED
Contract-gate comment format         LOCKED
AI anti-pattern rules                LOCKED
Review checklist                     LOCKED
Code-quality Definition of Done      LOCKED
```

CP1 이후 실제 구현은
“동작함”만으로 완료 처리하지 않는다.

**사람이 Repository를 읽고 이해할 수 있는 상태**
까지 구현 완료 조건에 포함한다.

---

# 76. Handoff to CP2

다음 Checkpoint:

```text
CP2 — FRONTEND ARCHITECTURE PLAN
```

CP2는 CP0의 Contract Boundary와
CP1의 Readability Standards를
실제 source tree와 dependency rule로 변환한다.

반드시 결정할 항목:

```text
src/app exact ownership
src/pages exact ownership
src/features exact ownership
src/integrations exact ownership
src/shared exact ownership
src/mocks exact ownership

feature internal structure
feature public API
barrel export policy
Page → Feature dependency
Feature → Integration dependency
Shared dependency rule
cross-feature dependency rule

query location
model location
mapper/adapter location
form ownership
route ownership
error boundary ownership
motion ownership
test colocation

import alias
dependency direction enforcement
circular dependency prevention
raw DTO containment
Mock → Real Adapter swap boundary
```

CP2에서 새 구조를 만들 때도
CP1-D13에 따라
과도한 파일/추상화를 만들지 않는다.

CP2의 목표는:

> **어떤 종류의 코드를 어디에 두어야 하는지
> 새 팀원이 고민하지 않아도 될 정도로
> 책임과 dependency direction을 명확하게 만드는 것**

이다.