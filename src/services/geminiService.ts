import { Recipe, IngredientSection, InstructionStep } from '../types/recipe';
import { parseRawTextToRecipe } from './recipeParserService';

import { getStoredApiKey } from './storageService';

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
  if (!res.ok) throw new Error(`Gemini API returned status ${res.status}`);
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

export async function parseRecipeWithGemini(
  promptTextOrBase64Image: string,
  isImage: boolean = false
): Promise<Partial<Recipe>> {
  try {
    const promptInstructions = `
Analyze this recipe content and respond ONLY with a JSON object matching this schema:
{
  "title": "Recipe Title",
  "description": "Short description",
  "category": "Main" | "Appetizer" | "Dessert" | "Baking" | "Breakfast" | "Beverage" | "Side" | "Sauce",
  "servings": 4,
  "prepTime": 15,
  "cookTime": 25,
  "ingredientSections": [
    {
      "id": "sec-1",
      "title": "For the Pasta",
      "items": [
        { "id": "ing-1", "amount": 400, "unit": "g", "name": "Tagliatelle", "notes": "al dente" }
      ]
    }
  ],
  "instructions": [
    { "id": "st-1", "stepNumber": 1, "text": "Step description", "timerMinutes": 10 }
  ]
}
    `;

    const contents = isImage ? [
      {
        parts: [
          { text: promptInstructions },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: promptTextOrBase64Image.replace(/^data:image\/\w+;base64,/, '')
            }
          }
        ]
      }
    ] : [
      {
        parts: [
          { text: `${promptInstructions}\n\nRecipe Source Content:\n${promptTextOrBase64Image}` }
        ]
      }
    ];

    const data = await geminiGenerate({ contents });
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }

    throw new Error('Gemini returned no recipe data.');
  } catch (error) {
    // Images can't be parsed as text; let the caller fall back to local OCR.
    if (isImage) throw error;
    console.error('Gemini API parse failed, falling back to client parser', error);
    return parseRawTextToRecipe(promptTextOrBase64Image);
  }
}

export interface GeminiDutchRecipe {
  title: string;
  description: string;
  ingredientSections: IngredientSection[];
  instructions: InstructionStep[];
}

// Translate a whole recipe to natural Dutch in one call. Structure, amounts and timers come from
// the original; only wording (and unit labels such as cloves -> teentjes) is taken from the model.
export async function translateRecipeWithGemini(
  recipe: Partial<Recipe>
): Promise<GeminiDutchRecipe> {
  const source = {
    title: recipe.title || '',
    description: recipe.description || '',
    ingredientSections: (recipe.ingredientSections || []).map((s) => ({
      title: s.title,
      items: s.items.map((i) => ({ amount: i.amount, unit: i.unit, name: i.name, notes: i.notes ?? null })),
    })),
    instructions: (recipe.instructions || []).map((st) => ({ text: st.text })),
  };

  const prompt = `Translate this recipe from English to Dutch, the way a good Dutch cookbook would write it.
Rules:
- Natural, fluent Dutch for home cooks. Use the usual Dutch cooking terms; do not translate word by word.
- Ingredient names: normal Dutch names in lowercase unless a proper noun (e.g. "Parmigiano-Reggiano"). Keep brand names.
- Units: Dutch abbreviations (g, kg, ml, l, el for tablespoon, tl for teaspoon), or "teentje"/"teentjes", "snufje", "stuk"/"stuks", "bosje". Do not convert amounts or switch unit systems.
- Keep every number, the number of sections, items and steps, and their order exactly as given. Do not add or remove anything.
- Respond ONLY with JSON of exactly the same shape as the input ("notes" stays null when it is null).

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
    Array.isArray(out.ingredientSections) &&
    out.ingredientSections.length === sections.length &&
    out.ingredientSections.every((s: any, i: number) => Array.isArray(s.items) && s.items.length === sections[i].items.length) &&
    Array.isArray(out.instructions) &&
    out.instructions.length === steps.length;
  if (!valid) throw new Error('Gemini returned a translation with a different structure.');

  return {
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
