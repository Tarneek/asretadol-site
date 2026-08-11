# Deployment guide

Production readiness notes for the news-platform monorepo (`@news-platform/api` + `@news-platform/web`).

## Environment variables

Copy `.env.example` → `.env` for local use. In staging/production, inject secrets via the host (never commit `.env`).

### Required (API)

| Variable | Notes |
|----------|--------|
| `NODE_ENV` | `production` in live environments |
| `API_PORT` | HTTP listen port |
| `DATABASE_*` | PostgreSQL connection |
| `JWT_ACCESS_SECRET` | ≥32 chars; **not** placeholder text |
| `JWT_REFRESH_SECRET` | ≥32 chars; distinct from access secret |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | e.g. `15m`, `7d` |
| `CORS_ORIGINS` | Comma-separated front-end origins |

### Recommended (API)

| Variable | Default | Notes |
|----------|---------|--------|
| `THROTTLE_TTL_MS` | `60000` | Window for rate limits |
| `THROTTLE_LIMIT` | `100` | General requests / IP / window |
| `THROTTLE_AUTH_LIMIT` | `20` | Documented target for login/refresh (decorator) |
| `TRUST_PROXY` | `false` | `true` behind nginx/ALB so client IP is correct |

### Web

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | Full public API base **including** `/api`, e.g. `https://api.example.com/api`. **Required** for production/staging builds. In local `pnpm dev`, defaults to `http://localhost:3001/api` if unset. |
| `NEXT_OUTPUT` | Set `standalone` for Docker/container Next.js builds |
| `PORT` | Optional; Next `start` port (default 3000) |

Env files (first match wins per Next.js rules):

1. Monorepo root `.env` (loaded by `next.config.ts`)
2. `apps/web/.env.local` (recommended local override — see `apps/web/.env.example`)

### Security defaults enforced at boot

- Production **rejects** JWT secrets containing `change-me`
- Production **rejects** `SEED_ADMIN_ENABLED=true`
- TypeORM `synchronize` is always `false` — schema changes only via migrations

---

## Local development

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm migration:run
pnpm dev
```

- API: `http://localhost:3001/api/health`
- Web: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

---

## Migrations (deployment-safe)

Never enable `synchronize` in any environment.

### Development (TypeScript)

```bash
pnpm migration:run
# or
pnpm --filter @news-platform/api migration:run
```

Generate a new migration after entity changes:

```bash
pnpm --filter @news-platform/api migration:generate src/database/migrations/NameOfChange
```

### Staging / production (compiled JS)

1. Build the API: `pnpm build:api`
2. Ensure `DATABASE_*` env vars are set in the runtime environment
3. Run migrations **before** (or as a one-shot job before) starting the new process:

```bash
pnpm migration:run:prod
# equivalent:
pnpm --filter @news-platform/api migration:run:prod
```

This uses `dist/database/data-source.js` and compiled migration files. The migrations table is `typeorm_migrations`.

**Recommended release order**

1. Run DB migrations (forward-only, reviewed SQL)
2. Deploy / restart API
3. Deploy / restart Web (with matching `NEXT_PUBLIC_API_URL`)

Revert only with care:

```bash
pnpm --filter @news-platform/api migration:revert:prod
```

---

## Production start

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm migration:run:prod
pnpm start:api   # node apps/api/dist/main
pnpm start:web   # next start
```

Or run each service in its own process/container:

```bash
# API
cd apps/api && node dist/main

# Web (optional standalone)
NEXT_OUTPUT=standalone pnpm --filter @news-platform/web build
node apps/web/.next/standalone/apps/web/server.js
```

### Health checks

- Liveness/readiness: `GET /api/health` (DB ping; throttling skipped)

---

## Hardening checklist

- [ ] Unique strong JWT secrets (rotate periodically)
- [ ] `CORS_ORIGINS` limited to real front-end hosts
- [ ] `TRUST_PROXY=true` only when behind a trusted reverse proxy
- [ ] TLS terminated at reverse proxy / CDN
- [ ] `SEED_ADMIN_ENABLED=false` in staging/production
- [ ] Admin users created via controlled ops process
- [ ] Database backups before migrations
- [ ] CI green on lint + typecheck + build (see `.github/workflows/ci.yml`)

---

## CI

GitHub Actions workflow `.github/workflows/ci.yml` runs on push/PR to `main`/`master`:

1. `pnpm install --frozen-lockfile`
2. lint
3. typecheck
4. build API + web

Add a separate deploy workflow when your host is chosen (Fly, Railway, Vercel+API VM, Kubernetes, etc.).
