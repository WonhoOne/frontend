# CP2-B — Employee Console Visual Direction

> Status: **COMPLETE — DELEGATED DECISION (2026-11-09)**
> Owner: 김태우 / `WonhoOne/frontend` (execution delegated, see [Frontend Completion Plan §5](../../FRONTEND-COMPLETION-PLAN.md))
> Inputs: [CP0-A](CP0-A-FRONTEND-RUNTIME-INVENTORY.md) reuse inventory, [CP0-C](CP0-C-SCOPE-DEVICE-DEMO-GATE.md) **A PC-only**, [CP1-B](CP1-B-INFORMATION-ARCHITECTURE.md) approved IA, [CP2-A §9](CP2-A-REFERENCE-EVIDENCE-REGISTER.md) evidence cards V1–V6, current tokens [`src/app/styles/tokens.css`](../../../src/app/styles/tokens.css)
> This document decides the **visual language and page composition**. Exact components are CP3, motion/feedback CP4, state machines CP5, per-screen layout CP6.

## 1. Decision summary

**Direction: "Same brand, operational composition."** The Employee Console uses the existing Mister World tokens and primitives unchanged, but composes them for dense, task-first work on a desktop screen.

| Area | Decision |
| --- | --- |
| Tokens | Reuse `--mw-*` tokens as-is. **No new color palette, no second design system.** |
| Typography | `--mw-font-ui` (Pretendard) only. The editorial serif (`--mw-font-editorial`) is **not used** in the console. Numbers use `font-variant-numeric: tabular-nums`. |
| Page heading | `heading-lg` (32px at ≥1024px) for page H1; `heading-sm` (20px) for section titles. No display sizes. |
| Body | Table cells and form inputs `body-md` (16px); secondary meta `body-sm` (14px), color `--mw-text-secondary`. |
| Surfaces | Page background `--mw-canvas`; content in `--mw-surface-elevated` cards with `--mw-border-subtle` and `--mw-radius-md`; elevation only `--mw-elevation-1`. |
| Primary action | Existing charcoal primary `Button` (Customer CTA rule). One primary action per view. |
| Accent | Brass `--mw-accent` only for focus ring and current-nav indicator. Never as a fill for large areas. |
| Theme color | Theme accents (`--mw-theme-*`) only as an 8px dot **beside the Theme title text**. State is never color-only. |
| Chrome | Persistent **top bar** (not a sidebar), separate from Customer header. |
| Width | `--mw-container-main` (1280px) with desktop `--mw-page-gutter`; editor form column max `--mw-container-reading` (760px). |
| Minimum width | Designed and verified at **1280px**; must remain usable down to 1024px; no layout guarantee below (CP0-C A). |
| Controls | Keep `--mw-control-min-target` 44px and `--mw-control-field-height` 48px. Table rows 56px. Density comes from layout, not smaller hit targets. |

## 2. Alternatives considered

| Option | Description | Verdict | Why |
| --- | --- | --- | --- |
| A. Customer look as-is | Editorial serif headings, hero imagery, generous marketing spacing | **Rejected** | Built for browsing; wastes vertical space on a table of products and four stock rows. Imagery has no Backend field (CP0-B). |
| B. Separate admin look | Cool-gray palette and blue primary like Shopify/Square/Wix (V1–V6) | **Rejected** | Creates a second token set to build, test and keep consistent inside one app; team deadline 2026-11-23; brand inconsistency in the demo. |
| **C. Same tokens, operational composition** | Reuse tokens/primitives; change typography scale, density and chrome | **Chosen** | Zero new tokens; reuses tested `Button`, `TextField`, `Dialog`, `Skeleton`, state components (CP0-A); patterns from CP2-A map directly onto it. |

## 3. Chrome — `EmployeeShell`

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Mister World  직원          여행상품   재고 관리                 김직원  로그아웃 │  ← top bar, 64px
├────────────────────────────────────────────────────────────────────────────┤
│ (canvas)                                                                   │
│   [page content, max 1280px]                                               │
```

- Top bar background `--mw-surface-elevated`, bottom `--mw-border-subtle`.
- Left: wordmark "Mister World" + a small "직원" label so the context is never confused with the Customer site (CP1-B §7).
- Center-left: two nav links **여행상품**, **재고 관리**. Current page: `aria-current="page"`, ink text + 2px brass underline.
- Right: signed-in employee name (`body-sm`, secondary) and a quiet `로그아웃` button.
- **Why top bar, not sidebar:** there are exactly two destinations (IA-03); a sidebar would spend ~240px of width that the Product table needs. V1–V4 sidebars serve dozens of sections we do not have.
- No Customer header, Previous Trips popup or Voice control is mounted (IA-06, CP0-A F-A02).

## 4. Page compositions

### 4.1 Product list (`/employee/tours`) — from V1, V2

```text
여행상품  12                                               [ + 새 여행상품 ]
┌──────────────────────────────────────────────────────────────────────────┐
│ 상품명                     테마              스타일별 1인 가격              │
│ 제주 올레 트레킹 5일 →      ● Outdoor Trekking  Classic ₩890,000 · Grand …  │
│ …                                                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

- H1 + muted count (V2); one primary action top-right (V1, V2).
- Native `<table>` in a card. Product name is the row link to edit (V1); no separate Edit button column.
- Theme: dot + the same Theme title the Customer app already shows (`themeDiscoveryPresentations.ts`, e.g. "Outdoor Trekking"), so one Theme has one name across the product. Prices: allowed styles in fixed order Classic → Grand → Premium, KRW via `formatKrw` (e.g. `₩890,000`, same as Customer), right-aligned numbers inside the cell.
- No checkboxes, filters, saved views, thumbnails, status badges (no data or API, CP2-A §9).
- Empty state uses the existing `EmptyState` with a single primary action (V1 empty card).

### 4.2 Product create / edit (`/employee/tours/new`, `/employee/tours/:tourId/edit`) — from V3, V4

```text
여행상품 /                                    ← breadcrumb link (V3)
새 여행상품                                    ← H1 (edit: product name)
┌ 기본 정보 ─────────────────────────────┐
│ 테마 [select]          ← first (V4)     │
│ 상품명 [text]   help text under field   │
│ 설명   [textarea]                       │
└─────────────────────────────────────────┘
┌ 스타일별 1인 가격 ───────────────────────┐
│ Grand   [ 1,200,000 ] 원                │  ← rows appear for the selected Theme only
│ Premium [ 1,800,000 ] 원                │
└─────────────────────────────────────────┘
──────────────────────────────────────────── sticky action bar
                                [취소]  [저장]
```

- Single column, max 760px, section cards with section titles; label above field, one-line help under field (V3, V4).
- Theme selector first; the price section shows exactly the allowed styles for that Theme (V4 type-first + BR-17/21).
- **Save placement (the open CP2-A question): sticky action bar at the bottom of the editor viewport, always visible, with `취소` (secondary) and `저장` (primary).**
  - Rejected V3 dirty-only save bar: on create the form is always "dirty", so the bar would always show anyway; two behaviors for one editor adds complexity.
  - Rejected V4 fixed header Save: places Save at the top while the last field is at the bottom; keyboard users tab through the whole form and then must reverse direction. A bottom bar follows DOM/focus order.
  - Edit mode: `저장` is disabled until a field changes; dirty navigation guard comes from CP5-B.
- No Delete or Duplicate (no API).

### 4.3 Inventory (`/employee/inventory`) — from V6 (adopt), V5 (reject)

```text
재고 관리
┌──────────────────────────────────────────────────────┐
│ 품목            현재 재고                              │
│ 커플 기념 티셔츠      120 개                [재고 추가]  │
│ 건강 인삼 기념품        0 개                [재고 추가]  │
│ 골프공                35 개                [재고 추가]  │
│ 아웃도어 기념품 스카프  48 개                [재고 추가]  │
└──────────────────────────────────────────────────────┘

[재고 추가] → dialog
  골프공 재고 추가
  현재 재고        35 개
  추가할 수량   [   5 ] 개
  추가 후 재고     40 개    ← preview, recalculated from server value on success
                 [취소] [추가]
```

- Four fixed rows; current quantity right-aligned, tabular numbers; zero shown as `0 개`, not empty.
- Row labels are display text for the canonical `itemType` values, taken from the item wording in the shared [Product Catalog](https://github.com/WonhoOne/docs/blob/main/requirements/product-catalog.md) (커플 기념 티셔츠, 건강 인삼 기념품, 골프공, 아웃도어 기념품 스카프). Quantities in the sketch are illustrative.
- **No editable quantity in the table cell** (rejects V5 overwrite semantics).
- Each row has a secondary `재고 추가` button that opens the existing `Dialog` primitive with the V6 sequence: current → amount to add → resulting total → cancel / confirm.
- Dialog chosen over V6's anchored popover because the accessible modal `Dialog` already exists (CP0-A) and gives focus trap/return for free; a new popover primitive is not justified for four rows. CP6-E may still revise placement, not semantics.
- After a successful POST the table shows the **server-returned** quantity; preview text is never treated as truth (CP0-B §4).

### 4.4 Employee login (`/employee/login`)

- Centered card at `--mw-container-auth` (520px) on `--mw-canvas`, wordmark + "직원 로그인", two fields, primary `로그인`.
- No signup link (FR-01: no public Employee signup).

## 5. What CP2-B does not decide

- Component APIs, new primitives and their props → **CP3**
- Save/feedback toasts, loading and transition timing → **CP4**
- Dirty guard, 401/403/409/422, ambiguous POST states → **CP5**
- Final copy, field order details, per-screen states → **CP6**

## 6. Gate

- [x] Alternatives compared with reasons (§2)
- [x] Direction expressed with existing tokens only; no new palette
- [x] Chrome, list, editor, inventory and login compositions defined from CP2-A evidence
- [x] Open CP2-A question (save placement) decided with reasons
- [x] PC-only scope (CP0-C A) respected: 1280px design, 1024px usable floor
- [x] DELEGATED DECISION recorded (owner delegated execution 2026-11-09)

**Next: CP3-A — audit Customer primitives for table, form, dialog and nav use in the Employee compositions above.**
