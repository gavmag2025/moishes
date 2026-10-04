/* content.js - fills config-driven blocks marked with data-bind="..." (home, about, kashrut, contact). */
(function (root) {
  var doc = root.document, F = root.MoishesFormat, UI = root.MoishesUI, C = root.MoishesCatalog, cfg = root.MOISHES_CONFIG, R = root.MoishesRules;
  var esc = F.esc, money = F.money;
  var ORDER = [1, 2, 3, 4, 5, 6, 0], NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Shabbos (Saturday)"];

  function hoursHTML() {
    var rows = ORDER.map(function (d) {
      var h = cfg.hours[d];
      return "<tr><th scope=\"row\">" + NAMES[d] + "</th><td>" + (h ? esc(h.open) + " - " + esc(h.close) : "Closed") + "</td></tr>";
    }).join("");
    return '<table class="hours"><caption class="visually-hidden">Opening hours</caption><tbody>' + rows + "</tbody></table><p class=\"text-sm muted\">" + esc(cfg.hoursNote) + "</p>";
  }
  function faqHTML(limit) {
    return (cfg.faq || []).slice(0, limit || 99).map(function (f) {
      return '<details class="faq__item"><summary class="faq__q">' + esc(f.q) + '</summary><div class="faq__a"><p>' + esc(f.a) + "</p></div></details>";
    }).join("");
  }
  function zonesHTML() {
    return '<ul class="zone-list">' + cfg.deliveryZones.map(function (z) {
      return "<li><strong>" + esc(z.name) + "</strong> - " + (z.fee ? money(z.fee) : "free") + ", min " + money(z.minimum) + "</li>";
    }).join("") + "</ul><p class=\"text-sm muted\">Free delivery on orders of " + money(cfg.freeDeliveryThreshold) + " or more, in any zone.</p>";
  }
  function categoriesHTML() {
    var counts = C.counts();
    return C.categories.filter(function (c) { return counts[c.id]; }).map(function (c) {
      return '<li><a class="cat-tile" href="shop.html?cat=' + encodeURIComponent(c.id) + '"><img class="cat-tile__art" src="assets/art/' + c.art + '.svg" alt="" loading="lazy"><span class="cat-tile__body"><span class="cat-tile__name">' + esc(c.label) + '</span><span class="cat-tile__count">' + counts[c.id] + (counts[c.id] === 1 ? " item" : " items") + "</span></span></a></li>";
    }).join("");
  }
  function featuredHTML(limit) {
    var list = C.visible().filter(function (p) { return p.featured; });
    if (list.length < limit) list = list.concat(C.visible().filter(function (p) { return !p.featured && p.badge; }));
    return list.slice(0, limit).map(UI.productCard).join("");
  }
  function notesHTML() {
    return C.categories.map(function (c) {
      return cfg.kashrutNotes[c.id] ? '<div class="info-card"><h3>' + esc(c.label) + "</h3><p>" + esc(cfg.kashrutNotes[c.id]) + '</p><a class="btn btn--text" href="shop.html?cat=' + encodeURIComponent(c.id) + '">Shop ' + esc(c.label) + "</a></div>" : "";
    }).join("");
  }
  function bankingHTML() {
    var b = cfg.banking, rows = [["Account name", b.accountName], ["Bank", b.bank], ["Account number", b.accountNumber], ["Branch code", b.branchCode], ["Account type", b.accountType]];
    return '<dl class="totals">' + rows.map(function (r) { return '<div class="totals__row"><dt>' + r[0] + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl><p class=\"text-sm muted\">" + esc(b.referenceHint) + "</p>";
  }
  var BIND = {
    hours: function () { return hoursHTML(); }, faq: function (el) { return faqHTML(+el.getAttribute("data-limit")); }, zones: zonesHTML,
    categories: categoriesHTML, featured: function (el) { return featuredHTML(+el.getAttribute("data-limit") || 8); },
    "kashrut-notes": notesHTML, banking: bankingHTML
  };
  function path(o, p) { return p.split(".").reduce(function (a, k) { return a == null ? a : a[k]; }, o); }

  function run() {
    Array.prototype.forEach.call(doc.querySelectorAll("[data-bind]"), function (el) {
      var f = BIND[el.getAttribute("data-bind")]; if (f) el.innerHTML = f(el);
    });
    Array.prototype.forEach.call(doc.querySelectorAll("[data-text]"), function (el) {
      var v = path(cfg, el.getAttribute("data-text")); if (v != null) el.textContent = v;
    });
    Array.prototype.forEach.call(doc.querySelectorAll("[data-link]"), function (el) {
      var k = el.getAttribute("data-link");
      if (k === "tel") el.href = "tel:" + cfg.shop.phoneTel;
      else if (k === "wa") el.href = "https://wa.me/" + cfg.shop.whatsapp;
      else if (k === "mail") el.href = "mailto:" + cfg.shop.email;
    });
    Array.prototype.forEach.call(doc.querySelectorAll("[data-greeting]"), function (el) { var g = R.greeting(UI.now(), cfg); el.textContent = g.en + " "; });
    UI.refreshActions();
  }
  run();
})(window);
