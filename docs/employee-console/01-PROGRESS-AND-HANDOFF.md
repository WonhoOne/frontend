# Employee Console — Progress Ledger and Next-Session Handoff

> Updated: 2026-10-13
> Document phase: P1 — CP1-B (Employee information architecture)
> Status: **P0 MERGED; CP0-A/B/C #46/#47/#48 and CP1-A #49 OPEN; CP1-B DRAFT / DEPENDENT / IA OWNER REVIEW PENDING**
> P1 checkpoint progress: **CP0-A/B REVIEW, CP0-C owner-approved A PC-only but unmerged, CP1-A DRAFT and CP1-B DRAFT; CP2 onward NOT STARTED**
> Next action: **owner reviews proposed IA-01..IA-05, and reviews/merges #46 → #47 → #48 → #49 → CP1-B dependent PR in order**. A PC-only is already owner-approved.

## Source and branch state

| Artifact | State |
| --- | --- |
| frontend/main | Snapshot `fa84f4b578a3969213bfc851d5b4fa8121ead66d` at CP0-A audit; Customer/Voice implemented, Employee pending |
| docs/main | Snapshot `f49d0457498e8b775f659a27e0c3a96d288d0ba0` at CP0-A audit; MUST re-fetch and inspect contract/Backend implementation in CP0-B |
| [historical frontend PR #3](https://github.com/WonhoOne/frontend/pull/3) | reference: Customer planning package CP0–CP11 |
| [historical frontend PR #7](https://github.com/WonhoOne/frontend/pull/7) | reference: Customer implementation CP0–CP9 plan |
| [closed frontend PR #44](https://github.com/WonhoOne/frontend/pull/44) | **CLOSED, NOT MERGED, NOT A CURRENT SPEC** |
| P0 replacement planning PR | [Frontend PR #45 — P0 planning program](https://github.com/WonhoOne/frontend/pull/45), **MERGED 2026-10-13** |
| Employee detailed planning CP0–CP11 | **CP0-A/B REVIEW, CP0-C device approved but unmerged, CP1-A/B DRAFT**; CP2 onward NOT STARTED |
| CP0-A PR branch | [PR #46 — Frontend runtime and reuse audit](https://github.com/WonhoOne/frontend/pull/46), **OPEN / REVIEW / unmerged**; branch `docs/employee-console-cp0-a-runtime-inventory-20261013` |
| CP0-B stacked branch | [PR #47 — Backend contract audit](https://github.com/WonhoOne/frontend/pull/47), **OPEN / REVIEW / unmerged**, currently targets CP0-A branch, **must retarget to main after #46 merges** |
| CP0-C stacked PR | [PR #48 — Scope/device/demo gate](https://github.com/WonhoOne/frontend/pull/48), **OPEN / DRAFT / DEVICE A APPROVED**; targets CP0-B branch, retarget to main after #46/#47 merge |
| CP1-A stacked PR | [PR #49 — Employee task flows](https://github.com/WonhoOne/frontend/pull/49), **OPEN / DRAFT / DEPENDENT**, targets CP0-C branch; only retarget to main after #48 merge |
| CP1-B stacked PR | [PR #50 — Information architecture & role-safe routes](https://github.com/WonhoOne/frontend/pull/50), **OPEN / DRAFT / OWNER IA REVIEW PENDING**, targets CP1-A branch; only retarget to main after #49 merge |
| Employee implementation | **NOT STARTED** |

## Stage tracker

| Stage | Status | Proof/gate |
| --- | --- | --- |
| P0 reference discovery | `PRE-SCOUT ONLY` | Mobbin canonical flow/screen URLs; actual visual verification pending CP2-A |
| P0 planning program | `MERGED` | [PR #45](https://github.com/WonhoOne/frontend/pull/45) merged; [program](00-PLANNING-PROGRAM.md) approved for execution |
| CP0-A — current frontend code inventory | `REVIEW` | [CP0-A source audit](planning/CP0-A-FRONTEND-RUNTIME-INVENTORY.md) committed on CP0-A PR branch; user review/merge pending |
| CP0-B — shared/back-end contract verification | `REVIEW` | [CP0-B Backend Employee contract audit](planning/CP0-B-BACKEND-EMPLOYEE-CONTRACT-AUDIT.md) committed on stacked review branch; Backend/main `597cf92f1baf93211862d4ea5dbfa8a199b808a2`; no new tests run |
| CP0-C — scope and device policy | `REVIEW / OWNER DECISION APPROVED` | [CP0-C scope, device and demo gate](planning/CP0-C-SCOPE-DEVICE-DEMO-GATE.md); **A PC-only confirmed** 2026-10-13; Nov23 final report, Nov24 demo; [PR #48](https://github.com/WonhoOne/frontend/pull/48) draft/stacked, unmerged |
| CP1-A — Employee operator tasks/flows | `DRAFT / DEPENDENT` | [CP1-A task flows](planning/CP1-A-OPERATOR-TASK-FLOWS.md): auth, Product list/create/edit, inventory read/add, session exit + errors and acceptance scenarios; on branch based on CP0-C unmerged head |
| CP1-B — site IA/navigation | `DRAFT / DEPENDENT / IA OWNER REVIEW PENDING` | [CP1-B Information Architecture](planning/CP1-B-INFORMATION-ARCHITECTURE.md): proposals only for Employee login, Product/Inventory nav, create/edit URL structure, role-safe deep links. No routes approved. |
| CP2 — visual reference comparison/direction | `NOT STARTED` | Full Mobbin visual review pending |
| CP3 — component/design-system reuse | `NOT STARTED` | No reuse matrix |
| CP4 — operational motion/feedback | `NOT STARTED` | No motion contract |
| CP5 — data/mutation UI state | `NOT STARTED` | No state-machine evidence |
| CP6 — screens, cross-screen/contract/readiness audits | `NOT STARTED` | No Employee screen specs |
| CP7 — implementation architecture | `NOT STARTED` | No design against existing modules |
| CP8 — API/data UX | `NOT STARTED` | No final query/mutation policy |
| CP9 — approved device scope + a11y | `NOT STARTED` | Device support undecided |
| CP10 — Employee QA acceptance | `NOT STARTED` | No per-screen E2E matrix |
| CP11 — final audit and implementation handoff | `NOT STARTED` | No approved final implementation plan |
| P2 coding | `BLOCKED ON P1 GATE` | Do not code on basis of P0 document |

## CP0-A verified key findings (2026-10-13, documentation-only)

- **Critical:** [auth.adapter.ts](../../src/features/auth/auth.adapter.ts) explicitly rejects `EMPLOYEE` with `FORBIDDEN`, despite the low-level Backend login decoder recognizing `EMPLOYEE`; see [CP0-A audit](planning/CP0-A-FRONTEND-RUNTIME-INVENTORY.md).
- **Critical:** customer `AppRouteLayout` unconditionally renders Customer header, PostLoginPreviousTrips and CustomerVoiceControl. Future Employee routes must avoid Customer-only side effects.
- Existing app + HTTP client, Query, generic UI controls, skeleton/error states, CSS tokens, MSW, Vitest and Playwright can provide an extension base. No Employee routes, feature DataSources or Inventory decoder currently exist on inspected main.
- **No tests run** in CP0-A; no Backend Employee code audited (reserved for CP0-B).
- CP0-A is `REVIEW` until its own PR merges. Source snapshot: frontend `fa84f4b...`, docs `f49d045...`.

## CP0-B — Backend contract source audit (2026-10-13)

- **Backend v0.2 is source-aligned:** 5 EMPLOYEE endpoints (TourProduct GET/POST/PUT; Inventory GET/POST) and shared login exist; Spring Security requires `EMPLOYEE` for `/api/v1/employee/**`. Product writer enforces 2/3 complete KRW style-price sets and linked-Schedule Theme lock 409; Inventory POST is additive with pessimistic row locking.
- **Important frontend risk:** Stock-add POST has no approved idempotency-key contract, so uncertain network outcomes must not trigger blind retries. Backend uses Java 64-bit `long` stock quantities; JavaScript precision risk needs future CP8.
- **Account readiness unproven:** Employee bootstrap exists but is off by default; existence of any Employee login in a deployed demo DB has not been checked.
- **Backend test sources inspected**, including MockMvc/H2 and MySQL-targeted tests; **none executed in this chat**.
- [Detailed CP0-B source report](planning/CP0-B-BACKEND-EMPLOYEE-CONTRACT-AUDIT.md); Backend SHA `597cf92f...`, Docs SHA `f49d045...`.
- **Merge order**: CP0-A PR #46 → CP0-B stacked PR (after verifying main base) → CP0-C.

## CP0-C — Assignment, scope and responsive/demo decision (2026-10-13)

- [CP0-C proposal](planning/CP0-C-SCOPE-DEVICE-DEMO-GATE.md): Original two-page course assignment confirms Employee product planning and adding warehouse goods; **no explicit Employee phone/mobile requirement**. Approved v0.2 confirms 5 Employee operations + shared Backend-provisioned Employee account.
- **COURSE DATES:** 2026-10-12 midterm report, 2026-10-13 midterm presentation, **2026-11-23 final report and source submission**, **2026-11-24 UML/implementation demo**. Past submission/presentation completion is unknown.
- **OWNER-APPROVED:** A desktop-only Employee UX confirmed 2026-10-13. All employee critical operations and accessible keyboard/focus/zoom apply to PC; tablet/phone not acceptance targets. Alternative B/C not selected.
- **PROPOSED:** Employee sign-in/role gating → Tour create/update → four-item stock read/add → persistence/negative QA demonstration; actual target Employee credentials, fixture/database and presenter remain unverified.
- **Status:** `REVIEW / DEVICE DECISION RESOLVED`, but CP0-A/B/C PRs still unmerged at 2026-10-13 check. Merge dependency chain #46 → #47 → #48 before CP0 freeze. No tests or application code changed.

## CP1-A — Employee task flow draft (2026-10-13)

- User explicitly chose **A PC-only** and said "next"; CP1-A source-grounded task-flow analysis was performed and committed to an **unmerged dependent branch**.
- [CP1-A task flow spec](planning/CP1-A-OPERATOR-TASK-FLOWS.md): **T01–T07**, flowcharts F01–F07, acceptance targets S01–S12, 401/403/409/422, ambiguous non-idempotent Inventory POST and Java long/JS precision safeguards.
- **No route names, UI layout, modal vs page pattern, dashboard metrics, mobile support, or implementation** is decided by this task-flow draft.
- **Status:** `DRAFT / DEPENDENT` — CP0-A/B/C must be approved/merged, CP1-A must be reviewed/merged before CP1-B becomes accepted.

## CP1-B — Employee information architecture proposal (2026-10-13)

- [Detailed CP1-B IA comparison](planning/CP1-B-INFORMATION-ARCHITECTURE.md) is a **DRAFT / DEPENDENT** artifact; actual Employee URLs or navigation are not yet implemented.
- Recommended IA-01..IA-05 (not owner-approved): separate staff-facing login entry using existing Backend Auth API; Product list as default (no dashboard); top-level Products and Inventory; addressable Product list/create/edit URLs; stock addition within inventory screen context.
- Source-driven guardrails: Employee layout must not host Customer travel-history popup / Customer voice; existing Customer Auth model rejects Employee; no Employee detail GET. Safe validated staff return-to must not reuse ReservationDraft-specific return context unchanged.
- **Owner review requested:** accept IA-01..IA-05 as a group or request changes. Exact nav chrome, table/card layout, stock inline vs modal, graphic design are **deferred** to visual CP2-A and screen CP6.
- #46/#47/#48/#49 **not merged** on check; CP1-B lives atop CP1-A. Only after owner review and ordered merge is CP1-B COMPLETE. Tests not run; no runtime code changed.

## Open decisions (do not silently assume)

1. **RESOLVED DEC-C01:** Owner chose **A — desktop/PC-only** on 2026-10-13. Employee phone/tablet responsive layouts are **not** mandatory; do not re-ask or introduce mobile QA gates.
2. CP1: route and authentication entry/recovery/navigation decisions; no employee URL fixed at P0.
3. CP2: real screen-level Mobbin visual inspection; visual direction is not decided by reference titles.
4. CP5/CP8: detailed handling of ambiguous POST outcomes, invalid API responses, concurrent stock additions and PUT Theme 409; Backend is final authority.
5. CP6: actual screen inventory and whether create/edit need distinct routed pages vs shared editor patterns.

## How to continue in a fresh chat

1. Verify latest PR states via GitHub; #46, #47 and #48 were unmerged, CP0-C is on a stacked branch **based on CP0-B head**, and **device A has been approved**. Do not repeat the device question.
2. Read current `WonhoOne/docs/main` and `frontend/AGENTS.md`.
3. Read [00-PLANNING-PROGRAM.md](00-PLANNING-PROGRAM.md) for exact CP0-A definition, inputs and gate.
4. Review/merge #46 first, retarget/review/merge #47 against latest main, then retarget/review/merge CP0-C PR against latest main **after user decision**. Never mark earlier PRs merged before verified.
5. CP0-C report is updated and decision A already recorded. **Do not redo CP0-C research or ask device choice again**. Process review merges in sequence. If CP1-A source-flow drafting was explicitly requested before merge, it must be on a dependent draft PR with clear blockers, never declared approved.
6. User requested the next checkpoint again, so [CP1-B IA DRAFT](planning/CP1-B-INFORMATION-ARCHITECTURE.md) is now authored on CP1-A's **unmerged head**. Review/merge PRs in order #46 → #47 → #48 → #49 → CP1-B, retargeting each base to main after predecessors merge. Obtain IA-01..IA-05 owner approval; no UI implementation until CP11.

## Checkpoint update template

```md
Date:
Current base refs: frontend/main SHA, docs/main SHA, Backend ref as relevant
Checkpoint: CPx-Y
Status: NOT STARTED / IN PROGRESS / REVIEW / COMPLETE / BLOCKED
Evidence / files inspected: <links to exact paths or commit refs>
Decisions: CONFIRMED / FRONTEND PROPOSAL / TBD / BLOCKED BY SHARED CONTRACT
Output artifact: <file path and commit>
Known blockers & owner:
Validation / audit:
Next checkpoint:
```

**Integrity policy:** If the new session cannot fetch GitHub or no artifact/commit exists, it must not mark the checkpoint complete. A previous chat answer is not a durable merged source.
