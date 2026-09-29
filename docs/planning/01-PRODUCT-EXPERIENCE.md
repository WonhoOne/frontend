# Mister World Frontend Product Experience

> Document: `01-PRODUCT-EXPERIENCE.md`  
> Status: CP0 Complete  
> Scope: Customer GUI  
> Product stage: Pre-implementation planning

---

## 1. Product Experience Statement

Mister World Frontend는 “여행상품 목록을 보여주는 관리형 웹페이지”가 아니라,
고객이 **여행의 분위기를 발견하고, 자신에게 맞게 구성하고, 출발이 완성되는 과정을 체감하는 고급 Theme Travel Experience**를 목표로 한다.

핵심 경험은 다음 문장으로 요약한다.

> **Discover a moment → Choose a style → Make it yours → Join the departure**

기능적으로는 Theme Tour 선택, Tour Style 선택, 세부 옵션 변경, 여행 신청이라는 비교적 단순한 흐름이지만,
Frontend는 이를 고급 여행 브랜드 수준의 시각적 경험으로 재구성한다.

---

## 2. Experience Goals

### G1. 테마를 먼저 느끼게 한다

Mister World는 범용 OTA가 아니다.

고객에게 수천 개 상품을 검색시키는 대신,
4개의 명확한 Theme Tour를 감성적으로 발견하게 한다.

따라서 Home의 우선순위는:

```text
Search / Filter
<
Theme Discovery
```

이다.

### G2. Style과 Configuration의 차이를 자연스럽게 이해시킨다

고객은 먼저 Classic / Grand / Premium 중 허용된 Style을 선택하지만,
그 Style은 최종 선택을 잠그지 않는다.

사용자는 이후 Hotel / Transport / Meal을 변경할 수 있다.

Frontend는 이 차이를 설명문이 아니라 UX 구조로 보여준다.

```text
Theme
→ Style
→ Customize
→ Final Configuration
```

### G3. “모이면 떠난다”를 여행 경험 일부로 만든다

일정 확정은 Backend 내부 상태로 숨기지 않는다.

Honeymoon:

```text
Couple 01  Joined
Couple 02  Waiting

1 / 2 Couples
```

Other Tours:

```text
● ● ○
2 / 3 Travellers
```

처럼 사용자가 현재 departure 상태를 이해할 수 있도록 시각화한다.

### G4. 기다림도 완성된 화면처럼 보이게 한다

네트워크가 느리거나 데이터가 없는 순간도 제품 경험이다.

따라서 다음을 금지한다.

- 빈 흰 화면
- 중앙 spinner 하나만 표시
- layout이 로딩 완료 후 크게 튀는 구조
- 오류 시 전체 화면 붕괴

대신 actual content geometry를 반영한 Skeleton,
progressive image loading,
localized error/retry를 사용한다.

### G5. Motion은 정보 구조를 설명한다

Motion은 화려함만을 위한 장식이 아니다.

예:

- Home Theme Card → Tour Hero: 같은 여행으로 이동했다는 연속성
- Style 선택 → Summary 변경: 선택 결과 표현
- Option 변경 → Price / Configuration update: 데이터 변화 표현
- 모집 인원 충족 → Confirmed: 상태 변화 표현
- Reservation Success: 작업 완료 표현

---

## 3. Experience Personality

### Brand personality

- Refined
- Cinematic
- Warm
- Confident
- Spacious
- Contemporary

피해야 할 인상:

- Bootstrap 과제 UI
- 항공권 검색 포털
- 관리자 페이지
- 과도한 glassmorphism
- 과도한 gradient
- 게임 UI
- 모든 요소가 동시에 움직이는 motion-heavy UI

### Visual concept

**Cinematic Travel × Luxury Editorial × Modern Product UI**

역할을 나누면:

- Home: Luxury editorial / campaign
- Tour Detail: Storytelling + commerce
- Configuration: Premium product configurator
- Reservation: Focused transactional UI
- My Trips: Calm personal travel archive

---

## 4. Primary Customer Journey

### Stage A — Discover

사용자는 Home에서 4개 Theme Tour를 발견한다.

목표:

- 여행 테마를 빠르게 이해
- 감정적으로 끌리는 테마 선택
- 검색 조건 입력 없이 탐색 시작

핵심 요소:

- Cinematic Hero
- 4 Theme editorial cards
- High-quality imagery
- subtle scroll motion

### Stage B — Understand

Tour Detail에서 선택한 여행의 특성을 이해한다.

고객이 파악해야 하는 것:

- 어떤 Theme Tour인가
- 어떤 서비스가 포함되는가
- 선택 가능한 Tour Style은 무엇인가
- 어떤 일정에 참여할 수 있는가
- 현재 모집 상태는 어떠한가

### Stage C — Choose Style

사용자는 허용된 Style을 선택한다.

Honeymoon / Parents:

- Grand
- Premium

Golf / Trekking:

- Classic
- Grand
- Premium

선택 상태는 카드 border 하나로만 표시하지 않는다.

- background transition
- typography emphasis
- supporting information
- summary update

를 함께 사용한다.

### Stage D — Customize

고객이 선택한 Style을 시작점으로 삼아 최종 여행을 만든다.

기본 category:

- Hotel
- Transport
- Meal
- Extra options when contract allows

Desktop에서는 좌측 configuration / 우측 sticky summary 구조를 우선 검토한다.

Summary는 옵션 변경 시 즉시 반영된다.

### Stage E — Review

Reservation Review는 새로운 옵션을 더 고르게 하는 화면이 아니다.

목적은 최종 확인이다.

표시:

- Theme
- Schedule
- Selected Style
- Final Configuration
- Applicant information when contract supports the required fields
- Recruitment / party context only when the shared contract exposes it
- Price when contract supports it

### Stage F — Apply

고객은 여행을 신청한다.

Button state:

```text
Idle
→ Submitting
→ Success
```

중복 제출 방지와 실패 복구 UX를 설계한다.

### Stage G — See Departure Progress

신청 완료 화면에서는 단순히 `완료되었습니다`로 끝내지 않는다.

사용자가 알고 싶은 것은:

> “그래서 이 여행은 실제로 떠나는 건가?”

따라서 모집 상태를 함께 보여준다.

Honeymoon example:

```text
Couple 01   YOU ✓
Couple 02   Waiting

1 / 2 couples
```

Other Tours example:

```text
2 / 3 travellers
One more traveller to confirm this departure.
```

### Stage H — Return

로그인 고객은 My Trips에서 **과거 Travel History**를 최근 순으로 확인한다.

현재 계약에서 최소로 보장하는 history 정보는:

- 상품
- 기간
- Tour Style
- 가격

이다.

현재 신청의 모집/확정 상태는 `Reservation Detail`에서 확인한다.
`Upcoming / Past` 또는 `Recruiting / Confirmed / Completed` 같은 My Trips taxonomy는
Reservation status/list 계약이 생기기 전까지 Frontend가 만들지 않는다.

---

## 5. Login & Returning Customer Experience

원본 요구사항에는 고객 로그인 후 이전 여행 목록 노출이 포함되어 있다.

Frontend에서는 로그인 성공 직후
전체 여행 이력을 강제로 별도 페이지로 이동시키기보다,
**이전 여행 목록**을 overlay/modal로 보여주고 My Trips로 연결한다.

예:

```text
Welcome back.

Your previous trips

Outdoor Trekking
2026.08.10 — 08.12
Grand
₩...

Golf Challenge
...

[ View all trips ] [ Close ]
```

Desktop은 large dialog, Mobile은 full-height/near-fullscreen sheet를 사용한다.
거래 흐름 중 인증된 경우의 popup timing은 별도 Frontend Proposal이며 공통 계약 감사 대상이다.

---

## 6. Voice Experience Boundary

Voice는 별도 여행 서비스가 아니다.

Frontend 관점에서 Voice의 역할은 현재 GUI를 보조하는 것이다.

예상 interaction:

```text
User speech
→ STT / command interpretation (ai-console)
→ frontend-readable command/result
→ existing GUI state update
→ Backend validation when required
```

예:

```text
“프리미엄으로 바꿔줘”
→ Style selector state update

“호텔을 5성급으로 바꿔줘”
→ Hotel option update
```

중요:

- GUI로 항상 같은 작업을 수행할 수 있어야 한다.
- Frontend가 STT 엔진을 구현하지 않는다.
- Frontend가 Voice Business Rule의 최종 판정자가 되지 않는다.
- 정확한 command schema는 TBD다.

---

## 7. Loading Experience Principles

### Structural Skeleton

Skeleton은 실제 컴포넌트와 같은 geometry를 가진다.

예상 pair:

```text
TourCard
TourCardSkeleton

TourHero
TourHeroSkeleton

StyleSelector
StyleSelectorSkeleton

ConfigurationSummary
ConfigurationSummarySkeleton

TripCard
TripCardSkeleton
```

### Image loading

고해상도 여행 이미지는 다음 progressive strategy를 우선 검토한다.

```text
placeholder
→ blurred/low-detail preview
→ final image
```

목표:

- layout shift 최소화
- sudden image pop 방지
- cinematic experience 유지

### Partial loading

한 API가 느리다고 이미 준비된 모든 화면을 가리지 않는다.

가능한 경우 section-level loading을 사용한다.

---

## 8. Empty / Error Philosophy

### Empty

Empty state는 실패가 아니다.

예:

```text
아직 여행 기록이 없습니다.

첫 번째 여행을 만들어보세요.

[ 여행 둘러보기 ]
```

### Error

Error는 사용자가 회복할 수 있게 한다.

```text
여행 정보를 불러오지 못했습니다.

[ 다시 시도 ]
```

가능하면 기존 layout context를 유지하고 해당 section만 retry한다.

---

## 9. Motion Experience Principles

### Motion hierarchy

모든 interaction에 동일한 크기의 animation을 주지 않는다.

- Micro feedback: 짧게
- Selection: 명확하게
- Section reveal: 부드럽게
- Route / Hero transition: 제한적으로 cinematic하게

### Signature moments

프로젝트를 기억하게 할 핵심 Motion 후보:

1. Home Theme Card → Tour Detail Hero shared transition
2. Tour Style selection background transition
3. Configuration Summary live transition
4. Price rolling / value transition
5. Recruitment progress fill
6. Departure Confirmed transition
7. Reservation Success confirmation
8. Voice listening → recognized result transition

세부 token과 easing은 CP4에서 정의한다.

---

## 10. Frontend In Scope

- Customer-facing pages
- Navigation
- Auth UI
- Theme Tour browsing
- Tour detail
- Tour style selection
- Schedule/departure display
- Customization UI
- Reservation review / submit
- Reservation success
- My Trips
- Trip detail
- Loading / Empty / Error / Retry
- Motion
- Responsive UI
- Accessibility
- API integration
- Voice UI integration shell
- Frontend tests

---

## 11. Out of Scope

다음은 Frontend가 구현하거나 임의 결정하지 않는다.

- Employee tour management
- Employee inventory management
- Backend business-rule authority
- DB
- Payment
- Refund
- Real hotel / airline booking
- Social login unless scope changes
- Open-ended conversational AI recommendation
- SMS provider implementation
- Price formula
- Loyalty threshold / discount formula
- Inventory deduction policy
- Voice STT engine

---

## 12. Known Contract Dependencies

### API DTO

아직 v0.2 필요.

Frontend Planning은 화면 data need만 정의하고 DTO를 공통 계약으로 임의 확정하지 않는다.

### Authentication

방법 미확정.

### Price

UI surface는 필요하지만 계산 rule 미확정.

### Option Catalog

실제 Hotel / Transport / Meal 데이터 미확정.

### Reservation Status

정확한 enum 미확정.

### Voice Schema

미확정.

### Notification

여행 확정 후 고객에게 알림이 필요하나 실제 mechanism은 공유 계약에서 추가 확정 필요.

---

## 13. Experience Acceptance for CP0

CP0 기준으로 앞으로의 디자인은 다음 질문에 모두 YES여야 한다.

- 이 화면이 고객용 Frontend 책임 안에 있는가?
- Shared Contract를 새로 만들어내지 않는가?
- Theme → Style → Configuration 관계를 유지하는가?
- Honeymoon 모집을 couple/team 의미로 표현하는가?
- 기타 Tour 모집을 participant 기준으로 표현하는가?
- Loading을 실제 UI의 일부로 고려하는가?
- Empty / Error 상태를 고려하는가?
- Motion이 목적을 갖는가?
- Voice 없이도 모든 핵심 작업이 가능한가?
- Backend가 Business Rule의 최종 권한인가?

---

## 14. CP0 Decision Log

### D-001 — Experience direction

Approved direction:

**Cinematic Travel × Luxury Editorial × Modern Product UI**

### D-002 — Search is not the primary Home experience

4개의 고정 Theme Tour를 탐색하는 구조를 우선한다.

### D-003 — Style and Configuration are separate UX concepts

Style은 starting configuration이며 최종 configuration이 아니다.

### D-004 — Honeymoon recruitment semantics

Frontend 표현:

**2 couples / 2 teams required**

### D-005 — Other tour recruitment semantics

Frontend 표현:

**3 participants required**

### D-006 — Motion planned from the beginning

Motion은 구현 후 polish로 덧붙이지 않는다.

### D-007 — Loading planned with component design

Skeleton / Empty / Error state를 component spec과 함께 설계한다.

---

**CP0 Status: COMPLETE**

Next: **CP1 — Information Architecture & End-to-End User Flow**
