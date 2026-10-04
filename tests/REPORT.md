# QA & Accessibility Report

Run: `npm test` (node unit tests, then Playwright at mobile 390x844 and desktop 1280x800). `SHOTS=1 npx playwright test screenshots.spec.js` writes screenshots to `tests/screenshots/` (gitignored) for visual review.

## Results (last full run)
- Unit (node --test): 29/29 pass: rules.js (Thursday 14:00 cutoff, no Saturday, Yom Tov, 3h lead, fees/minimum/free threshold, VAT, kg step, SA phone, whatsappText) and data integrity (unique ids, art files, categories, no dairy words, bakery Pareve, meat Meat, prices, Pesach filter).
- Playwright: ~230 tests across both viewports; everything passes except the 3 items under "Open blockers" which come from another agent's uncommitted photo work, plus 1 contrast fix verified after the full run (a11y spec re-run 31/31 on desktop).
- axe (wcag2a/aa/21a/21aa + best-practice): zero serious/critical on all 12 pages, light and dark, plus drawer, checkout-error and mobile-menu states. Moderate only: heading-order on shop.
- Page weight: home ~200 KB, shop ~215 KB (same-origin), all well under budget; scripts deferred, product images lazy with width/height.

## Bugs found and fixed (qa-fix)
1. Bobotie description said "custard topping" and cake name/desc said "Cheesecake-Style ... creamy": dairy wording in a no-dairy shop. Reworded.
2. Dark mode: selected filter chip count and selected day chip weekday failed AA contrast; dark primary-hover (#CC4660) failed AA on the basket button. Fixed.
3. Keyboard: pressing Add to basket (or stepping a card to 0) dropped focus to body. Focus now moves to the stepper "+" / back to Add.
4. Mobile card stepper buttons shrank to ~30px; now 40px minimum and the input flexes.
5. Checkout error summary was a cramped two-column flex row on phones; now stacked.
6. Basket drawer: toasts covered the Checkout button; footer note hidden on phones so more lines stay visible.
7. Checkout: "Full name" input was stretched taller than neighbouring phone input.
8. Shop filter toolbar was sticky and ~45% of a phone viewport; now scrolls away.

## Open blockers (not mine, uncommitted work by another agent at time of testing)
- Photo switch (js/ui.js `art()`, HTML og:image/hero) points at `assets/photos/*.jpg` which do not exist: every page logs 404 console errors and the link crawl fails. Either commit the photos or revert. The suite is strict by default; `QA_ALLOW_MISSING_PHOTOS=1` tolerates these 404s (SVG fallback works).
- Footer link `about.html#photo-credits` has no target on about.html.

## Remaining risks
- Many products share one illustration (91 products, 35 art keys); looks repetitive in lists.
- sw.js shell omits admin.html/js/admin.js (offline admin only).
- Yom Tov dates, hours, prices are demo data; verify with luach before real use.
- Python http.server does not serve 404.html for unknown URLs (GitHub Pages does); 404 page is tested directly.
- Admin page has no auth by design (demo).
- Slot logic uses SAST fixed offset; correct for South Africa (no DST).
