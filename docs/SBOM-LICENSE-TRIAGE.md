# Infamous Freight — SBOM License Triage Outcomes

This document records the license triage outcome for every package that appears
with a `NOASSERTION`, `UNKNOWN`, or missing `licenseConcluded` field in the repo
SPDX SBOM.

Outcomes are maintained according to §5 of `docs/SBOM-POLICY.md`.

---

## How to use this document

When `scripts/generate-sbom.sh` writes `sbom/license-unknowns.txt`, check each
entry against the table below.

| Column | Meaning |
|--------|---------|
| **Package** | npm package name and version range affected |
| **SBOM result** | What the raw SBOM emits (`NOASSERTION`, blank, etc.) |
| **Concluded license** | The license that applies based on source review |
| **Source** | Where the concluded license was verified |
| **Outcome** | `acceptable` / `needs-follow-up` / `remove` (see §5 of the policy) |
| **Notes** | Any context needed to understand the conclusion |

---

## Triaged entries

### Runtime dependencies

| Package | SBOM result | Concluded license | Source | Outcome | Notes |
|---------|-------------|-------------------|--------|---------|-------|
| `framer-motion` | `NOASSERTION` | MIT | [GitHub repo](https://github.com/framer/motion/blob/main/LICENSE.md) | acceptable | npm `license` field is `MIT`; SBOM tooling occasionally fails to conclude it from the bundled metadata |
| `@supabase/supabase-js` | `NOASSERTION` | MIT | [GitHub repo](https://github.com/supabase/supabase-js/blob/master/LICENSE) | acceptable | MIT — widely used, low risk |
| `@stripe/react-stripe-js` | `NOASSERTION` | MIT | [GitHub repo](https://github.com/stripe/react-stripe-js/blob/master/LICENSE) | acceptable | MIT |
| `@stripe/stripe-js` | `NOASSERTION` | MIT | [GitHub repo](https://github.com/stripe/stripe-js/blob/master/LICENSE) | acceptable | MIT |
| `recharts` | `NOASSERTION` | MIT | [GitHub repo](https://github.com/recharts/recharts/blob/master/LICENSE) | acceptable | MIT |
| `lucide-react` | `NOASSERTION` | ISC | [GitHub repo](https://github.com/lucide-icons/lucide/blob/main/LICENSE) | acceptable | ISC — permissive, low risk |
| `react-dropzone` | `NOASSERTION` | MIT | [GitHub repo](https://github.com/react-dropzone/react-dropzone/blob/master/LICENSE) | acceptable | MIT |

### Build / CI / development dependencies

| Package | SBOM result | Concluded license | Source | Outcome | Notes |
|---------|-------------|-------------------|--------|---------|-------|
| `@sentry/vite-plugin` | `NOASSERTION` | MIT | [GitHub repo](https://github.com/getsentry/sentry-javascript-bundler-plugins/blob/main/LICENSE) | acceptable | MIT — build-only, not shipped to users |
| `@vitejs/plugin-react` | `NOASSERTION` | MIT | [GitHub repo](https://github.com/vitejs/vite-plugin-react/blob/main/LICENSE) | acceptable | MIT — build-only |
| `autoprefixer` | `NOASSERTION` | MIT | [GitHub repo](https://github.com/postcss/autoprefixer/blob/main/LICENSE) | acceptable | MIT — build-only |
| `ts-jest` | `NOASSERTION` | MIT | [GitHub repo](https://github.com/kulshekhar/ts-jest/blob/main/LICENSE.md) | acceptable | MIT — test tooling |
| `tsx` | `NOASSERTION` | MIT | [GitHub repo](https://github.com/privatenumber/tsx/blob/master/LICENSE) | acceptable | MIT — dev server runner |

### URL-hosted / external provenance packages

These packages are installed from Netlify-hosted tarballs rather than the npm
registry. They are documented separately in `docs/NETLIFY-BUILDHOOKS.md`.

| Package | SBOM result | Concluded license | Source | Outcome | Notes |
|---------|-------------|-------------------|--------|---------|-------|
| `async-workloads-buildhooks` | `NOASSERTION` | Proprietary (Netlify) | `docs/NETLIFY-BUILDHOOKS.md` | acceptable | Historical Netlify generated integration package; not committed in current deploy input |
| `launchdarkly-buildhooks` | `NOASSERTION` | Proprietary (LaunchDarkly) | `docs/NETLIFY-BUILDHOOKS.md` | acceptable | Historical LaunchDarkly generated integration package; not committed in current deploy input |
| `prerender-buildhooks` | `NOASSERTION` | Proprietary (Netlify) | `docs/NETLIFY-BUILDHOOKS.md` | acceptable | Historical Netlify generated integration package; not committed in current deploy input |

---

## Entries with `needs-follow-up` outcome

None at the time of the April 23 2026 review.

---

## Review history

| Date | Reviewer | Notes |
|------|----------|-------|
| 2026-04-23 | Platform team | Initial triage against April 2026 SBOM review workbook. All entries concluded acceptable. No packages found requiring removal or active follow-up. |

---

## Related documents

- `docs/SBOM-POLICY.md` — §5 license triage rules
- `docs/NETLIFY-BUILDHOOKS.md` — URL-hosted package provenance detail
- `scripts/generate-sbom.sh` — SBOM generation and unknown-license extraction
