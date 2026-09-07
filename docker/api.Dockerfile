FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm config set fetch-timeout 600000 && \
    pnpm config set fetch-retries 10 && \
    pnpm config set network-concurrency 3 && \
    pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
# Copy source first. Without a .dockerignore, host node_modules (Windows
# junctions) would otherwise overwrite the Linux install from deps.
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
RUN pnpm --filter @news-platform/api build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV API_PORT=3020
RUN apk add --no-cache libc6-compat su-exec
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm config set fetch-timeout 600000 && \
    pnpm config set fetch-retries 10 && \
    pnpm config set network-concurrency 3 && \
    pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY docker/api-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
  && mkdir -p \
    /srv/uploads/blog/thumbnails \
    /srv/uploads/blog/main \
    /srv/uploads/blog/content \
    /srv/uploads/news \
    /srv/uploads/videos \
    /app/uploads/news \
    /app/uploads/videos

EXPOSE 3020
ENTRYPOINT ["/entrypoint.sh"]
