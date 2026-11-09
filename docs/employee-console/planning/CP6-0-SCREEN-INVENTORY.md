# CP6-0 — Employee Screen Inventory and Spec Template

> Status: **COMPLETE — DELEGATED DECISION (2026-11-09)**
> Owner: 김태우 / `WonhoOne/frontend` (execution delegated, [Frontend Completion Plan §5](../../FRONTEND-COMPLETION-PLAN.md))
> Inputs: [CP1-B](CP1-B-INFORMATION-ARCHITECTURE.md) approved routes, [CP2-B](CP2-B-VISUAL-DIRECTION.md), [CP3](CP3-COMPONENT-REUSE-AND-CONTRACTS.md), [CP4](CP4-MOTION-AND-FEEDBACK.md), [CP5](CP5-DATA-AND-MUTATION-STATES.md)

## 1. Screen inventory

| ID | Screen / surface | Route | Spec | CP | Status |
| --- | --- | --- | --- | --- | --- |
| E00 | Employee shell (top bar, main landmark) | wraps all authenticated `/employee/*` | [E01 §8, CP6-F §2](screens/E01-employee-login-and-access.md) | CP6-A | READY |
| E01 | Employee login + entry forwarding + permission / not-found states | `/employee`, `/employee/login`, unknown `/employee/*` | [E01](screens/E01-employee-login-and-access.md) | CP6-A | READY |
| E02 | Product list | `/employee/tours` | [E02](screens/E02-product-list.md) | CP6-B | READY |
| E03 | Product create | `/employee/tours/new` | [E03](screens/E03-product-create.md) | CP6-C | READY |
| E04 | Product edit | `/employee/tours/:tourId/edit` | [E04](screens/E04-product-edit.md) | CP6-D | READY |
| E05 | Inventory + stock add dialog | `/employee/inventory` | [E05](screens/E05-inventory.md) | CP6-E | READY |
| — | Cross-screen journeys, guards, sign-out | all | [CP6-F](CP6-F-CROSS-SCREEN-JOURNEYS.md) | CP6-F | READY |

No other Employee screens exist in v0.2 scope (CP0-C §4 non-goals). Create and edit are separate routes (IA-04) that share `ProductForm` (CP3).

"READY" means the screen can be built without guessing UX. It does **not** mean Backend integration is verified (that is W3 evidence).

## 2. Spec template

Employee specs use the Customer [screen template](../../planning/screens/_SCREEN-TEMPLATE.md) with its 20 headings in the same order, with one documented change:

| # | Heading | Employee rule |
| --- | --- | --- |
| 6 | Mobile Layout | Replaced by **"Device scope"**: N/A for phone/tablet (CP0-C A, PC-only). States only the behavior between 1024px and 1280px. |

Every spec header also states: route, status, version/date, upstream CP links. Every decision in a spec is one of `CONFIRMED` (approved contract), `DECIDED` (delegated Frontend decision with its CP source) or `TBD` — no unlabeled assumptions.

Shared labels used in all specs:

| Domain value | Display text | Source |
| --- | --- | --- |
| `HONEYMOON_ROMANCE` / `PARENTS_HEALING` / `GOLF_CHALLENGE` / `OUTDOOR_TREKKING` | Honeymoon Romance / Parents Healing / Golf Challenge / Outdoor Trekking | existing Customer titles via `tourThemeTitle` (CP3 §2.3) |
| `CLASSIC` / `GRAND` / `PREMIUM` | Classic / Grand / Premium | same display names the Customer app uses (`TourCollectionCard.tsx`, `TourStyleExplainer.tsx`) |
| `COUPLE_TSHIRT` / `GINSENG_GIFT` / `GOLF_BALL` / `SCARF` | 커플 기념 티셔츠 / 건강 인삼 기념품 / 골프공 / 아웃도어 기념품 스카프 | shared Product Catalog wording (CP2-B §4.3) |
| KRW amount (display) | `₩1,200,000` | `formatKrw` (CP3 §2.1), identical to current Customer output |
| Quantity | `35개` | `Intl.NumberFormat('ko-KR')` + "개" |

## 3. Gate

- [x] Complete screen list with routes matching approved IA
- [x] Template adopted with the single device-scope change documented
- [x] Common display labels fixed with sources

**Next: CP6-A (E01) … CP6-E (E05), CP6-F.**
