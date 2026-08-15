#!/bin/bash
set -eu

cd /var/www/asretadol-site

echo "=== 1) Pull latest main ==="
git fetch origin main
git checkout -f main
git reset --hard origin/main
git log -1 --oneline

# Keep production compose as docker-compose.yml if present in repo
if [ -f docker-compose.prod.yml ]; then
  cp -f docker-compose.prod.yml docker-compose.yml
  echo "Using docker-compose.prod.yml as docker-compose.yml"
fi

# Ensure docker assets exist
test -f docker/web.Dockerfile
test -f docker/nginx.conf

# Load public URL from env file (do not print secrets)
set -a
# shellcheck disable=SC1091
. ./.env.production
set +a

: "${NEXT_PUBLIC_API_URL:?NEXT_PUBLIC_API_URL missing in .env.production}"
: "${NEXT_PUBLIC_SITE_URL:?NEXT_PUBLIC_SITE_URL missing in .env.production}"
echo "NEXT_PUBLIC_API_URL is set ($(echo "$NEXT_PUBLIC_API_URL" | sed 's#https://#https://#;s#http://#http://#'))"

echo "=== 2) Ensure postgres on internal network with alias ==="
docker network connect --alias postgres --alias news-platform-postgres asretadol-site_internal news-platform-postgres 2>/dev/null || true

echo "=== 3) Build web image with public API URL baked in ==="
docker build -f docker/web.Dockerfile \
  --build-arg "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" \
  --build-arg "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}" \
  -t asretadol-site-web:latest .

echo "=== 4) Recreate web container ==="
docker stop news-platform-web 2>/dev/null || true
docker rm news-platform-web 2>/dev/null || true
docker run -d \
  --name news-platform-web \
  --restart unless-stopped \
  --network asretadol-site_internal \
  --network-alias web \
  --network-alias news-platform-web \
  -e NODE_ENV=production \
  -e PORT=3010 \
  -e HOSTNAME=0.0.0.0 \
  -e API_INTERNAL_URL=http://api:3020/api \
  -v asretadol-site_uploads_data:/app/apps/web/public/uploads \
  asretadol-site-web:latest \
  node apps/web/server.js

echo "=== 5) Restart api + nginx ==="
docker restart news-platform-api
sleep 8
docker start news-platform-nginx 2>/dev/null || true
docker restart news-platform-nginx
sleep 3

echo "=== 6) Status ==="
docker ps --filter name=news-platform --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}'

echo "=== 7) Health checks ==="
echo -n "api internal: "
docker exec news-platform-api node -e 'fetch("http://127.0.0.1:3020/api/health").then(r=>r.text()).then(t=>console.log(t)).catch(e=>console.error(String(e)))'
echo -n "api via nginx: "
curl -sS --max-time 15 -H 'Host: asretaadol.ir' http://127.0.0.1/api/health || true
echo
echo -n "site status: "
curl -sS -o /tmp/asre-home.html -w '%{http_code}' --max-time 25 -H 'Host: asretaadol.ir' http://127.0.0.1/
echo
echo "page markers:"
grep -oE 'NEXT_PUBLIC_API_URL|اتصال به API|پیکربندی نشده|مهم‌ترین اخبار|اقتصاد ایران' /tmp/asre-home.html | sort | uniq || true

echo "=== DONE ==="
