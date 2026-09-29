# [S01] Home

> File: `screens/01-home.md`  
> Route / Trigger: `/`  
> CP6 Status: **Ready — CP6-A Complete**  
> Depends on:
> - `07-SCREEN-SPECS.md`
> - `01-PRODUCT-EXPERIENCE.md`
> - `02-INFORMATION-ARCHITECTURE.md`
> - `03-VISUAL-DIRECTION.md`
> - `04-DESIGN-SYSTEM.md`
> - `05-MOTION-SYSTEM.md`
> - `06-UI-STATES.md`

---

# 1. Screen Purpose

Home은 Mister World의 첫 인상을 만드는 **브랜드/테마 발견 화면**이다.

이 화면의 목적은 범용 여행 검색을 시키는 것이 아니라, 사용자가 4개의 Theme Tour 중 자신에게 맞는 여행의 분위기를 발견하게 하는 것이다.

Home에서는 복잡한 가격 비교, 목적지 검색, 필터링을 하지 않는다.  
사용자가 다음 질문에 빠르게 답할 수 있으면 성공이다.

> “Mister World에는 어떤 여행이 있고, 나는 어떤 테마를 보고 싶은가?”

`Tours` 화면이 4개 테마를 비교 가능한 컬렉션으로 정리한다면, Home은 감정적인 첫 인상과 브랜드 경험을 담당한다.

---

# 2. Route / Entry Conditions

## Route

```text
/
```

## Entry

[CONFIRMED]

- 직접 URL 접근 가능
- 앱의 root route
- 인증 불필요
- 이전 draft/context 불필요
- 로그인 여부에 따라 Header Account 영역만 달라질 수 있음

## Exit

Primary:

```text
Explore Theme Tours
→ /tours
```

Theme card:

```text
Honeymoon Romance
Parents Healing
Golf Challenge
Outdoor Trekking
→ /tours/:tourId
```

Global navigation:

```text
Tours    → /tours
My Trips → /my-trips
Login    → /login or auth modal-route
```

Browser Back:

- 외부 진입이면 브라우저 기본 동작
- 앱 내부에서 Home으로 돌아온 경우 실제 history stack을 존중

---

# 3. User Goal

Primary goal:

> 4개의 여행 테마를 보고 관심 있는 여행을 선택한다.

Secondary goals:

- Mister World가 어떤 분위기의 서비스인지 빠르게 이해
- 전체 Theme Tour 컬렉션으로 이동
- 로그인 / My Trips로 이동

Home은 예약 결정을 완료하는 화면이 아니다.

---

# 4. Required Data

## Brand / Navigation

[FRONTEND PROPOSAL]

- Mister World wordmark / logo asset
- Home hero visual
- hero eyebrow / headline / supporting copy

이 텍스트와 asset 자체는 frontend visual content이며 shared business contract가 아니다.

## Theme data

[CONFIRMED]

고정 Theme Tour 4종:

```text
Honeymoon Romance
Parents Healing
Golf Challenge
Outdoor Trekking
```

[CONFIRMED]

Theme preview에 사용할 수 있는 source-backed 성격:

### Honeymoon Romance
- 2인 전용 로맨틱 스페셜 룸 데코레이션
- 커플 기념 티셔츠
- 2인 전용 고급 차량

### Parents Healing
- 고품격 안마·지압
- 건강 인삼 기념품
- 10인승 고급 차량

### Golf Challenge
- 유명 골프 리조트 테마
- 골프공 등 골프 액세서리
- 10인승 고급 차량

### Outdoor Trekking
- 트레킹 / 산악 / 모험 테마
- 아웃도어 기념 스카프
- 10인승 고급 차량

Home에서는 위 내용을 전부 노출하지 않고, 각 카드에서 **1개의 짧은 positioning line + 핵심 visual cue**로 압축한다.

## Example editorial copy

아래는 공통 계약이 아니라 UI copy 제안이다.

[FRONTEND PROPOSAL]

```text
Honeymoon Romance
For two, made unforgettable.

Parents Healing
A slower journey, made with care.

Golf Challenge
A refined escape built around the game.

Outdoor Trekking
Go farther. Breathe deeper.
```

한국어 보조 copy를 병기할 수 있으나,
최종 카피 톤은 CP6-G에서 전체 화면과 함께 다시 감사한다.

## API

[TBD]

Home Theme 데이터가 실제 Backend API에서 내려올지,
Frontend의 curated static configuration으로 관리할지는 아직 확정되지 않았다.

[BLOCKED BY SHARED CONTRACT]

동적 Tour DTO field names는 API v0.2 계약 필요.

---

# 5. Desktop Layout

## Canvas

- `--mw-canvas`
- Hero는 edge-to-edge visual 가능
- Hero 이후 콘텐츠는 `container-wide` / `container-main` 조합
- page gutter는 CP3 Desktop 규칙 사용

## Desktop Structure

```text
┌─────────────────────────────────────────────────────────────┐
│ GLOBAL HEADER — transparent over hero                       │
│ Mister World          Tours   My Trips        Login/Account │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                  CINEMATIC HERO                             │
│                                                             │
│  eyebrow                                                    │
│  A journey made                                             │
│  for your moment.                                           │
│                                                             │
│  supporting copy                                            │
│  [ Explore Theme Tours ]                                    │
│                                                             │
│                                        subtle scroll cue    │
└─────────────────────────────────────────────────────────────┘

             ↓ large editorial breathing room

┌─────────────────────────────────────────────────────────────┐
│ INTRO                                                       │
│ Four ways to travel differently.                            │
│ short supporting copy                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ THEME EDITORIAL COMPOSITION                                 │
│                                                             │
│ ┌────────────────────┐       ┌───────────────┐              │
│ │                    │       │               │              │
│ │ Honeymoon          │       │ Parents       │              │
│ │ large portrait     │       │ medium image  │              │
│ │                    │       └───────────────┘              │
│ └────────────────────┘                                      │
│                                                             │
│               ┌──────────────────────────────┐              │
│               │ Golf — wide landscape        │              │
│               └──────────────────────────────┘              │
│                                                             │
│ ┌────────────────────────┐                                  │
│ │ Trekking               │                                  │
│ │ landscape / portrait   │                                  │
│ └────────────────────────┘                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SERVICE PHILOSOPHY / WHAT CAN BE CUSTOMIZED                 │
│ Hotel · Transport · Meal                                    │
│ short explanation                                            │
│ [ See all tours ]                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FOOTER                                                      │
└─────────────────────────────────────────────────────────────┘
```

## Hero Height

[FRONTEND PROPOSAL]

- desktop 기준 `min-height: 78svh`
- 대형 viewport에서는 `82–90svh` 범위 허용
- 100vh를 강제해 CTA/scroll cue가 잘리는 구조는 피함

## Header

Hero top:

```text
transparent / image-aware
```

Hero threshold 이후:

```text
warm solid surface
subtle border/elevation
```

CP4 Header Motion 사용.

## Editorial Theme Grid

2×2 동일 card grid 금지.

Desktop에서 visual rhythm:

- 1개 large hero-like card
- 1개 medium card
- 1개 wide card
- 1개 offset card

Theme 중요도 순위를 의미하지 않도록:
- viewport/rotation에서 위치가 바뀌어도 동일 CTA hierarchy
- numbering `01–04`를 사용한다면 단순 순서 표시

## Footer

최소:

- Mister World
- Tours
- My Trips
- Login/Account
- project/legal placeholder가 필요하면 별도 Frontend Proposal

과제 범위 밖의 실제 법률/회사 정보를 임의 생성하지 않는다.

---

# 6. Mobile Layout

## Core transformation

Desktop editorial asymmetry를 그대로 축소하지 않는다.

Mobile:

```text
Header
↓
Hero
↓
Intro
↓
Honeymoon card
↓
Parents card
↓
Golf card
↓
Trekking card
↓
Customization message
↓
Footer
```

## Header

- 높이 `56–64px`
- 로고
- account/menu control
- 44×44px minimum touch target
- Hero 위에서는 transparent 가능
- scroll 후 solid surface

## Hero

[FRONTEND PROPOSAL]

- `min-height: 72svh`
- headline은 CP3 mobile `display-xl` 또는 viewport에 따라 `display-2xl`
- CTA는 thumb-accessible width
- hero image focal point는 mobile-specific crop 지원

## Theme cards

- 1 column
- 4:5 또는 3:4 image ratio 중심
- 카드 간 `space-12` 이상
- image → title → short line → `Explore →`
- hover 의존 interaction 없음

## No horizontal carousel by default

4개 Theme는 모두 핵심 상품이므로
가로 carousel로 일부를 숨기지 않는다.

## Safe area

footer 및 fixed UI가 존재한다면 `env(safe-area-inset-bottom)` 고려.

---

# 7. Exact Section Order

```text
01 Global Header
02 Hero
03 Theme Collection Intro
04 Honeymoon Romance Editorial Card
05 Parents Healing Editorial Card
06 Golf Challenge Editorial Card
07 Outdoor Trekking Editorial Card
08 Customization / Product Promise Section
09 Footer
```

## Product Promise Section

[CONFIRMED]

다음 개념을 설명할 수 있다.

```text
Choose a Theme
Choose a Tour Style
Change Hotel / Transport / Meal
```

단, Home에서 상세 configurator UI를 미리 보여주지는 않는다.

목적은:

> “Mister World는 정해진 패키지만 고르는 서비스가 아니라, Style 선택 후 세부 구성을 바꿀 수 있다.”

를 짧게 인지시키는 것.

---

# 8. Component Composition

## Page / Domain Components

```text
HomePage
├── GlobalHeader
├── HomeHero
│   ├── HeroMedia
│   ├── HeroCopy
│   └── HeroPrimaryAction
├── ThemeCollectionIntro
├── HomeThemeEditorialGrid
│   ├── ThemeEditorialCard(Honeymoon)
│   ├── ThemeEditorialCard(Parents)
│   ├── ThemeEditorialCard(Golf)
│   └── ThemeEditorialCard(Trekking)
├── CustomizationPromise
└── GlobalFooter
```

## Design-System Primitives

```text
PageContainer
Section
ImageFrame
EditorialCard
Button
TextLink
Skeleton
ErrorState
```

## New primitive

N/A.

Home-specific `ThemeEditorialCard`는 Domain Component이며
CP3의 Editorial Card primitive를 조합한다.

---

# 9. Primary / Secondary CTA

## Primary CTA — Hero

```text
Label: Explore Theme Tours
Action: navigate
Destination: /tours
Enabled when: always
Loading: route transition only
Failure: router-level failure handling
```

[FRONTEND PROPOSAL]

한국어 UI를 우선한다면:

```text
테마 여행 둘러보기
```

로 localization 가능.

## Theme Card CTA

```text
Label: Explore →
Action: open selected Theme
Destination: /tours/:tourId
Enabled when: theme ID valid
Loading: Shared Hero Transition + route navigation
Failure: route fallback; animation failure must not block navigation
```

## Secondary CTA — Customization Promise

```text
Label: See all tours / 여행 전체 보기
Destination: /tours
```

## Destructive

N/A.

---

# 10. Interaction Rules

## Hero CTA

- click/tap → `/tours`
- keyboard Enter/Space equivalent
- animation 중 router state가 먼저 유효해야 함

## Theme Card

Entire visual card can be clickable, but:

- title/CTA accessible name 제공
- nested links 금지
- keyboard focus-visible 제공
- hover는 pointer environment에서만

Hover:

- image scale max `1.025`
- overlay subtle
- arrow max 4px shift

## Scroll

native scroll.

금지:

- scroll hijacking
- forced snapping
- full-page section lock

## Global Header

- `Tours` → `/tours`
- `My Trips` → `/my-trips`
- auth 필요 시 CP1/CP6-E 정책 따름
- Login/Account는 CP6-E에서 상세

---

# 11. Motion

## Page initial entry

`Home Hero Motion`

- hero image subtle settle
- eyebrow → headline → CTA reveal
- 총 700–900ms 범위
- 사용 가능 상태를 지연하지 않음

## Header

`Header Motion`

- transparent → solid
- 180–260ms

## Theme section

`Section Reveal`

- one-time
- 480ms
- 40–80ms controlled stagger

## Editorial images

`Editorial Image Reveal`

- clip/mask 또는 contained translate
- 모든 카드에 서로 다른 animation 사용 금지

## Theme Card hover

`Card Hover`

## Theme Card → Detail

`Signature Shared Transition`

## Reduced Motion

- Hero: 120ms 이하 opacity
- Section: short opacity only
- Parallax 제거
- Shared Hero transform 제거
- 즉시 route 이동 + detail fade

---

# 12. Loading

## Strategy

Home은 static-heavy여야 한다.

Theme content를 static curated configuration으로 제공하는 경우:

```text
Page text immediately available
Image Placeholder → Progressive Image Reveal
```

API-driven인 경우에만 Theme skeleton 사용.

## Page-level

Full-page spinner 금지.

Header 및 page shell은 즉시 표시.

## Hero

```text
HeroMedia
↔ fixed-size HeroMediaPlaceholder
```

- hero geometry 사전 확보
- 이미지 load 후 height 변화 없음
- text가 static이면 text skeleton 불필요

## Theme cards

동적 data라면 4개의 고정 slot:

```text
ThemeEditorialCard
↔ ThemeEditorialCardSkeleton
```

각 카드 final geometry와 최대한 일치.

## Image placeholder

- Theme local accent / warm neutral 기반
- browser broken image UI 노출 금지

## Layout shift prevention

- image aspect ratio 사전 지정
- Hero min-height 사전 확보
- font fallback metric 고려

---

# 13. Empty

## Theme collection empty

Applicable: exceptional only.

4개 Theme가 product baseline이므로 정상 Empty가 아니다.

Trigger:

- dynamic data source를 사용하는데 0 items 반환
- configuration mismatch

Copy:

```text
현재 표시할 여행 상품이 없습니다.
잠시 후 다시 확인해주세요.
```

CTA:

```text
다시 시도
```

Preserved UI:

- Header
- Hero
- Footer

[CONFIRMED]

4개 Theme 자체가 baseline이므로 empty를 일반적인 제품 상태로 취급하지 않는다.

---

# 14. Error

## Network

Theme data가 network-driven인 경우:

```text
여행 상품을 불러오지 못했습니다.
연결 상태를 확인하고 다시 시도해주세요.
```

Recovery: Theme section retry.

Hero/static brand content 유지.

## Server

```text
잠시 문제가 발생했습니다.
잠시 후 다시 시도해주세요.
```

Recovery: local retry.

## Not Found

N/A — `/` root 자체에는 valid ID가 없음.

## Validation

N/A.

## Conflict

N/A.

## Unauthorized

N/A — Home public.

## Offline

Static/cached content가 있으면 유지.

동적 Tour data가 없으면:

```text
오프라인 상태입니다.
표시된 여행 정보가 최신이 아닐 수 있습니다.
```

## Image Failure

Hero:

- warm neutral/theme-tinted surface
- hero copy 유지
- broken image icon 금지

Theme card:

- local accent fallback
- theme title/CTA 유지

## Partial Failure

Theme image 한 장 실패 → 해당 image만 fallback.

한 카드 data 실패 → 다른 3개 유지.

---

# 15. Retrying / Refreshing

## Retry scope

실패한 Theme section/card만.

## During retry

해당 영역 skeleton 또는 image placeholder.

## Existing content preserved

가능하면 Yes.

## Refreshing

동적 Tour data를 background refetch하는 경우:
- 기존 4개 card 유지
- 전체 skeleton reset 금지

## Stale data

Theme editorial copy는 비교적 stale 허용 가능.

가격/일정은 Home에서 노출하지 않으므로 freshness-sensitive data를 Home에 두지 않는 것이 기본 방향.

---

# 16. Edge Cases

## Direct URL

`/` 정상 렌더.

## Refresh

Hero와 theme layout 동일하게 복구.

## Very narrow viewport

- headline overflow 금지
- CTA wrap 금지
- theme title 2줄 허용
- image focal point crop 조정

## Very wide viewport

- text line-length 제한
- Hero image만 무한히 늘어나지 않게 focal/crop 유지
- section container 최대 폭 유지

## Slow image

placeholder 유지, text/CTA 사용 가능.

## Image failure

branded fallback.

## Rapid Theme click

첫 navigation 이후 추가 click 무시 또는 router transition 상태에서 disable.

중복 route push 금지.

## Browser Back from Tour Detail

Home으로 실제 history가 존재한다면:
- 이전 scroll 위치 복원 권장
- Theme card 위치 context 유지

## Header over bright/dark image

hero asset별 text contrast metadata 또는 overlay strategy 필요.

이 값은 visual asset 단계에서 검증.

---

# 17. Accessibility

## Structure

```html
<header>
<nav>
<main>
<section aria-labelledby=...>
<footer>
```

Hero headline은 page `<h1>`.

Theme section heading은 `<h2>`.

Theme titles는 `<h3>`.

## Keyboard

Tab order:

```text
Header links
→ Hero CTA
→ Theme card 1
→ Theme card 2
→ Theme card 3
→ Theme card 4
→ Customization CTA
→ Footer links
```

Visual layout이 비대칭이어도 DOM order는 읽기 순서와 일치.

## Screen Reader

Theme card accessible name 예:

```text
Honeymoon Romance 여행 상세 보기
```

단순 `Explore`만 읽히지 않게 한다.

## Images

Decorative Hero:
- copy가 별도로 의미를 제공하면 empty alt 가능

Theme card image:
- 이미지 자체가 정보성이라면 Theme/scene 설명
- title을 그대로 반복하는 불필요한 alt 금지

## Contrast

Hero text는 실제 이미지별 WCAG contrast 검증.

필요 시 overlay.

## Reduced Motion

CP4 계약 준수.

## Touch

모든 interactive target 44×44px 이상.

---

# 18. API / Shared Contract Dependency

| Need | Current Source | Status | Frontend Impact |
|---|---|---|---|
| Theme 4종 | Shared requirements/business rules | CONFIRMED | 카드 4개 구성 |
| Theme identity / type | Domain | CONFIRMED | route/card 의미 |
| Theme preview services | 원본 프로젝트 요구사항 | CONFIRMED | card/support copy에 사용 가능 |
| `GET /api/v1/tours` | API skeleton | CONFIRMED endpoint skeleton | dynamic collection 연결 가능 |
| Tours response DTO | API v0.2 | BLOCKED BY SHARED CONTRACT | field mapping 미확정 |
| Hero/card image asset source | 없음 | TBD | Frontend asset pipeline 결정 필요 |
| Home editorial copy | Frontend planning | FRONTEND PROPOSAL | 공통 Business Rule 영향 없음 |
| Auth state shape | auth contract | BLOCKED BY SHARED CONTRACT | header account 표시 integration 미확정 |

---

# 19. TBD / Blocker

## TBD

### Asset source

실제 Hero 및 Theme imagery를:
- repository static assets
- CMS-equivalent data
- Backend URL

중 무엇으로 관리할지 미확정.

화면 구현 자체는 mock/placeholder asset으로 가능.

### Final brand copy

Hero headline/subcopy 최종 문안.

현재 문구는 Frontend Proposal.

## Blocked by Shared Contract

- `GET /api/v1/tours` DTO
- 인증 상태 DTO/세션 처리 방식

## Frontend Proposal Awaiting Final Audit

- Desktop editorial asymmetric composition
- Hero 78–90svh range
- mobile no-carousel rule
- Home에 일정/가격을 노출하지 않는 정보 절제

이 항목들은 공통 계약 변경 없이 프론트 내부에서 확정 가능하며
CP6-G consistency audit에서 다시 확인한다.

---

## CP6-H Contract Gate — Theme vs TourProduct

**P0 contract gate — v0.1.1 is present on `docs/main` and is treated as the active planning baseline.**

The latest shared proposal distinguishes:

```text
Theme
1 : N
TourProduct
```

and `/api/v1/tours` represents `TourProduct`, not four Theme records.

This screen spec currently uses the four Theme values as the primary curated navigation model.
Do not hard-code “one Theme = one TourProduct” in the data layer until the approved baseline is confirmed.

Required team decision:

```text
Theme discovery
→ how one or more TourProducts are selected/listed
→ TourProduct detail route
```

Frontend may keep the visual Theme-first concept, but runtime routing/data mapping must follow the approved contract.


# 20. Acceptance Criteria

## Functional

- [ ] `/` direct access가 정상 동작한다.
- [ ] Hero CTA는 `/tours`로 이동한다.
- [ ] 4개 Theme card는 각각 올바른 `/tours/:tourId`로 이동한다.
- [ ] Header의 Tours/My Trips/Auth entry가 동작한다.
- [ ] Theme card rapid click이 중복 navigation을 만들지 않는다.

## Visual / Design System

- [ ] Warm Ivory / Charcoal system을 따른다.
- [ ] Primary CTA는 Charcoal이다.
- [ ] Home을 2×2 동일 카드 grid로 만들지 않는다.
- [ ] Theme identity는 과도한 Theme color보다 photography 중심이다.
- [ ] heavy shadow / gold gradient / excessive glass가 없다.
- [ ] desktop에서 충분한 editorial whitespace가 유지된다.

## Loading / State

- [ ] Hero image가 늦어도 layout shift가 없다.
- [ ] dynamic Theme load 시 4-slot skeleton geometry가 유지된다.
- [ ] browser default broken-image icon이 노출되지 않는다.

## Error / Recovery

- [ ] Theme section만 실패할 경우 Hero/Header는 유지된다.
- [ ] retry는 실패한 영역만 다시 로드한다.
- [ ] offline/cached data 상황에서 기존 성공 데이터를 제거하지 않는다.

## Responsive

- [ ] mobile에서 Theme 4개를 모두 세로로 탐색할 수 있다.
- [ ] horizontal carousel에 Theme가 숨지 않는다.
- [ ] Hero text/CTA가 320px급 narrow viewport에서도 잘리지 않는다.
- [ ] header touch target이 44×44px 이상이다.

## Accessibility

- [ ] H1/H2/H3 hierarchy가 올바르다.
- [ ] 비대칭 visual layout과 DOM reading order가 충돌하지 않는다.
- [ ] Theme card의 accessible name에 Theme명이 포함된다.
- [ ] focus-visible이 명확하다.
- [ ] reduced-motion에서 shared/parallax motion이 제거된다.
- [ ] 실제 Hero image와 text contrast를 검증한다.

## Navigation / Draft

- [ ] Tour Detail에서 Back했을 때 가능한 경우 Home scroll context가 복구된다.
- [ ] Shared Hero animation 실패가 route navigation을 막지 않는다.

## Contract Safety

- [ ] 가격/일정/목적지 등 미확정 product data를 Home이 임의 생성하지 않는다.
- [ ] Home copy가 Business Rule처럼 취급되지 않는다.
- [ ] API DTO를 문서가 임의 정의하지 않는다.

---

# Screen Status

```text
Ready
```

CP6-A 기준 Home Screen Spec 완료.
