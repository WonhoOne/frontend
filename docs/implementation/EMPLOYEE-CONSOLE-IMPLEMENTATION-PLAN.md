# Mister World — Employee Console Implementation Plan

> Status: **PLANNING / NOT YET IMPLEMENTED**
> Date: 2026-10-13 (Asia/Seoul)
> Owner: 김태우 — WonhoOne/frontend
> Source of truth: latest approved WonhoOne/docs/main (currently Baseline v0.2)
> Precedence: shared SSOT > frontend AGENTS.md > this frontend-local plan > historical customer planning documents

## 1. Why this document exists

The original Customer Frontend planning package (2026-09-29/30) excluded Employee Console from its **customer-screen implementation scope**. That exclusion is not the current repository/team responsibility. The approved [repository-responsibilities.md](https://github.com/WonhoOne/docs/blob/main/architecture/repository-responsibilities.md) and [frontend AGENTS.md](../../AGENTS.md) assign Customer GUI, Employee Console and Frontend ↔ Backend live integration to 김태우. 이한결 has a scoped exception for Voice directories only. WonhoOne/ai-console is a historical/legacy repository, not the default implementation location for new Employee Console work.

This is a **frontend-local execution plan**, not a new Shared Contract, new Backend endpoint specification or a retroactive edit of the original submitted project plan. Do not copy domain/API decisions here as a substitute for reading latest docs/main.

## 2. Verified status at planning time (2026-10-13)

| Area | Observed status / evidence |
| --- | --- |
| Customer GUI | 10 customer routes plus Previous Trips popup present; B9 customer/Voice integration gate FINAL PASS per [B9 closeout](https://github.com/WonhoOne/docs/blob/main/B9-INTEGRATION-CLOSEOUT.md) |
| Frontend Employee routes | No employee route in [router/paths.ts](../../src/app/router/paths.ts) or [router/routes.tsx](../../src/app/router/routes.tsx) |
| Employee page/feature/API integration | Not found on current frontend/main during document audit; needs implementation |
| Existing auth boundary | Frontend Login/Auth integrates Backend and recognizes CUSTOMER/EMPLOYEE roles; employee route/role UX still needs design and integration |
| Backend Employee TourProduct | GET/POST/PUT specified by v0.2; backend documents EmployeeTourController and validated writes |
| Backend Employee Inventory | GET/POST specified by v0.2; backend inventory document describes atomic addition |
| Shared ownership/API contract | Already approved on docs/main; no common-contract change requested by this document |

Do not interpret a docs-only planning status as a runtime test of an Employee journey. Re-check current branches, merged PRs and contracts before implementation.

## 3. Scope and requirements

- **FR-01 / BR-16:** authenticated EMPLOYEE access. Public signup only creates CUSTOMER accounts; employee accounts are provisioned by Backend-local means, not a new employee-signup page.
- **FR-10 / BR-17 / BR-21 / BR-31:** list, create, and edit actual TourProduct entities. A Theme is a classification, not an individual product. Request includes theme, name, description, and full permitted stylePrices for the chosen Theme. Backend decides validation and immutable Theme conflict when any linked TourSchedule exists.
- **FR-11 / BR-24 / BR-25:** show aggregate inventory for the fixed four item types and add positive quantity to current stock. The POST quantity is a delta, not a replacement value.
- **NFR-02, NFR-03, NFR-06:** accuracy of persisted/read data, complete functioning of defined Employee Console features, and unit/integration validation. Check NFR-04/NFR-05 in latest shared document for the whole project.

Employee Console needs no AI Voice controls or independent STT flow. Keep customer and employee role capabilities separate.

### Explicit non-goals for v0.2

No public Employee signup; no TourProduct DELETE; no TourSchedule CRUD; no Inventory decrement, overwrite, delete, item type creation, transaction ledger or reservation-linked stock deduction; no option/price/SMS-management endpoints; no employee reservation management, payment, refund or cancellation; no independently invented endpoints or business rules.

## 4. Approved Backend API inventory

Canonical source: [docs/main REST API v0.2](https://github.com/WonhoOne/docs/blob/main/api/api-spec-draft.md).

| Method | Path | Frontend interaction | Success |
| --- | --- | --- | --- |
| POST | /api/v1/auth/login | Employee login, same approved Auth API; verify user.role = EMPLOYEE | 200 |
| GET | /api/v1/employee/tours | TourProduct list (id ascending) | 200 plain array |
| POST | /api/v1/employee/tours | Create TourProduct: theme, name, description, stylePrices | 201 product |
| PUT | /api/v1/employee/tours/{tourId} | Replace approved editable TourProduct fields | 200 product |
| GET | /api/v1/employee/inventory | Inventory list (id ascending) | 200 plain array |
| POST | /api/v1/employee/inventory | Add itemType + positive integer quantity | 200 updated inventory |

- No new /me, /refresh-token, /logout, /themes, /prices, /inventory/{id} or employee-registration API.
- Use the existing centralized Backend HTTP client and auth-session boundary. Do not fetch from pages or introduce a second token source.
- Employee API requires JWT Bearer with EMPLOYEE role. Missing/expired token is 401; wrong role is 403. A client-side route guard supports UX but cannot replace Backend authorization.
- Shared TourProduct response includes id, theme, name, description, backend-derived availableStyles and stylePrices; availableStyles must **not** be sent in writes.
- Permitted stylePrices are complete/unique positive integer KRW amounts: Honeymoon/Parents = GRAND+PREMIUM; Golf/Trekking = CLASSIC+GRAND+PREMIUM. Backend validation remains final.
- Theme-change PUT with at least one linked Schedule returns 409 TOUR_PRODUCT_THEME_LOCKED; **do not** guess link existence or permanently disable Theme editing from absent API fields. On conflict, keep entered data and show safe server-grounded recovery. Same-Theme PUT can still edit other fields.
- Inventory types: COUPLE_TSHIRT, GINSENG_GIFT, GOLF_BALL, SCARF; may include quantity zero. Inventory POST adds a positive quantity; refetch or update cache from the returned backend balance, never assume the submitted number is the new total.
- Use approved stable error code, fieldErrors and status, not ad hoc parsing of human-readable messages.

## 5. Candidate frontend screens — local UX plan, not Shared Contract

The following paths and visual composition are **proposals for implementation review**, not pre-approved shared URL contracts.

| Surface | Proposed route | Core behavior |
| --- | --- | --- |
| Employee entry | /employee (or redirect to employee tours) | Role-aware protected shell/navigation, links to Tours and Inventory |
| Employee Tour list | /employee/tours | Loading/empty/error/retry; ordered list/table with Theme, name, style prices; create/edit navigation |
| Employee Tour create | /employee/tours/new | Form, Theme-dependent complete style-price inputs, guarded submit |
| Employee Tour edit | /employee/tours/:tourId/edit | Load selected TourProduct; form with server conflicts and safe retry |
| Employee inventory | /employee/inventory | Four item quantities, additive stock entry, confirmation and refresh |

Login route can reuse the existing approved /login with a safe employee post-login destination if frontend-local UX review confirms it; do not create a separate auth mechanism. Because the current Login flow returns to customer Home by default, implement and test an explicit employee entry/return policy before claiming role-aware routing is complete. Do not route EMPLOYEE into CUSTOMER-only reservation/history flows.

## 6. Architecture and data flow

Keep the existing React/TypeScript, React Router, TanStack Query, central BackendHttpClient, runtime DTO decoders, adapter/view model boundary, accessible primitives and test harness. Suggested modular ownership:

- app/router + role-aware shell/guards: approved employee routes and navigation, no domain parsing.
- pages/employee-*: route composition only.
- features/employee-tours: list/editor view model, form state, mutations, query invalidation, read/update presentation.
- features/employee-inventory: stock view model, aggregate display, addition mutation and error recovery.
- integrations/backend: DTO decoders and typed Employee data sources using the existing central transport.
- shared/ui: reuse only truly business-agnostic accessible controls; no speculative dashboard framework or duplicate HTTP client.

API JSON → strict decoder → adapter → Feature model → UI. Server truth stays in Query cache. Local form edits stay local until explicit submission. Never directly read/write MySQL. Keep customer ReservationDraft and Voice owned directories untouched without a concrete approved integration need.

## 7. UX/error/security checks

- Every read: initial skeleton aligned to the eventual row/card structure, success, empty, error, user retry; preserve existing content during background refresh where safe.
- Every mutation: submit disabled while pending, duplicate-submit defense, distinguish definite failures and uncertain network outcomes; do not automatically retry writes that might have reached Backend.
- Product forms: field labels, required state, Theme-dependent prices, decimal/integer-safe KRW inputs, immutable server truth, 409 Theme lock, 422 fieldErrors, 401/403 and server errors. Never fabricate TourProduct identity or style prices.
- Inventory: clearly label **추가 수량** versus **현재 수량**; block zero/negative/non-integer input; backend response sets final quantity; handle concurrent additions by rereading server truth.
- Authentication: never expose employee mutations to customer-role UI, never store credentials/private payload in URLs/logs, do not invent Auth endpoints. Session expiry can require login again according to existing memory-only auth design.
- Responsive, keyboard navigation, focus management, reduced motion, readable table overflow and accessible error annunciation must be verified on the actual console.

## 8. Execution checkpoints (future work; no code authorized by this docs-only PR)

| Gate | Implement/test | Completion evidence |
| --- | --- | --- |
| E0 — Contract & baseline | Re-read docs/main v0.2, frontend current head, Backend Employee API/validation and this plan; settle frontend-local routes/login UX | Recorded API-to-screen mapping; no undocumented contract assumptions |
| E1 — Console shell & auth | Role guard, employee navigation/entry, login return, customer/employee separation | Role 401/403 and direct-route tests |
| E2 — Employee Tour reads | DTO/adapter, Query, listing, loading/empty/error/retry | Real Backend Employee GET smoke and UI tests |
| E3 — Product write flow | Create/edit forms, style-price rules, POST/PUT and conflict recovery | Persist/create/edit tests; 409 TOUR_PRODUCT_THEME_LOCKED coverage |
| E4 — Inventory | GET list, fixed types, positive delta form and POST | Aggregate/update tests, duplicate-submit and concurrent-update recovery |
| E5 — Integrated QA | Employee account → login → product create/edit → inventory addition → refresh; customer forbidden paths | Real Backend/MySQL E2E, responsive/a11y verification, NFR-03 feature matrix |
| E6 — Final audit | Latest shared contract consistency, CI, mock safety and PR evidence | Report of completed/blocked gates, source refs and defects |

Keep the current Customer/Voice B9 completion record immutable. A new Employee gate is **not** passed merely because B9 passed.

## 9. Definition of done and handoff

- All **FR-10/FR-11** Employee UI actions work against approved real Backend APIs, with verified persistence; employee access role security enforced server-side and correctly represented in the client.
- TourProduct create/edit includes the exact allowed style-price set. 409 TOUR_PRODUCT_THEME_LOCKED does not erase form edits or disguise itself as success. Inventory quantity addition reflects returned server balance.
- Test matrix includes 200/201 success, empty, loading, validation failure, 401, 403, 409 where applicable, network/5xx, keyboard/focus and responsive screens. Confirm NFR-02/NFR-03/NFR-06 in latest SSOT.
- PR includes requirement IDs, routes, actual APIs, contract impact, test results and unresolved gaps. Do not claim tests run or gates complete before evidence exists.
- If Shared API/domain semantics need change, open a docs-first proposal and coordinate with Backend owner; this local plan may adjust routes, layout, UI labels and component arrangement without redefining contracts.

**Documentation gate status:** This file is a proposed execution plan on its branch until reviewed/merged. No production code is changed by adding this file.
