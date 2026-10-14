// Gemini tasks that run in the app and in the worker. They know nothing about where the request goes:
// the caller passes `generate`, which sends a request body to Gemini and returns the parsed response
// (the app goes through its proxy or straight to Google, the worker straight to Google).
import { Recipe, IngredientSection, InstructionStep, StepRef } from '../types/recipe';

export type GeminiTier = 'default' | 'light';
export type Generate = (body: unknown, tier?: GeminiTier) => Promise<any>;

/** One prompt in, one parsed JSON object out. */
export async function generateJson(generate: Generate, prompt: string, tier: GeminiTier = 'default', temperature = 0.1): Promise<any> {
  const data = await generate(
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature },
    },
    tier
  );
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ''));
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
export async function translateRecipe(
  recipe: Partial<Recipe>,
  generate: Generate
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

  const out = await generateJson(generate, prompt, 'default', 0.2);

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

// ---------------------------------------------------------------------------
// Annotation: plural names and step quantities (see the description in annotationService)
// ---------------------------------------------------------------------------
export const ANNOTATION_VERSION = 1;

interface ItemForms {
  singular: string;
  plural: string;
}

export interface AnnotationResult {
  forms: Record<string, ItemForms>; // ingredient id -> forms
  refs: StepRef[][]; // per step, in order
}

export async function annotateVersion(
  sections: IngredientSection[],
  steps: InstructionStep[],
  language: 'nl' | 'en',
  generate: Generate,
  tier: GeminiTier = 'light' // annotation is simple enough for the lighter model
): Promise<AnnotationResult> {
  const items = sections.flatMap((s) => s.items);
  const itemIds = new Set(items.map((i) => i.id));

  const prompt = `This is a recipe in ${language === 'nl' ? 'Dutch' : 'English'}. Annotate it and respond ONLY with JSON:
{
  "ingredients": [ { "id": "<ingredient id>", "singular": "...", "plural": "..." } ],
  "steps": [ { "refs": [ { "id": "<ingredient id>", "mention": "<exact words from the step>", "fraction": 1 } ] } ]
}
Rules for "ingredients" (one entry per ingredient, same ids):
- "singular" and "plural" are the name of the ingredient as it reads after "1" and after "2", in the recipe's language, lowercase, keeping adjectives ("grote ui" / "grote uien", "red onion" / "red onions").
- For ingredients that have no plural (milk, flour, water, melk, bloem) give the same text for both.
- Do not translate or change the wording otherwise.
Rules for "steps" (one entry per step, same order and count):
- "refs" lists the ingredients from the list that this step uses or adds. "mention" must be copied EXACTLY (same letters, case and accents) from that step's text and should be the shortest words that name the ingredient, for example "de uien" or "olive oil".
- "fraction" is the share of the ingredient's total amount used in this step: 1 for all of it, 0.5 for half. If an ingredient is spread over several steps, the fractions add up to about 1.
- Only include an ingredient when the step really names it. Never invent ingredients, never repeat the same ingredient twice in one step. Use an empty "refs" list when a step names none.

Ingredients:
${items.map((i) => `${i.id} | ${i.amount} ${i.unit} ${i.name}`.trim()).join('\n')}

Steps:
${steps.map((st, n) => `${n + 1}. ${st.text}`).join('\n')}`;

  const out = await generateJson(generate, prompt, tier);
  if (!out || !Array.isArray(out.ingredients) || !Array.isArray(out.steps) || out.steps.length !== steps.length) {
    throw new Error('Gemini returned an annotation with a different structure.');
  }

  const forms: Record<string, ItemForms> = {};
  for (const entry of out.ingredients) {
    if (!entry || !itemIds.has(entry.id)) continue;
    const singular = String(entry.singular || '').trim();
    const plural = String(entry.plural || '').trim();
    if (singular && plural) forms[entry.id] = { singular, plural };
  }

  const refs: StepRef[][] = steps.map((step, n) => {
    const raw = Array.isArray(out.steps[n]?.refs) ? out.steps[n].refs : [];
    const seen = new Set<string>();
    const valid: StepRef[] = [];
    for (const r of raw) {
      if (!r || !itemIds.has(r.id) || seen.has(r.id)) continue;
      const mention = String(r.mention || '');
      if (!mention || !step.text.includes(mention)) continue; // not verbatim: drop it
      const fraction = typeof r.fraction === 'number' && r.fraction > 0 && r.fraction <= 1 ? r.fraction : 1;
      seen.add(r.id);
      valid.push({ ingredientId: r.id, mention, fraction });
    }
    return valid;
  });

  return { forms, refs };
}

/** The sections and steps with the annotation written into them. */
export function applyAnnotation(
  sections: IngredientSection[],
  steps: InstructionStep[],
  annotation: AnnotationResult
): { sections: IngredientSection[]; steps: InstructionStep[] } {
  return {
    sections: sections.map((sec) => ({
      ...sec,
      items: sec.items.map((item) => {
        const f = annotation.forms[item.id];
        return f ? { ...item, nameSingular: f.singular, namePlural: f.plural } : item;
      }),
    })),
    steps: steps.map((step, n) => ({ ...step, refs: annotation.refs[n] && annotation.refs[n].length ? annotation.refs[n] : undefined })),
  };
}
