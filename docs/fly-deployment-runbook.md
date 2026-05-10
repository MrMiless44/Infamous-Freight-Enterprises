# Fly.io Deployment Runbook

Run from repo root:

```bash
fly auth login
fly auth whoami
fly deploy
fly status
```

Optional preflight (recommended before `fly deploy`):

```bash
scripts/fly-preflight.sh infamous-freight https://infamous-freight.fly.dev https://api.infamousfreight.com
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
- Health endpoint returns 200 on `/api/health`.

## Safety checks after deploy

```bash
fly auth whoami
fly status --app infamous-freight
curl -fsS https://infamous-freight.fly.dev/api/health
curl -fsS https://api.infamousfreight.com/api/health
```

CI uses the same sequence via:

```bash
scripts/fly-post-deploy-check.sh infamous-freight https://infamous-freight.fly.dev https://api.infamousfreight.com
```

Do **not** share `FLY_API_TOKEN` in logs or chat.

## Fly Managed Postgres operations

Use Fly’s MPG commands from your local terminal while authenticated:

```bash
fly mpg connect
fly mpg proxy
fly mpg attach kyzl60xmlk6opj9g --app infamous-freight
```

After attach, verify runtime config and release status:

```bash
fly secrets list --app infamous-freight
fly status --app infamous-freight
fly checks list --app infamous-freight
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
fly tokens create deploy -a infamous-freight -x 720h

# 4) rotate app secret (paste new value interactively or via CI secret manager)
fly secrets set DATABASE_URL='<new_database_url>' --app infamous-freight

# 5) verify release health
scripts/fly-post-deploy-check.sh infamous-freight https://infamous-freight.fly.dev https://api.infamousfreight.com
```


## If deploy times out waiting for health checks

A timeout such as `timeout reached waiting for health checks to pass` means Fly started the Machine, but it never became healthy before deploy timeout.

Run these commands from repo root and keep the app explicit:

```bash
fly status -a infamous-freight --all
fly checks list -a infamous-freight
fly machine status <machine-id> -a infamous-freight
fly logs -a infamous-freight --machine <machine-id> --no-tail

# one-shot helper:
scripts/fly-diagnose-health-timeout.sh infamous-freight <machine-id>
```

Common root causes:

- API process crashed after startup due to bad/missing secrets.
- Port/host mismatch (must bind `0.0.0.0:3000` in this repo).
- Health route mismatch or non-200 responses from `/api/health/live`.

Secrets rollout (deterministic sequence):

```bash
scripts/fly-secrets-rollout.sh infamous-freight

# Equivalent manual steps:
# fly config save -a infamous-freight --yes
# fly secrets sync -a infamous-freight --stage
# fly secrets deploy -a infamous-freight
```

Notes:

- `--detach` only skips waiting; it does not fix health failures.
- Use `--stage` + `deploy` when you want one controlled restart window.
