# Frontend Release Record and Demo Runbook (2026-11)

> Status: **RELEASE CANDIDATE — code freeze** (W5 of the [Frontend Completion Plan](../FRONTEND-COMPLETION-PLAN.md))
> Course deadlines: 2026-11-23 final report + source, 2026-11-24 UML/implementation demo.

## 1. Release metadata (Master Plan §46)

| Item | Value |
| --- | --- |
| Frontend code-freeze SHA | `dbcf79316196035ccaf25b150da144ac79950202` (`WonhoOne/frontend` `main` after #64; later commits are documentation only) |
| Shared docs SHA | `f49d0457498e8b775f659a27e0c3a96d288d0ba0` (`WonhoOne/docs` `main`, Baseline v0.2, B9 closeout) |
| Backend SHA used by CI | `597cf92f1baf93211862d4ea5dbfa8a199b808a2` (`WonhoOne/backend` `main`) |
| Node | 24.21.0 (`.nvmrc`) |
| Released scope | Customer GUI S01–S11, AI Voice (B9-C), Employee Console E01–E05 |
| Previous known-good Frontend | `1e930fa88767dce065d838a75cc9ee38ad7bceeb` (B9 final snapshot, Customer + Voice only) |

### Rollback

Redeploy the previous known-good Frontend SHA above. It is compatible with the same Backend SHA (`597cf92`), because the Employee Console added no Backend or shared-contract change. Rolling back removes the Employee Console only.

## 2. Release gates (Completion Plan D-C)

| Gate | Result | Evidence |
| --- | --- | --- |
| D-C1 `npm ci`, `verify`, `test:e2e`, `build`, `npm audit --omit=dev --audit-level=high` on the freeze SHA | PASS | §2.1 |
| D-C2 CI real Backend smoke + Customer + Voice + Employee journeys | PASS | CI on every merged PR; last runs listed in §2.1 |
| D-C3 Production mock safety | PASS | `npm run build` runs `scripts/assert-production-mock-safety.mjs`; mocks only with `DEV && VITE_ENABLE_MOCKS=true` |
| D-C4 Release metadata | PASS | §1 |
| D-C5 Documentation consistency | PASS | Completion Plan §7, Employee ledger, Master Plan status note agree with GitHub state |
| D-C6 Demo scenario fixed | PASS | §3–§4 |
| D-C7 Severity S0 = 0, S1 = 0 | PASS | Employee defect log ([E-PR5 report](../employee-console/planning/audits/E-PR5-CP9-CP10-VERIFICATION.md) §4) and W4 fixes; no open S0/S1 |

### 2.1 Gate evidence

Run on 2026-11-09 in a clean worktree of the freeze SHA (`dbcf793`), Node 24.21.0:

| Step | Result |
| --- | --- |
| `npm ci` | PASS |
| `npm run verify` (typecheck, lint, format, unit/component, build + mock-safety) | PASS — 120 files / 1,991 tests |
| `npm run test:e2e` (Chromium) | PASS — 212/212 |
| `npm run build` | PASS — no chunk over 500 kB; mock-safety assertion passed |
| `npm audit --omit=dev --audit-level=high` | 0 vulnerabilities |
| Production build smoke (`vite preview`) | `/employee/login` renders from its lazy chunk; `/tours` loads only Customer chunks (no Employee code) with header and H1; API calls 502 as expected because no Backend ran in this smoke |

CI on the merge of #64 (same code): `verify`, `Real Backend public read smoke`, `Real Backend + MySQL …` (Customer, Voice, Employee EJ01–EJ06, NFR-05) — all success (run `42587874049`).

## 3. Demo environment (run on the presenter's machine)

Backend startup, MySQL and SMS are **Backend-owned**; follow the Backend repository:
`README.md`, `compose.b9-demo.yml`, `docs/b9-demo-sms-readiness.md` (at `597cf92`).

Frontend-relevant Backend settings (names only — **never commit real values**):

| Setting | Why the Frontend needs it |
| --- | --- |
| `JWT_SECRET` | Login fails with 502 through the dev proxy if the Backend did not start (B9 §10 incident) |
| `EMPLOYEE_BOOTSTRAP_ENABLED=true` with `EMPLOYEE_LOGIN_ID`, `EMPLOYEE_PASSWORD`, `EMPLOYEE_NAME`, `EMPLOYEE_ADDRESS`, `EMPLOYEE_CONTACT` | Creates the EMPLOYEE account for `/employee/login` (there is no public Employee signup). Can be turned off again after the first start; the account stays |

Frontend:

```bash
nvm use
npm ci
cp .env.example .env.local   # keep VITE_ENABLE_MOCKS=false; BACKEND_DEV_PROXY_TARGET=http://127.0.0.1:8080
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173` in **desktop Chrome** (Voice uses the Chrome Web Speech API and needs microphone permission).

### Pre-demo checklist

- [ ] Backend health: `GET /api/v1/tours` returns 200 through `http://127.0.0.1:5173/api/v1/tours`
- [ ] At least one TourProduct **with a TourSchedule** exists (for the 409 Theme-lock demonstration) and one reservable schedule exists (for the Customer reservation)
- [ ] EMPLOYEE account signs in at `/employee/login` (DEC-C03 — Backend/demo operator)
- [ ] A fresh CUSTOMER account can be created at `/signup`
- [ ] Chrome microphone permission granted for `127.0.0.1:5173`
- [ ] SMS: follow the Backend SMS readiness document (billable SMS only when intended)
- [ ] Browser zoom 100%, window ≥ 1280 px for the Employee part (PC-only scope)

## 4. Demo script (≈ 10 minutes)

### A. Customer (FR-02 – FR-09, FR-15)

1. Home → **Tours**: Themes grouped; a Theme can have several TourProducts.
2. Open a product → choose **Style** (Honeymoon/Parents show Grand/Premium only) and a **schedule** (recruitment status comes from the Backend).
3. **Configure** participants and hotel/transport/meal/extras → **Review**.
4. Not signed in → **Apply** asks for login → sign up / log in → returns to Review (**no automatic submit**) → Apply.
5. **Success** and **Reservation Detail** show the Backend's price (Loyalty 5% when applicable).
6. **My Trips** / previous-trips popup after login.

### B. Voice (FR-12, FR-13)

1. On Tours/Detail/Configure, start Voice; say the product, style, schedule and options.
2. Say "예약해 줘" → **no reservation is submitted** (B9 final smoke check 5); open Review, confirm the Voice-selected choices, and submit with the GUI button.

### C. Employee Console (FR-01, FR-10, FR-11)

1. `/employee` → redirected to **직원 로그인** → sign in with the EMPLOYEE account → **여행상품** list.
2. **+ 새 여행상품** → Theme first; only allowed Style prices appear → save → highlighted in the list.
3. Open a product → change price → **저장** → stays on the page with the server values.
4. Open the product that has a schedule → change **Theme** → save → **409 explanation** → **테마 되돌리기** → save succeeds.
5. **재고 관리** → **골프공 재고 추가** → enter 5 → current → amount → total preview → **추가** → server total shown.
6. Show that a CUSTOMER account cannot use `/employee/login` (refused, no session).

## 5. Open items (owners)

| Item | Owner | Status |
| --- | --- | --- |
| NFR-04 official list of 10 integration scenarios | Team (docs-first in `WonhoOne/docs`) | Frontend list proposed in Completion Plan §9 |
| DEC-C03 EMPLOYEE account on the demo database | Backend / demo operator | Settings documented above; not verifiable from the Frontend repository |
| Billable SMS during the demo | Backend owner | Backend SMS readiness document |
