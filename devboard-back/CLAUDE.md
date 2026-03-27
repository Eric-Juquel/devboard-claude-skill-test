# CLAUDE.md — DevBoard API

## /init

Run this when starting a new conversation on this project:

```
1. Read README.md for the full project overview.
2. Read prisma/schema.prisma to understand the data model.
3. Read src/app.module.ts to understand the module graph and env validation.
4. Check that Docker is running: `docker compose ps` — the postgres container must be healthy.
5. Confirm .env exists (copy .env.example if not).
```

---

## Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| Framework    | NestJS 11 (Express adapter)                     |
| ORM          | Prisma 6                                        |
| Database     | PostgreSQL 16 (Docker, local dev)               |
| Validation   | nestjs-zod (Zod DTOs + auto Swagger)            |
| Config       | @nestjs/config + Joi schema validation          |
| Security     | Helmet, @nestjs/throttler                       |
| Testing      | Vitest + unplugin-swc + @faker-js/faker         |
| API docs     | Swagger UI at /docs (non-production only)       |

---

## Conventions

### Modules
Each feature lives in `src/<feature>/` with:
- `<feature>.module.ts` — imports/exports
- `<feature>.controller.ts` — route handlers, Swagger decorators
- `<feature>.service.ts` — business logic, calls PrismaService
- `dto/create-<feature>.dto.ts` — Zod schema → class via `createZodDto`
- `dto/update-<feature>.dto.ts` — uses `z.partial()` of the create schema

### DTOs
Always derive DTOs from Zod schemas using `nestjs-zod`'s `createZodDto`:

```ts
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export class CreateProjectDto extends createZodDto(CreateProjectSchema) {}
```

Never use `class-validator` — validation is handled globally by `ZodValidationPipe`.

### Error handling
All errors go through `HttpExceptionFilter` (`src/common/filters/`). Never expose stack traces to the client. Always throw NestJS `HttpException` subclasses (e.g. `NotFoundException`, `BadRequestException`).

### Environment
App refuses to start if required env vars are missing (Joi validation in `app.module.ts`). Always add new variables to:
1. `app.module.ts` `validationSchema`
2. `.env.example`
3. This file's stack table if notable

### Testing
- Unit tests: `*.spec.ts` alongside the file under test
- E2E tests: `test/` directory, run with a `.env.test` file
- Use `@faker-js/faker` builders for test data — never hardcode UUIDs in unit tests
- Never mock Prisma in unit tests if an e2e test covers the same path

---

## Local database (Docker)

```bash
docker compose up -d        # start postgres
docker compose stop         # stop (data persists)
docker compose down -v      # full reset (drops volume)
```

Credentials (dev only): `postgres:postgres` / db: `devboard`
`DATABASE_URL=postgresql://postgres:postgres@localhost:5433/devboard`

---

## Common workflows

### Add a new feature module
```bash
nest g module src/<feature>
nest g controller src/<feature>
nest g service src/<feature>
# Then create src/<feature>/dto/ manually
```

### Add a Prisma model
1. Edit `prisma/schema.prisma`
2. `pnpm prisma:migrate` (creates a migration file)
3. `pnpm prisma:generate` (regenerates the client)
4. Update `prisma/seed.ts` if needed

### Run tests
```bash
pnpm test           # all unit tests
pnpm test:e2e       # e2e (needs .env.test with a test DATABASE_URL)
pnpm test:cov       # coverage report
```
