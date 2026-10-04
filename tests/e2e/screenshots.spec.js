// Visual review helper: screenshots every page at the project's viewport into tests/screenshots/<project>/ (gitignored).
// Not an assertion test: it exists so a human (or Claude) can LOOK at the pages. Run: npx playwright test screenshots.spec.js
const { test, expect, seedCart, seedStorage, freeze, T } = require('./helpers');
const path = require('path');
const fs = require('fs');
const OUT = path.join(__dirname, '../screenshots');

const ORDER = {
  ref: 'MOI-12345', createdAt: '2026-11-09T06:00:00.000Z', status: 'new', demo: true, customer: { name: 'Dana Cohen', phone: '082 123 4567', phoneE164: '+27821234567', email: 'd@example.com' },
  fulfilment: 'delivery', zoneId: 'glenhazel', zoneName: 'Glenhazel', address: '12 Example Road', instructions: '', slot: { date: '2026-11-10', value: '09:00-11:00', label: '09:00 - 11:00' },
  payment: { id: 'eft', label: 'EFT / Bank transfer' }, lines: [{ id: 'beef-brisket', name: 'Beef Brisket', unit: 'kg', qty: 2, price: 159.9, total: 319.8, kosher: 'Meat', art: 'brisket' }],
  totals: { subtotal: 319.8, deliveryFee: 0, total: 319.8, vat: 41.71 }, notes: '',
};
const SHOTS = [
  ['home', '/index.html'], ['shop', '/shop.html'], ['shop-beef', '/shop.html?cat=beef'], ['shop-bakery', '/shop.html?cat=bakery'], ['product', '/product.html?id=beef-brisket'], ['product-each', '/product.html?id=challah-plain'],
  ['cart', '/cart.html', 'cart'], ['checkout', '/checkout.html', 'cart'], ['confirmation', '/confirmation.html?ref=MOI-12345', 'order'], ['orders', '/orders.html', 'order'], ['admin', '/admin.html', 'order'],
  ['about', '/about.html'], ['kashrut', '/kashrut.html'], ['contact', '/contact.html'], ['404', '/404.html'],
];
for (const scheme of ['light', 'dark']) {
  test(`screenshots ${scheme}`, async ({ page }, info) => {
    test.setTimeout(120000);
    test.skip(!process.env.SHOTS, 'visual review helper: run with SHOTS=1');
    const dir = path.join(OUT, info.project.name + '-' + scheme); fs.mkdirSync(dir, { recursive: true });
    await page.emulateMedia({ colorScheme: scheme });
    await freeze(page, T.thu1300);
    await seedStorage(page, { 'moishes.cart.v1': [{ id: 'beef-brisket', qty: 2 }, { id: 'challah-plain', qty: 2 }, { id: 'chicken-soup-1l', qty: 1 }], 'moishes.orders.v1': [ORDER, Object.assign({}, ORDER, { ref: 'MOI-54321', status: 'packed', fulfilment: 'collection' })] });
    for (const [name, url] of SHOTS) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.evaluate(async () => { for (const i of document.images) { i.scrollIntoView(); if (!i.complete) await new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 2500); }); } window.scrollTo(0, 0); });
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.join(dir, name + '.png'), fullPage: true });
    }
    // interaction states
    await page.goto('/shop.html?cat=beef'); await page.locator('[data-add]').first().click();
    await page.locator('.cart-btn').click(); await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(dir, 'state-drawer.png') });
    await page.keyboard.press('Escape');
    await page.goto('/checkout.html');
    await page.locator('button[type=submit][form=checkout]').first().evaluate((b) => b.click());
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(dir, 'state-checkout-errors.png'), fullPage: true });
    await page.goto('/index.html');
    await freeze(page, T.sat1000); await page.reload(); await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(dir, 'state-shabbos-banner.png') });
    expect(true).toBe(true);
  });
}
