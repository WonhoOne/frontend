# E-PR5 — Employee CP9 / CP10 Verification Report

> Date: 2026-11-09. Branch `test/employee-qa-closure` (stacked on E-PR4 #60).
> Scope: [CP9](../CP9-ACCESSIBILITY-AND-DEVICE-SCOPE.md) device/accessibility checks and the [CP10](../CP10-QA-ACCEPTANCE.md) Employee release gate.
> Method: automated tests in the repository, plus a local Playwright capture script (not committed) that signed in with stubbed APIs and captured E01–E05 at 1280×800, 1024×768 and 640×400 CSS px (= 1280 px window at 200% zoom). Screenshots were reviewed visually; they are not stored in the repository.

## 1. CP10 release gate

| Gate | Result | Evidence |
| --- | --- | --- |
| EJ01–EJ10 browser journeys (mock API) | **10/10 PASS** | `tests/e2e/employee-access.spec.ts` (EJ01, EJ06, EJ07), `employee-tours.spec.ts` (EJ02, EJ03, EJ04, EJ08), `employee-inventory.spec.ts` (EJ05, EJ09), `employee-keyboard.spec.ts` (EJ10) |
| EJ01–EJ06 on real Backend + MySQL | **6/6 PASS** | `tests/f2-mysql/employee.spec.ts` in CI job "Real Backend + MySQL …" (EJ02/EJ03/EJ05 re-read persisted values through the Employee API; EJ04 hits the real `TOUR_PRODUCT_THEME_LOCKED` on the seeded product with a schedule) |
| NFR-03 Employee core functions | **PASS** | login, list, create, update, inventory read, inventory add all exercised on the real Backend |
| NFR-02 persistence accuracy | **PASS** | values re-read via `GET /employee/tours` and `GET /employee/inventory` after each write |
| `npm run verify` | **PASS** | local: 119 files / 1,988 tests on E-PR4; CI per PR |
| Customer regression | **PASS** | full `npm run test:e2e` 209/209 locally on E-PR4; Customer real-Backend and Voice journeys green in CI |
| Severity | **S0 = 0, S1 = 0** | see §4 |

## 2. CP9 accessibility (A1–A14)

| # | Requirement | Result | Evidence |
| --- | --- | --- | --- |
| A1 | One H1, landmarks | PASS | RTL route tests; `<header>`, `<nav aria-label="직원 메뉴">`, `<main id="main-content">` |
| A2 | Skip link reaches main | PASS | `employee-keyboard.spec.ts` "skip link moves focus to the main landmark" |
| A3 | Visible labels, required, `aria-describedby`, `aria-invalid` | PASS | `SelectField`/`TextAreaField`/`TextField`; E04 test asserts `aria-invalid` on the mapped price field |
| A4 | Error summary / alerts focused | PASS | E03 RTL (summary focused), E04 RTL and EJ04 (409 alert focused) |
| A5 | Success via `role="status"`, no focus steal | PASS | status lines on E02/E04/E05 |
| A6 | Table semantics | PASS | caption, `th scope="col"`, inventory row headers, units in cells |
| A7 | Dialog name, focus trap, focus return, visible close | PASS after fix | EJ05 asserts focus returns to the row button (**fixed in E-PR4**, see §3) |
| A8 | Visible focus | PASS | existing `--mw-focus-outline` on all controls; seen in captures |
| A9 | Targets ≥ 44 px | PASS | `--mw-control-min-target` on buttons, links, nav |
| A10 | Not colour-only | PASS | Theme dot + title text; active nav has an underline |
| A11 | Contrast | PASS after fix | computed with the token values: ink on surfaces 15.9–17.4:1; secondary 4.9–5.4:1; primary button text 4.57:1; danger text 5.7:1. **Fixed in E-PR5:** header count used tertiary (3.08:1) → secondary; links used the shared `TextLink` accent (3.9:1) → ink / ink-soft on Employee screens (computed colours verified in the browser) |
| A12 | Reduced motion | PASS | `employee-keyboard.spec.ts` asserts the created-row highlight has `animation-name: none` |
| A13 | Keyboard-only EJ01–EJ05 | PASS | EJ10 (sign in, create, add stock by keyboard) plus per-journey keyboard steps |
| A14 | No axe dependency | As decided | manual checklist above |

## 3. CP9 layout (L1–L4)

| # | Check | 1280 | 1024 | 200% (640 CSS px) |
| --- | --- | --- | --- | --- |
| L1 | Top bar one row | PASS | PASS | PASS after fix — nav labels and `로그아웃` broke mid-word ("여행상 품"); **fixed** with `white-space: nowrap`, name truncates |
| L2 | No page-level horizontal scroll | PASS | PASS | PASS (measured `scrollWidth ≤ innerWidth`) |
| L3 | Editor column, sticky bar does not cover last field at scroll end | PASS | PASS | PASS (bar is in flow after the form) |
| L4 | Stock dialog fully visible | PASS | PASS | PASS |

## 4. Defects found during Employee implementation and QA

| Found in | Defect | Severity | Status |
| --- | --- | --- | --- |
| E-PR1 design (CP7 A-5) | Private caches survived an identity change while authenticated | S0 (privacy) | Fixed in E-PR1 |
| E-PR2 | HTTP 401 cleared the session and the access boundary redirect would drop editor input | S1 | Fixed: in-place sign-in-again banner (CP5 §3.5) |
| E-PR2 | Auth bootstrap could overwrite a login that finished first (also made a Customer test flaky) | S2 | Fixed |
| E-PR4 | Stock dialog did not return focus to its opener | S2 (a11y) | Fixed |
| E-PR5 | Header count contrast 3.08:1; Employee links 3.9:1 | S3 (a11y) | Fixed on Employee screens |
| E-PR5 | Top bar labels broke mid-word at 200% zoom | S3 | Fixed |
| E-PR5 | Create link styled differently from the primary `Button` (CP2-B said charcoal; code uses brass) | S4 | Fixed; CP2-B corrected |

**Open, outside Employee scope:** the shared `TextLink` accent colour is 3.9:1 on light surfaces across Customer screens. Recorded for Completion Plan W4 (Customer completion items); not changed here because it alters Customer visuals.

## 5. Result

Employee release gate (CP10 §3): **MET** on the E-PR5 head, subject to E-PR3/E-PR4/E-PR5 CI on `main`.
