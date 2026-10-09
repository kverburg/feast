import { Recipe, IngredientSection, InstructionStep } from '../types/recipe';
import { parseRawTextToRecipe } from './recipeParserService';

// Cheap check that a key is accepted by Google: listing models uses no quota.
export async function verifyGeminiKey(apiKey: string): Promise<{ ok: boolean; message: string }> {
  if (!apiKey) return { ok: false, message: 'Enter a key first.' };
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1', {
      headers: { 'x-goog-api-key': apiKey },
    });
    if (res.ok) return { ok: true, message: 'Key works.' };
    const body = await res.json().catch(() => null);
    return { ok: false, message: body?.error?.message || `Google rejected the key (HTTP ${res.status}).` };
  } catch {
    return { ok: false, message: 'Could not reach Google. Check your connection.' };
  }
}

export async function parseRecipeWithGemini(
  promptTextOrBase64Image: string,
  apiKey?: string,
  isImage: boolean = false
): Promise<Partial<Recipe>> {
  if (!apiKey) {
    // If no custom API key provided, fall back to local intelligent OCR parser service
    return parseRawTextToRecipe(promptTextOrBase64Image);
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;

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

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents })
    });

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const data = await res.json();
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
  recipe: Partial<Recipe>,
  apiKey: string
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

  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API returned status ${res.status}`);

  const data = await res.json();
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
