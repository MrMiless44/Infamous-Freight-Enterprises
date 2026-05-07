import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_ANALYTICS_HOSTS = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://stats.g.doubleclick.net',
] as const;

function read(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

describe('Netlify CSP policy', () => {
  const repoRoot = path.resolve(__dirname, '../../..');
  const rootNetlify = path.join(repoRoot, 'netlify.toml');
  const webNetlify = path.join(repoRoot, 'apps/web/netlify.toml');

  it('keeps analytics domains allowed in root and web netlify config', () => {
    const rootContent = read(rootNetlify);
    const webContent = read(webNetlify);

    for (const host of REQUIRED_ANALYTICS_HOSTS) {
      expect(rootContent).toContain(host);
      expect(webContent).toContain(host);
    }
  });

  it('keeps strict worker policy globally in root netlify config', () => {
    const rootContent = read(rootNetlify);
    expect(rootContent).toContain("for = \"/*\"");
    expect(rootContent).toContain("worker-src 'none'");
    expect(rootContent).toContain("for = \"/driver-pwa/*\"");
    expect(rootContent).toContain("worker-src 'self'");
  });
});
