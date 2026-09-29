# Source Structure

This directory is the human-facing application structure for the Mister World customer frontend.

The repository intentionally keeps the top-level source model small:

```text
src/
├── app/           # app bootstrap, providers, router, global config/error boundaries
├── pages/         # route-level page composition
├── features/      # user-facing business features and their local models/state
├── integrations/  # external boundaries such as Backend API and Voice
├── shared/        # business-agnostic reusable UI, motion, hooks, utilities, assets
└── mocks/         # contract-safe development fixtures/scenarios
```

## Ownership rule

```text
Backend DTO
→ integrations adapter
→ feature-local frontend model
→ feature/page UI
```

Frontend-facing models should stay close to the feature that owns them instead of creating a second top-level domain hierarchy.

Do not let raw Backend DTOs leak into page components, and do not turn mock shapes into de facto API contracts.

The detailed architecture and contract gates live in:

- `docs/planning/08-COMPONENT-ARCHITECTURE.md`
- `docs/planning/12-IMPLEMENTATION-HANDOFF.md`
