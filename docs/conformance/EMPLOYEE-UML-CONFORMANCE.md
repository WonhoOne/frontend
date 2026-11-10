# Employee Console — UML ↔ 구현 대응표 (frontend#67, D-02 · D-03)

> 상태: **COMPLETE** (2026-11-10) · 담당: 김태우 · 다이어그램 수정 담당: 주원호
> 기준: `frontend/main@2c480b0` (Employee 코드는 동결 `dbcf793` 이후 변경 없음), `docs/main@f49d045`, `backend/main@597cf92`

## 0. 이 문서의 범위와 한계

- 감사 결과: **SEQ-09 상품관리 MATCH · SEQ-10 재고관리 MATCH · CLS-03 EQUIVALENT**. 직원 콘솔 코드 결함은 보고되지 않았다.
- 이 문서는 감사 ID별로 **실제 경로·컴포넌트·메서드**를 적어, 주원호가 다이어그램을 고칠 때 바로 쓸 수 있게 한다.
- UML 원본(`태돌_Diagrams.mdj`)은 GitHub에 없고 이 작업에서도 열어 보지 않았다. 다이어그램 요소 이름은 감사 이슈(#67, docs#14)의 서술을 기준으로 했다. 원본 provenance는 docs#14(이한결) 범위다.
- 직원 콘솔의 실제 구현은 이 저장소(`frontend`)다. `ai-console` 저장소는 legacy다 (#67).
- 다이어그램의 예시 클래스(`EmployeeApiGateway` 등)와 이름을 맞추려고 새 클래스를 만들지 않는다 (#67 지시).

## 1. 대응표

### SEQ-12 직원 로그인 — 의도한 차이 (D-02)

| UML 표현 | 실제 구현 | 판정 |
| --- | --- | --- |
| 로그인 화면 | `src/pages/employee-login/EmployeeLoginPage.tsx` (`/employee/login`) | MATCH |
| 로그인 요청 | `AuthProvider.login(input, { expectedRole: 'EMPLOYEE' })` → `BackendAuthDataSource` → `POST /api/v1/auth/login` | MATCH |
| 역할 확인 | `src/features/auth/AuthProvider.tsx` — 응답 role이 `expectedRole`과 다르면 세션을 저장하지 않고 거절 | MATCH |
| **토큰을 `sessionStorage`에 유지** | **`MemoryAuthSessionStore`** (`src/features/auth/authSession.ts`) — JavaScript 메모리에만 보관, 새로고침하면 다시 로그인 | **STALE_DIAGRAM** — 다이어그램을 구현에 맞춘다 |
| 로그인 후 이동 | `toSafeEmployeeReturnTo` (`src/features/auth/employeeReturnTo.ts`) — `/employee/**` 안의 경로만 허용, 기본값 상품 목록 | MATCH |

**보안 결정 유지:** [E01-D01 Access Token is memory-only](../implementation/checkpoints/E01-AUTH-ARCHITECTURE-SECURITY-DECISION.md). 브라우저 저장소에 bearer token을 남기지 않고, 세션 복구 API를 새로 만들지 않기 위한 결정이다. 다이어그램의 `sessionStorage` 표현을 고친다. 구현을 다이어그램에 맞추지 않는다.

> 참고: Customer의 **예약 Draft**는 `sessionStorage`를 쓴다 (`mister-world:reservation-draft:v1`). 이것은 토큰이 아니라 작성 중인 예약 선택값이다. 다이어그램에서 두 가지를 섞지 않도록 주의한다.

### SEQ-09 상품 관리 — MATCH

| 단계 | 화면 / 컴포넌트 | Query·Mutation | DataSource 메서드 | Backend |
| --- | --- | --- | --- | --- |
| 목록 | `EmployeeToursPage` → `ProductTable` | `useEmployeeTourProducts` | `listTourProducts()` | `GET /api/v1/employee/tours` |
| 생성 | `EmployeeTourCreatePage` → `ProductForm`, `StylePriceList` | `useCreateEmployeeTourProduct` | `createTourProduct(input)` | `POST /api/v1/employee/tours` |
| 수정 | `EmployeeTourEditPage` → `ProductForm`, `EditorActionBar` | `useEmployeeTourProducts` (`refetchOnMount: 'always'`), `useUpdateEmployeeTourProduct` | `updateTourProduct(id, input)` | `PUT /api/v1/employee/tours/{id}` |
| 테마 잠금 | `EmployeeTourEditPage` — 409 안내와 "테마 되돌리기" | `toEmployeeWriteOutcome` (`employeeTourErrors.ts`) | — | `409 TOUR_PRODUCT_THEME_LOCKED` |

### SEQ-10 재고 관리 — MATCH

| 단계 | 화면 / 컴포넌트 | Query·Mutation | DataSource 메서드 | Backend |
| --- | --- | --- | --- | --- |
| 목록 | `EmployeeInventoryPage` → `InventoryTable` | `useEmployeeInventory` | `listInventory()` | `GET /api/v1/employee/inventory` |
| 추가 | `StockAddDialog` (양수 delta만, `stockAddRules.ts`) | `useAddStock` | `addStock(itemType, quantity)` | `POST /api/v1/employee/inventory` |
| 결과 모름 | 자동 재전송 없음 → 목록을 다시 읽고 사용자가 확인한 뒤에만 다시 추가 | `inventoryErrors.ts` | — | — |

### CLS-03 Employee 클래스 — EQUIVALENT (D-03)

다이어그램은 클래스 중심 예시이고, 구현은 같은 책임을 React 컴포넌트와 함수 모듈로 나눈다.

| UML 예시 클래스 / 역할 | 실제 대응 | 비고 |
| --- | --- | --- |
| `EmployeeApiGateway` (Backend 호출) | `EmployeeTourDataSource` / `EmployeeInventoryDataSource` 인터페이스 + `BackendEmployeeTourDataSource` / `BackendEmployeeInventoryDataSource` 구현, 공통 `BackendHttpClient` | 이름만 다르고 책임은 같다. 같은 이름의 클래스를 새로 만들지 않는다 |
| 응답 → 화면 모델 변환 | `employeeTour.adapter.ts`, `inventory.adapter.ts` (런타임 decoder) | |
| 입력 규칙 | `productFormRules.ts` (Theme별 Style 가격), `stockAddRules.ts` | 최종 검증은 Backend |
| 화면 클래스 | `pages/employee-*` 페이지 + `features/employee-*` 컴포넌트 | |
| 접근 제어 | `src/app/router/EmployeeAccessBoundary.tsx`, `EmployeeRouteLayout.tsx`, `EmployeeShell.tsx` | |
| Mock 구현 | `MockEmployeeTourDataSource`, `MockEmployeeInventoryDataSource` — DEV + `VITE_ENABLE_MOCKS=true`에서만 | Production build는 항상 Backend (`scripts/assert-production-mock-safety.mjs`) |

### CMP-ALL 컴포넌트 — 제안 단계 주석 정리 (D-03)

- 다이어그램의 "DESIGN PROPOSAL ONLY", "구현 미확인" 주석은 현재 상태와 다르다. Employee Console E01–E05는 PR #57–#61로 구현되어 `main`에 있고, Real Backend + MySQL CI(EJ01–EJ06)가 매 PR마다 통과한다.
- Employee Console은 **별도 앱이 아니라 같은 React 앱의 `/employee` route tree**다. Customer layout과 형제 route로 분리되어 Customer chrome을 쓰지 않고, 페이지 단위 lazy chunk라 Customer 화면은 Employee 코드를 내려받지 않는다 ([routes.tsx](../../src/app/router/routes.tsx)).
- 계층: `app/router` → `pages/employee-*` → `features/employee-tours`, `features/employee-inventory`, `features/auth` → `integrations/backend`.

## 2. 세션 정책·권한 경계 검증 근거 (#67 항목 2, 3)

새 코드 변경 없이 기존 테스트와 CI로 확인했다. 회귀는 발견되지 않았다.

| 확인 항목 | 근거 (테스트) |
| --- | --- |
| 토큰이 브라우저 저장소에 남지 않음 | `authSession.test.ts` "keeps bearer material in memory without writing browser storage" · `AuthProvider.test.tsx` "boots checking to unauthenticated without restoring browser storage", "writes the login token only to the injected memory session bridge" |
| 새로고침 후 다시 로그인 | E2E `employee-access.spec.ts` **EJ07** "reload on inventory → login → back on inventory" |
| 만료 시 재발급 없이 종료 | `authSession.test.ts` "fails closed after expiry" · `AuthProvider.test.tsx` "expires the in-memory session without refresh" · `employeeRoutes.test.tsx` "keeps the page and offers sign-in again when the session expires" |
| CUSTOMER 계정으로 직원 로그인 시 세션 없음 | `AuthProvider.test.tsx` "refuses a role the screen did not expect and stores no session" · `employeeRoutes.test.tsx` "refuses CUSTOMER credentials and keeps no session" · E2E **EJ06** · Real Backend **EJ06** (`tests/f2-mysql/employee.spec.ts`) |
| EMPLOYEE만 직원 경로 접근 | `employeeRoutes.test.tsx` "sends an anonymous visitor … to the Employee login", "shows the permission state, not a redirect loop, for a CUSTOMER session" · E2E **EJ01** · Backend 403 처리 `employeeTourPages.test.tsx` "shows the permission state on 403" |
| 고객 동작·캐시 격리 | `AuthProvider.test.tsx` "clears private state when a different identity logs in while authenticated", "clears private state once when an authenticated session signs out" · `router.test.tsx` "does not expose private Reservation Detail before authentication" |
| 실제 Backend 읽기·쓰기 | Real Backend + MySQL CI **EJ01–EJ06**: 목록, 생성(NFR-02), 가격 수정, 일정 있는 상품의 실제 409, 재고 양수 추가, CUSTOMER 거절 |

최근 실행: 동결 SHA `dbcf793`에서 단위 1,991개 · E2E 212개 PASS, #64 merge CI run `42587874049` 3종 PASS ([Release Record](../release/DEMO-AND-RELEASE.md) §2.1).

## 3. 주원호 handoff — 다이어그램에서 고칠 것

| 다이어그램 | 고칠 내용 |
| --- | --- |
| SEQ-12 | `sessionStorage`에 토큰 저장 → "메모리에만 보관, 새로고침하면 재로그인". 로그인 응답 role이 EMPLOYEE가 아니면 세션 없이 거절하는 분기 추가 |
| CLS-03 | `EmployeeApiGateway` → `EmployeeTourDataSource` / `EmployeeInventoryDataSource` (Backend 구현 클래스 이름 병기), "DESIGN PROPOSAL ONLY" 제거 |
| CMP-ALL | Employee Console = 같은 React 앱의 `/employee` route tree. "구현 미확인" 주석 제거 |
| SEQ-09 | (선택) 수정 저장 시 `409 TOUR_PRODUCT_THEME_LOCKED` 대안 흐름 |
| SEQ-10 | (선택) 결과를 모를 때 자동 재전송 없이 다시 읽고 확인하는 대안 흐름 |

실제 계정, 토큰, 개인정보, AWS 정보는 이 문서와 이슈에 쓰지 않는다.
