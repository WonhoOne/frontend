# Employee Console — Progress Ledger and Next-Session Handoff

> Updated: 2026-10-13
> Document phase: P1 — CP0-C (Scope, device policy, demo readiness)
> Status: **P0 MERGED; CP0-A #46 OPEN; CP0-B #47 OPEN; CP0-C DRAFT / DECISION PENDING on stacked branch**
> P1 checkpoint progress: **CP0-A/B REVIEW/unmerged; CP0-C scope report DRAFT, owner device decision needed; CP1 onward NOT STARTED**
> Next action: **owner chooses Employee device policy A/B/C; review/merge source PRs in order #46 → #47 → CP0-C**. CP1 cannot be called approved until CP0-C decision and merge.

## Source and branch state

| Artifact | State |
| --- | --- |
| frontend/main | Snapshot `fa84f4b578a3969213bfc851d5b4fa8121ead66d` at CP0-A audit; Customer/Voice implemented, Employee pending |
| docs/main | Snapshot `f49d0457498e8b775f659a27e0c3a96d288d0ba0` at CP0-A audit; MUST re-fetch and inspect contract/Backend implementation in CP0-B |
| [historical frontend PR #3](https://github.com/WonhoOne/frontend/pull/3) | reference: Customer planning package CP0–CP11 |
| [historical frontend PR #7](https://github.com/WonhoOne/frontend/pull/7) | reference: Customer implementation CP0–CP9 plan |
| [closed frontend PR #44](https://github.com/WonhoOne/frontend/pull/44) | **CLOSED, NOT MERGED, NOT A CURRENT SPEC** |
| P0 replacement planning PR | [Frontend PR #45 — P0 planning program](https://github.com/WonhoOne/frontend/pull/45), **MERGED 2026-10-13** |
| Employee detailed planning CP0–CP11 | **CP0-A/B source reports REVIEW; CP0-C DRAFT; CP1 onward NOT STARTED** |
| CP0-A PR branch | [PR #46 — Frontend runtime and reuse audit](https://github.com/WonhoOne/frontend/pull/46), **OPEN / REVIEW / unmerged**; branch `docs/employee-console-cp0-a-runtime-inventory-20261013` |
| CP0-B stacked branch | [PR #47 — Backend contract audit](https://github.com/WonhoOne/frontend/pull/47), **OPEN / REVIEW / unmerged**, currently targets CP0-A branch, **must retarget to main after #46 merges** |
| Employee implementation | **NOT STARTED** |

## Stage tracker

| Stage | Status | Proof/gate |
| --- | --- | --- |
| P0 reference discovery | `PRE-SCOUT ONLY` | Mobbin canonical flow/screen URLs; actual visual verification pending CP2-A |
| P0 planning program | `MERGED` | [PR #45](https://github.com/WonhoOne/frontend/pull/45) merged; [program](00-PLANNING-PROGRAM.md) approved for execution |
| CP0-A — current frontend code inventory | `REVIEW` | [CP0-A source audit](planning/CP0-A-FRONTEND-RUNTIME-INVENTORY.md) committed on CP0-A PR branch; user review/merge pending |
| CP0-B — shared/back-end contract verification | `REVIEW` | [CP0-B Backend Employee contract audit](planning/CP0-B-BACKEND-EMPLOYEE-CONTRACT-AUDIT.md) committed on stacked review branch; Backend/main `597cf92f1baf93211862d4ea5dbfa8a199b808a2`; no new tests run |
| CP0-C — scope and device policy | `DRAFT / BLOCKED ON OWNER DECISION` | [CP0-C scope, device and demo gate](planning/CP0-C-SCOPE-DEVICE-DEMO-GATE.md); assignment milestones Nov23 report, Nov24 demo; device A/B/C not approved; stacked review PR to follow #47 |
| CP1 — IA/task flows | `NOT STARTED` | No specs |
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
- **RECOMMENDED, NOT APPROVED:** A desktop-only Employee UX, keyboard-accessible within supported desktop viewport; alternative B desktop+tablet; C full including phone. Owner must choose.
- **PROPOSED:** Employee sign-in/role gating → Tour create/update → four-item stock read/add → persistence/negative QA demonstration; actual target Employee credentials, fixture/database and presenter remain unverified.
- **Status:** `DRAFT / DECISION PENDING`. CP0-A/B review PRs still open when drafted; merge in order before CP0 freeze. No tests or application code changed.

## Open decisions (do not silently assume)

1. **BLOCKING DEC-C01:** Owner must choose **A desktop-only (proposed)** / **B desktop+tablet** / **C full responsive including phones**. No Employee mobile mandate in original course assignment/approved v0.2. Amend CP0-C with choice before marking it COMPLETE.
2. CP1: route and authentication entry/recovery/navigation decisions; no employee URL fixed at P0.
3. CP2: real screen-level Mobbin visual inspection; visual direction is not decided by reference titles.
4. CP5/CP8: detailed handling of ambiguous POST outcomes, invalid API responses, concurrent stock additions and PUT Theme 409; Backend is final authority.
5. CP6: actual screen inventory and whether create/edit need distinct routed pages vs shared editor patterns.

## How to continue in a fresh chat

1. Verify latest PR states via GitHub; at report time #46 and #47 were unmerged, and CP0-C is on a stacked branch **based on CP0-B head**, with device decision pending.
2. Read current `WonhoOne/docs/main` and `frontend/AGENTS.md`.
3. Read [00-PLANNING-PROGRAM.md](00-PLANNING-PROGRAM.md) for exact CP0-A definition, inputs and gate.
4. Review/merge #46 first, retarget/review/merge #47 against latest main, then retarget/review/merge CP0-C PR against latest main **after user decision**. Never mark earlier PRs merged before verified.
5. CP0-C draft is already committed as [CP0-C report](planning/CP0-C-SCOPE-DEVICE-DEMO-GATE.md), drawing from two-page original assignment (Nov23 report/Nov24 presentation). **Do not redo research; obtain explicit owner device decision**, update CP0-C and ledger, and merge dependencies.
6. Once CP0-C is genuinely approved/merged and user says continue, start CP1-A: operator tasks/flowcharts; no UI implementation until CP11 gate.

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
