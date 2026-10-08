/* orders.js - past orders stored in this browser. */
(function (root) {
  var doc = root.document, F = root.MaxisFormat, UI = root.MaxisUI, S = root.MaxisStore, cfg = root.MAXIS_CONFIG;
  var esc = F.esc, money = F.money, $ = UI.$, host = $("#orders-root");
  var STATUS = { new: "Received", packed: "Packed", delivered: "Delivered", collected: "Collected" };
  function render() {
    var list = S.getOrders();
    if (!list.length) { host.innerHTML = '<div class="empty"><img class="empty__art" src="assets/art/generic-meat.svg" alt=""><h2 class="empty__title">No orders yet</h2><p class="empty__text">Orders you place on this device appear here.</p><a class="btn btn--primary" href="shop.html">Start shopping</a></div>'; return; }
    host.innerHTML = '<ul class="stack" style="list-style:none;padding:0;margin:0">' + list.map(function (o) {
      var del = o.fulfilment === "delivery";
      return '<li><article class="panel"><h2 class="panel__title">' + esc(o.ref) + ' <span class="badge ' + (o.status === "new" ? "badge--new" : "badge--pareve") + '">' + esc(STATUS[o.status] || o.status) + "</span></h2>" +
        '<p class="muted text-sm">Placed ' + esc(F.dateTime(o.createdAt)) + " &middot; " + (del ? "Delivery" : "Collection") + " " + esc(F.dateShort(o.slot.date)) + ", " + esc(o.slot.label) + " &middot; <strong>" + money(o.totals.total) + "</strong></p>" +
        '<details class="faq__item"><summary class="faq__q">' + o.lines.length + (o.lines.length === 1 ? " item" : " items") + '</summary><div class="faq__a"><ul class="summary__lines">' + o.lines.map(function (l) { return "<li><span>" + esc(l.name) + " &times; " + F.qty(l.qty, l.unit) + '</span><span class="num">' + money(l.total) + "</span></li>"; }).join("") + "</ul></div></details>" +
        '<div class="cluster" style="margin-top:var(--s-3)"><a class="btn btn--secondary btn--sm" href="confirmation.html?ref=' + encodeURIComponent(o.ref) + '">View order</a><button class="btn btn--ghost btn--sm" type="button" data-reorder="' + esc(o.ref) + '">Order again</button></div></article></li>';
    }).join("") + "</ul>";
  }
  doc.addEventListener("click", function (e) {
    var b = e.target.closest("[data-reorder]"); if (!b) return;
    var o = S.getOrder(b.getAttribute("data-reorder")), n = 0; if (!o) return;
    o.lines.forEach(function (l) { if (UI.addToCart(l.id, l.qty, true)) n++; });
    UI.toast(n ? n + " items added to your basket" : "Those items are no longer available", { type: n ? "success" : "error" });
  });
  render();
})(window);
