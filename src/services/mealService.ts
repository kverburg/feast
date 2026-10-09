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
}

export interface CombinedIngredient {
  key: string;
  name: string;
  unit: string;
  amount: number;
  recipes: string[];
}

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

// Sum the ingredients of all given meals, scaled to each recipe's servings in the meal.
export const combineIngredients = (meals: Meal[], recipes: Recipe[]): CombinedIngredient[] => {
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const combined = new Map<string, CombinedIngredient>();

  for (const meal of meals) {
    for (const entry of meal.recipes) {
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
  }

  return [...combined.values()].sort((a, b) => a.name.localeCompare(b.name));
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
