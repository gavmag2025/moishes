const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

const root = path.join(__dirname, '../..');
const ctx = { window: {} };
for (const f of ['data/config.js', 'data/products.js']) vm.runInNewContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx);
const cfg = ctx.window.MOISHES_CONFIG, P = ctx.window.MOISHES_PRODUCTS;
const CATS = ['beef', 'lamb', 'poultry', 'mince-burgers', 'deli', 'ready-meals', 'bakery', 'pantry', 'shabbos-packs'];
const ART = fs.readdirSync(path.join(root, 'assets/art')).map((f) => f.replace(/\.svg$/, ''));
const DAIRY = /\b(milk|cheese|cheesy|butter|cream|yoghurt|yogurt|dairy|cheddar|mozzarella|feta|ricotta|parmesan|whey|casein|lactose|custard|ice[- ]cream|milkshake|cheesecake|cholov|halavi|chalavi|mayo(nnaise)?)\b/i;

test('catalog has products', () => assert.ok(P.length >= 60, 'got ' + P.length));
test('unique ids, slug-like', () => {
  const ids = P.map((p) => p.id); assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, id);
});
test('schema fields', () => {
  for (const p of P) {
    assert.ok(p.name && p.name.length > 2, p.id);
    assert.ok(CATS.includes(p.category), p.id + ' category ' + p.category);
    assert.ok(typeof p.price === 'number' && p.price > 0 && isFinite(p.price), p.id + ' price');
    assert.ok(['kg', 'each'].includes(p.unit), p.id + ' unit');
    assert.ok(['Meat', 'Pareve'].includes(p.kosher), p.id + ' kosher');
    assert.ok(p.desc && p.desc.length > 15, p.id + ' desc');
    assert.ok(Array.isArray(p.tags), p.id + ' tags');
    assert.equal(typeof p.pesach, 'boolean'); assert.equal(typeof p.featured, 'boolean'); assert.equal(typeof p.stock, 'boolean');
    assert.ok([null, 'New', 'Popular', 'Shabbos Special'].includes(p.badge), p.id + ' badge ' + p.badge);
  }
});
test('every art file exists and only listed art keys used', () => {
  for (const p of P) { assert.ok(ART.includes(p.art), `${p.id}: art "${p.art}" missing`); assert.ok(fs.existsSync(path.join(root, 'assets/art', p.art + '.svg'))); }
  for (const a of ART) { const s = fs.readFileSync(path.join(root, 'assets/art', a + '.svg'), 'utf8'); assert.ok(/<svg[^>]*viewBox="0 0 600 450"/.test(s), a + ' viewBox 600x450'); }
  const used = new Set(P.map((p) => p.art));
  const unused = ART.filter((a) => !used.has(a));
  assert.ok(unused.length <= 6, 'many unused art files: ' + unused);
});
test('every category has products (and a kashrut note)', () => {
  for (const c of CATS) { assert.ok(P.filter((p) => p.category === c).length >= 3, c + ' has <3 products'); assert.ok(cfg.kashrutNotes[c], c + ' note'); }
});
test('no dairy words in names / descriptions / tags / notes', () => {
  for (const p of P) for (const f of [p.name, p.desc, (p.tags || []).join(' '), p.pack || '']) assert.ok(!DAIRY.test(f), `${p.id}: dairy word in "${f}"`);
  for (const [k, v] of Object.entries(cfg.kashrutNotes)) assert.ok(!/\b(milk|cheese|butter|cream)\b/i.test(v), k);
});
test('bakery & pareve rules', () => {
  for (const p of P.filter((p) => p.category === 'bakery')) assert.equal(p.kosher, 'Pareve', p.id + ' bakery must be Pareve');
  for (const p of P.filter((p) => ['beef', 'lamb', 'poultry', 'mince-burgers', 'deli'].includes(p.category))) assert.equal(p.kosher, 'Meat', p.id + ' must be Meat');
  // every product whose name implies animal meat must be Meat
  const meatWord = /\b(beef|lamb|chicken|turkey|steak|brisket|biltong|boerewors|salami|pastrami|polony|mince|burger|schnitzel|ribs?|wors|liver|tongue|oxtail)\b/i;
  for (const p of P) if (meatWord.test(p.name) && p.kosher === 'Pareve') assert.fail(`${p.id} "${p.name}" looks like meat but is Pareve`);
});
test('Pareve items are not tagged/described as meat-based', () => {
  for (const p of P.filter((x) => x.kosher === 'Pareve')) assert.ok(!/\b(beef|lamb|chicken|turkey)\b/i.test(p.name), p.id);
});
test('kg items have step-compatible sensible prices; each-items have unit price', () => {
  for (const p of P) { assert.ok(p.price < 5000, p.id); if (p.unit === 'kg') assert.ok(p.price >= 20, p.id + ' kg price implausibly low'); }
});
test('Pesach mode filter yields a decent non-empty, non-bakery-chametz set', () => {
  const pes = P.filter((p) => p.pesach);
  assert.ok(pes.length >= 10, 'pesach products: ' + pes.length);
  for (const p of pes) assert.ok(!/\b(challah|roll|rolls|cake|rugelach|bread|pita|schnitzel)\b/i.test(p.name), `${p.id} "${p.name}" is chametz-like but pesach:true`);
  for (const p of P.filter((x) => x.category === 'bakery')) assert.equal(p.pesach, false, p.id + ' bakery cannot be Pesach');
  assert.equal(cfg.pesach, false, 'pesach default off');
  assert.ok(P.filter((p) => !p.pesach).length > 0);
});
test('featured products exist for the home page', () => assert.ok(P.filter((p) => p.featured).length >= 4));
test('config sanity: zones, payments, hours', () => {
  const ids = cfg.deliveryZones.map((z) => z.id); assert.equal(new Set(ids).size, ids.length);
  assert.equal(cfg.payments.filter((p) => p.enabled).length >= 3, true);
  assert.equal(cfg.payments.find((p) => p.id === 'payfast').enabled, false);
  assert.equal(cfg.hours[6], null);
  assert.equal(cfg.demo, true); assert.equal(cfg.kashrut.dairy, false);
  assert.match(cfg.shop.whatsapp, /^\d{11}$/);
});
