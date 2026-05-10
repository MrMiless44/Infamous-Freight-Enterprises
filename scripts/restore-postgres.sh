#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_FILE:?BACKUP_FILE is required}"

if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | pg_restore --dbname "$DATABASE_URL" --clean --if-exists --no-owner --no-privileges
else
  pg_restore --dbname "$DATABASE_URL" --clean --if-exists --no-owner --no-privileges "$BACKUP_FILE"
fi

echo "Restore complete."
