/* cart.js - full basket page with delivery estimate, VAT note and minimum-order check. */
(function (root) {
  var doc = root.document, F = root.MoishesFormat, UI = root.MoishesUI, R = root.MoishesRules, S = root.MoishesStore, cfg = root.MOISHES_CONFIG;
  var esc = F.esc, money = F.money, $ = UI.$;
  var host = $("#cart-root");

  function zoneOptions(sel) {
    return '<option value="">Select your suburb</option>' + cfg.deliveryZones.map(function (z) {
      return '<option value="' + esc(z.id) + '"' + (z.id === sel ? " selected" : "") + ">" + esc(z.name) + " (" + (z.fee ? money(z.fee) : "free") + ", min " + money(z.minimum) + ")</option>";
    }).join("");
  }
  function render() {
    var lines = UI.cartLines();
    if (!lines.length) {
      host.innerHTML = '<div class="container"><div class="empty"><img class="empty__art" src="assets/art/generic-meat.svg" alt=""><h2 class="empty__title">Your basket is empty</h2><p class="empty__text">Start with a Shabbos pack, a brisket or fresh challah.</p><a class="btn btn--primary" href="shop.html">Shop now</a></div></div>';
      return;
    }
    var cust = S.getCustomer(), zone = R.findZone(cust.zone, cfg), mode = cust.fulfilment === "collection" ? "collection" : "delivery";
    var t = R.totals(lines, { mode: mode, zone: zone }, cfg);
    var rows = lines.map(function (l) {
      var p = l.product;
      return '<tr><td class="cart-table__product"><div class="cart-table__prod-inner"><img class="cart-table__img" src="' + UI.art(p) + '" alt="" width="72" height="54"><div><strong><a href="product.html?id=' + encodeURIComponent(p.id) + '">' + esc(p.name) + '</a></strong><br><span class="muted text-sm">' + esc(p.kosher) + (p.pack ? " &middot; " + esc(p.pack) : "") + "</span></div></div></td>" +
        '<td data-label="Price">' + money(p.price) + " " + F.unitLabel(p.unit) + '</td><td data-label="Qty">' + UI.stepperHTML(p, l.qty, { fk: "ct" }) + '</td><td data-label="Total"><strong>' + money(l.total) + '</strong></td>' +
        '<td data-label="Remove"><button class="cart-line__remove" type="button" data-remove="' + esc(p.id) + '" data-fk="ct:' + esc(p.id) + ':rm" aria-label="Remove ' + esc(p.name) + '">Remove</button></td></tr>';
    }).join("");
    var feeTxt, feeNote = "";
    if (mode === "collection") feeTxt = "Free (collection)";
    else if (t.deliveryFee === null) { feeTxt = "Choose suburb"; feeNote = "From R0 (Glenhazel / Raedene) up to " + money(Math.max.apply(null, cfg.deliveryZones.map(function (z) { return z.fee; }))) + " depending on suburb."; }
    else feeTxt = t.deliveryFee ? money(t.deliveryFee) : "Free";
    var hasKg = lines.some(function (l) { return l.unit === "kg"; });
    var minAlert = "";
    if (mode === "delivery" && zone && !t.minimumMet) minAlert = '<div class="alert alert--danger" role="alert">' + UI.icon("alert") + "<p>Delivery to " + esc(zone.name) + " has a minimum order of " + money(zone.minimum) + ". Add " + money(t.shortfall) + " more, or choose collection at checkout.</p></div>";
    var free = t.freeDelivery ? "You qualify for free delivery." : "Add " + money(t.freeRemaining) + " more for free delivery in any zone.";
    host.innerHTML = '<div class="container checkout-layout"><div class="checkout-main"><div class="panel">' +
      '<table class="cart-table"><caption class="visually-hidden">Your basket</caption><thead><tr><th scope="col">Product</th><th scope="col">Price</th><th scope="col">Qty</th><th scope="col">Total</th><th scope="col"><span class="visually-hidden">Remove</span></th></tr></thead><tbody>' + rows + "</tbody></table>" +
      (hasKg ? '<p class="text-sm muted">' + esc(cfg.ordering.weightNote) + "</p>" : "") + "</div>" +
      '<div class="cluster"><a class="btn btn--secondary" href="shop.html">Continue shopping</a><button class="btn btn--ghost" type="button" id="clear-cart">Empty basket</button></div></div>' +
      '<aside class="summary" aria-label="Order summary"><h2>Order summary</h2>' +
      '<div class="field"><label class="field__label" for="est-zone">Delivery estimate for</label><select id="est-zone" class="select">' + zoneOptions(cust.zone) + "</select></div>" +
      '<dl class="totals"><div class="totals__row"><dt>Subtotal</dt><dd>' + money(t.subtotal) + '</dd></div><div class="totals__row"><dt>Delivery</dt><dd>' + feeTxt + '</dd></div>' +
      '<div class="totals__row totals__row--grand"><dt>' + (t.feeKnown ? "Total" : "Total (excl. delivery)") + "</dt><dd>" + money(t.total) + "</dd></div></dl>" +
      (feeNote ? '<p class="text-sm muted">' + feeNote + "</p>" : "") +
      '<p class="text-sm muted">All prices include VAT (' + money(t.vat) + " VAT included in this total). " + esc(free) + "</p>" + minAlert +
      '<a class="btn btn--primary btn--block btn--lg" href="checkout.html">Proceed to checkout</a></aside></div>' +
      '<div class="sticky-cta"><div class="sticky-cta__total">Subtotal<strong>' + money(t.subtotal) + '</strong></div><a class="btn btn--primary" href="checkout.html">Checkout</a></div>';
  }
  doc.addEventListener("moishes:cart", function () { UI.keepFocus(render); });
  doc.addEventListener("change", function (e) {
    if (e.target.id === "est-zone") { S.saveCustomer({ zone: e.target.value }); UI.keepFocus(function () { render(); var s = $("#est-zone"); if (s) s.focus(); }); }
  });
  doc.addEventListener("click", function (e) {
    if (e.target.id === "clear-cart") {
      var snapshot = S.getCart(); S.clear();
      UI.toast("Basket emptied", { action: { label: "Undo", fn: function () { S.setCart(snapshot); } } });
    }
  });
  render();
})(window);
