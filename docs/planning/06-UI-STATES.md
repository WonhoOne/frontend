# Mister World Frontend UI State System

> Document: `06-UI-STATES.md`  
> Status: **CP5 Complete**  
> Scope: `WonhoOne/frontend` Customer GUI  
> Planning baseline: 2026-09-29  
> Depends on:
> - `00-PLANNING-INDEX.md`
> - `01-PRODUCT-EXPERIENCE.md`
> - `02-INFORMATION-ARCHITECTURE.md`
> - `03-VISUAL-DIRECTION.md`
> - `04-DESIGN-SYSTEM.md`
> - `05-MOTION-SYSTEM.md`

---

# 0. CP5 Objective

CP5의 목표는 API가 느리거나, 일부 데이터만 도착하거나, 이미지가 깨지거나,
세션이 만료되거나, 사용자가 같은 버튼을 두 번 누르는 상황에서도
Mister World가 **완성된 제품처럼 보이도록 상태 체계를 잠그는 것**이다.

정상 상태만 예쁘게 만들고 비정상 상태를 임시 spinner / alert로 처리하는 것을 금지한다.

이 문서가 결정하는 것:

- Screen / Component별 상태 종류
- Loading / Success / Empty / Error / Retrying
- Partial loading / partial failure
- Stale data
- Offline / connection issue
- Auth expired / unauthorized
- Image failure
- Mutation 처리 방식
- 중복 submit 방지
- Retry / recovery
- Skeleton mapping
- Not Found
- 상태별 copy direction
- 상태별 Motion 연결
- QA용 latency/error simulation 기준

---

# 1. State Model

모든 data-driven UI는 가능한 한 다음 상태 모델을 사용한다.

```text
Idle
Loading
Success
Empty
Error
Retrying
Refreshing
Stale
Offline
Unauthorized
```

모든 mutation은 가능한 한 다음 상태 모델을 사용한다.

```text
Idle
Submitting
Success
Failure
Retrying
```

이미지는 별도 상태를 가진다.

```text
Placeholder
Loading
Loaded
Failed
```

Voice는 CP4의 별도 상태 머신을 유지한다.

---

# 2. State Priority

동시에 여러 상태가 발생할 수 있으므로 우선순위를 둔다.

권장 우선순위:

```text
Unauthorized
> Fatal Error
> Offline
> Loading
> Empty
> Success
```

단, 기존 성공 데이터가 이미 있고 refresh만 실패한 경우:

```text
Success + Refresh Error
```

로 처리하고 전체 화면을 Error로 덮지 않는다.

---

# 3. Full-page vs Section-level State

## Full-page state 사용 조건

- 필수 page data가 전혀 없음
- route 자체가 invalid
- auth가 반드시 필요한 화면인데 인증 불가
- fatal contract/data error

## Section-level state 사용 조건

- 일부 API만 실패
- 일부 section만 늦음
- image만 실패
- recommendation / optional metadata 실패
- history popup fetch 실패

원칙:

> **가능하면 이미 성공한 화면을 유지한다.**

---

# 4. Loading Philosophy

## 4.1 Generic spinner 금지

전체 화면 가운데 spinner 하나만 표시하는 방식은 기본 금지.

허용 가능한 spinner:

- 작은 버튼 내부
- 작은 compact inline action
- loading indicator가 실제 layout을 대체하지 않는 경우

## 4.2 Skeleton-first

주요 content block은 실제 구조와 동일한 Skeleton 사용.

## 4.3 Minimum loading flash control

API가 너무 빨리 응답하면 Skeleton이 50ms 정도 깜빡이는 현상을 피한다.

권장:

```text
< 120ms
→ skeleton 미노출 가능

120–400ms
→ 즉시 skeleton

> 400ms
→ skeleton + progressive image / partial content
```

실제 값은 구현 환경에서 조정 가능.

---

# 5. Skeleton Mapping

## Home

Home은 대부분 static / curated content.

API-driven Theme content가 있다면:

```text
ThemeEditorialCard
↔ ThemeEditorialCardSkeleton
```

Hero는 이미지 placeholder + text skeleton.

---

## Tours

```text
TourCard
↔ TourCardSkeleton
```

4개 고정 슬롯을 유지해 layout shift 최소화.

---

## Tour Detail

```text
TourHero
↔ TourHeroSkeleton

IncludedService
↔ IncludedServiceSkeleton

StyleSelector
↔ StyleSelectorSkeleton

ScheduleSection
↔ ScheduleSkeleton

RecruitmentProgress
↔ RecruitmentSkeleton
```

Hero만 먼저 도착하고 schedule이 늦을 수 있으므로 section-level loading 허용.

---

## Configure

```text
OptionGroup
↔ OptionGroupSkeleton

OptionCard
↔ OptionCardSkeleton

TripSummary
↔ TripSummarySkeleton

Price
↔ PriceSkeleton
```

모든 section을 한 번에 가리는 것보다
도착 가능한 data부터 progressive render.

---

## Reservation Review

```text
ReservationSummary
↔ ReservationSummarySkeleton
ApplicantSummary
↔ ApplicantSummarySkeleton
PriceSummary
↔ PriceSummarySkeleton
```

---

## My Trips

```text
TripCard
↔ TripCardSkeleton
```

초기 viewport 기준 3~5개 skeleton.

---

# 6. Empty State System

Empty는 Error가 아니다.

## Empty types

### No Tours

이 프로젝트에서는 4개 Theme가 고정이므로 정상 상황에서는 사실상 발생하지 않아야 한다.

발생 시:

```text
현재 표시할 여행 상품이 없습니다.
잠시 후 다시 확인해주세요.
```

이 경우는 backend/config 문제일 가능성이 높으므로 error에 가까운 운영 상태로 본다.

### No Schedules

Tour Detail:

```text
현재 예약 가능한 일정이 없습니다.

새로운 일정이 준비되면 다시 확인해주세요.
```

CTA:

```text
다른 여행 보기
```

### No Travel History

```text
아직 여행 기록이 없습니다.

첫 번째 여행을 만들어보세요.

[ 여행 둘러보기 ]
```

### No Previous Trips after Login

History popup:

```text
Welcome to Mister World.

아직 지난 여행이 없습니다.

[ 여행 둘러보기 ]
```

---

# 7. Error Taxonomy

Error를 하나의 generic state로 처리하지 않는다.

## E1 — Network Error

예:

- timeout
- DNS
- fetch failure

Copy:

```text
여행 정보를 불러오지 못했습니다.
연결 상태를 확인하고 다시 시도해주세요.
```

Action:

```text
다시 시도
```

---

## E2 — Server Error

5xx.

Copy:

```text
잠시 문제가 발생했습니다.
잠시 후 다시 시도해주세요.
```

Technical detail은 기본적으로 숨긴다.

---

## E3 — Not Found

Tour / Reservation invalid ID.

Copy example:

```text
이 여행을 찾을 수 없습니다.
삭제되었거나 주소가 잘못되었을 수 있습니다.
```

Action:

```text
여행 둘러보기
```

---

## E4 — Validation Error

예:

- 선택 조합 불가
- 필수값 누락
- schedule expired

Inline으로 표시.

Toast만 띄우고 끝내지 않는다.

---

## E5 — Conflict

예:

- 방금 선택한 일정이 더 이상 예약 가능하지 않음
- 모집 상태 변경
- 가격/옵션 서버 재검증 실패

Copy:

```text
여행 정보가 변경되었습니다.
최신 내용을 확인해주세요.
```

Action:

```text
최신 정보 불러오기
```

---

# 8. Retry System

## Section Retry

실패한 section만 retry.

예:

```text
Schedule section failed
→ Schedule만 retry
```

Tour Hero / Style data는 유지.

## Retry motion

CP4 기준:

```text
Error
→ Retrying
→ section skeleton
→ Success/Error
```

전체 페이지 flash 금지.

## Retry lock

retry 중 버튼 반복 클릭 방지.

---

# 9. Refreshing State

기존 data가 있을 때 refetch:

```text
Success
+ background refresh
```

기본적으로 content 유지.

작은 indicator만 필요하면 표시.

예:

```text
My Trips
→ 기존 list 유지
→ refresh indicator
→ 새 data 반영
```

전체 skeleton으로 되돌리지 않는다.

---

# 10. Stale Data

오래된 data를 가지고 있는 경우:

```text
Success(stale)
```

로 화면을 유지하되
중요한 상태는 background refresh.

특히 중요:

- recruitment count
- schedule availability
- price
- reservation status

이 값은 stale 허용 시간을 길게 잡지 않는다.

정확한 caching 전략은 CP8.

---

# 11. Partial Failure

예:

Tour Detail에서:

```text
Tour 기본 정보 OK
Style OK
Schedule API FAIL
```

전체 page error 금지.

화면:

```text
Hero / story / style 유지
Schedule section만 error
```

예:

```text
일정을 불러오지 못했습니다.
[ 다시 시도 ]
```

---

# 12. Image Failure

여행 서비스에서 이미지 실패는 시각 품질에 치명적이므로 별도 처리.

## Hero image fail

대체:

- warm neutral background
- theme local accent
- title/metadata 유지
- broken image icon 금지

## Card image fail

대체:

```text
Theme-toned neutral image surface
+ subtle theme label
```

## Retry

이미지 자체 retry 가능하나
사용자에게 retry 버튼을 강요하지 않는다.

---

# 13. Offline State

오프라인 감지 시:

## Existing cached data 있음

화면 유지.

상단 또는 해당 영역에 subtle banner:

```text
오프라인 상태입니다.
표시된 정보가 최신이 아닐 수 있습니다.
```

## Cached data 없음

Full/section offline state:

```text
인터넷 연결이 필요합니다.
연결 후 다시 시도해주세요.
```

---

# 14. Unauthorized / Session Expired

## Protected page 접근

예:

`/my-trips`

로그인 필요 시:

```text
Auth Overlay
```

또는 direct route에서:

```text
로그인이 필요합니다.
```

## Session expired during transaction

절대 draft를 날리지 않는다.

Flow:

```text
Submit
→ 401
→ Auth required
→ Login
→ Draft recover
→ Review restore
```

사용자가 다시 확인 후 submit.

자동으로 submit 재실행하지 않는다.

---

# 15. Mutation Philosophy

## Pessimistic by default

예약/비즈니스 중요 상태:

- Reservation submit
- schedule selection validation
- final configuration server validation

은 server confirmation 후 성공 UI.

## Optimistic allowed

가벼운 local UI:

- Style local select
- Hotel/Meal UI selection
- local draft state

단, 최종 backend validation에서 rollback 가능해야 함.

---

# 16. Duplicate Submit Prevention

Reservation Submit:

1. click
2. button `Submitting`
3. input/submit controls lock
4. 같은 request 중복 발생 금지
5. result 처리
6. 실패 시 다시 활성화

가능하면 request idempotency는 backend 계약과 협의.

Frontend 단에서는 최소:

```text
isSubmitting guard
```

필수.

---

# 17. Submit State Copy

## Idle

```text
여행 신청하기
```

## Submitting

```text
신청하는 중…
```

## Success

```text
신청 완료
```

## Failure

버튼 자체는 원래 label 복귀.

근처에 명확한 error message:

```text
여행 신청에 실패했습니다.
내용을 확인하고 다시 시도해주세요.
```

---

# 18. Reservation Conflict Recovery

Reservation Review와 Submit 사이에:

- 일정 마감
- 모집 변경
- 옵션 불가
- 가격 변경

가능.

이 경우:

```text
Submit
→ server conflict
→ review page 유지
→ 변경 항목 강조
→ 최신 data 표시
→ 사용자 재확인
```

자동으로 새 가격에 동의시키지 않는다.

---

# 19. Price State

가격은 현재 contract상 TBD 부분이 있으므로 UI state만 정의.

## Known

숫자 표시.

## Loading

Price Skeleton.

## Recalculating

기존 값 유지 + small updating indicator 가능.

## Error

```text
가격을 계산하지 못했습니다.
```

CTA submit은 가격이 필수라면 disabled.

정확한 정책은 backend contract에 따름.

---

# 20. Recruitment State

## Loading

```text
RecruitmentSkeleton
```

## Success — General

```text
2 / 3 travellers
```

## Success — Honeymoon

```text
1 / 2 couples
```

## Confirmed

Backend state 기반.

## Refreshing

기존 count 유지 + subtle refresh.

## Conflict/change

count가 달라졌으면
CP4 progress motion으로 최신 값 반영.

---

# 21. Schedule State

## Loading

Schedule Skeleton.

## Success

available schedules.

## Empty

예약 가능한 일정 없음.

## Expired

사용자가 선택한 일정이 만료:

```text
선택한 일정은 더 이상 예약할 수 없습니다.
다른 일정을 선택해주세요.
```

Configuration draft의 다른 선택은 가능한 한 유지.

---

# 22. Configure State Matrix

각 option group:

```text
Loading
Ready
Selected
Disabled
Invalid
Refreshing
Error
```

## Disabled

사용자가 선택할 수 없는 이유를
가능한 한 가까운 곳에 설명.

## Invalid after backend validation

예:

```text
이 식사 옵션은 현재 선택한 일정에서 제공되지 않습니다.
```

Option을 자동으로 다른 값으로 바꾸지 않는다.

---

# 23. Draft State

Configuration Draft:

```text
Clean
Modified
Saving(optional future)
Restored
DiscardRequested
```

현재 backend draft 저장 계약은 없음.

Frontend local/session persistence는 CP8에서 결정.

---

# 24. Home State

Home은 static-heavy.

필수 API가 없다면 loading state 최소화.

동적 Theme data를 사용한다면:

```text
Initial Loading
Success
Partial Image Failure
Fatal Theme Load Failure
```

Hero 이미지 실패가 전체 Home 실패가 되지 않는다.

---

# 25. Tours Page State

## Loading

4개 card skeleton.

## Success

4 Theme.

## Partial Image Failure

fallback surface.

## Fatal data mismatch

필수 Theme가 누락되면
운영상 문제로 취급 가능.

UI는 가급적 표시 가능한 Theme는 유지.

---

# 26. Tour Detail State

상태는 section 분리.

```text
Hero
Story
Services
Styles
Schedules
Recruitment
```

각 section은 독립 Loading/Error 가능.

단, `Tour core` 자체가 없으면 Full-page Not Found/Error.

---

# 27. Reservation Review State

Review는 draft가 핵심.

## Missing draft

```text
검토할 여행 정보가 없습니다.
[ 여행 둘러보기 ]
```

## Loading validation

Review 내용은 유지하고 validation indicator.

## Validation error

해당 section near error.

## Auth required

Auth overlay.

---

# 28. Reservation Success State

Success route는 가능한 한 server-driven 복구.

## Loading

Reservation confirmation skeleton.

## Success

confirmation + recruitment.

## Not found

```text
예약 정보를 찾을 수 없습니다.
```

## Fetch error

retry.

이미 신청 완료된 사실을 알 수 없는 경우
“다시 신청” CTA를 바로 제공하지 않는다.
중복 예약 위험 때문.

---

# 29. Reservation Detail State

```text
Loading
Success
Not Found
Error
Refreshing
Unauthorized
```

취소 기능은 scope 밖.

---

# 30. Login State

```text
Idle
Submitting
InvalidCredentials
NetworkError
ServerError
Success
```

Invalid Credentials copy:

```text
이메일 또는 비밀번호를 확인해주세요.
```

실제 로그인 credential 필드는 auth contract 확정 전 임의 확정 금지.

---

# 31. Signup State

```text
Idle
FieldInvalid
Submitting
Conflict
Success
NetworkError
```

원본 요구상 고객 정보에 최소:

- 성명
- 주소
- 연락처

포함.

추가 field는 contract 의존.

---

# 32. Previous Travel History Popup State

로그인 후 popup:

```text
Loading
Success
Empty
Error
Closed
```

Error가 로그인 성공을 무효화하지 않는다.

Error copy:

```text
지난 여행을 불러오지 못했습니다.
[ 다시 시도 ]
```

Close 허용.

---

# 33. My Trips State

## Loading

Trip skeleton 3~5개.

## Success

recent first.

## Empty

첫 여행 CTA.

## Error

section/page retry.

## Unauthorized

Auth.

## Refreshing

기존 list 유지.

---

# 34. Not Found System

## 404 route

Mister World 스타일의 calm page.

```text
길을 조금 벗어난 것 같아요.

찾으시는 페이지가 없습니다.

[ 여행 둘러보기 ]
[ 홈으로 ]
```

과도한 일러스트 / 농담 금지.

---

# 35. Unknown Error

예상하지 못한 frontend exception.

Global Error Boundary 필요.

UI:

```text
문제가 발생했습니다.

페이지를 새로고침하거나 홈으로 이동해주세요.

[ 다시 시도 ]
[ 홈으로 ]
```

Development에서는 error detail logging.

Production에서는 technical stack 노출 금지.

---

# 36. Error Boundary Levels

## App-level

전체 render failure.

## Route-level

특정 route failure.

## Section-level

optional data / image / widget.

가능한 한 가장 작은 boundary에서 회복.

---

# 37. Data Freshness Priority

Freshness가 특히 중요한 data:

1. Schedule availability
2. Recruitment status
3. Reservation status
4. Price
5. Option availability

상대적으로 덜 중요한 data:

- editorial copy
- hero description
- included service narrative

---

# 38. Status Copy Tone

Mister World copy는 차분하고 명확하게.

## Good

```text
일정을 불러오지 못했습니다.
다시 시도해주세요.
```

## Bad

```text
Oops!
Something went wrong 😭
```

또는

```text
치명적인 오류가 발생했습니다.
```

사용자에게 기술적 공포를 주지 않는다.

---

# 39. Toast Policy

Toast로 처리해도 되는 것:

- 작은 confirmation
- non-blocking action
- retry success

Toast로 처리하면 안 되는 것:

- field validation
- reservation submit failure
- schedule conflict
- auth failure
- critical offline state

---

# 40. Latency Simulation Standard

QA/개발 중 최소 다음 latency를 시뮬레이션.

```text
Fast       100ms
Normal     400ms
Slow       1200ms
Very Slow  3000ms
```

각 주요 화면은 최소:

- 400ms
- 1200ms
- 3000ms

상황에서 검증.

---

# 41. Failure Simulation Standard

개발/QA에서 최소:

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
```

검증.

---

# 42. State + Motion Mapping

| State change | Motion |
|---|---|
| Loading → Success | 120–200ms crossfade |
| Error → Retrying | local skeleton |
| Retry → Success | content fade/replace |
| Success → Refreshing | content 유지 |
| Recruitment update | CP4 progress motion |
| Price recalculation | previous → next value |
| Submit Idle → Loading | button label transition |
| Submit Success | success sequence |
| Image preview → full | blur/opacity reveal |
| Unauthorized → Login | modal/page transition |

---

# 43. State Ownership

## Query/data layer owns

- loading
- error
- stale
- refreshing
- retry
- cache freshness

## Domain state owns

- selected style
- selected schedule
- configuration draft
- recruitment state interpretation
- reservation state

## Component owns

- hover
- focus
- pressed
- local open/close

## Page owns

- full-page empty/error
- section composition
- state prioritization

---

# 44. UI State Naming Guidance

권장:

```text
isLoading
isRefreshing
isRetrying
isSubmitting
isStale
isOffline
error
data
```

피해야 할 것:

```text
loading1
loading2
errorFlag
status2
```

복잡한 domain 상태는 string union / enum으로 명시.

---

# 45. State Debugging Surface

개발 환경에서 상태 QA를 쉽게 하기 위해
Storybook 또는 dev-only state switcher를 권장.

예:

```text
TourCard
- Loading
- Success
- ImageFail
- Error

RecruitmentProgress
- 0/3
- 1/3
- 2/3
- Confirmed
```

실제 도입 여부는 구현 단계에서 결정.

---

# 46. UI State Anti-Patterns

## AP-S01 — Spinner page

전체 화면 중앙 spinner 하나.

## AP-S02 — Flash loading

100ms 응답에도 skeleton이 깜빡임.

## AP-S03 — Error wipes success

작은 section refresh 실패로 전체 성공 화면 제거.

## AP-S04 — Toast-only error

중요 오류를 toast 하나로 끝냄.

## AP-S05 — Duplicate submit

버튼 여러 번 눌러 request 중복.

## AP-S06 — Hidden conflict

schedule/price가 바뀌었는데 사용자에게 알리지 않음.

## AP-S07 — Broken image icon

브라우저 기본 broken image 표시.

## AP-S08 — Empty = blank

데이터 없음이 흰 화면.

## AP-S09 — Session expiry destroys draft

로그인 다시 하라고 보내면서 configuration 초기화.

## AP-S10 — Skeleton mismatch

로딩 상태와 실제 UI 높이/구조가 크게 다름.

---

# 47. CP5 Decision Log

## D-501 — Skeleton-first loading fixed

Full-page generic spinner는 기본 금지.

## D-502 — Section-level state preferred

성공한 content는 가능한 한 유지.

## D-503 — Empty is not Error

No schedule / No history 등 별도 설계.

## D-504 — Error taxonomy fixed

Network / Server / Not Found / Validation / Conflict.

## D-505 — Refresh keeps existing data

refetch 시 skeleton reset 금지.

## D-506 — Reservation submit is pessimistic

server success 이후 success UI.

## D-507 — Duplicate submit prevention mandatory

Submitting lock 필수.

## D-508 — Conflict requires explicit reconfirmation

가격/일정 변경을 자동 동의 처리하지 않는다.

## D-509 — Session expiration preserves draft

Auth interruption 후 configuration 복구.

## D-510 — Image failure has branded fallback

broken image icon 금지.

## D-511 — Recruitment is freshness-sensitive

count/status background refresh 우선.

## D-512 — QA latency/failure simulation required

Slow API와 partial failure를 실제로 검증한다.

---

# 48. CP5 Acceptance Checklist

## Global

- [x] Query state model
- [x] Mutation state model
- [x] Image state model
- [x] state priority
- [x] full-page vs section-level rule
- [x] loading philosophy
- [x] skeleton mapping

## Recovery

- [x] network error
- [x] server error
- [x] not found
- [x] validation
- [x] conflict
- [x] retry
- [x] refreshing
- [x] stale data
- [x] partial failure
- [x] offline
- [x] unauthorized/session expired

## Mutation

- [x] pessimistic reservation submit
- [x] optimistic local selection
- [x] duplicate submit prevention
- [x] conflict recovery
- [x] price recalculation states

## Screens

- [x] Home
- [x] Tours
- [x] Tour Detail
- [x] Configure
- [x] Reservation Review
- [x] Reservation Success
- [x] Reservation Detail
- [x] Login
- [x] Signup
- [x] Previous Travel Popup
- [x] My Trips
- [x] Not Found
- [x] Global Error

## QA

- [x] latency simulation
- [x] failure simulation
- [x] state+motion mapping
- [x] state ownership
- [x] anti-patterns

**CP5 Status: COMPLETE**

---

# 49. Next Checkpoint

## CP6 — Screen Specifications

다음 단계는 전체 기획에서 가장 큰 체크포인트다.

예정 산출물:

```text
07-SCREEN-SPECS.md
```

또는 실제 구현 편의를 위해:

```text
screens/
├── home.md
├── tours.md
├── tour-detail.md
├── configure.md
├── reservation-review.md
├── reservation-success.md
├── reservation-detail.md
├── login.md
├── signup.md
├── previous-trips-popup.md
└── my-trips.md
```

CP6에서 각 화면마다 확정할 것:

- 화면 목적
- entry condition
- exact section order
- desktop layout
- mobile layout
- component composition
- 표시 data
- interactions
- CTA priority
- loading
- empty
- error
- retry
- motion
- responsive
- accessibility
- API dependency
- edge case
- acceptance criteria

CP0~CP5가 “규칙”을 만들었다면,
CP6는 그 규칙을 **실제 화면 1장씩 구현 가능한 명세**로 바꾸는 단계다.
