import fs from 'node:fs';
import path from 'node:path';

describe('ZAP baseline rules', () => {
  const repoRoot = path.resolve(__dirname, '../../..');
  const zapRules = path.join(repoRoot, '.zap/rules.tsv');
  const webIndexHtml = path.join(repoRoot, 'apps/web/index.html');

  it('marks modern web application detection as ignored informational finding', () => {
    const content = fs.readFileSync(zapRules, 'utf8');
    expect(content).toContain(
      '10109\tIGNORE\tModern Web Application identifies client-side routing behavior on the React SPA and is informational rather than a vulnerability. Owner: Security. Expiry: 2026-08-31. Ref: https://github.com/Infaemous-Freight/Infamous-freight/actions/runs/25553724629',
    );
  });

  it('does not include third-party font stylesheets in the web shell html', () => {
    const content = fs.readFileSync(webIndexHtml, 'utf8');
    expect(content).not.toContain('https://fonts.googleapis.com');
    expect(content).not.toContain('https://fonts.gstatic.com');
  });
});
