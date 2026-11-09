# CP11 — Final Planning Audit (CP11-A) and Implementation Plan (CP11-B)

> Status: **COMPLETE — P1 FINAL AUDIT PASS; P2 IMPLEMENTATION AUTHORIZED (2026-11-09, delegated decision)**
> Owner: 김태우 / `WonhoOne/frontend` (execution delegated, [Frontend Completion Plan §5](../../FRONTEND-COMPLETION-PLAN.md))
> Program gate: [Planning Program §I](../00-PLANNING-PROGRAM.md) — nine conditions for P1 → P2

## 1. CP11-A — Program §I gate check

| # | Condition (Program §I) | Evidence | Result |
| --- | --- | --- | --- |
| 1 | Approved device/scope, IA, UX direction, complete screen inventory | [CP0-C](CP0-C-SCOPE-DEVICE-DEMO-GATE.md) A PC-only; [CP1-B](CP1-B-INFORMATION-ARCHITECTURE.md) IA-01..05/07; [CP2-B](CP2-B-VISUAL-DIRECTION.md); [CP6-0](CP6-0-SCREEN-INVENTORY.md) | PASS |
| 2 | Screen specs with no unresolved critical guessing | [E01](screens/E01-employee-login-and-access.md)–[E05](screens/E05-inventory.md); no open TBD (grep 2026-11-09) | PASS |
| 3 | Consistency, contract and fresh-implementation audits | [CP6-G/H/I](audits/CP6-GHI-EMPLOYEE-SPEC-AUDITS.md): 5 fixes, 0 invented contract elements, readiness PASS | PASS |
| 4 | Backend authority/authorization/validation known; deltas approved | [CP0-B](CP0-B-BACKEND-EMPLOYEE-CONTRACT-AUDIT.md); no Backend delta required | PASS |
| 5 | Data lifecycle, auth/session, concurrency/retry, error recovery | [CP5](CP5-DATA-AND-MUTATION-STATES.md), [CP8](CP8-API-AND-DATA-MAPPING.md) | PASS |
| 6 | Component architecture and state ownership reconciled with source | [CP3](CP3-COMPONENT-REUSE-AND-CONTRACTS.md), [CP7](CP7-IMPLEMENTATION-ARCHITECTURE.md) (inspected at `35c4f0a`) | PASS |
| 7 | Critical-journey QA and real-integration acceptance | [CP10](CP10-QA-ACCEPTANCE.md): EJ01–EJ10 mock, EJ01–EJ06 real | PASS |
| 8 | PR-sized roadmap and handoff with reading list | §3–§5 below | PASS |
| 9 | Owner approval of P1 completion | Owner delegated execution and decisions on 2026-11-09 ([Completion Plan §5](../../FRONTEND-COMPLETION-PLAN.md)); recorded here as DELEGATED DECISION | PASS (delegated) |

### Cross-document reconciliation

| Check | Result |
| --- | --- |
| Routes identical in CP1-B, CP6-0, E01–E05, CP6-F, CP7 | ✅ |
| Query keys identical in CP5, CP7, CP8 | ✅ |
| Labels (Theme, Style, item, `₩`) identical in CP2-B, CP3, CP6-0, specs | ✅ (after CP6-G G5) |
| Feedback channels identical in CP4, specs, CP6-F | ✅ (after G1–G3) |
| Endpoints and codes ⊂ REST v0.2 | ✅ (CP6-H) |
| Customer behavior unchanged except role-safety fixes listed in CP7 §3 | ✅ |
| Voice-owned files untouched | ✅ |

### Known risks carried into P2

| Risk | Mitigation |
| --- | --- |
| Schedule: 14 days to submission | 5 PRs, each independently mergeable; Customer work (W4) only after Employee gate |
| Auth change touches Customer surfaces | E-PR1 isolates it with tests that pin existing Customer behavior first |
| Real Employee E2E depends on CI bootstrap env | E-PR1 adds env and a smoke login test before feature PRs rely on it |
| Bootstrap value constraints are Backend-local | E-PR1 reads `EmployeeBootstrap` profile validation before choosing CI values |
| Demo DB Employee account (DEC-C03) | W5 checklist; Backend/demo operator sets real values; never committed |

## 2. CP11-B — Implementation principles

- Follow AGENTS.md, Master Plan §7–§13, CP7 module map. Korean WHY/CONTRACT/INVARIANT comments per Master Plan §8.
- Each PR: tests first for behavior being changed, `npm run verify` green, E2E green in CI, PR body per AGENTS.md expectations.
- No shared-contract, Backend or Voice-owned file changes.

## 3. CP11-B — PR sequence

| PR | Branch | Scope | Specs | Tests added | Done when |
| --- | --- | --- | --- | --- | --- |
| **E-PR1** Foundation & access | `feat/employee-access-foundation` | `UserRole`, `login({expectedRole})`, identity-change cache clear, `isCustomerSession` in `GlobalHeader` / `PostLoginPreviousTripsSurface` / `MyTripsPage`; `employeeReturnTo`; `EmployeeRouteLayout`, `EmployeeAccessBoundary`, `EmployeeShell`, `EmployeeLoginPage`, permission + not-found states; employee paths; shared `formatKrw`, `SelectField`, `TextAreaField`, `useUnsavedChangesGuard`; `tourThemeTitle` export; fake-server login with role; CI bootstrap env + real login smoke | E01, CP6-F §2/§4 | E01 L1–L3; EJ01, EJ06, EJ07 mock; EJ01, EJ06 real | Employee can sign in on real Backend; Customer suites unchanged |
| **E-PR2** Product list & create | `feat/employee-tour-list-create` | `employee-tours` feature (model, adapter, rules, DataSources, queries), `ProductTable`, `ThemeLabel`, `StylePriceList`, `ProductForm`, `KrwAmountField`, `EditorActionBar`; pages E02, E03; mock + fake-server handlers | E02, E03 | E02/E03 L1–L4; EJ02, EJ08 mock; EJ02 real | Product created on real Backend appears in list |
| **E-PR3** Product edit | `feat/employee-tour-edit` | E04 page, snapshot-once load, 409/404/unknown flows, external-change note | E04 | E04 L1–L3; EJ03, EJ04 mock; EJ03, EJ04 real (seeded schedule → 409) | Real 409 recovery works |
| **E-PR4** Inventory | `feat/employee-inventory` | `inventory` decoder + contract name, `employee-inventory` feature, `InventoryTable`, `StockAddDialog`, E05 page, unknown-outcome flow | E05 | E05 L1–L4; EJ05, EJ09 mock; EJ05 real (+ reload persistence) | Real stock add shows server total |
| **E-PR5** Employee QA closure | `test/employee-qa-closure` | EJ10 keyboard journey, reduced-motion check, CP9 manual report, docs: Employee README/ledger → P2 complete, Completion Plan D-B rows | CP9, CP10 | EJ10; CP9 A1–A13 record | Employee release gate (CP10 §3) met |

Target dates (Completion Plan W3, 11/14–11/19 window; start earlier because P1 finished on 11/09): E-PR1 11/10, E-PR2 11/11, E-PR3 11/12, E-PR4 11/13, E-PR5 11/14. Remaining days go to W4 (Customer completion items) and W5 (release freeze).

## 4. Required reading for any implementation session

1. `AGENTS.md`, `docs/FRONTEND-COMPLETION-PLAN.md`
2. `docs/employee-console/01-PROGRESS-AND-HANDOFF.md`
3. This document, then [CP7](CP7-IMPLEMENTATION-ARCHITECTURE.md), [CP8](CP8-API-AND-DATA-MAPPING.md), [CP5](CP5-DATA-AND-MUTATION-STATES.md)
4. The screen spec(s) for the PR, plus [CP6-F](CP6-F-CROSS-SCREEN-JOURNEYS.md)
5. [CP10](CP10-QA-ACCEPTANCE.md) rows for the PR
6. `WonhoOne/docs/main` REST v0.2 Employee sections

## 5. Gate

- [x] Program §I nine conditions PASS (condition 9 by owner delegation)
- [x] Cross-document reconciliation clean
- [x] Five PR-sized implementation units with scope, specs, tests and done criteria
- [x] Reading list for implementation sessions

**P1 COMPLETE. Next: E-PR1 (P2 implementation).**
