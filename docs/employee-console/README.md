# Employee Console — Durable Planning Entry Point

> Status: **P0 PLANNING PROGRAM PROPOSAL** (not UX plan complete / not ready for implementation)
> Last reviewed: 2026-10-13
> Owner: 김태우; source repo: WonhoOne/frontend
> Shared contract: latest approved WonhoOne/docs/main; frontend development policy: ../../AGENTS.md

## Correct reading order for a fresh ChatGPT session

1. [00-PLANNING-PROGRAM.md](00-PLANNING-PROGRAM.md) — process: **P0 plan → P1 detailed planning set → P2 code**; checkpoints, gates, outputs and user decisions.
2. [01-PROGRESS-AND-HANDOFF.md](01-PROGRESS-AND-HANDOFF.md) — **current actual** progress, open decisions, next checkpoint and branch/PR reference. Read this even if a chat claims more was done.
3. [Mobbin reference candidate discovery](references/00-MOBBIN-DISCOVERY.md) — pre-scout; screen/flow metadata only; **visual CP2-A audit remains pending**.
4. [Frontend AGENTS.md](../../AGENTS.md), [Customer planning index](../planning/00-PLANNING-INDEX.md) and [Customer screen template](../planning/screens/_SCREEN-TEMPLATE.md). Historical Customer decisions are reusable references, not an automatic Employee design.
5. [Approved shared docs](https://github.com/WonhoOne/docs): current baseline, repository responsibilities, FR/NFR/BR, REST and Backend evidence.

## What is and is not completed

| Program | Status | Meaning |
| --- | --- | --- |
| P0 — Plan the planning | **Draft PR / proposed** | Program, reference shortlist and continuity method written; approval/merge pending |
| P1 — Detailed Employee design (CP0–CP11) | **NOT STARTED** | No Employee screen specs or final UX decisions approved |
| P2 — Employee Console code | **NOT STARTED** | No employee route/page/API runtime implementation claimed |

The earlier [frontend PR #44](https://github.com/WonhoOne/frontend/pull/44) is **closed unmerged**. Its premature Employee implementation plan is **not** the current approved specification.

## One-step continuation command

> Read the latest WonhoOne/frontend main branch and this folder's README, 00-PLANNING-PROGRAM.md, 01-PROGRESS-AND-HANDOFF.md, and references/00-MOBBIN-DISCOVERY.md. Verify P0 approval/merge and latest WonhoOne/docs/main first. Then execute **only** the progress ledger's next_checkpoint, using current code/contract evidence and the program's output gate. Do not implement any feature, invent a missing contract, or mark CP as complete without creating a durable checkpoint artifact/commit and updating the ledger.

**Current next checkpoint (conditional): CP0-A after P0 plan approval/merge.** Until approval, review this P0 plan, not CP0-A code work.

## Progress bookkeeping

- At CP start, update ledger to `IN_PROGRESS` only on a committed planning branch if the user requests persisted progress.
- At CP end, add a named document under `planning/` (and `planning/screens/` or `planning/audits/` as applicable), commit it, and update the ledger with evidence link, what was decided, what remains blocked, and next step.
- If chat ends without a commit, **state remains NOT COMPLETE**.
- On cross-chat restart, verify actual branch/PR/merge state, not the previous agent's final prose.
- No undocumented design choices and no Mobbin "observations" from search metadata alone.
