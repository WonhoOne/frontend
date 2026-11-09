# CP7 — Employee Implementation Architecture (CP7-A modules, CP7-B state ownership)

> Status: **COMPLETE — DELEGATED DECISION (2026-11-09)**
> Owner: 김태우 / `WonhoOne/frontend` (execution delegated, [Frontend Completion Plan §5](../../FRONTEND-COMPLETION-PLAN.md))
> Source snapshot inspected: frontend/main after #54 (`35c4f0a`): `src/app/router/routes.tsx`, `AppRouteLayout.tsx`, `RouteRuntime.tsx`, `src/features/auth/*`, `src/app/providers/*DataSource.ts`, `privateQueryCache.ts`, `GlobalHeader.tsx`, `PostLoginPreviousTripsSurface.tsx`, `MyTripsPage.tsx`, `LoginPage.tsx`, `tests/e2e/support/public-api-server.mjs`, `.github/workflows/d11-verify.yml`
> Rules: Master Plan §9–§13 (layers, dependency direction, feature public API), CP2 architecture §20–§21

## 1. Findings in current code that shape the design

| ID | Finding (verified) | Consequence |
| --- | --- | --- |
| A-1 | `routes.tsx` has one layout route (`AppRouteLayout`) whose `*` child renders Customer `NotFound` | Employee routes must be a **sibling top-level route** with its own layout, declared before Customer `*` can catch `/employee/*` |
| A-2 | `AppRouteLayout` always mounts `GlobalHeader`/`TransactionHeader`, `PostLoginPreviousTrips`, `CustomerVoiceControl` | New `EmployeeRouteLayout` reuses `RouteRuntime`, skip link, `<main id="main-content">`, `RouteMotionBoundary`, and mounts **only** `EmployeeShell` |
| A-3 | `auth.adapter.ts` throws `FORBIDDEN` for any non-CUSTOMER login; `AuthUser.role: 'CUSTOMER'` | Role check moves from adapter to an explicit **expected role** at login (§3) |
| A-4 | `GlobalHeader` (line 86) and `PostLoginPreviousTripsSurface` (lines 24, 27) treat `status === 'authenticated'` as Customer | Must switch to a Customer-session check once EMPLOYEE sessions exist |
| A-5 | `AuthProvider` calls `onAuthLoss` (clears private queries) only on authenticated → unauthenticated | Logging in as a different user/role **while authenticated** would keep the previous user's private caches. Must clear on identity change too (§3) |
| A-6 | DataSources are composed in `src/app/providers/*DataSource.ts`: Mock only when `DEV && VITE_ENABLE_MOCKS === 'true'`, else Backend | Employee DataSources follow the same composition |
| A-7 | E2E fake server `tests/e2e/support/public-api-server.mjs` serves only public GETs | Employee browser E2E with mocked API needs Employee handlers there (§6) |
| A-8 | Real-backend CI job sets `EMPLOYEE_BOOTSTRAP_ENABLED: 'false'` and seeds one GOLF product **with a schedule** | Enable bootstrap with disposable CI-only values → real Employee E2E incl. 409 Theme lock (§6) |

## 2. CP7-A — Module map

```text
src/
├── app/
│   ├── router/
│   │   ├── paths.ts                      + employeeRoutePaths / employeeRouteBuilders
│   │   ├── routes.tsx                    + sibling { element: <EmployeeRouteLayout/>, children: [...] }
│   │   ├── EmployeeRouteLayout.tsx       NEW  RouteRuntime + skip link + EmployeeShell + main + RouteMotionBoundary
│   │   └── EmployeeAccessBoundary.tsx    NEW  anon → login?returnTo ; CUSTOMER → permission state ; EMPLOYEE → <Outlet/>
│   ├── shell/
│   │   └── EmployeeShell.tsx (+ .module.css)  NEW  top bar (E00)
│   └── providers/
│       ├── employeeTourDataSource.ts      NEW  Mock | Backend composition
│       └── employeeInventoryDataSource.ts NEW
├── pages/
│   ├── employee-login/EmployeeLoginPage.tsx          E01
│   ├── employee-tours/EmployeeToursPage.tsx          E02
│   ├── employee-tour-create/EmployeeTourCreatePage.tsx   E03
│   ├── employee-tour-edit/EmployeeTourEditPage.tsx   E04
│   ├── employee-inventory/EmployeeInventoryPage.tsx  E05
│   └── employee-status/EmployeeAccessDenied.tsx, EmployeeNotFound.tsx
├── features/
│   ├── auth/                       CHANGED  role-aware model (§3), employeeReturnTo.ts NEW
│   ├── employee-tours/             NEW
│   │   ├── employeeTour.model.ts            EmployeeTourProduct, ProductFormValues
│   │   ├── employeeTour.adapter.ts          DTO ⇄ model, form values → write DTO
│   │   ├── productFormRules.ts              pure validation + Theme→styles + fieldErrors mapping
│   │   ├── EmployeeTourDataSource.ts        interface
│   │   ├── BackendEmployeeTourDataSource.ts
│   │   ├── MockEmployeeTourDataSource.ts
│   │   ├── employeeTour.queries.ts          useEmployeeTourProducts, useCreate…, useUpdate…
│   │   ├── ProductTable.tsx, StylePriceList.tsx, ThemeLabel.tsx
│   │   ├── ProductForm.tsx, KrwAmountField.tsx, EditorActionBar.tsx
│   │   └── index.ts                          public API only
│   └── employee-inventory/         NEW
│       ├── inventory.model.ts, inventory.adapter.ts, stockAddRules.ts
│       ├── EmployeeInventoryDataSource.ts, Backend…, Mock…
│       ├── inventory.queries.ts             useEmployeeInventory, useAddStock
│       ├── InventoryTable.tsx, StockAddDialog.tsx
│       └── index.ts
├── integrations/backend/contracts/
│   ├── employeeTourProduct.ts      NEW  write-request DTO type; response reuses tourProduct decoder
│   └── inventory.ts                NEW  decoder for InventoryResponse / list
└── shared/
    ├── lib/formatKrw.ts            NEW
    ├── hooks/useUnsavedChangesGuard.ts  NEW  (react-router blocker + beforeunload; generic)
    └── ui/SelectField/, ui/TextAreaField/   NEW
```

Dependency direction holds: pages → features → integrations; pages/features → shared. Employee features never import Customer features except the one public export `tourThemeTitle` from `features/tour-discovery` (CP3 §2.3).

## 3. CP7-A — Auth changes (smallest safe change)

1. `authTypes.ts`: `export type UserRole = 'CUSTOMER' | 'EMPLOYEE'`; `AuthUser.role: UserRole`. Keep `CustomerRole` export as an alias for existing callers.
2. `auth.adapter.ts`: `adaptLoginResponseDto` maps any decoded role; **no role rejection inside the adapter**.
3. `AuthContextValue.login(input, options: { expectedRole: UserRole })`:
   - calls the DataSource;
   - if `result.user.role !== expectedRole` → **does not store the session**, throws `AuthError('FORBIDDEN')`;
   - if a different user was authenticated before → run `onAuthLoss` (clear private caches) before storing the new session (fixes A-5).
4. Customer `LoginPage` passes `{ expectedRole: 'CUSTOMER' }` → existing behavior preserved. The existing test "Employee login is rejected" moves from the adapter test to the provider/LoginPage test with the same expectation (CP0-A F-A07: replace, don't delete).
5. Helpers in `features/auth`: `isCustomerSession(state)`, `isEmployeeSession(state)`.
6. Customer surfaces switch to `isCustomerSession`: `GlobalHeader` account link, `PostLoginPreviousTripsSurface` open/suppress, `MyTripsPage` gate. An EMPLOYEE session on Customer pages behaves like "not signed in as a customer".
7. `employeeReturnTo.ts`: `isSafeEmployeeReturnTo(path)` per E01 §2. Customer `returnContext.ts` is untouched (it is ReservationDraft-specific).

Voice-owned directories are not touched (Voice reads Customer state only).

## 4. CP7-B — State ownership

| State | Owner | Lifetime |
| --- | --- | --- |
| Session (token, role, name) | existing `AuthProvider` + memory session store | tab memory; cleared on sign-out, 401, identity change |
| Product list / inventory | TanStack Query, keys `['employee','tour-products']`, `['employee','inventory']`, `meta.privacy='private'` | cleared by `clearPrivateQueryCache` on auth loss |
| Product form values, dirty flag, hidden-style price memory | `ProductForm` local `useReducer` (pure reducer in `productFormRules.ts`) | page lifetime; never persisted |
| Editor initial snapshot | Edit page: first post-mount query result (`isFetchedAfterMount`) captured once in a ref | page lifetime |
| Write status (idle / submitting / unknown / conflict) | Mutation hook state + page-local reducer for UNKNOWN follow-up | page lifetime |
| Stock dialog (open item, input, before-quantity, phase) | `StockAddDialog` local state | dialog lifetime |
| Status line message | page-local state, passed from navigation state (`{ createdTourId }`) on E02 | until next navigation/submit |
| `returnTo` | URL search param only | request |

No new Context, no global store (Master Plan §22). The ReservationDraft provider stays mounted app-wide (it is above the router) but Employee code never reads it.

## 5. CP7-B — Testability seams

- Pure functions (`productFormRules.ts`, `stockAddRules.ts`, adapters, decoders, `isSafeEmployeeReturnTo`) → unit tests.
- DataSource interface → component tests with `MockEmployee*DataSource`.
- Pages → RTL integration tests with QueryClient + mock DataSources + memory router.
- Browser → Playwright against the fake API server (mock) and against the real Backend (CI job).

## 6. CP7-B — Test infrastructure changes

| Change | Where |
| --- | --- |
| Employee handlers (login with role by loginId, GET/POST/PUT tours, GET/POST inventory, scripted 401/403/409/422/500/abort) | `tests/e2e/support/public-api-server.mjs` (renamed responsibility: "fake API server"; file name kept to avoid churn) |
| Real Backend Employee journey | `tests/f2-mysql/employee.spec.ts` NEW |
| CI: enable bootstrap with disposable CI-only values (`EMPLOYEE_BOOTSTRAP_ENABLED: 'true'`, `EMPLOYEE_LOGIN_ID`, `EMPLOYEE_PASSWORD`, `EMPLOYEE_NAME`, `EMPLOYEE_ADDRESS`, `EMPLOYEE_CONTACT`) | `.github/workflows/d11-verify.yml` job `authenticated-mysql-e2e` (same pattern as the existing disposable `JWT_SECRET`) |

Disposable CI values are not real credentials and are not used anywhere else; the demo account is set by the Backend/demo operator (DEC-C03).

## 7. Anti-patterns explicitly avoided

- No page-local `fetch`, no Authorization header outside the central client (F1-09 handoff).
- No raw DTO in JSX; adapters produce models.
- No generic admin framework (DataTable, FormBuilder).
- No change to Customer route behavior or Voice files.
- No Employee data in `sessionStorage`/`localStorage`.

## 8. Gate

- [x] Every new module placed by layer with dependency direction preserved
- [x] Auth change is minimal, keeps Customer behavior, and fixes the identity-change cache leak (A-5)
- [x] Customer role assumptions (A-4) listed with exact files
- [x] State owner and lifetime for every state
- [x] Test seams and CI changes identified, using existing patterns

**Next: CP8 — DTOs, decoders, query/mutation mapping.**
