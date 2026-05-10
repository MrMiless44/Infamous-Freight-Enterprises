# LPTMS on DigitalOcean App Platform

DigitalOcean App Platform is the cleanest DigitalOcean path for LPTMS, but the
repo's built-in Deploy to DigitalOcean flow should be treated as a demo
deployment. It is not a production architecture for a live freight-broker TMS.

The important constraint is persistence. App Platform container filesystem state
is ephemeral, so local files can disappear after deployments, restarts, or
container replacement. SQLite inside the container is acceptable for a quick
demo, but production LPTMS should use a managed database and object storage for
data that must survive redeploys.

## Option 1: Fast Demo Deploy

Use this path only when the goal is to see LPTMS running quickly.

1. Open the repo and use the Deploy to DigitalOcean badge.
2. Choose App Platform.
3. Set the required production basics:

```env
APP_URL=https://your-domain.com
APP_ENV=production
APP_DEBUG=false
```

4. Add the required API and product keys from `.env.example`, including:

```env
FMCSA_API_KEY=
GOOGLE_MAPS_API_KEY=
STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=
ENABLE_BILLING=false
FEEDBACK_EMAIL=contact@your-domain.com
```

5. Add the custom domain in App Platform. App Platform can issue the SSL
   certificate for the custom domain, so Certbot is not needed for this path.

Keep `APP_DEBUG=false` in production. Laravel debug mode can expose sensitive
configuration values.

## Option 2: Production-Ready App Platform Deploy

Use this path for any serious freight-broker deployment:

```text
App Platform web service
DigitalOcean Managed Database
Optional DigitalOcean Spaces bucket
Queue worker
Deploy-time migration job
```

### 1. Fork The Repo

Fork `loadpartner/tms`, then deploy from the fork. Production deployment needs
Dockerfile and App Platform spec changes that should live in the fork.

### 2. Replace The Production Dockerfile

The demo Dockerfile runs database setup during the image build. That is risky
for production because App Platform bindable runtime variables, including
database connection variables, are not available during Docker image builds.

Use a Dockerfile that builds the application only:

```dockerfile
# .do/docker/Dockerfile
ARG TARGETPLATFORM

FROM --platform=$TARGETPLATFORM ghcr.io/loadpartner/tms:image-base

WORKDIR /var/www/html

COPY . .

ENV DEBIAN_FRONTEND=noninteractive
ENV SUPERVISOR_PHP_USER="www-data"

RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader \
    && npm ci \
    && npm run build \
    && rm -rf node_modules \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8080/tcp

ENTRYPOINT ["start-container"]
```

This production Dockerfile intentionally avoids:

- Baked `.env` files
- SQLite database creation
- `php artisan migrate --seed` during image build
- `php artisan key:generate` during image build
- Composer development dependencies

It also uses `npm ci` because the repo includes a lockfile.

### 3. Use A Managed Database

Create a DigitalOcean Managed PostgreSQL or Managed MySQL database. Managed
databases are the production path because they support operational features such
as scaling, standby nodes, read-only nodes, backups, and trusted sources.

LPTMS reads `DB_URL`, not `DATABASE_URL`, from Laravel configuration. Map the
DigitalOcean bindable database URL into `DB_URL`.

For PostgreSQL:

```env
DB_CONNECTION=pgsql
DB_URL=${tms-db.DATABASE_PRIVATE_URL}
```

For MySQL:

```env
DB_CONNECTION=mysql
DB_URL=${tms-db.DATABASE_PRIVATE_URL}
```

Use the private URL when the app and database are in the same VPC.

### 4. Set Production Environment Variables

Minimum production runtime environment:

```env
APP_NAME="LoadPartner TMS"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
APP_KEY=base64:PASTE_GENERATED_KEY_HERE
APP_TIMEZONE=UTC

LOG_CHANNEL=stack
LOG_LEVEL=info

DB_CONNECTION=pgsql
DB_URL=${tms-db.DATABASE_PRIVATE_URL}

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database

FILESYSTEM_DISK=local

FMCSA_API_KEY=
GOOGLE_MAPS_API_KEY=

ENABLE_BILLING=false
FEEDBACK_EMAIL=contact@your-domain.com
VALID_PHONE_COUNTRIES=US,CA
```

Generate the Laravel application key locally:

```bash
php artisan key:generate --show
```

Set `APP_KEY`, integration API keys, billing secrets, mail credentials, and
object-storage credentials as encrypted App Platform environment variables.

### 5. Use Spaces For File Uploads

Do not rely on `storage/app` inside the container for user uploads. Use
DigitalOcean Spaces or another S3-compatible object storage provider.

LPTMS already supports S3-compatible storage through these variables:

```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your_spaces_key
AWS_SECRET_ACCESS_KEY=your_spaces_secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-space-name
AWS_ENDPOINT=https://nyc3.digitaloceanspaces.com
AWS_USE_PATH_STYLE_ENDPOINT=false
```

Use the region-specific Spaces endpoint for the selected bucket region.

### 6. Add A Deploy-Time Migration Job

Do not run migrations in the Dockerfile. Add a `PRE_DEPLOY` or `POST_DEPLOY`
App Platform job:

```bash
php artisan migrate --force
```

A `PRE_DEPLOY` migration is usually better when migrations are backward
compatible. Use `POST_DEPLOY` only when the new app version must be deployed
before the migration runs.

Example job pattern:

```yaml
jobs:
  - name: migrate
    kind: PRE_DEPLOY
    git:
      branch: main
      repo_clone_url: https://github.com/YOUR_GITHUB/tms.git
    dockerfile_path: .do/docker/Dockerfile
    run_command: php artisan migrate --force
    envs:
      - key: APP_ENV
        scope: RUN_TIME
        value: production
      - key: APP_DEBUG
        scope: RUN_TIME
        value: "false"
      - key: APP_URL
        scope: RUN_TIME
        value: ${APP_URL}
      - key: APP_KEY
        scope: RUN_TIME
        type: SECRET
        value: base64:PASTE_GENERATED_KEY_HERE
      - key: DB_CONNECTION
        scope: RUN_TIME
        value: pgsql
      - key: DB_URL
        scope: RUN_TIME
        value: ${tms-db.DATABASE_PRIVATE_URL}
```

### 7. Add A Queue Worker

If `QUEUE_CONNECTION=database`, queued jobs need a worker process. Add an App
Platform Worker component using the same repo, Dockerfile, and runtime
environment variables.

Worker command:

```bash
php artisan queue:work --sleep=3 --tries=3 --timeout=90
```

### 8. Add Scheduler Only If Needed

For Laravel scheduled tasks, add a Scheduled Job:

```bash
php artisan schedule:run
```

App Platform scheduled jobs use cron expressions, but the minimum interval is
15 minutes. That is acceptable for occasional jobs, but not for Laravel
schedules that require true every-minute execution.

Example:

```yaml
jobs:
  - name: scheduler
    kind: SCHEDULED
    schedule:
      cron: "*/15 * * * *"
      time_zone: America/Chicago
    git:
      branch: main
      repo_clone_url: https://github.com/YOUR_GITHUB/tms.git
    dockerfile_path: .do/docker/Dockerfile
    run_command: php artisan schedule:run
```

## Practical Production Recommendation

| Piece | Use |
|---|---|
| Hosting | DigitalOcean App Platform |
| Database | DigitalOcean Managed PostgreSQL or MySQL |
| Files | DigitalOcean Spaces |
| Web | App Platform service on port 8080 |
| Migrations | App Platform deploy-time job |
| Queues | App Platform worker |
| Scheduler | Scheduled job, or a Droplet if minute-level cron matters |
| Domain and SSL | App Platform custom domain with automatic SSL |

The one-click deploy is useful for demos. For production, replace the
SQLite/build-time migration setup with a persistent managed database, runtime
environment configuration, object storage for uploads, and separate operational
components for migrations and queues.
