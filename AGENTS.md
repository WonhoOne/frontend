# Frontend Agent Instructions

This repository implements the Mister World **Customer GUI**, **Employee Console**, **Frontend ↔ Backend live integration**, and scoped **AI Voice browser/runtime integration** in the approved Voice directories. The normal Frontend repository owner remains **김태우**; **이한결** owns only the scoped AI Voice implementation described below.

`WonhoOne/docs` **main** is the approved common SSOT. Always use the **latest approved baseline and contracts present on `docs/main`**; it currently includes **Baseline v0.2** (`baseline/BASELINE-v0.2.md`). A docs feature branch or unmerged PR is a proposal and must not be treated as approved until merged into `docs/main`.

## Mandatory reading before implementation

Before writing or modifying code, read the latest approved documents in `WonhoOne/docs/main`:

1. The latest approved baseline (currently `baseline/BASELINE-v0.2.md`)
2. `requirements/requirements.md`
3. `requirements/product-catalog.md`
4. `requirements/domain-model.md`
5. `requirements/business-rules.md`
6. `requirements/non-functional-requirements.md`
7. `architecture/system-architecture.md`
8. `architecture/repository-responsibilities.md`
9. `architecture/voice-contract.md`
10. `api/api-spec-draft.md` (current approved REST API contract)
11. `CONTRIBUTING.md`
12. `AGENTS.md`

Then read `README.md`, `src/README.md`, and the frontend-owned implementation package:

1. `docs/implementation/IMPLEMENTATION-MASTER-PLAN.md`
2. the relevant `docs/implementation/checkpoints/CP*.md`
3. `docs/planning/00-PLANNING-INDEX.md`
4. the relevant `docs/planning/screens/*.md`
5. `docs/planning/12-IMPLEMENTATION-HANDOFF.md`

The CP6-H / CP6-I audit files under `docs/planning/audits/` are historical evidence. Their v0.1.1/H-03 conclusions were superseded by Shared Baseline v0.1.2.

Docs repository: https://github.com/WonhoOne/docs

Do not begin implementation against an unapproved local assumption when the required shared contract is missing.

## Frontend responsibilities

### 김태우 — normal Frontend owner

- React + TypeScript Customer GUI
- Login / product browsing / option selection / reservation / travel-history screens
- Employee Console
- Frontend ↔ Backend live integration
- Frontend UI, features, validation for user experience, and tests
- Coordination with the AI Voice owner at existing Feature boundaries

### 이한결 — scoped AI Voice exception

Voice implementation write scope is limited to exactly:

- `src/integrations/voice/**`: SpeechRecognition/STT adapter, Web Speech API boundary, transcript normalization, parser/interpreter, matcher, synonyms, canonical `VoiceCommand` implementation, and Voice-local confidence/retry logic.
- `src/features/voice-bridge/**`: canonical `VoiceCommand` mapping to existing Feature action/query/mutation boundaries and `ReservationDraft` actions, GUI-context validation, and non-destructive bridge behavior.

Web Speech API and `ReservationDraft` run in the same browser runtime, and both Voice directories already have placeholders. A separate ai-console runtime/package synchronization is unnecessary. These directory assignments do not transfer ownership of the whole Frontend repository to 이한결. 주원호 has no current primary implementation scope under the approved responsibility document.

## Cross-repository access

- Normal Frontend files remain owned by 김태우. AI Voice work may write **only** inside `src/integrations/voice/**` and `src/features/voice-bridge/**`.
- For AI Voice work, all Frontend files outside those two directories are **read-only by default**, including existing Features, pages/components, Employee Console, Backend adapters, and repository guidance. Changes needed there require Frontend owner handoff or explicit delegation for the specific task and files.
- The Voice V0-B2 edit to `AGENTS.md` is a **one-time Project Control Tower/user cross-owner reconciliation exception for this file only**. It grants no ongoing or broader Frontend write permission.
- Backend, docs, and ai-console ownership and access boundaries remain governed by `docs/main` and `architecture/repository-responsibilities.md`. Other repositories are **read-only by default** for this Frontend/Voice task; shared contracts follow the docs-first workflow.
- `WonhoOne/ai-console` is a historical/legacy repository with no current primary implementation owner for new active features. Do not start new Voice or Employee Console implementation there without an approved responsibility change.
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
- Do not implement Backend business/service logic in this repository.
- AI Voice Recognition and interpretation logic is allowed **only** inside the two approved Voice-owned Frontend directories. Do not spread Voice logic into arbitrary pages/components or create a second business-rule authority.
- If code and docs conflict, stop and surface the conflict.
- Keep raw Backend DTOs behind frontend adapters/view models; do not let draft API shapes spread through page components.

## Voice semantic boundary

Follow the current approved `architecture/voice-contract.md` without changing canonical commands, their args, or their semantics. The approved flow is:

```text
Speech
→ STT
→ command interpretation
→ canonical VoiceCommand
→ Frontend voice bridge
→ existing Feature action/query/mutation boundary
→ Backend validation where applicable
```

- Voice may safely create or update `ReservationDraft` through existing Frontend Feature actions. The bridge validates GUI context; invalid, ambiguous, or unrecognized commands make no destructive state change, and unsupported combinations are rejected rather than silently substituted.
- Voice must not automatically submit/create a Reservation or invoke automatic `POST /api/v1/reservations` from recognition. **GUI review + explicit user submit remains required** (FR-12, FR-13, BR-28).
- Voice must not enter Login/Signup credentials, cancel/refund/pay, perform free-form travel recommendation/search, or mutate Employee Console state.
- Voice must not directly access MySQL, bypass Backend validation, or create Voice-specific Backend REST endpoints. Use only approved APIs through existing Frontend Feature boundaries.
- Backend remains the final authority for schedule availability, party size, Theme/Style, transport capacity, configuration, price, and Reservation creation (BR-12, BR-26). Frontend/Voice validation does not replace it.
- GUI fallback remains available when recognition fails.

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

A Voice implementation PR should also identify:

- affected canonical Voice commands
- affected files within the two Voice-owned directories and any explicit delegation for changes outside them
- Draft mutation / bridge behavior
- confirmation that recognition cannot submit a Reservation
- tests executed (canonical command + args interpretation, rather than raw transcript equality)
- shared contract changed: YES / NO
