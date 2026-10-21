// Reading a recipe out of page text or a photo with the AI. Shared by the app and the worker (photo imports run
// on the server, so they keep going when the app is closed).
import type { Recipe, IngredientSection, InstructionStep } from '../types/recipe';

const RECIPE_CATEGORIES = ['Main', 'Appetizer', 'Dessert', 'Baking', 'Breakfast', 'Beverage', 'Side', 'Sauce'];

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export const IMPORT_PROMPT = `Extract the recipe from the content below and respond ONLY with a JSON object of this shape:
{
  "title": "Recipe Title",
  "description": "One or two sentences about the dish",
  "category": "Main" | "Appetizer" | "Dessert" | "Baking" | "Breakfast" | "Beverage" | "Side" | "Sauce",
  "servings": 4,
  "prepTime": 15,
  "cookTime": 25,
  "ingredientSections": [
    { "title": "For the Pasta", "items": [ { "amount": 400, "unit": "g", "name": "Tagliatelle", "notes": "al dente" } ] }
  ],
  "instructions": [
    { "text": "Step description", "timerMinutes": 10 }
  ]
}
Rules:
- Keep the original language of the recipe. Do not translate and do not convert units.
- Ignore menus, ads, comments, related recipes and anything that is not part of this one recipe.
- "amount" is a number (use decimals for fractions); "unit" is empty when there is none. Use 0 when the recipe gives no quantity: "salt and pepper to taste", "naar smaak", "extra for serving". Do not put an amount in the ingredient name.
- Use one section called "Ingredients" when the recipe does not split its ingredients into parts.
- "timerMinutes" only when a step clearly names a duration; otherwise leave it out.`;

export const PHOTO_PROMPT = `
About the photo:
- It shows a page of a printed cookbook, possibly at an angle or with a handwritten note on it. Cookbook pages often have two columns: ingredients on the left and numbered steps on the right. Read each column on its own and keep the order.
- The title is the largest heading. Ignore page numbers, section names in the margin, icons and symbols, and handwriting that is not part of the recipe.
- A line like "VOOR 8 PERSONEN • 30 MINUTEN" or "Serves 8 • 30 minutes" gives "servings" and the total time: split it into "prepTime" and "cookTime" so they add up to the stated total.
- Put a tip or serving note from a box on the page at the end of "description", starting with "Tip:".
- Give "timerMinutes" for every step that names a duration; when a step names several, use the longest one.
- Copy the text exactly as printed, including accents; do not guess words you cannot read: leave the line out instead.`;

/** The request for one import: page text, or a photo (base64, no data: prefix). */
export function buildImportRequest(content: { text: string } | { imageBase64: string; mimeType?: string }): unknown {
  const parts =
    'imageBase64' in content
      ? [
          { text: IMPORT_PROMPT + PHOTO_PROMPT },
          { inlineData: { mimeType: content.mimeType || 'image/jpeg', data: content.imageBase64 } },
        ]
      : [{ text: `${IMPORT_PROMPT}\n\nRecipe Source Content:\n${content.text}` }];
  return { contents: [{ parts }], generationConfig: { responseMimeType: 'application/json', temperature: 0.1 } };
}

// Seasonings are mostly "to taste": a bare "1" in front of them is a default, not a quantity.
const SEASONING_WORDS = new Set([
  'zout', 'peper', 'zwarte', 'witte', 'vers', 'verse', 'gemalen', 'versgemalen', 'grof', 'grove', 'fijn', 'fijne', 'zeezout', 'en', 'of',
  'salt', 'pepper', 'black', 'white', 'fresh', 'freshly', 'ground', 'coarse', 'fine', 'sea', 'and', 'or', '&',
]);
const bare = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z& ]+/g, ' ').split(' ').filter(Boolean);

export const isSeasoningName = (name: string): boolean => {
  const words = bare(name);
  return words.length > 0 && words.some((w) => ['zout', 'peper', 'zeezout', 'salt', 'pepper'].includes(w)) && words.every((w) => SEASONING_WORDS.has(w));
};

/** Salt and pepper (alone or together) with a default amount of 1 and no unit get no quantity (0). */
export function dropDefaultSeasoningAmounts(sections: IngredientSection[]): IngredientSection[] {
  return sections.map((sec) => ({
    ...sec,
    items: sec.items.map((item) => (item.amount === 1 && !item.unit && isSeasoningName(item.name) ? { ...item, amount: 0 } : item)),
  }));
}

// Models are unreliable with ids, types and counts; rebuild a clean recipe from their answer.
export function normalizeParsedRecipe(raw: any): Partial<Recipe> {
  const toNumber = (v: unknown, fallback: number) => {
    const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : fallback;
  };
  const sections: IngredientSection[] = (Array.isArray(raw.ingredientSections) ? raw.ingredientSections : [])
    .map((sec: any) => ({
      id: uid('sec'),
      title: String(sec?.title || 'Ingredients'),
      items: (Array.isArray(sec?.items) ? sec.items : [])
        .filter((it: any) => it && String(it.name || '').trim())
        .map((it: any) => ({
          id: uid('ing'),
          amount: toNumber(it.amount, 1),
          unit: String(it.unit || ''),
          name: String(it.name).trim(),
          notes: it.notes ? String(it.notes) : undefined,
        })),
    }))
    .filter((sec: IngredientSection) => sec.items.length > 0);
  const steps: InstructionStep[] = (Array.isArray(raw.instructions) ? raw.instructions : [])
    .filter((st: any) => st && String(st.text || '').trim())
    .map((st: any, i: number) => ({
      id: uid('st'),
      stepNumber: i + 1,
      text: String(st.text).trim(),
      timerMinutes: st.timerMinutes ? toNumber(st.timerMinutes, 0) || undefined : undefined,
    }));

  return {
    title: String(raw.title || '').trim() || 'Imported Recipe',
    description: String(raw.description || '').trim(),
    category: RECIPE_CATEGORIES.includes(raw.category) ? raw.category : 'Main',
    servings: Math.max(1, Math.round(toNumber(raw.servings, 4))),
    prepTime: Math.max(0, Math.round(toNumber(raw.prepTime, 15))),
    cookTime: Math.max(0, Math.round(toNumber(raw.cookTime, 20))),
    ingredientSections: dropDefaultSeasoningAmounts(sections),
    instructions: steps,
  };
}

/** The recipe in a model response (a direct call, in the Gemini response shape). Throws when there is none. */
export function parseImportResponse(data: any): Partial<Recipe> {
  const responseText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('The AI returned no recipe data.');
  const parsed = normalizeParsedRecipe(JSON.parse(jsonMatch[0]));
  if ((parsed.ingredientSections?.length ?? 0) === 0 && (parsed.instructions?.length ?? 0) === 0) {
    throw new Error('The AI did not find a recipe in this content.');
  }
  return parsed;
}
