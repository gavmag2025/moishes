# Moishes - Style Guide & Component Vocabulary

Warm, trustworthy, premium-but-friendly kosher butchery and deli market. Pomegranate burgundy, parchment cream, brass accents, charcoal text, herb green for Pareve. Serif display (Fraunces) over clean sans (DM Sans). Mobile-first, WCAG AA, dark mode via `prefers-color-scheme`.

Files: `css/tokens.css` -> `base.css` -> `components.css` -> `pages.css` (load in that order). `assets/logo.svg`, `assets/logo-light.svg`, `assets/favicon.svg`, `assets/icons.svg`, `assets/art/<artKey>.svg` (35, 600x450).

## 1. `<head>` boilerplate (copy exactly)
```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Frank+Ruhl+Libre:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/pages.css">
```
Fonts degrade gracefully: every stack has system fallbacks (Georgia/Palatino, system-ui), so the site works offline/without the link. `<html lang="en-ZA">`. Hebrew spans: `<span class="he" lang="he" dir="rtl">בס״ד</span>` (Frank Ruhl Libre, RTL isolated).

Icons: inline sprite via `<svg class="icon" aria-hidden="true"><use href="assets/icons.svg#cart"/></svg>`. Needs http(s) (GitHub Pages ok; not `file://`). Ids: cart menu close search phone whatsapp truck check clock pin shield leaf info alert trash plus minus arrow star calendar. Icon-only buttons need `aria-label`.

Theme: automatic. Force with `<html data-theme="light|dark">` (optional toggle). State classes are `.is-open .is-active .is-visible .is-current .is-done .is-out .is-bump`; ARIA attributes (`aria-pressed`, `aria-expanded`, `aria-current`) drive chips, nav, steps.

Art: `<img src="assets/art/${product.art}.svg" alt="" width="600" height="450" loading="lazy">` (decorative; the product name is adjacent text). 

## 2. Tokens (css/tokens.css)
| Group | Tokens |
|---|---|
| Brand | `--burgundy-900..500,100`, `--brass-700` (text), `--brass-500` (decor), `--brass-400`, `--brass-200`, `--herb-700/600/100`, `--char-900/700/500` |
| Semantic (auto dark) | `--bg --bg-alt --surface --surface-2 --ink --ink-2 --line --line-strong --primary --primary-hover --primary-ink --primary-text --primary-soft --accent --accent-ink --accent-soft --pareve --pareve-bg --meat --meat-bg --success --danger --focus --overlay` |
| Type | `--font-display --font-body --font-hebrew`, `--fs-xs/sm/base/md/lg/xl/2xl` (fluid), `--lh-tight/body` |
| Space | `--s-1..8` (4px base), `--gutter` (16/24/32), `--container` 76rem |
| Shape/depth | `--r-sm 8 --r-md 14 --r-lg 22 --r-pill`, `--shadow-1/2/3` |
| Motion | `--ease`, `--t-fast 140ms`, `--t-med 260ms` (all neutralised by `prefers-reduced-motion`) |
| Sizing | `--tap: 44px`, `--header-h` |
| Motif | `--motif` (fine diamond lattice strip), `--pattern` (faint lattice tile) |

Rules: never hard-code colours in pages; use `--primary-text` (not `--primary`) for text in brand colour; `--ink-2` for secondary text (AA 7:1). Verified AA pairs: ink/bg 13.9, ink-2/bg 7.4, button 10.9, brass-700/bg 6.2, pareve 5.4, meat 9.3, dark button 5.5, dark primary-text 6.4. Focus ring 3px `--focus` everywhere via `:focus-visible`. Inputs are 16px (no iOS zoom). All tap targets >= 44px.

## 3. Utilities (base.css)
`.container` `.section` `.section--alt` `.section--pattern` `.stack` (`--stack` var) `.cluster` `.grid` (`--gap`) `.sec-head` `.eyebrow` `.motif-rule` `.muted` `.num` `.price` `.text-sm` `.visually-hidden` `.skip-link` `.he` `.no-scroll` (put on `<body>` while drawer/menu open).

Page skeleton:
```html
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <!-- announce bar, header, mobile menu -->
  <main id="main"> ... </main>
  <!-- footer, drawer, toast-region -->
</body>
```

## 4. Components

### Announcement bar (Shabbos cutoff)
```html
<div class="announce" role="region" aria-label="Shabbos ordering notice"><div class="announce__inner">
  <p class="announce__text"><strong>Erev Shabbos:</strong> order by Thursday 14:00 · <span class="he" lang="he" dir="rtl">שבת שלום</span></p>
</div></div>
```
Closed/Yom Tov variant: add `announce--closed`.

### Header, nav, mobile menu, cart button
```html
<header class="site-header"><div class="container site-header__bar">
  <button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Menu"><span class="nav-toggle__bars"></span></button>
  <a class="brand" href="index.html">
    <img class="brand__mark" src="assets/favicon.svg" alt="" width="40" height="40">
    <span class="brand__text"><span class="brand__name">Moishes</span><span class="brand__sub">Kosher Butchery &amp; Deli</span></span>
    <span class="bsd he" lang="he" dir="rtl">בס״ד</span>
  </a>
  <nav class="nav" aria-label="Main"><a class="nav__link" href="shop.html" aria-current="page">Shop</a> ...</nav>
  <div class="header-actions">
    <button class="cart-btn" type="button" aria-label="Open basket, 3 items"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#cart"/></svg><span class="cart-btn__label">Basket</span><span class="cart-btn__count" data-count="3">3</span></button>
  </div>
</div><span class="motif-bar" aria-hidden="true"></span></header>
<div class="mobile-menu" id="mobile-menu">  <!-- toggle .is-open; set aria-expanded on the button -->
  <ul class="mobile-menu__list"><li><a class="mobile-menu__link" href="shop.html" aria-current="page">Shop</a></li></ul>
  <div class="mobile-menu__foot"><a class="btn btn--whatsapp" href="https://wa.me/...">Order on WhatsApp</a></div>
</div>
```
Header is sticky. Nav shows from 62em; below that the hamburger + mobile menu. After updating the count add `.is-bump` to `.cart-btn` for 400ms; `data-count="0"` renders an outlined empty pill. The brass `.bsd` shows at >= 62em.

### Hero
```html
<section class="hero"><div class="container hero__inner">
  <div class="hero__copy">
    <span class="eyebrow">Glenhazel · Mehadrin</span>
    <h1 class="hero__title">Fresh kosher meat, <em>delivered</em> before Shabbos</h1>
    <p class="hero__lead">...</p>
    <div class="hero__cta"><a class="btn btn--primary btn--lg" href="shop.html">Shop the butchery</a><a class="btn btn--secondary btn--lg" href="#">Shabbos packs</a></div>
    <ul class="hero__facts"><li><svg class="icon"><use href="assets/icons.svg#shield"/></svg>Mehadrin</li></ul>
  </div>
  <div class="hero__art"><div class="hero__arch"><img src="assets/art/shabbos-box.svg" alt=""></div>
    <div class="hero__chip hero__chip--a"><img src="assets/art/challah.svg" alt=""></div><div class="hero__chip hero__chip--b"><img src="assets/art/steak.svg" alt=""></div></div>
</div></section>
```
Followed by an optional trust strip: `<section class="trust-strip"><ul class="trust-strip__list"><li class="trust-item"><svg class="icon">..</svg><span>Mehadrin<small>Commission kosher</small></span></li></ul></section>`.

### Section header + category tiles
```html
<section class="section"><div class="container">
  <div class="sec-head"><div><span class="eyebrow">Browse</span><h2>Shop by category</h2></div><a class="btn btn--text" href="shop.html">View all</a></div>
  <ul class="cat-grid"><li><a class="cat-tile" href="shop.html?cat=beef"><img class="cat-tile__art" src="assets/art/beef-ribs.svg" alt="" loading="lazy"><span class="cat-tile__body"><span class="cat-tile__name">Beef</span><span class="cat-tile__count">12 items</span></span></a></li></ul>
</div></section>
```
2 columns on phones, 3 from 40em.

### Badges
`<span class="badge badge--meat">Meat</span>` `badge--pareve` `badge--mehadrin` `badge--popular` `badge--special` (Shabbos Special) `badge--new` `badge--out`. Meat/Pareve always show text plus a distinct shape (dot vs diamond), never colour alone. Map `product.kosher` -> meat/pareve; `product.tags` includes "Mehadrin" -> mehadrin; `product.badge` -> popular/special/new.

### Product card + grid
```html
<ul class="product-grid">
 <li><article class="product-card">           <!-- add .is-out when stock=false -->
  <a class="product-card__media" href="product.html?id=beef-short-ribs" tabindex="-1" aria-hidden="true">
    <img src="assets/art/beef-ribs.svg" alt="" width="600" height="450" loading="lazy">
    <span class="badge badge--popular product-card__flag">Popular</span>
  </a>
  <div class="product-card__body">
    <div class="product-card__badges"><span class="badge badge--meat">Meat</span><span class="badge badge--mehadrin">Mehadrin</span></div>
    <h3 class="product-card__title"><a href="product.html?id=beef-short-ribs">Beef Short Ribs</a></h3>  <!-- ::after stretches link over whole card -->
    <p class="product-card__desc">...</p><p class="product-card__pack">~1kg pack</p>
    <p class="product-card__price"><span class="price">R189.90</span><span class="unit">/ kg</span></p>
    <div class="product-card__actions">
      <button class="btn btn--primary btn--block" type="button" data-add="beef-short-ribs">Add to basket</button>
      <!-- once in cart, swap the button for a .qty stepper -->
    </div>
  </div></article></li>
</ul>
```
2 / 3 / 4 columns (phone / 48em / 72em). `.product-card__desc` is hidden on phones. `.product-card__actions` sits above the stretched link (z-index) so buttons stay clickable.

### Qty stepper
```html
<div class="qty" role="group" aria-label="Quantity of Beef Short Ribs">
  <button class="qty__btn" type="button" aria-label="Decrease">&minus;</button>
  <input class="qty__input" inputmode="decimal" value="1.5" aria-label="Quantity in kg">
  <span class="qty__unit">kg</span>   <!-- optional, kg items -->
  <button class="qty__btn" type="button" aria-label="Increase">+</button>
</div>
```
Step 0.5 for kg, 1 for each (JS). Minus button gets `disabled` at min.

### Buttons
`.btn` + `btn--primary` (default) `--secondary` `--ghost` `--gold` `--whatsapp` `--text`; sizes `btn--sm` `btn--lg`; `btn--block` full width; disabled via `disabled` or `aria-disabled="true"`. `.icon-btn` for round icon-only controls (44px).

### Filters / sort / search toolbar
```html
<div class="toolbar toolbar--sticky">
  <div class="search"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#search"/></svg><label class="visually-hidden" for="q">Search</label><input id="q" class="input" type="search" placeholder="Search products"></div>
  <div class="chips" role="group" aria-label="Category"><button class="chip" type="button" aria-pressed="true">All <span class="chip__count">48</span></button><button class="chip" type="button" aria-pressed="false">Beef</button></div>
  <div class="toolbar__row"><p class="toolbar__count" aria-live="polite">48 products</p>
    <label class="visually-hidden" for="sort">Sort</label><select id="sort" class="select select--inline"><option>Featured</option></select></div>
</div>
```
Chips scroll horizontally on phones and wrap on desktop.

### Alerts
`<div class="alert [alert--info|alert--danger|alert--success]"><svg class="icon">..</svg><p>Message</p></div>`. Use for Pesach mode, closed days, minimum order not met.

### Forms
```html
<div class="form-grid form-grid--2">
  <div class="field"><label class="field__label" for="name">Full name <span class="req">*</span></label><input id="name" class="input" autocomplete="name"><p class="field__hint">Optional hint</p><p class="field__error" id="name-err">Required</p></div>
  <div class="field span-2"><label class="field__label" for="sub">Suburb</label><select id="sub" class="select">...</select></div>
</div>
```
Error state: add `.has-error` to `.field` and `aria-invalid="true"`/`aria-describedby` on the control. Also `.textarea`, `.check` (`<label class="check"><input type="checkbox"> text</label>`).

Radio cards (payment, fulfilment):
```html
<fieldset class="choice-list"><legend class="visually-hidden">Payment</legend>
  <label class="choice"><input class="choice__input" type="radio" name="pay" value="eft" checked>
    <span class="choice__box"><span class="choice__title">EFT</span><span class="choice__desc">Banking details after you order</span><span class="choice__aside">Free</span></span></label>
</fieldset>
```
The input must come directly before `.choice__box`. `disabled` is styled.

### Cart drawer
```html
<div class="drawer" id="cart-drawer">           <!-- toggle .is-open; add .no-scroll to body; focus-trap + Esc in JS -->
  <div class="drawer__overlay" data-close></div>
  <aside class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
    <header class="drawer__head"><h2 id="drawer-title">Your basket</h2><button class="icon-btn" type="button" data-close aria-label="Close basket"><svg class="icon"><use href="assets/icons.svg#close"/></svg></button></header>
    <div class="drawer__body"><ul class="cart-lines">
      <li class="cart-line"><img class="cart-line__img" src="assets/art/beef-ribs.svg" alt="">
        <div><p class="cart-line__title">Beef Short Ribs</p><p class="cart-line__meta">R189.90 / kg</p></div><span class="cart-line__total">R284.85</span>
        <div class="cart-line__controls"><div class="qty">...</div><button class="cart-line__remove" type="button">Remove</button></div></li>
    </ul></div>
    <footer class="drawer__foot">
      <div class="free-ship">Add R89 more for free delivery<span class="free-ship__bar" style="--pct:70%"><span></span></span></div>
      <dl class="totals"><div class="totals__row totals__row--grand"><dt>Subtotal</dt><dd>R360.85</dd></div></dl>
      <a class="btn btn--primary btn--block" href="checkout.html">Checkout</a>
    </footer>
  </aside>
</div>
```
Closed drawer is `visibility:hidden` so it is out of the tab order.

### Totals (shared)
`<dl class="totals"><div class="totals__row"><dt>Subtotal</dt><dd>R..</dd></div> ... <div class="totals__row totals__row--grand"><dt>Total</dt><dd>R..</dd></div></dl>`

### Cart page table (becomes stacked cards on phones)
```html
<table class="cart-table"><caption class="visually-hidden">Your basket</caption>
 <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th><th><span class="visually-hidden">Remove</span></th></tr></thead>
 <tbody><tr>
  <td class="cart-table__product"><div class="cart-table__prod-inner"><img class="cart-table__img" src="assets/art/steak.svg" alt=""><div><strong>Steak</strong><br><span class="muted text-sm">Meat</span></div></div></td>
  <td data-label="Price">R219.00 / kg</td>
  <td data-label="Qty"><div class="qty">...</div></td>
  <td data-label="Total">R328.50</td>
  <td data-label="Remove"><button class="cart-line__remove" type="button">Remove</button></td>
 </tr></tbody></table>
```
Wrap the page in `.checkout-layout` with `.summary` (see pages) and optionally `.sticky-cta` (mobile bottom bar) + `.has-sticky-cta` on `<main>`.

### Checkout: steps, panels, slot picker
```html
<ol class="steps"><li class="step is-done">Basket</li><li class="step is-current" aria-current="step">Details</li><li class="step">Delivery</li><li class="step">Confirm</li></ol>
<section class="panel"><h2 class="panel__title"><span class="num-dot">1</span>Your details</h2> ...form... </section>

<div class="slot-picker">
  <div class="day-chips" role="group" aria-label="Delivery day">
    <button class="day-chip" type="button" aria-pressed="true"><span class="day-chip__dow">Thu</span><span class="day-chip__date">8 Oct</span></button>
    <button class="day-chip" type="button" disabled><span class="day-chip__dow">Sat</span><span class="day-chip__date">10 Oct</span></button>  <!-- Shabbos / Yom Tov -->
  </div>
  <fieldset class="slot-fieldset"><legend class="visually-hidden">Time slot</legend><div class="slot-grid">
    <label class="slot"><input class="slot__input" type="radio" name="slot" value="fri-0900"><span class="slot__label">09:00 - 11:00<span class="slot__note">Last Shabbos slot</span></span></label>
    <label class="slot"><input class="slot__input" type="radio" name="slot" disabled><span class="slot__label">13:00 - 15:00</span></label>
  </div></fieldset>
</div>
```
Unavailable days/slots: `disabled` (struck-through, dimmed). Summary card: `<aside class="summary"><h2>Order summary</h2><ul class="summary__lines"><li><span>Item</span><span class="num">R..</span></li></ul><dl class="totals">..</dl><button class="btn btn--primary btn--block btn--lg">Place order</button></aside>`.

### Order confirmation
```html
<section class="confirm panel">
  <div class="confirm__seal"><svg class="icon"><use href="assets/icons.svg#check"/></svg></div>
  <h1>Todah rabbah!</h1><p>Your order has been received.</p>
  <div class="confirm__ref" aria-label="Order reference">MOI-48213</div>
  <div class="confirm__summary"><ul class="summary-list"><li><span>Delivery</span><span>Fri 9 Oct, 09:00 - 11:00</span></li></ul></div>
  <div class="confirm__actions"><a class="btn btn--whatsapp" href="https://wa.me/..">Send order via WhatsApp</a><a class="btn btn--secondary" href="shop.html">Keep shopping</a></div>
</section>
```

### FAQ accordion (native `<details>`, no JS)
```html
<div class="faq"><details class="faq__item"><summary class="faq__q">When is the Friday cut-off?</summary><div class="faq__a"><p>Thursday 14:00.</p></div></details></div>
```

### Footer
```html
<footer class="site-footer"><span class="motif-bar" aria-hidden="true"></span><div class="container">
  <div class="footer-grid">
    <div class="footer-brand"><img src="assets/logo-light.svg" alt="Moishes Kosher Butchery &amp; Deli" width="330" height="92"><p class="footer-muted">3 Birt St, Raedene Estate, Glenhazel</p></div>
    <div><h2 class="footer-title">Shop</h2><ul class="footer-links"><li><a href="shop.html">All products</a></li></ul></div>
  </div>
  <div class="footer-legal"><span>© 2026 Moishes</span><span class="demo-note">Demo site - dummy products and prices</span></div>
</div></footer>
```
Always use `logo-light.svg` on dark surfaces (footer). `logo.svg` auto-switches with dark mode when used on the page background (e.g. About page, print).

### Toast
```html
<div class="toast-region" aria-live="polite">   <!-- one, in every page -->
  <div class="toast toast--success" role="status"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#check"/></svg><span>Beef Short Ribs added</span><button class="toast__action" type="button">Undo</button></div>
</div>
```
Append, then add `.is-visible` next frame; remove after ~3.5s. Variants `toast--success`, `toast--error`.

### Skeleton
`<span class="skeleton skeleton--title"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--media"></span><span class="skeleton skeleton--btn"></span>` inside a `.product-card` for loading cards (give the wrapper `aria-busy="true"`).

### Empty state
```html
<div class="empty"><img class="empty__art" src="assets/art/generic-meat.svg" alt=""><h2 class="empty__title">Your basket is empty</h2><p class="empty__text">Start with a Shabbos pack.</p><a class="btn btn--primary" href="shop.html">Shop now</a></div>
```
Use for empty basket, no search results (swap art for `generic-meat`), and no-orders.

## 5. Page-level helpers (pages.css)
`.page-head` (+ `.breadcrumb`), `.trust-strip`, `.shop`, `.pesach-banner`, `.pdp` (`__media __title __badges __price __buy __tags`, `.tag`), `.checkout-layout` + `.checkout-main` + `.summary` (sticky on desktop), `.sticky-cta` (`__total`) + `.has-sticky-cta`, `.info-grid` / `.info-card`, `.hours` table, `.zone-list`, `.prose`, `.callout` (WhatsApp/catering band).

Product detail skeleton:
```html
<div class="container pdp"><div class="pdp__media"><img src="assets/art/steak.svg" alt="Grilled steak illustration"></div>
 <div><div class="pdp__badges">..badges..</div><h1 class="pdp__title">Rib-eye Steak</h1><p class="pdp__price"><span class="price">R219.00</span><span class="unit muted">/ kg</span></p>
  <p>Description</p><ul class="pdp__tags"><li class="tag">Braai</li></ul>
  <div class="pdp__buy"><div class="qty">..</div><button class="btn btn--primary btn--lg btn--block">Add to basket</button></div></div></div>
```

## 6. Illustration style (assets/art)
One consistent flat style: tinted backdrop with soft halo circle, plate/board/bowl with soft ground shadow, no outlines, two to three tones per object (base, shade, highlight), rosemary sprig accent. Never any dairy. Keys: beef-ribs lamb-ribs lamb-chops steak brisket roast-beef stew mince burger sausage boerewors chicken-whole chicken-pieces chicken-wings schnitzel roast-chicken turkey biltong droewors polony salami pastrami challah rolls chocolate-cake cake-layer rugelach kugel chicken-soup hummus salad cholent shabbos-box catering-platter generic-meat. Use `object-fit: cover` for any crop (all components do).

## 7. Accessibility checklist for the Engineer
- One `<h1>` per page; skip link; `aria-current="page"` on nav; landmarks (`header nav main footer`).
- Drawer and mobile menu: set `aria-expanded`, trap focus, close on Esc, restore focus; add `.no-scroll` to body.
- Announce cart changes via the toast region (`aria-live`) and update `cart-btn` `aria-label`.
- Do not rely on colour alone: badges include text; disabled slots are struck through.
- All motion respects `prefers-reduced-motion` automatically.
