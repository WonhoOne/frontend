# Transaction Core C10 — Shared Contract Convergence Gate

> Date: 2026-09-30  
> Frontend branch: `feat/reservation-draft-configure`  
> Shared SSOT reviewed: `WonhoOne/docs/main`  
> Shared docs commit: `46fd61af7dc0ac4770305e7088c4e4ded9b78892`  
> Latest approved baseline: **v0.1.2**

## Gate result

C10 reviewed the approved Shared Contract again before changing any contract-dependent transaction behavior.

The API v0.2 proposal is still not approved at this checkpoint:

- docs PR #6: `docs: define shared API v0.2 contract`
- state: **OPEN**
- proposal head: `b4451eba8f3e13f60b74e555c7b532a47c619a01`
- rule: an unmerged docs PR is not implementation SSOT

Therefore PR-05 does **not** converge to proposal-only DTOs, option IDs, limits, capacities, or price rules.

## Approved transaction semantics applied now

The current implementation may rely on:

- General Reservation `participantCount`: integer >= 1.
- Honeymoon Reservation `participantCount`: integer >= 2 and even.
- Valid Honeymoon `coupleCount = participantCount / 2`.
- `CLASSIC`, `GRAND`, and `PREMIUM` TourStyle values.
- TourConfiguration meaning includes Hotel, Transport, Meal, and additional options.
- Backend remains final authority for business validation.
- Draft starts with no implicit participant-count default.

## Contract-dependent areas that remain blocked

Until a successor baseline is actually merged to `docs/main`, PR-05 must not invent:

- Backend resource identifier wire types or DTO field names.
- Participant maximum.
- TourSchedule capacity or capacity-based option rules.
- Participant-count effects on price or option availability.
- Canonical Hotel / Transport / Meal / Extra option IDs.
- Configuration option catalog, compatibility, availability, or API representation.
- Extras selection wire representation.
- Price formula, currency representation, option price deltas, participant price effects, or rounding.
- Loyalty eligibility, rate, stacking, or calculation.
- New configuration, validation, or price endpoints absent from the approved API skeleton.

## PR-05 convergence status

C1–C9 already preserve the approved boundary:

- `ReservationDraft` uses frontend route-safe string identity without claiming a Backend wire ID.
- Configuration fixtures use `fixture:...` selection keys and expose no canonical option IDs.
- Participant validation has no invented maximum.
- Configuration models expose no transport capacity rule.
- Price is presentation-only through `PriceDisplayModel`; Frontend does not calculate totals or Loyalty discounts.
- ReservationDraft stores transaction intent only, not price, availability, Reservation status, auth data, or raw DTOs.

C10 adds an executable regression test for these boundaries.

## Re-convergence rule

If a newer Shared Contract is merged to `docs/main` before PR-05 final audit, the final audit must compare PR-05 against that newly approved contract and update only the fields and rules that are explicitly closed there.

Proposal branches and unmerged PRs remain non-authoritative even if they contain more detailed values.
