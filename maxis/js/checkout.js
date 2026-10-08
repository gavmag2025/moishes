/* checkout.js - customer details, delivery/collection, date + slot picker, payment, validation, order creation. */
(function (root) {
  var doc = root.document, F = root.MaxisFormat, UI = root.MaxisUI, R = root.MaxisRules, S = root.MaxisStore, cfg = root.MAXIS_CONFIG;
  var esc = F.esc, money = F.money, $ = UI.$;
  var form = $("#checkout");
  var cust = S.getCustomer();
  var st = { mode: cust.fulfilment === "collection" ? "collection" : "delivery", date: "", slot: "", pay: "" };

  /* ---------- static fills ---------- */
  $("#zone").innerHTML = '<option value="">Select your suburb</option>' + cfg.deliveryZones.map(function (z) {
    return '<option value="' + esc(z.id) + '">' + esc(z.name) + " - " + (z.fee ? money(z.fee) : "free delivery") + ", min " + money(z.minimum) + "</option>";
  }).join("");
  ["name", "phone", "email", "street"].forEach(function (k) { if (cust[k]) $("#" + k).value = cust[k]; });
  if (cust.zone && R.findZone(cust.zone, cfg)) $("#zone").value = cust.zone;
  $('input[name="fulfilment"][value="' + st.mode + '"]').checked = true;
  $("#wa-link").href = "https://wa.me/" + cfg.shop.whatsapp;

  function zone() { return R.findZone($("#zone").value, cfg); }
  function lines() { return UI.cartLines(); }
  function totals() { return R.totals(lines(), { mode: st.mode, zone: zone() }, cfg); }

  /* ---------- errors ---------- */
  var errors = [];
  function clearErrors() {
    errors = [];
    $("#error-summary").hidden = true; $("#error-summary").innerHTML = "";
    Array.prototype.forEach.call(form.querySelectorAll(".has-error"), function (f) { f.classList.remove("has-error"); });
    Array.prototype.forEach.call(form.querySelectorAll("[aria-invalid]"), function (c) { c.removeAttribute("aria-invalid"); });
    Array.prototype.forEach.call(form.querySelectorAll(".field__error"), function (e) { e.textContent = ""; });
  }
  function setError(id, msg, ctlSel) {
    var err = $("#" + id + "-err"), field = err && err.closest(".field");
    if (err) err.textContent = msg;
    if (field) field.classList.add("has-error");
    var ctl = $(ctlSel || "#" + id);
    if (ctl) { ctl.setAttribute("aria-invalid", "true"); if (ctl.id) { var d = (ctl.getAttribute("aria-describedby") || "").split(" ").filter(Boolean); if (d.indexOf(id + "-err") < 0) d.push(id + "-err"); ctl.setAttribute("aria-describedby", d.join(" ")); } }
    errors.push({ id: id, msg: msg, focus: ctlSel || "#" + id });
  }
  function showSummary() {
    var box = $("#error-summary");
    box.innerHTML = "<strong>Please fix " + errors.length + (errors.length === 1 ? " problem" : " problems") + ' before placing your order:</strong><ul>' + errors.map(function (e, i) { return '<li><a href="#" data-err="' + i + '">' + esc(e.msg) + "</a></li>"; }).join("") + "</ul>";
    box.hidden = false; box.focus();
  }
  $("#error-summary").addEventListener("click", function (e) {
    var a = e.target.closest("[data-err]"); if (!a) return; e.preventDefault();
    var t = $(errors[+a.getAttribute("data-err")].focus); if (t) { t.focus(); if (t.scrollIntoView) t.scrollIntoView({ block: "center" }); }
  });

  /* ---------- date + slot picker ---------- */
  function renderDays() {
    var now = UI.now(), days = R.availableDays(now, st.mode, cfg);
    var cur = days.filter(function (d) { return d.iso === st.date && d.available; })[0];
    if (!cur) { st.slot = ""; var f = days.filter(function (d) { return d.available; })[0]; st.date = f ? f.iso : ""; }
    $("#day-chips").innerHTML = days.map(function (d) {
      var dow = F.DAYS[d.dow], dd = F.dateShort(d.iso).split(" ").slice(1).join(" ");
      return '<button class="day-chip" type="button" data-day="' + d.iso + '" aria-pressed="' + (d.iso === st.date) + '"' + (d.available ? "" : ' disabled title="' + esc(d.reason) + '"') + ' aria-label="' + esc(F.dateLong(d.iso) + (d.available ? "" : ", unavailable: " + d.reason)) + '"><span class="day-chip__dow">' + dow + '</span><span class="day-chip__date">' + dd + "</span></button>";
    }).join("");
    var closed = days.filter(function (d) { return !d.available; }).map(function (d) { return F.dateShort(d.iso) + " (" + d.reason.replace(/^Closed: |^Closed for /, "").toLowerCase().replace(/^./, function (c) { return c.toUpperCase(); }) + ")"; });
    $("#day-note").textContent = closed.length ? "Unavailable: " + closed.join("; ") + "." : "";
    renderSlots(days);
  }
  function renderSlots(days) {
    var d = (days || R.availableDays(UI.now(), st.mode, cfg)).filter(function (x) { return x.iso === st.date; })[0];
    var grid = $("#slot-grid");
    if (!d) { grid.innerHTML = '<p class="muted">No dates are currently available.</p>'; return; }
    if (!d.slots.some(function (s) { return s.value === st.slot && s.available; })) st.slot = "";
    $("#slot-legend").textContent = (st.mode === "delivery" ? "Delivery" : "Collection") + " time on " + F.dateLong(d.iso);
    grid.innerHTML = d.slots.map(function (s, i) {
      return '<label class="slot"><input class="slot__input" type="radio" name="slot" value="' + esc(s.value) + '"' + (s.available ? "" : " disabled") + (s.value === st.slot ? " checked" : "") + (i === 0 ? ' id="slot-first"' : "") + '><span class="slot__label">' + esc(s.label) + (s.note || !s.available ? '<span class="slot__note">' + esc(s.available ? s.note : s.reason) + "</span>" : "") + "</span></label>";
    }).join("");
    var m = $("#mode-note");
    m.textContent = st.mode === "collection" ? "Collection: come in any time within your window, once your order is ready. Collection is at " + cfg.shop.address + "." : "";
  }
  doc.addEventListener("click", function (e) {
    var b = e.target.closest("[data-day]"); if (!b || !form.contains(b)) return;
    st.date = b.getAttribute("data-day"); st.slot = ""; renderDays();
    var n = $('[data-day="' + st.date + '"]'); if (n) n.focus();
    renderSummary();
  });
  form.addEventListener("change", function (e) {
    var t = e.target;
    if (t.name === "slot") { st.slot = t.value; }
    else if (t.name === "pay") { st.pay = t.value; }
    else if (t.name === "fulfilment") { st.mode = t.value; applyMode(); }
    else if (t.id === "zone") { S.saveCustomer({ zone: t.value }); renderZoneHint(); }
    renderSummary();
  });

  /* ---------- fulfilment / zone / payments ---------- */
  function renderZoneHint() {
    var z = zone(), h = $("#zone-hint"); if (!z) { h.textContent = "Delivery fee and minimum order depend on your suburb."; return; }
    h.textContent = z.name + ": " + (z.fee ? money(z.fee) + " delivery" : "free delivery") + ", minimum order " + money(z.minimum) + ". Free delivery on orders of " + money(cfg.freeDeliveryThreshold) + "+.";
  }
  function renderPayments() {
    var list = cfg.payments.filter(function (p) { return st.mode === "collection" ? (p.id !== "cod-cash" && p.id !== "cod-card") : p.id !== "collection"; });
    if (!list.some(function (p) { return p.id === st.pay && p.enabled; })) st.pay = (list.filter(function (p) { return p.enabled; })[0] || {}).id || "";
    $("#pay-list").innerHTML = list.map(function (p) {
      return '<label class="choice"><input class="choice__input" type="radio" name="pay" value="' + esc(p.id) + '"' + (p.enabled ? "" : " disabled") + (p.id === st.pay ? " checked" : "") + '><span class="choice__box"><span class="choice__title">' + esc(p.label) + '</span><span class="choice__desc">' + esc(p.note) + "</span>" + (p.enabled ? "" : '<span class="choice__aside">Coming soon</span>') + "</span></label>";
    }).join("");
  }
  function applyMode() {
    var d = st.mode === "delivery";
    $("#delivery-fields").hidden = !d;
    $("#collect-note").hidden = d;
    renderDays(); renderPayments(); renderZoneHint();
    S.saveCustomer({ fulfilment: st.mode });
  }

  /* ---------- summary ---------- */
  function renderSummary() {
    var ls = lines(), t = totals(), z = zone();
    if (!ls.length) { $("#checkout-empty").hidden = false; form.hidden = true; $("#summary").hidden = true; $("#sticky").hidden = true; return; }
    $("#summary-lines").innerHTML = ls.map(function (l) { return "<li><span>" + esc(l.product.name) + " &times; " + F.qty(l.qty, l.unit) + '</span><span class="num">' + money(l.total) + "</span></li>"; }).join("");
    var fee = st.mode === "collection" ? "Free (collection)" : t.deliveryFee === null ? "Choose suburb" : t.deliveryFee ? money(t.deliveryFee) : "Free";
    $("#summary-totals").innerHTML = '<div class="totals__row"><dt>Subtotal</dt><dd>' + money(t.subtotal) + '</dd></div><div class="totals__row"><dt>' + (st.mode === "delivery" ? "Delivery" : "Collection") + "</dt><dd>" + fee + '</dd></div><div class="totals__row totals__row--grand"><dt>Total' + (t.feeKnown ? "" : " (excl. delivery)") + "</dt><dd>" + money(t.total) + "</dd></div>";
    $("#vat-note").textContent = "Includes VAT of " + money(t.vat) + ". " + (t.freeDelivery || st.mode === "collection" ? "" : "Add " + money(t.freeRemaining) + " for free delivery.");
    var alert = $("#min-alert");
    if (st.mode === "delivery" && z && !t.minimumMet) { alert.hidden = false; alert.querySelector("p").textContent = "Minimum order for " + z.name + " is " + money(z.minimum) + ". Add " + money(t.shortfall) + " more, or switch to collection."; }
    else alert.hidden = true;
    $("#sticky-total").textContent = money(t.total);
    $("#weight-note").hidden = !ls.some(function (l) { return l.unit === "kg"; });
  }

  /* ---------- submit ---------- */
  function val(id) { return String($("#" + id).value || "").trim(); }
  form.addEventListener("submit", function (e) {
    e.preventDefault(); clearErrors();
    var ls = lines(); if (!ls.length) return;
    var name = val("name"), phoneRaw = val("phone"), email = val("email"), street = val("street"), notes = val("notes"), instr = val("instructions");
    var ph = R.phoneSA(phoneRaw), z = zone(), t = totals(), now = UI.now();
    if (name.length < 2) setError("name", "Enter your full name.");
    if (!phoneRaw) setError("phone", "Enter a phone number so we can reach you."); else if (!ph.valid) setError("phone", "Enter a valid South African number, e.g. 082 123 4567 or +27 82 123 4567.");
    if (email && !R.emailOk(email)) setError("email", "Enter a valid email address or leave it blank.");
    if (st.mode === "delivery") {
      if (street.length < 5) setError("street", "Enter your street address.");
      if (!z) setError("zone", "Choose your delivery suburb.");
      else if (!t.minimumMet) setError("zone", "Minimum order for " + z.name + " is " + money(z.minimum) + ". Add " + money(t.shortfall) + " more or choose collection.");
    }
    var sv = R.validateSlot(st.date, st.slot, st.mode, now, cfg);
    if (!sv.ok) { setError("slot", sv.reason, "#slot-first, [data-day][aria-pressed=true]"); renderDays(); }
    var pm = cfg.payments.filter(function (p) { return p.id === st.pay && p.enabled; })[0];
    if (!pm) setError("pay", "Choose a payment method.", 'input[name="pay"]');
    if (!$("#agree").checked) setError("agree", "Please tick to confirm you understand weighted items are adjusted to actual weight.");
    if (errors.length) { showSummary(); return; }

    var existing = {}; S.getOrders().forEach(function (o) { existing[o.ref] = 1; });
    var ref; do { ref = R.orderRef(); } while (existing[ref]);
    var order = {
      ref: ref, createdAt: now.toISOString(), status: "new", demo: true,
      customer: { name: name, phone: ph.local, phoneE164: ph.e164, email: email },
      fulfilment: st.mode, zoneId: z && st.mode === "delivery" ? z.id : "", zoneName: z && st.mode === "delivery" ? z.name : "",
      address: st.mode === "delivery" ? street : "", instructions: instr,
      slot: { date: st.date, value: st.slot, label: sv.slot.label },
      payment: { id: pm.id, label: pm.label },
      lines: ls.map(function (l) { return { id: l.id, name: l.product.name, unit: l.unit, qty: l.qty, price: l.price, total: l.total, kosher: l.product.kosher, art: l.product.art }; }),
      totals: { subtotal: t.subtotal, deliveryFee: t.deliveryFee || 0, total: t.total, vat: t.vat },
      notes: [notes, instr ? "Delivery instructions: " + instr : ""].filter(Boolean).join(" | ")
    };
    S.saveCustomer({ name: name, phone: phoneRaw, email: email, street: street, zone: z ? z.id : "", fulfilment: st.mode });
    S.saveOrder(order); S.clear();
    root.location.href = "confirmation.html?ref=" + encodeURIComponent(ref) + (S.persistent ? "" : "#" + encodeURIComponent(JSON.stringify(order)));
  });
  /* clear individual errors when the user edits */
  form.addEventListener("input", function (e) {
    var f = e.target.closest && e.target.closest(".field"); if (f && f.classList.contains("has-error")) { f.classList.remove("has-error"); e.target.removeAttribute("aria-invalid"); }
  });

  doc.addEventListener("maxis:cart", renderSummary);
  applyMode(); renderSummary();
})(window);
