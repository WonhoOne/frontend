# F2-01 — Private Contract Audit & Lifecycle Baseline

> Session: F2 — Authenticated Live Journey & IMP-6 Completion Owner  
> Branch: `feat/live-integration-private`  
> Audit date: 2026-10-07  
> Frontend baseline: `WonhoOne/frontend/main@1c1a5c922dd07aeed7e54c5c9d569a89caa08f23`  
> Backend baseline: `WonhoOne/backend/main@597cf92f1baf93211862d4ea5dbfa8a199b808a2`  
> Shared SSOT: `WonhoOne/docs/main@c5b763253bb4acd8e4e4c6db0a736be8f1c247fc`  
> Shared Baseline: v0.2  
> F1 handoff: `docs/implementation/F1-09-FINAL-AUDIT-AND-F2-HANDOFF.md`

## Disposition

F2-01 finds no Shared ↔ Backend contract drift in the authenticated Customer scope and no blocker to beginning implementation.

This checkpoint changes no runtime code. It freezes the integration baseline, the current Frontend extension seams, the contract precedence, STOP conditions, and the F2 checkpoint lifecycle.

F1 public integration is complete and is not reimplemented in F2.

## 1. Verified repository baseline

At checkpoint start:

- Frontend `main`: `1c1a5c922dd07aeed7e54c5c9d569a89caa08f23`
- Backend `main`: `597cf92f1baf93211862d4ea5dbfa8a199b808a2`
- Shared docs `main`: `c5b763253bb4acd8e4e4c6db0a736be8f1c247fc`
- Frontend open PRs at handoff: 0
- `feat/live-integration-private` did not exist before this checkpoint and is created from the exact Frontend baseline above.

Source precedence remains:

1. latest `WonhoOne/docs/main`
2. actual Backend implementation compatible with docs
3. F1 handoff / Frontend integration architecture
4. current Frontend implementation documents
5. historical planning

If Shared docs and Backend implementation disagree on an F2 contract, implementation stops. Frontend decoders must not hide drift.

## 2. Approved F2 endpoint set

F2 may integrate only these authenticated-scope endpoints:

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/reservations`
- `GET /api/v1/reservations/{reservationId}`
- `GET /api/v1/customers/me/travel-history`

F2 does not add:

- refresh endpoint
- logout endpoint
- `/me`
- Reservation cancel/update
- payment/refund
- Travel History detail
- pagination
- Employee/Inventory/SMS GUI endpoints

## 3. Shared ↔ Backend private contract audit

### Authentication

Shared and Backend agree on:

Signup request:
- `loginId`
- `password`
- `name`
- `address`
- `contact`

Signup success:
- HTTP 201
- `id`
- `role = CUSTOMER`
- `name`
- no access token
- no automatic login

Login request:
- `loginId`
- `password`

Login success:
- `accessToken`
- `tokenType = Bearer`
- `expiresIn`
- `user.id`
- `user.role`
- `user.name`

Backend `AuthService` issues Bearer responses and currently tests `expiresIn = 3600`; the numeric lifetime remains Backend-local and Frontend must consume the returned value instead of hard-coding it.

Backend credential DTO `toString()` implementations redact credential/token material.

### Authorization semantics

Shared and Backend agree on:

- missing token → 401 `AUTHENTICATION_REQUIRED`
- malformed/invalid token → 401 `INVALID_ACCESS_TOKEN`
- expired valid token → 401 `ACCESS_TOKEN_EXPIRED`
- authenticated insufficient permission → 403 `FORBIDDEN`

403 is not an authentication-loss redirect signal.

### Reservation create

Exact request:

- `scheduleId`
- `participantCount`
- `configuration.style`
- `configuration.hotelOption`
- `configuration.transportOption`
- `configuration.mealOption`
- `configuration.extraOptions`

Do not send:

- `customerId`
- `tourId`
- `theme`
- price/discount
- contact/profile fields
- `coupleCount`

Backend resolves authenticated ownership and final server truth.

### Reservation representation

POST success and GET detail share the same representation:

- `id`
- `participantCount`
- `tourProduct { id, theme, name }`
- `schedule { id, startDate, endDate, recruitment }`
- `configuration`
- `price { unitPrice, subtotal, discount, total, currency }`

There is no Reservation lifecycle status in v0.2.

Final Reservation price is Backend truth. Frontend public style-price presentation is not the final Reservation price.

### Reservation errors

Shared and Backend agree on:

- 404 `RESERVATION_NOT_FOUND` for missing or foreign Reservation
- 409 `SCHEDULE_NOT_RESERVABLE`
- 422 `VALIDATION_FAILED`
- common error body `code`, `message`, `fieldErrors[]`
- client decisions use HTTP status + stable code + field error field/code
- client logic must not parse human-readable `message`

v0.2 has no Idempotency-Key contract. Reservation POST automatic retry remains zero.

### Travel History

Shared and Backend agree on:

`GET /api/v1/customers/me/travel-history`

Item:
- `reservationId`
- `tourProduct { id, theme, name }`
- `startDate`
- `endDate`
- `style`
- `price { amount, currency }`

Backend owns:
- eligibility
- `endDate DESC, reservationId DESC` ordering

Frontend must not recalculate eligibility or reorder the list.

## 4. F1 architecture invariants preserved

F2 extends the existing path:

`runtime config → BackendHttpClient → unknown JSON → runtime decoder → DTO → adapter → Frontend model → Feature/UI`

Confirmed extension points:

- `src/integrations/backend/client/backendClient.ts`
- `src/integrations/backend/client/backendHttpError.ts`
- `src/integrations/backend/contracts/**`
- `src/app/providers/backendHttpClient.ts`
- `src/app/config/runtimeConfig.ts`
- `src/shared/lib/resourceIdentity.ts`

F2 must not introduce:

- Page-level `fetch()`
- Component-level `fetch()`
- feature-local HTTP wrappers
- parallel private HTTP stack
- private API base URL
- localhost production binding
- permissive decoder drift masking

Public F1 requests must remain valid without Authorization.

## 5. Current Auth seam

Current Session E Auth implementation already provides:

- `AuthDataSource`
- `MockAuthDataSource`
- `AuthProvider`
- `AuthState`
- memory-only `sessionRef`
- access token + expiry timestamp in memory
- expiry timer
- `invalidateSession()`
- `ReturnContext`
- auth-loss callback
- private query cache clear

Security invariant already present:

- access token is not persisted to Web Storage
- browser reload starts unauthenticated

Current production/default Auth composition is intentionally unavailable, not Real Backend.

### Required F2 transport seam

The token currently lives inside `AuthProvider`, while `backendHttpClient` is composed at app level. There is no approved transport accessor yet.

F2 must add one centralized memory session boundary so:

`AuthProvider → single memory token source → BackendHttpClient private request mode`

without:
- exposing bearer token to Page/Feature UI
- creating cyclic React/network dependencies
- persisting token
- forcing Authorization onto public requests

This is a dedicated checkpoint before Reservation/History live integration.

## 6. Current Reservation seam

Existing port:
- `ReservationDataSource.createReservation()`
- `ReservationDataSource.getReservation()`

Existing safety semantics already implemented:
- action-level in-flight concurrency guard
- automatic POST retry = 0
- auth interruption outcome
- ambiguous transmitted/lost-response outcome = `uncertain`
- blind retry blocked
- Draft retained on failures
- 409/422 recovery driven by stable codes/field errors
- manual resubmit invariant

Current direct production-source Mock dependencies remain in:
- `ReservationReviewPage`
- `ReservationSuccessPage`
- `ReservationDetailPage`

These must be replaced by application composition, not by Page-local Real imports.

Current Reservation Draft resource identity is a Frontend string. Real Backend IDs use canonical decimal strings. Numeric wire promotion must reuse `parseBackendResourceIdentity`.

The current `mockReservationCreateIdentityResolver` already parses real Schedule IDs but also owns fixture option-key mappings. F2 must separate/rename the production canonical create-input boundary so production code does not depend semantically on a "mock" resolver.

## 7. Current Travel History seam

Existing:
- `TravelHistoryDataSource`
- `MockTravelHistoryDataSource`
- one shared `travelHistoryQueryOptions`
- one shared `useTravelHistory`
- query key `['customer', 'travel-history']`
- `meta.privacy = 'private'`

Previous Trips popup and My Trips already share the same query/cache/DataSource path.

Current production/default composition is unavailable rather than Real Backend. F2 replaces that default with `BackendTravelHistoryDataSource`.

## 8. Current private-cache seam

`clearPrivateQueryCache()` removes only queries whose `meta.privacy === 'private'`.

Therefore:
- public TourProduct cache survives auth loss
- public TourSchedule cache survives auth loss
- Travel History is cleared
- ReservationDraft is retained because it is not Query server state

Reservation Detail currently uses Page-local state, not the private Query lifecycle. F2 must either move it into the private query boundary or prove equivalent immediate disposal on auth loss. Preferred direction: private TanStack Query for consistent lifecycle semantics.

## 9. Production Mock policy

The only approved Mock selection remains:

`import.meta.env.DEV && VITE_ENABLE_MOCKS === 'true'`

Backend failure must never fall back to Mock.

F2 final default matrix must be:

- TourProduct: REAL
- TourSchedule: REAL
- Auth: REAL
- Reservation: REAL
- Travel History: REAL

Mock implementation files may remain for DEV/test support but must not be the production default path.

## 10. STOP conditions

Stop implementation and report contract drift if any of the following occurs:

1. docs/main changes an F2 endpoint, request, response, or stable error meaning.
2. Backend main no longer matches the approved Shared contract.
3. a required field exists only in Frontend planning but not Shared v0.2.
4. an implementation would require inventing a refresh/logout/me/options/price endpoint.
5. private runtime payload cannot be decoded without permissively accepting undocumented shapes.
6. Reservation correctness would require automatic POST retry or assumed success after ambiguous transport failure.
7. public F1 behavior would require Authorization or a separate Backend origin.
8. a solution would require persistent access-token storage.
9. a private DataSource requires Page/Component ownership of bearer material.
10. actual cross-repository E2E reveals contract drift rather than a Frontend implementation defect.

## 11. F2 lifecycle checkpoints

### F2-01 — Private Contract Audit & Lifecycle Baseline
Purpose: freeze repository baselines, private contract matrix, current seams, STOP conditions, and lifecycle.  
Start: F1 merged; repository heads equal the verified SHAs.  
Files: this document only.  
Shared dependency: Baseline v0.2 and REST contract.  
Backend dependency: private controllers/DTO/security/error/tests.  
F1 dependency: final handoff and HTTP architecture.  
Excluded: runtime implementation.  
Test: repository head/drift audit and exact contract comparison.  
Done: no blocker and branch created from exact main.  
Commit boundary: documentation-only baseline commit.

### F2-02 — Private Runtime Contracts & Common Error Decoding
Purpose: Auth/Reservation/History unknown JSON → runtime-validated DTOs.  
Start: F2-01 complete.  
Files: `src/integrations/backend/contracts/**` and focused tests.  
Shared dependency: exact DTO/error shapes.  
Backend dependency: DTO and ApiException/Security error outputs.  
F1 dependency: decoder and ContractMappingError conventions.  
Excluded: Bearer/session composition and UI.  
Tests: malformed fields/types/enums/IDs/dates/money/errors; raw private payload retention = 0.  
Done: all private successful/error payloads have strict runtime boundaries.  
Commit boundary: private contracts only.

### F2-03 — BackendAuthDataSource
Purpose: connect signup/login through existing BackendHttpClient.  
Start: F2-02 complete.  
Files: Backend Auth adapter/DataSource and tests.  
Shared dependency: signup/login semantics.  
Backend dependency: AuthController/AuthService.  
F1 dependency: BackendHttpClient.  
Excluded: private bearer injection.  
Tests: login/signup success, LOGIN_FAILED, duplicate login, validation, no credential retention.  
Done: AuthDataSource can represent the real backend correctly.  
Commit boundary: Auth network adapter only.

### F2-04 — Memory Session Bridge & Bearer Transport
Purpose: centralized memory-only bearer access for private requests.  
Start: F2-03 complete.  
Files: Auth session seam, BackendHttpClient/app composition, tests.  
Shared dependency: Bearer auth.  
Backend dependency: SecurityConfig/SecurityErrorHandlers.  
F1 dependency: existing shared HTTP client.  
Excluded: Reservation/History feature integration.  
Tests: public no bearer; private exact bearer; expiry; 401 invalidation; 403 preservation; persistent token = 0.  
Done: no Page/Feature directly reads or builds Authorization.  
Commit boundary: auth transport lifecycle only.

### F2-05 — Auth Live Composition & ReturnContext
Purpose: production/default Auth becomes Backend-backed.  
Start: F2-04 complete.  
Files: AppProviders/composition, Auth pages/tests as required.  
Shared dependency: signup is not auto-login.  
Backend dependency: auth endpoints.  
F1 dependency: Real/Mock production policy.  
Excluded: Reservation POST.  
Tests: Signup → Login; Login → authenticated; ReturnContext internal restore; open redirect blocked.  
Done: production Auth REAL, explicit DEV Mock only.  
Commit boundary: live Auth switch.

### F2-06 — Reservation Runtime Adapter & Canonical Create Input
Purpose: exact Reservation wire mapping and DTO adaptation.  
Start: F2-05 complete.  
Files: Reservation contracts/adapters/resolver boundary/tests.  
Shared dependency: create/detail representation.  
Backend dependency: ReservationCreateRequest/ReservationResponse.  
F1 dependency: canonical resource identity helper.  
Excluded: Page submit composition.  
Tests: exact allowed request fields, prohibited fields absent, POST/GET representation parity, nullable discount.  
Done: CreateReservationInput maps exactly to Backend request and response maps to ReservationModel.  
Commit boundary: Reservation contract adapter.

### F2-07 — BackendReservationDataSource & Review Live Submit
Purpose: production Review POST uses Real Backend.  
Start: F2-06 complete.  
Files: BackendReservationDataSource, app composition, Review injection cleanup/tests.  
Shared dependency: POST semantics.  
Backend dependency: ReservationCommandService.  
F1 dependency: centralized client.  
Excluded: Success/Detail reload.  
Tests: single POST, duplicate-submit guard, no retry, final server price.  
Done: direct production Review Mock dependency = 0.  
Commit boundary: create live switch.

### F2-08 — Reservation Error/Auth Recovery
Purpose: connect actual 401/403/409/422/network/5xx to existing safe recovery semantics.  
Start: F2-07 complete.  
Files: error mapper/recovery integration/tests.  
Shared dependency: common errors.  
Backend dependency: security/error handlers and reservation validation.  
F1 dependency: public truth refetch capability.  
Excluded: Success/detail live lookup.  
Tests: 401 Draft retain/ReturnContext/manual resubmit; 403 no login redirect; 409 fresh truth; 422 field mapping; ambiguous response; 500/network.  
Done: no automatic mutation or blind retry.  
Commit boundary: failure lifecycle only.

### F2-09 — Reservation Success & Detail Live Recovery
Purpose: reloadable backend-backed Success/Detail and private lifecycle.  
Start: F2-08 complete.  
Files: Success/Detail composition/query tests.  
Shared dependency: detail contract and hidden 404 semantics.  
Backend dependency: ReservationQueryService.  
F1 dependency: canonical route identity.  
Excluded: History.  
Tests: GET after reload, own 200, foreign/missing same 404, auth-loss private state disposal.  
Done: local mutation object is not required for recovery.  
Commit boundary: detail/read live switch.

### F2-10 — Travel History Live Switch
Purpose: Backend-backed Previous Trips + My Trips using one query/cache/source.  
Start: F2-09 complete.  
Files: BackendTravelHistoryDataSource, composition/tests.  
Shared dependency: History DTO/order/eligibility meaning.  
Backend dependency: TravelHistoryQueryService.  
F1 dependency: centralized client.  
Excluded: Frontend eligibility/reordering.  
Tests: empty/non-empty, ordering preservation, shared key/cache, auth loss.  
Done: production History REAL and both surfaces share it.  
Commit boundary: History live switch.

### F2-11 — Production Composition & Mock Leak Audit
Purpose: prove all Customer production sources are Real and no silent fallback remains.  
Start: F2-10 complete.  
Files: composition/build safety scripts/tests as needed.  
Shared dependency: none beyond already-approved contracts.  
Backend dependency: none new.  
F1 dependency: existing production mock-safety gate.  
Excluded: new product functionality.  
Tests/audit: direct Mock imports, direct fetch, local Authorization, localhost, raw DTO cast, message parsing, silent fallback.  
Done: Real matrix 5/5 and production private mock leakage = 0.  
Commit boundary: production safety.

### F2-12 — Cross-Repository Authenticated E2E
Purpose: prove actual Frontend + Backend + MySQL authenticated Customer journey.  
Start: F2-11 complete.  
Files: E2E/CI harness and evidence.  
Shared dependency: all F2 contracts.  
Backend dependency: Java 21, MySQL 8.4, B9 demo/runbook.  
F1 dependency: public live journey foundation.  
Excluded: actual paid SMS; keep `SMS_DELIVERY_ENABLED=false`.  
Tests: public journey → Review → Login interruption → Review restore → manual POST → Success → reload → Detail; Signup→Login; invalid login; basic 422; History auth; controlled non-empty History fixture.  
Done: authenticated live journey passes without mocks.  
Commit boundary: cross-repo E2E gate.

### F2-13 — Security, Regression, PR-09B Final Audit & Merge
Purpose: independently prove IMP-6 completion and merge PR-09B.  
Start: F2-12 complete.  
Files: final audit evidence and fixes only if independently justified.  
Shared dependency: latest docs/main recheck.  
Backend dependency: latest approved backend recheck.  
F1 dependency: all public invariants remain green.  
Excluded: Voice and Final Release QA.  
Tests: `npm ci`, `npm run verify`, `npm run test:e2e`, `npm run build`, `npm audit --omit=dev --audit-level=high`, cross-repo E2E, production mock safety.  
Audit: token/password/log/query/url leaks, raw private payload, open redirect, direct fetch, private fallback, ID drift, message parsing, automatic retry, post-login auto submit, unapproved endpoints, contract drift.  
Done: mergeable, behind main = 0, CI/cross-repo/security PASS, PR-09B merged, final main SHA verified.  
Commit boundary: final audit candidate and merge.

## 12. F2-01 completion criteria

F2-01 is complete when:

- three repository heads were re-read from GitHub
- Frontend baseline still equals the F1 merge commit
- Backend and Shared baselines match the handoff
- F2 branch exists from that exact Frontend commit
- Shared ↔ Backend private contract comparison has no blocker
- current Auth/Reservation/History/cache/mock seams are recorded
- STOP conditions are explicit
- the remaining lifecycle is checkpointed with purpose, start condition, files, dependencies, exclusion, tests, done condition, and commit boundary
- no runtime production code was changed in F2-01

## Result

F2 implementation is authorized to continue with F2-02.

No contract blocker found.
