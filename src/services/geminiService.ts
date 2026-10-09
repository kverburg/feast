import { Recipe } from '../types/recipe';
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
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
      headers: { 'Content-Type': 'application/json' },
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

    return parseRawTextToRecipe(promptTextOrBase64Image);
  } catch (error) {
    console.error('Gemini API parse failed, falling back to client parser', error);
    return parseRawTextToRecipe(promptTextOrBase64Image);
  }
}
