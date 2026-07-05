# eCommerce Product Management API

A NestJS + PostgreSQL REST API for managing a webstore's product catalog: list active products, create products with up to 10 attributes, and deactivate/reactivate products.

## Stack

- **NestJS 11** (TypeScript, strict mode)
- **PostgreSQL** via **Prisma 6** (schema, migrations, seed)
- **class-validator / class-transformer** for request validation and sanitization
- **@nestjs/cache-manager** for in-memory response caching on product reads
- **Swagger** (OpenAPI) docs at `/api/docs`
- **Jest** for unit + e2e tests
- **Docker Compose** for API + Postgres

## Project layout

```
src/
  common/            # cross-cutting building blocks
    dto/              # PaginationQueryDto
    exceptions/        # global HttpExceptionFilter (incl. Prisma error mapping)
    interceptors/      # LoggingInterceptor
    prisma/             # PrismaService/PrismaModule (global)
    decorators/, guards/, middleware/  # reserved, currently empty
  config/            # env-driven app/database/cache config + Joi validation schema
  modules/
    products/         # fully implemented: controllers/, services/, dto/, interfaces/, mappers/
    auth/, users/, cart/, orders/, payments/   # reserved for future milestones (see each README.md)
  app.module.ts / main.ts
prisma/
  schema.prisma
  migrations/
  seed.ts
```

## Why only `products` is implemented

The brief's actual deliverable is product catalog management (list active products, create, deactivate/reactivate, up to 10 attributes each). `auth`, `users`, `cart`, `orders`, and `payments` are scaffolded as empty module folders (with a short README each) to show where they'd live in a fuller e-commerce backend, but building them out wasn't in scope here — there's no user/session concept yet, so cart/orders/payments would just be speculative. Each folder's README says what it's reserved for.

## Data model

- `Product`: `id`, `name`, `pictureUrl`, `price` (`numeric(10,2)`), `isActive`, timestamps.
- `ProductAttribute`: `id`, `name`, `value`, `position` (preserves input order), belongs to a `Product` (`onDelete: Cascade`).
- A product may have at most **10** attributes — enforced by DTO validation (`@ArrayMaxSize(10)`), not just a UI convention.
- Products are never hard-deleted; `isActive` toggling is the only lifecycle transition, per the assessment's "deactivate/reactivate" requirement (no delete endpoint exists).

## API

All routes are prefixed with `/api`. Interactive docs: `http://localhost:3000/api/docs`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/products` | List products. Query: `status` (`active` default \| `inactive` \| `all`), `search`, `page`, `limit` |
| GET | `/api/products/:id` | Get one product |
| POST | `/api/products` | Create a product (`name`, `pictureUrl`, `price`, optional `attributes[]`) |
| PATCH | `/api/products/:id` | Update a product; sending `attributes` replaces the full set |
| PATCH | `/api/products/:id/activate` | Reactivate a product |
| PATCH | `/api/products/:id/deactivate` | Deactivate a product (hides it from the default list) |
| GET | `/api/health` | Health check |

Responses are paginated (`{ data, meta }`) on list endpoints, and errors follow a consistent shape:

```json
{
  "statusCode": 400,
  "timestamp": "...",
  "path": "/api/products",
  "method": "POST",
  "message": ["price must be a positive number"],
  "error": "Bad Request"
}
```

## Caching

`GET /api/products` and `GET /api/products/:id` are cached in-process via `@nestjs/cache-manager` (in-memory store, TTL configurable through `CACHE_TTL_MS`, default 30s).

- List queries are cached per distinct `page`/`limit`/`status`/`search` combination; single products are cached per id.
- Any write (`POST /api/products`, `PATCH .../:id`, `.../activate`, `.../deactivate`) clears the whole cache before returning, so the storefront never serves a stale "deactivated" product or a stale list after an edit — verified by killing the database mid-request and confirming a previously-cached query still resolves while a fresh one correctly fails.
- Invalidation is a full `cache.clear()` rather than tracking every generated list key. Products is the only cached domain in this app, so that's equivalent to (and simpler than) surgical key tracking — see the comment on `ProductsService.invalidateCache()`. This wouldn't scale as-is to a multi-instance deployment sharing one cache (the in-memory store is per-process); that would need a shared store (e.g. Redis) plus pattern-based invalidation.

## Running with Docker Compose (single command)

```bash
cp .env.example .env
docker compose --env-file .env up --build
```

This starts Postgres and the API (migrations run automatically on container start via `prisma migrate deploy`). The API is on `http://localhost:3000`, docs at `http://localhost:3000/api/docs`.

To seed sample data (8 products, 2 of them inactive) once the stack is up:

```bash
docker compose exec api node_modules/.bin/prisma db seed
```

## Running locally (without Docker)

Requires a local PostgreSQL instance and pnpm.

```bash
pnpm install
cp .env.example .env        # edit DATABASE_URL if your local Postgres differs
pnpm prisma:migrate         # creates the schema (prompts for a migration name on first run)
pnpm prisma:seed            # optional sample data
pnpm start:dev
```

## Tests

Three tiers, each catching a different class of bug:

```bash
pnpm test               # unit: ProductsService with Prisma + cache mocked — pure logic
pnpm test:integration   # integration: ProductsService against a real Postgres + real cache-manager, no HTTP layer
pnpm test:e2e           # e2e: full Nest app + supertest HTTP requests + real Postgres
pnpm test:all           # all three, in order
```

- **Unit** (`src/**/*.spec.ts`): Prisma and the cache manager are mocked, so these are fast and isolate `ProductsService`'s branching logic (filter construction, DTO handling, error paths).
- **Integration** (`test/integration/*.integration-spec.ts`): real `PrismaService` + real `CacheModule` wired through Nest's `TestingModule`, no controller/HTTP involved. This is the tier that catches what mocks can't: actual Prisma query correctness (case-insensitive search, pagination math), the `onDelete: Cascade` FK behavior, the attribute-replace transaction, and that the cache genuinely avoids re-querying the database (verified with `jest.spyOn` on `PrismaService`) and is correctly invalidated on writes.
- **E2E** (`test/*.e2e-spec.ts`): boots the whole app (global pipes/filters/prefix included) and drives it over real HTTP with supertest — the closest thing to hitting the API as a client would.

Integration and e2e tests both run against whatever `DATABASE_URL` is configured — point it at a disposable/local database, not production. Integration tests scope all fixtures under a per-run unique name prefix and delete them in `afterAll`, so they're safe to run against a database that already has other data (e.g. seeded products) without colliding with it.

## Design decisions & trade-offs

- **Prisma 6, not 7**: Prisma 7 (current at time of writing) removed `datasource { url = env(...) }` in favor of driver adapters and a `prisma.config.ts` file — a very recent, invasive breaking change. Prisma 6 keeps the schema/migration workflow conventional and easy to review, so it was the better fit here.
- **No hard delete**: the assessment only asks for activate/deactivate, so no `DELETE /products/:id` endpoint exists — avoids building a lifecycle transition nobody asked for.
- **Attribute replace-on-update**: `PATCH /products/:id` with `attributes` deletes and recreates all attributes in a transaction rather than diffing individual attributes. Simpler and correct for a "list of up to 10 key/value pairs" use case; would need to become a real diff if attributes needed stable IDs across edits (e.g., for optimistic UI updates).
- **Single Docker image runs migrations at startup**: the container's `CMD` runs `prisma migrate deploy` before starting the server, and keeps devDependencies in the runtime image (so `prisma`/`ts-node` are available for ad-hoc seeding via `docker compose exec`). A stricter production setup would separate a migration job from a pruned runtime image — left as-is here to keep the single-command demo simple.
- **`status=all|active|inactive` query param** rather than separate endpoints: keeps one resource/URL for both the public "show" view (`status=active`, the default) and the admin "management" view (`status=all`), consistent with REST resource conventions.
