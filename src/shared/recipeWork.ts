// Which recipes wait for background work (translation, annotation), and how a finished result is
// applied. Shared by the app and the worker, so both agree on what "needs work" and "still the same recipe" mean.
import type { Recipe } from '../types/recipe';
import { ANNOTATION_VERSION, AnnotationResult, GeminiTranslation, applyAnnotation } from './geminiTasks';

export const hashValue = (value: unknown): string => {
  const text = JSON.stringify(value);
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return String(h);
};

/** Fingerprint of what a translation depends on. */
export const contentHash = (r: Recipe): string => hashValue([r.title, r.description, r.ingredientSections, r.instructions]);

/** Fingerprint of what the annotation depends on, in both languages. */
export const annotationSource = (r: Recipe): string =>
  hashValue([r.ingredientSections, r.instructions, r.ingredientSectionsEn, r.instructionsEn]);

/** Mark a freshly imported recipe (any language) as waiting for translation. */
export function withPendingTranslation(recipe: Recipe): Recipe {
  return { ...recipe, translationPending: true, translationSourceHash: contentHash(recipe) };
}

// Still exactly as queued, so translating it loses nothing. Recipes queued by an older version
// carry an English copy in the *En fields instead of a hash.
export const isUntouchedPending = (r: Recipe): boolean => {
  if (!r.translationPending) return false;
  if (r.translationSourceHash) return contentHash(r) === r.translationSourceHash;
  return (
    JSON.stringify([r.title, r.ingredientSections, r.instructions]) ===
    JSON.stringify([r.titleEn, r.ingredientSectionsEn, r.instructionsEn])
  );
};

/** Waiting for plural names and step quantities (only once the translation is done). */
export const needsAnnotation = (r: Recipe): boolean =>
  !r.translationPending &&
  r.annotationVersion !== ANNOTATION_VERSION &&
  r.ingredientSections.some((sec) => sec.items.length > 0) &&
  r.instructions.length > 0;

/**
 * The work list the worker uses, as short strings ("t|<recipe id>|<hash>" for a translation, "a|..." for an
 * annotation). It travels as KV metadata (max 1024 bytes), so only as many as fit; the rest follow once these are done.
 */
export function computeWorkList(recipes: Recipe[], maxBytes = 900): string[] {
  const list: string[] = [];
  let size = 2;
  const add = (entry: string) => {
    if (size + entry.length + 3 > maxBytes) return false;
    list.push(entry);
    size += entry.length + 3;
    return true;
  };
  for (const r of recipes) if (isUntouchedPending(r) && !add(`t|${r.id}|${contentHash(r)}`)) return list;
  for (const r of recipes) if (needsAnnotation(r) && !add(`a|${r.id}|${annotationSource(r)}`)) return list;
  return list;
}

/** The recipe after its translation: main fields Dutch, *En fields English. */
export function applyTranslationResult(current: Recipe, result: GeminiTranslation): Recipe {
  const translated = {
    title: result.title,
    description: result.description,
    ingredientSections: result.ingredientSections,
    instructions: result.instructions,
  };
  const original = {
    title: current.title,
    description: current.description,
    ingredientSections: current.ingredientSections,
    instructions: current.instructions,
  };
  // Dutch source: keep it as is and store the translation as the English version.
  // Anything else: the translation becomes the Dutch main text, the original the English one.
  const [dutch, english] = result.sourceLanguage === 'nl' ? [original, translated] : [translated, original];
  return {
    ...current,
    ...dutch,
    titleEn: english.title,
    descriptionEn: english.description,
    ingredientSectionsEn: english.ingredientSections,
    instructionsEn: english.instructions,
    translationVersion: 2,
    translationPending: false,
    translationSourceHash: undefined,
  };
}

/** The recipe with its plural names and step references written in (both language versions). */
export function applyAnnotationResult(current: Recipe, main: AnnotationResult, en?: AnnotationResult): Recipe {
  const nl = applyAnnotation(current.ingredientSections, current.instructions, main);
  const enApplied =
    en && current.ingredientSectionsEn && current.instructionsEn
      ? applyAnnotation(current.ingredientSectionsEn, current.instructionsEn, en)
      : undefined;
  return {
    ...current,
    ingredientSections: nl.sections,
    instructions: nl.steps,
    ...(enApplied ? { ingredientSectionsEn: enApplied.sections, instructionsEn: enApplied.steps } : {}),
    annotationVersion: ANNOTATION_VERSION,
  };
}
