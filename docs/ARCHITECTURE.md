# News platform — system architecture

Production-oriented monorepo: **Next.js** (public + admin UI), **NestJS** (API), **PostgreSQL** + **TypeORM**, **pnpm** workspaces.

## Principles

- **API-first**: Public site and admin UI consume the same backend; no direct DB access from Next.js.
- **Bounded modules**: Each Nest domain module owns entities, services, and CMS controllers; public reads are thin controllers in `PublicModule` (or dedicated public controllers per domain).
- **Migrations only**: `synchronize: false` in all environments; schema via TypeORM migrations.
- **JWT + roles**: Short-lived access token; refresh token stored hashed with rotation on refresh.
- **Publish workflow**: Only `published` articles with `published_at` set appear on public APIs; drafts never leak via public routes.

---

## 1. Monorepo folder structure

```
news-platform/
├── apps/
│   ├── api/                          # NestJS
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── config/
│   │   │   │   ├── configuration.ts
│   │   │   │   ├── env.validation.ts
│   │   │   │   └── database.config.ts
│   │   │   ├── common/
│   │   │   │   ├── decorators/       # @CurrentUser(), @Roles(), @Public()
│   │   │   │   ├── guards/           # JwtAuthGuard, RolesGuard
│   │   │   │   ├── filters/          # HttpException filter
│   │   │   │   ├── interceptors/     # logging, transform (optional)
│   │   │   │   ├── pagination/       # PageDto, paginate helper
│   │   │   │   └── enums/            # Role, ArticleStatus (or import from shared)
│   │   │   ├── database/
│   │   │   │   ├── database.module.ts
│   │   │   │   ├── data-source.ts    # CLI migrations
│   │   │   │   └── migrations/
│   │   │   ├── modules/
│   │   │   │   ├── health/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── categories/
│   │   │   │   ├── tags/
│   │   │   │   ├── articles/
│   │   │   │   └── public/
│   │   │   └── seeds/                # optional: admin user seed
│   │   ├── test/
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── web/                          # Next.js App Router
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx                    # home
│       │   │   ├── news/
│       │   │   │   ├── page.tsx
│       │   │   │   └── [slug]/page.tsx
│       │   │   ├── category/[slug]/page.tsx
│       │   │   ├── tag/[slug]/page.tsx
│       │   │   ├── login/page.tsx
│       │   │   └── admin/
│       │   │       ├── layout.tsx              # admin shell
│       │   │       ├── page.tsx
│       │   │       ├── articles/page.tsx
│       │   │       ├── categories/page.tsx
│       │   │       └── tags/page.tsx
│       │   ├── lib/
│       │   │   ├── api/                          # fetch wrappers (public + auth)
│       │   │   └── config.ts                     # NEXT_PUBLIC_API_URL
│       │   └── components/                     # minimal placeholders
│       ├── next.config.ts
│       └── package.json
│
├── packages/
│   └── shared/                       # optional but recommended
│       ├── src/
│       │   ├── enums/
│       │   │   ├── role.ts
│       │   │   └── article-status.ts
│       │   └── types/                # shared API response shapes
│       └── package.json
│
├── docker-compose.yml
├── .env.example
├── pnpm-workspace.yaml
└── docs/
```

**Deployment shape (later):** `api` and `web` as separate containers; Postgres managed or containerized; env per service.

---

## 2. Database entities

### Enums

| Enum | Values |
|------|--------|
| `user_role` | `admin`, `editor`, `author` |
| `article_status` | `draft`, `published`, `archived` |

### `users`

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `email` | varchar unique | login |
| `password_hash` | varchar | bcrypt |
| `display_name` | varchar | |
| `role` | enum | RBAC |
| `is_active` | boolean | soft disable |
| `created_at`, `updated_at` | timestamptz | |

### `refresh_tokens`

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `user_id` | uuid FK → users | |
| `token_hash` | varchar | hash of refresh token |
| `expires_at` | timestamptz | |
| `revoked_at` | timestamptz nullable | logout / rotation |
| `created_at` | timestamptz | |

Index: `(user_id)`, filter non-revoked for validation.

### `categories`

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `name` | varchar | |
| `slug` | varchar unique | URL |
| `description` | text nullable | |
| `parent_id` | uuid FK nullable | tree |
| `sort_order` | int default 0 | |
| `created_at`, `updated_at` | timestamptz | |

### `tags`

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `name` | varchar | |
| `slug` | varchar unique | |
| `created_at`, `updated_at` | timestamptz | |

### `articles`

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | |
| `title` | varchar | |
| `slug` | varchar unique | |
| `excerpt` | text nullable | |
| `body` | text | HTML or markdown (store as text; render in web) |
| `status` | enum | draft / published / archived |
| `featured` | boolean default false | |
| `published_at` | timestamptz nullable | set on publish |
| `author_id` | uuid FK → users | |
| `created_at`, `updated_at` | timestamptz | |

Indexes: `(status, published_at DESC)`, `(featured)` where published, unique `(slug)`.

**Author permissions:** `author` can edit own drafts; `editor`/`admin` can edit any; only `editor`/`admin` publish (configurable policy).

### `article_seo` (1:1)

| Column | Type | Notes |
|--------|------|--------|
| `article_id` | uuid PK FK → articles | |
| `meta_title` | varchar nullable | |
| `meta_description` | varchar nullable | |
| `og_image_url` | varchar nullable | |
| `canonical_url` | varchar nullable | |

### `article_categories` (M:N)

| Column | Type |
|--------|------|
| `article_id` | uuid FK |
| `category_id` | uuid FK |
| PK | `(article_id, category_id)` |

### `article_tags` (M:N)

| Column | Type |
|--------|------|
| `article_id` | uuid FK |
| `tag_id` | uuid FK |
| PK | `(article_id, tag_id)` |

### ER overview

```
users ──< articles ──|| article_seo
users ──< refresh_tokens
articles >──< categories (article_categories)
articles >──< tags (article_tags)
categories ──< categories (parent_id)
```

---

## 3. NestJS modules

Global prefix: `/api`. Versioning optional later (`/api/v1`).

| Module | Responsibility | Auth |
|--------|----------------|------|
| **HealthModule** | `GET /health` (DB ping) | Public |
| **ConfigModule** | Load & validate env | — |
| **DatabaseModule** | TypeORM `forRootAsync` | — |
| **AuthModule** | Login, refresh, logout; Passport JWT strategy | Public + JWT |
| **UsersModule** | `GET /users/me`; admin CRUD users | JWT + roles |
| **CategoriesModule** | CMS CRUD categories | JWT; editor+ for write |
| **TagsModule** | CMS CRUD tags | JWT; editor+ for write |
| **ArticlesModule** | CMS CRUD, publish, archive, featured | JWT; role rules |
| **PublicModule** | Read-only published content | Public |

### Typical CMS routes (`ArticlesModule` example)

- `GET /articles` — list (filters: status, author, category, pagination)
- `GET /articles/:id`
- `POST /articles` — create draft
- `PATCH /articles/:id`
- `POST /articles/:id/publish` / `archive`
- `PATCH /articles/:id/featured`

DTOs: `class-validator` on all inputs; entities never returned raw (use response DTOs or serialization).

### Public routes (`PublicModule`)

- `GET /public/articles` — `status=published`, sort by `published_at`, pagination
- `GET /public/articles/featured`
- `GET /public/articles/:slug`
- `GET /public/categories`, `GET /public/categories/:slug` (+ articles)
- `GET /public/tags`, `GET /public/tags/:slug` (+ articles)

Public responses omit internal fields (`password_hash`, draft bodies, etc.).

### Cross-cutting

- **JwtAuthGuard** default; `@Public()` for login and public module
- **RolesGuard** + `@Roles(Role.Admin, Role.Editor)`
- **Pagination**: `page`, `limit` (max cap), return `{ data, meta: { total, page, limit } }`

---

## 4. Next.js routes & data flow

| Route | Data source |
|-------|-------------|
| `/` | `GET /public/articles/featured` + latest |
| `/news` | `GET /public/articles` |
| `/news/[slug]` | `GET /public/articles/:slug` + SEO metadata |
| `/category/[slug]` | category + articles |
| `/tag/[slug]` | tag + articles |
| `/login` | `POST /auth/login` (store tokens; cookie or memory) |
| `/admin/*` | CMS APIs with Bearer token |

**Rendering:** Start with client-side fetch in placeholders; evolve to Server Components + `fetch` with revalidate for public pages when UI is final.

**Auth on web:** HttpOnly cookie for refresh (optional hardening) or BFF later; MVP: access token in memory + refresh flow from `lib/api`.

---

## 5. Configuration (.env)

| Variable | Consumer |
|----------|----------|
| `DATABASE_*` | API TypeORM |
| `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN` | API |
| `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN` | API |
| `API_PORT` | API |
| `NEXT_PUBLIC_API_URL` | Web |

Copy `.env.example` → `.env` at repo root; API loads via `ConfigModule` (path can be monorepo root or `apps/api/.env` with explicit path).

---

## 6. Implementation plan (phased)

| Phase | Scope | Exit criteria |
|-------|--------|----------------|
| **0** | Monorepo, Docker Postgres, Prettier, `.env.example` | `docker compose up`, workspace installs |
| **1** | Nest scaffold: config validation, TypeORM, health, ESLint | `GET /api/health` OK |
| **2** | Entities + migration `InitialSchema` | `pnpm migration:run` clean |
| **3** | Auth: register seed admin, login, refresh, logout, guards | JWT protects CMS routes |
| **4** | Categories + Tags CMS | CRUD + slug uniqueness |
| **5** | Articles + SEO + M:N relations + publish workflow | Draft/publish/archive enforced |
| **6** | PublicModule read APIs | Only published content |
| **7** | Next.js routes + `lib/api` | Public pages load from API |
| **8** | Admin placeholders + login | Shell navigates CMS routes |
| **9** (prod) | CI, migration on deploy, rate limit, CORS, helmet, logging | Hardening checklist |

Implement **one phase at a time**; each phase should be runnable and testable before the next.

---

## 7. Future extensions (out of initial scope)

- Media upload (S3 + `media` entity)
- Full-text search (Postgres `tsvector` or external)
- Audit log (`article_revisions`)
- Multi-language (`article_translations`)
- Redis cache for public lists
- OpenAPI (`@nestjs/swagger`) for admin tooling
