/* ui.js - shared chrome: header, footer, announce bar, cart drawer, toasts, steppers, product cards. */
(function (root) {
  var doc = root.document, F = root.MoishesFormat, R = root.MoishesRules, S = root.MoishesStore, C = root.MoishesCatalog, cfg = root.MOISHES_CONFIG;
  var esc = F.esc, money = F.money;
  var page = (doc.body && doc.body.getAttribute("data-page")) || "";

  function icon(id, cls) { return '<svg class="icon' + (cls ? " " + cls : "") + '" aria-hidden="true"><use href="assets/icons.svg#' + id + '"/></svg>'; }
  function art(p) { return "assets/art/" + encodeURIComponent(p.art || "generic-meat") + ".svg"; }
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function now() { return new Date(); }

  /* ---------- cart data ---------- */
  function cartLines() {
    var vis = {}; C.visible().forEach(function (p) { vis[p.id] = 1; });
    return S.getCart().map(function (l) {
      var p = C.get(l.id);
      if (!p || !vis[p.id]) return null;
      return { product: p, id: p.id, qty: l.qty, price: p.price, unit: p.unit, total: R.lineTotal(p.price, l.qty) };
    }).filter(Boolean);
  }
  function cartCount() { return cartLines().length; }

  /* ---------- badges / cards / stepper ---------- */
  function badges(p, withKosher) {
    var h = "";
    if (withKosher !== false) h += p.kosher === "Pareve" ? '<span class="badge badge--pareve">Pareve</span>' : '<span class="badge badge--meat">Meat</span>';
    if ((p.tags || []).indexOf("Mehadrin") >= 0) h += '<span class="badge badge--mehadrin">Mehadrin</span>';
    return h;
  }
  function flag(p) {
    if (p.stock === false) return '<span class="badge badge--out product-card__flag">Out of stock</span>';
    if (!p.badge) return "";
    var cls = p.badge === "New" ? "new" : p.badge === "Popular" ? "popular" : "special";
    return '<span class="badge badge--' + cls + ' product-card__flag">' + esc(p.badge) + "</span>";
  }
  function priceHTML(p) { return '<span class="price">' + money(p.price) + '</span><span class="unit">' + (p.unit === "kg" ? "/ kg" : "each") + "</span>"; }

  function productCard(p) {
    var href = "product.html?id=" + encodeURIComponent(p.id);
    return '<li><article class="product-card' + (p.stock === false ? " is-out" : "") + '">' +
      '<a class="product-card__media" href="' + href + '" tabindex="-1" aria-hidden="true"><img src="' + art(p) + '" alt="" width="600" height="450" loading="lazy">' + flag(p) + "</a>" +
      '<div class="product-card__body"><div class="product-card__badges">' + badges(p) + "</div>" +
      '<h3 class="product-card__title"><a href="' + href + '">' + esc(p.name) + "</a></h3>" +
      '<p class="product-card__desc">' + esc(p.desc) + "</p>" +
      (p.pack ? '<p class="product-card__pack">' + esc(p.pack) + (p.unit === "kg" ? " pack" : "") + "</p>" : "") +
      '<p class="product-card__price">' + priceHTML(p) + "</p>" +
      '<div class="product-card__actions" data-actions="' + esc(p.id) + '"></div></div></article></li>';
  }
  function stepperHTML(p, q, opts) {
    opts = opts || {};
    var step = R.qtyStep(p.unit, cfg), min = opts.zero ? 0 : step;
    var id = esc(p.id), fk = opts.fk || "q";
    return '<div class="qty" role="group" aria-label="Quantity of ' + esc(p.name) + '">' +
      '<button class="qty__btn" type="button" data-qty-id="' + id + '" data-dir="-1"' + (opts.zero ? ' data-zero="1"' : "") + ' data-fk="' + fk + ":" + id + ':dec" aria-label="Decrease quantity of ' + esc(p.name) + '"' + (q <= min && !opts.zero ? " disabled" : "") + ">&minus;</button>" +
      '<input class="qty__input" inputmode="decimal" data-qty-id="' + id + '" data-fk="' + fk + ":" + id + ':in" value="' + F.num(q) + '" aria-label="Quantity of ' + esc(p.name) + (p.unit === "kg" ? " in kg" : "") + '">' +
      (p.unit === "kg" ? '<span class="qty__unit">kg</span>' : "") +
      '<button class="qty__btn" type="button" data-qty-id="' + id + '" data-dir="1" data-fk="' + fk + ":" + id + ':inc" aria-label="Increase quantity of ' + esc(p.name) + '">+</button></div>';
  }
  function renderActions(el) {
    var p = C.get(el.getAttribute("data-actions")); if (!p) return;
    var q = S.qtyOf(p.id);
    if (p.stock === false) el.innerHTML = '<button class="btn btn--secondary btn--block" type="button" disabled>Out of stock</button>';
    else if (q > 0) el.innerHTML = stepperHTML(p, q, { zero: true, fk: "card" });
    else el.innerHTML = '<button class="btn btn--primary btn--block" type="button" data-add="' + esc(p.id) + '" data-fk="card:' + esc(p.id) + ':add" aria-label="Add ' + esc(p.name) + ' to basket">Add to basket</button>';
  }
  function refreshActions() { $$("[data-actions]").forEach(renderActions); }

  /* keep keyboard focus stable across re-renders */
  function keepFocus(fn) {
    var a = doc.activeElement, fk = a && a.getAttribute && a.getAttribute("data-fk"), pos = a && a.selectionStart;
    fn();
    if (fk) { var n = $('[data-fk="' + fk.replace(/"/g, "") + '"]'); if (n && !n.disabled) { n.focus(); } else if (fk.indexOf(":dec") > 0 || fk.indexOf(":inc") > 0 || fk.indexOf(":in") > 0) { /* control vanished: a card stepper dropping to 0 gives way to its Add button, so focus that */ var m = /^(card:.+):(dec|inc|in)$/.exec(fk), ab = m && $('[data-fk="' + m[1].replace(/"/g, "") + ':add"]'); if (ab) ab.focus(); } }
  }

  /* ---------- toasts ---------- */
  function toast(msg, o) {
    o = o || {};
    var region = $(".toast-region"); if (!region) return;
    var t = doc.createElement("div");
    t.className = "toast toast--" + (o.type || "success"); t.setAttribute("role", "status");
    t.innerHTML = icon(o.type === "error" ? "alert" : "check") + "<span></span>" + (o.action ? '<button class="toast__action" type="button"></button>' : "");
    t.querySelector("span").textContent = msg;
    if (o.action) { var b = t.querySelector("button"); b.textContent = o.action.label; b.addEventListener("click", function () { o.action.fn(); kill(); }); }
    region.appendChild(t);
    root.requestAnimationFrame(function () { t.classList.add("is-visible"); });
    var timer = root.setTimeout(kill, o.ms || 3500);
    function kill() { root.clearTimeout(timer); t.classList.remove("is-visible"); root.setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300); }
    while (region.children.length > 3) region.removeChild(region.firstChild);
  }

  function addToCart(id, q, quiet) {
    var p = C.get(id); if (!p || p.stock === false) return false;
    if (cfg.pesach && !p.pesach) { toast("Not available in Pesach mode", { type: "error" }); return false; }
    q = q || R.qtyStep(p.unit, cfg);
    var prev = S.qtyOf(id);
    S.add(id, q);
    var nq = R.normalizeQty(S.qtyOf(id), p.unit, cfg); if (nq !== S.qtyOf(id)) S.setQty(id, nq);
    if (!quiet) toast(p.name + " added to basket", { action: { label: "Undo", fn: function () { S.setQty(id, prev); } } });
    return true;
  }

  /* ---------- global delegated handlers ---------- */
  doc.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-add],[data-qty-id][data-dir],[data-remove],[data-open-cart]") : null;
    if (!t) return;
    if (t.hasAttribute("data-add")) {
      /* the Add button is replaced by a stepper: move keyboard focus to its "+" so focus is not dropped to <body> */
      var hadFocus = doc.activeElement === t, fk = t.getAttribute("data-fk") || "";
      addToCart(t.getAttribute("data-add"));
      if (hadFocus && fk) { var inc = $('[data-fk="' + fk.replace(/:add$/, ":inc").replace(/"/g, "") + '"]'); if (inc) inc.focus(); }
      return;
    }
    if (t.hasAttribute("data-open-cart")) { openDrawer(t); return; }
    if (t.hasAttribute("data-remove")) {
      var rid = t.getAttribute("data-remove"), rp = C.get(rid), rq = S.qtyOf(rid);
      keepFocus(function () { S.remove(rid); });
      toast((rp ? rp.name : "Item") + " removed", { action: { label: "Undo", fn: function () { S.setQty(rid, rq); } } });
      return;
    }
    var id = t.getAttribute("data-qty-id"), p = C.get(id); if (!p) return;
    var dir = +t.getAttribute("data-dir"), step = R.qtyStep(p.unit, cfg), q = S.qtyOf(id);
    var next = Math.round((q + dir * step) * 1000) / 1000;
    var zero = t.hasAttribute("data-zero");
    if (next < step) { if (zero) next = 0; else return; }
    if (next > (p.unit === "kg" ? 50 : 99)) return;
    keepFocus(function () { S.setQty(id, next); });
  });
  doc.addEventListener("change", function (e) {
    var t = e.target; if (!t.matches || !t.matches("input.qty__input[data-qty-id]")) return;
    var p = C.get(t.getAttribute("data-qty-id")); if (!p) return;
    var raw = String(t.value).replace(",", ".");
    if (raw === "0") { keepFocus(function () { S.remove(p.id); }); return; }
    var n = R.normalizeQty(raw, p.unit, cfg);
    keepFocus(function () { S.setQty(p.id, n); t.value = F.num(n); });
  });

  /* ---------- header / footer ---------- */
  var NAV = [
    ["Shop", "shop.html", "shop"], ["Shabbos packs", "shop.html?cat=shabbos-packs", "shabbos"], ["Kashrut", "kashrut.html", "kashrut"],
    ["About", "about.html", "about"], ["Contact", "contact.html", "contact"], ["My orders", "orders.html", "orders"]
  ];
  function navHTML(kind) {
    var cat = new URLSearchParams(root.location.search).get("cat");
    return NAV.map(function (n) {
      var cur = n[2] === "shabbos" ? (page === "shop" && cat === "shabbos-packs") : n[2] === "shop" ? (page === "shop" && cat !== "shabbos-packs") : n[2] === page;
      var a = '<a class="' + (kind === "menu" ? "mobile-menu__link" : "nav__link") + '" href="' + n[1] + '"' + (cur ? ' aria-current="page"' : "") + ">" + n[0] + "</a>";
      return kind === "menu" ? "<li>" + a + "</li>" : a;
    }).join("");
  }
  function bannerHTML() {
    var b = R.bannerState(now(), cfg), g = b.greeting, cls = "announce" + (b.closed ? " announce--closed" : "");
    var he = '<span class="he" lang="he" dir="rtl">' + g.he + "</span>";
    var txt;
    if (b.kind === "yomtov" || b.kind === "shabbos") {
      txt = "<strong>" + esc(g.en) + "!</strong> " + esc(b.label) + (b.next ? ". Next orders: " + F.dateShort(b.next) : "");
    } else if (b.kind === "passed") {
      txt = "<strong>Erev Shabbos:</strong> cut-off has passed" + (b.next ? ". Next available: " + F.dateShort(b.next) : "");
    } else if (b.kind === "soon") {
      txt = "<strong>" + esc(b.label) + "</strong> (" + b.hoursLeft + "h " + b.minsLeft + "m left)";
    } else {
      txt = "<strong>" + esc(b.label) + "</strong>";
    }
    return '<div class="' + cls + '" role="region" aria-label="Shabbos ordering notice" data-banner="' + b.kind + '"><div class="announce__inner"><p class="announce__text">' + txt + " &middot; " + he + "</p></div></div>" +
      (cfg.pesach ? '<div class="announce" role="region" aria-label="Pesach mode"><div class="announce__inner"><p class="announce__text"><strong>Pesach mode:</strong> showing Pesach products only</p></div></div>' : "");
  }
  function headerHTML() {
    var wa = "https://wa.me/" + cfg.shop.whatsapp;
    return bannerHTML() +
      '<header class="site-header"><div class="container site-header__bar">' +
      '<button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Menu"><span class="nav-toggle__bars"></span></button>' +
      '<a class="brand" href="index.html"><img class="brand__mark" src="assets/favicon.svg" alt="" width="40" height="40"><span class="brand__text"><span class="brand__name">Moishes</span><span class="brand__sub">Kosher Butchery &amp; Deli</span></span><span class="bsd he" lang="he" dir="rtl">' + esc(cfg.shop.hebrewHeader) + "</span></a>" +
      '<nav class="nav" aria-label="Main">' + navHTML("nav") + "</nav>" +
      '<div class="header-actions"><button class="cart-btn" type="button" data-open-cart aria-haspopup="dialog" aria-controls="cart-drawer" aria-label="Open basket"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#cart"/></svg><span class="cart-btn__label">Basket</span><span class="cart-btn__count" data-count="0">0</span></button></div>' +
      '</div><span class="motif-bar" aria-hidden="true"></span></header>' +
      '<div class="mobile-menu" id="mobile-menu"><ul class="mobile-menu__list">' + navHTML("menu") + '</ul><div class="mobile-menu__foot"><a class="btn btn--whatsapp" href="' + wa + '" rel="noopener">' + icon("whatsapp") + " Order on WhatsApp</a></div></div>";
  }
  function footerHTML() {
    var s = cfg.shop;
    return '<footer class="site-footer"><span class="motif-bar" aria-hidden="true"></span><div class="container"><div class="footer-grid">' +
      '<div class="footer-brand"><img src="assets/logo-light.svg" alt="Moishes Kosher Butchery &amp; Deli" width="330" height="92"><p class="footer-muted">' + esc(s.address) + '</p><p class="footer-muted"><a href="tel:' + esc(s.phoneTel) + '">' + esc(s.phoneDisplay) + "</a></p></div>" +
      '<div><h2 class="footer-title">Shop</h2><ul class="footer-links"><li><a href="shop.html">All products</a></li><li><a href="shop.html?cat=shabbos-packs">Shabbos packs</a></li><li><a href="shop.html?cat=bakery">Challah &amp; bakery</a></li><li><a href="cart.html">Basket</a></li></ul></div>' +
      '<div><h2 class="footer-title">Information</h2><ul class="footer-links"><li><a href="kashrut.html">Kashrut</a></li><li><a href="about.html">About &amp; hours</a></li><li><a href="contact.html">Contact</a></li><li><a href="orders.html">My orders</a></li></ul></div>' +
      '<div><h2 class="footer-title">Order</h2><ul class="footer-links"><li><a href="https://wa.me/' + esc(s.whatsapp) + '" rel="noopener">WhatsApp</a></li><li><a href="checkout.html">Checkout</a></li></ul></div></div>' +
      '<div class="footer-legal"><span>&copy; 2026 Moishes Kosher Butchery &amp; Deli</span><span class="demo-note">Demo site - dummy products and prices</span></div></div></footer>' +
      '<div class="toast-region" aria-live="polite" aria-atomic="false"></div>';
  }

  /* ---------- drawer ---------- */
  var drawer, lastFocus;
  function drawerHTML() {
    return '<div class="drawer" id="cart-drawer"><div class="drawer__overlay" data-close></div><aside class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title">' +
      '<header class="drawer__head"><h2 id="drawer-title">Your basket</h2><button class="icon-btn" type="button" data-close aria-label="Close basket">' + icon("close") + "</button></header>" +
      '<div class="drawer__body" id="drawer-body"></div><footer class="drawer__foot" id="drawer-foot"></footer></aside></div>';
  }
  function renderDrawer() {
    var lines = cartLines(), body = $("#drawer-body"), foot = $("#drawer-foot"); if (!body) return;
    if (!lines.length) {
      body.innerHTML = '<div class="empty"><img class="empty__art" src="assets/art/generic-meat.svg" alt=""><h2 class="empty__title">Your basket is empty</h2><p class="empty__text">Start with a Shabbos pack or a fresh brisket.</p><a class="btn btn--primary" href="shop.html">Shop now</a></div>';
      foot.innerHTML = ""; foot.hidden = true; return;
    }
    foot.hidden = false;
    body.innerHTML = '<ul class="cart-lines">' + lines.map(function (l) {
      var p = l.product;
      return '<li class="cart-line"><img class="cart-line__img" src="' + art(p) + '" alt="" width="64" height="64"><div><p class="cart-line__title"><a href="product.html?id=' + encodeURIComponent(p.id) + '">' + esc(p.name) + '</a></p><p class="cart-line__meta">' + money(p.price) + " " + F.unitLabel(p.unit) + '</p></div><span class="cart-line__total">' + money(l.total) + "</span>" +
        '<div class="cart-line__controls">' + stepperHTML(p, l.qty, { fk: "dr" }) + '<button class="cart-line__remove" type="button" data-remove="' + esc(p.id) + '" data-fk="dr:' + esc(p.id) + ':rm" aria-label="Remove ' + esc(p.name) + '">Remove</button></div></li>';
    }).join("") + "</ul>";
    var t = R.totals(lines, { mode: "collection" }, cfg), pct = Math.min(100, Math.round(t.subtotal / t.freeThreshold * 100));
    foot.innerHTML = '<div class="free-ship">' + (t.freeDelivery ? "You qualify for free delivery" : "Add " + money(t.freeRemaining) + " more for free delivery") + '<span class="free-ship__bar" style="--pct:' + pct + '%"><span></span></span></div>' +
      '<dl class="totals"><div class="totals__row totals__row--grand"><dt>Subtotal</dt><dd>' + money(t.subtotal) + '</dd></div></dl><p class="text-sm muted">Delivery and weight adjustments are calculated at checkout. Prices include VAT.</p>' +
      '<a class="btn btn--primary btn--block" href="checkout.html">Checkout</a><a class="btn btn--secondary btn--block" href="cart.html">View full basket</a>';
  }
  function focusables(r) { return $$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])', r).filter(function (n) { return n.offsetParent !== null || n === doc.activeElement; }); }
  function openDrawer(from) {
    lastFocus = from || doc.activeElement; renderDrawer();
    drawer.classList.add("is-open"); doc.body.classList.add("no-scroll");
    var f = focusables($(".drawer__panel")); (f.filter(function (n) { return n.hasAttribute("data-close"); })[0] || f[0]).focus();
  }
  function closeDrawer() {
    if (!drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open"); doc.body.classList.remove("no-scroll");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function setupDrawer() {
    var d = doc.createElement("div"); d.innerHTML = drawerHTML(); drawer = d.firstChild; doc.body.appendChild(drawer);
    drawer.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) closeDrawer(); else if (e.target.closest("a[href]")) closeDrawer(); });
    doc.addEventListener("keydown", function (e) {
      if (!drawer.classList.contains("is-open")) return;
      if (e.key === "Escape") { closeDrawer(); return; }
      if (e.key === "Tab") {
        var f = focusables($(".drawer__panel")); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (doc.activeElement === first || !$(".drawer__panel").contains(doc.activeElement))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function updateCount(bump) {
    var n = cartCount(), el = $(".cart-btn__count"), btn = $(".cart-btn"); if (!el) return;
    el.textContent = n; el.setAttribute("data-count", n);
    btn.setAttribute("aria-label", "Open basket, " + n + (n === 1 ? " item" : " items"));
    if (bump) { btn.classList.add("is-bump"); root.setTimeout(function () { btn.classList.remove("is-bump"); }, 400); }
  }
  var lastN = null;
  function onCart() {
    var n = cartCount();
    updateCount(lastN !== null && n > lastN); lastN = n;
    refreshActions();
    if (drawer && drawer.classList.contains("is-open")) keepFocus(renderDrawer);
  }

  function setupMenu() {
    var b = $(".nav-toggle"), m = $("#mobile-menu"); if (!b) return;
    function set(open) { m.classList.toggle("is-open", open); b.setAttribute("aria-expanded", open ? "true" : "false"); doc.body.classList.toggle("no-scroll", open); }
    b.addEventListener("click", function () { set(b.getAttribute("aria-expanded") !== "true"); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && m.classList.contains("is-open")) { set(false); b.focus(); } });
    root.addEventListener("resize", function () { if (root.innerWidth >= 992 && m.classList.contains("is-open")) set(false); });
  }

  function init() {
    var h = $("[data-site-header]"), f = $("[data-site-footer]");
    if (h) h.outerHTML = headerHTML();
    if (f) f.outerHTML = footerHTML();
    setupDrawer(); setupMenu();
    onCart();
    doc.addEventListener("moishes:cart", onCart);
    refreshActions();
    /* service worker (offline shell). Only on http(s). */
    if ("serviceWorker" in root.navigator && /^https?:$/.test(root.location.protocol)) {
      root.addEventListener("load", function () { root.navigator.serviceWorker.register("sw.js").catch(function () { /* ignore */ }); });
    }
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init); else init();

  root.MoishesUI = { icon: icon, art: art, $: $, $$: $$, badges: badges, productCard: productCard, stepperHTML: stepperHTML, renderActions: renderActions, refreshActions: refreshActions,
    toast: toast, addToCart: addToCart, cartLines: cartLines, openDrawer: openDrawer, keepFocus: keepFocus, priceHTML: priceHTML, now: now, flag: flag };
})(window);
