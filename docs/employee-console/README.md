# Employee Console — Durable Planning Entry Point

> Status: **P1 IN PROGRESS — CP0–CP3 COMPLETE; CP4 next** (not implementation-ready)
> Last reviewed: 2026-11-09 — execution delegated by owner, see [Frontend Completion Plan](../FRONTEND-COMPLETION-PLAN.md)
> Owner: 김태우; source repo: WonhoOne/frontend
> Shared contract: latest approved WonhoOne/docs/main; frontend development policy: ../../AGENTS.md

## Correct reading order for a fresh ChatGPT session

1. [00-PLANNING-PROGRAM.md](00-PLANNING-PROGRAM.md) — process: **P0 plan → P1 detailed planning set → P2 code**; checkpoints, gates, outputs and user decisions.
2. [01-PROGRESS-AND-HANDOFF.md](01-PROGRESS-AND-HANDOFF.md) — **current actual** progress, open decisions, next checkpoint and branch/PR reference. Read this even if a chat claims more was done.
3. [Mobbin reference candidate discovery](references/00-MOBBIN-DISCOVERY.md) — pre-scout; screen/flow metadata only; **visual CP2-A audit remains pending**.
4. [Frontend AGENTS.md](../../AGENTS.md), [Customer planning index](../planning/00-PLANNING-INDEX.md) and [Customer screen template](../planning/screens/_SCREEN-TEMPLATE.md). Historical Customer decisions are reusable references, not an automatic Employee design.
5. [Approved shared docs](https://github.com/WonhoOne/docs): current baseline, repository responsibilities, FR/NFR/BR, REST and Backend evidence.

## Current checkpoint artifact

- [CP0-A — Frontend runtime and reuse inventory](planning/CP0-A-FRONTEND-RUNTIME-INVENTORY.md): current source/code audit, explicit Employee login incompatibility, Customer shell segregation risk, reuse/new candidates. **Status: COMPLETE (merged #46).**
- [CP0-B — Backend Employee contract audit](planning/CP0-B-BACKEND-EMPLOYEE-CONTRACT-AUDIT.md): matched docs/main v0.2 against real Backend controllers, security, DTO, validators, Product lock/Inventory additive logic and existing tests. **Status: COMPLETE (merged #47).**
- [CP0-C — Scope, device support and demo gate](planning/CP0-C-SCOPE-DEVICE-DEMO-GATE.md): owner **approved A PC-only on 2026-10-13**; required scope and course final dates; **Status: COMPLETE (merged #48), CP0 frozen.**
- [CP1-A — Operator tasks and end-to-end flows](planning/CP1-A-OPERATOR-TASK-FLOWS.md): 7 Employee tasks/flowcharts and acceptance scenarios, **Status: COMPLETE (merged #49).**
- [CP1-B — Proposed IA and role-safe navigation](planning/CP1-B-INFORMATION-ARCHITECTURE.md): source-backed alternative comparison, proposed Employee login/Products/Inventory navigation and URL table. **Status: COMPLETE (merged #50); IA-01..05, IA-07 approved by delegated decision 2026-11-09**, no implemented routes yet.
- [CP2-A — Source-grounded reference research and Mobbin visual gate](planning/CP2-A-REFERENCE-EVIDENCE-REGISTER.md): Shopify/Wix/Square official interaction documentation compared for Product/Inventory. **PARTIAL / NO VISUAL PASS:** **PASS (2026-11-09)**: visual evidence cards V1–V6 from official Shopify/Wix/Square screenshots and live previews (Mobbin blocked, §8).
- [CP2-B — Visual direction](planning/CP2-B-VISUAL-DIRECTION.md): same tokens, operational composition; top bar chrome; list/editor/inventory/login compositions. **Status: COMPLETE (delegated decision 2026-11-09).**
- [CP3 — Component reuse and contracts](planning/CP3-COMPONENT-REUSE-AND-CONTRACTS.md): verified reuse matrix, 3 shared additions, Employee-only component contracts. **Status: COMPLETE (delegated decision 2026-11-09).**
- **Next action:** CP4 operational motion and feedback. CP0–CP3 decisions are closed; do not reopen them. Progress ledger is authoritative.

## What is and is not completed

| Program | Status | Meaning |
| --- | --- | --- |
| P0 — Plan the planning | **MERGED** | [PR #45](https://github.com/WonhoOne/frontend/pull/45), merged 2026-10-13 |
| P1 — Detailed Employee design (CP0–CP11) | **IN PROGRESS — CP0–CP3 complete** | See [progress ledger](01-PROGRESS-AND-HANDOFF.md) for per-CP state |
| P2 — Employee Console code | **NOT STARTED** | No employee route/page/API runtime implementation claimed |

The earlier [frontend PR #44](https://github.com/WonhoOne/frontend/pull/44) is **closed unmerged**. Its premature Employee implementation plan is **not** the current approved specification.

## One-step continuation command

> Read the latest WonhoOne/frontend main branch and this folder's README, 00-PLANNING-PROGRAM.md, 01-PROGRESS-AND-HANDOFF.md, and references/00-MOBBIN-DISCOVERY.md. Verify P0 approval/merge and latest WonhoOne/docs/main first. Then execute **only** the progress ledger's next_checkpoint, using current code/contract evidence and the program's output gate. Do not implement any feature, invent a missing contract, or mark CP as complete without creating a durable checkpoint artifact/commit and updating the ledger.

**Current next action:** CP4 operational motion and feedback. CP0 frozen; CP1-B IA-01..05/07 approved (delegated decision 2026-11-09).

## Progress bookkeeping

- At CP start, update ledger to `IN_PROGRESS` only on a committed planning branch if the user requests persisted progress.
- At CP end, add a named document under `planning/` (and `planning/screens/` or `planning/audits/` as applicable), commit it, and update the ledger with evidence link, what was decided, what remains blocked, and next step.
- If chat ends without a commit, **state remains NOT COMPLETE**.
- On cross-chat restart, verify actual branch/PR/merge state, not the previous agent's final prose.
- No undocumented design choices and no Mobbin "observations" from search metadata alone.
