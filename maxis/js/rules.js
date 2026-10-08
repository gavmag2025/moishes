/* rules.js - pure business rules (dates, slots, cut-offs, Yom Tov, fees, totals).
   No DOM access. Exposed as window.MaxisRules and module.exports so it can be unit tested in node.
   Every function that needs configuration takes `cfg` (defaults to window.MAXIS_CONFIG).
   Time zone: South Africa (SAST, UTC+2, no DST) - all "now" arguments are real Dates/ms and are converted here. */
(function (root) {
  var SAST_MS = 2 * 3600000;

  function defCfg(cfg) { return cfg || (typeof window !== "undefined" ? window.MAXIS_CONFIG : (root.MAXIS_CONFIG || null)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function isoOf(y, m, d) { return y + "-" + pad(m) + "-" + pad(d); }
  function toMs(now) { return now instanceof Date ? now.getTime() : (now == null ? Date.now() : +now); }

  /* Wall-clock parts in SAST for an instant */
  function sast(now) {
    var t = new Date(toMs(now) + SAST_MS);
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), h: t.getUTCHours(), min: t.getUTCMinutes(), dow: t.getUTCDay(),
      iso: isoOf(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()) };
  }
  function parts(iso) { var p = String(iso).split("-"); return [+p[0], +p[1], +p[2]]; }
  function addDays(iso, n) { var p = parts(iso); var t = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)); return isoOf(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()); }
  function dowOf(iso) { var p = parts(iso); return new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay(); }
  /* SAST wall time on an ISO date -> epoch ms */
  function instant(iso, hhmm) { var p = parts(iso); var h = String(hhmm).split(":"); return Date.UTC(p[0], p[1] - 1, p[2], +h[0], +h[1] || 0) - SAST_MS; }

  function yomTovName(iso, cfg) {
    cfg = defCfg(cfg);
    var list = (cfg && cfg.yomTovClosed) || [];
    for (var i = 0; i < list.length; i++) if (list[i].date === iso) return list[i].name;
    return null;
  }
  function isShabbos(iso) { return dowOf(iso) === 6; }
  /* true when the shop is closed on that date (Shabbos or Yom Tov) */
  function isClosedDay(iso, cfg) { return isShabbos(iso) || !!yomTovName(iso, cfg); }
  function closedReason(iso, cfg) { if (isShabbos(iso)) return "Shabbos"; return yomTovName(iso, cfg); }

  function parseSlot(s) {
    var m = /^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/.exec(s);
    if (!m) return { start: "00:00", end: "00:00", label: s };
    return { start: m[1], end: m[2], label: m[1] + " - " + m[2] };
  }
  /* Has the Friday cut-off (config: Thursday 14:00) passed for a given Friday date? */
  function fridayCutoffPassed(iso, now, cfg) {
    cfg = defCfg(cfg);
    if (dowOf(iso) !== 5) return false;
    var c = cfg.ordering.fridayCutoff;
    var cutIso = addDays(iso, c.weekday - 5);
    return toMs(now) > instant(cutIso, c.time);
  }
  function fridayCutoffInstant(iso, cfg) {
    cfg = defCfg(cfg); var c = cfg.ordering.fridayCutoff; return instant(addDays(iso, c.weekday - 5), c.time);
  }

  /* Slots for a date. mode: "delivery" | "collection".
     Delivery slots must START at least minLeadHours after `now`.
     Collection windows must END at least minLeadHours after `now` (you may arrive any time inside the window once ready). */
  function dayInfo(iso, mode, now, cfg) {
    cfg = defCfg(cfg);
    var dow = dowOf(iso);
    var info = { iso: iso, dow: dow, available: false, reason: null, slots: [] };
    var closed = closedReason(iso, cfg);
    if (closed) { info.reason = closed === "Shabbos" ? "Closed for Shabbos" : "Closed: " + closed; return info; }
    if (dow === 5 && fridayCutoffPassed(iso, now, cfg)) {
      info.reason = "Friday cut-off passed (" + weekdayName(cfg.ordering.fridayCutoff.weekday) + " " + cfg.ordering.fridayCutoff.time + ")";
      return info;
    }
    var table = (mode === "collection" ? cfg.collectionSlots : cfg.deliverySlots) || {};
    var list = table[dow] || [];
    if (!list.length) { info.reason = "No " + (mode === "collection" ? "collection" : "delivery") + " slots"; return info; }
    var lead = (cfg.ordering.minLeadHours || 0) * 3600000;
    var t = toMs(now);
    list.forEach(function (raw, i) {
      var s = parseSlot(raw);
      var ref = mode === "collection" ? instant(iso, s.end) : instant(iso, s.start);
      var ok = ref - t >= lead;
      var slot = { value: raw, label: s.label, start: s.start, end: s.end, available: ok, reason: ok ? null : "Too soon (min. " + cfg.ordering.minLeadHours + "h notice)", note: null };
      if (dow === 5 && i === list.length - 1) slot.note = "Last slot before Shabbos";
      info.slots.push(slot);
    });
    info.available = info.slots.some(function (s) { return s.available; });
    if (!info.available) info.reason = "No slots left";
    return info;
  }
  function weekdayName(i) { return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i]; }

  /* Days from today (SAST) up to maxDaysAhead inclusive, each with availability + slots */
  function availableDays(now, mode, cfg) {
    cfg = defCfg(cfg);
    var today = sast(now).iso, out = [], max = cfg.ordering.maxDaysAhead;
    for (var i = 0; i <= max; i++) out.push(dayInfo(addDays(today, i), mode, now, cfg));
    return out;
  }
  function firstAvailable(now, mode, cfg) {
    var days = availableDays(now, mode, cfg);
    for (var i = 0; i < days.length; i++) if (days[i].available) return days[i];
    return null;
  }
  /* Validate a chosen date + slot at submit time. */
  function validateSlot(iso, slotValue, mode, now, cfg) {
    cfg = defCfg(cfg);
    if (!iso || !slotValue) return { ok: false, reason: "Choose a date and time slot." };
    var today = sast(now).iso;
    if (iso < today) return { ok: false, reason: "That date has passed." };
    if (iso > addDays(today, cfg.ordering.maxDaysAhead)) return { ok: false, reason: "That date is too far ahead." };
    var d = dayInfo(iso, mode, now, cfg);
    if (d.reason && !d.slots.length) return { ok: false, reason: d.reason };
    if (d.reason && !d.available) return { ok: false, reason: d.reason };
    for (var i = 0; i < d.slots.length; i++) if (d.slots[i].value === slotValue) return d.slots[i].available ? { ok: true, slot: d.slots[i] } : { ok: false, reason: d.slots[i].reason };
    return { ok: false, reason: "That time slot is not available." };
  }

  /* ---------- greetings + banner ---------- */
  function greeting(now, cfg) {
    cfg = defCfg(cfg);
    var s = sast(now);
    if (yomTovName(s.iso, cfg)) return { he: "חג שמח", en: "Chag Sameach" };
    if (s.dow === 5 || s.dow === 6) return { he: "שבת שלום", en: "Shabbat Shalom" };
    return { he: "שלום", en: "Shalom" };
  }
  /* next date after `iso` on which the shop is open */
  function nextOpenDate(iso, cfg) { var d = addDays(iso, 1), n = 0; while (isClosedDay(d, cfg) && n++ < 30) d = addDays(d, 1); return d; }

  /* Banner state for the announcement bar. kind: open | soon | passed | shabbos | yomtov */
  function bannerState(now, cfg) {
    cfg = defCfg(cfg);
    var s = sast(now), c = cfg.ordering.fridayCutoff, g = greeting(now, cfg);
    var yt = yomTovName(s.iso, cfg);
    var base = { greeting: g, closed: false };
    function nextTxt() { var f = firstAvailable(now, "delivery", cfg); return f ? f.iso : null; }
    if (yt) { base.kind = "yomtov"; base.closed = true; base.next = nextTxt(); base.label = "Closed today for " + yt; return base; }
    if (s.dow === 6) { base.kind = "shabbos"; base.closed = true; base.next = nextTxt(); base.label = "Closed for Shabbos"; return base; }
    if (s.dow === c.weekday || s.dow === 5) {
      /* find the upcoming Friday date */
      var fri = addDays(s.iso, 5 - s.dow);
      var cut = fridayCutoffInstant(fri, cfg), ms = cut - toMs(now);
      if (ms >= 0 && s.dow === c.weekday) {
        var hrs = Math.floor(ms / 3600000), mins = Math.floor((ms % 3600000) / 60000);
        base.kind = "soon"; base.hoursLeft = hrs; base.minsLeft = mins; base.label = cfg.ordering.bannerText; return base;
      }
      base.kind = "passed"; base.next = nextTxt(); base.label = "Erev Shabbos cut-off has passed"; return base;
    }
    base.kind = "open"; base.label = cfg.ordering.bannerText; return base;
  }

  /* ---------- money ---------- */
  function round2(n) { return Math.round((Number(n) + Number.EPSILON) * 100) / 100; }
  function lineTotal(price, qty) { return round2(price * qty); } /* kg items: price per kg * kg */
  function qtyStep(unit, cfg) { cfg = defCfg(cfg); return unit === "kg" ? ((cfg && cfg.ordering.weightStepKg) || 0.5) : 1; }
  function normalizeQty(q, unit, cfg) {
    var step = qtyStep(unit, cfg), n = Number(String(q).replace(",", "."));
    if (!isFinite(n)) n = step;
    n = Math.round(n / step) * step;
    var max = unit === "kg" ? 50 : 99;
    if (n < step) n = step;
    if (n > max) n = max;
    return Math.round(n * 1000) / 1000;
  }
  function findZone(id, cfg) { cfg = defCfg(cfg); var z = (cfg.deliveryZones || []); for (var i = 0; i < z.length; i++) if (z[i].id === id) return z[i]; return null; }
  function deliveryFee(zone, subtotal, mode, cfg) {
    cfg = defCfg(cfg);
    if (mode === "collection") return 0;
    if (subtotal >= cfg.freeDeliveryThreshold) return 0;
    return zone ? zone.fee : null; /* null = unknown until a zone is chosen */
  }
  /* lines: [{price, qty}]  opts: {mode, zone} */
  function totals(lines, opts, cfg) {
    cfg = defCfg(cfg); opts = opts || {};
    var mode = opts.mode || "delivery", zone = opts.zone || null;
    var subtotal = round2(lines.reduce(function (a, l) { return a + lineTotal(l.price, l.qty); }, 0));
    var fee = deliveryFee(zone, subtotal, mode, cfg);
    var minimum = mode === "delivery" && zone ? zone.minimum : 0;
    var total = round2(subtotal + (fee || 0));
    var rate = cfg.vatRate || 0;
    return {
      mode: mode, subtotal: subtotal, deliveryFee: fee, feeKnown: fee !== null, total: total,
      vat: cfg.pricesIncludeVat ? round2(total * rate / (1 + rate)) : round2(total * rate),
      minimum: minimum, minimumMet: subtotal >= minimum, shortfall: round2(Math.max(0, minimum - subtotal)),
      freeThreshold: cfg.freeDeliveryThreshold, freeRemaining: round2(Math.max(0, cfg.freeDeliveryThreshold - subtotal)),
      freeDelivery: subtotal >= cfg.freeDeliveryThreshold,
      itemCount: lines.length
    };
  }

  /* ---------- validation ---------- */
  /* South African phone: 0XX XXX XXXX, +27 XX XXX XXXX, 27XXXXXXXXX, 0027...  Returns {valid, e164, local} */
  function phoneSA(input) {
    var raw = String(input == null ? "" : input).replace(/[\s\-().]/g, "");
    var m = /^(?:\+27|0027|27|0)([1-8]\d{8})$/.exec(raw);
    if (!m) return { valid: false };
    var n = m[1];
    return { valid: true, e164: "+27" + n, local: "0" + n.slice(0, 2) + " " + n.slice(2, 5) + " " + n.slice(5) };
  }
  function emailOk(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || "").trim()); }

  /* ---------- order ref + WhatsApp ---------- */
  function orderRef(rand) { rand = rand || Math.random; return "MAX-" + (10000 + Math.floor(rand() * 90000)); }

  function money(n) { var f = root.MaxisFormat; return f ? f.money(n) : "R" + Number(n).toFixed(2); }
  function dLabel(iso) { var f = root.MaxisFormat; return f ? f.dateShort(iso) : iso; }
  /* Plain-text order for WhatsApp (uses *bold* WhatsApp markup) */
  function whatsappText(o, cfg) {
    cfg = defCfg(cfg);
    var L = [];
    L.push("*New order " + o.ref + "* - " + cfg.shop.name);
    L.push("");
    L.push("Name: " + o.customer.name);
    L.push("Phone: " + o.customer.phone);
    if (o.customer.email) L.push("Email: " + o.customer.email);
    L.push("");
    if (o.fulfilment === "delivery") {
      L.push("*Delivery* to " + (o.address ? o.address + ", " : "") + (o.zoneName || ""));
    } else {
      L.push("*Collection* from " + cfg.shop.address);
    }
    if (o.slot) L.push("When: " + dLabel(o.slot.date) + ", " + o.slot.label);
    L.push("");
    L.push("*Items*");
    o.lines.forEach(function (l) {
      L.push("- " + l.name + " x " + (l.unit === "kg" ? l.qty + "kg" : l.qty) + " = " + money(l.total));
    });
    L.push("");
    L.push("Subtotal: " + money(o.totals.subtotal));
    if (o.fulfilment === "delivery") L.push("Delivery: " + (o.totals.deliveryFee ? money(o.totals.deliveryFee) : "Free"));
    L.push("*Total: " + money(o.totals.total) + "* (VAT incl.)");
    L.push("Payment: " + (o.payment ? o.payment.label : ""));
    if (o.notes) { L.push(""); L.push("Notes: " + o.notes); }
    L.push("");
    L.push("Weighted items are cut to order; final price adjusts to actual weight.");
    return L.join("\n");
  }
  function whatsappUrl(o, cfg) {
    cfg = defCfg(cfg);
    return "https://wa.me/" + cfg.shop.whatsapp + "?text=" + encodeURIComponent(whatsappText(o, cfg));
  }

  var api = {
    sast: sast, addDays: addDays, dowOf: dowOf, instant: instant, parseSlot: parseSlot,
    yomTovName: yomTovName, isShabbos: isShabbos, isClosedDay: isClosedDay, closedReason: closedReason,
    fridayCutoffPassed: fridayCutoffPassed, fridayCutoffInstant: fridayCutoffInstant,
    dayInfo: dayInfo, availableDays: availableDays, firstAvailable: firstAvailable, validateSlot: validateSlot,
    greeting: greeting, nextOpenDate: nextOpenDate, bannerState: bannerState,
    round2: round2, lineTotal: lineTotal, qtyStep: qtyStep, normalizeQty: normalizeQty, findZone: findZone, deliveryFee: deliveryFee, totals: totals,
    phoneSA: phoneSA, emailOk: emailOk, orderRef: orderRef, whatsappText: whatsappText, whatsappUrl: whatsappUrl
  };
  root.MaxisRules = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
