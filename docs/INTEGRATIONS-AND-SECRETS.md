<p align="center">
  <a href="https://infamousfreight.com" target="_blank" rel="noopener noreferrer">
    <img src="/docs/screenshots/infamousfreight-header.svg" alt="Infamous Freight" width="100%">
  </a>
</p>

# Infamous Freight — Integrations & Secrets Inventory

Centralized reference for every external service and CI/CD secret used by this
repository. Update this document whenever a new integration is added or a
secret is rotated.

---

## 1. External Integrations

| Service | Category | Runtime Purpose | Owner | Docs |
|---------|----------|-----------------|-------|------|
| **Fly.io** | Hosting | Runs the Node/Express API container in production | Platform team | https://fly.io/docs |
| **Netlify** | Hosting | Builds and serves the React web app in production via native Git integration | Platform team | https://docs.netlify.com |
| **GitHub Container Registry (GHCR)** | Container registry | Stores tagged API Docker images produced by the `build-api` CI job | Platform team | https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry |
| **Sentry** | Observability | Captures runtime web errors and uploads source maps during Netlify web builds | Platform team | https://docs.sentry.io |
| **Stripe** | Payments | Processes freight invoices and carrier pay-outs; web SDK loaded at runtime | Payments team | https://stripe.com/docs |
| **Supabase** | Auth + Database | Provides user auth (JWT) and the PostgreSQL database via the Supabase client SDK | Platform team | https://supabase.com/docs |
| **Socket.IO** | Real-time | Pushes live shipment-status updates from the API to the web client | Platform team | https://socket.io/docs |
| **Netlify plugins** | Build tooling | Optional Netlify build plugins (e.g. `netlify.toml`) used for edge configuration and redirects | Platform team | https://docs.netlify.com/configure-builds/build-plugins |

---

## 2. Secrets and Environment Inventory

Store secrets and deployment environment variables in the platform that actually
uses them:

- **API deployment:** GitHub Actions repository secrets and Fly.io app secrets.
- **Web deployment:** Netlify site environment variables because Netlify builds
  `apps/web` through native Git integration.

Never commit real secret tokens. Public client-side values such as a Sentry DSN
or Stripe publishable key may appear in examples, but the production source of
truth should still be the deployment environment.

### 2.1 GitHub Actions / API deployment secrets

| Secret | Owner | Storage | Jobs that use it | Purpose |
|--------|-------|---------|------------------|---------|
| `GITHUB_TOKEN` | GitHub (auto-provisioned) | GitHub Actions (built-in) | `build-api` (GHCR push) | Authenticates Docker pushes to GitHub Container Registry; never needs to be set manually |
| `FLY_API_TOKEN` | Platform team | GitHub Actions repo secret | `deploy-api` | Authorises `flyctl deploy` to push the API container to Fly.io |

### 2.2 Netlify web environment variables

Set these in **Netlify → Site settings → Environment variables** for the web app.

| Variable | Owner | Value / Format | Purpose |
|----------|-------|----------------|---------|
| `VITE_API_URL` | Platform team | `/api` | Sets the production API base URL used by the React app through the Netlify proxy |
| `VITE_STRIPE_PUBLIC_KEY` | Payments team | Stripe publishable key, `pk_live_...` | Used by `@stripe/stripe-js` to initialise the Stripe payment element |
| `VITE_SUPABASE_URL` | Platform team | Supabase project URL | Used by the web client for Supabase auth and client calls |
| `VITE_SUPABASE_ANON_KEY` | Platform team | Supabase anon key | Public Supabase client key used by the browser app |
| `VITE_SENTRY_DSN` | Platform team | `https://<public-key>@o<org-id>.ingest.us.sentry.io/<project-id>` | Connects the React web app to the `infamous-freight` Sentry project |
| `VITE_SENTRY_ENABLED` | Platform team | `true` | Enables Sentry in production when the DSN is present; set to `false` for emergency disable |
| `SENTRY_AUTH_TOKEN` | Platform team | Sentry auth token with release/source-map permissions | Allows the Sentry Vite plugin to upload production source maps during Netlify builds |
| `SENTRY_ORG` | Platform team | `infmous` | Sentry organization slug |
| `SENTRY_PROJECT` | Platform team | `infamous-freight` | Sentry project slug |
| `SENTRY_SOURCEMAPS` | Platform team | Optional: `1` | Forces source-map generation without upload; normally leave unset |

### 2.3 Runtime secrets (application layer, not in `ci-cd.yml`)

These are used at application runtime and should be set as Fly.io app secrets
(`fly secrets set`) and/or as Supabase environment variables. They are listed
here for ownership awareness.

| Secret | Owner | Notes |
|--------|-------|-------|
| `DATABASE_URL` | Platform team | Postgres connection string; set on the Fly.io app |
| `SUPABASE_URL` | Platform team | Project URL from Supabase Project Settings → API |
| `SUPABASE_SERVICE_KEY` | Platform team | `service_role` key; grants admin DB access — treat as critical |
| `STRIPE_SECRET_KEY` | Payments team | Server-side Stripe API key; used by the API for charge creation |
| `STRIPE_WEBHOOK_SECRET` | Payments team | Verifies Stripe webhook signatures on the API |
| `JWT_SECRET` | Platform team | Signs session tokens issued by the API |

---

## 3. Runbooks

### 3.0 Bootstrap deployment CLIs (local/dev container)

Install the baseline deployment CLIs used by this repository (Docker, Fly.io,
and `jq`) with:

```bash
sudo bash scripts/install-dev-clis.sh
```

If Docker is installed but not running in your environment, start it before
attempting image builds:

```bash
sudo systemctl start docker
docker info
```

In restricted containers/CI, the Docker CLI may be installed while the daemon
socket remains unavailable; in that case `docker info` will fail until a daemon
is provided.

### 3.1 Deploy failure — API (Fly.io)

**Symptom:** The `deploy-api` job fails or the API is unreachable at
`https://api.infamousfreight.com/health`.

**Steps:**

1. Open the failed workflow run in GitHub Actions and expand the
   `Deploy API to Fly.io` step to read the `flyctl` error output.

2. **Auth error (`unauthenticated` / `401`):**
   ```
   Error: failed to fetch an app: 401
   ```
   Rotate `FLY_API_TOKEN` (see §3.3) and re-run the workflow.

3. **No machines / capacity error:** Log in to the Fly.io dashboard and check
   the `infamous-freight` app health. Scale or restart:
   ```bash
   fly status --app infamous-freight-api
   fly machines restart --app infamous-freight-api
   ```
   If a single machine needs a targeted runtime update, first list machines and
   then update by machine ID:
   ```bash
   fly machines list --app infamous-freight-api
   fly machine update <machine_id> --app infamous-freight-api --vm-size shared-cpu-1x
   ```
   Use machine-level updates for controlled incident remediation; prefer full
   app deploys for routine releases. After any machine-level update, verify the
   API is healthy:
   ```bash
   curl -fsS https://api.infamousfreight.com/health
   ```

4. **Build failed before deploy:** The `build-api` job must succeed before
   `deploy-api` runs. Fix the build error first, then re-push to `main`.

5. **Manual deploy:**
   ```bash
   fly auth login
   flyctl deploy --remote-only --app infamous-freight-api
   ```

6. **Rollback to last good release:**
   ```bash
   fly releases --app infamous-freight-api   # find the last good version
   fly deploy --image <previous-image-tag> --app infamous-freight-api
   ```

---

### 3.2 Deploy failure — Web (Netlify)

**Symptom:** The web app is unreachable at `https://www.infamousfreight.com`.

Web deploys are handled automatically by **Netlify's native Git integration** on
push to `main`. GitHub Actions does not deploy the web app.

**Steps:**

1. Open the Netlify dashboard → Sites → `infamous-freight` → Deploys and review
   the failing build log.

2. **Build error (TypeScript / Vite):**
   Reproduce locally before investigating:
   ```bash
   VITE_API_URL=/api \
   VITE_STRIPE_PUBLIC_KEY=pk_live_... \
   VITE_SENTRY_DSN=https://<public-key>@o<org-id>.ingest.us.sentry.io/<project-id> \
   VITE_SENTRY_ENABLED=true \
   npm run build:web
   ```

3. **Missing environment variable:**
   Add or correct the variable in Netlify → Site settings → Environment variables.
   For Sentry, set:
   ```env
   VITE_SENTRY_DSN=https://<public-key>@o<org-id>.ingest.us.sentry.io/<project-id>
   VITE_SENTRY_ENABLED=true
   SENTRY_ORG=infmous
   SENTRY_PROJECT=infamous-freight
   SENTRY_AUTH_TOKEN=<store only in Netlify; never commit>
   ```

4. **Sentry source maps not uploading:**
   Confirm all three build-time variables exist in Netlify:
   ```env
   SENTRY_AUTH_TOKEN=<secret>
   SENTRY_ORG=infmous
   SENTRY_PROJECT=infamous-freight
   ```
   Then trigger a fresh Netlify deploy from the latest `main` commit.

5. **Rollback to previous deployment:**
   In the Netlify dashboard, navigate to the site → Deploys → select the last
   successful build → Publish deploy.

---

### 3.3 Secret rotation

Rotate secrets immediately if they are exposed (e.g. committed to git, visible
in public logs) or on the schedule below.

| Secret | Rotation frequency | Steps |
|--------|--------------------|-------|
| `FLY_API_TOKEN` | On exposure / annually | 1. Log in to Fly.io → Personal Access Tokens → revoke old token, create new one. 2. Update GitHub Actions secret `FLY_API_TOKEN`. 3. Trigger a test deploy to confirm. |
| `SENTRY_AUTH_TOKEN` | On exposure | 1. Sentry → Settings → Auth Tokens → revoke, create new with release/source-map permissions. 2. Update `SENTRY_AUTH_TOKEN` in Netlify environment variables. 3. Trigger a clean Netlify deploy and verify source-map upload in Sentry. |
| `STRIPE_SECRET_KEY` | On exposure | 1. Stripe Dashboard → API Keys → roll key. 2. Update the Fly.io app secret (`fly secrets set STRIPE_SECRET_KEY=...`). 3. Verify webhook signing still works. |
| `STRIPE_WEBHOOK_SECRET` | On endpoint change / exposure | 1. Stripe Dashboard → Webhooks → regenerate signing secret. 2. Update `STRIPE_WEBHOOK_SECRET` on the Fly.io app. |
| `SUPABASE_SERVICE_KEY` | On exposure | 1. Supabase dashboard → Project Settings → API → regenerate `service_role` key. 2. Update all references (Fly.io secrets, any CI secrets). |
| `JWT_SECRET` | On exposure | 1. Generate a new random 256-bit secret. 2. Update on Fly.io: `fly secrets set JWT_SECRET=...`. **Note:** all active sessions will be invalidated — users must re-login. |

**How to update a GitHub Actions secret:**
```bash
gh secret set SECRET_NAME --body "new-value" \
  -R Infamous-Freight/Infamous-freight
```

**How to update Netlify environment variables:**
Use Netlify dashboard → Site settings → Environment variables, or run:
```bash
netlify env:set VARIABLE_NAME "value"
```

---

### 3.4 Service outage

#### Fly.io outage (API down)

1. Check status at https://status.fly.io.
2. If a regional outage, consider scaling to a different region:
   ```bash
   fly regions add iad --app infamous-freight-api   # e.g. us-east
   ```
3. Until restored, update the web app to show a maintenance banner or redirect
   to a static status page.

#### Netlify outage (Web down)

1. Check status at https://www.netlifystatus.com.
2. The last successful Netlify deploy remains live; Netlify serves from its CDN
   and typically maintains the previous build during a partial outage.
3. For a full outage, the built `apps/web/dist` can be served temporarily from
   a CDN or another static host.

#### Stripe outage (Payments unavailable)

1. Check status at https://status.stripe.com.
2. Disable the payment flow in the app via a feature flag or a temporary
   maintenance message to prevent partial transactions.
3. Do not retry failed charges automatically until the outage is resolved.

#### Supabase outage (Auth / DB down)

1. Check status at https://status.supabase.com.
2. Auth-gated pages will fail — consider serving a read-only maintenance page.
3. Fly.io app logs will show DB connection errors; no action needed beyond
   waiting for restoration.
4. If the outage is prolonged, contact Supabase support with your project ref.

#### Sentry outage (Observability gap)

Sentry is non-critical for uptime. Deploys continue without source-map uploads.
Monitor https://status.sentry.io and resume normal operations once resolved.

---

### 3.5 Vercel build-rate-limit blocking PR checks

**Symptom:** A PR check labelled "Vercel" or "Vercel Preview Deployment" shows
a failing or pending status with a link that redirects to a Vercel
build-rate-limit page instead of a normal build result.

**Root cause:** The Vercel account has hit its concurrent-build quota or monthly
build-minute limit. This is an account/provider constraint, not a code failure.

**Merge policy exception:** Vercel preview deployments are **not** a required
merge gate for this repository. The required deploy signal is the Netlify build
(triggered by the native Netlify Git integration). A PR may be merged as long as
the following checks pass regardless of the Vercel status:

- `CI/CD — Infamous Freight / Test & Lint` — passes
- Netlify deploy preview (shows on the PR timeline) — passes or is skipped for
  API-only changes

**Immediate workarounds:**

1. **Disable Vercel's automatic GitHub integration** (already applied):
   `apps/web/vercel.json` sets `"github": {"enabled": false, "autoAlias": false}`
   which prevents the Vercel bot from posting its own check status on pull
   requests.

2. **The `vercel-preview.yml` GitHub Actions workflow** runs with
   `continue-on-error: true` and retries up to three times with exponential
   back-off, so a transient rate-limit will not cause a hard workflow failure.

3. **Re-run after the rate limit clears:** If the Vercel account quota resets
   (typically at the start of the next billing period), re-trigger the workflow
   from the Actions tab on the PR. The `vercel-preview.yml` workflow will run
   automatically on the next push to the branch.

**Long-term resolution:**

- If Vercel preview deploys are needed, upgrade the Vercel account plan or
  reduce concurrent build triggers by limiting the `paths` filter in
  `vercel-preview.yml`.
- If Vercel is no longer needed (Netlify is the sole web host), remove
  `apps/web/vercel.json` and delete the `vercel-preview.yml` workflow.

---

## 4. Adding a new integration

When a new external service is wired in:

1. Add a row to the **External Integrations** table in §1.
2. Add each new secret or environment variable to the inventory in §2.
3. Document rotation steps in the **Secret rotation** table in §3.3.
4. Add the secret to the appropriate deployment platform or CI job.
