#!/bin/sh

echo "Running Prisma migrations (development)..."

npm run prisma:generate
npx prisma migrate dev --name dev_init

echo "✔ Development migrations applied."
