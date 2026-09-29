# CP6-H — Contract / TBD Audit

> **HISTORICAL / SUPERSEDED AUDIT — retained for traceability.**  
> This audit records the pre-v0.1.2 state. Its H-00/H-03 conclusions were superseded by Shared Baseline **v0.1.2**, which formally defines Honeymoon couple semantics. For current implementation decisions use `docs/implementation/IMPLEMENTATION-MASTER-PLAN.md` and the CP0~CP9 implementation checkpoints. Do not treat unresolved H-03 language below as current policy.


> Status: **COMPLETE**  
> Audit date baseline: 2026-09-29  
> Scope: CP0–CP6-G Frontend planning + current `WonhoOne/docs` default branch  
> Purpose: Separate approved facts, frontend-only decisions, unresolved shared contracts, and implementation blockers before CP6-I.

---

# 1. Executive Result

CP6-H is complete.

The 11 Screen Specs remain **UX-spec complete**, but “Screen Spec Ready” is not the same as “integration unblocked.”

The audit found four categories:

```text
A. Confirmed / safe to implement
B. Frontend-local decisions
C. Shared-contract blockers
D. Shared-contract status conflicts that must be resolved before CP6-I can declare full readiness
```

Most loading, responsive, motion, component, and recovery work can begin now.

However, final data-flow implementation must not freeze several assumptions until the shared contract is clarified.

---

# 2. Critical Governance Finding — Baseline Status Ambiguity

The current default branch of `WonhoOne/docs` contains:

```text
baseline/BASELINE-v0.1.1.md
requirements/* v0.1.1
api/api-spec-draft.md v0.1.1
database/erd-draft.md v0.1.1
```

but those files still explicitly label v0.1.1 as:

```text
Proposal until merged into docs/main
```

and `README.md` also says v0.1 remains the approved baseline until that proposal is merged.

At the same time, these proposal files are currently readable from the repository default branch.

Therefore CP6-H does **not** silently treat v0.1.1-only refinements as approved.

## H-00 — Required governance decision

**Priority: P0**

Owner:

```text
WonhoOne/docs manager / shared-contract owner
```

Required answer:

```text
Which baseline is the active implementation baseline now?

A. v0.1
B. v0.1.1
```

If v0.1.1 is approved, the proposal/status text should be updated so agents cannot interpret it two ways.

Until then:

- do not let Frontend invent missing v0.1.1 details;
- do not erase the current CP6 UX work;
- treat v0.1.1-only changes below as conditional contract gates.

---

# 3. High-Impact v0.1.1 Candidate Changes

The latest shared proposal introduces refinements that materially affect Frontend.

## H-01 — Theme and TourProduct are distinct

Latest proposal:

```text
Theme
= fixed category

TourProduct
= actual employee-managed travel product

Theme 1 ─ N TourProduct
```

API:

```text
GET /api/v1/tours
GET /api/v1/tours/{tourId}
```

where `tours` means `TourProduct`.

### Current CP6 assumption

The current Home / Tours / Tour Detail experience is strongly Theme-first and often visually treats the four themes as the four primary “tours.”

### Contract risk

If one Theme may contain multiple TourProducts, then:

```text
Theme card
→ immediately /tours/:tourId
```

cannot be hard-coded unless the product catalog guarantees one active TourProduct per Theme.

### Priority

**P0 if v0.1.1 is active.**

### Owner

```text
Shared docs + Backend
Frontend consumes decision
```

### Required contract

At minimum:

```text
TourProduct DTO:
- id
- Theme
- product name
- display/basic information

GET /api/v1/tours filtering/grouping behavior
```

And product/UX decision:

```text
Theme
→ TourProduct selection
→ TourProduct Detail
```

### Affected screens

```text
S01 Home
S02 Tours
S03 Tour Detail
```

### Frontend status

Visual Theme-first discovery can remain.

Data/routing assumption “one Theme = one product” is **blocked**.

---

# 4. Reservation Participant Count

## H-02 — `participantCount` now exists in candidate contract

Latest proposal says:

```text
Reservation.participantCount >= 1
one Reservation can include multiple participants
TourSchedule enrollment = sum(participantCount)
```

### Current CP6 gap

The current customer flow has no explicit participant-count control.

### Why this matters

If v0.1.1 is active, the user must be able to express the reservation count somewhere before:

```text
POST /api/v1/reservations
```

### Priority

**P0 if v0.1.1 is active.**

### Required team decision

Choose the UX placement:

```text
Tour Detail
or
Configure
or
Reservation Review
```

and define:

```text
default participantCount
allowed range
availability validation
whether count changes price
whether count changes option availability
```

The Frontend must not invent these.

### Affected screens

```text
S03 Tour Detail
S04 Configure
S05 Reservation Review
S06 Reservation Success
S07 Reservation Detail
```

---

# 5. Honeymoon — 2 Couples vs 4 Participants

## H-03 — Semantic contract conflict

Current Frontend/team UX intent:

```text
Honeymoon confirmation
= 2 couples / 2 teams
```

Latest shared proposal:

```text
HONEYMOON_ROMANCE confirmation
= sum(participantCount) >= 4
```

The shared Domain Model currently has no:

```text
Couple
Team
coupleCount
teamCount
```

and a Reservation may have any integer `participantCount >= 1`.

### Consequence

The Frontend cannot safely calculate:

```text
1 / 2 couples
```

from arbitrary participant totals or reservation counts.

Example:

```text
Reservation A participantCount = 1
Reservation B participantCount = 3
```

The schedule has 4 participants, but that is not necessarily “2 couples.”

### Priority

**P0.**

This must be reconciled even if the visual intention remains 2 couples.

### Required shared rule

One of the following must be explicitly approved:

```text
A. Honeymoon is modeled as 4 participants;
   Frontend displays participant progress.

B. Honeymoon is officially 2 couples/teams;
   shared domain/API adds enough semantics to compute couple/team progress.

C. Every Honeymoon reservation is constrained to a defined pair/team size;
   Backend validates that rule and API exposes it.
```

CP6-H does not choose among these on behalf of the team.

### Affected components

```text
CoupleProgress
Tour Detail recruitment state
Reservation Success
Reservation Detail
```

---

# 6. Authentication Contract

## H-04

**Priority: P0 for real integration.**

Current fixed endpoint skeleton:

```text
POST /api/v1/auth/signup
POST /api/v1/auth/login
```

Still unresolved:

```text
login identifier
credential/secret fields
signup DTO
login DTO
response DTO
JWT vs session
token format
refresh behavior
logout/session expiry
protected-route policy
reservation auth gate
```

### Owner

```text
Shared docs + Backend
```

### Frontend can build now

```text
AuthSurface
modal/full-page structure
form states
return-context behavior
error/loading UI
```

### Frontend cannot finalize

```text
actual fields
auth storage
request payload
protected-route enforcement
401 recovery implementation
```

Affected:

```text
S05 Review
S07 Reservation Detail
S08 Login
S09 Signup
S10 Previous Trips Popup
S11 My Trips
```

---

# 7. Tour / Schedule DTO

## H-05 — TourProduct DTO

**Priority: P0 integration blocker.**

Need at least enough fields to support:

```text
tourId
Theme
product name
basic/display information
allowed Style / catalog linkage as agreed
```

The endpoint path is fixed; response shape is not.

Affected:

```text
S01–S04
```

## H-06 — TourSchedule DTO

**Priority: P0 integration blocker.**

Frontend needs:

```text
scheduleId
TourProduct linkage
period
availability
recruitment participant total
confirmed/recruiting representation
```

Exact enum/fields remain TBD.

Affected:

```text
S03–S07
```

---

# 8. Configuration Contract

## H-07 — TourConfiguration and option catalogs

**Priority: P0 for full Configure integration.**

Confirmed concept:

```text
Style
Hotel
Transport
Meal
Extras
```

Still unresolved:

```text
Hotel options
Transport options
Meal options
option IDs
availability
compatibility
default-vs-replacement semantics
Extras structure
Champagne/Coffee rules
```

Latest Product Catalog confirms Champagne/Coffee are additional food/beverage options,
but does not define detailed selection rules.

### Owner

```text
Shared docs + Backend
```

### Frontend can build now

```text
OptionGroup
OptionCard
summary
partial loading/error
disabled/error surfaces
```

with contract-conforming mock data.

### Cannot finalize

actual option list and payload mapping.

Affected:

```text
S04 Configure
S05 Review
S06 Success
S07 Detail
```

---

# 9. Reservation API Contract

## H-08

**Priority: P0 integration blocker.**

Fixed endpoints:

```text
POST /api/v1/reservations
GET /api/v1/reservations/{reservationId}
```

Need v0.2 definition for:

```text
request DTO
response DTO
participantCount representation
TourConfiguration representation
validation errors
409/422 mapping
reservation identity
reservation status enum
```

### Note

Cancellation is explicitly not part of the current v0.1.1 requirement set.
Frontend correctly does not add cancel/refund UI.

---

# 10. Price and Loyalty Discount

## H-09 — Price formula

**Priority: P0 for final price correctness; not a blocker for visual component construction.**

Still TBD:

```text
base price
option delta
participantCount effect
calculation timing
rounding/currency rules if any
```

Frontend must not calculate business price independently.

## H-10 — Loyalty Discount

Latest proposal makes Loyalty Discount a functional requirement, while details remain TBD:

```text
eligibility
rate
application timing
stacking
```

This means the Frontend should reserve a presentation path for:

```text
subtotal
discount (if supplied by Backend)
final total
```

but must not promise or compute a discount yet.

Affected:

```text
S04 Configure
S05 Review
S06 Success
S07 Detail
S10/S11 Travel History price display
```

---

# 11. Travel History Contract

## H-11

**Priority: P0 for post-login/history integration.**

Fixed endpoint:

```text
GET /api/v1/customers/me/travel-history
```

Confirmed behavior:

```text
recent-first
product
period
Tour Style
price
```

Still unresolved:

```text
response DTO
canonical date fields
item identifier
Theme/image metadata
pagination
history-detail navigation
```

### Important

A dedicated History Detail route is **not required** by current contract.

Therefore:

```text
Previous Trips Popup
My Trips
```

can be complete without clickable history items.

Affected:

```text
S10
S11
```

---

# 12. SMS Confirmation

## H-12

Latest v0.1.1 proposal strengthens confirmation notification to:

```text
first TourSchedule confirmation
→ actual SMS sent to applicant customers
```

Provider/API remains TBD.

### Priority

```text
Backend/system final-demo blocker
Frontend P1
```

### Frontend implication

If v0.1.1 is approved, customer copy can say:

```text
출발이 확정되면 SMS로 알려드립니다.
```

but Frontend must not claim:

```text
SMS sent
```

unless Backend exposes actual delivery state.

No new public SMS endpoint should be invented.

Owner:

```text
Backend + shared docs
```

---

# 13. Voice Contract

## H-13

Current Voice contract only fixes the direction:

```text
Speech
→ STT
→ predefined command interpretation
→ GUI state update and/or Backend API
→ Backend validation
```

Candidate commands exist, but final commands/parameters are TBD.

### Priority

```text
P1 for customer GUI stage-2 integration
```

### Need

At least:

```text
command type
parameters
recognized payload
failure payload
frontend application/acknowledgement boundary
```

Owner:

```text
ai-console + shared docs/backend contract where applicable
```

Frontend can implement the visual Voice state machine now,
but not final event payload integration.

---

# 14. Post-login Previous Trips Timing

## H-14

Original requirement:

```text
login
→ previous trip list popup
```

Frontend proposal introduces one exception:

```text
transactional auth interruption
→ restore transaction first
→ delay popup
```

### Priority

```text
P1 product decision
```

This does not require Backend changes.

Owner:

```text
Frontend + team/shared docs if behavior must be normative
```

### Required decision before CP6-I final handoff

Either:

```text
A. Popup always immediately after every login
```

or:

```text
B. Transactional login may defer the popup once
```

Until then, normal-login behavior is fixed; only the transaction exception is conditional.

---

# 15. Frontend-Local TBDs — Not Shared-Contract Blockers

The following do **not** require Backend/API decisions and should not hold up basic Frontend implementation.

They can be resolved by the Frontend owner during implementation/CP6-I handoff:

```text
hero/theme image assets
final editorial copy
exact editorial card crop
exact desktop card width within token limits
empty-state visual artwork
Popup visual density
exact image alt text after asset selection
whether dirty Signup/Configure form shows discard confirmation
local mock fixtures
static-vs-backend Home content implementation, once Theme/TourProduct mapping is settled
```

These must still obey CP2–CP5.

---

# 16. Backend-Internal TBDs — Not Frontend Blockers by Themselves

The latest shared docs also leave these unresolved:

```text
Customer/Employee DB persistence model
TravelHistory separate table or derived query
Inventory deduction timing
Inventory detailed history
SMS provider vendor
detailed ERD PK/FK/indexes
```

Frontend should not wait for these **unless they change a public API contract**.

---

# 17. Contract Gate Matrix

| ID | Contract / Decision | Priority | Owner | Affected Frontend | Can UI build start? | Blocks final integration? |
|---|---|---|---|---|---|---|
| H-00 | Active baseline v0.1 vs v0.1.1 | P0 | Docs/team | All | Yes, cautiously | Yes |
| H-01 | Theme ↔ TourProduct flow | P0* | Docs + Backend | S01–S03 | Components yes | Yes if v0.1.1 |
| H-02 | participantCount UX/API | P0* | Docs + Backend + Frontend | S03–S07 | Shell yes | Yes if v0.1.1 |
| H-03 | Honeymoon couples vs 4 participants | P0 | Team + Docs + Backend | S03/S06/S07 | Visual only | Yes |
| H-04 | Auth DTO/session/gates | P0 | Backend + Docs | S05/S07–S11 | Shell yes | Yes |
| H-05 | TourProduct DTO | P0 | Backend + Docs | S01–S04 | Mock yes | Yes |
| H-06 | TourSchedule DTO | P0 | Backend + Docs | S03–S07 | Mock yes | Yes |
| H-07 | Configuration/options contract | P0 | Backend + Docs | S04–S07 | Mock yes | Yes |
| H-08 | Reservation DTO/error/status | P0 | Backend + Docs | S05–S07 | Mock yes | Yes |
| H-09 | Price formula | P0 | Backend + Docs | S04–S11 | UI yes | Yes for correct price |
| H-10 | Loyalty rule | P1/P0 final | Team + Backend + Docs | price surfaces | Placeholder path yes | Yes for FR-15 |
| H-11 | Travel History DTO | P0 | Backend + Docs | S10/S11 | Mock yes | Yes |
| H-12 | Actual SMS provider/behavior | P1 FE / P0 system | Backend + Docs | S06/S07 copy | Yes | System final |
| H-13 | Voice final payload | P1 | ai-console + Docs | S03/S04 | Visual yes | Stage-2 integration |
| H-14 | Transaction login popup timing | P1 | Frontend + Team | S08/S10 | Yes | Product sign-off |

`P0*` means priority depends on whether v0.1.1 is confirmed as active.

---

# 18. Minimum Contract Package Needed from Backend/Docs

For Frontend to move from mock-backed implementation to real integration, the minimum useful v0.2 package is:

```text
1. Active baseline declaration

2. Auth
   - signup request/response
   - login request/response
   - auth mechanism
   - protected route policy

3. TourProduct
   - list/detail response
   - Theme linkage

4. TourSchedule
   - list/detail response
   - period
   - availability
   - participant total
   - confirmation state

5. TourConfiguration
   - option identities
   - availability/compatibility
   - selected config representation

6. Reservation
   - create request
   - create/detail response
   - participantCount
   - validation/error format
   - status

7. Price
   - server-calculated price representation
   - loyalty discount representation

8. Travel History
   - response DTO
   - recent-order guarantee/canonical date
   - pagination if used
```

Voice and SMS provider details can proceed in parallel,
but are still required for the complete system requirements if v0.1.1 is approved.

---

# 19. Safe Frontend Work Before Contract Closure

The Frontend owner can proceed without violating shared contracts on:

```text
Design tokens
Typography / grid / responsive shell
GlobalHeader / TransactionHeader
Buttons / fields / OptionCard
Dialog / BottomSheet
Skeleton / Empty / Error
Motion primitives
Home visual shell
Tour collection visual components
Tour Detail editorial components
Configure OptionGroup + Summary components
Review layout
Success/Detail state surfaces
Auth shells
Travel History card/list components
mock fixtures clearly separated from API types
```

Implementation rule:

> Mock data may model the Screen Spec, but must not become the de facto shared API schema.

---

# 20. CP6-H Exit Criteria

- [x] Current shared docs re-read from repository
- [x] Baseline status ambiguity surfaced
- [x] All Screen Spec TBD/BLOCKED families consolidated
- [x] Shared-contract blockers separated from Frontend-local TBDs
- [x] Backend-internal TBDs separated from public-contract blockers
- [x] Theme/TourProduct candidate change impact identified
- [x] participantCount candidate change impact identified
- [x] Honeymoon couple/team semantic conflict identified
- [x] Auth blocker defined
- [x] Tour/Schedule blocker defined
- [x] Configuration blocker defined
- [x] Reservation blocker defined
- [x] Price/Loyalty blocker defined
- [x] Travel History blocker defined
- [x] SMS boundary defined
- [x] Voice boundary defined
- [x] post-login popup decision isolated
- [x] Minimum v0.2 contract package specified
- [x] Safe-to-start Frontend work identified
- [x] Critical contract notes added to affected Screen Specs

**CP6-H Status: COMPLETE**

Next: **CP6-I — Final Implementation Readiness Review**

Important: CP6-I may conclude “implementation-ready with contract gates” rather than “fully integration-ready” if the P0 decisions above are still open.


---

# 21. CP6-I Baseline Resolution Note

During CP6-I, the v0.1.1 files were explicitly fetched with:

```text
ref = main
```

from `WonhoOne/docs`.

Verified on `main`:

```text
baseline/BASELINE-v0.1.1.md
requirements/requirements.md
requirements/business-rules.md
requirements/domain-model.md
api/api-spec-draft.md
```

The v0.1.1 documents themselves state that they become the implementation baseline after merge into `docs/main`.
Because these files are present on `main`, CP6-I resolves H-00 operationally as follows:

```text
Planning / implementation baseline used by Frontend:
v0.1.1
```

The remaining `Proposal until merged into docs/main` banners are therefore treated as **stale governance text** that the docs owner should clean up.

This cleanup is important for agent clarity, but it is no longer treated as a reason for Frontend planning to fall back to v0.1.

Consequences:

- H-01 Theme ↔ TourProduct is an active contract gate.
- H-02 Reservation `participantCount` is an active contract gate.
- H-03 Honeymoon couple/team semantics conflict is an active contract gate.
- Other v0.1.1 DTO/price/loyalty/SMS refinements are treated as current planning inputs.

H-00 changes from:

```text
P0 implementation ambiguity
```

to:

```text
P1 docs-governance cleanup
```
