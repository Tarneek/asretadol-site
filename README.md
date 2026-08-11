# News platform

Production-oriented news CMS monorepo: **NestJS** API, **Next.js** web, **PostgreSQL** + **TypeORM**, **pnpm** workspaces.

## Prerequisites

- Node.js 20+
- pnpm 9 (`corepack enable && corepack prepare pnpm@9.15.0 --activate`)
- Docker (for local PostgreSQL)

## Quick start (local)

```bash
cp .env.example .env
# optional: cp apps/web/.env.example apps/web/.env.local
docker compose up -d
pnpm install
pnpm migration:run
pnpm seed:demo
# Re-seed after schema/content changes: SEED_DEMO_FORCE=1 pnpm seed:demo
pnpm dev
```

| Service | URL |
|---------|-----|
| API health | http://localhost:3001/api/health |
| Web | http://localhost:3000 |
| Admin | http://localhost:3000/admin/login |

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | API + web in watch mode |
| `pnpm build` | Production build both apps |
| `pnpm start:api` / `pnpm start:web` | Run production builds |
| `pnpm migration:run` | Apply migrations (dev / TS) |
| `pnpm seed:demo` | Upsert demo categories, tags, authors, articles (dev) |
| `pnpm diagnose:data` | Verify DB counts + public API responses |
| `pnpm migration:run:prod` | Apply migrations (compiled `dist`) |
| `pnpm lint` / `pnpm typecheck` | Quality gates |

## Production

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for env vars, CORS/Helmet/rate limits, migration order, and CI notes.

Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

Demo content: [docs/SEED.md](docs/SEED.md)

## Workspace packages

| Package | Path |
|---------|------|
| `@news-platform/api` | `apps/api` |
| `@news-platform/web` | `apps/web` |
