const { test, expect, PAGES, seedCart, seedStorage, freeze, T, fillDetails } = require('./helpers');
const AxeBuilder = require('@axe-core/playwright').default;

const URLS = {
  index: '/index.html', shop: '/shop.html', product: '/product.html?id=beef-brisket', cart: '/cart.html', checkout: '/checkout.html',
  confirmation: '/confirmation.html?ref=MOI-12345', orders: '/orders.html', admin: '/admin.html', about: '/about.html', kashrut: '/kashrut.html', contact: '/contact.html', '404': '/404.html',
};
const ORDER = {
  ref: 'MOI-12345', createdAt: '2026-11-09T06:00:00.000Z', status: 'new', demo: true, customer: { name: 'Dana Cohen', phone: '082 123 4567', phoneE164: '+27821234567', email: 'd@example.com' },
  fulfilment: 'delivery', zoneId: 'glenhazel', zoneName: 'Glenhazel', address: '12 Example Road', instructions: '', slot: { date: '2026-11-10', value: '09:00-11:00', label: '09:00 - 11:00' },
  payment: { id: 'eft', label: 'EFT / Bank transfer' }, lines: [{ id: 'beef-brisket', name: 'Beef Brisket', unit: 'kg', qty: 2, price: 159.9, total: 319.8, kosher: 'Meat', art: 'brisket' }],
  totals: { subtotal: 319.8, deliveryFee: 0, total: 319.8, vat: 41.71 }, notes: '',
};
async function prepare(page, name) {
  await freeze(page, T.mon0800);
  if (['cart', 'checkout'].includes(name)) await seedCart(page, [{ id: 'beef-brisket', qty: 2 }, { id: 'challah-plain', qty: 1 }]);
  if (['confirmation', 'orders', 'admin'].includes(name)) await seedStorage(page, { 'moishes.orders.v1': [ORDER, Object.assign({}, ORDER, { ref: 'MOI-54321', status: 'packed', fulfilment: 'collection' })] });
}
const fmt = (v) => v.map((x) => `${x.impact} ${x.id}: ${x.help}\n   ${x.nodes.slice(0, 4).map((n) => n.target.join(' ') + ' :: ' + (n.any[0] || n.all[0] || n.none[0] || {}).message).join('\n   ')}`).join('\n');

for (const scheme of ['light', 'dark']) {
  for (const name of PAGES) {
    test(`axe ${scheme}: ${name} has no serious/critical violations (wcag2a/aa/21aa + best-practice)`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await prepare(page, name);
      await page.goto(URLS[name]);
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => document.fonts && document.fonts.ready);
      const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze();
      const bad = res.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
      expect(bad, '\n' + fmt(bad)).toEqual([]);
      const minor = res.violations.filter((v) => !['serious', 'critical'].includes(v.impact));
      if (minor.length) console.log(`[axe ${scheme} ${name}] minor/moderate: ` + minor.map((v) => v.id).join(', '));
    });
  }
}

test('axe: states - open drawer, checkout errors, mobile menu (light + dark)', async ({ page, isMobile }) => {
  for (const scheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: scheme });
    await freeze(page, T.mon0800);
    await seedCart(page, [{ id: 'beef-brisket', qty: 2 }]);
    await page.goto('/checkout.html');
    await page.locator('button[type=submit][form=checkout]').first().evaluate((b) => b.click());
    await expect(page.locator('#error-summary')).toBeVisible();
    let res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    let bad = res.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
    expect(bad, 'checkout errors ' + scheme + '\n' + fmt(bad)).toEqual([]);
    await page.goto('/index.html');
    await page.locator('.cart-btn').click();
    await expect(page.locator('#cart-drawer')).toHaveClass(/is-open/);
    await page.waitForTimeout(400);
    res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    bad = res.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
    expect(bad, 'drawer ' + scheme + '\n' + fmt(bad)).toEqual([]);
    await page.keyboard.press('Escape');
    if (isMobile) {
      await page.locator('.nav-toggle').click(); await page.waitForTimeout(400);
      res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      bad = res.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
      expect(bad, 'menu ' + scheme + '\n' + fmt(bad)).toEqual([]);
    }
  }
});

test('keyboard-only: skip link, then complete a whole checkout without a mouse', async ({ page }) => {
  await freeze(page, T.mon0800);
  await seedCart(page, [{ id: 'beef-brisket', qty: 2 }]);
  await page.goto('/checkout.html');
  // skip link is first stop and works
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await expect(page.locator('.skip-link')).toBeVisible();
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => location.hash)).toBe('#main');

  async function tabTo(sel, max = 80) {
    for (let i = 0; i < max; i++) {
      await page.keyboard.press('Tab');
      if (await page.evaluate((s) => document.activeElement && document.activeElement.matches(s), sel)) return;
    }
    throw new Error('could not reach ' + sel + ' by Tab; active=' + await page.evaluate(() => document.activeElement.outerHTML.slice(0, 120)));
  }
  await page.focus('body');
  await tabTo('#name'); await page.keyboard.type('Dana Cohen');
  await page.keyboard.press('Tab'); await page.keyboard.type('0821234567');
  await tabTo('#street'); await page.keyboard.type('12 Example Road');
  await page.keyboard.press('Tab');
  await expect(page.locator('#zone')).toBeFocused();
  await page.keyboard.type('Glenhazel'); // select typeahead
  await expect(page.locator('#zone')).toHaveValue('glenhazel');
  // day chips are buttons: reach first enabled and activate with keyboard
  await tabTo('.day-chip:not([disabled])');
  await page.keyboard.press('Enter');
  await tabTo('input[name=slot]:not([disabled])');
  await page.keyboard.press('Space');
  await expect(page.locator('input[name=slot]:checked')).toHaveCount(1);
  await tabTo('input[name=pay]'); // radio group (default EFT)
  await tabTo('#agree'); await page.keyboard.press('Space');
  await expect(page.locator('#agree')).toBeChecked();
  await tabTo('.summary button[type=submit]');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/confirmation\.html\?ref=MOI-\d{5}/);
  await expect(page.locator('h1')).toBeFocused();
});

test('keyboard-only: validation errors reachable and summary links work with keyboard', async ({ page }) => {
  await freeze(page, T.mon0800);
  await seedCart(page, [{ id: 'beef-brisket', qty: 2 }]);
  await page.goto('/checkout.html');
  await page.locator('.summary button[type=submit], button[type=submit][form=checkout]').first().focus().catch(() => {});
  await page.locator('button[type=submit][form=checkout]').first().evaluate((b) => b.focus());
  await page.keyboard.press('Enter');
  await expect(page.locator('#error-summary')).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('#name')).toBeFocused();
});

test('keyboard: add to basket from shop, open drawer, change qty, close; focus never lost to body', async ({ page }) => {
  await page.goto('/shop.html?cat=beef');
  const add = page.locator('[data-add]').first();
  await add.focus(); await page.keyboard.press('Enter');
  const inc = page.locator('#product-grid .qty__btn[data-dir="1"]').first();
  await expect(inc).toBeFocused(); // focus moves to the stepper's + (the Add button was replaced)
  await page.keyboard.press('Enter');
  await expect(page.locator('#product-grid .qty__input').first()).toHaveValue('1');
  await expect(inc).toBeFocused();
  const dec = page.locator('#product-grid .qty__btn[data-dir="-1"]').first();
  await dec.focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Enter');
  await expect(page.locator('#product-grid [data-add]').first()).toBeFocused(); // back to Add button, focus not lost
  await page.locator('#product-grid [data-add]').first().press('Enter');
  await page.locator('.cart-btn').focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#cart-drawer')).toHaveClass(/is-open/);
  expect(await page.evaluate(() => !!document.activeElement.closest('.drawer__panel'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('.cart-btn')).toBeFocused();
});

test('focus is visible on every interactive element type', async ({ page, isMobile }) => {
  await seedCart(page, [{ id: 'beef-brisket', qty: 2 }]);
  const probe = async (sel, label) => {
    const loc = page.locator(sel).first();
    await loc.focus();
    const r = await loc.evaluate((el) => {
      const cs = getComputedStyle(el);
      // include a focus ring drawn on a wrapper (label / box sibling) for visually-hidden inputs
      const hidden = el.matches('.choice__input,.slot__input,.visually-hidden') || parseFloat(cs.opacity) === 0 || el.offsetWidth < 3;
      let target = el;
      if (hidden) target = el.nextElementSibling || el.parentElement;
      const t = getComputedStyle(target);
      const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none') ||
        (t.outlineStyle !== 'none' && parseFloat(t.outlineWidth) > 0) || (t.boxShadow && t.boxShadow !== 'none') || (t.borderColor !== getComputedStyle(target.parentElement).borderColor && hidden);
      return { ring: !!ring, outline: cs.outline, shadow: cs.boxShadow, tOutline: t.outline, tShadow: t.boxShadow };
    });
    expect(r.ring, `${label} (${sel}) has no visible focus indicator: ${JSON.stringify(r)}`).toBe(true);
  };
  await page.goto('/shop.html');
  await probe('.skip-link', 'skip link');
  await probe(isMobile ? '.nav-toggle' : '.nav__link', 'nav');
  await probe('.cart-btn', 'cart button');
  await probe('#q', 'search input');
  await probe('#cat-chips .chip', 'chip');
  await probe('#sort', 'select');
  await probe('.product-card__title a', 'product link');
  await probe('[data-add]', 'add button');
  await page.goto('/checkout.html');
  await probe('#name', 'text input'); await probe('#zone', 'zone select'); await probe('input[name=fulfilment]', 'radio'); await probe('#agree', 'checkbox');
  await probe('.day-chip:not([disabled])', 'day chip'); await probe('button[type=submit]', 'submit');
  await page.goto('/cart.html');
  await probe('.qty__btn', 'qty button'); await probe('.qty__input', 'qty input'); await probe('.cart-line__remove', 'remove');
});

test('colour contrast: dark & light key text/background pairs pass AA via axe on shop (dedicated rule run)', async ({ page }) => {
  for (const scheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/shop.html');
    await page.waitForLoadState('networkidle');
    const res = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    expect(res.violations.map((v) => v.nodes.map((n) => n.target.join(' ') + ' ' + (n.any[0] || {}).message)), scheme).toEqual([]);
  }
});

test('reduced motion is respected (no long transitions)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/index.html');
  const longest = await page.evaluate(() => Math.max(0, ...[...document.querySelectorAll('*')].slice(0, 400).map((e) => { const s = getComputedStyle(e); return Math.max(...s.transitionDuration.split(',').map(parseFloat), ...s.animationDuration.split(',').map(parseFloat)); })));
  expect(longest).toBeLessThanOrEqual(0.05);
});

test('touch targets on mobile are at least 40px for primary controls', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  await page.goto('/shop.html?cat=beef');
  for (const sel of ['.cart-btn', '.nav-toggle', '[data-add]', '#cat-chips .chip', '#q']) {
    const box = await page.locator(sel).first().boundingBox();
    expect(box.height, sel + ' height').toBeGreaterThanOrEqual(40);
    expect(box.width, sel + ' width').toBeGreaterThanOrEqual(40);
  }
  await page.locator('[data-add]').first().click();
  for (const sel of ['#product-grid .qty__btn', '#product-grid .qty__input']) {
    const box = await page.locator(sel).first().boundingBox();
    expect(box.height, sel).toBeGreaterThanOrEqual(40); expect(box.width, sel).toBeGreaterThanOrEqual(36);
  }
});
