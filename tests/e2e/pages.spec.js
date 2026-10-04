const { test, expect, PAGES, noOverflow, seedCart } = require('./helpers');
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./helpers');

const URLS = {
  index: '/index.html', shop: '/shop.html', product: '/product.html?id=beef-brisket', cart: '/cart.html', checkout: '/checkout.html',
  confirmation: '/confirmation.html?ref=MOI-00000', orders: '/orders.html', admin: '/admin.html', about: '/about.html', kashrut: '/kashrut.html', contact: '/contact.html', '404': '/404.html',
};

for (const name of PAGES) {
  test(`${name}: renders, one h1, landmarks, no overflow, images load, no console errors`, async ({ page }) => {
    if (name === '404') page.__expect404 = false;
    await page.goto(URLS[name]);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveAttribute('lang', /en/);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main#main')).toHaveCount(1);
    await expect(page.locator('header.site-header')).toHaveCount(1);
    await expect(page.locator('footer.site-footer')).toHaveCount(1);
    await expect(page.locator('.skip-link')).toHaveCount(1);
    expect((await page.title()).length).toBeGreaterThan(8);
    await expect(page.locator('.demo-note')).toContainText(/demo/i);
    await expect(page.locator('.site-header .bsd')).toHaveText('בס״ד');
    await noOverflow(page);
    // Scroll to trigger lazy images, then every <img> must have decoded
    await page.evaluate(async () => {
      for (const img of document.images) {
        img.scrollIntoView({ block: 'center' });
        if (!img.complete) await Promise.race([new Promise((r) => { img.addEventListener('load', r); img.addEventListener('error', r); }), new Promise((r) => setTimeout(r, 4000))]);
      }
      window.scrollTo(0, 0);
    });
    await expect.poll(() => page.evaluate(() => [...document.images].filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.src)), { message: 'broken images', timeout: 10000 }).toEqual([]);
    // every image has an alt attribute (decorative = empty)
    expect(await page.evaluate(() => [...document.images].filter((i) => !i.hasAttribute('alt')).map((i) => i.src))).toEqual([]);
    // every svg <use> sprite reference resolves
    const bad = await page.evaluate(async () => {
      const txt = await (await fetch('assets/icons.svg')).text();
      return [...document.querySelectorAll('svg use')].map((u) => (u.getAttribute('href') || '').split('#')[1]).filter((id) => id && !txt.includes('id="' + id + '"'));
    });
    expect(bad, 'missing sprite symbols').toEqual([]);
    await noOverflow(page);
  });
}

test('home: hero, categories, featured products, FAQ, hours bound from config', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('.hero__title')).toContainText('kosher meat');
  await expect(page.locator('.cat-grid li')).toHaveCount(9);
  expect(await page.locator('[data-bind=featured] .product-card').count()).toBeGreaterThanOrEqual(4);
  expect(await page.locator('.faq details, .faq__item').count()).toBeGreaterThanOrEqual(4);
  await expect(page.getByText('3 Birt Street').first()).toBeVisible();
  await expect(page.locator('[data-text="kashrut.statement"]')).toContainText('fleishig');
  await expect(page.locator('[data-link=wa]')).toHaveAttribute('href', /^https:\/\/wa\.me\/27114854513/);
});

test('home: category tile navigates to filtered shop', async ({ page }) => {
  await page.goto('/index.html');
  await page.locator('.cat-grid a').filter({ hasText: 'Lamb' }).first().click();
  await expect(page).toHaveURL(/shop\.html\?cat=lamb/);
  await expect(page.locator('#shop-title')).toHaveText('Lamb');
});

test('mobile menu opens, links work and Escape closes', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  await page.goto('/index.html');
  const toggle = page.locator('.nav-toggle');
  await expect(toggle).toBeVisible();
  await expect(page.locator('nav.nav')).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#mobile-menu a', { hasText: 'Kashrut' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.locator('#mobile-menu a', { hasText: 'About' }).click();
  await expect(page).toHaveURL(/about\.html/);
});

test('desktop nav visible and current page marked', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop only');
  await page.goto('/kashrut.html');
  await expect(page.locator('nav.nav a[aria-current=page]')).toHaveText('Kashrut');
  await expect(page.locator('.nav-toggle')).toBeHidden();
});

test('404 page offers a way home', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.locator('h1')).toContainText(/could not find/i);
  await expect(page.locator('main a.btn').first()).toBeVisible();
});

test('unknown product / order show friendly messages', async ({ page }) => {
  await page.goto('/product.html?id=does-not-exist');
  await expect(page.locator('h1')).toContainText(/could not find/i);
  await page.goto('/confirmation.html?ref=MOI-99999');
  await expect(page.locator('h1')).toContainText(/could not find/i);
});

test('about / kashrut / contact content', async ({ page }) => {
  await page.goto('/about.html');
  await expect(page.locator('main')).toContainText(/Sunday|Monday/);
  await expect(page.locator('main')).toContainText(/Shabbos/);
  await page.goto('/kashrut.html');
  await expect(page.locator('main')).toContainText(/shechita/i);
  await expect(page.locator('main')).toContainText(/demo/i);
  await page.goto('/contact.html');
  await expect(page.locator('a[href^="tel:"]').first()).toBeVisible();
  await expect(page.locator('main a[href*="wa.me"]').first()).toBeVisible();
});

test('Shabbos banner reflects time (Thursday 13:00 countdown, Saturday closed)', async ({ page }) => {
  const { freeze, T } = require('./helpers');
  await freeze(page, T.thu1300);
  await page.goto('/index.html');
  await expect(page.locator('.announce').first()).toContainText('Thursday 14:00');
  await expect(page.locator('.announce').first()).toContainText(/1h 0m left/);
  await freeze(page, T.thu1500); await page.reload();
  await expect(page.locator('.announce').first()).toContainText(/cut-off has passed/i);
  await freeze(page, T.sat1000); await page.reload();
  await expect(page.locator('.announce').first()).toContainText(/Shabbat Shalom/);
  await expect(page.locator('.announce--closed')).toBeVisible();
  await freeze(page, '2027-04-22T08:00:00Z'); await page.reload();
  await expect(page.locator('.announce').first()).toContainText(/Chag Sameach/);
  await expect(page.locator('.announce .he')).toHaveAttribute('dir', 'rtl');
});
