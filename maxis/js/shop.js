/* shop.js - catalogue page: category / search / sort / tag / meat-pareve filters, state in the URL. */
(function (root) {
  var doc = root.document, F = root.MaxisFormat, UI = root.MaxisUI, C = root.MaxisCatalog, cfg = root.MAXIS_CONFIG;
  var esc = F.esc;
  var $ = UI.$;
  var params = new URLSearchParams(root.location.search);
  var state = { cat: params.get("cat") || "", q: params.get("q") || "", sort: params.get("sort") || "featured", tag: params.get("tag") || "", kosher: params.get("kosher") || "" };
  if (!C.category(state.cat)) state.cat = "";
  if (!C.sorts[state.sort]) state.sort = "featured";
  if (["Meat", "Pareve"].indexOf(state.kosher) < 0) state.kosher = "";

  var all = C.visible();
  function matches(p, skip) {
    if (skip !== "cat" && state.cat && p.category !== state.cat) return false;
    if (skip !== "kosher" && state.kosher && p.kosher !== state.kosher) return false;
    if (skip !== "tag" && state.tag && (p.tags || []).indexOf(state.tag) < 0) return false;
    if (state.q) {
      var hay = (p.name + " " + p.desc + " " + (p.tags || []).join(" ") + " " + C.categoryLabel(p.category) + " " + p.kosher).toLowerCase();
      return state.q.toLowerCase().split(/\s+/).filter(Boolean).every(function (w) { return hay.indexOf(w) >= 0; });
    }
    return true;
  }
  function chip(label, pressed, attr, val, count) {
    return '<button class="chip" type="button" aria-pressed="' + pressed + '" data-' + attr + '="' + esc(val) + '">' + esc(label) + (count != null ? ' <span class="chip__count">' + count + "</span>" : "") + "</button>";
  }
  function renderChips() {
    var cats = '<button class="chip" type="button" aria-pressed="' + (!state.cat) + '" data-cat="">All <span class="chip__count">' + all.filter(function (p) { return matches(p, "cat"); }).length + "</span></button>";
    C.categories.forEach(function (c) {
      var n = all.filter(function (p) { return p.category === c.id && matches(p, "cat"); }).length;
      if (n || state.cat === c.id) cats += chip(c.label, state.cat === c.id, "cat", c.id, n);
    });
    $("#cat-chips").innerHTML = cats;
    $("#kosher-chips").innerHTML = chip("Any", !state.kosher, "kosher", "") + chip("Meat", state.kosher === "Meat", "kosher", "Meat") + chip("Pareve", state.kosher === "Pareve", "kosher", "Pareve");
    var tg = C.tags().filter(function (t) { return ["Kosher SA", "Shabbos", "Braai", "Glatt", "Pas Yisroel", "Yom Tov", "Catering", "Pesach"].indexOf(t) >= 0 || t === state.tag; });
    $("#tag-chips").innerHTML = chip("All", !state.tag, "tag", "") + tg.map(function (t) { return chip(t, state.tag === t, "tag", t); }).join("");
  }
  function render() {
    var list = all.filter(function (p) { return matches(p); }).sort(function (a, b) { return C.sorts[state.sort](a, b) || all.indexOf(a) - all.indexOf(b); });
    renderChips();
    var grid = $("#product-grid");
    if (!list.length) {
      grid.innerHTML = '<li class="shop__empty"><div class="empty"><img class="empty__art" src="assets/art/generic-meat.svg" alt=""><h2 class="empty__title">Nothing matches</h2><p class="empty__text">Try a different search or clear the filters.</p><button class="btn btn--primary" type="button" id="clear-filters">Clear filters</button></div></li>';
    } else grid.innerHTML = list.map(UI.productCard).join("");
    UI.refreshActions();
    var cat = C.category(state.cat);
    $("#count").textContent = list.length + (list.length === 1 ? " product" : " products");
    $("#shop-title").textContent = cat ? cat.label : "The butchery & deli";
    var note = $("#cat-note");
    if (cat && cfg.kashrutNotes[cat.id]) { note.hidden = false; note.querySelector("p").textContent = cfg.kashrutNotes[cat.id]; } else note.hidden = true;
    doc.title = (cat ? cat.label + " - " : "") + "Shop - Maxi's Discount Kosher Butchery";
    /* url state */
    var u = new URLSearchParams();
    ["cat", "q", "tag", "kosher"].forEach(function (k) { if (state[k]) u.set(k, state[k]); });
    if (state.sort !== "featured") u.set("sort", state.sort);
    try { root.history.replaceState(null, "", root.location.pathname + (u.toString() ? "?" + u : "")); } catch (e) { /* ignore */ }
  }
  doc.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cat],[data-kosher],[data-tag],#clear-filters"); if (!b) return;
    if (b.id === "clear-filters") { state.cat = state.q = state.tag = state.kosher = ""; $("#q").value = ""; }
    else if (b.hasAttribute("data-cat")) state.cat = b.getAttribute("data-cat");
    else if (b.hasAttribute("data-kosher")) state.kosher = b.getAttribute("data-kosher");
    else if (b.hasAttribute("data-tag")) state.tag = b.getAttribute("data-tag");
    var fk = b.id === "clear-filters" ? null : b.outerHTML.match(/data-(cat|kosher|tag)="[^"]*"/)[0];
    render();
    if (fk) { var n = $("[" + fk + "]"); if (n) n.focus(); }
  });
  var timer;
  $("#q").value = state.q;
  $("#q").addEventListener("input", function (e) { root.clearTimeout(timer); timer = root.setTimeout(function () { state.q = e.target.value.trim(); render(); }, 150); });
  $("#search-form").addEventListener("submit", function (e) { e.preventDefault(); });
  $("#sort").value = state.sort;
  $("#sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
  if (cfg.pesach) $("#pesach-note").hidden = false;
  render();
})(window);
