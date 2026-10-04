const { test, expect, seedCart, seedStorage, freeze, T, fillDetails, noOverflow } = require('./helpers');

const BRISKET = [{ id: 'beef-brisket', qty: 2 }];             // R319.80
const slotInputs = (page) => page.locator('input[name=slot]');

test.describe('validation', () => {
  test('empty submit shows summary + per-field errors, aria-invalid, focus summary', async ({ page }) => {
    await freeze(page, T.mon0800);
    await seedCart(page, BRISKET);
    await page.goto('/checkout.html');
    await page.locator('#summary button[type=submit], .summary button[type=submit]').first().click({ force: true }).catch(() => {});
    await page.locator('button[type=submit][form=checkout]').first().evaluate((b) => b.click());
    const sum = page.locator('#error-summary');
    await expect(sum).toBeVisible();
    await expect(sum).toBeFocused();
    await expect(sum).toContainText(/problems/);
    for (const id of ['name', 'phone', 'street', 'zone']) {
      await expect(page.locator('#' + id)).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('#' + id + '-err')).not.toBeEmpty();
    }
    await expect(page.locator('#agree-err')).not.toBeEmpty();
    // clicking an error moves focus to the field
    await sum.locator('a', { hasText: 'full name' }).click();
    await expect(page.locator('#name')).toBeFocused();
    // typing clears error styling
    await page.fill('#name', 'Dana');
    await expect(page.locator('#name')).not.toHaveAttribute('aria-invalid', 'true');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('moishes.orders.v1') || '[]').length)).toBe(0);
  });

  test('invalid phone and email messages', async ({ page }) => {
    await freeze(page, T.mon0800);
    await seedCart(page, BRISKET);
    await page.goto('/checkout.html');
    await fillDetails(page, { phone: '123', email: 'bad@' });
    await page.locator('button[type=submit][form=checkout]').first().evaluate((b) => b.click());
    await expect(page.locator('#phone-err')).toContainText('valid South African number');
    await expect(page.locator('#email-err')).toContainText('valid email');
    await expect(page).toHaveURL(/checkout\.html/);
  });
});

test.describe('delivery vs collection, minimum order', () => {
  test('mode switch toggles fields, fee and payment options', async ({ page }) => {
    await freeze(page, T.mon0800);
    await seedCart(page, [{ id: 'beef-brisket', qty: 2.5 }]);  // R399.75
    await page.goto('/checkout.html');
    await expect(page.locator('#delivery-fields')).toBeVisible();
    await expect(page.locator('#summary-totals')).toContainText('Choose suburb');
    await expect(page.locator('#pay-list')).toContainText('Cash on delivery');
    await expect(page.locator('#pay-list')).not.toContainText('Pay at collection');
    await page.selectOption('#zone', 'norwood'); // fee 60, min 400
    await expect(page.locator('#summary-totals')).toContainText('R60.00');
    await expect(page.locator('#summary-totals')).toContainText('R459.75');
    await expect(page.locator('#min-alert')).toBeVisible();
    await expect(page.locator('#min-alert')).toContainText('Add R0.25 more');
    await page.locator('label.choice', { hasText: 'Collection' }).first().click();
    await expect(page.locator('#delivery-fields')).toBeHidden();
    await expect(page.locator('#collect-note')).toBeVisible();
    await expect(page.locator('#min-alert')).toBeHidden();
    await expect(page.locator('#summary-totals')).toContainText('Free (collection)');
    await expect(page.locator('#summary-totals')).toContainText('R399.75');
    await expect(page.locator('#pay-list')).toContainText('Pay at collection');
    await expect(page.locator('#pay-list')).not.toContainText('Cash on delivery');
    await expect(page.locator('#mode-note')).toContainText('3 Birt Street');
    await page.locator('label.choice', { hasText: 'Delivery' }).first().click();
    await expect(page.locator('#delivery-fields')).toBeVisible();
  });

  test('minimum order enforced on submit for delivery, not for collection', async ({ page }) => {
    await freeze(page, T.mon0800);
    await seedCart(page, [{ id: 'challah-plain', qty: 2 }]); // R65.80
    await page.goto('/checkout.html');
    await fillDetails(page, { zone: 'glenhazel' });
    await page.locator('button[type=submit][form=checkout]').first().evaluate((b) => b.click());
    await expect(page.locator('#zone-err')).toContainText('Minimum order for Glenhazel is R250.00');
    await expect(page.locator('#error-summary')).toBeVisible();
    await expect(page).toHaveURL(/checkout/);
    // collection has no minimum
    await page.locator('label.choice', { hasText: 'Collection' }).first().click();
    await page.locator('label.slot:not(:has(input:disabled))').first().click();
    await page.locator('button[type=submit][form=checkout]').first().evaluate((b) => b.click());
    await expect(page).toHaveURL(/confirmation\.html\?ref=MOI-\d{5}/);
  });

  test('free delivery over threshold in any zone', async ({ page }) => {
    await freeze(page, T.mon0800);
    await seedCart(page, [{ id: 'beef-brisket', qty: 10 }]); // R1599
    await page.goto('/checkout.html');
    await page.selectOption('#zone', 'observatory');
    await expect(page.locator('#summary-totals')).toContainText('Free');
    await expect(page.locator('#summary-totals .totals__row--grand')).toContainText(/R1.?599\.00/);
  });
});

test.describe('slot picker rules (frozen clock)', () => {
  const dayChips = (page) => page.locator('#day-chips .day-chip');

  test('Thursday 13:00: Friday offered, Saturday never', async ({ page }) => {
    await freeze(page, T.thu1300);
    await seedCart(page, BRISKET);
    await page.goto('/checkout.html');
    const chips = dayChips(page);
    expect(await chips.count()).toBe(15);
    // 2026-11-06 Friday available with 3 slots ending <=13:00
    const fri = page.locator('[data-day="2026-11-06"]');
    await expect(fri).toBeEnabled();
    await fri.click();
    const labels = await page.locator('.slot__label').allTextContents();
    expect(labels.length).toBe(3);
    expect(labels.join(' ')).toContain('11:30 - 13:00');
    // Saturday disabled
    const sat = page.locator('[data-day="2026-11-07"]');
    await expect(sat).toBeDisabled();
    await expect(sat).toHaveAttribute('aria-label', /Shabbos/);
    // every Saturday in the window is disabled
    for (const el of await chips.all()) {
      const iso = await el.getAttribute('data-day');
      const dow = new Date(iso + 'T12:00:00Z').getUTCDay();
      if (dow === 6) await expect(el).toBeDisabled();
    }
    await expect(page.locator('#day-note')).toContainText(/Shabbos/i);
  });

  test('Thursday 15:00: Friday cut-off passed -> disabled, first available is Sunday', async ({ page }) => {
    await freeze(page, T.thu1500);
    await seedCart(page, BRISKET);
    await page.goto('/checkout.html');
    const fri = page.locator('[data-day="2026-11-06"]');
    await expect(fri).toBeDisabled();
    await expect(fri).toHaveAttribute('aria-label', /cut-off passed/i);
    await expect(page.locator('[data-day="2026-11-07"]')).toBeDisabled();
    await expect(page.locator('#day-chips .day-chip[aria-pressed=true]')).toHaveAttribute('data-day', '2026-11-08');
    // Sunday has only 2 slots
    expect(await slotInputs(page).count()).toBe(2);
    // next Friday (2026-11-13) is open again
    await expect(page.locator('[data-day="2026-11-13"]')).toBeEnabled();
  });

  test('lead time: Monday 08:00 -> 09:00 slot disabled with reason, 11:00 enabled', async ({ page }) => {
    await freeze(page, T.mon0800);
    await seedCart(page, BRISKET);
    await page.goto('/checkout.html');
    await expect(page.locator('#day-chips .day-chip[aria-pressed=true]')).toHaveAttribute('data-day', '2026-11-09');
    await expect(page.locator('input[name=slot][value="09:00-11:00"]')).toBeDisabled();
    await expect(page.locator('.slot__note').first()).toContainText('Too soon');
    await expect(page.locator('input[name=slot][value="11:00-13:00"]')).toBeEnabled();
  });

  test('Saturday morning: today is closed, first open day is Sunday', async ({ page }) => {
    await freeze(page, T.sat1000);
    await seedCart(page, BRISKET);
    await page.goto('/checkout.html');
    await expect(page.locator('[data-day="2026-11-07"]')).toBeDisabled();
    await expect(page.locator('#day-chips .day-chip[aria-pressed=true]')).toHaveAttribute('data-day', '2026-11-08');
  });

  test('Yom Tov dates are disabled with festival name; collection too', async ({ page }) => {
    await freeze(page, T.yt); // Tue 2027-04-20
    await seedCart(page, BRISKET);
    await page.goto('/checkout.html');
    for (const d of ['2027-04-22', '2027-04-23', '2027-04-28', '2027-04-29']) {
      await expect(page.locator(`[data-day="${d}"]`), d).toBeDisabled();
      await expect(page.locator(`[data-day="${d}"]`)).toHaveAttribute('aria-label', /Pesach/);
    }
    await expect(page.locator('[data-day="2027-04-21"]')).toBeEnabled();
    await expect(page.locator('[data-day="2027-04-25"]')).toBeEnabled();
    await expect(page.locator('#day-note')).toContainText('Pesach (day 1)');
    await page.locator('label.choice', { hasText: 'Collection' }).first().click();
    await expect(page.locator('[data-day="2027-04-22"]')).toBeDisabled();
    await expect(page.locator('[data-day="2027-04-24"]')).toBeDisabled(); // Shabbos
  });

  test('clock crossing the cut-off while the page is open: submit is rejected', async ({ page }) => {
    await freeze(page, T.thu1300);
    await seedCart(page, BRISKET);
    await page.goto('/checkout.html');
    await fillDetails(page);
    await page.locator('[data-day="2026-11-06"]').click();
    await page.locator('label.slot:not(:has(input:disabled))').first().click();
    await freeze(page, T.thu1500); // time passes
    await page.locator('button[type=submit][form=checkout]').first().evaluate((b) => b.click());
    await expect(page.locator('#slot-err')).toContainText(/cut-off/i);
    await expect(page).toHaveURL(/checkout/);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('moishes.orders.v1') || '[]').length)).toBe(0);
  });
});

test.describe('placing orders: each payment method + confirmation', () => {
  const methods = [
    { id: 'eft', mode: 'delivery', label: 'EFT / Bank transfer' },
    { id: 'cod-cash', mode: 'delivery', label: 'Cash on delivery' },
    { id: 'cod-card', mode: 'delivery', label: 'Card on delivery' },
    { id: 'collection', mode: 'collection', label: 'Pay at collection' },
  ];
  for (const m of methods) {
    test(`pay by ${m.id}`, async ({ page }) => {
      await freeze(page, T.mon0800);
      await seedCart(page, [{ id: 'beef-brisket', qty: 2 }, { id: 'challah-plain', qty: 2 }]); // 319.80 + 65.80 = 385.60
      await page.goto('/checkout.html');
      await fillDetails(page, { mode: m.mode, email: 'dana@example.com', zone: 'glenhazel' });
      await page.locator('label.choice', { hasText: m.label }).first().click();
      await page.locator('label.slot:not(:has(input:disabled))').first().click();
      await page.fill('#notes', 'Please cut in two');
      await page.locator('button[type=submit][form=checkout]').first().evaluate((b) => b.click());
      await expect(page).toHaveURL(/confirmation\.html\?ref=(MOI-\d{5})/);
      const ref = new URL(page.url()).searchParams.get('ref');
      await expect(page.locator('h1')).toHaveText('Todah rabbah!');
      await expect(page.locator('h1')).toBeFocused();
      await expect(page.locator('.confirm__ref')).toHaveText(ref);
      await expect(page.locator('.confirm')).toContainText(m.label);
      await expect(page.locator('.confirm')).toContainText('Dana Cohen');
      await expect(page.locator('.confirm')).toContainText('385.60');
      await expect(page.locator('.confirm')).toContainText('Please cut in two');
      if (m.id === 'eft') { await expect(page.locator('#eft')).toContainText(ref); await expect(page.locator('#eft')).toContainText('0000000000'); }
      else await expect(page.locator('#eft')).toHaveCount(0);
      if (m.mode === 'collection') await expect(page.locator('.confirm')).toContainText('3 Birt Street'); else await expect(page.locator('.confirm')).toContainText('12 Example Road');
      // basket cleared, customer remembered
      await expect(page.locator('.cart-btn__count')).toHaveText('0');
      // WhatsApp link content
      const href = await page.locator('#wa-send').getAttribute('href');
      expect(href).toMatch(/^https:\/\/wa\.me\/27114854513\?text=/);
      const text = decodeURIComponent(href.split('text=')[1]);
      for (const s of ['*New order ' + ref + '*', 'Dana Cohen', '082 123 4567', 'dana@example.com', 'Beef Brisket x 2kg = R319.80', 'Challah (Plain) x 2 = R65.80', '*Total: R385.60* (VAT incl.)', 'Payment: ' + m.label, 'Notes: Please cut in two', m.mode === 'collection' ? '*Collection* from' : '*Delivery* to 12 Example Road, Unit 4, Glenhazel'])
        expect(text, s).toContain(s);
      await expect(page.locator('#wa-send')).toHaveAttribute('target', '_blank');
      await expect(page.locator('#wa-send')).toHaveAttribute('rel', /noopener/);
      // VAT sanity: 385.60 incl -> 50.30
      await expect(page.locator('.confirm')).toContainText('VAT of R50.30');
      // stored order
      const o = await page.evaluate(() => JSON.parse(localStorage.getItem('moishes.orders.v1'))[0]);
      expect(o.ref).toBe(ref); expect(o.status).toBe('new'); expect(o.payment.id).toBe(m.id); expect(o.totals.total).toBe(385.6);
      expect(o.slot.date).toBe('2026-11-09');
      // reload keeps confirmation
      await page.reload();
      await expect(page.locator('.confirm__ref')).toHaveText(ref);
    });
  }

  test('PayFast is shown disabled and cannot be chosen', async ({ page }) => {
    await freeze(page, T.mon0800);
    await seedCart(page, BRISKET);
    await page.goto('/checkout.html');
    await expect(page.locator('input[name=pay][value=payfast]')).toBeDisabled();
    await expect(page.locator('#pay-list')).toContainText('Coming soon');
    await expect(page.locator('input[name=pay]:checked')).toHaveAttribute('value', 'eft');
  });

  test('delivery fee added to total for outer zone and order saved correctly', async ({ page }) => {
    await freeze(page, T.mon0800);
    await seedCart(page, [{ id: 'beef-brisket', qty: 3 }]); // 479.70
    await page.goto('/checkout.html');
    await fillDetails(page, { zone: 'observatory' }); // fee 90, min 500 -> minimum NOT met
    await page.locator('button[type=submit][form=checkout]').first().evaluate((b) => b.click());
    await expect(page.locator('#zone-err')).toContainText('R500.00');
    await page.selectOption('#zone', 'norwood'); // fee 60, min 400
    await expect(page.locator('#summary-totals')).toContainText('R539.70');
    await page.locator('label.slot:not(:has(input:disabled))').first().click();
    await page.locator('button[type=submit][form=checkout]').first().evaluate((b) => b.click());
    await expect(page).toHaveURL(/confirmation/);
    await expect(page.locator('.totals__row--grand')).toContainText('R539.70');
    await expect(page.locator('.confirm')).toContainText('R60.00');
  });

  test('customer details are remembered on next checkout', async ({ page }) => {
    await freeze(page, T.mon0800);
    await seedCart(page, BRISKET);
    await page.goto('/checkout.html');
    await fillDetails(page, { zone: 'raedene' });
    await page.locator('label.slot:not(:has(input:disabled))').first().click();
    await page.locator('button[type=submit][form=checkout]').first().evaluate((b) => b.click());
    await expect(page).toHaveURL(/confirmation/);
    await seedCart(page, BRISKET);
    await page.goto('/checkout.html');
    await expect(page.locator('#name')).toHaveValue('Dana Cohen');
    await expect(page.locator('#zone')).toHaveValue('raedene');
  });

  test('checkout is mobile-friendly: no overflow, sticky CTA visible on mobile', async ({ page, isMobile }) => {
    await freeze(page, T.mon0800);
    await seedCart(page, BRISKET);
    await page.goto('/checkout.html');
    await noOverflow(page);
    if (isMobile) { await expect(page.locator('#sticky')).toBeVisible(); await expect(page.locator('#sticky-total')).toContainText('R319.80'); }
  });
});

test.describe('orders page and admin', () => {
  async function placeOrder(page, mode = 'delivery') {
    await freeze(page, T.mon0800);
    await seedCart(page, BRISKET);
    await page.goto('/checkout.html');
    await fillDetails(page, { mode });
    await page.locator('label.slot:not(:has(input:disabled))').first().click();
    await page.locator('button[type=submit][form=checkout]').first().evaluate((b) => b.click());
    await expect(page).toHaveURL(/confirmation/);
    return new URL(page.url()).searchParams.get('ref');
  }

  test('orders page lists order, expands items, view order, order again', async ({ page }) => {
    const ref = await placeOrder(page);
    await page.goto('/orders.html');
    await expect(page.locator('.panel__title', { hasText: ref })).toBeVisible();
    await expect(page.locator('.badge', { hasText: 'Received' })).toBeVisible();
    await page.locator('summary').first().click();
    await expect(page.locator('.summary__lines').first()).toContainText('Beef Brisket');
    await page.locator('[data-reorder]').click();
    await expect(page.locator('.toast')).toContainText('items added');
    await expect(page.locator('.cart-btn__count')).toHaveText('1');
    await page.locator('a', { hasText: 'View order' }).click();
    await expect(page.locator('.confirm__ref')).toHaveText(ref);
  });

  test('empty orders page', async ({ page }) => {
    await page.goto('/orders.html');
    await expect(page.locator('.empty__title')).toHaveText('No orders yet');
  });

  test('admin: status flow, filters, CSV export, delete all', async ({ page }) => {
    const ref = await placeOrder(page);
    await placeOrder(page, 'collection');
    await page.goto('/admin.html');
    await expect(page.locator('#admin-root tbody tr')).toHaveCount(2);
    await expect(page.locator('[data-filter=new] .chip__count')).toHaveText('2');
    const row = page.locator('tr', { hasText: ref });
    await row.locator('[data-set=packed]').click();
    await expect(row.locator('.badge')).toHaveText('Packed');
    await expect(page.locator('[data-filter=packed] .chip__count')).toHaveText('1');
    await row.locator('[data-set=delivered]').click();
    await expect(row.locator('.badge')).toHaveText('Delivered');
    await page.locator('[data-filter=delivered]').click();
    await expect(page.locator('#admin-root tbody tr')).toHaveCount(1);
    await page.locator('[data-filter=all]').click();
    // status visible to customer
    await page.goto('/orders.html');
    await expect(page.locator('.panel', { hasText: ref }).locator('.badge')).toHaveText('Delivered');
    await page.goto('/admin.html');
    // CSV
    const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#admin-export').click()]);
    expect(dl.suggestedFilename()).toMatch(/^moishes-orders-\d{4}-\d{2}-\d{2}\.csv$/);
    const csv = (await require('fs').promises.readFile(await dl.path(), 'utf8')).replace(/^﻿/, '');
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('Ref,Created,Status,Name,Phone,Email,Fulfilment,Zone,Address,Date,Slot,Payment,Items,Subtotal,Delivery,Total,Notes');
    expect(lines.length).toBe(3);
    expect(csv).toContain(ref); expect(csv).toContain('Dana Cohen'); expect(csv).toContain('delivered'); expect(csv).toContain('Beef Brisket x 2kg');
    // delete all (confirm dialog)
    page.once('dialog', (d) => d.accept());
    await page.locator('#admin-clear').click();
    await expect(page.locator('.empty__title')).toHaveText('No orders');
    await expect(page.locator('#admin-export')).toBeDisabled();
  });
});
