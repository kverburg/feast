import { Recipe, ShoppingItem } from '../types/recipe';

const STORAGE_KEY_MEALPLAN = 'gourmet_craft_mealplan_v1';

export interface MealPlanEntry {
  id: string;
  date: string; // YYYY-MM-DD (local)
  recipeId: string;
  servings: number;
}

export interface CombinedIngredient {
  key: string;
  name: string;
  unit: string;
  amount: number;
  recipes: string[];
}

export const toDateKey = (d: Date): string => {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

export const getStoredMealPlan = (): MealPlanEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_MEALPLAN);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveStoredMealPlan = (entries: MealPlanEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_MEALPLAN, JSON.stringify(entries));
  } catch (e) {
    console.error('Error saving meal plan to localStorage', e);
  }
};

// Sum the ingredients of all given meals, scaled to each meal's servings.
export const combineIngredients = (entries: MealPlanEntry[], recipes: Recipe[]): CombinedIngredient[] => {
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const combined = new Map<string, CombinedIngredient>();

  for (const entry of entries) {
    const recipe = byId.get(entry.recipeId);
    if (!recipe) continue;
    const ratio = recipe.servings > 0 ? entry.servings / recipe.servings : 1;
    for (const section of recipe.ingredientSections) {
      for (const item of section.items) {
        const unit = (item.unit || '').trim();
        const key = `${item.name.trim().toLowerCase()}|${unit.toLowerCase()}`;
        const existing = combined.get(key);
        const amount = item.amount * ratio;
        if (existing) {
          existing.amount += amount;
          if (!existing.recipes.includes(recipe.title)) existing.recipes.push(recipe.title);
        } else {
          combined.set(key, { key, name: item.name.trim(), unit, amount, recipes: [recipe.title] });
        }
      }
    }
  }

  return [...combined.values()].sort((a, b) => a.name.localeCompare(b.name));
};

export const toShoppingItems = (ingredients: CombinedIngredient[]): ShoppingItem[] =>
  ingredients.map((ing) => ({
    id: `shop-${Math.random().toString(36).slice(2, 9)}`,
    name: ing.name,
    amount: Math.round(ing.amount * 100) / 100,
    unit: ing.unit,
    recipeTitle: 'Meal plan',
    checked: false,
    category: 'Meal plan',
  }));
