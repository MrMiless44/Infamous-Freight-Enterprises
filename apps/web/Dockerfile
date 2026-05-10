FROM node:22 AS build

WORKDIR /usr/src/app

RUN corepack enable

ARG VITE_API_URL=https://api.infamousfreight.com
ENV VITE_API_URL=$VITE_API_URL

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile --filter @infamous-freight/web...

COPY apps/web apps/web

RUN pnpm -C apps/web run build

FROM nginx:1.27-alpine

COPY --from=build /usr/src/app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
