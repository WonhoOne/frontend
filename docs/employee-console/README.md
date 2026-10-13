# Employee Console — Durable Planning Entry Point

> Status: **P0 PROGRAM MERGED; P1 CP1-B IA DRAFT / DEPENDENT (not UI plan complete or implementation-ready)**
> Last reviewed: 2026-10-13
> Owner: 김태우; source repo: WonhoOne/frontend
> Shared contract: latest approved WonhoOne/docs/main; frontend development policy: ../../AGENTS.md

## Correct reading order for a fresh ChatGPT session

1. [00-PLANNING-PROGRAM.md](00-PLANNING-PROGRAM.md) — process: **P0 plan → P1 detailed planning set → P2 code**; checkpoints, gates, outputs and user decisions.
2. [01-PROGRESS-AND-HANDOFF.md](01-PROGRESS-AND-HANDOFF.md) — **current actual** progress, open decisions, next checkpoint and branch/PR reference. Read this even if a chat claims more was done.
3. [Mobbin reference candidate discovery](references/00-MOBBIN-DISCOVERY.md) — pre-scout; screen/flow metadata only; **visual CP2-A audit remains pending**.
4. [Frontend AGENTS.md](../../AGENTS.md), [Customer planning index](../planning/00-PLANNING-INDEX.md) and [Customer screen template](../planning/screens/_SCREEN-TEMPLATE.md). Historical Customer decisions are reusable references, not an automatic Employee design.
5. [Approved shared docs](https://github.com/WonhoOne/docs): current baseline, repository responsibilities, FR/NFR/BR, REST and Backend evidence.

## Current checkpoint artifact

- [CP0-A — Frontend runtime and reuse inventory](planning/CP0-A-FRONTEND-RUNTIME-INVENTORY.md): current source/code audit, explicit Employee login incompatibility, Customer shell segregation risk, reuse/new candidates. **Status: REVIEW on CP0-A PR; not yet merged to main.**
- [CP0-B — Backend Employee contract audit](planning/CP0-B-BACKEND-EMPLOYEE-CONTRACT-AUDIT.md): matched docs/main v0.2 against real Backend controllers, security, DTO, validators, Product lock/Inventory additive logic and existing tests. **Status: REVIEW on dependent CP0-B branch; merge CP0-A first.**
- [CP0-C — Scope, device support and demo gate](planning/CP0-C-SCOPE-DEVICE-DEMO-GATE.md): owner **approved A PC-only on 2026-10-13**; required scope and course final dates; PR #48 still draft/staged behind #46/#47.
- [CP1-A — Operator tasks and end-to-end flows](planning/CP1-A-OPERATOR-TASK-FLOWS.md): 7 Employee tasks/flowcharts and acceptance scenarios, explicitly **DRAFT / DEPENDENT** on CP0 PR merges; no UI implementation.
- [CP1-B — Proposed IA and role-safe navigation](planning/CP1-B-INFORMATION-ARCHITECTURE.md): source-backed alternative comparison, proposed Employee login/Products/Inventory navigation and URL table. **DRAFT / DEPENDENT; owner approval of IA-01..IA-05 required**, no implemented routes.
- **Next action:** device A (PC-only) is confirmed; owner reviews IA-01..IA-05, then review/merge docs PR chain **#46 → #47 → #48 → #49 → CP1-B PR** in order. Only after CP1-B approval: CP2-A visual Mobbin audit. Progress ledger remains authoritative.

## What is and is not completed

| Program | Status | Meaning |
| --- | --- | --- |
| P0 — Plan the planning | **MERGED** | [PR #45](https://github.com/WonhoOne/frontend/pull/45), merged 2026-10-13 |
| P1 — Detailed Employee design (CP0–CP11) | **CP1-B DRAFT / DEPENDENT** | CP0-C device A confirmed, prior PRs unmerged; staff IA comparison proposed but not approved; CP2 onward unstarted |
| P2 — Employee Console code | **NOT STARTED** | No employee route/page/API runtime implementation claimed |

The earlier [frontend PR #44](https://github.com/WonhoOne/frontend/pull/44) is **closed unmerged**. Its premature Employee implementation plan is **not** the current approved specification.

## One-step continuation command

> Read the latest WonhoOne/frontend main branch and this folder's README, 00-PLANNING-PROGRAM.md, 01-PROGRESS-AND-HANDOFF.md, and references/00-MOBBIN-DISCOVERY.md. Verify P0 approval/merge and latest WonhoOne/docs/main first. Then execute **only** the progress ledger's next_checkpoint, using current code/contract evidence and the program's output gate. Do not implement any feature, invent a missing contract, or mark CP as complete without creating a durable checkpoint artifact/commit and updating the ledger.

**Current next action:** review the CP1-B proposed IA (IA-01..IA-05) and merge dependent docs PRs in order **#46 → #47 → #48 → #49 → CP1-B PR**, retarget each to main after predecessors merge and verify diff. Device support **A PC-only** is approved. **Next planned CP: CP2-A visual Mobbin reference comparison**, only after IA decision and user continuation. Nothing here is a final Employee UI spec.

## Progress bookkeeping

- At CP start, update ledger to `IN_PROGRESS` only on a committed planning branch if the user requests persisted progress.
- At CP end, add a named document under `planning/` (and `planning/screens/` or `planning/audits/` as applicable), commit it, and update the ledger with evidence link, what was decided, what remains blocked, and next step.
- If chat ends without a commit, **state remains NOT COMPLETE**.
- On cross-chat restart, verify actual branch/PR/merge state, not the previous agent's final prose.
- No undocumented design choices and no Mobbin "observations" from search metadata alone.
