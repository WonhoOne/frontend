# CP1-B — Employee Console Information Architecture and Navigation

> Status: DRAFT / DEPENDENT / OWNER IA APPROVAL PENDING
> Written: 2026-10-13 Asia/Seoul — Owner: frontend / 김태우
> Source sequence: P0 planning PR #45 merged; CP0-A #46 → CP0-B #47 → CP0-C #48 → CP1-A #49 are all unmerged at inspection. This CP1-B branch depends on the unmerged CP1-A branch. Review and retarget in strict order.
> Owner-confirmed CP0-C decision: A — PC-only Employee Console; mobile and tablet interfaces are NOT acceptance gates. Desktop keyboard accessibility still matters.
> Source snapshots: frontend main fa84f4b578a3969213bfc851d5b4fa8121ead66d; docs main f49d0457498e8b775f659a27e0c3a96d288d0ba0; backend main 597cf92f1baf93211862d4ea5dbfa8a199b808a2.
> Context: [CP0-A](CP0-A-FRONTEND-RUNTIME-INVENTORY.md), [CP0-B](CP0-B-BACKEND-EMPLOYEE-CONTRACT-AUDIT.md), [CP0-C](CP0-C-SCOPE-DEVICE-DEMO-GATE.md), [CP1-A](CP1-A-OPERATOR-TASK-FLOWS.md), [progress ledger](../01-PROGRESS-AND-HANDOFF.md).
> This document is a frontend IA PROPOSAL, not an approved UI route contract, screen specification or code change. Actual Mobbin visual inspection is reserved for CP2-A.

## 1. Scope and evidence boundary

CP1-A established seven operator tasks: T01 employee sign-in/permissions; T02 product list; T03 create TourProduct; T04 edit TourProduct; T05 read stock; T06 positive stock add; T07 sign out/leave staff context. CP1-B maps these tasks into a small navigation hierarchy, candidate frontend route list, cross-role entry and safe return paths.

Approved backend v0.2 gives shared POST /api/v1/auth/login; employee GET/POST /api/v1/employee/tours; employee PUT /api/v1/employee/tours/{tourId}; employee GET/POST /api/v1/employee/inventory. It does NOT provide separate employee login, staff dashboard/analytics, employee tour-detail GET, inventory absolute-set or employee signup APIs.

Critical frontend sources inspected:
- [paths.ts](../../../src/app/router/paths.ts) and [routes.tsx](../../../src/app/router/routes.tsx) register Customer-only routes today, not the candidate routes below.
- [AppRouteLayout.tsx](../../../src/app/router/AppRouteLayout.tsx) always hosts Customer header, Previous Trips popup and Customer Voice. Staff routes must not blindly inherit this chrome.
- [LoginPage.tsx](../../../src/pages/login/LoginPage.tsx) offers CUSTOMER signup and routes successful login through Customer home/history intent.
- [auth.adapter.ts](../../../src/features/auth/auth.adapter.ts) explicitly rejects EMPLOYEE despite backend login permitting it. Existing login code cannot be reused unchanged.
- [returnContext.ts](../../../src/features/auth/returnContext.ts) couples validated return routes with ReservationDraft version/intents. Do not use it unchanged for staff.
- [AuthProvider.tsx](../../../src/features/auth/AuthProvider.tsx), [privateQueryCache.ts](../../../src/app/providers/privateQueryCache.ts) and [RouteRuntime.tsx](../../../src/app/router/RouteRuntime.tsx) supply mechanisms worth reusing only after role-sensitive audit.

Confirmed source requirements are separated from proposals. A client-side URL does not create a Backend endpoint or authorize resource access; Backend EMPLOYEE role enforcement remains the security authority.

## 2. Candidate alternatives and recommendation

| Decision | Option 1 | Option 2 | CP1-B recommendation / justification |
| --- | --- | --- | --- |
| Login entry | Current /login for both roles unchanged | Separate employee-facing login URL but shared login API | **Option 2**: Customer login currently includes signup and previous-trip side effects; staff needs different post-login route while sharing low-level form/transport |
| Default landing | Separate employee dashboard page | Product list as landing, stock in main nav | **Option 2**: Two task families, no approved dashboard data; avoid a decorative overview |
| Main navigation | Single page mixing Product and Inventory | Two primary sections | **Option 2**: Align FR-10 and FR-11; clearer price vs stock task boundary |
| Product create/edit | Modal or dynamically toggled single page with no stable edit URL | Addressable create and edit routes, shared form component possible | **Option 2**: Deep links, history/return and unsaved-change handling; no duplicated implementation mandate |
| Inventory add | Separate add-stock page | Same Inventory overview context (inline or dialog TBD) | **Option 2**: Four stock types and one add action; no new inventory resource or history |
| Layout ownership | Existing Customer shell | Separate Employee role-aware layout family sharing generic utilities | **Option 2**: Prevent Customer header, Previous Trips and Voice from entering staff scope |
| Theme navigation | Theme management screen/menu | Theme as Product classification | **Option 2**: No Theme CRUD API; many products can share one Theme |

These are **recommendations for owner approval**, not implementation authorization. Sidebar vs horizontal top bar, visual density, editor form composition, modal vs inline inventory add, typography and motion require actual CP2 visual research and CP6 screen specs.

## 3. Proposed sitemap and frontend client routes

~~~
Mister World frontend (one app / existing repository)
├── Customer experience [EXISTING, all routes unchanged]
│   ├── /, /tours, /tours/:tourId and configure
│   ├── /login, /signup, /my-trips
│   └── Customer reservation routes
└── Employee experience [PROPOSED ONLY]
    ├── /employee                  [entry forwarding, NOT a dashboard]
    ├── /employee/login            [staff login, shared Backend auth endpoint]
    └── [EMPLOYEE-guarded route family; no Customer chrome]
        ├── /employee/tours             [product list, DEFAULT]
        ├── /employee/tours/new         [product create]
        ├── /employee/tours/:tourId/edit [existing Product edit by ID]
        └── /employee/inventory         [four-item stock overview + add action]
~~~

| Candidate frontend URL | Access / screen role | Normal entry and task |
| --- | --- | --- |
| /employee | Role-aware forwarding: anonymous→staff login, employee→products, customer→staff denied state | Bookmark / intentional Employee entry |
| /employee/login | Public staff-facing sign-in page; no public Employee signup CTA | Enter loginId/password via SAME approved /api/v1/auth/login |
| /employee/tours | EMPLOYEE only; list by actual Product ID | Direct default landing / staff navigation; create/edit calls to action |
| /employee/tours/new | EMPLOYEE only; full Product form | Create from list or direct safe URL |
| /employee/tours/:tourId/edit | EMPLOYEE only; edit existing positive Product ID | Select from list / safe restored deep link |
| /employee/inventory | EMPLOYEE only; fixed balances and add-stock action | Main navigation and direct URL |

The Employee chrome needs only two peer nav labels **여행상품** and **재고 관리**, plus account/signout affordance. Product Create/Edit are secondary tasks within 여행상품, NOT separate main-menu destinations.

No /employee/dashboard page; /employee forwards based on role rather than rendering invented analytics. Do not add menus for reservations, schedule CRUD, deleted products, warehouse ledger, employee signup or AI Voice.

## 4. Role, entry and return-path rules

| Start condition | Candidate flow | Invariant / why |
| --- | --- | --- |
| Anonymous opens /employee | /employee/login | Never load private Employee API without session |
| Anonymous opens protected deep link | Safe employee-only desired path → /employee/login → original route after Employee login | Do not store token, credentials, mutation body or unsafe external URL in return metadata |
| EMPLOYEE login succeeds with no deep link | /employee/tours | Directly useful landing; no dashboard required |
| CUSTOMER login succeeds on staff entry | Do not admit CUSTOMER to staff route; show explicit wrong-role recovery | Customer token is not an Employee token; avoid 403→endless login loop |
| EMPLOYEE opens staff login while already authenticated | Role-aware forwarding to trusted previous Employee route or /employee/tours | No accidental Customer trip popup |
| Valid EMPLOYEE opens a Customer-only page | Preserve Customer boundaries; Customer private calls remain CUSTOMER-only | Never reinterpret any authenticated user as CUSTOMER |
| Employee API returns 401 | Clear private staff data; reauthenticate; save only safe navigation target | Auth lost; never replay POST/PUT automatically |
| Employee API returns 403 | Permission-denied explanation, no infinite redirect/logout by default | Role mismatch distinct from expired token |
| Invalid /employee/* URL | Staff-specific not-found recovery; link to permitted work area | Current shared 404 is Customer-specific |
| Sign out | Clear memory access token and Employee private query caches; return to staff entry | v0.2 defines no Backend logout API |

**Staff return-to policy (proposed):** only validated same-origin, employee-namespace, view-only paths. Reject URL with // prefix, arbitrary origin, customer reservation route, or query-injected credentials. If the desired direct Edit page is restored after a reload, require new login because current bearer session is memory-only. Exact metadata lifetime and storage approach belong to CP7.

**Security precision:** Frontend guard is for navigation and user experience, not an authorization replacement. Backend requires EMPLOYEE on all staff API endpoints; 401 and 403 remain distinct.

## 5. Transition and browser-history matrix

| From → Destination | Why / expected navigation result | Outstanding decision |
| --- | --- | --- |
| /employee/tours → /employee/tours/new | Explicit Create action, form starts in create mode | CP6-C layout and draft state |
| /employee/tours → /employee/tours/:tourId/edit | Select exact Product ID, not Theme ID | CP8 current data fetch |
| Create → /employee/tours after 201 | Proposed success return to refreshed list, highlight new server Product | CP6-C success copy, focus and transient highlight |
| Edit → list or remain on same editor after 200 | Server response authoritative; preserve original Product context | **TBD CP6-D** whether stay or return by default |
| Create/edit → other nav section or browser Back while dirty | Stop silent discard; offer stay/discard | CP5-B / CP6 form guard design |
| Inventory view → additive stock action → Inventory view | Stay in same context; show server-updated aggregate after 200 | CP2/CP6 whether inline or dialog |
| Unknown Inventory POST outcome → same Inventory view | No automatic resend; re-read server balance, show ambiguity without declaring exactly which write applied | CP5-B / CP8-B |
| Product different Theme PUT on linked Schedule → editor | 409; retain draft, explain Theme-only restriction; valid same-Theme edits permitted | CP5 / CP6-D UX |
| Product edit deep link after tab reload → staff login → editor | Access token lost on reload; authenticate and safely fetch known ID | CP8 read source; no Employee detail GET |
| Signout while dirty | Confirm discard first; clear role-private data only after signout | CP5 state and CP7 implementation |

Do not automatically submit any mutation when entering a route, recovering login, refreshing a page or navigating browser history. A Product POST with unknown response may also have succeeded; do not blindly create a duplicate.

## 6. Resource identity and constraints in IA

**Product vs Theme:** TourProduct has a positive ID, one Theme and full allowed Style prices. Theme is a classification, not a managed record or routing identity. Editing must select TourProduct ID. Themes HONEYMOON_ROMANCE and PARENTS_HEALING allow GRAND/PREMIUM; GOLF_CHALLENGE and OUTDOOR_TREKKING allow CLASSIC/GRAND/PREMIUM. The Backend does not expose a themeLocked flag. Any linked Schedule forbids *different-Theme* PUT but same-Theme edits still work.

**Product Edit direct navigation blocker:** Employee API defines only list/create/update, not Employee GET /tours/{tourId}. The separately approved public GET /api/v1/tours/{tourId} exists, or Employee GET list may supply the record. CP8 must decide safe freshness/data source; **do not invent a new private detail endpoint** or assume a list snapshot survives full reload.

**Inventory:** four canonical types COUPLE_TSHIRT/GINSENG_GIFT/GOLF_BALL/SCARF, each a current aggregate quantity including zero. Inventory POST quantity is **amount to add** (positive delta), not replacement. Stock context should visually distinguish current balance from the pending addition; exact visual form is CP6-E. The Backend has no idempotency key; a timed-out request's success cannot be inferred solely by new GET if other Employees also add concurrently. Java long numeric precision vs JS number is CP8 work.

## 7. Proposed staff-shell information hierarchy, not appearance

- Global identity: clearly distinguish Employee work context from Customer public travel booking.
- Primary nav: **여행상품** and **재고 관리**, plus account/signout.
- Product area: title and collection, Create action, product item identification, edit action. Creation/edit fields and their exact order are CP6-C/D work.
- Inventory area: heading, four ItemType current balances, add-stock action and confirmation/recovery messaging. A separate data-heavy dashboard is not justified.
- Use a consistent staff-scope main landmark, keyboard focus after navigation and links to recover from 404/errors; role error states must not expose Customer popups or Voice.
- **Presentation still open:** vertical sidebar vs horizontal section switcher, columns vs cards, exact layout grid, light/dark visual style and spacing. Do not settle before CP2 Mobbin screenshots.

## 8. Decisions for owner review and deferred design work

| Decision ID | Recommendation | Status / next |
| --- | --- | --- |
| IA-01 | Staff-facing /employee/login route; SAME backend login API | **PROPOSED** — owner CP1-B review |
| IA-02 | Default work area Products, NO separate dashboard | **PROPOSED** — owner CP1-B review |
| IA-03 | Two primary work areas Products/Inventory; no extra navigation domains | **PROPOSED** — owner CP1-B review |
| IA-04 | Separate addressable Product list/create/edit URLs, potential shared form code | **PROPOSED** — owner CP1-B review |
| IA-05 | Add inventory within Inventory overview, not separate route | **PROPOSED** — owner CP1-B review |
| IA-06 | Employee shell separated from Customer Chrome & private-data lifecycle | **DESIGN CONSTRAINT** from CP0-A; CP7 implementation |
| IA-07 | Return to Products after successful creation | **PROPOSED**, exact copy/focus CP6 |
| IA-08 | Successful edit: remain vs return to list | **DEFERRED** CP6-D |
| IA-09 | Safe Employee-only return URL, never use Customer ReservationDraft context unchanged | **PROPOSED POLICY**, CP7/8 method |
| IA-10 | Inventory inline vs modal; sidebar vs topbar and visual direction | **DEFERRED** CP2 and CP6, requiring actual visual references |

**Owner acceptance request:** Approve IA-01..IA-05 as a compact group or specify changes before marking this checkpoint COMPLETE. User's earlier “다음” authorizes research/drafting only, not silent approval of new route/landing decisions. A/B/C device policy is **already owner-approved A PC-only** and must NOT be revisited.

## 9. Candidate screen inventory for later CP6 (not final screen specifications)

- CP6-A — staff login and role/permission recovery, plus separate staff chrome.
- CP6-B — TourProduct collection, empty/refresh/network states and Create entry.
- CP6-C — Product creation, Theme-dependent complete prices, save and unsaved state.
- CP6-D — Product editing, server read strategy, 409 Theme lock recovery, 404 missing ID.
- CP6-E — Inventory four-row overview, add-stock action and ambiguous outcome.
- CP6-F — cross-screen navigation, safe return, focus, signout and error/guard consistency.

These are **candidate surfaces**, not individual implemented pages or full 20-part specs. CP2-A MUST visually inspect candidate Mobbin web screenshots and flows before choosing final visual patterns; the pre-scout only verified canonical URLs and flow metadata.

## 10. CP1-B audit, gates and next step

- [x] Source-backed CP1-A task mapping to minimal sitemap and candidate paths.
- [x] Compared alternatives for Employee login, landing/dashboard, product create/edit addressability, Inventory add route and layout isolation.
- [x] Defined 401/403 role-safe route entry and browser/deep-link recovery proposals.
- [x] Mapped Product identity, Theme, known endpoint limits and Inventory additive POST into navigation.
- [x] Preserved CP0-C **A PC-only** decision; no tablet/phone acceptance introduced.
- [x] Distinctly labeled proposals, not approved routes or screens; no coding/tests performed.
- [ ] Owner review/decision IA-01 to IA-05 and any corrections.
- [ ] Dependencies CP0-A #46, CP0-B #47, CP0-C #48 and CP1-A #49 reviewed/merged in order.
- [ ] This CP1-B dependent PR retargeted/reviewed/merged, progress ledger updated.
- [ ] CP2-A Mobbin visual inspection NOT STARTED.

**Next on approval:** CP2-A — visually inspect actual Mobbin admin/product/editor/inventory flows, compare verified screen patterns, record observed vs inferred, reject unsuitable features, then CP2-B visual direction. CP1-B cannot be labeled final/approved while its IA proposal or predecessor PRs are unmerged.

**Fresh-chat recovery:** Read [project Employee entry](../README.md), [progress ledger](../01-PROGRESS-AND-HANDOFF.md), this file, CP1-A, approved docs/main and actual GitHub PR states. Do not infer a completed merge from document text.
