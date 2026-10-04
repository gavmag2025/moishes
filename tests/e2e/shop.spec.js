const { test, expect, seedCart, noOverflow } = require('./helpers');

const cards = (page) => page.locator('#product-grid .product-card');
const count = async (page) => parseInt((await page.locator('#count').textContent()), 10);

test('shop lists every product; count matches', async ({ page }) => {
  await page.goto('/shop.html');
  const total = await page.evaluate(() => window.MOISHES_PRODUCTS.length);
  await expect(cards(page)).toHaveCount(total);
  expect(await count(page)).toBe(total);
  await noOverflow(page);
});

test('browse category via chip, URL + title + kashrut note update', async ({ page }) => {
  await page.goto('/shop.html');
  await page.locator('#cat-chips .chip', { hasText: 'Lamb' }).click();
  await expect(page).toHaveURL(/cat=lamb/);
  await expect(page.locator('#shop-title')).toHaveText('Lamb');
  await expect(page.locator('#cat-note')).toBeVisible();
  const n = await page.evaluate(() => window.MOISHES_PRODUCTS.filter((p) => p.category === 'lamb').length);
  await expect(cards(page)).toHaveCount(n);
  await expect(page.locator('#cat-chips .chip[aria-pressed=true]')).toContainText('Lamb');
  await expect(page).toHaveTitle(/Lamb/);
});

test('deep link ?cat=bakery shows only pareve bakery', async ({ page }) => {
  await page.goto('/shop.html?cat=bakery');
  await expect(page.locator('#shop-title')).toHaveText(/Challah/);
  const badges = await cards(page).locator('.badge--pareve').count();
  expect(badges).toBe(await cards(page).count());
  await expect(cards(page).locator('.badge--meat')).toHaveCount(0);
});

test('search narrows, matches desc/tags, empty state + clear', async ({ page }) => {
  await page.goto('/shop.html');
  await page.fill('#q', 'brisket');
  await expect(page.locator('#count')).not.toHaveText(/^\d+ products$/, { timeout: 3000 }).catch(() => {});
  await expect.poll(() => count(page)).toBeLessThan(10);
  const titles = await cards(page).locator('.product-card__title').allTextContents();
  expect(titles.length).toBeGreaterThan(0);
  await expect(page).toHaveURL(/q=brisket/);
  await page.fill('#q', 'zzzzqq');
  await expect(page.locator('.shop__empty')).toContainText('Nothing matches');
  await page.locator('#clear-filters').click();
  await expect(page.locator('#q')).toHaveValue('');
  expect(await count(page)).toBeGreaterThan(60);
});

test('search for dairy terms finds nothing (no dairy sold)', async ({ page }) => {
  for (const q of ['cheese', 'milk', 'butter', 'yoghurt']) {
    await page.goto('/shop.html?q=' + q);
    await expect(page.locator('.shop__empty'), q).toBeVisible();
  }
});

test('sort: price asc / desc / name', async ({ page }) => {
  await page.goto('/shop.html');
  const prices = async () => (await cards(page).locator('.price').allTextContents()).map((t) => parseFloat(t.replace(/[^\d.]/g, '')));
  await page.selectOption('#sort', 'price-asc');
  let p = await prices(); expect(p).toEqual([...p].sort((a, b) => a - b));
  await page.selectOption('#sort', 'price-desc');
  p = await prices(); expect(p).toEqual([...p].sort((a, b) => b - a));
  await page.selectOption('#sort', 'name-asc');
  const n = await cards(page).locator('.product-card__title').allTextContents();
  expect(n).toEqual([...n].sort((a, b) => a.localeCompare(b)));
  await expect(page).toHaveURL(/sort=name-asc/);
  await page.reload();
  await expect(page.locator('#sort')).toHaveValue('name-asc');
});

test('filters: Meat / Pareve / tag chips combine with category', async ({ page }) => {
  await page.goto('/shop.html');
  await page.locator('#kosher-chips .chip', { hasText: 'Pareve' }).click();
  await expect(cards(page).locator('.badge--meat')).toHaveCount(0);
  const nP = await count(page); expect(nP).toBeGreaterThan(5);
  await page.locator('#kosher-chips .chip', { hasText: 'Meat' }).click();
  await expect(cards(page).locator('.badge--pareve')).toHaveCount(0);
  await page.locator('#kosher-chips .chip', { hasText: 'Any' }).click();
  await page.locator('#tag-chips .chip', { hasText: 'Braai' }).click();
  const names = await cards(page).count(); expect(names).toBeGreaterThan(3);
  expect(names).toBeLessThan(await page.evaluate(() => window.MOISHES_PRODUCTS.length));
  await page.locator('#cat-chips .chip', { hasText: 'Beef' }).click();
  await expect(page).toHaveURL(/cat=beef/); await expect(page).toHaveURL(/tag=Braai/);
  // filter state restored from URL
  await page.reload();
  await expect(page.locator('#tag-chips .chip[aria-pressed=true]')).toHaveText('Braai');
});

test('shop product card: add -> stepper, then back to zero returns Add button', async ({ page }) => {
  await page.goto('/shop.html?cat=beef');
  const card = cards(page).first();
  await card.locator('[data-add]').click();
  await expect(card.locator('.qty__input')).toHaveValue('0.5');
  await expect(page.locator('.cart-btn__count')).toHaveText('1');
  await card.locator('.qty__btn[data-dir="-1"]').click();
  await expect(card.locator('[data-add]')).toBeVisible();
  await expect(page.locator('.cart-btn__count')).toHaveText('0');
});

test('product page: details, kashrut, related, add kg item with step, total update', async ({ page }) => {
  await page.goto('/shop.html');
  await cards(page).filter({ hasText: 'Beef Brisket' }).first().locator('.product-card__title a').click();
  await expect(page).toHaveURL(/product\.html\?id=beef-brisket/);
  await expect(page.locator('h1')).toHaveText('Beef Brisket');
  await expect(page.locator('.pdp__price')).toContainText('R159.90');
  await expect(page.locator('.info-card')).toContainText('Meat (fleishig)');
  await expect(page.locator('#pdp-q')).toHaveValue('1');
  await page.locator('[data-local="1"]').click();
  await expect(page.locator('#pdp-q')).toHaveValue('1.5');
  await expect(page.locator('#pdp-total')).toContainText('R239.85');
  await page.locator('[data-local="-1"]').click(); await page.locator('[data-local="-1"]').click();
  await expect(page.locator('#pdp-q')).toHaveValue('0.5');
  await expect(page.locator('[data-local="-1"]')).toBeDisabled();
  await page.fill('#pdp-q', '2.3'); await page.locator('#pdp-q').blur();
  await expect(page.locator('#pdp-q')).toHaveValue('2.5');
  await page.locator('#pdp-add').click();
  await expect(page.locator('.cart-btn__count')).toHaveText('1');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('moishes.cart.v1')))).toEqual([{ id: 'beef-brisket', qty: 2.5 }]);
  await expect(page.locator('.toast')).toContainText('added');
  await expect(page.locator('#related-grid .product-card').first()).toBeVisible();
  expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThan(0);
  await expect(page).toHaveTitle(/Beef Brisket/);
});

test('product page: unit "each" step is 1', async ({ page }) => {
  await page.goto('/product.html?id=challah-plain');
  await expect(page.locator('#pdp-q')).toHaveValue('1');
  await expect(page.locator('.qty__unit')).toHaveCount(0);
  await page.locator('[data-local="1"]').click();
  await expect(page.locator('#pdp-q')).toHaveValue('2');
  await expect(page.locator('.info-card')).toContainText('Pareve');
  await page.fill('#pdp-q', '1000'); await page.locator('#pdp-q').blur();
  await expect(page.locator('#pdp-q')).toHaveValue('99');
});

test('all product pages render without errors (smoke over entire catalogue)', async ({ page }) => {
  test.setTimeout(120000);
  const ids = await (async () => { await page.goto('/index.html'); return page.evaluate(() => window.MOISHES_PRODUCTS.map((p) => p.id)); })();
  for (const id of ids) {
    await page.goto('/product.html?id=' + id);
    await expect(page.locator('h1.pdp__title'), id).toBeVisible();
    await expect(page.locator('.pdp__media img')).toBeVisible();
  }
});

test('Pesach mode shows only pesach products everywhere', async ({ page }) => {
  await page.route('**/data/config.js', async (route) => {
    const r = await route.fetch(); const b = (await r.text()).replace('pesach: false', 'pesach: true');
    await route.fulfill({ response: r, body: b });
  });
  await page.goto('/shop.html');
  const exp = await page.evaluate(() => window.MOISHES_PRODUCTS.filter((p) => p.pesach).length);
  expect(exp).toBeGreaterThan(10);
  await expect(cards(page)).toHaveCount(exp);
  await expect(page.locator('#pesach-note')).toBeVisible();
  await expect(page.locator('.announce', { hasText: 'Pesach mode' })).toBeVisible();
  // bakery category disappears
  await expect(page.locator('#cat-chips .chip', { hasText: 'Challah' })).toHaveCount(0);
  await page.goto('/shop.html?q=challah');
  await expect(page.locator('.shop__empty')).toBeVisible();
  // product page for chametz blocked
  await page.goto('/product.html?id=challah-plain');
  await expect(page.locator('#pdp-add')).toBeDisabled();
  await expect(page.locator('.alert')).toContainText('Pesach mode');
  // can't be added from storage either: cart line ignored
  await seedCart(page, [{ id: 'challah-plain', qty: 2 }, { id: 'beef-brisket', qty: 1 }]);
  await page.goto('/cart.html');
  await expect(page.locator('.cart-table tbody tr')).toHaveCount(1);
  await page.goto('/index.html');
  await expect(page.locator('[data-bind=featured] .product-card').first()).toBeVisible();
  const home = await page.locator('[data-bind=featured] .product-card .product-card__title').allTextContents();
  const nonPesach = await page.evaluate(() => window.MOISHES_PRODUCTS.filter((p) => !p.pesach).map((p) => p.name));
  for (const n of home) expect(nonPesach).not.toContain(n);
});
