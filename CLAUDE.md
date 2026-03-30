# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo structure

pnpm workspace with two packages — no Turbo or Nx:

```
devboard/
├── devboard-back/   # NestJS 11 REST API  →  http://localhost:3000
├── devboard-front/  # React 19 SPA        →  http://localhost:5173
├── biome.json       # Shared lint/format config
└── pnpm-workspace.yaml
```

Each package has its own `CLAUDE.md` with detailed conventions. Read the relevant one before touching package-level code.

## Root commands

```bash
pnpm dev            # Start both packages in parallel (watch mode)
pnpm build          # Build backend first, then frontend
pnpm lint           # Lint all packages
pnpm test           # Test all packages
pnpm generate:api   # Export openapi.yaml from backend → regenerate Orval client in frontend
pnpm db:up          # Start PostgreSQL via Docker (port 5433)
pnpm db:migrate     # Run Prisma migrations
pnpm db:seed        # Seed the database
```

## First-time setup

```bash
cp devboard-back/.env.example devboard-back/.env
cp devboard-front/.env.example devboard-front/.env
pnpm install
pnpm db:up && pnpm db:migrate && pnpm db:seed
pnpm dev
```

## API client generation workflow

The frontend's typed HTTP client is generated from the backend's OpenAPI spec:

1. `pnpm generate:api` runs `devboard-back/scripts/export-openapi.ts` → writes `devboard-back/openapi.yaml`
2. Orval reads that spec and writes to `devboard-front/src/api/services/generated/` (HTTP functions) and `devboard-front/src/api/model/` (raw types)
3. Adapter services in `devboard-front/src/api/services/` wrap the generated functions with Zod parsing — components never import from `model/` or `services/generated/` directly

Run `pnpm generate:api` any time the backend API contract changes.

## Key architectural decisions

- **nestjs-zod** on the backend: DTOs derive from Zod schemas; `patchNestJsSwagger()` must be called before `SwaggerModule.createDocument()`.
- **Zod as frontend source of truth**: feature schemas live in `src/features/<feature>/schemas/` and drive TypeScript types, form validation, and Orval response parsing.
- **No Prisma mocks** in unit tests — if an e2e test covers the same path, test against a real DB (`.env.test` with a separate `DATABASE_URL`).
- **Biome** (not ESLint) handles lint and format for both packages from the shared root `biome.json`.
- **CORS_ORIGINS** in `devboard-back/.env` must include the frontend origin (default `http://localhost:5173`).
