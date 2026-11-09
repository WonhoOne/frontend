# CP6-G / CP6-H / CP6-I — Employee Spec Audits

> Status: **COMPLETE — PASS after fixes (2026-11-09)**
> Scope: [CP2-B](../CP2-B-VISUAL-DIRECTION.md), [CP3](../CP3-COMPONENT-REUSE-AND-CONTRACTS.md), [CP4](../CP4-MOTION-AND-FEEDBACK.md), [CP5](../CP5-DATA-AND-MUTATION-STATES.md), [CP6-0](../CP6-0-SCREEN-INVENTORY.md), [E01](../screens/E01-employee-login-and-access.md)–[E05](../screens/E05-inventory.md), [CP6-F](../CP6-F-CROSS-SCREEN-JOURNEYS.md)
> Contract snapshot: `WonhoOne/docs/main` `f49d045` (`api/api-spec-draft.md`, REST v0.2)

## CP6-G — Cross-screen consistency audit

Method: read every spec against CP4/CP5 rules and the CP6-F consistency table; grep for each label, channel and code across all files.

| ID | Finding | Files | Fix applied |
| --- | --- | --- | --- |
| G1 | CP4 §5 and E05 said the stock dialog's **close button is disabled** in flight, but CP3 reuses `Dialog` as-is and its contract requires an always-usable close control (no prop exists to disable it) | CP4, E05 | Close stays enabled; Escape/outside still blocked via existing props; closing does not cancel the request; outcome goes to the status line |
| G2 | CP5 §2 / CP6-F §4 auto-redirected on **any GET 401**, which would discard a dirty E03/E04 form when a background refetch hits an expired token — contradicting CP5 §3.5 ("no automatic redirect while a form has unsaved input") | CP5, CP6-F | GET 401 with a dirty form on screen uses the write-401 alert instead |
| G3 | 409 recovery action label differed: "테마를 원래대로 되돌리기" (CP4, CP5) vs `테마 되돌리기` (E04) | CP4, CP5 | Unified to `테마 되돌리기` |
| G4 | Path placeholder `{id}` used in CP5 where the contract uses `{tourId}` | CP5 | Changed to `{tourId}` |
| G5 | Style display names written as codes (`CLASSIC`) and KRW as "원" suffix in early drafts, while Customer shows "Classic" and `₩1,200,000` | CP2-B, CP3, CP6-0 | Fixed before commit of CP6-0; all specs use Customer names and `formatKrw` |

Re-check after fixes: no remaining mismatch in status-line channel, alert role, unknown-outcome handling, Theme/Style/item label source, KRW format, 401/403 behavior (CP6-F §5 table holds).

## CP6-H — Shared contract and TBD audit

Method: extract every endpoint and machine code from the specs and match it against REST v0.2.

| Item in specs | In REST v0.2 | Notes |
| --- | --- | --- |
| `POST /api/v1/auth/login` | ✅ | `LOGIN_FAILED` on bad credentials |
| `GET /api/v1/employee/tours` | ✅ | used for list **and** edit (no detail endpoint) |
| `POST /api/v1/employee/tours` | ✅ | |
| `PUT /api/v1/employee/tours/{tourId}` | ✅ | complete replacement |
| `GET /api/v1/employee/inventory` | ✅ | |
| `POST /api/v1/employee/inventory` | ✅ | positive delta |
| `GET /api/v1/tours/{tourId}` | ✅ (public) | mentioned only as **not used** (CP5 §1) |
| Codes `LOGIN_FAILED`, `VALIDATION_FAILED`, `MALFORMED_REQUEST`, `TOUR_PRODUCT_THEME_LOCKED`, `TOUR_PRODUCT_NOT_FOUND`, `AUTHENTICATION_REQUIRED`, `INVALID_ACCESS_TOKEN`, `ACCESS_TOKEN_EXPIRED`, `FORBIDDEN`, `INTERNAL_ERROR` | ✅ all present | UI branches on status + code only |
| Field-error codes `REQUIRED`, `OUT_OF_RANGE`, `NOT_ALLOWED`, `DUPLICATE_VALUE` | ✅ all present | |
| Fields `theme`, `name`, `description`, `stylePrices{style,amount,currency}`, `availableStyles`, `itemType`, `quantity`, `accessToken`, `tokenType`, `expiresIn`, `user{id,role,name}` | ✅ | `availableStyles` never sent |

**Invented contract elements: 0.** No endpoint, field, code, pagination, idempotency key, version token or business limit was added. Technical bounds (JS safe integer) are labeled as client-side technical limits, not business rules.

Open items (none block implementation):

| ID | Item | Owner |
| --- | --- | --- |
| DEC-C03 | Employee account in the demo DB (`EmployeeBootstrap` disabled by default) | Backend / demo operator; W3 CI job + W5 checklist |
| H-N1 | No concurrency token on PUT → last-write-wins (E04 §10 note) | Accepted for v0.2; documented |
| H-N2 | No idempotency key on POSTs → unknown-outcome UX (CP5 §3.4) | Accepted for v0.2; documented |

## CP6-I — Implementation readiness audit

Question per screen: *can a developer build it without guessing UX?* Checked: route & guards, data source, layout & order, exact copy, every state, interactions, a11y, acceptance criteria.

| Screen | Route/guard | Data | Layout/order | Copy | States | A11y | Acceptance | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E00 shell | ✅ | ✅ | ✅ | ✅ | n/a | ✅ | via E01 #6, #9 | PASS |
| E01 login/access | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 9 criteria | PASS |
| E02 list | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 8 criteria | PASS |
| E03 create | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 8 criteria | PASS |
| E04 edit | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 8 criteria | PASS |
| E05 inventory | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 8 criteria | PASS |

Left for CP7/CP8 by design (code structure, not UX): module/file placement, role-aware Auth model change, decoder function shapes, query hook names, test file layout.

**Overall P1-4 result: PASS.** Next: CP7 implementation architecture.
