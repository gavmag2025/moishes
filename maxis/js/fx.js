/* fx.js - motion layer for Maxi's. Progressive enhancement: the site works fully without it.
   Uses GSAP (+ScrollTrigger, SplitText) and Lenis, vendored in /vendor.
   Effects are small vanilla ports of ideas from React Bits (github.com/DavidHDev/react-bits):
   SplitText/BlurText reveal, CountUp, LogoLoop/ScrollVelocity marquee, Magnet, GlareHover. */
(function (root) {
  var doc = root.document, gsap = root.gsap, ST = root.ScrollTrigger, Lenis = root.Lenis;
  var reduce = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = root.matchMedia && root.matchMedia("(hover: hover) and (pointer: fine)").matches;
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function safe(fn) { try { fn(); } catch (e) { if (root.console) root.console.warn("fx:", e); } }

  /* ---------- CountUp (values come from the shop data, so they stay true) ---------- */
  function countTarget(el) {
    var C = root.MaxisCatalog, cfg = root.MAXIS_CONFIG, from = el.getAttribute("data-from");
    if (from === "products" && C) return C.visible().length;
    if (from === "zones" && cfg) return cfg.deliveryZones.length;
    if (from === "free" && cfg) return cfg.freeDeliveryThreshold;
    return +el.getAttribute("data-to") || 0;
  }
  function setupCounts() {
    $$("[data-countup]").forEach(function (el) {
      var to = countTarget(el);
      if (reduce || !gsap || !ST) { el.textContent = to.toLocaleString("en-ZA"); return; }
      var o = { v: 0 };
      el.textContent = "0";
      ST.create({ trigger: el, start: "top 90%", once: true, onEnter: function () {
        gsap.to(o, { v: to, duration: 1.8, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString("en-ZA"); },
          onComplete: function () { el.textContent = to.toLocaleString("en-ZA"); } });
      } });
    });
  }

  /* ---------- Lenis smooth scroll, driven by the GSAP ticker ---------- */
  var lenis = null;
  function setupLenis() {
    if (reduce || !Lenis || !gsap) return;
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    doc.documentElement.classList.add("lenis-on");
    if (ST) lenis.on("scroll", ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    /* pause while a modal (drawer / mobile menu) locks the body */
    new root.MutationObserver(function () {
      if (doc.body.classList.contains("no-scroll")) lenis.stop(); else lenis.start();
    }).observe(doc.body, { attributes: true, attributeFilter: ["class"] });
    doc.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute("href").length < 2) return;
      var t = doc.querySelector(a.getAttribute("href"));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); }
    });
  }

  /* ---------- hero + headings: SplitText reveal ---------- */
  function setupSplit() {
    if (reduce || !gsap || !root.SplitText) return;
    gsap.registerPlugin(root.SplitText);
    $$("[data-split]").forEach(function (el) {
      var hero = !!el.closest(".mx-hero");
      root.SplitText.create(el, { type: "lines,words", mask: "lines", autoSplit: true, onSplit: function (self) {
        var cfg = { yPercent: 110, rotate: 4, duration: 0.9, ease: "power4.out", stagger: 0.07 };
        if (!hero) cfg.scrollTrigger = { trigger: el, start: "top 88%", once: true };
        else cfg.delay = 0.1;
        return gsap.from(self.words, cfg);
      } });
    });
  }

  /* ---------- generic reveals ---------- */
  function setupReveals() {
    if (reduce || !gsap || !ST) return;
    $$('[data-fx="rise"]').forEach(function (el, i) {
      gsap.from(el, { y: 28, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.35 + i * 0.08, clearProps: "transform,opacity" });
    });
    $$("[data-stagger]").forEach(function (list) {
      var kids = $$(":scope > *", list);
      if (!kids.length) return;
      gsap.from(kids, { y: 36, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.06, clearProps: "transform,opacity",
        scrollTrigger: { trigger: list, start: "top 85%", once: true } });
    });
    if ($$(".mx-stats__list li").length) gsap.from(".mx-stats__list li", { y: 24, opacity: 0, duration: 0.6, stagger: 0.08, ease: "power2.out", clearProps: "transform,opacity",
      scrollTrigger: { trigger: ".mx-stats", start: "top 90%", once: true } });
    /* hero photos: pop in, then drift with scroll (parallax) */
    if ($$(".mx-photo").length) gsap.from(".mx-photo", { scale: 0.8, rotate: 0, opacity: 0, duration: 0.9, ease: "back.out(1.6)", stagger: 0.12, delay: 0.25, clearProps: "opacity" });
    $$("[data-parallax]").forEach(function (el) {
      gsap.to(el, { y: +el.getAttribute("data-parallax"), ease: "none", scrollTrigger: { trigger: ".mx-hero", start: "top top", end: "bottom top", scrub: true } });
    });
    $$("[data-spin]").forEach(function (el) { gsap.to(el, { rotation: 360, duration: 24, ease: "none", repeat: -1 }); });
  }

  /* ---------- marquee (LogoLoop-style) that speeds up with scroll velocity ---------- */
  function setupMarquee() {
    $$("[data-marquee]").forEach(function (track) {
      var items = $$(":scope > *", track);
      items.forEach(function (n) { track.appendChild(n.cloneNode(true)); });
      if (reduce || !gsap) return;
      var tween = gsap.to(track, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
      if (ST) ST.create({ trigger: track, start: "top bottom", end: "bottom top", onUpdate: function (self) {
        var v = Math.min(Math.abs(self.getVelocity()) / 400, 6);
        gsap.to(tween, { timeScale: 1 + v, duration: 0.2, overwrite: true });
        gsap.to(tween, { timeScale: 1, duration: 0.9, delay: 0.2, overwrite: "auto" });
      } });
    });
  }

  /* ---------- Magnet buttons + GlareHover cards, via event delegation (cards render late) ---------- */
  function setupPointer() {
    if (reduce || !fine) return;
    var mag = null, qx, qy;
    doc.addEventListener("pointermove", function (e) {
      var card = e.target.closest && e.target.closest(".product-card, .cat-tile, .info-card");
      if (card) { var r = card.getBoundingClientRect(); card.style.setProperty("--gx", ((e.clientX - r.left) / r.width * 100) + "%"); card.style.setProperty("--gy", ((e.clientY - r.top) / r.height * 100) + "%"); }
      var m = e.target.closest && e.target.closest("[data-magnet]");
      if (m && gsap) {
        if (m !== mag) { mag = m; qx = gsap.quickTo(m, "x", { duration: 0.4, ease: "power3" }); qy = gsap.quickTo(m, "y", { duration: 0.4, ease: "power3" }); }
        var b = m.getBoundingClientRect();
        qx((e.clientX - (b.left + b.width / 2)) * 0.25); qy((e.clientY - (b.top + b.height / 2)) * 0.35);
      } else if (mag) { qx(0); qy(0); mag = null; }
    }, { passive: true });
  }

  function init() {
    safe(setupLenis);
    safe(setupCounts);
    safe(setupMarquee);
    safe(setupPointer);
    var go = function () { safe(setupSplit); safe(setupReveals); if (ST) ST.refresh(); };
    if (gsap && ST) gsap.registerPlugin(ST);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(go); else go();
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init); else init();
})(window);
