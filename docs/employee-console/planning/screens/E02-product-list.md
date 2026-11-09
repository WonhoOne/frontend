# [E02] Product List

> Route: `/employee/tours` (Employee default landing)
> Status: **READY** — v1, 2026-11-09 (CP6-B, delegated decision)
> Upstream: [CP1-A F02](../CP1-A-OPERATOR-TASK-FLOWS.md), [CP1-B IA-02/IA-04](../CP1-B-INFORMATION-ARCHITECTURE.md), [CP2-A V1/V2](../CP2-A-REFERENCE-EVIDENCE-REGISTER.md), [CP2-B §4.1](../CP2-B-VISUAL-DIRECTION.md), [CP3](../CP3-COMPONENT-REUSE-AND-CONTRACTS.md), [CP4 §3](../CP4-MOTION-AND-FEEDBACK.md), [CP5 §1–§2](../CP5-DATA-AND-MUTATION-STATES.md)

## 1. Screen Purpose

Shows every TourProduct the company sells, with its Theme and per-style prices, so an employee can check the catalog at a glance and start creating or editing a product. It is the console's home (no dashboard, IA-02).

## 2. Route / Entry Conditions

- Entry: login default, nav 여행상품, breadcrumb from E03/E04, after successful create (E03).
- Direct URL allowed. EMPLOYEE required (E01 guard).
- Exit: product name → `/employee/tours/:id/edit`; `+ 새 여행상품` → `/employee/tours/new`; nav 재고 관리.

## 3. User Goal

Primary: find a product and open it, or start a new one.
Secondary: confirm a product just created is in the list with the right prices.

## 4. Required Data

- [CONFIRMED] `GET /api/v1/employee/tours` → `TourProductResponse[]` sorted by `id` ascending: `id`, `theme`, `name`, `description`, `availableStyles`, `stylePrices[{ style, amount, currency:'KRW' }]`.
- [DECIDED] Query `['employee','tour-products']`, private, `staleTime` 0 (CP5 §1).
- `description` is not shown in the list.

## 5. Desktop Layout

- Shell E00; `PageContainer variant="main"`.
- Header row: H1 "여행상품" + muted count (e.g. "12") on the left; primary `+ 새 여행상품` on the right (V1, V2).
- Status line slot under the header (CP4).
- Card with native table, full container width.

| Column | Content | Width / alignment |
| --- | --- | --- |
| 상품명 | Product name as link (`body-md`, ink); under it `ID 12` (`body-sm`, secondary) | flexible, left |
| 테마 | `ThemeLabel` (dot + title) | ~200px, left |
| 스타일별 1인 가격 | `StylePriceList`: one line per allowed style, "Classic ₩890,000" in order Classic → Grand → Premium | ~280px, numbers right-aligned in a 2-column mini grid |

Row height ≥ 56px; rows separated by `--mw-border-subtle`. Order = Backend order (ID ascending; newest at the bottom).

## 6. Device scope

PC-only. At 1024px the price column wraps to two lines per row; no horizontal scroll at ≥1024px.

## 7. Exact Section Order

Header (H1 + count, primary action) → status line → [refresh note] → table (caption visually hidden: "여행상품 목록") or empty / error state.

## 8. Component Composition

`EmployeeShell`, `EmployeePageHeader` (title, count, actions), `ProductTable`, `ThemeLabel`, `StylePriceList`, `Button`, `EmptyState`, `SectionError`, `Skeleton`, `RefreshIndicator`.

## 9. Primary / Secondary CTA

Primary: `+ 새 여행상품` (link styled as primary button). Secondary: each product name link. No per-row buttons, no bulk actions, no delete (CP2-A rejects).

## 10. Interaction Rules

- Whole name text is the link target; the row itself is not clickable (keeps native link semantics, middle-click works).
- Arriving from a successful create (navigation state carries the new `id`): status line "‘{name}’ 여행상품을 만들었습니다.", that row highlighted (CP4 §2) and scrolled into view (`block: 'nearest'`, instant when reduced motion).
- No client sort/filter (≤ tens of products, no API).

## 11. Motion

Route entry (existing). Row highlight after create (CP4 §2, reduced-motion static tint).

## 12. Loading

First load: header renders immediately with count hidden; table skeleton 5 rows matching row height. Background refetch: keep table, show `RefreshIndicator`.

## 13. Empty

`EmptyState` title "아직 여행상품이 없습니다", text "첫 여행상품을 만들어 테마와 스타일별 가격을 등록하세요.", action `+ 새 여행상품`. Header action stays too (same target).

## 14. Error

| Case | UI |
| --- | --- |
| First load network/5xx | `SectionError` "여행상품을 불러오지 못했습니다" + `다시 시도` |
| Refetch fails with data | Keep table; inline note "최신 정보를 불러오지 못했습니다" + `다시 시도` |
| 401 | Session-expiry flow → E01 with `returnTo=/employee/tours` |
| 403 | E01 permission state |
| Decode error (`ContractMappingError`) | `SectionError` "데이터 형식이 올바르지 않습니다"; no partial table |

## 15. Retrying / Refreshing

Refetch on mount, window focus, reconnect; 1 auto retry for network/5xx only (CP5 §2). Manual `다시 시도`.

## 16. Edge Cases

- A product has a style price for a style not in `availableStyles` → decode error (contract invariant, CP0-B); never render partial prices.
- Very long product name (≤255) → wraps; ID line stays.
- Product created by another employee appears on next refetch; no live updates.

## 17. Accessibility

- `<table>` with visually hidden `<caption>`, `<th scope="col">`; price list inside cell uses a `<dl>` or plain text lines, not color.
- Count read as part of heading region: H1 "여행상품" with adjacent text "총 12개" visually rendered as "12" plus visually hidden "총 …개".
- Status line `role="status"`.
- Keyboard: Tab reaches primary action then each product link in order.

## 18. API / Shared Contract Dependency

`GET /api/v1/employee/tours` (CONFIRMED). Theme title via `tourThemeTitle` public export (CP3 §2.3).

## 19. TBD / Blocker

None.

## 20. Acceptance Criteria

1. List shows every product returned by the API in ID order, with Theme title and exactly the allowed style prices formatted as `₩n`.
2. Product name link opens `/employee/tours/:id/edit`; `+ 새 여행상품` opens `/employee/tours/new`.
3. Empty response shows the empty state with a create action.
4. First-load failure shows `SectionError` with working retry; refetch failure keeps existing rows.
5. After create, the new row is highlighted and announced by the status line.
6. 401 → login with `returnTo`; 403 → permission state.
7. Malformed payload shows the format error and renders no rows.
8. Keyboard and screen reader can reach and identify every product link and its prices.
