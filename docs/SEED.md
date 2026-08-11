# Demo seed (development)

Idempotent sample content for local demos. **Blocked when `NODE_ENV=production`.**

## Diagnose empty frontend

```bash
pnpm diagnose:data
```

Checks DB connectivity, row counts, homepage category/tag slugs, and public API responses.

## Command

```bash
# From monorepo root (Postgres must be running, migrations applied)
docker compose up -d
pnpm migration:run
pnpm seed:demo
pnpm diagnose:data
pnpm dev:api
# other terminal:
pnpm dev:web
```

`pnpm seed:demo` always **upserts** taxonomy + articles (idempotent). Use force only for a clean wipe of demo article rows:

```bash
# PowerShell
$env:SEED_DEMO_FORCE='1'; pnpm seed:demo

# bash
SEED_DEMO_FORCE=1 pnpm seed:demo
```

## What it creates

| Entity | Count (approx.) | Notes |
|--------|-----------------|--------|
| Categories | 9 | Slugs match public nav (`iranian-economy`, `world-economy`, …) |
| Tags | 13 | Includes `analysis`, `gold`, `oil`, `forex`, … |
| Users | 3 | editor + 2 authors (`*@news.local`) |
| Articles | ~39 | ~35 published (several `featured`), 3 draft, 1 archived |

Each published article has slug, excerpt, content, SEO (`metaTitle` / `metaDescription` / `ogImageUrl`), `publishedAt`, author, categories, and tags.

Public API only exposes **published** articles (`status = published` and `published_at IS NOT NULL`). Featured homepage strip uses `featured = true`.

## Env

| Variable | Purpose |
|----------|---------|
| `SEED_DEMO_AUTHOR_PASSWORD` | Password for new demo users (falls back to `SEED_ADMIN_PASSWORD`) |
| `SEED_DEMO_FORCE` | `1` / `true` to delete & re-insert demo articles |

Admin user is seeded separately via `SEED_ADMIN_*` on API boot when enabled.
