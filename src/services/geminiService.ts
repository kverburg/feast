import { Recipe, IngredientSection, InstructionStep } from '../types/recipe';

import { getStoredApiKey } from './storageService';

export class GeminiHttpError extends Error {
  constructor(public status: number) {
    super(`Gemini API returned status ${status}`);
  }
}

// transient: worth retrying later (rate limit, server hiccup, offline); fatal: retrying will not help
// until something changes (bad key, bad request); unavailable: no key anywhere; other: bad model output.
export type GeminiErrorKind = 'transient' | 'fatal' | 'unavailable' | 'other';

export const classifyGeminiError = (e: unknown): GeminiErrorKind => {
  if (e instanceof GeminiUnavailableError) return 'unavailable';
  if (e instanceof GeminiHttpError) return e.status === 429 || e.status >= 500 ? 'transient' : 'fatal';
  if (e instanceof TypeError) return 'transient'; // fetch failed: offline or blocked
  return 'other';
};

// Thrown when there is no key to use: none saved in Settings and none configured on the server.
export class GeminiUnavailableError extends Error {}

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-flash-latest';

// A key saved in Settings is used directly; otherwise requests go through the worker's
// /api/gemini proxy, which holds the shared key as a Cloudflare secret.
async function geminiGenerate(body: unknown): Promise<any> {
  const key = getStoredApiKey();
  let res: Response;
  if (key) {
    res = await fetch(`${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    });
  } else {
    try {
      res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      throw new GeminiUnavailableError('No Gemini key available.');
    }
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const notConfigured = res.status === 503 && (await res.clone().json().catch(() => null))?.error === 'not_configured';
    // 403/non-JSON: no worker behind this page (local dev) or not logged in through Access.
    if (!isJson || res.status === 403 || notConfigured) throw new GeminiUnavailableError('No Gemini key available.');
  }
  if (!res.ok) throw new GeminiHttpError(res.status);
  return res.json();
}

// Is the shared server key configured? (false in local dev, where there is no worker)
async function serverKeyConfigured(): Promise<boolean> {
  try {
    const res = await fetch('/api/gemini/status', { cache: 'no-store' });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return false;
    return !!(await res.json()).configured;
  } catch {
    return false;
  }
}

export async function getGeminiStatus(): Promise<{ custom: boolean; server: boolean }> {
  return { custom: !!getStoredApiKey(), server: await serverKeyConfigured() };
}

export async function isGeminiAvailable(): Promise<boolean> {
  const status = await getGeminiStatus();
  return status.custom || status.server;
}

// Cheap check that a key is accepted by Google: listing models uses no quota.
// With a typed key it checks that key; without one it checks the shared server key.
export async function verifyGeminiKey(apiKey?: string): Promise<{ ok: boolean; message: string }> {
  try {
    if (!apiKey) {
      const res = await fetch('/api/gemini/verify', { cache: 'no-store' });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (!isJson || res.status === 403) return { ok: false, message: 'No shared key available here. Enter a key first.' };
      const body = await res.json();
      if (body.error === 'not_configured') return { ok: false, message: 'No shared key is configured on the server. Enter a key first.' };
      return { ok: !!body.ok, message: body.message || 'Unknown result.' };
    }
    const res = await fetch(`${GEMINI_BASE}/models?pageSize=1`, { headers: { 'x-goog-api-key': apiKey } });
    if (res.ok) return { ok: true, message: 'Key works.' };
    const body = await res.json().catch(() => null);
    return { ok: false, message: body?.error?.message || `Google rejected the key (HTTP ${res.status}).` };
  } catch {
    return { ok: false, message: 'Could not reach the server or Google. Check your connection.' };
  }
}

const RECIPE_CATEGORIES = ['Main', 'Appetizer', 'Dessert', 'Baking', 'Breakfast', 'Beverage', 'Side', 'Sauce'];

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

// Models are unreliable with ids, types and counts; rebuild a clean recipe from their answer.
function normalizeParsedRecipe(raw: any): Partial<Recipe> {
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
    ingredientSections: sections,
    instructions: steps,
  };
}

/**
 * Read a recipe out of page text or a photo with Gemini. Throws on any failure
 * (no key, rate limit, unreadable answer) so the caller can show or log the reason.
 */
export async function parseRecipeWithGemini(
  promptTextOrBase64Image: string,
  isImage: boolean = false
): Promise<Partial<Recipe>> {
  const promptInstructions = `Extract the recipe from the content below and respond ONLY with a JSON object of this shape:
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
- "amount" is a number (use decimals for fractions, 1 when unspecified); "unit" is empty when there is none.
- Use one section called "Ingredients" when the recipe does not split its ingredients into parts.
- "timerMinutes" only when a step clearly names a duration; otherwise leave it out.`;

  const contents = isImage
    ? [
        {
          parts: [
            { text: promptInstructions },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: promptTextOrBase64Image.replace(/^data:image\/\w+;base64,/, ''),
              },
            },
          ],
        },
      ]
    : [{ parts: [{ text: `${promptInstructions}\n\nRecipe Source Content:\n${promptTextOrBase64Image}` }] }];

  const data = await geminiGenerate({ contents, generationConfig: { responseMimeType: 'application/json', temperature: 0.1 } });
  const responseText: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini returned no recipe data.');
  const parsed = normalizeParsedRecipe(JSON.parse(jsonMatch[0]));
  if ((parsed.ingredientSections?.length ?? 0) === 0 && (parsed.instructions?.length ?? 0) === 0) {
    throw new Error('Gemini did not find a recipe in this content.');
  }
  return parsed;
}

export interface GeminiTranslation {
  // 'nl' when the source recipe was Dutch (translated to English); 'other' otherwise (translated to Dutch)
  sourceLanguage: 'nl' | 'other';
  title: string;
  description: string;
  ingredientSections: IngredientSection[];
  instructions: InstructionStep[];
}

// Translate a whole recipe in one call: Dutch recipes go to English, everything else goes to Dutch.
// Structure, amounts and timers come from the original; only wording (and unit labels such as
// cloves <-> teentjes) is taken from the model.
export async function translateRecipeWithGemini(
  recipe: Partial<Recipe>
): Promise<GeminiTranslation> {
  const source = {
    title: recipe.title || '',
    description: recipe.description || '',
    ingredientSections: (recipe.ingredientSections || []).map((s) => ({
      title: s.title,
      items: s.items.map((i) => ({ amount: i.amount, unit: i.unit, name: i.name, notes: i.notes ?? null })),
    })),
    instructions: (recipe.instructions || []).map((st) => ({ text: st.text })),
  };

  const prompt = `Below is a recipe. First decide whether it is written in Dutch.
- If it is Dutch, translate it into natural English, the way a good English cookbook would write it.
- Otherwise (English or any other language), translate it into natural Dutch, the way a good Dutch cookbook would write it.
Rules:
- Natural, fluent text for home cooks. Use the usual cooking terms of the target language; do not translate word by word.
- Ingredient names: normal names of the target language, lowercase unless a proper noun (e.g. "Parmigiano-Reggiano"). Keep brand names.
- Units: use the target language's usual abbreviations or words (Dutch: g, kg, ml, l, el, tl, teentje/teentjes, snufje, stuk/stuks, bosje; English: g, kg, ml, l, tbsp, tsp, clove/cloves, pinch, piece/pieces, bunch). Do not convert amounts or switch unit systems.
- Keep every number, the number of sections, items and steps, and their order exactly as given. Do not add or remove anything.
- Respond ONLY with JSON of exactly the same shape as the input ("notes" stays null when it is null), plus one extra field "sourceLanguage": "nl" if the source recipe was Dutch, otherwise "other".

Recipe JSON:
${JSON.stringify(source)}`;

  const data = await geminiGenerate({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
  });
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const out = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ''));

  const sections = recipe.ingredientSections || [];
  const steps = recipe.instructions || [];
  const valid =
    typeof out.title === 'string' &&
    (out.sourceLanguage === 'nl' || out.sourceLanguage === 'other') &&
    Array.isArray(out.ingredientSections) &&
    out.ingredientSections.length === sections.length &&
    out.ingredientSections.every((s: any, i: number) => Array.isArray(s.items) && s.items.length === sections[i].items.length) &&
    Array.isArray(out.instructions) &&
    out.instructions.length === steps.length;
  if (!valid) throw new Error('Gemini returned a translation with a different structure.');

  return {
    sourceLanguage: out.sourceLanguage,
    title: out.title || recipe.title || '',
    description: typeof out.description === 'string' ? out.description : recipe.description || '',
    ingredientSections: sections.map((section, si) => ({
      ...section,
      title: out.ingredientSections[si].title || section.title,
      items: section.items.map((item, ii) => {
        const t = out.ingredientSections[si].items[ii];
        return {
          ...item,
          name: t.name || item.name,
          unit: typeof t.unit === 'string' ? t.unit : item.unit,
          notes: item.notes ? t.notes || item.notes : item.notes,
        };
      }),
    })),
    instructions: steps.map((step, i) => ({ ...step, text: out.instructions[i].text || step.text })),
  };
}
