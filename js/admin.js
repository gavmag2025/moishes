/* admin.js - DEMO admin-lite. No authentication, no security: reads this browser's localStorage orders only. */
(function (root) {
  var doc = root.document, F = root.MoishesFormat, UI = root.MoishesUI, S = root.MoishesStore;
  var esc = F.esc, money = F.money, $ = UI.$, host = $("#admin-root");
  var filter = "all";
  var LABEL = { new: "New", packed: "Packed", delivered: "Delivered", collected: "Collected" };
  function done(o) { return o.fulfilment === "delivery" ? "delivered" : "collected"; }

  function render() {
    var all = S.getOrders(), list = all.filter(function (o) { return filter === "all" || o.status === filter; });
    var counts = { all: all.length }; all.forEach(function (o) { counts[o.status] = (counts[o.status] || 0) + 1; });
    $("#admin-filters").innerHTML = ["all", "new", "packed", "delivered", "collected"].map(function (k) {
      return '<button class="chip" type="button" data-filter="' + k + '" aria-pressed="' + (filter === k) + '">' + (k === "all" ? "All" : LABEL[k]) + ' <span class="chip__count">' + (counts[k] || 0) + "</span></button>";
    }).join("");
    $("#admin-export").disabled = !all.length; $("#admin-clear").disabled = !all.length;
    if (!list.length) { host.innerHTML = '<div class="empty"><h2 class="empty__title">No orders</h2><p class="empty__text">Place a test order on the storefront, then return here.</p></div>'; return; }
    host.innerHTML = '<div style="overflow-x:auto"><table class="cart-table" style="width:100%"><caption class="visually-hidden">Orders</caption><thead><tr><th scope="col">Ref</th><th scope="col">Customer</th><th scope="col">When</th><th scope="col">Items</th><th scope="col">Total</th><th scope="col">Payment</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead><tbody>' + list.map(function (o) {
      return "<tr><td data-label=\"Ref\"><strong>" + esc(o.ref) + '</strong><br><span class="muted text-sm">' + esc(F.dateTime(o.createdAt)) + "</span></td>" +
        '<td data-label="Customer">' + esc(o.customer.name) + '<br><a href="tel:' + esc(o.customer.phoneE164 || "") + '">' + esc(o.customer.phone) + '</a><br><span class="muted text-sm">' + (o.fulfilment === "delivery" ? esc(o.address + ", " + o.zoneName) : "Collection") + "</span></td>" +
        '<td data-label="When">' + esc(F.dateShort(o.slot.date)) + "<br>" + esc(o.slot.label) + '</td><td data-label="Items"><ul style="margin:0;padding-left:1.1rem">' + o.lines.map(function (l) { return "<li>" + esc(l.name) + " &times; " + F.qty(l.qty, l.unit) + "</li>"; }).join("") + "</ul>" + (o.notes ? '<span class="muted text-sm">Notes: ' + esc(o.notes) + "</span>" : "") + "</td>" +
        '<td data-label="Total">' + money(o.totals.total) + '</td><td data-label="Payment">' + esc(o.payment.label) + '</td><td data-label="Status"><span class="badge ' + (o.status === "new" ? "badge--new" : "badge--pareve") + '">' + esc(LABEL[o.status] || o.status) + "</span></td>" +
        '<td data-label="Actions"><div class="cluster">' +
        (o.status === "new" ? '<button class="btn btn--secondary btn--sm" type="button" data-set="packed" data-ref="' + esc(o.ref) + '">Mark packed</button>' : "") +
        (o.status !== done(o) ? '<button class="btn btn--primary btn--sm" type="button" data-set="' + done(o) + '" data-ref="' + esc(o.ref) + '">Mark ' + done(o) + "</button>" : "") +
        (o.status !== "new" ? '<button class="btn btn--ghost btn--sm" type="button" data-set="new" data-ref="' + esc(o.ref) + '">Reset</button>' : "") + "</div></td></tr>";
    }).join("") + "</tbody></table></div>";
  }
  function csv() {
    var head = ["Ref", "Created", "Status", "Name", "Phone", "Email", "Fulfilment", "Zone", "Address", "Date", "Slot", "Payment", "Items", "Subtotal", "Delivery", "Total", "Notes"];
    var rows = S.getOrders().map(function (o) {
      return [o.ref, o.createdAt, o.status, o.customer.name, o.customer.phone, o.customer.email, o.fulfilment, o.zoneName, o.address, o.slot.date, o.slot.label, o.payment.label,
        o.lines.map(function (l) { return l.name + " x " + l.qty + (l.unit === "kg" ? "kg" : ""); }).join("; "), o.totals.subtotal, o.totals.deliveryFee, o.totals.total, o.notes];
    });
    return [head].concat(rows).map(function (r) { return r.map(F.csvCell).join(","); }).join("\r\n");
  }
  doc.addEventListener("click", function (e) {
    var b;
    if ((b = e.target.closest("[data-filter]"))) { filter = b.getAttribute("data-filter"); render(); var n = $('[data-filter="' + filter + '"]'); if (n) n.focus(); }
    else if ((b = e.target.closest("[data-set]"))) { var ref = b.getAttribute("data-ref"); S.updateOrder(ref, { status: b.getAttribute("data-set") }); render(); UI.toast(ref + " marked " + b.getAttribute("data-set")); }
    else if (e.target.id === "admin-export") {
      var blob = new Blob(["﻿" + csv()], { type: "text/csv;charset=utf-8" }), a = doc.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "moishes-orders-" + new Date().toISOString().slice(0, 10) + ".csv"; doc.body.appendChild(a); a.click(); a.remove();
      root.setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    } else if (e.target.id === "admin-clear") { if (root.confirm("Delete ALL demo orders from this browser?")) { S.setOrders([]); render(); } }
  });
  doc.addEventListener("moishes:orders", render);
  render();
})(window);
