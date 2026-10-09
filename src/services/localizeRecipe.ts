import { Recipe } from '../types/recipe';

export type Language = 'nl' | 'en';

// Display-only view of a recipe in the chosen language. Never save the result:
// editing and storing must always work on the original recipe.
export const localizeRecipe = (recipe: Recipe, language: Language): Recipe =>
  language === 'en'
    ? {
        ...recipe,
        title: recipe.titleEn || recipe.title,
        description: recipe.descriptionEn || recipe.description,
        ingredientSections: recipe.ingredientSectionsEn || recipe.ingredientSections,
        instructions: recipe.instructionsEn || recipe.instructions,
      }
    : recipe;
