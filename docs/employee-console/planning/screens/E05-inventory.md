# [E05] Inventory and Stock Add

> Route: `/employee/inventory` (stock add is a dialog on this route, IA-05)
> Status: **READY** — v1, 2026-11-09 (CP6-E, delegated decision)
> Upstream: [CP1-A F05/F06](../CP1-A-OPERATOR-TASK-FLOWS.md), [CP1-B IA-05](../CP1-B-INFORMATION-ARCHITECTURE.md), [CP2-A V5/V6](../CP2-A-REFERENCE-EVIDENCE-REGISTER.md), [CP2-B §4.3](../CP2-B-VISUAL-DIRECTION.md), [CP3 §2.2](../CP3-COMPONENT-REUSE-AND-CONTRACTS.md), [CP4 §3](../CP4-MOTION-AND-FEEDBACK.md), [CP5 §1–§3.4](../CP5-DATA-AND-MUTATION-STATES.md)

## 1. Screen Purpose

Shows the current warehouse stock of the four fixed goods and lets an employee record received goods by **adding** a positive quantity. The screen must make it impossible to mistake "amount to add" for "new total", and must never claim a result the server did not confirm.

## 2. Route / Entry Conditions

- Entry: nav 재고 관리; direct URL. EMPLOYEE required.
- Exit: nav links. The dialog is not a route (no URL change).

## 3. User Goal

Primary: add received units to one item and see the new total.
Secondary: check current stock of all items.

## 4. Required Data

- [CONFIRMED] `GET /api/v1/employee/inventory` → `[{ id, itemType, quantity }]` (4 rows, ID ascending, zero included).
- [CONFIRMED] `POST /api/v1/employee/inventory` `{ itemType, quantity }`, `quantity` positive integer **delta**; 200 → updated `{ id, itemType, quantity }`.
- [CONFIRMED] No idempotency key; concurrent adds are all applied (Backend row lock).
- [DECIDED] Query `['employee','inventory']`, private, `staleTime` 0.

## 5. Desktop Layout

- Shell E00; `PageContainer variant="main"`, table card max-width 760px (four rows do not need full width).
- Header: H1 "재고 관리"; text "받은 물품 수량을 더해 재고를 기록합니다. 재고를 줄이거나 직접 바꾸는 기능은 없습니다." (`body-sm`, secondary).
- Status line slot.
- Table columns: 품목 (label) | 현재 재고 (right-aligned, `tabular-nums`, "35개") | action (`재고 추가`, secondary small button).

Dialog (`Dialog`, title "{품목} 재고 추가"):

```text
현재 재고          35개
추가할 수량   [      ] 개      ← TextField, numeric, autofocus
추가 후 재고        —          ← "40개" once a valid number is typed
                  [취소] [추가]
```

## 6. Device scope

PC-only; layout unchanged at 1024px.

## 7. Exact Section Order

H1 → description text → status line → [refresh note] → table. Dialog: title → 현재 재고 → 추가할 수량 → 추가 후 재고 → alert slot → buttons (취소, 추가).

## 8. Component Composition

`EmployeeShell`, `EmployeePageHeader`, `InventoryTable`, `StockAddDialog` (`Dialog`, `TextField`, `Button`), `Skeleton`, `SectionError`, `RefreshIndicator`.

## 9. Primary / Secondary CTA

Page: per-row secondary `재고 추가` (accessible name "{품목} 재고 추가"). Dialog: primary `추가`, secondary `취소`.

## 10. Interaction Rules

- Row labels from the shared catalog wording (CP6-0 §2). Unknown `itemType` → decode error (contract has exactly four).
- Dialog opens with the row's current server quantity at the time of opening.
- Input: digits only; validation on submit: empty → "추가할 수량을 입력해 주세요."; 0 or negative → "1개 이상 입력해 주세요."; non-integer → "정수로 입력해 주세요."; above technical bound → "수량이 너무 큽니다."
- Preview "추가 후 재고" = current + input; text only.
- `추가` → `isLoading`; Escape and outside click blocked while in flight; close button disabled while in flight.
- 200 → dialog closes; row shows `response.quantity`; status line "{품목} 재고를 {n}개 추가했습니다. 현재 {total}개"; row highlight; invalidate `['employee','inventory']`; focus back to that row's `재고 추가`.
- If a background refetch changes the current quantity while the dialog is open (idle), the dialog's 현재 재고 and preview update and a note says "다른 곳에서 재고가 바뀌어 현재 재고를 갱신했습니다."

## 11. Motion

Dialog defaults; row highlight on success (CP4 §2).

## 12. Loading

First load: 4-row skeleton. Background refetch: keep rows, `RefreshIndicator`. Submit: `추가` loading.

## 13. Empty

Empty array is a contract violation (four seeded rows) → treated as decode error (§14).

## 14. Error

| Case | UI |
| --- | --- |
| First load network/5xx | `SectionError` "재고를 불러오지 못했습니다" + retry |
| Decode error / not exactly four known items | `SectionError` "데이터 형식이 올바르지 않습니다" |
| 422 on add | Field error in dialog |
| 400 `MALFORMED_REQUEST` | Dialog alert "요청을 처리할 수 없습니다." |
| 401 | Close dialog → E01 expiry flow (`returnTo=/employee/inventory`) |
| 403 | E01 permission state |
| 5xx | Dialog alert "재고를 추가하지 못했습니다." + automatic inventory refetch; `추가` enabled again |
| Network / timeout | **UNKNOWN** (CP5 §3.4): dialog stays open, alert "추가가 반영되었는지 확인할 수 없습니다.", shows "시도 전 재고 35개"; action `현재 재고 다시 보기`; after refetch shows "지금 재고 {m}개" and, if m = before + n, "반영된 것으로 보입니다. 다른 직원이 동시에 추가했다면 다를 수 있습니다."; `다시 추가` enabled only after refetch and asks to confirm |

## 15. Retrying / Refreshing

Never auto-resend the POST. Reads follow CP5 §2.

## 16. Edge Cases

- Two employees add to the same item at once → both applied; each sees their own response total (may skip numbers) — expected.
- Closing the dialog in UNKNOWN state (after the request settles) → table refetches; status line "재고 추가 결과를 확인하지 못했습니다. 현재 재고를 확인해 주세요."
- `quantity` beyond JS safe integer in GET → decode error, not a rounded number.

## 17. Accessibility

- `<table>` with hidden caption "물품별 현재 재고", `<th scope="col">`, quantity cells include unit text.
- Dialog: title as accessible name; description = item name and current stock; input labelled "추가할 수량 (개)"; preview is `aria-live="polite"`.
- Alerts `role="alert"`; focus to first alert action in UNKNOWN state.

## 18. API / Shared Contract Dependency

`GET` / `POST /api/v1/employee/inventory` (CONFIRMED). No decrement, overwrite or history endpoints.

## 19. TBD / Blocker

None.

## 20. Acceptance Criteria

1. Table shows four items with server quantities, including `0개`.
2. The dialog shows current stock, accepts only a positive integer and previews the new total.
3. Successful add shows the **server-returned** total in the row and status line.
4. Invalid input sends no request.
5. Network loss shows the unknown-result state; nothing is resent until the user refetches and confirms.
6. No UI path lets the user set or reduce stock.
7. 401 → login and back to inventory; 403 → permission state.
8. Keyboard-only: open dialog, type, submit, focus returns to the row button.
