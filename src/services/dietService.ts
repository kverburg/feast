import { Recipe } from '../types/recipe';
import { Person } from './peopleService';
import { Meal } from './mealService';

// Checking what people cannot or do not want to eat against the ingredients of a meal.
// It only reads ingredient names (both languages): hidden ingredients (a sauce made with peanuts) are not seen.

const normalize = (text: string): string =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

/** A term matches an ingredient name as a whole word, or inside a compound word when it is long enough
 *  ("noten" in "walnoten", "pinda" in "pindakaas"); short terms ("ui") must be whole words. */
export function termMatches(term: string, ingredientName: string): boolean {
  const t = normalize(term);
  if (!t) return false;
  const name = normalize(ingredientName);
  if (name.split(' ').includes(t)) return true;
  // "noot" and "noten" are different words: list both forms when it matters
  return t.length >= 4 && name.includes(t);
}

export interface Conflict {
  person: Person;
  kind: 'allergy' | 'dislike';
  term: string;
  ingredient: string;
  recipeTitle: string;
  recipeId: string;
}

const ingredientNames = (recipe: Recipe): string[] => {
  const sections = [...(recipe.ingredientSections || []), ...(recipe.ingredientSectionsEn || [])];
  return sections.flatMap((s) => s.items.flatMap((i) => [i.name, i.nameSingular, i.namePlural].filter(Boolean) as string[]));
};

/** Conflicts of one recipe with some people. One entry per person, term and ingredient. */
export function recipeConflicts(recipe: Recipe, people: Person[]): Conflict[] {
  const names = [...new Set(ingredientNames(recipe))];
  const out: Conflict[] = [];
  const seen = new Set<string>();
  for (const person of people) {
    for (const [kind, terms] of [['allergy', person.allergies || []], ['dislike', person.dislikes || []]] as const) {
      for (const term of terms) {
        const hit = names.find((n) => termMatches(term, n));
        if (!hit) continue;
        const key = `${person.id}|${kind}|${normalize(term)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ person, kind, term, ingredient: hit, recipeTitle: recipe.title, recipeId: recipe.id });
      }
    }
  }
  return out;
}

/** Conflicts of a meal: its recipes against the people listed as attending (unknown ids are ignored). */
export function mealConflicts(meal: Meal, recipes: Recipe[], people: Person[]): Conflict[] {
  const attendees = (meal.attendeeIds || []).map((id) => people.find((p) => p.id === id)).filter((p): p is Person => !!p);
  if (attendees.length === 0) return [];
  const byId = new Map(recipes.map((r) => [r.id, r]));
  return meal.recipes.flatMap((entry) => {
    const recipe = byId.get(entry.recipeId);
    return recipe ? recipeConflicts(recipe, attendees) : [];
  });
}

export const conflictKey = (c: Conflict): string => `${c.person.id}|${c.kind}|${normalize(c.term)}|${c.recipeId}`;

/** "Anna is allergic to noten: walnoten in Pastasalade" */
export const describeConflict = (c: Conflict): string =>
  `${c.person.name} ${c.kind === 'allergy' ? 'is allergic to' : 'does not like'} ${c.term}: ${c.ingredient} in ${c.recipeTitle}`;
