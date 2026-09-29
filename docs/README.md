# Frontend Documentation

This directory contains **frontend-owned documentation only**.

## Where to start

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
