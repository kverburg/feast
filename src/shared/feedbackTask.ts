// Feedback on a recipe ("too salty", "the oven should be 200 degrees"): the AI proposes an updated recipe, the user
// checks it before anything changes. Shared by the worker (makes the proposal) and the app (shows and applies it).
import type { Recipe, IngredientSection, InstructionStep } from '../types/recipe';
import { hashValue, withPendingTranslation } from './recipeWork';
import { normalizeSections, normalizeSteps } from './importTasks';

/** The parts of a recipe the AI sees and may change (the main language: Dutch for most recipes). */
export interface RecipeBase {
  title: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  ingredientSections: IngredientSection[];
  instructions: InstructionStep[];
}

export const baseOf = (r: Recipe): RecipeBase => ({
  title: r.title,
  description: r.description || '',
  servings: r.servings,
  prepTime: r.prepTime,
  cookTime: r.cookTime,
  ingredientSections: r.ingredientSections,
  instructions: r.instructions,
});

/** Fingerprint of what a proposal was made for: when it differs at approval time, the recipe was edited meanwhile. */
export const baseHash = (r: Recipe | RecipeBase): string =>
  hashValue([r.title, r.description || '', r.servings, r.prepTime, r.cookTime, r.ingredientSections, r.instructions]);

/** What the AI proposes: a short explanation, bullet points, and only the fields that change. */
export interface ProposalContent {
  summary: string;
  changes: string[];
  fields: Partial<RecipeBase>;
}

export function buildFeedbackRequest(base: RecipeBase, feedback: string, comments: string[] = [], previous?: ProposalContent): unknown {
  const source = {
    title: base.title,
    description: base.description,
    servings: base.servings,
    prepTime: base.prepTime,
    cookTime: base.cookTime,
    ingredientSections: base.ingredientSections.map((s) => ({
      title: s.title,
      items: s.items.map((i) => ({ amount: i.amount, unit: i.unit, name: i.name, notes: i.notes ?? null })),
    })),
    instructions: base.instructions.map((st) => ({ text: st.text, timerMinutes: st.timerMinutes ?? null })),
  };

  const prompt = `You help a home cook improve one of their recipes. Below are the recipe and the cook's feedback. Work out what, if anything, should change in the recipe because of the feedback, and respond ONLY with JSON:
{
  "summary": "one or two sentences: what you propose and why",
  "changes": ["short bullet per change, e.g. 'Salt: 1 tl to 1/2 tl'"],
  "title": "only when the title changes",
  "description": "only when the description changes",
  "servings": 4, "prepTime": 15, "cookTime": 25,
  "ingredientSections": [ { "title": "...", "items": [ { "amount": 400, "unit": "g", "name": "...", "notes": null } ] } ],
  "instructions": [ { "text": "...", "timerMinutes": null } ]
}
Rules:
- Include a field ONLY when it changes. When you include "ingredientSections" or "instructions", give the COMPLETE list (all sections, all items, all steps), not just the changed ones. Leave everything the feedback does not touch exactly as it is.
- Write in the language of the recipe. Keep amounts as numbers, units as in the recipe, and use 0 as the amount when there is no quantity ("to taste").
- Change as little as possible and do not invent anything the feedback does not ask for. If a quantity changes, change it everywhere it appears (ingredient list and steps).
- If the feedback needs no change (a compliment, a question, something unclear), return only "summary" (explain why nothing changes, or ask what you need to know) and an empty "changes" list.

Recipe JSON:
${JSON.stringify(source)}

Feedback from the cook:
${feedback}${
    previous
      ? `

Your earlier proposal for this feedback was: ${previous.summary}${previous.changes.length ? ` (${previous.changes.join('; ')})` : ''}
The cook reacted to it. Start again from the original recipe above and take these remarks into account:
${comments.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
      : ''
  }`;

  return { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.2 } };
}

/** The proposal in a model response (Gemini response shape). Throws when it cannot be read. */
export function parseFeedbackResponse(data: any, base: RecipeBase): ProposalContent {
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const match = text.replace(/^```(?:json)?\s*|\s*```$/g, '').match(/\{[\s\S]*\}/);
  if (!match) throw new Error('The AI returned no proposal.');
  const raw = JSON.parse(match[0]);
  const summary = String(raw.summary || '').trim();
  if (!summary) throw new Error('The AI returned a proposal without an explanation.');

  const fields: Partial<RecipeBase> = {};
  if (typeof raw.title === 'string' && raw.title.trim() && raw.title.trim() !== base.title) fields.title = raw.title.trim();
  if (typeof raw.description === 'string' && raw.description.trim() !== (base.description || '')) fields.description = raw.description.trim();
  for (const key of ['servings', 'prepTime', 'cookTime'] as const) {
    const n = typeof raw[key] === 'number' ? raw[key] : parseFloat(String(raw[key] ?? ''));
    if (Number.isFinite(n) && n >= 0 && Math.round(n) !== base[key]) fields[key] = Math.round(n);
  }
  if (Array.isArray(raw.ingredientSections)) {
    const sections = normalizeSections(raw.ingredientSections);
    if (sections.length === 0) throw new Error('The proposal has no ingredients.');
    if (JSON.stringify(sections.map((s) => s.items.map((i) => [i.amount, i.unit, i.name, i.notes || '']))) !== JSON.stringify(base.ingredientSections.map((s) => s.items.map((i) => [i.amount, i.unit, i.name, i.notes || ''])))) {
      fields.ingredientSections = sections;
    }
  }
  if (Array.isArray(raw.instructions)) {
    const steps = normalizeSteps(raw.instructions);
    if (steps.length === 0) throw new Error('The proposal has no steps.');
    if (JSON.stringify(steps.map((s) => [s.text, s.timerMinutes || 0])) !== JSON.stringify(base.instructions.map((s) => [s.text, s.timerMinutes || 0]))) {
      fields.instructions = steps;
    }
  }
  const changes = (Array.isArray(raw.changes) ? raw.changes : []).map((c: unknown) => String(c).trim()).filter(Boolean).slice(0, 12);
  return { summary, changes, fields };
}

export const hasChanges = (p: ProposalContent): boolean => Object.keys(p.fields).length > 0;

/**
 * The recipe with the approved proposal in it. New content: the second language is dropped and a fresh translation and
 * annotation are queued right away (you just approved it, so not in the slow background batch).
 */
export function applyProposal(recipe: Recipe, proposal: ProposalContent): Recipe {
  return withPendingTranslation(
    {
      ...recipe,
      ...proposal.fields,
      titleEn: undefined,
      descriptionEn: undefined,
      ingredientSectionsEn: undefined,
      instructionsEn: undefined,
      translationVersion: undefined,
      annotationVersion: undefined,
    },
    true
  );
}
