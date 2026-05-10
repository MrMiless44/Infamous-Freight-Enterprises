#!/usr/bin/env node
/**
 * generate-social-preview.mjs
 *
 * Renders docs/screenshots/infamousfreight-header.svg into a 1280×640 PNG
 * suitable for GitHub's "Social preview" setting (Settings → General → Social preview).
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

const INPUT_SVG = resolve(ROOT, 'docs/screenshots/infamousfreight-header.svg');
const OUTPUT_PNG = resolve(ROOT, '.github/social-preview.png');

const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 640;
const BACKGROUND = '#0B0B0F';

try {
  const svgData = readFileSync(INPUT_SVG, 'utf8');

  // Wrap the original SVG inside a fixed 1280×640 canvas so the output is
  // exactly the right size for GitHub's social preview.  The inner SVG uses
  // preserveAspectRatio="xMidYMid meet" to letterbox the artwork on the
  // brand-coloured background without cropping anything.
  const wrappedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TARGET_WIDTH}" height="${TARGET_HEIGHT}">
  <rect width="${TARGET_WIDTH}" height="${TARGET_HEIGHT}" fill="${BACKGROUND}"/>
  <svg viewBox="0 0 1400 788" width="${TARGET_WIDTH}" height="${TARGET_HEIGHT}" preserveAspectRatio="xMidYMid meet">
    ${svgData.replace(/<\?xml[^?>]*\?>/, '').replace(/<!DOCTYPE[^>]*>/, '')}
  </svg>
</svg>`;

  const resvg = new Resvg(wrappedSvg, {
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
