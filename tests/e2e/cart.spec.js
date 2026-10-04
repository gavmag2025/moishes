const { test, expect, seedCart, noOverflow } = require('./helpers');

test('empty cart / checkout states', async ({ page }) => {
  await page.goto('/cart.html');
  await expect(page.locator('.empty__title')).toHaveText('Your basket is empty');
  await page.goto('/checkout.html');
  await expect(page.locator('#checkout-empty')).toBeVisible();
  await expect(page.locator('#checkout')).toBeHidden();
});

test('drawer: open from header, add/edit/remove with undo, close with Esc, focus returns', async ({ page }) => {
  await page.goto('/product.html?id=beef-brisket');
  await page.locator('#pdp-add').click();
  const btn = page.locator('.cart-btn');
  await btn.click();
  const drawer = page.locator('#cart-drawer');
  await expect(drawer).toHaveClass(/is-open/);
  await expect(drawer.locator('.cart-line')).toHaveCount(1);
  await expect(drawer.locator('.cart-line__total')).toHaveText('R159.90');
  await expect(drawer.locator('#drawer-foot')).toContainText('free delivery');
  // kg step 0.5
  await drawer.locator('.qty__btn[data-dir="1"]').click();
  await expect(drawer.locator('.qty__input')).toHaveValue('1.5');
  await expect(drawer.locator('.cart-line__total')).toHaveText('R239.85');
  await expect(drawer.locator('#drawer-foot .totals__row')).toContainText('R239.85');
  // typed qty rounds to step
  await drawer.locator('.qty__input').fill('2.2'); await drawer.locator('.qty__input').press('Enter'); await drawer.locator('.qty__input').blur();
  await expect(drawer.locator('.qty__input')).toHaveValue('2');
  // focus trapped in dialog
  for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
  expect(await page.evaluate(() => !!document.activeElement.closest('.drawer__panel'))).toBe(true);
  // remove and undo
  await drawer.locator('.cart-line__remove').click();
  await expect(drawer.locator('.empty')).toBeVisible();
  await page.locator('.toast__action').last().click();
  await expect(drawer.locator('.cart-line')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(drawer).not.toHaveClass(/is-open/);
  await expect(btn).toBeFocused();
  // overlay click closes
  await btn.click(); await expect(drawer).toHaveClass(/is-open/);
  await drawer.locator('.drawer__overlay').click({ position: { x: 5, y: 5 } });
  await expect(drawer).not.toHaveClass(/is-open/);
  await noOverflow(page);
});

test('cart page: edit qty (kg step), per-line total, remove, undo, empty basket', async ({ page }) => {
  await seedCart(page, [{ id: 'beef-brisket', qty: 2 }, { id: 'challah-plain', qty: 2 }]);
  await page.goto('/cart.html');
  const rows = page.locator('.cart-table tbody tr');
  await expect(rows).toHaveCount(2);
  const row = rows.filter({ hasText: 'Beef Brisket' });
  await expect(row).toContainText('R319.80');
  await row.locator('.qty__btn[data-dir="1"]').click();
  await expect(row.locator('.qty__input')).toHaveValue('2.5');
  await expect(row).toContainText('R399.75');
  await expect(page.locator('.summary .totals')).toContainText('R465.55'); // 399.75 + 65.80
  await expect(page.locator('.summary')).toContainText(/VAT/);
  await expect(page.locator('.summary')).toContainText('Choose suburb');
  await page.selectOption('#est-zone', 'sandringham');
  await expect(page.locator('.summary .totals')).toContainText('R50.00');
  await expect(page.locator('.summary .totals')).toContainText('R515.55');
  // free delivery message / min-order alert
  await page.locator('tr', { hasText: 'Beef Brisket' }).locator('.cart-line__remove').click();
  await expect(rows).toHaveCount(1);
  await expect(page.locator('.summary .alert--danger')).toContainText('minimum order of R350.00');
  await page.locator('.toast__action').last().click();
  await expect(rows).toHaveCount(2);
  await page.locator('#clear-cart').click();
  await expect(page.locator('.empty__title')).toBeVisible();
  await page.locator('.toast__action').last().click();
  await expect(rows).toHaveCount(2);
  await noOverflow(page);
});

test('cart persists across reload and across pages; invalid storage is ignored', async ({ page }) => {
  await page.goto('/product.html?id=beef-brisket');
  await page.locator('[data-local="1"]').click();
  await page.locator('#pdp-add').click();
  await page.reload();
  await expect(page.locator('.cart-btn__count')).toHaveText('1');
  await page.goto('/cart.html');
  await expect(page.locator('.cart-table .qty__input')).toHaveValue('1.5');
  // junk data
  await page.evaluate(() => localStorage.setItem('moishes.cart.v1', '{not json'));
  await page.reload();
  await expect(page.locator('.empty__title')).toBeVisible();
  await page.evaluate(() => localStorage.setItem('moishes.cart.v1', JSON.stringify([{ id: 'nope', qty: 3 }, { id: 'beef-brisket', qty: -2 }, { id: 'beef-brisket', qty: 1 }])));
  await page.reload();
  await expect(page.locator('.cart-table tbody tr')).toHaveCount(1);
});

test('cart synchronises between tabs', async ({ page, context }) => {
  await page.goto('/product.html?id=beef-brisket');
  await page.locator('#pdp-add').click();
  const p2 = await context.newPage();
  await p2.goto('/cart.html');
  await expect(p2.locator('.cart-table tbody tr')).toHaveCount(1);
});

test('free-delivery progress bar in drawer reaches qualifying state', async ({ page }) => {
  await seedCart(page, [{ id: 'beef-brisket', qty: 10 }]);
  await page.goto('/index.html');
  await page.locator('.cart-btn').click();
  await expect(page.locator('#drawer-foot .free-ship')).toContainText('You qualify for free delivery');
});
