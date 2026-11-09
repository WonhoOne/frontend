# CP5 — Employee Read Lifecycle (CP5-A) and Mutation Lifecycle (CP5-B)

> Status: **COMPLETE — DELEGATED DECISION (2026-11-09)**
> Owner: 김태우 / `WonhoOne/frontend` (execution delegated, [Frontend Completion Plan §5](../../FRONTEND-COMPLETION-PLAN.md))
> Inputs: [CP0-B](CP0-B-BACKEND-EMPLOYEE-CONTRACT-AUDIT.md) API/error matrix, [CP1-A](CP1-A-OPERATOR-TASK-FLOWS.md) flows, [CP1-B](CP1-B-INFORMATION-ARCHITECTURE.md) routes, [CP4](CP4-MOTION-AND-FEEDBACK.md) feedback channels, current [`queryClient.ts`](../../../src/app/providers/queryClient.ts) and [`privateQueryCache.ts`](../../../src/app/providers/privateQueryCache.ts), Master Plan §15–§17
> Backend is the final authority for every value and rule below.

## 1. Server-state inventory

| Query key | Endpoint | Used by | Privacy | Freshness |
| --- | --- | --- | --- | --- |
| `['employee', 'tour-products']` | `GET /api/v1/employee/tours` | Product list, Product edit | `meta.privacy = 'private'` | `staleTime` 0; refetch on mount, window focus, reconnect |
| `['employee', 'inventory']` | `GET /api/v1/employee/inventory` | Inventory | `meta.privacy = 'private'` | `staleTime` 0; refetch on mount, window focus, reconnect |

- Both are cleared by the existing `clearPrivateQueryCache` on sign-out and on 401, so another account never sees them.
- No polling (Master Plan §16).
- Keys start with `'employee'` so they cannot collide with public `['public', 'tour-products']`.

### Edit screen data source (closes CP1-A F02 / CP1-B §6 open item)

**Decision:** the editor reads the product from the **Employee list query** and selects it by ID. It does **not** use public `GET /api/v1/tours/{id}` and does not invent an Employee detail endpoint.

- Why: same private role and representation as the list; no extra endpoint; the list has no pagination, so it always contains every product.
- The editor initializes its form **once**, from the first response fetched **after the editor mounted** (`refetchOnMount: 'always'`), so it never starts from a stale cache entry.
- ID not in a successful response → "상품을 찾을 수 없습니다" state with a link to the list (no form).

## 2. CP5-A — Read lifecycle

| State | Product list | Inventory | Product edit (initial load) |
| --- | --- | --- | --- |
| Loading, no data | Table skeleton (5 rows) | Table skeleton (4 rows) | Form skeleton |
| Success, empty | `EmptyState` + `+ 새 여행상품` | Not expected (4 seeded rows); if empty → treat as contract error | n/a |
| Success | Table | Table | Form initialized |
| Background refetch | Keep content; existing `RefreshIndicator` | Same | **Do not** overwrite form values while editing |
| Refetch fails, data exists | Keep content; small inline note "최신 정보를 불러오지 못했습니다" + retry | Same | Keep form |
| First load fails (network / 5xx) | `SectionError` with retry | Same | `SectionError` with retry |
| 401 | Clear private cache → `/employee/login` with return target | Same | Same |
| 403 | Permission state (CP4 §3) | Same | Same |
| Response fails runtime decode | `SectionError` ("데이터 형식이 올바르지 않습니다"), no partial render; `ContractMappingError` logged without payload | Same | Same |

**Retry policy for Employee GETs:** at most 1 automatic retry for network/5xx only; **no automatic retry** for 401, 403, 404, 409, 422 or `ContractMappingError` (Master Plan §16). The generic `shouldRetryQuery` retries everything once, so Employee queries set their own `retry` function.

**Decode rules:** `id`, `quantity`, `amount` must be safe integers (`Number.isSafeInteger`); `quantity ≥ 0`; `amount > 0`; enums exact. Backend uses Java `long`; any value outside JS safe range is a `ContractMappingError`, not a silently rounded number (CP0-B §4).

## 3. CP5-B — Mutation lifecycle

All writes: `retry: 0` (existing default), **pessimistic** (no optimistic UI), submit button `isLoading` from the moment of submit (CP4 §5).

### 3.1 Product create — `POST /api/v1/employee/tours`

```text
editing ──submit──▶ validating(client) ──fail──▶ editing + error summary
                         │ok
                         ▼
                     submitting ──201──▶ success: invalidate ['employee','tour-products'] → /employee/tours + status line + row highlight
                         │
                         ├─422──▶ editing + field errors (fieldErrors[] mapped)
                         ├─400──▶ editing + generic "요청을 처리할 수 없습니다" (client defect; no field mapping)
                         ├─401──▶ session-expired alert (§3.5)
                         ├─403──▶ permission state
                         ├─5xx──▶ editing + alert "저장하지 못했습니다" + 다시 저장
                         └─network/timeout──▶ UNKNOWN (§3.4)
```

### 3.2 Product update — `PUT /api/v1/employee/tours/{id}`

Same as create, plus:

| Response | Behavior |
| --- | --- |
| 200 | Stay on editor; form re-initializes from the **response body**; `저장` disabled (clean); status line; list query invalidated |
| 409 `TOUR_PRODUCT_THEME_LOCKED` | Keep all edits; alert explains only Theme cannot change because schedules exist; action "테마를 원래대로 되돌리기" resets only the Theme field to the loaded value (price rows follow §3.6) |
| 404 `TOUR_PRODUCT_NOT_FOUND` | Replace form with not-found state + link to list |
| network/timeout | UNKNOWN, but **PUT is a complete replacement and idempotent**, so "다시 저장" re-sends the same body without extra confirmation |

### 3.3 Stock add — `POST /api/v1/employee/inventory`

```text
dialog idle ──submit(qty)──▶ submitting (Escape/outside blocked)
   │                              │
   │                              ├─200──▶ close dialog; table shows response.quantity; status line; row highlight; invalidate ['employee','inventory']
   │                              ├─422──▶ dialog: field error on 추가할 수량
   │                              ├─401──▶ close dialog → session-expired flow
   │                              ├─403──▶ close dialog → permission state
   │                              ├─5xx──▶ dialog: "추가하지 못했습니다" + refetch inventory; 다시 추가 allowed
   │                              └─network/timeout──▶ UNKNOWN (§3.4)
```

- Client validation: integer, `≥ 1`, `≤ Number.MAX_SAFE_INTEGER − current` (technical bound only; no business maximum is invented).
- Preview "추가 후 재고" = current + qty; display only.

### 3.4 UNKNOWN outcome (non-idempotent POSTs)

POST create and POST stock add have **no idempotency key** (CP0-B). A lost response may still have been applied.

| Write | UNKNOWN UI | Allowed next actions |
| --- | --- | --- |
| Product create | Alert at form top: "저장 결과를 확인할 수 없습니다. 이미 만들어졌을 수 있습니다." Form values kept | `저장 여부 확인` refetches the Employee list **without leaving the form** and reports inside the alert either "같은 테마·이름의 상품이 목록에 있습니다 (ID n) — 목록으로 이동" or "같은 테마·이름의 상품을 찾지 못했습니다" (a hint, not proof: another employee may have created the same name) · `그래도 다시 저장` (enabled after the check; confirm step warns about duplicates) |
| Stock add | Dialog stays open with alert: "추가가 반영되었는지 확인할 수 없습니다." Shows the **quantity before the attempt** | `현재 재고 다시 보기` (refetch; dialog shows before vs now). If now = before + qty, show "반영된 것으로 보입니다 (다른 직원의 동시 추가가 있었다면 다를 수 있습니다)". `다시 추가` stays disabled until the refetch completes, then requires a confirm step |

Never auto-resend. Never claim success or failure without a server response.

### 3.5 Session expiry during a write (401)

- The HTTP client already clears the memory token on protected 401; the Employee feature also clears private caches.
- Editor: show an alert "세션이 만료되었습니다. 다시 로그인하면 이 화면으로 돌아옵니다. 입력한 내용은 저장되지 않았고 유지되지 않습니다." with `다시 로그인`. **No automatic redirect** while a form has unsaved input, so the employee can copy text first.
- Form drafts are **not persisted** (Master Plan §42; no private payload in storage). After login the employee returns to the same route and the form reloads from the server.
- Nothing is re-submitted after login (Master Plan §17 rule applied to Employee).

### 3.6 Product form rules

- Fields: `theme` (required), `name` (required, trimmed non-blank, ≤ 255), `description` (required, trimmed non-blank, ≤ 2000), one positive integer KRW amount for **each** allowed style of the selected Theme.
- Allowed styles: `HONEYMOON_ROMANCE`, `PARENTS_HEALING` → GRAND, PREMIUM; `GOLF_CHALLENGE`, `OUTDOOR_TREKKING` → CLASSIC, GRAND, PREMIUM.
- **Theme switch:** price values are kept in form state per style; switching Theme shows only allowed styles; switching back restores a hidden value; submit sends only allowed styles with `currency: 'KRW'`. Nothing is silently deleted.
- Request body is exactly `{ theme, name, description, stylePrices }` — never `id` or `availableStyles`.
- Client validation mirrors these rules for fast feedback only; 422 from Backend wins.
- `fieldErrors[].field` mapping: `theme`, `name`, `description` → that field; `stylePrices` → price section summary; `stylePrices[i].*` → the price field at index *i* of the **submitted** array.

### 3.7 Dirty guard

- Dirty = any field differs from the loaded values (edit) or any field touched (create).
- In-app navigation (nav links, breadcrumb, `취소`, browser Back): confirm `Dialog` "저장하지 않은 변경 사항이 있습니다" with `계속 편집` (default focus) and `변경 취소하고 나가기`.
- Tab close / reload: native `beforeunload` prompt.
- Sign-out while dirty: same confirm first.
- Not dirty after a successful save.

## 4. Gate

- [x] Every endpoint has a query key or mutation, privacy class and freshness
- [x] Edit data source decided without inventing an endpoint
- [x] Read states for loading / empty / refetch / failure / 401 / 403 / decode error
- [x] Each write has a state machine covering 200/201, 400, 401, 403, 404, 409, 422, 5xx, unknown
- [x] Non-idempotent POSTs never auto-resend; PUT retry justified by idempotency
- [x] Theme-switch price behavior and fieldErrors mapping fixed
- [x] Dirty guard covers in-app nav, browser Back, reload and sign-out

**Next: CP6-0 — screen inventory and spec template, then CP6-A … CP6-F screen specs.**
