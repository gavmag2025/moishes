# Moishes Online – Build Contract (all agents read this first)

Stack: 100% free. Static site (vanilla HTML/CSS/JS, no build step, no npm deps at runtime), cart in localStorage,
hosted free on GitHub Pages. Tests: Playwright (dev only, preinstalled chromium at /opt/pw-browsers).
Currency ZAR (R), prices VAT-inclusive. Pages are relative-path so they work under /repo-name/ on GitHub Pages.
NOT the real shop's data: all products/prices are DUMMY demo data. Show a small "Demo" footer note.

## Business facts (sourced)
Moishes Butchery & Deli, 3 Birt St (cnr George Ave), Raedene Estate, Glenhazel area, Johannesburg.
Mehadrin-Commission Kosher butchery & deli: meat, poultry, challah, hummus, cooked chicken, kugels,
packed meals, catering, home delivery. Phone placeholders: 011 485 4513. Do NOT invent real certificates.

## Kosher/JHB rules the site must honour
- All meat/poultry = fleishig (meat). Everything in store is meat or pareve; NO dairy sold. Bakery is pareve.
  Each product has `kosher: "Meat" | "Pareve"`. Never suggest dairy pairings.
- Shabbos/Yom Tov: no ordering/delivery on Shabbos. Orders for Friday must be placed by Thursday 14:00 (config).
  No delivery slots on Saturday; Friday slots end 13:00 (winter) – config driven. Closed on Yom Tov dates (config list).
- Pre-Shabbos rush: banner "Order by Thursday 14:00 for Erev Shabbos".
- Hebrew touches: "בס״ד" in header, "Shabbat Shalom", "Chag Sameach" greeting by date. Correct RTL for Hebrew spans.
- Pesach mode toggle (config.pesach=false by default): when true show only products with pesach:true.
- Weighted meat: sold per kg (`unit:"kg"`), step 0.5kg; packs sold `unit:"each"`.
- Delivery zones: Glenhazel, Raedene, Sandringham, Highlands North, Savoy Estate, Sydenham, Orchards, Norwood,
  Waverley, Observatory? (use fee + minimum order per zone in config).
- Payment (free): EFT (banking details placeholder), Cash/Card on delivery, "Pay at collection", PayFast sandbox
  placeholder (disabled). Order is also sent via WhatsApp deep-link (wa.me) as free order channel + saved to localStorage
  "orders" and shows an order reference MOI-xxxxx. No backend.

## Files & owners
data/config.js   (Catalog)  -> window.MOISHES_CONFIG
data/products.js (Catalog)  -> window.MOISHES_PRODUCTS  array
css/*.css, assets/logo.svg, assets/art/<artKey>.svg, docs/STYLEGUIDE.md (Design)
*.html, js/*.js (Engineer)
tests/*, playwright.config.js (QA)
.github/workflows/pages.yml, README.md, docs/PITCH.md (DevOps)

## Product schema
{ id:"beef-short-ribs", name:"Beef Short Ribs", category:"beef", price:189.9, unit:"kg"|"each", pack:"~1kg" (optional),
  desc:"...", kosher:"Meat"|"Pareve", tags:["Mehadrin","Shabbos","Braai","Pas Yisroel"], art:"<artKey>",
  featured:true|false, pesach:false, stock:true, badge:"New"|"Popular"|"Shabbos Special"|null }

Categories (id : label): beef:"Beef", lamb:"Lamb", poultry:"Chicken & Poultry", mince-burgers:"Mince, Burgers & Sausages",
deli:"Deli & Biltong", ready-meals:"Hot Food & Ready Meals", bakery:"Challah, Rolls & Cakes", pantry:"Salads, Dips & Pantry",
shabbos-packs:"Shabbos Packs & Catering".

## artKey list (Design draws one SVG each, 600x450 viewBox, same visual style; Catalog must only use these)
beef-ribs, lamb-ribs, lamb-chops, steak, brisket, roast-beef, stew, mince, burger, sausage, boerewors, chicken-whole,
chicken-pieces, chicken-wings, schnitzel, roast-chicken, turkey, biltong, droewors, polony, salami, pastrami, challah,
rolls, chocolate-cake, cheesecake-style-pareve-cake (name it "cake-layer"), rugelach, kugel, chicken-soup, hummus, salad,
cholent, shabbos-box, catering-platter, generic-meat

## Cart/storage keys
localStorage: moishes.cart.v1 (array of {id,qty}), moishes.orders.v1, moishes.customer.v1
