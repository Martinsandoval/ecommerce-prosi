# Prosi — eCommerce Product Management

A small full-stack demo for managing a webstore's product catalog: a public storefront that lists active products with search and pagination, and an admin view for creating, searching, filtering, and activating/deactivating products. 

Requirements: https://github.com/Prosigliere/coding-challenges/blob/main/typescript_fullstack.md

Monorepo with two apps and a shared package:

```
apps/
  api/       NestJS + PostgreSQL REST API (product catalog)
  web/       Next.js storefront + admin UI
packages/
  shared/    TypeScript types/enums/constants shared by api and web
```

## Tech stack

**Backend** (`apps/api`)
- NestJS 11 (TypeScript, strict mode)
- PostgreSQL via Prisma 6 (schema, migrations, seed)
- class-validator / class-transformer for request validation
- `@nestjs/cache-manager` for in-memory response caching
- Swagger (OpenAPI) docs
- Jest (unit, integration, e2e)

**Frontend** (`apps/web`)
- Next.js 16 (App Router), React 19, TypeScript
- TanStack Query (data fetching/caching) and TanStack Table (admin table)
- React Hook Form for the create-product form
- Base UI + shadcn-derived components, Tailwind CSS 4, Motion
- Vitest + Testing Library

**Shared** (`packages/shared`)
- Product domain types, pagination shapes, and validation constants used by both apps, so the API contract only has one source of truth

## Run everything with Docker Compose

This is the fastest way to get the whole stack (database, API, web) running with a single command.

**Prerequisites:** Docker and Docker Compose.

```bash
cp .env.example .env
docker compose up --build
```

This starts three containers:

| Service | URL | Notes |
| --- | --- | --- |
| `web` | http://localhost:3001 | Storefront at `/products`, admin at `/admin/products` |
| `api` | http://localhost:3000 | REST API, prefixed with `/api` |
| `api` docs | http://localhost:3000/api/docs | Swagger UI |
| `db` | localhost:5432 | PostgreSQL 16 |

On first run, the `api` container automatically applies all database migrations (`prisma migrate deploy`) before starting — including a migration that seeds a starter catalog of 8 products, so the storefront has data immediately with no manual seeding step.

To stop everything:

```bash
docker compose down          # stop and remove containers
docker compose down -v       # also wipe the database volume
```

Ports and a few runtime settings (Postgres credentials, cache TTL, the public API URL baked into the web build) are configurable via `.env` — see `.env.example` for the full list.

## Running locally without Docker

Each app can also run directly on the host (requires Node 22+, pnpm, and a local PostgreSQL instance). See `apps/api/README.md` and `apps/web/README.md` for per-app setup, environment variables, and test commands. In short, from the repo root:

```bash
pnpm install
pnpm dev:api   # NestJS on http://localhost:3000
pnpm dev:web   # Next.js on http://localhost:3001
```

## Tests

```bash
pnpm --filter ecommerce-api test         # api unit tests
pnpm --filter ecommerce-api test:all     # api unit + integration + e2e
pnpm --filter web test                   # web component tests
```

See `apps/api/README.md` for details on the api's three test tiers and what each one catches.
