# Branding & Preview Assets

Canonical brand and social preview assets for Infamous Freight Enterprise.

## Locked Brand Tokens

The web app uses an industrial command-center palette designed for dispatchers, drivers, and freight operators working in low-light field conditions. These values are mirrored in `apps/web/tailwind.config.js` and `apps/web/src/index.css`.

| Token | Value | Use |
|------|-------|-----|
| `infamous-orange` | `#f05a24` | Primary actions, active navigation, key freight status emphasis |
| `infamous-orange-light` | `#ff8a3d` | Hover states and warm gradients |
| `infamous-orange-dark` | `#b83a14` | Pressed states and high-contrast accents |
| `infamous-ember` | `#ffb45f` | Secondary highlight and social preview emphasis |
| `infamous-dark` / `infamous-ink` | `#11100f` | Primary app background |
| `infamous-darker` | `#070706` | Deep background and loading surfaces |
| `infamous-card` | `#191714` | Cards, sidebars, and persistent panels |
| `infamous-panel` | `#23201b` | Inputs and nested control surfaces |
| `infamous-border` | `#342f28` | Default borders and separators |
| `infamous-border-light` | `#4a4237` | Hover and focus-adjacent borders |
| `infamous-steel` | `#8fa3ad` | Muted labels and operational metadata |
| `infamous-cream` | `#f6efe4` | Primary text on dark backgrounds |
| `infamous-success` | `#3fbf7f` | Positive semantic states |
| `infamous-warning` | `#e8a23b` | Warning semantic states |
| `infamous-danger` | `#e05a47` | Error and destructive semantic states |

Typography is locked to `Sora` for the app UI, `Archivo Black` for compact display/logo moments, and `IBM Plex Mono` for IDs, amounts, and operational metadata. Use the Tailwind families `font-sans`, `font-display`, and `font-mono` instead of adding one-off font stacks.

| File | Purpose | Spec |
|------|---------|------|
| `.github/social-preview.png` | GitHub repo social / Open Graph preview | 1280×640 PNG, < 1 MB, sRGB |

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
