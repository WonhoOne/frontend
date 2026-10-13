# CP0-C — Employee Console Scope, Device Policy and Demo Readiness

> **Status: REVIEW — device-policy DEC-C01 APPROVED A (PC-only); PR merge and final CP0 signoff pending. Do NOT mark CP0 frozen while #46/#47/#48 are unmerged.**
> Date: 2026-10-13 (Asia/Seoul)
> Owner: 김태우 / `WonhoOne/frontend`
> Program: [P0 approved planning program](../00-PLANNING-PROGRAM.md) → P1 CP0-C → CP1-A
> Source snapshot: frontend/main `fa84f4b578a3969213bfc851d5b4fa8121ead66d`; docs/main `f49d0457498e8b775f659a27e0c3a96d288d0ba0`; backend/main `597cf92f1baf93211862d4ea5dbfa8a199b808a2`.
> Dependencies: [CP0-A PR #46](https://github.com/WonhoOne/frontend/pull/46) and [CP0-B PR #47](https://github.com/WonhoOne/frontend/pull/47) are **still OPEN/unmerged** as checked when preparing this document. **CP0-C lives on a third stacked branch, NOT main.** Merge/review in order and reconcile refs. This CP0-C report records the **owner-approved PC-only device policy** and is awaiting prerequisite PR merges and final review.
> Assignment primary evidence: user-supplied two-page `미스터월드테마투어.pdf` (course 소프트웨어공학 71032; project "AI 기반 미스터 월드 테마 여행 서비스 구축"). This original assignment is not automatically an approved v0.2 API field-level specification.
> Shared SSOT: [approved requirements](https://github.com/WonhoOne/docs/blob/main/requirements/requirements.md), [Business Rules](https://github.com/WonhoOne/docs/blob/main/requirements/business-rules.md), [NFRs](https://github.com/WonhoOne/docs/blob/main/requirements/non-functional-requirements.md), [REST](https://github.com/WonhoOne/docs/blob/main/api/api-spec-draft.md), [Baseline](https://github.com/WonhoOne/docs/blob/main/baseline/BASELINE-v0.2.md), [ownership](https://github.com/WonhoOne/docs/blob/main/architecture/repository-responsibilities.md).

## 1. Purpose and outcome

Set an **evidence-backed** Employee scope and non-goals; propose—not presume—a device support policy, concrete end-to-end demo story and milestone plan. Record owner decisions separately so a new ChatGPT session can resume without filling gaps. This is **not** an IA/design/route spec and contains no implementation code.

**Current outcome:** Scope and deadline are source-backed. Owner **explicitly approved Option A, PC-only support** on 2026-10-13. The demonstration sequence and local/hosted runtime logistics remain proposals/unverified; CP0-C is NOT COMPLETE until dependencies are merged and final gate reviewed.

### Evidence hierarchy

- `ASSIGNMENT CONFIRMED`: two-page professor assignment PDF, reproduced briefly/faithfully.
- `SHARED SSOT CONFIRMED`: approved docs/main v0.2 requirements/domain/API contract.
- `IMPLEMENTATION OBSERVED`: backend/main and frontend/main from CP0-A/CP0-B.
- `FRONTEND PROPOSAL`: this draft's UX/demo/time targets beyond approved device A; not an assignment requirement.
- `OWNER CONFIRMED`: on 2026-10-13, user explicitly chose Employee support **Option A — PC-only**. Device scope is locked; remaining demo environment and scheduling logistics remain proposals/TBD.
- `RUNTIME UNVERIFIED`: an actual Employee demo account/deployed URL/database availability or completion of course midterm submissions.

## 2. Read the ORIGINAL assignment correctly (two pages)

**Assignment §2:** This system provides two interfaces:

- Customer interface: a tour/product selection interface; **GUI (web or app)** and **voice recognition** are specified for the Customer.
- Employee interface: to **plan travel products** and **add items** (couple shirts, ginseng products, golf balls, scarves, etc.) **to a warehouse**.
- The assignment says Customer & Employee join the system and `name`, `address`, `contact` are stored; it does **not** explicitly require a public self-signup UI for employees or an employee-mobile app.

**Assignment §1:** four tour themes and three styles with Honeymoon/Parents Grand-or-higher; these terms inform Product forms, but granular DTOs/business rules come from approved v0.2.

**Assignment §3 schedule (exact original):**

| Milestone | Date | Required work |
| --- | --- | --- |
| Team formation | 2026-09-14 | Team submission |
| Proposal presentation | 2026-09-29 | Plan due 2026-09-28 |
| Midterm presentation | **2026-10-13** | UML modelling presentation |
| Midterm report | **2026-10-12** | Requirements & design artifacts |
| **Final report** | **2026-11-23** | Plan, requirements artifacts, design artifacts, implementation/operation artifacts, source code |
| **Final presentation** | **2026-11-24** | UML + implementation presentation and program demo |

The source specifies **dates**, not whether past submissions/presentations actually occurred. Never claim they passed, that a deployment exists or that a demo is ready. As of 2026-10-13, an Employee planning/implementation/testing schedule must preserve meaningful time before **Nov 23** for complete artifacts, QA and demo preparation.

**Assignment versus SSOT difference (intentional resolution already approved):**
- The assignment's general "Customer & Employee accounts" wording does not define the exact signup route. The approved v0.2 FR-01/BR-16/REST explicitly make **public signup CUSTOMER-only**, and **EMPLOYEE accounts Backend-provisioned**. Do not create an Employee public signup workflow from the original sentence alone.
- The assignment does not specify an Employee mobile breakpoint/responsive mandatory requirement. Do **not** infer Employee phone support from Customer "web or app".
- The professor assignment calls for an employee interface, not a separate standalone frontend repository. The shared ownership document and CP0-A establish Employee Console in `WonhoOne/frontend`.

## 3. Confirmed Employee scope (FR-01/10/11, BR, REST v0.2)

| Required Employee capability | Contract-bound meaning | Planning implications (not designs) |
| --- | --- | --- |
| Employee authenticates | Same `POST /api/v1/auth/login` as Customer; JWT user role `EMPLOYEE`; Employee account not self-service signup | Need safe Employee entry/role-aware navigation and auth model; current Customer adapter rejects Employee (CP0-A) |
| Product list | `GET /api/v1/employee/tours`, ID ASC plain array, may be empty | Loading/empty/error/refresh and product selection flow |
| Product creation | `POST /api/v1/employee/tours`, full `{theme,name,description,stylePrices}` body; returns 201 + Product | Form fields/complete style prices, format validation and success navigation |
| Product modification | `PUT /api/v1/employee/tours/{tourId}`, full body; returns 200 + Product | Existing value retrieval, dirty-form recovery, linked Schedule 409 Theme lock |
| Stock review | `GET /api/v1/employee/inventory`; four canonical item types, each with current aggregate quantity | Four-item display, zero quantities are legitimate |
| Positive stock addition | `POST /api/v1/employee/inventory`, `{itemType, quantity>0}`; 200 with **new balance** | Enter delta, never overwrite/deduct; prevent unsafe duplicate/ambiguous retry |

Known Domain rules: Themes `HONEYMOON_ROMANCE`, `PARENTS_HEALING`, `GOLF_CHALLENGE`, `OUTDOOR_TREKKING`; styles for first two `GRAND/PREMIUM`, last two `CLASSIC/GRAND/PREMIUM`; **each** allowed style must have one positive KRW price. A linked Schedule of **any date/status** disallows change to a **different Theme**, but same-Theme name/description/price edits work (BR-31).

**NFR scope:** NFR-02 stored Inventory accuracy, NFR-03 Employee core-function success, NFR-04 cross-scenario success, NFR-05 Backend response time and NFR-06 unit/integration testing affect overall demonstration/acceptance. A frontend-only static demo does not suffice for Inventory persistence accuracy. These are evaluation targets, not test results from this CP.

## 4. Explicitly out of scope (do NOT import from Mobbin examples)

| Not included in approved v0.2 | Why it must not quietly enter Employee scope |
| --- | --- |
| Employee public signup / employee password reset / role management | Only Backend-provisioned EMPLOYEE accounts and shared login exist |
| TourSchedule create/update/delete, schedule calendar management | Shared contract has Customer/Public schedule **read**, no schedule CRUD |
| Reservation management, cancellation/refunds, payments | Not approved Employee operations |
| Product delete / product publish/unpublish status / media upload / destination editor | No corresponding approved Employee DTO or API |
| Inventory decrement, overwrite, delete, transfers, audit history, SKU warehouse ledger | BR-24/25 fixed aggregate **read/add only** |
| Automatically decrementing stock on reservation, 0-stock purchase block | Explicitly outside v0.2 |
| Employee Voice, AI chat, dashboard KPIs/analytics, independent admin Backend/DB access | No requirement or API; Mobbin examples are reference patterns, not feature commitments |
| Separate mobile-native Employee application | Not required; **PC-only web console explicitly approved** |

**Note:** UI-only helpers (client-side sorting/filtering if justified, confirmation dialog, local validity messages, protected routes, display formatting) can be scoped during CP1/CP2/CP5, but may not assume new Backend pagination or analytics endpoints.

## 5. Device support decision — REQUIRED OWNER APPROVAL

**Confirmed:** The professor assignment does not mandate Employee mobile; shared v0.2 NFRs do not contain Employee-specific responsive breakpoint requirements; the Customer app's mobile-first tokens are reusable implementation infrastructure but do not create a new evaluation obligation.

**OWNER-APPROVED POLICY — Option A, confirmed 2026-10-13:**

| Option | Required acceptance / non-goals | Scope and cost |
| --- | --- | --- |
| **A. Desktop only (recommended for this course timeline)** | Employee core flows must work via keyboard/mouse at e.g. 1280px+; below desktop width no complete Employee layout guarantee. Avoid breaking viewport/rendering unnecessarily; tablet may work opportunistically, **not an acceptance gate** | Lowest workload, leaves time for auth correctness, 409, inventory, tests |
| **B. Desktop + tablet** | All core Employee operations also verified at e.g. 768–1024px (table density, layout overflow, form grouping, focus); phone out of scope | Medium extra CP2/CP6/CP9/QA work |
| **C. Full responsive including phones** | In addition to desktop/tablet, all operations fully supported on ~390px phones (possibly redesign table→cards, action placements, input patterns) | Highest effort, not required by assignment |

**CONFIRMED DEC-C01: Option A — Desktop/PC-only.** The user explicitly chose A on 2026-10-13. Required Employee functionality will be planned and tested for desktop browser workflows (the 1280px+ reference is a suggested QA baseline, exact browser/viewport matrix belongs to CP9). Tablet and phone responsive layouts are **not Employee acceptance gates**; they may incidentally render but no functionality guarantee is added. Focus order, keyboard navigation, semantic controls and zoom remain required for accessible desktop interaction. Option B/C rows are historical evaluated alternatives, not accepted scope.

**OWNER DECISION RESOLVED:** `A` chosen. CP9 must honor desktop-only scope; mobile/tablet QA is not mandated. CP0-C is still in REVIEW until the stacked PRs are merged and the CP0 gate verified.

## 6. Proposed Employee demonstration script (not yet owner-approved)

All demonstration behavior must use the **real approved REST contract** and a prepared Employee account. The goal is a short, reliable proof of the assignment's Employee functionality, not an artificial feature dashboard.

**D1 — Employee sign-in + scope isolation** (necessary precondition)
- An intentionally Backend-provisioned Employee signs in through the shared login API and is routed to Employee scope, without Customer previous-trips popup, Customer navigation or Customer Voice.
- Anonymous Employee URL cannot access private data; a Customer token cannot run Employee writes; wrong-role UX is distinguishable from expired/missing auth (401 vs 403).

**D2 — Product planning / create**
- Employee views TourProduct list, creates a named Product under e.g. `GOLF_CHALLENGE` with `CLASSIC/GRAND/PREMIUM` positive KRW prices, sees the newly returned Product and updated list.
- Show that `HONEYMOON_ROMANCE`/`PARENTS_HEALING` permit only `GRAND/PREMIUM`. Do **not** invent Product media/destination/status fields.

**D3 — Product update**
- Employee edits name/description and one/more prices through complete PUT; sees updated server-authoritative data. With a **controlled fixture containing a linked Schedule** show a Theme switch returns `409 TOUR_PRODUCT_THEME_LOCKED`, while same-Theme edits remain allowed. This conflict case can be part of negative QA even if it is too time-consuming for live demonstration.

**D4 — Fixed Inventory read and positive add**
- Employee sees the four fixed products, records stock for one item, adds a positive amount, and confirms refreshed **new aggregate quantity**, including across reload/server read.
- Input label must express **quantity to add** not "final stock".
- Avoid sending a second POST automatically if the first POST response is ambiguous. Manual recovery flow is CP5/CP8 design.

**D5 — Evidence / safety (QA if not performed in live demo)**
- Role 401/403 and invalid form 422, 409 Theme lock, Inventory add-not-replace, persistence check and Customer/Voice regression (B9 preserved).
- Record supporting implementation/test evidence in CP10/P2, not CP0-C.

The demo is a **proposal**; actual fixture availability, provisioning, account credentials, API host, reset/cleanup procedure, operator and presentation duration are `RUNTIME UNVERIFIED`/owner-team coordination, not established facts.

### Demo readiness checklist — do not prematurely mark passed

- [ ] Team confirms where demo will run (local development / hosted environment) and who owns Backend/DB startup
- [ ] Employee bootstrap enabled **only for controlled provision** or account precreated; then bootstrap disabled as appropriate, without credential exposure
- [ ] Employee identity is present in actual **target** database and can log in via approved API (not proven by tests/source presence alone)
- [ ] Stable representative TourProduct + Inventory starting fixtures established (without changing the shared contract)
- [ ] Browser loads frontend pointing at real Backend and actual DB; no accidental MSW production fallback
- [ ] QA verifies Product create/update persisted, Inventory additive persisted and role-negative cases
- [ ] Any uncertain Inventory write reconciled before showing stock total; no speculative client cache substitution
- [ ] Entire Customer GUI/Voice system still usable
- [ ] Presenter and rollback/reset plan decided; screenshots/recording where required by course final report

## 7. Timeline planning against professor deadline

**ASSIGNMENT CONFIRMED:** 2026-11-23 final report/source/artifacts, 2026-11-24 final demonstration. No newly invented school submission date or assumption that the 2026-10-12 midterm report was submitted.

**FRONTEND PROPOSAL — planning targets, not approved schedule:**

| Target window | Intended outcomes | Stage |
| --- | --- | --- |
| 2026-10-13–10-16 | Resolve CP0-A/CP0-B PR merges, device policy and CP0-C scope; CP1 IA/task journey | P1 foundation |
| 2026-10-17–10-27 | CP2 visual Mobbin audit, CP3 UI reuse, CP4/5 state/motion; CP6 screen-by-screen specs (split per chat) | P1 design |
| 2026-10-28–10-31 | CP6 G/H/I audits, CP7/8 architecture/API, CP9/10 QA, CP11 audit and approved implementation handoff | P1 sign-off |
| 2026-11-01–11-16 | Employee Auth/role shell, Product flows, Inventory flows, integration and regression in PR-sized work | P2 build |
| 2026-11-17–11-22 | Real Backend/demo fixtures, stock mutation/error tests, accessibility/scoped device checks, customer regression, source/document/report packaging | P2 verification |
| **2026-11-23** | Final required files/report/source due | Professor deadline |
| **2026-11-24** | UML and implemented program demo/presentation | Professor deadline |

**Schedule risk:** CP6 screen specs and cross-screen/contract audits are the largest planning work. If preparation takes longer, **re-scope nonessential responsive/decorative work, not role safety, persistence correctness or required tests**; request user/team decision before moving dates. Avoid planning endlessly while consuming implementation/verification runway. CP0-C requires owner to confirm that this target is feasible for the team, not that it is guaranteed.

## 8. Ownership / dependencies

| Area | Owner per approved responsibility | Dependency |
| --- | --- | --- |
| Employee GUI design, auth wiring, forms, API integration, UI QA | Frontend / 김태우 | approved docs/main, frontend/main, real Backend behavior |
| Employee API, JWT issuance/security, Product/Inventory validation, DB/transactions | Backend / Backend owner | do not edit here unless requested to that owner |
| Employee account bootstrap + demo database/environment execution | Backend/environment operator | must confirm contact and environment; don't circulate credentials |
| Voice STT/interpreter and its assigned frontend directories | separate Voice ownership, as documented | Employee UI must not accidentally run Voice or regress existing Customer paths |
| Shared FR/BR/API changes | Team-agreed docs/main ownership | docs-first; no unilateral redesign |

CP0-C is the place to record who runs the demonstration and where. The source does not tell us a specific demo URL or assigned runtime operator; mark `TBD`.

## 9. Owner decision ledger and blockers

| Decision ID | Question | Current state | Impact/next owner |
| --- | --- | --- | --- |
| **DEC-C01 (RESOLVED 2026-10-13)** | Employee responsive scope | **CONFIRMED: A — PC-only**. Desktop browser flows required, tablet/phone not acceptance targets | Owner decision accepted; feed into CP1 and CP9 |
| DEC-C02 | Is proposed minimal demo D1–D4 sufficient for presentation, or is there an additional required employee operation? | **PROPOSED**, user/team may amend | User/team; only add scope docs-first if real assignment demands |
| DEC-C03 | Local vs hosted demo? Is real Employee user provisioned in target DB? Who can reset fixtures? | **RUNTIME UNVERIFIED** | Backend/demo operator by P2 testing; not prerequisite to designing CP1 |
| DEC-C04 | Are the suggested Oct31 planning/Nov16 coding targets realistic relative to team assignments? | **PROPOSED**, not contractual | User/team may change; protect Nov23/24 due dates |
| DEC-C05 | Were Oct12 report and Oct13 presentation delivered? | **UNKNOWN**; no retroactive assumption | User/team administrative follow-up, not Employee API blocker |
| DEC-C06 | What browser(s) must be demonstrated? | **UNSPECIFIED BY ASSIGNMENT**; existing frontend Playwright uses Chromium | CP9/CP10, user may specify |

**CP0 freeze criteria:** (1) owner approves device choice; (2) confirmed/approved scope and explicit non-goals; (3) demo proposal accepted or bounded outstanding questions assigned; (4) no unaddressed blocker to CP1 IA; (5) CP0-A/B/C artifacts each committed/reviewed/merged in dependency order; (6) progress ledger reflects actual evidence.

## 10. Cross-chat handoff / next step

**Dependency-aware merge order:**

1. [Frontend PR #46 — CP0-A](https://github.com/WonhoOne/frontend/pull/46), `main` target, **currently OPEN**.
2. [Frontend PR #47 — CP0-B](https://github.com/WonhoOne/frontend/pull/47), currently targets CP0-A branch; **only after #46 merges**, retarget #47 to `main`, recheck diff/merge.
3. **CP0-C** this stacked report branch targets CP0-B branch while earlier PRs are unmerged. After #47 merges, retarget this PR to `main`, review owner-approved **A PC-only** decision, recheck diff/merge. CP0-C is **READY FOR REVIEW** with DEC-C01 resolved, but **NOT COMPLETE** until its PR is merged and CP0 closure verified.
4. After the CP0 gate is actually complete and user says proceed, begin **CP1-A — Employee tasks and flows** (not screen mockups yet).

**Exact current stage:** CP0-C owner device decision recorded (`A PC-only`), `REVIEW / MERGE PENDING`; prior CP0-A/B PRs still awaiting merge. Other demo logistics are assigned to later readiness checks and do not force a new UI feature. **P2 implementation still NOT STARTED**.

**Next action:** merge review dependency chain #46 → #47 → #48. User subsequently requested progression to **CP1-A**; any CP1-A document prepared before the merges remains **DRAFT/DEPENDENT**, not an approved downstream stage.

No app code, shared API code or device/IA decision was modified by this document; no new tests executed.
