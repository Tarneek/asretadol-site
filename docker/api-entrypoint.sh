#!/bin/sh
set -eu

cd /app

UPLOAD_ROOT="${UPLOAD_ROOT:-/srv/uploads}"
UPLOAD_UID="${UPLOAD_UID:-1000}"
UPLOAD_GID="${UPLOAD_GID:-1000}"

mkdir -p \
  "${UPLOAD_ROOT}/blog/thumbnails" \
  "${UPLOAD_ROOT}/blog/main" \
  "${UPLOAD_ROOT}/blog/content" \
  "${UPLOAD_ROOT}/news" \
  "${UPLOAD_ROOT}/videos"

if [ "$(id -u)" = "0" ]; then
  chown -R "${UPLOAD_UID}:${UPLOAD_GID}" "${UPLOAD_ROOT}" || true
  chmod -R u+rwX,g+rwX,o+rX "${UPLOAD_ROOT}" || true
fi

echo "Running database migrations..."
pnpm --filter @news-platform/api migration:run:prod

echo "Starting API..."
if [ "$(id -u)" = "0" ] && command -v su-exec >/dev/null 2>&1; then
  exec su-exec "${UPLOAD_UID}:${UPLOAD_GID}" node apps/api/dist/main
fi

exec node apps/api/dist/main
