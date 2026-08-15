#!/bin/bash
set -eu
cd /var/www/asretadol-site

# Prefer PG15-compatible dump (PG18 dumps may include SET transaction_timeout).
DUMP=/var/www/asretadol-site/local_db_backup.pg15.sql
if [ ! -f "$DUMP" ]; then
  DUMP=/var/www/asretadol-site/local_db_backup.sql
fi
test -f "$DUMP"

# Read credentials from production env (do not echo secrets)
set -a
# shellcheck disable=SC1091
. ./.env.production
set +a

PGUSER="${POSTGRES_USER:-${DATABASE_USER:-news}}"
PGDB="${POSTGRES_DB:-${DATABASE_NAME:-news_platform}}"

echo "Using container news-platform-postgres"
echo "Target db user=${PGUSER} db=${PGDB}"
echo "Dump bytes=$(wc -c < "$DUMP")"

echo "=== BEFORE counts ==="
docker exec news-platform-postgres psql -U "$PGUSER" -d "$PGDB" -c \
  "SELECT 'articles' AS t, count(*)::text AS c FROM articles UNION ALL SELECT 'users', count(*)::text FROM users UNION ALL SELECT 'categories', count(*)::text FROM categories;" \
  || true

echo "=== REPLACE public schema ==="
docker exec news-platform-postgres psql -U "$PGUSER" -d "$PGDB" -v ON_ERROR_STOP=1 -c \
  "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public; GRANT ALL ON SCHEMA public TO \"${PGUSER}\";"

echo "=== IMPORT dump ==="
# shellcheck disable=SC2002
cat "$DUMP" | docker exec -i news-platform-postgres psql -U "$PGUSER" -d "$PGDB" -v ON_ERROR_STOP=1

echo "=== AFTER counts ==="
docker exec news-platform-postgres psql -U "$PGUSER" -d "$PGDB" -c \
  "SELECT 'articles' AS t, count(*)::text AS c FROM articles UNION ALL SELECT 'users', count(*)::text FROM users UNION ALL SELECT 'categories', count(*)::text FROM categories UNION ALL SELECT 'tags', count(*)::text FROM tags;"

echo "=== cleanup server dump ==="
rm -f "$DUMP"
test ! -f "$DUMP"
echo "Server dump removed."
echo "DONE"
