# CP6-I — Final Implementation Readiness Review

> Status: **COMPLETE**  
> Date baseline: 2026-09-29  
> Scope: CP0–CP6-H, S01–S11, and current `WonhoOne/docs/main` shared contracts  
> Final CP6 verdict: **SCREEN-SPEC COMPLETE / UI BUILD READY / LIVE INTEGRATION CONTRACT-GATED**

---

# 1. Final Verdict

CP6 is complete.

The original CP6 completion definition was:

> 각 화면 MD 하나만 읽어도 정상·로딩·오류·모바일·모션·상호작용까지 구현할 수 있고,  
> 개발자가 추가적인 UX 결정을 거의 하지 않아도 되는 상태.

That condition is satisfied for all 11 customer-facing surfaces.

However, CP6-I makes an important distinction:

```text
Screen-spec readiness
≠
live Backend integration readiness
```

The Frontend can now build the complete visual/component/state shell against contract-safe fixtures.

Real end-to-end integration must keep the documented P0 contract gates open rather than hard-code assumptions.

---

# 2. Baseline Decision Used for CP6-I

The latest v0.1.1 shared documents were explicitly verified on:

```text
WonhoOne/docs
branch: main
```

Therefore, by the shared documents' own rule that v0.1.1 becomes active once merged to `docs/main`,
CP6-I uses:

```text
Development Baseline v0.1.1
```

as the planning baseline.

The remaining “Proposal until merged” banners inside those files are stale documentation text and should be cleaned up by the docs owner.

This is a documentation-governance cleanup, not a reason for the Frontend to ignore v0.1.1.

---

# 3. 11-Screen Final Readiness Matrix

| Screen | Spec | UI Build | State/Motion | Responsive/A11y | Live Integration | Main Gates |
|---|---|---|---|---|---|---|
| S01 Home | READY | READY | READY | READY | GATED | Theme↔TourProduct, Tour DTO |
| S02 Tours | READY | READY | READY | READY | GATED | Theme↔TourProduct, Tour DTO |
| S03 Tour Detail | READY | READY | READY | READY | GATED | TourProduct, Schedule, participantCount, Honeymoon mapping |
| S04 Configure | READY | READY | READY | READY | GATED | participantCount, option contract, price |
| S05 Reservation Review | READY | READY | READY | READY | GATED | participantCount, Auth, Reservation DTO, price |
| S06 Reservation Success | READY | READY | READY | READY | GATED | Reservation DTO, recruitment mapping, SMS/status |
| S07 Reservation Detail | READY | READY | READY | READY | GATED | Auth, Reservation status, Honeymoon mapping |
| S08 Login | READY | READY | READY | READY | GATED | Auth DTO/session |
| S09 Signup | READY | READY | READY | READY | GATED | Auth/signup DTO |
| S10 Previous Trips Popup | READY | READY | READY | READY | GATED | Auth, Travel History DTO, popup timing decision |
| S11 My Trips | READY | READY | READY | READY | GATED | Auth, Travel History DTO |

Meaning of `GATED`:

> The screen is implementable with contract-safe fixtures, but the final API mapping must wait for the listed shared contracts.

No screen requires additional visual/UX invention before component implementation begins.

---

# 4. Screen-by-Screen Implementation Handoff Test

The CP6-I test was:

> “If a fresh implementation session receives this screen MD plus the shared CP0–CP5 documents, can it build the UI without making up UX?”

Result:

```text
S01 PASS
S02 PASS
S03 PASS
S04 PASS
S05 PASS
S06 PASS
S07 PASS
S08 PASS
S09 PASS
S10 PASS
S11 PASS
```

For every screen, the implementation session can determine:

```text
purpose
entry/exit
desktop structure
mobile structure
exact section order
components
CTA behavior
loading
empty
error
retry/refresh
motion
edge cases
accessibility
API dependency
TBD/blocker
acceptance criteria
```

---

# 5. Active P0 Contract Gates

These are no longer “maybe relevant if v0.1.1 wins.”
CP6-I treats them as active because v0.1.1 exists on `docs/main`.

## P0-01 — Theme ↔ TourProduct

Shared model:

```text
Theme 1 ─ N TourProduct
```

Frontend visual model:

```text
4 Theme-first discovery entries
```

Required contract/product decision:

```text
Theme discovery
→ how TourProducts under the Theme are selected
→ which TourProduct ID enters /tours/:tourId
```

Do not hard-code one Theme = one TourProduct.

Affected:

```text
S01
S02
S03
```

---

## P0-02 — Reservation participantCount

v0.1.1 requires:

```text
Reservation.participantCount >= 1
```

and one reservation may represent multiple participants.

Current Screen Specs deliberately do not invent the control placement.

Required decision:

```text
Where is participantCount selected?

Tour Detail
Configure
or
Reservation Review
```

Also define:

```text
default
range
availability validation
price relationship
```

Affected:

```text
S03–S07
```

---

## P0-03 — Honeymoon Couple/Team Mapping

Frontend/team intent:

```text
2 couples / 2 teams
```

Shared v0.1.1 rule:

```text
participantCount sum >= 4
```

Shared domain currently has no Couple/Team entity or count.

Until reconciled:

```text
CoupleProgress
```

may be built visually but must not derive live state from arbitrary participant totals.

Required shared decision:

```text
official participant-only UX
or
official couple/team semantics + API/domain support
or
validated fixed pair/team reservation rule
```

Affected:

```text
S03
S06
S07
```

---

## P0-04 — Authentication

Need:

```text
signup/login DTO
credential fields
JWT vs session
token/cookie format
refresh/session expiry
protected route policy
reservation auth gate
```

Affected:

```text
S05
S07–S11
```

---

## P0-05 — TourProduct DTO

Need enough data for:

```text
id
Theme link
product name
display/basic information
```

Affected:

```text
S01–S04
```

---

## P0-06 — TourSchedule DTO

Need:

```text
schedule id
product relation
period
availability
participant total
confirmation/recruitment state
```

Affected:

```text
S03–S07
```

---

## P0-07 — TourConfiguration / Option Contract

Need:

```text
Hotel
Transport
Meal
Extras
IDs
availability
compatibility
default mapping
```

Affected:

```text
S04–S07
```

---

## P0-08 — Reservation DTO / Error Contract

Need:

```text
POST request
POST response
detail response
participantCount
configuration mapping
validation errors
409/422 semantics
status enum
```

Affected:

```text
S05–S07
```

---

## P0-09 — Price Contract

Need server-owned representation of:

```text
base/current total
option deltas if exposed
participant effect
final total
```

Frontend must not own business price calculation.

Affected:

```text
S04–S11 price surfaces
```

---

## P0-10 — Travel History DTO

Need:

```text
product
period
Tour Style
price
canonical date/order fields
item ID if supplied
pagination if supplied
```

Affected:

```text
S10
S11
```

---

# 6. P1 Decisions / Parallel Integration Items

These do not block starting CP7/component construction.

## P1-01 — Loyalty Discount

v0.1.1 treats Loyalty Discount as a functional requirement.

Still TBD:

```text
eligibility
rate
timing
stacking
```

Frontend should be structurally capable of rendering a Backend-supplied discount line, but must not calculate it.

## P1-02 — SMS

v0.1.1 requires actual SMS on first schedule confirmation.

Frontend implication:

```text
“출발 확정 시 SMS로 알려드립니다.”
```

is safe under that contract.

Do not display delivery success unless Backend exposes it.

## P1-03 — Voice payload

The visual Voice state machine is ready.

Final command/event payload still needs:

```text
command
parameters
recognized result
failure shape
GUI apply boundary
```

## P1-04 — Transaction login → Previous Trips Popup timing

Normal login:

```text
Login
→ Previous Trips Popup
```

is fixed.

Only the transaction interruption exception needs team sign-off:

```text
Login during reservation
→ restore transaction
→ defer popup once
```

---

# 7. What Can Be Implemented Immediately

The following can proceed without waiting for shared DTOs:

```text
App shell
routing shell
Design Tokens
Typography
Container/Grid
GlobalHeader
TransactionHeader
Button/Input/OptionCard
Dialog/BottomSheet
Status/Badge
Skeleton/Empty/Error
Motion primitives
Image loading primitive
Home visual layout
Tours visual layout
Tour Detail section components
Configure OptionGroup
Configure live Summary using mock state
Review composition
Success composition
Reservation Detail composition
Login/Auth visual shell
Signup profile field shell
Previous Trips list components
My Trips list/archive components
responsive behavior
keyboard/focus semantics
reduced-motion behavior
component tests against fixtures
```

Mock fixtures must live behind a clear adapter/boundary and must not become accidental API types.

---

# 8. What Must Not Be Frozen Yet

Do not finalize these in frontend code until their contract closes:

```text
one Theme = one TourProduct
actual tour DTO field names
actual schedule field names
participantCount UX rules
Honeymoon couple count calculation
auth credential fields
JWT/session storage
protected route rules
real Hotel/Transport/Meal option IDs
option compatibility
price formula
discount formula
Reservation request/response schema
Reservation status enum
History item detail route
History pagination parameters
Voice payload
SMS delivery-status UI
```

Any temporary implementation must be obviously replaceable.

---

# 9. Required Architecture Boundary for CP7

CP7 should make contract uncertainty cheap to replace.

Recommended boundary:

```text
UI / Domain View Model
        ↑
mapper / adapter
        ↑
API Contract DTO
```

Do **not** let API-draft field names leak throughout page components.

Recommended conceptual separation:

```text
api/
  transport/client

adapters/
  tour
  schedule
  configuration
  reservation
  history
  auth

domain/
  frontend-facing view models

features/
  screen/domain components
```

Exact folder names belong to CP7, but the architectural intent is mandatory:

> unresolved shared DTOs must be isolated at the integration edge.

---

# 10. Final Route Review

Current screen-spec route model:

```text
/
├── /tours
├── /tours/:tourId
├── /tours/:tourId/configure
├── /reservation/review
├── /reservation/:reservationId/success
├── /reservations/:reservationId
├── /login
├── /signup
└── /my-trips
```

Status:

```text
UX route model READY
```

Exception:

The path shape is usable, but the transition from Theme discovery to actual `tourId`
must respect the Theme↔TourProduct contract.

No history-detail route is invented.

---

# 11. Final Product Semantics Review

## Fixed

```text
4 Themes
3 Tour Styles
Honeymoon/Parents no Classic
Style != Configuration
Hotel/Transport/Meal customizable
Travel History recent-first
Backend final business-rule authority
No payment/refund
Voice limited-command direction
```

## Active contract reconciliation

```text
Theme vs TourProduct
participantCount
Honeymoon 2 couples vs 4 participants
```

These are the only remaining product-model issues that materially threaten the current screen flow itself.

Everything else primarily affects data integration, not layout architecture.

---

# 12. Final State-System Review

All screens use the CP5 model where applicable:

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

Mutations:

```text
Idle
Submitting
Success
Failure
Retrying
```

Verified global invariants:

```text
no generic full-page spinner as default
successful content survives partial failure
retry is localized
refresh keeps existing content
image failure has designed fallback
auth interruption preserves meaningful transaction state
duplicate submit is blocked
```

Result:

```text
PASS
```

---

# 13. Final Motion-System Review

Verified:

```text
Home/Tours → Tour Detail
= Signature Shared Transition

transaction routes
= Standard Forward/Back Page Transition

Configure
= local selection + summary + price motion

Recruitment
= state-change motion only

dialogs/sheets
= shared motion primitives

reduced motion
= semantic state preserved
```

No remaining screen-specific invented motion contract.

Result:

```text
PASS
```

---

# 14. Final Accessibility / Responsive Readiness

Each Screen Spec defines Desktop and Mobile separately.

All screens have explicit or inherited rules for:

```text
keyboard
focus-visible
touch >= 44px
semantic headings
dialog focus trap
error association
color-independent status
reduced motion
image alt strategy
```

The final breakpoint/device stress testing still belongs to CP9.

For screen-spec readiness:

```text
PASS
```

---

# 15. CP6 Exit Checklist

## Screen Coverage

- [x] S01 Home
- [x] S02 Tours
- [x] S03 Tour Detail
- [x] S04 Configure
- [x] S05 Reservation Review
- [x] S06 Reservation Success
- [x] S07 Reservation Detail
- [x] S08 Login
- [x] S09 Signup
- [x] S10 Previous Trips Popup
- [x] S11 My Trips

## Specification Depth

- [x] Purpose
- [x] Routes / Entry / Exit
- [x] Required Data
- [x] Desktop
- [x] Mobile
- [x] Exact section order
- [x] Components
- [x] CTA
- [x] Interactions
- [x] Motion
- [x] Loading
- [x] Empty
- [x] Error
- [x] Retry / Refresh
- [x] Edge cases
- [x] Accessibility
- [x] API dependencies
- [x] TBD / blockers
- [x] Acceptance criteria

## Cross-System Review

- [x] CP0 scope alignment
- [x] CP1 IA alignment
- [x] CP2 visual alignment
- [x] CP3 Design System alignment
- [x] CP4 Motion alignment
- [x] CP5 State alignment
- [x] Cross-screen consistency audit
- [x] Shared-contract/TBD audit
- [x] Current `docs/main` contract re-check
- [x] Final readiness matrix
- [x] Safe-to-build vs contract-gated work separation

---

# 16. CP6 Final Status

```text
CP6 — SCREEN SPECIFICATIONS
STATUS: COMPLETE
```

Qualification:

```text
UI / UX implementation readiness:
READY

Mock-backed component/page implementation:
READY

Final live API integration:
CONTRACT-GATED
```

This is not a failure of CP6.

CP6 correctly identifies contract gaps instead of resolving them by assumption.

---

# 17. Next Planning Checkpoint

## CP7 — Component Architecture

CP7 should translate the completed Screen Specs into:

```text
component ownership
feature boundaries
shared vs domain components
frontend domain/view models
API adapter boundaries
state ownership
query/mutation ownership
route composition
form architecture
skeleton pairing
test boundaries
```

The highest-priority CP7 constraint is:

> **Keep v0.2 DTO uncertainty at adapters, not inside visual components.**

That allows Frontend implementation to proceed now while the Backend/docs team closes the P0 contracts.
