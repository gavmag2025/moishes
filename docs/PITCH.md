# Moishes Online: a pitch for the shop owner

*This is an independent demo prepared as a proposal. It is not affiliated with or endorsed by Moishes Butchery & Deli. All products and prices shown are placeholders.*

## The idea
Let customers build a Shabbos order on their phone in two minutes, sent straight to your WhatsApp, with
none of the monthly platform fees of typical online shops.

## Why it fits a kosher butchery
- **Catch the Thursday rush.** A clear "Order by Thursday 14:00 for Erev Shabbos" cut-off, enforced in the cart, so orders arrive earlier and calmer instead of a wall of phone calls.
- **Shabbos-aware.** No delivery slots on Shabbos or Yom Tov, Friday slot limits, closure dates you control.
- **Priced the way you sell.** Per-kg cuts in 0.5 kg steps, with packs and platters as single items. Estimate shown up front; final invoice after weighing.
- **WhatsApp order flow.** The customer's order lands as a ready-formatted WhatsApp message, the channel your customers already use.
- **No monthly fees.** Hosted free; there is no subscription to a platform.
- **Mobile-first.** Fast, installable, works on weak connections.
- **Kosher-correct.** Meat and pareve clearly labelled, no dairy suggestions, Pesach mode, Hebrew touches (בס״ד, Shabbat Shalom, Chag Sameach).

## Demo walk-through (about 5 minutes)
1. Open the home page on a phone: note the Erev Shabbos banner and greeting.
2. Shop > Beef: open a product, show the per-kg price, add 1.5 kg.
3. Add a Shabbos pack and a challah; open the cart and change quantities.
4. Checkout: choose a Glenhazel address, show zone fee/minimum, show that Saturday has no slots and that after Thursday 14:00 Friday is unavailable (change device date or show the rule in config).
5. Pick payment (EFT / pay on delivery); place the order.
6. Confirmation: reference number and the WhatsApp message button; open it to show the pre-filled order.
7. Show `kashrut.html` and explain that real certification wording would be approved by the supervising authority.
8. Show how a price or product is edited in one file.

## Pricing options for the seller (suggestions only, adjust to scope and market)
| Option | Range (ZAR, suggestion) | Notes |
|---|---|---|
| A. Setup fee only | R5,000 - R15,000 once | Real products, photos handed over, go-live, short training. Customer owns the site. |
| B. Setup + light retainer | R5,000 - R12,000 once + R500 - R1,500 per month | Updates to prices/specials, Yom Tov calendar, small fixes. |
| C. Full service (later phase) | Quoted separately | Payment gateway, order backend, notifications, admin; add transaction and provider costs. |

Third-party costs (domain about R100-R200 per year, payment fees per transaction) are passed through at cost.

## Objections
- **"I get orders by phone and it works."** Keep the phone. This removes the Thursday queue and written-down mistakes; customers who prefer calling still can.
- **"Weights change when you cut."** Correct, so the demo shows an estimate and the final invoice follows weighing. That is the standard model for meat.
- **"What about payment?"** Start with EFT and cash/card on delivery, exactly as today. Card payments can be added later (PayFast/Yoco/Ozow) when you are ready.
- **"Is my kashrut safe?"** Nothing is displayed as certified without your supervisor's approval; the demo uses placeholders only.
- **"I'm not technical."** Updates are one product list; a retainer can cover it for you.
- **"Is it secure / POPIA?"** The demo stores nothing on a server. Going live needs a privacy policy and proper data handling, outlined in docs/GOING-LIVE.md.
- **"What does it cost me monthly?"** Hosting is R0. Any monthly amount is only for services you choose (updates/support).
