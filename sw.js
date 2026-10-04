/* sw.js - small offline shell. Bump VERSION on every deploy to bust old caches.
   Strategy: same-origin GETs are network-first (fresh when online), falling back to cache offline. Cross-origin (fonts) untouched. */
var VERSION = "moishes-v1-2026-10";
var SHELL = ["./", "index.html", "shop.html", "product.html", "cart.html", "checkout.html", "confirmation.html", "about.html", "kashrut.html", "contact.html", "orders.html", "404.html",
  "css/tokens.css", "css/base.css", "css/components.css", "css/pages.css", "css/engineer.css",
  "data/config.js", "data/products.js", "js/format.js", "js/catalog.js", "js/rules.js", "js/store.js", "js/ui.js", "js/content.js", "js/shop.js", "js/product.js", "js/cart.js", "js/checkout.js", "js/confirmation.js", "js/orders.js",
  "assets/icons.svg", "assets/favicon.svg", "assets/logo.svg", "assets/logo-light.svg", "assets/art/generic-meat.svg", "manifest.webmanifest"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    /* tolerate individual failures so one 404 cannot block install */
    return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(function (res) {
    if (res && res.ok && res.type === "basic") { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: req.mode === "navigate" }).then(function (hit) {
      return hit || (req.mode === "navigate" ? caches.match("404.html") : Response.error());
    });
  }));
});
