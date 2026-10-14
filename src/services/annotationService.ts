import { IngredientSection, InstructionStep, StepRef } from '../types/recipe';
import { geminiJson, GeminiTier } from './geminiService';

// One Gemini call per language version of a recipe. It adds
//  - the singular and plural form of every ingredient name ("ui" / "uien"), so the list follows the portions
//  - for every step, where each ingredient is used and what share of its amount, so steps can show quantities
// Structure and wording of the recipe are never changed; the answer is checked against the recipe.

export const ANNOTATION_VERSION = 1;

interface ItemForms {
  singular: string;
  plural: string;
}

export interface VersionAnnotation {
  forms: Map<string, ItemForms>; // ingredient id -> forms
  refs: StepRef[][]; // per step, in order
}

export async function annotateRecipeVersion(
  sections: IngredientSection[],
  steps: InstructionStep[],
  language: 'nl' | 'en',
  tier: GeminiTier = 'light' // annotation is simple enough for the lighter model
): Promise<VersionAnnotation> {
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

  const out = await geminiJson(prompt, tier);
  if (!out || !Array.isArray(out.ingredients) || !Array.isArray(out.steps) || out.steps.length !== steps.length) {
    throw new Error('Gemini returned an annotation with a different structure.');
  }

  const forms = new Map<string, ItemForms>();
  for (const entry of out.ingredients) {
    if (!entry || !itemIds.has(entry.id)) continue;
    const singular = String(entry.singular || '').trim();
    const plural = String(entry.plural || '').trim();
    if (singular && plural) forms.set(entry.id, { singular, plural });
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
  annotation: VersionAnnotation
): { sections: IngredientSection[]; steps: InstructionStep[] } {
  return {
    sections: sections.map((sec) => ({
      ...sec,
      items: sec.items.map((item) => {
        const f = annotation.forms.get(item.id);
        return f ? { ...item, nameSingular: f.singular, namePlural: f.plural } : item;
      }),
    })),
    steps: steps.map((step, n) => ({ ...step, refs: annotation.refs[n] && annotation.refs[n].length ? annotation.refs[n] : undefined })),
  };
}
