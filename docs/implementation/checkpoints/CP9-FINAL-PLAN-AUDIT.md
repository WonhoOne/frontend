# Mister World Frontend — CP9 Final Plan Audit

> Status: **COMPLETE**
> Checkpoint: **CP9 — Final Plan Audit & Master Plan Assembly**
> Date: **2026-09-30**
> Target repository: `WonhoOne/frontend`
>
> Final shared snapshot:
>
> ```text
> WonhoOne/docs/main
> 46fd61af7dc0ac4770305e7088c4e4ded9b78892
> baseline: v0.1.2
> ```
>
> Frontend repository snapshot:
>
> ```text
> WonhoOne/frontend/main
> 370b58ed94b482fec59ee32d34f2c2317f4c10ce
> ```
>
> Backend repository snapshot:
>
> ```text
> WonhoOne/backend/main
> 44f9882485a36a849e84c1c63225b09fc655864c
> ```

---

# 1. Objective

CP9는 새로운 Product/Architecture 결정을 만드는 단계가 아니다.

목표는 다음 네 가지다.

```text
1. CP0~CP8 상호 모순 감사
2. 최신 Shared Contract와 재대조
3. 기존 frontend 문서 drift 식별
4. 하나의 실행용 IMPLEMENTATION-MASTER-PLAN 조립
```

완료 기준:

> 다른 구현 세션이 과거 대화를 모르더라도
> Master Plan과 필요한 CP 문서만 읽고
> Foundation부터 Release까지 같은 기준으로 구현할 수 있어야 한다.

---

# 2. Final Source Precedence

구현 중 충돌이 생기면 다음 순서를 사용한다.

```text
1. WonhoOne/docs/main — latest approved Shared Contract
2. docs/implementation/IMPLEMENTATION-MASTER-PLAN.md
3. docs/implementation/checkpoints/CP0~CP9
4. current frontend planning/screen documents
5. historical audit/handoff documents
6. assumptions — never authoritative
```

중요:

- Shared Domain/API/Business Rule은 항상 `WonhoOne/docs/main`이 최상위다.
- Master Plan은 Frontend 내부 구현 정책의 최종 통합본이다.
- CP 문서는 Master Plan의 상세 근거다.
- 오래된 audit 문서가 최신 Shared Contract와 충돌하면 historical evidence로만 읽는다.
- Code와 Shared Contract가 충돌하면 구현을 멈추고 conflict를 surface한다.

---

# 3. Audit Scope

검사한 CP 산출물:

- `CP0-IMPLEMENTATION-BASELINE.md` — 31,488 bytes — sha256 `243cba711150`
- `CP1-CODE-QUALITY-STANDARDS.md` — 53,377 bytes — sha256 `8753b0000bfd`
- `CP2-FRONTEND-ARCHITECTURE-PLAN.md` — 52,136 bytes — sha256 `4bf7d9bf629d`
- `CP3-STATE-DATA-ARCHITECTURE.md` — 44,967 bytes — sha256 `090670083e0f`
- `CP4-FOUNDATION-IMPLEMENTATION-PLAN.md` — 52,085 bytes — sha256 `ae385c3763c6`
- `CP5-IMPLEMENTATION-ROADMAP.md` — 35,218 bytes — sha256 `984be2b7a143`
- `CP6-CONTRACT-LIVE-INTEGRATION-PLAN.md` — 44,781 bytes — sha256 `1e5dfa6030b2`
- `CP7-QA-TEST-PLAN.md` — 51,243 bytes — sha256 `1faab9043dce`
- `CP8-SECURITY-PERFORMANCE-RELEASE-READINESS.md` — 50,247 bytes — sha256 `6a1d0ab4bb93`

검사 축:

```text
Shared baseline
Domain semantics
Contract gates
Architecture ownership
State ownership
Toolchain
Implementation order
Live integration
QA/release
Security/privacy
Performance
Repository documentation drift
```

---

# 4. Final Audit Findings

## A-01 — Shared baseline

**PASS**

최신 승인 baseline은:

```text
v0.1.2
```

이다.

Honeymoon semantics:

```text
participantCount >= 2
participantCount is even
coupleCount = participantCount / 2
schedule confirms at >= 2 couples/teams
```

로 통일됐다.

별도 `Couple`/`Team` Entity는 없다.

---

## A-02 — Backend alignment

**PASS WITH INTEGRATION BLOCK**

Backend domain foundation은 v0.1.2와 정렬되어 있다.

확인된 내부 capability:

```text
Theme/TourStyle
participantCount invariant
Honeymoon even-pair invariant
couple derivation
schedule confirmation
first-confirmation transition
SmsSender application port
```

하지만 현재 public REST는 없다.

```text
Controller                0
Customer live endpoint    0
Approved DTO impl         0
Persistence               not implemented
Auth                      not implemented
```

따라서 Frontend live integration은 계속 IMP-6 gate다.

---

## A-03 — Frontend repository reality

**PASS**

현재 `frontend/main`은:

```text
planning/docs
source directory skeleton
implementation handoff
```

단계다.

React/Vite runtime은 아직 없다.

따라서 첫 코드 PR은 계속:

```text
PR-01 Foundation
```

이어야 한다.

---

## A-04 — CP0 baseline consistency

**PASS**

CP0는 v0.1.2로 이미 정정됐다.

현재 H gate:

```text
H-01 PARTIAL
H-02 PARTIAL
H-03 CLOSED
H-04 BLOCKED
H-05 BLOCKED
H-06 BLOCKED
H-07 BLOCKED
H-08 BLOCKED
H-09 BLOCKED
H-10 BLOCKED
```

CP6와 일치한다.

---

## A-05 — CP1 code-quality consistency

**PASS**

Human-readable code 정의와 Comment-heavy rule이
후속 Architecture/State/Test 계획과 충돌하지 않는다.

최종 원칙:

```text
readability > cleverness
explicitness > hidden behavior
delayed abstraction
comments explain WHY/CONTRACT/INVARIANT/LIFECYCLE/EDGE CASE
comment freshness is DoD
```

---

## A-06 — CP2 architecture ownership correction

**RESOLVED DURING CP9**

CP2 초안에는 `GlobalHeader` / `TransactionHeader`가
`shared/ui` 후보로 남아 있었고,
CP4에서 실제 ownership을:

```text
src/app/shell
```

로 더 구체화했다.

CP9에서 CP2 산출물을 CP4 결정과 일치하도록 수정했다.

최종:

```text
GlobalHeader       → src/app/shell
TransactionHeader  → src/app/shell
Shared UI          → business-agnostic primitives only
```

---

## A-07 — CP3 state architecture

**PASS**

최종:

```text
Server State       → TanStack Query
Transaction State  → ReservationDraft / React Context + reducer
Ephemeral UI       → local React state
```

Persistent browser state:

```text
ReservationDraft   → sessionStorage
ReturnContext      → memory + sessionStorage fallback
Private query      → memory only
Credential         → form local state only
```

후속 CP8 Security와 일치한다.

---

## A-08 — CP4 toolchain

**PASS / REVERIFIED 2026-09-30**

핵심 선택:

```text
Node 24.21.0 LTS
npm
React 19.3.0
Vite 8.3.1
React Router 8.4.0
TanStack Query 5.104.0
TypeScript 5.9.3
Vitest 5.0.2
Playwright 1.63.0
MSW 2.15.0
```

TypeScript 최신 stable은 더 높지만
typescript-eslint의 현재 공식 TypeScript 지원 범위가 `<6.1.0`이므로
5.9.3 유지가 의도적이다.

정책:

> version number 최신성보다 전체 toolchain의 공식 호환성을 우선한다.

---

## A-09 — CP5 implementation order

**PASS**

최종 dependency order:

```text
IMP-0 Foundation
→ IMP-1 App Runtime
→ IMP-2 Discovery
→ IMP-3 Transaction Core
→ IMP-4 Reservation
→ IMP-5 Account & Travel History
→ IMP-6 Live Backend Integration
→ IMP-7 Voice / Final Release
```

중요 dependency:

```text
ReservationDraft before Configure
Mock UI before Live DTO
Recovery model before Auth live integration
Voice after GUI Feature Actions
```

---

## A-10 — CP6 live integration

**PASS**

현재 live integration-ready customer endpoint:

```text
0
```

Path/method는 고정됐지만 DTO/Backend REST가 아직 없다.

Mock → Real 전환:

```text
approved contract
→ backend endpoint
→ runtime decode
→ DTO
→ Adapter
→ existing Frontend Model
→ existing Feature/UI
```

Page/Component가 source 교체 때문에 바뀌지 않는 것이 목표다.

---

## A-11 — CP7 QA

**PASS**

Release internal gate:

```text
J01~J10 = 10 / 10
S0 = 0
S1 = 0
```

Shared NFR의 9/10 minimum보다 강한
Frontend 내부 품질 기준이다.

QA layer:

```text
Static
Unit
Component
Feature Integration
Adapter Contract
E2E
Visual/Responsive
Accessibility/Manual
```

---

## A-12 — CP8 security/performance/release

**PASS**

최종 Security:

```text
VITE_* = public config
credential persistent storage = forbidden
Auth token persistence = contract-gated
raw HTML injection = forbidden by default
private Query cache = memory only
production mock leakage = S0
```

최종 Performance:

```text
route-level code splitting
responsive images
Hero priority only when intentional
polling off by default
cache/revalidation via TanStack Query
500kB Vite chunk warning = investigation trigger
```

최종 Release:

```text
clean install
verify
E2E
build
security/dependency review
production-like smoke
mock-off verification
release metadata
rollback path
```

---

# 5. Legacy Frontend Documentation Drift

현재 GitHub `frontend/main`에는
v0.1.2 이후 업데이트가 필요한 문서가 존재한다.

## Must update as current instructions

### `AGENTS.md`

현재 stale:

```text
current baseline v0.1.1
mandatory BASELINE-v0.1.1
```

수정:

```text
latest approved docs/main baseline
currently v0.1.2
```

또는 version hardcoding 대신
“docs/main의 latest approved baseline” 정책으로 작성한다.

### `docs/IMPLEMENTATION-START-HANDOFF.md`

현재 stale:

```text
BASELINE-v0.1.1
Honeymoon mapping unresolved
participantCount / 2 forbidden
```

Master Plan로 redirect하고
v0.1.2 gate matrix로 수정해야 한다.

### `docs/planning/12-IMPLEMENTATION-HANDOFF.md`

동일한 H-03 old conflict가 존재.

Current handoff인 만큼
v0.1.2로 갱신 필요.

### `docs/planning/07-SCREEN-SPECS.md`

2 couples UI 자체는 유지할 수 있지만:

```text
H-03 conflict
mapping unresolved
v0.1.1 baseline wording
```

은 제거/수정해야 한다.

### `docs/planning/10-RESPONSIVE-ACCESSIBILITY.md`

stale:

```text
H-03 live mapping contract gate
participant total → couple text calculation prohibited
```

v0.1.2 semantics로 수정한다.

### `docs/planning/11-QA-ACCEPTANCE.md`

stale:

```text
H-03 mapping not invented
participantCount / 2 prohibition-era checks
```

CP7 QA 기준으로 교체한다.

---

# 6. Historical Audit Treatment

다음 문서는 당시 상황을 기록한 audit이므로
전면 rewrite보다 **historical/superseded banner**를 추가하는 것이 낫다.

```text
docs/planning/audits/CP6-H-CONTRACT-TBD-AUDIT.md
docs/planning/audits/CP6-I-FINAL-IMPLEMENTATION-READINESS.md
```

상단에 명확히:

```text
Historical audit.
H-00/H-03 conclusions were superseded by Shared Baseline v0.1.2.
For current implementation use docs/implementation/IMPLEMENTATION-MASTER-PLAN.md.
```

를 추가한다.

과거 판단 과정을 지우지 않는다.

---

# 7. Final Contract Gate Matrix

| Gate | Status | Frontend may do | Must wait |
|---|---|---|---|
| H-01 Theme/TourProduct | PARTIAL | Theme-first Mock UX, real TourProduct route identity | public TourProduct DTO |
| H-02 participantCount | PARTIAL | validity model, Draft nullable slot | placement/default/max/API shape |
| H-03 Honeymoon | CLOSED | even validation, `/2` derived couple display | no Couple Entity/API invention |
| H-04 Auth | BLOCKED | UI shell, AuthState, ReturnContext | credential/session/token contract |
| H-05 Tour DTO | BLOCKED | View Models/fixtures | Request/Response DTO |
| H-06 Schedule DTO | BLOCKED | Schedule Models/states | public schedule DTO |
| H-07 Configuration | BLOCKED | mock options | IDs/catalog/compatibility/API |
| H-08 Reservation | BLOCKED | mutation harness/recovery UI | DTO/error/status/recovery |
| H-09 Price/Loyalty | BLOCKED | price display states | formula/amount/discount contract |
| H-10 History DTO | BLOCKED | history View Model/cache/UI | actual response fields |

---

# 8. Final Architecture Snapshot

```text
src/
  main.tsx

  app/
    config/
    errors/
    providers/
    router/
    shell/
    styles/

  pages/
    home/
    tours/
    tour-detail/
    configure/
    reservation-review/
    reservation-success/
    reservation-detail/
    login/
    signup/
    my-trips/

  features/
    tour-discovery/
    tour-detail/
    configuration/
    reservation/
    auth/
    travel-history/
    voice-bridge/

  integrations/
    backend/
    voice/

  shared/
    assets/
    hooks/
    lib/
    motion/
    ui/

  mocks/

tests/
  e2e/
```

Dependency:

```text
main
→ app
→ pages
→ features
→ integrations

pages/features
→ shared
```

Rules:

```text
shared never imports business Feature
Page has no raw DTO parsing
Raw Backend DTO stops at Adapter
Feature private deep import forbidden
App/Page orchestrates cross-feature flow
```

---

# 9. Final Implementation / PR Map

```text
PR-01  Foundation
PR-02  App Runtime
PR-03  Home + Tours
PR-04  Tour Detail
PR-05  ReservationDraft + Configure
PR-06  Review + Success + Reservation Detail
PR-07  Login + Signup + ReturnContext
PR-08  Previous Trips + My Trips
PR-09  Live Backend Adapters
PR-10  Voice Bridge
PR-11  Final Regression / Release
```

---

# 10. Final Repository Placement

새 구현 계획 package는
기존 UX planning과 분리해 다음에 둔다.

```text
docs/
  implementation/
    IMPLEMENTATION-MASTER-PLAN.md

    checkpoints/
      CP0-IMPLEMENTATION-BASELINE.md
      CP1-CODE-QUALITY-STANDARDS.md
      CP2-FRONTEND-ARCHITECTURE-PLAN.md
      CP3-STATE-DATA-ARCHITECTURE.md
      CP4-FOUNDATION-IMPLEMENTATION-PLAN.md
      CP5-IMPLEMENTATION-ROADMAP.md
      CP6-CONTRACT-LIVE-INTEGRATION-PLAN.md
      CP7-QA-TEST-PLAN.md
      CP8-SECURITY-PERFORMANCE-RELEASE-READINESS.md
      CP9-FINAL-PLAN-AUDIT.md
```

이유:

```text
docs/planning        = Product/UX planning
docs/implementation  = actual coding/execution plan
```

역할이 구분된다.

---

# 11. Repository Upload PR

권장 branch:

```text
docs/frontend-implementation-master-plan-v0.1.2
```

권장 commit split:

```text
docs: add frontend implementation master plan and checkpoints
docs: reconcile frontend handoff with shared baseline v0.1.2
docs: mark superseded contract audits as historical
```

PR에서:

```text
no production code change
shared baseline v0.1.2
frontend implementation policy only
```

를 명확히 한다.

---

# 12. Upload-Time File Maintenance

Implementation package와 함께 수정:

```text
AGENTS.md
docs/IMPLEMENTATION-START-HANDOFF.md
docs/planning/07-SCREEN-SPECS.md
docs/planning/10-RESPONSIVE-ACCESSIBILITY.md
docs/planning/11-QA-ACCEPTANCE.md
docs/planning/12-IMPLEMENTATION-HANDOFF.md
```

Historical banner:

```text
docs/planning/audits/CP6-H-CONTRACT-TBD-AUDIT.md
docs/planning/audits/CP6-I-FINAL-IMPLEMENTATION-READINESS.md
```

---

# 13. Final STOP Conditions

즉시 멈춤:

```text
docs/main과 code 충돌
새 shared endpoint 필요
DTO field 추측 필요
Auth persistence 추측 필요
participantCount default/max 결정 필요
price formula 필요
Reservation status 발명 필요
Travel History detail/pagination 발명 필요
Voice payload 추측 필요
```

---

# 14. Final CONTINUE Conditions

계약 없이도 계속 가능:

```text
layout
View Model
mock fixture
state architecture
responsive
a11y
loading/error
motion
test harness
adapter interface
```

---

# 15. Audit Conclusion

CP0~CP8은 CP9 correction 이후
하나의 실행 체계로 일관된다.

Resolved internal inconsistency:

```text
CP2 Header ownership
→ src/app/shell
```

Resolved prior baseline drift inside CP artifacts:

```text
v0.1.1 → v0.1.2
Honeymoon H-03 → CLOSED
```

Remaining open items은
계획 모순이 아니라 Shared Contract/Backend 구현 dependency다.

따라서:

```text
Frontend implementation planning = COMPLETE
Live integration contract closure = PENDING
Frontend implementation itself   = READY TO START
```

---

# 16. CP9 Exit Status

```text
CP9 — FINAL PLAN AUDIT & MASTER PLAN ASSEMBLY
STATUS: COMPLETE
```

Final verdict:

```text
CP0~CP9                     COMPLETE
Internal plan contradictions 0 known after correction
Shared baseline             v0.1.2
Foundation implementation   READY
Mock-backed IMP-0~IMP-5     READY
Live IMP-6                  CONTRACT/BACKEND GATED
Voice IMP-7 integration     CONTRACT GATED
Repository upload           READY FOR NEXT STEP
```