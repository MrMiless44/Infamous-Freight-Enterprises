# Multi-stage build for web frontend
FROM node:20-alpine AS web-builder

WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# Runtime stage for API + Web
FROM node:20-alpine

# Install PostgreSQL client for migrations
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy API
COPY api/package*.json ./api/
RUN cd api && npm ci --only=production
COPY api/ ./api/

# Generate Prisma client
RUN cd api && npx prisma generate

# Copy built web app
COPY --from=web-builder /app/web/.next ./web/.next
COPY --from=web-builder /app/web/public ./web/public
COPY --from=web-builder /app/web/package*.json ./web/
COPY --from=web-builder /app/web/node_modules ./web/node_modules
COPY web/next.config.mjs ./web/

# Expose ports
EXPOSE 3000 4000

# Start script
COPY <<EOF /app/start.sh
#!/bin/sh
set -e

# Start API in background
cd /app/api && node src/server.js &

# Start web in foreground
cd /app/web && npm start
EOF

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
