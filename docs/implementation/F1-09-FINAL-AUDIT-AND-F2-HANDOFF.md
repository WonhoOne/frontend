# F1-09 — Final Audit and F2 Handoff

> Session: F1 — Live Integration Foundation & Public Read Owner  
> PR: #18 `feat/live-integration-public → main`  
> Audit date: 2026-10-07  
> Frontend merge base: `1bc385a4df7aa68f67957e074ed35f4dad1831be`  
> Shared SSOT: `WonhoOne/docs/main@c5b763253bb4acd8e4e4c6db0a736be8f1c247fc`  
> Backend public-smoke snapshot: `WonhoOne/backend/main@597cf92f1baf93211862d4ea5dbfa8a199b808a2`

## Disposition

Independent F1-09 source/contract/scope audit found no F1 blocker and no feature defect requiring a production-code fix.

This document intentionally creates a new final-candidate commit so the repository's pull-request workflow runs again on the audited tree. The resulting CI run is recorded in the PR final report rather than by mutating this file after CI.

## F1-08 evidence independently verified

The previous evidence was re-read from GitHub Actions run #304 / run id `37510929632`, not accepted from handoff text alone.

Verified job evidence:

- `npm ci`: PASS
- `npm run verify`: PASS
  - 84 test files
  - 1,533 tests
- Mock/Real public-read parity: 5/5 PASS
- production mock-safety build gate: PASS
- Playwright Chromium: 153/153 PASS
- dedicated S01 → S04 public live journey: PASS
- `npm run build`: PASS
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities
- Real Backend public read smoke: PASS
  - MySQL 8.4
  - Java 21
  - exact Backend snapshot above
  - Spring Boot build/start
  - fresh DB result `products=0`
  - `GET /tours` 200 array
  - `GET /tours/1` 404 `TOUR_PRODUCT_NOT_FOUND`
  - `GET /tour-schedules?tourId=1` 200 `[]`
  - `GET /tour-schedules?tourId=0` 400 `INVALID_QUERY_PARAMETER`

## 283-commit / 110-file scope audit

At audit start PR #18 was:

- ahead of main: 283
- behind main: 0
- changed files: 110
- additions/deletions: 4,340 / 651
- draft: true
- mergeable: true

GitHub's PR commits REST listing exposes at most 250 commits for this PR. The visible commit history is overwhelmingly F1 implementation/checkpoint/CI-format history; the final source diff is therefore treated as the authoritative scope proof.

All 110 changed files classify into F1-relevant buckets:

| Bucket | Files |
| --- | ---: |
| Backend integration / runtime contracts | 13 |
| Tour public reads / UI integration | 35 |
| Configure public handoff / public price | 10 |
| ReservationDraft compatibility / identity convergence | 15 |
| App composition / runtime config | 10 |
| Mock parity | 4 |
| Shared identity / types | 3 |
| E2E regression | 16 |
| CI / final gates | 4 |
| Unclassified / unrelated | 0 |

No Voice implementation file is changed by the PR.

## Quantitative scope/architecture audit

Final source audit result:

- raw DTO leak from public Backend responses: **0**
- Product/Page direct `fetch()`: **0**
- Product-code Backend localhost hardcode: **0**
- silent Real → Mock fallback: **0**
- live-path opaque mock resource identity: **0**
- Frontend recruitment truth recomputation: **0**
- Frontend `reservable` recomputation: **0**
- unapproved production endpoint: **0**
- F1 private Auth/Reservation/History Backend implementation: **0**
- F1-added Bearer/token injection: **0**
- Voice regression / Voice file mutation: **0**

Direct `fetch()` usage added by F1 exists only in the real-Backend smoke harness and mock/test code. Loopback URLs exist only in development proxy, Playwright, test-server, and CI smoke configuration.

## Contract audit

Current docs/main and backend/main are unchanged from the approved F1 snapshots.

TourProduct remains:

- positive integer wire `id`
- `theme`
- `name`
- `description`
- `availableStyles`
- `stylePrices`

No Backend image/destination/duration field is invented.

TourSchedule remains:

- positive integer wire `id`
- positive integer `tourId`
- `startDate`
- `endDate`
- Backend-owned `reservable`
- Backend-owned recruitment `unit/currentCount/requiredCount/confirmed`

The Frontend does not derive `confirmed`, `requiredCount`, or `reservable`.

ApiError remains stable-code driven; Frontend flow does not parse human-readable `message` to make decisions.

## Architecture audit

Public runtime path is centralized:

`runtime config → BackendHttpClient → unknown JSON → runtime decoder → DTO → adapter → Frontend model → query/page`

The HTTP client:

- forwards AbortSignal,
- separates network / HTTP / malformed-response / abort failures,
- does not inject Authorization,
- leaves authentication transport to F2.

Development topology remains:

`Browser → same-origin /api → Vite proxy → Backend`

Application Product code is not bound to localhost.

## Resource identity audit

Wire IDs remain positive safe integers.

The single canonical promotion boundary is:

`Backend positive integer → adapter canonical decimal string → route / Draft string → strict parse when Backend numeric identity is required`

`parseBackendResourceIdentity` rejects non-canonical values including zero, negatives, fractions, leading-zero strings, whitespace/trailing junk, opaque fixtures, and JS-unsafe integers.

Opaque identities remain explicit DEV/mock/test concerns and do not enter the live public read path.

## Configure / price boundary audit

Tour Detail hands off only:

- `tourProductId`
- `tourScheduleId`
- `tourStyle`

Configure re-reads public Product/Schedule state through the public DataSources.

Current public price presentation uses TourProduct `stylePrices` and may show the approved participant-count estimate. It does not claim or compute Reservation final discount/total; final Reservation price remains Backend-owned at create time.

## Mock / production audit

Default/production public sources are Real.

Mock sources require both:

- `import.meta.env.DEV`
- `VITE_ENABLE_MOCKS === 'true'`

There is no network-failure fallback to Mock.

Production build runs `scripts/assert-production-mock-safety.mjs`, which rejects known public mock/preview sentinels in emitted `dist`.

Preview modules remain QA/test support and are not re-exported through the production feature barrels.

## Main / Voice audit

Audit-start main is `1bc385a4df7aa68f67957e074ed35f4dad1831be`.

The branch merge-base equals current main and is behind by 0. The Voice capability boundary already present on main is therefore included in the branch ancestry. PR #18 changes no Voice file, so merging F1 cannot revert the Voice source tree through a conflicting PR diff.

## F2 handoff

F2 owns real private integration and must not treat F1 public-read code as authorization-complete.

Use these F1 extension points:

- HTTP client: `src/integrations/backend/client/backendClient.ts`
- app client composition: `src/app/providers/backendHttpClient.ts`
- runtime API config: `src/app/config/runtimeConfig.ts`
- runtime decoder convention: `src/integrations/backend/contracts/`
- `ContractMappingError`: contract/path/reason only; do not retain raw malformed payload
- ApiError convention: HTTP status + stable `code`; never branch on human `message`
- canonical Backend identity: `src/shared/lib/resourceIdentity.ts`
- public TourProduct source: `BackendTourDiscoveryDataSource`, `BackendTourDetailDataSource`
- public TourSchedule source: `BackendTourScheduleDataSource`
- public Mock composition: DEV + explicit `VITE_ENABLE_MOCKS=true` only

F2 should extend authentication transport at the centralized HTTP/client composition boundary. It should not add page-local Bearer headers or page-local `fetch()`.

F2-owned live work remains:

- real signup/login
- Access Token transport / Bearer injection for private APIs
- Reservation create/detail
- Travel History
- live 401 recovery
- cross-repo authenticated Customer E2E

F1 deliberately does not pre-implement those capabilities.

## Final candidate gate

After this document commit, the new candidate HEAD must pass the PR workflow again:

- `npm ci`
- `npm run verify`
- `npm run test:e2e`
- `npm run build`
- `npm audit --omit=dev --audit-level=high`
- Mock/Real parity
- production mock safety
- Real Backend public read smoke

Only after that run is green may PR #18 be moved from draft to ready and merged.
