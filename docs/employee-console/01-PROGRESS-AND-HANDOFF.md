# Employee Console — Progress Ledger and Next-Session Handoff

> Updated: 2026-11-09
> Document phase: P1 — CP2-B (visual direction)
> Status: **P0, CP0-A/B/C, CP1-A/B COMPLETE; CP0 FROZEN. CP2-A PASS (2026-11-09).**
> P1 checkpoint progress: **CP0-A, CP0-B, CP0-C, CP1-A, CP1-B COMPLETE; CP2-A PASS; CP2-B NEXT; CP3 onward NOT STARTED**
> Next action: **CP2-B — Employee Console visual direction** from the [CP2-A §9 adopt/reject table](planning/CP2-A-REFERENCE-EVIDENCE-REGISTER.md) and current Customer tokens.
> Execution mode: owner delegated execution on 2026-11-09 — see [Frontend Completion Plan](../FRONTEND-COMPLETION-PLAN.md) §5 for what the agent decides and where it stops.

## 2026-11-09 — W1 closeout and delegated decisions

| Item | Result |
| --- | --- |
| Merge chain | #46 → #47 → #48 → #49 → #50 → #51 merged to main in order on 2026-11-09. #47–#51 were retargeted to `main` after #46 merged; CI ran on the combined #51 head before merging |
| CP0-A / CP0-B | COMPLETE. Key claims re-checked on 2026-11-09 against frontend `fa84f4b` and backend `597cf92` (Employee login rejected in `auth.adapter.ts`; Customer chrome always mounted in `AppRouteLayout`; `employee.bootstrap.enabled` default false; `/api/v1/employee/**` requires EMPLOYEE) |
| CP0-C | COMPLETE, **CP0 FROZEN**. DEC-C01 A PC-only (owner, 2026-10-13). DEC-C02 demo D1–D4 accepted, DEC-C04 superseded by Completion Plan schedule, DEC-C06 desktop Chrome — all **DELEGATED DECISION 2026-11-09**. DEC-C03 (demo DB / Employee account) and DEC-C05 (past course submissions) stay open |
| CP1-A | COMPLETE. Its open IA items were answered in CP1-B |
| CP1-B | COMPLETE. **IA-01..IA-05, IA-07 APPROVED by DELEGATED DECISION 2026-11-09**: `/employee/login` on shared login API; Products list as landing, no dashboard; two primary areas (여행상품 / 재고 관리); addressable `/employee/tours`, `/employee/tours/new`, `/employee/tours/:tourId/edit`; stock add inside `/employee/inventory`; return to list after create. IA-08 → CP6-D, IA-10 → CP2/CP6 |
| CP2-A | IN PROGRESS. Mobbin re-checked 2026-11-09: HTTP 403 bot block. **DELEGATED DECISION:** visual evidence from official Shopify/Square/Wix help-center screenshots, same PASS checklist (CP2-A §8) |

## 2026-11-09 — CP2-A PASS

- Six visual evidence cards (V1–V6) viewed in a browser from first-party sources: Shopify App Home Index and Details live previews, Wix Products and Inventory screenshots, Square Edit item and "Stock received" popover screenshots.
- Coverage: Product list (Shopify, Wix), Product create/edit (Shopify, Square), Inventory add (Square adopt, Wix reject).
- Strongest finding: Square's row-anchored popover "Current stock → Received → New total → Cancel/Done" matches the additive Inventory contract; Wix's inline overwrite of the current quantity is rejected.
- Open for CP2-B: save placement (dirty-only save bar vs fixed editor header Save).

## Source and branch state

| Artifact | State |
| --- | --- |
| frontend/main | Snapshot `fa84f4b578a3969213bfc851d5b4fa8121ead66d` at CP0-A audit; Customer/Voice implemented, Employee pending |
| docs/main | Snapshot `f49d0457498e8b775f659a27e0c3a96d288d0ba0` at CP0-A audit; MUST re-fetch and inspect contract/Backend implementation in CP0-B |
| [historical frontend PR #3](https://github.com/WonhoOne/frontend/pull/3) | reference: Customer planning package CP0–CP11 |
| [historical frontend PR #7](https://github.com/WonhoOne/frontend/pull/7) | reference: Customer implementation CP0–CP9 plan |
| [closed frontend PR #44](https://github.com/WonhoOne/frontend/pull/44) | **CLOSED, NOT MERGED, NOT A CURRENT SPEC** |
| P0 replacement planning PR | [Frontend PR #45 — P0 planning program](https://github.com/WonhoOne/frontend/pull/45), **MERGED 2026-10-13** |
| Employee detailed planning CP0–CP11 | **CP0-A/B/C, CP1-A/B COMPLETE; CP2-A PASS**; CP2-B NEXT |
| CP0-A PR branch | [PR #46 — Frontend runtime and reuse audit](https://github.com/WonhoOne/frontend/pull/46), **MERGED to main 2026-11-09** |
| CP0-B stacked branch | [PR #47 — Backend contract audit](https://github.com/WonhoOne/frontend/pull/47), **MERGED to main 2026-11-09** |
| CP0-C stacked PR | [PR #48 — Scope/device/demo gate](https://github.com/WonhoOne/frontend/pull/48), **MERGED to main 2026-11-09** |
| CP1-A stacked PR | [PR #49 — Employee task flows](https://github.com/WonhoOne/frontend/pull/49), **MERGED to main 2026-11-09** |
| CP1-B stacked PR | [PR #50 — Information architecture & role-safe routes](https://github.com/WonhoOne/frontend/pull/50), **MERGED to main 2026-11-09** |
| CP2-A stacked PR | [PR #51 — Provider reference comparison (partial)](https://github.com/WonhoOne/frontend/pull/51), **MERGED to main 2026-11-09** |
| Employee implementation | **NOT STARTED** |

## Stage tracker

| Stage | Status | Proof/gate |
| --- | --- | --- |
| P0 reference discovery | `PRE-SCOUT ONLY` | Mobbin canonical flow/screen URLs; actual visual verification pending CP2-A |
| P0 planning program | `MERGED` | [PR #45](https://github.com/WonhoOne/frontend/pull/45) merged; [program](00-PLANNING-PROGRAM.md) approved for execution |
| CP0-A — current frontend code inventory | `COMPLETE` | [CP0-A source audit](planning/CP0-A-FRONTEND-RUNTIME-INVENTORY.md) committed on CP0-A PR branch; user review/merge pending |
| CP0-B — shared/back-end contract verification | `COMPLETE` | [CP0-B Backend Employee contract audit](planning/CP0-B-BACKEND-EMPLOYEE-CONTRACT-AUDIT.md) committed on stacked review branch; Backend/main `597cf92f1baf93211862d4ea5dbfa8a199b808a2`; no new tests run |
| CP0-C — scope and device policy | `COMPLETE / CP0 FROZEN` | [CP0-C scope, device and demo gate](planning/CP0-C-SCOPE-DEVICE-DEMO-GATE.md); **A PC-only confirmed** 2026-10-13; Nov23 final report, Nov24 demo; [PR #48](https://github.com/WonhoOne/frontend/pull/48) draft/stacked, unmerged |
| CP1-A — Employee operator tasks/flows | `COMPLETE` | [CP1-A task flows](planning/CP1-A-OPERATOR-TASK-FLOWS.md): auth, Product list/create/edit, inventory read/add, session exit + errors and acceptance scenarios; on branch based on CP0-C unmerged head |
| CP1-B — site IA/navigation | `COMPLETE / IA-01..05, IA-07 DELEGATED APPROVAL` | [CP1-B Information Architecture](planning/CP1-B-INFORMATION-ARCHITECTURE.md): proposals only for Employee login, Product/Inventory nav, create/edit URL structure, role-safe deep links. No routes approved. |
| CP2-A — reference screen and flow audit | `PASS (2026-11-09)` | [CP2-A provider reference evidence](planning/CP2-A-REFERENCE-EVIDENCE-REGISTER.md) compares official Shopify/Wix/Square documented Product/Inventory interactions; actual Mobbin screenshots not accessible/viewed, so **NO CP2-A PASS** |
| CP2-B — visual direction | `NOT STARTED / DEPENDENT` | Cannot decide art direction before CP2-A visual verification and CP1-B IA signoff |
| CP3 — component/design-system reuse | `NOT STARTED` | No reuse matrix |
| CP4 — operational motion/feedback | `NOT STARTED` | No motion contract |
| CP5 — data/mutation UI state | `NOT STARTED` | No state-machine evidence |
| CP6 — screens, cross-screen/contract/readiness audits | `NOT STARTED` | No Employee screen specs |
| CP7 — implementation architecture | `NOT STARTED` | No design against existing modules |
| CP8 — API/data UX | `NOT STARTED` | No final query/mutation policy |
| CP9 — approved device scope + a11y | `NOT STARTED` | **A PC-only already approved**, exact desktop viewport/browser + keyboard/a11y checks still TBD |
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

## CP2-A — provider reference research, visual access BLOCKED (2026-10-13)

- [CP2-A research register](planning/CP2-A-REFERENCE-EVIDENCE-REGISTER.md) documents **OFFICIAL-DOC VERIFIED** workflows in Shopify, Wix and Square (Product list/create/edit, Inventory read/add). It is **not a Mobbin visual screenshot review**.
- Retained exact Mobbin candidate URLs from earlier pre-scout. In this session Mobbin action was **not available**; direct opening the flow links through public web search failed. UI layout/spacing/motion/validation screen appearances were **not seen**, so CP2-A **NOT PASS**.
- **Strong contract-specific finding:** Shopify official documentation distinguishes `Set to` (stock replacement) versus `Adjust by` (delta). Wix's set-current-quantity workflow cannot be copied because our approved Inventory POST is **positive addition only**. Square's “Receive stock” is a functionally closer reference, but placement/modal UI needs screenshots.
- **Next dependency:** review IA-01..IA-05 from CP1-B, merge PRs #46–#50 in sequence and finally CP2-A research PR, then *complete actual screen-level visual inspection* with usable Mobbin browser/connector or provided reference screenshots. Do not issue CP2-B visual decision on titles/docs alone. No Employee frontend code/tests changed.

## Open decisions (do not silently assume)

1. **RESOLVED DEC-C01:** A — desktop/PC-only (owner, 2026-10-13).
2. **RESOLVED CP1 IA:** IA-01..IA-05, IA-07 (delegated decision, 2026-11-09). IA-08 edit-success destination → CP6-D.
3. CP2-B: save placement (dirty-only save bar vs fixed editor header Save) and overall console visual direction.
4. CP5/CP8: ambiguous POST outcomes, invalid API responses, concurrent stock additions, PUT Theme 409; Backend is final authority.
5. DEC-C03: demo DB and Employee account provisioning — Backend/demo operator; checked again in W3/W5.

## How to continue in a fresh chat

1. Verify actual GitHub state (main SHA, open PRs). Do not trust this text over GitHub.
2. Read [Frontend Completion Plan](../FRONTEND-COMPLETION-PLAN.md) (§5 delegated rules, §7 ledger), current `WonhoOne/docs/main` and `frontend/AGENTS.md`.
3. Do the ledger's next action only (currently **CP2-B**). Do not reopen CP0-C device scope, CP1-B IA-01..05/07 or CP2-A evidence.
4. Each CP unit: commit the artifact, update this ledger, PR to `main`, CI green, merge — then continue to the next CP.
5. Employee code starts only after CP11 Final Audit PASS.

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
