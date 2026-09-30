# Transaction Core C11 — Session B Handoff Integration

> Date: 2026-09-30  
> Transaction branch: `feat/reservation-draft-configure`  
> Session B branch observed: `feat/discovery-home-tours`  
> Session B PR observed: frontend PR #10 — `feat: implement Discovery Home and Tours`

## Dependency finding

At the C11 checkpoint, Session B has an open PR for Discovery Home + Tours. A `feat/discovery-tour-detail` branch has now been created, but it currently points to the exact same commit as `feat/discovery-home-tours`:

- both heads: `40428a3ac8e3c1b3374d9a79a4d61b5a52a4d0e4`
- branch comparison: `identical`
- additional Tour Detail commits: `0`
- additional Tour Detail files: `0`
- Tour Detail PR: not present

The PR #10 diff contains Home/Tours discovery surfaces and public `tour-discovery` exports. It still does not contain a Tour Detail transaction handoff implementation.

Therefore C11 must not modify Session B-owned Tour Detail code or invent its private component contract.

## PR-05 public inbound handoff

PR-05 now exposes one transaction-owned handoff action factory:

`createConfigureHandoffAction(intent, updatedAt)`

Required input:

- `tourProductId`
- selected `tourStyle`
- selected `tourScheduleId`

The resulting `BEGIN_CONFIGURE` reducer action atomically:

- creates a clean transaction for the selected TourProduct,
- keeps the selected Style,
- keeps the selected Schedule,
- leaves `participantCount = null`,
- clears Hotel / Transport / Meal / Extras from any previous transaction,
- does not store price, availability, auth, server objects, or navigation state.

Navigation remains page-owned.

The future Tour Detail page should coordinate only public interfaces:

```text
dispatch(
  createConfigureHandoffAction(
    { tourProductId, tourStyle, tourScheduleId },
    Date.now(),
  ),
)

navigate(routeBuilders.configure(tourProductId))
```

It must not import reservation reducer internals, Configure private files, or Session C hidden modules.

## Why the handoff is atomic

The earlier low-level actions `START_DRAFT`, `SELECT_TOUR_STYLE`, and `SELECT_SCHEDULE` remain valid reducer operations, but an upstream page should not need three sequential dispatches to start Configure.

The public C11 handoff creates one reducer transition so persistence cannot intentionally observe a half-started transaction between product/style/schedule setup steps.

## Integration proof without ownership violation

C11 includes a page-level integration test with a contract-only synthetic caller representing the future Tour Detail page.

The test uses only:

- public reservation exports,
- `routeBuilders.configure`,
- the existing Configure page.

It begins with a fully configured Draft for another TourProduct and proves that the handoff:

- replaces the old product transaction,
- routes to the selected product Configure URL,
- preserves selected Style and Schedule,
- resets participant count,
- resets prior configuration choices,
- persists the clean new Draft,
- leaves Review disabled until required Configure choices are completed.

No production file under `features/tour-detail`, `features/tour-discovery`, or Session B pages is changed by C11.

## Remaining dependency

Actual user-click wiring inside the real Tour Detail screen remains blocked until Session B adds real Tour Detail commits/public surface and opens or otherwise exposes PR-04 work.

When that public surface exists, integration should happen at the page/coordinator boundary using the public action and public route above. The transaction feature should not import Session B internals.

C11 is complete when the PR-05 side of the handoff is implemented, tested, and ownership-audited. The actual PR-04 button wiring is a cross-session dependency, not a reason to invent Session B code inside PR-05.
