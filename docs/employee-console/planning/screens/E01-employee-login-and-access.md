# [E01] Employee Login, Entry Forwarding and Access States

> Routes: `/employee`, `/employee/login`, unknown `/employee/*`; shell E00 for all authenticated `/employee/*`
> Status: **READY** — v1, 2026-11-09 (CP6-A, delegated decision)
> Upstream: [CP1-A F01/F07](../CP1-A-OPERATOR-TASK-FLOWS.md), [CP1-B §3–§4](../CP1-B-INFORMATION-ARCHITECTURE.md), [CP2-B §3, §4.4](../CP2-B-VISUAL-DIRECTION.md), [CP3](../CP3-COMPONENT-REUSE-AND-CONTRACTS.md), [CP4](../CP4-MOTION-AND-FEEDBACK.md), [CP5 §3.5](../CP5-DATA-AND-MUTATION-STATES.md)

## 1. Screen Purpose

The single door into the Employee Console. It signs in a Backend-provisioned EMPLOYEE through the shared login API, routes them to their work, and keeps everyone else out with a clear explanation instead of a loop. It also owns the console chrome (E00) and the "no access" and "page not found" states inside the Employee area.

## 2. Route / Entry Conditions

| Route | Behavior (DECIDED, CP1-B) |
| --- | --- |
| `/employee` | No UI. Anonymous → `/employee/login`. EMPLOYEE → `/employee/tours`. CUSTOMER session → permission state (§14). Uses `replace` navigation |
| `/employee/login` | Public. If already EMPLOYEE → `returnTo` or `/employee/tours` (replace) |
| `/employee/login?returnTo=<path>` | `returnTo` accepted only if it starts with `/employee/`, is not `/employee/login`, contains no `//`, no scheme, no backslash; otherwise ignored |
| any protected `/employee/*` while anonymous | → `/employee/login?returnTo=<current path>` (replace) |
| unknown `/employee/*` (authenticated EMPLOYEE) | Employee not-found state inside shell |

Exit: successful login → validated `returnTo` or `/employee/tours`. Browser Back from the destination does not return to the login form (login used `replace`).

## 3. User Goal

Primary: sign in and land on the product list (or the page they were sent from).
Secondary: understand why access is refused (wrong account, session expired) and recover.

## 4. Required Data

- [CONFIRMED] `POST /api/v1/auth/login` `{ loginId, password }` → `{ accessToken, tokenType: 'Bearer', expiresIn, user: { id, role, name } }` (CP0-B §3)
- [CONFIRMED] `role` ∈ `CUSTOMER | EMPLOYEE`
- [DECIDED] Shell shows `user.name`
- Token stays in the existing memory-only session (no storage). Reload = signed out.

## 5. Desktop Layout

- Login: canvas background; centered card `PageContainer variant="auth"` (520px); wordmark "Mister World" + "직원" label above H1 "직원 로그인".
- Shell E00 (authenticated): 64px top bar — left wordmark + "직원"; nav 여행상품, 재고 관리; right employee name (`body-sm`, secondary) + quiet `로그아웃`. Below: `<main>` with page content, `PageContainer variant="main"`.
- Permission and not-found states render inside the shell (if EMPLOYEE) or inside the login card frame (if not EMPLOYEE).

## 6. Device scope

PC-only (CP0-C A). Designed at 1280px. At 1024px: top bar keeps one row; employee name truncates with ellipsis before nav wraps. Below 1024px: not an acceptance target.

## 7. Exact Section Order

Login: wordmark/label → H1 "직원 로그인" → status notice (if any) → error alert (if any) → 아이디 → 비밀번호 → `로그인` → help line "직원 계정은 관리자가 발급합니다." (no signup link).

Shell: skip link → top bar → `<main>`.

## 8. Component Composition

`EmployeeLoginForm` (`TextField` ×2, `Button`), `EmployeeShell`, `EmployeePageHeader` (for permission / not-found H1), existing `RouteFocusManager`. No `GlobalHeader`, `TransactionHeader`, `PostLoginPreviousTrips`, `CustomerVoiceControl`.

## 9. Primary / Secondary CTA

- Login: primary `로그인` (submit).
- Permission state: primary `직원 계정으로 다시 로그인` (signs out current session, then shows login); secondary link `고객 홈으로` (`/`).
- Not-found: primary link `여행상품 목록으로`.
- Shell: quiet `로그아웃`.

## 10. Interaction Rules

- Enter submits. Fields `required`; `autocomplete="username"` and `"current-password"`; password `type="password"`.
- Client check: both fields non-blank → otherwise field errors, no request.
- Submit → `로그인` `isLoading`; inputs stay editable but submit is blocked until response.
- Response EMPLOYEE → store session (existing mechanism), navigate. Response CUSTOMER → **discard the new session immediately**, stay on login, show alert "직원 계정이 아닙니다. 직원 계정으로 로그인해 주세요." (DECIDED: a Customer session is never kept from the Employee login).
- Sign-out (shell): if current page is dirty → CP6-F dirty confirm first; then clear session + private caches → `/employee/login`, status notice "로그아웃했습니다."
- Customer pages are unchanged: Customer `/login` still rejects EMPLOYEE (existing behavior).

## 11. Motion

Existing route entry motion only (CP4 §2). No motion on the login card.

## 12. Loading

Login button loading only. `/employee` forwarding renders nothing visible (instant redirect).

## 13. Empty

N/A.

## 14. Error

| Case | UI |
| --- | --- |
| 401 `LOGIN_FAILED` (CONFIRMED, REST v0.2 error table) | Alert "아이디 또는 비밀번호가 올바르지 않습니다." Password field cleared, focus to alert |
| 422 field errors | Inline per field + summary |
| Network / 5xx | Alert "로그인하지 못했습니다. 잠시 후 다시 시도해 주세요." Values kept |
| Logged in as CUSTOMER (entering any `/employee/*`) | Permission state: H1 "직원 전용 화면입니다", text "현재 고객 계정으로 로그인되어 있습니다.", CTAs per §9 |
| Employee API 403 while signed in as EMPLOYEE | Same permission state inside shell, text "이 작업을 할 권한이 없습니다." |
| Arrived after session expiry | Notice (`role="status"`) "세션이 만료되어 다시 로그인해야 합니다." |

Login error copy never reveals whether the ID exists. Backend `message` text is never shown (stable `code` only).

## 15. Retrying / Refreshing

User re-submits. No automatic retry of login (mutation retry 0).

## 16. Edge Cases

- Reload on any `/employee/*` → memory session gone → login with `returnTo` → back to the same page; form drafts are not restored (CP5 §3.5).
- `returnTo` pointing to Customer route or external URL → ignored.
- EMPLOYEE opens a Customer private page (e.g. `/my-trips`) → existing Customer behavior must not treat EMPLOYEE as CUSTOMER (CP7 role audit).
- Two tabs: sign-out in one tab does not sign out the other (memory session per tab); the other tab gets 401 on next request → E01 expiry flow.
- Token `expiresIn` elapsed → next request 401 → expiry flow.

## 17. Accessibility

- One H1 per state. Skip link to `<main>`. Top bar is `<header>` with `<nav aria-label="직원 메뉴">`; active link `aria-current="page"`.
- Error alert `role="alert"`; expiry/sign-out notice `role="status"`.
- Focus: route change → `<main>` (RouteFocusManager); failed submit → alert.
- All controls ≥ 44px target; visible focus (`--mw-focus-outline`).

## 18. API / Shared Contract Dependency

`POST /api/v1/auth/login` only (CONFIRMED). No Employee signup, no logout or refresh endpoint (v0.2). EMPLOYEE accounts come from `EmployeeBootstrap` (Backend, DEC-C03 open for the demo DB).

## 19. TBD / Blocker

- DEC-C03: an EMPLOYEE account in the demo database (Backend/demo operator). Not a design blocker.

## 20. Acceptance Criteria

1. Anonymous `/employee` → `/employee/login`; EMPLOYEE `/employee` → `/employee/tours`.
2. EMPLOYEE login lands on validated `returnTo` or `/employee/tours`; Back does not show the login form.
3. CUSTOMER credentials on `/employee/login` show the wrong-account alert and leave **no** session.
4. CUSTOMER session visiting `/employee/tours` sees the permission state, not a redirect loop.
5. Invalid `returnTo` values (`//evil`, `https://…`, `/my-trips`, `/employee/login`) are ignored.
6. Shell never renders Customer header, Previous Trips popup or Voice control.
7. Sign-out clears session and Employee caches and returns to login with the status notice.
8. Reload on `/employee/inventory` → login → back on `/employee/inventory`.
9. Keyboard-only: tab order wordmark → nav → name → 로그아웃 → main; login completes with Enter.
