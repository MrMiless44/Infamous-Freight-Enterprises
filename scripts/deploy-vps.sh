#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .env.production ]; then
  echo "Missing .env.production. Copy .env.production.example and fill real production values first." >&2
  exit 1
fi

: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
: "${WEB_DOMAIN:?WEB_DOMAIN is required}"
: "${API_DOMAIN:?API_DOMAIN is required}"

docker compose -f docker-compose.prod.yml pull || true
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml ps

echo "Deployment started. Follow API logs with: docker compose -f docker-compose.prod.yml logs -f api"
