# Employee Console — Planning Program

> **Document type: Planning-the-planning (실행계획서), NOT a finalized UX/UI specification or implementation plan.**
> Status: `PROPOSED — PHASE P0 ONLY`
> Prepared: 2026-10-13, Asia/Seoul
> Repository: `WonhoOne/frontend`
> Owner: 김태우 (Frontend)
> Current source of truth: latest approved `WonhoOne/docs/main` + current `frontend/AGENTS.md`
> PR #44: **closed without merge**; do not treat its Employee Console implementation plan as approved.
> Next action after approval: **CP0-A — Frontend runtime/assets/architecture inventory**. No CP0-A work is claimed complete here.

## A. Fundamental sequence: three hard gates

```text
P0 — PLAN THE PLANNING (this PR)
  Inputs: approved shared scope + historical Customer CP/PR method + initial Mobbin discovery.
  Output: execution checkpoint map, evidence rules, research targets, continuity protocol.
  Gate: user reviews/approves this program.
  ↓
P1 — DETAILED PLANNING SET (CP0–CP11)
  Inputs: current repository/runtime, Backend implementation, customer shared design infrastructure,
          visually reviewed product/inventory references, approved SSOT.
  Output: screen-by-screen 20-part specs, architecture/data/state/QA documents,
          decision ledger, audits and final implementation handoff.
  Gate: CP11 FINAL PLANNING AUDIT PASS, no unresolved critical UX/contract blockers.
  ↓
P2 — IMPLEMENTATION
  Inputs: approved P1 package, checked current frontend/main, current docs/main,
          real Backend Employee APIs, checkpoint-specific acceptance criteria.
  Output: implementation PRs, tests, actual employee-role/backend/persistence evidence.
  Gate: working Employee Console and measured FR/NFR checks; not an assumption in P0/P1.
```

**Do not leap from P0 to P2.** The earlier Employee plan in unmerged PR #44 tried to fix proposed routes, screens and implementation gates too early; preserve it only as historical context. This document deliberately does **not** settle routes, visual treatments, mobile support, form placement, navigation, data-state policies or implementation architecture without P1 investigation.

## B. Why this exact method

Actual Customer planning history (not a claim about chat count):

- [Frontend PR #3](https://github.com/WonhoOne/frontend/pull/3): CP0–CP11 planning set, 11 individual screen specs, CP6-G/H/I audits, 32 files and one upload commit.
- [Frontend PR #5](https://github.com/WonhoOne/frontend/pull/5): next-session implementation handoff.
- [Frontend PR #7](https://github.com/WonhoOne/frontend/pull/7): implementation master plan and CP0–CP9 implementation checkpoints, 19 files / 3 commits.
- [Customer Screen Spec Index](../planning/07-SCREEN-SPECS.md): CP6-0 → A/B/C/D/E/F → G/H/I, screen-by-screen spec contract.
- [Customer implementation roadmap CP5](../implementation/checkpoints/CP5-IMPLEMENTATION-ROADMAP.md): work per chat session normally 1–3 sub-checkpoints.

The PRs are **batch upload boundaries**, not evidence that each large set was designed in one conversation. We must emulate the **small sequential reasoning/review/QA checkpoints**, not mimic page counts or blindly copy every Customer UX rule into an operational Employee tool.

## C. Project and existing contract guardrails

### Stable starting scope (approved shared v0.2, must be reverified in CP0-B)

| Workstream | Shared source | Expected capability |
| --- | --- | --- |
| Employee identity/permissions | Auth contract / role CUSTOMER vs EMPLOYEE | Same approved login API, employee credentials provisioned Backend-side; private employee APIs must reject wrong role |
| TourProduct administration | FR-10, BR-17/21/31, REST contract | list / create / update product, with allowed Theme × complete TourStyle prices |
| Inventory administration | FR-11, BR-24/25, REST contract | read fixed item-type stock aggregates; add strictly positive quantity |
| Tests/quality | NFR-02/03/06 (and applicable shared NFRs) | persistence/response accuracy, Employee core functions, unit and integration evidence |
| Existing Customer frontend | customer planning + current runtime/CI | reuse approved common infrastructure; preserve Customer/Voice integration behavior |

Reference pointers: [approved responsibilities](https://github.com/WonhoOne/docs/blob/main/architecture/repository-responsibilities.md), [requirements](https://github.com/WonhoOne/docs/blob/main/requirements/requirements.md), [business rules](https://github.com/WonhoOne/docs/blob/main/requirements/business-rules.md), [REST v0.2](https://github.com/WonhoOne/docs/blob/main/api/api-spec-draft.md), [B9 closure](https://github.com/WonhoOne/docs/blob/main/B9-INTEGRATION-CLOSEOUT.md), [frontend ownership](../../AGENTS.md).

Approved Employee API **discovery targets**, not permission to implement at P0:
- `POST /api/v1/auth/login`
- `GET /api/v1/employee/tours`, `POST /api/v1/employee/tours`, `PUT /api/v1/employee/tours/{tourId}`
- `GET /api/v1/employee/inventory`, `POST /api/v1/employee/inventory`

Key known contract risks to verify rather than reinvent: 401 vs 403; TourProduct linked-Schedule Theme-change 409 `TOUR_PRODUCT_THEME_LOCKED`; complete Theme-dependent `stylePrices` in KRW; Inventory add quantity as **delta** (not replacement), with concurrency and ambiguous-response UX. No public Employee signup, no product deletion, no schedule CRUD, no inventory decrement/overwrite, no reservation management or automatic stock deduction in current v0.2.

### Scope decisions intentionally open

- **Responsive scope:** Desktop-first is an initial practical direction, **not** approval of mandatory 390px/mobile console. The original Employee requirements do not explicitly require mobile. CP0-C must record an explicit user choice: desktop only, desktop + tablet, or full responsive. No new mobile acceptance gate before that decision.
- **Employee entry/login:** shared /login reuse vs local role-specific entry and safe return context — CP1.
- **Console shell and IA:** whether a dashboard landing is even necessary; no invented analytics widgets — CP1.
- **Visual language:** reuse the real Customer design system vs separately justified operational primitives — CP2/CP3 after actual Mobbin review.
- **Product editor create/edit split:** separate routes vs reusable form/surface — CP1/CP6. Treat old PR #44 URL suggestions as unapproved options, not constraints.
- **Admin search/sort/filter and table density:** no invented server pagination/search endpoint. Frontend-only UX only if justified by actual catalog size and contracts.

## D. Before planning, do reference discovery (Mobbin)

An initial candidate search was performed via the connected Mobbin screen/flow search on 2026-10-13 for product list, product editor, inventory, admin shell, add-product and stock-update journeys. The exact found Mobbin URLs, task relevance, limits and CP2 follow-up instructions are documented in [references/00-MOBBIN-DISCOVERY.md](references/00-MOBBIN-DISCOVERY.md).

**Evidence boundary:** connector results reliably identified app names, candidate screen/flow URLs, flow names and screen counts, but this session could not sufficiently inspect full images. Do not claim visual/layout details from titles or metadata. At CP2-A, visually inspect the actual screens, annotate each observed pattern vs a hypothesis, and reject unsuitable examples. This prior discovery establishes **what to inspect** before deciding **what to build**.

No brand style, layout, component library or employee design direction is chosen just because Shopify/Square/Wix/Uvodo were returned.

## E. Checkpoint map — proposed P1 planning set

Every CP unit below is a separately resumable task. If too large, subdivide `CPx-A1/A2` before working; if a tiny CP needs no new decisions, carry over an explicit evidence-backed inheritance rather than writing boilerplate.

| ID | Investigate and decide | Concrete output / exit gate |
| --- | --- | --- |
| **CP0-A** | Current frontend/main route tree, auth, shared tokens/UI, query/client/adapter, mocks, tests and B9 integration evidence | evidence-backed reusable-vs-new inventory, exact path references, observed code gaps |
| **CP0-B** | docs/main v0.2 + latest Backend Employee controllers, DTO/errors, provisioned-account contract and security | API/field/error/role matrix; verified vs unresolved; no assumed endpoints |
| **CP0-C** | Employee feature boundaries, source ownership, actual demo scenario, deadline, device support choice | in/out-scope + user decision record + non-goals + blocker ledger; CP0 freeze |
| **CP1-A** | Operator jobs: login, find products, create, edit, inventory review, stock addition, post-save recovery | user-task flowcharts incl. alternate/error/back paths |
| **CP1-B** | Sitemap/navigation/entry/exit, entity identities, whether list/create/edit are routes or panels | proposed IA + route/return-context table + user approval gate |
| **CP2-A** | **Visually inspect** Mobbin candidates and additional appropriate comparable admin UI patterns | reference evidence cards: app/flow URL, observed structure, applicability, anti-patterns |
| **CP2-B** | Console art direction, density/typography/layout/chrome, comparison with Customer visual language | explicitly approved design direction with alternatives and justification |
| **CP3-A** | Audit Customer design tokens and actual shared primitives for table/form/modal/nav use | reuse matrix: exact reusable component, extend/new component, reason |
| **CP3-B** | Employee-specific control patterns, KRW inputs, form groups, dialogs, statuses, content hierarchy | component contract proposal + state variants; no premature new design system |
| **CP4** | Operational motion/feedback: navigation, save/invalid/conflict feedback, focus, reduced motion | minimal transition & feedback grammar inherited/extended from current runtime |
| **CP5-A** | GET lifecycle: skeleton, empty, invalid API payload, partial loading, stale data, retry | Employee read-state matrix and recovery invariants |
| **CP5-B** | Mutation lifecycle: dirty form, duplicate submit, 401/403, 409, field error, uncertain POST outcome, concurrent stock addition | mutation state machines + recovery/safety policy; Backend truth authoritative |
| **CP6-0** | Screen inventory + standard spec structure and readiness tracker | approved screen list; 20-section screen template adopted/adapted with documented N/A |
| **CP6-A** | Employee entry/auth/role gating + common app shell | individual screen/surface spec(s) covering direct URL, role wrong/expired |
| **CP6-B** | TourProduct list | individual screen spec; data, empty/error, information hierarchy, navigation |
| **CP6-C** | TourProduct create | individual screen spec; Theme/style-price fields and validation |
| **CP6-D** | TourProduct edit | individual screen spec; dirty state, existing data, linked Schedule 409 recovery |
| **CP6-E** | Inventory overview and positive stock addition | individual screen spec(s); current vs add quantity, uncertain outcome recovery |
| **CP6-F** | Cross-screen operation journeys and missing global surfaces | route/CTA/focus/modal/form consistency; screen tracker ready for audit |
| **CP6-G** | Cross-screen consistency audit | contradicting names/routes/states/errors fixed or explicitly raised |
| **CP6-H** | Shared contract and open/TBD audit | strict approved vs frontend proposal vs blocker matrix; no invention |
| **CP6-I** | Independent implementation-readiness audit | fresh-agent test: can build screens without guessing UX? explicit PASS/BLOCKED |
| **CP7-A** | Exact component/page/feature ownership against actual frontend code | architecture map, dependency, single auth/HTTP/DTO boundary; reuse matrix |
| **CP7-B** | Editor state ownership/validation, query and mutation boundaries | model/state/route graph, anti-pattern and test seam review |
| **CP8-A** | Employee DTOs, query keys, freshness, invalidation, mapping and cache safety | precise contract-to-view-model matrix and data lifecycle |
| **CP8-B** | 201/200 responses, conflicts, concurrency, uncertain success, retry safety and privacy | API-by-API mutation/recovery matrix, defined invariants |
| **CP9** | Responsive policy as approved in CP0-C; keyboard, screen reader, focus, table overflow, zoom | scoped per-screen accessibility/device acceptance; no unjustified mobile mandate |
| **CP10-A** | Product list/create/edit and Inventory acceptance + role errors | screen-by-screen unit/component/contract/E2E matrix |
| **CP10-B** | Cross-feature Employee journeys, negative tests, mock/real parity and smoke gates | critical journeys with expected Backend/MySQL evidence and severity gates |
| **CP11-A** | Full cross-doc audit + unresolved question escalation | all spec references reconciled, blockers/waivers explicit, final signoff |
| **CP11-B** | Build master implementation plan, PR/task cutlines and fresh-session handoff | approved implementation PR sequence, gate dependencies, coding-session briefing |

### Recommended chat-sized execution

- A single turn should typically handle **one meaningful investigation/decision unit**, or up to **two/three truly small subunits**, never an entire stage just because the model has room.
- Do not merge the entire UI spec (CP6-A..E) into one answer. Heavy units (editor create/edit and conflict/recovery) can be further cut to a `-1/-2` review before completion.
- Every CP turn: (1) mandatory source inspection; (2) findings with links and evidence; (3) clearly labeled confirmed/proposal/TBD; (4) user decisions only where needed; (5) draft artifact; (6) tests/audit of internal consistency; (7) explicit stop/next.
- **No CP gets COMPLETE solely because the chat message says so.** Write committed documents and update `01-PROGRESS-AND-HANDOFF.md` with source commit/PR or state clearly that changes are still chat-only.
- Do not automatically proceed over a decision/contract blocker; request one decision where needed. Do not expand scope to unrelated Customer/Voice/backend code.
- The project has a final report/presentation deadline per original assignment; CP0-C should revalidate schedule and reserve implementation/testing time instead of treating the planning package as endless.

## F. Screen specification contract (minimum)

Borrow the Customer [screen template](../planning/screens/_SCREEN-TEMPLATE.md), preserving 20 headings: purpose; route/entry; goal; data; desktop layout; **device layout if in approved support scope, otherwise explicit N/A**; exact section order; component composition; CTAs; interaction; motion; loading; empty; error; retry/refresh; edge cases; accessibility; API dependency; TBD/blockers; acceptance criteria.

Each screen also needs: version/date; owner; state (`DRAFT/REVIEW/READY/BLOCKED`); approved SSOT version and evidence source; links to upstream CPs; realistic data/invalid/role paths; named transitions into other screens; any deliberately rejected UX alternatives. Screen **ready** is not equal to Backend **integration ready**.

## G. Review gates and document delivery strategy

Proposed milestone PRs to keep ChatGPT sessions recoverable and reviews bounded:

| Delivery | CP coverage | Requirement before next |
| --- | --- | --- |
| **P0 PR (now)** | This program, Mobbin candidate inventory, continuity ledger | explicit approval, merge before P1 |
| **P1-1** | CP0–CP1 | up-to-date code/contract inventory, user-approved scope/IA |
| **P1-2** | CP2–CP5 | visually verified reference study, design/state-system decisions |
| **P1-3** | CP6-0 through CP6-F | individually reviewable screen specs, no G/H/I premature claim |
| **P1-4** | CP6-G/H/I | audit/contract/readiness gates, corrections applied |
| **P1-5** | CP7–CP11 | architecture/API/QA/final implementation handoff; recheck and amend earlier specs |

A stage may require multiple PRs if too large. Within a stage, **commit completed checkpoint outputs** and update the progress ledger; do not wait until one huge final upload. Avoid parallel forks with inconsistent contract versions. Use docs-first changes in `WonhoOne/docs` only if a real shared-contract gap is found and approved by the team; never silently redefine shared fields in frontend docs.

P0 is **not** the P1-5 final implementation master plan. No Employee production code, routes or new API definitions in P0 or P1 PRs.

## H. Source-of-truth and document conventions

```text
1. WonhoOne/docs/main latest approved Shared SSOT (Baseline, requirements, business rules, REST, ownership)
2. frontend/AGENTS.md and actually merged runtime behavior (implementation facts, not a contract override)
3. docs/employee-console/00-PLANNING-PROGRAM.md (governs CP process, after P0 merge)
4. docs/employee-console/01-PROGRESS-AND-HANDOFF.md (latest actual stage/next action)
5. docs/employee-console/planning/CP*.md (created as work completes)
6. docs/employee-console/planning/screens/*.md and audits/*.md (created at CP6)
7. Historical Customer planning set and closed PR #44 (references only)
```

Code vs contract contradiction: identify exact file/line and required owner; do not "resolve" a domain/API discrepancy by changing the UI. `docs/main` unmerged PR is PROPOSAL, not SSOT. Every decision uses:
- `CONFIRMED` (approved requirement/contract/team choice);
- `FRONTEND PROPOSAL` (suggested implementation UX);
- `TBD` (requires user choice or more research);
- `BLOCKED BY SHARED CONTRACT` (requires a missing or changed approved shared contract).

The status matrix must distinguish **PLANNED vs DRAFT vs REVIEW vs COMPLETE**, with evidence commit and next action. Do not report an unexecuted test as passed.

## I. Final gate to authorize implementation (P1 → P2)

Require all of:
1. Approved Employee device/scope, IA, UX direction and finished complete screen inventory.
2. Screen-by-screen specs with no unresolved **critical** layout/interaction/validation/route guessing.
3. Screen consistency, approved-shared-contract and fresh-implementation-session audits documented.
4. Backend API authority/authorization/validation known; any Backend contract deltas approved and checked.
5. Data lifecycle, authentication/session, optimistic/concurrency/retry and error recovery policies established.
6. Component architecture and state ownership reconciled against latest source.
7. Employee critical-journey QA and API real-integration acceptance documented.
8. PR-sized implementation roadmap and handoff, with exact required reading/source pointers.
9. Owner approval of P1 completion.

Only then start Employee Console coding.

## J. Durable cross-chat handoff discipline

Read [01-PROGRESS-AND-HANDOFF.md](01-PROGRESS-AND-HANDOFF.md) and the last committed CP artifact at each new chat.

1. Verify P0 PR merge and latest `frontend/main`/approved `docs/main` before trusting status.
2. Read `AGENTS.md`, this program and last CP artifact. Check `01-PROGRESS-AND-HANDOFF.md` for `next_checkpoint`.
3. Do only that checkpoint; inspect required upstream sources. If no tool access, state the limitation and do not invent.
4. At completion, write/update the CP file and ledger on a **real** checkpoint/stage branch, report URLs and exact status.
5. Do not begin next CP until user requests continuation/approves a necessary decision.
6. If a chat interrupts before a commit, ledger remains not completed; next session rechecks evidence rather than assuming continuity.

**Copy-ready next-chat request:** "Review WonhoOne/frontend/docs/employee-console/README.md, 00-PLANNING-PROGRAM.md, 01-PROGRESS-AND-HANDOFF.md and frontend/AGENTS.md plus latest docs/main. Check whether the P0 planning PR was merged and resume only the ledger's next_checkpoint. Do not code or claim a checkpoint complete without committing its artifacts and updating the ledger."
