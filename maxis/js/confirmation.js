/* confirmation.js - order confirmation, EFT details, WhatsApp deep link, print. */
(function (root) {
  var doc = root.document, F = root.MaxisFormat, UI = root.MaxisUI, R = root.MaxisRules, S = root.MaxisStore, cfg = root.MAXIS_CONFIG;
  var esc = F.esc, money = F.money, $ = UI.$;
  var ref = new URLSearchParams(root.location.search).get("ref") || "";
  var o = S.getOrder(ref);
  if (!o && root.location.hash.length > 2) { try { var h = JSON.parse(decodeURIComponent(root.location.hash.slice(1))); if (h && h.ref === ref && Array.isArray(h.lines)) o = h; } catch (e) { /* ignore */ } }
  var host = $("#confirm-root");

  if (!o) {
    doc.title = "Order not found - Maxi's Discount Kosher Butchery";
    host.innerHTML = '<div class="empty"><img class="empty__art" src="assets/art/generic-meat.svg" alt=""><h1 class="empty__title">We could not find that order</h1><p class="empty__text">Orders are stored in this browser only. Check <a href="orders.html">My orders</a> or contact the shop.</p><a class="btn btn--primary" href="shop.html">Back to the shop</a></div>';
    return;
  }
  doc.title = "Order " + o.ref + " - Maxi's Discount Kosher Butchery";
  var del = o.fulfilment === "delivery";
  var eft = o.payment && o.payment.id === "eft";
  var rows = [
    [del ? "Delivery" : "Collection", F.dateShort(o.slot.date) + ", " + o.slot.label],
    [del ? "Deliver to" : "Collect from", del ? o.address + ", " + o.zoneName : cfg.shop.address],
    ["Name", o.customer.name], ["Phone", o.customer.phone], ["Payment", o.payment.label]
  ];
  if (o.customer.email) rows.splice(4, 0, ["Email", o.customer.email]);
  if (o.notes) rows.push(["Notes", o.notes]);
  var pay = cfg.payments.filter(function (p) { return p.id === o.payment.id; })[0];
  var next = eft ? "Please pay by EFT using <strong>" + esc(o.ref) + "</strong> as the reference, then send proof of payment on WhatsApp."
    : o.payment.id === "collection" ? "Pay in store when you collect." : esc(pay ? pay.note : "");

  host.innerHTML = '<section class="confirm panel" aria-labelledby="c-title"><div class="confirm__seal">' + UI.icon("check") + '</div><h1 id="c-title" tabindex="-1">Todah rabbah!</h1><p>Your order has been received, ' + esc(o.customer.name.split(" ")[0]) + '. Saved in this browser; send it to the shop on WhatsApp to confirm.</p>' +
    '<div class="confirm__ref" aria-label="Order reference">' + esc(o.ref) + "</div>" +
    '<div class="confirm__summary"><ul class="summary-list">' + rows.map(function (r) { return "<li><span>" + esc(r[0]) + "</span><span>" + esc(r[1]) + "</span></li>"; }).join("") + "</ul></div>" +
    '<div class="confirm__summary"><h2 class="text-sm eyebrow">Items</h2><ul class="summary__lines">' + o.lines.map(function (l) { return "<li><span>" + esc(l.name) + " &times; " + F.qty(l.qty, l.unit) + '</span><span class="num">' + money(l.total) + "</span></li>"; }).join("") + "</ul>" +
    '<dl class="totals"><div class="totals__row"><dt>Subtotal</dt><dd>' + money(o.totals.subtotal) + "</dd></div>" + (del ? '<div class="totals__row"><dt>Delivery</dt><dd>' + (o.totals.deliveryFee ? money(o.totals.deliveryFee) : "Free") + "</dd></div>" : "") +
    '<div class="totals__row totals__row--grand"><dt>Total</dt><dd>' + money(o.totals.total) + '</dd></div></dl><p class="text-sm muted">Includes VAT of ' + money(o.totals.vat) + ". " + (o.lines.some(function (l) { return l.unit === "kg"; }) ? esc(cfg.ordering.weightNote) : "") + "</p></div>" +
    '<div class="alert alert--info">' + UI.icon("info") + "<p>" + next + "</p></div>" +
    (eft ? '<div class="confirm__summary" id="eft"><h2 class="text-sm eyebrow">EFT banking details (demo)</h2><dl class="totals">' + [["Account name", cfg.banking.accountName], ["Bank", cfg.banking.bank], ["Account number", cfg.banking.accountNumber], ["Branch code", cfg.banking.branchCode], ["Account type", cfg.banking.accountType], ["Reference", o.ref]].map(function (r) { return '<div class="totals__row"><dt>' + r[0] + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl></div>" : "") +
    '<div class="confirm__actions"><a class="btn btn--whatsapp btn--lg" id="wa-send" href="' + esc(R.whatsappUrl(o, cfg)) + '" target="_blank" rel="noopener">' + UI.icon("whatsapp") + " Send order on WhatsApp</a>" +
    '<button class="btn btn--secondary" type="button" id="print-btn">Print</button><a class="btn btn--ghost" href="shop.html">Keep shopping</a></div></section>';
  $("#print-btn").addEventListener("click", function () { root.print(); });
  $("#c-title").focus();
})(window);
