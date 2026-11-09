# CP8 — Employee API, DTO and Data Mapping (CP8-A reads, CP8-B writes)

> Status: **COMPLETE — DELEGATED DECISION (2026-11-09)**
> Inputs: [CP0-B](CP0-B-BACKEND-EMPLOYEE-CONTRACT-AUDIT.md), [CP5](CP5-DATA-AND-MUTATION-STATES.md), [CP7](CP7-IMPLEMENTATION-ARCHITECTURE.md), REST v0.2 (`docs/main` `f49d045`)
> Source verified: `src/integrations/backend/contracts/{tourProduct,decoder,apiError,contractMappingError}.ts`, `src/integrations/backend/client/backendClient.ts`, `src/features/travel-history/BackendTravelHistoryDataSource.ts`

## 1. Reused contract code (verified)

| Existing | Use |
| --- | --- |
| `decodeTourProductDto`, `decodeTourProductListDto` (`tourProduct.ts`) | Decode Employee GET list and POST/PUT responses — same `TourProductResponse` shape |
| `tourThemes`, `tourStyles` | Enum sources for form options and request typing |
| `expectPositiveInteger`, `expectNonNegativeInteger`, `expectEnum`, `expectArray`, `expectRecord` (`decoder.ts`) | Inventory decoder; they already reject non-safe integers |
| `decodeApiErrorDto`, `apiErrorCodes`, `fieldErrorCodes` (`apiError.ts`) | All codes the Employee specs need are already listed |
| `BackendHttpClient.requestJson` with `authentication: 'required'` | All Employee calls (same as `BackendTravelHistoryDataSource`) |

## 2. CP8-A — Reads

| DataSource method | HTTP | Decoder | Model |
| --- | --- | --- | --- |
| `EmployeeTourDataSource.listTourProducts(signal)` | `GET /api/v1/employee/tours` | `decodeTourProductListDto` | `EmployeeTourProduct[]` |
| `EmployeeInventoryDataSource.listInventory(signal)` | `GET /api/v1/employee/inventory` | `decodeInventoryListDto` (NEW) | `InventoryItem[]` |

New in `contracts/inventory.ts`:

```ts
export const inventoryItemTypes = ['COUPLE_TSHIRT', 'GINSENG_GIFT', 'GOLF_BALL', 'SCARF'] as const;
export interface InventoryDto { id: number; itemType: InventoryItemTypeDto; quantity: number }
export function decodeInventoryDto(value: unknown, rootPath = '$'): InventoryDto   // id > 0, quantity >= 0, safe integers
export function decodeInventoryListDto(value: unknown): readonly InventoryDto[]  // array; each item decoded
```

`BackendContractName` gains `'Inventory' | 'Inventory[]'`. Exactly-four-items is a **feature** rule (adapter), not a decoder rule, so the decoder stays a pure contract check.

Models:

```ts
// features/employee-tours/employeeTour.model.ts
interface EmployeeTourProduct {
  id: string;                         // canonical decimal string via existing resourceIdentity rule
  theme: TourTheme;
  name: string;
  description: string;
  stylePrices: ReadonlyArray<{ style: TourStyle; amount: number }>; // sorted Classic → Grand → Premium
}
// features/employee-inventory/inventory.model.ts
interface InventoryItem { itemType: InventoryItemType; quantity: number }  // ordered by Backend id
```

- `availableStyles` is checked by the existing decoder for consistency with `stylePrices`, then dropped from the model (UI derives allowed styles from Theme in `productFormRules.ts`, same rule as Backend `TourStylePolicy`).
- `currency` is dropped after the decoder guarantees `'KRW'`.

Query hooks (TanStack Query):

| Hook | Key | Options |
| --- | --- | --- |
| `useEmployeeTourProducts()` | `['employee','tour-products']` | `staleTime: 0`, `meta: { privacy: 'private' }`, `retry: employeeReadRetry` |
| `useEmployeeTourProductForEdit(id)` | same key, `select` by id | plus `refetchOnMount: 'always'`; page captures first `isFetchedAfterMount` data |
| `useEmployeeInventory()` | `['employee','inventory']` | as list |

`employeeReadRetry(failureCount, error)`: retry once only for network errors and HTTP 5xx; never for 4xx or `ContractMappingError`.

## 3. CP8-B — Writes

| DataSource method | HTTP | Request DTO | Response |
| --- | --- | --- | --- |
| `createTourProduct(values)` | `POST /api/v1/employee/tours` | `{ theme, name, description, stylePrices: [{ style, amount, currency: 'KRW' }] }` | 201 → `decodeTourProductDto` |
| `updateTourProduct(id, values)` | `PUT /api/v1/employee/tours/{tourId}` | same | 200 → `decodeTourProductDto` |
| `addStock(itemType, quantity)` | `POST /api/v1/employee/inventory` | `{ itemType, quantity }` | 200 → `decodeInventoryDto` |

- `employeeTour.adapter.ts#toTourProductWriteDto(values)`: trims `name`/`description`; emits `stylePrices` for allowed styles of `values.theme` only, in Classic → Grand → Premium order; never emits `id` / `availableStyles`.
- `id` for PUT goes through `parseBackendResourceIdentity` (existing) → number in path; invalid → page shows not-found without a request.
- Mutations: `retry: 0`; on success `invalidateQueries` of the matching key; for stock add also `setQueryData` to write the returned row immediately (server value).

### Error normalization (one function per feature)

`toEmployeeWriteOutcome(error)` returns a discriminated union consumed by the pages:

| Input | Outcome |
| --- | --- |
| HTTP 401 with `AUTHENTICATION_REQUIRED` / `INVALID_ACCESS_TOKEN` / `ACCESS_TOKEN_EXPIRED` | `{ kind: 'session-expired' }` (also calls `auth.invalidateSession`) |
| HTTP 403 `FORBIDDEN` | `{ kind: 'forbidden' }` |
| HTTP 404 `TOUR_PRODUCT_NOT_FOUND` | `{ kind: 'not-found' }` |
| HTTP 409 `TOUR_PRODUCT_THEME_LOCKED` | `{ kind: 'theme-locked' }` |
| HTTP 422 `VALIDATION_FAILED` | `{ kind: 'validation', fieldErrors }` |
| HTTP 400 `MALFORMED_REQUEST` | `{ kind: 'malformed' }` |
| HTTP 5xx / `INTERNAL_ERROR` | `{ kind: 'server' }` |
| network error, abort by timeout, malformed success body | `{ kind: 'unknown' }` |

A malformed **success** body on a write is `unknown`, not failure: the write may have been applied (CP5 §3.4).

### `fieldErrors` → form field mapping

`productFormRules.ts#mapFieldErrors(fieldErrors, submittedStyles)`:

| `field` | Form target |
| --- | --- |
| `theme`, `name`, `description` | that field |
| `stylePrices` | price section summary |
| `stylePrices[i]`, `stylePrices[i].style`, `stylePrices[i].amount`, `stylePrices[i].currency` | price input of `submittedStyles[i]` |
| anything else | form summary only (never dropped) |

Code → copy as in [E03 §14](screens/E03-product-create.md); unknown code → "입력 값을 확인해 주세요."

## 4. Precision and limits

- All numeric reads use existing safe-integer decoders → values above `Number.MAX_SAFE_INTEGER` become `ContractMappingError` (CP0-B §4 Java `long` risk handled by refusal, not rounding).
- Inputs (KRW amount, stock quantity) are limited to safe integers client-side; these are technical limits, not business rules.

## 5. Mock parity

`MockEmployeeTourDataSource` and `MockEmployeeInventoryDataSource` implement the same interfaces with in-memory data, enforce the same Theme→style rule, return the same outcome kinds, and support dev scenarios (`?mockScenario=`) for 409 / 422 / 500 / unknown. The fake E2E server mirrors the same responses at the HTTP level.

## 6. Gate

- [x] Every endpoint mapped to DataSource method, DTO, decoder and model
- [x] Existing contract code reused; only Inventory decoder and contract name added
- [x] Write DTO construction rules fixed; response-only fields never sent
- [x] One error normalization with an explicit `unknown` outcome
- [x] fieldErrors mapping covers indexed style paths and unknown fields
- [x] Precision handled by refusal; no invented limits

**Next: CP9 — desktop accessibility and device acceptance.**
