# CP9 — Employee Accessibility and Device Acceptance (PC-only)

> Status: **COMPLETE — DELEGATED DECISION (2026-11-09)**
> Inputs: [CP0-C DEC-C01 A PC-only, DEC-C06 desktop Chrome](CP0-C-SCOPE-DEVICE-DEMO-GATE.md), [CP2-B](CP2-B-VISUAL-DIRECTION.md), screen specs [E01](screens/E01-employee-login-and-access.md)–[E05](screens/E05-inventory.md) §17, Master Plan §26–§27

## 1. Device and browser matrix

| Item | Required (acceptance) | Not required |
| --- | --- | --- |
| Browser | Desktop Chrome (current stable); automated: Playwright Chromium | Safari, Firefox, Edge (expected to work, not gated) |
| Viewports | **1280×800** (primary), **1440×900**, **1024×768** (floor) | < 1024px, tablets, phones |
| Zoom | 200% at 1280px: every task still completable (reflow to 640 CSS px wide is **not** required for PC-only; horizontal scroll inside the product table is allowed at 200% only) | 400% reflow |
| Input | Mouse and keyboard | Touch |

## 2. Accessibility acceptance (per screen)

Applies to E00–E05 and both dialogs.

| # | Requirement | How verified |
| --- | --- | --- |
| A1 | Exactly one `<h1>` per page; landmarks `<header>`, `<nav aria-label="직원 메뉴">`, `<main id="main-content">` | RTL + Playwright |
| A2 | Skip link "본문으로 건너뛰기" reaches `<main>` | Playwright keyboard |
| A3 | Every input has a visible label; required marked; errors linked by `aria-describedby`; `aria-invalid` on error | RTL |
| A4 | Error summary / alerts use `role="alert"` and receive focus on failed submit | RTL |
| A5 | Success messages use `role="status"` and do not steal focus | RTL |
| A6 | Tables: `<caption>` (visually hidden), `<th scope="col">`, quantity/price text includes units | RTL |
| A7 | Dialogs: accessible name = title, focus trapped, focus returns to opener, visible close control | RTL + Playwright |
| A8 | Visible focus on every interactive element (`--mw-focus-outline`) | manual at 1280px |
| A9 | Interactive targets ≥ 44×44 px | manual + CSS review |
| A10 | Theme shown by text, not only the color dot; status never color-only | manual |
| A11 | Text contrast ≥ 4.5:1 (body), ≥ 3:1 (large text, focus ring) using existing tokens | token check: ink `#191918` and secondary `#6E6961` on surfaces `#FBF9F5`/`#FFFDFC` |
| A12 | `prefers-reduced-motion`: no transform motion; row highlight static | Playwright with emulated media |
| A13 | Keyboard-only completion of EJ01–EJ05 (CP6-F §6) | Playwright EJ10 |
| A14 | No automated axe scan: `@axe-core/*` is not a project dependency (checked `package.json` 2026-11-09) and is not added for this scope (Master Plan §22). A1–A13 results are recorded per screen in the W3 verification report | manual checklist + the automated checks above |

## 3. Layout acceptance

| # | Check | Widths |
| --- | --- | --- |
| L1 | Top bar stays one row; name truncates before nav wraps | 1024, 1280, 1440 |
| L2 | No page-level horizontal scroll | 1024, 1280, 1440 |
| L3 | Editor column 760px centered; sticky action bar does not cover the last field when scrolled to the end | 1024, 1280 |
| L4 | Stock dialog fully visible without scrolling | 1024×768 |

## 4. Out of scope (documented, not defects)

Phone/tablet layouts, touch gestures, screen-reader testing on mobile, RTL languages, dark theme.

## 5. Gate

- [x] Device and browser matrix fixed from the owner decision
- [x] Accessibility requirements numbered and tied to a verification method
- [x] Layout checks at the three required widths
- [x] Non-goals recorded so they are not raised as defects

**Next: CP10 — Employee QA acceptance matrix.**
