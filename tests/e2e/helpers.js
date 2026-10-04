// Shared fixtures for the Moishes E2E suite.
const base = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const PAGES = ['index', 'shop', 'product', 'cart', 'checkout', 'confirmation', 'orders', 'admin', 'about', 'kashrut', 'contact', '404'];
const ROOT = path.join(__dirname, '../..');
const iso = (s) => new Date(s); // helper alias

// Key instants (SAST = UTC+2).  2026-11-05 is a Thursday.
const T = {
  thu1300: '2026-11-05T11:00:00Z', // Thursday 13:00 SAST
  thu1500: '2026-11-05T13:00:00Z', // Thursday 15:00 SAST (cut-off passed)
  mon0800: '2026-11-09T06:00:00Z', // Monday 08:00 SAST
  sat1000: '2026-11-07T08:00:00Z', // Saturday 10:00 SAST
  yt: '2027-04-20T08:00:00Z',      // Tue before Pesach 2027
};

const test = base.test.extend({
  // Fonts are external (Google): stub them so there is no network dependence and no console noise.
  context: async ({ context }, use) => {
    await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => {
      const u = route.request().url();
      if (/fonts\.googleapis\.com/.test(u)) return route.fulfill({ status: 200, contentType: 'text/css', body: '/* stub */' });
      if (/fonts\.gstatic\.com/.test(u)) return route.fulfill({ status: 200, contentType: 'font/woff2', body: '' });
      if (/wa\.me|whatsapp/.test(u)) return route.fulfill({ status: 200, contentType: 'text/html', body: '<title>wa</title>' });
      return route.abort();
    });
    await use(context);
  },
  // Auto guard: fails the test on console errors / page errors / failed local requests.
  guard: [async ({ page }, use) => {
    const problems = [];
    // QA_ALLOW_MISSING_PHOTOS=1: while photo assets are still being produced, tolerate 404s for assets/photos/* (the UI falls back to SVG art).
    const lenient = !!process.env.QA_ALLOW_MISSING_PHOTOS;
    let photo404 = 0;
    page.on('console', (m) => { if (m.type() !== 'error') return; if (lenient && /404/.test(m.text())) { return; } problems.push('console.error: ' + m.text()); });
    page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
    page.on('requestfailed', (r) => { if (/127\.0\.0\.1/.test(r.url()) && !/ERR_ABORTED/.test((r.failure() || {}).errorText || '')) problems.push('requestfailed: ' + r.url() + ' ' + (r.failure() || {}).errorText); });
    page.on('response', (r) => { if (lenient && /\/assets\/photos\//.test(r.url())) return; if (/127\.0\.0\.1/.test(r.url()) && r.status() >= 400 && !page.__expect404) problems.push('HTTP ' + r.status() + ': ' + r.url()); });
    await use(problems);
    base.expect(problems, 'console / network problems').toEqual([]);
  }, { auto: true }],
});
const expect = test.expect;

async function freeze(page, utc) { await page.clock.setFixedTime(new Date(utc)); }

async function seedStorage(page, data) {
  await page.goto('/index.html');
  await page.evaluate((d) => { for (const k of Object.keys(d)) localStorage.setItem(k, JSON.stringify(d[k])); }, data);
}
const seedCart = (page, lines) => seedStorage(page, { 'moishes.cart.v1': lines });

const noOverflow = async (page) => {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, bw: document.body.scrollWidth }));
  expect(r.sw, 'horizontal overflow').toBeLessThanOrEqual(r.cw);
  // The page must not actually scroll sideways either
  expect(await page.evaluate(() => { window.scrollTo(200, window.scrollY); const x = window.scrollX; window.scrollTo(0, window.scrollY); return x; }), 'scrollX after scrollTo').toBe(0);
};

// Fill the checkout form with valid data (delivery to Glenhazel by default)
async function fillDetails(page, o = {}) {
  await page.fill('#name', o.name || 'Dana Cohen');
  await page.fill('#phone', o.phone || '082 123 4567');
  if (o.email) await page.fill('#email', o.email);
  if (o.mode === 'collection') await page.check('input[name=fulfilment][value=collection]', { force: true });
  else {
    await page.fill('#street', o.street || '12 Example Road, Unit 4');
    await page.selectOption('#zone', o.zone || 'glenhazel');
  }
  await page.check('#agree');
}
const firstSlot = (page) => page.locator('input[name=slot]:not([disabled])').first();

module.exports = { test, expect, PAGES, ROOT, T, freeze, seedStorage, seedCart, noOverflow, fillDetails, firstSlot, iso };
