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
  it('keeps analytics domains allowed in root netlify config', () => {
    const rootContent = read(rootNetlify);

    for (const host of REQUIRED_ANALYTICS_HOSTS) {
      expect(rootContent).toContain(host);
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

describe('Netlify production routing', () => {
  const repoRoot = path.resolve(__dirname, '../../..');
  const rootNetlify = path.join(repoRoot, 'netlify.toml');
  const publicRedirects = path.join(repoRoot, 'apps/web/public/_redirects');

  function indexOf(content: string, pattern: string): number {
    const index = content.indexOf(pattern);
    expect(index).toBeGreaterThanOrEqual(0);
    return index;
  }

  it('keeps the browser-critical API proxy ahead of the SPA fallback in netlify.toml', () => {
    const rootContent = read(rootNetlify);

    const healthProxy = indexOf(rootContent, 'from = "/api/health"');
    const loadRequestsProxy = indexOf(rootContent, 'from = "/api/load-requests"');
    const quoteRequestsProxy = indexOf(rootContent, 'from = "/api/public/quote-requests"');
    const shipmentLookupProxy = indexOf(rootContent, 'from = "/api/public/shipments/:trackingNumber"');
    const apiProxy = indexOf(rootContent, 'from = "/api/*"');
    const socketProxy = indexOf(rootContent, 'from = "/socket.io/*"');
    const spaFallback = indexOf(rootContent, 'from = "/*"');

    expect(healthProxy).toBeLessThan(apiProxy);
    expect(loadRequestsProxy).toBeLessThan(apiProxy);
    expect(quoteRequestsProxy).toBeLessThan(apiProxy);
    expect(shipmentLookupProxy).toBeLessThan(apiProxy);
    expect(apiProxy).toBeLessThan(spaFallback);
    expect(socketProxy).toBeLessThan(spaFallback);
    expect(rootContent).toContain('to = "https://infamous-freight-api.fly.dev/api/health"');
    expect(rootContent).toContain('to = "https://infamous-freight-api.fly.dev/api/load-requests"');
    expect(rootContent).toContain('to = "https://infamous-freight-api.fly.dev/api/public/quote-requests"');
    expect(rootContent).toContain('to = "https://infamous-freight-api.fly.dev/api/public/shipments/:trackingNumber"');
    expect(rootContent).toContain('to = "https://infamous-freight-api.fly.dev/api/:splat"');
    expect(rootContent).toContain('to = "https://infamous-freight-api.fly.dev/socket.io/:splat"');
    expect(rootContent).toContain('from = "/api/*"\n  to = "https://infamous-freight-api.fly.dev/api/:splat"\n  status = 200\n  force = true');
    expect(rootContent).toContain('from = "/socket.io/*"\n  to = "https://infamous-freight-api.fly.dev/socket.io/:splat"\n  status = 200\n  force = true');
  });

  it('keeps repo-owned Netlify functions out of normal Git deploys', () => {
    const rootContent = read(rootNetlify);

    expect(rootContent).toContain('[build]');
    expect(rootContent).toContain('functions = "netlify/disabled-functions"');
  });

  it('keeps public Netlify function entrypoints present for deploy packaging', () => {
    const loadRequestsContent = read(path.join(repoRoot, 'netlify/functions/load-requests.ts'));
    const publicFreightContent = read(path.join(repoRoot, 'netlify/functions/public-freight.ts'));

    expect(fs.existsSync(path.join(repoRoot, 'netlify/functions/public-freight.ts'))).toBe(true);
    expect(fs.existsSync(path.join(repoRoot, 'netlify/functions/load-requests.ts'))).toBe(true);
    expect(loadRequestsContent).toContain("path: ['/api/load-requests', '/api/load-requests/:id']");
    expect(publicFreightContent).toContain("path: ['/api/public/quote-requests', '/api/public/shipments/:trackingNumber']");
  });

  it('keeps generated public redirect rules aligned with the Netlify API proxies', () => {
    const redirectContent = read(publicRedirects);

    const healthProxy = indexOf(redirectContent, '/api/health https://infamous-freight-api.fly.dev/api/health 200!');
    const loadRequestsProxy = indexOf(redirectContent, '/api/load-requests https://infamous-freight-api.fly.dev/api/load-requests 200!');
    const quoteRequestsProxy = indexOf(redirectContent, '/api/public/quote-requests https://infamous-freight-api.fly.dev/api/public/quote-requests 200!');
    const shipmentLookupProxy = indexOf(redirectContent, '/api/public/shipments/:trackingNumber https://infamous-freight-api.fly.dev/api/public/shipments/:trackingNumber 200!');
    const apiProxy = indexOf(redirectContent, '/api/* https://infamous-freight-api.fly.dev/api/:splat 200!');
    const socketProxy = indexOf(redirectContent, '/socket.io/* https://infamous-freight-api.fly.dev/socket.io/:splat 200!');
    const spaFallback = indexOf(redirectContent, '/*    /index.html   200');

    expect(healthProxy).toBeLessThan(apiProxy);
    expect(loadRequestsProxy).toBeLessThan(apiProxy);
    expect(quoteRequestsProxy).toBeLessThan(apiProxy);
    expect(shipmentLookupProxy).toBeLessThan(apiProxy);
    expect(apiProxy).toBeLessThan(spaFallback);
    expect(socketProxy).toBeLessThan(spaFallback);
  });

  it('keeps CLI production deploys from uploading repo-owned Netlify functions', () => {
    const script = read(path.join(repoRoot, 'scripts/netlify-production-readiness.sh'));

    expect(script).toContain('netlify-cli deploy --prod --dir apps/web/dist --functions netlify/disabled-functions');
  });

  it('keeps public Fly API route checks in production readiness automation', () => {
    const script = read(path.join(repoRoot, 'scripts/netlify-production-readiness.sh'));

    expect(script).toContain('PUBLIC_QUOTE_PREFLIGHT_URL="${PUBLIC_QUOTE_PREFLIGHT_URL:-https://www.infamousfreight.com/api/public/quote-requests}"');
    expect(script).toContain('PUBLIC_INVALID_SHIPMENT_URL="${PUBLIC_INVALID_SHIPMENT_URL:-https://www.infamousfreight.com/api/public/shipments/invalid-tracking}"');
    expect(script).toContain('run_step "Public quote API preflight check" curl_options "$PUBLIC_QUOTE_PREFLIGHT_URL"');
    expect(script).toContain('run_step "Public invalid shipment lookup check" curl_expect_status 400 "$PUBLIC_INVALID_SHIPMENT_URL"');
    expect(script).not.toContain('.netlify/functions/public-freight');
  });
});
