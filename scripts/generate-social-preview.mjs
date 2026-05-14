#!/usr/bin/env node
/**
 * generate-social-preview.mjs
 *
 * Renders the public Open Graph SVG into a 1200x630 PNG for social sharing
 * previews.
 *
 * Usage:
 *   npm run social-preview:generate
 *
 * Dev-dependency only: @resvg/resvg-js (pure Rust/JS, no headless browser).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const INPUT_SVG = resolve(ROOT, 'apps/web/public/og-image.svg');
const OUTPUT_PNG = resolve(ROOT, 'apps/web/public/og-image.png');

const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 630;

try {
  const svgData = readFileSync(INPUT_SVG, 'utf8');

  const resvg = new Resvg(svgData, {
    fitTo: { mode: 'width', value: TARGET_WIDTH },
  });

  const rendered = resvg.render();
  const png = rendered.asPng();

  writeFileSync(OUTPUT_PNG, png);

  console.log(
    `✅  Social preview PNG written to ${OUTPUT_PNG} ` +
      `(${rendered.width}×${rendered.height}px)`
  );
  process.exit(0);
} catch (err) {
  console.error('❌  Failed to generate social preview PNG:', err.message ?? err);
  process.exit(1);
}
