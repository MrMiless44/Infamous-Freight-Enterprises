import fs from 'fs';
import path from 'path';

describe('fly reconcile single image script', () => {
  const scriptPath = path.resolve(__dirname, '../../../scripts/fly-reconcile-single-image.sh');

  it('exists and is executable shell script content', () => {
    const content = fs.readFileSync(scriptPath, 'utf8');

    expect(content.startsWith('#!/usr/bin/env bash')).toBe(true);
    expect(content).toContain('set -euo pipefail');
  });

  it('includes reconciliation and prune safety controls', () => {
    const content = fs.readFileSync(scriptPath, 'utf8');

    expect(content).toContain('PRUNE_OLD_IMAGES="${PRUNE_OLD_IMAGES:-false}"');
    expect(content).toContain('refusing to prune $prune_count machines');
    expect(content).toContain('FORCE_PRUNE="${FORCE_PRUNE:-false}"');
    expect(content).toContain('PRUNE_MAX_COUNT="${PRUNE_MAX_COUNT:-3}"');
    expect(content).toContain('flyctl machine list -a "$APP_NAME" --json');
    expect(content).toContain('uniqueImageCount');
    expect(content).toContain('WARN: $APP_NAME currently has $unique_image_count deployed images across machines.');
    expect(content).toContain('Selected image to keep: $target_image');
    expect(content).toContain('PRUNE_OLD_IMAGES=true APP_NAME=$APP_NAME KEEP_IMAGE=$target_image bash scripts/fly-reconcile-single-image.sh');
    expect(content).toContain('flyctl machine destroy "$machine_id" -a "$APP_NAME" --force');
    expect(content).toContain("printf '%s' \"$summary\" | KEEP_IMAGE=\"$target_image\" node -e '");
  });
});
