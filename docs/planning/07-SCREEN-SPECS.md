# Mister World Frontend Screen Specifications

> Document: `07-SCREEN-SPECS.md`  
> Status: **CP6 COMPLETE — Final Implementation Readiness Reviewed**  
> Scope: `WonhoOne/frontend` Customer GUI  
> Planning baseline: 2026-09-29  
> Depends on:
> - `00-PLANNING-INDEX.md`
> - `01-PRODUCT-EXPERIENCE.md`
> - `02-INFORMATION-ARCHITECTURE.md`
> - `03-VISUAL-DIRECTION.md`
> - `04-DESIGN-SYSTEM.md`
> - `05-MOTION-SYSTEM.md`
> - `06-UI-STATES.md`

---

# 0. Purpose

이 문서는 CP6 전체의 Screen Spec Index이자 작성 계약이다.

CP6의 완료 기준은 단순히 화면별 문서를 만드는 것이 아니다.

> **각 화면 MD 하나만 읽어도 구현자가 추가적인 UX 결정을 거의 하지 않고  
> 정상·로딩·오류·모바일·모션·상호작용까지 구현할 수 있는 상태**

를 목표로 한다.

각 화면 문서는 동일한 구조와 용어를 사용하며,
공통 계약이 확정되지 않은 부분은 임의로 보완하지 않는다.

---

# 1. Screen Inventory — LOCKED

CP6에서 작성할 고객용 화면은 아래 11개다.

| ID | File | Surface | Route / Trigger | CP6 Sub-checkpoint |
|---|---|---|---|---|
| S01 | `screens/01-home.md` | Home | `/` | CP6-A |
| S02 | `screens/02-tours.md` | Tours Collection | `/tours` | CP6-A |
| S03 | `screens/03-tour-detail.md` | Tour Detail | `/tours/:tourId` | CP6-B |
| S04 | `screens/04-configure.md` | Tour Configuration | `/tours/:tourId/configure` | CP6-C |
| S05 | `screens/05-reservation-review.md` | Reservation Review | `/reservation/review` | CP6-D |
| S06 | `screens/06-reservation-success.md` | Reservation Success | `/reservation/:reservationId/success` | CP6-D |
| S07 | `screens/07-reservation-detail.md` | Reservation Detail | `/reservations/:reservationId` | CP6-D |
| S08 | `screens/08-login.md` | Login | `/login` + modal-route entry | CP6-E |
| S09 | `screens/09-signup.md` | Sign Up | `/signup` | CP6-E |
| S10 | `screens/10-previous-trips-popup.md` | Previous Trips Popup | post-login global surface | CP6-F |
| S11 | `screens/11-my-trips.md` | My Trips / Travel History | `/my-trips` | CP6-F |

이 11개는 CP6 동안 기본 inventory로 고정한다.

새 화면이 필요하다고 판단될 경우:
1. 기존 화면의 section/state로 흡수 가능한지 먼저 검토
2. 불가능한 경우 `07-SCREEN-SPECS.md`에 이유 기록
3. IA 영향 검토
4. CP6-G audit에서 반영

---

# 2. Global Surfaces — Separate Screen Spec 대상 아님

아래는 독립 화면 문서가 아니라 공통 시스템 또는 각 화면의 state로 다룬다.

```text
404 / Not Found
Global Error Boundary
Offline Banner
Toast
Dialog
Bottom Sheet
Mobile Navigation Sheet
Voice Control Surface
Skeleton
Empty State
Section Error
Retry Surface
```

이들은 CP3~CP5의 시스템 계약을 재사용한다.

예외:
`Previous Trips Popup`은 원본 요구사항상 독립 UX가 중요하므로 S10으로 별도 문서화한다.

---

# 3. Mandatory Screen Spec Structure — LOCKED

모든 `screens/*.md`는 아래 20개 항목을 **동일 순서**로 가져야 한다.

```text
1. Screen Purpose
2. Route / Entry Conditions
3. User Goal
4. Required Data
5. Desktop Layout
6. Mobile Layout
7. Exact Section Order
8. Component Composition
9. Primary / Secondary CTA
10. Interaction Rules
11. Motion
12. Loading
13. Empty
14. Error
15. Retrying / Refreshing
16. Edge Cases
17. Accessibility
18. API / Shared Contract Dependency
19. TBD / Blocker
20. Acceptance Criteria
```

해당되지 않는 항목도 삭제하지 않는다.

대신:

```text
N/A — <reason>
```

으로 명시한다.

---

# 4. Requirement Status Labels — LOCKED

Screen Spec에서 기능/데이터/정책은 반드시 다음 네 상태 중 하나로 라벨링한다.

## `CONFIRMED`

원본 요구사항, 최신 팀 결정, 승인된 shared docs 중 하나에서 확정된 내용.

예:

```text
[CONFIRMED]
Honeymoon은 Frontend에서 2 couples / 2 teams 의미로 표현한다.
```

## `FRONTEND PROPOSAL`

공통 Business Rule이 아니라 UX 구현을 위한 프론트 제안.

예:

```text
[FRONTEND PROPOSAL]
Desktop Configure는 우측 sticky summary를 사용한다.
```

## `TBD`

아직 결정되지 않았으나 화면을 설계하는 데 즉시 blocking은 아닌 항목.

예:

```text
[TBD]
실제 Hotel option catalog.
```

## `BLOCKED BY SHARED CONTRACT`

구현에 필요한 공통 API/도메인 계약이 없어 실제 integration을 완료할 수 없는 항목.

예:

```text
[BLOCKED BY SHARED CONTRACT]
Reservation request DTO.
```

### Rule

`FRONTEND PROPOSAL`을 `CONFIRMED`처럼 작성하지 않는다.

---

# 5. Source-of-Truth Precedence

화면 문서가 충돌할 경우 다음 순서를 따른다.

```text
1. 최신 팀 확정 결정
2. 원본 프로젝트 요구사항
3. WonhoOne/docs Shared Contract
4. 00~06 Frontend Planning documents
5. 해당 Screen Spec
6. 구현 세부사항
```

공통 계약과 Screen Spec이 충돌하면
Screen Spec에서 임의 해결하지 않고 `TBD/BLOCKED`로 올린다.

---

# 6. Core Product Semantics — All Screens Must Preserve

## Theme Tours

```text
Honeymoon Romance
Parents Healing
Golf Challenge
Outdoor Trekking
```

## Tour Styles

```text
Classic
Grand
Premium
```

## Style restrictions

```text
Honeymoon Romance → Grand / Premium
Parents Healing   → Grand / Premium
Golf Challenge    → Classic / Grand / Premium
Outdoor Trekking  → Classic / Grand / Premium
```

## Configuration

Tour Style 선택 이후에도 최소:

```text
Hotel
Transport
Meal
```

을 변경할 수 있는 구조를 유지한다.

## Recruitment

Honeymoon:

```text
2 couples / 2 teams required
```

Other Tours:

```text
3 participants required
```

Frontend가 Backend의 최종 Business Rule 판정을 대체하지 않는다.

---

# 7. Route Continuity Contract

Primary route chain:

```text
/
→ /tours
→ /tours/:tourId
→ /tours/:tourId/configure
→ /reservation/review
→ /reservation/:reservationId/success
→ /reservations/:reservationId
```

Returning customer:

```text
login
→ previous trips popup
→ /my-trips
```

Browser Back / Close / Cancel 동작은
각 화면 문서에 반드시 명시한다.

---

# 8. Desktop / Mobile Documentation Contract

각 화면 문서는 Desktop과 Mobile을 별도 섹션으로 작성한다.

금지:

```text
"모바일은 반응형으로 처리"
```

필수:

- section stacking
- sticky/fixed surface 변화
- modal → sheet/page 변환
- image crop 변화
- CTA 위치 변화
- navigation 변화
- touch target
- scroll behavior

Tablet은 Desktop/Mobile 중 어떤 패턴을 따르는지 화면별로 명시한다.

---

# 9. State Documentation Contract

각 화면에서 아래 상태를 평가한다.

```text
Loading
Success
Empty
Error
Retrying
Refreshing
Stale
Offline
Unauthorized
Not Found
```

모든 상태가 필요한 것은 아니다.

필요 없는 경우:

```text
N/A — static curated content; no empty data state
```

처럼 이유를 적는다.

### Mutation 화면

추가로:

```text
Idle
Submitting
Success
Failure
Retrying
```

을 검토한다.

---

# 10. Loading Contract

Screen Spec에서 Loading을 작성할 때:

```text
spinner
```

라고만 적는 것을 금지한다.

반드시:

- 어떤 component가 skeleton인지
- 어떤 영역은 이미 보이는지
- image placeholder는 무엇인지
- section-level인지 page-level인지
- layout shift 방지 방법

을 명시한다.

---

# 11. Error Contract

Error는 최소 아래 중 하나로 분류한다.

```text
Network
Server
Not Found
Validation
Conflict
Unauthorized
Offline
Image Failure
Partial Failure
Unknown
```

각 Error에는 가능하면:

```text
User-facing copy
Recovery action
Preserved state
```

를 명시한다.

---

# 12. Motion Contract

각 Screen Spec의 Motion 섹션은
새 animation을 즉석에서 발명하지 않는다.

CP4의 이름을 재사용한다.

예:

```text
Shared Hero Transition
Standard Forward Page Transition
Section Reveal
Option Selection Motion
Live Summary Update
Recruitment Progress Motion
Dialog Motion
Bottom Sheet Motion
Skeleton Shimmer
Progressive Image Reveal
```

새 Motion이 필요하면 CP4 contract 확장 여부를 먼저 판단한다.

---

# 13. Component Documentation Contract

각 화면의 `Component Composition`은 두 층으로 나눈다.

```text
Page/Domain Components
Primitive Components
```

예:

```text
TourDetailPage
├── TourHero
│   ├── ImageFrame
│   └── StatusBadge
├── TourStyleSelector
│   └── OptionCard
└── ScheduleSection
    └── RecruitmentProgress
```

화면 문서에서 CSS 구현 세부사항까지 들어가지 않는다.
그 역할은 CP3 Design System.

---

# 14. CTA Documentation Contract

모든 화면에서 CTA를 우선순위로 표기한다.

```text
Primary
Secondary
Tertiary / Quiet
Destructive
```

각 CTA는 다음을 가져야 한다.

```text
Label
Destination / Action
Enabled condition
Loading behavior
Failure behavior
```

CTA 없는 화면이라면 N/A 명시.

---

# 15. Data Documentation Contract

`Required Data`에는 실제 DTO를 임의로 정의하지 않는다.

대신 UI가 필요로 하는 **data need**를 작성한다.

예:

```text
Tour identity
Theme
Hero image
Allowed styles
Available schedules
Recruitment status
```

그리고 API Contract가 확정되지 않았다면:

```text
[BLOCKED BY SHARED CONTRACT]
Response field names / DTO shape
```

라고 적는다.

---

# 16. Copy Documentation Contract

화면에 필요한 핵심 문구는 Screen Spec에서 제시할 수 있다.

단:

- Business Rule을 copy로 새로 만들지 않음
- mock price / hotel name을 실제 계약처럼 표현하지 않음
- placeholder임을 명시

Copy tone:

```text
calm
clear
premium
non-cutesy
non-technical
```

---

# 17. Accessibility Documentation Contract

모든 화면에서 최소 다음을 확인한다.

```text
Heading hierarchy
Landmark
Keyboard path
Focus order
Focus return
Accessible name
Form label
Error association
Color-independent state
Touch target >= 44px
Reduced motion
Image alt strategy
Dialog focus trap if applicable
```

해당 없는 항목은 N/A.

---

# 18. Screen-Level Acceptance Criteria Format

Acceptance Criteria는 구현자가 체크할 수 있는 문장이어야 한다.

좋음:

```text
[ ] Schedule API가 실패해도 Hero와 Style section은 유지된다.
```

나쁨:

```text
[ ] 예쁘다.
[ ] UX가 좋다.
```

각 화면 최소 기준:

- Functional
- Visual/system compliance
- Loading
- Error
- Responsive
- Accessibility
- Navigation
- Contract safety

---

# 19. CP6 Sub-checkpoint Plan

```text
CP6-0  Screen Spec Contract + Inventory
CP6-A  Home + Tours
CP6-B  Tour Detail
CP6-C  Configure
CP6-D  Reservation Review + Success + Detail
CP6-E  Login + Signup
CP6-F  Previous Trips Popup + My Trips
CP6-G  Cross-Screen Consistency Audit
CP6-H  Contract / TBD Audit
CP6-I  Final Implementation Readiness Review
```

현재:

```text
CP6-0 COMPLETE
CP6-A COMPLETE
CP6-B COMPLETE
CP6-C COMPLETE
CP6-D COMPLETE
CP6-E COMPLETE
CP6-F COMPLETE
CP6-G COMPLETE
CP6-H COMPLETE
CP6-I COMPLETE
CP6 COMPLETE
```

---

# 20. Screen Readiness Tracker

| Screen | Spec | Desktop | Mobile | States | Motion | A11y | API deps | Acceptance | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Home | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Spec Ready |
| Tours | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Spec Ready |
| Tour Detail | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Spec Ready |
| Configure | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Spec Ready |
| Reservation Review | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Spec Ready |
| Reservation Success | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Spec Ready |
| Reservation Detail | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Spec Ready |
| Login | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Spec Ready |
| Signup | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Spec Ready |
| Previous Trips Popup | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Spec Ready |
| My Trips | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Spec Ready |

CP6-I 기준 11개 화면이 모두 `Spec Ready`이며, live integration contract gate는 별도 관리한다.

---

# 21. CP6-0 Exit Criteria

- [x] Screen inventory 11개 잠금
- [x] 파일명/번호 규칙 잠금
- [x] 20개 mandatory section 잠금
- [x] Requirement status label 잠금
- [x] Source-of-truth precedence 잠금
- [x] Desktop/Mobile 문서화 규칙 잠금
- [x] UI state 문서화 규칙 잠금
- [x] Loading/Error 작성 규칙 잠금
- [x] Motion 재사용 규칙 잠금
- [x] Component composition 규칙 잠금
- [x] CTA 작성 규칙 잠금
- [x] Data/API dependency 작성 규칙 잠금
- [x] Accessibility 작성 규칙 잠금
- [x] Acceptance Criteria 형식 잠금
- [x] Screen readiness tracker 생성

**CP6-0 Status: COMPLETE**

Next: **CP6-A — Home + Tours**


---

## CP6-A Completion Note

Completed:

- `screens/01-home.md`
- `screens/02-tours.md`

Review result:

- Home과 Tours의 역할 분리 유지
- Home = brand/discovery
- Tours = comparison/collection
- search/filter/sort는 현재 product scope에 불필요하므로 미도입
- 4개 Theme 고정 product semantics 유지
- Home/Tours 모두 Shared Hero Transition을 enhancement로 사용
- API DTO 미확정 부분은 `BLOCKED BY SHARED CONTRACT`로 유지
- 가격/일정/모집현황을 Collection에서 임의 노출하지 않음
- Desktop/Mobile/Loading/Error/Motion/A11y 작성 완료

**CP6-A Status: COMPLETE**

Next: **CP6-B — Tour Detail**

---

# 22. CP6-A Completion Note

## Completed

```text
S01 Home        Ready
S02 Tours       Ready
```

CP6-A에서 확정한 핵심:

- Home = brand / emotional discovery
- Tours = functional curated comparison
- 4 Theme는 mobile에서도 모두 직접 노출
- 범용 OTA search/filter/sort는 만들지 않음
- Home은 editorial asymmetry
- Tours는 비교를 위해 더 정돈된 2-column desktop structure
- Home/Tours → Tour Detail은 Signature Shared Transition
- 가격/실제 일정/목적지는 계약 없이는 노출하지 않음
- Loading/Error는 section-level recovery
- image failure는 branded fallback
- source-backed Theme 서비스만 preview copy에 사용

**CP6-A Status: COMPLETE**

Next: **CP6-B — Tour Detail**

---

# 23. CP6-B Completion Note

## Completed

```text
S03 Tour Detail   Ready
```

CP6-B에서 확정한 핵심:

- Tour Detail은 `Understand → Style → Schedule → Recruitment → Configure` 흐름
- Theme Story / Included Experience / Style / Schedule을 별도 section으로 분리
- Honeymoon / Parents는 Classic 미노출
- Golf / Trekking은 Classic / Grand / Premium
- Honeymoon 모집 UI는 `2 couples / 2 teams`
- 나머지 Theme는 `3 participants`
- Style + Schedule 선택 후 Configure CTA 활성
- Tour core와 Schedule loading/error를 분리
- Schedule failure가 전체 page를 지우지 않음
- 선택한 Schedule이 unavailable 되면 Style 유지, Schedule만 재선택
- initial confirmed state와 실시간 confirmed transition motion을 구분
- TourSchedule DTO / availability / exact status는 Shared Contract blocker로 유지
- actual destination / price / hotel name은 임의 생성 금지

**CP6-B Status: COMPLETE**

Next: **CP6-C — Configure**

---

# 24. CP6-C Completion Note

## Completed

```text
S04 Configure   Ready
```

CP6-C에서 확정한 핵심:

- Configure는 `Theme + Style + Schedule`을 입력 context로 받음
- Style은 Configure에서 다시 선택하지 않고 `Change style/schedule`로 Tour Detail에서 변경
- Hotel / Transport / Meal을 핵심 required option group으로 구성
- Extras는 source-backed Champagne/Coffee 개념을 수용하되 실제 option rule은 Shared Contract 의존
- Desktop은 option controls + sticky live summary
- Mobile은 1-column options + persistent bottom summary + Bottom Sheet
- OptionGroup별 partial loading / partial error / retry
- Summary 전체가 아니라 변경된 row만 motion
- price는 기존 값을 유지하며 recalculation
- invalid/unavailable option을 자동 대체하지 않음
- selected option conflict 시 사용자 재선택 요구
- required group empty는 blocking product/config state
- Review CTA는 required selection + known validation을 만족할 때만 활성
- draft preservation / back / refresh / deep-link recovery 요구 정의
- Voice가 붙더라도 실제 UI selection state가 primary feedback
- actual option catalog / price formula / TourConfiguration DTO는 Shared Contract blocker/TBD로 유지

**CP6-C Status: COMPLETE**

Next: **CP6-D — Reservation Review + Success + Detail**

---

# 25. CP6-D Completion Note

## Completed

```text
S05 Reservation Review    Ready
S06 Reservation Success   Ready
S07 Reservation Detail    Ready
```

CP6-D에서 확정한 핵심:

- Review는 선택 화면이 아니라 최종 검토 + Submit 화면
- 온라인 결제/환불/취소 UI는 현재 범위에서 제외
- Review의 Change는 Configure 또는 Tour Detail로 돌아감
- Submit은 pessimistic mutation
- duplicate submit 방지 필수
- 401/409/network failure에서도 draft 유지
- 일정/가격/옵션 변경 시 자동 동의하지 않고 explicit reconfirmation
- Success는 신청 완료 + 현재 recruitment state를 함께 표시
- Honeymoon은 `2 couples / 2 teams`, 일반 Tour는 `3 participants`
- original source의 확정 시 SMS 요구와 shared docs의 일반 notification requirement를 구분
- 실제 SMS/notification mechanism과 delivery status는 Shared Contract blocker
- Success refresh/direct recovery는 reservation ID 기반 server lookup을 목표
- Reservation Detail은 current application/status, My Trips는 historical travel record로 역할 분리
- Reservation Detail에 cancel/refund/payment control을 만들지 않음
- Reservation core와 recruitment/status/price failure를 section-level로 분리

**CP6-D Status: COMPLETE**

Next: **CP6-E — Login + Signup**

---

# 26. CP6-E Completion Note

## Completed

```text
S08 Login    Ready
S09 Signup   Ready
```

CP6-E에서 확정한 핵심:

- Login은 Desktop in-app에서는 modal-route를 우선하고 direct `/login`은 full-page fallback
- Mobile Login은 full-screen/sheet pattern
- Login 성공 후 원래 route/context 복구
- transaction 중 login/auth interruption에서도 Configure/Review draft 유지
- 예약 Submit이 401로 중단돼도 auto-resubmit 금지
- 원본의 post-login previous-trips popup 요구를 유지하되, transaction interruption 시 timing은 Frontend Proposal로 분리
- 현재 Auth Contract에는 credential field, token/session, refresh, protected-route 정책이 없으므로 임의 확정 금지
- Login copy도 `email/password`처럼 미확정 field를 특정하지 않음
- Signup은 Customer GUI만 대상으로 하며 Employee signup UI는 frontend scope 밖
- Signup의 source-confirmed profile fields는 `성명 / 주소 / 연락처`
- auth credential / password rule / duplicate-account key / auto-login은 Shared Contract blocker
- social login / password reset / 법률·마케팅 동의 UI를 현재 요구사항처럼 추가하지 않음

**CP6-E Status: COMPLETE**

Next: **CP6-F — Previous Trips Popup + My Trips**

---

# 27. CP6-F Completion Note

## Completed

```text
S10 Previous Trips Popup   Ready
S11 My Trips               Ready
```

CP6-F에서 확정한 핵심:

- 원본 요구대로 로그인 후 이전 여행 목록을 Popup으로 표시
- History는 recent-first
- 최소 fields는 상품 / 기간 / Tour Style(등급) / 가격
- Popup은 Desktop large dialog, Mobile full-height/near-fullscreen sheet
- History API 실패가 Login 성공을 무효화하지 않음
- Popup은 API가 반환한 이전 여행 목록을 recent-first로 표시하고 `전체 여행 보기`로 full-page archive에 연결
- transaction 중 Login에서는 Popup timing을 지연할 수 있도록 Frontend Proposal로 분리
- My Trips는 현재 계약 기준 `Travel History-first`
- active reservation list 계약이 없으므로 Upcoming/Past tab을 임의 생성하지 않음
- Reservation Detail과 Travel History 역할을 분리
- history item detail route/API가 없으므로 임의 링크를 만들지 않음
- Travel History DTO / canonical date field / pagination / image metadata는 TBD/Shared Contract blocker
- Loading은 TripCard skeleton, refresh 중 기존 data 유지
- Empty / Error / Offline / Image Failure를 별도 상태로 설계

**CP6-F Status: COMPLETE**

All 11 screen specs are now authored.

Next: **CP6-G — Cross-Screen Consistency Audit**


---

# 28. CP6-G Cross-Screen Consistency Audit

> Status: **COMPLETE**  
> Audit scope: CP0–CP5 planning + S01–S11 Screen Specs

## Audit Result

모든 11개 Screen Spec이 mandatory 20-section contract를 충족한다.

```text
S01 Home                  PASS
S02 Tours                 PASS
S03 Tour Detail           PASS
S04 Configure             PASS
S05 Reservation Review    PASS
S06 Reservation Success   PASS
S07 Reservation Detail    PASS
S08 Login                 PASS
S09 Signup                PASS
S10 Previous Trips Popup  PASS
S11 My Trips              PASS
```

## Fixed consistency defects

### G-01 — Obsolete route in CP0

Before:

```text
/my-trips/:reservationId
```

After:

```text
/reservations/:reservationId
```

Reason:
Reservation Detail과 Travel History는 별도 개념이며 CP1/API skeleton과 route를 일치시킴.

### G-02 — My Trips scope drift

초기 Product Experience의 `account dashboard` / `Recruiting·Confirmed·Completed` 서술을 제거했다.

Canonical:

```text
My Trips = historical Travel History, recent-first
Reservation Detail = current application / current status
```

### G-03 — Previous Trips Popup single/recent-item drift

초기 “Your recent trip” 예시를 원본 요구에 맞춰 `previous trips list`로 정리했다.

또한 CP6-F의 임의 `최근 N개만 표시` 제한을 제거했다.

Canonical:

```text
Travel History list
→ recent-first
→ scroll inside popup/sheet when long
→ View all trips opens full-page archive
```

### G-04 — Unsupported history-detail navigation

아직 dedicated Travel History detail route/API가 없으므로:

```text
My Trips → Detail
```

을 active route/motion contract에서 제거했다.

### G-05 — Reservation Review unsupported party field

`Participant / Team information`을 required reservation field처럼 보이게 하던 문구를 수정했다.

Canonical:

```text
Recruitment / party context
= only when Shared Contract exposes it
```

### G-06 — Reservation Detail applicant field

Applicant summary도 Reservation DTO가 제공하는 경우에만 표시하도록 conditional 처리했다.

### G-07 — Motion naming drift

Screen Specs가 CP4 canonical names를 사용하도록 정리했다.

Examples:

```text
Standard Forward Page Transition
Button Motion — Loading / Success
General Recruitment Progress Motion
Honeymoon Couple Progress Motion
Image Loading Motion — Progressive load
```

### G-08 — Header primitive drift

새로운 header primitive를 무심코 생성하지 않도록:

```text
MinimalHeader
→ TransactionHeader (completion variant)

AccountHeader
→ GlobalHeader (authenticated state)
```

로 통일했다.

## Cross-screen invariants verified

### Route

```text
/
→ /tours
→ /tours/:tourId
→ /tours/:tourId/configure
→ /reservation/review
→ /reservation/:reservationId/success
→ /reservations/:reservationId
```

Account:

```text
/login
/signup
/my-trips
```

### Product hierarchy

```text
Theme
→ Style
→ Schedule
→ Configure
→ Review
→ Submit
```

Configure itself does not reintroduce a Style selector.

### Departure semantics

```text
Honeymoon
= 2 couples / 2 teams

Parents / Golf / Trekking
= 3 participants
```

No screen uses `4 generic people` as the primary Honeymoon UX.

### My Trips semantics

```text
Travel History only
recent-first
minimum fields:
product / period / Tour Style / price
```

No `Upcoming / Past` taxonomy without contract.

### Loading

- no generic full-page spinner
- skeleton geometry maps to final components
- partial success remains visible
- retry is localized

### Transaction safety

- Configure draft preserved through Review/back/auth interruption
- Submit is pessimistic
- duplicate submit blocked
- 401 does not auto-resubmit
- 409/price/schedule/option change requires reconfirmation

### Motion

- signature shared transition only on Home/Tours → Tour Detail
- normal transaction routes use standard forward/back motion
- initial confirmed state does not impersonate a live confirmation event
- reduced-motion keeps semantic state

### Header families

```text
GlobalHeader
TransactionHeader
AuthSurface/AuthHeader
```

No extra account/completion header primitive required.

## Intentional unresolved items — not consistency defects

These remain explicitly unresolved and move to CP6-H:

```text
Auth credential/session model
Reservation auth gate
Tour / Schedule / Configuration / Reservation / History DTOs
Price and frequent-customer discount
Actual Hotel / Transport / Meal catalogs
Option compatibility rules
Reservation status enum
History item detail route
History pagination
Voice command payload
Confirmation notification mechanism
Transactional post-login history-popup timing
```

They are consistently labelled `TBD`, `FRONTEND PROPOSAL`, or `BLOCKED BY SHARED CONTRACT`.

**CP6-G Status: COMPLETE**

Next: **CP6-H — Contract / TBD Audit**


---

# 29. CP6-H Contract / TBD Audit

> Status: **COMPLETE**

Full audit:

```text
audits/CP6-H-CONTRACT-TBD-AUDIT.md
```

Key result:

```text
11 Screen Specs = UX-spec complete

BUT

full integration readiness depends on unresolved shared contracts.
```

Critical gates surfaced:

```text
H-00 Active baseline status
H-01 Theme ↔ TourProduct mapping
H-02 Reservation participantCount
H-03 Honeymoon 2 couples vs 4 participants
H-04 Auth contract
H-05 TourProduct DTO
H-06 TourSchedule DTO
H-07 TourConfiguration / option contract
H-08 Reservation DTO/error/status
H-09 Price
H-10 Loyalty Discount
H-11 Travel History DTO
H-12 SMS
H-13 Voice payload
H-14 Transaction-time history popup timing
```

The affected Screen Specs now include CP6-H contract-gate notes where the latest shared proposal could materially change implementation.

**CP6-H Status: COMPLETE**

Next: **CP6-I — Final Implementation Readiness Review**

---

# 30. CP6-I Final Implementation Readiness Review

> Status: **COMPLETE**

Full report:

```text
audits/CP6-I-FINAL-IMPLEMENTATION-READINESS.md
```

Final verdict:

```text
11 / 11 Screen Specs     SPEC READY
UI implementation        READY
Mock-backed development  READY
Live API integration     CONTRACT-GATED
```

CP6-I explicitly re-checked `WonhoOne/docs/main`.
v0.1.1 files are present on `main`, so v0.1.1 is used as the active Frontend planning baseline.
The remaining “Proposal until merged” banner is treated as stale docs-governance text.

Active P0 gates:

```text
Theme ↔ TourProduct
Reservation participantCount
Honeymoon couple/team mapping
Auth contract
TourProduct DTO
TourSchedule DTO
TourConfiguration/options
Reservation DTO/error/status
Price
Travel History DTO
```

These gates do not invalidate the Screen Specs.
They define where implementation must use replaceable adapters/fixtures rather than invented contracts.

**CP6 Status: COMPLETE**

Next: **CP7 — Component Architecture**
