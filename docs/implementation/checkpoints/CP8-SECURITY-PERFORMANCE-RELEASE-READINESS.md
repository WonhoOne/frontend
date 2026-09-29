# Mister World Frontend — CP8 Security, Performance & Release Readiness

> Status: **COMPLETE**  
> Checkpoint: **CP8 — Security / Performance / Production Release Readiness**  
> Date: **2026-09-29**  
> Target repository: `WonhoOne/frontend`  
> Shared baseline: `WonhoOne/docs/main` **v0.1.2**  
> Depends on:
> - `CP0-IMPLEMENTATION-BASELINE.md`
> - `CP1-CODE-QUALITY-STANDARDS.md`
> - `CP2-FRONTEND-ARCHITECTURE-PLAN.md`
> - `CP3-STATE-DATA-ARCHITECTURE.md`
> - `CP4-FOUNDATION-IMPLEMENTATION-PLAN.md`
> - `CP5-IMPLEMENTATION-ROADMAP.md`
> - `CP6-CONTRACT-LIVE-INTEGRATION-PLAN.md`
> - `CP7-QA-TEST-PLAN.md`
> - `docs/planning/10-RESPONSIVE-ACCESSIBILITY.md`
> - `docs/planning/11-QA-ACCEPTANCE.md`
> - Shared NFR / Architecture / Repository Responsibilities
>
> Next checkpoint: **CP9 — Final Plan Audit & Master Plan Assembly**

---

# 1. Purpose

CP8의 목적은 Mister World Frontend를
단순히 “기능과 테스트가 통과하는 애플리케이션”이 아니라
**production/demo 환경에 안전하고 예측 가능하게 올릴 수 있는 애플리케이션**으로 만들기 위한
보안·성능·배포·운영 기준을 잠그는 것이다.

이 문서 이후에는 다음 질문에 답할 수 있어야 한다.

```text
어떤 값은 browser storage에 저장해도 되는가?
credential/token은 어디에 저장하는가?
Vite 환경변수에 secret을 넣어도 되는가?
Backend HTML을 그대로 렌더링해도 되는가?
어떤 로그는 금지되는가?
private query cache는 언제 제거하는가?
dependency vulnerability는 언제 release blocker인가?

어떤 화면을 lazy-load 하는가?
이미지는 어떻게 loading/preload/lazy-load 하는가?
bundle이 커지면 언제 조사해야 하는가?
route transition이 성능을 해치면 무엇을 우선하는가?
3초짜리 Backend response 중 UX는 어떻게 유지하는가?

Production에서 Mock이 켜지지 않았다는 것을 어떻게 증명하는가?
Release artifact는 어떤 commit/contract와 연결되는가?
배포 실패 시 무엇을 rollback하는가?
```

---

# 2. CP8 Boundary

CP8이 정하는 것:

```text
Frontend security policy
Browser storage policy
Credential/token privacy boundary
XSS/raw HTML policy
Environment/secret policy
Logging/redaction
Private cache lifecycle
Dependency security
Production build safety

Performance strategy
Bundle/code-splitting strategy
Image/font strategy
Query/network efficiency
Motion/render efficiency
Performance observation targets

Environment model
Production mock-off invariant
Release build checks
Deployment expectations
Observability boundary
Release metadata
Rollback/readiness
```

CP8이 정하지 않는 것:

```text
Auth mechanism itself
Backend token/session format
CORS exact policy
Backend deployment infrastructure
SMS secret handling implementation
Database credentials
Backend monitoring stack
CDN/vendor selection
hosting provider
```

이 항목은 해당 Repository/Infrastructure 계약이 필요하다.

---

# 3. Security North Star

Frontend security의 기본 원칙:

> **Browser에 전달된 값은 사용자가 볼 수 있다고 가정한다.**

따라서:

```text
Client bundle
import.meta.env public variables
browser memory
DOM
network request
browser storage
console
source map
```

에 존재하는 값은
“숨겨진 server secret”으로 취급할 수 없다.

Frontend는 secret vault가 아니다.

---

# 4. Data Classification

Frontend가 다루는 값을 최소 다음 네 종류로 구분한다.

## PUBLIC

예:

```text
Theme
TourProduct public information
TourSchedule public presentation
static editorial copy
public images
```

Browser cache 가능.

## PRIVATE

예:

```text
Travel History
Reservation Detail
Customer profile data
address
contact
```

인증된 사용자에게만 노출.

Persistent Frontend Query Cache 금지.

## SENSITIVE AUTH

예:

```text
password
credential
session token
access token
refresh token
raw auth response containing secret material
```

강한 제한 적용.

## TRANSACTION DRAFT

예:

```text
tourProductId
scheduleId
style
participantCount
option choice identities
```

현재 설계상 credential/private customer profile을 포함하지 않는다.

`sessionStorage` persistence 허용.

---

# 5. Browser Storage Matrix — LOCKED

| Data | Memory | sessionStorage | localStorage | Persistent Query Cache |
|---|---:|---:|---:|---:|
| Public Tour Query | YES | NO by default | NO | NO |
| Travel History | YES | NO | NO | NO |
| Reservation Detail | YES | NO | NO | NO |
| Customer profile | only as needed | NO | NO | NO |
| Credential | local form only | **NO** | **NO** | **NO** |
| Auth token/session secret | contract-dependent memory/browser mechanism | **NO unless explicitly approved** | **NO unless explicitly approved** | NO |
| ReservationDraft | YES | **YES** | NO | N/A |
| ReturnContext | YES | **YES fallback** | NO | N/A |
| Price/server truth | Query memory | NO | NO | NO |

---

# 6. Credential Policy

Credential 입력은:

```text
Login/Signup form local state
```

에만 둔다.

금지:

```text
localStorage
sessionStorage
ReservationDraft
ReturnContext
TanStack Query cache
URL/query parameter
console
analytics
error report
```

Form unmount/submit lifecycle 이후
불필요한 credential reference를 유지하지 않는다.

---

# 7. Authentication Storage Contract — BLOCKED

현재 H-04는 아직 BLOCKED다.

따라서 CP8은:

```text
JWT localStorage
JWT sessionStorage
HttpOnly Cookie
in-memory bearer token
refresh token
```

중 하나를 임의 선택하지 않는다.

Frontend 원칙:

> **승인된 Auth Contract 없이 JavaScript-readable persistent token storage를 추가하지 않는다.**

Backend가 최종 Auth mechanism을 확정하면
다음 기준으로 security review 후 적용한다.

```text
token exposure
XSS impact
session expiry
logout/invalid state
CSRF implications
CORS/credentials behavior
multi-tab behavior
```

---

# 8. Auth Loss and Private Cache

Auth state가:

```text
authenticated
→ unauthenticated
```

로 바뀌면 다음 Server State를 제거한다.

```text
Travel History
Reservation Detail
future customer-specific query
customer profile
```

유지 가능:

```text
public Tour cache
ReservationDraft
non-sensitive ReturnContext while completing auth interruption
```

단 explicit logout contract가 생기면
logout 시 ReturnContext lifecycle을 별도 검토한다.

---

# 9. ReservationDraft Privacy

Draft에 저장 금지:

```text
name
full address
contact
credential
token
raw Customer object
raw Reservation response
server price
private history
```

Draft는:

```text
transaction choice identity
```

만 저장한다.

---

# 10. ReturnContext Security

`returnTo`는:

```text
internal app route only
```

허용.

금지:

```text
https://external.example
//external.example
javascript:
data:
```

복구 전:

```text
schema validation
internal route validation
draft version validation
```

수행.

목적:

```text
open redirect 방지
```

---

# 11. Vite Environment Variable Rule

`VITE_` prefix를 가진 환경변수는
client bundle에 노출되는 **public configuration**으로 취급한다.

사용 가능:

```text
VITE_API_BASE_URL
VITE_ENABLE_MOCKS
public feature/config flags
```

사용 금지:

```text
DB_PASSWORD
SMS_API_SECRET
private API key
JWT signing secret
service-account credential
```

Secret은 Backend/Infrastructure에 둔다.

---

# 12. Environment Prefix Safety

금지:

```text
envPrefix: ''
```

또는 모든 process environment를
client로 노출하는 설정.

Frontend config는
허용된 public variable만 읽는다.

---

# 13. `.env` Policy

Repository에 commit 가능:

```text
.env.example
```

단 public/non-secret placeholder만 포함.

Commit 금지:

```text
.env.local
.env.production.local
secret-bearing env file
```

`.gitignore`로 보호.

중요:

`.env.example`에도 실제 secret을 넣지 않는다.

---

# 14. XSS Policy — LOCKED

React text interpolation의 기본 escaping을 유지한다.

금지 원칙:

```text
dangerouslySetInnerHTML
element.innerHTML
document.write
eval
new Function
dynamic script injection
```

을 기본적으로 사용하지 않는다.

---

# 15. `dangerouslySetInnerHTML` Exception

정말 필요한 rich content requirement가 생길 경우:

```text
explicit security review
trusted source definition
sanitization policy
allowed tags/attributes
URL protocol filtering
tests
```

없이는 merge하지 않는다.

단순 Product description 때문에
raw Backend HTML을 그대로 주입하지 않는다.

가능하면 Backend는 structured text/data를 제공한다.

---

# 16. User/Backend Text Rendering

Backend text:

```tsx
<p>{model.description}</p>
```

처럼 text content로 렌더링한다.

HTML string로 간주하지 않는다.

Rich formatting이 필요하면
Shared Contract에서 content format부터 정한다.

---

# 17. URL Safety

Internal navigation:

```text
React Router route helpers
```

사용.

Backend/user supplied URL을
곧바로 `href`에 넣지 않는다.

향후 external URL이 필요하면:

```text
allowed protocol = https/http as explicitly required
URL parsing
domain/purpose review
```

를 적용.

`javascript:` 등 실행 가능한 protocol 금지.

---

# 18. External Link Policy

새 tab이 필요할 때:

```text
rel="noopener noreferrer"
```

를 기본으로 검토한다.

하지만 현재 Customer journey에
외부 링크를 임의 추가하지 않는다.

---

# 19. File/Upload Security

현재 Frontend 요구사항에는
file upload가 없다.

따라서:

```text
file upload component
preview
MIME validation
```

을 미리 구현하지 않는다.

향후 요구 시 별도 security plan 필요.

---

# 20. DOM/Browser API Safety

다음 사용은 이유를 설명해야 한다.

```text
innerHTML
localStorage
postMessage
window.open
clipboard
geolocation
microphone
camera
```

현재 Voice microphone permission은
`ai-console`/Voice integration 계약과 연결되며
Page 진입만으로 자동 요청하지 않는다.

---

# 21. Logging Policy

Production source에서 기본적으로:

```text
console.log
console.debug
```

사용하지 않는다.

허용 가능:

```text
App Error Boundary
Integration diagnostic boundary
development-only safe diagnostics
```

도 CP1 설명 주석과 redaction 규칙을 따른다.

---

# 22. Log Redaction

절대 로그하지 않는다.

```text
password
credential
token
full address
contact
raw private API payload
full Travel History
raw Reservation body
```

가능:

```text
safe resource ID
normalized error category
HTTP status
Feature/action name
correlation ID
```

---

# 23. Error Reporting Boundary

현재 외부 error-monitoring vendor는 선택하지 않는다.

따라서 PR-01~PR-08:

```text
safe local diagnostics
test artifacts
AppErrorBoundary
```

를 사용.

향후 Sentry 등 vendor를 도입할 경우 별도 검토:

```text
PII scrubbing
request-body capture
user identity
source maps
retention
environment tags
```

Vendor를 “관측성”이라는 이유로 임의 추가하지 않는다.

---

# 24. Source Map Policy

현재 production 기본:

```text
public source map = OFF
```

Vite 기본 동작을 유지한다.

향후 private error reporting이 필요하면:

```text
private artifact upload
public serving 여부
PII/secret absence
```

를 검토한 뒤 변경.

Source map 자체를 secret 보호 수단으로 보지는 않는다.
실제 secret이 bundle에 들어가면 이미 실패다.

---

# 25. Sensitive Error UI

사용자에게 노출 금지:

```text
stack trace
SQL error
Java class
internal hostname
exception detail
auth token detail
raw request
```

UI는:

```text
normalized error
+
safe user action
```

만 표시한다.

---

# 26. Dependency Security — LOCKED

CP4의 exact pin 정책 유지:

```text
package.json exact version
package-lock.json commit
npm ci
```

Lockfile diff를 PR에서 검토한다.

---

# 27. New Dependency Gate

새 package 도입 시 기록:

```text
문제
왜 기존 stack으로 불충분한가
maintained 여부
bundle/runtime impact
security history if relevant
license
transitive dependency impact
```

사소한 helper 때문에 package를 추가하지 않는다.

---

# 28. Dependency Audit

Release/Dependency PR에서:

```bash
npm audit --omit=dev --audit-level=high
```

을 Production dependency hard gate로 사용한다.

의미:

```text
production dependency high/critical known vulnerability
→ release block until reviewed/resolved
```

---

# 29. Full Tree Audit

추가로:

```bash
npm audit
```

결과를 확인한다.

Dev dependency vulnerability도 무시하지 않는다.

분류:

```text
runtime exploitable
build/test only
unreachable
fix available
no fix
```

---

# 30. Audit Exception

취약점이 남아야 한다면:

```text
advisory ID
affected package
reachability
runtime/dev
why non-exploitable or accepted
owner
target removal/update
```

를 Issue/Release evidence에 남긴다.

High/Critical runtime exception은
명시적 review 없이는 금지.

---

# 31. No Blind Audit Fix

금지:

```bash
npm audit fix --force
```

를 자동으로 실행하고
큰 dependency update를 review 없이 merge.

Update는:

```text
diff
tests
breaking change
bundle
```

를 확인한 뒤 명시적으로 수행한다.

---

# 32. Lockfile Integrity

`package-lock.json` 변경은
dependency 변경 이유와 같이 검토한다.

의도하지 않은 대규모 lockfile churn이 생기면
원인을 확인한다.

---

# 33. Dependency License

특히:

```text
font
icon
image
runtime package
```

의 license가 프로젝트 제출/배포에 적합한지 확인한다.

Font binary는
source/license 확인 전 repository에 넣지 않는다.

---

# 34. Security QA Matrix

PR별 해당되는 것을 검증한다.

```text
credential storage
private cache
ReturnContext redirect
raw HTML
environment exposure
logging
production mocks
dependency audit
```

특히 PR-07/Auth, PR-09/Live Integration, PR-11/Release에서 필수.

---

# 35. Production Mock Invariant — S0

Production/demo release에서:

```text
Mock Service Worker auto-start
hidden scenario switcher
fake Reservation success
fixture Customer private data
```

가 동작하면 S0.

Production build:

```text
VITE_ENABLE_MOCKS != true
```

가 기본.

---

# 36. Mock Runtime Guard

`startMocking.ts`는 최소:

```text
import.meta.env.DEV
AND
VITE_ENABLE_MOCKS === 'true'
```

와 같은 명시적 opt-in 구조를 사용한다.

Production build에서
환경변수 하나의 실수만으로 mock이 켜질 수 있다면
추가 guard를 둔다.

예:

```text
PROD이면 mock bootstrap 자체를 실행하지 않음
```

---

# 37. Production Mock Audit

Release E2E에서:

```text
production build
mock disabled
```

상태로 앱을 시작.

확인:

```text
mockServiceWorker request 없음
scenario control 없음
fixture-only marker 없음
real integration scope에서 mock response 없음
```

---

# 38. Private Test Data

Test fixture는 synthetic data를 사용한다.

금지:

```text
실제 팀원 주소
실제 전화번호
실제 password
실제 token
실제 Customer history
```

Screenshot artifact에도
실제 private data를 넣지 않는다.

---

# 39. Performance North Star

성능의 목적:

> **사용자가 빠르게 “느끼는 것”과 실제 작업이 끊기지 않는 것.**

단순 bundle 숫자만 줄이는 것이 목표가 아니다.

주요 축:

```text
loading perception
interaction responsiveness
visual stability
network efficiency
render efficiency
asset efficiency
motion smoothness
```

---

# 40. Shared NFR Boundary

Shared:

```text
NFR-05
주요 Backend 요청 <= 3 seconds
```

이것은:

```text
Frontend가 3초 blank로 기다려도 된다```

는 의미가 아니다.

Frontend는 400ms~3000ms 상태에서도
Skeleton/partial/stale content로 usable하게 유지한다.

---

# 41. Core Web Vitals Internal Observation

Shared Requirement가 아닌
Frontend 내부 웹 품질 관찰 목표:

```text
LCP <= 2.5s
INP <= 200ms
CLS <= 0.1
```

Field data가 있는 경우:

```text
mobile / desktop 각각 75th percentile
```

을 권장 관찰 기준으로 사용.

중요:

```text
이 값들은 Shared course requirement가 아니라
Frontend internal web-quality target이다.
```

---

# 42. Lab vs Field

개발/수업 프로젝트에서
실제 production field data가 충분하지 않을 수 있다.

따라서:

```text
Lighthouse/DevTools lab observation
+
Playwright behavior tests
+
build size
```

로 먼저 추적.

Field telemetry가 실제로 생긴 뒤
75th percentile Core Web Vitals를 평가한다.

---

# 43. No Fake Performance Precision

초기 PR에서:

```text
LCP exactly 1.8s
bundle exactly 180KB
```

같은 근거 없는 SLA를 만들지 않는다.

대신:

```text
regression guard
investigation threshold
observable target
```

을 사용한다.

---

# 44. Route Code Splitting — LOCKED

11개 Screen 전체를
초기 JS bundle에 넣지 않는다.

기본:

```text
App shell / shared foundation
→ initial

Route page modules
→ lazy
```

특히:

```text
Configure
Reservation Review
Reservation Detail
Login
Signup
My Trips
```

는 route lazy-loading 후보.

---

# 45. Router Lazy Strategy

React Router의 route-level lazy/dynamic import를 사용한다.

Server data ownership은
여전히 TanStack Query Feature layer.

금지:

```text
route lazy 때문에 API logic을 Router loader로 이동
```

목적은 code splitting이지
State architecture 변경이 아니다.

---

# 46. Home Initial Load

`/` initial path에 필요한:

```text
App Shell
Home route
critical shared primitives
```

만 우선.

사용자가 아직 가지 않은:

```text
Reservation
History
Auth
```

코드를 모두 eager-load하지 않는다.

---

# 47. Prefetch Policy

무조건 모든 route/data를 prefetch하지 않는다.

허용 후보:

```text
intentional link hover/focus
likely next step
browser idle
small critical route
```

단 다음을 먼저 확인:

```text
network cost
mobile data
actual navigation likelihood
```

---

# 48. Bundle Inspection

`vite build` 결과의:

```text
chunk size
gzip size
asset size
```

를 PR-03 이후 정기적으로 검토한다.

Vite default:

```text
500kB uncompressed chunk warning
```

을 최소 investigation trigger로 유지한다.

---

# 49. Chunk Warning Policy

어떤 JS chunk가:

```text
> 500 kB uncompressed
```

warning을 발생시키면
그냥 warning limit을 올리지 않는다.

먼저:

```text
which dependency
route split missing?
duplicate dependency?
large data bundled?
icon/font import?
```

를 조사한다.

---

# 50. Bundle Baseline

PR-03에서 실제 Product Screen이 등장하면:

```text
initial JS
initial CSS
largest lazy chunk
```

의 baseline을 Release evidence에 기록한다.

이후 PR이 설명 없이
큰 폭의 size 증가를 만들면 review한다.

초기 계획에서 임의 KB ceiling을 Shared requirement로 만들지 않는다.

---

# 51. No Bundle Data Fixtures in Production

큰 Mock fixture를:

```text
production app bundle
```

에 포함하지 않는다.

Dev-only dynamic import 또는
tree-shaken mock boundary를 사용.

Release build에서 fixture chunk가 생성되는지 확인한다.

---

# 52. Image Strategy — LOCKED

Travel UI 특성상 image가 LCP/bandwidth에 큰 영향을 준다.

원칙:

```text
responsive image
explicit aspect ratio/dimensions
appropriate format
lazy below fold
intentional Hero priority
failure fallback
```

---

# 53. Hero Image

실제 Page의 주요 LCP candidate인 Hero는:

```text
lazy-load 금지 후보
high priority only when actually above fold
responsive sources
correct crop
```

를 사용.

모든 Hero/card에:

```text
fetchpriority="high"
```

를 남발하지 않는다.

---

# 54. Non-Critical Images

Below-the-fold/card:

```text
loading="lazy"
```

기본 후보.

Viewport/UX에 따라
첫 화면 바로 아래 critical card는 예외 가능.

---

# 55. Image Dimensions and CLS

이미지에는:

```text
width/height
or
aspect-ratio
```

를 통해 layout space를 예약.

목적:

```text
CLS 감소
```

ImageFrame placeholder가
최종 geometry와 같은 비율을 유지한다.

---

# 56. Responsive Image Sources

가능하면:

```text
srcset
sizes
```

사용.

Mobile에
Desktop 원본 full-resolution을 강제로 받지 않는다.

---

# 57. Image Format

Asset pipeline이 지원하면:

```text
AVIF/WebP
```

같은 modern format을 우선 고려.

하지만:

```text
content/image quality
browser support
asset source
```

를 검토.

포맷 변환 자체 때문에
과도한 build dependency를 추가하지 않는다.

---

# 58. Image Preloading

Preload는:

```text
실제 first-view LCP asset
```

에만 제한.

모든 theme image를 preload하지 않는다.

---

# 59. Image Failure Performance

Image fail/retry가:

```text
infinite request loop
```

를 만들지 않는다.

Fallback은
network retry를 무한 반복하지 않는다.

---

# 60. Font Performance

현재 Font stack:

```text
Pretendard Variable
Instrument Serif
system fallback
```

실제 font 파일 도입 전:

```text
license
source
subset/weight
```

검토.

---

# 61. Font Loading

Self-host 시 후보:

```text
WOFF2
font-display: swap
```

critical UI font만 preload 검토.

금지:

```text
모든 weight
모든 language subset
editorial font까지 전부 preload
```

---

# 62. Font Fallback

Font 다운로드 실패에도:

```text
layout usable
text visible
```

해야 한다.

Invisible text를 오래 유지하는 전략 금지.

---

# 63. Query Network Efficiency

CP3 유지:

```text
TanStack Query cache
dedupe
F1/F2/F3 stale policy
AbortSignal
focus/reconnect revalidation
polling OFF
```

목적:

```text
freshness
+
unnecessary request 방지
```

---

# 64. No Duplicate Fetch Layer

금지:

```text
Page fetch
+
Feature query
```

동시에 같은 resource 요청.

Server State source는
Feature Query layer 하나로 통일.

---

# 65. No Global Polling

실시간 계약 없이는:

```text
setInterval fetch
refetchInterval
```

기본 OFF.

Polling이 필요해지면
resource-specific requirement와 비용을 검토.

---

# 66. Background Refresh UX

Refresh는:

```text
기존 success data 유지
background network
```

를 우선.

매번 Skeleton로 돌아가
perceived performance를 악화시키지 않는다.

---

# 67. Abort and Navigation

사용자가 다른 Tour/Route로 이동하면
불필요한 GET은 AbortSignal을 전달.

목적:

```text
bandwidth
stale overwrite
```

감소.

---

# 68. Mutation Efficiency

Mutation에는:

```text
automatic retry = 0
```

유지.

중복 click 때문에
같은 POST를 두 번 보내지 않는다.

이것은 성능과 data integrity 모두의 요구다.

---

# 69. Render Locality

상태는 가능한 한
필요한 Component 가까이에 둔다.

목표:

```text
Option 하나 변경
→ App 전체 rerender X
```

ReservationDraft Context는
필요하면 context splitting/selector 전략을
측정 후 검토.

처음부터 복잡한 store 최적화를 만들지 않는다.

---

# 70. Memoization Policy

CP1 유지:

```text
useMemo/useCallback/memo
```

를 습관적으로 사용하지 않는다.

측정 또는
referential contract가 있을 때만.

성능 “최적화” 때문에 가독성을 악화시키지 않는다.

---

# 71. List Rendering

Travel History/Tours가
현재 요구에서 대규모 list로 정의돼 있지 않다.

따라서 virtualization library를 미리 넣지 않는다.

실제 data 규모가 커져
성능 문제가 측정되면 도입 검토.

---

# 72. Animation Performance

가능하면 animation:

```text
transform
opacity
```

중심.

피함:

```text
large layout property animation
height/width continuous tween
heavy filter
large blur on many elements
```

---

# 73. Motion vs Interaction

Animation이:

```text
navigation
form input
submit
close
```

를 불필요하게 block하면 안 된다.

Latest intent wins.

---

# 74. Reduced Motion and Performance

Reduced Motion은
접근성뿐 아니라
불필요한 animation work도 줄인다.

```text
Skeleton shimmer OFF
large transition OFF
```

---

# 75. Expensive Visual Effects

Luxury visual을 이유로:

```text
full-screen backdrop-filter everywhere
continuous blur
large multiple shadows
canvas animation
WebGL
```

을 기본 사용하지 않는다.

실제 visual benefit과 frame performance를 확인한 뒤 사용.

---

# 76. Scroll Performance

금지에 가깝게 취급:

```text
scroll event마다 React state update
manual parallax without rAF/observer
scroll hijacking
```

필요하면:

```text
IntersectionObserver
CSS
```

등 browser-friendly primitive를 우선.

---

# 77. Layout Shift

다음에는 reserved geometry를 둔다.

```text
image
Skeleton
price
recruitment count
async validation
```

단 고정 height가
200% zoom에서 text를 자르면 안 된다.

---

# 78. Loading Threshold

CP3 baseline:

```text
<120ms     skeleton optional
120–400ms  skeleton
>400ms      skeleton + progressive/partial
```

구현 목적:

```text
fast response flicker 방지
slow response blank 방지
```

---

# 79. No Artificial Delay

Skeleton을 보여주기 위해
실제 빠른 request를 인위적으로 늦추지 않는다.

Minimum display time도
flicker 문제가 실제 확인될 때만 적용.

---

# 80. Performance QA

PR-03 이후 visual/data Screen에서:

```text
400ms
1200ms
3000ms
```

network simulation.

확인:

```text
blank time
layout stability
interaction
duplicate requests
```

---

# 81. Production Environment Model

기본 environment:

```text
development
test
production
```

필요하면:

```text
preview/staging
```

을 deployment에서 추가.

Environment가 business behavior를 바꾸지 않아야 한다.

예:

```text
production만 다른 participant rule
```

금지.

---

# 82. Environment Config Boundary

`src/app/config/env.ts`

가 browser config를 normalize.

Component에서:

```text
import.meta.env.*
```

직접 접근을 확산하지 않는다.

---

# 83. Required Public Config

Live integration 이후 후보:

```text
VITE_API_BASE_URL
```

Mock dev:

```text
VITE_ENABLE_MOCKS
```

추가 config는
실제 필요가 있을 때만.

---

# 84. Production Env Validation

Required public config가 없으면
production에서 조용히 localhost/fallback으로 가지 않는다.

```text
fail fast
```

또는 명확한 startup configuration error.

금지:

```text
API URL missing
→ localhost 사용
```

---

# 85. API URL Policy

Development:

```text
local Backend allowed
```

Public demo/production:

```text
HTTPS endpoint required
```

를 기본 운영 기준으로 한다.

단 실제 배포 environment/학교 infrastructure가 다르면
Infra owner와 조정.

---

# 86. CORS / Credentials

Exact policy는 H-04/Auth contract 후 결정.

Frontend가 임의로:

```text
credentials: include
Authorization bearer
```

를 고정하지 않는다.

Live Integration Gate:

```text
Backend CORS
origin
credential mechanism
```

실환경 확인.

---

# 87. CSP / Security Headers Boundary

Frontend code만으로
완전한 security header 정책을 제공할 수 없다.

Deployment/hosting에서 검토할 항목:

```text
Content-Security-Policy
Referrer-Policy
frame embedding policy
HTTPS/HSTS where applicable
MIME sniffing protection
```

정확한 CSP source allowlist는:

```text
API
image host
font host
monitoring
```

가 확정된 뒤 정한다.

---

# 88. No Premature CSP Meta

Asset/API source가 아직 확정되지 않은 상태에서
`<meta http-equiv="Content-Security-Policy">`를
임의 hardcode하지 않는다.

Hosting response header 기반 정책을 우선 검토.

---

# 89. SPA Hosting Requirement

Direct URL:

```text
/tours/:tourId
/reservations/:reservationId
/login
/my-trips
```

가 새로고침되어도
404 static-file error가 나면 안 된다.

Hosting:

```text
SPA history fallback → index.html
```

필요.

Release smoke에 direct route 포함.

---

# 90. Static Asset Caching

Vite hashed asset:

```text
assets/*
```

은 배포 환경에서:

```text
long-lived immutable caching
```

에 적합.

`index.html`은:

```text
new deploy를 받을 수 있도록 revalidate/no aggressive immutable cache
```

가 필요.

정확한 header는 hosting owner와 조정.
---

# 91. Build Artifact Rule

Release artifact는:

```text
clean `npm ci`
→ verify
→ build
```

에서 생성.

Developer machine의 오래된 node_modules 결과를
release artifact로 사용하지 않는다.

---

# 92. Build Command Gate

Release:

```bash
npm ci
npm run verify
npm run test:e2e
npm run build
npm audit --omit=dev --audit-level=high
```

PR-11에서는 CP7의 broader browser/a11y/visual matrix 추가.

---

# 93. Production Build Smoke

`dist`를 실제 static server로 serve한 뒤:

```text
Home
direct routes
assets
lazy chunks
API base config
mock off
```

검증.

Dev server PASS만으로 release-ready 아님.

---

# 94. Browser Target

Vite의 modern default build target을 기본으로 유지한다.

별도 legacy browser 요구가 없는 한:

```text
@vitejs/plugin-legacy
```

를 추가하지 않는다.

실제 학교/평가 환경이 더 오래된 브라우저를 요구하면
지원 범위를 명시하고 별도 결정한다.

---

# 95. Release Metadata

각 Release Candidate에 기록:

```text
Frontend commit SHA
Shared docs commit SHA
Backend commit SHA if live
Node version
package-lock hash/change
build timestamp
released scope
open Contract Gates
known S2/S3
```

목적:

```text
어떤 계약/Backend와 함께 검증된 Frontend인지 추적
```

---

# 96. Version Coupling

Frontend와 Backend가 동시에 배포되지 않을 수 있다.

따라서 Live Integration 후:

```text
new Frontend ↔ current Backend
current Frontend ↔ new Backend
```

호환성이 필요한지 확인.

Breaking API change라면:

```text
coordinated deploy
or
backward-compatible Backend period
```

가 필요.

Frontend가 이를 임의로 해결하지 않는다.

---

# 97. Release Candidate Branch/Tag

정확한 Git tag 정책은 CP8에서 강제하지 않는다.

최소:

```text
merge commit SHA
release evidence
```

가 있어야 한다.

팀이 tag를 쓰면:

```text
frontend-vX
```

같은 repository convention을 별도 합의.

---

# 98. Rollback Principle

Frontend static deploy 문제가 생기면:

```text
previous known-good frontend build
```

로 rollback 가능해야 한다.

필요 정보:

```text
previous commit
contract snapshot
backend compatibility
```

---

# 99. Rollback Limitation

Frontend rollback만으로
Backend schema/API incompatibility를 해결할 수 없는 경우가 있다.

따라서 PR-09 이후 release는:

```text
Backend compatibility
```

를 함께 확인.

---

# 100. Release Stop Conditions

즉시 Release 중단:

```text
S0
S1
production mock active
credential/token leak
high/critical exploitable production dependency vulnerability
build config missing
live API contract mismatch
private data after auth loss
direct route hosting failure
critical lazy chunk 404
```

---

# 101. Release Warning Conditions

조사/승인 필요:

```text
large JS chunk warning
unexpected bundle growth
moderate dependency vulnerability
S2 defect
WebKit-only serious regression
performance regression
visual snapshot mass change
```

---

# 102. Observability without Vendor

현재 기본:

```text
Browser test artifacts
Playwright trace
safe console boundary in development
Backend correlation ID when contract supplies it
```

Production monitoring vendor 없는 것을
숨기지 않는다.

---

# 103. Correlation ID

Backend error contract가 향후:

```text
requestId
correlationId
```

를 제공하면
Frontend Error Model에 safe identifier로 보존 가능.

사용자에게:

```text
지원 문의용 오류 ID
```

로 보여주는 것도 가능.

단 contract가 없는데 생성하지 않는다.

---

# 104. Error Boundary Release Behavior

Unexpected render crash:

```text
AppErrorBoundary
```

가 전체 blank page 대신
safe fallback 제공.

Production에서 stack을 사용자에게 표시하지 않는다.

Reload/Home 등의 recovery 제공.

---

# 105. Feature Error Isolation

예상 가능한:

```text
query error
image failure
partial schedule error
history error
```

를 App Error Boundary까지 올리지 않는다.

Local recovery로 격리.

---

# 106. Private Browser History Consideration

SPA navigation history 자체에:

```text
credential
private payload
address/contact
```

를 state/query string으로 넣지 않는다.

Route params는 safe resource identity만.

---

# 107. Query String Policy

현재 Screen contract에 없는:

```text
token
password
customer info
reservation body
```

를 query parameter로 사용하지 않는다.

향후 filtering/pagination contract가 생기면
public/non-sensitive state만 검토.

---

# 108. Clipboard Policy

현재 요구 없음.

Reservation ID를 clipboard에 복사하는 기능 등
임의 편의기능을 추가하지 않는다.

추가 시 user gesture 필요.

---

# 109. Browser Permission Policy

Permission:

```text
microphone
camera
location
notifications
```

은 명확한 사용자 action 없이 요청하지 않는다.

현재 Voice microphone는
Voice control 실행 시점에만 요청하는 방향을 기본으로 한다.

Final contract는 IMP-7에서 확인.

---

# 110. Performance Release Evidence

PR-11/Release에서 기록:

```text
Vite build chunk report
initial/largest chunk notes
Hero/image strategy
network duplicate review
Core Web Vitals lab observation if run
known performance issue
```

---

# 111. Lighthouse Policy

Lighthouse를
Shared Requirement 숫자로 사용하지 않는다.

사용 목적:

```text
regression observation
LCP/CLS/INP-related issue discovery
asset/network issue discovery
```

실행 환경 차이를 고려해
절대 score 하나로 Release를 결정하지 않는다.

---

# 112. Performance Regression Rule

같은 CI/lab 환경에서:

```text
noticeable LCP/CLS regression
large unexplained JS growth
interaction lag
```

가 생기면
PR에서 원인을 설명하거나 수정.

---

# 113. CLS High-Risk Areas

특히:

```text
Hero image
font swap
Skeleton → content
price update
recruitment update
validation message
sticky CTA
history image
```

검증.

---

# 114. INP High-Risk Areas

특히:

```text
rapid OptionCard selection
large Context rerender
Dialog open
BottomSheet open
Reservation Submit
large History render
```

관찰.

---

# 115. LCP High-Risk Areas

특히:

```text
Home Hero
Tour Detail Hero
font blocking
large initial JS
```

관찰.

---

# 116. Performance Optimization Order

문제 발견 시:

```text
1. Network/asset size
2. unnecessary code eager load
3. unnecessary render
4. expensive animation/layout
5. memoization
```

순으로 원인을 본다.

처음부터 memoization으로 덮지 않는다.

---

# 117. Image QA Release

실제 final asset이 들어온 후:

```text
mobile download size
desktop quality
crop
placeholder
CLS
failure
alt
```

재검증.

Mock/placeholder asset 기준 성능 결과를
final performance라고 하지 않는다.

---

# 118. Font QA Release

실제 font가 들어오면:

```text
license
request count
preload
FOIT/FOUT
layout shift
fallback
Korean glyph support
```

확인.

---

# 119. No Service Worker/PWA in Current Scope

현재 요구에는:

```text
offline app shell
installable PWA
background sync
push
```

가 없다.

따라서 custom service worker를 만들지 않는다.

MSW service worker와
production PWA service worker를 혼동하지 않는다.

---

# 120. No Background Sync

특히 Reservation:

```text
offline queue/background sync
```

금지.

Reconnect 후 사용자가 최신 truth를 확인하고
명시적으로 행동.

---

# 121. No Local Business Logic Cache

Business rules를 local JSON/config로 복제해
Backend와 독립 업데이트하는 구조를 만들지 않는다.

Fixed Theme/TourStyle 같은 Shared catalog는
Frontend type/constants로 mirror 가능하지만
Backend final validation 유지.

---

# 122. Security Comment Requirement

다음 코드에는 CP1 security 주석을 요구한다.

```text
env parsing
Auth storage boundary
ReturnContext validation
Draft persistence
private cache clear
raw HTML exception
external URL validation
mock production guard
logging/redaction
```

---

# 123. Security Test Requirement

특히 PR-07/09/11:

```text
credential not storage
credential not URL
ReturnContext open redirect rejected
private cache cleared
production mocks off
unknown raw HTML not injected
```

테스트.

---

# 124. Performance Comment Requirement

비직관적 optimization에는 WHY를 남긴다.

예:

```text
Hero preload
route dynamic import
manual image priority
memoization
```

단 obvious lazy route마다 긴 주석 불필요.

---

# 125. Release Documentation Rule

Release 관련 지식이
개인 기억/채팅에만 남지 않게 한다.

Repository에 최소:

```text
README run/build
PR evidence
Release evidence
environment public variables
```

기록.

---

# 126. README Production Section

구현 후 README에 포함:

```text
Node/npm version
npm ci
npm run dev
npm run verify
npm run build
npm run test:e2e
public env variables
mock enable rule
production mock-off rule
```

Secret 값은 적지 않는다.

---

# 127. `.env.example`

실제 필요 시:

```text
VITE_ENABLE_MOCKS=false
VITE_API_BASE_URL=
```

같은 public placeholder만.

설명:

```text
All VITE_* values are client-visible.
Do not put secrets here.
```

필수.

---

# 128. Production Config Misconfiguration Severity

예:

```text
wrong API base URL
mock enabled
required config missing
```

Customer journey가 깨지면 S1 이상.

Fake data를 real처럼 노출하면 S0.

---

# 129. Deployment Smoke Matrix

Production-like build에서:

```text
/
 /tours
 /tours/:id
 /tours/:id/configure
 /reservation/review
 /reservation/:id/success
 /reservations/:id
 /login
 /signup
 /my-trips
```

direct load.

---

# 130. Asset Smoke

검증:

```text
CSS
lazy route chunks
Hero image
font if self-hosted
mockServiceWorker absence/disabled
```

404 없음.

---

# 131. Network Security Smoke

Live 환경:

```text
HTTPS
expected API origin
unexpected third-party call 없음
credential transport matches contract
```

Browser DevTools/Playwright network recording으로 확인.

---

# 132. Third-Party Network Policy

사용자가 요청하지 않은 analytics/tracker를
임의 추가하지 않는다.

Third-party call이 생기면:

```text
purpose
data sent
privacy
dependency
```

를 명시.

---

# 133. Analytics Boundary

현재 Analytics requirement 없음.

따라서:

```text
Google Analytics
Mixpanel
Amplitude
```

등을 계획에 넣지 않는다.

향후 요구 시 privacy/event contract 필요.

---

# 134. Error Reporting Boundary

동일하게
외부 error vendor는 요구 없음.

필요해지면 별도 dependency/privacy review.

---

# 135. Security Header Escalation

Hosting owner가 별도 Repo/Infra라면
Frontend는 다음 요구를 전달할 수 있다.

```text
HTTPS
SPA fallback
safe response headers
cache policy
CSP review
```

타 Repo를 임의 수정하지 않는다.

---

# 136. Performance Escalation to Backend

NFR-05를 실제로 초과하는 endpoint가 확인되면:

```text
Frontend에서 spinner timing으로 숨기지 않는다.
```

Backend owner에:

```text
endpoint
latency
sample size
environment
user impact
```

를 전달.

Frontend는 stale/partial UX로 회복성을 제공.

---

# 137. Security Escalation to Backend

다음 발견 시 Backend owner에 즉시 요청:

```text
credential in response body unexpectedly
sensitive data over public endpoint
weak/missing auth
error stack leak
CORS/auth contract mismatch
private resource cacheability issue
```

---

# 138. Release Readiness Levels

## R0 — Development Only

```text
Mock-backed
dev server
no production claim
```

## R1 — Mock Demo Ready

```text
implemented Screens
Mock scenarios
QA passes
mock use explicitly disclosed
```

## R2 — Integration Ready

```text
Contract closed for scope
Backend reachable
Adapters available
```

## R3 — Release Candidate

```text
Live core journey
CP7 Release Gate
CP8 security/performance checks
```

## R4 — Release Ready

```text
R3
+
deployment smoke
+
mock off
+
security audit
+
release metadata
+
rollback path
```

---

# 139. Mock Demo Disclosure

수업/demo에서 일부 기능이 Mock이면:

```text
Mock-backed
```

임을 숨기지 않는다.

실제 Backend 연동처럼 설명하지 않는다.

---

# 140. Production/Live Definition

`Live`라고 부르려면:

```text
approved Shared Contract
real Backend endpoint
real Frontend Adapter
production mock off
```

가 필요.

---

# 141. Release Security Checklist

- [ ] No secrets in `VITE_*`
- [ ] No committed secret `.env`
- [ ] Credentials not persisted
- [ ] Auth storage follows approved contract
- [ ] ReturnContext rejects external URLs
- [ ] No raw HTML injection
- [ ] No unexpected external scripts
- [ ] Private Query Cache memory-only
- [ ] Private cache cleared on auth loss
- [ ] Logs redact PII/credential/token
- [ ] Production mock disabled
- [ ] Dependency audit reviewed
- [ ] Synthetic QA data only
- [ ] HTTPS/API origin checked for public deployment

---

# 142. Release Performance Checklist

- [ ] Route lazy splitting
- [ ] Build chunk report reviewed
- [ ] No unexplained >500kB chunk
- [ ] Responsive image usage
- [ ] Hero priority intentional
- [ ] Below-fold lazy images
- [ ] Image dimensions/aspect ratio
- [ ] Font loading reviewed
- [ ] Duplicate query review
- [ ] Polling absent unless contract requires
- [ ] AbortSignal read queries
- [ ] No obvious app-wide rerender
- [ ] Motion uses transform/opacity where possible
- [ ] 400/1200/3000ms UX tested
- [ ] CLS-sensitive states checked
- [ ] internal CWV observation recorded when available

---

# 143. Release Build Checklist

- [ ] `npm ci`
- [ ] `npm run verify`
- [ ] `npm run test:e2e`
- [ ] `npm run build`
- [ ] dependency audit
- [ ] production-like serve
- [ ] direct route smoke
- [ ] lazy chunk smoke
- [ ] assets load
- [ ] mocks off
- [ ] env validation
- [ ] browser matrix per CP7

---

# 144. Release Operations Checklist

- [ ] Frontend commit recorded
- [ ] Shared docs SHA recorded
- [ ] Backend SHA recorded if live
- [ ] released scope recorded
- [ ] known S2/S3 recorded
- [ ] Contract Gates recorded
- [ ] previous known-good build identifiable
- [ ] Backend compatibility checked
- [ ] rollback procedure known
- [ ] deployment smoke evidence recorded

---

# 145. Security Anti-Patterns

## SEC-01

Secret in `VITE_*`.

## SEC-02
JWT/token persisted by assumption.

## SEC-03

Credential in Draft/ReturnContext.

## SEC-04

Private Query Cache persisted.

## SEC-05

Raw Backend HTML injection.

## SEC-06

Backend error stack shown to user.

## SEC-07

PII in console/test artifact.

## SEC-08

Unvalidated external `returnTo`.

## SEC-09

Mock production leakage.

## SEC-10

Blind `npm audit fix --force`.

## SEC-11

Unreviewed third-party tracker.

## SEC-12

Client direct DB/service secret usage.

---

# 146. Performance Anti-Patterns

## PERF-01

All routes eager bundled.

## PERF-02

Desktop Hero original downloaded on mobile.

## PERF-03

Every image high priority.

## PERF-04

All fonts/weights preloaded.

## PERF-05

Full-page Skeleton on every refresh.

## PERF-06

Global polling.

## PERF-07

Same resource fetched from Page and Feature.

## PERF-08

Premature memoization everywhere.

## PERF-09

Expensive glass/blur/animation throughout app.

## PERF-10

500kB chunk warning silenced by raising threshold without analysis.

## PERF-11

Huge production Mock fixtures.

## PERF-12

Layout shift from image/price/skeleton.

---

# 147. Release Anti-Patterns

## REL-01

Dev server only tested.

## REL-02

Direct SPA routes fail on hosting.

## REL-03

No release commit/contract snapshot.

## REL-04

Production env silently falls back to localhost.

## REL-05

Mock enabled in demo without disclosure.

## REL-06

Backend breaking change deployed without compatibility check.

## REL-07

No previous known-good artifact/commit.

## REL-08

Release with S0/S1.

---

# 148. External Implementation References

이 섹션은 Shared Contract가 아니다.

현재 Tooling/Web platform 사용법 확인을 위한 참고다.

## Vite environment

현재 Vite 문서 기준:

```text
VITE_ prefixed values are exposed to client code.
```

따라서 `VITE_*`를 secret storage로 사용할 수 없다.

## React raw HTML

React 공식 문서도:

```text
dangerouslySetInnerHTML
```

사용 시 XSS 위험을 명시하므로
Mister World 기본 정책은 사용 금지다.

## npm audit

npm은:

```text
audit-level
omit
```

을 이용해 CI failure threshold를 설정할 수 있다.

CP8은 production dependency:

```text
high+
```

를 release hard gate로 사용한다.

## Vite chunk warning

현재 Vite 기본:

```text
500 kB uncompressed
```

chunk warning을 사용한다.

CP8은 이를
“limit을 올리기 전에 조사해야 하는 최소 trigger”로 사용한다.

## Core Web Vitals

외부 웹 품질 참고:

```text
LCP <= 2.5s
INP <= 200ms
CLS <= 0.1
```

Frontend 내부 관찰 목표이지
Shared project requirement가 아니다.

---

# 149. CP8 Decision Log

## CP8-D01

Browser에 전달된 값은 public/extractable하다고 가정한다.

## CP8-D02

Credential은 local form state를 벗어나 persistent storage에 저장하지 않는다.

## CP8-D03

Auth token storage는 H-04 closure 전 결정하지 않는다.

## CP8-D04

Private Query Cache는 memory-only다.

## CP8-D05

ReservationDraft/ReturnContext만 제한적으로 sessionStorage를 사용한다.

## CP8-D06

`VITE_*`는 public configuration으로만 사용한다.

## CP8-D07

Raw HTML injection은 기본 금지한다.

## CP8-D08

Production logs에 PII/credential/token을 남기지 않는다.

## CP8-D09

Exact dependency pin + lockfile + `npm ci`를 유지한다.

## CP8-D10

Production dependency high/critical audit issue는 release blocker다.

## CP8-D11

Route-level code splitting을 기본 적용한다.

## CP8-D12

Vite 500kB chunk warning은 investigation trigger다.

## CP8-D13

Image loading/size는 travel UX의 핵심 performance concern으로 취급한다.

## CP8-D14

Core Web Vitals는 internal observation target으로 사용한다.

## CP8-D15

Production mock leakage는 S0다.

## CP8-D16

Production env는 missing API config를 localhost로 조용히 fallback하지 않는다.

## CP8-D17

Release artifact는 clean install/build에서 생성한다.

## CP8-D18

Release metadata에 Frontend/Docs/Backend SHA를 기록한다.

## CP8-D19

Rollback은 previous known-good frontend + Backend compatibility를 함께 고려한다.

## CP8-D20

현재 요구에 PWA/background sync/analytics/error vendor를 추가하지 않는다.

---

# 150. CP8 Completion Checklist

## Security

- [x] Data classification
- [x] Storage matrix
- [x] Credential policy
- [x] Auth storage gate
- [x] Private cache lifecycle
- [x] Draft privacy
- [x] ReturnContext safety
- [x] Vite environment policy
- [x] `.env` policy
- [x] XSS/raw HTML
- [x] URL safety
- [x] Logging/redaction
- [x] Error reporting boundary
- [x] source map policy
- [x] dependency security
- [x] dependency license
- [x] production mock safety
- [x] synthetic test data

## Performance

- [x] Performance North Star
- [x] NFR boundary
- [x] Core Web Vitals internal target
- [x] route code splitting
- [x] prefetch policy
- [x] bundle inspection
- [x] chunk investigation threshold
- [x] image strategy
- [x] responsive images
- [x] Hero priority
- [x] font policy
- [x] query efficiency
- [x] render locality
- [x] memoization policy
- [x] animation performance
- [x] layout shift
- [x] loading threshold

## Release

- [x] environment model
- [x] config validation
- [x] HTTPS/public API expectation
- [x] CORS/Auth boundary
- [x] security header boundary
- [x] SPA hosting
- [x] static asset caching
- [x] build artifact rule
- [x] production build smoke
- [x] release metadata
- [x] version coupling
- [x] rollback
- [x] stop/warning conditions
- [x] release readiness levels
- [x] security checklist
- [x] performance checklist
- [x] build checklist
- [x] operations checklist

---

# 151. CP8 Exit Status

```text
CP8 — SECURITY, PERFORMANCE & RELEASE READINESS
STATUS: COMPLETE
```

결과:

```text
Browser storage policy               LOCKED
Credential/privacy boundary          LOCKED
Auth storage deferral                LOCKED
Vite env/secret policy               LOCKED
XSS/raw HTML policy                  LOCKED
Logging/redaction                    LOCKED
Dependency security                  LOCKED
Production mock invariant            LOCKED

Route splitting strategy             LOCKED
Bundle investigation policy          LOCKED
Image/font performance strategy      LOCKED
Query/network efficiency             LOCKED
Motion/render performance            LOCKED
CWV observation target               LOCKED

Environment/release model            LOCKED
Production build checks              LOCKED
SPA hosting expectations             LOCKED
Release metadata                     LOCKED
Rollback principle                   LOCKED
Release readiness levels             LOCKED
```

---

# 152. Handoff to CP9

다음 Checkpoint:

```text
CP9 — FINAL PLAN AUDIT & MASTER PLAN ASSEMBLY
```

CP9은 새 정책을 많이 만드는 단계가 아니다.

목표:

```text
CP0~CP8 전체 cross-audit
최신 Shared baseline 재확인
문서 drift 수정
모순 제거
중복 규칙 정리
Contract Gate 최신화
IMP/PR/QA 연결 확인
final repository location 결정
IMPLEMENTATION-MASTER-PLAN 작성
개별 CP 산출물 업로드 구조 결정
기존 frontend planning/handoff의 stale v0.1.1/H-03 문구 정리 계획
```

CP9 종료 시:

> **다른 구현 세션이 CP 문서들과 Master Plan만 읽고
> Foundation부터 Release까지 같은 기준으로 실행할 수 있는 상태**

가 되어야 한다.