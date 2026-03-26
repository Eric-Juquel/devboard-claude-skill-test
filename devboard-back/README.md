# DevBoard API

RESTful API for managing development projects and tasks.

**Stack:** NestJS 11 · Prisma 6 · PostgreSQL 16 · nestjs-zod · Vitest · Docker

---

## Prerequisites

- [Node.js](https://nodejs.org/) ≥ 22
- [pnpm](https://pnpm.io/) ≥ 9
- [Docker](https://www.docker.com/) — used to run PostgreSQL locally (no local install required)

---

## Quick start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create your local env file

```bash
cp .env.example .env
```

No changes needed — the defaults match the Docker container below.

### 3. Start the PostgreSQL container

```bash
docker compose up -d
```

Wait a few seconds for the container to be healthy, then verify:

```bash
docker compose ps
# postgres container should show status: healthy
```

> **Port conflict?** The container uses port `5433` (not the default `5432`) to avoid conflicts
> with any local PostgreSQL installation. If `5433` is also taken, edit `docker-compose.yml`
> and change `"5433:5432"` to another free port, then update `DATABASE_URL` in your `.env`.

### 4. Run migrations

```bash
pnpm prisma:migrate
# when prompted, enter a name for the migration (e.g. "init")
```

> **Advisory lock timeout?** If you see `P1002 — Timed out trying to acquire a postgres advisory lock`,
> another Prisma process is holding a lock. Kill it with:
> ```bash
> docker exec devboard-postgres psql -U postgres -d devboard \
>   -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity \
>       WHERE datname = 'devboard' AND pid <> pg_backend_pid();"
> ```
> Then re-run `pnpm prisma:migrate`.

### 5. Seed the database

```bash
pnpm prisma:seed
# → 2 projects, 4 tasks inserted
```

### 6. Start the dev server

```bash
pnpm start:dev
```

The API is now running:

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | REST API |
| `http://localhost:3000/docs` | Swagger UI |
| `http://localhost:3000/docs-json` | OpenAPI JSON spec |

---

## Swagger UI

Open `http://localhost:3000/docs` in your browser.

The interface lets you browse all endpoints, inspect request/response schemas, and send requests directly from the browser — no Postman required.

**Sample data available after seed:**

| Resource | ID |
|----------|----|
| Project — DevBoard Core | `a0000000-0000-0000-0000-000000000001` |
| Project — Mobile Companion | `a0000000-0000-0000-0000-000000000002` |
| Task — Setup CI/CD pipeline | `b0000000-0000-0000-0000-000000000001` |
| Task — Design system tokens | `b0000000-0000-0000-0000-000000000002` |
| Task — JWT authentication flow | `b0000000-0000-0000-0000-000000000003` |
| Task — Push notifications | `b0000000-0000-0000-0000-000000000004` |

---

## Inspect the database

Connect with any PostgreSQL GUI client (DBeaver, pgAdmin, TablePlus…):

| Field    | Value       |
|----------|-------------|
| Host     | `localhost` |
| Port     | `5433`      |
| Database | `devboard`  |
| User     | `postgres`  |
| Password | `postgres`  |

Or use Prisma Studio (built-in GUI):

```bash
pnpm prisma:studio
# opens http://localhost:5555
```

---

## Environment variables

| Variable         | Default                                                   | Description                       |
|------------------|-----------------------------------------------------------|-----------------------------------|
| `NODE_ENV`       | `development`                                             | Runtime environment               |
| `PORT`           | `3000`                                                    | HTTP server port                  |
| `DATABASE_URL`   | `postgresql://postgres:postgres@localhost:5433/devboard`  | Prisma connection string          |
| `CORS_ORIGINS`   | `http://localhost:5173`                                   | Allowed origins (comma-separated) |
| `THROTTLE_TTL`   | `60000`                                                   | Rate limit window (ms)            |
| `THROTTLE_LIMIT` | `100`                                                     | Max requests per window           |

---

## Docker — PostgreSQL

```bash
# Start
docker compose up -d

# Stop (keep data)
docker compose stop

# Stop + remove volume (full reset)
docker compose down -v
```

---

## Database commands

```bash
pnpm prisma:migrate      # Run pending migrations (dev)
pnpm prisma:seed         # Seed with sample data
pnpm prisma:reset        # Drop + re-migrate + re-seed
pnpm prisma:studio       # Open Prisma Studio at localhost:5555
pnpm prisma:generate     # Regenerate Prisma Client after schema changes
```

---

## Scripts

```bash
pnpm start:dev           # Dev server with hot reload
pnpm start:debug         # Dev server with debugger (port 9229)
pnpm build               # Production build (outputs to dist/)
pnpm start:prod          # Run the production build
pnpm test                # Unit tests (Vitest)
pnpm test:watch          # Unit tests in watch mode
pnpm test:cov            # Coverage report
pnpm test:e2e            # End-to-end tests (requires .env.test)
pnpm lint                # TypeScript type check
pnpm openapi:export      # Generate openapi.yaml from the live app
```

---

## API endpoints

| Method | Path                   | Description              |
|--------|------------------------|--------------------------|
| GET    | `/projects`            | List all projects        |
| POST   | `/projects`            | Create a project         |
| GET    | `/projects/:id`        | Get a project by ID      |
| PATCH  | `/projects/:id`        | Update a project         |
| DELETE | `/projects/:id`        | Delete a project         |
| GET    | `/projects/:id/tasks`  | List tasks for a project |
| GET    | `/tasks`               | List all tasks           |
| POST   | `/tasks`               | Create a task            |
| GET    | `/tasks/:id`           | Get a task by ID         |
| PATCH  | `/tasks/:id`           | Update a task            |
| DELETE | `/tasks/:id`           | Delete a task            |

Full schema and request/response examples are available in the Swagger UI at `/docs`.

---

## Project structure

```
src/
├── common/
│   ├── filters/          # Global HTTP exception filter
│   └── interceptors/     # (future: logging, transform)
├── prisma/               # PrismaService + PrismaModule
├── projects/             # Projects feature module
│   ├── dto/              # Zod-derived DTOs
│   ├── projects.controller.ts
│   ├── projects.service.ts
│   └── projects.module.ts
└── tasks/                # Tasks feature module
    ├── dto/
    ├── tasks.controller.ts
    ├── tasks.service.ts
    └── tasks.module.ts
prisma/
├── schema.prisma         # Data model
└── seed.ts               # Sample data
```
