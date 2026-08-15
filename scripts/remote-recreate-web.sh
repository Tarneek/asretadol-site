#!/bin/bash
set -euo pipefail

docker stop news-platform-web || true
docker rm news-platform-web || true

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

sleep 4
echo "PORT=$(docker exec news-platform-web printenv PORT)"
docker restart news-platform-nginx
sleep 2

echo "=== HEADERS ==="
curl -sI -H 'Host: asretaadol.ir' --max-time 15 http://127.0.0.1/ | head -10

echo "=== NAV LABELS ==="
curl -sL -H 'Host: asretaadol.ir' --max-time 25 http://127.0.0.1/ \
  | grep -oE 'علاقه‌مندی‌ها|درباره ما|اقتصاد ایران|خانه' \
  | sort | uniq || true

echo "=== API HEALTH ==="
docker exec news-platform-api node -e 'fetch("http://127.0.0.1:3020/api/health").then(r=>r.text()).then(console.log).catch(e=>console.error(String(e)))'

echo "=== PS ==="
docker ps --filter name=news-platform --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}'
