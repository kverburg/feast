import { IngredientSection, InstructionStep } from '../types/recipe';
import { geminiGenerate, GeminiTier } from './geminiService';
import { annotateVersion, applyAnnotation, ANNOTATION_VERSION, AnnotationResult } from '../shared/geminiTasks';

// One Gemini call per language version of a recipe. It adds
//  - the singular and plural form of every ingredient name ("ui" / "uien"), so the list follows the portions
//  - for every step, where each ingredient is used and what share of its amount, so steps can show quantities
// Structure and wording of the recipe are never changed; the answer is checked against the recipe.
// The task itself lives in shared/geminiTasks, so the worker can run it too.

export { ANNOTATION_VERSION, applyAnnotation };
export type VersionAnnotation = AnnotationResult;

export function annotateRecipeVersion(
  sections: IngredientSection[],
  steps: InstructionStep[],
  language: 'nl' | 'en',
  tier: GeminiTier = 'light'
): Promise<AnnotationResult> {
  return annotateVersion(sections, steps, language, geminiGenerate, tier);
}
