import { Recipe, IngredientSection, InstructionStep, IngredientItem } from '../types/recipe';
import { translateRecipeWithGemini } from './geminiService';
import { getStoredApiKey, getStoredRecipes, saveStoredRecipes } from './storageService';

// ---------------------------------------------------------------------------
// Dictionaries
// ---------------------------------------------------------------------------

const ingredientDict: Record<string, string> = {
  // Proteins & Dairy
  'butter': 'boter',
  'unsalted butter': 'ongezouten boter',
  'heavy cream': 'slagroom',
  'cream': 'room',
  'milk': 'melk',
  'egg': 'ei',
  'eggs': 'eieren',
  'cheese': 'kaas',
  'parmesan': 'parmezaan',
  'parmigiano-reggiano': 'parmigiano-reggiano',
  'mozzarella': 'mozzarella',
  'fresh buffalo mozzarella': 'verse buffalo mozzarella',
  'greek yogurt': 'griekse yoghurt',
  'yogurt': 'yoghurt',

  // Vegetables & Aromatics
  'garlic': 'knoflook',
  'onion': 'ui',
  'onions': 'uien',
  'shallot': 'sjalot',
  'shallots': 'sjalotten',
  'mushrooms': 'champignons',
  'wild mushrooms': 'wilde paddenstoelen',
  'tomato': 'tomaat',
  'tomatoes': 'tomaten',
  'san marzano whole peeled tomatoes': 'san marzano gepelde tomaten',
  'fresh basil': 'verse basilicum',
  'basil': 'basilicum',
  'fresh parsley': 'verse peterselie',
  'parsley': 'peterselie',
  'rosemary': 'rozemarijn',
  'thyme': 'tijm',
  'oregano': 'oregano',
  'dried oregano': 'gedroogde oregano',

  // Fruits & Berries
  'mixed fresh berries': 'gemengde verse bessen',
  'strawberries': 'aardbeien',
  'blueberries': 'bosbessen',
  'raspberries': 'frambozen',
  'lemon': 'citroen',
  'lime': 'limoen',

  // Pantry & Condiments
  'salt': 'zout',
  'sea salt': 'zeezout',
  'fine sea salt': 'fijn zeezout',
  'pepper': 'peper',
  'black pepper': 'zwarte peper',
  'freshly ground black pepper': 'versgemalen zwarte peper',
  'sugar': 'suiker',
  'brown sugar': 'bruine suiker',
  'honey': 'honing',
  'wildflower honey': 'wilde bloemen honing',
  'olive oil': 'olijfolie',
  'extra virgin olive oil': 'extra vierge olijfolie',
  'vegetable oil': 'plantaardige olie',
  'flour': 'bloem',
  'tipo 00 flour': 'tipo 00 bloem',
  'all-purpose flour': 'patentbloem',
  'bread flour': 'broodbloem',
  'water': 'water',
  'lukewarm water': 'lauwwarm water',
  'yeast': 'gist',
  'active dry yeast': 'actieve droge gist',
  'baking powder': 'bakpoeder',
  'baking soda': 'zuiveringszout',
  'vanilla extract': 'vanille-extract',
  'cinnamon': 'kaneel',
  'nutmeg': 'nootmuskaat',
  'chia seeds': 'chiazaad',
  'honey almond granola': 'honing amandel granola',
  'granola': 'granola',

  // Pasta & Grains
  'pasta': 'pasta',
  'tagliatelle': 'tagliatelle',
  'fresh tagliatelle pasta': 'verse tagliatelle pasta',
  'spaghetti': 'spaghetti',
  'rice': 'rijst',

  // Truffle & Specialty
  'black truffle oil': 'zwarte truffelolie',
  'shaved black truffle': 'geschaafde zwarte truffel',
  'truffle': 'truffel',
};

const verbDict: Record<string, string> = {
  'bring': 'breng',
  'boil': 'kook',
  'heat': 'verhit',
  'preheat': 'verwarm voor',
  'mix': 'meng',
  'stir': 'roer',
  'whisk': 'klop',
  'beat': 'klop',
  'fold': 'vouw',
  'add': 'voeg toe',
  'pour': 'giet',
  'combine': 'combineer',
  'place': 'leg',
  'put': 'doe',
  'set': 'zet',
  'cook': 'kook',
  'bake': 'bak',
  'fry': 'bak',
  'sauté': 'bak aan',
  'saute': 'bak aan',
  'simmer': 'laat sudderen',
  'roast': 'rooster',
  'grill': 'grill',
  'steam': 'stoom',
  'drain': 'giet af',
  'rinse': 'spoel',
  'chop': 'hak',
  'dice': 'snijd in blokjes',
  'slice': 'snijd',
  'mince': 'hak fijn',
  'grate': 'rasp',
  'peel': 'schil',
  'cut': 'snijd',
  'remove': 'verwijder',
  'serve': 'serveer',
  'garnish': 'garneer',
  'sprinkle': 'strooi',
  'drizzle': 'besprenkel',
  'toss': 'schep om',
  'melt': 'smelt',
  'dissolve': 'los op',
  'knead': 'kneed',
  'stretch': 'rek uit',
  'spread': 'smeer',
  'arrange': 'verdeel',
  'top': 'beleg',
  'cover': 'dek af',
  'let': 'laat',
  'allow': 'laat',
  'reserve': 'houd apart',
};

const sectionTitleDict: Record<string, string> = {
  'for the': 'voor de',
  'ingredients': 'ingrediënten',
  'for the sauce': 'voor de saus',
  'for the dough': 'voor het deeg',
  'for the pizza dough': 'voor het pizzadeeg',
  'for the garnish': 'voor de garnering',
  'for the garnish & serving': 'voor de garnering & serveren',
  'for the toppings': 'voor de toppings',
  'for the cheese & toppings': 'voor de kaas & toppings',
  'for the yogurt base': 'voor de yoghurtbasis',
  'for the berry compote & crunch': 'voor de bessensaus & crunch',
  'for the fresh tagliatelle pasta': 'voor de verse tagliatelle pasta',
  'for the truffle cream sauce': 'voor de truffelroomsaus',
  'for the san marzano tomato sauce': 'voor de san marzano tomatensaus',
  'for the pizza dough (2 balls)': 'voor het pizzadeeg (2 ballen)',
  'toppings': 'toppings',
  'garnish': 'garnering',
  'sauce': 'saus',
  'dough': 'deeg',
  'base': 'basis',
  'filling': 'vulling',
  'marinade': 'marinade',
  'dressing': 'dressing',
};

// ---------------------------------------------------------------------------
// Helper: translate a single word / phrase using a dictionary
// ---------------------------------------------------------------------------

function lookupDict(text: string, dict: Record<string, string>): string | null {
  const lower = text.toLowerCase().trim();
  if (dict[lower]) return dict[lower];
  return null;
}

function translateSectionTitle(title: string): string {
  const translated = lookupDict(title, sectionTitleDict);
  if (translated) return capitalise(translated);

  // Generic "For the X" pattern → "Voor de X"
  const match = title.match(/^for the (.+)$/i);
  if (match) {
    const part = match[1];
    return capitalise(`Voor de ${part}`);
  }

  return title; // leave unchanged when no match
}

function translateIngredientName(name: string): string {
  const translated = lookupDict(name, ingredientDict);
  if (translated) return capitalise(translated);
  return name;
}

/** Very lightweight sentence-level translation: replaces known verbs at the start of sentences */
function translateInstructionText(text: string): string {
  // Try verb replacements at word boundaries
  let result = text;
  for (const [en, nl] of Object.entries(verbDict)) {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      // Preserve original capitalisation
      return match[0] === match[0].toUpperCase() ? capitalise(nl) : nl;
    });
  }

  // Ingredient name replacements inside the text
  for (const [en, nl] of Object.entries(ingredientDict)) {
    const regex = new RegExp(`\\b${escapeRegExp(en)}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      return match[0] === match[0].toUpperCase() ? capitalise(nl) : nl;
    });
  }

  return result;
}

function capitalise(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface DutchTranslation {
  title: string;
  description: string;
  ingredientSections: IngredientSection[];
  instructions: InstructionStep[];
}

/**
 * Translate English recipe fields to Dutch using a built-in dictionary.
 * Always returns a result — unknown terms are left in English.
 */
export function translateRecipeEnToNl(recipeEn: Partial<Recipe>): DutchTranslation {
  const title = recipeEn.title ? translateInstructionText(recipeEn.title) : 'Geïmporteerd Recept';
  const description = recipeEn.description ? translateInstructionText(recipeEn.description) : '';

  const ingredientSections: IngredientSection[] = (recipeEn.ingredientSections || []).map((section) => ({
    ...section,
    title: translateSectionTitle(section.title),
    items: section.items.map((item: IngredientItem) => ({
      ...item,
      name: translateIngredientName(item.name),
      notes: item.notes ? translateInstructionText(item.notes) : item.notes,
    })),
  }));

  const instructions: InstructionStep[] = (recipeEn.instructions || []).map((step) => ({
    ...step,
    text: translateInstructionText(step.text),
  }));

  return { title, description, ingredientSections, instructions };
}

/**
 * Translate to Dutch with Gemini when a key is saved; otherwise (or if the call fails)
 * fall back to the keyword translator. `llm` tells the caller which one produced the result.
 */
export async function translateRecipeToDutch(
  recipeEn: Partial<Recipe>
): Promise<DutchTranslation & { llm: boolean; error?: string }> {
  const apiKey = getStoredApiKey();
  let error: string | undefined;
  if (apiKey) {
    try {
      return { ...(await translateRecipeWithGemini(recipeEn, apiKey)), llm: true };
    } catch (e) {
      console.error('Gemini translation failed, using keyword translator', e);
      error = e instanceof Error ? e.message : String(e);
    }
  }
  return { ...translateRecipeEnToNl(recipeEn), llm: false, error };
}

const englishSource = (r: Recipe): Partial<Recipe> => ({
  title: r.titleEn,
  description: r.descriptionEn,
  ingredientSections: r.ingredientSectionsEn,
  instructions: r.instructionsEn,
});

// True when the stored Dutch text is exactly what the keyword translator produced,
// i.e. the user never edited it and replacing it loses nothing.
const isUntouchedKeywordTranslation = (r: Recipe): boolean => {
  if (!r.titleEn || !r.ingredientSectionsEn || !r.instructionsEn) return false;
  const kw = translateRecipeEnToNl(englishSource(r));
  const sameStructure =
    JSON.stringify([kw.title, kw.ingredientSections, kw.instructions]) ===
    JSON.stringify([r.title, r.ingredientSections, r.instructions]);
  // Import falls back to the English text or a placeholder when there is no description.
  const sameDescription = [kw.description, r.descriptionEn, 'Geïmporteerd via Feast.', ''].includes(r.description);
  return sameStructure && sameDescription;
};

/**
 * One-time upgrade: recipes imported before the Gemini translation get re-translated
 * from their stored English original, if their Dutch text was never hand-edited.
 * Runs quietly in the background; stops at the first failure and tries again next visit.
 * Returns true when at least one recipe changed.
 */
let upgradeRun: Promise<boolean> | null = null;

export function upgradeKeywordTranslations(): Promise<boolean> {
  upgradeRun ??= runUpgrade();
  return upgradeRun;
}

async function runUpgrade(): Promise<boolean> {
  if (!getStoredApiKey()) return false;
  const candidates = getStoredRecipes().filter(
    (r) => !r.id.startsWith('seed-') && r.translationVersion !== 2 && isUntouchedKeywordTranslation(r)
  );
  let changed = false;
  for (const candidate of candidates) {
    const result = await translateRecipeToDutch(englishSource(candidate));
    if (!result.llm) break;
    // Re-read storage so edits made while we were waiting are not overwritten.
    const latest = getStoredRecipes();
    const idx = latest.findIndex((r) => r.id === candidate.id);
    if (idx === -1 || !isUntouchedKeywordTranslation(latest[idx])) continue;
    latest[idx] = {
      ...latest[idx],
      title: result.title,
      description: result.description,
      ingredientSections: result.ingredientSections,
      instructions: result.instructions,
      translationVersion: 2,
    };
    saveStoredRecipes(latest);
    changed = true;
  }
  return changed;
}
