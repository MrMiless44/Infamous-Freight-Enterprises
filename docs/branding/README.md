# Branding & Preview Assets

Canonical brand and social preview assets for Infamous Freight Enterprise.

## Locked Brand Tokens

The Phase 1 web brand uses a field-operations palette: near-black command surfaces, slate panels, signal orange for primary actions, amber for priority highlights, and steel blue for live/status accents.

| Token | Value | Usage |
|------|-------|-------|
| `infamous.darker` | `#06080c` | Deep app shell background |
| `infamous.dark` | `#0b0f14` | Page background |
| `infamous.card` | `#121821` | Cards, sidebars, headers |
| `infamous.panel` | `#18212d` | Inputs and inset controls |
| `infamous.border` | `#263241` | Default borders |
| `infamous.border-light` | `#3a4a5f` | Hover and active borders |
| `infamous.orange` | `#f97316` | Primary actions and brand mark |
| `infamous.amber` | `#facc15` | Priority highlights |
| `infamous.steel` | `#38bdf8` | Live and operational status accents |
| `infamous.muted` | `#94a3b8` | Secondary text |

Typography is locked to `Sora` for display marks and high-emphasis headings, with `IBM Plex Sans` for body copy and operational UI.

| File | Purpose | Spec |
|------|---------|------|
| `.github/social-preview.png` | GitHub repo social / Open Graph preview | 1280×640 PNG, < 1 MB, sRGB |
| `apps/web/public/og-image.svg` | Runtime Open Graph source rendered through Netlify Image CDN | 1200×630 SVG |
| `apps/web/public/favicon.svg` | Browser and app icon source | SVG |

## Updating the social preview

1. Edit the design source (Figma — link TBD).
2. Export at **1280×640**, sRGB, PNG-24.
3. Optimize:
   ```bash
   oxipng -o 4 --strip safe .github/social-preview.png
   ```
4. Upload via **Repo Settings → General → Social preview** (committing alone is insufficient).
5. Commit the optimized PNG to `.github/social-preview.png` as the source of truth.

> **Note:** Committing the file to `.github/social-preview.png` does **not** automatically make GitHub use it as the Open Graph image. You must also upload it via **Repo Settings → General → Social preview**.

## Generating the PNG from the SVG source

The PNG is generated from `docs/screenshots/infamousfreight-header.svg` using the script at `scripts/generate-social-preview.mjs`:

```bash
pnpm run social-preview:generate
```

After generating, optimize and re-upload as described above.

## GitHub spec

- **Dimensions:** 1280×640 px (1.91:1 ratio)
- **Max file size:** < 1 MB (target < 300 KB after lossless compression)
- **Format:** PNG, JPG, or GIF
- **Color profile:** sRGB (avoid Display P3 — some scrapers mis-render wide gamut)

## Design guidelines

- Keep critical content within the center **1200×600 safe zone**.
- Minimum **32 px** font size.
- **High contrast** (WCAG AA minimum).
- Avoid UI screenshots — they don't read at thumbnail size.
