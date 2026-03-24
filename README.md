# DevBoard

A project and task management dashboard built as a React 19 starter kit reference.

## Tech stack

| Library | Version |
|---|---|
| React | 19.2.0 |
| TypeScript | 5.8.3 |
| Vite | 6.3.2 |
| React Router | 7.5.1 |
| TanStack Query | 5.95.2 |
| Zustand | 5.0.3 |
| React Hook Form | 7.54.2 |
| Zod | 3.24.2 |
| i18next / react-i18next | 25.1.3 / 15.5.1 |
| Tailwind CSS | 4.1.4 |
| Biome | 2.0.0 |
| Vitest | 3.1.1 |
| MSW | 2.7.0 |

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9

## Getting started

```bash
pnpm install
cp .env.example .env
# set VITE_API_BASE_URL=http://localhost:3001
pnpm dev:all
```

`dev:all` starts the Vite dev server and the JSON Server mock API concurrently.

## Available scripts

| Script | Description |
|---|---|
| `dev` | Start Vite dev server |
| `dev:all` | Start dev server + mock API |
| `mock:api` | Start JSON Server on port 3001 |
| `build` | TypeScript check + Vite production build |
| `lint` | Run Biome linter |
| `lint:fix` | Auto-fix lint issues |
| `format` | Auto-format with Biome |
| `test` | Vitest in watch mode |
| `test:run` | Vitest single run |
| `test:cov` | Vitest with coverage report |

## Project structure

```
src/
├── app/        # Bootstrap: router, providers, layout (Header, AppLayout)
├── features/   # Feature modules: home, projects, tasks
├── api/        # Axios client, Zod-validated services, TanStack Query hooks
├── shared/     # UI components, Zustand store, types, utilities
├── i18n/       # i18next config + EN/FR translation JSONs
└── tests/      # Vitest setup, MSW server and handlers, test utilities
```

## Architecture decisions

- **Feature-based structure** — each feature owns its pages, components, schemas, and tests
- **TanStack Query** for all server state; Zustand for UI-only state (theme)
- **Zod at API boundaries** — every service response is parsed before use; types are inferred from schemas, never manually declared
- **i18next** manages EN/FR language switching natively; language preference is persisted in `localStorage` — not in the Zustand store
- **MSW** intercepts API calls in tests; unhandled requests throw to prevent silent test pass with missing mocks
- **Biome** handles both linting and formatting; strict TypeScript (`noUncheckedIndexedAccess`, `noUnusedLocals`)
