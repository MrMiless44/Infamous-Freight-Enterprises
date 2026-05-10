FROM node:22 AS build

WORKDIR /usr/src/app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile

COPY scripts scripts
COPY apps/api apps/api

RUN pnpm run build:api

FROM node:22-slim

WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y openssl && apt-get clean

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /usr/src/app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/apps/api ./apps/api

EXPOSE 3000

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "const port = process.env.PORT || 3000; require('http').get('http://127.0.0.1:' + port + '/api/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

CMD ["node", "apps/api/dist/src/server.js"]
