# Mister World Frontend — Implementation Start Handoff

> **CURRENT IMPLEMENTATION NOTICE — 2026-09-30**  
> Shared implementation baseline is **v0.1.2**. For current coding decisions, read `docs/implementation/IMPLEMENTATION-MASTER-PLAN.md` first. Older H-03 “Honeymoon mapping unresolved” language in pre-v0.1.2 planning is superseded.


> Status: **READY FOR IMPLEMENTATION**  
> Date: 2026-09-29  
> Repository: `WonhoOne/frontend`  
> Base branch: `main`  
> Current main baseline: planning package + source-directory skeleton merged  
> Next phase: **Implementation PR-01 — Foundation**

---

# 1. What Has Already Been Completed

The frontend planning phase is finished.

```text
CP0   Scope & Contract                  COMPLETE
CP1   Information Architecture          COMPLETE
CP2   Visual Direction                  COMPLETE
CP3   Design System                     COMPLETE
CP4   Motion System                     COMPLETE
CP5   UI State System                   COMPLETE
CP6   Screen Specifications             COMPLETE
CP7   Component Architecture            COMPLETE
CP8   Data & API UX                     COMPLETE
CP9   Responsive & Accessibility        COMPLETE
CP10  QA & Acceptance                   COMPLETE
CP11  Implementation Handoff            COMPLETE
```

The repository now contains:

- the complete CP0–CP11 planning package
- 11 screen specifications
- contract/readiness audits
- repository documentation
- a human-readable source-directory skeleton under `src/`
- PR template and agent instructions

Planning work should not be restarted unless a new shared requirement or contract change invalidates an existing decision.

---

# 2. Current Repository State

At the start of the next implementation session, `main` already contains the agreed directory structure.

```text
frontend/
├── README.md
├── AGENTS.md
├── .github/
│   └── pull_request_template.md
├── docs/
│   ├── README.md
│   ├── IMPLEMENTATION-START-HANDOFF.md
│   └── planning/
├── public/
├── src/
│   ├── README.md
│   ├── app/
│   │   ├── router/
│   │   ├── providers/
│   │   ├── config/
│   │   └── errors/
│   ├── pages/
│   ├── features/
│   ├── integrations/
│   ├── shared/
│   └── mocks/
└── tests/
    └── e2e/
```

Most source folders currently contain only `.gitkeep`.

There is **no React/Vite scaffold yet**.

There is **no runtime implementation yet**.

There is **no real Backend integration yet**.

That is intentional.

---

# 3. Mandatory Reading Before Coding

Read in this order.

## Repository rules

1. `AGENTS.md`
2. `README.md`
3. `src/README.md`

## Shared SSOT

Read the latest approved files in `WonhoOne/docs/main`.

Minimum required set:

```text
baseline/BASELINE-v0.1.2.md
requirements/requirements.md
requirements/product-catalog.md
requirements/domain-model.md
requirements/business-rules.md
requirements/non-functional-requirements.md
architecture/system-architecture.md
architecture/repository-responsibilities.md
api/api-spec-draft.md
CONTRIBUTING.md
AGENTS.md
```

## Frontend planning

Read:

```text
docs/planning/00-PLANNING-INDEX.md
docs/planning/08-COMPONENT-ARCHITECTURE.md
docs/planning/09-DATA-AND-API-UX.md
docs/planning/10-RESPONSIVE-ACCESSIBILITY.md
docs/planning/11-QA-ACCEPTANCE.md
docs/planning/12-IMPLEMENTATION-HANDOFF.md
```

Before implementing a screen, also read its corresponding file in:

```text
docs/planning/screens/
```

Critical audits:

```text
docs/planning/audits/CP6-H-CONTRACT-TBD-AUDIT.md
docs/planning/audits/CP6-I-FINAL-IMPLEMENTATION-READINESS.md
```

---

# 4. Product / Design Direction

Do not reinterpret the visual direction.

North Star:

```text
Cinematic Travel
×
Luxury Editorial
×
Modern Product UI
```

Important characteristics:

- warm ivory / charcoal / restrained muted-brass palette
- large editorial typography
- photography-led layouts
- generous whitespace
- restrained motion
- no generic SaaS-dashboard look
- no overuse of glassmorphism
- no default full-page spinner
- layout-matched skeletons
- mobile is a deliberate layout transformation, not a shrunk desktop page

Primary experience chain:

```text
Theme
→ TourProduct
→ Style
→ Schedule
→ Configuration
→ Review
→ Reservation
```

---

# 5. Architecture Rule

The most important implementation boundary is:

```text
Backend DTO
→ integrations adapter
→ feature-local frontend model
→ feature/page UI
```

Raw Backend DTOs must not spread through page or visual components.

Frontend-facing models belong close to the feature that owns them.

Example:

```text
features/configuration/
├── components/
├── model/
├── hooks/
└── index.ts
```

Avoid creating another top-level business-domain hierarchy unless the codebase later proves it is actually needed.

---

# 6. Top-Level Source Ownership

## `src/app/`

Application bootstrap only.

Owns:

- providers
- router
- global config
- global error boundaries

Does not own feature logic.

## `src/pages/`

Route-level composition.

Pages arrange feature components and route/query states.

Pages must not contain raw API mapping or business rules.

## `src/features/`

User-facing behavior.

Current feature areas:

```text
tour-discovery
tour-detail
configuration
reservation
auth
travel-history
voice-bridge
```

Feature-local models, hooks, and domain-semantic components belong here.

## `src/integrations/`

External-system boundary.

```text
integrations/backend/
├── client/
├── contracts/
└── adapters/

integrations/voice/
```

Only approved API contracts belong in `contracts/`.

## `src/shared/`

Business-agnostic reusable frontend building blocks.

```text
ui
motion
hooks
lib
assets
```

Do not move a component here just because it is visually reusable if it still knows Mister World business meaning.

## `src/mocks/`

Development-only fixtures and scenarios.

Mocks are not API contracts.

---

# 7. First Implementation Task

The next session should create:

## PR-01 — Foundation

Recommended branch:

```text
feat/frontend-foundation
```

The exact branch name is flexible, but keep the PR focused on foundation work.

### Include

```text
React + TypeScript scaffold
Vite or equivalent frontend build setup
package.json
tsconfig
lint / format baseline
test runner baseline

App bootstrap
AppProviders
Router shell
Error Boundary

Design Token variables
global/reset styles
PageContainer / basic layout primitives

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

Motion tokens / reduced-motion baseline

Mock infrastructure
Test infrastructure
E2E runner baseline
```

### Do not include yet

```text
full Home page polish
full Tour Detail implementation
real Login integration
real Reservation submission
real pricing
real option API integration
participantCount assumptions
Honeymoon couple calculation
Voice/STT implementation
```

---

# 8. Recommended Technology Defaults

React + TypeScript are fixed by shared project scope.

Recommended frontend-local defaults:

```text
Vite
React Router
TanStack Query
Vitest
React Testing Library
Playwright
MSW
CSS Custom Properties for Design Tokens
CSS Modules or another scoped styling solution
```

These are recommendations, not shared business contracts.

If choosing something different, record the reason in the PR.

Do not introduce a large framework or state-management library unless it solves a concrete requirement from CP7–CP10.

---

# 9. Foundation PR Acceptance Criteria

PR-01 is done only when all of the following are true.

## Runtime

- [ ] app boots locally
- [ ] production build succeeds
- [ ] route placeholders can mount
- [ ] global providers mount without feature assumptions
- [ ] Error Boundary works

## Design foundation

- [ ] tokens are centralized
- [ ] no random color/spacing constants across primitives
- [ ] reduced-motion path exists
- [ ] focus-visible baseline exists
- [ ] touch-target baseline is respected

## Shared UI

- [ ] Button states
- [ ] TextField label/error state
- [ ] OptionCard selected/disabled/focus behavior
- [ ] Dialog focus trap and focus return
- [ ] BottomSheet accessible close path
- [ ] Skeleton reduced-motion behavior
- [ ] ImageFrame loading/failure state

## Testing

- [ ] unit/component runner works
- [ ] React Testing Library setup works
- [ ] E2E runner can launch the app
- [ ] at least one primitive accessibility/interaction test exists
- [ ] mock infrastructure boots

## Contract safety

- [ ] no invented API endpoint
- [ ] no invented DTO
- [ ] no hidden participant count default
- [ ] no frontend price engine
- [ ] Honeymoon logic, if present in later feature work, follows v0.1.2 (`participantCount >= 2`, even, derived `coupleCount = participantCount / 2`) and does not invent Couple/Team entities or API fields
- [ ] no fake Auth/session strategy

---

# 10. Critical Shared Contract Gates

Do not solve these inside Frontend by assumption.

## H-01 Theme ↔ TourProduct

Shared model:

```text
Theme 1:N TourProduct
```

Do not use:

```ts
const tourId = theme;
```

The exact Theme → TourProduct product-selection behavior still needs an approved decision.

## H-02 Reservation participantCount

The shared model contains participant count, but Frontend placement/default/range are not yet approved.

Do not send a hidden permanent default.

## H-03 Honeymoon semantics — CLOSED in v0.1.2

Approved Shared Contract:

```text
HONEYMOON_ROMANCE participantCount >= 2
participantCount is even
coupleCount = participantCount / 2
TourSchedule confirms at >= 2 derived couples/teams
```

`Couple` / `Team` remain derived semantics, not separate Shared entities.

Frontend may derive couple count only from a valid Honeymoon participant count. It must not invent a separate Couple/Team persistence model or assume a `coupleCount` API field.

## H-04 Authentication

Still contract-gated:

- credential fields
- request/response DTO
- session/JWT mechanism
- refresh behavior
- protected-route policy
- reservation auth gate

## H-05–H-10

Still gated:

- TourProduct DTO
- TourSchedule DTO
- Configuration / options contract
- Reservation DTO / error / status
- Price contract
- Travel History DTO

When blocked:

```text
implement UI/View Model boundary
→ use clearly marked mock
→ raise contract gap
→ connect approved adapter later
```

---

# 11. Never Invent

The implementation session must not invent:

```text
Backend endpoint paths
shared DTO field names
JWT/session storage
refresh-token endpoint
participantCount defaults
Honeymoon team/couple calculation
Hotel / Transport / Meal official catalogs
price formula
loyalty discount formula
Reservation status enum
History detail route
History pagination
SMS delivery state
Voice payload
```

---

# 12. Mock Rules

Mocks are expected in early implementation.

Correct:

```text
mock fixture
→ frontend View Model
→ feature UI
```

Later:

```text
approved DTO
→ adapter
→ same View Model
→ same feature UI
```

A mock JSON structure must not accidentally become the presumed Backend response shape.

Use names that make the source obvious:

```text
mock
fixture
scenario
demo
```

---

# 13. State Ownership

Keep three state classes separate.

## Server state

Examples:

```text
TourProduct
TourSchedule
Reservation
Travel History
server-calculated price
availability
```

Owned by the query/data layer.

## Transaction state

Examples:

```text
style
schedule
hotel
transport
meal
extras
participant count after contract closure
```

Owned by `ReservationDraft`.

The draft must eventually support:

```text
serializable
versionable
sessionStorage recovery
explicit reset
```

## Ephemeral UI state

Examples:

```text
dialog open
sheet open
hover
focus
local animation state
```

Owned locally.

Do not put everything into one global store.

---

# 14. Data / Retry Rules

Baseline data policy:

```text
F0  price / final validation            always-current
F1  schedule/recruitment/availability   short-lived
F2  TourProduct                         minutes-scale
F3  Travel History                      session-friendly cache
F4  static/editorial                    static
```

Read query transient retry:

```text
max 1 automatic retry
```

Mutation:

```text
automatic retry = 0
```

Reservation submit is pessimistic.

Do not auto-resubmit after Login.

---

# 15. Loading / Error Rules

Default loading:

```text
layout-matched skeleton
progressive image
partial content
local retry
```

Do not default to a full-page spinner.

If successful content exists and a background refresh fails:

```text
keep successful content
show local stale/error state
allow retry
```

Do not erase the screen.

---

# 16. Responsive / Accessibility Baseline

Breakpoints:

```text
640
768
1024
1280
1440
```

Stress widths:

```text
320
360
390
430
768
1024
1280
1440
1728+
```

Required:

- keyboard navigation
- visible focus
- minimum 44×44px touch targets
- semantic buttons/links
- visible field labels
- Dialog/Sheet focus management
- 200% zoom critical-flow usability
- safe-area handling
- software-keyboard handling
- reduced-motion support
- non-color-only status communication

Accessibility is part of implementation, not a later cleanup phase.

---

# 17. Implementation Sequence After Foundation

Recommended order:

```text
PR-01 Foundation / Tokens / Shared UI / Router / Test Harness

PR-02 App Shell / Router completion / State Harness / Motion

PR-03 Home + Tours

PR-04 Tour Detail

PR-05 ReservationDraft + Configure

PR-06 Reservation Review + Success + Reservation Detail

PR-07 Login + Signup + ReturnContext

PR-08 Previous Trips Popup + My Trips

PR-09 Real Backend Adapters
      as contracts close

PR-10 Voice Bridge
      after event contract closes

PR-11 Cross-screen polish / regression / release QA
```

Do not attempt all 11 screens in one PR.

---

# 18. Screen Completion Rule

A screen is not complete when only the happy path renders.

Completion includes, where applicable:

```text
Success
Loading
Empty
Error
Retry
Desktop
Mobile
Keyboard
Focus
Reduced Motion
Image failure
Relevant network simulation
```

Use the corresponding screen specification and `11-QA-ACCEPTANCE.md` as the acceptance contract.

---

# 19. QA / Release Rules

Master QA document:

```text
docs/planning/11-QA-ACCEPTANCE.md
```

Critical frontend E2E journeys:

```text
J01 Browse → Review
J02 Reservation Success
J03 Auth Interruption
J04 Option Conflict
J05 Schedule Conflict
J06 Previous Trips
J07 Offline Recovery
J08 Refresh During Transaction
J09 Keyboard-only Journey
J10 320px Mobile Journey
```

Release target:

```text
10 / 10 critical journeys PASS
S0 = 0
S1 = 0
```

---

# 20. Git / PR Working Method

Start each implementation unit from the latest `main`.

Do not continue implementation on old planning/setup branches.

A PR should include:

- scope
- requirement IDs
- affected screens
- shared APIs used
- contract assumptions
- tested states
- responsive evidence
- accessibility evidence
- unit/integration/E2E evidence where applicable

Use:

```text
.github/pull_request_template.md
```

---

# 21. STOP Conditions

Stop implementation and raise a contract issue if:

- docs and code conflict
- an endpoint is needed but not defined
- a DTO field must be guessed
- a business rule must be invented
- participantCount behavior must be guessed
- Honeymoon couple/team mapping must be guessed
- Auth/session persistence must be guessed
- price calculation must be invented

Do not “temporarily” solve these in production code.

---

# 22. CONTINUE Conditions

You may continue without Backend contract closure when working on:

- visual layout
- shared primitive structure
- motion primitives
- responsive behavior
- accessibility behavior
- loading/error states
- mock-backed View Models
- adapter interfaces
- state harnesses
- tests

---

# 23. First Session Expected Deliverables

The next implementation session should ideally end with:

```text
React/TypeScript project boots
build works
routing shell exists
AppProviders exist
tokens compile
shared primitives render
Dialog/Sheet keyboard behavior works
motion token layer exists
Skeleton/Image states exist
mock harness exists
test baseline passes
README local setup is updated
```

It should **not** end with rushed page implementation.

The first session is successful if the foundation is clean enough that every later page can be built without restructuring the repository.

---

# 24. Copy-Paste Prompt for the Next Implementation Session

```text
You are starting implementation of the Mister World customer-facing frontend in WonhoOne/frontend.

Start from the latest main branch. Do not reuse old planning/setup branches.

Before coding:
1. Read AGENTS.md, README.md, and src/README.md.
2. Read the mandatory current shared contracts in WonhoOne/docs/main.
3. Read docs/planning/00-PLANNING-INDEX.md.
4. Read docs/planning/08-COMPONENT-ARCHITECTURE.md through 12-IMPLEMENTATION-HANDOFF.md.
5. Read docs/IMPLEMENTATION-START-HANDOFF.md.
6. Read the CP6-H and CP6-I audits.

Your first implementation unit is Foundation only.

Create a focused implementation branch from main and scaffold React + TypeScript inside the already-created source structure. Set up the build, router shell, providers, error boundary, design tokens, shared UI primitives, motion baseline, skeleton/image primitives, mock infrastructure, and test/E2E baseline.

Architecture:
Backend DTO → integrations adapter → feature-local frontend model → feature/page UI.

Do not invent Backend endpoints, DTO fields, Auth mechanics, participantCount defaults/max values, Couple/Team entities or API fields, option catalogs, price formulas, Reservation status values, History detail routes, SMS delivery state, or Voice payloads.

Do not implement real Backend integration in the foundation PR.

Accessibility, loading/error states, reduced motion, and responsive behavior are part of the component implementation from the start, not later polish.

Use docs/planning/11-QA-ACCEPTANCE.md as the acceptance gate.
```

---

# 25. Final Handoff Status

```text
Planning              COMPLETE
Repository docs       COMPLETE
Source skeleton       COMPLETE
Implementation        NOT STARTED
Foundation PR         NEXT
Live API integration  CONTRACT-GATED
```

Next action:

```text
Start PR-01 — Frontend Foundation
```
