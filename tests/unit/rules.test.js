const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

// Load config exactly as the browser does (assigns window.MOISHES_CONFIG).
function loadCfg() {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../data/config.js'), 'utf8'), ctx);
  return JSON.parse(JSON.stringify(ctx.window.MOISHES_CONFIG));
}
const cfg = loadCfg();
const R = require('../../js/rules.js');

// SAST = UTC+2. helper: a Date for a SAST wall clock time.
const sast = (iso, hhmm = '00:00') => new Date(R.instant(iso, hhmm));
// 2026-11-?? calendar: 2026-11-05 is a Thursday, 2026-11-06 Friday, 2026-11-07 Saturday.
const THU = '2026-11-05', FRI = '2026-11-06', SAT = '2026-11-07', SUN = '2026-11-08', MON = '2026-11-09';

test('calendar sanity', () => {
  assert.equal(R.dowOf(THU), 4); assert.equal(R.dowOf(FRI), 5); assert.equal(R.dowOf(SAT), 6);
  assert.equal(R.addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(R.sast(new Date('2026-11-05T22:30:00Z')).iso, '2026-11-06'); // 00:30 SAST next day
});

test('Friday cutoff: Thursday 14:00', () => {
  assert.equal(R.fridayCutoffPassed(FRI, sast(THU, '13:59'), cfg), false);
  assert.equal(R.fridayCutoffPassed(FRI, sast(THU, '14:00'), cfg), false, 'exactly 14:00 is still allowed');
  assert.equal(R.fridayCutoffPassed(FRI, sast(THU, '14:01'), cfg), true);
  assert.equal(R.fridayCutoffPassed(FRI, sast(THU, '16:00'), cfg), true);
  assert.equal(R.fridayCutoffPassed(FRI, sast('2026-11-04', '23:59'), cfg), false);
  assert.equal(R.fridayCutoffPassed(MON, sast(THU, '16:00'), cfg), false, 'non-Friday never affected');
  // Next-week Friday not affected by this week's cutoff
  assert.equal(R.fridayCutoffPassed('2026-11-13', sast(THU, '16:00'), cfg), false);
});

test('Friday day availability before/after cutoff', () => {
  const before = R.dayInfo(FRI, 'delivery', sast(THU, '10:00'), cfg);
  assert.equal(before.available, true);
  assert.equal(before.slots.length, 3);
  const after = R.dayInfo(FRI, 'delivery', sast(THU, '15:00'), cfg);
  assert.equal(after.available, false);
  assert.match(after.reason, /cut-off/i);
  assert.equal(R.dayInfo(FRI, 'collection', sast(THU, '15:00'), cfg).available, false);
});

test('no Saturday ever', () => {
  for (const mode of ['delivery', 'collection']) {
    const d = R.dayInfo(SAT, mode, sast(MON, '08:00'), cfg);
    assert.equal(d.available, false); assert.equal(d.slots.length, 0);
    assert.match(d.reason, /Shabbos/);
  }
  // Across a long horizon no Saturday is offered
  const days = R.availableDays(sast(MON, '08:00'), 'delivery', cfg);
  for (const d of days) if (d.dow === 6) assert.equal(d.available, false);
  assert.ok(days.filter((d) => d.available).every((d) => d.dow !== 6));
  assert.equal(R.validateSlot(SAT, '09:00-11:00', 'delivery', sast(MON, '08:00'), cfg).ok, false);
});

test('Yom Tov closed dates', () => {
  for (const y of cfg.yomTovClosed) {
    assert.equal(R.isClosedDay(y.date, cfg), true, y.date);
    const d = R.dayInfo(y.date, 'delivery', new Date(R.instant(R.addDays(y.date, -3), '09:00')), cfg);
    assert.equal(d.available, false, y.date); assert.equal(d.slots.length, 0);
    assert.ok(d.reason.includes(y.name) || (R.dowOf(y.date) === 6 && /Shabbos/.test(d.reason)), 'reason names the festival or Shabbos');
  }
  assert.equal(R.yomTovName('2027-04-22', cfg), 'Pesach (day 1)');
  assert.equal(R.yomTovName('2027-04-24', cfg), null);
  assert.equal(R.validateSlot('2027-04-22', '09:00-11:00', 'delivery', sast('2027-04-20', '08:00'), cfg).ok, false);
  assert.equal(R.nextOpenDate('2027-04-21', cfg), '2027-04-25'); // 22,23 Yom Tov, 24 Shabbos
});

test('Yom Tov dates are real dates and configured sanely', () => {
  const seen = new Set();
  for (const y of cfg.yomTovClosed) { assert.match(y.date, /^\d{4}-\d{2}-\d{2}$/); assert.ok(!seen.has(y.date)); seen.add(y.date); assert.ok(y.name); }
});

test('lead time: minimum 3h for delivery start / collection end', () => {
  const lead = cfg.ordering.minLeadHours; assert.equal(lead, 3);
  // Monday 08:00: delivery 09:00 too soon, 11:00 exactly 3h OK
  const d = R.dayInfo(MON, 'delivery', sast(MON, '08:00'), cfg);
  const by = Object.fromEntries(d.slots.map((s) => [s.value, s.available]));
  assert.equal(by['09:00-11:00'], false);
  assert.equal(by['11:00-13:00'], true);
  assert.equal(by['14:00-16:00'], true);
  const d2 = R.dayInfo(MON, 'delivery', sast(MON, '08:01'), cfg);
  assert.equal(d2.slots.find((s) => s.value === '11:00-13:00').available, false);
  // Late: no slots left today
  const late = R.dayInfo(MON, 'delivery', sast(MON, '16:00'), cfg);
  assert.equal(late.available, false); assert.match(late.reason, /No slots left/);
  // collection windows measured by END
  const c = R.dayInfo(MON, 'collection', sast(MON, '14:00'), cfg);
  assert.equal(c.slots[0].available, true, '17:30 end is >3h after 14:00'); // 3.5h
  assert.equal(R.dayInfo(MON, 'collection', sast(MON, '14:31'), cfg).slots[0].available, false);
});

test('past dates and too-far dates are rejected', () => {
  const now = sast(MON, '08:00');
  assert.equal(R.validateSlot('2026-11-08', '09:00-11:00', 'delivery', sast(MON, '08:00'), cfg).ok, false, 'past');
  assert.match(R.validateSlot('2026-11-08', '09:00-11:00', 'delivery', now, cfg).reason, /passed/);
  assert.match(R.validateSlot(R.addDays('2026-11-09', cfg.ordering.maxDaysAhead + 1), '09:00-11:00', 'delivery', now, cfg).reason, /far/);
  assert.equal(R.validateSlot('', '', 'delivery', now, cfg).ok, false);
  assert.equal(R.validateSlot('2026-11-10', '23:00-23:30', 'delivery', now, cfg).ok, false, 'unknown slot');
  assert.equal(R.validateSlot('2026-11-10', '09:00-11:00', 'delivery', now, cfg).ok, true);
});

test('Friday slots end by 13:00', () => {
  for (const s of cfg.deliverySlots[5]) assert.ok(R.parseSlot(s).end <= '13:00', s);
  assert.deepEqual(cfg.deliverySlots[6], []);
});

test('availableDays covers today..maxDaysAhead', () => {
  const days = R.availableDays(sast(MON, '08:00'), 'delivery', cfg);
  assert.equal(days.length, cfg.ordering.maxDaysAhead + 1);
  assert.equal(days[0].iso, MON);
  assert.equal(R.firstAvailable(sast(MON, '08:00'), 'delivery', cfg).iso, MON);
  assert.equal(R.firstAvailable(sast(THU, '15:00'), 'delivery', cfg).iso, SUN, 'Fri cut off, Sat closed -> Sunday');
});

test('delivery fee, minimum, free threshold', () => {
  const z = R.findZone('sandringham', cfg); assert.equal(z.fee, 50); assert.equal(z.minimum, 350);
  assert.equal(R.findZone('nowhere', cfg), null);
  assert.equal(R.deliveryFee(z, 400, 'delivery', cfg), 50);
  assert.equal(R.deliveryFee(z, 400, 'collection', cfg), 0);
  assert.equal(R.deliveryFee(z, 1499.99, 'delivery', cfg), 50);
  assert.equal(R.deliveryFee(z, 1500, 'delivery', cfg), 0, 'free at threshold');
  assert.equal(R.deliveryFee(null, 400, 'delivery', cfg), null, 'unknown zone');
  assert.equal(R.deliveryFee(null, 1500, 'delivery', cfg), 0);
  const t = R.totals([{ price: 100, qty: 3 }], { mode: 'delivery', zone: z }, cfg);
  assert.equal(t.subtotal, 300); assert.equal(t.minimumMet, false); assert.equal(t.shortfall, 50); assert.equal(t.total, 350);
  const t2 = R.totals([{ price: 100, qty: 3.5 }], { mode: 'delivery', zone: z }, cfg);
  assert.equal(t2.minimumMet, true); assert.equal(t2.shortfall, 0); assert.equal(t2.total, 400);
  const t3 = R.totals([{ price: 100, qty: 3 }], { mode: 'collection', zone: z }, cfg);
  assert.equal(t3.minimumMet, true); assert.equal(t3.total, 300); assert.equal(t3.deliveryFee, 0);
  const t4 = R.totals([{ price: 1500, qty: 1 }], { mode: 'delivery', zone: z }, cfg);
  assert.equal(t4.freeDelivery, true); assert.equal(t4.total, 1500); assert.equal(t4.freeRemaining, 0);
  const t5 = R.totals([{ price: 100, qty: 3 }], { mode: 'delivery', zone: null }, cfg);
  assert.equal(t5.feeKnown, false); assert.equal(t5.minimum, 0);
  // every zone in config consistent
  for (const zz of cfg.deliveryZones) { assert.ok(zz.fee >= 0); assert.ok(zz.minimum > 0); assert.ok(zz.minimum < cfg.freeDeliveryThreshold); }
});

test('VAT is included in prices (15%)', () => {
  const t = R.totals([{ price: 115, qty: 1 }], { mode: 'collection' }, cfg);
  assert.equal(t.vat, 15); assert.equal(t.total, 115);
  const t2 = R.totals([{ price: 189.9, qty: 2.5 }], { mode: 'collection' }, cfg);
  assert.equal(t2.total, 474.75); assert.equal(t2.vat, R.round2(474.75 * 0.15 / 1.15));
  // delivery fee is VAT inclusive too
  const t3 = R.totals([{ price: 400, qty: 1 }], { mode: 'delivery', zone: R.findZone('sandringham', cfg) }, cfg);
  assert.equal(t3.vat, R.round2(450 * 0.15 / 1.15));
  const ex = Object.assign({}, cfg, { pricesIncludeVat: false });
  assert.equal(R.totals([{ price: 100, qty: 1 }], { mode: 'collection' }, ex).vat, 15);
  assert.equal(R.round2(1.005), 1.01); assert.equal(R.lineTotal(159.9, 2.5), 399.75);
});

test('kg step rounding / qty normalisation', () => {
  assert.equal(R.qtyStep('kg', cfg), 0.5); assert.equal(R.qtyStep('each', cfg), 1);
  const n = (q, u) => R.normalizeQty(q, u, cfg);
  assert.equal(n(0.7, 'kg'), 0.5); assert.equal(n(0.75, 'kg'), 1); assert.equal(n(1.26, 'kg'), 1.5);
  assert.equal(n('1,5', 'kg'), 1.5, 'decimal comma');
  assert.equal(n(0, 'kg'), 0.5); assert.equal(n(-3, 'kg'), 0.5); assert.equal(n('abc', 'kg'), 0.5);
  assert.equal(n(999, 'kg'), 50); assert.equal(n(2, 'each'), 2); assert.equal(n(2.4, 'each'), 2); assert.equal(n(2.5, 'each'), 3);
  assert.equal(n(0, 'each'), 1); assert.equal(n(500, 'each'), 99);
});

test('South African phone validation', () => {
  const ok = ['082 123 4567', '0821234567', '+27 82 123 4567', '+27821234567', '27821234567', '0027821234567', '011 485 4513', '(011) 485-4513', '082-123-4567'];
  for (const p of ok) assert.equal(R.phoneSA(p).valid, true, p);
  assert.equal(R.phoneSA('082 123 4567').e164, '+27821234567');
  assert.equal(R.phoneSA('+27 82 123 4567').local, '082 123 4567');
  const bad = ['', '12345', '082 123 456', '082 123 45678', '+1 202 555 0100', 'abcdefghij', '0921234567', '+270821234567', null, undefined, '09 123 4567'];
  for (const p of bad) assert.equal(R.phoneSA(p).valid, false, String(p));
  assert.equal(R.emailOk('a@b.co'), true); assert.equal(R.emailOk('a@b'), false); assert.equal(R.emailOk('a b@c.com'), false);
});

const order = () => ({
  ref: 'MOI-12345', customer: { name: 'Dana Cohen', phone: '082 123 4567', email: 'd@example.com' },
  fulfilment: 'delivery', address: '12 Example Rd', zoneName: 'Glenhazel', slot: { date: '2026-11-10', label: '09:00 - 11:00' },
  lines: [{ name: 'Beef Brisket', unit: 'kg', qty: 2, total: 319.8 }, { name: 'Challah', unit: 'each', qty: 3, total: 90 }],
  totals: { subtotal: 409.8, deliveryFee: 0, total: 409.8, vat: 53.45 }, payment: { label: 'EFT / Bank transfer' }, notes: 'Cut in two'
});
test('whatsappText content', () => {
  const t = R.whatsappText(order(), cfg);
  for (const s of ['*New order MOI-12345*', 'Dana Cohen', '082 123 4567', 'Email: d@example.com', '*Delivery* to 12 Example Rd, Glenhazel', 'Beef Brisket x 2kg = R319.80', 'Challah x 3 = R90.00', 'Subtotal: R409.80', 'Delivery: Free', '*Total: R409.80* (VAT incl.)', 'Payment: EFT / Bank transfer', 'Notes: Cut in two', 'cut to order'])
    assert.ok(t.includes(s), 'missing: ' + s + '\n' + t);
  const o = order(); o.fulfilment = 'collection'; o.customer.email = '';
  const c = R.whatsappText(o, cfg);
  assert.ok(c.includes('*Collection* from ' + cfg.shop.address)); assert.ok(!c.includes('Email:')); assert.ok(!c.includes('Delivery:'));
  const u = R.whatsappUrl(order(), cfg);
  assert.ok(u.startsWith('https://wa.me/27114854513?text=')); assert.equal(decodeURIComponent(u.split('text=')[1]), t);
});

test('orderRef format and uniqueness-friendly range', () => {
  assert.match(R.orderRef(), /^MOI-\d{5}$/);
  assert.equal(R.orderRef(() => 0), 'MOI-10000'); assert.equal(R.orderRef(() => 0.999999), 'MOI-99999');
});

test('greeting and banner', () => {
  assert.equal(R.greeting(sast(FRI, '10:00'), cfg).en, 'Shabbat Shalom');
  assert.equal(R.greeting(sast(MON, '10:00'), cfg).en, 'Shalom');
  assert.equal(R.greeting(sast('2027-04-22', '10:00'), cfg).en, 'Chag Sameach');
  assert.equal(R.bannerState(sast(THU, '13:00'), cfg).kind, 'soon');
  assert.equal(R.bannerState(sast(THU, '13:00'), cfg).hoursLeft, 1);
  assert.equal(R.bannerState(sast(THU, '15:00'), cfg).kind, 'passed', 'Thu after cutoff');
  assert.equal(R.bannerState(sast(FRI, '09:00'), cfg).kind, 'passed');
  assert.equal(R.bannerState(sast(SAT, '09:00'), cfg).kind, 'shabbos');
  assert.equal(R.bannerState(sast('2027-04-22', '09:00'), cfg).kind, 'yomtov');
  assert.equal(R.bannerState(sast(MON, '09:00'), cfg).kind, 'open');
});
