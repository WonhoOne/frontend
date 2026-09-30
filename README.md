# Mister World Frontend

Customer-facing web GUI for Mister World.

## Start here

- **Implementation start handoff:** [`docs/IMPLEMENTATION-START-HANDOFF.md`](docs/IMPLEMENTATION-START-HANDOFF.md)
- Frontend documentation: [`docs/README.md`](docs/README.md)
- Frontend planning index: [`docs/planning/00-PLANNING-INDEX.md`](docs/planning/00-PLANNING-INDEX.md)
- Implementation handoff: [`docs/planning/12-IMPLEMENTATION-HANDOFF.md`](docs/planning/12-IMPLEMENTATION-HANDOFF.md)
- Source-structure guide: [`src/README.md`](src/README.md)
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
│   ├── IMPLEMENTATION-START-HANDOFF.md
│   └── planning/
│       ├── 00-PLANNING-INDEX.md
│       ├── 01-... through 12-...
│       ├── screens/
│       └── audits/
├── public/
├── src/
│   ├── README.md
│   ├── app/
│   │   ├── router/
│   │   ├── providers/
│   │   ├── config/
│   │   └── errors/
│   ├── pages/
│   ├── features/
│   ├── integrations/
│   │   ├── backend/
│   │   └── voice/
│   ├── shared/
│   └── mocks/
└── tests/
    └── e2e/
```

The source directories are intentionally tracked before the React scaffold so every contributor starts from the same human-readable structure. The first implementation foundation PR fills this skeleton with the app bootstrap, tokens, shared UI, router, test harness, and mocks.


## Local development

Use the repository Node version and clean dependency install:

```bash
nvm use
npm ci
npm run dev
```

Browser API mocking is opt-in and development-only:

```bash
VITE_ENABLE_MOCKS=true npm run dev
```

Foundation intentionally ships with an empty shared MSW handler registry. Add Product handlers only after the relevant Backend contract is approved.

## Verification

```bash
npm run verify
npx playwright install chromium
npm run test:e2e
```

`npm run verify` runs typecheck, lint, formatting, unit/component tests, and the production build. The PR-01 Playwright baseline runs Chromium Foundation smoke tests.
