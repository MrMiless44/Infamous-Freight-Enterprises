import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

describe('fly reconcile single image script behavior', () => {
  const scriptPath = path.resolve(__dirname, '../../../scripts/fly-reconcile-single-image.sh');

  it('does not prune by default and prints remediation command when multiple images exist', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fly-reconcile-'));
    const mockFlyctl = path.join(tempDir, 'flyctl');

    fs.writeFileSync(
      mockFlyctl,
      `#!/usr/bin/env bash
set -euo pipefail
if [[ "$1" == "auth" && "$2" == "whoami" ]]; then
  echo "mock-user"
  exit 0
fi
if [[ "$1" == "machine" && "$2" == "list" ]]; then
  cat <<'JSON'
[
  {"id":"m1","config":{"image":"registry.fly.io/infamous-freight:deployment-old"},"created_at":"2026-05-01T00:00:00Z"},
  {"id":"m2","config":{"image":"registry.fly.io/infamous-freight:deployment-new"},"created_at":"2026-05-02T00:00:00Z"}
]
JSON
  exit 0
fi
if [[ "$1" == "machine" && "$2" == "destroy" ]]; then
  echo "unexpected destroy" >&2
  exit 99
fi
`,
      { mode: 0o755 },
    );

    const result = spawnSync('bash', [scriptPath], {
      env: {
        ...process.env,
        PATH: `${tempDir}:${process.env.PATH ?? ''}`,
        FLY_API_TOKEN: 'test-token',
        APP_NAME: 'infamous-freight',
      },
      encoding: 'utf8',
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('WARN: infamous-freight currently has 2 deployed images across machines.');
    expect(result.stdout).toContain('PRUNE_OLD_IMAGES=true APP_NAME=infamous-freight KEEP_IMAGE=registry.fly.io/infamous-freight:deployment-new bash scripts/fly-reconcile-single-image.sh');
    expect(result.stderr).not.toContain('unexpected destroy');
  });

  it('refuses large prune sets unless FORCE_PRUNE=true', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fly-reconcile-prune-'));
    const mockFlyctl = path.join(tempDir, 'flyctl');

    fs.writeFileSync(
      mockFlyctl,
      `#!/usr/bin/env bash
set -euo pipefail
if [[ "$1" == "auth" && "$2" == "whoami" ]]; then
  exit 0
fi
if [[ "$1" == "machine" && "$2" == "list" ]]; then
  cat <<'JSON'
[
  {"id":"m1","config":{"image":"registry.fly.io/infamous-freight:deployment-old"},"created_at":"2026-05-01T00:00:00Z"},
  {"id":"m2","config":{"image":"registry.fly.io/infamous-freight:deployment-old"},"created_at":"2026-05-01T00:00:00Z"},
  {"id":"m3","config":{"image":"registry.fly.io/infamous-freight:deployment-old"},"created_at":"2026-05-01T00:00:00Z"},
  {"id":"m4","config":{"image":"registry.fly.io/infamous-freight:deployment-new"},"created_at":"2026-05-02T00:00:00Z"}
]
JSON
  exit 0
fi
if [[ "$1" == "machine" && "$2" == "destroy" ]]; then
  echo "unexpected destroy" >&2
  exit 99
fi
`,
      { mode: 0o755 },
    );

    const result = spawnSync('bash', [scriptPath], {
      env: {
        ...process.env,
        PATH: `${tempDir}:${process.env.PATH ?? ''}`,
        FLY_API_TOKEN: 'test-token',
        APP_NAME: 'infamous-freight',
        PRUNE_OLD_IMAGES: 'true',
        PRUNE_MAX_COUNT: '2',
      },
      encoding: 'utf8',
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('refusing to prune 3 machines');
    expect(result.stderr).not.toContain('unexpected destroy');
  });
});
