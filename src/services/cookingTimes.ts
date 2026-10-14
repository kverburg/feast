import { normalizeText } from './search';

// A small built-in table of cooking times for things you boil or simmer.
// The values are typical guidance from general cooking knowledge, not measured for your pans or
// your brands: package instructions win, and tasting beats the clock. Minutes count from the
// moment the water boils (rice and grains from the moment the lid goes on).
// Add or correct entries here; nothing else needs to change.

type Label = { nl: string; en: string };

export interface CookingTime {
  label: Label;
  min: number;
  max?: number; // a range, e.g. 8 to 10 minutes
}

export interface CookingEntry {
  id: string;
  display: Label; // heading in the popup
  names: { nl: string[]; en: string[] }; // what an ingredient may be called (singular and plural)
  method: 'boil' | 'simmer';
  // Pasta, rice, grains and pulses are boiled or simmered in practice, so a mention is always tappable.
  // Everything else (potatoes, vegetables, eggs, chicken...) is also fried, roasted or baked, so it
  // only becomes tappable when the step talks about boiling or simmering.
  alwaysBoiled?: boolean;
  times: CookingTime[];
  note?: Label;
}

const AL_DENTE: Label = { nl: 'Al dente', en: 'Al dente' };
const WELL_DONE: Label = { nl: 'Gaar (zacht)', en: 'Well done (soft)' };
const DONE: Label = { nl: 'Gaar', en: 'Done' };

const t = (label: Label, min: number, max?: number): CookingTime => ({ label, min, max });
const l = (nl: string, en: string): Label => ({ nl, en });

export const COOKING_ENTRIES: CookingEntry[] = [
  // ---- pasta and noodles ----
  {
    id: 'pasta-long',
    alwaysBoiled: true,
    display: l('Spaghetti & lange pasta (droog)', 'Spaghetti & long pasta (dried)'),
    names: { nl: ['spaghetti', 'linguine', 'tagliatelle', 'fettuccine', 'bucatini', 'capellini'], en: ['spaghetti', 'linguine', 'tagliatelle', 'fettuccine', 'bucatini', 'capellini'] },
    method: 'boil',
    times: [t(AL_DENTE, 8, 10), t(WELL_DONE, 11, 12)],
    note: l('In royaal kokend water met zout, af en toe roeren.', 'In plenty of salted boiling water, stir now and then.'),
  },
  {
    id: 'pasta-short',
    alwaysBoiled: true,
    display: l('Pasta (droog)', 'Pasta (dried)'),
    names: { nl: ['pasta', 'penne', 'rigatoni', 'fusilli', 'farfalle', 'macaroni', 'conchiglie', 'tortiglioni'], en: ['pasta', 'penne', 'rigatoni', 'fusilli', 'farfalle', 'macaroni', 'conchiglie', 'tortiglioni'] },
    method: 'boil',
    times: [t(AL_DENTE, 9, 11), t(WELL_DONE, 12, 14)],
    note: l('Macaroni is een minuut sneller gaar.', 'Macaroni is done a minute sooner.'),
  },
  {
    id: 'pasta-fresh',
    alwaysBoiled: true,
    display: l('Verse pasta', 'Fresh pasta'),
    names: { nl: ['verse pasta', 'verse tagliatelle', 'verse spaghetti', 'verse linguine', 'verse fettuccine', 'verse lasagnebladen'], en: ['fresh pasta', 'fresh tagliatelle', 'fresh spaghetti', 'fresh linguine', 'fresh fettuccine'] },
    method: 'boil',
    times: [t(AL_DENTE, 2, 3), t(WELL_DONE, 4, 5)],
  },
  {
    id: 'filled-pasta',
    alwaysBoiled: true,
    display: l('Gevulde pasta (vers)', 'Filled pasta (fresh)'),
    names: { nl: ['tortellini', 'ravioli', 'cappelletti', 'agnolotti'], en: ['tortellini', 'ravioli', 'cappelletti', 'agnolotti'] },
    method: 'boil',
    times: [t(DONE, 3, 5)],
    note: l('Klaar als ze naar boven komen drijven.', 'Done when they float to the top.'),
  },
  {
    id: 'gnocchi',
    alwaysBoiled: true,
    display: l('Gnocchi', 'Gnocchi'),
    names: { nl: ['gnocchi'], en: ['gnocchi'] },
    method: 'boil',
    times: [t(DONE, 2, 3)],
    note: l('Klaar zodra ze gaan drijven.', 'Done as soon as they float.'),
  },
  {
    id: 'noodles',
    alwaysBoiled: true,
    display: l('Noedels', 'Noodles'),
    names: { nl: ['noedels', 'eiernoedels', 'mie', 'mienoedels', 'rijstnoedels'], en: ['noodles', 'egg noodles', 'mie noodles', 'rice noodles'] },
    method: 'boil',
    times: [t(AL_DENTE, 3, 4), t(WELL_DONE, 5, 6)],
  },

  // ---- rice and grains ----
  {
    id: 'rice-white',
    alwaysBoiled: true,
    display: l('Witte rijst', 'White rice'),
    names: { nl: ['rijst', 'witte rijst', 'basmatirijst', 'basmati', 'jasmijnrijst', 'langkorrelrijst', 'pandanrijst'], en: ['rice', 'white rice', 'basmati rice', 'basmati', 'jasmine rice', 'long grain rice'] },
    method: 'simmer',
    times: [t(DONE, 12, 15)],
    note: l('Eerst spoelen, afgedekt laten pruttelen, daarna 5 minuten laten rusten.', 'Rinse first, simmer covered, then rest for 5 minutes.'),
  },
  {
    id: 'rice-brown',
    alwaysBoiled: true,
    display: l('Zilvervliesrijst', 'Brown rice'),
    names: { nl: ['zilvervliesrijst', 'bruine rijst', 'volkorenrijst'], en: ['brown rice', 'wholegrain rice'] },
    method: 'simmer',
    times: [t(AL_DENTE, 25, 30), t(WELL_DONE, 35, 40)],
  },
  {
    id: 'rice-risotto',
    alwaysBoiled: true,
    display: l('Risottorijst', 'Risotto rice'),
    names: { nl: ['risottorijst', 'arborio', 'arboriorijst', 'carnaroli'], en: ['risotto rice', 'arborio', 'arborio rice', 'carnaroli'] },
    method: 'simmer',
    times: [t(AL_DENTE, 16, 18), t(WELL_DONE, 20, 22)],
    note: l('Bouillon in delen toevoegen en blijven roeren.', 'Add the stock in portions and keep stirring.'),
  },
  {
    id: 'rice-wild',
    alwaysBoiled: true,
    display: l('Wilde rijst', 'Wild rice'),
    names: { nl: ['wilde rijst'], en: ['wild rice'] },
    method: 'simmer',
    times: [t(AL_DENTE, 35, 40), t(WELL_DONE, 45, 55)],
  },
  {
    id: 'quinoa',
    alwaysBoiled: true,
    display: l('Quinoa', 'Quinoa'),
    names: { nl: ['quinoa'], en: ['quinoa'] },
    method: 'simmer',
    times: [t(DONE, 12, 15)],
    note: l('Eerst spoelen. Klaar als het kiempje zichtbaar is.', 'Rinse first. Done when the little tail is visible.'),
  },
  {
    id: 'bulgur',
    alwaysBoiled: true,
    display: l('Bulgur', 'Bulgur'),
    names: { nl: ['bulgur'], en: ['bulgur'] },
    method: 'simmer',
    times: [t(DONE, 10, 12)],
  },
  {
    id: 'barley',
    alwaysBoiled: true,
    display: l('Parelgerst', 'Pearl barley'),
    names: { nl: ['parelgerst', 'gerst'], en: ['pearl barley', 'barley'] },
    method: 'simmer',
    times: [t(AL_DENTE, 25, 30), t(WELL_DONE, 35, 40)],
  },
  {
    id: 'farro',
    alwaysBoiled: true,
    display: l('Spelt & farro', 'Spelt & farro'),
    names: { nl: ['spelt', 'farro', 'speltkorrels'], en: ['spelt', 'farro'] },
    method: 'simmer',
    times: [t(AL_DENTE, 20, 25), t(WELL_DONE, 30, 35)],
  },
  {
    id: 'oats',
    alwaysBoiled: true,
    display: l('Havermout (pap)', 'Oats (porridge)'),
    names: { nl: ['havermout', 'haver', 'havervlokken'], en: ['oats', 'rolled oats', 'porridge oats', 'oatmeal'] },
    method: 'simmer',
    times: [t(DONE, 5, 8)],
  },

  // ---- eggs ----
  {
    id: 'egg',
    display: l('Eieren koken', 'Boiled eggs'),
    names: { nl: ['ei', 'eieren', 'eitje', 'eitjes'], en: ['egg', 'eggs'] },
    method: 'boil',
    times: [t(l('Zacht (lopend)', 'Soft (runny)'), 6), t(l('Medium', 'Medium'), 8), t(l('Hard', 'Hard'), 10, 11)],
    note: l('Medium eieren, in kokend water gelegd. Daarna koud afschrikken.', 'Medium eggs, lowered into boiling water. Cool in cold water afterwards.'),
  },

  // ---- potatoes and roots ----
  {
    id: 'potato',
    display: l('Aardappelen', 'Potatoes'),
    names: { nl: ['aardappel', 'aardappelen', 'aardappels', 'kruimige aardappelen', 'vastkokende aardappelen', 'krieltjes', 'kriel'], en: ['potato', 'potatoes', 'new potatoes'] },
    method: 'boil',
    times: [t(AL_DENTE, 10, 12), t(WELL_DONE, 15, 18)],
    note: l('Blokjes van 2 à 3 cm. Hele aardappelen: 20 tot 25 minuten.', 'Pieces of 2 to 3 cm. Whole potatoes: 20 to 25 minutes.'),
  },
  {
    id: 'sweet-potato',
    display: l('Zoete aardappel', 'Sweet potato'),
    names: { nl: ['zoete aardappel', 'zoete aardappelen', 'bataat'], en: ['sweet potato', 'sweet potatoes'] },
    method: 'boil',
    times: [t(AL_DENTE, 8, 10), t(WELL_DONE, 12, 15)],
    note: l('Blokjes van 2 cm.', 'Pieces of 2 cm.'),
  },
  {
    id: 'carrot',
    display: l('Wortel', 'Carrot'),
    names: { nl: ['wortel', 'wortelen', 'peen', 'worteltjes', 'winterpeen'], en: ['carrot', 'carrots'] },
    method: 'boil',
    times: [t(AL_DENTE, 5, 6), t(WELL_DONE, 9, 10)],
    note: l('In plakjes. Hele wortels: 15 tot 20 minuten.', 'Sliced. Whole carrots: 15 to 20 minutes.'),
  },
  {
    id: 'parsnip',
    display: l('Pastinaak', 'Parsnip'),
    names: { nl: ['pastinaak', 'pastinaken'], en: ['parsnip', 'parsnips'] },
    method: 'boil',
    times: [t(AL_DENTE, 6, 8), t(WELL_DONE, 12, 15)],
  },
  {
    id: 'beetroot',
    display: l('Rode biet (heel)', 'Beetroot (whole)'),
    names: { nl: ['rode biet', 'bieten', 'biet', 'bietjes', 'rode bieten'], en: ['beetroot', 'beetroots', 'beet', 'beets'] },
    method: 'simmer',
    times: [t(AL_DENTE, 30, 40), t(WELL_DONE, 45, 60)],
    note: l('Klein tot middelgroot, met schil. Grote bieten duren langer.', 'Small to medium, skin on. Large beets take longer.'),
  },
  {
    id: 'celeriac',
    display: l('Knolselderij', 'Celeriac'),
    names: { nl: ['knolselderij'], en: ['celeriac'] },
    method: 'boil',
    times: [t(AL_DENTE, 10, 12), t(WELL_DONE, 18, 20)],
  },
  {
    id: 'pumpkin',
    display: l('Pompoen', 'Pumpkin & squash'),
    names: { nl: ['pompoen', 'butternut', 'butternutpompoen', 'hokkaido'], en: ['pumpkin', 'butternut squash', 'butternut', 'squash'] },
    method: 'boil',
    times: [t(AL_DENTE, 8, 10), t(WELL_DONE, 12, 15)],
    note: l('Blokjes van 2 cm.', 'Pieces of 2 cm.'),
  },

  // ---- vegetables ----
  {
    id: 'broccoli',
    display: l('Broccoli', 'Broccoli'),
    names: { nl: ['broccoli', 'broccoliroosjes'], en: ['broccoli', 'broccoli florets'] },
    method: 'boil',
    times: [t(AL_DENTE, 3, 4), t(WELL_DONE, 6, 7)],
    note: l('In roosjes.', 'In florets.'),
  },
  {
    id: 'cauliflower',
    display: l('Bloemkool', 'Cauliflower'),
    names: { nl: ['bloemkool', 'bloemkoolroosjes'], en: ['cauliflower', 'cauliflower florets'] },
    method: 'boil',
    times: [t(AL_DENTE, 4, 5), t(WELL_DONE, 8, 10)],
    note: l('In roosjes.', 'In florets.'),
  },
  {
    id: 'green-beans',
    display: l('Sperziebonen', 'Green beans'),
    names: { nl: ['sperziebonen', 'sperzieboon', 'prinsessenbonen', 'snijbonen', 'haricots verts'], en: ['green beans', 'string beans', 'french beans', 'runner beans'] },
    method: 'boil',
    times: [t(AL_DENTE, 4, 5), t(WELL_DONE, 8, 10)],
  },
  {
    id: 'asparagus-green',
    display: l('Groene asperges', 'Green asparagus'),
    names: { nl: ['groene asperges', 'groene asperge'], en: ['green asparagus'] },
    method: 'boil',
    times: [t(AL_DENTE, 2, 3), t(WELL_DONE, 5)],
  },
  {
    id: 'asparagus-white',
    display: l('Witte asperges', 'White asparagus'),
    names: { nl: ['asperges', 'asperge', 'witte asperges', 'witte asperge'], en: ['asparagus', 'white asparagus'] },
    method: 'simmer',
    times: [t(AL_DENTE, 8, 10), t(WELL_DONE, 12, 15)],
    note: l('Geschild. Dikke stengels duren langer.', 'Peeled. Thick stalks take longer.'),
  },
  {
    id: 'peas',
    display: l('Erwten', 'Peas'),
    names: { nl: ['erwten', 'doperwten', 'erwtjes', 'tuinerwten'], en: ['peas', 'garden peas', 'green peas'] },
    method: 'boil',
    times: [t(AL_DENTE, 2, 3), t(WELL_DONE, 4, 5)],
    note: l('Diepvries. Verse erwten: 3 tot 6 minuten.', 'Frozen. Fresh peas: 3 to 6 minutes.'),
  },
  {
    id: 'corn-cob',
    display: l('Maïskolf', 'Corn on the cob'),
    names: { nl: ['maïskolf', 'maiskolf', 'maïskolven', 'maiskolven'], en: ['corn on the cob', 'corn cob', 'sweetcorn on the cob'] },
    method: 'boil',
    times: [t(AL_DENTE, 5, 7), t(WELL_DONE, 10)],
  },
  {
    id: 'brussels-sprouts',
    display: l('Spruitjes', 'Brussels sprouts'),
    names: { nl: ['spruitjes', 'spruitkool', 'spruit'], en: ['brussels sprouts', 'brussel sprouts', 'sprouts'] },
    method: 'boil',
    times: [t(AL_DENTE, 6, 7), t(WELL_DONE, 10, 12)],
    note: l('Heel of doormidden.', 'Whole or halved.'),
  },
  {
    id: 'cabbage',
    display: l('Kool', 'Cabbage'),
    names: { nl: ['witte kool', 'savooiekool', 'spitskool', 'rode kool'], en: ['white cabbage', 'savoy cabbage', 'red cabbage', 'cabbage'] },
    method: 'simmer',
    times: [t(AL_DENTE, 5, 7), t(WELL_DONE, 12, 15)],
    note: l('In reepjes.', 'Shredded.'),
  },
  {
    id: 'kale',
    display: l('Boerenkool', 'Kale'),
    names: { nl: ['boerenkool', 'groene kool', 'palmkool'], en: ['kale', 'cavolo nero'] },
    method: 'simmer',
    times: [t(AL_DENTE, 5, 7), t(WELL_DONE, 10, 15)],
  },
  {
    id: 'spinach',
    display: l('Spinazie', 'Spinach'),
    names: { nl: ['spinazie', 'verse spinazie'], en: ['spinach', 'fresh spinach'] },
    method: 'boil',
    times: [t(DONE, 1, 2)],
    note: l('Alleen even blancheren tot het slinkt.', 'Just blanch until it wilts.'),
  },
  {
    id: 'leek',
    display: l('Prei', 'Leek'),
    names: { nl: ['prei', 'preien'], en: ['leek', 'leeks'] },
    method: 'simmer',
    times: [t(AL_DENTE, 5, 6), t(WELL_DONE, 10)],
    note: l('In ringen.', 'In rings.'),
  },
  {
    id: 'fennel',
    display: l('Venkel', 'Fennel'),
    names: { nl: ['venkel', 'venkelknol'], en: ['fennel', 'fennel bulb'] },
    method: 'simmer',
    times: [t(AL_DENTE, 6, 8), t(WELL_DONE, 12, 15)],
    note: l('In parten.', 'In wedges.'),
  },
  {
    id: 'pak-choi',
    display: l('Paksoi', 'Pak choi'),
    names: { nl: ['paksoi', 'pak choi', 'pakchoi'], en: ['pak choi', 'bok choy'] },
    method: 'boil',
    times: [t(AL_DENTE, 1, 2), t(WELL_DONE, 3, 4)],
  },
  {
    id: 'artichoke',
    display: l('Artisjok (heel)', 'Artichoke (whole)'),
    names: { nl: ['artisjok', 'artisjokken'], en: ['artichoke', 'artichokes'] },
    method: 'simmer',
    times: [t(DONE, 25, 40)],
    note: l('Klaar als een blad makkelijk loskomt.', 'Done when a leaf pulls out easily.'),
  },

  // ---- pulses (dried) ----
  {
    id: 'lentils-red',
    alwaysBoiled: true,
    display: l('Rode linzen', 'Red lentils'),
    names: { nl: ['rode linzen', 'oranje linzen'], en: ['red lentils', 'split red lentils'] },
    method: 'simmer',
    times: [t(AL_DENTE, 8, 10), t(WELL_DONE, 12, 15)],
    note: l('Niet voorweken. Vallen uit elkaar voor dal en soep.', 'No soaking. They fall apart for dal and soup.'),
  },
  {
    id: 'lentils-green',
    alwaysBoiled: true,
    display: l('Groene & bruine linzen', 'Green & brown lentils'),
    names: { nl: ['linzen', 'groene linzen', 'bruine linzen', 'puy linzen', 'belugalinzen'], en: ['lentils', 'green lentils', 'brown lentils', 'puy lentils', 'beluga lentils'] },
    method: 'simmer',
    times: [t(AL_DENTE, 20, 25), t(WELL_DONE, 30, 35)],
  },
  {
    id: 'chickpeas',
    alwaysBoiled: true,
    display: l('Kikkererwten (gedroogd, geweekt)', 'Chickpeas (dried, soaked)'),
    names: { nl: ['kikkererwten', 'kikkererwt'], en: ['chickpeas', 'garbanzo beans'] },
    method: 'simmer',
    times: [t(AL_DENTE, 45, 60), t(WELL_DONE, 80, 90)],
    note: l('Uit blik zijn ze al gaar: alleen verwarmen.', 'Canned ones are already cooked: just heat them.'),
  },
  {
    id: 'beans',
    alwaysBoiled: true,
    display: l('Bonen (gedroogd, geweekt)', 'Beans (dried, soaked)'),
    names: { nl: ['witte bonen', 'kidneybonen', 'zwarte bonen', 'bruine bonen', 'cannellinibonen', 'bonen'], en: ['white beans', 'kidney beans', 'black beans', 'cannellini beans', 'haricot beans', 'beans'] },
    method: 'simmer',
    times: [t(AL_DENTE, 45, 60), t(WELL_DONE, 75, 90)],
    note: l('Rauwe kidneybonen eerst 10 minuten hard koken. Uit blik: alleen verwarmen.', 'Boil raw kidney beans hard for 10 minutes first. Canned: just heat.'),
  },

  // ---- simmering and poaching ----
  {
    id: 'chicken-poached',
    display: l('Kipfilet (pocheren)', 'Chicken breast (poached)'),
    names: { nl: ['kipfilet', 'kipborst', 'kippenborst', 'kipfilets'], en: ['chicken breast', 'chicken breasts', 'chicken fillet'] },
    method: 'simmer',
    times: [t(DONE, 15, 20)],
    note: l('Zacht laten sudderen, niet koken. Kerntemperatuur 75 °C.', 'Keep at a gentle simmer, not a boil. Core temperature 75 °C.'),
  },
  {
    id: 'salmon-poached',
    display: l('Zalm (pocheren)', 'Salmon (poached)'),
    names: { nl: ['zalm', 'zalmfilet', 'zalmfilets'], en: ['salmon', 'salmon fillet', 'salmon fillets'] },
    method: 'simmer',
    times: [t(l('Glazig', 'Medium'), 6, 8), t(DONE, 10, 12)],
  },
  {
    id: 'shrimp',
    display: l('Garnalen', 'Shrimp & prawns'),
    names: { nl: ['garnalen', 'garnaal', 'scampi', 'scampi\'s'], en: ['shrimp', 'prawns', 'prawn'] },
    method: 'boil',
    times: [t(DONE, 2, 3)],
    note: l('Klaar zodra ze roze en krullend zijn.', 'Done as soon as they are pink and curled.'),
  },
  {
    id: 'mussels',
    display: l('Mosselen', 'Mussels'),
    names: { nl: ['mosselen', 'mossel'], en: ['mussels', 'mussel'] },
    method: 'boil',
    times: [t(DONE, 4, 6)],
    note: l('Klaar als ze open zijn. Gesloten mosselen weggooien.', 'Done when they open. Throw away the ones that stay closed.'),
  },
  {
    id: 'meatballs-simmered',
    display: l('Gehaktballetjes (in soep)', 'Meatballs (in soup)'),
    names: { nl: ['gehaktballetjes', 'soepballetjes', 'gehaktballen'], en: ['meatballs'] },
    method: 'simmer',
    times: [t(DONE, 10, 15)],
  },
  {
    id: 'sausage-simmered',
    display: l('Worstjes (verwarmen)', 'Sausages (heating)'),
    names: { nl: ['knakworst', 'knakworsten', 'frankfurter', 'frankfurters', 'worstjes'], en: ['frankfurters', 'hot dogs', 'wieners'] },
    method: 'simmer',
    times: [t(DONE, 5, 8)],
    note: l('Niet laten koken, anders knappen ze open.', 'Do not let them boil, they split.'),
  },
];

// Words that make a name something else ("pasta sauce" is not pasta, "rice vinegar" is not rice)
const NOT_THE_INGREDIENT = new Set([
  'saus', 'sauce', 'pesto', 'soep', 'soup', 'salade', 'salad', 'bouillon', 'stock', 'azijn', 'vinegar',
  'olie', 'oil', 'poeder', 'powder', 'melk', 'milk', 'bloem', 'flour', 'meel', 'wijn', 'wine', 'chips', 'crackers',
  'water', 'yolk', 'yolks', 'yolkjes', 'eigeel', 'eiwit', 'eiwitten', 'eidooier', 'eidooiers', 'whites', 'koekjes', 'cookies', 'brood', 'bread', 'taart', 'cake', 'kruiden', 'seasoning', 'specerijen',
]);

const words = (text: string): string => ` ${normalizeText(text).replace(/[^a-z0-9]+/g, ' ').trim()} `;

const ALIAS_INDEX: Array<{ alias: string; entry: CookingEntry }> = COOKING_ENTRIES.flatMap((entry) =>
  [...entry.names.nl, ...entry.names.en].map((alias) => ({ alias: words(alias), entry }))
).sort((a, b) => b.alias.length - a.alias.length); // longest alias first: "zoete aardappel" before "aardappel"

/** The cooking times for an ingredient name ("Zoete aardappelen", "dried spaghetti"), if we have them. */
export function findCookingTime(ingredientName: string): CookingEntry | undefined {
  const name = words(ingredientName);
  if (name.trim() === '') return undefined;
  if (name.trim().split(' ').some((w) => NOT_THE_INGREDIENT.has(w))) return undefined;
  return ALIAS_INDEX.find(({ alias }) => name.includes(alias))?.entry;
}

export function formatMinutes(time: CookingTime): string {
  return time.max && time.max !== time.min ? `${time.min}–${time.max} min` : `${time.min} min`;
}

// Does this step talk about boiling, simmering, poaching or cooking until done?
const BOILING_WORDS = /(kook|koken|gekookt|kokend|prutt|sudder|pocheer|blancheer|\bgaar|garen|boil|simmer|poach|blanch|cook)/;

export function stepIsAboutBoiling(stepText: string): boolean {
  return BOILING_WORDS.test(normalizeText(stepText));
}

/** The entry to offer for an ingredient in a step, or nothing when the step is about another way of cooking it. */
export function cookingTimeForStep(ingredientName: string, stepText: string): CookingEntry | undefined {
  const entry = findCookingTime(ingredientName);
  if (!entry) return undefined;
  return entry.alwaysBoiled || stepIsAboutBoiling(stepText) ? entry : undefined;
}
