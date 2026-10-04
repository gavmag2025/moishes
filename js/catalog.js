/* catalog.js - read-only helpers over window.MOISHES_PRODUCTS / MOISHES_CONFIG. */
(function (root) {
  var CATS = [
    { id: "beef", label: "Beef", art: "beef-ribs" },
    { id: "lamb", label: "Lamb", art: "lamb-chops" },
    { id: "poultry", label: "Chicken & Poultry", art: "chicken-whole" },
    { id: "mince-burgers", label: "Mince, Burgers & Sausages", art: "burger" },
    { id: "deli", label: "Deli & Biltong", art: "salami" },
    { id: "ready-meals", label: "Hot Food & Ready Meals", art: "cholent" },
    { id: "bakery", label: "Challah, Rolls & Cakes", art: "challah" },
    { id: "pantry", label: "Salads, Dips & Pantry", art: "hummus" },
    { id: "shabbos-packs", label: "Shabbos Packs & Catering", art: "shabbos-box" }
  ];
  var cfg = root.MOISHES_CONFIG || {};
  var all = root.MOISHES_PRODUCTS || [];
  var byId = {};
  all.forEach(function (p) { byId[p.id] = p; });

  function pesachOn() { return !!cfg.pesach; }
  /* products visible on the storefront (Pesach mode honoured) */
  function visible() { return pesachOn() ? all.filter(function (p) { return p.pesach; }) : all.slice(); }
  function get(id) { return byId[id] || null; }
  function category(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i]; return null; }
  function categoryLabel(id) { var c = category(id); return c ? c.label : id; }
  function counts() { var o = {}; visible().forEach(function (p) { o[p.category] = (o[p.category] || 0) + 1; }); return o; }
  function tags() {
    var o = {};
    visible().forEach(function (p) { (p.tags || []).forEach(function (t) { o[t] = (o[t] || 0) + 1; }); });
    return Object.keys(o).sort(function (a, b) { return o[b] - o[a] || a.localeCompare(b); });
  }
  function related(p, n) {
    var same = visible().filter(function (x) { return x.id !== p.id && x.category === p.category; });
    var rest = visible().filter(function (x) { return x.id !== p.id && x.category !== p.category && x.kosher === p.kosher; });
    return same.concat(rest).slice(0, n || 4);
  }
  /* sort helpers */
  var SORTS = {
    featured: function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); },
    "price-asc": function (a, b) { return a.price - b.price; },
    "price-desc": function (a, b) { return b.price - a.price; },
    "name-asc": function (a, b) { return a.name.localeCompare(b.name); }
  };
  root.MoishesCatalog = { categories: CATS, all: all, visible: visible, get: get, category: category, categoryLabel: categoryLabel, counts: counts, tags: tags, related: related, sorts: SORTS, pesachOn: pesachOn };
})(window);
