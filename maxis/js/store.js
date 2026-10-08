/* store.js - cart / orders / customer persistence in localStorage, with in-memory fallback. */
(function (root) {
  var KEYS = { cart: "maxis.cart.v1", orders: "maxis.orders.v1", customer: "maxis.customer.v1" };
  var mem = {};
  var useLS = (function () {
    try { var k = "__maxis_t"; root.localStorage.setItem(k, "1"); root.localStorage.removeItem(k); return true; } catch (e) { return false; }
  })();
  function read(key, def) {
    var raw = null;
    try { raw = useLS ? root.localStorage.getItem(key) : mem[key]; } catch (e) { raw = mem[key]; }
    if (raw == null) return def;
    try { var v = JSON.parse(raw); return v == null ? def : v; } catch (e) { return def; }
  }
  function write(key, val) {
    var s = JSON.stringify(val);
    mem[key] = s;
    try { if (useLS) root.localStorage.setItem(key, s); } catch (e) { /* quota / private mode: memory copy remains */ }
  }
  function emit(name) {
    try { root.document.dispatchEvent(new root.CustomEvent(name)); } catch (e) { /* ignore */ }
  }

  /* ----- cart: [{id, qty}] ----- */
  function getCart() {
    var c = read(KEYS.cart, []);
    if (!Array.isArray(c)) return [];
    return c.filter(function (l) { return l && typeof l.id === "string" && isFinite(l.qty) && l.qty > 0; });
  }
  function setCart(c) { write(KEYS.cart, c); emit("maxis:cart"); }
  function qtyOf(id) { var c = getCart(); for (var i = 0; i < c.length; i++) if (c[i].id === id) return c[i].qty; return 0; }
  function add(id, q) {
    var c = getCart(), f = false;
    c.forEach(function (l) { if (l.id === id) { l.qty = Math.round((l.qty + q) * 1000) / 1000; f = true; } });
    if (!f) c.push({ id: id, qty: q });
    setCart(c);
  }
  function setQty(id, q) {
    var c = getCart();
    if (!(q > 0)) c = c.filter(function (l) { return l.id !== id; });
    else { var f = false; c.forEach(function (l) { if (l.id === id) { l.qty = q; f = true; } }); if (!f) c.push({ id: id, qty: q }); }
    setCart(c);
  }
  function remove(id) { setQty(id, 0); }
  function clear() { setCart([]); }

  /* ----- orders ----- */
  function getOrders() { var o = read(KEYS.orders, []); return Array.isArray(o) ? o : []; }
  function saveOrder(order) { var o = getOrders(); o.unshift(order); write(KEYS.orders, o); emit("maxis:orders"); return order; }
  function setOrders(list) { write(KEYS.orders, list); emit("maxis:orders"); }
  function getOrder(ref) { var o = getOrders(); for (var i = 0; i < o.length; i++) if (o[i].ref === ref) return o[i]; return null; }
  function updateOrder(ref, patch) {
    var o = getOrders();
    o.forEach(function (x) { if (x.ref === ref) for (var k in patch) x[k] = patch[k]; });
    write(KEYS.orders, o); emit("maxis:orders");
  }

  /* ----- customer (prefill) ----- */
  function getCustomer() { var c = read(KEYS.customer, {}); return c && typeof c === "object" ? c : {}; }
  function saveCustomer(c) { var cur = getCustomer(); for (var k in c) cur[k] = c[k]; write(KEYS.customer, cur); }

  root.MaxisStore = {
    keys: KEYS, persistent: useLS,
    getCart: getCart, setCart: setCart, qtyOf: qtyOf, add: add, setQty: setQty, remove: remove, clear: clear,
    getOrders: getOrders, saveOrder: saveOrder, setOrders: setOrders, getOrder: getOrder, updateOrder: updateOrder,
    getCustomer: getCustomer, saveCustomer: saveCustomer
  };
  /* keep tabs in sync */
  try { root.addEventListener("storage", function (e) { if (e.key === KEYS.cart) emit("maxis:cart"); if (e.key === KEYS.orders) emit("maxis:orders"); }); } catch (e) { /* ignore */ }
})(window);
