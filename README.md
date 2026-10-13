# Mister World Frontend

Customer and Employee web frontend for Mister World. The customer journey is implemented; the Employee Console is the next frontend implementation scope.

## Start here

- **Current Employee Console scope and execution plan:** [`docs/implementation/EMPLOYEE-CONSOLE-IMPLEMENTATION-PLAN.md`](docs/implementation/EMPLOYEE-CONSOLE-IMPLEMENTATION-PLAN.md)
- **Current responsibility and coding rules:** [`AGENTS.md`](AGENTS.md)
- **Customer/Voice B9 completion evidence:** [`WonhoOne/docs/B9-INTEGRATION-CLOSEOUT.md`](https://github.com/WonhoOne/docs/blob/main/B9-INTEGRATION-CLOSEOUT.md)
- Older customer planning documents preserve historical planning decisions and are not a current "start foundation" instruction.

- **Implementation start handoff:** [`docs/IMPLEMENTATION-START-HANDOFF.md`](docs/IMPLEMENTATION-START-HANDOFF.md)
- Frontend documentation: [`docs/README.md`](docs/README.md)
- Frontend planning index: [`docs/planning/00-PLANNING-INDEX.md`](docs/planning/00-PLANNING-INDEX.md)
- Implementation handoff: [`docs/planning/12-IMPLEMENTATION-HANDOFF.md`](docs/planning/12-IMPLEMENTATION-HANDOFF.md)
- Source-structure guide: [`src/README.md`](src/README.md)

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

The application scaffold, shared UI, router, test harness and Customer/Voice features have already been implemented. The planned Employee Console should extend the existing application structure and reuse its Backend/auth boundaries rather than restart the foundation.


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

Mock handlers and scenarios are development-only; consult the approved docs/main contract and production mock-safety rules before changing them.

## Verification

```bash
npm run verify
npx playwright install chromium
npm run test:e2e
```

`npm run verify` runs typecheck, lint, formatting, unit/component tests, and the production build. Playwright runs the browser E2E suite, including implemented Customer/Voice journeys; Employee Console E2E coverage is planned separately.


### Development scenarios

When browser mocking is enabled, a development-only scenario selector is mounted in the app:

```bash
VITE_ENABLE_MOCKS=true npm run dev
```

The selected scenario is stored in the URL as `mockScenario`, for example:

```text
/?mockScenario=network-error
```

The registry contains scenario identities only. Backend endpoint, DTO, and response payload shapes are added later only when their contracts are approved. Production builds do not include or mount the scenario selector.
