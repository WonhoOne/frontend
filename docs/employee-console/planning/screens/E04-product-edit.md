# [E04] Product Edit

> Route: `/employee/tours/:tourId/edit`
> Status: **READY** — v1, 2026-11-09 (CP6-D, delegated decision)
> Upstream: [CP1-A F04](../CP1-A-OPERATOR-TASK-FLOWS.md), [CP1-B IA-04/IA-08](../CP1-B-INFORMATION-ARCHITECTURE.md), [CP2-A V3/V4](../CP2-A-REFERENCE-EVIDENCE-REGISTER.md), [CP2-B §4.2](../CP2-B-VISUAL-DIRECTION.md), [CP4 §3](../CP4-MOTION-AND-FEEDBACK.md), [CP5 §1, §3.2, §3.6, §3.7](../CP5-DATA-AND-MUTATION-STATES.md), shared form spec [E03](E03-product-create.md)

## 1. Screen Purpose

Lets an employee change an existing product's name, description, prices and — only if no schedule uses the product yet — its Theme. It must show what is saved now, keep edits safe when the Backend refuses a Theme change, and confirm what was saved.

## 2. Route / Entry Conditions

- Entry: product name link on E02; direct URL / bookmark; return after login.
- `tourId` must be a canonical positive integer string (existing `parseBackendResourceIdentity`); otherwise not-found state without a request.
- EMPLOYEE required.
- Exit: breadcrumb / `취소` / nav (dirty guard). After 200 the user **stays** (IA-08 DECIDED in CP4).

## 3. User Goal

Primary: change product details and see them saved.
Secondary: understand and recover from a refused Theme change.

## 4. Required Data

- [DECIDED] Source: `['employee','tour-products']` list query, product selected by `id`; `refetchOnMount: 'always'`; form initializes once from the first post-mount response (CP5 §1).
- [CONFIRMED] `PUT /api/v1/employee/tours/{tourId}` body `{ theme, name, description, stylePrices }` (complete replacement); 200 → `TourProductResponse`.
- [CONFIRMED] Backend does not expose whether schedules exist (`themeLocked` absent). The UI does **not** pre-lock the Theme field.

## 5. Desktop Layout

Same as E03 §5, except:

- H1 = current saved product name; under it `ID {id} · {Theme title}` (`body-sm`, secondary).
- Status line slot between header and form (CP4).
- Info note under the Theme field (always shown): "이 상품으로 만든 여행 일정이 있으면 테마를 바꿀 수 없습니다. 이름, 설명, 가격은 바꿀 수 있습니다." (sets expectation without claiming lock state).

## 6. Device scope

PC-only; same as E03.

## 7. Exact Section Order

Breadcrumb "여행상품" → H1 (name) + ID/Theme line → status line / alerts → 기본 정보 (테마 + note → 상품명 → 설명) → 스타일별 1인 가격 → action bar (취소, 저장).

## 8. Component Composition

Same as E03 plus `Skeleton` (form skeleton), `SectionError`, not-found state (`EmptyState`-style block with link).

## 9. Primary / Secondary CTA

Primary `저장` — **disabled until the form differs from the loaded values** (CP2-B). Secondary `취소` → E02 (dirty guard).

## 10. Interaction Rules

- All E03 field rules apply (Theme-switch price retention, KRW normalization, trimming).
- Dirty = any field value ≠ loaded value (after trimming). Reverting a change makes the form clean again.
- Background refetch of the list **never** overwrites form values. If the refetched product differs from the loaded snapshot while the form is dirty, show a non-blocking note: "다른 곳에서 이 상품이 변경되었습니다. 저장하면 지금 입력한 내용으로 덮어씁니다." with `최신 내용 불러오기` (asks to discard edits). (PUT is last-write-wins; no version field in v0.2.)
- 200 → form re-initializes from the response; H1 updates; `저장` disabled; status line "변경 사항을 저장했습니다."; list query invalidated.

## 11. Motion

Route entry only.

## 12. Loading

Initial: header skeleton + form skeleton until the post-mount fetch resolves (even if a cached list exists, to avoid editing stale values). Submit: `저장` loading.

## 13. Empty

N/A. Missing product → not-found state (§14).

## 14. Error

| Case | UI |
| --- | --- |
| Invalid `tourId` format | Not-found: H1 "상품을 찾을 수 없습니다", text "목록에서 다시 선택해 주세요.", link `여행상품 목록으로` |
| Loaded list lacks this `id` | Same not-found state |
| Initial load network/5xx | `SectionError` "상품 정보를 불러오지 못했습니다" + retry |
| 409 `TOUR_PRODUCT_THEME_LOCKED` | Alert (`role="alert"`, focused): "이 상품으로 만든 여행 일정이 있어 테마를 바꿀 수 없습니다. 테마를 원래대로 되돌린 뒤 다시 저장해 주세요." + action `테마 되돌리기` (sets Theme back to loaded value; keeps every other edit; price rows follow retention rule). Nothing else is changed by the Backend (transactional) |
| 404 `TOUR_PRODUCT_NOT_FOUND` on PUT | Replace form with not-found state; edits are lost (product no longer exists) |
| 422 / 400 / 401 / 403 / 5xx | As E03 §14 |
| Network / timeout | Alert "저장 결과를 확인할 수 없습니다." + `다시 저장` (PUT is idempotent, no confirm needed, CP5 §3.2) |

## 15. Retrying / Refreshing

Manual only for writes. Read: CP5 §2 policy.

## 16. Edge Cases

- Saving with Theme unchanged on a product that has schedules → succeeds (BR-31 allows same-Theme edits).
- Theme changed then changed back to the original before saving → not dirty for Theme; no 409.
- Changing Theme to one with fewer styles drops a style price from the request; the Backend replaces the full set (CONFIRMED complete replacement).
- Product edited in another tab: last write wins; the refetch note (§10) is the only warning.
- Direct URL to an ID that exists but list request is slow → skeleton, then form.

## 17. Accessibility

As E03 §17, plus: the Theme info note is connected to the select with `aria-describedby`; the 409 alert's `테마 되돌리기` is the first focusable element inside the alert.

## 18. API / Shared Contract Dependency

`GET /api/v1/employee/tours`, `PUT /api/v1/employee/tours/{tourId}` (CONFIRMED). No Employee detail GET, no `themeLocked` (CONFIRMED absent).

## 19. TBD / Blocker

None. (No concurrency token in v0.2 — documented as last-write-wins, not a blocker.)

## 20. Acceptance Criteria

1. Opening a product shows a skeleton, then the form filled from a fresh server response.
2. `저장` is disabled until a value changes and again after a successful save.
3. Valid save sends a complete body, stays on the page, shows the saved values and the status line.
4. Theme change rejected with 409 keeps all other edits and offers `테마 되돌리기`; saving again succeeds.
5. Unknown network result offers `다시 저장`, which re-sends the same body.
6. Invalid or missing ID shows the not-found state without crashing.
7. Leaving with unsaved edits asks for confirmation.
8. Keyboard-only edit and save works; errors are announced.
