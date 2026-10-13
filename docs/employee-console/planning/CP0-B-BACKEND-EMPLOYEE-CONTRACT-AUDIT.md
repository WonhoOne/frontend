# CP0-B — Approved Employee API Contract vs Backend Implementation Audit

> Status: **REVIEW / NOT MERGED** — source inspection complete and this checkpoint report persisted to a documentation-only review branch.
> Date: 2026-10-13 (Asia/Seoul)
> Owner: 김태우 / `WonhoOne/frontend`
> Phase: P1 detailed planning, **CP0-B only**
> **Branch dependency:** [CP0-A PR #46](https://github.com/WonhoOne/frontend/pull/46) was **OPEN / unmerged when this audit began**. This branch is based on CP0-A's review branch; this report must be merged **after** CP0-A, not independently against older main.
> Source snapshots: [docs/main `f49d0457498e8b775f659a27e0c3a96d288d0ba0`](https://github.com/WonhoOne/docs/commit/f49d0457498e8b775f659a27e0c3a96d288d0ba0); [backend/main `597cf92f1baf93211862d4ea5dbfa8a199b808a2`](https://github.com/WonhoOne/backend/commit/597cf92f1baf93211862d4ea5dbfa8a199b808a2); [frontend/main `fa84f4b578a3969213bfc851d5b4fa8121ead66d`](https://github.com/WonhoOne/frontend/commit/fa84f4b578a3969213bfc851d5b4fa8121ead66d).
> Inputs: [Employee planning program](../00-PLANNING-PROGRAM.md), [CP0-A](CP0-A-FRONTEND-RUNTIME-INVENTORY.md) and [progress ledger](../01-PROGRESS-AND-HANDOFF.md).
> Evidence type: GitHub **static code + existing test source** inspection, not new test runs, database access, deployment or actual credential validation.

## 1. Goal / conclusion

Compare the approved shared v0.2 Employee-related FR/BR/NFR and REST wire contracts with the **actual** Backend `main` controller, DTO, security, service, persistence and test source. Distinguish stable implementation facts from outstanding **Frontend UX choices**, runtime checks and source-only limitations.

**Result: SOURCE CONTRACT ALIGNED FOR DEFINED EMPLOYEE OPERATIONS.** All five approved Employee endpoints exist with the documented HTTP methods, role security, basic request/response shapes and core domain behavior. The existing backend has dedicated tests for authorization, Product writes/Theme lock, Inventory quantities/concurrency and Employee account provisioning. This source alignment is **not** a claim that an Employee UI or an actual deployed account has been tested.

**No docs-first shared-contract change is currently required just to begin Employee UX planning.** Later CPs must not invent Schedule/product delete/status APIs, dashboard metrics, Inventory stock replacement, Employee public signup or idempotency-key support.

## 2. Shared SSOT snapshot and requirements map

| Source | Approved statements relevant to Employee |
| --- | --- |
| [Requirements v0.2](https://github.com/WonhoOne/docs/blob/main/requirements/requirements.md) | FR-01: CUSTOMER/EMPLOYEE accounts, no public Employee signup; FR-10 Employee TourProduct create/list/edit with Theme-allowed per-style prices; FR-11 inventory read + positive additions |
| [Business Rules v0.2](https://github.com/WonhoOne/docs/blob/main/requirements/business-rules.md) | BR-16 role; BR-17 Theme:TourProduct; BR-21 integer KRW per-participant prices; BR-24/25 Inventory fixed aggregates/positive additions/no decrement; BR-29 plain ordered arrays; BR-31 linked-Schedule Theme lock |
| [REST API Contract v0.2](https://github.com/WonhoOne/docs/blob/main/api/api-spec-draft.md) | Sections 1/2/3/8/10: JWT role/401/403, login DTO, 5 Employee endpoints, Product write DTO/response, Inventory DTO, stable error vocabulary |
| [NFRs](https://github.com/WonhoOne/docs/blob/main/requirements/non-functional-requirements.md) | NFR-02 Inventory data accuracy, NFR-03 defined Employee core functions 100%, NFR-06 unit + main-scenario integration tests |
| [Repository responsibilities](https://github.com/WonhoOne/docs/blob/main/architecture/repository-responsibilities.md) | Employee frontend owner `WonhoOne/frontend` / 김태우, Backend implements API/validation/persistence. Frontend must not modify Backend or DB directly |
| [Baseline v0.2](https://github.com/WonhoOne/docs/blob/main/baseline/BASELINE-v0.2.md) | Approved shared meaning, frontend-local UI routes/auth token storage, backend-local Employee provisioning and persistence implementation |

Original shared files are on **docs/main** at the stated snapshot. No modification was made to the approved shared contract.

## 3. Method-by-method API implementation matrix

### Endpoints

| Verb and public path | Role | Input | 200/201 response | Concrete Backend source |
| --- | --- | --- | --- | --- |
| `POST /api/v1/auth/login` | Public | `loginId`, `password` | **200**, `accessToken`, `tokenType:'Bearer'`, `expiresIn`, `user:{id,role,name}` (can be EMPLOYEE) | [AuthController](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/api/controller/AuthController.java), [AuthService](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/application/auth/AuthService.java), [LoginResponse](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/api/dto/LoginResponse.java) |
| `GET /api/v1/employee/tours` | EMPLOYEE | none | **200** plain `TourProductResponse[]` sorted ID ASC (empty = `[]`) | [EmployeeTourController](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/api/controller/EmployeeTourController.java), [TourProductQueryService](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/application/tour/TourProductQueryService.java) |
| `POST /api/v1/employee/tours` | EMPLOYEE | `theme,name,description,stylePrices` | **201** complete created `TourProductResponse` | [EmployeeTourController](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/api/controller/EmployeeTourController.java), [TourProductCommandService](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/application/tour/TourProductCommandService.java) |
| `PUT /api/v1/employee/tours/{tourId}` | EMPLOYEE | same complete write body | **200** complete updated `TourProductResponse` | same command, [TourScheduleJpaRepository.existsByTourProductId](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/infrastructure/persistence/repository/TourScheduleJpaRepository.java) |
| `GET /api/v1/employee/inventory` | EMPLOYEE | none | **200** plain `InventoryResponse[]`, ordered ID ASC; zero-stock included | [EmployeeInventoryController](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/api/controller/EmployeeInventoryController.java), [InventoryQueryService](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/application/inventory/InventoryQueryService.java) |
| `POST /api/v1/employee/inventory` | EMPLOYEE | `{itemType,quantity}` positive integer quantity **delta** | **200** updated `{id,itemType,quantity}` aggregate | [InventoryAddRequest](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/api/dto/InventoryAddRequest.java), [InventoryCommandService](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/application/inventory/InventoryCommandService.java) |

The shared approved **Employee endpoints are five** (Tour 3 + Inventory 2) **plus the shared public Login endpoint**. There is **no approved Employee-specific GET product-detail endpoint**. The existing public `GET /api/v1/tours/{tourId}` is separately approved as a public read, but its eventual use for Employee editing/reload is a later frontend data-flow decision. The API has no Employee TourSchedule create/delete or stock replacement.

### Precise DTO shapes (contract-and-code checked)

**TourProductResponse**, both read and POST/PUT response:
```ts
{
  id: positiveInteger,
  theme: 'HONEYMOON_ROMANCE'|'PARENTS_HEALING'|'GOLF_CHALLENGE'|'OUTDOOR_TREKKING',
  name: string,
  description: string,
  availableStyles: TourStyle[],     // response-only, derived from Theme
  stylePrices: Array<{style:TourStyle, amount:positiveInteger, currency:'KRW'}>
}
```

**TourProduct create/update request**: `{theme,name,description,stylePrices}` — do **not** submit response-only `id` or `availableStyles`, a TourSchedule, image, destination, price preview, etc. [WriteRequest](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/api/dto/TourProductWriteRequest.java).

**Inventory**: four fixed `itemType` values `COUPLE_TSHIRT`, `GINSENG_GIFT`, `GOLF_BALL`, `SCARF`; GET/POST response `{id: positiveInteger,itemType,quantity: nonNegativeInteger}`. POST body `{itemType,quantity:positiveInteger}`. Source: [InventoryItemType](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/domain/InventoryItemType.java), [InventoryResponse](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/api/dto/InventoryResponse.java), [InventoryAddRequest](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/api/dto/InventoryAddRequest.java).

### Product write validation — exact observable facts

- `theme` required; `name` required/nonblank/max 255; `description` required/nonblank/max 2000; `stylePrices` list required. Java nested entry `style` required, `amount` `Long > 0`, `currency` nonblank, and semantic validator requires exactly **one KRW price per allowed style**. Sources: [TourProductWriteRequest](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/api/dto/TourProductWriteRequest.java), [TourProductWriteValidator](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/application/tour/TourProductWriteValidator.java).
- Allowed `stylePrices` sets: `HONEYMOON_ROMANCE`/`PARENTS_HEALING` → `GRAND, PREMIUM`; `GOLF_CHALLENGE`/`OUTDOOR_TREKKING` → `CLASSIC, GRAND, PREMIUM`. Backend computes `availableStyles`; it is not a separately editable setting. [TourStylePolicy](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/domain/TourStylePolicy.java).
- Missing required styles → `422 VALIDATION_FAILED` with `fieldErrors.field='stylePrices'`, code `REQUIRED`. Duplicate/disallowed style → field path like `stylePrices[0].style` and code `DUPLICATE_VALUE`/`NOT_ALLOWED`; non-KRW currency → `NOT_ALLOWED`; zero or negative amount → `OUT_OF_RANGE`. Existing backend test: [TourApiIntegrationTests](https://github.com/WonhoOne/backend/blob/main/src/test/java/com/wonhoone/misterworld/tour/TourApiIntegrationTests.java).
- Request with unrecognized properties, malformed types, unknown enum or non-integral number is tested as `400 MALFORMED_REQUEST` (not a `422` field error); Frontend must distinguish wire parsing errors from semantically invalid valid-shaped submissions.
- POST creates Product and all style-price rows transactionally. PUT replaces complete Product details/style-price set transactionally; no PATCH/partial edit endpoint. Tests include rollback on failed price insertion and invalid updates.
- On successful Product writes the API returns the complete canonical server representation. Frontend must treat it and subsequent server reads as authoritative, not continue showing stale guessed prices.

### Linked-Schedule Theme lock — exact behavior

```text
No linked TourSchedule:
  valid PUT changes Theme, name, description and complete stylePrices => 200.
One or more linked TourSchedules (past/future/confirmed/unconfirmed all count):
  same-Theme PUT => 200 (name, description, prices may change);
  different-Theme PUT => 409 TOUR_PRODUCT_THEME_LOCKED, fieldErrors: [].
```

Confirmed by [BR-31](https://github.com/WonhoOne/docs/blob/main/requirements/business-rules.md), [REST contract](https://github.com/WonhoOne/docs/blob/main/api/api-spec-draft.md), [TourProductCommandService](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/application/tour/TourProductCommandService.java), [ThemeLockIntegrationTests](https://github.com/WonhoOne/backend/blob/main/src/test/java/com/wonhoone/misterworld/tour/ThemeLockIntegrationTests.java).

**Important frontend information boundary:** `TourProductResponse` does **not** expose a `themeLocked` or linked-Schedule flag. Public `GET /api/v1/tour-schedules?tourId=...` exists, but whether Employee UX should query it merely to indicate potential lock is a CP1/CP8 choice and would never replace Backend PUT validation; there can be a race between a read and a write. **Do not invent an Employee lock-check endpoint or assume the form can know this lock just from Product response.**

## 4. Inventory semantics and precision

- Four catalog rows are [Flyway-seeded](https://github.com/WonhoOne/backend/blob/main/src/main/resources/db/migration/V2__seed_inventory_catalog.sql) at quantity zero; [InventoryQueryService](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/application/inventory/InventoryQueryService.java) returns ID-ascending rows, including zero stock.
- For `POST /employee/inventory` a **positive** `Long` request quantity is **added**, not assigned. `quantity:5` sent to current balance 10 yields updated `quantity:15`. Never label quantity input as "new total stock" or implement replacement UX.
- The command obtains a [pessimistic WRITE lock](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/infrastructure/persistence/repository/InventoryJpaRepository.java) on an existing `itemType` row, calls `Math.addExact(current,add)` and flushes; concurrency tests explicitly assert simultaneous adds to same item are both retained.
- `itemType` missing/null, `quantity` missing/null, nonpositive request → `422 VALIDATION_FAILED`, `REQUIRED`/`OUT_OF_RANGE`; invalid enum, fractional/string `quantity`, unknown property, too-large JSON numeric value → `400 MALFORMED_REQUEST`. [InventoryApiIntegrationTests](https://github.com/WonhoOne/backend/blob/main/src/test/java/com/wonhoone/misterworld/inventory/InventoryApiIntegrationTests.java).
- **Backend numeric range:** Java `long` / SQL BIGINT. Existing tests exercise quantities above signed 32-bit max and up to `Long.MAX_VALUE`. **Frontend JavaScript numbers cannot represent all 64-bit integers exactly.** Later CP8 must decide contract-safe parsing/input/display (e.g. string/native `BigInt` internal strategy or documented bounded UI validation) without falsely claiming all backend `long` values are JS-safe or inventing a shared maximum.
- Existing [InventoryApiIntegrationTests](https://github.com/WonhoOne/backend/blob/main/src/test/java/com/wonhoone/misterworld/inventory/InventoryApiIntegrationTests.java) assert **overflow → 500 INTERNAL_ERROR and no change**, and a missing fixed catalog row → 500, no substitute row created. Treat this as **verified implementation behavior and a UX reliability concern**, not a promised clean 422 overflow field error. Shared API explicitly leaves overflow implementation local.
- **No idempotency mechanism is defined or observed** in the approved Inventory API/command/service contract. Re-sending POST after a network timeout/unknown response **may add quantity twice**. The frontend must not automatically retry this mutation as if it were an idempotent GET; exact reconciliation UX is CP5-B/CP8-B work.
- No Inventory PUT/DELETE/decrement, stock audit ledger, external stock binding or reservation-triggered automatic deduction.

## 5. Employee account provisioning, login and role security

| Item | Verified source behavior |
| --- | --- |
| Login endpoint | [AuthController](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/api/controller/AuthController.java) `POST /api/v1/auth/login` public. [AuthService](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/application/auth/AuthService.java) authenticates stored CUSTOMER or EMPLOYEE; returns JWT with role in response |
| Signup policy | Only CUSTOMER from public signup; role input cannot create Employee. Employee must be provisioned outside it |
| Provisioner | [EmployeeBootstrap](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/application/auth/EmployeeBootstrap.java) is `ApplicationRunner`, **disabled by default**, enabled by `EMPLOYEE_BOOTSTRAP_ENABLED` plus `EMPLOYEE_LOGIN_ID`, `EMPLOYEE_PASSWORD`, `EMPLOYEE_NAME`, `EMPLOYEE_ADDRESS`, `EMPLOYEE_CONTACT` configuration. Validates, lowercases/normalizes ID, BCrypt hashes, creates EMPLOYEE if ID absent, idempotent; existing CUSTOMER ID is **not promoted** or overwritten. Do not record secret values in docs or Git |
| Security | [SecurityConfig](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/security/SecurityConfig.java) JWT stateless role-to-authority mapping; `/api/v1/employee/**` requires `hasRole('EMPLOYEE')`; Reservation/History require Customer; other paths deny by default |
| 401/403 semantics | [SecurityErrorHandlers](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/security/SecurityErrorHandlers.java) missing `Authorization` → `401 AUTHENTICATION_REQUIRED`; malformed/invalid token → `401 INVALID_ACCESS_TOKEN`; recognized expiry → `401 ACCESS_TOKEN_EXPIRED`; authenticated wrong role → `403 FORBIDDEN`; `WWW-Authenticate: Bearer` on 401 |
| Token lifecycle | Access token only, `expiresIn` response in seconds; no refresh/logout REST endpoint in v0.2. Browser memory storage is a frontend-local policy; same-source token can support authenticated Employee calls after safe role-aware adaptation |
| Frontend limitation | [CP0-A source finding](CP0-A-FRONTEND-RUNTIME-INVENTORY.md): frontend's current customer-oriented `auth.adapter.ts` rejects Employee with `FORBIDDEN`, although DTO decoder understands role. Employee login **not yet operable through Frontend** |

**Account readiness ≠ code exists.** Source proves a configurable provisioning mechanism, and [employee provisioning tests](https://github.com/WonhoOne/backend/blob/main/src/test/java/com/wonhoone/misterworld/auth/EmployeeProvisioningTests.java) exercise it. We **did not confirm an EMPLOYEE account actually exists in the intended run/demo DB**, nor test real credentials or a deployed runtime. Operational account setup/demo secret handoff is a future implementation/demo readiness dependency; the user should not disclose real passwords in tickets/chats.

## 6. Error taxonomy and frontend decision points

| HTTP + machine code | Existing Backend behavior / trigger | Employee UX must eventually plan |
| --- | --- | --- |
| `200`, `201` | Successful reads or mutations; responses as above | Successful save/stock-add feedback and read refresh policy |
| `400 MALFORMED_REQUEST` | JSON syntax/type/unknown enum/unknown property/invalid numeric wire | Recoverable form input messaging vs unexpected DTO mapping issue; do not normalize into generic 422 silently |
| `400 INVALID_QUERY_PARAMETER` | Invalid `tourId` path such as 0 or nonnumeric | Invalid route/selection recovery |
| `401 AUTHENTICATION_REQUIRED` | Employee protected endpoint without token | Auth entry + preserved safe return context; no auto-resend of write |
| `401 INVALID_ACCESS_TOKEN` / `ACCESS_TOKEN_EXPIRED` | Invalid or expired bearer | Clear sensitive cached state; prompt re-auth; preserve unsaved form safely where appropriate |
| `403 FORBIDDEN` | CUSTOMER token on Employee endpoints; or wrong-role access | Distinct permission-denied view, not an infinite login loop |
| `404 TOUR_PRODUCT_NOT_FOUND` | PUT nonexisting `tourId` | Product deleted/missing or stale route recovery; never fabricate product details |
| `409 TOUR_PRODUCT_THEME_LOCKED` | Different Theme PUT on Product with any linked Schedule | Conflict explanation + retain pending edits safely; user can revert Theme and retry complete valid body |
| `422 VALIDATION_FAILED` | Missing/blank/out-of-bounds fields, wrong price style set, nonpositive quantity | Map `fieldErrors[]` by exact field and stable code, preserve entered values |
| `500 INTERNAL_ERROR` | Unexpected server fault; tested stock overflow/missing catalog row | Explicit error, safe recovery; no automatic stock POST retry / duplicate submission |

All JSON errors have `{code,message,fieldErrors:[]}` with **fieldErrors array always present**. [ApiExceptionHandler](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/api/error/ApiExceptionHandler.java) implements centralized 400/404/409/422/500; [ApiError](https://github.com/WonhoOne/backend/blob/main/src/main/java/com/wonhoone/misterworld/api/error/ApiError.java). The client must use **status + stable `code`**, not parse localized `message`; do not display internal error/SQL details.

**Note:** Backend calls Bean Validation before semantic validation; BR-31 expects 409 for an existing Product and a syntactically/semantically valid request conflicting with a linked Schedule. Shared v0.2 explicitly does **not** set a novel precedence rule for a malformed request coinciding with a theme conflict. Do not overstate one.

## 7. Backend evidence inventory and limits

### Existing source-level test suites verified present

- [AuthIntegrationTests](https://github.com/WonhoOne/backend/blob/main/src/test/java/com/wonhoone/misterworld/auth/AuthIntegrationTests.java): real Spring Security filter/MockMvc role matrix, Employee login, Customer forbidden from Employee path, Employee forbidden from Customer History path, 401/403, token expiry, malformed input.
- [EmployeeProvisioningTests](https://github.com/WonhoOne/backend/blob/main/src/test/java/com/wonhoone/misterworld/auth/EmployeeProvisioningTests.java), [EmployeeBootstrapStartupTests](https://github.com/WonhoOne/backend/blob/main/src/test/java/com/wonhoone/misterworld/auth/EmployeeBootstrapStartupTests.java): disabled/valid/idempotent bootstrap and account role tests.
- [TourApiIntegrationTests](https://github.com/WonhoOne/backend/blob/main/src/test/java/com/wonhoone/misterworld/tour/TourApiIntegrationTests.java): Employee product list/create/update, style-set validation, typed errors, rollback, role protection, ID ordering.
- [ThemeLockIntegrationTests](https://github.com/WonhoOne/backend/blob/main/src/test/java/com/wonhoone/misterworld/tour/ThemeLockIntegrationTests.java): Theme change before schedule, after schedule 409, same-theme edits permitted, historical and confirmed Schedules still lock, no partial changes.
- [InventoryApiIntegrationTests](https://github.com/WonhoOne/backend/blob/main/src/test/java/com/wonhoone/misterworld/inventory/InventoryApiIntegrationTests.java): 4 fixed rows, zero, GET/POST, addition not replacement, Long range, overflow rollback, missing rows, malformed/invalid requests, 401/403.
- [InventoryConcurrencyTests](https://github.com/WonhoOne/backend/blob/main/src/test/java/com/wonhoone/misterworld/inventory/InventoryConcurrencyTests.java): parallel same-item adds no lost update; lock waits; different-item isolation.
- [MySqlRuntimeMySqlIT](https://github.com/WonhoOne/backend/blob/main/src/test/java/com/wonhoone/misterworld/mysql/MySqlRuntimeMySqlIT.java): real-MySQL-mode integration **test source** includes inventory seed/DB constraints, EmployeeBootstrap login and a limited Employee inventory GET/POST alongside Customer flows. See also prior [B9 closeout](https://github.com/WonhoOne/docs/blob/main/B9-INTEGRATION-CLOSEOUT.md) for historical integration status.

**Scope and inference discipline:** Source inspection confirms tests exist and what each asserts, not that we just ran them. There was **no new Maven/Gradle run, Employee login attempt, live Spring request, MySQL query, browser interaction, load measurement or deployed account verification** in CP0-B. Previous B9 pass evidence is not an Employee Console E2E pass. NFR-02/03/06 must receive fresh, scope-specific acceptance evidence after P2.

## 8. Contract differences and risks requiring future planning (not Backend change requests)

| Ref | Finding | Status / assignment |
| --- | --- | --- |
| B-01 | All five Employee routes + Login match current shared method/path and role contract | **ALIGNED**. Use as CP1/CP6 inputs |
| B-02 | Existing customer frontend rejects Employee login; Backend supports Employee role | **FRONTEND INTEGRATION BLOCKER** → CP1 auth UX, CP7 Auth architecture, CP8 integration |
| B-03 | No Employee `GET /employee/tours/{id}`, no `themeLocked` field, no Employee Schedule edit API | **CONTRACTED LIMIT**; CP1/CP6/CP8 design with approved reads, handle 409 without invented APIs |
| B-04 | Inventory POST additive, not idempotent; unknown network result could already be applied | **CRITICAL UX/SAFETY DESIGN** → CP5-B, CP8-B, CP10 |
| B-05 | Java `long` quantity/prices vs JS number safe-integer boundary | **PRECISION RISK** → CP8-A/B, CP10; do not invent contract limits |
| B-06 | EmployeeBootstrap optional/disabled by default; run/demo account existence not proven | **OPERATIONAL READINESS PENDING** → CP0-C demo scope / later actual environment readiness |
| B-07 | Existing backend overflow returns safe 500, rather than structured 422; no partial inventory mutation | **SOURCE FACT, not a contract gap**. CP5 error/retry design |
| B-08 | No numeric stock history/decrement, product deletion, schedule management, dashboard statistics in v0.2 | **OUT OF SCOPE**; don't import reference features into Mister World |
| B-09 | Backend H2/MockMvc + optional MySQL test sources exist; today's execution not observed | **TEST EVIDENCE LIMIT**; CP10/P2 must run fresh Employee scenarios |
| B-10 | No new shared contract blockers detected for defined five Employee endpoints | **NO docs-side proposal now**; raise owner issue only if later design truly requires a new API |

### Unresolved **frontend-local UX** decisions (not missing Backend contracts)

How Employee entry/login is separated; how existing customer return context/history/voice surfaces stay isolated; product list/editor route/surface choice; how Theme-linked-schedule risk is disclosed before/after PUT; how to handle user text up to 2000 characters and 2/3 style-dependent KRW values; stock-add confirmation and ambiguous success reconciliation; device support scope; admin visual references. These remain **TBD** in CP1/CP2/CP3/CP5/CP6/CP8, not prematurely decided in this report.

## 9. Checkpoint exit criteria

- [x] Verified CP0-A PR status and recorded dependent-branch strategy (CP0-A still **OPEN**, no auto-merge).
- [x] Captured approved docs/main, Backend/main and frontend/main SHAs.
- [x] Read FR-01/10/11; BR-16/17/21/24/25/29/31; NFR-02/03/06; v0.2 REST role, DTO and common error sections.
- [x] Traced actual Backend Auth and both Employee controllers through DTOs, validators, services and repositories.
- [x] Verified Employee provisioning and Spring Security role checks.
- [x] Checked Product Theme lock + Inventory atomic-add concurrency behavior against current test **source**.
- [x] Distinguished implemented code, approved contract, frontend risks and unverified deployed/runtime account state.
- [x] Recorded evidence URLs, implementation-safe input for CP0-C and later UI/architecture/checkpoints.
- [x] No Employee application code or shared contract changes.
- [ ] Review and merge CP0-A PR #46 first; then merge this CP0-B stacked PR after its base is advanced appropriately and dependencies are verified.

**Next main step after reviews/merges and user instruction: CP0-C — confirm Employee scope, device support, demo prerequisites/timeline, owner decisions and blockers.**

**Stop rule:** Do not interpret CP0-B's API contract alignment as approval of Employee route/UI design, new API requirements or readiness to implement.
