# Mister World Frontend

Customer-facing web GUI for Mister World.

## Start here

- Frontend documentation: [`docs/README.md`](docs/README.md)
- Frontend planning index: [`docs/planning/00-PLANNING-INDEX.md`](docs/planning/00-PLANNING-INDEX.md)
- Implementation handoff: [`docs/planning/12-IMPLEMENTATION-HANDOFF.md`](docs/planning/12-IMPLEMENTATION-HANDOFF.md)
- Development rules: [`AGENTS.md`](AGENTS.md)

## Shared source of truth

Business requirements, domain rules, architecture, API contracts, and shared repository policy are owned by [`WonhoOne/docs`](https://github.com/WonhoOne/docs).

Do not duplicate shared contracts in this repository. Frontend documentation should reference the shared SSOT and contain only frontend-specific planning, UX, architecture, implementation, and QA guidance.

## Repository layout

```text
frontend/
├── README.md
├── AGENTS.md
├── .github/
│   └── pull_request_template.md
├── docs/
│   ├── README.md
│   └── planning/
│       ├── 00-PLANNING-INDEX.md
│       ├── 01-... through 12-...
│       ├── screens/
│       └── audits/
└── src/                 # created with the implementation foundation
```

The application source tree is intentionally not filled with empty placeholder directories. It will be created by the first implementation foundation PR according to `docs/planning/08-COMPONENT-ARCHITECTURE.md`.
