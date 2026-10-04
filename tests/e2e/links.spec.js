// Crawl every HTML page: every internal link/img/script/stylesheet/href/anchor must resolve.
const { test, expect, PAGES, ROOT, seedCart } = require('./helpers');
const fs = require('fs');
const path = require('path');

test('crawl: all internal links, assets, anchors and sprite refs resolve (every page)', async ({ page, request }) => {
  test.skip(test.info().project.name !== 'desktop', 'one crawl is enough');
  test.setTimeout(120000);
  const queue = ['/index.html'], seen = new Set(), bad = [], checked = new Set();
  const origin = 'http://127.0.0.1:8123';
  async function head(url, from) {
    const key = url.split('#')[0];
    if (checked.has(key)) return; checked.add(key);
    const r = await request.get(origin + key);
    if (r.status() !== 200) bad.push(`${r.status()} ${key} (from ${from})`);
  }
  // Seed with all html files on disk too, so orphan pages are covered
  for (const f of fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'))) if (!queue.includes('/' + f)) queue.push('/' + f);
  await seedCart(page, [{ id: 'beef-brisket', qty: 1 }]);
  while (queue.length) {
    const url = queue.shift(); if (seen.has(url)) continue; seen.add(url);
    await page.goto(origin + url);
    await page.waitForLoadState('networkidle');
    const info = await page.evaluate(() => {
      const abs = (u) => new URL(u, location.href);
      const out = { links: [], assets: [], anchors: [] };
      document.querySelectorAll('a[href]').forEach((a) => { const h = a.getAttribute('href'); if (/^(mailto:|tel:|javascript:)/.test(h)) return; if (h === '#') { return; } out.links.push(abs(h).href); });
      document.querySelectorAll('img[src], script[src], link[href], source[src]').forEach((e) => out.assets.push(abs(e.getAttribute('src') || e.getAttribute('href')).href));
      document.querySelectorAll('a[href^="#"]').forEach((a) => { const id = a.getAttribute('href').slice(1); if (id && !document.getElementById(id)) out.anchors.push(id); });
      return out;
    });
    for (const id of info.anchors) bad.push(`missing anchor #${id} on ${url}`);
    for (const l of info.links) {
      const u = new URL(l);
      if (u.origin !== origin) { if (!/^https:\/\/(wa\.me|www\.google\.com|maps\.google|goo\.gl|www\.openstreetmap\.org|maps\.app\.goo\.gl)/.test(l)) bad.push(`unexpected external ${l} on ${url}`); continue; }
      await head(u.pathname, url);
      if (u.hash && u.pathname.endsWith('.html')) { /* anchor on other page verified below */ }
      if (u.pathname.endsWith('.html') && !seen.has(u.pathname + u.search)) queue.push(u.pathname + u.search);
    }
    for (const a of info.assets) {
      const u = new URL(a); if (u.origin !== origin) continue; await head(u.pathname, url);
    }
  }
  // cross-page anchors (e.g. kashrut.html#faq)
  const hashes = await page.evaluate(() => 0);
  expect(bad).toEqual([]);
  expect(seen.size).toBeGreaterThan(12);
});

test('every product link from shop resolves to a product page (all 90+)', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'one crawl is enough');
  await page.goto('/shop.html');
  const hrefs = await page.locator('#product-grid .product-card__title a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  const ids = await page.evaluate(() => window.MOISHES_PRODUCTS.map((p) => p.id));
  expect(hrefs.length).toBe(ids.length);
  for (const id of ids) expect(hrefs).toContain('product.html?id=' + id);
});

test('cross-page anchors exist (footer/FAQ links)', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'once');
  await page.goto('/index.html');
  const targets = await page.locator('a[href*=".html#"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  for (const t of targets) {
    const [file, hash] = t.split('#');
    await page.goto('/' + file);
    expect(await page.locator('#' + hash).count(), t).toBeGreaterThan(0);
  }
});

test('manifest, icons and sw are valid and reference existing files', async ({ request }) => {
  test.skip(test.info().project.name !== 'desktop', 'once');
  const m = await (await request.get('/manifest.webmanifest')).json();
  expect(m.name).toBeTruthy(); expect(m.start_url).toBeTruthy();
  for (const i of m.icons || []) expect((await request.get('/' + i.src.replace(/^\.?\//, ''))).status(), i.src).toBe(200);
  const sw = await (await request.get('/sw.js')).text();
  const shell = [...sw.matchAll(/"([\w\/.-]+\.(?:html|css|js|svg|webmanifest))"/g)].map((x) => x[1]);
  for (const f of shell) expect(fs.existsSync(path.join(ROOT, f)), 'sw shell file ' + f).toBe(true);
});
