# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev:all        # Start dev server + mock API (JSON Server on :3001) — preferred for local dev
pnpm dev            # Dev server only (requires VITE_API_BASE_URL set externally)
pnpm mock:api       # Start JSON Server mock API alone
pnpm build          # tsc + vite build
pnpm lint           # Biome lint
pnpm lint:fix       # Biome lint with auto-fix
pnpm format         # Biome format
pnpm test           # Vitest watch mode
pnpm test:run       # Vitest single run
pnpm test:cov       # Vitest with coverage
```

Run a single test file:
```bash
pnpm test src/features/projects/__tests__/ProjectsPage.test.tsx
```

## Environment

Requires `VITE_API_BASE_URL` — the axios client throws at startup if missing. When using `pnpm dev:all`, JSON Server runs at `http://localhost:3001` and this variable should point there.

## Architecture

**Stack:** React 19, TypeScript, Vite, TanStack Query, Zustand, React Router 7, Zod, React Hook Form, Axios, i18next, Tailwind CSS v4, Radix UI, Biome, Vitest + MSW.

### Layer structure

```
src/
├── app/          # Bootstrap: router, providers, layout (Header, AppLayout)
├── features/     # Feature modules (home, projects, tasks)
├── api/          # Data access: axios client, services (raw fetch), query hooks (TanStack Query)
├── shared/       # Cross-cutting: UI components, Zustand stores, types, utils
├── i18n/         # i18next config + EN/FR translation JSONs
└── tests/        # Vitest setup, MSW server, shared test utilities & handlers
```

### Data flow

`Page` → `useXxxQuery` (TanStack Query hook) → `xxxService` (Axios call) → Zod parse → typed data back up.

Mutations follow the same path and call `queryClient.invalidateQueries` on success.

### Feature module conventions

Each feature (`projects`, `tasks`) owns:
- `pages/` — route-level component (lazy-loaded via router)
- `components/` — feature-specific UI
- `schemas/` — Zod schemas and inferred TypeScript types (single source of truth for types)
- `__tests__/` — integration tests

### State management

- **Server state** → TanStack Query (staleTime: 5 min, retry: 1)
- **UI/global state** → Zustand (`useAppStore`), persisted to `localStorage` under key `app-store`. Currently stores only `theme`.
- **Language** → managed natively by i18next; persisted to `localStorage` under key `app-locale`. Do **not** put language in the Zustand store.

### Forms

Two patterns coexist:
- **React Hook Form + Zod resolver** — for dialogs/edit forms with complex validation (e.g. `EditProjectDialog`)
- **`useActionState` + manual Zod parse** — for inline create forms (e.g. `ProjectForm`, `TaskForm`)

### Routing

All routes share `AppLayout` (Header + Toaster). Pages are lazy-loaded with `Suspense`. Error boundary is at the root route via `errorElement: <ErrorPage />`.

### i18n

Translations live in `src/i18n/locales/{en,fr}/translation.json`. All user-visible strings must use `useTranslation()` / `t()`. Language toggle is in the Header via `i18n.changeLanguage()`.

### Testing

Tests use a custom `render` from `src/tests/test-utils.tsx` that wraps components with `QueryClientProvider` (retry disabled) + `MemoryRouter`. MSW intercepts all API calls — unhandled requests throw (`onUnhandledRequest: "error"`). Mock handlers and fixture data live in `src/tests/msw/handlers/`.

### Path aliases

`@/` maps to `src/`. Use this alias everywhere; no relative `../../` imports.

### Linting & formatting

Biome handles both. Strict rules: `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`. a11y rules are enforced (exception: `noLabelWithoutControl`).
