// Performance sanity (not Lighthouse): page weight, request count, lazy images, CLS-safe image sizing.
const { test, expect, PAGES } = require('./helpers');

const URLS = { index: '/index.html', shop: '/shop.html', product: '/product.html?id=beef-brisket', cart: '/cart.html', checkout: '/checkout.html', about: '/about.html' };
const BUDGET = { index: 1200, shop: 1500, product: 800, cart: 600, checkout: 600, about: 800 }; // KB of local (same-origin) bytes

for (const [name, url] of Object.entries(URLS)) {
  test(`page weight: ${name} is under ${BUDGET[name]} KB (same-origin, uncompressed) and has few requests`, async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'weights are viewport-independent enough; run once');
    let bytes = 0, n = 0; const big = [];
    page.on('response', async (r) => {
      if (!/127\.0\.0\.1/.test(r.url())) return;
      try { const b = (await r.body()).length; bytes += b; n++; if (b > 120 * 1024) big.push(`${r.url()} ${(b / 1024) | 0}KB`); } catch (e) { /* aborted */ }
    });
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    // scroll to the bottom so below-the-fold lazy images are included in the budget
    await page.evaluate(async () => { for (const i of document.images) i.scrollIntoView(); window.scrollTo(0, 0); });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    console.log(`[perf] ${name}: ${(bytes / 1024) | 0} KB in ${n} requests; large: ${big.join(', ') || 'none'}`);
    expect(bytes / 1024, name + ' weight').toBeLessThan(BUDGET[name]);
    expect(n, 'request count').toBeLessThan(90);
  });
}

test('shop: only the first screenful of product images loads eagerly; the rest are lazy', async ({ page }) => {
  await page.goto('/shop.html');
  const imgs = await page.locator('#product-grid img').evaluateAll((l) => l.map((i) => ({ lazy: i.loading === 'lazy', w: i.getAttribute('width'), h: i.getAttribute('height') })));
  expect(imgs.length).toBeGreaterThan(60);
  expect(imgs.every((i) => i.lazy), 'all product-grid imgs lazy').toBe(true);
  expect(imgs.every((i) => i.w && i.h), 'width/height attributes prevent layout shift').toBe(true);
  // Initial load must NOT have fetched all ~90 images
  const loaded = await page.evaluate(() => performance.getEntriesByType('resource').filter((r) => /assets\/(art|photos)\//.test(r.name)).length);
  expect(loaded, 'images requested on initial paint').toBeLessThan(45);
});

test('hero image on home is not lazy; below-fold images are', async ({ page }) => {
  await page.goto('/index.html');
  expect(await page.locator('.hero__art img').first().evaluate((i) => i.loading)).not.toBe('lazy');
  const below = await page.locator('[data-bind=featured] img').evaluateAll((l) => l.map((i) => i.loading));
  expect(below.length).toBeGreaterThan(0); expect(below.every((x) => x === 'lazy')).toBe(true);
});

test('scripts are deferred and total JS stays small', async ({ page }) => {
  await page.goto('/index.html');
  const sync = await page.evaluate(() => [...document.scripts].filter((s) => s.src && !s.defer && !s.async && !/ld\+json/.test(s.type)).map((s) => s.src));
  expect(sync, 'render-blocking scripts').toEqual([]);
  const js = await page.evaluate(async () => { let t = 0; for (const s of [...document.scripts].filter((x) => x.src)) t += (await (await fetch(s.src)).text()).length; return t; });
  console.log('[perf] home JS total KB:', (js / 1024) | 0);
  expect(js / 1024).toBeLessThan(200);
});

test('every page declares viewport, description and canonical-ish meta; CSS is small', async ({ page, request }) => {
  test.skip(test.info().project.name !== 'desktop', 'once');
  for (const f of ['tokens', 'base', 'components', 'pages', 'engineer']) {
    const t = await (await request.get(`/css/${f}.css`)).text();
    expect(t.length / 1024, f + '.css').toBeLessThan(80);
  }
  for (const n of PAGES) {
    const html = await (await request.get(`/${n === 'index' ? 'index' : n}.html`)).text();
    expect(html, n).toMatch(/<meta name="viewport"/);
    expect(html, n).toMatch(/<meta name="description"/);
  }
});

test('art SVGs are individually light (< 60 KB each)', async ({ request }) => {
  test.skip(test.info().project.name !== 'desktop', 'once');
  const fs = require('fs'), path = require('path');
  const dir = path.join(__dirname, '../../assets/art');
  for (const f of fs.readdirSync(dir)) expect(fs.statSync(path.join(dir, f)).size / 1024, f).toBeLessThan(60);
});
