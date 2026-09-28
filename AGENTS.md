# Frontend Agent Instructions

This repository implements the Mister World **Customer GUI**.

## Mandatory reading before implementation

Before writing or modifying code, read the latest approved documents in `WonhoOne/docs`:

1. `baseline/BASELINE-v0.1.md`
2. `requirements/requirements.md`
3. `requirements/domain-model.md`
4. `requirements/business-rules.md`
5. `architecture/system-architecture.md`
6. `architecture/repository-responsibilities.md`
7. `api/api-spec-draft.md`
8. `CONTRIBUTING.md`
9. `AGENTS.md`

Docs repository: https://github.com/WonhoOne/docs

Do not begin implementation against an unapproved local assumption when the required baseline is not yet available on the approved docs branch.

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

## Mocking

Mocks are allowed for parallel development, but they must follow the approved API/domain contract. Clearly mark mock-only behavior and remove or replace it when real Backend integration is available.

## PR expectations

Every implementation PR should identify:

- related Requirement IDs
- affected screens / flows
- Backend API endpoints used
- tests executed
- whether any shared contract assumption was required
