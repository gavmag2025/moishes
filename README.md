# Moishes Online (demo)

**Live demo:** https://gavmag2025.github.io/moishes/

A free, static e-commerce demo for a Johannesburg kosher butchery and deli: browse by category, add weighted
cuts or packs to a cart, pick delivery or collection, and send the order by WhatsApp. It is built to show the
shop what online ordering could look like.

> **Demo only.** All products, prices, banking details, delivery fees and certificates are placeholder data.
> This project is not affiliated with, endorsed by, or approved by Moishes Butchery & Deli or any kashrut authority.

Live URL (after deploy): https://gavmag2025.github.io/moishes/

## Run locally

No build step and no runtime dependencies. Any static server works:

```bash
cd moishes
python3 -m http.server 8080
# open http://localhost:8080/
```

(Opening `index.html` directly also mostly works, but the service worker needs http://localhost.)

## Structure

```
index.html shop.html product.html cart.html checkout.html
confirmation.html orders.html admin.html about.html kashrut.html contact.html 404.html
css/          styles
js/           store.js (localStorage), rules.js (Shabbos/cut-off/weights/totals), catalog.js, cart.js, checkout.js ...
data/config.js    shop details, delivery zones, cut-off times, Yom Tov dates, payment methods, Pesach switch
data/products.js  the product catalogue
assets/       logo and product art (SVG)
sw.js manifest.webmanifest   offline shell / installable web app
tests/        automated tests (not deployed)
docs/         spec, style guide, deploy, going-live and pitch notes (not deployed)
.github/workflows/pages.yml   test + deploy to GitHub Pages
```

## How orders work with no backend

There is no server. At checkout the browser:

1. validates the cart against the rules (Thursday 14:00 Erev Shabbos cut-off, no Shabbos/Yom Tov slots, zone minimums);
2. saves the order in this browser's `localStorage` and shows a reference like `MOI-xxxxx`;
3. builds a pre-filled WhatsApp message (`wa.me` link) the customer sends to the shop number.

The shop receives the order as a WhatsApp message. `orders.html` and `admin.html` only show orders stored in
the same browser, so they are demo views, not a real order system. Weighted items are estimates; the final
invoice is meant to be confirmed after weighing (see `docs/GOING-LIVE.md`).

## Edit products and config

- Products: edit `data/products.js` (fields: `id`, `name`, `category`, `price`, `unit` `kg` or `each`, `kosher`
  `Meat` or `Pareve`, `tags`, `art`, `featured`, `pesach`, `stock`, `badge`). Schema is in `docs/SPEC.md`.
- Shop details, WhatsApp number, delivery zones, cut-off, Yom Tov closures, payment options and the Pesach
  switch: edit `data/config.js`.
- Commit to `main`; the workflow redeploys automatically.

## Deploy

See [docs/DEPLOY.md](docs/DEPLOY.md). Short version: Settings > Pages > Source: GitHub Actions, then push to `main`.

## Cost

R0. GitHub Pages and Actions are free for public repositories, there are no servers, and no paid services
are used. Optional later costs are listed in [docs/DEPLOY.md](docs/DEPLOY.md).

## More docs

[docs/PITCH.md](docs/PITCH.md) | [docs/GOING-LIVE.md](docs/GOING-LIVE.md) | [docs/DEPLOY.md](docs/DEPLOY.md)
