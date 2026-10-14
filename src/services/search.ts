import { Recipe } from '../types/recipe';

// Lowercase and strip accents, so "mais" finds "Maïssoep" and "creme" finds "crème".
export const normalizeText = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

// Every word of the query must appear somewhere in the recipe (Dutch or English text).
export function recipeMatchesQuery(recipe: Recipe, query: string): boolean {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;

  const sections = [...(recipe.ingredientSections || []), ...(recipe.ingredientSectionsEn || [])];
  const haystack = normalizeText(
    [
      recipe.title,
      recipe.titleEn,
      recipe.description,
      recipe.descriptionEn,
      recipe.category,
      ...(recipe.tags || []),
      ...sections.flatMap((sec) => [sec.title, ...sec.items.map((item) => item.name)]),
    ]
      .filter(Boolean)
      .join(' \n ')
  );
  return words.every((word) => haystack.includes(word));
}
