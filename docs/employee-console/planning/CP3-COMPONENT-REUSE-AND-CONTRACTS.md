# CP3 — Component Reuse Audit (CP3-A) and Employee Component Contracts (CP3-B)

> Status: **COMPLETE — DELEGATED DECISION (2026-11-09)**
> Owner: 김태우 / `WonhoOne/frontend` (execution delegated, [Frontend Completion Plan §5](../../FRONTEND-COMPLETION-PLAN.md))
> Inputs: [CP0-A](CP0-A-FRONTEND-RUNTIME-INVENTORY.md) inventory, [CP2-B](CP2-B-VISUAL-DIRECTION.md) compositions, architecture rules [CP2 §20 Cross-Feature Dependency, §21 Shared Promotion](../../implementation/checkpoints/CP2-FRONTEND-ARCHITECTURE-PLAN.md)
> Source snapshot: frontend/main after #51 (`f8eae8d`)

## 1. CP3-A — Audit of existing primitives against CP2-B

Every row was checked against the actual source file on 2026-11-09.

| Existing | Source | Actual API (verified) | Employee use | Verdict |
| --- | --- | --- | --- | --- |
| `Button` | `src/shared/ui/Button/Button.tsx` | variants `primary / secondary / quiet / destructive`; sizes `small / medium / large`; `isLoading` + `loadingLabel` sets `aria-busy` and disables | All actions; `isLoading` for 저장 / 추가 / 로그인 | **REUSE as-is** |
| `TextField` | `src/shared/ui/TextField/TextField.tsx` | `label` (visible), `helperText`, `error` → `aria-invalid` + `aria-describedby`; required `*` | 상품명, login ID / password, KRW amount, quantity | **REUSE as-is** |
| `Dialog` | `src/shared/ui/Dialog/Dialog.tsx` | Radix modal; `title`, `description`, visible close (`closeLabel`), `closeOnEscape`, `closeOnInteractOutside`, focus return to opener | 재고 추가 dialog; leave-with-unsaved-changes confirm | **REUSE as-is**; stock dialog sets `closeOnInteractOutside={false}` while submitting |
| `Skeleton`, `LoadingState` | `src/shared/ui/Skeleton`, `src/app/state/LoadingState.tsx` | geometry skeleton; `label` for SR | table row skeletons, editor skeleton | **REUSE** |
| `EmptyState` | `src/app/state/EmptyState.tsx` | `title`, `children`, `action` slot | empty Product list with `+ 새 여행상품` | **REUSE** |
| `SectionError` | `src/app/state/SectionError.tsx` | `title`, `children`, `onRetry`, `retryLabel`, `retryingLabel`, `isRetrying` | GET failures (list, inventory, edit load) | **REUSE** |
| `OfflineBanner`, `RefreshIndicator` | `src/app/state/` | app-level indicators | offline + background refresh | **REUSE** |
| `PageContainer` | `src/shared/ui/PageContainer` | variants `wide / main / transaction / reading / auth` | `main` (list, inventory), `reading` (editor column), `auth` (login) | **REUSE** |
| `AppErrorBoundary`, `RouteFocusManager`, `RouteRuntime` | `src/app/errors`, `src/app/router` | crash boundary, focus/scroll on navigation | Employee route subtree | **REUSE** (confirm wiring in CP7) |
| `PageShell` | `src/app/shell/PageShell.tsx` | H1 at `heading-xl` (40px desktop), optional editorial `eyebrow` | — | **DO NOT USE**: wrong scale for console (CP2-B uses `heading-lg`), no actions slot |
| `GlobalHeader`, `TransactionHeader` | `src/app/shell/` | Customer nav / reservation chrome | — | **DO NOT USE** (CP0-A F-A02, IA-06) |
| `OptionCard` | `src/shared/ui/OptionCard` | visual selection card, not a form control | — | **DO NOT USE**: Theme needs a native select |
| `BottomSheet` | `src/shared/ui/BottomSheet` | mobile sheet | — | **DO NOT USE** (PC-only, CP0-C A) |
| `ImageFrame` | `src/shared/ui/ImageFrame` | image with fallback | — | **DO NOT USE** (no image field in contract) |
| KRW formatting | duplicated `Intl.NumberFormat('ko-KR', …)` in 5 files: `publicConfigurePrice.ts`, `PreviousTripsPopup.tsx`, `ReservationDetailPage.tsx`, `ReservationSuccessPage.tsx`, `MyTripsPage.tsx` | — | prices in list, editor helper, inventory counts | **PROMOTE** a shared formatter (§2.1) |
| Theme title | `src/features/tour-discovery/themeDiscoveryPresentations.ts` (`title: 'Outdoor Trekking'` …) | inside a Customer editorial presentation object | Theme label in list and editor | **EXPOSE** via `tour-discovery` public API (§2.3) |

**Gaps confirmed:** no native `<select>` wrapper, no `<textarea>` wrapper, no table styling, no Employee chrome, no page header with an actions slot. (`<select>` exists only in `src/mocks/DevScenarioSwitcher.tsx`, which is dev-only.)

## 2. CP3-B — New pieces and their contracts

Rules applied: smallest set that renders CP2-B; no generic DataTable/Form framework (Master Plan §7 "small duplication > wrong abstraction"); shared only when the CP2 §21 promotion rule holds.

### 2.1 Shared additions (`src/shared/`)

| Piece | Location | Contract | Why shared (CP2 §21) |
| --- | --- | --- | --- |
| `formatKrw(amount: number): string` | `shared/lib/formatKrw.ts` | `Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 })` output; throws on non-safe-integer input | Already used in 5 Customer places + Employee; currency formatting carries no Mister World business meaning. Customer call sites may migrate in W4; not required for Employee. |
| `SelectField` | `shared/ui/SelectField/` | Same accessibility contract as `TextField`: visible `label`, `helperText`, `error` → `aria-invalid` + `aria-describedby`; renders native `<select>`; options passed as children | Generic native control, sibling of `TextField`; used by Product create and Product edit pages |
| `TextAreaField` | `shared/ui/TextAreaField/` | Same contract as `TextField` around native `<textarea>`; `rows` prop; optional character counter `maxLength` display | Same as above (description, max 2000 chars per CP0-B) |

### 2.2 Employee-only pieces (not shared)

Final file locations follow CP7 module ownership; names and responsibilities are fixed here.

| Piece | Responsibility | Key contract / states |
| --- | --- | --- |
| `EmployeeShell` | Top bar (wordmark + "직원", nav 여행상품 / 재고 관리, employee name, 로그아웃) and `<main id>` landmark for the Employee route subtree | `aria-current="page"` on active nav; skip link target; renders **no** Customer chrome, Previous Trips or Voice |
| `EmployeePageHeader` | H1 (`heading-lg`), optional muted count, optional breadcrumb link, actions slot (right) | One H1 per page; count rendered as text, e.g. `여행상품 12` |
| `ProductTable` | Native `<table>` with `<caption>` (visually hidden), columns 상품명 (link) / 테마 / 스타일별 1인 가격 | `<th scope="col">`; name cell is the only interactive element per row |
| `ThemeLabel` | 8px Theme dot + Theme title text | Dot is `aria-hidden`; text always present (never color-only) |
| `StylePriceList` | Read-only "CLASSIC 890,000원 · GRAND …" in fixed style order | Uses `formatKrw`; numbers `tabular-nums` |
| `ProductForm` | Theme `SelectField` first, 상품명 `TextField`, 설명 `TextAreaField`, one KRW field per allowed style | Theme change re-renders price rows for the new allowed set (CP5 decides value carry-over); field errors mapped from `fieldErrors[]` by field path |
| `KrwAmountField` | `TextField` with `inputMode="numeric"`, suffix "원", helper shows formatted amount | Digits only; positive integer; never sends formatted text |
| `EditorActionBar` | Sticky bottom bar inside editor: `취소` (secondary), `저장` (primary, `isLoading` while saving) | Edit mode: `저장` disabled until dirty; DOM order after last field |
| `InventoryTable` | Four fixed rows: 품목 / 현재 재고 / `재고 추가` (secondary button per row) | Quantity right-aligned, `tabular-nums`, `0 개` shown |
| `StockAddDialog` | `Dialog` content: 현재 재고 (read-only) → 추가할 수량 (`TextField`, numeric) → 추가 후 재고 (preview) → `취소` / `추가` | Preview only; after 200 the table shows the server quantity; during submit Escape/outside close is blocked, close button stays visible |
| `EmployeeLoginForm` | `TextField` loginId, password; primary `로그인`; no signup link | `autocomplete="username"` / `"current-password"` |

### 2.3 Cross-feature dependency (to justify in the PR, CP2 §20)

- Employee code needs the Customer-visible Theme title so one Theme has one name.
- Decision: add a named export `tourThemeTitle(theme)` to `src/features/tour-discovery/index.ts`, backed by the existing presentation titles. Employee imports only that public function. No reverse dependency, no private file import.

### 2.4 Explicitly not built

Generic `DataTable`, column sorting/filtering, bulk selection, pagination, toast system (feedback channel decided in CP4), side navigation, dark theme, new tokens.

## 3. Gate

- [x] Every reused primitive verified against current source with its real API
- [x] Customer-specific chrome and mobile-only primitives excluded with reasons
- [x] New shared pieces pass the CP2 §21 promotion rule
- [x] Employee pieces each have one responsibility and an accessibility contract
- [x] One cross-feature public dependency identified and justified
- [x] No new tokens or design system

**Next: CP4 — operational motion and feedback.**
