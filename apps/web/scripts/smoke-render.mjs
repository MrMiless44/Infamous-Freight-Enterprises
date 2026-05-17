import { chromium } from 'playwright';

const baseUrl = process.env.SITE_URL ?? process.env.TARGET_URL ?? 'https://www.infamousfreight.com';
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 20_000);
const routeList = (process.env.SMOKE_ROUTES ?? '/,/request-quote,/track-shipment,/services,/pricing,/contact')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean);

const loadingCopy = 'Loading freight command center';
const minimumTextLength = Number(process.env.SMOKE_MIN_TEXT_LENGTH ?? 120);

const toUrl = (route) => new URL(route, baseUrl).toString();

const fail = (message, details = []) => {
  console.error(`\nSmoke render failed: ${message}`);
  for (const detail of details) {
    console.error(`- ${detail}`);
  }
  process.exitCode = 1;
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1200 },
});

const consoleErrors = [];
const pageErrors = [];

page.on('console', (message) => {
  if (message.type() === 'error') {
    consoleErrors.push(message.text());
  }
});

page.on('pageerror', (error) => {
  pageErrors.push(error.message);
});

try {
  for (const route of routeList) {
    const url = toUrl(route);
    console.log(`Checking ${url}`);

    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: timeoutMs,
    });

    if (!response || !response.ok()) {
      fail(`Route did not return a successful response: ${route}`, [
        `HTTP status: ${response?.status() ?? 'no response'}`,
      ]);
      continue;
    }

    await page.waitForLoadState('networkidle', { timeout: timeoutMs }).catch(() => undefined);

    const bodyText = (await page.locator('body').innerText({ timeout: timeoutMs })).trim();
    const title = await page.title();

    if (bodyText.includes(loadingCopy)) {
      fail(`Route is still stuck on the app loading fallback: ${route}`, [`Title: ${title}`]);
      continue;
    }

    if (bodyText.length < minimumTextLength) {
      fail(`Route rendered too little visible content: ${route}`, [
        `Visible text length: ${bodyText.length}`,
        `Title: ${title}`,
      ]);
      continue;
    }
  }

  const fatalPageErrors = pageErrors.filter((message) => {
    const normalized = message.toLowerCase();
    return !normalized.includes('favicon') && !normalized.includes('manifest');
  });

  if (fatalPageErrors.length > 0) {
    fail('Browser reported uncaught page errors during smoke render', fatalPageErrors.slice(0, 10));
  }

  if (consoleErrors.length > 0) {
    console.warn(`\nSmoke render observed ${consoleErrors.length} console error(s); not failing because rendered content passed.`);
    for (const message of consoleErrors.slice(0, 10)) {
      console.warn(`- ${message}`);
    }
  }

  if (!process.exitCode) {
    console.log(`\nSmoke render passed for ${routeList.length} route(s) at ${baseUrl}`);
  }
} finally {
  await browser.close();
}
