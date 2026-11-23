# Frontend Release Record and Demo Runbook (2026-11)

> Status: **FINAL RELEASE** (2026-11-23). Supersedes the W5/W6 code freeze: the final demo scenario fixed by the instructor added reservation modification, employee departure/completion and the guided voice dialog (frontend #77–#81, backend #22).
> Course deadlines: 2026-11-23 final report + source, 2026-11-24 UML/implementation demo.

## 1. Release metadata (Master Plan §46)

| Item | Value |
| --- | --- |
| Frontend final release | `main` after the real-Backend demo-operations test PR (code = `ab22721`: #77 voice command hints, #78/#79 Theme and detail photos, #80 reservation edit + employee departures, #81 guided voice dialog). Earlier freezes: `6448d1b` (W6 + Voice D-01), `9e83125` (W6 GUI), `dbcf793` (W5) |
| Shared docs SHA | `f49d0457498e8b775f659a27e0c3a96d288d0ba0` (`WonhoOne/docs` `main`, Baseline v0.2, B9 closeout) |
| Backend SHA used by CI | `d48509ac5a41758e31724a60f86cb08aaf3272f9` (pinned in `.github/workflows/d11-verify.yml`; backend #22: reservation modification, departure with souvenir deduction, completion, Flyway V5). Previously `597cf92` |
| Node | 24.21.0 (`.nvmrc`) |
| Released scope | Customer GUI S01–S11 + reservation edit, AI Voice (B9-C) + guided spoken dialog, Employee Console E01–E05 + departures (출발 관리) |
| Previous known-good Frontend | `1e930fa88767dce065d838a75cc9ee38ad7bceeb` (B9 final snapshot, Customer + Voice only) |

### Rollback

To undo only the W6 capacity checks (GUI and Voice), redeploy `dbcf793` (same Backend SHA; the Backend still rejects over-capacity reservations with 422). To remove the Employee Console as well, redeploy the previous known-good Frontend SHA above. It is compatible with the same Backend SHA (`597cf92`), because the Employee Console added no Backend or shared-contract change. That rollback removes the Employee Console and the W6 capacity check.

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

**Final run (2026-11-23)** on `main` `ab22721` after `npm ci`, Node 24.21.0: `npm run verify` PASS — 136 files / 2,396 tests · `npm run test:e2e` 216/217 in local Chrome (the one failure, `tours-states` "an image failure stays local…", also fails locally on the previous `main` and passes in CI) · CI real-Backend journeys now run against backend `d48509a`, including `tests/f2-mysql/demo-operations.spec.ts` (edit → depart with stock deduction → complete).

**Freeze re-run (2026-11-11)** on `main` `6448d1b` after `npm ci`, Node 24.21.0: `npm run verify` PASS — 122 files / 2,013 tests · `npm run test:e2e` PASS — 213/213 · `npm audit --omit=dev --audit-level=high` 0 vulnerabilities · CI on #73 head `899b84d` (same tree as `6448d1b`): `verify`, `Real Backend public read smoke`, `Real Backend + MySQL …` (including the Voice D-01 capacity scenarios) all success (run `42787895748`).

W6 GUI run (2026-11-10) on `main` `94e182f` (code = `9e83125`), Node 24.21.0: `npm run verify` PASS — 122 files / 2,007 tests · `npm run test:e2e` PASS — 213/213 · `npm audit --omit=dev --audit-level=high` 0 vulnerabilities · CI on #69: `verify`, `Real Backend public read smoke`, `Real Backend + MySQL …` all success (run `42764741157`).

Original W5 run:

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
- [ ] SMS: follow the Backend SMS readiness document (billable SMS only when intended). With SMS on, the first confirmation (e.g. trekking 3 participants) sends real messages — use consenting team phone numbers
- [ ] Souvenir stock is sufficient before 출발 처리 (scenario step 1 restocks)
- [ ] Browser zoom 100%, window ≥ 1280 px for the Employee part (PC-only scope)

## 4. Demo script (≈ 10 minutes)

### 0. Final presentation scenario (fixed by the instructor)

1. **Employee restock**: 재고 관리 → add 커플티, 인삼, 골프공, 스카프.
2. **Customer voice booking** (logged-in customer, desktop Chrome): Start voice → "멋진 여행 상품 추천해주세요" → "다음달 오늘에 결혼해요" → "허니문 낭만 투어 좋겠어요" → "네, 프리미엄 스타일 좋아요" → pick the date (GUI or "12월 24일 일정 선택") → Configure this trip → "그리고 식사시 커피 1포트, 샴페인 1병 추가해요" → "맞아요" → "없어요" → Review trip → Apply (voice never submits) → the success page speaks the booked date. If Chrome stops listening after ~8 s of silence, press Start voice again; the conversation continues.
3. **Customer GUI booking**: Outdoor Trekking, 3 participants, **Premium van** (the 2-seat car is blocked).
4. **Reservation edit**: Reservation detail → Edit trip → Grand, Coffee, Champagne → Save changes.
5. **Employee departure**: 출발 관리 → 출발 처리 on the confirmed trekking schedule → scarves deducted (stock must be sufficient) → 완료 처리 → the trip appears in the customer's My Trips.

The sections below are the earlier per-feature script.

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
