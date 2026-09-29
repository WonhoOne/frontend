# Frontend Agent Instructions

This repository implements the Mister World **Customer GUI**.

`WonhoOne/docs` **main** is the approved common SSOT. Implementation must use the **latest approved baseline present on `docs/main`**; as of 2026-09-30 this is **v0.1.2**. A docs feature branch is a proposal and must not be treated as approved until merged into `docs/main`.

## Mandatory reading before implementation

Before writing or modifying code, read the latest approved documents in `WonhoOne/docs/main`:

1. `baseline/BASELINE-v0.1.2.md`
2. `requirements/requirements.md`
3. `requirements/product-catalog.md`
4. `requirements/domain-model.md`
5. `requirements/business-rules.md`
6. `requirements/non-functional-requirements.md`
7. `architecture/system-architecture.md`
8. `architecture/repository-responsibilities.md`
9. `api/api-spec-draft.md`
10. `CONTRIBUTING.md`
11. `AGENTS.md`

Then read the frontend-owned implementation package:

1. `docs/implementation/IMPLEMENTATION-MASTER-PLAN.md`
2. the relevant `docs/implementation/checkpoints/CP*.md`
3. `docs/planning/00-PLANNING-INDEX.md`
4. the relevant `docs/planning/screens/*.md`
5. `docs/planning/12-IMPLEMENTATION-HANDOFF.md`

The CP6-H / CP6-I audit files under `docs/planning/audits/` are historical evidence. Their v0.1.1/H-03 conclusions were superseded by Shared Baseline v0.1.2.

Docs repository: https://github.com/WonhoOne/docs

Do not begin implementation against an unapproved local assumption when the required shared contract is missing.

## Frontend responsibilities

- React + TypeScript Customer GUI
- Login / product browsing / option selection / reservation / travel-history screens
- Backend API integration
- Frontend validation for user experience
- Frontend tests

## Cross-repository access

- `WonhoOne/frontend` is this Agent's writable implementation area.
- `WonhoOne/backend` and `WonhoOne/ai-console` are **read-only by default**.
- Their code may be inspected for API usage, integration debugging, and impact analysis.
- Do not modify, commit to, or open implementation PRs against those repositories unless their Owner or the team explicitly delegates the task.
- If another repository needs a change, create/request an Issue for its Owner with the required behavior, contract impact, and reproduction context.

## Non-negotiable rules

- Use the approved Backend API contract. Do not invent endpoint paths or shared request/response fields.
- Do not access MySQL or any persistence layer directly.
- UI validation may mirror shared business rules, but Backend remains the final authority.
- Do not create a second independent source of truth for business rules.
- Do not silently change Domain terminology, API contracts, or shared requirements.
- Do not resolve TBD items by assumption.
- If a required API or contract is missing, surface the gap and propose a docs/API change before depending on it.
- Do not implement Backend or Voice Recognition logic in this repository.
- If code and docs conflict, stop and surface the conflict.
- Keep raw Backend DTOs behind frontend adapters/view models; do not let draft API shapes spread through page components.

## Mocking

Mocks are allowed for parallel development. Keep them clearly marked and behind the frontend data/view-model boundary. A mock shape is **not** an approved Backend contract.

## PR expectations

Every implementation PR should identify:

- related Requirement IDs
- affected screens / flows
- Backend API endpoints used
- tests executed
- responsive / accessibility checks
- whether any shared contract assumption was required

Use `.github/pull_request_template.md` as the default evidence format.
