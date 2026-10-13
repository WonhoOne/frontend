# Frontend Documentation

This directory contains **frontend-owned documentation only**.

## Current status and reading order

As of 2026-10-13, the approved frontend responsibility includes **Customer GUI + Employee Console + Backend live integration**, with Voice directories assigned separately in AGENTS.md. The Customer/Voice B9 gate is complete. **Employee Console is not yet implemented.** The older Customer-only CP documents and pre-implementation handoffs remain historical evidence, not instructions to restart foundation.

Start with:

0. [`implementation/EMPLOYEE-CONSOLE-IMPLEMENTATION-PLAN.md`](implementation/EMPLOYEE-CONSOLE-IMPLEMENTATION-PLAN.md) — **current Employee Console implementation scope, API map and checkpoints**
1. [`../AGENTS.md`](../AGENTS.md) — current repository ownership/boundaries and mandatory SSOT reading
2. [`implementation/IMPLEMENTATION-MASTER-PLAN.md`](implementation/IMPLEMENTATION-MASTER-PLAN.md) — historical Customer implementation baseline (2026-09-30)
3. [`B9 integration closeout`](https://github.com/WonhoOne/docs/blob/main/B9-INTEGRATION-CLOSEOUT.md) — completed Customer/Voice evidence

## Historical Customer planning package

1. [`IMPLEMENTATION-START-HANDOFF.md`](IMPLEMENTATION-START-HANDOFF.md) — **next-session implementation handoff**
2. [`planning/00-PLANNING-INDEX.md`](planning/00-PLANNING-INDEX.md) — master planning index and current status
3. [`planning/12-IMPLEMENTATION-HANDOFF.md`](planning/12-IMPLEMENTATION-HANDOFF.md) — complete planning-to-implementation contract
4. [`planning/screens/`](planning/screens/) — screen-by-screen implementation specifications
5. [`planning/audits/`](planning/audits/) — consistency / contract / readiness audits

## Planning map

```text
planning/
├── 00-PLANNING-INDEX.md
├── 01-PRODUCT-EXPERIENCE.md
├── 02-INFORMATION-ARCHITECTURE.md
├── 03-VISUAL-DIRECTION.md
├── 04-DESIGN-SYSTEM.md
├── 05-MOTION-SYSTEM.md
├── 06-UI-STATES.md
├── 07-SCREEN-SPECS.md
├── 08-COMPONENT-ARCHITECTURE.md
├── 09-DATA-AND-API-UX.md
├── 10-RESPONSIVE-ACCESSIBILITY.md
├── 11-QA-ACCEPTANCE.md
├── 12-IMPLEMENTATION-HANDOFF.md
├── screens/
└── audits/
```

The numeric prefixes are intentional: they are the recommended reading order.

## Shared contracts

The shared SSOT lives in [`WonhoOne/docs`](https://github.com/WonhoOne/docs).

Do **not** copy shared requirements, domain rules, ERD, API specs, or voice contracts into this repository. If a shared contract changes, update the shared docs first and then update the affected frontend planning/adapter implementation.
