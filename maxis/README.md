# Maxi's Discount Kosher Butchery (demo)

A second demo storefront, same idea and same demo catalogue as the Moishes site one folder up, but with a
different look: a bold "discount flyer" style (ink black, signal red, price-tag yellow, condensed caps)
and a motion layer.

Live path once deployed: `/moishes/maxis/`. Run locally from the repo root: `python3 -m http.server 8080`
then open `http://localhost:8080/maxis/`.

> **Demo only.** Shop name, address (74 George Avenue, Sandringham), phone and Kosher SA supervision come from
> public directory listings; hours, prices, banking details and delivery fees are placeholders. Not affiliated
> with or approved by Maxi's or Kosher SA.

## Libraries (vendored in `vendor/`, no build step)

- [GSAP](https://github.com/greensock/gsap) 3.15 (+ ScrollTrigger, SplitText) - animation
- [Lenis](https://github.com/darkroomengineering/lenis) 1.3.26 - smooth scroll
- [React Bits](https://github.com/DavidHDev/react-bits) - React-only, so its ideas are ported to vanilla JS in
  `js/fx.js` (SplitText reveal, CountUp, marquee, Magnet, GlareHover). Licence: MIT + Commons Clause.

All effects switch off under `prefers-reduced-motion`, and the site works without JavaScript animation.

Storage keys, events and the order prefix (`MAX-`) are namespaced so this site does not clash with Moishes,
which shares the same origin.
