# Employee Console — Progress Ledger and Next-Session Handoff

> Updated: 2026-10-13
> Document phase: P1 — CP0-B (Approved Employee Backend contract audit)
> Status: **P0 MERGED; CP0-A PR #46 OPEN; CP0-B REVIEW on stacked branch, merge pending**
> P1 checkpoint progress: **CP0-A and CP0-B source audits documented (both REVIEW/unmerged); CP0-C onward NOT STARTED**
> Next action: **review/merge CP0-A PR #46 before CP0-B stacked PR**; CP0-C begins only after prior approvals and user continuation.

## Source and branch state

| Artifact | State |
| --- | --- |
| frontend/main | Snapshot `fa84f4b578a3969213bfc851d5b4fa8121ead66d` at CP0-A audit; Customer/Voice implemented, Employee pending |
| docs/main | Snapshot `f49d0457498e8b775f659a27e0c3a96d288d0ba0` at CP0-A audit; MUST re-fetch and inspect contract/Backend implementation in CP0-B |
| [historical frontend PR #3](https://github.com/WonhoOne/frontend/pull/3) | reference: Customer planning package CP0–CP11 |
| [historical frontend PR #7](https://github.com/WonhoOne/frontend/pull/7) | reference: Customer implementation CP0–CP9 plan |
| [closed frontend PR #44](https://github.com/WonhoOne/frontend/pull/44) | **CLOSED, NOT MERGED, NOT A CURRENT SPEC** |
| P0 replacement planning PR | [Frontend PR #45 — P0 planning program](https://github.com/WonhoOne/frontend/pull/45), **MERGED 2026-10-13** |
| Employee detailed planning CP0–CP11 | **IN PROGRESS: CP0-A artifact committed for review; no subsequent CP started** |
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
| CP0-C — scope and device policy | `NOT STARTED` | User decision pending; do not bypass CP0-A/B review/merge |
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

## Open decisions (do not silently assume)

1. CP0-C: Employee device support scope (desktop-only vs desktop+tablet vs full responsive); **do not** call mobile mandatory merely because historical Customer docs were mobile-first.
2. CP1: route and authentication entry/recovery/navigation decisions; no employee URL fixed at P0.
3. CP2: real screen-level Mobbin visual inspection; visual direction is not decided by reference titles.
4. CP5/CP8: detailed handling of ambiguous POST outcomes, invalid API responses, concurrent stock additions and PUT Theme 409; Backend is final authority.
5. CP6: actual screen inventory and whether create/edit need distinct routed pages vs shared editor patterns.

## How to continue in a fresh chat

1. Verify this ledger and current branch/PR states through GitHub; P0 is merged, CP0-A PR #46 is open at this snapshot, CP0-B lives on a **stacked** branch and must not merge before its dependency.
2. Read current `WonhoOne/docs/main` and `frontend/AGENTS.md`.
3. Read [00-PLANNING-PROGRAM.md](00-PLANNING-PROGRAM.md) for exact CP0-A definition, inputs and gate.
4. Review/merge CP0-A PR #46 first. Then recheck/retarget the CP0-B stacked PR onto latest main (if necessary) and review/merge it, preserving only CP0-B-specific changes.
5. CP0-B source audit is already committed. **Only after both source audit PRs are approved/merged and user continuation instruction:** begin CP0-C — scope, support devices, demo readiness, timeline. Do not implement Employee UI yet.
6. Read both CP0-A/CP0-B reports as input to CP0-C. Stop before CP0-C unless user says continue; no Employee implementation until CP11 gate.

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
