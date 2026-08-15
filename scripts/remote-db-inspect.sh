#!/bin/bash
set -eu
cd /var/www/asretadol-site
echo "=== remote postgres container ==="
docker ps --filter name=news-platform-postgres --format '{{.Names}} {{.Status}} {{.Image}}'
echo "=== env key presence ==="
grep -E '^(POSTGRES_USER|POSTGRES_DB|DATABASE_USER|DATABASE_NAME)=' .env.production | sed 's/=.*/=<set>/'
echo "=== current remote counts (read-only) ==="
docker exec news-platform-postgres psql -U news -d news_platform -v ON_ERROR_STOP=1 -c "SELECT 'articles' AS table, count(*)::text AS rows FROM articles UNION ALL SELECT 'users', count(*)::text FROM users UNION ALL SELECT 'categories', count(*)::text FROM categories;"
