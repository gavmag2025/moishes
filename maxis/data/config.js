/* Maxi's Online - shop configuration. DEMO DATA ONLY: not the real shop's prices, hours or certificates. */
window.MAXIS_CONFIG = {
  demo: true,
  pesach: false, // when true, storefront shows only products with pesach:true

  shop: {
    name: "Maxi's Discount Kosher Butchery",
    tagline: "Discount Kosher Butchery",
    hebrewHeader: "בס״ד",
    address: "74 George Avenue, Sandringham, Johannesburg",
    phoneDisplay: "011 485 1485",
    phoneTel: "+27114851485",
    whatsapp: "27114851485", // placeholder, digits only for wa.me/<number>
    email: "orders@example.com", // placeholder
    currency: "ZAR",
    currencySymbol: "R",
    timezone: "Africa/Johannesburg"
  },

  // Opening hours by weekday (0=Sun ... 6=Sat). null = closed. Based on public directory listings; DEMO, verify with the shop.
  hours: {
    0: { open: "09:00", close: "12:00" },
    1: { open: "07:00", close: "16:00" },
    2: { open: "07:00", close: "16:00" },
    3: { open: "07:00", close: "17:00" },
    4: { open: "07:00", close: "17:00" },
    5: { open: "07:00", close: "15:00" },
    6: null
  },
  hoursNote: "Closed Shabbos and Yom Tov. Erev Shabbos closing time follows candle lighting. Hours are indicative (demo).",

  // Ordering rules
  ordering: {
    fridayCutoff: { weekday: 4, time: "12:00" }, // Thursday 12:00 for Friday (Erev Shabbos) delivery/collection
    bannerText: "Order by Thursday 12:00 for Erev Shabbos",
    noShabbosDelivery: true,
    minLeadHours: 3,
    maxDaysAhead: 14,
    weightStepKg: 0.5,
    weightNote: "Weighted items are cut to order; final price is adjusted to the actual weight."
  },

  deliverySlots: {
    0: ["09:30-11:00", "11:00-12:00"],
    1: ["09:00-11:00", "11:00-13:00", "13:00-15:30"],
    2: ["09:00-11:00", "11:00-13:00", "13:00-15:30"],
    3: ["09:00-11:00", "11:00-13:00", "13:00-16:30"],
    4: ["09:00-11:00", "11:00-13:00", "13:00-16:30"],
    5: ["08:00-10:00", "10:00-12:00", "12:00-14:30"],
    6: []
  },
  collectionSlots: {
    0: ["09:00-12:00"],
    1: ["07:30-16:00"],
    2: ["07:30-16:00"],
    3: ["07:30-17:00"],
    4: ["07:30-17:00"],
    5: ["07:30-15:00"],
    6: []
  },

  // Delivery zones: fee in ZAR (VAT incl.), minimum order in ZAR
  deliveryZones: [
    { id: "sandringham",      name: "Sandringham",      fee: 0,   minimum: 250 },
    { id: "linksfield",       name: "Linksfield",       fee: 0,   minimum: 250 },
    { id: "glenhazel",        name: "Glenhazel",        fee: 35,  minimum: 300 },
    { id: "highlands-north",  name: "Highlands North",  fee: 35,  minimum: 300 },
    { id: "raedene",          name: "Raedene",          fee: 40,  minimum: 300 },
    { id: "orchards",         name: "Orchards",         fee: 40,  minimum: 300 },
    { id: "sydenham",         name: "Sydenham",         fee: 45,  minimum: 350 },
    { id: "savoy-estate",     name: "Savoy Estate",     fee: 45,  minimum: 350 },
    { id: "norwood",          name: "Norwood",          fee: 55,  minimum: 400 },
    { id: "waverley",         name: "Waverley",         fee: 60,  minimum: 400 },
    { id: "observatory",      name: "Observatory",      fee: 80,  minimum: 500 }
  ],
  freeDeliveryThreshold: 1200,
  vatRate: 0.15,
  pricesIncludeVat: true,

  // Yom Tov closed dates, Jewish year 5787 (Gregorian ISO dates, inclusive). VERIFY WITH LUACH before going live.
  // Diaspora (Johannesburg) two-day Yom Tov. Erev Yom Tov afternoons may close early.
  yomTovClosed: [
    { date: "2026-09-12", name: "Rosh Hashana (day 1)" },       // verify with luach
    { date: "2026-09-13", name: "Rosh Hashana (day 2)" },       // verify with luach
    { date: "2026-09-21", name: "Yom Kippur" },                 // verify with luach
    { date: "2026-09-26", name: "Sukkot (day 1)" },             // verify with luach
    { date: "2026-09-27", name: "Sukkot (day 2)" },             // verify with luach
    { date: "2026-10-03", name: "Shemini Atzeret" },            // verify with luach
    { date: "2026-10-04", name: "Simchat Torah" },              // verify with luach
    { date: "2027-04-22", name: "Pesach (day 1)" },             // verify with luach
    { date: "2027-04-23", name: "Pesach (day 2)" },             // verify with luach
    { date: "2027-04-28", name: "Pesach (day 7)" },             // verify with luach
    { date: "2027-04-29", name: "Pesach (day 8)" },             // verify with luach
    { date: "2027-06-11", name: "Shavuot (day 1)" },            // verify with luach
    { date: "2027-06-12", name: "Shavuot (day 2)" }             // verify with luach
  ],

  payments: [
    { id: "eft",        label: "EFT / Bank transfer",       enabled: true,  note: "Use your order reference as the payment reference and WhatsApp proof of payment." },
    { id: "cod-cash",   label: "Cash on delivery",          enabled: true,  note: "Please have the exact amount ready." },
    { id: "cod-card",   label: "Card on delivery",          enabled: true,  note: "Card machine brought by the driver." },
    { id: "collection", label: "Pay at collection",         enabled: true,  note: "Pay in store when you collect." },
    { id: "payfast",    label: "PayFast (card / instant EFT)", enabled: false, note: "Sandbox placeholder, coming soon." }
  ],
  banking: {
    accountName: "Maxi's Discount Butchery (DEMO)",
    bank: "Example Bank",
    accountNumber: "0000000000",
    branchCode: "000000",
    accountType: "Business Cheque",
    referenceHint: "Use your order reference, e.g. MAX-12345"
  },

  kashrut: {
    authority: "Kosher SA",
    statement: "Maxi's operates under Kosher SA supervision. All meat and poultry is fleishig (meat) and everything else sold is meat or pareve. No dairy is sold or handled.",
    disclaimer: "DEMO SITE: all products, prices, hours and kashrut details are dummy data for demonstration only. No kashrut certificate is claimed or implied. Always confirm with the shop and its supervising authority.",
    meatOnly: true,
    dairy: false
  },

  // Short kashrut note per category id (shown on category pages)
  kashrutNotes: {
    "beef": "Shechted by a certified shochet, porged (nikkur) of forbidden fats and nerves, and salted and rinsed (kashered) under supervision. Forequarter cuts only; glatt standard.",
    "lamb": "Shechted, porged and kashered under supervision. Lamb is forequarter only; hindquarter chops and rump are not sold unless fully nikkur-ed.",
    "poultry": "Shechted, checked and kashered under supervision. All chicken and turkey is fleishig and sold glatt standard.",
    "mince-burgers": "Ground and prepared in-house from kashered meat only, under supervision. Sausage casings are kosher.",
    "deli": "Cured, smoked and dried products are made from kosher meat only. Biltong and droewors are fleishig.",
    "ready-meals": "Cooked on kosher meat equipment under supervision. All hot food is fleishig. Cholent is placed on the blech for Shabbos on request.",
    "bakery": "Bakery is 100% pareve and sold Pas Yisroel where marked. No dairy ingredients enter the bakery.",
    "pantry": "Salads and dips are pareve unless labelled Meat (e.g. chopped liver). No dairy.",
    "shabbos-packs": "Packs and platters are fleishig or pareve as labelled. Order by Thursday 12:00 for Erev Shabbos."
  },

  faq: [
    {
      q: "Is everything kosher?",
      a: "Yes. The shop operates under Kosher SA supervision (demo statement). Every item is marked Meat or Pareve, and no dairy is sold."
    },
    {
      q: "What is shechita?",
      a: "Shechita is the Jewish method of ritual slaughter, carried out by a trained and certified shochet using a perfectly smooth blade. The animal is then checked (bedika) and only permitted animals are used."
    },
    {
      q: "What is nikkur (porging)?",
      a: "Nikkur, also called porging, is the removal of forbidden fats (chelev), blood vessels and the sciatic nerve. This is why only certain cuts, mostly from the forequarter, are available in kosher butcheries."
    },
    {
      q: "How is the meat salted and kashered?",
      a: "After soaking, the meat is covered in coarse salt for an hour and then rinsed thoroughly to draw out blood. Liver is kashered separately by broiling. Our meat is sold already kashered and ready to cook."
    },
    {
      q: "What does Glatt mean?",
      a: "Glatt means smooth. It refers to the lungs of the animal being free of adhesions. Glatt is a higher standard of kashrut and is the default for our beef and lamb."
    },
    {
      q: "What is Pas Yisroel?",
      a: "Pas Yisroel means the baking was done or started by a Jew. Items marked Pas Yisroel in our bakery meet this standard in addition to being pareve."
    },
    {
      q: "Do you sell Cholov Yisroel items?",
      a: "Not applicable. We sell meat and pareve products only, so there is no dairy of any kind in the shop."
    },
    {
      q: "Can I serve your bakery items with a meat meal?",
      a: "Yes. The bakery is pareve, so challah, rolls, cakes and rugelach can be served at a fleishig meal. Please follow your own family minhag regarding waiting times."
    },
    {
      q: "What is the order cut-off for Shabbos?",
      a: "Orders for Friday must be placed by Thursday 12:00. We do not deliver on Shabbos or Yom Tov."
    },
    {
      q: "Do you have a Pesach range?",
      a: "Pesach products carry a Pesach tag and are shown when Pesach mode is on. Everything is subject to Pesach supervision. This is a demo, so confirm with the shop."
    }
  ]
};
