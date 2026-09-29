# Mister World Frontend — CP4 Foundation Implementation Plan

> Status: **COMPLETE**  
> Checkpoint: **CP4 — Foundation Implementation Plan / PR-01 Execution Spec**  
> Date: **2026-09-29**  
> Target repository: `WonhoOne/frontend`  
> Shared baseline: `WonhoOne/docs/main` **v0.1.2**  
> Shared docs commit reviewed: `46fd61af7dc0ac4770305e7088c4e4ded9b78892`  
> Depends on:
> - `CP0-IMPLEMENTATION-BASELINE.md`
> - `CP1-CODE-QUALITY-STANDARDS.md`
> - `CP2-FRONTEND-ARCHITECTURE-PLAN.md`
> - `CP3-STATE-DATA-ARCHITECTURE.md`
> - `docs/planning/04-DESIGN-SYSTEM.md`
> - `docs/planning/05-MOTION-SYSTEM.md`
> - `docs/planning/06-UI-STATES.md`
> - `docs/planning/10-RESPONSIVE-ACCESSIBILITY.md`
> - `docs/planning/11-QA-ACCEPTANCE.md`
> - `docs/IMPLEMENTATION-START-HANDOFF.md`
>
> Implementation target: **PR-01 — Frontend Foundation**
>
> Next checkpoint: **CP5 — Implementation Roadmap**

---

# 1. Purpose

CP4의 목적은 첫 구현 PR인 **PR-01 Foundation**을
구현자가 추가 설계 없이 실행할 수 있을 정도로 상세하게 정의하는 것이다.

PR-01의 성공 기준은
“첫 화면이 예쁘게 나오는 것”이 아니다.

성공 기준:

```text
모든 이후 화면이 올라갈 Runtime이 안정적이다.
Design Token이 중앙화되어 있다.
Shared Primitive가 접근성 기준을 만족한다.
Router/App Provider 구조가 살아 있다.
Loading/Image/Motion 기반이 존재한다.
Mock/Test/E2E 도구가 실제로 실행된다.
Architecture boundary가 lint/review에서 보인다.
```

PR-01에서는 실제 Product Screen 구현을 서두르지 않는다.

---

# 2. PR-01 Scope

포함:

```text
Node/npm development baseline
React + TypeScript + Vite scaffold
package.json / package-lock.json
TypeScript config
ESLint flat config
Prettier
import alias

main.tsx
App
AppProviders
TanStack Query provider
Router shell
Route placeholders
Not Found baseline
App Error Boundary

global/reset styles
Design Token CSS variables
Motion Token CSS variables
Reduced Motion helper

PageContainer
Grid
Button
TextLink
TextField
OptionCard
Dialog
BottomSheet
Skeleton
ImageFrame

GlobalHeader
TransactionHeader
Skip Link / main landmark baseline

MSW browser/test infrastructure
Vitest
React Testing Library
Playwright
Foundation tests

README local setup
```

---

# 3. PR-01 Explicitly Out of Scope

다음은 구현하지 않는다.

```text
full Home
full Tours
full Tour Detail
Configure business UI
ReservationDraft implementation
Reservation submit
Login real API integration
Signup real API integration
Travel History integration
real Backend DTO
real Backend adapter
price calculation
Loyalty discount
official option catalog
participantCount input placement/default
Reservation status enum
Voice/STT
Shared Hero production transition
final image assets
payment
refund
cancellation
```

PR-01은 Foundation이다.

---

# 4. Toolchain Decision

Package manager:

```text
npm
```

이유:

```text
Node와 함께 제공
팀 onboarding이 단순
별도 package-manager 설치 불필요
package-lock으로 reproducible install
```

Lockfile:

```text
package-lock.json COMMIT
```

Install:

```text
npm ci
```

를 CI/clean validation 기준으로 한다.

---

# 5. Node Baseline

Foundation 개발 기준:

```text
Node.js 24.21.0 LTS
```

Repository에:

```text
.nvmrc
```

추가.

내용:

```text
24.21.0
```

`package.json` engines는:

```json
{
  "engines": {
    "node": ">=24.21.0 <25"
  }
}
```

를 기본으로 한다.

이유:

- Current가 아니라 LTS를 사용
- Vite/ESLint 등 최신 toolchain 요구를 충분히 만족
- 팀 환경 재현성 확보

Node 22 LTS도 ecosystem상 동작할 수 있으나
Repository reference version은 하나로 고정한다.

---

# 6. Package Version Policy

PR-01에서 dependency는
**2026-09-29 확인한 안정 버전**을 기준으로 exact pin한다.

`package-lock.json`과 함께
동일 설치 결과를 재현한다.

`.npmrc`:

```text
save-exact=true
```

를 사용한다.

Dependency upgrade는 별도 PR 또는 명확한 목적이 있을 때 수행한다.

---

# 7. Runtime Dependencies

## React

```text
react       19.3.0
react-dom   19.3.0
```

## Router

```text
react-router 8.4.0
```

Data Mode의:

```text
createBrowserRouter
RouterProvider
```

를 사용한다.

React Router loader/action에 Backend architecture를 몰아넣지는 않는다.

Server State는 CP3에 따라 TanStack Query가 담당한다.

## Server State

```text
@tanstack/react-query 5.104.0
```

PR-01에서는 QueryProvider 기반만 만든다.

실제 Tour/Reservation query는 이후 Feature PR에서 추가한다.

## Accessible Overlay Primitive

```text
@radix-ui/react-dialog 1.1.23
```

사용 대상:

```text
Dialog
BottomSheet
```

이유:

- focus trap
- focus guards
- portal
- dismissable layer
- focus return
- aria/dialog behavior

를 저수준부터 직접 재구현하지 않기 위해 사용한다.

Project의 visual style은 직접 작성한다.

Radix default visual design은 사용하지 않는다.

---

# 8. Development Dependencies

Foundation target versions:

```text
vite                         8.3.1
@vitejs/plugin-react         6.1.1

typescript                   5.9.3
@types/react                 19.3.0
@types/react-dom             19.3.0

eslint                       10.10.0
@eslint/js                   10.0.1
typescript-eslint            8.70.1
eslint-plugin-react-hooks    7.1.1
eslint-plugin-react-refresh  0.5.7
globals                      17.12.0
prettier                     3.9.9

vitest                       5.0.2
jsdom                        30.1.1
@testing-library/react       16.3.3
@testing-library/jest-dom    7.0.1
@testing-library/user-event  14.6.7

@playwright/test             1.63.0
msw                          2.15.0
```

---

# 9. Why TypeScript 5.9.3 Instead of Latest 7.x

2026-09-29 기준 npm의 최신 stable TypeScript는 7.x 계열이다.

하지만 현재 `typescript-eslint` 공식 지원 범위는:

```text
>=4.8.4 <6.1.0
```

이다.

따라서 PR-01은:

```text
TypeScript 5.9.3
```

을 선택한다.

원칙:

> 최신 숫자보다 Toolchain 전체의 공식 호환성을 우선한다.

TypeScript 6+/7+ 전환은
typescript-eslint 공식 지원이 닫힌 뒤 별도 upgrade로 처리한다.

---

# 10. No Motion Library in PR-01

PR-01에서는 Framer Motion/Motion 같은 별도 animation library를 추가하지 않는다.

Foundation에 필요한 것:

```text
duration token
easing token
CSS transition
Dialog/Sheet enter/exit
Reduced Motion
Skeleton shimmer
```

은 CSS로 충분하다.

Shared Hero Transition 등
복잡한 cross-route motion이 실제 필요해지는 PR-02/PR-03에서
library 도입 필요성을 재평가한다.

CP1의 Delayed Dependency 원칙을 따른다.

---

# 11. No CSS Framework

다음은 도입하지 않는다.

```text
Tailwind
Bootstrap
Material UI
Chakra
Ant Design
large design-system framework
```

기본:

```text
CSS Custom Properties
+
CSS Modules
```

이유:

- 기획의 custom visual direction을 그대로 구현
- Design Token ownership 명확
- runtime dependency 최소화
- class name scope
- 사람이 CSS를 직접 추적 가능

---

# 12. Planned Root Files

PR-01 예상 root:

```text
frontend/
├── .editorconfig
├── .gitignore
├── .npmrc
├── .nvmrc
├── .prettierrc.json
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── playwright.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── README.md
├── public/
├── src/
└── tests/
```

기존 파일이 이미 존재하면
새 파일을 중복 생성하지 않고 갱신한다.

---

# 13. package.json Scripts

기본 scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc -b --pretty false",
    "lint": "eslint .",
    "format": "prettier --check .",
    "format:write": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "verify": "npm run typecheck && npm run lint && npm run format && npm run test && npm run build"
  }
}
```

`verify`는 PR-01의 기본 local gate다.

E2E는 별도:

```text
npm run test:e2e
```

로 실행한다.

---

# 14. TypeScript Configuration

기본:

```text
strict = true
noUncheckedIndexedAccess = true
exactOptionalPropertyTypes = true
noFallthroughCasesInSwitch = true
noImplicitOverride = true
useDefineForClassFields = true
isolatedModules = true
verbatimModuleSyntax = true
```

Browser target은
Vite modern baseline에 맞춰:

```text
ES2022 이상
```

을 사용한다.

`skipLibCheck`는 ecosystem type conflict가 없다면
가능하면 false를 검토하되,
실제 dependency에서 불필요한 외부 declaration noise가 크면 true 허용.

결정은 scaffold에서 실제 `tsc` 결과로 확정한다.

---

# 15. TypeScript Project Split

Vite config와 browser app environment가 다르므로:

```text
tsconfig.json
├── tsconfig.app.json
└── tsconfig.node.json
```

project reference 형태를 사용한다.

`src`:

```text
DOM
ES
React JSX
```

`vite.config.ts` 등:

```text
Node
```

environment를 분리한다.

이 분리는 실제 environment 차이가 있으므로
CP1의 “의미 없는 파일 분할”에 해당하지 않는다.

---

# 16. Import Alias

단일 alias:

```text
@/ → src/
```

Vite와 TypeScript 양쪽에 동일하게 설정한다.

예:

```ts
import { Button } from '@/shared/ui';
```

복수 alias는 만들지 않는다.

---

# 17. ESLint Strategy

ESLint Flat Config를 사용한다.

기본 config:

```text
@eslint/js recommended
typescript-eslint recommended type-checked
React Hooks recommended
React Refresh Vite config
browser globals
```

추가 프로젝트 rules:

```text
no explicit any
consistent type imports
no floating promises
no misused promises
no unused vars
no console in production source except explicitly allowed error/log boundary
```

---

# 18. Architecture Import Linting

PR-01에서 최소한의 layer boundary를 `no-restricted-imports`로 넣는다.

예:

## `src/shared/**`

금지:

```text
@/features/*
@/pages/*
@/app/*
@/integrations/*
```

## `src/features/**`

금지:

```text
@/pages/*
@/app/*
```

## `src/integrations/**`

금지:

```text
@/pages/*
@/app/*
feature runtime UI/state
```

type-only exception은
ESLint rule capability와 실제 필요가 생긴 시점에 최소 범위로 설정한다.

PR-01에서 아직 Adapter가 거의 없으므로
복잡한 custom rule은 만들지 않는다.

---

# 19. Prettier

Prettier는 style debate를 줄이기 위한 formatter다.

기본:

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "all"
}
```

기타 option은 기본값을 우선한다.

Formatting preference를 과도하게 커스터마이징하지 않는다.

---

# 20. Application Bootstrap

예상 흐름:

```text
index.html
→ src/main.tsx
→ optional dev mock bootstrap
→ React StrictMode
→ App
→ AppErrorBoundary
→ AppProviders
→ AppRouter
```

`main.tsx`에는 Feature logic을 넣지 않는다.

---

# 21. Proposed `src/` Foundation Tree

```text
src/
├── main.tsx
├── vite-env.d.ts
│
├── app/
│   ├── App.tsx
│   ├── config/
│   │   └── env.ts
│   ├── errors/
│   │   ├── AppErrorBoundary.tsx
│   │   └── AppErrorBoundary.test.tsx
│   ├── providers/
│   │   ├── AppProviders.tsx
│   │   └── queryClient.ts
│   ├── router/
│   │   ├── AppRouter.tsx
│   │   ├── RoutePlaceholder.tsx
│   │   └── routes.ts
│   ├── shell/
│   │   ├── GlobalHeader.tsx
│   │   ├── GlobalHeader.module.css
│   │   ├── TransactionHeader.tsx
│   │   └── TransactionHeader.module.css
│   └── styles/
│       ├── tokens.css
│       └── global.css
│
├── pages/
│   └── existing route skeleton folders
│
├── features/
│   └── existing feature skeleton folders
│
├── integrations/
│   └── existing integration skeleton folders
│
├── mocks/
│   ├── browser.ts
│   ├── handlers.ts
│   ├── server.ts
│   └── startMocking.ts
│
├── shared/
│   ├── motion/
│   │   ├── motion.css
│   │   ├── useReducedMotion.ts
│   │   ├── useReducedMotion.test.ts
│   │   └── index.ts
│   └── ui/
│       ├── Button/
│       ├── TextLink/
│       ├── TextField/
│       ├── OptionCard/
│       ├── Dialog/
│       ├── BottomSheet/
│       ├── Skeleton/
│       ├── ImageFrame/
│       ├── PageContainer/
│       ├── Grid/
│       └── index.ts
│
└── test/
    └── setup.ts

tests/
└── e2e/
    └── foundation.spec.ts
```

실제 구현 중 지나치게 작은 파일이 생기면
CP1 원칙에 따라 합칠 수 있다.

---

# 22. AppProviders

PR-01의 provider는 최소화한다.

```text
QueryClientProvider
```

필수.

아직 넣지 않음:

```text
AuthProvider real session logic
ReservationDraftProvider
VoiceProvider
large global UI store
```

필요 없는 Context를 Foundation에서 미리 만들지 않는다.

---

# 23. Query Client Defaults

Foundation `QueryClient` 기본값:

```text
queries:
  retry: custom function
  refetchOnWindowFocus: true
  refetchOnReconnect: true

mutations:
  retry: 0
```

단 CP3의 F0/F1/F2/F3 freshness는
각 Feature Query에서 명시한다.

Global `staleTime` 하나로
모든 resource를 동일하게 취급하지 않는다.

---

# 24. Global Retry Function

Foundation에 generic helper를 둘 수 있다.

의미:

```text
401/403/404/409/422 → false
ContractMappingError → false
transient network/5xx → failureCount < 1
```

실제 HTTP normalized error가 아직 없으므로
PR-01에서는 기본 안전 retry를 최소화하고,
Integration Error Model이 도입되는 PR에서 확장한다.

중요:

```text
mutation retry = 0
```

는 처음부터 적용한다.

---

# 25. Router Mode

React Router Data Mode:

```text
createBrowserRouter
RouterProvider
```

를 사용한다.

이유:

- route config 중앙화
- future route error/lazy support
- browser navigation behavior 명시적
- Foundation에서 실제 data loader에 의존하지 않음

Server data는 React Router loader가 아니라
TanStack Query Feature layer가 기본 owner다.

---

# 26. Foundation Routes

다음 route 모두 mount되는 것을 검증한다.

```text
/
 /tours
 /tours/:tourId
 /tours/:tourId/configure
 /reservation/review
 /reservation/:reservationId/success
 /reservations/:reservationId
 /login
 /signup
 /my-trips
```

PR-01에서는:

```text
RoutePlaceholder
```

를 사용한다.

Placeholder는 production UX가 아니다.

목적:

```text
route matching
param handling
App Shell
focus/main landmark
E2E smoke
```

검증.

---

# 27. RoutePlaceholder

`RoutePlaceholder`는 Development/Foundation 임시 component다.

표시:

```text
Screen name
Route name
Foundation status
```

정도로 제한한다.

가짜 Product data를 넣지 않는다.

실제 화면 구현 PR에서 제거된다.

---

# 28. Not Found

Foundation에서 기본 404 route를 만든다.

최종 카피/visual polish는 이후 가능.

필수:

```text
semantic H1
Home/Tours navigation
main landmark
keyboard accessible links
```

---

# 29. Route Focus Baseline

SPA route 변경 후
focus가 body에 유실되는 문제를 고려한다.

PR-01에서는:

```text
main id="main-content"
skip link
Page H1
```

기반을 만든다.

실제 full route-focus manager는
PR-02 App Runtime에서 마무리한다.

Foundation에서 accessibility hook 확장까지 과도하게 만들지 않는다.

---

# 30. Design Token File

`src/app/styles/tokens.css`

에는 Design System의 shared variables를 중앙화한다.

Page/Primitive에서
hex/spacing 값을 반복하지 않는다.

---

# 31. Color Tokens

최소 다음을 그대로 정의한다.

```css
--mw-canvas: #f6f3ed;
--mw-surface: #fbf9f5;
--mw-surface-elevated: #fffdfc;
--mw-surface-muted: #eee9e1;

--mw-ink: #191918;
--mw-ink-soft: #34322f;
--mw-text-secondary: #6e6961;
--mw-text-tertiary: #918a80;

--mw-border: #ddd7ce;
--mw-border-strong: #bdb5a9;

--mw-accent: #9b7a4b;
--mw-accent-hover: #87673c;
--mw-accent-soft: #eee3d2;
--mw-accent-faint: #f6efe4;

--mw-success: #2f6b50;
--mw-warning: #9b672f;
--mw-danger: #a34b44;
--mw-info: #496a7d;
```

soft semantic tokens도 Design System 값으로 함께 정의한다.

---

# 32. Theme Local Accent Tokens

```css
--mw-theme-honeymoon: #9a6c68;
--mw-theme-parents: #6f7d68;--mw-theme-golf: #365744;
--mw-theme-trekking: #596971;
```

Foundation에서는 token만 정의한다.

Theme page 전체 배경을 해당 color로 바꾸지 않는다.

---

# 33. Typography Tokens

Font stacks:

```css
--mw-font-ui:
  "Pretendard Variable",
  Pretendard,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  "Noto Sans KR",
  sans-serif;

--mw-font-editorial:
  "Instrument Serif",
  "Times New Roman",
  serif;
```

PR-01에서는 font binary를 Repository에 넣지 않는다.

외부 font loading도
license/deployment policy를 확인하기 전 production dependency로 확정하지 않는다.

Fallback 상태에서도 layout이 정상이어야 한다.

---

# 34. Typography Scale

Desktop:

```text
96 / 72 / 56
40 / 32 / 24 / 20
18 / 16 / 14
14 / 12 / 11
```

Mobile:

```text
58 / 48 / 40
32 / 28 / 22 / 19
17 / 16 / 14 ...
```

CSS Custom Property로
font-size/line-height를 묶어 관리한다.

가격/인원 등:

```css
font-variant-numeric: tabular-nums;
```

helper/token을 제공한다.

---

# 35. Spacing Tokens

```text
0
4
8
12
16
20
24
32
40
48
64
80
96
128
160
```

Token naming은
기존 Design System:

```text
space-0
space-1
space-2
...
space-40
```

를 따른다.

---

# 36. Container Tokens

```text
wide         1440px
main         1280px
transaction  1180px
reading       760px
auth          520px
```

Page gutters:

```text
<640         20px
640–1023     32px
1024–1439    48px
>=1440       64px
```

---

# 37. Breakpoint Tokens

Documentation constants:

```text
640
768
1024
1280
1440
```

CSS Custom Property는 media query에서 직접 사용할 수 없으므로
breakpoint 값을 주석/stylesheet section에서 중앙 관리한다.

JS에서 breakpoint를 중복할 필요가 생기면
CP2의 shared config 원칙에 따라
단일 source를 검토한다.

PR-01에서 JS breakpoint registry를 미리 만들지 않는다.

---

# 38. Radius Tokens

```text
4
8
12
18
28
999
```

모든 element에 큰 radius를 적용하지 않는다.

---

# 39. Elevation Tokens

Design System의:

```text
Elevation 1
Elevation 2
Elevation 3
```

shadow를 CSS variables로 고정한다.

Dialog:

```text
Elevation 3
```

Floating summary later:

```text
Elevation 2
```

---

# 40. Z-Index Tokens

```text
base      0
raised   10
sticky   20
dropdown 40
header   50
backdrop 80
modal    90
toast   100
```

임의:

```css
z-index: 9999;
```

금지.

---

# 41. Focus Token

기본:

```css
outline: 2px solid #9b7a4b;
outline-offset: 3px;
```

`:focus-visible` 사용.

`outline: none`만 남기는 구현 금지.

---

# 42. Motion Tokens

`src/shared/motion/motion.css`

Duration:

```text
80ms
140ms
200ms
280ms
360ms
480ms
620ms
820ms
```

Easing:

```css
--mw-ease-standard: cubic-bezier(0.2, 0, 0, 1);
--mw-ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
--mw-ease-exit: cubic-bezier(0.4, 0, 1, 1);
--mw-ease-cinematic: cubic-bezier(0.22, 1, 0.36, 1);
```

Component마다 임의 duration 생성 금지.

---

# 43. Reduced Motion CSS

```css
@media (prefers-reduced-motion: reduce) {
  ...
}
```

기본 규칙:

```text
parallax 제거
shimmer animation 제거
spring/bounce 제거
long transform 제거
transition은 instant 또는 80–140ms opacity 수준
```

---

# 44. `useReducedMotion`

JS transition이 필요한 미래를 위해
small shared hook을 Foundation에서 제공한다.

책임:

```text
prefers-reduced-motion media query subscribe
boolean 반환
cleanup
```

Business logic 없음.

Test:

```text
initial value
media query change
cleanup
```

---

# 45. Global CSS Baseline

`global.css`:

```text
box-sizing
body margin reset
body background
body text
font smoothing if appropriate
button/input inherit font
img max-width
hidden attribute respect
focus-visible baseline
selection optional
```

과도한 opinionated reset을 쓰지 않는다.

---

# 46. PageContainer

책임:

```text
max-width
responsive horizontal gutter
center alignment
```

Variants:

```text
wide
main
transaction
reading
auth
```

Props는 business 의미를 가지지 않는다.

---

# 47. Grid

Grid baseline:

```text
mobile  4 columns / 16px
tablet  8 columns / 20px
desktop 12 columns / 24px
```

Grid primitive는
모든 layout을 강제하는 framework가 아니다.

필요한 Section에서만 사용한다.

---

# 48. Button

Semantic element:

```html
<button>
```

기본 variants:

```text
primary
secondary
quiet
destructive
```

size:

```text
small
medium
large
```

states:

```text
default
hover
pressed
focus-visible
disabled
loading
```

---

# 49. Button Loading

Loading 시:

```text
aria-disabled 또는 disabled
label 변경
작은 inline indicator 가능
폭 급변 방지
```

Foundation에서는 generic loading mechanic까지만 제공한다.

Reservation mutation 의미를 알지 않는다.

---

# 50. TextLink

Semantic:

```text
internal navigation → React Router Link
external/real URL → anchor
```

Foundation `TextLink`는 Router Link 기반 internal navigation을 우선한다.

button처럼 보이는 navigation을 만들지 않는다.

---

# 51. TextField

구조:

```text
Label
Input
Helper/Error
```

필수:

```text
visible label
id/htmlFor
aria-describedby
aria-invalid
disabled
required indicator only when semantically needed
```

Placeholder-only label 금지.

---

# 52. TextField API

예상:

```text
label
name
value/defaultValue
onChange
error
helperText
required
disabled
autoComplete
inputMode
type
```

Credential-specific `autoComplete`은
H-04 Auth contract 전 임의 결정하지 않는다.

---

# 53. OptionCard — Architecture Decision

`OptionCard`는
**selection semantics 자체를 발명하지 않는 visual shell**로 구현한다.

이유:

같은 visual shell이 향후:

```text
radio
checkbox
other explicit control
```

과 함께 사용될 수 있다.

구조:

```text
native input/button semantics
inside/alongside
OptionCard visual surface
```

OptionCard가 소유:

```text
selected visual
disabled visual
invalid visual
focus-within
content layout
```

소유하지 않음:

```text
TourStyle Business Rule
keyboard roving algorithm
Reservation state
```

가능하면 Feature는 native radio/checkbox semantics를 사용한다.

---

# 54. Dialog

기반:

```text
@radix-ui/react-dialog
```

Project wrapper가 소유:

```text
Mister World visual style
spacing
radius
overlay
close button
title/description composition
motion tokens
```

Radix가 제공하는 low-level behavior를 활용:

```text
portal
focus containment
focus return
Escape dismissal
outside interaction control
```

---

# 55. Dialog API Rules

필수:

```text
open
onOpenChange
title
description optional
children
close label
```

Critical transaction에서는
outside click/Escape behavior를 Feature가 명시적으로 제어할 수 있다.

Dialog에서 사용자가 빠져나갈
명시적 close path는 항상 존재한다.

---

# 56. BottomSheet

BottomSheet는 별도 접근성 engine을 만들지 않는다.

Radix Dialog 기반을 공유하고
visual placement만:

```text
bottom anchored
full width mobile
max-height 88dvh
top radius 24px
```

로 바꾼다.

필수:

```text
explicit close button
scrollable content region
safe-area bottom padding
```

Drag handle은 장식일 수 있지만
close control을 대체하지 않는다.

---

# 57. No Nested Focus Traps

Dialog 내부에서 또 다른 modal Dialog를
무분별하게 열지 않는다.

Foundation test/documentation에서
nested modal은 unsupported 기본 패턴으로 둔다.

실제 Login → Previous Trips는
동시에 겹치지 않고 순차적으로 표현한다.

---

# 58. Skeleton

Generic primitive:

```text
line
block
circle
```

정도의 shape variant만 제공한다.

실제:

```text
TourCardSkeleton
TourHeroSkeleton
```

은 Feature가 조합한다.

---

# 59. Skeleton Accessibility

각 Skeleton element:

```text
aria-hidden="true"
```

Loading 의미는
부모 section에서 필요 시:

```text
aria-busy
status text
```

로 제공한다.

수십 개 Skeleton을 Screen Reader가 읽게 하지 않는다.

---

# 60. Skeleton Motion

Default:

```text
low-contrast shimmer
1600–2000ms
```

Reduced Motion:

```text
static surface
```

Skeleton이 실제 content보다 과도하게 밝게 움직이지 않는다.

---

# 61. ImageFrame

공통 상태:

```text
Placeholder
Loading
Loaded
Failed
```

Props 개념:

```text
src
alt
aspectRatio
objectFit
priority/loading
fallback
radius
```

브라우저 broken image icon을 노출하지 않는다.

---

# 62. ImageFrame Accessibility

Decorative image:

```text
alt=""
```

Information image:

```text
meaningful alt
```

Feature가 의미 있는 alt를 제공한다.

ImageFrame이 파일명을 alt로 자동 생성하지 않는다.

---

# 63. Image Failure

Failed state:

```text
neutral surface
optional Feature-provided fallback
```

이미지 실패는
Page Query Error로 승격하지 않는다.

---

# 64. App Error Boundary

React render/runtime unexpected error 처리.

Class Error Boundary 사용 가능.

주석으로 설명:

```text
React의 stable Error Boundary mechanism 때문에 class component 사용
```

Development:

```text
safe console error
```

Production:

```text
stack detail 숨김
calm fallback
Home/Reload action
```

API query error를 여기로 던지지 않는다.

---

# 65. GlobalHeader

Ownership:

```text
src/app/shell
```

이유:

Application navigation chrome이기 때문이다.

Foundation layout:

```text
Brand/Home
Tours
My Trips
Login/Account placeholder
```

Auth state를 실제로 해석하지 않는다.

---

# 66. TransactionHeader

Ownership:

```text
src/app/shell
```

Responsibilities:

```text
back affordance slot
short context/title
brand/minimal utility
responsive truncation
```

Reservation/Configuration query를 직접 호출하지 않는다.

---

# 67. Skip Link

App Shell 시작에:

```text
Skip to main content
```

link 추가.

Target:

```html
<main id="main-content">
```

Keyboard focus 시 명확히 보이도록 한다.

---

# 68. Mobile Touch Baseline

모든 interactive primitive:

```text
minimum target 44 × 44px
```

Button medium:

```text
48px
```

Mobile primary later:

```text
>=52px recommended
```

Foundation test/style에서 baseline을 보존한다.

---

# 69. Viewport Units

Dialog/Sheet/fixed mobile layout에는:

```text
dvh/svh
```

를 우선 검토한다.

Rigid:

```css
height: 100vh;
```

남발 금지.

---

# 70. Safe Area

BottomSheet:

```css
padding-bottom:
  calc(var(--space-4) + env(safe-area-inset-bottom));
```

형태의 safe-area support를 Foundation부터 넣는다.

---

# 71. MSW Infrastructure

PR-01에서 MSW를 설치하고
Mock runtime boundary를 만든다.

파일:

```text
src/mocks/handlers.ts
src/mocks/browser.ts
src/mocks/server.ts
src/mocks/startMocking.ts
```

---

# 72. No Invented Backend Handler

Foundation `handlers.ts`에는
실제 Mister World API의 guessed response handler를 만들지 않는다.

초기:

```ts
export const handlers = [];
```

또는 명확한 test-only handler만 사용한다.

이유:

API path는 일부 확정됐어도
DTO shape는 대부분 아직 TBD다.

---

# 73. Browser Mock Boot

환경값:

```text
VITE_ENABLE_MOCKS=true
```

일 때 Development에서만:

```text
setupWorker
```

를 시작한다.

Production build에서는
Mock worker가 자동 활성화되지 않는다.

---

# 74. MSW Service Worker

MSW worker file은
공식 CLI로 생성한다.

```text
public/mockServiceWorker.js
```

직접 복사/수정하지 않는다.

---

# 75. Test MSW Server

Vitest:

```text
beforeAll(server.listen)
afterEach(server.resetHandlers)
afterAll(server.close)
```

Unhandled request는 Test에서 가능한 한 error로 처리해
예상하지 못한 network call을 잡는다.

---

# 76. Vitest Configuration

Environment:

```text
jsdom
```

Setup:

```textsrc/test/setup.ts
```

포함:

```text
@testing-library/jest-dom/vitest
MSW test server lifecycle
cleanup if necessary
browser API stubs only when needed
```

---

# 77. Testing Philosophy

Testing Library 원칙:

```text
implementation detail보다 사용자 observable behavior
```

Selector 우선:

```text
role
accessible name
label
text
```

피함:

```text
CSS class
private state
DOM implementation-specific selector
```

---

# 78. Foundation Component Tests

PR-01 필수 테스트:

## Button

```text
renders correct accessible role
native click/keyboard works
disabled blocks activation
loading communicates state
```

## TextField

```text
label association
error association
aria-invalid
disabled
```

## OptionCard

```text
selected visual data-state
disabled visual
focus-within
does not own business selection rule
```

## Dialog

```text
open
initial focus
Tab remains in dialog
Escape close when allowed
focus returns to trigger
accessible title
```

## BottomSheet

```text
dialog semantics
explicit close
focus return
Escape
scroll region
```

## Skeleton

```text
aria-hidden
reduced-motion class/branch
```

## ImageFrame

```text
loading
load
error fallback
alt propagation
```

---

# 79. App Foundation Tests

필수:

```text
App mounts
App Error Boundary fallback
AppProviders mounts
known routes render
unknown route renders Not Found
main landmark exists
skip link targets main
```

---

# 80. Playwright Configuration

`playwright.config.ts`:

```text
testDir = tests/e2e
baseURL = http://127.0.0.1:5173
```

`webServer`가 자동으로 Vite app을 실행.

CI:

```text
reuseExistingServer = false
```

local:

```text
reuseExistingServer = true
```

PR-01에서 browser project는
우선 Chromium을 필수 smoke로 둔다.

최종 QA 단계에서:

```text
Chromium
WebKit
Firefox
```

critical flows를 확장한다.

---

# 81. Foundation E2E Smoke

`tests/e2e/foundation.spec.ts`

최소:

```text
Home route opens
Tours route opens
dynamic Tour Detail route opens
Configure route opens
Review route opens
Reservation Success route opens
Reservation Detail route opens
Login route opens
Signup route opens
My Trips route opens
unknown route → Not Found
```

각 route에서:

```text
main landmark
H1
no runtime crash
```

를 확인한다.

---

# 82. Responsive Foundation Smoke

PR-01 E2E에서 최소:

```text
390px
1280px
```

두 viewport를 사용해:

```text
Header overflow 없음
PageContainer gutter 존재
Dialog viewport 안에 위치
BottomSheet viewport 안에 위치
```

를 확인한다.

상세 모든 viewport QA는 이후 CP7/feature PR.

---

# 83. Reduced Motion Test

테스트에서:

```text
prefers-reduced-motion: reduce
```

를 simulate한다.

확인:

```text
Skeleton animation 없음
Dialog/Sheet long motion 없음
useReducedMotion = true
```

---

# 84. Dialog Accessibility Strategy

직접 focus trap utility를 만들지 않는다.

Foundation wrapper의 테스트는
Radix implementation 자체를 재시험하는 목적이 아니라:

```text
우리 wrapper가 title/description/trigger/close를 올바르게 연결하는가
우리 style/motion이 focus behavior를 깨지 않는가
```

를 검증한다.

---

# 85. No Storybook in PR-01

Storybook은 유용할 수 있지만
Foundation 첫 PR에는 도입하지 않는다.

이유:

```text
dependency/CI/config surface 증가
현재 Vitest/RTL/Playwright로 primitive 검증 가능
```

실제 component catalog 필요성이 커지면
후속 PR에서 검토한다.

---

# 86. No Axe Dependency in PR-01

PR-01에서 automated axe package를 필수 dependency로 추가하지 않는다.

접근성 검증:

```text
native semantics
Testing Library
keyboard tests
Playwright
manual review
```

를 먼저 구성한다.

Axe automation은
CP7 QA Plan에서 전체 workflow와 함께 결정한다.

---

# 87. No Icon Library in PR-01 Unless Needed

Foundation primitive 구현에
icon package가 실제 필요하지 않으면 추가하지 않는다.

Close/back icon:

```text
small inline SVG
```

를 프로젝트 ownership 하에 사용할 수 있다.

아이콘 library는
실제 반복 사용량이 확인된 뒤 선택한다.

---

# 88. Font Loading in PR-01

Font-family stack은 구현한다.

실제:

```text
Pretendard Variable file
Instrument Serif file/CDN
```

loading은 PR-01 blocker가 아니다.

금지:

```text
license/source 확인 없이 font binary commit
```

Foundation screenshot은 fallback font에서도 깨지지 않아야 한다.

---

# 89. Environment Config

`app/config/env.ts`에서
Vite public env를 한곳에서 읽는다.

PR-01:

```text
VITE_ENABLE_MOCKS
```

정도만 필요.

아직 만들지 않음:

```text
guessed API URL
auth token config
price config
```

Backend base URL은 real integration PR에서 추가 가능하다.

---

# 90. Environment Validation

Boolean string을 Component마다 해석하지 않는다.

예:

```text
"true" → true
```

는 config boundary에서 normalize한다.

Invalid value는
development에서 명확한 warning/error를 낼 수 있다.

---

# 91. Foundation Accessibility Baseline

PR-01에서 반드시 만족:

```text
Skip Link
main landmark
one H1 per placeholder page
native buttons/links
visible labels
focus-visible
44px target
Dialog focus behavior
BottomSheet close behavior
Reduced Motion
```

---

# 92. CSS Naming

CSS Modules class는
Component 역할이 보이게 한다.

좋음:

```text
.root
.label
.helperText
.errorText
.closeButton
```

나쁨:

```text
.box1
.div2
.left
.foo
```

CP1 naming 기준 적용.

---

# 93. Comment Requirement in PR-01

주요 exported primitive에
CP1 기준 설명 주석을 작성한다.

특히:

```text
AppErrorBoundary
AppProviders
Dialog
BottomSheet
OptionCard
ImageFrame
useReducedMotion
mock bootstrap
```

에는 책임/경계를 명확히 남긴다.

---

# 94. Expected Comment Examples

Dialog:

```text
WHY:
focus trap/focus return을 직접 구현하지 않고
Radix Dialog를 behavior primitive로 사용한다.

Does not:
business mutation/navigation을 소유하지 않는다.
```

Mock:

```text
CONTRACT:
이 handlers 목록은 개발 fixture이며
Backend DTO 계약이 아니다.
```

ImageFrame:

```text
INVARIANT:
image failure alone must not convert the parent data section into API Error.
```

---

# 95. PR-01 Internal Checkpoints

PR-01을 다음 단위로 실행한다.

```text
F0 Toolchain
F1 Bootstrap
F2 Tokens & Global CSS
F3 Layout Primitives
F4 Controls
F5 Overlays
F6 Loading & Image
F7 Router & App Chrome
F8 Mock & Test Harness
F9 Foundation Audit
```

---

# 96. F0 — Toolchain

구현:

```text
package.json
package-lock
Node baseline
Vite
TypeScript
ESLint
Prettier
scripts
alias
```

Exit:

```text
npm ci
npm run typecheck
npm run lint
npm run format
```

가 실행 가능.

아직 app UI 품질은 평가하지 않는다.

---

# 97. F1 — Bootstrap

구현:

```text
index.html
main.tsx
App.tsx
AppProviders
QueryClient
AppErrorBoundary
```

Exit:

```text
npm run dev
```

로 앱 boot.

Blank crash 없음.

React StrictMode에서 불필요한 side-effect bug 없음.

---

# 98. F2 — Tokens & Global CSS

구현:

```text
tokens.css
global.css
motion.css
```

Exit:

```text
색/spacing/type/radius/shadow/z/focus/motion token 중앙화
body/base style 적용
reduced-motion baseline 존재
```

primitive에 random hex/spacing 없음.

---

# 99. F3 — Layout Primitives

구현:

```text
PageContainer
Grid
Skip Link support
```

Exit:

```text
390px gutter
768px gutter
1280px gutter
1440px+ gutter
```

기획값과 일치.

Horizontal overflow 없음.

---

# 100. F4 — Controls

구현:

```text
Button
TextLink
TextField
OptionCard
```

Exit:

```text
keyboard
focus-visible
disabled
selected/invalid where applicable
touch target
labels/error association
```

통과.

---

# 101. F5 — Overlays

구현:

```text
Dialog
BottomSheet
```

Exit:

```text
focus containment
focus return
Escape
explicit close
aria label/title
reduced motion
safe area
max-height
```

통과.

---

# 102. F6 — Loading & Image

구현:

```text
Skeleton
ImageFrame
useReducedMotion
```

Exit:

```text
Skeleton static under reduced motion
Image load/fail paths
broken icon 없음
```

테스트 통과.

---

# 103. F7 — Router & App Chrome

구현:

```text
AppRouter
routes
RoutePlaceholder
NotFound
GlobalHeader
TransactionHeader
main landmark
```

Exit:

```text
모든 route mount
dynamic route match
unknown route recovery
navigation keyboard usable
```

통과.

---

# 104. F8 — Mock & Test Harness

구현:

```text
MSW
Vitest
RTL
Playwright
test setup
E2E smoke
```

Exit:

```text
npm run test
npm run test:e2e
```

통과.

MSW handler는 실제 DTO를 추측하지 않는다.

---

# 105. F9 — Foundation Audit

검사:

```text
Architecture
Contract safety
Code readability
Comments
Responsive baseline
A11Y
Reduced motion
Tests
Build
```

Exit:

```text
npm run verify
npm run test:e2e
```

PASS.

PR template evidence 작성 가능.

---

# 106. Exact File Review Before Commit

PR-01 마지막에는
`git diff --stat`과 전체 신규 파일 목록을 확인해:

```text
의미 없는 wrapper
빈 abstraction
unused helper
duplicate token
unused dependency
```

를 제거한다.

“계획서에 적혀 있으니까”라는 이유로
사용하지 않는 파일을 남기지 않는다.

---

# 107. Dependency Review Before Commit

실제 `package.json`을 보며:

```text
사용하지 않는 dependency
동일 기능 중복 library
transitive로 충분한 package 직접 dependency
```

가 없는지 확인한다.

특히 Foundation에서 금지:

```text
Redux/Zustand
Axios
Motion library
Storybook
Tailwind
UI framework
date library
form library
schema library
```

실제 필요 전까지 추가하지 않는다.

---

# 108. Why No Axios

현재 HTTP Client가 아직 구현되지 않는다.

향후 browser `fetch`로 충분할 가능성이 높다.

Axios를 미리 설치하지 않는다.

Backend Integration CP에서
실제 필요를 검토한다.

---

# 109. Why No Form Library

PR-01의 TextField는 generic primitive다.

복잡한 Login/Signup/Configuration Form은 아직 구현하지 않는다.

React Hook Form 같은 dependency는
실제 Form complexity가 확인된 PR에서 선택한다.

---

# 110. Why No Runtime Schema Library Yet

Zod 등은
DTO v0.2가 승인되고 runtime validation이 실제 필요할 때 선택한다.

현재 DTO 자체가 미정인데
schema library부터 추가하지 않는다.

---

# 111. Foundation Security

PR-01에는 secret 없음.

확인:

```text
.env 실제 secret commit 없음
credential persistence 없음
token storage 없음
private customer payload 없음
```

`.env.example`도
실제 필요한 public env가 생길 때만 만든다.

---

# 112. Foundation Performance

PR-01 성능 목표는 micro-optimization이 아니다.

기본:

```text
no unnecessary large library
no giant asset
no font binary
no unnecessary global rerender store
no blocking animation
```

`React.memo`/`useMemo` 남발 금지.

---

# 113. Foundation Responsive Test Widths

필수 manual/automated:

```text
320
390
768
1024
1280
1440
```

Foundation에서는 primitive/app shell 기준으로 확인.

1728+는 PageContainer max-width가 정상인지 추가 확인.

---

# 114. 200% Zoom

Foundation에서 최소:

```text
Header
Dialog
BottomSheet
TextField
Button
```

이 200% zoom에서:

```text
content clipped 없음
close unreachable 없음
horizontal task scroll 없음
```

을 확인한다.

---

# 115. Mobile Software Keyboard

실제 Auth form은 아직 없지만
TextField + BottomSheet 조합에서
viewport가 완전히 망가지지 않는 구조를 유지한다.

실제 iOS/Android keyboard QA는
Login/Signup implementation 때 강화한다.

---

# 116. Foundation Visual Quality

PR-01 primitive도
“임시 Bootstrap 느낌”이면 안 된다.

검토:

```text
spacing
type hierarchy
focus ring
button proportion
input proportion
dialog restraint
sheet finish
skeleton contrast
```

하지만 Product Page photography/editorial polish는
PR-03 이후다.

---

# 117. Primary CTA Rule

Button primary:

```text
charcoal
```

금지:

```text
gold gradient
full brass primary
glassy CTA
```

Accent는 selection/focus/detail.

---

# 118. Radius Discipline

Foundation primitive마다
무조건 radius-xl을 사용하지 않는다.

예:

```text
Button/TextField → radius-md
Dialog → radius-lg/xl range
BottomSheet → top 24px
ImageFrame → context prop
```

---

# 119. Loading Discipline

PR-01에서 full-page spinner primitive를 만들지 않는다.

작은 Button spinner가 필요하면
Button 내부 implementation detail로 제한한다.

페이지 data loading은
후속 Feature의 Skeleton composition으로 해결한다.
---

# 120. Error Primitive Scope

Foundation에 Generic `ErrorState`를
무조건 만들 필요는 없다.

PR-01 필수 목록에 없고
실제 Screen error composition이 생기기 전
copy/action API를 과도하게 일반화하지 않는다.

App Error Boundary fallback은 별도다.

---

# 121. Foundation Route Placeholder Removal Plan

Placeholder는 각 Screen PR에서 제거한다.

예:

```text
PR-03
Home/Tours placeholder 제거

PR-04
Tour Detail placeholder 제거
```

최종 Release에 Foundation placeholder가 남아 있으면 FAIL.

---

# 122. PR-01 Test Matrix

| Area | Unit | Component | E2E | Manual |
|---|---:|---:|---:|---:|
| App boot |  | ✓ | ✓ | ✓ |
| Router |  | ✓ | ✓ | ✓ |
| Error Boundary | ✓ | ✓ |  | ✓ |
| Button |  | ✓ |  | ✓ |
| TextLink |  | ✓ |  | ✓ |
| TextField |  | ✓ |  | ✓ |
| OptionCard |  | ✓ |  | ✓ |
| Dialog |  | ✓ | ✓ smoke | ✓ |
| BottomSheet |  | ✓ | ✓ smoke | ✓ |
| Skeleton | ✓ | ✓ |  | ✓ |
| ImageFrame | ✓ | ✓ |  | ✓ |
| Reduced Motion | ✓ | ✓ | ✓ | ✓ |
| Headers |  | ✓ | ✓ | ✓ |
| MSW | ✓ |  |  |  |
| PageContainer/Grid |  | ✓ | ✓ | ✓ |

---

# 123. Contract Safety Search

PR-01 완료 전에 Repository search:

```text
/api/v1/
jwt
token
refresh-token
participantCount
coupleCount
price
discount
ReservationStatus
history/
logout
```

PR-01 범위에서
이런 문자열이 실제 Contract assumption으로 들어갔는지 확인한다.

예외:

```text
문서/주석/route placeholder name
```

은 맥락 확인.

---

# 124. Architecture Safety Search

검색:

```text
fetch(
axios
src/mocks import from production feature
../features private deep import
shared importing features
z-index: 999
random hex
```

허용 여부를 하나씩 검토한다.

---

# 125. Code Readability Gate

CP1 기준:

```text
파일 목적 10초 안에 설명 가능
이름이 책임을 설명
main/App/Provider가 짧고 명확
Primitive JSDoc/설명 주석
영리한 abstraction 없음
```

을 검토한다.

---

# 126. Foundation Definition of Done

PR-01 완료 조건:

## Runtime

- [ ] Node reference version recorded
- [ ] `npm ci` succeeds
- [ ] `npm run dev` boots
- [ ] `npm run build` succeeds
- [ ] all planned routes mount
- [ ] unknown route handled
- [ ] App Error Boundary works

## Tooling

- [ ] TypeScript strict config
- [ ] ESLint passes
- [ ] Prettier check passes
- [ ] alias works
- [ ] package-lock committed

## Design

- [ ] color tokens centralized
- [ ] typography tokens centralized
- [ ] spacing tokens centralized
- [ ] container/gutter baseline
- [ ] radius/shadow/z tokens
- [ ] focus system
- [ ] motion tokens
- [ ] reduced-motion branch

## UI

- [ ] PageContainer
- [ ] Grid
- [ ] Button
- [ ] TextLink
- [ ] TextField
- [ ] OptionCard
- [ ] Dialog
- [ ] BottomSheet
- [ ] Skeleton
- [ ] ImageFrame
- [ ] GlobalHeader
- [ ] TransactionHeader

## Accessibility

- [ ] native semantics
- [ ] visible focus
- [ ] skip link
- [ ] main landmark
- [ ] Dialog focus containment
- [ ] focus return
- [ ] explicit sheet close
- [ ] touch target baseline
- [ ] 200% zoom smoke
- [ ] reduced motion

## Testing

- [ ] Vitest runs
- [ ] RTL setup works
- [ ] primitive tests pass
- [ ] MSW server works
- [ ] browser mock bootstrap exists
- [ ] Playwright launches app
- [ ] Foundation E2E passes

## Contract Safety

- [ ] no invented endpoint
- [ ] no invented DTO
- [ ] no Auth mechanism assumption
- [ ] no participant default
- [ ] no price engine
- [ ] no Reservation status invention
- [ ] no Couple/Team Entity invention

---

# 127. Foundation Verification Commands

Clean install:

```bash
npm ci
```

Quality:

```bash
npm run typecheck
npm run lint
npm run format
npm run test
npm run build
```

Combined:

```bash
npm run verify
```

E2E:

```bash
npx playwright install chromium
npm run test:e2e
```

최종 PR evidence에는
실제 command 결과를 기록한다.

---

# 128. PR-01 Branch

권장:

```text
feat/frontend-foundation
```

시작:

```text
latest main
```

오래된 planning/setup branch를 재사용하지 않는다.

---

# 129. PR-01 Commit Strategy

하나의 거대한 commit 대신
리뷰 가능한 의미 단위로 나눈다.

예:

```text
chore: scaffold frontend toolchain
feat: add app bootstrap and router foundation
feat: add design and motion tokens
feat: add shared layout and control primitives
feat: add accessible dialog and bottom sheet
feat: add skeleton and image primitives
test: add mock and frontend test harness
docs: document local frontend setup
```

실제 변경량에 따라 합칠 수 있다.

Commit 수 자체가 목표는 아니다.

---

# 130. PR-01 Description Evidence

기존 template를 사용한다.

특히 Contract assumptions:

```text
None
```

또는:

```text
Shared baseline v0.1.2
No live Backend DTO used
```

로 명시한다.

Honeymoon rule을 Foundation에서 구현하지 않으므로
별도 product behavior assumption이 없어야 한다.

---

# 131. PR-01 Review Order

Reviewer에게 권장하는 순서:

```text
1. package/toolchain
2. app architecture
3. tokens
4. primitives
5. overlay accessibility
6. mocks/tests
7. architecture/contract search
```

Visual nit보다
구조와 접근성 오류를 먼저 본다.

---

# 132. Foundation Failure Conditions

다음 중 하나라도 있으면 PR-01 완료 아님.

```text
build fail
typecheck fail
lint fail
test fail
E2E launch fail
Dialog focus escape
focus return fail
BottomSheet close path 없음
random token values scattered
raw API assumption
Auth token strategy 추가
participant default 추가
large UI framework 추가
full Page 구현 섞임
Mock DTO가 production contract처럼 사용됨
```

---

# 133. Foundation Success Definition

PR-01의 최종 상태:

```text
"화면은 아직 대부분 placeholder지만,
이제 어떤 Screen을 만들어도
기반을 다시 뜯지 않고 같은 규칙으로 구현할 수 있다."
```

이 상태가 Foundation 성공이다.

---

# 134. CP4 Decision Log

## CP4-D01

Package manager는 npm을 사용한다.

## CP4-D02

Node reference는 24.21.0 LTS로 고정한다.

## CP4-D03

React 19.3.0 + Vite 8.3.1을 Foundation baseline으로 사용한다.

## CP4-D04

React Router 8.4.0 Data Mode를 사용한다.

## CP4-D05

TanStack Query 5.104.0을 Server State infrastructure로 사용한다.

## CP4-D06

TypeScript는 ecosystem compatibility 때문에 5.9.3을 사용한다.

## CP4-D07

ESLint Flat Config + Prettier를 사용한다.

## CP4-D08

CSS Custom Properties + CSS Modules를 사용한다.

## CP4-D09

Tailwind/Bootstrap/large UI framework를 도입하지 않는다.

## CP4-D10

Dialog/BottomSheet behavior foundation은 Radix Dialog를 사용한다.

## CP4-D11

Foundation에서 animation library를 추가하지 않는다.

## CP4-D12

Foundation에서 Redux/Zustand를 추가하지 않는다.

## CP4-D13

Foundation에서 Axios/Form/Schema library를 미리 추가하지 않는다.

## CP4-D14

OptionCard는 selection business logic이 없는 visual shell이다.

## CP4-D15

GlobalHeader/TransactionHeader는 `app/shell`이 소유한다.

## CP4-D16

Mock browser/test infrastructure는 MSW를 사용한다.

## CP4-D17

Foundation mock handlers는 Backend DTO를 추측하지 않는다.

## CP4-D18

Vitest + React Testing Library가 unit/component baseline이다.

## CP4-D19

Playwright가 E2E baseline이다.

## CP4-D20

PR-01은 F0~F9 순서로 진행한다.

---

# 135. CP4 Completion Checklist

## Baseline & Versions

- [x] Node LTS selected
- [x] package manager selected
- [x] React version selected
- [x] Vite version selected
- [x] Router version selected
- [x] TanStack Query version selected
- [x] TypeScript compatibility decision documented
- [x] ESLint/Prettier baseline selected
- [x] Test package versions identified
- [x] MSW selected
- [x] overlay primitive dependency selected

## Runtime

- [x] bootstrap flow defined
- [x] App defined
- [x] Provider scope defined
- [x] Router mode defined
- [x] route placeholders defined
- [x] Error Boundary defined

## Design

- [x] token file ownership defined
- [x] color baseline
- [x] typography baseline
- [x] spacing baseline
- [x] containers
- [x] breakpoints
- [x] radius
- [x] elevation
- [x] z-index
- [x] focus
- [x] motion
- [x] reduced motion

## Shared UI

- [x] PageContainer
- [x] Grid
- [x] Button
- [x] TextLink
- [x] TextField
- [x] OptionCard
- [x] Dialog
- [x] BottomSheet
- [x] Skeleton
- [x] ImageFrame

## App Chrome

- [x] GlobalHeader
- [x] TransactionHeader
- [x] Skip Link
- [x] main landmark

## Mock/Test

- [x] MSW browser path
- [x] MSW test server
- [x] Vitest
- [x] RTL
- [x] Playwright
- [x] component test matrix
- [x] route smoke matrix
- [x] responsive smoke
- [x] reduced-motion test

## Execution

- [x] F0–F9 implementation order
- [x] verification commands
- [x] branch strategy
- [x] commit strategy
- [x] PR evidence
- [x] DoD
- [x] failure conditions

---

# 136. CP4 Exit Status

```text
CP4 — FOUNDATION IMPLEMENTATION PLAN
STATUS: COMPLETE
```

결과:

```text
Foundation toolchain                LOCKED
Package manager                     LOCKED
Node baseline                       LOCKED
Runtime dependencies                LOCKED
TypeScript compatibility            LOCKED
Lint/format strategy                LOCKED
CSS architecture                    LOCKED
Router baseline                     LOCKED
Query infrastructure                LOCKED
Primitive ownership                 LOCKED
Overlay accessibility strategy      LOCKED
Motion baseline                     LOCKED
Mock infrastructure                 LOCKED
Test infrastructure                 LOCKED
PR-01 internal checkpoints          LOCKED
PR-01 Definition of Done            LOCKED
```

---

# 137. Handoff to CP5

다음 Checkpoint:

```text
CP5 — IMPLEMENTATION ROADMAP
```

CP5는 PR-01 이후 전체 구현을:

```text
IMP-0 Foundation
IMP-1 App Runtime
IMP-2 Discovery
IMP-3 Transaction Core
IMP-4 Reservation
IMP-5 Account & History
IMP-6 Live Integration
IMP-7 Final Integration / Release
```

로 나눈 뒤,
각 IMP를 실제 작업 가능한 sub-checkpoint로 분해한다.

각 sub-checkpoint에는:

```text
start condition
scope
files/features
mock/data dependency
responsive/a11y scope
tests
contract gates
exit condition
PR boundary
```

를 부여한다.

CP5의 목표:

> **이후 사용자가 `IMP-3C 진행`처럼 짧게 지시해도
> 구현 범위와 완료조건이 명확한 상태**

를 만드는 것이다.