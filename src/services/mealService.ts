import { Recipe, ShoppingItem } from '../types/recipe';

const STORAGE_KEY_MEALS = 'gourmet_craft_meals_v1';

export interface MealRecipe {
  recipeId: string;
  servings: number;
}

// A user-named meal, e.g. "Dinner with the parents", made of one or more recipes.
export interface Meal {
  id: string;
  name: string;
  recipes: MealRecipe[];
  archived: boolean;
  createdAt: string;
  date?: string; // YYYY-MM-DD, optional
  attendeeIds?: string[]; // ids from the people list (Settings), optional
}

export interface CombinedIngredient {
  key: string;
  name: string;
  unit: string;
  amount: number;
  recipes: string[];
}

// When a meal happened: its date, else the day it was created
const mealTime = (m: Meal): number => Date.parse(m.date || m.createdAt) || 0;
const newestFirst = (a: Meal, b: Meal) => mealTime(b) - mealTime(a);

/** The meals a person was at, newest first. */
export const mealsOfPerson = (meals: Meal[], personId: string): Meal[] =>
  meals.filter((m) => (m.attendeeIds || []).includes(personId)).sort(newestFirst);

/** The meals a recipe was part of, newest first. */
export const mealsWithRecipe = (meals: Meal[], recipeId: string): Meal[] =>
  meals.filter((m) => m.recipes.some((r) => r.recipeId === recipeId)).sort(newestFirst);

export interface ServedRecipe {
  recipeId: string;
  count: number; // in how many meals
  last: Meal; // the most recent of them
  withNames: string[]; // ids of the others at those meals
}

/** The recipes served to a person, from the meals they were at: how often, when last, and with whom. */
export function recipesServedTo(meals: Meal[], personId: string): ServedRecipe[] {
  const byRecipe = new Map<string, ServedRecipe>();
  for (const meal of mealsOfPerson(meals, personId)) {
    // newest first: the first meal seen for a recipe is the latest one
    for (const id of new Set(meal.recipes.map((r) => r.recipeId))) {
      const others = (meal.attendeeIds || []).filter((p) => p !== personId);
      const known = byRecipe.get(id);
      if (!known) byRecipe.set(id, { recipeId: id, count: 1, last: meal, withNames: others });
      else {
        known.count += 1;
        known.withNames = [...new Set([...known.withNames, ...others])];
      }
    }
  }
  return [...byRecipe.values()];
}

/**
 * For each of these people: the latest earlier meal where they had this recipe ("did I make this for Anna?").
 * `exceptMealId` is the meal being planned: it is skipped, and so are meals after it.
 */
export function servedBefore(meals: Meal[], recipeId: string, personIds: string[], exceptMealId?: string): { personId: string; meal: Meal }[] {
  const planned = meals.find((m) => m.id === exceptMealId);
  const past = mealsWithRecipe(meals, recipeId).filter((m) => m.id !== exceptMealId && (!planned || mealTime(m) <= mealTime(planned)));
  return personIds.flatMap((personId) => {
    const meal = past.find((m) => (m.attendeeIds || []).includes(personId));
    return meal ? [{ personId, meal }] : [];
  });
}

export const formatMealDate = (m: Meal): string =>
  m.date ? new Date(m.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export const getStoredMeals = (): Meal[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_MEALS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveStoredMeals = (meals: Meal[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_MEALS, JSON.stringify(meals));
  } catch (e) {
    console.error('Error saving meals to localStorage', e);
  }
};

// Pantry staples that never go on the shopping list (English and Dutch).
const IGNORED_INGREDIENTS: RegExp[] = [
  /^((warm|koud|lauw|ijs|cold|hot|lukewarm|ice|boiling|kokend)(e)? )?(water|leidingwater|tap water)$/,
  /^((zwarte|witte|versgemalen|vers gemalen|gemalen|black|white|ground|freshly ground|cracked) )*(peper|pepper)$/,
  /^((zee|grof|fijn|fine|sea|kosher|coarse|flaky) ?)*(zout|salt)$/,
  /^((extra )?(vergine|virgin) )?(olijfolie|olive oil)$/,
  /^(zout|salt) (en|and|&) (peper|pepper)$/,
  /^(peper|pepper) (en|and|&) (zout|salt)$/,
];

// "Knoflook, fijngehakt" and "Knoflook (3 teentjes)" both become "knoflook".
const normalizeName = (name: string): string =>
  name.toLowerCase().replace(/\(.*?\)/g, '').split(',')[0].replace(/\s+/g, ' ').trim();

export const isIgnoredIngredient = (name: string): boolean => {
  const n = normalizeName(name);
  return IGNORED_INGREDIENTS.some((re) => re.test(n));
};

// Units that appear in singular/plural/abbreviated forms and must merge: [forms..., singular, plural]
const UNIT_GROUPS: string[][] = [
  ['teentje', 'teentjes', 'clove', 'cloves', 'teentje', 'teentjes'],
  ['el', 'eetlepel', 'eetlepels', 'tbsp', 'tablespoon', 'tablespoons', 'el', 'el'],
  ['tl', 'theelepel', 'theelepels', 'tsp', 'teaspoon', 'teaspoons', 'tl', 'tl'],
  ['g', 'gr', 'gram', 'grams', 'g', 'g'],
  ['kg', 'kilo', 'kilogram', 'kg', 'kg'],
  ['ml', 'milliliter', 'milliliters', 'ml', 'ml'],
  ['l', 'liter', 'liters', 'l', 'l'],
  ['stuk', 'stuks', 'stuk(s)', 'piece', 'pieces', 'stuk', 'stuks'],
  ['takje', 'takjes', 'sprig', 'sprigs', 'takje', 'takjes'],
  ['blaadje', 'blaadjes', 'leaf', 'leaves', 'blaadje', 'blaadjes'],
  ['snufje', 'snufjes', 'snuf', 'pinch', 'pinches', 'snufje', 'snufjes'],
  ['bosje', 'bosjes', 'bunch', 'bunches', 'bosje', 'bosjes'],
  ['kopje', 'kopjes', 'cup', 'cups', 'kopje', 'kopjes'],
  ['blik', 'blikje', 'blikjes', 'can', 'cans', 'blik', 'blikken'],
  ['plak', 'plakje', 'plakjes', 'plakken', 'slice', 'slices', 'plak', 'plakken'],
  ['bol', 'bollen', 'bol', 'bollen'],
  ['zakje', 'zakjes', 'zakje', 'zakjes'],
];

const canonicalUnit = (rawUnit: string): { key: string; one: string; many: string } => {
  const unit = rawUnit.trim().toLowerCase().replace(/\.$/, '');
  for (const group of UNIT_GROUPS) {
    const forms = group.slice(0, -2);
    if (forms.includes(unit) || unit === group[group.length - 2] || unit === group[group.length - 1]) {
      return { key: group[0], one: group[group.length - 2], many: group[group.length - 1] };
    }
  }
  return { key: unit, one: rawUnit.trim(), many: rawUnit.trim() };
};

// Sum the ingredients of all given meals, scaled to each recipe's servings in the meal.
// Duplicates (same ingredient, same unit incl. singular/plural) merge into one total;
// pantry staples (water, salt, pepper, olive oil) are left out.
export const combineIngredients = (meals: Meal[], recipes: Recipe[]): CombinedIngredient[] => {
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const combined = new Map<string, CombinedIngredient & { one: string; many: string }>();

  for (const meal of meals) {
    for (const entry of meal.recipes) {
      const recipe = byId.get(entry.recipeId);
      if (!recipe) continue;
      const ratio = recipe.servings > 0 ? entry.servings / recipe.servings : 1;
      for (const section of recipe.ingredientSections) {
        for (const item of section.items) {
          if (isIgnoredIngredient(item.name)) continue;
          const unit = canonicalUnit(item.unit || '');
          const key = `${normalizeName(item.name)}|${unit.key}`;
          const existing = combined.get(key);
          const amount = item.amount * ratio;
          if (existing) {
            existing.amount += amount;
            if (!existing.recipes.includes(recipe.title)) existing.recipes.push(recipe.title);
          } else {
            combined.set(key, {
              key,
              name: item.name.split(',')[0].trim(),
              unit: unit.one,
              one: unit.one,
              many: unit.many,
              amount,
              recipes: [recipe.title],
            });
          }
        }
      }
    }
  }

  return [...combined.values()]
    .map(({ one, many, ...ing }) => ({ ...ing, unit: Math.abs(ing.amount - 1) < 0.005 ? one : many }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const toShoppingItems = (ingredients: CombinedIngredient[]): ShoppingItem[] =>
  ingredients.map((ing) => ({
    id: `shop-${Math.random().toString(36).slice(2, 9)}`,
    name: ing.name,
    amount: Math.round(ing.amount * 100) / 100,
    unit: ing.unit,
    recipeTitle: 'Meals',
    checked: false,
    category: 'Meals',
  }));
