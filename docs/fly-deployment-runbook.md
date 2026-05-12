# Fly.io Deployment Runbook

Run from repo root:

```bash
fly auth login
fly auth whoami
fly deploy
fly status
```

If CLIs are missing, install them first:

```bash
# Fly CLI
curl -L https://fly.io/install.sh | sh
export FLYCTL_INSTALL="$HOME/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"

# Docker CLI (Ubuntu/Debian)
sudo apt-get update && sudo apt-get install -y docker.io
```

Optional preflight (recommended before `fly deploy`):

```bash
scripts/fly-preflight.sh infamous-freight-api https://infamous-freight-api.fly.dev https://api.infamousfreight.com
```

## Digest-pinned production deploy (no image drift)

Use `fly deploy --image` with a **sha256 digest** so Fly cannot drift to a retagged image:

```bash
APP="infamous-freight-api"
IMAGE="ghcr.io/infaemous-freight/infamous-freight-api@sha256:43fd4f0f0eafd34a17ab1b18a6e5b1760e54e56f2bf0491be325e06da105bc00"

fly auth login
fly secrets list --app "$APP"
fly deploy --app "$APP" --image "$IMAGE" --strategy canary --wait-timeout 10m --yes
```

Immediate verification:

```bash
fly status --app "$APP"
fly checks list --app "$APP"
fly releases --app "$APP" --image
fly logs --app "$APP" --no-tail
curl -i https://infamous-freight-api.fly.dev/api/health/live
curl -i https://infamous-freight-api.fly.dev/api/health/ready
```

Expected:
- `/api/health/live` returns HTTP 200 when process liveness is healthy.
- `/api/health/ready` returns HTTP 200 only when app dependencies (for example database) are healthy.

If Fly cannot pull the digest from GHCR (private image/auth required), mirror into Fly registry:

```bash
APP="infamous-freight-api"
TAG="a21800dae96e56fda18195ef00ad6d276b48bb43"

docker login ghcr.io
docker pull ghcr.io/infaemous-freight/infamous-freight-api:$TAG

fly auth docker
docker tag ghcr.io/infaemous-freight/infamous-freight-api:$TAG registry.fly.io/$APP:$TAG
docker push registry.fly.io/$APP:$TAG

fly deploy --app "$APP" --image registry.fly.io/$APP:$TAG --strategy canary --wait-timeout 10m --yes
```

If checks are split (for example one machine passing on 3000 and another stale machine failing on 8080), reconcile one machine at a time:

```bash
APP="infamous-freight-api"
fly status --app "$APP"
fly checks list --app "$APP"

# deploy one machine at a time to avoid split rollout states
fly deploy --app "$APP" --strategy rolling --max-concurrent 1 --wait-timeout 10m --yes
```

## CI / GitHub Actions token setup

Create a deploy-scoped token (app-scoped, expires in 30 days example):

```bash
fly tokens create deploy -a YOUR_FLY_APP_NAME -x 720h
```

Add the token to GitHub repository secrets as:

- `FLY_API_TOKEN`

## Expected runtime invariants

- API binds on `PORT=3000`.
- Fly internal port routes to `3000`.
- Health endpoints return 200 on `/api/health/live` and `/api/health/ready`.

## Safety checks after deploy

```bash
fly auth whoami
fly status --app infamous-freight-api
curl -fsS https://infamous-freight-api.fly.dev/api/health/live
curl -fsS https://infamous-freight-api.fly.dev/api/health/ready
curl -fsS https://api.infamousfreight.com/api/health/live
curl -fsS https://api.infamousfreight.com/api/health/ready
```

CI uses the same sequence via:

```bash
scripts/fly-post-deploy-check.sh infamous-freight-api https://infamous-freight-api.fly.dev https://api.infamousfreight.com
```

Do **not** share `FLY_API_TOKEN` in logs or chat.

## Fly Managed Postgres operations

Use Fly’s MPG commands from your local terminal while authenticated:

```bash
fly auth login
fly postgres list
fly postgres attach <POSTGRES_APP_NAME> --app infamous-freight-api --variable-name DATABASE_URL
fly secrets list --app infamous-freight-api
fly deploy --app infamous-freight-api
curl -fsS https://infamous-freight-api.fly.dev/api/health/live
curl -fsS https://infamous-freight-api.fly.dev/api/health/ready
```

After attach, verify runtime config and release status:

```bash
fly secrets list --app infamous-freight-api
fly status --app infamous-freight-api
fly checks list --app infamous-freight-api
```

If `fly postgres attach` fails, use the Fly dashboard Connect tab and set `DATABASE_URL` manually, then deploy:

```bash
fly secrets set DATABASE_URL='<DATABASE_URL_FROM_FLY_CONNECT_TAB>' --app infamous-freight-api
fly deploy --app infamous-freight-api
```

### Database credential safety

- Treat database URLs as secrets and rotate any URL that was shared in plaintext.
- Store `DATABASE_URL` only in Fly secrets (not in git-tracked files).
- Never paste connection strings or tokens in chat, CI logs, or PR comments.

## Git remote / mirror push safety (Phoenix)

If you need to push to a temporary Phoenix remote, prefer a short-lived shell variable
instead of hardcoding credentials in scripts:

```bash
export PHOENIX_CLONE_URL="https://phoenix.new/git/<redacted-token>/<random>/<repo>"
git remote remove fly 2>/dev/null || true
git remote add fly "${PHOENIX_CLONE_URL}"
git push --quiet fly main
```

For existing repos where `fly` already exists:

```bash
git remote set-url fly "${PHOENIX_CLONE_URL}"
git push --quiet fly main
```

Security requirement: rotate any Phoenix URL or database URL that was ever shared in plaintext.

## Credential exposure incident response (Fly tokens / DB URLs)

If any Fly token or database URL is exposed:

1. Revoke the exposed Fly token immediately.
2. Create a new app-scoped deploy token.
3. Update CI secret `FLY_API_TOKEN`.
4. Rotate database credentials and reset `DATABASE_URL` in Fly secrets.
5. Redeploy and run post-deploy checks.

```bash
# 1) review tokens
fly tokens list

# 2) revoke compromised token (use token id from list)
fly tokens revoke <TOKEN_ID>

# 3) create replacement deploy token (example: 30 days)
fly tokens create deploy -a infamous-freight-api -x 720h

# 4) rotate app secret (paste new value interactively or via CI secret manager)
fly secrets set DATABASE_URL='<new_database_url>' --app infamous-freight-api

# 5) verify release health
scripts/fly-post-deploy-check.sh infamous-freight-api https://infamous-freight-api.fly.dev https://api.infamousfreight.com
```


## Reconcile machines to a single image

When a Fly app has machines running different image versions (for example after a partially-completed rolling deploy), use the reconcile script to inspect the distribution and optionally prune stale-image machines.

**Required environment:**

| Variable | Default | Purpose |
|---|---|---|
| `FLY_API_TOKEN` | — | Must be set; the script validates this before making API calls. |
| `APP_NAME` | `infamous-freight-api` | Target Fly app. |
| `KEEP_IMAGE` | _(newest image)_ | Override the image to keep. |
| `PRUNE_OLD_IMAGES` | `false` | Set to `true` to destroy machines not on the target image. |
| `PRUNE_MAX_COUNT` | `3` | Safety ceiling: refuses to destroy more than this many machines in one run. |
| `FORCE_PRUNE` | `false` | Set to `true` to bypass `PRUNE_MAX_COUNT` after manual review. |

**Inspect image distribution (dry run — no changes):**

```bash
APP_NAME=infamous-freight-api bash scripts/fly-reconcile-single-image.sh
```

The script prints the number of machines per image and exits with status 1 (no changes) if multiple images are found, including the exact command needed to enable pruning.


**If Fly warns that your app is running multiple images:**

When you see:

```
Your app is currently running multiple images.
```

run a dry run first, then prune to the newest image only:

```bash
APP_NAME=infamous-freight-api bash scripts/fly-reconcile-single-image.sh
PRUNE_OLD_IMAGES=true APP_NAME=infamous-freight-api KEEP_IMAGE=<newest-image-from-dry-run> bash scripts/fly-reconcile-single-image.sh
```

For a sample distribution, keep the newest `infamous-freight-api:<deployment-id>` image that already has healthy machines; prune older images only after verifying traffic and health checks.


**Prune machines on old images:**

```bash
PRUNE_OLD_IMAGES=true APP_NAME=infamous-freight-api KEEP_IMAGE=<target-image> bash scripts/fly-reconcile-single-image.sh
```

Replace `<target-image>` with the image digest printed by the dry-run step. The script destroys each stale-image machine with `flyctl machine destroy --force`.

**Override the prune safety ceiling (use with care):**

```bash
PRUNE_OLD_IMAGES=true FORCE_PRUNE=true APP_NAME=infamous-freight-api KEEP_IMAGE=<target-image> bash scripts/fly-reconcile-single-image.sh
```

Only use `FORCE_PRUNE=true` after verifying the machine/image mapping manually. The default ceiling of 3 exists to prevent mass destruction during operator error.

**Safety controls summary:**

- `PRUNE_OLD_IMAGES` must be explicitly set to `true`; no changes are made otherwise.
- Refuses to destroy more than `PRUNE_MAX_COUNT` (default 3) machines per run.
- Validates `FLY_API_TOKEN` is set before any API call.
- Prints the exact remediation command when prune is not enabled.

## If deploy times out waiting for health checks

A timeout such as `timeout reached waiting for health checks to pass` means Fly started the Machine, but it never became healthy before deploy timeout.

Run these commands from repo root and keep the app explicit:

```bash
fly status -a infamous-freight-api --all
fly checks list -a infamous-freight-api
fly machine status <machine-id> -a infamous-freight-api
fly logs -a infamous-freight-api --machine <machine-id> --no-tail

# one-shot helper:
scripts/fly-diagnose-health-timeout.sh infamous-freight-api <machine-id>
```

Common root causes:

- API process crashed after startup due to bad/missing secrets.
- Port/host mismatch (must bind `0.0.0.0:3000` in this repo).
- Health route mismatch or non-200 responses from `/api/health/live`.

Secrets rollout (deterministic sequence):

```bash
scripts/fly-secrets-rollout.sh infamous-freight-api

# Equivalent manual steps:
# fly config save -a infamous-freight-api --yes
# fly secrets sync -a infamous-freight-api --stage
# fly secrets deploy -a infamous-freight-api
```

Notes:

- `--detach` only skips waiting; it does not fix health failures.
- Use `--stage` + `deploy` when you want one controlled restart window.
