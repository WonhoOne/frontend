# Mister World Frontend Planning Index

> Status: **FRONTEND PLANNING COMPLETE — CP0 through CP11 finalized; ready for implementation**  
> Scope: Customer-facing Frontend (`WonhoOne/frontend`)  
> Planning baseline: 2026-09-29  
> Owner: Frontend / 김태우  
> Shared contract source: `WonhoOne/docs`

---

## 1. Purpose

이 문서는 Mister World 고객용 프론트엔드 기획 패키지의 진입점이다.

목표는 단순히 화면 목록을 만드는 것이 아니라, 다른 개발자 또는 AI Agent가 이 기획 문서 묶음을 순서대로 읽고 다음을 일관되게 구현할 수 있도록 하는 것이다.

- 고객용 여행 탐색 경험
- Theme Tour 상세 경험
- Tour Style 선택
- Hotel / Transport / Meal / Extra 옵션 커스터마이징
- 여행 일정 및 모집 상태 표현
- 여행 신청
- 로그인 / 회원가입
- 과거 여행 이력
- 제한 명령 기반 Voice UI의 프론트 연동 지점
- 고급 모션
- 데이터 Loading / Empty / Error / Retry 상태
- Responsive / Accessibility
- Backend API 연동

프론트 기획은 공통 Business Rule, Domain, API Contract를 새로 정의하는 문서가 아니다.
공통 계약은 `WonhoOne/docs`가 SSOT이며, 프론트 문서는 이를 사용자 경험과 화면 구조로 번역한다.

---

## 2. Source of Truth Order

구현 및 기획 판단의 우선순위는 다음과 같다.

1. 팀이 명시적으로 확정한 최신 의사결정
2. 원본 소프트웨어공학 프로젝트 요구사항
3. `WonhoOne/docs/requirements/business-rules.md`
4. `WonhoOne/docs/requirements/requirements.md`
5. `WonhoOne/docs/requirements/domain-model.md`
6. `WonhoOne/docs/api/api-spec-draft.md`
7. Frontend Planning 문서
8. 구현 세부사항

프론트 기획에서 Shared Contract와 충돌을 발견한 경우 임의로 구현하지 않는다.

```text
Conflict 발견
→ planning 문서에서 BLOCKER/TBD 표시
→ docs 변경 제안
→ 공통 계약 확정
→ frontend 반영
```

---

## 3. Confirmed Product Scope

### Customer-facing frontend

프론트가 구현하는 고객 기능:

- 회원가입
- 로그인
- Theme Tour 탐색
- Theme Tour 상세 조회
- Tour Style 선택
- Hotel / Transport / Meal 세부 옵션 변경
- 추가 옵션 선택
- 여행 일정 조회 및 모집 상태 확인
- 최종 Tour Configuration 확인
- 여행 신청
- 신청 결과 확인
- 로그인 고객의 과거 여행 이력 조회
- 여행 상세 확인
- 정의된 Voice 기능을 받을 UI integration point

### Theme Tours

고객에게 노출되는 기본 Theme Tour는 4종이다.

- Honeymoon Romance
- Parents Healing
- Golf Challenge
- Outdoor Trekking

### Tour Styles

기본 Tour Style:

- Classic
- Grand
- Premium

제약:

- Honeymoon Romance: Grand / Premium
- Parents Healing: Grand / Premium
- Golf Challenge: Classic / Grand / Premium
- Outdoor Trekking: Classic / Grand / Premium

### Customization

Tour Style은 최종 여행 구성 자체가 아니다.

고객은 Style 선택 후에도 최소 다음을 변경할 수 있다.

- Hotel
- Transport
- Meal

추가 옵션은 공통 계약에서 허용되는 범위만 표시한다.

---

## 4. Confirmed Departure Rules for Frontend Planning

### Honeymoon Romance

- 출발 확정 기준: **2팀 이상**
- 한 팀은 커플 단위로 표현한다.
- Frontend primary wording은 `people`보다 `couple/team`을 사용한다.
- 예: `1 / 2 couples joined`
- Backend 검증이 최종 권한이다.

### Other Theme Tours

Parents Healing / Golf Challenge / Outdoor Trekking:

- 출발 확정 기준: **총 신청 인원 3명 이상**
- Frontend는 `travellers` 또는 `participants` 기준 progress를 표시한다.

### Contract note

현재 `business-rules.md`의 Honeymoon 규칙은 `총 신청 인원 4명 이상`으로 기술되어 있다.
프론트 UX 기획에서는 팀이 확정한 의미인 `2 couples / 2 teams`를 사용한다.

이는 숫자상 동일할 수 있으나 Domain 의미가 다르므로,
공통 문서에서는 향후 `2 teams` 의미를 명시하는 것이 바람직하다.

---

## 5. Frontend Responsibility Boundary

`WonhoOne/frontend` 책임:

- React + TypeScript Customer GUI
- UX / Visual implementation
- Frontend state management
- Backend API consumption
- 사용자 입력 validation
- Loading / Empty / Error / Retry UX
- Responsive implementation
- Accessibility
- Frontend automated tests
- Voice 결과가 반영될 UI state / interface

프론트가 소유하지 않는 것:

- Spring Boot Backend
- MySQL schema / persistence
- Business Rule의 최종 판정
- Employee Console
- Speech-to-Text 엔진
- 자유대화형 AI
- 문자 발송 인프라
- 실제 호텔/항공 예약 연동
- 결제
- 환불

---

## 6. Planned Customer Routes

CP1에서 확정된 고객 route baseline이며, 이후 Screen Spec과 동일하게 유지한다.

```text
/
├── /tours
├── /tours/:tourId
├── /tours/:tourId/configure
├── /reservation/review
├── /reservation/:reservationId/success
├── /login
├── /signup
├── /my-trips
└── /reservations/:reservationId
```

Voice는 독립 여행 플로우가 아니라 기존 고객 GUI를 조작하는 보조 interaction으로 취급한다.

---

## 7. Planning Documents

### CP0 — Scope & Contract
- `00-PLANNING-INDEX.md`
- `01-PRODUCT-EXPERIENCE.md`

### CP1 — Information Architecture
- `02-INFORMATION-ARCHITECTURE.md`

### CP2 — Visual Direction
- `03-VISUAL-DIRECTION.md`

### CP3 — Design System
- `04-DESIGN-SYSTEM.md`

### CP4 — Motion System
- `05-MOTION-SYSTEM.md`

### CP5 — UI State System
- `06-UI-STATES.md`

### CP6 — Screen Specifications
- `07-SCREEN-SPECS.md`
- 필요 시 `screens/*.md`로 분할

### CP7 — Component Architecture
- `08-COMPONENT-ARCHITECTURE.md`

### CP8 — Data & API UX
- `09-DATA-AND-API-UX.md`

### CP9 — Responsive & Accessibility
- `10-RESPONSIVE-ACCESSIBILITY.md`

### CP10 — QA
- `11-QA-ACCEPTANCE.md`

### CP11 — Implementation Handoff
- `12-IMPLEMENTATION-HANDOFF.md`

---

## 8. Global UX Principles

향후 모든 화면은 다음 원칙을 공유한다.

### 8.1 Premium visual quality

목표 인상:

**Cinematic Travel × Luxury Editorial × Modern Product UI**

학교 과제형 Bootstrap UI를 피하고 실제 여행 브랜드 서비스 수준을 목표로 한다.

### 8.2 Motion with purpose

모션은 장식이 아니라 다음을 표현한다.

- 화면 간 공간 연속성
- 사용자 선택 결과
- 데이터 변경
- 모집 진행
- 요청 성공/실패
- 상태 전환

### 8.3 No generic full-page spinner

데이터 Loading은 실제 콘텐츠 구조를 보존하는 Skeleton을 기본으로 한다.

모든 주요 data-driven component는 최소 다음 상태를 설계한다.

```text
Loading
Success
Empty
Error
Retrying
```

Mutation UI는 최소 다음 상태를 설계한다.

```text
Idle
Submitting
Success
Failure
```

### 8.4 Business rules remain visible

중요한 Business Rule을 숨겨진 validation으로만 처리하지 않는다.

예:

- 허니문 모집: `1 / 2 couples`
- 일반 투어 모집: `2 / 3 travellers`
- Honeymoon / Parents에서는 Classic 미노출 또는 명확한 비선택 상태
- Style 선택 후 세부 옵션 변경 가능성을 UI 구조 자체로 전달

### 8.5 Progressive enhancement

Voice Recognition이 실패하거나 사용할 수 없어도 모든 고객 핵심 기능을 GUI로 수행할 수 있어야 한다.

---

## 9. CP0 Blocking Items

다음 항목은 이후 단계에서 임의 확정하면 안 된다.

### BLOCKER-A — API DTO

현재 API v0.1은 endpoint skeleton만 존재한다.

확정되지 않은 항목:

- Tour response DTO
- TourSchedule response DTO
- Reservation request / response DTO
- Travel History DTO
- Error response contract

Frontend는 mock을 사용할 수 있으나 향후 승인 API Contract와 교체 가능하게 구성해야 한다.

### BLOCKER-B — Authentication

미확정:

- 인증 방식
- token/session 형태
- 로그인 유지 방식
- 보호 route 방식

CP1에서는 화면 흐름만 설계하고 인증 구현 세부사항은 계약 확정 전까지 TBD로 유지한다.

### BLOCKER-C — Price

가격 공식과 할인 규칙이 미확정이다.

따라서 기획 시 가격 UI는 설계할 수 있지만,
계산 알고리즘을 Frontend Business Rule로 확정하지 않는다.

### BLOCKER-D — Actual options

Hotel / Transport / Meal의 실제 option catalog가 미확정이다.

기획 예시는 visual prototype 용이며 공통 계약으로 간주하지 않는다.

### BLOCKER-E — Voice command detail

Voice command 최종 목록과 parameter 상세가 미확정이다.

Frontend는 Voice control의 자리와 state interface만 먼저 설계한다.

### BLOCKER-F — Confirmation notification

원본 프로젝트는 여행 확정 시 문자 알림을 요구한다.
현재 공유 요구사항은 `알림 제공` 수준이며 실제 구현 방식은 TBD다.

Frontend는 확정 상태와 알림 예정 메시지는 표현할 수 있으나 실제 발송 책임은 갖지 않는다.

---

## 10. CP0 Exit Criteria

- [x] 고객 Frontend 책임 범위 정의
- [x] Frontend 외 범위 정의
- [x] Theme Tour / Style / Configuration 관계 정리
- [x] Honeymoon 모집 기준을 `2 teams` UX로 정리
- [x] 기타 Tour 모집 기준 `3 participants` 정리
- [x] 현재 Shared Contract dependency 식별
- [x] API / Auth / Price / Option / Voice TBD 식별
- [x] 향후 planning 문서 구조 확정
- [x] Premium Visual / Motion / Loading 원칙 고정

**CP0 Status: COMPLETE**

다음 단계: **CP1 — Information Architecture / User Flow**


---

## CP Progress

- CP0 — Scope & Contract: **COMPLETE**
- CP1 — Information Architecture & End-to-End UX Flow: **COMPLETE**
- CP2 — Visual Direction: **COMPLETE**
- CP3 — Design System: **COMPLETE**
- CP4 — Motion System: **COMPLETE**
- CP5 — UI State System: **COMPLETE**
- CP6 — Screen Specifications: IN PROGRESS
  - CP6-0 — Spec Contract + Inventory: **COMPLETE**
  - CP6-A — Home + Tours: **COMPLETE**
  - CP6-B — Tour Detail: **COMPLETE**
  - CP6-C — Configure: **COMPLETE**
  - CP6-D — Reservation Review + Success + Detail: **COMPLETE**
  - CP6-E — Login + Signup: **COMPLETE**
  - CP6-F — Previous Trips Popup + My Trips: **COMPLETE**
  - CP6-G — Cross-Screen Consistency Audit: **COMPLETE**
  - CP6-H — Contract / TBD Audit: **COMPLETE**
  - CP6-I — Final Implementation Readiness Review: **COMPLETE**
- CP6 — Screen Specifications: **COMPLETE**
- CP7 — Component Architecture: **COMPLETE**
- CP8 — Data & API UX: **COMPLETE**
- CP9 — Responsive & Accessibility: **COMPLETE**
- CP10 — QA & Acceptance: **COMPLETE**
- CP11 — Implementation Handoff: **COMPLETE**


---

## 13. CP6 Final Closeout

CP6 is complete.

```text
11 screen specs        Spec Ready
Cross-screen audit     Passed
Contract/TBD audit     Passed
Readiness review       Passed
UI build readiness     Ready
Live integration       Contract-gated
```

Final readiness report:

```text
audits/CP6-I-FINAL-IMPLEMENTATION-READINESS.md
```

The next planning unit is:

```text
CP7 — Component Architecture
```

CP7 must isolate unsettled Backend DTOs behind adapters/view models so visual components do not depend directly on draft shared-contract field names.


---

## 14. CP7 Final Closeout

CP7 is complete.

```text
Target source architecture      Locked
Page / Feature ownership        Locked
Shared / Domain boundary        Locked
DTO → Adapter → ViewModel       Locked
Server / Draft / UI state       Separated
ReservationDraft ownership      Locked
Auth ReturnContext              Locked
Voice bridge                    Locked
Skeleton pairing                Locked
Test boundaries                 Locked
P0 contract gates               Isolated at integration edge
```

Current repository is still effectively greenfield (`README.md` + `AGENTS.md` on `frontend/main`), so CP7 defines the implementation target rather than refactoring an existing application structure.

Next:

```text
CP8 — Data & API UX
```


---

## 15. CP8 Final Closeout

CP8 is complete.

```text
Query lifecycle              Locked
Freshness tiers              Locked
Retry policy                 Locked
Request race/cancellation    Locked
Draft persistence            sessionStorage-backed
Review revalidation          Locked
Reservation submit policy    Pessimistic / no auto retry
Offline mutation queue       Prohibited
Price ownership              Backend
Travel History cache         Shared between Popup/My Trips
Mock → real API boundary     Locked
Contract gaps                Explicitly gated
```

Created:

```text
09-DATA-AND-API-UX.md
```

Next:

```text
CP9 — Responsive & Accessibility
```


---

## 16. CP9 Final Closeout

CP9 is complete.

```text
Breakpoint system             Locked
Viewport stress matrix        Locked
Desktop/Tablet/Mobile rules   Locked
Safe-area / sticky collision  Locked
Software keyboard behavior    Locked
200% zoom / reflow            Required
Keyboard navigation           Locked
Focus management              Locked
Dialog / Sheet semantics      Locked
Screen-reader states          Locked
Contrast / non-color states   Locked
Reduced motion                Locked
11-screen audit               Passed
```

Created:

```text
10-RESPONSIVE-ACCESSIBILITY.md
```

Next:

```text
CP10 — QA & Acceptance
```


---

## 17. CP10 Final Closeout

CP10 is complete.

```text
Defect severity                Locked
Release gate                   Locked
11-screen acceptance           Locked
10 critical E2E journeys       Locked
Network/error simulation       Locked
Race-condition testing         Locked
Visual regression scope        Locked
Responsive QA matrix           Locked
Accessibility manual gate      Locked
Contract-gate QA               Locked
PR test evidence               Locked
Release smoke                  Locked
```

Created:

```text
11-QA-ACCEPTANCE.md
```

Next:

```text
CP11 — Implementation Handoff
```


---

## 18. CP11 Final Closeout

CP11 is complete.

```text
Mandatory reading order       Locked
Repository boundaries         Locked
Source architecture           Locked
Contract gates                Locked
Never-invent list             Locked
Mock strategy                 Locked
First PR scope                Locked
Implementation order          Locked
PR evidence                   Locked
STOP / escalation conditions  Locked
Implementation agent brief    Ready
```

Created:

```text
12-IMPLEMENTATION-HANDOFF.md
```

Final planning status:

```text
CP0–CP11 COMPLETE
FRONTEND PLANNING COMPLETE
READY TO START IMPLEMENTATION
```

Recommended first implementation unit:

```text
PR-01 — Foundation / Tokens / Shared UI / Router / Test Harness
```
