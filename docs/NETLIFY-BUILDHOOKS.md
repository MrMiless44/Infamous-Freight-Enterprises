# Netlify Buildhook Packages — Provenance & Ownership

Netlify can generate local build-time plugin state under
`apps/web/.netlify/plugins/`. Some generated plugins are sourced from URL-hosted
tarballs rather than a public npm registry. This document records the historical
ownership, source artifact, integrity value, and maintenance path for packages
that have appeared in that generated state.

---

## Background

Netlify's integration marketplace distributes "buildhook" packages as versioned
`.tgz` archives hosted on private Netlify deploy previews. When generated plugin
state is present, each tarball's SHA-512 digest is pinned in `package-lock.json`,
giving the same tamper-evidence guarantee as a `resolved` + `integrity` record
from the npm registry.

The UUID-shaped subdomain in each URL (e.g.
`3bd69bc3-080d-4857-a4ab-c6aa5abc63a6.netlify.app`) is the Netlify deploy preview
ID of the integration's own site. Netlify keeps those deploys immutable.

---

## Package inventory

### 1. `async-workloads-buildhooks`

| Field | Value |
|---|---|
| **Owner / Maintainer** | Netlify (Async Workloads product team) |
| **Source artifact** | `https://3bd69bc3-080d-4857-a4ab-c6aa5abc63a6.netlify.app/packages/buildhooks.tgz` |
| **Pinned version** | `0.0.0-or1lf` |
| **lock-file integrity** | `sha512-VOOZi9+Csa998jzzTbrMtPPAsi+vQxXRLUc5Gvd+NTOwMUA/8FICkaCFNf5427j9VvVAeLwmWZOB8Y97hJOh4Q==` |
| **Status** | 🗑️ **Removed from repo** — generated Netlify plugin state is not committed for the static web deploy. Re-enable only through the Netlify dashboard if the integration is intentionally used. |
| **Update path** | Re-enable or upgrade the Async Workloads integration via the Netlify dashboard; Netlify will rewrite the tarball URL in `package.json` and regenerate the lockfile. |

---

### 2. `launchdarkly-buildhooks`

| Field | Value |
|---|---|
| **Owner / Maintainer** | LaunchDarkly (Netlify integration) |
| **Source artifact** | `https://4edbdf6f-0af6-455f-904c-471a5280ba53.netlify.app/packages/buildhooks.tgz` |
| **Pinned version** | `0.0.0-42wva` |
| **lock-file integrity** | `sha512-sE3NF7BBlrAgLNbN3ECDtYw5Aq8BqXqboUh88Wvfohm3l0glYWf7Pmkyl7CRHc9IXjpMgZejmA3y2un7xHWpPw==` |
| **Status** | 🗑️ **Removed** — no application code references LaunchDarkly, and the generated `official-launchdarkly_*` functions caused Netlify function uploads to fail when the site's function runtime environment exceeded Netlify's 4 KB limit. |
| **Update path** | Re-enable only after confirming the Netlify site environment assigned to functions is below the runtime limit. Upgrade via the Netlify × LaunchDarkly integration settings; LaunchDarkly will push a new tarball URL and lockfile entry. Verify the new integrity hash before merging. |

---

### 3. `neon-buildhooks`

| Field | Value |
|---|---|
| **Owner / Maintainer** | Neon (Serverless Postgres) |
| **Source artifact** | `https://37fb2d91-fc5f-402b-b52c-84240e7335fa.netlify.app/packages/buildhooks.tgz` |
| **Pinned version** | `0.0.0-wid8g` |
| **Historical lock-file integrity (last known)** | `sha512-fOhoaX3zsXoz8/ivbo9KyTqG+faemDQs/WG9HQ/B3LcA5oPLqTWsD20bpQe7hiQrzZ6f7YFBBBynBz+5hdDjiw==` — recorded from a prior `apps/web/.netlify/plugins/package-lock.json` entry; not present in the current repo state. |
| **Status** | 🗑️ **Removed** — this project uses Supabase Postgres, not Neon. The package was auto-installed when the Neon integration was briefly evaluated and was never used in production. |
| **Update path** | N/A — removed. If Neon is adopted in future, re-enable the integration from the Netlify dashboard and regenerate the lockfile; treat the integrity above as historical audit data only unless verified against the prior commit where it appeared. |

---

### 4. `prerender-buildhooks`

| Field | Value |
|---|---|
| **Owner / Maintainer** | Netlify (Prerender / Edge Prerendering team) |
| **Source artifact** | `https://6abe5a43-4668-4f72-b3f7-823e2d8bbbbf.netlify.app/packages/buildhooks.tgz` |
| **Pinned version** | `0.0.0-mdcn1` |
| **lock-file integrity** | `sha512-k0IKt0aJgySlRTpJdUfr/Vfq2avo2AH44f2TZc9cvj+NhWGIOX7BDHRUblGdWPnR4DDUVg35pmRx2NNx+MY31g==` |
| **Status** | 🗑️ **Removed from repo** — generated Netlify plugin state is not committed for the static web deploy. Re-enable only through the Netlify dashboard if prerendering is intentionally used. |
| **Update path** | Upgrade via the Netlify Prerender integration settings in the dashboard. |

---

### 5. `prisma-postgres-buildhooks`

| Field | Value |
|---|---|
| **Owner / Maintainer** | Prisma (Netlify integration) |
| **Source artifact** | `https://abfbde63-a3d0-4974-a9f9-57f108242e67.netlify.app/packages/buildhooks.tgz` |
| **Pinned version** | `0.0.0-h7ovu` |
| **lock-file integrity** | `sha512-pz6fSHzWMrOeuRCRH2bUCtgqBcLmVwjMFC5+O6dOk4iO0t8FFQEnLAFjh/f/YyG7CBTAbZhe8bSsR0RMlDK8NQ==` |
| **Status** | 🗑️ **Removed** — `apps/api` uses Prisma, but the API is deployed to **Fly.io**, not Netlify. The Netlify build only produces the static Vite frontend. This build hook was auto-installed when the Prisma × Netlify integration was evaluated and has no effect on the actual deploy. |
| **Update path** | N/A — removed. If the API is ever migrated to Netlify Functions, re-enable the Prisma Netlify integration from the dashboard. |

---

### 6. `@sentry/netlify-build-plugin`

| Field | Value |
|---|---|
| **Owner / Maintainer** | Sentry |
| **Source artifact** | npm registry (`@sentry/netlify-build-plugin@1.1.1`) |
| **Status** | 🗑️ **Removed** — this plugin failed deploys in `onPostBuild` whenever the site-level Sentry token was missing or invalid (`401 Invalid token`). The Vite build already guards Sentry source-map upload behind `SENTRY_AUTH_TOKEN`/`SENTRY_ORG`/`SENTRY_PROJECT`, so keeping the Netlify plugin introduced an unnecessary second release step and a production deploy risk. |
| **Update path** | Re-enable only if Netlify-managed Sentry release creation is explicitly required and a valid site-level `SENTRY_AUTH_TOKEN` is maintained. Prefer one release/upload path to avoid duplicate failure points. |

#### Sentry 401 recovery checklist

1. In **Netlify → Site configuration → Environment variables**, replace `SENTRY_AUTH_TOKEN` with a valid token scoped to `project:releases`, `org:read`, and `project:read`.
2. If release creation is not required, keep `SENTRY_DISABLE_UPLOAD=true` and do not re-add `@sentry/netlify-build-plugin` in `netlify.toml`.
3. Redeploy and confirm the build no longer executes `onPostBuild` Sentry release creation.

---

## Integrity controls

When generated plugin packages are retained, they must be pinned by
**SHA-512 tarball digest** in `apps/web/.netlify/plugins/package-lock.json`. npm
verifies this hash on every `npm install`, rejecting any tarball whose content
does not match. This provides the same integrity guarantee as registry packages.

> **To reintroduce a buildhook**: confirm the Netlify dashboard integration is
> intentionally enabled, regenerate the local plugin package files, review the
> new `integrity` value in the updated `package-lock.json`, and commit only if
> the integration is required for deploys.

---

## Maintenance responsibilities

The Netlify integration dashboard is the authoritative source of truth for which
integrations are active on this site. When Netlify updates an integration it will
open a PR (or update the lockfile automatically) with the new tarball URL and
integrity hash.

Future maintainers should:
1. Cross-check the packages listed here against the integrations enabled in the
   Netlify dashboard.
2. Ensure no new URL-sourced package appears in generated plugin metadata without a
   corresponding entry in this document.
3. Immediately investigate any integrity mismatch surfaced by `npm ci` in CI/CD.
