![lptms](https://github.com/user-attachments/assets/7cff521c-d128-495b-b7bd-5e555af98c0b)

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/loadpartner/tms/tree/main)

# The Open Source Transportation Management System for Freight Brokers

#### 🌐 [tms.loadpartner.io](https://tms.loadpartner.io)

## Get involved
🗨️ [Discord Community](https://tms.loadpartner.io/links/discord)

📰 [Subscribe to the newsletter](https://tms.loadpartner.io/links/newsletter)

## Tech Stack
[Laravel](http://laravel.com/) + [Inertia.js](https://inertiajs.com/) + [React](https://react.dev/)

## Development
A local environment can be setup quickly using [Laravel Sail](https://laravel.com/docs/master/sail) and our docker configurations.

### Fresh Setup
Standing up the development environment after cloning the repository should follow these steps:

#### Setup [Laravel Sail](https://laravel.com/docs/11.x/sail)
```bash
docker run --rm \
  -u "$(id -u):$(id -g)" \
  -v "$(pwd):/var/www/html" \
  -w /var/www/html \
  laravelsail/php84-composer:latest \
  composer install --ignore-platform-reqs
```

Can't find `sail` in your path? Add to your bashrc/zshrc
```bash
export PATH=./vendor/bin:$PATH
```

#### Copy `env` file
```bash
cp .env.example .env
```

#### Up sail
```bash
sail up -d      # (using sqlite and no other services)
# OR
sail --profile full up -d   # (all services in docker-compose.yml)
```

#### Setup database
```bash
sail artisan migrate
```

#### Install npm modules
```bash
sail npm install
```

#### Generate APP_KEY
```bash
sail artisan key:generate
```

#### Run Vite
```bash
sail npm run dev
```

#### [OPTIONAL] Setup Test Data
```bash
sail artisan dev:refresh
```

This will create test users with the following credentials:

| Email | Password |
|-------|----------|
| admin@test.com | password |
| user@test.com | password |

#### Setting up Mailpit
- Ensure Mailpit is not commented out in `docker-compose.yml`
- Visit http://localhost:8025 (or whatever you have specified in `docker-compose.yml FORWARD_MAILPIT_DASHBOARD_PORT`)
- Update the following .env settings:

```bash
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025 # or whatever you have specified in docker-compose.yml FORWARD_MAILPIT_PORT
```

#### Setting up Localstack
If setting up localstack S3, you should first create the bucket:

```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://my-test-bucket
# or list contents if already there
aws --endpoint-url=http://localhost:4566 s3 ls s3://my-test-bucket --recursive
```

Update your .env to reflect s3:

```bash
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=my-test-bucket
AWS_ENDPOINT=http://localstack:4566
AWS_USE_PATH_STYLE_ENDPOINT=true
FILESYSTEM_DISK=s3
```

As noted above, the AWS endpoint is `localstack` which is the container name that can be reached by other containers within docker that are linked. However, if you are testing via the browser and try to download, you will be served with `http://localstack:4566` so one way to solve that is to edit your hosts file to point `localstack` to `127.0.0.1` the same way localhost is.

## ⚠️ Troubleshooting: Nginx Proxy Manager tip

If you're hosting the app behind **Nginx Proxy Manager** and pages are not fully loading or assets seem broken, try adding the following in the **Advanced > Custom Nginx Configuration** section of your proxy:

```nginx
proxy_buffering on;
proxy_buffers 16 16k;
proxy_buffer_size 32k;
```
