# Transaction Core C12 — Configure Quality Audit

> Date: 2026-09-30  
> Branch: `feat/reservation-draft-configure`  
> Scope: PR-05 ReservationDraft + Configure quality gate  
> Automated browser: Chromium

## Result

C12 passes for the implemented PR-05 scope.

No production Configure code change was required by this checkpoint. The audit added browser-level coverage for gaps that were not explicit in C5–C11 and verified that the existing implementation already satisfies them.

Final successful audit run before checkpoint cleanup:

- GitHub Actions run: `36725753342`
- repository unit/component: **35 files / 169 tests PASS**
- Configure quality + transaction browser suite: **33 / 33 PASS**
- production build: PASS

## Responsive matrix

The audit verifies no horizontal overflow at:

- 320px
- 390px
- 430px
- 640px — used as the 1280px-at-200%-zoom equivalent CSS viewport check
- 768px
- 1024px
- 1280px

The complete mobile Configure flow is also exercised at 320px, 390px, 430px, 768px, and 1023px.

At 1024px the Desktop sticky summary is present and the duplicate mobile action bar is absent.

## Keyboard and focus

A browser test completes the implemented Configure task without pointer input:

1. keyboard focus reaches Participants,
2. participant count is entered,
3. Hotel is selected,
4. Transport is selected,
5. Meal is selected,
6. Review receives focus,
7. Enter navigates to Review.

The audit also verifies:

- OptionCard focus-visible styling is actually rendered when its native radio receives keyboard focus.
- Route navigation moves focus to the application main landmark.
- Mobile BottomSheet Escape close and trigger focus return remain covered by the existing mobile regression suite.

## Semantics and validation

The browser audit verifies:

- one H1 on Configure,
- Hotel / Transport / Meal expose named native radio groups,
- participant validation sets `aria-invalid=true`,
- validation copy is programmatically connected through `aria-describedby`,
- invalid configuration selection exposes an alert,
- invalid selection is not silently replaced.

The underlying controls remain native input/button semantics rather than pointer-only custom controls.

## Touch and mobile resilience

At 320px, the audit verifies at least 44px height for the interactive surfaces used by the task:

- participant input,
- option-card label target,
- mobile summary trigger,
- mobile Review button.

A contracted 390x420 viewport is used as an automated approximation of a reduced visual viewport while the participant input is focused. The focused input remains above the fixed mobile summary bar.

This does not claim to emulate every iOS/Android software-keyboard implementation; device-specific keyboard behavior remains part of broader release/device QA.

## State and recovery matrix

A dedicated test-only Configure state fixture exercises the real Configure components with explicit presentation states.

Verified:

- loading → option-shaped Skeletons, no generic progress spinner,
- reduced motion → Skeleton shimmer disabled,
- 500-style group failure → local error and group-scoped retry,
- partial group failure → successful Hotel/Meal state preserved and Review blocked only by the affected required group,
- invalid selection → alert, previous selection retained, no automatic replacement,
- refreshing → successful options retained with status,
- stale → successful options retained with status,
- offline → explicit connectivity status without inventing a new Review policy,
- price loading → Skeleton rather than zero/fabricated total,
- price error → previous total and transaction intent preserved,
- price retry → price-local retry.

Existing recovery E2E continues to cover:

- Configure → Review → browser Back,
- refresh rehydration,
- route mismatch with saved-Draft preservation,
- corrupt sessionStorage recovery,
- direct Review without Draft.

## Rapid selection

The audit rapidly changes Hotel A → Hotel B after selecting sibling groups.

It verifies:

- the latest Hotel intent wins,
- Transport remains selected,
- Meal remains selected,
- the persisted Draft contains the same latest selections.

## Reduced motion

C12 verifies:

- Configure BottomSheet animation is removed under `prefers-reduced-motion: reduce`,
- Configure loading Skeleton shimmer is removed under reduced motion.

## Contract and scenario boundaries

C12 does not create behavior for unresolved Shared Contract areas.

The Configure screen remains mock-backed and contract-neutral.

### Image failure

S04 Configure currently renders no configuration images in the contract-neutral fixture; every option has `visual: null`.

Therefore an image-failure state is **N/A for the current implemented S04 surface**. C12 does not add a fake production image solely to satisfy a QA row. If option imagery is introduced later, local image-failure handling becomes required.

### Slow-network timing

PR-05 has no approved/live Configure network adapter or option endpoint. Therefore C12 does not pretend that a real 1200ms/3000ms request exists.

The browser state fixture verifies the user-visible loading/error/refresh semantics that PR-05 owns. Actual latency/network integration belongs to the later live-adapter phase once the contract is approved.

### Browser coverage

C12's repository automation is Chromium-based, consistent with the current PR-05 Playwright setup. Cross-engine Safari/Firefox/device coverage remains part of the wider release QA matrix and is not claimed as completed by this checkpoint.

## Exit verdict

For the implemented PR-05 scope:

- responsive layout: PASS
- keyboard-only task: PASS
- focus behavior: PASS
- semantic labels/groups: PASS
- validation association: PASS
- touch target checks: PASS
- reduced motion: PASS
- state/recovery behavior: PASS
- rapid selection latest-intent rule: PASS
- Draft persistence/recovery regression: PASS
- production build: PASS
- hidden Shared Contract invention: none introduced by C12

C12 is complete. PR-05 still requires C13 final audit before Session C lifecycle completion.
