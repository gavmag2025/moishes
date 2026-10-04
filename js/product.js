/* product.js - product detail page (product.html?id=...). */
(function (root) {
  var doc = root.document, F = root.MoishesFormat, UI = root.MoishesUI, C = root.MoishesCatalog, R = root.MoishesRules, S = root.MoishesStore, cfg = root.MOISHES_CONFIG;
  var esc = F.esc, money = F.money, $ = UI.$;
  var id = new URLSearchParams(root.location.search).get("id");
  var p = C.get(id), host = $("#pdp");

  function notFound() {
    doc.title = "Product not found - Moishes Kosher Butchery & Deli";
    host.innerHTML = '<div class="container"><div class="empty"><img class="empty__art" src="assets/art/generic-meat.svg" alt=""><h1 class="empty__title">We could not find that product</h1><p class="empty__text">It may have been removed or the link is wrong.</p><a class="btn btn--primary" href="shop.html">Back to the shop</a></div></div>';
    var rm = $("#related"); if (rm) rm.hidden = true;
    var m = doc.querySelector('meta[name="robots"]'); if (m) m.content = "noindex";
  }
  if (!p) { notFound(); return; }

  var blocked = cfg.pesach && !p.pesach;
  var step = R.qtyStep(p.unit, cfg);
  var qty = p.unit === "kg" ? 1 : 1;
  var cat = C.category(p.category);
  doc.title = p.name + " - Moishes Kosher Butchery & Deli";
  var desc = doc.querySelector('meta[name="description"]'); if (desc) desc.content = p.name + ": " + p.desc + " " + money(p.price) + (p.unit === "kg" ? " per kg" : "") + ". Kosher " + p.kosher.toLowerCase() + ".";
  [["og:title", doc.title], ["og:description", p.desc], ["og:image", "assets/art/" + p.art + ".svg"]].forEach(function (x) { var m = doc.querySelector('meta[property="' + x[0] + '"]'); if (m) m.content = x[1]; });

  var ld = { "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.desc, image: new URL("assets/art/" + p.art + ".svg", root.location.href).href,
    category: cat ? cat.label : p.category, brand: { "@type": "Brand", name: "Moishes Butchery & Deli" },
    offers: { "@type": "Offer", priceCurrency: "ZAR", price: p.price.toFixed(2), availability: p.stock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock", url: root.location.href } };
  var s = doc.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); doc.head.appendChild(s);

  $("#crumb-cat").innerHTML = '<a href="shop.html?cat=' + encodeURIComponent(p.category) + '">' + esc(cat ? cat.label : p.category) + "</a>";
  $("#crumb-name").textContent = p.name;

  var note = cfg.kashrutNotes[p.category];
  host.innerHTML = '<div class="container pdp"><div class="pdp__media"><img src="' + UI.art(p) + '" alt="' + esc(p.name + " - illustration") + '" width="600" height="450"></div><div>' +
    '<div class="pdp__badges">' + UI.badges(p) + (p.badge ? UI.flag(p).replace(" product-card__flag", "") : "") + (p.stock === false ? "" : "") + "</div>" +
    '<h1 class="pdp__title">' + esc(p.name) + '</h1><p class="pdp__price">' + UI.priceHTML(p) + "</p>" +
    '<p>' + esc(p.desc) + "</p>" + (p.pack ? '<p class="muted text-sm">Typical pack: ' + esc(p.pack) + "</p>" : "") +
    '<ul class="pdp__tags" aria-label="Tags">' + (p.tags || []).map(function (t) { return '<li class="tag">' + esc(t) + "</li>"; }).join("") + "</ul>" +
    (blocked ? '<div class="alert alert--info" role="status">' + UI.icon("info") + "<p>Pesach mode is on: this item is not available right now.</p></div>" : "") +
    (p.stock === false ? '<div class="alert alert--danger" role="status">' + UI.icon("alert") + "<p>Currently out of stock.</p></div>" : "") +
    '<div class="pdp__buy"><div class="cluster" id="pdp-qty"></div><p class="text-sm muted" id="pdp-total" aria-live="polite"></p>' +
    '<button class="btn btn--primary btn--lg btn--block" type="button" id="pdp-add"' + (blocked || p.stock === false ? " disabled" : "") + ">Add to basket</button>" +
    (p.unit === "kg" ? '<p class="text-sm muted">' + esc(cfg.ordering.weightNote) + "</p>" : "") + "</div>" +
    '<div class="info-card"><h2 class="text-sm eyebrow">Kashrut</h2><p><strong>' + esc(p.kosher === "Pareve" ? "Pareve" : "Meat (fleishig)") + "</strong>. " + esc(cfg.kashrut.authority) + " (demo statement).</p>" + (note ? "<p class=\"text-sm\">" + esc(note) + "</p>" : "") + '<a class="btn btn--text" href="kashrut.html">About our kashrut</a></div>' +
    "</div></div>";

  function paint() {
    var box = $("#pdp-qty");
    box.innerHTML = '<div class="qty" role="group" aria-label="Quantity of ' + esc(p.name) + '"><button class="qty__btn" type="button" data-local="-1" aria-label="Decrease quantity"' + (qty <= step ? " disabled" : "") + '>&minus;</button><input class="qty__input" id="pdp-q" inputmode="decimal" value="' + F.num(qty) + '" aria-label="Quantity' + (p.unit === "kg" ? " in kg" : "") + '">' + (p.unit === "kg" ? '<span class="qty__unit">kg</span>' : "") + '<button class="qty__btn" type="button" data-local="1" aria-label="Increase quantity">+</button></div>';
    $("#pdp-total").textContent = "Line total: " + money(R.lineTotal(p.price, qty)) + (p.unit === "kg" ? " (estimate)" : "");
  }
  paint();
  host.addEventListener("click", function (e) {
    var b = e.target.closest("[data-local]"); if (!b) return;
    qty = R.normalizeQty(qty + (+b.getAttribute("data-local")) * step, p.unit, cfg); paint();
    var n = $('[data-local="' + b.getAttribute("data-local") + '"]'); if (n && !n.disabled) n.focus(); else $("#pdp-q").focus();
  });
  host.addEventListener("change", function (e) { if (e.target.id === "pdp-q") { qty = R.normalizeQty(e.target.value, p.unit, cfg); paint(); $("#pdp-q").focus(); } });
  $("#pdp-add").addEventListener("click", function () {
    if (UI.addToCart(p.id, qty)) { var n = S.qtyOf(p.id); $("#pdp-add").textContent = "Added (" + F.qty(n, p.unit) + " in basket) - add more"; }
  });

  var rel = C.related(p, 4), rs = $("#related");
  if (rel.length) { $("#related-grid").innerHTML = rel.map(UI.productCard).join(""); UI.refreshActions(); } else rs.hidden = true;
})(window);
