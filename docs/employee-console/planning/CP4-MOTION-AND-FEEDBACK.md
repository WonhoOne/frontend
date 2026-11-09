# CP4 — Employee Console Motion and Feedback

> Status: **COMPLETE — DELEGATED DECISION (2026-11-09)**
> Owner: 김태우 / `WonhoOne/frontend` (execution delegated, [Frontend Completion Plan §5](../../FRONTEND-COMPLETION-PLAN.md))
> Inputs: [CP2-B](CP2-B-VISUAL-DIRECTION.md), [CP3](CP3-COMPONENT-REUSE-AND-CONTRACTS.md), existing motion tokens [`src/shared/motion/motion.css`](../../../src/shared/motion/motion.css), [`RouteMotionBoundary`](../../../src/app/router/RouteMotionBoundary.tsx), Master Plan §28 Motion Baseline
> Scope: how the console moves and how it tells the employee what happened. State machines are CP5; copy per screen is CP6.

## 1. Principle

An operations console must answer three questions immediately: **did it save, what is the value now, what do I do next.** Motion only supports that; it never delays input or hides a result.

## 2. Motion

| Situation | Behavior | Token | Reduced motion |
| --- | --- | --- | --- |
| Route change inside Employee area | Reuse `RouteMotionBoundary` entry motion as-is (small translateY + fade, latest route wins) | existing | existing reduce rule (no transform) |
| Dialog open / close | Reuse `Dialog` default | existing | existing |
| Sticky `EditorActionBar` | **No animation**; always present | — | — |
| Row highlight after create / stock add | Row background `--mw-accent-faint`, fades to transparent | `--mw-motion-cinematic` (820ms) after a 1.2s hold | Static tint, removed on next user interaction or navigation |
| Button loading | `Button isLoading` existing spinner/label | existing | existing |
| Skeleton | Existing `Skeleton` | existing | existing (no shimmer) |

Not used in the console: parallax, editorial reveal (`Reveal`), digit roll, spring/bounce. No new motion tokens.

## 3. Feedback channels

There is **no toast system**, and CP4 does not add one. Feedback stays where the employee is looking.

| Event | Channel | Accessibility |
| --- | --- | --- |
| Product created (201) | Navigate to list; **page status line** under the H1: "‘{상품명}’ 여행상품을 만들었습니다."; new row highlighted | Status line in `role="status"` (polite); focus moves to `<main>` by `RouteFocusManager` |
| Product updated (200) | Stay on editor (IA-08 decision: stay, so the employee can verify the saved values; screen detail in CP6-D); status line above the form: "변경 사항을 저장했습니다."; `저장` returns to disabled (not dirty) | `role="status"` |
| Stock added (200) | Dialog closes; row shows the **server** quantity; row highlight; status line under the H1: "{품목} 재고를 {n}개 추가했습니다. 현재 {total}개" | `role="status"`; focus returns to that row's `재고 추가` button (Dialog default) |
| Field validation (client or 422) | Inline `error` on each field (`TextField`/`SelectField`/`TextAreaField`) **plus** an error summary box at the top of the form listing each problem as a link to its field | Summary gets focus on failed submit; `role="alert"` |
| 409 Theme locked | Alert box above the form with the explanation and the action "테마 되돌리기"; all other edits kept | `role="alert"`; focus to alert |
| 401 | Navigate to `/employee/login` with return target; one-line notice on login page "세션이 만료되어 다시 로그인해야 합니다." | notice in `role="status"` |
| 403 | Full-page permission state inside Employee chrome (no nav items that would 403 again) | H1 announces state |
| GET failure | Existing `SectionError` with retry in the failed section only; already-loaded content stays (Master Plan §16) | existing |
| Network unknown on POST/PUT | Alert in context (form top / dialog) stating the result is unknown, plus the CP5 recovery action; **never** a success or failure claim | `role="alert"` |
| Offline | Existing `OfflineBanner` | existing |

Status lines are cleared on the next navigation or the next submit. Only one status line per page.

## 4. Focus rules

1. Route change: focus the `<main id="main-content">` landmark (existing `RouteFocusManager`; corrected 2026-11-09 from "H1" after reading the source).
2. Failed submit: focus the error summary (or the single alert for 409 / unknown result).
3. Dialog close: focus returns to the opener button (existing `Dialog`).
4. After create → list: `<main>` receives focus (route change); the status line is announced politely.
5. Never move focus on background refresh.

## 5. Interaction timing

- Buttons disable **immediately** on submit (`isLoading`), preventing double POST (CP0-B: no idempotency key).
- No artificial delays; no optimistic success for writes. All three writes (create, update, stock add) are **pessimistic**: UI shows success only after the server response.
- Dialog for stock add blocks Escape / outside click **while the request is in flight** (existing `closeOnEscape` / `closeOnInteractOutside` props). The visible close control stays enabled (Dialog contract, CP3 reuse as-is). Closing does not cancel the request; the outcome is then reported through the page status line (CP6-G G1).

## 6. Gate

- [x] Reuses existing motion tokens, route motion, Dialog and Button behavior; nothing new added
- [x] Reduced-motion behavior defined for the only new effect (row highlight)
- [x] Every success, error and unknown outcome has a visible channel and an ARIA role
- [x] Focus rule for each transition
- [x] Writes pessimistic; double-submit prevented at the button

**Next: CP5-A — GET lifecycle, CP5-B — mutation lifecycle.**
