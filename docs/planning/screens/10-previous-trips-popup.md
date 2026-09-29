# [S10] Previous Trips Popup

> File: `screens/10-previous-trips-popup.md`  
> Trigger: successful customer login  
> CP6 Status: **Ready — CP6-F Complete**  
> Depends on:
> - `07-SCREEN-SPECS.md`
> - `02-INFORMATION-ARCHITECTURE.md`
> - `04-DESIGN-SYSTEM.md`
> - `05-MOTION-SYSTEM.md`
> - `06-UI-STATES.md`
> - `screens/08-login.md`
> - `screens/11-my-trips.md`

---

# 1. Screen Purpose

Previous Trips Popup은 로그인에 성공한 고객에게
**이전에 이용한 여행 이력을 최근 순으로 즉시 보여주는 post-login surface**다.

이 화면은 단순 환영 modal이 아니다.

원본 요구사항의 핵심은 다음이다.

```text
로그인 후
→ 저장된 이전 여행 목록을 popup으로 표시
→ 최근 여행이 먼저
→ 상품 / 기간 / 등급 / 가격 표시
```

따라서 한 개의 “최근 여행” 카드만 보여주는 구조가 아니라
이전 여행 목록을 실제로 확인할 수 있는 UI로 설계한다.

이 Popup의 역할:

1. 로그인 성공을 자연스럽게 이어받는다.
2. 과거 여행을 짧게 회상시킨다.
3. 전체 Travel History(`/my-trips`)로 연결한다.
4. History API 실패가 로그인 성공 자체를 무효화하지 않게 한다.

---

# 2. Route / Entry Conditions

## Route

독립 route가 아닌 **global post-login surface**.

기본 trigger:

```text
customer login success
```

## Entry Modes

### Normal login

```text
Login Success
→ Previous Trips Popup
```

[CONFIRMED]

### Transactional login

예:

```text
Reservation Review
→ auth required
→ Login Success
```

[FRONTEND PROPOSAL]

transaction context 복구를 먼저 하고,
Popup은 transaction을 방해하지 않는 시점에 1회 지연 표시할 수 있다.

이 예외는 원본의 “로그인 후 popup” 요구를 버리는 것이 아니라,
사용자의 진행 중 transaction을 보존하기 위한 timing 조정이다.

CP6-G/H에서 최종 cross-contract audit 대상.

## Exit

Close:

```text
→ underlying current route/context
```

Primary:

```text
View all trips
→ /my-trips
```

History item click:

[TBD]

현재 Travel History item의 dedicated detail route/API가 별도로 확정되지 않았다.

따라서 individual past trip row를 임의로 `/reservations/:id`에 연결하지 않는다.

---

# 3. User Goal

Primary goal:

> 로그인 직후 이전 여행 목록을 확인한다.

Secondary goals:

- 전체 여행 이력으로 이동
- Popup을 닫고 원래 하던 일을 계속
- 여행 기록이 없거나 실패해도 서비스를 계속 이용

---

# 4. Required Data

## Travel History List

[CONFIRMED]

최근 여행 순.

각 history item 최소:

```text
상품
기간
Tour Style / 등급
가격
```

## Optional Visual Data

[FRONTEND PROPOSAL]

가능하면 Theme image 또는 theme accent를 사용해
각 row를 여행 카드처럼 보이게 할 수 있다.

[TBD]

Travel History DTO에 image/theme field가 포함되는지 미확정.

## API

[CONFIRMED endpoint skeleton]

```text
GET /api/v1/customers/me/travel-history
```

[BLOCKED BY SHARED CONTRACT]

- response DTO
- pagination
- date representation
- price format
- history item identifier
- Theme image mapping
- empty response semantics

---

# 5. Desktop Layout

## Modal

CP3 Dialog foundation 사용.

권장 width:

```text
640–720px
```

max-height:

```text
min(80vh, content)
```

## Composition

```text
┌─────────────────────────────────────────────────────────────┐
│ Welcome back                                      [ Close ] │
│                                                             │
│ Your previous trips                                         │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [image]  Outdoor Trekking                              │ │
│ │          2026.xx.xx – xx.xx                           │ │
│ │          Grand                         ₩...            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [image]  Golf Challenge                               │ │
│ │          ...                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                    [ View all trips ]                       │
└─────────────────────────────────────────────────────────────┘
```

## Scroll

목록이 modal max-height를 넘으면
**목록 영역만** scroll.

Header / bottom action은 가능하면 유지.

## Visual Tone

- “광고 popup”처럼 보이지 않음
- overly promotional CTA 금지
- account archive의 preview 느낌
- calm editorial dialog

---

# 6. Mobile Layout

Desktop centered modal을 축소하지 않는다.

기본:

```text
full-height bottom sheet
or
near-fullscreen sheet
```

Structure:

```text
Drag handle (decorative)
Close
↓
Welcome back
Your previous trips
↓
History list
↓
View all trips
safe area
```

## List

single column.

각 item:

```text
thumbnail
product title
period
Tour Style
price
```

## Bottom CTA

목록이 길어도 `View all trips` 접근 가능.

Sticky footer action 사용 가능.

## Touch

Close / CTA / list control >=44px.

---

# 7. Exact Section Order

```text
01 Dialog / Sheet Header
02 Welcome Heading
03 Supporting Text
04 Travel History List
05 Empty/Error Region when applicable
06 View All Trips CTA
07 Close Action
```

History item order:

```text
most recent
→ older
```

---

# 8. Component Composition

## Page / Domain Components

```text
PreviousTripsPopup
├── PreviousTripsHeader
├── PreviousTripsList
│   └── PreviousTripPreviewCard × N
├── PreviousTripsStateRegion
└── PreviousTripsActions
```

## Design-System Primitives

```text
Dialog
BottomSheet
ImageFrame
InfoCard
Button
TextLink
Skeleton
EmptyState
ErrorState
```

## New domain components

```text
PreviousTripPreviewCard
PreviousTripsList
```

`TripCard`와 향후 My Trips의 카드 구조를 최대한 공유하도록 설계한다.

---

# 9. Primary / Secondary CTA

## Primary

```text
Label: 전체 여행 보기
Action: navigate
Destination: /my-trips
Enabled when: authenticated
```

History empty 상태에서도 노출 여부:

[FRONTEND PROPOSAL]

비어 있다면 `여행 둘러보기`가 더 자연스러우므로 Primary를 바꾼다.

```text
여행 둘러보기
→ /tours
```

## Secondary

```text
닫기
→ underlying route
```

## Item Action

[TBD]

history item detail route가 확정되기 전
row 자체를 interactive하게 만들지 않아도 된다.

---

# 10. Interaction Rules

## On Open

- 로그인 성공이 먼저 확정되어야 함
- popup history fetch 시작
- underlying page는 유지
- focus trap 활성화

## Close

- popup 닫힘
- underlying route/context 그대로
- 로그인 상태 유지

## View All

- popup close
- `/my-trips`로 이동

## Retry

History fetch 실패 시 popup 내부에서만 retry.

## Transactional Context

예약 흐름 중 login이었다면:

- popup이 즉시 transaction CTA를 가로막지 않도록 지연 가능
- 지연된 popup은 1회만 표시
- 사용자가 logout/login을 반복하지 않는 한 중복 노출 방지 정책 필요

정확한 “1회 표시 state” 저장 방식은 CP8.

---

# 11. Motion

## Enter

`Dialog Motion` desktop.

Mobile:

`Bottom Sheet Motion`.

## List

첫 viewport item에 한해
40ms 정도의 매우 짧은 controlled reveal 허용.

목록 전체 sequential animation 금지.

## Login → Popup Chaining

일반 흐름:

```text
Login dialog exit
→ 150–220ms separation
→ Previous Trips Popup enter
```

## Reduced Motion

- dialog/sheet opacity 80–120ms
- list stagger 제거

---

# 12. Loading

Popup shell은 즉시 표시.

```text
Welcome back
Your previous trips
```

Header는 유지.

History list:

```text
PreviousTripPreviewCard
↔ TripCardSkeleton
```

초기 viewport 기준:

```text
3 items
```

정도의 skeleton.

전체 modal spinner 금지.

## Image

card image가 있다면 progressive load.
이미지 없어도 상품/기간/등급/가격 정보는 읽혀야 함.

---

# 13. Empty

Applicable: Yes.

Trigger:

```text
authenticated customer
+ travel history length = 0
```

Copy:

```text
아직 지난 여행이 없습니다.

첫 번째 여행을 만나보세요.
```

Primary CTA:

```text
여행 둘러보기
→ /tours
```

Close 허용.

Empty가 로그인 실패처럼 보이면 안 된다.

---

# 14. Error

## Network

```text
지난 여행을 불러오지 못했습니다.
연결 상태를 확인하고 다시 시도해주세요.
```

Actions:

```text
[ 다시 시도 ]
[ 닫기 ]
```

## Server

```text
지난 여행을 불러오지 못했습니다.
잠시 후 다시 시도해주세요.
```

## Unauthorized

로그인 성공 직후 401이면 auth/session contract 문제 가능.

UI:
- auth state 재평가
- context를 파괴하지 않는 방식으로 Login 필요 처리

정확한 정책은 CP8.

## Offline

cached history가 있으면:

```text
오프라인 상태입니다.
저장된 여행 기록을 표시하고 있습니다.
```

없으면 offline error.

## Image Failure

card fallback.

## Partial Failure

history item 일부 image 실패:
- item metadata 유지

데이터 row 자체 일부가 malformed면:
- 안전하게 렌더 가능한 정보만 표시
- invented value 금지
- 운영 로그 대상

---

# 15. Retrying / Refreshing

## Retry

popup list만 retry.

## Refreshing

기존 history가 있으면 유지.

전체 skeleton reset 금지.

## Existing content

success data 유지.

## Stale

Travel History는 recruitment보다 freshness 민감도가 낮다.

최근순 정렬은 backend response 또는 frontend sort contract가 명확해야 한다.

[CONFIRMED behavior]

UI 결과는 recent-first여야 한다.

정확한 timestamp field는 DTO 계약 필요.

---

# 16. Edge Cases

## History API slow

popup shell + skeleton.

## History empty

empty state.

## Login success + history API fail

로그인 성공 유지.

## Very long history

modal에서는 preview count를 제한하거나 scroll list.

[FRONTEND PROPOSAL]

Popup에서는 전체 history를 무한히 노출하기보다
최근 N개 preview + `전체 여행 보기`를 우선.

정확한 N은 구현 데이터 density를 보고 CP6-G에서 3~5 범위 권장.

이는 원본의 “목록 popup” 요구를 충족하면서 modal 과밀을 피하기 위한 UX 제안.

## Long product title

2줄 clamp 가능.
정보 자체를 삭제하지 않음.

## Long period

wrap 허용.

## Missing image

fallback.

## Missing price

DTO에 price가 없는데 UI가 0원/미정처럼 임의 생성 금지.
contract gap으로 처리.

## Underlying route disappears

popup close 시 safe fallback route `/`.

## Transaction delayed popup

한 번 지연한 뒤 같은 session에서 잊혀지지 않도록
pending post-login-history flag 필요 가능.

CP8에서 상태 관리 설계.

---

# 17. Accessibility

## Dialog / Sheet

- semantic dialog
- labelled by `Your previous trips`
- focus trap
- close on Escape desktop when safe
- close 후 원 trigger/context로 focus return

## List

semantic list:

```text
<ul>
<li>
```

또는 equivalent.

## Item Metadata

상품 / 기간 / 등급 / 가격의 label 관계가 screen reader에서 이해 가능해야 함.

## Keyboard

- Close
- Retry
- View all trips
- item action이 생긴 경우 item link

순으로 logical focus.

## Images

theme image가 decorative면 empty alt.
정보성이라면 concise scene alt.

## Reduced Motion

CP4 준수.

## Touch

>=44×44px.

---

# 18. API / Shared Contract Dependency

| Need | Current Source | Status | Frontend Impact |
|---|---|---|---|
| 로그인 후 history popup | original requirement | CONFIRMED | trigger |
| recent-first order | original/shared requirement | CONFIRMED | list order |
| 상품/기간/등급/가격 | original/shared requirement | CONFIRMED | card minimum fields |
| travel history endpoint | API skeleton | CONFIRMED endpoint skeleton | data fetch |
| history response DTO | API v0.2 | BLOCKED BY SHARED CONTRACT | field mapping |
| history item detail ID/route | none | TBD | row interaction |
| image/theme metadata | none | TBD | visual card |
| pagination/limit | none | TBD | popup preview count |
| transaction-time popup delay | frontend planning | FRONTEND PROPOSAL | auth interruption UX |

---

# 19. TBD / Blocker

## TBD

- popup에서 보여줄 최대 preview 개수
- item detail interaction 여부
- history image source
- exact price/date formatting
- transaction 중 popup 지연 시점

## Blocked by Shared Contract

- Travel History DTO
- item identifiers
- auth/session handling for unexpected 401

## Frontend Proposal Awaiting Audit

- Desktop large dialog
- Mobile full-height sheet
- recent 3~5 preview + View All
- transaction login에서 popup 지연
- empty에서는 View All 대신 Explore Tours

---

# 20. Acceptance Criteria

## Functional

- [ ] 정상 login 후 Previous Trips Popup이 열릴 수 있다.
- [ ] history는 recent-first로 표시된다.
- [ ] 각 item에 상품/기간/등급/가격이 표시될 수 있다.
- [ ] View All → `/my-trips`.
- [ ] Close 후 underlying context 유지.
- [ ] history fetch 실패가 login success를 무효화하지 않는다.
- [ ] Empty 상태에서도 서비스 계속 이용 가능.

## Visual

- [ ] 광고 popup처럼 보이지 않는다.
- [ ] account archive tone 유지.
- [ ] card density가 과도하지 않음.
- [ ] mobile에서 desktop modal 단순 축소 아님.

## Loading / Error

- [ ] popup shell 유지 + list skeleton.
- [ ] local retry.
- [ ] image fail이 metadata를 지우지 않음.
- [ ] offline/cached history 구분 가능.

## Responsive

- [ ] Desktop 640–720px 정도 dialog.
- [ ] Mobile full-height/near-fullscreen sheet.
- [ ] 긴 목록은 list 영역만 scroll.
- [ ] bottom safe area 처리.

## Accessibility

- [ ] focus trap / return.
- [ ] history semantic list.
- [ ] metadata가 screen reader에 명확.
- [ ] close/retry/view all keyboard accessible.
- [ ] reduced motion.

## Contract Safety

- [ ] history DTO를 임의 정의하지 않는다.
- [ ] item detail route를 임의 생성하지 않는다.
- [ ] price가 없을 때 값을 만들어내지 않는다.
- [ ] transaction popup timing을 Shared Requirement 자체처럼 표현하지 않는다.

---

# Screen Status

```text
Ready
```
