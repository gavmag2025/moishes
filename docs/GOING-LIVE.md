# From demo to production: honest roadmap

This is a demo. The list below is what stands between it and taking real orders for Moishes.
Nothing here has been agreed with the shop; items marked "needs shop input" depend on the owner.

## What is dummy today

- All products, descriptions, prices, stock flags and pack sizes.
- Phone, WhatsApp number, email, address details, trading hours (verify every one with the shop).
- Banking details for EFT, delivery zones, fees and minimum orders.
- Kashrut wording, tags (Mehadrin, Pas Yisroel etc.) and any certificate references. No real certificate is shown or implied.
- Product art (illustrative SVGs, not photos).
- Yom Tov dates and Pesach product flags (must be maintained).
- Orders: kept only in the customer's browser; the admin and orders pages are demo views with no login.
- PayFast option is a disabled placeholder.

## 1. Payments
- Choose a gateway: PayFast, Yoco or Ozow (compare fees, settlement time, onboarding needs). EFT and
  cash/card-on-delivery can stay as options.
- Card gateways need a small server-side step (signature/ITN verification), so this pairs with step 2.
- Never put secret keys in the static site.

## 2. Real order backend
- Free-tier options: Supabase (database) and/or Cloudflare Workers; or a form service such as Formspree for a simpler start.
- Each order stored server-side with a reference, items, delivery slot and contact details.
- Notify the shop by email and/or WhatsApp (Business app or API; the API has per-message costs).
- Replace the demo admin with an authenticated order list (print/pack list, status updates).
- Check free-tier limits against expected volume, especially Thursday peaks.

## 3. Weight-based pricing and inventory
- Meat is sold per kg, so the customer pays an estimate; the final invoice is issued after weighing at packing.
- Decide policy: tolerance (e.g. +/- 10%), whether payment is authorised then captured, how refunds/top-ups work.
- Inventory: simple in-stock/out-of-stock toggles first; real stock counts later. Needs shop input on who updates it daily.

## 4. Legal and compliance (get professional advice)
- POPIA: privacy policy, what personal data is collected, consent, retention, a named information officer, secure storage.
- Terms and conditions, delivery terms, and a returns/refunds policy suited to perishables (cold chain, report-on-delivery window, no returns on opened food).
- Consumer Protection Act and ECTA disclosures (business name, address, contact, VAT number if registered, price incl. VAT).
- Cookie/storage notice if analytics are added.

## 5. Kashrut
- Display of the hechsher/certification must be approved by the relevant authority (the shop's supervising
  body, e.g. the Mehadrin Commission, if that is who supervises them). Obtain written approval for wording and logos.
- Keep the meat/pareve separation and no-dairy rule; review any new product with the shop and supervisor.
- Pas Yisroel and Mehadrin tags must reflect real product status per item.

## 6. Calendar and operations
- Maintain the Yom Tov / closure list and Shabbos cut-off times in `data/config.js` each year (Friday slot end times shift with the season).
- Turn Pesach mode on/off and flag only Pesach-suitable products.
- Confirm delivery capacity, zones, fees and cut-offs with the owner.

## 7. Content
- Professional photography of real products; real descriptions and cuts.
- Real shop copy, "about" story and contact details, approved by the owner.

## 8. Launch checklist
Domain (optional), real data, payment test, privacy/terms pages, order notification test, backup plan if
WhatsApp/backend is down, staff training, soft launch with regular customers.
