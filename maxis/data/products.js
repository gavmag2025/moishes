/* Maxi's Online - DUMMY demo catalog. Prices are invented 2026 ZAR (VAT incl.). Not the real shop's data. */
(function () {
  var L = [];
  // p(id, name, category, price, unit, pack, art, kosher, tags, desc, extra)
  function p(id, name, category, price, unit, pack, art, kosher, tags, desc, x) {
    x = x || {};
    var o = { id: id, name: name, category: category, price: price, unit: unit };
    if (pack) o.pack = pack;
    o.desc = desc; o.kosher = kosher; o.tags = tags; o.art = art;
    o.featured = !!x.featured; o.pesach = !!x.pesach; o.stock = x.stock !== false; o.badge = x.badge || null;
    L.push(o);
  }
  var M = "Meat", P = "Pareve";

  // ---- BEEF ----
  p("beef-short-ribs", "Beef Short Ribs", "beef", 189.9, "kg", "~1kg", "beef-ribs", M, ["Kosher SA", "Glatt", "Shabbos", "Braai"], "Thick, marbled short ribs that turn fall-off-the-bone tender on the braai or slow in the oven.", { pesach: true, badge: "Popular" });
  p("beef-flanken-ribs", "Flanken Cut Ribs", "beef", 169.9, "kg", "~1kg", "beef-ribs", M, ["Kosher SA", "Glatt", "Shabbos"], "Cross-cut flanken ribs, perfect for cholent, braising or a sticky BBQ glaze.", { pesach: true });
  p("beef-rump-steak", "Rump Steak", "beef", 209.9, "kg", "~500g", "steak", M, ["Kosher SA", "Glatt", "Braai"], "Full-flavoured South African rump, cut thick and ready for a hot grid.", { pesach: true });
  p("beef-sirloin-steak", "Sirloin Steak", "beef", 249.9, "kg", "~500g", "steak", M, ["Kosher SA", "Glatt", "Braai", "Shabbos"], "A classic sirloin with a good edge of fat for a juicy, deeply savoury steak.", { pesach: true });
  p("beef-ribeye", "Rib-Eye Steak", "beef", 289.9, "kg", "~500g", "steak", M, ["Kosher SA", "Glatt", "Braai"], "Beautifully marbled rib-eye that sizzles to a caramelised crust and a rosy centre.", { pesach: true, badge: "New" });
  p("beef-brisket", "Beef Brisket", "beef", 159.9, "kg", "~2kg", "brisket", M, ["Kosher SA", "Glatt", "Shabbos", "Yom Tov"], "The Shabbos table staple: slow-roast until it slices cleanly and drips with gravy.", { featured: true, pesach: true, badge: "Shabbos Special" });
  p("beef-silverside", "Silverside", "beef", 139.9, "kg", "~1.5kg", "roast-beef", M, ["Kosher SA", "Glatt", "Shabbos"], "Lean, tidy silverside for a traditional pot roast or a cold sliced Sunday lunch.", { pesach: true });
  p("beef-topside-roast", "Topside Roast", "beef", 149.9, "kg", "~1.5kg", "roast-beef", M, ["Kosher SA", "Glatt", "Shabbos", "Yom Tov"], "A neat, tender oven roast that carves beautifully with crispy roast potatoes.", { pesach: true });
  p("beef-oxtail", "Oxtail", "beef", 179.9, "kg", "~1kg", "stew", M, ["Kosher SA", "Glatt", "Potjie"], "Rich, gelatinous oxtail pieces made for a slow potjie that perfumes the whole house.", { pesach: true });
  p("beef-stew-cubes", "Beef Stew Cubes", "beef", 129.9, "kg", "~1kg", "stew", M, ["Kosher SA", "Glatt", "Potjie", "Shabbos"], "Hand-cut chuck cubes for a hearty potjiekos, goulash or Friday-night cholent.", { pesach: true });
  p("beef-shin-bone-in", "Beef Shin (Bone-in)", "beef", 119.9, "kg", "~1kg", "stew", M, ["Kosher SA", "Glatt", "Soup"], "Marrow-rich shin that makes the deepest, most golden soup and fork-tender meat.", { pesach: true });

  // ---- LAMB ----
  p("lamb-ribs", "Lamb Ribs", "lamb", 149.9, "kg", "~1kg", "lamb-ribs", M, ["Kosher SA", "Glatt", "Braai", "Shabbos"], "Sweet, succulent lamb ribs that crisp up gorgeously over the coals.", { featured: true, pesach: true, badge: "Popular" });
  p("lamb-shoulder-chops", "Lamb Shoulder Chops", "lamb", 179.9, "kg", "~800g", "lamb-chops", M, ["Kosher SA", "Glatt", "Braai"], "Juicy shoulder chops with plenty of flavour, best seared hot and rested.", { pesach: true });
  p("lamb-rib-chops", "Lamb Rib Chops", "lamb", 219.9, "kg", "~800g", "lamb-chops", M, ["Kosher SA", "Glatt", "Braai", "Shabbos"], "Neatly trimmed rib chops that take to garlic, rosemary and a smoky braai flame.", { pesach: true });
  p("lamb-neck-slices", "Lamb Neck Slices", "lamb", 119.9, "kg", "~1kg", "stew", M, ["Kosher SA", "Glatt", "Potjie"], "The potjie cook's secret: bone-in neck slices that give a gloriously rich gravy.", { pesach: true });
  p("lamb-shoulder-roast", "Lamb Shoulder Roast", "lamb", 169.9, "kg", "~2kg", "roast-beef", M, ["Kosher SA", "Glatt", "Shabbos", "Yom Tov"], "A generous rolled shoulder to roast low and slow until it pulls apart with a fork.", { pesach: true });
  p("lamb-shank", "Lamb Shanks", "lamb", 139.9, "kg", "~1kg", "lamb-ribs", M, ["Kosher SA", "Glatt", "Shabbos"], "Meaty lamb shanks that braise to silky perfection in red wine and rosemary.", { pesach: true });
  p("lamb-stew", "Lamb Stew Cubes", "lamb", 159.9, "kg", "~1kg", "stew", M, ["Kosher SA", "Glatt", "Potjie"], "Tender boneless lamb cubes for a Cape-Malay style curry or a Moroccan tagine.", { pesach: true });

  // ---- POULTRY ----
  p("chicken-whole", "Whole Chicken", "poultry", 74.9, "kg", "~1.6kg", "chicken-whole", M, ["Kosher SA", "Glatt", "Shabbos"], "A plump, free-range style bird, koshered and ready for the Friday-night roasting tray.", { featured: true, pesach: true, badge: "Shabbos Special" });
  p("chicken-whole-cut8", "Chicken Cut into 8", "poultry", 79.9, "kg", "~1.6kg", "chicken-pieces", M, ["Kosher SA", "Glatt", "Shabbos"], "Whole chicken butchered into eight perfect pieces, ready for the pot or the oven.", { pesach: true });
  p("chicken-thighs", "Chicken Thighs", "poultry", 69.9, "kg", "~1kg", "chicken-pieces", M, ["Kosher SA", "Glatt", "Braai"], "Juicy bone-in thighs with crisp skin and loads of flavour for just about any recipe.", { pesach: true });
  p("chicken-drumsticks", "Chicken Drumsticks", "poultry", 64.9, "kg", "~1kg", "chicken-pieces", M, ["Kosher SA", "Glatt", "Braai"], "Kid-friendly drumsticks that come out golden, sticky and gone in minutes.", { pesach: true });
  p("chicken-breast-fillets", "Chicken Breast Fillets", "poultry", 99.9, "kg", "~1kg", "chicken-pieces", M, ["Kosher SA", "Glatt"], "Lean, skinless breast fillets, perfect for quick stir-fries, schnitzel and salads.", { pesach: true });
  p("chicken-wings", "Chicken Wings", "poultry", 79.9, "kg", "~1kg", "chicken-wings", M, ["Kosher SA", "Glatt", "Braai"], "Meaty wings begging for a honey-garlic glaze or fiery peri-peri marinade.", { pesach: true });
  p("chicken-schnitzel", "Crumbed Chicken Schnitzel", "poultry", 129.9, "kg", "~600g", "schnitzel", M, ["Kosher SA", "Glatt", "Shabbos"], "Golden, crunchy schnitzel made fresh daily, a guaranteed hit with kids and adults alike.", { featured: true, badge: "Popular" });
  p("chicken-schnitzel-strips", "Schnitzel Strips", "poultry", 134.9, "kg", "~500g", "schnitzel", M, ["Kosher SA", "Glatt"], "Crispy crumbed strips for dipping, wraps and lunchbox heroes.");
  p("chicken-roast-hot", "Hot Roast Chicken", "poultry", 109.9, "each", "whole", "roast-chicken", M, ["Kosher SA", "Glatt", "Shabbos", "Ready to Eat"], "Hot, golden roast chicken, seasoned with paprika and garlic, fresh from the oven.", { featured: true, badge: "Popular" });
  p("chicken-roast-half", "Hot Roast Chicken (Half)", "poultry", 64.9, "each", "half", "roast-chicken", M, ["Kosher SA", "Glatt", "Ready to Eat"], "Half a hot roast chicken, just right for one or two hungry people.");
  p("turkey-whole", "Whole Turkey", "poultry", 119.9, "kg", "~4kg", "turkey", M, ["Kosher SA", "Glatt", "Yom Tov"], "A majestic whole turkey for the festive table, plump, juicy and generous.", { pesach: true });
  p("turkey-breast-roast", "Turkey Breast Roast", "poultry", 149.9, "kg", "~1.5kg", "turkey", M, ["Kosher SA", "Glatt", "Shabbos"], "Boneless turkey breast roast, easy to carve and wonderfully moist.", { pesach: true });

  // ---- MINCE / BURGERS / SAUSAGES ----
  p("beef-mince-lean", "Lean Beef Mince", "mince-burgers", 119.9, "kg", "~500g", "mince", M, ["Kosher SA", "Glatt", "Pasta Night"], "Freshly ground lean beef for bolognaise, meatballs, cottage pie and bobotie.", { pesach: true });
  p("beef-mince-regular", "Beef Mince (Regular)", "mince-burgers", 99.9, "kg", "~500g", "mince", M, ["Kosher SA", "Glatt"], "Everyday beef mince with just enough fat to keep every dish rich and juicy.", { pesach: true });
  p("lamb-mince", "Lamb Mince", "mince-burgers", 139.9, "kg", "~500g", "mince", M, ["Kosher SA", "Glatt"], "Sweet, aromatic lamb mince, brilliant for koftas, samoosas and shepherd's pie.", { pesach: true });
  p("beef-burger-patties", "Beef Burger Patties", "mince-burgers", 119.9, "each", "6 x 150g", "burger", M, ["Kosher SA", "Glatt", "Braai"], "Thick, hand-pressed beef patties that stay juicy on the braai, six to a pack.", { badge: "Popular" });
  p("lamb-burger-patties", "Lamb Burger Patties", "mince-burgers", 139.9, "each", "6 x 150g", "burger", M, ["Kosher SA", "Glatt", "Braai"], "Herby lamb patties with a hint of mint and garlic, made for the grid.");
  p("boerewors", "Traditional Boerewors", "mince-burgers", 119.9, "kg", "~1kg coil", "boerewors", M, ["Kosher SA", "Glatt", "Braai"], "Coarse-ground, coriander-spiced boerie in a generous coil, South Africa's braai king.", { featured: true, badge: "Popular" });
  p("boerewors-thin", "Thin Boerewors (Fingers)", "mince-burgers", 124.9, "kg", "~1kg", "boerewors", M, ["Kosher SA", "Glatt", "Braai"], "Slim boerewors fingers that cook fast and fit snugly in a hot dog roll.");
  p("beef-sausage-thin", "Thin Beef Sausages (Chipolatas)", "mince-burgers", 109.9, "kg", "~500g", "sausage", M, ["Kosher SA", "Glatt", "Kids"], "Delicate, mildly seasoned chipolatas, a Sunday breakfast and kids' party favourite.");
  p("beef-sausage-thick", "Beef Sausages", "mince-burgers", 114.9, "kg", "~500g", "sausage", M, ["Kosher SA", "Glatt", "Braai"], "Plump beef sausages with a gentle spice and a satisfying snap.");
  p("lamb-merguez", "Lamb Merguez-Style Sausage", "mince-burgers", 149.9, "kg", "~500g", "sausage", M, ["Kosher SA", "Glatt", "Spicy"], "Fiery, harissa-spiced lamb sausage in the North African style, bold and brick-red.", { badge: "New" });
  p("beef-meatballs", "Beef Meatballs", "mince-burgers", 124.9, "each", "20 pcs", "mince", M, ["Kosher SA", "Glatt", "Shabbos"], "Ready-rolled, herb-flecked meatballs, just add your favourite tomato sauce.");

  // ---- DELI & BILTONG ----
  p("biltong-beef-stick", "Traditional Beef Biltong", "deli", 449.9, "kg", "~250g", "biltong", M, ["Kosher SA", "Glatt", "Snack"], "Classic coriander-and-vinegar cured biltong, air-dried to a perfect chew.", { featured: true, badge: "Popular" });
  p("biltong-sliced", "Sliced Beef Biltong", "deli", 469.9, "kg", "~200g", "biltong", M, ["Kosher SA", "Glatt", "Snack"], "Thinly sliced, moist biltong, effortless to nibble on at a Sunday rugby braai.");
  p("biltong-chilli", "Chilli Biltong", "deli", 479.9, "kg", "~250g", "biltong", M, ["Kosher SA", "Glatt", "Spicy", "Snack"], "Biltong with a slow-building peri-peri kick for those who like it hot.");
  p("droewors", "Droewors", "deli", 399.9, "kg", "~250g", "droewors", M, ["Kosher SA", "Glatt", "Snack"], "Thin, dry-cured boerewors sticks, smoky, spicy and dangerously moreish.");
  p("beef-polony", "Beef Polony", "deli", 109.9, "kg", "~500g", "polony", M, ["Kosher SA", "Glatt", "Lunchbox"], "Smooth, mild beef polony, sliced to order for school sandwiches and picnics.");
  p("beef-salami", "Beef Salami", "deli", 289.9, "kg", "~250g", "salami", M, ["Kosher SA", "Glatt", "Platter"], "Peppery, garlicky beef salami with a lovely dry bite, great on a platter or in a roll.");
  p("beef-pastrami", "Beef Pastrami", "deli", 319.9, "kg", "~300g", "pastrami", M, ["Kosher SA", "Glatt", "Deli Classic"], "Peppercorn-crusted, smoky pastrami sliced thin for a towering deli sandwich.", { featured: true, badge: "Popular" });
  p("corned-beef-sliced", "Corned Beef (Sliced)", "deli", 259.9, "kg", "~300g", "pastrami", M, ["Kosher SA", "Glatt", "Deli Classic"], "Tender, spiced corned beef, sliced fresh for rye, rolls and a Sunday fry-up.");
  p("smoked-turkey-sliced", "Smoked Turkey Breast (Sliced)", "deli", 279.9, "kg", "~300g", "polony", M, ["Kosher SA", "Glatt", "Lunchbox"], "Delicately smoked turkey breast, lean, sweet and perfect for lunchbox rolls.");

  // ---- READY MEALS ----
  p("chicken-soup-1l", "Chicken Soup (Golden)", "ready-meals", 79.9, "each", "1 litre", "chicken-soup", M, ["Kosher SA", "Glatt", "Shabbos", "Jewish Penicillin"], "Golden, slow-simmered chicken soup with carrots and dill, just like Bubbe made.", { featured: true, pesach: true, badge: "Shabbos Special" });
  p("chicken-soup-2l", "Chicken Soup (Family 2L)", "ready-meals", 149.9, "each", "2 litres", "chicken-soup", M, ["Kosher SA", "Glatt", "Shabbos"], "A big family tub of liquid gold, served with kneidlach or lokshen on request.", { pesach: true });
  p("kneidlach-soup", "Kneidlach (Matzah Balls)", "ready-meals", 59.9, "each", "6 pcs", "chicken-soup", P, ["Shabbos", "Pesach"], "Light, fluffy kneidlach to float in your soup, made pareve with oil.", { pesach: true });
  p("cholent-1kg", "Shabbos Cholent", "ready-meals", 129.9, "each", "1kg", "cholent", M, ["Kosher SA", "Glatt", "Shabbos"], "Beans, barley, potato and beef short rib, slow-cooked overnight to rich, smoky perfection.", { featured: true, badge: "Shabbos Special" });
  p("potato-kugel", "Potato Kugel", "ready-meals", 89.9, "each", "~800g", "kugel", P, ["Shabbos", "Pesach", "Pareve"], "Crisp-topped, golden potato kugel with a soft, savoury middle that disappears fast.", { pesach: true });
  p("lokshen-kugel", "Lokshen Kugel (Sweet)", "ready-meals", 94.9, "each", "~800g", "kugel", P, ["Shabbos", "Pareve"], "Sweet, cinnamon-kissed noodle kugel with a caramelised, crunchy top.");
  p("chicken-potjie-meal", "Chicken Potjie Meal", "ready-meals", 119.9, "each", "serves 2", "roast-chicken", M, ["Kosher SA", "Glatt", "Ready to Eat"], "Tender chicken and vegetables in a rich potjie gravy, heat and serve in minutes.");
  p("beef-bobotie-meal", "Beef Bobotie", "ready-meals", 109.9, "each", "serves 2", "mince", M, ["Kosher SA", "Glatt", "Cape Malay"], "A kosher take on the Cape classic: spiced mince, apricot and a golden savoury egg-style topping.");
  p("tzimmes", "Carrot Tzimmes", "ready-meals", 69.9, "each", "~500g", "kugel", P, ["Shabbos", "Pesach", "Pareve"], "Honeyed carrots and prunes, slow-cooked until sticky, sweet and glossy.", { pesach: true });
  p("meat-blintzes", "Meat Blintzes", "ready-meals", 139.9, "each", "8 pcs", "schnitzel", M, ["Kosher SA", "Glatt"], "Delicate crepes rolled around seasoned beef and pan-fried until lightly golden.");

  // ---- BAKERY ----
  p("challah-plain", "Challah (Plain)", "bakery", 32.9, "each", "~500g", "challah", P, ["Pas Yisroel", "Shabbos", "Pareve"], "Soft, golden plaited challah baked fresh every Friday morning, the heart of the Shabbos table.", { featured: true, badge: "Shabbos Special" });
  p("challah-sesame", "Challah (Sesame)", "bakery", 34.9, "each", "~500g", "challah", P, ["Pas Yisroel", "Shabbos", "Pareve"], "A pillowy plait topped generously with toasted sesame seeds.", { badge: "Popular" });
  p("challah-large-plait", "Large 6-Plait Challah", "bakery", 59.9, "each", "~900g", "challah", P, ["Pas Yisroel", "Shabbos", "Pareve"], "An impressive six-strand challah for a big Shabbos or Yom Tov table.");
  p("challah-rolls-6", "Challah Rolls", "bakery", 44.9, "each", "6 pcs", "rolls", P, ["Pas Yisroel", "Shabbos", "Pareve"], "Mini challah rolls, individually portioned, soft and slightly sweet.");
  p("hamburger-rolls", "Hamburger Rolls", "bakery", 36.9, "each", "6 pcs", "rolls", P, ["Pas Yisroel", "Braai", "Pareve"], "Soft, sesame-topped rolls, sturdy enough for a loaded, juicy burger.");
  p("hotdog-rolls", "Hot Dog Rolls", "bakery", 34.9, "each", "6 pcs", "rolls", P, ["Pas Yisroel", "Braai", "Pareve"], "Fluffy, long rolls for boerie rolls and hot dogs, fresh from the oven.");
  p("rolls-dozen", "Dinner Rolls (Dozen)", "bakery", 49.9, "each", "12 pcs", "rolls", P, ["Pas Yisroel", "Pareve"], "Twelve soft white dinner rolls, ideal for soup and for mopping up gravy.");
  p("chocolate-cake", "Chocolate Fudge Cake", "bakery", 169.9, "each", "~1.2kg", "chocolate-cake", P, ["Pas Yisroel", "Pareve", "Celebration"], "Dark, moist chocolate sponge layered with rich pareve fudge icing, pure indulgence.", { badge: "Popular" });
  p("marble-cake", "Marble Loaf Cake", "bakery", 79.9, "each", "~600g", "cake-layer", P, ["Pas Yisroel", "Pareve", "Shabbos"], "Swirls of vanilla and cocoa in a tender, pareve loaf.");
  p("cheesecake-style-cake", "Pareve Lemon Layer Cake", "bakery", 189.9, "each", "~1kg", "cake-layer", P, ["Pas Yisroel", "Pareve", "Celebration"], "A light, lemony pareve cake on a crumbly biscuit base, ideal after a meat meal.", { badge: "New" });
  p("rugelach", "Chocolate Rugelach", "bakery", 89.9, "each", "12 pcs", "rugelach", P, ["Pas Yisroel", "Pareve", "Shabbos"], "Flaky rolled pastries with a dark chocolate and cinnamon centre, irresistible with tea.", { badge: "Popular" });
  p("honey-cake", "Honey Cake (Lekach)", "bakery", 99.9, "each", "~700g", "cake-layer", P, ["Pas Yisroel", "Pareve", "Rosh Hashana"], "Spiced, deeply honeyed lekach, moist for days and a must for Rosh Hashana.", { badge: "Shabbos Special" });
  p("apple-strudel", "Apple Strudel", "bakery", 94.9, "each", "~600g", "rugelach", P, ["Pas Yisroel", "Pareve"], "Paper-thin pastry wrapped around cinnamon apples and plump raisins.");

  // ---- PANTRY ----
  p("hummus-400", "Hummus", "pantry", 49.9, "each", "400g", "hummus", P, ["Pareve", "Pesach", "Dip"], "Silky chickpea hummus with lemon, garlic and a generous swirl of olive oil.", { pesach: true, badge: "Popular" });
  p("techina-400", "Techina", "pantry", 54.9, "each", "400g", "hummus", P, ["Pareve", "Pesach", "Dip"], "Nutty, creamy sesame techina, smooth enough to drizzle over everything.", { pesach: true });
  p("babaganoush", "Baba Ganoush", "pantry", 59.9, "each", "400g", "hummus", P, ["Pareve", "Pesach", "Dip"], "Smoky, fire-charred aubergine blended with techina and lemon.", { pesach: true });
  p("coleslaw-500", "Coleslaw", "pantry", 44.9, "each", "500g", "salad", P, ["Pareve", "Braai", "Pesach"], "Crunchy cabbage and carrot in a tangy pareve dressing, the perfect braai side.", { pesach: true });
  p("israeli-salad-500", "Israeli Salad", "pantry", 54.9, "each", "500g", "salad", P, ["Pareve", "Pesach", "Fresh"], "Finely diced cucumber, tomato and onion with lemon and olive oil, fresh and zingy.", { pesach: true });
  p("chopped-liver-250", "Chopped Liver", "pantry", 69.9, "each", "250g", "salad", M, ["Kosher SA", "Glatt", "Shabbos", "Starter"], "Old-school chicken liver with fried onion and egg, a proper Shabbos starter.", { pesach: true });
  p("eggplant-salad", "Eggplant Salad", "pantry", 52.9, "each", "400g", "salad", P, ["Pareve", "Pesach", "Salad"], "Roasted aubergine in a garlicky tomato dressing, a Shabbos table favourite.", { pesach: true });
  p("beetroot-salad", "Beetroot Salad", "pantry", 44.9, "each", "400g", "salad", P, ["Pareve", "Pesach", "Salad"], "Sweet, tangy marinated beetroot, as bright as a jewel on the plate.", { pesach: true });
  p("pickled-cucumbers", "Pickled Cucumbers", "pantry", 48.9, "each", "500g", "salad", P, ["Pareve", "Deli"], "Crunchy garlic-dill pickles, the ultimate partner to pastrami and cholent.");
  p("matzah-box", "Matzah (Box)", "pantry", 69.9, "each", "300g", "challah", P, ["Pareve", "Pesach"], "Crisp, simple matzah, the unleavened bread for Pesach or anytime crunch.", { pesach: true });

  // ---- SHABBOS PACKS & CATERING ----
  p("shabbos-pack-small", "Shabbos Pack (Small, serves 4)", "shabbos-packs", 649.9, "each", "serves 4", "shabbos-box", M, ["Kosher SA", "Glatt", "Shabbos"], "Whole chicken, soup, kugel, challah and salads: everything for a relaxed Friday night for four.", { badge: "Shabbos Special" });
  p("shabbos-pack-medium", "Shabbos Pack (Medium, serves 8)", "shabbos-packs", 1199.9, "each", "serves 8", "shabbos-box", M, ["Kosher SA", "Glatt", "Shabbos"], "Brisket, roast chicken, cholent, kugels, soup, challah and two salads for eight guests.", { featured: true, badge: "Popular" });
  p("shabbos-pack-large", "Shabbos Pack (Large, serves 12)", "shabbos-packs", 1749.9, "each", "serves 12", "shabbos-box", M, ["Kosher SA", "Glatt", "Shabbos"], "The full spread for twelve: starters, mains, sides, challah and dessert, all delivered before candle lighting.");
  p("braai-pack-family", "Family Braai Pack", "shabbos-packs", 899.9, "each", "serves 6", "shabbos-box", M, ["Kosher SA", "Glatt", "Braai"], "Boerewors, lamb ribs, chicken wings, burger patties and rolls, everything for a legendary braai.", { badge: "New" });
  p("platter-deli-cold-cuts", "Deli Cold Cuts Platter", "shabbos-packs", 749.9, "each", "serves 10", "catering-platter", M, ["Kosher SA", "Glatt", "Catering"], "Pastrami, salami, corned beef and smoked turkey with pickles and mustard, ready for any simcha.");
  p("platter-schnitzel", "Schnitzel & Wings Platter", "shabbos-packs", 699.9, "each", "serves 10", "catering-platter", M, ["Kosher SA", "Glatt", "Catering"], "A big, golden platter of crumbed schnitzel strips and honey-glazed wings for a crowd.");
  p("platter-salads-dips", "Salads & Dips Platter", "shabbos-packs", 549.9, "each", "serves 10", "catering-platter", P, ["Pareve", "Catering", "Pesach"], "Hummus, techina, Israeli salad, coleslaw and eggplant with fresh rolls.", { pesach: true });
  p("platter-sweet-bakery", "Sweet Bakery Platter", "shabbos-packs", 499.9, "each", "serves 12", "catering-platter", P, ["Pas Yisroel", "Pareve", "Catering"], "Rugelach, honey cake slices, marble cake and strudel, a pareve dessert spread for any occasion.");

  window.MAXIS_PRODUCTS = L;
})();
