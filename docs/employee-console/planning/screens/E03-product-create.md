# [E03] Product Create

> Route: `/employee/tours/new`
> Status: **READY** — v1, 2026-11-09 (CP6-C, delegated decision)
> Upstream: [CP1-A F03](../CP1-A-OPERATOR-TASK-FLOWS.md), [CP1-B IA-04/IA-07](../CP1-B-INFORMATION-ARCHITECTURE.md), [CP2-A V3/V4](../CP2-A-REFERENCE-EVIDENCE-REGISTER.md), [CP2-B §4.2](../CP2-B-VISUAL-DIRECTION.md), [CP3 §2.2](../CP3-COMPONENT-REUSE-AND-CONTRACTS.md), [CP4 §3](../CP4-MOTION-AND-FEEDBACK.md), [CP5 §3.1, §3.4, §3.6, §3.7](../CP5-DATA-AND-MUTATION-STATES.md)

## 1. Screen Purpose

Lets an employee plan a new travel product: choose its Theme, name and describe it, and set a per-person KRW price for every Tour Style that Theme allows. It ends when the Backend has created the product and the employee sees it in the list.

## 2. Route / Entry Conditions

- Entry: `+ 새 여행상품` on E02 (header or empty state); direct URL allowed. EMPLOYEE required.
- Exit: 201 → `/employee/tours` (IA-07) with new `id` in navigation state; `취소` or breadcrumb → E02 (dirty guard); nav links (dirty guard).

## 3. User Goal

Primary: create a valid product in one pass.
Secondary: fix any rejected field without retyping the rest.

## 4. Required Data

- [CONFIRMED] Request `{ theme, name, description, stylePrices: [{ style, amount, currency: 'KRW' }] }`; response 201 `TourProductResponse`.
- [CONFIRMED] Theme → allowed styles: Honeymoon/Parents → Grand, Premium; Golf/Trekking → Classic, Grand, Premium.
- [CONFIRMED] `name` non-blank ≤ 255; `description` non-blank ≤ 2000; `amount` positive integer.
- No data loaded before the form (nothing to fetch).

## 5. Desktop Layout

- Shell E00; `PageContainer variant="reading"` (760px column).
- Breadcrumb link "여행상품" → H1 "새 여행상품" → alert slot → form.
- Section card **기본 정보**: 테마 (`SelectField`), 상품명 (`TextField`), 설명 (`TextAreaField`, 6 rows, counter "n / 2000").
- Section card **스타일별 1인 가격**: one `KrwAmountField` per allowed style, label = style display name, suffix "원", helper shows formatted value "₩1,200,000" once a valid number is typed.
- Sticky `EditorActionBar` at the viewport bottom inside the content column: `취소` (secondary), `저장` (primary).

## 6. Device scope

PC-only. At 1024px the 760px column fits unchanged.

## 7. Exact Section Order

Breadcrumb "여행상품" → H1 "새 여행상품" → error summary / alert (when present) → 기본 정보 (테마 → 상품명 → 설명) → 스타일별 1인 가격 → action bar (취소, 저장).

Before a Theme is chosen, the price card shows the text "테마를 선택하면 해당 테마에서 판매할 스타일의 가격을 입력할 수 있습니다." and no inputs.

## 8. Component Composition

`EmployeeShell`, `EmployeePageHeader` (breadcrumb + H1), `ProductForm` (`SelectField`, `TextField`, `TextAreaField`, `KrwAmountField`), `EditorActionBar`, error summary box, `Dialog` (dirty-leave confirm).

## 9. Primary / Secondary CTA

Primary `저장` (enabled whenever not submitting; validation runs on submit). Secondary `취소` → E02 (dirty guard).

## 10. Interaction Rules

- Theme `<select>` first option "테마 선택" (empty, invalid). Options in fixed order: Honeymoon Romance, Parents Healing, Golf Challenge, Outdoor Trekking.
- Changing Theme shows exactly the allowed styles; values typed for a hidden style are kept in memory and restored if the Theme is switched back; only allowed styles are submitted (CP5 §3.6).
- KRW input accepts digits only (`inputMode="numeric"`); pasted "1,200,000" or "₩1,200,000" is normalized to digits; anything else → field error. Value submitted as a number.
- `name` and `description` are trimmed before validation and submit.
- Submit: client validation → if errors, show inline errors + summary, focus summary, no request. Else `저장` `isLoading`, fields read-only until the response.
- 201 → invalidate `['employee','tour-products']`, navigate to E02 with `replace` (DECIDED) so browser Back from the list does not reopen the completed form.
- Dirty guard (CP5 §3.7): any touched field makes the form dirty.

## 11. Motion

None beyond route entry and dialog defaults.

## 12. Loading

No initial loading. Submit: `저장` loading state.

## 13. Empty

N/A (form).

## 14. Error

| Case | UI |
| --- | --- |
| Client validation | Inline: "테마를 선택해 주세요." / "상품명을 입력해 주세요." / "상품명은 255자 이하여야 합니다." / "설명을 입력해 주세요." / "설명은 2000자 이하여야 합니다." / "{Style} 가격을 입력해 주세요." / "가격은 1원 이상의 정수여야 합니다." + summary "입력 내용을 확인해 주세요 (n개 항목)" with links |
| 422 `VALIDATION_FAILED` | Map `fieldErrors` (CP5 §3.6). Codes → copy: `REQUIRED` → "입력해 주세요", `OUT_OF_RANGE` → "허용 범위를 벗어났습니다", `NOT_ALLOWED` / `DUPLICATE_VALUE` on stylePrices → "이 테마에서 허용되지 않는 스타일 가격입니다" (summary) |
| 400 `MALFORMED_REQUEST` | Alert "요청을 처리할 수 없습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요." (client defect, logged) |
| 401 | CP5 §3.5 session-expired alert with `다시 로그인` (no auto redirect) |
| 403 | E01 permission state |
| 5xx | Alert "저장하지 못했습니다. 잠시 후 다시 시도해 주세요." + `다시 저장` |
| Network / timeout | UNKNOWN alert (CP5 §3.4): "저장 결과를 확인할 수 없습니다. 이미 만들어졌을 수 있습니다." + `저장 여부 확인` + `그래도 다시 저장` (confirm) |

## 15. Retrying / Refreshing

Only by explicit user action. Never automatic (mutation retry 0).

## 16. Edge Cases

- Double-click `저장` → one request (button disabled on first click).
- Theme switched after a 422 on a style field → errors for hidden styles are removed from the summary.
- Very large amount: input limited to `Number.MAX_SAFE_INTEGER`; above → field error "금액이 너무 큽니다."
- Name identical to an existing product → allowed (no uniqueness rule in v0.2).

## 17. Accessibility

- Labels visible; required marked with `*` and `required`; errors linked via `aria-describedby`; summary `role="alert"` and focus target; each summary item is a link that focuses its field.
- Price inputs labelled "Classic 1인 가격 (원)" etc.
- Action bar is after the form in DOM order; sticky only visually.
- Description counter is `aria-live="polite"` only when within 100 characters of the limit.

## 18. API / Shared Contract Dependency

`POST /api/v1/employee/tours` (CONFIRMED). No image, destination, schedule or status fields.

## 19. TBD / Blocker

None.

## 20. Acceptance Criteria

1. Price inputs shown match the selected Theme's allowed styles exactly.
2. Submitting with missing/invalid fields sends no request and focuses the summary.
3. Valid submit sends exactly `{theme, name, description, stylePrices}` with `currency:'KRW'` and only allowed styles.
4. 201 → list with status line and highlighted new row; Back from the list does not reopen the filled form.
5. 422 field errors appear on the right fields, including indexed style prices.
6. Network loss during submit shows the unknown-result alert and never resubmits automatically.
7. Leaving with unsaved input asks for confirmation; `계속 편집` keeps all values.
8. Keyboard-only completion is possible; screen reader announces errors.
