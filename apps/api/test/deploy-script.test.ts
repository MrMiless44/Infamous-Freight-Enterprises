import path from 'path';
import { spawnSync } from 'child_process';

describe('root deploy script', () => {
  const scriptPath = path.resolve(__dirname, '../../../deploy.sh');

  const runValidation = (imageRef: string, expectedApp?: string) => {
    const expectedArg = expectedApp ? ` "${expectedApp}"` : '';

    return spawnSync(
      'bash',
      ['-lc', `source "${scriptPath}"; validate_container_image_ref "${imageRef}"${expectedArg}`],
      { encoding: 'utf8' },
    );
  };

  it('rejects image refs with whitespace', () => {
    const result = runValidation('registry.fly.io/app:bad tag');

    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain('must not contain whitespace');
  });


  it('rejects non-Fly registry image refs', () => {
    const result = runValidation('ghcr.io/infamous-freight:deployment-123');

    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain('expected image in registry.fly.io');
  });

  it('rejects untagged image refs', () => {
    const result = runValidation('registry.fly.io/app');

    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain('expected a tagged image');
  });

  it('accepts digest image refs', () => {
    const result = runValidation('registry.fly.io/infamous-freight@sha256:abcdef123456');

    expect(result.status).toBe(0);
  });

  it('accepts tagged image refs', () => {
    const result = runValidation('registry.fly.io/infamous-freight:deployment-123');

    expect(result.status).toBe(0);
  });

  it('rejects image refs for the wrong app when expected app is provided', () => {
    const result = runValidation('registry.fly.io/another-app:deployment-123', 'infamous-freight');

    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain('app mismatch');
  });

  it('accepts image refs that match the expected app', () => {
    const result = runValidation('registry.fly.io/infamous-freight:deployment-123', 'infamous-freight');

    expect(result.status).toBe(0);
  });

});
