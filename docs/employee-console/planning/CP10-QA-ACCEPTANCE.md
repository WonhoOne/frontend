# CP10 — Employee QA Acceptance (CP10-A per screen, CP10-B journeys and gates)

> Status: **COMPLETE — DELEGATED DECISION (2026-11-09)**
> Inputs: screen acceptance criteria [E01](screens/E01-employee-login-and-access.md)–[E05](screens/E05-inventory.md) §20, [CP6-F §6 journeys](CP6-F-CROSS-SCREEN-JOURNEYS.md), [CP7 §5–§6 test seams](CP7-IMPLEMENTATION-ARCHITECTURE.md), [CP9](CP9-ACCESSIBILITY-AND-DEVICE-SCOPE.md), Master Plan §39–§41 QA layers and severity, NFR-02/03/06

## 1. Layers used

| Layer | Tool | Runs in |
| --- | --- | --- |
| L1 Unit | Vitest | `npm run verify` (CI `verify`) |
| L2 Component / L3 Feature integration | Vitest + React Testing Library + mock DataSources | `npm run verify` |
| L4 Adapter contract | Vitest decoder/adapter tests with contract-shaped fixtures | `npm run verify` |
| L5 Browser E2E (mock API) | Playwright + fake API server | CI `verify` (`npm run test:e2e`) |
| L5 Browser E2E (real Backend + MySQL) | Playwright `playwright.f2-mysql.config.ts` | CI `authenticated-mysql-e2e` |
| L7 Manual | CP9 checklist at 1280 / 1024 / 200% zoom | W3 verification report |

## 2. CP10-A — Per-screen test matrix

| Screen | L1/L4 (pure) | L2/L3 (RTL) | L5 mock | L5 real |
| --- | --- | --- | --- | --- |
| E01 | `isSafeEmployeeReturnTo` table (valid, `//x`, `https://`, `/my-trips`, `/employee/login`, `\\`); role-aware login in provider (expected role mismatch stores no session; identity change clears private cache) | login form validation, `LOGIN_FAILED` alert, CUSTOMER refusal, access boundary (anon → redirect, CUSTOMER → permission state, EMPLOYEE → outlet), shell has no Customer chrome; **Customer LoginPage still rejects EMPLOYEE** | EJ01, EJ06, EJ07 | EJ01, EJ06 |
| E02 | adapter sorts style prices; decoder rejects unsafe ints | loading skeleton, empty state, list render, refetch failure keeps rows, created-row status line | EJ02 (list part) | list shows seeded `F2 Synthetic Golf` |
| E03 | `productFormRules`: Theme → styles, hidden-price retention, trimming, limits, `toTourProductWriteDto` (no `id`/`availableStyles`, allowed styles only), `mapFieldErrors` incl. `stylePrices[i].amount` | client errors + summary focus, 422 mapping, 5xx alert, unknown alert + check + confirm-resend, double-submit guard, dirty guard | EJ02, EJ08, unknown create | EJ02 create Golf product → visible in list |
| E04 | snapshot-once logic; dirty compare after trim | skeleton then form, save disabled until dirty, 200 re-init, 409 keeps edits + `테마 되돌리기`, 404 not-found, unknown → re-send | EJ03, EJ04 (scripted 409) | EJ03; **EJ04 on seeded product with schedule → real 409**, then same-Theme save 200 |
| E05 | inventory decoder; `stockAddRules` bounds; exactly-four check | table incl. `0개`, dialog validation, 200 shows server value + status, 5xx, unknown → refetch → confirm re-add, focus return | EJ05, EJ09 | EJ05 add 5 → server total; reload shows same total (NFR-02) |
| Cross | — | GET 401 with dirty form shows alert (no redirect); sign-out clears caches | EJ08, EJ10 keyboard | sign-out → protected URL redirects to login |

Customer regression: the existing 108 test files and current E2E suites must stay green (no Customer spec edited except tests intentionally moved per CP7 §3.4).

## 3. CP10-B — Critical journeys and release gate

| ID | Journey | Mock E2E | Real E2E |
| --- | --- | --- | --- |
| EJ01 | Anonymous → `/employee` → EMPLOYEE login → list | ✅ | ✅ |
| EJ02 | Create Golf product, 3 prices → highlighted in list | ✅ | ✅ |
| EJ03 | Edit name/price → saved values, stays on editor | ✅ | ✅ |
| EJ04 | Theme change on product with schedule → 409 → revert → save | ✅ (scripted) | ✅ |
| EJ05 | Add 5 to 골프공 → server total | ✅ | ✅ |
| EJ06 | CUSTOMER on Employee login → refused, no session | ✅ | ✅ |
| EJ07 | Reload on inventory → login → back on inventory | ✅ | — |
| EJ08 | Dirty editor leave → confirm | ✅ | — |
| EJ09 | Network loss on stock add → unknown → refetch → confirm re-add | ✅ (scripted abort) | — |
| EJ10 | Keyboard-only EJ02 + EJ05 | ✅ | — |

**Employee release gate (feeds Completion Plan D-B6, D-C1/D-C2):**

- EJ01–EJ10 mock E2E: **10/10 PASS**
- Real Backend E2E: EJ01–EJ06 **6/6 PASS** (NFR-03 "Employee core functions 100%": login, list, create, update, inventory read, inventory add all exercised on real Backend + MySQL; NFR-02 persistence checked by re-reading after writes)
- `npm run verify` green; Customer suites unchanged and green
- CP9 checklist recorded; A1–A13 no S0/S1
- Severity: S0 = 0, S1 = 0 (Master Plan §41). Examples of S0 for Employee: stock added twice by the UI, a Customer session kept after Employee login, private data visible after sign-out. Examples of S1: cannot create/edit/add on real Backend, editor loses input on 409.

## 4. Evidence recording

Each implementation PR lists (AGENTS.md PR expectations): requirement IDs (FR-01/10/11, NFR-02/03/06), screens, endpoints, tests run with counts, CP9 checks done, shared contract changed: NO. The final W3 report records CI run IDs for the gate above.

## 5. Gate

- [x] Every E01–E05 acceptance criterion maps to at least one automated layer
- [x] Real Backend journeys cover every Employee operation (NFR-03) and persistence (NFR-02)
- [x] Customer regression protected
- [x] Release gate and Employee-specific S0/S1 examples defined

**Next: CP11 — final audit and implementation PR plan.**
