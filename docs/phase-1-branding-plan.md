# Phase 1 — Branding Plan

The first build phase for Infamous Freight is locking down brand identity across the web app and public surfaces so everything that follows ships under a consistent look and voice.

> Companion docs: [`platform-roadmap.md`](./platform-roadmap.md), [`customization-checklist.md`](./customization-checklist.md), [`branding/README.md`](./branding/README.md).

---

## Goals

1. A consistent visual identity across `apps/web` (logo, palette, typography, iconography).
2. A canonical social / Open Graph preview that matches the in-app brand.
3. Marketing surfaces (header art, screenshots, README) aligned to the same identity.
4. No regressions to deployment guardrails (Netlify redirects, Fly config, etc.).

## Scope

In scope:

- Tailwind theme (`apps/web/tailwind.config.*`) — colors, fonts, spacing tokens.
- Global styles in `apps/web/src` (e.g. base layout, header, navigation).
- Public meta in `apps/web/index.html` — title, description, Open Graph, Twitter card.
- Static assets under `apps/web/public/` — favicons, app icons.
- Brand assets under [`docs/screenshots/`](./screenshots) and [`docs/branding/`](./branding), including `infamousfreight-header.svg` and the generated social preview.
- Top-level [`README.md`](../README.md) header image (already references `docs/screenshots/infamousfreight-header.svg`).

Out of scope for Phase 1:

- New product features.
- API behavior changes.
- Billing / paywall logic.
- Database schema changes.

## Workstreams

### 1. Tokens

- [ ] Lock the brand palette (primary, secondary, accent, neutral, semantic).
- [ ] Lock typographic scale (display, heading, body, mono).
- [ ] Express both as Tailwind theme extensions in `apps/web/tailwind.config.*`.
- [ ] Document tokens briefly in [`branding/README.md`](./branding/README.md) (or a token table inline).

### 2. App shell

- [ ] Header / nav uses the locked logo and palette.
- [ ] Buttons, form controls, and table styles inherit the new tokens (no one-off hex values).
- [ ] Dark mode (if supported) updated alongside light mode.
- [ ] Verify the `/settings` billing panel still renders correctly with the new palette (`apps/web/src/components/billing/BillingSettingsPanel.tsx`).

### 3. Public meta & assets

- [ ] `apps/web/index.html` — `<title>`, `<meta name="description">`, Open Graph, Twitter card.
- [ ] Favicons / app icons under `apps/web/public/`.
- [ ] Regenerate `.github/social-preview.png` from `docs/screenshots/infamousfreight-header.svg` via `pnpm run social-preview:generate` (see [`branding/README.md`](./branding/README.md)).
- [ ] Re-upload the social preview via **Repo Settings → General → Social preview** (committing the file alone does not update GitHub's OG image).

### 4. Documentation alignment

- [ ] `README.md` header image renders correctly.
- [ ] Screenshots under [`docs/screenshots/`](./screenshots) reflect the new look (or are clearly marked as historical).

## Validation

Standard validation gate before opening a PR:

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm -C apps/web exec tsc -p tsconfig.json --noEmit
pnpm -C apps/web run test
```

Manual checks:

- [ ] `pnpm -C apps/web run dev` — visually inspect header, nav, key pages.
- [ ] `pnpm run build:web` produces `apps/web/dist` with no warnings related to assets.
- [ ] After deploy, confirm `https://www.infamousfreight.com` reflects the new branding and the apex / `*.netlify.app` 301s still resolve there (per [`netlify.toml`](../netlify.toml)).

## Guardrails

- Don't change `netlify.toml` redirects or `fly.toml` port config as part of branding work.
- Don't introduce new dependencies for styling without justification — Tailwind is already present.
- Don't commit raw design files containing customer or financial data.

## Exit criteria

Phase 1 is done when:

1. The locked palette, typography, and logo treatment are applied across `apps/web`.
2. Public meta and favicons match.
3. Social preview is regenerated, committed, and uploaded in repo settings.
4. Validation gate passes; smoke tests stay green.
5. [`next-action.md`](./next-action.md) is updated to point at Phase 2 (verify local setup).
